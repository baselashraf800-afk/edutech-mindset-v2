/* ============================================================================
 * EduTech Mindset — v291 Native Android App Bridge (v2.1.0 Golden Edition)
 * 1) حفظ حقيقي 100% لجميع التنزيلات (PNG/MP3/PDF/CSV/SRT/TXT) عبر Android MediaStore
 * 2) طباعة PDF عبر Android PrintManager الأصلي
 * 3) وضع المساعد العائم الحقيقي (?floating=assistant) — نفس مساعد الموقع بالضبط
 * 4) الرجوع خطوة بخطوة + إعدادات التطبيق الكاملة + مكتبة الرفوف + Offline/Battery Smart Guard
 * ============================================================================ */
(function (global) {
  "use strict";

  var isNative = !!(
    global.__IS_EDUTECH_ANDROID_APP__ ||
    global.EduTechAndroid ||
    /EduTechMindsetApp/i.test(navigator.userAgent || "")
  );
  var isFloatingAssistantView = location.search.indexOf("floating=assistant") >= 0;
  var lastBackPressAt = 0;

  function toast(msg, type) {
    if (typeof global.showToast === "function") {
      try { global.showToast(msg, type || "info"); return; } catch (_) {}
    }
    var d = document.createElement("div");
    d.textContent = msg;
    d.style.cssText = "position:fixed;bottom:84px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#0f172a;color:#fff;padding:10px 16px;border-radius:12px;font-size:12.5px;font-weight:800;border:1px solid rgba(56,189,248,0.45);box-shadow:0 12px 30px rgba(0,0,0,0.4);direction:rtl;";
    document.body.appendChild(d);
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 2800);
  }

  function playSfx(name) {
    try {
      var a = new Audio("assets/audio-pack/" + name + ".mp3");
      a.volume = 0.55;
      a.play().catch(function () {});
    } catch (_) {}
  }

  // ==========================================================================
  // 1) مُعترِض التنزيلات العالمي — يُصلح كل أزرار الحفظ في الموقع داخل أندرويد 100%
  // ==========================================================================
  function saveViaNativeAndroid(href, filename) {
    if (!global.EduTechAndroid || typeof global.EduTechAndroid.saveBase64File !== "function") return false;
    var fn = (filename || ("EduTech_" + Date.now())).replace(/[^\u0600-\u06FFa-zA-Z0-9._\-]/g, "_");
    var lower = fn.toLowerCase();
    var mime = "application/octet-stream";
    var sub = "PDF_Reports";
    if (lower.endsWith(".png") || href.indexOf("image/png") >= 0) { mime = "image/png"; sub = "Social_Covers"; if (!lower.endsWith(".png")) fn += ".png"; }
    else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg") || href.indexOf("image/jpeg") >= 0) { mime = "image/jpeg"; sub = "Social_Covers"; }
    else if (lower.endsWith(".mp3") || href.indexOf("audio/mpeg") >= 0) { mime = "audio/mpeg"; sub = "Audio_MP3"; if (!lower.endsWith(".mp3")) fn += ".mp3"; }
    else if (lower.endsWith(".webm") || href.indexOf("video/webm") >= 0) { mime = "video/webm"; sub = "Social_Covers"; }
    else if (lower.endsWith(".pdf")) { mime = "application/pdf"; sub = "PDF_Reports"; }
    else if (lower.endsWith(".csv")) { mime = "text/csv"; sub = "PDF_Reports"; }
    else if (lower.endsWith(".srt") || lower.endsWith(".txt")) { mime = "text/plain"; sub = "PDF_Reports"; }

    function sendB64(b64) {
      try {
        global.EduTechAndroid.saveBase64File(b64, fn, mime, sub);
        playSfx("sfx_success");
      } catch (e) {
        toast("❌ تعذّر الحفظ على الهاتف", "error");
      }
    }

    if (href.indexOf("data:") === 0) {
      var comma = href.indexOf(",");
      if (comma > 0) sendB64(href.slice(comma + 1));
      return true;
    }
    if (href.indexOf("blob:") === 0) {
      fetch(href).then(function (r) { return r.blob(); }).then(function (blob) {
        var reader = new FileReader();
        reader.onloadend = function () {
          var res = String(reader.result || "");
          var c = res.indexOf(",");
          if (c > 0) sendB64(res.slice(c + 1));
        };
        reader.readAsDataURL(blob);
      }).catch(function () { toast("❌ تعذّر قراءة الملف للحفظ", "error"); });
      return true;
    }
    return false;
  }

  function installDownloadAndPrintInterceptors() {
    if (!isNative || !global.EduTechAndroid) return;

    // اعتراض كل <a download> في DOM (بما فيها الروابط التي تُنشأ ديناميكياً وتُضغط برمجياً a.click()!)
    var origAnchorClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      var href = this.getAttribute("href") || this.href || "";
      var dl = this.getAttribute("download");
      if (dl !== null && (href.indexOf("data:") === 0 || href.indexOf("blob:") === 0)) {
        if (saveViaNativeAndroid(href, dl)) return;
      }
      return origAnchorClick.apply(this, arguments);
    };

    document.addEventListener("click", function (ev) {
      var a = ev.target && ev.target.closest ? ev.target.closest("a[download]") : null;
      if (!a) return;
      var href = a.getAttribute("href") || a.href || "";
      if (href.indexOf("data:") === 0 || href.indexOf("blob:") === 0) {
        ev.preventDefault();
        saveViaNativeAndroid(href, a.getAttribute("download") || "");
      }
    }, true);

    // اعتراض window.print() لفتح Android PrintManager (حفظ PDF رسمي!)
    if (typeof global.EduTechAndroid.printCurrentPage === "function") {
      global.print = function () {
        try { global.EduTechAndroid.printCurrentPage(document.title || "EduTech_Mindset_PDF"); } catch (_) {}
      };
    }
  }

  // ==========================================================================
  // 2) وضع المساعد العائم الحقيقي (?floating=assistant) — نفس مساعد الموقع 100%
  // ==========================================================================
  function applyFloatingAssistantMode() {
    if (!isFloatingAssistantView) return;
    var st = document.createElement("style");
    st.textContent =
      "header, footer, #mobileBottomNav, #hero, #learnSection, #unifiedToolsHub, #v284QuickLaunchStrip, #v285TopUtilStrip, #coursesSection, #library, #adminDevFooterHub, #announcementBanner { display: none !important; }\n" +
      "body { background: #020617 !important; overflow: hidden !important; }\n" +
      "#assistantModal { display: flex !important; position: fixed !important; inset: 0 !important; z-index: 999999 !important; padding: 0 !important; }\n" +
      "#assistantModal > div { width: 100% !important; height: 100% !important; max-height: 100vh !important; border-radius: 0 !important; }\n";
    document.head.appendChild(st);
    function forceOpenAsst() {
      var m = document.getElementById("assistantModal");
      if (m) { m.classList.remove("hidden"); m.style.display = "flex"; }
      else {
        var b = document.getElementById("assistantFab") || document.querySelector("[data-open-assistant]");
        if (b) try { b.click(); } catch (_) {}
      }
    }
    setTimeout(forceOpenAsst, 300);
    setTimeout(forceOpenAsst, 1100);
  }

  function applyNativeAppChrome() {
    if (!isNative) return;
    document.documentElement.classList.add("edutech-native-android");
    if (document.body) document.body.classList.add("edutech-native-android");

    if (!document.getElementById("v289NativeAppCss")) {
      var st = document.createElement("style");
      st.id = "v289NativeAppCss";
      st.textContent =
        ".edutech-native-android #btnV172Fullscreen,\n" +
        ".edutech-native-android #btnHeaderInstallApp,\n" +
        ".edutech-native-android [data-install-apk],\n" +
        ".edutech-native-android #v257ApkLinkBtn { display: none !important; }\n" +
        ".edutech-native-android header.sticky { padding-top: env(safe-area-inset-top, 10px) !important; }\n";
      document.head.appendChild(st);
    }

    function hideApkButtons() {
      try {
        document.querySelectorAll("button, a").forEach(function (el) {
          var txt = (el.textContent || "").trim();
          if (txt.indexOf("تثبيت كتطبيق") >= 0 || txt.indexOf("تحميل APK") >= 0) el.style.display = "none";
        });
      } catch (_) {}
    }
    hideApkButtons();
    setTimeout(hideApkButtons, 1000);
    setTimeout(hideApkButtons, 2500);
  }

  function attachHapticsAndSmartGuards() {
    if (!isNative) return;
    document.addEventListener("click", function (ev) {
      var btn = ev.target && ev.target.closest ? ev.target.closest("button, a") : null;
      if (btn && global.EduTechAndroid && typeof global.EduTechAndroid.hapticLight === "function") {
        try { global.EduTechAndroid.hapticLight(); } catch (_) {}
      }
    }, true);

    // مؤشر انقطاع الإنترنت الهادئ (بدون شاشة خطأ بيضاء)
    function updateOnlineBanner() {
      var id = "v291OfflineBanner";
      var ex = document.getElementById(id);
      if (navigator.onLine) { if (ex) ex.remove(); return; }
      if (ex) return;
      var b = document.createElement("div");
      b.id = id;
      b.style.cssText = "position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:2147483050;background:#0f172a;color:#fde68a;border:1px solid #f59e0b;padding:6px 14px;border-radius:999px;font-size:11px;font-weight:900;direction:rtl;box-shadow:0 8px 24px rgba(0,0,0,0.4);";
      b.textContent = "📡 بدون إنترنت — التأسيس الفصيح والرفوف وماسح PDF شغّالة 100%";
      document.body.appendChild(b);
    }
    window.addEventListener("offline", updateOnlineBanner);
    window.addEventListener("online", updateOnlineBanner);
    updateOnlineBanner();

    // تفعيل وضع التوفير تلقائياً عند انخفاض البطارية أقل من 20%
    if (navigator.getBattery) {
      navigator.getBattery().then(function (bat) {
        if (bat.level <= 0.20 && !bat.charging && global.EduV285 && !document.body.classList.contains("edu-lite-mode")) {
          toast("🔋 البطارية منخفضة — يمكنك تفعيل «⚡ توفير البيانات» لحفظ الشحن", "info");
        }
      }).catch(function () {});
    }
  }

  // ==========================================================================
  // 3) الرجوع خطوة بخطوة بدون العودة للبداية
  // ==========================================================================
  function handleNativeBack() {
    if (localStorage.getItem("edutech_v291_kids_lock") === "1" && document.getElementById("eduKidsTaaseesModal")) {
      toast("🧒 وضع أمان الطفل مفعّل — افتح القفل من إعدادات التطبيق للخروج", "warn");
      return true;
    }
    var modalIds = [
      "v287Teleprompter", "v291StorageModal", "v289NativeSettingsModal",
      "v288SmartScannerModal", "v288TeacherProModal", "v287SocialProModal",
      "v285TtsHealthModal", "v285HonorModal", "v284ProfileModal",
      "v284AdminBillingModal", "v284ProStudioModal", "v284PlansModal",
      "v284WelcomeModal", "v283LiveMonitorModal", "eduKidsTaaseesModal",
      "v281TrackerModal", "v281UnrwaModal", "v281TawjihiModal", "eduFreshDrawer"
    ];
    for (var i = 0; i < modalIds.length; i++) {
      var el = document.getElementById(modalIds[i]);
      if (el && el.style.display !== "none" && !el.classList.contains("hidden")) { el.remove(); return true; }
    }
    var classicModals = [
      { id: "assistantModal", close: "btnCloseAssistant" },
      { id: "voiceStudioModal", close: "btnCloseVoiceStudio" },
      { id: "adminModal", close: "btnCloseAdmin" },
      { id: "resourceModal", close: "btnCloseResourceModal" },
      { id: "mobileNavDrawer", close: "btnMenuClose" }
    ];
    for (var j = 0; j < classicModals.length; j++) {
      var cm = document.getElementById(classicModals[j].id);
      if (cm && !cm.classList.contains("hidden") && cm.style.display !== "none") {
        var cb = document.getElementById(classicModals[j].close);
        if (cb) { try { cb.click(); } catch (_) { cm.classList.add("hidden"); } }
        else cm.classList.add("hidden");
        return true;
      }
    }
    var dyn = document.querySelector(".edu-v279-modal, .kt-overlay");
    if (dyn) { dyn.remove(); return true; }
    if (location.hash && location.hash !== "#" && location.hash !== "#hero") {
      try { history.back(); return true; } catch (_) {}
    }
    var now = Date.now();
    if (now - lastBackPressAt < 2200) return false;
    lastBackPressAt = now;
    toast("اضغط رجوع مرة أخرى للخروج من EduTech Mindset", "info");
    return true;
  }

  // ==========================================================================
  // 4) نافذة إعدادات تطبيق الأندرويد الشاملة (v2.1.0)
  // ==========================================================================
  function openNativeAppSettings() {
    var old = document.getElementById("v289NativeSettingsModal");
    if (old) old.remove();

    var br = global.EduTechAndroid;
    var curMode = (br && br.getFloatingMode) ? (br.getFloatingMode() || "compact") : "compact";
    var curOn = (br && br.isFloatingActive) ? !!br.isFloatingActive() : false;
    var keepOn = (br && br.isKeepScreenOn) ? !!br.isKeepScreenOn() : false;
    var shakeOn = (br && br.isShakeEnabled) ? !!br.isShakeEnabled() : false;
    var bioOn = (br && br.isBiometricLockEnabled) ? !!br.isBiometricLockEnabled() : false;
    var kidsLock = localStorage.getItem("edutech_v291_kids_lock") === "1";

    var m = document.createElement("div");
    m.id = "v289NativeSettingsModal";
    m.style.cssText = "position:fixed;inset:0;z-index:2147483300;background:rgba(2,6,23,0.86);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:12px;direction:rtl;";
    m.innerHTML =
      '<div style="width:min(96vw,500px);max-height:92vh;overflow-y:auto;border-radius:24px;background:linear-gradient(155deg,#020617,#0f172a,#1e1b4b);color:#fff;border:1.5px solid rgba(56,189,248,0.5);padding:18px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
          '<strong style="font-size:15.5px;color:#7dd3fc;">🤖 مركز تحكم تطبيق الأندرويد (v2.1.0)</strong>' +
          '<button type="button" id="v289NsClose" style="width:30px;height:30px;border-radius:10px;background:rgba(255,255,255,0.12);color:#fff;border:none;font-weight:900;cursor:pointer;">✕</button>' +
        '</div>' +
        '<div style="padding:12px;border-radius:15px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);margin-bottom:10px;">' +
          '<div style="font-size:13px;font-weight:900;color:#fde68a;margin-bottom:6px;">✨ المساعد الذكي العائم (نفس مساعد الموقع بشعار EduTech)</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:9px;">' +
            '<button type="button" data-fl-mode="compact" style="padding:9px 7px;border-radius:11px;background:' + (curMode === "compact" ? 'linear-gradient(135deg,#0284c7,#2563eb)' : 'rgba(255,255,255,0.07)') + ';color:#fff;border:1px solid ' + (curMode === "compact" ? '#7dd3fc' : 'rgba(255,255,255,0.16)') + ';font-size:11.5px;font-weight:900;cursor:pointer;">💬 نافذة عائمة مختصرة</button>' +
            '<button type="button" data-fl-mode="full" style="padding:9px 7px;border-radius:11px;background:' + (curMode === "full" ? 'linear-gradient(135deg,#10b981,#047857)' : 'rgba(255,255,255,0.07)') + ';color:#fff;border:1px solid ' + (curMode === "full" ? '#6ee7b7' : 'rgba(255,255,255,0.16)') + ';font-size:11.5px;font-weight:900;cursor:pointer;">📱 شاشة كاملة</button>' +
          '</div>' +
          '<button type="button" id="v289ToggleFloatBtn" style="width:100%;padding:10px;border-radius:12px;background:' + (curOn ? 'linear-gradient(135deg,#dc2626,#991b1b)' : 'linear-gradient(135deg,#f59e0b,#d97706)') + ';color:' + (curOn ? '#fff' : '#020617') + ';border:none;font-size:12.5px;font-weight:900;cursor:pointer;">' + (curOn ? '🛑 إيقاف الفقاعة العائمة' : '🚀 تفعيل المساعد العائم فوق التطبيقات') + '</button>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:10px;">' +
          '<button type="button" id="v291BookshelfBtn" style="padding:10px 8px;border-radius:13px;background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;border:none;font-size:12px;font-weight:900;cursor:pointer;">📚 مكتبة رفوف كتبي</button>' +
          '<button type="button" id="v291ShareAppBtn" style="padding:10px 8px;border-radius:13px;background:linear-gradient(135deg,#10b981,#047857);color:#fff;border:none;font-size:12px;font-weight:900;cursor:pointer;">📲 شارك التطبيق</button>' +
        '</div>' +
        '<div style="display:grid;gap:7px;font-size:12px;margin-bottom:10px;">' +
          '<label style="display:flex;justify-content:space-between;align-items:center;padding:8px 11px;border-radius:11px;background:rgba(255,255,255,0.05);"><span>💡 إبقاء الشاشة مضاءة أثناء المذاكرة</span><input type="checkbox" id="v291KeepScr"' + (keepOn ? ' checked' : '') + '></label>' +
          '<label style="display:flex;justify-content:space-between;align-items:center;padding:8px 11px;border-radius:11px;background:rgba(255,255,255,0.05);"><span>📳 هزّ الهاتف لفتح المساعد الذكي</span><input type="checkbox" id="v291ShakeChk"' + (shakeOn ? ' checked' : '') + '></label>' +
          '<label style="display:flex;justify-content:space-between;align-items:center;padding:8px 11px;border-radius:11px;background:rgba(255,255,255,0.05);"><span>🔒 قفل التطبيق بالبصمة (للمعلم والمدير)</span><input type="checkbox" id="v291BioChk"' + (bioOn ? ' checked' : '') + '></label>' +
          '<label style="display:flex;justify-content:space-between;align-items:center;padding:8px 11px;border-radius:11px;background:rgba(255,255,255,0.05);"><span>🧒 قفل أمان الطفل داخل التأسيس السليم</span><input type="checkbox" id="v291KidsChk"' + (kidsLock ? ' checked' : '') + '></label>' +
        '</div>' +
        '<div style="padding:10px 12px;border-radius:13px;background:rgba(16,185,129,0.12);border:1px solid rgba(52,211,153,0.35);font-size:11px;color:#e2e8f0;">' +
          '<strong style="color:#6ee7b7;">📁 مجلدات حفظ ملفاتك على الهاتف:</strong><br>' +
          '<code dir="ltr" style="color:#fde68a;">Pictures/EduTechMindset/ · Documents/EduTechMindset/</code>' +
        '</div>' +
      '</div>';

    document.body.appendChild(m);
    document.getElementById("v289NsClose").onclick = function () { m.remove(); };
    m.addEventListener("click", function (ev) { if (ev.target === m) m.remove(); });

    m.querySelectorAll("[data-fl-mode]").forEach(function (b) {
      b.onclick = function () {
        var md = b.getAttribute("data-fl-mode");
        if (br && br.setFloatingMode) { br.setFloatingMode(md); toast("✅ تم حفظ وضع المساعد العائم ✓", "success"); openNativeAppSettings(); }
      };
    });
    document.getElementById("v289ToggleFloatBtn").onclick = function () {
      if (br && br.toggleFloatingBubble) { br.toggleFloatingBubble(); setTimeout(openNativeAppSettings, 400); }
    };
    document.getElementById("v291BookshelfBtn").onclick = function () {
      m.remove();
      if (br && br.openBookshelf) br.openBookshelf();
      else toast("📚 مكتبة الرفوف متاحة داخل تطبيق الأندرويد v2.1.0", "info");
    };
    document.getElementById("v291ShareAppBtn").onclick = function () {
      if (br && br.shareText) br.shareText("تطبيق EduTech Mindset للتعليم والذكاء الاصطناعي والمنهاج الفلسطيني — جرّبه مجاناً:\nhttps://edutech-mindset.pages.dev");
    };
    document.getElementById("v291KeepScr").onchange = function (e) { if (br && br.setKeepScreenOn) br.setKeepScreenOn(!!e.target.checked); };
    document.getElementById("v291ShakeChk").onchange = function (e) { if (br && br.setShakeEnabled) br.setShakeEnabled(!!e.target.checked); };
    document.getElementById("v291BioChk").onchange = function (e) { if (br && br.setBiometricLockEnabled) br.setBiometricLockEnabled(!!e.target.checked); };
    document.getElementById("v291KidsChk").onchange = function (e) { localStorage.setItem("edutech_v291_kids_lock", e.target.checked ? "1" : "0"); toast(e.target.checked ? "🧒 تم تفعيل قفل أمان الطفل ✓" : "تم إيقاف قفل الطفل", "info"); };
  }

  function boot() {
    applyFloatingAssistantMode();
    applyNativeAppChrome();
    installDownloadAndPrintInterceptors();
    attachHapticsAndSmartGuards();
    if (location.search.indexOf("open=assistant") >= 0) {
      setTimeout(function () { var ab = document.getElementById("assistantFab") || document.querySelector("[data-open-assistant]"); if (ab) ab.click(); }, 900);
    } else if (location.search.indexOf("open=scanner") >= 0) {
      setTimeout(function () { if (global.EduSmartScanner) global.EduSmartScanner.open(); }, 900);
    } else if (location.search.indexOf("open=teacher") >= 0) {
      setTimeout(function () { if (global.EduTeacherPro) global.EduTeacherPro.open(); }, 900);
    } else if (location.search.indexOf("open=kids") >= 0) {
      setTimeout(function () { if (global.EduKidsTaasees) global.EduKidsTaasees.open(); }, 900);
    }
  }

  global.EduHandleNativeBack = handleNativeBack;
  global.EduNativeBridge = {
    isNative: isNative,
    openSettings: openNativeAppSettings,
    handleBack: handleNativeBack,
    playSfx: playSfx
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window);
