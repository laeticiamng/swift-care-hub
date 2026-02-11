/**
 * UrgenceOS Service Worker v2
 * Offline-first with proper caching strategies:
 * - Pre-cache app shell & static assets
 * - Network-first for navigation (SPA fallback)
 * - Cache-first for static assets (JS, CSS, images, fonts)
 * - Stale-while-revalidate for API data
 * - Background sync for offline mutations
 */

const CACHE_VERSION = 'urgenceos-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DATA_CACHE = `${CACHE_VERSION}-data`;
const FONT_CACHE = `${CACHE_VERSION}-fonts`;

// App shell — pre-cached on install
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

// ── Install: Pre-cache app shell ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: Clean old caches, claim clients ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('urgenceos-') && ![STATIC_CACHE, DATA_CACHE, FONT_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch strategies ──
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests (mutations go through offline queue in app)
  if (event.request.method !== 'GET') return;

  // Skip Supabase realtime WebSocket
  if (url.hostname.includes('supabase') && url.pathname.includes('realtime')) return;

  // Strategy: Supabase REST API → stale-while-revalidate
  if (url.hostname.includes('supabase') && url.pathname.includes('/rest/')) {
    event.respondWith(staleWhileRevalidate(event.request, DATA_CACHE));
    return;
  }

  // Skip other Supabase calls (auth, etc.)
  if (url.hostname.includes('supabase')) return;

  // Strategy: Navigation → network-first with SPA fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirstWithFallback(event.request));
    return;
  }

  // Strategy: Fonts → cache-first (long-lived)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(cacheFirst(event.request, FONT_CACHE));
    return;
  }

  // Strategy: Static assets (JS, CSS, images) → cache-first
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?|ttf|eot)$/)) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }

  // Default: network-first
  event.respondWith(networkFirst(event.request, STATIC_CACHE));
});

// ── Cache-first strategy ──
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

// ── Network-first strategy ──
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

// ── Network-first with SPA fallback for navigation ──
async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // SPA fallback: serve cached index.html for any navigation
    const cached = await caches.match('/index.html');
    return cached || new Response('Offline — UrgenceOS', {
      status: 503,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

// ── Stale-while-revalidate for API data ──
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  // Return cached immediately, update in background
  if (cached) {
    fetchPromise; // fire-and-forget update
    return cached;
  }

  // No cache: wait for network
  const response = await fetchPromise;
  return response || new Response(JSON.stringify({ error: 'offline' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ── Background Sync for offline mutations ──
self.addEventListener('sync', (event) => {
  if (event.tag === 'urgenceos-offline-sync') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  const clients = await self.clients.matchAll();
  for (const client of clients) {
    client.postMessage({ type: 'SYNC_OFFLINE_QUEUE' });
  }
}

// ── Push notifications for critical alerts ──
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || 'UrgenceOS', {
        body: data.body || '',
        icon: '/icons/icon-192.svg',
        badge: '/icons/icon-192.svg',
        tag: data.tag || 'urgenceos-alert',
        requireInteraction: data.critical || false,
        data: { url: data.url || '/board' },
      })
    );
  } catch {
    // Ignore malformed push data
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/board';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

// ── Cache cleanup ──
self.addEventListener('message', (event) => {
  if (event.data?.type === 'CLEANUP_CACHE') {
    caches.open(DATA_CACHE).then(async (cache) => {
      const requests = await cache.keys();
      if (requests.length > 500) {
        const toDelete = requests.slice(0, requests.length - 500);
        for (const req of toDelete) {
          await cache.delete(req);
        }
      }
    });
  }
});
