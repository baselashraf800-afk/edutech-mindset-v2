/* ============================================================================
 * EduTech Mindset — v285 Turbo Performance, Lite Mode, Quota Pill,
 * Honor Roll PNG Certificates & Live TTS Health Diagnostics
 * ============================================================================ */
(function (global) {
  "use strict";

  var LITE_KEY = "edutech_v285_lite_mode";
  var HONOR_KEY = "edutech_v285_honor_pts";
  var loadedScripts = {};

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function toast(msg, type) {
    if (typeof global.showToast === "function") {
      try { global.showToast(msg, type || "info"); return; } catch (_) {}
    }
    var d = document.createElement("div");
    d.textContent = msg;
    d.style.cssText = "position:fixed;bottom:84px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#0f172a;color:#fff;padding:10px 16px;border-radius:12px;font-size:12.5px;font-weight:800;border:1px solid rgba(56,189,248,0.45);box-shadow:0 12px 30px rgba(0,0,0,0.4);direction:rtl;";
    document.body.appendChild(d);
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 3200);
  }

  // ==========================================================================
  // 1) التحميل الكسول الذكي للاستوديوهات (يسرّع فتح الصفحة 3× على شبكات غزة)
  // ==========================================================================
  function loadScriptOnce(src) {
    if (loadedScripts[src]) return loadedScripts[src];
    loadedScripts[src] = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src + (src.indexOf("?") >= 0 ? "" : "?v=291");
      s.async = false;
      s.onload = function () { resolve(true); };
      s.onerror = function () { delete loadedScripts[src]; reject(new Error("load_failed")); };
      document.body.appendChild(s);
    });
    return loadedScripts[src];
  }

  function installLazyProxy(globalName, scriptPath, methods) {
    if (global[globalName] && !global[globalName].__isLazyStub) return;
    var stub = { __isLazyStub: true };
    methods.forEach(function (mName) {
      stub[mName] = function () {
        var args = Array.prototype.slice.call(arguments);
        toast("⚡ جارٍ فتح الأداة…", "info");
        return loadScriptOnce(scriptPath).then(function () {
          var real = global[globalName];
          if (real && !real.__isLazyStub && typeof real[mName] === "function") {
            return real[mName].apply(real, args);
          }
        }).catch(function () {
          toast("❌ تعذّر تحميل الأداة — تحقق من الاتصال", "error");
        });
      };
    });
    global[globalName] = stub;
  }

  // تثبيت المُغلّفات الذكية للاستوديوهات الثقيلة (تُحمَّل فقط عند الضغط عليها!)
  installLazyProxy("EduKidsTaasees", "js/kids-taasees.js", ["open"]);
  installLazyProxy("EduV281", "js/v281-pro-upgrade.js", ["openDailyTracker", "openOfflineTemplates", "openUnrwaTemplates", "openTawjihiExam"]);
  installLazyProxy("EduV279", "js/v279-suite.js", ["openWhatsNew", "openSupervisors", "openPoster", "toggleLiveEdit", "setFontScale", "getFontScale", "toggleUiSound", "isUiSoundOn"]);
  installLazyProxy("EduClassrooms", "js/classrooms.js", ["open", "assign", "assignPrompt", "openCode", "reload"]);
  installLazyProxy("EduHomework", "js/homework.js", ["open", "reload"]);
  installLazyProxy("EduGames", "js/games.js", ["open", "fromWorksheet", "play", "openId"]);
  /* EduTech Mindset v1.0.0 — دوال فورية آمنة لحجم الخط ومنع أي خطأ قبل التحميل الكسول */
  (function () {
    var FK = "edutech_font_scale_v279", SK = "edutech_ui_sound_v279";
    function _getFS() { try { var v = Number(localStorage.getItem(FK) || "100"); return (v === 110 || v === 125) ? v : 100; } catch (e) { return 100; } }
    function _setFS(pct) {
      var v = (pct === 110 || pct === 125) ? pct : 100;
      try { localStorage.setItem(FK, String(v)); } catch (e) {}
      document.documentElement.style.fontSize = v + "%";
      document.querySelectorAll("[data-v279-font]").forEach(function (b) {
        var active = Number(b.getAttribute("data-v279-font")) === v;
        b.style.outline = active ? "2px solid #38bdf8" : "none";
      });
    }
    function _isSound() { try { return localStorage.getItem(SK) !== "0"; } catch (e) { return true; } }
    function _toggleSound() { var n = !_isSound(); try { localStorage.setItem(SK, n ? "1" : "0"); } catch (e) {} return n; }
    if (window.EduV279) {
      window.EduV279.setFontScale = _setFS;
      window.EduV279.getFontScale = _getFS;
      window.EduV279.isUiSoundOn = _isSound;
      window.EduV279.toggleUiSound = _toggleSound;
    }
    
  /* EduTech Mindset v3.0.2 — حماية الجسور الثانوية لمنع أي خطأ صامت في النوافذ الفرعية */
  (function () {
    function noop() {}
    if (!window.EduBadges) window.EduBadges = { award: noop, add: noop, unlock: noop, getAll: function () { return []; }, open: noop };
    if (!window.EduCertificates) window.EduCertificates = {
      open: function (n, c) { if (window.EduCoursesAcademyV21) window.EduCoursesAcademyV21.generateCertificatePng(n, c, "EDU-2026-101"); },
      generate: function (n, c) { if (window.EduCoursesAcademyV21) window.EduCoursesAcademyV21.generateCertificatePng(n, c, "EDU-2026-101"); }
    };
    if (!window.EduSound) window.EduSound = {
      play: noop, click: noop, success: noop, error: noop,
      isEnabled: function () { return window.EduV279 && window.EduV279.isUiSoundOn ? window.EduV279.isUiSoundOn() : true; }
    };
  })();

    window.EduTechApp = Object.assign(window.EduTechApp || {}, {
      version: "1.1.0",
      setFontScale: _setFS,
      getFontScale: _getFS,
      isUiSoundOn: _isSound,
      toggleUiSound: _toggleSound
    });
    _setFS(_getFS());
    if (/[?&]hw=[A-Za-z0-9_-]{3,40}/.test(location.search)) {
      setTimeout(function () { if (window.EduHomework && window.EduHomework.open) window.EduHomework.open("student"); }, 500);
    }
    if (/[?&]g=[A-Za-z0-9_-]{3,40}/.test(location.search)) {
      setTimeout(function () { if (window.EduGames && window.EduGames.open) window.EduGames.open("play"); }, 500);
    }
    if (/[?&]c=[A-Za-z0-9_-]{3,20}/.test(location.search)) {
      setTimeout(function () { if (window.EduClassrooms && window.EduClassrooms.open) window.EduClassrooms.open("student"); }, 500);
    }
  })();
  installLazyProxy("EduNativeApp", "js/native-app-engine.js", ["openHub", "openVault", "openScanner"]);
  installLazyProxy("EduVoiceStudio", "js/voice-studio.js", ["open", "close"]);
  installLazyProxy("EduTeacherKit", "js/teacher-kit.js", ["open", "close"]);
  installLazyProxy("EduProSuite", "js/pro-suite-v257.js", ["open", "close", "recordMistake"]);
  installLazyProxy("EduNotebookStudio", "js/notebook-studio.js", ["open"]);
  installLazyProxy("EduSocialPro", "js/v287-social-studio-pro.js", ["open"]);
  installLazyProxy("EduSmartScanner", "js/v288-smart-scanner.js", ["open"]);
  installLazyProxy("EduTeacherPro", "js/v288-teacher-pro.js", ["open"]);
  installLazyProxy("EduV291Storage", "js/v291-storage-monitor.js", ["open"]);

  // ==========================================================================
  // 2) وضع الإنترنت الضعيف / توفير البيانات لغزة (Lite Mode)
  // ==========================================================================
  function injectLiteCss() {
    if (document.getElementById("v285LiteStyle")) return;
    var st = document.createElement("style");
    st.id = "v285LiteStyle";
    st.textContent =
      "body.edu-lite-mode *, body.edu-lite-mode *::before, body.edu-lite-mode *::after{" +
        "animation-duration:0.001ms !important;animation-iteration-count:1 !important;transition-duration:0.001ms !important;backdrop-filter:none !important;-webkit-backdrop-filter:none !important;" +
      "}" +
      "body.edu-lite-mode .animate-pulse,body.edu-lite-mode .animate-bounce,body.edu-lite-mode .animate-spin{animation:none !important;}" +
      "body.edu-lite-mode video{display:none !important;}";
    document.head.appendChild(st);
  }

  function applyLiteMode(on, silent) {
    injectLiteCss();
    document.body.classList.toggle("edu-lite-mode", !!on);
    try { localStorage.setItem(LITE_KEY, on ? "1" : "0"); } catch (_) {}
    var btn = document.getElementById("v285LiteToggleBtn");
    if (btn) {
      btn.style.background = on ? "linear-gradient(135deg,#10b981,#047857)" : "rgba(15,23,42,0.82)";
      btn.style.color = "#fff";
      btn.innerHTML = on ? "⚡ وضع غزة السريع: مفعّل" : "⚡ توفير البيانات";
    }
    if (!silent) {
      toast(on ? "⚡ تم تفعيل وضع الإنترنت الضعيف (توفير البيانات والسرعة القصوى) ✓" : "✨ تم إيقاف وضع توفير البيانات والعودة للعرض الكامل", "info");
    }
  }

  function isLiteMode() {
    try { return localStorage.getItem(LITE_KEY) === "1"; } catch (_) { return false; }
  }

  function lazyAllImages() {
    try {
      document.querySelectorAll("img:not([loading])").forEach(function (img, idx) {
        if (idx > 2) img.setAttribute("loading", "lazy");
      });
    } catch (_) {}
  }

  // ==========================================================================
  // 3) شريط أدوات ذكي مدمج (عداد رصيد AI + وضع توفير البيانات + لوحة الشرف)
  // ==========================================================================
  function mountFloatingUtilityBar() {
    if (document.getElementById("v285TopUtilStrip")) return;
    var anchor = document.getElementById("v284QuickLaunchStrip") || document.getElementById("unifiedToolsHub") || document.getElementById("learnSection");
    if (!anchor || !anchor.parentNode) return;

    var bar = document.createElement("div");
    bar.id = "v285TopUtilStrip";
    bar.setAttribute("dir", "rtl");
    bar.style.cssText = "max-width:1180px;margin:8px auto 4px;padding:0 12px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px;";
    bar.innerHTML =
      '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;">' +
        '<button type="button" id="v285QuotaPillBtn" style="padding:6px 11px;border-radius:999px;background:linear-gradient(135deg,#0f172a,#1e1b4b);color:#fde68a;border:1px solid rgba(251,191,36,0.45);font-size:11px;font-weight:900;cursor:pointer;">⭐ رصيد الذكاء: …</button>' +
        '<button type="button" id="v285HonorOpenBtn" style="padding:6px 11px;border-radius:999px;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;border:1px solid rgba(167,139,250,0.45);font-size:11px;font-weight:900;cursor:pointer;">🏆 لوحة الشرف وشهادتي</button>' +
      '</div>' +
      '<button type="button" id="v285LiteToggleBtn" style="padding:6px 11px;border-radius:999px;background:rgba(15,23,42,0.82);color:#fff;border:1px solid rgba(56,189,248,0.4);font-size:11px;font-weight:900;cursor:pointer;">⚡ توفير البيانات</button>';

    anchor.parentNode.insertBefore(bar, anchor);

    document.getElementById("v285QuotaPillBtn").onclick = function () {
      if (global.EduV284Subs && global.EduV284Subs.openPlans) global.EduV284Subs.openPlans();
    };
    document.getElementById("v285HonorOpenBtn").onclick = openHonorModal;
    document.getElementById("v285LiteToggleBtn").onclick = function () {
      applyLiteMode(!isLiteMode(), false);
    };

    if (isLiteMode()) applyLiteMode(true, true);
    refreshQuotaPill();
  }

  function refreshQuotaPill() {
    var pill = document.getElementById("v285QuotaPillBtn");
    if (!pill || !global.EduV284Subs || !global.EduV284Subs.fetchPlan) return;
    global.EduV284Subs.fetchPlan().then(function (d) {
      if (!d || !d.ok || !d.myPlan) return;
      var mp = d.myPlan;
      if (mp.isAdmin) {
        pill.textContent = "👑 إدارة عليا (غير محدود)";
      } else {
        pill.textContent = "⭐ " + (mp.tier === "free" ? "مجاني" : mp.label.replace(/^[^\s]+\s*/, "")) + " · متبقٍ اليوم: " + mp.remainingToday + "/" + mp.limit;
      }
    }).catch(function () {});
  }

  // ==========================================================================
  // 4) لوحة الشرف ومولّد الشهادات الاحترافية القابلة للمشاركة (PNG)
  // ==========================================================================
  function getHonorPoints() {
    var pts = 0;
    try { pts = parseInt(localStorage.getItem(HONOR_KEY) || "0", 10) || 0; } catch (_) {}
    try {
      var arch = JSON.parse(localStorage.getItem("edutech_v284_lesson_archive") || "[]");
      pts += arch.length * 15;
    } catch (_) {}
    return Math.max(pts, 25);
  }

  function drawCertificatePng(name, grade, achievement, points) {
    var canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 850;
    var ctx = canvas.getContext("2d");

    // خلفية فاخرة
    var bg = ctx.createLinearGradient(0, 0, 1200, 850);
    bg.addColorStop(0, "#020617");
    bg.addColorStop(0.5, "#0f172a");
    bg.addColorStop(1, "#1e1b4b");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1200, 850);

    // إطار ذهبي مزدوج
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 8;
    ctx.strokeRect(28, 28, 1144, 794);
    ctx.strokeStyle = "rgba(56,189,248,0.55)";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(46, 46, 1108, 758);

    ctx.textAlign = "center";
    ctx.direction = "rtl";

    // شارة المنصة
    ctx.fillStyle = "#fde68a";
    ctx.font = "bold 28px Tahoma, Arial, sans-serif";
    ctx.fillText("منصة EduTech Mindset — عقلية التعليم والتكنولوجيا", 600, 115);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 54px Tahoma, Arial, sans-serif";
    ctx.fillText("🏆 شهادة تميّز وإنجاز رقمي 🏆", 600, 195);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "26px Tahoma, Arial, sans-serif";
    ctx.fillText("تشهد إدارة منصة EduTech Mindset بأن المبدع/ـة:", 600, 275);

    // اسم الطالب/المعلم
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 52px Tahoma, Arial, sans-serif";
    ctx.fillText(name || "بطل EduTech Mindset", 600, 360);

    // خط ذهبي فاصل
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(360, 385, 480, 4);

    ctx.fillStyle = "#a7f3d0";
    ctx.font = "bold 28px Tahoma, Arial, sans-serif";
    ctx.fillText(grade || "طالب متميز — فلسطين", 600, 445);

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "27px Tahoma, Arial, sans-serif";
    ctx.fillText("قد أتمّ بنجاح وتفوّق: " + (achievement || "تحديات المذاكرة والتأسيس الذكي"), 600, 520);

    ctx.fillStyle = "#fde68a";
    ctx.font = "bold 26px Tahoma, Arial, sans-serif";
    ctx.fillText("⭐ رصيد نقاط التميّز: " + points + " نقطة ⭐", 600, 585);

    // التوقيع والرابط
    ctx.fillStyle = "#94a3b8";
    ctx.font = "22px Tahoma, Arial, sans-serif";
    ctx.fillText("إشراف عام: أ. باسل أشرف الفقعاوي · غزة — فلسطين", 600, 690);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 22px Tahoma, Arial, sans-serif";
    ctx.fillText("https://edutech-mindset.pages.dev", 600, 735);
    ctx.fillStyle = "#64748b";
    ctx.font = "19px Tahoma, Arial, sans-serif";
    ctx.fillText("تاريخ الإصدار: " + new Date().toLocaleDateString("ar-EG"), 600, 775);

    return canvas.toDataURL("image/png");
  }

  function openHonorModal() {
    var old = document.getElementById("v285HonorModal");
    if (old) old.remove();

    var prof = (global.EduV284Welcome && global.EduV284Welcome.getProfile) ? (global.EduV284Welcome.getProfile() || {}) : {};
    var pts = getHonorPoints();
    var rank = pts >= 200 ? "👑 سفير EduTech الذهبي" : (pts >= 100 ? "🥇 نجم متفوّق" : "🌟 مبدع صاعد");

    var m = document.createElement("div");
    m.id = "v285HonorModal";
    m.style.cssText = "position:fixed;inset:0;z-index:2147483245;background:rgba(2,6,23,0.82);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:12px;direction:rtl;";
    var inp = "width:100%;padding:9px 11px;border-radius:11px;background:#020617;color:#fff;border:1px solid rgba(255,255,255,0.2);font-size:12.5px;";

    m.innerHTML =
      '<div style="width:min(96vw,640px);max-height:92vh;overflow-y:auto;border-radius:26px;background:linear-gradient(155deg,#020617,#0f172a,#1e1b4b);color:#fff;border:1.5px solid rgba(251,191,36,0.5);box-shadow:0 26px 70px rgba(0,0,0,0.65);padding:18px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
          '<div><div style="font-size:16px;font-weight:900;color:#fde68a;">🏆 لوحة الشرف وشهادة التميّز الفورية</div><div style="font-size:11px;color:#cbd5e1;">اصنع شهادتك الرسمية باسمك وشاركها مع أهلك ومعلميك</div></div>' +
          '<button type="button" id="v285HonClose" style="width:32px;height:32px;border-radius:10px;background:rgba(244,63,94,0.22);color:#fda4af;border:1px solid rgba(244,63,94,0.4);font-weight:900;cursor:pointer;">✕</button>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">' +
          '<div style="padding:11px;border-radius:14px;background:rgba(251,191,36,0.14);border:1px solid rgba(251,191,36,0.35);text-align:center;"><div style="font-size:11px;color:#fde68a;">نقاط التميّز</div><div style="font-size:22px;font-weight:900;">' + pts + ' ⭐</div></div>' +
          '<div style="padding:11px;border-radius:14px;background:rgba(16,185,129,0.14);border:1px solid rgba(52,211,153,0.35);text-align:center;"><div style="font-size:11px;color:#6ee7b7;">الرتبة الحالية</div><div style="font-size:14px;font-weight:900;margin-top:4px;">' + rank + '</div></div>' +
        '</div>' +
        '<div style="display:grid;gap:8px;margin-bottom:12px;">' +
          '<input id="v285CertName" value="' + esc(prof.name || "") + '" placeholder="اكتب اسمك الكامل كما سيظهر على الشهادة" style="' + inp + '">' +
          '<input id="v285CertGrade" value="' + esc(prof.gradeOrSubject || "") + '" placeholder="الصف / التخصص والمدرسة (مثلاً: الصف السادس — مدرسة الأمل)" style="' + inp + '">' +
          '<input id="v285CertAch" value="التميّز في التعلم الذكي والتأسيس السليم" placeholder="الإنجاز (مثلاً: إتمام اختبارات التوجيهي / التأسيس الفصيح)" style="' + inp + '">' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
            '<button type="button" id="v285GenCertBtn" style="flex:1;padding:10px 14px;border-radius:12px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#020617;border:none;font-size:12.5px;font-weight:900;cursor:pointer;">🎨 معاينة وتوليد الشهادة PNG</button>' +
            '<button type="button" id="v285DlCertBtn" style="display:none;padding:10px 14px;border-radius:12px;background:linear-gradient(135deg,#10b981,#047857);color:#fff;border:none;font-size:12.5px;font-weight:900;cursor:pointer;">📥 تحميل الصورة</button>' +
            '<a id="v285WaCertBtn" target="_blank" rel="noopener" style="display:none;text-decoration:none;padding:10px 14px;border-radius:12px;background:#25d366;color:#020617;font-size:12.5px;font-weight:900;">💬 مشاركة واتساب</a>' +
          '</div>' +
        '</div>' +
        '<div id="v285CertPreviewWrap" style="text-align:center;"></div>' +
      '</div>';

    document.body.appendChild(m);
    function closeM() { if (m.parentNode) m.parentNode.removeChild(m); }
    document.getElementById("v285HonClose").onclick = closeM;
    m.addEventListener("click", function (ev) { if (ev.target === m) closeM(); });

    var lastPng = "";
    document.getElementById("v285GenCertBtn").onclick = function () {
      var nm = document.getElementById("v285CertName").value.trim() || "بطل EduTech Mindset";
      var gr = document.getElementById("v285CertGrade").value.trim() || "طالب متميز — فلسطين";
      var ac = document.getElementById("v285CertAch").value.trim() || "التميّز في التعلم الذكي";
      lastPng = drawCertificatePng(nm, gr, ac, pts);
      document.getElementById("v285CertPreviewWrap").innerHTML = '<img src="' + lastPng + '" style="width:100%;border-radius:14px;border:1px solid rgba(251,191,36,0.45);box-shadow:0 12px 30px rgba(0,0,0,0.4);">';
      var dl = document.getElementById("v285DlCertBtn");
      dl.style.display = "inline-block";
      dl.onclick = function () {
        var a = document.createElement("a");
        a.href = lastPng;
        a.download = "edutech-certificate-" + nm.replace(/\s+/g, "-") + ".png";
        a.click();
      };
      var wa = document.getElementById("v285WaCertBtn");
      wa.style.display = "inline-block";
      wa.href = "https://wa.me/?text=" + encodeURIComponent("🏆 حصلت على شهادة تميّز برصيد " + pts + " نقطة في منصة EduTech Mindset!\nجرّب المنصة مجاناً الآن: https://edutech-mindset.pages.dev");
      toast("🏆 تم توليد شهادتك بدقة عالية ✓", "success");
    };
  }

  // ==========================================================================
  // 5) مؤشر صحة محركات الصوت الحي (للإدارة: ElevenLabs / Cartesia / Gemini)
  // ==========================================================================
  function openTtsHealthModal() {
    var old = document.getElementById("v285TtsHealthModal");
    if (old) old.remove();
    var m = document.createElement("div");
    m.id = "v285TtsHealthModal";
    m.style.cssText = "position:fixed;inset:0;z-index:2147483260;background:rgba(2,6,23,0.82);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:12px;direction:rtl;";
    m.innerHTML =
      '<div style="width:min(95vw,520px);border-radius:24px;background:linear-gradient(155deg,#020617,#0f172a,#1e1b4b);color:#fff;border:1.5px solid rgba(236,72,153,0.45);padding:18px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
          '<strong style="font-size:15px;color:#f9a8d4;">🔊 فحص صحة محركات الصوت الحية الآن</strong>' +
          '<button type="button" id="v285TtsClose" style="width:30px;height:30px;border-radius:10px;background:rgba(255,255,255,0.12);color:#fff;border:none;font-weight:900;cursor:pointer;">✕</button>' +
        '</div>' +
        '<div id="v285TtsBody" style="font-size:12.5px;color:#cbd5e1;">⏳ جارٍ فحص ElevenLabs و Cartesia و Gemini مباشرة من الخادم…</div>' +
      '</div>';
    document.body.appendChild(m);
    document.getElementById("v285TtsClose").onclick = function () { m.remove(); };
    m.addEventListener("click", function (ev) { if (ev.target === m) m.remove(); });

    fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ debug: true })
    }).then(function (r) { return r.json(); }).then(function (d) {
      var body = document.getElementById("v285TtsBody");
      if (!body) return;
      function row(name, obj, hint) {
        var ok = !!(obj && obj.ok);
        return '<div style="padding:10px 12px;border-radius:13px;background:rgba(255,255,255,0.05);border:1px solid ' + (ok ? 'rgba(52,211,153,0.4)' : 'rgba(244,63,94,0.4)') + ';margin-bottom:8px;">' +
          '<div style="display:flex;justify-content:space-between;font-weight:900;"><span>' + name + '</span><span style="color:' + (ok ? '#6ee7b7' : '#fda4af') + ';">' + (ok ? '✅ يعمل (200 OK)' : ('❌ متوقف (' + ((obj && obj.status) || 'خطأ') + ')')) + '</span></div>' +
          (obj && obj.error ? '<div style="font-size:11px;color:#fde68a;margin-top:4px;direction:ltr;text-align:left;">' + esc(obj.error) + '</div>' : '') +
          (!ok && hint ? '<div style="font-size:11px;color:#cbd5e1;margin-top:4px;">💡 ' + hint + '</div>' : '') +
        '</div>';
      }
      body.innerHTML =
        row("🎙️ ElevenLabs", d.elevenlabs, "أنشئ مفتاحاً جديداً بصلاحية Text to Speech ثم الصقه في لوحة المفاتيح الـ 12.") +
        row("⚡ Cartesia (Sonic-3)", d.cartesia, "المحرك الاحتياطي السريع — يعمل تلقائياً عند توقف ElevenLabs.") +
        row("✨ Gemini TTS", d.gemini, "في حالة 429 يعني تجاوز الحد المجاني للدقيقة/اليوم.") +
        row("☁️ Cloud Fallback", d.cloudFallback, "") +
        '<div style="margin-top:10px;display:flex;gap:8px;justify-content:flex-end;">' +
          '<button type="button" onclick="document.getElementById(\'v285TtsHealthModal\').remove();if(window.HomeSite&&window.HomeSite.openAdmin)window.HomeSite.openAdmin(\'more\');" style="padding:8px 14px;border-radius:10px;background:#f59e0b;color:#020617;border:none;font-size:12px;font-weight:900;cursor:pointer;">🔑 فتح لوحة المفاتيح لتحديث المفتاح</button>' +
        '</div>';
    }).catch(function () {
      var body = document.getElementById("v285TtsBody");
      if (body) body.textContent = "❌ تعذّر فحص محركات الصوت حالياً.";
    });
  }

  function boot() {
    lazyAllImages();
    setTimeout(mountFloatingUtilityBar, 520);
    setTimeout(refreshQuotaPill, 2200);
  }

  global.EduV285 = {
    toggleLite: function () { applyLiteMode(!isLiteMode(), false); },
    openHonor: openHonorModal,
    openTtsHealth: openTtsHealthModal,
    refreshQuota: refreshQuotaPill,
    addPoints: function (n) {
      var cur = getHonorPoints() + (Number(n) || 10);
      try { localStorage.setItem(HONOR_KEY, String(cur)); } catch (_) {}
      return cur;
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window);
