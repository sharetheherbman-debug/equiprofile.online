#!/usr/bin/env node
/**
 * EquiProfile UI Smoke Test (Playwright)
 *
 * Comprehensive headless browser test that verifies:
 *   1. Homepage loads and React mounts correctly
 *   2. Login page renders a functional form
 *   3. Register page renders a functional form
 *   4. Dashboard route serves HTML (redirects handled by SPA)
 *   5. No JavaScript runtime errors on public pages
 *   6. Navigation links exist on the landing page
 *   7. Hero video element is present on homepage
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 node scripts/ui_smoke_test.mjs
 *
 * Exit codes:
 *   0 – all checks passed
 *   1 – one or more checks failed
 *
 * Note: Playwright must be installed (npm install playwright or
 *       npm install -D @playwright/test) and browsers downloaded
 *       (npx playwright install chromium).
 */

import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const TIMEOUT = parseInt(process.env.SMOKE_TIMEOUT || "30000", 10);

let browser;
let pass = 0;
let fail = 0;

function log(status, name, detail = "") {
  const icon = status === "pass" ? "✅" : "❌";
  console.log(`  ${icon} ${name}${detail ? ": " + detail : ""}`);
  if (status === "pass") pass++;
  else fail++;
}

function section(title) {
  console.log(`\n── ${title} ${"─".repeat(Math.max(0, 44 - title.length))}`);
}

async function checkPage(page, url, name, checks = []) {
  const jsErrors = [];
  const cspViolations = [];

  page.on("pageerror", (e) => jsErrors.push(e.message));
  page.on("console", (msg) => {
    if (
      msg.type() === "error" &&
      msg.text().toLowerCase().includes("content security policy")
    ) {
      cspViolations.push(msg.text());
    }
  });

  try {
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: TIMEOUT,
    });

    if (response && response.status() === 200) {
      log("pass", `${name} HTTP 200`);
    } else {
      log("fail", `${name} HTTP status`, `got ${response?.status()}`);
    }

    for (const check of checks) {
      try {
        await check(page);
      } catch (e) {
        log("fail", `${name}: ${e.message}`);
      }
    }

    // Allow async scripts to run then check CSP
    await page.waitForTimeout(1500);

    if (cspViolations.length === 0) {
      log("pass", `${name} — no CSP violations`);
    } else {
      log(
        "fail",
        `${name} — CSP violations`,
        cspViolations.slice(0, 2).join("; "),
      );
    }

    if (jsErrors.length === 0) {
      log("pass", `${name} — no JS runtime errors`);
    } else {
      log(
        "fail",
        `${name} — JS runtime errors`,
        jsErrors.slice(0, 2).join("; "),
      );
    }
  } catch (e) {
    log("fail", `${name} navigation failed`, e.message);
  }
}

