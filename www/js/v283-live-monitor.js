/* ============================================================================
 * EduTech Mindset — v283 Live Presence Monitor & Admin Control Center
 * وحدة المراقبة الحية (المتصلون الآن + النشطون + أكثر الأدوات + البث الفوري
 * + رادار الأخطاء الصامت + وضع الصيانة الذكي + تقرير النشاط اليومي PDF)
 * ============================================================================ */
(function (global) {
  "use strict";

  var SID_KEY = "edutech_v283_sid";
  var DISMISSED_BC_KEY = "edutech_v283_dismissed_bc";
  var PING_INTERVAL_MS = 55000;
  var ADMIN_POLL_MS = 25000;
  var MODAL_REFRESH_MS = 15000;

  var state = {
    sid: "",
    lastSection: "",
    lastPingAt: 0,
    errorCountSent: 0,
    latestData: null,
    modalOpen: false,
    activeTab: "online",
    autoRefresh: true,
    modalTimer: null,
    adminBadgeTimer: null
  };

  function getSid() {
    if (state.sid) return state.sid;
    try {
      var s = sessionStorage.getItem(SID_KEY);
      if (!s) {
        s = "s_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
        sessionStorage.setItem(SID_KEY, s);
      }
      state.sid = s;
      return s;
    } catch (_) {
      state.sid = "s_" + Math.random().toString(36).slice(2, 10);
      return state.sid;
    }
  }

  function detectDevice() {
    var ua = (navigator.userAgent || "").toLowerCase();
    var w = window.innerWidth || 0;
    if (/ipad|tablet|playbook|silk/.test(ua) || (w >= 640 && w <= 1024 && /android|mobile/.test(ua))) return "tablet";
    if (/mobi|android|iphone|ipod|blackberry|iemobile|opera mini/.test(ua) || (w > 0 && w < 768)) return "mobile";
    return "desktop";
  }

  function detectActiveSection() {
    // 1) فحص النوافذ المفتوحة أولاً
    if (document.getElementById("v283LiveMonitorModal")) return { id: "live_monitor", label: "مركز المراقبة الحية" };
    if (document.getElementById("eduKidsTaaseesModal") || document.querySelector(".kt-overlay")) return { id: "kids_taasees", label: "ركن التأسيس السليم للأطفال" };
    if (document.getElementById("v281TrackerModal")) return { id: "student_tracker", label: "متابعة الطلاب اليومية" };
    if (document.getElementById("v281UnrwaModal")) return { id: "unrwa_templates", label: "نماذج الأونروا الرسمية" };
    if (document.getElementById("v281TawjihiModal")) return { id: "tawjihi_exam", label: "امتحان التوجيهي التفاعلي" };
    if (document.querySelector(".edu-v279-modal")) return { id: "v279_modal", label: "أدوات الإدارة والتقارير" };
    if (document.getElementById("voiceStudioModal") && !document.getElementById("voiceStudioModal").classList.contains("hidden")) return { id: "voice_studio", label: "الاستوديو الصوتي الفصيح" };
    if (document.getElementById("assistantModal") && !document.getElementById("assistantModal").classList.contains("hidden")) return { id: "ai_assistant", label: "المساعد الذكي AI" };
    if (document.getElementById("adminModal") && !document.getElementById("adminModal").classList.contains("hidden")) return { id: "admin_panel", label: "لوحة التحكم" };

    // 2) فحص القسم الظاهر في الشاشة
    var checks = [
      { id: "learnSection", key: "curriculum", label: "المناهج والكتب الدراسية" },
      { id: "unifiedToolsHub", key: "tools", label: "مركز الأدوات والمختبرات" },
      { id: "coursesSection", key: "courses", label: "الدورات التدريبية" },
      { id: "homeVideos", key: "videos", label: "مكتبة الفيديوهات التعليمية" },
      { id: "adminDevFooterHub", key: "admin_hub", label: "مركز قيادة الإدارة" }
    ];
    var vh = window.innerHeight || 700;
    for (var i = 0; i < checks.length; i++) {
      var el = document.getElementById(checks[i].id);
      if (!el || el.classList.contains("hidden") || el.style.display === "none") continue;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.55 && r.bottom > vh * 0.2) {
        return { id: checks[i].key, label: checks[i].label };
      }
    }
    return { id: "home", label: "الصفحة الرئيسية" };
  }

  function getCurrentUserInfo() {
    var u = (global.Cloud && global.Cloud.user) || null;
    if (!u && global.firebase && typeof global.firebase.auth === "function") {
      try { u = global.firebase.auth().currentUser; } catch (_) {}
    }
    var email = (u && u.email) ? String(u.email).trim().toLowerCase() : "";
    var name = (u && u.displayName) ? String(u.displayName).trim() : "";
    var isAdmin = !!(global.Cloud && global.Cloud.isAdmin) ||
      email === "baselashraf800@gmail.com" || email === "edutechm1994@gmail.com";
    return { user: u, email: email, name: name, isAdmin: isAdmin };
  }

  function getIdTokenSafe() {
    var info = getCurrentUserInfo();
    if (info.user && typeof info.user.getIdToken === "function") {
      return info.user.getIdToken().catch(function () { return ""; });
    }
    return Promise.resolve("");
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function toast(msg, type) {
    if (typeof global.showToast === "function") {
      try { global.showToast(msg, type || "info"); return; } catch (_) {}
    }
    var t = document.createElement("div");
    t.textContent = msg;
    t.style.cssText = "position:fixed;bottom:84px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#0f172a;color:#fff;padding:10px 16px;border-radius:12px;font-size:12.5px;font-weight:800;border:1px solid rgba(56,189,248,0.45);box-shadow:0 12px 30px rgba(0,0,0,0.4);direction:rtl;";
    document.body.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 3200);
  }

  // ==========================================================================
  // 1) استقبال البث الفوري (Live Broadcast Banner)
  // ==========================================================================
  function renderBroadcastBanner(bc) {
    var existing = document.getElementById("v283LiveBroadcastBar");
    if (!bc || !bc.active || !bc.message) {
      if (existing) existing.remove();
      return;
    }
    try {
      if (sessionStorage.getItem(DISMISSED_BC_KEY) === bc.id) return;
    } catch (_) {}

    if (existing && existing.getAttribute("data-bc-id") === bc.id) return;
    if (existing) existing.remove();

    var palette = {
      info: { bg: "linear-gradient(135deg,#0284c7,#1d4ed8)", border: "#7dd3fc", ico: "📣" },
      success: { bg: "linear-gradient(135deg,#059669,#047857)", border: "#6ee7b7", ico: "✅" },
      warn: { bg: "linear-gradient(135deg,#d97706,#b45309)", border: "#fde68a", ico: "⚠️" },
      urgent: { bg: "linear-gradient(135deg,#dc2626,#991b1b)", border: "#fca5a5", ico: "🚨" }
    };
    var p = palette[bc.type] || palette.info;

    var bar = document.createElement("div");
    bar.id = "v283LiveBroadcastBar";
    bar.setAttribute("data-bc-id", bc.id || "");
    bar.style.cssText = "position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:2147483000;width:min(94vw,640px);border-radius:18px;background:" + p.bg + ";color:#fff;border:1.5px solid " + p.border + ";box-shadow:0 18px 42px rgba(2,6,23,0.45);padding:12px 14px;direction:rtl;display:flex;align-items:flex-start;gap:10px;animation:v283SlideDown .35s ease;";
    bar.innerHTML =
      '<div style="font-size:22px;line-height:1;flex-shrink:0;margin-top:2px;">' + p.ico + '</div>' +
      '<div style="flex:1;min-width:0;">' +
        '<div style="font-size:13px;font-weight:900;margin-bottom:2px;">' + esc(bc.title || "تنبيه مباشر من الإدارة") + '</div>' +
        '<div style="font-size:12px;line-height:1.55;opacity:0.96;word-break:break-word;">' + esc(bc.message) + '</div>' +
      '</div>' +
      '<button type="button" id="v283CloseBcBtn" aria-label="إغلاق التنبيه" style="background:rgba(255,255,255,0.2);color:#fff;border:none;width:28px;height:28px;border-radius:10px;font-size:14px;font-weight:900;cursor:pointer;flex-shrink:0;">✕</button>';

    if (!document.getElementById("v283AnimStyle")) {
      var st = document.createElement("style");
      st.id = "v283AnimStyle";
      st.textContent = "@keyframes v283SlideDown{from{opacity:0;transform:translate(-50%,-18px);}to{opacity:1;transform:translate(-50%,0);}} @keyframes v283Pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.45;transform:scale(1.28);}}";
      document.head.appendChild(st);
    }
    document.body.appendChild(bar);
    var closeBtn = document.getElementById("v283CloseBcBtn");
    if (closeBtn) {
      closeBtn.onclick = function () {
        try { sessionStorage.setItem(DISMISSED_BC_KEY, bc.id || "1"); } catch (_) {}
        bar.remove();
      };
    }
  }

  // ==========================================================================
  // 2) وضع الصيانة الذكي (Smart Maintenance Overlay — يستثني الإدارة)
  // ==========================================================================
  function applyMaintenanceOverlay(mt) {
    var overlay = document.getElementById("v283MaintenanceOverlay");
    var adminPill = document.getElementById("v283AdminMaintPill");

    if (!mt || !mt.enabled) {
      if (overlay) overlay.remove();
      if (adminPill) adminPill.remove();
      return;
    }

    var info = getCurrentUserInfo();
    var adminBypass = info.isAdmin || location.search.indexOf("admin=1") >= 0;

    if (adminBypass) {
      if (overlay) overlay.remove();
      if (!adminPill) {
        adminPill = document.createElement("div");
        adminPill.id = "v283AdminMaintPill";
        adminPill.style.cssText = "position:fixed;bottom:76px;right:12px;z-index:2147482900;background:linear-gradient(135deg,#b45309,#dc2626);color:#fff;padding:7px 12px;border-radius:999px;font-size:11px;font-weight:900;box-shadow:0 10px 24px rgba(0,0,0,0.4);border:1px solid #fde68a;cursor:pointer;direction:rtl;display:flex;align-items:center;gap:6px;";
        adminPill.innerHTML = '<span>🛠️ وضع الصيانة مفعّل للزوار</span><span style="background:rgba(255,255,255,0.22);padding:2px 7px;border-radius:999px;">إدارة</span>';
        adminPill.onclick = function () { openLiveMonitor("maintenance"); };
        document.body.appendChild(adminPill);
      }
      return;
    }

    if (adminPill) adminPill.remove();
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "v283MaintenanceOverlay";
      overlay.style.cssText = "position:fixed;inset:0;z-index:2147483500;background:radial-gradient(circle at top,#1e1b4b,#0f172a 55%,#020617);color:#fff;display:flex;align-items:center;justify-content:center;padding:20px;direction:rtl;text-align:center;";
      document.body.appendChild(overlay);
    }
    overlay.innerHTML =
      '<div style="max-width:480px;width:100%;background:rgba(15,23,42,0.92);border:1.5px solid rgba(251,191,36,0.45);border-radius:26px;padding:28px 22px;box-shadow:0 24px 60px rgba(0,0,0,0.6);">' +
        '<img src="assets/logo.png" alt="EduTech Mindset" style="width:74px;height:74px;border-radius:20px;margin:0 auto 14px;display:block;object-fit:cover;box-shadow:0 10px 26px rgba(0,0,0,0.4);">' +
        '<div style="display:inline-block;padding:4px 12px;border-radius:999px;background:rgba(245,158,11,0.2);color:#fde68a;font-size:11.5px;font-weight:900;margin-bottom:10px;">🛠️ صيانة وتطوير سريع</div>' +
        '<h2 style="font-size:20px;font-weight:900;margin:0 0 10px;color:#fff;">' + esc(mt.title || "تحديث سريع لمنصة EduTech Mindset") + '</h2>' +
        '<p style="font-size:13.5px;line-height:1.75;color:#cbd5e1;margin:0 0 16px;">' + esc(mt.message || "نعمل حالياً على تحسين الأداء وإضافة مزايا جديدة لخدمتكم. سنعود خلال دقائق.") + '</p>' +
        (mt.eta ? '<div style="padding:8px 12px;border-radius:12px;background:rgba(56,189,248,0.14);border:1px solid rgba(56,189,248,0.3);color:#7dd3fc;font-size:12px;font-weight:800;margin-bottom:16px;">⏱️ الوقت المتوقع للعودة: ' + esc(mt.eta) + '</div>' : '') +
        '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">' +
          '<button type="button" onclick="location.reload()" style="padding:9px 18px;border-radius:12px;background:linear-gradient(135deg,#0ea5e9,#2563eb);color:#fff;border:none;font-size:12.5px;font-weight:900;cursor:pointer;">🔄 تحديث الصفحة</button>' +
          '<button type="button" id="v283MaintAdminLogin" style="padding:9px 14px;border-radius:12px;background:rgba(255,255,255,0.08);color:#fde68a;border:1px solid rgba(251,191,36,0.35);font-size:12px;font-weight:800;cursor:pointer;">🔑 دخول الإدارة</button>' +
        '</div>' +
      '</div>';

    var lg = document.getElementById("v283MaintAdminLogin");
    if (lg) {
      lg.onclick = function () {
        overlay.remove();
        if (global.Cloud && typeof global.Cloud.loginWithGoogle === "function") {
          global.Cloud.loginWithGoogle();
        } else {
          var btn = document.getElementById("btnAccountNav") || document.querySelector("[data-auth-open]");
          if (btn) btn.click();
        }
      };
    }
  }

  // ==========================================================================
  // 3) نبض الحضور الصامت (Silent Presence Heartbeat)
  // ==========================================================================
  function sendPresencePing(force) {
    if (!force && document.visibilityState === "hidden") return;
    var now = Date.now();
    if (!force && now - state.lastPingAt < 12000) return;
    state.lastPingAt = now;

    var sec = detectActiveSection();
    state.lastSection = sec.label;
    var info = getCurrentUserInfo();

    var payload = {
      sid: getSid(),
      name: info.name,
      email: info.email,
      isAdmin: info.isAdmin,
      device: detectDevice(),
        isApp: !!(global.EduNativeBridge && global.EduNativeBridge.isNative),
        referrer: (function(){ var r = document.referrer || ""; if (!r) return "مباشر"; if (/whatsapp|wa\.me/i.test(r)) return "واتساب"; if (/facebook|fb\./i.test(r)) return "فيسبوك"; if (/google\./i.test(r)) return "جوجل"; if (/t\.me|telegram/i.test(r)) return "تيليجرام"; try { return new URL(r).hostname; } catch(e){ return "رابط خارجي"; } })(),
      section: sec.id,
      sectionLabel: sec.label
    };

    fetch("/api/presence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true
    }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d || !d.ok) return;
      renderBroadcastBanner(d.broadcast || null);
      applyMaintenanceOverlay(d.maintenance || null);
    }).catch(function () {});
  }

  // ==========================================================================
  // 4) رادار الأخطاء الصامت (Silent Error Radar)
  // ==========================================================================
  function reportClientError(msg, src, line) {
    if (!msg || state.errorCountSent >= 5) return;
    var sMsg = String(msg).trim();
    if (!sMsg || sMsg === "Script error." || sMsg.indexOf("ResizeObserver loop") >= 0) return;
    state.errorCountSent++;
    var sec = detectActiveSection();
    fetch("/api/client-errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        msg: sMsg.slice(0, 220),
        src: String(src || "").replace(location.origin, "").slice(0, 140),
        line: parseInt(line, 10) || 0,
        device: detectDevice(),
        isApp: !!(global.EduNativeBridge && global.EduNativeBridge.isNative),
        referrer: (function(){ var r = document.referrer || ""; if (!r) return "مباشر"; if (/whatsapp|wa\.me/i.test(r)) return "واتساب"; if (/facebook|fb\./i.test(r)) return "فيسبوك"; if (/google\./i.test(r)) return "جوجل"; if (/t\.me|telegram/i.test(r)) return "تيليجرام"; try { return new URL(r).hostname; } catch(e){ return "رابط خارجي"; } })(),
        section: sec.label
      }),
      keepalive: true
    }).catch(function () {});
  }

  function initErrorRadar() {
    global.addEventListener("error", function (ev) {
      if (ev && ev.message) reportClientError(ev.message, ev.filename, ev.lineno);
    });
    global.addEventListener("unhandledrejection", function (ev) {
      var r = ev && ev.reason;
      var m = (r && (r.message || String(r))) || "";
      if (m && m.indexOf("AbortError") < 0 && m.indexOf("Failed to fetch") < 0) {
        reportClientError("Promise: " + m, "", 0);
      }
    });
  }

  // ==========================================================================
  // 5) جلب بيانات لوحة المراقبة الحية (للإدارة فقط)
  // ==========================================================================
  function fetchAdminLiveStats() {
    return getIdTokenSafe().then(function (tok) {
      if (!tok) return { ok: false, error: "يرجى تسجيل الدخول بحساب الإدارة العليا أولاً 🔒" };
      return fetch("/api/presence", {
        method: "GET",
        headers: { "Authorization": "Bearer " + tok }
      }).then(function (r) {
        return r.json().catch(function () { return { ok: false, error: "تعذّر قراءة استجابة السيرفر" }; });
      });
    }).then(function (data) {
      if (data && data.ok) {
        state.latestData = data;
        updateAdminBadges(data);
      }
      return data;
    }).catch(function () {
      return { ok: false, error: "تعذّر الاتصال بالسحابة — تحقق من الإنترنت" };
    });
  }

  function updateAdminBadges(d) {
    if (!d || !d.ok) return;
    var n = d.onlineCount || 0;
    var badge = document.getElementById("v283HubOnlineBadge");
    if (badge) {
      badge.textContent = "🟢 " + n + " متصل الآن";
      badge.style.display = "inline-flex";
    }
    var pill = document.getElementById("v283HealthOnlinePill");
    if (pill) {
      pill.innerHTML = '<span style="width:7px;height:7px;border-radius:999px;background:#22c55e;display:inline-block;animation:v283Pulse 1.6s infinite;"></span> متصل الآن: ' + n + ' · اليوم: ' + (d.todayUnique || 0);
    }
    var errCount = Array.isArray(d.errors) ? d.errors.length : 0;
    var sub = document.getElementById("v283HubOnlineSub");
    if (sub) {
      sub.textContent = "الآن: " + n + " · آخر 15د: " + (d.active15mCount || 0) + " · اليوم: " + (d.todayUnique || 0) + (errCount > 0 ? (" · ⚠️ " + errCount) : "");
    }
  }

  // ==========================================================================
  // 6) تصدير تقرير النشاط اليومي الرسمي (A4 PDF)
  // ==========================================================================
  function exportDailyPdfReport() {
    var d = state.latestData;
    if (!d || !d.ok) {
      toast("⏳ انتظر تحميل البيانات أولاً…", "info");
      return;
    }
    var nowStr = new Date().toLocaleString("ar-EG", { dateStyle: "full", timeStyle: "short" });
    var toolsRows = (d.topTools || []).map(function (t, idx) {
      return "<tr><td>" + (idx + 1) + "</td><td>" + esc(t.name) + "</td><td><strong>" + t.count + "</strong></td><td>" + t.pct + "%</td></tr>";
    }).join("") || '<tr><td colspan="4" style="text-align:center;color:#64748b;">لا توجد زيارات مسجّلة للأدوات بعد اليوم</td></tr>';

    var onlineRows = (d.active15m || []).slice(0, 25).map(function (s, idx) {
      var devLabel = s.device === "desktop" ? "كمبيوتر" : (s.device === "tablet" ? "تابلت" : "جوال");
      var stLabel = s.secondsAgo <= 95 ? "🟢 متصل الآن" : ("🟡 نشط قبل " + Math.max(1, Math.round(s.secondsAgo / 60)) + " د");
      return "<tr><td>" + (idx + 1) + "</td><td>" + esc(s.displayName) + (s.isAdmin ? " (إدارة)" : "") + "</td><td>" + esc(s.sectionLabel) + "</td><td>" + devLabel + "</td><td>" + esc(s.country + (s.city ? " - " + s.city : "")) + "</td><td>" + stLabel + "</td></tr>";
    }).join("") || '<tr><td colspan="6" style="text-align:center;color:#64748b;">لا توجد جلسات نشطة حالياً</td></tr>';

    var errCount = Array.isArray(d.errors) ? d.errors.length : 0;
    var html =
      '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تقرير النشاط اليومي — EduTech Mindset</title>' +
      '<style>@page{size:A4;margin:14mm;}body{font-family:Tahoma,Arial,sans-serif;color:#0f172a;background:#fff;margin:0;padding:0;line-height:1.6;}' +
      '.hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #0f172a;padding-bottom:12px;margin-bottom:16px;}' +
      '.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px;}' +
      '.kpi{border:1px solid #cbd5e1;border-radius:10px;padding:10px;text-align:center;background:#f8fafc;}' +
      '.kpi b{display:block;font-size:20px;color:#0369a1;} .kpi span{font-size:11px;color:#475569;}' +
      'h3{font-size:14px;background:#0f172a;color:#fff;padding:6px 12px;border-radius:8px;margin:16px 0 8px;}' +
      'table{width:100%;border-collapse:collapse;font-size:11.5px;}th,td{border:1px solid #cbd5e1;padding:6px 8px;text-align:right;}th{background:#f1f5f9;}' +
      '.ftr{margin-top:24px;padding-top:10px;border-top:1px dashed #94a3b8;display:flex;justify-content:space-between;font-size:11px;color:#475569;}' +
      '</style></head><body>' +
      '<div class="hdr"><div><div style="font-size:18px;font-weight:900;color:#0f172a;">منصة EduTech Mindset — التقرير اليومي للنشاط الحي</div><div style="font-size:12px;color:#475569;">إشراف عام: أ. باسل أشرف الفقعاوي · غزة — فلسطين</div></div><div style="text-align:left;font-size:11px;color:#334155;"><div>التاريخ: ' + esc(d.date) + '</div><div>وقت الإصدار: ' + esc(nowStr) + '</div></div></div>' +
      '<div class="kpis">' +
        '<div class="kpi"><b>' + (d.onlineCount || 0) + '</b><span>المتصلون الآن</span></div>' +
        '<div class="kpi"><b>' + (d.active15mCount || 0) + '</b><span>النشطون (آخر 15 دقيقة)</span></div>' +
        '<div class="kpi"><b>' + (d.todayUnique || 0) + '</b><span>زوار اليوم (فريد)</span></div>' +
        '<div class="kpi"><b>' + errCount + '</b><span>أخطاء مسجّلة بالرادار</span></div>' +
      '</div>' +
      '<h3>📊 توزيع الأجهزة اليوم</h3>' +
      '<table><tr><th>📱 الهواتف الذكية</th><th>💻 أجهزة الكمبيوتر</th><th>📟 الأجهزة اللوحية</th><th>إجمالي النبضات اليوم</th></tr>' +
      '<tr><td><strong>' + ((d.devices && d.devices.mobile) || 0) + '</strong></td><td><strong>' + ((d.devices && d.devices.desktop) || 0) + '</strong></td><td><strong>' + ((d.devices && d.devices.tablet) || 0) + '</strong></td><td><strong>' + (d.todayPings || 0) + '</strong></td></tr></table>' +
      '<h3>🔥 أكثر الأدوات والأقسام استخداماً اليوم</h3>' +
      '<table><thead><tr><th>#</th><th>الأداة / القسم</th><th>عدد الزيارات</th><th>النسبة</th></tr></thead><tbody>' + toolsRows + '</tbody></table>' +
      '<h3>🟢 الجلسات المتصلة والنشطة حالياً</h3>' +
      '<table><thead><tr><th>#</th><th>المستخدم / الزائر</th><th>القسم الحالي</th><th>الجهاز</th><th>الموقع</th><th>الحالة</th></tr></thead><tbody>' + onlineRows + '</tbody></table>' +
      '<div class="ftr"><span>صادر آلياً من مركز المراقبة الحية — EduTech Mindset (v283)</span><span>https://edutech-mindset.pages.dev</span></div>' +
      '<script>window.onload=function(){setTimeout(function(){window.print();},350);};<\/script></body></html>';

    var w = window.open("", "_blank");
    if (!w) { toast("⚠️ يرجى السماح بالنوافذ المنبثقة لتصدير التقرير PDF", "warn"); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  // ==========================================================================
  // 7) واجهة نافذة مركز المراقبة الحية والتحكم (Admin Modal)
  // ==========================================================================
  function renderModalContent() {
    var body = document.getElementById("v283MonitorBody");
    if (!body) return;
    var d = state.latestData;

    if (!d) {
      body.innerHTML = '<div style="padding:36px 16px;text-align:center;color:#94a3b8;font-size:13px;">⏳ جارٍ الاتصال بالسحابة وجلب المتصلين الآن…</div>';
      return;
    }
    if (!d.ok) {
      body.innerHTML = '<div style="padding:26px 16px;text-align:center;color:#fda4af;font-size:13px;font-weight:800;">' + esc(d.error || "تعذّر تحميل البيانات") + '</div>';
      return;
    }

    var errCount = Array.isArray(d.errors) ? d.errors.length : 0;
    var mtOn = !!(d.maintenance && d.maintenance.enabled);
    var bcOn = !!(d.broadcast && d.broadcast.active);

    // KPI Cards
    var kpis =
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin-bottom:14px;">' +
        '<div style="padding:11px;border-radius:16px;background:rgba(16,185,129,0.14);border:1px solid rgba(52,211,153,0.35);">' +
          '<div style="font-size:11px;color:#6ee7b7;font-weight:800;">🟢 متصل الآن</div>' +
          '<div style="font-size:24px;font-weight:900;color:#fff;margin:2px 0;">' + (d.onlineCount || 0) + '</div>' +
          '<div style="font-size:10px;color:#cbd5e1;">مسجّلون: ' + (d.registeredOnline || 0) + ' · زوار: ' + (d.guestsOnline || 0) + '</div>' +
        '</div>' +
        '<div style="padding:11px;border-radius:16px;background:rgba(56,189,248,0.14);border:1px solid rgba(56,189,248,0.35);">' +
          '<div style="font-size:11px;color:#7dd3fc;font-weight:800;">⚡ نشط (15 دقيقة)</div>' +
          '<div style="font-size:24px;font-weight:900;color:#fff;margin:2px 0;">' + (d.active15mCount || 0) + '</div>' +
          '<div style="font-size:10px;color:#cbd5e1;">جلسات فعّالة حديثاً</div>' +
        '</div>' +
        '<div style="padding:11px;border-radius:16px;background:rgba(168,85,247,0.14);border:1px solid rgba(192,132,252,0.35);">' +
          '<div style="font-size:11px;color:#d8b4fe;font-weight:800;">📅 زوار اليوم</div>' +
          '<div style="font-size:24px;font-weight:900;color:#fff;margin:2px 0;">' + (d.todayUnique || 0) + '</div>' +
          '<div style="font-size:10px;color:#cbd5e1;">📱 ' + ((d.devices && d.devices.mobile) || 0) + ' · 💻 ' + ((d.devices && d.devices.desktop) || 0) + ' · 📟 ' + ((d.devices && d.devices.tablet) || 0) + '</div>' +
        '</div>' +
        '<div style="padding:11px;border-radius:16px;background:' + (errCount > 0 ? 'rgba(244,63,94,0.16)' : 'rgba(255,255,255,0.06)') + ';border:1px solid ' + (errCount > 0 ? 'rgba(251,113,133,0.4)' : 'rgba(255,255,255,0.15)') + ';">' +
          '<div style="font-size:11px;color:' + (errCount > 0 ? '#fda4af' : '#cbd5e1') + ';font-weight:800;">🛡️ رادار الأخطاء</div>' +
          '<div style="font-size:24px;font-weight:900;color:#fff;margin:2px 0;">' + errCount + '</div>' +
          '<div style="font-size:10px;color:#cbd5e1;">' + (mtOn ? '🛠️ وضع الصيانة: مفعّل' : (bcOn ? '📣 بث فوري: نشط' : '✅ الموقع يعمل طبيعياً')) + '</div>' +
        '</div>' +
      '</div>';

    // Tabs Bar
    var tabsDef = [
      { id: "online", label: "🟢 المتصلون (" + (d.active15mCount || 0) + ")" },
      { id: "tools", label: "🔥 أكثر الأدوات" },
      { id: "broadcast", label: "📣 بث فوري" + (bcOn ? " ●" : "") },
      { id: "errors", label: "🛡️ الأخطاء (" + errCount + ")" },
      { id: "maintenance", label: "🛠️ الصيانة" + (mtOn ? " ●" : "") }
    ];
    var tabsHtml = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;">' +
      tabsDef.map(function (t) {
        var act = state.activeTab === t.id;
        return '<button type="button" data-v283-tab="' + t.id + '" style="padding:7px 12px;border-radius:12px;font-size:11.5px;font-weight:900;cursor:pointer;border:1px solid ' + (act ? '#38bdf8' : 'rgba(255,255,255,0.15)') + ';background:' + (act ? 'linear-gradient(135deg,#0284c7,#2563eb)' : 'rgba(255,255,255,0.06)') + ';color:#fff;">' + t.label + '</button>';
      }).join("") +
    '</div>';

    var panelHtml = "";

    // TAB 1: Online & Active 15m
    if (state.activeTab === "online") {
      var list = d.active15m || [];
      if (!list.length) {
        panelHtml = '<div style="padding:26px;text-align:center;color:#94a3b8;font-size:12.5px;background:rgba(255,255,255,0.04);border-radius:16px;">لا يوجد متصلون آخرون في هذه اللحظة — سيظهر كل زائر تلقائياً فور فتح الموقع.</div>';
      } else {
        panelHtml = '<div style="display:flex;flex-direction:column;gap:8px;">' + list.map(function (s) {
          var isLive = s.secondsAgo <= 95;
          var devIco = s.device === "desktop" ? "💻" : (s.device === "tablet" ? "📟" : "📱");
          var roleBadge = s.isAdmin
            ? '<span style="padding:2px 7px;border-radius:999px;background:rgba(251,191,36,0.22);color:#fde68a;font-size:10px;font-weight:900;">👑 إدارة</span>'
            : (s.isRegistered
              ? '<span style="padding:2px 7px;border-radius:999px;background:rgba(56,189,248,0.2);color:#7dd3fc;font-size:10px;font-weight:900;">👤 مسجّل</span>'
              : '<span style="padding:2px 7px;border-radius:999px;background:rgba(148,163,184,0.2);color:#cbd5e1;font-size:10px;font-weight:800;">🌐 زائر</span>');
          var agoText = s.secondsAgo <= 20 ? "الآن" : (s.secondsAgo < 60 ? ("منذ " + s.secondsAgo + " ث") : ("منذ " + Math.round(s.secondsAgo / 60) + " د"));
          return '<div style="padding:10px 12px;border-radius:14px;background:rgba(255,255,255,0.05);border:1px solid ' + (isLive ? 'rgba(34,197,94,0.35)' : 'rgba(255,255,255,0.1)') + ';display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;">' +
            '<div style="display:flex;align-items:center;gap:9px;min-width:0;">' +
              '<span style="width:10px;height:10px;border-radius:999px;background:' + (isLive ? '#22c55e' : '#f59e0b') + ';flex-shrink:0;' + (isLive ? 'animation:v283Pulse 1.6s infinite;' : '') + '"></span>' +
              '<div>' +
                '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">' +
                  '<strong style="font-size:12.5px;color:#fff;">' + esc(s.displayName) + '</strong>' + roleBadge +
                '</div>' +
                '<div style="font-size:11px;color:#94a3b8;margin-top:2px;">📍 يتصفح: <span style="color:#e2e8f0;font-weight:700;">' + esc(s.sectionLabel) + '</span></div>' +
              '</div>' +
            '</div>' +
            '<div style="text-align:left;font-size:10.5px;color:#cbd5e1;display:flex;flex-direction:column;align-items:flex-end;gap:2px;">' +
              '<span>' + devIco + ' ' + esc(s.country + (s.city ? (" · " + s.city) : "")) + '</span>' +
              '<span style="color:' + (isLive ? '#6ee7b7' : '#fde68a') + ';font-weight:800;">' + agoText + ' · مدة الجلسة: ' + s.durationMin + ' د</span>' +
            '</div>' +
          '</div>';
        }).join("") + '</div>';
      }
    }

    // TAB 2: Top Tools
    if (state.activeTab === "tools") {
      var tools = d.topTools || [];
      if (!tools.length) {
        panelHtml = '<div style="padding:26px;text-align:center;color:#94a3b8;font-size:12.5px;background:rgba(255,255,255,0.04);border-radius:16px;">ستظهر هنا أكثر الأدوات والأقسام استخداماً مع تزايد زيارات اليوم.</div>';
      } else {
        panelHtml = '<div style="display:flex;flex-direction:column;gap:10px;">' + tools.map(function (t, idx) {
          return '<div style="padding:10px 12px;border-radius:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);">' +
            '<div style="display:flex;justify-content:space-between;font-size:12px;font-weight:800;margin-bottom:6px;">' +
              '<span>' + (idx + 1) + '. ' + esc(t.name) + '</span>' +
              '<span style="color:#7dd3fc;">' + t.count + ' زيارة (' + t.pct + '%)</span>' +
            '</div>' +
            '<div style="height:8px;border-radius:999px;background:rgba(255,255,255,0.1);overflow:hidden;">' +
              '<div style="height:100%;width:' + Math.max(4, t.pct) + '%;background:linear-gradient(90deg,#38bdf8,#10b981);border-radius:999px;"></div>' +
            '</div>' +
          '</div>';
        }).join("") + '</div>';
      }
    }

    // TAB 3: Live Broadcast
    if (state.activeTab === "broadcast") {
      var curBc = d.broadcast || {};
      panelHtml =
        '<div style="padding:14px;border-radius:16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);">' +
          '<div style="font-size:13px;font-weight:900;color:#fde68a;margin-bottom:8px;">📣 إرسال تنبيه فوري يظهر لكل المتصلين الآن</div>' +
          (curBc.active ? '<div style="padding:10px;border-radius:12px;background:rgba(16,185,129,0.15);border:1px solid rgba(52,211,153,0.4);margin-bottom:12px;font-size:11.5px;"><strong>البث النشط حالياً:</strong> ' + esc(curBc.title) + ' — ' + esc(curBc.message) + '</div>' : '') +
          '<div style="display:grid;gap:9px;">' +
            '<select id="v283BcType" style="padding:9px 11px;border-radius:11px;background:#0f172a;color:#fff;border:1px solid rgba(255,255,255,0.2);font-size:12px;font-weight:700;">' +
              '<option value="info"' + (curBc.type === "info" ? " selected" : "") + '>ℹ️ تنبيه معلوماتي (أزرق)</option>' +
              '<option value="success"' + (curBc.type === "success" ? " selected" : "") + '>✅ بشارة / إضافة جديدة (أخضر)</option>' +
              '<option value="warn"' + (curBc.type === "warn" ? " selected" : "") + '>⚠️ تنبيه مهم (ذهبي)</option>' +
              '<option value="urgent"' + (curBc.type === "urgent" ? " selected" : "") + '>🚨 إعلان عاجل (أحمر)</option>' +
            '</select>' +
            '<input id="v283BcTitle" type="text" placeholder="عنوان التنبيه (مثلاً: 📢 تحديث جديد في ركن التأسيس)" value="' + esc(curBc.title || "") + '" style="padding:9px 11px;border-radius:11px;background:#0f172a;color:#fff;border:1px solid rgba(255,255,255,0.2);font-size:12px;">' +
            '<textarea id="v283BcMsg" rows="3" placeholder="اكتب الرسالة التي ستظهر فوراً على شاشة كل زائر متصل حالياً…" style="padding:9px 11px;border-radius:11px;background:#0f172a;color:#fff;border:1px solid rgba(255,255,255,0.2);font-size:12px;resize:vertical;">' + esc(curBc.message || "") + '</textarea>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
              '<button type="button" id="v283BcSendBtn" style="padding:9px 16px;border-radius:12px;background:linear-gradient(135deg,#10b981,#047857);color:#fff;border:none;font-size:12px;font-weight:900;cursor:pointer;">🚀 بث الآن لجميع المتصلين</button>' +
              '<button type="button" id="v283BcStopBtn" style="padding:9px 14px;border-radius:12px;background:rgba(244,63,94,0.2);color:#fda4af;border:1px solid rgba(244,63,94,0.4);font-size:12px;font-weight:900;cursor:pointer;">🛑 إيقاف البث الحالي</button>' +
            '</div>' +
          '</div>' +
        '</div>';
    }

    // TAB 4: Error Radar
    if (state.activeTab === "errors") {
      var errs = Array.isArray(d.errors) ? d.errors : [];
      panelHtml =
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:8px;flex-wrap:wrap;">' +
          '<div style="font-size:12px;color:#cbd5e1;">يلتقط أخطاء الجافاسكربت تلقائياً من متصفحات الزوار لتصحيحها فوراً.</div>' +
          (errs.length ? '<button type="button" id="v283ClearErrsBtn" style="padding:6px 12px;border-radius:10px;background:rgba(244,63,94,0.2);color:#fda4af;border:1px solid rgba(244,63,94,0.4);font-size:11px;font-weight:900;cursor:pointer;">🧹 مسح السجل</button>' : '') +
        '</div>' +
        (!errs.length
          ? '<div style="padding:26px;text-align:center;color:#6ee7b7;font-size:13px;font-weight:800;background:rgba(16,185,129,0.1);border:1px solid rgba(52,211,153,0.3);border-radius:16px;">✅ لا توجد أخطاء مسجّلة — المنصة تعمل بسلاسة تامة!</div>'
          : '<div style="display:flex;flex-direction:column;gap:8px;">' + errs.map(function (e) {
              return '<div style="padding:10px 12px;border-radius:14px;background:rgba(244,63,94,0.1);border:1px solid rgba(251,113,133,0.3);">' +
                '<div style="display:flex;justify-content:space-between;gap:8px;font-size:11.5px;font-weight:900;color:#fda4af;">' +
                  '<span style="word-break:break-word;">⚠️ ' + esc(e.msg) + '</span>' +
                  '<span style="flex-shrink:0;background:rgba(244,63,94,0.25);padding:2px 8px;border-radius:999px;">×' + (e.count || 1) + '</span>' +
                '</div>' +
                '<div style="font-size:10.5px;color:#cbd5e1;margin-top:4px;">📄 ' + esc(e.src || "غير محدد") + (e.line ? (":" + e.line) : "") + ' · 📱 ' + esc(e.device) + (e.section ? (' · 📍 ' + esc(e.section)) : '') + '</div>' +
              '</div>';
            }).join("") + '</div>');
    }

    // TAB 5: Smart Maintenance Mode
    if (state.activeTab === "maintenance") {
      var curMt = d.maintenance || {};
      panelHtml =
        '<div style="padding:14px;border-radius:16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;flex-wrap:wrap;">' +
            '<div><div style="font-size:13.5px;font-weight:900;color:#fde68a;">🛠️ وضع الصيانة الذكي</div><div style="font-size:11px;color:#cbd5e1;">يُظهر صفحة صيانة راقية للزوار، بينما يبقى الموقع مفتوحاً بالكامل لحسابك كمدير.</div></div>' +
            '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:7px 12px;border-radius:12px;background:' + (curMt.enabled ? 'rgba(220,38,38,0.25)' : 'rgba(16,185,129,0.2)') + ';border:1px solid ' + (curMt.enabled ? '#f87171' : '#34d399') + ';font-size:12px;font-weight:900;">' +
              '<input type="checkbox" id="v283MtEnabled"' + (curMt.enabled ? ' checked' : '') + ' style="width:16px;height:16px;accent-color:#f59e0b;">' +
              '<span>' + (curMt.enabled ? 'مفعّل حالياً للزوار' : 'متوقف (الموقع متاح)') + '</span>' +
            '</label>' +
          '</div>' +
          '<div style="display:grid;gap:9px;">' +
            '<input id="v283MtTitle" type="text" placeholder="عنوان صفحة الصيانة" value="' + esc(curMt.title || "🛠️ تحديث سريع لمنصة EduTech Mindset") + '" style="padding:9px 11px;border-radius:11px;background:#0f172a;color:#fff;border:1px solid rgba(255,255,255,0.2);font-size:12px;">' +
            '<textarea id="v283MtMsg" rows="3" placeholder="الرسالة التي ستظهر للزوار…" style="padding:9px 11px;border-radius:11px;background:#0f172a;color:#fff;border:1px solid rgba(255,255,255,0.2);font-size:12px;resize:vertical;">' + esc(curMt.message || "نعمل حالياً على تحسين الأداء وإضافة مزايا جديدة لخدمتكم. سنعود خلال دقائق قليلة بإذن الله.") + '</textarea>' +
            '<input id="v283MtEta" type="text" placeholder="الوقت المتوقع للعودة (مثلاً: خلال 10 دقائق)" value="' + esc(curMt.eta || "خلال دقائق قليلة") + '" style="padding:9px 11px;border-radius:11px;background:#0f172a;color:#fff;border:1px solid rgba(255,255,255,0.2);font-size:12px;">' +
            '<div><button type="button" id="v283MtSaveBtn" style="padding:9px 18px;border-radius:12px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#020617;border:none;font-size:12px;font-weight:900;cursor:pointer;">💾 حفظ وتطبيق وضع الصيانة</button></div>' +
          '</div>' +
        '</div>';
    }

    body.innerHTML = kpis + tabsHtml + panelHtml;

    // Bind Tab Switchers
    body.querySelectorAll("[data-v283-tab]").forEach(function (btn) {
      btn.onclick = function () {
        state.activeTab = btn.getAttribute("data-v283-tab");
        renderModalContent();
      };
    });

    // Bind Broadcast Actions
    var sendBc = document.getElementById("v283BcSendBtn");
    if (sendBc) sendBc.onclick = function () { saveBroadcast(true); };
    var stopBc = document.getElementById("v283BcStopBtn");
    if (stopBc) stopBc.onclick = function () { saveBroadcast(false); };

    // Bind Clear Errors
    var clrErr = document.getElementById("v283ClearErrsBtn");
    if (clrErr) clrErr.onclick = clearClientErrors;

    // Bind Maintenance Save
    var saveMt = document.getElementById("v283MtSaveBtn");
    if (saveMt) saveMt.onclick = saveMaintenance;
  }

  function saveBroadcast(active) {
    var titleEl = document.getElementById("v283BcTitle");
    var msgEl = document.getElementById("v283BcMsg");
    var typeEl = document.getElementById("v283BcType");
    var msg = msgEl ? msgEl.value.trim() : "";
    if (active && !msg) {
      toast("⚠️ اكتب نص الرسالة أولاً قبل البث", "warn");
      return;
    }
    getIdTokenSafe().then(function (tok) {
      return fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tok },
        body: JSON.stringify({
          idToken: tok,
          active: active,
          title: titleEl ? titleEl.value.trim() : "",
          message: msg,
          type: typeEl ? typeEl.value : "info"
        })
      }).then(function (r) { return r.json(); });
    }).then(function (res) {
      if (res && res.ok) {
        toast(active ? "🚀 تم بث التنبيه الفوري لجميع المتصلين ✓" : "🛑 تم إيقاف البث الفوري ✓", "success");
        renderBroadcastBanner(active ? res.broadcast : null);
        refreshModalData();
      } else {
        toast("❌ " + ((res && res.error) || "فشل تحديث البث"), "error");
      }
    }).catch(function () { toast("❌ تعذّر الاتصال بالسحابة", "error"); });
  }

  function clearClientErrors() {
    getIdTokenSafe().then(function (tok) {
      return fetch("/api/client-errors", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tok },
        body: JSON.stringify({ idToken: tok, action: "clear" })
      }).then(function (r) { return r.json(); });
    }).then(function (res) {
      if (res && res.ok) {
        toast("🧹 تم مسح سجل الأخطاء ✓", "success");
        refreshModalData();
      } else {
        toast("❌ " + ((res && res.error) || "فشل المسح"), "error");
      }
    }).catch(function () { toast("❌ تعذّر الاتصال بالسحابة", "error"); });
  }

  function saveMaintenance() {
    var enEl = document.getElementById("v283MtEnabled");
    var tiEl = document.getElementById("v283MtTitle");
    var msEl = document.getElementById("v283MtMsg");
    var etEl = document.getElementById("v283MtEta");
    var enabled = !!(enEl && enEl.checked);
    getIdTokenSafe().then(function (tok) {
      return fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tok },
        body: JSON.stringify({
          idToken: tok,
          enabled: enabled,
          title: tiEl ? tiEl.value.trim() : "",
          message: msEl ? msEl.value.trim() : "",
          eta: etEl ? etEl.value.trim() : ""
        })
      }).then(function (r) { return r.json(); });
    }).then(function (res) {
      if (res && res.ok) {
        toast(enabled ? "🛠️ تم تفعيل وضع الصيانة للزوار فقط ✓" : "✅ تم إيقاف وضع الصيانة وإتاحة الموقع للجميع ✓", "success");
        applyMaintenanceOverlay(res.maintenance);
        refreshModalData();
      } else {
        toast("❌ " + ((res && res.error) || "فشل حفظ وضع الصيانة"), "error");
      }
    }).catch(function () { toast("❌ تعذّر الاتصال بالسحابة", "error"); });
  }

  function refreshModalData() {
    return fetchAdminLiveStats().then(function () {
      if (state.modalOpen) renderModalContent();
    });
  }

  function openLiveMonitor(initialTab) {
    if (initialTab) state.activeTab = initialTab;
    var old = document.getElementById("v283LiveMonitorModal");
    if (old) old.remove();

    var modal = document.createElement("div");
    modal.id = "v283LiveMonitorModal";
    modal.style.cssText = "position:fixed;inset:0;z-index:2147483200;background:rgba(2,6,23,0.78);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:12px;direction:rtl;";
    modal.innerHTML =
      '<div style="width:min(96vw,840px);max-height:90vh;display:flex;flex-direction:column;border-radius:24px;background:linear-gradient(155deg,#020617,#0f172a,#1e1b4b);color:#fff;border:1.5px solid rgba(52,211,153,0.45);box-shadow:0 26px 64px rgba(0,0,0,0.65);overflow:hidden;">' +
        '<div style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.12);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;">' +
          '<div style="display:flex;align-items:center;gap:10px;">' +
            '<span style="width:38px;height:38px;border-radius:12px;background:linear-gradient(135deg,#10b981,#047857);display:flex;align-items:center;justify-content:center;font-size:19px;">📡</span>' +
            '<div>' +
              '<div style="font-size:15px;font-weight:900;display:flex;align-items:center;gap:7px;"><span>المتصلون الآن ومركز التحكم الحي</span><span style="width:8px;height:8px;border-radius:999px;background:#22c55e;display:inline-block;animation:v283Pulse 1.5s infinite;"></span></div>' +
              '<div style="font-size:11px;color:#94a3b8;">بيانات حقيقية فورية عبر Cloudflare KV · تحديث تلقائي كل 15 ثانية</div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">' +
            '<button type="button" id="v283RefreshNowBtn" style="padding:7px 11px;border-radius:10px;background:rgba(56,189,248,0.2);color:#7dd3fc;border:1px solid rgba(56,189,248,0.4);font-size:11px;font-weight:900;cursor:pointer;">🔄 تحديث</button>' +
            '<button type="button" id="v283ExportPdfBtn" style="padding:7px 11px;border-radius:10px;background:rgba(251,191,36,0.2);color:#fde68a;border:1px solid rgba(251,191,36,0.4);font-size:11px;font-weight:900;cursor:pointer;">📄 تقرير PDF</button>' +
            '<button type="button" id="v22OpenVisitorLogBtn" onclick="if(window.EduCoursesAcademyV21)window.EduCoursesAcademyV21.openVisitorLog200()" style="padding:6px 10px;border-radius:10px;background:#0284c7;color:#fff;font-size:11px;font-weight:900;border:none;cursor:pointer;margin-left:6px;">🌍 سجل 200 زائر + تيليجرام</button><button type="button" id="v283CloseModalBtn" style="width:32px;height:32px;border-radius:10px;background:rgba(244,63,94,0.22);color:#fda4af;border:1px solid rgba(244,63,94,0.4);font-size:14px;font-weight:900;cursor:pointer;">✕</button>' +
          '</div>' +
        '</div>' +
        '<div id="v283MonitorBody" style="padding:14px 16px;overflow-y:auto;flex:1;"></div>' +
      '</div>';

    document.body.appendChild(modal);
    state.modalOpen = true;

    function closeModal() {
      state.modalOpen = false;
      if (state.modalTimer) { clearInterval(state.modalTimer); state.modalTimer = null; }
      if (modal.parentNode) modal.parentNode.removeChild(modal);
    }

    modal.addEventListener("click", function (ev) { if (ev.target === modal) closeModal(); });
    document.getElementById("v283CloseModalBtn").onclick = closeModal;
    document.getElementById("v283RefreshNowBtn").onclick = function () {
      toast("🔄 جارٍ التحديث…", "info");
      refreshModalData();
    };
    document.getElementById("v283ExportPdfBtn").onclick = exportDailyPdfReport;

    renderModalContent();
    sendPresencePing(true);
    setTimeout(refreshModalData, 350);

    if (state.modalTimer) clearInterval(state.modalTimer);
    state.modalTimer = setInterval(function () {
      if (state.modalOpen && state.autoRefresh && document.visibilityState === "visible") {
        refreshModalData();
      }
    }, MODAL_REFRESH_MS);
  }

  // ==========================================================================
  // 8) تشغيل تلقائي خفيف (Boot)
  // ==========================================================================
  function startAdminBadgePolling() {
    if (state.adminBadgeTimer) return;
    function tick() {
      if (document.visibilityState !== "visible") return;
      var info = getCurrentUserInfo();
      if (info.isAdmin && document.getElementById("adminDevFooterHub")) {
        fetchAdminLiveStats();
      }
    }
    setTimeout(tick, 3200);
    state.adminBadgeTimer = setInterval(tick, ADMIN_POLL_MS);
  }

  function boot() {
    initErrorRadar();
    setTimeout(function () { sendPresencePing(true); }, 1500);
    setInterval(function () { sendPresencePing(false); }, PING_INTERVAL_MS);

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") sendPresencePing(false);
    });
    window.addEventListener("hashchange", function () {
      setTimeout(function () { sendPresencePing(false); }, 400);
    });

    startAdminBadgePolling();
  }

  global.EduV283Monitor = {
    open: openLiveMonitor,
    refresh: refreshModalData,
    ping: sendPresencePing,
    exportPdf: exportDailyPdfReport
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window);
