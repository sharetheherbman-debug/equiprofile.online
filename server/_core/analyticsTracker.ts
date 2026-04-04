/**
 * Lightweight internal site analytics tracker.
 * Records page views, sessions, CTA clicks in the siteAnalytics table.
 */
import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const DAY_MS = 86_400_000;

// In-memory live visitor tracking (no DB needed)
const liveVisitors = new Map<string, number>(); // visitorId → last-seen timestamp
const LIVE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

function cleanLiveVisitors(): void {
  const cutoff = Date.now() - LIVE_TIMEOUT_MS;
  liveVisitors.forEach((ts, id) => {
    if (ts < cutoff) liveVisitors.delete(id);
  });
}

setInterval(cleanLiveVisitors, 60_000);

export function getLiveVisitorCount(): number {
  cleanLiveVisitors();
  return liveVisitors.size;
}

function hashFingerprint(ip: string, ua: string): string {
  return crypto
    .createHash("sha256")
    .update(`${ip}|${ua}`)
    .digest("hex")
    .slice(0, 32);
}

function parseDeviceType(
  ua: string,
): "mobile" | "tablet" | "desktop" {
  const lower = ua.toLowerCase();
  if (
    lower.includes("iphone") ||
    lower.includes("ipod") ||
    lower.includes("blackberry") ||
    lower.includes("windows phone") ||
    (lower.includes("mobile") && lower.includes("android")) ||
    (lower.includes("mobile") && !lower.includes("tablet"))
  )
    return "mobile";
  if (
    lower.includes("tablet") ||
    lower.includes("ipad") ||
    (lower.includes("android") && !lower.includes("mobile"))
  )
    return "tablet";
  return "desktop";
}

/**
 * Express middleware that records page views into siteAnalytics.
 * Only tracks HTML page requests (not API, static assets, etc.)
 */
export function analyticsMiddleware() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    // Only track GET requests for HTML pages (not API, assets)
    if (
      req.method !== "GET" ||
      req.path.startsWith("/api/") ||
      req.path.startsWith("/trpc/") ||
      req.path.startsWith("/assets/") ||
      req.path.startsWith("/favicon") ||
      req.path.includes(".")
    ) {
      return next();
    }

    try {
      const ua = req.headers["user-agent"] || "";
      const ip =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        "";
      const visitorId = hashFingerprint(ip, ua);
      const referrer = (req.headers.referer || req.headers.referrer || "") as string;

      // Update live visitors
      liveVisitors.set(visitorId, Date.now());

      // Generate or reuse session
      const sessionId =
        (req.cookies?.["__ep_sid"] as string) ||
        crypto.randomBytes(16).toString("hex");

      // Lazy-import db to avoid circular deps
      const { getDb } = await import("../db");
      const db = await getDb();
      if (db) {
        const { siteAnalytics } = await import("../../drizzle/schema");
        await db.insert(siteAnalytics).values({
          sessionId,
          visitorId,
          path: req.path,
          referrer: referrer.slice(0, 500) || null,
          userAgent: ua.slice(0, 500) || null,
          deviceType: parseDeviceType(ua),
          duration: 0,
          isCtaClick: false,
          userId: null, // Analytics middleware runs before auth; no user context available
        });
      }
    } catch {
      // Analytics must never block page loads
    }

    next();
  };
}

/**
 * REST endpoint handler to record CTA clicks from the client.
 */
export async function trackCtaClick(req: Request, res: Response): Promise<void> {
  try {
    const { ctaType, path } = req.body as { ctaType?: string; path?: string };
    if (!ctaType || !path) {
      res.status(400).json({ error: "ctaType and path required" });
      return;
    }

    const ua = req.headers["user-agent"] || "";
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "";
    const visitorId = hashFingerprint(ip, ua);
    const sessionId =
      (req.cookies?.["__ep_sid"] as string) ||
      crypto.randomBytes(16).toString("hex");

    const { getDb } = await import("../db");
    const db = await getDb();
    if (db) {
      const { siteAnalytics } = await import("../../drizzle/schema");
      await db.insert(siteAnalytics).values({
        sessionId,
        visitorId,
        path: String(path).slice(0, 500),
        deviceType: parseDeviceType(ua),
        isCtaClick: true,
        ctaType: String(ctaType).slice(0, 50),
        duration: 0,
      });
    }

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to track" });
  }
}
