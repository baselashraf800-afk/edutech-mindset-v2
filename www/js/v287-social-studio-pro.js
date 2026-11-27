/* ============================================================================
 * EduTech Mindset — v287 Social Media Studio PRO (Google Flow & Gemini Suite)
 * استوديو السوشيال ميديا الاحترافي الشامل (30 ميزة في 6 تبويبات سريعة):
 * 1) مشاهد الـ 10 ثوانٍ لـ Google Flow (الرياضيات + جميع المواد الـ 13) + نطق عربي + ألواح PNG + MP3 + SRT + Teleprompter + Telegram
 * 2) غلاف كتاب إبداعي بالذكاء الاصطناعي (/api/ai-image) + غلاف ختامي مع QR + تقليدي + كاروسيل + ستوريات + صح/خطأ + لغز + ملخص + إعلان + تكريم + محاكي الجوال + مسجّل فيديو
 * 3) تدوير المحتوى (1→5) + مقياس الخطّاف + ردود التعليقات + كبسولة واتساب MP3 + تعليق إلى فيديو
 * 4) خطة 7 حلقات مترابطة + حملات المواسم التعليمية
 * 5) بصمة الشخصية الثابتة (Character DNA) + خزنة البرومبتات الناجحة
 * 6) سجل أداء الحلقات وصفحة البايو
 * ============================================================================ */
