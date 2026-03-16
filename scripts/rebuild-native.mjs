#!/usr/bin/env node
/**
 * Native Module Rebuild Script
 * Rebuilds native dependencies (bcrypt, etc.) for the current platform
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { resolve } from "path";

console.log("🔧 Rebuilding native modules...\n");

// List of native modules to rebuild
const nativeModules = ["bcrypt"];

const packageJsonPath = resolve(process.cwd(), "package.json");

if (!existsSync(packageJsonPath)) {
  console.error("❌ package.json not found in current directory");
  process.exit(1);
}

// Check which modules are installed
const packageJson = JSON.parse(
  require("fs").readFileSync(packageJsonPath, "utf-8"),
);

const dependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

const installedNativeModules = nativeModules.filter((mod) => dependencies[mod]);

if (installedNativeModules.length === 0) {
  console.log("ℹ️  No native modules found to rebuild");
  process.exit(0);
}

console.log(`Found ${installedNativeModules.length} native module(s):`);
installedNativeModules.forEach((mod) => console.log(`  - ${mod}`));
console.log("");

// Detect platform
const platform = process.platform;
const arch = process.arch;

console.log(`Platform: ${platform} ${arch}`);
console.log("");

// Rebuild each module
let success = 0;
let failed = 0;

for (const moduleName of installedNativeModules) {
  try {
    console.log(`📦 Rebuilding ${moduleName}...`);

    // Try pnpm rebuild first, fallback to npm
    try {
      execSync(`pnpm rebuild ${moduleName}`, {
        stdio: "inherit",
        cwd: process.cwd(),
      });
    } catch (pnpmErr) {
      console.log("   pnpm not available, trying npm...");
      execSync(`npm rebuild ${moduleName}`, {
        stdio: "inherit",
        cwd: process.cwd(),
      });
    }

    console.log(`✅ ${moduleName} rebuilt successfully\n`);
    success++;
  } catch (err) {
    console.error(`❌ Failed to rebuild ${moduleName}`);
    console.error(`   ${err.message}\n`);
    failed++;
  }
}

// Summary
console.log("=".repeat(50));
console.log(`✅ Success: ${success}`);
if (failed > 0) {
  console.log(`❌ Failed: ${failed}`);
}
console.log("");

if (failed > 0) {
  console.log("⚠️  Some modules failed to rebuild.");
  console.log("   This may cause runtime errors.");
  console.log("   Try running: pnpm install --force");
  process.exit(1);
} else {
  console.log("✅ All native modules rebuilt successfully!");
  process.exit(0);
}
