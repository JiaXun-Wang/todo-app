var CACHE_NAME = 'todo-app-v1';
var STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/globals.js',
  '/auth.js',
  '/admin.js',
  '/theme.js',
  '/cloud-sync.js',
  '/subtasks.js',
  '/announcements.js',
  '/change-password.js',
  '/todo.js',
  '/game.js',
  '/profile.js',
  '/init.js',
  '/manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS).catch(function() {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; }).map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // Only handle http/https requests (skip chrome-extension, etc.)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Only handle requests to our own origin
  if (url.hostname !== location.hostname && url.hostname !== 'unpkg.com') return;

  // API calls: network-first
  if (url.pathname.indexOf('/api/') === 0) {
    event.respondWith(
      fetch(event.request).catch(function() {
        return new Response(JSON.stringify({ error: 'You are offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // PeerJS CDN: network-first
  if (url.hostname === 'unpkg.com') {
    event.respondWith(
      fetch(event.request).catch(function() { return caches.match(event.request); })
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      var fetchPromise = fetch(event.request).then(function(response) {
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
        }
        return response;
      });
      return cached || fetchPromise;
    })
  );
});
