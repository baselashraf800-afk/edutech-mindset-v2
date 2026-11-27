/* ============================================================================
 * EduTech Mindset — v284 Pro AI Studios (Lazy-Loaded On Demand for Max Speed)
 * 1) حصة كاملة في 60 ثانية (النظام الحكومي الوزاري + نظام الأونروا) + أرشيف الخطط
 * 2) مولّد الخطط العلاجية والإثرائية (حكومي وأونروا)
 * 3) مُعِدّ الامتحانات بجدول المواصفات
 * 4) مُذاكِر الدروس الذكي للطلاب (اشرح لي كأني في صفي + 5 أسئلة تفاعلية)
 * ============================================================================ */
(function (global) {
  "use strict";

  var ARCHIVE_KEY = "edutech_v284_lesson_archive";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function toast(msg, type) {
    if (typeof global.showToast === "function") {
      try { global.showToast(msg, type || "info"); return; } catch (_) {}
    }
    alert(msg);
  }

  function getAuthToken() {
    var u = (global.Cloud && global.Cloud.user) || null;
    if (!u && global.firebase && typeof global.firebase.auth === "function") {
      try { u = global.firebase.auth().currentUser; } catch (_) {}
    }
    if (u && typeof u.getIdToken === "function") return u.getIdToken().catch(function () { return ""; });
    return Promise.resolve("");
  }

  function callAI(promptText) {
    return getAuthToken().then(function (tok) {
      return fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          idToken: tok,
          prompt: promptText,
          tool: "v284_pro_studio"
        })
      }).then(function (r) {
        return r.json().then(function (j) { return { status: r.status, data: j }; });
      });
    });
  }

  function loadArchive() {
    try { return JSON.parse(localStorage.getItem(ARCHIVE_KEY) || "[]"); } catch (_) { return []; }
  }
  function saveArchiveItem(item) {
    var arr = loadArchive();
    arr.unshift(item);
    if (arr.length > 40) arr = arr.slice(0, 40);
    try { localStorage.setItem(ARCHIVE_KEY, JSON.stringify(arr)); } catch (_) {}
  }

  function formatRichHtml(txt) {
    return esc(txt)
      .replace(/^###\s*(.+)$/gm, '<h4 style="color:#0369a1;margin:12px 0 4px;font-size:14px;">$1</h4>')
      .replace(/^##\s*(.+)$/gm, '<h3 style="background:#0f172a;color:#fff;padding:6px 10px;border-radius:8px;margin:14px 0 6px;font-size:14px;">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function printOfficialPdf(title, subtitle, bodyText) {
    var prof = (global.EduV284Welcome && global.EduV284Welcome.getProfile) ? (global.EduV284Welcome.getProfile() || {}) : {};
    var school = prof.school || "المدرسة / المؤسسة التعليمية";
    var teacher = prof.name || "المعلم / المعلمة";
    var w = window.open("", "_blank");
    if (!w) { toast("⚠️ اسمح بالنوافذ المنبثقة لطباعة PDF", "warn"); return; }
    w.document.open();
    w.document.write(
      '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>' + esc(title) + '</title>' +
      '<link rel="stylesheet" href="'+location.origin+'/assets/katex/katex.min.css"><script src="'+location.origin+'/assets/katex/katex.min.js"><\/script><script src="'+location.origin+'/assets/katex/auto-render.min.js"><\/script><style>@page{size:A4;margin:14mm;}.katex,.katex-display{direction:ltr!important;unicode-bidi:isolate!important;}body{font-family:Tahoma,Arial,sans-serif;color:#0f172a;line-height:1.75;font-size:12.5px;}' +
      '.hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #0f172a;padding-bottom:10px;margin-bottom:14px;}' +
      '.meta{display:flex;flex-wrap:wrap;gap:14px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:10px;padding:8px 12px;margin-bottom:14px;font-size:11.5px;}' +
      '.ftr{margin-top:22px;padding-top:8px;border-top:1px dashed #94a3b8;display:flex;justify-content:space-between;font-size:10.5px;color:#475569;}</style></head><body>' +
      '<div class="hdr"><div><div style="font-size:17px;font-weight:900;">' + esc(title) + '</div><div style="font-size:12px;color:#475569;">' + esc(subtitle) + '</div></div><div style="text-align:left;font-size:11px;"><div>منصة EduTech Mindset</div><div>التاريخ: ' + new Date().toLocaleDateString("ar-EG") + '</div></div></div>' +
      '<div class="meta"><span><strong>المعلم:</strong> ' + esc(teacher) + '</span><span><strong>المدرسة:</strong> ' + esc(school) + '</span><span><strong>المحافظة:</strong> ' + esc(prof.region || "فلسطين") + '</span></div>' +
      '<div>' + formatRichHtml(bodyText) + '</div>' +
      '<div class="ftr"><span>صادر عبر استوديو المعلم الذكي — EduTech Mindset (إشراف أ. باسل أشرف الفقعاوي)</span><span>https://edutech-mindset.pages.dev</span></div>' +
      '<script>window.onload=function(){try{if(window.renderMathInElement)renderMathInElement(document.body,{delimiters:[{left:"$$",right:"$$",display:true},{left:"$",right:"$",display:false}],throwOnError:false});}catch(e){}setTimeout(function(){window.print();},450);};<\/script></body></html>'
    );
    w.document.close();
  }

  function openStudioModal(initialTab) {
    var activeTab = initialTab || "lesson60";
    var old = document.getElementById("v284ProStudioModal");
    if (old) old.remove();

    var prof = (global.EduV284Welcome && global.EduV284Welcome.getProfile) ? (global.EduV284Welcome.getProfile() || {}) : {};
    var defSys = (prof.eduSystem && prof.eduSystem.indexOf("أونروا") >= 0) ? "unrwa" : "gov";

    var m = document.createElement("div");
    m.id = "v284ProStudioModal";
    m.style.cssText = "position:fixed;inset:0;z-index:2147483230;background:rgba(2,6,23,0.82);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:10px;direction:rtl;";
    m.innerHTML =
      '<div style="width:min(97vw,920px);max-height:93vh;display:flex;flex-direction:column;border-radius:26px;background:linear-gradient(155deg,#020617,#0f172a,#1e1b4b);color:#fff;border:1.5px solid rgba(56,189,248,0.45);box-shadow:0 26px 70px rgba(0,0,0,0.65);overflow:hidden;">' +
        '<div style="padding:13px 16px;border-bottom:1px solid rgba(255,255,255,0.12);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;">' +
          '<div><div style="font-size:15.5px;font-weight:900;color:#fff;">⚡ استوديو الحصة الكاملة والخطط والمذاكرة الذكية (v284)</div><div style="font-size:11px;color:#94a3b8;">يدعم النظام الحكومي الوزاري الفلسطيني 🇵🇸 ونظام الأونروا 🇺🇳 + طباعة A4 PDF</div></div>' +
          '<div style="display:flex;gap:6px;align-items:center;">' +
            '<button type="button" id="v284StPlansBtn" style="padding:6px 11px;border-radius:10px;background:rgba(251,191,36,0.2);color:#fde68a;border:1px solid rgba(251,191,36,0.4);font-size:11px;font-weight:900;cursor:pointer;">⭐ الباقات</button>' +
            '<button type="button" id="v284StClose" style="width:32px;height:32px;border-radius:10px;background:rgba(244,63,94,0.22);color:#fda4af;border:1px solid rgba(244,63,94,0.4);font-weight:900;cursor:pointer;">✕</button>' +
          '</div>' +
        '</div>' +
        '<div id="v284StBody" style="padding:14px 16px;overflow-y:auto;flex:1;"></div>' +
      '</div>';

    document.body.appendChild(m);
    function closeM() { if (m.parentNode) m.parentNode.removeChild(m); }
    document.getElementById("v284StClose").onclick = closeM;
    document.getElementById("v284StPlansBtn").onclick = function () {
      if (global.EduV284Subs) global.EduV284Subs.openPlans();
    };
    m.addEventListener("click", function (ev) { if (ev.target === m) closeM(); });

    var lastResultText = "";
    var lastResultTitle = "";
    var lastResultSub = "";

    function render() {
      var body = document.getElementById("v284StBody");
      if (!body) return;
      var tabs = [
        { id: "lesson60", label: "⚡ حصة في 60 ثانية (حكومي/أونروا)" },
        { id: "remedial", label: "🩺 خطة علاجية/إثرائية" },
        { id: "exam_spec", label: "📝 مُعِدّ امتحانات (مواصفات)" },
        { id: "student_tutor", label: "🧠 مُذاكِر الدروس للطلاب" },
        { id: "archive", label: "📂 أرشيف خططي (" + loadArchive().length + ")" }
      ];
      var tabsHtml = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:13px;">' + tabs.map(function (t) {
        var on = activeTab === t.id;
        return '<button type="button" data-st-tab="' + t.id + '" style="padding:7px 11px;border-radius:11px;font-size:11.5px;font-weight:900;cursor:pointer;border:1px solid ' + (on ? '#38bdf8' : 'rgba(255,255,255,0.15)') + ';background:' + (on ? 'linear-gradient(135deg,#0284c7,#2563eb)' : 'rgba(255,255,255,0.06)') + ';color:#fff;">' + t.label + '</button>';
      }).join("") + '</div>';

      var inp = "width:100%;padding:9px 11px;border-radius:11px;background:#020617;color:#fff;border:1px solid rgba(255,255,255,0.2);font-size:12px;";
      var lbl = "display:block;font-size:11px;font-weight:900;color:#7dd3fc;margin-bottom:3px;";
      var formHtml = "";

      if (activeTab === "lesson60") {
        formHtml =
          '<div style="display:grid;gap:10px;padding:13px;border-radius:16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);">' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;">' +
              '<div><label style="' + lbl + '">🏛️ نظام التحضير *</label><select id="l60Sys" style="' + inp + '">' +
                '<option value="gov"' + (defSys === "gov" ? ' selected' : '') + '>🇵🇸 النظام الحكومي الوزاري الفلسطيني</option>' +
                '<option value="unrwa"' + (defSys === "unrwa" ? ' selected' : '') + '>🇺🇳 نظام وكالة الغوث (الأونروا UNRWA)</option>' +
              '</select></div>' +
              '<div><label style="' + lbl + '">🏫 الصف الدراسي *</label><input id="l60Grade" value="' + esc(prof.gradeOrSubject || "الصف السادس") + '" placeholder="مثلاً: الصف السادس / التوجيهي" style="' + inp + '"></div>' +
              '<div><label style="' + lbl + '">📚 المبحث *</label><input id="l60Subj" placeholder="رياضيات / لغة عربية / علوم..." style="' + inp + '"></div>' +
              '<div><label style="' + lbl + '">🏕️ بيئة الصف</label><select id="l60Env" style="' + inp + '"><option value="صف اعتيادي">صف اعتيادي</option><option value="خيمة تعليمية / تعليم طوارئ">خيمة تعليمية / طوارئ</option><option value="بطاقات التعلم الذاتي SLM">بطاقات التعلم الذاتي SLM</option></select></div>' +
            '</div>' +
            '<div><label style="' + lbl + '">📌 عنوان الدرس والوحدة *</label><input id="l60Topic" placeholder="مثلاً: قسمة الكسور العادية — الوحدة الثانية" style="' + inp + '"></div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">' +
              '<button type="button" id="l60RunBtn" style="padding:10px 18px;border-radius:12px;background:linear-gradient(135deg,#10b981,#047857);color:#fff;border:none;font-size:12.5px;font-weight:900;cursor:pointer;">⚡ ولّد ملف الحصة الكامل (4 أجزاء)</button>' +
              '<span style="font-size:11px;color:#94a3b8;">يولّد: خطة التحضير الرسمية + ورقة عمل 3 مستويات + اختبار بلوم والإجابة + الملخص السبوري</span>' +
            '</div>' +
          '</div>';
      }

      if (activeTab === "remedial") {
        formHtml =
          '<div style="display:grid;gap:10px;padding:13px;border-radius:16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);">' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;">' +
              '<div><label style="' + lbl + '">النظام</label><select id="remSys" style="' + inp + '"><option value="حكومي وزاري">🇵🇸 حكومي وزاري</option><option value="الأونروا UNRWA">🇺🇳 الأونروا UNRWA</option></select></div>' +
              '<div><label style="' + lbl + '">نوع الخطة</label><select id="remType" style="' + inp + '"><option value="خطة علاجية للطلاب ذوي التحصيل المتدني">🩺 خطة علاجية</option><option value="خطة إثرائية للطلاب المتفوقين">🌟 خطة إثرائية</option></select></div>' +
              '<div><label style="' + lbl + '">الصف والمبحث</label><input id="remGrade" placeholder="مثلاً: الرابع — اللغة العربية" style="' + inp + '"></div>' +
            '</div>' +
            '<div><label style="' + lbl + '">🎯 المهارة المستهدفة / الضعف الملاحظ *</label><input id="remSkill" placeholder="مثلاً: ضعف في القراءة الجهرية والتمييز بين اللام الشمسية والقمرية" style="' + inp + '"></div>' +
            '<div><button type="button" id="remRunBtn" style="padding:10px 18px;border-radius:12px;background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;font-size:12.5px;font-weight:900;cursor:pointer;">🩺 ولّد الخطة الرسمية جاهزة للطباعة</button></div>' +
          '</div>';
      }

      if (activeTab === "exam_spec") {
        formHtml =
          '<div style="display:grid;gap:10px;padding:13px;border-radius:16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);">' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;">' +
              '<div><label style="' + lbl + '">الصف والمبحث *</label><input id="exSubj" placeholder="مثلاً: الثامن — العلوم والحياة" style="' + inp + '"></div>' +
              '<div><label style="' + lbl + '">نوع الامتحان</label><select id="exType" style="' + inp + '"><option value="امتحان شهري">امتحان شهري</option><option value="امتحان نصف الفصل">امتحان نصف الفصل</option><option value="امتحان نهاية الفصل">امتحان نهاية الفصل</option></select></div>' +
              '<div><label style="' + lbl + '">الدرجة الكلية</label><input id="exMarks" type="number" value="20" style="' + inp + '"></div>' +
            '</div>' +
            '<div><label style="' + lbl + '">📚 الدروس / الوحدات المشمولة *</label><input id="exUnits" placeholder="مثلاً: الوحدة الأولى (الخلية والوراثة) + الوحدة الثانية (المادة)" style="' + inp + '"></div>' +
            '<div><button type="button" id="exRunBtn" style="padding:10px 18px;border-radius:12px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#020617;border:none;font-size:12.5px;font-weight:900;cursor:pointer;">📝 ولّد الامتحان + جدول المواصفات + الإجابة النموذجية</button></div>' +
          '</div>';
      }

      if (activeTab === "student_tutor") {
        formHtml =
          '<div style="display:grid;gap:10px;padding:13px;border-radius:16px;background:rgba(56,189,248,0.09);border:1px solid rgba(56,189,248,0.3);">' +
            '<div style="display:grid;grid-template-columns:1fr 2fr;gap:8px;">' +
              '<div><label style="' + lbl + '">صفك الدراسي</label><input id="stGrade" value="' + esc(prof.gradeOrSubject || "التوجيهي") + '" placeholder="مثلاً: عاشر / توجيهي" style="' + inp + '"></div>' +
              '<div><label style="' + lbl + '">📌 اسم الدرس أو السؤال الذي تريد فهمه *</label><input id="stTopic" placeholder="مثلاً: قانون نيوتن الثاني، أو إعراب الفاعل" style="' + inp + '"></div>' +
            '</div>' +
            '<div><button type="button" id="stRunBtn" style="padding:10px 18px;border-radius:12px;background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;border:none;font-size:12.5px;font-weight:900;cursor:pointer;">🧠 اشرح لي كأني في صفي + اختبرني بـ 5 أسئلة</button></div>' +
          '</div>';
      }

      if (activeTab === "archive") {
        var arch = loadArchive();
        formHtml = !arch.length
          ? '<div style="padding:26px;text-align:center;color:#94a3b8;background:rgba(255,255,255,0.04);border-radius:15px;">أرشيفك فارغ حالياً — كل حصة أو خطة تولّدها تُحفظ هنا تلقائياً لتطبعها مجاناً في أي وقت!</div>'
          : '<div style="display:flex;flex-direction:column;gap:8px;">' + arch.map(function (a, i) {
              return '<div style="padding:10px 12px;border-radius:13px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;">' +
                '<div><strong style="font-size:12.5px;">' + esc(a.title) + '</strong><div style="font-size:10.5px;color:#94a3b8;">' + esc(a.sub) + ' · ' + esc(a.date) + '</div></div>' +
                '<div style="display:flex;gap:6px;">' +
                  '<button type="button" data-arch-open="' + i + '" style="padding:6px 11px;border-radius:9px;background:#0284c7;color:#fff;border:none;font-size:11px;font-weight:900;cursor:pointer;">👁️ عرض</button>' +
                  '<button type="button" data-arch-pdf="' + i + '" style="padding:6px 11px;border-radius:9px;background:#f59e0b;color:#020617;border:none;font-size:11px;font-weight:900;cursor:pointer;">📄 PDF</button>' +
                '</div>' +
              '</div>';
            }).join("") + '</div>';
      }

      var resultBox = lastResultText
        ? '<div id="v284StResultWrap" style="margin-top:14px;padding:14px;border-radius:16px;background:#020617;border:1px solid rgba(52,211,153,0.4);">' +
            '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.1);margin-bottom:10px;">' +
              '<strong style="font-size:13px;color:#6ee7b7;">' + esc(lastResultTitle) + '</strong>' +
              '<div style="display:flex;gap:6px;">' +
                '<button type="button" id="v286SpeakResBtn" style="padding:6px 11px;border-radius:9px;background:rgba(16,185,129,0.22);color:#6ee7b7;border:1px solid rgba(52,211,153,0.45);font-size:11px;font-weight:900;cursor:pointer;">🔊 استمع للشرح</button>' +
                '<button type="button" id="v284CopyResBtn" style="padding:6px 11px;border-radius:9px;background:rgba(56,189,248,0.2);color:#7dd3fc;border:1px solid rgba(56,189,248,0.4);font-size:11px;font-weight:900;cursor:pointer;">📋 نسخ</button>' +
                '<button type="button" id="v284PdfResBtn" style="padding:6px 12px;border-radius:9px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#020617;border:none;font-size:11px;font-weight:900;cursor:pointer;">📄 طباعة / تصدير PDF</button>' +
              '</div>' +
            '</div>' +
            '<div style="font-size:12.5px;line-height:1.8;color:#e2e8f0;max-height:46vh;overflow-y:auto;">' + formatRichHtml(lastResultText) + '</div>' +
          '</div>'
        : '<div id="v284StLoading" style="display:none;margin-top:14px;padding:24px;text-align:center;color:#7dd3fc;font-size:13px;font-weight:800;background:rgba(56,189,248,0.1);border-radius:15px;">⏳ جارٍ التوليد بالذكاء الاصطناعي وفق المنهاج الفلسطيني…</div>';

      body.innerHTML = tabsHtml + formHtml + resultBox;

      body.querySelectorAll("[data-st-tab]").forEach(function (b) {
        b.onclick = function () { activeTab = b.getAttribute("data-st-tab"); render(); };
      });

      function runPrompt(title, sub, promptTxt) {
        lastResultText = "";
        render();
        var ld = document.getElementById("v284StLoading");
        if (ld) ld.style.display = "block";
        callAI(promptTxt).then(function (res) {
          if (res.status === 429 && res.data && res.data.code === "QUOTA_EXCEEDED") {
            toast("⚠️ " + res.data.error, "warn");
            if (global.EduV284Subs) global.EduV284Subs.openPlans();
            return;
          }
          if (!res.data || !res.data.text) {
            toast("❌ " + ((res.data && res.data.error) || "تعذّر التوليد حالياً"), "error");
            render();
            return;
          }
          lastResultTitle = title;
          lastResultSub = sub;
          lastResultText = res.data.text;
          saveArchiveItem({ title: title, sub: sub, text: res.data.text, date: new Date().toLocaleDateString("ar-EG") });
          var q = res.data.quota;
          if (q && q.engineMode === "free_first_gemini") toast("✨ تم التنفيذ على Gemini القوي (طلبك الأول اليوم) ✓", "success");
          else if (q && q.engineMode === "free_zero_cost") toast("✅ تم التنفيذ على المحرك المجاني · المتبقي اليوم: " + q.remainingToday, "info");
          else toast("✅ تم التوليد والحفظ في أرشيفك ✓", "success");
          render();
        }).catch(function () {
          toast("❌ خطأ في الاتصال بالسحابة", "error");
          render();
        });
      }

      var bL60 = document.getElementById("l60RunBtn");
      if (bL60) bL60.onclick = function () {
        var sys = document.getElementById("l60Sys").value;
        var grade = document.getElementById("l60Grade").value.trim();
        var subj = document.getElementById("l60Subj").value.trim();
        var env = document.getElementById("l60Env").value;
        var topic = document.getElementById("l60Topic").value.trim();
        if (!subj || !topic) { toast("⚠️ أدخل المبحث وعنوان الدرس أولاً", "warn"); return; }
        var sysLabel = sys === "unrwa" ? "نظام وكالة الغوث (الأونروا UNRWA)" : "النظام الحكومي الوزاري (وزارة التربية والتعليم الفلسطينية)";
        var templateDetails = sys === "unrwa"
          ? "التحضير الرسمي للأونروا: المخرجات التعليمية، التعلّم القبلي، إجراءات التنفيذ والاستراتيجيات، التمايز والفروق الفردية، التقويم التكويني والختامي، التأمل الذاتي للمعلم."
          : "نموذج التحضير اليومي الوزاري الفلسطيني: الأهداف السلوكية (معرفي/مهاري/وجداني)، الوسائل والمصادر التعليمية، التهيئة والتمهيد، إجراءات التنفيذ (دور المعلم ودور الطالب)، التقويم المرحلي والختامي، الواجب البيتي، ملاحظات المعلم والمشرف.";
        var p = "أنت خبير تربوي متخصص في المنهاج الفلسطيني. أعدّ ملف حصة متكامل جاهز للطباعة وفق (" + sysLabel + ") لبيئة (" + env + ")، للصف (" + grade + ")، مبحث (" + subj + ")، درس (" + topic + "). قسّم الإجابة إلى 4 أقسام واضحة بعناوين ## :\n" +
          "## 1. خطة التحضير الرسمية (" + sysLabel + ")\n" + templateDetails + "\n" +
          "## 2. ورقة عمل طلابية (3 مستويات: تعزيزي / متوسط / إثرائي)\n" +
          "## 3. اختبار قصير وفق هرم بلوم + نموذج الإجابة وتوزيع العلامات\n" +
          "## 4. الملخص السبوري (أهم النقاط التي تُكتب على اللوح)";
        runPrompt("حصة كاملة: " + topic, sysLabel + " — " + grade + " — " + subj, p);
      };

      var bRem = document.getElementById("remRunBtn");
      if (bRem) bRem.onclick = function () {
        var sys = document.getElementById("remSys").value;
        var typ = document.getElementById("remType").value;
        var gr = document.getElementById("remGrade").value.trim();
        var sk = document.getElementById("remSkill").value.trim();
        if (!sk) { toast("⚠️ اكتب المهارة المستهدفة أولاً", "warn"); return; }
        var p = "أعدّ " + typ + " رسمية متكاملة وفق نظام (" + sys + ") للمنهاج الفلسطيني، للصف والمبحث (" + gr + ")، حول المهارة: (" + sk + "). تشمل: تشخيص الحالة، الأهداف الإجرائية، جدول الأنشطة والجدول الزمني، أدوات القياس القبلي والبعدي، ودور ولي الأمر، بصيغة واضحة جاهزة للتسليم للمدير والمشرف التربوي.";
        runPrompt(typ + ": " + sk.slice(0, 40), sys + " — " + gr, p);
      };

      var bEx = document.getElementById("exRunBtn");
      if (bEx) bEx.onclick = function () {
        var sj = document.getElementById("exSubj").value.trim();
        var tp = document.getElementById("exType").value;
        var mk = document.getElementById("exMarks").value || "20";
        var un = document.getElementById("exUnits").value.trim();
        if (!sj || !un) { toast("⚠️ أدخل الصف والمبحث والوحدات أولاً", "warn"); return; }
        var p = "صمّم " + tp + " رسمياً متكاملاً وفق المنهاج الفلسطيني لـ (" + sj + ") في (" + un + ") من (" + mk + " درجة). يتضمن: ## 1. جدول المواصفات المختصر (توزيع الدرجات على مستويات بلوم)، ## 2. ورقة الامتحان منسقة ومتنوعة الأسئلة، ## 3. نموذج الإجابة الرسمي وتوزيع العلامات.";
        runPrompt(tp + " (" + mk + " درجة) — " + sj, un, p);
      };

      var bSt = document.getElementById("stRunBtn");
      if (bSt) bSt.onclick = function () {
        var gr = document.getElementById("stGrade").value.trim();
        var tp = document.getElementById("stTopic").value.trim();
        if (!tp) { toast("⚠️ اكتب اسم الدرس أو السؤال أولاً", "warn"); return; }
        var p = "أنت معلم فلسطيني شغوف ومبسط. اشرح لطالب في (" + gr + ") درس/سؤال: (" + tp + ") بأسلوب شيق ومبسط خطوة بخطوة مع أمثلة من الواقع، ثم ضع ## 5 أسئلة تفاعلية سريعة للمراجعة مع إجاباتها الصحيحة في الأسفل ليتحقق الطالب من فهمه.";
        runPrompt("مُذاكِر الدروس: " + tp, "الصف: " + gr, p);
      };

      body.querySelectorAll("[data-arch-open]").forEach(function (b) {
        b.onclick = function () {
          var item = loadArchive()[Number(b.getAttribute("data-arch-open"))];
          if (item) { lastResultTitle = item.title; lastResultSub = item.sub; lastResultText = item.text; render(); }
        };
      });
      body.querySelectorAll("[data-arch-pdf]").forEach(function (b) {
        b.onclick = function () {
          var item = loadArchive()[Number(b.getAttribute("data-arch-pdf"))];
          if (item) printOfficialPdf(item.title, item.sub, item.text);
        };
      });

      var spBtn = document.getElementById("v286SpeakResBtn");
      if (spBtn) spBtn.onclick = function () {
        if (global.EduTTS && typeof global.EduTTS.speak === "function") {
          global.EduTTS.speak(lastResultText.slice(0, 1800));
          toast("🔊 جارٍ قراءة الشرح بأسلوب المعلم العربي…", "info");
        } else {
          toast("⚠️ محرك الصوت غير متاح حالياً", "warn");
        }
      };
      if (global.EduArabicMath && typeof global.EduArabicMath.renderIn === "function") {
        setTimeout(function () { global.EduArabicMath.renderIn(document.getElementById("v284StResultWrap")); }, 80);
      }
      var cpBtn = document.getElementById("v284CopyResBtn");
      if (cpBtn) cpBtn.onclick = function () {
        if (navigator.clipboard) navigator.clipboard.writeText(lastResultText).catch(function () {});
        toast("📋 تم نسخ النص بنجاح ✓", "success");
      };
      var pdfBtn = document.getElementById("v284PdfResBtn");
      if (pdfBtn) pdfBtn.onclick = function () { printOfficialPdf(lastResultTitle, lastResultSub, lastResultText); };
    }

    render();
  }

  global.EduV284Pro = { open: openStudioModal };
})(window);
