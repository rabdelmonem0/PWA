// items to cache
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

const FILES_TO_CACHE = [
  "/",
  "/db.js",
  "/index.html",
  "/index.js",
  "/manifest.json",
  "/style.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "https://cdn.jsdelivr.net/npm/chart.js@2.8.0",
  "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
];


// install the service worker
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(DATA_CACHE_NAME).then((cache) => cache.add("/api/transaction"))
  );
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// activate the service worker 
self.addEventListener("activate", (e) => {
    e.waitUntil(
      caches.keys().then((keylist) => {
        return Promise.all(
          keylist.map((key) => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
    self.clients.claim();
  });

// cache all the get requests and activate service worker
self.addEventListener("fetch", (e) => {
  // check if there's an api route
  if (e.request.url.includes("/api/")) {
    e.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(e.request)
            .then((response) => {
              if (response.status === 200) {
                cache.put(e.request, response.clone());
              }

              return response;
            })
            .catch((err) => {
              return cache.match(evt.request);
            });
        })
        .catch((err) => console.log(err))
    );
  } else {
    e.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(e.request).then((response) => {
          return response || fetch(e.request);
        });
      })
    );
  }
});
