/**
 * Service Worker Registration Bootstrap
 *
 * This module handles service worker registration for PWA functionality.
 * Extracted from inline script to comply with Content Security Policy.
 *
 * When PWA is disabled (the default), any previously-registered service
 * workers are unregistered immediately.  A stale SW from a prior deploy
 * can intercept network requests and serve cached HTML/JS with a mismatched
 * CSP nonce, causing a blank white screen.  Unregistering on every page
 * load (when PWA is off) permanently eliminates that failure mode.
 */

export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  // PWA is always enabled in production; in development only when explicitly set
  const isProd = import.meta.env.PROD;
  const explicitlyEnabled = import.meta.env.VITE_PWA_ENABLED === "true";

  if (isProd || explicitlyEnabled) {
    // Register the service worker for PWA functionality.
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          if (import.meta.env.DEV) {
            console.log("[SW] Registration successful");
          }

          // Check for updates periodically - keep reference so we can clear on unload
          const updateInterval = setInterval(() => {
            registration.update().catch((err: unknown) => {
              // InvalidStateError is expected when the SW registration is
              // superseded or unregistered — suppress it silently.
              if ((err as DOMException)?.name !== "InvalidStateError") {
                console.warn("[SW] Update check failed:", err);
              }
            });
          }, 60000); // Check every minute

          // Clean up interval when the page is unloaded to prevent leaks
          window.addEventListener(
            "beforeunload",
            () => clearInterval(updateInterval),
            { once: true },
          );
        })
        .catch((err) => {
          console.warn("[SW] Registration failed: ", err);
        });
    });
  } else {
    // PWA is disabled.  Unregister every existing service worker so that
    // stale workers from previous deployments cannot intercept requests and
    // serve outdated HTML or assets (which would produce a blank screen).
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then((success) => {
            if (success && import.meta.env.DEV) {
              console.log(
                "[SW] Unregistered stale service worker:",
                registration.scope,
              );
            }
          });
        }
      })
      .catch((err) => {
        console.warn("[SW] Could not enumerate registrations:", err);
      });
  }
}
