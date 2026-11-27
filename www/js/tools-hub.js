/* ============================================================================
 * EduTech Mindset v243 — مركز الأدوات المباشر (16 أداة حقيقية 100% + فتح مباشر في نافذة كاملة بلا أي متاهة)
 * تم حذف الأدوات الوهمية تماماً + ربط كل أداة بسكربتها الفعلي + دعم كامل لزر الرجوع EduRouter
 * ============================================================================ */
(function () {
  "use strict";

  var FAV_KEY = "edu_fav_tools_v221";
  var ORDER_KEY = "edu_tools_order_v294";
  var state = { tab: "student", q: "", reorderMode: false };
  var customOrderCfg = { order: {}, hidden: [] };
  try {
    var savedCfg = JSON.parse(localStorage.getItem(ORDER_KEY) || "null");
    if (savedCfg && typeof savedCfg === "object") {
      customOrderCfg.order = savedCfg.order || {};
      customOrderCfg.hidden = Array.isArray(savedCfg.hidden) ? savedCfg.hidden : [];
    }
  } catch (e) {}

  function isAdminTools() {
    return (typeof window.isSuperAdminUser === "function" && window.isSuperAdminUser()) ||
           (document.body && document.body.classList.contains("is-super-admin"));
  }

  function loadCloudToolsOrder() {
    fetch("/api/tools-order")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d && d.ok) {
          customOrderCfg.order = d.order || {};
          customOrderCfg.hidden = Array.isArray(d.hidden) ? d.hidden : [];
          try { localStorage.setItem(ORDER_KEY, JSON.stringify(customOrderCfg)); } catch (e) {}
          render();
        }
      }).catch(function () {});
  }
  setTimeout(loadCloudToolsOrder, 350);

  function saveCloudToolsOrder() {
    try { localStorage.setItem(ORDER_KEY, JSON.stringify(customOrderCfg)); } catch (e) {}
    var hdrs = { "Content-Type": "application/json" };
    var p = Promise.resolve();
    try {
      var u = window.firebase && firebase.auth && firebase.auth().currentUser;
      if (u && typeof u.getIdToken === "function") {
        p = u.getIdToken().then(function (tok) { if (tok) hdrs["Authorization"] = "Bearer " + tok; });
      }
    } catch (e) {}
    return p.then(function () {
      return fetch("/api/tools-order", { method: "POST", headers: hdrs, body: JSON.stringify(customOrderCfg) });
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (j && j.ok) {
        if (typeof showToast === "function") showToast("💾 تم حفظ ترتيب الأدوات سحابياً لجميع المستخدمين ✓", "success");
      } else {
        if (typeof showToast === "function") showToast("⚠️ تعذر الحفظ السحابي — تأكد من تسجيل دخول الإدارة", "warning");
      }
    }).catch(function () {
      if (typeof showToast === "function") showToast("⚠️ تعذر الاتصال بالسحابة حالياً", "warning");
    });
  }

  function getStudiosCfg() {
    try { return (window.home && window.home.site && window.home.site.studiosConfig) || {}; } catch (e) { return {}; }
  }
  function orderedToolsForRole(role, includeHidden) {
    var sc = getStudiosCfg();
    var base = REAL_TOOLS.filter(function (t) {
      if (t.role !== role || t.hiddenInGrid) return false;
      if (t.isAdminOnly && !isAdminTools()) return false;
      var st = sc[t.id];
      if (!includeHidden && st && st.visible === false) return false;
      return true;
    }).map(function (t) {
      var st = sc[t.id];
      if (!st) return t;
      var cloneT = Object.assign({}, t);
      if (st.featured) cloneT._featured = true;
      if (st.badge) cloneT.badge = st.badge;
      return cloneT;
    });
    var ids = Array.isArray(customOrderCfg.order[role]) ? customOrderCfg.order[role] : [];
    if (ids.length) {
      var rank = {};
      ids.forEach(function (id, i) { rank[id] = i; });
      base = base.slice().sort(function (a, b) {
        var ra = (a.id in rank) ? rank[a.id] : 9999;
        var rb = (b.id in rank) ? rank[b.id] : 9999;
        return ra - rb;
      });
    }
    if (!includeHidden) {
      base = base.filter(function (t) { return customOrderCfg.hidden.indexOf(t.id) === -1; });
    }
    return base;
  }

  function moveToolInRole(role, toolId, dir) {
    var list = orderedToolsForRole(role, true).map(function (t) { return t.id; });
    var idx = list.indexOf(toolId);
    if (idx === -1) return;
    if (dir === "top") {
      list.splice(idx, 1); list.unshift(toolId);
    } else if (dir === "up" && idx > 0) {
      var tmp = list[idx - 1]; list[idx - 1] = list[idx]; list[idx] = tmp;
    } else if (dir === "down" && idx < list.length - 1) {
      var tmp2 = list[idx + 1]; list[idx + 1] = list[idx]; list[idx] = tmp2;
    }
    customOrderCfg.order[role] = list;
    try { localStorage.setItem(ORDER_KEY, JSON.stringify(customOrderCfg)); } catch (e) {}
    render();
  }

  function toggleHideTool(toolId) {
    var i = customOrderCfg.hidden.indexOf(toolId);
    if (i === -1) customOrderCfg.hidden.push(toolId);
    else customOrderCfg.hidden.splice(i, 1);
    try { localStorage.setItem(ORDER_KEY, JSON.stringify(customOrderCfg)); } catch (e) {}
    render();
  }

  var PATH_META = {
    student: {
      label: "مسار الطالب",
      icon: "🎒",
      desc: "أدوات حقيقية تعمل فوراً: المعلم الذكي، قارئ الكتب، السبورة، والملخصات",
      grad: "linear-gradient(135deg,#0ea5e9,#2563eb)",
      accent: "#38bdf8",
      badge: "للطالب"
    },
    teacher: {
      label: "مسار المعلم",
      icon: "👩‍🏫",
      desc: "أوراق العمل، خطط الدروس، مولّد البرومبتات، مختبر المعلم والشهادات",
      grad: "linear-gradient(135deg,#10b981,#0d9488)",
      accent: "#34d399",
      badge: "للمعلم"
    },
    tawjihi: {
      label: "التوجيهي والجامعة",
      icon: "🏆",
      desc: "بوابة التوجيهي الأوفلاين، حاسبة المعدل، صانع الـ CV، والبحث الشامل",
      grad: "linear-gradient(135deg,#f59e0b,#ea580c)",
      accent: "#fbbf24",
      badge: "توجيهي"
    },
    kids: {
      label: "الطفل والأنشطة",
      icon: "🎮",
      desc: "تحدي الأسئلة السريعة، بطاقات الذاكرة التعليمية، وبطاقة الإنجاز",
      grad: "linear-gradient(135deg,#ec4899,#8b5cf6)",
      accent: "#f472b6",
      badge: "أنشطة"
    },
    favs: {
      label: "المفضلة",
      icon: "⭐",
      desc: "أدواتك المثبّتة للوصول السريع بلمسة واحدة",
      grad: "linear-gradient(135deg,#eab308,#f97316)",
      accent: "#fde047",
      badge: "مفضلة"
    }
  };

  // كتالوج نظيف 100% من الأدوات الحقيقية العاملة فعلياً فقط (لا توجد أي أداة وهمية)
  var REAL_TOOLS = [
    // v294: أدوات الطالب الذكية والمختبرات التفاعلية
    {
      id: "v294StudentTutorPro", role: "student", ico: "🧠",
      title: "مُذاكِر الدروس للطلاب",
      desc: "اشرح لي أي درس كأني في صفي + 5 أسئلة تفاعلية فورية مع نطق عربي فصيح",
      action: "v294:pro:tutor"
    },
    {
      id: "v294SmartScannerStudent", role: "student", ico: "📸",
      title: "ماسح الدفاتر الذكي (PDF)",
      desc: "صوّر دفترك وحوّله لملف PDF بنفس خطك أوفلاين أو نص مطبوع مرتب بالذكاء الاصطناعي",
      action: "v294:scanner:student"
    },
    {
      id: "v22SmartEnroll", role: "student", hiddenInGrid: true, ico: "🚀",
      title: "التسجيل الذكي بالدورات (أكواد منح + تقويم)",
      desc: "سجّل في دورات EduTech Mindset مع دعم أكواد المنح وقائمة الانتظار وتقويم Google",
      action: "v22:courses:enroll"
    },
    {
      id: "v22AlumniLocker", role: "student", hiddenInGrid: true, ico: "📦",
      title: "حقيبة المتدرب ما بعد الدورة",
      desc: "افتح ملفات وقوالب دفعتك التدريبية باستخدام كود الدفعة المخصص",
      action: "v22:courses:locker"
    },
    {
      id: "v22EmbedWidget", role: "teacher", ico: "🧩",
      title: "تضمين مولّد البرومبتات في موقع مدرستك",
      desc: "احصل على كود مجاني جاهز لإضافة مولّد EduTech Mindset داخل أي موقع أو مدونة",
      action: "v22:embed:widget"
    },
    {
      id: "v22AdminEnrPro", role: "teacher", isAdminOnly: true, ico: "👑",
      title: "إدارة المتدربين وإصدار الشهادات PRO",
      desc: "للإدارة: قبول المتدربين، إصدار أرقام التحقق وشهادات PNG، ومراسلة واتساب",
      action: "v22:admin:enr"
    },
    {
      id: "v21CourseQuiz", role: "student", hiddenInGrid: true, ico: "🧭",
      title: "اختبار تحديد الدورة الأنسب (30 ثانية)",
      desc: "3 أسئلة سريعة ترشّح لك الدورة الأنسب لمستواك وأهدافك التعليمية",
      action: "v21:courses:quiz"
    },
    {
      id: "v21CertVerify", role: "teacher", hiddenInGrid: true, ico: "🎓",
      title: "التحقق من الشهادات المعتمدة",
      desc: "تحقّق فورًا من صحة أي شهادة صادرة عن مبادرة EduTech Mindset بالرقم التسلسلي",
      action: "v21:courses:verify"
    },
    {
      id: "v11HomeworkTeacher", role: "teacher", ico: "📸",
      title: "الواجبات المصوّرة والتصحيح الذكي",
      desc: "انشر واجبًا برابط مباشر ليصوّر الطالب دفتره ويصحّحه الذكاء الاصطناعي بضغطة زر",
      action: "v11:homework:teacher"
    },
    {
      id: "v11HomeworkStudent", role: "student", ico: "📝",
      title: "تسليم الواجب المصوّر للمعلم",
      desc: "صوّر حلك من دفترك وأرسله لمعلمك عبر رابط الواجب لتحصل على الدرجة والملاحظات",
      action: "v11:homework:student"
    },
    {
      id: "v11GamesTeacher", role: "teacher", ico: "🎮",
      title: "مسابقات وألعاب صفية حية (PIN)",
      desc: "سباق الأبطال Kahoot-style، عجلة الحظ، ومطابقة البطاقات مع لوحة شرف فورية",
      action: "v11:games:teacher"
    },
    {
      id: "v11GamesStudent", role: "student", ico: "🏆",
      title: "دخول لعبة ومسابقـة صفية (PIN)",
      desc: "انضم لمسابقة صفك برمز الغرفة (PIN) بدون تسجيل دخول وتنافس على لوحة الشرف",
      action: "v11:games:student"
    },
    {
      id: "v1ClassroomsStudent", role: "student", ico: "🏫",
      title: "دخول الصف عن بُعد (بكود المعلم)",
      desc: "ادخل فصلك الافتراضي برمز المعلم بدون بريد إلكتروني لمتابعة الواجبات والاختبارات والدرجات",
      action: "v1:classrooms:student"
    },
    {
      id: "v1ClassroomsTeacher", role: "teacher", ico: "🏫",
      title: "الفصول الافتراضية برمز المعلم",
      desc: "أنشئ صفًا عن بُعد بكود قصير، شاركه على واتساب، وأدر حضور ودرجات طلابك",
      action: "v1:classrooms:teacher"
    },
    {
      id: "v294PhetStudent", role: "student", ico: "🧪",
      title: "مختبر PhET العربي (24 تجربة)",
      desc: "تجارب تفاعلية حية في الفيزياء والكيمياء والأحياء والرياضيات تعمل مباشرة داخل المنصة",
      action: "v294:lab:phet"
    },
    {
      id: "v294QuranStudent", role: "student", ico: "📖",
      title: "المصحف المعلّم للتلاوة والحفظ",
      desc: "جميع السور بالرسم العثماني بصوت الحصري والمنشاوي والعفاسي مع تكرار الآيات للحفظ",
      action: "v294:lab:quran"
    },
    {
      id: "v294GeogebraStudent", role: "student", ico: "📐",
      title: "الراسم البياني والهندسي (GeoGebra)",
      desc: "ارسم الاقترانات والأشكال الهندسية ثنائية وثلاثية الأبعاد (2D/3D) + Desmos العربي",
      action: "v294:lab:geogebra"
    },
    {
      id: "v294BlocklyStudent", role: "student", ico: "🧩",
      title: "مختبر البرمجة باللبنات (Blockly)",
      desc: "تعلّم البرمجة والتفكير المنطقي بلبنات عربية تفاعلية مع ساحة الروبوت أوفلاين",
      action: "v294:lab:blockly"
    },
    // v294: أدوات المعلم الذكية والمختبرات
    {
      id: "v294Lesson60Teacher", role: "teacher", ico: "⚡",
      title: "حصة كاملة في 60 ثانية",
      desc: "تحضير حصة فلسطينية كاملة (حكومي وزاري 🇵🇸 + أونروا 🇺🇳) بـ 4 ملفات PDF جاهزة للطباعة",
      action: "v294:pro:lesson60"
    },
    {
      id: "v294RemedialTeacher", role: "teacher", ico: "🩺",
      title: "خطط علاجية وجدول المواصفات",
      desc: "بناء خطط علاجية للطلبة الضعاف + جدول مواصفات الامتحانات وأرشيف خططك",
      action: "v294:pro:remedial"
    },
    {
      id: "v294TeacherProRoom", role: "teacher", ico: "👩‍🏫",
      title: "غرفة المعلم PRO + الكاميرا",
      desc: "مسح الكشوفات والعلامات بالكاميرا + العجلة الصفية الأوفلاين + تحليل العلامات PDF",
      action: "v294:teacherPro"
    },
    {
      id: "v294WhiteboardTeacher", role: "teacher", ico: "✏️",
      title: "سبورة EduTech التفاعلية (أوفلاين)",
      desc: "قلم وأشكال هندسية وشبكة إحداثيات (س، ص) وحفظ PNG مباشرة للهاتف + رابط Excalidraw",
      action: "v294:lab:whiteboard"
    },
    {
      id: "v294PromptLibTeacher", role: "teacher", ico: "📚",
      title: "مكتبة البرومبتات والقوالب",
      desc: "قوالب تعليمية جاهزة وفق SAMR وبلوم وSTEM وفيديوهات الشرح التربوي",
      action: "v294:promptLib"
    },
    {
      id: "v294SmartScannerTeacher", role: "teacher", ico: "📸",
      title: "ماسح الدفاتر والأوراق الذكي (PDF)",
      desc: "مسح أوراق العمل والاختبارات وتصويرها كملف PDF نظيف أو تحويلها لنص قابل للتعديل",
      action: "v294:scanner:teacher"
    },
    {
      id: "v294PhetTeacher", role: "teacher", ico: "🧪",
      title: "مختبر PhET العربي للشرح الصفي",
      desc: "24 محاكاة فيزياء وكيمياء وأحياء ورياضيات جاهزة للعرض المباشر أمام الطلاب",
      action: "v294:lab:phet"
    },
    {
      id: "v294GeogebraTeacher", role: "teacher", ico: "📐",
      title: "الراسم البياني والهندسي (GeoGebra)",
      desc: "أداة عرض وشرح الاقترانات والهندسة والفضاء ثلاثي الأبعاد داخل الحصة",
      action: "v294:lab:geogebra"
    },
    // v294: أدوات التوجيهي الرسمية والمختبرات
    {
      id: "v294TawjihiExams", role: "tawjihi", ico: "🏛️",
      title: "بنك امتحانات التوجيهي الرسمية",
      desc: "أسئلة السنوات السابقة من وزارة التربية والتعليم لجميع الفروع + توليد امتحان محاكي AI",
      action: "v294:lab:tawjihi_exams"
    },
    {
      id: "v294GeogebraTawjihi", role: "tawjihi", ico: "📐",
      title: "الراسم البياني للتوجيهي العلمي",
      desc: "رسم الاقترانات والتكامل والهندسة الفضائية ثلاثية الأبعاد (GeoGebra + Desmos)",
      action: "v294:lab:geogebra"
    },
    {
      id: "v294PhetTawjihi", role: "tawjihi", ico: "🧪",
      title: "مختبر PhET للفيزياء والكيمياء",
      desc: "محاكاة دوائر التيار وقانون أوم وفاراداي والذرة وpH لتوجيهي فلسطين",
      action: "v294:lab:phet"
    },
    // مسار الطالب
    {
      id: "studentAiTutor", role: "student", ico: "🧠",
      title: "المعلم الخصوصي الذكي",
      desc: "حاور المعلم الذكي، صوّر أي مسألة، واطلب شرح دروسك خطوة بخطوة مع صوت فصيح",
      script: "js/assistant.js", action: "openAssistant"
    },
    {
      id: "bookReaderStudio", role: "student", ico: "📖",
      title: "قارئ الكتب التفاعلي",
      desc: "تصفّح الكتب المدرسية وملفات PDF مع تظليل الفقرات والاستماع الصوتي",
      script: "js/bookreader.js", domId: "bookReaderStudio"
    },
    {
      id: "whiteboardStudio", role: "student", ico: "🎨",
      title: "السبورة التفاعلية الذكية",
      desc: "سبورة رسم وشرح تفاعلية بالألوان والأشكال للحل والشرح المباشر",
      script: "js/whiteboard.js", domId: "whiteboardStudio"
    },
    {
      id: "offlineCornellTool", role: "student", ico: "📝",
      title: "ملخص كورنيل وبطاقات الحفظ",
      desc: "لخّص دروسك بطريقة كورنيل وراجع ببطاقات قلّابة ذكية (يعمل أوفلاين)",
      action: "openCornell"
    },

    {
      id: "voiceStudioPodcast", role: "student", ico: "🎧",
      title: "صانع البودكاست التعليمي الثنائي",
      desc: "حوّل أي درس إلى حوار صوتي شيّق يتناوب فيه صوت أ. باسل والمعلمة الفصيحة",
      action: "openVoicePodcast"
    },

    {
      id: "proSuiteSnap", role: "student", ico: "📸",
      title: "مصوّر ومشرح الأسئلة بالصوت",
      desc: "صوّر سؤالك من الدفتر أو الكتاب واحصل على شرح خطوة بخطوة بصوت المعلمة الفصيحة",
      action: "openProSnap"
    },
    {
      id: "proSuiteMistakes", role: "student", ico: "📓",
      title: "دفتر أخطائي الذكي (أوفلاين)",
      desc: "يجمع تلقائياً الأسئلة التي أخطأت فيها لتراجعها قبل الامتحان وتتقنها 100%",
      action: "openProMistakes"
    },
    {
      id: "palStemSolver", role: "student", ico: "🧮",
      title: "حالّل المسائل العلمية (بالطريقة الفلسطينية)",
      desc: "يحل ويشرح مسائل الرياضيات والفيزياء والكيمياء بالمعطيات والقانون ويلفظ المعادلات بالعربية",
      action: "openStemSolver"
    },
    {
      id: "studentNotebookLM", role: "student", ico: "📓",
      title: "دفتر المعرفة الذكي (بأسلوب NotebookLM)",
      desc: "أضف دروسك ومصادرك واحصل على بودكاست حواري، دليل دراسة، بطاقات، اختبار، وإجابات موثّقة",
      action: "openNotebookLM"
    },
    {
      id: "studentPlannerPro", role: "student", ico: "🧠",
      title: "منظّم الواجبات وخريطة المفاهيم (أوفلاين)",
      desc: "نظّم واجباتك اليومية وارسم خرائط ذهنية ملونة للمذاكرة واحفظها كصورة PNG",
      action: "openStudentPlanner"
    },

    // مسار المعلم
    {
      id: "v281DailyTracker", role: "teacher", ico: "📋",
      title: "دفتر المتابعة اليومية للطلبة (PDF)",
      desc: "تسجيل الحضور والواجبات والمشاركة أوفلاين وتصدير كشف PDF رسمي وCSV",
      action: "v281:openDailyTracker"
    },
    {
      id: "v281OfflineTpl", role: "teacher", ico: "🇺🇳",
      title: "قوالب تحضير الأونروا وSLM أوفلاين",
      desc: "قوالب جاهزة للصف الاعتيادي والخيمة وبطاقات التعلم الذاتي PDF بلا نت",
      action: "v281:openOfflineTemplates"
    },
    {
      id: "teacherHubProUnified", role: "teacher", ico: "🏛️",
      title: "غرفة عمليات المعلم الموحّدة (الكل في مكان واحد)",
      desc: "تحليل المحتوى والمواصفات، الخطة العلاجية والفصلية، بنك أسئلتي، الإذاعة، ولي الأمر، وترويسة PDF الرسمية",
      action: "openTeacherHubPro"
    },
    {
      id: "teacherGradebookPro", role: "teacher", hiddenInGrid: true, ico: "📊",
      title: "دفتر العلامات ومحلّل نتائج الشعبة (أوفلاين)",
      desc: "احسب المجموع والنسبة والتقدير ونسبة النجاح تلقائياً وصدّر لملف Excel أو PDF",
      action: "openTeacherGradebook"
    },
    {
      id: "teacherNotebookLM", role: "teacher", ico: "📓",
      title: "دفتر المعلم البحثي (بأسلوب NotebookLM)",
      desc: "اجمع مراجعك وخططك وأنشئ منها بودكاست للطلاب ودليل دراسة واختبارات موثّقة من مصادرك",
      action: "openNotebookLM"
    },
    {
      id: "teacherProKitTool", role: "teacher", ico: "👩‍🏫",
      title: "حقيبة المعلم الاحترافية (5 أدوات)",
      desc: "مؤقّت الحصة، عجلة اختيار الطلاب، تحليل الدرجات، الحضور لواتساب، وسلم التقدير (أوفلاين)",
      action: "openTeacherKit"
    },
    {
      id: "aiStudio", role: "teacher", ico: "🇺🇳",
      title: "مساعد المعلم الذكي (تحضير الأونروا غزة + PDF)",
      desc: "تحضير رسمي لمعلمي الأونروا في غزة (التعليم الجامع، PSS، HRCRT، التأمل الذاتي) مع حفظ PDF بالترويسة والعلامة المائية",
      domId: "aiStudio"
    },
    {
      id: "worksheetStudio", role: "teacher", hiddenInGrid: true, ico: "📄",
      title: "مولّد أوراق العمل والاختبارات",
      desc: "أنشئ أوراق عمل واختبارات منسّقة للطباعة PDF خلال ثوانٍ",
      script: "js/worksheets.js", domId: "worksheetStudio"
    },
    {
      id: "lessonPlanStudio", role: "teacher", hiddenInGrid: true, ico: "📋",
      title: "محضّر خطط الدروس اليومية",
      desc: "تحضير دروس متكامل بالأهداف والوسائل والتقويم وفق المنهاج الفلسطيني",
      script: "js/lessonplans.js", domId: "lessonPlanStudio"
    },
    {
      id: "generator", role: "teacher", hiddenInGrid: true, ico: "✨",
      title: "مولّد البرومبتات التعليمية",
      desc: "صياغة أوامر ذكاء اصطناعي احترافية للمعلمين والأنشطة الصفية",
      domId: "generator"
    },
    {
      id: "edtechLabSection", role: "teacher", hiddenInGrid: true, ico: "🧪",
      title: "مختبر المعلم وأدوات التكنولوجيا",
      desc: "مجموعة أدوات المعلم العملية للتحضير، المتابعة، وتطوير الدروس",
      domId: "edtechLabSection", altDomId: "teacherTools"
    },
    {
      id: "verifiedCertTool", role: "teacher", hiddenInGrid: true, ico: "🏅",
      title: "إصدار الشهادات الموثّقة (QR)",
      desc: "إصدار شهادات تقدير وتدريب احترافية A4 جاهزة للطباعة مع رمز تحقق QR",
      action: "openCert"
    },

    {
      id: "voiceStudioMp3", role: "teacher", ico: "🎙️",
      title: "استوديو تحويل الدرس إلى صوت MP3",
      desc: "حوّل أي درس أو ملخص لصوت فصيح (المعلمة أو أ. باسل) وحمّله كملف MP3 لمشاركته",
      action: "openVoiceMp3"
    },

    // التوجيهي والجامعة
    {
      id: "v281TawjihiExam", role: "tawjihi", ico: "🏆",
      title: "اختبار التوجيهي الموقّت (مع الشرح)",
      desc: "امتحانات تجريبية بمؤقت وتصحيح فوري وشرح مفصّل لكل إجابة أوفلاين",
      action: "v281:openTawjihiExam"
    },
    {
      id: "eduTawjihiOfflinePro", role: "tawjihi", ico: "👑",
      title: "بوابة التوجيهي الشاملة (أوفلاين)",
      desc: "عدّاد الامتحان، اختبار تجريبي فوري، وخطة مراجعة 30 يوماً قابلة للطباعة",
      action: "openTawjihiPro"
    },
    {
      id: "tawjihiStudio", role: "tawjihi", ico: "🎓",
      title: "حاسبة معدل التوجيهي والمستشار",
      desc: "احسب معدلك بدقة لجميع الفروع واستكشف التخصصات الجامعية المناسبة",
      script: "js/tawjihi.js", domId: "tawjihiStudio"
    },
    {
      id: "cvBuilderStudio", role: "tawjihi", ico: "📑",
      title: "صانع السيرة الذاتية (CV)",
      desc: "أنشئ سيرة ذاتية ATS احترافية بالعربية والإنجليزية جاهزة للطباعة PDF",
      script: "js/cvbuilder.js", domId: "cvBuilderStudio"
    },
    {
      id: "globalSearchTool", role: "tawjihi", ico: "🔍",
      title: "البحث الشامل في المنصة",
      desc: "ابحث فوراً في كل المراحل والكتب والدورات والأدوات من مكان واحد",
      action: "openSearch"
    },

    {
      id: "voiceStudioMemorizer", role: "tawjihi", ico: "🔁",
      title: "محفّظ القصائد والتعريفات بالتكرار",
      desc: "كرّر الأبيات والتعريفات صوتياً مع التحكم بالسرعة (0.8× للحفظ أو 1.25× للمراجعة)",
      action: "openVoiceMemorizer"
    },

    {
      id: "proSuiteFocus", role: "tawjihi", ico: "🎧",
      title: "غرفة التركيز والدعاء (بومودورو)",
      desc: "مؤقّت تركيز 25/45 دقيقة + أصوات مطر وتركيز أوفلاين + دعاء المذاكرة الصوتي",
      action: "openProFocus"
    },
    {
      id: "proSuiteSchedule", role: "tawjihi", ico: "📅",
      title: "الجدول الدراسي الأسبوعي PNG/PDF",
      desc: "رتّب حصصك ومواعيد مراجعتك (السبت – الخميس) واحفظه كصورة أو PDF أوفلاين",
      action: "openProSchedule"
    },

    // الطفل والأنشطة
    {
      id: "v281KidsTaasees", role: "kids", ico: "🌟",
      title: "ركن التأسيس السليم الشامل (أوفلاين)",
      desc: "حروف عربية بالحركات وإنجليزي وفرنسي وسبورة تتبع ورياضيات وشهادة بطل",
      action: "v281:openKidsTaasees"
    },
    {
      id: "kidsQuickQuiz", role: "kids", ico: "✅",
      title: "تحدي الأسئلة السريعة (أوفلاين)",
      desc: "اختبار تفاعلي ممتع من 5 أسئلة مع نقاط XP فورية لتنشيط الذاكرة",
      action: "openQuickQuiz"
    },
    {
      id: "kidsMemoryCards", role: "kids", ico: "🃏",
      title: "بطاقات الذاكرة القلّابة",
      desc: "تعلّم والعب بقلب البطاقات التفاعلية لتثبيت المعلومات بمتعة",
      action: "openFlashCards"
    },
    {
      id: "kidsAchieveCard", role: "kids", ico: "🏆",
      title: "بطاقة إنجازي ومشاركتها",
      desc: "اصنع بطاقة تفوّق باسمك ونقاطك وشاركها فوراً عبر واتساب",
      action: "openAchieve"
    },
    {
      id: "voiceStudioDictation", role: "kids", ico: "✍️",
      title: "مدرّب الإملاء الصوتي الذكي",
      desc: "تنطق المعلمة الجملة بالعربية الفصحى أو الإنجليزية وتصحّح إملاءك فوراً مع نقاط XP",
      action: "openVoiceDictation"
    }
  ];

  // حفظ مكان العنصر الأصلي لإرجاعه عند إغلاق نافذة الأداة المباشرة
  var hostedState = null;

  function esc(s) {
    return typeof escapeHtml === "function" ? escapeHtml(s) : String(s || "").replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  function norm(s) {
    return String(s || "").toLowerCase().replace(/[أإآ]/g, "ا").replace(/[ة]/g, "ه").replace(/[ى]/g, "ي").trim();
  }

  function getFavs() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]") || []; } catch (e) { return []; }
  }

  function toggleFav(id) {
    var f = getFavs();
    var i = f.indexOf(id);
    if (i > -1) f.splice(i, 1);
    else f.unshift(id);
    try { localStorage.setItem(FAV_KEY, JSON.stringify(f)); } catch (e) {}
    render();
  }

  function checkToolPermission(toolId) {
    try {
      var perms = JSON.parse(localStorage.getItem("edu_tool_perms_v243") || "{}");
      var rule = perms[toolId];
      if (!rule || rule === "public") return true;
      var isAdm = document.body && document.body.classList.contains("is-super-admin");
      if (isAdm) return true;
      if (rule === "admin") {
        if (typeof showToast === "function") showToast("🔒 هذه الأداة مخصصة للإدارة حالياً", "warning");
        return false;
      }
      if (rule === "login") {
        var u = window.EduAccessControl && window.EduAccessControl.getCurrentUser && window.EduAccessControl.getCurrentUser();
        if (!u || !u.email) {
          if (typeof showToast === "function") showToast("🔐 يرجى تسجيل الدخول بحسابك لفتح هذه الأداة", "warning");
          var lg = document.getElementById("btnGoogleLoginHeader");
          if (lg) lg.click();
          return false;
        }
      }
    } catch (e) {}
    return true;
  }

  function closeDirectToolOverlay() {
    var ov = document.getElementById("eduDirectToolOverlay");
    if (hostedState && hostedState.el && hostedState.parent) {
      try {
        hostedState.el.style.cssText = hostedState.prevCss || "";
        if (hostedState.wasHidden) hostedState.el.classList.add("hidden");
        if (hostedState.nextSibling && hostedState.nextSibling.parentNode === hostedState.parent) {
          hostedState.parent.insertBefore(hostedState.el, hostedState.nextSibling);
        } else {
          hostedState.parent.appendChild(hostedState.el);
        }
      } catch (e) {}
      hostedState = null;
    }
    if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
    document.body.classList.remove("edu-any-modal-open");
    document.documentElement.classList.remove("modal-open");
    if (window.EduRouter && typeof window.EduRouter.refreshBar === "function") {
      window.EduRouter.refreshBar();
    }
    return true;
  }

  function openDomElementInDirectOverlay(el, tool) {
    closeDirectToolOverlay();
    hostedState = {
      el: el,
      parent: el.parentNode,
      nextSibling: el.nextSibling,
      prevCss: el.style.cssText,
      wasHidden: el.classList.contains("hidden")
    };

    var ov = document.createElement("div");
    ov.id = "eduDirectToolOverlay";
    ov.setAttribute("dir", "rtl");
    ov.style.cssText = "position:fixed;inset:0;z-index:99988;background:rgba(2,6,23,0.96);display:flex;flex-direction:column;overflow:hidden;";
    ov.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 14px;background:linear-gradient(135deg,#0f172a,#1e293b);border-bottom:1px solid rgba(56,189,248,0.35);flex-shrink:0;">' +
        '<div style="display:flex;align-items:center;gap:8px;min-width:0;">' +
          '<span style="font-size:20px;">' + esc(tool.ico || "✨") + '</span>' +
          '<strong style="font-size:13.5px;font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(tool.title) + '</strong>' +
        '</div>' +
        '<button type="button" id="eduCloseDirectToolBtn" style="padding:7px 14px;border-radius:12px;background:linear-gradient(135deg,#0ea5e9,#2563eb);color:#fff;font-size:12px;font-weight:900;border:none;cursor:pointer;flex-shrink:0;">→ رجوع وإغلاق</button>' +
      '</div>' +
      '<div id="eduDirectToolBody" style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 10px 80px;"></div>';

    document.body.appendChild(ov);
    document.body.classList.add("edu-any-modal-open");
    document.documentElement.classList.add("modal-open");

    var body = ov.querySelector("#eduDirectToolBody");
    el.classList.remove("hidden", "edu-hidden-by-hierarchy");
    el.style.setProperty("display", "block", "important");
    el.style.setProperty("visibility", "visible", "important");
    el.style.setProperty("opacity", "1", "important");
    el.style.margin = "0 auto";
    el.style.maxWidth = "1100px";
    body.appendChild(el);

    ov.querySelector("#eduCloseDirectToolBtn").onclick = closeDirectToolOverlay;
    if (window.EduRouter && typeof window.EduRouter.onToolOpened === "function") {
      window.EduRouter.onToolOpened("eduDirectToolOverlay", tool.title);
    }
  }

  function runBuiltInAction(actionName, tool) {
        if (actionName === "openProSnap" && window.EduProSuite) { window.EduProSuite.open("snap"); return true; }
    if (actionName === "openProExam" && window.EduProSuite) { window.EduProSuite.open("exam"); return true; }
    if (actionName === "openProFocus" && window.EduProSuite) { window.EduProSuite.open("focus"); return true; }
    if (actionName === "openProMistakes" && window.EduProSuite) { window.EduProSuite.open("mistakes"); return true; }
    if (actionName === "openProSchedule" && window.EduProSuite) { window.EduProSuite.open("schedule"); return true; }
    if (actionName === "openTeacherKit" && window.EduTeacherKit) { window.EduTeacherKit.open("timer"); return true; }
    if (actionName === "openStemSolver" && window.EduStPro) { window.EduStPro.openStemSolver(); return true; }
    if (actionName === "openStudentPlanner" && window.EduStPro) { window.EduStPro.openStudentPlanner(); return true; }
    if (actionName === "openTeacherGradebook" && window.EduStPro) { window.EduStPro.openTeacherGradebook(); return true; }
    if (actionName === "openTeacherPrepPro" && window.EduStPro) { window.EduStPro.openTeacherPrepPro(); return true; }
    if (actionName === "openNotebookLM" && window.EduNotebookLM) { window.EduNotebookLM.open("sources"); return true; }
    if (actionName === "openTeacherHubPro" && window.EduTeacherHubPro) { window.EduTeacherHubPro.open("core"); return true; }
    if (actionName === "openVoiceMp3" && window.EduVoiceStudio) { window.EduVoiceStudio.open("mp3"); return true; }
    if (actionName === "openVoicePodcast" && window.EduVoiceStudio) { window.EduVoiceStudio.open("podcast"); return true; }
    if (actionName === "openVoiceDictation" && window.EduVoiceStudio) { window.EduVoiceStudio.open("dictation"); return true; }
    if (actionName === "openVoiceMemorizer" && window.EduVoiceStudio) { window.EduVoiceStudio.open("memorizer"); return true; }

    if (actionName === "openTawjihiPro" && window.EduGamify && window.EduGamify.openTawjihiPro) {
      window.EduGamify.openTawjihiPro(); return true;
    }
    if (actionName === "openAchieve" && window.EduPersonalHub && window.EduPersonalHub.openAchievementCard) {
      window.EduPersonalHub.openAchievementCard(); return true;
    }
    if (actionName && actionName.indexOf("v281:") === 0) {
      var fn281 = actionName.slice(5);
      if (fn281 === "openKidsTaasees" && window.EduKidsTaasees) { window.EduKidsTaasees.open(); return true; }
      if (window.EduV281 && typeof window.EduV281[fn281] === "function") { window.EduV281[fn281](); return true; }
    }
    if (actionName === "openSearch" && window.EduGlobalSearch && window.EduGlobalSearch.open) {
      window.EduGlobalSearch.open(); return true;
    }
    if (actionName === "openCert") {
      if (window.EduV173 && typeof window.EduV173.openCertificate === "function") {
        window.EduV173.openCertificate(); return true;
      }
      if (typeof window.openVerifiedCertificate === "function") {
        window.openVerifiedCertificate(); return true;
      }
      if (window.EduModules && window.EduModules.loadScript) {
        if (typeof showToast === "function") showToast("⏳ جارٍ فتح أداة إصدار الشهادات الموثّقة…", "info");
        window.EduModules.loadScript("js/edutech-pro-pack.js").then(function () {
          setTimeout(function () {
            if (window.EduV173 && window.EduV173.openCertificate) window.EduV173.openCertificate();
          }, 250);
        });
        return true;
      }
    }
    if (actionName === "openAssistant") {
      function openNow() {
        var asst = document.getElementById("eduAsst");
        if (asst) { asst.classList.add("open"); return true; }
        var orb = document.getElementById("eduAsstOrb");
        if (orb) { orb.click(); return true; }
        return false;
      }
      if (openNow()) return true;
      if (window.EduModules && window.EduModules.loadScript) {
        if (typeof showToast === "function") showToast("⏳ جارٍ فتح المعلم الخصوصي الذكي…", "info");
        window.EduModules.loadScript("js/assistant.js").then(function () { setTimeout(openNow, 250); });
        return true;
      }
    }
    if (actionName && actionName.indexOf("v294:") === 0) {
      if (actionName.indexOf("v294:lab:") === 0) {
        var labKind = actionName.slice(9);
        if (window.EduV294Labs && typeof window.EduV294Labs.open === "function") { window.EduV294Labs.open(labKind); return true; }
        if (typeof showToast === "function") showToast("⏳ جارٍ فتح المختبر التفاعلي…", "info");
        if (window.EduModules && window.EduModules.loadScript) {
          window.EduModules.loadScript("js/v294-smart-labs.js").then(function () { if (window.EduV294Labs) window.EduV294Labs.open(labKind); });
          return true;
        }
      }
      if (actionName.indexOf("v294:pro:") === 0) {
        var pk = actionName.slice(9);
        if (window.EduV284Subs && typeof window.EduV284Subs.openProStudio === "function") { window.EduV284Subs.openProStudio(pk); return true; }
        return false;
      }

      if (actionName === "v294:scanner:student" || actionName === "v294:scanner:teacher") {
        var sm = actionName.split(":")[2];
        if (window.EduSmartScanner && typeof window.EduSmartScanner.open === "function") { window.EduSmartScanner.open(sm); return true; }
        if (window.EduModules && window.EduModules.loadScript) {
          window.EduModules.loadScript("js/v288-smart-scanner.js").then(function () { if (window.EduSmartScanner) window.EduSmartScanner.open(sm); });
          return true;
        }
      }
      if (actionName === "v294:teacherPro") {
        if (window.EduTeacherPro && typeof window.EduTeacherPro.open === "function") { window.EduTeacherPro.open(); return true; }
        if (window.EduModules && window.EduModules.loadScript) {
          window.EduModules.loadScript("js/v288-teacher-pro.js").then(function () { if (window.EduTeacherPro) window.EduTeacherPro.open(); });
          return true;
        }
      }
      if (actionName === "v294:promptLib") {
        if (typeof window.EduOpenLibrary === "function") { window.EduOpenLibrary(); return true; }
      }
    }
    if (actionName === "openCornell" || actionName === "openFlashCards" || actionName === "openQuickQuiz") {
      var mode = actionName === "openCornell" ? "summary" : (actionName === "openFlashCards" ? "cards" : "quiz");
      if (window.EduPersonalHub && typeof window.EduPersonalHub.openInteractiveTool === "function") {
        window.EduPersonalHub.openInteractiveTool(mode, tool.title, "أداة تفاعلية أوفلاين");
        return true;
      }
    }
        if (actionName === "v1:classrooms:student" || actionName === "v1:classrooms:teacher") {
      var cm = actionName.endsWith("teacher") ? "teacher" : "student";
      if (window.EduClassrooms && typeof window.EduClassrooms.open === "function") { window.EduClassrooms.open(cm); return true; }
      if (window.EduModules && window.EduModules.loadScript) {
        window.EduModules.loadScript("js/classrooms.js?v=3.1.0").then(function () { if (window.EduClassrooms) window.EduClassrooms.open(cm); });
        return true;
      }
    }
    if (actionName === "v11:homework:teacher" || actionName === "v11:homework:student") {
      var hm = actionName.endsWith("teacher") ? "teacher" : "student";
      if (window.EduHomework && typeof window.EduHomework.open === "function") { window.EduHomework.open(hm); return true; }
      if (window.EduModules && window.EduModules.loadScript) {
        window.EduModules.loadScript("js/homework.js?v=3.1.0").then(function () { if (window.EduHomework) window.EduHomework.open(hm); });
        return true;
      }
    }
    if (actionName === "v11:games:teacher" || actionName === "v11:games:student") {
      var gm = actionName.endsWith("teacher") ? "teacher" : "student";
      if (window.EduGames && typeof window.EduGames.open === "function") { window.EduGames.open(gm); return true; }
      if (window.EduModules && window.EduModules.loadScript) {
        window.EduModules.loadScript("js/games.js?v=3.1.0").then(function () { if (window.EduGames) window.EduGames.open(gm); });
        return true;
      }
    }
    if (actionName === "v22:courses:enroll" || actionName === "v22:courses:locker" || actionName === "v22:embed:widget" || actionName === "v22:admin:enr" || actionName === "v21:courses:quiz" || actionName === "v21:courses:verify") {
      var mapAcad = {
        "v22:courses:enroll": "openSmartEnrollModal",
        "v22:courses:locker": "openAlumniLocker",
        "v22:embed:widget": "openEmbedWidgetModal",
        "v22:admin:enr": "openAdminEnrollmentsPro",
        "v21:courses:quiz": "openCourseFitQuiz",
        "v21:courses:verify": "openCertVerifier"
      };
      var fnName = mapAcad[actionName];
      if (window.EduCoursesAcademyV21 && typeof window.EduCoursesAcademyV21[fnName] === "function") {
        window.EduCoursesAcademyV21[fnName]();
        return true;
      }
      if (window.EduModules && window.EduModules.loadScript) {
        window.EduModules.loadScript("js/v21-courses-academy.js?v=3.1.0").then(function () {
          if (window.EduCoursesAcademyV21 && window.EduCoursesAcademyV21[fnName]) window.EduCoursesAcademyV21[fnName]();
        });
        return true;
      }
    }
    return false;
  }

  function launchTool(tool) {
    if (!tool || !checkToolPermission(tool.id)) return;
    if (window.EduPersonalHub && typeof window.EduPersonalHub.markTaskDone === "function") {
      window.EduPersonalHub.markTaskDone("tool", 25);
    }

    if (tool.action && runBuiltInAction(tool.action, tool)) return;

    function resolveAndOpen() {
      var el = (tool.domId && document.getElementById(tool.domId)) || (tool.altDomId && document.getElementById(tool.altDomId));
      if (el) {
        openDomElementInDirectOverlay(el, tool);
        return true;
      }
      if (tool.fallbackAction && runBuiltInAction(tool.fallbackAction, tool)) return true;
      return false;
    }

    if (resolveAndOpen()) return;

    if (typeof showToast === "function") showToast("⏳ جارٍ فتح " + tool.title + "…", "info");
    var loader = (tool.script && window.EduModules && window.EduModules.loadScript)
      ? window.EduModules.loadScript(tool.script)
      : Promise.resolve(true);

    loader.then(function () {
      if (resolveAndOpen()) return;
      setTimeout(function () {
        if (!resolveAndOpen() && typeof showToast === "function") {
          showToast("تعذر فتح الأداة حالياً — حدّث الصفحة وجرّب مجدداً", "warning");
        }
      }, 350);
    });
  }

  function render() {
    var root = document.getElementById("unifiedToolsHub");
    if (!root) return;
    var favs = getFavs();
    var adm = isAdminTools();
    var rMode = adm && state.reorderMode && state.tab !== "favs";
    var counts = {
      student: orderedToolsForRole("student", rMode).length,
      teacher: orderedToolsForRole("teacher", rMode).length,
      tawjihi: orderedToolsForRole("tawjihi", rMode).length,
      kids: orderedToolsForRole("kids", rMode).length,
      favs: favs.length
    };

    var q = norm(state.q);
    var visible;
    if (q) {
      visible = REAL_TOOLS.filter(function (t) {
        if (!rMode && customOrderCfg.hidden.indexOf(t.id) !== -1) return false;
        return !t.hiddenInGrid && (!t.isAdminOnly || isAdminTools()) && norm(t.title + " " + t.desc).indexOf(q) !== -1;
      });
    } else if (state.tab === "favs") {
      visible = REAL_TOOLS.filter(function (t) { return favs.indexOf(t.id) !== -1 && (rMode || customOrderCfg.hidden.indexOf(t.id) === -1); });
    } else {
      visible = orderedToolsForRole(state.tab, rMode);
    }

    var meta = PATH_META[state.tab] || PATH_META.student;

    function tabBtn(key) {
      var m = PATH_META[key];
      var active = !q && state.tab === key;
      return '<button type="button" data-th-tab="' + key + '" class="edu-th-tab ' + (active ? "is-active" : "") + '" style="' + (active ? "background:" + m.grad + ";border-color:transparent;color:#fff;" : "") + '">' +
        '<span>' + m.icon + ' ' + m.label + '</span>' +
        '<span class="edu-th-cnt">' + counts[key] + '</span>' +
      '</button>';
    }

    function renderCardItem(t, idx) {
      var gm = PATH_META[t.role] || PATH_META.student;
      var isFav = favs.indexOf(t.id) !== -1;
      var delay = Math.min(idx * 35, 280);
      var isHidden = customOrderCfg.hidden.indexOf(t.id) !== -1;
      var reorderCtrl = rMode
        ? ('<div data-th-stop="1" style="display:flex;gap:4px;flex-wrap:wrap;margin-top:8px;padding-top:8px;border-top:1px dashed rgba(148,163,184,0.35);">' +
            '<button type="button" data-th-mv="up" data-th-id="' + esc(t.id) + '" style="flex:1;padding:5px 7px;border-radius:9px;background:#0284c7;color:#fff;border:none;font-size:11px;font-weight:900;cursor:pointer;">⬆️ أعلى</button>' +
            '<button type="button" data-th-mv="down" data-th-id="' + esc(t.id) + '" style="flex:1;padding:5px 7px;border-radius:9px;background:#334155;color:#fff;border:none;font-size:11px;font-weight:900;cursor:pointer;">⬇️ أسفل</button>' +
            '<button type="button" data-th-mv="top" data-th-id="' + esc(t.id) + '" style="padding:5px 8px;border-radius:9px;background:#f59e0b;color:#020617;border:none;font-size:11px;font-weight:900;cursor:pointer;">📌 أولاً</button>' +
            '<button type="button" data-th-hide="' + esc(t.id) + '" style="padding:5px 8px;border-radius:9px;background:' + (isHidden ? "#10b981" : "#be123c") + ';color:#fff;border:none;font-size:11px;font-weight:900;cursor:pointer;">' + (isHidden ? "👁️ إظهار" : "🙈 إخفاء") + '</button>' +
          '</div>')
        : "";
      return '<article class="edu-tool-card" style="--edu-accent:' + gm.accent + ';--edu-grad:' + gm.grad + ';animation-delay:' + delay + 'ms;' + (isHidden ? "opacity:0.48;border-style:dashed;" : "") + '" data-th-launch="' + esc(t.id) + '">' +
        '<div class="edu-tool-card-top">' +
          '<div class="edu-tool-ico" style="background:' + gm.grad + ';">' + esc(t.ico || gm.icon) + '</div>' +
          '<button type="button" data-th-fav="' + esc(t.id) + '" class="edu-tool-fav ' + (isFav ? "is-fav" : "") + '" aria-label="تفضيل الأداة">' + (isFav ? "★" : "☆") + '</button>' +
        '</div>' +
        '<div class="edu-tool-badge" style="color:' + gm.accent + ';">' + gm.icon + ' ' + gm.badge + '</div>' +
        '<h3 class="edu-tool-title">' + esc(t.title) + '</h3>' +
        '<p class="edu-tool-desc">' + esc(t.desc) + '</p>' +
        '<div class="edu-tool-foot">' +
          '<span class="edu-tool-open-btn" style="background:' + gm.grad + ';">فتح الأداة مباشرة ←</span>' +
        '</div>' +
        reorderCtrl +
      '</article>';
        }
    var gridSectionHtml = "";
    if (!visible.length) {
      gridSectionHtml = '<div class="edu-tools-grid"><div class="edu-th-empty">لا توجد أدوات مطابقة — جرّب مساراً آخر أو امسح البحث ✨</div></div>';
    } else if (!q && !rMode && state.tab !== "favs" && visible.length > 6) {
      var coreTools = visible.slice(0, 6);
      var extraTools = visible.slice(6);
      gridSectionHtml =
        '<div style="display:flex;align-items:center;justify-content:space-between;margin:10px 0 8px;padding:0 4px;">' +
          '<span style="font-size:13px;font-weight:900;color:#0f172a;">⭐ الأدوات الأساسية اليومية</span>' +
          '<span style="font-size:11px;font-weight:700;color:#64748b;">الأكثر استخداماً</span>' +
        '</div>' +
        '<div class="edu-tools-grid">' + coreTools.map(renderCardItem).join("") + '</div>' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin:18px 0 8px;padding:0 4px;">' +
          '<span style="font-size:13px;font-weight:900;color:#334155;">🧰 أدوات متخصصة وإضافية</span>' +
          '<span style="font-size:11px;font-weight:700;color:#64748b;">' + extraTools.length + ' أداة</span>' +
        '</div>' +
        '<div class="edu-tools-grid">' + extraTools.map(function (t, i) { return renderCardItem(t, i + 6); }).join("") + '</div>';
    } else {
      gridSectionHtml = '<div class="edu-tools-grid">' + visible.map(renderCardItem).join("") + '</div>';
    }

    root.innerHTML =
      '<div class="edu-th-shell" dir="rtl">' +
        '<div class="edu-th-head">' +
          '<div style="min-width:0;">' +
            '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-bottom:4px;">' +
              '<span class="edu-th-kicker">🚀 مختبر EduTech المباشر • ' + REAL_TOOLS.length + ' أداة ومختبر تفاعلي</span>' +
              '<button type="button" onclick="if(window.EduV284Subs)window.EduV284Subs.openPlans();" style="padding:4px 11px;border-radius:999px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#020617;border:none;font-size:11px;font-weight:900;cursor:pointer;">⭐ باقات الاشتراك والأكواد</button>' +
              (adm ? '<button type="button" id="eduThToggleReorder" style="padding:4px 11px;border-radius:999px;background:' + (rMode ? "#10b981" : "rgba(56,189,248,0.2)") + ';color:' + (rMode ? "#020617" : "#7dd3fc") + ';border:1px solid rgba(56,189,248,0.45);font-size:11px;font-weight:900;cursor:pointer;">' + (rMode ? "✓ إنهاء الترتيب" : "🔀 ترتيب الأدوات") + '</button>' : '') +
            '</div>' +
            '<h2 class="edu-th-h2">مركز الأدوات والمختبرات الإبداعية</h2>' +
            '<p class="edu-th-sub">' + esc(q ? ("نتائج البحث عن: «" + state.q + "» (" + visible.length + ")") : meta.desc) + '</p>' +
          '</div>' +
          '<div class="edu-th-search-wrap">' +
            '<div style="display:flex;gap:6px;align-items:center;"><input id="eduToolsHubSearch" type="search" value="' + esc(state.q) + '" placeholder="ابحث بالكتابة أو بالصوت…" class="edu-th-search" style="flex:1;"><button type="button" id="eduVoiceSearchBtn" title="البحث الصوتي الفوري" style="width:40px;height:40px;border-radius:13px;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff;border:none;font-size:16px;cursor:pointer;flex-shrink:0;">🎤</button></div>' +
          '</div>' +
        '</div>' +
        '<div class="edu-th-tabs">' +
          tabBtn("student") + tabBtn("teacher") + tabBtn("tawjihi") + tabBtn("kids") + tabBtn("favs") +
        '</div>' +
        (rMode ? '<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;margin-bottom:12px;border-radius:14px;background:rgba(16,185,129,0.14);border:1.5px solid rgba(52,211,153,0.45);">' +
          '<span style="font-size:12px;font-weight:900;color:#a7f3d0;">🔀 وضع الترتيب اليدوي مفعّل — رتّب أو أخفِ الأدوات ثم اضغط حفظ لتطبيقه على جميع الطلاب والمعلمين</span>' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
            '<button type="button" id="eduThSaveOrder" style="padding:6px 13px;border-radius:10px;background:#10b981;color:#020617;border:none;font-size:11.5px;font-weight:900;cursor:pointer;">💾 حفظ الترتيب للجميع</button>' +
            '<button type="button" id="eduThResetOrder" style="padding:6px 11px;border-radius:10px;background:#475569;color:#fff;border:none;font-size:11.5px;font-weight:900;cursor:pointer;">↩️ استعادة الافتراضي</button>' +
          '</div>' +
        '</div>' : '') +
        gridSectionHtml +
      '</div>';

    
    var vsBtn = document.getElementById("eduVoiceSearchBtn");
    if (vsBtn) {
      vsBtn.onclick = function () {
        var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { if (typeof showToast === "function") showToast("متصفحك لا يدعم البحث الصوتي حالياً", "warning"); return; }
        var rec = new SR();
        rec.lang = "ar-SA";
        rec.interimResults = false;
        vsBtn.textContent = "🔴";
        if (typeof showToast === "function") showToast("🎤 تحدّث الآن باسم الأداة أو المادة…", "info");
        rec.onresult = function (ev) {
          var spoken = (ev.results && ev.results[0] && ev.results[0][0] && ev.results[0][0].transcript) || "";
          if (spoken) { state.q = spoken; render(); }
        };
        rec.onend = rec.onerror = function () { vsBtn.textContent = "🎤"; };
        try { rec.start(); } catch (e) { vsBtn.textContent = "🎤"; }
      };
    }

    var inp = document.getElementById("eduToolsHubSearch");
    if (inp) {
      inp.oninput = function () {
        state.q = inp.value;
        var pos = inp.selectionStart;
        render();
        var nextInp = document.getElementById("eduToolsHubSearch");
        if (nextInp) { nextInp.focus(); try { nextInp.setSelectionRange(pos, pos); } catch (e) {} }
      };
    }

    root.querySelectorAll("[data-th-tab]").forEach(function (btn) {
      btn.onclick = function () {
        state.q = "";
        state.tab = btn.getAttribute("data-th-tab") || "student";
        if (window.EduPersonalHub && state.tab !== "favs") {
          try { window.EduPersonalHub.setRole(state.tab, true); } catch (e) {}
        }
        render();
      };
    });

    root.querySelectorAll("[data-th-fav]").forEach(function (btn) {
      btn.onclick = function (ev) {
        ev.stopPropagation();
        toggleFav(btn.getAttribute("data-th-fav"));
      };
    });

    var trBtn = document.getElementById("eduThToggleReorder");
    if (trBtn) trBtn.onclick = function () { state.reorderMode = !state.reorderMode; render(); };
    var svBtn = document.getElementById("eduThSaveOrder");
    if (svBtn) svBtn.onclick = function () { saveCloudToolsOrder(); };
    var rsBtn = document.getElementById("eduThResetOrder");
    if (rsBtn) rsBtn.onclick = function () { customOrderCfg = { order: {}, hidden: [] }; saveCloudToolsOrder().then(render); };
    root.querySelectorAll("[data-th-stop]").forEach(function (el) { el.onclick = function (ev) { ev.stopPropagation(); }; });
    root.querySelectorAll("[data-th-mv]").forEach(function (b) {
      b.onclick = function (ev) {
        ev.stopPropagation();
        moveToolInRole(state.tab, b.getAttribute("data-th-id"), b.getAttribute("data-th-mv"));
      };
    });
    root.querySelectorAll("[data-th-hide]").forEach(function (b) {
      b.onclick = function (ev) {
        ev.stopPropagation();
        toggleHideTool(b.getAttribute("data-th-hide"));
      };
    });
    root.querySelectorAll("[data-th-launch]").forEach(function (card) {
      card.onclick = function () {
        if (state.reorderMode) return;
        var id = card.getAttribute("data-th-launch");
        var tool = REAL_TOOLS.filter(function (x) { return x.id === id; })[0];
        if (tool) launchTool(tool);
      };
    });
  }

  function mount() {
    var existing = document.getElementById("unifiedToolsHub");
    if (!existing) {
      existing = document.createElement("section");
      existing.id = "unifiedToolsHub";
      existing.className = "max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 my-8";
    }
    var learn = document.getElementById("learnSection");
    var social = document.getElementById("social");
    var footer = document.querySelector("footer");
    if (learn && learn.parentNode) {
      if (existing.previousElementSibling !== learn) learn.parentNode.insertBefore(existing, learn.nextSibling);
    } else if (social && social.parentNode && !existing.parentNode) {
      social.parentNode.insertBefore(existing, social);
    } else if (footer && footer.parentNode && !existing.parentNode) {
      footer.parentNode.insertBefore(existing, footer);
    }
    render();
  }

  window.EduToolsHub = {
    render: render,
    getRealTools: function () { return REAL_TOOLS.slice(); },
    closeOverlay: closeDirectToolOverlay,
    selectTab: function (tab) { state.q = ""; state.tab = PATH_META[tab] ? tab : "student"; render(); },
    launchById: function (id) {
      var tool = REAL_TOOLS.filter(function (x) { return x.id === id; })[0];
      if (tool) launchTool(tool);
    }
  };

  function boot() {
    mount();
    setTimeout(mount, 600);
    setTimeout(mount, 1600);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.EduToolsHub = Object.assign(window.EduToolsHub || {}, {
    tools: REAL_TOOLS,
    refresh: render,
    launchById: function (id) {
      var found = REAL_TOOLS.filter(function (t) { return t.id === id; })[0];
      if (found) { launchTool(found); return true; }
      return false;
    }
  });
  window.EduLauncher = Object.assign(window.EduLauncher || {}, {
    apps: REAL_TOOLS,
    open: function (id) { return window.EduToolsHub.launchById(id); },
    refresh: render
  });
})();