/* الشريط العاجل والإعلاني المتحرك الدائم — EduTech Mindset (الإصدار 72)
 * - ثابت ودائم ولا يمكن لأي زائر إغلاقه أو إخفاؤه (تمت إزالة زر الإغلاق نهائياً)
 * - يدعم التحكم الكامل من لوحة الإدارة في اتجاه الحركة (من اليمين لليسار أو من اليسار لليمين)
 * - يدعم التحكم في السرعة، وأنماط وألوان الشريط، والقراءة الصوتية بصوت الطالب الفصيح */
(function () {
  "use strict";

  var CACHE = "edutech_ticker_cache_v72";

  var TYPES = {
    urgent: { label: "عاجل", bg: "#dc2626", fg: "#ffffff" },
    info: { label: "تنويه", bg: "#2563eb", fg: "#ffffff" },
    event: { label: "مناسبة", bg: "#f59e0b", fg: "#1c1917" },
    star: { label: "جديد المنصة", bg: "#10b981", fg: "#ffffff" }
  };

  var THEMES = {
    dark: { name: "كحلي داكن ملكي (الافتراضي)", bg: "linear-gradient(90deg,#070d17 0%,#0f172a 50%,#070d17 100%)", border: "rgba(56,189,248,0.28)" },
    crimson: { name: "أحمر إخباري عاجل", bg: "linear-gradient(90deg,#450a0a 0%,#7f1d1d 50%,#450a0a 100%)", border: "rgba(252,165,165,0.35)" },
    emerald: { name: "أخضر زمردي مشرق", bg: "linear-gradient(90deg,#022c22 0%,#065f46 50%,#022c22 100%)", border: "rgba(110,231,183,0.35)" },
    royal: { name: "بنفسجي إبداعي", bg: "linear-gradient(90deg,#1e1b4b 0%,#3b0764 50%,#1e1b4b 100%)", border: "rgba(216,180,254,0.35)" },
    gold: { name: "ذهبي احتفالي", bg: "linear-gradient(90deg,#451a03 0%,#78350f 50%,#451a03 100%)", border: "rgba(252,211,77,0.4)" }
  };

  var DEFAULT_ITEMS = [
    { id: "t1", type: "urgent", text: "انطلاق الحقيبة التدريبية لتوظيف الذكاء الاصطناعي في التعليم — بإشراف أ. باسل الفقعاوي", link: "#smartHubSection", on: true },
    { id: "t2", type: "star", text: "أصوات الطلبة والشخصيات العربية الفصحى العصبية تعمل الآن في جميع أدوات المنصة", link: "#smartHubSection", on: true },
    { id: "t3", type: "event", text: "منصة EduTech Mindset — مركز التطبيقات والاستوديوهات التعليمية الذكية من غزة", link: "#hero", on: true }
  ];

  // direction: "rtl" = يتحرك من اليمين إلى اليسار | "ltr" = يتحرك من اليسار إلى اليمين
  var data = { enabled: true, speed: "normal", direction: "rtl", theme: "dark", pinLabel: "عاجل", items: [] };
  var bar = null;
  var speaking = false;

  var inp = "w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100";
  var mini = "px-2 py-1.5 rounded-lg bg-slate-200/90 dark:bg-slate-700 text-[11px] font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function cloud() {
    return !!(window.Cloud && window.Cloud.enabled);
  }

  function canEdit() {
    return typeof isSuperAdminUser === "function" && isSuperAdminUser();
  }

  function uid() {
    return "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }

  function active() {
    var t = today();
    var list = (data.items && data.items.length) ? data.items : DEFAULT_ITEMS;
    return list.filter(function (i) {
      return i && i.on !== false && String(i.text || "").trim() && (!i.until || i.until >= t);
    });
  }

  function sig() {
    return JSON.stringify([
      active().map(function (i) { return [i.type, i.text, i.link]; }),
      data.speed || "normal",
      data.direction || "rtl",
      data.theme || "dark",
      data.pinLabel || "عاجل",
      canEdit()
    ]);
  }

  function href(u) {
    u = String(u || "").trim();
    if (!u) return "";
    if (/^(https?:|mailto:|tel:|#|\/)/i.test(u)) return u;
    if (/^[\w.-]+\.[a-z]{2,}/i.test(u)) return "https://" + u;
    return "";
  }

  // ---------- حقن تنسيقات الشريط المتطورة (حركة مستمرة بلا توقف عبر GPU) ----------
  function injectCss() {
    if (document.getElementById("tkCss")) return;
    var s = document.createElement("style");
    s.id = "tkCss";
    s.textContent =
      "#tkBar{position:sticky;top:0;z-index:49;height:36px;color:#f8fafc;display:flex;align-items:center;gap:8px;padding:0 10px;font-size:11.5px;font-weight:800;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.35);user-select:none;transition:top 0.2s ease;transform:translateZ(0);backface-visibility:hidden}" +
      "body.has-ticker header.sticky{top:36px !important}" +
      ".tk-pin{flex:none;display:inline-flex;align-items:center;gap:5px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#0f172a;border-radius:9999px;padding:2px 10px;font-size:10px;font-weight:900;letter-spacing:-0.2px;box-shadow:0 2px 6px rgba(245,158,11,0.35)}" +
      ".tk-pin i{font-size:9.5px;animation:tkPulse 2s infinite ease-in-out !important;animation-play-state:running !important}" +
      "@keyframes tkPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}" +
      "@keyframes tkMarqueeRTL{0%{transform:translate3d(-50%,0,0)}100%{transform:translate3d(0%,0,0)}}" +
      "@keyframes tkMarqueeLTR{0%{transform:translate3d(0%,0,0)}100%{transform:translate3d(-50%,0,0)}}" +
      "#tkWrap{flex:1;overflow:hidden;position:relative;height:100%;display:flex;align-items:center;direction:ltr !important;mask-image:linear-gradient(to right,transparent 0,#000 18px,#000 calc(100% - 18px),transparent 100%);-webkit-mask-image:linear-gradient(to right,transparent 0,#000 18px,#000 calc(100% - 18px),transparent 100%)}" +
      "#tkTrack{display:flex;align-items:center;width:max-content;white-space:nowrap;direction:ltr !important;will-change:transform;backface-visibility:hidden;transform:translate3d(0,0,0);animation-name:var(--tk-anim,tkMarqueeRTL) !important;animation-duration:var(--tk-dur,38s) !important;animation-timing-function:linear !important;animation-iteration-count:infinite !important;animation-play-state:running !important}" +
      "#tkTrack:hover,#tkTrack:active,#tkTrack:focus,#tkWrap:hover #tkTrack,#tkBar:hover #tkTrack,body.low-power #tkTrack{animation-play-state:running !important}" +
      "@media (prefers-reduced-motion:reduce){#tkTrack{animation-name:var(--tk-anim,tkMarqueeRTL) !important;animation-duration:var(--tk-dur,38s) !important;animation-iteration-count:infinite !important;animation-play-state:running !important}}" +
      ".tk-group{display:flex;align-items:center;flex-shrink:0;direction:rtl}" +
      ".tk-item{display:inline-flex;align-items:center;padding:0 16px;color:#f8fafc;text-decoration:none;direction:rtl;unicode-bidi:embed}" +
      "a.tk-item:hover{color:#38bdf8;text-decoration:underline;text-underline-offset:3px}" +
      ".tk-badge{display:inline-flex;align-items:center;padding:1.5px 8px;border-radius:9999px;font-size:9.5px;font-weight:900;margin-left:7px;line-height:1.4;box-shadow:0 1px 4px rgba(0,0,0,0.25)}" +
      ".tk-sep{color:#38bdf8;font-size:10px;margin:0 8px;opacity:0.85}" +
      ".tk-actions{flex:none;display:flex;align-items:center;gap:4px}" +
      ".tk-actions button{width:25px;height:25px;border-radius:8px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);color:#e2e8f0;display:inline-flex;align-items:center;justify-content:center;font-size:11px;cursor:pointer;transition:background-color 0.15s ease}" +
      ".tk-actions button:hover{background:rgba(255,255,255,0.22);color:#fff}" +
      "@media (max-width:480px){#tkBar{padding:0 6px;gap:5px}.tk-item{padding:0 10px;font-size:11px}.tk-pin span{display:none}.tk-pin{padding:3px 7px}}";
    document.head.appendChild(s);
  }

  function renderGroupHtml(list) {
    return list.map(function (i) {
      var t = TYPES[i.type] || TYPES.info;
      var h = href(i.link);
      var inner = '<span class="tk-badge" style="background:' + t.bg + ';color:' + t.fg + '">' + esc(t.label) + '</span>' + esc(i.text);
      var linkPart = h
        ? '<a class="tk-item" href="' + esc(h) + '"' + (/^https?:/i.test(h) ? ' target="_blank" rel="noopener"' : '') + '>' + inner + '</a>'
        : '<span class="tk-item">' + inner + '</span>';
      return linkPart + '<span class="tk-sep">✦</span>';
    }).join("");
  }

  function buildTrackHtml(list) {
    var base = renderGroupHtml(list);
    // تكرار كافٍ لضمان امتلاء الشريط بالكامل على جميع أحجام الشاشات دون أي فراغ
    var repeatCount = 4;
    if (list.length === 1) repeatCount = 8;
    else if (list.length === 2) repeatCount = 6;
    else if (list.length <= 4) repeatCount = 5;

    var group = "";
    for (var r = 0; r < repeatCount; r++) {
      group += base;
    }
    return '<div class="tk-group">' + group + '</div>' +
           '<div class="tk-group" aria-hidden="true">' + group + '</div>';
  }

  var lastSig = "";

  function calcDurationSec(trackEl) {
    var m = data.speed || "normal";
    var speedPps = m === "slow" ? 45 : (m === "fast" ? 95 : (m === "vfast" ? 135 : 68));
    var halfW = (trackEl && trackEl.scrollWidth) ? (trackEl.scrollWidth / 2) : 1800;
    if (halfW < 600) halfW = 1800;
    return Math.max(12, Math.min(120, Math.round(halfW / speedPps)));
  }

  function syncTrackAnimation() {
    if (!bar) return;
    var track = bar.querySelector("#tkTrack");
    if (!track) return;
    var dir = data.direction === "ltr" ? "ltr" : "rtl";
    var animName = dir === "rtl" ? "tkMarqueeRTL" : "tkMarqueeLTR";
    var durSec = calcDurationSec(track);
    track.style.setProperty("--tk-anim", animName);
    track.style.setProperty("--tk-dur", durSec + "s");
    track.style.animationPlayState = "running";
  }

  function render() {
    var list = active();
    // الشريط لا يُغلق من قبل الزوار أبداً؛ فقط إذا أوقفته الإدارة من لوحة التحكم
    if (data.enabled === false || !list.length) {
      if (bar) { bar.remove(); bar = null; }
      document.body.classList.remove("has-ticker");
      lastSig = "";
      return;
    }

    injectCss();
    if (bar && lastSig === sig()) {
      syncTrackAnimation();
      return;
    }
    lastSig = sig();

    if (!bar) {
      bar = document.createElement("div");
      bar.id = "tkBar";
      bar.setAttribute("dir", "rtl");
      bar.setAttribute("role", "region");
      bar.setAttribute("aria-label", "شريط الأخبار والتنويهات العاجلة");
      var anchor = document.querySelector("#appMobileShell > div");
      if (anchor && anchor.parentNode) {
        anchor.parentNode.insertBefore(bar, anchor.nextSibling);
      } else {
        document.body.insertBefore(bar, document.body.firstChild);
      }
    }

    var thm = THEMES[data.theme] || THEMES.dark;
    bar.style.background = thm.bg;
    bar.style.borderBottom = "1px solid " + thm.border;

    var pinTxt = data.pinLabel || "عاجل";
    var adminBtnHtml = canEdit()
      ? '<button type="button" id="tkAdminBtn" title="إعدادات الشريط (للإدارة)"><i class="fa-solid fa-gear text-amber-300"></i></button>'
      : '';

    bar.innerHTML =
      '<div class="tk-pin"><i class="fa-solid fa-bullhorn"></i><span>' + esc(pinTxt) + '</span></div>' +
      '<div id="tkWrap" dir="ltr">' +
        '<div id="tkTrack" dir="ltr">' + buildTrackHtml(list) + '</div>' +
      '</div>' +
      '<div class="tk-actions">' +
        '<button type="button" id="tkSpeak" title="استماع صوتي للإعلانات"><i class="fa-solid fa-volume-high"></i></button><button type="button" id="tkTelegramBtn" title="نشر الإعلانات إلى تليجرام وواتساب"><i class="fa-brands fa-telegram text-sky-300"></i></button>' +
        adminBtnHtml +
      '</div>';

    document.body.classList.add("has-ticker");

    var speakBtn = bar.querySelector("#tkSpeak");
    if (speakBtn) speakBtn.onclick = speak;
    var tgBtn = bar.querySelector("#tkTelegramBtn");
    if (tgBtn) tgBtn.onclick = function () {
      var itemsTxt = active().map(function (i) { return "• " + i.text; }).join("\n");
      if (window.EduTelegram && window.EduTelegram.openModal) window.EduTelegram.openModal("إعلانات وتنويهات منصة EduTech Mindset العاجلة", itemsTxt, location.href);
    };

    var admBtn = bar.querySelector("#tkAdminBtn");
    if (admBtn) {
      admBtn.onclick = function () {
        if (window.EduHome && window.EduHome.openAdmin) window.EduHome.openAdmin("ticker");
      };
    }

    // ضبط السرعة والاتجاه وضمان استمرار الحركة بلا توقف أبداً
    syncTrackAnimation();
    setTimeout(syncTrackAnimation, 150);
    setTimeout(syncTrackAnimation, 800);
  }

  // مراقب ذكي لضمان عدم توقف الشريط عند تبديل التبويبات أو قفل شاشة الهاتف أو تغيير حجم النافذة
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) syncTrackAnimation();
  });
  window.addEventListener("pageshow", syncTrackAnimation);
  window.addEventListener("focus", syncTrackAnimation);
  window.addEventListener("resize", syncTrackAnimation, { passive: true });

  // ---------- القراءة الصوتية بالعربية الفصحى (بصوت الطالب الفصيح) ----------
  function speak() {
    if (speaking) {
      if (window.EduTTS && window.EduTTS.stop) window.EduTTS.stop();
      if (window.EduVoice && window.EduVoice.stop) window.EduVoice.stop();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      speaking = false;
      return;
    }
    var list = active();
    var txt = list.map(function (i) {
      var t = TYPES[i.type] || TYPES.info;
      return t.label + ": " + i.text;
    }).join(" . ");
    if (!txt) return;

    speaking = true;
    if (window.EduTTS && typeof window.EduTTS.speak === "function") {
      try {
        Promise.resolve(window.EduTTS.speak(txt, { role: "assistant" })).finally(function () { speaking = false; });
        return;
      } catch (e) { speaking = false; }
    }
    if (window.EduVoice && window.EduVoice.read) {
      window.EduVoice.read(txt, "ar-SA");
      setTimeout(function () { speaking = false; }, 8000);
      return;
    }
    if ("speechSynthesis" in window) {
      var u = new SpeechSynthesisUtterance(txt);
      u.lang = "ar-SA";
      u.onend = u.onerror = function () { speaking = false; };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    }
  }

  // ---------- حفظ الإعدادات ----------
  function save(d) {
    if (!canEdit()) {
      if (typeof showToast === "function") showToast("التعديل متاح للإدارة فقط 🔒", "warning");
      return Promise.reject();
    }
    data = {
      enabled: d.enabled !== false,
      speed: d.speed || "normal",
      direction: d.direction === "ltr" ? "ltr" : "rtl",
      theme: d.theme || "dark",
      pinLabel: (d.pinLabel || "عاجل").trim() || "عاجل",
      items: (d.items || []).slice(0, 30)
    };
    var out = {
      kind: "ticker",
      enabled: data.enabled,
      speed: data.speed,
      direction: data.direction,
      theme: data.theme,
      pinLabel: data.pinLabel,
      items: data.items
    };
    try { localStorage.setItem(CACHE, JSON.stringify(out)); } catch (e) {}
    render();

    if (cloud()) {
      return window.Cloud.commit([{ col: "site", id: "ticker", data: out }]).catch(function (e) {
        if (typeof showToast === "function") showToast("تعذر الحفظ السحابي [" + ((e && e.code) || "؟") + "]", "warning");
        throw e;
      });
    }
    if (window.appState) {
      appState.ticker = out;
      if (typeof saveState === "function") saveState();
    }
    return Promise.resolve();
  }

  // ---------- لوحة الإدارة المتقدمة للشريط ----------
  function tab(H) {
    var d = JSON.parse(JSON.stringify(data));
    d.items = (d.items && d.items.length) ? d.items : JSON.parse(JSON.stringify(DEFAULT_ITEMS));

    function row(i, n) {
      return '<div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-3 space-y-2 bg-slate-50/70 dark:bg-slate-800/50" data-i="' + n + '">' +
        '<textarea rows="2" data-f="text" class="' + inp + '" placeholder="نص الرسالة أو الإعلان المتحرك">' + esc(i.text) + '</textarea>' +
        '<div class="grid grid-cols-2 gap-2">' +
          '<select data-f="type" class="' + inp + '">' +
            Object.keys(TYPES).map(function (k) {
              return '<option value="' + k + '"' + (i.type === k ? " selected" : "") + '>' + TYPES[k].label + '</option>';
            }).join("") +
          '</select>' +
          '<input type="date" data-f="until" class="' + inp + '" value="' + esc(i.until || "") + '" title="تاريخ الانتهاء (اختياري)">' +
        '</div>' +
        '<input data-f="link" class="' + inp + '" dir="ltr" placeholder="رابط عند النقر (اختياري): https://… أو #smartHubSection" value="' + esc(i.link || "") + '">' +
        '<div class="flex flex-wrap gap-2 items-center pt-1">' +
          '<label class="flex items-center gap-1.5 text-xs font-bold ml-auto cursor-pointer">' +
            '<input type="checkbox" data-f="on"' + (i.on !== false ? " checked" : "") + ' class="rounded text-brand-600"> ظاهرة للمستخدمين' +
          '</label>' +
          '<button type="button" data-a="up" data-i="' + n + '" class="' + mini + '">↑ للأعلى</button>' +
          '<button type="button" data-a="down" data-i="' + n + '" class="' + mini + '">↓ للأسفل</button>' +
          '<button type="button" data-a="del" data-i="' + n + '" class="' + mini + ' text-rose-600 dark:text-rose-400">حذف</button>' +
        '</div>' +
      '</div>';
    }

    function read() {
      var g = document.getElementById("tkEn");
      if (!g) return;
      d.enabled = g.checked;
      d.speed = document.getElementById("tkSp").value;
      d.direction = document.getElementById("tkDir").value;
      d.theme = document.getElementById("tkTheme").value;
      d.pinLabel = document.getElementById("tkPinLbl").value.trim() || "عاجل";
      document.querySelectorAll("#tkList [data-i]").forEach(function (el) {
        var it = d.items[+el.dataset.i];
        if (!it || el.tagName === "BUTTON") return;
        it.text = el.querySelector('[data-f="text"]').value.trim();
        it.type = el.querySelector('[data-f="type"]').value;
        it.until = el.querySelector('[data-f="until"]').value;
        it.link = el.querySelector('[data-f="link"]').value.trim();
        it.on = el.querySelector('[data-f="on"]').checked;
      });
    }

    function draw() {
      H.body.innerHTML =
        '<div class="space-y-3.5">' +
          '<div class="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs leading-relaxed text-amber-900 dark:text-amber-200 font-bold">' +
            '📌 <b>شريط الإعلانات الدائم (بدون زر إغلاق للزوار):</b> يبقى الشريط ظاهراً دائماً أعلى الموقع، ويمكنك من هنا التحكم في اتجاه حركته (من اليمين لليسار أو من اليسار لليمين)، وسرعته، ولونه، وعنوان الشارة.' +
          '</div>' +

          '<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">' +
            '<label class="flex items-center gap-2 text-xs font-black cursor-pointer sm:col-span-2">' +
              '<input id="tkEn" type="checkbox"' + (d.enabled !== false ? " checked" : "") + ' class="w-4 h-4 rounded text-brand-600"> تفعيل إظهار الشريط أعلى الموقع لجميع الزوار' +
            '</label>' +

            '<div>' +
              '<label class="block text-[11px] font-black mb-1">↔️ اتجاه حركة النص المتحرك:</label>' +
              '<select id="tkDir" class="' + inp + '">' +
                '<option value="rtl"' + (d.direction !== "ltr" ? " selected" : "") + '>⬅️ من اليمين إلى اليسار (حركة يمين ← يسار)</option>' +
                '<option value="ltr"' + (d.direction === "ltr" ? " selected" : "") + '>➡️ من اليسار إلى اليمين (حركة يسار ← يمين)</option>' +
              '</select>' +
            '</div>' +

            '<div>' +
              '<label class="block text-[11px] font-black mb-1">⚡ سرعة حركة الشريط:</label>' +
              '<select id="tkSp" class="' + inp + '">' +
                '<option value="slow"' + (d.speed === "slow" ? " selected" : "") + '>سرعة هادئة (بطيئة)</option>' +
                '<option value="normal"' + (d.speed === "normal" || !d.speed ? " selected" : "") + '>سرعة متوازنة (الافتراضية)</option>' +
                '<option value="fast"' + (d.speed === "fast" ? " selected" : "") + '>سرعة سريعة</option>' +
                '<option value="vfast"' + (d.speed === "vfast" ? " selected" : "") + '>سرعة فائقة</option>' +
              '</select>' +
            '</div>' +

            '<div>' +
              '<label class="block text-[11px] font-black mb-1">🎨 لون ومظهر الشريط:</label>' +
              '<select id="tkTheme" class="' + inp + '">' +
                Object.keys(THEMES).map(function (k) {
                  return '<option value="' + k + '"' + ((d.theme || "dark") === k ? " selected" : "") + '>' + THEMES[k].name + '</option>';
                }).join("") +
              '</select>' +
            '</div>' +

            '<div>' +
              '<label class="block text-[11px] font-black mb-1">🏷️ عنوان الشارة الثابتة:</label>' +
              '<input id="tkPinLbl" class="' + inp + '" placeholder="مثال: عاجل، إعلان هام، جديدنا" value="' + esc(d.pinLabel || "عاجل") + '">' +
            '</div>' +
          '</div>' +

          '<div class="flex flex-wrap gap-2 items-center">' +
            '<span class="text-xs font-black ml-1">إضافة رسالة جديدة:</span>' +
            Object.keys(TYPES).map(function (k) {
              return '<button type="button" data-add="' + k + '" class="px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-sm transition-transform active:scale-95" style="background:' + TYPES[k].bg + ';color:' + TYPES[k].fg + '">+ ' + TYPES[k].label + '</button>';
            }).join("") +
          '</div>' +

          '<div id="tkList" class="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1">' +
            (d.items.length ? d.items.map(row).join("") : '<div class="text-center text-xs text-slate-500 py-6">لا توجد رسائل بعد — اضغط بالأعلى لإضافة رسالة جديدة.</div>') +
          '</div>' +
        '</div>';

      H.body.querySelectorAll("[data-add]").forEach(function (b) {
        b.onclick = function () {
          read();
          d.items.unshift({ id: uid(), type: b.dataset.add, text: "", link: "", until: "", on: true });
          draw();
        };
      });

      H.body.querySelectorAll("button[data-a]").forEach(function (b) {
        b.onclick = function () {
          read();
          var i = +b.dataset.i, a = b.dataset.a;
          if (a === "del") {
            d.items.splice(i, 1);
          } else {
            var j = a === "up" ? i - 1 : i + 1;
            if (j >= 0 && j < d.items.length) {
              var t = d.items[i];
              d.items[i] = d.items[j];
              d.items[j] = t;
            }
          }
          draw();
        };
      });
    }

    draw();
    H.foot('<button type="button" id="tkSave" class="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black shadow-md transition-all">حفظ ونشر الشريط للجميع فوراً ✓</button>');

    document.getElementById("tkSave").addEventListener("click", function () {
      read();
      d.items = d.items.filter(function (i) { return i.text; });
      save(d).then(function () {
        if (typeof closeModal === "function") closeModal();
        if (typeof showToast === "function") showToast("تم حفظ ونشر إعدادات الشريط المتحرك بنجاح ✓", "success");
      });
    });
  }

  window.EduTicker = {
    render: render,
    save: save,
    tab: tab,
    _data: function () { return data; }
  };

  function apply(d) {
    if (d) {
      data = {
        enabled: d.enabled !== false,
        speed: d.speed || "normal",
        direction: d.direction === "ltr" ? "ltr" : "rtl",
        theme: d.theme || "dark",
        pinLabel: d.pinLabel || "عاجل",
        items: (d.items && d.items.length) ? d.items : DEFAULT_ITEMS
      };
    }
    render();
  }

  function boot() {
    var cached = null;
    try {
      cached = JSON.parse(localStorage.getItem(CACHE) || localStorage.getItem("edutech_ticker_cache_v1") || "null");
    } catch (e) {}

    if (cached) apply(cached);
    else apply({ enabled: true, speed: "normal", direction: "rtl", theme: "dark", pinLabel: "عاجل", items: DEFAULT_ITEMS });

    if (window.EduHome && window.EduHome.registerTab) {
      window.EduHome.registerTab("ticker", "الشريط العاجل", "fa-bullhorn", tab);
    }

    if (!cloud() || !window.Cloud.subscribeDoc) {
      if (!cached && window.appState && appState.ticker) apply(appState.ticker);
      return;
    }

    window.Cloud.subscribeDoc("site", "ticker", function (d) {
      if (d) {
        try { localStorage.setItem(CACHE, JSON.stringify(d)); } catch (e) {}
      }
      apply(d);
    }, function () {});
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", function () { setTimeout(boot, 60); });
  } else {
    setTimeout(boot, 60);
  }
})();
