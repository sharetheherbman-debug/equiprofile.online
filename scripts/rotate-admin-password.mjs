#!/usr/bin/env node
/**
 * Admin Password Rotation Script
 *
 * Usage:
 *   node scripts/rotate-admin-password.mjs [new-password]
 *
 * If no password is provided, a secure random password is generated.
 * The script updates ADMIN_UNLOCK_PASSWORD in your .env file.
 *
 * Examples:
 *   node scripts/rotate-admin-password.mjs
 *   node scripts/rotate-admin-password.mjs "MyNewSecurePass#2024"
 */

import { randomBytes } from "crypto";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { createInterface } from "readline";

const ENV_FILE = resolve(process.cwd(), ".env");

function generateSecurePassword(length = 20) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  // Rejection sampling: discard bytes that would produce biased results
  const limit = Math.floor(256 / chars.length) * chars.length;
  const result = [];
  while (result.length < length) {
    const bytes = randomBytes(length * 2);
    for (const b of bytes) {
      if (b < limit && result.length < length) {
        result.push(chars[b % chars.length]);
      }
    }
  }
  return result.join("");
}

function updateEnvFile(envPath, key, value) {
  let content = existsSync(envPath) ? readFileSync(envPath, "utf-8") : "";
  const regex = new RegExp(`^${key}=.*$`, "m");
  const newLine = `${key}=${value}`;

  if (regex.test(content)) {
    content = content.replace(regex, newLine);
  } else {
    content = content.trimEnd() + "\n" + newLine + "\n";
  }

  writeFileSync(envPath, content, "utf-8");
}

async function confirm(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "y");
    });
  });
}

async function main() {
  const providedPassword = process.argv[2];
  const newPassword = providedPassword || generateSecurePassword();

  if (!providedPassword) {
    console.log("\n🔑  Generated secure admin password:");
    console.log(`   ${newPassword}`);
    console.log(
      "\n⚠️  IMPORTANT: Save this password somewhere safe before continuing!\n",
    );
  }

  if (!existsSync(ENV_FILE)) {
    console.error(`❌  No .env file found at: ${ENV_FILE}`);
    console.error(
      "    Create one from .env.example first: cp .env.example .env\n",
    );
    process.exit(1);
  }

  // Validate strength (match server-side check)
  // Weak patterns: documented defaults and common prefixes blocked by the
  // server-side validateEnvironment() check in server/_core/env.ts.
  // These mirror the same patterns enforced at server startup to stay in sync.
  const weakPatterns = [
    /^admin/i, // generic admin prefix
    /^password/i, // generic "password" prefix
    /^12345/, // sequential numbers
    /^ashmor/i, // known project-specific default (from .env.example)
    /^equiprofile/i, // product name used as password
  ];
  if (newPassword.length < 8 || weakPatterns.some((p) => p.test(newPassword))) {
    console.error(
      "❌  Password is too weak. Use at least 8 chars, avoid common prefixes.\n",
    );
    process.exit(1);
  }

  const proceed = await confirm(
    `Update ADMIN_UNLOCK_PASSWORD in ${ENV_FILE}? [y/N] `,
  );
  if (!proceed) {
    console.log("Aborted.\n");
    process.exit(0);
  }

  updateEnvFile(ENV_FILE, "ADMIN_UNLOCK_PASSWORD", newPassword);

  console.log("\n✅  ADMIN_UNLOCK_PASSWORD updated in .env");
  console.log("    Restart the server for the change to take effect.\n");

  if (!providedPassword) {
    console.log(
      "⚠️  Remember: the generated password above is shown only once!\n",
    );
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
