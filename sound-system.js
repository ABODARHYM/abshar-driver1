// ================================================================
// 🔔 ABSHER BE - Sound System + FCM
// ================================================================
// الإصدار: 10.6.0
// التاريخ: 2026-09-29
// ================================================================
// نظام صوت + إشعارات FCM كامل
// ================================================================

(function() {
    'use strict';

    const SOUND_CONFIG = {
    bellSounds: ['bell.mp3'],
    fallbackSounds: [
        'https://actions.google.com/sounds/v1/alarms/beep_short.ogg'
    ],
    maxDuration: 5000,        // ✅ 5 ثوانٍ فقط
    maxPlays: 1,              // ✅ رنتان فقط
    volume: 1.0,
    vibratePattern: [400, 200, 400, 200],
    repeatInterval: 2000,     // ✅ كل 2 ثانية
    bellFrequencies: { high: 1760, mid: 1318, low: 880 }
};
    const FCM_CONFIG = {
        vapidKey: 'BGheZRU5IHwCIqPuLFgEySXLXPPt6ex2sVctz_tljERJWgvX0IrHWK2VxTiFPJ2LU6zBqi--PLapSEBirNmRgTY',
        serviceWorkerPath: 'firebase-messaging-sw.js',
        messagingSwPath: 'firebase-messaging-sw.js',
        tokensCollection: 'fcm_tokens'
    };

    let globalAudioContext = null;
    let alarmAudioElement = null;
    let audioUnlocked = false;
    let alarmStopTimeout = null;
    let activeOscillators = [];
    let usingFallback = false;
    let messaging = null;
    let fcmToken = null;
    let currentUserId = null;
    let fcmInitialized = false;

    function init() {
        console.log('%c🔔 نظام الصوت + FCM - أبشر بي v10.6.0', 'color: #D4AF37; font-weight: bold; font-size: 14px;');
        console.log('%c🎵 ملف الصوت: bell.mp3', 'color: #27AE60; font-weight: bold;');
        console.log('%c📬 FCM: مفعّل', 'color: #3498DB; font-weight: bold;');

        ['click', 'touchstart', 'keydown', 'mousedown'].forEach(function(event) {
            document.addEventListener(event, unlockAudio, { once: false });
        });

        setTimeout(unlockAudio, 1000);
        setTimeout(requestNotificationPermission, 2000);
        testLocalSound();

        console.log('✅ نظام الصوت + FCM جاهز');
    }

    function testLocalSound() {
        fetch('bell.mp3', { method: 'HEAD' })
            .then(function(response) {
                if (response.ok) {
                    console.log('✅ bell.mp3 موجود');
                    usingFallback = false;
                } else {
                    console.warn('⚠️ bell.mp3 غير متاح - استخدام الاحتياطي');
                    usingFallback = true;
                }
            })
            .catch(function(err) {
                console.warn('⚠️ فشل فحص bell.mp3:', err.message);
                usingFallback = true;
            });
    }

    function unlockAudio() {
        if (audioUnlocked) return;
        try {
            const ctx = getAudioContext();
            if (ctx) {
                ctx.resume().then(function() {
                    audioUnlocked = true;
                    console.log('🔓 تم تفعيل الصوت');
                    const silentOsc = ctx.createOscillator();
                    const silentGain = ctx.createGain();
                    silentGain.gain.value = 0;
                    silentOsc.connect(silentGain);
                    silentGain.connect(ctx.destination);
                    silentOsc.start();
                    silentOsc.stop(ctx.currentTime + 0.01);
                });
            }
        } catch (e) {}

        try {
            const testAudio = new Audio();
            testAudio.volume = 0;
            const playPromise = testAudio.play();
            if (playPromise !== undefined) {
                playPromise.catch(function() {});
            }
        } catch (e) {}
    }

    function getAudioContext() {
        try {
            if (!globalAudioContext) {
                const AC = window.AudioContext || window.webkitAudioContext;
                if (!AC) return null;
                globalAudioContext = new AC();
            }
            if (globalAudioContext.state === 'suspended') {
                globalAudioContext.resume();
            }
            return globalAudioContext;
        } catch (e) {
            return null;
        }
    }

    function playSound(type) {
        type = type || 'bell';
        console.log('🔔 تشغيل صوت جرس:', type);
        unlockAudio();
        setTimeout(function() {
            playBell();
        }, 100);
    }

    function playBell() {
        console.log('🔔🔔🔔 نغمة الجرس');
        playBellMP3();
        vibrateStrong();
        showBrowserNotification('🔔 تنبيه جديد', 'لديك إشعار - افتح التطبيق', 'bell');
    }

    function playBellMP3() {
        try {
            stopBell();
            const soundUrl = usingFallback ? 
                SOUND_CONFIG.fallbackSounds[0] : 
                SOUND_CONFIG.bellSounds[0];
            console.log('🎵 تشغيل:', soundUrl);
            
            let playedCount = 0;
            const maxPlays = SOUND_CONFIG.maxPlays;

            function playOnce() {
                if (playedCount >= maxPlays) {
                    stopBell();
                    return;
                }
                try {
                    alarmAudioElement = new Audio(soundUrl);
                    alarmAudioElement.volume = SOUND_CONFIG.volume;
                    alarmAudioElement.loop = false;
                    const playPromise = alarmAudioElement.play();
                    if (playPromise !== undefined) {
                        playPromise.then(function() {
                            playedCount++;
                            console.log('🔔 جرس #' + playedCount + '/' + maxPlays);
                            alarmAudioElement.onended = function() {
                                setTimeout(playOnce, 200);
                            };
                            setTimeout(function() {
                                if (playedCount < maxPlays && alarmAudioElement && !alarmAudioElement.paused) {
                                    setTimeout(playOnce, 100);
                                }
                            }, SOUND_CONFIG.repeatInterval);
                        }).catch(function(error) {
                            console.warn('⚠️ فشل تشغيل الصوت:', error.message);
                            if (!usingFallback) {
                                console.log('💡 التبديل للملف الاحتياطي');
                                usingFallback = true;
                                setTimeout(playOnce, 300);
                            } else {
                                console.error('❌ فشل كلا الملفين');
                                playWebAudioBell();
                            }
                        });
                    }
                } catch (e) {
                    if (!usingFallback) {
                        usingFallback = true;
                        setTimeout(playOnce, 300);
                    }
                }
            }

            playOnce();
            alarmStopTimeout = setTimeout(stopBell, SOUND_CONFIG.maxDuration);
        } catch (e) {
            playWebAudioBell();
        }
    }

    function playWebAudioBell() {
        const ctx = getAudioContext();
        if (!ctx) return;
        const totalBells = 10;
        const bellDuration = 0.3;
        const gapDuration = 0.2;
        for (let i = 0; i < totalBells; i++) {
            const startTime = ctx.currentTime + (i * (bellDuration + gapDuration));
            const freqs = [1760, 1318, 880, 3520];
            const gains = [1.0, 0.9, 0.8, 0.4];
            const types = ['sine', 'sine', 'sine', 'triangle'];
            for (let j = 0; j < 4; j++) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = types[j];
                osc.frequency.setValueAtTime(freqs[j], startTime);
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(gains[j], startTime + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + bellDuration);
                osc.start(startTime);
                osc.stop(startTime + bellDuration);
                activeOscillators.push(osc);
            }
        }
    }

    function stopBell() {
        try {
            if (alarmAudioElement) {
                alarmAudioElement.pause();
                alarmAudioElement.currentTime = 0;
                alarmAudioElement = null;
            }
            if (alarmStopTimeout) {
                clearTimeout(alarmStopTimeout);
                alarmStopTimeout = null;
            }
            activeOscillators.forEach(function(osc) {
                try { osc.stop(); } catch (e) {}
            });
            activeOscillators = [];
            console.log('⏹️ تم إيقاف الصوت');
        } catch (e) {}
    }

    function vibrateStrong() {
        if (!navigator.vibrate) return;
        try {
            const pattern = [];
            for (let i = 0; i < 10; i++) {
                pattern.push(400, 150);
            }
            navigator.vibrate(pattern);
        } catch (e) {}
    }

    async function requestNotificationPermission() {
        if (!('Notification' in window)) return false;
        try {
            if (Notification.permission === 'granted') return true;
            if (Notification.permission === 'denied') return false;
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('🔔 تم تفعيل الإشعارات');
                return true;
            }
            return false;
        } catch (e) {
            return false;
        }
    }

    async function showBrowserNotification(title, body, type) {
        try {
            if (!('Notification' in window)) return;
            if (Notification.permission !== 'granted') return;
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                const registration = await navigator.serviceWorker.ready;
                registration.showNotification(title, {
                    body: body,
                    icon: './icon-192.png',
                    badge: './icon-72.png',
                    vibrate: SOUND_CONFIG.vibratePattern,
                    requireInteraction: true,
                    tag: 'abshar-bell-' + Date.now(),
                    renotify: true,
                    silent: false,
                    data: { url: window.location.href, type: type }
                });
            } else {
                new Notification(title, {
                    body: body,
                    icon: './icon-192.png',
                    tag: 'abshar-bell',
                    requireInteraction: true
                });
            }
        } catch (e) {}
    }

    async function initFCM(userId) {
        try {
            if (!('serviceWorker' in navigator)) {
                console.warn('⚠️ [FCM] SW غير مدعوم');
                return false;
            }
            if (!('Notification' in window)) {
                console.warn('⚠️ [FCM] الإشعارات غير مدعومة');
                return false;
            }
            if (!('PushManager' in window)) {
                console.warn('⚠️ [FCM] Push غير مدعوم');
                return false;
            }
            if (typeof firebase === 'undefined' || !firebase.messaging) {
                console.warn('⚠️ [FCM] Firebase Messaging غير محمّل');
                return false;
            }

            console.log('📬 [FCM] بدء التهيئة...');
            currentUserId = userId;
            messaging = firebase.messaging();

            messaging.onMessage(function(payload) {
                console.log('📬 [FCM] إشعار في المقدمة:', payload);
                const notificationTitle = (payload.notification && payload.notification.title) || '🔔 إشعار جديد';
                const notificationBody = (payload.notification && payload.notification.body) || 'لديك إشعار';
                const notificationType = (payload.data && payload.data.type) || 'personal';
                playSound(notificationType);
                vibrateStrong();
                showBrowserNotification(notificationTitle, notificationBody, notificationType);
                if (navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({
                        type: 'PLAY_SOUND',
                        soundType: notificationType
                    });
                }
            });

            try {
                const registration = await navigator.serviceWorker.register(
                    FCM_CONFIG.messagingSwPath,
                    { scope: './firebase-cloud-messaging-push-scope' }
                );
                console.log('✅ [FCM] Messaging SW مسجل');
                fcmToken = await messaging.getToken({
                    vapidKey: FCM_CONFIG.vapidKey,
                    serviceWorkerRegistration: registration
                });

                if (fcmToken) {
                    console.log('✅ [FCM] Token:', fcmToken.substring(0, 30) + '...');
                    if (userId) {
                        await saveFCMToken(userId, fcmToken);
                    }
                    fcmInitialized = true;
                    return true;
                } else {
                    console.warn('⚠️ [FCM] لم يتم الحصول على Token');
                    return false;
                }
            } catch (err) {
                console.error('❌ [FCM] خطأ في Token:', err.message);
                return false;
            }
        } catch (error) {
            console.error('❌ [FCM] خطأ:', error.message);
            return false;
        }
    }

    async function saveFCMToken(userId, token) {
        try {
            if (typeof firebase === 'undefined' || !firebase.firestore) {
                console.warn('⚠️ [FCM] Firestore غير محمّل');
                return false;
            }
            const db = firebase.firestore();
            await db.collection(FCM_CONFIG.tokensCollection).doc(userId).set({
                token: token,
                userId: userId,
                platform: 'web',
                userAgent: navigator.userAgent,
                updatedAt: new Date().toISOString(),
                createdAt: new Date().toISOString()
            }, { merge: true });
            console.log('✅ [FCM] تم حفظ Token في Firestore');
            localStorage.setItem('abshar_fcm_token', token);
            localStorage.setItem('abshar_fcm_user', userId);
            return true;
        } catch (error) {
            console.error('❌ [FCM] خطأ في حفظ Token:', error.message);
            return false;
        }
    }

    async function deleteFCMToken() {
        try {
            if (messaging) {
                await messaging.deleteToken();
                console.log('🗑️ [FCM] تم حذف Token من الجهاز');
            }
            if (currentUserId && typeof firebase !== 'undefined') {
                const db = firebase.firestore();
                await db.collection(FCM_CONFIG.tokensCollection).doc(currentUserId).delete();
                console.log('🗑️ [FCM] تم حذف Token من Firestore');
            }
            fcmToken = null;
            currentUserId = null;
            fcmInitialized = false;
            localStorage.removeItem('abshar_fcm_token');
            localStorage.removeItem('abshar_fcm_user');
            return true;
        } catch (error) {
            console.error('❌ [FCM] خطأ في حذف Token:', error.message);
            return false;
        }
    }

    function getCurrentFCMToken() {
        return fcmToken || localStorage.getItem('abshar_fcm_token');
    }

    function testSound() {
        console.log('🔔 اختبار نغمة الجرس...');
        console.log('📁 الملف:', usingFallback ? 'احتياطي' : 'bell.mp3');
        unlockAudio();
        setTimeout(function() {
            playBell();
        }, 300);
    }

    window.AbsharSound = {
        init: init,
        play: playSound,
        stop: stopBell,
        unlock: unlockAudio,
        test: testSound,
        requestPermission: requestNotificationPermission,
        registerSW: function() {
            if ('serviceWorker' in navigator) {
                return navigator.serviceWorker.register('service-worker.js', { scope: './' });
            }
            return Promise.resolve();
        },
        initFCM: initFCM,
        deleteFCMToken: deleteFCMToken,
        getFCMToken: getCurrentFCMToken,
        getFCMStatus: function() {
            return {
                initialized: fcmInitialized,
                hasToken: !!fcmToken,
                userId: currentUserId
            };
        },
        isUnlocked: function() { return audioUnlocked; },
        isUsingFallback: function() { return usingFallback; }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('%c🔔 نظام الصوت + FCM - أبشر بي v10.6.0', 'color: #D4AF37; font-weight: bold; font-size: 14px;');
    console.log('%c🎵 يستخدم: bell.mp3', 'color: #27AE60; font-weight: bold;');
    console.log('%c📬 FCM: جاهز للتهيئة', 'color: #3498DB; font-weight: bold;');
    console.log('%c🚀 للتهيئة: AbsharSound.initFCM(userId)', 'color: #E67E22; font-weight: bold;');

})();