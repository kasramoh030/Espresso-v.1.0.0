/* Espresso A1 — service worker (offline app shell) */
const CACHE = 'espresso-a1-v1-1';
const ASSETS = [
  './', './index.html', './css/app.css', './js/ui.js', './js/native-tts.js', './js/spelling.js', './js/community.js', './js/ads-web-config.js', './js/ads-web.js', './js/ads.js', './js/bazaar.js', './js/app.js', './manifest.webmanifest',
  './fonts/Vazirmatn-Regular.woff2', './fonts/Vazirmatn-Medium.woff2', './fonts/Vazirmatn-Bold.woff2',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png',
  './data/lesson01.js', './data/lesson02.js', './data/lesson03.js', './data/lesson04.js', './data/lesson05.js',
  './data/lesson06.js', './data/lesson07.js', './data/lesson08.js', './data/lesson09.js', './data/lesson10.js',
  './data/reviews.js', './data/verbs.js', './data/sentences.js',
  './js/sentences.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()).catch(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
