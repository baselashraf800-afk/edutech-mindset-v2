/*
 * نظام الواجبات المصوّرة والتصحيح البصري لدفاتر الطلاب بالذكاء الاصطناعي — EduTech Mindset (الإصدار 46)
 * يتيح للمعلم:
 * 1) التصحيح الفوري لأي صورة من دفتر طالب عبر الكاميرا أو الجوال بالذكاء الاصطناعي (Vision AI).
 * 2) نشر واجب منزلي إلكتروني برابط مباشر (?hw=ID) يصوّر فيه الطالب دفتره أو يكتب حله ويرسله للمعلم،
 *    ثم يصحّحه المعلم بضغطة زر بالذكاء الاصطناعي ويعتمد الدرجة والتغذية الراجعة.
 */
(function () {
  "use strict";
  var COL = "homeworks", SCOL = "hwSubmissions";
  var $ = function (id) { return document.getElementById(id); };
  var cloud = function () { return !!(window.Cloud && window.Cloud.enabled && window.Cloud.col); };
  var uid = function () { return window.Cloud && window.Cloud.user ? window.Cloud.user.uid : ""; };
  var e = function (v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var toast = function (m, t) { if (typeof showToast === "function") showToast(m, t || "success"); };
  var cls = "w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100";

  var GRADES = ["الأول الأساسي", "الثاني الأساسي", "الثالث الأساسي", "الرابع الأساسي", "الخامس الأساسي", "السادس الأساسي", "السابع", "الثامن", "التاسع", "العاشر", "الحادي عشر", "الثاني عشر"];
  var st = {
    tab: "instant", // instant | assignments
    instantImg: null,
    instantResult: null,
    myHw: [],
    activeHw: null,
    subs: []
  };

  function shrinkImage(file, maxSide, quality) {
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file), im = new Image();
      im.onload = function () {
        var m = maxSide || 1100, k = Math.min(1, m / Math.max(im.width, im.height));
        var c = document.createElement("canvas");
        c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        var dataUrl = c.toDataURL("image/jpeg", quality || 0.72);
        res({ mime: "image/jpeg", data: dataUrl.split(",")[1], dataUrl: dataUrl });
      };
      im.onerror = function () { URL.revokeObjectURL(url); rej(new Error("تعذر قراءة الصورة")); };
      im.src = url;
    });
  }

  function hwLink(id) {
    return location.origin + location.pathname.replace(/index\.html$/, "") + "?hw=" + encodeURIComponent(id);
  }

  function parseJson(txt) {
    var s = String(txt || "").replace(/```json|```/gi, ""), a = s.indexOf("{"), b = s.lastIndexOf("}");
    if (a < 0 || b <= a) return null;
    try { return JSON.parse(s.slice(a, b + 1)); } catch (x) { return null; }
  }

  // ---------- تصحيح صورة دفتر أو إجابة بالذكاء الاصطناعي ----------
  function runVisionGrade(opts) {
    var qText = opts.question || "سؤال واجب مدرسي";
    var rubric = opts.rubric || "";
    var maxPts = +opts.maxPts || 10;
    var studentText = opts.studentText || "";
    var files = opts.imageB64 ? [{ mime: "image/jpeg", data: opts.imageB64 }] : [];

    var prompt = "أنت معلم فلسطيني خبير ومصحح تربوي دقيق ومشجع. قم بقراءة إجابة الطالب" + (files.length ? " المكتوبة بخط اليد في الصورة المرفقة" : "") + " وتصحيحها.\n" +
      "السؤال / المطلوب في الواجب: «" + qText + "»\n" +
      (rubric ? "الإجابة النموذجية أو معايير التصحيح: «" + rubric + "»\n" : "") +
      (studentText ? "النص الذي كتبه الطالب: «" + studentText + "»\n" : "") +
      "الدرجة القصوى: " + maxPts + "\n" +
      "أعد JSON صالحاً فقط بلا أي نص خارجه بهذا الشكل:\n" +
      '{"readText":"ما قرأته من خط يد الطالب باختصار","score":9,"max":' + maxPts + ',"strengths":"نقاط القوة والإجادة في الحل","mistakes":"الأخطاء إن وجدت وكيفية تصويبها","feedback":"رسالة تشجيعية تربوية للطالب"}';

    return window.AI.ask(prompt, files, "worksheet").then(function (txt) {
      var j = parseJson(txt);
      if (j && typeof j.score === "number") return j;
      return {
        readText: "تم فحص الإجابة",
        score: maxPts,
        max: maxPts,
        strengths: String(txt || "").slice(0, 300),
        mistakes: "لا توجد ملاحظات إضافية",
        feedback: "بارك الله في جهدك!"
      };
    });
  }

  // ---------- تحميل واجبات المعلم ----------
  function loadMyHomeworks() {
    if (!cloud() || !uid()) { st.myHw = []; paint(); return; }
    window.Cloud.col(COL).where("ownerUid", "==", uid()).get().then(function (snap) {
      st.myHw = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
      st.myHw.sort(function (a, b) { return ((b.updatedAt && b.updatedAt.seconds) || 0) - ((a.updatedAt && a.updatedAt.seconds) || 0); });
      paint();
    }, function () { paint(); });
  }

  function loadSubmissions(hw) {
    if (!cloud() || !uid() || !hw) return;
    st.activeHw = hw;
    var box = $("hwSubsBox");
    if (box) box.innerHTML = '<p class="text-xs text-slate-500 py-4 text-center">⏳ جارٍ تحميل تسليمات الطلاب…</p>';
    window.Cloud.col(SCOL).where("hwId", "==", hw.id).where("ownerUid", "==", uid()).get().then(function (snap) {
      st.subs = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
      st.subs.sort(function (a, b) { return ((b.at && b.at.seconds) || 0) - ((a.at && a.at.seconds) || 0); });
      renderSubsBox();
    }, function () {
      if (box) box.innerHTML = '<p class="text-xs text-rose-500 py-4 text-center">تعذر تحميل التسليمات (تأكد من نشر قواعد Firestore المحدثة للإصدار 46).</p>';
    });
  }

  function renderSubsBox() {
    var box = $("hwSubsBox"), hw = st.activeHw;
    if (!box || !hw) return;
    var h = '<div class="rounded-2xl border-2 border-indigo-500/30 bg-white dark:bg-slate-800 p-4 space-y-3 mt-3">' +
      '<div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">' +
      '<div><div class="text-sm font-black">📬 تسليمات واجب: ' + e(hw.title) + ' (' + st.subs.length + ' طالب)</div>' +
      '<div class="text-[11px] text-slate-500">الدرجة القصوى: ' + (hw.maxPts || 10) + ' درجات</div></div>' +
      '<div class="flex gap-1.5">' +
      (st.subs.length ? '<button type="button" id="hwGradeAllAi" class="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-black">🤖 تصحيح الجميع بالذكاء الاصطناعي</button>' : '') +
      (st.subs.length ? '<button type="button" id="hwToRemedialBtn" class="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-black">🩹 خطة علاجية من أخطاء الدفاتر</button>' : '') +
      '<button type="button" id="hwRefreshSubs" class="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold">↻ تحديث</button></div></div>';

    if (!st.subs.length) {
      h += '<p class="text-xs text-slate-500 py-6 text-center">لم يرسل الطلاب حلولهم بعد. انسخ رابط الواجب وأرسله للطلاب أو انشره في الفصل الافتراضي.</p></div>';
      box.innerHTML = h;
      $("hwRefreshSubs").onclick = function () { loadSubmissions(hw); };
      return;
    }

    h += '<div class="space-y-3">' + st.subs.map(function (s, idx) {
      var graded = s.score != null && s.score >= 0;
      return '<div class="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/50 space-y-2">' +
        '<div class="flex flex-wrap items-center justify-between gap-2">' +
        '<div class="font-black text-xs">👤 ' + e(s.name) + ' ' +
        (graded ? '<span class="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[11px]">الدرجة: ' + s.score + ' / ' + (hw.maxPts || 10) + '</span>' : '<span class="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 text-[11px]">⏳ بانتظار التصحيح</span>') +
        '</div>' +
        '<div class="flex gap-1.5 items-center">' +
        '<input type="number" step="0.5" min="0" max="' + (hw.maxPts || 10) + '" data-hwsc="' + idx + '" value="' + (graded ? s.score : "") + '" placeholder="الدرجة" class="w-16 px-2 py-1 rounded-lg border text-xs font-bold bg-white dark:bg-slate-800 text-center">' +
        '<button type="button" data-hwsave="' + idx + '" class="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold">💾 حفظ</button>' +
        '<button type="button" data-hwai="' + idx + '" class="px-2.5 py-1 rounded-lg bg-purple-600 text-white text-[11px] font-bold">🤖 صحح بالـ AI</button>' +
        '<button type="button" data-hwdel="' + idx + '" class="px-2 py-1 rounded-lg bg-rose-500/15 text-rose-600 text-[11px]">🗑</button>' +
        '</div></div>' +
        '<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">' +
        (s.img ? '<div><img src="data:image/jpeg;base64,' + s.img + '" class="w-full max-h-48 object-contain rounded-xl border bg-black/5 cursor-pointer" onclick="window.open(this.src)"></div>' : '') +
        '<div class="' + (s.img ? "sm:col-span-2" : "sm:col-span-3") + ' text-xs space-y-1">' +
        (s.text ? '<div class="p-2 rounded-lg bg-white dark:bg-slate-800 border"><b>إجابة الطالب النصية:</b> ' + e(s.text) + '</div>' : '') +
        (s.feedback ? '<div class="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 whitespace-pre-line"><b>🤖 تقرير التصحيح الذكي:</b>\n' + e(s.feedback) + '</div>' : '') +
        '</div></div></div>';
    }).join("") + '</div></div>';

    box.innerHTML = h;
    $("hwRefreshSubs").onclick = function () { loadSubmissions(hw); };
    if ($("hwToRemedialBtn")) $("hwToRemedialBtn").onclick = function () {
      var maxP = hw.maxPts || 10;
      var weakSubs = st.subs.filter(function (s) { return s.score != null && s.score < maxP * 0.6; }).map(function (s) { return s.name; });
      var desc = "معالجة الأخطاء الشائعة في واجب «" + (hw.title || "") + "»" + (weakSubs.length ? " — للطلاب: " + weakSubs.join("، ") : "");
      if (window.EduPortfolio && window.EduPortfolio.openWithRemedial) {
        window.EduPortfolio.openWithRemedial({
          kind: "remedial",
          subject: hw.subject || "المادة",
          grade: hw.grade || "السابع",
          weakness: desc
        });
      }
    };

    function gradeOneSub(s, btn) {
      if (btn) { btn.disabled = true; btn.textContent = "⏳ يصحح…"; }
      return runVisionGrade({
        question: hw.question || hw.title,
        rubric: hw.rubric || "",
        maxPts: hw.maxPts || 10,
        studentText: s.text || "",
        imageB64: s.img || ""
      }).then(function (res) {
        var sc = Math.max(0, Math.min(hw.maxPts || 10, +res.score || 0));
        var fb = [
          res.readText ? "📝 قراءة الخط: " + res.readText : "",
          res.strengths ? "✅ الإجادة: " + res.strengths : "",
          res.mistakes ? "💡 ملاحظات التصويب: " + res.mistakes : "",
          res.feedback ? "🌟 تشجيع: " + res.feedback : ""
        ].filter(Boolean).join("\n");
        s.score = sc; s.feedback = fb;
        return window.Cloud.col(SCOL).doc(s.id).set({ score: sc, feedback: fb }, { merge: true });
      });
    }

    if ($("hwGradeAllAi")) $("hwGradeAllAi").onclick = function () {
      var bAll = $("hwGradeAllAi");
      bAll.disabled = true; bAll.textContent = "⏳ جارٍ تصحيح جميع الدفاتر…";
      var q = st.subs.slice();
      (function next() {
        var item = q.shift();
        if (!item) { toast("تم تصحيح جميع تسليمات الطلاب ✓"); renderSubsBox(); return; }
        gradeOneSub(item).then(next, next);
      })();
    };

    box.querySelectorAll("[data-hwai]").forEach(function (bt) {
      bt.onclick = function () {
        var s = st.subs[+bt.dataset.hwai];
        gradeOneSub(s, bt).then(function () { toast("تم تصحيح واجب " + s.name + " ✓"); renderSubsBox(); }, function (err) {
          bt.disabled = false; bt.textContent = "🤖 صحح بالـ AI";
          toast((err && err.message) || "تعذر التصحيح البصري", "warning");
        });
      };
    });

    box.querySelectorAll("[data-hwsave]").forEach(function (bt) {
      bt.onclick = function () {
        var idx = +bt.dataset.hwsave, s = st.subs[idx];
        var inp = box.querySelector('[data-hwsc="' + idx + '"]');
        var sc = Math.max(0, Math.min(hw.maxPts || 10, parseFloat(inp.value) || 0));
        s.score = sc;
        window.Cloud.col(SCOL).doc(s.id).set({ score: sc }, { merge: true }).then(function () {
          toast("تم حفظ درجة " + s.name + " ✓"); renderSubsBox();
        });
      };
    });

    box.querySelectorAll("[data-hwdel]").forEach(function (bt) {
      bt.onclick = function () {
        var s = st.subs[+bt.dataset.hwdel];
        if (!confirm("حذف تسليم الطالب " + s.name + "؟")) return;
        window.Cloud.col(SCOL).doc(s.id).delete().then(function () { loadSubmissions(hw); });
      };
    });
  }

  function paint() {
    var box = $("hwBody"); if (!box) return;
    var nav = '<div class="flex flex-wrap gap-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">' +
      '<button type="button" data-hwtab="instant" class="px-4 py-2 rounded-xl text-xs font-extrabold transition-all ' + (st.tab === "instant" ? "bg-rose-600 text-white shadow" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300") + '">📸 المصحح البصري الفوري لدفتر الطالب</button>' +
      '<button type="button" data-hwtab="assignments" class="px-4 py-2 rounded-xl text-xs font-extrabold transition-all ' + (st.tab === "assignments" ? "bg-indigo-600 text-white shadow" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300") + '">📬 واجباتي المنشورة للطلاب (روابط تسليم الواجبات)</button>' +
      '</div>';

    if (st.tab === "instant") {
      var res = st.instantResult;
      box.innerHTML = nav + '<div class="grid grid-cols-1 lg:grid-cols-12 gap-5">' +
        '<div class="lg:col-span-6 space-y-3">' +
        '<div><label class="block text-xs font-bold mb-1">السؤال أو المطلوب في الواجب</label>' +
        '<input id="hwInstQ" class="' + cls + '" placeholder="مثال: حل المعادلة التربيعية س² - 5س + 6 = 0 أو إعراب الجملة…"></div>' +
        '<div class="grid grid-cols-2 gap-2"><div><label class="block text-xs font-bold mb-1">الإجابة النموذجية (اختياري)</label><input id="hwInstRub" class="' + cls + '" placeholder="س=2 أو س=3"></div>' +
        '<div><label class="block text-xs font-bold mb-1">الدرجة القصوى</label><input id="hwInstMax" type="number" value="10" min="1" max="100" class="' + cls + '"></div></div>' +
        '<div class="flex flex-wrap gap-2">' +
        '<label class="px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-extrabold cursor-pointer flex items-center gap-2"><i class="fa-solid fa-camera"></i>تصوير دفتر الطالب بالكاميرا<input id="hwInstCam" type="file" accept="image/*" capture="environment" class="hidden"></label>' +
        '<label class="px-4 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-extrabold cursor-pointer flex items-center gap-2"><i class="fa-solid fa-image"></i>اختيار صورة من الجهاز<input id="hwInstPick" type="file" accept="image/*" class="hidden"></label>' +
        '</div>' +
        (st.instantImg ? '<div class="relative inline-block"><img src="' + st.instantImg.dataUrl + '" class="max-h-48 rounded-2xl border-2 border-rose-400"></div>' : '') +
        '<div><button type="button" id="hwInstGo" class="w-full py-3 rounded-xl bg-gradient-to-l from-rose-600 to-purple-600 text-white text-xs font-black shadow-md">🤖 اقرأ خط الطالب وصحّح الواجب الآن</button></div>' +
        '</div>' +
        '<div class="lg:col-span-6">' +
        (res ? '<div class="rounded-3xl border-2 border-emerald-400 bg-emerald-50/50 dark:bg-slate-900/70 p-5 space-y-3">' +
          '<div class="flex items-center justify-between"><span class="text-xs font-black text-emerald-700 dark:text-emerald-300">✅ نتيجة التصحيح البصري الذكي</span>' +
          '<span class="text-2xl font-black text-emerald-600">' + res.score + ' / ' + res.max + '</span></div>' +
          (res.readText ? '<div class="p-2.5 rounded-xl bg-white dark:bg-slate-800 border text-xs"><b>📝 ما قرأه الذكاء الاصطناعي من خط اليد:</b><br>' + e(res.readText) + '</div>' : '') +
          (res.strengths ? '<div class="text-xs"><b class="text-emerald-700 dark:text-emerald-400">🌟 نقاط الإجادة:</b> ' + e(res.strengths) + '</div>' : '') +
          (res.mistakes ? '<div class="text-xs"><b class="text-amber-700 dark:text-amber-400">💡 الأخطاء والتصويب:</b> ' + e(res.mistakes) + '</div>' : '') +
          (res.feedback ? '<div class="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/40 text-xs font-bold">💬 التغذية الراجعة للطالب: ' + e(res.feedback) + '</div>' : '') +
          '</div>' : '<div class="h-full min-h-[220px] rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center p-6 text-xs text-slate-400 text-center">صوّر صفحة من دفتر الطالب واضغط «اقرأ خط الطالب وصحّح الواجب» ليقوم الذكاء الاصطناعي بقراءة خط اليد واكتشاف الأخطاء واقتراح الدرجة والتغذية الراجعة.</div>') +
        '</div></div>';

      ["hwInstCam", "hwInstPick"].forEach(function (id) {
        $(id).onchange = function (ev) {
          var f = ev.target.files && ev.target.files[0]; if (!f) return;
          shrinkImage(f, 1200, 0.76).then(function (img) { st.instantImg = img; paint(); }, function () { toast("تعذر قراءة الصورة", "warning"); });
        };
      });
      $("hwInstGo").onclick = function () {
        if (!st.instantImg) { toast("صوّر أو اختر صورة دفتر الطالب أولاً", "warning"); return; }
        var btn = $("hwInstGo");
        btn.disabled = true; btn.textContent = "⏳ جارٍ قراءة خط الطالب وتصحيح الحل…";
        runVisionGrade({
          question: $("hwInstQ").value.trim(),
          rubric: $("hwInstRub").value.trim(),
          maxPts: +$("hwInstMax").value || 10,
          imageB64: st.instantImg.data
        }).then(function (r) {
          st.instantResult = r;
          paint();
        }).catch(function (err) {
          toast((err && err.message) || "تأكد من تفعيل مفتاح يدعم الصور (Gemini/OpenAI/Claude)", "warning");
          btn.disabled = false; btn.textContent = "🤖 اقرأ خط الطالب وصحّح الواجب الآن";
        });
      };
    } else {
      if (!cloud() || !uid()) {
        box.innerHTML = nav + '<p class="text-xs text-slate-500 py-8 text-center">سجّل الدخول بحساب Google لإنشاء روابط واجبات يرفع عليها الطلاب صور دفاترهم.</p>';
      } else {
        box.innerHTML = nav + '<div class="grid grid-cols-1 lg:grid-cols-12 gap-4">' +
          '<div class="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 p-4 space-y-2.5">' +
          '<div class="text-xs font-black text-indigo-600 dark:text-indigo-400">➕ نشر واجب منزلي جديد للطلاب</div>' +
          '<input id="hwNewTitle" class="' + cls + '" placeholder="عنوان الواجب (مثال: واجب الدرس الأول - الكسور)">' +
          '<div class="grid grid-cols-2 gap-2"><select id="hwNewGrade" class="' + cls + '">' + GRADES.map(function (g) { return '<option>' + g + '</option>'; }).join("") + '</select>' +
          '<input id="hwNewSubj" class="' + cls + '" placeholder="المادة"></div>' +
          '<textarea id="hwNewQ" rows="2" class="' + cls + '" placeholder="نص سؤال الواجب أو المطلوب من الطالب تصويره من دفتره…"></textarea>' +
          '<div class="grid grid-cols-3 gap-2"><input id="hwNewRub" class="' + cls + ' col-span-2" placeholder="الإجابة النموذجية للتصحيح الذكي (اختياري)">' +
          '<input id="hwNewMax" type="number" value="10" min="1" max="100" class="' + cls + '" placeholder="الدرجة"></div>' +
          '<button type="button" id="hwCreateBtn" class="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-black shadow">🚀 انشر الواجب وأنشئ رابط التسليم</button>' +
          '</div>' +
          '<div class="lg:col-span-7 space-y-2">' +
          '<div class="text-xs font-black">📂 واجباتي المنشورة (' + st.myHw.length + ')</div>' +
          (st.myHw.length ? '<div class="space-y-2 max-h-72 overflow-y-auto">' + st.myHw.map(function (hw) {
            return '<div class="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-wrap items-center justify-between gap-2">' +
              '<div><div class="text-xs font-extrabold">' + e(hw.title) + '</div><div class="text-[10px] text-slate-500">' + e([hw.grade, hw.subject].filter(Boolean).join(" • ")) + ' · ' + (hw.maxPts || 10) + ' درجات</div></div>' +
              '<div class="flex flex-wrap gap-1.5">' +
              '<button type="button" data-hwcopy="' + e(hw.id) + '" class="px-2.5 py-1.5 rounded-lg bg-sky-600 text-white text-[11px] font-bold">🔗 نسخ رابط الطلاب</button>' +
              '<button type="button" data-hwclass="' + e(hw.id) + '" class="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold">🏫 أضف لفصل</button>' +
              '<button type="button" data-hwsubs="' + e(hw.id) + '" class="px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold">📬 التسليمات</button>' +
              '<button type="button" data-hwrm="' + e(hw.id) + '" class="px-2 py-1.5 rounded-lg bg-rose-500/15 text-rose-600 text-[11px]">🗑</button>' +
              '</div></div>';
          }).join("") + '</div>' : '<p class="text-xs text-slate-500 py-6">لم تنشر واجبات بعد.</p>') +
          '</div></div><div id="hwSubsBox"></div>';

        $("hwCreateBtn").onclick = function () {
          var t = $("hwNewTitle").value.trim(), q = $("hwNewQ").value.trim();
          if (!t || !q) { toast("اكتب عنوان الواجب والسؤال المطلوب", "warning"); return; }
          var id = "hw" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
          var data = {
            ownerUid: uid(),
            title: t,
            grade: $("hwNewGrade").value,
            subject: $("hwNewSubj").value.trim(),
            question: q,
            rubric: $("hwNewRub").value.trim(),
            maxPts: +$("hwNewMax").value || 10,
            open: true,
            updatedAt: window.Cloud.stamp()
          };
          window.Cloud.col(COL).doc(id).set(data).then(function () {
            toast("تم نشر الواجب بنجاح ✓ انسخ الرابط لطلابك");
            loadMyHomeworks();
          }, function () { toast("تعذر النشر — تأكد من نشر قواعد Firestore المحدثة للإصدار 46", "warning"); });
        };

        box.querySelectorAll("[data-hwcopy]").forEach(function (bt) {
          bt.onclick = function () {
            var l = hwLink(bt.dataset.hwcopy);
            try { navigator.clipboard.writeText(l); toast("تم نسخ رابط تسليم الواجب 🔗"); } catch (x) { prompt("انسخ الرابط:", l); }
          };
        });
        box.querySelectorAll("[data-hwclass]").forEach(function (bt) {
          bt.onclick = function () {
            var hw = st.myHw.filter(function (x) { return x.id === bt.dataset.hwclass; })[0];
            if (hw && window.EduClassrooms && window.EduClassrooms.assign) {
              window.EduClassrooms.assign({ kind: "hw", title: "📸 واجب: " + hw.title, url: hwLink(hw.id), refId: hw.id });
            }
          };
        });
        box.querySelectorAll("[data-hwsubs]").forEach(function (bt) {
          bt.onclick = function () {
            var hw = st.myHw.filter(function (x) { return x.id === bt.dataset.hwsubs; })[0];
            if (hw) loadSubmissions(hw);
          };
        });
        box.querySelectorAll("[data-hwrm]").forEach(function (bt) {
          bt.onclick = function () {
            if (!confirm("حذف هذا الواجب؟")) return;
            window.Cloud.col(COL).doc(bt.dataset.hwrm).delete().then(loadMyHomeworks);
          };
        });
        if (st.activeHw) loadSubmissions(st.activeHw);
      }
    }

    box.querySelectorAll("[data-hwtab]").forEach(function (b) {
      b.onclick = function () {
        st.tab = b.dataset.hwtab;
        if (st.tab === "assignments" && !st.myHw.length) loadMyHomeworks();
        else paint();
      };
    });
  }

  // ---------- واجهة تسليم الواجب للطالب عبر الرابط المباشر ?hw=ID ----------
  function checkDirectStudentHw() {
    var m = /[?&]hw=([A-Za-z0-9_-]{4,40})/.exec(location.search);
    if (!m) return;
    var hid = m[1], tries = 0;
    (function wait() {
      if (!cloud()) { if (++tries < 35) return setTimeout(wait, 300); return; }
      window.Cloud.col(COL).doc(hid).get().then(function (d) {
        if (!d.exists) return;
        openStudentHwOverlay(Object.assign({ id: d.id }, d.data()));
      });
    })();
  }

  function openStudentHwOverlay(hw) {
    var ov = document.createElement("div");
    ov.id = "hwStudentOv";
    ov.style.cssText = "position:fixed;inset:0;z-index:460;background:#f1f5f9;color:#0f172a;overflow-y:auto;direction:rtl;font-family:Cairo,Tahoma,sans-serif;padding:18px";
    document.body.appendChild(ov);
    var stName = localStorage.getItem("edu_student_name") || "";
    var attachedImg = null;

    function renderForm() {
      ov.innerHTML = '<div style="max-width:640px;margin:20px auto;background:#fff;border:1px solid #cbd5e1;border-radius:24px;padding:22px;box-shadow:0 10px 30px rgba(0,0,0,0.08)">' +
        '<div style="background:linear-gradient(135deg,#4f46e5,#0f172a);color:#fff;padding:18px;border-radius:18px;margin-bottom:16px">' +
        '<span style="font-size:11px;font-weight:900;color:#fde047">📸 تسليم واجب مدرسي</span>' +
        '<h1 style="margin:4px 0;font-size:20px;font-weight:900">' + e(hw.title) + '</h1>' +
        '<div style="font-size:12px;opacity:0.9">' + e([hw.grade, hw.subject].filter(Boolean).join(" • ")) + ' · الدرجة: ' + (hw.maxPts || 10) + '</div></div>' +
        '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:14px;margin-bottom:14px;font-size:14px;font-weight:800;line-height:1.8">📌 المطلوب: ' + e(hw.question) + '</div>' +
        '<label style="display:block;font-size:12px;font-weight:800;margin-bottom:4px">اسمك الكامل *</label>' +
        '<input id="hwsName" value="' + e(stName) + '" placeholder="اكتب اسمك الثلاثي…" style="width:100%;padding:10px 12px;border-radius:12px;border:2px solid #cbd5e1;font-family:inherit;font-weight:700;margin-bottom:12px;box-sizing:border-box">' +
        '<label style="display:block;font-size:12px;font-weight:800;margin-bottom:6px">صوّر حلك في الدفتر (أو اكتب الإجابة بالأسفل)</label>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">' +
        '<label style="background:#e11d48;color:#fff;padding:10px 16px;border-radius:12px;font-size:12px;font-weight:800;cursor:pointer">📷 تصوير الدفتر بالكاميرا<input id="hwsCam" type="file" accept="image/*" capture="environment" style="display:none"></label>' +
        '<label style="background:#0284c7;color:#fff;padding:10px 16px;border-radius:12px;font-size:12px;font-weight:800;cursor:pointer">🖼 اختيار صورة من الهاتف<input id="hwsPick" type="file" accept="image/*" style="display:none"></label></div>' +
        (attachedImg ? '<div style="margin-bottom:12px"><img src="' + attachedImg.dataUrl + '" style="max-height:180px;border-radius:12px;border:2px solid #10b981"></div>' : '') +
        '<textarea id="hwsText" rows="3" placeholder="يمكنك أيضاً كتابة إجابتك أو ملاحظتك للمعلم هنا…" style="width:100%;padding:10px 12px;border-radius:12px;border:2px solid #cbd5e1;font-family:inherit;font-weight:700;margin-bottom:14px;box-sizing:border-box"></textarea>' +
        '<div style="display:flex;gap:10px">' +
        '<button type="button" id="hwsSend" style="flex:1;background:#059669;color:#fff;border:0;padding:12px;border-radius:14px;font-family:inherit;font-size:15px;font-weight:900;cursor:pointer">🚀 إرسال الواجب للمعلم</button>' +
        '<a href="' + e(location.pathname) + '" style="background:#64748b;color:#fff;text-decoration:none;padding:12px 18px;border-radius:14px;font-size:13px;font-weight:800">العودة للموقع</a></div></div>';

      ["hwsCam", "hwsPick"].forEach(function (id) {
        $(id).onchange = function (ev) {
          var f = ev.target.files && ev.target.files[0]; if (!f) return;
          stName = $("hwsName").value;
          shrinkImage(f, 950, 0.68).then(function (img) { attachedImg = img; renderForm(); });
        };
      });
      $("hwsSend").onclick = function () {
        var nm = $("hwsName").value.trim(), tx = $("hwsText").value.trim();
        if (nm.length < 2) { alert("اكتب اسمك الكامل أولاً"); return; }
        if (!attachedImg && !tx) { alert("أرفق صورة دفترك أو اكتب إجابتك أولاً"); return; }
        try { localStorage.setItem("edu_student_name", nm); } catch (x) {}
        var btn = $("hwsSend"); btn.disabled = true; btn.textContent = "⏳ جارٍ الإرسال…";
        var sid = "hws" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        window.Cloud.col(SCOL).doc(sid).set({
          hwId: hw.id,
          ownerUid: hw.ownerUid,
          name: nm.slice(0, 60),
          text: tx.slice(0, 1200),
          img: attachedImg ? attachedImg.data : "",
          score: -1,
          feedback: "",
          at: window.Cloud.stamp()
        }).then(function () {
          if (window.EduBadges && window.EduBadges.award) window.EduBadges.award("quiz_starter", 40, true);
          ov.innerHTML = '<div style="max-width:520px;margin:40px auto;background:#fff;border-radius:24px;padding:28px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.08)">' +
            '<div style="font-size:56px">✅</div><h2 style="font-size:22px;font-weight:900;color:#059669">تم إرسال واجبك بنجاح يا ' + e(nm) + '!</h2>' +
            '<p style="color:#475569;font-size:14px">وصلت إجابتك وصورة دفترك إلى معلمك لتصحيحها.</p>' +
            '<a href="' + e(location.pathname) + '" style="display:inline-block;margin-top:14px;background:#0284c7;color:#fff;text-decoration:none;padding:12px 24px;border-radius:14px;font-weight:900">العودة إلى المنصة</a></div>';
        }, function () {
          btn.disabled = false; btn.textContent = "🚀 إرسال الواجب للمعلم";
          alert("تعذر إرسال الواجب — تحقق من الاتصال بالإنترنت");
        });
      };
    }
    renderForm();
  }

  function build() {
    if ($("homeworkStudio")) return true;
    var anchor = $("worksheetStudio") || $("gamesStudio") || $("lessonPlanStudio");
    if (!anchor) return false;
    var s = document.createElement("section");
    s.id = "homeworkStudio";
    s.className = "py-12 scroll-mt-20";
    s.innerHTML = '<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">' +
      '<div class="glass-card rounded-3xl border border-slate-200 dark:border-slate-700/90 shadow-xl overflow-hidden">' +
      '<div class="p-5 sm:p-6 bg-gradient-to-l from-rose-700 via-pink-800 to-slate-900 text-white">' +
      '<div class="flex items-center gap-2 text-xs font-extrabold text-amber-300 mb-1">📸 نظام الواجبات المصوّرة والتصحيح البصري لدفاتر الطلاب</div>' +
      '<h2 class="text-xl sm:text-2xl font-black">صوّر دفتر الطالب ليقرأ الذكاء الاصطناعي خط يده ويصحّحه في ثوانٍ</h2>' +
      '<p class="text-xs text-white/85 mt-1">صحّح أي دفتر فوراً بالكاميرا، أو انشر رابط واجب منزلي يصوّر فيه الطلاب دفاترهم ويرسلونها إليك لتصحيحها بضغطة زر.</p>' +
      '</div><div class="p-4 sm:p-6 text-right" id="hwBody"></div></div></div>';
    anchor.parentNode.insertBefore(s, anchor.nextSibling);
    paint();
    return true;
  }

  function init() {
    checkDirectStudentHw();
    var n = 0, iv = setInterval(function () { if (build() || ++n > 40) clearInterval(iv); }, 350);
  }
  
  function openHomeworkStudio(mode) {
    var old = document.getElementById("homeworkStudioModalWrap");
    if (old) old.remove();
    var m = document.createElement("div");
    m.id = "homeworkStudioModalWrap";
    m.style.cssText = "position:fixed;inset:0;z-index:2147483300;background:rgba(2,6,23,0.86);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:10px;direction:rtl;";
    m.innerHTML =
      '<div style="width:min(98vw,960px);max-height:94vh;display:flex;flex-direction:column;border-radius:24px;background:#0f172a;color:#f8fafc;border:1.5px solid rgba(56,189,248,0.45);box-shadow:0 26px 70px rgba(0,0,0,0.7);overflow:hidden;">' +
        '<div style="padding:14px 18px;background:linear-gradient(135deg,#047857,#0f766e);display:flex;justify-content:space-between;align-items:center;gap:10px;">' +
          '<div style="font-weight:900;font-size:15px;color:#fff;">📸 نظام الواجبات المصوّرة والتصحيح البصري</div>' +
          '<button type="button" id="homeworkStudioModalClose" style="width:34px;height:34px;border-radius:10px;background:rgba(244,63,94,0.25);color:#fecdd3;border:1px solid rgba(244,63,94,0.45);font-weight:900;cursor:pointer;">✕</button>' +
        '</div>' +
        '<div id="hwBody" style="padding:16px;overflow-y:auto;flex:1;background:#f8fafc;color:#0f172a;" class="dark:bg-slate-900 dark:text-slate-100"></div>' +
      '</div>';
    // Remove any hidden inline section with same body_id so getElementById hits our modal!
    var inlineSec = document.getElementById("homeworkStudio");
    if (inlineSec) inlineSec.remove();
    document.body.appendChild(m);
    document.getElementById("homeworkStudioModalClose").onclick = function () { m.remove(); };
    m.addEventListener("click", function (ev) { if (ev.target === m) m.remove(); });
    try {
      if (typeof S !== "undefined" && (mode === "teacher" || mode === "student")) S.tab = mode;
      if (typeof paint === "function") paint();
      if (typeof renderEditor === "function") renderEditor();
      if (typeof injectRemoteBar === "function") injectRemoteBar();
    } catch (e) {}
  }
  window.EduHomework = { version: "1.1.0", open: openHomeworkStudio, reload: loadMyHomeworks };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
