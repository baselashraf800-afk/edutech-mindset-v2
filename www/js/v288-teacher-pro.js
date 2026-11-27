/* ============================================================================
 * EduTech Mindset — v288 Teacher Operations Room PRO + Smart Camera Scanner
 * 1) الماسح الذكي بالكاميرا (كشف الأسماء ← لكل الأدوات، كشف العلامات، صفحة الكتاب، تصحيح الورقة، الجدول)
 * 2) مُحلّل نتائج الاختبارات الإحصائي PDF + رسائل أولياء الأمور بضغطة واتساب
 * 3) إدارة الصف التفاعلية أوفلاين (عجلة الاختيار + تقسيم المجموعات + لوحة النجوم)
 * 4) مُوزّع الخطة الفصلية الرسمي (حكومي/أونروا) + مُعدّ الإذاعة المدرسية
 * 5) بنك الأسئلة السريع + ورقة التظليل (Bubble Sheet A4)
 * 6) مُجمّع ملف الإنجاز المهني للمعلم (Portfolio PDF)
 * ============================================================================ */
(function (global) {
  "use strict";

  var ROSTER_KEY = "edutech_v288_teacher_roster";
  var STARS_KEY = "edutech_v288_group_stars";
  var SCHED_KEY = "edutech_v288_teacher_schedule";

  var st = {
    tab: "camera",
    roster: [],       // ["أحمد محمد", ...]
    marksText: "",    // "أحمد محمد, 18\nسارة علي, 14"
    maxMark: 20,
    scanOutput: "",
    groups: [],
    groupStars: {},
    wheelWinner: "",
    termPlanOut: "",
    radioOut: "",
    bankOut: "",
    scheduleOut: ""
  };

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

  function loadSaved() {
    try { st.roster = JSON.parse(localStorage.getItem(ROSTER_KEY) || "[]"); } catch (_) { st.roster = []; }
    try { st.groupStars = JSON.parse(localStorage.getItem(STARS_KEY) || "{}"); } catch (_) { st.groupStars = {}; }
    try { st.scheduleOut = localStorage.getItem(SCHED_KEY) || ""; } catch (_) {}
  }

  function saveRoster(list) {
    st.roster = list.map(function (x) { return String(x || "").trim(); }).filter(Boolean);
    try { localStorage.setItem(ROSTER_KEY, JSON.stringify(st.roster)); } catch (_) {}
  }

  function getToken() {
    var u = (global.Cloud && global.Cloud.user) || null;
    if (!u && global.firebase && typeof global.firebase.auth === "function") {
      try { u = global.firebase.auth().currentUser; } catch (_) {}
    }
    return (u && u.getIdToken) ? u.getIdToken().catch(function () { return ""; }) : Promise.resolve("");
  }

  function compressFileToB64(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function (ev) {
        var img = new Image();
        img.onload = function () {
          var maxD = 1280, w = img.width, h = img.height;
          if (w > maxD || h > maxD) { var sc = maxD / Math.max(w, h); w = Math.round(w * sc); h = Math.round(h * sc); }
          var c = document.createElement("canvas"); c.width = w; c.height = h;
          var ctx = c.getContext("2d");
          ctx.filter = "contrast(1.2) brightness(1.06)";
          ctx.drawImage(img, 0, 0, w, h);
          resolve(c.toDataURL("image/jpeg", 0.82).split(",")[1]);
        };
        img.onerror = reject;
        img.src = ev.target.result;
      };
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  function callAI(prompt, files) {
    return getToken().then(function (tok) {
      return fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "chat", idToken: tok, prompt: prompt, files: files || [], tool: "v288_teacher_pro" })
      }).then(function (r) { return r.json().then(function (j) { return { status: r.status, data: j }; }); });
    });
  }

  function printA4(title, sub, innerHtml) {
    var prof = (global.EduV284Welcome && global.EduV284Welcome.getProfile) ? (global.EduV284Welcome.getProfile() || {}) : {};
    var w = window.open("", "_blank");
    if (!w) { toast("⚠️ اسمح بالنوافذ المنبثقة للطباعة PDF", "warn"); return; }
    w.document.open();
    w.document.write(
      '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>' + esc(title) + '</title>' +
      '<style>@page{size:A4;margin:13mm;}body{font-family:Tahoma,Arial,sans-serif;color:#0f172a;line-height:1.75;font-size:12.5px;}' +
      '.hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #0f172a;padding-bottom:8px;margin-bottom:14px;}' +
      'table{width:100%;border-collapse:collapse;margin:10px 0;font-size:11.5px;}th,td{border:1px solid #cbd5e1;padding:6px 8px;text-align:right;}th{background:#f1f5f9;}' +
      '.ftr{margin-top:22px;border-top:1px dashed #94a3b8;padding-top:8px;font-size:10.5px;color:#475569;display:flex;justify-content:space-between;}</style></head><body>' +
      '<div class="hdr"><div><div style="font-size:17px;font-weight:900;">' + esc(title) + '</div><div style="font-size:11.5px;color:#475569;">' + esc(sub) + ' · المدرسة: ' + esc(prof.school || "—") + ' · المعلم: ' + esc(prof.name || "—") + '</div></div><div style="font-size:11px;">' + new Date().toLocaleDateString("ar-EG") + '</div></div>' +
      innerHtml +
      '<div class="ftr"><span>صادر عن غرفة عمليات المعلم PRO — EduTech Mindset (إشراف أ. باسل أشرف الفقعاوي)</span><span>https://edutech-mindset.pages.dev</span></div>' +
      '<script>window.onload=function(){setTimeout(function(){window.print();},350);};<\/script></body></html>'
    );
    w.document.close();
  }

  // ==========================================================================
  // 1) مسح الصور الذكي بالكاميرا (5 أوضاع للمعلم)
  // ==========================================================================
  function runCameraScan(mode, file) {
    if (!file) return;
    toast("📸 جارٍ ضغط الصورة وقراءتها بالذكاء الاصطناعي…", "info");
    compressFileToB64(file).then(function (b64) {
      var p = "";
      if (mode === "roster") {
        p = "اقرأ جميع أسماء الطلاب الموجودة في هذا الكشف الورقي (سواء مطبوعة أو بخط اليد) بدقة كاملة. أعد الأسماء فقط — كل اسم في سطر مستقل بدون أرقام أو عناوين أو مقدمات.";
      } else if (mode === "marks") {
        p = "اقرأ كشف العلامات في هذه الصورة (اسم الطالب والدرجة بجانبه). أعد كل طالب في سطر مستقل بالصيغة الدقيقة التالية فقط: اسم الطالب, الدرجة (مثال: أحمد محمود, 18) بدون أي نص إضافي.";
      } else if (mode === "book") {
        p = "اقرأ صفحة الكتاب المدرسي هذه بدقة، ثم أنتج منها: 1) خطة تحضير مختصرة (أهداف + إجراءات + تقويم)، 2) 5 أسئلة اختيار من متعدد متدرجة مع الإجابة الصحيحة، 3) نشاطاً صفياً لورقة عمل.";
      } else if (mode === "grade_paper") {
        var keyAns = (document.getElementById("tpKeyAns") && document.getElementById("tpKeyAns").value.trim()) || "قيّم الإجابة علمياً حسب المنهاج الفلسطيني";
        p = "هذه ورقة حل طالب في اختبار أو واجب. نموذج الإجابة المرجعي هو: (" + keyAns + "). اقرأ إجابة الطالب، قدّر الدرجة المقترحة من 10، حدّد مواطن القوة والخطأ بدقة، واكتب ملاحظة تربوية مشجّعة قصيرة للطالب.";
      } else if (mode === "schedule") {
        p = "اقرأ الجدول المدرسي الأسبوعي في هذه الصورة وحوّله إلى جدول نصي مرتّب حسب الأيام (الأحد إلى الخميس) والحصص بوضوح تام.";
      }
      return callAI(p, [{ mime: "image/jpeg", data: b64, name: "scan.jpg" }]);
    }).then(function (res) {
      if (res.status === 429 && res.data && res.data.code === "QUOTA_EXCEEDED") {
        toast("⚠️ " + res.data.error, "warn");
        if (global.EduV284Subs) global.EduV284Subs.openPlans();
        return;
      }
      var txt = (res.data && res.data.text) || "";
      if (!txt) { toast("❌ تعذّرت قراءة الصورة — تأكد من وضوح الإضاءة", "error"); return; }

      if (mode === "roster") {
        var names = txt.split(/\n+/).map(function (x) { return x.replace(/^[\d\-\.\)\s•]+/, "").trim(); }).filter(function (x) { return x.length > 1; });
        saveRoster(names);
        toast("🎉 تم استخراج وحفظ " + st.roster.length + " طالباً تلقائياً في كل الأدوات ✓", "success");
      } else if (mode === "marks") {
        st.marksText = txt.trim();
        st.tab = "analyzer";
        toast("📊 تم استخراج كشف العلامات ونقله لمُحلّل النتائج فوراً ✓", "success");
      } else if (mode === "schedule") {
        st.scheduleOut = txt.trim();
        try { localStorage.setItem(SCHED_KEY, st.scheduleOut); } catch (_) {}
        toast("🗓️ تم حفظ جدولك المدرسي أوفلاين على هاتفك ✓", "success");
      } else {
        st.scanOutput = txt;
        toast("✅ تمت القراءة والتحليل بنجاح ✓", "success");
      }
      renderBody();
    }).catch(function () { toast("❌ خطأ في الاتصال بالسحابة", "error"); });
  }

  // ==========================================================================
  // 2) تحليل نتائج الاختبارات الإحصائي
  // ==========================================================================
  function parseMarks() {
    var rows = [];
    String(st.marksText || "").split(/\n+/).forEach(function (ln) {
      var parts = ln.split(/[,،:\t\-]+/);
      if (parts.length >= 2) {
        var nm = parts[0].trim();
        var sc = parseFloat(parts[parts.length - 1].replace(/[^\d.]/g, ""));
        if (nm && !isNaN(sc)) rows.push({ name: nm, score: sc });
      }
    });
    return rows;
  }

  function computeStats(rows, maxM) {
    if (!rows.length) return null;
    var m = maxM > 0 ? maxM : 20;
    var passMark = m * 0.5;
    var sum = 0, hi = -1, lo = 99999, passed = 0;
    var dist = { exc: 0, vgood: 0, good: 0, acc: 0, weak: 0 };
    var remedial = [];
    rows.forEach(function (r) {
      sum += r.score;
      if (r.score > hi) hi = r.score;
      if (r.score < lo) lo = r.score;
      var pct = (r.score / m) * 100;
      if (r.score >= passMark) passed++;
      else remedial.push(r);
      if (pct >= 90) dist.exc++;
      else if (pct >= 80) dist.vgood++;
      else if (pct >= 70) dist.good++;
      else if (pct >= 50) dist.acc++;
      else dist.weak++;
    });
    return {
      total: rows.length,
      passed: passed,
      failed: rows.length - passed,
      passRate: Math.round((passed / rows.length) * 100),
      avg: (sum / rows.length).toFixed(1),
      hi: hi, lo: lo, dist: dist, remedial: remedial
    };
  }

  function printBubbleSheetPdf() {
    var rows = "";
    for (var i = 1; i <= 20; i++) {
      rows += '<tr><td style="text-align:center;font-weight:bold;">' + i + '</td>' +
        ['أ', 'ب', 'ج', 'د'].map(function (ch) {
          return '<td style="text-align:center;"><span style="display:inline-block;width:20px;height:20px;border-radius:50%;border:2px solid #0f172a;line-height:18px;font-size:11px;font-weight:bold;">' + ch + '</span></td>';
        }).join("") + '</tr>';
    }
    printA4("ورقة الإجابة بالتظليل (Bubble Sheet)", "نموذج 20 سؤال اختيار من متعدد — ظلّل الدائرة الصحيحة بالكامل",
      '<div style="display:flex;justify-content:space-between;border:1px solid #94a3b8;padding:8px 12px;border-radius:8px;margin-bottom:12px;"><span>اسم الطالب: _____________________</span><span>الصف/الشعبة: _________</span><span>الدرجة: ___ / 20</span></div>' +
      '<table><thead><tr><th>السؤال</th><th style="text-align:center;">أ</th><th style="text-align:center;">ب</th><th style="text-align:center;">ج</th><th style="text-align:center;">د</th></tr></thead><tbody>' + rows + '</tbody></table>'
    );
  }

  function renderBody() {
    var body = document.getElementById("v288TeacherBody");
    if (!body) return;
    var inp = "width:100%;padding:8px 10px;border-radius:10px;background:#020617;color:#fff;border:1px solid rgba(255,255,255,0.2);font-size:12px;";
    var lbl = "display:block;font-size:10.5px;font-weight:900;color:#7dd3fc;margin-bottom:3px;";

    var tabs = [
      { id: "camera", label: "📸 الماسح بالكاميرا (" + st.roster.length + ")" },
      { id: "analyzer", label: "📊 تحليل العلامات + واتساب" },
      { id: "classroom", label: "🎡 العجلة والمجموعات" },
      { id: "term_radio", label: "🗓️ الخطة الفصلية والإذاعة" },
      { id: "qbank", label: "📋 بنك الأسئلة والتظليل" },
      { id: "portfolio", label: "🗂️ ملف الإنجاز PDF" }
    ];
    var tabsHtml = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">' + tabs.map(function (t) {
      var on = st.tab === t.id;
      return '<button type="button" data-tp-tab="' + t.id + '" style="padding:7px 11px;border-radius:11px;font-size:11.5px;font-weight:900;cursor:pointer;border:1px solid ' + (on ? '#10b981' : 'rgba(255,255,255,0.15)') + ';background:' + (on ? 'linear-gradient(135deg,#10b981,#047857)' : 'rgba(255,255,255,0.06)') + ';color:#fff;">' + t.label + '</button>';
    }).join("") + '</div>';

    var html = "";

    // TAB 1: Smart Camera Scanner (5 modes)
    if (st.tab === "camera") {
      html =
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:8px;margin-bottom:12px;">' +
          '<label style="padding:11px;border-radius:14px;background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;font-size:12px;font-weight:900;cursor:pointer;text-align:center;">📋 مسح كشف الأسماء بالكاميرا<div style="font-size:10px;opacity:.9;margin-top:2px;">ينقل كل الأسماء تلقائياً لكل الأدوات</div><input type="file" accept="image/*" capture="environment" data-cam-mode="roster" style="display:none;"></label>' +
          '<label style="padding:11px;border-radius:14px;background:linear-gradient(135deg,#10b981,#047857);color:#fff;font-size:12px;font-weight:900;cursor:pointer;text-align:center;">📊 مسح كشف العلامات الورقي<div style="font-size:10px;opacity:.9;margin-top:2px;">يحوّله فوراً لتحليل إحصائي PDF</div><input type="file" accept="image/*" capture="environment" data-cam-mode="marks" style="display:none;"></label>' +
          '<label style="padding:11px;border-radius:14px;background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;font-size:12px;font-weight:900;cursor:pointer;text-align:center;">📖 مسح صفحة من الكتاب<div style="font-size:10px;opacity:.9;margin-top:2px;">تحضير + ورقة عمل + أسئلة</div><input type="file" accept="image/*" capture="environment" data-cam-mode="book" style="display:none;"></label>' +
          '<label style="padding:11px;border-radius:14px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#020617;font-size:12px;font-weight:900;cursor:pointer;text-align:center;">📝 تصحيح ورقة حل طالب<div style="font-size:10px;opacity:.9;margin-top:2px;">درجة مقترحة + تحديد الخطأ</div><input type="file" accept="image/*" capture="environment" data-cam-mode="grade_paper" style="display:none;"></label>' +
          '<label style="padding:11px;border-radius:14px;background:rgba(236,72,153,0.22);color:#f9a8d4;border:1px solid rgba(236,72,153,0.4);font-size:12px;font-weight:900;cursor:pointer;text-align:center;">🗓️ مسح الجدول المدرسي<div style="font-size:10px;opacity:.9;margin-top:2px;">حفظ أوفلاين على جوالك</div><input type="file" accept="image/*" capture="environment" data-cam-mode="schedule" style="display:none;"></label>' +
          '<button type="button" id="tpOpenNotebookSc" style="padding:11px;border-radius:14px;background:rgba(56,189,248,0.18);color:#7dd3fc;border:1px solid rgba(56,189,248,0.4);font-size:12px;font-weight:900;cursor:pointer;">📸 ماسح الدفاتر المتتابع<div style="font-size:10px;opacity:.9;margin-top:2px;">PDF بنفس الخط أو خط كمبيوتر</div></button>' +
        '</div>' +
        '<div style="margin-bottom:10px;"><input id="tpKeyAns" placeholder="(اختياري لتصحيح الورقة) اكتب نموذج الإجابة الصحيح هنا قبل تصوير ورقة الطالب…" style="' + inp + '"></div>' +
        '<div style="padding:11px;border-radius:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);margin-bottom:10px;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;"><strong style="font-size:12px;color:#6ee7b7;">👥 كشف أسماء الشعبة المحفوظ (' + st.roster.length + ' طالباً — متاح في كل الأدوات):</strong><button type="button" id="tpSaveRosterBtn" style="padding:5px 10px;border-radius:8px;background:#10b981;color:#020617;border:none;font-size:11px;font-weight:900;cursor:pointer;">💾 حفظ التعديل</button></div>' +
          '<textarea id="tpRosterArea" rows="4" placeholder="امسح كشف الأسماء بالكاميرا بالأعلى، أو اكتب/الصق كل اسم في سطر…" style="' + inp + '">' + esc(st.roster.join("\n")) + '</textarea>' +
        '</div>' +
        (st.scanOutput ? '<div style="padding:12px;border-radius:14px;background:#020617;border:1px solid rgba(52,211,153,0.4);font-size:12px;line-height:1.8;white-space:pre-wrap;margin-bottom:10px;">' + esc(st.scanOutput) + '</div>' : '') +
        (st.scheduleOut ? '<div style="padding:12px;border-radius:14px;background:rgba(236,72,153,0.1);border:1px solid rgba(236,72,153,0.35);font-size:12px;line-height:1.8;white-space:pre-wrap;"><strong>🗓️ جدولك المدرسي المحفوظ أوفلاين:</strong>\n' + esc(st.scheduleOut) + '</div>' : '');
    }

    // TAB 2: Statistical Marks Analyzer PDF + Parent WhatsApp Generator
    if (st.tab === "analyzer") {
      var rows = parseMarks();
      var stats = computeStats(rows, st.maxMark);
      html =
        '<div style="display:grid;grid-template-columns:1fr 140px;gap:8px;margin-bottom:8px;">' +
          '<textarea id="tpMarksArea" rows="5" placeholder="الصق العلامات أو امسحها بالكاميرا (اسم الطالب, الدرجة) مثال:\nأحمد سالم, 19\nخالد عمر, 9" style="' + inp + '">' + esc(st.marksText) + '</textarea>' +
          '<div style="display:flex;flex-direction:column;gap:7px;">' +
            '<div><label style="' + lbl + '">الدرجة العظمى</label><input id="tpMaxMark" type="number" value="' + st.maxMark + '" style="' + inp + '"></div>' +
            '<button type="button" id="tpCalcBtn" style="padding:9px;border-radius:10px;background:#0284c7;color:#fff;border:none;font-size:12px;font-weight:900;cursor:pointer;">📊 تحليل الآن</button>' +
            (stats ? '<button type="button" id="tpStatsPdfBtn" style="padding:9px;border-radius:10px;background:#f59e0b;color:#020617;border:none;font-size:12px;font-weight:900;cursor:pointer;">📄 تقرير PDF</button>' : '') +
          '</div>' +
        '</div>' +
        (stats ? (
          '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:7px;margin-bottom:10px;">' +
            '<div style="padding:9px;border-radius:12px;background:rgba(16,185,129,0.16);text-align:center;"><div style="font-size:10.5px;color:#6ee7b7;">نسبة النجاح</div><strong style="font-size:20px;">' + stats.passRate + '%</strong></div>' +
            '<div style="padding:9px;border-radius:12px;background:rgba(56,189,248,0.16);text-align:center;"><div style="font-size:10.5px;color:#7dd3fc;">المتوسط</div><strong style="font-size:20px;">' + stats.avg + '/' + st.maxMark + '</strong></div>' +
            '<div style="padding:9px;border-radius:12px;background:rgba(251,191,36,0.16);text-align:center;"><div style="font-size:10.5px;color:#fde68a;">أعلى / أدنى</div><strong style="font-size:18px;">' + stats.hi + ' / ' + stats.lo + '</strong></div>' +
            '<div style="padding:9px;border-radius:12px;background:rgba(244,63,94,0.16);text-align:center;"><div style="font-size:10.5px;color:#fda4af;">بحاجة لخطة علاجية</div><strong style="font-size:20px;">' + stats.remedial.length + '</strong></div>' +
          '</div>' +
          (stats.remedial.length ? '<div style="padding:9px 11px;border-radius:12px;background:rgba(244,63,94,0.12);border:1px solid rgba(251,113,133,0.35);font-size:11.5px;margin-bottom:12px;">🩺 <strong>الطلاب المحتاجون لخطة علاجية:</strong> ' + stats.remedial.map(function (r) { return esc(r.name) + ' (' + r.score + ')'; }).join(" · ") + '</div>' : '')
        ) : '') +
        '<div style="padding:12px;border-radius:14px;background:rgba(16,185,129,0.1);border:1px solid rgba(52,211,153,0.35);">' +
          '<div style="font-size:12.5px;font-weight:900;color:#6ee7b7;margin-bottom:8px;">📩 مولّد رسائل أولياء الأمور السريعة على واتساب</div>' +
          '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:7px;">' +
            '<input id="waStuName" placeholder="اسم الطالب" value="' + esc(st.roster[0] || "") + '" style="' + inp + '">' +
            '<select id="waStuStatus" style="' + inp + '">' +
              '<option value="متفوق ومتميز في الصف">🌟 متفوق ومتميز</option>' +
              '<option value="أظهر تحسّناً ملحوظاً هذا الأسبوع">📈 تحسّن ملحوظ</option>' +
              '<option value="يحتاج لمتابعة في الواجبات البيتية">📝 يحتاج متابعة واجبات</option>' +
              '<option value="تغيّب عن الحصص الأخيرة ونرجو الاطمئنان عليه">⚠️ متابعة غياب</option>' +
            '</select>' +
            '<input id="waParentNum" dir="ltr" placeholder="رقم ولي الأمر (اختياري 97059...)" style="' + inp + '">' +
            '<button type="button" id="waSendParentBtn" style="padding:8px 12px;border-radius:10px;background:#25d366;color:#020617;border:none;font-size:12px;font-weight:900;cursor:pointer;">💬 إرسال واتساب</button>' +
          '</div>' +
        '</div>';
    }

    // TAB 3: Offline Classroom Management (Spin Wheel + Groups + Stars)
    if (st.tab === "classroom") {
      html =
        '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px;">' +
          '<button type="button" id="tpSpinBtn" style="padding:10px 18px;border-radius:13px;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#020617;border:none;font-size:13px;font-weight:900;cursor:pointer;">🎡 لفّ عجلة الاختيار العشوائي</button>' +
          '<select id="tpGrpSize" style="padding:9px;border-radius:11px;background:#020617;color:#fff;border:1px solid rgba(255,255,255,0.2);font-size:12px;"><option value="3">مجموعات من 3</option><option value="4" selected>مجموعات من 4</option><option value="5">مجموعات من 5</option><option value="6">مجموعات من 6</option></select>' +
          '<button type="button" id="tpMakeGrpsBtn" style="padding:10px 15px;border-radius:13px;background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;font-size:12.5px;font-weight:900;cursor:pointer;">👥 قسّم الشعبة لمجموعات</button>' +
        '</div>' +
        (st.wheelWinner ? '<div style="padding:16px;border-radius:18px;background:linear-gradient(135deg,rgba(251,191,36,0.24),rgba(16,185,129,0.2));border:2px solid #fbbf24;text-align:center;margin-bottom:12px;"><div style="font-size:11.5px;color:#fde68a;">🎉 الطالب المختار للمشاركة الآن:</div><div style="font-size:24px;font-weight:900;color:#fff;margin-top:4px;">🌟 ' + esc(st.wheelWinner) + ' 🌟</div></div>' : '') +
        (st.groups.length
          ? '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;">' + st.groups.map(function (g, i) {
              var gKey = "g" + i;
              var stars = st.groupStars[gKey] || 0;
              return '<div style="padding:11px;border-radius:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(56,189,248,0.35);">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;"><strong style="color:#7dd3fc;">المجموعة ' + (i + 1) + '</strong><span style="color:#fde68a;font-weight:900;">⭐ ' + stars + '</span></div>' +
                '<div style="font-size:11.5px;line-height:1.7;color:#e2e8f0;margin-bottom:8px;">' + g.map(function (n) { return "• " + esc(n); }).join("<br>") + '</div>' +
                '<div style="display:flex;gap:5px;"><button type="button" data-star-add="' + gKey + '" style="flex:1;padding:5px;border-radius:8px;background:#10b981;color:#020617;border:none;font-weight:900;cursor:pointer;">+1 ⭐</button><button type="button" data-star-sub="' + gKey + '" style="padding:5px 9px;border-radius:8px;background:rgba(244,63,94,0.25);color:#fda4af;border:none;font-weight:900;cursor:pointer;">-1</button></div>' +
              '</div>';
            }).join("") + '</div>'
          : '<div style="padding:18px;text-align:center;color:#94a3b8;font-size:12px;">أضف أو امسح كشف الأسماء في التبويب الأول (' + st.roster.length + ' طالباً محفوظاً) ثم جرّب العجلة وتقسيم المجموعات أوفلاين!</div>');
    }

    // TAB 4: Term Plan Distributor + School Radio
    if (st.tab === "term_radio") {
      html =
        '<div style="display:grid;gap:12px;">' +
          '<div style="padding:12px;border-radius:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);">' +
            '<div style="font-size:13px;font-weight:900;color:#fde68a;margin-bottom:7px;">🗓️ مُوزّع الخطة الفصلية الرسمي (حكومي / أونروا)</div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:7px;margin-bottom:7px;">' +
              '<select id="tpTermSys" style="' + inp + '"><option value="حكومي وزاري">🇵🇸 حكومي وزاري</option><option value="الأونروا UNRWA">🇺🇳 الأونروا</option></select>' +
              '<input id="tpTermSubj" placeholder="الصف والمبحث (مثلاً: سادس رياضيات)" style="' + inp + '">' +
              '<input id="tpTermUnits" placeholder="أسماء الوحدات (مفصولة بفاصلة)" style="' + inp + '">' +
            '</div>' +
            '<button type="button" id="tpTermGo" style="padding:8px 15px;border-radius:10px;background:#10b981;color:#020617;border:none;font-size:12px;font-weight:900;cursor:pointer;">🗓️ ولّد جدول الخطة الفصلية</button>' +
            (st.termPlanOut ? '<div style="margin-top:8px;"><button type="button" id="tpTermPdf" style="padding:5px 11px;border-radius:8px;background:#f59e0b;color:#020617;border:none;font-size:11px;font-weight:900;cursor:pointer;margin-bottom:6px;">📄 طباعة PDF</button><div style="font-size:12px;line-height:1.75;white-space:pre-wrap;max-height:220px;overflow-y:auto;background:#020617;padding:10px;border-radius:10px;">' + esc(st.termPlanOut) + '</div></div>' : '') +
          '</div>' +
          '<div style="padding:12px;border-radius:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);">' +
            '<div style="font-size:13px;font-weight:900;color:#7dd3fc;margin-bottom:7px;">🎙️ مُعدّ الإذاعة المدرسية المتكاملة في 30 ثانية</div>' +
            '<div style="display:flex;gap:7px;margin-bottom:7px;">' +
              '<input id="tpRadioTopic" placeholder="موضوع الإذاعة (مثلاً: بر الوالدين، يوم المعلم، النظافة، التفاؤل والأمل)" style="' + inp + '">' +
              '<button type="button" id="tpRadioGo" style="padding:8px 14px;border-radius:10px;background:#0284c7;color:#fff;border:none;font-size:12px;font-weight:900;cursor:pointer;white-space:nowrap;">🎙️ ولّد الإذاعة</button>' +
            '</div>' +
            (st.radioOut ? '<div><button type="button" id="tpRadioPdf" style="padding:5px 11px;border-radius:8px;background:#f59e0b;color:#020617;border:none;font-size:11px;font-weight:900;cursor:pointer;margin-bottom:6px;">📄 طباعة أوراق الإذاعة PDF</button><div style="font-size:12px;line-height:1.75;white-space:pre-wrap;max-height:220px;overflow-y:auto;background:#020617;padding:10px;border-radius:10px;">' + esc(st.radioOut) + '</div></div>' : '') +
          '</div>' +
        '</div>';
    }

    // TAB 5: Question Bank + Bubble Sheet
    if (st.tab === "qbank") {
      html =
        '<div style="display:grid;gap:9px;">' +
          '<textarea id="tpBankText" rows="4" placeholder="الصق فقرة من الكتاب المدرسي أو عنوان درس لتوليد 15 سؤال اختيار من متعدد مع مفتاح الإجابة…" style="' + inp + '"></textarea>' +
          '<div style="display:flex;flex-wrap:wrap;gap:8px;">' +
            '<button type="button" id="tpBankGo" style="padding:9px 16px;border-radius:11px;background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;border:none;font-size:12px;font-weight:900;cursor:pointer;">📋 ولّد بنك الأسئلة + الإجابات</button>' +
            '<button type="button" id="tpBubbleBtn" style="padding:9px 16px;border-radius:11px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#020617;border:none;font-size:12px;font-weight:900;cursor:pointer;">⭕ طباعة ورقة التظليل (Bubble Sheet PDF)</button>' +
          '</div>' +
          (st.bankOut ? '<div style="padding:11px;border-radius:12px;background:#020617;border:1px solid rgba(167,139,250,0.4);font-size:12px;line-height:1.8;white-space:pre-wrap;max-height:36vh;overflow-y:auto;">' + esc(st.bankOut) + '</div>' : '') +
        '</div>';
    }

    // TAB 6: Teacher Professional Portfolio PDF
    if (st.tab === "portfolio") {
      var arch = [];
      try { arch = JSON.parse(localStorage.getItem("edutech_v284_lesson_archive") || "[]"); } catch (_) {}
      html =
        '<div style="padding:14px;border-radius:16px;background:rgba(255,255,255,0.05);border:1px solid rgba(52,211,153,0.35);">' +
          '<div style="font-size:14px;font-weight:900;color:#6ee7b7;margin-bottom:6px;">🗂️ مُجمّع ملف الإنجاز المهني الرسمي للمعلم (Portfolio PDF)</div>' +
          '<p style="font-size:12px;color:#cbd5e1;line-height:1.7;margin:0 0 10px;">يجمع تلقائياً بياناتك المهنية + خططك المحفوظة في الأرشيف (' + arch.length + ' خطة) + عدد طلاب شعبتك (' + st.roster.length + ') + أبرز إنجازاتك ودوراتك في مستند A4 PDF مفهرس جاهز للمدير والمشرف التربوي.</p>' +
          '<textarea id="tpPortNotes" rows="3" placeholder="أضف أبرز دوراتك أو مبادراتك الصفية هذا الفصل (اختياري)…" style="' + inp + 'margin-bottom:10px;"></textarea>' +
          '<button type="button" id="tpPortPdfBtn" style="padding:10px 18px;border-radius:12px;background:linear-gradient(135deg,#10b981,#047857);color:#fff;border:none;font-size:12.5px;font-weight:900;cursor:pointer;">📄 تصدير ملف الإنجاز المهني الرسمي PDF</button>' +
        '</div>';
    }

    body.innerHTML = tabsHtml + html;

    // Bind Tab Switch
    body.querySelectorAll("[data-tp-tab]").forEach(function (b) {
      b.onclick = function () { st.tab = b.getAttribute("data-tp-tab"); renderBody(); };
    });

    // Tab 1 bindings
    body.querySelectorAll("[data-cam-mode]").forEach(function (inpEl) {
      inpEl.onchange = function () {
        if (inpEl.files && inpEl.files[0]) runCameraScan(inpEl.getAttribute("data-cam-mode"), inpEl.files[0]);
      };
    });
    var nbBtn = document.getElementById("tpOpenNotebookSc");
    if (nbBtn) nbBtn.onclick = function () { if (global.EduSmartScanner) global.EduSmartScanner.open(); };
    var svR = document.getElementById("tpSaveRosterBtn");
    if (svR) svR.onclick = function () {
      var val = (document.getElementById("tpRosterArea").value || "").split(/\n+/);
      saveRoster(val);
      toast("💾 تم حفظ كشف الشعبة (" + st.roster.length + " طالباً) ✓", "success");
      renderBody();
    };

    // Tab 2 bindings
    var calcB = document.getElementById("tpCalcBtn");
    if (calcB) calcB.onclick = function () {
      st.marksText = document.getElementById("tpMarksArea").value;
      st.maxMark = Number(document.getElementById("tpMaxMark").value) || 20;
      renderBody();
    };
    var pdfSt = document.getElementById("tpStatsPdfBtn");
    if (pdfSt) pdfSt.onclick = function () {
      var rws = parseMarks();
      var s = computeStats(rws, st.maxMark);
      if (!s) return;
      var tbl = '<table><tr><th>إجمالي الطلبة</th><th>الناجحون</th><th>نسبة النجاح</th><th>المتوسط</th><th>أعلى درجة</th><th>أدنى درجة</th></tr>' +
        '<tr><td>' + s.total + '</td><td>' + s.passed + '</td><td><strong>' + s.passRate + '%</strong></td><td>' + s.avg + ' / ' + st.maxMark + '</td><td>' + s.hi + '</td><td>' + s.lo + '</td></tr></table>' +
        '<h3>توزيع التقديرات</h3><table><tr><th>ممتاز (90%+)</th><th>جيد جداً (80-89%)</th><th>جيد (70-79%)</th><th>مقبول (50-69%)</th><th>دون المستوى (&lt;50%)</th></tr>' +
        '<tr><td>' + s.dist.exc + '</td><td>' + s.dist.vgood + '</td><td>' + s.dist.good + '</td><td>' + s.dist.acc + '</td><td><strong>' + s.dist.weak + '</strong></td></tr></table>' +
        '<h3>قائمة الطلبة المحتاجين لخطة علاجية</h3><p>' + (s.remedial.length ? s.remedial.map(function (x) { return esc(x.name) + ' (' + x.score + ')'; }).join(" — ") : "لا يوجد — جميع الطلبة ناجحون بحمد الله!") + '</p>';
      printA4("تقرير التحليل الإحصائي الرسمي لنتائج الاختبار", "النظام الحكومي الوزاري / الأونروا", tbl);
    };
    var waP = document.getElementById("waSendParentBtn");
    if (waP) waP.onclick = function () {
      var sn = (document.getElementById("waStuName").value || "الطالب").trim();
      var ss = document.getElementById("waStuStatus").value;
      var pn = (document.getElementById("waParentNum").value || "").replace(/[^\d]/g, "");
      var msg = "السلام عليكم ورحمة الله وبركاته، ولي أمر الطالب الفاضل (" + sn + ")،\nنود إعلامكم بأن الطالب " + ss + ". نشكر تعاونكم ومتابعتكم المستمرة، ومعاً نصنع تميّز أبنائنا 🌟\n— معلم المادة (عبر منصة EduTech Mindset)";
      window.open((pn ? ("https://wa.me/" + pn + "?text=") : "https://wa.me/?text=") + encodeURIComponent(msg), "_blank");
    };

    // Tab 3 bindings
    var spinB = document.getElementById("tpSpinBtn");
    if (spinB) spinB.onclick = function () {
      if (!st.roster.length) { toast("⚠️ أضف أو امسح كشف الأسماء أولاً في التبويب الأول", "warn"); return; }
      st.wheelWinner = st.roster[Math.floor(Math.random() * st.roster.length)];
      toast("🎉 تم اختيار: " + st.wheelWinner, "success");
      renderBody();
    };
    var mkG = document.getElementById("tpMakeGrpsBtn");
    if (mkG) mkG.onclick = function () {
      if (!st.roster.length) { toast("⚠️ أضف كشف الأسماء أولاً", "warn"); return; }
      var sz = Number(document.getElementById("tpGrpSize").value) || 4;
      var shuf = st.roster.slice().sort(function () { return Math.random() - 0.5; });
      st.groups = [];
      for (var i = 0; i < shuf.length; i += sz) st.groups.push(shuf.slice(i, i + sz));
      renderBody();
    };
    body.querySelectorAll("[data-star-add]").forEach(function (b) {
      b.onclick = function () { var k = b.getAttribute("data-star-add"); st.groupStars[k] = (st.groupStars[k] || 0) + 1; try { localStorage.setItem(STARS_KEY, JSON.stringify(st.groupStars)); } catch (_) {} renderBody(); };
    });
    body.querySelectorAll("[data-star-sub]").forEach(function (b) {
      b.onclick = function () { var k = b.getAttribute("data-star-sub"); st.groupStars[k] = Math.max(0, (st.groupStars[k] || 0) - 1); try { localStorage.setItem(STARS_KEY, JSON.stringify(st.groupStars)); } catch (_) {} renderBody(); };
    });

    // Tab 4 bindings
    var tg = document.getElementById("tpTermGo");
    if (tg) tg.onclick = function () {
      var sys = document.getElementById("tpTermSys").value;
      var sj = document.getElementById("tpTermSubj").value.trim();
      var un = document.getElementById("tpTermUnits").value.trim();
      if (!sj || !un) { toast("⚠️ أدخل الصف والمبحث والوحدات", "warn"); return; }
      toast("🗓️ جارٍ توزيع الخطة الفصلية…", "info");
      callAI("أعدّ جدول خطة فصلية رسمية (16 أسبوعاً) وفق نظام (" + sys + ") للمنهاج الفلسطيني لـ (" + sj + ")، موزّعاً هذه الوحدات: (" + un + ") مع عدد الحصص والوسائل والتقويم لكل أسبوع.").then(function (r) {
        if (r.data && r.data.text) { st.termPlanOut = r.data.text; renderBody(); }
      });
    };
    var tpP = document.getElementById("tpTermPdf");
    if (tpP) tpP.onclick = function () { printA4("الخطة الفصلية الرسمية", "توزيع الأسابيع والحصص", '<div style="white-space:pre-wrap;">' + esc(st.termPlanOut) + '</div>'); };

    var rg = document.getElementById("tpRadioGo");
    if (rg) rg.onclick = function () {
      var rt = document.getElementById("tpRadioTopic").value.trim();
      if (!rt) { toast("⚠️ اكتب موضوع الإذاعة", "warn"); return; }
      toast("🎙️ جارٍ تجهيز برنامج الإذاعة المدرسية…", "info");
      callAI("أعدّ برنامج إذاعة مدرسية فلسطينية متكامل وجاهز للطباعة حول (" + rt + ") يشمل: مقدمة جذابة، آية قرآنية، حديث شريف، حكمة، كلمة الصباح، فقرة هل تعلم، وسؤال مسابقة مع إجابته.").then(function (r) {
        if (r.data && r.data.text) { st.radioOut = r.data.text; renderBody(); }
      });
    };
    var rpP = document.getElementById("tpRadioPdf");
    if (rpP) rpP.onclick = function () { printA4("برنامج الإذاعة المدرسية", "جاهز للتوزيع على الطلاب", '<div style="white-space:pre-wrap;">' + esc(st.radioOut) + '</div>'); };

    // Tab 5 bindings
    var bg = document.getElementById("tpBankGo");
    if (bg) bg.onclick = function () {
      var bt = document.getElementById("tpBankText").value.trim();
      if (!bt) { toast("⚠️ الصق النص أو عنوان الدرس أولاً", "warn"); return; }
      toast("📋 جارٍ توليد 15 سؤال اختيار من متعدد…", "info");
      callAI("اصنع 15 سؤال اختيار من متعدد (أ، ب، ج، د) متدرجة الصعوبة من هذا المحتوى، وضع في الأسفل مفتاح الإجابة النموذجية:\n\n" + bt.slice(0, 3500)).then(function (r) {
        if (r.data && r.data.text) { st.bankOut = r.data.text; renderBody(); }
      });
    };
    var bb = document.getElementById("tpBubbleBtn");
    if (bb) bb.onclick = printBubbleSheetPdf;

    // Tab 6 bindings
    var portB = document.getElementById("tpPortPdfBtn");
    if (portB) portB.onclick = function () {
      var notes = (document.getElementById("tpPortNotes").value || "").trim();
      var arch = [];
      try { arch = JSON.parse(localStorage.getItem("edutech_v284_lesson_archive") || "[]"); } catch (_) {}
      var listHtml = arch.length ? ('<ul>' + arch.map(function (a) { return '<li><strong>' + esc(a.title) + '</strong> — ' + esc(a.sub) + ' (' + esc(a.date) + ')</li>'; }).join("") + '</ul>') : '<p>لا توجد خطط مؤرشفة بعد.</p>';
      printA4("ملف الإنجاز المهني للمعلم (Teacher Portfolio)", "سجل التخطيط والأنشطة والمتابعة الصفية",
        '<h3>1. ملخص الشعبة والمتابعة</h3><p>عدد الطلبة المسجّلين في كشف الشعبة: <strong>' + st.roster.length + ' طالباً</strong>.</p>' +
        '<h3>2. سجل الخطط التحضيرية والعلاجية المحفوظة (' + arch.length + ')</h3>' + listHtml +
        (notes ? ('<h3>3. أبرز المبادرات والدورات المهنية</h3><p style="white-space:pre-wrap;">' + esc(notes) + '</p>') : '')
      );
    };
  }

  function openTeacherPro(initialTab) {
    loadSaved();
    if (initialTab) st.tab = initialTab;
    var old = document.getElementById("v288TeacherProModal");
    if (old) old.remove();
    var m = document.createElement("div");
    m.id = "v288TeacherProModal";
    m.style.cssText = "position:fixed;inset:0;z-index:2147483275;background:rgba(2,6,23,0.84);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:10px;direction:rtl;";
    m.innerHTML =
      '<div style="width:min(97vw,940px);max-height:93vh;display:flex;flex-direction:column;border-radius:26px;background:linear-gradient(155deg,#020617,#0f172a,#1e1b4b);color:#fff;border:1.5px solid rgba(52,211,153,0.5);box-shadow:0 26px 70px rgba(0,0,0,0.68);overflow:hidden;">' +
        '<div style="padding:13px 16px;border-bottom:1px solid rgba(255,255,255,0.12);display:flex;justify-content:space-between;align-items:center;gap:8px;">' +
          '<div><div style="font-size:15.5px;font-weight:900;color:#6ee7b7;">👩‍🏫 غرفة عمليات المعلم PRO + الماسح الذكي بالكاميرا (v288)</div><div style="font-size:11px;color:#cbd5e1;">مسح الكشوفات والكتب بالكاميرا + تحليل النتائج PDF + واتساب + العجلة + الخطة الفصلية + الإذاعة + التظليل</div></div>' +
          '<button type="button" id="v288TpClose" style="width:32px;height:32px;border-radius:10px;background:rgba(244,63,94,0.22);color:#fda4af;border:1px solid rgba(244,63,94,0.4);font-weight:900;cursor:pointer;">✕</button>' +
        '</div>' +
        '<div id="v288TeacherBody" style="padding:13px 15px;overflow-y:auto;flex:1;"></div>' +
      '</div>';
    document.body.appendChild(m);
    document.getElementById("v288TpClose").onclick = function () { m.remove(); };
    m.addEventListener("click", function (ev) { if (ev.target === m) m.remove(); });
    renderBody();
  }

  global.EduTeacherPro = { open: openTeacherPro };
})(window);
