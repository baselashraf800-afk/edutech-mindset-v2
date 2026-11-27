/* ============================================================================
 * EduTech Mindset — v288 Smart Notebook & Document Scanner (Student + Teacher)
 * 1) صور متتابعة للدفتر ← PDF بنفس الخط مع فلتر تبييض الورق (أوفلاين 100% مجاني)
 * 2) تحويل صور خط اليد إلى نص ومستند كمبيوتر أنيق PDF (مع KaTeX + استماع + 5 أسئلة)
 * ============================================================================ */
(function (global) {
  "use strict";

  var st = {
    pages: [],       // [{ id, origUrl, b64, enhancedUrl }]
    filter: "scan",  // "orig" | "scan" | "bw"
    docTitle: "",
    extractedText: "",
    quizText: "",
    busy: false
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

  function getToken() {
    var u = (global.Cloud && global.Cloud.user) || null;
    if (!u && global.firebase && typeof global.firebase.auth === "function") {
      try { u = global.firebase.auth().currentUser; } catch (_) {}
    }
    return (u && u.getIdToken) ? u.getIdToken().catch(function () { return ""; }) : Promise.resolve("");
  }

  // ضغط وتصفية الصورة محلياً (لتعمل بسرعة فائقة على شبكات غزة ~140KB)
  function processImageFile(file, filterMode) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function (ev) {
        var img = new Image();
        img.onload = function () {
          var maxDim = 1280;
          var w = img.width, h = img.height;
          if (w > maxDim || h > maxDim) {
            var sc = maxDim / Math.max(w, h);
            w = Math.round(w * sc);
            h = Math.round(h * sc);
          }
          var c = document.createElement("canvas");
          c.width = w; c.height = h;
          var ctx = c.getContext("2d");
          if (filterMode === "scan") {
            ctx.filter = "contrast(1.28) brightness(1.08) saturate(0.9)";
          } else if (filterMode === "bw") {
            ctx.filter = "grayscale(1) contrast(1.55) brightness(1.12)";
          } else {
            ctx.filter = "none";
          }
          ctx.drawImage(img, 0, 0, w, h);
          var dataUrl = c.toDataURL("image/jpeg", 0.82);
          resolve({
            id: "pg_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
            origDataUrl: ev.target.result,
            dataUrl: dataUrl,
            b64: dataUrl.split(",")[1]
          });
        };
        img.onerror = reject;
        img.src = ev.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function reprocessFilter(mode) {
    st.filter = mode;
    if (!st.pages.length) { renderBody(); return; }
    var jobs = st.pages.map(function (pg) {
      return new Promise(function (res) {
        var img = new Image();
        img.onload = function () {
          var maxDim = 1280, w = img.width, h = img.height;
          if (w > maxDim || h > maxDim) { var sc = maxDim / Math.max(w, h); w = Math.round(w * sc); h = Math.round(h * sc); }
          var c = document.createElement("canvas"); c.width = w; c.height = h;
          var ctx = c.getContext("2d");
          ctx.filter = mode === "scan" ? "contrast(1.28) brightness(1.08) saturate(0.9)" : (mode === "bw" ? "grayscale(1) contrast(1.55) brightness(1.12)" : "none");
          ctx.drawImage(img, 0, 0, w, h);
          var du = c.toDataURL("image/jpeg", 0.82);
          pg.dataUrl = du;
          pg.b64 = du.split(",")[1];
          res();
        };
        img.onerror = function () { res(); };
        img.src = pg.origDataUrl || pg.dataUrl;
      });
    });
    Promise.all(jobs).then(function () { renderBody(); });
  }

  // الوضع 1: تصدير PDF بنفس خط الدفتر (أوفلاين 100% مجاني)
  function exportHandwrittenPdf() {
    if (!st.pages.length) { toast("⚠️ التقط أو أضف صفحة واحدة على الأقل أولاً", "warn"); return; }
    var title = st.docTitle.trim() || "دفتر ممسوح — EduTech Mindset";
    var w = window.open("", "_blank");
    if (!w) { toast("⚠️ اسمح بالنوافذ المنبثقة لحفظ الـ PDF", "warn"); return; }
    var pagesHtml = st.pages.map(function (pg, i) {
      return '<div class="pg">' +
        '<div class="pg-hdr"><span>' + esc(title) + '</span><span>صفحة ' + (i + 1) + ' من ' + st.pages.length + '</span></div>' +
        '<img src="' + pg.dataUrl + '" />' +
      '</div>';
    }).join("");
    w.document.open();
    w.document.write(
      '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>' + esc(title) + '</title>' +
      '<style>@page{size:A4;margin:8mm;}body{margin:0;font-family:Tahoma,Arial,sans-serif;background:#fff;color:#0f172a;}' +
      '.pg{page-break-after:always;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;min-height:96vh;}' +
      '.pg:last-child{page-break-after:auto;}' +
      '.pg-hdr{width:100%;display:flex;justify-content:space-between;font-size:11px;color:#475569;border-bottom:1px solid #cbd5e1;padding-bottom:4px;margin-bottom:6px;}' +
      'img{max-width:100%;max-height:268mm;object-fit:contain;border:1px solid #e2e8f0;border-radius:6px;}</style></head><body>' +
      pagesHtml +
      '<script>window.onload=function(){setTimeout(function(){window.print();},400);};<\/script></body></html>'
    );
    w.document.close();
  }

  // الوضع 2: تحويل الصور المتتابعة إلى مستند كمبيوتر أنيق عبر Gemini Vision
  function convertToTypedDoc() {
    if (!st.pages.length) { toast("⚠️ التقط أو أضف صفحات الدفتر أولاً", "warn"); return; }
    st.busy = true;
    st.extractedText = "";
    st.quizText = "";
    renderBody();
    toast("✨ جارٍ قراءة خط اليد وتحويل الصفحات إلى مستند كمبيوتر أنيق…", "info");

    var files = st.pages.slice(0, 8).map(function (pg, idx) {
      return { mime: "image/jpeg", data: pg.b64, name: "page_" + (idx + 1) + ".jpg" };
    });
    var prompt = "أنت خبير رقمنة وتنسيق دفاتر تعليمية في المنهاج الفلسطيني. اقرأ النص المكتوب في هذه الصور المتتابعة (" + files.length + " صفحة) بدقة عالية، وحوّله إلى مستند مطبوع منسّق وأنيق بالعربية الواضحة:\n" +
      "- رتّب العناوين الرئيسية بـ ## والعناوين الفرعية بـ ### والنقاط بوضوح.\n" +
      "- صحّح الأخطاء الإملائية الواضحة مع الحفاظ التام على المعنى والمحتوى العلمي.\n" +
      "- أي معادلات أو كسور رياضية اكتبها بصيغة LaTeX نظيفة داخل $...$ برموز المنهاج الفلسطيني (س، ص، جا، جتا).\n" +
      "- إذا كانت هناك عدة صفحات فافصل بينها بعناوين منظمة.";

    getToken().then(function (tok) {
      return fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "chat", idToken: tok, prompt: prompt, files: files, tool: "v288_notebook_ocr" })
      }).then(function (r) { return r.json().then(function (j) { return { status: r.status, data: j }; }); });
    }).then(function (res) {
      st.busy = false;
      if (res.status === 429 && res.data && res.data.code === "QUOTA_EXCEEDED") {
        toast("⚠️ " + res.data.error, "warn");
        if (global.EduV284Subs) global.EduV284Subs.openPlans();
        renderBody();
        return;
      }
      if (!res.data || !res.data.text) {
        toast("❌ " + ((res.data && res.data.error) || "تعذّر استخراج النص حالياً"), "error");
        renderBody();
        return;
      }
      st.extractedText = res.data.text;
      toast("✅ تم تحويل الدفتر إلى مستند كمبيوتر أنيق بنجاح ✓", "success");
      renderBody();
    }).catch(function () {
      st.busy = false;
      toast("❌ خطأ في الاتصال بالسحابة", "error");
      renderBody();
    });
  }

  function generateQuizFromNotebook() {
    if (!st.extractedText) return;
    toast("🧠 جارٍ توليد 5 أسئلة تفاعلية من صفحات دفترك…", "info");
    getToken().then(function (tok) {
      return fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          idToken: tok,
          prompt: "بناءً على هذا الملخص من دفتر الطالب فقط، اصنع 5 أسئلة مراجعة ذكية ومتدرجة مع نموذج الإجابة الصحيحة في الأسفل:\n\n" + st.extractedText.slice(0, 4000),
          tool: "v288_notebook_quiz"
        })
      }).then(function (r) { return r.json(); });
    }).then(function (d) {
      if (d && d.text) {
        st.quizText = d.text;
        toast("🧠 تم تجهيز أسئلة المراجعة من دفترك ✓", "success");
        renderBody();
      } else toast("❌ تعذّر توليد الأسئلة", "error");
    });
  }

  function exportTypedPdf() {
    if (!st.extractedText) return;
    var title = st.docTitle.trim() || "مستند دفتر منسّق — EduTech Mindset";
    var htmlBody = esc(st.extractedText)
      .replace(/^###\s*(.+)$/gm, '<h4 style="color:#0369a1;margin:12px 0 4px;">$1</h4>')
      .replace(/^##\s*(.+)$/gm, '<h3 style="background:#0f172a;color:#fff;padding:6px 10px;border-radius:8px;margin:14px 0 6px;">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    var w = window.open("", "_blank");
    if (!w) { toast("⚠️ اسمح بالنوافذ المنبثقة لحفظ الـ PDF", "warn"); return; }
    w.document.open();
    w.document.write(
      '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>' + esc(title) + '</title>' +
      '<link rel="stylesheet" href="' + location.origin + '/assets/katex/katex.min.css">' +
      '<script src="' + location.origin + '/assets/katex/katex.min.js"><\/script>' +
      '<script src="' + location.origin + '/assets/katex/auto-render.min.js"><\/script>' +
      '<style>@page{size:A4;margin:14mm;}body{font-family:Tahoma,Arial,sans-serif;color:#0f172a;line-height:1.85;font-size:13px;}.katex,.katex-display{direction:ltr!important;unicode-bidi:isolate!important;}.hdr{border-bottom:3px solid #0f172a;padding-bottom:8px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;}.ftr{margin-top:24px;border-top:1px dashed #94a3b8;padding-top:8px;font-size:11px;color:#475569;display:flex;justify-content:space-between;}</style></head><body>' +
      '<div class="hdr"><div><div style="font-size:18px;font-weight:900;">' + esc(title) + '</div><div style="font-size:11.5px;color:#475569;">تم التحويل والتنسيق عبر ماسح الدفاتر الذكي — EduTech Mindset</div></div><div style="font-size:11px;">' + new Date().toLocaleDateString("ar-EG") + '</div></div>' +
      '<div>' + htmlBody + '</div>' +
      '<div class="ftr"><span>منصة EduTech Mindset — إشراف أ. باسل أشرف الفقعاوي</span><span>https://edutech-mindset.pages.dev</span></div>' +
      '<script>window.onload=function(){try{if(window.renderMathInElement)renderMathInElement(document.body,{delimiters:[{left:"$$",right:"$$",display:true},{left:"$",right:"$",display:false}],throwOnError:false});}catch(e){}setTimeout(function(){window.print();},450);};<\/script></body></html>'
    );
    w.document.close();
  }

  function renderBody() {
    var body = document.getElementById("v288ScannerBody");
    if (!body) return;
    var inp = "width:100%;padding:9px 11px;border-radius:11px;background:#020617;color:#fff;border:1px solid rgba(255,255,255,0.2);font-size:12.5px;";

    var thumbs = !st.pages.length
      ? '<div style="padding:22px;text-align:center;color:#94a3b8;background:rgba(255,255,255,0.04);border:1px dashed rgba(56,189,248,0.35);border-radius:16px;font-size:12.5px;">📸 اضغط «التقاط صفحة بالكاميرا» أو «اختيار صور متعددة» لتصوير صفحات دفترك أو دفتر زميلك بالتتابع (حتى 20 صفحة)</div>'
      : '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(108px,1fr));gap:8px;">' + st.pages.map(function (pg, i) {
          return '<div style="background:#020617;border:1px solid rgba(56,189,248,0.35);border-radius:12px;padding:5px;text-align:center;">' +
            '<img src="' + pg.dataUrl + '" style="width:100%;height:110px;object-fit:cover;border-radius:8px;">' +
            '<div style="font-size:10.5px;font-weight:900;color:#7dd3fc;margin:4px 0;">صفحة ' + (i + 1) + '</div>' +
            '<div style="display:flex;justify-content:center;gap:4px;">' +
              (i > 0 ? '<button type="button" data-pg-up="' + i + '" style="padding:2px 6px;border-radius:6px;background:rgba(255,255,255,0.12);color:#fff;border:none;font-size:10px;cursor:pointer;">⬅️</button>' : '') +
              '<button type="button" data-pg-del="' + i + '" style="padding:2px 6px;border-radius:6px;background:rgba(244,63,94,0.25);color:#fda4af;border:none;font-size:10px;cursor:pointer;">🗑️</button>' +
            '</div>' +
          '</div>';
        }).join("") + '</div>';

    var ocrResult = st.busy
      ? '<div style="margin-top:12px;padding:20px;text-align:center;color:#7dd3fc;background:rgba(56,189,248,0.1);border-radius:14px;font-weight:800;">⏳ جارٍ قراءة خط اليد وتنسيق الصفحات بخط كمبيوتر أنيق…</div>'
      : (st.extractedText
        ? '<div id="v288OcrOutBox" style="margin-top:12px;padding:13px;border-radius:16px;background:#020617;border:1px solid rgba(52,211,153,0.45);">' +
            '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:6px;margin-bottom:8px;">' +
              '<strong style="font-size:13px;color:#6ee7b7;">✨ المستند المنسّق بخط الكمبيوتر (قابل للتعديل):</strong>' +
              '<div style="display:flex;flex-wrap:wrap;gap:6px;">' +
                '<button type="button" id="v288TypedPdfBtn" style="padding:6px 11px;border-radius:9px;background:#f59e0b;color:#020617;border:none;font-size:11px;font-weight:900;cursor:pointer;">📄 حفظ PDF مطبوع</button>' +
                '<button type="button" id="v288SpeakDocBtn" style="padding:6px 11px;border-radius:9px;background:#10b981;color:#020617;border:none;font-size:11px;font-weight:900;cursor:pointer;">🔊 استمع لدفتري</button>' +
                '<button type="button" id="v288QuizDocBtn" style="padding:6px 11px;border-radius:9px;background:#8b5cf6;color:#fff;border:none;font-size:11px;font-weight:900;cursor:pointer;">🧠 اختبرني 5 أسئلة</button>' +
              '</div>' +
            '</div>' +
            '<textarea id="v288OcrEditArea" rows="9" style="' + inp + 'line-height:1.8;">' + esc(st.extractedText) + '</textarea>' +
            (st.quizText ? '<div style="margin-top:10px;padding:10px;border-radius:12px;background:rgba(139,92,246,0.14);border:1px solid rgba(167,139,250,0.35);font-size:12px;line-height:1.8;white-space:pre-wrap;">' + esc(st.quizText) + '</div>' : '') +
          '</div>'
        : '');

    body.innerHTML =
      '<div style="display:grid;gap:10px;">' +
        '<input id="v288DocTitle" value="' + esc(st.docTitle) + '" placeholder="عنوان الدفتر أو المادة (مثلاً: ملخص الفيزياء — الوحدة الأولى)" style="' + inp + '">' +
        '<div style="display:flex;flex-wrap:wrap;gap:7px;align-items:center;">' +
          '<label style="padding:9px 14px;border-radius:12px;background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;font-size:12px;font-weight:900;cursor:pointer;">📷 التقاط صفحة بالكاميرا<input id="v288CamInput" type="file" accept="image/*" capture="environment" style="display:none;"></label>' +
          '<label style="padding:9px 14px;border-radius:12px;background:rgba(56,189,248,0.2);color:#7dd3fc;border:1px solid rgba(56,189,248,0.4);font-size:12px;font-weight:900;cursor:pointer;">🖼️ اختيار صور متعددة<input id="v288GalInput" type="file" accept="image/*" multiple style="display:none;"></label>' +
          '<select id="v288FilterSel" style="padding:8px 10px;border-radius:11px;background:#020617;color:#fde68a;border:1px solid rgba(251,191,36,0.4);font-size:11.5px;font-weight:800;">' +
            '<option value="scan"' + (st.filter === "scan" ? ' selected' : '') + '>✨ فلتر تبييض الماسح (CamScanner)</option>' +
            '<option value="bw"' + (st.filter === "bw" ? ' selected' : '') + '>🖤 أبيض وأسود واضح للطباعة</option>' +
            '<option value="orig"' + (st.filter === "orig" ? ' selected' : '') + '>🎨 الألوان الأصلية</option>' +
          '</select>' +
          (st.pages.length ? '<button type="button" id="v288ClearPgs" style="padding:8px 11px;border-radius:10px;background:rgba(244,63,94,0.2);color:#fda4af;border:1px solid rgba(244,63,94,0.35);font-size:11px;font-weight:900;cursor:pointer;">مسح الكل</button>' : '') +
        '</div>' +
        thumbs +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;margin-top:4px;">' +
          '<button type="button" id="v288HwPdfBtn" style="padding:11px 14px;border-radius:14px;background:linear-gradient(135deg,#10b981,#047857);color:#fff;border:none;font-size:12.5px;font-weight:900;cursor:pointer;">📄 تصدير PDF بنفس خط الدفتر (مجاني أوفلاين)</button>' +
          '<button type="button" id="v288AiOcrBtn" style="padding:11px 14px;border-radius:14px;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#020617;border:none;font-size:12.5px;font-weight:900;cursor:pointer;">✨ تحويل الصور لخط كمبيوتر أنيق PDF (بالذكاء)</button>' +
        '</div>' +
        ocrResult +
      '</div>';

    var ti = document.getElementById("v288DocTitle");
    if (ti) ti.oninput = function () { st.docTitle = ti.value; };

    function handleFiles(fileList) {
      var arr = Array.prototype.slice.call(fileList || []).slice(0, 20 - st.pages.length);
      if (!arr.length) return;
      toast("⏳ جارٍ تحسين وتجهيز " + arr.length + " صفحة…", "info");
      Promise.all(arr.map(function (f) { return processImageFile(f, st.filter); })).then(function (res) {
        st.pages = st.pages.concat(res);
        toast("✅ تمت إضافة " + res.length + " صفحة (الإجمالي: " + st.pages.length + ")", "success");
        renderBody();
      });
    }
    var cam = document.getElementById("v288CamInput");
    if (cam) cam.onchange = function () { handleFiles(cam.files); };
    var gal = document.getElementById("v288GalInput");
    if (gal) gal.onchange = function () { handleFiles(gal.files); };

    var flt = document.getElementById("v288FilterSel");
    if (flt) flt.onchange = function () { reprocessFilter(flt.value); };

    var clr = document.getElementById("v288ClearPgs");
    if (clr) clr.onclick = function () { st.pages = []; st.extractedText = ""; st.quizText = ""; renderBody(); };

    body.querySelectorAll("[data-pg-up]").forEach(function (b) {
      b.onclick = function () {
        var i = Number(b.getAttribute("data-pg-up"));
        if (i > 0) { var tmp = st.pages[i - 1]; st.pages[i - 1] = st.pages[i]; st.pages[i] = tmp; renderBody(); }
      };
    });
    body.querySelectorAll("[data-pg-del]").forEach(function (b) {
      b.onclick = function () { st.pages.splice(Number(b.getAttribute("data-pg-del")), 1); renderBody(); };
    });

    document.getElementById("v288HwPdfBtn").onclick = exportHandwrittenPdf;
    document.getElementById("v288AiOcrBtn").onclick = convertToTypedDoc;

    var ed = document.getElementById("v288OcrEditArea");
    if (ed) ed.oninput = function () { st.extractedText = ed.value; };
    var tpBtn = document.getElementById("v288TypedPdfBtn");
    if (tpBtn) tpBtn.onclick = exportTypedPdf;
    var spBtn = document.getElementById("v288SpeakDocBtn");
    if (spBtn) spBtn.onclick = function () {
      if (global.EduTTS && global.EduTTS.speak) { global.EduTTS.speak(st.extractedText.slice(0, 1800)); toast("🔊 جارٍ قراءة ملخص دفترك بصوت المعلم…", "info"); }
    };
    var qzBtn = document.getElementById("v288QuizDocBtn");
    if (qzBtn) qzBtn.onclick = generateQuizFromNotebook;
  }

  function openScanner() {
    var old = document.getElementById("v288SmartScannerModal");
    if (old) old.remove();
    var m = document.createElement("div");
    m.id = "v288SmartScannerModal";
    m.style.cssText = "position:fixed;inset:0;z-index:2147483280;background:rgba(2,6,23,0.84);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:10px;direction:rtl;";
    m.innerHTML =
      '<div style="width:min(97vw,860px);max-height:93vh;display:flex;flex-direction:column;border-radius:26px;background:linear-gradient(155deg,#020617,#0f172a,#1e1b4b);color:#fff;border:1.5px solid rgba(56,189,248,0.5);box-shadow:0 26px 70px rgba(0,0,0,0.68);overflow:hidden;">' +
        '<div style="padding:13px 16px;border-bottom:1px solid rgba(255,255,255,0.12);display:flex;justify-content:space-between;align-items:center;gap:8px;">' +
          '<div><div style="font-size:15.5px;font-weight:900;color:#7dd3fc;">📸 ماسح الدفاتر والوثائق الذكي (للطالب والمعلم)</div><div style="font-size:11px;color:#cbd5e1;">صوّر صفحات دفترك بالتتابع ← PDF بنفس الخط (أوفلاين مجاني) أو حوّلها لخط كمبيوتر أنيق PDF</div></div>' +
          '<button type="button" id="v288ScClose" style="width:32px;height:32px;border-radius:10px;background:rgba(244,63,94,0.22);color:#fda4af;border:1px solid rgba(244,63,94,0.4);font-weight:900;cursor:pointer;">✕</button>' +
        '</div>' +
        '<div id="v288ScannerBody" style="padding:14px 16px;overflow-y:auto;flex:1;"></div>' +
      '</div>';
    document.body.appendChild(m);
    document.getElementById("v288ScClose").onclick = function () { m.remove(); };
    m.addEventListener("click", function (ev) { if (ev.target === m) m.remove(); });
    renderBody();
  }

  global.EduSmartScanner = { open: openScanner };
})(window);
