/* ============================================================================
 * EduTech Mindset v3.2.0 — Option 2 Clean Mobile Header, Drawer Quick Tools,
 * Ads Fix, Guaranteed Offline Export Bridge & Floating Assistant Isolation
 * ============================================================================ */
(function (global) {
  "use strict";

  if (global.__EDU_V320_LOADED__) return;
  global.__EDU_V320_LOADED__ = true;

  var isNative = !!(global.EduTechAndroid || /EduTechMindsetApp/i.test(navigator.userAgent || ""));
  var isFloating = (location.search || "").indexOf("floating=assistant") >= 0;
  var ORIGIN_LIVE = "https://edutech-mindset.pages.dev";

  // Remove any legacy v310 injected clutter if live site loaded older script first
  function cleanupLegacy() {
    var oldCss = document.getElementById("eduV310PolishCss");
    if (oldCss) oldCss.remove();
    var oldBar = document.getElementById("eduV310QuickBar");
    if (oldBar) oldBar.remove();
  }

  // 1) Floating Assistant Isolated Mode (?floating=assistant)
  if (isFloating) {
    var flCss = document.createElement("style");
    flCss.id = "eduV320FloatCss";
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

  // 2) Option 2 Elegant Mobile Header + Ads CSS Fix
  function applyOption2HeaderCss() {
    cleanupLegacy();
    if (document.getElementById("eduV320PolishCss")) return;
    var uiCss = document.createElement("style");
    uiCss.id = "eduV320PolishCss";
    uiCss.textContent = [
      /* Ads visibility & Data Saver fix */
      "body.edu-data-saver #homeAds img { display: block !important; opacity: 1 !important; }",
      "#homeAds #adStage { min-height: 195px; }",
      "#homeAds #adStage img { object-fit: cover; background: #020617; }",
      /* Hide APK Install button when already inside the Android app */
      isNative ? "#btnHeaderInstallApp { display: none !important; }" : "",
      /* Option 2 Clean Mobile Header (<= 640px):
         Right (RTL start): Logo icon only + compact ☰ menu button
         Left (RTL end): Search + 📁 مجلدي + Favorites + Dark Mode + Account/Login
         A (Font) and 🎵 (Music) moved to top of ☰ drawer! */
      "@media (max-width: 640px) {",
      "  #siteTopHeader .header-main-row { padding-inline: 8px !important; gap: 6px !important; height: 54px !important; overflow-x: clip !important; }",
      "  #brandLine1, #brandLine2 { display: none !important; }",
      "  #siteTopHeader a[data-top-nav='hero'] { gap: 0 !important; padding: 0 !important; flex-shrink: 0 !important; }",
      "  #btnHeaderFontFormat, #btnHeaderMusic { display: none !important; }",
      "  #btnMenuToggle { padding: 7px 9px !important; border-radius: 10px !important; }",
      "  #btnMenuToggle span { display: none !important; }",
      "  #btnHeaderQuickSearch { padding: 7px 9px !important; border-radius: 10px !important; }",
      "  #btnHeaderQuickSearch span { display: none !important; }",
      "  #btnGoogleLoginHeader { padding: 6px 8px !important; font-size: 10px !important; gap: 4px !important; }",
      "  #btnGoogleLoginHeader span { max-width: 44px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
      "  #btnFavFilter, #btnThemeToggle { padding: 7px !important; border-radius: 10px !important; }",
      "}",
      ".edu-v320-folder-btn { width: 34px; height: 34px; border-radius: 10px; border: 1px solid rgba(56,189,248,0.45); background: rgba(2,132,199,0.16); color: #38bdf8; font-size: 15px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: transform 0.15s; }",
      ".edu-v320-folder-btn:active { transform: scale(0.92); }",
      "#eduDrawerQuickStrip { display: flex; flex-wrap: wrap; gap: 6px; padding: 10px 12px; border-bottom: 1px solid rgba(148,163,184,0.2); background: rgba(15,23,42,0.06); }",
      ".dark #eduDrawerQuickStrip { background: rgba(255,255,255,0.04); }",
      ".edu-dq-btn { flex: 1 1 auto; min-width: 58px; padding: 7px 8px; border-radius: 10px; border: 1px solid rgba(56,189,248,0.3); background: rgba(2,132,199,0.12); color: inherit; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; gap: 4px; cursor: pointer; }"
    ].join("\n");
    document.head.appendChild(uiCss);
  }

  // Re-arrange header for Option 2 on mobile: Logo + ☰ on right, tools + 📁 on left
  function enhanceOption2HeaderDom() {
    if (isFloating) return;
    var row = document.querySelector("#siteTopHeader .header-main-row");
    if (!row) return;
    var brand = row.querySelector("a[data-top-nav='hero']");
    var menuBtn = document.getElementById("btnMenuToggle");
    var toolsBox = document.getElementById("btnThemeToggle") ? document.getElementById("btnThemeToggle").parentElement : null;

    // Group Logo + ☰ together on the RTL start (right) side on mobile
    if (brand && menuBtn && !document.getElementById("eduRightBrandGroup")) {
      var rightGroup = document.createElement("div");
      rightGroup.id = "eduRightBrandGroup";
      rightGroup.style.cssText = "display:flex;align-items:center;gap:6px;flex-shrink:0;";
      brand.parentNode.insertBefore(rightGroup, brand);
      rightGroup.appendChild(brand);
      rightGroup.appendChild(menuBtn);
    }

    // Add single clean 📁 مجلدي button in the left utility row (inside Android app)
    if (isNative && toolsBox && !document.getElementById("eduBtnMyFolder")) {
      var folderBtn = document.createElement("button");
      folderBtn.id = "eduBtnMyFolder";
      folderBtn.type = "button";
      folderBtn.className = "edu-v320-folder-btn";
      folderBtn.title = "📁 مجلدي وملفاتي";
      folderBtn.setAttribute("aria-label", "مجلدي وملفاتي");
      folderBtn.textContent = "📁";
      folderBtn.onclick = function () {
        if (global.EduTechAndroid && global.EduTechAndroid.openMyFolder) {
          global.EduTechAndroid.openMyFolder();
        }
      };
      var searchBtn = document.getElementById("btnHeaderQuickSearch");
      if (searchBtn && searchBtn.parentElement === toolsBox) {
        toolsBox.insertBefore(folderBtn, searchBtn.nextSibling);
      } else {
        toolsBox.insertBefore(folderBtn, toolsBox.firstChild);
      }
    }

    // Shorten Google Login label on mobile so it fits cleanly
    var gSpan = document.querySelector("#btnGoogleLoginHeader span");
    if (gSpan && window.innerWidth <= 640 && gSpan.textContent.indexOf("بحساب") >= 0) {
      gSpan.textContent = "دخول";
    }
  }

  // Inject A (Font), 🎵 (Music), and native quick tools (✏️ السبورة, 📚 الكتب, 🤖 العائم) at top of ☰ drawer
  function injectDrawerQuickStrip(panel) {
    if (!panel || panel.querySelector("#eduDrawerQuickStrip")) return;
    var strip = document.createElement("div");
    strip.id = "eduDrawerQuickStrip";
    var html =
      '<button type="button" class="edu-dq-btn" data-dq="font">🔤 الخط</button>' +
      '<button type="button" class="edu-dq-btn" data-dq="music">🎵 الصوت</button>';
    if (isNative) {
      html +=
        '<button type="button" class="edu-dq-btn" data-dq="folder">📁 مجلدي</button>' +
        '<button type="button" class="edu-dq-btn" data-dq="wb">✏️ السبورة</button>' +
        '<button type="button" class="edu-dq-btn" data-dq="books">📚 الكتب</button>' +
        '<button type="button" class="edu-dq-btn" data-dq="float">🤖 العائم</button>';
    }
    strip.innerHTML = html;
    strip.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-dq]");
      if (!btn) return;
      var act = btn.getAttribute("data-dq");
      if (act === "font") {
        var fBtn = document.getElementById("btnHeaderFontFormat");
        if (fBtn) fBtn.click();
      } else if (act === "music") {
        var mBtn = document.getElementById("btnHeaderMusic");
        if (mBtn) mBtn.click();
      } else if (global.EduTechAndroid) {
        if (global.EduFreshDrawer && global.EduFreshDrawer.close) global.EduFreshDrawer.close();
        if (act === "folder" && global.EduTechAndroid.openMyFolder) global.EduTechAndroid.openMyFolder();
        else if (act === "wb" && global.EduTechAndroid.openWhiteboard) global.EduTechAndroid.openWhiteboard();
        else if (act === "books" && global.EduTechAndroid.openBookReader) global.EduTechAndroid.openBookReader();
        else if (act === "float" && global.EduTechAndroid.startFloatingAi) global.EduTechAndroid.startFloatingAi();
      }
    });
    // Insert right after drawer header (first child)
    if (panel.children.length > 1) {
      panel.insertBefore(strip, panel.children[1]);
    } else {
      panel.appendChild(strip);
    }
  }

  function observeDrawer() {
    if (typeof MutationObserver === "undefined") return;
    var obs = new MutationObserver(function () {
      var panel = document.getElementById("eduFreshDrawerPanel");
      if (panel) injectDrawerQuickStrip(panel);
    });
    obs.observe(document.body, { childList: true, subtree: false });
  }

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
      if (typeof global.EduTechAndroid.printPage === "function") {
        global.EduTechAndroid.printPage(safeName);
        return Promise.resolve(true);
      }
    }
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

  // 4) Fix Relative Ad Image URLs & Cache #homeAds for Instant Offline Display
  function fixAdsImagesAndCache() {
    var ads = document.getElementById("homeAds");
    if (!ads) return;
    ads.querySelectorAll("img").forEach(function (img) {
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

  function onReady() {
    applyOption2HeaderCss();
    enhanceOption2HeaderDom();
    observeDrawer();
    ensureExporterReady();
    fixAdsImagesAndCache();
    setTimeout(enhanceOption2HeaderDom, 800);
    setTimeout(fixAdsImagesAndCache, 1800);
    setTimeout(fixAdsImagesAndCache, 4500);
    setInterval(ensureExporterReady, 2500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})(window);
