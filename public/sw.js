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
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service worker installed');
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
        console.log('Service worker activated');
        return self.clients.claim();
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
  console.log('Push message received');

  let notificationData;
  try {
    notificationData = event.data ? event.data.json() : null;
  } catch (e) {
    console.error('Error parsing push data:', e);
    notificationData = null;
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
  };

  event.waitUntil(
    self.registration.showNotification(
      notificationData?.title || 'Lunary',
      options,
    ),
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(clients.openWindow('/'));
  }
});