async function main() {
  console.log(`\n🧪 EquiProfile UI Smoke Test`);
  console.log(`   Target  : ${BASE_URL}`);
  console.log(`   Timeout : ${TIMEOUT}ms`);
  console.log("═".repeat(46));

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "EquiProfile-SmokeTest/1.0 (automated; +https://equiprofile.online)",
  });

  try {
    // ── Test 1: Homepage ───────────────────────────────────────────────────
    section("1. Homepage");
    {
      const page = await context.newPage();
      await checkPage(page, `${BASE_URL}/`, "Home", [
        async (p) => {
          const root = p.locator("#root");
          const count = await root.count();
          if (count > 0 && (await root.innerHTML()).trim().length > 100) {
            log("pass", "Home — #root mounted with content");
          } else {
            log("fail", "Home — #root is empty (React did not mount)");
          }
        },
        async (p) => {
          // Check hero video is present
          const video = p.locator("video").first();
          const count = await video.count();
          if (count > 0) {
            log("pass", "Home — hero video element present");
          } else {
            log("fail", "Home — hero video element missing");
          }
        },
        async (p) => {
          // Check navbar links exist
          const loginLink = p.locator('a[href="/login"], [href="/login"]');
          const count = await loginLink.count();
          if (count > 0) {
            log("pass", "Home — navbar Login link present");
          } else {
            log("fail", "Home — navbar Login link missing");
          }
        },
      ]);
      await page.close();
    }

    // ── Test 2: Login Page ─────────────────────────────────────────────────
    section("2. Login Page");
    {
      const page = await context.newPage();
      await checkPage(page, `${BASE_URL}/login`, "Login", [
        async (p) => {
          const emailInput = p.locator('input[type="email"]').first();
          try {
            await emailInput.waitFor({ timeout: 8000 });
            log("pass", "Login — email input rendered");
          } catch {
            log("fail", "Login — email input not found (UI may be blank)");
          }
        },
        async (p) => {
          // Navbar should be present (same component as landing)
          const nav = p.locator("nav").first();
          const count = await nav.count();
          if (count > 0) {
            log("pass", "Login — navbar present");
          } else {
            log("fail", "Login — navbar missing");
          }
        },
      ]);
      await page.close();
    }

    // ── Test 3: Register Page ──────────────────────────────────────────────
    section("3. Register Page");
    {
      const page = await context.newPage();
      await checkPage(page, `${BASE_URL}/register`, "Register", [
        async (p) => {
          // Register starts with a name input (step 1)
          const input = p
            .locator('input[type="text"], input[type="email"]')
            .first();
          try {
            await input.waitFor({ timeout: 8000 });
            log("pass", "Register — form input rendered");
          } catch {
            log("fail", "Register — form input not found (UI may be blank)");
          }
        },
        async (p) => {
          const nav = p.locator("nav").first();
          const count = await nav.count();
          if (count > 0) {
            log("pass", "Register — navbar present");
          } else {
            log("fail", "Register — navbar missing");
          }
        },
      ]);
      await page.close();
    }

    // ── Test 4: Dashboard Route ────────────────────────────────────────────
    section("4. Dashboard Route");
    {
      const page = await context.newPage();
      await checkPage(page, `${BASE_URL}/dashboard`, "Dashboard route", [
        async (p) => {
          // Without auth, dashboard should redirect to login or show auth prompt
          const url = p.url();
          const title = await p.title();
          if (url.includes("/login") || url.includes("/dashboard")) {
            log(
              "pass",
              `Dashboard route — handled (${url.includes("/login") ? "redirected to login" : "serves dashboard"})`,
            );
          } else {
            log("fail", `Dashboard route — unexpected redirect to ${url}`);
          }
        },
      ]);
      await page.close();
    }

    // ── Test 5: Public Pages (quick status check) ──────────────────────────
    section("5. Public Marketing Pages");
    {
      const publicRoutes = [
        "/features",
        "/pricing",
        "/about",
        "/contact",
        "/terms",
        "/privacy",
      ];

      for (const route of publicRoutes) {
        const page = await context.newPage();
        try {
          const res = await page.goto(`${BASE_URL}${route}`, {
            waitUntil: "domcontentloaded",
            timeout: TIMEOUT,
          });
          if (res && res.status() === 200) {
            log("pass", `GET ${route} 200`);
          } else {
            log("fail", `GET ${route} returned ${res?.status()}`);
          }
        } catch (e) {
          log("fail", `GET ${route} navigation failed`, e.message);
        }
        await page.close();
      }
    }

    // ── Test 6: Auth Video Background ─────────────────────────────────────
    section("6. Auth Page Video Background");
    {
      const page = await context.newPage();
      try {
        await page.goto(`${BASE_URL}/login`, {
          waitUntil: "domcontentloaded",
          timeout: TIMEOUT,
        });
        const videoSrc = await page.evaluate(() => {
          const sources = Array.from(document.querySelectorAll("video source"));
          return sources.map((s) => s.getAttribute("src")).join(", ");
        });
        if (videoSrc.includes("LoginFinal2") || videoSrc.includes("login")) {
          log(
            "pass",
            `Login — auth video source found: ${videoSrc.slice(0, 60)}`,
          );
        } else if (videoSrc.length > 0) {
          log("pass", `Login — video source present: ${videoSrc.slice(0, 60)}`);
        } else {
          log("fail", "Login — no video source found on auth page");
        }
      } catch (e) {
        log("fail", "Auth video check failed", e.message);
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(46));
  console.log(`  Passed : ${pass}`);
  console.log(`  Failed : ${fail}`);
  console.log("═".repeat(46));

  if (fail === 0) {
    console.log("\n✅  All UI smoke tests passed!");
    console.log("   The platform is visually ready for beta testers.\n");
    process.exit(0);
  } else {
    console.log(`\n❌  ${fail} test(s) failed — check output above.\n`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Fatal smoke test error:", e);
  process.exit(1);
});
