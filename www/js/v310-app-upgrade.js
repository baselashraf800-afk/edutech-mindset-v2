/* ============================================================================
 * EduTech Mindset v3.2.1 — Smooth Native Performance, Zero Double-Splash,
 * Smart Android Back Button, Option 2 Mobile Header, Ads Fix & Export Bridge
 * ============================================================================ */
(function (global) {
  "use strict";

  if (global.__EDU_V321_LOADED__) return;
  global.__EDU_V321_LOADED__ = true;

  var isNative = !!(global.EduTechAndroid || /EduTechMindsetApp/i.test(navigator.userAgent || ""));
  var isFloating = (location.search || "").indexOf("floating=assistant") >= 0;
  var ORIGIN_LIVE = "https://edutech-mindset.pages.dev";

  // 0) Suppress redundant web HTML splash screens inside Android app (prevents double-splash flicker!)
  if (isNative) {
    try {
      sessionStorage.setItem("edu_splash_shown_v1", "1");
      sessionStorage.setItem("edu_splash_shown_v242", "1");
    } catch (_) {}
  }

  // 1) Smart Hardware Back Button Handler for SPA Modals, Drawers & Overlays
  global.EduAppHandleBack = function () {
    try {
      // Close Fresh Drawer if open
      var drawer = document.getElementById("eduFreshDrawer");
      if (drawer) {
        if (global.EduFreshDrawer && typeof global.EduFreshDrawer.close === "function") {
          global.EduFreshDrawer.close();
        } else {
          drawer.remove();
        }
        return true;
      }

      // Close AI Assistant if open
      var asst = document.getElementById("eduAsst");
      if (asst && (asst.classList.contains("open") || asst.style.display === "flex")) {
        var closeAsst = asst.querySelector("[data-mact='close'], .ea-close, button[aria-label*='إغلاق']");
        if (closeAsst) closeAsst.click();
        else { asst.classList.remove("open"); asst.style.display = "none"; }
        return true;
      }

      // Close any known dynamic modals (newest first)
      var knownModals = [
        "eduNativeHubModal", "v289AndroidCfgModal", "eduAuthUnifiedModal",
        "v187ReaderModal", "v187VideoModal", "v187AudioModal", "v187VaultHubModal",
        "v188IslamicModal", "v189TeacherHubModal", "v185LessonPrepModal", "v186QuizMakerModal",
        "v191EnrollModal", "v191CoursesHubModal", "v193OfficialBookModal",
        "eduV173ReelsModal", "eduV173CertModal", "eduV174QrModal", "eduV174FbModal",
        "eduV175ProReaderModal", "v201FcModal", "v202AsstModal", "eduUnifiedAdminHubModal",
        "eduCourseCertModal", "eduCertModal", "eduLessonKitModal", "eduWeeklyPortModal",
        "eduGlobalSearchModal", "eduBgMusicModal"
      ];
      for (var i = 0; i < knownModals.length; i++) {
        var m = document.getElementById(knownModals[i]);
        if (m && !m.classList.contains("hidden") && m.style.display !== "none") {
          m.remove();
          return true;
        }
      }

      // Close generic #modalContainer if visible
      var mc = document.getElementById("modalContainer");
      if (mc && !mc.classList.contains("hidden") && mc.innerHTML.trim().length > 0) {
        var xBtn = mc.querySelector("button[id*='Close'], button[id*='close'], button[aria-label*='إغلاق']");
        if (xBtn) xBtn.click();
        else { mc.classList.add("hidden"); mc.innerHTML = ""; }
        return true;
      }

      // Close any high-z fixed fullscreen overlay modal dynamically created
      var fixedOverlays = document.querySelectorAll("body > div[style*='position:fixed'], body > div[style*='position: fixed']");
      for (var j = fixedOverlays.length - 1; j >= 0; j--) {
        var el = fixedOverlays[j];
        var id = el.id || "";
        if (id === "eduAsstOrb" || id === "eduToastWrap" || id === "mobileBottomNav") continue;
        var st = getComputedStyle(el);
        var z = parseInt(st.zIndex, 10) || 0;
        if (st.display !== "none" && z >= 9000 && el.offsetWidth > window.innerWidth * 0.65 && el.offsetHeight > window.innerHeight * 0.45) {
          var closeBtn = el.querySelector("button[id*='Close'], button[id*='close'], button[id*='X']");
          if (closeBtn) closeBtn.click();
          else el.remove();
          return true;
        }
      }
    } catch (_) {}
    return false;
  };

  // Remove any legacy injected clutter
  function cleanupLegacy() {
    ["eduV310PolishCss", "eduV310QuickBar", "eduV320PolishCss"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.remove();
    });
    if (isNative) {
      var webSplash = document.getElementById("eduSplashIntro");
      if (webSplash) webSplash.remove();
    }
  }

  // 2) Floating Assistant Isolated Mode (?floating=assistant)
  if (isFloating) {
    var flCss = document.createElement("style");
    flCss.id = "eduV321FloatCss";
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

  // 3) Option 2 Clean Mobile Header + Performance Boost + Zero Double-Splash CSS
  function applyPolishCss() {
    cleanupLegacy();
    if (document.getElementById("eduV321PolishCss")) return;
    var uiCss = document.createElement("style");
    uiCss.id = "eduV321PolishCss";
    uiCss.textContent = [
      /* Never show redundant web HTML splash inside native Android app */
      isNative ? "#eduSplashIntro, .edu-pwa-splash { display: none !important; opacity: 0 !important; pointer-events: none !important; }" : "",
      /* Smoothness boost inside Android WebView: disable heavy blur & GPU-draining pulse animations */
      isNative ? "*, *::before, *::after { -webkit-backdrop-filter: none !important; backdrop-filter: none !important; }" : "",
      /* Ads visibility & Data Saver fix */
      "body.edu-data-saver #homeAds img { display: block !important; opacity: 1 !important; }",
      "#homeAds #adStage { min-height: 190px; }",
      "#homeAds #adStage img { object-fit: cover; background: #020617; }",
      /* Hide APK Install button when already inside the Android app */
      isNative ? "#btnHeaderInstallApp { display: none !important; }" : "",
      /* Option 2 Clean Mobile Header (<= 640px) */
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
      ".edu-v320-folder-btn { width: 34px; height: 34px; border-radius: 10px; border: 1px solid rgba(56,189,248,0.45); background: rgba(2,132,199,0.16); color: #38bdf8; font-size: 15px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }",
      "#eduDrawerQuickStrip { display: flex; flex-wrap: wrap; gap: 6px; padding: 10px 12px; border-bottom: 1px solid rgba(148,163,184,0.2); background: rgba(15,23,42,0.06); }",
      ".dark #eduDrawerQuickStrip { background: rgba(255,255,255,0.04); }",
      ".edu-dq-btn { flex: 1 1 auto; min-width: 58px; padding: 7px 8px; border-radius: 10px; border: 1px solid rgba(56,189,248,0.3); background: rgba(2,132,199,0.12); color: inherit; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; gap: 4px; cursor: pointer; }"
    ].join("\n");
    document.head.appendChild(uiCss);
  }

  function enhanceOption2HeaderDom() {
    if (isFloating) return;
    var row = document.querySelector("#siteTopHeader .header-main-row");
    if (!row) return;
    var brand = row.querySelector("a[data-top-nav='hero']");
    var menuBtn = document.getElementById("btnMenuToggle");
    var toolsBox = document.getElementById("btnThemeToggle") ? document.getElementById("btnThemeToggle").parentElement : null;

    if (brand && menuBtn && !document.getElementById("eduRightBrandGroup")) {
      var rightGroup = document.createElement("div");
      rightGroup.id = "eduRightBrandGroup";
      rightGroup.style.cssText = "display:flex;align-items:center;gap:6px;flex-shrink:0;";
      brand.parentNode.insertBefore(rightGroup, brand);
      rightGroup.appendChild(brand);
      rightGroup.appendChild(menuBtn);
    }

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

    var gSpan = document.querySelector("#btnGoogleLoginHeader span");
    if (gSpan && window.innerWidth <= 640 && gSpan.textContent.indexOf("بحساب") >= 0) {
      gSpan.textContent = "دخول";
    }
  }

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
    if (panel.children.length > 1) panel.insertBefore(strip, panel.children[1]);
    else panel.appendChild(strip);
  }

  function observeDrawer() {
    if (typeof MutationObserver === "undefined") return;
    var obs = new MutationObserver(function () {
      var panel = document.getElementById("eduFreshDrawerPanel");
      if (panel) injectDrawerQuickStrip(panel);
    });
    obs.observe(document.body, { childList: true, subtree: false });
  }

  // 4) Guaranteed Export Engine (Fixes stuck "جارٍ تجهيز محرك التصدير...")
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

  // 5) Fix Relative Ad Image URLs & Cache #homeAds for Instant Offline Display
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
    applyPolishCss();
    enhanceOption2HeaderDom();
    observeDrawer();
    ensureExporterReady();
    fixAdsImagesAndCache();
    setTimeout(enhanceOption2HeaderDom, 700);
    setTimeout(fixAdsImagesAndCache, 1800);
    setTimeout(fixAdsImagesAndCache, 4500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})(window);
