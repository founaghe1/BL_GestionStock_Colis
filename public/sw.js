// Service Worker de base pour PWA généré par Copilot
const CACHE_NAME = 'stock-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // '/styles.css',
  '/app.js',
  '/icon-192.png',
  '/icon-512.png',
  // Ajoutez ici d'autres ressources à mettre en cache si besoin
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      )
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
