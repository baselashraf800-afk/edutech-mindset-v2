/* تفعيل العمل مع ضعف الاتصال + إشعار التحديث الفوري + شريط تنبيه عند الانقطاع (الإصدار 68) */
(function () {
  "use strict";
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(function (reg) {
        if (reg && (reg.active || reg.waiting || reg.installing)) window.__eduSwReady = true;
        try { reg.update(); } catch (e) {}
        navigator.serviceWorker.addEventListener("controllerchange", function () {
          try {
            if (sessionStorage.getItem("edu_sw_reloaded_v256") === "1") return;
            sessionStorage.setItem("edu_sw_reloaded_v256", "1");
          } catch (e) {}
          location.reload();
        });
        reg.addEventListener("updatefound", function () {
          var nw = reg.installing;
          if (!nw) return;
          nw.addEventListener("statechange", function () {
            if (nw.state === "installed" && navigator.serviceWorker.controller) {
              if (typeof showToast === "function") {
                showToast("✨ تم تحديث المنصة بالخلفية لأحدث إصدار ✓", "success");
              }
            }
          });
        });
      }).catch(function () {});
    });
  }
  var bar = null;
  function show(off) {
    if (off) {
      if (bar) return;
      bar = document.createElement("div"); bar.id = "offBar";
      bar.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:9999;background:linear-gradient(90deg,#b45309,#d97706);color:#fff;text-align:center;font:800 11.5px Cairo,Tahoma,sans-serif;padding:6px 12px;direction:rtl;box-shadow:0 4px 12px rgba(0,0,0,.3)";
      bar.innerHTML = "⚠️ وضع العمل بلا إنترنت نشط — يمكنك تصفح الأدوات المحفوظة وحقيبة المذاكرة وبنك الأسئلة محلياً";
      document.body.appendChild(bar);
    } else if (bar) {
      bar.remove(); bar = null;
      if (typeof showToast === "function") showToast("🌐 عاد الاتصال بالإنترنت — تمت المزامنة ✓", "success");
    }
  }
  window.addEventListener("offline", function () { show(true); });
  window.addEventListener("online", function () { show(false); });
  if (document.readyState !== "loading") { if (!navigator.onLine) show(true); } else document.addEventListener("DOMContentLoaded", function () { if (!navigator.onLine) show(true); });
})();

/* v221: شريط تثبيت التطبيق على شاشة الجوال (أنيق، خفيف، وقابل للإغلاق لـ 7 أيام) */
(function () {
  "use strict";
  var DISMISS_KEY = "edu_pwa_dismiss_v221";
  var deferredPrompt = null;

  function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }
  function isDismissed() {
    try {
      var t = +localStorage.getItem(DISMISS_KEY) || 0;
      return t && (Date.now() - t) < 7 * 24 * 60 * 60 * 1000;
    } catch (e) { return false; }
  }
  function dismiss() {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (e) {}
    var el = document.getElementById("eduPwaInstallBar");
    if (el) el.remove();
  }
  function showBanner(isIos) {
    if (isStandalone() || isDismissed() || document.getElementById("eduPwaInstallBar")) return;
    var el = document.createElement("div");
    el.id = "eduPwaInstallBar";
    el.style.cssText = "position:fixed;bottom:76px;left:12px;right:12px;max-width:440px;margin:0 auto;z-index:44;background:linear-gradient(135deg,#0f172a,#1e3a8a);color:#fff;border:1px solid rgba(56,189,248,0.45);border-radius:18px;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:10px;box-shadow:0 12px 30px rgba(2,6,23,0.45);direction:rtl;font-family:Cairo,sans-serif;";
    el.innerHTML =
      '<div style="display:flex;align-items:center;gap:9px;min-width:0;">' +
        '<img src="assets/logo.png" alt="EduTech" style="width:34px;height:34px;border-radius:10px;background:#fff;padding:2px;flex-shrink:0;">' +
        '<div style="min-width:0;">' +
          '<div style="font-size:12px;font-weight:900;color:#fde68a;">📲 ثبّت تطبيق EduTech على جوالك</div>' +
          '<div style="font-size:10.5px;color:#cbd5e1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (isIos ? 'اضغط مشاركة ⬆️ ثم «إضافة إلى الشاشة الرئيسية»' : 'وصول أسرع للكتب والدورات بدون إنترنت') + '</div>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">' +
        (isIos ? '' : '<button type="button" id="eduPwaInstallNow" style="padding:6px 12px;border-radius:10px;background:#10b981;color:#020617;font-size:11px;font-weight:900;border:none;cursor:pointer;">تثبيت</button>') +
        '<button type="button" id="eduPwaInstallClose" aria-label="إغلاق" style="width:26px;height:26px;border-radius:8px;background:rgba(255,255,255,0.12);color:#fff;font-size:12px;border:none;cursor:pointer;">✕</button>' +
      '</div>';
    document.body.appendChild(el);
    var closeBtn = document.getElementById("eduPwaInstallClose");
    if (closeBtn) closeBtn.onclick = dismiss;
    var nowBtn = document.getElementById("eduPwaInstallNow");
    if (nowBtn) nowBtn.onclick = function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function () { deferredPrompt = null; dismiss(); }).catch(dismiss);
    };
  }

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    setTimeout(function () { showBanner(false); }, 4500);
  });
  window.addEventListener("appinstalled", dismiss);

  var ua = navigator.userAgent || "";
  var isIosSafari = /iPhone|iPad|iPod/i.test(ua) && /Safari/i.test(ua) && !/CriOS|FxiOS/i.test(ua);
  if (isIosSafari) {
    window.addEventListener("load", function () { setTimeout(function () { showBanner(true); }, 6000); });
  }
})();

