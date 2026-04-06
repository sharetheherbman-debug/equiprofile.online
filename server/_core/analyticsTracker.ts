/**
 * Lightweight internal site analytics tracker.
 * Records page views, sessions, CTA clicks in the siteAnalytics table.
 */
import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

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

// ── Bot / probe detection ──────────────────────────────────────────────
// Paths that are clearly scanner/probe traffic — never real user visits.
const PROBE_PATHS = [
  "/_profiler",
  "/phpinfo",
  "/wp-config",
  "/wp-login",
  "/wp-admin",
  "/wp-includes",
  "/xmlrpc.php",
  "/.env",
  "/.git",
  "/actuator",
  "/solr",
  "/admin.php",
  "/config.php",
  "/info.php",
  "/test.php",
  "/cgi-bin",
  "/phpmyadmin",
];

const BOT_UA_PATTERNS = [
  "bot",
  "crawler",
  "spider",
  "crawl",
  "slurp",
  "semrush",
  "ahrefs",
  "mj12bot",
  "dotbot",
  "petalbot",
  "yandex",
  "baiduspider",
  "headlesschrome",
  "python-requests",
  "curl/",
  "wget/",
  "go-http-client",
  "node-fetch",
  "axios/",
  "http-client",
  "zgrab",
  "masscan",
  "nmap",
  "nikto",
  "sqlmap",
  "nuclei",
  "dirbuster",
  "gobuster",
  "whatweb",
];

function isBot(ua: string): boolean {
  if (!ua || ua.length < 10) return true; // empty or suspiciously short UA = likely a scanner/probe
  const lower = ua.toLowerCase();
  return BOT_UA_PATTERNS.some((p) => lower.includes(p));
}

function isProbePath(path: string): boolean {
  const lower = path.toLowerCase();
  return PROBE_PATHS.some((p) => lower.startsWith(p));
}

// ── Session duration tracking (in-memory per visitor) ──────────────────
// We store the timestamp of the last page-view per session so we can
// compute a rough "session duration" on the NEXT request in the same session.
const sessionLastSeen = new Map<string, number>();
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 min — a session expires after inactivity

// Clean stale session entries every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - SESSION_TIMEOUT_MS;
  sessionLastSeen.forEach((ts, id) => {
    if (ts < cutoff) sessionLastSeen.delete(id);
  });
}, 5 * 60_000);

/**
 * Express middleware that records page views into siteAnalytics.
 * Only tracks HTML page requests (not API, static assets, etc.)
 * Filters out bot/scanner traffic and probe paths.
 */
export function analyticsMiddleware() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    // Only track GET requests for HTML pages (not API, assets, static files)
    if (
      req.method !== "GET" ||
      req.path.startsWith("/api/") ||
      req.path.startsWith("/trpc/") ||
      req.path.startsWith("/assets/") ||
      req.path.startsWith("/favicon") ||
      /\.\w{2,5}$/.test(req.path) // skip file extensions like .js, .css, .png
    ) {
      return next();
    }

    // Filter out probe/scanner paths (phpinfo, wp-config, etc.)
    if (isProbePath(req.path)) {
      return next();
    }

    try {
      const ua = req.headers["user-agent"] || "";

      // Filter out known bots and scanners
      if (isBot(ua as string)) {
        return next();
      }

      const ip =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        "";
      const visitorId = hashFingerprint(ip, ua as string);
      const referrer = (req.headers.referer || "") as string;

      // Update live visitors
      liveVisitors.set(visitorId, Date.now());

      // Generate or reuse session
      const sessionId =
        (req.cookies?.["__ep_sid"] as string) ||
        crypto.randomBytes(16).toString("hex");

      // ── Estimate session duration ────────────────────────────────────
      // On each new page view we compute how long since the LAST page view
      // in the same session.  If within the session timeout, that delta is
      // the "time on previous page" — stored as `duration` on this new row.
      let duration = 0;
      const now = Date.now();
      const lastSeen = sessionLastSeen.get(sessionId);
      if (lastSeen) {
        const delta = now - lastSeen;
        if (delta < SESSION_TIMEOUT_MS) {
          duration = Math.round(delta / 1000); // seconds
        }
      }
      sessionLastSeen.set(sessionId, now);

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
          userAgent: (ua as string).slice(0, 500) || null,
          deviceType: parseDeviceType(ua as string),
          duration,
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
