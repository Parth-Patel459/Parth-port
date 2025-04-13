const CACHE_NAME = 'news-aggregator-v1';
const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';

// Files to cache
const STATIC_ASSETS = [
    '/news-aggregator/',
    '/news-aggregator/index.html',
    '/dist/css/news-aggregator.min.css',
    '/dist/js/news-aggregator.min.js',
    '/assets/icons/icon-72x72.png',
    '/assets/icons/icon-96x96.png',
    '/assets/icons/icon-128x128.png',
    '/assets/icons/icon-144x144.png',
    '/assets/icons/icon-152x152.png',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-384x384.png',
    '/assets/icons/icon-512x512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/fontawesome.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/solid.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/brands.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// Install Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(STATIC_ASSETS);
            })
    );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Handle API requests
    if (event.request.url.includes('newsapi.org')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Clone the response
                    const responseClone = response.clone();
                    
                    // Cache the response
                    caches.open(DYNAMIC_CACHE)
                        .then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    
                    return response;
                })
                .catch(() => {
                    // If fetch fails, try to get from cache
                    return caches.match(event.request);
                })
        );
        return;
    }

    // Handle other requests
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                
                return fetch(event.request)
                    .then((response) => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response
                        const responseToCache = response.clone();
                        
                        caches.open(DYNAMIC_CACHE)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    });
            })
    );
});

// Background Sync
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-news') {
        event.waitUntil(syncNews());
    }
});

async function syncNews() {
    try {
        const response = await fetch('https://newsapi.org/v2/top-headlines?country=us&apiKey=YOUR_API_KEY');
        const data = await response.json();
        
        // Store the latest news in IndexedDB
        const db = await openDB('newsDB', 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('news')) {
                    db.createObjectStore('news', { keyPath: 'id' });
                }
            }
        });
        
        const tx = db.transaction('news', 'readwrite');
        const store = tx.objectStore('news');
        
        data.articles.forEach(article => {
            store.put({
                id: article.url,
                ...article,
                timestamp: Date.now()
            });
        });
        
        await tx.done;
        
        // Notify clients
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'NEWS_UPDATED',
                data: data.articles
            });
        });
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Push Notifications
self.addEventListener('push', (event) => {
    const options = {
        body: event.data.text(),
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-96x96.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Read Now'
            },
            {
                action: 'close',
                title: 'Close'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Breaking News', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/news-aggregator/')
        );
    }
}); 