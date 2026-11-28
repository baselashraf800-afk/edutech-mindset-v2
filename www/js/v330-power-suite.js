/* EduTech Mindset v3.3.0 Power Suite:
 * 1. PWA Auto-Refresh Banner (SW_UPDATED listener)
 * 2. Offline-First Status & Auto-Sync Queue
 * 3. Smart Exam & Tawjihi Performance Analytics + Printable Report
 */
(function () {
  "use strict";

  var ANALYTICS_KEY = "edutech_exam_analytics_v330";
  var SYNC_QUEUE_KEY = "edutech_offline_sync_queue_v330";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showUpdateBanner(version) {
    if (document.getElementById("edutech-sw-update-toast")) return;
    var bar = document.createElement("div");
    bar.id = "edutech-sw-update-toast";
    bar.setAttribute("dir", "rtl");
    bar.style.cssText =
      "position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:99999;" +
      "background:#0f172a;color:#f8fafc;border:1px solid #38bdf8;border-radius:16px;" +
      "padding:10px 16px;display:flex;align-items:center;gap:12px;box-shadow:0 12px 32px rgba(2,6,23,.45);" +
      "font-family:Cairo,system-ui,sans-serif;font-size:13px;max-width:92vw;";
    bar.innerHTML =
      '<span>✨ يتوفر تحديث جديد للمنصة' + (version ? " (v" + esc(version) + ")" : "") + '</span>' +
      '<button id="edutech-sw-reload-btn" style="background:#0284c7;color:#fff;border:none;border-radius:10px;padding:6px 14px;font-weight:700;cursor:pointer;font-family:inherit;">تحديث الآن</button>' +
      '<button id="edutech-sw-close-btn" aria-label="إغلاق" style="background:transparent;color:#94a3b8;border:none;font-size:16px;cursor:pointer;padding:2px 4px;">✕</button>';
    document.body.appendChild(bar);
    var rBtn = document.getElementById("edutech-sw-reload-btn");
    var cBtn = document.getElementById("edutech-sw-close-btn");
    if (rBtn) rBtn.onclick = function () { window.location.reload(); };
    if (cBtn) cBtn.onclick = function () { bar.remove(); };
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", function (ev) {
      if (ev && ev.data && ev.data.type === "SW_UPDATED") {
        showUpdateBanner(ev.data.version || "");
      }
    });
  }

  function getSyncQueue() {
    try { return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]") || []; } catch (e) { return []; }
  }
  function saveSyncQueue(q) {
    try { localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(q.slice(-50))); } catch (e) {}
  }

  function enqueueOfflineAction(url, method, payload) {
    var q = getSyncQueue();
    q.push({ url: url, method: method || "POST", payload: payload, ts: Date.now() });
    saveSyncQueue(q);
    updateOfflineBadge();
  }

  async function flushOfflineQueue() {
    if (!navigator.onLine) return;
    var q = getSyncQueue();
    if (!q.length) return;
    var remaining = [];
    for (var i = 0; i < q.length; i++) {
      var item = q[i];
      try {
        var res = await fetch(item.url, {
          method: item.method || "POST",
          headers: { "Content-Type": "application/json" },
          body: item.payload ? JSON.stringify(item.payload) : undefined
        });
        if (!res.ok) remaining.push(item);
      } catch (e) {
        remaining.push(item);
      }
    }
    saveSyncQueue(remaining);
    updateOfflineBadge();
  }

  function updateOfflineBadge() {
    var existing = document.getElementById("edutech-offline-pill");
    var pending = getSyncQueue().length;
    if (navigator.onLine && pending === 0) {
      if (existing) existing.remove();
      return;
    }
    if (!existing) {
      existing = document.createElement("div");
      existing.id = "edutech-offline-pill";
      existing.setAttribute("dir", "rtl");
      existing.style.cssText =
        "position:fixed;bottom:14px;right:14px;z-index:99990;background:#1e293b;color:#f8fafc;" +
        "border:1px solid #f59e0b;border-radius:999px;padding:6px 14px;font-size:12px;" +
        "font-family:Cairo,system-ui,sans-serif;box-shadow:0 8px 20px rgba(0,0,0,.35);";
      document.body.appendChild(existing);
    }
    if (!navigator.onLine) {
      existing.textContent = "📡 وضع عدم الاتصال — الدروس والكتب المحفوظة متاحة" + (pending ? " (" + pending + " بانتظار المزامنة)" : "");
    } else {
      existing.textContent = "🔄 جارٍ مزامنة " + pending + " تحديثات محفوظة...";
    }
  }

  window.addEventListener("offline", updateOfflineBadge);
  window.addEventListener("online", function () {
    updateOfflineBadge();
    flushOfflineQueue();
  });

  function loadAttempts() {
    try { return JSON.parse(localStorage.getItem(ANALYTICS_KEY) || "[]") || []; } catch (e) { return []; }
  }
  function saveAttempts(list) {
    try { localStorage.setItem(ANALYTICS_KEY, JSON.stringify(list.slice(-100))); } catch (e) {}
  }

  function recordAttempt(data) {
    if (!data) return;
    var score = Number(data.score || 0);
    var total = Math.max(1, Number(data.total || 1));
    var pct = Math.round((score / total) * 100);
    var list = loadAttempts();
    list.push({
      subject: String(data.subject || "مادة عامة").trim(),
      unit: String(data.unit || "وحدة عامة").trim(),
      score: score,
      total: total,
      pct: pct,
      date: new Date().toISOString()
    });
    saveAttempts(list);
    return analyzePerformance();
  }

  function analyzePerformance() {
    var list = loadAttempts();
    var byUnit = {};
    var sumPct = 0;
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      sumPct += a.pct;
      var key = a.subject + " — " + a.unit;
      if (!byUnit[key]) byUnit[key] = { subject: a.subject, unit: a.unit, count: 0, totalPct: 0, lastPct: a.pct };
      byUnit[key].count++;
      byUnit[key].totalPct += a.pct;
      byUnit[key].lastPct = a.pct;
    }
    var units = Object.keys(byUnit).map(function (k) {
      var u = byUnit[k];
      var avg = Math.round(u.totalPct / u.count);
      return { key: k, subject: u.subject, unit: u.unit, attempts: u.count, avgPct: avg, lastPct: u.lastPct };
    });
    units.sort(function (a, b) { return a.avgPct - b.avgPct; });
    var weaknesses = units.filter(function (u) { return u.avgPct < 70; });
    var strengths = units.filter(function (u) { return u.avgPct >= 80; }).reverse();
    var overall = list.length ? Math.round(sumPct / list.length) : 0;
    return {
      totalAttempts: list.length,
      overallAvg: overall,
      strengths: strengths,
      weaknesses: weaknesses,
      units: units
    };
  }

  function openReportModal() {
    var old = document.getElementById("edutech-analytics-modal");
    if (old) old.remove();
    var report = analyzePerformance();
    var wrap = document.createElement("div");
    wrap.id = "edutech-analytics-modal";
    wrap.setAttribute("dir", "rtl");
    wrap.style.cssText =
      "position:fixed;inset:0;z-index:99998;background:rgba(2,6,23,.72);backdrop-filter:blur(6px);" +
      "display:flex;align-items:center;justify-content:center;padding:16px;font-family:Cairo,system-ui,sans-serif;";

    var weakHtml = report.weaknesses.length
      ? report.weaknesses.map(function (w) {
          return '<li style="margin:6px 0;">⚠️ <strong>' + esc(w.key) + '</strong> — المعدل: ' + w.avgPct + '% (يُنصح بمراجعة الملخص وحل 5 أسئلة إضافية)</li>';
        }).join("")
      : '<li style="color:#10b981;">لا توجد نقاط ضعف حرجة مسجّلة حتى الآن.</li>';

    var strHtml = report.strengths.length
      ? report.strengths.map(function (s) {
          return '<li style="margin:6px 0;">✅ <strong>' + esc(s.key) + '</strong> — المعدل: ' + s.avgPct + '%</li>';
        }).join("")
      : '<li style="color:#94a3b8;">أكمل اختباراً واحداً على الأقل لإظهار نقاط القوة.</li>';

    wrap.innerHTML =
      '<div style="background:#0f172a;color:#f8fafc;border:1px solid #38bdf8;border-radius:20px;max-width:560px;width:100%;max-height:85vh;overflow:auto;padding:22px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">' +
          '<h3 style="margin:0;font-size:18px;color:#38bdf8;">📊 تحليل الأداء الذكي — EduTech Mindset</h3>' +
          '<button id="edu-an-close" style="background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer;">✕</button>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">' +
          '<div style="background:#1e293b;border-radius:12px;padding:12px;text-align:center;"><div style="font-size:12px;color:#94a3b8;">عدد الاختبارات</div><div style="font-size:22px;font-weight:800;">' + report.totalAttempts + '</div></div>' +
          '<div style="background:#1e293b;border-radius:12px;padding:12px;text-align:center;"><div style="font-size:12px;color:#94a3b8;">المعدل العام</div><div style="font-size:22px;font-weight:800;color:#38bdf8;">' + report.overallAvg + '%</div></div>' +
        '</div>' +
        '<h4 style="margin:10px 0 6px;font-size:14px;color:#fbbf24;">🎯 وحدات تحتاج مراجعة (خطة التحسين)</h4>' +
        '<ul style="margin:0 0 14px;padding-right:18px;font-size:13px;">' + weakHtml + '</ul>' +
        '<h4 style="margin:10px 0 6px;font-size:14px;color:#34d399;">🌟 نقاط القوة</h4>' +
        '<ul style="margin:0 0 18px;padding-right:18px;font-size:13px;">' + strHtml + '</ul>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
          '<button id="edu-an-print" style="background:#0284c7;color:#fff;border:none;border-radius:10px;padding:8px 16px;font-weight:700;cursor:pointer;font-family:inherit;">🖨️ طباعة / حفظ PDF</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(wrap);
    document.getElementById("edu-an-close").onclick = function () { wrap.remove(); };
    wrap.onclick = function (e) { if (e.target === wrap) wrap.remove(); };
    document.getElementById("edu-an-print").onclick = function () {
      if (window.EduTechAndroid && typeof window.EduTechAndroid.printPage === "function") {
        window.EduTechAndroid.printPage("تقرير الأداء الذكي - EduTech Mindset");
      } else {
        window.print();
      }
    };
  }

  window.addEventListener("edutech:exam-completed", function (ev) {
    if (ev && ev.detail) recordAttempt(ev.detail);
  });

  window.EduTechPowerSuite = {
    version: "3.3.0",
    enqueueOfflineAction: enqueueOfflineAction,
    flushOfflineQueue: flushOfflineQueue,
    recordAttempt: recordAttempt,
    analyzePerformance: analyzePerformance,
    openReportModal: openReportModal
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      updateOfflineBadge();
      flushOfflineQueue();
    });
  } else {
    updateOfflineBadge();
    flushOfflineQueue();
  }
})();
