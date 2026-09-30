// ================================================================
// 🔔 ABSHER BE - Firebase Messaging Service Worker
// ================================================================
// الإصدار: 10.5.0
// الغرض: استقبال إشعارات FCM وعرضها + تشغيل الصوت
// ================================================================

// استيراد Firebase (النسخة المتوافقة مع Service Worker)
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// ================================================================
// 1. Firebase Config
// ================================================================
const firebaseConfig = {
    apiKey: "AIzaSyBDwnZz-uV5PVrsUAGio_9OtFKI_h8oczA",
    authDomain: "haven-stores.firebaseapp.com",
    projectId: "haven-stores",
    storageBucket: "haven-stores.firebasestorage.app",
    messagingSenderId: "638009290396",
    appId: "1:638009290396:web:dc5963f171b87104ab0759"
};

// ================================================================
// 2. تهيئة Firebase
// ================================================================
firebase.initializeApp(firebaseConfig);

// ================================================================
// 3. تهيئة Messaging
// ================================================================
const messaging = firebase.messaging();

// ================================================================
// 4. اسم الكاش
// ================================================================
const CACHE_NAME = 'abshar-fcm-v10.5.0';

// ================================================================
// 5. الاستماع لإشعارات الخلفية (Background Notifications)
// ================================================================
messaging.onBackgroundMessage(function(payload) {
    console.log('📬 [FCM-SW] إشعار في الخلفية وصل');
    console.log('📦 Payload:', payload);

    // ─── استخراج البيانات ───
    const notificationTitle = (payload.notification && payload.notification.title) || 
                              '🔔 أبشر بي';
    
    const notificationBody = (payload.notification && payload.notification.body) || 
                             'لديك إشعار جديد';
    
    const notificationType = (payload.data && payload.data.type) || 
                             'normal';
    
    const orderId = (payload.data && payload.data.orderId) || 
                    (payload.data && payload.data.order_id) || 
                    null;

    // ─── إعدادات الإشعار ───
    const notificationOptions = {
        body: notificationBody,
        icon: './icon-192.png',
        badge: './icon-72.png',
        vibrate: [1000, 300, 1000, 300, 1000, 300, 1000], // اهتزاز قوي
        requireInteraction: true,
        tag: 'abshar-fcm-' + Date.now(),
        renotify: true,
        silent: false,
        data: {
            url: (payload.data && payload.data.url) || './drivers.html',
            orderId: orderId,
            type: notificationType,
            click_action: './drivers.html'
        },
        actions: [
            {
                action: 'open',
                title: 'فتح التطبيق',
                icon: './icon-96.png'
            },
            {
                action: 'close',
                title: 'إغلاق',
                icon: './icon-96.png'
            }
        ]
    };

    // ─── إظهار الإشعار ───
    return self.registration.showNotification(
        notificationTitle, 
        notificationOptions
    );
});

// ================================================================
// 6. عند النقر على الإشعار
// ================================================================
self.addEventListener('notificationclick', function(event) {
    console.log('👆 [FCM-SW] تم النقر على الإشعار');
    
    event.notification.close();

    const notificationData = event.notification.data || {};
    const urlToOpen = notificationData.url || './drivers.html';
    const orderId = notificationData.orderId || null;
    const notificationType = notificationData.type || 'normal';

    // ─── إذا اختار "إغلاق" ───
    if (event.action === 'close') {
        console.log('❌ [FCM-SW] تم اختيار إغلاق');
        return;
    }

    // ─── فتح التطبيق ───
    event.waitUntil(
        self.clients.matchAll({ 
            type: 'window', 
            includeUncontrolled: true 
        }).then(function(windowClients) {
            // البحث عن نافذة مفتوحة للتطبيق
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                
                if (client.url.indexOf('drivers.html') !== -1 && 
                    'focus' in client) {
                    
                    console.log('🎯 [FCM-SW] تركيز على نافذة موجودة');
                    
                    // إرسال رسالة للنافذة
                    client.postMessage({
                        type: 'OPEN_ORDER',
                        orderId: orderId,
                        notificationType: notificationType
                    });
                    
                    return client.focus();
                }
            }
            
            // إذا لم توجد نافذة، افتح واحدة جديدة
            if (self.clients.openWindow) {
                console.log('🆕 [FCM-SW] فتح نافذة جديدة');
                
                let newUrl = urlToOpen;
                if (orderId) {
                    const separator = newUrl.indexOf('?') !== -1 ? '&' : '?';
                    newUrl += separator + 'orderId=' + orderId;
                    newUrl += '&type=' + notificationType;
                }
                
                return self.clients.openWindow(newUrl);
            }
        })
    );
});

// ================================================================
// 7. عند إغلاق الإشعار
// ================================================================
self.addEventListener('notificationclose', function(event) {
    console.log('❌ [FCM-SW] تم إغلاق الإشعار');
});

// ================================================================
// 8. الاستماع لرسائل من التطبيق
// ================================================================
self.addEventListener('message', function(event) {
    const data = event.data || {};
    
    console.log('📨 [FCM-SW] رسالة:', data.type);
    
    if (data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// ================================================================
// 9. تفعيل Service Worker
// ================================================================
self.addEventListener('install', function(event) {
    console.log('✅ [FCM-SW] تثبيت Firebase Messaging SW v10.5.0');
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    console.log('✅ [FCM-SW] تفعيل Firebase Messaging SW');
    event.waitUntil(self.clients.claim());
});

// ================================================================
// 10. رسالة ترحيبية
// ================================================================
console.log('%c🔔 [FCM-SW] أبشر بي - Firebase Messaging v10.5.0',
    'color: #D4AF37; font-weight: bold; font-size: 14px;');