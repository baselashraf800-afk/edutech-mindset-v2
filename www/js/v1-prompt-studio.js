/* ============================================================================
 * EduTech Mindset — مولّد البرومبتات الذكي المطوّر (v1.0.0)
 * يطوّر قسم #generator داخل الصفحة دون كسر أي زر أو معرّف سابق:
 * - 8 مسارات ذكية ديناميكية (بما فيها مسار التعلّم عن بُعد والصفوف الافتراضية)
 * - مفتاح الوضع السريع / الاحترافي + 6 وصفات جاهزة بنقرة واحدة
 * - مكعبات الإضافات السريعة (توطين محلي، تشكيل، درع الدقة، Plan B، هاتف، Kahoot)
 * - تحديث نماذج الذكاء الاصطناعي وتكييف هيكل البرومبت لكل نموذج
 * - سجل آخر 10 برومبتات + مشاركة رابط الإعدادات + طباعة نظيفة + نشر بالفصل الافتراضي
 * ============================================================================ */
(function (global) {
  "use strict";

  var HIST_KEY = "edutech_prompt_history_v1";
  var MODE_KEY = "edutech_prompt_mode_v1";

  var TRACKS = {
    school: {
      id: "school",
      label: "التعليم المدرسي",
      icon: "🏫",
      grades: [
        "رياض الأطفال (KG1 - KG2)",
        "الابتدائية (الصفوف 1 - 4)",
        "المتوسطة / الإعدادية (الصفوف 5 - 9)",
        "الثانوية العامة (الصفوف 10 - 12)"
      ],
      subjects: [
        "تعليم المرحلة الأساسية",
        "اللغة العربية",
        "الرياضيات",
        "العلوم والحياة",
        "اللغة الإنجليزية",
        "التربية الإسلامية",
        "الدراسات الاجتماعية",
        "الفيزياء",
        "الكيمياء",
        "الأحياء",
        "التكنولوجيا والبرمجة"
      ],
      goals: [
        "خطة درس تفاعلية وفق منهجية 5E",
        "اختبار قصير متدرج (هرم بلوم)",
        "3 نماذج اختبار متكافئة (أ، ب، ج) لمنع الغش",
        "لعبة صفية ونشاط كسر الجليد",
        "غرفة هروب تعليمية (4 ألغاز متسلسلة)",
        "منقذ حصة الاحتياط (نشاط فوري بدون تجهيز)",
        "خطّاف بداية الحصة (3 دقائق) + تذكرة خروج",
        "تبسيط مفهوم معقد بقصة وتشبيه",
        "ورقة عمل متمايزة لـ 3 مستويات",
        "استراتيجيات لمعالجة الفروق الفردية وصعوبات التعلم",
        "تجربة علمية بمواد منزلية آمنة"
      ],
      strategies: [
        "التعلم النشط والتلعيب (Gamification)",
        "الصف المقلوب (Flipped Classroom)",
        "التعلم التعاوني ومحطات التعلّم",
        "التعلم القائم على المشاريع (PBL)",
        "العصف الذهني وحل المشكلات",
        "التعليم المتمايز (Differentiated Instruction)",
        "التعلّم السقراطي بالاكتشاف الموجّه"
      ],
      durations: [
        "نشاط سريع (10 دقائق)",
        "حصة دراسية كاملة (45 دقيقة)",
        "حصتان متتاليتان (90 دقيقة)",
        "وحدة دراسية كاملة (6 حصص)",
        "واجب منزلي مرن (لوحة اختيارات)"
      ],
      topics: ["دورة الماء في الطبيعة", "الكسور الاعتيادية", "قوانين نيوتن", "اللام الشمسية والقمرية", "الدوائر الكهربائية"]
    },
    remote: {
      id: "remote",
      label: "التعلّم عن بُعد والصفوف",
      icon: "💻",
      grades: [
        "صف مباشر متزامن (Zoom / Meet / Teams)",
        "مجموعات واتساب وتيليجرام (إنترنت ضعيف)",
        "بطاقة تعلّم ذاتي (غير متزامن / انقطاع شبكة)",
        "صف مدمج / هجين (وجاهي + أونلاين)",
        "صف مكتظ (40 - 60 طالبًا)"
      ],
      subjects: [
        "اللغة العربية",
        "الرياضيات",
        "العلوم والحياة",
        "اللغة الإنجليزية",
        "التربية الإسلامية",
        "الفيزياء والكيمياء والأحياء",
        "التكنولوجيا والبرمجة",
        "الدراسات الاجتماعية",
        "إدارة الصف الافتراضي والتواصل"
      ],
      goals: [
        "حصة أونلاين تفاعلية للشاشات المغلقة (تحديات شات كل 7 دقائق)",
        "درس خفيف لواتساب (رسائل قصيرة + نص 3 رسائل صوتية + استطلاع)",
        "بطاقة تعلّم ذاتي مشروحة بالكامل للطالب المنقطع",
        "مهام الغرف الجانبية (Breakout Rooms) موقّتة",
        "أسئلة تقييم مقاومة للنسخ والغش (تطبيقية وصوتية)",
        "سؤال حضور ذكي في دقيقة + استراحة كسر ملل الشاشة",
        "منشور واجب جاهز لـ Google Classroom / Teams مع روبريك",
        "سيناريو فيديو تعليمي قصير (3 - 5 دقائق)",
        "لوحة اختيارات الواجب المنزلي (Choice Board - 6 خيارات)",
        "ميثاق آداب الصف الأونلاين + دليل مبسّط لولي الأمر",
        "ملخص تعويضي في 5 أسطر للطالب المنقطع عن الشبكة"
      ],
      strategies: [
        "تفاعل الشات والإيموجي (بدون إلزام بالكاميرا)",
        "التعلّم المصغّر بالكبسولات (Micro-Learning)",
        "الغرف الجانبية والعمل التعاوني الرقمي",
        "محطات التعلّم والقادة الطلابيون (للصفوف الكبيرة)",
        "التعلّم الذاتي الموجّه (Self-Paced)",
        "التقييم البديل والأصلي (Authentic Assessment)"
      ],
      durations: [
        "نشاط أونلاين خاطف (5 - 10 دقائق)",
        "حصة أونلاين مركّزة (30 دقيقة)",
        "حصة افتراضية كاملة (45 دقيقة)",
        "سلسلة 3 رسائل صوتية (90 ثانية لكل رسالة)",
        "خطة أسبوعية عبر واتساب"
      ],
      topics: ["مراجعة الوحدة الأولى أونلاين", "الكسور العشرية عبر واتساب", "قواعد الإملاء بتحديات الشات", "تفاعلات كيميائية بمواد المنزل"]
    },
    tawjihi: {
      id: "tawjihi",
      label: "التوجيهي والاختبارات",
      icon: "🏆",
      grades: [
        "التوجيهي - الفرع العلمي",
        "التوجيهي - الفرع الأدبي",
        "التوجيهي - الريادة والأعمال",
        "التوجيهي - التكنولوجي / الصناعي",
        "الصف الحادي عشر (تأسيس للتوجيهي)"
      ],
      subjects: [
        "الرياضيات",
        "الفيزياء",
        "الكيمياء",
        "الأحياء",
        "اللغة العربية",
        "اللغة الإنجليزية",
        "التربية الإسلامية",
        "التاريخ والجغرافيا",
        "تكنولوجيا المعلومات"
      ],
      goals: [
        "أسئلة متوقعة بنمط الامتحانات الوزارية مع الحل النموذجي",
        "خطة مراجعة تنازلية بالتكرار المتباعد (30 يومًا)",
        "تحليل الأخطاء الشائعة والأسئلة الفخّية في الوحدة",
        "ملخص مركّز للقوانين والمفاهيم في صفحة واحدة",
        "معلّم سقراطي يدرّبني على الحل خطوة بخطوة دون إعطاء الجواب",
        "بطاقات ذاكرة وحيل حفظ سريعة (Mnemonics)"
      ],
      strategies: [
        "التكرار المتباعد والاسترجاع النشط",
        "التدريب على أنماط السنوات السابقة",
        "كشف المفاهيم الخاطئة (Misconception Hunter)",
        "حل المسائل بالتفكير المتدرج (Step-by-Step)"
      ],
      durations: [
        "جلسة مراجعة مكثّفة (30 دقيقة)",
        "امتحان تجريبي موقّت (60 دقيقة)",
        "خطة مراجعة أسبوعية",
        "خطة 30 يومًا قبل الامتحان"
      ],
      topics: ["التفاضل والتكامل", "المجال المغناطيسي", "الكيمياء العضوية", "قواعد اللغة العربية للتوجيهي"]
    },
    university: {
      id: "university",
      label: "الجامعة والبحث العلمي",
      icon: "🎓",
      grades: [
        "السنة الأولى / الثانية (بكالوريوس)",
        "السنة الثالثة / الرابعة (مشروع تخرج)",
        "الدراسات العليا (ماجستير / دكتوراه)",
        "باحث أكاديمي مستقل"
      ],
      subjects: [
        "هندسة البرمجيات وعلوم الحاسوب",
        "الهندسة (مدنية، كهربائية، ميكانيكية)",
        "التربية وتكنولوجيا التعليم",
        "إدارة الأعمال والمحاسبة",
        "العلوم الطبية والصحية",
        "العلوم الإنسانية والقانون",
        "البحث العلمي ومناهجه"
      ],
      goals: [
        "تلخيص محاضرة أو ورقة علمية أجنبية للعربية",
        "بناء خطة بحث علمي أو مقترح مشروع تخرج",
        "دراسة حالة واقعية وأسئلة تحليلية للمناقشة",
        "صياغة استبيان بحثي وأسئلة مقابلات ميدانية",
        "مصحّح كود تربوي يشرح الخطأ ويعطي تلميحًا",
        "لجنة تحكيم لمحاكاة مناقشة مشروع التخرج",
        "تدقيق لغوي أكاديمي بجدول (الأصل | التعديل | السبب)",
        "قاموس مصطلحات التخصص ثنائي اللغة"
      ],
      strategies: [
        "التحليل النقدي والتوثيق الأكاديمي (APA)",
        "التبسيط التدريجي (من المفهوم إلى التطبيق)",
        "المناقشة السقراطية والاستجواب العلمي",
        "الكتابة الأكاديمية الرصينة"
      ],
      durations: [
        "ملخص سريع (صفحة واحدة)",
        "تقرير أكاديمي متوسط",
        "خطة بحث شاملة",
        "جلسة محاكاة مناقشة (15 سؤالًا)"
      ],
      topics: ["مقترح مشروع تخرج بالذكاء الاصطناعي", "تلخيص ورقة بحثية", "تحليل بيانات استبيان", "مناقشة مشروع تخرج"]
    },
    career: {
      id: "career",
      label: "المهنة والـ CV والعمل الحر",
      icon: "💼",
      grades: [
        "خريج جديد (0 - 1 سنة خبرة)",
        "متوسط الخبرة (2 - 5 سنوات)",
        "خبير / قيادي (+5 سنوات)",
        "مستقل (Freelancer) / رائد أعمال",
        "متقدم لمنحة دراسية دولية"
      ],
      subjects: [
        "التعليم والتدريب وتكنولوجيا التعليم",
        "البرمجة وتطوير الويب والتطبيقات",
        "الهندسة بجميع فروعها",
        "إدارة الأعمال والتسويق الرقمي",
        "التصميم الجرافيكي والمونتاج",
        "العمل الحر والمنظمات والمبادرات",
        "المنح الدراسية والدراسات العليا"
      ],
      goals: [
        "سيرة ذاتية احترافية متوافقة مع ATS (عربي + English)",
        "خطاب تغطية (Cover Letter) مخصص لوظيفة",
        "خطاب الدافع لمنحة دراسية (Motivation Letter)",
        "محاكاة مقابلة عمل مع تقييم فوري للإجابات",
        "صياغة عرض مشروع احترافي لمنصات العمل الحر (Proposal)",
        "خارطة تعلّم مهارة جديدة في 30 يومًا",
        "بناء خطة مشروع صغير (Lean Canvas)",
        "تحسين ملف LinkedIn والنبذة الشخصية"
      ],
      strategies: [
        "إبراز الإنجازات بالأرقام والنتائج (STAR Method)",
        "التوافق مع أنظمة الفرز الآلي (ATS)",
        "الإقناع المهني المختصر والمباشر",
        "التوجيه المهني العملي خطوة بخطوة"
      ],
      durations: [
        "صياغة مختصرة (صفحة واحدة)",
        "حزمة تقديم كاملة (CV + خطاب)",
        "جلسة مقابلة (10 أسئلة متدرجة)",
        "خطة تطوير لمدة 30 يومًا"
      ],
      topics: ["سيرة ذاتية لمعلم تكنولوجيا", "خطاب دافع لمنحة ماجستير", "عرض مشروع تطوير موقع", "تحضير لمقابلة عمل"]
    },
    training: {
      id: "training",
      label: "التدريب وصناعة المحتوى",
      icon: "🎙️",
      grades: [
        "ورشة تدريبية للمعلمين",
        "ورشة للشباب والطلبة",
        "محتوى يوتيوب / ريلز تعليمي",
        "مبادرة مجتمعية أو جمعية أهلية",
        "إدارة مدرسية وإشراف تربوي"
      ],
      subjects: [
        "تكنولوجيا التعليم والذكاء الاصطناعي",
        "المهارات الحياتية والقيادة",
        "التطوير المهني للمعلمين",
        "المبادرات المجتمعية وكتابة المشاريع",
        "التربية القيمية والأنشطة اللاصفية",
        "التسويق والمحتوى التعليمي"
      ],
      goals: [
        "تصميم حقيبة تدريبية وورشة عمل تفاعلية",
        "سيناريو فيديو تعليمي مشوّق (يوتيوب / ريلز)",
        "حوار بودكاست تعليمي بين شخصيتين",
        "هيكل عرض تقديمي احترافي (جاهز لـ PowerPoint / Gamma)",
        "محتوى بوستر أو مطوية جاهز للتصميم في Canva",
        "ورقة مفهوم ومقترح مشروع مجتمعي (Concept Note)",
        "ملف إنجاز معلم أو طلب ترشح لجائزة تميّز"
      ],
      strategies: [
        "التدريب التشاركي والأنشطة العملية",
        "السرد القصصي الجاذب (Storytelling)",
        "التعلّم البصري والإنفوجرافيك",
        "التخطيط الاستراتيجي وقياس الأثر"
      ],
      durations: [
        "فيديو قصير (60 - 90 ثانية)",
        "ورشة تدريبية (ساعتان)",
        "دورة تدريبية (5 لقاءات)",
        "حملة محتوى أسبوعية"
      ],
      topics: ["ورشة توظيف الذكاء الاصطناعي في التعليم", "سيناريو ريلز تعليمي", "مقترح مبادرة تعليمية", "حقيبة تدريبية للمعلمين"]
    },
    parents: {
      id: "parents",
      label: "أولياء الأمور والمنزل",
      icon: "🏡",
      grades: [
        "طفل في الروضة (4 - 6 سنوات)",
        "طالب ابتدائي (7 - 10 سنوات)",
        "طالب إعدادي (11 - 14 سنة)",
        "طالب ثانوي / توجيهي"
      ],
      subjects: [
        "القراءة والكتابة واللغة العربية",
        "الرياضيات وجدول الضرب",
        "العلوم والتجارب المنزلية",
        "اللغة الإنجليزية والمحادثة",
        "التربية القيمية وتنظيم الوقت",
        "الدعم النفسي وتخفيف قلق الامتحانات"
      ],
      goals: [
        "شرح درس صعب لابني في البيت بأسلوب هادئ وبدون توتر",
        "خطة مذاكرة أسبوعية متوازنة مع وقت للعب",
        "لعبة تعليمية منزلية بدون شاشات",
        "قصة قبل النوم ترسّخ قيمة تربوية أو معلومة",
        "أنشطة تفريغ نفسي وبناء مرونة للطفل",
        "رسالة لبقة للتواصل مع معلم المدرسة"
      ],
      strategies: [
        "التعلّم باللعب والحوار الدافئ",
        "التشجيع الإيجابي وبناء الثقة",
        "الربط بحياة الطفل اليومية",
        "التبسيط البصري والقصصي"
      ],
      durations: [
        "نشاط منزلي (15 دقيقة)",
        "جلسة مذاكرة يومية (30 دقيقة)",
        "خطة أسبوعية كاملة"
      ],
      topics: ["حفظ جدول الضرب باللعب", "تحبيب الطفل في القراءة", "تخفيف توتر الامتحانات", "تنظيم وقت المذاكرة"]
    }
  };

  var MODELS = [
    { val: "ChatGPT (GPT-4o / o3)", hint: "استخدم جداول واضحة، عناوين مرقّمة، ونقاطًا تنفيذية مباشرة." },
    { val: "Claude Sonnet / Opus (Anthropic)", hint: "نظّم المخرجات بهيكل واضح واستخدم تفكيرًا تربويًا متسلسلًا ولغة عربية رصينة." },
    { val: "Google Gemini", hint: "قدّم الإجابة بتنسيق غني قابل للنسخ إلى مستندات Google مع أمثلة عملية." },
    { val: "DeepSeek (تفكير عميق)", hint: "اعرض خطوات التفكير والحل بوضوح متدرّج مع التحقق من دقة كل خطوة." },
    { val: "Perplexity (بحث موثّق)", hint: "ادعم المعلومات العلمية بمصادر موثوقة وروابط مرجعية قابلة للتحقق." },
    { val: "Microsoft Copilot", hint: "صِغ المخرجات بصيغة جاهزة للنسخ مباشرة إلى Word أو PowerPoint." }
  ];

  var CHIPS = [
    { id: "local", label: "🇵🇸 توطين الأمثلة المحلية", rule: "استخدم أسماءً وعملات ومواقف من البيئة العربية والفلسطينية المألوفة، وتجنّب الأمثلة الأجنبية المكررة." },
    { id: "offline", label: "📵 بلا إنترنت / إمكانيات بسيطة", rule: "اجعل جميع الأنشطة قابلة للتنفيذ بالورقة والقلم والسبورة وأدوات بسيطة متوفرة دون اشتراط أجهزة أو إنترنت." },
    { id: "mobile", label: "📱 مناسب لشاشة الهاتف", rule: "صمّم المحتوى والأنشطة لتُقرأ وتُطبّق بسهولة على شاشة هاتف صغير وبأقل استهلاك لبيانات الإنترنت." },
    { id: "tashkeel", label: "✍️ التشكيل الآلي", rule: "اضبط النصوص والأسئلة بالشكل (الحركات) بدقة مع استخدام جمل قصيرة وواضحة تناسب عمر الطلبة." },
    { id: "nohallu", label: "🛡️ درع الدقة العلمية", rule: "التزم بالدقة العلمية التامة، لا تخترع مراجع أو معلومات غير مؤكدة، ونبّه بوضوح إلى أي نقطة تحتاج مراجعة المعلم أو المنهاج الرسمي." },
    { id: "planb", label: "🔄 خطة بديلة (Plan B)", rule: "أضف في النهاية فقرة موجزة بعنوان «الخطة البديلة (Plan B)» في حال انقطعت الكهرباء أو الإنترنت أو انتهى الدرس مبكرًا." },
    { id: "rubric", label: "📊 معيار تقييم (Rubric)", rule: "أرفق جدول معايير تقييم (Rubric) واضح من 3 مستويات (ممتاز، جيد، يحتاج دعمًا) لقياس أداء الطلبة." },
    { id: "kahoot", label: "🎮 جاهز لـ Kahoot / Quizizz", rule: "صِغ الأسئلة في جدول منسّق بالأعمدة (السؤال | الخيار 1 | الخيار 2 | الخيار 3 | الخيار 4 | رقم الإجابة الصحيحة) لسهولة الاستيراد في Kahoot وQuizizz." }
  ];

  var RECIPES = [
    { label: "⚡ اختبار قصير سريع", track: "school", goalIdx: 1, chips: ["local", "nohallu"], topic: "اختبار قصير متدرج في " },
    { label: "📱 درس واتساب خفيف", track: "remote", gradeIdx: 1, goalIdx: 1, chips: ["mobile", "local"], topic: "شرح مبسّط لدرس " },
    { label: "🆘 منقذ حصة الاحتياط", track: "school", goalIdx: 5, chips: ["offline", "local"], topic: "نشاط صفي ممتع بلا تجهيز" },
    { label: "📄 سيرة ذاتية ATS", track: "career", goalIdx: 0, chips: ["nohallu"], topic: "سيرة ذاتية احترافية في تخصص " },
    { label: "🏆 أسئلة وزارية توجيهي", track: "tawjihi", goalIdx: 0, chips: ["nohallu", "rubric"], topic: "أسئلة متوقعة في وحدة " },
    { label: "🏡 شرح درس بالمنزل", track: "parents", goalIdx: 0, chips: ["local", "offline"], topic: "تبسيط واجب " }
  ];

  var state = {
    track: "school",
    proMode: true,
    chips: {},
    outputLang: "العربية الفصحى المبسّطة",
    outputFmt: "منظّم بعناوين وجداول جاهزة للتطبيق"
  };

  try {
    var savedMode = localStorage.getItem(MODE_KEY);
    if (savedMode === "simple") state.proMode = false;
  } catch (e) {}

  function $(id) { return document.getElementById(id); }

  function fillSelect(sel, items, selectedIdx) {
    if (!sel || !Array.isArray(items)) return;
    sel.innerHTML = "";
    items.forEach(function (it, i) {
      var opt = document.createElement("option");
      var v = typeof it === "string" ? it : it.val;
      opt.value = v;
      opt.textContent = v;
      if (i === (selectedIdx || 0)) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  function injectStyles() {
    if ($("eduPromptV1Styles")) return;
    var st = document.createElement("style");
    st.id = "eduPromptV1Styles";
    st.textContent =
      "#generator select, #generator input[type='text'], #generator textarea { padding-left: 2.2rem !important; text-overflow: ellipsis; }\n" +
      ".edu-v1-bar { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px; align-items:center; }\n" +
      ".edu-v1-tab { padding:8px 14px; border-radius:12px; font-size:12.5px; font-weight:800; cursor:pointer; border:1px solid rgba(148,163,184,0.28); background:rgba(15,23,42,0.55); color:#e2e8f0; transition:all .18s ease; display:inline-flex; align-items:center; gap:6px; }\n" +
      ".edu-v1-tab:hover { border-color:#38bdf8; transform:translateY(-1px); }\n" +
      ".edu-v1-tab.active { background:linear-gradient(135deg,#e11d48,#0284c7); color:#fff; border-color:transparent; box-shadow:0 4px 14px rgba(225,29,72,0.35); }\n" +
      ".edu-v1-chip { padding:6px 11px; border-radius:999px; font-size:11.5px; font-weight:700; cursor:pointer; border:1px solid rgba(148,163,184,0.3); background:rgba(30,41,59,0.55); color:#cbd5e1; transition:all .15s ease; }\n" +
      ".edu-v1-chip.active { background:rgba(16,185,129,0.22); border-color:#10b981; color:#a7f3d0; }\n" +
      ".edu-v1-recipe { padding:6px 11px; border-radius:10px; font-size:11.5px; font-weight:800; cursor:pointer; border:1px dashed rgba(56,189,248,0.45); background:rgba(14,165,233,0.1); color:#7dd3fc; transition:all .15s ease; }\n" +
      ".edu-v1-recipe:hover { background:rgba(14,165,233,0.22); color:#fff; }\n" +
      ".edu-v1-simple-hide { display:none !important; }\n" +
      "@media print { body * { visibility:hidden !important; } #promptOutputWrapper, #promptOutputWrapper * { visibility:visible !important; } #promptOutputWrapper { position:fixed !important; inset:0 !important; background:#fff !important; color:#000 !important; padding:24px !important; z-index:999999 !important; } #promptOutputText { background:#fff !important; color:#000 !important; border:1px solid #cbd5e1 !important; white-space:pre-wrap !important; font-size:13pt !important; } }";
    document.head.appendChild(st);
  }

  function applyTrack(trackId, opts) {
    var t = TRACKS[trackId] || TRACKS.school;
    state.track = t.id;
    opts = opts || {};

    fillSelect($("genGrade"), t.grades, opts.gradeIdx || 0);
    fillSelect($("genSubject"), t.subjects, opts.subjectIdx || 0);
    fillSelect($("genGoal"), t.goals, opts.goalIdx || 0);
    fillSelect($("genStrategy"), t.strategies, opts.strategyIdx || 0);
    fillSelect($("genDuration"), t.durations, opts.durationIdx || 0);

    // Update active tab styling
    document.querySelectorAll(".edu-v1-tab").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-track") === t.id);
    });

    // Update quick topic chips
    var qWrap = $("eduV1QuickTopics");
    if (qWrap) {
      qWrap.innerHTML = '<span class="text-xs text-slate-400 font-bold">موضوعات سريعة للمسار:</span>';
      t.topics.forEach(function (tp) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition";
        btn.textContent = tp;
        btn.onclick = function () {
          var inp = $("genTopic");
          if (inp) inp.value = tp;
          buildEnhancedPrompt(true);
        };
        qWrap.appendChild(btn);
      });
    }
  }

  function applyModeUI() {
    var proRows = document.querySelectorAll(".edu-v1-pro-only");
    proRows.forEach(function (el) {
      el.classList.toggle("edu-v1-simple-hide", !state.proMode);
    });
    var btn = $("eduV1ModeToggle");
    if (btn) {
      btn.textContent = state.proMode ? "⚙️ الوضع الاحترافي (كل الخيارات)" : "⚡ الوضع السريع (3 حقول فقط)";
    }
    try { localStorage.setItem(MODE_KEY, state.proMode ? "pro" : "simple"); } catch (e) {}
  }

  function saveHistory(promptText, meta) {
    try {
      var arr = JSON.parse(localStorage.getItem(HIST_KEY) || "[]");
      if (!Array.isArray(arr)) arr = [];
      arr.unshift({
        time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        track: meta.trackLabel,
        topic: meta.topic,
        text: promptText
      });
      localStorage.setItem(HIST_KEY, JSON.stringify(arr.slice(0, 10)));
      renderHistory();
    } catch (e) {}
  }

  function renderHistory() {
    var box = $("eduV1HistoryBox");
    if (!box) return;
    var arr = [];
    try { arr = JSON.parse(localStorage.getItem(HIST_KEY) || "[]"); } catch (e) {}
    if (!arr.length) {
      box.innerHTML = '<span class="text-xs text-slate-400">سيتم حفظ آخر 10 برومبتات تلقائيًا هنا حتى بدون تسجيل دخول.</span>';
      return;
    }
    box.innerHTML = "";
    arr.slice(0, 5).forEach(function (item) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 max-w-xs truncate";
      b.title = item.topic;
      b.textContent = "🕒 " + item.time + " • " + item.topic;
      b.onclick = function () {
        var out = $("promptOutputText");
        var wrap = $("promptOutputWrapper");
        if (out) out.textContent = item.text;
        if (wrap) wrap.classList.remove("hidden");
        if (typeof global.showToast === "function") global.showToast("تم استرجاع البرومبت من السجل 🕒", "info");
      };
      box.appendChild(b);
    });
  }

  function buildEnhancedPrompt(showNotification) {
    var t = TRACKS[state.track] || TRACKS.school;
    var grade = ($("genGrade") && $("genGrade").value) || "";
    var subject = ($("genSubject") && $("genSubject").value) || "";
    var goal = ($("genGoal") && $("genGoal").value) || "";
    var aiModel = ($("genAIModel") && $("genAIModel").value) || "ChatGPT (GPT-4o / o3)";
    var strategy = ($("genStrategy") && $("genStrategy").value) || "";
    var duration = ($("genDuration") && $("genDuration").value) || "";
    var ctxNote = ($("genContextNote") && $("genContextNote").value.trim()) || "";
    var topic = ($("genTopic") && $("genTopic").value.trim()) || t.topics[0];
    var pastedRef = ($("eduV1RefText") && $("eduV1RefText").value.trim()) || "";
    var outLang = ($("eduV1OutLang") && $("eduV1OutLang").value) || state.outputLang;
    var outFmt = ($("eduV1OutFmt") && $("eduV1OutFmt").value) || state.outputFmt;

    var modelObj = MODELS.find(function (m) { return m.val === aiModel; }) || MODELS[0];
    var activeRules = CHIPS.filter(function (c) { return !!state.chips[c.id]; }).map(function (c) { return "- " + c.rule; });

    var teacherName = "الأستاذ باسل أشرف الفقعاوي (فلسطين)";
    try {
      if (typeof global.getCurrentUser === "function") {
        var u = global.getCurrentUser();
        if (u && u.displayName) teacherName = u.displayName;
      }
    } catch (e) {}

    var lines = [];
    lines.push('أنت خبير تربوي ومستشار متقدم في تكنولوجيا التعليم والذكاء الاصطناعي في مبادرة "EduTech Mindset".');
    lines.push("مهمتك: إعداد منتج احترافي وعالي الجودة ومباشر للتطبيق بعنوان: «" + goal + "» وفق المعطيات التالية:");
    lines.push("");
    lines.push("📌 السياق والمعطيات الأساسية:");
    lines.push("- المسار التخصصي: " + t.label);
    lines.push("- مُعدّ الطلب: " + teacherName);
    if (grade) lines.push("- الفئة / المرحلة / البيئة: " + grade);
    if (subject) lines.push("- المادة أو التخصص: " + subject);
    lines.push("- الموضوع أو الفكرة الرئيسية: \"" + topic + "\"");
    if (state.proMode && strategy) lines.push("- المنهجية أو الأسلوب المعتمد: " + strategy);
    if (state.proMode && duration) lines.push("- الزمن أو النطاق المخصص: " + duration);
    if (ctxNote) lines.push("- ملاحظات البيئة ومستوى المستفيدين: " + ctxNote);
    lines.push("- لغة الإخراج المطلوبة: " + outLang);
    lines.push("- صيغة العرض والتنظيم: " + outFmt);
    lines.push("- النموذج المستهدف: " + aiModel + " (" + modelObj.hint + ")");

    if (pastedRef) {
      lines.push("");
      lines.push("📄 النص المرجعي / أهداف الدرس المرفقة (اعتمد عليها بدقة):");
      lines.push(pastedRef);
    }

    if (activeRules.length) {
      lines.push("");
      lines.push("✅ شروط ومعايير جودة إضافية مُلزمة:");
      activeRules.forEach(function (r) { lines.push(r); });
    }

    lines.push("");
    lines.push("🎯 المطلوب في النتيجة النهائية:");
    lines.push("1. ابدأ مباشرة بالمحتوى العملي الجاهز للتطبيق دون مقدمات إنشائية طويلة.");
    lines.push("2. قسّم الإجابة إلى خطوات أو جداول واضحة ومرتّبة مع أمثلة تطبيقية واقعية.");
    lines.push("3. اختم بـ 3 نصائح عملية سريعة لرفع التفاعل أو تحسين النتيجة عند التطبيق.");

    var fullPrompt = lines.join("\n");
    var out = $("promptOutputText");
    var wrap = $("promptOutputWrapper");
    var countEl = $("promptCharCount");
    if (out) out.textContent = fullPrompt;
    if (wrap) wrap.classList.remove("hidden");
    if (countEl) {
      var words = fullPrompt.trim().split(/\s+/).length;
      countEl.textContent = words + " كلمة • " + fullPrompt.length + " حرف";
    }
    saveHistory(fullPrompt, { trackLabel: t.label, topic: topic });
    if (showNotification && typeof global.showToast === "function") {
      global.showToast("تمت صياغة البرومبت الذكي بنجاح ⚡ (الإصدار v1.0)", "success");
    }
    return fullPrompt;
  }

  function enhanceGenerator() {
    var sec = $("generator");
    var btnGen = $("btnGeneratePrompt");
    if (!sec || !btnGen || sec.getAttribute("data-v1-enhanced") === "1") return;
    sec.setAttribute("data-v1-enhanced", "1");
    injectStyles();

    // Update AI models select
    fillSelect($("genAIModel"), MODELS, 0);

    // Find the main form card inside #generator
    var gradeEl = $("genGrade");
    var formContainer = gradeEl ? gradeEl.closest(".grid") : null;
    if (!formContainer || !formContainer.parentNode) return;

    // 1. Insert Smart Tracks + Mode Toggle + One-Click Recipes right above the first grid
    var topPanel = document.createElement("div");
    topPanel.className = "mb-5 pb-4 border-b border-slate-700/60";
    topPanel.innerHTML =
      '<div class="flex flex-wrap items-center justify-between gap-2 mb-3">' +
        '<div class="text-xs font-extrabold text-amber-300">🧭 اختر المسار الذكي (تتغيّر القوائم تلقائيًا حسب مجالك):</div>' +
        '<button type="button" id="eduV1ModeToggle" class="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/40 transition"></button>' +
      '</div>' +
      '<div id="eduV1TracksBar" class="edu-v1-bar"></div>' +
      '<div class="flex flex-wrap items-center gap-2 mt-2">' +
        '<span class="text-xs font-bold text-slate-400">⚡ وصفات بنقرة واحدة:</span>' +
        '<div id="eduV1RecipesBar" class="flex flex-wrap gap-2"></div>' +
      '</div>';
    formContainer.parentNode.insertBefore(topPanel, formContainer);

    var tracksBar = $("eduV1TracksBar");
    Object.keys(TRACKS).forEach(function (k) {
      var tr = TRACKS[k];
      var b = document.createElement("button");
      b.type = "button";
      b.className = "edu-v1-tab" + (k === state.track ? " active" : "");
      b.setAttribute("data-track", k);
      b.textContent = tr.icon + " " + tr.label;
      b.onclick = function () { applyTrack(k); };
      tracksBar.appendChild(b);
    });

    var recBar = $("eduV1RecipesBar");
    RECIPES.forEach(function (rec) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "edu-v1-recipe";
      b.textContent = rec.label;
      b.onclick = function () {
        applyTrack(rec.track, { gradeIdx: rec.gradeIdx || 0, goalIdx: rec.goalIdx || 0 });
        state.chips = {};
        (rec.chips || []).forEach(function (c) { state.chips[c] = true; });
        document.querySelectorAll(".edu-v1-chip").forEach(function (el) {
          el.classList.toggle("active", !!state.chips[el.getAttribute("data-chip")]);
        });
        var tp = $("genTopic");
        if (tp && !tp.value.trim()) tp.value = rec.topic;
        buildEnhancedPrompt(true);
      };
      recBar.appendChild(b);
    });

    $("eduV1ModeToggle").onclick = function () {
      state.proMode = !state.proMode;
      applyModeUI();
    };

    // Mark second row (strategy/duration/context) as pro-only so Simple mode stays super clean
    var stratEl = $("genStrategy");
    if (stratEl) {
      var row2 = stratEl.closest(".grid");
      if (row2 && row2 !== formContainer) row2.classList.add("edu-v1-pro-only");
    }

    // 2. Insert Lego Chips + Language/Format + Optional Reference Paste Box before the Generate button row
    var topicEl = $("genTopic");
    var topicBlock = topicEl ? topicEl.closest("div.mt-4, div.pt-4, div.mb-4") || topicEl.parentNode : null;
    var extraBox = document.createElement("div");
    extraBox.className = "edu-v1-pro-only mt-4 pt-4 border-t border-slate-700/50 space-y-3";
    extraBox.innerHTML =
      '<div>' +
        '<div class="text-xs font-extrabold text-emerald-300 mb-2">🧩 مكعبات الإضافات الذكية (اضغط لتفعيل الشرط داخل البرومبت):</div>' +
        '<div id="eduV1ChipsBar" class="flex flex-wrap gap-2"></div>' +
      '</div>' +
      '<div class="grid grid-cols-1 md:grid-cols-3 gap-3">' +
        '<div>' +
          '<label class="block text-xs font-bold text-slate-300 mb-1">🌐 لغة المخرج</label>' +
          '<select id="eduV1OutLang" class="w-full rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 text-xs font-bold px-3 py-2.5">' +
            '<option value="العربية الفصحى المبسّطة">العربية الفصحى المبسّطة</option>' +
            '<option value="ثنائي اللغة (عربي + مصطلحات English)">ثنائي اللغة (عربي + English)</option>' +
            '<option value="الإنجليزية الاحترافية (English)">الإنجليزية الاحترافية (English)</option>' +
          '</select>' +
        '</div>' +
        '<div>' +
          '<label class="block text-xs font-bold text-slate-300 mb-1">📐 صيغة الإخراج</label>' +
          '<select id="eduV1OutFmt" class="w-full rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 text-xs font-bold px-3 py-2.5">' +
            '<option value="منظّم بعناوين وجداول جاهزة للتطبيق">عناوين وجداول جاهزة للتطبيق</option>' +
            '<option value="نقاط مختصرة وسريعة للقراءة من الهاتف">نقاط مختصرة للهاتف</option>' +
            '<option value="شرائح عرض تقديمي (عنوان + نقاط + ملاحظات)">هيكل شرائح عرض تقديمي</option>' +
            '<option value="سيناريو حواري تفاعلي أو رسائل واتساب">سيناريو حواري / رسائل واتساب</option>' +
          '</select>' +
        '</div>' +
        '<div>' +
          '<label class="block text-xs font-bold text-slate-300 mb-1">📄 لصق نص الدرس أو الأهداف (اختياري)</label>' +
          '<input id="eduV1RefText" type="text" placeholder="الصق فقرة من الكتاب أو وصف وظيفة لدقة أعلى..." class="w-full rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 text-xs px-3 py-2.5">' +
        '</div>' +
      '</div>';

    if (topicBlock && topicBlock.parentNode) {
      topicBlock.parentNode.insertBefore(extraBox, topicBlock);
      // Dynamic Quick Topics container right under topicBlock
      var qt = document.createElement("div");
      qt.id = "eduV1QuickTopics";
      qt.className = "flex flex-wrap items-center gap-2 mt-3";
      topicBlock.parentNode.insertBefore(qt, topicBlock.nextSibling);
    }

    var chipsBar = $("eduV1ChipsBar");
    CHIPS.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "edu-v1-chip";
      b.setAttribute("data-chip", c.id);
      b.textContent = c.label;
      b.onclick = function () {
        state.chips[c.id] = !state.chips[c.id];
        b.classList.toggle("active", !!state.chips[c.id]);
      };
      chipsBar.appendChild(b);
    });

    // 3. Add Smart Action Buttons (Publish to Virtual Classroom + Clean Print + Share Settings) + Local History
    var copyBtn = $("btnCopyPrompt");
    if (copyBtn && copyBtn.parentNode) {
      var extraActions = [
        {
          id: "eduV1SendClassBtn",
          cls: "px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold transition flex items-center gap-1.5",
          text: "🏫 نشر في فصلي الافتراضي",
          act: function () {
            var txt = ($("promptOutputText") && $("promptOutputText").textContent) || buildEnhancedPrompt(false);
            var tp = ($("genTopic") && $("genTopic").value.trim()) || "نشاط تعليمي ذكي";
            if (global.EduClassrooms && typeof global.EduClassrooms.assignPrompt === "function") {
              global.EduClassrooms.assignPrompt(tp, txt);
            } else if (global.EduClassrooms && typeof global.EduClassrooms.open === "function") {
              global.EduClassrooms.open("teacher");
            } else if (typeof global.showToast === "function") {
              global.showToast("جارٍ فتح الفصول الافتراضية...", "info");
            }
          }
        },
        {
          id: "eduV1PrintBtn",
          cls: "px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-extrabold transition flex items-center gap-1.5",
          text: "🖨️ طباعة نظيفة",
          act: function () { global.print(); }
        },
        {
          id: "eduV1LessonPackBtn",
          cls: "px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold transition flex items-center gap-1.5",
          text: "📦 الحزمة الكاملة للدرس (4 في 1)",
          act: function () {
            var baseP = buildEnhancedPrompt(false);
            var packSuffix = "\n\n📦 وضع الحزمة الكاملة للدرس (أنتج 4 مخرجات مترابطة في رد واحد منظم):\n" +
              "1) خطة درس تفاعلية كاملة وفق منهجية 5E مقسّمة بالدقائق.\n" +
              "2) هيكل شرائح العرض التقديمي (6 شرائح: العنوان + النقاط + اقتراح بصري).\n" +
              "3) ورقة عمل متمايزة لـ 3 مستويات (أساسي، متوسط، إثرائي للموهوبين).\n" +
              "4) اختبار قصير من 5 أسئلة متدرجة (هرم بلوم) مع نموذج الإجابة المعتمد.";
            var out = $("promptOutputText");
            if (out) out.textContent = baseP + packSuffix;
            if (typeof global.showToast === "function") global.showToast("تم توليد برومبت الحزمة الكاملة للدرس (4 في 1) 📦", "success");
          }
        },
        {
          id: "eduV1QrBtn",
          cls: "px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-extrabold transition flex items-center gap-1.5",
          text: "📱 رمز QR للطباعة",
          act: function () {
            var tp = encodeURIComponent(($("genTopic") && $("genTopic").value.trim()) || "");
            var url = location.origin + location.pathname + "?track=" + encodeURIComponent(state.track) + (tp ? "&ptopic=" + tp : "") + "#generator";
            var qrSrc = "https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=" + encodeURIComponent(url);
            var old = document.getElementById("eduV1QrModal");
            if (old) old.remove();
            var m = document.createElement("div");
            m.id = "eduV1QrModal";
            m.style.cssText = "position:fixed;inset:0;z-index:2147483300;background:rgba(2,6,23,0.82);display:flex;align-items:center;justify-content:center;padding:16px;direction:rtl;";
            m.innerHTML = '<div style="background:#0f172a;color:#fff;border:1px solid rgba(56,189,248,0.45);border-radius:22px;padding:20px;max-width:340px;width:100%;text-align:center;">' +
              '<div style="font-weight:900;font-size:15px;margin-bottom:8px;color:#38bdf8;">📱 رمز QR لمشاركة وطباعة البرومبت</div>' +
              '<p style="font-size:11.5px;color:#cbd5e1;margin-bottom:14px;">ضعه على ورقة العمل ليفتحه الطلبة أو المعلمون مباشرة من الهاتف</p>' +
              '<img src="' + qrSrc + '" alt="QR Code" style="width:220px;height:220px;margin:0 auto 14px;border-radius:12px;background:#fff;padding:8px;">' +
              '<div style="display:flex;gap:8px;justify-content:center;">' +
                '<a href="' + qrSrc + '" target="_blank" rel="noopener" style="padding:8px 14px;border-radius:10px;background:#0ea5e9;color:#fff;font-size:12px;font-weight:800;text-decoration:none;">⬇️ حفظ الصورة</a>' +
                '<button type="button" id="eduV1QrClose" style="padding:8px 14px;border-radius:10px;background:#334155;color:#fff;font-size:12px;font-weight:800;border:none;cursor:pointer;">إغلاق</button>' +
              '</div></div>';
            document.body.appendChild(m);
            document.getElementById("eduV1QrClose").onclick = function () { m.remove(); };
            m.onclick = function (ev) { if (ev.target === m) m.remove(); };
          }
        },
        {
          id: "eduV1ShareUrlBtn",
          cls: "px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold transition flex items-center gap-1.5",
          text: "🔗 مشاركة الإعدادات",
          act: function () {
            var tp = encodeURIComponent(($("genTopic") && $("genTopic").value.trim()) || "");
            var url = location.origin + location.pathname + "?track=" + encodeURIComponent(state.track) + (tp ? "&ptopic=" + tp : "") + "#generator";
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(url).then(function () {
                if (typeof global.showToast === "function") global.showToast("تم نسخ رابط الإعدادات للمشاركة 🔗", "success");
              });
            }
          }
        }
      ];
      extraActions.forEach(function (cfg) {
        if ($(cfg.id)) return;
        var b = document.createElement("button");
        b.type = "button";
        b.id = cfg.id;
        b.className = cfg.cls;
        b.textContent = cfg.text;
        b.onclick = cfg.act;
        copyBtn.parentNode.appendChild(b);
      });
    }

    var outWrap = $("promptOutputWrapper");
    if (outWrap && outWrap.parentNode) {
      var histWrap = document.createElement("div");
      histWrap.className = "mt-4 pt-3 border-t border-slate-700/50";
      histWrap.innerHTML =
        '<div class="text-xs font-bold text-slate-400 mb-2">🕒 آخر البرومبتات المحفوظة تلقائيًا على جهازك:</div>' +
        '<div id="eduV1HistoryBox" class="flex flex-wrap gap-2"></div>';
      outWrap.parentNode.insertBefore(histWrap, outWrap.nextSibling);
    }

    // Override click handler cleanly on btnGeneratePrompt (capture phase so our enhanced builder runs cleanly)
    var newBtn = btnGen.cloneNode(true);
    btnGen.parentNode.replaceChild(newBtn, btnGen);
    newBtn.addEventListener("click", function () {
      buildEnhancedPrompt(true);
    });

    // Check URL params for shared prompt settings (?track=...&ptopic=...)
    try {
      var sp = new URLSearchParams(location.search);
      var urlTrack = sp.get("track");
      var urlTopic = sp.get("ptopic");
      if (urlTrack && TRACKS[urlTrack]) state.track = urlTrack;
      applyTrack(state.track);
      if (urlTopic && $("genTopic")) {
        $("genTopic").value = urlTopic;
        buildEnhancedPrompt(false);
      }
    } catch (e) {
      applyTrack(state.track);
    }

    applyModeUI();
    renderHistory();
  }

  global.EduPromptStudioV1 = {
    version: "1.1.0",
    applyTrack: applyTrack,
    build: buildEnhancedPrompt,
    init: enhanceGenerator
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(enhanceGenerator, 120); });
  } else {
    setTimeout(enhanceGenerator, 120);
  }
})(window);
