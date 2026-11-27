/*
 * ============================================================
 *  إعدادات الربط السحابي — EduTech Mindset
 * ============================================================
 *  هذا هو الملف الوحيد الذي تحتاج لتعديله مرة واحدة فقط.
 *  الخطوات التفصيلية في ملف:  دليل_التشغيل.md
 *
 *  1) أنشئ مشروعاً في https://console.firebase.google.com
 *  2) من إعدادات المشروع → "Your apps" → أضف تطبيق ويب (</>)
 *  3) انسخ القيم التي تظهر لك وضعها هنا بدل القيم الفارغة.
 */
window.EDUTECH_FIREBASE_CONFIG = {
  apiKey: "AIzaSyB5F7emEsoQgqDh2qworzjr1lEPefUAz9Q",
  authDomain: "edutech-mindset-claud.firebaseapp.com",
  projectId: "edutech-mindset-claud",
  storageBucket: "edutech-mindset-claud.firebasestorage.app",
  messagingSenderId: "288208116038",
  appId: "1:288208116038:web:ef2f5b854ea25bf2aced47"
};

/*
 * بريد حساب Google الخاص بالإدارة.
 * هذا الحساب وحده يستطيع تعديل محتوى الموقع (بعد إدخال رمز الإدارة).
 * ملاحظة: يجب أن يكون نفس البريد المكتوب في قواعد الأمان (firestore.rules).
 */
/* مفتاح reCAPTCHA v3 الخاص بـ App Check (اتركه فارغاً حتى تفعّله من لوحة Firebase) */
window.EDUTECH_APPCHECK_SITE_KEY = "";

window.EDUTECH_ADMIN_EMAILS = ["baselashraf800@gmail.com", "Edutechm1994@gmail.com"];
