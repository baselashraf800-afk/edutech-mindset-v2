// يستبدل سكربت Tailwind CDN (ثقيل ويحجب الرسم) بملف CSS مبني مسبقاً css/tailwind.css
// الاستخدام (بعد npm run build):  node apply.js        للتراجع:  node apply.js --undo
const fs = require("fs"), path = require("path");
const file = path.join(__dirname, "..", "..", "index.html");
let s = fs.readFileSync(file, "utf8");
const CDN = '<script src="https://cdn.tailwindcss.com/3.4.17"></script>';
const STATIC = '<link rel="stylesheet" href="css/tailwind.css?v=148"><!--TW-STATIC-->';
if (process.argv.includes("--undo")) {
  if (!s.includes("<!--TW-STATIC-->")) return console.log("لا يوجد ما يُتراجع عنه");
  s = s.replace(STATIC, CDN);
} else {
  if (!fs.existsSync(path.join(__dirname, "..", "..", "css", "tailwind.css"))) { console.error("نفّذ npm run build أولاً لإنشاء css/tailwind.css"); process.exit(1); }
  if (!s.includes(CDN)) return console.log("سكربت CDN غير موجود (ربما طُبّق مسبقاً)");
  s = s.replace(CDN, STATIC);
}
fs.writeFileSync(file, s);
console.log("تم ✓");
