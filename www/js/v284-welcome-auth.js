/* ============================================================================
 * EduTech Mindset — v284 Welcome Board & Google Sign-In Profile Completion
 * لوحة الترحيب الذكية للزوار + استكمال ملف التسجيل بعد دخول Google
 * ============================================================================ */
(function (global) {
  "use strict";

  var WELCOME_SEEN_KEY = "edutech_v284_welcome_seen";
  var PROFILE_CACHE_KEY = "edutech_v284_member_profile";
  var profilePromptedFor = "";

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

  function getAuthUser() {
    var u = (global.Cloud && global.Cloud.user) || null;
    if (!u && global.firebase && typeof global.firebase.auth === "function") {
      try { u = global.firebase.auth().currentUser; } catch (_) {}
    }
    return u;
  }

  function getCachedProfile() {
    try {
      var raw = localStorage.getItem(PROFILE_CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }

  function setCachedProfile(p) {
    try { localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(p)); } catch (_) {}
  }

  // ==========================================================================
  // 1) لوحة الترحيب الذكية للزوار (Welcome Board)
  // ==========================================================================
  function openWelcomeBoard(force) {
    if (!force) {
      try {
        if (localStorage.getItem(WELCOME_SEEN_KEY) === "1") return;
      } catch (_) {}
      // لا تظهر فوق وضع الصيانة أو إذا كان هناك نافذة أخرى مفتوحة
      if (document.getElementById("v283MaintenanceOverlay")) return;
    }
    var old = document.getElementById("v284WelcomeModal");
    if (old) old.remove();

    var u = getAuthUser();
    var m = document.createElement("div");
    m.id = "v284WelcomeModal";
    m.style.cssText = "position:fixed;inset:0;z-index:2147483150;background:rgba(2,6,23,0.78);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:14px;direction:rtl;";
    m.innerHTML =
      '<div style="width:min(95vw,520px);max-height:92vh;overflow-y:auto;border-radius:26px;background:linear-gradient(155deg,#020617,#0f172a 55%,#1e1b4b);color:#fff;border:1.5px solid rgba(56,189,248,0.45);box-shadow:0 28px 70px rgba(0,0,0,0.65);padding:22px 18px;text-align:center;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
          '<span style="padding:3px 10px;border-radius:999px;background:rgba(16,185,129,0.2);color:#6ee7b7;font-size:10.5px;font-weight:900;">✨ نصنع الأمل بالعلم من غزة 🇵🇸</span>' +
          '<button type="button" id="v284WelClose" aria-label="إغلاق" style="width:30px;height:30px;border-radius:10px;background:rgba(255,255,255,0.1);color:#fff;border:none;font-size:14px;font-weight:900;cursor:pointer;">✕</button>' +
        '</div>' +
        '<img src="assets/logo.png" alt="EduTech Mindset" style="width:68px;height:68px;border-radius:20px;margin:4px auto 10px;display:block;object-fit:cover;box-shadow:0 10px 26px rgba(14,165,233,0.35);">' +
        '<h2 style="font-size:19px;font-weight:900;margin:0 0 6px;color:#fff;">أهلاً بك في منصة EduTech Mindset</h2>' +
        '<p style="font-size:12.5px;line-height:1.7;color:#cbd5e1;margin:0 0 14px;">منصة التعليم والتكنولوجيا والذكاء الاصطناعي للمعلمين والطلاب في فلسطين — بإشراف <strong style="color:#fde68a;">أ. باسل أشرف الفقعاوي</strong>. جميع المناهج، ركن التأسيس الفصيح، ونماذج الأونروا مجانية 100%!</p>' +

        '<div style="text-align:right;font-size:11.5px;font-weight:900;color:#7dd3fc;margin-bottom:8px;">🎯 اختر مسارك للانطلاق مباشرة:</div>' +
        '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:14px;">' +
          '<button type="button" data-wel-role="teacher" style="padding:10px 6px;border-radius:15px;background:rgba(16,185,129,0.16);border:1px solid rgba(52,211,153,0.4);color:#fff;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;">' +
            '<span style="font-size:22px;">👨‍🏫</span><strong style="font-size:12px;">معلم / مشرف</strong><span style="font-size:9.5px;color:#a7f3d0;">تحضير + نماذج + AI</span>' +
          '</button>' +
          '<button type="button" data-wel-role="student" style="padding:10px 6px;border-radius:15px;background:rgba(56,189,248,0.16);border:1px solid rgba(56,189,248,0.4);color:#fff;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;">' +
            '<span style="font-size:22px;">🎓</span><strong style="font-size:12px;">طالب / توجيهي</strong><span style="font-size:9.5px;color:#bae6fd;">مناهج + مذاكرة ذكية</span>' +
          '</button>' +
          '<button type="button" data-wel-role="parent" style="padding:10px 6px;border-radius:15px;background:rgba(245,158,11,0.16);border:1px solid rgba(251,191,36,0.4);color:#fff;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;">' +
            '<span style="font-size:22px;">🧒</span><strong style="font-size:12px;">ولي أمر / طفل</strong><span style="font-size:9.5px;color:#fde68a;">التأسيس الفصيح</span>' +
          '</button>' +
        '</div>' +

        '<div style="display:flex;flex-direction:column;gap:8px;">' +
          (!u ? '<button type="button" id="v284WelGoogleBtn" style="width:100%;padding:11px 14px;border-radius:14px;background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;font-size:13px;font-weight:900;cursor:pointer;box-shadow:0 10px 24px rgba(37,99,235,0.35);">🔐 التسجيل / الدخول السريع بحساب Google</button>' : '') +
          '<div style="display:flex;gap:8px;">' +
            '<button type="button" id="v284WelPlansBtn" style="flex:1;padding:9px 10px;border-radius:12px;background:rgba(251,191,36,0.18);color:#fde68a;border:1px solid rgba(251,191,36,0.4);font-size:11.5px;font-weight:900;cursor:pointer;">⭐ باقات الذكاء الاصطناعي</button>' +
            '<button type="button" id="v284WelExploreBtn" style="flex:1;padding:9px 10px;border-radius:12px;background:rgba(255,255,255,0.08);color:#e2e8f0;border:1px solid rgba(255,255,255,0.18);font-size:11.5px;font-weight:800;cursor:pointer;">🚀 تصفح الموقع الآن</button>' +
          '</div>' +
        '</div>' +

        '<label style="display:inline-flex;align-items:center;gap:6px;margin-top:12px;font-size:11px;color:#94a3b8;cursor:pointer;">' +
          '<input type="checkbox" id="v284WelDontShow" checked style="accent-color:#10b981;">' +
          '<span>عدم إظهار لوحة الترحيب تلقائياً في الزيارات القادمة</span>' +
        '</label>' +
      '</div>';

    document.body.appendChild(m);

    function dismiss() {
      var chk = document.getElementById("v284WelDontShow");
      if (!chk || chk.checked) {
        try { localStorage.setItem(WELCOME_SEEN_KEY, "1"); } catch (_) {}
      }
      if (m.parentNode) m.parentNode.removeChild(m);
    }

    document.getElementById("v284WelClose").onclick = dismiss;
    document.getElementById("v284WelExploreBtn").onclick = dismiss;
    m.addEventListener("click", function (ev) { if (ev.target === m) dismiss(); });

    var gBtn = document.getElementById("v284WelGoogleBtn");
    if (gBtn) {
      gBtn.onclick = function () {
        dismiss();
        if (global.Cloud && typeof global.Cloud.loginWithGoogle === "function") {
          global.Cloud.loginWithGoogle();
        } else {
          var navBtn = document.getElementById("btnGoogleLoginHeader") || document.getElementById("btnAccountNav");
          if (navBtn) navBtn.click();
        }
      };
    }

    var pBtn = document.getElementById("v284WelPlansBtn");
    if (pBtn) {
      pBtn.onclick = function () {
        dismiss();
        if (global.EduV284Subs && typeof global.EduV284Subs.openPlans === "function") {
          global.EduV284Subs.openPlans();
        }
      };
    }

    m.querySelectorAll("[data-wel-role]").forEach(function (btn) {
      btn.onclick = function () {
        var r = btn.getAttribute("data-wel-role");
        dismiss();
        if (r === "parent" && global.EduKidsTaasees && typeof global.EduKidsTaasees.open === "function") {
          global.EduKidsTaasees.open();
        } else if (r === "teacher") {
          var th = document.getElementById("unifiedToolsHub");
          if (th) th.scrollIntoView({ behavior: "smooth", block: "start" });
          toast("👨‍🏫 أهلاً أستاذنا! جميع أدوات التحضير والمكتبة جاهزة لك", "success");
        } else if (r === "student") {
          var ls = document.getElementById("learnSection");
          if (ls) ls.scrollIntoView({ behavior: "smooth", block: "start" });
          toast("🎓 أهلاً بطالبنا المبدع! اختر صفك وابدأ المذاكرة", "success");
        }
      };
    });
  }

  // ==========================================================================
  // 2) استكمال ملف التسجيل بعد دخول Google (خطوة واحدة سريعة)
  // ==========================================================================
  function openProfileCompletionModal(user, existingProfile, isEdit) {
    if (!user || !user.email) return;
    var old = document.getElementById("v284ProfileModal");
    if (old) old.remove();

    var p = existingProfile || {};
    var m = document.createElement("div");
    m.id = "v284ProfileModal";
    m.style.cssText = "position:fixed;inset:0;z-index:2147483250;background:rgba(2,6,23,0.82);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:14px;direction:rtl;";
    var inp = "width:100%;padding:9px 11px;border-radius:11px;background:#0f172a;color:#fff;border:1px solid rgba(255,255,255,0.2);font-size:12.5px;";
    var lbl = "display:block;font-size:11px;font-weight:900;color:#7dd3fc;margin-bottom:4px;";

    m.innerHTML =
      '<div style="width:min(95vw,490px);max-height:92vh;overflow-y:auto;border-radius:24px;background:linear-gradient(155deg,#020617,#0f172a,#1e1b4b);color:#fff;border:1.5px solid rgba(52,211,153,0.45);box-shadow:0 26px 64px rgba(0,0,0,0.65);padding:20px 18px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">' +
          '<div>' +
            '<div style="font-size:15.5px;font-weight:900;color:#fff;">✨ ' + (isEdit ? "تحديث بيانات ملفك الشخصي" : "أكمل تسجيلك في 15 ثانية") + '</div>' +
            '<div style="font-size:11px;color:#94a3b8;">نستخدم هذه البيانات لتخصيص القوالب (حكومي/أونروا) وترويسة تحضيراتك تلقائياً</div>' +
          '</div>' +
          '<button type="button" id="v284ProfClose" style="width:30px;height:30px;border-radius:10px;background:rgba(255,255,255,0.1);color:#fff;border:none;font-weight:900;cursor:pointer;">✕</button>' +
        '</div>' +

        '<div style="display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:13px;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.3);margin-bottom:12px;">' +
          (user.photoURL ? '<img src="' + esc(user.photoURL) + '" style="width:38px;height:38px;border-radius:999px;object-fit:cover;">' : '<span style="width:38px;height:38px;border-radius:999px;background:#0284c7;display:flex;align-items:center;justify-content:center;font-size:18px;">👤</span>') +
          '<div style="min-width:0;"><div style="font-size:12.5px;font-weight:900;color:#fff;">' + esc(user.displayName || user.email.split("@")[0]) + '</div><div style="font-size:11px;color:#bae6fd;overflow:hidden;text-overflow:ellipsis;">' + esc(user.email) + '</div></div>' +
        '</div>' +

        '<form id="v284ProfForm" style="display:grid;gap:10px;">' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
            '<div><label style="' + lbl + '">الصفة *</label><select id="v284ProfRole" style="' + inp + '">' +
              ['معلم', 'طالب', 'طالب توجيهي', 'ولي أمر', 'مشرف تربوي', 'مدير مدرسة'].map(function (r) {
                return '<option value="' + r + '"' + (p.role === r ? ' selected' : '') + '>' + r + '</option>';
              }).join("") +
            '</select></div>' +
            '<div><label style="' + lbl + '">النظام التعليمي *</label><select id="v284ProfSys" style="' + inp + '">' +
              ['حكومي وزاري', 'وكالة الغوث (أونروا)', 'تعليم خاص', 'جامعي / أكاديمي'].map(function (s) {
                return '<option value="' + s + '"' + (p.eduSystem === s ? ' selected' : '') + '>' + s + '</option>';
              }).join("") +
            '</select></div>' +
          '</div>' +

          '<div><label style="' + lbl + '">الصف الدراسي أو المبحث / التخصص *</label>' +
            '<input id="v284ProfGrade" type="text" required placeholder="مثلاً: رياضيات - المرحلة الإعدادية، أو توجيهي علمي" value="' + esc(p.gradeOrSubject || "") + '" style="' + inp + '"></div>' +

          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
            '<div><label style="' + lbl + '">المدرسة / المؤسسة</label><input id="v284ProfSchool" type="text" placeholder="اسم المدرسة (لترويسة التحضير)" value="' + esc(p.school || "") + '" style="' + inp + '"></div>' +
            '<div><label style="' + lbl + '">المحافظة / المنطقة *</label><select id="v284ProfRegion" style="' + inp + '">' +
              ['خانيونس', 'غزة', 'الوسطى (دير البلح/النصيرات)', 'رفح', 'شمال غزة', 'الضفة الغربية والقدس', 'خارج فلسطين'].map(function (rg) {
                return '<option value="' + rg + '"' + (p.region === rg ? ' selected' : '') + '>' + rg + '</option>';
              }).join("") +
            '</select></div>' +
          '</div>' +

          '<div><label style="' + lbl + '">رقم الواتساب (اختياري — للتواصل وتفعيل الباقات والدورات)</label>' +
            '<input id="v284ProfWa" type="tel" dir="ltr" placeholder="059xxxxxxx أو +970..." value="' + esc(p.whatsapp || "") + '" style="' + inp + '"></div>' +

          '<div style="display:flex;gap:8px;margin-top:4px;">' +
            '<button type="submit" id="v284ProfSaveBtn" style="flex:1;padding:11px;border-radius:13px;background:linear-gradient(135deg,#10b981,#047857);color:#fff;border:none;font-size:13px;font-weight:900;cursor:pointer;">✅ حفظ وإكمال التسجيل</button>' +
            '<button type="button" id="v284ProfLaterBtn" style="padding:11px 14px;border-radius:13px;background:rgba(255,255,255,0.08);color:#cbd5e1;border:1px solid rgba(255,255,255,0.18);font-size:12px;font-weight:800;cursor:pointer;">لاحقاً</button>' +
          '</div>' +
        '</form>' +
      '</div>';

    document.body.appendChild(m);
    function closeM() { if (m.parentNode) m.parentNode.removeChild(m); }
    document.getElementById("v284ProfClose").onclick = closeM;
    document.getElementById("v284ProfLaterBtn").onclick = closeM;

    document.getElementById("v284ProfForm").onsubmit = function (ev) {
      ev.preventDefault();
      var saveBtn = document.getElementById("v284ProfSaveBtn");
      if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = "⏳ جارٍ الحفظ…"; }

      var payload = {
        name: user.displayName || user.email.split("@")[0],
        role: document.getElementById("v284ProfRole").value,
        eduSystem: document.getElementById("v284ProfSys").value,
        gradeOrSubject: document.getElementById("v284ProfGrade").value.trim(),
        school: document.getElementById("v284ProfSchool").value.trim(),
        region: document.getElementById("v284ProfRegion").value,
        whatsapp: document.getElementById("v284ProfWa").value.trim()
      };

      var tokPromise = (user.getIdToken) ? user.getIdToken().catch(function () { return ""; }) : Promise.resolve("");
      tokPromise.then(function (tok) {
        return fetch("/api/member-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tok },
          body: JSON.stringify(Object.assign({ idToken: tok }, payload))
        }).then(function (r) { return r.json(); });
      }).then(function (res) {
        if (res && res.ok) {
          setCachedProfile(res.profile || payload);
          toast("🎉 تم إكمال ملفك بنجاح وتخصيص المنصة لك ✓", "success");
          closeM();
        } else {
          setCachedProfile(payload);
          toast("✅ تم حفظ بياناتك محلياً", "info");
          closeM();
        }
      }).catch(function () {
        setCachedProfile(payload);
        toast("✅ تم حفظ بياناتك بنجاح", "info");
        closeM();
      });
    };
  }

  function checkGoogleUserProfile() {
    var u = getAuthUser();
    if (!u || !u.email) return;
    var em = u.email.toLowerCase();
    if (profilePromptedFor === em) return;

    var cached = getCachedProfile();
    if (cached && cached.email === em && cached.role) {
      profilePromptedFor = em;
      return;
    }

    profilePromptedFor = em;
    var tokP = u.getIdToken ? u.getIdToken().catch(function () { return ""; }) : Promise.resolve("");
    tokP.then(function (tok) {
      if (!tok) return;
      return fetch("/api/member-profile", {
        method: "GET",
        headers: { "Authorization": "Bearer " + tok }
      }).then(function (r) { return r.json(); }).then(function (res) {
        if (res && res.completed && res.profile) {
          setCachedProfile(res.profile);
        } else {
          setTimeout(function () { openProfileCompletionModal(u, null, false); }, 900);
        }
      });
    }).catch(function () {});
  }

  function boot() {
    // 1) إظهار لوحة الترحيب للزائر الجديد بعد 1.8 ثانية (دون إبطاء التحميل الأولي)
    setTimeout(function () { openWelcomeBoard(false); }, 1800);

    // 2) مراقبة تسجيل الدخول بحساب Google لعرض نافذة استكمال الملف تلقائياً
    setTimeout(checkGoogleUserProfile, 2600);
    setInterval(checkGoogleUserProfile, 8000);
  }

  global.EduV284Welcome = {
    openWelcome: function () { openWelcomeBoard(true); },
    openProfile: function () {
      var u = getAuthUser();
      if (!u) {
        toast("🔐 سجّل دخولك بحساب Google أولاً لتعديل ملفك", "info");
        if (global.Cloud && global.Cloud.loginWithGoogle) global.Cloud.loginWithGoogle();
        return;
      }
      openProfileCompletionModal(u, getCachedProfile(), true);
    },
    getProfile: getCachedProfile
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window);
