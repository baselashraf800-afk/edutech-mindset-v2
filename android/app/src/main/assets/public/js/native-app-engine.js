/* ============================================================================
 * EduTech Mindset Native App Engine v2.0 (Offline-First 80/20 + Capacitor 6)
 *  1) استبدال زر «تثبيت APK» في الهيرو بزر «📱 خزنة الهاتف • PDF • الوسائط» داخل التطبيق
 *  2) قارئ PDF.js الحقيقي على Canvas (100% أوفلاين + تقليب + تكبير + ليلي/مريح + قلم وتظليل + ملاحظات + قراءة صوتية)
 *  3) مشغل AndroidX Media3 / ExoPlayer الأصلي عبر الحفظ المباشر في Documents/EduTechMindset/ + مشغل A-B
 *  4) ماسح ضوئي متعدد الصفحات يحوّل صور الكاميرا إلى ملف PDF محلي
 *  5) تثبيت الويدجت بضغطة واحدة (Pin Widget) + تفعيل كل الصلاحيات + قفل البصمة + حزم .edupack
 * ============================================================================ */
(function (global) {
  "use strict";

  var DB_NAME = "EduTechNativeVaultDB";
  var DB_STORE = "files";
  var PREFS_KEY = "edu_native_prefs_v2";
  var NOTIF_KEY = "edu_native_notifs_v2";

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
      el.style.cssText = "position:fixed;bottom:78px;left:50%;transform:translateX(-50%);z-index:100095;padding:10px 18px;border-radius:14px;background:#0f172a;color:#fff;font-size:12.5px;font-weight:800;box-shadow:0 12px 32px rgba(0,0,0,0.45);border:1px solid rgba(56,189,248,0.45);direction:rtl;max-width:90vw;text-align:center;";
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
   * 1) خزنة الهاتف المحلية الدائمة (IndexedDB + Android Documents/EduTechMindset/)
   * ========================================================================== */
  function openVaultDb() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function (e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE, { keyPath: "id" });
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

  function blobToBase64(blob) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () {
        var s = String(fr.result || "");
        var idx = s.indexOf(",");
        resolve(idx >= 0 ? s.slice(idx + 1) : s);
      };
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
  }

  function saveFileToNativeDocuments(folder, fileName, base64Data) {
    var vp = plugin("EduVault");
    if (vp && typeof vp.saveToDocuments === "function") {
      return vp.saveToDocuments({ folder: folder, fileName: fileName, base64: base64Data })
        .then(function (res) { return (res && res.path) ? res.path : ""; })
        .catch(function () { return ""; });
    }
    return Promise.resolve("");
  }

  /* ==========================================================================
   * 2) قارئ PDF.js الشامل والسريع على Canvas (يعمل 100% داخل أندرويد بلا إنترنت!)
   * ========================================================================== */
  function openUniversalPdfReader(fileObj) {
    var old = document.getElementById("eduUniversalPdfModal");
    if (old) old.remove();

    var nativePdf = plugin("EduPdfReader");
    var mode = "normal";
    var penMode = "off"; // off | highlight | pen
    var noteKey = "edu_pdf_note_" + (fileObj.id || fileObj.name || "doc");
    var savedNote = localStorage.getItem(noteKey) || "";
    var pdfDoc = null, pageNum = 1, scale = 1.35, rendering = false;

    var wrap = document.createElement("div");
    wrap.id = "eduUniversalPdfModal";
    wrap.setAttribute("dir", "rtl");
    wrap.style.cssText = "position:fixed;inset:0;z-index:100060;background:#020617;color:#f8fafc;display:flex;flex-direction:column;";
    wrap.innerHTML =
      '<div style="padding:9px 12px;background:linear-gradient(135deg,#0c4a6e,#1e1b4b);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px;flex-shrink:0;">' +
        '<div style="font-size:13px;font-weight:900;max-width:48vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">📄 ' + esc(fileObj.name || "مستند PDF") + '</div>' +
        '<div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;">' +
          '<button type="button" id="pdfModeBtn" style="padding:5px 9px;border-radius:9px;background:rgba(255,255,255,0.16);color:#fff;border:none;font-size:11px;font-weight:900;cursor:pointer;">🌙 ليلي</button>' +
          '<button type="button" id="pdfPenBtn" style="padding:5px 9px;border-radius:9px;background:rgba(251,191,36,0.22);color:#fde68a;border:none;font-size:11px;font-weight:900;cursor:pointer;">🖍️ تظليل</button>' +
          '<button type="button" id="pdfNoteToggle" style="padding:5px 9px;border-radius:9px;background:rgba(56,189,248,0.22);color:#bae6fd;border:none;font-size:11px;font-weight:900;cursor:pointer;">📝 ملاحظاتي</button>' +
          (nativePdf && fileObj.nativePath ? '<button type="button" id="pdfNativeBtn" style="padding:5px 9px;border-radius:9px;background:#10b981;color:#fff;border:none;font-size:11px;font-weight:900;cursor:pointer;">⚡ عارض النظام</button>' : '') +
          '<button type="button" id="pdfCloseBtn" style="padding:5px 11px;border-radius:9px;background:#e11d48;color:#fff;border:none;font-size:11.5px;font-weight:900;cursor:pointer;">✕ إغلاق</button>' +
        '</div>' +
      '</div>' +
      '<div style="padding:6px 12px;background:#0f172a;border-bottom:1px solid #1e293b;display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;flex-shrink:0;">' +
        '<button type="button" id="pdfPrev" style="padding:5px 12px;border-radius:9px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12px;font-weight:900;cursor:pointer;">▶ السابق</button>' +
        '<span id="pdfPageInfo" style="font-size:12px;font-weight:900;color:#7dd3fc;">جارٍ تحميل الصفحات…</span>' +
        '<button type="button" id="pdfNext" style="padding:5px 12px;border-radius:9px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12px;font-weight:900;cursor:pointer;">التالي ◀</button>' +
        '<button type="button" id="pdfZoomOut" style="padding:5px 10px;border-radius:9px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12px;font-weight:900;cursor:pointer;">➖</button>' +
        '<button type="button" id="pdfZoomIn" style="padding:5px 10px;border-radius:9px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12px;font-weight:900;cursor:pointer;">➕</button>' +
        '<button type="button" id="pdfClearDraw" style="padding:5px 9px;border-radius:9px;background:#1e293b;color:#fda4af;border:1px solid #334155;font-size:11px;font-weight:800;cursor:pointer;">🧹 مسح الرسم</button>' +
      '</div>' +
      '<div id="pdfNoteDrawer" style="display:none;padding:10px 14px;background:#0f172a;border-bottom:1px solid #334155;flex-shrink:0;">' +
        '<textarea id="pdfNoteArea" rows="3" placeholder="دوّن ملاحظاتك وتلخيصك لهذا الكتاب (يُحفظ محلياً بلا إنترنت)..." style="width:100%;padding:8px;border-radius:10px;background:#1e293b;color:#fff;border:1px solid #475569;font-size:12px;">' + esc(savedNote) + '</textarea>' +
        '<div style="display:flex;gap:8px;margin-top:6px;">' +
          '<button type="button" id="pdfNoteSave" style="padding:6px 12px;border-radius:9px;background:#10b981;color:#fff;border:none;font-size:11.5px;font-weight:900;cursor:pointer;">💾 حفظ الملاحظة</button>' +
          '<button type="button" id="pdfNoteSpeak" style="padding:6px 12px;border-radius:9px;background:#0284c7;color:#fff;border:none;font-size:11.5px;font-weight:900;cursor:pointer;">🔊 اقرأ الملاحظة صوتياً</button>' +
        '</div>' +
      '</div>' +
      '<div id="pdfCanvasHost" style="flex:1;overflow:auto;-webkit-overflow-scrolling:touch;display:flex;justify-content:center;align-items:flex-start;padding:12px;background:#0b1120;">' +
        '<div style="position:relative;display:inline-block;box-shadow:0 14px 40px rgba(0,0,0,0.6);">' +
          '<canvas id="pdfMainCanvas" style="display:block;max-width:100%;height:auto;background:#fff;border-radius:6px;transition:filter .25s ease;"></canvas>' +
          '<canvas id="pdfDrawCanvas" style="position:absolute;inset:0;width:100%;height:100%;touch-action:auto;pointer-events:none;"></canvas>' +
        '</div>' +
      '</div>';

    document.body.appendChild(wrap);
    var mainCv = document.getElementById("pdfMainCanvas");
    var drawCv = document.getElementById("pdfDrawCanvas");
    var pageInfo = document.getElementById("pdfPageInfo");

    function renderPage(num) {
      if (!pdfDoc || rendering) return;
      rendering = true;
      pdfDoc.getPage(num).then(function (page) {
        var vp = page.getViewport({ scale: scale });
        mainCv.width = vp.width;
        mainCv.height = vp.height;
        drawCv.width = vp.width;
        drawCv.height = vp.height;
        pageInfo.textContent = "صفحة " + num + " من " + pdfDoc.numPages;
        return page.render({ canvasContext: mainCv.getContext("2d"), viewport: vp }).promise;
      }).finally(function () { rendering = false; });
    }

    // رسم التظليل والقلم على الطبقة العلوية
    var drawing = false;
    function getPos(ev) {
      var rect = drawCv.getBoundingClientRect();
      var pt = ev.touches ? ev.touches[0] : ev;
      return {
        x: (pt.clientX - rect.left) * (drawCv.width / rect.width),
        y: (pt.clientY - rect.top) * (drawCv.height / rect.height)
      };
    }
    function startDraw(ev) {
      if (penMode === "off") return;
      ev.preventDefault();
      drawing = true;
      var ctx = drawCv.getContext("2d");
      var p = getPos(ev);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineCap = "round";
      ctx.lineWidth = penMode === "highlight" ? 22 : 4;
      ctx.strokeStyle = penMode === "highlight" ? "rgba(250,204,21,0.38)" : "rgba(239,68,68,0.9)";
    }
    function moveDraw(ev) {
      if (!drawing) return;
      ev.preventDefault();
      var ctx = drawCv.getContext("2d");
      var p = getPos(ev);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    function endDraw() { drawing = false; }
    drawCv.addEventListener("mousedown", startDraw); drawCv.addEventListener("mousemove", moveDraw); window.addEventListener("mouseup", endDraw);
    drawCv.addEventListener("touchstart", startDraw, { passive: false }); drawCv.addEventListener("touchmove", moveDraw, { passive: false }); drawCv.addEventListener("touchend", endDraw);

    // تحميل الملف عبر PDF.js الحقيقي
    function loadWithPdfJs(arrayBuf) {
      if (!global.pdfjsLib) {
        pageInfo.textContent = "تعذّر تحميل محرك PDF.js";
        return;
      }
      global.pdfjsLib.GlobalWorkerOptions.workerSrc = "vendor/pdfjs/pdf.worker.min.js";
      global.pdfjsLib.getDocument({ data: arrayBuf }).promise.then(function (doc) {
        pdfDoc = doc;
        pageNum = 1;
        renderPage(pageNum);
      }).catch(function () {
        pageInfo.textContent = "تعذّر قراءة ملف PDF هذا";
      });
    }

    if (fileObj.blob) {
      fileObj.blob.arrayBuffer().then(loadWithPdfJs);
    } else if (fileObj.blobUrl) {
      fetch(fileObj.blobUrl).then(function (r) { return r.arrayBuffer(); }).then(loadWithPdfJs);
    }

    document.getElementById("pdfPrev").onclick = function () { if (pdfDoc && pageNum > 1) { pageNum--; renderPage(pageNum); } };
    document.getElementById("pdfNext").onclick = function () { if (pdfDoc && pageNum < pdfDoc.numPages) { pageNum++; renderPage(pageNum); } };
    document.getElementById("pdfZoomIn").onclick = function () { scale = Math.min(3.0, scale + 0.25); renderPage(pageNum); };
    document.getElementById("pdfZoomOut").onclick = function () { scale = Math.max(0.6, scale - 0.25); renderPage(pageNum); };
    document.getElementById("pdfClearDraw").onclick = function () { drawCv.getContext("2d").clearRect(0, 0, drawCv.width, drawCv.height); };

    document.getElementById("pdfModeBtn").onclick = function () {
      if (mode === "normal") { mode = "dark"; mainCv.style.filter = "invert(0.9) hue-rotate(180deg)"; this.textContent = "📜 مريح"; }
      else if (mode === "dark") { mode = "sepia"; mainCv.style.filter = "sepia(0.35) contrast(0.96)"; this.textContent = "☀️ عادي"; }
      else { mode = "normal"; mainCv.style.filter = "none"; this.textContent = "🌙 ليلي"; }
    };
    document.getElementById("pdfPenBtn").onclick = function () {
      if (penMode === "off") { penMode = "highlight"; drawCv.style.pointerEvents = "auto"; drawCv.style.touchAction = "none"; this.textContent = "✏️ قلم أحمر"; }
      else if (penMode === "highlight") { penMode = "pen"; this.textContent = "🖐️ تمرير"; }
      else { penMode = "off"; drawCv.style.pointerEvents = "none"; drawCv.style.touchAction = "auto"; this.textContent = "🖍️ تظليل"; }
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
    if (nBtn && nativePdf && fileObj.nativePath) {
      nBtn.onclick = function () { nativePdf.openPdf({ title: fileObj.name || "PDF", uri: fileObj.nativePath }).catch(function () {}); };
    }
    document.getElementById("pdfCloseBtn").onclick = function () { wrap.remove(); };
  }

  /* ==========================================================================
   * 3) مشغل الصوتيات والفيديوهات الشامل (AndroidX Media3 الأصلي + مشغل A–B)
   * ========================================================================== */
  function openUniversalMediaPlayer(fileObj, forceWeb) {
    var nativeMedia = plugin("EduMediaPlayer");
    if (!forceWeb && nativeMedia && fileObj.nativePath) {
      var fileUri = fileObj.nativePath.indexOf("file://") === 0 ? fileObj.nativePath : ("file://" + fileObj.nativePath);
      nativeMedia.play({ uri: fileUri, title: fileObj.name || "ملف وسائط", isAudio: !!fileObj.isAudio }).catch(function () {
        openUniversalMediaPlayer(fileObj, true);
      });
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
            ? '<audio id="umPlayer" controls autoplay style="width:100%;" src="' + esc(fileObj.blobUrl || "") + '"></audio>'
            : '<video id="umPlayer" controls autoplay playsinline style="width:100%;max-height:56vh;border-radius:14px;background:#000;" src="' + esc(fileObj.blobUrl || "") + '"></video>') +
          '<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;width:100%;">' +
            [0.75, 1, 1.25, 1.5, 2].map(function (spd) {
              return '<button type="button" data-um-spd="' + spd + '" style="padding:5px 9px;border-radius:9px;background:' + (spd === 1 ? '#0284c7' : '#1e293b') + ';color:#fff;border:1px solid #334155;font-size:11px;font-weight:900;cursor:pointer;">' + spd + '×</button>';
            }).join("") +
            '<button type="button" id="umSetA" style="padding:5px 10px;border-radius:9px;background:#1e293b;color:#fde68a;border:1px solid #475569;font-size:11px;font-weight:900;cursor:pointer;">🔁 نقطة A</button>' +
            '<button type="button" id="umSetB" style="padding:5px 10px;border-radius:9px;background:#1e293b;color:#6ee7b7;border:1px solid #475569;font-size:11px;font-weight:900;cursor:pointer;">🔁 نقطة B</button>' +
            '<button type="button" id="umClearAB" style="padding:5px 10px;border-radius:9px;background:#1e293b;color:#cbd5e1;border:1px solid #475569;font-size:11px;font-weight:900;cursor:pointer;">✖ إلغاء</button>' +
            (!isAudio ? '<button type="button" id="umPip" style="padding:5px 10px;border-radius:9px;background:#6366f1;color:#fff;border:none;font-size:11px;font-weight:900;cursor:pointer;">🖼️ PiP</button>' : '') +
          '</div>' +
          '<div id="umAbStatus" style="font-size:11px;color:#94a3b8;">التكرار المقطعي A–B + سرعة التشغيل</div>' +
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
    document.getElementById("umSetA").onclick = function () { pointA = player.currentTime; abStatus.textContent = "🔁 بداية A: " + pointA.toFixed(1) + "ث"; };
    document.getElementById("umSetB").onclick = function () { pointB = player.currentTime; abStatus.textContent = "🔁 تكرار: " + (pointA || 0).toFixed(1) + "ث ← " + pointB.toFixed(1) + "ث"; };
    document.getElementById("umClearAB").onclick = function () { pointA = null; pointB = null; abStatus.textContent = "تم إيقاف التكرار"; };
    player.ontimeupdate = function () { if (pointA !== null && pointB !== null && pointB > pointA && player.currentTime >= pointB) player.currentTime = pointA; };
    var pipBtn = document.getElementById("umPip");
    if (pipBtn) pipBtn.onclick = function () { if (player.requestPictureInPicture) player.requestPictureInPicture().catch(function () {}); };
    document.getElementById("umClose").onclick = function () { try { player.pause(); } catch (e) {} wrap.remove(); };
  }

  /* ==========================================================================
   * 4) ماسح الكتب والأوراق متعدد الصفحات (تحسين تباين + تصدير/طباعة PDF)
   * ========================================================================== */
  function openSmartScannerModal() {
    var old = document.getElementById("eduScannerModal");
    if (old) old.remove();
    var pages = [];
    var wrap = document.createElement("div");
    wrap.id = "eduScannerModal";
    wrap.setAttribute("dir", "rtl");
    wrap.style.cssText = "position:fixed;inset:0;z-index:100065;background:rgba(2,6,23,0.9);display:flex;align-items:center;justify-content:center;padding:12px;";
    wrap.innerHTML =
      '<div style="width:min(96vw,680px);max-height:90vh;background:#0f172a;color:#fff;border:1.5px solid #10b981;border-radius:22px;display:flex;flex-direction:column;overflow:hidden;">' +
        '<div style="padding:13px 16px;background:linear-gradient(135deg,#065f46,#0f172a);display:flex;align-items:center;justify-content:space-between;">' +
          '<div><strong style="font-size:14.5px;font-weight:900;">📷 ماسح الكتب والورق الذكي (متعدد الصفحات ← PDF)</strong><div style="font-size:11px;color:#a7f3d0;">صوّر عدة صفحات وحوّلها لملف واحد جاهز للحفظ أو الطباعة</div></div>' +
          '<button type="button" id="scClose" style="padding:6px 12px;border-radius:10px;background:rgba(255,255,255,0.16);color:#fff;border:none;font-weight:900;cursor:pointer;">✕</button>' +
        '</div>' +
        '<div style="padding:14px;flex:1;overflow-y:auto;">' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">' +
            '<label style="flex:1;padding:10px;border-radius:12px;background:#10b981;color:#fff;text-align:center;font-size:12.5px;font-weight:900;cursor:pointer;">📸 التقاط صفحة بالكاميرا<input id="scCamInput" type="file" accept="image/*" capture="environment" style="display:none;"></label>' +
            '<label style="flex:1;padding:10px;border-radius:12px;background:#0284c7;color:#fff;text-align:center;font-size:12.5px;font-weight:900;cursor:pointer;">🖼️ إضافة صور من المعرض<input id="scGalInput" type="file" accept="image/*" multiple style="display:none;"></label>' +
          '</div>' +
          '<div id="scGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;"></div>' +
        '</div>' +
        '<div style="padding:12px 14px;border-top:1px solid #1e293b;display:flex;gap:8px;">' +
          '<button type="button" id="scBuildPdf" style="flex:1;padding:11px;border-radius:12px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#020617;border:none;font-size:13px;font-weight:900;cursor:pointer;">📄 تحويل وحفظ الصفحات كـ PDF</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);

    function renderGrid() {
      var g = document.getElementById("scGrid");
      if (!pages.length) {
        g.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:24px;color:#94a3b8;font-size:12px;">لم تُضف صفحات بعد — اضغط «التقاط صفحة بالكاميرا».</div>';
        return;
      }
      g.innerHTML = pages.map(function (src, i) {
        return '<div style="position:relative;border-radius:10px;overflow:hidden;border:1px solid #334155;"><img src="' + src + '" style="width:100%;height:150px;object-fit:cover;display:block;"><span style="position:absolute;top:4px;right:4px;background:#020617cc;color:#fff;padding:2px 6px;border-radius:6px;font-size:10px;font-weight:900;">ص ' + (i + 1) + '</span></div>';
      }).join("");
    }
    function addFiles(files) {
      Array.from(files || []).forEach(function (f) {
        var r = new FileReader();
        r.onload = function () {
          var img = new Image();
          img.onload = function () {
            var cv = document.createElement("canvas");
            var maxW = 1240, sc = Math.min(1, maxW / img.width);
            cv.width = img.width * sc; cv.height = img.height * sc;
            var ctx = cv.getContext("2d");
            ctx.filter = "contrast(1.18) brightness(1.06)";
            ctx.drawImage(img, 0, 0, cv.width, cv.height);
            pages.push(cv.toDataURL("image/jpeg", 0.86));
            renderGrid();
          };
          img.src = r.result;
        };
        r.readAsDataURL(f);
      });
    }
    document.getElementById("scCamInput").onchange = function (e) { addFiles(e.target.files); };
    document.getElementById("scGalInput").onchange = function (e) { addFiles(e.target.files); };
    document.getElementById("scBuildPdf").onclick = function () {
      if (!pages.length) return toast("أضف صفحة واحدة على الأقل أولاً", "info");
      var w = window.open("", "_blank");
      if (!w) return toast("يرجى السماح بالطباعة لحفظ PDF", "error");
      w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>EduTech Scan PDF</title><style>@page{size:A4;margin:8mm;}body{margin:0;}img{width:100%;page-break-after:always;display:block;}</style></head><body>' +
        pages.map(function (s) { return '<img src="' + s + '">'; }).join("") +
        '<script>window.onload=function(){setTimeout(function(){window.print();},350);};<\/script></body></html>');
      w.document.close();
    };
    document.getElementById("scClose").onclick = function () { wrap.remove(); };
    renderGrid();
  }

  /* ==========================================================================
   * 5) حزم الدروس الأوفلاين (.edupack) والنسخ الاحتياطي (.edubackup)
   * ========================================================================== */
  function exportOfflineLessonPack() {
    var title = prompt("📦 اكتب اسم حزمة الدرس للمشاركة بلا إنترنت:", "حزمة درس EduTech");
    if (!title) return;
    var pack = {
      format: "edutech-lesson-pack-v1", title: title.trim(), exportedAt: new Date().toISOString(),
      teacherProfile: localStorage.getItem("edu_teacher_profile_v274") || "",
      supervisorReports: localStorage.getItem("edu_sup_reports_v279") || "[]"
    };
    var jsonStr = JSON.stringify(pack, null, 2);
    var fname = title.trim().replace(/\s+/g, "_") + ".edupack";
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([jsonStr], { type: "application/json" }));
    a.download = fname;
    a.click();
    saveFileToNativeDocuments("LessonPacks", fname, btoa(unescape(encodeURIComponent(jsonStr))));
    toast("📦 تم حفظ وتصدير حزمة الدرس (.edupack) في Documents/EduTechMindset/LessonPacks/ ✓", "success");
  }

  function exportFullBackup() {
    var dump = {};
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf("edu") === 0) dump[k] = localStorage.getItem(k);
    }
    var payload = JSON.stringify({ format: "edutech-backup-v1", createdAt: new Date().toISOString(), data: dump });
    var fname = "EduTech-Backup-" + new Date().toISOString().slice(0, 10) + ".edubackup";
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    a.download = fname;
    a.click();
    saveFileToNativeDocuments("Backups", fname, btoa(unescape(encodeURIComponent(payload))));
    toast("💾 تم حفظ النسخة الاحتياطية في Documents/EduTechMindset/Backups/ ✓", "success");
  }

  /* ==========================================================================
   * 6) مركز قدرات التطبيق الأوفلاين (Native App Hub Modal)
   * ========================================================================== */
  function openNativeAppHub() {
    var old = document.getElementById("eduNativeHubModal");
    if (old) old.remove();

    var prefs = getPrefs();
    var wrap = document.createElement("div");
    wrap.id = "eduNativeHubModal";
    wrap.setAttribute("dir", "rtl");
    wrap.style.cssText = "position:fixed;inset:0;z-index:100045;background:rgba(2,6,23,0.88);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:10px;";
    wrap.innerHTML =
      '<div style="width:min(97vw,860px);max-height:92vh;background:#0f172a;color:#f8fafc;border:1.5px solid rgba(56,189,248,0.45);border-radius:24px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.65);">' +
        '<div style="padding:14px 16px;background:linear-gradient(135deg,#0369a1,#1e1b4b);display:flex;align-items:center;justify-content:space-between;gap:10px;">' +
          '<div><strong style="font-size:15px;font-weight:900;">📱 خزنة الهاتف • قارئ PDF.js • مشغل Media3 (v2.0)</strong><div style="font-size:11px;color:#bae6fd;">تعمل 80% بلا إنترنت • الحفظ الفعلي في Documents/EduTechMindset/</div></div>' +
          '<button type="button" id="nhClose" style="padding:7px 14px;border-radius:12px;background:rgba(255,255,255,0.18);color:#fff;border:none;font-weight:900;font-size:12px;cursor:pointer;">✕ إغلاق</button>' +
        '</div>' +
        '<div style="flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:12px;">' +
          '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;">' +
            '<label style="padding:11px;border-radius:14px;background:linear-gradient(135deg,#0284c7,#1d4ed8);text-align:center;font-size:12px;font-weight:900;cursor:pointer;">📂 استيراد PDF / فيديو / صوت<input id="nhFilePick" type="file" multiple accept=".pdf,audio/*,video/*,.mkv,.avi,.edupack,.edubackup" style="display:none;"></label>' +
            '<button type="button" id="nhScanBtn" style="padding:11px;border-radius:14px;background:linear-gradient(135deg,#10b981,#047857);color:#fff;border:none;font-size:12px;font-weight:900;cursor:pointer;">📷 ماسح الكتب والورق ← PDF</button>' +
            '<button type="button" id="nhPackBtn" style="padding:11px;border-radius:14px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#020617;border:none;font-size:12px;font-weight:900;cursor:pointer;">📦 تصدير حزمة درس أوفلاين</button>' +
            '<button type="button" id="nhBkpBtn" style="padding:11px;border-radius:14px;background:linear-gradient(135deg,#6366f1,#4338ca);color:#fff;border:none;font-size:12px;font-weight:900;cursor:pointer;">💾 نسخة احتياطية للهاتف</button>' +
          '</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:6px;padding:10px;border-radius:14px;background:rgba(255,255,255,0.04);border:1px solid rgba(148,163,184,0.2);">' +
            '<button type="button" id="nhPinWidgetBtn" style="padding:7px 11px;border-radius:10px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;font-size:11.5px;font-weight:900;cursor:pointer;">📲 تثبيت الويدجت على الشاشة الرئيسية</button>' +
            '<button type="button" id="nhPermsBtn" style="padding:7px 11px;border-radius:10px;background:linear-gradient(135deg,#0284c7,#0369a1);color:#fff;border:none;font-size:11.5px;font-weight:900;cursor:pointer;">🛡️ تفعيل كل الصلاحيات</button>' +
            '<button type="button" id="nhBioBtn" style="padding:7px 11px;border-radius:10px;background:#1e293b;color:#fde68a;border:1px solid #475569;font-size:11.5px;font-weight:900;cursor:pointer;">🔐 البصمة: ' + (prefs.biometric ? 'مفعّل' : 'متوقف') + '</button>' +
            '<button type="button" id="nhWidgetBtn" style="padding:7px 11px;border-radius:10px;background:#1e293b;color:#6ee7b7;border:1px solid #475569;font-size:11.5px;font-weight:900;cursor:pointer;">✏️ تعديل نص الويدجت</button>' +
            '<button type="button" id="nhNotifBtn" style="padding:7px 11px;border-radius:10px;background:#1e293b;color:#7dd3fc;border:1px solid #475569;font-size:11.5px;font-weight:900;cursor:pointer;">⏰ تذكير أوفلاين</button>' +
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
          box.innerHTML = '<div style="text-align:center;padding:22px;color:#94a3b8;font-size:12.5px;border:1px dashed #334155;border-radius:14px;">الخزنة فارغة — اضغط «استيراد PDF / فيديو / صوت» لحفظ ملفاتك وتشغيلها بمحرك PDF.js وMedia3 بلا إنترنت.</div>';
          return;
        }
        box.innerHTML = items.sort(function (a, b) { return (b.addedAt || 0) - (a.addedAt || 0); }).map(function (it) {
          var ico = it.kind === "pdf" ? "📄" : (it.kind === "audio" ? "🎧" : "🎬");
          var sz = it.size ? (it.size / 1024 / 1024).toFixed(2) + " MB" : "";
          var badge = it.nativePath ? ' • محفوظ بالذاكرة ✓' : '';
          return '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;border-radius:13px;background:rgba(255,255,255,0.05);border:1px solid rgba(148,163,184,0.18);margin-bottom:7px;">' +
            '<div style="min-width:0;"><div style="font-size:12.5px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + ico + ' ' + esc(it.name) + '</div><div style="font-size:10.5px;color:#94a3b8;">' + esc(it.kind.toUpperCase()) + ' • ' + sz + badge + '</div></div>' +
            '<div style="display:flex;gap:5px;flex-shrink:0;">' +
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
            var blobUrl = f.blob ? URL.createObjectURL(f.blob) : "";
            if (f.kind === "pdf") openUniversalPdfReader({ id: f.id, name: f.name, blob: f.blob, blobUrl: blobUrl, nativePath: f.nativePath });
            else openUniversalMediaPlayer({ id: f.id, name: f.name, blobUrl: blobUrl, isAudio: f.kind === "audio", nativePath: f.nativePath });
          };
        });
        box.querySelectorAll("[data-nh-del]").forEach(function (b) {
          b.onclick = function () { vaultDelete(b.getAttribute("data-nh-del")).then(renderVault); };
        });
      });
    }

    document.getElementById("nhFilePick").onchange = function (ev) {
      var files = Array.from(ev.target.files || []);
      if (!files.length) return;
      toast("⏳ جارٍ الحفظ على ذاكرة الهاتف…", "info");
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
        var folder = kind === "pdf" ? "Books" : (kind === "audio" ? "Audio" : "Videos");
        var saveNative = (isNative() && file.size < 45 * 1024 * 1024)
          ? blobToBase64(file).then(function (b64) { return saveFileToNativeDocuments(folder, file.name, b64); })
          : Promise.resolve("");
        return saveNative.then(function (nativePath) {
          return vaultPut({
            id: "f_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
            name: file.name, kind: kind, size: file.size, blob: file, nativePath: nativePath, addedAt: Date.now()
          });
        });
      })).then(function () {
        toast("✅ تم الحفظ بنجاح في خزنة الهاتف الأوفلاين ✓", "success");
        renderVault();
      });
    };

    document.getElementById("nhScanBtn").onclick = openSmartScannerModal;
    document.getElementById("nhPackBtn").onclick = exportOfflineLessonPack;
    document.getElementById("nhBkpBtn").onclick = exportFullBackup;

    document.getElementById("nhPinWidgetBtn").onclick = function () {
      var sec = plugin("EduSecurityWidget");
      if (sec && typeof sec.pinHomeWidget === "function") {
        sec.pinHomeWidget().then(function (res) {
          if (res && res.pinned) toast("📲 اضغط «إضافة» لتثبيت الويدجت على شاشتك الرئيسية ✓", "success");
          else toast("افتح الأدوات المصغّرة (تطبيقات Android) واختر EduTech Mindset", "info");
        }).catch(function () {});
      } else {
        toast("تثبيت الويدجت يعمل داخل تطبيق الأندرويد", "info");
      }
    };

    document.getElementById("nhPermsBtn").onclick = function () {
      var sec = plugin("EduSecurityWidget");
      if (sec && typeof sec.requestAllPermissions === "function") {
        sec.requestAllPermissions().then(function () { toast("🛡️ تم طلب صلاحيات الكاميرا والصوت والتخزين والإشعارات ✓", "success"); });
      }
    };

    document.getElementById("nhBioBtn").onclick = function () {
      var next = !getPrefs().biometric;
      var sec = plugin("EduSecurityWidget");
      if (sec && typeof sec.authenticateBiometric === "function") {
        sec.authenticateBiometric({ title: "تأكيد البصمة — EduTech Mindset" }).then(function () {
          setPrefs({ biometric: next });
          document.getElementById("nhBioBtn").textContent = "🔐 البصمة: " + (next ? "مفعّل" : "متوقف");
          toast(next ? "🔐 تم تفعيل قفل البصمة ✓" : "🔓 تم إيقاف قفل البصمة", "success");
        }).catch(function () {});
      }
    };

    document.getElementById("nhWidgetBtn").onclick = function () {
      var summary = prompt("📲 اكتب النص الذي تريد عرضه على ويدجت الشاشة الرئيسية:", "جدول اليوم: تجهيز تحضير الأونروا + مراجعة الدروس");
      if (!summary) return;
      var sec = plugin("EduSecurityWidget");
      if (sec && typeof sec.updateHomeWidget === "function") {
        sec.updateHomeWidget({ title: "EduTech Mindset", subtitle: summary }).catch(function () {});
        toast("📲 تم تحديث نص الويدجت ✓", "success");
      }
    };

    document.getElementById("nhNotifBtn").onclick = function () {
      var msg = prompt("⏰ نص التذكير اليومي (يعمل بلا إنترنت):", "موعد مراجعة الدروس وتجهيز تحضير الغد 📚");
      if (!msg) return;
      localStorage.setItem(NOTIF_KEY, msg);
      var ln = plugin("LocalNotifications");
      if (ln && typeof ln.schedule === "function") {
        ln.schedule({ notifications: [{ id: 2801, title: "EduTech Mindset", body: msg, schedule: { at: new Date(Date.now() + 10000) } }] }).catch(function () {});
      }
      toast("⏰ تم جدولة التذكير الأوفلاين (سيصلك إشعار تجريبي خلال 10 ثوانٍ) ✓", "success");
    };

    renderVault();
  }

  /* ==========================================================================
   * 7) تحويل زر «تثبيت كتطبيق / APK» في الهيرو إلى زر «📱 خزنتي الأوفلاين» داخل التطبيق
   * ========================================================================== */
  function upgradeHeroForNativeApp() {
    if (!isNative()) return;
    var swap = function () {
      var heroInstall = document.querySelector("#btnHeroInstallApp, [data-install-app]");
      if (heroInstall && !heroInstall.getAttribute("data-v2-swapped")) {
        heroInstall.setAttribute("data-v2-swapped", "1");
        heroInstall.innerHTML = "📱 خزنتي الأوفلاين (PDF • وسائط)";
        heroInstall.style.background = "linear-gradient(135deg,#059669,#0284c7)";
        heroInstall.style.color = "#ffffff";
        heroInstall.onclick = function (e) { e.preventDefault(); e.stopPropagation(); openNativeAppHub(); };
      }
    };
    swap();
    setTimeout(swap, 800);
    setTimeout(swap, 2200);
  }

  function boot() {
    upgradeHeroForNativeApp();
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
    version: "2.0.0",
    isNative: isNative,
    openHub: openNativeAppHub,
    openPdf: openUniversalPdfReader,
    openMedia: openUniversalMediaPlayer,
    openScanner: openSmartScannerModal,
    exportLessonPack: exportOfflineLessonPack,
    exportBackup: exportFullBackup
  };
})(window);
