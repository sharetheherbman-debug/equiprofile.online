// Copyright (c) 2025-2026 Amarktai Network. All rights reserved.
import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import helmet from "helmet";
import cors from "cors";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import authRouter from "./authRouter";
import billingRouter from "./billingRouter";
import salesChatRouter from "./salesChatRouter";
import { appRouter } from "../routers";
import { apiRouter } from "../api";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { nanoid } from "nanoid";
import Stripe from "stripe";
import * as db from "../db";
import { getDb } from "../db";
import { contactSubmissions } from "../../drizzle/schema";
import { getStripe, validatePricingConfig, PRICING_PLANS } from "../stripe";
import * as email from "./email";
import { ENV } from "./env";
import { resolve } from "path";
import path from "path";
import fs from "fs";

// Module-level server reference used by the graceful-shutdown handler below.
// Set inside server.listen() callback once the port is bound.
let _activeServer: import("http").Server | null = null;

// Port checking functions removed - now using deterministic port binding
// If port is in use, server will fail with clear error message instead of auto-switching

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Trust proxy - CRITICAL for correct IP detection behind nginx reverse proxy
  // Must be set BEFORE rate limiter and any middleware that reads req.ip
  app.set("trust proxy", 1);
  console.log("✅ Trust proxy enabled for reverse proxy support");

  // CORS configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://equiprofile.online",
        "https://www.equiprofile.online",
      ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
      maxAge: 86400, // 24 hours
    }),
  );
  console.log("✅ CORS configured with allowed origins:", allowedOrigins);

  // Security headers via Helmet.
  // CSP uses 'unsafe-inline' (no nonces) so that Vite-generated inline
  // scripts are always permitted regardless of whether a service worker or
  // Nginx cache returns a previously-seen HTML response.  Nonce-based CSP
  // caused recurring blank white screens: stale HTML contained an old nonce
  // that no longer matched the server-generated header.  Removing nonces
  // permanently eliminates that failure mode while keeping all other
  // directives enforced.  The same static CSP is also set by Nginx
  // (deployment/nginx/equiprofile.conf) as a belt-and-suspenders measure.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
          ],
          fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          connectSrc: ["'self'"],
          frameAncestors: ["'self'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Request ID middleware for logging
  app.use((req, res, next) => {
    req.headers["x-request-id"] = req.headers["x-request-id"] || nanoid();
    res.setHeader("X-Request-ID", req.headers["x-request-id"] as string);
    next();
  });

  // Request logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(
        `[${req.headers["x-request-id"]}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`,
      );
    });
    next();
  });

  // Rate limiting
  // Trust proxy is already set globally via app.set("trust proxy", 1)
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "500"),
    message: {
      error: "Too many requests",
      message: "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      res.status(options.statusCode).json(options.message);
    },
  });
  app.use("/api", limiter);

  // Health/build endpoints rate limiter (more permissive for monitoring)
  const healthLimiter = rateLimit({
    windowMs: 60000, // 1 minute
    max: 60, // 60 requests per minute (1 per second average)
    message: {
      error: "Too many requests",
      message: "Too many health check requests",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      res.status(options.statusCode).json(options.message);
    },
  });

  // Stripe webhook - must be before body parser
  app.post(
    "/api/webhooks/stripe",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const stripe = getStripe();
      if (!stripe) {
        return res.status(500).json({ error: "Stripe not configured" });
      }

      const sig = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!sig || !webhookSecret) {
        return res.status(400).json({ error: "Missing signature or secret" });
      }

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err: any) {
        console.error(
          `[Stripe Webhook] Signature verification failed:`,
          err.message,
        );
        return res.status(400).json({
          error: `Webhook signature verification failed: ${err.message}`,
        });
      }

      // Check for duplicate events (idempotency)
      const alreadyProcessed = await db.isStripeEventProcessed(event.id);
      if (alreadyProcessed) {
        console.log(`[Stripe Webhook] Event ${event.id} already processed`);
        return res.json({ received: true, cached: true });
      }

      // Store event for idempotency
      await db.createStripeEvent(
        event.id,
        event.type,
        JSON.stringify(event.data.object),
      );

      try {
        // Handle different event types
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = parseInt(session.metadata?.userId || "0");

            if (userId && session.customer && session.subscription) {
              const subscription = await stripe.subscriptions.retrieve(
                session.subscription as string,
              );
              const plan =
                subscription.items.data[0]?.price.recurring?.interval === "year"
                  ? "yearly"
                  : "monthly";

              // Determine plan tier (pro vs stable) by matching price ID
              const priceId = subscription.items.data[0]?.price.id || "";
              const stablePriceIds = [
                PRICING_PLANS.stable.monthly.priceId,
                PRICING_PLANS.stable.yearly.priceId,
              ].filter(Boolean);
              const planTier = stablePriceIds.includes(priceId)
                ? "stable"
                : "pro";

              await db.updateUser(userId, {
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
                subscriptionStatus: "active",
                subscriptionPlan: plan,
                lastPaymentAt: new Date(),
              });

              // Store plan tier in user preferences
              const userForPrefs = await db.getUserById(userId);
              if (userForPrefs) {
                const existingPrefs = userForPrefs.preferences
                  ? JSON.parse(userForPrefs.preferences)
                  : {};
                await db.updateUser(userId, {
                  preferences: JSON.stringify({ ...existingPrefs, planTier }),
                });

                email
                  .sendPaymentSuccessEmail(userForPrefs, plan)
                  .catch((err) =>
                    console.error(
                      "[Stripe Webhook] Failed to send payment email:",
                      err,
                    ),
                  );
              }

              console.log(
                `[Stripe Webhook] User ${userId} subscription activated (tier: ${planTier})`,
              );
            }
            break;
          }

          case "customer.subscription.updated": {
            const subscription = event.data.object as Stripe.Subscription;
            const userId = await getUserIdByStripeSubscription(subscription.id);

            if (userId) {
              let status: "active" | "cancelled" | "overdue" | "expired" =
                "active";
              if (subscription.status === "past_due") status = "overdue";
              if (
                subscription.status === "canceled" ||
                subscription.status === "unpaid"
              )
                status = "cancelled";
              if (subscription.status === "incomplete_expired")
                status = "expired";

              await db.updateUser(userId, {
                subscriptionStatus: status,
                subscriptionEndsAt: subscription.cancel_at
                  ? new Date(subscription.cancel_at * 1000)
                  : null,
              });
              console.log(
                `[Stripe Webhook] User ${userId} subscription updated to ${status}`,
              );
            }
            break;
          }

          case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            const userId = await getUserIdByStripeSubscription(subscription.id);

            if (userId) {
              await db.updateUser(userId, {
                subscriptionStatus: "cancelled",
                subscriptionEndsAt: new Date(),
              });
              console.log(
                `[Stripe Webhook] User ${userId} subscription cancelled`,
              );
            }
            break;
          }

          case "invoice.payment_succeeded": {
            const invoice = event.data.object as any;
            const subscriptionId = invoice.subscription as string | undefined;
            if (subscriptionId) {
              const userId =
                await getUserIdByStripeSubscription(subscriptionId);
              if (userId) {
                await db.updateUser(userId, {
                  subscriptionStatus: "active",
                  lastPaymentAt: new Date(),
                });
                console.log(
                  `[Stripe Webhook] User ${userId} payment succeeded`,
                );
              }
            }
            break;
          }

          case "invoice.payment_failed": {
            const invoice = event.data.object as any;
            const subscriptionId = invoice.subscription as string | undefined;
            if (subscriptionId) {
              const userId =
                await getUserIdByStripeSubscription(subscriptionId);
              if (userId) {
                await db.updateUser(userId, {
                  subscriptionStatus: "overdue",
                });
                console.log(`[Stripe Webhook] User ${userId} payment failed`);
              }
            }
            break;
          }

          default:
            console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        }

        await db.markStripeEventProcessed(event.id);
        res.json({ received: true });
      } catch (error) {
        console.error(
          `[Stripe Webhook] Error processing event ${event.id}:`,
          error,
        );
        await db.markStripeEventProcessed(event.id, (error as Error).message);
        res.status(500).json({ error: "Webhook processing failed" });
      }
    },
  );

  // Helper function to find user by Stripe subscription ID
  async function getUserIdByStripeSubscription(
    subscriptionId: string,
  ): Promise<number | null> {
    const user = await db.getUserByStripeSubscriptionId(subscriptionId);
    return user?.id || null;
  }

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Cache build info at startup to avoid blocking on every request
  let cachedBuildInfo: any = null;
  try {
    const packageJsonPath = resolve(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    // Try to get git commit (only once at startup)
    let commit = "unknown";
    try {
      const { execSync } = require("child_process");
      commit = execSync("git rev-parse HEAD", {
        encoding: "utf-8",
        timeout: 1000,
      })
        .trim()
        .slice(0, 7);
    } catch {
      // Git not available, that's okay
    }

    cachedBuildInfo = {
      version: packageJson.version || "1.0.0",
      buildId: process.env.BUILD_ID || "dev",
      commit,
      buildTime: process.env.BUILD_TIME || new Date().toISOString(),
      nodeVersion: process.version,
    };
  } catch (err) {
    console.warn("⚠️  Could not generate build info:", err);
    cachedBuildInfo = {
      version: "1.0.0",
      buildId: "unknown",
      commit: "unknown",
      buildTime: new Date().toISOString(),
      nodeVersion: process.version,
    };
  }

  // Simple health check endpoint (production-friendly) with rate limiting
  app.get("/healthz", healthLimiter, (req, res) => {
    res.json({
      ok: true,
      timestamp: new Date().toISOString(),
    });
  });

  // Build info endpoint (cached) with rate limiting
  app.get("/build", healthLimiter, (req, res) => {
    res.json(cachedBuildInfo);
  });

  // Health check endpoint (detailed)
  app.get("/api/health", async (req, res) => {
    const dbConnected = !!(await db.getDb());
    const stripeConfigured = !!getStripe();
    const oauthConfigured = !!(ENV.oAuthServerUrl && ENV.appId);
    const version = process.env.npm_package_version || "1.0.0";

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version,
      services: {
        database: dbConnected,
        stripe: stripeConfigured,
        oauth: oauthConfigured,
      },
    });
  });

  /**
   * GET /api/system/config-status
   * Returns which optional services are configured (boolean flags only, no secrets).
   * Used by the frontend and monitoring to show a "setup checklist".
   */
  app.get("/api/system/config-status", (req, res) => {
    const smtpConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
    const stripeReady =
      ENV.enableStripe &&
      !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
    const uploadsReady =
      ENV.enableUploads &&
      !!(process.env.STORAGE_PROXY_URL && process.env.STORAGE_PROXY_KEY);
    const aiOpenAI = !!process.env.OPENAI_API_KEY;
    const aiHuggingFace = !!process.env.HUGGINGFACE_API_KEY;

    res.json({
      db: true, // If we got here the server started successfully
      smtp: smtpConfigured,
      stripe: stripeReady,
      uploads: uploadsReady,
      ai: {
        openai: aiOpenAI,
        huggingface: aiHuggingFace,
        anyConfigured: aiOpenAI || aiHuggingFace,
      },
      weather: true, // Open-Meteo needs no key
      adminPasswordSet: !!process.env.ADMIN_UNLOCK_PASSWORD,
    });
  });

  /**
   * GET /api/admin/status
   * Returns red/yellow/green readiness report for each service.
   * Used by admin UI and audit scripts to show actionable "what's missing" info.
   */
  app.get("/api/admin/status", async (req, res) => {
    const smtpConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
    const stripeConfigured = !!(
      process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET
    );
    const stripePublicKey = !!(
      process.env.VITE_STRIPE_PUBLIC_KEY || process.env.STRIPE_PUBLIC_KEY
    );
    const aiOpenAI = !!process.env.OPENAI_API_KEY;
    const aiHuggingFace = !!process.env.HUGGINGFACE_API_KEY;
    const weatherKey = !!process.env.WEATHER_API_KEY;
    const adminPasswordSet = !!process.env.ADMIN_UNLOCK_PASSWORD;
    const jwtSet = !!process.env.JWT_SECRET;

    let dbOk = false;
    try {
      dbOk = !!(await db.getDb());
    } catch {
      /* ignore */
    }

    let realtimeOk = false;
    try {
      const { realtimeManager } = await import("./realtime");
      realtimeOk = typeof realtimeManager?.getStats === "function";
    } catch {
      /* ignore */
    }

    const toStatus = (ok: boolean, warn = false) =>
      ok ? "green" : warn ? "yellow" : "red";

    res.json({
      overall: dbOk && jwtSet && adminPasswordSet ? "green" : "red",
      services: {
        db: {
          status: toStatus(dbOk),
          ok: dbOk,
          message: dbOk
            ? "Database connected"
            : "DATABASE_URL not set or DB unreachable",
        },
        smtp: {
          status: toStatus(smtpConfigured, true),
          ok: smtpConfigured,
          message: smtpConfigured
            ? "SMTP configured"
            : "Set SMTP_HOST, SMTP_USER, SMTP_PASS to enable email",
        },
        stripe: {
          status: toStatus(stripeConfigured && stripePublicKey, true),
          ok: stripeConfigured && stripePublicKey,
          message:
            stripeConfigured && stripePublicKey
              ? "Stripe configured"
              : "Set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, VITE_STRIPE_PUBLIC_KEY to enable billing",
        },
        ai: {
          status: toStatus(aiOpenAI || aiHuggingFace, true),
          ok: aiOpenAI || aiHuggingFace,
          message:
            aiOpenAI || aiHuggingFace
              ? "AI configured"
              : "Set OPENAI_API_KEY or HUGGINGFACE_API_KEY to enable AI features",
        },
        weather: {
          status: "green",
          ok: true, // Open-Meteo is free and requires no API key
          message: weatherKey
            ? "Weather API key configured (additional provider available)"
            : "Using Open-Meteo (free, no key required) – weather features fully functional",
        },
        storage: {
          status: toStatus(ENV.enableUploads, true),
          ok: ENV.enableUploads,
          message: ENV.enableUploads
            ? "Document uploads enabled"
            : "Set ENABLE_UPLOADS=true and configure storage keys to enable uploads",
        },
        realtime: {
          status: toStatus(realtimeOk),
          ok: realtimeOk,
          message: realtimeOk
            ? "Realtime (SSE) active"
            : "Realtime manager not initialised",
        },
        adminPassword: {
          status: toStatus(adminPasswordSet),
          ok: adminPasswordSet,
          message: adminPasswordSet
            ? "ADMIN_UNLOCK_PASSWORD is set"
            : "Set ADMIN_UNLOCK_PASSWORD env var to secure the admin panel",
        },
      },
      timestamp: new Date().toISOString(),
    });
  });

  // Simple ping endpoint (minimal response for monitoring)
  app.get("/api/health/ping", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Version endpoint with build fingerprint (rate limited like other info endpoints)
  app.get("/api/version", healthLimiter, (req, res) => {
    const path = require("path");

    // Try to read build.txt for build fingerprint
    let buildInfo: any = {
      version: cachedBuildInfo.version,
      sha: cachedBuildInfo.commit,
      buildTime: cachedBuildInfo.buildTime,
    };

    try {
      const buildTxtPath = path.resolve(process.cwd(), "dist/public/build.txt");
      if (fs.existsSync(buildTxtPath)) {
        const buildTxt = fs.readFileSync(buildTxtPath, "utf-8");
        const lines = buildTxt.split("\n");
        lines.forEach((line: string) => {
          const [key, value] = line.split("=");
          if (key && value) {
            if (key === "BUILD_SHA") buildInfo.sha = value.trim();
            if (key === "BUILD_TIME") buildInfo.buildTime = value.trim();
            if (key === "VERSION") buildInfo.version = value.trim();
          }
        });
      }
    } catch (err) {
      // If build.txt doesn't exist, use cached info
    }

    res.json(buildInfo);
  });

  // OAuth status endpoint
  app.get("/api/oauth/status", (req, res) => {
    const configured = !!(ENV.oAuthServerUrl && ENV.appId);
    res.json({
      configured,
      baseUrl: ENV.baseUrl,
      oauthServerUrl: configured ? ENV.oAuthServerUrl : null,
    });
  });

  // Favicon handler - serve favicon.svg as favicon.ico with correct headers (rate limited)
  app.get("/favicon.ico", healthLimiter, (req, res) => {
    const faviconPath =
      process.env.NODE_ENV === "development"
        ? resolve(process.cwd(), "client/public/favicon.svg")
        : resolve(import.meta.dirname, "public/favicon.svg");

    if (fs.existsSync(faviconPath)) {
      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "public, max-age=86400"); // 1 day
      res.sendFile(faviconPath);
    } else {
      res.status(404).send("Favicon not found");
    }
  });

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Contact form endpoint (public) – rate limited to prevent abuse
  const isValidEmail = (e: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) &&
    !e.includes("@@") &&
    e.length <= 320;
  const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 submissions per 15 minutes per IP
    message: {
      error: "Too many requests",
      message: "Too many contact form submissions, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      res.status(options.statusCode).json(options.message);
    },
  });
  app.post("/api/contact", contactLimiter, async (req, res) => {
    try {
      const { name, email: fromEmail, subject, message } = req.body;

      if (!name || !fromEmail || !subject || !message) {
        return res.status(400).json({
          error: "All fields (name, email, subject, message) are required",
        });
      }

      if (typeof name !== "string" || name.length > 200) {
        return res.status(400).json({ error: "Invalid name" });
      }
      if (
        typeof fromEmail !== "string" ||
        fromEmail.length > 320 ||
        !isValidEmail(fromEmail)
      ) {
        return res.status(400).json({ error: "Invalid email address" });
      }
      if (typeof subject !== "string" || subject.length > 500) {
        return res.status(400).json({ error: "Invalid subject" });
      }
      if (typeof message !== "string" || message.length > 10000) {
        return res.status(400).json({ error: "Message too long" });
      }

      await email.sendContactEmail({
        name,
        email: fromEmail,
        subject,
        message,
      });

      // Persist to DB (non-blocking on failure so the response is always fast)
      const dbConn = await getDb();
      if (dbConn) {
        const ipHash = crypto
          .createHash("sha256")
          .update(String(req.ip || ""))
          .digest("hex")
          .slice(0, 64);
        dbConn
          .insert(contactSubmissions)
          .values({ name, email: fromEmail, subject, message, ipHash })
          .catch((err: Error) =>
            console.warn("[Contact] DB insert failed:", err.message),
          );
      }

      res.json({
        success: true,
        message: "Your message has been sent. We'll get back to you soon!",
      });
    } catch (error) {
      console.error("[Contact] Error sending contact email:", error);
      res
        .status(500)
        .json({ error: "Failed to send message. Please try again." });
    }
  });

  // Local auth routes
  app.use("/api/auth", authRouter);

  // Billing routes (Stripe)
  app.use("/api/billing", billingRouter);

  // Sales Chat & Lead Capture (public, rate-limited)
  app.use("/api", salesChatRouter);

  // Test email endpoint (admin only) - tightly rate-limited to prevent email abuse
  const adminEmailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 test emails per hour
    message: {
      error: "Too many requests",
      message: "Too many test email requests, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      res.status(options.statusCode).json(options.message);
    },
  });
  app.post(
    "/api/admin/send-test-email",
    adminEmailLimiter,
    async (req, res) => {
      try {
        const { to } = req.body;
        if (!to) {
          return res.status(400).json({ error: "Email address required" });
        }

        const success = await email.sendTestEmail(to);
        res.json({
          success,
          message: success
            ? "Test email sent"
            : "Failed to send email (check SMTP config)",
        });
      } catch (error) {
        console.error("[Admin] Test email error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  // Real-time SSE endpoint
  const { realtimeManager } = await import("./realtime");
  app.get("/api/realtime/events", async (req, res) => {
    try {
      // Get user from session (reuse tRPC context logic)
      // @ts-expect-error - Express req/res is compatible with CreateExpressContextOptions
      const context = await createContext({ req, res });

      if (!context.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Register SSE client
      const clientId = realtimeManager.addClient(context.user.id, res);

      // Subscribe to user-specific channel
      realtimeManager.subscribe(clientId, [`user:${context.user.id}`]);

      console.log(
        `[SSE] User ${context.user.id} connected with client ${clientId}`,
      );
    } catch (error) {
      console.error("[SSE] Connection error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // SSE stats endpoint (admin only)
  app.get("/api/realtime/stats", async (req, res) => {
    try {
      // @ts-expect-error - Express req/res is compatible with CreateExpressContextOptions
      const context = await createContext({ req, res });
      if (!context.user || context.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const stats = realtimeManager.getStats();
      res.json(stats);
    } catch (error) {
      console.error("[SSE] Stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // SSE health endpoint (public, for monitoring)
  app.get("/api/realtime/health", (req, res) => {
    try {
      const stats = realtimeManager.getStats();
      res.json({
        status: "healthy",
        connectedClients: stats.connectedClients || 0,
        activeChannels: stats.channels ? Object.keys(stats.channels).length : 0,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[SSE] Health check error:", error);
      res.status(500).json({
        status: "unhealthy",
        error: "Failed to get realtime stats",
      });
    }
  });

  // WhatsApp webhook verification (GET) - required by Meta
  // This endpoint must be publicly accessible for Meta to verify the webhook
  app.get("/api/webhooks/whatsapp", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    // Check if this is a webhook verification request
    if (
      mode === "subscribe" &&
      token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
    ) {
      console.log("[WhatsApp] Webhook verified successfully");
      res.status(200).send(challenge);
    } else {
      console.warn("[WhatsApp] Webhook verification failed - incorrect token");
      res.sendStatus(403);
    }
  });

  // WhatsApp webhook events (POST) - receives message status updates
  // This endpoint receives delivery status, read receipts, and user replies
  app.post("/api/webhooks/whatsapp", express.json(), async (req, res) => {
    try {
      const { entry } = req.body;

      if (!entry || !Array.isArray(entry)) {
        console.warn("[WhatsApp] Invalid webhook payload");
        return res.sendStatus(400);
      }

      // Process each entry (usually just one)
      for (const item of entry) {
        const changes = item.changes || [];

        for (const change of changes) {
          const value = change.value;

          // Handle message status updates
          if (value?.statuses) {
            for (const status of value.statuses) {
              console.log(
                `[WhatsApp] Status update: ${status.id} -> ${status.status}`,
              );
              // TODO: Update message status in database
              // Possible statuses: sent, delivered, read, failed
            }
          }

          // Handle incoming messages (user replies)
          if (value?.messages) {
            for (const message of value.messages) {
              console.log(
                `[WhatsApp] Received message from ${message.from}: ${message.type}`,
              );
              // TODO: Handle user replies (e.g., "STOP" for opt-out)
              // TODO: Process message content based on type (text, image, etc.)
            }
          }
        }
      }

      // Always respond with 200 to acknowledge receipt
      res.sendStatus(200);
    } catch (error) {
      console.error("[WhatsApp] Webhook error:", error);
      // Still return 200 to prevent Meta from retrying
      res.sendStatus(200);
    }
  });

  // Import trial lock middleware
  const { trialLockMiddleware } = await import("./trialLock");

  // Apply trial lock middleware to ALL API routes (except exempt paths)
  // This enforces hard 7-day trial lock server-side
  app.use("/api", trialLockMiddleware);
  app.use("/trpc", trialLockMiddleware);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  // REST API v1 (for third-party integrations)
  app.use("/api/v1", apiRouter);

  // ── Local file serving ────────────────────────────────────────────────────
  // Serves files uploaded to local disk storage (when proxy storage is not configured).
  // Authentication is NOT required here because the file URLs are unguessable
  // (nanoid-prefixed keys).  Path traversal is prevented by resolve() check.
  app.get(/^\/api\/files\/(.+)$/, async (req, res) => {
    const match = req.path.match(/^\/api\/files\/(.+)$/);
    const fileKey = match?.[1];
    if (!fileKey) {
      return res.status(400).json({ error: "Missing file key" });
    }

    const uploadsDir = resolve(ENV.storagePath);
    const filePath = resolve(uploadsDir, fileKey);

    // Security: ensure the resolved path stays strictly within the uploads directory.
    // Excludes `filePath === uploadsDir` — that would serve the directory itself.
    if (!filePath.startsWith(uploadsDir + path.sep)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    res.sendFile(filePath);
  });
  // Any request that starts with /api/ and has NOT been handled by a route
  // above must return JSON, never the SPA index.html.
  // This prevents the "login returns HTML 200" bug where an unmatched API path
  // falls through to the SPA catch-all.
  //
  // Uses a RegExp instead of a string wildcard to avoid path-to-regexp 8.x
  // errors.  Express 5 + router 2 pass string patterns through path-to-regexp
  // 8.x, which requires every wildcard to carry an explicit parameter name
  // (e.g. "/api/*path").  Bare "/api/*" and "/api/:path(.*)" both throw:
  //   PathError: Missing parameter name at index N
  // A RegExp literal bypasses path-to-regexp entirely and is safe across all
  // Express/router versions.
  app.all(/^\/api\/.*/, (req, res) => {
    res.status(404).json({
      error: "Not found",
      path: req.originalUrl,
    });
  });

  // Global JSON error handler for Express errors thrown inside API handlers.
  // Must be registered AFTER all routes and BEFORE static serving.
  // The 4-argument signature is required by Express to recognise this as an
  // error handler (not a regular middleware).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, req: any, res: any, next: any) => {
    // Only override if the response hasn't started and the request is an API call
    if (!res.headersSent && req.originalUrl.startsWith("/api/")) {
      console.error("[API Error]", req.method, req.originalUrl, err.message);
      return res.status(500).json({ error: "Internal server error" });
    }
    next(err);
  });

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Deterministic port binding - fail if port is in use (no auto-switching)
  // Bind to 0.0.0.0 by default so the server is reachable from all interfaces
  // (required when running behind Nginx on the same host).  Override via HOST
  // env var (e.g. HOST=127.0.0.1 to restrict to loopback only).
  const host = process.env.HOST || "0.0.0.0";
  const port = parseInt(process.env.PORT || "3000");

  console.log(`Starting server on ${host}:${port}...`);

  // Validate pricing configuration at startup
  validatePricingConfig();

  // Verify SMTP configuration — non-blocking, logs result to console
  email.verifySmtpConfig().catch((err) =>
    console.error("[Startup] SMTP verification error:", err),
  );

  server.listen(port, host, () => {
    console.log(`✓ Server running on http://${host}:${port}/`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`✓ Health check: http://${host}:${port}/api/health`);

    // Expose server handle for graceful shutdown handler below
    _activeServer = server;

    // Start reminder scheduler
    import("./reminderScheduler")
      .then((module) => {
        module.startReminderScheduler();
      })
      .catch((err) => {
        console.error("[Server] Failed to start reminder scheduler:", err);
      });
  });

  // Handle port binding errors
  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\n❌ ERROR: Port ${port} is already in use!`);
      console.error(`\nTo fix this issue:`);
      console.error(`  1. Find process using port: lsof -i :${port}`);
      console.error(`  2. Kill the process: kill -9 <PID>`);
      console.error(`  3. Or use a different port: PORT=${port + 1} npm start`);
      console.error(`\nIf running via systemd:`);
      console.error(`  sudo systemctl stop equiprofile`);
      console.error(`  sudo systemctl start equiprofile\n`);
      process.exit(1);
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });
}

startServer().catch(console.error);

// ── Graceful shutdown (systemd SIGTERM + Ctrl-C SIGINT) ─────────────────────
// Keep the process in the foreground; do NOT call process.exit() immediately so
// that in-flight requests can drain.  The HTTP server's close() callback calls
// process.exit(0) once all connections are finished.
function shutdown(signal: string) {
  console.log(`\n[Server] Received ${signal} — shutting down gracefully…`);
  if (_activeServer) {
    _activeServer.close(() => {
      console.log("[Server] All connections closed. Exiting.");
      process.exit(0);
    });
    // Force-exit after 10 s if connections don't drain in time
    setTimeout(() => {
      console.error("[Server] Forced exit after 10 s shutdown timeout.");
      process.exit(1);
    }, 10_000).unref();
  } else {
    process.exit(0);
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
