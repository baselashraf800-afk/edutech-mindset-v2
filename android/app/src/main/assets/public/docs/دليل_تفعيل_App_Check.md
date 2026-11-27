# تفعيل App Check لحماية الكتابة العامة (نتائج، ألعاب، واجبات، استطلاعات)

يمنع App Check أي طلب لا يأتي من موقعك الحقيقي (سكربتات الإرسال الآلي).

## الخطوات
1. أنشئ مفتاح reCAPTCHA v3 من https://www.google.com/recaptcha/admin (النوع v3) وأضف النطاقين: `edutech-mindset.pages.dev` و`localhost`.
2. في Firebase Console ← Build ← App Check ← تطبيق الويب ← اختر reCAPTCHA v3 والصق **المفتاح السري** (Secret key).
3. ضع **مفتاح الموقع** (Site key) في ملف `firebase-config.js`:
   `window.EDUTECH_APPCHECK_SITE_KEY = "مفتاحك";`
4. ارفع النسخة ثم افتح الموقع، وراقب في App Check ← APIs ← Cloud Firestore أن نسبة "Verified requests" ترتفع.
5. **بعد 2-3 أيام** من ظهور الطلبات الموثّقة فقط اضغط **Enforce** على Cloud Firestore. لا تفعّل Enforce قبل ذلك حتى لا تُحجب أجهزة سليمة.

## ملاحظات
- المفتاح العام (Site key) يُوضع في الكود بلا مشكلة، أما السري فيبقى في Firebase فقط.
- للتجربة المحلية ضع `window.EDUTECH_APPCHECK_DEBUG = true` مؤقتاً وأضف رمز التصحيح من الكونسول في Firebase.
