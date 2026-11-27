/*
 * طبقة الربط السحابي (Firebase) — EduTech Mindset
 * - تسجيل الدخول عبر Google
 * - محتوى الموقع (يعدّله المدير فقط) في مجموعتي site / items
 * - بيانات كل مستخدم في users/{uid}
 * إن لم تُضبط إعدادات Firebase يعمل الموقع في "وضع محلي" (Cloud.enabled = false).
 */
(function () {
  "use strict";

  var cfg = window.EDUTECH_FIREBASE_CONFIG || {};
  var ADMINS = (window.EDUTECH_ADMIN_EMAILS || []).map(function (s) { return String(s).toLowerCase().trim(); });

  var Cloud = {
    enabled: false,
    user: null,
    isAdmin: false,
    adminEmails: ADMINS,
    statusListeners: []
  };
  window.Cloud = Cloud;

  Cloud.onStatus = function (cb) { Cloud.statusListeners.push(cb); };
  function emitStatus(state, detail) {
    if (state === "error" && detail) Cloud.lastError = { code: detail.code || "", message: String(detail.message || detail), at: new Date().toISOString() };
    Cloud.statusListeners.forEach(function (cb) { try { cb(state, detail); } catch (e) {} });
  }
  Cloud.isAdminEmail = function (email) {
    return !!email && ADMINS.indexOf(String(email).toLowerCase().trim()) !== -1;
  };


  // ---------- محول التخزين الهجين (سحابي + محلي فوري لجميع الاستوديوهات) ----------
  function getLocalColMap(colName) {
    try {
      var raw = localStorage.getItem("edu_hybrid_col_" + colName);
      var parsed = raw ? JSON.parse(raw) : {};
      return (parsed && typeof parsed === "object" && !Array.isArray(parsed)) ? parsed : {};
    } catch (e) {
      return {};
    }
  }
  function saveLocalColMap(colName, mapObj) {
    try {
      localStorage.setItem("edu_hybrid_col_" + colName, JSON.stringify(mapObj || {}));
    } catch (e) {}
  }
  function normalizeForLocal(data) {
    var copy = {};
    if (!data || typeof data !== "object") return copy;
    Object.keys(data).forEach(function (k) {
      var v = data[k];
      if (v && typeof v === "object" && typeof v.seconds !== "number" && !Array.isArray(v) && Object.keys(v).length <= 2 && (v._methodName || k === "updatedAt" || k === "createdAt" || k === "at")) {
        copy[k] = { seconds: Math.floor(Date.now() / 1000) };
      } else {
        copy[k] = v;
      }
    });
    if (!copy.updatedAt || typeof copy.updatedAt.seconds !== "number") {
      copy.updatedAt = { seconds: Math.floor(Date.now() / 1000) };
    }
    return copy;
  }

  Cloud.getStudioUser = function () {
    if (Cloud.user && Cloud.user.uid) return Cloud.user;
    try {
      var lu = (window.EduAccessControl && typeof window.EduAccessControl.getCurrentUser === "function")
        ? window.EduAccessControl.getCurrentUser()
        : (typeof window.getCurrentUser === "function" ? window.getCurrentUser() : null);
      if (lu && lu.email) {
        var em = String(lu.email).toLowerCase().trim();
        return { uid: lu.uid || ("local_" + em), email: em, displayName: lu.name || "عضو المنصة", isLocal: true };
      }
    } catch (e) {}
    return { uid: "local_workspace", email: "teacher@edutech.ps", displayName: "معلم المنصة", isLocal: true };
  };

  function makeHybridCol(name, rawDb) {
    var STUDIO_COLS = {
      worksheets: 1, lessonplans: 1, presentations: 1, designs: 1,
      games: 1, gameScores: 1, homeworks: 1, hwSubmissions: 1,
      classrooms: 1, exams: 1, examResults: 1, votes: 1, liveRooms: 1, liveScores: 1
    };
    if (!STUDIO_COLS[name] && rawDb) return rawDb.collection(name);

    function matchDoc(docData, filters) {
      for (var i = 0; i < filters.length; i++) {
        var f = filters[i];
        if (f.op === "==" && docData[f.field] !== f.val) {
          // Allow matching local_workspace items alongside local_<email> items on the same device
          if (f.field === "ownerUid" && String(docData.ownerUid || "").indexOf("local_") === 0 && String(f.val || "").indexOf("local_") === 0) {
            continue;
          }
          return false;
        }
      }
      return true;
    }

    function buildQuery(filters) {
      return {
        get: function () {
        if (rawDb) { try { return rawDb.collection(name).get(); } catch (e) {} }
        var localMap = getLocalColMap(name);
        var docs = Object.keys(localMap).map(function (k) { return { id: k, data: function () { return localMap[k]; } }; });
        return Promise.resolve({ empty: !docs.length, docs: docs, forEach: function (fn) { docs.forEach(fn); } });
      },
      where: function (field, op, val) {
          return buildQuery(filters.concat([{ field: field, op: op, val: val }]));
        },
        get: function () {
          var localMap = getLocalColMap(name);
          var localDocs = Object.keys(localMap).map(function (id) {
            return { id: id, exists: true, data: function () { return localMap[id]; } };
          }).filter(function (d) { return matchDoc(d.data(), filters); });

          if (rawDb && Cloud.user && Cloud.user.uid) {
            var q = rawDb.collection(name);
            filters.forEach(function (f) { q = q.where(f.field, f.op, f.val); });
            return q.get().then(function (snap) {
              var seen = {};
              var merged = [];
              (snap.docs || []).forEach(function (d) {
                seen[d.id] = 1;
                merged.push(d);
              });
              localDocs.forEach(function (ld) {
                if (!seen[ld.id]) merged.push(ld);
              });
              return { docs: merged, forEach: function (cb) { merged.forEach(cb); } };
            }).catch(function () {
              return { docs: localDocs, forEach: function (cb) { localDocs.forEach(cb); } };
            });
          }
          return Promise.resolve({ docs: localDocs, forEach: function (cb) { localDocs.forEach(cb); } });
        }
      };
    }

    return {
      doc: function (id) {
        var docId = String(id || ("doc_" + Date.now().toString(36)));
        return {
          get: function () {
            var localMap = getLocalColMap(name);
            var localItem = localMap[docId];
            if (rawDb) {
              return rawDb.collection(name).doc(docId).get().then(function (s) {
                if (s && s.exists) return s;
                if (localItem) return { id: docId, exists: true, data: function () { return localItem; } };
                return s;
              }).catch(function () {
                return { id: docId, exists: !!localItem, data: function () { return localItem || null; } };
              });
            }
            return Promise.resolve({ id: docId, exists: !!localItem, data: function () { return localItem || null; } });
          },
          set: function (data, opts) {
            var localMap = getLocalColMap(name);
            var prev = (opts && opts.merge && localMap[docId]) ? localMap[docId] : {};
            localMap[docId] = Object.assign({}, prev, normalizeForLocal(data));
            saveLocalColMap(name, localMap);
            if (rawDb && Cloud.user && Cloud.user.uid) {
              return rawDb.collection(name).doc(docId).set(data, opts || {}).catch(function () {
                return true;
              });
            }
            return Promise.resolve(true);
          },
          delete: function () {
            var localMap = getLocalColMap(name);
            delete localMap[docId];
            saveLocalColMap(name, localMap);
            if (rawDb && Cloud.user && Cloud.user.uid) {
              return rawDb.collection(name).doc(docId).delete().catch(function () { return true; });
            }
            return Promise.resolve(true);
          },
          onSnapshot: function (cb, errCb) {
            if (rawDb) {
              try { return rawDb.collection(name).doc(docId).onSnapshot(cb, errCb || function () {}); } catch (e) {}
            }
            var localMap = getLocalColMap(name);
            var it = localMap[docId];
            setTimeout(function () { cb({ id: docId, exists: !!it, data: function () { return it || null; } }); }, 10);
            return function () {};
          }
        };
      },
      get: function () {
        if (rawDb) { try { return rawDb.collection(name).get(); } catch (e) {} }
        var localMap = getLocalColMap(name);
        var docs = Object.keys(localMap).map(function (k) { return { id: k, data: function () { return localMap[k]; } }; });
        return Promise.resolve({ empty: !docs.length, docs: docs, forEach: function (fn) { docs.forEach(fn); } });
      },
      where: function (field, op, val) {
        return buildQuery([{ field: field, op: op, val: val }]);
      }
    };
  }

  if (!cfg.apiKey || !cfg.projectId || typeof firebase === "undefined") {
    Cloud.enabled = true;
    Cloud.col = function (name) { return makeHybridCol(name, null); };
    Cloud.stamp = function () { return { seconds: Math.floor(Date.now() / 1000) }; };
    Cloud.inc = function (n) { return n || 1; };
    // الإصدار 148: عند تعذّر تحميل Firebase (إنترنت ضعيف/مقيّد) كانت دوال الاشتراك غير معرّفة فتنهار الصفحة
    // بأخطاء TypeError عند الإقلاع. هذه بدائل آمنة تجعل الموقع يعمل محلياً بسلاسة.
    var noopUnsub = function () {};
    var stub = function (name, fn) { if (typeof Cloud[name] !== "function") Cloud[name] = fn; };
    stub("subscribeContent", function (onData, onErr) { setTimeout(function () { if (onErr) onErr(new Error("offline")); }, 0); return noopUnsub; });
    ["subscribePosts", "subscribeBooks", "subscribeAds", "subscribeResources", "subscribeSlides"].forEach(function (n) {
      stub(n, function (cb) { setTimeout(function () { if (typeof cb === "function") cb([]); }, 0); return noopUnsub; });
    });
    stub("subscribeDoc", function (c, id, cb) { setTimeout(function () { if (typeof cb === "function") cb(null); }, 0); return noopUnsub; });
    stub("subscribeAccessPolicies", function () { return noopUnsub; });
    stub("onAuth", function (cb) { setTimeout(function () { if (typeof cb === "function") cb(null); }, 0); return noopUnsub; });
    stub("signIn", function () { return Promise.reject(new Error("offline")); });
    stub("signOut", function () { return Promise.resolve(); });
    ["signUpEmail", "signInEmail", "resetPassword", "resendVerification"].forEach(function (n) { stub(n, function () { return Promise.reject(Object.assign(new Error("offline"), { code: "auth/network-request-failed" })); }); });
    stub("refreshUser", function () { return Promise.resolve(null); });
    stub("listUsers", function () { return Promise.resolve([]); });
    ["saveUser", "savePost", "saveGrant", "saveAdminState", "saveAccessPolicies"].forEach(function (n) { stub(n, function () { return Promise.reject(new Error("offline")); }); });
    return; // وضع محلي هجين
  }

  var auth, db;
  try {
    firebase.initializeApp(cfg);
    /* App Check (اختياري): يُفعَّل تلقائياً عند وضع مفتاح reCAPTCHA في firebase-config.js */
    try { if (window.EDUTECH_APPCHECK_SITE_KEY && firebase.appCheck) { if (window.EDUTECH_APPCHECK_DEBUG) self.FIREBASE_APPCHECK_DEBUG_TOKEN = true; firebase.appCheck().activate(window.EDUTECH_APPCHECK_SITE_KEY, true); } } catch (e) { console.warn("AppCheck", e); }
    auth = firebase.auth();
    try { auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); } catch (_) {}
    db = firebase.firestore();
  } catch (e) {
    console.error("Firebase init failed", e);
    return;
  }
  Cloud.enabled = true;

  // شبكات ضعيفة/مقيّدة: السماح بالتحويل التلقائي لـ long-polling + تخزين مؤقت للعمل بدون إنترنت
  try { db.settings({ experimentalForceLongPolling: true, merge: true }); } catch (e) {}
  try { db.enablePersistence({ synchronizeTabs: true }).catch(function () {}); } catch (e) {}

  // ---------- المصادقة ----------
  var provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  Cloud.isEmbeddedWebView = function () {
    var ua = (navigator && navigator.userAgent) || "";
    return /FBAN|FBAV|Instagram|Telegram|Line\/|WhatsApp|Snapchat|wv\)|WebView/i.test(ua);
  };

  Cloud.signIn = function (preferRedirect) {
    // v290: استخدام تسجيل دخول Google الأصلي (1-Tap Native) داخل تطبيق الأندرويد بدون فتح متصفح خارجي
    var capAuth = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.EduGoogleAuth;
    if (capAuth && typeof capAuth.signIn === "function") {
      return capAuth.signIn().then(function (res) {
        if (!res || !res.idToken) throw new Error("لم يتم استلام رمز Google ID Token");
        var cred = firebase.auth.GoogleAuthProvider.credential(res.idToken);
        return auth.signInWithCredential(cred);
      });
    }
    if (preferRedirect === true) {
      return auth.signInWithRedirect(provider);
    }
    return auth.signInWithPopup(provider).catch(function (err) {
      var code = (err && err.code) || "";
      if (
        code === "auth/popup-blocked" ||
        code === "auth/popup-closed-by-user" ||
        code === "auth/operation-not-supported-in-this-environment" ||
        code === "auth/web-storage-unsupported" ||
        false
      ) {
        return auth.signInWithRedirect(provider);
      }
      throw err;
    });
  };
  Cloud.signOut = function () {
    var capAuth = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.EduGoogleAuth;
    if (capAuth && typeof capAuth.signOut === "function") { try { capAuth.signOut(); } catch (_) {} }
    return auth.signOut();
  };

  // ---------- الدخول بالبريد وكلمة المرور (الإصدار 149) ----------
  // يتطلب تفعيل Email/Password من Firebase Console → Authentication → Sign-in method.
  // الصلاحيات المركزية (grants) تتطلب بريداً موثّقاً، لذا نرسل رسالة تحقق عند التسجيل.
  Cloud.realAuth = true;
  Cloud.signUpEmail = function (email, password, name) {
    return auth.createUserWithEmailAndPassword(String(email || "").trim(), password).then(function (cred) {
      var u = cred.user, tasks = [];
      if (name) tasks.push(u.updateProfile({ displayName: String(name).trim().slice(0, 60) }).catch(function () {}));
      tasks.push(u.sendEmailVerification().catch(function () {}));
      return Promise.all(tasks).then(function () { return u.reload().catch(function () {}); }).then(function () { return cred; });
    });
  };
  Cloud.signInEmail = function (email, password) { return auth.signInWithEmailAndPassword(String(email || "").trim(), password); };
  Cloud.resetPassword = function (email) { return auth.sendPasswordResetEmail(String(email || "").trim()); };
  Cloud.resendVerification = function () { return auth.currentUser ? auth.currentUser.sendEmailVerification() : Promise.reject(new Error("no-user")); };
  Cloud.refreshUser = function () {
    var u = auth.currentUser; if (!u) return Promise.resolve(null);
    return u.reload().then(function () { return u.getIdToken(true); }).then(function () { Cloud.user = u; Cloud.isAdmin = !!(u.emailVerified && Cloud.isAdminEmail(u.email)); return u; });
  };

  Cloud.onAuth = function (cb) {
    auth.getRedirectResult().then(function (res) {
      if (res && res.user) emitStatus("redirect-signed-in", res.user);
    }).catch(function (err) {
      if (err && err.code) emitStatus("auth-error", err);
    });
    auth.onAuthStateChanged(function (u) {
      Cloud.user = u || null;
      Cloud.authResolved = true;
      try {
        if (u && u.uid) localStorage.setItem("edutech_auth_uid_v1", u.uid);
        else localStorage.removeItem("edutech_auth_uid_v1");
      } catch (_) {}
      Cloud.isAdmin = !!(u && u.emailVerified && Cloud.isAdminEmail(u.email));
      Cloud.isMod = false;
      if (!u) { cb(null); return; }
      db.collection("mods").doc(String(u.email || "").toLowerCase().trim()).get()
        .then(function (s) { Cloud.isMod = !!s.exists; }, function () {})
        .then(function () { cb(Cloud.user); });
    });
  };

  // ---------- محتوى الموقع ----------
  var cfgRef = function () { return db.collection("site").doc("config"); };
  var itemsRef = function () { return db.collection("items"); };

  /** يستدعي onData({config, items, fromCache}) عند أول وصول للبيانات ثم عند كل تغيير. */
  Cloud.subscribeContent = function (onData, onError) {
    var cfgSnap = null, itemsSnap = null;
    function emit() {
      if (!cfgSnap || !itemsSnap) return;
      onData({
        config: cfgSnap.exists ? cfgSnap.data() : null,
        items: itemsSnap.docs.map(function (d) { return Object.assign({}, d.data(), { id: d.id }); }),
        fromCache: !!(cfgSnap.metadata.fromCache && itemsSnap.metadata.fromCache),
        hasPendingWrites: !!(cfgSnap.metadata.hasPendingWrites || itemsSnap.metadata.hasPendingWrites)
      });
    }
    var u1 = cfgRef().onSnapshot({ includeMetadataChanges: true }, function (s) { cfgSnap = s; emit(); }, onError);
    var u2 = itemsRef().onSnapshot({ includeMetadataChanges: true }, function (s) { itemsSnap = s; emit(); }, onError);
    return function () { u1(); u2(); };
  };

  /**
   * ops: [{ col: "site"|"items", id, data } | { col, id, remove: true }]
   * تُنفَّذ على دفعات (الحد 500 عملية لكل دفعة).
   */
  Cloud.commit = function (ops) {
    var chunks = [], i;
    for (i = 0; i < ops.length; i += 400) chunks.push(ops.slice(i, i + 400));
    var stamp = firebase.firestore.FieldValue.serverTimestamp();
    var by = Cloud.user ? Cloud.user.email : "";
    emitStatus("saving");
    return chunks.reduce(function (p, chunk) {
      return p.then(function () {
        var batch = db.batch();
        chunk.forEach(function (op) {
          var ref = db.collection(op.col).doc(op.id);
          if (op.remove) batch.delete(ref);
          else batch.set(ref, Object.assign({}, op.data, { updatedAt: stamp, updatedBy: by }));
        });
        return batch.commit();
      });
    }, Promise.resolve()).then(function () {
      emitStatus("saved");
    }).catch(function (err) {
      emitStatus("error", err);
      throw err;
    });
  };

  // ---------- بيانات المستخدم ----------
  var userRef = function (uid) { return db.collection("users").doc(uid); };

  Cloud.loadUser = function (uid) {
    return userRef(uid).get().then(function (s) { return s.exists ? s.data() : null; }).catch(function (err) {
      return userRef(uid).get({ source: "cache" }).then(function (cs) {
        return cs.exists ? cs.data() : null;
      }).catch(function () { throw err; });
    });
  };

  Cloud.saveUser = function (uid, data) {
    var payload = Object.assign({}, data, { updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    emitStatus("saving-user");
    return userRef(uid).set(payload).then(function () { emitStatus("saved-user"); }).catch(function (err) {
      emitStatus("error", err);
      throw err;
    });
  };

  Cloud.watchUser = function (uid, cb) {
    return userRef(uid).onSnapshot(function (s) {
      if (s.metadata.hasPendingWrites) return; // صدى كتابتنا نحن
      cb(s.exists ? s.data() : null);
    }, function () {});
  };

  Cloud.deleteMyAccount = function (uid) {
    if (!uid) return Promise.resolve();
    emitStatus("saving-user");
    return userRef(uid).delete().then(function () {
      if (auth.currentUser && typeof auth.currentUser.delete === "function") {
        return auth.currentUser.delete().catch(function () { return auth.signOut(); });
      }
      return auth.signOut();
    });
  };

  /** للإدارة فقط: قائمة المستخدمين المسجلين */
  // ---------- المشرفون ومنشوراتهم ----------
  Cloud.isMod = false;
  // سقف آمن: كل زائر يفتح هذا الاستماع اللحظي تلقائياً (extras.js)، فبلا حدٍّ كانت كل زيادة في
  // عدد المنشورات تعني قراءات أكثر لكل زائر متصل في نفس اللحظة — نكتفي بآخر 300 منشوراً (الأحدث أولاً)
  Cloud.subscribePosts = function (cb, err) {
    return db.collection("posts").orderBy("createdAt", "desc").limit(300).onSnapshot(function (s) {
      cb(s.docs.map(function (d) { return Object.assign({}, d.data(), { id: d.id }); }));
    }, err);
  };
  Cloud.savePost = function (p) {
    var d = Object.assign({}, p); delete d.id;
    return db.collection("posts").doc(p.id).set(d);
  };
  Cloud.deletePost = function (id) { return db.collection("posts").doc(id).delete(); };
  Cloud.listMods = function () {
    return db.collection("mods").get().then(function (s) { return s.docs.map(function (d) { return d.data(); }); });
  };
  Cloud.addMod = function (email, name) {
    var em = String(email || "").toLowerCase().trim();
    return db.collection("mods").doc(em).set({ email: em, name: name, addedAt: new Date().toISOString() });
  };
  Cloud.removeMod = function (email) {
    var em = String(email || "").toLowerCase().trim();
    return db.collection("mods").doc(em).delete();
  };

  Cloud.subscribeAds = function (cb, err) {
    return db.collection("ads").onSnapshot(function (s) {
      cb(s.docs.map(function (d) { return Object.assign({}, d.data(), { id: d.id }); }));
    }, err);
  };
  /** اشتراك في وثيقة واحدة من مجموعة (مثل site/curriculum) */
  Cloud.subscribeDoc = function (col, id, cb, err) {
    return db.collection(col).doc(id).onSnapshot(function (s) { cb(s.exists ? s.data() : null); }, err);
  };
  // ---------- نظام الصلاحيات المركزي (يُحفظ في Firebase فيصل لكل الأجهزة) ----------
  // site/access_policies: سياسات عامة بلا بيانات شخصية (قراءة للجميع، كتابة للإدارة)
  // grants/{email}: صلاحيات فرد موثّق (قراءة لصاحبها والإدارة، كتابة للإدارة فقط)
  // private/access_admin: أكواد التفعيل وسجل التدقيق (إدارة فقط)
  // access_requests/{id}: طلبات الصلاحية من المستخدمين الموثّقين (إنشاء لصاحبها، والباقي للإدارة)
  Cloud.subscribeAccessPolicies = function (cb, err) {
    return db.collection("site").doc("access_policies").onSnapshot(function (s) { cb(s.exists ? s.data() : null); }, err || function () {});
  };
  Cloud.saveAccessPolicies = function (data) { return db.collection("site").doc("access_policies").set(data); };
  Cloud.watchMyGrant = function (email, cb, err) {
    return db.collection("grants").doc(String(email).toLowerCase()).onSnapshot(function (s) { cb(s.exists ? s.data() : null); }, err || function () {});
  };
  Cloud.saveGrant = function (email, rec) { return db.collection("grants").doc(String(email).toLowerCase()).set(rec); };
  Cloud.listGrants = function () {
    return db.collection("grants").get().then(function (snap) { var o = {}; snap.forEach(function (d) { o[d.id] = d.data(); }); return o; });
  };
  Cloud.loadAdminState = function () { return db.collection("private").doc("access_admin").get().then(function (s) { return s.exists ? s.data() : null; }); };
  Cloud.saveAdminState = function (d) { return db.collection("private").doc("access_admin").set(d); };
  Cloud.listAccessRequests = function () {
    return db.collection("access_requests").get().then(function (snap) { var a = []; snap.forEach(function (d) { a.push(Object.assign({}, d.data(), { id: d.id })); }); return a; });
  };
  Cloud.sendAccessRequest = function (id, data) { return db.collection("access_requests").doc(id).set(data); };
  Cloud.updateAccessRequest = function (id, data) { return db.collection("access_requests").doc(id).set(data, { merge: true }); };
  /** شرائح الإعلانات العلوية (قديمة للإدارة فقط) */
  Cloud.subscribeSlides = function (cb, err) {
    return db.collection("site").where("kind", "==", "slide").onSnapshot(function (s) {
      cb(s.docs.map(function (d) { return Object.assign({}, d.data(), { id: d.id }); }));
    }, err || function () {});
  };
  /** v220: شرائح الإعلانات العامة (وثيقة مباشرة site/slides_public — تعمل لجميع الزوار بدون تعارض مع ai_vault) */
  Cloud.subscribePublicSlides = function (cb, err) {
    return db.collection("site").doc("slides_public").onSnapshot(function (s) {
      var d = s.exists ? s.data() : null;
      cb(d && Array.isArray(d.items) ? d.items : null);
    }, err || function () {});
  };
  Cloud.savePublicSlides = function (items) {
    var by = Cloud.user ? (Cloud.user.email || Cloud.user.uid) : "";
    return db.collection("site").doc("slides_public").set({
      kind: "slides_public",
      items: items || [],
      updatedAt: new Date().toISOString(),
      updatedBy: by
    });
  };
  /** v220: كتالوج الدورات السحابي (وثيقة مباشرة site/courses_catalog — قراءة للجميع، تعديل للإدارة) */
  Cloud.subscribeCoursesCatalog = function (cb, err) {
    return db.collection("site").doc("courses_catalog").onSnapshot(function (s) {
      var d = s.exists ? s.data() : null;
      cb(d && Array.isArray(d.items) ? d.items : null);
    }, err || function () {});
  };
  Cloud.saveCoursesCatalog = function (items) {
    var by = Cloud.user ? (Cloud.user.email || Cloud.user.uid) : "";
    return db.collection("site").doc("courses_catalog").set({
      kind: "courses_catalog",
      items: items || [],
      updatedAt: new Date().toISOString(),
      updatedBy: by
    });
  };
  /** v223: الإشعارات العامة للزوار (وثيقة مباشرة site/notifications_public — قراءة للجميع، كتابة للإدارة) */
  Cloud.subscribePublicNotifications = function (cb, err) {
    return db.collection("site").doc("notifications_public").onSnapshot(function (s) {
      var d = s.exists ? s.data() : null;
      cb(d && Array.isArray(d.items) ? d.items : null);
    }, err || function () {});
  };
  Cloud.savePublicNotifications = function (items) {
    var by = Cloud.user ? (Cloud.user.email || Cloud.user.uid) : "";
    return db.collection("site").doc("notifications_public").set({
      kind: "notifications_public",
      items: items || [],
      updatedAt: new Date().toISOString(),
      updatedBy: by
    });
  };
  /** v226: سياسات وصلاحيات وحدود المساعد الذكي (وثيقة مباشرة site/assistant_policy — قراءة للجميع، تعديل للإدارة فقط) */
  Cloud.subscribeAssistantPolicy = function (cb, err) {
    return db.collection("site").doc("assistant_policy").onSnapshot(function (s) {
      cb(s.exists ? s.data() : null);
    }, err || function () {});
  };
  Cloud.saveAssistantPolicy = function (pol) {
    var by = Cloud.user ? (Cloud.user.email || Cloud.user.uid) : "";
    return db.collection("site").doc("assistant_policy").set(Object.assign({}, pol || {}, {
      kind: "assistant_policy",
      updatedAt: new Date().toISOString(),
      updatedBy: by
    }));
  };
  /** v237: إعدادات ومصدر الأصوات العربية الفصحى (سحابي / محلي مدمج / هجين) — وثيقة site/voice_policy */
  Cloud.subscribeVoicePolicy = function (cb, err) {
    return db.collection("site").doc("voice_policy").onSnapshot(function (s) {
      cb(s.exists ? s.data() : null);
    }, err || function () {});
  };
  Cloud.saveVoicePolicy = function (pol) {
    var by = Cloud.user ? (Cloud.user.email || Cloud.user.uid) : "";
    return db.collection("site").doc("voice_policy").set(Object.assign({}, pol || {}, {
      kind: "voice_policy",
      updatedAt: new Date().toISOString(),
      updatedBy: by
    }));
  };
  // سقف احترازي (500 وثيقة) يحمي من انفجار تكلفة القراءة لاحقاً دون أن يمسّ المحتوى الحالي أبداً
  Cloud.subscribeBooks = function (cb, err) {
    return db.collection("books").orderBy("updatedAt", "desc").limit(500).onSnapshot(function (s) {
      cb(s.docs.map(function (d) { return Object.assign({}, d.data(), { id: d.id }); }));
    }, err);
  };
  Cloud.subscribeResources = function (cb, err) {
    return db.collection("resources").orderBy("updatedAt", "desc").limit(500).onSnapshot(function (s) {
      cb(s.docs.map(function (d) { return Object.assign({}, d.data(), { id: d.id }); }));
    }, err);
  };
  /** اختبار كتابة فعلي (للإدارة): يكتب وثيقة site/ping */
  Cloud.ping = function () {
    return db.collection("site").doc("ping").set({ at: new Date().toISOString(), by: Cloud.user ? Cloud.user.email : "" });
  };

  /** مرجع مجموعة Firestore الهجين (يدعم الحفظ المحلي والسحابي معاً) */
  Cloud.col = function (name) { return makeHybridCol(name, db); };
  Cloud.inc = function (n) { return firebase.firestore.FieldValue.increment(n); };
  Cloud.stamp = function () { return firebase.firestore.FieldValue.serverTimestamp(); };

  Cloud.listUsers = function () {
    return db.collection("users").get().then(function (snap) {
      return snap.docs.map(function (d) { return Object.assign({}, d.data(), { uid: d.id }); });
    });
  };
})();
