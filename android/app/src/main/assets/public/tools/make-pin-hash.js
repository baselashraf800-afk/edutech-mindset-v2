// توليد بصمة PBKDF2 مملّحة لرمز الإدارة (v215)
// الاستخدام:  node tools/make-pin-hash.js "رمز-طويل-وصعب-التخمين"
// ثم ضع الناتج في js/app.js مكان قيمة ADMIN_PIN_HASH.
const crypto = require("crypto");
const pin = process.argv[2];
if (!pin || pin.length < 8) { console.error("اكتب رمزاً من 8 أحرف على الأقل"); process.exit(1); }
const iter = 210000, salt = crypto.randomBytes(16);
const hash = crypto.pbkdf2Sync(pin, salt, iter, 32, "sha256").toString("hex");
console.log(`pbkdf2$${iter}$${salt.toString("base64")}$${hash}`);