(function (global) {
  "use strict";

  var DNA_KEY = "edutech_v287_char_dna";
  var VAULT_KEY = "edutech_v287_prompt_vault";
  var PERF_KEY = "edutech_v287_perf_log";

  var SUBJECTS = [
    "الرياضيات", "اللغة العربية", "العلوم والحياة", "الفيزياء", "الكيمياء",
    "الأحياء", "اللغة الإنجليزية", "التربية الإسلامية", "التكنولوجيا والبرمجة",
    "الدراسات الاجتماعية", "التاريخ", "الجغرافيا", "مهارات وتوجيهي وتطوير ذاتي"
  ];
  var GRADES = [
    "رياض الأطفال والتأسيس", "الصف الأول–الرابع", "الصف الخامس–السادس",
    "الصف السابع–التاسع", "الصف العاشر–الحادي عشر", "التوجيهي — الثاني عشر", "المعلمون وأولياء الأمور"
  ];
  var PRESETS = {
    royal_dark: { name: "🌙 فخامة ليلية ذهبية", bg1: "#020617", bg2: "#0f172a", bg3: "#1e1b4b", accent: "#fbbf24", accent2: "#38bdf8", text: "#ffffff" },
    tech_blue:  { name: "🚀 تقني أزرق عصري",   bg1: "#082f49", bg2: "#0c4a6e", bg3: "#1d4ed8", accent: "#38bdf8", accent2: "#34d399", text: "#ffffff" },
    warm_book:  { name: "📖 كتاب كلاسيكي دافئ", bg1: "#29180d", bg2: "#451a03", bg3: "#78350f", accent: "#fde68a", accent2: "#fb923c", text: "#fffbeb" },
    kids_fun:   { name: "🧒 ألوان أطفال مبهجة", bg1: "#1e1b4b", bg2: "#4c1d95", bg3: "#be185d", accent: "#fde047", accent2: "#34d399", text: "#ffffff" }
  };
  var DEFAULT_DNA = [
    { id: "pal_teacher", name: "👨‍🏫 معلم فلسطيني سينمائي", prompt: "Consistent friendly Palestinian male teacher in his 30s wearing a neat navy blazer and light shirt, standing in a bright modern sunlit classroom with a clean dark-green chalkboard, cinematic 4K lighting, warm expressive face." },
    { id: "pal_female", name: "👩‍🏫 معلمة عربية فصيحة", prompt: "Consistent warm Arab female teacher wearing an elegant pastel hijab and modest blazer in a cozy bright modern classroom with a clean chalkboard, soft cinematic lighting, clear welcoming expression." },
    { id: "pixar_3d", name: "🧸 شخصية 3D كرتونية للتأسيس", prompt: "Consistent adorable Pixar-style 3D animated Arab educator character with glasses in a colorful glowing educational studio with floating books and stars, ultra-clean 3D render, warm lighting." }
  ];

  var st = {
    tab: "scenes",
    subject: "الرياضيات",
    grade: "التوجيهي — الثاني عشر",
    topic: "",
    ratio: "9:16",
    dialogueMode: "solo",
    tone: "فصحى تعليمية رصينة",
    langMode: "ar",
    epNum: "01",
    addPromo: true,
    dnaId: "pal_teacher",
    preset: "royal_dark",
    watermark: true,
    transparentBoard: false,
    scenes: [],
    lastCoverUrl: "",
    lastCoverLabel: "",
    repurposeText: "",
    seriesList: []
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

  function copyStr(txt, label) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).catch(function () {});
    }
    toast("📋 تم نسخ " + (label || "النص") + " ✓", "success");
  }

  function getToken() {
    var u = (global.Cloud && global.Cloud.user) || null;
    if (!u && global.firebase && typeof global.firebase.auth === "function") {
      try { u = global.firebase.auth().currentUser; } catch (_) {}
    }
    return (u && u.getIdToken) ? u.getIdToken().catch(function () { return ""; }) : Promise.resolve("");
  }

  function callAI(prompt) {
    var prefOrder = undefined;
    try {
      var cfg = (typeof appState !== "undefined" && appState.aiConfig) ? appState.aiConfig : null;
      var assigned = cfg && cfg.toolEngines && cfg.toolEngines.v287_social_pro;
      if (assigned) {
        var base = Array.isArray(cfg.order) ? cfg.order.filter(function (x) { return x !== assigned; }) : [];
        prefOrder = [assigned].concat(base);
      }
    } catch (e) {}
    return getToken().then(function (tok) {
      return fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "chat", idToken: tok, prompt: prompt, tool: "v287_social_pro", order: prefOrder })
      }).then(function (r) {
        return r.text().then(function (txt) {
          var j = {};
          try { j = JSON.parse(txt); } catch (e) { j = { error: "رد غير صالح من الخادم (" + r.status + ")" }; }
          if (!r.ok && !j.error) j.error = "تعذّر الاتصال بالمحرك الذكي (HTTP " + r.status + ")";
          return j;
        });
      }).catch(function (err) {
        return { error: "تعذّر الاتصال بالإنترنت أو الخادم: " + ((err && err.message) || "تحقق من الشبكة") };
      });
    });
  }

  function loadJson(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key) || "null"); return v || fallback; } catch (_) { return fallback; }
  }
  function saveJson(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {}
  }
  function getDnaList() { return loadJson(DNA_KEY, DEFAULT_DNA); }
  function getActiveDna() {
    var list = getDnaList();
    for (var i = 0; i < list.length; i++) if (list[i].id === st.dnaId) return list[i];
    return list[0];
  }

  function mathToSpoken(txt) {
    if (global.EduArabicMath && typeof global.EduArabicMath.toSpeech === "function") {
      return global.EduArabicMath.toSpeech(txt);
    }
    return String(txt || "");
  }

  // ==========================================================================
  // 1) محرك رسم الأغلفة والألواح والبطاقات (1080p Canvas — 100% Arabic Crisp)
  // ==========================================================================
  function wrapLines(ctx, text, maxW, maxLines) {
    var words = String(text || "").split(/\s+/);
    var lines = [], cur = "";
    for (var i = 0; i < words.length; i++) {
      var test = cur ? (cur + " " + words[i]) : words[i];
      if (ctx.measureText(test).width > maxW && cur) {
        lines.push(cur);
        cur = words[i];
        if (maxLines && lines.length >= maxLines) break;
      } else cur = test;
    }
    if (cur && (!maxLines || lines.length < maxLines)) lines.push(cur);
    return lines;
  }

  function drawCoverCanvas(opts, bgImg) {
    var ratio = opts.ratio || st.ratio || "9:16";
    var W = ratio === "9:16" ? 1080 : 1920;
    var H = ratio === "9:16" ? 1920 : 1080;
    var c = document.createElement("canvas");
    c.width = W; c.height = H;
    var ctx = c.getContext("2d");
    var pr = PRESETS[st.preset] || PRESETS.royal_dark;

    if (opts.transparent) {
      ctx.clearRect(0, 0, W, H);
    } else if (bgImg) {
      // رسم خلفية الذكاء الاصطناعي بملء الإطار مع تعتيم أنيق لقراءة النص العربي
      var scale = Math.max(W / bgImg.width, H / bgImg.height);
      var dw = bgImg.width * scale, dh = bgImg.height * scale;
      ctx.drawImage(bgImg, (W - dw) / 2, (H - dh) / 2, dw, dh);
      var ov = ctx.createLinearGradient(0, 0, 0, H);
      ov.addColorStop(0, "rgba(2,6,23,0.42)");
      ov.addColorStop(0.5, "rgba(2,6,23,0.58)");
      ov.addColorStop(1, "rgba(2,6,23,0.88)");
      ctx.fillStyle = ov;
      ctx.fillRect(0, 0, W, H);
    } else {
      var g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, pr.bg1);
      g.addColorStop(0.55, pr.bg2);
      g.addColorStop(1, pr.bg3);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      // دوائر ضوئية جمالية
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.beginPath(); ctx.arc(W * 0.15, H * 0.18, W * 0.25, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(W * 0.85, H * 0.82, W * 0.28, 0, Math.PI * 2); ctx.fill();
    }

    ctx.direction = "rtl";
    ctx.textAlign = "center";

    // تأثير كعب الكتاب في وضع غلاف الكتاب الإبداعي
    if (opts.kind === "book") {
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(W - 58, 0, 58, H);
      ctx.strokeStyle = pr.accent;
      ctx.lineWidth = 8;
      ctx.strokeRect(36, 36, W - 72, H - 72);
      ctx.strokeStyle = "rgba(255,255,255,0.22)";
      ctx.lineWidth = 2;
      ctx.strokeRect(56, 56, W - 112, H - 112);
    } else if (!opts.transparent) {
      ctx.strokeStyle = pr.accent;
      ctx.lineWidth = 5;
      ctx.strokeRect(28, 28, W - 56, H - 56);
    }

    // شارة الحلقة العلوية والمنصة
    var topY = ratio === "9:16" ? 140 : 115;
    ctx.fillStyle = pr.accent;
    ctx.font = "bold " + (ratio === "9:16" ? 36 : 32) + "px Tahoma, Arial, sans-serif";
    var badgeTxt = (opts.badge || (st.subject + " • " + st.grade)) + (st.epNum ? ("  |  الحلقة #" + st.epNum) : "");
    ctx.fillText(badgeTxt, W / 2, topY);

    // محتوى بطاقة صح / خطأ المقسومة
    if (opts.kind === "split") {
      var midY = H * 0.52;
      var boxW = W * 0.42, boxH = H * 0.46;
      // يمين: خطأ شائع
      ctx.fillStyle = "rgba(220,38,38,0.22)";
      ctx.fillRect(W * 0.53, midY - boxH / 2, boxW, boxH);
      ctx.strokeStyle = "#f87171"; ctx.lineWidth = 4;
      ctx.strokeRect(W * 0.53, midY - boxH / 2, boxW, boxH);
      ctx.fillStyle = "#fca5a5";
      ctx.font = "bold 44px Tahoma, Arial, sans-serif";
      ctx.fillText("❌ الخطأ الشائع", W * 0.74, midY - boxH / 2 + 75);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 32px Tahoma, Arial, sans-serif";
      wrapLines(ctx, opts.wrongText || "الحفظ العشوائي بدون فهم القاعدة", boxW - 50, 5).forEach(function (ln, idx) {
        ctx.fillText(ln, W * 0.74, midY - 40 + idx * 52);
      });
      // يسار: الطريقة الصحيحة
      ctx.fillStyle = "rgba(16,185,129,0.22)";
      ctx.fillRect(W * 0.05, midY - boxH / 2, boxW, boxH);
      ctx.strokeStyle = "#34d399"; ctx.lineWidth = 4;
      ctx.strokeRect(W * 0.05, midY - boxH / 2, boxW, boxH);
      ctx.fillStyle = "#6ee7b7";
      ctx.font = "bold 44px Tahoma, Arial, sans-serif";
      ctx.fillText("✅ الطريقة الذكية", W * 0.26, midY - boxH / 2 + 75);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 32px Tahoma, Arial, sans-serif";
      wrapLines(ctx, opts.rightText || "الفهم التدرّجي والحل بالخطوات المنظمة", boxW - 50, 5).forEach(function (ln, idx) {
        ctx.fillText(ln, W * 0.26, midY - 40 + idx * 52);
      });
    } else {
      // العنوان الرئيسي الكبير
      var titleSize = ratio === "9:16" ? 76 : 68;
      ctx.fillStyle = pr.text;
      ctx.font = "bold " + titleSize + "px Tahoma, Arial, sans-serif";
      var tLines = wrapLines(ctx, opts.title || st.topic || "درس تفاعلي مميز", W - 180, 4);
      var startY = (opts.kind === "board" ? H * 0.34 : H * 0.42) - (tLines.length * titleSize * 0.45);
      tLines.forEach(function (ln, idx) {
        ctx.fillText(ln, W / 2, startY + idx * (titleSize + 24));
      });

      // النص الفرعي / المعادلة / نقاط اللوح
      if (opts.body) {
        ctx.fillStyle = "rgba(15,23,42,0.72)";
        var bx = 90, by = startY + tLines.length * (titleSize + 24) + 30, bw = W - 180, bh = ratio === "9:16" ? 420 : 250;
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = pr.accent2; ctx.lineWidth = 3;
        ctx.strokeRect(bx, by, bw, bh);

        ctx.fillStyle = "#e2e8f0";
        var bSize = ratio === "9:16" ? 42 : 36;
        ctx.font = "bold " + bSize + "px Tahoma, Arial, sans-serif";
        var bLines = wrapLines(ctx, opts.body, bw - 80, 6);
        bLines.forEach(function (ln, idx) {
          ctx.fillText(ln, W / 2, by + 76 + idx * (bSize + 20));
        });
      }
    }

    // شاشة النهاية (Outro) مع مربع QR أو دعوة المتابعة
    if (opts.kind === "outro") {
      ctx.fillStyle = pr.accent;
      ctx.font = "bold " + (ratio === "9:16" ? 46 : 40) + "px Tahoma, Arial, sans-serif";
      ctx.fillText("🔔 اشترك وتابع منصة EduTech Mindset", W / 2, H - 300);
      ctx.fillStyle = "#7dd3fc";
      ctx.font = "bold 34px Tahoma, Arial, sans-serif";
      ctx.fillText("https://edutech-mindset.pages.dev", W / 2, H - 235);
      if (opts.qrImg) {
        var qs = ratio === "9:16" ? 210 : 170;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(W / 2 - qs / 2 - 12, H - 560, qs + 24, qs + 24);
        ctx.drawImage(opts.qrImg, W / 2 - qs / 2, H - 548, qs, qs);
      }
    }

    // التذييل والختم المائي
    if (st.watermark && !opts.transparent) {
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "bold 30px Tahoma, Arial, sans-serif";
      ctx.fillText("EduTech Mindset  •  إشراف أ. باسل أشرف الفقعاوي 🇵🇸", W / 2, H - 80);
    }

    return c;
  }

  function downloadCanvas(canvas, filename) {
    var url = canvas.toDataURL("image/png");
    st.lastCoverUrl = url;
    st.lastCoverLabel = filename;
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    return url;
  }

  function loadImg(url) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = url;
    });
  }

  function generateAiBookCover() {
    var topic = st.topic.trim() || st.subject;
    toast("🎨 جارٍ توليد خلفية غلاف الكتاب الإبداعي بالذكاء الاصطناعي…", "info");
    var enPrompt = "Inspiring creative 3D book cover illustration representing " + topic + " (" + st.subject + "), glowing golden light of knowledge, floating symbolic educational elements, rich cinematic studio lighting, ultra detailed digital art, strictly NO text, NO letters, NO numbers, NO watermark";
    return fetch("/api/ai-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: enPrompt, ratio: st.ratio })
    }).then(function (r) {
      if (!r.ok) throw new Error("img_err");
      return r.blob();
    }).then(function (blob) {
      var objUrl = URL.createObjectURL(blob);
      return loadImg(objUrl).then(function (img) {
        var c = drawCoverCanvas({ kind: "book", title: topic, body: "دليل تعليمي مبسّط — " + st.grade, ratio: st.ratio }, img);
        URL.revokeObjectURL(objUrl);
        downloadCanvas(c, "EduTech_AI_BookCover_" + st.ratio.replace(":", "x") + ".png");
        toast("📖 تم توليد وتحميل غلاف الكتاب الإبداعي بالذكاء الاصطناعي ✓", "success");
        if (!document.getElementById("v287MobileFixStyle")) {
      var ms = document.createElement("style");
      ms.id = "v287MobileFixStyle";
      ms.textContent =
        "#v287SocialBody select, #v287SocialBody input { padding-left: 2rem !important; text-overflow: ellipsis; font-size: 13px !important; }\n" +
        "@media (max-width: 640px) {\n" +
        "  #v287SocialProModal > div { width: 100vw !important; max-height: 96vh !important; border-radius: 18px !important; }\n" +
        "  #v287SocialBody [style*='grid-template-columns:1fr 1fr'], #v287SocialBody [style*='grid-template-columns: 1fr 1fr'] { grid-template-columns: 1fr !important; }\n" +
        "  #v287SocialBody > div:first-child { overflow-x: auto !important; flex-wrap: nowrap !important; -webkit-overflow-scrolling: touch; padding-bottom: 6px !important; }\n" +
        "  #v287SocialBody button { flex-shrink: 0; }\n" +
        "}";
      document.head.appendChild(ms);
    }
    renderModal();
      });
    }).catch(function () {
      var c = drawCoverCanvas({ kind: "book", title: topic, body: "دليل تعليمي مبسّط — " + st.grade, ratio: st.ratio }, null);
      downloadCanvas(c, "EduTech_BookCover_" + st.ratio.replace(":", "x") + ".png");
      toast("📖 تم توليد الغلاف الإبداعي الفوري ✓", "success");
      renderModal();
    });
  }

  function generateOutroCover() {
    var qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=" + encodeURIComponent("https://edutech-mindset.pages.dev");
    toast("🎬 جارٍ تجهيز الغلاف الختامي مع رمز QR…", "info");
    loadImg(qrUrl).then(function (qrImg) {
      var c = drawCoverCanvas({
        kind: "outro",
        badge: "🌟 شكراً لمتابعتكم",
        title: st.addPromo ? "جرّب أدوات الذكاء الاصطناعي مجاناً الآن!" : "نلتقي في الحلقة القادمة بإذن الله!",
        body: "امسح الرمز للدخول مباشرة إلى منصة EduTech Mindset",
        ratio: st.ratio,
        qrImg: qrImg
      }, null);
      downloadCanvas(c, "EduTech_Outro_QR_" + st.ratio.replace(":", "x") + ".png");
      toast("🎬 تم تحميل الغلاف الختامي مع QR ✓", "success");
      renderModal();
    });
  }

  // ==========================================================================
  // 2) توليد مشاهد الـ 10 ثوانٍ لـ Google Flow (الرياضيات + جميع المواد)
  // ==========================================================================
  function generate10SecScenes() {
    var topic = st.topic.trim();
    if (!topic) { toast("⚠️ اكتب عنوان الدرس أو مسألة الرياضيات أولاً", "warn"); return; }
    toast("🎬 جارٍ تقسيم الشرح إلى مشاهد (10 ثوانٍ لكل مشهد) لـ Google Flow…", "info");

    var isMath = st.subject === "الرياضيات" || st.subject === "الفيزياء";
    var dlgRule = st.dialogueMode === "duo"
      ? "اجعل السكريبت حواراً حيوياً بين شخصيتين: [طالب يسأل سؤالاً ذكياً] و[معلم يجيب ببساطة]."
      : "اجعل السكريبت بصوت معلم فلسطيني يشرح بأسلوب واضح وجذاب.";
    var langRule = st.langMode === "bi"
      ? "أضف ترجمة إنجليزية مختصرة لكل مشهد بجانب العربية للانتشار العالمي."
      : "اجعل الحوار بالعربية الفصحى المشكولة فقط.";
    var promoRule = st.addPromo
      ? "في المشهد الأخير أضف دعوة ذكية قصيرة لتجربة أدوات وباقات موقع EduTech Mindset."
      : "اختم بسؤال تفاعلي للمشاهدين.";

    var p = "أنت مخرج محتوى تعليمي خبير في Google Flow (Veo) والمنهاج الفلسطيني.\n" +
      "المادة: " + st.subject + " | المرحلة: " + st.grade + " | الموضوع/المسألة: " + topic + "\n" +
      "الأسلوب: " + st.tone + " | المقاس: " + st.ratio + ".\n" +
      dlgRule + " " + langRule + " " + promoRule + "\n" +
      (isMath ? "مهم جداً للرياضيات: في نص اللوح اكتب المعادلة برموز المنهاج الفلسطيني العربية (س، ص، جا، جتا)، أما في الحوار المنطوق فاكتب كل الأرقام والكسور والجذور بالكلمات العربية المشكولة بدون رموز رياضية إطلاقاً حتى ينطقها Google Flow بنسبة 100% صحيحة.\n" : "") +
      "قسّم الفيديو إلى 5 مشاهد بالضبط (مدة كل مشهد 10 ثوانٍ، الحوار بين 18 و26 كلمة فقط لكل مشهد).\n" +
      "أعد الإجابة بصيغة JSON صالحة فقط بدون أي نص خارج JSON بهذا الشكل:\n" +
      '[{"num":1,"time":"0:00-0:10","title":"عنوان المشهد","board":"النص/المعادلة القصيرة على اللوح","dialogue":"الحوار العربي المشكول المنطوق","visualEn":"Detailed English cinematic shot description for Google Flow/Veo with clean chalkboard","sfx":"المؤثر الصوتي والموسيقى المقترحة"}]';

    callAI(p).then(function (res) {
      var txt = (res && res.text) || "";
      if (!txt) { toast("❌ " + ((res && res.error) || "تعذّر التوليد حالياً"), "error"); return; }
      var parsed = null;
      try {
        var m = txt.match(/\[[\s\S]*\]/);
        if (m) parsed = JSON.parse(m[0]);
      } catch (_) {}
      if (!Array.isArray(parsed) || !parsed.length) {
        // احتياطي ذكي بتقسيم النص إلى مشاهد 10 ثوانٍ
        parsed = [
          { num: 1, time: "0:00-0:10", title: "المقدمة والخطّاف", board: topic, dialogue: mathToSpoken("أَهْلاً بِكُمْ فِي حَلْقَةٍ جَدِيدَةٍ عَنْ: " + topic), visualEn: "Close-up of enthusiastic teacher smiling in modern classroom", sfx: "نغمة بداية مشوّقة" },
          { num: 2, time: "0:10-0:20", title: "الفكرة والقاعدة", board: txt.slice(0, 120), dialogue: mathToSpoken(txt.slice(0, 180)), visualEn: "Medium shot teacher pointing towards clean dark chalkboard", sfx: "صوت جرس خفيف" },
          { num: 3, time: "0:20-0:30", title: "التطبيق والحل", board: txt.slice(120, 260) || topic, dialogue: mathToSpoken(txt.slice(180, 360) || ("لِنُطَبِّقْ مَعاً عَلَى " + topic)), visualEn: "Smooth pan across classroom showing engaged students", sfx: "موسيقى تعليمية هادئة" },
          { num: 4, time: "0:30-0:40", title: "الخاتمة والدعوة للمتابعة", board: "edutech-mindset.pages.dev", dialogue: "جَرِّبُوا الآنَ المَزِيدَ مِنَ التَّمَارِينِ الذَّكِيَّةِ عَلَى مَنَصَّةِ إِيدُوتِكْ مَاينْدْسِيتْ!", visualEn: "Warm closing shot of teacher waving goodbye with glowing light", sfx: "موسيقى ختامية ملهمة" }
        ];
      } else {
        parsed.forEach(function (sc) {
          sc.dialogueSpoken = mathToSpoken(sc.dialogue || "");
        });
      }
      st.scenes = parsed;
      toast("🎬 تم تجهيز " + parsed.length + " مشاهد (10 ثوانٍ لكل مشهد) بنجاح ✓", "success");
      renderModal();
    }).catch(function () { toast("❌ خطأ في الاتصال بالسحابة", "error"); });
  }

  function buildFlowPrompt(sc) {
    var dna = getActiveDna();
    var spoken = mathToSpoken(sc.dialogue || "");
    return "SCENE " + sc.num + " (" + (sc.time || "10s") + ") — Aspect Ratio: " + st.ratio + "\n" +
      "VISUAL (Google Flow / Veo): " + dna.prompt + " " + (sc.visualEn || "") + " Keep any board text static and clean, no random generated text.\n" +
      "AUDIO MOOD / SFX: " + (sc.sfx || "Soft inspiring educational background music") + "\n" +
      "ARABIC DIALOGUE (Clear Modern Standard Arabic): \"" + spoken + "\"";
  }

  function downloadSrtFile() {
    if (!st.scenes.length) { toast("⚠️ ولّد المشاهد أولاً", "warn"); return; }
    var srt = st.scenes.map(function (sc, i) {
      var s0 = i * 10, s1 = (i + 1) * 10;
      function fmt(sec) {
        var mm = String(Math.floor(sec / 60)).padStart(2, "0");
        var ss = String(sec % 60).padStart(2, "0");
        return "00:" + mm + ":" + ss + ",000";
      }
      return (i + 1) + "\n" + fmt(s0) + " --> " + fmt(s1) + "\n" + (sc.dialogue || "") + "\n";
    }).join("\n");
    var blob = new Blob(["\uFEFF" + srt], { type: "text/plain;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "EduTech_Ep" + st.epNum + "_Subtitles.srt";
    a.click();
    toast("📝 تم تحميل ملف الترجمة (.srt) جاهزاً لـ CapCut ويوتيوب ✓", "success");
  }

  function downloadSceneMp3(text, filename) {
    var spoken = mathToSpoken(text);
    toast("🎙️ جارٍ توليد ملف الصوت الفصيح MP3…", "info");
    fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: spoken.slice(0, 1200), gender: st.dnaId === "pal_female" ? "female" : "male" })
    }).then(function (r) {
      if (!r.ok) throw new Error("tts_err");
      return r.blob();
    }).then(function (blob) {
      var url = URL.createObjectURL(blob);
      var audio = new Audio(url);
      audio.play().catch(function () {});
      var a = document.createElement("a");
      a.href = url;
      a.download = filename || "EduTech_Scene.mp3";
      a.click();
      toast("🎙️ تم تشغيل وتحميل الصوت الفصيح ✓", "success");
    }).catch(function () {
      if (global.EduTTS && global.EduTTS.speak) global.EduTTS.speak(spoken);
      toast("🔊 تم التشغيل عبر محرك الصوت المباشر", "info");
    });
  }

  // ==========================================================================
  // 3) مُلقّن الكاميرا الذكي (Smart Teleprompter)
  // ==========================================================================
  function openTeleprompter() {
    var fullText = st.scenes.length
      ? st.scenes.map(function (sc) { return "【المشهد " + sc.num + " — " + sc.time + "】\n" + (sc.dialogue || ""); }).join("\n\n")
      : (st.topic || "اكتب أو ولّد السكريبت أولاً لتشغيل الملقّن الذكي");
    var old = document.getElementById("v287Teleprompter");
    if (old) old.remove();
    var ov = document.createElement("div");
    ov.id = "v287Teleprompter";
    ov.style.cssText = "position:fixed;inset:0;z-index:2147483600;background:#000;color:#fff;display:flex;flex-direction:column;direction:rtl;";
    ov.innerHTML =
      '<div style="padding:10px 14px;background:#0f172a;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">' +
        '<strong style="color:#fde68a;font-size:13.5px;">📺 مُلقّن الكاميرا الذكي</strong>' +
        '<div style="display:flex;gap:8px;align-items:center;">' +
          '<label style="font-size:11px;">السرعة: <input id="tpSpeed" type="range" min="1" max="8" value="3" style="width:90px;"></label>' +
          '<button type="button" id="tpPlayBtn" style="padding:6px 14px;border-radius:9px;background:#10b981;color:#020617;border:none;font-weight:900;cursor:pointer;">▶ تشغيل / إيقاف</button>' +
          '<button type="button" id="tpCloseBtn" style="padding:6px 12px;border-radius:9px;background:#dc2626;color:#fff;border:none;font-weight:900;cursor:pointer;">✕</button>' +
        '</div>' +
      '</div>' +
      '<div id="tpScrollBox" style="flex:1;overflow-y:auto;padding:30vh 8vw 60vh;font-size:clamp(24px,4.5vw,42px);line-height:1.9;font-weight:800;text-align:center;">' + esc(fullText).replace(/\n/g, "<br>") + '</div>';
    document.body.appendChild(ov);
    var running = false, raf = null;
    function step() {
      if (!running) return;
      var box = document.getElementById("tpScrollBox");
      var sp = Number(document.getElementById("tpSpeed").value) || 3;
      if (box) box.scrollTop += sp * 0.45;
      raf = requestAnimationFrame(step);
    }
    document.getElementById("tpPlayBtn").onclick = function () {
      running = !running;
      if (running) step();
      else if (raf) cancelAnimationFrame(raf);
    };
    document.getElementById("tpCloseBtn").onclick = function () {
      running = false; if (raf) cancelAnimationFrame(raf); ov.remove();
    };
  }

  // ==========================================================================
  // 4) مسجّل فيديو الشرائح السريع داخل المتصفح (Instant Slides WebM Video)
  // ==========================================================================
  function recordInstantSlidesVideo() {
    if (!st.scenes.length) { toast("⚠️ ولّد مشاهد الـ 10 ثوانٍ أولاً لتسجيل الفيديو", "warn"); return; }
    if (typeof MediaRecorder === "undefined") { toast("⚠️ متصفحك لا يدعم تسجيل الفيديو المباشر — استخدم صور الألواح في CapCut", "warn"); return; }
    toast("🎥 جارٍ تسجيل فيديو الشرائح تلقائياً (3 ثوانٍ لكل مشهد)…", "info");
    var c = document.createElement("canvas");
    c.width = st.ratio === "9:16" ? 720 : 1280;
    c.height = st.ratio === "9:16" ? 1280 : 720;
    var ctx = c.getContext("2d");
    var stream = c.captureStream(24);
    var chunks = [];
    var rec = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("video/webm") ? "video/webm" : "" });
    rec.ondataavailable = function (e) { if (e.data && e.data.size > 0) chunks.push(e.data); };
    rec.onstop = function () {
      var blob = new Blob(chunks, { type: "video/webm" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "EduTech_Lesson_Ep" + st.epNum + ".webm";
      a.click();
      toast("🎥 تم حفظ فيديو الشرائح السريع ✓", "success");
    };
    rec.start();
    var idx = 0;
    function drawNext() {
      if (idx >= st.scenes.length) { rec.stop(); return; }
      var sc = st.scenes[idx++];
      var frame = drawCoverCanvas({ kind: "board", badge: "المشهد " + sc.num + " • " + sc.time, title: sc.title, body: sc.board || sc.dialogue, ratio: st.ratio }, null);
      ctx.drawImage(frame, 0, 0, c.width, c.height);
      setTimeout(drawNext, 2800);
    }
    drawNext();
  }

  // ==========================================================================
  // 5) واجهة النافذة الرئيسية للاستوديو (6 تبويبات منظّمة وسريعة)
  // ==========================================================================
  function renderModal() {
    var body = document.getElementById("v287SocialBody");
    if (!body) return;
    var inp = "width:100%;padding:8px 10px;border-radius:10px;background:#020617;color:#fff;border:1px solid rgba(255,255,255,0.2);font-size:12px;";
    var lbl = "display:block;font-size:10.5px;font-weight:900;color:#7dd3fc;margin-bottom:3px;";

    var tabs = [
      { id: "scenes", label: "🎬 مشاهد Flow (10ث)" },
      { id: "covers", label: "🎨 الأغلفة والبطاقات AI" },
      { id: "repurpose", label: "🔄 تدوير 1→5 والتعليقات" },
      { id: "series", label: "🗓️ 7 حلقات والمواسم" },
      { id: "dna", label: "🎭 الشخصية والخزنة" },
      { id: "perf", label: "📈 الأداء والبايو" }
    ];
    var tabsHtml = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">' + tabs.map(function (t) {
      var on = st.tab === t.id;
      return '<button type="button" data-sp-tab="' + t.id + '" style="padding:7px 11px;border-radius:11px;font-size:11.5px;font-weight:900;cursor:pointer;border:1px solid ' + (on ? '#f97316' : 'rgba(255,255,255,0.15)') + ';background:' + (on ? 'linear-gradient(135deg,#f97316,#ea580c)' : 'rgba(255,255,255,0.06)') + ';color:#fff;">' + t.label + '</button>';
    }).join("") + '</div>';

    // شريط الإعداد المشترك للموضوع والمادة
    var commonBar =
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:7px;padding:11px;border-radius:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);margin-bottom:12px;">' +
        '<div><label style="' + lbl + '">📚 المادة</label><select id="spSubj" style="' + inp + '">' + SUBJECTS.map(function (x) { return '<option value="' + x + '"' + (st.subject === x ? ' selected' : '') + '>' + x + '</option>'; }).join("") + '</select></div>' +
        '<div><label style="' + lbl + '">🏫 المرحلة</label><select id="spGrade" style="' + inp + '">' + GRADES.map(function (x) { return '<option value="' + x + '"' + (st.grade === x ? ' selected' : '') + '>' + x + '</option>'; }).join("") + '</select></div>' +
        '<div><label style="' + lbl + '">📐 المقاس</label><select id="spRatio" style="' + inp + '"><option value="9:16"' + (st.ratio === "9:16" ? ' selected' : '') + '>📱 9:16 ريلز/تيك توك</option><option value="16:9"' + (st.ratio === "16:9" ? ' selected' : '') + '>📺 16:9 يوتيوب</option></select></div>' +
        '<div><label style="' + lbl + '">🔢 رقم الحلقة</label><input id="spEp" value="' + esc(st.epNum) + '" style="' + inp + '"></div>' +
        '<div style="grid-column:1/-1;"><label style="' + lbl + '">📌 موضوع الحلقة أو مسألة الرياضيات *</label><input id="spTopic" value="' + esc(st.topic) + '" placeholder="مثلاً: حل المعادلة التربيعية 2س^2 - 5س = -3، أو أسرار الإعراب في التوجيهي" style="' + inp + '"></div>' +
      '</div>';

    var html = "";

    // TAB 1: 10-Second Scenes for Google Flow (Math + All Subjects)
    if (st.tab === "scenes") {
      var dnaList = getDnaList();
      html =
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:7px;margin-bottom:10px;">' +
          '<div><label style="' + lbl + '">🎙️ نمط الحوار</label><select id="spDlgMode" style="' + inp + '"><option value="solo"' + (st.dialogueMode === "solo" ? ' selected' : '') + '>معلم منفرد</option><option value="duo"' + (st.dialogueMode === "duo" ? ' selected' : '') + '>🎭 حوار (معلم + طالب)</option></select></div>' +
          '<div><label style="' + lbl + '">🗣️ النبرة والأسلوب</label><select id="spTone" style="' + inp + '">' +
            ['فصحى تعليمية رصينة', 'حماسية سريعة للريلز', 'قصصية دافئة للأطفال', 'ودّية مشجّعة للتوجيهي'].map(function (t) { return '<option value="' + t + '"' + (st.tone === t ? ' selected' : '') + '>' + t + '</option>'; }).join("") +
          '</select></div>' +
          '<div><label style="' + lbl + '">🎭 بصمة الشخصية</label><select id="spDnaSel" style="' + inp + '">' + dnaList.map(function (d) { return '<option value="' + esc(d.id) + '"' + (st.dnaId === d.id ? ' selected' : '') + '>' + esc(d.name) + '</option>'; }).join("") + '</select></div>' +
          '<div><label style="' + lbl + '">🌍 اللغة</label><select id="spLang" style="' + inp + '"><option value="ar"' + (st.langMode === "ar" ? ' selected' : '') + '>عربية فصحى مشكولة</option><option value="bi"' + (st.langMode === "bi" ? ' selected' : '') + '>ثنائية (عربي + إنجليزي)</option></select></div>' +
        '</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:10px;font-size:11.5px;color:#cbd5e1;">' +
          '<label style="display:flex;align-items:center;gap:5px;cursor:pointer;"><input type="checkbox" id="spPromoChk"' + (st.addPromo ? ' checked' : '') + '> 🎟️ دمج عرض اشتراكات الموقع في الخاتمة</label>' +
          '<label style="display:flex;align-items:center;gap:5px;cursor:pointer;"><input type="checkbox" id="spTransChk"' + (st.transparentBoard ? ' checked' : '') + '> 🪟 ألواح PNG بخلفية شفافة لـ CapCut</label>' +
        '</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:12px;">' +
          '<button type="button" id="spGenScenesBtn" style="padding:9px 16px;border-radius:12px;background:linear-gradient(135deg,#10b981,#047857);color:#fff;border:none;font-size:12.5px;font-weight:900;cursor:pointer;">🎬 ولّد مشاهد الـ 10 ثوانٍ لـ Google Flow</button>' +
          '<button type="button" id="spTeleBtn" style="padding:9px 12px;border-radius:12px;background:rgba(56,189,248,0.2);color:#7dd3fc;border:1px solid rgba(56,189,248,0.4);font-size:11.5px;font-weight:900;cursor:pointer;">📺 مُلقّن الكاميرا</button>' +
          '<button type="button" id="spSrtBtn" style="padding:9px 12px;border-radius:12px;background:rgba(251,191,36,0.2);color:#fde68a;border:1px solid rgba(251,191,36,0.4);font-size:11.5px;font-weight:900;cursor:pointer;">📝 ترجمة SRT</button>' +
          '<button type="button" id="spKitBtn" style="padding:9px 12px;border-radius:12px;background:rgba(168,85,247,0.2);color:#e9d5ff;border:1px solid rgba(168,85,247,0.4);font-size:11.5px;font-weight:900;cursor:pointer;">📦 حقيبة الحلقة</button>' +
          '<button type="button" id="spRecVidBtn" style="padding:9px 12px;border-radius:12px;background:rgba(244,63,94,0.2);color:#fda4af;border:1px solid rgba(244,63,94,0.4);font-size:11.5px;font-weight:900;cursor:pointer;">🎥 تسجيل فيديو شرائح</button>' +
          '<button type="button" id="spTgBtn" style="padding:9px 12px;border-radius:12px;background:rgba(14,165,233,0.25);color:#bae6fd;border:1px solid rgba(56,189,248,0.4);font-size:11.5px;font-weight:900;cursor:pointer;">✈️ نشر لتليجرام</button>' +
        '</div>' +
        (!st.scenes.length
          ? '<div style="padding:20px;text-align:center;color:#94a3b8;background:rgba(255,255,255,0.04);border-radius:14px;font-size:12px;">اكتب موضوع الدرس أو مسألة الرياضيات بالأعلى واضغط «ولّد مشاهد الـ 10 ثوانٍ» لتحصل على برومبتات Google Flow جاهزة مع النطق العربي المشكول وألواح PNG وصوت MP3 لكل مشهد!</div>'
          : '<div style="display:flex;flex-direction:column;gap:9px;">' + st.scenes.map(function (sc, i) {
              var spoken = mathToSpoken(sc.dialogue || "");
              var warnRaw = /[\\^√\/]/.test(sc.dialogue || "") ? '<span style="color:#fde68a;font-size:10px;"> · ✅ تم تحويل رموز الرياضيات لنطق عربي سليم</span>' : '';
              return '<div style="padding:11px;border-radius:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(52,211,153,0.3);">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:6px;">' +
                  '<strong style="font-size:12.5px;color:#6ee7b7;">🎬 المشهد ' + sc.num + ' (' + esc(sc.time || "10ث") + ') — ' + esc(sc.title) + '</strong>' +
                  '<span style="font-size:10.5px;color:#fde68a;">🎵 ' + esc(sc.sfx || "موسيقى تعليمية هادئة") + '</span>' +
                '</div>' +
                '<div style="font-size:11.5px;color:#bae6fd;margin-bottom:4px;">📌 <strong>على اللوح:</strong> ' + esc(sc.board || "") + '</div>' +
                '<div style="font-size:12px;color:#fff;line-height:1.7;margin-bottom:8px;">🗣️ <strong>النطق لـ Flow:</strong> ' + esc(spoken) + warnRaw + '</div>' +
                '<div style="display:flex;flex-wrap:wrap;gap:6px;">' +
                  '<button type="button" data-sc-copy="' + i + '" style="padding:6px 10px;border-radius:9px;background:#0284c7;color:#fff;border:none;font-size:11px;font-weight:900;cursor:pointer;">📋 نسخ برومبت Flow</button>' +
                  '<button type="button" data-sc-board="' + i + '" style="padding:6px 10px;border-radius:9px;background:#f59e0b;color:#020617;border:none;font-size:11px;font-weight:900;cursor:pointer;">🖼️ لوح المشهد PNG</button>' +
                  '<button type="button" data-sc-mp3="' + i + '" style="padding:6px 10px;border-radius:9px;background:#10b981;color:#020617;border:none;font-size:11px;font-weight:900;cursor:pointer;">🎙️ صوت MP3</button>' +
                  '<button type="button" data-sc-star="' + i + '" style="padding:6px 9px;border-radius:9px;background:rgba(255,255,255,0.1);color:#fde68a;border:1px solid rgba(251,191,36,0.35);font-size:11px;font-weight:900;cursor:pointer;">⭐ حفظ للخزنة</button>' +
                '</div>' +
              '</div>';
            }).join("") + '</div>');
    }

    // TAB 2: AI Creative Book Cover + Outro + Classic + Viral Cards + Mobile Preview
    if (st.tab === "covers") {
      html =
        '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:10px;">' +
          '<select id="spPresetSel" style="' + inp + 'width:auto;min-width:190px;">' + Object.keys(PRESETS).map(function (k) { return '<option value="' + k + '"' + (st.preset === k ? ' selected' : '') + '>' + PRESETS[k].name + '</option>'; }).join("") + '</select>' +
          '<label style="font-size:11.5px;color:#cbd5e1;display:flex;align-items:center;gap:5px;cursor:pointer;"><input type="checkbox" id="spWmChk"' + (st.watermark ? ' checked' : '') + '> 🏷️ ختم EduTech المائي</label>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:8px;margin-bottom:12px;">' +
          '<button type="button" id="spAiBookBtn" style="padding:11px 10px;border-radius:14px;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#020617;border:none;font-size:12px;font-weight:900;cursor:pointer;">📖 غلاف كتاب إبداعي (AI)</button>' +
          '<button type="button" id="spOutroBtn" style="padding:11px 10px;border-radius:14px;background:linear-gradient(135deg,#10b981,#047857);color:#fff;border:none;font-size:12px;font-weight:900;cursor:pointer;">🎬 غلاف ختامي + QR Code</button>' +
          '<button type="button" id="spClassicBtn" style="padding:11px 10px;border-radius:14px;background:rgba(56,189,248,0.2);color:#7dd3fc;border:1px solid rgba(56,189,248,0.4);font-size:12px;font-weight:900;cursor:pointer;">🖼️ الغلاف التقليدي السريع</button>' +
          '<button type="button" id="spCarouselBtn" style="padding:11px 10px;border-radius:14px;background:rgba(168,85,247,0.2);color:#e9d5ff;border:1px solid rgba(168,85,247,0.4);font-size:12px;font-weight:900;cursor:pointer;">🎨 كاروسيل 5 شرائح PNG</button>' +
          '<button type="button" id="spStoriesBtn" style="padding:11px 10px;border-radius:14px;background:rgba(236,72,153,0.2);color:#f9a8d4;border:1px solid rgba(236,72,153,0.4);font-size:12px;font-weight:900;cursor:pointer;">📱 3 ستوريات تحدّي (9:16)</button>' +
          '<button type="button" id="spSplitBtn" style="padding:11px 10px;border-radius:14px;background:rgba(244,63,94,0.2);color:#fda4af;border:1px solid rgba(244,63,94,0.4);font-size:12px;font-weight:900;cursor:pointer;">⚡ بطاقة صح ✅ / خطأ ❌</button>' +
          '<button type="button" id="spPuzzleBtn" style="padding:11px 10px;border-radius:14px;background:rgba(251,191,36,0.18);color:#fde68a;border:1px solid rgba(251,191,36,0.4);font-size:12px;font-weight:900;cursor:pointer;">🧩 بطاقة اللغز اليومي</button>' +
          '<button type="button" id="spCheatBtn" style="padding:11px 10px;border-radius:14px;background:rgba(16,185,129,0.18);color:#6ee7b7;border:1px solid rgba(52,211,153,0.4);font-size:12px;font-weight:900;cursor:pointer;">🃏 بطاقة ملخص للحفظ</button>' +
          '<button type="button" id="spPromoBtn" style="padding:11px 10px;border-radius:14px;background:rgba(14,165,233,0.18);color:#bae6fd;border:1px solid rgba(56,189,248,0.4);font-size:12px;font-weight:900;cursor:pointer;">📣 إعلان دورة / باقات</button>' +
          '<button type="button" id="spShoutBtn" style="padding:11px 10px;border-radius:14px;background:rgba(245,158,11,0.18);color:#fde68a;border:1px solid rgba(245,158,11,0.4);font-size:12px;font-weight:900;cursor:pointer;">🏅 بطاقة تكريم طالب/معلم</button>' +
          '<button type="button" id="spIntroBtn" style="padding:11px 10px;border-radius:14px;background:rgba(99,102,241,0.22);color:#c7d2fe;border:1px solid rgba(129,140,248,0.4);font-size:12px;font-weight:900;cursor:pointer;">🎬 بطاقة مقدمة 3 ثوانٍ</button>' +
        '</div>' +
        (st.lastCoverUrl
          ? '<div style="padding:12px;border-radius:15px;background:rgba(255,255,255,0.05);border:1px solid rgba(251,191,36,0.35);">' +
              '<div style="font-size:12px;font-weight:900;color:#fde68a;margin-bottom:8px;">🔍 محاكي معاينة الغلاف على شاشة الجوال (يوتيوب / إنستغرام):</div>' +
              '<div style="display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start;justify-content:center;">' +
                '<img src="' + st.lastCoverUrl + '" style="max-height:260px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);">' +
                '<div style="width:170px;background:#020617;border-radius:14px;padding:8px;border:1px solid rgba(255,255,255,0.2);">' +
                  '<div style="font-size:9.5px;color:#94a3b8;margin-bottom:4px;">حجم المصغّرة على الجوال:</div>' +
                  '<img src="' + st.lastCoverUrl + '" style="width:100%;border-radius:8px;">' +
                  '<div style="font-size:10px;font-weight:800;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(st.topic || st.subject) + '</div>' +
                '</div>' +
              '</div>' +
            '</div>'
          : '');
    }

    // TAB 3: Content Repurposer (1->5) + Hook Scorer + Replies + WhatsApp Audio + Comment-to-Video
    if (st.tab === "repurpose") {
      html =
        '<div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:10px;">' +
          '<button type="button" id="spRep5Btn" style="padding:9px 14px;border-radius:11px;background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;border:none;font-size:12px;font-weight:900;cursor:pointer;">🔄 حوّل الموضوع إلى 5 صيغ + مقياس الخطّاف + 3 ردود</button>' +
          '<button type="button" id="spWaCapBtn" style="padding:9px 14px;border-radius:11px;background:linear-gradient(135deg,#10b981,#047857);color:#fff;border:none;font-size:12px;font-weight:900;cursor:pointer;">🎧 كبسولة واتساب صوتية (60ث MP3)</button>' +
        '</div>' +
        '<div style="padding:11px;border-radius:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);margin-bottom:10px;">' +
          '<label style="' + lbl + '">💬 محوّل تعليق المتابع إلى فيديو ردّ + بطاقة سؤال PNG:</label>' +
          '<div style="display:flex;gap:7px;">' +
            '<input id="spCommentIn" placeholder="الصق سؤال متابع من فيسبوك أو يوتيوب أو واتساب…" style="' + inp + '">' +
            '<button type="button" id="spCommentGo" style="padding:8px 13px;border-radius:10px;background:#f59e0b;color:#020617;border:none;font-size:11.5px;font-weight:900;cursor:pointer;white-space:nowrap;">🎬 اصنع الرد</button>' +
          '</div>' +
        '</div>' +
        (st.repurposeText ? '<div style="padding:12px;border-radius:14px;background:#020617;border:1px solid rgba(56,189,248,0.35);font-size:12px;line-height:1.8;white-space:pre-wrap;max-height:42vh;overflow-y:auto;">' + esc(st.repurposeText) + '</div>' : '');
    }

    // TAB 4: 7-Episode Series Planner & Seasonal Kits
    if (st.tab === "series") {
      var seasons = [
        "ليالي امتحان التوجيهي في فلسطين", "بداية الفصل الدراسي للمعلمين والطلاب",
        "يوم المعلم الفلسطيني وتكريم المعلمين", "إعلان نتائج التوجيهي والتحفيز",
        "جدول المذاكرة الذكي في شهر رمضان", "تعليم الطوارئ والخيام التعليمية في غزة"
      ];
      html =
        '<div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:10px;">' +
          '<button type="button" id="spGen7Btn" style="padding:9px 15px;border-radius:11px;background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;font-size:12px;font-weight:900;cursor:pointer;">🗓️ ولّد خطة 7 حلقات مترابطة للموضوع</button>' +
        '</div>' +
        '<div style="font-size:11.5px;font-weight:900;color:#fde68a;margin-bottom:6px;">🎉 حملات المواسم التعليمية الجاهزة (اضغط لتجهيزها فوراً):</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">' + seasons.map(function (sn) {
          return '<button type="button" data-season="' + esc(sn) + '" style="padding:6px 10px;border-radius:10px;background:rgba(255,255,255,0.08);color:#e2e8f0;border:1px solid rgba(255,255,255,0.16);font-size:11px;font-weight:800;cursor:pointer;">✨ ' + esc(sn) + '</button>';
        }).join("") + '</div>' +
        (st.seriesList.length ? '<div style="display:flex;flex-direction:column;gap:7px;">' + st.seriesList.map(function (ep, idx) {
          return '<div style="padding:9px 12px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(56,189,248,0.3);display:flex;justify-content:space-between;align-items:center;gap:8px;">' +
            '<span style="font-size:12px;font-weight:800;">الحلقة #' + (idx + 1) + ': ' + esc(ep) + '</span>' +
            '<button type="button" data-pick-ep="' + idx + '" style="padding:5px 10px;border-radius:9px;background:#10b981;color:#020617;border:none;font-size:11px;font-weight:900;cursor:pointer;">🎬 إنتاج</button>' +
          '</div>';
        }).join("") + '</div>' : '');
    }

    // TAB 5: Character DNA & Saved Flow Prompts Vault
    if (st.tab === "dna") {
      var dnas = getDnaList();
      var vault = loadJson(VAULT_KEY, []);
      html =
        '<div style="font-size:12.5px;font-weight:900;color:#fde68a;margin-bottom:6px;">🎭 بصمة الشخصية الثابتة (تُحقَن تلقائياً في كل برومبت Google Flow):</div>' +
        '<div style="display:flex;flex-direction:column;gap:7px;margin-bottom:14px;">' + dnas.map(function (d, i) {
          return '<div style="padding:9px 11px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid ' + (st.dnaId === d.id ? '#34d399' : 'rgba(255,255,255,0.12)') + ';">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;"><strong style="font-size:12px;">' + esc(d.name) + '</strong><button type="button" data-use-dna="' + esc(d.id) + '" style="padding:4px 9px;border-radius:8px;background:#0284c7;color:#fff;border:none;font-size:10.5px;font-weight:900;cursor:pointer;">' + (st.dnaId === d.id ? '✅ مفعّلة' : 'اختيار') + '</button></div>' +
            '<div dir="ltr" style="font-size:11px;color:#cbd5e1;text-align:left;">' + esc(d.prompt) + '</div>' +
          '</div>';
        }).join("") + '</div>' +
        '<div style="font-size:12.5px;font-weight:900;color:#6ee7b7;margin-bottom:6px;">⭐ خزنة برومبتاتي الناجحة (' + vault.length + '):</div>' +
        (!vault.length ? '<div style="font-size:11.5px;color:#94a3b8;">اضغط «⭐ حفظ للخزنة» على أي مشهد ناجح ليُحفظ هنا.</div>' :
          vault.slice(0, 15).map(function (v, idx) {
            return '<div style="padding:8px 10px;border-radius:11px;background:rgba(255,255,255,0.04);margin-bottom:6px;display:flex;justify-content:space-between;gap:8px;align-items:center;">' +
              '<span style="font-size:11.5px;">' + esc(v.title) + '</span>' +
              '<button type="button" data-copy-vault="' + idx + '" style="padding:4px 9px;border-radius:8px;background:#f59e0b;color:#020617;border:none;font-size:10.5px;font-weight:900;cursor:pointer;">📋 نسخ</button>' +
            '</div>';
          }).join(""));
    }

    // TAB 6: Performance Tracker & Bio Page
    if (st.tab === "perf") {
      var logs = loadJson(PERF_KEY, []);
      var totals = {};
      logs.forEach(function (l) { totals[l.cat] = (totals[l.cat] || 0) + (Number(l.views) || 0); });
      var bestCat = Object.keys(totals).sort(function (a, b) { return totals[b] - totals[a]; })[0] || "";
      html =
        '<div style="display:grid;grid-template-columns:2fr 1.2fr 1fr auto;gap:7px;margin-bottom:10px;">' +
          '<input id="pfTitle" placeholder="عنوان الحلقة المنشورة" style="' + inp + '">' +
          '<input id="pfCat" value="' + esc(st.subject) + '" placeholder="التصنيف" style="' + inp + '">' +
          '<input id="pfViews" type="number" placeholder="المشاهدات" style="' + inp + '">' +
          '<button type="button" id="pfAddBtn" style="padding:8px 12px;border-radius:10px;background:#10b981;color:#020617;border:none;font-size:11.5px;font-weight:900;cursor:pointer;">➕ حفظ</button>' +
        '</div>' +
        (bestCat ? '<div style="padding:9px 12px;border-radius:12px;background:rgba(16,185,129,0.16);border:1px solid rgba(52,211,153,0.4);font-size:12px;font-weight:900;color:#6ee7b7;margin-bottom:10px;">🏆 أقوى محتوى يحقق مشاهدات لجمهورك حالياً: ' + esc(bestCat) + ' (' + totals[bestCat] + ' مشاهدة)</div>' : '') +
        '<div style="margin-bottom:10px;"><a href="?bio=1" target="_blank" style="display:inline-block;padding:8px 14px;border-radius:11px;background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;text-decoration:none;font-size:12px;font-weight:900;">🔗 فتح صفحة البايو الرسمية (?bio=1)</a></div>' +
        logs.slice(0, 20).map(function (l) {
          return '<div style="padding:8px 10px;border-radius:11px;background:rgba(255,255,255,0.05);margin-bottom:6px;display:flex;justify-content:space-between;font-size:11.5px;"><span>' + esc(l.title) + ' (' + esc(l.cat) + ')</span><strong style="color:#fde68a;">👁️ ' + esc(l.views) + '</strong></div>';
        }).join("");
    }

    body.innerHTML = tabsHtml + commonBar + html;

    // Bind Common Inputs
    function syncInputs() {
      var eS = document.getElementById("spSubj"); if (eS) st.subject = eS.value;
      var eG = document.getElementById("spGrade"); if (eG) st.grade = eG.value;
      var eR = document.getElementById("spRatio"); if (eR) st.ratio = eR.value;
      var eE = document.getElementById("spEp"); if (eE) st.epNum = eE.value;
      var eT = document.getElementById("spTopic"); if (eT) st.topic = eT.value;
      var eD = document.getElementById("spDlgMode"); if (eD) st.dialogueMode = eD.value;
      var eTn = document.getElementById("spTone"); if (eTn) st.tone = eTn.value;
      var eDn = document.getElementById("spDnaSel"); if (eDn) st.dnaId = eDn.value;
      var eLg = document.getElementById("spLang"); if (eLg) st.langMode = eLg.value;
      var ePr = document.getElementById("spPromoChk"); if (ePr) st.addPromo = !!ePr.checked;
      var eTr = document.getElementById("spTransChk"); if (eTr) st.transparentBoard = !!eTr.checked;
      var ePs = document.getElementById("spPresetSel"); if (ePs) st.preset = ePs.value;
      var eWm = document.getElementById("spWmChk"); if (eWm) st.watermark = !!eWm.checked;
    }

    body.querySelectorAll("[data-sp-tab]").forEach(function (b) {
      b.onclick = function () { syncInputs(); st.tab = b.getAttribute("data-sp-tab"); renderModal(); };
    });

    // Tab 1 bindings
    var gSc = document.getElementById("spGenScenesBtn");
    if (gSc) gSc.onclick = function () { syncInputs(); generate10SecScenes(); };
    var tBtn = document.getElementById("spTeleBtn");
    if (tBtn) tBtn.onclick = function () { syncInputs(); openTeleprompter(); };
    var sBtn = document.getElementById("spSrtBtn");
    if (sBtn) sBtn.onclick = function () { syncInputs(); downloadSrtFile(); };
    var recB = document.getElementById("spRecVidBtn");
    if (recB) recB.onclick = function () { syncInputs(); recordInstantSlidesVideo(); };
    var kitB = document.getElementById("spKitBtn");
    if (kitB) kitB.onclick = function () {
      syncInputs();
      if (!st.scenes.length) { toast("⚠️ ولّد المشاهد أولاً", "warn"); return; }
      var txt = "=== حقيبة الحلقة #" + st.epNum + " — " + st.topic + " ===\n\n" + st.scenes.map(buildFlowPrompt).join("\n\n---\n\n");
      var blob = new Blob(["\uFEFF" + txt], { type: "text/plain;charset=utf-8" });
      var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "EduTech_EpisodeKit_Ep" + st.epNum + ".txt"; a.click();
      downloadSrtFile();
      toast("📦 تم تصدير ملف برومبتات Flow + ملف الترجمة SRT ✓", "success");
    };
    var tgB = document.getElementById("spTgBtn");
    if (tgB) tgB.onclick = function () {
      syncInputs();
      var postTxt = "🎓 " + (st.topic || st.subject) + " (" + st.grade + ")\n\n" + (st.scenes.map(function (x) { return "• " + x.dialogue; }).join("\n") || "") + "\n\n🌐 جرّب منصة EduTech Mindset:\nhttps://edutech-mindset.pages.dev";
      getToken().then(function (tok) {
        return fetch("/api/telegram", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: tok, text: postTxt }) }).then(function (r) { return r.json(); });
      }).then(function (r) {
        if (r && r.ok) toast("✈️ تم النشر مباشرة إلى قناة تليجرام ✓", "success");
        else toast("⚠️ " + ((r && r.error) || "اضبط رمز بوت تليجرام من الإعدادات"), "warn");
      });
    };

    body.querySelectorAll("[data-sc-copy]").forEach(function (b) {
      b.onclick = function () { copyStr(buildFlowPrompt(st.scenes[Number(b.getAttribute("data-sc-copy"))]), "برومبت Google Flow"); };
    });
    body.querySelectorAll("[data-sc-board]").forEach(function (b) {
      b.onclick = function () {
        syncInputs();
        var sc = st.scenes[Number(b.getAttribute("data-sc-board"))];
        var c = drawCoverCanvas({ kind: "board", badge: "المشهد " + sc.num + " • " + sc.time, title: sc.title, body: sc.board || sc.dialogue, ratio: st.ratio, transparent: st.transparentBoard }, null);
        downloadCanvas(c, "EduTech_Scene" + sc.num + ".png");
        toast("🖼️ تم تحميل لوح المشهد " + sc.num + " ✓", "success");
      };
    });
    body.querySelectorAll("[data-sc-mp3]").forEach(function (b) {
      b.onclick = function () {
        var sc = st.scenes[Number(b.getAttribute("data-sc-mp3"))];
        downloadSceneMp3(sc.dialogue || sc.title, "EduTech_Ep" + st.epNum + "_Scene" + sc.num + ".mp3");
      };
    });
    body.querySelectorAll("[data-sc-star]").forEach(function (b) {
      b.onclick = function () {
        var sc = st.scenes[Number(b.getAttribute("data-sc-star"))];
        var v = loadJson(VAULT_KEY, []);
        v.unshift({ title: (st.topic || st.subject) + " — مشهد " + sc.num, prompt: buildFlowPrompt(sc) });
        saveJson(VAULT_KEY, v.slice(0, 40));
        toast("⭐ تم الحفظ في خزنة برومبتاتك الناجحة ✓", "success");
      };
    });

    // Tab 2 bindings
    var aiBk = document.getElementById("spAiBookBtn");
    if (aiBk) aiBk.onclick = function () { syncInputs(); generateAiBookCover(); };
    var outB = document.getElementById("spOutroBtn");
    if (outB) outB.onclick = function () { syncInputs(); generateOutroCover(); };
    var clsB = document.getElementById("spClassicBtn");
    if (clsB) clsB.onclick = function () {
      syncInputs();
      var c = drawCoverCanvas({ kind: "classic", title: st.topic || st.subject, body: st.grade + " — شرح مبسّط وتفاعلي", ratio: st.ratio }, null);
      downloadCanvas(c, "EduTech_ClassicCover.png"); toast("🖼️ تم تحميل الغلاف التقليدي ✓", "success"); renderModal();
    };
    var carB = document.getElementById("spCarouselBtn");
    if (carB) carB.onclick = function () {
      syncInputs();
      var slides = [
        { k: "book", t: st.topic || st.subject, b: "اسحب لليسار لاكتشاف الخطوات ⬅️" },
        { k: "board", t: "1️⃣ الفكرة الأساسية", b: (st.scenes[0] && st.scenes[0].board) || "افهم القاعدة قبل التطبيق" },
        { k: "board", t: "2️⃣ التطبيق العملي", b: (st.scenes[1] && st.scenes[1].board) || "مثال واضح بخطوات منظمة" },
        { k: "board", t: "3️⃣ نصيحة ذهبية", b: (st.scenes[2] && st.scenes[2].board) || "تدرّب يومياً 10 دقائق على المنصة" },
        { k: "outro", t: "احفظ المنشور وشاركه!", b: "edutech-mindset.pages.dev" }
      ];
      slides.forEach(function (sl, i) {
        setTimeout(function () { downloadCanvas(drawCoverCanvas({ kind: sl.k, title: sl.t, body: sl.b, ratio: "9:16" }, null), "EduTech_Carousel_" + (i + 1) + ".png"); }, i * 250);
      });
      toast("🎨 جارٍ تنزيل 5 شرائح كاروسيل جاهزة ✓", "success");
    };
    var stB = document.getElementById("spStoriesBtn");
    if (stB) stB.onclick = function () {
      syncInputs();
      [
        { b: "❓ تحدّي اليوم", t: "اختبر نفسك في: " + (st.topic || st.subject), d: "A) الخيار الأول   •   B) الخيار الثاني   •   C) الخيار الثالث" },
        { b: "✅ الإجابة والشرح", t: "الحل الصحيح بوضوح!", d: (st.scenes[1] && st.scenes[1].dialogue) || "التطبيق الصحيح للقاعدة يعطيك الإجابة الدقيقة فوراً" },
        { b: "🚀 جرّب الآن", t: "تدرّب مجاناً على EduTech Mindset", d: "رابط المنصة في البايو: edutech-mindset.pages.dev" }
      ].forEach(function (x, i) {
        setTimeout(function () { downloadCanvas(drawCoverCanvas({ kind: "board", badge: x.b, title: x.t, body: x.d, ratio: "9:16" }, null), "EduTech_Story_" + (i + 1) + ".png"); }, i * 250);
      });
      toast("📱 تم توليد 3 ستوريات تحدّي (9:16) ✓", "success");
    };
    var splB = document.getElementById("spSplitBtn");
    if (splB) splB.onclick = function () {
      syncInputs();
      var c = drawCoverCanvas({ kind: "split", badge: "⚡ مقارنة سريعة — " + (st.topic || st.subject), ratio: st.ratio }, null);
      downloadCanvas(c, "EduTech_RightVsWrong.png"); toast("⚡ تم تحميل بطاقة صح/خطأ ✓", "success"); renderModal();
    };
    var puzB = document.getElementById("spPuzzleBtn");
    if (puzB) puzB.onclick = function () {
      syncInputs();
      var c = drawCoverCanvas({ kind: "board", badge: "🧩 لغز اليوم — 90% يخطئون فيه!", title: "هل يمكنك الحل في 10 ثوانٍ؟", body: (st.topic || "مسألة تحدّي ذكية") + "\nاكتب إجابتك في التعليقات 👇", ratio: st.ratio }, null);
      downloadCanvas(c, "EduTech_DailyPuzzle.png"); toast("🧩 تم تحميل بطاقة اللغز اليومي ✓", "success"); renderModal();
    };
    var chtB = document.getElementById("spCheatBtn");
    if (chtB) chtB.onclick = function () {
      syncInputs();
      var c = drawCoverCanvas({ kind: "book", badge: "🃏 احفظ هذه الصورة قبل الامتحان!", title: "ملخص ذهبي: " + (st.topic || st.subject), body: (st.scenes.map(function (s) { return "• " + s.board; }).slice(0, 3).join("\n")) || "أهم القوانين والخطوات في بطاقة واحدة", ratio: "9:16" }, null);
      downloadCanvas(c, "EduTech_CheatSheet.png"); toast("🃏 تم تحميل بطاقة الملخص للحفظ ✓", "success"); renderModal();
    };
    var prmB = document.getElementById("spPromoBtn");
    if (prmB) prmB.onclick = function () {
      syncInputs();
      var c = drawCoverCanvas({ kind: "book", badge: "🔥 عرض الإطلاق — EduTech Mindset", title: st.topic || "باقات الذكاء الاصطناعي للمعلمين والطلاب", body: "باقة الطالب 15₪ • المعلم 30₪ • الشاملة VIP 60₪\nسجّل الآن عبر edutech-mindset.pages.dev", ratio: st.ratio }, null);
      downloadCanvas(c, "EduTech_PromoCard.png"); toast("📣 تم تحميل بطاقة الإعلان ✓", "success"); renderModal();
    };
    var shtB = document.getElementById("spShoutBtn");
    if (shtB) shtB.onclick = function () {
      syncInputs();
      var nm = prompt("🏅 اكتب اسم الطالب أو المعلم المكرّم:", "الطالب المبدع");
      if (!nm) return;
      var c = drawCoverCanvas({ kind: "book", badge: "🏅 تكريم نجم الأسبوع — EduTech Mindset", title: nm, body: "تقديراً لتميّزه وتفوّقه في " + st.subject + " — نفخر بك دوماً!", ratio: st.ratio }, null);
      downloadCanvas(c, "EduTech_Shoutout.png"); toast("🏅 تم تحميل بطاقة التكريم ✓", "success"); renderModal();
    };
    var intB = document.getElementById("spIntroBtn");
    if (intB) intB.onclick = function () {
      syncInputs();
      var c = drawCoverCanvas({ kind: "book", badge: "✨ نصنع الأمل بالعلم من غزة 🇵🇸", title: "EduTech Mindset", body: "عقلية التعليم والتكنولوجيا — إشراف أ. باسل أشرف الفقعاوي", ratio: st.ratio }, null);
      downloadCanvas(c, "EduTech_3SecIntro.png"); toast("🎬 تم تحميل بطاقة مقدمة القناة ✓", "success"); renderModal();
    };

    // Tab 3 bindings
    var rep5 = document.getElementById("spRep5Btn");
    if (rep5) rep5.onclick = function () {
      syncInputs();
      if (!st.topic.trim()) { toast("⚠️ اكتب الموضوع بالأعلى أولاً", "warn"); return; }
      toast("🔄 جارٍ التوليد لـ 5 منصات + مقياس الخطّاف…", "info");
      callAI("حول هذا الموضوع التعليمي (" + st.topic + " — " + st.subject + ") إلى حزمة سوشيال شاملة:\n1- تقييم قوة الفكرة من 100 + 3 خطّافات فيروسية لأول 3 ثوانٍ.\n2- منشور فيسبوك احترافي طويل.\n3- رسالة واتساب مختصرة لمجموعات المعلمين/الطلاب.\n4- بوست تليجرام مع هاشتاقات فلسطين.\n5- سؤال تفاعلي للتعليقات + 3 ردود ذكية جاهزة على تعليقات المتابعين.").then(function (r) {
        st.repurposeText = (r && r.text) || "تعذّر التوليد";
        renderModal();
      });
    };
    var waC = document.getElementById("spWaCapBtn");
    if (waC) waC.onclick = function () {
      syncInputs();
      var txt = st.scenes.length ? st.scenes.map(function (s) { return s.dialogue; }).join(" ") : ("أَهْلاً بِكُمْ فِي كَبْسُولَةِ إِيدُوتِكْ مَاينْدْسِيتْ السَّرِيعَةِ حَوْلَ: " + (st.topic || st.subject));
      downloadSceneMp3(txt, "EduTech_WhatsApp_Capsule.mp3");
    };
    var cmGo = document.getElementById("spCommentGo");
    if (cmGo) cmGo.onclick = function () {
      syncInputs();
      var q = (document.getElementById("spCommentIn").value || "").trim();
      if (!q) { toast("⚠️ الصق سؤال المتابع أولاً", "warn"); return; }
      downloadCanvas(drawCoverCanvas({ kind: "board", badge: "💬 سؤال متابع — ردّ سريع", title: q, body: "الإجابة في هذا الفيديو 👇", ratio: "9:16" }, null), "EduTech_CommentCard.png");
      st.topic = "رد على سؤال متابع: " + q;
      st.tab = "scenes";
      generate10SecScenes();
    };

    // Tab 4 bindings
    var g7 = document.getElementById("spGen7Btn");
    if (g7) g7.onclick = function () {
      syncInputs();
      toast("🗓️ جارٍ بناء خطة 7 حلقات مترابطة…", "info");
      callAI("اقترح 7 عناوين حلقات فيديو تعليمية مترابطة لأسبوع كامل حول (" + (st.topic || st.subject) + " — " + st.grade + "). اكتب كل عنوان في سطر مستقل بدون مقدمات.").then(function (r) {
        var lines = String((r && r.text) || "").split(/\n+/).map(function (x) { return x.replace(/^[\d\-\.\*\s]+/, "").trim(); }).filter(Boolean).slice(0, 7);
        st.seriesList = lines;
        renderModal();
      });
    };
    body.querySelectorAll("[data-season]").forEach(function (b) {
      b.onclick = function () { st.topic = b.getAttribute("data-season"); st.tab = "scenes"; renderModal(); generate10SecScenes(); };
    });
    body.querySelectorAll("[data-pick-ep]").forEach(function (b) {
      b.onclick = function () {
        var i = Number(b.getAttribute("data-pick-ep"));
        st.topic = st.seriesList[i]; st.epNum = String(i + 1).padStart(2, "0"); st.tab = "scenes"; renderModal(); generate10SecScenes();
      };
    });

    // Tab 5 bindings
    body.querySelectorAll("[data-use-dna]").forEach(function (b) {
      b.onclick = function () { st.dnaId = b.getAttribute("data-use-dna"); toast("🎭 تم تفعيل بصمة الشخصية ✓", "success"); renderModal(); };
    });
    body.querySelectorAll("[data-copy-vault]").forEach(function (b) {
      b.onclick = function () { var v = loadJson(VAULT_KEY, [])[Number(b.getAttribute("data-copy-vault"))]; if (v) copyStr(v.prompt, "البرومبت المحفوظ"); };
    });

    // Tab 6 bindings
    var pfAdd = document.getElementById("pfAddBtn");
    if (pfAdd) pfAdd.onclick = function () {
      var ti = (document.getElementById("pfTitle").value || "").trim();
      var ca = (document.getElementById("pfCat").value || st.subject).trim();
      var vw = Number(document.getElementById("pfViews").value) || 0;
      if (!ti) return;
      var arr = loadJson(PERF_KEY, []);
      arr.unshift({ title: ti, cat: ca, views: vw, date: new Date().toLocaleDateString("ar-EG") });
      saveJson(PERF_KEY, arr.slice(0, 60));
      toast("📈 تم تسجيل أداء الحلقة ✓", "success");
      renderModal();
    };
  }

  function openModal(initialTab) {
    if (initialTab) st.tab = initialTab;
    var old = document.getElementById("v287SocialProModal");
    if (old) old.remove();
    var m = document.createElement("div");
    m.id = "v287SocialProModal";
    m.style.cssText = "position:fixed;inset:0;z-index:2147483270;background:rgba(2,6,23,0.84);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:10px;direction:rtl;";
    m.innerHTML =
      '<div style="width:min(97vw,960px);max-height:93vh;display:flex;flex-direction:column;border-radius:26px;background:linear-gradient(155deg,#020617,#0f172a,#1e1b4b);color:#fff;border:1.5px solid rgba(249,115,22,0.5);box-shadow:0 26px 70px rgba(0,0,0,0.68);overflow:hidden;">' +
        '<div style="padding:13px 16px;border-bottom:1px solid rgba(255,255,255,0.12);display:flex;justify-content:space-between;align-items:center;gap:8px;">' +
          '<div><div style="font-size:15.5px;font-weight:900;color:#fdba74;">🎬 استوديو السوشيال ميديا PRO (Google Flow & Gemini — v1.0.1)</div><div style="font-size:11px;color:#cbd5e1;">مشاهد 10 ثوانٍ للرياضيات وجميع المواد + غلاف كتاب AI + غلاف ختامي QR + كاروسيل + ستوريات + SRT</div></div>' +
          '<button type="button" id="v287SpClose" style="width:32px;height:32px;border-radius:10px;background:rgba(244,63,94,0.22);color:#fda4af;border:1px solid rgba(244,63,94,0.4);font-weight:900;cursor:pointer;">✕</button>' +
        '</div>' +
        '<div id="v287SocialBody" style="padding:13px 15px;overflow-y:auto;flex:1;"></div>' +
      '</div>';
    document.body.appendChild(m);
    document.getElementById("v287SpClose").onclick = function () { m.remove(); };
    m.addEventListener("click", function (ev) { if (ev.target === m) m.remove(); });
    renderModal();
  }

  global.EduSocialPro = { open: openModal };
})(window);
