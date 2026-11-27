/*
 * الواجهة الرئيسية ومركز تطوير وإدارة الموقع الموحّد في أسفل الموقع (الإصدار 75):
 *  1) القائمة العلوية (مع قوائم فرعية) + قائمة الجوال
 *  2) شريط الإعلانات (نص + عدة صور تتبدل تلقائياً)
 *  3) فيديوهات الأعلى (تعمل صامتة بمجرد المرور عليها، وبالنقر تُفتح مع الصوت)
 *  4) مركز تطوير وإدارة الموقع الموحّد في أسفل الموقع (#adminDevFooterHub): يجمع كافة إعدادات وأدوات
 *     تطوير الموقع في مكان واحد أسفل الموقع مع شريط تعديل فوري مباشر وإدارة الأدوات الـ 41 ولا يظهر سوى للإدارة العليا فقط.
 */
(function () {
  "use strict";

  var inp = "w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100";
  var mini = "px-2 py-1.5 rounded-lg bg-slate-200/90 dark:bg-slate-700 text-[11px] hover:bg-slate-300 dark:hover:bg-slate-600";
  var GRADS = ["from-sky-600 to-indigo-700", "from-emerald-600 to-teal-700", "from-amber-500 to-orange-700", "from-purple-600 to-fuchsia-700", "from-rose-600 to-pink-700"];
  var ICONS = [["fa-house", "الرئيسية"], ["fa-school", "المراحل"], ["fa-book-bookmark", "المكتبة"], ["fa-book", "كتب"], ["fa-wand-magic-sparkles", "ذكاء اصطناعي"], ["fa-share-nodes", "حسابات"], ["fa-circle-info", "معلومات"], ["fa-user-graduate", "طالب"], ["fa-chalkboard-user", "معلم"], ["fa-video", "فيديو"], ["fa-music", "صوت"], ["fa-bullhorn", "إعلان"], ["fa-star", "نجمة"], ["fa-flask", "علوم"], ["fa-calculator", "رياضيات"], ["fa-envelope", "تواصل"], ["fa-link", "رابط"]];
  var SECTIONS = [["#hero", "الرئيسية"], ["#learnSection", "المراحل الدراسية"], ["#tawjihiStudio", "بوابة التوجيهي وحاسبة المعدل"], ["#earlyLearnStudio", "التأسيس المبكر والصفوف 1-4"], ["#offPackStudio", "حقيبة المذاكرة بلا إنترنت"], ["#booksSection", "الكتب والمناهج"], ["#arSection", "الواقع المعزز"], ["#library", "المكتبة التعليمية"], ["#generator", "مولّد البرومبتات"], ["#slidesStudio", "مولّد العروض"], ["#whiteboardStudio", "السبورة التفاعلية الذكية"], ["#langLabStudio", "معمل اللغات والنطق"], ["#parentsStudio", "تقارير أولياء الأمور"], ["#worksheetStudio", "أوراق العمل"], ["#homeworkStudio", "مصحح الواجبات المصوّرة"], ["#storiesStudio", "القصص التعليمية المصوّرة"], ["#analyticsStudio", "مرصد إحصاءات المنهاج"], ["#gamesStudio", "الألعاب التفاعلية"], ["#tutorStudio", "المعلم الذكي والخرائط"], ["#classroomsStudio", "الفصول الافتراضية"], ["#lessonPlanStudio", "خطط الدروس"], ["#designStudio", "مولّد الإنفوغرافيك والبوسترات"], ["#certStudio", "مولّد الشهادات الجماعية"], ["#simLabStudio", "مختبر التجارب العلمية التفاعلي"], ["#atlasStudio", "أطلس فلسطين التفاعلي"], ["#radioStudio", "الإذاعة المدرسية والمسابقات"], ["#mediaToolsStudio", "ضغط الصور ودمج PDF"], ["#codingLabStudio", "أكاديمية البرمجة والروبوتكس"], ["#rubricsStudio", "أوراق التظليل وسلالم التقدير"], ["#classToolsStudio", "حقيبة إدارة الصف والجدول"], ["#teacherDash", "لوحة المعلم"], ["#portfolioStudio", "ملف إنجاز المعلم والخطط"], ["#inclusiveStudio", "الدعم النفسي والقارئ الميسّر"], ["#sciCalcStudio", "الحاسبة العلمية والقوانين"], ["#userWorkspaceSection", "مساحتي الشخصية"], ["#edtechLabSection", "مختبر التكنولوجيا"], ["#social", "حساباتنا"], ["#about", "من نحن"]];

  var home = { nav: null, topVideos: [], adInterval: 5, site: {}, sections: [] };
  var cloudSlides = [];
  var tab = "identity";

  function esc(s) { return escapeHtml(s); }
  function cloud() { return !!(window.Cloud && window.Cloud.enabled); }
  function canEdit() { return typeof isSuperAdminUser === "function" && isSuperAdminUser(); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function uid(p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
  function slides() { var l = cloud() ? cloudSlides : (appState.slides || []); return l.slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); }); }
  function LV() { return window.EduLearn || { parseVideo: function () { return { kind: "none" }; }, thumbOf: function () { return ""; } }; }
  function bad(e) {
    var code = (e && e.code) || "";
    var msg = "تعذر الحفظ في السحابة";
    if (code === "permission-denied") {
      msg = "صلاحية السحابة مرفوضة — سجّل الدخول بحساب Google المعتمد للإدارة (رمز PIN يفتح الواجهة فقط)";
    } else if (code === "invalid-argument" || code === "resource-exhausted" || /exceeds the maximum|too large/i.test(String(e && e.message || ""))) {
      msg = "حجم البيانات أو الصور تجاوز حد السحابة (1MB) — قلّل عدد الصور أو استخدم روابط صور";
    } else if (code === "unavailable" || code === "deadline-exceeded") {
      msg = "تعذر الاتصال بالسحابة حالياً — تحقق من الإنترنت وحاول مجدداً";
    } else if (code) {
      msg = "تعذر الحفظ في السحابة [" + code + "] — تأكد من تسجيل دخول حساب Google الإداري";
    }
    showToast(msg, "error");
  }

  // ---------- الحفظ ----------
  function saveHome(h) {
    if (!canEdit()) { showToast("التعديل للإدارة فقط 🔒", "warning"); return Promise.reject(); }
    home = h;
    try { localStorage.setItem("edu_home_cache_v69", JSON.stringify(home)); } catch (e) {}
    if (cloud()) return window.Cloud.commit([{ col: "site", id: "home", data: { kind: "home", nav: h.nav || [], hasNav: !!h.nav, topVideos: h.topVideos || [], adInterval: h.adInterval || 5, site: h.site || {}, sections: h.sections || [] } }]).then(renderAll, function (e) { bad(e); throw e; });
    appState.home = clone(h); saveState(); renderAll(); return Promise.resolve();
  }
  function applyOpsToSlideList(list, ops) {
    var cur = (list || []).slice();
    ops.forEach(function (o) {
      var i = cur.findIndex(function (x) { return x.id === o.id; });
      if (o.remove) { if (i > -1) cur.splice(i, 1); }
      else { var d = Object.assign({ id: o.id, kind: "slide" }, o.data); if (i > -1) cur[i] = d; else cur.push(d); }
    });
    return cur.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  }
  function saveSlides(ops) {
    if (!canEdit()) return Promise.reject();
    if (cloud()) {
      var nextList = applyOpsToSlideList(cloudSlides, ops);
      var p1 = window.Cloud.savePublicSlides ? window.Cloud.savePublicSlides(nextList) : Promise.resolve();
      var p2 = window.Cloud.commit(ops.map(function (o) { return o.remove ? { col: "site", id: o.id, remove: true } : { col: "site", id: o.id, data: Object.assign({ kind: "slide" }, o.data) }; }));
      return Promise.all([p1, p2]).then(function () {
        cloudSlides = nextList;
        renderAds();
      }, function (e) { bad(e); throw e; });
    }
    appState.slides = applyOpsToSlideList(appState.slides, ops); saveState(); renderAll(); return Promise.resolve();
  }

  // ---------- 1) القائمة العلوية الشاملة وقائمة الجوال التفاعلية (الإصدار 139) ----------
  var CORE_NAV_ITEMS = [
    { id: "core-hero", label: "الرئيسية ومقدمة المنصة", target: "v254:home", ico: "🏠", badge: "البداية" },
    { id: "core-curriculum", label: "المراحل الدراسية والمنهاج الفلسطيني", target: "v254:learn", ico: "🏫", badge: "صفوف 1–12" },
    { id: "core-tools", label: "مركز الأدوات والمختبرات الذكية", target: "v254:tools", ico: "🛠️", badge: "20 أداة" },
    { id: "core-voice", label: "استوديو الصوت الذكي (MP3 + بودكاست)", target: "v254:voice", ico: "🎙️", badge: "4 أدوات" },
    { id: "core-courses", label: "الدورات التدريبية والتسجيل", target: "v254:courses", ico: "🎓", badge: "دورات" },
    { id: "core-tawjihi", label: "بوابة التوجيهي وحاسبة المعدل", target: "v254:tawjihi", ico: "👑", badge: "أوفلاين" },
    { id: "core-cv", label: "صانع السيرة الذاتية الاحترافية (CV)", target: "v254:cv", ico: "📑", badge: "عربي/EN" },
    { id: "core-account", label: "حسابي الشخصي وتسجيل الدخول", target: "v254:account", ico: "👤", badge: "حسابي" }
  ];

  var QUICK_STUDIOS_MENU = [
    { target: "studentAiTutor", ico: "🧠", label: "المعلم الخصوصي الذكي" },
    { target: "v254:voice", ico: "🎙️", label: "استوديو الصوت (MP3 وبودكاست)" },
    { target: "v256:teacherkit", ico: "👩‍🏫", label: "حقيبة المعلم الاحترافية (5 أدوات)" },
    { target: "worksheetStudio", ico: "📝", label: "مولّد أوراق العمل والاختبارات" },
    { target: "whiteboardStudio", ico: "🎨", label: "السبورة التفاعلية الذكية" },
    { target: "lessonPlanStudio", ico: "📋", label: "محضّر خطط الدروس" },
    { target: "v254:tawjihi", ico: "👑", label: "بوابة التوجيهي الأوفلاين" },
    { target: "cvBuilderStudio", ico: "📑", label: "صانع السيرة الذاتية CV" }
  ];

  var QUICK_GRADES_MENU = [
    { stg: "stage-primary", gid: "g1", lbl: "الصف 1" },
    { stg: "stage-primary", gid: "g2", lbl: "الصف 2" },
    { stg: "stage-primary", gid: "g3", lbl: "الصف 3" },
    { stg: "stage-primary", gid: "g4", lbl: "الصف 4" },
    { stg: "stage-middle", gid: "g5", lbl: "الصف 5" },
    { stg: "stage-middle", gid: "g6", lbl: "الصف 6" },
    { stg: "stage-middle", gid: "g7", lbl: "الصف 7" },
    { stg: "stage-middle", gid: "g8", lbl: "الصف 8" },
    { stg: "stage-middle", gid: "g9", lbl: "الصف 9" },
    { stg: "stage-secondary", gid: "g10", lbl: "الصف 10" },
    { stg: "stage-secondary", gid: "g11", lbl: "الصف 11" },
    { stg: "stage-secondary", gid: "g12", lbl: "توجيهي 12" }
  ];

  function defaultNav() {
    return CORE_NAV_ITEMS.map(function (c) {
      return { id: c.id, label: c.label, url: "#" + c.target, icon: "fa-compass", children: [] };
    });
  }
  var ORIGINAL_NAV = null;
  function navItems() {
    if (ORIGINAL_NAV === null) ORIGINAL_NAV = defaultNav();
    return home.nav && home.nav.length ? home.nav : ORIGINAL_NAV;
  }
  function linkAttrs(u) { u = String(u || "#"); var ext = /^https?:\/\//i.test(u); return 'href="' + esc(u) + '"' + (ext ? ' target="_blank" rel="noopener"' : ""); }

  function dispatchNavTarget(targetOrUrl) {
    var raw = String(targetOrUrl || "").trim();
    if (!raw || raw === "#") return;
    closeMobileMenu();
    if (/^https?:\/\//i.test(raw)) { window.open(raw, "_blank", "noopener"); return; }
    var t = raw.replace(/^#/, "");
    if (t === "v254:home" || t === "hero") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    if (t === "v254:learn" || t === "curriculum" || t === "learnSection") { var l = document.getElementById("learnSection"); if (l) l.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    if (t === "v254:tools" || t === "tools" || t === "unifiedToolsHub") { var th = document.getElementById("unifiedToolsHub"); if (th) th.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    if (t === "v254:voice") { if (window.EduVoiceStudio) window.EduVoiceStudio.open("mp3"); return; }
    if (t === "v256:teacherkit") { if (window.EduTeacherKit) window.EduTeacherKit.open("timer"); return; }
    if (t === "v254:courses" || t === "coursesSection") {
      function showC() {
        var cs = document.getElementById("coursesSection");
        if (cs) { cs.classList.remove("hidden"); cs.style.display = "block"; cs.scrollIntoView({ behavior: "smooth", block: "start" }); return true; }
        return false;
      }
      if (!showC() && window.EduModules && window.EduModules.loadScript) {
        window.EduModules.loadScript("js/edutech-pro-pack.js").then(function () { setTimeout(showC, 300); });
      }
      return;
    }
    if (t === "v254:tawjihi") { if (window.EduGamify && window.EduGamify.openTawjihiPro) window.EduGamify.openTawjihiPro(); return; }
    if (t === "v254:cv" || t === "university") { if (window.EduToolsHub && window.EduToolsHub.launchById) window.EduToolsHub.launchById("cvBuilderStudio"); return; }
    if (t === "v254:account" || t === "account") {
      var uB = document.getElementById("btnUserHeaderProfile"), gB = document.getElementById("btnGoogleLoginHeader");
      if (uB && !uB.classList.contains("hidden")) uB.click(); else if (gB) gB.click();
      return;
    }
    if (t === "admin") { var ah = document.getElementById("adminDevFooterHub"); if (ah) { ah.style.display = ""; ah.scrollIntoView({ behavior: "smooth", block: "start" }); } return; }
    if (window.EduToolsHub && typeof window.EduToolsHub.launchById === "function") {
      window.EduToolsHub.launchById(t);
      return;
    }
    var el = document.getElementById(t);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function closeMobileMenu() {
    var old = document.getElementById("homeMobileMenu");
    if (old) old.remove();
    var bd = document.getElementById("homeMobileMenuBackdrop");
    if (bd) bd.remove();
    var btn = document.getElementById("btnMenuToggle");
    if (btn) btn.setAttribute("aria-expanded", "false");
    var ic = document.getElementById("btnMenuToggleIcon");
    if (ic) ic.className = "fa-solid fa-bars text-xs";
  }

  function renderNav() {
    if (ORIGINAL_NAV === null) ORIGINAL_NAV = defaultNav();
    var b = document.getElementById("btnMenuToggle");
    if (!b) {
      var util = document.getElementById("btnThemeToggle");
      if (util && util.parentNode) {
        b = document.createElement("button");
        b.id = "btnMenuToggle";
        b.type = "button";
        b.setAttribute("aria-label", "فتح القائمة الشاملة");
        b.className = "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-[11px] font-black shadow-xs transition-all";
        b.innerHTML = '<i id="btnMenuToggleIcon" class="fa-solid fa-bars text-xs"></i><span>القائمة</span>';
        util.parentNode.insertBefore(b, util.parentNode.firstChild);
      }
    }
    if (b && !b.dataset.boundMenu139) {
      b.dataset.boundMenu139 = "1";
      b.addEventListener("click", function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        toggleMobileMenu();
      });
    }
  }

  function toggleMobileMenu() {
    var existing = document.getElementById("homeMobileMenu");
    if (existing) {
      closeMobileMenu();
      return;
    }
    var hdr = document.getElementById("siteTopHeader") || document.querySelector("header");
    var topPx = hdr ? Math.max(52, Math.round(hdr.getBoundingClientRect().bottom)) : 60;

    var bd = document.createElement("div");
    bd.id = "homeMobileMenuBackdrop";
    bd.className = "fixed inset-0 z-[80] bg-slate-950/60 backdrop-blur-xs";
    bd.addEventListener("click", closeMobileMenu);
    document.body.appendChild(bd);

    var m = document.createElement("div");
    m.id = "homeMobileMenu";
    m.dir = "rtl";
    m.className = "fixed inset-x-0 z-[85] mx-auto max-w-4xl bg-white dark:bg-slate-900 border-b-2 border-brand-500/50 shadow-2xl rounded-b-3xl max-h-[82vh] overflow-y-auto p-4 sm:p-5 space-y-4 text-right";
    m.style.top = topPx + "px";

    var isAdmin = canEdit();
    var customNav = (home.nav && Array.isArray(home.nav) && home.nav.length) ? home.nav : [];

    m.innerHTML =
      '<div class="flex items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">' +
        '<div class="flex items-center gap-2">' +
          '<span class="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center text-sm font-black">🧭</span>' +
          '<div>' +
            '<div class="text-xs sm:text-sm font-black text-slate-900 dark:text-white">القائمة الشاملة وفهرس التنقل السريع</div>' +
            '<div class="text-[10px] text-slate-500 dark:text-slate-400">اضغط على أي قسم أو صف أو أداة للانتقال إليها فوراً</div>' +
          '</div>' +
        '</div>' +
        '<button type="button" id="btnCloseTopMenuDrawer" class="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-600 dark:text-rose-300 hover:text-white text-xs font-black transition">✕ إغلاق</button>' +
      '</div>' +

      // 1. البوابات الرئيسية للمنصة
      '<div class="space-y-2">' +
        '<div class="text-[11px] font-black text-brand-600 dark:text-sky-400">1️⃣ البوابات والأقسام الرئيسية:</div>' +
        '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">' +
          CORE_NAV_ITEMS.map(function (it) {
            return '<button type="button" data-menu-target="' + esc(it.target) + '" class="w-full text-right p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/90 hover:bg-brand-600 hover:text-white border border-slate-200 dark:border-slate-700 hover:border-brand-500 transition flex items-center justify-between gap-2 group">' +
              '<div class="flex items-center gap-2.5 min-w-0">' +
                '<span class="text-lg shrink-0">' + it.ico + '</span>' +
                '<span class="text-xs font-black truncate">' + esc(it.label) + '</span>' +
              '</div>' +
              '<span class="px-2 py-0.5 rounded-full bg-brand-500/15 group-hover:bg-white/20 text-brand-700 dark:text-sky-300 group-hover:text-white text-[10px] font-black shrink-0">' + esc(it.badge) + '</span>' +
            '</button>';
          }).join("") +
          (isAdmin
            ? '<button type="button" data-menu-target="admin" class="w-full text-right p-3 rounded-2xl bg-rose-600 text-white border border-rose-400 shadow transition flex items-center justify-between gap-2"><div class="flex items-center gap-2.5"><span class="text-lg">👑</span><span class="text-xs font-black">لوحة القيادة والصلاحيات</span></div><span class="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black">مفعّلة</span></button>'
            : '<button type="button" id="btnMenuAdminPinTrigger" class="w-full text-right p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 hover:bg-rose-600 hover:text-white border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition flex items-center justify-between gap-2"><div class="flex items-center gap-2.5"><span class="text-lg">🔐</span><span class="text-xs font-black">بوابة الإدارة العليا (برمز PIN)</span></div><span class="text-[10px] font-bold opacity-75">للإدارة</span></button>'
          ) +
        '</div>' +
      '</div>' +

      // 2. وصول سريع للصفوف الدراسية (1 - 12)
      '<div class="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">' +
        '<div class="text-[11px] font-black text-emerald-600 dark:text-emerald-400">2️⃣ انتقال فوري لكتب ومنهاج الصف الدراسي (1 – 12):</div>' +
        '<div class="grid grid-cols-3 sm:grid-cols-6 gap-1.5">' +
          QUICK_GRADES_MENU.map(function (g) {
            return '<button type="button" data-menu-grade="' + g.stg + '|' + g.gid + '" class="px-2.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-600 text-emerald-800 dark:text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-black text-center transition">' +
              '🏫 ' + esc(g.lbl) +
            '</button>';
          }).join("") +
        '</div>' +
      '</div>' +

      // 3. أشهر الأدوات والاستوديوهات التفاعلية
      '<div class="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">' +
        '<div class="flex items-center justify-between">' +
          '<span class="text-[11px] font-black text-amber-600 dark:text-amber-400">3️⃣ وصول مباشر لأبرز الأدوات والمختبرات التفاعلية:</span>' +
          '<button type="button" id="btnMenuOpenAllLauncher" class="text-[11px] font-black text-brand-600 dark:text-sky-400 hover:underline">🚀 عرض كل الـ 26 أداة ⬅</button>' +
        '</div>' +
        '<div class="grid grid-cols-2 sm:grid-cols-4 gap-2">' +
          QUICK_STUDIOS_MENU.map(function (stItem) {
            return '<button type="button" data-menu-target="' + esc(stItem.target) + '" class="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 border border-slate-200 dark:border-slate-700 text-right text-[11px] font-black transition flex items-center gap-2">' +
              '<span class="text-base shrink-0">' + stItem.ico + '</span>' +
              '<span class="truncate">' + esc(stItem.label) + '</span>' +
            '</button>';
          }).join("") +
        '</div>' +
      '</div>' +

      // 4. قوائم إضافية مخصصة من الإدارة (إن وجدت)
      (customNav.length ? (
        '<div class="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">' +
          '<div class="text-[11px] font-black text-purple-600 dark:text-purple-400">4️⃣ روابط وقوائم إضافية:</div>' +
          '<div class="space-y-1.5">' +
            customNav.map(function (it, i) {
              var ic = it.icon ? '<i class="fa-solid ' + esc(it.icon) + ' text-brand-500 w-5"></i>' : '<span>🔗</span>';
              var kids = (it.children || []).length;
              return '<div class="rounded-xl border border-slate-200 dark:border-slate-700 p-2">' +
                '<div class="flex items-center justify-between gap-2">' +
                  '<button type="button" data-menu-customurl="' + esc(it.url || "#") + '" data-menu-subidx="' + (kids ? i : "") + '" class="flex-1 text-right px-2 py-1 text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">' + ic + '<span>' + esc(it.label) + '</span></button>' +
                  (kids ? '<button type="button" data-sub="' + i + '" class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black"><i class="fa-solid fa-chevron-down"></i></button>' : '') +
                '</div>' +
                (kids ? '<div id="msub' + i + '" class="hidden mt-2 mr-4 pr-2 border-r-2 border-brand-400 space-y-1">' +
                  it.children.map(function (c) {
                    return '<button type="button" data-menu-customurl="' + esc(c.url || "#") + '" class="block w-full text-right px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-slate-800">' + esc(c.label) + '</button>';
                  }).join("") +
                '</div>' : '') +
              '</div>';
            }).join("") +
          '</div>' +
        '</div>'
      ) : '');

    document.body.appendChild(m);
    var btn = document.getElementById("btnMenuToggle");
    if (btn) btn.setAttribute("aria-expanded", "true");
    var ic = document.getElementById("btnMenuToggleIcon");
    if (ic) ic.className = "fa-solid fa-xmark text-xs";

    var closeBtn = document.getElementById("btnCloseTopMenuDrawer");
    if (closeBtn) closeBtn.addEventListener("click", closeMobileMenu);

    var allLnBtn = document.getElementById("btnMenuOpenAllLauncher");
    if (allLnBtn) {
      allLnBtn.addEventListener("click", function () {
        closeMobileMenu();
        if (window.EduLauncher && typeof window.EduLauncher.open === "function") {
          window.EduLauncher.open();
        } else {
          dispatchNavTarget("tools");
        }
      });
    }

    var admPinBtn = document.getElementById("btnMenuAdminPinTrigger");
    if (admPinBtn) {
      admPinBtn.addEventListener("click", function () {
        closeMobileMenu();
        if (typeof window.triggerSecretAdminAccess === "function") {
          window.triggerSecretAdminAccess();
        } else {
          dispatchNavTarget("admin");
        }
      });
    }

    m.addEventListener("click", function (e) {
      var s = e.target.closest("[data-sub]");
      if (s) {
        var t = document.getElementById("msub" + s.dataset.sub);
        if (t) t.classList.toggle("hidden");
        return;
      }
      var mt = e.target.closest("[data-menu-target]");
      if (mt) {
        dispatchNavTarget(mt.getAttribute("data-menu-target"));
        return;
      }
      var mg = e.target.closest("[data-menu-grade]");
      if (mg) {
        var gVal = mg.getAttribute("data-menu-grade");
        closeMobileMenu();
        if (window.EduMasterHierarchy && typeof window.EduMasterHierarchy.navigateToTarget === "function") {
          window.EduMasterHierarchy.navigateToTarget("grade:" + gVal);
        }
        return;
      }
      var cu = e.target.closest("[data-menu-customurl]");
      if (cu) {
        var subIdx = cu.getAttribute("data-menu-subidx");
        var uVal = cu.getAttribute("data-menu-customurl") || "#";
        if (subIdx !== "" && subIdx !== null && (uVal === "#" || !uVal)) {
          var subBox = document.getElementById("msub" + subIdx);
          if (subBox) subBox.classList.toggle("hidden");
          return;
        }
        dispatchNavTarget(uVal);
      }
    });
  }

  // ---------- 2) شريط الإعلانات ----------
  var adTimer = null, adIdx = 0, adSig = "";
  function flatSlides() {
    var out = [];
    slides().filter(function (a) { return a.active !== false; }).forEach(function (a, ai) {
      var imgs = (a.images || []).filter(Boolean);
      if (!imgs.length) out.push({ a: a, img: "", g: GRADS[ai % GRADS.length] });
      else imgs.forEach(function (im) { out.push({ a: a, img: im, g: GRADS[ai % GRADS.length] }); });
    });
    return out;
  }
  function ensureAds() {
    var box = document.getElementById("homeAds");
    if (box) return box;
    var anchor = document.getElementById("announcementBanner") || document.querySelector("header");
    if (!anchor) return null;
    box = document.createElement("section"); box.id = "homeAds"; box.className = "w-full max-w-7xl mx-auto px-3 sm:px-4 mt-4 hidden";
    anchor.parentNode.insertBefore(box, anchor.nextSibling);
    return box;
  }
  function renderAds() {
    var box = ensureAds(); if (!box) return;
    var list = flatSlides(), ed = canEdit();
    if (!list.length) {
      clearInterval(adTimer); adSig = "";
      box.className = "hidden"; box.innerHTML = "";
      return;
    }
    var sig = JSON.stringify([list.map(function (x) { return [x.a.id, x.img.length, x.a.title, x.a.text, x.a.btn, x.a.link]; }), home.adInterval, ed]);
    if (sig === adSig) return;
    adSig = sig; if (adIdx >= list.length) adIdx = 0;
    box.className = "w-full max-w-7xl mx-auto px-3 sm:px-4 mt-4";
    box.innerHTML = '<div class="relative rounded-3xl overflow-hidden shadow-xl h-[190px] sm:h-[300px] lg:h-[340px] bg-slate-900 select-none" id="adStage">' +
      list.map(function (x, i) {
        var a = x.a, bg = x.img ? '<img src="' + esc(x.img) + '" alt="" class="absolute inset-0 w-full h-full object-cover" ' + (i ? 'loading="lazy"' : "") + '>' + ((x.a.title || x.a.text) ? '<div class="absolute inset-0 bg-gradient-to-l from-slate-950/60 via-slate-950/20 to-transparent"></div>' : "") : '<div class="absolute inset-0 bg-gradient-to-br ' + x.g + '"></div>';
        var ext = /^https?:\/\//i.test(a.link || "");
        return '<div class="ad-slide absolute inset-0 transition-opacity duration-700 ' + (i === adIdx ? "opacity-100" : "opacity-0 pointer-events-none") + '" data-i="' + i + '">' + bg +
          '<div class="relative h-full flex flex-col justify-center gap-2 sm:gap-3 px-6 sm:px-12 max-w-2xl text-white text-right">' +
          (a.title ? '<h2 class="text-xl sm:text-3xl lg:text-4xl font-black leading-tight drop-shadow">' + esc(a.title) + '</h2>' : "") +
          (a.text ? '<p class="text-xs sm:text-base leading-relaxed opacity-95 whitespace-pre-line line-clamp-4 drop-shadow">' + esc(a.text) + '</p>' : "") +
          (a.link ? '<a href="' + esc(a.link) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ' class="self-start mt-1 px-5 py-2 rounded-xl bg-white text-slate-900 text-xs sm:text-sm font-extrabold hover:bg-amber-300 transition-all">' + esc(a.btn || "اعرف المزيد") + '</a>' : "") + '</div></div>';
      }).join("") +
      (list.length > 1 ? '<button type="button" data-ad="prev" aria-label="السابق" class="absolute top-1/2 -translate-y-1/2 right-2 w-9 h-9 rounded-full bg-black/35 hover:bg-black/60 text-white"><i class="fa-solid fa-chevron-right text-xs"></i></button>' +
        '<button type="button" data-ad="next" aria-label="التالي" class="absolute top-1/2 -translate-y-1/2 left-2 w-9 h-9 rounded-full bg-black/35 hover:bg-black/60 text-white"><i class="fa-solid fa-chevron-left text-xs"></i></button>' +
        '<div class="absolute bottom-3 inset-x-0 flex justify-center gap-1.5" id="adDots">' + list.map(function (x, i) { return '<button type="button" data-ad="' + i + '" aria-label="شريحة ' + (i + 1) + '" class="h-1.5 rounded-full transition-all ' + (i === adIdx ? "w-6 bg-white" : "w-1.5 bg-white/50") + '"></button>'; }).join("") + '</div>' : "") +
      '</div>';
    var stage = box.querySelector("#adStage"), paused = false, startX = null;
    function show(n) {
      var sl = stage.querySelectorAll(".ad-slide"); adIdx = (n + sl.length) % sl.length;
      sl.forEach(function (el, i) { el.classList.toggle("opacity-100", i === adIdx); el.classList.toggle("opacity-0", i !== adIdx); el.classList.toggle("pointer-events-none", i !== adIdx); });
      stage.querySelectorAll("#adDots button").forEach(function (d, i) { d.className = "h-1.5 rounded-full transition-all " + (i === adIdx ? "w-6 bg-white" : "w-1.5 bg-white/50"); });
    }
    stage.addEventListener("click", function (e) {
      var b = e.target.closest("[data-ad]");
      if (b) { var v = b.dataset.ad; show(v === "next" ? adIdx - 1 : v === "prev" ? adIdx + 1 : +v); return; }
      var cur = list[adIdx] && list[adIdx].a ? list[adIdx].a : {};
      var lnk = String(cur.link || "").trim();
      var isEnrollLink = /^#(enroll|course):?/i.test(lnk);
      if (!isEnrollLink) return;
      e.preventDefault();
      if (window.EduCoursesPro && typeof window.EduCoursesPro.openEnrollByAd === "function") {
        window.EduCoursesPro.openEnrollByAd(cur.title || "", lnk);
      }
    });
    stage.addEventListener("mouseenter", function () { paused = true; }); stage.addEventListener("mouseleave", function () { paused = false; });
    stage.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; paused = true; }, { passive: true });
    stage.addEventListener("touchend", function (e) { paused = false; if (startX === null) return; var dx = e.changedTouches[0].clientX - startX; startX = null; if (Math.abs(dx) > 40) show(adIdx + (dx > 0 ? -1 : 1)); }, { passive: true });
    clearInterval(adTimer);
    if (list.length > 1) adTimer = setInterval(function () { if (!paused && !document.hidden) show(adIdx + 1); }, Math.max(2, +home.adInterval || 5) * 1000);
  }

  // ---------- 3) فيديوهات الأعلى ----------
  var vidSig = "";
  function ensureVideos() {
    var box = document.getElementById("homeVideos"); if (box) return box;
    var anchor = document.getElementById("social") || document.getElementById("about");
    box = document.createElement("section"); box.id = "homeVideos"; box.className = "w-full max-w-7xl mx-auto px-3 sm:px-4 my-6 hidden";
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(box, anchor);
    } else {
      var ads = ensureAds(); if (!ads) return null;
      ads.parentNode.insertBefore(box, ads.nextSibling);
    }
    return box;
  }
  function previewHtml(url) {
    var p = LV().parseVideo(url);
    if (p.kind === "yt") return '<iframe src="https://www.youtube-nocookie.com/embed/' + p.id + '?autoplay=1&mute=1&controls=0&loop=1&playlist=' + p.id + '&modestbranding=1&playsinline=1&rel=0" class="absolute inset-0 w-full h-full pointer-events-none" allow="autoplay; encrypted-media"></iframe>';
    if (p.kind === "file") return '<video src="' + esc(p.url) + '" muted loop autoplay playsinline class="absolute inset-0 w-full h-full object-cover pointer-events-none"></video>';
    return "";
  }
  function renderVideos() {
    var box = ensureVideos(); if (!box) return;
    var list = home.topVideos || [];
    if (!list.length) { box.className = "hidden"; box.innerHTML = ""; vidSig = ""; return; }
    var sig = JSON.stringify(list); if (sig === vidSig) return; vidSig = sig;
    box.className = "w-full max-w-7xl mx-auto px-3 sm:px-4 mt-5";
    box.innerHTML = '<div class="flex items-center justify-between mb-3"><h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white"><i class="fa-solid fa-circle-play text-rose-500 ml-2"></i>فيديوهات مميزة</h2></div>' +
      '<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">' + list.map(function (v) {
        var th = v.poster || LV().thumbOf(v.url), p = LV().parseVideo(v.url);
        var base = th ? '<img src="' + esc(th) + '" alt="" loading="lazy" onerror="this.remove()" class="absolute inset-0 w-full h-full object-cover">' : (p.kind === "file" ? '<video src="' + esc(p.url) + '#t=0.8" preload="metadata" muted playsinline class="absolute inset-0 w-full h-full object-cover pointer-events-none"></video>' : '<div class="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900"></div>');
        return '<button type="button" data-vid="' + esc(v.id) + '" class="vtile relative aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all text-right group">' + base + '<div class="vprev absolute inset-0"></div>' +
          '<div class="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none"></div>' +
          '<i class="vplay fa-solid fa-circle-play absolute top-2 right-2 text-white/90 text-xl drop-shadow pointer-events-none"></i>' +
          '<span class="absolute bottom-2 right-3 left-3 text-white text-[11px] sm:text-xs font-extrabold leading-snug drop-shadow line-clamp-2 pointer-events-none">' + esc(v.title) + '</span></button>';
      }).join("") + '</div>';
    wireTiles(box);
  }
  var activeTile = null;
  function startPrev(t) {
    if (activeTile === t) return; stopPrev();
    var v = (home.topVideos || []).filter(function (x) { return x.id === t.dataset.vid; })[0]; if (!v) return;
    var h = previewHtml(v.url); if (!h) return;
    t.querySelector(".vprev").innerHTML = h; activeTile = t;
  }
  function stopPrev() { if (activeTile) { var pv = activeTile.querySelector(".vprev"); if (pv) pv.innerHTML = ""; activeTile = null; } }
  function wireTiles(box) {
    var coarse = window.matchMedia && matchMedia("(pointer: coarse)").matches;
    var tiles = box.querySelectorAll(".vtile"), hoverT = null;
    tiles.forEach(function (t) {
      if (!coarse) {
        t.addEventListener("mouseenter", function () { clearTimeout(hoverT); hoverT = setTimeout(function () { startPrev(t); }, 180); });
        t.addEventListener("mouseleave", function () { clearTimeout(hoverT); if (activeTile === t) stopPrev(); });
        t.addEventListener("focus", function () { startPrev(t); }); t.addEventListener("blur", function () { if (activeTile === t) stopPrev(); });
      }
    });
    if (coarse && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting && en.intersectionRatio > 0.75) startPrev(en.target); else if (activeTile === en.target) stopPrev(); });
      }, { threshold: [0, 0.75, 1] });
      tiles.forEach(function (t) { io.observe(t); });
    }
  }
  function openVideo(id) {
    var v = (home.topVideos || []).filter(function (x) { return x.id === id; })[0]; if (!v) return;
    stopPrev();
    var p = LV().parseVideo(v.url), body;
    var box = 'class="w-full aspect-video rounded-2xl overflow-hidden bg-black"';
    if (p.kind === "yt") body = '<div ' + box + '><iframe src="https://www.youtube-nocookie.com/embed/' + p.id + '?autoplay=1&rel=0" class="w-full h-full" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe></div>';
    else if (p.kind === "ytlist") body = '<div ' + box + '><iframe src="https://www.youtube-nocookie.com/embed/videoseries?list=' + p.id + '&autoplay=1" class="w-full h-full" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe></div>';
    else if (p.kind === "drive") body = '<div ' + box + '><iframe src="https://drive.google.com/file/d/' + p.id + '/preview" class="w-full h-full" allow="autoplay; fullscreen" allowfullscreen></iframe></div>';
    else if (p.kind === "file") body = '<div ' + box + '><video src="' + esc(p.url) + '" controls autoplay playsinline class="w-full h-full"></video></div>';
    else { window.open(v.url, "_blank", "noopener"); return; }
    showModalContent('<div class="p-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800"><h3 class="text-sm font-extrabold">' + esc(v.title) + '</h3><button type="button" class="p-2 text-slate-400" onclick="closeModal()"><i class="fa-solid fa-xmark"></i></button></div><div class="p-3">' + body + '</div>');
  }

  // ---------- 4) مركز تطوير وإدارة الموقع الموحّد في أسفل الموقع (للإدارة فقط 👑) ----------
  var hubExpanded = true;
  try { hubExpanded = localStorage.getItem("edu_admin_footer_expanded") !== "0"; } catch (e) {}

  var QUICK_PALETTES = [
    ["sky", "🌊 سماوي غزة", "#0284c7"],
    ["emerald", "🌿 زمردي", "#059669"],
    ["royal", "👑 ملكي", "#4f46e5"],
    ["amber", "✨ ذهبي", "#d97706"],
    ["rose", "🌹 ياقوتي", "#e11d48"]
  ];

  function renderBottomAdminHub() {
    var oldFab = document.getElementById("homeAdminFab");
    if (oldFab) oldFab.remove();
    var oldCmd = document.getElementById("eduAdminCommandBar");
    if (oldCmd) oldCmd.remove();

    var hub = document.getElementById("adminDevFooterHub");
    var footer = document.querySelector("footer");
    if (!hub && footer && footer.parentNode) {
      hub = document.createElement("section");
      hub.id = "adminDevFooterHub";
      hub.setAttribute("aria-label", "مركز تطوير وإدارة الموقع الموحد");
      footer.parentNode.insertBefore(hub, footer);
    }
    if (!hub) return;

    // فحص صارم: إذا لم يكن المستخدم من الإدارة العليا، يُخفى المركز بالكامل وتُمسح محتوياته
    if (!canEdit()) {
      if (document.body) document.body.classList.remove("is-super-admin");
      hub.className = "hidden admin-only-ui";
      hub.innerHTML = "";
      return;
    }
    if (typeof window.__renderV244AdminHub === "function") { hub.style.display = ""; hub.classList.remove("hidden"); window.__renderV244AdminHub(hub); return; }


    if (document.body) document.body.classList.add("is-super-admin");
    hub.className = "admin-only-ui w-full border-t-2 border-amber-500/50 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white py-6 px-3 sm:px-6 shadow-2xl";

    var C = window.Cloud || {};
    var diagRep = (window.EduDiag && window.EduDiag.report) ? window.EduDiag.report() : { errors: [] };
    var perf = (window.EduDiag && window.EduDiag.perf) ? window.EduDiag.perf() : { domMs: 0 };
    var errCount = (diagRep.errors || []).length;
    var itemsCount = (window.appState && appState.items) ? appState.items.length : 0;
    var appsCount = (window.EduLauncher && window.EduLauncher.apps) ? window.EduLauncher.apps.length : 41;
    var adminEmail = (C.user && C.user.email) ? C.user.email : "وضع الإدارة المحلي";
    var curPalette = ((home.site && home.site.themeConfig) || (window.appState && appState.themeConfig) || {}).palette || "sky";
    var curAnn = (window.appState && appState.announcement) || { enabled: true, text: "" };
    var btnCls = "w-full text-right px-3 py-2 rounded-xl bg-white/5 hover:bg-amber-500 hover:text-slate-950 border border-white/10 hover:border-amber-400 text-[11px] font-extrabold flex items-center justify-between gap-2 transition-all group";

    hub.innerHTML =
      '<div class="max-w-7xl mx-auto space-y-4">' +
        // الشريط العلوي لمركز التطوير الموحّد
        '<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-white/10">' +
          '<div class="flex items-start sm:items-center gap-3">' +
            '<div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center text-lg font-black shadow-lg shrink-0">' +
              '<i class="fa-solid fa-screwdriver-wrench"></i>' +
            '</div>' +
            '<div>' +
              '<div class="flex flex-wrap items-center gap-1.5">' +
                '<span class="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black">👑 خاص بالإدارة فقط</span>' +
                '<span class="px-2 py-0.5 rounded-full ' + (C.enabled ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-sky-500/20 text-sky-300 border border-sky-500/30") + ' text-[10px] font-bold">' + (C.enabled ? "☁️ متصل بالسحابة ✓" : "💻 وضع محلي") + '</span>' +
                '<span class="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 text-[10px] font-mono" dir="ltr">' + esc(adminEmail) + '</span>' +
                '<span class="px-2 py-0.5 rounded-full bg-brand-500/20 text-sky-300 text-[10px] font-bold">📚 ' + itemsCount + ' مورد • 🚀 ' + appsCount + ' أداة • 🎓 ' + (function(){try{return (JSON.parse(localStorage.getItem("edu_courses_enrollments_v191")||"[]")||[]).length;}catch(e){return 0;}})() + ' مسجّل</span>' +
                (perf.domMs ? '<span class="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">⚡ ' + perf.domMs + 'ms</span>' : '') +
                '<span class="px-2 py-0.5 rounded-full ' + (errCount ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/15 text-emerald-300") + ' text-[10px] font-bold">' + (errCount ? "🐞 " + errCount + " تنبيه برمجي" : "✓ النظام سليم") + '</span>' +
              '</div>' +
              '<h2 class="text-sm sm:text-base font-black text-white mt-1">مركز تطوير وإدارة الموقع الموحّد — جميع أدوات وإعدادات المنصة في مكان واحد أسفل الموقع</h2>' +
            '</div>' +
          '</div>' +

          '<div class="flex flex-wrap items-center gap-1.5 shrink-0">' +
            '<button type="button" data-admin-act="add-item" class="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow flex items-center gap-1.5 transition">' +
              '<i class="fa-solid fa-plus"></i><span>نشر مورد جديد</span>' +
            '</button>' +
            '<button type="button" data-open-admin="studios" class="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black shadow flex items-center gap-1.5 transition">' +
              '<i class="fa-solid fa-cubes"></i><span>إدارة الأدوات (' + appsCount + ')</span>' +
            '</button>' +
            '<button type="button" data-open-mgr="ai" class="px-3 py-2 rounded-xl bg-gradient-to-l from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-black shadow flex items-center gap-1.5 transition">' +
              '<i class="fa-solid fa-robot"></i><span>المحركات ومفاتيح API</span>' +
            '</button>' +
            '<button type="button" data-open-admin="identity" class="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow flex items-center gap-1.5 transition">' +
              '<i class="fa-solid fa-sliders"></i><span>تخصيص شامل</span>' +
            '</button>' +
            '<button type="button" data-admin-act="visitor-preview" class="px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-bold border border-white/15 transition" title="إخفاء لوحة الإدارة مؤقتاً لمعاينة الموقع كما يراه الزائر (اضغط Ctrl+Shift+A للعودة)">' +
              '<i class="fa-solid fa-eye ml-1"></i><span>معاينة كزائر</span>' +
            '</button>' +
            '<button type="button" id="btnToggleAdminHubGrid" class="px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 text-[11px] font-extrabold border border-white/15 transition">' +
              '<i class="fa-solid ' + (hubExpanded ? "fa-chevron-down" : "fa-chevron-up") + ' ml-1"></i><span>' + (hubExpanded ? "طي اللوحة" : "توسيع اللوحة") + '</span>' +
            '</button>' +
          '</div>' +
        '</div>' +

        // شريط التطوير والتعديل المباشر الفوري (بدون فتح نوافذ)
        '<div id="adminHubLiveStrip" class="' + (hubExpanded ? "grid" : "hidden") + ' grid-cols-1 lg:grid-cols-12 gap-3 p-3 rounded-2xl bg-white/5 border border-amber-500/25 items-center">' +
          // مبدل الثيم الفوري بضغطة واحدة
          '<div class="lg:col-span-5 flex flex-wrap items-center gap-1.5">' +
            '<span class="text-[11px] font-black text-amber-300 shrink-0 ml-1"><i class="fa-solid fa-wand-magic-sparkles ml-1"></i>لون المنصة الفوري:</span>' +
            QUICK_PALETTES.map(function (kp) {
              var active = curPalette === kp[0];
              return '<button type="button" data-quick-pal="' + kp[0] + '" class="px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition border ' +
                (active ? "bg-amber-500 text-slate-950 border-amber-300 shadow" : "bg-white/10 text-white border-white/10 hover:bg-white/20") + '">' + kp[1] + '</button>';
            }).join("") +
          '</div>' +
          // محرر التعميم العلوي السريع
          '<div class="lg:col-span-7 flex flex-wrap sm:flex-nowrap items-center gap-2">' +
            '<label class="flex items-center gap-1 text-[11px] font-extrabold text-emerald-300 shrink-0 cursor-pointer">' +
              '<input id="quickAnnChk" type="checkbox" class="w-3.5 h-3.5 rounded" ' + (curAnn.enabled !== false ? "checked" : "") + '>' +
              '<span>📢 التعميم:</span>' +
            '</label>' +
            '<input id="quickAnnInp" type="text" value="' + esc(curAnn.text || "") + '" placeholder="اكتب نص تعميم الإدارة العاجل هنا ليظهر فوراً أعلى الموقع…" class="flex-1 min-w-[160px] text-xs font-bold bg-slate-900/90 border border-white/15 rounded-xl px-3 py-1.5 text-white outline-none focus:border-amber-400">' +
            '<button type="button" id="btnQuickAnnPublish" class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black shrink-0 transition">نشر التعميم ✓</button>' +
          '</div>' +
        '</div>' +

        // شبكة أقسام تطوير وإدارة الموقع (4 أعمدة منظمة)
        '<div id="adminHubGridBody" class="' + (hubExpanded ? "grid" : "hidden") + ' grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">' +

          // العمود 1: الهوية والمظهر والواجهة
          '<div class="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">' +
            '<div class="text-xs font-black text-amber-400 flex items-center gap-1.5 pb-1.5 border-b border-white/10">' +
              '<i class="fa-solid fa-palette"></i><span>1. الهوية والمظهر والواجهة</span>' +
            '</div>' +
            '<button type="button" data-open-admin="identity" class="' + btnCls + '"><span>🖼️ الهوية والصور والشعارات</span><i class="fa-solid fa-chevron-left text-[10px] opacity-60"></i></button>' +
            '<button type="button" data-open-admin="theme" class="' + btnCls + '"><span>🎨 الألوان والمظهر والخلفيات</span><i class="fa-solid fa-chevron-left text-[10px] opacity-60"></i></button>' +
            '<button type="button" data-open-admin="studios" class="' + btnCls + '"><span>🧩 إدارة الأدوات الـ ' + appsCount + ' (تثبيت/إخفاء)</span><i class="fa-solid fa-chevron-left text-[10px] opacity-60"></i></button>' +
            '<button type="button" data-open-admin="sections" class="' + btnCls + '"><span>📑 ترتيب وإظهار/إخفاء الأقسام</span><i class="fa-solid fa-chevron-left text-[10px] opacity-60"></i></button>' +
            '<button type="button" data-open-admin="nav" class="' + btnCls + '"><span>🧭 القوائم العلوية والفرعية</span><i class="fa-solid fa-chevron-left text-[10px] opacity-60"></i></button>' +
            '<button type="button" data-open-mgr="welcome" class="' + btnCls + '"><span>👋 نافذة الترحيب بالزوار</span><i class="fa-solid fa-chevron-left text-[10px] opacity-60"></i></button>' +
          '</div>' +

          // العمود 2: المحتوى والإعلانات والوسائط
          '<div class="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">' +
            '<div class="text-xs font-black text-sky-400 flex items-center gap-1.5 pb-1.5 border-b border-white/10">' +
              '<i class="fa-solid fa-photo-film"></i><span>2. المحتوى والإعلانات والوسائط</span>' +
            '</div>' +
            '<button type="button" data-open-admin="ads" class="' + btnCls + '"><span>🖼️ السلايدر الإعلاني المتحرك</span><i class="fa-solid fa-chevron-left text-[10px] opacity-60"></i></button>' +
            '<button type="button" data-open-admin="ticker" class="' + btnCls + '"><span>📰 الشريط الإخباري العاجل</span><i class="fa-solid fa-chevron-left text-[10px] opacity-60"></i></button>' +
            '<button type="button" data-open-admin="videos" class="' + btnCls + '"><span>🎬 فيديوهات الواجهة المميزة</span><i class="fa-solid fa-chevron-left text-[10px] opacity-60"></i></button>' +
            '<button type="button" data-open-mgr="quick" class="' + btnCls + '"><span>⚡ البطاقات السريعة والأقسام</span><i class="fa-solid fa-chevron-left text-[10px] opacity-60"></i></button>' +
            '<div class="grid grid-cols-2 gap-1.5 pt-0.5">' +
              '<button type="button" data-open-admin="courses" class="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500 hover:text-slate-950 border border-white/10 text-[10px] font-extrabold text-right transition">🎓 الدورات</button>' +
              '<button type="button" data-open-admin="poster" class="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500 hover:text-slate-950 border border-white/10 text-[10px] font-extrabold text-right transition">🎨 الملصقات</button>' +
              '<button type="button" data-open-admin="audio" class="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500 hover:text-slate-950 border border-white/10 text-[10px] font-extrabold text-right transition">🔊 الصوتيات</button>' +
              '<button type="button" data-open-mgr="links" class="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500 hover:text-slate-950 border border-white/10 text-[10px] font-extrabold text-right transition">🔗 حساباتنا</button>' +
            '</div>' +
          '</div>' +

          // العمود 3: البنية التربوية والمشرفون والرقابة
          '<div class="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">' +
            '<div class="text-xs font-black text-emerald-400 flex items-center gap-1.5 pb-1.5 border-b border-white/10">' +
              '<i class="fa-solid fa-user-shield"></i><span>3. البنية التربوية والمشرفون</span>' +
            '</div>' +
            '<button type="button" data-open-mgr="stages" class="' + btnCls + '"><span>🏫 إدارة المراحل الدراسية</span><i class="fa-solid fa-chevron-left text-[10px] opacity-60"></i></button>' +
            '<button type="button" data-open-mgr="subjects" class="' + btnCls + '"><span>📚 إدارة المواد الدراسية</span><i class="fa-solid fa-chevron-left text-[10px] opacity-60"></i></button>' +
            '<button type="button" data-open-mgr="mods" class="' + btnCls + '"><span>🛡️ تعيين وإدارة المشرفين</span><i class="fa-solid fa-chevron-left text-[10px] opacity-60"></i></button>' +
            '<button type="button" data-open-mgr="users" class="' + btnCls + '"><span>👥 المستخدمون والرقابة والتعميم</span><i class="fa-solid fa-chevron-left text-[10px] opacity-60"></i></button>' +
            '<button type="button" data-open-mgr="blocks" class="' + btnCls + '"><span>🧩 الأقسام المخصصة وإعلانات المكتبة</span><i class="fa-solid fa-chevron-left text-[10px] opacity-60"></i></button>' +
          '</div>' +

          // العمود 4: التطوير التقني والذكاء الاصطناعي والنظام
          '<div class="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">' +
            '<div class="text-xs font-black text-purple-400 flex items-center gap-1.5 pb-1.5 border-b border-white/10">' +
              '<i class="fa-solid fa-microchip"></i><span>4. التطوير التقني والنظام</span>' +
            '</div>' +
            '<button type="button" data-open-mgr="ai" class="' + btnCls + '"><span>🤖 محركات الذكاء ومفاتيح API</span><i class="fa-solid fa-chevron-left text-[10px] opacity-60"></i></button>' +
            '<button type="button" data-open-mgr="diag" class="' + btnCls + '"><span>🩺 تشخيص النظام وسجل الأخطاء</span><i class="fa-solid fa-chevron-left text-[10px] opacity-60"></i></button>' +
            '<button type="button" data-open-mgr="backup" class="' + btnCls + '"><span>💾 النسخ الاحتياطي والاستيراد</span><i class="fa-solid fa-chevron-left text-[10px] opacity-60"></i></button>' +
            '<button type="button" data-admin-act="cloud-backup" class="' + btnCls + '"><span>☁️ تنزيل نسخة سحابية فورية</span><i class="fa-solid fa-download text-[10px] opacity-60"></i></button>' +
            '<button type="button" data-admin-act="purge-cache" class="' + btnCls + '"><span>🔄 مسح الكاش وتحديث النظام</span><i class="fa-solid fa-arrows-rotate text-[10px] opacity-60"></i></button>' +
          '</div>' +

        '</div>' +
      '</div>';

    var togBtn = document.getElementById("btnToggleAdminHubGrid");
    if (togBtn) {
      togBtn.onclick = function () {
        hubExpanded = !hubExpanded;
        try { localStorage.setItem("edu_admin_footer_expanded", hubExpanded ? "1" : "0"); } catch (e) {}
        renderBottomAdminHub();
      };
    }

    // ربط أزرار القالب اللوني الفوري
    hub.querySelectorAll("[data-quick-pal]").forEach(function (b) {
      b.onclick = function () {
        var pal = b.getAttribute("data-quick-pal");
        var site = clone(home.site || {});
        var thmCfg = clone(site.themeConfig || (window.appState && appState.themeConfig) || window.DEFAULT_THEME_CONFIG || {});
        thmCfg.palette = pal;
        site.themeConfig = thmCfg;
        if (window.appState) {
          appState.themeConfig = clone(thmCfg);
          if (typeof saveState === "function") saveState();
        }
        if (window.applySiteTheme) window.applySiteTheme(thmCfg);
        saveHome(Object.assign({}, home, { site: site })).then(function () {
          showToast("🎨 تم تطبيق وحفظ القالب اللوني الجديد لجميع الزوار ✓", "success");
        });
      };
    });

    // ربط نشر التعميم العاجل الفوري
    var pubAnnBtn = document.getElementById("btnQuickAnnPublish");
    if (pubAnnBtn) {
      pubAnnBtn.onclick = function () {
        if (!window.appState) return;
        var txtVal = (document.getElementById("quickAnnInp") || {}).value || "";
        var chkVal = (document.getElementById("quickAnnChk") || {}).checked;
        appState.announcement = Object.assign({}, appState.announcement || {}, {
          enabled: !!chkVal,
          badge: (appState.announcement && appState.announcement.badge) || "📢 تعميم الإدارة",
          text: txtVal.trim()
        });
        if (typeof addAuditLog === "function") addAuditLog("تحديث التعميم العاجل من الشريط الفوري السفلي");
        if (typeof saveState === "function") saveState();
        if (typeof fullRender === "function") fullRender();
        showToast("📢 تم تحديث ونشر شريط التعميم لجميع الزوار ✓", "success");
      };
    }
  }

  var BASE_TABS = [
    ["identity", "الهوية والصور والنصوص", "fa-id-card"],
    ["stats", "الإحصائيات 📊", "fa-chart-line"],
    ["social_studio", "استوديو السوشيال 🎬", "fa-film"],
    ["asst_policy", "حدود المساعد 🤖", "fa-robot"],
    ["voice_cfg", "إعدادات الأصوات 🔊", "fa-volume-high"],
    ["theme", "الألوان والمظهر 🎨", "fa-palette"],
    ["studios", "إدارة الأدوات (41) 🧩", "fa-cubes"],
    ["sections", "ترتيب الأقسام", "fa-table-list"],
    ["nav", "القوائم", "fa-bars"],
    ["ads", "الإعلانات", "fa-bullhorn"],
    ["notifs", "الإشعارات 🔔", "fa-bell"],
    ["courses", "الدورات والتسجيل 🎓", "fa-graduation-cap"],
    ["curriculum", "المناهج والكتب 📚", "fa-book-open"],
    ["videos", "الفيديوهات", "fa-circle-play"]
  ];
  var EXTRA = {};
  function allTabs() { return BASE_TABS.concat(Object.keys(EXTRA).map(function (k) { return [k, EXTRA[k].label, EXTRA[k].icon]; }), [["more", "كافة إعدادات التطوير والإدارة", "fa-sliders"]]); }
  window.HomeSite = { openAdmin: function (t) { return openAdmin(t); } };
  function openAdmin(t) {
    if (!canEdit()) {
      if (typeof toggleAdminMode === "function") { toggleAdminMode(); return; }
      showToast("سجّل الدخول بحساب الإدارة أولاً لفتح مركز تطوير الموقع 🔒", "warning");
      return;
    }
    tab = t || tab;
    var head = '<div class="p-3 shrink-0 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 text-white"><div class="flex items-center justify-between mb-2"><h3 class="text-sm font-extrabold"><i class="fa-solid fa-wand-magic-sparkles text-amber-400 ml-1"></i>مركز تطوير وتخصيص الموقع 👑</h3><button type="button" class="p-2 text-slate-300 hover:text-white" onclick="closeModal()"><i class="fa-solid fa-xmark"></i></button></div>' +
      '<div class="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">' + allTabs().map(function (x) { return '<button type="button" data-tab="' + x[0] + '" class="shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-extrabold ' + (x[0] === tab ? "bg-amber-500 text-slate-950 shadow" : "bg-white/10 text-slate-200 hover:bg-white/20") + '"><i class="fa-solid ' + x[2] + ' ml-1"></i>' + x[1] + '</button>'; }).join("") + '</div></div>';
    showModalContent(head + '<div id="haBody" class="p-4 overflow-y-auto flex-1 min-h-0 text-right"></div><div id="haFoot" class="p-3 shrink-0 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/50"></div>');
    var mb = document.getElementById("modalBox");
    mb.querySelectorAll("[data-tab]").forEach(function (b) { b.addEventListener("click", function () { openAdmin(b.dataset.tab); }); });
    if (tab === "identity") identityTab();
    else if (tab === "stats") statsTab();
    else if (tab === "social_studio" && window.EduSocialStudio) window.EduSocialStudio.render({ body: document.getElementById("haBody"), foot: foot });
    else if (tab === "asst_policy") assistantPolicyTab();
    else if (tab === "voice_cfg") voiceConfigTab();
    else if (tab === "theme") themeTab();
    else if (tab === "studios") studiosTab();
    else if (tab === "sections") sectionsTab();
    else if (tab === "more") moreTab();
    else if (tab === "nav") navTab();
    else if (tab === "ads") adsTab();
    else if (tab === "notifs") notifsTab();
    else if (tab === "courses") coursesTab();
    else if (tab === "curriculum") curriculumAdminTab();
    else if (EXTRA[tab]) EXTRA[tab].fn({ body: document.getElementById("haBody"), foot: foot });
    else videosTab();
  }
  function foot(html) { document.getElementById("haFoot").innerHTML = html; }
  function v(id) { return (document.getElementById(id) || {}).value || ""; }

  // --- تبويب إدارة الأدوات والاستوديوهات الـ 41 (تثبيت للإدارة / إخفاء صيانة / شارة مخصصة) ---
  function studiosTab() {
    var site = clone(home.site || {});
    var cfg = clone(site.studiosConfig || {});
    var apps = (window.EduLauncher && window.EduLauncher.apps) ? window.EduLauncher.apps : [];
    var filterQ = "";

    function drawList() {
      var b = document.getElementById("haBody");
      var filtered = apps.filter(function (a) {
        return !filterQ || (a.title + " " + a.desc + " " + (a.badge || "")).toLowerCase().indexOf(filterQ.toLowerCase()) !== -1;
      });
      b.innerHTML =
        '<div class="space-y-3">' +
          '<div class="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-xs font-bold leading-relaxed">' +
            '🧩 <b>التحكم المركزي بأدوات واستوديوهات المنصة (' + apps.length + ' أداة):</b> يمكنك من هنا تمييز أي أداة بنجمة <b>«⭐ توصية الإدارة»</b> لتظهر في صدارة المركز لجميع الزوار، أو إخفاء أي أداة مؤقتاً للصيانة، أو تعديل شارتها.' +
          '</div>' +
          '<input id="stAppSearch" type="search" value="' + esc(filterQ) + '" placeholder="🔍 ابحث عن أداة لإدارتها…" class="' + inp + '">' +
          '<div class="space-y-2 max-h-[52vh] overflow-y-auto pr-1">' +
            filtered.map(function (a) {
              var st = cfg[a.id] || { visible: true, featured: false, badge: "" };
              var vis = st.visible !== false;
              var feat = !!st.featured;
              return '<div class="p-2.5 rounded-2xl border ' + (feat ? "border-amber-400 bg-amber-50/40 dark:bg-amber-950/20" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80") + ' flex flex-wrap items-center justify-between gap-2 ' + (vis ? "" : "opacity-50") + '" data-st-id="' + esc(a.id) + '">' +
                '<div class="flex items-center gap-2.5 min-w-[180px] flex-1">' +
                  '<span class="text-xl shrink-0">' + a.ico + '</span>' +
                  '<div class="min-w-0 flex-1">' +
                    '<div class="text-xs font-black truncate">' + esc(a.title) + (feat ? ' <span class="text-[10px] text-amber-500">⭐ مميزة</span>' : '') + '</div>' +
                    '<div class="text-[10px] text-slate-500 truncate">' + esc(a.desc) + '</div>' +
                  '</div>' +
                '</div>' +
                '<div class="flex items-center gap-1.5 shrink-0">' +
                  '<input type="text" data-st-badge="' + esc(a.id) + '" value="' + esc(st.badge || "") + '" placeholder="' + esc(a.badge || "الشارة") + '" class="w-28 text-[11px] font-bold bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1">' +
                  '<button type="button" data-st-feat="' + esc(a.id) + '" class="px-2.5 py-1 rounded-lg text-[11px] font-extrabold border ' + (feat ? "bg-amber-500 text-slate-950 border-amber-400" : "bg-slate-100 dark:bg-slate-700 text-slate-500 border-transparent") + '" title="تمييز في مقدمة المركز للجميع">⭐</button>' +
                  '<button type="button" data-st-vis="' + esc(a.id) + '" class="px-2.5 py-1 rounded-lg text-[11px] font-extrabold ' + (vis ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/15 text-rose-500") + '">' + (vis ? "ظاهر ✓" : "مخفي 🔧") + '</button>' +
                '</div>' +
              '</div>';
            }).join("") +
          '</div>' +
        '</div>';

      var sInp = document.getElementById("stAppSearch");
      if (sInp) {
        sInp.oninput = function () {
          var pos = sInp.selectionStart;
          filterQ = sInp.value;
          drawList();
          var ni = document.getElementById("stAppSearch");
          if (ni) { ni.focus(); try { ni.setSelectionRange(pos, pos); } catch (x) {} }
        };
      }

      b.querySelectorAll("[data-st-badge]").forEach(function (inpEl) {
        inpEl.oninput = function () {
          var id = inpEl.getAttribute("data-st-badge");
          cfg[id] = cfg[id] || { visible: true, featured: false, badge: "" };
          cfg[id].badge = inpEl.value.trim();
        };
      });
      b.querySelectorAll("[data-st-feat]").forEach(function (btn) {
        btn.onclick = function () {
          var id = btn.getAttribute("data-st-feat");
          cfg[id] = cfg[id] || { visible: true, featured: false, badge: "" };
          cfg[id].featured = !cfg[id].featured;
          drawList();
        };
      });
      b.querySelectorAll("[data-st-vis]").forEach(function (btn) {
        btn.onclick = function () {
          var id = btn.getAttribute("data-st-vis");
          cfg[id] = cfg[id] || { visible: true, featured: false, badge: "" };
          cfg[id].visible = cfg[id].visible === false ? true : false;
          drawList();
        };
      });
    }

    drawList();
    foot(
      '<button type="button" id="stResetAll" class="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold ml-auto">استعادة افتراضي الأدوات</button>' +
      '<button type="button" id="stSaveAll" class="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-black shadow">حفظ إعدادات الأدوات للجميع ✓</button>'
    );

    document.getElementById("stResetAll").onclick = function () {
      cfg = {};
      drawList();
    };
    document.getElementById("stSaveAll").onclick = function () {
      site.studiosConfig = cfg;
      saveHome(Object.assign({}, home, { site: site })).then(function () {
        if (window.EduLauncher && window.EduLauncher.refresh) window.EduLauncher.refresh();
        closeModal();
        showToast("✓ تم حفظ إعدادات وترتيب الأدوات لجميع الزوار", "success");
      });
    };
  }

  // --- تبويب القوائم ---
  var navDraft = [];
  function navTab() {
    navDraft = clone(home.nav && home.nav.length ? home.nav : (ORIGINAL_NAV || defaultNav()));
    navRows();
    foot('<button type="button" id="haReset" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold ml-auto">استرجاع القائمة الأصلية</button><button type="button" id="haSave" class="px-5 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold">حفظ القوائم</button>');
    document.getElementById("haSave").addEventListener("click", function () {
      readNav(); var out = navDraft.filter(function (n) { return n.label.trim(); });
      saveHome(Object.assign({}, home, { nav: out.length ? out : null })).then(function () { closeModal(); showToast("تم حفظ القوائم ✓", "success"); });
    });
    document.getElementById("haReset").addEventListener("click", function () {
      if (!window.eduConfirm("العودة للقائمة الأصلية؟")) return;
      saveHome(Object.assign({}, home, { nav: null })).then(function () { var n = document.querySelector("header nav.lg\\:flex"); if (n) { delete n.dataset.sig; location.reload(); } });
    });
  }
  function linkInput(val, cls, attr) {
    return '<input ' + attr + ' list="haSections" dir="ltr" class="' + inp + ' text-left ' + cls + '" placeholder="الرابط: اختر قسماً أو الصق https://..." value="' + esc(val || "") + '">';
  }
  function navRows() {
    var b = document.getElementById("haBody");
    b.innerHTML = '<p class="text-[11px] text-slate-500 mb-3">رتّب القوائم بالأسهم، وأضف قوائم فرعية (تظهر عند مرور الماوس على القائمة، وفي الجوال تُفتح بزر السهم).</p><datalist id="haSections">' + SECTIONS.map(function (s) { return '<option value="' + s[0] + '">' + s[1] + '</option>'; }).join("") + '</datalist>' +
      '<div class="space-y-2" id="haNav">' + navDraft.map(function (n, i) {
        return '<div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-2.5 space-y-1.5" data-ni="' + i + '"><div class="flex gap-1.5 items-center"><input class="' + inp + '" data-f="label" placeholder="اسم القائمة" value="' + esc(n.label) + '">' +
          '<select data-f="icon" class="' + inp + ' !w-28 shrink-0"><option value="">بدون أيقونة</option>' + ICONS.map(function (ic) { return '<option value="' + ic[0] + '"' + (ic[0] === n.icon ? " selected" : "") + '>' + ic[1] + '</option>'; }).join("") + '</select></div>' +
          linkInput(n.url, "", 'data-f="url"') +
          '<div class="flex flex-wrap gap-1.5"><button type="button" data-nop="up" data-i="' + i + '" class="' + mini + '"><i class="fa-solid fa-arrow-up"></i></button><button type="button" data-nop="down" data-i="' + i + '" class="' + mini + '"><i class="fa-solid fa-arrow-down"></i></button><button type="button" data-nop="addc" data-i="' + i + '" class="' + mini + '">+ قائمة فرعية</button><button type="button" data-nop="del" data-i="' + i + '" class="' + mini + ' !text-rose-500"><i class="fa-solid fa-trash"></i></button></div>' +
          (n.children || []).map(function (c, j) {
            return '<div class="mr-4 pr-2 border-r-2 border-brand-200 dark:border-slate-600 flex gap-1.5 items-center" data-nj="' + j + '"><div class="flex-1 space-y-1"><input class="' + inp + '" data-cf="label" placeholder="اسم القائمة الفرعية" value="' + esc(c.label) + '">' + linkInput(c.url, "", 'data-cf="url"') + '</div>' +
              '<div class="flex flex-col gap-1"><button type="button" data-nop="cup" data-i="' + i + '" data-j="' + j + '" class="' + mini + '"><i class="fa-solid fa-arrow-up"></i></button><button type="button" data-nop="cdown" data-i="' + i + '" data-j="' + j + '" class="' + mini + '"><i class="fa-solid fa-arrow-down"></i></button><button type="button" data-nop="cdel" data-i="' + i + '" data-j="' + j + '" class="' + mini + ' !text-rose-500"><i class="fa-solid fa-xmark"></i></button></div></div>';
          }).join("") + '</div>';
      }).join("") + '</div><button type="button" data-nop="add" class="mt-3 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"><i class="fa-solid fa-plus ml-1"></i>إضافة قائمة</button>';
    b.onclick = function (e) {
      var o = e.target.closest("[data-nop]"); if (!o) return; readNav();
      var op = o.dataset.nop, i = +o.dataset.i, j = +o.dataset.j, a = navDraft;
      function sw(arr, x, y) { if (y < 0 || y >= arr.length) return; var t = arr[x]; arr[x] = arr[y]; arr[y] = t; }
      if (op === "add") a.push({ id: uid("n"), label: "قائمة جديدة", url: "#hero", icon: "", children: [] });
      else if (op === "up") sw(a, i, i - 1); else if (op === "down") sw(a, i, i + 1);
      else if (op === "del") a.splice(i, 1);
      else if (op === "addc") { (a[i].children = a[i].children || []).push({ label: "فرعية جديدة", url: "#hero" }); }
      else if (op === "cup") sw(a[i].children, j, j - 1); else if (op === "cdown") sw(a[i].children, j, j + 1); else if (op === "cdel") a[i].children.splice(j, 1);
      navRows();
    };
  }
  function readNav() {
    document.querySelectorAll("#haNav [data-ni]").forEach(function (el) {
      var n = navDraft[+el.dataset.ni]; if (!n) return;
      n.label = el.querySelector('[data-f="label"]').value; n.url = el.querySelector('[data-f="url"]').value.trim() || "#"; n.icon = el.querySelector('[data-f="icon"]').value;
      el.querySelectorAll("[data-nj]").forEach(function (c) { var ch = n.children[+c.dataset.nj]; if (ch) { ch.label = c.querySelector('[data-cf="label"]').value; ch.url = c.querySelector('[data-cf="url"]').value.trim() || "#"; } });
    });
  }

  // --- تبويب الإعلانات ---
  function adsTab() {
    var b = document.getElementById("haBody"), list = slides();
    b.innerHTML = '<div class="flex items-center gap-2 mb-3"><label class="text-[11px] font-bold shrink-0">زمن تبديل الصور (ثانية)</label><input id="haInt" type="number" min="2" max="60" class="' + inp + ' !w-20" value="' + (home.adInterval || 5) + '"><button type="button" id="haIntSave" class="' + mini + '">حفظ</button></div>' +
      '<div class="space-y-2">' + (list.map(function (a, i) {
        var im = (a.images || [])[0];
        return '<div class="flex items-center gap-2 p-2 rounded-2xl border border-slate-200 dark:border-slate-700"><div class="w-20 h-14 shrink-0 rounded-xl overflow-hidden bg-gradient-to-br ' + GRADS[i % GRADS.length] + '">' + (im ? '<img src="' + esc(im) + '" class="w-full h-full object-cover">' : "") + '</div>' +
          '<div class="min-w-0 flex-1"><div class="text-xs font-extrabold truncate">' + esc(a.title || "(بدون عنوان)") + '</div><div class="text-[10px] text-slate-500">' + (a.images || []).length + ' صور • ' + (a.active === false ? "متوقف" : "ظاهر") + '</div></div>' +
          '<div class="flex gap-1"><button type="button" data-aop="up" data-id="' + esc(a.id) + '" class="' + mini + '"><i class="fa-solid fa-arrow-up"></i></button><button type="button" data-aop="down" data-id="' + esc(a.id) + '" class="' + mini + '"><i class="fa-solid fa-arrow-down"></i></button><button type="button" data-aop="edit" data-id="' + esc(a.id) + '" class="' + mini + '"><i class="fa-solid fa-pen"></i></button><button type="button" data-aop="del" data-id="' + esc(a.id) + '" class="' + mini + ' !text-rose-500"><i class="fa-solid fa-trash"></i></button></div></div>';
      }).join("") || '<div class="text-center text-xs text-slate-400 py-8">لا توجد إعلانات بعد.</div>') + '</div>';
    foot('<button type="button" id="haAddAd" class="px-5 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"><i class="fa-solid fa-plus ml-1"></i>إعلان جديد</button>');
    document.getElementById("haAddAd").addEventListener("click", function () { adForm(null); });
    document.getElementById("haIntSave").addEventListener("click", function () { saveHome(Object.assign({}, home, { adInterval: Math.min(60, Math.max(2, +v("haInt") || 5)) })).then(function () { showToast("تم الحفظ ✓", "success"); }); });
    b.onclick = function (e) {
      var o = e.target.closest("[data-aop]"); if (!o) return; var id = o.dataset.id, op = o.dataset.aop, l = slides(), i = l.findIndex(function (x) { return x.id === id; });
      if (op === "edit") adForm(l[i]);
      else if (op === "del") { if (window.eduConfirm("حذف هذا الإعلان؟")) saveSlides([{ id: id, remove: true }]).then(function () { setTimeout(adsTab, 250); }); }
      else { var j = op === "up" ? i - 1 : i + 1; if (j < 0 || j >= l.length) return;
        var ops = l.map(function (x, k) { var pos = k === i ? j : k === j ? i : k; return { id: x.id, data: Object.assign({}, x, { order: pos }) }; });
        ops.forEach(function (x) { delete x.data.id; }); saveSlides(ops).then(function () { setTimeout(adsTab, 250); }); }
    };
  }
  function voiceConfigTab() {
    var b = document.getElementById("haBody");
    var api = window.EduTechTTS;
    var p = (api && api.getPolicy) ? api.getPolicy() : { sourceMode: "hybrid", ttsProvider: "auto", rate: 1.0, autoGender: true, welcomeEnabled: true, musicEnabled: true, musicDelaySec: 60, musicVol: 0.25, musicUrl: "" };
    b.innerHTML =
      '<div class="space-y-3">' +
        '<div class="p-3.5 rounded-2xl bg-slate-900 text-white border border-sky-500/30 space-y-2.5">' +
          '<div class="text-xs font-black text-amber-300">🔊 إدارة مصدر وجودة الأصوات العربية الفصحى</div>' +
          '<button type="button" id="v249DiagTtsBtn" onclick="if(window.EduTechTTS&&window.EduTechTTS.runDiagnostics)window.EduTechTTS.runDiagnostics();" class="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-[11px] font-black">🔍 فحص حالة مزوّدي الصوت الآن (Gemini / ElevenLabs / Cartesia)</button>' +
          '<div class="space-y-1"><label class="text-[11px] font-bold text-slate-300">مصدر الصوت المعتمد للجميع:</label>' +
            '<select id="vcMode" class="' + inp + '">' +
              '<option value="hybrid"' + (p.sourceMode === "hybrid" ? " selected" : "") + '>🌐 هجين ذكي (السحابة أولاً + المدمج عند ضعف الشبكة)</option>' +
              '<option value="cloud"' + (p.sourceMode === "cloud" ? " selected" : "") + '>☁️ السحابة فقط (نطق بشري فصيح نقي)</option>' +
              '<option value="local"' + (p.sourceMode === "local" ? " selected" : "") + '>📱 أصوات الجهاز المدمجة فقط (بلا إنترنت)</option>' +
            '</select>' +
          '</div>' +
          '<div class="space-y-1"><label class="text-[11px] font-bold text-slate-300">المزوّد السحابي المفضّل أولاً:</label>' +
            '<select id="vcTtsProvider" class="' + inp + '">' +
              '<option value="auto"' + ((p.ttsProvider || "auto") === "auto" ? " selected" : "") + '>✨ التلقائي الأفضل (Gemini 2.5 الفصحى ← ElevenLabs ← Cartesia)</option>' +
              '<option value="gemini"' + (p.ttsProvider === "gemini" ? " selected" : "") + '>🌟 Gemini 2.5 Flash TTS (الأوضح في العربية الفصحى)</option>' +
              '<option value="elevenlabs"' + (p.ttsProvider === "elevenlabs" ? " selected" : "") + '>🎙️ ElevenLabs أولاً</option>' +
              '<option value="cartesia"' + (p.ttsProvider === "cartesia" ? " selected" : "") + '>🎧 Cartesia Sonic أولاً</option>' +
            '</select>' +
          '</div>' +
          '<div class="space-y-1"><label class="text-[11px] font-bold text-slate-300">سرعة النطق العربي الفصيح (<span id="vcRateLbl">' + (p.rate || 1.0) + 'x</span>):</label>' +
            '<input id="vcRate" type="range" min="0.8" max="1.25" step="0.05" value="' + (p.rate || 1.0) + '" class="w-full accent-amber-400">' +
          '</div>' +
          '<label class="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/5 text-xs font-bold"><span>🎭 مطابقة الصوت تلقائياً حسب الشخصية (ذكر / أنثى)</span><input id="vcGender" type="checkbox"' + (p.autoGender !== false ? " checked" : "") + '></label>' +
          '<label class="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/5 text-xs font-bold"><span>✨ تفعيل الترحيب الصوتي التلقائي عند أول لمسة</span><input id="vcWelcome" type="checkbox"' + (p.welcomeEnabled !== false ? " checked" : "") + '></label>' +
          '<div class="p-3 rounded-2xl bg-indigo-950/60 border border-indigo-400/35 space-y-2.5 mt-2">' +
            '<div class="flex items-center justify-between gap-2">' +
              '<div class="text-xs font-black text-indigo-300">🎵 موسيقى الموقع الترحيبية وتوقيت تشغيلها</div>' +
              '<button type="button" id="v278MusicPreview" class="px-2.5 py-1 rounded-lg text-[10px] font-black" style="background:#4f46e5;color:#fff;">▶️ تجربة الموسيقى</button>' +
            '</div>' +
            '<label class="flex items-center gap-2 text-xs font-bold text-slate-200"><input type="checkbox" id="v256MusicEnable" ' + (p.musicEnabled !== false ? 'checked' : '') + '> تفعيل موسيقى خلفية هادئة تلقائياً عند فتح الموقع</label>' +
            '<div>' +
              '<label class="text-[11px] font-bold text-slate-300 block mb-1">ملف موسيقى مخصص (ارفع من الهاتف أو الصق رابط MP3):</label>' +
              '<div class="flex flex-wrap sm:flex-nowrap gap-1.5 items-center">' +
                '<input id="v258MusicUrl" dir="ltr" value="' + esc(p.musicUrl || "") + '" placeholder="https://.../music.mp3" class="' + inp + ' flex-1 min-w-0" style="min-height:40px;">' +
                '<label class="px-3 py-2 rounded-xl text-[11px] font-black cursor-pointer shrink-0 flex items-center gap-1" style="background:#10b981;color:#022c22;min-height:40px;">📁 رفع من الهاتف<input id="v278MusicFile" type="file" accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac" class="hidden"></label>' +
                '<button type="button" id="v278MusicClear" title="العودة للموسيقى المدمجة" class="px-2.5 py-2 rounded-xl text-[11px] font-black shrink-0" style="background:rgba(244,63,94,0.2);color:#fda4af;min-height:40px;">✕</button>' +
              '</div>' +
              '<div id="v278MusicUpMsg" class="text-[10px] font-bold text-emerald-300 mt-1"></div>' +
            '</div>' +
            '<div class="grid grid-cols-2 gap-2">' +
              '<div><label class="text-[11px] font-bold text-slate-300 block mb-1">وقت التشغيل بعد فتح الموقع:</label><select id="v256MusicDelay" class="' + inp + '" style="min-height:40px;line-height:1.4;padding:6px 10px;"><option value="0"' + (Number(p.musicDelaySec) === 0 ? ' selected' : '') + '>فوراً (0 ثانية)</option><option value="30"' + (Number(p.musicDelaySec) === 30 ? ' selected' : '') + '>بعد 30 ثانية</option><option value="60"' + (Number(p.musicDelaySec !== undefined ? p.musicDelaySec : 60) === 60 ? ' selected' : '') + '>بعد دقيقة (60 ثانية)</option><option value="120"' + (Number(p.musicDelaySec) === 120 ? ' selected' : '') + '>بعد دقيقتين (120 ثانية)</option><option value="180"' + (Number(p.musicDelaySec) === 180 ? ' selected' : '') + '>بعد 3 دقائق</option></select></div>' +
              '<div><label class="text-[11px] font-bold text-slate-300 block mb-1">مستوى صوت الموسيقى:</label><select id="v256MusicVol" class="' + inp + '" style="min-height:40px;line-height:1.4;padding:6px 10px;"><option value="0.2"' + (Number(p.musicVol) <= 0.25 ? ' selected' : '') + '>هادئ (20-25%)</option><option value="0.4"' + (Number(p.musicVol) > 0.25 && Number(p.musicVol) <= 0.45 ? ' selected' : '') + '>متوسط (40%)</option><option value="0.6"' + (Number(p.musicVol) > 0.45 ? ' selected' : '') + '>واضح (60%)</option></select></div>' +
            '</div>' +
          '</div>' +
          '<div class="flex flex-wrap gap-2 pt-1">' +
            '<button type="button" id="vcTestMale" class="flex-1 py-2.5 px-3 rounded-xl text-xs font-black" style="background:#0ea5e9;color:#082f49;">🎙️ تجربة صوت أ. باسل (فصحى ذكوري)</button>' +
            '<button type="button" id="vcTestFemale" class="flex-1 py-2.5 px-3 rounded-xl text-xs font-black" style="background:#db2777;color:#ffffff;">🎙️ تجربة صوت المعلمة (فصحى أنثوي)</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    foot('<button type="button" class="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold" onclick="closeModal()">إغلاق</button><button type="button" id="vcSaveBtn" class="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black">حفظ إعدادات الأصوات ✓</button>');

    var rInp = document.getElementById("vcRate"), rLbl = document.getElementById("vcRateLbl");
    if (rInp && rLbl) rInp.oninput = function () { rLbl.textContent = rInp.value + "x"; };
    var tm = document.getElementById("vcTestMale"), tf = document.getElementById("vcTestFemale");
    if (tm && api) tm.onclick = function () { api.speak("مرحباً بكم في منصة إيدو تِك مايند سِت، هذا اختبار للصوت العربي الفصيح الذكوري.", { gender: "male", forceGender: true, noCache: true, preferredProvider: v("vcTtsProvider") || "auto", rate: parseFloat(rInp.value) || 1.0 }); };
    if (tf && api) tf.onclick = function () { api.speak("أهلاً بكم طلابنا الأعزاء، هذا اختبار للصوت العربي الفصيح الأنثوي الواضح.", { gender: "female", forceGender: true, noCache: true, preferredProvider: v("vcTtsProvider") || "auto", rate: parseFloat(rInp.value) || 1.0 }); };
    var mf = document.getElementById("v278MusicFile"), mu = document.getElementById("v258MusicUrl"), mm = document.getElementById("v278MusicUpMsg");
    if (mf) mf.onchange = function () {
      var f = mf.files && mf.files[0];
      if (!f) return;
      if (!(window.EduMedia && window.EduMedia.ready && window.EduMedia.ready())) {
        if (mm) { mm.className = "text-[10px] font-bold text-rose-300 mt-1"; mm.textContent = "تخزين R2 غير مفعّل — ألصق رابط MP3 مباشرة."; }
        return;
      }
      if (mm) { mm.className = "text-[10px] font-bold text-amber-300 mt-1"; mm.textContent = "⏳ جارٍ رفع الملف الصوتي إلى السحابة…"; }
      window.EduMedia.upload(f, "audio").then(function (url) {
        if (mu) mu.value = url;
        if (mm) { mm.className = "text-[10px] font-bold text-emerald-300 mt-1"; mm.textContent = "✓ تم رفع الصوت بنجاح — اضغط «حفظ إعدادات الأصوات» لتثبيته."; }
        if (typeof showToast === "function") showToast("تم رفع ملف الموسيقى ✓", "success");
      }).catch(function () {
        if (mm) { mm.className = "text-[10px] font-bold text-rose-300 mt-1"; mm.textContent = "✗ تعذر رفع الملف — تأكد من الصيغة (MP3/WAV/M4A)."; }
      });
    };
    var mc = document.getElementById("v278MusicClear");
    if (mc) mc.onclick = function () {
      if (mu) mu.value = "";
      if (mm) { mm.className = "text-[10px] font-bold text-sky-300 mt-1"; mm.textContent = "تمت استعادة الموسيقى المدمجة الهادئة — اضغط حفظ."; }
    };
    var mp = document.getElementById("v278MusicPreview");
    if (mp && window.EduBgMusic) mp.onclick = function () {
      window.EduBgMusic.toggle();
    };

    var sb = document.getElementById("vcSaveBtn");
    if (sb && api) sb.onclick = function () {
      var next = {
        sourceMode: v("vcMode") || "hybrid",
        ttsProvider: v("vcTtsProvider") || "auto",
        rate: parseFloat(v("vcRate")) || 1.0,
        autoGender: !!document.getElementById("vcGender").checked,
        welcomeEnabled: !!document.getElementById("vcWelcome").checked,
        musicEnabled: !!document.getElementById("v256MusicEnable").checked,
        musicUrl: (v("v258MusicUrl") || "").trim(),
        musicDelaySec: parseInt(v("v256MusicDelay"), 10) || 0,
        musicVol: parseFloat(v("v256MusicVol")) || 0.25
      };
      sb.disabled = true; sb.textContent = "جارٍ الحفظ…";
      api.savePolicy(next).then(function () {
        if (window.EduBgMusic && window.EduBgMusic.applyPolicy) window.EduBgMusic.applyPolicy();
        showToast("تم حفظ إعدادات الأصوات والموسيقى للجميع ✓", "success");
        sb.disabled = false; sb.textContent = "حفظ إعدادات الأصوات ✓";
      }, function (err) {
        sb.disabled = false; sb.textContent = "حفظ إعدادات الأصوات ✓";
        bad(err);
      });
    };
  }

  function assistantPolicyTab() {
    var b = document.getElementById("haBody");
    var api = window.EduAssistantPolicy;
    var p = (api && api.get) ? api.get() : { enabled: true, requireLogin: true, dailyLimit: 15, allowVoice: true, allowAttachments: false, customNotice: "" };
    b.innerHTML =
      '<div class="space-y-3">' +
        '<div class="p-3.5 rounded-2xl bg-slate-900 text-white border border-sky-500/30 space-y-2.5">' +
          '<div class="text-xs font-black text-amber-300">🤖 التحكم الكامل بصلاحيات وحدود المساعد الشخصي الذكي</div>' +
          '<p class="text-[11px] text-slate-300">كل الإعدادات هنا تُحفظ في السحابة وتُطبّق فوراً على جميع الزوار والطلاب (الإدارة العليا معفاة من القيود تلقائياً).</p>' +
          '<label class="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/5 text-xs font-bold"><span>⚡ تفعيل المساعد الذكي في الموقع</span><input id="apEnabled" type="checkbox"' + (p.enabled !== false ? ' checked' : '') + '></label>' +
          '<label class="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/5 text-xs font-bold"><span>🔒 قصر المساعد على الأعضاء المسجّلين فقط</span><input id="apReqLogin" type="checkbox"' + (p.requireLogin !== false ? ' checked' : '') + '></label>' +
          '<label class="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/5 text-xs font-bold"><span>🎙️ السماح بميزة الصوت والميكروفون</span><input id="apVoice" type="checkbox"' + (p.allowVoice !== false ? ' checked' : '') + '></label>' +
          '<label class="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/5 text-xs font-bold"><span>📸 السماح برفع الصور والمرفقات</span><input id="apAttach" type="checkbox"' + (p.allowAttachments ? ' checked' : '') + '></label>' +
          '<div class="space-y-1"><label class="text-[11px] font-bold text-slate-300">الحد اليومي لعدد الأسئلة لكل عضو مسجّل:</label><input id="apLimit" type="number" min="1" max="500" class="' + inp + '" value="' + (parseInt(p.dailyLimit, 10) || 15) + '"></div>' +
          '<div class="space-y-1"><label class="text-[11px] font-bold text-slate-300">رسالة تنبيه مخصّصة تظهر للمستخدمين (اختياري):</label><input id="apNotice" class="' + inp + '" placeholder="مثال: المساعد متاح لطلاب المنصة المسجلين مجاناً" value="' + esc(p.customNotice || "") + '"></div>' +
        '</div>' +
      '</div>';
    foot('<button type="button" class="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold" onclick="closeModal()">إغلاق</button><button type="button" id="apSaveBtn" class="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black">حفظ الصلاحيات للجميع ✓</button>');
    var sb = document.getElementById("apSaveBtn");
    if (sb && api) sb.onclick = function () {
      var next = {
        enabled: !!document.getElementById("apEnabled").checked,
        requireLogin: !!document.getElementById("apReqLogin").checked,
        allowVoice: !!document.getElementById("apVoice").checked,
        allowAttachments: !!document.getElementById("apAttach").checked,
        dailyLimit: Math.max(1, parseInt(v("apLimit"), 10) || 15),
        customNotice: v("apNotice").trim()
      };
      sb.disabled = true; sb.textContent = "جارٍ الحفظ…";
      api.save(next).then(function () {
        showToast("تم حفظ صلاحيات وحدود المساعد الذكي للجميع ✓", "success");
        sb.disabled = false; sb.textContent = "حفظ الصلاحيات للجميع ✓";
      }, function (err) {
        sb.disabled = false; sb.textContent = "حفظ الصلاحيات للجميع ✓";
        bad(err);
      });
    };
  }

  function notifsTab() {
    var b = document.getElementById("haBody");
    var api = window.EduNotifications;
    var list = (api && api.getList) ? api.getList() : [];
    var cList = (window.EduCoursesPro && window.EduCoursesPro.getList) ? window.EduCoursesPro.getList() : [];
    b.innerHTML =
      '<div class="space-y-3">' +
        '<div class="p-3.5 rounded-2xl bg-slate-900 text-white border border-sky-500/30 space-y-2">' +
          '<div class="text-xs font-black text-amber-300">🔔 إرسال إشعار فوري لجميع زوار وطلاب الموقع</div>' +
          '<div class="grid grid-cols-2 gap-2">' +
            '<select id="nfKind" class="' + inp + '"><option value="course">🎓 دورة جديدة</option><option value="exam">📝 امتحان / مراجعة</option><option value="book">📘 كتاب / ملخص</option><option value="update">🔔 تنبيه عام</option></select>' +
            '<select id="nfCoursePick" class="' + inp + '"><option value="">— ربط بدورة (اختياري) —</option>' + cList.map(function (c) { return '<option value="#enroll:' + esc(c.id) + '">' + esc(c.title) + '</option>'; }).join("") + '</select>' +
          '</div>' +
          '<input id="nfTitle" class="' + inp + '" placeholder="عنوان الإشعار * (مثال: فتح التسجيل في دورة الذكاء الاصطناعي)">' +
          '<textarea id="nfBody" rows="2" class="' + inp + '" placeholder="تفاصيل مختصرة للإشعار"></textarea>' +
          '<div class="grid grid-cols-2 gap-2">' +
            '<input id="nfBtn" class="' + inp + '" placeholder="نص الزر (مثال: سجّل الآن)" value="عرض التفاصيل">' +
            '<input id="nfLink" dir="ltr" class="' + inp + ' text-left" placeholder="رابط اختياري (https:// أو #...)">' +
          '</div>' +
          '<button type="button" id="nfSendBtn" class="w-full py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black">🔔 نشر الإشعار للجميع ✓</button>' +
        '</div>' +
        '<div class="text-xs font-black text-slate-500">الإشعارات المنشورة حالياً (' + list.length + '):</div>' +
        '<div class="space-y-1.5">' +
          (list.length ? list.map(function (n) {
            return '<div class="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60">' +
              '<div class="min-w-0"><div class="text-xs font-black truncate">' + esc(n.title) + '</div><div class="text-[10px] text-slate-500 truncate">' + esc(n.body || n.at || "") + '</div></div>' +
              '<button type="button" data-nf-del="' + esc(n.id) + '" class="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-600 text-[11px] font-black shrink-0">حذف</button>' +
            '</div>';
          }).join("") : '<p class="text-[11px] text-slate-400">لا توجد إشعارات منشورة.</p>') +
        '</div>' +
      '</div>';
    foot('<button type="button" class="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold" onclick="closeModal()">إغلاق</button>');

    var cp = document.getElementById("nfCoursePick");
    if (cp) cp.onchange = function () {
      if (!cp.value) return;
      var li = document.getElementById("nfLink"), bi = document.getElementById("nfBtn");
      if (li) li.value = cp.value;
      if (bi) bi.value = "سجّل الآن";
    };
    var sb = document.getElementById("nfSendBtn");
    if (sb) sb.onclick = function () {
      var title = v("nfTitle").trim();
      if (!title) { showToast("اكتب عنوان الإشعار أولاً", "warning"); return; }
      if (!api) return;
      sb.disabled = true; sb.textContent = "جارٍ النشر…";
      api.add({ kind: v("nfKind"), title: title, body: v("nfBody").trim(), btn: v("nfBtn").trim() || "عرض التفاصيل", link: v("nfLink").trim() }).then(function () {
        showToast("تم نشر الإشعار لجميع الزوار ✓", "success");
        notifsTab();
      }, function (err) {
        sb.disabled = false; sb.textContent = "🔔 نشر الإشعار للجميع ✓";
        bad(err);
      });
    };
    b.onclick = function (e) {
      var d = e.target.closest("[data-nf-del]");
      if (!d || !api) return;
      api.remove(d.dataset.nfDel).then(function () { showToast("تم حذف الإشعار ✓", "success"); notifsTab(); }, bad);
    };
  }

  function exportEnrollmentsRosterPdf(enrolls, courseFilter) {
    var list = (enrolls || []).filter(function (r) {
      return !courseFilter || courseFilter === "all" || (r.courseTitle || r.courseId) === courseFilter;
    });
    if (!list.length) { showToast("لا توجد أسماء مطابقة لتصدير الكشف PDF", "warning"); return; }
    var dateStr = new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
    var titleLbl = (!courseFilter || courseFilter === "all") ? "جميع الدورات التدريبية" : courseFilter;
    var paidCount = list.filter(function (r) { return /مدفوع|مؤكد|مجان/.test(String(r.paymentStatus || "")); }).length;

    var w = window.open("", "_blank");
    if (!w) { showToast("اسمح بالنوافذ المنبثقة لفتح كشف المسجلين PDF", "warning"); return; }
    w.document.write(
      '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8">' +
      '<title>كشف المسجلين — ' + esc(titleLbl) + '</title>' +
      '<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;800;900&display=swap" rel="stylesheet">' +
      '<style>@page{size:A4 landscape;margin:10mm;}body{font-family:Cairo,Tahoma,sans-serif;background:#f8fafc;color:#0f172a;margin:0;padding:16px;}' +
      '.sheet{background:#fff;border:1.5px solid #cbd5e1;border-radius:14px;padding:18px 22px;max-width:1120px;margin:0 auto;}' +
      '.hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:2.5px solid #0284c7;padding-bottom:10px;margin-bottom:12px;}' +
      '.kpis{display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap;}' +
      '.kpi{padding:6px 14px;border-radius:10px;background:#f1f5f9;border:1px solid #cbd5e1;font-size:12px;font-weight:800;}' +
      'table{width:100%;border-collapse:collapse;font-size:11.5px;}' +
      'th{background:#0f172a;color:#fff;padding:8px 6px;border:1px solid #334155;font-weight:900;text-align:right;}' +
      'td{padding:7px 6px;border:1px solid #cbd5e1;vertical-align:middle;}' +
      'tr:nth-child(even) td{background:#f8fafc;}' +
      '.acts{text-align:center;margin-top:14px;display:flex;justify-content:center;gap:10px;}' +
      '.btn{padding:9px 20px;border-radius:10px;border:none;font-family:Cairo,sans-serif;font-weight:900;font-size:13px;cursor:pointer;}' +
      '@media print{body{background:#fff;padding:0;}.sheet{border:none;padding:0;}.acts{display:none;}}</style></head><body>' +
      '<div class="sheet">' +
        '<div class="hdr">' +
          '<div><div style="font-size:18px;font-weight:900;color:#0f172a;">🎓 كشف أسماء المسجّلين الرسمي — EduTech Mindset</div>' +
          '<div style="font-size:12.5px;color:#0284c7;font-weight:800;margin-top:2px;">الدورة: ' + esc(titleLbl) + '</div></div>' +
          '<div style="text-align:left;font-size:11.5px;color:#475569;"><div>تاريخ الإصدار: <b>' + dateStr + '</b></div><div>إشراف: أ. باسل الفقعاوي</div></div>' +
        '</div>' +
        '<div class="kpis">' +
          '<div class="kpi">👥 إجمالي المسجّلين: ' + list.length + '</div>' +
          '<div class="kpi">✅ مدفوع / مجاني مؤكد: ' + paidCount + '</div>' +
          '<div class="kpi">⏳ قيد المتابعة: ' + Math.max(0, list.length - paidCount) + '</div>' +
        '</div>' +
        '<table><thead><tr><th>#</th><th>الاسم الرباعي</th><th>رقم الهاتف</th><th>المحافظة</th><th>الصفة</th><th>الدورة</th><th>الحضور</th><th>حالة الدفع</th><th>رقم الطلب</th><th style="min-width:95px;">التوقيع / ملاحظات</th></tr></thead><tbody>' +
        list.map(function (r, i) {
          return '<tr><td><b>' + (i + 1) + '</b></td><td><b>' + esc(r.fullName || "-") + '</b></td><td dir="ltr">' + esc(r.phone || "-") + '</td><td>' + esc(r.city || "-") + '</td><td>' + esc(r.role || "-") + '</td><td>' + esc(r.courseTitle || "-") + '</td><td>' + esc(r.attendance || "-") + '</td><td>' + esc(r.paymentStatus || "-") + '</td><td dir="ltr" style="font-family:monospace;">' + esc(r.ticketId || "-") + '</td><td></td></tr>';
        }).join("") +
        '</tbody></table>' +
      '</div>' +
      '<div class="acts"><button class="btn" style="background:#e11d48;color:#fff;" onclick="window.print()">🖨️ طباعة / حفظ كملف PDF</button><button class="btn" style="background:#e2e8f0;color:#0f172a;" onclick="window.close()">إغلاق</button></div>' +
      '</body></html>'
    );
    w.document.close();
  }

  function cleanWaPhone(ph) {
    var d = String(ph || "").replace(/[^\d]/g, "");
    if (!d) return "";
    if (d.indexOf("00") === 0) d = d.slice(2);
    if (d.indexOf("05") === 0 && d.length === 10) d = "970" + d.slice(1);
    return d;
  }

  function statsTab() {
    var b = document.getElementById("haBody");
    var cApi = window.EduCoursesPro;
    var coursesList = (cApi && cApi.getList) ? cApi.getList() : [];
    var adsCount = slides().filter(function (x) { return x.active !== false; }).length;
    var booksCount = (window.EduBooks && window.EduBooks.list) ? window.EduBooks.list().length : 0;
    var localEnrolls = [];
    try { localEnrolls = JSON.parse(localStorage.getItem("edu_courses_enrollments_v191") || "[]") || []; } catch (e) {}

    function paint(enrolls) {
      var byCourse = {};
      enrolls.forEach(function (r) {
        var k = r.courseTitle || r.courseId || "غير محدد";
        byCourse[k] = (byCourse[k] || 0) + 1;
      });
      var topCourses = Object.keys(byCourse).map(function (k) { return [k, byCourse[k]]; }).sort(function (a, c) { return c[1] - a[1]; });
      var courseNames = Object.keys(byCourse);

      b.innerHTML =
        '<div class="space-y-3">' +
          '<div class="grid grid-cols-2 sm:grid-cols-4 gap-2">' +
            '<div class="p-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-center"><div class="text-xl font-black text-indigo-600 dark:text-indigo-300">' + coursesList.length + '</div><div class="text-[11px] font-bold">الدورات المتاحة</div></div>' +
            '<div class="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center"><div class="text-xl font-black text-emerald-600 dark:text-emerald-300">' + enrolls.length + '</div><div class="text-[11px] font-bold">إجمالي المسجّلين</div></div>' +
            '<div class="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-center"><div class="text-xl font-black text-amber-600 dark:text-amber-300">' + adsCount + '</div><div class="text-[11px] font-bold">الإعلانات النشطة</div></div>' +
            '<div class="p-3 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-center"><div class="text-xl font-black text-sky-600 dark:text-sky-300">' + booksCount + '</div><div class="text-[11px] font-bold">الكتب في البوابة</div></div>' +
          '</div>' +
          '<div class="p-3.5 rounded-2xl border border-rose-500/35 bg-rose-500/5 space-y-2">' +
            '<div class="text-xs font-black text-rose-700 dark:text-rose-300">📄 كشف أسماء المسجّلين الرسمي (PDF جاهز للطباعة مع عمود التوقيع)</div>' +
            '<div class="flex flex-wrap items-center gap-2">' +
              '<select id="haPdfCourseFilter" class="' + inp + ' !w-auto flex-1 min-w-[160px]"><option value="all">جميع الدورات (' + enrolls.length + ' متدرب)</option>' +
                courseNames.map(function (cn) { return '<option value="' + esc(cn) + '">' + esc(cn) + ' (' + byCourse[cn] + ')</option>'; }).join("") +
              '</select>' +
              '<button type="button" id="haExportPdfRoster" class="px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-black">📄 تصدير كشف PDF</button>' +
              '<button type="button" id="haExportCsvStats" class="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black">📥 CSV</button>' +
            '</div>' +
          '</div>' +
          '<div class="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 space-y-2">' +
            '<div class="text-xs font-black">📈 توزيع المسجّلين حسب الدورة</div>' +
            (topCourses.length ? topCourses.map(function (row) {
              var w = Math.max(8, Math.round((row[1] / Math.max(1, enrolls.length)) * 100));
              return '<div class="space-y-1"><div class="flex justify-between text-[11px] font-bold"><span class="truncate">' + esc(row[0]) + '</span><span class="text-sky-600 dark:text-sky-400">' + row[1] + ' متدرب</span></div><div class="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div style="width:' + w + '%;" class="h-full bg-sky-500"></div></div></div>';
            }).join("") : '<p class="text-[11px] text-slate-400">لا توجد تسجيلات دورات بعد.</p>') +
          '</div>' +
          '<div class="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 space-y-2">' +
            '<div class="text-xs font-black">🕒 أحدث طلبات التسجيل ومتابعة واتساب الفورية (' + Math.min(10, enrolls.length) + ')</div>' +
            (enrolls.slice(0, 10).map(function (r, idx) {
              return '<div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-1.5">' +
                '<div class="flex items-center justify-between gap-2 text-[11px]">' +
                  '<div class="min-w-0"><span class="font-black">' + esc(r.fullName || "متدرب") + '</span> — <span class="text-slate-500">' + esc(r.courseTitle || "") + '</span></div>' +
                  '<span class="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700">' + esc(r.city || r.phone || "") + '</span>' +
                '</div>' +
                '<div class="flex flex-wrap gap-1.5">' +
                  '<button type="button" data-wa-act="accept:' + idx + '" class="px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">✅ قبول + مجموعة</button>' +
                  '<button type="button" data-wa-act="remind:' + idx + '" class="px-2 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-black">⏰ تذكير بالموعد</button>' +
                  '<button type="button" data-wa-act="cert:' + idx + '" class="px-2 py-1 rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300 text-[10px] font-black">🏅 إرسال الشهادة</button>' +
                '</div>' +
              '</div>';
            }).join("") || '<p class="text-[11px] text-slate-400">سيظهر هنا أحدث المسجّلين فور تسجيل أول طالب.</p>') +
          '</div>' +
        '</div>';

      var pdfBtn = document.getElementById("haExportPdfRoster");
      if (pdfBtn) pdfBtn.onclick = function () {
        var fSel = document.getElementById("haPdfCourseFilter");
        exportEnrollmentsRosterPdf(enrolls, fSel ? fSel.value : "all");
      };
      var expBtn = document.getElementById("haExportCsvStats");
      if (expBtn) expBtn.onclick = function () {
        if (!enrolls.length) { showToast("لا توجد بيانات للتصدير بعد", "warning"); return; }
        var cols = ["ticketId", "fullName", "phone", "city", "role", "courseTitle", "paymentStatus", "status", "createdAt"];
        var csv = "\uFEFF" + cols.join(",") + "\n" + enrolls.map(function (r) {
          return cols.map(function (k) { return '"' + String(r[k] || "").replace(/"/g, '""') + '"'; }).join(",");
        }).join("\n");
        var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "EduTech_Stats_Enrollments.csv";
        a.click();
        showToast("تم تصدير ملف الإحصائيات CSV ✓", "success");
      };

      b.querySelectorAll("[data-wa-act]").forEach(function (wb) {
        wb.onclick = function () {
          var parts = wb.getAttribute("data-wa-act").split(":");
          var act = parts[0], r = enrolls[+parts[1]];
          if (!r) return;
          var ph = cleanWaPhone(r.phone);
          var cMatch = coursesList.filter(function (c) { return c.id === r.courseId || c.title === r.courseTitle; })[0];
          var grp = (cMatch && cMatch.groupUrl) ? ("\n🔗 رابط مجموعة الدورة: " + cMatch.groupUrl) : "";
          var msg = "";
          if (act === "accept") {
            msg = "مرحباً أ. " + (r.fullName || "") + " 🌿\nتم تأكيد قبول تسجيلك بنجاح في دورة «" + (r.courseTitle || "") + "» على منصة EduTech Mindset (رقم الطلب: " + (r.ticketId || "") + ")." + grp + "\nنتمنى لك رحلة تدريبية ممتعة ومفيدة!";
          } else if (act === "remind") {
            msg = "تذكير ودي أ. " + (r.fullName || "") + " ⏰\nنذكّرك بموعد انطلاق جلستنا التدريبية في دورة «" + (r.courseTitle || "") + "» — يسعدنا حضورك معنا على منصة EduTech Mindset!";
          } else {
            var vUrl = "https://edutech-mindset.pages.dev/?verify=" + encodeURIComponent(r.ticketId || "") + "&name=" + encodeURIComponent(r.fullName || "") + "&course=" + encodeURIComponent(r.courseTitle || "");
            msg = "مبارك أ. " + (r.fullName || "") + " 🏅\nنبارك لك إتمام دورة «" + (r.courseTitle || "") + "» بنجاح!\nرابط التحقق الرسمي من شهادتك المعتمدة:\n" + vUrl;
          }
          window.open("https://wa.me/" + ph + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
        };
      });
    }
    paint(localEnrolls);
    foot('<button type="button" class="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold" onclick="closeModal()">إغلاق</button>');
    try {
      if (window.firebase && firebase.firestore && window.Cloud && window.Cloud.isAdmin) {
        firebase.firestore().collection("courses_enrollments").orderBy("createdAt", "desc").limit(200).get().then(function (snap) {
          var arr = [];
          snap.forEach(function (d) { arr.push(d.data()); });
          if (arr.length) paint(arr);
        }).catch(function () {});
      }
    } catch (e) {}
  }

  function coursesTab() {
    var b = document.getElementById("haBody");
    var api = window.EduCoursesPro;
    var list = (api && typeof api.getList === "function") ? api.getList() : ((api && Array.isArray(api.list)) ? api.list : []);
    b.innerHTML =
      '<div class="space-y-3">' +
        '<div class="p-3.5 rounded-2xl bg-gradient-to-l from-indigo-950 to-slate-900 text-white border border-sky-400/30">' +
          '<div class="text-xs font-black text-amber-300">🎓 إدارة الدورات التدريبية والتسجيلات (' + list.length + ')</div>' +
          '<p class="text-[11px] text-slate-300 mt-1">أضف أو عدّل أو احذف أي دورة، وانسخ رابط التسجيل المباشر لدمجه في إعلانات الموقع أو إعلانات فيسبوك وواتساب.</p>' +
          '<div class="flex flex-wrap gap-2 mt-3">' +
            '<button type="button" id="haAddCourseBtn" class="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black">➕ إضافة دورة جديدة</button>' +
            '<button type="button" id="haOpenCoursesAdmin" class="px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-black">👑 لوحة المسجلين والأسعار</button>' +
            '<button type="button" id="haOpenCoursesHub" class="px-3.5 py-2 rounded-xl bg-sky-400 text-slate-950 text-xs font-black">🎓 معاينة البوابة</button>' +
          '</div>' +
        '</div>' +
        '<div class="space-y-2" id="haCoursesList">' +
          (list.length ? list.map(function (c) {
            return '<div class="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 space-y-2">' +
              '<div class="flex items-start justify-between gap-2">' +
                '<div class="min-w-0">' +
                  '<div class="text-xs font-black">' + esc(c.ico || c.icon || '🎓') + ' ' + esc(c.title) + '</div>' +
                  '<div class="text-[10.5px] text-slate-500 mt-0.5">' + esc(c.level || '') + ' • ' + esc(c.hours || '') + ' • ' + esc(c.price || 'مجانية') + '</div>' +
                '</div>' +
              '</div>' +
              '<div class="flex flex-wrap gap-1.5">' +
                '<button type="button" data-cop="copy" data-cid="' + esc(c.id) + '" class="px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300 text-[11px] font-black">🔗 نسخ رابط التسجيل</button>' +
                '<button type="button" data-cop="edit" data-cid="' + esc(c.id) + '" class="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[11px] font-black">✏️ تعديل</button>' +
                '<button type="button" data-cop="del" data-cid="' + esc(c.id) + '" class="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[11px] font-black">🗑️ حذف</button>' +
              '</div>' +
            '</div>';
          }).join("") : '<p class="text-xs text-slate-500 text-center py-4">لا توجد دورات حالياً — اضغط «إضافة دورة جديدة».</p>') +
        '</div>' +
      '</div>';
    foot('<button type="button" class="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold" onclick="closeModal()">إغلاق</button>');

    var btnAdd = document.getElementById("haAddCourseBtn");
    var btnA = document.getElementById("haOpenCoursesAdmin");
    var btnH = document.getElementById("haOpenCoursesHub");
    if (btnAdd) btnAdd.onclick = function () { courseForm(null); };
    if (btnA) btnA.onclick = function () { closeModal(); if (api) api.open("admin"); };
    if (btnH) btnH.onclick = function () { closeModal(); if (api) api.open("all"); };

    b.onclick = function (e) {
      var o = e.target.closest("[data-cop]");
      if (!o || !api) return;
      var op = o.dataset.cop, cid = o.dataset.cid;
      var item = list.filter(function (x) { return x.id === cid; })[0];
      if (op === "copy") {
        var url = api.getEnrollUrl ? api.getEnrollUrl(cid) : ("https://edutech-mindset.pages.dev/?enroll=" + encodeURIComponent(cid));
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () { showToast("تم نسخ رابط التسجيل المباشر ✓ شاركه في أي إعلان", "success"); });
        } else {
          window.prompt("انسخ رابط التسجيل المباشر:", url);
        }
      } else if (op === "edit" && item) {
        courseForm(item);
      } else if (op === "del") {
        if (!confirm("هل تريد حذف هذه الدورة نهائياً للجميع؟")) return;
        api.deleteCourse(cid).then(function () {
          showToast("تم حذف الدورة ✓", "success");
          coursesTab();
        }, bad);
      }
    };
  }

  function courseForm(c) {
    var isNew = !c;
    c = c || { title: "", cat: "ai", desc: "", hours: "12 ساعة", level: "مفتوح للجميع", price: "مجانية", icon: "🎓", groupUrl: "" };
    var b = document.getElementById("haBody");
    b.innerHTML =
      '<div class="space-y-2.5">' +
        '<div class="text-xs font-black text-sky-600 dark:text-sky-400">' + (isNew ? '➕ إضافة دورة تدريبية جديدة' : '✏️ تعديل الدورة') + '</div>' +
        '<input id="cfTitle" class="' + inp + '" placeholder="عنوان الدورة *" value="' + esc(c.title) + '">' +
        '<div class="grid grid-cols-2 gap-2">' +
          '<select id="cfCat" class="' + inp + '">' +
            '<option value="ai"' + (c.cat === "ai" ? " selected" : "") + '>🤖 الذكاء الاصطناعي</option>' +
            '<option value="tawjihi"' + (c.cat === "tawjihi" ? " selected" : "") + '>👑 مراجعات التوجيهي</option>' +
            '<option value="design"' + (c.cat === "design" ? " selected" : "") + '>🎨 التصميم التعليمي</option>' +
            '<option value="coding"' + (c.cat === "coding" ? " selected" : "") + '>💻 البرمجة والتقنية</option>' +
            '<option value="general"' + (c.cat === "general" ? " selected" : "") + '>📚 مهارات عامة</option>' +
          '</select>' +
          '<input id="cfIcon" class="' + inp + '" placeholder="أيقونة (مثال: 🎓)" value="' + esc(c.icon || c.ico || "🎓") + '">' +
        '</div>' +
        '<div class="grid grid-cols-3 gap-2">' +
          '<input id="cfHours" class="' + inp + '" placeholder="المدة (12 ساعة)" value="' + esc(c.hours || "") + '">' +
          '<input id="cfLevel" class="' + inp + '" placeholder="المستوى" value="' + esc(c.level || "") + '">' +
          '<input id="cfPrice" class="' + inp + '" placeholder="السعر (مجانية)" value="' + esc(c.price || "") + '">' +
        '</div>' +
        '<textarea id="cfDesc" rows="3" class="' + inp + '" placeholder="وصف مختصر للدورة ومحاورها">' + esc(c.desc || "") + '</textarea>' +
        '<input id="cfGroup" dir="ltr" class="' + inp + ' text-left" placeholder="رابط مجموعة واتساب أو تيليجرام بعد التسجيل (اختياري) https://..." value="' + esc(c.groupUrl || "") + '">' +
      '</div>';
    foot('<button type="button" id="cfBack" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">رجوع</button><button type="button" id="cfSave" class="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black">حفظ الدورة ✓</button>');
    document.getElementById("cfBack").onclick = coursesTab;
    document.getElementById("cfSave").onclick = function () {
      var title = v("cfTitle").trim();
      if (!title) { showToast("اكتب عنوان الدورة أولاً", "warning"); return; }
      var data = {
        title: title,
        cat: v("cfCat") || "ai",
        icon: v("cfIcon").trim() || "🎓",
        ico: v("cfIcon").trim() || "🎓",
        hours: v("cfHours").trim() || "10 ساعات",
        level: v("cfLevel").trim() || "مفتوح للجميع",
        price: v("cfPrice").trim() || "مجانية",
        desc: v("cfDesc").trim(),
        groupUrl: v("cfGroup").trim()
      };
      var api = window.EduCoursesPro;
      if (!api) return;
      var btn = document.getElementById("cfSave");
      if (btn) { btn.disabled = true; btn.textContent = "جارٍ الحفظ…"; }
      var p = isNew ? api.addCourse(data) : api.updateCourse(c.id, data);
      p.then(function () {
        showToast(isNew ? "تمت إضافة الدورة للجميع ✓" : "تم تحديث الدورة ✓", "success");
        coursesTab();
      }, function (err) {
        if (btn) { btn.disabled = false; btn.textContent = "حفظ الدورة ✓"; }
        bad(err);
      });
    };
  }

  function curriculumAdminTab() {
    var b = document.getElementById("haBody");
    var grades = ["الصف الأول", "الصف الثاني", "الصف الثالث", "الصف الرابع", "الصف الخامس", "الصف السادس", "الصف السابع", "الصف الثامن", "الصف التاسع", "الصف العاشر", "الحادي عشر", "التوجيهي — الثاني عشر"];
    var subjects = ["اللغة العربية", "الرياضيات", "العلوم والحياة", "اللغة الإنجليزية", "التربية الإسلامية", "الدراسات الاجتماعية", "التكنولوجيا والبرمجة", "الفيزياء", "الكيمياء", "العلوم الحياتية (الأحياء)", "الدراسات التاريخية", "الدراسات الجغرافية", "الثقافة العلمية", "المحاسبة والإدارة", "العلوم الشرعية والفقه"];
    var curBooks = [];
    try { curBooks = JSON.parse(localStorage.getItem("edu_custom_curr_books_v219") || "[]") || []; } catch (e) {}
    b.innerHTML =
      '<div class="space-y-3">' +
        '<div class="p-3.5 rounded-2xl bg-slate-900 text-white border border-sky-500/30 space-y-2">' +
          '<div class="text-xs font-black text-sky-300">📚 إضافة كتاب PDF أو درس فيديو لبوابة المناهج الموحّدة</div>' +
          '<div class="grid grid-cols-2 gap-2">' +
            '<select id="caGrade" class="' + inp + '">' + grades.map(function (g) { return '<option>' + g + '</option>'; }).join("") + '</select>' +
            '<select id="caSub" class="' + inp + '">' + subjects.map(function (s) { return '<option>' + s + '</option>'; }).join("") + '</select>' +
          '</div>' +
          '<div class="grid grid-cols-2 gap-2">' +
            '<select id="caTerm" class="' + inp + '"><option value="1">الفصل الأول</option><option value="2">الفصل الثاني</option><option value="">الفصلان معاً</option></select>' +
            '<select id="caKind" class="' + inp + '"><option value="book">📘 كتاب PDF</option><option value="video">🎬 فيديو شرح</option></select>' +
          '</div>' +
          '<input id="caTitle" class="' + inp + '" placeholder="العنوان (مثال: كتاب الرياضيات - الجزء الأول)">' +
          '<input id="caUrl" dir="ltr" class="' + inp + ' text-left" placeholder="https://... رابط PDF أو يوتيوب">' +
          '<button type="button" id="caSaveBtn" class="w-full py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black">حفظ ونشر للطلاب ✓</button>' +
        '</div>' +
        '<div class="text-xs font-black text-slate-500">الكتب المضافة حديثاً (' + curBooks.length + '):</div>' +
        '<div class="space-y-1.5">' +
          (curBooks.length ? curBooks.map(function (bk, idx) {
            return '<div class="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60">' +
              '<div class="min-w-0"><div class="text-xs font-extrabold truncate">📘 ' + esc(bk.title) + '</div><div class="text-[10px] text-slate-500">' + esc(bk.grade || "") + ' • ' + esc(bk.subject || "") + '</div></div>' +
              '<button type="button" data-ca-del="' + idx + '" class="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-600 text-[11px] font-black shrink-0">حذف</button>' +
            '</div>';
          }).join("") : '<p class="text-[11px] text-slate-400">يمكنك إضافة روابط الكتب الوزارية أو الفيديوهات من النموذج أعلاه وستظهر فوراً في بوابة الطالب.</p>') +
        '</div>' +
      '</div>';
    foot('<button type="button" class="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold" onclick="closeModal()">إغلاق</button>');

    var saveB = document.getElementById("caSaveBtn");
    if (saveB) saveB.onclick = function () {
      var title = v("caTitle").trim(), url = v("caUrl").trim(), grade = v("caGrade"), subject = v("caSub"), term = v("caTerm"), kind = v("caKind");
      if (!title || !/^https?:\/\//i.test(url)) { showToast("أدخل العنوان ورابطاً صحيحاً يبدأ بـ https://", "warning"); return; }
      var rec = { id: "ch" + kind + "-" + Date.now(), title: title, url: url, grade: grade, subject: subject, term: term, kind: kind };
      var col = kind === "video" ? "resources" : "books";
      if (kind === "book") {
        curBooks.unshift(rec);
        try { localStorage.setItem("edu_custom_curr_books_v219", JSON.stringify(curBooks)); } catch (e) {}
      }
      var p = (cloud() && window.Cloud.commit) ? window.Cloud.commit([{ col: col, id: rec.id, data: rec }]) : Promise.resolve();
      p.then(function () {
        showToast("تم الحفظ والنشر في بوابة المناهج ✓", "success");
        if (window.EduCurriculumHub && window.EduCurriculumHub.render) window.EduCurriculumHub.render();
        curriculumAdminTab();
      }, bad);
    };
    b.onclick = function (e) {
      var d = e.target.closest("[data-ca-del]");
      if (!d) return;
      var idx = +d.dataset.caDel;
      var rem = curBooks.splice(idx, 1)[0];
      try { localStorage.setItem("edu_custom_curr_books_v219", JSON.stringify(curBooks)); } catch (err) {}
      if (rem && rem.id && cloud() && window.Cloud.commit) window.Cloud.commit([{ col: "books", id: rem.id, remove: true }]).catch(function () {});
      if (window.EduCurriculumHub && window.EduCurriculumHub.render) window.EduCurriculumHub.render();
      curriculumAdminTab();
    };
  }
  function uploadImage(file) {
    if (window.EduMedia && window.EduMedia.ready()) return window.EduMedia.upload(file, "images");
    return compressImageFile(file, 1000, 110000);
  }
  function adForm(a) {
    var isNew = !a; a = a || { title: "", text: "", btn: "", link: "", images: [], active: true };
    var imgs = (a.images || []).slice(), canBig = !!(window.EduMedia && window.EduMedia.ready()), MAXI = canBig ? 12 : 4;
    var body = document.getElementById("haBody");
    body.innerHTML = '<div class="space-y-2"><input id="adT" class="' + inp + '" placeholder="عنوان الإعلان" value="' + esc(a.title) + '"><textarea id="adX" rows="3" class="' + inp + '" placeholder="نص الإعلان">' + esc(a.text) + '</textarea>' +
      '<div class="grid grid-cols-2 gap-2"><input id="adB" class="' + inp + '" placeholder="نص الزر (مثال: سجّل الآن)" value="' + esc(a.btn) + '"><input id="adL" list="haSections" dir="ltr" class="' + inp + ' text-left" placeholder="رابط الزر" value="' + esc(a.link) + '"></div>' +
      '<div class="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30"><label class="block text-[11px] font-black text-indigo-700 dark:text-indigo-300 mb-1">🎓 ربط الإعلان بتسجيل دورة مباشرة (اختياري):</label><select id="adCoursePick" class="' + inp + '"><option value="">— اختر دورة لربط زر الإعلان باستمارة التسجيل —</option>' + (((window.EduCoursesPro && window.EduCoursesPro.getList) ? window.EduCoursesPro.getList() : []).map(function (c) { return '<option value="#enroll:' + esc(c.id) + '"' + (a.link === ("#enroll:" + c.id) ? " selected" : "") + '>' + esc(c.ico || c.icon || "🎓") + ' ' + esc(c.title) + '</option>'; }).join("")) + '</select></div>' +
      '<div><div class="text-[11px] font-bold mb-1">الصور (تتبدل تلقائياً — حتى ' + MAXI + ')</div><div id="adImgs" class="flex flex-wrap gap-2"></div>' +
      '<div class="mt-2 flex flex-wrap gap-2 items-center"><label class="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-[11px] font-bold cursor-pointer"><i class="fa-solid fa-image ml-1"></i>رفع صور<input id="adF" type="file" accept="image/*" multiple class="hidden"></label><input id="adU" dir="ltr" class="' + inp + ' !w-56 text-left" placeholder="أو الصق رابط صورة https://"><button type="button" id="adUAdd" class="' + mini + '">إضافة</button></div>' +
      (canBig ? "" : '<p class="text-[10px] text-amber-600 mt-1">الصور تُضغط وتُحفظ داخل قاعدة البيانات. بعد تفعيل التخزين (R2) يزول هذا الحد.</p>') + '</div>' +
      '<label class="flex items-center gap-2 text-xs font-bold"><input id="adA" type="checkbox" ' + (a.active === false ? "" : "checked") + '> الإعلان ظاهر للزوار</label></div>';
    function drawImgs() {
      var c = document.getElementById("adImgs");
      c.innerHTML = imgs.map(function (s, i) { return '<div class="relative w-24 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700"><img src="' + esc(s) + '" class="w-full h-full object-cover"><button type="button" data-rm="' + i + '" class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px]">✕</button>' + (i ? '<button type="button" data-mv="' + i + '" class="absolute bottom-0.5 left-0.5 w-5 h-5 rounded-full bg-black/60 text-white text-[10px]">→</button>' : "") + '</div>'; }).join("") || '<span class="text-[10px] text-slate-400">بدون صور — سيظهر الإعلان بخلفية ملوّنة.</span>';
    }
    drawImgs();
    var cPick = document.getElementById("adCoursePick");
    if (cPick) cPick.addEventListener("change", function () {
      if (!cPick.value) return;
      var lInp = document.getElementById("adL"), bInp = document.getElementById("adB");
      if (lInp) lInp.value = cPick.value;
      if (bInp && !bInp.value.trim()) bInp.value = "سجّل الآن";
    });
    document.getElementById("adImgs").addEventListener("click", function (e) { var r = e.target.closest("[data-rm]"), m = e.target.closest("[data-mv]"); if (r) imgs.splice(+r.dataset.rm, 1); else if (m) { var k = +m.dataset.mv, t = imgs[k - 1]; imgs[k - 1] = imgs[k]; imgs[k] = t; } else return; drawImgs(); });
    document.getElementById("adF").addEventListener("change", function (e) {
      var files = Array.prototype.slice.call(e.target.files); if (!files.length) return;
      showToast("جارٍ معالجة الصور…", "info");
      files.reduce(function (p, f) { return p.then(function () { if (imgs.length >= MAXI) return; return uploadImage(f).then(function (d) { imgs.push(d); drawImgs(); }, function () { showToast("تعذر رفع صورة (قد تكون كبيرة)", "warning"); }); }); }, Promise.resolve());
    });
    document.getElementById("adUAdd").addEventListener("click", function () { var u = v("adU").trim(); if (/^https?:\/\//i.test(u) && imgs.length < MAXI) { imgs.push(u); document.getElementById("adU").value = ""; drawImgs(); } });
    foot('<button type="button" id="adBack" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">رجوع</button><button type="button" id="adSave" class="px-5 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold">حفظ الإعلان</button>');
    document.getElementById("adBack").addEventListener("click", adsTab);
    if (cloud() && (!window.Cloud.user || !window.Cloud.isAdmin)) {
      var warn = document.createElement("div");
      warn.className = "mb-2 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-[11px] font-bold text-amber-700 dark:text-amber-300 flex flex-wrap items-center justify-between gap-2";
      warn.innerHTML = '<span>⚠️ للحفظ في السحابة للجميع يلزم تسجيل الدخول بحساب Google المعتمد للإدارة.</span>' +
        '<button type="button" id="adGoogleSignInBtn" class="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-[11px]">دخول Google</button>';
      body.insertBefore(warn, body.firstChild);
      var gBtn = document.getElementById("adGoogleSignInBtn");
      if (gBtn) gBtn.onclick = function () {
        if (window.Cloud && typeof window.Cloud.signIn === "function") {
          window.Cloud.signIn().then(function () { showToast("تم تسجيل الدخول ✓ جرّب حفظ الإعلان الآن", "success"); warn.remove(); }).catch(function () {});
        }
      };
    }
    document.getElementById("adSave").addEventListener("click", function () {
      if (!v("adT").trim() && !v("adX").trim() && !imgs.length) { showToast("اكتب نصاً أو أضف صورة", "warning"); return; }
      var l = slides(), data = { title: v("adT").trim(), text: v("adX").trim(), btn: v("adB").trim(), link: v("adL").trim(), images: imgs, active: document.getElementById("adA").checked, order: isNew ? (l.length ? (l[l.length - 1].order || l.length) + 1 : 1) : (a.order || 0) };
      var approxBytes = 0;
      try { approxBytes = new Blob([JSON.stringify(data)]).size; } catch (e) { approxBytes = JSON.stringify(data).length; }
      if (cloud() && approxBytes > 880000) {
        showToast("حجم صور الإعلان (" + Math.round(approxBytes / 1024) + "KB) قريب من حد السحابة (1MB) — احذف صورة أو الصق رابط صورة خارجي", "warning");
        return;
      }
      var btnSave = document.getElementById("adSave");
      if (btnSave) { btnSave.disabled = true; btnSave.textContent = "جارٍ الحفظ…"; }
      saveSlides([{ id: isNew ? uid("slide-") : a.id, data: data }]).then(function () {
        showToast("تم حفظ الإعلان للجميع ✓", "success");
        setTimeout(adsTab, 250);
      }, function () {
        if (btnSave) { btnSave.disabled = false; btnSave.textContent = "حفظ الإعلان"; }
      });
    });
  }

  // --- تبويب فيديوهات الأعلى ---
  var vidDraft = [];
  function videosTab() {
    vidDraft = clone(home.topVideos || []); vidRows();
    foot('<button type="button" id="vdSave" class="px-5 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold">حفظ الفيديوهات</button>');
    document.getElementById("vdSave").addEventListener("click", function () {
      readVids(); var out = vidDraft.filter(function (x) { return x.title.trim() && LV().parseVideo(x.url).kind !== "none"; });
      saveHome(Object.assign({}, home, { topVideos: out })).then(function () { closeModal(); showToast("تم حفظ الفيديوهات ✓", "success"); });
    });
  }
  function vidRows() {
    var b = document.getElementById("haBody");
    b.innerHTML = '<p class="text-[11px] text-slate-500 mb-3">تظهر في أعلى الصفحة وتعمل صامتة بمجرد مرور الزائر عليها، وبالنقر تُفتح كبيرة مع الصوت. الصق رابط يوتيوب أو رابط ملف mp4.</p><div class="space-y-2" id="vdList">' + vidDraft.map(function (x, i) {
      return '<div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-2.5 space-y-1.5" data-vi="' + i + '"><input class="' + inp + '" data-f="title" placeholder="عنوان الفيديو" value="' + esc(x.title) + '"><input dir="ltr" class="' + inp + ' text-left" data-f="url" placeholder="https://youtu.be/... أو رابط mp4" value="' + esc(x.url) + '">' +
        '<div class="flex gap-1.5 items-center">' + (window.EduMedia && window.EduMedia.ready() ? '<label class="' + mini + ' cursor-pointer"><i class="fa-solid fa-upload ml-1"></i>رفع mp4<input type="file" accept="video/mp4,video/webm" class="hidden" data-vup="' + i + '"></label>' : "") + '<button type="button" data-vop="up" data-i="' + i + '" class="' + mini + '"><i class="fa-solid fa-arrow-up"></i></button><button type="button" data-vop="down" data-i="' + i + '" class="' + mini + '"><i class="fa-solid fa-arrow-down"></i></button><button type="button" data-vop="del" data-i="' + i + '" class="' + mini + ' !text-rose-500"><i class="fa-solid fa-trash"></i></button></div></div>';
    }).join("") + '</div><button type="button" data-vop="add" class="mt-3 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"><i class="fa-solid fa-plus ml-1"></i>إضافة فيديو</button>';
    b.onchange = function (e) {
      var f = e.target.closest("[data-vup]"); if (!f || !f.files[0]) return; readVids(); var i = +f.dataset.vup;
      window.EduMedia.upload(f.files[0], "video").then(function (url) { vidDraft[i].url = url; if (!vidDraft[i].title) vidDraft[i].title = f.files[0].name.replace(/\.[^.]+$/, ""); vidRows(); showToast("تم رفع الفيديو ✓", "success"); }, function () {});
    };
    b.onclick = function (e) {
      var o = e.target.closest("[data-vop]"); if (!o) return; readVids();
      var op = o.dataset.vop, i = +o.dataset.i, a = vidDraft;
      function sw(x, y) { if (y < 0 || y >= a.length) return; var t = a[x]; a[x] = a[y]; a[y] = t; }
      if (op === "add") a.push({ id: uid("tv"), title: "", url: "" }); else if (op === "up") sw(i, i - 1); else if (op === "down") sw(i, i + 1); else if (op === "del") a.splice(i, 1);
      vidRows();
    };
  }
  function readVids() { document.querySelectorAll("#vdList [data-vi]").forEach(function (el) { var x = vidDraft[+el.dataset.vi]; if (x) { x.title = el.querySelector('[data-f="title"]').value; x.url = el.querySelector('[data-f="url"]').value.trim(); } }); }

  // ---------- الهوية والصور والألوان الشاملة ----------
  var KEEP = {};
  function applySite() {
    var site = home.site || {};
    var logo = site.logo || "assets/logo.png";
    document.querySelectorAll('img[src*="assets/logo.png"], img[data-orig-logo]').forEach(function (im) {
      if (im.id === "mgrCardImg") return;
      im.setAttribute("data-orig-logo", "1");
      if (im.getAttribute("src") !== logo) im.setAttribute("src", logo);
    });
    document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]').forEach(function (l) {
      if (l.getAttribute("href") !== logo) l.setAttribute("href", logo);
    });

    var heroIm = document.querySelector('img[src*="assets/asset_2.jpeg"], img[data-orig-hero]');
    if (heroIm) {
      heroIm.setAttribute("data-orig-hero", "1");
      var hSrc = site.heroImg || "assets/asset_2.jpeg";
      if (heroIm.getAttribute("src") !== hSrc) heroIm.setAttribute("src", hSrc);
    }

    var mgrIm = document.querySelector('#about .lg\\:col-span-4 img');
    if (mgrIm) {
      mgrIm.id = "mgrCardImg";
      var mSrc = site.mgrImg || site.logo || "assets/logo.png";
      if (mgrIm.getAttribute("src") !== mSrc) mgrIm.setAttribute("src", mSrc);
    }

    var heroSec = document.getElementById("hero");
    if (heroSec) {
      if (site.heroBgImg) {
        heroSec.style.backgroundImage = "linear-gradient(to bottom, rgba(5,19,34,0.78), rgba(5,19,34,0.92)), url('" + site.heroBgImg + "')";
        heroSec.style.backgroundSize = "cover";
        heroSec.style.backgroundPosition = "center";
      } else {
        heroSec.style.backgroundImage = "";
        heroSec.style.backgroundSize = "";
      }
    }

    var customVisualCss = document.getElementById("eduSiteCustomVisuals");
    if (!customVisualCss) {
      customVisualCss = document.createElement("style");
      customVisualCss.id = "eduSiteCustomVisuals";
      document.head.appendChild(customVisualCss);
    }
    var rules = [];
    if (site.pageBgColor) {
      rules.push("body, #appMobileShell { background-color: " + site.pageBgColor + " !important; }");
    }
    if (site.pageBgImg) {
      rules.push("body, #appMobileShell { background-image: linear-gradient(to bottom, rgba(5,19,34,0.86), rgba(5,19,34,0.94)), url('" + site.pageBgImg + "') !important; background-size: cover !important; background-attachment: fixed !important; background-position: center !important; }");
    }
    if (site.headerBgColor) {
      rules.push("header.glass-nav { background: " + site.headerBgColor + " !important; }");
    }
    if (site.cardBgColor) {
      rules.push(".glass-card { background: " + site.cardBgColor + " !important; }");
    }
    if (site.titleColor) {
      rules.push("#heroNameText { background: none !important; -webkit-text-fill-color: " + site.titleColor + " !important; color: " + site.titleColor + " !important; }");
    }
    customVisualCss.textContent = rules.join("\n");

    if (site.themeConfig && window.applySiteTheme) {
      window.applySiteTheme(site.themeConfig);
    }

    function txt(id, val) {
      var el = document.getElementById(id); if (!el) return;
      if (KEEP[id] === undefined) KEEP[id] = el.innerHTML;
      if (val) { if (el.textContent !== val) el.textContent = val; } else if (el.innerHTML !== KEEP[id]) el.innerHTML = KEEP[id];
    }
    txt("brandLine1", site.brand1);
    txt("brandLine2", site.brand2);
    txt("heroDescText", site.heroDesc);
    txt("heroTagText", site.heroBadge);
    txt("mgrCardTitle", site.mgrBioTitle);
  }

  function themeTab() {
    var site = clone(home.site || {});
    var thmCfg = clone(site.themeConfig || (window.appState && appState.themeConfig) || window.DEFAULT_THEME_CONFIG || {});
    var b = document.getElementById("haBody");
    var themeHtml = (window.ThemeAdmin && window.ThemeAdmin.html) ? window.ThemeAdmin.html(thmCfg) : "";

    b.innerHTML =
      '<div class="space-y-4">' +
        '<div class="p-3.5 rounded-2xl bg-gradient-to-l from-indigo-500/15 via-brand-500/10 to-amber-500/10 border border-brand-500/30 text-xs font-bold leading-relaxed">' +
          '🎨 <b>استوديو الألوان والخلفية وصور المظهر الشامل:</b> تحكّم من هنا في ألوان المنصة، لون الخلفية، لون البطاقات، لون الترويسة، وصورة خلفية الموقع الكاملة. عند الحفظ تظهر التغييرات فوراً لجميع الزوار.' +
        '</div>' +
        '<div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3">' +
          '<div class="text-xs font-black text-brand-600 dark:text-sky-400">🖌️ تحكم دقيق بألوان الأسطح والخلفية والعناوين (اختياري)</div>' +
          '<div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">' +
            '<div class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">' +
              '<label class="block text-[10px] font-extrabold mb-1">لون خلفية الموقع</label>' +
              '<div class="flex items-center gap-1.5"><input type="color" id="stBgCol" value="' + esc(site.pageBgColor || "#051322") + '" class="w-8 h-7 rounded cursor-pointer"><button type="button" data-clr="pageBgColor" class="text-[10px] text-rose-500 font-bold">افتراضي</button></div>' +
            '</div>' +
            '<div class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">' +
              '<label class="block text-[10px] font-extrabold mb-1">لون الشريط العلوي</label>' +
              '<div class="flex items-center gap-1.5"><input type="color" id="stHdrCol" value="' + esc(site.headerBgColor || "#081b2e") + '" class="w-8 h-7 rounded cursor-pointer"><button type="button" data-clr="headerBgColor" class="text-[10px] text-rose-500 font-bold">افتراضي</button></div>' +
            '</div>' +
            '<div class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">' +
              '<label class="block text-[10px] font-extrabold mb-1">لون البطاقات</label>' +
              '<div class="flex items-center gap-1.5"><input type="color" id="stCardCol" value="' + esc(site.cardBgColor || "#0b2138") + '" class="w-8 h-7 rounded cursor-pointer"><button type="button" data-clr="cardBgColor" class="text-[10px] text-rose-500 font-bold">افتراضي</button></div>' +
            '</div>' +
            '<div class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">' +
              '<label class="block text-[10px] font-extrabold mb-1">لون العنوان الكبير</label>' +
              '<div class="flex items-center gap-1.5"><input type="color" id="stTitleCol" value="' + esc(site.titleColor || "#38bdf8") + '" class="w-8 h-7 rounded cursor-pointer"><button type="button" data-clr="titleColor" class="text-[10px] text-rose-500 font-bold">متدرج</button></div>' +
            '</div>' +
          '</div>' +
          '<div class="pt-2 border-t border-slate-200 dark:border-slate-700">' +
            '<label class="block text-[11px] font-black mb-1">🖼️ صورة خلفية عامة للموقع (تظهر خلف المحتوى بتعتيم أنيق — اختياري):</label>' +
            '<div class="flex flex-wrap items-center gap-2">' +
              '<label class="px-3 py-1.5 rounded-xl bg-brand-600 text-white text-[11px] font-bold cursor-pointer"><i class="fa-solid fa-upload ml-1"></i>رفع صورة خلفية<input id="stPageBgFile" type="file" accept="image/*" class="hidden"></label>' +
              '<input id="stPageBgUrl" dir="ltr" class="' + inp + ' !w-52 text-left" placeholder="أو الصق رابط صورة https://..." value="' + esc(site.pageBgImg || "") + '">' +
              '<button type="button" id="stPageBgClear" class="' + mini + ' !text-rose-500">إزالة الخلفية</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        themeHtml +
      '</div>';

    if (window.ThemeAdmin && window.ThemeAdmin.bind) {
      window.ThemeAdmin.bind(thmCfg);
    }

    document.getElementById("stBgCol").oninput = function () { site.pageBgColor = this.value; home.site = site; applySite(); };
    document.getElementById("stHdrCol").oninput = function () { site.headerBgColor = this.value; home.site = site; applySite(); };
    document.getElementById("stCardCol").oninput = function () { site.cardBgColor = this.value; home.site = site; applySite(); };
    document.getElementById("stTitleCol").oninput = function () { site.titleColor = this.value; home.site = site; applySite(); };

    b.querySelectorAll("[data-clr]").forEach(function (btn) {
      btn.onclick = function () {
        delete site[btn.getAttribute("data-clr")];
        home.site = site;
        applySite();
        showToast("تمت استعادة اللون الافتراضي لهذه الخانة ✓", "info");
      };
    });

    document.getElementById("stPageBgFile").onchange = function (e) {
      var f = e.target.files[0]; if (!f) return;
      showToast("⏳ جارٍ معالجة صورة الخلفية…", "info");
      uploadImage(f).then(function (u) {
        site.pageBgImg = u;
        document.getElementById("stPageBgUrl").value = u;
        home.site = site;
        applySite();
        showToast("تم تطبيق صورة الخلفية — اضغط حفظ لاعتمادها ✓", "success");
      });
    };

    document.getElementById("stPageBgUrl").onchange = function () {
      site.pageBgImg = this.value.trim();
      home.site = site;
      applySite();
    };

    document.getElementById("stPageBgClear").onclick = function () {
      delete site.pageBgImg;
      document.getElementById("stPageBgUrl").value = "";
      home.site = site;
      applySite();
    };

    foot('<button type="button" id="thmSaveAll" class="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-black shadow-md">حفظ المظهر والألوان للجميع ✓</button>');
    document.getElementById("thmSaveAll").onclick = function () {
      if (window.ThemeAdmin && window.ThemeAdmin.read) window.ThemeAdmin.read(thmCfg);
      site.themeConfig = thmCfg;
      if (window.appState) {
        appState.themeConfig = clone(thmCfg);
        if (typeof saveState === "function") saveState();
      }
      if (window.applySiteTheme) window.applySiteTheme(thmCfg);
      saveHome(Object.assign({}, home, { site: site })).then(function () {
        closeModal();
        showToast("تم حفظ ونشر المظهر والألوان لجميع الزوار ✓", "success");
      });
    };
  }

  function identityTab() {
    var site = clone(home.site || {});
    var ready = window.EduMedia && window.EduMedia.ready();
    var D = (typeof DEFAULT_DATA !== "undefined") ? DEFAULT_DATA : {};
    var logoNow = site.logo || "assets/logo.png";
    var heroImgNow = site.heroImg || "assets/asset_2.jpeg";
    var mgrImgNow = site.mgrImg || logoNow;

    document.getElementById("haBody").innerHTML =
      '<div class="space-y-4">' +
        '<div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3">' +
          '<div class="text-xs font-black text-brand-600 dark:text-sky-400">🖼️ التحكم الكامل بصور وشعارات الموقع</div>' +
          '<div class="flex flex-wrap items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">' +
            '<div class="w-16 h-16 rounded-2xl bg-white border border-slate-200 p-1 shrink-0"><img id="idLogoPrev" src="' + esc(logoNow) + '" class="w-full h-full object-contain"></div>' +
            '<div class="flex-1 min-w-[180px] space-y-1">' +
              '<div class="text-xs font-black">1. شعار المنصة الرسمي (Logo)</div>' +
              '<div class="flex flex-wrap gap-1.5">' +
                '<label class="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-[11px] font-bold cursor-pointer"><i class="fa-solid fa-image ml-1"></i>رفع شعار<input id="idLogoFile" type="file" accept="image/*" class="hidden"></label>' +
                '<button type="button" id="idLogoReset" class="' + mini + '">الأصلي</button>' +
              '</div>' +
              '<input id="idLogoUrl" dir="ltr" class="' + inp + ' text-left !py-1" placeholder="أو الصق رابط صورة الشعار https://..." value="' + esc(site.logo || "") + '">' +
            '</div>' +
          '</div>' +
          '<div class="flex flex-wrap items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">' +
            '<div class="w-24 h-16 rounded-xl bg-slate-900 border border-slate-200 overflow-hidden shrink-0"><img id="idHeroPrev" src="' + esc(heroImgNow) + '" class="w-full h-full object-cover"></div>' +
            '<div class="flex-1 min-w-[180px] space-y-1">' +
              '<div class="text-xs font-black">2. صورة الواجهة الرئيسية (Hero Banner)</div>' +
              '<div class="flex flex-wrap gap-1.5">' +
                '<label class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold cursor-pointer"><i class="fa-solid fa-camera ml-1"></i>رفع صورة الواجهة<input id="idHeroFile" type="file" accept="image/*" class="hidden"></label>' +
                '<button type="button" id="idHeroReset" class="' + mini + '">الأصلية</button>' +
              '</div>' +
              '<input id="idHeroUrl" dir="ltr" class="' + inp + ' text-left !py-1" placeholder="أو الصق رابط صورة الواجهة https://..." value="' + esc(site.heroImg || "") + '">' +
            '</div>' +
          '</div>' +
          '<div class="flex flex-wrap items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">' +
            '<div class="w-16 h-16 rounded-2xl bg-white border border-slate-200 overflow-hidden p-1 shrink-0"><img id="idMgrPrev" src="' + esc(mgrImgNow) + '" class="w-full h-full object-cover rounded-xl"></div>' +
            '<div class="flex-1 min-w-[180px] space-y-1">' +
              '<div class="text-xs font-black">3. صورة بطاقة المشرف العام (في قسم من نحن)</div>' +
              '<div class="flex flex-wrap gap-1.5">' +
                '<label class="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold cursor-pointer"><i class="fa-solid fa-user-tie ml-1"></i>رفع صورة المشرف<input id="idMgrFile" type="file" accept="image/*" class="hidden"></label>' +
                '<button type="button" id="idMgrReset" class="' + mini + '">افتراضي</button>' +
              '</div>' +
              '<input id="idMgrUrl" dir="ltr" class="' + inp + ' text-left !py-1" placeholder="أو الصق رابط صورة المشرف https://..." value="' + esc(site.mgrImg || "") + '">' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2.5">' +
          '<div class="text-xs font-black text-brand-600 dark:text-sky-400">✍️ نصوص وعناوين المنصة الرئيسية</div>' +
          '<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">' +
            '<div><label class="block text-[11px] font-bold mb-1">الاسم بجانب الشعار (رأس الصفحة)</label><input id="idB1" class="' + inp + '" placeholder="EduTech Mindset" value="' + esc(site.brand1 || "") + '"></div>' +
            '<div><label class="block text-[11px] font-bold mb-1">الوصف تحت الشعار</label><input id="idB2" class="' + inp + '" placeholder="عقلية التعليم والتكنولوجيا" value="' + esc(site.brand2 || "") + '"></div>' +
          '</div>' +
          '<label class="block text-[11px] font-bold">شارة الترحيب أعلى العنوان (مثال: نصنع الأمل بالعلم من غزة ✨)</label><input id="idBadge" class="' + inp + '" value="' + esc(site.heroBadge || "نصنع الأمل بالعلم من غزة ✨") + '">' +
          '<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">' +
            '<div><label class="block text-[11px] font-bold mb-1">العنوان العربي الكبير</label><input id="idTag" class="' + inp + '" value="' + esc(appState.tag || D.tag || "") + '"></div>' +
            '<div><label class="block text-[11px] font-bold mb-1">العنوان الإنجليزي</label><input id="idName" class="' + inp + '" value="' + esc(appState.name || D.name || "") + '"></div>' +
          '</div>' +
          '<label class="block text-[11px] font-bold">اسم المشرف العام</label><input id="idMgr" class="' + inp + '" value="' + esc(appState.mgr || D.mgr || "") + '">' +
          '<label class="block text-[11px] font-bold">الوصف التعريفي تحت العنوان</label><textarea id="idDesc" rows="3" class="' + inp + '">' + esc(site.heroDesc || "") + '</textarea>' +
          '<label class="block text-[11px] font-bold">نبذة قسم «من نحن»</label><textarea id="idAbout" rows="4" class="' + inp + '" placeholder="كل سطر فقرة مستقلة">' + esc(appState.about || D.about || "") + '</textarea>' +
        '</div>' +
      '</div>';

    document.getElementById("idLogoFile").addEventListener("change", function (e) {
      var f = e.target.files[0]; if (!f) return;
      var job = ready ? window.EduMedia.upload(f, "images") : compressImageFile(f, 512, 110000);
      Promise.resolve(job).then(function (u) { site.logo = u; document.getElementById("idLogoPrev").src = u; document.getElementById("idLogoUrl").value = u; showToast("تم اختيار الشعار — اضغط حفظ", "info"); }, function () { showToast("تعذر معالجة الصورة", "warning"); });
    });
    document.getElementById("idLogoReset").addEventListener("click", function () { delete site.logo; document.getElementById("idLogoPrev").src = "assets/logo.png"; document.getElementById("idLogoUrl").value = ""; });

    document.getElementById("idHeroFile").addEventListener("change", function (e) {
      var f = e.target.files[0]; if (!f) return;
      showToast("⏳ جارٍ معالجة صورة الواجهة…", "info");
      var job = ready ? window.EduMedia.upload(f, "images") : compressImageFile(f, 1280, 160000);
      Promise.resolve(job).then(function (u) { site.heroImg = u; document.getElementById("idHeroPrev").src = u; document.getElementById("idHeroUrl").value = u; showToast("تم اختيار صورة الواجهة — اضغط حفظ ✓", "success"); }, function () { showToast("تعذر معالجة الصورة", "warning"); });
    });
    document.getElementById("idHeroReset").addEventListener("click", function () { delete site.heroImg; document.getElementById("idHeroPrev").src = "assets/asset_2.jpeg"; document.getElementById("idHeroUrl").value = ""; });

    document.getElementById("idMgrFile").addEventListener("change", function (e) {
      var f = e.target.files[0]; if (!f) return;
      var job = ready ? window.EduMedia.upload(f, "images") : compressImageFile(f, 600, 120000);
      Promise.resolve(job).then(function (u) { site.mgrImg = u; document.getElementById("idMgrPrev").src = u; document.getElementById("idMgrUrl").value = u; showToast("تم اختيار صورة المشرف — اضغط حفظ ✓", "success"); }, function () { showToast("تعذر معالجة الصورة", "warning"); });
    });
    document.getElementById("idMgrReset").addEventListener("click", function () { delete site.mgrImg; document.getElementById("idMgrPrev").src = site.logo || "assets/logo.png"; document.getElementById("idMgrUrl").value = ""; });

    foot('<button type="button" id="idSave" class="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-black shadow-md">حفظ الهوية والصور للجميع ✓</button>');
    document.getElementById("idSave").addEventListener("click", function () {
      if (v("idLogoUrl").trim()) site.logo = v("idLogoUrl").trim();
      if (v("idHeroUrl").trim()) site.heroImg = v("idHeroUrl").trim();
      if (v("idMgrUrl").trim()) site.mgrImg = v("idMgrUrl").trim();
      site.brand1 = v("idB1").trim();
      site.brand2 = v("idB2").trim();
      site.heroBadge = v("idBadge").trim();
      site.heroDesc = v("idDesc").trim();
      appState.tag = v("idTag").trim() || D.tag;
      appState.name = v("idName").trim() || D.name;
      appState.mgr = v("idMgr").trim() || D.mgr;
      appState.about = v("idAbout").trim() || D.about;
      try { saveState(); if (typeof fullRender === "function") fullRender(); } catch (e) {}
      saveHome(Object.assign({}, home, { site: site })).then(function () { closeModal(); showToast("تم حفظ الهوية والصور بنجاح ✓", "success"); });
    });
  }

  // ---------- الأقسام: إظهار / إخفاء / ترتيب ----------
  var SEC = [["hero", "الغلاف (بداية الصفحة)"], ["unifiedWorkflowStudio", "غرفة العمليات التعليمية الموحّدة"], ["parentPortalStudio", "بوابة ولي الأمر ومتابعة الأبناء"], ["publicHubStudio", "بوابة الجمهور العام والمجتمع"], ["lessonKitStudio", "حقيبة الحصة الجاهزة"], ["reviewStudio", "المراجعة الذكية بالتكرار المتباعد"], ["weeklyPlannerStudio", "المخطط الأسبوعي الذكي"], ["userWorkspaceSection", "مساحتي الشخصية"], ["generator", "مولّد البرومبتات"], ["edtechLabSection", "مختبر التكنولوجيا"], ["teacherTools", "أدوات المعلم"], ["aiStudio", "استوديو الذكاء الاصطناعي"], ["slidesStudio", "مولّد العروض التقديمية"], ["whiteboardStudio", "السبورة التفاعلية الذكية للمعلم"], ["langLabStudio", "معمل اللغات والنطق الذكي والإملاء"], ["parentsStudio", "تقارير أولياء الأمور وبطاقة المتابعة"], ["worksheetStudio", "مولّد أوراق العمل والاختبارات"], ["homeworkStudio", "نظام الواجبات المصوّرة وتصحيح الدفاتر"], ["storiesStudio", "استوديو القصص التعليمية المصوّرة"], ["analyticsStudio", "مرصد إحصاءات المنهاج وتقرير الإنجاز"], ["gamesStudio", "مولّد الألعاب التربوية التفاعلية"], ["tutorStudio", "المعلم الخصوصي الذكي والخرائط الذهنية"], ["classroomsStudio", "الفصول الافتراضية وبوابة الطالب"], ["lessonPlanStudio", "مولّد خطط الدروس"], ["designStudio", "مولّد الإنفوغرافيك والبوسترات"], ["certStudio", "مولّد الشهادات الجماعية"], ["simLabStudio", "مختبر التجارب العلمية التفاعلية"], ["atlasStudio", "أطلس فلسطين الجغرافي والتاريخي التفاعلي"], ["radioStudio", "استوديو الإذاعة المدرسية والمسابقات الثقافية"], ["mediaToolsStudio", "استوديو ضغط الصور ودمجها في PDF محلياً"], ["codingLabStudio", "أكاديمية البرمجة والتكنولوجيا والروبوتكس"], ["rubricsStudio", "أوراق التظليل الاختبارية وسلالم التقدير"], ["classToolsStudio", "حقيبة إدارة الصف والجدول المدرسي"], ["teacherDash", "لوحة المعلم"], ["portfolioStudio", "ملف الإنجاز المهني للمعلم والخطط العلاجية"], ["inclusiveStudio", "استوديو التعليم الدامج والدعم النفسي"], ["sciCalcStudio", "الآلة الحاسبة العلمية وموسوعة القوانين"], ["learnSection", "المراحل الدراسية"], ["tawjihiStudio", "بوابة التوجيهي وحاسبة المعدل الفلسطيني"], ["earlyLearnStudio", "استوديو التأسيس المبكر والصفوف الدنيا (1-4)"], ["offPackStudio", "حقيبة المذاكرة المحمولة بلا إنترنت"], ["booksSection", "الكتب والمناهج"], ["arSection", "الواقع المعزز"], ["library", "المكتبة التعليمية"], ["modsSection", "المشرفون"], ["quickLinksSection", "البطاقات السريعة"], ["social", "حساباتنا"], ["about", "من نحن"]];
  var TOP = [["homeAds", "شريط الإعلانات"], ["homeVideos", "فيديوهات الأعلى"]];
  function secList() {
    var saved = (home.sections || []).slice(), have = {};
    saved.forEach(function (x) { have[x.id] = 1; });
    SEC.concat(TOP).forEach(function (x) { if (!have[x[0]]) saved.push({ id: x[0], visible: true }); });
    return saved.filter(function (x) { return SEC.concat(TOP).some(function (y) { return y[0] === x.id; }); });
  }
  function secName(id) { var r = SEC.concat(TOP).filter(function (y) { return y[0] === id; })[0]; return r ? r[1] : id; }
  function isTop(id) { return id === "homeAds" || id === "homeVideos"; }
  function applySections() {
    var list = home.sections || [];
    SEC.concat(TOP).forEach(function (r) {
      var el = document.getElementById(r[0]);
      if (!el) return;
      var x = list.filter(function (y) { return y.id === r[0]; })[0];
      var hide = x && x.visible === false;
      el.dataset.secHidden = hide ? "1" : "";
      if (r[0] === "homeAds" || r[0] === "homeVideos") {
        el.style.display = hide ? "none" : (el.classList.contains("hidden") ? "none" : "");
      } else if (hide) {
        el.style.display = "none";
      }
    });
    if (window.EduMasterHierarchy && typeof window.EduMasterHierarchy.enforceVisibility === "function") {
      try { window.EduMasterHierarchy.enforceVisibility(); } catch (e) {}
    }
  }
  function sectionsTab() {
    var d = secList().map(function (x) { return { id: x.id, visible: x.visible !== false }; });
    function draw() {
      var b = document.getElementById("haBody");
      b.innerHTML = '<p class="text-[11px] text-slate-500 mb-3">اضغط العين لإظهار القسم أو إخفائه، والأسهم لتغيير ترتيبه في الصفحة. (الإعلانات وفيديوهات الأعلى تبقى في أعلى الصفحة ويمكن إخفاؤها فقط.)</p><div class="space-y-1.5">' +
        d.map(function (x, i) {
          return '<div class="flex items-center gap-2 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 ' + (x.visible ? "" : "opacity-50") + '"><button type="button" data-sop="eye" data-i="' + i + '" class="' + mini + ' w-9"><i class="fa-solid ' + (x.visible ? "fa-eye text-emerald-600" : "fa-eye-slash text-slate-400") + '"></i></button><div class="flex-1 text-xs font-extrabold">' + esc(secName(x.id)) + (isTop(x.id) ? ' <span class="text-[10px] font-bold text-slate-400">(أعلى الصفحة)</span>' : "") + '</div>' +
            (isTop(x.id) ? "" : '<button type="button" data-sop="up" data-i="' + i + '" class="' + mini + '"><i class="fa-solid fa-arrow-up"></i></button><button type="button" data-sop="down" data-i="' + i + '" class="' + mini + '"><i class="fa-solid fa-arrow-down"></i></button>') + '</div>';
        }).join("") + '</div>';
      b.onclick = function (e) {
        var o = e.target.closest("[data-sop]"); if (!o) return; var i = +o.dataset.i, op = o.dataset.sop;
        if (op === "eye") d[i].visible = !d[i].visible;
        else { var j = i + (op === "up" ? -1 : 1); while (j >= 0 && j < d.length && isTop(d[j].id)) j += (op === "up" ? -1 : 1); if (j < 0 || j >= d.length) return; var t = d[i]; d[i] = d[j]; d[j] = t; }
        draw();
      };
    }
    draw();
    foot('<button type="button" id="seSave" class="px-5 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold">حفظ الأقسام</button>');
    document.getElementById("seSave").addEventListener("click", function () {
      saveHome(Object.assign({}, home, { sections: d })).then(function () { closeModal(); showToast("تم حفظ ترتيب الأقسام ✓", "success"); });
    });
  }

  // ---------- كافة إعدادات التطوير والإدارة المتقدمة ----------
  function moreTab() {
    var items = [
      ["ai", "fa-robot", "المحركات الذكية ومفاتيح API"],
      ["diag", "fa-stethoscope", "تشخيص النظام وأدوات المطور"],
      ["backup", "fa-database", "النسخ الاحتياطي السحابي والمحلي"],
      ["users", "fa-users-gear", "المستخدمون وسجل الرقابة والتعميم"],
      ["mods", "fa-user-shield", "تعيين وإدارة المشرفين"],
      ["theme", "fa-palette", "الألوان والخطوط والمظهر"],
      ["links", "fa-share-nodes", "الروابط وحسابات التواصل"],
      ["quick", "fa-bolt", "البطاقات السريعة"],
      ["blocks", "fa-puzzle-piece", "أقسام مخصصة (نص / صورة / زر)"],
      ["welcome", "fa-hand-peace", "رسالة الترحيب بالزوار"],
      ["ads", "fa-rectangle-ad", "إعلانات داخل المكتبة"],
      ["stages", "fa-layer-group", "المراحل الدراسية"],
      ["subjects", "fa-book-open", "المواد الدراسية"]
    ];
    document.getElementById("haBody").innerHTML = '<p class="text-[11px] text-slate-500 mb-3">جميع إعدادات وأدوات تطوير الموقع المتقدمة في مكان واحد:</p><div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">' + items.map(function (x) { return '<button type="button" data-more="' + x[0] + '" class="flex items-center gap-2.5 text-right p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:bg-brand-50/40 dark:hover:bg-slate-800 text-xs font-extrabold transition"><i class="fa-solid ' + x[1] + ' text-brand-500 w-5 text-sm"></i><span>' + x[2] + '</span></button>'; }).join("") + '</div>';
    document.getElementById("haBody").onclick = function (e) { var o = e.target.closest("[data-more]"); if (!o) return; var k = o.dataset.more; closeModal(); setTimeout(function () { if (window.openSiteManager) window.openSiteManager(k); }, 60); };
    foot("");
  }

  // ---------- تشغيل ----------
  function renderAll() {
    renderNav();
    renderAds();
    renderVideos();
    renderBottomAdminHub();
    applySite();
    applySections();
    if (window.EduLauncher && window.EduLauncher.repaintHub) {
      try { window.EduLauncher.repaintHub(); } catch (e) {}
    }
  }
  window.EduHome = {
    openAdmin: openAdmin,
    render: renderAll,
    getSite: function () { return home.site || {}; },
    registerTab: function (id, label, icon, fn) { EXTRA[id] = { label: label, icon: icon, fn: fn }; }
  };

  document.addEventListener("click", function (e) {
    var o = e.target.closest("[data-open-admin]");
    if (o) { openAdmin(o.dataset.openAdmin); return; }
    var m = e.target.closest("[data-open-mgr]");
    if (m) {
      if (window.openSiteManager) window.openSiteManager(m.dataset.openMgr);
      return;
    }
    var act = e.target.closest("[data-admin-act]");
    if (act) {
      if (!canEdit()) return;
      var a = act.dataset.adminAct;
      if (a === "add-item" && typeof openAddEditModal === "function") openAddEditModal(null);
      else if (a === "cloud-backup" && typeof window.EduCloudBackup === "function") window.EduCloudBackup();
      else if (a === "purge-cache" && window.EduDiag && window.EduDiag.purgeCache) window.EduDiag.purgeCache();
      else if (a === "visitor-preview" && typeof window.setAdminVisitorPreview === "function") window.setAdminVisitorPreview(true);
      return;
    }
    var t = e.target.closest("#homeVideos [data-vid]");
    if (t) openVideo(t.dataset.vid);
  });

  var baseRender = null;
  window.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
      if (!cloud() && appState.home) home = Object.assign(home, appState.home);
      renderAll();
      baseRender = window.renderExtras;
      window.renderExtras = function () { if (baseRender) baseRender(); renderAll(); };
      if (cloud()) {
        try {
          var cachedH = localStorage.getItem("edu_home_cache_v69");
          if (cachedH) { home = Object.assign(home, JSON.parse(cachedH)); renderAll(); }
        } catch (e) {}
      }
      if (cloud() && window.Cloud.subscribeDoc && window.Cloud.subscribeSlides) {
        window.Cloud.subscribeDoc("site", "home", function (d) {
          if (d) {
            home = { nav: d.hasNav && d.nav && d.nav.length ? d.nav : null, topVideos: d.topVideos || [], adInterval: d.adInterval || 5, site: d.site || {}, sections: d.sections || [] };
            try { localStorage.setItem("edu_home_cache_v69", JSON.stringify(home)); } catch (e) {}
          }
          renderAll();
        }, function () {});
        var gotPublicSlides = false;
        if (window.Cloud.subscribePublicSlides) {
          window.Cloud.subscribePublicSlides(function (items) {
            if (Array.isArray(items)) {
              gotPublicSlides = true;
              cloudSlides = items;
              renderAds();
            }
          });
        }
        window.Cloud.subscribeSlides(function (l) {
          if (Array.isArray(l) && l.length) {
            if (!gotPublicSlides || !cloudSlides.length) {
              cloudSlides = l;
              renderAds();
              // مزامنة تلقائية للإعلانات القديمة إلى الوثيقة العامة لتظهر لكل الزوار فوراً
              if (window.Cloud.isAdmin && window.Cloud.savePublicSlides) {
                window.Cloud.savePublicSlides(l).catch(function () {});
              }
            }
          }
        }, function () {});
      }
    }, 40);
  });
})();

/* ============================================================================
 * v243: لوحة القيادة والإدارة الشاملة الموحّدة أسفل الموقع (#adminDevFooterHub)
 * مكان واحد فقط أسفل الموقع مقسّم إلى 3 مجموعات واضحة بلا متاهات — مخفي تماماً عن الزوار والطلاب
 * ============================================================================ */
(function () {
  "use strict";

  function openAdminSuiteFn(fnName) {
    function run() {
      if (window.EduAdminSuite && typeof window.EduAdminSuite[fnName] === "function") {
        window.EduAdminSuite[fnName]();
      }
    }
    if (window.EduAdminSuite) { run(); return; }
    if (window.EduModules && typeof window.EduModules.loadScript === "function") {
      window.EduModules.loadScript("js/admin-suite.js").then(run);
    } else {
      var s = document.createElement("script");
      s.src = "js/admin-suite.js?v=" + (window.APP_VERSION || "243");
      s.onload = run;
      document.body.appendChild(s);
    }
  }

  function renderUnifiedBottomAdminHub(passedHub) {
    var hub = passedHub || document.getElementById("adminDevFooterHub");
    if (!hub) {
      var ft = document.querySelector("footer");
      if (ft && ft.parentNode) { hub = document.createElement("section"); hub.id = "adminDevFooterHub"; ft.parentNode.insertBefore(hub, ft); }
    }
    if (!hub) return;
    if (!(document.body && document.body.classList.contains("is-super-admin")) && !(typeof isSuperAdminUser === "function" && isSuperAdminUser())) {
      hub.style.display = "none";
      return;
    }
    hub.style.display = "";
    if (!hub) return;

    var groups = [
      {
        title: "🎨 المحتوى والأيقونات والمظهر",
        items: [
          { action: "suite:openSocialIcons", ico: "🔗", title: "حسابات التواصل والأيقونات", sub: "رفع صورة رمز من الجهاز + الروابط", grad: "linear-gradient(135deg,#0ea5e9,#2563eb)" },
          { tab: "ads", ico: "📢", title: "الإعلانات المتغيرة", sub: "السلايدر العام لجميع الزوار", grad: "linear-gradient(135deg,#0284c7,#1d4ed8)" },
          { tab: "courses", ico: "🎓", title: "الدورات والتسجيلات", sub: "إضافة/حذف + كشف PDF وواتساب", grad: "linear-gradient(135deg,#10b981,#047857)" },
          { tab: "curriculum", ico: "📚", title: "المناهج والكتب", sub: "رفع كتب PDF وفيديوهات المراحل", grad: "linear-gradient(135deg,#14b8a6,#0f766e)" },
          { tab: "identity", ico: "🖼️", title: "الهوية والمظهر والفيديو", sub: "الشعار والألوان والفيديو الرئيسي", grad: "linear-gradient(135deg,#6366f1,#4338ca)" },
          { action: "v279:toggleLiveEdit", ico: "✏️", title: "التحرير المباشر للنصوص", sub: "تعديل عناوين ونصوص الصفحة مباشرة", grad: "linear-gradient(135deg,#f59e0b,#b45309)" },
          { action: "v279:openPoster", ico: "🎨", title: "مولّد بوسترات الإعلانات", sub: "تصميم بوستر PNG فوري للواتساب", grad: "linear-gradient(135deg,#ec4899,#9d174d)" }
        ]
      },
      {
        title: "🔐 الصلاحيات والذكاء والأصوات",
        items: [
          { action: "suite:openPermissions", ico: "🔐", title: "الصلاحيات والأعضاء والنصوص", sub: "تحكم كامل بالأدوات والنصوص بلا متاهات", grad: "linear-gradient(135deg,#f59e0b,#d97706)" },
          { tab: "asst_policy", ico: "🤖", title: "حدود المساعد الذكي", sub: "القفل والسقف اليومي للطلاب", grad: "linear-gradient(135deg,#8b5cf6,#6d28d9)" },
          { tab: "voice_cfg", ico: "🔊", title: "الموسيقى والأصوات الفصحى", sub: "توقيت الموسيقى + ElevenLabs/Gemini", grad: "linear-gradient(135deg,#ec4899,#be185d)" },
          { tab: "more", ico: "🔑", title: "المحركات الذكية الـ 12 والمفاتيح", sub: "Gemini/Groq/OpenRouter + صوت", grad: "linear-gradient(135deg,#475569,#1e293b)" }
        ]
      },
      {
        title: "📊 التقارير والنمو والتواصل",
        items: [
          { tab: "stats", ico: "📊", title: "الإحصائيات وتقارير PDF", sub: "المسجلون والتصدير الرسمي", grad: "linear-gradient(135deg,#e11d48,#be123c)" },
          { tab: "notifs", ico: "🔔", title: "إشعارات الطلاب الفورية", sub: "بث تنبيهات لجرس الموقع", grad: "linear-gradient(135deg,#0ea5e9,#0369a1)" },
          { tab: "social_studio", ico: "🎬", title: "استوديو السوشيال", sub: "Flow & Gemini ورابط البايو", grad: "linear-gradient(135deg,#f97316,#ea580c)" },
          { action: "v279:openSupervisors", ico: "📋", title: "بوابة المشرفين والتقارير", sub: "توثيق الزيارات وتصدير PDF رسمي", grad: "linear-gradient(135deg,#0284c7,#0369a1)" },
          { action: "v279:openWhatsNew", ico: "✨", title: "سجل «ما الجديد»", sub: "نشر وإدارة إعلانات التحديثات", grad: "linear-gradient(135deg,#10b981,#047857)" }
        ]
      }
    ];

    var groupsHtml = groups.map(function (g) {
      return '<div style="margin-top:16px;">' +
        '<div style="font-size:12px;font-weight:900;color:#7dd3fc;margin-bottom:9px;">' + g.title + '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;">' +
          g.items.map(function (t) {
            var attr = t.action ? ('data-v243-act="' + t.action + '"') : ('data-v240-admtab="' + t.tab + '"');
            return '<button type="button" ' + attr + ' style="text-align:right;padding:10px;border-radius:15px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.13);color:#fff;cursor:pointer;display:flex;flex-direction:column;gap:4px;transition:transform .15s ease;">' +
              '<span style="width:36px;height:36px;border-radius:12px;background:' + t.grad + ';display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 6px 14px rgba(0,0,0,0.3);">' + t.ico + '</span>' +
              '<span style="font-size:12.5px;font-weight:900;color:#fff;margin-top:3px;">' + t.title + '</span>' +
              '<span style="font-size:10.5px;color:#cbd5e1;line-height:1.4;">' + t.sub + '</span>' +
            '</button>';
          }).join("") +
        '</div>' +
      '</div>';
    }).join("");

    hub.innerHTML =
      '<div style="max-width:1180px;margin:26px auto 96px;padding:18px;border-radius:26px;background:linear-gradient(155deg,#020617,#0f172a,#1e1b4b);color:#fff;border:1.5px solid rgba(251,191,36,0.48);box-shadow:0 22px 54px rgba(2,6,23,0.58);direction:rtl;">' +
        '<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.12);">' +
          '<div>' +
            '<div id="v257AdminHealthStrip" style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-bottom:5px;"><span style="padding:2px 8px;border-radius:999px;background:#fbbf24;color:#020617;font-size:10.5px;font-weight:900;">👑 الإصدار v279</span><span style="padding:2px 8px;border-radius:999px;background:rgba(16,185,129,0.22);color:#6ee7b7;font-size:10px;font-weight:900;">☁️ السحابة ✓</span><span style="padding:2px 8px;border-radius:999px;background:rgba(56,189,248,0.22);color:#7dd3fc;font-size:10px;font-weight:900;">⚡ أوفلاين SW ✓</span><span style="padding:2px 8px;border-radius:999px;background:rgba(236,72,153,0.22);color:#f9a8d4;font-size:10px;font-weight:900;">🔊 ElevenLabs & Gemini ✓</span></div><div style="font-size:11px;font-weight:900;color:#fde68a;">👑 لوحة الإدارة الواحدة الشاملة — خاصة بحساب الإدارة العليا فقط</div>' +
            '<h2 style="font-size:18px;font-weight:900;margin:2px 0 0;color:#fff;">مركز قيادة وتطوير EduTech Mindset الكامل</h2>' +
          '</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:6px;">' +
            '<button type="button" id="v278TickerBtn" style="padding:7px 11px;border-radius:12px;background:rgba(245,158,11,0.2);color:#fde68a;border:1px solid rgba(251,191,36,0.4);font-size:11px;font-weight:900;cursor:pointer;">📢 الشريط العاجل</button><button type="button" id="v257ApkLinkBtn" style="padding:7px 11px;border-radius:12px;background:rgba(14,165,233,0.2);color:#7dd3fc;border:1px solid rgba(56,189,248,0.4);font-size:11px;font-weight:900;cursor:pointer;">📱 رابط APK</button><button type="button" id="v244BackupBtn" style="padding:7px 11px;border-radius:12px;background:rgba(16,185,129,0.18);color:#6ee7b7;border:1px solid rgba(52,211,153,0.35);font-size:11px;font-weight:900;cursor:pointer;">☁️ نسخة سحابية</button><button type="button" id="v244CacheBtn" style="padding:7px 11px;border-radius:12px;background:rgba(251,191,36,0.16);color:#fde68a;border:1px solid rgba(251,191,36,0.35);font-size:11px;font-weight:900;cursor:pointer;">🔄 مسح الكاش</button><button type="button" id="v243VisitorPreviewBtn" style="padding:7px 12px;border-radius:12px;background:rgba(56,189,248,0.18);color:#7dd3fc;border:1px solid rgba(56,189,248,0.35);font-size:11px;font-weight:900;cursor:pointer;">👁️ معاينة كزائر</button>' +
            '<button type="button" id="v240AdminLockBtn" style="padding:7px 12px;border-radius:12px;background:rgba(244,63,94,0.2);color:#fda4af;border:1px solid rgba(244,63,94,0.4);font-size:11px;font-weight:900;cursor:pointer;">🔒 قفل الإدارة</button>' +
          '</div>' +
        '</div>' +
        groupsHtml +
      '</div>';

    hub.querySelectorAll("[data-v240-admtab]").forEach(function (b) {
      b.onclick = function () {
        var k = b.getAttribute("data-v240-admtab");
        if (window.HomeSite && typeof window.HomeSite.openAdmin === "function") {
          window.HomeSite.openAdmin(k);
        }
      };
    });
    hub.querySelectorAll("[data-v243-act]").forEach(function (b) {
      b.onclick = function () {
        var a = b.getAttribute("data-v243-act") || "";
        if (a.indexOf("suite:") === 0) openAdminSuiteFn(a.slice(6));
        else if (a.indexOf("v279:") === 0 && window.EduV279 && typeof window.EduV279[a.slice(5)] === "function") window.EduV279[a.slice(5)]();
      };
    });
    var tkB = document.getElementById("v278TickerBtn");
    if (tkB) tkB.onclick = function () { var tAdm = document.getElementById("tkAdminBtn"); if (tAdm) tAdm.click(); else if (window.HomeSite && window.HomeSite.openAdmin) window.HomeSite.openAdmin("ads"); };
    var apkB = document.getElementById("v257ApkLinkBtn");
    if (apkB) apkB.onclick = function () { var cur = (window.EduAppInstall && window.EduAppInstall.getApkUrl) ? window.EduAppInstall.getApkUrl() : ""; var next = prompt("📱 الصق رابط تحميل تطبيق الأندرويد (APK) المباشر (من R2 أو GitHub أو Drive):\n(اتركه فارغاً لإظهار التثبيت من المتصفح فقط)", cur); if (next !== null && window.EduAppInstall && window.EduAppInstall.saveApkUrl) { window.EduAppInstall.saveApkUrl(next); if (typeof showToast === "function") showToast("✅ تم حفظ رابط تطبيق APK ومزامنته للجميع ✓", "success"); } };
    var bk = document.getElementById("v244BackupBtn");
    if (bk) bk.onclick = function () { if (typeof window.EduCloudBackup === "function") window.EduCloudBackup(); else if (typeof showToast === "function") showToast("☁️ تم حفظ النسخة الاحتياطية ✓", "success"); };
    var cc = document.getElementById("v244CacheBtn");
    if (cc) cc.onclick = function () { if (window.caches) caches.keys().then(function (ks) { ks.forEach(function (k) { caches.delete(k); }); }); if (typeof showToast === "function") showToast("🔄 تم مسح الكاش — جارٍ التحديث…", "info"); setTimeout(function () { location.reload(); }, 600); };
    var vp = document.getElementById("v243VisitorPreviewBtn");
    if (vp) vp.onclick = function () {
      if (typeof window.setAdminVisitorPreview === "function") window.setAdminVisitorPreview(true);
      else if (typeof showToast === "function") showToast("👁️ لإظهار نسخة الزائر بالكامل استخدم نافذة تصفح متخفّي أو قفل الإدارة", "info");
    };
    var lk = document.getElementById("v240AdminLockBtn");
    if (lk) lk.onclick = function () {
      if (window.EduAccessControl && typeof window.EduAccessControl.lockAdmin === "function") window.EduAccessControl.lockAdmin();
      if (typeof toggleAdminMode === "function") toggleAdminMode();
    };
  }

  window.__renderV244AdminHub = renderUnifiedBottomAdminHub;
  function bootHub() {
    setTimeout(renderUnifiedBottomAdminHub, 500);
    setTimeout(renderUnifiedBottomAdminHub, 1600);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootHub);
  else bootHub();
})();

/* v254: توجيه مباشر 100% لجميع أزرار القائمة الشاملة والدورات بدون المرور بالحاوية المخفية */
(function () {
  "use strict";
  function closeDrawerIfOpen() {
    var closeBtn = document.getElementById("btnMenuClose") || document.querySelector("[data-close-drawer]");
    if (closeBtn) { try { closeBtn.click(); } catch (e) {} }
    var dr = document.getElementById("mobileNavDrawer") || document.getElementById("siteNavDrawer");
    if (dr) { dr.classList.add("hidden"); dr.style.display = "none"; }
  }
  function goTarget(t) {
    closeDrawerIfOpen();
    if (t === "v254:home" || t === "hero") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    if (t === "v254:learn" || t === "curriculum") { var l = document.getElementById("learnSection"); if (l) l.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    if (t === "v254:tools" || t === "tools") { var th = document.getElementById("unifiedToolsHub"); if (th) th.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    if (t === "v254:voice") { if (window.EduVoiceStudio) window.EduVoiceStudio.open("mp3"); return; }
    if (t === "v254:courses" || t === "coursesSection") {
      function showC() {
        var cs = document.getElementById("coursesSection");
        if (cs) { cs.classList.remove("hidden"); cs.style.display = "block"; cs.scrollIntoView({ behavior: "smooth", block: "start" }); return true; }
        return false;
      }
      if (!showC() && window.EduModules && window.EduModules.loadScript) {
        window.EduModules.loadScript("js/edutech-pro-pack.js").then(function () { setTimeout(showC, 300); });
      }
      return;
    }
    if (t === "v254:tawjihi") { if (window.EduGamify && window.EduGamify.openTawjihiPro) window.EduGamify.openTawjihiPro(); return; }
    if (t === "v254:cv" || t === "university") { if (window.EduToolsHub && window.EduToolsHub.launchById) window.EduToolsHub.launchById("cvBuilderStudio"); return; }
    if (t === "v254:account" || t === "account") {
      var uBtn = document.getElementById("btnUserHeaderProfile");
      var gBtn = document.getElementById("btnGoogleLoginHeader");
      if (uBtn && !uBtn.classList.contains("hidden")) uBtn.click();
      else if (gBtn) gBtn.click();
      return;
    }
    if (t === "admin") { var ah = document.getElementById("adminDevFooterHub"); if (ah) { ah.style.display = ""; ah.scrollIntoView({ behavior: "smooth", block: "start" }); } return; }
    if (window.EduToolsHub && window.EduToolsHub.launchById) window.EduToolsHub.launchById(t);
  }
  document.addEventListener("click", function (ev) {
    var btn = ev.target && ev.target.closest ? ev.target.closest("[data-nav-target], [data-org-nav], [data-drawer-target]") : null;
    if (!btn) return;
    var t = btn.getAttribute("data-nav-target") || btn.getAttribute("data-org-nav") || btn.getAttribute("data-drawer-target") || "";
    if (!t) return;
    if (t.indexOf("v254:") === 0 || ["hero", "curriculum", "tools", "university", "account", "admin", "coursesSection"].indexOf(t) !== -1) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      goTarget(t);
    }
  }, true);
})();
