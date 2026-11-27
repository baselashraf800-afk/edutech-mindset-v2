/*
 * الفصول الافتراضية وبوابة الطالب وسجل الدرجات التراكمي — EduTech Mindset (الإصدار 43)
 * يتيح للمعلم إنشاء فصول دراسية برمز انضمام قصير، نشر الواجبات والاختبارات والألعاب فيها،
 * ومتابعة سجل الدرجات التراكمي للطلاب وتصديره كملف Excel/CSV أو كشف PDF،
 * كما يتيح للطالب الدخول برمز الفصل (?c=CODE) لمتابعة مهامه واختباراته وإنجازاته بلا بريد إلكتروني.
 */
(function () {
  "use strict";
  var COL = "classrooms";
  var $ = function (id) { return document.getElementById(id); };
  var cloud = function () { return !!(window.Cloud && window.Cloud.enabled && window.Cloud.col); };
  var uid = function () { return window.Cloud && window.Cloud.user ? window.Cloud.user.uid : ""; };
  var e = function (v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var toast = function (m, t) { if (typeof showToast === "function") showToast(m, t || "success"); };
  var cls = "w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100";

  var GRADES = ["الأول الأساسي", "الثاني الأساسي", "الثالث الأساسي", "الرابع الأساسي", "الخامس الأساسي", "السادس الأساسي", "السابع", "الثامن", "التاسع", "العاشر", "الحادي عشر", "الثاني عشر"];
  var S = {
    tab: "student", // student | teacher
    myClasses: [],
    activeClass: null,
    studentClass: null,
    studentName: localStorage.getItem("edu_student_name") || "",
    studentCode: localStorage.getItem("edu_student_code") || "",
    gradebook: null
  };

  function normName(n) {
    return String(n || "").toLowerCase().replace(/[ً-ٰٟـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/\s+/g, " ").trim();
  }

  function genCode() {
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var out = "GZ-";
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return out;
  }

  function classLink(code) {
    return location.origin + location.pathname.replace(/index\.html$/, "") + "?c=" + encodeURIComponent(code);
  }

  // ---------- تحميل فصول المعلم ----------
  function loadTeacherClasses() {
    if (!cloud() || !uid()) { S.myClasses = []; paint(); return; }
    window.Cloud.col(COL).where("ownerUid", "==", uid()).get().then(function (snap) {
      S.myClasses = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
      S.myClasses.sort(function (a, b) { return ((b.updatedAt && b.updatedAt.seconds) || 0) - ((a.updatedAt && a.updatedAt.seconds) || 0); });
      if (S.activeClass) {
        var found = S.myClasses.filter(function (c) { return c.id === S.activeClass.id; })[0];
        S.activeClass = found || null;
      }
      paint();
    }, function () { paint(); });
  }

  // ---------- فتح فصل للطالب بالرمز ----------
  function joinByCode(code, name) {
    code = String(code || "").trim().toUpperCase();
    if (!code) { toast("أدخل رمز الفصل أولاً", "warning"); return; }
    if (name !== undefined) {
      name = String(name || "").trim();
      if (name.length < 2) { toast("اكتب اسمك الثلاثي أو الثنائي للدخول", "warning"); return; }
      S.studentName = name;
      try { localStorage.setItem("edu_student_name", name); } catch (x) {}
    }
    try { localStorage.setItem("edu_student_code", code); } catch (x) {}
    S.studentCode = code;

    if (!cloud()) { toast("الاتصال بقاعدة البيانات غير متاح حالياً", "warning"); return; }
    var btn = $("clJoinBtn"); if (btn) { btn.disabled = true; btn.textContent = "⏳ جارٍ الدخول…"; }
    window.Cloud.col(COL).doc(code).get().then(function (d) {
      if (!d.exists) {
        toast("رمز الفصل غير صحيح، تأكد من معلمك", "warning");
        if (btn) { btn.disabled = false; btn.textContent = "🚀 دخول الفصل"; }
        return;
      }
      S.studentClass = Object.assign({ id: d.id }, d.data()); if (window.EduBadges && window.EduBadges.award) window.EduBadges.award("class_member", 30, true);
      try { localStorage.setItem("edu_class_cache_" + code, JSON.stringify(S.studentClass)); } catch (x) {}
      paint();
    }, function () {
      try {
        var cached = JSON.parse(localStorage.getItem("edu_class_cache_" + code) || "null");
        if (cached) { S.studentClass = cached; toast("تم فتح النسخة المحفوظة للفصل (بلا إنترنت)", "info"); paint(); return; }
      } catch (x) {}
      toast("تعذر الاتصال لفتح الفصل", "warning");
      if (btn) { btn.disabled = false; btn.textContent = "🚀 دخول الفصل"; }
    });
  }

  // ---------- بناء سجل الدرجات التراكمي الشامل للفصل (الاختبارات + الواجبات المصوّرة) ----------
  function loadGradebook(cl) {
    if (!cloud() || !uid() || !cl) return;
    var gradedItems = (cl.items || []).filter(function (it) { return (it.kind === "exam" || it.kind === "hw") && it.refId; });
    var box = $("clGradebookBox");
    if (box) box.innerHTML = '<p class="text-xs font-bold text-slate-500 py-4 text-center">⏳ جارٍ تجميع درجات الطلاب عبر اختبارات وواجبات الفصل…</p>';
    if (!gradedItems.length) {
      if (box) box.innerHTML = '<p class="text-xs text-slate-500 py-4 text-center">لم تُضف اختبارات إلكترونية أو واجبات مصوّرة لهذا الفصل بعد. أضف اختباراً أو واجباً لعرض سجل الدرجات التراكمي.</p>';
      return;
    }
    Promise.all([
      window.Cloud.col("examResults").where("ownerUid", "==", uid()).get().catch(function () { return { docs: [] }; }),
      window.Cloud.col("hwSubmissions").where("ownerUid", "==", uid()).get().catch(function () { return { docs: [] }; }),
      window.Cloud.col("homeworks").where("ownerUid", "==", uid()).get().catch(function () { return { docs: [] }; })
    ]).then(function (snaps) {
      var allExamRes = snaps[0].docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
      var allHwSubs = snaps[1].docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
      var hwMaxMap = {};
      snaps[2].docs.forEach(function (d) { var hd = d.data(); hwMaxMap[d.id] = +hd.maxPts || 10; });

      var itemIds = {}; gradedItems.forEach(function (it) { itemIds[it.refId] = it; });
      var map = {};

      allExamRes.forEach(function (r) {
        if (!itemIds[r.examId]) return;
        var key = normName(r.name);
        if (!key) return;
        if (!map[key]) map[key] = { displayName: r.name, scores: {}, totalPct: 0, count: 0 };
        var prev = map[key].scores[r.examId];
        if (!prev || (r.pct || 0) >= (prev.pct || 0)) {
          map[key].scores[r.examId] = { score: r.score, max: r.max, pct: r.pct || 0, rid: r.id };
        }
      });

      allHwSubs.forEach(function (s) {
        if (!itemIds[s.hwId] || s.score == null || s.score < 0) return;
        var key = normName(s.name);
        if (!key) return;
        var mx = hwMaxMap[s.hwId] || 10;
        var pct = Math.round((+s.score || 0) * 100 / mx);
        if (!map[key]) map[key] = { displayName: s.name, scores: {}, totalPct: 0, count: 0 };
        var prev = map[key].scores[s.hwId];
        if (!prev || pct >= (prev.pct || 0)) {
          map[key].scores[s.hwId] = { score: s.score, max: mx, pct: pct, rid: s.id };
        }
      });

      var students = Object.keys(map).map(function (k) {
        var stObj = map[k];
        var sum = 0, cnt = 0;
        gradedItems.forEach(function (ex) {
          if (stObj.scores[ex.refId]) { sum += stObj.scores[ex.refId].pct; cnt++; }
        });
        stObj.count = cnt;
        stObj.avg = cnt ? Math.round(sum / cnt) : 0;
        return stObj;
      }).sort(function (a, b) { return b.avg - a.avg; });

      S.gradebook = { exams: gradedItems, students: students };
      renderGradebook(cl);
    }, function () {
      if (box) box.innerHTML = '<p class="text-xs text-rose-600 py-4 text-center">تعذر تحميل سجل الدرجات.</p>';
    });
  }

  function renderGradebook(cl) {
    var box = $("clGradebookBox"); if (!box || !S.gradebook) return;
    var exams = S.gradebook.exams, students = S.gradebook.students;
    if (!students.length) {
      box.innerHTML = '<p class="text-xs text-slate-500 py-4 text-center">لا توجد تسليمات مصححة من الطلاب على اختبارات أو واجبات هذا الفصل حتى الآن.</p>';
      return;
    }
    var classAvg = Math.round(students.reduce(function (a, s) { return a + s.avg; }, 0) / students.length);
    var h = '<div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/50 p-3 space-y-3">' +
      '<div class="flex flex-wrap items-center justify-between gap-2">' +
      '<div class="text-xs font-black">📊 سجل الدرجات التراكمي الشامل (' + students.length + ' طالب • متوسط الفصل: <span class="text-emerald-600">' + classAvg + '%</span>)</div>' +
      '<div class="flex flex-wrap gap-1.5">' +
      '<button type="button" id="clToRemedial" class="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-[11px] font-extrabold">🩹 خطة علاجية للضعاف</button>' +
      '<button type="button" id="clExportCsv" class="px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-[11px] font-extrabold">⬇ تنزيل Excel/CSV</button>' +
      '<button type="button" id="clPrintGb" class="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-[11px] font-extrabold">🖨 طباعة كشف الدرجات PDF</button>' +
      '</div></div>' +
      '<div class="overflow-x-auto"><table class="w-full text-[11px] font-semibold border-collapse bg-white dark:bg-slate-800">' +
      '<thead><tr class="bg-slate-200 dark:bg-slate-700"><th class="p-2 border">#</th><th class="p-2 border text-right">اسم الطالب</th>' +
      exams.map(function (ex, i) { return '<th class="p-2 border text-center" title="' + e(ex.title) + '">' + (ex.kind === "hw" ? "واجب " : "اختبار ") + (i + 1) + '<br><span class="text-[9px] font-normal">' + e(ex.title.slice(0, 18)) + '</span></th>'; }).join("") +
      '<th class="p-2 border text-center">المعدل</th><th class="p-2 border text-center">المستوى</th><th class="p-2 border text-center">إجراء</th></tr></thead><tbody>' +
      students.map(function (s, idx) {
        var badge = s.avg >= 85 ? '<span class="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-black">🌟 متميز</span>'
          : s.avg >= 65 ? '<span class="px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300 font-bold">📈 جيد جداً</span>'
          : s.avg >= 50 ? '<span class="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold">👍 مقبول</span>'
          : '<span class="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold">⚠️ يحتاج دعماً</span>';
        return '<tr><td class="p-1.5 border text-center font-black">' + (idx + 1) + '</td><td class="p-1.5 border font-extrabold">' + e(s.displayName) + '</td>' +
          exams.map(function (ex) {
            var sc = s.scores[ex.refId];
            return '<td class="p-1.5 border text-center">' + (sc ? '<b>' + sc.score + '/' + sc.max + '</b> <span class="text-[10px] text-slate-500">(' + sc.pct + '%)</span>' : '<span class="text-slate-400">—</span>') + '</td>';
          }).join("") +
          '<td class="p-1.5 border text-center font-black text-brand-600 dark:text-brand-300">' + s.avg + '%</td>' +
          '<td class="p-1.5 border text-center">' + badge + '</td>' +
          '<td class="p-1.5 border text-center"><button type="button" data-clparent="' + idx + '" class="px-2 py-1 rounded-lg bg-teal-600 text-white text-[10px] font-bold" title="إصدار بطاقة متابعة لولي الأمر">👨‍👩‍👧‍👦 ولي الأمر</button></td></tr>';
      }).join("") + '</tbody></table></div></div>';
    box.innerHTML = h;

    if ($("clToRemedial")) $("clToRemedial").onclick = function () {
      var low = students.filter(function (s) { return s.avg < 60; }).map(function (s) { return s.displayName + " (" + s.avg + "%)"; });
      var desc = "خطة علاجية لطلاب فصل «" + (cl.title || "") + "» ذوي المعدل التراكمي المنخفض" + (low.length ? ": " + low.slice(0, 8).join("، ") : "");
      if (window.EduPortfolio && window.EduPortfolio.openWithRemedial) {
        window.EduPortfolio.openWithRemedial({
          kind: "remedial",
          subject: cl.subject || "المادة",
          grade: cl.grade || "السابع",
          weakness: desc
        });
      }
    };

    box.querySelectorAll("[data-clparent]").forEach(function (bt) {
      bt.onclick = function () {
        var s = students[+bt.dataset.clparent];
        if (!s || !window.EduParents || !window.EduParents.openWithStudent) return;
        window.EduParents.openWithStudent({
          name: s.displayName,
          grade: cl.grade || "السابع",
          subject: cl.subject || "",
          school: cl.school || "",
          teacher: cl.teacher || "",
          avg: s.avg,
          summary: "أنجز " + s.count + " من مهام واختبارات فصل «" + (cl.title || "") + "» بمعدل تراكمي " + s.avg + "%"
        });
      };
    });

    $("clExportCsv").onclick = function () {
      var head = ["#", "اسم الطالب"].concat(exams.map(function (x) { return x.title; })).concat(["عدد الاختبارات المنجزة", "المعدل العام %"]);
      var q = function (v) { return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"'; };
      var rows = students.map(function (s, i) {
        return [i + 1, s.displayName].concat(exams.map(function (ex) {
          var sc = s.scores[ex.refId];
          return sc ? sc.score + "/" + sc.max + " (" + sc.pct + "%)" : "";
        })).concat([s.count, s.avg + "%"]).map(q).join(",");
      });
      var csv = [head.map(q).join(",")].concat(rows).join("\r\n");
      var a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
      a.download = "سجل-درجات-" + (cl.title || cl.id) + ".csv";
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    };

    $("clPrintGb").onclick = function () {
      var html = '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>كشف درجات — ' + e(cl.title) + '</title>' +
        '<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">' +
        '<style>@page{size:A4;margin:12mm}body{font-family:Cairo,Tahoma,sans-serif;color:#111;font-size:12px}h1{text-align:center;margin:0 0 4px;font-size:20px}.meta{text-align:center;margin-bottom:14px;color:#444}table{width:100%;border-collapse:collapse}th,td{border:1px solid #333;padding:6px 8px;text-align:center}th{background:#f1f5f9;font-weight:900}td.nm{text-align:right;font-weight:700}</style></head><body>' +
        '<h1>كشف الدرجات التراكمي — ' + e(cl.title) + '</h1>' +
        '<div class="meta">' + e([cl.school, cl.grade, cl.subject, cl.teacher ? "المعلم: " + cl.teacher : ""].filter(Boolean).join(" • ")) + '</div>' +
        '<table><thead><tr><th>#</th><th>اسم الطالب</th>' + exams.map(function (ex) { return '<th>' + e(ex.title) + '</th>'; }).join("") + '<th>المعدل العام</th></tr></thead><tbody>' +
        students.map(function (s, idx) {
          return '<tr><td>' + (idx + 1) + '</td><td class="nm">' + e(s.displayName) + '</td>' +
            exams.map(function (ex) { var sc = s.scores[ex.refId]; return '<td>' + (sc ? sc.score + ' / ' + sc.max + ' (' + sc.pct + '%)' : '—') + '</td>'; }).join("") +
            '<td><b>' + s.avg + '%</b></td></tr>';
        }).join("") + '</tbody></table></body></html>';
      var f = document.createElement("iframe"); f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0"; document.body.appendChild(f);
      f.contentDocument.open(); f.contentDocument.write(html); f.contentDocument.close();
      setTimeout(function () { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (x) {} setTimeout(function () { f.remove(); }, 4000); }, 700);
    };
  }

  // ---------- شهادة تفوق الفصل للطالب ----------
  function printClassCert(cl, studentName, completedCount) {
    var d = new Date().toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" });
    var html = '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet"><style>@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font-family:Cairo,Tahoma,sans-serif;color:#0f172a}.p{width:210mm;height:296mm;padding:12mm}.b{height:100%;border:4mm double #0284c7;border-radius:8mm;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:10mm;background:linear-gradient(135deg,#f0f9ff,#fff,#fefce8)}h1{font-size:52px;margin:8px 0 12px;color:#0369a1;font-weight:900}.s{font-size:22px;margin:8px 0}.n{font-size:44px;font-weight:900;color:#b45309;margin:14px 0;border-bottom:3px solid #38bdf8;padding:0 28px 6px}.t{font-size:26px;font-weight:800;margin:8px 0;color:#0f766e}.f{display:flex;gap:40px;margin-top:36px;font-size:18px;font-weight:700}</style></head><body><div class="p"><div class="b"><img src="' + location.origin + '/assets/logo.png" alt="" style="height:85px;margin-bottom:8px" onerror="this.remove()"><div style="font-size:72px">🏆</div><h1>شهادة تميّز والتزام</h1><div class="s">تشهد ' + e(cl.school || "منصة EduTech Mindset التعليمية") + ' بأن الطالب/ـة</div><div class="n">' + e(studentName) + '</div><div class="s">قد أتمّ بنجاح مهام وأنشطة الفصل الدراسي</div><div class="t">' + e(cl.title) + ' (' + e([cl.grade, cl.subject].filter(Boolean).join(" • ")) + ')</div><div class="s">وأنجز <b>' + completedCount + '</b> من المهام والاختبارات المقررة بتفوق</div><div class="f"><span>التاريخ: ' + d + '</span>' + (cl.teacher ? '<span>إشراف المعلم/ـة: ' + e(cl.teacher) + '</span>' : '') + '</div></div></div></body></html>';
    var f = document.createElement("iframe"); f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0"; document.body.appendChild(f);
    f.contentDocument.open(); f.contentDocument.write(html); f.contentDocument.close();
    setTimeout(function () { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (x) {} setTimeout(function () { f.remove(); }, 4000); }, 700);
  }

  // ---------- واجهة القسم ----------
  function paint() {
    var box = $("clBody"); if (!box) return;
    var topTabs = '<div class="flex flex-wrap gap-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">' +
      '<button type="button" data-cltab="student" class="px-4 py-2 rounded-xl text-xs font-extrabold transition-all ' + (S.tab === "student" ? "bg-brand-600 text-white shadow-md" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300") + '">🎒 بوابة الطالب (دخول برمز الفصل)</button>' +
      '<button type="button" data-cltab="teacher" class="px-4 py-2 rounded-xl text-xs font-extrabold transition-all ' + (S.tab === "teacher" ? "bg-emerald-600 text-white shadow-md" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300") + '">👨‍🏫 إدارة فصولي وسجل الدرجات (للمعلم)</button>' +
      '</div>';

    if (S.tab === "student") {
      box.innerHTML = topTabs + renderStudentView();
      bindStudentEvents();
    } else {
      box.innerHTML = topTabs + renderTeacherView();
      bindTeacherEvents();
    }
    box.querySelectorAll("[data-cltab]").forEach(function (b) {
      b.onclick = function () {
        S.tab = b.dataset.cltab;
        if (S.tab === "teacher" && !S.myClasses.length) loadTeacherClasses();
        else paint();
      };
    });
  }

  function renderStudentView() {
    var h = '<div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 p-4 space-y-3">' +
      '<div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">' +
      '<div><label class="block text-[11px] font-bold mb-1">اسمك الكامل</label><input id="clStName" class="' + cls + '" placeholder="مثال: أحمد محمد الفقعاوي" value="' + e(S.studentName) + '"></div>' +
      '<div><label class="block text-[11px] font-bold mb-1">رمز الفصل (يعطيك إياه معلمك)</label><input id="clStCode" dir="ltr" class="' + cls + ' text-center font-mono uppercase !text-sm !font-black" placeholder="GZ-1234" value="' + e(S.studentCode) + '"></div>' +
      '<div class="flex items-end"><button type="button" id="clJoinBtn" class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-l from-brand-600 to-sky-500 text-white text-xs font-black shadow-md">🚀 دخول الفصل</button></div>' +
      '</div></div>';

    var cl = S.studentClass;
    if (!cl) {
      return h + '<div class="text-center py-8 text-xs text-slate-500">أدخل اسمك ورمز الفصل الذي أرسله معلمك لتظهر لك جميع الواجبات والاختبارات والألعاب التفاعلية والملخصات الخاصة بصفك.</div>';
    }

    var items = cl.items || [];
    var doneCount = 0;
    items.forEach(function (it) {
      if (it.kind === "exam" && it.refId && localStorage.getItem("exam_done_" + it.refId)) doneCount++;
      else if (it.kind === "game" && it.refId && localStorage.getItem("game_done_" + it.refId)) doneCount++;
      else if (localStorage.getItem("cl_item_done_" + cl.id + "_" + it.id)) doneCount++;
    });
    var pct = items.length ? Math.round(doneCount * 100 / items.length) : 0;

    h += '<div class="mt-4 rounded-3xl border-2 border-brand-500/30 bg-white dark:bg-slate-800/90 p-4 sm:p-5 space-y-4">' +
      '<div class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">' +
      '<div><span class="inline-block px-2.5 py-0.5 rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-300 text-[11px] font-black mb-1">رمز الفصل: ' + e(cl.id) + '</span>' +
      '<h3 class="text-lg font-black text-slate-900 dark:text-white">' + e(cl.title) + '</h3>' +
      '<p class="text-xs text-slate-500">' + e([cl.grade, cl.subject, cl.school, cl.teacher ? "المعلم: " + cl.teacher : ""].filter(Boolean).join(" • ")) + '</p></div>' +
      '<div class="text-left"><div class="text-xs font-extrabold">إنجازك يا ' + e((S.studentName || "بطل").split(" ")[0]) + ': <span class="text-emerald-600">' + doneCount + ' / ' + items.length + ' (' + pct + '%)</span></div>' +
      '<div class="w-40 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1"><div class="h-full bg-gradient-to-l from-emerald-500 to-sky-500" style="width:' + pct + '%"></div></div>' +
      (doneCount > 0 && pct >= 60 ? '<button type="button" id="clStCert" class="mt-2 px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-[11px] font-black">🏅 اطبع شهادة تميّز الفصل</button>' : '') +
      '</div></div>';

    if (cl.announcement) {
      h += '<div class="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 p-3 text-xs leading-relaxed">' +
        '<div class="font-black text-amber-800 dark:text-amber-300 mb-1">📢 إعلان وتوجيه من المعلم:</div>' +
        '<div class="text-slate-700 dark:text-slate-200 whitespace-pre-line">' + e(cl.announcement) + '</div></div>';
    }

    if (!items.length) {
      h += '<p class="text-xs text-slate-500 text-center py-6">لم ينشر المعلم مهام في هذا الفصل بعد.</p>';
    } else {
      var ICO = { exam: "✅ اختبار إلكتروني", game: "🎮 لعبة تفاعلية", ws: "📝 ورقة عمل", summary: "📋 ملخص درس", video: "🎬 فيديو تعليمي", hw: "📌 واجب/مهمة" };
      h += '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">' + items.map(function (it) {
        var examDone = it.kind === "exam" && it.refId ? JSON.parse(localStorage.getItem("exam_done_" + it.refId) || "null") : null;
        var gameDone = it.kind === "game" && it.refId ? JSON.parse(localStorage.getItem("game_done_" + it.refId) || "null") : null;
        var manualDone = !!localStorage.getItem("cl_item_done_" + cl.id + "_" + it.id);
        var isDone = !!(examDone || gameDone || manualDone);
        return '<div class="rounded-2xl p-3.5 border ' + (isDone ? "border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20" : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40") + ' flex flex-col justify-between gap-2">' +
          '<div><div class="flex items-center justify-between gap-2"><span class="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-300">' + (ICO[it.kind] || "📌 مهمة") + '</span>' +
          (isDone ? '<span class="text-[10px] font-black text-emerald-600">✔ منجز' + (examDone ? " (" + examDone.score + "/" + examDone.max + ")" : gameDone ? " (" + gameDone.score + " نقطة)" : "") + '</span>' : '<span class="text-[10px] font-bold text-amber-600">⏳ مطلوب</span>') +
          '</div><h4 class="font-extrabold text-sm mt-1.5">' + e(it.title) + '</h4>' +
          (it.note ? '<p class="text-[11px] text-slate-500 mt-1 leading-relaxed">' + e(it.note) + '</p>' : '') + '</div>' +
          '<div class="flex gap-2 mt-2">' +
          (it.url ? '<a href="' + e(it.url) + '" class="flex-1 text-center py-2 px-3 rounded-xl bg-brand-600 text-white text-[11px] font-black">' + (it.kind === "exam" ? "ابدأ الاختبار" : it.kind === "game" ? "العب الآن 🎮" : "فتح المهمة") + '</a>' : '') +
          (it.kind !== "exam" && it.kind !== "game" ? '<button type="button" data-cldone="' + e(it.id) + '" class="px-3 py-2 rounded-xl ' + (manualDone ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-700") + ' text-[11px] font-bold">' + (manualDone ? "✔ أتممتها" : "تحديد كمنجز") + '</button>' : '') +
          '</div></div>';
      }).join("") + '</div>';
    }
    h += '</div>';
    return h;
  }

  function bindStudentEvents() {
    var jb = $("clJoinBtn");
    if (jb) jb.onclick = function () { joinByCode($("clStCode").value, $("clStName").value); };
    var cb = $("clStCert");
    if (cb && S.studentClass) cb.onclick = function () { printClassCert(S.studentClass, S.studentName || "طالب متميز", (S.studentClass.items || []).length); };
    var box = $("clBody");
    if (box && S.studentClass) {
      box.querySelectorAll("[data-cldone]").forEach(function (b) {
        b.onclick = function () {
          var k = "cl_item_done_" + S.studentClass.id + "_" + b.dataset.cldone;
          if (localStorage.getItem(k)) localStorage.removeItem(k); else localStorage.setItem(k, "1");
          paint();
        };
      });
    }
  }

  function renderTeacherView() {
    if (!cloud() || !uid()) {
      return '<div class="text-center py-8"><p class="text-xs text-slate-500 mb-3">سجّل الدخول بحساب Google لإنشاء الفصول الدراسية ومتابعة سجل درجات طلابك.</p><button type="button" onclick="if(typeof openGoogleAuthModal===\'function\')openGoogleAuthModal()" class="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-extrabold">تسجيل الدخول</button></div>';
    }
    var h = '<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">' +
      '<div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 p-4 space-y-2.5">' +
      '<div class="text-xs font-black text-emerald-700 dark:text-emerald-400">➕ إنشاء فصل دراسي جديد</div>' +
      '<input id="clNewTitle" class="' + cls + '" placeholder="اسم الفصل (مثال: الصف التاسع أ - علوم)">' +
      '<div class="grid grid-cols-2 gap-2"><select id="clNewGrade" class="' + cls + '">' + GRADES.map(function (g) { return '<option>' + g + '</option>'; }).join("") + '</select>' +
      '<input id="clNewSubj" class="' + cls + '" placeholder="المادة (علوم، رياضيات…)"></div>' +
      '<div class="grid grid-cols-2 gap-2"><input id="clNewSchool" class="' + cls + '" placeholder="اسم المدرسة (اختياري)"><input id="clNewTeacher" class="' + cls + '" placeholder="اسم المعلم"></div>' +
      '<button type="button" id="clCreateBtn" class="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black shadow">✨ إنشاء الفصل وتوليد الرمز</button>' +
      '<div class="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3"><div class="text-xs font-black mb-2">📂 فصولي الدراسية (' + S.myClasses.length + ')</div>' +
      (S.myClasses.length ? '<div class="space-y-2 max-h-72 overflow-y-auto">' + S.myClasses.map(function (c) {
        var on = S.activeClass && S.activeClass.id === c.id;
        return '<div class="p-2.5 rounded-xl border cursor-pointer transition-all ' + (on ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800") + '" data-clpick="' + e(c.id) + '">' +
          '<div class="flex items-center justify-between"><span class="text-xs font-extrabold">' + e(c.title) + '</span><span class="font-mono text-[11px] font-black px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700">' + e(c.id) + '</span></div>' +
          '<div class="text-[10px] text-slate-500 mt-0.5">' + e([c.grade, c.subject].filter(Boolean).join(" • ")) + ' · ' + ((c.items || []).length) + ' مهام</div></div>';
      }).join("") + '</div>' : '<p class="text-[11px] text-slate-500">لم تنشئ فصلاً بعد.</p>') +
      '</div></div>';

    var ac = S.activeClass;
    if (!ac) {
      h += '<div class="lg:col-span-2 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center p-8 text-xs text-slate-500 text-center">اختر فصلاً من القائمة أو أنشئ فصلاً جديداً لإدارة المهام والاختبارات وعرض سجل الدرجات التراكمي للطلاب.</div></div>';
      return h;
    }

    var link = classLink(ac.id);
    h += '<div class="lg:col-span-2 space-y-4">' +
      '<div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3">' +
      '<div class="flex flex-wrap items-center justify-between gap-2">' +
      '<div><div class="text-sm font-black">' + e(ac.title) + ' <span class="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">الرمز: ' + e(ac.id) + '</span></div>' +
      '<div class="text-[11px] text-slate-500">' + e([ac.grade, ac.subject, ac.school].filter(Boolean).join(" • ")) + '</div></div>' +
      '<div class="flex flex-wrap gap-1.5">' +
      '<button type="button" id="clCopyLink" class="px-3 py-1.5 rounded-xl bg-brand-600 text-white text-[11px] font-extrabold">🔗 نسخ رابط الفصل للطلاب</button>' +
      '<button type="button" id="clShareWa" class="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-[11px] font-extrabold">↗ مشاركة واتساب</button>' +
      '<button type="button" id="clDelClass" class="px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-600 text-[11px] font-extrabold">🗑 حذف</button>' +
      '</div></div>' +
      '<div><label class="block text-[11px] font-bold mb-1">📢 إعلان الفصل / توجيهات الأسبوع للطلاب</label>' +
      '<div class="flex gap-2"><textarea id="clAnnText" rows="2" class="' + cls + '" placeholder="اكتب تنبيهاً أو واجباً يظهر لجميع طلاب الفصل فور دخولهم…">' + e(ac.announcement || "") + '</textarea>' +
      '<button type="button" id="clSaveAnn" class="px-4 rounded-xl bg-amber-500 text-slate-950 text-xs font-black shrink-0">حفظ الإعلان</button></div></div>' +
      '<div class="border-t border-slate-200 dark:border-slate-700 pt-3"><div class="text-xs font-black mb-2">➕ إضافة مهمة / اختبار / لعبة للفصل</div>' +
      '<div class="grid grid-cols-1 sm:grid-cols-4 gap-2">' +
      '<select id="clItKind" class="' + cls + '"><option value="exam">✅ اختبار إلكتروني</option><option value="game">🎮 لعبة تفاعلية</option><option value="ws">📝 ورقة عمل</option><option value="summary">📋 ملخص درس</option><option value="hw">📌 واجب منزلي</option></select>' +
      '<input id="clItTitle" class="' + cls + ' sm:col-span-2" placeholder="عنوان المهمة أو الاختبار">' +
      '<input id="clItUrl" dir="ltr" class="' + cls + '" placeholder="الرابط (?x=ID أو ?g=ID أو https://)">' +
      '</div><div class="flex gap-2 mt-2"><input id="clItNote" class="' + cls + '" placeholder="ملاحظة للطالب (اختياري: موعد التسليم، تعليمات…)">' +
      '<button type="button" id="clAddItemBtn" class="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-black shrink-0">+ أضف للفصل</button></div></div>' +
      '<div class="border-t border-slate-200 dark:border-slate-700 pt-3"><div class="text-xs font-black mb-2">📋 مهام الفصل الحالية (' + ((ac.items || []).length) + ')</div>' +
      ((ac.items || []).length ? '<div class="space-y-1.5">' + (ac.items || []).map(function (it, idx) {
        return '<div class="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-xs">' +
          '<div class="min-w-0 flex-1"><span class="font-extrabold">' + e(it.title) + '</span> <span class="text-[10px] text-slate-500">(' + e(it.kind) + ')</span></div>' +
          '<button type="button" data-clrm="' + idx + '" class="px-2 py-1 rounded-lg bg-rose-500/15 text-rose-600 text-[11px] font-bold">حذف</button></div>';
      }).join("") + '</div>' : '<p class="text-[11px] text-slate-500">لا مهام مضافة بعد. يمكنك أيضاً إضافة أي اختبار أو لعبة مباشرة من أداة الاختبارات أو الألعاب بزر «🏫 أضف إلى فصل».</p>') +
      '</div></div>' +
      '<div id="clGradebookBox"></div></div></div>';
    return h;
  }

  function bindTeacherEvents() {
    var cb = $("clCreateBtn");
    if (cb) cb.onclick = function () {
      var title = $("clNewTitle").value.trim();
      if (!title) { toast("اكتب اسم الفصل الدراسي", "warning"); return; }
      var code = genCode();
      var data = {
        ownerUid: uid(),
        ownerEmail: (window.Cloud.user && window.Cloud.user.email) || "",
        title: title,
        grade: $("clNewGrade").value,
        subject: $("clNewSubj").value.trim(),
        school: $("clNewSchool").value.trim(),
        teacher: $("clNewTeacher").value.trim(),
        announcement: "",
        items: [],
        updatedAt: window.Cloud.stamp()
      };
      window.Cloud.col(COL).doc(code).set(data).then(function () {
        toast("تم إنشاء الفصل برمز: " + code + " ✓");
        S.activeClass = Object.assign({ id: code }, data);
        loadTeacherClasses();
      }, function () { toast("تعذر إنشاء الفصل — تأكد من نشر قواعد Firestore المحدثة", "warning"); });
    };

    var box = $("clBody");
    if (!box) return;
    box.querySelectorAll("[data-clpick]").forEach(function (el) {
      el.onclick = function () {
        var found = S.myClasses.filter(function (c) { return c.id === el.dataset.clpick; })[0];
        if (found) { S.activeClass = found; paint(); loadGradebook(found); }
      };
    });

    var ac = S.activeClass;
    if (!ac) return;
    if ($("clCopyLink")) $("clCopyLink").onclick = function () {
      var l = classLink(ac.id);
      try { navigator.clipboard.writeText(l); toast("تم نسخ رابط الفصل 🔗"); } catch (x) { prompt("انسخ رابط الفصل:", l); }
    };
    if ($("clShareWa")) $("clShareWa").onclick = function () {
      var msg = "انضم إلى فصلي الدراسي «" + ac.title + "» على منصة EduTech Mindset!\n🔑 رمز الفصل: " + ac.id + "\n🔗 الرابط المباشر: " + classLink(ac.id);
      window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank");
    };
    if ($("clDelClass")) $("clDelClass").onclick = function () {
      if (!confirm("حذف الفصل «" + ac.title + "» نهائياً؟")) return;
      window.Cloud.col(COL).doc(ac.id).delete().then(function () {
        toast("تم حذف الفصل", "info"); S.activeClass = null; loadTeacherClasses();
      });
    };
    if ($("clSaveAnn")) $("clSaveAnn").onclick = function () {
      var ann = $("clAnnText").value.trim();
      window.Cloud.col(COL).doc(ac.id).set({ announcement: ann, updatedAt: window.Cloud.stamp() }, { merge: true }).then(function () {
        ac.announcement = ann; toast("تم حفظ إعلان الفصل ✓");
      });
    };
    if ($("clAddItemBtn")) $("clAddItemBtn").onclick = function () {
      var t = $("clItTitle").value.trim(), u = $("clItUrl").value.trim(), k = $("clItKind").value, n = $("clItNote").value.trim();
      if (!t) { toast("اكتب عنوان المهمة", "warning"); return; }
      var refId = "";
      var mx = /[?&](?:x|g|hw)=([A-Za-z0-9_-]+)/.exec(u);
      if (mx) refId = mx[1];
      var items = (ac.items || []).slice();
      items.unshift({ id: "i" + Date.now().toString(36), kind: k, title: t, url: u, refId: refId, note: n });
      window.Cloud.col(COL).doc(ac.id).set({ items: items, updatedAt: window.Cloud.stamp() }, { merge: true }).then(function () {
        ac.items = items; toast("تمت إضافة المهمة للفصل ✓"); paint(); loadGradebook(ac);
      });
    };
    box.querySelectorAll("[data-clrm]").forEach(function (b) {
      b.onclick = function () {
        var idx = +b.dataset.clrm;
        var items = (ac.items || []).slice();
        items.splice(idx, 1);
        window.Cloud.col(COL).doc(ac.id).set({ items: items, updatedAt: window.Cloud.stamp() }, { merge: true }).then(function () {
          ac.items = items; paint(); loadGradebook(ac);
        });
      };
    });
    loadGradebook(ac);
  }

  // ---------- نافذة سريعة لإضافة اختبار أو لعبة إلى فصل ----------
  function assignItemModal(item) {
    if (!cloud() || !uid()) { toast("سجّل الدخول أولاً لإدارة الفصول", "warning"); return; }
    window.Cloud.col(COL).where("ownerUid", "==", uid()).get().then(function (snap) {
      var list = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
      if (!list.length) {
        toast("أنشئ فصلاً دراسياً أولاً من قسم «الفصول الافتراضية وبوابة الطالب»", "warning");
        var sec = $("classroomsStudio"); if (sec) { S.tab = "teacher"; paint(); sec.scrollIntoView({ behavior: "smooth" }); }
        return;
      }
      var code = prompt("اختر رمز الفصل لإضافة «" + item.title + "» إليه:\n" + list.map(function (c) { return c.id + " — " + c.title; }).join("\n"), list[0].id);
      if (!code) return;
      code = code.trim().toUpperCase();
      var target = list.filter(function (c) { return c.id === code; })[0];
      if (!target) { toast("لم يُعثر على الفصل بهذا الرمز", "warning"); return; }
      var items = (target.items || []).filter(function (x) { return !(x.refId && x.refId === item.refId && x.kind === item.kind); });
      items.unshift({ id: "i" + Date.now().toString(36), kind: item.kind, title: item.title, url: item.url, refId: item.refId || "", note: item.note || "" });
      window.Cloud.col(COL).doc(target.id).set({ items: items, updatedAt: window.Cloud.stamp() }, { merge: true }).then(function () {
        toast("تم نشر «" + item.title + "» في فصل " + target.title + " (" + target.id + ") ✓");
      });
    });
  }

  function build() {
    if ($("classroomsStudio")) return true;
    var anchor = $("teacherDash") || $("designStudio") || $("worksheetStudio") || $("learnSection");
    if (!anchor) return false;
    var s = document.createElement("section");
    s.id = "classroomsStudio";
    s.className = "py-12 scroll-mt-20";
    s.innerHTML = '<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"><div class="glass-card rounded-3xl border border-slate-200 dark:border-slate-700/90 shadow-xl overflow-hidden">' +
      '<div class="p-5 sm:p-6 bg-gradient-to-l from-sky-700 via-indigo-800 to-slate-900 text-white">' +
      '<div class="flex items-center gap-2 text-xs font-extrabold text-amber-300 mb-1">🏫 الفصول الافتراضية وبوابة الطالب</div>' +
      '<h2 class="text-xl sm:text-2xl font-black">فصلك الدراسي الذكي وسجل الدرجات التراكمي</h2>' +
      '<p class="text-xs text-slate-200 mt-1">للمعلم: أنشئ فصلاً بكود قصير وتابع درجات طلابك عبر جميع الاختبارات. وللطالب: ادخل برمز فصلك لحل مهامك واختباراتك وألعابك التعليمية.</p>' +
      '</div><div class="p-4 sm:p-6 text-right" id="clBody"></div></div></div>';
    anchor.parentNode.insertBefore(s, anchor.nextSibling);
    paint();
    // التحقق من وجود رابط فصل مباشر ?c=CODE
    var m = /[?&]c=([A-Za-z0-9_-]{3,20})/.exec(location.search);
    if (m) {
      S.tab = "student";
      S.studentCode = m[1].toUpperCase();
      setTimeout(function () {
        s.scrollIntoView({ behavior: "smooth", block: "start" });
        joinByCode(S.studentCode);
      }, 600);
    } else if (S.studentCode) {
      setTimeout(function () { joinByCode(S.studentCode); }, 1200);
    }
    return true;
  }

  function init() {
    var tries = 0, iv = setInterval(function () { if (build() || ++tries > 40) clearInterval(iv); }, 350);
  }
  
  /* === EduTech Mindset v1.0 — تطويرات التعلّم عن بُعد والفتح المباشر === */
  function openClassroomStudio(mode) {
    var old = document.getElementById("classroomsStudioModalWrap");
    if (old) old.remove();
    var m = document.createElement("div");
    m.id = "classroomsStudioModalWrap";
    m.style.cssText = "position:fixed;inset:0;z-index:2147483300;background:rgba(2,6,23,0.86);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:10px;direction:rtl;";
    m.innerHTML =
      '<div style="width:min(98vw,960px);max-height:94vh;display:flex;flex-direction:column;border-radius:24px;background:#0f172a;color:#f8fafc;border:1.5px solid rgba(56,189,248,0.45);box-shadow:0 26px 70px rgba(0,0,0,0.7);overflow:hidden;">' +
        '<div style="padding:14px 18px;background:linear-gradient(135deg,#0369a1,#3730a3);display:flex;justify-content:space-between;align-items:center;gap:10px;">' +
          '<div style="font-weight:900;font-size:15px;color:#fff;">🏫 الفصول الافتراضية والتعلّم عن بُعد برمز المعلم</div>' +
          '<button type="button" id="classroomsStudioModalClose" style="width:34px;height:34px;border-radius:10px;background:rgba(244,63,94,0.25);color:#fecdd3;border:1px solid rgba(244,63,94,0.45);font-weight:900;cursor:pointer;">✕</button>' +
        '</div>' +
        '<div id="clBody" style="padding:16px;overflow-y:auto;flex:1;background:#f8fafc;color:#0f172a;" class="dark:bg-slate-900 dark:text-slate-100"></div>' +
      '</div>';
    // Remove any hidden inline section with same body_id so getElementById hits our modal!
    var inlineSec = document.getElementById("classroomsStudio");
    if (inlineSec) inlineSec.remove();
    document.body.appendChild(m);
    document.getElementById("classroomsStudioModalClose").onclick = function () { m.remove(); };
    m.addEventListener("click", function (ev) { if (ev.target === m) m.remove(); });
    try {
      if (typeof S !== "undefined" && (mode === "teacher" || mode === "student")) S.tab = mode;
      if (typeof paint === "function") paint();
      if (typeof renderEditor === "function") renderEditor();
      if (typeof injectRemoteBar === "function") injectRemoteBar();
    } catch (e) {}
  }
  window.EduClassrooms = {
    version: "1.0.0",
    open: openClassroomStudio,
    assign: assignItemModal,
    assignPrompt: assignPromptToClass,
    openCode: joinByCode,
    reload: loadTeacherClasses
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
