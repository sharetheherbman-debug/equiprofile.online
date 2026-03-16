#!/usr/bin/env node
/**
 * EquiProfile CLI
 *
 * Usage:
 *   node dist/cli.js set-admin-password   – prompt, hash (bcrypt), store in .env
 *   node dist/cli.js check-admin-password – verify a password against stored hash
 *
 * Build via: npm run build  (esbuild bundles server/_core/index.ts AND server/cli.ts)
 * Run via:   node dist/cli.js <command>
 */

import readline from "readline";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";

// Load .env so DATABASE_URL is available if needed in the future
import { config } from "dotenv";
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

function ask(
  rl: readline.Interface,
  question: string,
  hidden = false,
): Promise<string> {
  return new Promise((resolve) => {
    if (hidden) {
      // Hide input on compatible TTYs
      process.stdout.write(question);
      let answer = "";
      const onData = (char: Buffer) => {
        const c = char.toString();
        if (c === "\n" || c === "\r" || c === "\u0004") {
          process.stdin.setRawMode?.(false);
          process.stdin.removeListener("data", onData);
          process.stdout.write("\n");
          resolve(answer);
        } else if (c === "\u0003") {
          process.exit(1);
        } else if (c === "\u007f") {
          // backspace
          answer = answer.slice(0, -1);
        } else {
          answer += c;
        }
      };
      process.stdin.setRawMode?.(true);
      process.stdin.resume();
      process.stdin.on("data", onData);
    } else {
      rl.question(question, resolve);
    }
  });
}

/** Update or insert a KEY=VALUE line in a .env file */
function upsertEnvLine(envPath: string, key: string, value: string): void {
  let contents = "";
  if (fs.existsSync(envPath)) {
    contents = fs.readFileSync(envPath, "utf-8");
  }

  const escaped = value.replace(/\n/g, "\\n");
  const newLine = `${key}=${escaped}`;
  const regex = new RegExp(`^${key}=.*$`, "m");

  if (regex.test(contents)) {
    contents = contents.replace(regex, newLine);
  } else {
    contents =
      contents + (contents.endsWith("\n") ? "" : "\n") + newLine + "\n";
  }

  fs.writeFileSync(envPath, contents, "utf-8");
}

async function cmdSetAdminPassword() {
  console.log("\n🔐 EquiProfile Admin Password Setup\n");

  const envPath = path.join(PROJECT_ROOT, ".env");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const p1 = await ask(rl, "Enter new admin password: ", true);
    if (!p1 || p1.length < 8) {
      console.error("❌ Password must be at least 8 characters.");
      process.exit(1);
    }

    const p2 = await ask(rl, "Confirm admin password:   ", true);
    if (p1 !== p2) {
      console.error("❌ Passwords do not match.");
      process.exit(1);
    }

    console.log("\n⏳ Hashing password (bcrypt, cost 12)...");
    const hash = await bcrypt.hash(p1, 12);

    upsertEnvLine(envPath, "ADMIN_UNLOCK_PASSWORD", hash);

    console.log(`✅ ADMIN_UNLOCK_PASSWORD updated in ${envPath}`);
    console.log("   The hash starts with:", hash.slice(0, 10) + "...");
    console.log("\n   Restart the server for the new password to take effect.");
    console.log("   sudo systemctl restart equiprofile\n");
  } finally {
    rl.close();
  }
}

async function cmdCheckAdminPassword() {
  const stored = process.env.ADMIN_UNLOCK_PASSWORD;
  if (!stored) {
    console.error("❌ ADMIN_UNLOCK_PASSWORD is not set in the environment.");
    process.exit(1);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const pwd = await ask(rl, "Enter password to check: ", true);
    let valid = false;
    if (stored.startsWith("$2a$") || stored.startsWith("$2b$")) {
      valid = await bcrypt.compare(pwd, stored);
    } else {
      valid = pwd === stored;
    }
    console.log(
      valid ? "\n✅ Password is CORRECT.\n" : "\n❌ Password is INCORRECT.\n",
    );
    process.exit(valid ? 0 : 1);
  } finally {
    rl.close();
  }
}

// Main
const [, , cmd] = process.argv;

switch (cmd) {
  case "set-admin-password":
    cmdSetAdminPassword().catch((e) => {
      console.error("Error:", e);
      process.exit(1);
    });
    break;
  case "check-admin-password":
    cmdCheckAdminPassword().catch((e) => {
      console.error("Error:", e);
      process.exit(1);
    });
    break;
  default:
    console.log(`
EquiProfile CLI

Commands:
  set-admin-password    Prompt for a new admin password, bcrypt-hash it, and write to .env
  check-admin-password  Verify a password against ADMIN_UNLOCK_PASSWORD

Usage:
  node dist/cli.js set-admin-password
  node dist/cli.js check-admin-password
`);
    process.exit(0);
}
