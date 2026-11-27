/* ============================================================================
 * EduTech Mindset — v284 Subscriptions, Flexible Payments & Admin Billing Hub
 * نظام الاشتراكات الشهري (مجاني / طالب 15₪ / معلم أساسي 30₪ / معلم VIP 60₪)
 * + أكواد التفعيل + طرق الدفع القابلة للتعديل + سجل الأعضاء للإدارة
 * ============================================================================ */
(function (global) {
  "use strict";

  var cachedSubData = null;

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

  function getToken() {
    var u = getAuthUser();
    if (u && typeof u.getIdToken === "function") return u.getIdToken().catch(function () { return ""; });
    return Promise.resolve("");
  }

  function fetchSubData() {
    return getToken().then(function (tok) {
      var hdrs = tok ? { "Authorization": "Bearer " + tok } : {};
      return fetch("/api/subscriptions", { method: "GET", headers: hdrs }).then(function (r) { return r.json(); });
    }).then(function (d) {
      if (d && d.ok) cachedSubData = d;
      return d;
    }).catch(function () {
      return { ok: false, error: "تعذّر الاتصال بالسحابة" };
    });
  }

  function fmtDate(ms) {
    if (!ms) return "—";
    try { return new Date(Number(ms)).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" }); }
    catch (_) { return "—"; }
  }

  function tierArabic(t) {
    if (t === "admin") return "👑 إدارة عليا";
    if (t === "teacher_vip") return "👑 معلم شامل VIP";
    if (t === "teacher_basic") return "👨‍🏫 معلم أساسي";
    if (t === "student") return "🎓 باقة الطالب";
    return "🆓 مجاني";
  }

  // ==========================================================================
  // 1) نافذة الباقات والاشتراك للمستخدمين (Plans + Redeem Code + WhatsApp)
  // ==========================================================================
  function openPlansModal() {
    var old = document.getElementById("v284PlansModal");
    if (old) old.remove();

    var m = document.createElement("div");
    m.id = "v284PlansModal";
    m.style.cssText = "position:fixed;inset:0;z-index:2147483220;background:rgba(2,6,23,0.82);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:12px;direction:rtl;";
    m.innerHTML =
      '<div style="width:min(96vw,880px);max-height:92vh;display:flex;flex-direction:column;border-radius:26px;background:linear-gradient(155deg,#020617,#0f172a,#1e1b4b);color:#fff;border:1.5px solid rgba(251,191,36,0.45);box-shadow:0 26px 70px rgba(0,0,0,0.65);overflow:hidden;">' +
        '<div style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:space-between;gap:10px;">' +
          '<div><div style="font-size:16px;font-weight:900;color:#fde68a;">⭐ باقات الذكاء الاصطناعي — EduTech Mindset</div><div style="font-size:11px;color:#cbd5e1;">جميع المناهج والتأسيس الفصيح ونماذج الأونروا مجانية 100% — الاشتراك مخصص لأدوات الذكاء الاصطناعي فقط</div></div>' +
          '<button type="button" id="v284PlansClose" style="width:32px;height:32px;border-radius:10px;background:rgba(244,63,94,0.22);color:#fda4af;border:1px solid rgba(244,63,94,0.4);font-weight:900;cursor:pointer;">✕</button>' +
        '</div>' +
        '<div id="v284PlansBody" style="padding:14px 16px;overflow-y:auto;flex:1;"><div style="padding:32px;text-align:center;color:#94a3b8;">⏳ جارٍ تحميل الباقات ورصيدك اليومي…</div></div>' +
      '</div>';

    document.body.appendChild(m);
    function closeM() { if (m.parentNode) m.parentNode.removeChild(m); }
    document.getElementById("v284PlansClose").onclick = closeM;
    m.addEventListener("click", function (ev) { if (ev.target === m) closeM(); });

    fetchSubData().then(function (data) {
      var body = document.getElementById("v284PlansBody");
      if (!body) return;
      if (!data || !data.ok) {
        body.innerHTML = '<div style="padding:24px;text-align:center;color:#fda4af;">' + esc((data && data.error) || "تعذّر تحميل الباقات") + '</div>';
        return;
      }
      var cfg = data.config || {};
      var cur = cfg.currency || "شيكل";
      var mp = data.myPlan || { tier: "free", label: "🆓 الباقة المجانية", usedToday: 0, limit: cfg.freeLimit || 5, remainingToday: 5 };
      var u = getAuthUser();
      var waNum = String(cfg.whatsapp || "").replace(/[^\d]/g, "");

      function waUrlFor(planName, price) {
        var msg = "السلام عليكم، أرغب بالاشتراك في منصة EduTech Mindset:\n• الباقة: " + planName + " (" + price + " " + cur + "/شهر)\n• الاسم: " + ((u && u.displayName) || "مستخدم") + "\n• البريد: " + ((u && u.email) || "غير مسجّل بعد");
        return waNum ? ("https://wa.me/" + waNum + "?text=" + encodeURIComponent(msg)) : ("https://wa.me/?text=" + encodeURIComponent(msg));
      }

      var statusBar =
        '<div style="padding:12px 14px;border-radius:16px;background:rgba(16,185,129,0.14);border:1px solid rgba(52,211,153,0.35);margin-bottom:14px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;">' +
          '<div>' +
            '<div style="font-size:13px;font-weight:900;color:#6ee7b7;">باقتك الحالية: ' + esc(mp.label) + '</div>' +
            '<div style="font-size:11.5px;color:#e2e8f0;margin-top:2px;">الاستهلاك اليومي: <strong>' + (mp.usedToday || 0) + ' / ' + (mp.isAdmin ? '∞' : (mp.limit || 5)) + '</strong>' + (mp.expiresAt ? (' · ينتهي في: <strong>' + fmtDate(mp.expiresAt) + '</strong>') : '') + '</div>' +
          '</div>' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">' +
            '<input id="v284RedeemInput" type="text" dir="ltr" placeholder="أدخل كود التفعيل EDU-..." style="padding:8px 10px;border-radius:10px;background:#020617;color:#fff;border:1px solid rgba(251,191,36,0.45);font-size:12px;width:165px;text-transform:uppercase;">' +
            '<button type="button" id="v284RedeemBtn" style="padding:8px 13px;border-radius:10px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#020617;border:none;font-size:12px;font-weight:900;cursor:pointer;">🔓 تفعيل الكود</button>' +
          '</div>' +
        '</div>';

      var plans = [
        {
          id: "free", title: "🆓 الباقة المجانية", price: "0", sub: "للتجربة والاستخدام اليومي الخفيف", border: "rgba(148,163,184,0.35)", bg: "rgba(255,255,255,0.05)",
          feats: [
            "جميع المناهج والكتب وركن التأسيس (57 صوتاً) ونماذج الأونروا مجانية 100%",
            (cfg.freeLimit || 5) + " طلبات ذكاء اصطناعي يومياً",
            "الطلب الأول يومياً على Gemini القوي + " + Math.max(0, (cfg.freeLimit || 5) - (cfg.freePaidFirst || 1)) + " طلبات على المحركات المجانية"
          ]
        },
        {
          id: "student", title: "🎓 باقة الطالب", price: String(cfg.studentPrice || 15), sub: "مثالية لطلاب المدارس والتوجيهي", border: "rgba(56,189,248,0.5)", bg: "rgba(14,165,233,0.12)",
          feats: [
            (cfg.studentLimit || 50) + " طلب ذكاء اصطناعي يومياً على المحركات السريعة",
            "مُذاكِر الدروس الذكي (اشرح لي كأني في صفي + 5 أسئلة تفاعلية)",
            "حل مسائل الرياضيات والفيزياء وSTEM والتوجيهي خطوة بخطوة"
          ]
        },
        {
          id: "teacher_basic", title: "👨‍🏫 باقة المعلم الأساسية", price: String(cfg.teacherBasicPrice || 30), sub: "خدمات التحضير الأساسية للمعلم", border: "rgba(16,185,129,0.5)", bg: "rgba(16,185,129,0.12)",
          feats: [
            (cfg.teacherBasicLimit || 80) + " طلب ذكاء اصطناعي يومياً",
            "أداة «حصة كاملة في 60 ثانية» (حكومي وزاري + أونروا)",
            "أرشيف خططي المحفوظة + تشغيل برومبتات المكتبة بالذكاء الاصطناعي"
          ]
        },
        {
          id: "teacher_vip", title: "👑 باقة المعلم الشاملة VIP", price: String(cfg.teacherVipPrice || 60), sub: "كل الخدمات والأدوات بلا قيود", border: "rgba(251,191,36,0.7)", bg: "linear-gradient(155deg,rgba(245,158,11,0.18),rgba(99,102,241,0.16))", featured: true,
          feats: [
            (cfg.teacherVipLimit || 200) + " طلب يومي على أقوى المحركات (Gemini / Claude / OpenAI)",
            "حصة كاملة في 60 ثانية + الخطط العلاجية والإثرائية الرسمية",
            "مُعِدّ الامتحانات بجدول المواصفات + الاستوديو الصوتي العصبي وتحميل MP3"
          ]
        }
      ];

      var cardsHtml = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin-bottom:14px;">' +
        plans.map(function (pl) {
          var isCur = mp.tier === pl.id;
          return '<div style="padding:13px;border-radius:18px;background:' + pl.bg + ';border:1.5px solid ' + pl.border + ';display:flex;flex-direction:column;gap:8px;position:relative;">' +
            (pl.featured ? '<span style="position:absolute;top:-9px;left:12px;background:#fbbf24;color:#020617;padding:2px 9px;border-radius:999px;font-size:10px;font-weight:900;">الأكثر شمولاً ⭐</span>' : '') +
            '<div style="font-size:14px;font-weight:900;color:#fff;">' + pl.title + '</div>' +
            '<div style="font-size:22px;font-weight:900;color:#fde68a;">' + esc(pl.price) + ' <span style="font-size:11.5px;color:#cbd5e1;font-weight:700;">' + esc(cur) + ' / شهرياً</span></div>' +
            '<div style="font-size:10.5px;color:#94a3b8;">' + pl.sub + '</div>' +
            '<ul style="margin:4px 0;padding:0 15px 0 0;font-size:11.5px;line-height:1.65;color:#e2e8f0;flex:1;">' + pl.feats.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join("") + '</ul>' +
            (pl.id === "free"
              ? '<div style="text-align:center;padding:8px;border-radius:11px;background:rgba(255,255,255,0.08);font-size:11px;font-weight:800;color:#94a3b8;">' + (isCur ? '✅ باقتك الحالية' : 'متاحة دائماً') + '</div>'
              : '<a href="' + waUrlFor(pl.title, pl.price) + '" target="_blank" rel="noopener" style="text-align:center;text-decoration:none;padding:9px;border-radius:12px;background:' + (pl.featured ? 'linear-gradient(135deg,#f59e0b,#d97706);color:#020617;' : 'linear-gradient(135deg,#10b981,#047857);color:#fff;') + 'font-size:12px;font-weight:900;">' + (isCur ? '🔄 تجديد عبر واتساب' : '💬 اطلب الاشتراك عبر واتساب') + '</a>') +
          '</div>';
        }).join("") +
      '</div>';

      var payBox =
        '<div style="padding:12px 14px;border-radius:16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);font-size:11.5px;line-height:1.75;color:#cbd5e1;">' +
          '<div style="font-size:12.5px;font-weight:900;color:#7dd3fc;margin-bottom:5px;">💳 طرق الدفع المحلية المعتمدة:</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:12px;">' +
            (cfg.jawwalPay ? '<span>📱 <strong>جوال باي:</strong> <span dir="ltr">' + esc(cfg.jawwalPay) + '</span></span>' : '') +
            (cfg.palPay ? '<span>💳 <strong>بال باي:</strong> <span dir="ltr">' + esc(cfg.palPay) + '</span></span>' : '') +
            (cfg.bankAccount ? '<span>🏦 <strong>بنك فلسطين / IBAN:</strong> <span dir="ltr">' + esc(cfg.bankAccount) + '</span></span>' : '') +
            '<span>🤝 ' + esc(cfg.inPersonNote || "الدفع عبر المحافظ المحلية أو وجاهياً — تواصل عبر واتساب للتفعيل الفوري") + '</span>' +
          '</div>' +
        '</div>';

      body.innerHTML = statusBar + cardsHtml + payBox;

      var rBtn = document.getElementById("v284RedeemBtn");
      if (rBtn) {
        rBtn.onclick = function () {
          var codeVal = (document.getElementById("v284RedeemInput").value || "").trim();
          if (!codeVal) { toast("⚠️ أدخل كود التفعيل أولاً", "warn"); return; }
          if (!getAuthUser()) {
            toast("🔐 سجّل دخولك بحساب Google أولاً لتفعيل الكود", "info");
            if (global.Cloud && global.Cloud.loginWithGoogle) global.Cloud.loginWithGoogle();
            return;
          }
          rBtn.disabled = true; rBtn.textContent = "⏳…";
          getToken().then(function (tok) {
            return fetch("/api/subscriptions", {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tok },
              body: JSON.stringify({ idToken: tok, action: "redeem", code: codeVal })
            }).then(function (r) { return r.json(); });
          }).then(function (res) {
            rBtn.disabled = false; rBtn.textContent = "🔓 تفعيل الكود";
            if (res && res.ok) {
              toast(res.message || "🎉 تم تفعيل اشتراكك بنجاح!", "success");
              openPlansModal();
            } else {
              toast("❌ " + ((res && res.error) || "فشل تفعيل الكود"), "error");
            }
          }).catch(function () {
            rBtn.disabled = false; rBtn.textContent = "🔓 تفعيل الكود";
            toast("❌ خطأ في الاتصال بالسحابة", "error");
          });
        };
      }
    });
  }

  // ==========================================================================
  // 2) لوحة إدارة الاشتراكات وطرق الدفع والأعضاء (Admin Billing Hub)
  // ==========================================================================
  function openAdminBillingHub(initialTab) {
    var activeTab = initialTab || "pay_cfg";
    var old = document.getElementById("v284AdminBillingModal");
    if (old) old.remove();

    var m = document.createElement("div");
    m.id = "v284AdminBillingModal";
    m.style.cssText = "position:fixed;inset:0;z-index:2147483240;background:rgba(2,6,23,0.82);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:12px;direction:rtl;";
    m.innerHTML =
      '<div style="width:min(96vw,880px);max-height:92vh;display:flex;flex-direction:column;border-radius:26px;background:linear-gradient(155deg,#020617,#0f172a,#1e1b4b);color:#fff;border:1.5px solid rgba(52,211,153,0.45);box-shadow:0 26px 70px rgba(0,0,0,0.65);overflow:hidden;">' +
        '<div style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:space-between;gap:10px;">' +
          '<div><div style="font-size:15.5px;font-weight:900;color:#6ee7b7;">💳 إدارة الاشتراكات وطرق الدفع والأعضاء (v284)</div><div style="font-size:11px;color:#94a3b8;">تحكم كامل بالأسعار وطرق الدفع والأكواد والمشتركين وملفات الأعضاء المسجّلين</div></div>' +
          '<button type="button" id="v284AdmClose" style="width:32px;height:32px;border-radius:10px;background:rgba(244,63,94,0.22);color:#fda4af;border:1px solid rgba(244,63,94,0.4);font-weight:900;cursor:pointer;">✕</button>' +
        '</div>' +
        '<div id="v284AdmBody" style="padding:14px 16px;overflow-y:auto;flex:1;"><div style="padding:32px;text-align:center;color:#94a3b8;">⏳ جارٍ التحميل…</div></div>' +
      '</div>';

    document.body.appendChild(m);
    function closeM() { if (m.parentNode) m.parentNode.removeChild(m); }
    document.getElementById("v284AdmClose").onclick = closeM;
    m.addEventListener("click", function (ev) { if (ev.target === m) closeM(); });

    var subData = null;
    var membersData = null;

    function loadAll() {
      Promise.all([
        fetchSubData(),
        getToken().then(function (tok) {
          return fetch("/api/member-profile?all=1", { headers: { "Authorization": "Bearer " + tok } }).then(function (r) { return r.json(); }).catch(function () { return null; });
        })
      ]).then(function (arr) {
        subData = arr[0];
        membersData = arr[1];
        renderAdminBody();
      });
    }

    function renderAdminBody() {
      var body = document.getElementById("v284AdmBody");
      if (!body) return;
      if (!subData || !subData.ok || !(subData.myPlan && subData.myPlan.isAdmin)) {
        body.innerHTML = '<div style="padding:26px;text-align:center;color:#fda4af;font-weight:800;">🔒 هذه اللوحة متاحة لحساب الإدارة العليا فقط.</div>';
        return;
      }

      var cfg = subData.config || {};
      var subsMap = subData.subscribers || {};
      var subsList = Object.keys(subsMap).map(function (k) { return subsMap[k]; });
      var codes = Array.isArray(subData.codes) ? subData.codes : [];
      var profs = (membersData && membersData.ok && Array.isArray(membersData.profiles)) ? membersData.profiles : [];

      var tabs = [
        { id: "pay_cfg", label: "💳 طرق الدفع والأسعار" },
        { id: "subs", label: "⭐ المشتركون (" + subsList.length + ")" },
        { id: "codes", label: "🎟️ أكواد التفعيل (" + codes.filter(function (c) { return !c.usedBy; }).length + ")" },
        { id: "members", label: "👥 ملفات الأعضاء (" + profs.length + ")" }
      ];
      var tabsHtml = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;">' + tabs.map(function (t) {
        var on = activeTab === t.id;
        return '<button type="button" data-adm-tab="' + t.id + '" style="padding:7px 12px;border-radius:11px;font-size:11.5px;font-weight:900;cursor:pointer;border:1px solid ' + (on ? '#34d399' : 'rgba(255,255,255,0.15)') + ';background:' + (on ? 'linear-gradient(135deg,#10b981,#047857)' : 'rgba(255,255,255,0.06)') + ';color:#fff;">' + t.label + '</button>';
      }).join("") + '</div>';

      var inp = "width:100%;padding:8px 10px;border-radius:10px;background:#020617;color:#fff;border:1px solid rgba(255,255,255,0.2);font-size:12px;";
      var lbl = "display:block;font-size:10.5px;font-weight:900;color:#7dd3fc;margin-bottom:3px;";
      var html = "";

      if (activeTab === "pay_cfg") {
        html =
          '<div style="display:grid;gap:10px;padding:13px;border-radius:16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);">' +
            '<div style="font-size:13px;font-weight:900;color:#fde68a;">💳 حسابات الدفع (نفس مرونة نظام الدورات — تتحدث فوراً للجميع)</div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px;">' +
              '<div><label style="' + lbl + '">📱 رقم واتساب التفعيل (مع مفتاح الدولة)</label><input id="cWa" dir="ltr" value="' + esc(cfg.whatsapp || "") + '" placeholder="97059xxxxxxx" style="' + inp + '"></div>' +
              '<div><label style="' + lbl + '">📱 رقم جوال باي (Jawwal Pay)</label><input id="cJw" dir="ltr" value="' + esc(cfg.jawwalPay || "") + '" placeholder="059xxxxxxx" style="' + inp + '"></div>' +
              '<div><label style="' + lbl + '">💳 رقم بال باي (PalPay)</label><input id="cPp" dir="ltr" value="' + esc(cfg.palPay || "") + '" placeholder="رقم المحفظة" style="' + inp + '"></div>' +
              '<div><label style="' + lbl + '">🏦 بنك فلسطين / IBAN</label><input id="cBk" dir="ltr" value="' + esc(cfg.bankAccount || "") + '" placeholder="PS..." style="' + inp + '"></div>' +
            '</div>' +
            '<div><label style="' + lbl + '">🤝 ملاحظة الدفع الوجاهي</label><input id="cInP" value="' + esc(cfg.inPersonNote || "") + '" style="' + inp + '"></div>' +
            '<div style="font-size:13px;font-weight:900;color:#6ee7b7;margin-top:6px;">💰 الأسعار والحدود اليومية للباقات</div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;">' +
              '<div><label style="' + lbl + '">🆓 حد المجاني/يوم</label><input id="cFreeL" type="number" value="' + (cfg.freeLimit || 5) + '" style="' + inp + '"></div>' +
              '<div><label style="' + lbl + '">⚡ طلبات Gemini للمجاني</label><input id="cFreeP" type="number" value="' + (cfg.freePaidFirst != null ? cfg.freePaidFirst : 1) + '" style="' + inp + '"></div>' +
              '<div><label style="' + lbl + '">🎓 سعر الطالب</label><input id="cStuP" type="number" value="' + (cfg.studentPrice || 15) + '" style="' + inp + '"></div>' +
              '<div><label style="' + lbl + '">🎓 حد الطالب/يوم</label><input id="cStuL" type="number" value="' + (cfg.studentLimit || 50) + '" style="' + inp + '"></div>' +
              '<div><label style="' + lbl + '">👨‍🏫 سعر معلم أساسي</label><input id="cTbP" type="number" value="' + (cfg.teacherBasicPrice || 30) + '" style="' + inp + '"></div>' +
              '<div><label style="' + lbl + '">👨‍🏫 حد معلم أساسي/يوم</label><input id="cTbL" type="number" value="' + (cfg.teacherBasicLimit || 80) + '" style="' + inp + '"></div>' +
              '<div><label style="' + lbl + '">👑 سعر معلم VIP</label><input id="cTvP" type="number" value="' + (cfg.teacherVipPrice || 60) + '" style="' + inp + '"></div>' +
              '<div><label style="' + lbl + '">👑 حد معلم VIP/يوم</label><input id="cTvL" type="number" value="' + (cfg.teacherVipLimit || 200) + '" style="' + inp + '"></div>' +
            '</div>' +
            '<div><button type="button" id="v284SaveCfgBtn" style="padding:10px 18px;border-radius:12px;background:linear-gradient(135deg,#10b981,#047857);color:#fff;border:none;font-size:12.5px;font-weight:900;cursor:pointer;">💾 حفظ الإعدادات سحابياً</button></div>' +
          '</div>';
      }

      if (activeTab === "subs") {
        html =
          '<div style="padding:12px;border-radius:15px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);margin-bottom:12px;">' +
            '<div style="font-size:12.5px;font-weight:900;color:#fde68a;margin-bottom:8px;">➕ تفعيل اشتراك مباشر بالبريد الإلكتروني</div>' +
            '<div style="display:grid;grid-template-columns:2fr 1.3fr 0.8fr auto;gap:7px;">' +
              '<input id="gEmail" type="email" dir="ltr" placeholder="user@gmail.com" style="' + inp + '">' +
              '<select id="gTier" style="' + inp + '"><option value="student">🎓 طالب (15₪)</option><option value="teacher_basic">👨‍🏫 معلم أساسي (30₪)</option><option value="teacher_vip">👑 معلم VIP (60₪)</option></select>' +
              '<input id="gDays" type="number" value="30" placeholder="أيام" style="' + inp + '">' +
              '<button type="button" id="v284GrantBtn" style="padding:8px 14px;border-radius:10px;background:#10b981;color:#020617;border:none;font-size:12px;font-weight:900;cursor:pointer;">تفعيل</button>' +
            '</div>' +
          '</div>' +
          (!subsList.length ? '<div style="padding:20px;text-align:center;color:#94a3b8;">لا يوجد مشتركون مفعّلون بعد.</div>' :
            '<div style="display:flex;flex-direction:column;gap:7px;">' + subsList.map(function (s) {
              var active = !s.expiresAt || Number(s.expiresAt) > Date.now();
              return '<div style="padding:10px 12px;border-radius:13px;background:rgba(255,255,255,0.05);border:1px solid ' + (active ? 'rgba(52,211,153,0.35)' : 'rgba(244,63,94,0.35)') + ';display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;">' +
                '<div><strong style="font-size:12.5px;">' + esc(s.email) + '</strong> <span style="font-size:11px;color:#fde68a;">' + tierArabic(s.tier) + '</span><div style="font-size:10.5px;color:#94a3b8;">ينتهي: ' + fmtDate(s.expiresAt) + ' · عبر: ' + esc(s.via || "إدارة") + '</div></div>' +
                '<button type="button" data-revoke="' + esc(s.email) + '" style="padding:5px 10px;border-radius:9px;background:rgba(244,63,94,0.2);color:#fda4af;border:1px solid rgba(244,63,94,0.4);font-size:11px;font-weight:900;cursor:pointer;">إلغاء</button>' +
              '</div>';
            }).join("") + '</div>');
      }

      if (activeTab === "codes") {
        html =
          '<div style="padding:12px;border-radius:15px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);margin-bottom:12px;">' +
            '<div style="font-size:12.5px;font-weight:900;color:#fde68a;margin-bottom:8px;">🎟️ توليد أكواد تفعيل جديدة</div>' +
            '<div style="display:grid;grid-template-columns:1.5fr 0.8fr 0.8fr auto;gap:7px;">' +
              '<select id="cdTier" style="' + inp + '"><option value="student">🎓 طالب (15₪)</option><option value="teacher_basic">👨‍🏫 معلم أساسي (30₪)</option><option value="teacher_vip">👑 معلم VIP (60₪)</option></select>' +
              '<input id="cdDays" type="number" value="30" placeholder="أيام" style="' + inp + '">' +
              '<input id="cdCount" type="number" value="1" min="1" max="10" placeholder="العدد" style="' + inp + '">' +
              '<button type="button" id="v284GenCodeBtn" style="padding:8px 14px;border-radius:10px;background:#f59e0b;color:#020617;border:none;font-size:12px;font-weight:900;cursor:pointer;">توليد</button>' +
            '</div>' +
          '</div>' +
          (!codes.length ? '<div style="padding:20px;text-align:center;color:#94a3b8;">لم يتم توليد أكواد تفعيل بعد.</div>' :
            '<div style="display:flex;flex-direction:column;gap:7px;">' + codes.slice(0, 40).map(function (c) {
              return '<div style="padding:9px 12px;border-radius:13px;background:rgba(255,255,255,0.05);border:1px solid ' + (c.usedBy ? 'rgba(148,163,184,0.2)' : 'rgba(251,191,36,0.4)') + ';display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;">' +
                '<div><code dir="ltr" style="font-size:13px;font-weight:900;color:' + (c.usedBy ? '#94a3b8' : '#fde68a') + ';">' + esc(c.code) + '</code> <span style="font-size:11px;color:#cbd5e1;">' + tierArabic(c.tier) + ' · ' + (c.days || 30) + ' يوم</span>' +
                (c.usedBy ? ('<div style="font-size:10.5px;color:#6ee7b7;">✅ مُستخدم بواسطة: ' + esc(c.usedBy) + '</div>') : '<div style="font-size:10.5px;color:#7dd3fc;">🟢 جاهز للتسليم</div>') + '</div>' +
                '<div style="display:flex;gap:5px;">' +
                  (!c.usedBy ? '<button type="button" data-copy-code="' + esc(c.code) + '" style="padding:5px 10px;border-radius:9px;background:rgba(56,189,248,0.2);color:#7dd3fc;border:1px solid rgba(56,189,248,0.4);font-size:11px;font-weight:900;cursor:pointer;">📋 نسخ</button>' : '') +
                  '<button type="button" data-del-code="' + esc(c.code) + '" style="padding:5px 9px;border-radius:9px;background:rgba(244,63,94,0.2);color:#fda4af;border:1px solid rgba(244,63,94,0.4);font-size:11px;font-weight:900;cursor:pointer;">حذف</button>' +
                '</div>' +
              '</div>';
            }).join("") + '</div>');
      }

      if (activeTab === "members") {
        var st = (membersData && membersData.stats) || { byRole: {}, bySystem: {}, byRegion: {} };
        var summaryPills = Object.keys(st.bySystem || {}).map(function (k) {
          return '<span style="padding:4px 10px;border-radius:999px;background:rgba(56,189,248,0.16);color:#7dd3fc;font-size:11px;font-weight:800;">' + esc(k) + ': ' + st.bySystem[k] + '</span>';
        }).join(" ");
        html =
          '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px;">' +
            '<div style="display:flex;flex-wrap:wrap;gap:6px;">' + (summaryPills || '<span style="font-size:11.5px;color:#94a3b8;">إجمالي الملفات المكتملة: ' + profs.length + '</span>') + '</div>' +
            (profs.length ? '<button type="button" id="v284ExportCsvBtn" style="padding:6px 12px;border-radius:10px;background:#f59e0b;color:#020617;border:none;font-size:11px;font-weight:900;cursor:pointer;">📥 تصدير CSV</button>' : '') +
          '</div>' +
          (!profs.length ? '<div style="padding:20px;text-align:center;color:#94a3b8;">سيظهر هنا كل عضو يكمل بياناته بعد تسجيل الدخول بحساب Google.</div>' :
            '<div style="display:flex;flex-direction:column;gap:7px;">' + profs.slice(0, 60).map(function (p) {
              return '<div style="padding:9px 12px;border-radius:13px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);font-size:11.5px;">' +
                '<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;"><strong>' + esc(p.name) + ' (' + esc(p.role) + ')</strong><span style="color:#6ee7b7;">' + esc(p.eduSystem) + ' · ' + esc(p.region) + '</span></div>' +
                '<div style="font-size:10.5px;color:#cbd5e1;margin-top:3px;">📧 ' + esc(p.email) + (p.gradeOrSubject ? (' · 📚 ' + esc(p.gradeOrSubject)) : '') + (p.school ? (' · 🏫 ' + esc(p.school)) : '') + (p.whatsapp ? (' · 📱 ' + esc(p.whatsapp)) : '') + '</div>' +
              '</div>';
            }).join("") + '</div>');
      }

      body.innerHTML = tabsHtml + html;

      body.querySelectorAll("[data-adm-tab]").forEach(function (b) {
        b.onclick = function () { activeTab = b.getAttribute("data-adm-tab"); renderAdminBody(); };
      });

      var svCfg = document.getElementById("v284SaveCfgBtn");
      if (svCfg) svCfg.onclick = function () {
        adminPost({
          action: "save_config",
          whatsapp: document.getElementById("cWa").value,
          jawwalPay: document.getElementById("cJw").value,
          palPay: document.getElementById("cPp").value,
          bankAccount: document.getElementById("cBk").value,
          inPersonNote: document.getElementById("cInP").value,
          freeLimit: Number(document.getElementById("cFreeL").value),
          freePaidFirst: Number(document.getElementById("cFreeP").value),
          studentPrice: Number(document.getElementById("cStuP").value),
          studentLimit: Number(document.getElementById("cStuL").value),
          teacherBasicPrice: Number(document.getElementById("cTbP").value),
          teacherBasicLimit: Number(document.getElementById("cTbL").value),
          teacherVipPrice: Number(document.getElementById("cTvP").value),
          teacherVipLimit: Number(document.getElementById("cTvL").value)
        }, "💾 تم حفظ إعدادات الدفع والأسعار سحابياً ✓");
      };

      var grBtn = document.getElementById("v284GrantBtn");
      if (grBtn) grBtn.onclick = function () {
        adminPost({
          action: "grant_user",
          email: document.getElementById("gEmail").value,
          tier: document.getElementById("gTier").value,
          days: Number(document.getElementById("gDays").value) || 30
        }, "✅ تم تفعيل اشتراك العضو بنجاح ✓");
      };

      body.querySelectorAll("[data-revoke]").forEach(function (b) {
        b.onclick = function () { adminPost({ action: "revoke_user", email: b.getAttribute("data-revoke") }, "تم إلغاء الاشتراك ✓"); };
      });

      var gcBtn = document.getElementById("v284GenCodeBtn");
      if (gcBtn) gcBtn.onclick = function () {
        adminPost({
          action: "create_code",
          tier: document.getElementById("cdTier").value,
          days: Number(document.getElementById("cdDays").value) || 30,
          count: Number(document.getElementById("cdCount").value) || 1
        }, "🎟️ تم توليد كود التفعيل بنجاح ✓");
      };

      body.querySelectorAll("[data-copy-code]").forEach(function (b) {
        b.onclick = function () {
          var code = b.getAttribute("data-copy-code");
          if (navigator.clipboard) navigator.clipboard.writeText(code).catch(function () {});
          toast("📋 تم نسخ الكود: " + code, "success");
        };
      });

      body.querySelectorAll("[data-del-code]").forEach(function (b) {
        b.onclick = function () { adminPost({ action: "delete_code", code: b.getAttribute("data-del-code") }, "تم حذف الكود ✓"); };
      });

      var expCsv = document.getElementById("v284ExportCsvBtn");
      if (expCsv) expCsv.onclick = function () {
        var rows = [["الاسم", "البريد", "الصفة", "النظام التعليمي", "الصف/المبحث", "المدرسة", "المحافظة", "واتساب"]];
        profs.forEach(function (p) {
          rows.push([p.name, p.email, p.role, p.eduSystem, p.gradeOrSubject, p.school, p.region, p.whatsapp].map(function (v) { return '"' + String(v || "").replace(/"/g, '""') + '"'; }));
        });
        var blob = new Blob(["\uFEFF" + rows.map(function (r) { return r.join(","); }).join("\n")], { type: "text/csv;charset=utf-8" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "edutech-members-" + new Date().toISOString().slice(0, 10) + ".csv";
        a.click();
      };
    }

    function adminPost(payload, okMsg) {
      getToken().then(function (tok) {
        return fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tok },
          body: JSON.stringify(Object.assign({ idToken: tok }, payload))
        }).then(function (r) { return r.json(); });
      }).then(function (res) {
        if (res && res.ok) { toast(okMsg, "success"); loadAll(); }
        else toast("❌ " + ((res && res.error) || "فشلت العملية"), "error");
      }).catch(function () { toast("❌ تعذّر الاتصال بالسحابة", "error"); });
    }

    loadAll();
  }

  // ==========================================================================
  // 3) مُشغّل كسول لاستوديوهات المعلم والطالب (للحفاظ على سرعة الموقع)
  // ==========================================================================
  function openProStudio(tab) {
    if (global.EduV284Pro && typeof global.EduV284Pro.open === "function") {
      global.EduV284Pro.open(tab);
      return;
    }
    toast("⚡ جارٍ تجهيز الاستوديو…", "info");
    var s = document.createElement("script");
    s.src = "js/v284-pro-studios.js?v=284";
    s.onload = function () {
      if (global.EduV284Pro && typeof global.EduV284Pro.open === "function") global.EduV284Pro.open(tab);
    };
    s.onerror = function () { toast("❌ تعذّر تحميل الاستوديو — تحقق من الاتصال", "error"); };
    document.body.appendChild(s);
  }

  global.EduV284Subs = {
    openPlans: openPlansModal,
    openAdminBilling: openAdminBillingHub,
    openProStudio: openProStudio,
    fetchPlan: fetchSubData,
    getCached: function () { return cachedSubData; }
  };
})(window);
