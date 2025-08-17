const CACHE_NAME = "catalyst-pwa-v1";
const ASSETS = [
  "/mainapp_pwatest/",
  "/mainapp_pwatest/manifest.webmanifest",
  "/mainapp_pwatest/Calendar/Calendar.html",
  "/mainapp_pwatest/Login/signup.html",
  "/mainapp_pwatest/Login/login.html",
  "/mainapp_pwatest/icons/icon-192.png",
  "/mainapp_pwatest/icons/icon-512.png"
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k === CACHE_NAME ? null : caches.delete(k))));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        return await fetch(event.request);
      } catch (err) {
        const cache = await caches.open(CACHE_NAME);
        return await cache.match("/mainapp_pwatest/Login/signup.html") || await cache.match("/mainapp_pwatest/") || new Response("Offline", { status: 503 });
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(event.request);
    const networkPromise = fetch(event.request).then(res => {
      if (res && res.ok) cache.put(event.request, res.clone()).catch(() => {});
      return res;
    }).catch(() => null);
    return cached || (await networkPromise) || new Response(null, { status: 404 });
  })());
});
