/*
 * مولّد الألعاب التربوية التفاعلية والمسابقات الحية — EduTech Mindset (الإصدار 43)
 * يدعم 4 أنماط ألعاب تفاعلية (سباق الأبطال Kahoot-style، عجلة الحظ الدوّارة، مطابقة البطاقات، وتصنيف المجموعات)
 * مع لوحة شرف حية (Leaderboard) ورابط لعب مباشر للطلاب (?g=ID) بدون تسجيل دخول.
 */
(function () {
  "use strict";
  var COL = "games", SCOL = "gameScores";
  var $ = function (id) { return document.getElementById(id); };
  var cloud = function () { return !!(window.Cloud && window.Cloud.enabled && window.Cloud.col); };
  var uid = function () { return window.Cloud && window.Cloud.user ? window.Cloud.user.uid : ""; };
  var e = function (v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var toast = function (m, t) { if (typeof showToast === "function") showToast(m, t || "success"); };
  var cls = "w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100";

  var GRADES = ["الأول الأساسي", "الثاني الأساسي", "الثالث الأساسي", "الرابع الأساسي", "الخامس الأساسي", "السادس الأساسي", "السابع", "الثامن", "التاسع", "العاشر", "الحادي عشر", "الثاني عشر"];
  var MODES = {
    arena: "🚀 سباق الأبطال (Kahoot تفاعلي مع وسائل مساعدة)",
    wheel: "🎡 عجلة الحظ الدوّارة",
    match: "🃏 مطابقة البطاقات والمفاهيم",
    sort: "🗂 تصنيف المجموعات الذكي",
    order: "🧩 ترتيب وبناء الجمل والمفاهيم"
  };

  var st = {
    id: "",
    title: "",
    topic: "",
    grade: GRADES[3],
    subject: "",
    mode: "arena",
    questions: [], // [{q, options:[4], answer:0..3, pairA, pairB, cat}]
    categories: ["المجموعة أ", "المجموعة ب"],
    dirty: false
  };

  function shuf(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i];
      a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function beep(freq, dur, type) {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      var ctx = new Ctx(), osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = type || "sine";
      osc.frequency.value = freq || 520;
      g.gain.setValueAtTime(0.12, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (dur || 0.18));
      osc.connect(g); g.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + (dur || 0.18));
    } catch (x) {}
  }

  function parseJson(txt) {
    var s = String(txt || "").replace(/```json|```/gi, ""), a = s.indexOf("{"), b = s.lastIndexOf("}");
    if (a < 0 || b <= a) throw new Error("لم يُرجع الذكاء الاصطناعي بيانات صالحة، أعد المحاولة");
    return JSON.parse(s.slice(a, b + 1));
  }

  function gameLink(id) {
    return location.origin + location.pathname.replace(/index\.html$/, "") + "?g=" + encodeURIComponent(id || st.id);
  }

  var OFFLINE_GAME_BANKS = [
    {
      label: "🔬 علوم: الخلية وأجهزة الجسم",
      title: "تحدي أبطال العلوم: الخلية وأجهزة جسم الإنسان",
      grade: "السابع",
      subject: "العلوم والحياة",
      categories: ["عضيات الخلية النباتية", "أجهزة جسم الإنسان"],
      questions: [
        { q: "ما العضية المسؤولة عن إنتاج الطاقة (ATP) في الخلية وتُعرف ببيوت الطاقة؟", options: ["الميتوكندريا", "الرايبوسومات", "جهاز غولجي", "الفجوة العصارية"], answer: 0, pairA: "الميتوكندريا", pairB: "مركز إنتاج الطاقة في الخلية", cat: 0 },
        { q: "أي التراكيب التالية يوجد في الخلية النباتية ولا يوجد في الخلية الحيوانية؟", options: ["الغشاء البلازمي", "الجدار الخلوي والبلاستيدات", "النواة", "السيتوبلازم"], answer: 1, pairA: "البلاستيدات الخضراء", pairB: "القيام بعملية البناء الضوئي", cat: 0 },
        { q: "ما العضو الرئيس الذي يضخ الدم المؤكسج إلى جميع أنحاء الجسم؟", options: ["الرئتان", "القلب", "الكبد", "المعدة"], answer: 1, pairA: "القلب والأوعية الدموية", pairB: "جهاز الدوران ونقل الأكسجين", cat: 1 },
        { q: "أين يتم تبادل الغازات (دخول الأكسجين وخروج ثاني أكسيد الكربون) في الرئتين؟", options: ["القصبة الهوائية", "الحويصلات الهوائية", "الحنجرة", "البلعوم"], answer: 1, pairA: "الحويصلات الهوائية", pairB: "تبادل الغازات في الجهاز التنفسي", cat: 1 },
        { q: "ما الجزء الذي يتحكم في جميع أنشطة الخلية ويحمل المادة الوراثية (DNA)؟", options: ["النواة", "الجدار الخلوي", "الفجوة", "الغشاء"], answer: 0, pairA: "النواة", pairB: "مركز التحكم وحفظ المادة الوراثية", cat: 0 },
        { q: "أي جهاز في جسم الإنسان يتولى تنقية الدم من الفضلات النيتروجينية؟", options: ["الجهاز الهضمي", "الجهاز البولي (الكليتان)", "الجهاز العصبي", "الجهاز الهيكلي"], answer: 1, pairA: "الكليتان", pairB: "ترشيح الدم والتخلص من الأملاح واليوريا", cat: 1 }
      ]
    },
    {
      label: "📐 رياضيات: الأسس والمعادلات والهندسة",
      title: "فرسان الرياضيات: الحساب الذهني والمعادلات",
      grade: "الثامن",
      subject: "الرياضيات",
      categories: ["الجبر والمعادلات", "الهندسة والقياس"],
      questions: [
        { q: "ما قيمة (س) التي تحقق المعادلة الخطية: 2س + 5 = 17 ؟", options: ["س = 6", "س = 11", "س = 5", "س = 8"], answer: 0, pairA: "حل المعادلة 2س + 5 = 17", pairB: "س يساوي ستة", cat: 0 },
        { q: "في مثلث قائم الزاوية طولا ضلعيه القائمين 6 سم و 8 سم، ما طول الوتر؟", options: ["10 سم", "14 سم", "12 سم", "9 سم"], answer: 0, pairA: "مثلث قائم ضلعاه 6 و 8", pairB: "طول وتره عشرة سنتيمترات", cat: 1 },
        { q: "ما ناتج المقدار الأسي: (3² × 3³) ÷ 3⁴ ؟", options: ["3", "9", "1", "27"], answer: 0, pairA: "عند ضرب الأسس المتشابهة", pairB: "نجمع الأسس ونحتفظ بالأساس", cat: 0 },
        { q: "ما مجموع قياسات الزوايا الداخلية لأي مثلث في المستوى؟", options: ["180 درجة", "360 درجة", "90 درجة", "270 درجة"], answer: 0, pairA: "مجموع زوايا المثلث", pairB: "يساوي مئة وثمانين درجة", cat: 1 },
        { q: "ما جذرا المعادلة التربيعية: س² - 9 = 0 ؟", options: ["3 و -3", "9 و -9", "3 فقط", "0 و 9"], answer: 0, pairA: "تحليل س² - 9", pairB: "(س - 3)(س + 3)", cat: 0 },
        { q: "ما مساحة دائرة طول نصف قطرها 7 سم (علماً بأن π ≈ 22/7)؟", options: ["154 سم²", "44 سم²", "49 سم²", "88 سم²"], answer: 0, pairA: "قانون مساحة الدائرة", pairB: "ط × مربع نصف القطر", cat: 1 }
      ]
    },
    {
      label: "📖 نحو عربي: المرفوعات والنواسخ",
      title: "فرسان الضاد: تحدي القواعد والإعراب",
      grade: "السادس الأساسي",
      subject: "اللغة العربية",
      categories: ["مرفوعات الأسماء", "منصوبات الأسماء"],
      questions: [
        { q: "ما علامة رفع المبتدأ والخبر في جملة: «الطالبانِ مجتهدانِ»؟", options: ["الألف لأنه مثنى", "الضمة الظاهرة", "الواو", "ثبوت النون"], answer: 0, pairA: "يرفع المثنى بـ", pairB: "الألف وينصب ويجر بالياء", cat: 0 },
        { q: "ما إعراب كلمة (المعلمينَ) في جملة: «إنّ المعلمينَ مخلصونَ»؟", options: ["اسم إنّ منصوب وعلامة نصبه الياء", "خبر إنّ مرفوع", "مبتدأ مرفوع", "فاعل مرفوع"], answer: 0, pairA: "اسم إنّ في جمع المذكر", pairB: "منصوب وعلامة نصبه الياء", cat: 1 },
        { q: "ما إعراب كلمة (الدرسَ) في جملة: «فهمَ الطالبُ الدرسَ»؟", options: ["مفعول به منصوب بالفتحة", "فاعل مرفوع", "خبر المبتدأ", "مضاف إليه"], answer: 0, pairA: "المفعول به دائماً", pairB: "اسم منصوب وقع عليه فعل الفاعل", cat: 1 },
        { q: "ما علامة رفع جمع المذكر السالم في جملة: «المهندسونَ بارعونَ»؟", options: ["الواو", "الضمة", "الألف", "الفتحة"], answer: 0, pairA: "يرفع جمع المذكر السالم", pairB: "وعلامة رفعه الواو", cat: 0 },
        { q: "إذا دخلت (كان) على الجملة الاسمية فإنها:", options: ["ترفع المبتدأ وتنصب الخبر", "تنصب المبتدأ وترفع الخبر", "تجر الاسمين", "ترفع الاسمين"], answer: 0, pairA: "خبر كان وأخواتها", pairB: "يكون منصوباً دائماً", cat: 1 },
        { q: "ما إعراب كلمة (أخوك) في جملة: «أخوك ذو خُلُقٍ رفيعٍ»؟", options: ["مبتدأ مرفوع بالواو لأنه من الأسماء الخمسة", "خبر مرفوع", "مفعول به", "بدل"], answer: 0, pairA: "ترفع الأسماء الخمسة", pairB: "بالواو وتنصب بالألف وتجر بالياء", cat: 0 }
      ]
    },
    {
      label: "🇵🇸 فلسطين: جغرافيا وتاريخ ومعالم",
      title: "تحدي المعرفة الوطنية: مدن ومعالم فلسطين",
      grade: "التاسع",
      subject: "الدراسات الاجتماعية",
      categories: ["المدن الساحلية الفلسطينية", "المدن الجبلية والداخلية"],
      questions: [
        { q: "أي مدينة فلسطينية لُقّبت بـ «عروس البحر» وتشتهر ببرتقالها ومينائها العريق؟", options: ["يافا", "أريحا", "طوباس", "بيت لحم"], answer: 0, pairA: "مدينة يافا الساحلية", pairB: "تلقب بعروس البحر المتوسط", cat: 0 },
        { q: "ما أقدم مدينة معروفة في التاريخ وتقع في غور الأردن بفلسطين؟", options: ["أريحا (مدينة القمر)", "صفد", "الرملة", "بئر السبع"], answer: 0, pairA: "مدينة أريحا", pairB: "أقدم مدينة وأخفض بقعة في العالم", cat: 1 },
        { q: "في أي مدينة فلسطينية يقع المسجد الإبراهيمي الشريف وتشتهر بصناعة الزجاج والخزف؟", options: ["الخليل", "حيفا", "عكا", "غزة"], answer: 0, pairA: "مدينة الخليل", pairB: "تضم الحرم الإبراهيمي الشريف", cat: 1 },
        { q: "أي مدينة ساحلية فلسطينية صمدت بأسوارها التاريخية في وجه حملة نابليون عام 1799م؟", options: ["عكا", "نابلس", "جنين", "الناصرة"], answer: 0, pairA: "مدينة عكا", pairB: "أسوار عكا التاريخية على البحر المتوسط", cat: 0 },
        { q: "ما المدينة التي تُعد البوابة الجنوبية لفلسطين وتتميز بساحلها وموقعها التاريخي؟", options: ["غزة ورفح وخان يونس", "طولكرم", "قلقيلية", "سلفيت"], answer: 0, pairA: "حاضرة جنوب الساحل الفلسطيني", pairB: "غزة هاشم وخان يونس ورفح", cat: 0 },
        { q: "في أي مدينة فلسطينية تقع كنيسة المهد ومهد السيد المسيح عليه السلام؟", options: ["بيت لحم", "طبريا", "بيسان", "اللد"], answer: 0, pairA: "مدينة بيت لحم", pairB: "تقع جنوب القدس وتضم كنيسة المهد", cat: 1 }
      ]
    }
  ];

  function loadOfflineGameBank(idx) {
    var b = OFFLINE_GAME_BANKS[idx];
    if (!b) return;
    st.id = "";
    st.title = b.title;
    st.topic = b.title;
    st.grade = b.grade;
    st.subject = b.subject;
    st.categories = b.categories.slice();
    st.questions = JSON.parse(JSON.stringify(b.questions));
    st.dirty = true;
    if ($("gmTopic")) $("gmTopic").value = st.topic;
    if ($("gmGrade")) $("gmGrade").value = st.grade;
    if ($("gmSubject")) $("gmSubject").value = st.subject;
    renderEditor();
    $("gmEditor").scrollIntoView({ behavior: "smooth", block: "start" });
    toast("تم تحميل اللعبة المنهجية الجاهزة («" + b.label + "») بلا إنترنت — اضغط «▶ جرب اللعبة الآن» ✓", "success");
  }

  function exportStandaloneGameHtml() {
    if (!st.questions || !st.questions.length) { toast("ولّد أو اختر لعبة أولاً", "warning"); return; }
    var gameJson = JSON.stringify({
      title: st.title || "لعبة تعليمية",
      grade: st.grade || "",
      subject: st.subject || "",
      questions: st.questions
    });
    var html = '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>لعبة تفاعلية بلا إنترنت — ' + e(st.title || "EduTech Mindset") + '</title>' +
      '<style>*{box-sizing:border-box}body{margin:0;font-family:Tahoma,Arial,sans-serif;background:radial-gradient(circle at top,#1e1b4b,#0f172a 75%);color:#fff;min-height:100vh;padding:16px;text-align:center}.box{max-width:680px;margin:20px auto;background:rgba(255,255,255,0.08);border:1.5px solid rgba(255,255,255,0.2);border-radius:24px;padding:22px}.q{background:#0f172a;border:2px solid #38bdf8;border-radius:18px;padding:18px;font-size:19px;font-weight:900;margin:14px 0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.opt{border:0;border-radius:14px;padding:15px 10px;color:#fff;font-weight:900;font-size:15px;cursor:pointer;font-family:inherit}</style></head><body>' +
      '<div class="box" id="app"></div>' +
      '<script>var G=' + gameJson + ',idx=0,sc=0,streak=0;var cols=["#e11d48","#2563eb","#d97706","#059669"];' +
      'function render(){var b=document.getElementById("app");if(idx>=G.questions.length){b.innerHTML="<div style=\\"font-size:56px\\">🏆</div><h2>أحسنت! أنهيت لعبة: "+G.title+"</h2><div style=\\"font-size:38px;color:#fde047;font-weight:900;margin:14px 0\\">"+sc+" نقطة</div><button onclick=\\"idx=0;sc=0;streak=0;render()\\" style=\\"padding:12px 28px;border-radius:14px;border:0;background:#10b981;color:#fff;font-weight:900;font-size:16px;cursor:pointer\\">🔄 العب مرة أخرى</button>";return;}' +
      'var q=G.questions[idx];b.innerHTML="<div style=\\"display:flex;justify-content:space-between;font-weight:900;font-size:13px\\"><span>🎮 "+G.title+" ("+(idx+1)+"/"+G.questions.length+")</span><span style=\\"color:#fde047\\">⭐ النقاط: "+sc+" | 🔥 متتالية: "+streak+"</span></div><div class=\\"q\\">"+q.q+"</div><div class=\\"grid\\">"+q.options.map(function(o,k){return "<button class=\\"opt\\" style=\\"background:"+cols[k%4]+"\\" onclick=\\"ans("+k+")\\">"+o+"</button>";}).join("")+"</div>";}' +
      'function ans(k){var q=G.questions[idx];if(k===q.answer){streak++;sc+=100+streak*20;}else{streak=0;}idx++;render();}render();</script></body></html>';
    var blob = new Blob([html], { type: "text/html;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "لعبة-تفاعلية-بلا-إنترنت-" + (st.title || "EduTech").slice(0, 28) + ".html";
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 700);
    toast("تم تنزيل اللعبة كملف HTML مستقل يعمل على أي هاتف بلا إنترنت عبر البلوتوث أو واتساب ✓", "success");
  }

  // ---------- توليد لعبة بالذكاء الاصطناعي ----------
  function generate() {
    st.topic = $("gmTopic").value.trim();
    st.grade = $("gmGrade").value;
    st.subject = $("gmSubject").value.trim();
    st.mode = $("gmMode").value;
    var count = +$("gmCount").value || 8;
    if (!st.topic) { toast("اكتب موضوع الدرس أو الصق نصه أولاً", "warning"); return; }

    var btn = $("gmGo"), stat = $("gmStat");
    btn.disabled = true; btn.classList.add("opacity-60");
    stat.textContent = "⏳ جارٍ تصميم اللعبة التفاعلية…";

    var prompt = "أنت مصمم ألعاب تعليمية تفاعلية للمنهاج الفلسطيني عن موضوع: «" + st.topic + "».\n" +
      "الصف: " + st.grade + (st.subject ? " — المادة: " + st.subject : "") + "\n" +
      "أنشئ " + count + " عناصر تفاعلية تصلح لجميع أنماط اللعب (أسئلة اختيار من متعدد + أزواج مطابقة + تصنيف في مجموعتين).\n" +
      "أعد JSON صالحاً فقط بلا أي شرح بهذا الشكل:\n" +
      '{"title":"عنوان اللعبة","categories":["اسم التصنيف 1","اسم التصنيف 2"],"items":[{"q":"نص السؤال؟","options":["خيار 1","خيار 2","خيار 3","خيار 4"],"answer":0,"pairA":"المصطلح أو العنصر","pairB":"التعريف أو ما يناسبه","cat":0}]}' +
      "\nالقواعد: answer هو رقم الخيار الصحيح (0 إلى 3)، وcat هو 0 أو 1 لتحديد أي تصنيف ينتمي إليه العنصر في categories، وpairA/pairB زوج متطابق قصير وواضح للبطاقات.";

    window.AI.ask(prompt, [], "worksheet").then(function (txt) {
      var j = parseJson(txt);
      var items = (j.items || []).map(function (x) {
        var opts = (x.options || []).map(function (o) { return String(o || "").trim().slice(0, 120); }).filter(Boolean).slice(0, 4);
        while (opts.length < 4) opts.push("خيار " + (opts.length + 1));
        var ans = parseInt(x.answer, 10);
        return {
          q: String(x.q || "").trim().slice(0, 260),
          options: opts,
          answer: ans >= 0 && ans < 4 ? ans : 0,
          pairA: String(x.pairA || x.q || "").trim().slice(0, 90),
          pairB: String(x.pairB || opts[ans >= 0 && ans < 4 ? ans : 0] || "").trim().slice(0, 90),
          cat: x.cat === 1 ? 1 : 0
        };
      }).filter(function (x) { return x.q; });
      if (items.length < 3) throw new Error("عدد عناصر اللعبة قليل، أعد المحاولة");
      st.id = "";
      st.title = String(j.title || st.topic || "لعبة تعليمية").slice(0, 110);
      st.categories = Array.isArray(j.categories) && j.categories.length >= 2 ? [String(j.categories[0]).slice(0, 50), String(j.categories[1]).slice(0, 50)] : ["المجموعة الأولى", "المجموعة الثانية"];
      st.questions = items;
      st.dirty = true;
      stat.textContent = "";
      renderEditor();
      $("gmEditor").scrollIntoView({ behavior: "smooth", block: "start" });
    }).catch(function (err) {
      stat.textContent = "⚠️ " + (err && err.message ? err.message : "تعذر توليد اللعبة");
    }).then(function () {
      btn.disabled = false; btn.classList.remove("opacity-60");
    });
  }

  // ---------- تحويل ورقة عمل حالية إلى لعبة فورية ----------
  function fromWorksheet(ws) {
    if (!ws || !ws.sets || !ws.sets.A || !ws.sets.A.length) {
      toast("ولّد أسئلة ورقة العمل أولاً ثم اضغط تحويل إلى لعبة", "warning");
      return;
    }
    var items = [];
    ws.sets.A.forEach(function (q, idx) {
      if (q.t === "mcq") {
        items.push({ q: q.q, options: q.options.slice(0, 4), answer: +q.answer || 0, pairA: q.q.slice(0, 75), pairB: q.options[+q.answer || 0] || "", cat: idx % 2 });
      } else if (q.t === "tf") {
        items.push({ q: q.q, options: ["صح", "خطأ", "غير محدد", "أحياناً"], answer: q.answer ? 0 : 1, pairA: q.q.slice(0, 75), pairB: q.answer ? "صح" : "خطأ", cat: q.answer ? 0 : 1 });
      } else if (q.t === "match" && Array.isArray(q.pairs)) {
        q.pairs.forEach(function (p, k) {
          var others = q.pairs.map(function (z) { return z.b; }).filter(function (b) { return b !== p.b; });
          while (others.length < 3) others.push("خيار بديل " + (others.length + 1));
          items.push({ q: "ما الذي يناسب: «" + p.a + "»؟", options: [p.b, others[0], others[1], others[2]], answer: 0, pairA: p.a, pairB: p.b, cat: k % 2 });
        });
      } else if (q.answer) {
        items.push({ q: q.q, options: [String(q.answer).slice(0, 90), "لا شيء مما ذكر", "معطيات غير كافية", "خيار آخر"], answer: 0, pairA: q.q.slice(0, 75), pairB: String(q.answer).slice(0, 75), cat: idx % 2 });
      }
    });
    if (!items.length) { toast("لم نتمكن من استخراج أسئلة مناسبة للعبة", "warning"); return; }
    st.id = "";
    st.title = "لعبة: " + (ws.title || "درس تفاعلي");
    st.grade = ws.grade || st.grade;
    st.subject = ws.subject || "";
    st.mode = "arena";
    st.categories = ["عبارات صحيحة / أساسية", "تطبيقات ومفاهيم"];
    st.questions = items.slice(0, 15);
    st.dirty = true;
    renderEditor();
    var sec = $("gamesStudio");
    if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
    toast("تم تحويل الورقة إلى لعبة تفاعلية جاهزة للعب والنشر 🎮");
  }

  // ---------- حفظ اللعبة في Firestore ----------
  function saveGame() {
    if (!st.questions.length) return Promise.resolve();
    if (!cloud() || !uid()) {
      toast("سجّل الدخول بحساب Google لحفظ اللعبة ومشاركة رابطها مع الطلاب", "warning");
      if (typeof openGoogleAuthModal === "function") openGoogleAuthModal();
      return Promise.resolve();
    }
    var id = st.id || ("gm" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6));
    var data = {
      ownerUid: uid(),
      ownerEmail: (window.Cloud.user && window.Cloud.user.email) || "",
      title: st.title || "لعبة تعليمية",
      grade: st.grade,
      subject: st.subject,
      mode: st.mode,
      categories: st.categories,
      questions: st.questions,
      open: true,
      updatedAt: window.Cloud.stamp()
    };
    return window.Cloud.col(COL).doc(id).set(data, { merge: true }).then(function () {
      st.id = id; st.dirty = false;
      toast("تم حفظ ونشر اللعبة التفاعلية ✓");
      renderEditor(); loadMine();
    }, function () {
      toast("تعذر حفظ اللعبة — تأكد من نشر قواعد Firestore الجديدة", "warning");
    });
  }

  function loadMine() {
    var box = $("gmMine"); if (!box) return;
    if (!cloud() || !uid()) { box.innerHTML = '<p class="text-[11px] text-slate-500">سجّل الدخول لترى ألعابك المحفوظة ولوحة شرف طلابك.</p>'; return; }
    window.Cloud.col(COL).where("ownerUid", "==", uid()).get().then(function (snap) {
      var list = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
      list.sort(function (a, b) { return ((b.updatedAt && b.updatedAt.seconds) || 0) - ((a.updatedAt && a.updatedAt.seconds) || 0); });
      box._list = list;
      box.innerHTML = list.length ? list.map(function (g) {
        return '<div class="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">' +
          '<div class="flex-1 min-w-0"><div class="text-xs font-extrabold truncate">🎮 ' + e(g.title) + '</div>' +
          '<div class="text-[10px] text-slate-500">' + e(MODES[g.mode] || g.mode) + ' · ' + ((g.questions || []).length) + ' أسئلة · ' + e(g.grade || "") + '</div></div>' +
          '<button type="button" data-gmplay="' + e(g.id) + '" class="px-3 py-1.5 rounded-lg bg-fuchsia-600 text-white text-[11px] font-bold">▶ العب</button>' +
          '<button type="button" data-gmopen="' + e(g.id) + '" class="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-[11px] font-bold">تعديل / النتائج</button>' +
          '<button type="button" data-gmdel="' + e(g.id) + '" class="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold">🗑</button></div>';
      }).join("") : '<p class="text-[11px] text-slate-500">لا توجد ألعاب محفوظة بعد.</p>';
    }, function () {
      box.innerHTML = '<p class="text-[11px] text-rose-500">تعذر تحميل الألعاب المحفوظة.</p>';
    });
  }

  function loadLeaderboard(gameId) {
    var box = $("gmLeaderboard"); if (!box || !gameId || !cloud()) return;
    box.innerHTML = '<p class="text-[11px] text-slate-500 py-2">⏳ جارٍ تحميل لوحة الشرف…</p>';
    window.Cloud.col(SCOL).where("gameId", "==", gameId).get().then(function (snap) {
      var rows = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
      rows.sort(function (a, b) { return (b.score - a.score) || ((a.secs || 999) - (b.secs || 999)); });
      if (!rows.length) {
        box.innerHTML = '<p class="text-[11px] text-slate-500 py-2">لم يسجل الطلاب نقاطاً في هذه اللعبة بعد. انسخ الرابط وأرسله لطلابك!</p>';
        return;
      }
      box.innerHTML = '<div class="rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-slate-900/50 p-3 mt-2">' +
        '<div class="text-xs font-black mb-2">🏆 لوحة شرف الأبطال (' + rows.length + ' مشارك)</div>' +
        '<div class="overflow-x-auto"><table class="w-full text-[11px] font-bold border-collapse bg-white dark:bg-slate-800">' +
        '<thead><tr class="bg-amber-500/20"><th class="p-1.5 border">المركز</th><th class="p-1.5 border text-right">الطالب</th><th class="p-1.5 border">النقاط</th><th class="p-1.5 border">الزمن</th></tr></thead><tbody>' +
        rows.slice(0, 25).map(function (r, i) {
          var medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (i + 1);
          return '<tr><td class="p-1.5 border text-center font-black">' + medal + '</td><td class="p-1.5 border">' + e(r.name) + '</td><td class="p-1.5 border text-center text-emerald-600 font-black">' + r.score + '</td><td class="p-1.5 border text-center">' + (r.secs || 0) + ' ث</td></tr>';
        }).join("") + '</tbody></table></div></div>';
    }, function () {
      box.innerHTML = '<p class="text-[11px] text-slate-500">لوحة الشرف تتطلب نشر قواعد Firestore المحدثة.</p>';
    });
  }

  // ---------- محرر اللعبة ومعاينتها ----------
  function renderEditor() {
    var box = $("gmEditor"); if (!box) return;
    if (!st.questions.length) { box.innerHTML = ""; return; }
    var b = "px-3 py-2 rounded-xl text-[11px] font-extrabold ";
    box.innerHTML = '<div class="glass-card rounded-3xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 space-y-3 text-right">' +
      '<div class="flex flex-wrap gap-2 items-center">' +
      '<input id="gmTitleInp" value="' + e(st.title) + '" class="' + cls + ' flex-1 min-w-[12rem] !text-sm !font-black" placeholder="عنوان اللعبة">' +
      '<select id="gmModeSel" class="' + cls + ' !w-auto">' + Object.keys(MODES).map(function (k) { return '<option value="' + k + '"' + (st.mode === k ? " selected" : "") + '>' + MODES[k] + '</option>'; }).join("") + '</select>' +
      '<button type="button" id="gmPlayNow" class="' + b + 'bg-fuchsia-600 text-white shadow">▶ جرب اللعبة الآن</button>' +
      '<button type="button" id="gmDlOffGame" class="' + b + 'bg-cyan-700 text-white shadow">📥 تنزيل اللعبة بلا إنترنت (.html)</button>' +
      '<button type="button" id="gmLiveHostBtn" class="' + b + 'bg-rose-600 text-white shadow">📡 مسابقة صفية حية (Live PIN)</button>' +
      '<button type="button" id="gmSaveBtn" class="' + b + 'bg-emerald-600 text-white">💾 حفظ ونشر الرابط' + (st.dirty ? " •" : "") + '</button>' +
      '</div>' +
      (st.id ? '<div class="flex flex-wrap gap-1.5 items-center p-2.5 rounded-2xl bg-fuchsia-50/70 dark:bg-slate-900/60 border border-fuchsia-300 dark:border-fuchsia-800">' +
        '<input readonly dir="ltr" value="' + e(gameLink(st.id)) + '" class="' + cls + ' !w-auto flex-1 min-w-[10rem]">' +
        '<button type="button" id="gmCopyLink" class="' + b + 'bg-sky-600 text-white">🔗 نسخ رابط الطلاب</button>' +
        '<button type="button" id="gmPinSubj" class="' + b + 'bg-indigo-600 text-white">📌 انشر في مادة</button>' +
        '<button type="button" id="gmPinClass" class="' + b + 'bg-emerald-700 text-white">🏫 أضف إلى فصل دراسي</button>' +
        '<button type="button" id="gmShowLb" class="' + b + 'bg-amber-500 text-slate-950">🏆 لوحة الشرف</button>' +
        '</div>' : '') +
      '<div id="gmLeaderboard"></div>' +
      '<div class="space-y-2 max-h-96 overflow-y-auto pr-1">' +
      st.questions.map(function (q, i) {
        return '<div class="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 space-y-1.5">' +
          '<div class="flex items-center justify-between gap-2"><span class="text-xs font-black text-fuchsia-600">#' + (i + 1) + '</span>' +
          '<input data-gqi="' + i + '" data-gf="q" value="' + e(q.q) + '" class="' + cls + ' flex-1">' +
          '<button type="button" data-gdel="' + i + '" class="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-600 text-xs font-bold">🗑</button></div>' +
          '<div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">' +
          q.options.map(function (opt, k) {
            return '<label class="flex items-center gap-1 text-[11px]"><input type="radio" name="gmr_' + i + '" data-gqi="' + i + '" data-gans="' + k + '"' + (q.answer === k ? " checked" : "") + '>' +
              '<input data-gqi="' + i + '" data-gopt="' + k + '" value="' + e(opt) + '" class="' + cls + ' !py-1"></label>';
          }).join("") + '</div>' +
          '<div class="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1">' +
          '<input data-gqi="' + i + '" data-gf="pairA" value="' + e(q.pairA || "") + '" class="' + cls + ' !py-1" placeholder="الوجه أ (للمطابقة)">' +
          '<input data-gqi="' + i + '" data-gf="pairB" value="' + e(q.pairB || "") + '" class="' + cls + ' !py-1" placeholder="الوجه ب (للمطابقة)">' +
          '<select data-gqi="' + i + '" data-gcat="1" class="' + cls + ' !py-1"><option value="0"' + (q.cat === 0 ? " selected" : "") + '>تصنيف: ' + e(st.categories[0]) + '</option><option value="1"' + (q.cat === 1 ? " selected" : "") + '>تصنيف: ' + e(st.categories[1]) + '</option></select>' +
          '</div></div>';
      }).join("") + '</div></div>';

    $("gmTitleInp").oninput = function (ev) { st.title = ev.target.value; st.dirty = true; };
    $("gmModeSel").onchange = function (ev) { st.mode = ev.target.value; st.dirty = true; };
    $("gmPlayNow").onclick = function () { launchPlayer(st); };
    if ($("gmDlOffGame")) $("gmDlOffGame").onclick = exportStandaloneGameHtml;
    if ($("gmLiveHostBtn")) $("gmLiveHostBtn").onclick = startHostLiveRoom;
    $("gmSaveBtn").onclick = saveGame;
    if ($("gmCopyLink")) $("gmCopyLink").onclick = function () {
      var l = gameLink(st.id);
      try { navigator.clipboard.writeText(l); toast("تم نسخ رابط اللعبة 🔗"); } catch (x) { prompt("انسخ رابط اللعبة:", l); }
    };
    if ($("gmPinSubj")) $("gmPinSubj").onclick = function () {
      if (window.EduPublish) window.EduPublish.open({ kind: "other", title: "🎮 لعبة: " + st.title, url: gameLink(st.id) });
    };
    if ($("gmPinClass")) $("gmPinClass").onclick = function () {
      if (window.EduClassrooms && window.EduClassrooms.assign) window.EduClassrooms.assign({ kind: "game", title: st.title, url: gameLink(st.id), refId: st.id });
    };
    if ($("gmShowLb")) $("gmShowLb").onclick = function () { loadLeaderboard(st.id); };

    box.querySelectorAll("[data-gqi]").forEach(function (el) {
      el.addEventListener("input", function () {
        var i = +el.dataset.gqi, q = st.questions[i]; if (!q) return;
        if (el.dataset.gf) q[el.dataset.gf] = el.value;
        else if (el.dataset.gopt !== undefined) q.options[+el.dataset.gopt] = el.value;
        st.dirty = true;
      });
      el.addEventListener("change", function () {
        var i = +el.dataset.gqi, q = st.questions[i]; if (!q) return;
        if (el.dataset.gans !== undefined) q.answer = +el.dataset.gans;
        else if (el.dataset.gcat) q.cat = +el.value;
        st.dirty = true;
      });
    });
    box.querySelectorAll("[data-gdel]").forEach(function (bt) {
      bt.onclick = function () {
        if (st.questions.length <= 2) { toast("يجب إبقاء سؤالين على الأقل", "warning"); return; }
        st.questions.splice(+bt.dataset.gdel, 1);
        st.dirty = true;
        renderEditor();
      };
    });
  }

  // ---------- مشغّل الألعاب التفاعلي الكامل (للطلاب والمعلم) ----------
  function launchPlayer(gameData, standalone) {
    var ov = $("gmOverlay");
    if (!ov) {
      ov = document.createElement("div");
      ov.id = "gmOverlay";
      ov.style.cssText = "position:fixed;inset:0;z-index:450;background:radial-gradient(circle at top,#1e1b4b,#0f172a 75%);color:#fff;overflow-y:auto;direction:rtl;font-family:Cairo,Tahoma,sans-serif;padding:16px";
      document.body.appendChild(ov);
    }
    document.documentElement.style.overflow = "hidden";
    var playerName = localStorage.getItem("edu_student_name") || "";
    var activeMode = gameData.mode || "arena";

    function closePlayer() {
      if (standalone) { location.href = location.pathname; return; }
      ov.remove();
      document.documentElement.style.overflow = "";
    }

    function showIntro() {
      ov.innerHTML = '<div style="max-width:740px;margin:20px auto;background:rgba(255,255,255,0.08);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,0.18);border-radius:28px;padding:24px;text-align:center">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">' +
        '<span style="background:#d946ef;color:#fff;padding:4px 14px;border-radius:99px;font-size:12px;font-weight:900">🎮 مختبر الألعاب التفاعلية</span>' +
        '<button type="button" id="gmCloseBtn" style="background:rgba(255,255,255,0.15);border:0;color:#fff;padding:6px 14px;border-radius:12px;cursor:pointer;font-weight:800;font-family:inherit">✕ إغلاق</button></div>' +
        '<h1 style="font-size:26px;font-weight:900;margin:8px 0">' + e(gameData.title) + '</h1>' +
        '<p style="color:#cbd5e1;font-size:13px;margin-bottom:18px">' + e([gameData.grade, gameData.subject].filter(Boolean).join(" • ")) + ' · ' + ((gameData.questions || []).length) + ' تحديات</p>' +
        '<div style="max-width:380px;margin:0 auto 18px;text-align:right">' +
        '<label style="font-size:12px;font-weight:800;display:block;margin-bottom:6px">اسم البطل (للوحة الشرف 🏆):</label>' +
        '<input id="gmPlayerName" value="' + e(playerName) + '" placeholder="اكتب اسمك هنا…" style="width:100%;padding:10px 14px;border-radius:14px;border:2px solid #a855f7;background:#0f172a;color:#fff;font-family:inherit;font-size:14px;font-weight:800">' +
        '<label style="font-size:12px;font-weight:800;display:block;margin:12px 0 6px">اختر نمط اللعب المفضل لديك:</label>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
        Object.keys(MODES).map(function (k) {
          var sel = activeMode === k;
          return '<button type="button" data-pickmode="' + k + '" style="padding:10px;border-radius:14px;border:2px solid ' + (sel ? "#f59e0b" : "rgba(255,255,255,0.2)") + ';background:' + (sel ? "rgba(245,158,11,0.22)" : "rgba(255,255,255,0.06)") + ';color:#fff;font-family:inherit;font-size:12px;font-weight:800;cursor:pointer;text-align:right">' + MODES[k].split(" (")[0] + '</button>';
        }).join("") +
        '</div></div>' +
        '<button type="button" id="gmStartPlay" style="background:linear-gradient(135deg,#d946ef,#6366f1);border:0;color:#fff;padding:14px 36px;border-radius:18px;font-size:17px;font-weight:900;cursor:pointer;font-family:inherit;box-shadow:0 10px 25px rgba(217,70,239,0.4)">🚀 ابدأ اللعب الآن!</button>' +
        '<div id="gmIntroLb" style="margin-top:20px;text-align:right"></div>' +
        '</div>';

      $("gmCloseBtn").onclick = closePlayer;
      ov.querySelectorAll("[data-pickmode]").forEach(function (b) {
        b.onclick = function () { activeMode = b.dataset.pickmode; showIntro(); };
      });
      $("gmStartPlay").onclick = function () {
        var nm = $("gmPlayerName").value.trim() || "بطل مجهول";
        playerName = nm;
        try { localStorage.setItem("edu_student_name", nm); } catch (x) {}
        beep(660, 0.15, "triangle");
        if (activeMode === "wheel") playWheel(nm);
        else if (activeMode === "match") playMatch(nm);
        else if (activeMode === "sort") playSort(nm);
        else if (activeMode === "order") playOrder(nm);
        else playArena(nm);
      };
    }

    function finishGame(name, score, startMs) {
      var secs = Math.max(1, Math.round((Date.now() - startMs) / 1000));
      beep(880, 0.3, "triangle");
      if (window.EduBadges && window.EduBadges.award) window.EduBadges.award("gamer_hero", 60);
      if (gameData.id) {
        try { localStorage.setItem("game_done_" + gameData.id, JSON.stringify({ name: name, score: score, secs: secs })); } catch (x) {}
        if (cloud()) {
          var sid = "gs" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
          window.Cloud.col(SCOL).doc(sid).set({
            gameId: gameData.id,
            ownerUid: gameData.ownerUid || "",
            name: name.slice(0, 50),
            mode: activeMode,
            score: score,
            secs: secs,
            at: window.Cloud.stamp()
          }).catch(function () {});
        }
      }
      ov.innerHTML = '<div style="max-width:640px;margin:30px auto;background:rgba(255,255,255,0.1);border:2px solid #f59e0b;border-radius:28px;padding:28px;text-align:center">' +
        '<div style="font-size:68px">🏆</div>' +
        '<h2 style="font-size:28px;font-weight:900;margin:6px 0;color:#fde047">أحسنت يا ' + e(name) + '!</h2>' +
        '<p style="font-size:15px;color:#e2e8f0">أنهيت تحدي «' + e(gameData.title) + '» بنجاح</p>' +
        '<div style="font-size:46px;font-weight:900;color:#34d399;margin:16px 0">' + score + ' نقطة</div>' +
        '<div style="font-size:13px;color:#cbd5e1;margin-bottom:22px">⏱ الزمن المستغرق: ' + secs + ' ثانية</div>' +
        '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">' +
        '<button type="button" id="gmReplay" style="background:#10b981;border:0;color:#fff;padding:12px 24px;border-radius:14px;font-weight:900;cursor:pointer;font-family:inherit">🔄 العب مرة أخرى أو غيّر النمط</button>' +
        '<button type="button" id="gmExit" style="background:#475569;border:0;color:#fff;padding:12px 24px;border-radius:14px;font-weight:900;cursor:pointer;font-family:inherit">العودة للمنصة</button>' +
        '</div></div>';
      $("gmReplay").onclick = showIntro;
      $("gmExit").onclick = closePlayer;
    }

    // 1. نمط سباق الأبطال (Kahoot-style Arena)
    function playArena(name) {
      var qs = shuf(gameData.questions || []), idx = 0, score = 0, streak = 0, startMs = Date.now();
      var lifelines = { fifty: true, dbl: true };
      var dblActive = false;

      function step() {
        if (idx >= qs.length) return finishGame(name, score, startMs);
        var q = qs[idx], hiddenOpts = {};
        ov.innerHTML = '<div style="max-width:720px;margin:15px auto;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);border-radius:24px;padding:20px">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;font-weight:900;font-size:13px;margin-bottom:12px">' +
          '<span>السؤال ' + (idx + 1) + ' / ' + qs.length + '</span>' +
          '<span style="color:#fde047">⭐ النقاط: ' + score + (streak > 1 ? ' 🔥 x' + streak : '') + '</span>' +
          '<button type="button" id="gmQuit" style="background:rgba(255,255,255,0.15);border:0;color:#fff;padding:4px 12px;border-radius:10px;cursor:pointer;font-family:inherit">خروج</button></div>' +
          '<div style="background:rgba(15,23,42,0.8);border-radius:18px;padding:18px;font-size:18px;font-weight:900;line-height:1.7;margin-bottom:14px;text-align:center">' + e(q.q) + '</div>' +
          '<div style="display:flex;gap:8px;justify-content:center;margin-bottom:14px">' +
          (lifelines.fifty ? '<button type="button" id="ll50" style="background:#0284c7;border:0;color:#fff;padding:6px 14px;border-radius:10px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit">✂️ حذف خيارين (50/50)</button>' : '') +
          (lifelines.dbl ? '<button type="button" id="llDbl" style="background:#d97706;border:0;color:#fff;padding:6px 14px;border-radius:10px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit">⚡ مضاعفة نقاط هذا السؤال</button>' : '') +
          '</div>' +
          '<div id="gmArenaOpts" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
          q.options.map(function (opt, k) {
            var cols = ["#e11d48", "#2563eb", "#d97706", "#059669"];
            return '<button type="button" data-ans="' + k + '" style="background:' + cols[k % 4] + ';border:0;color:#fff;padding:16px 12px;border-radius:16px;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;min-height:70px;transition:transform 0.15s">' + e(opt) + '</button>';
          }).join("") + '</div><div id="gmArenaFb" style="text-align:center;margin-top:12px;font-weight:900;font-size:15px"></div></div>';

        $("gmQuit").onclick = showIntro;
        if ($("ll50")) $("ll50").onclick = function () {
          lifelines.fifty = false;
          var wrong = [0, 1, 2, 3].filter(function (k) { return k !== q.answer; });
          shuf(wrong).slice(0, 2).forEach(function (k) {
            var b = ov.querySelector('[data-ans="' + k + '"]');
            if (b) { b.disabled = true; b.style.opacity = "0.2"; }
          });
          $("ll50").remove();
        };
        if ($("llDbl")) $("llDbl").onclick = function () {
          lifelines.dbl = false; dblActive = true;
          $("llDbl").textContent = "⚡ المضاعفة مفعّلة!";
          $("llDbl").disabled = true;
        };

        ov.querySelectorAll("[data-ans]").forEach(function (bt) {
          bt.onclick = function () {
            var k = +bt.dataset.ans, ok = k === q.answer;
            ov.querySelectorAll("[data-ans]").forEach(function (x) {
              x.disabled = true;
              if (+x.dataset.ans === q.answer) x.style.outline = "4px solid #fde047";
              else if (+x.dataset.ans === k) x.style.opacity = "0.4";
            });
            if (ok) {
              streak++;
              var pts = (100 + streak * 20) * (dblActive ? 2 : 1);
              score += pts;
              beep(780, 0.18, "triangle");
              $("gmArenaFb").innerHTML = '<span style="color:#34d399">✅ إجابة صحيحة! +' + pts + ' نقطة</span>';
            } else {
              streak = 0;
              beep(220, 0.25, "sawtooth");
              $("gmArenaFb").innerHTML = '<span style="color:#f87171">❌ إجابة غير صحيحة! الصواب: ' + e(q.options[q.answer]) + '</span>';
            }
            dblActive = false;
            setTimeout(function () { idx++; step(); }, 1300);
          };
        });
      }
      step();
    }

    // 2. نمط عجلة الحظ الدوّارة (Spin the Wheel)
    function playWheel(name) {
      var remaining = (gameData.questions || []).slice(), score = 0, startMs = Date.now(), angle = 0, spinning = false;
      var COLORS = ["#e11d48", "#2563eb", "#059669", "#d97706", "#7c3aed", "#0891b2", "#db2777", "#4f46e5"];

      function renderWheelScreen() {
        if (!remaining.length) return finishGame(name, score, startMs);
        ov.innerHTML = '<div style="max-width:700px;margin:15px auto;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);border-radius:24px;padding:20px;text-align:center">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;font-weight:900;font-size:13px;margin-bottom:10px">' +
          '<span>🎡 المتبقي في العجلة: ' + remaining.length + '</span>' +
          '<span style="color:#fde047">⭐ النقاط: ' + score + '</span>' +
          '<button type="button" id="gmQuit" style="background:rgba(255,255,255,0.15);border:0;color:#fff;padding:4px 12px;border-radius:10px;cursor:pointer;font-family:inherit">خروج</button></div>' +
          '<div style="position:relative;width:300px;height:300px;margin:10px auto">' +
          '<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);font-size:28px;z-index:5">🔻</div>' +
          '<canvas id="gmWheelCv" width="300" height="300" style="width:300px;height:300px;border-radius:50%;box-shadow:0 0 25px rgba(0,0,0,0.5)"></canvas></div>' +
          '<button type="button" id="gmSpinBtn" style="margin-top:10px;background:linear-gradient(135deg,#f59e0b,#ea580c);border:0;color:#fff;padding:12px 32px;border-radius:16px;font-size:16px;font-weight:900;cursor:pointer;font-family:inherit">🎡 أدر عجلة الحظ!</button>' +
          '<div id="gmWheelQ" style="margin-top:16px;text-align:right"></div></div>';

        $("gmQuit").onclick = showIntro;
        var cv = $("gmWheelCv"), ctx = cv.getContext("2d");

        function drawWheel(rot) {
          ctx.clearRect(0, 0, 300, 300);
          var n = remaining.length, arc = (Math.PI * 2) / n;
          for (var i = 0; i < n; i++) {
            var a0 = rot + i * arc, a1 = a0 + arc;
            ctx.beginPath();
            ctx.moveTo(150, 150);
            ctx.arc(150, 150, 144, a0, a1);
            ctx.closePath();
            ctx.fillStyle = COLORS[i % COLORS.length];
            ctx.fill();
            ctx.lineWidth = 2; ctx.strokeStyle = "#fff"; ctx.stroke();
            ctx.save();
            ctx.translate(150, 150);
            ctx.rotate(a0 + arc / 2);
            ctx.fillStyle = "#fff";
            ctx.font = "900 13px Cairo, sans-serif";
            ctx.textAlign = "right";
            ctx.fillText("سؤال " + (i + 1), 130, 5);
            ctx.restore();
          }
        }
        drawWheel(angle);

        $("gmSpinBtn").onclick = function () {
          if (spinning) return;
          spinning = true;
          $("gmSpinBtn").disabled = true;
          var extra = Math.PI * 6 + Math.random() * Math.PI * 4;
          var startA = angle, t0 = performance.now(), dur = 2200;
          function anim(now) {
            var p = Math.min(1, (now - t0) / dur);
            var ease = 1 - Math.pow(1 - p, 3);
            angle = startA + extra * ease;
            drawWheel(angle);
            if (p < 1) requestAnimationFrame(anim);
            else {
              spinning = false;
              beep(640, 0.15, "triangle");
              var pickIdx = Math.floor(Math.random() * remaining.length);
              var q = remaining[pickIdx];
              var qb = $("gmWheelQ");
              qb.innerHTML = '<div style="background:rgba(15,23,42,0.9);border:2px solid #f59e0b;border-radius:18px;padding:16px">' +
                '<div style="font-size:16px;font-weight:900;margin-bottom:10px">' + e(q.q) + '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
                q.options.map(function (opt, k) {
                  return '<button type="button" data-wans="' + k + '" style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);color:#fff;padding:10px;border-radius:12px;font-family:inherit;font-weight:800;cursor:pointer">' + e(opt) + '</button>';
                }).join("") + '</div></div>';
              qb.querySelectorAll("[data-wans]").forEach(function (bt) {
                bt.onclick = function () {
                  var k = +bt.dataset.wans;
                  if (k === q.answer) {
                    score += 150;
                    beep(820, 0.2, "triangle");
                  } else {
                    beep(240, 0.2, "sawtooth");
                  }
                  remaining.splice(pickIdx, 1);
                  setTimeout(renderWheelScreen, 600);
                };
              });
            }
          }
          requestAnimationFrame(anim);
        };
      }
      renderWheelScreen();
    }

    // 3. نمط مطابقة البطاقات (Memory & Concept Match)
    function playMatch(name) {
      var pairs = (gameData.questions || []).slice(0, 8), cards = [], startMs = Date.now(), score = 0, matched = 0, first = null, lock = false;
      pairs.forEach(function (q, i) {
        cards.push({ id: "a" + i, pid: i, text: q.pairA || q.q.slice(0, 60), kind: "A" });
        cards.push({ id: "b" + i, pid: i, text: q.pairB || q.options[q.answer], kind: "B" });
      });
      cards = shuf(cards);

      ov.innerHTML = '<div style="max-width:740px;margin:15px auto;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);border-radius:24px;padding:20px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;font-weight:900;font-size:13px;margin-bottom:12px">' +
        '<span>🃏 طابق كل مفهوم بما يناسبه (' + pairs.length + ' أزواج)</span>' +
        '<span id="gmMatchScore" style="color:#fde047">⭐ النقاط: 0</span>' +
        '<button type="button" id="gmQuit" style="background:rgba(255,255,255,0.15);border:0;color:#fff;padding:4px 12px;border-radius:10px;cursor:pointer;font-family:inherit">خروج</button></div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px" id="gmCardsGrid">' +
        cards.map(function (c, idx) {
          return '<button type="button" data-cidx="' + idx + '" style="background:rgba(30,41,59,0.9);border:2px solid rgba(255,255,255,0.2);color:#fff;padding:14px 10px;border-radius:16px;min-height:92px;font-family:inherit;font-size:13px;font-weight:800;cursor:pointer;line-height:1.5;transition:all 0.2s">' + e(c.text) + '</button>';
        }).join("") + '</div></div>';

      $("gmQuit").onclick = showIntro;
      ov.querySelectorAll("[data-cidx]").forEach(function (bt) {
        bt.onclick = function () {
          if (lock || bt.disabled) return;
          var idx = +bt.dataset.cidx, card = cards[idx];
          bt.style.borderColor = "#f59e0b";
          bt.style.background = "rgba(245,158,11,0.25)";
          if (!first) { first = { idx: idx, card: card, el: bt }; return; }
          if (first.idx === idx) return;
          lock = true;
          if (first.card.pid === card.pid && first.card.kind !== card.kind) {
            score += 120; matched++;
            beep(800, 0.18, "triangle");
            first.el.style.background = "rgba(16,185,129,0.35)";
            first.el.style.borderColor = "#10b981";
            bt.style.background = "rgba(16,185,129,0.35)";
            bt.style.borderColor = "#10b981";
            first.el.disabled = true; bt.disabled = true;
            $("gmMatchScore").textContent = "⭐ النقاط: " + score;
            first = null; lock = false;
            if (matched >= pairs.length) setTimeout(function () { finishGame(name, score, startMs); }, 600);
          } else {
            score = Math.max(0, score - 15);
            beep(240, 0.2, "sawtooth");
            $("gmMatchScore").textContent = "⭐ النقاط: " + score;
            var fEl = first.el;
            first = null;
            setTimeout(function () {
              fEl.style.borderColor = "rgba(255,255,255,0.2)";
              fEl.style.background = "rgba(30,41,59,0.9)";
              bt.style.borderColor = "rgba(255,255,255,0.2)";
              bt.style.background = "rgba(30,41,59,0.9)";
              lock = false;
            }, 650);
          }
        };
      });
    }

    // 4. نمط تصنيف المجموعات (Category Sorter)
    function playSort(name) {
      var items = shuf(gameData.questions || []), idx = 0, score = 0, startMs = Date.now();
      var cats = gameData.categories && gameData.categories.length >= 2 ? gameData.categories : ["المجموعة الأولى", "المجموعة الثانية"];

      function step() {
        if (idx >= items.length) return finishGame(name, score, startMs);
        var curIt = items[idx];
        ov.innerHTML = '<div style="max-width:680px;margin:20px auto;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);border-radius:24px;padding:22px;text-align:center">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;font-weight:900;font-size:13px;margin-bottom:14px">' +
          '<span>🗂 العنصر ' + (idx + 1) + ' من ' + items.length + '</span>' +
          '<span style="color:#fde047">⭐ النقاط: ' + score + '</span>' +
          '<button type="button" id="gmQuit" style="background:rgba(255,255,255,0.15);border:0;color:#fff;padding:4px 12px;border-radius:10px;cursor:pointer;font-family:inherit">خروج</button></div>' +
          '<div style="font-size:13px;color:#cbd5e1;margin-bottom:8px">صنّف العبارة أو المفهوم التالي في المجموعة الصحيحة:</div>' +
          '<div style="background:rgba(15,23,42,0.85);border:2px solid #38bdf8;border-radius:20px;padding:22px;font-size:19px;font-weight:900;margin-bottom:18px">' + e(curIt.pairA || curIt.q) + '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
          '<button type="button" data-scat="0" style="background:linear-gradient(135deg,#0284c7,#1d4ed8);border:0;color:#fff;padding:18px;border-radius:18px;font-size:16px;font-weight:900;cursor:pointer;font-family:inherit">📥 ' + e(cats[0]) + '</button>' +
          '<button type="button" data-scat="1" style="background:linear-gradient(135deg,#059669,#047857);border:0;color:#fff;padding:18px;border-radius:18px;font-size:16px;font-weight:900;cursor:pointer;font-family:inherit">📥 ' + e(cats[1]) + '</button>' +
          '</div></div>';

        $("gmQuit").onclick = showIntro;
        ov.querySelectorAll("[data-scat]").forEach(function (bt) {
          bt.onclick = function () {
            var c = +bt.dataset.scat;
            if (c === (curIt.cat || 0)) {
              score += 100;
              beep(780, 0.16, "triangle");
            } else {
              beep(240, 0.2, "sawtooth");
            }
            idx++;
            step();
          };
        });
      }
      step();
    }

    // 5. نمط ترتيب وبناء الجمل والمفاهيم (Sentence & Concept Builder)
    function playOrder(name) {
      var items = shuf(gameData.questions || []), idx = 0, score = 0, startMs = Date.now();
      function step() {
        if (idx >= items.length) return finishGame(name, score, startMs);
        var q = items[idx];
        var targetSentence = String(q.pairB && q.pairB.split(/\s+/).length >= 3 ? q.pairB : (q.pairA + " هو " + (q.options[q.answer] || q.pairB))).trim();
        var words = targetSentence.split(/\s+/).filter(Boolean);
        if (words.length < 3) words = [q.pairA || "المفهوم", "يناسبه", q.options[q.answer] || "الإجابة"];
        var pool = shuf(words.map(function (w, i) { return { i: i, w: w, used: false }; }));
        var picked = [];

        function paintOrder() {
          ov.innerHTML = '<div style="max-width:700px;margin:20px auto;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);border-radius:24px;padding:22px;text-align:center">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;font-weight:900;font-size:13px;margin-bottom:12px">' +
            '<span>🧩 التحدي ' + (idx + 1) + ' من ' + items.length + '</span>' +
            '<span style="color:#fde047">⭐ النقاط: ' + score + '</span>' +
            '<button type="button" id="gmQuit" style="background:rgba(255,255,255,0.15);border:0;color:#fff;padding:4px 12px;border-radius:10px;cursor:pointer;font-family:inherit">خروج</button></div>' +
            '<div style="font-size:15px;font-weight:800;color:#cbd5e1;margin-bottom:10px">رتّب الكلمات التالية لتكوين الإجابة أو العبارة الصحيحة لـ:<br><b style="color:#fff;font-size:17px">' + e(q.q) + '</b></div>' +
            '<div style="min-height:68px;background:rgba(15,23,42,0.85);border:2px dashed #38bdf8;border-radius:18px;padding:12px;display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;margin-bottom:16px">' +
            (picked.length ? picked.map(function (p, pi) {
              return '<button type="button" data-unpick="' + pi + '" style="background:#0284c7;border:0;color:#fff;padding:8px 14px;border-radius:12px;font-family:inherit;font-weight:900;font-size:15px;cursor:pointer">' + e(p.w) + '</button>';
            }).join("") : '<span style="color:#64748b;font-size:13px">اضغط على الكلمات بالأسفل بالترتيب الصحيح…</span>') +
            '</div>' +
            '<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:16px">' +
            pool.map(function (p, pi) {
              return '<button type="button" data-pickw="' + pi + '" ' + (p.used ? "disabled" : "") + ' style="background:' + (p.used ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.16)") + ';opacity:' + (p.used ? "0.25" : "1") + ';border:1px solid rgba(255,255,255,0.3);color:#fff;padding:8px 14px;border-radius:12px;font-family:inherit;font-weight:800;font-size:14px;cursor:pointer">' + e(p.w) + '</button>';
            }).join("") + '</div>' +
            '<div style="display:flex;gap:10px;justify-content:center">' +
            '<button type="button" id="gmOrdReset" style="background:#475569;border:0;color:#fff;padding:10px 20px;border-radius:12px;font-family:inherit;font-weight:800;cursor:pointer">↺ إعادة ترتيب</button>' +
            '<button type="button" id="gmOrdHint" style="background:#d97706;border:0;color:#fff;padding:10px 20px;border-radius:12px;font-family:inherit;font-weight:800;cursor:pointer">💡 تلميح</button>' +
            '</div></div>';

          $("gmQuit").onclick = showIntro;
          $("gmOrdReset").onclick = function () { pool.forEach(function (p) { p.used = false; }); picked = []; paintOrder(); };
          $("gmOrdHint").onclick = function () {
            var nextIdx = picked.length;
            if (nextIdx >= words.length) return;
            var targetWord = words[nextIdx];
            var found = pool.filter(function (p) { return !p.used && p.w === targetWord; })[0];
            if (found) { found.used = true; picked.push(found); checkDone(); }
          };
          ov.querySelectorAll("[data-pickw]").forEach(function (bt) {
            bt.onclick = function () {
              var p = pool[+bt.dataset.pickw];
              if (!p || p.used) return;
              p.used = true; picked.push(p);
              checkDone();
            };
          });
          ov.querySelectorAll("[data-unpick]").forEach(function (bt) {
            bt.onclick = function () {
              var rem = picked.splice(+bt.dataset.unpick, 1)[0];
              if (rem) rem.used = false;
              paintOrder();
            };
          });
        }

        function checkDone() {
          if (picked.length < words.length) { paintOrder(); return; }
          var built = picked.map(function (p) { return p.w; }).join(" ");
          if (built === words.join(" ")) {
            score += 130;
            beep(820, 0.2, "triangle");
            idx++;
            setTimeout(step, 400);
          } else {
            beep(230, 0.2, "sawtooth");
            pool.forEach(function (p) { p.used = false; });
            picked = [];
            paintOrder();
          }
        }
        paintOrder();
      }
      step();
    }

    showIntro();
  }

  // ---------- بناء قسم الألعاب في الصفحة ----------
  function build() {
    if ($("gamesStudio")) return true;
    var anchor = $("worksheetStudio") || $("slidesStudio") || $("teacherTools") || $("aiStudio");
    if (!anchor) return false;
    var s = document.createElement("section");
    s.id = "gamesStudio";
    s.className = "py-12 scroll-mt-20";
    s.innerHTML = '<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">' +
      '<div class="glass-card rounded-3xl border border-slate-200 dark:border-slate-700/90 shadow-xl overflow-hidden">' +
      '<div class="p-5 sm:p-6 bg-gradient-to-l from-fuchsia-700 via-purple-800 to-slate-900 text-white">' +
      '<div class="flex items-center gap-2 text-xs font-extrabold text-amber-300 mb-1">🎮 مولّد الألعاب التربوية والمسابقات التفاعلية (شبيه Wordwall & Kahoot)</div>' +
      '<h2 class="text-xl sm:text-2xl font-black">حوّل أي درس إلى لعبة تفاعلية ومسابقة صفية في ثوانٍ</h2>' +
      '<p class="text-xs text-white/85 mt-1">ولّد ألعاب سباق الأبطال، عجلة الحظ، مطابقة البطاقات، وتصنيف المجموعات بالذكاء الاصطناعي وشارك رابطها المباشر مع طلابك مع لوحة شرف حية.</p>' +
      '</div>' +
      '<div class="p-5 sm:p-6 space-y-3 text-right">' +
      '<div class="p-3 rounded-2xl bg-fuchsia-50/70 dark:bg-slate-800/80 border border-fuchsia-200 dark:border-slate-700 space-y-1.5">' +
      '<div class="text-[11px] font-black text-fuchsia-800 dark:text-fuchsia-300">🕹 بنوك ألعاب تربوية منهجية جاهزة فوراً (تعمل 100% بلا إنترنت بضغطة زر):</div>' +
      '<div class="flex flex-wrap gap-1.5">' +
      OFFLINE_GAME_BANKS.map(function (b, idx) {
        return '<button type="button" data-gmbank="' + idx + '" class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-fuchsia-300 dark:border-slate-700 text-[11px] font-extrabold hover:bg-fuchsia-600 hover:text-white transition-all">' + e(b.label) + '</button>';
      }).join("") + '</div></div>' +
      '<div><label class="block text-xs font-bold mb-1">موضوع الدرس أو نصه</label><textarea id="gmTopic" rows="2" maxlength="5000" class="' + cls + '" placeholder="مثال: الجهاز الهضمي ووظائف أعضائه — أو الصق فقرة من الكتاب المدرسي"></textarea></div>' +
      '<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">' +
      '<div><label class="block text-xs font-bold mb-1">نمط اللعبة الافتراضي</label><select id="gmMode" class="' + cls + '">' + Object.keys(MODES).map(function (k) { return '<option value="' + k + '">' + MODES[k] + '</option>'; }).join("") + '</select></div>' +
      '<div><label class="block text-xs font-bold mb-1">الصف</label><select id="gmGrade" class="' + cls + '">' + GRADES.map(function (g) { return '<option' + (g === st.grade ? " selected" : "") + '>' + g + '</option>'; }).join("") + '</select></div>' +
      '<div><label class="block text-xs font-bold mb-1">المادة</label><input id="gmSubject" class="' + cls + '" placeholder="علوم، لغة عربية…"></div>' +
      '<div><label class="block text-xs font-bold mb-1">عدد التحديات</label><select id="gmCount" class="' + cls + '"><option>6</option><option selected>8</option><option>10</option><option>12</option></select></div>' +
      '</div>' +
      '<div class="flex flex-wrap items-center gap-2"><button id="gmGo" type="button" class="px-6 py-3 rounded-xl bg-gradient-to-l from-fuchsia-600 to-purple-600 text-white text-xs font-black shadow-md flex items-center gap-2"><i class="fa-solid fa-gamepad"></i><span>ولّد اللعبة التفاعلية</span></button><button id="gmJoinLiveBtn" type="button" class="px-4 py-3 rounded-xl bg-rose-600 text-white text-xs font-black shadow-md">📡 انضم لمسابقة حية برمز PIN</button><span id="gmStat" class="text-[11px] font-bold text-slate-500"></span></div>' +
      '</div></div>' +
      '<div id="gmEditor"></div>' +
      '<div class="glass-card rounded-3xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 text-right"><div class="flex items-center justify-between mb-2"><h3 class="text-sm font-black">🕹 ألعابي التفاعلية المحفوظة</h3><button type="button" id="gmReload" class="text-[11px] font-bold text-brand-600">تحديث</button></div><div id="gmMine" class="space-y-2"></div></div>' +
      '</div>';

    anchor.parentNode.insertBefore(s, anchor.nextSibling);
    $("gmGo").onclick = generate;
    s.querySelectorAll("[data-gmbank]").forEach(function (bt) { bt.onclick = function () { loadOfflineGameBank(+bt.dataset.gmbank); }; });
    if ($("gmJoinLiveBtn")) $("gmJoinLiveBtn").onclick = function () { joinLiveRoomStudent(); };
    $("gmReload").onclick = loadMine;
    $("gmMine").addEventListener("click", function (ev) {
      var pl = ev.target.closest("[data-gmplay]"), op = ev.target.closest("[data-gmopen]"), dl = ev.target.closest("[data-gmdel]"), list = $("gmMine")._list || [];
      if (pl) { var g1 = list.filter(function (x) { return x.id === pl.dataset.gmplay; })[0]; if (g1) launchPlayer(g1); }
      if (op) {
        var g2 = list.filter(function (x) { return x.id === op.dataset.gmopen; })[0];
        if (g2) {
          st = Object.assign({ categories: ["المجموعة أ", "المجموعة ب"] }, g2, { dirty: false });
          renderEditor();
          loadLeaderboard(g2.id);
          $("gmEditor").scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
      if (dl && confirm("حذف هذه اللعبة نهائياً؟")) {
        window.Cloud.col(COL).doc(dl.dataset.gmdel).delete().then(function () { loadMine(); toast("تم حذف اللعبة"); });
      }
    });
    loadMine();
    var tries = 0, w = setInterval(function () { if (uid() || ++tries > 20) { clearInterval(w); loadMine(); } }, 1000);
    return true;
  }

  // ---------- فتح رابط لعبة مباشر للطلاب ?g=ID ----------

  // ---------- غرفة المسابقات الصفية الحية (Live Classroom Battle Room — ?live=PIN) ----------
  var liveUnsub = null, liveScoreUnsub = null;
  function stopLiveListeners() {
    if (liveUnsub) { try { liveUnsub(); } catch (x) {} liveUnsub = null; }
    if (liveScoreUnsub) { try { liveScoreUnsub(); } catch (x) {} liveScoreUnsub = null; }
  }

  function startHostLiveRoom() {
    if (!st.questions.length) { toast("ولّد أسئلة اللعبة أولاً", "warning"); return; }
    if (!cloud() || !uid()) { toast("سجّل الدخول بحساب Google لفتح غرفة مسابقة صفية حية", "warning"); return; }
    var pin = String(Math.floor(10000 + Math.random() * 90000));
    var roomData = {
      pin: pin,
      ownerUid: uid(),
      title: st.title || "مسابقة صفية حية",
      grade: st.grade || "",
      subject: st.subject || "",
      questions: st.questions,
      status: "waiting",
      qIndex: 0,
      updatedAt: window.Cloud.stamp()
    };
    window.Cloud.col("liveRooms").doc(pin).set(roomData).then(function () {
      openHostLiveOverlay(pin, roomData);
    }, function () {
      toast("تعذر إنشاء الغرفة الحية — تأكد من نشر قواعد Firestore المحدثة (الإصدار 44)", "warning");
    });
  }

  function openHostLiveOverlay(pin, roomData) {
    stopLiveListeners();
    var ov = $("gmLiveOv");
    if (!ov) {
      ov = document.createElement("div");
      ov.id = "gmLiveOv";
      ov.style.cssText = "position:fixed;inset:0;z-index:460;background:radial-gradient(circle at top,#0f172a,#020617 80%);color:#fff;overflow-y:auto;direction:rtl;font-family:Cairo,Tahoma,sans-serif;padding:20px";
      document.body.appendChild(ov);
    }
    var players = [];
    var joinUrl = location.origin + location.pathname.replace(/index\.html$/, "") + "?live=" + pin;

    function renderHost() {
      var q = (roomData.questions || [])[roomData.qIndex];
      ov.innerHTML = '<div style="max-width:860px;margin:10px auto;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.18);border-radius:28px;padding:24px">' +
        '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;border-bottom:1px solid rgba(255,255,255,0.15);padding-bottom:14px;margin-bottom:18px">' +
        '<div><span style="background:#ef4444;color:#fff;padding:4px 12px;border-radius:99px;font-size:11px;font-weight:900">📡 بث مسابقة صفية حية</span>' +
        '<h2 style="font-size:22px;font-weight:900;margin:6px 0 0">' + e(roomData.title) + '</h2></div>' +
        '<div style="text-align:center;background:rgba(245,158,11,0.2);border:2px solid #f59e0b;border-radius:18px;padding:8px 20px">' +
        '<div style="font-size:11px;color:#fde047;font-weight:800">رمز الغرفة (PIN) للطلاب</div>' +
        '<div style="font-size:32px;font-weight:900;letter-spacing:3px;font-family:monospace;color:#fff">' + e(pin) + '</div></div>' +
        '<div style="display:flex;gap:8px"><button type="button" id="lvCopyLink" style="background:#0284c7;border:0;color:#fff;padding:10px 16px;border-radius:12px;font-family:inherit;font-weight:800;cursor:pointer">🔗 نسخ رابط الانضمام</button>' +
        '<button type="button" id="lvCloseHost" style="background:rgba(255,255,255,0.15);border:0;color:#fff;padding:10px 16px;border-radius:12px;font-family:inherit;font-weight:800;cursor:pointer">✕ إنهاء وإغلاق</button></div></div>' +
        (roomData.status === "waiting" ? '<div style="text-align:center;padding:24px 10px"><div style="font-size:18px;font-weight:900;color:#38bdf8;margin-bottom:10px">اطلب من طلابك فتح الرابط أو إدخال الرمز (' + e(pin) + ') والانضمام الآن!</div>' +
          '<button type="button" id="lvStartBtn" style="background:linear-gradient(135deg,#10b981,#059669);border:0;color:#fff;padding:14px 36px;border-radius:16px;font-size:18px;font-weight:900;cursor:pointer;font-family:inherit">▶ ابدأ المسابقة الحية (السؤال 1)</button></div>'
        : roomData.status === "playing" && q ? '<div style="background:rgba(15,23,42,0.9);border:2px solid #38bdf8;border-radius:22px;padding:20px;margin-bottom:18px;text-align:center">' +
          '<div style="font-size:13px;color:#38bdf8;font-weight:900;margin-bottom:6px">السؤال الحالي (' + (roomData.qIndex + 1) + ' من ' + roomData.questions.length + ')</div>' +
          '<div style="font-size:22px;font-weight:900;margin-bottom:14px">' + e(q.q) + '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">' +
          q.options.map(function (opt, k) {
            return '<div style="background:rgba(255,255,255,0.1);padding:12px;border-radius:14px;font-size:15px;font-weight:800">' + (k + 1) + ') ' + e(opt) + '</div>';
          }).join("") + '</div>' +
          '<div style="display:flex;justify-content:center;gap:10px">' +
          (roomData.qIndex + 1 < roomData.questions.length ? '<button type="button" id="lvNextQ" style="background:#f59e0b;border:0;color:#0f172a;padding:12px 28px;border-radius:14px;font-size:15px;font-weight:900;cursor:pointer;font-family:inherit">⬅ إرسال السؤال التالي (' + (roomData.qIndex + 2) + ')</button>' : '') +
          '<button type="button" id="lvEndBtn" style="background:#e11d48;border:0;color:#fff;padding:12px 24px;border-radius:14px;font-size:15px;font-weight:900;cursor:pointer;font-family:inherit">🏁 إعلان النتائج النهائية</button></div></div>'
        : '<div style="text-align:center;padding:20px"><div style="font-size:56px">🏆</div><h3 style="font-size:26px;font-weight:900;color:#fde047">انتهت المسابقة الحية — لوحة شرف الأبطال!</h3></div>') +
        '<div style="background:rgba(255,255,255,0.05);border-radius:20px;padding:16px">' +
        '<div style="font-size:14px;font-weight:900;margin-bottom:10px">👥 الطلاب المتصلون ولوحة الصدارة اللحظية (' + players.length + ' طالب):</div>' +
        (players.length ? '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px">' +
          players.map(function (p, i) {
            var medal = i === 0 ? "🥇 " : i === 1 ? "🥈 " : i === 2 ? "🥉 " : (i + 1) + ". ";
            return '<div style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center">' +
              '<span style="font-weight:900;font-size:13px">' + medal + e(p.name) + '</span>' +
              '<span style="color:#34d399;font-weight:900;font-size:14px">' + (p.score || 0) + ' نقطة</span></div>';
          }).join("") + '</div>' : '<p style="color:#94a3b8;font-size:12px">بانتظار دخول الطلاب برمز الغرفة…</p>') +
        '</div></div>';

      $("lvCopyLink").onclick = function () {
        try { navigator.clipboard.writeText(joinUrl); toast("تم نسخ رابط المسابقة الحية 🔗"); } catch (x) { prompt("انسخ رابط المسابقة:", joinUrl); }
      };
      $("lvCloseHost").onclick = function () {
        stopLiveListeners();
        window.Cloud.col("liveRooms").doc(pin).set({ status: "ended" }, { merge: true }).catch(function () {});
        ov.remove();
      };
      if ($("lvStartBtn")) $("lvStartBtn").onclick = function () {
        roomData.status = "playing"; roomData.qIndex = 0;
        window.Cloud.col("liveRooms").doc(pin).set({ status: "playing", qIndex: 0, updatedAt: window.Cloud.stamp() }, { merge: true });
        renderHost();
      };
      if ($("lvNextQ")) $("lvNextQ").onclick = function () {
        roomData.qIndex++;
        window.Cloud.col("liveRooms").doc(pin).set({ qIndex: roomData.qIndex, updatedAt: window.Cloud.stamp() }, { merge: true });
        renderHost();
      };
      if ($("lvEndBtn")) $("lvEndBtn").onclick = function () {
        roomData.status = "ended";
        window.Cloud.col("liveRooms").doc(pin).set({ status: "ended", updatedAt: window.Cloud.stamp() }, { merge: true });
        renderHost();
      };
    }

    renderHost();
    liveScoreUnsub = window.Cloud.col(SCOL).where("gameId", "==", "live_" + pin).onSnapshot(function (snap) {
      var map = {};
      snap.docs.forEach(function (d) {
        var r = d.data();
        if (!map[r.name] || r.score > map[r.name].score) map[r.name] = r;
      });
      players = Object.keys(map).map(function (k) { return map[k]; }).sort(function (a, b) { return b.score - a.score; });
      renderHost();
    }, function () {});
  }

  function joinLiveRoomStudent(pinInput) {
    var pin = String(pinInput || prompt("أدخل رمز المسابقة الحية (PIN المكون من 5 أرقام):") || "").trim();
    if (!pin) return;
    if (!cloud()) { toast("يتطلب الاتصال بالإنترنت", "warning"); return; }
    stopLiveListeners();
    var ov = $("gmLiveOv");
    if (!ov) {
      ov = document.createElement("div");
      ov.id = "gmLiveOv";
      ov.style.cssText = "position:fixed;inset:0;z-index:460;background:radial-gradient(circle at top,#1e1b4b,#0f172a 80%);color:#fff;overflow-y:auto;direction:rtl;font-family:Cairo,Tahoma,sans-serif;padding:20px";
      document.body.appendChild(ov);
    }
    var stName = localStorage.getItem("edu_student_name") || "";
    var myScore = 0, answeredQ = {}, scoreDocId = "ls_" + pin + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

    function askNameAndConnect() {
      ov.innerHTML = '<div style="max-width:480px;margin:40px auto;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:26px;padding:24px;text-align:center">' +
        '<div style="font-size:46px">📡</div><h2 style="font-size:22px;font-weight:900;margin:8px 0">الانضمام للمسابقة الصفية الحية</h2>' +
        '<div style="font-size:13px;color:#fde047;margin-bottom:14px">رمز الغرفة: <b>' + e(pin) + '</b></div>' +
        '<input id="lvStName" value="' + e(stName) + '" placeholder="اكتب اسمك هنا…" style="width:100%;padding:12px;border-radius:14px;border:2px solid #38bdf8;background:#0f172a;color:#fff;font-family:inherit;font-weight:800;margin-bottom:12px">' +
        '<div style="display:flex;gap:8px"><button type="button" id="lvGoJoin" style="flex:1;background:#10b981;border:0;color:#fff;padding:12px;border-radius:14px;font-family:inherit;font-weight:900;cursor:pointer">🚀 دخول الغرفة</button>' +
        '<button type="button" id="lvCancelJoin" style="background:#475569;border:0;color:#fff;padding:12px 18px;border-radius:14px;font-family:inherit;font-weight:800;cursor:pointer">إلغاء</button></div></div>';
      $("lvCancelJoin").onclick = function () { stopLiveListeners(); ov.remove(); };
      $("lvGoJoin").onclick = function () {
        var nm = $("lvStName").value.trim();
        if (nm.length < 2) { toast("اكتب اسمك أولاً", "warning"); return; }
        stName = nm;
        try { localStorage.setItem("edu_student_name", nm); } catch (x) {}
        connectRoom();
      };
    }

    function pushScore(ownerUid) {
      window.Cloud.col(SCOL).doc(scoreDocId).set({
        gameId: "live_" + pin,
        ownerUid: ownerUid || "",
        name: stName.slice(0, 50),
        mode: "live",
        score: myScore,
        secs: 0,
        at: window.Cloud.stamp()
      }).catch(function () {});
    }

    function connectRoom() {
      var joinedOnce = false;
      liveUnsub = window.Cloud.col("liveRooms").doc(pin).onSnapshot(function (doc) {
        if (!doc.exists) {
          ov.innerHTML = '<div style="max-width:480px;margin:40px auto;text-align:center;background:rgba(255,255,255,0.08);padding:24px;border-radius:24px"><h3>رمز الغرفة (' + e(pin) + ') غير موجود</h3><button type="button" id="lvErrClose" style="margin-top:12px;padding:10px 20px;border-radius:12px;background:#475569;color:#fff;border:0;font-family:inherit;font-weight:800;cursor:pointer">إغلاق</button></div>';
          if ($("lvErrClose")) $("lvErrClose").onclick = function () { stopLiveListeners(); ov.remove(); };
          return;
        }
        var r = doc.data();
        if (!joinedOnce) { joinedOnce = true; pushScore(r.ownerUid); }
        if (r.status === "waiting") {
          ov.innerHTML = '<div style="max-width:520px;margin:40px auto;text-align:center;background:rgba(255,255,255,0.08);border:2px solid #38bdf8;padding:28px;border-radius:26px">' +
            '<div style="font-size:52px">⏳</div><h2 style="font-size:22px;font-weight:900;margin:8px 0">أهلاً بك يا ' + e(stName) + '!</h2>' +
            '<p style="color:#cbd5e1;font-size:14px">أنت متصل الآن بغرفة «' + e(r.title) + '». سيظهر السؤال على شاشتك تلقائياً فور ضغط المعلم على بدء المسابقة!</p></div>';
          return;
        }
        if (r.status === "ended") {
          if (window.EduBadges && window.EduBadges.award) window.EduBadges.award("gamer_hero", 60);
          ov.innerHTML = '<div style="max-width:520px;margin:40px auto;text-align:center;background:rgba(255,255,255,0.1);border:2px solid #f59e0b;padding:28px;border-radius:26px">' +
            '<div style="font-size:60px">🏆</div><h2 style="font-size:24px;font-weight:900;color:#fde047">انتهت المسابقة الحية!</h2>' +
            '<div style="font-size:40px;font-weight:900;color:#34d399;margin:14px 0">' + myScore + ' نقطة</div>' +
            '<button type="button" id="lvEndClose" style="padding:12px 26px;border-radius:14px;background:#10b981;color:#fff;border:0;font-family:inherit;font-weight:900;cursor:pointer">العودة للمنصة</button></div>';
          if ($("lvEndClose")) $("lvEndClose").onclick = function () { stopLiveListeners(); ov.remove(); };
          return;
        }
        var qi = r.qIndex || 0, q = (r.questions || [])[qi];
        if (!q) return;
        var qStart = Date.now();
        var already = answeredQ[qi];
        ov.innerHTML = '<div style="max-width:640px;margin:20px auto;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:24px;padding:22px;text-align:center">' +
          '<div style="display:flex;justify-content:space-between;font-weight:900;font-size:13px;margin-bottom:12px">' +
          '<span>السؤال المباشر ' + (qi + 1) + '</span><span style="color:#fde047">⭐ نقاطك: ' + myScore + '</span></div>' +
          '<div style="background:rgba(15,23,42,0.9);border-radius:18px;padding:18px;font-size:19px;font-weight:900;margin-bottom:16px">' + e(q.q) + '</div>' +
          (already !== undefined ? '<div style="padding:18px;font-size:16px;font-weight:900;color:' + (already ? "#34d399" : "#f87171") + '">' + (already ? "✅ إجابة صحيحة! بانتظار إرسال المعلم للسؤال التالي…" : "❌ إجابة خاطئة! بانتظار السؤال التالي…") + '</div>'
          : '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
            q.options.map(function (opt, k) {
              var cols = ["#e11d48", "#2563eb", "#d97706", "#059669"];
              return '<button type="button" data-lvans="' + k + '" style="background:' + cols[k % 4] + ';border:0;color:#fff;padding:16px 10px;border-radius:16px;font-size:15px;font-weight:900;cursor:pointer;font-family:inherit">' + e(opt) + '</button>';
            }).join("") + '</div>') +
          '</div>';
        ov.querySelectorAll("[data-lvans]").forEach(function (bt) {
          bt.onclick = function () {
            var k = +bt.dataset.lvans, ok = k === q.answer;
            answeredQ[qi] = ok;
            if (ok) {
              var bonus = Math.max(80, 200 - Math.floor((Date.now() - qStart) / 150));
              myScore += bonus;
              beep(820, 0.2, "triangle");
              pushScore(r.ownerUid);
            } else {
              beep(230, 0.2, "sawtooth");
            }
            ov.innerHTML = '<div style="max-width:640px;margin:20px auto;background:rgba(255,255,255,0.08);border-radius:24px;padding:28px;text-align:center">' +
              '<div style="font-size:48px">' + (ok ? "✅" : "❌") + '</div>' +
              '<h3 style="font-size:22px;font-weight:900;margin:10px 0">' + (ok ? "أحسنت! إجابة صحيحة" : "حظاً أوفر في السؤال القادم") + '</h3>' +
              '<div style="color:#fde047;font-size:18px;font-weight:900">مجموع نقاطك: ' + myScore + '</div>' +
              '<p style="color:#94a3b8;font-size:12px;margin-top:10px">انتظر على هذه الشاشة حتى ينتقل المعلم للسؤال التالي…</p></div>';
          };
        });
      });
    }
    askNameAndConnect();
  }

  function checkDirectGameLink() {
    var lv = /[?&]live=([0-9]{4,8})/.exec(location.search);
    if (lv) {
      var pin = lv[1], tr = 0;
      (function waitLv() {
        if (!cloud()) { if (++tr < 35) return setTimeout(waitLv, 300); return; }
        joinLiveRoomStudent(pin);
      })();
      return;
    }
    var m = /[?&]g=([A-Za-z0-9_-]{4,40})/.exec(location.search);
    if (!m) return;
    var gid = m[1], tries = 0;
    (function waitCloud() {
      if (!cloud()) { if (++tries < 35) return setTimeout(waitCloud, 300); return; }
      window.Cloud.col(COL).doc(gid).get().then(function (d) {
        if (d.exists) launchPlayer(Object.assign({ id: d.id }, d.data()), true);
      });
    })();
  }

  function init() {
    checkDirectGameLink();
    var n = 0, iv = setInterval(function () { if (build() || ++n > 40) clearInterval(iv); }, 300);
  }


  function openGamesStudio(mode) {
    var old = document.getElementById("gamesStudioModalWrap");
    if (old) old.remove();
    var m = document.createElement("div");
    m.id = "gamesStudioModalWrap";
    m.style.cssText = "position:fixed;inset:0;z-index:2147483300;background:rgba(2,6,23,0.86);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:10px;direction:rtl;";
    m.innerHTML =
      '<div style="width:min(98vw,960px);max-height:94vh;display:flex;flex-direction:column;border-radius:24px;background:#0f172a;color:#f8fafc;border:1.5px solid rgba(56,189,248,0.45);box-shadow:0 26px 70px rgba(0,0,0,0.7);overflow:hidden;">' +
        '<div style="padding:14px 18px;background:linear-gradient(135deg,#a21caf,#6d28d9);display:flex;justify-content:space-between;align-items:center;gap:10px;">' +
          '<div style="font-weight:900;font-size:15px;color:#fff;">🎮 مولّد الألعاب التربوية والمسابقات الحية (PIN)</div>' +
          '<button type="button" id="gamesStudioModalClose" style="width:34px;height:34px;border-radius:10px;background:rgba(244,63,94,0.25);color:#fecdd3;border:1px solid rgba(244,63,94,0.45);font-weight:900;cursor:pointer;">✕</button>' +
        '</div>' +
        '<div id="gmBody" style="padding:16px;overflow-y:auto;flex:1;background:#f8fafc;color:#0f172a;" class="dark:bg-slate-900 dark:text-slate-100"></div>' +
      '</div>';
    // Remove any hidden inline section with same body_id so getElementById hits our modal!
    var inlineSec = document.getElementById("gamesStudio");
    if (inlineSec) inlineSec.remove();
    document.body.appendChild(m);
    document.getElementById("gamesStudioModalClose").onclick = function () { m.remove(); };
    m.addEventListener("click", function (ev) { if (ev.target === m) m.remove(); });
    try {
      if (typeof S !== "undefined" && (mode === "teacher" || mode === "student")) S.tab = mode;
      if (typeof paint === "function") paint();
      if (typeof renderEditor === "function") renderEditor();
      if (typeof injectRemoteBar === "function") injectRemoteBar();
    } catch (e) {}
  }
  window.EduGames = {
    version: "1.1.0",
    open: openGamesStudio,

    fromWorksheet: fromWorksheet,
    play: launchPlayer,
    openId: function (id) {
      return window.Cloud.col(COL).doc(id).get().then(function (d) {
        if (d.exists) {
          st = Object.assign({ categories: ["المجموعة أ", "المجموعة ب"] }, d.data(), { id: d.id, dirty: false });
          renderEditor();
          loadLeaderboard(d.id);
        }
      });
    }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
