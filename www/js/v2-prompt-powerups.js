/* ============================================================================
 * EduTech Mindset — حزمة القوة التفاعلية v2.0.0 لمولّد البرومبتات
 * تضيف 5 ميزات نوعية تعمل أوفلاين 100% دون أي تكلفة خوادم إضافية:
 * 1) 🧬 البصمة التربوية الشخصية (My Teaching DNA) المحفوظة تلقائيًا
 * 2) 🩺 طبيب البرومبتات (تقييم من 100 عبر 5 معايير + إعادة صياغة فورية)
 * 3) 🔗 سلسلة البرومبتات الذكية (انتقال بنقرة واحدة للخطوة التالية بنفس السياق)
 * 4) 🎴 بطاقة برومبت PNG أنيقة لواتساب وتيليجرام بشعار EduTech Mindset
 * 5) 🎙️ الإدخال الصوتي بالعربية مباشرة داخل حقل عنوان الدرس (Web Speech API)
 * ============================================================================ */
(function (global) {
  "use strict";

  var DNA_KEY = "edutech_teaching_dna_v2";
  var SAVED_TIME_KEY = "edutech_time_saved_v2";

  function $(id) { return document.getElementById(id); }
  function toast(m, t) { if (typeof global.showToast === "function") global.showToast(m, t || "success"); }

  function readDNA() {
    try {
      return Object.assign({ name: "", school: "", role: "معلم / تربوي", env: "", style: "" }, JSON.parse(localStorage.getItem(DNA_KEY) || "{}"));
    } catch (e) { return { name: "", school: "", role: "معلم / تربوي", env: "", style: "" }; }
  }

  function saveDNA(d) {
    try { localStorage.setItem(DNA_KEY, JSON.stringify(d)); } catch (e) {}
  }

  function bumpTimeSaved(mins) {
    try {
      var cur = Number(localStorage.getItem(SAVED_TIME_KEY) || "0") + (mins || 15);
      localStorage.setItem(SAVED_TIME_KEY, String(cur));
      var el = $("eduV2SavedBadge");
      if (el) {
        var hrs = (cur / 60).toFixed(1);
        el.textContent = "⏱️ وفّرت حتى الآن ~" + (cur >= 60 ? hrs + " ساعة" : cur + " دقيقة");
      }
    } catch (e) {}
  }

  /* 1) نافذة البصمة التربوية الشخصية */
  function openDnaModal() {
    var old = $("eduV2DnaModal");
    if (old) old.remove();
    var d = readDNA();
    var m = document.createElement("div");
    m.id = "eduV2DnaModal";
    m.style.cssText = "position:fixed;inset:0;z-index:2147483320;background:rgba(2,6,23,0.84);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:14px;direction:rtl;";
    m.innerHTML =
      '<div style="width:min(96vw,480px);background:#0f172a;color:#fff;border:1px solid rgba(56,189,248,0.45);border-radius:22px;padding:20px;box-shadow:0 24px 60px rgba(0,0,0,0.6);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
          '<div style="font-weight:900;font-size:15px;color:#38bdf8;">🧬 البصمة التربوية الشخصية (v2.0)</div>' +
          '<button type="button" id="dnaClose" style="background:rgba(244,63,94,0.2);color:#fda4af;border:none;border-radius:8px;width:30px;height:30px;font-weight:900;cursor:pointer;">✕</button>' +
        '</div>' +
        '<p style="font-size:11.5px;color:#cbd5e1;margin-bottom:12px;">احفظ بياناتك مرة واحدة لتُدمج تلقائيًا في كل برومبت تولّده دون إعادة كتابتها.</p>' +
        '<div style="display:flex;flex-direction:column;gap:10px;">' +
          '<input id="dnaName" placeholder="الاسم (مثال: أ. باسل أشرف الفقعاوي)" value="' + d.name.replace(/"/g, "&quot;") + '" style="width:100%;padding:10px 12px;border-radius:12px;background:#1e293b;border:1px solid #334155;color:#fff;font-size:12.5px;">' +
          '<input id="dnaSchool" placeholder="المدرسة / الجامعة / المبادرة (اختياري)" value="' + d.school.replace(/"/g, "&quot;") + '" style="width:100%;padding:10px 12px;border-radius:12px;background:#1e293b;border:1px solid #334155;color:#fff;font-size:12.5px;">' +
          '<input id="dnaEnv" placeholder="طبيعة صفك أو بيئتك (مثال: 40 طالبًا، إمكانيات بسيطة، تعليم عن بُعد)" value="' + d.env.replace(/"/g, "&quot;") + '" style="width:100%;padding:10px 12px;border-radius:12px;background:#1e293b;border:1px solid #334155;color:#fff;font-size:12.5px;">' +
          '<input id="dnaStyle" placeholder="أسلوبك المفضل (مثال: عملي مختصر مع أمثلة فلسطينية)" value="' + d.style.replace(/"/g, "&quot;") + '" style="width:100%;padding:10px 12px;border-radius:12px;background:#1e293b;border:1px solid #334155;color:#fff;font-size:12.5px;">' +
          '<button type="button" id="dnaSave" style="margin-top:4px;padding:11px;border-radius:12px;background:linear-gradient(135deg,#0284c7,#10b981);color:#fff;font-weight:900;font-size:13px;border:none;cursor:pointer;">💾 حفظ البصمة وتفعيلها تلقائيًا</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(m);
    $("dnaClose").onclick = function () { m.remove(); };
    m.onclick = function (ev) { if (ev.target === m) m.remove(); };
    $("dnaSave").onclick = function () {
      var nd = {
        name: $("dnaName").value.trim(),
        school: $("dnaSchool").value.trim(),
        env: $("dnaEnv").value.trim(),
        style: $("dnaStyle").value.trim()
      };
      saveDNA(nd);
      if (nd.env && $("genContextNote") && !$("genContextNote").value.trim()) {
        $("genContextNote").value = nd.env;
      }
      toast("تم حفظ بصمتك التربوية وستُدمج تلقائيًا في البرومبتات 🧬", "success");
      m.remove();
    };
  }

  /* 2) طبيب البرومبتات (تقييم من 100 + إعادة صياغة احترافية فورية أوفلاين) */
  function openPromptDoctor() {
    var old = $("eduV2DocModal");
    if (old) old.remove();
    var m = document.createElement("div");
    m.id = "eduV2DocModal";
    m.style.cssText = "position:fixed;inset:0;z-index:2147483320;background:rgba(2,6,23,0.86);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:14px;direction:rtl;";
    m.innerHTML =
      '<div style="width:min(96vw,580px);max-height:92vh;overflow-y:auto;background:#0f172a;color:#fff;border:1px solid rgba(16,185,129,0.45);border-radius:22px;padding:20px;box-shadow:0 24px 60px rgba(0,0,0,0.6);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">' +
          '<div style="font-weight:900;font-size:15px;color:#34d399;">🩺 طبيب البرومبتات الذكي (Prompt Doctor)</div>' +
          '<button type="button" id="docClose" style="background:rgba(244,63,94,0.2);color:#fda4af;border:none;border-radius:8px;width:30px;height:30px;font-weight:900;cursor:pointer;">✕</button>' +
        '</div>' +
        '<p style="font-size:11.5px;color:#cbd5e1;margin-bottom:10px;">الصق أي برومبت كتبته بنفسك ليُقيّمه النظام من 100 ويُعيد صياغته بنسخة احترافية فورًا:</p>' +
        '<textarea id="docInput" rows="4" placeholder="مثال: اعمل لي امتحان علوم لصف خامس عن الكهرباء..." style="width:100%;padding:10px 12px;border-radius:12px;background:#1e293b;border:1px solid #334155;color:#fff;font-size:12.5px;margin-bottom:10px;"></textarea>' +
        '<button type="button" id="docAnalyze" style="width:100%;padding:11px;border-radius:12px;background:linear-gradient(135deg,#10b981,#0284c7);color:#fff;font-weight:900;font-size:13px;border:none;cursor:pointer;">🩺 افحص البرومبت وطوّره الآن</button>' +
        '<div id="docResult" style="margin-top:14px;display:none;"></div>' +
      '</div>';
    document.body.appendChild(m);
    $("docClose").onclick = function () { m.remove(); };
    m.onclick = function (ev) { if (ev.target === m) m.remove(); };

    $("docAnalyze").onclick = function () {
      var raw = $("docInput").value.trim();
      if (!raw) { toast("اكتب أو الصق برومبتًا أولاً للفحص", "warn"); return; }
      var checks = [
        { name: "تحديد الدور (Persona)", ok: /(أنت|بصفتك|كخبير|خبير|معلم|مستشار|act as)/i.test(raw), pts: 20 },
        { name: "تحديد الفئة أو المرحلة", ok: /(صف|مرحلة|طالب|توجيهي|جامع|روضة|أطفال|مبتدئ|متقدم)/i.test(raw), pts: 20 },
        { name: "وضوح المنتج المطلوب", ok: /(خطة|اختبار|امتحان|ورقة عمل|لعبة|تلخيص|سيرة|قصة|سيناريو|جدول)/i.test(raw), pts: 20 },
        { name: "وجود قيود أو زمن أو أسلوب", ok: /(دقيقة|بلوم|5E|بدون إنترنت|تشكيل|مختصر|مفصل|فلسطين|محلي|روبريك)/i.test(raw), pts: 20 },
        { name: "طول وتفصيل كافٍ (+12 كلمة)", ok: raw.split(/\s+/).length >= 12, pts: 20 }
      ];
      var score = checks.reduce(function (acc, c) { return acc + (c.ok ? c.pts : 0); }, 0);
      var dna = readDNA();
      var upgraded =
        'أنت خبير تربوي ومصمم تعليمي محترف في مبادرة "EduTech Mindset".\n' +
        'مهمتك: تنفيذ الطلب التالي بأعلى جودة ودقة عملية مباشرة للتطبيق:\n' +
        '«' + raw + '»\n\n' +
        '📌 معايير التنفيذ المُلزمة:\n' +
        (dna.name ? '- مُعدّ الطلب: ' + dna.name + (dna.school ? ' (' + dna.school + ')' : '') + '\n' : '') +
        (dna.env ? '- بيئة التطبيق: ' + dna.env + '\n' : '') +
        '- ابدأ مباشرة بالمحتوى العملي المنظّم في عناوين وجداول واضحة دون مقدمات طويلة.\n' +
        '- راعِ الفروق الفردية واستخدم أمثلة عربية وواقعية قريبة من حياة المستفيدين.\n' +
        '- التزم بالدقة العلمية الكاملة ولا تخترع مراجع، واختم بـ 3 نصائح سريعة للتطبيق.';

      var resBox = $("docResult");
      resBox.style.display = "block";
      var color = score >= 80 ? "#34d399" : (score >= 50 ? "#fbbf24" : "#fb7185");
      resBox.innerHTML =
        '<div style="padding:12px;border-radius:14px;background:#1e293b;border:1px solid #334155;margin-bottom:10px;">' +
          '<div style="font-size:20px;font-weight:900;color:' + color + ';">التقييم: ' + score + ' / 100</div>' +
          '<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;">' +
            checks.map(function (c) {
              return '<span style="font-size:11px;padding:4px 8px;border-radius:8px;background:' + (c.ok ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)') + ';color:' + (c.ok ? '#a7f3d0' : '#fecdd3') + ';">' + (c.ok ? '✅ ' : '❌ ') + c.name + '</span>';
            }).join("") +
          '</div>' +
        '</div>' +
        '<div style="font-size:12px;font-weight:800;color:#38bdf8;margin-bottom:6px;">✨ النسخة الاحترافية المُطوّرة جاهزة للنسخ:</div>' +
        '<pre id="docUpgraded" style="white-space:pre-wrap;background:#020617;border:1px solid #334155;border-radius:12px;padding:12px;font-size:12px;color:#e2e8f0;max-height:220px;overflow-y:auto;"></pre>' +
        '<div style="display:flex;gap:8px;margin-top:10px;">' +
          '<button type="button" id="docCopyBtn" style="flex:1;padding:10px;border-radius:10px;background:#e11d48;color:#fff;font-weight:900;font-size:12px;border:none;cursor:pointer;">📋 نسخ النسخة المطوّرة</button>' +
          '<button type="button" id="docUseBtn" style="flex:1;padding:10px;border-radius:10px;background:#0284c7;color:#fff;font-weight:900;font-size:12px;border:none;cursor:pointer;">⚡ نقلها لمربع المولّد</button>' +
        '</div>';
      $("docUpgraded").textContent = upgraded;
      $("docCopyBtn").onclick = function () {
        if (navigator.clipboard) navigator.clipboard.writeText(upgraded).then(function () { toast("تم نسخ البرومبت المطوّر 📋", "success"); });
      };
      $("docUseBtn").onclick = function () {
        var out = $("promptOutputText");
        var wrap = $("promptOutputWrapper");
        if (out) out.textContent = upgraded;
        if (wrap) wrap.classList.remove("hidden");
        toast("تم نقل البرومبت المطوّر إلى المولّد ⚡", "success");
        m.remove();
      };
    };
  }

  /* 3) توليد بطاقة برومبت PNG أنيقة للمشاركة في واتساب وتيليجرام (أوفلاين 100%) */
  function downloadPromptCardPng() {
    var out = $("promptOutputText");
    var txt = (out && out.textContent.trim()) || "";
    if (!txt) { toast("ولّد برومبتًا أولاً ثم احفظ بطاقته", "warn"); return; }
    var topic = ($("genTopic") && $("genTopic").value.trim()) || "برومبت تعليمي ذكي";
    var c = document.createElement("canvas");
    c.width = 1080;
    c.height = 1080;
    var ctx = c.getContext("2d");

    // Dark gradient background matching EduTech Mindset brand
    var g = ctx.createLinearGradient(0, 0, 1080, 1080);
    g.addColorStop(0, "#020617");
    g.addColorStop(0.55, "#0f172a");
    g.addColorStop(1, "#1e1b4b");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1080, 1080);

    // Top accent bar
    var bar = ctx.createLinearGradient(0, 0, 1080, 0);
    bar.addColorStop(0, "#e11d48");
    bar.addColorStop(1, "#0ea5e9");
    ctx.fillStyle = bar;
    ctx.fillRect(0, 0, 1080, 16);

    ctx.direction = "rtl";
    ctx.textAlign = "right";

    // Header
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 28px Cairo, sans-serif";
    ctx.fillText("⚡ بطاقة برومبت جاهزة — EduTech Mindset", 1010, 92);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 44px Cairo, sans-serif";
    ctx.fillText(topic.slice(0, 42), 1010, 162);

    // Inner text box
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(60, 205, 960, 730, 26);
    ctx.fill();
    ctx.stroke();

    // Wrap prompt text cleanly
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "600 24px Cairo, sans-serif";
    var rawLines = txt.split("\n");
    var y = 262;
    for (var i = 0; i < rawLines.length && y < 895; i++) {
      var words = rawLines[i].split(/\s+/);
      var line = "";
      for (var w = 0; w < words.length; w++) {
        var test = line ? line + " " + words[w] : words[w];
        if (ctx.measureText(test).width > 890) {
          ctx.fillText(line, 980, y);
          y += 38;
          line = words[w];
          if (y >= 895) break;
        } else {
          line = test;
        }
      }
      if (line && y < 895) {
        ctx.fillText(line, 980, y);
        y += 40;
      }
    }

    // Footer
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 26px Cairo, sans-serif";
    ctx.fillText("🌐 edutech-mindset.pages.dev", 1010, 1010);
    ctx.textAlign = "left";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 22px Cairo, sans-serif";
    ctx.fillText("v2.0 • مجاني للمعلمين والطلبة", 70, 1010);

    var a = document.createElement("a");
    a.download = "EduTech-Prompt-Card.png";
    a.href = c.toDataURL("image/png");
    a.click();
    toast("تم حفظ بطاقة البرومبت PNG جاهزة للمشاركة على واتساب 🎴", "success");
  }

  /* 4) الإدخال الصوتي بالعربية */
  function startVoiceInput(btn) {
    var SR = global.SpeechRecognition || global.webkitSpeechRecognition;
    if (!SR) { toast("متصفحك لا يدعم الإدخال الصوتي — جرّب Chrome على الهاتف أو الكمبيوتر", "warn"); return; }
    var rec = new SR();
    rec.lang = "ar-PS";
    rec.interimResults = false;
    btn.textContent = "🔴 استمع الآن...";
    rec.onresult = function (ev) {
      var transcript = ev.results && ev.results[0] && ev.results[0][0] ? ev.results[0][0].transcript : "";
      if (transcript && $("genTopic")) {
        $("genTopic").value = transcript;
        toast("تم التقاط صوتك: " + transcript + " 🎙️", "success");
        if (global.EduPromptStudioV1 && global.EduPromptStudioV1.build) global.EduPromptStudioV1.build(false);
      }
    };
    rec.onerror = function () { toast("تعذّر التقاط الصوت، تأكد من إذن الميكروفون", "warn"); };
    rec.onend = function () { btn.textContent = "🎙️ تحدّث"; };
    rec.start();
  }

  /* 5) تركيب الأدوات داخل #generator بعد تهيئة v1-prompt-studio */
  
  /* 6) صورة صفحة الكتاب / PDF إلى برومبت دقيق (v3.0.0) */
  function openBookImageToPrompt() {
    var old = $("eduV3BookModal");
    if (old) old.remove();
    var m = document.createElement("div");
    m.id = "eduV3BookModal";
    m.style.cssText = "position:fixed;inset:0;z-index:2147483340;background:rgba(2,6,23,0.86);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:14px;direction:rtl;";
    m.innerHTML =
      '<div style="width:min(96vw,540px);max-height:92vh;overflow-y:auto;background:#0f172a;color:#fff;border:1.5px solid rgba(56,189,248,0.45);border-radius:22px;padding:20px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">' +
          '<div style="font-weight:900;font-size:15px;color:#38bdf8;">📷 صورة صفحة الكتاب إلى برومبت احترافي (v3.0)</div>' +
          '<button type="button" id="v3BkClose" style="background:rgba(244,63,94,0.2);color:#fda4af;border:none;border-radius:8px;width:30px;height:30px;font-weight:900;cursor:pointer;">✕</button>' +
        '</div>' +
        '<p style="font-size:11.5px;color:#cbd5e1;margin-bottom:12px;">ارفع صورة صفحة من المنهاج أو المحاضرة ليقرأها الذكاء الاصطناعي ويحوّلها إلى برومبت دقيق وأسئلة من صلب الصفحة:</p>' +
        '<input id="v3BkFile" type="file" accept="image/*" style="width:100%;padding:10px;border-radius:12px;background:#1e293b;border:1px dashed #38bdf8;color:#cbd5e1;font-size:12px;margin-bottom:10px;">' +
        '<select id="v3BkGoal" style="width:100%;padding:10px;border-radius:12px;background:#1e293b;border:1px solid #334155;color:#fff;font-size:12.5px;margin-bottom:10px;">' +
          '<option value="استخراج برومبت احترافي لتوليد خطة درس وأسئلة متدرجة من هذه الصفحة">خطة درس + أسئلة من هذه الصفحة</option>' +
          '<option value="تلخيص الصفحة في خريطة مفاهيم وجدول نقاط رئيسية للطالب">تلخيص وخريطة مفاهيم للطالب</option>' +
          '<option value="استخراج 5 مفاهيم خاطئة شائعة وأسئلة تشخيصية حول محتوى الصفحة">صائد الأخطاء الشائعة من الصفحة</option>' +
        '</select>' +
        '<button type="button" id="v3BkGo" style="width:100%;padding:11px;border-radius:12px;background:linear-gradient(135deg,#0284c7,#10b981);color:#fff;font-weight:900;border:none;cursor:pointer;">✨ اقرأ الصفحة وحوّلها لبرومبت</button>' +
        '<div id="v3BkOut" style="display:none;margin-top:12px;"></div>' +
      '</div>';
    document.body.appendChild(m);
    $("v3BkClose").onclick = function () { m.remove(); };
    m.onclick = function (ev) { if (ev.target === m) m.remove(); };

    $("v3BkGo").onclick = function () {
      var fileInp = $("v3BkFile");
      var f = fileInp && fileInp.files && fileInp.files[0];
      if (!f) { toast("اختر صورة صفحة من الكتاب أولاً", "warn"); return; }
      var btn = $("v3BkGo");
      btn.disabled = true;
      btn.textContent = "⏳ جارٍ قراءة الصفحة بالذكاء الاصطناعي...";
      var reader = new FileReader();
      reader.onload = function () {
        var b64 = String(reader.result || "").split(",")[1] || "";
        var tokPromise = (global.firebase && firebase.auth && firebase.auth().currentUser)
          ? firebase.auth().currentUser.getIdToken().catch(function () { return ""; })
          : Promise.resolve("");
        tokPromise.then(function (tok) {
          return fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "chat",
              idToken: tok,
              tool: "v288_scanner",
              order: ["gemini", "openai", "claude", "openrouter"],
              files: [{ mime: f.type || "image/jpeg", data: b64, name: f.name || "page.jpg" }],
              prompt: "اقرأ محتوى صفحة الكتاب المرفقة بدقة، ثم نفّذ المطلوب التالي باللغة العربية:\n" + $("v3BkGoal").value
            })
          }).then(function (r) { return r.json(); });
        }).then(function (res) {
          btn.disabled = false;
          btn.textContent = "✨ اقرأ الصفحة وحوّلها لبرومبت";
          var txt = (res && res.text) || "";
          if (!txt) { toast((res && res.error) || "تعذرت قراءة الصفحة حالياً", "error"); return; }
          var out = $("v3BkOut");
          out.style.display = "block";
          out.innerHTML = '<pre id="v3BkPre" style="white-space:pre-wrap;background:#020617;border:1px solid #334155;border-radius:12px;padding:12px;font-size:12px;color:#e2e8f0;max-height:220px;overflow-y:auto;"></pre>' +
            '<button type="button" id="v3BkUse" style="width:100%;margin-top:8px;padding:10px;border-radius:10px;background:#e11d48;color:#fff;font-weight:900;border:none;cursor:pointer;">⚡ نقل النتيجة لمربع المولّد</button>';
          $("v3BkPre").textContent = txt;
          $("v3BkUse").onclick = function () {
            if ($("promptOutputText")) $("promptOutputText").textContent = txt;
            if ($("promptOutputWrapper")) $("promptOutputWrapper").classList.remove("hidden");
            toast("تم نقل المحتوى لمربع المولّد ⚡", "success");
            m.remove();
          };
        }).catch(function () {
          btn.disabled = false;
          btn.textContent = "✨ اقرأ الصفحة وحوّلها لبرومبت";
          toast("تعذّر الاتصال بالخادم", "error");
        });
      };
      reader.readAsDataURL(f);
    };
  }

  function mountV2() {
    var sec = $("generator");
    if (!sec || sec.getAttribute("data-v2-mounted") === "1") return;
    var modeBtn = $("eduV1ModeToggle");
    if (!modeBtn) return;
    sec.setAttribute("data-v2-mounted", "1");

    // Top bar: DNA + Prompt Doctor + Time Saved Counter
    var topControls = document.createElement("div");
    topControls.className = "flex flex-wrap items-center gap-2 mt-2";
    var curSaved = Number(localStorage.getItem(SAVED_TIME_KEY) || "0");
    topControls.innerHTML =
      '<button type="button" id="eduV2DnaBtn" class="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 transition">🧬 بصمتي التربوية</button>' +
      '<button type="button" id="eduV3BookBtn" class="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-300 border border-fuchsia-500/40 transition">📷 صورة كتاب إلى برومبت</button><button type="button" id="eduV2DocBtn" class="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition">🩺 طبيب البرومبتات (تقييم من 100)</button>' +
      '<span id="eduV2SavedBadge" class="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">⏱️ وفّرت حتى الآن ~' + (curSaved >= 60 ? (curSaved / 60).toFixed(1) + " ساعة" : curSaved + " دقيقة") + '</span>';
    modeBtn.parentNode.parentNode.appendChild(topControls);
    $("eduV2DnaBtn").onclick = openDnaModal;
    $("eduV2DocBtn").onclick = openPromptDoctor;
    if ($("eduV3BookBtn")) $("eduV3BookBtn").onclick = openBookImageToPrompt;

    // Voice button next to genTopic
    var topicInp = $("genTopic");
    if (topicInp && topicInp.parentNode && !$("eduV2VoiceBtn")) {
      var vb = document.createElement("button");
      vb.type = "button";
      vb.id = "eduV2VoiceBtn";
      vb.className = "px-3 py-2 rounded-xl bg-rose-600/85 hover:bg-rose-500 text-white text-xs font-extrabold shrink-0 transition";
      vb.textContent = "🎙️ تحدّث";
      vb.onclick = function () { startVoiceInput(vb); };
      topicInp.parentNode.insertBefore(vb, topicInp.nextSibling);
    }

    // PNG Share Card button + Prompt Chaining bar under output
    var copyBtn = $("btnCopyPrompt");
    if (copyBtn && copyBtn.parentNode && !$("eduV2PngCardBtn")) {
      var pngBtn = document.createElement("button");
      pngBtn.type = "button";
      pngBtn.id = "eduV2PngCardBtn";
      pngBtn.className = "px-3 py-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-extrabold transition";
      pngBtn.textContent = "🎴 بطاقة PNG لواتساب";
      pngBtn.onclick = downloadPromptCardPng;
      copyBtn.parentNode.appendChild(pngBtn);
    }

    var outWrap = $("promptOutputWrapper");
    if (outWrap && !$("eduV2ChainBar")) {
      var chain = document.createElement("div");
      chain.id = "eduV2ChainBar";
      chain.className = "mt-3 pt-3 border-t border-slate-700/50 flex flex-wrap items-center gap-2";
      chain.innerHTML =
        '<span class="text-xs font-extrabold text-amber-300">🔗 الخطوة التالية لنفس الدرس (سلسلة البرومبتات):</span>' +
        '<button type="button" data-chain="worksheet" class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold border border-slate-700">➡️ ورقة عمل متمايزة</button>' +
        '<button type="button" data-chain="quiz" class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold border border-slate-700">➡️ اختبار قصير (بلوم)</button>' +
        '<button type="button" data-chain="whatsapp" class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700">➡️ نسخة خفيفة لواتساب</button>';
      outWrap.appendChild(chain);

      chain.querySelectorAll("[data-chain]").forEach(function (b) {
        b.onclick = function () {
          var kind = b.getAttribute("data-chain");
          var curTopic = ($("genTopic") && $("genTopic").value.trim()) || "الدرس الحالي";
          if (global.EduPromptStudioV1) {
            if (kind === "worksheet") global.EduPromptStudioV1.applyTrack("school", { goalIdx: 8 });
            else if (kind === "quiz") global.EduPromptStudioV1.applyTrack("school", { goalIdx: 1 });
            else if (kind === "whatsapp") global.EduPromptStudioV1.applyTrack("remote", { gradeIdx: 1, goalIdx: 1 });
            if ($("genTopic")) $("genTopic").value = curTopic;
            global.EduPromptStudioV1.build(true);
            bumpTimeSaved(15);
          }
        };
      });
    }

    // Hook time-saved counter + DNA injection into generate button
    var genBtn = $("btnGeneratePrompt");
    if (genBtn) {
      genBtn.addEventListener("click", function () {
        bumpTimeSaved(15);
        var dna = readDNA();
        var out = $("promptOutputText");
        if (out && (dna.name || dna.school || dna.style)) {
          var dnaLine = "\n🧬 البصمة التربوية: " + [dna.name, dna.school, dna.style].filter(Boolean).join(" • ");
          if (out.textContent.indexOf("البصمة التربوية:") === -1) out.textContent += dnaLine;
        }
      });
    }
  }

  global.EduPromptV2 = { version: "3.0.0", openDNA: openDnaModal, openDoctor: openPromptDoctor, downloadCard: downloadPromptCardPng };

  var tries = 0;
  var iv = setInterval(function () {
    mountV2();
    if (($("generator") && $("generator").getAttribute("data-v2-mounted") === "1") || ++tries > 30) clearInterval(iv);
  }, 300);
})(window);
