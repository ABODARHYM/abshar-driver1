// ================================================================
// 🚴 ABSHER BE CORE - أبشر بي
// ================================================================
// النظام الموحد المتكامل v10.2.0
// التاريخ: 2026-09-28
// 
// ملاحظة: هذا الملف يُنسخ إلى جميع التطبيقات الأربعة:
//    - zain-admin/  (تطبيق المالك)
//    - zain-store/  (تطبيق المتجر)
//    - zain-driver/ (تطبيق المندوب)
//    - zain-app/    (تطبيق العملاء)
//
// ⚠️ اسم الملف يبقى zain-core.js للتوافق مع الملفات الحالية
// ================================================================

(function() {
    'use strict';

    // ================================================================
    // 1. Firebase Configuration
    // ================================================================
    const FIREBASE_CONFIG = {
        apiKey: "AIzaSyBDwnZz-uV5PVrsUAGio_9OtFKI_h8oczA",
        authDomain: "haven-stores.firebaseapp.com",
        projectId: "haven-stores",
        storageBucket: "haven-stores.firebasestorage.app",
        messagingSenderId: "638009290396",
        appId: "1:638009290396:web:dc5963f171b87104ab0759",
        measurementId: "G-HJ09HG3B6N"
    };

    // ================================================================
    // 2. Initialize Firebase
    // ================================================================
    if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
    }

    const db = firebase.firestore();
    const auth = firebase.auth();
    let storage = null;
    try {
        if (firebase.storage && typeof firebase.storage === 'function') {
            storage = firebase.storage();
        }
    } catch (e) {
        console.warn('Firebase Storage غير متوفر');
    }

    // ================================================================
    // 3. روابط التطبيقات الأربعة
    // ================================================================
    const APPS_URLS = {
        admin: {
            local: '../zain-admin/',
            online: 'https://dark-term-1828.abodarhym-2004.workers.dev/',
            loginPage: 'login.html',
            homePage: 'admin.html',
            name: 'تطبيق الإدارة',
            icon: '👑'
        },
        store: {
            local: '../zain-store/',
            online: 'https://shrill-wildflower-191b.abodarhym-2004.workers.dev/',
            loginPage: 'login.html',
            homePage: 'stores.html',
            name: 'تطبيق المتجر',
            icon: '🏪'
        },
        driver: {
            local: '../zain-driver/',
            online: 'https://frosty-morning-ea07.abodarhym-2004.workers.dev/',
            loginPage: 'login.html',
            homePage: 'drivers.html',
            name: 'تطبيق المندوب',
            icon: '🛵'
        },
        customer: {
            local: '../zain-app/',
            online: 'https://flat-dream-9cbah.abodarhym-2004.workers.dev/',
            loginPage: 'login.html',
            homePage: 'customer.html',
            name: 'تطبيق العملاء',
            icon: '👤'
        }
    };

    // ================================================================
    // 4. كشف التطبيق الحالي تلقائياً
    // ================================================================
    function detectCurrentApp() {
        const path = window.location.pathname;
        const href = window.location.href;
        
        if (path.indexOf('zain-admin') !== -1 || href.indexOf('zain-admin') !== -1) return 'admin';
        if (path.indexOf('zain-store') !== -1 || href.indexOf('zain-store') !== -1) return 'store';
        if (path.indexOf('zain-driver') !== -1 || href.indexOf('zain-driver') !== -1) return 'driver';
        if (path.indexOf('zain-app') !== -1 || href.indexOf('zain-app') !== -1) return 'customer';
        
        return 'customer';
    }

    const CURRENT_APP = detectCurrentApp();

    // ================================================================
    // 5. Role Definitions
    // ================================================================
    const ROLES = {
        SUPER_ADMIN: 'super_admin',
        STORE_OWNER: 'store_owner',
        DRIVER: 'driver',
        CUSTOMER: 'customer',
        GUEST: 'guest'
    };

    const ROLE_CONFIG = {
        super_admin: {
            name: 'المالك العام',
            nameEn: 'Super Admin',
            icon: '👑',
            color: '#D4AF37',
            gradient: 'linear-gradient(135deg, #D4AF37, #F4D03F)',
            homePage: 'admin.html',
            appType: 'admin',
            description: 'إدارة كاملة للمنصة'
        },
        store_owner: {
            name: 'مالك متجر',
            nameEn: 'Store Owner',
            icon: '🏪',
            color: '#3498db',
            gradient: 'linear-gradient(135deg, #3498db, #5dade2)',
            homePage: 'stores.html',
            appType: 'store',
            description: 'إدارة متجرك والطلبات'
        },
        driver: {
            name: 'مندوب توصيل',
            nameEn: 'Driver',
            icon: '🛵',
            color: '#e67e22',
            gradient: 'linear-gradient(135deg, #e67e22, #f39c12)',
            homePage: 'drivers.html',
            appType: 'driver',
            description: 'استلام وتوصيل الطلبات'
        },
        customer: {
            name: 'عميل',
            nameEn: 'Customer',
            icon: '👤',
            color: '#2C5F2D',
            gradient: 'linear-gradient(135deg, #2C5F2D, #6A7F3A)',
            homePage: 'customer.html',
            appType: 'customer',
            description: 'اطلب من المتاجر'
        }
    };

    // ================================================================
    // 6. Brand - الهوية البصرية (أبشر بي)
    // ================================================================
    const BRAND = {
        name: 'أبشر بي',
        nameEn: 'ABSHER BE',
        icon: '🚴',
        tagline: 'طلبك علينا',
        taglineEn: 'WE\'VE GOT YOUR ORDER',
        slogan: 'من عندهم إلى عندك',
        
        slogans: [
            'اطلبها، أبشر بي',
            'من عندهم إلى عندك',
            'كل اللي تبيه، أبشر بي',
            'طلبك علينا',
            'أقرب لك'
        ],
        
        businessDesc: 'ABSHER BE DELIVERY',
        appTagline: '🚴 Delivery & More',
        
        colors: {
            primary: '#2C5F2D',
            primaryLight: '#6A7F3A',
            primaryLighter: '#8FAA5C',
            gold: '#D4AF37',
            goldLight: '#F4D03F',
            dark: '#1A1A2E',
            darkLight: '#2A2A3A',
            white: '#FFFFFF',
            black: '#0A0A0A',
            gray: '#F5F0E7',
            grayLight: '#E8E0D5',
            grayDark: '#2A2A3A',
            success: '#27AE60',
            successLight: '#2ECC71',
            warning: '#F39C12',
            warningLight: '#F1C40F',
            danger: '#E74C3C',
            dangerLight: '#C0392B',
            info: '#3498DB',
            infoLight: '#5DADE2'
        },
        
        phone: '784949495',
        email: 'info@absharbe.ye',
        domain: 'absharbe.ye',
        address: 'اليمن - مارب'
    };

    // ================================================================
    // 7. Phone Auth Helpers
    // ================================================================
    const PhoneAuth = {
        FAKE_EMAIL_DOMAIN: '@absharbe.ye',
        VALID_PREFIXES: ['70', '71', '73', '77', '78'],
        COUNTRY_CODE: '967',
        
        cleanPhone(phone) {
            if (!phone) return '';
            return String(phone).replace(/[^0-9]/g, '');
        },
        
        isValidYemeniPhone(phone) {
            const cleaned = this.cleanPhone(phone);
            let local = cleaned;
            if (local.startsWith('967')) local = local.substring(3);
            if (local.startsWith('0')) local = local.substring(1);
            
            if (local.length !== 9) return false;
            
            const prefix = local.substring(0, 2);
            return this.VALID_PREFIXES.indexOf(prefix) !== -1;
        },
        
        getLocalPhone(phone) {
            let cleaned = this.cleanPhone(phone);
            if (cleaned.startsWith('967')) cleaned = cleaned.substring(3);
            if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
            return cleaned;
        },
        
        phoneToEmail(phone) {
            const local = this.getLocalPhone(phone);
            return local + this.COUNTRY_CODE + this.FAKE_EMAIL_DOMAIN;
        },
        
        phoneToEmailSimple(phone) {
            const local = this.getLocalPhone(phone);
            return local + this.FAKE_EMAIL_DOMAIN;
        },
        
        getFullPhone(phone) {
            const local = this.getLocalPhone(phone);
            return '+' + this.COUNTRY_CODE + local;
        },
        
        formatPhone(phone) {
            const local = this.getLocalPhone(phone);
            if (local.length === 9) {
                return local.substring(0, 3) + ' ' + 
                       local.substring(3, 6) + ' ' + 
                       local.substring(6, 9);
            }
            return local;
        },
        
        emailToPhone(email) {
            if (!email) return '';
            if (email.indexOf(this.FAKE_EMAIL_DOMAIN) === -1) return '';
            
            let local = email.replace(this.FAKE_EMAIL_DOMAIN, '');
            if (local.endsWith(this.COUNTRY_CODE)) {
                local = local.substring(0, local.length - 3);
            }
            return local;
        },
        
        isFakeEmail(email) {
            if (!email) return false;
            return email.indexOf(this.FAKE_EMAIL_DOMAIN) !== -1;
        },
        
        getValidationError(phone) {
            const cleaned = this.cleanPhone(phone);
            
            if (!cleaned) return 'الرجاء إدخال رقم الهاتف';
            
            let local = cleaned;
            if (local.startsWith('967')) local = local.substring(3);
            if (local.startsWith('0')) local = local.substring(1);
            
            if (local.length < 9) return 'رقم الهاتف قصير جداً (يجب 9 أرقام)';
            if (local.length > 9) return 'رقم الهاتف طويل جداً (يجب 9 أرقام)';
            
            const prefix = local.substring(0, 2);
            if (this.VALID_PREFIXES.indexOf(prefix) === -1) {
                return 'البادئة ' + prefix + ' غير مدعومة. المسموح: 70، 71، 73، 77، 78';
            }
            
            return null;
        },
        
        generateCustomerName(phone) {
            const local = this.getLocalPhone(phone);
            if (local) {
                return 'عميل ' + local;
            }
            return 'عميل';
        }
    };

    // ================================================================
    // 8. Helpers
    // ================================================================
    const Helpers = {
        getDateString(date) {
            if (!date) return '';
            try {
                if (date.toDate && typeof date.toDate === 'function') {
                    return date.toDate().toISOString().split('T')[0];
                }
                if (typeof date === 'string') return date.split('T')[0];
                if (date instanceof Date) return date.toISOString().split('T')[0];
                return new Date(date).toISOString().split('T')[0];
            } catch (e) {
                return '';
            }
        },

        getFullDateString(date) {
            if (!date) return '-';
            try {
                let d;
                if (date.toDate && typeof date.toDate === 'function') {
                    d = date.toDate();
                } else if (typeof date === 'string') {
                    d = new Date(date);
                } else if (date instanceof Date) {
                    d = date;
                } else {
                    d = new Date(date);
                }
                return d.toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } catch (e) {
                return '-';
            }
        },

        getShortDate(date) {
            if (!date) return '-';
            try {
                let d;
                if (date.toDate && typeof date.toDate === 'function') {
                    d = date.toDate();
                } else if (typeof date === 'string') {
                    d = new Date(date);
                } else if (date instanceof Date) {
                    d = date;
                } else {
                    d = new Date(date);
                }
                return d.toLocaleDateString('ar-EG');
            } catch (e) {
                return '-';
            }
        },

        getTimeString(date) {
            if (!date) return '';
            try {
                let d;
                if (date.toDate && typeof date.toDate === 'function') {
                    d = date.toDate();
                } else if (typeof date === 'string') {
                    d = new Date(date);
                } else if (date instanceof Date) {
                    d = date;
                } else {
                    d = new Date(date);
                }
                return d.toLocaleTimeString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (e) {
                return '';
            }
        },

        getDateTimeString(date) {
            if (!date) return '-';
            try {
                let d;
                if (date.toDate && typeof date.toDate === 'function') {
                    d = date.toDate();
                } else if (typeof date === 'string') {
                    d = new Date(date);
                } else if (date instanceof Date) {
                    d = date;
                } else {
                    d = new Date(date);
                }
                return d.toLocaleString('ar-EG');
            } catch (e) {
                return '-';
            }
        },

        getRelativeTime(date) {
            if (!date) return '-';
            try {
                let d;
                if (date.toDate && typeof date.toDate === 'function') {
                    d = date.toDate();
                } else if (typeof date === 'string') {
                    d = new Date(date);
                } else if (date instanceof Date) {
                    d = date;
                } else {
                    d = new Date(date);
                }
                
                const now = new Date();
                const diff = Math.floor((now - d) / 1000);
                
                if (diff < 0) return 'الآن';
                if (diff < 60) return 'الآن';
                if (diff < 3600) return 'منذ ' + Math.floor(diff / 60) + ' دقيقة';
                if (diff < 86400) return 'منذ ' + Math.floor(diff / 3600) + ' ساعة';
                if (diff < 604800) return 'منذ ' + Math.floor(diff / 86400) + ' يوم';
                if (diff < 2592000) return 'منذ ' + Math.floor(diff / 604800) + ' أسبوع';
                return this.getShortDate(date);
            } catch (e) {
                return '-';
            }
        },

        formatArabicDate(date) {
            const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
            const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                           'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
            try {
                let d;
                if (date.toDate && typeof date.toDate === 'function') {
                    d = date.toDate();
                } else if (typeof date === 'string') {
                    d = new Date(date);
                } else if (date instanceof Date) {
                    d = date;
                } else {
                    d = new Date(date);
                }
                return days[d.getDay()] + '، ' + d.getDate() + ' ' + months[d.getMonth()];
            } catch (e) {
                return '-';
            }
        },

        isToday(date) {
            if (!date) return false;
            return this.getDateString(date) === new Date().toISOString().split('T')[0];
        },

        isYesterday(date) {
            if (!date) return false;
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return this.getDateString(date) === yesterday.toISOString().split('T')[0];
        },

        isThisWeek(date) {
            if (!date) return false;
            const now = new Date();
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            weekStart.setHours(0, 0, 0, 0);
            let dateObj;
            if (date.toDate && typeof date.toDate === 'function') {
                dateObj = date.toDate();
            } else {
                dateObj = new Date(date);
            }
            return dateObj >= weekStart && dateObj <= now;
        },

        isThisMonth(date) {
            if (!date) return false;
            const now = new Date();
            let dateObj;
            if (date.toDate && typeof date.toDate === 'function') {
                dateObj = date.toDate();
            } else {
                dateObj = new Date(date);
            }
            return dateObj.getMonth() === now.getMonth() &&
                   dateObj.getFullYear() === now.getFullYear();
        },
      /**
 * التحقق من أن التاريخ اليوم
 */
isToday: function(dateStr) {
    if (!dateStr) return false;
    try {
        const date = new Date(dateStr);
        const today = new Date();
        return date.getFullYear() === today.getFullYear() &&
               date.getMonth() === today.getMonth() &&
               date.getDate() === today.getDate();
    } catch (e) {
        return false;
    }
},

/**
 * التحقق من أن التاريخ أمس
 */
isYesterday: function(dateStr) {
    if (!dateStr) return false;
    try {
        const date = new Date(dateStr);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return date.getFullYear() === yesterday.getFullYear() &&
               date.getMonth() === yesterday.getMonth() &&
               date.getDate() === yesterday.getDate();
    } catch (e) {
        return false;
    }
},

/**
 * التحقق من أن التاريخ هذا الأسبوع
 */
isThisWeek: function(dateStr) {
    if (!dateStr) return false;
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date >= weekAgo;
    } catch (e) {
        return false;
    }
},

/**
 * التحقق من أن التاريخ هذا الشهر
 */
isThisMonth: function(dateStr) {
    if (!dateStr) return false;
    try {
        const date = new Date(dateStr);
        const today = new Date();
        return date.getFullYear() === today.getFullYear() &&
               date.getMonth() === today.getMonth();
    } catch (e) {
        return false;
    }
},

/**
 * تنسيق الوقت (HH:MM)
 */
formatTime: function(dateStr) {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return '';
    }
},

/**
 * تنسيق التاريخ فقط (YYYY-MM-DD)
 */
formatDate: function(dateStr) {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
    } catch (e) {
        return '';
    }
},

