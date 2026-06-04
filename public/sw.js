/* FineGuide Europe — app-shell service worker.
 *
 * Goal: the installed PWA opens even with no network. Strategy:
 *  - install:  pre-cache the app-shell start page (the SW scope root).
 *  - fetch:    network-first for navigations (HTML), falling back to the
 *              cached start page when offline; cache-first (then network,
 *              then cache) for same-origin GET assets.
 *  - activate: take control immediately and delete stale caches.
 *
 * Works under any base path (e.g. "/fineguide-europe/") because all URLs are
 * derived from `self.registration.scope` rather than being hardcoded.
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `fineguide-shell-${CACHE_VERSION}`;

// The scope is the directory the SW was registered under, e.g.
// "https://host/fineguide-europe/". The start page is that scope's index.
const SCOPE = self.registration.scope;
const START_URL = new URL('./', SCOPE).href;

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Pre-cache the app shell (start page). Best-effort: a failure here must
      // not abort the install.
      try {
        await cache.add(new Request(START_URL, { cache: 'reload' }));
      } catch (err) {
        // ignore — runtime caching will fill this in on first online load
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET; let the browser deal with everything else.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // Navigations (HTML documents): network-first, fall back to cached shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          // Keep the shell fresh for offline use.
          const cache = await caches.open(CACHE_NAME);
          cache.put(START_URL, fresh.clone()).catch(() => {});
          return fresh;
        } catch (err) {
          const cache = await caches.open(CACHE_NAME);
          const cached = (await cache.match(START_URL)) || (await cache.match(request));
          return (
            cached ||
            new Response('Offline', { status: 503, statusText: 'Offline' })
          );
        }
      })()
    );
    return;
  }

  // Same-origin assets: cache-first, then network (and populate the cache).
  if (sameOrigin) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const fresh = await fetch(request);
          if (fresh && fresh.status === 200 && fresh.type === 'basic') {
            cache.put(request, fresh.clone()).catch(() => {});
          }
          return fresh;
        } catch (err) {
          // Last resort: any cached match (e.g. for opaque/range edge cases).
          const fallback = await cache.match(request);
          if (fallback) return fallback;
          throw err;
        }
      })()
    );
  }
  // Cross-origin requests fall through to the network (default behaviour).
});
