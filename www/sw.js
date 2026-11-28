/* EduTech Mindset Service Worker — v291 */
const VERSION = '3.3.1';
const CACHE_NAME = 'edutech-v3-stable-' + VERSION;
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
  './css/v281-polish.css' + V,
  './js/theme.js' + V,
  './js/core-utils.js' + V,
  './js/cloud.js' + V,
  './js/app.js' + V,
  './js/v1-prompt-studio.js' + V,
  './js/v2-prompt-powerups.js' + V,
  './js/v21-courses-academy.js' + V,
  './js/v221-auth-gate.js' + V,
  './js/classrooms.js' + V,
  './js/homework.js' + V,
  './js/games.js' + V,
  './js/v294-smart-labs.js' + V,
  './js/extras.js' + V,
  './js/ai.js' + V,
  './js/ai-admin.js' + V,
  './js/tools.js' + V,
  './js/books-catalog.js' + V,
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
  './js/native-app-engine.js' + V,
  './js/kids-taasees.js' + V,
  './js/v281-pro-upgrade.js' + V,
  './js/v283-live-monitor.js' + V,
  './js/v284-welcome-auth.js' + V,
  './js/v284-subscriptions.js' + V,
  './js/v284-pro-studios.js' + V,
  './js/v285-turbo-honor.js' + V,
  './js/v286-arabic-math.js' + V,
  './js/v287-social-studio-pro.js' + V,
  './js/v288-smart-scanner.js' + V,
  './js/v288-teacher-pro.js' + V,
  './js/v289-android-bridge.js' + V,
  './js/v291-storage-monitor.js' + V,
  './assets/audio-pack/welcome_ar.mp3',
  './assets/audio-pack/sfx_success.mp3',
  './assets/audio-pack/sfx_click.mp3',
  './assets/audio-pack/sfx_notify.mp3',
  './assets/katex/katex.min.css' + V,
  './assets/katex/katex.min.js' + V,
  './assets/katex/auto-render.min.js' + V,
  './assets/katex/fonts/KaTeX_Main-Regular.woff2',
  './assets/katex/fonts/KaTeX_Main-Bold.woff2',
  './assets/katex/fonts/KaTeX_Math-Italic.woff2',
  './assets/katex/fonts/KaTeX_Size1-Regular.woff2',
  './assets/katex/fonts/KaTeX_Size2-Regular.woff2',
  './assets/katex/fonts/KaTeX_AMS-Regular.woff2',
  './assets/fa/css/all.min.css' + V,
  './assets/fa/webfonts/fa-solid-900.woff2',
  './assets/fa/webfonts/fa-regular-400.woff2',
  './assets/fa/webfonts/fa-brands-400.woff2',
  './js/admin-agent.js' + V,
  './js/bookreader.js' + V,
  './js/lessonplans.js' + V,
  './js/cvbuilder.js' + V,
  './js/worksheets.js' + V,
  './js/whiteboard.js' + V,
  './js/tawjihi.js' + V,
  './js/export.js' + V,
  './js/v330-power-suite.js' + V
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
      Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== CACHE_NAME + '-ext' && k !== 'edutech-books-offline-v3').map((k) => caches.delete(k)))
    ).then(() => self.clients.claim()).then(() =>
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((c) => c.postMessage({ type: 'SW_UPDATED', version: VERSION }));
      })
    )
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
    if (/^(elearn\.azureedge\.net|moe\.edu\.ps|drive\.google\.com)$/.test(url.hostname) || url.pathname.toLowerCase().endsWith('.pdf')) {
    event.respondWith(
      caches.open('edutech-books-offline-v3').then((c) => c.match(req).then((hit) => {
        if (hit) return hit;
        return fetch(req).then((res) => {
          if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone()).catch(() => {});
          return res;
        });
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

  // Stale-While-Revalidate for static JS/CSS/assets for instant loading on slow networks
  if (/^\/(js|css|assets)\//.test(url.pathname)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((c) => c.match(req).then((hit) => {
        const net = fetch(req).then((res) => {
          if (res && res.ok) c.put(req, res.clone()).catch(() => {});
          return res;
        }).catch(() => hit);
        return hit || net;
      }))
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
