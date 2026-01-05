import express, { Router } from "express";
import { sdk } from "./sdk";
import { createCheckoutSession, createPortalSession, STRIPE_PRICING } from "../stripe";
import { ENV } from "./env";

const router: Router = express.Router();

/**
 * GET /api/billing/checkout
 * Create a Stripe checkout session and redirect
 */
router.get("/checkout", async (req, res) => {
  try {
    // Authenticate user
    const user = await sdk.authenticateRequest(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const plan = req.query.plan as "monthly" | "yearly";
    if (!plan || (plan !== "monthly" && plan !== "yearly")) {
      return res.status(400).json({ error: "Invalid plan. Must be 'monthly' or 'yearly'" });
    }

    const priceId = plan === "monthly" 
      ? STRIPE_PRICING.monthly.priceId 
      : STRIPE_PRICING.yearly.priceId;

    if (!priceId) {
      return res.status(500).json({ error: "Stripe price ID not configured" });
    }

    // Create checkout session
    const session = await createCheckoutSession(
      user.id,
      user.email || "",
      priceId,
      `${ENV.baseUrl}/billing?success=true`,
      `${ENV.baseUrl}/billing?canceled=true`,
      user.stripeCustomerId || undefined
    );

    if (!session) {
      return res.status(500).json({ error: "Failed to create checkout session" });
    }

    // Redirect to Stripe checkout
    res.redirect(303, session.url);
  } catch (error) {
    console.error("[Billing] Checkout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/billing/portal
 * Create a Stripe customer portal session and redirect
 */
router.get("/portal", async (req, res) => {
  try {
    // Authenticate user
    const user = await sdk.authenticateRequest(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!user.stripeCustomerId) {
      return res.status(400).json({ error: "No Stripe customer ID found" });
    }

    // Create portal session
    const portalUrl = await createPortalSession(
      user.stripeCustomerId,
      `${ENV.baseUrl}/billing`
    );

    if (!portalUrl) {
      return res.status(500).json({ error: "Failed to create portal session" });
    }

    // Redirect to Stripe portal
    res.redirect(303, portalUrl);
  } catch (error) {
    console.error("[Billing] Portal error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
