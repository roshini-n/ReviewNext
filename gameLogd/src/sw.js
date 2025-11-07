const CACHE_NAME = 'reviewnext-v1.0.0';
const OFFLINE_URL = '/offline';

// Assets to cache on install
const STATIC_CACHE_ASSETS = [
  '/',
  '/offline',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
];

// Runtime cache patterns
const RUNTIME_CACHE_PATTERNS = [
  /^https:\/\/fonts\.googleapis\.com/,
  /^https:\/\/fonts\.gstatic\.com/,
  /\.(?:png|gif|jpg|jpeg|svg|webp)$/,
  /\.(?:js|css|html)$/
];

// Network-first cache patterns (API calls)
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /\/auth\//,
  /firebase/
];

// Cache-first patterns (static assets)
const CACHE_FIRST_PATTERNS = [
  /\/assets\//,
  /\.(?:png|gif|jpg|jpeg|svg|webp|woff|woff2|ttf|eot)$/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('ServiceWorker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_CACHE_ASSETS);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('ServiceWorker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all pages
        return self.clients.claim();
      })
  );
});

// Fetch event - handle different caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle API requests with network-first strategy
  if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname) || pattern.test(url.href))) {
    event.respondWith(handleNetworkFirst(request));
    return;
  }

  // Handle static assets with cache-first strategy
  if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname) || pattern.test(url.href))) {
    event.respondWith(handleCacheFirst(request));
    return;
  }

  // Handle other requests with stale-while-revalidate
  if (RUNTIME_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname) || pattern.test(url.href))) {
    event.respondWith(handleStaleWhileRevalidate(request));
    return;
  }
});

// Navigation request handler - network first with offline fallback
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page as last resort
    const offlineResponse = await caches.match(OFFLINE_URL);
    return offlineResponse || new Response('Offline', { status: 503 });
  }
}

// Network-first strategy for dynamic content
async function handleNetworkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return a generic error response for failed API calls
    return new Response(
      JSON.stringify({ error: 'Network unavailable', offline: true }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache-first strategy for static assets
async function handleCacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    fetch(request)
      .then(networkResponse => {
        if (networkResponse.ok) {
          cache.put(request, networkResponse);
        }
      })
      .catch(() => {
        // Ignore network errors for background updates
      });
    
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Failed to fetch asset:', error);
    
    // Return a transparent pixel for failed image requests
    if (request.destination === 'image') {
      return new Response(
        new Uint8Array([
          71, 73, 70, 56, 57, 97, 1, 0, 1, 0, 0, 0, 0, 33, 249, 4, 1, 0, 0, 0, 0, 44, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 2, 4, 1, 0, 59
        ]),
        { headers: { 'Content-Type': 'image/gif' } }
      );
    }
    
    throw error;
  }
}

// Stale-while-revalidate strategy
async function handleStaleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in background
  const networkPromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => {
      // Ignore network errors
    });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Wait for network if no cache available
  try {
    return await networkPromise;
  } catch (error) {
    return new Response('Resource not available offline', { status: 503 });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-reviews') {
    event.waitUntil(syncOfflineReviews());
  }
  
  if (event.tag === 'sync-user-data') {
    event.waitUntil(syncUserData());
  }
});

// Sync offline reviews when back online
async function syncOfflineReviews() {
  try {
    // Get offline reviews from IndexedDB or localStorage
    const offlineReviews = await getOfflineReviews();
    
    for (const review of offlineReviews) {
      try {
        await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(review)
        });
        
        // Remove from offline storage after successful sync
        await removeOfflineReview(review.id);
      } catch (error) {
        console.error('Failed to sync review:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Sync user data when back online
async function syncUserData() {
  try {
    // Implementation for syncing user preferences, settings, etc.
    console.log('Syncing user data...');
  } catch (error) {
    console.error('User data sync failed:', error);
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/assets/icons/action-view.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/icons/action-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('ReviewNext', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  console.log('Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => cache.addAll(event.data.payload))
    );
  }
});

// Utility functions (these would typically use IndexedDB in a real implementation)
async function getOfflineReviews() {
  // Placeholder - implement with IndexedDB or another storage solution
  return [];
}

async function removeOfflineReview(id) {
  // Placeholder - implement with IndexedDB or another storage solution
  console.log('Removing offline review:', id);
}

// Error handler
self.addEventListener('error', (event) => {
  console.error('ServiceWorker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('ServiceWorker unhandled rejection:', event.reason);
});

console.log('ServiceWorker loaded successfully');