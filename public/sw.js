const CACHE_NAME = 'lunary-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service worker installing...');
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        // Explicitly cache the start URL - this is CRITICAL for PWA
        return Promise.all([
          cache.add('/'),
          cache.add('/manifest.json'),
          cache.add('/icons/icon-192x192.png'),
          cache.add('/icons/icon-512x512.png'),
        ]).catch((error) => {
          console.error('Error caching assets:', error);
          // Still try to cache what we can
          return cache.add('/').catch(() => {
            console.error('Failed to cache start URL');
          });
        });
      })
      .then(() => {
        console.log('Service worker installed - start URL cached');
        return self.skipWaiting();
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
        console.log(
          'Service worker activated - claiming all clients immediately',
        );
        // CRITICAL: Claim clients immediately so SW controls all pages
        return self.clients.claim().then(() => {
          console.log('✅ All clients claimed - service worker is controlling');
        });
      }),
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // CRITICAL: Skip ALL API routes and authentication - always use network, don't intercept
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('/auth/') ||
    url.pathname.includes('sign-in') ||
    url.pathname.includes('sign-out') ||
    url.pathname.includes('get-session') ||
    url.pathname.includes('get-subscription')
  ) {
    // Let the request go directly to network without any interception
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

  // CRITICAL for PWA: Navigation requests MUST be served from cache
  // Chrome iOS checks this - if start_url isn't served from cache, opens in tab
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/').then((cachedResponse) => {
        // CRITICAL: Must return cached response immediately for PWA
        if (cachedResponse) {
          return cachedResponse;
        }
        // Fallback: fetch and cache
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put('/', responseToCache);
            });
          }
          return response;
        });
      }),
    );
    return;
  }

  // For all other requests, cache-first strategy
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
          // Return offline fallback for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
    }),
  );
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
        title: 'View in Lunary',
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
  const urlToOpen = notificationData.url || '/';

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
