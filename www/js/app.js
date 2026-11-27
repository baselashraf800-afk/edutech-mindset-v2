// Default Seed Data
    const DEFAULT_DATA = {
      name: "عقلية التعليم والتكنولوجيا",
      tag: "نصنع الأمل بالعلم من غزة ✨",
      mgr: "إدارة الأستاذ باسل الفقعاوي",
      themeConfig: {
        palette: "sky",
        customPrimary: "#0284c7",
        fontFamily: "cairo",
        cardRadius: "modern",
        glassEffect: true,
        heroGlow: "vivid",
        defaultMode: "system"
      },
      about: "EduTech Mindset مشروع تعليمي وتقني رائد ينطلق من قلب غزة، فلسطين 🇵🇸 ليقدم شروحات عملية، وأفكارًا إبداعية، وتطبيقات متقدمة في الذكاء الاصطناعي للمعلمين والطلاب.\\nنؤمن أن التعليم الرقمي هو مقاومتنا الأجمل، وبوابتنا لبناء مستقبل معرفي مستدام لا تعيقه التحديات.",
      links: [
        { id: "youtube", i: "fa-brands fa-youtube", n: "يوتيوب", u: "https://www.youtube.com/@EduTechMindset", color: "text-red-500", handle: "@EduTechMindset" },
        { id: "instagram", i: "fa-brands fa-instagram", n: "انستغرام", u: "https://instagram.com/edutechmindset", color: "text-pink-500", handle: "@edutechmindset" },
        { id: "telegram", i: "fa-brands fa-telegram", n: "تيليجرام", u: "https://t.me/edutechmindset", color: "text-sky-500", handle: "قناة التيليجرام" },
        { id: "whatsapp", i: "fa-brands fa-whatsapp", n: "واتساب", u: "https://wa.me/972590000000", color: "text-emerald-500", handle: "تواصل مباشر" },
        { id: "tiktok", i: "fa-brands fa-tiktok", n: "تيك توك", u: "https://www.tiktok.com/@edutechmindset", color: "text-slate-800 dark:text-white", handle: "@edutechmindset" },
        { id: "facebook", i: "fa-brands fa-facebook", n: "فيسبوك", u: "https://facebook.com/edutechmindset", color: "text-blue-600", handle: "صفحة الفيسبوك" }
      ],
      items: [
        {
          id: "item-1",
          type: "video",
          title: "دليل المعلم الشامل: استخدام الذكاء الاصطناعي في تحضير الدروس والخطط الفصلية",
          desc: "شرح تطبيقي يوضح خطوة بخطوة كيف يصيغ المعلم أوامر ذكية للحصول على أهداف سلوكية، وأنشطة تفاعلية، واستراتيجيات تقويم تناسب الفروق الفردية في دقائق.",
          url: "https://www.youtube.com/@EduTechMindset",
          thumb: "assets/asset_2.jpeg",
          tags: ["ذكاء اصطناعي", "خطط دروس", "استراتيجيات تدريس"],
          date: "نوفمبر 2026",
          likes: 42,
          isFavorite: false
        },
        {
          id: "item-2",
          type: "prompt",
          title: "برومبت المعلم الذكي: صياغة اختبارات قصيرة متدرجة وفق هرم بلوم المعرفي",
          desc: "برومبت متقدم يتيح توليد بنك أسئلة متكامل يغطي مستويات المعرفة، الفهم، التطبيق، التحليل، والابتكار، مع سلم تصحيح دقيق ونموذج إجابة فوري.",
          url: "https://chatgpt.com",
          thumb: "",
          promptText: "أنت معلم خبير. ضع اختباراً قصيراً من 10 أسئلة متدرجة وفق مستويات هرم بلوم المعرفية (تذكر، فهم، تطبيق، تحليل، تقييم، ابتكار) حول «{topic}» لطلبة {grade} في مادة {subject}. نوّع بين اختيار من متعدد وصح/خطأ وسؤال مقالي قصير، وأرفق مفتاح الإجابة مع تحديد مستوى بلوم لكل سؤال.",
          tags: ["ذكاء اصطناعي", "تقييم", "بلوم"],
          date: "نوفمبر 2026",
          likes: 56,
          isFavorite: true
        },
        {
          id: "item-3",
          type: "image",
          title: "إنفوجرافيك: هرم دمج التقنية في التعليم (نموذج SAMR) للمعلم المعاصر",
          desc: "رسم بياني يوضح مراحل دمج التكنولوجيا الأربع: الاستبدال، الزيادة، التعديل، وإعادة التعريف، لنقل الطلاب من مرحلة الاستهلاك السلبي إلى الإبداع والإنتاج.",
          url: "assets/infographic.jpg",
          thumb: "assets/infographic.jpg",
          tags: ["إنفوجرافيك", "نماذج تعليمية", "مهارات رقمية"],
          date: "أكتوبر 2026",
          likes: 38,
          isFavorite: false
        },
        {
          id: "item-4",
          type: "tool",
          title: "قالب خطة الدرس التفاعلية القائم على التعلم الاستقصائي ومنهجية STEM",
          desc: "ملف قالب جاهز ومنسق يتضمن مراحل الاستكشاف، والشرح، والتوسع، والتقويم التكويني لتقديم حصص نوعية تعتمد على مهارات القرن الحادي والعشرين.",
          url: "https://docs.google.com",
          thumb: "",
          tags: ["خطط دروس", "STEM", "قوالب"],
          date: "أكتوبر 2026",
          likes: 64,
          isFavorite: true
        },
        {
          id: "item-5",
          type: "video",
          title: "أفضل 5 منصات مجانية لإنشاء عروض تقديمية تفاعلية بضغطة زر (Gamma, Tome, Canva)",
          desc: "مقارنة عملية لأحدث أدوات توليد الشرائح والإنفوجرافيك التعليمي بالذكاء الاصطناعي مع إمكانية إضافة أسئلة تصويت واستبيانات مباشرة أثناء الحصة.",
          url: "https://www.youtube.com/@EduTechMindset",
          thumb: "",
          tags: ["عروض تقديمية", "ذكاء اصطناعي", "أدوات رقمية"],
          date: "أكتوبر 2026",
          likes: 49,
          isFavorite: false
        },
        {
          id: "item-6",
          type: "image",
          title: "خارطة نماذج الذكاء الاصطناعي المجانية للمدارس والجامعات 2026",
          desc: "دليل مرئي يلخص ميزات ونقاط قوة كل من ChatGPT, Claude, Gemini, Copilot وما يناسب كل تخصص ومادة دراسية للمعلم والباحث.",
          url: "assets/infographic.jpg",
          thumb: "assets/infographic.jpg",
          tags: ["ذكاء اصطناعي", "إنفوجرافيك", "أدوات رقمية"],
          date: "سبتمبر 2026",
          likes: 71,
          isFavorite: true
        },
        {
          id: "item-7",
          type: "tool",
          title: "دليل الألعاب التعليمية الرقمية: تصميم مسابقات تفاعلية عبر Wordwall وKahoot",
          desc: "حزمة روابط وأفكار لأكثر من 15 لعبة صفيّة ولاصفية تشعل الحماس والدافعية لدى الطلبة وتتيح رصد درجات الطلاب وتحليل مستواهم الأكاديمي.",
          url: "https://wordwall.net",
          thumb: "",
          tags: ["ألعاب تعليمية", "تفاعل", "تقييم"],
          date: "سبتمبر 2026",
          likes: 52,
          isFavorite: false
        },
        {
          id: "item-8",
          type: "prompt",
          title: "برومبت تصميم أنشطة كسر الجليد والمحاكاة لتعزيز دافعية الطلاب",
          desc: "صيغة برومبت جاهزة لتوليد 5 أفكار أنشطة استهلالية لدروسك الصفية أو الافتراضية تكسر الروتين وتجذب انتباه المتعلمين خلال أول 3 دقائق.",
          url: "https://claude.ai",
          thumb: "",
          tags: ["ذكاء اصطناعي", "استراتيجيات تدريس", "أنشطة صفية"],
          date: "أغسطس 2026",
          likes: 35,
          isFavorite: false
        }
      ]
    };

    // Category Type Metadata
    const TYPE_META = {
      video: { label: "فيديوهات وشروحات", icon: "fa-solid fa-play", color: "bg-red-500", text: "text-red-500", chip: "🎬 فيديوهات" },
      prompt: { label: "برومبتات ذكاء اصطناعي", icon: "fa-solid fa-wand-magic-sparkles", color: "bg-amber-500", text: "text-amber-500", chip: "💡 برومبتات AI" },
      tool: { label: "أدوات وقوالب", icon: "fa-solid fa-toolbox", color: "bg-sky-500", text: "text-sky-500", chip: "📎 أدوات وقوالب" },
      image: { label: "إنفوجرافيك وتصاميم", icon: "fa-solid fa-image", color: "bg-emerald-500", text: "text-emerald-500", chip: "🖼️ إنفوجرافيك" }
    };

    // (تم حذف الحسابات التجريبية: الحسابات الآن حقيقية عبر Google)
    const PRESET_GOOGLE_USERS = {};

    // Global State
    let appState = JSON.parse(JSON.stringify(DEFAULT_DATA));
    window.__eduGetAppState = () => appState;
    window.__eduSaveSocialLinks = (nextLinks) => {
      if (Array.isArray(nextLinks)) appState.links = nextLinks;
      try { saveState(); } catch (e) {}
      try { renderSocial(); } catch (e) {}
      if (window.Cloud && window.Cloud.enabled && typeof window.Cloud.saveConfig === "function") {
        window.Cloud.saveConfig({ name: appState.name, tag: appState.tag, mgr: appState.mgr, about: appState.about, links: appState.links }).catch(() => {});
      }
    };
    window.__eduSaveSiteTexts = (patch) => {
      if (patch && typeof patch === "object") Object.assign(appState, patch);
      try { saveState(); } catch (e) {}
      try { renderStaticTexts(); } catch (e) {}
      if (window.Cloud && window.Cloud.enabled && typeof window.Cloud.saveConfig === "function") {
        window.Cloud.saveConfig({ name: appState.name, tag: appState.tag, mgr: appState.mgr, about: appState.about, links: appState.links }).catch(() => {});
      }
    };
    let usersDb = JSON.parse(JSON.stringify(PRESET_GOOGLE_USERS));
    let currentUserEmail = null;
    let isAdminMode = false;
    let activeCategory = "all";
    let activeTag = "all";
    let isFavFilterOnly = false;
    let isCompletedFilterOnly = false;
    let isHasNotesFilterOnly = false;
    let searchQuery = "";
    let sortMode = "newest";
    let activeWorkspaceTab = "overview";

    // ===== إعدادات الإدارة والربط السحابي =====
    const ADMIN_PIN_HASH = "b028e7b30ae6629575651e0369e15c482a1b97a7d437334f1b1cf00f5c06a78f";   // بصمة SHA-256 لرمز الإدارة (لم يعد الرمز نفسه ظاهراً في الكود)
    const ADMIN_FALLBACK_EMAIL = (window.EDUTECH_ADMIN_EMAILS || [])[0] || "";
    const CLOUD_ON = !!(window.Cloud && window.Cloud.enabled);
    const CONFIG_KEYS = ["name", "tag", "mgr", "about", "links", "quickLinks", "blocks", "aiConfig", "welcome", "stages", "subjects", "announcement", "auditLog", "themeConfig"];
    let contentLoading = CLOUD_ON;     // ننتظر وصول المحتوى من السحابة قبل العرض (لتجنب وميض المحتوى التجريبي)
    let cloudSeeded = false;           // هل خُزّن محتوى الموقع في السحابة سابقاً؟
    let cloudContentIndex = {};        // آخر نسخة من السحابة: id -> JSON
    let cloudConfigJson = null;
    let lastRemoteJson = "";
    let lastRemoteData = null;
    let contentDirty = false, contentVersion = 0, contentSyncTimer = null;
    let userDirty = false, userVersion = 0, userSyncTimer = null, lastUserSyncedJson = "";
    let unwatchUser = null;
    let explicitSignIn = false;
    let pendingAdminCallback = null;

    function stableJson(v) {
      if (Array.isArray(v)) return "[" + v.map(stableJson).join(",") + "]";
      if (v && typeof v === "object") {
        return "{" + Object.keys(v).sort().filter(k => v[k] !== undefined).map(k => JSON.stringify(k) + ":" + stableJson(v[k])).join(",") + "}";
      }
      return JSON.stringify(v === undefined ? null : v);
    }
    function deepCopy(o) { return JSON.parse(JSON.stringify(o)); }
    function isAdminEmail(email) {
      if (window.Cloud && window.Cloud.isAdminEmail) return window.Cloud.isAdminEmail(email);
      return false;
    }
    function getItemLikes(item) {
      const u = getCurrentUser();
      return (item.likes || 0) + ((u && (u.likedItems || []).includes(item.id)) ? 1 : 0);
    }
    function formatActTime(t) {
      try { return new Date(t).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" }); } catch (e) { return ""; }
    }
    // سجل حركات المستخدم داخل حسابه (آخر 60 حركة)
    function logActivity(text) {
      const u = getCurrentUser();
      if (!u) return;
      if (!Array.isArray(u.activity)) u.activity = [];
      u.activity.unshift({ t: Date.now(), text: String(text).slice(0, 200) });
      if (u.activity.length > 60) u.activity.length = 60;
    }


    // Get Active User Object (or null if guest)
    function getCurrentUser() {
      // 1. If a Firebase Google user is authenticated, prioritize their cloud record
      if (CLOUD_ON && window.Cloud && window.Cloud.user && currentUserEmail) {
        const key = currentUserEmail.toLowerCase().trim();
        if (usersDb[key] && !String(usersDb[key].uid || "").startsWith("local_")) {
          return usersDb[key];
        }
      }
      // 2. Otherwise synchronize with EduAccessControl (local / activation code / demo / admin user)
      if (window.EduAccessControl && typeof window.EduAccessControl.getCurrentUser === "function") {
        const lu = window.EduAccessControl.getCurrentUser();
        if (lu && lu.email) {
          const lkey = lu.email.toLowerCase().trim();
          if (!usersDb[lkey]) {
            let savedLocalWs = {};
            try { savedLocalWs = JSON.parse(localStorage.getItem("edutech_local_ws_" + lkey) || "{}") || {}; } catch (e) {}
            usersDb[lkey] = normalizeUserRecord(Object.assign({}, savedLocalWs, {
              uid: lu.uid || ("local_" + lkey),
              email: lkey,
              name: lu.name || "عضو المنصة",
              role: lu.roleLabel || "معلم / تربوي",
              grade: lu.gradeName || "الصف الرابع الأساسي",
              school: lu.school || "فلسطين 🇵🇸"
            }));
          } else {
            usersDb[lkey].name = lu.name || usersDb[lkey].name;
            usersDb[lkey].role = lu.roleLabel || usersDb[lkey].role;
            usersDb[lkey].grade = lu.gradeName || usersDb[lkey].grade;
            usersDb[lkey].school = lu.school || usersDb[lkey].school;
          }
          currentUserEmail = lkey;
          return usersDb[lkey];
        } else if (currentUserEmail) {
          const curRec = usersDb[currentUserEmail.toLowerCase().trim()];
          if (!curRec || String(curRec.uid || "").startsWith("local_")) {
            currentUserEmail = null;
          }
        }
      }
      if (currentUserEmail) {
        const key = currentUserEmail.toLowerCase().trim();
        if (usersDb[key]) return usersDb[key];
      }
      return null;
    }

    function getOrCreateActiveUser() {
      const existing = getCurrentUser();
      if (existing) return existing;
      const gKey = "local_member@edutech.ps";
      if (!usersDb[gKey]) {
        let savedLocalWs = {};
        try { savedLocalWs = JSON.parse(localStorage.getItem("edutech_local_ws_" + gKey) || "{}") || {}; } catch (e) {}
        usersDb[gKey] = normalizeUserRecord(Object.assign({}, savedLocalWs, {
          uid: "local_" + gKey,
          email: gKey,
          name: "عضو المنصة (حفظ محلي)",
          role: "معلم / طالب",
          grade: "المنهاج الفلسطيني",
          school: "فلسطين 🇵🇸"
        }));
      }
      currentUserEmail = gKey;
      return usersDb[gKey];
    }
    window.getOrCreateActiveUser = getOrCreateActiveUser;

    // Ensure User Data Integrity
    function normalizeUserRecord(u) {
      const emailLower = (u && u.email) ? u.email.toLowerCase().trim() : "user@gmail.com";
      return Object.assign({
        uid: "",
        email: emailLower,
        name: "مستخدم EduTech",
        role: "معلم / تربوي",
        subject: "تكنولوجيا التعليم والذكاء الاصطناعي",
        grade: "المتوسطة / الإعدادية (الصفوف 5 - 9)",
        school: "فلسطين 🇵🇸",
        avatarColor: "bg-brand-600",
        picture: "",
        favorites: [],
        completedItems: [],
        likedItems: [],
        userNotes: {},
        savedPrompts: [],
        userTasks: [],
        activity: [],
        createdAt: "",
        lastLoginAt: ""
      }, u || {}, { email: emailLower });
    }

    // Platform Security & Governance Defaults
    function ensurePlatformGovernanceState() {
      delete appState.adminPin;   // الرمز لم يعد يُخزَّن في بيانات الموقع العامة
      if (!appState.announcement) {
        appState.announcement = {
          enabled: true,
          badge: "📢 تعميم الإدارة",
          text: "انطلاق الحقيبة التدريبية الحديثة لتوظيف الذكاء الاصطناعي في التعليم — بإشراف أ. باسل الفقعاوي",
          link: "#edtechLabSection",
          btnLabel: "استكشف المختبر"
        };
      }
      if (!Array.isArray(appState.auditLog)) {
        appState.auditLog = [
          { id: "log-1", actor: "الأستاذ باسل الفقعاوي (الإدارة العامة)", action: "تفعيل نظام الصلاحيات الصارم واعتماد الموارد الأساسية", time: "نوفمبر 2026" }
        ];
      }
      // Mark initial seed items as verified & pin item-1 and item-2 by default if not set
      (appState.items || []).forEach((it, idx) => {
        if (typeof it.isPinned !== "boolean") it.isPinned = (idx === 0);
        if (typeof it.isVerified !== "boolean") it.isVerified = true;
        if (!it.authorEmail) it.authorEmail = ADMIN_FALLBACK_EMAIL;
        if (!it.authorName) it.authorName = "الإدارة العامة (أ. باسل الفقعاوي)";
        if (!it.authorRole) it.authorRole = "super_admin";
        if (!it.rating) it.rating = 5.0;
      });
    }

    function addAuditLog(actionText) {
      ensurePlatformGovernanceState();
      const u = getCurrentUser();
      const actorName = isAdminMode
        ? (u ? `${u.name} (الإدارة العليا 👑)` : "الإدارة العليا 👑")
        : (u ? `${u.name} (${getRoleArabicLabel(getEffectiveAccessRole())})` : "زائر");
      const now = new Date();
      const timeStr = now.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) + " - نوفمبر 2026";
      appState.auditLog.unshift({
        id: "log-" + Date.now(),
        actor: actorName,
        action: actionText,
        time: timeStr
      });
      if (appState.auditLog.length > 50) appState.auditLog = appState.auditLog.slice(0, 50);
    }

    // الصلاحيات: إما "إدارة" (بعد الرمز + حساب الإدارة) أو "عضو/زائر" بلا أي تعديل على المحتوى
    let adminVisitorPreview = false;
    window.setAdminVisitorPreview = function (val) {
      adminVisitorPreview = !!val;
      updateAdminUI();
      fullRender();
      if (adminVisitorPreview) {
        showToast("👁️ وضع معاينة الزائر مفعّل — اضغط Ctrl+Shift+A أو انقر 4 مرات على اسم الإدارة أسفل الموقع للعودة", "info");
      } else {
        showToast("👑 تم استرجاع مركز تطوير وإدارة الموقع أسفل الصفحة", "success");
        const hub = document.getElementById("adminDevFooterHub");
        if (hub) setTimeout(() => hub.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
      }
    };

    function getEffectiveAccessRole() {
      if (adminVisitorPreview) return "member";
      if (isAdminMode || (CLOUD_ON && window.Cloud && window.Cloud.isAdmin)) return "super_admin";
      if (CLOUD_ON && window.Cloud.isMod) return "moderator";
      return "member";
    }

    function isSuperAdminUser() {
      return getEffectiveAccessRole() === "super_admin";
    }

    function isModeratorOrAdmin() {
      return getEffectiveAccessRole() !== "member";
    }

    function canUserEditItem(item) {
      return !!item && isModeratorOrAdmin();
    }

    function canUserDeleteItem(item) {
      return !!item && isSuperAdminUser();
    }

    function getRoleArabicLabel(roleCode) {
      if (roleCode === "super_admin") return "الإدارة العليا (صلاحية كاملة 👑)";
      if (roleCode === "moderator") return "مشرف معتمد (نشر وتحرير 🛡️)";
      return "عضو / زائر (تصفح وحفظ شخصي 👨‍🏫)";
    }

    // Sync Item Favorites with Active User Profile
    function syncItemsWithCurrentUser() {
      ensurePlatformGovernanceState();
      const user = getCurrentUser();
      const favSet = new Set(user ? (user.favorites || []) : []);
      (appState.items || []).forEach(item => {
        item.isFavorite = user ? favSet.has(item.id) : false;
      });
    }

    // ===== تحميل الحالة =====
    function loadState() {
      try {
        if (!CLOUD_ON) {
          // الوضع المحلي (بدون Firebase): البيانات تُحفظ في هذا المتصفح فقط
          const stored = localStorage.getItem("edutech_mindset_data_v2");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && Array.isArray(parsed.items)) {
              appState = Object.assign({}, deepCopy(DEFAULT_DATA), parsed);
              delete appState.adminPin;
            }
          }
          if (localStorage.getItem("edutech_admin_mode") === "true") isAdminMode = true;
        }
        // مع تفعيل السحابة لا تُستعاد صلاحية الإدارة من علامة محلية؛ تُمنح فقط لحساب Google الموثّق للإدارة بعد تسجيل الدخول
        if (!CLOUD_ON && (localStorage.getItem("edu_admin_portal_unlocked_v136") === "1" || localStorage.getItem("edutech_admin_mode") === "true")) {
          isAdminMode = true;
        }
      } catch (e) {
        console.warn("Storage access restricted, using in-memory state.");
      }
      if (CLOUD_ON) {
        appState = deepCopy(DEFAULT_DATA);
        try {
          const cachedCloud = localStorage.getItem("edutech_cloud_cache_v69");
          if (cachedCloud) {
            const parsedCache = JSON.parse(cachedCloud);
            if (parsedCache && typeof parsedCache === "object") {
              appState = Object.assign(appState, parsedCache);
              contentLoading = false;
            }
          } else {
            appState.items = [];
          }
        } catch (e) {
          appState.items = [];
        }
      }
      syncItemsWithCurrentUser();
      if (window.applySiteTheme) window.applySiteTheme(appState.themeConfig);
    }

    function persistAdminFlag() {
      try {
        if (!CLOUD_ON) {
          localStorage.setItem("edutech_admin_mode", isAdminMode ? "true" : "false");
        } else if (isAdminMode && window.Cloud.user) {
          localStorage.setItem("edutech_admin_unlocked", window.Cloud.user.uid);
        } else {
          localStorage.removeItem("edutech_admin_unlocked");
        }
      } catch (e) {}
    }

    // ===== الحفظ =====
    // الوضع المحلي: localStorage. الوضع السحابي: محتوى الموقع (للإدارة فقط) + بيانات المستخدم الحالي.
    function saveState() {
      try {
        const curU = getCurrentUser();
        if (curU && curU.email) {
          localStorage.setItem("edutech_local_ws_" + curU.email.toLowerCase().trim(), JSON.stringify(serializeUserForCloud(curU)));
        }
        localStorage.setItem("edutech_mindset_data_v2", JSON.stringify(appState));
        localStorage.setItem("edutech_admin_mode", isAdminMode ? "true" : "false");
      } catch (e) {}
      if (!CLOUD_ON) return;
      scheduleContentSync();
      scheduleUserSync();
    }

    // ----- حفظ محتوى الموقع (المدير فقط) -----
    function pickConfig(src) {
      const o = {};
      CONFIG_KEYS.forEach(k => { if (src[k] !== undefined) o[k] = src[k]; });
      return deepCopy(o);
    }
    function buildConfigPayload() { return pickConfig(appState); }
    function buildItemPayload(it) {
      const c = deepCopy(it);
      delete c.isFavorite; delete c.id; delete c.updatedAt; delete c.updatedBy;
      return c;
    }
    function canWriteContent() {
      return CLOUD_ON && ((isAdminMode && window.Cloud.isAdmin) || (!isAdminMode && window.Cloud.isMod));
    }
    function scheduleContentSync() {
      if (!canWriteContent()) return;
      contentDirty = true;
      contentVersion++;
      clearTimeout(contentSyncTimer);
      contentSyncTimer = setTimeout(syncContentNow, 600);
    }
    function syncContentNow() {
      if (!canWriteContent()) { contentDirty = false; return; }
      const myVersion = contentVersion;
      const ops = [];
      const cfg = buildConfigPayload();
      const adminWrite = isAdminMode && window.Cloud.isAdmin;   // المشرف: الموارد فقط، بلا إعدادات ولا حذف
      if (adminWrite && (!cloudSeeded || stableJson(cfg) !== cloudConfigJson)) ops.push({ col: "site", id: "config", data: cfg });
      const seen = {};
      let tooBig = null;
      (appState.items || []).forEach(it => {
        if (!it.id) return;
        const p = buildItemPayload(it);
        const j = stableJson(p);
        if (j.length > 950000) { tooBig = it; return; }
        seen[it.id] = true;
        if (!cloudSeeded || cloudContentIndex[it.id] !== j) ops.push({ col: "items", id: it.id, data: p });
      });
      if (adminWrite) Object.keys(cloudContentIndex).forEach(id => { if (!seen[id] && !(tooBig && tooBig.id === id)) ops.push({ col: "items", id, remove: true }); });
      if (tooBig) showToast("حجم الصور في المورد «" + (tooBig.title || "") + "» كبير جداً ولم يُحفظ. استخدم صورة أصغر أو رابطاً.", "warning");
      if (!ops.length) { if (contentVersion === myVersion) contentDirty = false; return; }
      window.Cloud.commit(ops).then(() => {
        cloudSeeded = true;
        if (contentVersion === myVersion) contentDirty = false;
      }).catch(err => {
        console.error("content sync failed", err);
        contentDirty = false;
        const denied = err && err.code === "permission-denied";
        showToast((denied ? "تعذر الحفظ: حسابك غير مخوّل أو قواعد الأمان القديمة لم تُحدَّث 🔒" : "تعذر حفظ التعديلات في السحابة، تحقق من الاتصال ثم أعد المحاولة") + " [" + ((err && err.code) || "؟") + "]", "warning");
        if (lastRemoteData) { lastRemoteJson = ""; applyRemoteContent(lastRemoteData); }   // تراجع للنسخة المحفوظة فعلياً
      });
    }

    // ----- استلام المحتوى من السحابة -----
    function stripMeta(o) {
      const c = deepCopy(o || {});
      delete c.updatedAt; delete c.updatedBy;
      return c;
    }
    function applyRemoteContent(data) {
      lastRemoteData = data;
      const raw = stableJson({ c: data.config ? stripMeta(data.config) : null, i: data.items.map(stripMeta) });
      if (raw === lastRemoteJson && !contentLoading) return;
      if (contentDirty) return;               // لا نكتب فوق تعديلات الإدارة غير المحفوظة بعد
      lastRemoteJson = raw;
      contentLoading = false;
      cloudSeeded = !!data.config || data.items.length > 0;
      cloudContentIndex = {};
      data.items.forEach(d => { const m = stripMeta(d); cloudContentIndex[d.id] = stableJson(buildItemPayload(m)); });
      cloudConfigJson = data.config ? stableJson(pickConfig(stripMeta(data.config))) : null;

      const base = deepCopy(DEFAULT_DATA);
      if (cloudSeeded) {
        const cfg = data.config ? stripMeta(data.config) : {};
        appState = Object.assign(base, cfg);
        appState.items = data.items.map(stripMeta).sort((a, b) => String(b.id).localeCompare(String(a.id)));
        try {
          localStorage.setItem("edutech_cloud_cache_v69", JSON.stringify(appState));
        } catch (e) {}
      } else {
        appState = base;            // لم يُحفظ شيء بعد: نعرض المحتوى الافتراضي
      }
      delete appState.adminPin;
      if (window.applySiteTheme) window.applySiteTheme(appState.themeConfig);
      fullRender();
      updateAdminUI();
    }
    // عدّاد ومؤقّت إعادة المحاولة التلقائية عند انقطاع الاتصال بـ Firestore (شائع مع شبكات غير مستقرة)
    var contentRetryCount = 0;
    var contentRetryTimer = null;
    function onContentError(err) {
      console.error("content subscribe error", err);
      if (contentLoading) {
        contentLoading = false;
        appState = deepCopy(DEFAULT_DATA);
        fullRender();
      }
      const denied = err && err.code === "permission-denied";
      if (denied) {
        showToast("قواعد الأمان في Firebase غير منشورة بعد — راجع دليل التشغيل", "warning");
        return; // خطأ دائم (صلاحيات) — لا فائدة من إعادة المحاولة
      }
      // أول مرة فقط نُعلم المستخدم؛ المحاولات التالية تجري بصمت في الخلفية حتى لا نُغرقه بالتنبيهات
      if (contentRetryCount === 0) {
        console.warn("Firestore offline fallback active");
      }
      clearTimeout(contentRetryTimer);
      contentRetryCount++;
      // تراجع تصاعدي: 5 ثوانٍ، 15، 40، ثم كل دقيقة — يناسب شبكات متقطعة دون إغراق الخادم بالمحاولات
      var delays = [5000, 15000, 40000, 60000];
      var wait = delays[Math.min(contentRetryCount - 1, delays.length - 1)];
      contentRetryTimer = setTimeout(function () {
        if (!window.Cloud || !window.Cloud.enabled) return;
        contentLoading = true;
        window.Cloud.subscribeContent(function (data) {
          contentRetryCount = 0; // نجحت إعادة الاتصال
          applyRemoteContent(data);
        }, onContentError);
      }, wait);
    }

    // ----- بيانات المستخدم -----
    function serializeUserForCloud(u) {
      let music = null;
      if (u.musicPrefs) {
        music = deepCopy(u.musicPrefs);
        music.tracks = (music.tracks || []).filter(t => !t.isTempBlob && !t.siteShared && !(t.url && String(t.url).startsWith("data:")));
        music.isPlaying = false;
      }
      const o = {
        uid: u.uid, email: u.email, name: u.name || "", picture: u.picture || "",
        role: u.role || "", subject: u.subject || "", grade: u.grade || "", school: u.school || "",
        avatarColor: u.avatarColor || "bg-brand-600",
        favorites: u.favorites || [], completedItems: u.completedItems || [], likedItems: u.likedItems || [],
        userNotes: u.userNotes || {}, savedPrompts: u.savedPrompts || [], userTasks: u.userTasks || [],
        musicPrefs: music, activity: u.activity || [],
        createdAt: u.createdAt || "", lastLoginAt: u.lastLoginAt || ""
      };
      return deepCopy(o);
    }
    function scheduleUserSync() {
      const u = getCurrentUser();
      if (!CLOUD_ON || !u || !u.uid || !window.Cloud.user || window.Cloud.user.uid !== u.uid) return;
      const json = stableJson(serializeUserForCloud(u));
      if (json === lastUserSyncedJson) return;
      userDirty = true;
      userVersion++;
      clearTimeout(userSyncTimer);
      userSyncTimer = setTimeout(syncUserNow, 700);
    }
    function syncUserNow() {
      const u = getCurrentUser();
      if (!u || !u.uid || !window.Cloud.user) { userDirty = false; return; }
      const myVersion = userVersion;
      const payload = serializeUserForCloud(u);
      const json = stableJson(payload);
      window.Cloud.saveUser(u.uid, payload).then(() => {
        lastUserSyncedJson = json;
        if (userVersion === myVersion) userDirty = false;
      }).catch(err => {
        console.error("user sync failed", err);
        userDirty = false;
        showToast("تعذر حفظ بيانات حسابك في السحابة، تحقق من الاتصال", "warning");
      });
    }
    function handleRemoteUser(remote) {
      const cur = getCurrentUser();
      if (!remote || !cur || userDirty) return;
      const rec = normalizeUserRecord(Object.assign({}, remote, { uid: cur.uid, email: cur.email }));
      const j = stableJson(serializeUserForCloud(rec));
      if (j === lastUserSyncedJson) return;
      lastUserSyncedJson = j;
      usersDb[cur.email] = rec;
      fullRender();
    }

    // ----- المصادقة -----
    function startGoogleSignIn(preferRedirect) {
      if (!CLOUD_ON) {
        if (window.EduMasterHierarchy && typeof window.EduMasterHierarchy.openNav === "function") {
          closeModal();
          window.EduMasterHierarchy.openNav("account");
          showToast("يمكنك تسجيل الدخول المباشر أو إنشاء حساب فوري من بوابة الأعضاء 🔑", "info");
          return;
        }
        openCloudSetupModal();
        return;
      }
      explicitSignIn = true;
      window.Cloud.signIn(preferRedirect === true).then(() => {
        closeModal();
      }).catch(err => {
        explicitSignIn = false;
        pendingAdminCallback = null;
        try { sessionStorage.removeItem("edutech_pending_admin"); } catch (e) {}
        const code = err && err.code;
        if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return;
        let msg = "تعذر فتح نافذة Google في هذا المتصفح — يمكنك الدخول بالبريد أو الحساب السريع أدناه";
        if (code === "auth/unauthorized-domain") msg = "أضف النطاق (" + location.hostname + ") إلى Authorized domains في Firebase Console ليعمل دخول Google";
        else if (code === "auth/operation-not-allowed") msg = "فعّل مزوّد Google من Firebase — أو استخدم الدخول المباشر بالبريد";
        else if (code === "auth/network-request-failed") msg = "تعذر الاتصال بالإنترنت — يمكنك الدخول بحسابك المحلي بلا إنترنت";
        showToast(msg, "warning");
        try {
          const eb = document.getElementById("v181GoogleAuthErrBox");
          if (eb) { eb.textContent = "⚠️ " + msg + (code ? " (" + code + ")" : ""); eb.classList.remove("hidden"); }
        } catch (e) {}
      });
    }
    window.startDirectGoogleSignIn = startGoogleSignIn;

    function handleAuthChange(fbUser) {
      if (unwatchUser) { unwatchUser(); unwatchUser = null; }
      if (!fbUser) {
        currentUserEmail = null;
        usersDb = {};
        lastUserSyncedJson = "";
        if (isAdminMode) { isAdminMode = false; persistAdminFlag(); }
        if (window.EduAccessControl && typeof window.EduAccessControl.lockAdmin === "function") window.EduAccessControl.lockAdmin();
        updateAdminUI();
        fullRender();
        return;
      }
      const email = (fbUser.email || "").toLowerCase().trim();
      window.Cloud.loadUser(fbUser.uid).then(remote => {
        const now = new Date().toISOString();
        const isNew = !remote;
        const base = remote ? stripMeta(remote) : {};
        const adminAcc = isAdminEmail(email);
        const rec = normalizeUserRecord(Object.assign({}, base, {
          uid: fbUser.uid,
          email: email,
          name: base.name || fbUser.displayName || "مستخدم EduTech",
          picture: fbUser.photoURL || base.picture || "",
          role: base.role || (adminAcc ? "المدير العام ومؤسس المنصة 👑" : "معلم / تربوي"),
          createdAt: base.createdAt || now
        }));
        const stale = !rec.lastLoginAt || (Date.now() - new Date(rec.lastLoginAt).getTime() > 6 * 3600 * 1000);
        if (stale || explicitSignIn || isNew) rec.lastLoginAt = now;
        usersDb = {};
        usersDb[email] = rec;
        currentUserEmail = email;
        lastUserSyncedJson = remote ? stableJson(serializeUserForCloud(normalizeUserRecord(Object.assign({}, base, { uid: fbUser.uid, email })))) : "";

        // استعادة وضع الإدارة (الحساب المخوّل + سبق إدخال الرمز على هذا الجهاز)
        let pendingAdmin = false;
        try { pendingAdmin = sessionStorage.getItem("edutech_pending_admin") === "1"; sessionStorage.removeItem("edutech_pending_admin"); } catch (e) {}
        if (window.Cloud.isAdmin) {
          // تفعيل وضع الإدارة تلقائياً فور دخول حساب الإدارة المعتمد
          isAdminMode = true;
          persistAdminFlag();
        } else {
          // حساب غير مخوّل: نسحب أي صلاحية إدارة قد تكون علامتها محفوظة على هذا الجهاز
          if (isAdminMode) { isAdminMode = false; persistAdminFlag(); }
          try { localStorage.setItem("edutech_admin_mode", "false"); localStorage.setItem("edu_admin_portal_unlocked_v136", "0"); } catch (e) {}
          if (window.EduAccessControl && typeof window.EduAccessControl.lockAdmin === "function") window.EduAccessControl.lockAdmin();
          if (pendingAdmin || pendingAdminCallback) {
            showToast("هذا الحساب (" + email + ") غير مخوّل لإدارة الموقع. سجّل الخروج وادخل بحساب الإدارة 🔒", "warning");
            pendingAdminCallback = null;
          }
        }

        if (explicitSignIn || isNew) logActivity(isNew ? "أنشأت حسابك وسجّلت الدخول عبر Google" : "سجّلت الدخول عبر Google");
        if (isNew || explicitSignIn || stale) scheduleUserSync();

        const genSubj = document.getElementById("genSubject");
        const genGrd = document.getElementById("genGrade");
        if (genSubj && rec.subject) Array.from(genSubj.options).forEach(o => { if (o.value === rec.subject) genSubj.value = rec.subject; });
        if (genGrd && rec.grade) Array.from(genGrd.options).forEach(o => { if (o.value === rec.grade) genGrd.value = rec.grade; });

        loadMusicPreferences();
        if (window.EduSound) window.EduSound.merge();
        if (window.EduAccessControl && typeof window.EduAccessControl.syncFirebaseUser === "function") {
          try { window.EduAccessControl.syncFirebaseUser(rec, !!window.Cloud.isAdmin); } catch (e) {}
        }
        updateMusicUI();
        updateAdminUI();
        fullRender();
        generatePedagogicalPrompt();
        unwatchUser = window.Cloud.watchUser(fbUser.uid, handleRemoteUser);

        if (explicitSignIn) showToast("مرحباً بك " + rec.name + "! تم تحميل حسابك وبياناتك المحفوظة ✓", "success");
        if (isAdminMode && pendingAdminCallback) {
          const cb = pendingAdminCallback; pendingAdminCallback = null;
          showToast("تم التحقق بنجاح! صلاحيات الإدارة الكاملة مفعلة الآن 👑", "success");
          cb();
        } else if (isAdminMode && (pendingAdmin)) {
          showToast("تم التحقق بنجاح! صلاحيات الإدارة الكاملة مفعلة الآن 👑", "success");
        }
        explicitSignIn = false;
      }).catch(err => {
        console.warn("load user fallback", err);
        const now = new Date().toISOString();
        const adminAcc = isAdminEmail(email);
        const fallbackRec = normalizeUserRecord({
          uid: fbUser.uid,
          email: email,
          name: fbUser.displayName || (email ? email.split("@")[0] : "مستخدم EduTech"),
          picture: fbUser.photoURL || "",
          role: adminAcc ? "المدير العام ومؤسس المنصة 👑" : "معلم / تربوي",
          createdAt: now,
          lastLoginAt: now
        });
        usersDb = {};
        usersDb[email] = fallbackRec;
        currentUserEmail = email;
        if (window.Cloud && window.Cloud.isAdmin) { isAdminMode = true; persistAdminFlag(); }
        if (window.EduAccessControl && typeof window.EduAccessControl.syncFirebaseUser === "function") {
          try { window.EduAccessControl.syncFirebaseUser(fallbackRec, !!(window.Cloud && window.Cloud.isAdmin)); } catch (e) {}
        }
        updateAdminUI();
        fullRender();
        if (explicitSignIn) showToast("تم تسجيل دخولك بنجاح (" + fallbackRec.name + ") — يعمل الآن بالوضع المحلّي الآمن ✓", "success");
        explicitSignIn = false;
      });
    }

    // شارة حالة الحفظ (تظهر للإدارة فقط)
    let badgeTimer = null;
    function setSaveBadge(kind, text) {
      let el = document.getElementById("cloudSaveBadge");
      if (!el) {
        el = document.createElement("div");
        el.id = "cloudSaveBadge";
        el.className = "fixed bottom-20 left-4 z-[70] px-3.5 py-2 rounded-xl text-[11px] font-extrabold shadow-xl transition-all pointer-events-none opacity-0";
        document.body.appendChild(el);
      }
      if (!isAdminMode && !(CLOUD_ON && window.Cloud.isMod) && kind !== "error") { el.style.opacity = "0"; return; }
      const colors = { saving: "bg-amber-500 text-slate-950", saved: "bg-emerald-600 text-white", error: "bg-rose-600 text-white", local: "bg-slate-800 text-amber-300" };
      el.className = "fixed bottom-20 left-4 z-[70] px-3.5 py-2 rounded-xl text-[11px] font-extrabold shadow-xl transition-all pointer-events-none " + (colors[kind] || colors.saved);
      el.textContent = text;
      el.style.opacity = "1";
      clearTimeout(badgeTimer);
      if (kind === "saved") badgeTimer = setTimeout(() => { el.style.opacity = "0"; }, 2500);
    }

    function initCloud() {
      if (!CLOUD_ON) return;
      window.Cloud.onStatus((state) => {
        if (state === "saving") setSaveBadge("saving", "⏳ جارٍ حفظ التعديلات في السحابة…");
        else if (state === "saved") setSaveBadge("saved", "✓ تم حفظ التعديلات للجميع");
        else if (state === "error") setSaveBadge("error", "⚠ فشل الحفظ في السحابة");
      });
      window.Cloud.subscribeContent(applyRemoteContent, onContentError);
      setTimeout(() => {
        if (contentLoading) {
          contentLoading = false;
          try {
            const cachedCloud = localStorage.getItem("edutech_cloud_cache_v69");
            if (cachedCloud) {
              appState = Object.assign(deepCopy(DEFAULT_DATA), JSON.parse(cachedCloud));
            } else {
              appState = deepCopy(DEFAULT_DATA);
            }
          } catch (e) {
            appState = deepCopy(DEFAULT_DATA);
          }
          fullRender();
        }
      }, 15000);
      window.Cloud.onAuth(handleAuthChange);
    }

    // Helper: Escape HTML
    function escapeHtml(str) {
      if (str === null || str === undefined) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    // Helper: Safe URL (Hardened against XSS / javascript: / data:text/html)
    function safeUrl(u) {
      if (!u) return "#";
      const trimmed = String(u).trim();
      if (/^(javascript|vbscript|file):/i.test(trimmed)) return "#";
      if (/^data:/i.test(trimmed)) {
        return /^data:(image\/(png|jpeg|jpg|webp|gif)|audio\/(mpeg|mp3|wav|ogg|mp4)|video\/(mp4|webm)|application\/pdf);base64,/i.test(trimmed) ? trimmed : "#";
      }
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("mailto:") || trimmed.startsWith("#") || trimmed.startsWith("/")) {
        return trimmed;
      }
      return "https://" + trimmed;
    }

    // Toast Notification System
    function showToast(message, type) {
      const toastEl = document.getElementById("toast");
      const msgEl = document.getElementById("toastMsg");
      const iconEl = document.getElementById("toastIcon");

      msgEl.textContent = message;
      if (type === "warning") {
        iconEl.className = "fa-solid fa-triangle-exclamation text-amber-400 text-base";
      } else if (type === "info") {
        iconEl.className = "fa-solid fa-circle-info text-sky-400 text-base";
      } else {
        iconEl.className = "fa-solid fa-circle-check text-emerald-400 dark:text-emerald-500 text-base";
      }

      toastEl.classList.remove("opacity-0", "translate-y-2");
      toastEl.classList.add("opacity-100", "translate-y-0");

      if (window.toastTimer) clearTimeout(window.toastTimer);
      window.toastTimer = setTimeout(() => {
        toastEl.classList.remove("opacity-100", "translate-y-0");
        toastEl.classList.add("opacity-0", "translate-y-2");
      }, 2800);
    }

    // Theme Management
    function initTheme() {
      let isDark = false;
      try {
        const storedTheme = localStorage.getItem("edutech_theme");
        if (storedTheme) {
          isDark = (storedTheme === "dark");
        } else {
          isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        }
      } catch (e) {
        isDark = false;
      }

      applyTheme(isDark);

      document.getElementById("btnThemeToggle").addEventListener("click", () => {
        const currentlyDark = document.documentElement.classList.contains("dark");
        applyTheme(!currentlyDark);
      });
    }

    function applyTheme(isDark) {
      const themeIcon = document.getElementById("themeIcon");
      if (isDark) {
        document.documentElement.classList.add("dark");
        if (themeIcon) themeIcon.className = "fa-solid fa-sun text-amber-400 text-base";
      } else {
        document.documentElement.classList.remove("dark");
        if (themeIcon) themeIcon.className = "fa-solid fa-moon text-slate-600 text-base";
      }
      try {
        localStorage.setItem("edutech_theme", isDark ? "dark" : "light");
      } catch (e) {}
    }

    // Calculate User Rank Badge based on Completed Items & Saved Prompts
    function getUserRankTitle(user) {
      if (!user) return "زائر المنصة";
      const score = ((user.completedItems || []).length * 2) + ((user.savedPrompts || []).length) + Object.keys(user.userNotes || {}).length;
      if (score >= 10) return "🏆 سفير EduTech المعتمد";
      if (score >= 5) return "🚀 رائد التعليم الذكي";
      return "🌱 معلّم رقمي مبادر";
    }

    // Render User Workspace & Header Profile UI
    function renderUserWorkspace() {
      const user = getCurrentUser();
      const btnLoginHeader = document.getElementById("btnGoogleLoginHeader");
      const btnUserHeader = document.getElementById("btnUserHeaderProfile");
      const guestBanner = document.getElementById("guestWorkspaceBanner");
      const activeDash = document.getElementById("activeUserDashboard");

      const localHierUser = (window.EduAccessControl && typeof window.EduAccessControl.getCurrentUser === "function") ? window.EduAccessControl.getCurrentUser() : null;
      const effUser = user || (localHierUser ? normalizeUserRecord(localHierUser) : null);
      if (!effUser) {
        // Logged Out State — show login buttons and guest banner, hide active dashboard, and return cleanly
        if (btnLoginHeader) btnLoginHeader.classList.remove("hidden");
        if (btnUserHeader) {
          btnUserHeader.classList.add("hidden");
          btnUserHeader.classList.remove("flex");
        }
        if (guestBanner) guestBanner.classList.remove("hidden");
        if (activeDash) activeDash.classList.add("hidden");
        return;
      }

      // Logged In State
      if (btnLoginHeader) btnLoginHeader.classList.add("hidden");
      if (btnUserHeader) {
        btnUserHeader.classList.remove("hidden");
        btnUserHeader.classList.add("flex");
      }
      if (guestBanner) guestBanner.classList.add("hidden");
      if (activeDash) activeDash.classList.remove("hidden");

      const initial = (effUser.name || "م").trim().charAt(0);
      const avatarEl = document.getElementById("headerUserAvatar");
      const dashAvatarEl = document.getElementById("dashUserAvatar");

      if (user.picture && user.picture.trim() !== "") {
        avatarEl.innerHTML = `<img src="${escapeHtml(safeUrl(user.picture))}" alt="${escapeHtml(user.name)}" class="w-full h-full object-cover">`;
        dashAvatarEl.innerHTML = `<img src="${escapeHtml(safeUrl(user.picture))}" alt="${escapeHtml(user.name)}" class="w-full h-full object-cover">`;
      } else {
        if (avatarEl) avatarEl.className = `w-7 h-7 rounded-lg ${user.avatarColor || 'bg-brand-600'} text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0`;
        avatarEl.textContent = initial;
        if (dashAvatarEl) dashAvatarEl.className = `w-16 h-16 rounded-2xl ${user.avatarColor || 'bg-brand-600'} border-2 border-white/40 text-white font-black text-2xl flex items-center justify-center shadow-lg shrink-0`;
        dashAvatarEl.textContent = initial;
      }

      document.getElementById("headerUserName").textContent = user.name;
      document.getElementById("dashUserName").textContent = user.name;
      document.getElementById("dashUserRoleBadge").textContent = user.role || "تربوي";
      document.getElementById("dashUserRankBadge").textContent = getUserRankTitle(user);
      document.getElementById("dashUserEmail").innerHTML = `<i class="fa-brands fa-google ml-1 text-white"></i>${escapeHtml(user.email)}`;
      document.getElementById("dashUserSubject").innerHTML = `<i class="fa-solid fa-book-open ml-1"></i>${escapeHtml(user.subject || "تكنولوجيا التعليم")}`;
      document.getElementById("dashUserSchool").innerHTML = `<i class="fa-solid fa-school ml-1"></i>${escapeHtml(user.school || "فلسطين 🇵🇸")}`;
      document.getElementById("overviewUserEmailText").textContent = user.email;

      // Progress calculation
      const totalItems = (appState.items || []).length || 1;
      const completedCount = (user.completedItems || []).filter(id => (appState.items || []).some(it => it.id === id)).length;
      const pct = Math.min(100, Math.round((completedCount / totalItems) * 100));
      document.getElementById("dashProgressPercent").textContent = pct + "%";
      document.getElementById("dashProgressBar").style.width = pct + "%";

      const favCount = (user.favorites || []).length;
      const promptsCount = (user.savedPrompts || []).length;
      const notesKeys = Object.keys(user.userNotes || {}).filter(k => user.userNotes[k] && user.userNotes[k].trim() !== "");
      const notesCount = notesKeys.length;
      const tasksCount = (user.userTasks || []).filter(t => !t.done).length;

      document.getElementById("userStatFavs").textContent = favCount;
      document.getElementById("userStatCompleted").textContent = completedCount;
      document.getElementById("userStatPrompts").textContent = promptsCount;
      document.getElementById("userStatNotes").textContent = notesCount;

      document.getElementById("wsTabPromptsCount").textContent = promptsCount;
      document.getElementById("wsTabNotesCount").textContent = notesCount + favCount;
      document.getElementById("wsTabTasksCount").textContent = tasksCount;

      // Render Tab 2: Saved Prompts
      const promptsContainer = document.getElementById("userSavedPromptsList");
      if (promptsCount === 0) {
        promptsContainer.innerHTML = `
          <div class="col-span-full p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">
            لا توجد برومبتات محفوظة في حسابك بعد. استخدم «مُولّد البرومبتات» بالأسفل واضغط «حفظ في حسابي».
          </div>
        `;
      } else {
        promptsContainer.innerHTML = (user.savedPrompts || []).map(sp => `
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-3">
            <div>
              <div class="flex items-center justify-between gap-2 mb-1.5">
                <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400">${escapeHtml(sp.aiModel || "AI")}</span>
                <span class="text-[10px] text-slate-400">${escapeHtml(sp.date || "2026")}</span>
              </div>
              <h4 class="text-xs font-extrabold text-slate-900 dark:text-white mb-1">${escapeHtml(sp.topic)}</h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mb-2">${escapeHtml(sp.grade)} • ${escapeHtml(sp.subject)}</p>
              <div class="p-2.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] line-clamp-3 leading-relaxed">${escapeHtml(sp.text)}</div>
            </div>
            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-700">
              <button type="button" class="btn-copy-saved-prompt px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-[11px] font-bold flex items-center gap-1" data-id="${escapeHtml(sp.id)}">
                <i class="fa-regular fa-copy"></i>
                <span>نسخ</span>
              </button>
              <button type="button" class="btn-exp-saved px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-600 text-sky-600 hover:text-white text-[11px] font-bold flex items-center gap-1" data-k="docx" data-id="${escapeHtml(sp.id)}" title="تنزيل Word"><i class="fa-solid fa-file-word"></i><span>Word</span></button>
              <button type="button" class="btn-exp-saved px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-600 hover:text-white text-[11px] font-bold flex items-center gap-1" data-k="pdf" data-id="${escapeHtml(sp.id)}" title="تنزيل PDF"><i class="fa-solid fa-file-pdf"></i><span>PDF</span></button>
              <button type="button" class="btn-del-saved-prompt p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white text-[11px] transition-all" data-id="${escapeHtml(sp.id)}" title="حذف من حسابي">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              </button>
            </div>
          </div>
        `).join("");
      }

      // Render Tab 3: Personal Notes & Favorites
      const notesFavsContainer = document.getElementById("userNotesAndFavsList");
      const personalItems = (appState.items || []).filter(it => {
        const isFav = (user.favorites || []).includes(it.id);
        const hasNote = user.userNotes && user.userNotes[it.id] && user.userNotes[it.id].trim() !== "";
        const isDone = (user.completedItems || []).includes(it.id);
        return isFav || hasNote || isDone;
      });

      if (personalItems.length === 0) {
        notesFavsContainer.innerHTML = `
          <div class="col-span-full p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">
            لم تقم بإضافة موارد للمفضلة أو كتابة ملاحظات شخصية بعد. تصفح المكتبة التعليمية واضغط على أي مورد لإضافة ملاحظاتك!
          </div>
        `;
      } else {
        notesFavsContainer.innerHTML = personalItems.map(it => {
          const noteText = (user.userNotes && user.userNotes[it.id]) ? user.userNotes[it.id] : "";
          const isFav = (user.favorites || []).includes(it.id);
          const isDone = (user.completedItems || []).includes(it.id);
          return `
            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-2.5">
              <div>
                <div class="flex flex-wrap items-center gap-1.5 mb-1.5">
                  ${isFav ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-500"><i class="fa-solid fa-heart ml-1"></i>مفضلة</span>` : ""}
                  ${isDone ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"><i class="fa-solid fa-check ml-1"></i>مكتمل</span>` : ""}
                  ${noteText ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400"><i class="fa-solid fa-note-sticky ml-1"></i>ملاحظتي</span>` : ""}
                </div>
                <h4 class="text-xs font-extrabold text-slate-900 dark:text-white cursor-pointer hover:text-brand-500" onclick="openResourceModal('${escapeHtml(it.id)}')">${escapeHtml(it.title)}</h4>
                ${noteText ? `
                  <div class="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-700 dark:text-slate-200">
                    <strong class="text-amber-600 dark:text-amber-400 block text-[10px] mb-0.5">📝 ملاحظتي التربوية:</strong>
                    ${escapeHtml(noteText)}
                  </div>
                ` : ""}
              </div>
              <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <button type="button" class="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline" onclick="openResourceModal('${escapeHtml(it.id)}')">
                  فتح وتعديل الملاحظة
                </button>
              </div>
            </div>
          `;
        }).join("");
      }

      // Render Tab 4: Educator Tasks
      const tasksContainer = document.getElementById("userTasksList");
      const tasks = user.userTasks || [];
      if (tasks.length === 0) {
        tasksContainer.innerHTML = `
          <div class="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">
            مفكرتك فارغة حالياً. أضف خططك ومهامك التحضيرية ليتم حفظها في حسابك.
          </div>
        `;
      } else {
        tasksContainer.innerHTML = tasks.map(t => {
          let priBadge = `<span class="text-[10px] px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-600 dark:text-sky-400 font-bold">📌 اعتيادية</span>`;
          if (t.priority === "high") priBadge = `<span class="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-500 font-bold">🔥 عاجل</span>`;
          else if (t.priority === "idea") priBadge = `<span class="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">💡 فكرة</span>`;
          return `
            <div class="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <label class="flex items-center gap-2.5 cursor-pointer flex-grow">
                <input type="checkbox" class="chk-user-task w-4 h-4 rounded text-brand-600 focus:ring-brand-500" data-id="${escapeHtml(t.id)}" ${t.done ? "checked" : ""}>
                <span class="text-xs font-bold ${t.done ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}">${escapeHtml(t.title)}</span>
              </label>
              <div class="flex items-center gap-2 shrink-0">
                ${priBadge}
                <button type="button" class="btn-del-user-task p-1.5 rounded-lg text-slate-400 hover:text-rose-500 text-xs" data-id="${escapeHtml(t.id)}" title="حذف المهمة">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </button>
              </div>
            </div>
          `;
        }).join("");
      }

      // سجل حركات المستخدم داخل حسابه
      const acts = user.activity || [];
      const actCountEl = document.getElementById("wsTabActivityCount");
      if (actCountEl) actCountEl.textContent = acts.length;
      const actEl = document.getElementById("userActivityList");
      if (actEl) {
        actEl.innerHTML = acts.length === 0
          ? `<div class="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">لا توجد حركات مسجّلة بعد. تفاعلك مع الموارد (مفضلة، إكمال، ملاحظات…) سيظهر هنا.</div>`
          : acts.map(a => `
              <div class="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span class="text-xs font-bold text-slate-800 dark:text-slate-100">${escapeHtml(a.text)}</span>
                <span class="text-[10px] text-slate-400 shrink-0">${escapeHtml(formatActTime(a.t))}</span>
              </div>`).join("");
      }
    }

    // Render Stats Bar
    function renderStats() {
      const items = appState.items || [];
      const totalCount = items.length;
      const videoCount = items.filter(x => x.type === "video").length;
      const promptCount = items.filter(x => x.type === "prompt").length;
      const toolCount = items.filter(x => x.type === "tool").length;
      const imgCount = items.filter(x => x.type === "image").length;
      const totalLikes = items.reduce((acc, x) => acc + getItemLikes(x), 0);

      const studiosCount = (window.EduLauncher && window.EduLauncher.apps) ? window.EduLauncher.apps.filter(a => !a.adminTab).length : 41;
      const stats = [
        { label: "منظومات واستوديوهات", val: studiosCount, icon: "fa-solid fa-cubes", color: "text-indigo-500" },
        { label: "إجمالي المصادر", val: totalCount, icon: "fa-solid fa-layer-group", color: "text-brand-500" },
        { label: "فيديوهات وشروحات", val: videoCount, icon: "fa-solid fa-play", color: "text-red-500" },
        { label: "برومبتات ذكية", val: promptCount, icon: "fa-solid fa-wand-magic-sparkles", color: "text-amber-500" },
        { label: "أدوات وقوالب", val: toolCount, icon: "fa-solid fa-toolbox", color: "text-sky-500" },
        { label: "تفاعلات وإعجابات", val: totalLikes, icon: "fa-solid fa-heart", color: "text-rose-500" }
      ];

      const html = stats.map(s => `
        <div class="glass-card p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
          <div class="flex items-center justify-center gap-1.5 mb-1 ${s.color}">
            <i class="${s.icon} text-sm"></i>
          </div>
          <div class="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">${s.val}</div>
          <div class="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate">${s.label}</div>
        </div>
      `).join("");

      document.getElementById("statsBar").innerHTML = html;

      // Update favorites badge in header
      const favCount = items.filter(x => x.isFavorite).length;
      document.getElementById("favBadge").textContent = favCount;
      document.getElementById("libCountBadge").textContent = totalCount + " موارد";
    }

    // Render Category Filter Chips
    function renderCategoryChips() {
      const items = appState.items || [];
      const types = [
        { id: "all", label: "الكل", icon: "fa-solid fa-border-all", count: items.length },
        { id: "video", label: TYPE_META.video.chip, icon: TYPE_META.video.icon, count: items.filter(x => x.type === "video").length },
        { id: "prompt", label: TYPE_META.prompt.chip, icon: TYPE_META.prompt.icon, count: items.filter(x => x.type === "prompt").length },
        { id: "tool", label: TYPE_META.tool.chip, icon: TYPE_META.tool.icon, count: items.filter(x => x.type === "tool").length },
        { id: "image", label: TYPE_META.image.chip, icon: TYPE_META.image.icon, count: items.filter(x => x.type === "image").length }
      ];

      const html = types.map(t => {
        const isActive = (activeCategory === t.id);
        const activeClass = isActive
          ? "bg-brand-600 text-white shadow-md shadow-brand-500/25 border-brand-600 font-extrabold"
          : "bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-500 font-bold";
        return `
          <button type="button" class="btn-cat-chip shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs transition-all active:scale-95 ${activeClass}" data-category="${t.id}">
            <span>${t.label}</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}">${t.count}</span>
          </button>
        `;
      }).join("");

      document.getElementById("categoryChips").innerHTML = html;
    }

    // Render Filter Status Bar
    function updateFilterStatus() {
      const statusWrapper = document.getElementById("filterStatusWrapper");
      const statusText = document.getElementById("filterStatusText");

      const filtersActive = (activeCategory !== "all" || activeTag !== "all" || isFavFilterOnly || isCompletedFilterOnly || isHasNotesFilterOnly || searchQuery.trim() !== "");
      if (filtersActive) {
        let parts = [];
        if (activeCategory !== "all") parts.push(`التصنيف: ${TYPE_META[activeCategory] ? TYPE_META[activeCategory].label : activeCategory}`);
        if (activeTag !== "all") parts.push(`الوسم: #${activeTag}`);
        if (isFavFilterOnly) parts.push("المفضلة فقط ❤️");
        if (isCompletedFilterOnly) parts.push("المكتملة فقط ✓");
        if (isHasNotesFilterOnly) parts.push("بها ملاحظاتي 📝");
        if (searchQuery.trim()) parts.push(`البحث: "${searchQuery}"`);

        statusText.textContent = "تصفية نشطة: " + parts.join(" | ");
        statusWrapper.classList.remove("hidden");
        statusWrapper.classList.add("flex");
      } else {
        statusWrapper.classList.remove("flex");
        statusWrapper.classList.add("hidden");
      }
    }

    // Render Resource Grid
    function renderResources() {
      syncItemsWithCurrentUser();
      const grid = document.getElementById("resourceGrid");
      const emptyState = document.getElementById("emptyState");
      const items = appState.items || [];
      const user = getCurrentUser();

      if (contentLoading) {
        emptyState.classList.add("hidden");
        grid.innerHTML = `<div class="col-span-full p-10 text-center text-xs font-bold text-slate-500 dark:text-slate-400"><i class="fa-solid fa-circle-notch fa-spin text-brand-500 text-xl block mb-3"></i>جارٍ تحميل المحتوى…</div>`;
        return;
      }

      // Filter
      let filtered = items.filter(item => {
        // Category
        if (activeCategory !== "all" && item.type !== activeCategory) return false;
        // Tag
        if (activeTag !== "all" && (!item.tags || !item.tags.includes(activeTag))) return false;
        // Favorites
        if (isFavFilterOnly && !item.isFavorite) return false;
        // Completed Filter
        if (isCompletedFilterOnly) {
          if (!user || !(user.completedItems || []).includes(item.id)) return false;
        }
        // Personal Notes Filter
        if (isHasNotesFilterOnly) {
          if (!user || !user.userNotes || !user.userNotes[item.id] || user.userNotes[item.id].trim() === "") return false;
        }
        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = (item.title || "").toLowerCase().includes(q);
          const matchDesc = (item.desc || "").toLowerCase().includes(q);
          const matchTags = (item.tags || []).some(t => t.toLowerCase().includes(q));
          const matchNote = (user && user.userNotes && user.userNotes[item.id]) ? user.userNotes[item.id].toLowerCase().includes(q) : false;
          if (!matchTitle && !matchDesc && !matchTags && !matchNote) return false;
        }
        return true;
      });

      // Sort (Pinned items by Administration always appear first!)
      filtered.sort((a, b) => {
        if (Boolean(b.isPinned) !== Boolean(a.isPinned)) {
          return b.isPinned ? 1 : -1;
        }
        if (sortMode === "likes") {
          return getItemLikes(b) - getItemLikes(a);
        } else if (sortMode === "title") {
          return (a.title || "").localeCompare(b.title || "", "ar");
        } else {
          return (b.id || "").localeCompare(a.id || "");
        }
      });

      if (filtered.length === 0) {
        grid.innerHTML = "";
        emptyState.classList.remove("hidden");
      } else {
        emptyState.classList.add("hidden");
        const cardsHtml = filtered.map(item => createCardHtml(item)).join("");
        grid.innerHTML = cardsHtml;
      }

      renderCategoryChips();
      updateFilterStatus();
    }

    // Generate Card HTML for an Item
    function createCardHtml(item) {
      const meta = TYPE_META[item.type] || TYPE_META.tool;
      const isFav = !!item.isFavorite;
      const hasThumb = item.thumb && item.thumb.trim() !== "";
      const isVideo = (item.type === "video");
      const isPrompt = (item.type === "prompt");
      const user = getCurrentUser();
      const isCompleted = user ? (user.completedItems || []).includes(item.id) : false;
      const personalNote = (user && user.userNotes && user.userNotes[item.id]) ? user.userNotes[item.id].trim() : "";

      // Media Banner
      let mediaHtml = "";
      if (hasThumb) {
        mediaHtml = `
          <div class="relative w-full aspect-video bg-slate-900 overflow-hidden group/media cursor-pointer" onclick="openResourceModal('${escapeHtml(item.id)}')">
            <img src="${escapeHtml(item.thumb)}" alt="${escapeHtml(item.title)}" loading="lazy" class="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-500">
            ${isVideo ? `
              <div class="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                <span class="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center text-lg shadow-lg group-hover/media:scale-110 transition-transform">
                  <i class="fa-solid fa-play mr-0.5"></i>
                </span>
              </div>
            ` : ""}
          </div>
        `;
      } else {
        let bgGradient = "from-slate-800 to-slate-950";
        if (isVideo) bgGradient = "from-red-900/40 to-slate-950";
        else if (isPrompt) bgGradient = "from-amber-900/40 to-slate-950";
        else if (item.type === "tool") bgGradient = "from-sky-900/40 to-slate-950";
        else if (item.type === "image") bgGradient = "from-emerald-900/40 to-slate-950";

        mediaHtml = `
          <div class="relative w-full aspect-video bg-gradient-to-br ${bgGradient} flex flex-col items-center justify-center p-4 text-center cursor-pointer group/media" onclick="openResourceModal('${escapeHtml(item.id)}')">
            <div class="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center text-xl mb-2 group-hover/media:scale-110 transition-transform">
              <i class="${meta.icon}"></i>
            </div>
            <span class="text-[11px] font-bold text-white/80">${meta.label}</span>
          </div>
        `;
      }

      // Tag Badges
      const tagsHtml = (item.tags || []).slice(0, 3).map(tag => `
        <button type="button" class="btn-card-tag inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-brand-500 hover:text-white transition-all" data-tag="${escapeHtml(tag)}">
          #${escapeHtml(tag)}
        </button>
      `).join("");

      const canEdit = canUserEditItem(item);
      const canDelete = canUserDeleteItem(item);
      const superAdmin = isSuperAdminUser();
      const isPinned = !!item.isPinned;
      const isVerified = (item.isVerified !== false);
      const publisherBadge = item.authorRole === "moderator"
        ? `<span class="text-[10px] font-bold text-sky-600 dark:text-sky-400"><i class="fa-solid fa-user-shield ml-1"></i>نشر مشرف: ${escapeHtml(item.authorName || 'مشرف')}</span>`
        : `<span class="text-[10px] font-bold text-amber-600 dark:text-amber-400"><i class="fa-solid fa-crown ml-1"></i>الإدارة العامة</span>`;

      return `
        <div class="group flex flex-col glass-card rounded-2xl border ${isPinned ? 'border-amber-400/80 dark:border-amber-500/60 ring-1 ring-amber-400/30' : (isCompleted ? 'border-emerald-500/50 dark:border-emerald-500/40' : 'border-slate-200/90 dark:border-slate-800')} overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 relative">
          
          <!-- Role-Based Control Badges (Super Admin gets Pin/Verify/Edit/Delete; Moderator gets Edit on own items only) -->
          ${(superAdmin || canEdit) ? `
            <div class="absolute top-2 left-2 z-10 flex items-center gap-1">
              ${superAdmin ? `
                <button type="button" class="btn-pin-item p-1.5 rounded-lg ${isPinned ? 'bg-amber-500 text-slate-950' : 'bg-slate-900/80 text-white hover:bg-amber-500 hover:text-slate-950'} text-xs shadow-md backdrop-blur-xs transition-all" data-id="${escapeHtml(item.id)}" title="${isPinned ? 'إلغاء التثبيت (صلاحية إدارة)' : 'تثبيت في أعلى المكتبة (صلاحية إدارة)'}">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>
                </button>
                <button type="button" class="btn-verify-item p-1.5 rounded-lg ${isVerified ? 'bg-emerald-600 text-white' : 'bg-slate-900/80 text-slate-300 hover:bg-emerald-600 hover:text-white'} text-xs shadow-md backdrop-blur-xs transition-all" data-id="${escapeHtml(item.id)}" title="${isVerified ? 'مورد معتمد رسمياً من الإدارة' : 'اعتماد وتوثيق هذا المورد'}">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 2.4 3.4-.6.6 3.4L20.8 9.6 19.2 12l1.6 2.4-2.4 2.4-.6 3.4-3.4-.6L12 22l-2.4-2.4-3.4.6-.6-3.4L3.2 14.4 4.8 12 3.2 9.6l2.4-2.4.6-3.4 3.4.6L12 2zm-1 13.5l5-5-1.4-1.4L11 12.7 9.4 11.1 8 12.5l3 3z"/></svg>
                </button>
              ` : ""}
              ${canEdit ? `
                <button type="button" class="btn-edit-item p-1.5 rounded-lg bg-slate-900/80 hover:bg-brand-600 text-white text-xs shadow-md backdrop-blur-xs transition-all" data-id="${escapeHtml(item.id)}" title="تعديل هذا المورد">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                </button>
              ` : ""}
              ${canDelete ? `
                <button type="button" class="btn-del-item p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-600 text-white text-xs shadow-md backdrop-blur-xs transition-all" data-id="${escapeHtml(item.id)}" title="حذف نهائي (صلاحية إدارة فقط)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </button>
              ` : ""}
            </div>
          ` : ""}

          <!-- Type Badge, Pinned Badge & User Completed Indicator -->
          <div class="absolute top-2 right-2 z-10 flex flex-wrap items-center gap-1">
            ${isPinned ? `
              <span class="inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full bg-amber-500 text-slate-950 shadow-xs">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>
                <span>مثبت</span>
              </span>
            ` : ""}
            <span class="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-xs shadow-xs">
              <i class="${meta.icon} text-[10px]"></i>
              <span>${meta.label}</span>
            </span>
            ${isCompleted ? `
              <span class="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-1 rounded-full bg-emerald-500 text-white shadow-xs" title="أتممت مراجعة وتطبيق هذا المورد">
                <i class="fa-solid fa-check"></i>
              </span>
            ` : ""}
          </div>

          <!-- Media View -->
          ${mediaHtml}

          <!-- Content Body -->
          <div class="p-4 flex flex-col flex-grow text-right">
            
            <div class="flex items-center justify-between text-[10px] mb-1 pb-1 border-b border-slate-100 dark:border-slate-800/80">
              ${publisherBadge}
              ${isVerified ? `<span class="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>معتمد</span>` : `<span class="text-[10px] font-bold text-slate-400">منشور عام</span>`}
            </div>
            <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
              <span>${escapeHtml(item.date || "2026")}</span>
              <!-- Likes, Completed, and Favorite -->
              <div class="flex items-center gap-2">
                <button type="button" class="btn-complete-item flex items-center gap-1 ${isCompleted ? 'text-emerald-500 font-bold' : 'text-slate-400 hover:text-emerald-500'} transition-colors" data-id="${escapeHtml(item.id)}" title="${isCompleted ? 'مكتمل في حسابك' : 'تحديد كمكتمل في حسابك'}">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                </button>
                <button type="button" class="btn-like-item flex items-center gap-1 text-slate-400 hover:text-rose-500 transition-colors" data-id="${escapeHtml(item.id)}" title="إعجاب">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>
                  <span class="font-bold">${getItemLikes(item)}</span>
                </button>
                <button type="button" class="btn-fav-item ${isFav ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'} transition-colors" data-id="${escapeHtml(item.id)}" title="حفظ للمفضلة الخاصة بحسابك">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                </button>
              </div>
            </div>

            <h3 class="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-2 mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors cursor-pointer" onclick="openResourceModal('${escapeHtml(item.id)}')">
              ${escapeHtml(item.title)}
            </h3>

            <p class="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mb-3 leading-relaxed">
              ${escapeHtml(item.desc)}
            </p>

            ${personalNote ? `
              <div class="mb-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-800 dark:text-amber-300 line-clamp-2">
                <i class="fa-solid fa-note-sticky ml-1 text-amber-500"></i>
                <strong>ملاحظتي:</strong> ${escapeHtml(personalNote)}
              </div>
            ` : ""}

            <!-- Tags -->
            <div class="flex flex-wrap gap-1 mt-auto pt-2 border-t border-slate-100 dark:border-slate-800">
              ${tagsHtml}
            </div>

            ${isPrompt ? `<button type="button" onclick="runItemAI('${escapeHtml(item.id)}')" class="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-l from-purple-600 to-brand-600 text-white text-xs font-extrabold shadow-md"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg><span>نفّذ داخل الموقع بالذكاء الاصطناعي</span></button>` : ""}
            <!-- Card Bottom Buttons -->
            <div class="flex items-center justify-between gap-2 pt-3 mt-2">
              <button type="button" class="flex-grow inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-white dark:hover:bg-brand-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all" onclick="openResourceModal('${escapeHtml(item.id)}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <span>تفاصيل ومعاينة</span>
              </button>

              <!-- External Action Button -->
              <a href="${escapeHtml(safeUrl(item.url))}" target="_blank" rel="noopener" class="inline-flex items-center justify-center p-2 rounded-xl bg-brand-500/10 hover:bg-brand-500 text-brand-600 hover:text-white dark:text-brand-400 text-xs transition-all" title="فتح الرابط">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>

              <!-- WhatsApp Quick Share -->
              <button type="button" class="btn-share-whatsapp p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white text-xs transition-all" data-title="${escapeHtml(item.title)}" data-url="${escapeHtml(safeUrl(item.url))}" title="مشاركة عبر واتساب">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.01c-.24.68-1.42 1.3-1.96 1.38-.5.08-1.14.11-1.84-.11-.42-.14-.97-.32-1.67-.62-2.94-1.27-4.86-4.23-5.01-4.43-.15-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46.27-.3.59-.37.79-.37h.57c.18 0 .43-.07.67.51.24.59.84 2.04.91 2.19.07.15.12.32.02.52-.1.2-.15.32-.3.49-.15.17-.31.38-.44.51-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.36 1.46.3.15.47.12.64-.07.17-.2.74-.86.94-1.16.2-.3.4-.25.67-.15.27.1 1.72.81 2.02.96.3.15.49.22.57.34.07.12.07.72-.17 1.4z"/></svg>
              </button>
            </div>

          </div>

        </div>
      `;
    }

    // Render Social Media Channels (v241 — Inline SVG Brand Icons + Vibrant Gradients, 100% Offline Safe)
    function eduSocialSvgAndStyle(l) {
      const key = ((l.n || "") + " " + (l.i || "") + " " + (l.u || "")).toLowerCase();
      if (key.includes("kids") || key.includes("أطفال")) {
        return {
          bg: "linear-gradient(135deg,#f43f5e,#f59e0b)",
          svg: '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z"/></svg>'
        };
      }
      if (key.includes("توجيهي") || key.includes("tawjihi")) {
        return {
          bg: "linear-gradient(135deg,#059669,#0ea5e9)",
          svg: '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 13.73L4.5 12.6V17c0 2.21 3.36 4 7.5 4s7.5-1.79 7.5-4v-4.4L12 16.73z"/></svg>'
        };
      }
      if (key.includes("youtube") || key.includes("يوتيوب")) {
        return {
          bg: "linear-gradient(135deg,#ff0000,#cc0000)",
          svg: '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg>'
        };
      }
      if (key.includes("instagram") || key.includes("انستغرام") || key.includes("إنستغرام")) {
        return {
          bg: "linear-gradient(135deg,#f09433,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888)",
          svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>'
        };
      }
      if (key.includes("telegram") || key.includes("تيليجرام") || key.includes("تليجرام")) {
        return {
          bg: "linear-gradient(135deg,#2AABEE,#229ED9)",
          svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 3.6a1.4 1.4 0 0 0-1.5-.2L2.7 10.2c-1 .4-.9 1.8.1 2.1l4.4 1.4 1.7 5.2c.3.9 1.4 1.1 2 .5l2.5-2.5 4.7 3.4c.8.6 2 .1 2.2-.9l3-14.2c.1-.7-.2-1.3-.4-1.6zM9.4 13.4l8.8-5.5-6.9 6.7-.3 3-1.2-3.7-2.6-.8 2.2.3z"/></svg>'
        };
      }
      if (key.includes("whatsapp") || key.includes("واتساب")) {
        return {
          bg: "linear-gradient(135deg,#25D366,#128C7E)",
          svg: '<svg width="25" height="25" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.3 4.8 4.9-1.3a9.9 9.9 0 1 0 4.9-18.5zm5.8 13.9c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.5-.2-1.1-.4-1.9-.7-3.3-1.4-5.4-4.7-5.6-5-.2-.2-1.3-1.8-1.3-3.4s.8-2.4 1.1-2.7c.3-.3.6-.4.8-.4h.6c.2 0 .5-.1.7.5.3.7.9 2.3 1 2.5.1.2.1.4 0 .6-.1.2-.2.4-.4.6-.2.2-.4.4-.5.6-.2.2-.4.4-.2.8.2.4 1 1.6 2.1 2.6 1.4 1.3 2.6 1.7 3 1.9.4.2.6.1.8-.1.2-.2 1-1.1 1.2-1.5.3-.4.5-.3.9-.2.4.1 2.3 1.1 2.7 1.3.4.2.7.3.8.5.1.1.1.8-.1 1.5z"/></svg>'
        };
      }
      if (key.includes("tiktok") || key.includes("تيك توك")) {
        return {
          bg: "linear-gradient(135deg,#0f172a,#fe2c55 55%,#25f4ee)",
          svg: '<svg width="23" height="23" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>'
        };
      }
      if (key.includes("facebook") || key.includes("فيسبوك")) {
        return {
          bg: "linear-gradient(135deg,#1877F2,#0d5bd6)",
          svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/></svg>'
        };
      }
      if (key.includes("snapchat") || key.includes("سناب")) {
        return {
          bg: "linear-gradient(135deg,#FFFC00,#f59e0b)",
          color: "#0f172a",
          svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.2 2c-3.1 0-5.4 2.1-5.4 5.5v1.6c-.4-.1-.8-.2-1.2-.1-.6.1-1 .6-.9 1.2.1.6.7 1 1.4 1.2-.2 1.2-1 2.7-3 3.4-.5.2-.7.7-.5 1.1.3.7 1.5 1 2.7 1.2.1.4.2.9.4 1.1.2.3.7.3 1.3.2.7-.1 1.5-.1 2.3.3.8.4 1.6.9 2.9.9s2.1-.5 2.9-.9c.8-.4 1.6-.4 2.3-.3.6.1 1.1.1 1.3-.2.2-.2.3-.7.4-1.1 1.2-.2 2.4-.5 2.7-1.2.2-.4 0-.9-.5-1.1-2-.7-2.8-2.2-3-3.4.7-.2 1.3-.6 1.4-1.2.1-.6-.3-1.1-.9-1.2-.4-.1-.8 0-1.2.1V7.5C17.6 4.1 15.3 2 12.2 2z"/></svg>'
        };
      }
      return {
        bg: "linear-gradient(135deg,#0ea5e9,#6366f1)",
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
      };
    }

    function renderSocial() {
      const links = appState.links || [];
      const html = links.map(l => {
        const hasUrl = l.u && l.u.trim() !== "";
        const st = eduSocialSvgAndStyle(l);
        return `
          <a href="${escapeHtml(safeUrl(l.u))}" target="_blank" rel="noopener" class="edu-social-card group flex flex-col items-center p-4 rounded-2xl glass-card border border-slate-200/90 dark:border-slate-800 hover:border-brand-500 text-center ${hasUrl ? '' : 'opacity-60'}">
            <div class="edu-social-ico-box" style="background:${l.customImg ? 'transparent' : st.bg};${st.color ? 'color:' + st.color + ';' : ''}overflow:hidden;">
              ${l.customImg
                ? `<img src="${escapeHtml(l.customImg)}" alt="${escapeHtml(l.n)}" class="w-full h-full object-cover rounded-2xl">`
                : (l.customEmoji ? `<span style="font-size:26px;line-height:1;">${escapeHtml(l.customEmoji)}</span>` : st.svg)}
            </div>
            <span class="font-extrabold text-xs text-slate-800 dark:text-slate-100">${escapeHtml(l.n)}</span>
            <span class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-full">${escapeHtml(l.handle || "تابعنا")}</span>
          </a>
        `;
      }).join("");

      document.getElementById("socialGrid").innerHTML = html;
    }

    // Render Static Content
    function renderStaticTexts() {
      document.getElementById("heroNameText").textContent = appState.name;
      document.getElementById("heroTagText").textContent = appState.tag;
      document.getElementById("heroMgrText").textContent = appState.mgr;
      document.getElementById("mgrCardName").textContent = appState.mgr;

      // About Text
      const aboutLines = (appState.about || "").split("\n").filter(Boolean);
      const aboutHtml = aboutLines.map(p => `<p>${escapeHtml(p)}</p>`).join("");
      document.getElementById("aboutContentText").innerHTML = aboutHtml;
    }

    // Render Announcement Banner
    function renderAnnouncementBanner() {
      ensurePlatformGovernanceState();
      const banner = document.getElementById("announcementBanner");
      const badgeEl = document.getElementById("annBadgeText");
      const bodyEl = document.getElementById("annBodyText");
      const linkEl = document.getElementById("annActionLink");
      const editBtn = document.getElementById("btnAdminEditAnn");

      if (!banner) return;
      let hiddenBySession = false;
      try { hiddenBySession = sessionStorage.getItem("edutech_ann_hidden") === "true"; } catch (e) {}
      const ann = appState.announcement || {};
      if ((ann.enabled === false || hiddenBySession) && !isSuperAdminUser()) {
        banner.classList.add("hidden");
        return;
      }
      banner.classList.remove("hidden");
      if (badgeEl) badgeEl.textContent = ann.badge || "📢 تعميم الإدارة";
      if (bodyEl) bodyEl.textContent = ann.text || "";
      if (linkEl) {
        linkEl.href = safeUrl(ann.link || "#edtechLabSection");
        linkEl.textContent = ann.btnLabel || "التفاصيل";
      }
      if (editBtn) {
        if (isSuperAdminUser()) editBtn.classList.remove("hidden");
        else editBtn.classList.add("hidden");
      }
    }

    // Admin & Role-Based UI Control
    function updateAdminUI() {
      ensurePlatformGovernanceState();
      const label = document.getElementById("adminToggleLabel");
      const indicator = document.getElementById("adminIndicator");
      const heroAdd = document.getElementById("btnHeroAdd");
      const barText = document.getElementById("barAdminText");
      const barSettingsBtn = document.getElementById("btnBarSettings");
      const barAddBtn = document.getElementById("btnBarAdd");
      const rolePillTitle = document.getElementById("rolePillTitle");
      const rolePillIcon = document.getElementById("rolePillIcon");

      const effRole = getEffectiveAccessRole();

      if (rolePillTitle && rolePillIcon) {
        rolePillTitle.textContent = getRoleArabicLabel(effRole);
        if (effRole === "super_admin") {
          if (rolePillIcon) rolePillIcon.className = "fa-solid fa-crown text-amber-500 text-sm";
        } else if (effRole === "moderator") {
          if (rolePillIcon) rolePillIcon.className = "fa-solid fa-user-shield text-emerald-500 text-sm";
        } else {
          if (rolePillIcon) rolePillIcon.className = "fa-solid fa-user-graduate text-brand-500 text-sm";
        }
      }

      if (effRole === "super_admin") {
        label.textContent = "تخصيص الموقع 👑";
        if (indicator) indicator.className = "w-2 h-2 rounded-full bg-amber-500 animate-pulse";
        heroAdd.classList.remove("hidden");
        barText.textContent = isAdminMode ? "قفل الإدارة" : "لوحة الإدارة";
        if (barSettingsBtn) barSettingsBtn.classList.remove("opacity-60");
        if (barAddBtn) barAddBtn.innerHTML = `<i class="fa-solid fa-plus"></i><span>نشر إداري</span>`;
      } else if (effRole === "moderator") {
        label.textContent = "وضع المشرف 🛡️";
        if (indicator) indicator.className = "w-2 h-2 rounded-full bg-emerald-500";
        heroAdd.classList.remove("hidden");
        barText.textContent = "دخول الإدارة 👑";
        if (barSettingsBtn) barSettingsBtn.classList.add("opacity-60");
        if (barAddBtn) barAddBtn.innerHTML = `<i class="fa-solid fa-plus"></i><span>نشر كمشرف</span>`;
      } else {
        label.textContent = "تخصيص الموقع";
        if (indicator) indicator.className = "w-2 h-2 rounded-full bg-slate-400";
        heroAdd.classList.add("hidden");
        barText.textContent = "تفعيل التعديل";
        if (barSettingsBtn) barSettingsBtn.classList.add("opacity-60");
        if (barAddBtn) barAddBtn.innerHTML = `<i class="fa-solid fa-plus"></i><span>إضافة مورد</span>`;
      }

      if (document.body) {
        document.body.classList.toggle("is-super-admin", effRole === "super_admin");
      }
      if (window.EduHome && typeof window.EduHome.render === "function") {
        try { window.EduHome.render(); } catch (e) {}
      }
      renderAnnouncementBanner();
      renderResources();
      if (!CLOUD_ON && isAdminMode && !adminVisitorPreview) setSaveBadge("local", "⚠ وضع محلي: التعديلات تُحفظ على هذا الجهاز فقط");
      else if (!isAdminMode || adminVisitorPreview) setSaveBadge("saved", "");
    }

    // Modal: بوابة الإدارة (رمز الدخول + التحقق من حساب Google المخوّل)
    function openAdminPinModal(onSuccessCallback) {
      ensurePlatformGovernanceState();
      if (CLOUD_ON && window.Cloud && window.Cloud.isAdmin) { finishAdminUnlock(onSuccessCallback); return; }
      const html = `
        <div class="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-900 text-white">
          <div class="flex items-center gap-2.5">
            <span class="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center text-base font-black">
              <i class="fa-solid fa-shield-halved"></i>
            </span>
            <div>
              <h3 class="text-sm font-black text-white">بوابة الإدارة 👑</h3>
              <p class="text-[11px] text-amber-300">التعديل على الموقع محصور بالإدارة فقط</p>
            </div>
          </div>
          <button type="button" class="btn-close-modal p-2 rounded-xl text-slate-400 hover:text-white" onclick="closeModal()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form id="formAdminPinVerify" class="p-6 space-y-4 text-right">
          <div class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
            <i class="fa-solid fa-lock text-amber-500 ml-1"></i>
            أدخل <strong>رمز دخول الإدارة</strong> لتفعيل التعديل وإضافة الموارد وتغيير إعدادات الموقع.
            ${CLOUD_ON ? `<span class="block mt-1 text-[11px] text-slate-500 dark:text-slate-400">بعد الرمز يتم التحقق من حساب Google الخاص بالإدارة، وتُحفظ جميع تعديلاتك للزوار تلقائياً.</span>` : `<span class="block mt-1 text-[11px] font-bold text-rose-500">تنبيه: الربط السحابي غير مفعّل بعد، فالتعديلات ستُحفظ على هذا الجهاز فقط.</span>`}
          </div>

          <div>
            <label for="inputAdminPinCode" class="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">رمز دخول الإدارة:</label>
            <input id="inputAdminPinCode" type="password" inputmode="numeric" autocomplete="off" dir="ltr" required placeholder="••••" class="w-full text-center tracking-widest font-mono text-lg font-black bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500">
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold" onclick="closeModal()">إلغاء</button>
            <button type="submit" class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-md">تأكيد وتفعيل الإدارة 👑</button>
          </div>
        </form>
      `;

      showModalContent(html);
      setTimeout(() => { const i = document.getElementById("inputAdminPinCode"); if (i) i.focus(); }, 50);

      document.getElementById("formAdminPinVerify").addEventListener("submit", async (e) => {
        e.preventDefault();
        const entered = document.getElementById("inputAdminPinCode").value.trim();
        if (window.EduPin && window.EduPin.lockedMs() > 0) {
          showToast("محاولات كثيرة خاطئة — حاول بعد " + Math.ceil(window.EduPin.lockedMs() / 60000) + " دقيقة 🔒", "warning");
          return;
        }
        let pinOk = false;
        try { pinOk = window.EduPin ? await window.EduPin.verify(entered, ADMIN_PIN_HASH) : false; } catch (err) { /* بيئة غير آمنة: يُرفض الدخول */ }
        if (!pinOk) {
          showToast("رمز الإدارة غير صحيح! 🔒", "warning");
          return;
        }
        closeModal();
        unlockAdminAfterPin(onSuccessCallback);
      });
    }

    function finishAdminUnlock(onSuccess) {
      isAdminMode = true;
      persistAdminFlag();
      addAuditLog("تفعيل وضع الإدارة");
      updateAdminUI();
      fullRender();
      showToast(CLOUD_ON ? "تم التحقق! أي تعديل تقوم به يُحفظ ويظهر للجميع 👑" : "تم تفعيل الإدارة (وضع محلي: الحفظ على هذا الجهاز فقط)", "success");
      if (typeof onSuccess === "function") onSuccess();
    }

    // بعد إدخال الرمز الصحيح: في الوضع السحابي يجب أن يكون الحساب المسجَّل هو حساب الإدارة المعتمد حصراً
    function unlockAdminAfterPin(onSuccess, noPin) {
      if (CLOUD_ON && (!window.Cloud || !window.Cloud.isAdmin)) {
        showToast("يرجى تسجيل الدخول بحساب Google المعتمد للإدارة أولاً 🔒", "warning");
        if (window.Cloud && typeof window.Cloud.signIn === "function") {
          window.Cloud.signIn().then(() => {
            if (window.Cloud && window.Cloud.isAdmin) {
              try { localStorage.setItem("edu_admin_portal_unlocked_v136", "1"); } catch (e) {}
              finishAdminUnlock(onSuccess);
              if (window.EduMasterHierarchy && typeof window.EduMasterHierarchy.syncAdminState === "function") {
                window.EduMasterHierarchy.syncAdminState(true);
              }
              window.dispatchEvent(new Event("edu:admin-state-changed"));
            } else {
              showToast("هذا الحساب غير مخوّل بصلاحيات الإدارة 🔒", "error");
            }
          }).catch(() => {});
        }
        return;
      }
      try { localStorage.setItem("edu_admin_portal_unlocked_v136", "1"); } catch (e) {}
      finishAdminUnlock(onSuccess);
      if (window.EduMasterHierarchy && typeof window.EduMasterHierarchy.syncAdminState === "function") {
        window.EduMasterHierarchy.syncAdminState(true);
      }
      window.dispatchEvent(new Event("edu:admin-state-changed"));
    }

    // فتح لوحة تخصيص الموقع / تفعيل وضع الإدارة
    function toggleAdminMode() {
      if (isSuperAdminUser()) {
        isAdminMode = true;
        persistAdminFlag();
        updateAdminUI();
        fullRender();
        if (window.EduHome && window.EduHome.openAdmin) {
          window.EduHome.openAdmin("identity");
        } else if (window.openSiteManager) {
          window.openSiteManager("theme");
        }
        return;
      }
      openAdminPinModal(() => {
        if (window.EduHome && window.EduHome.openAdmin) {
          window.EduHome.openAdmin("identity");
        }
      });
    }

    // Full Re-Render
    function fullRender() {
      syncItemsWithCurrentUser();
      renderStaticTexts();
      renderUserWorkspace();
      renderStats();
      renderResources();
      renderSocial();
      if (window.renderExtras) window.renderExtras();
    }

    // Prompt Generator Implementation
    function generatePedagogicalPrompt() {
      const grade = document.getElementById("genGrade").value;
      const subject = document.getElementById("genSubject").value;
      const goal = document.getElementById("genGoal").value;
      const aiModel = document.getElementById("genAIModel").value;
      const strategyEl = document.getElementById("genStrategy");
      const durationEl = document.getElementById("genDuration");
      const contextEl = document.getElementById("genContextNote");
      const strategy = strategyEl ? strategyEl.value : "التعلم النشط";
      const duration = durationEl ? durationEl.value : "45 دقيقة";
      const customContext = (contextEl && contextEl.value.trim()) ? contextEl.value.trim() : "مراعاة الفروق الفردية والبيئة الصفية التفاعلية";
      const topic = document.getElementById("genTopic").value.trim() || "الدرس المختار";
      const user = getCurrentUser();
      const teacherLine = user ? `- إعداد المعلم/التربوي: ${user.name} (${user.school || 'فلسطين'})\n` : "";

      const prompt = `أنت خبير تربوي ومستشار متقدم في تكنولوجيا التعليم والذكاء الاصطناعي في مبادرة "EduTech Mindset".
مهمتك: صياغة ${goal} عالية الجودة ومبتكرة، وفق المعطيات التالية:

📌 السياق التعليمي:
${teacherLine}- المرحلة الدراسية: ${grade}
- المادة والمجال: ${subject}
- موضوع الدرس: "${topic}"
- استراتيجية التدريس المعتمدة: ${strategy}
- الزمن المخصص: ${duration}
- سياق الصف والطلبة: ${customContext}
- نموذج الذكاء الاصطناعي المستهدف: ${aiModel}

🎯 المتطلبات والشروط الدقيقة:
1. التدرج البيداغوجي: مراعاة الفروق الفردية ومستويات الطلبة بأسلوب مشوق ومحفز للدافعية وفق استراتيجية (${strategy}).
2. استراتيجية التعلم النشط: دمج أفكار تطبيقية وأنشطة رقمية تفاعلية (مثل استخدام ألعاب صفية، محاكاة، وعصف ذهني).
3. ربط المفهوم بالواقع: إعطاء أمثلة ملموسة تحاكي حياة الطلبة وتطبيقات العلم في العالم الحقيقي.
4. مخرجات واضحة وقابلة للتنفيذ ضمن (${duration}):
   - مقدمة وكسر جليد (3-5 دقائق)
   - الأهداف التعليمية السلوكية المحددة
   - الأنشطة الصفية خطوة بخطوة مع دور كل من المعلم والمتعلم
   - أدوات تقييم تكويني وملاحظات تحسينية
5. أسلوب الصياغة: لغة عربية فصحى سليمة، منظمة في جداول ونقاط واضحة جاهزة للطباعة والتنفيذ مباشرة في الحصة.`;

      document.getElementById("promptOutputText").textContent = prompt;
      document.getElementById("promptCharCount").textContent = prompt.length + " حرف";
      return prompt;
    }

    // Copy to Clipboard Utility
    function copyTextToClipboard(text, successMsg) {
      const msg = successMsg || "تم النسخ بنجاح 📋";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          showToast(msg, "success");
        }).catch(() => {
          fallbackCopyText(text, msg);
        });
      } else {
        fallbackCopyText(text, msg);
      }
    }

    function fallbackCopyText(text, successMsg) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        showToast(successMsg, "success");
      } catch (err) {
        showToast("تعذر النسخ التلقائي، يمكنك تحديده يدويًا", "warning");
      }
    }

    // Modal Helpers
    function closeModal() {
      const modalContainer = document.getElementById("modalContainer");
      modalContainer.classList.add("hidden");
      document.documentElement.classList.remove("modal-open");
      document.getElementById("modalBox").innerHTML = "";
    }

    function showModalContent(html) {
      const modalContainer = document.getElementById("modalContainer");
      const dragPill = `<div class="w-full pt-2 pb-0.5 bg-slate-50 dark:bg-slate-800/60 flex justify-center shrink-0 cursor-pointer" onclick="closeModal()"><span class="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span></div>`;
      document.getElementById("modalBox").innerHTML = dragPill + html;
      modalContainer.classList.remove("hidden");
      document.documentElement.classList.add("modal-open");
    }

    // نقطة الدخول الموحّدة لكل أزرار "تسجيل الدخول / الملف الشخصي" (الإصدار 138 المطور)
    function openGoogleAuthModal() {
      if (!getCurrentUser()) {
        openUnifiedAuthModal();
        return;
      }
      openProfileModal();
    }

    function openUnifiedAuthModal() {
      const regUsers = (window.EduAccessControl && typeof window.EduAccessControl.getRegisteredUsers === "function")
        ? window.EduAccessControl.getRegisteredUsers()
        : [];
      const isWebView = !!(window.Cloud && window.Cloud.isEmbeddedWebView && window.Cloud.isEmbeddedWebView());
      const html = `
        <div class="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-gradient-to-l from-slate-950 via-indigo-950 to-slate-900 text-white" dir="rtl">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-xl">🔐</div>
            <div>
              <h3 class="text-sm sm:text-base font-black text-white">بوابة الدخول الموحدة الذكية — EduTech Mindset</h3>
              <p class="text-[11px] text-sky-300">دخول عبر Google • بريد وكلمة مرور • كود تفعيل • دخول آمن ومشفّر</p>
            </div>
          </div>
          <button type="button" class="btn-close-modal p-2 rounded-xl text-slate-300 hover:text-white" onclick="closeModal()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="p-5 overflow-y-auto space-y-4 text-right text-xs" dir="rtl">
          <!-- 1. Google Sign-In Section -->
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="font-black text-slate-900 dark:text-white">🌐 1. الدخول السحابي الموثّق عبر حساب Google:</span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 text-[10px] font-black">مزامنة بين جميع أجهزتك ☁️</span>
            </div>
            ${isWebView ? `<div class="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[11px] font-bold text-amber-800 dark:text-amber-300">📱 تتصفح من داخل تطبيق مدمج: إن لم تفتح نافذة Google المنبثقة، اضغط «تحويل مباشر للهاتف» أو سجل دخولك بالبريد/الكود أدناه.</div>` : ""}
            <div class="flex flex-wrap gap-2">
              <button type="button" id="btnModalGooglePopup" class="flex-1 py-2.5 px-4 rounded-xl bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-600 font-black shadow-sm flex items-center justify-center gap-2 transition">
                <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"/>
                  <path fill="#FBBC05" d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z"/>
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5L1.6 16c1.9 3.9 5.8 7 10.4 7z"/>
                </svg>
                <span>متابعة بحساب Google</span>
              </button>
              <button type="button" id="btnModalGoogleRedirect" class="py-2.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-100 font-bold text-[11px]" title="استخدم هذا الخيار على متصفحات الهواتف التي تحجب النوافذ المنبثقة">
                📱 تحويل مباشر للهاتف
              </button>
            </div>
          </div>

          <!-- 2. Direct Email / Username / Admin Login -->
          <form id="formModalDirectLogin" class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div class="font-black text-sky-700 dark:text-sky-300">🔑 2. الدخول المباشر بالبريد أو اسم المستخدم (أو حساب الإدارة):</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input id="inpModalLoginEmail" type="text" dir="ltr" required placeholder="البريد أو اسم المستخدم (مثال: sara.teacher@edutech.ps)" class="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 font-bold text-slate-900 dark:text-white"/>
              <div class="relative flex items-center">
                <input id="inpModalLoginPass" type="password" required placeholder="كلمة المرور أو رمز الإدارة..." class="w-full px-3 py-2.5 pl-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 font-bold text-slate-900 dark:text-white"/>
                <button type="button" id="btnModalTogglePass" class="absolute left-2.5 text-slate-400 hover:text-sky-500 text-xs font-black" title="إظهار / إخفاء كلمة المرور">👁️</button>
              </div>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button type="submit" class="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black shadow">🚀 تسجيل الدخول الآن</button>
              <button type="button" id="btnModalGoRegister" class="py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black">📝 إنشاء حساب جديد</button>
            </div>
          </form>

          <!-- 3. Password Reset & Real Registration Note -->
          <div class="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/25 flex flex-wrap items-center justify-between gap-2">
            <span class="text-[11px] font-bold text-slate-600 dark:text-slate-300">🔐 التسجيل مجاني ومطلوب لحماية الباقة المجانية وحفظ أعمالك سحابيًا.</span>
            <button type="button" id="btnModalResetPass" class="text-[11px] font-black text-sky-600 dark:text-sky-400 hover:underline">نسيت كلمة المرور؟</button>
          </div>
        </div>
      `;
      showModalContent(html);

      const gPop = document.getElementById("btnModalGooglePopup");
      if (gPop) gPop.addEventListener("click", () => startGoogleSignIn(false));
      const gRed = document.getElementById("btnModalGoogleRedirect");
      if (gRed) gRed.addEventListener("click", () => startGoogleSignIn(true));

      const togPass = document.getElementById("btnModalTogglePass");
      if (togPass) {
        togPass.addEventListener("click", () => {
          const p = document.getElementById("inpModalLoginPass");
          if (p) p.type = p.type === "password" ? "text" : "password";
        });
      }

      const formLogin = document.getElementById("formModalDirectLogin");
      if (formLogin) {
        formLogin.addEventListener("submit", (e) => {
          e.preventDefault();
          const em = (document.getElementById("inpModalLoginEmail").value || "").trim();
          const ps = (document.getElementById("inpModalLoginPass").value || "");
          if (window.Cloud && typeof window.Cloud.signInEmail === "function") {
            showToast("⏳ جارٍ التحقق من بيانات الدخول...", "info");
            window.Cloud.signInEmail(em, ps).then(function () {
              closeModal();
              showToast("أهلًا بك! تم تسجيل دخولك بنجاح ✅", "success");
              setTimeout(function () { try { fullRender(); } catch (_) {} }, 200);
            }).catch(function (err) {
              var msg = (err && err.message) || "تأكد من صحة البريد وكلمة المرور";
              if (err && (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential")) msg = "بيانات الدخول غير صحيحة أو الحساب غير مسجّل بعد.";
              else if (err && err.code === "auth/wrong-password") msg = "كلمة المرور غير صحيحة.";
              showToast("❌ " + msg, "error");
            });
          } else if (window.EduAccessControl && typeof window.EduAccessControl.loginDirect === "function") {
            const ok = window.EduAccessControl.loginDirect(em, ps);
            if (ok) { closeModal(); fullRender(); }
          }
        });
      }

      const goReg = document.getElementById("btnModalGoRegister");
      if (goReg) {
        goReg.addEventListener("click", () => {
          const em = (document.getElementById("inpModalLoginEmail").value || "").trim();
          const ps = (document.getElementById("inpModalLoginPass").value || "");
          if (em && ps.length >= 6 && window.Cloud && typeof window.Cloud.signUpEmail === "function") {
            const nameGuess = em.split("@")[0];
            showToast("⏳ جارٍ إنشاء حسابك الجديد...", "info");
            window.Cloud.signUpEmail(em, ps, nameGuess).then(function () {
              closeModal();
              showToast("🎉 تم إنشاء حسابك بنجاح! تفقد بريدك لتأكيد الحساب.", "success");
              setTimeout(function () { try { fullRender(); } catch (_) {} }, 250);
            }).catch(function (err) {
              var m = (err && err.message) || "تعذّر إنشاء الحساب";
              if (err && err.code === "auth/email-already-in-use") m = "هذا البريد مسجّل مسبقًا — اضغط «تسجيل الدخول الآن».";
              else if (err && err.code === "auth/weak-password") m = "كلمة المرور يجب أن تكون 6 أحرف على الأقل.";
              else if (err && err.code === "auth/operation-not-allowed") m = "فعّل خيار Email/Password من Firebase Console أولاً أو ادخل بحساب Google.";
              showToast("❌ " + m, "error");
            });
            return;
          }
          if (window.EduEmailAuth && typeof window.EduEmailAuth.open === "function") {
            closeModal();
            window.EduEmailAuth.open("up");
          } else {
            showToast("أدخل بريدًا صحيحًا وكلمة مرور من 6 أحرف على الأقل ثم اضغط «إنشاء حساب جديد»", "info");
          }
        });
      }
      const rstBtn = document.getElementById("btnModalResetPass");
      if (rstBtn) {
        rstBtn.addEventListener("click", () => {
          const em = (document.getElementById("inpModalLoginEmail").value || "").trim();
          if (!em || !em.includes("@")) { showToast("اكتب بريدك الإلكتروني في الحقل أولاً ثم اضغط نسيت كلمة المرور", "warn"); return; }
          if (window.Cloud && typeof window.Cloud.resetPassword === "function") {
            window.Cloud.resetPassword(em).then(function () {
              showToast("📩 تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني", "success");
            }).catch(function () { showToast("تعذّر إرسال رابط الاستعادة، تأكد من البريد", "error"); });
          }
        });
      }

      const openFullAcc = document.getElementById("btnModalOpenFullAccountPage");
      if (openFullAcc) {
        openFullAcc.addEventListener("click", () => {
          closeModal();
          if (window.EduMasterHierarchy && typeof window.EduMasterHierarchy.openNav === "function") {
            window.EduMasterHierarchy.openNav("account");
          }
        });
      }

      document.querySelectorAll("[data-modal-quickuser]").forEach(btn => {
        btn.addEventListener("click", () => {
          const em = btn.getAttribute("data-modal-quickuser");
          if (window.EduAccessControl && typeof window.EduAccessControl.quickLoginEmail === "function") {
            if (window.EduAccessControl.quickLoginEmail(em)) {
              closeModal();
              fullRender();
            }
          }
        });
      });
    }

    // Modal: الربط السحابي غير مفعّل
    function openCloudSetupModal() {
      showModalContent(`
        <div class="p-6 text-center space-y-4">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl">
            <i class="fa-solid fa-cloud"></i>
          </div>
          <div>
            <h3 class="text-base font-extrabold text-slate-800 dark:text-slate-100 mb-1">تسجيل الدخول غير مفعّل بعد</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              لم يُربط الموقع بقاعدة البيانات (Firebase) بعد. تُفعَّل الميزة بإدخال إعدادات المشروع في ملف
              <span dir="ltr" class="font-mono">firebase-config.js</span> كما في «دليل التشغيل».
            </p>
          </div>
          <button type="button" class="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold" onclick="closeModal()">حسناً</button>
        </div>
      `);
    }

    // Modal: الملف الشخصي للمستخدم المسجَّل
    function openProfileModal() {
      const u = getCurrentUser();
      if (!u) return;
      const html = `
        <div class="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs">
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"/>
                <path fill="#FBBC05" d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z"/>
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5L1.6 16c1.9 3.9 5.8 7 10.4 7z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-black text-slate-900 dark:text-white">ملفي الشخصي</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">بياناتك وإنجازاتك محفوظة في حسابك وتظهر لك على أي جهاز</p>
            </div>
          </div>
          <button type="button" class="btn-close-modal p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white" onclick="closeModal()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form id="formProfileEdit" class="p-6 overflow-y-auto space-y-4 text-right">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label for="gAuthName" class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الاسم الظاهر *</label>
              <input id="gAuthName" type="text" required value="${escapeHtml(u.name)}" class="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">حساب Google</label>
              <div dir="ltr" class="w-full text-xs font-mono bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-500 dark:text-slate-400 text-left truncate">${escapeHtml(u.email)}</div>
            </div>
            <div>
              <label for="gAuthRole" class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الصفة التربوية / الأكاديمية</label>
              <select id="gAuthRole" class="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-100">
                ${["معلم / معلمة", "مشرف تربوي ومدرب تكنولوجيا التعليم", "طالب / طالبة", "مدير مدرسة / قائد تربوي", "باحث أكاديمي"].concat(
                  ["معلم / معلمة", "مشرف تربوي ومدرب تكنولوجيا التعليم", "طالب / طالبة", "مدير مدرسة / قائد تربوي", "باحث أكاديمي"].includes(u.role) ? [] : [u.role]
                ).map(r => `<option value="${escapeHtml(r)}" ${u.role === r ? "selected" : ""}>${escapeHtml(r)}</option>`).join("")}
              </select>
            </div>
            <div>
              <label for="gAuthSubject" class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">التخصص أو المادة الأساسية</label>
              <select id="gAuthSubject" class="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-100">
                ${window.subjectsOptions ? window.subjectsOptions(u.subject) : ""}
              </select>
            </div>
            <div>
              <label for="gAuthGrade" class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المرحلة الدراسية المفضلة</label>
              <select id="gAuthGrade" class="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-100">
                ${window.stagesOptions ? window.stagesOptions(u.grade) : ""}
              </select>
            </div>
            <div>
              <label for="gAuthSchool" class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المدرسة / المؤسسة التعليمية</label>
              <input id="gAuthSchool" type="text" value="${escapeHtml(u.school)}" placeholder="مثال: مديرية التربية والتعليم - خان يونس" class="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-100">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">لون الشارة الرمزية للحساب</label>
            <div class="flex items-center gap-2" id="avatarColorPicker">
              ${["bg-brand-600", "bg-emerald-600", "bg-amber-600", "bg-rose-600", "bg-purple-600"].map(c => `
                <button type="button" class="btn-avatar-color w-8 h-8 rounded-xl ${c} text-white flex items-center justify-center ${u.avatarColor === c ? "ring-2 ring-offset-2 ring-brand-500" : ""}" data-color="${c}">${u.avatarColor === c ? '<i class="fa-solid fa-check text-xs"></i>' : ""}</button>
              `).join("")}
              <input type="hidden" id="gAuthAvatarColor" value="${escapeHtml(u.avatarColor || "bg-brand-600")}">
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div class="flex items-center gap-1.5">
              <button id="btnProfileLogout" type="button" class="px-3.5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5">
                <i class="fa-solid fa-right-from-bracket"></i><span>تسجيل الخروج</span>
              </button>
              <button id="btnProfileDeleteAccount" type="button" class="px-3 py-2.5 rounded-xl bg-rose-600/10 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-500/30 text-[11px] font-extrabold flex items-center gap-1 transition" title="حذف الحساب وجميع البيانات نهائياً">
                <i class="fa-solid fa-user-xmark"></i><span>حذف حسابي وبياناتي</span>
              </button>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" class="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold" onclick="closeModal()">إغلاق</button>
              <button type="submit" class="px-6 py-2.5 rounded-xl bg-gradient-to-l from-brand-600 to-sky-500 text-white text-xs font-extrabold shadow-md">حفظ بياناتي</button>
            </div>
          </div>
        </form>
      `;
      showModalContent(html);

      document.querySelectorAll(".btn-avatar-color").forEach(btn => {
        btn.addEventListener("click", () => {
          document.getElementById("gAuthAvatarColor").value = btn.dataset.color;
          document.querySelectorAll(".btn-avatar-color").forEach(b => { b.classList.remove("ring-2", "ring-offset-2", "ring-brand-500"); b.innerHTML = ""; });
          btn.classList.add("ring-2", "ring-offset-2", "ring-brand-500");
          btn.innerHTML = `<i class="fa-solid fa-check text-xs"></i>`;
        });
      });

      document.getElementById("btnProfileLogout").addEventListener("click", () => { closeModal(); logoutCurrentUser(); });
      const btnDelAcc = document.getElementById("btnProfileDeleteAccount");
      if (btnDelAcc) {
        btnDelAcc.addEventListener("click", () => {
          if (!window.eduConfirm("تأكيد نهائي: هل أنت متأكد من حذف حسابك وجميع بياناتك المحفوظة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.")) return;
          const uid = u && u.uid;
          closeModal();
          const finishDelete = () => {
            try { localStorage.clear(); } catch (e) {}
            currentUserEmail = null;
            usersDb = {};
            isAdminMode = false;
            updateAdminUI();
            fullRender();
            showToast("تم حذف حسابك وجميع بياناتك نهائياً بنجاح ✓", "info");
          };
          if (CLOUD_ON && uid && window.Cloud && window.Cloud.deleteMyAccount) {
            window.Cloud.deleteMyAccount(uid).then(finishDelete).catch(finishDelete);
          } else {
            finishDelete();
          }
        });
      }

      document.getElementById("formProfileEdit").addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("gAuthName").value.trim();
        if (!name) { showToast("يرجى إدخال الاسم", "warning"); return; }
        u.name = name;
        u.role = document.getElementById("gAuthRole").value;
        u.subject = document.getElementById("gAuthSubject").value;
        u.grade = document.getElementById("gAuthGrade").value;
        u.school = document.getElementById("gAuthSchool").value.trim();
        u.avatarColor = document.getElementById("gAuthAvatarColor").value;
        logActivity("حدّثت بيانات ملفك الشخصي");
        saveState();
        fullRender();
        generatePedagogicalPrompt();
        closeModal();
        showToast("تم حفظ بيانات ملفك الشخصي ✓", "success");
      });
    }

    function logoutCurrentUser() {
      const doOut = () => {
        currentUserEmail = null;
        usersDb = {};
        isAdminMode = false;
        try {
          localStorage.removeItem("edu_current_user_v135");
          localStorage.removeItem("edu_admin_portal_unlocked_v136");
          localStorage.removeItem("edu_admin_portal_unlocked_v91");
        } catch (e) {}
        persistAdminFlag();
        if (window.EduMasterHierarchy && typeof window.EduMasterHierarchy.logoutLocal === "function") {
          window.EduMasterHierarchy.logoutLocal();
        }
        updateAdminUI();
        fullRender();
        showToast("تم تسجيل الخروج من حسابك بنجاح", "info");
      };
      if (CLOUD_ON) {
        // نتأكد من تفريغ أي حفظ معلّق قبل الخروج
        clearTimeout(userSyncTimer);
        const u = getCurrentUser();
        const flush = (u && userDirty) ? window.Cloud.saveUser(u.uid, serializeUserForCloud(u)).catch(() => {}) : Promise.resolve();
        flush.then(() => window.Cloud.signOut()).then(doOut).catch(doOut);
      } else {
        doOut();
      }
    }

    // ضغط الصور المرفوعة لتناسب حدّ حجم المستند في Firestore
    function compressImageFile(file, maxDim, maxChars) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("read"));
        reader.onload = () => {
          const img = new Image();
          img.onerror = () => reject(new Error("img"));
          img.onload = () => {
            let dim = maxDim, q = 0.85, out = "";
            for (let guard = 0; guard < 14; guard++) {
              const scale = Math.min(1, dim / Math.max(img.width, img.height));
              const w = Math.max(1, Math.round(img.width * scale));
              const h = Math.max(1, Math.round(img.height * scale));
              const canvas = document.createElement("canvas");
              canvas.width = w; canvas.height = h;
              const ctx = canvas.getContext("2d");
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, w, h);
              ctx.drawImage(img, 0, 0, w, h);
              out = canvas.toDataURL("image/jpeg", q);
              if (out.length <= maxChars) break;
              if (q > 0.5) q -= 0.1; else dim = Math.round(dim * 0.8);
            }
            if (out.length > maxChars) reject(new Error("big")); else resolve(out);
          };
          img.src = reader.result;
        };
        reader.readAsDataURL(file);
      });
    }

    // Modal: Digital Achievement Certificate for Logged-in User
    function openCertificateModal() {
      const user = getCurrentUser();
      if (!user) {
        openGoogleAuthModal();
        return;
      }

      const completedCount = (user.completedItems || []).length;
      const promptsCount = (user.savedPrompts || []).length;
      const rankTitle = getUserRankTitle(user);

      const html = `
        <div class="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center text-sm font-black">
              <i class="fa-solid fa-award"></i>
            </span>
            <h3 class="text-sm font-extrabold text-slate-800 dark:text-slate-100">شهادة التميز والإنجاز الرقمي — EduTech Mindset</h3>
          </div>
          <button type="button" class="btn-close-modal p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white" onclick="closeModal()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="p-6 overflow-y-auto">
          <div id="printableCertificate" class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-brand-900 to-slate-950 text-white border-4 border-amber-400/70 shadow-2xl text-center space-y-4 relative overflow-hidden">
            <div class="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-extrabold">
              <span>مبادرة عقلية التعليم والتكنولوجيا — غزة، فلسطين 🇵🇸</span>
            </div>

            <h2 class="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-amber-300 via-white to-sky-300">
              شهادة إنجاز وتمكين رقمي
            </h2>

            <p class="text-xs sm:text-sm text-sky-200">تشهد منصة <strong>EduTech Mindset</strong> بأنّ:</p>

            <div class="py-2">
              <div class="text-xl sm:text-2xl font-black text-white underline decoration-amber-400 decoration-2 underline-offset-8">${escapeHtml(user.name)}</div>
              <div class="text-xs text-amber-300 font-bold mt-2">${escapeHtml(user.role)} — ${escapeHtml(user.school || "فلسطين")}</div>
              <div class="text-[11px] text-slate-300 font-mono mt-0.5">${escapeHtml(user.email)}</div>
            </div>

            <p class="text-xs sm:text-sm text-slate-200 max-w-lg mx-auto leading-relaxed">
              قد حقق رتبة <strong>(${escapeHtml(rankTitle)})</strong> في توظيف أدوات الذكاء الاصطناعي والتعلم النشط، وأتمّ مراجعة <strong>(${completedCount})</strong> موارد تدريبية وصياغة <strong>(${promptsCount})</strong> برومبتات تعليمية في مجال <strong>${escapeHtml(user.subject)}</strong>.
            </p>

            <div class="pt-5 mt-4 border-t border-white/15 flex items-center justify-between text-xs text-sky-200">
              <div class="text-right">
                <div class="font-extrabold text-white">إشراف واعتماد</div>
                <div>الأستاذ باسل الفقعاوي</div>
              </div>
              <div class="text-left">
                <div class="font-extrabold text-amber-300">EduTech Mindset</div>
                <div>نوفمبر 2026</div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50 dark:bg-slate-800/50">
          <button type="button" class="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold" onclick="closeModal()">إغلاق</button>
          <button id="btnPrintCert" type="button" class="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold shadow-md flex items-center gap-1.5">
            <i class="fa-solid fa-print"></i>
            <span>طباعة</span>
          </button>
          <button id="btnCertWord" type="button" class="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold shadow-md flex items-center gap-1.5"><i class="fa-solid fa-file-word"></i><span>Word</span></button>
          <button id="btnCertPdf" type="button" class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md flex items-center gap-1.5"><i class="fa-solid fa-file-pdf"></i><span>تنزيل PDF</span></button>
        </div>
      `;

      showModalContent(html);

      document.getElementById("btnPrintCert").addEventListener("click", () => {
        window.print();
      });
      const certData = { name: user.name, role: user.role, school: user.school, rank: rankTitle, completed: completedCount, prompts: promptsCount, subject: user.subject };
      document.getElementById("btnCertPdf").addEventListener("click", () => { if (window.Exporter) window.Exporter.certificate(certData, "pdf"); });
      document.getElementById("btnCertWord").addEventListener("click", () => { if (window.Exporter) window.Exporter.certificate(certData, "docx"); });
    }

    // Modal: Open Resource Preview (Upgraded with Per-User Note & Completion Toggle)
    function openResourceModal(itemId) {
      const item = (appState.items || []).find(x => x.id === itemId);
      if (!item) return;

      const meta = TYPE_META[item.type] || TYPE_META.tool;
      const isFav = !!item.isFavorite;
      const isVideo = (item.type === "video");
      const isImage = (item.type === "image");
      const user = getCurrentUser();
      const isCompleted = user ? (user.completedItems || []).includes(item.id) : false;
      const savedNote = (user && user.userNotes && user.userNotes[item.id]) ? user.userNotes[item.id] : "";

      // Extract YouTube embed if applicable
      let mediaPreviewHtml = "";
      if (isVideo && item.url && (item.url.includes("youtube.com") || item.url.includes("youtu.be"))) {
        let videoId = "";
        if (item.url.includes("youtu.be/")) {
          videoId = item.url.split("youtu.be/")[1].split("?")[0];
        } else if (item.url.includes("watch?v=")) {
          videoId = item.url.split("watch?v=")[1].split("&")[0];
        }
        if (videoId) {
          mediaPreviewHtml = `
            <div class="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-inner">
              <iframe class="w-full h-full" src="https://www.youtube-nocookie.com/embed/${escapeHtml(videoId)}" title="${escapeHtml(item.title)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
          `;
        }
      }

      if (!mediaPreviewHtml && isImage && item.url) {
        mediaPreviewHtml = `
          <div class="relative w-full max-h-80 rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center">
            <img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.title)}" class="max-h-80 w-auto object-contain">
          </div>
        `;
      }

      const tagsHtml = (item.tags || []).map(t => `
        <span class="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          #${escapeHtml(t)}
        </span>
      `).join("");

      const html = `
        <!-- Modal Header -->
        <div class="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-xl ${meta.color} text-white flex items-center justify-center text-sm shadow-xs">
              <i class="${meta.icon}"></i>
            </span>
            <span class="text-xs font-extrabold text-slate-700 dark:text-slate-300">${meta.label}</span>
          </div>
          <button type="button" class="btn-close-modal p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-sm" onclick="closeModal()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="p-6 overflow-y-auto space-y-4 text-right">
          
          ${mediaPreviewHtml}

          <div>
            <h3 class="text-xl font-black text-slate-900 dark:text-white leading-tight mb-2">
              ${escapeHtml(item.title)}
            </h3>
            <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-4">
              <span><i class="fa-regular fa-calendar ml-1"></i>${escapeHtml(item.date || "2026")}</span>
              <span><i class="fa-solid fa-thumbs-up ml-1 text-brand-500"></i>${getItemLikes(item)} تفاعل</span>
              ${isCompleted ? `<span class="text-emerald-600 dark:text-emerald-400 font-extrabold"><i class="fa-solid fa-circle-check ml-1"></i>مكتمل في حسابك</span>` : ""}
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
            ${escapeHtml(item.desc)}
          </div>

          <!-- Personal User Note Box (Saved to User's Google Account) -->
          <div class="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/25 space-y-2.5">
            <div class="flex items-center justify-between">
              <label for="modalUserNoteInput" class="text-xs font-extrabold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <i class="fa-solid fa-note-sticky"></i>
                <span>ملاحظاتك التربوية الخاصة على هذا المورد ${user ? `(${escapeHtml(user.name)})` : '(سجّل دخولك بحساب Google للحفظ)'}:</span>
              </label>
            </div>
            <textarea id="modalUserNoteInput" rows="2" placeholder="اكتب فكرتك لتطبيق هذا المورد في حصتك أو النقاط الهامة الخاصة بك..." class="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500">${escapeHtml(savedNote)}</textarea>
            <div class="flex items-center justify-end">
              <button id="btnSaveModalNote" type="button" class="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold shadow-xs transition-all">
                <i class="fa-solid fa-floppy-disk ml-1"></i>حفظ الملاحظة في حسابي
              </button>
            </div>
          </div>

          <!-- Tags List -->
          <div class="flex flex-wrap gap-1.5 pt-2">
            ${tagsHtml}
          </div>

        </div>

        <!-- Modal Footer Actions -->
        <div class="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 bg-slate-50 dark:bg-slate-800/50">
          
          <div class="flex flex-wrap items-center gap-2">
            <!-- Complete Button -->
            <button id="btnModalComplete" type="button" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl ${isCompleted ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'} text-xs font-bold hover:border-emerald-500 transition-all">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              <span>${isCompleted ? 'تم الإنجاز ✓' : 'تحديد كمكتمل'}</span>
            </button>

            <!-- Like Button -->
            <button id="btnModalLike" type="button" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:border-brand-500 transition-all">
              <i class="fa-solid fa-thumbs-up text-brand-500"></i>
              <span>مفيد ومُلهم (${getItemLikes(item)})</span>
            </button>

            <!-- Favorite Button -->
            <button id="btnModalFav" type="button" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 ${isFav ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200'} text-xs font-bold hover:border-rose-500 transition-all">
              <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
              <span>${isFav ? 'في المفضلة' : 'أضف للمفضلة'}</span>
            </button>
          </div>

          <div class="flex items-center gap-2">
            <!-- WhatsApp Share -->
            <button id="btnModalWaShare" type="button" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.01c-.24.68-1.42 1.3-1.96 1.38-.5.08-1.14.11-1.84-.11-.42-.14-.97-.32-1.67-.62-2.94-1.27-4.86-4.23-5.01-4.43-.15-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46.27-.3.59-.37.79-.37h.57c.18 0 .43-.07.67.51.24.59.84 2.04.91 2.19.07.15.12.32.02.52-.1.2-.15.32-.3.49-.15.17-.31.38-.44.51-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.36 1.46.3.15.47.12.64-.07.17-.2.74-.86.94-1.16.2-.3.4-.25.67-.15.27.1 1.72.81 2.02.96.3.15.49.22.57.34.07.12.07.72-.17 1.4z"/></svg>
              <span>واتساب</span>
            </button>

            <!-- External Link -->
            <a href="${escapeHtml(safeUrl(item.url))}" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-l from-brand-600 to-sky-500 hover:from-brand-700 hover:to-sky-600 text-white text-xs font-bold shadow-sm transition-all">
              <span>فتح المورد</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          </div>

        </div>
      `;

      showModalContent(html);

      // Save Note in Modal
      document.getElementById("btnSaveModalNote").addEventListener("click", () => {
        const u = getCurrentUser();
        if (!u) {
          showToast("يرجى تسجيل الدخول بحساب Google أولاً لحفظ ملاحظاتك الخاصة", "info");
          openGoogleAuthModal();
          return;
        }
        const noteVal = document.getElementById("modalUserNoteInput").value.trim();
        if (!u.userNotes) u.userNotes = {};
        if (noteVal) {
          u.userNotes[item.id] = noteVal;
          logActivity("كتبت ملاحظة على: " + item.title);
          showToast("تم حفظ ملاحظتك التربوية في حسابك بنجاح 📝", "success");
        } else {
          delete u.userNotes[item.id];
          logActivity("حذفت ملاحظتك على: " + item.title);
          showToast("تم مسح الملاحظة من حسابك", "info");
        }
        saveState();
        fullRender();
      });

      // Modal Complete Toggle
      document.getElementById("btnModalComplete").addEventListener("click", () => {
        toggleItemCompleted(item.id);
        openResourceModal(item.id);
      });

      // Modal Like
      document.getElementById("btnModalLike").addEventListener("click", () => {
        toggleItemLike(item.id);
        openResourceModal(item.id);
      });

      // Modal Favorite
      document.getElementById("btnModalFav").addEventListener("click", () => {
        toggleItemFavorite(item.id);
        openResourceModal(item.id);
      });

      // Modal WhatsApp Share
      document.getElementById("btnModalWaShare").addEventListener("click", () => {
        const shareText = encodeURIComponent(`مورد تعليمي مميز من منصة EduTech Mindset (غزة 🇵🇸):\n*${item.title}*\n${safeUrl(item.url)}`);
        window.open(`https://api.whatsapp.com/send?text=${shareText}`, "_blank", "noopener,noreferrer");
      });
    }

    function itemTitleById(id) {
      const it = (appState.items || []).find(x => x.id === id);
      return it ? it.title : "";
    }

    // المفضلة (محفوظة في حساب المستخدم)
    function toggleItemFavorite(itemId) {
      const item = (appState.items || []).find(x => x.id === itemId);
      if (!item) return;
      const user = getCurrentUser();
      if (!user) {
        showToast("سجّل دخولك بحساب Google لحفظ المفضلة في حسابك", "info");
        openGoogleAuthModal();
        return;
      }
      if (!Array.isArray(user.favorites)) user.favorites = [];
      const had = user.favorites.includes(itemId);
      if (had) user.favorites = user.favorites.filter(id => id !== itemId);
      else user.favorites.push(itemId);
      logActivity((had ? "أزلت من المفضلة: " : "أضفت إلى المفضلة: ") + item.title);
      saveState();
      fullRender();
      showToast(!had ? "تمت الإضافة للمفضلة الخاصة بك ❤️" : "تمت الإزالة من المفضلة", "info");
    }

    // الإعجاب (مرة واحدة لكل مستخدم، قابلة للإلغاء)
    function toggleItemLike(itemId) {
      const item = (appState.items || []).find(x => x.id === itemId);
      if (!item) return;
      const user = getCurrentUser();
      if (!user) {
        showToast("سجّل دخولك بحساب Google لتسجيل إعجابك", "info");
        openGoogleAuthModal();
        return;
      }
      if (!Array.isArray(user.likedItems)) user.likedItems = [];
      const had = user.likedItems.includes(itemId);
      if (had) user.likedItems = user.likedItems.filter(id => id !== itemId);
      else user.likedItems.push(itemId);
      logActivity((had ? "ألغيت إعجابك بـ: " : "أعجبك المورد: ") + item.title);
      saveState();
      fullRender();
      showToast(had ? "تم إلغاء الإعجاب" : "شكراً لتفاعلك! 👍", "info");
    }

    // الموارد المكتملة (محفوظة في حساب المستخدم)
    function toggleItemCompleted(itemId) {
      const user = getCurrentUser();
      if (!user) {
        showToast("سجّل دخولك بحساب Google لتتبع تقدمك وحفظ الموارد المكتملة", "info");
        openGoogleAuthModal();
        return;
      }
      if (!Array.isArray(user.completedItems)) user.completedItems = [];
      const exists = user.completedItems.includes(itemId);
      if (exists) {
        user.completedItems = user.completedItems.filter(id => id !== itemId);
        logActivity("ألغيت إكمال: " + itemTitleById(itemId));
        showToast("تم إلغاء علامة الإكمال لهذا المورد", "info");
      } else {
        user.completedItems.push(itemId);
        logActivity("أكملت المورد: " + itemTitleById(itemId));
        showToast("أحسنت! تم تسجيل إتمام هذا المورد في حسابك ✓", "success");
      }
      saveState();
      fullRender();
    }

    // Modal: إضافة/تعديل مورد (للإدارة فقط)
    function openAddEditModal(editId) {
      ensurePlatformGovernanceState();
      if (!isModeratorOrAdmin()) {
        showToast("إضافة الموارد وتعديلها من صلاحيات الإدارة والمشرفين فقط 🔒", "warning");
        openAdminPinModal(() => openAddEditModal(editId));
        return;
      }
      const isEditing = Boolean(editId);
      let targetItem = {
        type: "video",
        title: "",
        desc: "",
        url: "",
        thumb: "",
        tags: ["ذكاء اصطناعي", "تعليم تفاعلي"],
        isPinned: false,
        isVerified: true
      };

      if (isEditing) {
        const found = (appState.items || []).find(x => x.id === editId);
        if (!found) return;
        targetItem = JSON.parse(JSON.stringify(found));
      }
      const isDataUrl = (s) => typeof s === "string" && s.startsWith("data:");

      const html = `
        <div class="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center text-sm">
              <i class="fa-solid ${isEditing ? 'fa-pen' : 'fa-plus'}"></i>
            </span>
            <h3 class="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              ${isEditing ? 'تعديل المورد التعليمي' : 'إضافة مورد تعليمي جديد للمكتبة'}
            </h3>
          </div>
          <button type="button" class="btn-close-modal p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white" onclick="closeModal()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form id="formAddEdit" class="p-6 overflow-y-auto space-y-4 text-right">
          <input type="hidden" id="fEditId" value="${isEditing ? escapeHtml(editId) : ''}">

          <div>
            <label for="fType" class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نوع المورد</label>
            <select id="fType" class="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500">
              <option value="video" ${targetItem.type === 'video' ? 'selected' : ''}>🎬 فيديو أو شرح مسجل</option>
              <option value="prompt" ${targetItem.type === 'prompt' ? 'selected' : ''}>💡 برومبت أو صيغة ذكاء اصطناعي</option>
              <option value="tool" ${targetItem.type === 'tool' ? 'selected' : ''}>📎 أداة أو قالب تدريسي</option>
              <option value="image" ${targetItem.type === 'image' ? 'selected' : ''}>🖼️ إنفوجرافيك أو تصميم تعليمي</option>
            </select>
          </div>

          <div>
            <label for="fTitle" class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان المورد *</label>
            <input id="fTitle" type="text" required value="${escapeHtml(targetItem.title)}" placeholder="مثال: ورشة تحضير الدروس بنماذج اللغة الكبيرة..." class="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500">
          </div>

          <div>
            <label for="fDesc" class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الوصف التفصيلي وأهم المخرجات *</label>
            <textarea id="fDesc" rows="3" required placeholder="اكتب نبذة واضحة ومفيدة توضح للمعلم أو الطالب ما سيستفيده من هذا المورد..." class="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500">${escapeHtml(targetItem.desc)}</textarea>
          </div>

          <div>
            <label for="fPromptText" class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نص البرومبت القابل للتنفيذ داخل الموقع (اختياري)</label>
            <textarea id="fPromptText" rows="4" placeholder="مثال: ضع اختباراً من 10 أسئلة متدرجة وفق بلوم حول {topic} للصف {grade} في مادة {subject}" class="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100">${escapeHtml(targetItem.promptText || "")}</textarea>
            <p class="mt-1 text-[10px] text-slate-400">يظهر زر «نفّذ داخل الموقع» للبرومبتات. استخدم {topic} و{grade} و{subject} ليملأها الزائر. وإن تركته فارغاً يُبنى من العنوان والوصف.</p>
          </div>

          <div>
            <label for="fUrl" class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رابط المورد (يوتيوب، ملف درايف، أداة، موقع) أو صورة مرفوعة *</label>
            <input id="fUrl" type="text" dir="ltr" required value="${isDataUrl(targetItem.url) ? '' : escapeHtml(targetItem.url)}" placeholder="${isDataUrl(targetItem.url) ? 'صورة مرفوعة محفوظة — ارفع صورة جديدة لاستبدالها' : 'https://...'}" class="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 text-left" ${isDataUrl(targetItem.url) ? 'data-keep="1"' : ''}>
            <input type="hidden" id="fUrlData" value="${isDataUrl(targetItem.url) ? escapeHtml(targetItem.url) : ''}">
            <label class="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold cursor-pointer">
              <i class="fa-solid fa-image text-emerald-500"></i><span>رفع صورة بدل الرابط (للإنفوجرافيك والتصاميم)</span>
              <input id="fUrlFile" type="file" accept="image/*" class="hidden">
            </label>
            <span id="fUrlFileInfo" class="mr-2 text-[11px] font-bold text-emerald-600">${isDataUrl(targetItem.url) ? '✓ توجد صورة مرفوعة محفوظة' : ''}</span>
            <p class="mt-1 text-[10px] text-slate-400">الملفات الكبيرة (PDF، فيديو، عروض) ارفعها على Google Drive أو YouTube وضع الرابط هنا.</p>
          </div>

          <div>
            <label for="fThumb" class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الصورة المصغرة (اختياري)</label>
            <input id="fThumb" type="text" dir="ltr" value="${isDataUrl(targetItem.thumb) ? '' : escapeHtml(targetItem.thumb)}" placeholder="${isDataUrl(targetItem.thumb) ? 'صورة مصغرة مرفوعة محفوظة' : 'https://... أو اتركه فارغًا لاستخدام تصميم تلقائي'}" class="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 text-left">
            <input type="hidden" id="fThumbData" value="${isDataUrl(targetItem.thumb) ? escapeHtml(targetItem.thumb) : ''}">
            <label class="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold cursor-pointer">
              <i class="fa-solid fa-upload text-brand-500"></i><span>رفع صورة مصغرة من جهازي</span>
              <input id="fThumbFile" type="file" accept="image/*" class="hidden">
            </label>
            <span id="fThumbFileInfo" class="mr-2 text-[11px] font-bold text-emerald-600">${isDataUrl(targetItem.thumb) ? '✓ توجد صورة مصغرة محفوظة' : ''}</span>
          </div>

          <div>
            <label for="fTags" class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الوسوم والكلمات المفتاحية (مفصولة بفواصل)</label>
            <input id="fTags" type="text" value="${escapeHtml((targetItem.tags || []).join(', '))}" placeholder="ذكاء اصطناعي, خطط دروس, تفاعلي..." class="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500">
          </div>

          <div class="${isSuperAdminUser() ? '' : 'hidden '}p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <div class="text-[11px] font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <i class="fa-solid fa-crown"></i>
              <span>خيارات الإدارة:</span>
            </div>
            <div class="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700 dark:text-slate-200">
              <label class="flex items-center gap-2 cursor-pointer">
                <input id="fIsPinned" type="checkbox" class="w-4 h-4 rounded text-amber-500" ${targetItem.isPinned ? 'checked' : ''}>
                <span>📌 تثبيت المورد في صدارة المكتبة</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input id="fIsVerified" type="checkbox" class="w-4 h-4 rounded text-emerald-500" ${targetItem.isVerified !== false ? 'checked' : ''}>
                <span>✅ ختم الاعتماد الرسمي من الإدارة</span>
              </label>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button type="button" class="btn-close-modal px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold" onclick="closeModal()">إلغاء</button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md">${isEditing ? 'حفظ التعديلات' : 'نشر المورد'}</button>
          </div>
        </form>
      `;

      showModalContent(html);

      // رفع الصور مع الضغط التلقائي
      const bindUpload = (fileId, textId, dataId, infoId, maxDim, maxChars) => {
        const fileEl = document.getElementById(fileId);
        fileEl.addEventListener("change", async () => {
          const f = fileEl.files && fileEl.files[0];
          if (!f) return;
          const info = document.getElementById(infoId);
          info.textContent = "⏳ جارٍ معالجة الصورة…";
          try {
            const out = await compressImageFile(f, maxDim, maxChars);
            document.getElementById(dataId).value = out;
            const txt = document.getElementById(textId);
            txt.value = "";
            txt.required = false;
            txt.placeholder = "تم رفع الصورة (" + Math.round(out.length / 1024) + " ك.ب) — اترك الرابط فارغاً";
            info.textContent = "✓ تم رفع الصورة وضغطها (" + Math.round(out.length / 1024) + " ك.ب)";
          } catch (err) {
            info.textContent = "";
            showToast("تعذر معالجة هذه الصورة، جرّب صورة أخرى", "warning");
          }
        });
      };
      bindUpload("fUrlFile", "fUrl", "fUrlData", "fUrlFileInfo", 1400, 520000);
      bindUpload("fThumbFile", "fThumb", "fThumbData", "fThumbFileInfo", 480, 160000);
      if (isDataUrl(targetItem.url)) document.getElementById("fUrl").required = false;

      document.getElementById("formAddEdit").addEventListener("submit", (e) => {
        e.preventDefault();
        if (!isModeratorOrAdmin()) { showToast("لا تملك صلاحية التعديل 🔒", "warning"); return; }
        const adminNow = isSuperAdminUser();
        const editIdVal = document.getElementById("fEditId").value;
        const typeVal = document.getElementById("fType").value;
        const titleVal = document.getElementById("fTitle").value.trim();
        const descVal = document.getElementById("fDesc").value.trim();
        const urlText = document.getElementById("fUrl").value.trim();
        const urlData = document.getElementById("fUrlData").value;
        const thumbText = document.getElementById("fThumb").value.trim();
        const thumbData = document.getElementById("fThumbData").value;
        const urlVal = urlText || urlData;
        const thumbVal = thumbText || thumbData;
        const tagsArr = document.getElementById("fTags").value.split(",").map(s => s.trim()).filter(Boolean);
        const pinChk = document.getElementById("fIsPinned");
        const verChk = document.getElementById("fIsVerified");

        if (!titleVal || !descVal || !urlVal) {
          showToast("يرجى ملء جميع الحقول المطلوبة", "warning");
          return;
        }

        const promptTextVal = (document.getElementById("fPromptText") || { value: "" }).value.trim();
        if (editIdVal) {
          const idx = (appState.items || []).findIndex(x => x.id === editIdVal);
          if (idx !== -1) {
            appState.items[idx] = Object.assign({}, appState.items[idx], {
              type: typeVal,
              title: titleVal,
              desc: descVal,
              url: urlVal,
              thumb: thumbVal,
              promptText: promptTextVal,
              tags: tagsArr.length > 0 ? tagsArr : ["تعليم"],
              isPinned: adminNow ? (pinChk ? pinChk.checked : false) : !!appState.items[idx].isPinned,
              isVerified: adminNow ? (verChk ? verChk.checked : true) : appState.items[idx].isVerified !== false
            });
            addAuditLog(`تعديل المورد: "${titleVal}"`);
            showToast("تم تحديث المورد التعليمي بنجاح ✓", "success");
          }
        } else {
          const u = getCurrentUser();
          const newItem = {
            id: "item-" + Date.now(),
            type: typeVal,
            title: titleVal,
            desc: descVal,
            url: urlVal,
            thumb: thumbVal,
            promptText: promptTextVal,
            tags: tagsArr.length > 0 ? tagsArr : ["جديد", "تعليم"],
            date: new Date().toLocaleDateString("ar-EG", { month: "long", year: "numeric" }),
            likes: 0,
            isPinned: adminNow && pinChk ? pinChk.checked : false,
            isVerified: adminNow ? (verChk ? verChk.checked : true) : false,
            authorEmail: u ? u.email : ADMIN_FALLBACK_EMAIL,
            authorName: u ? u.name : "الإدارة العامة",
            authorRole: adminNow ? "super_admin" : "moderator"
          };
          appState.items.unshift(newItem);
          addAuditLog(`نشر مورد جديد: "${titleVal}"`);
          showToast("تم نشر المورد ✓", "success");
        }

        saveState();
        closeModal();
        fullRender();
      });
    }

    // Modal: Delete Item Confirmation (Strictly Super Admin Only)
    function openDeleteModal(itemId) {
      const item = (appState.items || []).find(x => x.id === itemId);
      if (!item) return;
      if (!canUserDeleteItem(item)) {
        showToast("حذف الموارد محصور بصلاحيات الإدارة العليا فقط 🔒", "warning");
        openAdminPinModal(() => openDeleteModal(itemId));
        return;
      }

      const html = `
        <div class="p-6 text-center space-y-4">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-2xl">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div>
            <h3 class="text-base font-extrabold text-slate-800 dark:text-slate-100 mb-1">تأكيد حذف المورد</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              هل أنت متأكد من رغبتك في حذف: "${escapeHtml(item.title)}"؟ لا يمكن التراجع عن هذا الإجراء بعد الحفظ.
            </p>
          </div>
          <div class="flex items-center justify-center gap-3 pt-2">
            <button type="button" class="btn-close-modal px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold" onclick="closeModal()">إلغاء</button>
            <button id="btnConfirmDelete" type="button" class="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md">حذف نهائي</button>
          </div>
        </div>
      `;

      showModalContent(html);

      document.getElementById("btnConfirmDelete").addEventListener("click", () => {
        appState.items = (appState.items || []).filter(x => x.id !== itemId);
        addAuditLog(`حذف المورد: "${item.title}"`);
        saveState();
        closeModal();
        fullRender();
        showToast("تم حذف المورد بنجاح", "info");
      });
    }

    // Modal: Super Admin Command Center & Site Settings (Strictly Restricted to Super Admin)
    function openSettingsModal() {
      ensurePlatformGovernanceState();
      if (!isSuperAdminUser()) {
        showToast("إعدادات المنصة وإدارة الصلاحيات مخصصة للإدارة العليا فقط 🔒", "warning");
        openAdminPinModal(() => openSettingsModal());
        return;
      }
      if (typeof window.openSiteManager === "function") {
        window.openSiteManager("users");
        return;
      }
      const links = appState.links || [];
      const ann = appState.announcement || {};
      const auditHtml = (appState.auditLog || []).slice(0, 8).map(lg => `
        <div class="flex items-center justify-between gap-2 text-[11px] py-1.5 border-b border-slate-200/60 dark:border-slate-800">
          <span class="font-bold text-slate-700 dark:text-slate-200">${escapeHtml(lg.action)} <em class="text-brand-500 not-italic">(${escapeHtml(lg.actor)})</em></span>
          <span class="text-[10px] text-slate-400 shrink-0">${escapeHtml(lg.time)}</span>
        </div>
      `).join("");
      const linksInputsHtml = links.map((l, idx) => `
        <div class="grid grid-cols-12 gap-2 items-center">
          <div class="col-span-3 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <i class="${escapeHtml(l.i)} ${l.color}"></i>
            <span>${escapeHtml(l.n)}</span>
          </div>
          <div class="col-span-9">
            <input type="text" dir="ltr" id="linkVal_${idx}" value="${escapeHtml(l.u || '')}" placeholder="https://..." class="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-100 text-left">
          </div>
        </div>
      `).join("");

      const html = `
        <div class="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center text-sm">
              <i class="fa-solid fa-gear"></i>
            </span>
            <h3 class="text-sm font-extrabold text-slate-800 dark:text-slate-100">إعدادات المنصة وإدارة البيانات</h3>
          </div>
          <button type="button" class="btn-close-modal p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white" onclick="closeModal()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="p-6 overflow-y-auto space-y-5 text-right">
          
          <!-- General Info -->
          <div class="space-y-3">
            <h4 class="text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-wider">البيانات العامة للمنصة</h4>
            <div>
              <label for="cfgName" class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اسم المنصة الرئيسي</label>
              <input id="cfgName" type="text" value="${escapeHtml(appState.name)}" class="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100">
            </div>
            <div>
              <label for="cfgTag" class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الشعار النصي (Slogan)</label>
              <input id="cfgTag" type="text" value="${escapeHtml(appState.tag)}" class="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100">
            </div>
            <div>
              <label for="cfgMgr" class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الإدارة والإشراف العام</label>
              <input id="cfgMgr" type="text" value="${escapeHtml(appState.mgr)}" class="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100">
            </div>
            <div>
              <label for="cfgAbout" class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نص "من نحن" ورسالة غزة</label>
              <textarea id="cfgAbout" rows="3" class="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100">${escapeHtml(appState.about)}</textarea>
            </div>
          </div>

          <!-- المستخدمون المسجّلون -->
          <div class="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 class="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-solid fa-users"></i>
              <span>المستخدمون المسجّلون (<span id="adminUsersCount">…</span>)</span>
            </h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              كل مستخدم يدخل بحساب Google ويحتفظ ببياناته الخاصة (مفضلة، ملاحظات، برومبتات، مهام، سجل حركات). هذه القائمة للاطلاع فقط، ولا يستطيع أحد غيرك تعديل محتوى الموقع.
            </p>
            <div id="adminRegisteredUsers" class="space-y-2 max-h-56 overflow-y-auto pr-1">
              <div class="text-xs text-slate-500">جارٍ التحميل…</div>
            </div>
          </div>

          <!-- 3. Top Announcement Ticker Settings & Security PIN -->
          <div class="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-wider">شريط التعميمات العاجلة</h4>
              <label class="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                <input id="cfgAnnEnabled" type="checkbox" class="w-4 h-4 rounded text-brand-600" ${ann.enabled !== false ? 'checked' : ''}>
                <span>إظهار شريط الإعلانات</span>
              </label>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label for="cfgAnnBadge" class="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">عنوان الشارة</label>
                <input id="cfgAnnBadge" type="text" value="${escapeHtml(ann.badge || '📢 تعميم الإدارة')}" class="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-1.5">
              </div>
              <div class="sm:col-span-2">
                <label for="cfgAnnText" class="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">نص الإعلان أو الورشة التدريبية</label>
                <input id="cfgAnnText" type="text" value="${escapeHtml(ann.text || '')}" class="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-1.5">
              </div>
            </div>
          </div>

          <!-- Social Links -->
          <div class="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <h4 class="text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-wider">روابط منصات التواصل الاجتماعي</h4>
            <div class="space-y-2">
              ${linksInputsHtml}
            </div>
          </div>

          <!-- Audit Log -->
          <div class="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <h4 class="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">سجل الرقابة والعمليات الإدارية (Audit Log)</h4>
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 max-h-36 overflow-y-auto">
              ${auditHtml}
            </div>
          </div>

          <!-- Backup & Restore -->
          <div class="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <h4 class="text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-wider">النسخ الاحتياطي واستعادة البيانات</h4>
            <div class="flex flex-wrap items-center gap-2">
              <button id="btnExportData" type="button" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold">
                <i class="fa-solid fa-download text-brand-500"></i>
                <span>تصدير ملف (JSON)</span>
              </button>
              
              <label class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer">
                <i class="fa-solid fa-upload text-emerald-500"></i>
                <span>استيراد ملف (JSON)</span>
                <input id="inputImportJson" type="file" accept=".json" class="hidden">
              </label>

              <button id="btnResetDefaultData" type="button" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold mr-auto">
                <i class="fa-solid fa-rotate-left"></i>
                <span>استعادة البيانات الافتراضية</span>
              </button>
            </div>
          </div>

        </div>

        <div class="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50 dark:bg-slate-800/50">
          <button type="button" class="btn-close-modal px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold" onclick="closeModal()">إلغاء</button>
          <button id="btnSaveSettings" type="button" class="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md">حفظ كافة الإعدادات</button>
        </div>
      `;

      showModalContent(html);

      // قائمة المستخدمين المسجّلين (للاطلاع)
      (function loadRegisteredUsers() {
        const box = document.getElementById("adminRegisteredUsers");
        const cnt = document.getElementById("adminUsersCount");
        if (!CLOUD_ON) {
          box.innerHTML = `<div class="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">الربط السحابي غير مفعّل بعد — لا توجد حسابات مسجّلة.</div>`;
          cnt.textContent = "0";
          return;
        }
        window.Cloud.listUsers().then(list => {
          list.sort((a, b) => String(b.lastLoginAt || "").localeCompare(String(a.lastLoginAt || "")));
          cnt.textContent = String(list.length);
          if (!list.length) {
            box.innerHTML = `<div class="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">لا يوجد مستخدمون مسجّلون بعد.</div>`;
            return;
          }
          box.innerHTML = list.map(u => `
            <div class="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-extrabold text-slate-900 dark:text-white truncate">${escapeHtml(u.name || "مستخدم")}</span>
                <span class="text-[10px] text-slate-400 shrink-0">${u.lastLoginAt ? escapeHtml(formatActTime(u.lastLoginAt)) : ""}</span>
              </div>
              <div class="text-[10px] text-slate-500 font-mono truncate" dir="ltr">${escapeHtml(u.email || "")}</div>
              <div class="text-[10px] text-brand-600 dark:text-brand-400 font-bold mt-0.5">
                ${escapeHtml(u.role || "")} • ❤️ ${(u.favorites || []).length} • ✓ ${(u.completedItems || []).length} • 💡 ${(u.savedPrompts || []).length} • 📝 ${Object.keys(u.userNotes || {}).length}
              </div>
            </div>
          `).join("");
        }).catch(() => {
          box.innerHTML = `<div class="p-3 rounded-xl border border-dashed border-rose-300 text-center text-xs text-rose-500">تعذر تحميل قائمة المستخدمين (تحقق من قواعد الأمان وحساب الإدارة).</div>`;
          cnt.textContent = "؟";
        });
      })();

      // Save Settings Handler
      document.getElementById("btnSaveSettings").addEventListener("click", () => {
        appState.name = document.getElementById("cfgName").value.trim() || DEFAULT_DATA.name;
        appState.tag = document.getElementById("cfgTag").value.trim() || DEFAULT_DATA.tag;
        appState.mgr = document.getElementById("cfgMgr").value.trim() || DEFAULT_DATA.mgr;
        appState.about = document.getElementById("cfgAbout").value.trim() || DEFAULT_DATA.about;
        appState.announcement = {
          enabled: document.getElementById("cfgAnnEnabled").checked,
          badge: document.getElementById("cfgAnnBadge").value.trim() || "📢 تعميم الإدارة",
          text: document.getElementById("cfgAnnText").value.trim() || "",
          link: "#edtechLabSection",
          btnLabel: "استكشف المختبر"
        };

        (appState.links || []).forEach((l, idx) => {
          const input = document.getElementById("linkVal_" + idx);
          if (input) l.u = input.value.trim();
        });

        addAuditLog("تحديث الإعدادات العامة للمنصة وسياسة الصلاحيات");
        saveState();
        closeModal();
        fullRender();
        showToast("تم حفظ كافة إعدادات الإدارة وتحديث المنصة بنجاح 👑", "success");
      });

      // Export JSON Handler
      document.getElementById("btnExportData").addEventListener("click", () => {
        try {
          const backupPayload = { appState: appState };
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
          const dlAnchorElem = document.createElement("a");
          dlAnchorElem.setAttribute("href", dataStr);
          dlAnchorElem.setAttribute("download", "edutech_mindset_backup_" + Date.now() + ".json");
          dlAnchorElem.click();
          showToast("تم تصدير ملف النسخة الاحتياطية الشاملة بنجاح 📤", "success");
        } catch (e) {
          showToast("تعذر تصدير الملف", "warning");
        }
      });

      // Import JSON Handler
      document.getElementById("inputImportJson").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target.result);
            if (imported && imported.appState && Array.isArray(imported.appState.items)) {
              appState = Object.assign(deepCopy(DEFAULT_DATA), imported.appState);
              delete appState.adminPin;
              addAuditLog("استيراد نسخة احتياطية للمحتوى");
              saveState();
              closeModal();
              fullRender();
              showToast("تم استيراد البيانات والحسابات بنجاح 📥", "success");
            } else if (imported && Array.isArray(imported.items)) {
              appState = Object.assign(deepCopy(DEFAULT_DATA), imported);
              delete appState.adminPin;
              addAuditLog("استيراد نسخة احتياطية للمحتوى");
              saveState();
              closeModal();
              fullRender();
              showToast("تم استيراد البيانات واسترجاع المنصة بنجاح 📥", "success");
            } else {
              showToast("الملف لا يحتوي على بنية بيانات صالحة", "warning");
            }
          } catch (err) {
            showToast("فشل قراءة ملف JSON", "warning");
          }
        };
        reader.readAsText(file);
      });

      // Reset to Defaults Handler
      document.getElementById("btnResetDefaultData").addEventListener("click", () => {
        if (!window.eduConfirm("سيتم استبدال كل محتوى الموقع بالنسخة الافتراضية للجميع. هل أنت متأكد؟")) return;
        appState = deepCopy(DEFAULT_DATA);
        addAuditLog("استعادة المحتوى الافتراضي");
        saveState();
        closeModal();
        fullRender();
        showToast("تمت استعادة البيانات الافتراضية بنجاح 🔄", "info");
      });
    }


    // =========================================================================
    // FULL MUSIC & AUDIO CONTROL STUDIO (SYNTHESIZER + CUSTOM MP3/URL + EQ)
    // =========================================================================
    const DEFAULT_MUSIC_TRACKS = [
      {
        id: "track-gaza-hope",
        title: "🎶 نبض الأمل من غزة (عزف شرقي دافئ)",
        category: "شرقي ملهم",
        kind: "synth",
        preset: "oriental",
        bpm: 88,
        notes: [220.0, 233.08, 277.18, 293.66, 329.63, 349.23, 415.30, 440.0, 415.30, 349.23, 329.63, 293.66, 277.18, 233.08],
        wave: "triangle"
      },
      {
        id: "track-deep-focus",
        title: "🎹 تركيز عميق للتحضير والقراءة (Lo-Fi Piano)",
        category: "تركيز ومذاكرة",
        kind: "synth",
        preset: "lofi",
        bpm: 72,
        notes: [261.63, 329.63, 392.00, 493.88, 392.00, 329.63, 293.66, 349.23, 440.00, 523.25, 440.00, 349.23],
        wave: "sine"
      },
      {
        id: "track-classroom-game",
        title: "⚡ إيقاع النشاط الصفي والمسابقات التفاعلية",
        category: "ألعاب ومسابقات",
        kind: "synth",
        preset: "upbeat",
        bpm: 128,
        notes: [329.63, 392.00, 440.00, 523.25, 587.33, 523.25, 440.00, 392.00, 349.23, 440.00, 523.25, 659.25],
        wave: "square"
      },
      {
        id: "track-gaza-sea",
        title: "🌊 نسيم بحر غزة وتأمل هادئ (Ambient Calm)",
        category: "استرخاء وهدوء",
        kind: "synth",
        preset: "ocean",
        bpm: 60,
        notes: [196.00, 246.94, 293.66, 392.00, 329.63, 293.66, 246.94, 196.00],
        wave: "sine"
      },
      {
        id: "track-success-symphony",
        title: "🏆 سيمفونية النجاح والتكريم (Orchestral Synth)",
        category: "احتفالي وتحفيزي",
        kind: "synth",
        preset: "symphony",
        bpm: 100,
        notes: [261.63, 329.63, 392.00, 523.25, 659.25, 587.33, 523.25, 392.00, 440.00, 523.25, 659.25, 783.99],
        wave: "triangle"
      }
    ];

    let musicState = {
      tracks: JSON.parse(JSON.stringify(DEFAULT_MUSIC_TRACKS)),
      currentTrackId: "track-gaza-hope",
      isPlaying: false,
      isMuted: false,
      volume: 70,         // 0 - 100
      speed: 1.0,         // 0.5x - 2.0x
      bassGain: 2,        // -12 to +12 dB
      trebleGain: 1,      // -12 to +12 dB
      echoLevel: 25,      // 0 - 100 %
      playMode: "loop-all", // 'loop-all' | 'loop-one' | 'shuffle'
      uiSfxEnabled: true,
      miniPlayerVisible: false,
      timerMinutes: 0,
      timerRemainingSec: 0
    };

    let audioCtx = null;
    let masterGainNode = null;
    let bassFilterNode = null;
    let trebleFilterNode = null;
    let delayNode = null;
    let delayFeedbackNode = null;
    let synthIntervalId = null;
    let synthStepIndex = 0;
    let htmlAudioElement = null;
    let htmlAudioSourceNode = null;
    let musicCountdownTimerId = null;

    function loadMusicPreferences() {
      try {
        const user = getCurrentUser();
        if (user && user.musicPrefs) {
          musicState = Object.assign({}, musicState, user.musicPrefs);
          if (!Array.isArray(musicState.tracks) || musicState.tracks.length === 0) {
            musicState.tracks = JSON.parse(JSON.stringify(DEFAULT_MUSIC_TRACKS));
          }
          // دمج الملفات الصوتية المرفوعة من هذا الجهاز (لا تُرفع للسحابة بسبب حجمها)
          try {
            const local = JSON.parse(localStorage.getItem("edutech_music_settings_v1") || "null");
            if (local && Array.isArray(local.tracks)) {
              local.tracks.forEach(t => {
                if (t && t.url && String(t.url).startsWith("data:") && !musicState.tracks.some(x => x.id === t.id)) musicState.tracks.unshift(t);
              });
            }
          } catch (e2) {}
          musicState.isPlaying = false; // Never auto-play before user gesture
          return;
        }
        const savedGlobalMusic = localStorage.getItem("edutech_music_settings_v1");
        if (savedGlobalMusic) {
          const parsed = JSON.parse(savedGlobalMusic);
          musicState = Object.assign({}, musicState, parsed);
          if (!Array.isArray(musicState.tracks) || musicState.tracks.length === 0) {
            musicState.tracks = JSON.parse(JSON.stringify(DEFAULT_MUSIC_TRACKS));
          }
          musicState.isPlaying = false;
        }
      } catch (e) {}
    }

    function saveMusicPreferences() {
      try {
        const toSave = Object.assign({}, musicState, { isPlaying: false });
        // Avoid storing huge blob URLs that expire across sessions
        toSave.tracks = (musicState.tracks || []).filter(t => !t.isTempBlob && !t.siteShared);
        localStorage.setItem("edutech_music_settings_v1", JSON.stringify(toSave));
        const user = getCurrentUser();
        if (user) {
          user.musicPrefs = JSON.parse(JSON.stringify(toSave));
          saveState();
        }
      } catch (e) {}
    }

    function ensureAudioContext() {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return null;
        audioCtx = new AudioContextClass();

        bassFilterNode = audioCtx.createBiquadFilter();
        bassFilterNode.type = "lowshelf";
        bassFilterNode.frequency.value = 220;

        trebleFilterNode = audioCtx.createBiquadFilter();
        trebleFilterNode.type = "highshelf";
        trebleFilterNode.frequency.value = 3200;

        delayNode = audioCtx.createDelay(2.0);
        delayNode.delayTime.value = 0.28;

        delayFeedbackNode = audioCtx.createGain();
        delayFeedbackNode.gain.value = 0.25;

        masterGainNode = audioCtx.createGain();

        // Routing: bassFilter -> trebleFilter -> masterGain -> destination
        // Plus parallel echo loop on trebleFilter -> delayNode -> delayFeedback -> delayNode -> masterGain
        bassFilterNode.connect(trebleFilterNode);
        trebleFilterNode.connect(masterGainNode);
        trebleFilterNode.connect(delayNode);
        delayNode.connect(delayFeedbackNode);
        delayFeedbackNode.connect(delayNode);
        delayNode.connect(masterGainNode);
        masterGainNode.connect(audioCtx.destination);
      }
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      applyAudioParameters();
      return audioCtx;
    }

    function applyAudioParameters() {
      if (!audioCtx || !masterGainNode) return;
      const effectiveVol = musicState.isMuted ? 0 : (musicState.volume / 100);
      masterGainNode.gain.setTargetAtTime(effectiveVol * 0.45, audioCtx.currentTime, 0.03);
      if (bassFilterNode) bassFilterNode.gain.setTargetAtTime(Number(musicState.bassGain) || 0, audioCtx.currentTime, 0.05);
      if (trebleFilterNode) trebleFilterNode.gain.setTargetAtTime(Number(musicState.trebleGain) || 0, audioCtx.currentTime, 0.05);
      if (delayFeedbackNode) delayFeedbackNode.gain.setTargetAtTime(Math.min(0.75, (Number(musicState.echoLevel) || 0) / 130), audioCtx.currentTime, 0.05);

      if (htmlAudioElement) {
        htmlAudioElement.volume = musicState.isMuted ? 0 : (musicState.volume / 100);
        htmlAudioElement.playbackRate = Number(musicState.speed) || 1.0;
      }
    }

    // Play Subtle Interactive UI Sound Effect
    function playUiSound(kind) {
      if (!musicState.uiSfxEnabled || musicState.isMuted) return;
      try {
        const ctx = ensureAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        const now = ctx.currentTime;
        if (kind === "success") {
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.09);
        } else {
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(520, now + 0.05);
        }
        g.gain.setValueAtTime(0.08 * (musicState.volume / 100), now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } catch (e) {}
    }

    function getCurrentTrack() {
      const found = (musicState.tracks || []).find(t => t.id === musicState.currentTrackId);
      if (found) return found;
      return (musicState.tracks && musicState.tracks[0]) || DEFAULT_MUSIC_TRACKS[0];
    }

    function stopCurrentPlaybackInternal() {
      if (synthIntervalId) {
        clearInterval(synthIntervalId);
        synthIntervalId = null;
      }
      if (htmlAudioElement) {
        try {
          htmlAudioElement.pause();
        } catch (e) {}
      }
    }

    function playSynthStep(track) {
      if (!musicState.isPlaying) return;
      const ctx = ensureAudioContext();
      if (!ctx || !bassFilterNode) return;

      const notes = track.notes || [261.63, 329.63, 392.00, 523.25];
      const freq = notes[synthStepIndex % notes.length];
      const now = ctx.currentTime;
      const stepDuration = (60 / ((track.bpm || 90) * (Number(musicState.speed) || 1.0))) * 0.9;

      // Lead Melody Oscillator
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      osc.type = track.wave || "triangle";
      osc.frequency.setValueAtTime(freq, now);

      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.28, now + 0.04);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration);

      osc.connect(noteGain);
      noteGain.connect(bassFilterNode);
      osc.start(now);
      osc.stop(now + stepDuration + 0.02);

      // Warm Sub-Bass / Harmony Pad on every 2nd or 4th step
      if (synthStepIndex % 2 === 0) {
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = "sine";
        subOsc.frequency.setValueAtTime(freq * 0.5, now);
        subGain.gain.setValueAtTime(0.001, now);
        subGain.gain.linearRampToValueAtTime(0.18, now + 0.05);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.6);
        subOsc.connect(subGain);
        subGain.connect(bassFilterNode);
        subOsc.start(now);
        subOsc.stop(now + stepDuration * 1.65);
      }

      synthStepIndex++;
      // If loop-all or shuffle and we completed 2 cycles of a synth track (e.g. 32 notes), check if we should advance
      if (synthStepIndex >= notes.length * 4) {
        synthStepIndex = 0;
        if (musicState.playMode !== "loop-one" && (musicState.tracks || []).length > 1) {
          // Smoothly continue or advance if shuffle
          if (musicState.playMode === "shuffle") {
            nextMusicTrack(true);
          }
        }
      }
    }

    function startMusicPlayback() {
      stopCurrentPlaybackInternal();
      const track = getCurrentTrack();
      if (!track) return;

      musicState.currentTrackId = track.id;
      musicState.isPlaying = true;
      ensureAudioContext();

      if (track.kind === "custom" && track.url) {
        if (!htmlAudioElement) {
          htmlAudioElement = new Audio();
          htmlAudioElement.crossOrigin = "anonymous";
          htmlAudioElement.addEventListener("ended", () => {
            if (musicState.playMode === "loop-one") {
              htmlAudioElement.currentTime = 0;
              htmlAudioElement.play().catch(() => {});
            } else {
              nextMusicTrack(true);
            }
          });
          htmlAudioElement.addEventListener("error", () => {
            showToast("تعذر تشغيل الرابط الصوتي المخصص، يرجى التحقق من صحة الرابط أو رفع ملف MP3 من جهازك", "warning");
            musicState.isPlaying = false;
            updateMusicUI();
          });
        }
        if (htmlAudioElement.src !== track.url) {
          htmlAudioElement.src = track.url;
        }
        htmlAudioElement.volume = musicState.isMuted ? 0 : (musicState.volume / 100);
        htmlAudioElement.playbackRate = Number(musicState.speed) || 1.0;
        htmlAudioElement.play().then(() => {
          updateMusicUI();
        }).catch(() => {
          showToast("اضغط زر التشغيل لبدء الملف الصوتي", "info");
          musicState.isPlaying = false;
          updateMusicUI();
        });
      } else {
        // Synthesized Procedural Track
        const bpm = (track.bpm || 90) * (Number(musicState.speed) || 1.0);
        const intervalMs = Math.max(140, Math.round((60 / bpm) * 500));
        playSynthStep(track);
        synthIntervalId = setInterval(() => {
          playSynthStep(track);
        }, intervalMs);
      }

      updateMusicUI();
    }

    function toggleMusicPlayPause() {
      if (musicState.isPlaying) {
        musicState.isPlaying = false;
        stopCurrentPlaybackInternal();
        updateMusicUI();
      } else {
        startMusicPlayback();
      }
    }

    function stopMusicCompletely() {
      musicState.isPlaying = false;
      synthStepIndex = 0;
      stopCurrentPlaybackInternal();
      if (htmlAudioElement) {
        try { htmlAudioElement.currentTime = 0; } catch (e) {}
      }
      updateMusicUI();
      showToast("تم إيقاف الموسيقى ⏹️", "info");
    }

    function nextMusicTrack(autoTriggered) {
      const list = musicState.tracks || DEFAULT_MUSIC_TRACKS;
      if (list.length === 0) return;
      const curIdx = list.findIndex(t => t.id === musicState.currentTrackId);
      let nextIdx = 0;
      if (musicState.playMode === "shuffle" && list.length > 1) {
        nextIdx = Math.floor(Math.random() * list.length);
        if (nextIdx === curIdx) nextIdx = (curIdx + 1) % list.length;
      } else {
        nextIdx = (curIdx + 1) % list.length;
      }
      musicState.currentTrackId = list[nextIdx].id;
      synthStepIndex = 0;
      saveMusicPreferences();
      if (musicState.isPlaying || autoTriggered) {
        startMusicPlayback();
      } else {
        updateMusicUI();
      }
    }

    function prevMusicTrack() {
      const list = musicState.tracks || DEFAULT_MUSIC_TRACKS;
      if (list.length === 0) return;
      const curIdx = list.findIndex(t => t.id === musicState.currentTrackId);
      const prevIdx = (curIdx - 1 + list.length) % list.length;
      musicState.currentTrackId = list[prevIdx].id;
      synthStepIndex = 0;
      saveMusicPreferences();
      if (musicState.isPlaying) {
        startMusicPlayback();
      } else {
        updateMusicUI();
      }
    }

    function setClassroomMusicTimer(minutes) {
      if (musicCountdownTimerId) {
        clearInterval(musicCountdownTimerId);
        musicCountdownTimerId = null;
      }
      const mins = Number(minutes) || 0;
      musicState.timerMinutes = mins;
      musicState.timerRemainingSec = mins * 60;

      if (mins <= 0) {
        updateMusicUI();
        showToast("تم إلغاء مؤقت إيقاف الموسيقى", "info");
        return;
      }

      if (!musicState.isPlaying) {
        startMusicPlayback();
      }

      showToast(`تم ضبط مؤقت الموسيقى على ${mins} دقيقة ⏱️`, "success");
      updateMusicUI();

      musicCountdownTimerId = setInterval(() => {
        if (musicState.timerRemainingSec > 0) {
          musicState.timerRemainingSec--;
          updateMusicUI();
        } else {
          clearInterval(musicCountdownTimerId);
          musicCountdownTimerId = null;
          musicState.timerMinutes = 0;
          stopMusicCompletely();
          showToast("انتهى وقت النشاط الصفي! تم إيقاف الموسيقى تلقائياً ⏰", "info");
        }
      }, 1000);
    }

    function formatTimerSec(sec) {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    }

    function updateMusicUI() {
      const track = getCurrentTrack();
      const miniPlayer = document.getElementById("musicMiniPlayer");
      const miniDisc = document.getElementById("miniPlayerDisc");
      const miniStatus = document.getElementById("miniPlayerStatusBadge");
      const miniTimer = document.getElementById("miniPlayerTimerBadge");
      const miniTitle = document.getElementById("miniPlayerTrackTitle");
      const miniSelect = document.getElementById("miniTrackSelect");
      const miniPlayIcon = document.getElementById("miniPlayIcon");
      const miniVolIcon = document.getElementById("miniVolumeIcon");
      const miniVolSlider = document.getElementById("miniVolumeSlider");
      const headerDot = document.getElementById("headerMusicDot");

      if (miniPlayer) {
        if (musicState.miniPlayerVisible) {
          miniPlayer.classList.remove("hidden");
        } else {
          miniPlayer.classList.add("hidden");
        }
      }

      if (headerDot) {
        if (musicState.isPlaying) headerDot.classList.remove("hidden");
        else headerDot.classList.add("hidden");
      }

      if (miniDisc) {
        if (musicState.isPlaying) miniDisc.classList.add("animate-spin");
        else miniDisc.classList.remove("animate-spin");
      }

      if (miniStatus) {
        if (musicState.isPlaying) {
          miniStatus.textContent = "يعمل الآن 🎵";
          if (miniStatus) miniStatus.className = "text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-500";
        } else {
          miniStatus.textContent = "متوقف مؤقتاً";
          if (miniStatus) miniStatus.className = "text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
        }
      }

      if (miniTimer) {
        if (musicState.timerRemainingSec > 0) {
          miniTimer.classList.remove("hidden");
          miniTimer.textContent = "⏱️ " + formatTimerSec(musicState.timerRemainingSec);
        } else {
          miniTimer.classList.add("hidden");
        }
      }

      if (miniTitle && track) {
        miniTitle.textContent = track.title;
      }

      if (miniSelect) {
        miniSelect.innerHTML = (musicState.tracks || []).map(t => `
          <option value="${escapeHtml(t.id)}" ${t.id === musicState.currentTrackId ? "selected" : ""}>${escapeHtml(t.title)}</option>
        `).join("");
      }

      if (miniPlayIcon) {
        if (miniPlayIcon) miniPlayIcon.className = musicState.isPlaying ? "fa-solid fa-pause" : "fa-solid fa-play";
      }

      if (miniVolIcon) {
        if (musicState.isMuted || musicState.volume === 0) {
          if (miniVolIcon) miniVolIcon.className = "fa-solid fa-volume-xmark text-rose-500";
        } else if (musicState.volume < 50) {
          if (miniVolIcon) miniVolIcon.className = "fa-solid fa-volume-low";
        } else {
          if (miniVolIcon) miniVolIcon.className = "fa-solid fa-volume-high";
        }
      }

      if (miniVolSlider) {
        miniVolSlider.value = musicState.isMuted ? 0 : musicState.volume;
      }

      // If Full Studio Modal is open, sync its live controls too
      const studioPlayBtnLabel = document.getElementById("studioPlayBtnLabel");
      const studioPlayBtnIcon = document.getElementById("studioPlayBtnIcon");
      if (studioPlayBtnLabel && studioPlayBtnIcon) {
        studioPlayBtnLabel.textContent = musicState.isPlaying ? "إيقاف مؤقت" : "تشغيل المقطوعة الآن";
        if (studioPlayBtnIcon) studioPlayBtnIcon.className = musicState.isPlaying ? "fa-solid fa-pause" : "fa-solid fa-play";
      }
    }

    // Modal: Full Music & Audio Control Studio
    function openMusicStudioModal() {
      const track = getCurrentTrack();
      const tracksHtml = (musicState.tracks || []).map((t, idx) => {
        const isCurrent = (t.id === musicState.currentTrackId);
        return `
          <div class="flex items-center justify-between gap-2 p-3 rounded-2xl border ${isCurrent ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-900/30' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80'} transition-all">
            <div class="flex items-center gap-2.5 min-w-0">
              <button type="button" class="btn-studio-select-track w-9 h-9 rounded-xl ${isCurrent && musicState.isPlaying ? 'bg-emerald-500 text-white' : 'bg-brand-500/15 text-brand-600 dark:text-brand-300 hover:bg-brand-500 hover:text-white'} flex items-center justify-center text-xs font-bold shrink-0 transition-all" data-id="${escapeHtml(t.id)}" title="تشغيل هذه المقطوعة">
                <i class="fa-solid ${isCurrent && musicState.isPlaying ? 'fa-volume-high animate-pulse' : 'fa-play'}"></i>
              </button>
              <div class="min-w-0">
                <div class="text-xs font-extrabold text-slate-900 dark:text-white truncate">${escapeHtml(t.title)}</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span>${escapeHtml(t.category || (t.kind === 'custom' ? 'ملف مخصص' : 'مقطوعة مدمجة'))}</span>
                  ${t.kind === "custom" ? `<span class="text-amber-500 font-bold">• مضاف بواسطتك</span>` : ""}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button type="button" class="btn-studio-select-track px-3 py-1.5 rounded-xl ${isCurrent ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-brand-500 hover:text-white'} text-[11px] font-bold transition-all" data-id="${escapeHtml(t.id)}">
                ${isCurrent ? 'المحددة حالياً' : 'اختيار'}
              </button>
              ${(musicState.tracks || []).length > 1 ? `
                <button type="button" class="btn-studio-delete-track p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white text-xs transition-all" data-id="${escapeHtml(t.id)}" title="حذف هذه المقطوعة من القائمة">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </button>
              ` : ""}
            </div>
          </div>
        `;
      }).join("");

      const html = `
        <div class="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-gradient-to-l from-brand-900 via-slate-900 to-slate-900 text-white">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-base font-black shadow-md">
              <i class="fa-solid fa-sliders"></i>
            </span>
            <div>
              <h3 class="text-sm sm:text-base font-black text-white">استوديو الموسيقى والسيطرة الصوتية الكاملة 🎵</h3>
              <p class="text-[11px] text-sky-200">تحكم شامل بالمقطوعات، رفع ملفاتك الصوتية، موازن الصوت (Equalizer)، السرعة، ومؤقت الحصة</p>
            </div>
          </div>
          <button type="button" class="btn-close-modal p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10" onclick="closeModal()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="p-6 overflow-y-auto space-y-6 text-right">
          
          <!-- 1. Master Transport & Active Track Deck -->
          <div class="p-4 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-3 text-center sm:text-right">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-accent-cyan text-white flex items-center justify-center text-xl shadow-md shrink-0">
                <i class="fa-solid fa-music"></i>
              </div>
              <div>
                <div class="text-[11px] font-bold text-brand-600 dark:text-brand-400">المقطوعة النشطة الآن:</div>
                <div class="text-sm font-black text-slate-900 dark:text-white">${escapeHtml(track ? track.title : "")}</div>
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-center gap-2">
              <button id="btnStudioPrev" type="button" class="p-2.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-brand-500 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold shadow-xs transition-all" title="السابق">
                <i class="fa-solid fa-backward-step"></i>
              </button>
              <button id="btnStudioPlayPause" type="button" class="px-5 py-2.5 rounded-xl bg-gradient-to-l from-brand-600 to-sky-500 hover:from-brand-700 hover:to-sky-600 text-white text-xs font-extrabold shadow-md flex items-center gap-2 transition-all active:scale-95">
                <i id="studioPlayBtnIcon" class="fa-solid ${musicState.isPlaying ? 'fa-pause' : 'fa-play'}"></i>
                <span id="studioPlayBtnLabel">${musicState.isPlaying ? 'إيقاف مؤقت' : 'تشغيل المقطوعة الآن'}</span>
              </button>
              <button id="btnStudioStop" type="button" class="px-3.5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white text-xs font-bold transition-all" title="إيقاف كامل">
                <i class="fa-solid fa-stop ml-1"></i>إيقاف
              </button>
              <button id="btnStudioNext" type="button" class="p-2.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-brand-500 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold shadow-xs transition-all" title="التالي">
                <i class="fa-solid fa-forward-step"></i>
              </button>
            </div>
          </div>

          <!-- 2. Sound Engineering & Equalizer Sliders (Volume, Speed, Bass, Treble, Echo) -->
          <div class="space-y-3">
            <h4 class="text-xs font-black text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
              <i class="fa-solid fa-wave-square"></i>
              <span>هندسة الصوت والموازن الصوتي الدقيق (Audio Mixer & Equalizer):</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              
              <!-- Volume -->
              <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div class="flex items-center justify-between text-xs font-bold mb-2">
                  <span>🔊 مستوى الصوت العام</span>
                  <span id="lblStudioVol" class="text-brand-600 dark:text-brand-400 font-mono">${musicState.volume}%</span>
                </div>
                <input id="rngStudioVol" type="range" min="0" max="100" value="${musicState.volume}" class="w-full accent-brand-500 cursor-pointer">
              </div>

              <!-- Tempo / Speed -->
              <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div class="flex items-center justify-between text-xs font-bold mb-2">
                  <span>⚡ سرعة الإيقاع (Tempo)</span>
                  <span id="lblStudioSpeed" class="text-amber-600 dark:text-amber-400 font-mono">${musicState.speed}x</span>
                </div>
                <input id="rngStudioSpeed" type="range" min="0.5" max="2.0" step="0.1" value="${musicState.speed}" class="w-full accent-amber-500 cursor-pointer">
              </div>

              <!-- Bass Boost -->
              <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div class="flex items-center justify-between text-xs font-bold mb-2">
                  <span>🎸 تضخيم البيس (Bass)</span>
                  <span id="lblStudioBass" class="text-emerald-600 dark:text-emerald-400 font-mono">${musicState.bassGain} dB</span>
                </div>
                <input id="rngStudioBass" type="range" min="-12" max="12" step="1" value="${musicState.bassGain}" class="w-full accent-emerald-500 cursor-pointer">
              </div>

              <!-- Treble -->
              <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div class="flex items-center justify-between text-xs font-bold mb-2">
                  <span>✨ نقاء التريبل (Treble)</span>
                  <span id="lblStudioTreble" class="text-sky-600 dark:text-sky-400 font-mono">${musicState.trebleGain} dB</span>
                </div>
                <input id="rngStudioTreble" type="range" min="-12" max="12" step="1" value="${musicState.trebleGain}" class="w-full accent-sky-500 cursor-pointer">
              </div>

              <!-- Echo / Reverb -->
              <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div class="flex items-center justify-between text-xs font-bold mb-2">
                  <span>🌌 صدى وعمق (Ambient Echo)</span>
                  <span id="lblStudioEcho" class="text-purple-600 dark:text-purple-400 font-mono">${musicState.echoLevel}%</span>
                </div>
                <input id="rngStudioEcho" type="range" min="0" max="100" step="5" value="${musicState.echoLevel}" class="w-full accent-purple-500 cursor-pointer">
              </div>

              <!-- Play Mode & SFX -->
              <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-2">
                <div class="flex items-center justify-between">
                  <label for="selStudioPlayMode" class="text-xs font-bold">نمط التكرار:</label>
                  <select id="selStudioPlayMode" class="text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1">
                    <option value="loop-all" ${musicState.playMode === 'loop-all' ? 'selected' : ''}>🔁 تكرار القائمة</option>
                    <option value="loop-one" ${musicState.playMode === 'loop-one' ? 'selected' : ''}>🔂 تكرار المقطوعة</option>
                    <option value="shuffle" ${musicState.playMode === 'shuffle' ? 'selected' : ''}>🔀 عشوائي</option>
                  </select>
                </div>
                <label class="flex items-center justify-between text-xs font-bold cursor-pointer pt-1 border-t border-slate-200/60 dark:border-slate-700">
                  <span>أصوات نقرات الأزرار:</span>
                  <input id="chkStudioUiSfx" type="checkbox" class="w-4 h-4 rounded text-brand-600" ${musicState.uiSfxEnabled ? 'checked' : ''}>
                </label>
              </div>

            </div>
          </div>

          <!-- 3. Classroom Activity Timer -->
          <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 class="text-xs font-black text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <i class="fa-solid fa-hourglass-half"></i>
                <span>مؤقت النشاط الصفي وإيقاف الموسيقى التلقائي:</span>
              </h4>
              <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">مثالي لتحديد وقت ورشة العمل أو المسابقة الصفية بحيث تتوقف الموسيقى تلقائياً عند انتهاء الوقت</p>
            </div>
            <div class="flex flex-wrap items-center gap-1.5 shrink-0">
              <button type="button" class="btn-music-timer px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-amber-500 text-xs font-bold" data-mins="5">5 د</button>
              <button type="button" class="btn-music-timer px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-amber-500 text-xs font-bold" data-mins="10">10 د</button>
              <button type="button" class="btn-music-timer px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-amber-500 text-xs font-bold" data-mins="15">15 د</button>
              <button type="button" class="btn-music-timer px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-amber-500 text-xs font-bold" data-mins="45">45 د</button>
              <button type="button" class="btn-music-timer px-2.5 py-1.5 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-bold" data-mins="0">إلغاء المؤقت</button>
            </div>
          </div>

          <!-- 4. Upload Custom Music Files (MP3/WAV/OGG) or Add Audio URL -->
          <div class="p-4 rounded-2xl bg-brand-500/5 border border-brand-500/25 space-y-3">
            <h4 class="text-xs font-black text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
              <i class="fa-solid fa-cloud-arrow-up"></i>
              <span>إضافة موسيقى أو أناشيد أو ملفات صوتية خاصة بك (من جهازك أو عبر رابط):</span>
            </h4>

            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <label class="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm cursor-pointer flex items-center justify-center gap-2 transition-all">
                <i class="fa-solid fa-file-audio text-sm"></i>
                <span>رفع ملف صوتي من جهازي (MP3 / WAV / OGG)</span>
                <input id="inputUploadMusicFile" type="file" accept="audio/*" multiple class="hidden">
              </label>
              <button id="btnRestoreDefaultTracks" type="button" class="py-2.5 px-3.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all">
                <i class="fa-solid fa-rotate-left ml-1"></i>استعادة المقطوعات الأصلية
              </button>
            </div>

            <!-- Add by Direct URL Form -->
            <form id="formAddCustomMusicUrl" class="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-700/70">
              <input id="inputCustomTrackTitle" type="text" required placeholder="اسم المقطوعة (مثال: موسيقى تحفيزية للحصة)..." class="sm:w-2/5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100">
              <input id="inputCustomTrackUrl" type="text" dir="ltr" required placeholder="https://example.com/audio.mp3" class="flex-grow text-xs font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 text-left">
              <button type="submit" class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold shrink-0">
                <i class="fa-solid fa-plus ml-1"></i>إضافة رابط
              </button>
            </form>
          </div>

          <!-- 5. Full Playlist & Track Manager -->
          <div class="space-y-2.5">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-black text-slate-800 dark:text-slate-200">قائمة التشغيل الكاملة (${(musicState.tracks || []).length} مقطوعات):</h4>
              <span class="text-[11px] text-slate-500">اضغط على أي مقطوعة لتشغيلها فوراً</span>
            </div>
            <div id="studioTracksList" class="space-y-2 max-h-60 overflow-y-auto pr-1">
              ${tracksHtml}
            </div>
          </div>

        </div>

        <div class="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <button id="btnResetAudioMixer" type="button" class="text-xs font-bold text-slate-500 hover:text-brand-600 flex items-center gap-1">
            <i class="fa-solid fa-sliders"></i>
            <span>إعادة ضبط الموازن (Reset EQ)</span>
          </button>
          <button type="button" class="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold shadow-md" onclick="closeModal()">تم وحفظ الإعدادات</button>
        </div>
      `;

      showModalContent(html);

      // Wire Transport inside Studio Modal
      document.getElementById("btnStudioPlayPause").addEventListener("click", () => {
        toggleMusicPlayPause();
        openMusicStudioModal();
      });
      document.getElementById("btnStudioStop").addEventListener("click", () => {
        stopMusicCompletely();
        openMusicStudioModal();
      });
      document.getElementById("btnStudioPrev").addEventListener("click", () => {
        prevMusicTrack();
        openMusicStudioModal();
      });
      document.getElementById("btnStudioNext").addEventListener("click", () => {
        nextMusicTrack(false);
        openMusicStudioModal();
      });

      // Sliders
      document.getElementById("rngStudioVol").addEventListener("input", (e) => {
        musicState.volume = Number(e.target.value);
        musicState.isMuted = (musicState.volume === 0);
        document.getElementById("lblStudioVol").textContent = musicState.volume + "%";
        applyAudioParameters();
        updateMusicUI();
        saveMusicPreferences();
      });

      document.getElementById("rngStudioSpeed").addEventListener("input", (e) => {
        musicState.speed = Number(e.target.value);
        document.getElementById("lblStudioSpeed").textContent = musicState.speed + "x";
        applyAudioParameters();
        if (musicState.isPlaying && getCurrentTrack().kind === "synth") {
          startMusicPlayback(); // Refresh synth interval speed
        }
        saveMusicPreferences();
      });

      document.getElementById("rngStudioBass").addEventListener("input", (e) => {
        musicState.bassGain = Number(e.target.value);
        document.getElementById("lblStudioBass").textContent = musicState.bassGain + " dB";
        applyAudioParameters();
        saveMusicPreferences();
      });

      document.getElementById("rngStudioTreble").addEventListener("input", (e) => {
        musicState.trebleGain = Number(e.target.value);
        document.getElementById("lblStudioTreble").textContent = musicState.trebleGain + " dB";
        applyAudioParameters();
        saveMusicPreferences();
      });

      document.getElementById("rngStudioEcho").addEventListener("input", (e) => {
        musicState.echoLevel = Number(e.target.value);
        document.getElementById("lblStudioEcho").textContent = musicState.echoLevel + "%";
        applyAudioParameters();
        saveMusicPreferences();
      });

      document.getElementById("selStudioPlayMode").addEventListener("change", (e) => {
        musicState.playMode = e.target.value;
        saveMusicPreferences();
      });

      document.getElementById("chkStudioUiSfx").addEventListener("change", (e) => {
        musicState.uiSfxEnabled = e.target.checked;
        saveMusicPreferences();
      });

      // Reset Audio Mixer
      document.getElementById("btnResetAudioMixer").addEventListener("click", () => {
        musicState.volume = 70;
        musicState.speed = 1.0;
        musicState.bassGain = 2;
        musicState.trebleGain = 1;
        musicState.echoLevel = 25;
        applyAudioParameters();
        saveMusicPreferences();
        openMusicStudioModal();
        showToast("تمت استعادة الإعدادات الصوتية القياسية 🎚️", "info");
      });

      // Classroom Timer Buttons
      document.querySelectorAll(".btn-music-timer").forEach(btn => {
        btn.addEventListener("click", () => {
          setClassroomMusicTimer(Number(btn.dataset.mins));
        });
      });

      // Upload Audio Files from User's Device
      document.getElementById("inputUploadMusicFile").addEventListener("change", (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        let processed = 0;
        files.forEach(file => {
          const cleanName = file.name.replace(/\.[^/.]+$/, "");
          // If file is <= 1.5MB, store as base64 data URL so it persists in localStorage; otherwise use ObjectURL
          if (file.size <= 1500000) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const newTrack = {
                id: "custom-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
                title: "🎵 " + cleanName,
                category: "ملف مرفوع من جهازي",
                kind: "custom",
                url: ev.target.result,
                isTempBlob: false
              };
              musicState.tracks.unshift(newTrack);
              musicState.currentTrackId = newTrack.id;
              processed++;
              if (processed === files.length) {
                saveMusicPreferences();
                startMusicPlayback();
                openMusicStudioModal();
                showToast(`تم رفع وتشغيل "${cleanName}" بنجاح! 🎧`, "success");
              }
            };
            reader.readAsDataURL(file);
          } else {
            const blobUrl = URL.createObjectURL(file);
            const newTrack = {
              id: "custom-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
              title: "🎵 " + cleanName,
              category: "ملف صوتي محلي",
              kind: "custom",
              url: blobUrl,
              isTempBlob: true
            };
            musicState.tracks.unshift(newTrack);
            musicState.currentTrackId = newTrack.id;
            processed++;
            if (processed === files.length) {
              saveMusicPreferences();
              startMusicPlayback();
              openMusicStudioModal();
              showToast(`تم تحميل وتشغيل "${cleanName}" بنجاح! 🎧`, "success");
            }
          }
        });
      });

      // Add Custom Audio by URL
      document.getElementById("formAddCustomMusicUrl").addEventListener("submit", (e) => {
        e.preventDefault();
        const titleVal = document.getElementById("inputCustomTrackTitle").value.trim();
        const urlVal = document.getElementById("inputCustomTrackUrl").value.trim();
        if (!titleVal || !urlVal) return;

        const newTrack = {
          id: "url-" + Date.now(),
          title: "🔗 " + titleVal,
          category: "رابط صوتي خارجي",
          kind: "custom",
          url: safeUrl(urlVal),
          isTempBlob: false
        };
        musicState.tracks.unshift(newTrack);
        musicState.currentTrackId = newTrack.id;
        saveMusicPreferences();
        startMusicPlayback();
        openMusicStudioModal();
        showToast("تمت إضافة الرابط الصوتي لقائمة التشغيل بنجاح ✓", "success");
      });

      // Restore Default Tracks
      document.getElementById("btnRestoreDefaultTracks").addEventListener("click", () => {
        const customOnes = (musicState.tracks || []).filter(t => t.kind === "custom");
        musicState.tracks = JSON.parse(JSON.stringify(DEFAULT_MUSIC_TRACKS)).concat(customOnes);
        musicState.currentTrackId = musicState.tracks[0].id;
        saveMusicPreferences();
        openMusicStudioModal();
        updateMusicUI();
        showToast("تمت استعادة جميع المقطوعات الافتراضية 🎶", "info");
      });

      // Track List Select & Delete Delegation
      document.getElementById("studioTracksList").addEventListener("click", (e) => {
        const selBtn = e.target.closest(".btn-studio-select-track");
        if (selBtn) {
          const id = selBtn.dataset.id;
          if (musicState.currentTrackId === id && musicState.isPlaying) {
            toggleMusicPlayPause();
          } else {
            musicState.currentTrackId = id;
            synthStepIndex = 0;
            saveMusicPreferences();
            startMusicPlayback();
          }
          openMusicStudioModal();
          return;
        }

        const delBtn = e.target.closest(".btn-studio-delete-track");
        if (delBtn) {
          const id = delBtn.dataset.id;
          if ((musicState.tracks || []).length <= 1) return;
          musicState.tracks = musicState.tracks.filter(t => t.id !== id);
          if (musicState.currentTrackId === id) {
            musicState.currentTrackId = musicState.tracks[0].id;
            if (musicState.isPlaying) startMusicPlayback();
          }
          saveMusicPreferences();
          openMusicStudioModal();
          updateMusicUI();
          showToast("تم حذف المقطوعة من القائمة", "info");
        }
      });
    }

    function setupMusicEventListeners() {
      // Header & Bar Studio Buttons
      document.getElementById("btnHeaderMusic").addEventListener("click", openMusicStudioModal);
      document.getElementById("btnBarMusic").addEventListener("click", openMusicStudioModal);
      document.getElementById("btnOpenFullStudioFromMini").addEventListener("click", openMusicStudioModal);

      // Minimize / Toggle Mini Player Deck
      document.getElementById("btnMinimizeMusicDeck").addEventListener("click", () => {
        musicState.miniPlayerVisible = false;
        updateMusicUI();
        saveMusicPreferences();
      });
      document.getElementById("btnBarToggleMiniPlayer").addEventListener("click", () => {
        musicState.miniPlayerVisible = !musicState.miniPlayerVisible;
        updateMusicUI();
        saveMusicPreferences();
      });

      // Mini Player Transport Controls
      document.getElementById("btnMiniPlayPause").addEventListener("click", toggleMusicPlayPause);
      document.getElementById("btnMiniStop").addEventListener("click", stopMusicCompletely);
      document.getElementById("btnMiniPrev").addEventListener("click", prevMusicTrack);
      document.getElementById("btnMiniNext").addEventListener("click", () => nextMusicTrack(false));

      // Mini Track Select Dropdown
      document.getElementById("miniTrackSelect").addEventListener("change", (e) => {
        musicState.currentTrackId = e.target.value;
        synthStepIndex = 0;
        saveMusicPreferences();
        startMusicPlayback();
      });

      // Mini Mute & Volume Slider
      document.getElementById("btnMiniMute").addEventListener("click", () => {
        musicState.isMuted = !musicState.isMuted;
        applyAudioParameters();
        updateMusicUI();
        saveMusicPreferences();
      });

      document.getElementById("miniVolumeSlider").addEventListener("input", (e) => {
        musicState.volume = Number(e.target.value);
        musicState.isMuted = (musicState.volume === 0);
        applyAudioParameters();
        updateMusicUI();
        saveMusicPreferences();
      });

      // Mobile Bottom Nav Music Button
      const mobMusicBtn = document.getElementById("btnMobileTabMusic");
      if (mobMusicBtn) {
        mobMusicBtn.addEventListener("click", openMusicStudioModal);
      }

      // Mobile Bottom Nav Section Highlight
      document.querySelectorAll(".btn-mob-nav").forEach(navLink => {
        navLink.addEventListener("click", () => {
          document.querySelectorAll(".btn-mob-nav").forEach(l => {
            if (l.dataset.navsec !== "smartHubSection") {
              l.classList.remove("text-brand-600", "dark:text-brand-400", "font-extrabold");
              l.classList.add("text-slate-500", "dark:text-slate-400", "font-bold");
            }
          });
          if (navLink.dataset.navsec !== "smartHubSection") {
            navLink.classList.add("text-brand-600", "dark:text-brand-400", "font-extrabold");
            navLink.classList.remove("text-slate-500", "dark:text-slate-400", "font-bold");
          }
        });
      });

      // Viewport Mode Toggle (430px Mobile App Frame vs Full Screen)
      const btnViewport = document.getElementById("btnToggleViewportMode");
      const lblViewport = document.getElementById("viewportModeLabel");
      if (btnViewport && lblViewport) {
        // الافتراضي: شاشة عريضة (حاسوب) ← عرض كامل، والجوال ← ملء الشاشة. ويُحفظ اختيار المستخدم.
        const applyView = (frame) => {
          document.body.classList.toggle("mobile-app-mode", frame);
          lblViewport.textContent = frame ? "توسيع الشاشة" : "وضع الجوال";
          const ic = btnViewport.querySelector("i");
          if (ic) ic.className = frame ? "fa-solid fa-expand" : "fa-solid fa-mobile-screen";
        };
        let pref = null;
        try { pref = localStorage.getItem("edutech_view"); } catch (e) {}
        applyView(pref ? pref === "phone" : window.innerWidth < 640);
        btnViewport.addEventListener("click", () => {
          const frame = !document.body.classList.contains("mobile-app-mode");
          applyView(frame);
          try { localStorage.setItem("edutech_view", frame ? "phone" : "full"); } catch (e) {}
          showToast(frame ? "وضع الجوال 📱" : "عرض الشاشة الكاملة 🖥️", "info");
        });
      }

      // Live Mobile Status Bar Clock
      function updateMobileClock() {
        const clk = document.getElementById("mobileStatusClock");
        if (!clk) return;
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, "0");
        const mm = String(now.getMinutes()).padStart(2, "0");
        clk.textContent = hh + ":" + mm;
      }
      updateMobileClock();
      setInterval(updateMobileClock, 30000);
    }

    // Attach Event Listeners
    function setupEventListeners() {
      // Google Auth & User Profile Buttons
      document.getElementById("btnGoogleLoginHeader").addEventListener("click", openGoogleAuthModal);
      document.getElementById("btnUserHeaderProfile").addEventListener("click", openGoogleAuthModal);
      document.getElementById("btnBannerGoogleLogin").addEventListener("click", openGoogleAuthModal);
      document.getElementById("btnEditUserProfile").addEventListener("click", openGoogleAuthModal);
      document.getElementById("btnOpenCertModal").addEventListener("click", openCertificateModal);

      // Logout Google Account
      document.getElementById("btnLogoutGoogle").addEventListener("click", logoutCurrentUser);

      // Workspace Tabs Switching
      document.querySelectorAll(".btn-ws-tab").forEach(btn => {
        btn.addEventListener("click", () => {
          activeWorkspaceTab = btn.dataset.wstab;
          document.querySelectorAll(".btn-ws-tab").forEach(b => {
            if (b.dataset.wstab === activeWorkspaceTab) {
              b.classList.add("border-brand-600", "text-brand-600", "dark:text-brand-400", "font-extrabold");
              b.classList.remove("border-transparent", "text-slate-600", "dark:text-slate-400", "font-bold");
            } else {
              b.classList.remove("border-brand-600", "text-brand-600", "dark:text-brand-400", "font-extrabold");
              b.classList.add("border-transparent", "text-slate-600", "dark:text-slate-400", "font-bold");
            }
          });
          document.querySelectorAll(".ws-panel").forEach(panel => {
            panel.classList.add("hidden");
          });
          const targetPanel = document.getElementById("wsPanel_" + activeWorkspaceTab);
          if (targetPanel) targetPanel.classList.remove("hidden");
        });
      });

      // Workspace Saved Prompts Delegation (Copy & Delete)
      document.getElementById("userSavedPromptsList").addEventListener("click", (e) => {
        const user = getCurrentUser();
        if (!user) return;
        const copyBtn = e.target.closest(".btn-copy-saved-prompt");
        if (copyBtn) {
          const sp = (user.savedPrompts || []).find(x => x.id === copyBtn.dataset.id);
          if (sp) copyTextToClipboard(sp.text, "تم نسخ البرومبت من أرشيف حسابك بنجاح 📋");
          return;
        }
        const expBtn = e.target.closest(".btn-exp-saved");
        if (expBtn) {
          const sp2 = (user.savedPrompts || []).find(x => x.id === expBtn.dataset.id);
          if (sp2 && window.Exporter) window.Exporter[expBtn.dataset.k](sp2.topic || "برومبت محفوظ", sp2.text, { tool: sp2.goal || "برومبتاتي المحفوظة" });
          return;
        }
        const delBtn = e.target.closest(".btn-del-saved-prompt");
        if (delBtn) {
          user.savedPrompts = (user.savedPrompts || []).filter(x => x.id !== delBtn.dataset.id);
          logActivity("حذفت برومبتاً من أرشيفك");
          saveState();
          renderUserWorkspace();
          showToast("تم حذف البرومبت من حسابك", "info");
        }
      });

      // Workspace User Tasks Add & Toggle
      document.getElementById("formAddUserTask").addEventListener("submit", (e) => {
        e.preventDefault();
        const user = getCurrentUser();
        if (!user) {
          openGoogleAuthModal();
          return;
        }
        const titleInput = document.getElementById("inputUserTaskTitle");
        const priSelect = document.getElementById("inputUserTaskPriority");
        const title = titleInput.value.trim();
        if (!title) return;
        if (!Array.isArray(user.userTasks)) user.userTasks = [];
        user.userTasks.unshift({
          id: "tsk-" + Date.now(),
          title: title,
          priority: priSelect.value,
          done: false
        });
        titleInput.value = "";
        logActivity("أضفت مهمة إلى مفكرتك: " + title);
        saveState();
        renderUserWorkspace();
        showToast("تمت إضافة المهمة إلى مفكرتك الشخصية ✓", "success");
      });

      document.getElementById("userTasksList").addEventListener("click", (e) => {
        const user = getCurrentUser();
        if (!user) return;
        const chk = e.target.closest(".chk-user-task");
        if (chk) {
          const t = (user.userTasks || []).find(x => x.id === chk.dataset.id);
          if (t) {
            t.done = chk.checked;
            saveState();
            renderUserWorkspace();
          }
          return;
        }
        const delBtn = e.target.closest(".btn-del-user-task");
        if (delBtn) {
          user.userTasks = (user.userTasks || []).filter(x => x.id !== delBtn.dataset.id);
          saveState();
          renderUserWorkspace();
          showToast("تم حذف المهمة من مفكرتك", "info");
        }
      });

      // Export & Import Current User Account Data
      document.getElementById("btnExportUserAccount").addEventListener("click", () => {
        const user = getCurrentUser();
        if (!user) return;
        try {
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2));
          const a = document.createElement("a");
          a.setAttribute("href", dataStr);
          a.setAttribute("download", "edutech_profile_" + user.email.replace(/[^a-z0-9]/gi, "_") + ".json");
          a.click();
          showToast("تم تصدير بيانات حسابك الشخصي بنجاح 📤", "success");
        } catch (err) {
          showToast("تعذر تصدير بيانات الحساب", "warning");
        }
      });

      document.getElementById("inputImportUserAccount").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const importedUser = JSON.parse(ev.target.result);
            const cu = getCurrentUser();
            if (cu && importedUser && typeof importedUser === "object" && importedUser.email) {
              ["favorites", "completedItems", "likedItems", "savedPrompts", "userTasks"].forEach(k => {
                if (Array.isArray(importedUser[k])) cu[k] = importedUser[k];
              });
              if (importedUser.userNotes && typeof importedUser.userNotes === "object") cu.userNotes = importedUser.userNotes;
              logActivity("استوردت نسخة احتياطية لبيانات حسابك");
              saveState();
              fullRender();
              showToast("تم استيراد بيانات حسابك بنجاح 📥", "success");
            } else {
              showToast("ملف الحساب غير صالح", "warning");
            }
          } catch (err) {
            showToast("تعذر قراءة ملف الحساب", "warning");
          }
        };
        reader.readAsText(file);
      });

      // Admin Toggle in Header (kept for backward compatibility, hidden in UI)
      const btnAdmToggle = document.getElementById("btnAdminToggle");
      if (btnAdmToggle) btnAdmToggle.addEventListener("click", toggleAdminMode);

      // Header Quick Search Button
      const btnHdrSearch = document.getElementById("btnHeaderQuickSearch");
      if (btnHdrSearch) {
        btnHdrSearch.addEventListener("click", () => {
          if (window.EduLauncher && typeof window.EduLauncher.open === "function") {
            window.EduLauncher.open();
          }
        });
      }

      // Hero Add Button
      const btnHAdd = document.getElementById("btnHeroAdd");
      if (btnHAdd) btnHAdd.addEventListener("click", () => openAddEditModal(null));

      // Legacy Floating Bar Buttons
      const bAdd = document.getElementById("btnBarAdd");
      if (bAdd) bAdd.addEventListener("click", () => openAddEditModal(null));
      const bSet = document.getElementById("btnBarSettings");
      if (bSet) bSet.addEventListener("click", openSettingsModal);
      const bAdm = document.getElementById("btnBarAdmin");
      if (bAdm) bAdm.addEventListener("click", toggleAdminMode);

      // بوابة الدخول الخفية للإدارة (Ctrl+Shift+A أو 4 نقرات متتالية على اسم الإدارة في الفوتر)
      function triggerSecretAdminAccess() {
        if (adminVisitorPreview) {
          window.setAdminVisitorPreview(false);
          return;
        }
        if (isSuperAdminUser()) {
          if (window.EduMasterHierarchy && typeof window.EduMasterHierarchy.openAdmin === "function") {
            window.EduMasterHierarchy.openAdmin("permissions_mgr");
          }
          return;
        }
        openAdminPinModal(() => {
          updateAdminUI();
          fullRender();
          if (window.EduMasterHierarchy && typeof window.EduMasterHierarchy.openAdmin === "function") {
            window.EduMasterHierarchy.openAdmin("permissions_mgr");
          }
        });
      }
      window.triggerSecretAdminAccess = triggerSecretAdminAccess;
      window.setSuperAdminMode = function (flag) {
        if (flag && CLOUD_ON && !(window.Cloud && window.Cloud.isAdmin)) {
          showToast("🔒 فتح الإدارة يتطلب تسجيل الدخول بحساب Google الخاص بالإدارة", "warning");
          return;
        }
        isAdminMode = !!flag;
        try {
          localStorage.setItem("edutech_admin_mode", flag ? "true" : "false");
          localStorage.setItem("edu_admin_portal_unlocked_v136", flag ? "1" : "0");
        } catch (e) {}
        persistAdminFlag();
        updateAdminUI();
        fullRender();
        window.dispatchEvent(new Event("edu:admin-state-changed"));
      };
      window.syncGlobalWorkspaceWithUser = function () {
        fullRender();
      };

      window.addEventListener("keydown", (ev) => {
        if ((ev.ctrlKey || ev.altKey) && ev.shiftKey && ev.key.toLowerCase() === "a") {
          ev.preventDefault();
          triggerSecretAdminAccess();
        }
      });

      const secretFooterEl = document.getElementById("footerAdminSecretTrigger");
      if (secretFooterEl) {
        let clickCount = 0;
        let clickTimer = null;
        secretFooterEl.addEventListener("click", () => {
          clickCount++;
          clearTimeout(clickTimer);
          if (clickCount >= 4) {
            clickCount = 0;
            triggerSecretAdminAccess();
          } else {
            clickTimer = setTimeout(() => { clickCount = 0; }, 1600);
          }
        });
      }

      // شريط تقدم القراءة العلوي
      const scrollBar = document.getElementById("eduScrollProgress");
      if (scrollBar) {
        window.addEventListener("scroll", () => {
          const docH = document.documentElement.scrollHeight - window.innerHeight;
          const pct = docH > 40 ? Math.min(100, Math.max(0, (window.scrollY / docH) * 100)) : 0;
          scrollBar.style.transform = "scaleX(" + (pct / 100).toFixed(3) + ")";
        }, { passive: true });
      }

      // Quick Favorites Filter in Header
      document.getElementById("btnFavFilter").addEventListener("click", () => {
        isFavFilterOnly = !isFavFilterOnly;
        const btn = document.getElementById("btnFavFilter");
        if (isFavFilterOnly) {
          btn.classList.add("text-rose-500", "bg-rose-50", "dark:bg-rose-950/40");
          showToast("عرض الموارد المفضلة فقط ❤️", "info");
        } else {
          btn.classList.remove("text-rose-500", "bg-rose-50", "dark:bg-rose-950/40");
        }
        renderResources();
        if (window.EduMasterHierarchy && typeof window.EduMasterHierarchy.navigateToTarget === "function") {
          window.EduMasterHierarchy.navigateToTarget("library");
        }
      });

      // Personal Completed Filter
      document.getElementById("btnFilterCompleted").addEventListener("click", () => {
        if (!getCurrentUser()) {
          showToast("سجّل دخولك بحساب Google أولاً لفلترة الموارد المكتملة", "info");
          openGoogleAuthModal();
          return;
        }
        isCompletedFilterOnly = !isCompletedFilterOnly;
        const btn = document.getElementById("btnFilterCompleted");
        if (isCompletedFilterOnly) {
          btn.classList.add("bg-emerald-600", "text-white", "border-emerald-600");
          btn.classList.remove("bg-white", "dark:bg-slate-800");
        } else {
          btn.classList.remove("bg-emerald-600", "text-white", "border-emerald-600");
          btn.classList.add("bg-white", "dark:bg-slate-800");
        }
        renderResources();
      });

      // Personal Notes Filter
      document.getElementById("btnFilterHasNotes").addEventListener("click", () => {
        if (!getCurrentUser()) {
          showToast("سجّل دخولك بحساب Google أولاً لفلترة ملاحظاتك الخاصة", "info");
          openGoogleAuthModal();
          return;
        }
        isHasNotesFilterOnly = !isHasNotesFilterOnly;
        const btn = document.getElementById("btnFilterHasNotes");
        if (isHasNotesFilterOnly) {
          btn.classList.add("bg-amber-500", "text-slate-950", "border-amber-500");
          btn.classList.remove("bg-white", "dark:bg-slate-800");
        } else {
          btn.classList.remove("bg-amber-500", "text-slate-950", "border-amber-500");
          btn.classList.add("bg-white", "dark:bg-slate-800");
        }
        renderResources();
      });

      // Search Input
      const searchInput = document.getElementById("searchInput");
      const btnClearSearch = document.getElementById("btnClearSearch");

      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        if (searchQuery.trim()) {
          btnClearSearch.classList.remove("hidden");
        } else {
          btnClearSearch.classList.add("hidden");
        }
        renderResources();
      });

      btnClearSearch.addEventListener("click", () => {
        searchInput.value = "";
        searchQuery = "";
        btnClearSearch.classList.add("hidden");
        renderResources();
      });

      // Sort Select
      document.getElementById("sortSelect").addEventListener("change", (e) => {
        sortMode = e.target.value;
        renderResources();
      });

      // Reset Filters
      document.getElementById("btnResetFilters").addEventListener("click", resetAllFilters);
      document.getElementById("btnEmptyReset").addEventListener("click", resetAllFilters);

      // Category Chips Click Delegation
      document.getElementById("categoryChips").addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-cat-chip");
        if (!btn) return;
        activeCategory = btn.dataset.category;
        renderResources();
      });

      // Secondary Tag Pills Click Delegation
      document.getElementById("tagPills").addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-tag-filter");
        if (!btn) return;
        activeTag = btn.dataset.tag;
        document.querySelectorAll(".btn-tag-filter").forEach(b => {
          if (b.dataset.tag === activeTag) {
            b.classList.add("bg-brand-600", "text-white", "border-brand-600");
            b.classList.remove("bg-white", "dark:bg-slate-800");
          } else {
            b.classList.remove("bg-brand-600", "text-white", "border-brand-600");
            b.classList.add("bg-white", "dark:bg-slate-800");
          }
        });
        renderResources();
      });

      // Prompt Generator Buttons
      document.getElementById("btnGeneratePrompt").addEventListener("click", () => {
        generatePedagogicalPrompt();
        showToast("تم توليد البرومبت التربوي بنجاح ⚡", "success");
      });

      // Prompt Sample Topic Chips
      document.querySelectorAll(".btn-sample-topic").forEach(btn => {
        btn.addEventListener("click", () => {
          document.getElementById("genTopic").value = btn.dataset.topic;
          generatePedagogicalPrompt();
        });
      });

      // Copy Prompt
      document.getElementById("btnCopyPrompt").addEventListener("click", () => {
        const text = document.getElementById("promptOutputText").textContent;
        copyTextToClipboard(text, "تم نسخ البرومبت بنجاح! الصقه في ChatGPT أو Claude 📋");
      });

      // Save Prompt to User's Personal Google Account
      document.getElementById("btnSavePromptToAccount").addEventListener("click", () => {
        const user = getCurrentUser();
        if (!user) {
          showToast("يرجى تسجيل الدخول بحساب Google أولاً لحفظ البرومبت في أرشيفك الشخصي", "info");
          openGoogleAuthModal();
          return;
        }
        const topic = document.getElementById("genTopic").value.trim() || "فكرة درس ذكية";
        const grade = document.getElementById("genGrade").value;
        const subject = document.getElementById("genSubject").value;
        const goal = document.getElementById("genGoal").value;
        const aiModel = document.getElementById("genAIModel").value;
        const strategy = document.getElementById("genStrategy").value;
        const promptText = document.getElementById("promptOutputText").textContent;

        if (!Array.isArray(user.savedPrompts)) user.savedPrompts = [];
        user.savedPrompts.unshift({
          id: "sp-" + Date.now(),
          topic,
          grade,
          subject,
          goal,
          aiModel,
          strategy,
          date: "نوفمبر 2026",
          text: promptText
        });
        logActivity("حفظت برومبتاً جديداً: " + topic);
        saveState();
        renderUserWorkspace();
        showToast("تم حفظ البرومبت في أرشيف حسابك الشخصي بنجاح ☁️", "success");
      });

      // Save Prompt to Library
      document.getElementById("btnSavePromptToLib").addEventListener("click", () => {
        if (!isSuperAdminUser()) {
          showToast("إضافة البرومبتات إلى مكتبة الموقع من صلاحيات الإدارة فقط 🔒 (يمكنك حفظه في حسابك الشخصي)", "warning");
          return;
        }
        const topic = document.getElementById("genTopic").value.trim() || "فكرة درس ذكية";
        const promptText = document.getElementById("promptOutputText").textContent;
        const newPromptItem = {
          id: "item-" + Date.now(),
          type: "prompt",
          title: "برومبت: " + topic,
          desc: promptText.slice(0, 220) + "...",
          url: "https://chatgpt.com",
          thumb: "",
          tags: ["ذكاء اصطناعي", "برومبت", "خطط دروس"],
          date: "نوفمبر 2026",
          likes: 0,
          isPinned: false,
          isVerified: true,
          authorEmail: ADMIN_FALLBACK_EMAIL,
          authorName: "الإدارة العامة",
          authorRole: "super_admin"
        };
        appState.items.unshift(newPromptItem);
        addAuditLog('نشر برومبت في المكتبة: "' + newPromptItem.title + '"');
        const user = getCurrentUser();
        if (user) {
          if (!Array.isArray(user.favorites)) user.favorites = [];
          user.favorites.push(newPromptItem.id);
        }
        saveState();
        fullRender();
        showToast("تم حفظ البرومبت في المكتبة بنجاح 💾", "success");
      });

      // Backdrop Close Modal
      document.getElementById("modalBackdrop").addEventListener("click", closeModal);

      // Escape key to close modal
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
      });

      // Resource Grid Clicks Delegation (Pin, Verify, Complete, Likes, Favorites, Delete, Edit, Tag, WhatsApp)
      document.getElementById("resourceGrid").addEventListener("click", (e) => {
        // Pin Item (Super Admin Only)
        const pinBtn = e.target.closest(".btn-pin-item");
        if (pinBtn) {
          e.stopPropagation();
          if (!isSuperAdminUser()) {
            showToast("تثبيت الموارد في الصدارة من صلاحيات الإدارة العليا فقط 🔒", "warning");
            return;
          }
          const id = pinBtn.dataset.id;
          const item = (appState.items || []).find(x => x.id === id);
          if (item) {
            item.isPinned = !item.isPinned;
            addAuditLog(`${item.isPinned ? 'تثبيت' : 'إلغاء تثبيت'} المورد: "${item.title}"`);
            saveState();
            fullRender();
            showToast(item.isPinned ? "تم تثبيت المورد في صدارة المكتبة 📌" : "تم إلغاء تثبيت المورد", "success");
          }
          return;
        }

        // Verify Item (Super Admin Only)
        const verBtn = e.target.closest(".btn-verify-item");
        if (verBtn) {
          e.stopPropagation();
          if (!isSuperAdminUser()) return;
          const id = verBtn.dataset.id;
          const item = (appState.items || []).find(x => x.id === id);
          if (item) {
            item.isVerified = (item.isVerified === false) ? true : false;
            addAuditLog(`${item.isVerified ? 'اعتماد وتوثيق' : 'إلغاء توثيق'} المورد: "${item.title}"`);
            saveState();
            fullRender();
            showToast(item.isVerified ? "تم منح المورد ختم الاعتماد الرسمي ✅" : "تمت إزالة شارة الاعتماد", "info");
          }
          return;
        }

        // Complete
        const compBtn = e.target.closest(".btn-complete-item");
        if (compBtn) {
          e.stopPropagation();
          toggleItemCompleted(compBtn.dataset.id);
          return;
        }

        // Like
        const likeBtn = e.target.closest(".btn-like-item");
        if (likeBtn) {
          e.stopPropagation();
          const id = likeBtn.dataset.id;
          const item = (appState.items || []).find(x => x.id === id);
          if (item) toggleItemLike(item.id);
          return;
        }

        // Favorite
        const favBtn = e.target.closest(".btn-fav-item");
        if (favBtn) {
          e.stopPropagation();
          toggleItemFavorite(favBtn.dataset.id);
          return;
        }

        // WhatsApp Share
        const waBtn = e.target.closest(".btn-share-whatsapp");
        if (waBtn) {
          e.stopPropagation();
          const title = waBtn.dataset.title || "";
          const url = waBtn.dataset.url || "";
          const shareText = encodeURIComponent(`مورد تعليمي مميز من منصة EduTech Mindset (غزة 🇵🇸):\n*${title}*\n${url}`);
          window.open(`https://api.whatsapp.com/send?text=${shareText}`, "_blank", "noopener,noreferrer");
          return;
        }

        // Edit
        const editBtn = e.target.closest(".btn-edit-item");
        if (editBtn) {
          e.stopPropagation();
          openAddEditModal(editBtn.dataset.id);
          return;
        }

        // Delete
        const delBtn = e.target.closest(".btn-del-item");
        if (delBtn) {
          e.stopPropagation();
          openDeleteModal(delBtn.dataset.id);
          return;
        }

        // Tag Click
        const tagBtn = e.target.closest(".btn-card-tag");
        if (tagBtn) {
          e.stopPropagation();
          activeTag = tagBtn.dataset.tag;
          renderResources();
          return;
        }
      });
    }

    // Reset All Filters Helper
    function resetAllFilters() {
      activeCategory = "all";
      activeTag = "all";
      isFavFilterOnly = false;
      isCompletedFilterOnly = false;
      isHasNotesFilterOnly = false;
      searchQuery = "";
      document.getElementById("searchInput").value = "";
      document.getElementById("btnClearSearch").classList.add("hidden");

      const favBtn = document.getElementById("btnFavFilter");
      favBtn.classList.remove("text-rose-500", "bg-rose-50", "dark:bg-rose-950/40");

      const compBtn = document.getElementById("btnFilterCompleted");
      compBtn.classList.remove("bg-emerald-600", "text-white", "border-emerald-600");
      compBtn.classList.add("bg-white", "dark:bg-slate-800");

      const notesBtn = document.getElementById("btnFilterHasNotes");
      notesBtn.classList.remove("bg-amber-500", "text-slate-950", "border-amber-500");
      notesBtn.classList.add("bg-white", "dark:bg-slate-800");

      document.querySelectorAll(".btn-tag-filter").forEach(b => {
        b.classList.remove("bg-brand-600", "text-white", "border-brand-600");
        b.classList.add("bg-white", "dark:bg-slate-800");
      });

      renderResources();
      showToast("تمت استعادة كل الموارد بدون تصفية", "info");
    }

    // PWA & APK Installation Support
    let deferredInstallPrompt = null;

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
    });

    function initPwaCapabilities() {
      if (document.querySelector('link[rel="manifest"]')) return;
      try {
        const logoImg = document.querySelector("header img");
        const iconSrc = logoImg ? logoImg.src : "";
        const manifestObj = {
          name: "EduTech Mindset | عقلية التعليم والتكنولوجيا",
          short_name: "EduTech",
          description: "منصة تعليمية رائدة من غزة بإشراف الأستاذ باسل الفقعاوي لدمج الذكاء الاصطناعي في التعليم",
          start_url: "./index.html",
          display: "standalone",
          background_color: "#051322",
          theme_color: "#0284c7",
          lang: "ar",
          dir: "rtl",
          icons: iconSrc ? [
            { src: iconSrc, sizes: "192x192", type: "image/png", purpose: "any maskable" },
            { src: iconSrc, sizes: "512x512", type: "image/png", purpose: "any maskable" }
          ] : []
        };
        const manifestBlob = new Blob([JSON.stringify(manifestObj)], { type: "application/manifest+json" });
        const manifestUrl = URL.createObjectURL(manifestBlob);
        const linkEl = document.createElement("link");
        linkEl.rel = "manifest";
        linkEl.href = manifestUrl;
        document.head.appendChild(linkEl);
      } catch (e) {}
    }

    function openInstallAppModal() {
      const html = `
        <div class="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-sm">
              <i class="fa-brands fa-android"></i>
            </span>
            <h3 class="text-sm font-extrabold text-slate-800 dark:text-slate-100">تثبيت المنصة كتطبيق هاتف (PWA & APK)</h3>
          </div>
          <button type="button" class="btn-close-modal p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white" onclick="closeModal()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="p-6 overflow-y-auto space-y-5 text-right">
          
          <!-- Option 1: Direct PWA Install -->
          <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-black text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>
                1. التثبيت المباشر على الهاتف (PWA) بدون متجر
              </h4>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">جاهز فوراً</span>
            </div>
            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              الموقع مُجهّز بتقنية تطبيقات الويب التقدمية (PWA)؛ ليعمل بملء الشاشة وبأيقونة رسمية على شاشة هاتفك تماماً مثل أي تطبيق أندرويد أو آيفون:
            </p>
            <ul class="text-xs text-slate-700 dark:text-slate-200 space-y-1.5 list-disc list-inside pt-1 font-semibold">
              <li><strong>في أندرويد (Chrome):</strong> اضغط زر التثبيت أدناه، أو افتح قائمة المتصفح (⋮) واختر <strong>"تثبيت التطبيق" (Install App)</strong>.</li>
              <li><strong>في آيفون (Safari):</strong> اضغط زر المشاركة <i class="fa-solid fa-arrow-up-from-bracket mx-1"></i> ثم اختر <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</strong>.</li>
            </ul>
            <div class="pt-2">
              <button id="btnTriggerNativePwa" type="button" class="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2">
                <i class="fa-solid fa-download"></i>
                <span>تثبيت التطبيق مباشرة على جهازي الآن</span>
              </button>
            </div>
          </div>

          <!-- Option 2: Convert to standalone APK -->
          <div class="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 space-y-2.5">
            <h4 class="text-sm font-black text-brand-700 dark:text-brand-300 flex items-center gap-2">
              <i class="fa-solid fa-box-open"></i>
              2. استخراج ملف APK مستقل لمشاركته على الواتساب والتلجرام
            </h4>
            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              يمكنك تحويل هذا الموقع أو ملف الـ ZIP إلى ملف <strong>.apk</strong> رسمي خلال دقيقة واحدة ومجاناً عبر إحدى الطريقتين:
            </p>
            <div class="space-y-2 text-xs">
              <div class="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div class="font-extrabold text-slate-900 dark:text-white mb-1">أ) عبر أداة WebIntoApp (بدون حاجة لرابط منشور):</div>
                <p class="text-slate-600 dark:text-slate-300">ارفع ملف الموقع المضغوط مباشرة في موقع <strong>WebIntoApp.com</strong> واضغط Make App لتحميل ملف الـ APK فوراً.</p>
                <a href="https://www.webintoapp.com/html-to-app" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 font-bold mt-1.5 hover:underline">
                  <span>فتح أداة WebIntoApp لتحويل ملف HTML إلى APK</span>
                  <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                </a>
              </div>

              <div class="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div class="font-extrabold text-slate-900 dark:text-white mb-1">ب) حزمة متجر Google Play الرسمية (AAB & APK عبر PWABuilder / TWA):</div>
                <p class="text-slate-600 dark:text-slate-300">الموقع مُجهّز بملف التحقق الرقمي <code>/.well-known/assetlinks.json</code> وأيقونات المتجر القياسية (512×512) ومعرّف الحزمة <code>com.edutechmindset.app</code>. ضع الرابط <strong>https://edutech-mindset.pages.dev</strong> في منصة <strong>PWABuilder.com</strong> واضغط Package For Stores ← Android لتحميل حزمة <strong>.aab</strong> الجاهزة للرفع على Google Play Console.</p>
                <div class="flex flex-wrap gap-3 mt-1.5">
                  <a href="https://www.pwabuilder.com/" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 font-bold hover:underline">
                    <span>فتح منصة PWABuilder الرسمية</span>
                    <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                  </a>
                  <a href="privacy.html" class="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                    <i class="fa-solid fa-shield-halved text-[10px]"></i>
                    <span>سياسة الخصوصية وحذف البيانات</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div class="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end bg-slate-50 dark:bg-slate-800/50">
          <button type="button" class="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold" onclick="closeModal()">إغلاق</button>
        </div>
      `;

      showModalContent(html);

      const triggerBtn = document.getElementById("btnTriggerNativePwa");
      if (triggerBtn) {
        triggerBtn.addEventListener("click", async () => {
          if (deferredInstallPrompt) {
            deferredInstallPrompt.prompt();
            const { outcome } = await deferredInstallPrompt.userChoice;
            if (outcome === "accepted") {
              showToast("جاري تثبيت تطبيق EduTech Mindset على جهازك! 🎉", "success");
            }
            deferredInstallPrompt = null;
          } else {
            showToast("لتثبيت التطبيق الآن: افتح قائمة المتصفح (⋮) واختر «إضافة إلى الشاشة الرئيسية» أو «تثبيت التطبيق» 📲", "info");
          }
        });
      }
    }


    // =========================================================================
    // EDTECH POWER SUITE: BLOOM'S BUILDER, CLASS PACER TIMER, RUBRIC GENERATOR
    // =========================================================================
    const BLOOM_VERBS_DB = {
      remember: ["يعدد", "يسمّي", "يعرّف", "يذكر", "يسترجع", "يحدد"],
      understand: ["يفسّر", "يلخّص", "يوضّح", "يصنّف", "يعطي أمثلة على", "يشرح بلغته"],
      apply: ["يطبّق", "يستخدم", "يحلّ مسألة حول", "ينفّذ تجربة على", "يوظّف", "يمثّل بيانياً"],
      analyze: ["يقارن بين", "يحلّل عناصر", "يميّز بين", "يستنتج العلاقة في", "يفكّك أسباب"],
      evaluate: ["يقيّم", "ينقد علمياً", "يبرهن على صحة", "يصدر حكماً منهجياً على", "يختار البديل الأنسب في"],
      create: ["يصمّم نموذجاً لـ", "يبتكر حلاً لـ", "يؤلّف مشروعاً حول", "يخطّط تجربة لـ", "يبني محاكاة رقمية لـ"]
    };

    let classPacerIntervalId = null;
    let classPacerRemainingSec = 300;
    let classPacerRunning = false;

    function updateBloomBuilder() {
      const lvlSel = document.getElementById("bloomLevelSelect");
      const verbSel = document.getElementById("bloomVerbSelect");
      const topicIn = document.getElementById("bloomTopicInput");
      const outBox = document.getElementById("bloomOutputBox");
      if (!lvlSel || !verbSel || !topicIn || !outBox) return;

      const lvl = lvlSel.value;
      const verbs = BLOOM_VERBS_DB[lvl] || BLOOM_VERBS_DB.apply;
      if (!verbSel.dataset.loadedLevel || verbSel.dataset.loadedLevel !== lvl) {
        verbSel.innerHTML = verbs.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join("");
        verbSel.dataset.loadedLevel = lvl;
      }
      const verb = verbSel.value || verbs[0];
      const topic = topicIn.value.trim() || "المفهوم الدراسي";
      outBox.textContent = `أن ${verb} الطالب ${topic} بدقة وإتقان لا يقل عن 85% خلال الحصة الدراسية.`;
    }

    function renderClassPacerPhases() {
      const totalSel = document.getElementById("classTotalMinsSelect");
      const grid = document.getElementById("classPhasesGrid");
      if (!totalSel || !grid) return;

      const total = Number(totalSel.value) || 45;
      const phases = [
        { name: "1. التمهيد وكسر الجليد", pct: 0.12, icon: "fa-solid fa-fire text-amber-500", desc: "سؤال عصف ذهني أو نشاط استهلالي" },
        { name: "2. العرض والشرح التفاعلي", pct: 0.28, icon: "fa-solid fa-chalkboard-user text-brand-500", desc: "تقديم المفاهيم بالوسائط والذكاء الاصطناعي" },
        { name: "3. النشاط التطبيقي التعاوني", pct: 0.34, icon: "fa-solid fa-users-gear text-emerald-500", desc: "عمل المجموعات وأوراق العمل التفاعلية" },
        { name: "4. التقويم التكويني", pct: 0.16, icon: "fa-solid fa-circle-question text-rose-500", desc: "مسابقة سريعة (Kahoot / Wordwall)" },
        { name: "5. الغلق والتلخيص", pct: 0.10, icon: "fa-solid fa-flag-checkered text-purple-500", desc: "بطاقة الخروج وتكليف الواجب" }
      ];

      grid.innerHTML = phases.map((p, idx) => {
        const mins = Math.max(2, Math.round(total * p.pct));
        return `
          <div class="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-2">
            <div>
              <div class="flex items-center justify-between gap-1 mb-1">
                <i class="${p.icon} text-xs"></i>
                <span class="text-[11px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white">${mins} دقائق</span>
              </div>
              <div class="text-xs font-extrabold text-slate-900 dark:text-white">${escapeHtml(p.name)}</div>
              <div class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">${escapeHtml(p.desc)}</div>
            </div>
            <button type="button" class="btn-select-phase-timer w-full py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500 text-brand-600 dark:text-brand-300 hover:text-white text-[10px] font-extrabold transition-all" data-mins="${mins}" data-title="${escapeHtml(p.name)}">
              ضبط المؤقت (${mins} د)
            </button>
          </div>
        `;
      }).join("");
    }

    function renderRubricTable() {
      const sel = document.getElementById("rubricTaskType");
      const container = document.getElementById("rubricTableContainer");
      if (!sel || !container) return;

      const taskType = sel.value;
      const rows = [
        { crit: "دقة المحتوى العلمي والفهم", l4: "إتقان كامل وربط عميق بالمفاهيم دون أخطاء", l3: "فهم جيد جداً مع تفاصيل دقيقة", l2: "إلمام أساسي بالمفهوم مع بعض النواقص", l1: "يحتاج إلى مراجعة وتوجيه مباشر" },
        { crit: "توظيف التقنية والإبداع", l4: "توظيف مبتكر ومبهر للأدوات الرقمية", l3: "استخدام فاعل ومرتب للوسائل", l2: "استخدام تقليدي محدود للأدوات", l1: "لم يوظف الأدوات التقنية المطلوبة" },
        { crit: "التعاون وإدارة الوقت", l4: "توزيع أدوار مثالي والتزام تام بالوقت", l3: "تعاون واضح وإنجاز ضمن الوقت", l2: "تعاون جزئي وتأخر بسيط", l1: "ضعف في التنسيق وإدارة الوقت" }
      ];

      container.innerHTML = `
        <div class="font-extrabold text-brand-600 dark:text-brand-400 mb-2">سلم التقدير المعياري (Rubric) لتقييم: ${escapeHtml(taskType)}</div>
        <table class="w-full text-right border-collapse">
          <thead>
            <tr class="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-black">
              <th class="p-2 border border-slate-200 dark:border-slate-700">معيار التقييم</th>
              <th class="p-2 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">ممتاز (4)</th>
              <th class="p-2 border border-slate-200 dark:border-slate-700 text-sky-600 dark:text-sky-400">جيد جداً (3)</th>
              <th class="p-2 border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400">مقبول (2)</th>
              <th class="p-2 border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400">يحتاج دعماً (1)</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr class="border-b border-slate-200 dark:border-slate-800">
                <td class="p-2 font-extrabold border border-slate-200 dark:border-slate-700">${escapeHtml(r.crit)}</td>
                <td class="p-2 border border-slate-200 dark:border-slate-700">${escapeHtml(r.l4)}</td>
                <td class="p-2 border border-slate-200 dark:border-slate-700">${escapeHtml(r.l3)}</td>
                <td class="p-2 border border-slate-200 dark:border-slate-700">${escapeHtml(r.l2)}</td>
                <td class="p-2 border border-slate-200 dark:border-slate-700">${escapeHtml(r.l1)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    }

    function setupEdTechLabListeners() {
      updateBloomBuilder();
      renderClassPacerPhases();
      renderRubricTable();

      // Quick Admin Edit Announcement Button
      const btnEditAnn = document.getElementById("btnAdminEditAnn");
      if (btnEditAnn) {
        btnEditAnn.addEventListener("click", openSettingsModal);
      const btnCloseAnn = document.getElementById("btnCloseAnn");
      if (btnCloseAnn) {
        btnCloseAnn.addEventListener("click", () => {
          const banner = document.getElementById("announcementBanner");
          if (banner) banner.classList.add("hidden");
          try { sessionStorage.setItem("edutech_ann_hidden", "true"); } catch (e) {}
        });
      }

      }

      // Lab Tab Switching
      document.querySelectorAll(".btn-lab-tab").forEach(btn => {
        btn.addEventListener("click", () => {
          const target = btn.dataset.lab;
          document.querySelectorAll(".btn-lab-tab").forEach(b => {
            if (b.dataset.lab === target) {
              b.classList.add("bg-brand-600", "text-white", "font-extrabold");
              b.classList.remove("bg-white", "dark:bg-slate-800", "text-slate-700", "dark:text-slate-300", "font-bold");
            } else {
              b.classList.remove("bg-brand-600", "text-white", "font-extrabold");
              b.classList.add("bg-white", "dark:bg-slate-800", "text-slate-700", "dark:text-slate-300", "font-bold");
            }
          });
          document.querySelectorAll(".lab-panel").forEach(p => p.classList.add("hidden"));
          const panel = document.getElementById("labPanel_" + target);
          if (panel) panel.classList.remove("hidden");
        });
      });

      // Bloom Builder Events
      document.getElementById("bloomLevelSelect").addEventListener("change", updateBloomBuilder);
      document.getElementById("bloomVerbSelect").addEventListener("change", updateBloomBuilder);
      document.getElementById("bloomTopicInput").addEventListener("input", updateBloomBuilder);

      document.getElementById("btnCopyBloomObj").addEventListener("click", () => {
        const txt = document.getElementById("bloomOutputBox").textContent;
        copyTextToClipboard(txt, "تم نسخ الهدف السلوكي بنجاح 🎯");
      });

      document.getElementById("btnSaveBloomToTasks").addEventListener("click", () => {
        const user = getCurrentUser();
        if (!user) {
          showToast("سجّل دخولك بحساب Google لحفظ الأهداف السلوكية في مفكرتك", "info");
          openGoogleAuthModal();
          return;
        }
        const txt = document.getElementById("bloomOutputBox").textContent.trim();
        if (!Array.isArray(user.userTasks)) user.userTasks = [];
        user.userTasks.unshift({
          id: "tsk-" + Date.now(),
          title: "هدف سلوكي: " + txt,
          priority: "high",
          done: false
        });
        logActivity("حفظت هدفاً سلوكياً في مفكرتك");
        saveState();
        renderUserWorkspace();
        showToast("تم حفظ الهدف السلوكي في مفكرة تحضيرك ✓", "success");
      });

      // Class Pacer Events
      document.getElementById("classTotalMinsSelect").addEventListener("change", renderClassPacerPhases);

      document.getElementById("classPhasesGrid").addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-select-phase-timer");
        if (!btn) return;
        const mins = Number(btn.dataset.mins) || 5;
        classPacerRemainingSec = mins * 60;
        document.getElementById("livePacerClock").textContent = formatTimerSec(classPacerRemainingSec);
        showToast(`تم ضبط مؤقت الحصة لمرحلة (${btn.dataset.title}) على ${mins} دقائق ⏱️`, "info");
      });

      document.getElementById("btnStartClassPacer").addEventListener("click", () => {
        const lbl = document.getElementById("lblStartClassPacer");
        if (classPacerRunning) {
          clearInterval(classPacerIntervalId);
          classPacerIntervalId = null;
          classPacerRunning = false;
          lbl.textContent = "استئناف المؤقت";
        } else {
          classPacerRunning = true;
          lbl.textContent = "إيقاف مؤقت";
          classPacerIntervalId = setInterval(() => {
            if (classPacerRemainingSec > 0) {
              classPacerRemainingSec--;
              document.getElementById("livePacerClock").textContent = formatTimerSec(classPacerRemainingSec);
            } else {
              clearInterval(classPacerIntervalId);
              classPacerIntervalId = null;
              classPacerRunning = false;
              lbl.textContent = "بدء مؤقت المرحلة";
              playUiSound("success");
              showToast("انتهى زمن المرحلة الحالية من الحصة! ⏰", "success");
            }
          }, 1000);
        }
      });

      document.getElementById("btnResetClassPacer").addEventListener("click", () => {
        if (classPacerIntervalId) clearInterval(classPacerIntervalId);
        classPacerIntervalId = null;
        classPacerRunning = false;
        classPacerRemainingSec = 300;
        document.getElementById("livePacerClock").textContent = "05:00";
        document.getElementById("lblStartClassPacer").textContent = "بدء مؤقت المرحلة";
      });

      // Rubric Builder Events
      document.getElementById("rubricTaskType").addEventListener("change", renderRubricTable);
      document.getElementById("btnCopyRubric").addEventListener("click", () => {
        const taskType = document.getElementById("rubricTaskType").value;
        const text = `سلم التقدير المعياري (Rubric) — ${taskType}:
1. دقة المحتوى العلمي: ممتاز (4) | جيد جداً (3) | مقبول (2) | يحتاج دعماً (1)
2. توظيف التقنية والإبداع: ممتاز (4) | جيد جداً (3) | مقبول (2) | يحتاج دعماً (1)
3. التعاون وإدارة الوقت: ممتاز (4) | جيد جداً (3) | مقبول (2) | يحتاج دعماً (1)`;
        copyTextToClipboard(text, "تم نسخ سلم التقدير بنجاح 📊");
      });
    }

    // Application Bootstrap
    window.addEventListener("DOMContentLoaded", () => {
      loadState();
      initTheme();
      initPwaCapabilities();
      updateAdminUI();
      loadMusicPreferences();
      fullRender();
      setupEventListeners();
      setupMusicEventListeners();
      setupEdTechLabListeners();
      updateMusicUI();
      generatePedagogicalPrompt();

      const btnHInstall = document.getElementById("btnHeaderInstallApp");
      if (btnHInstall) btnHInstall.addEventListener("click", openInstallAppModal);
      const btnHeroInstall = document.getElementById("btnHeroInstallApp");
      if (btnHeroInstall) btnHeroInstall.addEventListener("click", openInstallAppModal);
      initCloud();
    });

/* v284: إظهار قسم المكتبة التعليمية والبرومبتات والإنفوجرافيك مباشرة بضغطة زر */
window.EduOpenLibrary = function () {
  var lib = document.getElementById("library");
  if (!lib) return;
  lib.classList.remove("hidden");
  lib.style.display = "block";
  lib.style.visibility = "visible";
  lib.style.opacity = "1";
  lib.scrollIntoView({ behavior: "smooth", block: "start" });
};
