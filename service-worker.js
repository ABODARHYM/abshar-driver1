// ================================================================
// 🚴 ABSHER BE - Service Worker (الحل النهائي v10.7.0)
// ================================================================
// ✅ Auto-Update
// ✅ Self-Healing
// ✅ Forced Refresh
// ✅ No Cache Conflicts
// ================================================================

const SW_VERSION = '10.7.0';
const CACHE_NAME = 'abshar-driver-v' + SW_VERSION;

// ⚠️ ملفات اختيارية - فشل أي واحد لا يعطل الباقي
const CACHE_URLS = [
    './',
    './drivers.html',
    './sound-system.js',
    './zain-core.js',
    './bell.mp3',
    './branding.css',
    './responsive.css'
];

// ================================================================
// 1. تثبيت Service Worker
// ================================================================
self.addEventListener('install', function(event) {
    console.log('✅ [SW] تثبيت v' + SW_VERSION);
    
    // ✅ تفعيل فوري
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            // تخزين الملفات فردياً
            return Promise.all(
                CACHE_URLS.map(function(url) {
                    return cache.add(url).catch(function(err) {
                        console.warn('⚠️ [SW] فشل:', url);
                    });
                })
            );
        })
    );
});

// ================================================================
// 2. تفعيل Service Worker
// ================================================================
self.addEventListener('activate', function(event) {
    console.log('✅ [SW] تفعيل v' + SW_VERSION);
    
    event.waitUntil(
        Promise.all([
            // ✅ حذف كل الكاش القديم
            caches.keys().then(function(names) {
                return Promise.all(
                    names.map(function(name) {
                        if (name !== CACHE_NAME) {
                            console.log('🗑️ [SW] حذف كاش قديم:', name);
                            return caches.delete(name);
                        }
                    })
                );
            }),
            
            // ✅ السيطرة الفورية على كل الصفحات
            self.clients.claim()
        ]).then(function() {
            // ✅ إعادة تحميل كل الصفحات المفتوحة
            return self.clients.matchAll({ type: 'window' }).then(function(clients) {
                clients.forEach(function(client) {
                    client.postMessage({
                        type: 'SW_UPDATED',
                        version: SW_VERSION
                    });
                });
            });
        })
    );
});

// ================================================================
// 3. اعتراض الطلبات
// ================================================================
self.addEventListener('fetch', function(event) {
    const url = event.request.url;
    
    // تجاهل الطلبات الخارجية
    if (url.indexOf('firebase') !== -1 ||
        url.indexOf('googleapis') !== -1 ||
        url.indexOf('gstatic') !== -1 ||
        url.indexOf('openstreetmap') !== -1 ||
        url.indexOf('unpkg.com') !== -1 ||
        url.indexOf('cdnjs') !== -1 ||
        url.indexOf('jsdelivr') !== -1 ||
        event.request.method !== 'GET') {
        return;
    }
    
    // ✅ ملفات HTML: Network First
    if (url.indexOf('.html') !== -1 || url.endsWith('/')) {
        event.respondWith(
            fetch(event.request)
                .then(function(response) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, clone);
                    });
                    return response;
                })
                .catch(function() {
                    return caches.match(event.request).then(function(cached) {
                        return cached || caches.match('./drivers.html');
                    });
                })
        );
        return;
    }
    
    // ✅ الملفات الأخرى: Cache First
    event.respondWith(
        caches.match(event.request).then(function(cached) {
            if (cached) {
                // ✅ تحديث في الخلفية
                fetch(event.request).then(function(response) {
                    if (response && response.status === 200) {
                        caches.open(CACHE_NAME).then(function(cache) {
                            cache.put(event.request, response);
                        });
                    }
                }).catch(function() {});
                
                return cached;
            }
            
            return fetch(event.request).then(function(response) {
                if (response && response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            });
        })
    );
});