/* v222: زر العودة السريعة للأعلى (يظهر بلطف بعد التمرير 500px ولا يتداخل مع الشريط السفلي أو المساعد) */
(function () {
  "use strict";
  function initTopBtn() {
    if (document.getElementById("eduScrollTopBtn")) return;
    var btn = document.createElement("button");
    btn.id = "eduScrollTopBtn";
    btn.type = "button";
    btn.setAttribute("aria-label", "العودة للأعلى");
    btn.title = "العودة للأعلى";
    btn.style.cssText = "position:fixed;bottom:92px;right:12px;z-index:43;width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#0291c7,#4f46e5);color:#fff;border:2px solid rgba(255,255,255,0.4);box-shadow:0 8px 20px rgba(2,132,199,0.35);font-size:16px;font-weight:900;cursor:pointer;opacity:0;pointer-events:none;transition:opacity .2s ease,transform .2s ease;transform:translateY(10px);display:flex;align-items:center;justify-content:center;";
    btn.textContent = "↑";
    btn.onclick = function () { window.scrollTo({ top: 0, behavior: "smooth" }); };
    document.body.appendChild(btn);
    window.addEventListener("scroll", function () {
      var show = (window.scrollY || document.documentElement.scrollTop || 0) > 500;
      btn.style.opacity = show ? "1" : "0";
      btn.style.pointerEvents = show ? "auto" : "none";
      btn.style.transform = show ? "translateY(0)" : "translateY(10px)";
    }, { passive: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initTopBtn);
  else initTopBtn();
})();

/* v226: زر «الوضع الخفيف / توفير البيانات» في الهيدر لطلاب الإنترنت الضعيف */
(function () {
  "use strict";
  var DS_KEY = "edu_data_saver_v226";
  function applyDS(on) {
    if (document.body) document.body.classList.toggle("edu-data-saver", !!on);
    var b = document.getElementById("eduDataSaverBtn");
    if (b) {
      b.style.background = on ? "rgba(245,158,11,0.22)" : "";
      b.style.color = on ? "#d97706" : "";
      b.title = on ? "الوضع الخفيف مفعّل (اضغط لإيقافه)" : "تفعيل الوضع الخفيف وتوفير البيانات";
    }
  }
  function mountDS() {
    var saved = false;
    try { localStorage.removeItem(DS_KEY); saved = false; } catch (e) {}
    applyDS(saved);
    if (document.getElementById("eduDataSaverBtn")) return;
    var anchor = document.getElementById("eduUnifiedSearchBtn") || document.getElementById("eduNotifBellBtn") || document.getElementById("btnThemeToggle");
    if (!anchor || !anchor.parentNode) return;
    var btn = document.createElement("button");
    btn.id = "eduDataSaverBtn";
    btn.type = "button";
    btn.setAttribute("aria-label", "الوضع الخفيف وتوفير البيانات");
    btn.className = "p-2 rounded-xl text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0";
    btn.innerHTML = '<span style="font-size:14px;line-height:1;">⚡</span>';
    btn.onclick = function () {
      var next = !(document.body && document.body.classList.contains("edu-data-saver"));
      try { localStorage.setItem(DS_KEY, next ? "1" : "0"); } catch (e) {}
      applyDS(next);
      if (typeof showToast === "function") showToast(next ? "⚡ تم تفعيل الوضع الخفيف لتوفير البيانات وتسريع التصفح" : "تم العودة للوضع الكامل بالصور ✓", "info");
    };
    anchor.parentNode.insertBefore(btn, anchor);
    applyDS(saved);
  }
  function boot() { mountDS(); setTimeout(mountDS, 900); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

/* v257: نظام التثبيت الذكي كتطبيق من المتصفح (PWA) + دعم رابط تحميل APK المباشر من الإدارة */
(function (global) {
  "use strict";
  var APK_KEY = "edu_apk_url_v257";
  var deferredPrompt = null;

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    global.__eduDeferredPwaPrompt = e;
  });

  var DEFAULT_APK_URL = "/download.html";
  function getApkUrl() {
    try { var u = (localStorage.getItem(APK_KEY) || "").trim(); return u || DEFAULT_APK_URL; } catch (e) { return DEFAULT_APK_URL; }
  }
  function saveApkUrl(u) {
    var clean = String(u || "").trim();
    try { localStorage.setItem(APK_KEY, clean); } catch (e) {}
    if (window.Cloud && window.Cloud.enabled && typeof window.Cloud.commit === "function") {
      window.Cloud.commit([{ col: "site", id: "app_release", data: { apkUrl: clean, updatedAt: Date.now() } }]).catch(function () {});
    }
  }

  function openSmartInstallModal() {
    var old = document.getElementById("eduSmartInstallModal");
    if (old) old.remove();
    var apkUrl = getApkUrl();
    var isStandalone = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
    var wrap = document.createElement("div");
    wrap.id = "eduSmartInstallModal";
    wrap.setAttribute("dir", "rtl");
    wrap.style.cssText = "position:fixed;inset:0;z-index:99994;background:rgba(2,6,23,0.9);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:12px;";
    wrap.innerHTML =
      '<div style="width:100%;max-width:440px;border-radius:24px;background:#0f172a;border:1.5px solid rgba(56,189,248,0.45);padding:18px;color:#fff;box-shadow:0 24px 60px rgba(0,0,0,0.6);">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">' +
          '<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:22px;">📲</span><strong style="font-size:14.5px;color:#fde68a;">تثبيت تطبيق EduTech Mindset</strong></div>' +
          '<button type="button" id="eduInstX" style="padding:5px 11px;border-radius:10px;background:#334155;color:#fff;border:none;font-weight:900;cursor:pointer;">✕</button>' +
        '</div>' +
        '<div style="padding:12px;border-radius:16px;background:rgba(14,165,233,0.14);border:1px solid rgba(56,189,248,0.35);margin-bottom:10px;">' +
          '<div style="font-size:12.5px;font-weight:900;color:#7dd3fc;margin-bottom:6px;">1) التثبيت الفوري من المتصفح (PWA — خفيف ومجاني)</div>' +
          (isStandalone
            ? '<div style="font-size:12px;color:#6ee7b7;font-weight:800;">✅ التطبيق مثبّت ويعمل بالفعل على جهازك!</div>'
            : '<button type="button" id="eduInstPwaBtn" style="width:100%;padding:11px;border-radius:13px;background:linear-gradient(135deg,#0ea5e9,#2563eb);color:#fff;border:none;font-size:13px;font-weight:900;cursor:pointer;">📲 تثبيت التطبيق الآن من المتصفح</button><div id="eduInstHint" style="font-size:11px;color:#cbd5e1;margin-top:6px;">يعمل كأيقونة على الشاشة الرئيسية ويدعم العمل دون إنترنت.</div>') +
        '</div>' +
        '<div style="padding:12px;border-radius:16px;background:rgba(16,185,129,0.14);border:1px solid rgba(52,211,153,0.35);">' +
          '<div style="font-size:12.5px;font-weight:900;color:#6ee7b7;margin-bottom:6px;">2) تحميل تطبيق الأندرويد المباشر (APK)</div>' +
          (apkUrl
            ? '<a href="' + apkUrl.replace(/"/g, "&quot;") + '" download style="display:block;text-align:center;padding:11px;border-radius:13px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-size:13px;font-weight:900;text-decoration:none;">⬇️ تنزيل ملف APK مباشرة للهاتف</a>'
            : '<div style="font-size:11.5px;color:#cbd5e1;line-height:1.6;">ملف APK المباشر قيد التجهيز وسيُفعّل هنا فور رفعه من لوحة الإدارة — يمكنك الآن التثبيت الفوري من المتصفح بالأعلى بنفس المزايا الكاملة!</div>') +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);
    document.getElementById("eduInstX").onclick = function () { wrap.remove(); };
    var pBtn = document.getElementById("eduInstPwaBtn");
    if (pBtn) {
      pBtn.onclick = function () {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(function (ch) {
            if (ch && ch.outcome === "accepted") {
              if (typeof showToast === "function") showToast("🎉 تم تثبيت EduTech Mindset كتطبيق على هاتفك بنجاح!", "success");
              wrap.remove();
            }
            deferredPrompt = null;
          });
        } else {
          var hint = document.getElementById("eduInstHint");
          if (hint) hint.innerHTML = "💡 من قائمة متصفحك بالأعلى (⋮ أو زر المشاركة ⬆️) اختر <strong>«إضافة إلى الشاشة الرئيسية / Install App»</strong> ليثبت فوراً!";
        }
      };
    }
  }

  // ربط زر «تثبيت كتطبيق / APK» في الهيرو وفي الهيدر تلقائياً
  document.addEventListener("click", function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest("#btnHeaderInstallApp, [data-install-app], #btnHeroInstallApp") : null;
    if (!b) {
      var anyBtn = ev.target && ev.target.closest ? ev.target.closest("button, a") : null;
      if (anyBtn && /تثبيت\s*كتطبيق/.test(anyBtn.textContent || "")) b = anyBtn;
    }
    if (b) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      openSmartInstallModal();
    }
  }, true);

  // مزامنة رابط APK من Firestore إن وُجد
  setTimeout(function () {
    if (window.Cloud && window.Cloud.enabled && typeof window.Cloud.subscribeDoc === "function") {
      window.Cloud.subscribeDoc("site", "app_release", function (d) {
        if (d && typeof d.apkUrl === "string") {
          try { localStorage.setItem(APK_KEY, d.apkUrl); } catch (e) {}
        }
      }, function () {});
    }
  }, 900);

  global.EduAppInstall = { open: openSmartInstallModal, getApkUrl: getApkUrl, saveApkUrl: saveApkUrl };
})(window);


