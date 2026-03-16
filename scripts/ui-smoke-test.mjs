#!/usr/bin/env node
/**
 * Headless UI smoke test using Playwright.
 *
 * Verifies that:
 *   1. The home page loads (HTTP 200)
 *   2. The React app mounts (#root has content)
 *   3. No CSP violations are reported in the console
 *   4. The login page renders a form
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 node scripts/ui-smoke-test.mjs
 *
 * Exit codes:
 *   0 – all checks passed
 *   1 – one or more checks failed
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

async function checkPage(page, url, name, checks) {
  const cspViolations = [];
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

    // HTTP status check
    if (response && response.status() === 200) {
      log("pass", `${name} HTTP 200`);
    } else {
      log("fail", `${name} HTTP status`, `got ${response?.status()}`);
    }

    // Run custom checks
    for (const check of checks) {
      try {
        await check(page);
      } catch (e) {
        log("fail", `${name}: ${e.message}`);
      }
    }

    // CSP violation check
    await page.waitForTimeout(2000); // let any async scripts run
    if (cspViolations.length === 0) {
      log("pass", `${name} no CSP violations`);
    } else {
      log(
        "fail",
        `${name} CSP violations detected`,
        cspViolations.slice(0, 2).join("; "),
      );
    }
  } catch (e) {
    log("fail", `${name} navigation failed`, e.message);
  }
}

async function main() {
  console.log(`🧪 EquiProfile UI Smoke Test — ${BASE_URL}`);
  console.log("────────────────────────────────────────");

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  try {
    // Test 1: Home page
    {
      const page = await context.newPage();
      await checkPage(page, `${BASE_URL}/`, "Home", [
        async (p) => {
          const root = p.locator("#root");
          const count = await root.count();
          if (count > 0 && (await root.innerHTML()).trim().length > 0) {
            log("pass", "Home #root mounted");
          } else {
            log("fail", "Home #root is empty — React did not mount");
          }
        },
      ]);
      await page.close();
    }

    // Test 2: Login page
    {
      const page = await context.newPage();
      await checkPage(page, `${BASE_URL}/login`, "Login", [
        async (p) => {
          // Wait for form to appear
          const form = p
            .locator("form, [role=form], input[type=email]")
            .first();
          try {
            await form.waitFor({ timeout: 10000 });
            log("pass", "Login form rendered");
          } catch {
            log("fail", "Login form not found — UI may be blank");
          }
        },
      ]);
      await page.close();
    }

    // Test 3: Register page
    {
      const page = await context.newPage();
      await checkPage(page, `${BASE_URL}/register`, "Register", [
        async (p) => {
          const form = p
            .locator("form, [role=form], input[type=email]")
            .first();
          try {
            await form.waitFor({ timeout: 10000 });
            log("pass", "Register form rendered");
          } catch {
            log("fail", "Register form not found — UI may be blank");
          }
        },
      ]);
      await page.close();
    }

    // Test 4: Check no JS runtime errors on home
    {
      const page = await context.newPage();
      const jsErrors = [];
      page.on("pageerror", (e) => jsErrors.push(e.message));
      await page.goto(`${BASE_URL}/`, {
        waitUntil: "networkidle",
        timeout: TIMEOUT,
      });
      if (jsErrors.length === 0) {
        log("pass", "Home no JS runtime errors");
      } else {
        log("fail", "Home JS errors detected", jsErrors.slice(0, 2).join("; "));
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }

  console.log("");
  console.log("════════════════════════════════════════");
  console.log(`  Passed : ${pass}`);
  console.log(`  Failed : ${fail}`);
  console.log("════════════════════════════════════════");

  if (fail === 0) {
    console.log("✅  All UI smoke tests passed!");
    process.exit(0);
  } else {
    console.log(`❌  ${fail} test(s) failed — UI may have boot issues.`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Fatal smoke test error:", e);
  process.exit(1);
});
