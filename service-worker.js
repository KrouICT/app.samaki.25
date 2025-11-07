self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("school-cache-v1").then(cache => cache.addAll([
      "/",
      "/index.html",
      "/style.css",
      "/script.js",
      "/icons/icon-192.png"
    ]))
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