/* v279: التحديث السحابي الإجباري الفوري عند كل المستخدمين لضمان تشغيل أحدث نسخة دائماً */
(function () {
  "use strict";
  function checkServerVersion() {
    var cur = "v" + (window.APP_VERSION || "291");
    fetch("/api/health?t=" + Date.now(), { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.version || d.version === cur) return;
        try {
          if (sessionStorage.getItem("edu_forced_ver") === d.version) return;
          sessionStorage.setItem("edu_forced_ver", d.version);
        } catch (e) {}
        var tasks = [];
        if ("caches" in window) {
          tasks.push(caches.keys().then(function (ks) {
            return Promise.all(ks.map(function (k) { return caches.delete(k); }));
          }).catch(function () {}));
        }
        if ("serviceWorker" in navigator) {
          tasks.push(navigator.serviceWorker.getRegistrations().then(function (regs) {
            return Promise.all(regs.map(function (rg) {
              if (rg.waiting) { try { rg.waiting.postMessage({ type: "SKIP_WAITING" }); } catch (e) {} }
              return rg.update().catch(function () {});
            }));
          }).catch(function () {}));
        }
        Promise.all(tasks).then(function () {
          if (typeof showToast === "function") showToast("🔄 جارٍ تحديث المنصة إلى " + d.version + "…", "info");
          setTimeout(function () { location.reload(); }, 400);
        });
      }).catch(function () {});
  }
  window.addEventListener("load", function () { setTimeout(checkServerVersion, 1200); });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") checkServerVersion();
  });
})();
