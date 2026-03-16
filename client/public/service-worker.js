// Service Worker with proper caching strategy
// Version based on package.json version
// NOTE: Update CACHE_VERSION when deploying new versions to force cache refresh
// Version automatically synced from package.json via scripts/update-sw-version.js
// Runs as part of the build process (npm run build:sw)
const CACHE_VERSION = '1.0.0';
const CACHE_NAME = `equiprofile-v${CACHE_VERSION}`;

// Assets that should be cached (hashed assets only)
const STATIC_CACHE_URLS = [
  // Hashed assets will be cached on-demand with cache-first strategy
];

// Install service worker and prepare cache
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing version", CACHE_VERSION);
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Cache opened");
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        // Take control immediately
        return self.skipWaiting();
      }),
  );
});

// Activate and clean old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating version", CACHE_VERSION);
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[Service Worker] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      }),
  );
});

// Fetch strategy: network-first for HTML and API, cache-first for hashed assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // API requests: always network, never cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request));
    return;
  }

  // index.html and service-worker.js: always network-first, never cache
  if (
    url.pathname === "/" ||
    url.pathname === "/index.html" ||
    url.pathname.includes("service-worker")
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Don't cache these files
          return response;
        })
        .catch(() => {
          // If offline and we have a cached version, use it
          return caches.match("/index.html");
        }),
    );
    return;
  }

  // Hashed assets (/assets/*): cache-first with immutable strategy
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(request).then((networkResponse) => {
            // Only cache successful responses
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      }),
    );
    return;
  }

  // Everything else: network-first
  event.respondWith(
    fetch(request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        // Try to serve from cache if offline
        return caches.match(request);
      }),
  );
});

// Handle push notifications
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "New notification",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "View",
      },
      {
        action: "close",
        title: "Close",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification("EquiProfile", options));
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"));
  }
});

// Listen for messages from clients
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
