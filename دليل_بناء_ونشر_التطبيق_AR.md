# دليل بناء ونشر تطبيق EduTech Mindset Native (v1.0)

يجمع هذا المشروع الكامل بين **واجهة منصة EduTech Mindset (الإصدار v279)** المدمجة بالكامل للعمل **80% بلا إنترنت** وطبقة **Android Native (Kotlin + Capacitor 6)** التي تضم:
- **الخزنة المحلية الدائمة (`EduVaultPlugin`)**: حفظ الملفات في `Documents/EduTechMindset/` + قاعدة بيانات **SQLite** محلية + تصدير/استيراد حزم الدروس الأوفلاين (`.edupack`) والنسخ الاحتياطي (`.edubackup`).
- **مشغل الصوتيات والفيديوهات الشامل (`EduMediaPlayerPlugin` + AndroidX Media3/ExoPlayer)**: يدعم جميع الصيغ (`MP4, MKV, WEBM, AVI, HLS, MP3, M4A, OGG, WAV, FLAC, OPUS`) + التحكم بالسرعة + تكرار `A–B` + وضع `Picture-in-Picture`.
- **قارئ PDF الشامل (`EduPdfReaderPlugin` + العارض الهجين)**: وضع ليلي ومريح للعين، تدوين وحفظ الملاحظات محلياً، قراءة صوتية، وفتح فوري بالمحرك الأصلي.
- **الأمان والويدجت والموشن (`EduSecurityWidgetPlugin` + Lottie)**: قفل البصمة (`BiometricPrompt`)، ويدجت الشاشة الرئيسية (`EduScheduleWidgetProvider`)، شاشة إقلاع موشن جرافيك `60 FPS` (مع وضع توفير البطارية)، والتذكيرات المحلية الأوفلاين.

## الطريقة الأسرع لبناء ملف APK وAAB مجاناً في 4 دقائق (بدون Android Studio)
1. أنشئ مستودعاً خاصاً (Private Repository) على **GitHub** وارفع إليه جميع ملفات هذه الحزمة بعد فك الضغط.
2. افتح تبويب **Actions** في المستودع واضغط **Build EduTech Mindset Android App (APK & AAB)** ثم **Run workflow**.
3. بعد نحو 4 دقائق ستجد ملفات **`APK`** (للتثبيت المباشر على الهواتف) و**`AAB`** (للرفع على متجر Google Play) جاهزة للتحميل داخل قسم **Artifacts**.

## الطريقة الثانية: البناء محلياً عبر Android Studio
1. شغّل في مجلد المشروع:
   ```bash
   npm install
   npx cap sync android
   ```
2. افتح المجلد `android/` داخل **Android Studio** (بـ JDK 17 وAndroid SDK 34).
3. من قائمة **Build** اختر **Generate Signed Bundle / APK** باستخدام مفتاح التوقيع الخاص بك.

## أصول متجر Google Play الجاهزة
تجد داخل مجلد `store_assets/` الأيقونة الرسمية (`512×512`)، صورة الغلاف (`1024×500`)، لقطات الشاشة، وملف الوصف العربي والإنجليزي الجاهز (`PLAY_STORE_LISTING_AR_EN.md`).
