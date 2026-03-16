#!/usr/bin/env node
/**
 * scripts/validate-routes.mjs
 *
 * Build-time guard: scans TypeScript server sources for Express route patterns
 * that are incompatible with Express 5 + path-to-regexp 8.x.
 *
 * The following patterns crash at startup with:
 *   PathError: Missing parameter name at index N
 *
 *   • app.all("/api/*", ...)       — bare wildcard
 *   • app.use("/api/*", ...)       — bare wildcard in middleware mount
 *   • app.all("/api/:path(.*)", …) — regex-capture group in param name
 *   • router.use("/api/:path(", …) — same via Router
 *
 * Acceptable replacements:
 *   app.all(new RegExp("^/api/"), handler)  — RegExp (bypasses path-to-regexp)
 *   app.all("/api/*path", handler)          — named wildcard (Express 5 syntax)
 *
 * Usage:
 *   node scripts/validate-routes.mjs          # check server/**
 *   node scripts/validate-routes.mjs src/     # check specific directory
 *
 * Exit codes:
 *   0 – no invalid patterns found
 *   1 – one or more invalid patterns found (build should fail)
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { extname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..");

// Directories to scan (relative to project root)
const SCAN_DIRS = process.argv[2]
  ? [resolve(ROOT, process.argv[2])]
  : [join(ROOT, "server")];

// Patterns that are INVALID in Express 5 + path-to-regexp 8.x
// Each entry: { label, regex }
const INVALID_PATTERNS = [
  {
    label: 'bare wildcard route — use /^\\\/api\\\/.*/ or "/api/*path" instead',
    // matches: "/api/*"  "/api/*"  etc. (wildcard without a name following it)
    regex: /["'`]\/api\/\*["'`\s,)]/,
  },
  {
    label: "regex-capture param — use a RegExp route or named param instead",
    // matches: "/api/:path(.*)"  "/api/:anything(..."
    regex: /["'`]\/api\/:[\w]+\(/,
  },
];

let errors = 0;

/** Recursively collect .ts / .js files */
function collectFiles(dir) {
  const entries = readdirSync(dir);
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (
      stat.isDirectory() &&
      !entry.startsWith(".") &&
      entry !== "node_modules"
    ) {
      files.push(...collectFiles(full));
    } else if (
      stat.isFile() &&
      [".ts", ".js", ".mjs", ".cjs"].includes(extname(entry))
    ) {
      files.push(full);
    }
  }
  return files;
}

for (const dir of SCAN_DIRS) {
  const files = collectFiles(dir);

  for (const file of files) {
    const src = readFileSync(file, "utf8");
    const lines = src.split("\n");

    for (const { label, regex } of INVALID_PATTERNS) {
      lines.forEach((line, idx) => {
        // Skip comment lines
        if (/^\s*\/\//.test(line) || /^\s*\*/.test(line)) return;
        if (regex.test(line)) {
          const rel = file.replace(ROOT + "/", "");
          console.error(`\n❌  ${rel}:${idx + 1}`);
          console.error(`    ${line.trim()}`);
          console.error(`    ↳ ${label}`);
          errors++;
        }
      });
    }
  }
}

if (errors > 0) {
  console.error(
    `\n${errors} invalid Express route pattern(s) found in source.\n` +
      `Fix them before building to prevent startup crashes.\n` +
      `See comments in scripts/validate-routes.mjs for safe alternatives.\n`,
  );
  process.exit(1);
} else {
  console.log("✅  No invalid Express route patterns found in server sources.");
}
