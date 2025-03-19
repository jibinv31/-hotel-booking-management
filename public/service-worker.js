const CACHE_NAME = "stayease-cache-v1";
const ASSETS_TO_CACHE = [
    "/",
    "/manifest.json",
    "/service-worker.js",
    "/css/style.css",
    "/css/auth.css",
    "/css/rooms.css",
    "/css/booking.css",
    "/css/payments.css",
    "/icons/web-app-manifest-192x192.png",
    "/icons/web-app-manifest-512x512.png",
    "/icons/favicon-96x96.png",
    "/screenshots/homepage.png",
    "/screenshots/login.png",
    "/screenshots/signup.png",
    "/screenshots/rooms.png",
    "/screenshots/bookings.png",
    "/screenshots/payments.png",
    "/screenshots/contact.png",
    "/screenshots/admin-dashboard.png",
    "/fallback.html"  // ✅ Ensure this file is cached
];

// ✅ Install Service Worker & Cache Files
self.addEventListener("install", (event) => {
    console.log("✅ Service Worker Installed");

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("✅ Caching assets...");
            return cache.addAll(ASSETS_TO_CACHE).catch((error) => {
                console.error("❌ Cache failed:", error);
            });
        })
    );
});

// ✅ Activate Service Worker & Clean Old Caches
self.addEventListener("activate", (event) => {
    console.log("✅ Service Worker Activated");

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((cache) => cache !== CACHE_NAME).map((cache) => caches.delete(cache))
            );
        })
    );
});

// ✅ Fetch Event - Serve Cached Files or Show Fallback for Navigation Requests
self.addEventListener("fetch", (event) => {
    console.log("➡️ Fetching:", event.request.url);

    // Check if it's a navigation request
    if (event.request.mode === "navigate") {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    return networkResponse;
                })
                .catch(() => {
                    console.warn("⚠️ Network request failed. Serving fallback.");
                    return caches.match("/fallback.html");
                })
        );
    } else {
        // Handle other requests normally
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                return cachedResponse || fetch(event.request)
                    .then((networkResponse) => {
                        // ✅ Clone Response & Store in Cache
                        let responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });

                        return networkResponse;
                    })
                    .catch(() => {
                        console.warn("⚠️ Network request failed, returning fallback for other requests.");
                        return caches.match("/fallback.html");
                    });
            })
        );
    }
});
