#!/usr/bin/env node
// scripts/check-pkg.mjs
// Validates package.json dependency specs are all non-empty strings.
// Fails fast (exit 1) if any invalid entry is found.
// Usage: node scripts/check-pkg.mjs

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgPath = resolve(__dirname, "..", "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

const sections = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
];
let invalid = 0;

for (const section of sections) {
  const entries = pkg[section];
  if (!entries) continue;
  for (const [name, spec] of Object.entries(entries)) {
    if (typeof spec !== "string" || spec.trim() === "") {
      console.error(
        `❌  ${section}["${name}"] has invalid spec: ${JSON.stringify(spec)}`,
      );
      invalid++;
    }
  }
}

if (invalid > 0) {
  console.error(
    `\n${invalid} invalid dependency spec(s) found in package.json.`,
  );
  console.error("Fix or remove them before deploying.\n");
  process.exit(1);
} else {
  console.log("✅  All dependency specs in package.json are valid.");
}
