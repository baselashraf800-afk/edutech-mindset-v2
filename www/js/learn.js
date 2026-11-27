/*
 * قسم «المراحل الدراسية»: مرحلة ← صف ← مادة ← فيديوهات تعليمية.
 * - يراه كل الزوار، ويعدّله المدير فقط (مرحلة/صف/مادة/فيديو: إضافة، تعديل، حذف، ترتيب).
 * - يُخزَّن في Firestore: المجموعة site / الوثيقة curriculum  (قواعد الأمان الحالية تكفي).
 * - الفيديو: رابط يوتيوب (فيديو أو قائمة تشغيل) أو Google Drive أو ملف mp4 مباشر/مرفوع.
 */
(function () {
  "use strict";

  var COLORS = ["from-sky-500 to-blue-600", "from-emerald-500 to-teal-600", "from-amber-500 to-orange-600", "from-purple-500 to-fuchsia-600", "from-rose-500 to-pink-600", "from-cyan-500 to-indigo-600"];
  var COLOR_NAMES = ["أزرق", "أخضر", "برتقالي", "بنفسجي", "وردي", "سماوي"];
  var STAGE_ICONS = ["fa-child-reaching", "fa-book-open-reader", "fa-graduation-cap", "fa-school", "fa-user-graduate", "fa-lightbulb"];
  var inp = "w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100";
  var btnMini = "px-2 py-1.5 rounded-lg bg-slate-200/90 dark:bg-slate-700 text-[11px] hover:bg-slate-300 dark:hover:bg-slate-600";

  var cloudTree = null;      // الشجرة القادمة من السحابة (null = لا شيء محفوظ بعد)
  var st = { s: "", g: "", m: "", v: "", t: "v" };   // موضع الزائر الحالي (t = تبويب المادة)
  var cloudRes = [];   // موارد المواد (كتب/أوراق/ملخصات/اختبارات…) من مجموعة resources
  var TABS = [["v", "🎬", "الفيديوهات"], ["book", "📖", "الكتاب"], ["worksheet", "📝", "أوراق عمل"], ["summary", "📋", "ملخصات"], ["exam", "✅", "اختبارات"], ["other", "➕", "أخرى"]];
  var KIND_LBL = { book: "كتاب", worksheet: "ورقة عمل", summary: "ملخص", exam: "اختبار", other: "مورد" };
  var KIND_ICO = { book: "fa-book", worksheet: "fa-file-pen", summary: "fa-clipboard-list", exam: "fa-circle-check", other: "fa-layer-group" };
  var GKEY = ["الحادي عشر", "الثاني عشر", "الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر"];
  // v293: مكتبة قوائم تشغيل يوتيوب الموثقة للمنهاج الفلسطيني (الصفوف 1 - 12) + روابط البوابة التعليمية الرسمية
  var v293Catalog = null, v293CatalogLoading = false;
  var v293GradeMap = { "الأول": "1", "الثاني": "2", "الثالث": "3", "الرابع": "4", "الخامس": "5", "السادس": "6", "السابع": "7", "الثامن": "8", "التاسع": "9", "العاشر": "10", "الحادي عشر": "11", "الثاني عشر": "12" };
  function v293GradeNum(gName) {
    var k = ordKey(gName);
    return (k && v293GradeMap[k]) ? v293GradeMap[k] : "";
  }
  function v293SubKey(mName) {
    var s = String(mName || "");
    if (/عرب|لغت/.test(s)) return "عرب";
    if (/رياض/.test(s)) return "رياض";
    if (/علوم|وطني|حياتي/.test(s) && !/أحياء/.test(s)) return "علوم";
    if (/أحياء|حياتي/.test(s)) return "أحياء";
    if (/إسلام|دين|تلاوة/.test(s)) return "إسلام";
    if (/إنجليز|انجليز|english/i.test(s)) return "إنجليز";
    if (/اجتماع|تاريخ|جغراف/.test(s)) return "اجتماع";
    if (/تكنولوج|حاسوب/.test(s)) return "تكنولوج";
    if (/فيزياء/.test(s)) return "فيزياء";
    if (/كيمياء/.test(s)) return "كيمياء";
    return "";
  }
  function v293EnsureCatalog() {
    if (v293Catalog || v293CatalogLoading) return;
    v293CatalogLoading = true;
    fetch("assets/data/palestine-playlists.json?v=293")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        v293CatalogLoading = false;
        if (d && d.grades) { v293Catalog = d; try { render(); } catch (e) {} }
      })
      .catch(function () { v293CatalogLoading = false; });
  }
  v293EnsureCatalog();
  function v293BuiltinVideos(G, M) {
    if (!v293Catalog || !v293Catalog.grades || !G || !M) return [];
    var gn = v293GradeNum(G.name), sk = v293SubKey(M.name);
    if (!gn || !sk || !v293Catalog.grades[gn]) return [];
    var arr = (v293Catalog.grades[gn].subjects && v293Catalog.grades[gn].subjects[sk]) || [];
    return arr.map(function (item, idx) {
      return {
        id: "v293-" + gn + "-" + sk + "-" + idx,
        title: item.title,
        url: item.url,
        desc: "📺 قائمة دروس متكاملة ومرتّبة (اضغط أيقونة القائمة أعلى المشغّل للتنقل بين الدرس الأول والثاني وبقية الدروس) • القناة: " + (item.channel || "المنهاج الفلسطيني"),
        channel: item.channel || "",
        builtin: true
      };
    });
  }
  function v293MergedVideos(G, M) {
    var manual = (M && Array.isArray(M.videos)) ? M.videos : [];
    var built = v293BuiltinVideos(G, M);
    var seen = {}, out = [];
    manual.concat(built).forEach(function (v) {
      var key = String((v && v.url) || "").replace(/^http:/i, "https:").trim();
      if (!key || seen[key]) return;
      seen[key] = true;
      out.push(v);
    });
    return out;
  }
  function v293ElearnUrl(G) {
    if (!v293Catalog || !v293Catalog.grades || !G) return "";
    var gn = v293GradeNum(G.name);
    return (gn && v293Catalog.grades[gn] && v293Catalog.grades[gn].elearnUrl) || "";
  }

  function fileUrl(u) { u = String(u || "").trim(); return /^\/api\/media\//.test(u) ? location.origin + u : safeUrl(u); }
  function resList() { return cloud() ? cloudRes : (appState.resources || []); }
  function canRes() { return typeof isModeratorOrAdmin === "function" && isModeratorOrAdmin(); }
  function ordKey(sv) { var t = String(sv || "").replace(/[أإآ]/g, "ا").replace(/(الجزء|الفصل|القسم|الوحدة)\s+\S+/g, " "); for (var i = 0; i < GKEY.length; i++) if (t.indexOf(GKEY[i].replace(/[أإآ]/g, "ا")) !== -1) return GKEY[i]; return ""; }
  function stems(sv) { return String(sv || "").split(/[^\u0621-\u064A]+/).map(function (w) { return w.replace(/^ال/, ""); }).filter(function (w) { return w.length >= 3 && w !== "العامة" && w !== "عامة"; }).map(function (w) { return w.slice(0, 4); }); }
  function subjMatch(a, b) { var x = stems(a), y = stems(b); return x.some(function (w) { return y.indexOf(w) !== -1; }); }
  function booksFor(G, M) {
    var bl = (window.EduBooks && window.EduBooks.list()) || [], gk = ordKey(G.name);
    return bl.filter(function (b) { var bg = ordKey(b.grade || (window.EduBooks.guess ? window.EduBooks.guess(b) : "")); return gk && bg === gk && b.subject && subjMatch(b.subject, M.name); });
  }
  function resFor(M, kind) { return resList().filter(function (r) { return r.subjectId === M.id && (!kind || r.kind === kind); }); }
  function tabCount(G, M, k) { if (k === "v") return v293MergedVideos(G, M).length; var cnt = (k === "book" ? booksFor(G, M).length : 0) + resFor(M, k).length; if ((k === "book" || k === "worksheet" || k === "summary" || k === "exam") && window.EduMasterHierarchy && window.EduMasterHierarchy.findSubject && window.EduMasterHierarchy.findSubject(G.name, M.name)) cnt += 1; return cnt; }
  function saveRes(list) {
    if (cloud()) return window.Cloud.commit(list.map(function (x) { return x.remove ? { col: "resources", id: x.id, remove: true } : { col: "resources", id: x.id, data: x.data }; }));
    var cur = (appState.resources || []).slice();
    list.forEach(function (x) { var i = cur.findIndex(function (r) { return r.id === x.id; }); if (x.remove) { if (i > -1) cur.splice(i, 1); } else { var o = Object.assign({ id: x.id }, x.data); if (i > -1) cur[i] = o; else cur.unshift(o); } });
    appState.resources = cur; saveState(); render(); return Promise.resolve();
  }
  function failRes(e) { showToast("تعذر الحفظ [" + ((e && e.code) || "؟") + "] — انشر قواعد Firestore الجديدة وتأكد من صلاحيتك", "warning"); }

  function esc(s) { return escapeHtml(s); }
  function cloud() { return !!(window.Cloud && window.Cloud.enabled); }
  function canEdit() { return typeof isSuperAdminUser === "function" && isSuperAdminUser(); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function uid(p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }

  // ---------- الهيكل الافتراضي (فلسطين) ----------
  function defaultTree() {
    var ord = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر", "الحادي عشر", "الثاني عشر"];
    function subs(prefix, names) { return names.map(function (n, i) { return { id: prefix + "-m" + (i + 1), name: n, videos: [] }; }); }
    var lower = ["لغتنا العربية", "الرياضيات", "العلوم والحياة", "التربية الإسلامية", "اللغة الإنجليزية"];
    var upper = lower.concat(["الدراسات الاجتماعية", "التكنولوجيا"]);
    var sec = ["اللغة العربية", "اللغة الإنجليزية", "الرياضيات", "الفيزياء", "الكيمياء", "الأحياء", "التكنولوجيا", "التربية الإسلامية"];
    function stage(id, name, desc, color, icon, from, to, names) {
      var gs = [];
      for (var i = from; i <= to; i++) gs.push({ id: id + "-g" + i, name: "الصف " + ord[i - 1], subjects: subs(id + "-g" + i, names) });
      return { id: id, name: name, desc: desc, color: color, icon: icon, grades: gs };
    }
    return { stages: [
      stage("s1", "المرحلة الأساسية الدنيا", "الصفوف من الأول إلى الرابع", 0, "fa-child-reaching", 1, 4, lower),
      stage("s2", "المرحلة الأساسية العليا", "الصفوف من الخامس إلى التاسع", 1, "fa-book-open-reader", 5, 9, upper),
      stage("s3", "المرحلة الثانوية", "الصفوف من العاشر إلى الثاني عشر", 2, "fa-graduation-cap", 10, 12, sec),
      {
        id: "s4",
        name: "المرحلة الجامعية والتأهيل المهني",
        desc: "إنشاء السيرة الذاتية الاحترافية (CV عربي/إنجليزي) ومقررات الجامعة والبحث العلمي",
        color: 3,
        icon: "fa-user-graduate",
        grades: [
          { id: "s4-g1", name: "السيرة الذاتية الاحترافية (CV عربي + English) والتوظيف", subjects: subs("s4-g1", ["تصميم سيرة ذاتية ATS باللغتين العربية والإنجليزية", "خطاب التقديم للمنح والوظائف (Cover Letter)", "مهارات المقابلات الشخصية وسوق العمل"]) },
          { id: "s4-g2", name: "التخصصات الهندسية والتقنية والبرمجة", subjects: subs("s4-g2", ["هندسة البرمجيات والذكاء الاصطناعي", "قواعد البيانات والشبكات", "الرياضيات والفيزياء الجامعية"]) },
          { id: "s4-g3", name: "العلوم التربوية والإدارية والإنسانية", subjects: subs("s4-g3", ["أساليب التدريس وتكنولوجيا التعليم", "إدارة الأعمال والمحاسبة", "منهجيات البحث العلمي الأكاديمي"]) }
        ]
      }
    ] };
  }

  function getTree() {
    var t = cloud() ? cloudTree : appState.curriculum;
    return (t && t.stages) ? t : defaultTree();
  }
  function persist(tree) {
    if (!canEdit()) { showToast("التعديل للإدارة فقط 🔒", "warning"); return Promise.reject(); }
    if (cloud()) {
      cloudTree = tree; render(); // عرض فوري، ثم تأكيد من السحابة
      return window.Cloud.commit([{ col: "site", id: "curriculum", data: { tree: tree } }]).catch(function (e) {
        showToast("تعذر الحفظ [" + ((e && e.code) || "؟") + "] — تأكد من تسجيل دخول الإدارة", "warning"); throw e;
      });
    }
    appState.curriculum = tree; saveState(); render(); return Promise.resolve();
  }
  function mutate(fn) { var t = clone(getTree()); fn(t); return persist(t); }

  // ---------- بحث في الشجرة ----------
  function byId(arr, id) { for (var i = 0; i < (arr || []).length; i++) if (arr[i].id === id) return arr[i]; return null; }
  function cur() {
    var t = getTree(), S = byId(t.stages, st.s), G = S && byId(S.grades, st.g), M = G && byId(G.subjects, st.m);
    return { t: t, S: S, G: G, M: M };
  }
  function countVideos(o, parentGrade) {
    if (o.videos) return parentGrade ? v293MergedVideos(parentGrade, o).length : o.videos.length;
    var n = 0;
    if (o.subjects) {
      o.subjects.forEach(function (m) { n += countVideos(m, o); });
    } else if (o.grades) {
      o.grades.forEach(function (g) { n += countVideos(g, g); });
    } else if (o.stages) {
      o.stages.forEach(function (s) { n += countVideos(s, null); });
    }
    return n;
  }

  // ---------- الفيديو ----------
  function parseVideo(url) {
    url = String(url || "").trim();
    var m;
    if ((m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i))) return { kind: "yt", id: m[1] };
    if ((m = url.match(/youtube\.com\/(?:playlist|watch)\?(?:.*&)?list=([\w-]+)/i))) return { kind: "ytlist", id: m[1] };
    if ((m = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:.*&)?id=)([\w-]+)/i))) return { kind: "drive", id: m[1] };
    if (/\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(url) || /\/api\/media\//i.test(url)) return { kind: "file", url: url };
    if (/^https?:\/\//i.test(url)) return { kind: "link", url: url };
    return { kind: "none" };
  }
  var KIND_NAME = { yt: "فيديو يوتيوب", ytlist: "قائمة تشغيل يوتيوب", drive: "Google Drive", file: "ملف فيديو", link: "رابط خارجي", none: "—" };
  function thumbOf(v) {
    var p = parseVideo(v.url);
    if (p.kind === "yt") return "https://i.ytimg.com/vi/" + p.id + "/mqdefault.jpg";
    return "";
  }
  function playerHtml(v) {
    var p = parseVideo(v.url), box = 'class="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg"';
    var ifr = function (src) { return '<div ' + box + '><iframe src="' + esc(src) + '" class="w-full h-full" loading="lazy" allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" title="' + esc(v.title) + '"></iframe></div>'; };
    if (p.kind === "yt") return ifr("https://www.youtube-nocookie.com/embed/" + p.id + "?rel=0&modestbranding=1");
    if (p.kind === "ytlist") return ifr("https://www.youtube-nocookie.com/embed/videoseries?list=" + p.id);
    if (p.kind === "drive") return ifr("https://drive.google.com/file/d/" + p.id + "/preview");
    if (p.kind === "file") return '<div ' + box + '><video data-lnvideo src="' + esc(p.url) + '" controls preload="metadata" playsinline class="w-full h-full"></video></div>';
    if (p.kind === "link") return '<div class="w-full aspect-video rounded-2xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center gap-3 p-4 text-center"><i class="fa-solid fa-arrow-up-right-from-square text-3xl text-brand-500"></i><a href="' + esc(p.url) + '" target="_blank" rel="noopener" class="px-5 py-2 rounded-xl bg-brand-600 text-white text-xs font-extrabold">فتح الفيديو في نافذة جديدة</a></div>';
    return '<div class="w-full aspect-video rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-400">رابط غير صالح</div>';
  }

  function subjIcon(n) {
    n = String(n);
    var map = [["رياض", "fa-calculator"], ["علوم", "fa-flask"], ["إسلام", "fa-mosque"], ["انجليز", "fa-globe"], ["إنجليز", "fa-globe"], ["اجتماع", "fa-earth-asia"], ["تكنولوج", "fa-laptop-code"], ["حاسوب", "fa-laptop-code"], ["فيزياء", "fa-atom"], ["كيمياء", "fa-vial"], ["أحياء", "fa-dna"], ["عرب", "fa-pen-nib"], ["لغت", "fa-pen-nib"], ["فن", "fa-palette"], ["رياضة", "fa-futbol"], ["تاريخ", "fa-landmark"], ["جغراف", "fa-map"]];
    for (var i = 0; i < map.length; i++) if (n.indexOf(map[i][0]) !== -1) return map[i][1];
    return "fa-book";
  }

  // ---------- الواجهة ----------
  function ensure() {
    if (document.getElementById("learnSection")) return;
    var anchor = document.getElementById("booksSection") || document.getElementById("library");
    if (!anchor) return;
    var s = document.createElement("section");
    s.id = "learnSection"; s.className = "py-12 scroll-mt-20 bg-gradient-to-b from-brand-50/40 to-transparent dark:from-slate-900/40";
    s.innerHTML = '<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div id="lnBody"></div></div>';
    anchor.parentNode.insertBefore(s, anchor);
    var nav = document.querySelector('nav a[href="#library"]');
    if (nav && false) {
      var a = document.createElement("a"); a.id = "navLearnLink"; a.href = "#learnSection"; a.className = nav.className;
      a.innerHTML = '<i class="fa-solid fa-school text-emerald-500"></i>المراحل الدراسية'; nav.parentNode.insertBefore(a, nav);
    }
    s.addEventListener("click", onClick);
  }

  function syncHash() {
    var h = st.s ? "#learn/" + [st.s, st.g, st.m, st.v].filter(Boolean).join("/") : "";
    if (window.EduBoost && st.m) { try { window.EduBoost.track(st, cur()); } catch (e) {} }
    try { if (h) history.replaceState(null, "", h); else if (/^#learn/.test(location.hash)) history.replaceState(null, "", "#learnSection"); } catch (e) {}
  }

  function head(title, sub, adminBtns) {
    return '<div class="flex flex-wrap items-end justify-between gap-3 mb-5"><div><h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white"><i class="fa-solid fa-school text-emerald-500 ml-2"></i>' + esc(title) + '</h2>' +
      (sub ? '<p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">' + esc(sub) + '</p>' : "") + '</div>' + (adminBtns && canEdit() ? '<div class="flex flex-wrap gap-2">' + adminBtns + '</div>' : "") + '</div>';
  }
  function crumbs(c) {
    var p = ['<button type="button" data-go="" class="hover:text-brand-600 font-bold">المراحل الدراسية</button>'];
    if (c.S) p.push('<button type="button" data-go="s" class="hover:text-brand-600 font-bold">' + esc(c.S.name) + '</button>');
    if (c.G) p.push('<button type="button" data-go="g" class="hover:text-brand-600 font-bold">' + esc(c.G.name) + '</button>');
    if (c.M) p.push('<span class="font-extrabold text-slate-800 dark:text-slate-100">' + esc(c.M.name) + '</span>');
    return '<div class="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mb-4">' + p.join('<i class="fa-solid fa-angle-left text-[9px] text-slate-300"></i>') + '</div>';
  }
  function adminBar(kind, id) { // أزرار تعديل صغيرة على كل بطاقة
    if (!canEdit()) return "";
    return '<div class="absolute top-2 left-2 flex gap-1 z-10" data-stop="1">' +
      '<button type="button" data-act="up" data-kind="' + kind + '" data-id="' + esc(id) + '" class="' + btnMini + '" title="تقديم"><i class="fa-solid fa-arrow-right"></i></button>' +
      '<button type="button" data-act="down" data-kind="' + kind + '" data-id="' + esc(id) + '" class="' + btnMini + '" title="تأخير"><i class="fa-solid fa-arrow-left"></i></button>' +
      '<button type="button" data-act="edit" data-kind="' + kind + '" data-id="' + esc(id) + '" class="' + btnMini + '" title="تعديل">✏️</button>' +
      '<button type="button" data-act="del" data-kind="' + kind + '" data-id="' + esc(id) + '" class="' + btnMini + ' !text-rose-500" title="حذف">🗑️</button></div>';
  }
  function empty(msg) { return '<div class="col-span-full text-center text-xs text-slate-400 py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">' + msg + '</div>'; }

  
  function v241GetCrumbs() {
    var tree = getTree();
    var out = [];
    if (!st.s) return out;
    var S = (tree.stages || []).filter(function (x) { return x.id === st.s; })[0];
    if (!S) return out;
    out.push(S.name);
    if (st.g) {
      var G = (S.grades || []).filter(function (x) { return x.id === st.g; })[0];
      if (G) {
        out.push(G.name);
        if (st.m) {
          var M = (G.subjects || []).filter(function (x) { return x.id === st.m; })[0];
          if (M) out.push(M.name);
        }
      }
    }
    return out;
  }
  function v241StepBack() {
    if (st.v) { st.v = ""; render(); return true; }
    if (st.m) { st.m = ""; render(); return true; }
    if (st.g) { st.g = ""; render(); return true; }
    if (st.s) { st.s = ""; render(); return true; }
    return false;
  }
  function v241GoHome() {
    if (st.s || st.g || st.m || st.v) {
      st.s = ""; st.g = ""; st.m = ""; st.v = "";
      render();
    }
  }
  
  function v256OpenGrade(num) {
    var n = parseInt(num, 10) || 1;
    var sid = n <= 4 ? "s1" : (n <= 9 ? "s2" : "s3");
    st.s = sid;
    st.g = sid + "-g" + n;
    st.m = "";
    st.v = "";
    render();
    var sec = document.getElementById("learnSection");
    if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  window.EduLearn = Object.assign(window.EduLearn || {}, { openGrade: v256OpenGrade });

  window.EduLearn = Object.assign(window.EduLearn || {}, {
    getCrumbs: v241GetCrumbs,
    stepBack: v241StepBack,
    goHome: v241GoHome
  });

  function render() {
    var __cr = v241GetCrumbs(); if (__cr && __cr.length) { try { localStorage.setItem("edu_last_lesson_v256", JSON.stringify({ s: st.s, g: st.g, m: st.m, label: __cr.join(" › ") })); } catch (e) {} } if (window.EduRouter && typeof window.EduRouter.onLearnNavigated === 'function') { try { window.EduRouter.onLearnNavigated(__cr); } catch (e) {} }
    ensure();
    var body = document.getElementById("lnBody"); if (!body) return;
    var c = cur();
    if (st.s && !c.S) st.s = st.g = st.m = st.v = "";
    else if (st.g && !c.G) st.g = st.m = st.v = "";
    else if (st.m && !c.M) st.m = st.v = "";
    c = cur();
    var ed = canEdit(), h = "";

    if (!c.S) { // المراحل
      h = head("المراحل الدراسية", "اختر مرحلتك ثم صفك لتجد الدروس والفيديوهات التعليمية", '<button type="button" data-act="add" data-kind="stage" class="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-extrabold"><i class="fa-solid fa-plus ml-1"></i>إضافة مرحلة</button>');
      h += '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">' + (c.t.stages.map(function (S) {
        var n = countVideos(S);
        return '<div class="relative group"><button type="button" data-open="s" data-id="' + esc(S.id) + '" class="w-full text-right rounded-3xl p-6 text-white bg-gradient-to-br ' + COLORS[S.color % COLORS.length] + ' shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all min-h-[170px] flex flex-col justify-between">' +
          '<i class="fa-solid ' + esc(S.icon || "fa-school") + ' text-4xl opacity-90"></i><div><h3 class="text-lg font-black">' + esc(S.name) + '</h3><p class="text-xs opacity-90 mt-1">' + esc(S.desc || "") + '</p>' +
          '<p class="text-[11px] mt-3 font-bold opacity-95">' + S.grades.length + ' صفوف • ' + n + ' فيديو</p></div></button>' + adminBar("stage", S.id) + '</div>';
      }).join("") || empty("لا توجد مراحل بعد.")) + '</div>';
    } else if (!c.G) { // الصفوف
      h = crumbs(c) + head(c.S.name, c.S.desc, '<button type="button" data-act="add" data-kind="grade" class="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-extrabold"><i class="fa-solid fa-plus ml-1"></i>إضافة صف</button>');
      if (c.S.id === "s4" || /جامع/.test(c.S.name)) {
        h += '<div class="mb-5 p-4 sm:p-5 rounded-3xl bg-gradient-to-l from-indigo-950 via-brand-900 to-slate-900 text-white border-2 border-amber-400/50 shadow-xl flex flex-wrap items-center justify-between gap-3">' +
          '<div><div class="text-xs font-black text-amber-300 mb-0.5">🎓 أداة الخيار الجامعي والخريجين الجديدة</div><h3 class="text-base sm:text-lg font-black">أنشئ سيرتك الذاتية الاحترافية (CV) باللغتين العربية والإنجليزية خلال دقيقتين</h3><p class="text-xs text-slate-300 mt-0.5">قوالب جاهزة متوافقة مع ATS لطلاب الجامعات والخريجين والمعلمين مع ترجمة فورية وتصدير PDF وWord.</p></div>' +
          '<button type="button" data-open-cv="1" class="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-lg shrink-0">📄 افتح منشئ السيرة الذاتية (CV) الآن</button></div>';
      }
      h += '<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">' + (c.S.grades.map(function (G) {
        return '<div class="relative"><button type="button" data-open="g" data-id="' + esc(G.id) + '" class="w-full text-right rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 glass-card hover:border-brand-400 hover:-translate-y-0.5 transition-all">' +
          '<div class="w-11 h-11 rounded-xl bg-gradient-to-br ' + COLORS[c.S.color % COLORS.length] + ' text-white flex items-center justify-center mb-3"><i class="fa-solid fa-chalkboard"></i></div>' +
          '<h3 class="font-extrabold text-sm text-slate-900 dark:text-white">' + esc(G.name) + '</h3><p class="text-[11px] text-slate-500 mt-1">' + G.subjects.length + ' مواد • ' + countVideos(G) + ' فيديو</p></button>' + adminBar("grade", G.id) + '</div>';
      }).join("") || empty("لا توجد صفوف في هذه المرحلة بعد.")) + '</div>';
    } else if (!c.M) { // المواد
      h = crumbs(c) + head(c.S.name + " — " + c.G.name, "اختر المادة", '<button type="button" data-act="add" data-kind="subject" class="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-extrabold"><i class="fa-solid fa-plus ml-1"></i>إضافة مادة</button>');
      h += '<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">' + (c.G.subjects.map(function (M) {
        return '<div class="relative"><button type="button" data-open="m" data-id="' + esc(M.id) + '" class="w-full text-right rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 glass-card hover:border-brand-400 hover:-translate-y-0.5 transition-all">' +
          '<div class="w-11 h-11 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300 flex items-center justify-center mb-3 text-lg"><i class="fa-solid ' + subjIcon(M.name) + '"></i></div>' +
          '<h3 class="font-extrabold text-sm text-slate-900 dark:text-white">' + esc(M.name) + '</h3><p class="text-[11px] text-slate-500 mt-1">' + v293MergedVideos(c.G, M).length + ' فيديو/قائمة • ' + (booksFor(c.G, M).length + resFor(M).length) + ' مورد</p></button>' + adminBar("subject", M.id) + '</div>';
      }).join("") || empty("لا توجد مواد في هذا الصف بعد.")) + '</div>';
    } else { // صفحة المادة: تبويبات
      var tab = st.t || "v";
      h = crumbs(c) + head(c.M.name, c.S.name + " — " + c.G.name, tab === "v" ? '<button type="button" data-act="add" data-kind="video" class="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-extrabold"><i class="fa-solid fa-plus ml-1"></i>إضافة فيديو</button><button type="button" data-act="bulk" data-kind="video" class="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-extrabold">إضافة عدة فيديوهات</button>' : "");
      h += '<div class="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">' + TABS.map(function (T) { var on = T[0] === tab; return '<button type="button" data-tab="' + T[0] + '" class="px-3.5 py-2 rounded-full text-[12px] whitespace-nowrap shrink-0 ' + (on ? "bg-brand-600 text-white font-extrabold" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200") + '">' + T[1] + " " + T[2] + ' <span class="opacity-70">(' + tabCount(c.G, c.M, T[0]) + ")</span></button>"; }).join("") + "</div>";
      if (tab !== "v") h += resTab(c, tab);
      else {
      var vids = v293MergedVideos(c.G, c.M), v = byId(vids, st.v) || vids[0] || null;
      if (!vids.length) h += '<div class="grid">' + empty(ed ? "لا توجد فيديوهات بعد. اضغط «إضافة فيديو» وألصق رابط يوتيوب." : "سيتم إضافة الفيديوهات قريباً 🎬") + '</div>';
      else {
        h += '<div class="grid lg:grid-cols-3 gap-5"><div class="lg:col-span-2 min-w-0" id="lnPlayer">' + playerHtml(v) +
          '<h3 class="mt-3 text-base font-black text-slate-900 dark:text-white">' + esc(v.title) + '</h3>' +
          (v.desc ? '<p class="mt-1 text-xs leading-loose text-slate-600 dark:text-slate-300 whitespace-pre-line">' + esc(v.desc) + '</p>' : "") +
          '<button type="button" data-act="share" class="mt-3 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold"><i class="fa-solid fa-link ml-1"></i>نسخ رابط الفيديو</button><button type="button" data-ra="vshare" class="mt-3 mr-2 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-700 text-[11px] font-bold">↗ واتساب</button><button type="button" data-ra="vfav" class="mt-3 mr-2 px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-700 text-[11px] font-bold">' + (window.EduBoost && window.EduBoost.isFav("vid:" + v.id) ? "⭐ في المفضلة" : "☆ مفضلة") + '</button>' + (v293ElearnUrl(c.G) ? '<a href="' + esc(v293ElearnUrl(c.G)) + '" target="_blank" rel="noopener" class="inline-block mt-3 mr-2 px-3 py-1.5 rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300 text-[11px] font-bold">🏛️ بوابة الوزارة (كتب وأوراق عمل)</a>' : '') + (function () {
          var sk = v293SubKey(c.M && c.M.name), gn = v293GradeNum(c.G && c.G.name), btns = "";
          var openLab = function (k, lbl) {
            return '<button type="button" onclick="(function(){var f=function(){if(window.EduV294Labs)window.EduV294Labs.open(\'' + k + '\');};if(window.EduV294Labs)f();else if(window.EduModules&&window.EduModules.loadScript)window.EduModules.loadScript(\'js/v294-smart-labs.js\').then(f);})()" class="inline-block mt-3 mr-2 px-3 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">' + lbl + '</button>';
          };
          if (sk === "إسلام") btns += openLab("quran", "📖 المصحف المعلّم للتلاوة");
          if (sk === "علوم" || sk === "فيزياء" || sk === "كيمياء" || sk === "أحياء") btns += openLab("phet", "🧪 مختبر PhET العربي");
          if (sk === "رياض") btns += openLab("geogebra", "📐 الراسم البياني GeoGebra");
          if (sk === "تكنولوج") btns += openLab("blockly", "🧩 مختبر البرمجة Blockly");
          if (gn === "12") btns += openLab("tawjihi_exams", "🏛️ بنك امتحانات التوجيهي");
          return btns;
        })() + '</div>' +
          '<div class="space-y-2 max-h-[560px] overflow-y-auto pr-1 min-w-0">' + vids.map(function (x, i) {
            var t = thumbOf(x), active = x.id === v.id;
            return '<div class="relative"><button type="button" data-open="v" data-id="' + esc(x.id) + '" class="w-full flex items-center gap-3 text-right p-2 rounded-xl border ' + (active ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-300") + ' transition-all">' +
              '<div class="w-24 aspect-video shrink-0 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center">' + (t ? '<img src="' + esc(t) + '" alt="" loading="lazy" class="w-full h-full object-cover">' : '<i class="fa-solid fa-circle-play text-xl text-brand-500"></i>') + '</div>' +
              '<div class="min-w-0"><div class="text-[10px] text-slate-400 font-bold">' + (x.builtin ? '📺 قائمة دروس كاملة • ' + esc(x.channel || 'منهاج فلسطين') : 'الدرس ' + (i + 1)) + '</div><div class="text-xs font-extrabold text-slate-800 dark:text-slate-100 leading-snug">' + esc(x.title) + '</div></div></button>' +
              (ed && !x.builtin ? '<div class="absolute bottom-1 left-1 flex gap-1" data-stop="1"><button type="button" data-act="up" data-kind="video" data-id="' + esc(x.id) + '" class="' + btnMini + '">⬆️</button><button type="button" data-act="down" data-kind="video" data-id="' + esc(x.id) + '" class="' + btnMini + '">⬇️</button><button type="button" data-act="edit" data-kind="video" data-id="' + esc(x.id) + '" class="' + btnMini + '">✏️</button><button type="button" data-act="del" data-kind="video" data-id="' + esc(x.id) + '" class="' + btnMini + ' !text-rose-500">🗑️</button></div>' : "") + '</div>';
          }).join("") + '</div></div>';
      }
      }
    }
    // تجنّب إعادة بناء المشغّل إن لم يتغير شيء (حتى لا ينقطع الفيديو عند وصول تحديث سحابي)
    var sig = (ed ? 1 : 0) + (canRes() ? 1 : 0) + h;
    if (body.dataset.sig === sig) return;
    body.dataset.sig = sig;
    body.innerHTML = h;
  }

  // ---------- تبويبات الموارد ----------
  var TOOLBTN = { worksheet: [["ws", "📝 ولّد ورقة عمل"]], exam: [["ex", "✅ ولّد اختبار إلكتروني"]], summary: [["gensum", "🧠 ولّد ملخصاً بالذكاء الاصطناعي"], ["tu", "🤖 المعلم الذكي والخرائط الذهنية"]], other: [["gm", "🎮 ولّد لعبة تفاعلية"], ["sl", "🎞 عرض"], ["lp", "📘 خطة درس"]], book: [["tu", "🤖 اشرح لي من الكتاب"], ["gm", "🎮 لعبة من الكتاب"]] };
  function resTab(c, tab) {
    var M = c.M, G = c.G, ed = canRes(), items = [];
    if (tab === "book") booksFor(G, M).forEach(function (b) { items.push({ fromBooks: true, id: "bk:" + b.id, title: b.title, url: b.url, term: b.term, cover: b.cover, desc: "", kind: "book" }); });
    resFor(M, tab).forEach(function (r) { items.push(r); });
    var integrated = "";
    if ((tab === "book" || tab === "worksheet" || tab === "summary" || tab === "exam") && window.EduMasterHierarchy && window.EduMasterHierarchy.findSubject) {
      var mhHit = window.EduMasterHierarchy.findSubject(G.name, M.name);
      if (mhHit && mhHit.subject) {
        var mhSub = mhHit.subject;
        // v237: الأولوية المطلقة لكتبك المرفوعة! إذا رفعت كتباً تظهر هنا مباشرة ويُخفى التكرار بالأسفل
        var uploadedBooks = (tab === "book") ? items.slice() : [];
        var hasUploaded = uploadedBooks.length > 0;
        var fallbackUrl = mhSub.officialUrl || "";
        var unitsList = (mhSub.units && mhSub.units.length) ? mhSub.units : [];
        var speakSummaryText = "مادة " + M.name + " للصف " + G.name + (unitsList.length ? "، وتشمل الوحدات التالية: " + unitsList.join("، و") : "");

        var booksButtonsHtml = hasUploaded
          ? uploadedBooks.map(function (ub) {
              var termTag = ub.term === "1" ? " (الفصل الأول)" : (ub.term === "2" ? " (الفصل الثاني)" : "");
              return '<div class="flex items-center gap-1.5">' +
                '<button type="button" data-v234-inline-pdf="' + esc(ub.url || "") + '" class="flex-1 text-right px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow flex items-center justify-between gap-2">' +
                  '<span class="truncate">📖 ' + esc(ub.title || M.name) + termTag + '</span>' +
                  '<span class="shrink-0 text-[10px] bg-white/20 px-2 py-0.5 rounded-lg">فتح هنا</span>' +
                '</button>' +
                (ed && !ub.fromBooks ? '<button type="button" data-ra="edit" data-id="' + esc(ub.id) + '" class="px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs" title="تعديل">✏️</button><button type="button" data-ra="del" data-id="' + esc(ub.id) + '" class="px-2.5 py-2 rounded-xl bg-rose-500/15 text-rose-500 text-xs" title="حذف">🗑️</button>' : '') +
              '</div>';
            }).join("")
          : (fallbackUrl
              ? '<button type="button" data-v234-inline-pdf="' + esc(fallbackUrl) + '" class="w-full px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow">📖 تصفّح الكتاب المدرسي الآن</button>'
              : '<p class="text-xs text-slate-400">لم يُرفع كتاب لهذه المادة بعد.</p>');

        integrated =
          '<div class="mb-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5" dir="rtl">' +
            '<div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">' +
              '<div class="min-w-0">' +
                '<div class="text-[11px] font-black text-emerald-600 dark:text-emerald-400">' + (hasUploaded ? '📘 كتبك المعتمدة المرفوعة للمادة' : '📘 الكتاب المدرسي الرسمي') + '</div>' +
                '<h3 class="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">' + esc(mhSub.bookTitle || M.name) + '</h3>' +
              '</div>' +
              '<div class="flex items-center gap-1.5 shrink-0">' +
                '<button type="button" data-tts-text="' + esc(speakSummaryText) + '" data-tts-gender="male" class="px-3 py-2 rounded-xl bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 text-xs font-black">🔊 استمع</button>' +
                (ed && tab === "book" ? '<button type="button" data-ra="add" data-rk="book" class="px-3 py-2 rounded-xl bg-rose-600 text-white text-xs font-black">➕ إضافة كتاب</button>' : '') +
              '</div>' +
            '</div>' +
            (tab === "book" ? '<div class="space-y-2">' + booksButtonsHtml + '</div>' : '') +
            '<div id="v234InlinePdfStage" class="hidden rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-950"></div>' +
            (unitsList.length ? (
              '<div class="space-y-1.5">' +
                '<div class="text-xs font-black text-slate-600 dark:text-slate-300">📑 فهرس الوحدات والفصول (' + unitsList.length + '):</div>' +
                '<div class="space-y-1.5">' +
                  unitsList.map(function (u, ui) {
                    var activePdf = hasUploaded ? (uploadedBooks[0].url || "") : fallbackUrl;
                    return '<details class="group rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3 py-2">' +
                      '<summary class="cursor-pointer list-none flex items-center justify-between text-xs font-extrabold text-slate-800 dark:text-slate-100">' +
                        '<span>' + (ui + 1) + '. ' + esc(u) + '</span>' +
                        '<span class="text-[10px] text-sky-600 dark:text-sky-400 font-black">قراءة ▾</span>' +
                      '</summary>' +
                      '<div class="mt-2 pt-2 border-t border-slate-200/70 dark:border-slate-700/70 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">' +
                        '<p>تركّز هذه الوحدة على المفاهيم والمهارات الأساسية لـ «' + esc(u) + '» ضمن منهاج ' + esc(G.name) + '.</p>' +
                        '<div class="flex flex-wrap gap-1.5">' +
                          (activePdf ? '<button type="button" data-v234-inline-pdf="' + esc(activePdf) + '" class="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-black">📖 افتح الكتاب</button>' : '') +
                          '<button type="button" data-tts-text="' + esc("وحدة " + u + " من مادة " + M.name + " للصف " + G.name) + '" data-tts-gender="male" class="px-2.5 py-1 rounded-lg bg-sky-600 text-white text-[11px] font-black">🔊 استماع</button>' +
                        '</div>' +
                      '</div>' +
                    '</details>';
                  }).join("") +
                '</div>' +
              '</div>'
            ) : '') +
            '<div class="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">' +
              '<button type="button" data-mh-open="cornell" class="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-500/15 text-slate-800 dark:text-slate-100 text-xs font-black">📓 ملخص</button>' +
              '<button type="button" data-mh-open="flashcards" class="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/15 text-slate-800 dark:text-slate-100 text-xs font-black">🃏 بطاقات</button>' +
              '<button type="button" data-mh-open="quiz" class="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/15 text-slate-800 dark:text-slate-100 text-xs font-black">✅ اختبرني</button>' +
            '</div>' +
          '</div>';
        // منع تكرار عرض نفس الكتب في البطاقة السفلية أو شريط الأزرار الأصفر المكرر
        if (tab === "book") { items = []; }
      }
    }
    var bar = "";
    if (ed && !(tab === "book" && integrated)) {
      bar = '<div class="flex flex-wrap gap-2 mb-4"><button type="button" data-ra="add" data-rk="' + tab + '" class="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-extrabold"><i class="fa-solid fa-plus ml-1"></i>إضافة ' + KIND_LBL[tab] + '</button>' +
        (TOOLBTN[tab] || []).map(function (t) { return '<button type="button" data-rt="' + t[0] + '" class="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-extrabold">' + t[1] + "</button>"; }).join("") + "</div>";
    }
    var body = items.length ? '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">' + items.map(function (r) {
      var url = String(r.url || "").trim(), has = /^(https?:\/\/|\/api\/media\/)/i.test(url);
      var th = r.cover ? '<img src="' + esc(safeUrl(r.cover)) + '" alt="" loading="lazy" class="w-14 h-[74px] object-cover rounded-lg shrink-0">' : '<div class="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300 flex items-center justify-center text-lg shrink-0"><i class="fa-solid ' + (KIND_ICO[r.kind] || "fa-file") + '"></i></div>';
      return '<div class="rounded-2xl p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-2 min-w-0"><div class="flex gap-3 items-start">' + th + '<div class="min-w-0 flex-1"><h3 class="font-extrabold text-sm text-slate-900 dark:text-white leading-snug break-words">' + esc(r.title) + '</h3>' +
        (r.term === "1" || r.term === "2" ? '<span class="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-300">' + (r.term === "1" ? "الفصل الأول" : "الفصل الثاني") + "</span>" : "") +
        (r.desc ? '<p class="text-[11px] text-slate-500 mt-1 leading-relaxed">' + esc(r.desc) + "</p>" : "") + '</div></div>' +
        '<div class="flex gap-1.5 mt-auto">' + (r.fromBooks ? '<button type="button" data-ra="readbk" data-id="' + esc(r.id.replace(/^bk:/, "")) + '" class="flex-1 text-center px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[11px] font-extrabold">📖 معاينة وقراءة + أخذ للأدوات</button>' : r.sum ? '<button type="button" data-ra="viewsum" data-id="' + esc(r.id) + '" class="flex-1 text-center px-3 py-2 rounded-lg bg-brand-600 text-white text-[11px] font-bold">اقرأ الملخص</button>' : has ? '<a href="' + esc(fileUrl(url)) + '" target="_blank" rel="noopener" class="flex-1 text-center px-3 py-2 rounded-lg bg-brand-600 text-white text-[11px] font-bold">' + (r.kind === "exam" ? "ابدأ الاختبار" : "فتح") + '</a>' : '<span class="flex-1 text-center text-[10px] text-slate-400 py-2">لا يوجد رابط</span>') +
        (ed && !r.fromBooks ? '<button type="button" data-ra="edit" data-id="' + esc(r.id) + '" class="px-2.5 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-[11px]">✏️</button><button type="button" data-ra="del" data-id="' + esc(r.id) + '" class="px-2.5 py-2 rounded-lg bg-rose-500/10 text-rose-500 text-[11px]">🗑️</button>' : "") +
        (r.fromBooks ? '<span class="self-center text-[9px] text-slate-400">من قسم الكتب</span>' : "") +
        '<button type="button" data-ra="fav" data-id="' + esc(r.id) + '" aria-label="مفضلة" class="px-2.5 py-2 rounded-lg bg-amber-500/15 text-amber-600 text-[12px]">' + (window.EduBoost && window.EduBoost.isFav("res:" + r.id) ? "⭐" : "☆") + '</button><button type="button" data-ra="share" data-id="' + esc(r.id) + '" aria-label="مشاركة" class="px-2.5 py-2 rounded-lg bg-emerald-500/15 text-emerald-700 text-[11px]">↗</button>' + "</div></div>";
    }).join("") + "</div>" : '<div class="grid">' + (integrated ? "" : empty(ed ? "لا يوجد محتوى هنا بعد. اضغط «إضافة " + KIND_LBL[tab] + "»." : "سيتم إضافة المحتوى قريباً 📚")) + "</div>";
    return integrated + bar + body;
  }
  function resForm(r, kind) {
    var c = cur(), isNew = !r; r = r || { kind: kind || "other", title: "", url: "", term: "", desc: "" };
    var kopt = Object.keys(KIND_LBL).map(function (k) { return '<option value="' + k + '"' + (k === r.kind ? " selected" : "") + ">" + KIND_LBL[k] + "</option>"; }).join("");
    modal(isNew ? "إضافة محتوى للمادة" : "تعديل المحتوى",
      '<select id="rsK" class="' + inp + '">' + kopt + '</select><input id="rsT" class="' + inp + '" placeholder="العنوان *" value="' + esc(r.title) + '">' +
      '<input id="rsU" dir="ltr" class="' + inp + ' text-left" placeholder="الرابط (Drive / PDF / رابط اختبار) https://..." value="' + esc(r.url) + '">' +
      (window.EduMedia && window.EduMedia.ready() && canEdit() ? '<label class="inline-block px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold cursor-pointer"><i class="fa-solid fa-upload ml-1"></i>رفع PDF أو Word من جهازك<input id="rsF" type="file" accept="application/pdf,.pdf,.docx,.pptx" class="hidden"></label>' : "") +
      '<select id="rsM" class="' + inp + '"><option value="">الفصل: غير محدد</option><option value="1"' + (r.term === "1" ? " selected" : "") + '>الفصل الأول</option><option value="2"' + (r.term === "2" ? " selected" : "") + '>الفصل الثاني</option></select>' +
      '<textarea id="rsD" rows="3" class="' + inp + '" placeholder="وصف قصير (اختياري)">' + esc(r.desc || "") + "</textarea>",
      function () {
        var title = val("rsT").trim(), url = val("rsU").trim();
        if (!title) { showToast("اكتب العنوان", "warning"); return; }
        if (url && !/^(https?:\/\/|\/api\/media\/)/i.test(url)) { showToast("الرابط يجب أن يبدأ بـ https://", "warning"); return; }
        var data = { kind: val("rsK"), title: title, url: url, term: val("rsM"), desc: val("rsD").trim(), stageId: st.s, gradeId: st.g, subjectId: st.m };
        if (!isNew) { data.stageId = r.stageId || st.s; data.gradeId = r.gradeId || st.g; data.subjectId = r.subjectId || st.m; }
        saveRes([{ id: isNew ? "rs-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5) : r.id, data: data }]).then(function () { closeModal(); showToast("تم الحفظ ✓", "success"); }, failRes);
      });
    var rf = document.getElementById("rsF");
    if (rf) rf.addEventListener("change", function () { var f = rf.files[0]; if (!f) return; window.EduMedia.upload(f, "docs").then(function (u) { document.getElementById("rsU").value = u; if (!document.getElementById("rsT").value) document.getElementById("rsT").value = f.name.replace(/\.[^.]+$/, ""); showToast("تم رفع الملف ✓ اضغط حفظ", "success"); }, function () {}); });
  }
  // نشر عنصر من الأدوات داخل مادة: EduPublish.open({kind,title,url})
  function publishForm(pre) {
    if (!canRes()) { showToast("النشر في المواد للإدارة والمشرفين فقط 🔒", "warning"); return; }
    var t = getTree();
    modal("📌 انشر في مادة دراسية",
      '<input id="pbT" class="' + inp + '" placeholder="العنوان *" value="' + esc(pre.title || "") + '"><select id="pbK" class="' + inp + '">' + Object.keys(KIND_LBL).map(function (k) { return '<option value="' + k + '"' + (k === (pre.kind || "other") ? " selected" : "") + ">" + KIND_LBL[k] + "</option>"; }).join("") + '</select>' +
      '<select id="pbS" class="' + inp + '">' + t.stages.map(function (S) { return '<option value="' + esc(S.id) + '">' + esc(S.name) + "</option>"; }).join("") + '</select><select id="pbG" class="' + inp + '"></select><select id="pbM" class="' + inp + '"></select>' +
      '<select id="pbTm" class="' + inp + '"><option value="">الفصل: غير محدد</option><option value="1">الفصل الأول</option><option value="2">الفصل الثاني</option></select><input id="pbU" dir="ltr" class="' + inp + ' text-left" value="' + esc(pre.url || "") + '">',
      function () {
        var title = val("pbT").trim(); if (!title || !val("pbM")) { showToast("اكتب العنوان واختر المادة", "warning"); return; }
        saveRes([{ id: "rs-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), data: { kind: val("pbK"), title: title, url: val("pbU").trim(), term: val("pbTm"), desc: "", stageId: val("pbS"), gradeId: val("pbG"), subjectId: val("pbM") } }]).then(function () { closeModal(); showToast("تم النشر في المادة ✓", "success"); }, failRes);
      }, "نشر");
    function fillG() { var S = byId(t.stages, val("pbS")); document.getElementById("pbG").innerHTML = (S ? S.grades : []).map(function (G) { return '<option value="' + esc(G.id) + '">' + esc(G.name) + "</option>"; }).join(""); fillM(); }
    function fillM() { var S = byId(t.stages, val("pbS")), G = S && byId(S.grades, val("pbG")); document.getElementById("pbM").innerHTML = (G ? G.subjects : []).map(function (M) { return '<option value="' + esc(M.id) + '">' + esc(M.name) + "</option>"; }).join(""); }
    document.getElementById("pbS").addEventListener("change", fillG); document.getElementById("pbG").addEventListener("change", fillM); fillG();
  }

  // ---------- الملخصات بالذكاء الاصطناعي ----------
  function sumHtml(m) {
    var h = '<h2 style="font-size:19px;font-weight:900;margin:0 0 6px">' + esc(m.title) + "</h2>";
    if (m.intro) h += '<p style="margin:0 0 10px;line-height:1.9">' + esc(m.intro) + "</p>";
    if (m.points && m.points.length) h += '<h3 style="font-size:14px;font-weight:900;margin:10px 0 4px">أهم الأفكار</h3><ul style="margin:0;padding:0 18px 0 0;line-height:2">' + m.points.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
    if (m.terms && m.terms.length) h += '<h3 style="font-size:14px;font-weight:900;margin:12px 0 4px">مصطلحات الدرس</h3>' + m.terms.map(function (t) { return '<div style="line-height:1.9"><b>' + esc(t.t) + ":</b> " + esc(t.d) + "</div>"; }).join("");
    if (m.remember) h += '<div style="margin-top:12px;padding:10px 12px;border:2px dashed #0369a1;border-radius:12px;font-weight:700;line-height:1.9">💡 تذكّر: ' + esc(m.remember) + "</div>";
    return h;
  }
  function printSum(r) {
    var html = '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet"><style>@page{size:A4;margin:16mm}body{font-family:Cairo,Tahoma,Arial,sans-serif;font-size:14px;color:#000}</style></head><body>' + sumHtml(r.sum) + "</body></html>";
    var f = document.createElement("iframe"); f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0"; document.body.appendChild(f);
    f.contentDocument.open(); f.contentDocument.write(html); f.contentDocument.close();
    setTimeout(function () { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (x) {} setTimeout(function () { f.remove(); }, 4000); }, 900);
  }
  function viewSum(r) {
    showModalContent('<div class="p-4 shrink-0 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50"><h3 class="text-sm font-extrabold">📋 ملخص</h3><button type="button" class="p-2 text-slate-400" onclick="closeModal()"><i class="fa-solid fa-xmark"></i></button></div><div class="p-4 overflow-y-auto flex-1 min-h-0 text-right text-sm">' + sumHtml(r.sum) + '</div><div class="p-3 shrink-0 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/50"><button type="button" id="smPrint" class="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">🖨 طباعة / PDF</button></div>');
    document.getElementById("smPrint").addEventListener("click", function () { printSum(r); });
  }
  function genSumForm() {
    if (!canRes()) return;
    if (!window.AI || !window.AI.ask) { showToast("أداة الذكاء الاصطناعي غير متاحة", "warning"); return; }
    var c = cur(), lessons = [];
    if (window.EduBooks) booksFor(c.G, c.M).forEach(function (b) { (b.lessons || []).forEach(function (l) { lessons.push({ t: l.t, x: l.x || "", b: b.title }); }); });
    modal("🧠 ولّد ملخصاً — " + c.M.name,
      (lessons.length ? '<select id="smL" class="' + inp + '"><option value="">— اختر درساً من كتب المادة —</option>' + lessons.map(function (l, i) { return '<option value="' + i + '">' + esc(l.t) + (l.x ? " 📄" : "") + "</option>"; }).join("") + "</select>" : "") +
      '<input id="smT" class="' + inp + '" placeholder="عنوان الدرس *"><textarea id="smX" rows="7" maxlength="6000" class="' + inp + '" placeholder="الصق نص الدرس هنا (كلما كان النص كاملاً كان الملخص أدق). يمكنك الاكتفاء بالعنوان فيولّد من معرفته العامة."></textarea>' +
      '<select id="smM" class="' + inp + '"><option value="">الفصل: غير محدد</option><option value="1">الفصل الأول</option><option value="2">الفصل الثاني</option></select><div id="smSt" class="text-[11px] font-bold text-slate-500"></div>',
      function () {
        var title = val("smT").trim(); if (!title) { showToast("اكتب عنوان الدرس", "warning"); return; }
        var btn = document.getElementById("lnSave"), stx = document.getElementById("smSt"); btn.disabled = true; btn.textContent = "جارٍ التوليد…"; stx.textContent = "⏳ قد يستغرق حتى نصف دقيقة";
        var txt = val("smX").trim(); lastTerm = val("smM");
        var prompt = "لخّص الدرس التالي لطلاب " + c.G.name + " في مادة " + c.M.name + " (المنهج الفلسطيني) بلغة عربية مبسطة وواضحة تناسب أعمارهم.\nعنوان الدرس: " + title + "\n" + (txt ? "نص الدرس:\n" + txt + "\n" : "") +
          "أعد JSON فقط بلا أي شرح خارجه بهذا الشكل بالضبط: {\"title\":\"عنوان الملخص\",\"intro\":\"جملتان تمهيديتان\",\"points\":[\"فكرة قصيرة\",\"...\"],\"terms\":[{\"t\":\"مصطلح\",\"d\":\"تعريفه\"}],\"remember\":\"قاعدة أو فكرة يتذكرها الطالب\"} — points من 5 إلى 9 أفكار، terms من 0 إلى 5، ولا تخترع معلومات غير موجودة في النص.";
        window.AI.ask(prompt, [], "summary").then(function (t) {
          var sx = String(t || "").replace(/```json|```/gi, ""), a = sx.indexOf("{"), b = sx.lastIndexOf("}");
          if (a < 0 || b <= a) throw new Error("x"); var m = JSON.parse(sx.slice(a, b + 1)); if (!m.points || !m.points.length) throw new Error("x");
          m.title = m.title || title;
          var body = btn.parentNode.previousElementSibling; body.innerHTML = '<div class="text-[11px] text-emerald-600 font-bold mb-2">✓ تمت المعاينة، راجعها ثم انشرها</div>' + sumHtml(m);
          var nb = btn.cloneNode(true); btn.parentNode.replaceChild(nb, btn); nb.disabled = false; nb.textContent = "نشر في المادة";
          nb.addEventListener("click", function () {
            nb.disabled = true;
            saveRes([{ id: "rs-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), data: { kind: "summary", title: m.title, url: "", sum: m, term: lastTerm, desc: "", stageId: st.s, gradeId: st.g, subjectId: st.m } }]).then(function () { closeModal(); showToast("تم نشر الملخص ✓", "success"); }, function (e) { nb.disabled = false; failRes(e); });
          });
        }).catch(function () { btn.disabled = false; btn.textContent = "حفظ"; stx.textContent = "تعذر التوليد، أعد المحاولة."; });
      }, "ولّد");
    var sl = document.getElementById("smL");
    if (sl) sl.addEventListener("change", function () { var l = lessons[+sl.value]; if (l) { document.getElementById("smT").value = l.t; document.getElementById("smX").value = l.x; } });
  }
  var lastTerm = "";

  // ---------- النماذج ----------
  function modal(title, inner, onSave, saveLabel) {
    showModalContent('<div class="p-4 shrink-0 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50"><h3 class="text-sm font-extrabold">' + esc(title) + '</h3><button type="button" class="p-2 text-slate-400" onclick="closeModal()"><i class="fa-solid fa-xmark"></i></button></div>' +
      '<div class="p-4 overflow-y-auto flex-1 min-h-0 space-y-2 text-right">' + inner + '</div>' +
      '<div class="p-3 shrink-0 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/50"><button type="button" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold" onclick="closeModal()">إلغاء</button><button type="button" id="lnSave" class="px-5 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold">' + (saveLabel || "حفظ") + '</button></div>');
    document.getElementById("lnSave").addEventListener("click", onSave);
  }
  function val(id) { return (document.getElementById(id) || {}).value || ""; }
  function lines(id) { return val(id).split("\n").map(function (l) { return l.trim(); }).filter(Boolean); }
  function done(msg) { return function () { closeModal(); showToast(msg, "success"); }; }

  function addForm(kind) {
    var c = cur();
    if (kind === "stage") {
      modal("إضافة مرحلة دراسية", '<input id="lnName" class="' + inp + '" placeholder="اسم المرحلة *"><input id="lnDesc" class="' + inp + '" placeholder="وصف قصير (مثال: الصفوف من 1 إلى 4)">' + colorIconFields(0, "fa-school"), function () {
        var name = val("lnName").trim(); if (!name) { showToast("اكتب اسم المرحلة", "warning"); return; }
        mutate(function (t) { t.stages.push({ id: uid("s"), name: name, desc: val("lnDesc").trim(), color: +val("lnColor") || 0, icon: val("lnIcon") || "fa-school", grades: [] }); }).then(done("تمت إضافة المرحلة ✓"));
      });
    } else if (kind === "grade" || kind === "subject") {
      var lbl = kind === "grade" ? "الصفوف" : "المواد";
      modal("إضافة " + lbl, '<p class="text-[11px] text-slate-500">اكتب كل ' + (kind === "grade" ? "صف" : "مادة") + ' في سطر مستقل لإضافة عدة عناصر دفعة واحدة.</p><textarea id="lnLines" rows="7" class="' + inp + '" placeholder="' + (kind === "grade" ? "الصف الأول&#10;الصف الثاني" : "الرياضيات&#10;العلوم") + '"></textarea>', function () {
        var ls = lines("lnLines"); if (!ls.length) { showToast("اكتب اسماً واحداً على الأقل", "warning"); return; }
        mutate(function (t) {
          var S = byId(t.stages, st.s), G = S && byId(S.grades, st.g);
          ls.forEach(function (n) {
            if (kind === "grade") S.grades.push({ id: uid("g"), name: n, subjects: [] });
            else G.subjects.push({ id: uid("m"), name: n, videos: [] });
          });
        }).then(done("تمت الإضافة ✓"));
      });
    } else if (kind === "video") videoForm(null);
  }

  function colorIconFields(color, icon) {
    return '<label class="block text-[11px] font-bold">اللون</label><select id="lnColor" class="' + inp + '">' + COLOR_NAMES.map(function (n, i) { return '<option value="' + i + '"' + (i === color ? " selected" : "") + '>' + n + '</option>'; }).join("") + '</select>' +
      '<label class="block text-[11px] font-bold">الأيقونة</label><select id="lnIcon" class="' + inp + '">' + STAGE_ICONS.map(function (n) { return '<option value="' + n + '"' + (n === icon ? " selected" : "") + '>' + n.replace("fa-", "") + '</option>'; }).join("") + '</select>';
  }

  function editForm(kind, id) {
    var c = cur(), o;
    if (kind === "stage") o = byId(c.t.stages, id);
    else if (kind === "grade") o = byId(c.S.grades, id);
    else if (kind === "subject") o = byId(c.G.subjects, id);
    else return videoForm(byId(c.M.videos, id));
    if (!o) return;
    var extra = kind === "stage" ? '<input id="lnDesc" class="' + inp + '" placeholder="وصف قصير" value="' + esc(o.desc || "") + '">' + colorIconFields(o.color || 0, o.icon || "fa-school") : "";
    modal("تعديل", '<input id="lnName" class="' + inp + '" value="' + esc(o.name) + '">' + extra, function () {
      var name = val("lnName").trim(); if (!name) return;
      mutate(function (t) {
        var T = kind === "stage" ? byId(t.stages, id) : kind === "grade" ? byId(byId(t.stages, st.s).grades, id) : byId(byId(byId(t.stages, st.s).grades, st.g).subjects, id);
        T.name = name;
        if (kind === "stage") { T.desc = val("lnDesc").trim(); T.color = +val("lnColor") || 0; T.icon = val("lnIcon") || "fa-school"; }
      }).then(done("تم الحفظ ✓"));
    });
  }

  function videoForm(v) {
    var isNew = !v; v = v || { title: "", url: "", desc: "" };
    modal(isNew ? "إضافة فيديو" : "تعديل فيديو",
      '<input id="lnTitle" class="' + inp + '" placeholder="عنوان الدرس *" value="' + esc(v.title) + '">' +
      '<input id="lnUrl" dir="ltr" class="' + inp + ' text-left" placeholder="رابط يوتيوب أو Google Drive أو ملف mp4 https://..." value="' + esc(v.url) + '">' +
      '<div id="lnKind" class="text-[11px] font-bold text-emerald-600"></div>' +
      '<textarea id="lnDesc" rows="4" class="' + inp + '" placeholder="وصف الدرس (اختياري)">' + esc(v.desc || "") + '</textarea>' +
      (window.EduMedia && window.EduMedia.ready() ? '<label class="inline-block px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold cursor-pointer"><i class="fa-solid fa-upload ml-1"></i>رفع فيديو mp4 من جهازك<input id="lnFile" type="file" accept="video/mp4,video/webm" class="hidden"></label>' : "") + '<p class="text-[10px] text-slate-400 leading-relaxed">يدعم: فيديو يوتيوب، قائمة تشغيل يوتيوب كاملة (فتظهر كلها في مشغّل واحد)، ملف من Google Drive (يجب أن يكون «أي شخص لديه الرابط»)، أو رابط مباشر لملف mp4.</p>',
      function () {
        var title = val("lnTitle").trim(), url = val("lnUrl").trim();
        if (!title || parseVideo(url).kind === "none") { showToast("اكتب العنوان ورابطاً صحيحاً يبدأ بـ https://", "warning"); return; }
        mutate(function (t) {
          var M = byId(byId(byId(t.stages, st.s).grades, st.g).subjects, st.m);
          if (isNew) { var nv = { id: uid("v"), title: title, url: url, desc: val("lnDesc").trim() }; M.videos.push(nv); st.v = nv.id; }
          else { var T = byId(M.videos, v.id); T.title = title; T.url = url; T.desc = val("lnDesc").trim(); }
        }).then(done("تم حفظ الفيديو ✓"));
      });
    var u = document.getElementById("lnUrl"), k = document.getElementById("lnKind");
    function chk() { var p = parseVideo(u.value); k.textContent = p.kind === "none" ? "" : "✓ تم التعرّف: " + KIND_NAME[p.kind]; }
    u.addEventListener("input", chk); chk();
    var lf = document.getElementById("lnFile");
    if (lf) lf.addEventListener("change", function () { var f = lf.files[0]; if (!f) return; window.EduMedia.upload(f, "video").then(function (url) { u.value = url; if (!document.getElementById("lnTitle").value) document.getElementById("lnTitle").value = f.name.replace(/\.[^.]+$/, ""); chk(); showToast("تم رفع الفيديو ✓ اضغط حفظ", "success"); }, function () {}); });
  }

  function bulkForm() {
    modal("إضافة عدة فيديوهات", '<p class="text-[11px] text-slate-500">كل فيديو في سطر: <span class="font-mono">عنوان الدرس | الرابط</span></p><textarea id="lnLines" rows="9" dir="rtl" class="' + inp + '" placeholder="الدرس الأول | https://youtu.be/xxxxxxxxxxx&#10;الدرس الثاني | https://youtu.be/yyyyyyyyyyy"></textarea>', function () {
      var rows = lines("lnLines").map(function (l) { var p = l.split("|").map(function (x) { return x.trim(); }); return { title: p[0], url: p[1] || "" }; }).filter(function (r) { return r.title && parseVideo(r.url).kind !== "none"; });
      if (!rows.length) { showToast("لم أجد أسطراً صحيحة (عنوان | رابط)", "warning"); return; }
      mutate(function (t) {
        var M = byId(byId(byId(t.stages, st.s).grades, st.g).subjects, st.m);
        rows.forEach(function (r) { M.videos.push({ id: uid("v"), title: r.title, url: r.url, desc: "" }); });
      }).then(done("تمت إضافة " + rows.length + " فيديو ✓"));
    }, "إضافة الكل");
  }

  // ---------- الأحداث ----------
  function listOf(t, kind) {
    var S = byId(t.stages, st.s), G = S && byId(S.grades, st.g), M = G && byId(G.subjects, st.m);
    return kind === "stage" ? t.stages : kind === "grade" ? S.grades : kind === "subject" ? G.subjects : M.videos;
  }
  function onClick(e) {
    var cvBtn = e.target.closest("[data-open-cv]");
    if (cvBtn) {
      if (window.EduCVBuilder && window.EduCVBuilder.open) window.EduCVBuilder.open();
      else if (window.EduLauncher && window.EduLauncher.jump) window.EduLauncher.jump("cvBuilderStudio", true);
      return;
    }
    var rb = e.target.closest("[data-tab],[data-ra],[data-rt]");
    if (rb) {
      if (rb.dataset.tab) { st.t = rb.dataset.tab; render(); return; }
      if (rb.dataset.rt === "gensum") { genSumForm(); return; }
      if (rb.dataset.rt) { var cc = cur(); if (window.EduBooks && cc.M) { var gk = ordKey(cc.G.name), gfull = (window.EduBooks.GR || []).filter(function (x) { return x.indexOf(gk) === 0 && (gk.length > 6 || !/عشر/.test(x) || /عشر/.test(gk)); })[0] || ""; window.EduBooks.tool(rb.dataset.rt, { title: cc.M.name + " — " + cc.G.name, subject: cc.M.name, grade: gfull, stage: cc.S.name, noBook: true }); } return; }
      var ra = rb.dataset.ra, rid = rb.dataset.id;
      var cc2 = cur(), lab = cc2.M ? cc2.M.name + " — " + cc2.G.name : "";
      if (ra === "share" || ra === "fav") {
        var all = booksFor(cc2.G, cc2.M).map(function (b) { return { id: "bk:" + b.id, title: b.title, kind: "book", url: b.url }; }).concat(resFor(cc2.M, ""));
        var it = all.filter(function (z) { return z.id === rid; })[0]; if (!it || !window.EduBoost) return;
        if (ra === "share") window.EduBoost.share(it.title + (lab ? " — " + lab : ""), window.EduBoost.linkOf(st.s, st.g, st.m, ""));
        else { window.EduBoost.toggleFav({ id: "res:" + rid, k: it.kind || "other", title: it.title, label: lab, s: st.s, g: st.g, m: st.m, t: it.kind === "book" ? "book" : (it.kind || "other") }); render(); }
        return;
      }
      if (ra === "vshare" || ra === "vfav") {
        var vv = byId(cc2.M.videos, st.v) || cc2.M.videos[0]; if (!vv || !window.EduBoost) return;
        if (ra === "vshare") window.EduBoost.share(vv.title + " — " + lab, window.EduBoost.linkOf(st.s, st.g, st.m, vv.id));
        else { window.EduBoost.toggleFav({ id: "vid:" + vv.id, k: "video", title: vv.title, label: lab, s: st.s, g: st.g, m: st.m, t: "v", v: vv.id }); render(); }
        return;
      }
      if (ra === "readbk") { if (window.EduBookReader && window.EduBookReader.open) window.EduBookReader.open(rid, 0, "interactive"); return; }
      if (ra === "viewsum") { var rr = byId(resList(), rid); if (rr) viewSum(rr); }
      else if (ra === "add") resForm(null, rb.dataset.rk);
      else if (ra === "edit") resForm(byId(resList(), rid));
      else if (ra === "del") { if (!window.eduConfirm("حذف هذا المحتوى؟")) return; saveRes([{ id: rid, remove: true }]).then(function () { showToast("تم الحذف", "info"); }, failRes); }
      return;
    }
    var b = e.target.closest("[data-go],[data-open],[data-act]"); if (!b) return;
    if (b.dataset.go !== undefined) {
      var lv = b.dataset.go; if (lv === "") st.s = st.g = st.m = st.v = ""; else if (lv === "s") st.g = st.m = st.v = ""; else if (lv === "g") st.m = st.v = "";
      syncHash(); render(); return;
    }
    if (b.dataset.open) {
      var k = b.dataset.open, id = b.dataset.id;
      if (k === "s") { st.s = id; st.g = st.m = st.v = ""; } else if (k === "g") { st.g = id; st.m = st.v = ""; } else if (k === "m") { st.m = id; st.v = ""; st.t = "v"; } else st.v = id;
      syncHash(); render();
      if (k !== "v") { var sec = document.getElementById("learnSection"); if (sec && sec.getBoundingClientRect().top < 0) sec.scrollIntoView({ behavior: "smooth", block: "start" }); }
      return;
    }
    var act = b.dataset.act, kind = b.dataset.kind, id2 = b.dataset.id;
    if (act === "add") addForm(kind);
    else if (act === "bulk") bulkForm();
    else if (act === "edit") editForm(kind, id2);
    else if (act === "share") { var url = location.origin + location.pathname + "#learn/" + [st.s, st.g, st.m, st.v || (cur().M && cur().M.videos[0] || {}).id].filter(Boolean).join("/"); try { navigator.clipboard.writeText(url); showToast("تم نسخ الرابط 🔗", "success"); } catch (x) { window.eduPrompt("انسخ الرابط:", url); } }
    else if (act === "up" || act === "down") {
      mutate(function (t) {
        var arr = listOf(t, kind), i = arr.findIndex(function (x) { return x.id === id2; }), j = act === "up" ? i - 1 : i + 1;
        if (i < 0 || j < 0 || j >= arr.length) return; var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
      });
    } else if (act === "del") {
      var o = byId(listOf(getTree(), kind), id2), n = o ? countVideos(o) : 0;
      if (!window.eduConfirm("حذف «" + (o ? (o.name || o.title) : "") + "»" + (kind !== "video" && n ? " مع " + n + " فيديو بداخله" : "") + "؟")) return;
      mutate(function (t) { var arr = listOf(t, kind); arr.splice(arr.findIndex(function (x) { return x.id === id2; }), 1); }).then(function () { showToast("تم الحذف", "info"); });
    }
  }

  function parseHash() {
    var m = /^#learn\/([^/]+)(?:\/([^/]+))?(?:\/([^/]+))?(?:\/([^/]+))?/.exec(location.hash || "");
    if (!m) return false;
    st = { s: m[1], g: m[2] || "", m: m[3] || "", v: m[4] || "", t: "v" };
    return true;
  }

  var baseRender = null, hashOpen = false;
  window.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
      hashOpen = parseHash();
      ensure(); render();
      baseRender = window.renderExtras;
      window.renderExtras = function () { if (baseRender) baseRender(); render(); };
      if (cloud() && window.Cloud.subscribeDoc) {
        window.Cloud.subscribeDoc("site", "curriculum", function (d) {
          cloudTree = d && d.tree && d.tree.stages ? d.tree : null; render();
          if (hashOpen) { hashOpen = false; var s = document.getElementById("learnSection"); if (s) setTimeout(function () { s.scrollIntoView({ behavior: "smooth" }); }, 300); }
        }, function () { render(); });
      } else if (hashOpen) { var s = document.getElementById("learnSection"); if (s) setTimeout(function () { s.scrollIntoView(); }, 300); }
      if (cloud() && window.Cloud.subscribeResources) window.Cloud.subscribeResources(function (l) { cloudRes = l; render(); if (window.EduBoost) window.EduBoost.repaint(); }, function () {});
    }, 10);
  });
  window.EduPublish = { open: publishForm };
  window.EduLearn = { render: render, tree: getTree, parseVideo: parseVideo, thumbOf: thumbOf,
    data: function () { return { tree: getTree(), res: resList(), books: (window.EduBooks && window.EduBooks.list()) || [] }; },
    go: function (s, g, m, tab, v) { st = { s: s || "", g: g || "", m: m || "", v: v || "", t: tab || "v" }; syncHash(); render(); if (window.EduMasterHierarchy && window.EduMasterHierarchy.navigateToTarget) { window.EduMasterHierarchy.navigateToTarget("learnSection"); } else { var el = document.getElementById("learnSection"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); } },
    locateBook: function (b) {
      var gk = ordKey(b.grade || (window.EduBooks && window.EduBooks.guess ? window.EduBooks.guess(b) : "")), t = getTree(), out = null;
      if (!gk) return null;
      t.stages.forEach(function (S) { S.grades.forEach(function (G) { if (!out && ordKey(G.name) === gk) G.subjects.forEach(function (M) { if (!out && b.subject && subjMatch(b.subject, M.name)) out = { s: S.id, g: G.id, m: M.id }; }); }); });
      return out;
    } };

  document.addEventListener("click", function (ev) {
    var btn = ev.target && ev.target.closest ? ev.target.closest("[data-mh-open]") : null;
    if (!btn) return;
    var mode = btn.getAttribute("data-mh-open") || "book";
    var c = typeof cur === "function" ? cur() : null;
    if (c && c.G && c.M && window.EduMasterHierarchy && window.EduMasterHierarchy.openSubject) {
      window.EduMasterHierarchy.openSubject(c.G.name, c.M.name, mode);
    }
  });

  document.addEventListener("click", function (ev) {
    var sb = ev.target && ev.target.closest ? ev.target.closest("[data-mh-speak]") : null;
    if (!sb) return;
    var c = typeof cur === "function" ? cur() : null;
    if (c && c.G && c.M && window.EduMasterHierarchy && window.EduMasterHierarchy.findSubject) {
      var hit = window.EduMasterHierarchy.findSubject(c.G.name, c.M.name);
      if (hit && hit.subject) {
        var sub = hit.subject;
        var txt = (sub.bookTitle || sub.name) + ". " + (sub.units ? sub.units.join(". ") : "");
        window.EduMasterHierarchy.speakText(txt);
      }
    }
  });
})();

/* v232: تثبيت قسم المراحل الأصلية (#learnSection) مباشرة بعد الدورات ليكون الأساس الواضح للطالب */
(function () {
  function v232PositionLearn() {
    var ls = document.getElementById("learnSection");
    var cs = document.getElementById("hero");
    if (!ls) return;
    ls.classList.remove("hidden");
    ls.classList.add("edu-section-active");
    ls.style.setProperty("display", "block", "important");
    if (cs && cs.parentNode && cs.nextSibling !== ls) {
      cs.parentNode.insertBefore(ls, cs.nextSibling);
    }
  }
  setTimeout(v232PositionLearn, 500);
  setTimeout(v232PositionLearn, 1500);
})();

/* v234: ربط تبويب «الكتاب» في المراحل الدراسية مباشرة بالقارئ التفاعلي الطبيعي ومعاينة PDF المدمجة */
document.addEventListener("click", function (ev) {
  var pdfBtn = ev.target && ev.target.closest ? ev.target.closest("[data-v234-inline-pdf]") : null;
  if (pdfBtn) {
    var rawUrl = pdfBtn.getAttribute("data-v234-inline-pdf") || "";
    var stage = document.getElementById("v234InlinePdfStage");
    if (!stage || !rawUrl) return;
    if (!stage.classList.contains("hidden")) {
      stage.classList.add("hidden"); stage.innerHTML = "";
      pdfBtn.textContent = "👁️ معاينة الكتاب PDF هنا";
      return;
    }
    var mDrive = rawUrl.match(/\/d\/([a-zA-Z0-9_-]{10,})/) || rawUrl.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
    var embedUrl = mDrive ? ("https://drive.google.com/file/d/" + mDrive[1] + "/preview") : rawUrl;
    stage.classList.remove("hidden");
    stage.innerHTML =
      '<div class="flex items-center justify-between px-3 py-2 bg-slate-900 text-white text-xs font-black" dir="rtl">' +
        '<span>📘 الكتاب المدرسي الأصلي (PDF)</span>' +
        '<div class="flex items-center gap-2">' +
          '<button type="button" onclick="var s=document.getElementById(\'v234InlinePdfStage\');if(s)s.classList.toggle(\'edu-inline-pdf-fs\');" class="px-2.5 py-1 rounded-lg bg-sky-500 text-slate-950 text-[11px] font-black">⛶ ملء الشاشة</button><a href="' + rawUrl.replace(/"/g, "&quot;") + '" target="_blank" rel="noopener" class="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 text-[11px] font-black">⬇️ تحميل</a>' +
          '<button type="button" onclick="var s=document.getElementById(\'v234InlinePdfStage\');if(s){s.classList.add(\'hidden\');s.innerHTML=\'\';}" class="px-2 py-1 rounded-lg bg-white/15 text-white text-[11px]">✕</button>' +
        '</div>' +
      '</div>' +
      '<iframe src="' + embedUrl.replace(/"/g, "&quot;") + '" class="w-full h-[540px] bg-white" allow="autoplay; fullscreen" title="الكتاب المدرسي PDF"></iframe>';
    pdfBtn.textContent = "✕ إغلاق المعاينة";
    stage.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return;
  }

  var rBtn = ev.target && ev.target.closest ? ev.target.closest("[data-v234-reader]") : null;
  if (rBtn) {
    var parts = (rBtn.getAttribute("data-v234-reader") || "").split("||");
    var gName = parts[0] || "", mName = parts[1] || "";
    function launchBR() {
      var sec = document.getElementById("bookReaderStudio");
      if (sec) {
        sec.classList.remove("hidden");
        sec.classList.add("edu-section-active");
        sec.style.setProperty("display", "block", "important");
        sec.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (window.EduBookReader && typeof window.EduBookReader.open === "function") {
        var list = (window.EduBooks && window.EduBooks.list) ? window.EduBooks.list() : [];
        var match = list.filter(function (b) {
          var t = (b.title || "") + " " + (b.grade || "") + " " + (b.subject || "");
          return (mName && t.indexOf(mName) !== -1) && (!gName || t.indexOf(gName.replace("الصف ", "")) !== -1);
        })[0];
        window.EduBookReader.open(match ? match.id : null, 0, match && match.url ? "preview" : "interactive");
      }
    }
    if (window.EduLauncher && typeof window.EduLauncher.jump === "function") {
      try { window.EduLauncher.jump("bookReaderStudio", true); } catch (e) {}
      setTimeout(launchBR, 300);
    } else {
      launchBR();
    }
  }
});
