/* EduTech Mindset Service Worker — v279 */
const VERSION = '279';
const CACHE_NAME = 'edutech-mindset-v' + VERSION;
const V = '?v=' + VERSION;
const APP_SHELL = [
  './',
  './index.html',
  './privacy.html',
  './offline.html',
  './manifest.json',
  './firebase-config.js',
  './assets/logo.png',
  './assets/icon-192.png',
  './css/tailwind.css' + V,
  './css/premium.css' + V,
  './css/redesign-v154.css' + V,
  './css/v171-polish.css' + V,
  './css/motion-v238.css' + V,
  './js/theme.js' + V,
  './js/core-utils.js' + V,
  './js/cloud.js' + V,
  './js/app.js' + V,
  './js/extras.js' + V,
  './js/ai.js' + V,
  './js/ai-admin.js' + V,
  './js/tools.js' + V,
  './js/books.js' + V,
  './js/media.js' + V,
  './js/learn.js' + V,
  './js/home.js' + V,
  './js/exam.js' + V,
  './js/master-hierarchy.js' + V,
  './js/emailauth.js' + V,
  './js/ticker.js' + V,
  './js/pwa.js' + V,
  './js/assistant.js' + V,
  './js/edutech-pro-pack.js' + V,
  './js/tools-hub.js' + V,
  './js/notifications.js' + V,
  './js/global-search.js' + V,
  './js/social-studio.js' + V,
  './js/tawjihi-gamify.js' + V,
  './js/module-loader.js' + V,
  './js/router.js' + V,
  './js/personal-hub.js' + V,
  './js/tts-client.js' + V,
  './js/voice-studio.js' + V,
  './js/teacher-kit.js' + V,
  './js/pro-suite-v257.js' + V,
  './js/fresh-drawer-music.js' + V,
  './js/student-teacher-pro.js' + V,
  './js/notebook-studio.js' + V,
  './js/teacher-hub-pro.js' + V,
  './js/v279-suite.js' + V,
  './js/admin-agent.js' + V,
  './js/bookreader.js' + V,
  './js/lessonplans.js' + V,
  './js/cvbuilder.js' + V,
  './js/worksheets.js' + V,
  './js/whiteboard.js' + V,
  './js/tawjihi.js' + V,
  './js/export.js' + V
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(APP_SHELL.map((u) => cache.add(u)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== CACHE_NAME + '-ext').map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (/^(fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com)$/.test(url.hostname)) {
    event.respondWith(
      caches.open(CACHE_NAME + '-ext').then((c) => c.match(req).then((hit) => {
        const net = fetch(req).then((res) => { if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone()).catch(() => {}); return res; }).catch(() => hit);
        return hit || net;
      }))
    );
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((res) => {
        if (res && res.ok && (url.pathname === '/' || url.pathname === '/index.html')) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put('./index.html', copy)).catch(() => {});
        }
        return res;
      }).catch(() => caches.match('./index.html', { ignoreSearch: true }).then((r) => r || caches.match('./', { ignoreSearch: true })).then((r) => r || caches.match('./offline.html')))
    );
    return;
  }

  event.respondWith(
    fetch(req).then((res) => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }))
  );
});
