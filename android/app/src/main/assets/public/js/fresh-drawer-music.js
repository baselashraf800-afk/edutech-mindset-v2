/* ============================================================================
 * EduTech Mindset v258 — القائمة الشاملة الجديدة من الصفر (#eduFreshDrawer) + محرك الموسيقى الهادئة الموقّت من الإدارة (EduBgMusic)
 * خالٍ تماماً من أي كود قديم، متوافق 100% مع الوضع النهاري/الليلي وزر الرجوع والعمل أوفلاين
 * ============================================================================ */
(function (global) {
  "use strict";

  // ===================== 1) محرك الموسيقى الخلفية الهادئة (أوفلاين 100% + رابط MP3 مخصص من الإدارة) =====================
  var musicPlaying = false;
  var musicScheduled = false;
  var musicTimer = null;
  var audioCtx = null;
  var chordTimer = null;
  var customAudioEl = null;

  function getMusicCfg() {
    var pol = (global.EduTechTTS && typeof global.EduTechTTS.getPolicy === "function") ? global.EduTechTTS.getPolicy() : {};
    return {
      enabled: pol.musicEnabled !== false,
      delaySec: typeof pol.musicDelaySec === "number" ? pol.musicDelaySec : 60,
      vol: typeof pol.musicVol === "number" ? pol.musicVol : 0.25,
      url: String(pol.musicUrl || "").trim()
    };
  }

  function syncMusicDot(on) {
    var dot = document.getElementById("headerMusicDot");
    if (dot) dot.classList.toggle("hidden", !on);
  }

  function stopBgMusic() {
    musicPlaying = false;
    if (chordTimer) { clearInterval(chordTimer); chordTimer = null; }
    if (customAudioEl) { try { customAudioEl.pause(); } catch (e) {} }
    if (audioCtx) { try { audioCtx.close(); } catch (e) {} audioCtx = null; }
    syncMusicDot(false);
  }

  function playGentleAmbientChord(ctx, freqs, vol) {
    var now = ctx.currentTime;
    freqs.forEach(function (f) {
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, now);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(vol * 0.09, now + 0.9);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 3.6);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 3.7);
    });
  }

  function startBgMusic() {
    if (musicPlaying) return;
    var cfg = getMusicCfg();
    musicPlaying = true;
    syncMusicDot(true);

    if (cfg.url) {
      try {
        if (!customAudioEl || customAudioEl.src !== cfg.url) {
          customAudioEl = new Audio(cfg.url);
          customAudioEl.setAttribute("data-raw-src", cfg.url);
          customAudioEl.loop = true;
        }
        customAudioEl.volume = Math.min(0.85, Math.max(0.05, cfg.vol));
        customAudioEl.play().catch(function () { musicPlaying = false; syncMusicDot(false); });
        return;
      } catch (e) {}
    }

    // موسيقى تعليمية هادئة ومبهجة مولّدة محلياً عبر Web Audio API (تعمل 100% أوفلاين)
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
      var chords = [
        [261.63, 329.63, 392.00], // C major
        [220.00, 261.63, 329.63], // A minor
        [174.61, 220.00, 261.63], // F major
        [196.00, 246.94, 293.66]  // G major
      ];
      var ci = 0;
      playGentleAmbientChord(audioCtx, chords[0], cfg.vol);
      chordTimer = setInterval(function () {
        if (!musicPlaying || !audioCtx) return;
        ci = (ci + 1) % chords.length;
        playGentleAmbientChord(audioCtx, chords[ci], cfg.vol);
      }, 3800);
    } catch (e) {
      musicPlaying = false;
      syncMusicDot(false);
    }
  }

  function toggleBgMusic() {
    if (musicPlaying) {
      stopBgMusic();
      if (typeof showToast === "function") showToast("🔇 تم إيقاف الموسيقى الخلفية", "info");
    } else {
      startBgMusic();
      if (typeof showToast === "function") showToast("🎵 تم تشغيل الموسيقى الخلفية الهادئة ✓", "success");
    }
  }

  function armTimedMusicOnFirstTouch() {
    if (musicScheduled) return;
    var cfg = getMusicCfg();
    if (!cfg.enabled) return;
    musicScheduled = true;
    var delayMs = Math.max(0, cfg.delaySec * 1000);
    musicTimer = setTimeout(function () {
      var latest = getMusicCfg();
      if (latest.enabled && !musicPlaying) startBgMusic();
    }, delayMs);
  }

  document.addEventListener("pointerdown", armTimedMusicOnFirstTouch, { once: true, capture: true, passive: true });
  document.addEventListener("click", function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest("#btnHeaderMusic") : null;
    if (!b) return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
    toggleBgMusic();
  }, true);

  function applyPolicy() {
    var cfg = getMusicCfg();
    if (!cfg.enabled) { stopBgMusic(); return; }
    if (customAudioEl) {
      if (cfg.url && customAudioEl.getAttribute("data-raw-src") !== cfg.url) {
        var wasPlaying = musicPlaying;
        stopBgMusic();
        if (wasPlaying) startBgMusic();
      } else {
        customAudioEl.volume = Math.min(0.85, Math.max(0.05, cfg.vol));
      }
    }
  }
  function setDuck(ducked) {
    if (!customAudioEl || !musicPlaying) return;
    var cfg = getMusicCfg();
    var base = Math.min(0.85, Math.max(0.05, cfg.vol));
    customAudioEl.volume = ducked ? Math.max(0.03, base * 0.25) : base;
  }
  global.EduBgMusic = { start: startBgMusic, stop: stopBgMusic, toggle: toggleBgMusic, isPlaying: function () { return musicPlaying; }, applyPolicy: applyPolicy, setDuck: setDuck };

  // ===================== 2) القائمة الشاملة الجديدة من الصفر (#eduFreshDrawer) =====================
  function closeFreshDrawer() {
    var el = document.getElementById("eduFreshDrawer");
    if (el && el.parentNode) el.parentNode.removeChild(el);
    document.body.classList.remove("edu-any-modal-open");
    document.documentElement.classList.remove("modal-open");
  }

  function openFreshDrawer() {
    closeFreshDrawer();
    var isDark = document.documentElement.classList.contains("dark");
    var isAdm = document.body && document.body.classList.contains("is-super-admin");

    var bg = isDark ? "#0f172a" : "#ffffff";
    var fg = isDark ? "#f8fafc" : "#0f172a";
    var cardBg = isDark ? "#1e293b" : "#f1f5f9";
    var border = isDark ? "rgba(148,163,184,0.22)" : "#cbd5e1";

    var mainLinks = [
      { id: "native_hub", ico: "📱", title: "خزنة الهاتف وقارئ PDF والوسائط", badge: "أوفلاين", accent: true, act: function () { if (global.EduNativeApp) global.EduNativeApp.openHub(); } },
      { id: "home", ico: "🏠", title: "الرئيسية وبداية المنصة", badge: "البداية", act: function () { window.scrollTo({ top: 0, behavior: "smooth" }); } },
      { id: "learn", ico: "🏫", title: "المراحل الدراسية والمنهاج", badge: "صفوف 1–12", act: function () { var s = document.getElementById("learnSection"); if (s) s.scrollIntoView({ behavior: "smooth", block: "start" }); } },
      { id: "tools", ico: "🛠️", title: "مركز الأدوات والمختبرات", badge: "26 أداة", act: function () { var s = document.getElementById("unifiedToolsHub"); if (s) s.scrollIntoView({ behavior: "smooth", block: "start" }); } },
      { id: "voice", ico: "🎙️", title: "استوديو الصوت الذكي (MP3 وبودكاست)", badge: "4 أدوات", act: function () { if (global.EduVoiceStudio) global.EduVoiceStudio.open("mp3"); } },
      { id: "tkit", ico: "👩‍🏫", title: "حقيبة المعلم الاحترافية", badge: "5 أدوات", act: function () { if (global.EduTeacherKit) global.EduTeacherKit.open("timer"); } },
      { id: "focus", ico: "🎧", title: "غرفة التركيز والدعاء والجدول", badge: "أوفلاين", act: function () { if (global.EduProSuite) global.EduProSuite.open("focus"); } },
      { id: "courses", ico: "🎓", title: "الدورات التدريبية والتسجيل", badge: "دورات", act: function () {
        function goC() { var cs = document.getElementById("coursesSection"); if (cs) { cs.classList.remove("hidden"); cs.style.display = "block"; cs.scrollIntoView({ behavior: "smooth", block: "start" }); return true; } return false; }
        if (!goC() && global.EduModules && global.EduModules.loadScript) global.EduModules.loadScript("js/edutech-pro-pack.js").then(function () { setTimeout(goC, 250); });
      } },
      { id: "supervisors", ico: "📋", title: "بوابة المشرفين والتقارير الرسمية", badge: "PDF", act: function () { if (global.EduV279) global.EduV279.openSupervisors(); } },
      { id: "poster", ico: "🎨", title: "مولّد بوسترات الإعلانات الفوري", badge: "PNG", act: function () { if (global.EduV279) global.EduV279.openPoster(); } },
      { id: "whatsnew", ico: "✨", title: "ما الجديد في المنصة (v279)", badge: "جديد", act: function () { if (global.EduV279) global.EduV279.openWhatsNew(); } },
      { id: "install", ico: "📲", title: "تثبيت التطبيق / تحميل APK المباشر", badge: "APK جاهز", act: function () { if (global.EduAppInstall) global.EduAppInstall.open(); } },
      { id: "account", ico: "👤", title: "حسابي الشخصي وتسجيل الدخول", badge: "حسابي", act: function () {
        var uB = document.getElementById("btnUserHeaderProfile"), gB = document.getElementById("btnGoogleLoginHeader");
        if (uB && !uB.classList.contains("hidden")) uB.click(); else if (gB) gB.click();
      } }
    ];
    if (isAdm) {
      mainLinks.push({ id: "admin", ico: "👑", title: "لوحة القيادة والإدارة الموحّدة", badge: "للإدارة", accent: true, act: function () { var ah = document.getElementById("adminDevFooterHub"); if (ah) { ah.style.display = ""; ah.scrollIntoView({ behavior: "smooth", block: "start" }); } } });
    }

    var gradesHtml = "";
    for (var g = 1; g <= 12; g++) {
      var lbl = g === 12 ? "توجيهي 12" : ("الصف " + g);
      gradesHtml += '<button type="button" data-fd-grade="' + g + '" style="padding:9px 6px;border-radius:12px;background:' + (g === 12 ? 'linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;' : cardBg + ';color:' + fg + ';') + 'border:1px solid ' + border + ';font-size:11.5px;font-weight:900;cursor:pointer;">🏫 ' + lbl + '</button>';
    }

    var wrap = document.createElement("div");
    wrap.id = "eduFreshDrawer";
    wrap.setAttribute("dir", "rtl");
    wrap.style.cssText = "position:fixed;inset:0;z-index:99995;background:rgba(2,6,23,0.72);backdrop-filter:blur(5px);display:flex;justify-content:flex-start;";
    wrap.innerHTML =
      '<div id="eduFreshDrawerPanel" style="width:min(90vw,390px);height:100%;background:' + bg + ';color:' + fg + ';display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.5);overflow:hidden;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:13px 14px;background:linear-gradient(135deg,#0c4a6e,#1e1b4b);color:#fff;flex-shrink:0;">' +
          '<div><strong style="font-size:14.5px;font-weight:900;">🧭 القائمة الشاملة السريعة</strong><div style="font-size:10.5px;color:#bae6fd;">اختر القسم أو الصف الدراسي مباشرة</div></div>' +
          '<button type="button" id="eduFdClose" style="padding:6px 12px;border-radius:11px;background:rgba(255,255,255,0.18);color:#fff;border:none;font-size:12px;font-weight:900;cursor:pointer;">✕ إغلاق</button>' +
        '</div>' +
        '<div style="padding:10px 12px;border-bottom:1px solid ' + border + ';display:flex;gap:6px;">' +
          '<input id="eduFdSearch" type="search" placeholder="ابحث عن أداة أو درس…" style="flex:1;padding:9px 11px;border-radius:12px;background:' + cardBg + ';color:' + fg + ';border:1px solid ' + border + ';font-size:12px;font-weight:700;outline:none;">' +
          '<button type="button" id="eduFdMusicBtn" title="تشغيل/إيقاف الموسيقى" style="padding:0 12px;border-radius:12px;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff;border:none;font-size:13px;font-weight:900;cursor:pointer;">' + (musicPlaying ? '🔊' : '🎵') + '</button>' +
        '</div>' +
        '<div style="padding:7px 12px;border-bottom:1px solid ' + border + ';display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:11px;font-weight:800;">' +
          '<span style="color:#38bdf8;">🔎 حجم الخط:</span>' +
          '<div style="display:flex;gap:4px;">' +
            '<button type="button" data-v279-font="100" style="padding:4px 8px;border-radius:8px;border:1px solid ' + border + ';font-size:11px;font-weight:900;cursor:pointer;color:' + fg + ';">100%</button>' +
            '<button type="button" data-v279-font="110" style="padding:4px 8px;border-radius:8px;border:1px solid ' + border + ';font-size:11px;font-weight:900;cursor:pointer;color:' + fg + ';">110%</button>' +
            '<button type="button" data-v279-font="125" style="padding:4px 8px;border-radius:8px;border:1px solid ' + border + ';font-size:11px;font-weight:900;cursor:pointer;color:' + fg + ';">125%</button>' +
          '</div>' +
          '<button type="button" id="eduFdUiSoundBtn" title="مؤثرات النقر" style="padding:4px 8px;border-radius:8px;border:1px solid ' + border + ';background:rgba(148,163,184,0.14);color:' + fg + ';font-size:11px;font-weight:900;cursor:pointer;">' + ((global.EduV279 && global.EduV279.isUiSoundOn && global.EduV279.isUiSoundOn()) ? "🔔 صوت" : "🔕 صامت") + '</button>' +
        '</div>' +
        '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px;display:flex;flex-direction:column;gap:8px;">' +
          mainLinks.map(function (it, idx) {
            return '<button type="button" data-fd-idx="' + idx + '" style="width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:11px 12px;border-radius:14px;background:' + (it.accent ? 'linear-gradient(135deg,#e11d48,#be123c);color:#fff;' : cardBg + ';color:' + fg + ';') + 'border:1px solid ' + border + ';font-size:12.5px;font-weight:900;cursor:pointer;text-align:right;">' +
              '<span style="display:flex;align-items:center;gap:8px;"><span style="font-size:17px;">' + it.ico + '</span><span>' + it.title + '</span></span>' +
              '<span style="padding:2px 8px;border-radius:999px;background:rgba(14,165,233,0.18);font-size:10px;font-weight:900;">' + it.badge + '</span>' +
            '</button>';
          }).join("") +
          '<div style="margin-top:8px;padding-top:10px;border-top:1px solid ' + border + ';">' +
            '<div style="font-size:11.5px;font-weight:900;color:#10b981;margin-bottom:8px;">🏫 انتقال مباشر للصف الدراسي (1 – 12):</div>' +
            '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">' + gradesHtml + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(wrap);
    wrap.querySelectorAll("[data-v279-font]").forEach(function (b) {
      b.onclick = function () { if (global.EduV279) global.EduV279.setFontScale(Number(b.getAttribute("data-v279-font"))); };
    });
    if (global.EduV279 && global.EduV279.setFontScale) global.EduV279.setFontScale(global.EduV279.getFontScale());
    var uiSB = document.getElementById("eduFdUiSoundBtn");
    if (uiSB) uiSB.onclick = function () { if (global.EduV279) { var on = global.EduV279.toggleUiSound(); uiSB.textContent = on ? "🔔 صوت" : "🔕 صامت"; } };
    document.body.classList.add("edu-any-modal-open");
    document.documentElement.classList.add("modal-open");

    wrap.onclick = function (ev) { if (ev.target === wrap) closeFreshDrawer(); };
    document.getElementById("eduFdClose").onclick = closeFreshDrawer;
    document.getElementById("eduFdMusicBtn").onclick = function () {
      toggleBgMusic();
      this.textContent = musicPlaying ? "🔊" : "🎵";
    };
    var sInp = document.getElementById("eduFdSearch");
    if (sInp) {
      sInp.onkeydown = function (ev) {
        if (ev.key === "Enter" && sInp.value.trim()) {
          var q = sInp.value.trim();
          closeFreshDrawer();
          var th = document.getElementById("unifiedToolsHub");
          if (th) th.scrollIntoView({ behavior: "smooth", block: "start" });
          var ti = document.getElementById("eduToolsHubSearch");
          if (ti) { ti.value = q; ti.dispatchEvent(new Event("input")); }
        }
      };
    }

    wrap.querySelectorAll("[data-fd-idx]").forEach(function (b) {
      b.onclick = function () {
        var it = mainLinks[parseInt(b.getAttribute("data-fd-idx"), 10)];
        closeFreshDrawer();
        if (it && typeof it.act === "function") setTimeout(it.act, 40);
      };
    });

    wrap.querySelectorAll("[data-fd-grade]").forEach(function (b) {
      b.onclick = function () {
        var gNum = parseInt(b.getAttribute("data-fd-grade"), 10) || 1;
        closeFreshDrawer();
        setTimeout(function () {
          if (global.EduLearn && typeof global.EduLearn.openGrade === "function") {
            global.EduLearn.openGrade(gNum);
          } else {
            var ls = document.getElementById("learnSection");
            if (ls) ls.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 40);
      };
    });
  }

  // التقاط زر «القائمة» في الهيدر ليفتح القائمة الجديدة النظيفة 100% بدلاً من القائمة القديمة
  document.addEventListener("click", function (ev) {
    var btn = ev.target && ev.target.closest ? ev.target.closest("#btnMenuToggle") : null;
    if (!btn) return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
    if (document.getElementById("eduFreshDrawer")) closeFreshDrawer();
    else openFreshDrawer();
  }, true);

  global.EduFreshDrawer = { open: openFreshDrawer, close: closeFreshDrawer };
})(window);