// ================================================================
// 4. رسائل من التطبيق
// ================================================================
self.addEventListener('message', function(event) {
    const data = event.data || {};
    const type = data.type;
    
    console.log('📨 [SW] رسالة:', type);
    
    // ✅ تحديث فوري
    if (type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    // ✅ مسح الكاش
    if (type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(function(names) {
                return Promise.all(
                    names.map(function(name) {
                        return caches.delete(name);
                    })
                );
            }).then(function() {
                console.log('✅ [SW] تم مسح كل الكاش');
                return self.clients.matchAll().then(function(clients) {
                    clients.forEach(function(client) {
                        client.postMessage({ type: 'CACHE_CLEARED' });
                    });
                });
            })
        );
    }
    
    // ✅ الحصول على الإصدار
    if (type === 'GET_VERSION') {
        event.source.postMessage({
            type: 'VERSION',
            version: SW_VERSION
        });
    }
    
    // ✅ إشعارات
    if (type === 'SHOW_NOTIFICATION') {
        const notificationType = data.notificationType || 'personal';
        
        event.waitUntil(
            self.registration.showNotification(
                data.title || '🔔 أبشر بي',
                {
                    body: data.body || 'لديك إشعار جديد',
                    icon: './icon-192.png',
                    badge: './icon-72.png',
                    vibrate: [1000, 300, 1000, 300, 1000],
                    requireInteraction: true,
                    tag: 'abshar-' + Date.now(),
                    renotify: true,
                    silent: false,
                    data: {
                        url: data.url || './drivers.html',
                        orderId: data.orderId || null,
                        notificationType: notificationType
                    }
                }
            )
        );
    }
});

// ================================================================
// 5. عند النقر على الإشعار
// ================================================================
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    const data = event.notification.data || {};
    const urlToOpen = data.url || './drivers.html';
    const orderId = data.orderId;
    
    if (event.action === 'close') return;
    
    event.waitUntil(
        self.clients.matchAll({ 
            type: 'window', 
            includeUncontrolled: true 
        }).then(function(clients) {
            // البحث عن نافذة مفتوحة
            for (let i = 0; i < clients.length; i++) {
                const client = clients[i];
                if ('focus' in client) {
                    client.postMessage({
                        type: 'OPEN_ORDER',
                        orderId: orderId
                    });
                    return client.focus();
                }
            }
            
            // فتح نافذة جديدة
            if (self.clients.openWindow) {
                let newUrl = urlToOpen;
                if (orderId) {
                    newUrl += '?orderId=' + orderId;
                }
                return self.clients.openWindow(newUrl);
            }
        })
    );
});

// ================================================================
// 6. Push Notifications (FCM)
// ================================================================
self.addEventListener('push', function(event) {
    console.log('📬 [SW] Push');
    
    let data = {
        title: '🔔 أبشر بي',
        body: 'لديك إشعار جديد',
        icon: './icon-192.png',
        badge: './icon-72.png',
        vibrate: [1000, 300, 1000, 300, 1000],
        url: './drivers.html',
        notificationType: 'personal'
    };
    
    if (event.data) {
        try {
            const parsed = event.data.json();
            data = Object.assign(data, parsed);
        } catch (e) {
            data.body = event.data.text();
        }
    }
    
    event.waitUntil(
        Promise.all([
            self.registration.showNotification(data.title, {
                body: data.body,
                icon: data.icon,
                badge: data.badge,
                vibrate: data.vibrate,
                requireInteraction: true,
                tag: 'abshar-' + Date.now(),
                renotify: true,
                data: {
                    url: data.url,
                    orderId: data.orderId
                }
            }),
            
            self.clients.matchAll({ type: 'window' }).then(function(clients) {
                clients.forEach(function(client) {
                    client.postMessage({
                        type: 'PLAY_SOUND',
                        soundType: data.notificationType
                    });
                });
            })
        ])
    );
});

// ================================================================
// 7. Background Sync
// ================================================================
self.addEventListener('sync', function(event) {
    if (event.tag === 'sync-orders') {
        event.waitUntil(
            self.clients.matchAll({ type: 'window' }).then(function(clients) {
                clients.forEach(function(client) {
                    client.postMessage({ type: 'SYNC_ORDERS' });
                });
            })
        );
    }
});

// ================================================================
// 8. رسالة ترحيبية
// ================================================================
console.log('%c🚴 [SW] أبشر بي v' + SW_VERSION, 
    'color: #e67e22; font-weight: bold; font-size: 14px;');
console.log('%c✅ Auto-Update مُفعّل', 
    'color: #27AE60; font-weight: bold;');