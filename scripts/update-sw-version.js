#!/usr/bin/env node
/**
 * Update Service Worker Version
 *
 * This script automatically updates the CACHE_VERSION constant in the service worker
 * file to match the version in package.json. This ensures the service worker cache
 * is properly invalidated when deploying new versions.
 *
 * Usage: node scripts/update-sw-version.js
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = join(__dirname, "..");
const PACKAGE_JSON_PATH = join(ROOT_DIR, "package.json");
const SERVICE_WORKER_PATH = join(ROOT_DIR, "client/public/service-worker.js");

try {
  // Read package.json to get the version
  const packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH, "utf8"));
  const version = packageJson.version;

  if (!version) {
    console.error("❌ Error: version field not found in package.json");
    process.exit(1);
  }

  console.log(`📦 Package version: ${version}`);

  // Read service worker file
  let serviceWorkerContent = readFileSync(SERVICE_WORKER_PATH, "utf8");

  // Replace the CACHE_VERSION constant
  // Match: const CACHE_VERSION = 'any version string';
  const versionRegex = /const CACHE_VERSION = ['"][^'"]+['"];/;
  const newVersionLine = `const CACHE_VERSION = '${version}';`;

  if (!versionRegex.test(serviceWorkerContent)) {
    console.error(
      "❌ Error: Could not find CACHE_VERSION constant in service-worker.js",
    );
    console.error(
      '   Expected format: const CACHE_VERSION = "version"; where version matches your package.json version',
    );
    process.exit(1);
  }

  const updatedContent = serviceWorkerContent.replace(
    versionRegex,
    newVersionLine,
  );

  // Write the updated content back
  writeFileSync(SERVICE_WORKER_PATH, updatedContent, "utf8");

  console.log(`✅ Service worker version updated to ${version}`);
  console.log(`   File: ${SERVICE_WORKER_PATH}`);
} catch (error) {
  console.error("❌ Error updating service worker version:", error.message);
  process.exit(1);
}
