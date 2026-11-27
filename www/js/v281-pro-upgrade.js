/* ============================================================================
 * EduTech Mindset v281 — حزمة التطوير الشامل للمعلم والأونروا والتوجيهي
 *  1) دفتر المتابعة اليومية للطلبة (حضور/غياب + مشاركة + واجبات + تصدير PDF رسمي وCSV)
 *  2) قوالب تحضير الأونروا وبطاقات التعلم الذاتي SLM الجاهزة أوفلاين (تصدير PDF عرضي/طولي بلا إنترنت)
 *  3) اختبار التوجيهي الفلسطيني الموقّت (تصحيح فوري + شرح مفصّل لكل إجابة أوفلاين)
 * ============================================================================ */
(function (global) {
  "use strict";

  var TRACKER_KEY = "edu_v281_daily_tracker";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function toast(msg, type) {
    if (typeof global.showToast === "function") { try { global.showToast(msg, type || "info"); return; } catch (e) {} }
    alert(msg);
  }

  /* ==========================================================================
   * 1) دفتر المتابعة اليومية للطلبة (حضور • مشاركة • واجبات • PDF رسمي وCSV)
   * ========================================================================== */
  function loadTracker() {
    try {
      var d = JSON.parse(localStorage.getItem(TRACKER_KEY) || "null");
      if (d && Array.isArray(d.students)) return d;
    } catch (e) {}
    return {
      school: "مدرسة ذكور/بنات الأونروا — قطاع غزة",
      className: "الصف السادس (أ)",
      subject: "العلوم العامة",
      teacher: "",
      students: [
        { id: "s1", name: "أحمد محمد خليل", att: "حاضر", hw: "مكتمل", stars: 4, note: "" },
        { id: "s2", name: "سارة يوسف العطار", att: "حاضر", hw: "مكتمل", stars: 5, note: "مشاركة متميزة" },
        { id: "s3", name: "عمر محمود الفرا", att: "متأخر", hw: "ناقص", stars: 3, note: "" }
      ]
    };
  }
  function saveTracker(d) { try { localStorage.setItem(TRACKER_KEY, JSON.stringify(d)); } catch (e) {} }

  function printTrackerPdf(d) {
    var w = window.open("", "_blank");
    if (!w) return toast("يرجى السماح بالنوافذ المنبثقة لحفظ PDF", "error");
    var today = new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
    var present = d.students.filter(function (s) { return s.att === "حاضر"; }).length;
    var absent = d.students.filter(function (s) { return s.att === "غائب"; }).length;
    var late = d.students.filter(function (s) { return s.att === "متأخر"; }).length;
    var hwDone = d.students.filter(function (s) { return s.hw === "مكتمل"; }).length;

    w.document.write(
      '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>دفتر المتابعة اليومية للطلبة</title>' +
      '<style>@page{size:A4 portrait;margin:12mm;}body{font-family:Cairo,Tajawal,Tahoma,sans-serif;color:#0f172a;margin:0;line-height:1.5;}' +
      '.hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #0369a1;padding-bottom:8px;margin-bottom:12px;}' +
      '.hdr h1{margin:0;font-size:18px;color:#0c4a6e;}.meta{width:100%;border-collapse:collapse;margin-bottom:12px;font-size:12.5px;}' +
      '.meta td{border:1px solid #cbd5e1;padding:6px 8px;}.meta td.l{background:#f1f5f9;font-weight:800;width:16%;}' +
      '.tbl{width:100%;border-collapse:collapse;font-size:12px;}.tbl th{background:#0c4a6e;color:#fff;padding:7px;border:1px solid #0c4a6e;}' +
      '.tbl td{border:1px solid #cbd5e1;padding:6px 8px;text-align:center;}.tbl td.nm{text-align:right;font-weight:700;}' +
      '.sum{margin-top:12px;padding:8px 12px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;font-size:12px;font-weight:700;display:flex;justify-content:space-between;}' +
      '.sigs{display:flex;justify-content:space-between;margin-top:28px;font-size:12.5px;font-weight:700;}.ft{margin-top:18px;text-align:center;font-size:10.5px;color:#64748b;border-top:1px solid #e2e8f0;padding-top:6px;}</style></head><body>' +
      '<div class="hdr"><div><h1>سجل المتابعة اليومية للطلبة (الحضور والمشاركة والواجبات)</h1><div style="font-size:11.5px;color:#475569;">منصة EduTech Mindset — قطاع غزة، فلسطين</div></div><div style="font-size:11.5px;font-weight:800;color:#0369a1;">التاريخ: ' + esc(today) + '</div></div>' +
      '<table class="meta"><tr><td class="l">المدرسة</td><td>' + esc(d.school) + '</td><td class="l">الصف والشعبة</td><td>' + esc(d.className) + '</td></tr>' +
      '<tr><td class="l">المبحث</td><td>' + esc(d.subject) + '</td><td class="l">المعلم/ة</td><td>' + esc(d.teacher || "…………………") + '</td></tr></table>' +
      '<table class="tbl"><thead><tr><th style="width:6%;">#</th><th style="width:32%;">اسم الطالب / الطالبة</th><th style="width:14%;">الحضور</th><th style="width:14%;">الواجب</th><th style="width:14%;">المشاركة (5)</th><th>ملاحظات</th></tr></thead><tbody>' +
      d.students.map(function (s, i) {
        return '<tr><td>' + (i + 1) + '</td><td class="nm">' + esc(s.name) + '</td><td>' + esc(s.att) + '</td><td>' + esc(s.hw) + '</td><td>' + "★".repeat(s.stars) + ' (' + s.stars + ')</td><td>' + esc(s.note) + '</td></tr>';
      }).join("") +
      '</tbody></table>' +
      '<div class="sum"><span>إجمالي الطلبة: ' + d.students.length + '</span><span>حاضر: ' + present + '</span><span>متأخر: ' + late + '</span><span>غائب: ' + absent + '</span><span>الواجب مكتمل: ' + hwDone + '</span></div>' +
      '<div class="sigs"><span>توقيع المعلم/ة: …………………</span><span>توقيع مدير المدرسة: …………………</span></div>' +
      '<div class="ft">صُدر عبر منصة EduTech Mindset — edutech-mindset.pages.dev — إشراف أ. باسل أشرف الفقعاوي</div>' +
      '<script>window.onload=function(){setTimeout(function(){window.print();},320);};<\/script></body></html>'
    );
    w.document.close();
  }

  function exportTrackerCsv(d) {
    var rows = [["#", "الاسم", "الحضور", "الواجب", "المشاركة", "ملاحظات"]];
    d.students.forEach(function (s, i) { rows.push([i + 1, s.name, s.att, s.hw, s.stars, s.note]); });
    var csv = "\uFEFF" + rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(","); }).join("\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = "EduTech-Daily-Tracker.csv";
    a.click();
    toast("✅ تم تصدير الكشف بصيغة CSV ✓", "success");
  }

  function openDailyTracker() {
    var old = document.getElementById("eduV281TrackerModal");
    if (old) old.remove();
    var wrap = document.createElement("div");
    wrap.id = "eduV281TrackerModal";
    wrap.className = "edu-v281-modal";
    wrap.setAttribute("dir", "rtl");
    wrap.style.cssText = "position:fixed;inset:0;z-index:100035;background:rgba(2,6,23,0.88);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:10px;";

    function render() {
      var d = loadTracker();
      wrap.innerHTML =
        '<div style="width:min(96vw,920px);max-height:92vh;background:#0f172a;color:#f8fafc;border:1.5px solid rgba(56,189,248,0.38);border-radius:24px;display:flex;flex-direction:column;overflow:hidden;">' +
          '<div style="padding:13px 16px;background:linear-gradient(135deg,#0369a1,#0f172a);display:flex;align-items:center;justify-content:space-between;gap:8px;flex-shrink:0;">' +
            '<div><strong style="font-size:15px;font-weight:900;">📋 دفتر المتابعة اليومية للطلبة (حضور • مشاركة • واجبات)</strong><div style="font-size:11px;color:#bae6fd;">يعمل 100% بلا إنترنت • تصدير كشف PDF رسمي وCSV بضغطة زر</div></div>' +
            '<button type="button" id="trClose" style="padding:7px 14px;border-radius:11px;background:rgba(255,255,255,0.18);color:#fff;border:none;font-weight:900;cursor:pointer;">✕ إغلاق</button>' +
          '</div>' +
          '<div class="edu-v281-scroll" style="flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:12px;">' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;">' +
              '<input id="trSchool" value="' + esc(d.school) + '" placeholder="المدرسة" style="padding:8px 10px;border-radius:10px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12px;">' +
              '<input id="trClass" value="' + esc(d.className) + '" placeholder="الصف والشعبة" style="padding:8px 10px;border-radius:10px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12px;">' +
              '<input id="trSubject" value="' + esc(d.subject) + '" placeholder="المبحث" style="padding:8px 10px;border-radius:10px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12px;">' +
              '<input id="trTeacher" value="' + esc(d.teacher) + '" placeholder="اسم المعلم/ة" style="padding:8px 10px;border-radius:10px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12px;">' +
            '</div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
              '<input id="trNewName" placeholder="أضف اسم طالب/ة جديد..." style="flex:1;min-width:180px;padding:9px 11px;border-radius:11px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12.5px;">' +
              '<button type="button" id="trAddBtn" style="padding:9px 14px;border-radius:11px;background:#10b981;color:#fff;border:none;font-size:12px;font-weight:900;cursor:pointer;">➕ إضافة طالب</button>' +
              '<button type="button" id="trPdfBtn" style="padding:9px 14px;border-radius:11px;background:#0284c7;color:#fff;border:none;font-size:12px;font-weight:900;cursor:pointer;">🖨️ حفظ PDF رسمي</button>' +
              '<button type="button" id="trCsvBtn" style="padding:9px 12px;border-radius:11px;background:#6366f1;color:#fff;border:none;font-size:12px;font-weight:900;cursor:pointer;">📊 CSV</button>' +
            '</div>' +
            '<div style="display:flex;flex-direction:column;gap:7px;">' +
              d.students.map(function (s, idx) {
                var attCol = s.att === "حاضر" ? "#10b981" : (s.att === "متأخر" ? "#f59e0b" : "#ef4444");
                return '<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;border-radius:13px;background:rgba(255,255,255,0.05);border:1px solid rgba(148,163,184,0.2);">' +
                  '<div style="font-size:13px;font-weight:900;min-width:140px;">' + (idx + 1) + '. ' + esc(s.name) + '</div>' +
                  '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">' +
                    '<button type="button" data-tr-att="' + s.id + '" style="padding:5px 10px;border-radius:9px;background:' + attCol + ';color:#fff;border:none;font-size:11.5px;font-weight:900;cursor:pointer;">' + esc(s.att) + '</button>' +
                    '<button type="button" data-tr-hw="' + s.id + '" style="padding:5px 10px;border-radius:9px;background:' + (s.hw === "مكتمل" ? "#0284c7" : "#475569") + ';color:#fff;border:none;font-size:11.5px;font-weight:900;cursor:pointer;">الواجب: ' + esc(s.hw) + '</button>' +
                    '<button type="button" data-tr-star="' + s.id + '" style="padding:5px 10px;border-radius:9px;background:#1e293b;color:#fde047;border:1px solid #475569;font-size:11.5px;font-weight:900;cursor:pointer;">⭐ ' + s.stars + '/5</button>' +
                    '<button type="button" data-tr-del="' + s.id + '" style="padding:5px 8px;border-radius:9px;background:rgba(244,63,94,0.2);color:#fda4af;border:none;font-size:11px;cursor:pointer;">🗑️</button>' +
                  '</div>' +
                '</div>';
              }).join("") +
            '</div>' +
          '</div>' +
        '</div>';

      wrap.querySelector("#trClose").onclick = function () { wrap.remove(); };
      ["trSchool", "trClass", "trSubject", "trTeacher"].forEach(function (id) {
        var el = wrap.querySelector("#" + id);
        el.onchange = function () {
          d.school = wrap.querySelector("#trSchool").value;
          d.className = wrap.querySelector("#trClass").value;
          d.subject = wrap.querySelector("#trSubject").value;
          d.teacher = wrap.querySelector("#trTeacher").value;
          saveTracker(d);
        };
      });
      wrap.querySelector("#trAddBtn").onclick = function () {
        var nm = (wrap.querySelector("#trNewName").value || "").trim();
        if (!nm) return;
        d.students.push({ id: "s_" + Date.now(), name: nm, att: "حاضر", hw: "مكتمل", stars: 4, note: "" });
        saveTracker(d); render();
      };
      wrap.querySelector("#trPdfBtn").onclick = function () { printTrackerPdf(d); };
      wrap.querySelector("#trCsvBtn").onclick = function () { exportTrackerCsv(d); };
      wrap.querySelectorAll("[data-tr-att]").forEach(function (b) {
        b.onclick = function () {
          var s = d.students.find(function (x) { return x.id === b.getAttribute("data-tr-att"); });
          if (!s) return;
          s.att = s.att === "حاضر" ? "متأخر" : (s.att === "متأخر" ? "غائب" : "حاضر");
          saveTracker(d); render();
        };
      });
      wrap.querySelectorAll("[data-tr-hw]").forEach(function (b) {
        b.onclick = function () {
          var s = d.students.find(function (x) { return x.id === b.getAttribute("data-tr-hw"); });
          if (!s) return;
          s.hw = s.hw === "مكتمل" ? "ناقص" : "مكتمل";
          saveTracker(d); render();
        };
      });
      wrap.querySelectorAll("[data-tr-star]").forEach(function (b) {
        b.onclick = function () {
          var s = d.students.find(function (x) { return x.id === b.getAttribute("data-tr-star"); });
          if (!s) return;
          s.stars = (s.stars % 5) + 1;
          saveTracker(d); render();
        };
      });
      wrap.querySelectorAll("[data-tr-del]").forEach(function (b) {
        b.onclick = function () {
          d.students = d.students.filter(function (x) { return x.id !== b.getAttribute("data-tr-del"); });
          saveTracker(d); render();
        };
      });
    }
    document.body.appendChild(wrap);
    wrap.onclick = function (e) { if (e.target === wrap) wrap.remove(); };
    render();
  }

  /* ==========================================================================
   * 2) قوالب تحضير الأونروا وبطاقات التعلم الذاتي SLM الجاهزة أوفلاين (PDF فوري)
   * ========================================================================== */
  var OFFLINE_TEMPLATES = {
    unrwa_regular: {
      name: "خطة درس أونروا — صف اعتيادي (عرضي)",
      orient: "landscape",
      title: "تحضير درس يومي — نظام معلمي الأونروا (غزة)",
      objectives: "1) أن يذكر الطالب المفاهيم الأساسية للدرس بدقة.\n2) أن يطبّق المهارة عملياً في نشاط جماعي.\n3) أن يستنتج القيمة الحياتية المرتبطة بالدرس.",
      tools: "الكتاب المدرسي، السبورة، بطاقات تعليمية، وسائل عرض مبسطة، نشاط تهيئة ودعم نفسي (PSS).",
      steps: "• التهيئة وكسر الجليد (5 د): نشاط تنفس وترحيب وربط بالخبرة السابقة.\n• العرض والتعلم النشط (20 د): شرح متدرج + عمل تعاوني في مجموعات.\n• التقويم المرحلي (10 د): أسئلة شفهية وتطبيق على السبورة.\n• الخاتمة والواجب (10 د): تلخيص جماعي وتكليف بيتي قصير.",
      inclusion: "تكييف الأنشطة للطلبة المتعثرين وذوي الاحتياجات الخاصة + سؤال إثرائي للمتفوقين مع دمج قيم حقوق الإنسان والتعاون (HRCRT).",
      evalHw: "بطاقة خروج سريعة (سؤالان) + واجب بيتي قصير من الكتاب المدرسي."
    },
    unrwa_tent: {
      name: "خطة درس طارئ — خيمة / صف مؤقت",
      orient: "landscape",
      title: "تحضير درس مرن — بيئة تعليمية مؤقتة (غزة)",
      objectives: "1) أن يتقن الطالب المهارة الأساسية المستهدفة بأبسط الأدوات.\n2) أن يشارك بإيجابية وأمان نفسي داخل المجموعة.",
      tools: "بطاقات ورقية، سبورة محمولة، أوراق عمل مختصرة، نشاط دعم نفسي واجتماعي (PSS) لمدة 5 دقائق.",
      steps: "• تهيئة ودعم نفسي (7 د): لعبة حركية هادئة لتعزيز الأمان والتركيز.\n• المفهوم الأساسي (15 د): تبسيط الفكرة بأمثلة من البيئة المحلية.\n• تطبيق عملي ثنائي (13 د): حل تدريبين أساسيين بالتبادل.\n• غلق مشجّع (5 د): تغذية راجعة إيجابية وتعزيز.",
      inclusion: "مراعاة الفروق الفردية والظروف النفسية للطلبة وتوفير بدائل شفهية للكتابة عند الحاجة.",
      evalHw: "ملاحظة الأداء الصفي + نشاط منزلي خفيف لا يحتاج إنترنت."
    },
    slm_card: {
      name: "بطاقة تعلم ذاتي (SLM) جاهزة للطباعة A4",
      orient: "portrait",
      title: "بطاقة التعلم الذاتي (SLM) — برنامج التربية والتعليم (الأونروا)",
      objectives: "أهداف البطاقة:\n1) فهم الفكرة الرئيسية للدرس ذاتياً.\n2) حل الأنشطة التدريبية المرفقة بنجاح.",
      tools: "ملخص المحتوى العلمي:\nاكتب هنا القاعدة أو المفهوم الرئيسي للدرس في 3–5 أسطر واضحة ومبسطة للطالب.",
      steps: "النشاط (1) — فكّر وأجب:\n1) أكمل الفراغ: ....................................................\n2) علّل ما يأتي: ...................................................\n\nالنشاط (2) — طبّق بنفسك:\nحل المسألة / التدريب الآتي: .......................................",
      inclusion: "إرشاد لولي الأمر: شجّع طفلك على قراءة الملخص بصوت مسموع ثم حل النشاط (1) بمفرده.",
      evalHw: "التقويم الختامي (قيّم نفسك): ضع علامة (✓) أمام ما أتقنته: [ ] فهمت الدرس  [ ] حللت النشاط  [ ] أحتاج مساعدة المعلم."
    }
  };

  function openOfflineTemplates() {
    var old = document.getElementById("eduV281TplModal");
    if (old) old.remove();
    var curKey = "unrwa_regular";
    var wrap = document.createElement("div");
    wrap.id = "eduV281TplModal";
    wrap.className = "edu-v281-modal";
    wrap.setAttribute("dir", "rtl");
    wrap.style.cssText = "position:fixed;inset:0;z-index:100035;background:rgba(2,6,23,0.88);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:10px;";

    function render() {
      var t = OFFLINE_TEMPLATES[curKey];
      wrap.innerHTML =
        '<div style="width:min(96vw,880px);max-height:92vh;background:#0f172a;color:#f8fafc;border:1.5px solid rgba(16,185,129,0.4);border-radius:24px;display:flex;flex-direction:column;overflow:hidden;">' +
          '<div style="padding:13px 16px;background:linear-gradient(135deg,#065f46,#0f172a);display:flex;align-items:center;justify-content:space-between;gap:8px;">' +
            '<div><strong style="font-size:15px;font-weight:900;">🇺🇳 قوالب تحضير الأونروا وبطاقات SLM (تعمل 100% أوفلاين)</strong><div style="font-size:11px;color:#a7f3d0;">عدّل القالب واحفظه PDF رسمياً فوراً حتى بدون إنترنت</div></div>' +
            '<button type="button" id="tplClose" style="padding:7px 14px;border-radius:11px;background:rgba(255,255,255,0.18);color:#fff;border:none;font-weight:900;cursor:pointer;">✕ إغلاق</button>' +
          '</div>' +
          '<div class="edu-v281-scroll" style="flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;">' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
              Object.keys(OFFLINE_TEMPLATES).map(function (k) {
                var on = k === curKey;
                return '<button type="button" data-tplk="' + k + '" style="padding:8px 12px;border-radius:11px;border:none;font-size:11.5px;font-weight:900;cursor:pointer;background:' + (on ? '#10b981' : '#1e293b') + ';color:#fff;">' + OFFLINE_TEMPLATES[k].name + '</button>';
              }).join("") +
            '</div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;">' +
              '<input id="tplLesson" value="الجهاز التنفسي" placeholder="عنوان الدرس" style="padding:8px;border-radius:10px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12px;">' +
              '<input id="tplGrade" value="الصف السادس — العلوم" placeholder="الصف والمبحث" style="padding:8px;border-radius:10px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12px;">' +
              '<input id="tplSchool" value="مدرسة الأونروا — خان يونس" placeholder="المدرسة والمنطقة" style="padding:8px;border-radius:10px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12px;">' +
              '<select id="tplOrient" style="padding:8px;border-radius:10px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12px;"><option value="landscape"' + (t.orient === "landscape" ? " selected" : "") + '>ورقة عرضية (Landscape)</option><option value="portrait"' + (t.orient === "portrait" ? " selected" : "") + '>ورقة طولية (Portrait)</option></select>' +
            '</div>' +
            '<label style="font-size:11px;color:#7dd3fc;font-weight:800;">الأهداف السلوكية<textarea id="tplObj" rows="3" style="width:100%;margin-top:3px;padding:8px;border-radius:10px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12px;">' + esc(t.objectives) + '</textarea></label>' +
            '<label style="font-size:11px;color:#7dd3fc;font-weight:800;">الوسائل / ملخص المحتوى<textarea id="tplTools" rows="2" style="width:100%;margin-top:3px;padding:8px;border-radius:10px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12px;">' + esc(t.tools) + '</textarea></label>' +
            '<label style="font-size:11px;color:#7dd3fc;font-weight:800;">إجراءات التعلم النشط / أنشطة البطاقة<textarea id="tplSteps" rows="4" style="width:100%;margin-top:3px;padding:8px;border-radius:10px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12px;">' + esc(t.steps) + '</textarea></label>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
              '<label style="font-size:11px;color:#7dd3fc;font-weight:800;">التعليم الجامع وHRCRT<textarea id="tplInc" rows="2" style="width:100%;margin-top:3px;padding:8px;border-radius:10px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12px;">' + esc(t.inclusion) + '</textarea></label>' +
              '<label style="font-size:11px;color:#7dd3fc;font-weight:800;">التقويم والواجب<textarea id="tplEval" rows="2" style="width:100%;margin-top:3px;padding:8px;border-radius:10px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12px;">' + esc(t.evalHw) + '</textarea></label>' +
            '</div>' +
            '<button type="button" id="tplPrintBtn" style="padding:11px;border-radius:13px;background:linear-gradient(135deg,#0284c7,#10b981);color:#fff;border:none;font-size:13.5px;font-weight:900;cursor:pointer;">🖨️ حفظ / طباعة PDF رسمي بملء الصفحة A4</button>' +
          '</div>' +
        '</div>';

      wrap.querySelector("#tplClose").onclick = function () { wrap.remove(); };
      wrap.querySelectorAll("[data-tplk]").forEach(function (b) { b.onclick = function () { curKey = b.getAttribute("data-tplk"); render(); }; });
      wrap.querySelector("#tplPrintBtn").onclick = function () {
        var orient = wrap.querySelector("#tplOrient").value;
        var w = window.open("", "_blank");
        if (!w) return toast("يرجى السماح بالنوافذ المنبثقة لحفظ PDF", "error");
        var nl = function (s) { return esc(s).replace(/\n/g, "<br>"); };
        w.document.write(
          '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>' + esc(t.title) + '</title>' +
          '<style>@page{size:A4 ' + orient + ';margin:8mm;}body{font-family:Cairo,Tajawal,Tahoma,sans-serif;color:#0f172a;margin:0;height:' + (orient === "landscape" ? "194mm" : "281mm") + ';display:flex;flex-direction:column;}' +
          '.hdr{border:2px solid #0369a1;border-radius:10px;padding:8px 12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;}' +
          '.grid{flex:1;width:100%;border-collapse:collapse;font-size:12px;}.grid th{background:#0c4a6e;color:#fff;padding:7px;border:1px solid #0c4a6e;}.grid td{border:1px solid #94a3b8;padding:8px;vertical-align:top;line-height:1.65;}' +
          '.sigs{display:flex;justify-content:space-between;margin-top:10px;font-size:12px;font-weight:700;}</style></head><body>' +
          '<div class="hdr"><div><strong style="font-size:15px;color:#0c4a6e;">' + esc(t.title) + '</strong><div style="font-size:11.5px;">' + esc(wrap.querySelector("#tplSchool").value) + ' • ' + esc(wrap.querySelector("#tplGrade").value) + ' • الدرس: <strong>' + esc(wrap.querySelector("#tplLesson").value) + '</strong></div></div><div style="font-size:11px;color:#0369a1;font-weight:800;">EduTech Mindset</div></div>' +
          '<table class="grid"><thead><tr><th style="width:20%;">الأهداف السلوكية</th><th style="width:16%;">الوسائل والتهيئة</th><th style="width:32%;">إجراءات التعلم النشط</th><th style="width:16%;">التعليم الجامع وHRCRT</th><th style="width:16%;">التقويم والواجب</th></tr></thead><tbody><tr>' +
          '<td>' + nl(wrap.querySelector("#tplObj").value) + '</td><td>' + nl(wrap.querySelector("#tplTools").value) + '</td><td>' + nl(wrap.querySelector("#tplSteps").value) + '</td><td>' + nl(wrap.querySelector("#tplInc").value) + '</td><td>' + nl(wrap.querySelector("#tplEval").value) + '</td>' +
          '</tr></tbody></table>' +
          '<div class="sigs"><span>توقيع المعلم/ة: ……………</span><span>توقيع مدير المدرسة: ……………</span><span>توقيع المشرف التربوي: ……………</span></div>' +
          '<script>window.onload=function(){setTimeout(function(){window.print();},320);};<\/script></body></html>'
        );
        w.document.close();
      };
    }
    document.body.appendChild(wrap);
    wrap.onclick = function (e) { if (e.target === wrap) wrap.remove(); };
    render();
  }

  /* ==========================================================================
   * 3) اختبار التوجيهي الفلسطيني الموقّت (تصحيح فوري + شرح مفصّل لكل إجابة أوفلاين)
   * ========================================================================== */
  var TAWJIHI_BANK = {
    "الفيزياء": [
      { q: "وحدة قياس الزخم الخطي في النظام الدولي (SI) هي:", opts: ["kg·m/s", "kg·m/s²", "N·m", "J/s"], ans: 0, exp: "الزخم الخطي P = m·v، لذا وحدته هي كيلوغرام × متر/ثانية (kg·m/s) وتكافئ N·s." },
      { q: "عند تضاعف سرعة جسم ما مع ثبات كتلته، فإن طاقته الحركية:", opts: ["تتضاعف مرتين", "تزداد 4 أضعاف", "تبقى ثابتة", "تقل للنصف"], ans: 1, exp: "لأن الطاقة الحركية K = ½mv² تتناسب طردياً مع مربع السرعة، فعندما تتضاعف v تزداد K بمقدار 2² = 4 أضعاف." },
      { q: "المساحة المحصورة تحت منحنى (القوة – الزمن) تمثّل فيزيائياً:", opts: ["الشغل", "الدفع", "القدرة", "التسارع"], ans: 1, exp: "الدفع I = ∫F·dt يساوي المساحة تحت منحنى القوة والزمن، ويساوي التغير في الزخم الخطي ΔP." }
    ],
    "الرياضيات": [
      { q: "إذا كان ق(س) = س³ - 3س، فإن ق'(2) تساوي:", opts: ["9", "6", "12", "3"], ans: 0, exp: "المشتقة الأولى ق'(س) = 3س² - 3، وبالتعويض س = 2 نحصل على 3(4) - 3 = 9." },
      { q: "قيمة التكامل غير المحدود ∫ 2س دس تساوي:", opts: ["س² + ج", "2س² + ج", "س + ج", "2 + ج"], ans: 0, exp: "بتطبيق قاعدة تكامل القوة: ∫2س دس = 2 × (س²/2) + ج = س² + ج." },
      { q: "محدّدة المصفوفة الثنائية [[3, 2], [1, 4]] تساوي:", opts: ["10", "14", "12", "8"], ans: 0, exp: "المحددة = (3 × 4) - (2 × 1) = 12 - 2 = 10." }
    ],
    "اللغة العربية": [
      { q: "إعراب كلمة «طالبٌ» في جملة «حضرَ طالبٌ مجتهدٌ» هو:", opts: ["فاعل مرفوع بالضمة", "مفعول به منصوب", "مبتدأ مرفوع", "خبر مرفوع"], ans: 0, exp: "«حضر» فعل ماضٍ، ومن قام بالفعل هو «طالبٌ» فيُعرب فاعلاً مرفوعاً وعلامة رفعه الضمة الظاهرة." },
      { q: "نوع المشتق في كلمة «مكتوب» هو:", opts: ["اسم مفعول", "اسم فاعل", "صيغة مبالغة", "صفة مشبهة"], ans: 0, exp: "«مكتوب» على وزن «مفعول» من الفعل الثلاثي المبني للمجهول «كُتِب»، فهو اسم مفعول." },
      { q: "البحر الشعري الذي تفعيلته الأساسية «مُتَفاعِلُن» هو بحر:", opts: ["الكامل", "الوافر", "الطويل", "البسيط"], ans: 0, exp: "تفعيلة بحر الكامل هي (مُتَفاعِلُن) تتكرر ست مرات في البيت التام." }
    ],
    "التكنولوجيا": [
      { q: "المفتاح الذي يميّز كل سجل بشكل فريد في جدول قاعدة البيانات هو:", opts: ["المفتاح الأساسي (Primary Key)", "المفتاح الأجنبي", "الاستعلام", "التقرير"], ans: 0, exp: "المفتاح الأساسي (Primary Key) لا يتكرر ولا يترك فارغاً (NULL) لتمييز كل سجل في الجدول." },
      { q: "في طبقة الشبكة (Network Layer) من نموذج OSI يُستخدم عنوان:", opts: ["IP", "MAC", "Port", "HTML"], ans: 0, exp: "تعمل طبقة الشبكة (الطبقة الثالثة) على العنونة المنطقية وتوجيه الحزم باستخدام عنوان IP." }
    ]
  };

  function openTawjihiExam() {
    var old = document.getElementById("eduV281TawjihiModal");
    if (old) old.remove();
    var subjs = Object.keys(TAWJIHI_BANK);
    var curSubj = subjs[0];
    var answers = {};
    var submitted = false;
    var secLeft = 180;
    var timer = null;

    var wrap = document.createElement("div");
    wrap.id = "eduV281TawjihiModal";
    wrap.className = "edu-v281-modal";
    wrap.setAttribute("dir", "rtl");
    wrap.style.cssText = "position:fixed;inset:0;z-index:100035;background:rgba(2,6,23,0.88);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:10px;";

    function startTimer() {
      if (timer) clearInterval(timer);
      secLeft = 180;
      timer = setInterval(function () {
        secLeft--;
        var el = document.getElementById("twjTimer");
        if (el) el.textContent = "⏱ " + Math.floor(secLeft / 60) + ":" + String(secLeft % 60).padStart(2, "0");
        if (secLeft <= 0) { clearInterval(timer); submitted = true; render(); }
      }, 1000);
    }

    function render() {
      var qs = TAWJIHI_BANK[curSubj];
      var score = 0;
      if (submitted) qs.forEach(function (q, i) { if (answers[i] === q.ans) score++; });

      wrap.innerHTML =
        '<div style="width:min(96vw,780px);max-height:92vh;background:#0f172a;color:#f8fafc;border:1.5px solid rgba(251,191,36,0.4);border-radius:24px;display:flex;flex-direction:column;overflow:hidden;">' +
          '<div style="padding:13px 16px;background:linear-gradient(135deg,#b45309,#1e1b4b);display:flex;align-items:center;justify-content:space-between;gap:8px;">' +
            '<div><strong style="font-size:15px;font-weight:900;">🏆 اختبار التوجيهي التجريبي الموقّت (مع شرح الإجابات)</strong><div style="font-size:11px;color:#fde68a;">المنهاج الفلسطيني • يعمل أوفلاين بالتصحيح الفوري</div></div>' +
            '<div style="display:flex;align-items:center;gap:8px;">' +
              '<span id="twjTimer" style="padding:5px 10px;border-radius:10px;background:rgba(0,0,0,0.3);font-size:12px;font-weight:900;color:#fde047;">⏱ ' + Math.floor(secLeft / 60) + ':' + String(secLeft % 60).padStart(2, "0") + '</span>' +
              '<button type="button" id="twjClose" style="padding:6px 12px;border-radius:10px;background:rgba(255,255,255,0.2);color:#fff;border:none;font-weight:900;cursor:pointer;">✕</button>' +
            '</div>' +
          '</div>' +
          '<div class="edu-v281-scroll" style="flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:12px;">' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
              subjs.map(function (s) {
                var on = s === curSubj;
                return '<button type="button" data-twjs="' + esc(s) + '" style="padding:7px 12px;border-radius:11px;border:none;font-size:12px;font-weight:900;cursor:pointer;background:' + (on ? '#f59e0b' : '#1e293b') + ';color:' + (on ? '#020617' : '#fff') + ';">' + esc(s) + '</button>';
              }).join("") +
            '</div>' +
            (submitted ? '<div style="padding:12px;border-radius:14px;background:rgba(16,185,129,0.16);border:1px solid #10b981;font-size:14px;font-weight:900;text-align:center;">🎯 نتيجتك في ' + esc(curSubj) + ': ' + score + ' من ' + qs.length + ' (' + Math.round((score / qs.length) * 100) + '%)</div>' : '') +
            qs.map(function (q, qi) {
              return '<div style="padding:13px;border-radius:15px;background:rgba(255,255,255,0.05);border:1px solid rgba(148,163,184,0.2);">' +
                '<div style="font-size:13px;font-weight:900;margin-bottom:8px;">' + (qi + 1) + ') ' + esc(q.q) + '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">' +
                  q.opts.map(function (o, oi) {
                    var sel = answers[qi] === oi;
                    var bg = sel ? "#0284c7" : "#1e293b";
                    if (submitted) {
                      if (oi === q.ans) bg = "#059669";
                      else if (sel && oi !== q.ans) bg = "#dc2626";
                    }
                    return '<button type="button" data-twjq="' + qi + '" data-twjo="' + oi + '" style="padding:9px;border-radius:10px;background:' + bg + ';color:#fff;border:1px solid rgba(255,255,255,0.12);font-size:12px;font-weight:800;cursor:pointer;text-align:right;">' + esc(o) + '</button>';
                  }).join("") +
                '</div>' +
                (submitted ? '<div style="margin-top:8px;padding:8px 10px;border-radius:10px;background:rgba(56,189,248,0.12);color:#bae6fd;font-size:11.5px;line-height:1.6;"><strong>💡 الشرح:</strong> ' + esc(q.exp) + '</div>' : '') +
              '</div>';
            }).join("") +
            '<div style="display:flex;gap:8px;">' +
              (!submitted
                ? '<button type="button" id="twjSubmit" style="flex:1;padding:11px;border-radius:13px;background:#10b981;color:#fff;border:none;font-size:13.5px;font-weight:900;cursor:pointer;">✅ تسليم الاختبار وعرض الشرح</button>'
                : '<button type="button" id="twjRetry" style="flex:1;padding:11px;border-radius:13px;background:#0284c7;color:#fff;border:none;font-size:13.5px;font-weight:900;cursor:pointer;">🔄 إعادة المحاولة</button>') +
            '</div>' +
          '</div>' +
        '</div>';

      wrap.querySelector("#twjClose").onclick = function () { if (timer) clearInterval(timer); wrap.remove(); };
      wrap.querySelectorAll("[data-twjs]").forEach(function (b) {
        b.onclick = function () { curSubj = b.getAttribute("data-twjs"); answers = {}; submitted = false; startTimer(); render(); };
      });
      if (!submitted) {
        wrap.querySelectorAll("[data-twjq]").forEach(function (b) {
          b.onclick = function () {
            answers[Number(b.getAttribute("data-twjq"))] = Number(b.getAttribute("data-twjo"));
            render();
          };
        });
        var sub = wrap.querySelector("#twjSubmit");
        if (sub) sub.onclick = function () { if (timer) clearInterval(timer); submitted = true; render(); };
      } else {
        var ret = wrap.querySelector("#twjRetry");
        if (ret) ret.onclick = function () { answers = {}; submitted = false; startTimer(); render(); };
      }
    }

    document.body.appendChild(wrap);
    wrap.onclick = function (e) { if (e.target === wrap) { if (timer) clearInterval(timer); wrap.remove(); } };
    startTimer();
    render();
  }

  global.EduV281 = {
    version: "v281",
    openDailyTracker: openDailyTracker,
    openOfflineTemplates: openOfflineTemplates,
    openUnrwaTemplates: openOfflineTemplates,
    openTawjihiExam: openTawjihiExam
  };
})(window);
