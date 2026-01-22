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

// Port checking functions removed - now using deterministic port binding
// If port is in use, server will fail with clear error message instead of auto-switching

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Trust proxy - CRITICAL for correct IP detection behind nginx reverse proxy
  // Must be set BEFORE rate limiter and any middleware that reads req.ip
  app.set("trust proxy", 1);
  console.log("✅ Trust proxy enabled for reverse proxy support");

  // Security middleware with strict CSP
  // NOTE: scriptSrc does NOT include 'unsafe-inline' - all scripts must be external
  // client/index.html contains NO inline scripts, only <script type="module" src="/src/main.tsx">
  // This prevents XSS attacks via inline script injection
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"], // NO 'unsafe-inline' - all scripts must be external
        styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles (Tailwind)
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
      },
    },
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

  // Health check endpoint (always returns 200, no DB required)
  // Suitable for liveness probes
  const startTime = Date.now();
  app.get("/api/health", healthLimiter, (req, res) => {
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    res.status(200).json({
      status: "ok",
      uptimeSeconds,
      time: new Date().toISOString(),
      version: cachedBuildInfo.version
    });
  });

  // Readiness check endpoint (checks DB, returns 200 if ready, 503 if not)
  // Suitable for readiness probes
  app.get("/api/ready", healthLimiter, async (req, res) => {
    try {
      const dbInstance = await db.getDb();
      if (!dbInstance) {
        return res.status(503).json({
          status: "not_ready",
          database: "disconnected",
          error: "Database connection not available"
        });
      }
      
      // Test the connection with a simple query (using raw SQL for lightweight check)
      await dbInstance.execute('SELECT 1');
      
      res.status(200).json({
        status: "ready",
        database: "connected"
      });
    } catch (error) {
      res.status(503).json({
        status: "not_ready",
        database: "error",
        error: error instanceof Error ? error.message : "Unknown database error"
      });
    }
  });

  // Simple ping endpoint (minimal response for monitoring)
  app.get("/api/health/ping", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Version endpoint with build fingerprint
  app.get("/api/version", (req, res) => {
    const fs = require('fs');
    const path = require('path');
    
    // Try to read build.txt for build fingerprint
    let buildInfo: any = {
      version: cachedBuildInfo.version,
      sha: cachedBuildInfo.commit,
      buildTime: cachedBuildInfo.buildTime
    };
    
    try {
      const buildTxtPath = path.resolve(process.cwd(), 'dist/public/build.txt');
      if (fs.existsSync(buildTxtPath)) {
        const buildTxt = fs.readFileSync(buildTxtPath, 'utf-8');
        const lines = buildTxt.split('\n');
        lines.forEach((line: string) => {
          const [key, value] = line.split('=');
          if (key && value) {
            if (key === 'BUILD_SHA') buildInfo.sha = value.trim();
            if (key === 'BUILD_TIME') buildInfo.buildTime = value.trim();
            if (key === 'VERSION') buildInfo.version = value.trim();
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

  // Environment diagnostics endpoint (admin only)
  app.get("/api/diagnostics/env", async (req, res) => {
    try {
      // Get user from session (reuse tRPC context logic)
      const context = await createContext({ req, res, info: { isBatchCall: false, calls: [] } });
      
      if (!context.user || context.user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Check admin session
      const adminSession = await db.getActiveAdminSession(context.user.id);
      if (!adminSession) {
        return res.status(403).json({ error: "Admin session expired. Please unlock admin mode in AI Chat" });
      }

      res.json({
        database_url_present: !!process.env.DATABASE_URL,
        jwt_secret_present: !!process.env.JWT_SECRET,
        admin_unlock_password_present: !!process.env.ADMIN_UNLOCK_PASSWORD,
        enable_stripe: ENV.enableStripe,
        enable_uploads: ENV.enableUploads,
        enable_forge: ENV.enableForge,
        forge_vars_present: !!(process.env.BUILT_IN_FORGE_API_URL && process.env.BUILT_IN_FORGE_API_KEY),
        version: cachedBuildInfo.version,
        node_env: process.env.NODE_ENV || "development"
      });
    } catch (error) {
      console.error("[Admin] Diagnostics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Real-time SSE endpoint
  const { realtimeManager } = await import("./realtime");
  // SSE endpoint for real-time updates
  // Primary endpoint
  app.get("/events", async (req, res) => {
    try {
      // Get user from session (reuse tRPC context logic)
      const context = await createContext({ req, res, info: { isBatchCall: false, calls: [] } });
      
      if (!context.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Register SSE client
      const clientId = realtimeManager.addClient(context.user.id, res);
      
      // Subscribe to user-specific channel
      realtimeManager.subscribe(clientId, [`user:${context.user.id}`]);
      
      console.log(`[SSE] User ${context.user.id} connected with client ${clientId}`);
    } catch (error) {
      console.error("[SSE] Connection error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Alias for backward compatibility
  app.get("/api/realtime/events", async (req, res) => {
    try {
      // Get user from session (reuse tRPC context logic)
      const context = await createContext({ req, res, info: { isBatchCall: false, calls: [] } });
      
      if (!context.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Register SSE client
      const clientId = realtimeManager.addClient(context.user.id, res);
      
      // Subscribe to user-specific channel
      realtimeManager.subscribe(clientId, [`user:${context.user.id}`]);
      
      console.log(`[SSE] User ${context.user.id} connected with client ${clientId}`);
    } catch (error) {
      console.error("[SSE] Connection error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // SSE stats endpoint (admin only)
  app.get("/api/realtime/stats", async (req, res) => {
    try {
      const context = await createContext({ req, res, info: { isBatchCall: false, calls: [] } });
      if (!context.user || context.user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const stats = realtimeManager.getStats();
      res.json(stats);
    } catch (error) {
      console.error("[SSE] Stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Contact form endpoint with rate limiting
  const contactLimiter = rateLimit({
    windowMs: 60000, // 1 minute
    max: 5, // 5 requests per minute per IP
    message: "Too many contact requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.post("/api/contact", contactLimiter, async (req, res) => {
    try {
      const { name, email, subject, message, company } = req.body;

      // Honeypot check - if company field is filled, it's likely a bot
      if (company) {
        console.log("[Contact] Honeypot triggered, likely bot submission");
        // Return success to avoid revealing the honeypot
        return res.json({ success: true });
      }

      // Validation
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ 
          error: "All fields are required" 
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          error: "Invalid email format" 
        });
      }

      // Message length check
      if (message.length > 5000) {
        return res.status(400).json({ 
          error: "Message is too long (max 5000 characters)" 
        });
      }

      // Send email
      try {
        await email.sendContactFormEmail({
          name,
          email,
          subject,
          message,
        });

        console.log(`[Contact] Email sent successfully from ${email}`);
        res.json({ 
          success: true, 
          message: "Your message has been sent successfully" 
        });
      } catch (emailError) {
        console.error("[Contact] Failed to send email:", emailError);
        res.status(500).json({ 
          error: "Failed to send email. Please try again later or contact us directly at support@equiprofile.com" 
        });
      }
    } catch (error) {
      console.error("[Contact] Error:", error);
      res.status(500).json({ 
        error: "Internal server error" 
      });
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

  // Deterministic port binding - fail if port is in use (no auto-switching)
  const host = process.env.HOST || "127.0.0.1";
  const port = parseInt(process.env.PORT || "3000");
  
  console.log(`Starting server on ${host}:${port}...`);

  server.listen(port, host, () => {
    console.log(`✓ Server running on http://${host}:${port}/`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`✓ Health check: http://${host}:${port}/api/health`);
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
