/* ============================================================================
 * EduTech Mindset — منظومة الأكاديمية والدورات وسجل الزوار PRO (v2.2.0)
 * 1) 🌍 سجل آخر 200 زائر بالتفاصيل الجغرافية (الدولة/المدينة/المنطقة/الشبكة/النظام/المصدر)
 *    + ساعات الذروة + التطبيق مقابل الويب + تنبيه الذروة + زر إرسال ملخص اليوم لتيليجرام
 * 2) 🎓 إدارة المتدربين والشهادات PRO (قبول/إنهاء + إصدار رقم شهادة + شهادة PNG + واتساب مباشر)
 * 3) 🚀 تسجيل ذكي في الدورات (أكواد المنح GAZA100/TEACHER50 + قائمة الانتظار + تقويم Google + دعوة زميل)
 * 4) 🔍 التحقق من الشهادات (/api/verify-cert) + 🧭 اختبار 30 ثانية + 📦 حقيبة ما بعد الدورة + 🧩 كود التضمين للمدارس
 * ============================================================================ */
(function (global) {
  "use strict";

  function $(id) { return document.getElementById(id); }
  function toast(m, t) { if (typeof global.showToast === "function") global.showToast(m, t || "success"); }
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function getIdToken() {
    try {
      var u = (global.firebase && firebase.auth && firebase.auth().currentUser) || (global.Cloud && global.Cloud.user);
      if (u && typeof u.getIdToken === "function") return u.getIdToken().catch(function () { return ""; });
    } catch (e) {}
    return Promise.resolve("");
  }

  /* ==========================================================================
   * 1) سجل آخر 200 زائر بالتفاصيل الجغرافية + ساعات الذروة + تقرير تيليجرام
   * ========================================================================== */
  function openVisitorLog200() {
    var old = $("eduV22VisitorsModal");
    if (old) old.remove();
    var m = document.createElement("div");
    m.id = "eduV22VisitorsModal";
    m.style.cssText = "position:fixed;inset:0;z-index:2147483350;background:rgba(2,6,23,0.88);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:12px;direction:rtl;";
    m.innerHTML =
      '<div style="width:min(98vw,920px);max-height:92vh;display:flex;flex-direction:column;background:#0f172a;color:#fff;border:1.5px solid rgba(56,189,248,0.45);border-radius:24px;overflow:hidden;box-shadow:0 28px 70px rgba(0,0,0,0.65);">' +
        '<div style="padding:14px 18px;border-bottom:1px solid #1e293b;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;background:linear-gradient(135deg,#020617,#0f172a);">' +
          '<div><div style="font-weight:900;font-size:15.5px;color:#38bdf8;">🌍 سجل الزوار الدقيق (آخر 200 زيارة) وساعات الذروة</div><div style="font-size:11px;color:#94a3b8;">بيانات Cloudflare الجغرافية الدقيقة: الدولة • المدينة/المنطقة • شركة الإنترنت • النظام • المصدر • المسار</div></div>' +
          '<div style="display:flex;gap:8px;align-items:center;">' +
            '<button type="button" id="v22TgReportBtn" style="padding:8px 13px;border-radius:11px;background:#0ea5e9;color:#fff;font-size:11.5px;font-weight:900;border:none;cursor:pointer;">✈️ أرسل ملخص اليوم لتيليجرام</button>' +
            '<button type="button" id="v22VisClose" style="width:32px;height:32px;border-radius:10px;background:rgba(244,63,94,0.22);color:#fda4af;border:none;font-weight:900;cursor:pointer;">✕</button>' +
          '</div>' +
        '</div>' +
        '<div id="v22VisBody" style="padding:16px;overflow-y:auto;flex:1;font-size:12.5px;"><div style="color:#94a3b8;text-align:center;padding:30px;">⏳ جارٍ تحميل سجل الزوار الدقيق...</div></div>' +
      '</div>';
    document.body.appendChild(m);
    $("v22VisClose").onclick = function () { m.remove(); };
    m.onclick = function (ev) { if (ev.target === m) m.remove(); };

    var latestPayload = null;
    getIdToken().then(function (tok) {
      return fetch("/api/presence", { headers: tok ? { Authorization: "Bearer " + tok } : {} }).then(function (r) { return r.json(); });
    }).then(function (d) {
      latestPayload = d;
      var body = $("v22VisBody");
      if (!d || d.error) {
        body.innerHTML = '<div style="padding:16px;border-radius:14px;background:rgba(244,63,94,0.15);color:#fecdd3;">🔒 ' + esc((d && d.error) || "سجّل الدخول بحساب الإدارة العليا لعرض سجل الزوار.") + '</div>';
        return;
      }
      var list = Array.isArray(d.recentVisitors) ? d.recentVisitors : [];
      var cities = d.cities || {};
      var topCities = Object.keys(cities).sort(function (a, b) { return cities[b] - cities[a]; }).slice(0, 6);
      var hours = d.hours || {};
      var maxHr = Math.max.apply(null, [1].concat(Object.keys(hours).map(function (k) { return hours[k]; })));
      var avw = d.appVsWeb || { app: 0, web: 0 };

      var html = '';
      if (d.spikeAlert) {
        html += '<div style="margin-bottom:12px;padding:10px 14px;border-radius:12px;background:rgba(245,158,11,0.2);border:1px solid #f59e0b;color:#fde68a;font-weight:800;">🔥 تنبيه ذروة انتشار: يوجد الآن ' + (d.onlineNow ? d.onlineNow.length : 0) + ' زائرًا متصلًا في نفس اللحظة!</div>';
      }
      html +=
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-bottom:14px;">' +
          '<div style="padding:12px;border-radius:14px;background:#1e293b;border:1px solid #334155;"><div style="font-size:11px;color:#94a3b8;">متصلون الآن</div><div style="font-size:22px;font-weight:900;color:#34d399;">' + (d.onlineNow ? d.onlineNow.length : 0) + '</div></div>' +
          '<div style="padding:12px;border-radius:14px;background:#1e293b;border:1px solid #334155;"><div style="font-size:11px;color:#94a3b8;">المسجلون في السجل</div><div style="font-size:22px;font-weight:900;color:#38bdf8;">' + list.length + '</div></div>' +
          '<div style="padding:12px;border-radius:14px;background:#1e293b;border:1px solid #334155;"><div style="font-size:11px;color:#94a3b8;">تطبيق الأندرويد / الويب</div><div style="font-size:18px;font-weight:900;color:#fbbf24;">📱 ' + avw.app + ' / 🌐 ' + avw.web + '</div></div>' +
        '</div>';

      if (topCities.length) {
        html += '<div style="margin-bottom:14px;display:flex;flex-wrap:wrap;gap:6px;align-items:center;"><span style="font-size:11.5px;font-weight:800;color:#cbd5e1;">📍 أعلى المدن اليوم:</span>' +
          topCities.map(function (c) { return '<span style="padding:4px 10px;border-radius:999px;background:rgba(14,165,233,0.16);border:1px solid rgba(56,189,248,0.35);color:#7dd3fc;font-size:11px;font-weight:800;">' + esc(c) + ' (' + cities[c] + ')</span>'; }).join("") +
        '</div>';
      }

      if (Object.keys(hours).length) {
        html += '<div style="margin-bottom:14px;padding:12px;border-radius:14px;background:#020617;border:1px solid #1e293b;"><div style="font-size:11.5px;font-weight:800;color:#fbbf24;margin-bottom:8px;">⏰ ساعات الذروة اليوم (توقيت UTC):</div><div style="display:flex;align-items:flex-end;gap:4px;height:52px;">';
        for (var h = 0; h < 24; h++) {
          var v = hours[String(h)] || 0;
          var pct = Math.max(8, Math.round((v / maxHr) * 100));
          html += '<div title="الساعة ' + h + ': ' + v + ' زيارة" style="flex:1;background:' + (v > 0 ? '#0ea5e9' : '#1e293b') + ';height:' + pct + '%;border-radius:3px 3px 0 0;"></div>';
        }
        html += '</div></div>';
      }

      html += '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:11.5px;text-align:right;">' +
        '<thead><tr style="border-bottom:1px solid #334155;color:#94a3b8;"><th style="padding:8px;">الزائر / المستخدم</th><th style="padding:8px;">الموقع الدقيق</th><th style="padding:8px;">الشبكة (ISP)</th><th style="padding:8px;">الجهاز والمصدر</th><th style="padding:8px;">القسم والوقت</th></tr></thead><tbody>' +
        (list.length ? list.map(function (v) {
          var tStr = v.at ? new Date(v.at).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) : "";
          return '<tr style="border-bottom:1px solid #1e293b;">' +
            '<td style="padding:8px;font-weight:800;">' + esc(v.name || v.email || ("زائر #" + String(v.sid || "").slice(-4).toUpperCase())) + '</td>' +
            '<td style="padding:8px;color:#7dd3fc;">' + esc(v.country + " • " + (v.city || v.region || "غير محدد")) + '</td>' +
            '<td style="padding:8px;color:#cbd5e1;">' + esc(v.isp || "—") + '</td>' +
            '<td style="padding:8px;">' + esc((v.os || v.device) + " • " + (v.referrer || "مباشر")) + '</td>' +
            '<td style="padding:8px;color:#94a3b8;">' + esc(v.firstSection || "الرئيسية") + ' (' + tStr + ')</td>' +
          '</tr>';
        }).join("") : '<tr><td colspan="5" style="padding:20px;text-align:center;color:#94a3b8;">لا توجد زيارات جديدة مسجلة بعد في هذا السجل.</td></tr>') +
        '</tbody></table></div>';
      body.innerHTML = html;
    }).catch(function () {
      var body = $("v22VisBody");
      if (body) body.innerHTML = '<div style="color:#fda4af;">تعذّر تحميل السجل حالياً.</div>';
    });

    $("v22TgReportBtn").onclick = function () {
      if (!latestPayload || latestPayload.error) { toast("انتظر تحميل البيانات أولاً", "warn"); return; }
      var cities = latestPayload.cities || {};
      var topC = Object.keys(cities).sort(function (a, b) { return cities[b] - cities[a]; }).slice(0, 3).map(function (c) { return c + " (" + cities[c] + ")"; }).join("، ") || "غير محدد";
      var reportTxt = "📊 ملخص نشاط EduTech Mindset اليوم:\n" +
        "🟢 المتصلون الآن: " + (latestPayload.onlineNow ? latestPayload.onlineNow.length : 0) + "\n" +
        "🌍 إجمالي الزوار بالسجل: " + (latestPayload.recentVisitors ? latestPayload.recentVisitors.length : 0) + "\n" +
        "📍 أعلى المدن: " + topC + "\n" +
        "📱 التطبيق مقابل الويب: " + ((latestPayload.appVsWeb && latestPayload.appVsWeb.app) || 0) + " تطبيق / " + ((latestPayload.appVsWeb && latestPayload.appVsWeb.web) || 0) + " ويب";
      getIdToken().then(function (tok) {
        return fetch("/api/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: tok, text: reportTxt })
        }).then(function (r) { return r.json(); });
      }).then(function (r) {
        if (r && r.ok) toast("✈️ تم إرسال ملخص اليوم بنجاح إلى تيليجرام!", "success");
        else toast("⚠️ " + ((r && r.error) || "تأكد من تفعيل بوت تيليجرام في الإعدادات"), "warn");
      }).catch(function () { toast("تعذّر الإرسال إلى تيليجرام", "error"); });
    };
  }

  /* ==========================================================================
   * 2) لوحة إدارة المتدربين والشهادات PRO (قبول + إصدار شهادة PNG + واتساب)
   * ========================================================================== */
  function openAdminEnrollmentsPro() {
    var old = $("eduV22EnrModal");
    if (old) old.remove();
    var m = document.createElement("div");
    m.id = "eduV22EnrModal";
    m.style.cssText = "position:fixed;inset:0;z-index:2147483350;background:rgba(2,6,23,0.88);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:12px;direction:rtl;";
    m.innerHTML =
      '<div style="width:min(98vw,900px);max-height:92vh;display:flex;flex-direction:column;background:#0f172a;color:#fff;border:1.5px solid rgba(16,185,129,0.45);border-radius:24px;overflow:hidden;">' +
        '<div style="padding:14px 18px;border-bottom:1px solid #1e293b;display:flex;justify-content:space-between;align-items:center;">' +
          '<div><div style="font-weight:900;font-size:15.5px;color:#34d399;">👑 إدارة المتدربين وإصدار الشهادات المعتمدة (v2.2)</div><div style="font-size:11px;color:#94a3b8;">قبول الطلبات • إصدار رقم تحقق فريد • تحميل شهادة PNG • تواصل واتساب مباشر</div></div>' +
          '<button type="button" id="v22EnrClose" style="width:32px;height:32px;border-radius:10px;background:rgba(244,63,94,0.22);color:#fda4af;border:none;font-weight:900;cursor:pointer;">✕</button>' +
        '</div>' +
        '<div id="v22EnrBody" style="padding:16px;overflow-y:auto;flex:1;font-size:12.5px;"><div style="text-align:center;color:#94a3b8;padding:30px;">⏳ جارٍ تحميل سجل المتدربين المحمي...</div></div>' +
      '</div>';
    document.body.appendChild(m);
    $("v22EnrClose").onclick = function () { m.remove(); };
    m.onclick = function (ev) { if (ev.target === m) m.remove(); };

    function loadList() {
      getIdToken().then(function (tok) {
        return fetch("/api/courses-enrollments", { headers: tok ? { Authorization: "Bearer " + tok } : {} }).then(function (r) { return r.json(); });
      }).then(function (d) {
        var body = $("v22EnrBody");
        if (!d || d.error) {
          body.innerHTML = '<div style="padding:16px;border-radius:14px;background:rgba(244,63,94,0.15);color:#fecdd3;">🔒 ' + esc((d && d.error) || "هذه اللوحة متاحة لحساب الإدارة العليا فقط.") + '</div>';
          return;
        }
        var items = Array.isArray(d.enrollments) ? d.enrollments : [];
        if (!items.length) {
          body.innerHTML = '<div style="text-align:center;padding:30px;color:#94a3b8;">لا يوجد متدربون مسجّلون بعد — يمكنك تجربة نموذج التسجيل الذكي الآن.</div>';
          return;
        }
        body.innerHTML = items.map(function (it) {
          var nm = it.name || it.fullName || "متدرب";
          var cr = it.course || it.courseTitle || "دورة تدريبية";
          var ph = String(it.phone || it.whatsapp || "").replace(/[^\d+]/g, "");
          var stLbl = it.status === "completed" ? "🎓 أنهى الدورة" : (it.status === "approved" ? "✅ مقبول" : (it.status === "waitlist" ? "⏳ قائمة انتظار" : "🕒 قيد المراجعة"));
          return '<div style="padding:12px 14px;border-radius:14px;background:#1e293b;border:1px solid #334155;margin-bottom:10px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;">' +
            '<div>' +
              '<div style="font-weight:900;font-size:13.5px;color:#fff;">' + esc(nm) + ' <span style="font-size:11px;color:#fbbf24;">(' + stLbl + ')</span></div>' +
              '<div style="font-size:11.5px;color:#7dd3fc;">📚 ' + esc(cr) + (it.promoCode ? ' • 🎟️ كود: ' + esc(it.promoCode) : '') + (it.certCode ? ' • 🏅 ' + esc(it.certCode) : '') + '</div>' +
              '<div style="font-size:11px;color:#94a3b8;">📱 ' + esc(ph || "بدون رقم") + ' • 🌍 ' + esc((it.country || "") + " " + (it.city || "")) + '</div>' +
            '</div>' +
            '<div style="display:flex;flex-wrap:wrap;gap:6px;">' +
              '<button type="button" data-act="approve" data-id="' + esc(it.id) + '" style="padding:6px 10px;border-radius:9px;background:#0284c7;color:#fff;font-size:11px;font-weight:800;border:none;cursor:pointer;">✅ قبول</button>' +
              '<button type="button" data-act="cert" data-id="' + esc(it.id) + '" data-nm="' + esc(nm) + '" data-cr="' + esc(cr) + '" data-cc="' + esc(it.certCode || "") + '" style="padding:6px 10px;border-radius:9px;background:#10b981;color:#fff;font-size:11px;font-weight:800;border:none;cursor:pointer;">🎓 إصدار شهادة PNG</button>' +
              (ph ? '<a href="https://wa.me/' + ph.replace(/^\+/, "") + '?text=' + encodeURIComponent("أهلاً " + nm + "، نبارك لك قبولك في دورة «" + cr + "» على منصة EduTech Mindset!" + (it.certCode ? " رقم شهادتك: " + it.certCode : "")) + '" target="_blank" rel="noopener" style="padding:6px 10px;border-radius:9px;background:#059669;color:#fff;font-size:11px;font-weight:800;text-decoration:none;">📲 واتساب</a>' : '') +
            '</div>' +
          '</div>';
        }).join("");

        body.querySelectorAll("[data-act]").forEach(function (btn) {
          btn.onclick = function () {
            var act = btn.getAttribute("data-act");
            var id = btn.getAttribute("data-id");
            getIdToken().then(function (tok) {
              return fetch("/api/courses-enrollments", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: "Bearer " + tok },
                body: JSON.stringify({ id: id, status: act === "cert" ? "completed" : "approved", issueCert: act === "cert" })
              }).then(function (r) { return r.json(); });
            }).then(function (res) {
              if (res && res.ok) {
                if (act === "cert" && res.item) {
                  generateCertificatePng(res.item.name || btn.getAttribute("data-nm"), res.item.course || btn.getAttribute("data-cr"), res.item.certCode);
                } else {
                  toast("تم تحديث حالة المتدرب بنجاح ✅", "success");
                }
                loadList();
              }
            });
          };
        });
      });
    }
    loadList();
  }

  /* ==========================================================================
   * 3) نموذج التسجيل الذكي (أكواد المنح + قائمة الانتظار + تقويم Google + دعوة زميل)
   * ========================================================================== */
  function openSmartEnrollModal(defaultCourse, isWaitlist) {
    var old = $("eduV22SmartEnroll");
    if (old) old.remove();
    var m = document.createElement("div");
    m.id = "eduV22SmartEnroll";
    m.style.cssText = "position:fixed;inset:0;z-index:2147483340;background:rgba(2,6,23,0.86);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:14px;direction:rtl;";
    m.innerHTML =
      '<div style="width:min(96vw,490px);max-height:92vh;overflow-y:auto;background:#0f172a;color:#fff;border:1.5px solid rgba(251,191,36,0.45);border-radius:22px;padding:20px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">' +
          '<div style="font-weight:900;font-size:15px;color:#fbbf24;">' + (isWaitlist ? "⏳ التسجيل في قائمة الانتظار للدفعة القادمة" : "🎓 التسجيل السريع في دورات EduTech Mindset") + '</div>' +
          '<button type="button" id="v22SeClose" style="background:rgba(244,63,94,0.2);color:#fda4af;border:none;border-radius:8px;width:30px;height:30px;font-weight:900;cursor:pointer;">✕</button>' +
        '</div>' +
        '<div id="v22SeForm" style="display:flex;flex-direction:column;gap:10px;font-size:12.5px;">' +
          '<input id="seName" placeholder="الاسم الرباعي (كما سيظهر في الشهادة) *" style="width:100%;padding:10px 12px;border-radius:11px;background:#1e293b;border:1px solid #334155;color:#fff;">' +
          '<input id="sePhone" dir="ltr" placeholder="رقم الواتساب مع المقدمة (مثال: +97059...)" style="width:100%;padding:10px 12px;border-radius:11px;background:#1e293b;border:1px solid #334155;color:#fff;">' +
          '<select id="seCourse" style="width:100%;padding:10px 12px;border-radius:11px;background:#1e293b;border:1px solid #334155;color:#fff;">' +
            '<option value="توظيف الذكاء الاصطناعي وهندسة البرومبتات للمعلمين">توظيف الذكاء الاصطناعي وهندسة البرومبتات للمعلمين</option>' +
            '<option value="تصميم الدروس التفاعلية والصفوف عن بُعد PRO">تصميم الدروس التفاعلية والصفوف عن بُعد PRO</option>' +
            '<option value="المذاكرة الذكية بالذكاء الاصطناعي للتوجيهي والجامعة">المذاكرة الذكية بالذكاء الاصطناعي للتوجيهي والجامعة</option>' +
            '<option value="السيرة الذاتية ATS ومهارات العمل الحر للشباب">السيرة الذاتية ATS ومهارات العمل الحر للشباب</option>' +
          '</select>' +
          '<input id="sePromo" dir="ltr" placeholder="كود منحة أو خصم اختياري (مثال: GAZA100 أو TEACHER50)" style="width:100%;padding:10px 12px;border-radius:11px;background:#1e293b;border:1px solid #334155;color:#fff;">' +
          '<div id="sePromoMsg" style="font-size:11px;color:#34d399;display:none;"></div>' +
          '<button type="button" id="seSubmit" style="padding:11px;border-radius:12px;background:linear-gradient(135deg,#e11d48,#0284c7);color:#fff;font-weight:900;border:none;cursor:pointer;">✅ تأكيد التسجيل الآن</button>' +
        '</div>' +
        '<div id="v22SeDone" style="display:none;text-align:center;line-height:1.8;"></div>' +
      '</div>';
    document.body.appendChild(m);
    if (defaultCourse && $("seCourse")) $("seCourse").value = defaultCourse;
    $("v22SeClose").onclick = function () { m.remove(); };
    m.onclick = function (ev) { if (ev.target === m) m.remove(); };

    var PROMOS = { GAZA100: "🎁 منحة مجانية 100% لطلبة ومعلمي غزة!", TEACHER50: "👩‍🏫 خصم 50% معتمد للمعلمين!", STUDENT30: "🎓 خصم 30% للطلبة!" };
    $("sePromo").oninput = function () {
      var c = $("sePromo").value.trim().toUpperCase();
      var msgEl = $("sePromoMsg");
      if (PROMOS[c]) { msgEl.style.display = "block"; msgEl.textContent = PROMOS[c]; }
      else msgEl.style.display = "none";
    };

    $("seSubmit").onclick = function () {
      var nm = $("seName").value.trim(), ph = $("sePhone").value.trim(), cr = $("seCourse").value, pr = $("sePromo").value.trim().toUpperCase();
      if (!nm || !ph) { toast("يرجى إدخال الاسم ورقم الواتساب", "warn"); return; }
      $("seSubmit").disabled = true;
      $("seSubmit").textContent = "⏳ جارٍ تسجيل طلبك...";
      fetch("/api/courses-enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nm, phone: ph, course: cr, promoCode: PROMOS[pr] ? pr : "", status: isWaitlist ? "waitlist" : "pending" })
      }).then(function (r) { return r.json(); }).then(function (res) {
        if (!res || !res.ok) { toast((res && res.error) || "حدث خطأ أثناء التسجيل", "error"); $("seSubmit").disabled = false; $("seSubmit").textContent = "✅ تأكيد التسجيل الآن"; return; }
        $("v22SeForm").style.display = "none";
        var gCalUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent("دورة EduTech Mindset: " + cr) + "&details=" + encodeURIComponent("تم تسجيلك بنجاح في الدورة. رابط المنصة: https://edutech-mindset.pages.dev/");
        var waShare = "https://wa.me/?text=" + encodeURIComponent("🎓 سجّلت الآن في دورة «" + cr + "» على منصة EduTech Mindset، انضم معي:\nhttps://edutech-mindset.pages.dev/");
        var done = $("v22SeDone");
        done.style.display = "block";
        done.innerHTML =
          '<div style="font-size:36px;">🎉</div>' +
          '<div style="font-weight:900;font-size:16px;color:#34d399;">تم استلام تسجيلك بنجاح!</div>' +
          '<div style="font-size:12px;color:#cbd5e1;margin-bottom:14px;">رقم الطلب: <b>' + esc(res.id || "") + '</b> • سنتواصل معك عبر واتساب قريبًا.</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;">' +
            '<a href="' + gCalUrl + '" target="_blank" rel="noopener" style="padding:9px 14px;border-radius:10px;background:#0284c7;color:#fff;font-size:12px;font-weight:800;text-decoration:none;">📅 أضف لتقويم Google</a>' +
            '<a href="' + waShare + '" target="_blank" rel="noopener" style="padding:9px 14px;border-radius:10px;background:#10b981;color:#fff;font-size:12px;font-weight:800;text-decoration:none;">📲 ادعُ زميلًا على واتساب</a>' +
          '</div>';
      }).catch(function () { toast("تعذّر الاتصال، حاول مرة أخرى", "error"); $("seSubmit").disabled = false; });
    };
  }

  /* ==========================================================================
   * 4) حقيبة ما بعد الدورة (Alumni Locker) + كود تضمين المولّد للمدارس (Embed Widget)
   * ========================================================================== */
  function openAlumniLocker() {
    var old = $("eduV22LockerModal");
    if (old) old.remove();
    var m = document.createElement("div");
    m.id = "eduV22LockerModal";
    m.style.cssText = "position:fixed;inset:0;z-index:2147483340;background:rgba(2,6,23,0.85);display:flex;align-items:center;justify-content:center;padding:14px;direction:rtl;";
    m.innerHTML =
      '<div style="width:min(96vw,460px);background:#0f172a;color:#fff;border:1px solid rgba(168,85,247,0.45);border-radius:22px;padding:20px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><div style="font-weight:900;font-size:15px;color:#c084fc;">📦 حقيبة المتدرب ما بعد الدورة</div><button type="button" id="v22LkClose" style="background:rgba(244,63,94,0.2);color:#fda4af;border:none;border-radius:8px;width:30px;height:30px;font-weight:900;cursor:pointer;">✕</button></div>' +
        '<p style="font-size:11.5px;color:#cbd5e1;margin-bottom:10px;">أدخل كود دفعتك التدريبية (مثال تجريبي: <b>EDU-AI-2026</b>) لفتح ملفات ومصادر الدورة:</p>' +
        '<div style="display:flex;gap:8px;margin-bottom:12px;"><input id="v22LkCode" dir="ltr" placeholder="EDU-AI-2026" style="flex:1;padding:10px;border-radius:11px;background:#1e293b;border:1px solid #334155;color:#fff;text-align:center;font-weight:800;"><button type="button" id="v22LkOpen" style="padding:10px 16px;border-radius:11px;background:#9333ea;color:#fff;font-weight:900;border:none;cursor:pointer;">فتح</button></div>' +
        '<div id="v22LkRes" style="font-size:12px;"></div>' +
      '</div>';
    document.body.appendChild(m);
    $("v22LkClose").onclick = function () { m.remove(); };
    m.onclick = function (ev) { if (ev.target === m) m.remove(); };
    $("v22LkOpen").onclick = function () {
      var code = $("v22LkCode").value.trim().toUpperCase();
      if (code === "EDU-AI-2026" || code.indexOf("EDU-") === 0) {
        $("v22LkRes").innerHTML = '<div style="padding:12px;border-radius:12px;background:rgba(16,185,129,0.14);border:1px solid #10b981;line-height:1.9;">' +
          '<div style="font-weight:900;color:#34d399;">🔓 تم فتح حقيبة الدفعة بنجاح!</div>' +
          '<div>• ⚡ <a href="#generator" onclick="document.getElementById(\'eduV22LockerModal\').remove()" style="color:#7dd3fc;">قوالب البرومبتات الاحترافية الجاهزة</a></div>' +
          '<div>• 🏫 <a href="javascript:void(0)" onclick="document.getElementById(\'eduV22LockerModal\').remove();if(window.EduClassrooms)window.EduClassrooms.open(\'student\')" style="color:#7dd3fc;">الدخول للفصل الافتراضي للدفعة</a></div>' +
          '<div>• 🎓 <a href="javascript:void(0)" onclick="document.getElementById(\'eduV22LockerModal\').remove();window.EduCoursesAcademyV21.openCertVerifier()" style="color:#7dd3fc;">التحقق من شهادة الإتمام المعتمدة</a></div>' +
        '</div>';
      } else {
        $("v22LkRes").innerHTML = '<div style="color:#fda4af;">❌ كود الدفعة غير صحيح — تواصل مع المدرب للحصول على كود دفعتك.</div>';
      }
    };
  }

  function openEmbedWidgetModal() {
    var old = $("eduV22EmbedModal");
    if (old) old.remove();
    var code = '<iframe src="https://edutech-mindset.pages.dev/#generator" width="100%" height="760" style="border:0;border-radius:18px;overflow:hidden;" title="مولّد برومبتات EduTech Mindset"></iframe>';
    var m = document.createElement("div");
    m.id = "eduV22EmbedModal";
    m.style.cssText = "position:fixed;inset:0;z-index:2147483340;background:rgba(2,6,23,0.85);display:flex;align-items:center;justify-content:center;padding:14px;direction:rtl;";
    m.innerHTML =
      '<div style="width:min(96vw,520px);background:#0f172a;color:#fff;border:1px solid rgba(56,189,248,0.45);border-radius:22px;padding:20px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><div style="font-weight:900;font-size:15px;color:#38bdf8;">🧩 كود تضمين مولّد EduTech Mindset في موقع مدرستك</div><button type="button" id="v22EmbClose" style="background:rgba(244,63,94,0.2);color:#fda4af;border:none;border-radius:8px;width:30px;height:30px;font-weight:900;cursor:pointer;">✕</button></div>' +
        '<p style="font-size:11.5px;color:#cbd5e1;margin-bottom:10px;">انسخ هذا الكود وألصقه في أي موقع مدرسة أو مدونة تعليمية لتضمين المولّد مجانًا:</p>' +
        '<textarea readonly rows="4" dir="ltr" style="width:100%;padding:10px;border-radius:11px;background:#020617;border:1px solid #334155;color:#7dd3fc;font-family:monospace;font-size:11.5px;margin-bottom:10px;">' + esc(code) + '</textarea>' +
        '<button type="button" id="v22EmbCopy" style="width:100%;padding:10px;border-radius:11px;background:#0284c7;color:#fff;font-weight:900;border:none;cursor:pointer;">📋 نسخ كود التضمين</button>' +
      '</div>';
    document.body.appendChild(m);
    $("v22EmbClose").onclick = function () { m.remove(); };
    m.onclick = function (ev) { if (ev.target === m) m.remove(); };
    $("v22EmbCopy").onclick = function () {
      if (navigator.clipboard) navigator.clipboard.writeText(code).then(function () { toast("تم نسخ كود التضمين بنجاح 🧩", "success"); });
    };
  }

  /* ==========================================================================
   * 5) التحقق من الشهادات + اختبار 30 ثانية + مولّد شهادة PNG
   * ========================================================================== */
  function openCertVerifier(prefill) {
    var old = $("eduV21CertModal");
    if (old) old.remove();
    var m = document.createElement("div");
    m.id = "eduV21CertModal";
    m.style.cssText = "position:fixed;inset:0;z-index:2147483330;background:rgba(2,6,23,0.85);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:14px;direction:rtl;";
    m.innerHTML =
      '<div style="width:min(96vw,460px);background:#0f172a;color:#fff;border:1px solid rgba(56,189,248,0.45);border-radius:22px;padding:20px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><div style="font-weight:900;font-size:15px;color:#38bdf8;">🎓 التحقق من صحة الشهادة المعتمدة</div><button type="button" id="v21CertClose" style="background:rgba(244,63,94,0.2);color:#fda4af;border:none;border-radius:8px;width:30px;height:30px;font-weight:900;cursor:pointer;">✕</button></div>' +
        '<div style="display:flex;gap:8px;margin-bottom:12px;"><input id="v21CertCode" dir="ltr" placeholder="EDU-2026-XXX" value="' + esc(prefill || "") + '" style="flex:1;padding:10px 12px;border-radius:12px;background:#1e293b;border:1px solid #334155;color:#fff;font-size:13px;font-weight:800;text-align:center;"><button type="button" id="v21CertCheck" style="padding:10px 16px;border-radius:12px;background:#0284c7;color:#fff;font-weight:900;font-size:12.5px;border:none;cursor:pointer;">تحقّق</button></div>' +
        '<div id="v21CertRes" style="font-size:12.5px;"></div>' +
      '</div>';
    document.body.appendChild(m);
    $("v21CertClose").onclick = function () { m.remove(); };
    m.onclick = function (ev) { if (ev.target === m) m.remove(); };
    function doCheck() {
      var code = $("v21CertCode").value.trim().toUpperCase();
      var box = $("v21CertRes");
      if (!code) { toast("أدخل رقم الشهادة أولاً", "warn"); return; }
      box.innerHTML = '<div style="color:#94a3b8;">⏳ جارٍ التحقق...</div>';
      fetch("/api/verify-cert?code=" + encodeURIComponent(code)).then(function (r) { return r.json(); }).then(function (j) {
        if (j && j.valid) {
          box.innerHTML = '<div style="padding:12px;border-radius:14px;background:rgba(16,185,129,0.16);border:1px solid #10b981;color:#d1fae5;line-height:1.8;"><div style="font-weight:900;color:#34d399;">✅ شهادة صحيحة وموثّقة رسميًا</div><div><b>المتدرب:</b> ' + esc(j.name) + '</div><div><b>الدورة:</b> ' + esc(j.course) + '</div><div><b>الرقم:</b> ' + esc(j.certCode) + '</div></div>';
        } else {
          box.innerHTML = '<div style="padding:12px;border-radius:14px;background:rgba(244,63,94,0.15);border:1px solid #f43f5e;color:#fecdd3;">❌ لم يُعثر على شهادة مطابقة لهذا الرقم.</div>';
        }
      }).catch(function () { box.innerHTML = '<div style="color:#fda4af;">تعذّر الاتصال بالخادم.</div>'; });
    }
    $("v21CertCheck").onclick = doCheck;
    if (prefill) doCheck();
  }

  function openCourseFitQuiz() {
    var old = $("eduV21QuizModal");
    if (old) old.remove();
    var m = document.createElement("div");
    m.id = "eduV21QuizModal";
    m.style.cssText = "position:fixed;inset:0;z-index:2147483330;background:rgba(2,6,23,0.85);display:flex;align-items:center;justify-content:center;padding:14px;direction:rtl;";
    m.innerHTML =
      '<div style="width:min(96vw,480px);background:#0f172a;color:#fff;border:1px solid rgba(251,191,36,0.45);border-radius:22px;padding:20px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><div style="font-weight:900;font-size:15px;color:#fbbf24;">🧭 اختبار 30 ثانية: أي دورة تناسبك؟</div><button type="button" id="v21QClose" style="background:rgba(244,63,94,0.2);color:#fda4af;border:none;border-radius:8px;width:30px;height:30px;font-weight:900;cursor:pointer;">✕</button></div>' +
        '<div style="display:flex;flex-direction:column;gap:10px;font-size:12.5px;">' +
          '<label>1. دورك الحالي:<select id="qRole" style="width:100%;margin-top:4px;padding:9px;border-radius:10px;background:#1e293b;color:#fff;border:1px solid #334155;"><option value="teacher">معلم / تربوي / مدرب</option><option value="student">طالب توجيهي أو جامعة</option><option value="grad">خريج / باحث عن عمل حر</option></select></label>' +
          '<label>2. مستواك في الذكاء الاصطناعي:<select id="qLvl" style="width:100%;margin-top:4px;padding:9px;border-radius:10px;background:#1e293b;color:#fff;border:1px solid #334155;"><option value="beg">مبتدئ — من الصفر</option><option value="mid">متوسط — أريد الاحتراف</option></select></label>' +
          '<button type="button" id="v21QGo" style="padding:11px;border-radius:12px;background:linear-gradient(135deg,#f59e0b,#e11d48);color:#fff;font-weight:900;border:none;cursor:pointer;">✨ ارشّح لي الدورة الأنسب</button>' +
          '<div id="v21QRes" style="display:none;padding:12px;border-radius:12px;background:rgba(14,165,233,0.14);border:1px solid rgba(56,189,248,0.4);line-height:1.7;"></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(m);
    $("v21QClose").onclick = function () { m.remove(); };
    m.onclick = function (ev) { if (ev.target === m) m.remove(); };
    $("v21QGo").onclick = function () {
      var r = $("qRole").value, l = $("qLvl").value;
      var rec = r === "teacher"
        ? (l === "beg" ? "توظيف الذكاء الاصطناعي وهندسة البرومبتات للمعلمين" : "تصميم الدروس التفاعلية والصفوف عن بُعد PRO")
        : (r === "student" ? "المذاكرة الذكية بالذكاء الاصطناعي للتوجيهي والجامعة" : "السيرة الذاتية ATS ومهارات العمل الحر للشباب");
      var box = $("v21QRes");
      box.style.display = "block";
      box.innerHTML = '<div style="font-weight:900;color:#38bdf8;">🎯 ترشيحنا لك: ' + esc(rec) + '</div>' +
        '<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">' +
          '<button type="button" id="v22EnrollNow" style="padding:8px 14px;border-radius:9px;background:#e11d48;color:#fff;font-size:11.5px;font-weight:900;border:none;cursor:pointer;">🎓 سجّل في هذه الدورة الآن</button>' +
        '</div>';
      $("v22EnrollNow").onclick = function () { m.remove(); openSmartEnrollModal(rec, false); };
    };
  }

  function generateCertificatePng(traineeName, courseTitle, certCode) {
    var c = document.createElement("canvas");
    c.width = 1400; c.height = 990;
    var ctx = c.getContext("2d");
    var g = ctx.createLinearGradient(0, 0, 1400, 990);
    g.addColorStop(0, "#020617"); g.addColorStop(0.5, "#0f172a"); g.addColorStop(1, "#1e1b4b");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1400, 990);
    ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 8; ctx.strokeRect(36, 36, 1328, 918);
    ctx.strokeStyle = "rgba(56,189,248,0.45)"; ctx.lineWidth = 2; ctx.strokeRect(56, 56, 1288, 878);
    ctx.direction = "rtl"; ctx.textAlign = "center";
    ctx.fillStyle = "#fbbf24"; ctx.font = "bold 34px Cairo, sans-serif";
    ctx.fillText("مبادرة EduTech Mindset — عقلية التعليم والتكنولوجيا", 700, 150);
    ctx.fillStyle = "#ffffff"; ctx.font = "900 64px Cairo, sans-serif";
    ctx.fillText("شهادة إتمام وتميّز", 700, 260);
    ctx.fillStyle = "#cbd5e1"; ctx.font = "600 30px Cairo, sans-serif";
    ctx.fillText("تشهد إدارة المنصة بأن المتدرب/ة:", 700, 355);
    ctx.fillStyle = "#38bdf8"; ctx.font = "900 56px Cairo, sans-serif";
    ctx.fillText(traineeName || "اسم المتدرب", 700, 455);
    ctx.fillStyle = "#e2e8f0"; ctx.font = "600 30px Cairo, sans-serif";
    ctx.fillText("قد أتمّ بنجاح متطلبات الدورة التدريبية:", 700, 545);
    ctx.fillStyle = "#fbbf24"; ctx.font = "800 40px Cairo, sans-serif";
    ctx.fillText(courseTitle || "توظيف الذكاء الاصطناعي في التعليم", 700, 625);
    ctx.fillStyle = "#94a3b8"; ctx.font = "bold 24px Cairo, sans-serif";
    ctx.fillText("إشراف: الأستاذ باسل أشرف الفقعاوي • رقم التحقق: " + (certCode || "EDU-2026-001"), 700, 820);
    ctx.fillStyle = "#38bdf8"; ctx.font = "bold 22px Cairo, sans-serif";
    ctx.fillText("للتحقق الرسمي: edutech-mindset.pages.dev/?cert=" + (certCode || "EDU-2026-001"), 700, 870);
    var a = document.createElement("a");
    a.download = "EduTech-Certificate-" + (certCode || "cert") + ".png";
    a.href = c.toDataURL("image/png");
    a.click();
    toast("تم إصدار وتحميل الشهادة PNG بنجاح 🎓", "success");
  }

  global.EduCoursesAcademyV21 = {
    version: "2.2.0",
    openVisitorLog200: openVisitorLog200,
    openAdminEnrollmentsPro: openAdminEnrollmentsPro,
    openSmartEnrollModal: openSmartEnrollModal,
    openAlumniLocker: openAlumniLocker,
    openEmbedWidgetModal: openEmbedWidgetModal,
    openCertVerifier: openCertVerifier,
    openCourseFitQuiz: openCourseFitQuiz,
    generateCertificatePng: generateCertificatePng
  };

  try {
    var sp = new URLSearchParams(location.search);
    var cCode = sp.get("cert");
    if (cCode) setTimeout(function () { openCertVerifier(cCode); }, 600);
  } catch (e) {}
})(window);