/**
 * عدد الأيام بين تاريخين
 */
daysBetween: function(date1, date2) {
    try {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diff = Math.abs(d2 - d1);
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    } catch (e) {
        return 0;
    }
},

/**
 * الوقت النسبي (منذ...)
 */
getRelativeTime: function(dateStr) {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 0) return 'الآن';
        if (diff < 60) return 'الآن';
        if (diff < 3600) return 'قبل ' + Math.floor(diff / 60) + ' دقيقة';
        if (diff < 86400) return 'قبل ' + Math.floor(diff / 3600) + ' ساعة';
        if (diff < 172800) return 'أمس';
        if (diff < 604800) return 'قبل ' + Math.floor(diff / 86400) + ' يوم';
        if (diff < 2592000) return 'قبل ' + Math.floor(diff / 604800) + ' أسبوع';
        return date.toLocaleDateString('ar-EG');
    } catch (e) {
        return '';
    }
},

/**
 * التاريخ الكامل بالعربية
 */
getFullDateString: function(dateStr) {
    if (!dateStr) return '-';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return '-';
    }
},

/**
 * التاريخ المختصر
 */
getShortDateString: function(dateStr) {
    if (!dateStr) return '-';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ar-EG', {
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return '-';
    }
},

/**
 * تنسيق السعر
 */
formatPrice: function(price) {
    return Number(price || 0).toLocaleString('ar-EG') + ' ر.ي';
},

/**
 * التحقق من رقم الهاتف اليمني
 */
isValidYemeniPhone: function(phone) {
    if (!phone) return false;
    const cleaned = String(phone).replace(/[^0-9]/g, '');
    if (cleaned.length !== 9) return false;
    const prefix = cleaned.substring(0, 2);
    return ['70', '71', '73', '77', '78'].indexOf(prefix) !== -1;
},

/**
 * إنشاء بريد وهمي من رقم الهاتف
 */
phoneToEmail: function(phone) {
    const cleaned = String(phone).replace(/[^0-9]/g, '');
    return cleaned + '967@absharbe.ye';
},

/**
 * إنشاء اسم تلقائي للعميل
 */
generateCustomerName: function(phone) {
    const cleaned = String(phone).replace(/[^0-9]/g, '');
    return 'عميل ' + cleaned;
},

/**
 * الحصول على رابط خرائط جوجل
 */
getGoogleMapsUrl: function(lat, lng) {
    return 'https://www.google.com/maps?q=' + lat + ',' + lng;
},

/**
 * الحصول على رابط الاتجاهات
 */
