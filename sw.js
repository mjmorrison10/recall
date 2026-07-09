/* RECALL service worker — app-shell caching for offline use.
 *
 * RECALL is fully client-side: transcripts live in localStorage, the only
 * network resources are the HTML/manifest/icons. So the strategy is dead simple:
 *   - Pre-cache the app shell on install.
 *   - Cache-first for every GET; refresh in the background.
 *   - If both cache and network fail, fall back to the cached index.html so
 *     the app still launches from a cold offline state.
 */
var CACHE = 'recall-shell-v12';
var APP_SHELL = [
  './',
  './index.html',
  './howto.html',
  './style.css',
  './app.js',
  './llm.js',
  './topclips-patterns.js',
  './topclips.js',
  './manifest.json',
  './logo.png',
  './icons/icon-180.png',
  './icons/icon-167.png',
  './icons/icon-152.png',
  './icons/icon-120.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(APP_SHELL); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      var network = fetch(e.request).then(function (res) {
        if (res && res.ok && new URL(e.request.url).origin === self.location.origin) {
          var clone = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, clone); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || network;
    })
  );
});
