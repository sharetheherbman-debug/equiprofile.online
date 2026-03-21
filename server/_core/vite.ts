import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  // SPA fallback for development - serve index.html for non-static routes
  app.use((req, res, next) => {
    // Skip if it's an API route, tRPC route, or static asset
    if (
      req.originalUrl.startsWith("/api/") ||
      req.originalUrl.startsWith("/trpc") ||
      req.originalUrl.startsWith("/assets/") ||
      req.originalUrl.match(/\.[a-z0-9]+$/i)
    ) {
      return next();
    }

    const url = req.originalUrl;

    (async () => {
      try {
        const clientTemplate = path.resolve(
          import.meta.dirname,
          "../..",
          "client",
          "index.html",
        );

        // always reload the index.html file from disk incase it changes
        let template = await fs.promises.readFile(clientTemplate, "utf-8");
        template = template.replace(
          `src="/src/main.tsx"`,
          `src="/src/main.tsx?v=${nanoid()}"`,
        );

        // Transform first so Vite plugins can inject their own inline <script> blocks.
        const rawPage = await vite.transformIndexHtml(url, template);

        res.status(200).set({ "Content-Type": "text/html" }).end(rawPage);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    })();
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // File extensions that should NOT fall through to SPA
  const STATIC_FILE_EXTENSIONS = [
    ".js",
    ".css",
    ".json",
    ".map",
    ".woff",
    ".woff2",
    ".svg",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".ico",
    ".txt",
    ".webm",
  ];

  // Serve static files with explicit MIME types and cache headers.
  // index:false prevents express.static from auto-serving dist/public/index.html
  // for the "/" route — all HTML delivery goes through the SPA fallback below.
  //
  // Redirect direct requests to /index.html so they also go through the SPA fallback.
  app.use((req, _res, next) => {
    if (req.path === "/index.html") {
      req.url = "/";
    }
    next();
  });

  app.use(
    express.static(distPath, {
      index: false,
      setHeaders: (res, filePath) => {
        // Ensure correct MIME types for assets
        if (filePath.endsWith(".js")) {
          res.setHeader("Content-Type", "application/javascript");
        } else if (filePath.endsWith(".css")) {
          res.setHeader("Content-Type", "text/css");
        } else if (filePath.endsWith(".json")) {
          res.setHeader("Content-Type", "application/json");
        } else if (filePath.endsWith(".woff")) {
          res.setHeader("Content-Type", "font/woff");
        } else if (filePath.endsWith(".woff2")) {
          res.setHeader("Content-Type", "font/woff2");
        } else if (filePath.endsWith(".svg")) {
          res.setHeader("Content-Type", "image/svg+xml");
        }

        // Cache control headers
        // service-worker.js must not be cached (stale SW breaks offline functionality)
        if (filePath.endsWith("service-worker.js")) {
          res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
          res.setHeader("Content-Type", "application/javascript");
          res.setHeader("Service-Worker-Allowed", "/");
        } else if (filePath.includes("/assets/")) {
          // Hashed assets: aggressive caching (immutable)
          // Note: filePath is resolved by express.static, so this safely matches /assets/ directory
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    }),
  );

  // SPA fallback - serve index.html for all navigation requests.
  // NOTE: express.static above is configured with index:false so directory
  // requests (e.g. "/") fall through to here.
  app.use((req, res, next) => {
    // Skip if it's an API or tRPC route — must never serve HTML for these
    if (
      req.originalUrl.startsWith("/api/") ||
      req.originalUrl.startsWith("/trpc")
    ) {
      return next();
    }

    // Don't fallback to index.html for asset paths or files with extensions
    const isStaticFile =
      req.originalUrl.startsWith("/assets/") ||
      STATIC_FILE_EXTENSIONS.some((ext) => req.originalUrl.endsWith(ext));

    if (isStaticFile) {
      return res.status(404).send("Not Found");
    }

    // index.html must never be cached so users always get the latest version
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const indexPath = path.resolve(distPath, "index.html");
    res.sendFile(indexPath);
  });
}
