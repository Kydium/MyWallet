// Service worker de My Wallet: guarda la app para que abra rápido y sin conexión.
// Los datos no pasan por aquí: Firebase los maneja directamente.
var VERSION = 'mywallet-v10';
var SHELL = ['./', 'index.html', 'app.js?v=10', 'firebase-config.js?v=10', 'manifest.json',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/names.json'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);

  // Archivos de la app: primero la red (para recibir actualizaciones), si no hay conexión, la copia guardada.
  if (url.origin === self.location.origin) {
    e.respondWith(fetch(new Request(req, {cache:'no-cache'})).then(function (res) {
      var copy = res.clone();
      caches.open(VERSION).then(function (c) { c.put(req, copy); });
      return res;
    }).catch(function () {
      return caches.match(req).then(function (r) { return r || caches.match('index.html'); });
    }));
    return;
  }

  // Librerías de Firebase y fuentes: primero la copia guardada.
  if (url.hostname === 'cdn.jsdelivr.net' || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(VERSION).then(function (c) { c.put(req, copy); });
        return res;
      });
    }));
  }
});
