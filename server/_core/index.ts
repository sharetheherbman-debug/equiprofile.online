import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import authRouter from "./authRouter";
import billingRouter from "./billingRouter";
import { appRouter } from "../routers";
import { apiRouter } from "../api";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { nanoid } from "nanoid";
import Stripe from "stripe";
import * as db from "../db";
import { getStripe } from "../stripe";
import * as email from "./email";
import { ENV } from "./env";
import { resolve } from "path";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Trust proxy - CRITICAL for correct IP detection behind nginx reverse proxy
  // Must be set BEFORE rate limiter and any middleware that reads req.ip
  app.set("trust proxy", 1);
  console.log("✅ Trust proxy enabled for reverse proxy support");

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
    crossOriginEmbedderPolicy: false,
  }));

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
      console.log(`[${req.headers["x-request-id"]}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    });
    next();
  });

  // Rate limiting
  // Trust proxy is already set globally via app.set("trust proxy", 1)
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api", limiter);

  // Health/build endpoints rate limiter (more permissive for monitoring)
  const healthLimiter = rateLimit({
    windowMs: 60000, // 1 minute
    max: 60, // 60 requests per minute (1 per second average)
    message: "Too many health check requests",
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Stripe webhook - must be before body parser
  app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), async (req, res) => {
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
      console.error(`[Stripe Webhook] Signature verification failed:`, err.message);
      return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
    }

    // Check for duplicate events (idempotency)
    const alreadyProcessed = await db.isStripeEventProcessed(event.id);
    if (alreadyProcessed) {
      console.log(`[Stripe Webhook] Event ${event.id} already processed`);
      return res.json({ received: true, cached: true });
    }

    // Store event for idempotency
    await db.createStripeEvent(event.id, event.type, JSON.stringify(event.data.object));

    try {
      // Handle different event types
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = parseInt(session.metadata?.userId || "0");
          
          if (userId && session.customer && session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            const plan = subscription.items.data[0]?.price.recurring?.interval === "year" ? "yearly" : "monthly";
            
            await db.updateUser(userId, {
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              subscriptionStatus: "active",
              subscriptionPlan: plan,
              lastPaymentAt: new Date(),
            });
            
            // Send payment success email
            const user = await db.getUserById(userId);
            if (user) {
              email.sendPaymentSuccessEmail(user, plan).catch(err => 
                console.error("[Stripe Webhook] Failed to send payment email:", err)
              );
            }
            
            console.log(`[Stripe Webhook] User ${userId} subscription activated`);
          }
          break;
        }

        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          const userId = await getUserIdByStripeSubscription(subscription.id);
          
          if (userId) {
            let status: "active" | "cancelled" | "overdue" | "expired" = "active";
            if (subscription.status === "past_due") status = "overdue";
            if (subscription.status === "canceled" || subscription.status === "unpaid") status = "cancelled";
            if (subscription.status === "incomplete_expired") status = "expired";

            await db.updateUser(userId, {
              subscriptionStatus: status,
              subscriptionEndsAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
            });
            console.log(`[Stripe Webhook] User ${userId} subscription updated to ${status}`);
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
            console.log(`[Stripe Webhook] User ${userId} subscription cancelled`);
          }
          break;
        }

        case "invoice.payment_succeeded": {
          const invoice = event.data.object as any;
          const subscriptionId = invoice.subscription as string | undefined;
          if (subscriptionId) {
            const userId = await getUserIdByStripeSubscription(subscriptionId);
            if (userId) {
              await db.updateUser(userId, {
                subscriptionStatus: "active",
                lastPaymentAt: new Date(),
              });
              console.log(`[Stripe Webhook] User ${userId} payment succeeded`);
            }
          }
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as any;
          const subscriptionId = invoice.subscription as string | undefined;
          if (subscriptionId) {
            const userId = await getUserIdByStripeSubscription(subscriptionId);
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
      console.error(`[Stripe Webhook] Error processing event ${event.id}:`, error);
      await db.markStripeEventProcessed(event.id, (error as Error).message);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // Helper function to find user by Stripe subscription ID
  async function getUserIdByStripeSubscription(subscriptionId: string): Promise<number | null> {
    const users = await db.getAllUsers();
    const user = users.find(u => u.stripeSubscriptionId === subscriptionId);
    return user?.id || null;
  }

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Cache build info at startup to avoid blocking on every request
  let cachedBuildInfo: any = null;
  try {
    const packageJsonPath = resolve(process.cwd(), 'package.json');
    const packageJson = JSON.parse(require('fs').readFileSync(packageJsonPath, 'utf-8'));
    
    // Try to get git commit (only once at startup)
    let commit = 'unknown';
    try {
      const { execSync } = require('child_process');
      commit = execSync('git rev-parse HEAD', { encoding: 'utf-8', timeout: 1000 }).trim().slice(0, 7);
    } catch {
      // Git not available, that's okay
    }

    cachedBuildInfo = {
      version: packageJson.version || '1.0.0',
      buildId: process.env.BUILD_ID || 'dev',
      commit,
      buildTime: process.env.BUILD_TIME || new Date().toISOString(),
      nodeVersion: process.version
    };
  } catch (err) {
    console.warn('⚠️  Could not generate build info:', err);
    cachedBuildInfo = {
      version: '1.0.0',
      buildId: 'unknown',
      commit: 'unknown',
      buildTime: new Date().toISOString(),
      nodeVersion: process.version
    };
  }

  // Simple health check endpoint (production-friendly) with rate limiting
  app.get("/healthz", healthLimiter, (req, res) => {
    res.json({
      ok: true,
      timestamp: new Date().toISOString()
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

  // OAuth status endpoint
  app.get("/api/oauth/status", (req, res) => {
    const configured = !!(ENV.oAuthServerUrl && ENV.appId);
    res.json({
      configured,
      baseUrl: ENV.baseUrl,
      oauthServerUrl: configured ? ENV.oAuthServerUrl : null,
    });
  });

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Local auth routes
  app.use("/api/auth", authRouter);

  // Billing routes (Stripe)
  app.use("/api/billing", billingRouter);

  // Test email endpoint (admin only)
  app.post("/api/admin/send-test-email", async (req, res) => {
    try {
      const { to } = req.body;
      if (!to) {
        return res.status(400).json({ error: "Email address required" });
      }
      
      const success = await email.sendTestEmail(to);
      res.json({ success, message: success ? "Test email sent" : "Failed to send email (check SMTP config)" });
    } catch (error) {
      console.error("[Admin] Test email error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // REST API v1 (for third-party integrations)
  app.use("/api/v1", apiRouter);

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
