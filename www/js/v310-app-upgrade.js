/* ============================================================================
 * EduTech Mindset v3.1.0 — Unified Capacitor Bridge, Export Fix, Ads Fix & Mobile Header Polish
 * ============================================================================ */
(function (global) {
  "use strict";

  var isNative = !!(global.EduTechAndroid || /EduTechMindsetApp/i.test(navigator.userAgent || ""));
  var isFloating = (location.search || "").indexOf("floating=assistant") >= 0;
  var ORIGIN_LIVE = "https://edutech-mindset.pages.dev";

  // 1) Floating Assistant Isolated Mode (?floating=assistant)
  if (isFloating) {
    var flCss = document.createElement("style");
    flCss.textContent = [
      "header, footer, #tkBar, #homeAds, #eduHeroWelcomeStage, #learnSection, #unifiedToolsHub, #coursesSection, #mobileBottomNav, #eduAsstOrb { display: none !important; }",
      "#eduAsst { display: flex !important; inset: 0 !important; width: 100vw !important; height: 100dvh !important; max-height: 100dvh !important; border-radius: 0 !important; }"
    ].join("\n");
    document.head.appendChild(flCss);
    var openTimer = setInterval(function () {
      if (global.EduAssistant && typeof global.EduAssistant.open === "function") {
        global.EduAssistant.open("ask");
        clearInterval(openTimer);
      }
    }, 300);
    setTimeout(function () { clearInterval(openTimer); }, 8000);
  }

  // 2) Clean Mobile Top Header (Option 2) + Ads CSS Fix
  var uiCss = document.createElement("style");
  uiCss.id = "eduV310PolishCss";
  uiCss.textContent = [
    /* Fix Data Saver invalid :not(#homeAds img) — always keep ad images visible */
    "body.edu-data-saver #homeAds img { display: block !important; opacity: 1 !important; }",
    "#homeAds #adStage { min-height: 195px; }",
    "#homeAds #adStage img { object-fit: cover; background: #020617; }",
    /* Option 2 Clean Mobile Header: hide wide brand subtitle on small screens, single row, no horizontal scroll */
    "@media (max-width: 640px) {",
    "  header .brand-subtitle, header h1 + p, header [data-brand-text] { display: none !important; }",
    "  header { overflow-x: clip !important; }",
    "  #eduV310QuickBar { display: inline-flex; align-items: center; gap: 4px; }",
    "}",
    ".edu-v310-hbtn { width: 34px; height: 34px; border-radius: 10px; border: 1px solid rgba(56,189,248,0.4); background: rgba(15,23,42,0.75); color: #fff; font-size: 15px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }"
  ].join("\n");
  document.head.appendChild(uiCss);

  // 3) Guaranteed Export Engine (Fixes stuck "جارٍ تجهيز محرك التصدير...")
  function utf8ToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  function buildCleanHtmlDoc(title, bodyMd, meta) {
    var safeTitle = String(title || "مستند تعليمي — EduTech Mindset").replace(/</g, "&lt;");
    var safeBody = String(bodyMd || "").replace(/</g, "&lt;").replace(/\n/g, "<br>");
    var teacher = (meta && meta.teacher) ? ("المعلم: " + meta.teacher) : "منصة EduTech Mindset";
    var school = (meta && meta.school) ? (" | " + meta.school) : "";
    return '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>' + safeTitle + '</title>' +
      '<style>body{font-family:Cairo,Arial,sans-serif;direction:rtl;padding:24px;color:#0f172a;line-height:1.9;}' +
      '.hdr{border-bottom:3px solid #0284c7;padding-bottom:10px;margin-bottom:18px;}' +
      'h1{color:#0c4a6e;font-size:22px;margin:0 0 6px;} .sub{color:#475569;font-size:13px;}</style></head>' +
      '<body><div class="hdr"><h1>' + safeTitle + '</h1><div class="sub">' + teacher + school + '</div></div>' +
      '<div>' + safeBody + '</div></body></html>';
  }

  function nativeExport(kind, title, bodyMd, meta) {
    var safeName = String(title || "EduTech_Document").replace(/[^\u0600-\u06FFa-zA-Z0-9._\- ]/g, "_").slice(0, 60);
    var html = buildCleanHtmlDoc(title, bodyMd, meta);
    if (isNative && global.EduTechAndroid) {
      if (kind === "docx") {
        var b64Doc = utf8ToBase64("\ufeff" + html);
        global.EduTechAndroid.saveBase64File(b64Doc, safeName + ".doc", "application/msword", "Word");
        return Promise.resolve(true);
      }
      if (kind === "sharePdf") {
        var b64Share = utf8ToBase64("\ufeff" + html);
        var savedPath = global.EduTechAndroid.saveBase64File(b64Share, safeName + ".doc", "application/msword", "Word");
        if (savedPath && typeof global.EduTechAndroid.shareSavedFile === "function") {
          global.EduTechAndroid.shareSavedFile(savedPath, "application/msword");
        }
        return Promise.resolve(true);
      }
      // PDF: trigger native Android PrintManager (Save as PDF offline) + save backup copy
      if (typeof global.EduTechAndroid.printPage === "function") {
        global.EduTechAndroid.printPage(safeName);
        return Promise.resolve(true);
      }
    }
    // Browser fallback
    var blob = new Blob(["\ufeff" + html], { type: kind === "docx" ? "application/msword" : "text/html;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = safeName + (kind === "docx" ? ".doc" : ".html");
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    return Promise.resolve(true);
  }

  function ensureExporterReady() {
    global.Exporter = global.Exporter || {};
    ["pdf", "docx", "sharePdf"].forEach(function (fn) {
      if (typeof global.Exporter[fn] !== "function") {
        global.Exporter[fn] = function (title, bodyMd, meta) {
          return nativeExport(fn, title, bodyMd, meta);
        };
      }
    });
  }
  ensureExporterReady();
  setInterval(ensureExporterReady, 2000);

  // 4) Fix Relative Ad Image URLs in Capacitor & Cache #homeAds for Instant Offline Display
  function fixAdsImagesAndCache() {
    var ads = document.getElementById("homeAds");
    if (!ads) return;
    var imgs = ads.querySelectorAll("img");
    imgs.forEach(function (img) {
      var src = img.getAttribute("src") || "";
      if (src.indexOf("/") === 0 && location.hostname === "localhost") {
        img.setAttribute("src", ORIGIN_LIVE + src);
      }
    });
    if (!ads.classList.contains("hidden") && ads.innerHTML.trim().length > 40) {
      try { localStorage.setItem("edu_v310_ads_html", ads.innerHTML); } catch (_) {}
    } else if (ads.classList.contains("hidden")) {
      try {
        var cached = localStorage.getItem("edu_v310_ads_html");
        if (cached && cached.length > 40) {
          ads.innerHTML = cached;
          ads.classList.remove("hidden");
        }
      } catch (_) {}
    }
  }

  // 5) Inject Native Quick Buttons (📁 مجلدي، ✏️ السبورة، ✨ العائم) into Header when inside Android App
  function injectNativeHeaderControls() {
    if (!isNative || isFloating) return;
    if (document.getElementById("eduV310QuickBar")) return;
    var header = document.querySelector("header");
    if (!header) return;
    var targetRow = header.querySelector(".flex") || header;
    var bar = document.createElement("div");
    bar.id = "eduV310QuickBar";
    bar.style.cssText = "display:inline-flex;align-items:center;gap:5px;margin-inline-start:6px;";
    bar.innerHTML =
      '<button type="button" class="edu-v310-hbtn" title="📁 مجلدي وملفاتي" data-v310="folder">📁</button>' +
      '<button type="button" class="edu-v310-hbtn" title="✏️ السبورة الذكية" data-v310="wb">✏️</button>' +
      '<button type="button" class="edu-v310-hbtn" title="📚 مكتبة الكتب" data-v310="books">📚</button>' +
      '<button type="button" class="edu-v310-hbtn" title="✨ المساعد العائم فوق التطبيقات" data-v310="float">🤖</button>';
    bar.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-v310]");
      if (!btn || !global.EduTechAndroid) return;
      var act = btn.getAttribute("data-v310");
      if (act === "folder" && global.EduTechAndroid.openMyFolder) global.EduTechAndroid.openMyFolder();
      else if (act === "wb" && global.EduTechAndroid.openWhiteboard) global.EduTechAndroid.openWhiteboard();
      else if (act === "books" && global.EduTechAndroid.openBookReader) global.EduTechAndroid.openBookReader();
      else if (act === "float" && global.EduTechAndroid.startFloatingAi) global.EduTechAndroid.startFloatingAi();
    });
    targetRow.appendChild(bar);
  }

  function onReady() {
    ensureExporterReady();
    injectNativeHeaderControls();
    fixAdsImagesAndCache();
    setTimeout(fixAdsImagesAndCache, 1800);
    setTimeout(fixAdsImagesAndCache, 4500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})(window);
