/* ============================================================================
 * EduTech Mindset — v286 Palestinian Arabic Math Engine (Display + Speech)
 * 1) محرك نطق الرياضيات بأسلوب شرح المعلم العربي الفلسطيني (toSpeech)
 * 2) محرك عرض المعادلات الاحترافي بـ KaTeX المحلي (أوفلاين 100% وحماية اتجاه RTL)
 * ============================================================================ */
(function (global) {
  "use strict";

  var katexLoading = null;
  var katexReady = false;
  var mathCssInjected = false;

  // ==========================================================================
  // 1) محوّل الرياضيات الشامل إلى نص عربي فصيح بأسلوب المعلم الفلسطيني
  // ==========================================================================
  function speakFraction(num, den) {
    var n = String(num || "").trim();
    var d = String(den || "").trim();
    if (n === "1" && d === "2") return " نِصْف ";
    if (n === "1" && d === "3") return " ثُلُث ";
    if (n === "2" && d === "3") return " ثُلُثَان ";
    if (n === "1" && d === "4") return " رُبْع ";
    if (n === "3" && d === "4") return " ثَلَاثَةُ أَرْبَاع ";
    if (n === "1" && d === "5") return " خُمْس ";
    if (n === "1" && d === "6") return " سُدْس ";
    if (n === "1" && d === "8") return " ثُمْن ";
    if (n === "1" && d === "10") return " عُشْر ";
    return " الكَسْرُ: " + n + "، عَلَى " + d + " ";
  }

  function convertMathExpressionToArabic(expr) {
    var s = String(expr || "");

    // إزالة أوامر التنسيق في LaTeX التي لا تُنطق
    s = s.replace(/\\(?:left|right|big|Big|bigg|Bigg|displaystyle|textstyle|,|;|!|quad|qquad)\b/g, " ");
    s = s.replace(/\\(?:text|mathrm|mathbf|mathit|operatorname)\s*\{([^{}]*)\}/g, " $1 ");

    // 1) الجذور التكعيبية والنونية والتربيعية
    s = s.replace(/\\sqrt\s*\[\s*3\s*\]\s*\{([^{}]+)\}/g, " الجَذْرُ التَّكْعِيبِيُّ لِـ $1 ");
    s = s.replace(/\\sqrt\s*\[\s*([^{}\]]+)\s*\]\s*\{([^{}]+)\}/g, " الجَذْرُ مِنَ الدَّرَجَةِ $1 لِـ $2 ");
    s = s.replace(/\\sqrt\s*\{([^{}]+)\}/g, " الجَذْرُ التَّرْبِيعِيُّ لِـ $1 ");
    s = s.replace(/∛\s*([0-9٠-٩سصعxy]+)/g, " الجَذْرُ التَّكْعِيبِيُّ لِـ $1 ");
    s = s.replace(/√\s*\(([^()]+)\)/g, " الجَذْرُ التَّرْبِيعِيُّ لِـ $1 ");
    s = s.replace(/√\s*([0-9٠-٩سصعxy]+)/g, " الجَذْرُ التَّرْبِيعِيُّ لِـ $1 ");

    // 2) الكسور (LaTeX \frac ثم الكسور البسيطة a/b)
    for (var pass = 0; pass < 3; pass++) {
      s = s.replace(/\\(?:d|t)?frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, function (_, a, b) {
        return speakFraction(a, b);
      });
    }
    s = s.replace(/(^|[\s(=+\-×÷])(\d+)\s*\/\s*(\d+)(?=[\s)=+\-×÷،.؛]|$)/g, function (_, pre, a, b) {
      return pre + speakFraction(a, b);
    });

    // 3) الدوال المثلثية واللوغاريتمية والتفاضل والتكامل
    s = s.replace(/\\sin\b/g, " جَيْب ")
      .replace(/\\cos\b/g, " جَيْبُ التَّمَامِ ")
      .replace(/\\tan\b/g, " ظِلّ ")
      .replace(/\\cot\b/g, " ظِلُّ التَّمَامِ ")
      .replace(/\\sec\b/g, " قَاطِع ")
      .replace(/\\csc\b/g, " قَاطِعُ التَّمَامِ ")
      .replace(/\\ln\b/g, " اللُّوغَارِيتْمُ الطَّبِيعِيُّ لِـ ")
      .replace(/\\log\b/g, " لُوغَارِيتْم ")
      .replace(/\\lim\b/g, " نِهَايَة ")
      .replace(/\\int\b/g, " تَكَامُل ")
      .replace(/\\sum\b/g, " مَجْمُوع ")
      .replace(/\\pi\b|π/g, " بَاي ")
      .replace(/\\theta\b|θ/g, " ثِيتَا ")
      .replace(/\\alpha\b|α/g, " أَلْفَا ")
      .replace(/\\beta\b|β/g, " بِيتَا ")
      .replace(/\\Delta\b|Δ/g, " دِلْتَا ")
      .replace(/\\infty\b|∞/g, " مَا لَا نِهَايَة ")
      .replace(/\\degree\b|\^\\circ|°/g, " دَرَجَة ");

    // 4) الدوال والرموز الفلسطينية العربية (ق(س)، جا، جتا، ظا، لو، نها)
    s = s.replace(/ق\s*\(\s*س\s*\)/g, " قَافُ سِين ")
      .replace(/ق'\s*\(\s*س\s*\)/g, " مُشْتَقَّةُ قَافِ سِين ")
      .replace(/هـ\s*\(\s*س\s*\)/g, " هَاءُ سِين ")
      .replace(/(^|[\s(=+\-])جا(?=[\s(سصع0-9]|$)/g, "$1 جَيْب ")
      .replace(/(^|[\s(=+\-])جتا(?=[\s(سصع0-9]|$)/g, "$1 جَيْبُ التَّمَامِ ")
      .replace(/(^|[\s(=+\-])ظا(?=[\s(سصع0-9]|$)/g, "$1 ظِلّ ")
      .replace(/(^|[\s(=+\-])نها(?=[\s_]|$)/g, "$1 نِهَايَة ");

    // 5) الأسس والقوى (^2، ^3، ^{n}، ²، ³)
    s = s.replace(/\^\s*\{\s*2\s*\}|\^2\b|²/g, " تَرْبِيع ")
      .replace(/\^\s*\{\s*3\s*\}|\^3\b|³/g, " تَكْعِيب ")
      .replace(/\^\s*\{([^{}]+)\}/g, " أُسَّ $1 ")
      .replace(/\^\s*(-?\d+)/g, " أُسَّ $1 ");

    // 6) الأدلة السفلية (س_1، ص_2)
    s = s.replace(/([سصعxy])\s*_\s*\{?\s*1\s*\}?/gi, "$1 وَاحِد ")
      .replace(/([سصعxy])\s*_\s*\{?\s*2\s*\}?/gi, "$1 اثْنَيْنِ ")
      .replace(/([سصعxy])\s*_\s*\{?\s*([0-9]+)\s*\}?/gi, "$1 $2 ");

    // 7) معاملات المتغيرات الملتصقة مثل 2س أو 3x -> 2 سين
    s = s.replace(/(\d+)\s*س(?![\u0600-\u06FF])/g, "$1 سِين ")
      .replace(/(\d+)\s*ص(?![\u0600-\u06FF])/g, "$1 صَاد ")
      .replace(/(\d+)\s*ع(?![\u0600-\u06FF])/g, "$1 عَيْن ")
      .replace(/(\d+)\s*x(?![a-zA-Z])/g, "$1 سِين ")
      .replace(/(\d+)\s*y(?![a-zA-Z])/g, "$1 صَاد ");

    // المتغيرات المفردة في المعادلات
    s = s.replace(/(^|[\s(=+\-×÷،])س(?=[\s)=+\-×÷،.]|$)/g, "$1 سِين ")
      .replace(/(^|[\s(=+\-×÷،])ص(?=[\s)=+\-×÷،.]|$)/g, "$1 صَاد ")
      .replace(/(^|[\s(=+\-×÷،])ع(?=[\s)=+\-×÷،.]|$)/g, "$1 عَيْن ")
      .replace(/(^|[\s(=+\-×÷،])x(?=[\s)=+\-×÷،.]|$)/g, "$1 سِين ")
      .replace(/(^|[\s(=+\-×÷،])y(?=[\s)=+\-×÷،.]|$)/g, "$1 صَاد ")
      .replace(/(^|[\s(=+\-×÷،])z(?=[\s)=+\-×÷،.]|$)/g, "$1 عَيْن ");

    // 8) العمليات والعلاقات الرياضية
    s = s.replace(/\\Rightarrow|⇒|=>/g, " إِذَنْ ")
      .replace(/\\Leftrightarrow|⇔/g, " إِذَا وَفَقَطْ إِذَا ")
      .replace(/\\to|→/g, " يَؤُولُ إِلَى ")
      .replace(/\\neq|≠|!=/g, " لَا يُسَاوِي ")
      .replace(/\\leq|\\le|≤|<=/g, " أَصْغَرُ مِنْ أَوْ يُسَاوِي ")
      .replace(/\\geq|\\ge|≥|>=/g, " أَكْبَرُ مِنْ أَوْ يُسَاوِي ")
      .replace(/\\approx|≈/g, " يُسَاوِي تَقْرِيباً ")
      .replace(/\\pm|±/g, " زَائِد أَوْ نَاقِص ")
      .replace(/\\times|\\cdot|×|\*/g, " ضَرْب ")
      .replace(/\\div|÷/g, " تَقْسِيم ")
      .replace(/=/g, " يُسَاوِي ")
      .replace(/</g, " أَصْغَرُ مِنْ ")
      .replace(/>/g, " أَكْبَرُ مِنْ ")
      .replace(/\+/g, " زَائِد ")
      .replace(/%/g, " بِالمِئَة ");

    // التمييز بين السالب (مثل -5 أو يساوي -3) والناقص (مثل 8 - 3)
    s = s.replace(/(^|[(،:]\s*|يُسَاوِي\s+|ضَرْب\s+|تَقْسِيم\s+|زَائِد\s+)[\-−]\s*(\d+)/g, "$1 سَالِبُ $2 ")
      .replace(/[\-−]/g, " نَاقِص ");

    // الفواصل العشرية (3.5 -> 3 فاصلة 5)
    s = s.replace(/(\d+)\.(\d+)/g, "$1 فَاصِلَة $2");

    // تنظيف الأقواس المتبقية وعلامات LaTeX
    s = s.replace(/[{}]/g, " ").replace(/\\([a-zA-Z]+)/g, " ");
    return s;
  }

  function toSpeech(rawText) {
    var s = String(rawText || "");
    if (!s.trim()) return "";

    // 1) تحويل كتل LaTeX ($$...$$ و $...$ و \[...\] و \(...\)) بدقة عالية أولاً
    s = s.replace(/\$\$([\s\S]+?)\$\$/g, function (_, inner) {
      return " ، " + convertMathExpressionToArabic(inner) + " ، ";
    });
    s = s.replace(/\\\[([\s\S]+?)\\\]/g, function (_, inner) {
      return " ، " + convertMathExpressionToArabic(inner) + " ، ";
    });
    s = s.replace(/\\\(([\s\S]+?)\\\)/g, function (_, inner) {
      return " " + convertMathExpressionToArabic(inner) + " ";
    });
    s = s.replace(/\$([^$\n]+?)\$/g, function (_, inner) {
      return " " + convertMathExpressionToArabic(inner) + " ";
    });

    // 2) تحويل أي رموز رياضية مكتوبة خارج علامات $ في النص العربي العادي
    if (/[=+\-×÷√²³≤≥≠≈±∞%]|\\\w+|(\d+\/\d+)|(\d+\.\d+)|\b[سصع]\^[0-9]/.test(s)) {
      s = convertMathExpressionToArabic(s);
    }

    return s.replace(/\s{2,}/g, " ").trim();
  }

  // ==========================================================================
  // 2) محرك عرض الرياضيات بـ KaTeX المحلي (أوفلاين 100% + حماية اتجاه RTL)
  // ==========================================================================
  function injectMathCss() {
    if (mathCssInjected) return;
    mathCssInjected = true;
    var st = document.createElement("style");
    st.id = "v286ArabicMathStyle";
    st.textContent =
      ".katex, .katex-display { direction: ltr !important; unicode-bidi: isolate !important; }" +
      ".katex-display { overflow-x: auto; overflow-y: hidden; padding: 6px 4px; margin: 10px 0 !important; text-align: center; }" +
      ".katex { font-size: 1.08em !important; }";
    document.head.appendChild(st);
  }

  function ensureKatexLoaded() {
    if (katexReady && global.renderMathInElement) return Promise.resolve(true);
    if (katexLoading) return katexLoading;
    injectMathCss();

    katexLoading = new Promise(function (resolve) {
      if (!document.getElementById("v286KatexCss")) {
        var lnk = document.createElement("link");
        lnk.id = "v286KatexCss";
        lnk.rel = "stylesheet";
        lnk.href = "assets/katex/katex.min.css?v=286";
        document.head.appendChild(lnk);
      }
      function loadAutoRender() {
        if (global.renderMathInElement) { katexReady = true; resolve(true); return; }
        var s2 = document.createElement("script");
        s2.src = "assets/katex/auto-render.min.js?v=286";
        s2.onload = function () { katexReady = true; resolve(true); };
        s2.onerror = function () { resolve(false); };
        document.body.appendChild(s2);
      }
      if (global.katex) { loadAutoRender(); return; }
      var s1 = document.createElement("script");
      s1.src = "assets/katex/katex.min.js?v=286";
      s1.onload = loadAutoRender;
      s1.onerror = function () { resolve(false); };
      document.body.appendChild(s1);
    });
    return katexLoading;
  }

  function hasMathSyntax(text) {
    if (!text || text.length < 3) return false;
    return /\$\$[\s\S]+?\$\$|\$[^$\n]+\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)/.test(text);
  }

  function renderIn(rootEl) {
    var target = rootEl || document.body;
    if (!target || !hasMathSyntax(target.textContent || "")) return;
    ensureKatexLoaded().then(function (ok) {
      if (!ok || typeof global.renderMathInElement !== "function") return;
      try {
        global.renderMathInElement(target, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\[", right: "\\]", display: true },
            { left: "\\(", right: "\\)", display: false }
          ],
          throwOnError: false,
          strict: false,
          ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code", "input", "option"]
        });
      } catch (_) {}
    });
  }

  // مراقب خفيف يعرض تلقائياً أي معادلات جديدة في المساعد الذكي أو الاستوديوهات أو التوجيهي
  var obsTimer = null;
  function startAutoObserver() {
    if (typeof MutationObserver === "undefined" || !document.body) return;
    var obs = new MutationObserver(function (muts) {
      var foundMath = false;
      for (var i = 0; i < muts.length; i++) {
        var added = muts[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var n = added[j];
          if (n && n.nodeType === 1 && !n.classList.contains("katex") && !n.classList.contains("katex-display")) {
            if (hasMathSyntax(n.textContent || "")) { foundMath = true; break; }
          }
        }
        if (foundMath) break;
      }
      if (!foundMath) return;
      if (obsTimer) clearTimeout(obsTimer);
      obsTimer = setTimeout(function () { renderIn(document.body); }, 260);
    });
    obs.observe(document.body, { childList: true, subtree: true });
    setTimeout(function () { renderIn(document.body); }, 1200);
  }

  global.EduArabicMath = {
    toSpeech: toSpeech,
    renderIn: renderIn,
    ensureKatex: ensureKatexLoaded
  };

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startAutoObserver);
    else startAutoObserver();
  }
})(typeof window !== "undefined" ? window : globalThis);
