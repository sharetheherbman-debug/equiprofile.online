import express, { Router } from "express";
import { sdk } from "./sdk";
import {
  createCheckoutSession,
  createPortalSession,
  STRIPE_PRICING,
  PRICING_PLANS,
} from "../stripe";
import { ENV } from "./env";

const router: Router = express.Router();

/**
 * GET /api/billing/plans
 * Return ALL pricing plans as single source of truth
 * Used by both marketing and dashboard
 */
router.get("/plans", (req, res) => {
  try {
    // Return pricing structure
    const plans = {
      trial: {
        name: PRICING_PLANS.trial.name,
        horses: PRICING_PLANS.trial.horses,
        price: PRICING_PLANS.trial.price,
        currency: PRICING_PLANS.trial.currency,
        interval: PRICING_PLANS.trial.interval,
        duration: PRICING_PLANS.trial.duration,
        features: PRICING_PLANS.trial.features,
      },
      pro: {
        name: PRICING_PLANS.pro.name,
        horses: PRICING_PLANS.pro.horses,
        monthly: {
          amount: PRICING_PLANS.pro.monthly.amount,
          currency: PRICING_PLANS.pro.monthly.currency,
          interval: PRICING_PLANS.pro.monthly.interval,
        },
        yearly: {
          amount: PRICING_PLANS.pro.yearly.amount,
          currency: PRICING_PLANS.pro.yearly.currency,
          interval: PRICING_PLANS.pro.yearly.interval,
        },
        features: PRICING_PLANS.pro.features,
      },
      stable: {
        name: PRICING_PLANS.stable.name,
        horses: PRICING_PLANS.stable.horses,
        monthly: {
          amount: PRICING_PLANS.stable.monthly.amount,
          currency: PRICING_PLANS.stable.monthly.currency,
          interval: PRICING_PLANS.stable.monthly.interval,
        },
        yearly: {
          amount: PRICING_PLANS.stable.yearly.amount,
          currency: PRICING_PLANS.stable.yearly.currency,
          interval: PRICING_PLANS.stable.yearly.interval,
        },
        features: PRICING_PLANS.stable.features,
      },
    };

    res.json(plans);
  } catch (error) {
    console.error("[Billing] Plans error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/billing/checkout
 * Create a Stripe checkout session and redirect
 */
router.get("/checkout", async (req, res) => {
  try {
    // Guard: billing must be enabled
    if (!ENV.enableStripe) {
      return res
        .status(402)
        .json({ error: "Billing is not enabled on this server" });
    }

    // Authenticate user
    const user = await sdk.authenticateRequest(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const plan = req.query.plan as "monthly" | "yearly";
    if (!plan || (plan !== "monthly" && plan !== "yearly")) {
      return res
        .status(400)
        .json({ error: "Invalid plan. Must be 'monthly' or 'yearly'" });
    }

    const priceId =
      plan === "monthly"
        ? STRIPE_PRICING.monthly.priceId
        : STRIPE_PRICING.yearly.priceId;

    if (!priceId) {
      return res
        .status(503)
        .json({ error: "Stripe price ID not configured on this server" });
    }

    // Create checkout session
    const session = await createCheckoutSession(
      user.id,
      user.email || "",
      priceId,
      `${ENV.baseUrl}/billing?success=true`,
      `${ENV.baseUrl}/billing?canceled=true`,
      user.stripeCustomerId || undefined,
    );

    if (!session) {
      return res
        .status(503)
        .json({ error: "Failed to create checkout session" });
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
    // Guard: billing must be enabled
    if (!ENV.enableStripe) {
      return res
        .status(402)
        .json({ error: "Billing is not enabled on this server" });
    }

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
      `${ENV.baseUrl}/billing`,
    );

    if (!portalUrl) {
      return res.status(503).json({ error: "Failed to create portal session" });
    }

    // Redirect to Stripe portal
    res.redirect(303, portalUrl);
  } catch (error) {
    console.error("[Billing] Portal error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
