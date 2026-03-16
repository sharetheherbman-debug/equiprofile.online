#!/usr/bin/env node
/**
 * Runtime Verification Script
 * Checks that all prerequisites are met for running the application
 */

import { existsSync } from "fs";
import { resolve } from "path";
import { createRequire } from "module";
import net from "net";

const require = createRequire(import.meta.url);

let exitCode = 0;

const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => {
    console.error(`❌ ${msg}`);
    exitCode = 1;
  },
  warn: (msg) => console.warn(`⚠️  ${msg}`),
};

console.log("🔍 Verifying runtime environment...\n");

// 1. Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0]);

if (majorVersion >= 18) {
  log.success(`Node.js version: ${nodeVersion}`);
} else {
  log.error(
    `Node.js version ${nodeVersion} is too old. Minimum required: 18.x`,
  );
}

// 2. Check required files exist
const requiredFiles = [
  "dist/index.js",
  "dist/public/index.html",
  "package.json",
];

console.log("\n📁 Checking required files...");
requiredFiles.forEach((file) => {
  const filePath = resolve(process.cwd(), file);
  if (existsSync(filePath)) {
    log.success(`Found: ${file}`);
  } else {
    log.error(`Missing: ${file}`);
  }
});

// 3. Check package.json
try {
  const packageJson = require(resolve(process.cwd(), "package.json"));
  log.success(`Package: ${packageJson.name}@${packageJson.version}`);
} catch (err) {
  log.error("Failed to read package.json");
}

// 4. Check environment file
console.log("\n⚙️  Checking configuration...");
const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  log.success("Environment file (.env) exists");
} else {
  log.warn("No .env file found (will use .env.default if in development)");
}

// 5. Check port availability
const checkPort = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
};

// Main async function
async function main() {
  console.log("\n🔌 Checking port availability...");
  const port = parseInt(process.env.PORT || "3000");

  const available = await checkPort(port);
  if (available) {
    log.success(`Port ${port} is available`);
  } else {
    log.error(`Port ${port} is already in use`);
    log.info("Note: Port may become available before server starts");
  }

  // 6. Check dist directory structure
  console.log("\n📦 Checking build output...");
  const distChecks = [
    { path: "dist/index.js", desc: "Server bundle" },
    { path: "dist/public", desc: "Public directory" },
    { path: "dist/public/index.html", desc: "Frontend entry" },
  ];

  distChecks.forEach(({ path, desc }) => {
    if (existsSync(resolve(process.cwd(), path))) {
      log.success(`${desc}: ${path}`);
    } else {
      log.error(`${desc} missing: ${path}`);
    }
  });

  // 7. Check file permissions (Unix-like systems only)
  if (process.platform !== "win32") {
    console.log("\n🔐 Checking permissions...");
    try {
      const distIndexPath = resolve(process.cwd(), "dist/index.js");
      if (existsSync(distIndexPath)) {
        // Just check if file is readable
        const { access, constants } = await import("fs/promises");
        await access(distIndexPath, constants.R_OK);
        log.success("Build files are readable");
      }
    } catch (err) {
      log.error("Build files are not readable");
    }
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  if (exitCode === 0) {
    console.log("✅ All runtime checks passed!");
    console.log("Ready to start the application.\n");
  } else {
    console.log("❌ Some checks failed!");
    console.log("Please fix the issues above before starting.\n");
  }

  process.exit(exitCode);
}

// Run main function
main().catch((err) => {
  log.error(`Unexpected error: ${err.message}`);
  process.exit(1);
});
