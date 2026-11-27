/* ============================================================================
 * EduTech Mindset v281 — ركن الأطفال «التأسيس السليم» (100% أوفلاين وحيوي)
 *  - الحروف العربية الـ 28 بالحركات + الإنجليزية A–Z + الفرنسية الأساسية
 *  - سبورة تتبع وكتابة الحروف والأرقام بالإصبع (Letter Tracing)
 *  - ألعاب الرياضيات التأسيسية + اختبار صوتي مصوّر + تصفيق وكونفيتي
 *  - شهادة بطل PNG باسم الطفل + لوحة متابعة ولي الأمر
 * ============================================================================ */
(function (global) {
  "use strict";

  var STATS_KEY = "edu_kids_taasees_web_v281";
  var sfxCtx = null;

  var AR_LETTERS = [
    ["أ", "أسد", "🦁", "أَ - أُ - إِ"], ["ب", "بطة", "🦆", "بَ - بُ - بِ"], ["ت", "تفاحة", "🍎", "تَ - تُ - تِ"],
    ["ث", "ثعلب", "🦊", "ثَ - ثُ - ثِ"], ["ج", "جمل", "🐪", "جَ - جُ - جِ"], ["ح", "حصان", "🐴", "حَ - حُ - حِ"],
    ["خ", "خروف", "🐑", "خَ - خُ - خِ"], ["د", "دب", "🐻", "دَ - دُ - دِ"], ["ذ", "ذئب", "🐺", "ذَ - ذُ - ذِ"],
    ["ر", "رمان", "🍒", "رَ - رُ - رِ"], ["ز", "زرافة", "🦒", "زَ - زُ - زِ"], ["س", "سمكة", "🐟", "سَ - سُ - سِ"],
    ["ش", "شمس", "☀️", "شَ - شُ - شِ"], ["ص", "صقر", "🦅", "صَ - صُ - صِ"], ["ض", "ضفدع", "🐸", "ضَ - ضُ - ضِ"],
    ["ط", "طائرة", "✈️", "طَ - طُ - طِ"], ["ظ", "ظرف", "✉️", "ظَ - ظُ - ظِ"], ["ع", "عصفور", "🐦", "عَ - عُ - عِ"],
    ["غ", "غزال", "🦌", "غَ - غُ - غِ"], ["ف", "فيل", "🐘", "فَ - فُ - فِ"], ["ق", "قمر", "🌙", "قَ - قُ - قِ"],
    ["ك", "كتاب", "📖", "كَ - كُ - كِ"], ["ل", "ليمون", "🍋", "لَ - لُ - لِ"], ["م", "موز", "🍌", "مَ - مُ - مِ"],
    ["ن", "نحلة", "🐝", "نَ - نُ - نِ"], ["هـ", "هلال", "🌙", "هَ - هُ - هِ"], ["و", "وردة", "🌹", "وَ - وُ - وِ"],
    ["ي", "يد", "✋", "يَ - يُ - يِ"]
  ];

  var EN_LETTERS = [
    ["A", "Apple", "🍎"], ["B", "Ball", "⚽"], ["C", "Cat", "🐱"], ["D", "Duck", "🦆"], ["E", "Elephant", "🐘"],
    ["F", "Fish", "🐟"], ["G", "Grapes", "🍇"], ["H", "House", "🏠"], ["I", "Ice Cream", "🍦"], ["J", "Juice", "🧃"],
    ["K", "Kite", "🪁"], ["L", "Lion", "🦁"], ["M", "Moon", "🌙"], ["N", "Nest", "🪺"], ["O", "Orange", "🍊"],
    ["P", "Pen", "✏️"], ["Q", "Queen", "👑"], ["R", "Rabbit", "🐰"], ["S", "Sun", "☀️"], ["T", "Tree", "🌳"],
    ["U", "Umbrella", "☂️"], ["V", "Violin", "🎻"], ["W", "Whale", "🐳"], ["X", "Xylophone", "🎵"], ["Y", "Yacht", "⛵"], ["Z", "Zebra", "🦓"]
  ];

  var FR_BASICS = [
    ["Bonjour", "صباح الخير", "☀️"], ["Merci", "شكراً", "🙏"], ["Un (1)", "واحد", "1️⃣"],
    ["Deux (2)", "اثنان", "2️⃣"], ["Trois (3)", "ثلاثة", "3️⃣"], ["Chat", "قطة", "🐱"],
    ["Livre", "كتاب", "📖"], ["École", "مدرسة", "🏫"], ["Soleil", "شمس", "☀️"], ["Fleur", "وردة", "🌹"]
  ];

  function loadStats() {
    try {
      return Object.assign({ childName: "بطل EduTech", stars: 0, quizzesPassed: 0, tracedCount: 0, masteredAr: [] }, JSON.parse(localStorage.getItem(STATS_KEY) || "{}"));
    } catch (e) { return { childName: "بطل EduTech", stars: 0, quizzesPassed: 0, tracedCount: 0, masteredAr: [] }; }
  }
  function saveStats(st) { try { localStorage.setItem(STATS_KEY, JSON.stringify(st)); } catch (e) {} }

  function playApplauseWeb() {
    try {
      var AC = global.AudioContext || global.webkitAudioContext;
      if (AC) {
        if (!sfxCtx) sfxCtx = new AC();
        if (sfxCtx.state === "suspended") sfxCtx.resume();
        [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) {
          var osc = sfxCtx.createOscillator(), g = sfxCtx.createGain();
          osc.type = "triangle"; osc.frequency.setValueAtTime(f, sfxCtx.currentTime + i * 0.1);
          g.gain.setValueAtTime(0.08, sfxCtx.currentTime + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.0001, sfxCtx.currentTime + i * 0.1 + 0.25);
          osc.connect(g); g.connect(sfxCtx.destination);
          osc.start(sfxCtx.currentTime + i * 0.1); osc.stop(sfxCtx.currentTime + i * 0.1 + 0.27);
        });
      }
    } catch (e) {}
    var cv = document.createElement("canvas");
    cv.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;z-index:100180;pointer-events:none;";
    cv.width = window.innerWidth; cv.height = window.innerHeight;
    document.body.appendChild(cv);
    var ctx = cv.getContext("2d");
    var cols = ["#38bdf8", "#fbbf24", "#10b981", "#ec4899", "#a855f7"];
    var pts = Array.from({ length: 55 }, function (_, i) {
      return { x: Math.random() * cv.width, y: -20 - Math.random() * 100, vx: (Math.random() - 0.5) * 4, vy: 3 + Math.random() * 4, r: 5 + Math.random() * 4, c: cols[i % cols.length] };
    });
    var fr = 0;
    (function loop() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      pts.forEach(function (p) { p.x += p.vx; p.y += p.vy; ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.r, p.r * 1.4); });
      if (++fr < 75) requestAnimationFrame(loop); else cv.remove();
    })();
  }

  var kidsAudioEl = null;
  function playClip(clipKey, fallbackText, lang) {
    var url = "assets/kids-audio/" + clipKey + ".mp3?v=282";
    try {
      if (kidsAudioEl) { kidsAudioEl.pause(); kidsAudioEl.currentTime = 0; }
      kidsAudioEl = new Audio(url);
      kidsAudioEl.preload = "auto";
      var p = kidsAudioEl.play();
      if (p && typeof p.catch === "function") {
        p.catch(function () { if (fallbackText) speakKids(fallbackText, lang); });
      }
      return;
    } catch (e) {}
    if (fallbackText) speakKids(fallbackText, lang);
  }

  function cacheAllKidsAudio(btn) {
    if (!("caches" in global)) return;
    if (btn) btn.textContent = "⏳ جارٍ حفظ 57 صوتاً أوفلاين…";
    var urls = ["fx_bravo", "fx_write", "fx_try"];
    for (var i = 0; i < 28; i++) urls.push("ar_" + String(i).padStart(2, "0"));
    for (var j = 0; j < 26; j++) urls.push("en_" + String(j).padStart(2, "0"));
    caches.open("edutech-kids-audio-v282").then(function (cache) {
      return Promise.all(urls.map(function (k) {
        return cache.add("assets/kids-audio/" + k + ".mp3?v=282").catch(function () {});
      }));
    }).then(function () {
      if (btn) btn.textContent = "✅ الصوتيات محفوظة أوفلاين ✓";
      if (typeof global.showToast === "function") global.showToast("✅ تم حفظ جميع الصوتيات الفصحى (57 ملفاً) للعمل بلا إنترنت ✓", "success");
    });
  }

  function speakKids(text, lang) {
    var l = lang || "ar";
    if ("speechSynthesis" in global) {
      try {
        var u = new SpeechSynthesisUtterance(text);
        u.lang = l === "en" ? "en-US" : (l === "fr" ? "fr-FR" : "ar-SA");
        u.rate = 0.88;
        global.speechSynthesis.cancel();
        global.speechSynthesis.speak(u);
      } catch (e) {}
    }
  }

  function generateChildCertificate(st) {
    var cv = document.createElement("canvas");
    cv.width = 1080; cv.height = 760;
    var ctx = cv.getContext("2d");
    var g = ctx.createLinearGradient(0, 0, 1080, 760);
    g.addColorStop(0, "#0c4a6e"); g.addColorStop(0.5, "#1e1b4b"); g.addColorStop(1, "#065f46");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 760);
    ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 10; ctx.strokeRect(28, 28, 1024, 704);
    ctx.direction = "rtl"; ctx.textAlign = "center";
    ctx.fillStyle = "#fde047"; ctx.font = "900 48px Cairo, sans-serif";
    ctx.fillText("🏆 شهادة بطل التأسيس السليم 🏆", 540, 130);
    ctx.fillStyle = "#ffffff"; ctx.font = "800 34px Cairo, sans-serif";
    ctx.fillText("تُمنح بكل فخر إلى البطل / البطلة:", 540, 225);
    ctx.fillStyle = "#38bdf8"; ctx.font = "900 58px Cairo, sans-serif";
    ctx.fillText(st.childName || "بطل EduTech", 540, 325);
    ctx.fillStyle = "#e2e8f0"; ctx.font = "700 30px Cairo, sans-serif";
    ctx.fillText("لإبداعه وتفوقه في ركن التأسيس السليم — EduTech Mindset", 540, 420);
    ctx.fillStyle = "#6ee7b7"; ctx.font = "900 36px Cairo, sans-serif";
    ctx.fillText("⭐ النجوم: " + st.stars + "   •   ✏️ حروف متقنة: " + st.tracedCount + "   •   🎯 اختبارات: " + st.quizzesPassed, 540, 515);
    ctx.fillStyle = "#cbd5e1"; ctx.font = "700 24px Cairo, sans-serif";
    ctx.fillText("إشراف أ. باسل أشرف الفقعاوي — غزة، فلسطين 🇵🇸", 540, 640);
    var a = document.createElement("a");
    a.download = "EduTech-Kids-Certificate.png";
    a.href = cv.toDataURL("image/png");
    a.click();
    playApplauseWeb();
  }

  function openModal() {
    var old = document.getElementById("eduKidsTaaseesModal");
    if (old) old.remove();
    var activeSub = "ar";
    var wrap = document.createElement("div");
    wrap.id = "eduKidsTaaseesModal";
    wrap.className = "edu-v281-modal";
    wrap.setAttribute("dir", "rtl");
    wrap.style.cssText = "position:fixed;inset:0;z-index:100035;background:rgba(2,6,23,0.88);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:10px;";
    wrap.innerHTML =
      '<div style="width:min(96vw,880px);max-height:92vh;background:#0f172a;color:#f8fafc;border:1.5px solid rgba(251,191,36,0.4);border-radius:24px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.65);">' +
        '<div style="padding:13px 16px;background:linear-gradient(135deg,#0284c7,#6366f1);display:flex;align-items:center;justify-content:space-between;gap:8px;flex-shrink:0;">' +
          '<div><strong style="font-size:15.5px;font-weight:900;">🌟 ركن التأسيس السليم للأطفال (أوفلاين)</strong><div style="font-size:11px;color:#e0f2fe;">الحروف بالحركات • إنجليزي وفرنسي • سبورة تتبع • رياضيات • اختبار صوتي • شهادة بطل</div></div>' +
          '<button type="button" id="ktModalClose" style="padding:7px 14px;border-radius:12px;background:rgba(255,255,255,0.2);color:#fff;border:none;font-weight:900;font-size:12px;cursor:pointer;">✕ إغلاق</button>' +
        '</div>' +
        '<div id="ktHost" class="edu-v281-scroll" style="flex:1;overflow-y:auto;padding:14px;"></div>' +
      '</div>';
    document.body.appendChild(wrap);
    wrap.querySelector("#ktModalClose").onclick = function () { wrap.remove(); };
    wrap.onclick = function (e) { if (e.target === wrap) wrap.remove(); };

    var container = wrap.querySelector("#ktHost");
    function draw() {
      var st = loadStats();
      var tabs = [
        ["ar", "🔤 عربي"], ["en", "🅰️ إنجليزي"], ["fr", "🇫🇷 فرنسي"],
        ["trace", "✏️ سبورة الكتابة"], ["math", "🔢 رياضيات"], ["quiz", "🎯 اختبار صوتي"], ["parent", "👨‍👩‍👧 ولي الأمر"]
      ];
      container.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;padding:10px 14px;border-radius:16px;background:rgba(255,255,255,0.05);border:1px solid rgba(56,189,248,0.25);">' +
          '<div style="font-size:13px;font-weight:800;">مرحباً يا <strong style="color:#fde047;">' + st.childName + '</strong></div>' +
          '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;"><button type="button" id="ktCacheAudioBtn" style="padding:5px 10px;border-radius:10px;background:rgba(16,185,129,0.22);color:#6ee7b7;border:1px solid rgba(16,185,129,0.4);font-size:11px;font-weight:900;cursor:pointer;">📥 حفظ الصوتيات أوفلاين</button><div style="font-size:14px;font-weight:900;color:#fde047;">⭐ ' + st.stars + ' نجمة</div></div>' +
        '</div>' +
        '<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;margin-bottom:10px;">' +
          tabs.map(function (t) {
            var on = activeSub === t[0];
            return '<button type="button" data-ktab="' + t[0] + '" style="flex-shrink:0;padding:8px 12px;border-radius:12px;border:none;font-size:12px;font-weight:900;cursor:pointer;background:' + (on ? '#0ea5e9' : 'rgba(255,255,255,0.08)') + ';color:#fff;">' + t[1] + '</button>';
          }).join("") +
        '</div>' +
        '<div id="kidsTaaseesBody"></div>';

      var cab = container.querySelector("#ktCacheAudioBtn"); if (cab) cab.onclick = function () { cacheAllKidsAudio(cab); };
      container.querySelectorAll("[data-ktab]").forEach(function (b) {
        b.onclick = function () { activeSub = b.getAttribute("data-ktab"); draw(); };
      });
      var body = container.querySelector("#kidsTaaseesBody");

      if (activeSub === "ar") {
        body.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px;">' +
          AR_LETTERS.map(function (item, idx) {
            return '<button type="button" data-kar="' + idx + '" style="padding:11px 6px;border-radius:15px;background:rgba(255,255,255,0.06);border:1.5px solid rgba(56,189,248,0.28);color:#fff;cursor:pointer;text-align:center;">' +
              '<div style="font-size:26px;font-weight:900;color:#fde047;">' + item[0] + '</div><div style="font-size:22px;">' + item[2] + '</div><div style="font-size:12px;font-weight:800;">' + item[1] + '</div><div style="font-size:10px;color:#7dd3fc;">' + item[3] + '</div></button>';
          }).join("") + '</div>';
        body.querySelectorAll("[data-kar]").forEach(function (b) {
          b.onclick = function () {
            var idx = Number(b.getAttribute("data-kar")); var it = AR_LETTERS[idx];
            playClip("ar_" + String(idx).padStart(2, "0"), it[0] + "، " + it[1], "ar");
            if (st.masteredAr.indexOf(it[0]) === -1) { st.masteredAr.push(it[0]); st.stars += 2; saveStats(st); }
            b.style.borderColor = "#10b981";
          };
        });
      } else if (activeSub === "en") {
        body.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px;">' +
          EN_LETTERS.map(function (item, idx) {
            return '<button type="button" data-ken="' + idx + '" style="padding:11px 6px;border-radius:15px;background:rgba(255,255,255,0.06);border:1.5px solid rgba(168,85,247,0.35);color:#fff;cursor:pointer;text-align:center;">' +
              '<div style="font-size:25px;font-weight:900;color:#c084fc;">' + item[0] + '</div><div style="font-size:22px;">' + item[2] + '</div><div style="font-size:12px;font-weight:800;">' + item[1] + '</div></button>';
          }).join("") + '</div>';
        body.querySelectorAll("[data-ken]").forEach(function (b) {
          b.onclick = function () { var idx = Number(b.getAttribute("data-ken")); var it = EN_LETTERS[idx]; playClip("en_" + String(idx).padStart(2, "0"), it[0] + ", " + it[1], "en"); };
        });
      } else if (activeSub === "fr") {
        body.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;">' +
          FR_BASICS.map(function (item, idx) {
            return '<button type="button" data-kfr="' + idx + '" style="padding:12px 8px;border-radius:15px;background:rgba(255,255,255,0.06);border:1.5px solid rgba(236,72,153,0.35);color:#fff;cursor:pointer;text-align:center;">' +
              '<div style="font-size:24px;">' + item[2] + '</div><div style="font-size:15px;font-weight:900;color:#f9a8d4;">' + item[0] + '</div><div style="font-size:12px;color:#cbd5e1;">' + item[1] + '</div></button>';
          }).join("") + '</div>';
        body.querySelectorAll("[data-kfr]").forEach(function (b) {
          b.onclick = function () { speakKids(FR_BASICS[Number(b.getAttribute("data-kfr"))][0], "fr"); };
        });
      } else if (activeSub === "trace") {
        var curChar = "أ";
        body.innerHTML =
          '<div style="background:rgba(255,255,255,0.04);border-radius:18px;padding:12px;border:1px solid rgba(56,189,248,0.28);">' +
            '<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;">' +
              ["أ","ب","ت","ج","س","ع","م","1","2","3","A","B"].map(function (ch) {
                return '<button type="button" data-tch="' + ch + '" style="min-width:40px;padding:6px 10px;border-radius:10px;background:#1e293b;color:#fde047;border:1px solid #475569;font-size:16px;font-weight:900;cursor:pointer;">' + ch + '</button>';
              }).join("") +
            '</div>' +
            '<canvas id="kidsTraceCv" width="340" height="260" style="width:100%;max-width:360px;display:block;margin:8px auto;background:#020617;border:2px dashed #38bdf8;border-radius:16px;touch-action:none;"></canvas>' +
            '<div style="display:flex;gap:8px;justify-content:center;margin-top:8px;">' +
              '<button type="button" id="ktClear" style="padding:9px 14px;border-radius:12px;background:#334155;color:#fff;border:none;font-size:12.5px;font-weight:900;cursor:pointer;">🧹 مسح</button>' +
              '<button type="button" id="ktDone" style="padding:9px 18px;border-radius:12px;background:#10b981;color:#fff;border:none;font-size:12.5px;font-weight:900;cursor:pointer;">✅ أتممت الكتابة (+5 نجوم)</button>' +
            '</div>' +
          '</div>';
        var cv = body.querySelector("#kidsTraceCv"), ctx = cv.getContext("2d");
        function drawGuide(ch) {
          curChar = ch; ctx.clearRect(0, 0, cv.width, cv.height);
          ctx.fillStyle = "rgba(148,163,184,0.22)"; ctx.font = "900 180px Cairo, sans-serif";
          ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(ch, cv.width / 2, cv.height / 2 + 8);
        }
        drawGuide(curChar);
        var dr = false;
        function pt(ev) { var r = cv.getBoundingClientRect(); return { x: (ev.clientX - r.left) * (cv.width / r.width), y: (ev.clientY - r.top) * (cv.height / r.height) }; }
        cv.onpointerdown = function (e) { dr = true; var p = pt(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineWidth = 12; ctx.lineCap = "round"; ctx.strokeStyle = "#fde047"; };
        cv.onpointermove = function (e) { if (!dr) return; var p = pt(e); ctx.lineTo(p.x, p.y); ctx.stroke(); };
        window.addEventListener("pointerup", function () { dr = false; });
        body.querySelectorAll("[data-tch]").forEach(function (b) { b.onclick = function () { drawGuide(b.getAttribute("data-tch")); speakKids(b.getAttribute("data-tch"), /[A-Z]/.test(b.getAttribute("data-tch")) ? "en" : "ar"); }; });
        body.querySelector("#ktClear").onclick = function () { drawGuide(curChar); };
        body.querySelector("#ktDone").onclick = function () { st.tracedCount += 1; st.stars += 5; saveStats(st); playApplauseWeb(); playClip("fx_write", "ممتاز يا بطل!", "ar"); draw(); };
      } else if (activeSub === "math") {
        var a = Math.floor(Math.random() * 8) + 1, b = Math.floor(Math.random() * 7) + 1, ans = a + b;
        var opts = [ans, ans + 1, Math.max(1, ans - 1), ans + 2].sort(function () { return Math.random() - 0.5; });
        body.innerHTML =
          '<div style="background:rgba(255,255,255,0.05);border-radius:18px;padding:18px;text-align:center;border:1px solid rgba(16,185,129,0.35);">' +
            '<div style="font-size:26px;margin-bottom:8px;">' + "🍎".repeat(a) + ' <span style="color:#fde047;">+</span> ' + "🍎".repeat(b) + '</div>' +
            '<div style="font-size:30px;font-weight:900;margin-bottom:14px;">' + a + ' + ' + b + ' = ؟</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:260px;margin:0 auto;">' +
              opts.map(function (o) { return '<button type="button" data-mans="' + o + '" style="padding:14px;border-radius:14px;background:#1e293b;color:#fde047;border:1.5px solid #475569;font-size:22px;font-weight:900;cursor:pointer;">' + o + '</button>'; }).join("") +
            '</div>' +
          '</div>';
        body.querySelectorAll("[data-mans]").forEach(function (btn) {
          btn.onclick = function () {
            if (Number(btn.getAttribute("data-mans")) === ans) { st.stars += 5; saveStats(st); playApplauseWeb(); playClip("fx_bravo", "أحسنت يا بطل!", "ar"); setTimeout(draw, 850); }
            else { btn.style.background = "#991b1b"; playClip("fx_try", "حاول مرة أخرى يا بطل", "ar"); }
          };
        });
      } else if (activeSub === "quiz") {
        var pool = AR_LETTERS.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 4);
        var target = pool[0];
        pool.sort(function () { return Math.random() - 0.5; });
        body.innerHTML =
          '<div style="background:rgba(255,255,255,0.05);border-radius:18px;padding:18px;text-align:center;border:1px solid rgba(251,191,36,0.35);">' +
            '<button type="button" id="kqHear" style="padding:11px 22px;border-radius:14px;background:#0284c7;color:#fff;border:none;font-size:14px;font-weight:900;cursor:pointer;margin-bottom:14px;">🔊 اسمع السؤال</button>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
              pool.map(function (p) { return '<button type="button" data-qpick="' + p[0] + '" style="padding:14px;border-radius:15px;background:#1e293b;border:1.5px solid #475569;color:#fff;cursor:pointer;"><div style="font-size:30px;">' + p[2] + '</div><div style="font-size:19px;font-weight:900;color:#fde047;">' + p[0] + ' • ' + p[1] + '</div></button>'; }).join("") +
            '</div>' +
          '</div>';
        var targetIdx = AR_LETTERS.indexOf(target); var ask = function () { playClip("ar_" + String(targetIdx).padStart(2, "0"), target[0] + "، " + target[1], "ar"); };
        body.querySelector("#kqHear").onclick = ask; setTimeout(ask, 250);
        body.querySelectorAll("[data-qpick]").forEach(function (btn) {
          btn.onclick = function () {
            if (btn.getAttribute("data-qpick") === target[0]) { st.quizzesPassed += 1; st.stars += 10; saveStats(st); playApplauseWeb(); playClip("fx_bravo", "أحسنت يا بطل!", "ar"); setTimeout(draw, 900); }
            else { btn.style.background = "#991b1b"; playClip("fx_try", "حاول مرة أخرى يا بطل", "ar"); }
          };
        });
      } else {
        body.innerHTML =
          '<div style="background:rgba(255,255,255,0.05);border-radius:18px;padding:16px;border:1px solid rgba(56,189,248,0.28);">' +
            '<div style="font-size:15px;font-weight:900;color:#7dd3fc;margin-bottom:8px;">👨‍👩‍👧 لوحة متابعة ولي الأمر</div>' +
            '<div style="font-size:13px;line-height:1.9;margin-bottom:12px;">• النجوم: <strong>' + st.stars + ' ⭐</strong><br>• الحروف العربية: <strong>' + st.masteredAr.length + ' / 28</strong><br>• الحروف المكتوبة على السبورة: <strong>' + st.tracedCount + '</strong><br>• الاختبارات المجتازة: <strong>' + st.quizzesPassed + '</strong></div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
              '<button type="button" id="kpRename" style="padding:9px 14px;border-radius:11px;background:#0284c7;color:#fff;border:none;font-size:12px;font-weight:900;cursor:pointer;">✏️ تعديل اسم الطفل</button>' +
              '<button type="button" id="kpCert" style="padding:9px 14px;border-radius:11px;background:#f59e0b;color:#020617;border:none;font-size:12px;font-weight:900;cursor:pointer;">🏆 إصدار شهادة بطل (PNG)</button>' +
            '</div>' +
          '</div>';
        body.querySelector("#kpRename").onclick = function () { var n = prompt("اسم طفلك:", st.childName); if (n && n.trim()) { st.childName = n.trim(); saveStats(st); draw(); } };
        body.querySelector("#kpCert").onclick = function () { generateChildCertificate(st); };
      }
    }
    draw();
  }

  global.EduKidsTaasees = { open: openModal };
})(window);
