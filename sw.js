/* mubaFM service worker: offline app shell.
   - Same-origin files: network first (so a new deploy shows up immediately), cached copy when offline.
   - Google Fonts: stale-while-revalidate.
   - Everything else, including every live radio stream, is left completely alone.
   Bump CACHE when you want to force old caches to be dropped. */
const CACHE = 'mubaFM-v4';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest',
  'css/styles.css', 'js/stations.js', 'js/app.js',
  'icons/favicon.svg', 'icons/icon-192.png',
];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => Promise.all(SHELL.map(url => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then(hit => hit || (request.mode === 'navigate' ? caches.match('index.html') : undefined)))
    );
    return;
  }

  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(request).then(hit => {
          const refresh = fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          }).catch(() => hit);
          return hit || refresh;
        })
      )
    );
  }
  // anything else (radio streams, analytics, etc.) is not intercepted
});
