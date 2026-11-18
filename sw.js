/* Control  · Ghønim — Service Worker
   تم التصميم والبرمجة بواسطة المهندس / محمد غنيم
   Developed & Engineered by Mohamed Ghonim
   Strategy: network-first for the app's own files (updates appear on next open),
   cache fallback when offline. */
const CACHE = 'kreativ-v1';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(CORE.map(u => c.add(new Request(u, {cache: 'reload'}))))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || /\/(status|cmd)$/.test(u.pathname)) return; // never touch ESP32 API
  const same = u.origin === location.origin;
  e.respondWith(
    fetch(e.request, same ? {cache: 'no-cache'} : undefined).then(r => {
      if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
      return r;
    }).catch(() => caches.match(e.request).then(h => h || caches.match('./index.html')))
  );
});
