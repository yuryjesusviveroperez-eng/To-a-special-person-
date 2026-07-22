/* =========================================================
   NUESTRO UNIVERSO ❤️ — sw.js
   Service Worker: caché del "app shell" para que la página
   cargue instantáneo en visitas repetidas y funcione offline.
   No intercepta archivos de audio (.mp3/.m4a) para no interferir
   con la lógica de reintento de script.js si falta un archivo.
   Tampoco intercepta dominios externos (Firebase, Google Fonts),
   para que el chat en vivo siempre pida datos frescos a la red.
========================================================= */

const CACHE_VERSION = 'v3';
const CACHE_NAME = 'universo-scarleth-' + CACHE_VERSION;

const ARCHIVOS_ESENCIALES = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
];

const EXTENSIONES_IGNORADAS = ['.mp3', '.m4a', '.wav', '.ogg'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(
        ARCHIVOS_ESENCIALES.map(url =>
          cache.add(url).catch(() => { /* si algo no existe todavía, seguimos sin romper la instalación */ })
        )
      )
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(nombres => Promise.all(nombres.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // fuentes/CDNs externos (incluye Firebase): tal cual, sin interceptar
  if (EXTENSIONES_IGNORADAS.some(ext => url.pathname.toLowerCase().endsWith(ext))) return;

  if (request.mode === 'navigate') {
    // Documento HTML: red primero (para recibir actualizaciones),
    // con la copia en caché como respaldo si no hay conexión.
    event.respondWith(
      fetch(request)
        .then(respuesta => {
          const copia = respuesta.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copia));
          return respuesta;
        })
        .catch(() => caches.match(request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // CSS/JS/otros: responde desde caché al instante y actualiza en segundo plano.
  event.respondWith(
    caches.match(request).then(enCache => {
      const actualizarEnRed = fetch(request)
        .then(respuesta => {
          if (respuesta && respuesta.status === 200) {
            const copia = respuesta.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copia));
          }
          return respuesta;
        })
        .catch(() => enCache);
      return enCache || actualizarEnRed;
    })
  );
});
