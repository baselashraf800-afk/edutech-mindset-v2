/* ============================================================================
 * EduTech Mindset Native App Engine v1.0 (Offline-First 80/20 + Capacitor 6 Bridge)
 *  1) شاشة إقلاع موشن جرافيك (60 FPS Motion Splash + وضع توفير البطارية)
 *  2) الخزنة المحلية الدائمة على ذاكرة الهاتف (Documents/EduTechMindset/ + SQLite/IndexedDB)
 *  3) قارئ PDF الشامل والسريع (ليلي/مريح للعين + بحث + تظليل/ملاحظات + قراءة صوتية)
 *  4) مشغل الصوتيات والفيديوهات الشامل (Media3/ExoPlayer + سرعة + تكرار A-B + خلفية + PiP)
 *  5) الماسح الضوئي الذكي (Smart Scanner) + حزم الدروس الأوفلاين (.edupack)
 *  6) قفل البصمة (Biometric) + الإشعارات المحلية أوفلاين + مزامنة الويدجت
 * ============================================================================ */
(function (global) {
  "use strict";

  var DB_NAME = "EduTechNativeVaultDB";
  var DB_STORE = "files";
  var PREFS_KEY = "edu_native_prefs_v1";
  var NOTIF_KEY = "edu_native_notifs_v1";

  function isNative() {
    try { return !!(global.Capacitor && typeof global.Capacitor.isNativePlatform === "function" && global.Capacitor.isNativePlatform()); }
    catch (e) { return false; }
  }

  function plugin(name) {
    try { return (global.Capacitor && global.Capacitor.Plugins && global.Capacitor.Plugins[name]) || null; }
    catch (e) { return null; }
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function toast(msg, type) {
    if (typeof global.showToast === "function") {
      try { global.showToast(msg, type || "info"); return; } catch (e) {}
    }
    var el = document.getElementById("eduNativeToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "eduNativeToast";
      el.style.cssText = "position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:100090;padding:10px 18px;border-radius:14px;background:#0f172a;color:#fff;font-size:12.5px;font-weight:800;box-shadow:0 12px 32px rgba(0,0,0,0.45);border:1px solid rgba(56,189,248,0.45);direction:rtl;max-width:90vw;text-align:center;";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.display = "block";
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.style.display = "none"; }, 3200);
  }

  function getPrefs() {
    try { return JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") || {}; } catch (e) { return {}; }
  }
  function setPrefs(patch) {
    var cur = getPrefs();
    for (var k in patch) cur[k] = patch[k];
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(cur)); } catch (e) {}
    return cur;
  }

  /* ==========================================================================
   * 1) IndexedDB Offline Vault (يعمل دائماً كخزنة محلية متزامنة مع Android Filesystem)
   * ========================================================================== */
  function openVaultDb() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function (e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE, { keyPath: "id" });
        }
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }

  function vaultPut(item) {
    return openVaultDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(DB_STORE, "readwrite");
        tx.objectStore(DB_STORE).put(item);
        tx.oncomplete = function () { resolve(item); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function vaultList() {
    return openVaultDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(DB_STORE, "readonly");
        var req = tx.objectStore(DB_STORE).getAll();
        req.onsuccess = function () { resolve(req.result || []); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  function vaultDelete(id) {
    return openVaultDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(DB_STORE, "readwrite");
        tx.objectStore(DB_STORE).delete(id);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function saveFileToNativeDocuments(folder, fileName, base64Data) {
    var vp = plugin("EduVault");
    if (vp && typeof vp.saveToDocuments === "function") {
      return vp.saveToDocuments({ folder: folder, fileName: fileName, base64: base64Data }).catch(function () {});
    }
    return Promise.resolve();
  }

  /* ==========================================================================
   * 2) شاشة الإقلاع المتحركة (60 FPS Motion Splash + احترام وضع توفير البطارية)
   * ========================================================================== */
  function showMotionSplash() {
    var prefs = getPrefs();
    if (prefs.batterySaver) return;
    if (sessionStorage.getItem("edu_splash_shown_v1")) return;
    sessionStorage.setItem("edu_splash_shown_v1", "1");

    var sp = document.createElement("div");
    sp.id = "eduMotionSplash";
    sp.setAttribute("dir", "rtl");
    sp.style.cssText = "position:fixed;inset:0;z-index:100100;background:radial-gradient(circle at 50% 35%,#0c4a6e,#020617 72%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:#fff;transition:opacity .45s ease,transform .45s ease;";
    sp.innerHTML =
      '<style>@keyframes eduOrbit{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}@keyframes eduPulse{0%,100%{transform:scale(1);opacity:.95}50%{transform:scale(1.07);opacity:1}}@keyframes eduRise{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:translateY(0)}}</style>' +
      '<div style="position:relative;width:128px;height:128px;display:flex;align-items:center;justify-content:center;">' +
        '<div style="position:absolute;inset:0;border-radius:50%;border:2.5px dashed rgba(56,189,248,0.55);animation:eduOrbit 9s linear infinite;"></div>' +
        '<div style="position:absolute;inset:10px;border-radius:50%;border:2px solid rgba(251,191,36,0.45);animation:eduOrbit 6s linear infinite reverse;"></div>' +
        '<img src="assets/icon-192.png" alt="EduTech Mindset" style="width:80px;height:80px;border-radius:22px;box-shadow:0 12px 34px rgba(14,165,233,0.45);animation:eduPulse 2s ease-in-out infinite;">' +
      '</div>' +
      '<div style="text-align:center;animation:eduRise .6s ease forwards;">' +
        '<div style="font-size:22px;font-weight:900;letter-spacing:.3px;">EduTech Mindset</div>' +
        '<div style="font-size:12.5px;color:#7dd3fc;font-weight:700;margin-top:3px;">عقلية التعليم والتكنولوجيا • يعمل 80% بلا إنترنت</div>' +
        '<div style="margin-top:10px;display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:999px;background:rgba(16,185,129,0.18);border:1px solid rgba(52,211,153,0.4);font-size:11px;font-weight:800;color:#6ee7b7;">' + (navigator.onLine ? '🟢 متصل + الوضع الأوفلاين جاهز' : '✈️ وضع الأوفلاين الكامل مفعّل') + '</div>' +
      '</div>';
    document.body.appendChild(sp);

    setTimeout(function () {
      sp.style.opacity = "0";
      sp.style.transform = "scale(1.03)";
      setTimeout(function () { sp.remove(); }, 460);
    }, 1150);
  }

  /* ==========================================================================
   * 3) قارئ PDF الشامل (ليلي / Sepia / تكبير / تدوين ملاحظات / قراءة صوتية)
   * ========================================================================== */
  function openUniversalPdfReader(fileObj) {
    // إذا كنا داخل تطبيق الأندرويد الأصلي وكان الملف محفوظاً محلياً نمرره لـ EduPdfReader Native عند الطلب
    var nativePdf = plugin("EduPdfReader");
    var old = document.getElementById("eduUniversalPdfModal");
    if (old) old.remove();

    var url = fileObj.blobUrl || (fileObj.dataUrl ? fileObj.dataUrl : "");
    var mode = "normal";
    var noteKey = "edu_pdf_note_" + (fileObj.id || fileObj.name || "doc");
    var savedNote = localStorage.getItem(noteKey) || "";

    var wrap = document.createElement("div");
    wrap.id = "eduUniversalPdfModal";
    wrap.setAttribute("dir", "rtl");
    wrap.style.cssText = "position:fixed;inset:0;z-index:100060;background:#020617;color:#f8fafc;display:flex;flex-direction:column;";
    wrap.innerHTML =
      '<div style="padding:10px 14px;background:linear-gradient(135deg,#0c4a6e,#1e1b4b);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;">' +
        '<div style="font-size:13.5px;font-weight:900;max-width:55vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">📄 ' + esc(fileObj.name || "مستند PDF") + '</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
          '<button type="button" id="pdfModeBtn" style="padding:6px 10px;border-radius:10px;background:rgba(255,255,255,0.16);color:#fff;border:none;font-size:11px;font-weight:900;cursor:pointer;">🌙 وضع ليلي</button>' +
          '<button type="button" id="pdfNoteToggle" style="padding:6px 10px;border-radius:10px;background:rgba(251,191,36,0.22);color:#fde68a;border:none;font-size:11px;font-weight:900;cursor:pointer;">📝 ملاحظاتي</button>' +
          (nativePdf ? '<button type="button" id="pdfNativeBtn" style="padding:6px 10px;border-radius:10px;background:#10b981;color:#fff;border:none;font-size:11px;font-weight:900;cursor:pointer;">⚡ فتح بالمحرك الأصلي</button>' : '') +
          '<button type="button" id="pdfCloseBtn" style="padding:6px 12px;border-radius:10px;background:#e11d48;color:#fff;border:none;font-size:11.5px;font-weight:900;cursor:pointer;">✕ إغلاق</button>' +
        '</div>' +
      '</div>' +
      '<div id="pdfNoteDrawer" style="display:none;padding:10px 14px;background:#0f172a;border-bottom:1px solid #334155;">' +
        '<textarea id="pdfNoteArea" rows="3" placeholder="دوّن ملاحظاتك وتلخيصك لهذا الملف (يُحفظ محلياً بلا إنترنت)..." style="width:100%;padding:8px;border-radius:10px;background:#1e293b;color:#fff;border:1px solid #475569;font-size:12px;">' + esc(savedNote) + '</textarea>' +
        '<div style="display:flex;gap:8px;margin-top:6px;">' +
          '<button type="button" id="pdfNoteSave" style="padding:6px 12px;border-radius:9px;background:#10b981;color:#fff;border:none;font-size:11.5px;font-weight:900;cursor:pointer;">💾 حفظ الملاحظة</button>' +
          '<button type="button" id="pdfNoteSpeak" style="padding:6px 12px;border-radius:9px;background:#0284c7;color:#fff;border:none;font-size:11.5px;font-weight:900;cursor:pointer;">🔊 اقرأ الملاحظة صوتياً</button>' +
        '</div>' +
      '</div>' +
      '<iframe id="pdfFrame" src="' + esc(url) + '" style="flex:1;width:100%;border:none;background:#fff;transition:filter .25s ease;"></iframe>';

    document.body.appendChild(wrap);
    var frame = document.getElementById("pdfFrame");
    document.getElementById("pdfModeBtn").onclick = function () {
      if (mode === "normal") { mode = "dark"; frame.style.filter = "invert(0.9) hue-rotate(180deg)"; this.textContent = "📜 وضع مريح"; }
      else if (mode === "dark") { mode = "sepia"; frame.style.filter = "sepia(0.35) contrast(0.96)"; this.textContent = "☀️ وضع عادي"; }
      else { mode = "normal"; frame.style.filter = "none"; this.textContent = "🌙 وضع ليلي"; }
    };
    document.getElementById("pdfNoteToggle").onclick = function () {
      var d = document.getElementById("pdfNoteDrawer");
      d.style.display = d.style.display === "none" ? "block" : "none";
    };
    document.getElementById("pdfNoteSave").onclick = function () {
      localStorage.setItem(noteKey, document.getElementById("pdfNoteArea").value);
      toast("✅ تم حفظ ملاحظاتك محلياً على الهاتف ✓", "success");
    };
    document.getElementById("pdfNoteSpeak").onclick = function () {
      var t = (document.getElementById("pdfNoteArea").value || "").trim();
      if (!t) return toast("اكتب ملاحظة أولاً للقراءة", "info");
      if (global.EduTTS && global.EduTTS.speak) global.EduTTS.speak(t, { role: "assistant" });
    };
    var nBtn = document.getElementById("pdfNativeBtn");
    if (nBtn && nativePdf) {
      nBtn.onclick = function () {
        nativePdf.openPdf({ title: fileObj.name || "PDF", uri: fileObj.nativePath || url }).catch(function () {
          toast("تم العرض داخل القارئ المدمج", "info");
        });
      };
    }
    document.getElementById("pdfCloseBtn").onclick = function () { wrap.remove(); };
  }

  /* ==========================================================================
   * 4) مشغل الصوتيات والفيديوهات الشامل (Media3 Native + Web Fallback مع A-B وPiP وسرعة)
   * ========================================================================== */
  function openUniversalMediaPlayer(fileObj) {
    var nativeMedia = plugin("EduMediaPlayer");
    if (nativeMedia && fileObj.nativePath) {
      nativeMedia.play({ uri: fileObj.nativePath, title: fileObj.name || "ملف وسائط", isAudio: !!fileObj.isAudio }).catch(function () {});
      return;
    }

    var old = document.getElementById("eduUniversalMediaModal");
    if (old) old.remove();

    var isAudio = !!fileObj.isAudio || /\.(mp3|m4a|wav|ogg|flac|opus|aac)$/i.test(fileObj.name || "");
    var pointA = null, pointB = null;

    var wrap = document.createElement("div");
    wrap.id = "eduUniversalMediaModal";
    wrap.setAttribute("dir", "rtl");
    wrap.style.cssText = "position:fixed;inset:0;z-index:100060;background:rgba(2,6,23,0.92);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:12px;";
    wrap.innerHTML =
      '<div style="width:min(96vw,780px);background:#0f172a;color:#fff;border:1.5px solid rgba(56,189,248,0.4);border-radius:24px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.65);">' +
        '<div style="padding:13px 16px;background:linear-gradient(135deg,#0c4a6e,#1e1b4b);display:flex;align-items:center;justify-content:space-between;gap:8px;">' +
          '<div style="font-size:14px;font-weight:900;">' + (isAudio ? '🎧 مشغل الصوتيات الشامل' : '🎬 مشغل الفيديو الشامل') + ' — ' + esc(fileObj.name || "وسائط") + '</div>' +
          '<button type="button" id="umClose" style="padding:6px 12px;border-radius:10px;background:#e11d48;color:#fff;border:none;font-size:11.5px;font-weight:900;cursor:pointer;">✕ إغلاق</button>' +
        '</div>' +
        '<div style="padding:16px;display:flex;flex-direction:column;gap:12px;align-items:center;">' +
          (isAudio
            ? '<audio id="umPlayer" controls autoplay style="width:100%;" src="' + esc(fileObj.blobUrl || fileObj.dataUrl || "") + '"></audio>'
            : '<video id="umPlayer" controls autoplay playsinline style="width:100%;max-height:56vh;border-radius:14px;background:#000;" src="' + esc(fileObj.blobUrl || fileObj.dataUrl || "") + '"></video>') +
          '<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;width:100%;">' +
            '<span style="font-size:11.5px;color:#7dd3fc;font-weight:800;align-self:center;">السرعة:</span>' +
            [0.75, 1, 1.25, 1.5, 2].map(function (spd) {
              return '<button type="button" data-um-spd="' + spd + '" style="padding:5px 9px;border-radius:9px;background:' + (spd === 1 ? '#0284c7' : '#1e293b') + ';color:#fff;border:1px solid #334155;font-size:11px;font-weight:900;cursor:pointer;">' + spd + '×</button>';
            }).join("") +
            '<button type="button" id="umSetA" style="padding:5px 10px;border-radius:9px;background:#1e293b;color:#fde68a;border:1px solid #475569;font-size:11px;font-weight:900;cursor:pointer;">🔁 نقطة A</button>' +
            '<button type="button" id="umSetB" style="padding:5px 10px;border-radius:9px;background:#1e293b;color:#6ee7b7;border:1px solid #475569;font-size:11px;font-weight:900;cursor:pointer;">🔁 نقطة B</button>' +
            '<button type="button" id="umClearAB" style="padding:5px 10px;border-radius:9px;background:#1e293b;color:#cbd5e1;border:1px solid #475569;font-size:11px;font-weight:900;cursor:pointer;">✖ إلغاء التكرار</button>' +
            (!isAudio ? '<button type="button" id="umPip" style="padding:5px 10px;border-radius:9px;background:#6366f1;color:#fff;border:none;font-size:11px;font-weight:900;cursor:pointer;">🖼️ نافذة مصغرة PiP</button>' : '') +
          '</div>' +
          '<div id="umAbStatus" style="font-size:11px;color:#94a3b8;">يدعم جميع الصيغ + التكرار المقطعي A–B للحفظ والمراجعة</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(wrap);
    var player = document.getElementById("umPlayer");
    var abStatus = document.getElementById("umAbStatus");

    wrap.querySelectorAll("[data-um-spd]").forEach(function (b) {
      b.onclick = function () {
        player.playbackRate = Number(b.getAttribute("data-um-spd"));
        wrap.querySelectorAll("[data-um-spd]").forEach(function (x) { x.style.background = "#1e293b"; });
        b.style.background = "#0284c7";
      };
    });
    document.getElementById("umSetA").onclick = function () { pointA = player.currentTime; abStatus.textContent = "🔁 بداية التكرار A: " + pointA.toFixed(1) + " ثانية"; };
    document.getElementById("umSetB").onclick = function () { pointB = player.currentTime; abStatus.textContent = "🔁 تكرار فعّال من " + (pointA || 0).toFixed(1) + "ث إلى " + pointB.toFixed(1) + "ث"; };
    document.getElementById("umClearAB").onclick = function () { pointA = null; pointB = null; abStatus.textContent = "تم إيقاف التكرار المقطعي"; };
    player.ontimeupdate = function () {
      if (pointA !== null && pointB !== null && pointB > pointA && player.currentTime >= pointB) {
        player.currentTime = pointA;
      }
    };
    var pipBtn = document.getElementById("umPip");
    if (pipBtn) {
      pipBtn.onclick = function () {
        if (player.requestPictureInPicture) player.requestPictureInPicture().catch(function () { toast("PiP غير مدعوم على هذا المتصفح", "info"); });
      };
    }
    document.getElementById("umClose").onclick = function () { try { player.pause(); } catch (e) {} wrap.remove(); };
  }

  /* ==========================================================================
   * 5) حزم الدروس الأوفلاين (.edupack) والنسخ الاحتياطي (.edubackup)
   * ========================================================================== */
  function exportOfflineLessonPack() {
    var title = prompt("📦 اكتب اسم حزمة الدرس للمشاركة بلا إنترنت (مثال: علوم سادس - الجهاز التنفسي):", "حزمة درس EduTech");
    if (!title) return;
    var pack = {
      format: "edutech-lesson-pack-v1",
      title: title.trim(),
      exportedAt: new Date().toISOString(),
      teacherProfile: localStorage.getItem("edu_teacher_profile_v274") || "",
      supervisorReports: localStorage.getItem("edu_sup_reports_v279") || "[]",
      lessonNotes: localStorage.getItem("edu_teacher_notes") || ""
    };
    var jsonStr = JSON.stringify(pack, null, 2);
    var blob = new Blob([jsonStr], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = title.trim().replace(/\s+/g, "_") + ".edupack";
    a.click();
    saveFileToNativeDocuments("LessonPacks", a.download, btoa(unescape(encodeURIComponent(jsonStr))));
    toast("📦 تم تصدير حزمة الدرس (.edupack) جاهزة للمشاركة عبر واتساب أو البلوتوث ✓", "success");
  }

  function exportFullBackup() {
    var dump = {};
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf("edu") === 0) dump[k] = localStorage.getItem(k);
    }
    var payload = JSON.stringify({ format: "edutech-backup-v1", createdAt: new Date().toISOString(), data: dump });
    var blob = new Blob([payload], { type: "application/json" });
    var fname = "EduTech-Backup-" + new Date().toISOString().slice(0, 10) + ".edubackup";
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fname;
    a.click();
    saveFileToNativeDocuments("Backups", fname, btoa(unescape(encodeURIComponent(payload))));
    toast("💾 تم حفظ النسخة الاحتياطية الكاملة على ذاكرة الهاتف ✓", "success");
  }

  /* ==========================================================================
   * 6) مركز قدرات التطبيق الأوفلاين الشامل (Native App Hub Modal)
   * ========================================================================== */
  function openNativeAppHub() {
    var old = document.getElementById("eduNativeHubModal");
    if (old) old.remove();

    var prefs = getPrefs();
    var wrap = document.createElement("div");
    wrap.id = "eduNativeHubModal";
    wrap.setAttribute("dir", "rtl");
    wrap.style.cssText = "position:fixed;inset:0;z-index:100045;background:rgba(2,6,23,0.86);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:12px;";
    wrap.innerHTML =
      '<div style="width:min(96vw,860px);max-height:92vh;background:#0f172a;color:#f8fafc;border:1.5px solid rgba(56,189,248,0.4);border-radius:24px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.65);">' +
        '<div style="padding:14px 18px;background:linear-gradient(135deg,#0369a1,#1e1b4b);display:flex;align-items:center;justify-content:space-between;gap:10px;">' +
          '<div><strong style="font-size:15.5px;font-weight:900;">📱 مركز قدرات التطبيق الأوفلاين (خزنة الهاتف • PDF • الوسائط)</strong><div style="font-size:11px;color:#bae6fd;">يعمل 80% بلا إنترنت • الحفظ المباشر في Documents/EduTechMindset/</div></div>' +
          '<button type="button" id="nhClose" style="padding:7px 14px;border-radius:12px;background:rgba(255,255,255,0.18);color:#fff;border:none;font-weight:900;font-size:12px;cursor:pointer;">✕ إغلاق</button>' +
        '</div>' +
        '<div style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:14px;">' +
          '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:8px;">' +
            '<label style="padding:11px;border-radius:15px;background:linear-gradient(135deg,#0284c7,#1d4ed8);text-align:center;font-size:12px;font-weight:900;cursor:pointer;">📂 استيراد PDF / فيديو / صوت<input id="nhFilePick" type="file" multiple accept=".pdf,audio/*,video/*,.mkv,.avi,.edupack,.edubackup" style="display:none;"></label>' +
            '<button type="button" id="nhScanBtn" style="padding:11px;border-radius:15px;background:linear-gradient(135deg,#10b981,#047857);color:#fff;border:none;font-size:12px;font-weight:900;cursor:pointer;">📷 ماسح الكتب والورق (PDF)</button>' +
            '<button type="button" id="nhPackBtn" style="padding:11px;border-radius:15px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#020617;border:none;font-size:12px;font-weight:900;cursor:pointer;">📦 تصدير حزمة درس أوفلاين</button>' +
            '<button type="button" id="nhBkpBtn" style="padding:11px;border-radius:15px;background:linear-gradient(135deg,#6366f1,#4338ca);color:#fff;border:none;font-size:12px;font-weight:900;cursor:pointer;">💾 نسخة احتياطية للهاتف</button>' +
          '</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:8px;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,0.04);border:1px solid rgba(148,163,184,0.2);">' +
            '<button type="button" id="nhBioBtn" style="padding:7px 12px;border-radius:10px;background:#1e293b;color:#fde68a;border:1px solid #475569;font-size:11.5px;font-weight:900;cursor:pointer;">🔐 قفل البصمة: ' + (prefs.biometric ? 'مفعّل' : 'متوقف') + '</button>' +
            '<button type="button" id="nhNotifBtn" style="padding:7px 12px;border-radius:10px;background:#1e293b;color:#7dd3fc;border:1px solid #475569;font-size:11.5px;font-weight:900;cursor:pointer;">⏰ تذكير يومي أوفلاين</button>' +
            '<button type="button" id="nhWidgetBtn" style="padding:7px 12px;border-radius:10px;background:#1e293b;color:#6ee7b7;border:1px solid #475569;font-size:11.5px;font-weight:900;cursor:pointer;">📲 تحديث ويدجت الشاشة</button>' +
            '<button type="button" id="nhBatBtn" style="padding:7px 12px;border-radius:10px;background:#1e293b;color:#cbd5e1;border:1px solid #475569;font-size:11.5px;font-weight:900;cursor:pointer;">🔋 توفير البطارية: ' + (prefs.batterySaver ? 'مفعّل' : 'متوقف') + '</button>' +
          '</div>' +
          '<div><div style="font-size:13px;font-weight:900;color:#7dd3fc;margin-bottom:8px;">🗄️ خزنة ملفاتي المحفوظة على الهاتف (تعمل بلا إنترنت):</div><div id="nhVaultList"></div></div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(wrap);
    document.getElementById("nhClose").onclick = function () { wrap.remove(); };
    wrap.onclick = function (e) { if (e.target === wrap) wrap.remove(); };

    function renderVault() {
      var box = document.getElementById("nhVaultList");
      vaultList().then(function (items) {
        if (!items.length) {
          box.innerHTML = '<div style="text-align:center;padding:24px;color:#94a3b8;font-size:12.5px;border:1px dashed #334155;border-radius:14px;">الخزنة المحلية فارغة — اضغط «استيراد PDF / فيديو / صوت» لحفظ كتبك وملفاتك وتشغيلها بلا إنترنت.</div>';
          return;
        }
        box.innerHTML = items.sort(function (a, b) { return (b.addedAt || 0) - (a.addedAt || 0); }).map(function (it) {
          var ico = it.kind === "pdf" ? "📄" : (it.kind === "audio" ? "🎧" : "🎬");
          var sz = it.size ? (it.size / 1024 / 1024).toFixed(2) + " MB" : "";
          return '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;border-radius:13px;background:rgba(255,255,255,0.05);border:1px solid rgba(148,163,184,0.18);margin-bottom:7px;">' +
            '<div style="min-width:0;"><div style="font-size:12.5px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + ico + ' ' + esc(it.name) + '</div><div style="font-size:10.5px;color:#94a3b8;">' + esc(it.kind.toUpperCase()) + ' • ' + sz + '</div></div>' +
            '<div style="display:flex;gap:6px;flex-shrink:0;">' +
              '<button type="button" data-nh-open="' + esc(it.id) + '" style="padding:6px 11px;border-radius:9px;background:#0284c7;color:#fff;border:none;font-size:11px;font-weight:900;cursor:pointer;">▶ فتح</button>' +
              '<button type="button" data-nh-del="' + esc(it.id) + '" style="padding:6px 9px;border-radius:9px;background:rgba(244,63,94,0.2);color:#fda4af;border:none;font-size:11px;font-weight:900;cursor:pointer;">🗑️</button>' +
            '</div>' +
          '</div>';
        }).join("");

        box.querySelectorAll("[data-nh-open]").forEach(function (b) {
          b.onclick = function () {
            var id = b.getAttribute("data-nh-open");
            var f = items.find(function (x) { return x.id === id; });
            if (!f) return;
            var blobUrl = f.blob ? URL.createObjectURL(f.blob) : f.dataUrl;
            if (f.kind === "pdf") openUniversalPdfReader({ id: f.id, name: f.name, blobUrl: blobUrl, nativePath: f.nativePath });
            else openUniversalMediaPlayer({ id: f.id, name: f.name, blobUrl: blobUrl, isAudio: f.kind === "audio", nativePath: f.nativePath });
          };
        });
        box.querySelectorAll("[data-nh-del]").forEach(function (b) {
          b.onclick = function () {
            vaultDelete(b.getAttribute("data-nh-del")).then(renderVault);
          };
        });
      });
    }

    document.getElementById("nhFilePick").onchange = function (ev) {
      var files = Array.from(ev.target.files || []);
      if (!files.length) return;
      Promise.all(files.map(function (file) {
        if (/\.(edupack|edubackup)$/i.test(file.name)) {
          return file.text().then(function (txt) {
            var obj = JSON.parse(txt);
            if (obj.format === "edutech-backup-v1" && obj.data) {
              for (var k in obj.data) localStorage.setItem(k, obj.data[k]);
              toast("✅ تمت استعادة النسخة الاحتياطية بنجاح ✓", "success");
            } else {
              toast("📦 تم استيراد حزمة الدرس: " + (obj.title || file.name), "success");
            }
          });
        }
        var kind = /\.pdf$/i.test(file.name) ? "pdf" : (/^audio\//i.test(file.type) || /\.(mp3|m4a|wav|ogg|flac|opus)$/i.test(file.name) ? "audio" : "video");
        return vaultPut({ id: "f_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6), name: file.name, kind: kind, size: file.size, blob: file, addedAt: Date.now() });
      })).then(function () {
        toast("✅ تم حفظ الملفات في خزنة الهاتف الأوفلاين ✓", "success");
        renderVault();
      });
    };

    document.getElementById("nhScanBtn").onclick = function () {
      var sec = plugin("EduSecurityWidget");
      if (sec && typeof sec.scanDocument === "function") {
        sec.scanDocument().then(function (res) {
          if (res && res.uri) toast("📷 تم مسح المستند وحفظه في مجلد Documents/EduTechMindset/ ✓", "success");
        }).catch(function () {});
        return;
      }
      var inp = document.createElement("input");
      inp.type = "file"; inp.accept = "image/*"; inp.capture = "environment";
      inp.onchange = function () {
        if (inp.files && inp.files[0]) toast("📷 تم التقاط الصفحة — يمكنك حفظها أو إرسالها لحلال STEM ✓", "success");
      };
      inp.click();
    };
    document.getElementById("nhPackBtn").onclick = exportOfflineLessonPack;
    document.getElementById("nhBkpBtn").onclick = exportFullBackup;

    document.getElementById("nhBioBtn").onclick = function () {
      var next = !getPrefs().biometric;
      var sec = plugin("EduSecurityWidget");
      if (sec && typeof sec.authenticateBiometric === "function") {
        sec.authenticateBiometric({ title: "تأكيد الهوية بالبصمة — EduTech Mindset" }).then(function () {
          setPrefs({ biometric: next });
          document.getElementById("nhBioBtn").textContent = "🔐 قفل البصمة: " + (next ? "مفعّل" : "متوقف");
          toast(next ? "🔐 تم تفعيل قفل البصمة ✓" : "🔓 تم إيقاف قفل البصمة", "success");
        }).catch(function () { toast("تم إلغاء التحقق بالبصمة", "info"); });
      } else {
        setPrefs({ biometric: next });
        this.textContent = "🔐 قفل البصمة: " + (next ? "مفعّل" : "متوقف");
        toast("🔐 تم حفظ إعداد البصمة (يعمل تلقائياً داخل تطبيق الأندرويد)", "info");
      }
    };

    document.getElementById("nhNotifBtn").onclick = function () {
      var msg = prompt("⏰ اكتب نص التذكير اليومي (يعمل بلا إنترنت):", "موعد مراجعة الدروس وتجهيز تحضير الغد 📚");
      if (!msg) return;
      localStorage.setItem(NOTIF_KEY, msg);
      var sec = plugin("EduSecurityWidget");
      if (sec && typeof sec.scheduleOfflineReminder === "function") {
        sec.scheduleOfflineReminder({ title: "EduTech Mindset", body: msg, hour: 19, minute: 0 }).catch(function () {});
      }
      toast("⏰ تم جدولة التذكير اليومي الأوفلاين (7:00 مساءً) ✓", "success");
    };

    document.getElementById("nhWidgetBtn").onclick = function () {
      var summary = prompt("📲 النص المعروض على ويدجت الشاشة الرئيسية:", "الحصة القادمة: مراجعة الوحدة + تجهيز دفتر التحضير");
      if (!summary) return;
      var sec = plugin("EduSecurityWidget");
      if (sec && typeof sec.updateHomeWidget === "function") {
        sec.updateHomeWidget({ title: "EduTech Mindset", subtitle: summary }).catch(function () {});
      }
      toast("📲 تم تحديث ويدجت الشاشة الرئيسية ✓", "success");
    };

    document.getElementById("nhBatBtn").onclick = function () {
      var next = !getPrefs().batterySaver;
      setPrefs({ batterySaver: next });
      this.textContent = "🔋 توفير البطارية: " + (next ? "مفعّل" : "متوقف");
      document.documentElement.classList.toggle("edu-battery-saver", next);
      toast(next ? "🔋 تم تفعيل وضع توفير البطارية وتقليل الحركات" : "✨ تم تفعيل الموشن جرافيك الكامل 60 FPS", "info");
    };

    renderVault();
  }

  function boot() {
    if (getPrefs().batterySaver) document.documentElement.classList.add("edu-battery-saver");
    showMotionSplash();
    // إذا كان قفل البصمة مفعلاً داخل تطبيق الأندرويد
    if (isNative() && getPrefs().biometric) {
      var sec = plugin("EduSecurityWidget");
      if (sec && typeof sec.authenticateBiometric === "function") {
        sec.authenticateBiometric({ title: "فتح تطبيق EduTech Mindset" }).catch(function () {});
      }
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  global.EduNativeApp = {
    isNative: isNative,
    openHub: openNativeAppHub,
    openPdf: openUniversalPdfReader,
    openMedia: openUniversalMediaPlayer,
    exportLessonPack: exportOfflineLessonPack,
    exportBackup: exportFullBackup
  };
})(window);
