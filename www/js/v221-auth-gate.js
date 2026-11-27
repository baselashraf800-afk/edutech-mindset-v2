/* ============================================================================
 * EduTech Mindset — بوابة التسجيل الذكية وحقن التوكن التلقائي (v3.1.0)
 * - تحفظ استمرارية الجلسة أثناء إعادة التحميل (لا تطلب تسجيل الدخول مجدداً عند التحديث)
 * - تحقن Firebase idToken تلقائياً في كل طلبات /api/ai و/api/ai-image و/api/tts
 * - تحوّل حقل image (DataURL) القديم تلقائياً إلى صيغة files[] التي يدعمها الخادم
 * ============================================================================ */
(function (global) {
  "use strict";

  var AUTH_HINT_KEY = "edutech_auth_uid_v1";

  function getFirebaseUser() {
    try {
      if (global.firebase && firebase.auth && firebase.auth().currentUser) return firebase.auth().currentUser;
      if (global.Cloud && global.Cloud.user) return global.Cloud.user;
    } catch (e) {}
    return null;
  }

  function hasPendingSession() {
    try {
      // If Firebase hasn't finished restoring IndexedDB yet, trust persisted uid hint briefly
      if (global.Cloud && global.Cloud.authResolved) return false;
      return !!localStorage.getItem(AUTH_HINT_KEY);
    } catch (e) { return false; }
  }

  function isLoggedIn() {
    try {
      if (getFirebaseUser()) return true;
      if (typeof global.getCurrentUser === "function" && global.getCurrentUser()) return true;
      if (hasPendingSession()) return true;
    } catch (e) {}
    return false;
  }

  function waitForFirebaseUser(maxMs) {
    var cur = getFirebaseUser();
    if (cur) return Promise.resolve(cur);
    return new Promise(function (resolve) {
      var done = false;
      var timer = setTimeout(function () { if (!done) { done = true; resolve(getFirebaseUser()); } }, maxMs || 1800);
      try {
        if (global.firebase && firebase.auth) {
          var unsub = firebase.auth().onAuthStateChanged(function (u) {
            if (u && !done) {
              done = true;
              clearTimeout(timer);
              try { unsub(); } catch (_) {}
              resolve(u);
            }
          });
        }
      } catch (e) {}
    });
  }

  function promptAuth() {
    if (typeof global.showToast === "function") {
      global.showToast("🔒 سجّل دخولك مجانًا بحساب Google أو البريد لتفعيل الباقة المجانية وفتح الأدوات!", "info");
    }
    if (typeof global.openGoogleAuthModal === "function") {
      global.openGoogleAuthModal();
    } else if (global.EduEmailAuth && typeof global.EduEmailAuth.open === "function") {
      global.EduEmailAuth.open("in");
    }
  }

  function isAllowedWithoutAuth(target) {
    if (!target || !target.closest) return true;
    if (target.closest("#modalRoot, #eduEmailAuthModal, #eduV21CertModal, #eduV22SmartEnroll, [data-auth-allow], .btn-close-modal")) return true;
    if (target.closest("#btnTopLogin, #btnLoginHeader, #btnGoogleLogin, #btnModalGooglePopup, #btnModalGoogleRedirect, #btnModalGoRegister")) return true;
    if (target.closest("#unifiedToolsHub, #generator, #learnSection, #edtechLabSection, #videosSection, #librarySection")) {
      if (target.matches("input, select, textarea")) return false;
      if (target.closest("button, a, [data-tool-id], [data-action]")) return false;
    }
    return true;
  }

  document.addEventListener("click", function (ev) {
    if (isLoggedIn()) return;
    var t = ev.target;
    if (!t || isAllowedWithoutAuth(t)) return;
    var btn = t.closest("button, [data-action]");
    if (btn && btn.getAttribute("data-action") === "v21:courses:verify") return;
    ev.preventDefault();
    ev.stopPropagation();
    ev.stopImmediatePropagation();
    promptAuth();
  }, true);

  var origFetch = global.fetch;
  if (typeof origFetch === "function") {
    global.fetch = function (input, init) {
      var url = typeof input === "string" ? input : (input && input.url) || "";
      if (/\/api\/(tools-order|presence)\b/.test(url)) {
        var uOpt = getFirebaseUser();
        if (uOpt && typeof uOpt.getIdToken === "function") {
          return uOpt.getIdToken().catch(function () { return ""; }).then(function (tokOpt) {
            var nextInitOpt = Object.assign({}, init || {});
            var hdrsOpt = new Headers(nextInitOpt.headers || {});
            if (tokOpt && !hdrsOpt.has("Authorization")) hdrsOpt.set("Authorization", "Bearer " + tokOpt);
            nextInitOpt.headers = hdrsOpt;
            return origFetch.call(global, input, nextInitOpt);
          });
        }
        return origFetch.call(global, input, init);
      }
      if (/\/api\/(ai|ai-image|tts)\b/.test(url)) {
        if (!isLoggedIn()) {
          promptAuth();
          return Promise.resolve(new Response(JSON.stringify({
            error: "يرجى تسجيل الدخول بحساب Google أو بالبريد الإلكتروني لتفعيل الباقة المجانية 🔒",
            code: "AUTH_REQUIRED"
          }), { status: 401, headers: { "Content-Type": "application/json" } }));
        }
        return waitForFirebaseUser(1800).then(function (u) {
          if (!u) {
            promptAuth();
            return new Response(JSON.stringify({
              error: "يرجى تسجيل الدخول بحساب Google أو بالبريد الإلكتروني لتفعيل الباقة المجانية 🔒",
              code: "AUTH_REQUIRED"
            }), { status: 401, headers: { "Content-Type": "application/json" } });
          }
          return u.getIdToken().catch(function () { return ""; }).then(function (tok) {
            if (init && typeof init.body === "string") {
              try {
                var b = JSON.parse(init.body);
                if (tok && !b.idToken) b.idToken = tok;
                if (b.image && typeof b.image === "string" && b.image.indexOf("data:") === 0 && !b.files) {
                  var m = /^data:([^;]+);base64,(.+)$/.exec(b.image);
                  if (m) b.files = [{ mime: m[1], data: m[2], name: "snap.jpg" }];
                  delete b.image;
                }
                var nextInit = Object.assign({}, init, {
                  headers: Object.assign({}, init.headers || {}, tok ? { Authorization: "Bearer " + tok } : {}),
                  body: JSON.stringify(b)
                });
                return origFetch.call(global, input, nextInit);
              } catch (_) {}
            }
            return origFetch.call(global, input, init);
          });
        });
      }
      return origFetch.apply(this, arguments);
    };
  }

  (function () {
    if (document.getElementById("eduV302AdminTabCss")) return;
    var st = document.createElement("style");
    st.id = "eduV302AdminTabCss";
    st.textContent = "@media (max-width: 640px) { #modalRoot [class*='flex-wrap']:has([data-tab]), #haTabs, .ha-tabs { flex-wrap: nowrap !important; overflow-x: auto !important; -webkit-overflow-scrolling: touch; padding-bottom: 6px !important; } #modalRoot [data-tab] { flex-shrink: 0 !important; white-space: nowrap !important; } }";
    document.head.appendChild(st);
  })();

  global.EduAuthGateV221 = { version: "3.1.0", isLoggedIn: isLoggedIn, promptAuth: promptAuth };
})(window);
