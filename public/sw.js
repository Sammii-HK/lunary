const CACHE_NAME = 'lunary-v15';
const STATIC_CACHE_URLS = [
  '/app',
  '/manifest.json?v=20251103-1',
  '/admin-manifest.json?v=20251114-1',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/pwa/icon-192x192.png',
  '/icons/pwa/icon-512x512.png',
  '/grimoire',
  '/grimoire/crystals',
  '/grimoire/moon',
  '/grimoire/tarot',
  '/grimoire/runes',
  '/grimoire/practices',
  '/grimoire/chakras',
  '/offline',
];

const API_CACHE_ROUTES = [
  '/api/grimoire/crystals',
  '/api/grimoire/spells',
  '/api/grimoire/numerology',
  '/api/grimoire/tarot-spreads',
  '/api/cosmic/global',
];

// Install event - cache static assets
// CRITICAL: Cache start_url FIRST - iOS needs this immediately
self.addEventListener('install', (event) => {
  console.log('Service worker installing...');
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets, prioritizing start_url');
        // Cache start_url FIRST - this is critical for iOS PWA
        return cache
          .add('/app')
          .then(() => {
            console.log('✅ Start URL cached');
            // Then cache other assets
            return cache.addAll(
              STATIC_CACHE_URLS.filter((url) => url !== '/app'),
            );
          })
          .catch((err) => {
            console.error('Failed to cache assets:', err);
            // If addAll fails, try caching individually
            return Promise.all(
              STATIC_CACHE_URLS.map((url) =>
                cache
                  .add(url)
                  .catch((e) => console.warn('Failed to cache', url, e)),
              ),
            );
          });
      })
      .then(() => {
        console.log('✅ Service worker installed - all assets cached');
        // Verify start_url is cached
        return caches.match('/app').then((cached) => {
          if (!cached) {
            console.error('❌ CRITICAL: Start URL not cached after install!');
            throw new Error('Start URL not cached');
          }
          console.log('✅ Verified: Start URL is cached');
          return self.skipWaiting();
        });
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service worker activating...');
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log('Service worker activated');
        return self.clients.claim();
      }),
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip authentication routes - always use network
  if (
    url.pathname.includes('/auth/') ||
    url.pathname.includes('sign-in') ||
    url.pathname.includes('sign-out') ||
    url.pathname.includes('get-session') ||
    url.pathname.includes('get-subscription')
  ) {
    return;
  }

  // Stale-while-revalidate for cacheable API routes
  const isCacheableAPI = API_CACHE_ROUTES.some((route) =>
    url.pathname.startsWith(route),
  );
  if (isCacheableAPI) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      }),
    );
    return;
  }

  // Skip other API routes - always use network
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // CRITICAL: Skip navigation requests (page navigations) - always use network for direct routing
  // This ensures direct URL navigation works correctly
  if (event.request.mode === 'navigate') {
    return;
  }

  // Skip non-GET requests (for non-API routes)
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip debug pages - let them go to network
  if (
    url.pathname.startsWith('/pwa-reset') ||
    url.pathname.startsWith('/pwa-debug') ||
    url.pathname.startsWith('/pwa-guard')
  ) {
    return;
  }

  // DEVELOPMENT MODE: Skip caching for localhost to prevent dev workflow issues
  // Always use network-first in development
  const isLocalhost =
    url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if (isLocalhost) {
    // In development, always fetch from network and don't cache
    event.respondWith(
      fetch(event.request).catch(() => {
        // Only fallback to cache if network fails
        return caches
          .match(event.request)
          .then((cached) => cached || caches.match('/app'));
      }),
    );
    return;
  }

  // PRODUCTION: For non-navigation requests (assets, images, etc.), use cache-first strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (
            !response ||
            response.status !== 200 ||
            response.type !== 'basic'
          ) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Return offline fallback for failed requests
          return caches.match('/offline') || caches.match('/app');
        });
    }),
  );
});

// Handle skip waiting message from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⚠️ Received SKIP_WAITING, activating immediately');
    self.skipWaiting();
  }
});

// Background sync for future enhancements
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);
});

// Push notifications for astronomical events
self.addEventListener('push', (event) => {
  console.log('🔔 Push message received', event);

  let notificationData;
  try {
    if (event.data) {
      const text = event.data.text();
      console.log('Push data text:', text);

      if (text) {
        try {
          notificationData = JSON.parse(text);
        } catch (parseError) {
          // If it's not JSON, treat it as plain text
          notificationData = {
            title: 'Lunary',
            body: text,
          };
        }
      }
    }
  } catch (e) {
    console.error('❌ Error parsing push data:', e);
    notificationData = {
      title: 'Lunary',
      body: 'New cosmic update available',
    };
  }

  const options = {
    body: notificationData?.body || 'New cosmic update available',
    icon: notificationData?.icon || '/icons/icon-192x192.png',
    badge: notificationData?.badge || '/icons/icon-72x72.png',
    vibrate: notificationData?.vibrate || [200, 100, 200],
    tag: notificationData?.tag || 'lunary-notification',
    data: notificationData?.data || {},
    actions: notificationData?.actions || [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/icon-72x72.png',
      },
    ],
    requireInteraction: false,
    silent: false,
    timestamp: Date.now(),
  };

  console.log(
    'Showing notification:',
    notificationData?.title || 'Lunary',
    options,
  );

  event.waitUntil(
    self.registration
      .showNotification(notificationData?.title || 'Lunary', options)
      .then(() => {
        console.log('✅ Notification displayed successfully');
      })
      .catch((error) => {
        console.error('❌ Error showing notification:', error);
      }),
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  event.notification.close();

  const notificationData = event.notification.data || {};
  const urlToOpen = notificationData.url || '/app';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }

        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => {
        console.error('❌ Error handling notification click:', error);
        // Fallback: try to open the URL anyway
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});