getDirectionsUrl: function(fromLat, fromLng, toLat, toLng) {
    return 'https://www.google.com/maps/dir/?api=1' +
           '&origin=' + fromLat + ',' + fromLng +
           '&destination=' + toLat + ',' + toLng;
},


        calculateDistance(lat1, lng1, lat2, lng2) {
            if (!lat1 || !lng1 || !lat2 || !lng2) return 0;
            const R = 6371;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLng = (lng2 - lng1) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                      Math.sin(dLng / 2) * Math.sin(dLng / 2);
            return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        },

        calculateDeliveryFee(distance, baseFee) {
            baseFee = baseFee || 500;
            if (distance <= 1) return baseFee;
            if (distance <= 3) return baseFee + (distance - 1) * 100;
            if (distance <= 5) return baseFee + 200 + (distance - 3) * 80;
            if (distance <= 10) return baseFee + 360 + (distance - 5) * 60;
            return baseFee + 660 + (distance - 10) * 40;
        },

        generateCode(length) {
            length = length || 8;
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        },

        generateId(prefix) {
            prefix = prefix || 'id';
            return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },

        formatCurrency(amount) {
            return (amount || 0).toLocaleString('ar-EG') + ' ريال';
        },

        formatNumber(num) {
            return (num || 0).toLocaleString('ar-EG');
        },

        formatCompactNumber(num) {
            num = num || 0;
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
            return num.toString();
        },

        isValidEmail(email) {
            if (!email || typeof email !== 'string') return false;
            const atPos = email.indexOf('@');
            const dotPos = email.lastIndexOf('.');
            return atPos > 0 && dotPos > atPos + 1 && dotPos < email.length - 1;
        },

        isValidPhone(phone) {
            if (!phone) return false;
            const cleaned = phone.split(' ').join('').split('-').join('').split('+').join('');
            if (cleaned.length < 8) return false;
            for (let i = 0; i < cleaned.length; i++) {
                const c = cleaned.charAt(i);
                if (c < '0' || c > '9') return false;
            }
            return true;
        },

        delay(ms) {
            return new Promise(function(resolve) {
                setTimeout(resolve, ms);
            });
        },

        copyToClipboard(text) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function() {
                    Helpers.showToast('✅ تم النسخ', 'success');
                }).catch(function() {
                    Helpers.showToast('فشل النسخ', 'error');
                });
            } else {
                prompt('انسخ النص:', text);
            }
        },

        showToast(message, type, duration) {
            type = type || 'success';
            duration = duration || 3500;

            const colors = {
                success: BRAND.colors.success,
                error: BRAND.colors.danger,
                warning: BRAND.colors.warning,
                info: BRAND.colors.info
            };

            const icons = {
                success: 'fa-check-circle',
                error: 'fa-exclamation-triangle',
                warning: 'fa-exclamation-circle',
                info: 'fa-info-circle'
            };

            document.querySelectorAll('.abshar-toast, .zain-toast').forEach(function(t) {
                t.remove();
            });

            const toast = document.createElement('div');
            toast.className = 'abshar-toast';
            toast.style.cssText = 
                'position:fixed;' +
                'bottom:30px;' +
                'right:30px;' +
                'background:' + colors[type] + ';' +
                'color:white;' +
                'padding:16px 28px;' +
                'border-radius:15px;' +
                'z-index:10001;' +
                'box-shadow:0 15px 50px rgba(0,0,0,0.3);' +
                'font-size:15px;' +
                'max-width:380px;' +
                'direction:rtl;' +
                'display:flex;' +
                'align-items:center;' +
                'gap:12px;' +
                'font-family:Cairo,sans-serif;' +
                'font-weight:600;' +
                'animation:absharToastSlideIn 0.3s ease;';

            toast.innerHTML = 
                '<i class="fas ' + icons[type] + '"></i>' +
                '<span>' + message + '</span>';

            document.body.appendChild(toast);

            setTimeout(function() {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100px)';
                toast.style.transition = 'all 0.3s';
                setTimeout(function() {
                    toast.remove();
                }, 300);
            }, duration);
        },

        showLoader(text) {
            text = text || 'جاري التحميل...';

            let loader = document.getElementById('absharLoader');
            if (!loader) {
                loader = document.createElement('div');
                loader.id = 'absharLoader';
                loader.style.cssText = 
                    'position:fixed;top:0;left:0;width:100%;height:100%;' +
                    'background:rgba(26,26,46,0.9);z-index:99999;' +
                    'display:flex;align-items:center;justify-content:center;' +
                    'flex-direction:column;backdrop-filter:blur(5px);';
                document.body.appendChild(loader);
            }

            loader.innerHTML = 
                '<div style="width:80px;height:80px;background:linear-gradient(135deg,#2C5F2D,#6A7F3A);' +
                'border-radius:20px;display:flex;align-items:center;justify-content:center;' +
                'font-size:40px;box-shadow:0 20px 60px rgba(44,95,45,0.5);' +
                'animation:absharFloat 1.5s ease-in-out infinite;">🚴</div>' +
                '<div style="margin-top:20px;font-size:18px;font-weight:700;color:white;font-family:Cairo,sans-serif;">' +
                    text +
                '</div>' +
                '<div style="margin-top:15px;width:40px;height:40px;border:4px solid rgba(255,255,255,0.2);' +
                'border-top-color:#D4AF37;border-radius:50%;animation:absharSpin 0.8s linear infinite;"></div>';

            loader.style.display = 'flex';
        },

        hideLoader() {
            const loader = document.getElementById('absharLoader');
            if (loader) {
                loader.style.display = 'none';
                loader.remove();
            }
        },

        getAppsUrls() {
            const isLocal = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.protocol === 'file:';
            
            const urls = {};
            Object.keys(APPS_URLS).forEach(function(key) {
                urls[key] = isLocal ? APPS_URLS[key].local : APPS_URLS[key].online;
            });
            return urls;
        },

        navigateToApp(appType) {
            const urls = this.getAppsUrls();
            const appUrl = urls[appType];
            
            if (!appUrl) {
                this.showToast('التطبيق غير موجود', 'error');
                return;
            }
            
            console.log('الانتقال إلى:', appType, appUrl);
            window.location.href = appUrl;
        },

        getCurrentApp() {
            return CURRENT_APP;
        },

        isInApp(appType) {
            return CURRENT_APP === appType;
        },

        canAccessApp(userRole, appType) {
            const mapping = {
                'super_admin': 'admin',
                'store_owner': 'store',
                'driver': 'driver',
                'customer': 'customer'
            };
            
            return mapping[userRole] === appType;
        }
    };

    // ================================================================
    // 9. Events
    // ================================================================
    class EventBus {
        constructor() {
            this.events = {};
        }

        on(event, callback) {
            if (!this.events[event]) this.events[event] = [];
            this.events[event].push(callback);

            const self = this;
            return function() {
                const callbacks = self.events[event] || [];
                const index = callbacks.indexOf(callback);
                if (index > -1) callbacks.splice(index, 1);
            };
        }

        once(event, callback) {
            const self = this;
            const unsubscribe = this.on(event, function(data) {
                unsubscribe();
                callback(data);
            });
            return unsubscribe;
        }

        emit(event, data) {
            const callbacks = this.events[event] || [];
            callbacks.forEach(function(cb) {
                try {
                    cb(data);
                } catch (e) {
                    console.error('Event ' + event + ' error:', e);
                }
            });
        }

        clear(event) {
            if (event) {
                delete this.events[event];
            } else {
                this.events = {};
            }
        }
    }

    const Events = new EventBus();

    // ================================================================
    // 10. State Manager
    // ================================================================
    class StateManager {
        constructor() {
            this.state = {};
            this.loadFromStorage();
        }

        set(key, value) {
            const oldValue = this.state[key];
            this.state[key] = value;

            try {
                localStorage.setItem('abshar_' + key, JSON.stringify(value));
            } catch (e) {}

            Events.emit('state:' + key, {
                oldValue: oldValue,
                newValue: value
            });

            return value;
        }

        get(key, defaultValue) {
            if (this.state.hasOwnProperty(key)) {
                return this.state[key];
            }

            try {
                const stored = localStorage.getItem('abshar_' + key);
                if (stored) {
                    return JSON.parse(stored);
                }
            } catch (e) {}

            return defaultValue !== undefined ? defaultValue : null;
        }

        remove(key) {
            delete this.state[key];
            localStorage.removeItem('abshar_' + key);
            Events.emit('state:' + key, null);
        }

        clear() {
            const theme = this.state.theme;
            this.state = {};
            if (theme) this.state.theme = theme;

            Object.keys(localStorage).forEach(function(key) {
                if (key.indexOf('abshar_') === 0 || key.indexOf('zain_') === 0) {
                    localStorage.removeItem(key);
                }
            });
        }

        loadFromStorage() {
            const self = this;
            Object.keys(localStorage).forEach(function(key) {
                if (key.indexOf('abshar_') === 0) {
                    const stateKey = key.replace('abshar_', '');
                    try {
                        self.state[stateKey] = JSON.parse(localStorage.getItem(key));
                    } catch (e) {}
                } else if (key.indexOf('zain_') === 0) {
                    // ترحيل تلقائي من zain_ إلى abshar_
                    const stateKey = key.replace('zain_', '');
                    try {
                        const value = JSON.parse(localStorage.getItem(key));
                        self.state[stateKey] = value;
                        localStorage.setItem('abshar_' + stateKey, JSON.stringify(value));
                    } catch (e) {}
                }
            });
        }

        setUser(user) { return this.set('user', user); }
        getUser() { return this.get('user'); }
        isLoggedIn() { return !!this.getUser(); }
        getUserRole() { return this.get('userRole', 'guest'); }

        setCart(storeId, cart) {
            const carts = this.get('carts') || {};
            carts[storeId] = cart;
            return this.set('carts', carts);
        }

        getCart(storeId) {
            const carts = this.get('carts') || {};
            return carts[storeId] || [];
        }
    }

    const State = new StateManager();

    // ================================================================
    // 11. Navigation
    // ================================================================
    class Navigation {
        constructor() {
            this.currentPage = this.getCurrentPageName();
            this.setupPrefetchOnHover();
        }

        getCurrentPageName() {
            const path = window.location.pathname;
            return path.split('/').pop() || 'index.html';
        }

        setupPrefetchOnHover() {
            document.addEventListener('mouseover', function(e) {
                const link = e.target.closest('a[href]');
                if (!link) return;

                const href = link.getAttribute('href');
                if (!href || 
                    href.indexOf('http') === 0 || 
                    href.indexOf('#') === 0 ||
                    href.indexOf('mailto:') === 0 ||
                    href.indexOf('tel:') === 0 ||
                    link.target === '_blank') {
                    return;
                }

                if (href.indexOf('.html') !== -1) {
                    Navigation.prototype.prefetchPage(href);
                }
            }, { passive: true });
        }

        prefetchPage(url) {
            const cleanUrl = url.split('?')[0];
            if (document.querySelector('link[rel="prefetch"][href="' + cleanUrl + '"]')) return;

            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = cleanUrl;
            link.as = 'document';
            document.head.appendChild(link);
        }

        navigate(url) {
            window.location.href = url;
        }

        goTo(page, params) {
            let url = page;
            params = params || {};
            const urlParams = new URLSearchParams(params);
            if (urlParams.toString()) {
                url += '?' + urlParams.toString();
            }
            window.location.href = url;
        }

        goBack() {
            window.history.back();
        }

        reload() {
            window.location.reload();
        }

        redirectByRole(role) {
            const config = ROLE_CONFIG[role];
            if (!config) {
                window.location.href = 'login.html';
                return;
            }
            
            const appType = config.appType;
            const urls = Helpers.getAppsUrls();
            const appUrl = urls[appType];
            
            if (appUrl) {
                window.location.href = appUrl;
            } else {
                window.location.href = config.homePage;
            }
        }
    }

    const Navigator = new Navigation();

    // ================================================================
    // 12. Security Manager
    // ================================================================
    class SecurityManager {
        async isSuperAdmin(user) {
            const currentUser = user || auth.currentUser;
            if (!currentUser) return false;

            try {
                const doc = await db.collection('settings').doc('super_admin').get();
                return doc.exists && doc.data().email === currentUser.email;
            } catch (e) {
                return false;
            }
        }

        async isDriver(user) {
            const currentUser = user || auth.currentUser;
            if (!currentUser) return false;

            try {
                const doc = await db.collection('drivers').doc(currentUser.uid).get();
                return doc.exists;
            } catch (e) {
                return false;
            }
        }

        async isStoreOwner(user) {
            const currentUser = user || auth.currentUser;
            if (!currentUser) return false;

            try {
                const snap = await db.collection('stores')
                    .where('ownerId', '==', currentUser.uid)
                    .limit(1)
                    .get();
                return !snap.empty;
            } catch (e) {
                return false;
            }
        }

        async getUserRole(user) {
            const currentUser = user || auth.currentUser;
            if (!currentUser) return ROLES.GUEST;

            if (await this.isSuperAdmin(currentUser)) return ROLES.SUPER_ADMIN;
            if (await this.isDriver(currentUser)) return ROLES.DRIVER;
            if (await this.isStoreOwner(currentUser)) return ROLES.STORE_OWNER;
            return ROLES.CUSTOMER;
        }

        async waitForAuth() {
            return new Promise(function(resolve) {
                if (auth.currentUser) {
                    resolve(auth.currentUser);
                    return;
                }

                const unsub = auth.onAuthStateChanged(function(user) {
                    unsub();
                    resolve(user);
                });

                setTimeout(function() {
                    unsub();
                    resolve(auth.currentUser);
                }, 5000);
            });
        }

        async requireAuth() {
            if (!auth.currentUser) {
                window.location.href = 'login.html';
                throw new Error('يجب تسجيل الدخول');
            }
            return auth.currentUser;
        }

        async checkAppAccess() {
            const user = auth.currentUser;
            if (!user) return true;
            
            const role = await this.getUserRole(user);
            const canAccess = Helpers.canAccessApp(role, CURRENT_APP);
            
            if (!canAccess) {
                console.warn('المستخدم لا يملك صلاحية للتطبيق الحالي');
                
                const roleConfig = ROLE_CONFIG[role];
                if (roleConfig) {
                    Zain.toast('يتم تحويلك للتطبيق المناسب...', 'info');
                    
                    await Helpers.delay(1500);
                    
                    const urls = Helpers.getAppsUrls();
                    const correctAppUrl = urls[roleConfig.appType];
                    
                    if (correctAppUrl) {
                        window.location.href = correctAppUrl;
                    }
                }
                
                return false;
            }
            
            return true;
        }

        async logout() {
            try {
                const user = auth.currentUser;
                if (user) {
                    try {
                        const driverDoc = await db.collection('drivers').doc(user.uid).get();
                        if (driverDoc.exists) {
                            await db.collection('drivers').doc(user.uid).update({
                                status: 'offline',
                                lastSeen: new Date().toISOString()
                            });
                        }
                    } catch (e) {}
                }

                await auth.signOut();

                const theme = localStorage.getItem('abshar_theme');
                const lastPhone = localStorage.getItem('abshar_last_phone');

                localStorage.clear();
                if (theme) localStorage.setItem('abshar_theme', theme);
                if (lastPhone) localStorage.setItem('abshar_last_phone', lastPhone);

                window.location.href = 'login.html';
            } catch (error) {
                console.error('خطأ في تسجيل الخروج:', error);
                try {
                    await auth.signOut();
                } catch (e) {}
                window.location.href = 'login.html';
            }
        }
    }

    const Security = new SecurityManager();

    // ================================================================
    // 13. Theme Manager
    // ================================================================
    class ThemeManager {
        init() {
            const apply = function() {
                if (!document.body) {
                    setTimeout(apply, 50);
                    return;
                }

                const saved = localStorage.getItem('abshar_theme') || 
                              localStorage.getItem('theme');

                if (saved === 'dark') {
                    document.body.classList.add('dark-mode');
                }
            };

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', apply);
            } else {
                apply();
            }
        }

        toggle() {
            try {
                if (!document.body) return false;

                document.body.classList.toggle('dark-mode');
                const isDark = document.body.classList.contains('dark-mode');

                localStorage.setItem('abshar_theme', isDark ? 'dark' : 'light');
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
                State.set('theme', isDark ? 'dark' : 'light');
                Events.emit('theme:changed', isDark ? 'dark' : 'light');

                return isDark;
            } catch (e) {
                return false;
            }
        }

        isDark() {
            return document.body ? document.body.classList.contains('dark-mode') : false;
        }
    }

    const Theme = new ThemeManager();

    // ================================================================
    // 14. Notification System
    // ================================================================
    class NotificationSystem {
        async save(userId, notification) {
            try {
                const docRef = await db.collection('notifications').add({
                    userId: userId,
                    title: notification.title,
                    body: notification.body,
                    type: notification.type || 'info',
                    icon: notification.icon || 'fa-bell',
                    data: notification.data || {},
                    read: false,
                    createdAt: new Date().toISOString()
                });
                return docRef.id;
            } catch (error) {
                console.error('خطأ في حفظ الإشعار:', error);
                return null;
            }
        }

        async notifyUser(userId, title, body, data) {
            data = data || {};
            return this.save(userId, {
                title: title,
                body: body,
                data: data,
                type: 'info'
            });
        }

        async notifySuperAdmin(title, body, data) {
            data = data || {};
            try {
                const doc = await db.collection('settings').doc('super_admin').get();
                if (doc.exists && doc.data().uid) {
                    return this.save(doc.data().uid, {
                        title: title,
                        body: body,
                        data: data,
                        type: 'admin',
                        icon: 'fa-crown'
                    });
                }
            } catch (e) {}
            return null;
        }

        async notifyDriver(driverId, title, body, data) {
            data = data || {};
            return this.save(driverId, {
                title: title,
                body: body,
                data: data,
                type: 'driver',
                icon: 'fa-motorcycle'
            });
        }

        async notifyStore(storeId, title, body, data) {
            data = data || {};
            return this.save(storeId, {
                title: title,
                body: body,
                data: data,
                type: 'store',
                icon: 'fa-store'
            });
        }

        async getUserNotifications(limit) {
            limit = limit || 50;
            const user = auth.currentUser;
            if (!user) return [];

            try {
                const snap = await db.collection('notifications')
                    .where('userId', '==', user.uid)
                    .limit(limit)
                    .get();

                return snap.docs
                    .map(function(doc) {
                        const data = doc.data();
                        data.id = doc.id;
                        return data;
                    })
                    .sort(function(a, b) {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    });
            } catch (error) {
                return [];
            }
        }

        async getUnreadCount() {
            const user = auth.currentUser;
            if (!user) return 0;

            try {
                const snap = await db.collection('notifications')
                    .where('userId', '==', user.uid)
                    .where('read', '==', false)
                    .get();
                return snap.size;
            } catch (error) {
                return 0;
            }
        }

        async markAsRead(notificationId) {
            try {
                await db.collection('notifications').doc(notificationId).update({
                    read: true,
                    readAt: new Date().toISOString()
                });
            } catch (error) {}
        }

        async markAllAsRead() {
            const user = auth.currentUser;
            if (!user) return 0;

            try {
                const snap = await db.collection('notifications')
                    .where('userId', '==', user.uid)
                    .where('read', '==', false)
                    .get();

                const batch = db.batch();
                snap.docs.forEach(function(doc) {
                    batch.update(doc.ref, {
                        read: true,
                        readAt: new Date().toISOString()
                    });
                });
                await batch.commit();
                return snap.size;
            } catch (error) {
                return 0;
            }
        }

        async deleteNotification(notificationId) {
            try {
                await db.collection('notifications').doc(notificationId).delete();
            } catch (error) {}
        }

        async deleteAllNotifications() {
            const user = auth.currentUser;
            if (!user) return 0;

            try {
                const snap = await db.collection('notifications')
                    .where('userId', '==', user.uid)
                    .get();

                const batch = db.batch();
                snap.docs.forEach(function(doc) {
                    batch.delete(doc.ref);
                });
                await batch.commit();
                return snap.size;
            } catch (error) {
                return 0;
            }
        }

        playSound() {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) return;

                const ctx = new AudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.frequency.value = 800;
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            } catch (e) {}
        }

        async requestPermission() {
            if (!('Notification' in window)) return false;
            try {
                if (Notification.permission === 'granted') return true;
                if (Notification.permission === 'denied') return false;

                const permission = await Notification.requestPermission();
                return permission === 'granted';
            } catch (e) {
                return false;
            }
        }

        listenForNewNotifications(callback) {
            const user = auth.currentUser;
            if (!user) return null;

            const self = this;
            const unsubscribe = db.collection('notifications')
                .where('userId', '==', user.uid)
                .onSnapshot(function(snapshot) {
                    snapshot.docChanges().forEach(function(change) {
                        if (change.type === 'added') {
                            const data = change.doc.data();
                            data.id = change.doc.id;

                            const age = Date.now() - new Date(data.createdAt).getTime();
                            if (age < 10000 && !data.read) {
                                self.playSound();
                                Helpers.showToast(data.title, 'info');
                                if (callback) callback(data);
                            }
                        }
                    });
                });

            return unsubscribe;
        }
    }

    const Notifications = new NotificationSystem();

    // ================================================================
    // 15. Cart System
    // ================================================================
    class CartSystem {
        constructor() {
            this.currentStoreId = null;
        }

        setStore(storeId) {
            this.currentStoreId = storeId;
            State.set('currentStoreId', storeId);
        }

        getCart() {
            if (!this.currentStoreId) return [];
            return State.getCart(this.currentStoreId);
        }

        addItem(product, quantity) {
            quantity = quantity || 1;
            const cart = this.getCart();
            const existing = cart.find(function(i) {
                return i.id === product.id;
            });

            if (existing) {
                existing.quantity += quantity;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: quantity
                });
            }

            this.saveCart(cart);
            Events.emit('cart:updated', cart);
            return cart;
        }

        removeItem(productId) {
            let cart = this.getCart();
            cart = cart.filter(function(i) {
                return i.id !== productId;
            });
            this.saveCart(cart);
            Events.emit('cart:updated', cart);
            return cart;
        }

        updateQuantity(productId, newQuantity) {
            if (newQuantity <= 0) {
                return this.removeItem(productId);
            }

            const cart = this.getCart();
            const item = cart.find(function(i) {
                return i.id === productId;
            });

            if (item) {
                item.quantity = newQuantity;
                this.saveCart(cart);
                Events.emit('cart:updated', cart);
            }

            return cart;
        }

        saveCart(cart) {
            if (this.currentStoreId) {
                State.setCart(this.currentStoreId, cart);
            }
        }

        clear() {
            if (this.currentStoreId) {
                State.setCart(this.currentStoreId, []);
            }
            Events.emit('cart:updated', []);
        }

        getTotal() {
            const cart = this.getCart();
            return {
                count: cart.reduce(function(sum, i) {
                    return sum + i.quantity;
                }, 0),
                subtotal: cart.reduce(function(sum, i) {
                    return sum + (i.price * i.quantity);
                }, 0)
            };
        }
    }

    const Cart = new CartSystem();

    // ================================================================
    // 16. Orders System
    // ================================================================
    class OrderSystem {
        async create(orderData) {
            const user = auth.currentUser;

            try {
                const order = Object.assign({}, orderData, {
                    customerId: user ? user.uid : null,
                    customerName: orderData.customerName ||
                                 (user ? user.displayName : null) ||
                                 'زائر',
                    status: 'pending',
                    trackingCode: Helpers.generateCode(8),
                    createdAt: new Date().toISOString()
                });

                const docRef = await db.collection('orders').add(order);
                const fullOrder = Object.assign({ id: docRef.id }, order);

                Events.emit('order:created', fullOrder);

                return fullOrder;
            } catch (error) {
                console.error('خطأ في إنشاء الطلب:', error);
                throw error;
            }
        }

        async updateStatus(orderId, newStatus, metadata) {
            metadata = metadata || {};

            try {
                const updateData = {
                    status: newStatus,
                    updatedAt: new Date().toISOString()
                };

                updateData[newStatus + 'At'] = new Date().toISOString();

                if (metadata.driverId) {
                    updateData.driverId = metadata.driverId;
                    updateData.driverName = metadata.driverName;
                    updateData.driverAssignedAt = new Date().toISOString();
                }

                if (metadata.reason) {
                    updateData.cancellationReason = metadata.reason;
                }

                await db.collection('orders').doc(orderId).update(updateData);

                const order = await this.getById(orderId);

                if (order) {
                    const statusMessages = {
                        confirmed: 'تم تأكيد الطلب',
                        preparing: 'بدء التحضير',
                        ready: 'جاهز للتوصيل',
                        delivering: 'في الطريق',
                        delivered: 'تم التوصيل',
                        cancelled: 'تم الإلغاء'
                    };

                    const message = statusMessages[newStatus];

                    if (message && order.customerId) {
                        await Notifications.notifyUser(
                            order.customerId,
                            message,
                            'طلبك #' + (order.trackingCode || orderId.slice(-8)),
                            { orderId: orderId }
                        );
                    }
                }

                Events.emit('order:updated', Object.assign({
                    orderId: orderId,
                    newStatus: newStatus
                }, metadata));

                return updateData;
            } catch (error) {
                throw error;
            }
        }

        async confirm(orderId) { 
            return this.updateStatus(orderId, 'confirmed'); 
        }

        async startPreparing(orderId) { 
            return this.updateStatus(orderId, 'preparing'); 
        }

        async markReady(orderId) { 
            return this.updateStatus(orderId, 'ready'); 
        }

        async assignDriver(orderId, driverId, driverName) {
            return this.updateStatus(orderId, 'delivering', {
                driverId: driverId,
                driverName: driverName
            });
        }

        async markDelivered(orderId) { 
            return this.updateStatus(orderId, 'delivered'); 
        }

        async cancel(orderId, reason) {
            return this.updateStatus(orderId, 'cancelled', { reason: reason || '' });
        }

        async getById(orderId) {
            try {
                const doc = await db.collection('orders').doc(orderId).get();
                if (!doc.exists) return null;
                return Object.assign({ id: doc.id }, doc.data());
            } catch (error) {
                return null;
            }
        }

        async getCustomerOrders(customerId, limit) {
            limit = limit || 50;

            try {
                const snap = await db.collection('orders')
                    .where('customerId', '==', customerId)
                    .limit(limit)
                    .get();

                return snap.docs
                    .map(function(doc) {
                        return Object.assign({ id: doc.id }, doc.data());
                    })
                    .sort(function(a, b) {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    });
            } catch (error) {
                return [];
            }
        }

        async getStoreOrders(storeId, limit) {
            limit = limit || 50;

            try {
                const snap = await db.collection('orders')
                    .where('storeId', '==', storeId)
                    .limit(limit)
                    .get();

                return snap.docs
                    .map(function(doc) {
                        return Object.assign({ id: doc.id }, doc.data());
                    })
                    .sort(function(a, b) {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    });
            } catch (error) {
                return [];
            }
        }

        async getDriverOrders(driverId) {
            try {
                const snap = await db.collection('orders')
                    .where('driverId', '==', driverId)
                    .get();

                return snap.docs.map(function(doc) {
                    return Object.assign({ id: doc.id }, doc.data());
                });
            } catch (error) {
                return [];
            }
        }

        async getAllOrders(limit) {
            limit = limit || 200;

            try {
                const snap = await db.collection('orders')
                    .limit(limit)
                    .get();

                return snap.docs
                    .map(function(doc) {
                        return Object.assign({ id: doc.id }, doc.data());
                    })
                    .sort(function(a, b) {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    });
            } catch (error) {
                return [];
            }
        }

        async getReadyOrders() {
            try {
                const snap = await db.collection('orders')
                    .where('status', '==', 'ready')
                    .get();

                return snap.docs.map(function(doc) {
                    return Object.assign({ id: doc.id }, doc.data());
                });
            } catch (error) {
                return [];
            }
        }

        subscribeToOrder(orderId, callback) {
            return db.collection('orders').doc(orderId).onSnapshot(function(doc) {
                if (doc.exists) {
                    callback(Object.assign({ id: doc.id }, doc.data()));
                }
            });
        }

        async getStats(period) {
            period = period || 'today';
            
            try {
                const orders = await this.getAllOrders();
                let filtered = orders;
                
                if (period === 'today') {
                    filtered = orders.filter(function(o) {
                        return Helpers.isToday(o.createdAt);
                    });
                } else if (period === 'week') {
                    filtered = orders.filter(function(o) {
                        return Helpers.isThisWeek(o.createdAt);
                    });
                } else if (period === 'month') {
                    filtered = orders.filter(function(o) {
                        return Helpers.isThisMonth(o.createdAt);
                    });
                }
                
                return {
                    total: filtered.length,
                    delivered: filtered.filter(function(o) { return o.status === 'delivered'; }).length,
                    pending: filtered.filter(function(o) { return o.status === 'pending'; }).length,
                    revenue: filtered.reduce(function(sum, o) { return sum + (o.total || 0); }, 0),
                    avgOrder: filtered.length ? 
                        filtered.reduce(function(sum, o) { return sum + (o.total || 0); }, 0) / filtered.length 
                        : 0
                };
            } catch (error) {
                return { total: 0, delivered: 0, pending: 0, revenue: 0, avgOrder: 0 };
            }
        }
    }

    const Orders = new OrderSystem();

    // ================================================================
    // 17. ضمان مستند العميل
    // ================================================================
    async function ensureCustomerDocument(user) {
        if (!user) return null;

        try {
            const ref = db.collection('customers').doc(user.uid);
            const doc = await ref.get();

            if (doc.exists) {
                return Object.assign({ id: user.uid }, doc.data());
            }

            let phone = '';
            if (user.email && PhoneAuth.isFakeEmail(user.email)) {
                phone = PhoneAuth.emailToPhone(user.email);
            }

            let customerName = user.displayName;
            
            if (!customerName) {
                if (phone) {
                    customerName = PhoneAuth.generateCustomerName(phone);
                } else {
                    customerName = 'عميل';
                }
            }

            const newData = {
                name: customerName,
                email: user.email,
                phone: phone,
                points: 100,
                walletBalance: 0,
                addresses: [],
                createdAt: new Date().toISOString()
            };

            await ref.set(newData);
            console.log('✅ تم إنشاء مستند العميل:', customerName);
            
            return Object.assign({ id: user.uid }, newData);
        } catch (error) {
            console.error('خطأ في ضمان مستند العميل:', error);
            return null;
        }
    }

    // ================================================================
    // 18. إنشاء مستخدمين بأمان
    // ================================================================
    async function createUserWithSecondaryApp(email, password, userData) {
        console.log('إنشاء مستخدم جديد:', email, '| الدور:', userData.role);
        
        let secondaryApp = null;
        let secondaryAuth = null;
        
        try {
            const adminUser = auth.currentUser;
            if (!adminUser) {
                throw new Error('يجب تسجيل دخول الأدمن أولاً');
            }
            
            const adminEmail = adminUser.email;
            console.log('الأدمن الحالي:', adminEmail);
            
            const appName = 'SecondaryApp_' + Date.now();
            secondaryApp = firebase.initializeApp(FIREBASE_CONFIG, appName);
            secondaryAuth = secondaryApp.auth();
            
            console.log('تم إنشاء التطبيق الثانوي');
            
            const userCred = await secondaryAuth.createUserWithEmailAndPassword(email, password);
            const newUser = userCred.user;
            
            console.log('تم إنشاء الحساب:', newUser.uid);
            
            await db.collection('users').doc(newUser.uid).set({
                uid: newUser.uid,
                email: email,
                name: userData.name || '',
                role: userData.role || 'customer',
                createdAt: new Date().toISOString()
            });
            console.log('تم حفظ user document');
            
            if (userData.role === 'driver') {
                await db.collection('drivers').doc(newUser.uid).set({
                    id: newUser.uid,
                    name: userData.name || '',
                    email: email,
                    phone: userData.phone || '',
                    status: 'offline',
                    rating: 5,
                    totalDeliveries: 0,
                    createdAt: new Date().toISOString()
                });
                console.log('تم إنشاء مستند المندوب');
                
            } else if (userData.role === 'store_owner') {
                const storeRef = await db.collection('stores').add({
                    name: userData.storeName || '',
                    type: userData.storeType || 'restaurant',
                    status: userData.status || 'active',
                    phone: userData.phone || '',
                    location: userData.location || '',
                    image: userData.image || 'https://via.placeholder.com/400x200/2C5F2D/FFFFFF?text=' + encodeURIComponent(userData.storeName || 'Store'),
                    ownerId: newUser.uid,
                    ownerEmail: email,
                    ownerName: userData.name || userData.storeName || '',
                    products: [],
                    ordersCount: 0,
                    rating: 0,
                    settings: {
                        deliveryFee: userData.deliveryFee || 500,
                        storeLat: 15.3694,
                        storeLng: 44.1910
                    },
                    createdAt: new Date().toISOString()
                });
                console.log('تم إنشاء المتجر:', storeRef.id);
                
            } else if (userData.role === 'customer') {
                await db.collection('customers').doc(newUser.uid).set({
                    id: newUser.uid,
                    name: userData.name || '',
                    email: email,
                    phone: userData.phone || '',
                    points: 100,
                    walletBalance: 0,
                    addresses: [],
                    createdAt: new Date().toISOString()
                });
                console.log('تم إنشاء مستند العميل');
            }
            
            await secondaryAuth.signOut();
            console.log('تم تسجيل خروج المستخدم الجديد');
            
            await secondaryApp.delete();
            console.log('تم حذف التطبيق الثانوي');
            
            if (auth.currentUser && auth.currentUser.email === adminEmail) {
                console.log('الأدمن لا يزال مسجل دخول:', adminEmail);
            } else {
                console.warn('تحذير: قد تكون جلسة الأدمن تأثرت');
            }
            
            console.log('تم إنشاء المستخدم بنجاح!');
            
            return {
                success: true,
                newUserId: newUser.uid,
                email: email,
                role: userData.role
            };
            
        } catch (error) {
            console.error('خطأ في إنشاء المستخدم:', error);
            
            if (secondaryAuth) {
                try { await secondaryAuth.signOut(); } catch (e) {}
            }
            if (secondaryApp) {
                try { await secondaryApp.delete(); } catch (e) {}
            }
            
            throw error;
        }
    }

    // ================================================================
    // 19. Auth State Listener
    // ================================================================
    auth.onAuthStateChanged(async function(user) {
        if (user) {
            console.log('تسجيل الدخول:', user.email);
            console.log('التطبيق الحالي:', CURRENT_APP);

            State.setUser({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || 'مستخدم',
                photoURL: user.photoURL
            });

            try {
                const role = await Security.getUserRole(user);
                State.set('userRole', role);
                console.log('الدور:', role);
            } catch (e) {
                console.error('خطأ في تحديد الدور:', e);
            }

            Events.emit('auth:login', { user: user });
        } else {
            console.log('تسجيل الخروج');

            State.setUser(null);
            State.set('userRole', 'guest');
            Events.emit('auth:logout');
        }
    });

    // ================================================================
    // 20. Global Styles
    // ================================================================
    const globalStyles = document.createElement('style');
    globalStyles.textContent = 
        '@keyframes absharSpin {' +
        '    to { transform: rotate(360deg); }' +
        '}' +
        '@keyframes absharFloat {' +
        '    0%, 100% { transform: translateY(0); }' +
        '    50% { transform: translateY(-15px); }' +
        '}' +
        '@keyframes absharToastSlideIn {' +
        '    from { transform: translateX(100px); opacity: 0; }' +
        '    to { transform: translateX(0); opacity: 1; }' +
        '}' +
        '@keyframes absharPulse {' +
        '    0%, 100% { transform: scale(1); }' +
        '    50% { transform: scale(1.05); }' +
        '}' +
        '@keyframes absharFadeIn {' +
        '    from { opacity: 0; transform: translateY(20px); }' +
        '    to { opacity: 1; transform: translateY(0); }' +
        '}' +
        '@keyframes zainSpin { to { transform: rotate(360deg); } }' +
        '@keyframes zainFloat {' +
        '    0%, 100% { transform: translateY(0); }' +
        '    50% { transform: translateY(-15px); }' +
        '}' +
        'body { animation: absharFadeIn 0.3s ease; }' +
        'html { scroll-behavior: smooth; }' +
        'button, a { -webkit-tap-highlight-color: transparent; }';

    document.head.appendChild(globalStyles);

    // ================================================================
    // 21. Export
    // ================================================================
    window.Zain = window.ZAIN = window.Haven = window.Abshar = {
        db: db,
        auth: auth,
        storage: storage,

        BRAND: BRAND,
        ROLES: ROLES,
        ROLE_CONFIG: ROLE_CONFIG,
        FIREBASE_CONFIG: FIREBASE_CONFIG,
        APPS_URLS: APPS_URLS,
        CURRENT_APP: CURRENT_APP,

        PhoneAuth: PhoneAuth,

        Events: Events,
        State: State,
        Navigator: Navigator,
        Security: Security,
        Theme: Theme,
        Notifications: Notifications,
        Cart: Cart,
        Orders: Orders,

        Helpers: Helpers,
        ensureCustomerDocument: ensureCustomerDocument,
        
        createUserWithSecondaryApp: createUserWithSecondaryApp,

        toast: Helpers.showToast,
        logout: function() { return Security.logout(); },
        navigate: function(page, params) { return Navigator.goTo(page, params); },
        toggleTheme: function() { return Theme.toggle(); },
        
        navigateToApp: function(appType) { return Helpers.navigateToApp(appType); },
        getCurrentApp: function() { return Helpers.getCurrentApp(); },
        isInApp: function(appType) { return Helpers.isInApp(appType); },
        getAppsUrls: function() { return Helpers.getAppsUrls(); },
        checkAppAccess: function() { return Security.checkAppAccess(); },

        version: '10.2.0'
    };

    // Legacy compatibility
    window.getDateString = Helpers.getDateString;
    window.getFullDateString = Helpers.getFullDateString;
    window.getShortDate = Helpers.getShortDate;
    window.getTimeString = Helpers.getTimeString;
    window.getRelativeTime = Helpers.getRelativeTime;
    window.formatArabicDate = Helpers.formatArabicDate;
    window.isToday = Helpers.isToday;
    window.showToast = Helpers.showToast;
    window.showNotification = Helpers.showToast;
    window.calculateDistance = Helpers.calculateDistance;
    window.calculateDeliveryFee = Helpers.calculateDeliveryFee;

    // ================================================================
    // 22. Init
    // ================================================================
    if (document.readyState === 'complete') {
        Theme.init();
    } else {
        window.addEventListener('load', function() {
            Theme.init();
        });
    }

    setTimeout(function() {
        Theme.init();
    }, 3000);
  // ================================================================
