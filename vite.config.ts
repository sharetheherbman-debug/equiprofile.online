// Copyright (c) 2025-2026 Amarktai Network. All rights reserved.
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig, Plugin } from "vite";

// Check if PWA is enabled via environment variable
const PWA_ENABLED =
  process.env.VITE_PWA_ENABLED === "true" || process.env.ENABLE_PWA === "true";

// Plugin to inject version into service worker (only if PWA is enabled)
function injectServiceWorkerVersion(): Plugin {
  return {
    name: "inject-service-worker-version",
    apply: "build",
    generateBundle() {
      // Only generate service worker if PWA is enabled
      if (!PWA_ENABLED) {
        console.log("⚠️  PWA disabled - service worker will NOT be generated");
        console.log("   To enable: set ENABLE_PWA=true in .env");
        return;
      }

      const packageJsonPath = path.resolve(import.meta.dirname, "package.json");
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      const version = packageJson.version || "1.0.0";

      const swPath = path.resolve(
        import.meta.dirname,
        "client/public/service-worker.js",
      );
      if (fs.existsSync(swPath)) {
        let swContent = fs.readFileSync(swPath, "utf-8");
        // Replace CACHE_VERSION value with actual version from package.json
        swContent = swContent.replace(
          /const CACHE_VERSION = ['"]([^'"]+)['"]/,
          `const CACHE_VERSION = '${version}'`,
        );

        // Write to the output directory
        this.emitFile({
          type: "asset",
          fileName: "service-worker.js",
          source: swContent,
        });

        console.log(`✓ Service worker generated (version: ${version})`);
      } else {
        console.log("⚠️  Service worker source not found at:", swPath);
      }
    },
  };
}

const plugins = [react(), tailwindcss(), injectServiceWorkerVersion()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      mermaid: path.resolve(
        import.meta.dirname,
        "node_modules/mermaid/dist/mermaid.core.mjs",
      ),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  optimizeDeps: {
    include: ["mermaid"],
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Only split truly heavy, infrequently-used libraries into separate
          // chunks.  Eagerly-loaded framework packages (React, Radix, framer,
          // i18n, tRPC, TanStack Query …) are intentionally NOT assigned here.
          // Splitting them caused Rollup to place shared CJS-interop helpers
          // in different chunks, creating circular dependencies that made
          // React undefined at module-init time and crashed the app with:
          //   "Cannot read properties of undefined (reading 'createContext')"
          //
          // PDF/export (rarely used, lazy-loaded)
          if (
            id.includes("node_modules/jspdf") ||
            id.includes("node_modules/html2canvas") ||
            id.includes("node_modules/qrcode")
          ) {
            return "export-utils";
          }
          // tsParticles (heavy, optional)
          if (
            id.includes("node_modules/@tsparticles") ||
            id.includes("node_modules/tsparticles")
          ) {
            return "tsparticles";
          }
        },
      },
    },
  },
  server: {
    host: true,
    allowedHosts: [".equiprofile.online", "localhost", "127.0.0.1"],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
