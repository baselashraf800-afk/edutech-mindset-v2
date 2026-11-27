/* ============================================================================
 * EduTech Mindset v241 — محرك النطق العربي الفصيح الأصيل (ترحيب بصوت معلمة فصيحة + تحميل مسبق + فتح فوري على الجوال)
 * يعمل بسلسلة هجينة: ElevenLabs Flash v2.5 ← Gemini 2.5 Flash TTS ← أفضل صوت عربي فصيح محلي
 * ============================================================================ */
(function (global) {
  "use strict";

  var VOICE_POL_KEY = "edu_voice_policy_v237";
  var DEFAULT_VOICE_POL = { sourceMode: "hybrid", ttsProvider: "auto", rate: 1.0, autoGender: true, welcomeEnabled: true, musicEnabled: true, musicDelaySec: 60, musicVol: 0.25, musicUrl: "" };
  var voicePol = Object.assign({}, DEFAULT_VOICE_POL);

  function loadVoicePol() {
    try {
      var p = JSON.parse(localStorage.getItem(VOICE_POL_KEY) || "null");
      if (p && typeof p === "object") voicePol = Object.assign({}, DEFAULT_VOICE_POL, p);
    } catch (e) {}
  }
  function saveVoicePol(next) {
    voicePol = Object.assign({}, DEFAULT_VOICE_POL, next || {});
    try { localStorage.setItem(VOICE_POL_KEY, JSON.stringify(voicePol)); } catch (e) {}
    if (window.Cloud && window.Cloud.enabled && typeof window.Cloud.saveVoicePolicy === "function") {
      return window.Cloud.saveVoicePolicy(voicePol);
    }
    return Promise.resolve();
  }
  loadVoicePol();

  // عنصر صوت وحيد مُهيّأ لتجاوز حظر التشغيل التلقائي على متصفحات الجوال (Chrome/Safari)
  var sharedAudio = null;
  var audioUnlocked = false;
  var currentObjectUrl = null;
  var speaking = false;
  var playToken = 0;
  var lastProvider = "ready";
  var cachedVoices = [];
  var preloadedWelcomeBlob = null;
  var preloadingWelcome = false;

  // نص ترحيب قصير مشكول بالكامل لنطق عربي فصيح سليم بصوت معلمة
  var WELCOME_TEXT = "أَهْلاً بِكَ فِي مَنَصَّةِ إِيدُوتِكْ مَاينْدْسِيت، رَفِيقِكَ الذَّكِيِّ لِلتَّعْلِيمِ وَالإِبْدَاعِ مِنْ قَلْبِ غَزَّة!";

  function getSharedAudio() {
    if (!sharedAudio) {
      sharedAudio = new Audio();
      sharedAudio.preload = "auto";
      sharedAudio.setAttribute("playsinline", "true");
    }
    return sharedAudio;
  }

  // فتح قناة الصوت متزامناً داخل أول لمسة للمستخدم على الجوال
  function unlockAudio() {
    if (audioUnlocked) return;
    try {
      var a = getSharedAudio();
      a.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
      a.volume = 0.01;
      var pr = a.play();
      if (pr && pr.then) {
        pr.then(function () {
          if (!currentObjectUrl) { a.pause(); }
          a.volume = 1.0;
          audioUnlocked = true;
        }).catch(function () { a.volume = 1.0; });
      }
    } catch (e) {}
  }

  // تحميل أصوات المتصفح مسبقاً لأن أندرويد يعيد قائمة فارغة قبل حدث voiceschanged
  function refreshSystemVoices() {
    if (!("speechSynthesis" in global)) return;
    try {
      var v = global.speechSynthesis.getVoices();
      if (v && v.length) cachedVoices = v;
    } catch (e) {}
  }
  refreshSystemVoices();
  if ("speechSynthesis" in global && typeof global.speechSynthesis.addEventListener === "function") {
    try { global.speechSynthesis.addEventListener("voiceschanged", refreshSystemVoices); } catch (e) {}
  }

  function stop() {
    playToken++;
    speaking = false;
    if (sharedAudio) {
      try { sharedAudio.pause(); sharedAudio.currentTime = 0; } catch (e) {}
    }
    if (currentObjectUrl) {
      try { URL.revokeObjectURL(currentObjectUrl); } catch (e) {}
      currentObjectUrl = null;
    }
    if ("speechSynthesis" in global) {
      try { global.speechSynthesis.cancel(); } catch (e) {}
    }
    syncWelcomeBtn(false);
  }

  function numToArabicWord(n) {
    var num = parseInt(n, 10);
    if (isNaN(num) || num < 0 || num > 999) return String(n);
    var ones = ["صِفْرٌ", "وَاحِدٌ", "اثْنَانِ", "ثَلَاثَةٌ", "أَرْبَعَةٌ", "خَمْسَةٌ", "سِتَّةٌ", "سَبْعَةٌ", "ثَمَانِيَةٌ", "تِسْعَةٌ"];
    var teens = ["عَشَرَةٌ", "أَحَدَ عَشَرَ", "اثْنَا عَشَرَ", "ثَلَاثَةَ عَشَرَ", "أَرْبَعَةَ عَشَرَ", "خَمْسَةَ عَشَرَ", "سِتَّةَ عَشَرَ", "سَبْعَةَ عَشَرَ", "ثَمَانِيَةَ عَشَرَ", "تِسْعَةَ عَشَرَ"];
    var tens = ["", "", "عِشْرُونَ", "ثَلَاثُونَ", "أَرْبَعُونَ", "خَمْسُونَ", "سِتُّونَ", "سَبْعُونَ", "ثَمَانُونَ", "تِسْعُونَ"];
    var hunds = ["", "مئة", "مئتان", "ثلاثمئة", "أربعمئة", "خمسمئة", "ستمئة", "سبعمئة", "ثمانمئة", "تسعمئة"];
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
      var u = num % 10, t = Math.floor(num / 10);
      return u ? (ones[u] + " و" + tens[t]) : tens[t];
    }
    var h = Math.floor(num / 100), rem = num % 100;
    return rem ? (hunds[h] + " و" + numToArabicWord(rem)) : hunds[h];
  }

  function cleanSpeechText(text) {
    var s = String(text || "");
    // v286: تحويل المعادلات والكسور والجذور والرموز الرياضية لنطق المعلم العربي الفلسطيني
    if (global.EduArabicMath && typeof global.EduArabicMath.toSpeech === "function") {
      try { s = global.EduArabicMath.toSpeech(s); } catch (_) {}
    }
    // تحويل إيموجي الترقيم إلى كلمات عربية واضحة قبل إزالة الإيموجي
    s = s.replace(/1️⃣/g, " أَوَّلاً: ")
      .replace(/2️⃣/g, " ثَانِياً: ")
      .replace(/3️⃣/g, " ثَالِثاً: ")
      .replace(/4️⃣/g, " رَابِعاً: ")
      .replace(/5️⃣/g, " خَامِساً: ")
      .replace(/6️⃣/g, " سَادِساً: ");

    // إزالة الروابط وبقية الإيموجي
    s = s.replace(/https?:\/\/\S+/g, " ")
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F]/gu, " ");

    // مصطلحات كيميائية وفيزيائية شائعة
    s = s.replace(/H[₂2]O/g, " إتش تو أو ")
      .replace(/CO[₂2]/g, " ثاني أكسيد الكربون ")
      .replace(/m\/s[²2]/gi, " متر لكل ثانية تربيع ")
      .replace(/m\/s/gi, " متر لكل ثانية ")
      .replace(/km\/h/gi, " كيلومتر في الساعة ")
      .replace(/°[Ccم]/g, " درجة مئوية ");

    // المتغيرات ذات الأدلة السفلية (س₁ ، س₂ ، ص₁ ، ص₂)
    s = s.replace(/س[₁1]/g, " سِينُ وَاحِدٍ ")
      .replace(/س[₂2]/g, " سِينُ اثْنَيْنِ ")
      .replace(/س[₃3]/g, " سين ثلاثة ")
      .replace(/ص[₁1]/g, " صاد واحد ")
      .replace(/ص[₂2]/g, " صاد اثنان ")
      .replace(/ع[₁1]/g, " عين واحد ")
      .replace(/ع[₂2]/g, " عين اثنان ");

    // تحويل أقواس مجموعة الحل { 3 ، 2 }
    s = s.replace(/\{\s*([^}]+)\s*\}/g, function (_, inner) {
      return " المَجْمُوعَةُ " + inner.replace(/[،,]/g, " و ") + " ";
    });

    // الرموز اليونانية والرياضية
    s = s.replace(/Δ/g, " دِلْتَا ")
      .replace(/π/g, " بَاي ")
      .replace(/Ω/g, " أُومٍ ")
      .replace(/θ/g, " ثيتا ")
      .replace(/α/g, " ألفا ")
      .replace(/β/g, " بيتا ")
      .replace(/λ/g, " لامدا ")
      .replace(/≠/g, " لا يساوي ")
      .replace(/≤/g, " أصغر من أو يساوي ")
      .replace(/≥/g, " أكبر من أو يساوي ")
      .replace(/</g, " أصغر من ")
      .replace(/>/g, " أكبر من ")
      .replace(/\^2|²/g, " تَرْبِيعٌ ")
      .replace(/\^3|³/g, " تَكْعِيبٌ ")
      .replace(/√/g, " الجَذْرُ التَّرْبِيعِيُّ لِـ ")
      .replace(/×/g, " ضَرْبَ ")
      .replace(/÷/g, " تَقْسِيمَ ")
      .replace(/\+/g, " زَائِدَ ")
      .replace(/%/g, " بالمئة ");

    // التفريق الذكي بين «سالب» (بعد = أو بداية أو فاصلة) و«ناقص» (بين حدّين)
    s = s.replace(/(=|،|,|:|\(|^)\s*-\s*([0-9\u0660-\u0669]+)/g, "$1 سَالِبَ $2 ")
      .replace(/\s+-\s+/g, " نَاقِصَ ")
      .replace(/([0-9\u0660-\u0669])\s*-\s*([0-9\u0660-\u0669])/g, "$1 ناقص $2 ")
      .replace(/=/g, " يُسَاوِي ")
      .replace(/([0-9\u0660-\u0669])\s*\*\s*([0-9\u0660-\u0669أبجسصع])/g, "$1 ضرب $2 ");

    // المتغيرات العربية المفردة في المعادلات (أ، ب، ج، س، ص) كي تُنطق بأسمائها الكاملة لا كحروف متقطعة
    var varMap = { "أ": "أَلِفٌ", "ب": "بَاءٌ", "ج": "جِيمٌ", "س": "سِينٌ", "ص": "صَادٌ", "ع": "عَيْنٌ", "ن": "نُونٌ", "ك": "كَافٌ", "م": "مِيمٌ" };
    s = s.replace(/(^|[\s،,:(\[])([أبجسصعنكم])(?=\s*(?:يُسَاوِي|زَائِدَ|نَاقِصَ|ضَرْبَ|تَقْسِيمَ|تَرْبِيعٌ|تَكْعِيبٌ|يساوي|زائد|ناقص|ضرب|تقسيم|تربيع|تكعيب|،|,|\)|$))/g, function (_, pre, ch) {
      return pre + " " + varMap[ch] + " ";
    });

    // تفقيط الأرقام (0..999) إلى كلمات عربية صافية لمنع نطقها بالإنجليزية في ElevenLabs
    s = s.replace(/\b([0-9]{1,3})\b/g, function (_, numStr) {
      return " " + numToArabicWord(numStr) + " ";
    });

    // تشكيل المصطلحات التعليمية الشائعة لنطق عربي فصيح واضح بالحركات والتنوين
    s = s.replace(/المعطيات/g, "المُعْطَيَاتُ")
      .replace(/المطلوب/g, "المَطْلُوبُ")
      .replace(/القانون/g, "القَانُونُ")
      .replace(/المميز/g, "المُمَيِّزُ")
      .replace(/معادلة تربيعية/g, "مُعَادَلَةٌ تَرْبِيعِيَّةٌ")
      .replace(/مجموعة الحل/g, "مَجْمُوعَةُ الحَلِّ")
      .replace(/الناتج النهائي/g, "النَّاتِجُ النِّهَائِيُّ")
      .replace(/جذور المعادلة/g, "جُذُورُ المُعَادَلَةِ");

    return s
      .replace(/[*#_`~•▪■●►◀←→|]/g, " ")
      .replace(/\n+/g, "، ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function splitIntoChunks(text) {
    if (text.length <= 185) return [text];
    var parts = text.split(/(?<=[.!؟،\n])\s+/);
    var out = [], cur = "";
    parts.forEach(function (p) {
      if ((cur + " " + p).trim().length > 175 && cur) { out.push(cur.trim()); cur = p; }
      else cur = (cur ? cur + " " : "") + p;
    });
    if (cur.trim()) out.push(cur.trim());
    return out.length ? out : [text];
  }

  function pickBestArabicVoice(gender) {
    refreshSystemVoices();
    var voices = cachedVoices.length ? cachedVoices : (("speechSynthesis" in global && global.speechSynthesis.getVoices()) || []);
    var arVoices = voices.filter(function (v) { return /^ar([-_]|$)/i.test(v.lang || "") || /arabic|العربية/i.test(v.name || ""); });
    if (!arVoices.length) return null;

    var femRe = /female|zariyah|salma|sana|laila|mariam|hoda|fatima|rana|amira|nour|google\s+العربية|ar-xa-a|ar-xa-d/i;
    var maleRe = /male|hamed|shakir|taim|naayf|tarik|majed|omar|ar-xa-b|ar-xa-c/i;

    var gendered = arVoices.filter(function (v) {
      var n = String(v.name || "") + " " + String(v.voiceURI || "");
      return gender === "female" ? femRe.test(n) : maleRe.test(n);
    });
    var pool = gendered.length ? gendered : arVoices;
    // تفضيل الفصحى (ar-SA / ar-XA / ar-EG / ar-JO)
    var fusha = pool.filter(function (v) { return /ar[-_](sa|xa|eg|jo|ae)/i.test(v.lang || ""); });
    return fusha[0] || pool[0];
  }

  function speakWithWebSpeech(text, opts) {
    opts = opts || {};
    var gender = opts.gender === "male" ? "male" : "female";
    return new Promise(function (resolve) {
      if (!("speechSynthesis" in global)) { resolve({ provider: "none" }); return; }
      try { global.speechSynthesis.cancel(); } catch (e) {}
      var utter = new SpeechSynthesisUtterance(text);
      utter.lang = opts.lang || "ar-SA";
      utter.rate = Math.min(1.25, Math.max(0.8, parseFloat(opts.rate) || 0.98));
      utter.pitch = gender === "female" ? 1.08 : 0.92;
      var picked = pickBestArabicVoice(gender);
      if (picked) utter.voice = picked;
      speaking = true;
      var done = false;
      function finish() { if (done) return; done = true; resolve({ provider: "web-speech-" + gender }); }
      utter.onend = finish;
      utter.onerror = finish;
      // حماية من تعليق onend في بعض متصفحات أندرويد
      setTimeout(finish, Math.max(4500, text.length * 120));
      global.speechSynthesis.speak(utter);
    });
  }

  function fetchChunkBlob(chunkText, opts) {
    return fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: chunkText,
        gender: opts.gender || "female",
        preferredProvider: opts.preferredProvider || voicePol.ttsProvider || "auto",
        noCache: !!opts.noCache,
        voiceId: opts.voiceId,
        geminiVoice: opts.geminiVoice
      })
    }).then(function (res) {
      var ct = res.headers.get("Content-Type") || "";
      if (res.ok && ct.indexOf("audio/") === 0) {
        var prov = res.headers.get("X-TTS-Provider") || "cloud";
        lastProvider = prov;
        return res.blob().then(function (blob) { return { blob: blob, provider: prov }; });
      }
      return null;
    }).catch(function () { return null; });
  }

  function playBlob(blob, token) {
    return new Promise(function (resolve) {
      if (token !== playToken) { resolve(false); return; }
      if (currentObjectUrl) {
        try { URL.revokeObjectURL(currentObjectUrl); } catch (e) {}
      }
      currentObjectUrl = URL.createObjectURL(blob);
      var a = getSharedAudio();
      a.volume = 1.0;
      a.playbackRate = Math.min(1.3, Math.max(0.8, parseFloat(voicePol.rate) || 1.0));
      a.src = currentObjectUrl;
      var done = false;
      function cleanup(ok) {
        if (done) return;
        done = true;
        a.onended = null;
        a.onerror = null;
        resolve(ok);
      }
      a.onended = function () { cleanup(true); };
      a.onerror = function () { cleanup(false); };
      var pr = a.play();
      if (pr && pr.catch) pr.catch(function () { cleanup(false); });
    });
  }

  function speak(text, opts) {
    opts = opts || {};
    var clean = cleanSpeechText(text);
    if (!clean) return Promise.resolve({ provider: "none" });
    stop();
    unlockAudio();
    var myToken = playToken;
    speaking = true;

    var effOpts = Object.assign({ gender: "female" }, opts);
    if (voicePol.autoGender === false && !opts.forceGender) effOpts.gender = "female";
    if (!effOpts.rate) effOpts.rate = parseFloat(voicePol.rate) || 1.0;
    var mode = voicePol.sourceMode || "hybrid";
    var chunks = splitIntoChunks(clean.slice(0, 2600));

    if (mode === "local") {
      function runLocal(i) {
        if (myToken !== playToken || i >= chunks.length) {
          if (myToken === playToken) { speaking = false; syncWelcomeBtn(false); }
          return Promise.resolve({ provider: "local-fusha" });
        }
        return speakWithWebSpeech(chunks[i], effOpts).then(function () { return runLocal(i + 1); });
      }
      return runLocal(0);
    }

    // استخدام الصوت المحمّل مسبقاً للترحيب لتشغيل فوري دون أي تأخير
    var firstPromise = (opts._usePreloaded && preloadedWelcomeBlob)
      ? Promise.resolve({ blob: preloadedWelcomeBlob, provider: "cloud-preloaded" })
      : fetchChunkBlob(chunks[0], effOpts);

    var nextPromise = firstPromise;

    function runChunk(idx) {
      if (myToken !== playToken || idx >= chunks.length) {
        if (myToken === playToken) { speaking = false; syncWelcomeBtn(false); }
        return Promise.resolve({ provider: "done" });
      }
      var curPromise = nextPromise;
      nextPromise = (idx + 1 < chunks.length) ? fetchChunkBlob(chunks[idx + 1], effOpts) : null;

      return curPromise.then(function (res) {
        if (myToken !== playToken) return { provider: "cancelled" };
        if (res && res.blob) {
          return playBlob(res.blob, myToken).then(function (ok) {
            if (!ok && myToken === playToken) return mode === "cloud" ? Promise.resolve({ provider: "cloud-unavailable" }) : speakWithWebSpeech(chunks[idx], effOpts);
            return { provider: res.provider };
          }).then(function () { return runChunk(idx + 1); });
        }
        return mode === "cloud" ? Promise.resolve({ provider: "cloud-unavailable" }) : speakWithWebSpeech(chunks[idx], effOpts).then(function () { return runChunk(idx + 1); });
      });
    }

    return runChunk(0);
  }

  function prefetchWelcomeAudio() {
    if (preloadingWelcome || preloadedWelcomeBlob || voicePol.sourceMode === "local") return;
    preloadingWelcome = true;
    fetchChunkBlob(cleanSpeechText(WELCOME_TEXT), { gender: "female" }).then(function (res) {
      if (res && res.blob) preloadedWelcomeBlob = res.blob;
      preloadingWelcome = false;
    }).catch(function () { preloadingWelcome = false; });
  }

  document.addEventListener("click", function (ev) {
    var btn = ev.target && ev.target.closest ? ev.target.closest("[data-tts-target], [data-tts-text]") : null;
    if (!btn) return;
    var text = btn.getAttribute("data-tts-text");
    if (!text) {
      var sel = btn.getAttribute("data-tts-target");
      var targetEl = sel ? document.querySelector(sel) : null;
      text = targetEl ? targetEl.textContent : "";
    }
    if (text && text.trim()) speak(text.trim(), { gender: btn.getAttribute("data-tts-gender") || "female", forceGender: true });
  });

  function syncWelcomeBtn(isPlaying) {
    var wb = document.getElementById("eduWelcomeVoiceBtn");
    var card = document.getElementById("eduSmoothWelcomeCard");
    if (card) card.classList.toggle("edu-voice-playing", !!isPlaying);
    if (global.EduBgMusic && global.EduBgMusic.setDuck) global.EduBgMusic.setDuck(!!isPlaying);
    if (wb) {
      wb.innerHTML = isPlaying
        ? '<span class="edu-eq-bars" aria-hidden="true"><i></i><i></i><i></i></span><span>إيقاف الترحيب</span>'
        : '<span>🔊 استمع لترحيب المعلمة</span>';
    }
  }

  function playWelcomeVoice() {
    syncWelcomeBtn(true);
    speak(WELCOME_TEXT, { gender: "female", forceGender: true, _usePreloaded: true });
  }

  function mountSmoothWelcomeBar() {
    if (document.getElementById("eduSmoothWelcomeCard")) return;
    var stage = document.getElementById("eduHeroWelcomeStage");
    var hero = stage || document.getElementById("hero");
    if (!hero) return;
    var wrap = stage ? stage : (hero.querySelector(".max-w-7xl") || hero);
    var card = document.createElement("div");
    card.id = "eduSmoothWelcomeCard";
    card.className = "edu-welcome-voice-card";
    card.setAttribute("dir", "rtl");
    card.innerHTML =
      '<div class="edu-lm-orb edu-lm-o1"></div>' +
      '<div class="edu-lm-orb edu-lm-o2"></div>' +
      '<div class="edu-wv-top" style="position:relative;z-index:2;">' +
        '<div class="edu-wv-id">' +
          '<div class="edu-lm-rings" aria-hidden="true">' +
            '<span class="edu-lm-ring r1"></span>' +
            '<span class="edu-lm-ring r2"></span>' +
            '<span class="edu-lm-core">👩‍🏫</span>' +
          '</div>' +
          '<div style="min-width:0;">' +
            '<div class="edu-lm-kicker">✨ EduTech Mindset • من قلب غزة 🇵🇸</div>' +
            '<div class="edu-lm-headline">تعلّم بشغف، أبدع بثقة، وانطلق نحو القمة!</div>' +
            '<div class="edu-wv-sub">رسالة ترحيب صوتية بالعربية الفصحى بصوت المعلمة</div>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;"><button type="button" id="eduWelcomeVoiceBtn" class="edu-wv-play-btn">🔊 استمع لترحيب المعلمة</button><button type="button" id="eduHeroInstallPill" data-install-app="1" style="padding:8px 12px;border-radius:14px;background:rgba(16,185,129,0.22);color:#6ee7b7;border:1px solid rgba(52,211,153,0.45);font-size:11.5px;font-weight:900;cursor:pointer;">📲 تثبيت كتطبيق / APK</button></div>' +
      '</div>' +
      '<div class="edu-wv-paths" style="position:relative;z-index:2;">' +
        '<button type="button" id="eduWelStudent" class="edu-wv-pill edu-wv-p1">🎒 طالب</button>' +
        '<button type="button" id="eduWelTeacher" class="edu-wv-pill edu-wv-p2">👩‍🏫 معلم</button>' +
        '<button type="button" id="eduWelTawjihi" class="edu-wv-pill edu-wv-p3">🏆 توجيهي</button>' +
        '<button type="button" id="eduWelKids" class="edu-wv-pill edu-wv-p4">🎮 أطفال</button>' +
      '</div>' +
      '<div id="eduUnifiedPersonalSlot" style="position:relative;z-index:2;margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.14);"></div>';

    if (stage) stage.appendChild(card);
    else wrap.insertBefore(card, wrap.firstChild);

    var wb = document.getElementById("eduWelcomeVoiceBtn");
    if (wb) wb.onclick = function () {
      if (speaking) { stop(); return; }
      playWelcomeVoice();
    };
    var ws = document.getElementById("eduWelStudent");
    if (ws) ws.onclick = function () {
      var ls = document.getElementById("learnSection");
      if (ls) ls.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    var wtc = document.getElementById("eduWelTeacher");
    if (wtc) wtc.onclick = function () {
      var th = document.getElementById("unifiedToolsHub");
      if (th) {
        th.scrollIntoView({ behavior: "smooth", block: "start" });
        var tb = th.querySelector('[data-th-tab="teacher"]');
        if (tb) tb.click();
      }
    };
    var wt = document.getElementById("eduWelTawjihi");
    if (wt) wt.onclick = function () {
      var th = document.getElementById("unifiedToolsHub");
      if (th) {
        th.scrollIntoView({ behavior: "smooth", block: "start" });
        var tb = th.querySelector('[data-th-tab="tawjihi"]');
        if (tb) tb.click();
      }
    };
    var wk = document.getElementById("eduWelKids");
    if (wk) wk.onclick = function () {
      var th = document.getElementById("unifiedToolsHub");
      if (th) {
        th.scrollIntoView({ behavior: "smooth", block: "start" });
        var tb = th.querySelector('[data-th-tab="kids"]');
        if (tb) tb.click();
      }
    };
  }

  function setupAutoWelcomeOnFirstTouch() {
    if (voicePol.welcomeEnabled === false) return;
    try { if (sessionStorage.getItem("edu_welcome_spoken_v241") === "1") return; } catch (e) {}
    function triggerOnce(ev) {
      document.removeEventListener("pointerdown", triggerOnce, true);
      document.removeEventListener("click", triggerOnce, true);
      unlockAudio();
      try { sessionStorage.setItem("edu_welcome_spoken_v241", "1"); } catch (e) {}
      var t = ev && ev.target;
      if (t && t.closest && t.closest("#eduWelcomeVoiceBtn, #eduAsstOrb, #eduAsst")) return;
      playWelcomeVoice();
    }
    document.addEventListener("pointerdown", triggerOnce, { capture: true, once: true, passive: true });
    document.addEventListener("click", triggerOnce, { capture: true, once: true, passive: true });
  }


  function runDiagnostics() {
    if (typeof showToast === "function") showToast("🔍 جارٍ فحص مزوّدي الصوت في السحابة…", "info");
    return fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ debug: true })
    }).then(function (r) { return r.json(); }).then(function (d) {
      var msg =
        "1) Gemini 2.5 TTS (الأساسي الفصيح): " + (d.gemini && d.gemini.ok ? "✅ يعمل (" + d.gemini.status + ")" : "❌ (" + ((d.gemini && (d.gemini.status || (d.gemini.configured ? "خطأ" : "غير مضبوط"))) || "—") + ")") + "\n" +
        "2) ElevenLabs: " + (d.elevenlabs && d.elevenlabs.ok ? "✅ يعمل (" + d.elevenlabs.status + ")" : "❌ (" + ((d.elevenlabs && (d.elevenlabs.status || (d.elevenlabs.configured ? "خطأ" : "غير مضبوط"))) || "—") + (d.elevenlabs && d.elevenlabs.error ? " — " + d.elevenlabs.error : "") + ")") + "\n" +
        "3) Cartesia Sonic: " + (d.cartesia && d.cartesia.ok ? "✅ يعمل (" + d.cartesia.status + ")" : "❌ (" + ((d.cartesia && (d.cartesia.status || (d.cartesia.configured ? "خطأ" : "غير مضبوط"))) || "—") + ")") + "\n" +
        "4) البديل السحابي العربي: " + (d.cloudFallback && d.cloudFallback.ok ? "✅ يعمل" : "❌");
      alert("🔍 تقرير فحص مزوّدي الصوت الفوري:\n\n" + msg);
      return d;
    }).catch(function () {
      if (typeof showToast === "function") showToast("تعذر الاتصال بـ /api/tts — تحقق من الإنترنت", "error");
    });
  }

  global.EduTechTTS = {
    runDiagnostics: runDiagnostics,
    speak: speak,
    stop: stop,
    playWelcome: playWelcomeVoice,
    isSpeaking: function () { return speaking; },
    getLastProvider: function () { return lastProvider; },
    getPolicy: function () { return Object.assign({}, voicePol); },
    savePolicy: saveVoicePol
  };

  setTimeout(function () {
    if (window.Cloud && window.Cloud.enabled && typeof window.Cloud.subscribeVoicePolicy === "function") {
      window.Cloud.subscribeVoicePolicy(function (p) {
        if (p && typeof p === "object") {
          voicePol = Object.assign({}, DEFAULT_VOICE_POL, p);
          try { localStorage.setItem(VOICE_POL_KEY, JSON.stringify(voicePol)); } catch (e) {}
        }
      });
    }
  }, 550);


  // v256: تشغيل الموسيقى الخلفية تلقائياً حسب التوقيت المحدد من لوحة الإدارة (فوراً / بعد دقيقة / دقيقتين...)
  function scheduleBackgroundMusic() {
    if (!voicePol || !voicePol.musicEnabled) return;
    var delayMs = Math.max(0, (Number(voicePol.musicDelaySec) || 60) * 1000);
    setTimeout(function () {
      if (!voicePol.musicEnabled) return;
      var btn = document.getElementById("btnHeaderMusic");
      var playBtn = document.getElementById("btnStudioPlayPause");
      if (playBtn) { try { playBtn.click(); } catch (e) {} }
      else if (btn) { try { btn.click(); } catch (e) {} }
    }, delayMs);
  }
  function mountContinueLearningPill() {
    try {
      var raw = localStorage.getItem("edu_last_lesson_v256");
      if (!raw) return;
      var last = JSON.parse(raw);
      if (!last || !last.label) return;
      var card = document.getElementById("eduSmoothWelcomeCard");
      if (!card || card.querySelector("#eduContinuePill")) return;
      var pill = document.createElement("button");
      pill.id = "eduContinuePill";
      pill.type = "button";
      pill.style.cssText = "position:relative;z-index:2;margin-top:8px;width:100%;padding:8px 12px;border-radius:12px;background:rgba(251,191,36,0.18);border:1px solid rgba(251,191,36,0.45);color:#fde68a;font-size:11.5px;font-weight:900;cursor:pointer;text-align:right;";
      pill.innerHTML = "🔖 تابع من حيث توقفت: " + String(last.label).replace(/</g, "&lt;");
      pill.onclick = function () {
        var gNum = parseInt(String(last.g || "").replace(/\D+/g, ""), 10);
        if (gNum && global.EduLearn && global.EduLearn.openGrade) global.EduLearn.openGrade(gNum);
        else { var ls = document.getElementById("learnSection"); if (ls) ls.scrollIntoView({ behavior: "smooth", block: "start" }); }
      };
      var slot = card.querySelector("#eduUnifiedPersonalSlot");
      if (slot) card.insertBefore(pill, slot);
      else card.appendChild(pill);
    } catch (e) {}
  }

  function boot() {
    setTimeout(mountContinueLearningPill, 600);
    setTimeout(scheduleBackgroundMusic, 1000);
    setTimeout(mountSmoothWelcomeBar, 250);
    setTimeout(prefetchWelcomeAudio, 350);
    setTimeout(setupAutoWelcomeOnFirstTouch, 450);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window);