// 🚴 ABSHER BE - Core System (zain-core.js)
// ================================================================
// الإصدار: 10.3.0
// التاريخ: 2026-09-29
// ================================================================
// يحتوي على:
//   ✅ Firebase Config & Init
//   ✅ Auth Management
//   ✅ Firestore Helpers
//   ✅ Orders Functions
//   ✅ Notifications
//   ✅ Helpers (Date, Distance, etc.)
//   ✅ Theme Toggle
//   ✅ Toast Messages
//   ✅ Modal Helpers
//   ✅ 🆕 أماكن مأرب الذكية (MARIB_PLACES)
//   ✅ 🆕 دوال الخريطة
// ================================================================

(function() {
    'use strict';

    // ================================================================
    // 1. Firebase Configuration
    // ================================================================
    const FIREBASE_CONFIG = {
        apiKey: "AIzaSyBDwnZz-uV5PVrsUAGio_9OtFKI_h8oczA",
        authDomain: "haven-stores.firebaseapp.com",
        projectId: "haven-stores",
        storageBucket: "haven-stores.firebasestorage.app",
        messagingSenderId: "638009290396",
        appId: "1:638009290396:web:dc5963f171b87104ab0759"
    };

    // تهيئة Firebase
    let firebaseApp = null;
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
        firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
        console.log('✅ [Zain] Firebase initialized');
    } else if (typeof firebase !== 'undefined' && firebase.apps.length) {
        firebaseApp = firebase.app();
    }

    const auth = typeof firebase !== 'undefined' ? firebase.auth() : null;
    const db = typeof firebase !== 'undefined' ? firebase.firestore() : null;

    // ================================================================
    // 2. Constants
    // ================================================================
    const CONSTANTS = {
        DELIVERY_FEE: 500,
        CURRENCY: 'ر.ي',
        DEFAULT_LOCATION: {
            lat: 15.45788,
            lng: 45.32302,
            name: 'مأرب'
        },
        STORAGE_KEYS: {
            theme: 'abshar_theme',
            user: 'abshar_user',
            cart: 'abshar_cart_',
            coupon: 'abshar_coupon_',
            lastPhone: 'abshar_last_phone',
            tempName: 'abshar_temp_name',
            tempPhone: 'abshar_temp_phone',
            work: 'abshar_work_'
        }
    };

    // ================================================================
    // 3. 🆕 أماكن مدينة مأرب (Marib Places)
    // ================================================================
    // الاستخدام في أي مكان:
    //   Zain.MARIB_PLACES
    //   Zain.MARIB_CENTER
    //   Zain.getMaribPlace('سوق أبو علي')
    //   Zain.addMaribPlacesToMap(map, filterType)
    // ================================================================

    // ─── مركز مدينة مأرب ───
    const MARIB_CENTER = {
        lat: 15.45788,
        lng: 45.32302,
        zoom: 14,
        name: 'مأرب'
    };

    // ─── أماكن مدينة مأرب ───
    const MARIB_PLACES = [
        // ────────────────────────────────────────
        // 🏘️ الأحياء والمناطق السكنية
        // ────────────────────────────────────────
        {
            name: 'المجمع',
            type: 'district',
            lat: 15.4579,
            lng: 45.3230,
            desc: 'حارة المجمع - وسط المدينة'
        },
        {
            name: 'الزراعة',
            type: 'district',
            lat: 15.4625,
            lng: 45.3258,
            desc: 'حي الزراعة - شرق المطار'
        },
        {
            name: 'الروضة',
            type: 'district',
            lat: 15.4650,
            lng: 45.3150,
            desc: 'حي الروضة - شمال المدينة'
        },
        {
            name: 'الشبواني',
            type: 'district',
            lat: 15.4500,
            lng: 45.3300,
            desc: 'حي الشبواني'
        },
        {
            name: 'الفاو',
            type: 'district',
            lat: 15.4350,
            lng: 45.3100,
            desc: 'منطقة الفاو - جنوب المدينة'
        },
        {
            name: 'الجفينة العليا',
            type: 'district',
            lat: 15.4800,
            lng: 45.3500,
            desc: 'الجفينة العليا'
        },
        {
            name: 'الجفينة السفلى',
            type: 'district',
            lat: 15.4750,
            lng: 45.3450,
            desc: 'الجفينة السفلى'
        },
        {
            name: 'بن عبود',
            type: 'district',
            lat: 15.4480,
            lng: 45.3350,
            desc: 'حي بن عبود'
        },
        {
            name: 'سيتي سنتر',
            type: 'district',
            lat: 15.4550,
            lng: 45.3320,
            desc: 'منطقة سكنية - سيتي سنتر'
        },
        {
            name: 'الصيانة',
            type: 'district',
            lat: 15.4600,
            lng: 45.3250,
            desc: 'منطقة الصيانة'
        },

        // ────────────────────────────────────────
        // 🏢 المجمعات والمراكز التجارية
        // ────────────────────────────────────────
        {
            name: 'مجمع الخير',
            type: 'mall',
            lat: 15.4530,
            lng: 45.3280,
            desc: 'مجمع الخير التجاري'
        },
        {
            name: 'سوق أبو علي',
            type: 'market',
            lat: 15.4300,
            lng: 45.3200,
            desc: 'سوق أبو علي - على بعد 3 كم شرق المدينة'
        },
        {
            name: 'سوق الخياطين',
            type: 'market',
            lat: 15.4520,
            lng: 45.3200,
            desc: 'سوق الخياطين'
        },

        // ────────────────────────────────────────
        // 🛣️ الشوارع والطرق الرئيسية
        // ────────────────────────────────────────
        {
            name: 'شارع صنعاء',
            type: 'street',
            lat: 15.4650,
            lng: 45.3250,
            desc: 'الشارع الرئيسي - الأكثر ازدحاماً'
        },
        {
            name: 'الشارع العام',
            type: 'street',
            lat: 15.4600,
            lng: 45.3280,
            desc: 'شارع عدن - أهم شوارع مأرب'
        },
        {
            name: 'شارع 26 سبتمبر',
            type: 'street',
            lat: 15.4500,
            lng: 45.3280,
            desc: 'شارع تجاري'
        },
        {
            name: 'شارع الأربعين',
            type: 'street',
            lat: 15.4400,
            lng: 45.3150,
            desc: 'المدخل الجنوبي للمدينة'
        },
        {
            name: 'خط المطار',
            type: 'street',
            lat: 15.4596,
            lng: 45.3280,
            desc: 'الطريق إلى مطار مأرب'
        },

        // ────────────────────────────────────────
        // 🚦 الجولات والمفارق
        // ────────────────────────────────────────
        {
            name: 'جولة المؤسسة',
            type: 'roundabout',
            lat: 15.4560,
            lng: 45.3200,
            desc: 'جولة المؤسسة'
        },
        {
            name: 'ميلانو',
            type: 'roundabout',
            lat: 15.4580,
            lng: 45.3220,
            desc: 'جولة ميلانو'
        },
        {
            name: 'مفرق السد',
            type: 'roundabout',
            lat: 15.4300,
            lng: 45.2800,
            desc: 'مفرق سد مأرب'
        },

        // ────────────────────────────────────────
        // 🕌 المساجد
        // ────────────────────────────────────────
        {
            name: 'جامع السنة',
            type: 'mosque',
            lat: 15.4550,
            lng: 45.3200,
            desc: 'جامع السنة'
        },

        // ────────────────────────────────────────
        // 🏛️ المعالم الأثرية والتاريخية
        // ────────────────────────────────────────
        {
            name: 'سد مأرب',
            type: 'landmark',
            lat: 15.39677,
            lng: 45.24402,
            desc: 'سد مأرب التاريخي - رمز الحضارة السبئية'
        },
        {
            name: 'مدينة مأرب القديمة',
            type: 'landmark',
            lat: 15.42687,
            lng: 45.33522,
            desc: 'مدينة مأرب القديمة - موقع اليونسكو'
        },
        {
            name: 'عرش بلقيس',
            type: 'landmark',
            lat: 15.40321,
            lng: 45.34312,
            desc: 'معبد برآن - موقع أثري'
        },
        {
            name: 'معبد أوام',
            type: 'landmark',
            lat: 15.40442,
            lng: 45.35584,
            desc: 'محرم بلقيس - أكبر معبد في شبه الجزيرة'
        },
        {
            name: 'سد الجفينة',
            type: 'landmark',
            lat: 15.41999,
            lng: 45.28369,
            desc: 'سد الجفينة'
        },

        // ────────────────────────────────────────
        // 🎓 الجامعات والمؤسسات
        // ────────────────────────────────────────
        {
            name: 'جامعة سبأ',
            type: 'institution',
            lat: 15.46151,
            lng: 45.31596,
            desc: 'جامعة سبأ - وسط المدينة'
        },
        {
            name: 'جامعة إقليم سبأ',
            type: 'institution',
            lat: 15.462141,
            lng: 45.315993,
            desc: 'جامعة إقليم سبأ'
        },
        {
            name: 'مطار مأرب',
            type: 'institution',
            lat: 15.4687,
            lng: 45.3267,
            desc: 'مطار مأرب الدولي (MYN)'
        },
        {
            name: 'صحن الجن',
            type: 'institution',
            lat: 15.4700,
            lng: 45.3400,
            desc: 'منطقة صحن الجن'
        }
    ];

    // ─── إعدادات أنواع الأماكن (ألوان + أيقونات) ───
    const PLACE_TYPES = {
        district: {
            color: '#9B59B6',
            emoji: '🏘️',
            label: 'حي'
        },
        street: {
            color: '#3498DB',
            emoji: '🛣️',
            label: 'شارع'
        },
        landmark: {
            color: '#E74C3C',
            emoji: '🏛️',
            label: 'معلم'
        },
        market: {
            color: '#27AE60',
            emoji: '🛒',
            label: 'سوق'
        },
        mall: {
            color: '#F39C12',
            emoji: '🏢',
            label: 'مجمع'
        },
        mosque: {
            color: '#16A085',
            emoji: '🕌',
            label: 'مسجد'
        },
        institution: {
            color: '#2980B9',
            emoji: '🏫',
            label: 'مؤسسة'
        },
        roundabout: {
            color: '#E67E22',
            emoji: '🚦',
            label: 'جولة'
        }
    };

    // ================================================================
    // 4. 🆕 دوال الخريطة (Map Helpers)
    // ================================================================

    /**
     * البحث عن مكان في مأرب
     * @param {string} name - اسم المكان
     * @returns {object|null}
     */
    function getMaribPlace(name) {
        if (!name) return null;
        const searchName = String(name).trim();
        return MARIB_PLACES.find(function(p) {
            return p.name === searchName || p.name.indexOf(searchName) !== -1;
        }) || null;
    }

    /**
     * البحث عن أماكن بنوع معين
     * @param {string} type - نوع المكان
     * @returns {array}
     */
    function getMaribPlacesByType(type) {
        return MARIB_PLACES.filter(function(p) {
            return p.type === type;
        });
    }

    /**
     * إضافة أماكن مأرب إلى خريطة Leaflet
     * @param {object} leafletMap - كائن الخريطة
     * @param {string} filterType - نوع للتصفية (اختياري)
     */
    function addMaribPlacesToMap(leafletMap, filterType) {
        if (!leafletMap || typeof L === 'undefined') {
            console.warn('⚠️ [Zain] الخريطة أو Leaflet غير متاح');
            return;
        }

        MARIB_PLACES.forEach(function(place) {
            // إذا كان هناك فلتر، تجاهل الأنواع الأخرى
            if (filterType && place.type !== filterType) return;

            const config = PLACE_TYPES[place.type] || PLACE_TYPES.district;

            // إنشاء أيقونة مخصصة
            const customIcon = L.divIcon({
                html: '<div style="' +
                    'background: ' + config.color + ';' +
                    'color: white;' +
                    'padding: 4px 10px;' +
                    'border-radius: 12px;' +
                    'font-family: Cairo, sans-serif;' +
                    'font-size: 11px;' +
                    'font-weight: 700;' +
                    'white-space: nowrap;' +
                    'box-shadow: 0 3px 10px rgba(0,0,0,0.35);' +
                    'border: 2px solid white;' +
                    'text-shadow: 0 1px 2px rgba(0,0,0,0.3);' +
                    '">' +
                    config.emoji + ' ' + place.name +
                    '</div>',
                className: 'marib-place-marker',
                iconSize: null,
                iconAnchor: [50, 15]
            });

            // إضافة النقطة
            const marker = L.marker([place.lat, place.lng], {
                icon: customIcon,
                zIndexOffset: 500
            }).addTo(leafletMap);

            // نافذة التفاصيل
            marker.bindPopup(
                '<div style="text-align: right; direction: rtl; min-width: 180px; font-family: Cairo;">' +
                    '<div style="font-size: 15px; font-weight: 800; color: ' + config.color + '; margin-bottom: 6px;">' +
                        config.emoji + ' ' + place.name +
                    '</div>' +
                    '<div style="font-size: 12px; color: #555; line-height: 1.6;">' +
                        (place.desc || '') +
                    '</div>' +
                    '<div style="font-size: 10px; color: #999; margin-top: 6px; direction: ltr; text-align: left;">' +
                        '📍 ' + place.lat.toFixed(5) + ', ' + place.lng.toFixed(5) +
                    '</div>' +
                '</div>'
            );
        });

        console.log('✅ [Zain] تم إضافة ' + MARIB_PLACES.length + ' مكان من مأرب');
    }

    /**
     * إضافة مركز مأرب فقط
     * @param {object} leafletMap - كائن الخريطة
     */
    function addMaribCenterMarker(leafletMap) {
        if (!leafletMap || typeof L === 'undefined') return;

        L.marker([MARIB_CENTER.lat, MARIB_CENTER.lng], {
            icon: L.divIcon({
                html: '<div style="' +
                    'background: #e67e22;' +
                    'color: white;' +
                    'padding: 6px 14px;' +
                    'border-radius: 15px;' +
                    'font-family: Cairo, sans-serif;' +
                    'font-size: 13px;' +
                    'font-weight: 800;' +
                    'white-space: nowrap;' +
                    'box-shadow: 0 4px 15px rgba(230,126,34,0.5);' +
                    'border: 3px solid white;' +
                    '">' +
                    '📍 مأرب' +
                    '</div>',
                iconSize: null,
                iconAnchor: [45, 15]
            }),
            zIndexOffset: 2000
        }).addTo(leafletMap).bindPopup('<b>📍 مدينة مأرب</b>');
    }

    // ================================================================
    // 5. Helpers (أدوات مساعدة)
    // ================================================================
    const Helpers = {
        /**
         * حساب المسافة بين نقطتين (كم)
         */
        calculateDistance: function(lat1, lon1, lat2, lon2) {
            const R = 6371;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                      Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        },

        /**
         * الوقت النسبي
         */
        getRelativeTime: function(dateStr) {
            if (!dateStr) return '';
            try {
                const date = new Date(dateStr);
                const now = new Date();
                const diff = Math.floor((now - date) / 1000);

                if (diff < 60) return 'الآن';
                if (diff < 3600) return 'قبل ' + Math.floor(diff / 60) + ' دقيقة';
                if (diff < 86400) return 'قبل ' + Math.floor(diff / 3600) + ' ساعة';
                if (diff < 604800) return 'قبل ' + Math.floor(diff / 86400) + ' يوم';
                return date.toLocaleDateString('ar-EG');
            } catch (e) {
                return '';
            }
        },

        /**
         * التاريخ الكامل
         */
        getFullDateString: function(dateStr) {
            if (!dateStr) return '-';
            try {
                const date = new Date(dateStr);
                return date.toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (e) {
                return '-';
            }
        },

        /**
         * تنسيق السعر
         */
        formatPrice: function(price) {
            return Number(price || 0).toLocaleString('ar-EG') + ' ' + CONSTANTS.CURRENCY;
        },

        /**
         * التحقق من رقم الهاتف اليمني
         */
        isValidYemeniPhone: function(phone) {
            if (!phone) return false;
            const cleaned = String(phone).replace(/[^0-9]/g, '');
            if (cleaned.length !== 9) return false;
            const prefix = cleaned.substring(0, 2);
            return ['70', '71', '73', '77', '78'].indexOf(prefix) !== -1;
        },

        /**
         * إنشاء بريد وهمي من رقم الهاتف
         */
        phoneToEmail: function(phone) {
            const cleaned = String(phone).replace(/[^0-9]/g, '');
            return cleaned + '967@absharbe.ye';
        },

        /**
         * إنشاء اسم تلقائي للعميل
         */
        generateCustomerName: function(phone) {
            const cleaned = String(phone).replace(/[^0-9]/g, '');
            return 'عميل ' + cleaned;
        },

        /**
         * الحصول على رابط خرائط جوجل
         */
        getGoogleMapsUrl: function(lat, lng) {
            return 'https://www.google.com/maps?q=' + lat + ',' + lng;
        },

        /**
         * الحصول على رابط الاتجاهات
         */
        getDirectionsUrl: function(fromLat, fromLng, toLat, toLng) {
            return 'https://www.google.com/maps/dir/?api=1' +
                   '&origin=' + fromLat + ',' + fromLng +
                   '&destination=' + toLat + ',' + toLng;
        }
    };

    // ================================================================
    // 6. Toast Messages
    // ================================================================
    function toast(message, type, duration) {
        type = type || 'info';
        duration = duration || 3000;

        // إزالة أي toast قديم
        const oldToast = document.querySelector('.zain-toast');
        if (oldToast) oldToast.remove();

        // إنشاء Toast جديد
        const toastEl = document.createElement('div');
        toastEl.className = 'zain-toast zain-toast-' + type;

        const colors = {
            success: 'linear-gradient(135deg, #27AE60, #2ECC71)',
            error: 'linear-gradient(135deg, #E74C3C, #C0392B)',
            warning: 'linear-gradient(135deg, #F39C12, #E67E22)',
            info: 'linear-gradient(135deg, #3498DB, #2980B9)'
        };

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        toastEl.style.cssText =
            'position: fixed;' +
            'top: 80px;' +
            'left: 50%;' +
            'transform: translateX(-50%) translateY(-100px);' +
            'background: ' + (colors[type] || colors.info) + ';' +
            'color: white;' +
            'padding: 14px 24px;' +
            'border-radius: 25px;' +
            'font-family: Cairo, sans-serif;' +
            'font-size: 14px;' +
            'font-weight: 700;' +
            'box-shadow: 0 10px 30px rgba(0,0,0,0.3);' +
            'z-index: 999999;' +
            'display: flex;' +
            'align-items: center;' +
            'gap: 10px;' +
            'max-width: 90%;' +
            'opacity: 0;' +
            'transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);' +
            'text-align: center;' +
            'direction: rtl;';

        toastEl.innerHTML = '<span style="font-size: 18px;">' + (icons[type] || '') + '</span><span>' + message + '</span>';

        document.body.appendChild(toastEl);

        // إظهار
        setTimeout(function() {
            toastEl.style.transform = 'translateX(-50%) translateY(0)';
            toastEl.style.opacity = '1';
        }, 50);

        // إخفاء
        setTimeout(function() {
            toastEl.style.transform = 'translateX(-50%) translateY(-100px)';
            toastEl.style.opacity = '0';
            setTimeout(function() {
                if (toastEl.parentNode) toastEl.remove();
            }, 400);
        }, duration);
    }

    // ================================================================
    // 7. Theme Management
    // ================================================================
    function toggleTheme() {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem(CONSTANTS.STORAGE_KEYS.theme, isDark ? 'dark' : 'light');

        // تحديث أيقونة الشمس/القمر إن وجدت
        const themeIcon = document.querySelector('.theme-toggle i');
        if (themeIcon) {
            themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }

        return isDark;
    }

    function loadTheme() {
        const saved = localStorage.getItem(CONSTANTS.STORAGE_KEYS.theme);
        if (saved === 'dark') {
            document.body.classList.add('dark-mode');
        }
        return saved || 'light';
    }

    // ================================================================
    // 8. Auth Management
    // ================================================================
    const Auth = {
        getCurrentUser: function() {
            return auth ? auth.currentUser : null;
        },

        onAuthStateChanged: function(callback) {
            if (!auth) return function() {};
            return auth.onAuthStateChanged(callback);
        },

        signOut: async function() {
            if (!auth) return;
            try {
                await auth.signOut();
                localStorage.removeItem(CONSTANTS.STORAGE_KEYS.user);
                window.location.replace('login.html');
            } catch (e) {
                console.error('خطأ في تسجيل الخروج:', e);
                toast('حدث خطأ في تسجيل الخروج', 'error');
            }
        },

        logout: function() {
            if (confirm('هل تريد تسجيل الخروج؟')) {
                this.signOut();
            }
        }
    };

    // ================================================================
    // 9. Orders Management
    // ================================================================
    const Orders = {
        assignDriver: async function(orderId, driverId, driverName) {
            if (!db) throw new Error('Firestore not initialized');

            return db.collection('orders').doc(orderId).update({
                driverId: driverId,
                driverName: driverName || 'مندوب',
                status: 'delivering',
                assignedAt: new Date().toISOString(),
                deliveryStep: 'pickup'
            });
        },

        markDelivered: async function(orderId) {
            if (!db) throw new Error('Firestore not initialized');

            return db.collection('orders').doc(orderId).update({
                status: 'delivered',
                deliveredAt: new Date().toISOString(),
                deliveryStep: 'delivered'
            });
        },

        getOrder: async function(orderId) {
            if (!db) throw new Error('Firestore not initialized');
            const doc = await db.collection('orders').doc(orderId).get();
            if (!doc.exists) return null;
            return Object.assign({ id: doc.id }, doc.data());
        }
    };

    // ================================================================
    // 10. Notifications
    // ================================================================
    const Notifications = {
        getUnreadCount: async function() {
            if (!db || !auth || !auth.currentUser) return 0;

            try {
                const snap = await db.collection('notifications')
                    .where('userId', '==', auth.currentUser.uid)
                    .where('read', '==', false)
                    .get();
                return snap.size;
            } catch (e) {
                return 0;
            }
        },

        markAsRead: async function(notificationId) {
            if (!db) return;
            try {
                await db.collection('notifications').doc(notificationId).update({
                    read: true,
                    readAt: new Date().toISOString()
                });
            } catch (e) {}
        }
    };

    // ================================================================
    // 11. Modal Helpers
    // ================================================================
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('active');
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('active');
    }

    // ================================================================
    // 12. Utility Functions
    // ================================================================
    function getStorageKey(key) {
        return CONSTANTS.STORAGE_KEYS[key] || key;
    }

    function setStorage(key, value) {
        try {
            const storageKey = getStorageKey(key);
            localStorage.setItem(storageKey, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    }

    function getStorage(key, defaultValue) {
        try {
            const storageKey = getStorageKey(key);
            const value = localStorage.getItem(storageKey);
            return value ? JSON.parse(value) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    }

    function removeStorage(key) {
        try {
            const storageKey = getStorageKey(key);
            localStorage.removeItem(storageKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    // ================================================================
    // 13. Export to window.Zain
    // ================================================================
    window.Zain = {
        // Firebase
        app: firebaseApp,
        auth: auth,
        db: db,
        FIREBASE_CONFIG: FIREBASE_CONFIG,

        // Constants
        CONSTANTS: CONSTANTS,
        DELIVERY_FEE: CONSTANTS.DELIVERY_FEE,

        // 🆕 Marib Places
        MARIB_CENTER: MARIB_CENTER,
        MARIB_PLACES: MARIB_PLACES,
        PLACE_TYPES: PLACE_TYPES,
        getMaribPlace: getMaribPlace,
        getMaribPlacesByType: getMaribPlacesByType,
        addMaribPlacesToMap: addMaribPlacesToMap,
        addMaribCenterMarker: addMaribCenterMarker,

        // Helpers
        Helpers: Helpers,

        // Auth
        Auth: Auth,
        logout: function() {
            Auth.logout();
        },

        // Orders
        Orders: Orders,

        // Notifications
        Notifications: Notifications,

        // Theme
        toggleTheme: toggleTheme,
        loadTheme: loadTheme,

        // Toast
        toast: toast,

        // Modal
        openModal: openModal,
        closeModal: closeModal,

        // Storage
        setStorage: setStorage,
        getStorage: getStorage,
        removeStorage: removeStorage,

        // Utils
        utils: {
            formatPrice: Helpers.formatPrice,
            getRelativeTime: Helpers.getRelativeTime,
            getFullDateString: Helpers.getFullDateString,
            calculateDistance: Helpers.calculateDistance
        }
    };

    // ================================================================
    // 14. Auto Init
    // ================================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            loadTheme();
        });
    } else {
        loadTheme();
    }

    // ================================================================
    // 15. Console Info
    // ================================================================
    console.log('%c🚴 Zain Core v10.3.0', 'color: #e67e22; font-weight: bold; font-size: 14px;');
    console.log('%c✅ Firebase: ' + (firebaseApp ? 'ready' : 'not loaded'), 'color: #27AE60; font-weight: bold;');
    console.log('%c📍 Marib Places: ' + MARIB_PLACES.length + ' مكان', 'color: #3498DB; font-weight: bold;');
    console.log('%c🗺️ للاستخدام: Zain.MARIB_PLACES', 'color: #9B59B6; font-weight: bold;');

})();

    // ================================================================
    // 23. Console Branding
    // ================================================================
    console.log('%c🚴 أبشر بي | ABSHER BE v10.2.0', 'color: #D4AF37; font-weight: bold; font-size: 14px;');
    console.log('%c📱 التطبيق الحالي: ' + CURRENT_APP, 'color: #27AE60; font-weight: bold;');
    console.log('%c📞 الدعم: 784949495 | 🌐 absharbe.ye', 'color: #3498DB; font-weight: bold;');

})();