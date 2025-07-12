const CACHE_NAME = 'nexus-mint-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon-dual-tone.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service worker installed');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.match(event.request)
          .then((cachedResponse) => {
            // Return cached version immediately if available
            if (cachedResponse) {
              // Fetch update in background (stale-while-revalidate)
              fetch(event.request)
                .then((fetchResponse) => {
                  if (fetchResponse.ok) {
                    cache.put(event.request, fetchResponse.clone());
                  }
                })
                .catch(() => {}); // Silent fail for background updates
              
              return cachedResponse;
            }

            // No cache, fetch from network
            return fetch(event.request)
              .then((fetchResponse) => {
                // Cache successful responses
                if (fetchResponse.ok) {
                  cache.put(event.request, fetchResponse.clone());
                }
                return fetchResponse;
              })
              .catch(() => {
                // Return offline fallback for navigation requests
                if (event.request.mode === 'navigate') {
                  return cache.match('/');
                }
                throw new Error('Network error and no cache available');
              });
          });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'New notification from Nexus Mint',
      icon: '/favicon-dual-tone.png',
      badge: '/favicon-dual-tone.png',
      data: data,
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/favicon-dual-tone.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Nexus Mint', options)
    );
  } catch (error) {
    console.error('Error handling push notification:', error);
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});