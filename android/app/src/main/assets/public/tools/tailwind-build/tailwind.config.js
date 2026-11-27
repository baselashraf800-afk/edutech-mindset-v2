/* مستخرج من index.html — نفس إعدادات الموقع الحالية */
// v216: ألوان brand تدعم الشفافية (bg-brand-500/10) عبر color-mix بدل var() الصماء
const A = (v) => ({ opacityValue }) =>
  opacityValue === undefined ? v : `color-mix(in srgb, ${v} calc(${opacityValue} * 100%), transparent)`;
const SAFELIST = require("./safelist.json"); // v216: أصناف كانت في البناء السابق (تُبنى ديناميكياً) نحافظ عليها
module.exports = {
  safelist: SAFELIST,
      darkMode: "class",
  content: ["../../index.html", "../../js/**/*.js", "../../privacy.html", "../../404.html", "../../offline.html"],
      theme: {
        extend: {
          colors: {
            brand: {
              50: A("var(--brand-50, #f0f7ff)"),
              100: A("var(--brand-100, #e0effe)"),
              200: A("var(--brand-200, #bae0fd)"),
              300: A("var(--brand-300, #7dd3fc)"),
              400: A("var(--brand-400, #38bdf8)"),
              500: A("var(--brand-500, #0284c7)"),
              600: A("var(--brand-600, #0369a1)"),
              700: A("var(--brand-700, #075985)"),
              800: A("var(--brand-800, #0c4a6e)"),
              900: A("var(--brand-900, #082f49)"),
              dark: A("var(--brand-dark, #051322)"),
              card: A("var(--brand-card, #0b2138)")
            },
            accent: {
              cyan: "#00d2ff",
              gold: "#f59e0b",
              emerald: "#10b981",
              rose: "#f43f5e"
            }
          },
          fontFamily: {
            cairo: ["Cairo", "system-ui", "sans-serif"]
          }
        }
      }
    };
