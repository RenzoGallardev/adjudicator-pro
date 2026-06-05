// Le cambiamos el nombre a v2 para que el navegador sepa que hay una actualización
const CACHE_NAME = "adjudicator-pro-v2"; 
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./logo.png",
  "./manifest.json"
];

// Instala el nuevo Service Worker y salta la espera
self.addEventListener("install", event => {
  self.skipWaiting(); // Obliga a la app a actualizarse inmediatamente
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Activa el nuevo Service Worker y DESTRUYE la caché vieja
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Si el nombre de la caché no es la V2, la borra
          if (cacheName !== CACHE_NAME) {
            console.log("Borrando caché antigua:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Toma el control de la página al instante
});

// Responde a las peticiones (offline support)
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Intenta obtener la versión más nueva de internet primero, si falla usa la caché
      return fetch(event.request).catch(() => response);
    })
  );
});