# تسريع الموقع: استبدال Tailwind CDN بملف CSS جاهز

**المشكلة:** الموقع يحمّل مكتبة Tailwind الكاملة (~350KB) ويشغّل محرك JIT في كل زيارة، وهي أكبر سبب لبطء الإقلاع على الهواتف الضعيفة.
**الحل:** توليد ملف `css/tailwind.css` واحد صغير (عادةً 40–90KB) يحتوي الأصناف المستخدمة فقط.

```bash
cd tools/tailwind-build
npm install        # مرة واحدة
npm run build      # ينشئ ../../css/tailwind.css
npm run apply      # يستبدل سكربت CDN في index.html (للتراجع: node apply.js --undo)
```
بعدها ارفع الحزمة كالمعتاد. أعد `npm run build` كلما أضفت أصنافاً جديدة في الملفات.
