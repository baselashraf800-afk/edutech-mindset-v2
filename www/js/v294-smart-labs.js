/* ============================================================================
 * EduTech Mindset v294 — المختبرات والأدوات التفاعلية الذكية الستة
 * 1) مختبر PhET العربي (24 تجربة HTML5 تفاعلية)
 * 2) المصحف المعلّم للتلاوة والحفظ (AlQuran Cloud API)
 * 3) الراسم البياني والهندسي (GeoGebra 2D/3D + Desmos)
 * 4) مختبر البرمجة باللبنات العربي (Blockly + روبوت تفاعلي أوفلاين)
 * 5) سبورة EduTech التفاعلية الأوفلاين (محاور س وص + حفظ PNG + Excalidraw)
 * 6) بنك امتحانات التوجيهي الرسمية (elearn.edu.ps/exams12 + محاكي AI)
 * ============================================================================ */
(function (global) {
  "use strict";

  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var PHET_SIMS = [
    // الفيزياء
    { cat: "فيزياء", title: "بناء الدوائر الكهربائية (تيار مستمر)", slug: "circuit-construction-kit-dc", ico: "⚡" },
    { cat: "فيزياء", title: "القوى والحركة: الأساسيات", slug: "forces-and-motion-basics", ico: "🏋️" },
    { cat: "فيزياء", title: "قانون أوم (الجهد والتيار والمقاومة)", slug: "ohms-law", ico: "🔌" },
    { cat: "فيزياء", title: "أشكال الطاقة وتحولاتها", slug: "energy-forms-and-changes", ico: "🔋" },
    { cat: "فيزياء", title: "الموجات على وتر", slug: "wave-on-a-string", ico: "🌊" },
    { cat: "فيزياء", title: "انكسار وانعكاس الضوء", slug: "bending-light", ico: "🔦" },
    { cat: "فيزياء", title: "مختبر البندول البسيط", slug: "pendulum-lab", ico: "⏱️" },
    { cat: "فيزياء", title: "حركة المقذوفات", slug: "projectile-motion", ico: "🎯" },
    { cat: "فيزياء", title: "قانون فاراداي والحث المغناطيسي", slug: "faradays-law", ico: "🧲" },
    // الكيمياء
    { cat: "كيمياء", title: "بناء الذرة (البروتونات والإلكترونات)", slug: "build-an-atom", ico: "⚛️" },
    { cat: "كيمياء", title: "مقياس الرقم الهيدروجيني pH (أحماض وقواعد)", slug: "ph-scale", ico: "🧪" },
    { cat: "كيمياء", title: "موازنة المعادلات الكيميائية", slug: "balancing-chemical-equations", ico: "⚖️" },
    { cat: "كيمياء", title: "حالات المادة (صلب، سائل، غاز)", slug: "states-of-matter-basics", ico: "🧊" },
    { cat: "كيمياء", title: "الانتشار وخصائص الغازات", slug: "diffusion", ico: "💨" },
    { cat: "كيمياء", title: "بناء الجزيئات الكيميائية", slug: "build-a-molecule", ico: "🧬" },
    // الأحياء
    { cat: "أحياء", title: "الانتقاء الطبيعي والوراثة", slug: "natural-selection", ico: "🌿" },
    { cat: "أحياء", title: "التعبير الجيني والـ DNA", slug: "gene-expression-essentials", ico: "🧬" },
    { cat: "أحياء", title: "رؤية الألوان والضوء في العين", slug: "color-vision", ico: "👁️" },
    // الرياضيات
    { cat: "رياضيات", title: "مقدّمة في الكسور", slug: "fractions-intro", ico: "🍕" },
    { cat: "رياضيات", title: "مبني المساحة والضرب", slug: "area-builder", ico: "📐" },
    { cat: "رياضيات", title: "رسم المستقيمات والاقترانات الخطية", slug: "graphing-lines", ico: "📈" },
    { cat: "رياضيات", title: "رسم الاقترانات التربيعية", slug: "graphing-quadratics", ico: "〰️" },
    { cat: "رياضيات", title: "استكشاف المساواة والمعادلات", slug: "equality-explorer", ico: "➕" },
    { cat: "رياضيات", title: "جولة في الدائرة المثلثية (جا، جتا، ظا)", slug: "trig-tour", ico: "⭕" }
  ];

  var QUICK_SURAHS = [
    [1, "الفاتحة"], [36, "يس"], [18, "الكهف"], [31, "لقمان"], [49, "الحجرات"],
    [67, "الملك"], [78, "النبأ"], [87, "الأعلى"], [93, "الضحى"], [112, "الإخلاص"], [113, "الفلق"], [114, "الناس"]
  ];

  var SURAHS_ALL = [
    "الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس",
    "هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه",
    "الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم",
    "لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر",
    "فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق",
    "الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة",
    "الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج",
    "نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس",
    "التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد",
    "الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات",
    "القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر",
    "المسد","الإخلاص","الفلق","الناس"
  ];

  var currentAudio = null;

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (e) {}
      currentAudio = null;
    }
  }

  function closeModal() {
    stopAudio();
    var m = document.getElementById("eduV294LabsModal");
    if (m) m.remove();
    document.body.classList.remove("edu-any-modal-open");
  }

  function openShell(title, subtitle, bodyHtml, onReady) {
    closeModal();
    var wrap = document.createElement("div");
    wrap.id = "eduV294LabsModal";
    wrap.setAttribute("dir", "rtl");
    wrap.style.cssText = "position:fixed;inset:0;z-index:99995;background:rgba(2,6,23,0.92);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:8px;";
    wrap.innerHTML =
      '<div style="width:100%;max-width:1060px;max-height:94vh;border-radius:22px;background:#0f172a;border:1.5px solid rgba(56,189,248,0.4);color:#fff;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.65);">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 16px;background:linear-gradient(135deg,#0f172a,#1e293b);border-bottom:1px solid rgba(255,255,255,0.1);flex-shrink:0;">' +
          '<div style="min-width:0;">' +
            '<div style="font-size:15px;font-weight:900;color:#fde68a;">' + esc(title) + '</div>' +
            '<div style="font-size:11px;color:#94a3b8;margin-top:2px;">' + esc(subtitle) + '</div>' +
          '</div>' +
          '<button type="button" id="v294CloseBtn" style="padding:7px 14px;border-radius:12px;background:#334155;color:#fff;border:none;font-size:12px;font-weight:900;cursor:pointer;flex-shrink:0;">✕ إغلاق</button>' +
        '</div>' +
        '<div id="v294Body" style="flex:1;overflow-y:auto;padding:14px;">' + bodyHtml + '</div>' +
      '</div>';
    document.body.appendChild(wrap);
    document.body.classList.add("edu-any-modal-open");
    document.getElementById("v294CloseBtn").onclick = closeModal;
    wrap.addEventListener("click", function (ev) { if (ev.target === wrap) closeModal(); });
    if (typeof onReady === "function") onReady(document.getElementById("v294Body"));
  }

  // --------------------------------------------------------------------------
  // 1) مختبر PhET العربي
  // --------------------------------------------------------------------------
  function openPhet(initialCat) {
    var activeCat = initialCat || "الكل";
    var cats = ["الكل", "فيزياء", "كيمياء", "أحياء", "رياضيات"];
    openShell(
      "🧪 مختبر PhET العربي للتجارب الافتراضية",
      "24 محاكاة تفاعلية مجانية بالعربية من جامعة كولورادو (تعمل مباشرة داخل المنصة)",
      '<div id="v294PhetCats" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;"></div>' +
      '<div id="v294PhetStage" style="display:none;margin-bottom:12px;"></div>' +
      '<div id="v294PhetGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:9px;"></div>' +
      '<div style="margin-top:12px;text-align:center;"><a href="https://phet.colorado.edu/ar_SA/" target="_blank" rel="noopener" style="display:inline-block;padding:8px 16px;border-radius:12px;background:rgba(56,189,248,0.18);color:#7dd3fc;border:1px solid rgba(56,189,248,0.4);font-size:12px;font-weight:900;text-decoration:none;">🌐 فتح مكتبة PhET العربية الكاملة (176+ محاكاة)</a></div>',
      function () {
        function renderCats() {
          document.getElementById("v294PhetCats").innerHTML = cats.map(function (c) {
            var on = c === activeCat;
            return '<button type="button" data-pcat="' + esc(c) + '" style="padding:6px 13px;border-radius:999px;border:1px solid ' + (on ? "#38bdf8" : "rgba(255,255,255,0.15)") + ';background:' + (on ? "#0284c7" : "rgba(255,255,255,0.06)") + ';color:#fff;font-size:12px;font-weight:800;cursor:pointer;">' + esc(c) + '</button>';
          }).join("");
          document.querySelectorAll("[data-pcat]").forEach(function (b) {
            b.onclick = function () { activeCat = b.getAttribute("data-pcat"); renderCats(); renderGrid(); };
          });
        }
        function launchSim(sim) {
          var stg = document.getElementById("v294PhetStage");
          var url = "https://phet.colorado.edu/sims/html/" + sim.slug + "/latest/" + sim.slug + "_ar_SA.html";
          stg.style.display = "block";
          stg.innerHTML =
            '<div style="border-radius:16px;overflow:hidden;border:1.5px solid #38bdf8;background:#020617;">' +
              '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:#1e293b;">' +
                '<strong style="font-size:13px;color:#fde68a;">' + sim.ico + ' ' + esc(sim.title) + '</strong>' +
                '<div style="display:flex;gap:6px;"><a href="' + url + '" target="_blank" rel="noopener" style="padding:4px 10px;border-radius:8px;background:#0284c7;color:#fff;font-size:11px;font-weight:800;text-decoration:none;">⛶ ملء الشاشة</a><button type="button" id="v294PhetHide" style="padding:4px 10px;border-radius:8px;background:#475569;color:#fff;border:none;font-size:11px;font-weight:800;cursor:pointer;">✕ إخفاء</button></div>' +
              '</div>' +
              '<iframe src="' + url + '" style="width:100%;height:62vh;min-height:360px;border:none;background:#fff;" allowfullscreen></iframe>' +
            '</div>';
          document.getElementById("v294PhetHide").onclick = function () { stg.style.display = "none"; stg.innerHTML = ""; };
          stg.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        function renderGrid() {
          var list = activeCat === "الكل" ? PHET_SIMS : PHET_SIMS.filter(function (x) { return x.cat === activeCat; });
          document.getElementById("v294PhetGrid").innerHTML = list.map(function (s, idx) {
            return '<button type="button" data-psim="' + esc(s.slug) + '" style="text-align:right;padding:12px;border-radius:15px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#fff;cursor:pointer;display:flex;flex-direction:column;gap:5px;">' +
              '<div style="display:flex;align-items:center;justify-content:space-between;"><span style="font-size:22px;">' + s.ico + '</span><span style="padding:2px 8px;border-radius:999px;background:rgba(56,189,248,0.2);color:#7dd3fc;font-size:10px;font-weight:800;">' + esc(s.cat) + '</span></div>' +
              '<div style="font-size:12.5px;font-weight:900;line-height:1.4;">' + esc(s.title) + '</div>' +
              '<div style="font-size:10.5px;color:#6ee7b7;font-weight:800;margin-top:auto;">▶ تشغيل التجربة الآن</div>' +
            '</button>';
          }).join("");
          document.querySelectorAll("[data-psim]").forEach(function (b) {
            b.onclick = function () {
              var sl = b.getAttribute("data-psim");
              var hit = PHET_SIMS.filter(function (x) { return x.slug === sl; })[0];
              if (hit) launchSim(hit);
            };
          });
        }
        renderCats();
        renderGrid();
      }
    );
  }

  // --------------------------------------------------------------------------
  // 2) المصحف المعلّم للتلاوة والحفظ (AlQuran Cloud API)
  // --------------------------------------------------------------------------
  function openQuran() {
    var surahOpts = SURAHS_ALL.map(function (n, i) { return '<option value="' + (i + 1) + '">' + (i + 1) + '. سورة ' + n + '</option>'; }).join("");
    var quickBtns = QUICK_SURAHS.map(function (q) {
      return '<button type="button" data-qsurah="' + q[0] + '" style="padding:4px 10px;border-radius:999px;background:rgba(16,185,129,0.18);color:#6ee7b7;border:1px solid rgba(52,211,153,0.35);font-size:11px;font-weight:800;cursor:pointer;">' + q[1] + '</button>';
    }).join("");
    openShell(
      "📖 المصحف المعلّم للتلاوة والحفظ",
      "تلاوة مجوّدة بالرسم العثماني مع تكرار الآيات للحفظ (عبر AlQuran Cloud API المجاني)",
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;margin-bottom:10px;">' +
        '<select id="v294SurahSel" style="padding:9px;border-radius:12px;background:#1e293b;color:#fff;border:1px solid rgba(255,255,255,0.2);font-size:12.5px;font-weight:800;">' + surahOpts + '</select>' +
        '<select id="v294ReciterSel" style="padding:9px;border-radius:12px;background:#1e293b;color:#fff;border:1px solid rgba(255,255,255,0.2);font-size:12.5px;font-weight:800;">' +
          '<option value="ar.husary">🎙️ الشيخ محمود خليل الحصري (معلّم)</option>' +
          '<option value="ar.minshawi">🎙️ الشيخ محمد صديق المنشاوي</option>' +
          '<option value="ar.alafasy">🎙️ الشيخ مشاري راشد العفاسي</option>' +
          '<option value="ar.abdulbasitmurattal">🎙️ الشيخ عبد الباسط عبد الصمد</option>' +
        '</select>' +
        '<select id="v294RepeatSel" style="padding:9px;border-radius:12px;background:#1e293b;color:#fff;border:1px solid rgba(255,255,255,0.2);font-size:12.5px;font-weight:800;">' +
          '<option value="1">🔁 تكرار الآية: مرة واحدة</option>' +
          '<option value="3">🔁 تكرار الآية: 3 مرات (للحفظ)</option>' +
          '<option value="5">🔁 تكرار الآية: 5 مرات (للحفظ)</option>' +
        '</select>' +
        '<button type="button" id="v294QuranLoadBtn" style="padding:9px 14px;border-radius:12px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;font-size:12.5px;font-weight:900;cursor:pointer;">📖 عرض وتلاوة السورة</button>' +
      '</div>' +
      '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px;">' + quickBtns + '</div>' +
      '<div id="v294QuranControls" style="display:none;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 12px;border-radius:14px;background:rgba(16,185,129,0.14);border:1px solid rgba(52,211,153,0.35);margin-bottom:10px;">' +
        '<button type="button" id="v294PlayAllBtn" style="padding:6px 14px;border-radius:10px;background:#10b981;color:#020617;border:none;font-size:12px;font-weight:900;cursor:pointer;">▶ تشغيل السورة كاملة</button>' +
        '<button type="button" id="v294StopQuranBtn" style="padding:6px 12px;border-radius:10px;background:#ef4444;color:#fff;border:none;font-size:12px;font-weight:900;cursor:pointer;">⏹ إيقاف</button>' +
        '<span id="v294QuranNow" style="font-size:11.5px;color:#a7f3d0;font-weight:800;"></span>' +
      '</div>' +
      '<div id="v294QuranAyahs" style="display:grid;gap:8px;"></div>',
      function () {
        var ayahsData = [];
        var playAllMode = false;

        function playAyah(idx, leftRepeats) {
          stopAudio();
          var a = ayahsData[idx];
          if (!a || !a.audio) return;
          var rep = leftRepeats != null ? leftRepeats : parseInt(document.getElementById("v294RepeatSel").value || "1", 10);
          document.querySelectorAll("[data-ayah-row]").forEach(function (el) {
            el.style.borderColor = "rgba(255,255,255,0.1)";
            el.style.background = "rgba(255,255,255,0.04)";
          });
          var row = document.querySelector('[data-ayah-row="' + idx + '"]');
          if (row) {
            row.style.borderColor = "#10b981";
            row.style.background = "rgba(16,185,129,0.18)";
            row.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
          var statusEl = document.getElementById("v294QuranNow");
          if (statusEl) statusEl.textContent = "🔊 يتلو الآية رقم " + a.numberInSurah + (rep > 1 ? " (متبقي " + rep + " مرات)" : "");
          currentAudio = new Audio(a.audio);
          currentAudio.onended = function () {
            if (rep > 1) { playAyah(idx, rep - 1); }
            else if (playAllMode && idx + 1 < ayahsData.length) { playAyah(idx + 1, null); }
            else if (statusEl) { statusEl.textContent = "✅ انتهت التلاوة"; }
          };
          currentAudio.play().catch(function () {});
        }

        function loadSurah(num) {
          stopAudio();
          playAllMode = false;
          document.getElementById("v294SurahSel").value = String(num);
          var reciter = document.getElementById("v294ReciterSel").value || "ar.husary";
          var box = document.getElementById("v294QuranAyahs");
          box.innerHTML = '<div style="padding:20px;text-align:center;color:#7dd3fc;font-weight:800;">⏳ جارٍ تحميل السورة والتلاوة الصوتية...</div>';
          fetch("https://api.alquran.cloud/v1/surah/" + num + "/" + encodeURIComponent(reciter))
            .then(function (r) { return r.json(); })
            .then(function (j) {
              if (!j || j.code !== 200 || !j.data || !j.data.ayahs) throw new Error("fail");
              ayahsData = j.data.ayahs;
              document.getElementById("v294QuranControls").style.display = "flex";
              box.innerHTML = ayahsData.map(function (a, i) {
                return '<div data-ayah-row="' + i + '" style="padding:12px 14px;border-radius:14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:space-between;gap:10px;">' +
                  '<div style="font-size:19px;line-height:2.1;font-family:\'Amiri\',\'Scheherazade New\',serif;color:#f8fafc;">' + esc(a.text) + ' <span style="display:inline-block;padding:0 7px;border-radius:999px;background:rgba(251,191,36,0.2);color:#fde68a;font-size:12px;font-family:sans-serif;font-weight:900;">﴿' + a.numberInSurah + '﴾</span></div>' +
                  '<button type="button" data-play-ayah="' + i + '" style="padding:7px 11px;border-radius:10px;background:rgba(16,185,129,0.22);color:#6ee7b7;border:1px solid rgba(52,211,153,0.4);font-size:12px;font-weight:900;cursor:pointer;flex-shrink:0;">🔊 استماع</button>' +
                '</div>';
              }).join("");
              box.querySelectorAll("[data-play-ayah]").forEach(function (b) {
                b.onclick = function () { playAllMode = false; playAyah(parseInt(b.getAttribute("data-play-ayah"), 10), null); };
              });
            })
            .catch(function () {
              box.innerHTML = '<div style="padding:18px;text-align:center;color:#fca5a5;font-weight:800;">⚠️ تعذر تحميل السورة — تحقق من اتصال الإنترنت وحاول مجدداً.</div>';
            });
        }

        document.getElementById("v294QuranLoadBtn").onclick = function () { loadSurah(document.getElementById("v294SurahSel").value); };
        document.getElementById("v294PlayAllBtn").onclick = function () { playAllMode = true; playAyah(0, null); };
        document.getElementById("v294StopQuranBtn").onclick = function () { playAllMode = false; stopAudio(); };
        document.querySelectorAll("[data-qsurah]").forEach(function (b) {
          b.onclick = function () { loadSurah(b.getAttribute("data-qsurah")); };
        });
        loadSurah(1);
      }
    );
  }

  // --------------------------------------------------------------------------
  // 3) الراسم البياني والهندسي (GeoGebra 2D/3D + Desmos)
  // --------------------------------------------------------------------------
  function openGeogebra() {
    var modes = [
      { id: "graphing", label: "📈 راسم الاقترانات (2D)", url: "https://www.geogebra.org/graphing?lang=ar" },
      { id: "geometry", label: "📐 الهندسة المستوية", url: "https://www.geogebra.org/geometry?lang=ar" },
      { id: "3d", label: "🧊 الرسوم ثلاثية الأبعاد (3D)", url: "https://www.geogebra.org/3d?lang=ar" },
      { id: "scientific", label: "🧮 آلة حاسبة علمية", url: "https://www.geogebra.org/scientific?lang=ar" }
    ];
    openShell(
      "📐 الراسم البياني والهندسي (GeoGebra)",
      "ارسم الاقترانات والأشكال الهندسية ثلاثية الأبعاد تفاعلياً لرياضيات الإعدادي والتوجيهي",
      '<div id="v294GgbTabs" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;align-items:center;">' +
        modes.map(function (m, i) {
          return '<button type="button" data-ggb="' + esc(m.url) + '" style="padding:7px 13px;border-radius:11px;border:1px solid rgba(56,189,248,0.4);background:' + (i === 0 ? "#0284c7" : "rgba(255,255,255,0.07)") + ';color:#fff;font-size:12px;font-weight:900;cursor:pointer;">' + m.label + '</button>';
        }).join("") +
        '<a href="https://www.desmos.com/calculator?lang=ar" target="_blank" rel="noopener" style="margin-right:auto;padding:7px 12px;border-radius:11px;background:rgba(16,185,129,0.2);color:#6ee7b7;border:1px solid rgba(52,211,153,0.4);font-size:11.5px;font-weight:900;text-decoration:none;">📊 فتح Desmos العربي ↗</a>' +
      '</div>' +
      '<iframe id="v294GgbFrame" src="' + modes[0].url + '" style="width:100%;height:68vh;min-height:420px;border-radius:16px;border:1.5px solid rgba(56,189,248,0.35);background:#fff;" allowfullscreen></iframe>',
      function () {
        document.querySelectorAll("[data-ggb]").forEach(function (b) {
          b.onclick = function () {
            document.querySelectorAll("[data-ggb]").forEach(function (x) { x.style.background = "rgba(255,255,255,0.07)"; });
            b.style.background = "#0284c7";
            document.getElementById("v294GgbFrame").src = b.getAttribute("data-ggb");
          };
        });
      }
    );
  }

  // --------------------------------------------------------------------------
  // 4) مختبر البرمجة باللبنات العربي (أوفلاين + روبوت تفاعلي + Google Blockly)
  // --------------------------------------------------------------------------
  function openBlockly() {
    var blocks = [
      { id: "fwd", label: "⬆️ تحرّك للأمام خطوة", js: "robot.forward();" },
      { id: "right", label: "↪️ استدر يميناً 90°", js: "robot.turnRight();" },
      { id: "left", label: "↩️ استدر يساراً 90°", js: "robot.turnLeft();" },
      { id: "rep3", label: "🔁 كرّر الخطوة القادمة 3 مرات", js: "for (let i=0; i<3; i++) { /* التالي */ }" },
      { id: "flag", label: "🚩 التقط النجمة الذهبية", js: "robot.collectStar();" }
    ];
    openShell(
      "🧩 مختبر البرمجة باللبنات (Blockly العربي)",
      "تعلّم التفكير المنطقي والبرمجة باللبنات على الهاتف أوفلاين + رابط Google Blockly Games",
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;">' +
        '<div style="padding:12px;border-radius:16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);">' +
          '<div style="font-size:13px;font-weight:900;color:#fde68a;margin-bottom:8px;">1️⃣ اضغط على اللبنات لبناء برنامجك:</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">' +
            blocks.map(function (b) {
              return '<button type="button" data-add-blk="' + b.id + '" style="padding:7px 11px;border-radius:11px;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;border:none;font-size:12px;font-weight:800;cursor:pointer;">+ ' + b.label + '</button>';
            }).join("") +
          '</div>' +
          '<div style="font-size:12px;font-weight:900;color:#7dd3fc;margin-bottom:5px;">📜 تسلسل الأوامر (البرنامج):</div>' +
          '<div id="v294ProgList" style="min-height:110px;max-height:190px;overflow-y:auto;padding:8px;border-radius:12px;background:#020617;border:1px dashed rgba(56,189,248,0.4);display:grid;gap:5px;"></div>' +
          '<div style="display:flex;gap:6px;margin-top:9px;flex-wrap:wrap;">' +
            '<button type="button" id="v294RunBlk" style="flex:1;padding:9px;border-radius:11px;background:#10b981;color:#020617;border:none;font-size:13px;font-weight:900;cursor:pointer;">▶ شغّل البرنامج</button>' +
            '<button type="button" id="v294ClrBlk" style="padding:9px 13px;border-radius:11px;background:#475569;color:#fff;border:none;font-size:12px;font-weight:800;cursor:pointer;">🗑️ مسح</button>' +
          '</div>' +
          '<pre id="v294JsOut" dir="ltr" style="margin-top:8px;padding:8px;border-radius:10px;background:#020617;color:#a7f3d0;font-size:11px;overflow-x:auto;min-height:42px;">// الكود البرمجي JavaScript سيظهر هنا</pre>' +
        '</div>' +
        '<div style="padding:12px;border-radius:16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);display:flex;flex-direction:column;align-items:center;gap:10px;">' +
          '<div style="font-size:13px;font-weight:900;color:#6ee7b7;">🤖 ساحة الروبوت (وصل الروبوت إلى ⭐)</div>' +
          '<div id="v294RobotGrid" style="display:grid;grid-template-columns:repeat(5,52px);gap:5px;direction:ltr;"></div>' +
          '<div id="v294RobotMsg" style="font-size:12px;font-weight:900;color:#fde68a;min-height:20px;">وجّه الروبوت 🤖 إلى النجمة ⭐ ثم اضغط «شغّل البرنامج»!</div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:auto;">' +
            '<button type="button" id="v294NewLevel" style="padding:7px 13px;border-radius:11px;background:rgba(251,191,36,0.2);color:#fde68a;border:1px solid rgba(251,191,36,0.4);font-size:11.5px;font-weight:900;cursor:pointer;">🎲 تحدٍّ جديد</button>' +
            '<a href="https://blockly.games/?lang=ar" target="_blank" rel="noopener" style="padding:7px 13px;border-radius:11px;background:rgba(56,189,248,0.2);color:#7dd3fc;border:1px solid rgba(56,189,248,0.4);font-size:11.5px;font-weight:900;text-decoration:none;">🌐 ألعاب Google Blockly الرسمية ↗</a>' +
          '</div>' +
        '</div>' +
      '</div>',
      function () {
        var prog = [];
        var rx = 0, ry = 4, dir = 0; // 0:N,1:E,2:S,3:W
        var sx = 2, sy = 1;
        var arrows = ["⬆️", "➡️", "⬇️", "⬅️"];

        function drawGrid() {
          var g = document.getElementById("v294RobotGrid");
          var html = "";
          for (var y = 0; y < 5; y++) {
            for (var x = 0; x < 5; x++) {
              var isR = (x === rx && y === ry), isS = (x === sx && y === sy);
              html += '<div style="width:52px;height:52px;border-radius:12px;background:' + (isR ? "#0284c7" : (isS ? "rgba(251,191,36,0.22)" : "#1e293b")) + ';border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;font-size:22px;">' + (isR ? ("🤖" + '<span style="font-size:11px;">' + arrows[dir] + '</span>') : (isS ? "⭐" : "")) + '</div>';
            }
          }
          g.innerHTML = html;
        }
        function drawProg() {
          var el = document.getElementById("v294ProgList");
          el.innerHTML = prog.length ? prog.map(function (b, i) {
            return '<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 9px;border-radius:9px;background:#1e293b;font-size:12px;font-weight:800;"><span>' + (i + 1) + '. ' + b.label + '</span><button type="button" data-rm-blk="' + i + '" style="background:none;border:none;color:#fda4af;cursor:pointer;font-weight:900;">✕</button></div>';
          }).join("") : '<div style="color:#64748b;font-size:11.5px;text-align:center;padding:18px 0;">اضغط على اللبنات بالأعلى لإضافتها هنا…</div>';
          document.getElementById("v294JsOut").textContent = prog.length ? prog.map(function (b) { return b.js; }).join("\n") : "// الكود البرمجي JavaScript سيظهر هنا";
          el.querySelectorAll("[data-rm-blk]").forEach(function (rb) {
            rb.onclick = function () { prog.splice(parseInt(rb.getAttribute("data-rm-blk"), 10), 1); drawProg(); };
          });
        }
        document.querySelectorAll("[data-add-blk]").forEach(function (b) {
          b.onclick = function () {
            var id = b.getAttribute("data-add-blk");
            var item = blocks.filter(function (x) { return x.id === id; })[0];
            if (item) { prog.push(item); drawProg(); }
          };
        });
        document.getElementById("v294ClrBlk").onclick = function () { prog = []; rx = 0; ry = 4; dir = 0; drawProg(); drawGrid(); document.getElementById("v294RobotMsg").textContent = "تم المسح — ابدأ ببناء أوامرك!"; };
        document.getElementById("v294NewLevel").onclick = function () {
          rx = 0; ry = 4; dir = 0;
          sx = Math.floor(Math.random() * 4) + 1;
          sy = Math.floor(Math.random() * 4);
          drawGrid();
          document.getElementById("v294RobotMsg").textContent = "🎯 تحدٍّ جديد! وصل الروبوت إلى النجمة ⭐";
        };
        document.getElementById("v294RunBlk").onclick = function () {
          rx = 0; ry = 4; dir = 0;
          var steps = [];
          for (var i = 0; i < prog.length; i++) {
            if (prog[i].id === "rep3" && prog[i + 1]) {
              steps.push(prog[i + 1].id, prog[i + 1].id, prog[i + 1].id);
              i++;
            } else if (prog[i].id !== "rep3") {
              steps.push(prog[i].id);
            }
          }
          var stepIdx = 0;
          var msg = document.getElementById("v294RobotMsg");
          msg.textContent = "⚙️ جارٍ تنفيذ البرنامج...";
          function tick() {
            if (stepIdx >= steps.length) {
              msg.textContent = (rx === sx && ry === sy) ? "🎉 أحسنت! وصل الروبوت إلى النجمة بنجاح ⭐" : "💡 اقتربت! عدّل اللبنات وحاول مرة أخرى.";
              return;
            }
            var cmd = steps[stepIdx++];
            if (cmd === "fwd") {
              if (dir === 0 && ry > 0) ry--;
              else if (dir === 1 && rx < 4) rx++;
              else if (dir === 2 && ry < 4) ry++;
              else if (dir === 3 && rx > 0) rx--;
            } else if (cmd === "right") dir = (dir + 1) % 4;
            else if (cmd === "left") dir = (dir + 3) % 4;
            drawGrid();
            setTimeout(tick, 320);
          }
          drawGrid();
          setTimeout(tick, 220);
        };
        drawGrid();
        drawProg();
      }
    );
  }

  // --------------------------------------------------------------------------
  // 5) سبورة EduTech التفاعلية الأوفلاين (+ Excalidraw)
  // --------------------------------------------------------------------------
  function openWhiteboard() {
    openShell(
      "✏️ سبورة EduTech التفاعلية (تعمل أوفلاين 100%)",
      "قلم • أشكال هندسية • شبكة إحداثيات (س، ص) • حفظ كصورة PNG مباشرة للهاتف",
      '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:8px;">' +
        '<button type="button" data-wb-tool="pen" style="padding:6px 11px;border-radius:10px;background:#0284c7;color:#fff;border:none;font-size:12px;font-weight:900;cursor:pointer;">✏️ قلم</button>' +
        '<button type="button" data-wb-tool="line" style="padding:6px 11px;border-radius:10px;background:#334155;color:#fff;border:none;font-size:12px;font-weight:900;cursor:pointer;">📏 خط</button>' +
        '<button type="button" data-wb-tool="rect" style="padding:6px 11px;border-radius:10px;background:#334155;color:#fff;border:none;font-size:12px;font-weight:900;cursor:pointer;">⬜ مستطيل</button>' +
        '<button type="button" data-wb-tool="circle" style="padding:6px 11px;border-radius:10px;background:#334155;color:#fff;border:none;font-size:12px;font-weight:900;cursor:pointer;">⭕ دائرة</button>' +
        '<button type="button" data-wb-tool="eraser" style="padding:6px 11px;border-radius:10px;background:#334155;color:#fff;border:none;font-size:12px;font-weight:900;cursor:pointer;">🧽 ممحاة</button>' +
        '<input type="color" id="v294WbColor" value="#fde047" title="لون القلم" style="width:34px;height:32px;border:none;border-radius:8px;cursor:pointer;background:transparent;">' +
        '<select id="v294WbBg" style="padding:6px 9px;border-radius:10px;background:#1e293b;color:#fff;border:1px solid rgba(255,255,255,0.2);font-size:11.5px;font-weight:800;">' +
          '<option value="green">🟩 سبورة مدرسية خضراء</option>' +
          '<option value="dark">⬛ سبورة داكنة</option>' +
          '<option value="white">⬜ سبورة بيضاء</option>' +
          '<option value="grid">📐 شبكة إحداثيات (س، ص)</option>' +
        '</select>' +
        '<button type="button" id="v294WbClear" style="padding:6px 11px;border-radius:10px;background:#be123c;color:#fff;border:none;font-size:12px;font-weight:900;cursor:pointer;">🗑️ مسح</button>' +
        '<button type="button" id="v294WbSave" style="padding:6px 12px;border-radius:10px;background:#10b981;color:#020617;border:none;font-size:12px;font-weight:900;cursor:pointer;">💾 حفظ PNG</button>' +
        '<a href="https://excalidraw.com/" target="_blank" rel="noopener" style="margin-right:auto;padding:6px 11px;border-radius:10px;background:rgba(168,85,247,0.22);color:#e9d5ff;border:1px solid rgba(192,132,252,0.4);font-size:11.5px;font-weight:900;text-decoration:none;">🎨 فتح Excalidraw ↗</a>' +
      '</div>' +
      '<div style="border-radius:16px;overflow:hidden;border:2px solid rgba(56,189,248,0.4);touch-action:none;">' +
        '<canvas id="v294WbCanvas" width="960" height="540" style="width:100%;height:62vh;min-height:340px;display:block;cursor:crosshair;"></canvas>' +
      '</div>',
      function () {
        var cvs = document.getElementById("v294WbCanvas");
        var ctx = cvs.getContext("2d");
        var tool = "pen", drawing = false, sx = 0, sy = 0, snap = null;

        function paintBg() {
          var bg = document.getElementById("v294WbBg").value;
          ctx.fillStyle = bg === "green" ? "#064e3b" : (bg === "white" ? "#ffffff" : (bg === "grid" ? "#0f172a" : "#020617"));
          ctx.fillRect(0, 0, cvs.width, cvs.height);
          if (bg === "grid") {
            ctx.strokeStyle = "rgba(148,163,184,0.22)";
            ctx.lineWidth = 1;
            for (var x = 0; x <= cvs.width; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, cvs.height); ctx.stroke(); }
            for (var y = 0; y <= cvs.height; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cvs.width, y); ctx.stroke(); }
            ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(0, cvs.height / 2); ctx.lineTo(cvs.width, cvs.height / 2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cvs.width / 2, 0); ctx.lineTo(cvs.width / 2, cvs.height); ctx.stroke();
            ctx.fillStyle = "#fde047"; ctx.font = "bold 18px sans-serif";
            ctx.fillText("س", cvs.width - 24, cvs.height / 2 - 8);
            ctx.fillText("ص", cvs.width / 2 + 10, 22);
          }
        }
        function getPt(e) {
          var r = cvs.getBoundingClientRect();
          var cx = e.touches ? e.touches[0].clientX : e.clientX;
          var cy = e.touches ? e.touches[0].clientY : e.clientY;
          return { x: (cx - r.left) * (cvs.width / r.width), y: (cy - r.top) * (cvs.height / r.height) };
        }
        function start(e) {
          e.preventDefault();
          drawing = true;
          var p = getPt(e); sx = p.x; sy = p.y;
          snap = ctx.getImageData(0, 0, cvs.width, cvs.height);
          if (tool === "pen" || tool === "eraser") {
            ctx.beginPath(); ctx.moveTo(sx, sy);
          }
        }
        function move(e) {
          if (!drawing) return;
          e.preventDefault();
          var p = getPt(e);
          var bg = document.getElementById("v294WbBg").value;
          var eraseColor = bg === "green" ? "#064e3b" : (bg === "white" ? "#ffffff" : (bg === "grid" ? "#0f172a" : "#020617"));
          ctx.lineCap = "round"; ctx.lineJoin = "round";
          ctx.strokeStyle = tool === "eraser" ? eraseColor : document.getElementById("v294WbColor").value;
          ctx.lineWidth = tool === "eraser" ? 24 : 4;
          if (tool === "pen" || tool === "eraser") {
            ctx.lineTo(p.x, p.y); ctx.stroke();
          } else {
            ctx.putImageData(snap, 0, 0);
            ctx.beginPath();
            if (tool === "line") { ctx.moveTo(sx, sy); ctx.lineTo(p.x, p.y); }
            else if (tool === "rect") { ctx.rect(sx, sy, p.x - sx, p.y - sy); }
            else if (tool === "circle") { var rad = Math.hypot(p.x - sx, p.y - sy); ctx.arc(sx, sy, rad, 0, Math.PI * 2); }
            ctx.stroke();
          }
        }
        function end() { drawing = false; }

        cvs.addEventListener("mousedown", start); cvs.addEventListener("mousemove", move); window.addEventListener("mouseup", end);
        cvs.addEventListener("touchstart", start, { passive: false }); cvs.addEventListener("touchmove", move, { passive: false }); cvs.addEventListener("touchend", end);

        document.querySelectorAll("[data-wb-tool]").forEach(function (b) {
          b.onclick = function () {
            tool = b.getAttribute("data-wb-tool");
            document.querySelectorAll("[data-wb-tool]").forEach(function (x) { x.style.background = "#334155"; });
            b.style.background = "#0284c7";
          };
        });
        document.getElementById("v294WbBg").onchange = function () {
          if (this.value === "white") document.getElementById("v294WbColor").value = "#0f172a";
          else if (document.getElementById("v294WbColor").value === "#0f172a") document.getElementById("v294WbColor").value = "#fde047";
          paintBg();
        };
        document.getElementById("v294WbClear").onclick = paintBg;
        document.getElementById("v294WbSave").onclick = function () {
          var a = document.createElement("a");
          a.href = cvs.toDataURL("image/png");
          a.download = "EduTech_Whiteboard_" + Date.now() + ".png";
          a.click();
          if (typeof showToast === "function") showToast("💾 تم حفظ صورة السبورة بنجاح ✓", "success");
        };
        paintBg();
      }
    );
  }

  // --------------------------------------------------------------------------
  // 6) بنك امتحانات التوجيهي الرسمية (elearn.edu.ps/exams12 + محاكي AI)
  // --------------------------------------------------------------------------
  function openTawjihiExams() {
    var streams = [
      { title: "الفرع العلمي", ico: "🔬", url: "https://elearn.edu.ps/landing3/c12s/", subs: "الرياضيات • الفيزياء • الكيمياء • الأحياء • الإنجليزية • العربية" },
      { title: "الفرع الأدبي", ico: "📚", url: "https://elearn.edu.ps/landing3/c12h/", subs: "العربية • الإنجليزية • التاريخ • الجغرافيا • الثقافة العلمية • الرياضيات" },
      { title: "فرع الريادة والأعمال", ico: "💼", url: "https://elearn.edu.ps/landing3/c12ri/", subs: "المحاسبة • الإدارة والاقتصاد • الرياضيات • المشاريع الصغيرة" },
      { title: "الفرع الشرعي", ico: "🕌", url: "https://elearn.edu.ps/landing3/c12re/", subs: "القرآن وعلومه • الفقه • العقيدة • الحديث • العربية" },
      { title: "الفرع الصناعي", ico: "⚙️", url: "https://elearn.edu.ps/landing3/c12in/", subs: "الرياضيات • الفيزياء • الرسم الصناعي • العلوم الصناعية" },
      { title: "الفرع الزراعي", ico: "🌱", url: "https://elearn.edu.ps/landing3/c12agr/", subs: "الإنتاج النباتي والحيواني • الصناعات الغذائية • الكيمياء" }
    ];
    openShell(
      "🏛️ بنك امتحانات التوجيهي الرسمية (فلسطين)",
      "أسئلة السنوات السابقة من وزارة التربية والتعليم + توليد امتحان محاكي بالذكاء الاصطناعي",
      '<div style="padding:14px;border-radius:16px;background:linear-gradient(135deg,#064e3b,#0f172a);border:1.5px solid #fbbf24;margin-bottom:12px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;">' +
        '<div><div style="font-size:14px;font-weight:900;color:#fde68a;">📄 أرشيف أسئلة السنوات السابقة الرسمي — وزارة التربية والتعليم</div><div style="font-size:11.5px;color:#cbd5e1;margin-top:2px;">جميع دورات الثانوية العامة (الدورة الأولى والثانية والاستكمالية) مع الإجابات النموذجية</div></div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
          '<a href="https://elearn.edu.ps/exams12/" target="_blank" rel="noopener" style="padding:9px 16px;border-radius:12px;background:#fbbf24;color:#020617;font-size:12.5px;font-weight:900;text-decoration:none;">🏛️ فتح بنك امتحانات الوزارة ↗</a>' +
          '<button type="button" id="v294AiTawjihiExam" style="padding:9px 14px;border-radius:12px;background:#0284c7;color:#fff;border:none;font-size:12.5px;font-weight:900;cursor:pointer;">🤖 ولّد امتحان توجيهي محاكي الآن</button>' +
        '</div>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;">' +
        streams.map(function (s) {
          return '<a href="' + s.url + '" target="_blank" rel="noopener" style="text-align:right;padding:13px;border-radius:15px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.13);color:#fff;text-decoration:none;display:flex;flex-direction:column;gap:5px;">' +
            '<div style="font-size:24px;">' + s.ico + '</div>' +
            '<div style="font-size:13.5px;font-weight:900;color:#fde68a;">' + s.title + '</div>' +
            '<div style="font-size:11px;color:#cbd5e1;line-height:1.5;">' + s.subs + '</div>' +
            '<div style="font-size:11px;color:#7dd3fc;font-weight:900;margin-top:auto;">فتح مراجعات وملفات الفرع ↗</div>' +
          '</a>';
        }).join("") +
      '</div>',
      function () {
        document.getElementById("v294AiTawjihiExam").onclick = function () {
          closeModal();
          if (window.EduGamify && window.EduGamify.openTawjihiPro) window.EduGamify.openTawjihiPro();
          else if (window.EduToolsHub && window.EduToolsHub.launchById) window.EduToolsHub.launchById("examGenerator");
        };
      }
    );
  }

  global.EduV294Labs = {
    open: function (kind, extra) {
      if (kind === "phet") return openPhet(extra);
      if (kind === "quran") return openQuran();
      if (kind === "geogebra") return openGeogebra();
      if (kind === "blockly") return openBlockly();
      if (kind === "whiteboard") return openWhiteboard();
      if (kind === "tawjihi_exams") return openTawjihiExams();
      return openPhet();
    },
    close: closeModal
  };
})(window);
