import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig, Plugin } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

// Plugin to inject version into service worker
function injectServiceWorkerVersion(): Plugin {
  return {
    name: 'inject-service-worker-version',
    apply: 'build',
    generateBundle() {
      const packageJsonPath = path.resolve(import.meta.dirname, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const version = packageJson.version || '1.0.0';
      
      const swPath = path.resolve(import.meta.dirname, 'client/public/service-worker.js');
      if (fs.existsSync(swPath)) {
        let swContent = fs.readFileSync(swPath, 'utf-8');
        // Replace CACHE_VERSION value with actual version from package.json
        swContent = swContent.replace(
          /const CACHE_VERSION = ['"]([^'"]+)['"]/,
          `const CACHE_VERSION = '${version}'`
        );
        
        // Write to the output directory
        this.emitFile({
          type: 'asset',
          fileName: 'service-worker.js',
          source: swContent
        });
      }
    }
  };
}

const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), injectServiceWorkerVersion()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
