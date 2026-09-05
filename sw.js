/* TC/OS service worker — offline-first app shell.
 *
 * HOW IT WORKS: on the first online visit this caches the whole shell in
 * the background. Every later visit (online or OFFLINE) is served from
 * cache, with fresh copies re-downloaded when the network is available.
 *
 * WHEN YOU SHIP: bump CACHE_NAME below (v1 -> v2 ...). Old caches are
 * deleted automatically on activate. If you bump ?v= query strings in
 * index.html, mirror the new URLs in PRECACHE too (query strings are
 * part of the cache key).
 */
var CACHE_NAME = 'tcos-v6';

var PRECACHE = [
  '/',
  '/index.html',
  '/404.html',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
  '/tflows.html',
  '/samples/index.html',
  '/samples/shop.html',
  '/samples/portfolio.html',
  '/samples/notepad.html',
  '/samples/playground.html',
  '/samples/taskify.html',
  '/images/favicon.ico',
  '/images/workshop.png',
  '/images/workshop-nobg.png',
  '/images/developer-coding-7680x4320-13642.png',
  '/images/samples.png',
  '/images/port.png',
  '/images/taskifysc.png',
  '/images/playground.png',
  '/images/notepadsc.png',
  '/images/taskify-logo.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/images/wallpaper-1920.jpg',
  '/images/wallpaper-1920.webp',
  '/images/wallpaper-828.jpg',
  '/images/wallpaper-828.webp',
  '/images/new-notification-022-370046.mp3',
  '/images/Microsoft Windows XP Startup Sound.mp3',
  '/images/Cadizal Resume.pdf',
  '/images/resume.pdf',
  '/visual/tokens.css?v=3',
  '/visual/boot.css?v=3',
  '/visual/desktop.css?v=3',
  '/visual/windows.css?v=3',
  '/visual/apps.css?v=3',
  '/visual/taskbar.css?v=3',
  '/visual/power.css?v=3',
  '/visual/taskmanager.css?v=3',
  '/visual/notifications.css?v=3',
  '/visual/calculator.css?v=3',
  '/visual/notepad.css?v=3',
  '/visual/settings.css?v=3',
  '/visual/responsive.css?v=3',
  '/visual/device.css?v=2',
  '/scripts/theme-init.js?v=3',
  '/scripts/data.js?v=3',
  '/scripts/apps.js?v=3',
  '/scripts/fs.js?v=1',
  '/scripts/desktop.js?v=3',
  '/scripts/shell.js?v=3',
  '/scripts/notifications.js?v=3',
  '/scripts/device.js?v=3',
  '/scripts/prefs.js?v=3',
  '/scripts/mobile.js?v=3',
  '/scripts/boot.js?v=3'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      /* allSettled: one bad URL must not fail the whole install */
      return Promise.all(
        PRECACHE.map(function (url) {
          return cache.add(url).catch(function () {});
        })
      );
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
            .map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

function staleWhileRevalidate(req) {
  return caches.open(CACHE_NAME).then(function (cache) {
    return cache.match(req).then(function (hit) {
      var fresh = fetch(req).then(function (res) {
        var isCacheable = res && (res.status === 200 || res.type === 'opaque');
        var isPartialRequest = req.headers.get('range');
        if (isCacheable && !isPartialRequest) {
          cache.put(req, res.clone()).catch(function () {});
        }
        return res;
      }).catch(function () { return hit; });
      return hit || fresh;
    });
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);

  /* navigations: network first, fall back to cached shell offline */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(function () {
        return caches.match('/index.html').then(function (hit) {
          return hit || Response.error();
        });
      })
    );
    return;
  }

  /* same-origin static + fonts: serve cache instantly, refresh behind */
  if (url.origin === self.location.origin ||
      url.hostname === 'fonts.googleapis.com' ||
      url.hostname === 'fonts.gstatic.com') {
    e.respondWith(staleWhileRevalidate(req));
  }
});
