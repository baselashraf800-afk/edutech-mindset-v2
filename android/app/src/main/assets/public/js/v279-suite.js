/* ============================================================================
 * EduTech Mindset v279 — الحزمة المتكاملة للإدارة والمشرفين وتجربة المستخدم
 *  1) وضع التحرير المباشر للنصوص على الصفحة (Live Edit Mode — للإدارة مع مزامنة سحابية)
 *  2) مولّد بوسترات الإعلانات الفوري (Canvas Poster Studio 1080×1080 / 1080×1350 PNG)
 *  3) بوابة المشرفين التربويين والتقارير الرسمية (مع طباعة/حفظ PDF ومزامنة سحابية)
 *  4) سجل «ما الجديد في المنصة» (What's New + إعلانات الإدارة)
 *  5) إمكانية الوصول (تكبير الخط المرن 100%/110%/125% + aria-label تلقائي + مؤثرات نقر اختيارية)
 * ============================================================================ */
(function (global) {
  "use strict";

  var LIVE_KEY = "edu_live_edits_v279";
  var SUP_KEY = "edu_sup_reports_v279";
  var WN_KEY = "edu_whats_new_v279";
  var FONT_KEY = "edu_font_scale_v279";
  var SOUND_KEY = "edu_ui_sound_v279";

  var liveEditActive = false;
  var originalTexts = {};
  var audioCtx = null;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function toast(msg, type) {
    if (typeof global.showToast === "function") {
      try { global.showToast(msg, type || "info"); return; } catch (e) {}
    }
    var el = document.getElementById("eduV279Toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "eduV279Toast";
      el.style.cssText = "position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:100050;padding:10px 18px;border-radius:14px;background:#0f172a;color:#fff;font-size:12.5px;font-weight:800;box-shadow:0 12px 32px rgba(0,0,0,0.45);border:1px solid rgba(56,189,248,0.4);direction:rtl;max-width:90vw;text-align:center;";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.display = "block";
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.style.display = "none"; }, 3200);
  }

  function isAdmin() {
    try {
      if (document.body && document.body.classList.contains("is-super-admin")) return true;
      if (typeof global.isSuperAdminUser === "function" && global.isSuperAdminUser()) return true;
      if (global.EduAccessControl && typeof global.EduAccessControl.isAdmin === "function" && global.EduAccessControl.isAdmin()) return true;
    } catch (e) {}
    return false;
  }

  function lockBody(open) {
    if (open) {
      document.body.classList.add("edu-any-modal-open");
      document.documentElement.classList.add("modal-open");
    } else {
      if (!document.querySelector(".edu-v279-modal")) {
        document.body.classList.remove("edu-any-modal-open");
        document.documentElement.classList.remove("modal-open");
      }
    }
  }

  function closeModalById(id) {
    var m = document.getElementById(id);
    if (m) m.remove();
    lockBody(false);
  }

  function readJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }

  function writeJson(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  function cloudSave(docId, data) {
    try {
      if (global.Cloud && typeof global.Cloud.commit === "function") {
        global.Cloud.commit([{ col: "site", id: docId, data: data }]).catch(function () {});
      }
    } catch (e) {}
  }

  function cloudRead(docId, cb) {
    try {
      if (global.Cloud && typeof global.Cloud.getDoc === "function") {
        global.Cloud.getDoc("site", docId).then(function (d) { if (d) cb(d); }).catch(function () {});
      }
    } catch (e) {}
  }

  /* ==========================================================================
   * 1) إمكانية الوصول (تكبير الخط المرن + aria-label تلقائي + مؤثرات نقر اختيارية)
   * ========================================================================== */
  function getFontScale() {
    var v = Number(localStorage.getItem(FONT_KEY) || "100");
    return (v === 110 || v === 125) ? v : 100;
  }

  function setFontScale(pct) {
    var v = (pct === 110 || pct === 125) ? pct : 100;
    try { localStorage.setItem(FONT_KEY, String(v)); } catch (e) {}
    document.documentElement.style.fontSize = v + "%";
    document.querySelectorAll("[data-v279-font]").forEach(function (b) {
      var active = Number(b.getAttribute("data-v279-font")) === v;
      b.style.background = active ? "linear-gradient(135deg,#0ea5e9,#2563eb)" : "rgba(148,163,184,0.14)";
      b.style.color = active ? "#fff" : "";
    });
  }

  function isUiSoundOn() {
    try { return localStorage.getItem(SOUND_KEY) === "1"; } catch (e) { return false; }
  }

  function playUiBeep(freq) {
    if (!isUiSoundOn()) return;
    try {
      var AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return;
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === "suspended") audioCtx.resume();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq || 540;
      gain.gain.setValueAtTime(0.035, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.085);
    } catch (e) {}
  }

  function toggleUiSound() {
    var next = !isUiSoundOn();
    try { localStorage.setItem(SOUND_KEY, next ? "1" : "0"); } catch (e) {}
    if (next) playUiBeep(660);
    toast(next ? "🔔 تم تفعيل مؤثرات النقر اللطيفة" : "🔕 تم إيقاف مؤثرات النقر", "info");
    return next;
  }

  function applyAutoAriaLabels() {
    var iconMap = {
      "fa-xmark": "إغلاق", "fa-times": "إغلاق", "fa-bars": "القائمة",
      "fa-magnifying-glass": "بحث", "fa-search": "بحث", "fa-volume-high": "استماع صوتي",
      "fa-moon": "الوضع الداكن", "fa-sun": "الوضع الفاتح", "fa-bell": "الإشعارات",
      "fa-share-nodes": "مشاركة", "fa-download": "تحميل", "fa-print": "طباعة"
    };
    document.querySelectorAll("button:not([aria-label])").forEach(function (btn) {
      if ((btn.textContent || "").trim()) return;
      var ico = btn.querySelector("i");
      if (!ico) return;
      var cls = ico.className || "";
      for (var k in iconMap) {
        if (cls.indexOf(k) !== -1) {
          btn.setAttribute("aria-label", iconMap[k]);
          break;
        }
      }
    });
  }

  /* ==========================================================================
   * 2) وضع التحرير المباشر للنصوص على الصفحة (Live Edit Mode — للإدارة فقط)
   * ========================================================================== */
  function collectEditableNodes() {
    var nodes = [];
    var sel = "#hero h1, #hero h2, #hero p, #learnSection > div h2, #learnSection > div p, #unifiedToolsHub h2, #coursesSection h2, footer span#footerAdminSecretTrigger";
    var list = document.querySelectorAll(sel);
    var idx = 0;
    list.forEach(function (el) {
      if (!el || el.closest("#adminDevFooterHub") || el.closest(".edu-v279-modal") || el.children.length > 3) return;
      var txt = (el.textContent || "").trim();
      if (!txt || txt.length < 3) return;
      var key = el.getAttribute("data-v279-edit-key");
      if (!key) {
        key = "le_" + idx + "_" + el.tagName.toLowerCase();
        el.setAttribute("data-v279-edit-key", key);
      }
      idx++;
      nodes.push({ el: el, key: key });
    });
    return nodes;
  }

  function applySavedLiveEdits(map) {
    if (!map || typeof map !== "object") return;
    var nodes = collectEditableNodes();
    nodes.forEach(function (item) {
      if (typeof map[item.key] === "string" && map[item.key].trim()) {
        if (originalTexts[item.key] === undefined) originalTexts[item.key] = item.el.textContent;
        item.el.textContent = map[item.key];
      }
    });
  }

  function toggleLiveEdit(forceState) {
    if (!isAdmin()) {
      toast("🔒 وضع التحرير المباشر متاح للإدارة فقط", "error");
      return;
    }
    liveEditActive = (typeof forceState === "boolean") ? forceState : !liveEditActive;
    var nodes = collectEditableNodes();

    if (liveEditActive) {
      nodes.forEach(function (item) {
        if (originalTexts[item.key] === undefined) originalTexts[item.key] = item.el.textContent;
        item.el.setAttribute("contenteditable", "true");
        item.el.style.outline = "2px dashed #f59e0b";
        item.el.style.outlineOffset = "4px";
        item.el.style.borderRadius = "8px";
        item.el.style.cursor = "text";
      });
      renderLiveEditBar();
      toast("✏️ وضع التحرير المباشر مفعّل — انقر على أي عنوان أو نص لتعديله ثم اضغط حفظ", "success");
    } else {
      nodes.forEach(function (item) {
        item.el.removeAttribute("contenteditable");
        item.el.style.outline = "";
        item.el.style.outlineOffset = "";
        item.el.style.cursor = "";
      });
      var bar = document.getElementById("eduV279LiveBar");
      if (bar) bar.remove();
    }
  }

  function renderLiveEditBar() {
    var old = document.getElementById("eduV279LiveBar");
    if (old) old.remove();
    var bar = document.createElement("div");
    bar.id = "eduV279LiveBar";
    bar.setAttribute("dir", "rtl");
    bar.style.cssText = "position:fixed;bottom:16px;left:16px;right:16px;max-width:560px;margin:0 auto;z-index:100040;background:linear-gradient(135deg,#0f172a,#1e1b4b);color:#fff;border:1.5px solid #f59e0b;border-radius:18px;padding:10px 14px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;box-shadow:0 18px 48px rgba(0,0,0,0.55);";
    bar.innerHTML =
      '<div style="font-size:12px;font-weight:900;color:#fde68a;">✏️ التحرير المباشر مفعّل — عدّل النصوص المحددة بالأصفر</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
        '<button type="button" id="v279LiveSave" style="padding:7px 12px;border-radius:11px;background:#10b981;color:#fff;border:none;font-size:11.5px;font-weight:900;cursor:pointer;">💾 حفظ ونشر</button>' +
        '<button type="button" id="v279LiveReset" style="padding:7px 10px;border-radius:11px;background:rgba(244,63,94,0.22);color:#fda4af;border:1px solid rgba(244,63,94,0.4);font-size:11px;font-weight:900;cursor:pointer;">↩️ استعادة الأصلي</button>' +
        '<button type="button" id="v279LiveExit" style="padding:7px 10px;border-radius:11px;background:rgba(255,255,255,0.14);color:#fff;border:none;font-size:11px;font-weight:900;cursor:pointer;">✕ إنهاء</button>' +
      '</div>';
    document.body.appendChild(bar);

    document.getElementById("v279LiveSave").onclick = function () {
      var edits = {};
      collectEditableNodes().forEach(function (item) {
        var cur = (item.el.textContent || "").trim();
        if (cur && cur !== originalTexts[item.key]) edits[item.key] = cur;
      });
      writeJson(LIVE_KEY, edits);
      cloudSave("live_edits_v279", { edits: edits, updatedAt: Date.now() });
      toast("✅ تم حفظ التعديلات النصية ومزامنتها سحابياً للجميع ✓", "success");
      toggleLiveEdit(false);
    };
    document.getElementById("v279LiveReset").onclick = function () {
      if (!confirm("هل تريد استعادة جميع النصوص الأصلية للموقع؟")) return;
      collectEditableNodes().forEach(function (item) {
        if (originalTexts[item.key] !== undefined) item.el.textContent = originalTexts[item.key];
      });
      writeJson(LIVE_KEY, {});
      cloudSave("live_edits_v279", { edits: {}, updatedAt: Date.now() });
      toast("↩️ تمت استعادة النصوص الأصلية ✓", "info");
      toggleLiveEdit(false);
    };
    document.getElementById("v279LiveExit").onclick = function () { toggleLiveEdit(false); };
  }

  /* ==========================================================================
   * 3) مولّد بوسترات الإعلانات الفوري (Canvas Poster Studio)
   * ========================================================================== */
  var POSTER_THEMES = {
    royal:   { name: "كحلي ملكي",        bg1: "#020617", bg2: "#0f172a", bg3: "#1e3a8a", accent: "#38bdf8", badgeBg: "#f59e0b", badgeFg: "#020617" },
    unrwa:   { name: "أزرق الأونروا",    bg1: "#082f49", bg2: "#0369a1", bg3: "#0c4a6e", accent: "#7dd3fc", badgeBg: "#fbbf24", badgeFg: "#082f49" },
    emerald: { name: "أخضر علمي",        bg1: "#022c22", bg2: "#065f46", bg3: "#064e3b", accent: "#34d399", badgeBg: "#fde047", badgeFg: "#022c22" },
    violet:  { name: "بنفسجي AI",        bg1: "#1e1b4b", bg2: "#4c1d95", bg3: "#312e81", accent: "#c084fc", badgeBg: "#38bdf8", badgeFg: "#0f172a" }
  };

  function wrapCanvasText(ctx, text, maxWidth) {
    var paras = String(text || "").split(/\n+/);
    var lines = [];
    paras.forEach(function (p) {
      var words = p.trim().split(/\s+/);
      var line = "";
      for (var i = 0; i < words.length; i++) {
        var test = line ? (line + " " + words[i]) : words[i];
        if (ctx.measureText(test).width > maxWidth && line) {
          lines.push(line);
          line = words[i];
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
    });
    return lines;
  }

  function drawAnnouncementPoster(canvas, cfg) {
    var W = 1080;
    var H = cfg.ratio === "story" ? 1350 : 1080;
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext("2d");
    var th = POSTER_THEMES[cfg.theme] || POSTER_THEMES.royal;

    // الخلفية المتدرجة
    var g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, th.bg1);
    g.addColorStop(0.55, th.bg2);
    g.addColorStop(1, th.bg3);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // دوائر إضاءة هندسية ناعمة
    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = th.accent;
    ctx.beginPath(); ctx.arc(140, 140, 260, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W - 110, H - 150, 310, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // إطار خارجي أنيق
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 4;
    ctx.strokeRect(42, 42, W - 84, H - 84);

    ctx.direction = "rtl";
    ctx.textAlign = "center";

    // الترويسة العلوية
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "900 34px Cairo, Tajawal, sans-serif";
    ctx.fillText("EduTech Mindset  •  عقلية التعليم والتكنولوجيا", W / 2, 118);

    // الشارة العلوية
    var badgeTxt = cfg.badge || "إعلان هام";
    ctx.font = "900 32px Cairo, Tajawal, sans-serif";
    var bw = Math.max(250, ctx.measureText(badgeTxt).width + 90);
    var bx = (W - bw) / 2, by = 162, bh = 64;
    ctx.fillStyle = th.badgeBg;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 32); else ctx.rect(bx, by, bw, bh);
    ctx.fill();
    ctx.fillStyle = th.badgeFg;
    ctx.fillText(badgeTxt, W / 2, by + 44);

    // العنوان الرئيسي
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 62px Cairo, Tajawal, sans-serif";
    var titleLines = wrapCanvasText(ctx, cfg.title || "عنوان الإعلان", W - 180).slice(0, 3);
    var y = 320;
    titleLines.forEach(function (ln) {
      ctx.fillText(ln, W / 2, y);
      y += 82;
    });

    // خط فاصل متوهج
    ctx.fillStyle = th.accent;
    ctx.fillRect(W / 2 - 140, y - 22, 280, 6);
    y += 50;

    // بطاقة المحتوى الوسطى
    var bodyLines = wrapCanvasText(ctx, cfg.body || "", W - 230).slice(0, cfg.ratio === "story" ? 10 : 7);
    var boxH = Math.max(200, bodyLines.length * 56 + 80);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(86, y - 34, W - 172, boxH, 28); else ctx.rect(86, y - 34, W - 172, boxH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#f1f5f9";
    ctx.font = "700 36px Cairo, Tajawal, sans-serif";
    var byText = y + 32;
    bodyLines.forEach(function (ln) {
      ctx.fillText(ln, W / 2, byText);
      byText += 56;
    });

    // التاريخ / الموعد إن وُجد
    if (cfg.dateText && cfg.dateText.trim()) {
      ctx.fillStyle = th.accent;
      ctx.font = "900 32px Cairo, Tajawal, sans-serif";
      ctx.fillText("📅 " + cfg.dateText.trim(), W / 2, H - 176);
    }

    // التذييل الرسمي
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "800 28px Cairo, Tajawal, sans-serif";
    ctx.fillText(cfg.footer || "إدارة وإشراف أ. باسل أشرف الفقعاوي — غزة، فلسطين 🇵🇸", W / 2, H - 112);

    ctx.fillStyle = th.accent;
    ctx.font = "700 24px sans-serif";
    ctx.fillText("edutech-mindset.pages.dev", W / 2, H - 68);
  }

  function openPoster() {
    closeModalById("eduV279PosterModal");
    var todayAr = new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
    var wrap = document.createElement("div");
    wrap.id = "eduV279PosterModal";
    wrap.className = "edu-v279-modal";
    wrap.setAttribute("dir", "rtl");
    wrap.style.cssText = "position:fixed;inset:0;z-index:100020;background:rgba(2,6,23,0.84);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:12px;";
    wrap.innerHTML =
      '<div style="width:min(96vw,960px);max-height:92vh;background:#0f172a;color:#f8fafc;border:1.5px solid rgba(56,189,248,0.35);border-radius:24px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.6);">' +
        '<div style="padding:14px 18px;background:linear-gradient(135deg,#0c4a6e,#1e1b4b);display:flex;align-items:center;justify-content:space-between;gap:10px;flex-shrink:0;">' +
          '<div><strong style="font-size:15.5px;font-weight:900;">🖼️ مولّد بوسترات الإعلانات الفوري</strong><div style="font-size:11px;color:#bae6fd;">صمّم إعلاناً رسمياً جاهزاً للنشر على واتساب وفيسبوك بضغطة زر</div></div>' +
          '<button type="button" id="v279PosterClose" style="padding:7px 14px;border-radius:12px;background:rgba(255,255,255,0.18);color:#fff;border:none;font-weight:900;font-size:12px;cursor:pointer;">✕ إغلاق</button>' +
        '</div>' +
        '<div style="flex:1;overflow-y:auto;padding:16px;display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:16px;align-items:start;">' +
          '<div style="display:flex;flex-direction:column;gap:10px;">' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
              '<label style="font-size:11.5px;font-weight:800;color:#93c5fd;">القالب اللوني<select id="v279PTheme" style="width:100%;margin-top:4px;padding:8px;border-radius:11px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12px;font-weight:700;"><option value="royal">كحلي ملكي</option><option value="unrwa">أزرق الأونروا</option><option value="emerald">أخضر علمي</option><option value="violet">بنفسجي AI</option></select></label>' +
              '<label style="font-size:11.5px;font-weight:800;color:#93c5fd;">المقاس<select id="v279PRatio" style="width:100%;margin-top:4px;padding:8px;border-radius:11px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12px;font-weight:700;"><option value="square">مربع (1080×1080)</option><option value="story">طولي ستوري (1080×1350)</option></select></label>' +
            '</div>' +
            '<label style="font-size:11.5px;font-weight:800;color:#93c5fd;">الشارة العلوية<input id="v279PBadge" value="إعلان هام" style="width:100%;margin-top:4px;padding:9px 11px;border-radius:11px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12.5px;font-weight:700;"></label>' +
            '<label style="font-size:11.5px;font-weight:800;color:#93c5fd;">عنوان الإعلان<input id="v279PTitle" value="إطلاق التحديث الجديد لمنصة EduTech Mindset" style="width:100%;margin-top:4px;padding:9px 11px;border-radius:11px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12.5px;font-weight:700;"></label>' +
            '<label style="font-size:11.5px;font-weight:800;color:#93c5fd;">تفاصيل الإعلان<textarea id="v279PBody" rows="4" style="width:100%;margin-top:4px;padding:9px 11px;border-radius:11px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12.5px;font-weight:700;">أدوات ذكية مجانية للمعلمين والطلاب في فلسطين: دفتر تحضير الأونروا الرسمي PDF، غرفة عمليات المعلم، وتطبيق الأندرويد المباشر.</textarea></label>' +
            '<label style="font-size:11.5px;font-weight:800;color:#93c5fd;">التاريخ أو الموعد (اختياري)<input id="v279PDate" value="' + esc(todayAr) + '" style="width:100%;margin-top:4px;padding:9px 11px;border-radius:11px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12.5px;font-weight:700;"></label>' +
            '<label style="font-size:11.5px;font-weight:800;color:#93c5fd;">التوقيع السفلي<input id="v279PFooter" value="إدارة وإشراف أ. باسل أشرف الفقعاوي — غزة، فلسطين 🇵🇸" style="width:100%;margin-top:4px;padding:9px 11px;border-radius:11px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12.5px;font-weight:700;"></label>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">' +
              '<button type="button" id="v279PDownload" style="flex:1;padding:11px 14px;border-radius:13px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;font-size:13px;font-weight:900;cursor:pointer;">⬇️ تحميل البوستر (PNG)</button>' +
              '<button type="button" id="v279PShare" style="padding:11px 14px;border-radius:13px;background:linear-gradient(135deg,#0ea5e9,#2563eb);color:#fff;border:none;font-size:13px;font-weight:900;cursor:pointer;">📤 مشاركة</button>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;">' +
            '<canvas id="v279PCanvas" style="width:100%;max-width:420px;height:auto;border-radius:16px;box-shadow:0 16px 40px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.16);"></canvas>' +
            '<span style="font-size:11px;color:#94a3b8;">معاينة حيّة عالية الدقة (1080px)</span>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(wrap);
    lockBody(true);

    var cv = document.getElementById("v279PCanvas");
    function redraw() {
      drawAnnouncementPoster(cv, {
        theme: document.getElementById("v279PTheme").value,
        ratio: document.getElementById("v279PRatio").value,
        badge: document.getElementById("v279PBadge").value,
        title: document.getElementById("v279PTitle").value,
        body: document.getElementById("v279PBody").value,
        dateText: document.getElementById("v279PDate").value,
        footer: document.getElementById("v279PFooter").value
      });
    }
    ["v279PTheme", "v279PRatio", "v279PBadge", "v279PTitle", "v279PBody", "v279PDate", "v279PFooter"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.oninput = redraw; el.onchange = redraw; }
    });
    redraw();

    document.getElementById("v279PosterClose").onclick = function () { closeModalById("eduV279PosterModal"); };
    wrap.onclick = function (e) { if (e.target === wrap) closeModalById("eduV279PosterModal"); };

    document.getElementById("v279PDownload").onclick = function () {
      var a = document.createElement("a");
      a.download = "EduTech-Poster-" + Date.now() + ".png";
      a.href = cv.toDataURL("image/png");
      a.click();
      playUiBeep(720);
      toast("✅ تم تحميل بوستر الإعلان بنجاح ✓", "success");
    };

    document.getElementById("v279PShare").onclick = function () {
      cv.toBlob(function (blob) {
        if (blob && navigator.share && navigator.canShare) {
          var file = new File([blob], "EduTech-Poster.png", { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file], title: document.getElementById("v279PTitle").value }).catch(function () {});
            return;
          }
        }
        document.getElementById("v279PDownload").click();
      }, "image/png");
    };
  }

  /* ==========================================================================
   * 4) بوابة المشرفين التربويين والتقارير الرسمية (Supervisors Portal)
   * ========================================================================== */
  function getSupervisorReports() {
    var list = readJson(SUP_KEY, null);
    if (Array.isArray(list)) return list;
    return [
      {
        id: "rep_welcome_1",
        supervisor: "أ. باسل أشرف الفقعاوي",
        area: "خان يونس",
        school: "مبادرة EduTech Mindset — قطاع غزة",
        subject: "تكنولوجيا التعليم والتحضير الرقمي",
        visitType: "توجيه وإرشاد إلكتروني",
        rating: "ممتاز",
        date: "2026-11-24",
        strengths: "اعتماد دفتر التحضير الرسمي وفق نظام الأونروا والمنهاج الفلسطيني مع دمج الأنشطة التفاعلية والتعلم الذاتي SLM.",
        recommendations: "تعميم نموذج دفتر التحضير PDF العرضي والطولي ومشاركة أوراق العمل العلاجية مع معلمي المنطقة."
      }
    ];
  }

  function saveSupervisorReports(list) {
    writeJson(SUP_KEY, list);
    cloudSave("supervisor_reports_v279", { items: list.slice(0, 60), updatedAt: Date.now() });
  }

  function printSupervisorReport(r) {
    var w = window.open("", "_blank");
    if (!w) { toast("⚠️ يرجى السماح بالنوافذ المنبثقة للطباعة أو حفظ PDF", "error"); return; }
    w.document.write(
      '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تقرير إشرافي رسمي</title>' +
      '<style>@page{size:A4 portrait;margin:14mm;}body{font-family:Cairo,Tajawal,Tahoma,sans-serif;color:#0f172a;margin:0;padding:0;line-height:1.7;}' +
      '.hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #0369a1;padding-bottom:10px;margin-bottom:16px;}' +
      '.hdr h1{margin:0;font-size:19px;color:#0c4a6e;}.meta{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:13px;}' +
      '.meta td{border:1px solid #cbd5e1;padding:8px 10px;}.meta td.lbl{background:#f1f5f9;font-weight:800;width:18%;}' +
      '.box{border:1px solid #cbd5e1;border-radius:10px;padding:12px 14px;margin-bottom:14px;}.box h3{margin:0 0 6px;font-size:14px;color:#0369a1;}' +
      '.sigs{display:flex;justify-content:space-between;margin-top:34px;font-size:13px;font-weight:700;}.ft{margin-top:24px;border-top:1px solid #e2e8f0;padding-top:8px;font-size:11px;color:#64748b;text-align:center;}</style></head><body>' +
      '<div class="hdr"><div><h1>تقرير زيارة ومتابعة إشرافية تربوية</h1><div style="font-size:12px;color:#475569;">منصة EduTech Mindset — بوابة المشرفين التربويين (فلسطين / غزة)</div></div>' +
      '<div style="text-align:left;font-size:12px;font-weight:800;color:#0369a1;">التقييم: ' + esc(r.rating) + '<br>التاريخ: ' + esc(r.date) + '</div></div>' +
      '<table class="meta">' +
        '<tr><td class="lbl">المشرف التربوي</td><td>' + esc(r.supervisor) + '</td><td class="lbl">المنطقة التعليمية</td><td>' + esc(r.area) + '</td></tr>' +
        '<tr><td class="lbl">المدرسة / المؤسسة</td><td>' + esc(r.school) + '</td><td class="lbl">المبحث والصف</td><td>' + esc(r.subject) + '</td></tr>' +
        '<tr><td class="lbl">نوع الزيارة</td><td colspan="3">' + esc(r.visitType) + '</td></tr>' +
      '</table>' +
      '<div class="box"><h3>✅ أبرز نقاط القوة والملاحظات الإيجابية</h3><div>' + esc(r.strengths).replace(/\n/g, "<br>") + '</div></div>' +
      '<div class="box"><h3>🎯 التوصيات التربوية وخطة التطوير المقترحة</h3><div>' + esc(r.recommendations).replace(/\n/g, "<br>") + '</div></div>' +
      '<div class="sigs"><span>توقيع المشرف التربوي: …………………</span><span>توقيع المعلم/ة: …………………</span><span>اعتماد مدير المدرسة: …………………</span></div>' +
      '<div class="ft">صُدر عبر منصة EduTech Mindset — edutech-mindset.pages.dev — إشراف أ. باسل أشرف الفقعاوي</div>' +
      '<script>window.onload=function(){setTimeout(function(){window.print();},350);};<\/script></body></html>'
    );
    w.document.close();
  }

  function openSupervisors() {
    closeModalById("eduV279SupModal");
    var wrap = document.createElement("div");
    wrap.id = "eduV279SupModal";
    wrap.className = "edu-v279-modal";
    wrap.setAttribute("dir", "rtl");
    wrap.style.cssText = "position:fixed;inset:0;z-index:100020;background:rgba(2,6,23,0.84);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:12px;";
    wrap.innerHTML =
      '<div style="width:min(96vw,880px);max-height:92vh;background:#0f172a;color:#f8fafc;border:1.5px solid rgba(14,165,233,0.38);border-radius:24px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.6);">' +
        '<div style="padding:14px 18px;background:linear-gradient(135deg,#0369a1,#0f172a);display:flex;align-items:center;justify-content:space-between;gap:10px;flex-shrink:0;">' +
          '<div><strong style="font-size:15.5px;font-weight:900;">📋 بوابة المشرفين التربويين والتقارير الرسمية</strong><div style="font-size:11px;color:#bae6fd;">توثيق الزيارات الصفية وتصدير تقارير إشرافية معتمدة بصيغة PDF</div></div>' +
          '<button type="button" id="v279SupClose" style="padding:7px 14px;border-radius:12px;background:rgba(255,255,255,0.18);color:#fff;border:none;font-weight:900;font-size:12px;cursor:pointer;">✕ إغلاق</button>' +
        '</div>' +
        '<div style="display:flex;gap:8px;padding:10px 16px;background:rgba(255,255,255,0.03);border-bottom:1px solid rgba(148,163,184,0.16);flex-shrink:0;">' +
          '<button type="button" id="v279SupTabList" style="flex:1;padding:9px;border-radius:12px;background:#0284c7;color:#fff;border:none;font-size:12.5px;font-weight:900;cursor:pointer;">📑 التقارير المنشورة</button>' +
          '<button type="button" id="v279SupTabNew" style="flex:1;padding:9px;border-radius:12px;background:rgba(255,255,255,0.08);color:#cbd5e1;border:none;font-size:12.5px;font-weight:900;cursor:pointer;">✍️ نشر تقرير إشرافي جديد</button>' +
        '</div>' +
        '<div id="v279SupBody" style="flex:1;overflow-y:auto;padding:16px;"></div>' +
      '</div>';

    document.body.appendChild(wrap);
    lockBody(true);

    var body = document.getElementById("v279SupBody");
    var tList = document.getElementById("v279SupTabList");
    var tNew = document.getElementById("v279SupTabNew");

    function showList(filterArea) {
      tList.style.background = "#0284c7"; tList.style.color = "#fff";
      tNew.style.background = "rgba(255,255,255,0.08)"; tNew.style.color = "#cbd5e1";
      var reports = getSupervisorReports();
      var areaVal = filterArea || "الكل";
      var filtered = areaVal === "الكل" ? reports : reports.filter(function (x) { return x.area === areaVal; });
      var areas = ["الكل", "شمال غزة", "شرق غزة", "غرب غزة", "الوسطى", "خان يونس", "رفح", "الضفة والقدس", "عام"];
      body.innerHTML =
        '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;">' +
          areas.map(function (a) {
            var active = a === areaVal;
            return '<button type="button" data-sup-area="' + esc(a) + '" style="padding:5px 11px;border-radius:999px;background:' + (active ? "#0ea5e9" : "rgba(255,255,255,0.08)") + ';color:' + (active ? "#fff" : "#cbd5e1") + ';border:none;font-size:11px;font-weight:800;cursor:pointer;">' + esc(a) + '</button>';
          }).join("") +
        '</div>' +
        (filtered.length ? filtered.map(function (r) {
          return '<div style="padding:14px;border-radius:16px;background:rgba(255,255,255,0.05);border:1px solid rgba(148,163,184,0.2);margin-bottom:10px;">' +
            '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;margin-bottom:8px;">' +
              '<div><strong style="font-size:14px;color:#fff;">' + esc(r.school) + '</strong> <span style="font-size:11px;color:#7dd3fc;">• ' + esc(r.area) + '</span>' +
              '<div style="font-size:11.5px;color:#cbd5e1;margin-top:2px;">المشرف: <strong>' + esc(r.supervisor) + '</strong> | ' + esc(r.subject) + ' | ' + esc(r.visitType) + '</div></div>' +
              '<div style="display:flex;align-items:center;gap:6px;">' +
                '<span style="padding:3px 10px;border-radius:999px;background:rgba(16,185,129,0.2);color:#6ee7b7;font-size:11px;font-weight:900;">' + esc(r.rating) + '</span>' +
                '<span style="font-size:11px;color:#94a3b8;">' + esc(r.date) + '</span>' +
              '</div>' +
            '</div>' +
            '<div style="font-size:12px;color:#e2e8f0;margin-bottom:6px;"><strong style="color:#6ee7b7;">نقاط القوة:</strong> ' + esc(r.strengths) + '</div>' +
            '<div style="font-size:12px;color:#e2e8f0;margin-bottom:10px;"><strong style="color:#fde68a;">التوصيات:</strong> ' + esc(r.recommendations) + '</div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
              '<button type="button" data-sup-print="' + esc(r.id) + '" style="padding:7px 12px;border-radius:10px;background:#0284c7;color:#fff;border:none;font-size:11.5px;font-weight:900;cursor:pointer;">🖨️ طباعة / حفظ PDF رسمي</button>' +
              (isAdmin() ? '<button type="button" data-sup-del="' + esc(r.id) + '" style="padding:7px 12px;border-radius:10px;background:rgba(244,63,94,0.2);color:#fda4af;border:1px solid rgba(244,63,94,0.35);font-size:11.5px;font-weight:900;cursor:pointer;">🗑️ حذف</button>' : '') +
            '</div>' +
          '</div>';
        }).join("") : '<div style="text-align:center;padding:30px;color:#94a3b8;font-size:13px;">لا توجد تقارير في هذه المنطقة بعد — يمكنك نشر أول تقرير من التبويب الثاني.</div>');

      body.querySelectorAll("[data-sup-area]").forEach(function (b) {
        b.onclick = function () { showList(b.getAttribute("data-sup-area")); };
      });
      body.querySelectorAll("[data-sup-print]").forEach(function (b) {
        b.onclick = function () {
          var id = b.getAttribute("data-sup-print");
          var found = getSupervisorReports().find(function (x) { return x.id === id; });
          if (found) printSupervisorReport(found);
        };
      });
      body.querySelectorAll("[data-sup-del]").forEach(function (b) {
        b.onclick = function () {
          var id = b.getAttribute("data-sup-del");
          if (!confirm("حذف هذا التقرير؟")) return;
          saveSupervisorReports(getSupervisorReports().filter(function (x) { return x.id !== id; }));
          showList(areaVal);
          toast("🗑️ تم حذف التقرير", "info");
        };
      });
    }

    function showNewForm() {
      tNew.style.background = "#10b981"; tNew.style.color = "#fff";
      tList.style.background = "rgba(255,255,255,0.08)"; tList.style.color = "#cbd5e1";
      var today = new Date().toISOString().slice(0, 10);
      body.innerHTML =
        '<form id="v279SupForm" style="display:flex;flex-direction:column;gap:10px;">' +
          '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;">' +
            '<label style="font-size:11.5px;font-weight:800;color:#93c5fd;">اسم المشرف / المشرفة<input required id="supName" placeholder="مثال: أ. محمد ..." style="width:100%;margin-top:4px;padding:9px;border-radius:11px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12.5px;"></label>' +
            '<label style="font-size:11.5px;font-weight:800;color:#93c5fd;">المنطقة التعليمية<select id="supArea" style="width:100%;margin-top:4px;padding:9px;border-radius:11px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12.5px;"><option>خان يونس</option><option>شمال غزة</option><option>شرق غزة</option><option>غرب غزة</option><option>الوسطى</option><option>رفح</option><option>الضفة والقدس</option><option>عام</option></select></label>' +
            '<label style="font-size:11.5px;font-weight:800;color:#93c5fd;">المدرسة / المركز التعليمي<input required id="supSchool" placeholder="اسم المدرسة" style="width:100%;margin-top:4px;padding:9px;border-radius:11px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12.5px;"></label>' +
            '<label style="font-size:11.5px;font-weight:800;color:#93c5fd;">المبحث والصف<input required id="supSubject" placeholder="مثال: العلوم — الصف السادس" style="width:100%;margin-top:4px;padding:9px;border-radius:11px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12.5px;"></label>' +
            '<label style="font-size:11.5px;font-weight:800;color:#93c5fd;">نوع الزيارة<select id="supType" style="width:100%;margin-top:4px;padding:9px;border-radius:11px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12.5px;"><option>زيارة صفية إشرافية</option><option>متابعة دفتر التحضير</option><option>ورشة عمل وتدريب</option><option>متابعة التعلم الذاتي (SLM)</option><option>دعم نفسي وتوجيه</option></select></label>' +
            '<label style="font-size:11.5px;font-weight:800;color:#93c5fd;">التقييم العام<select id="supRating" style="width:100%;margin-top:4px;padding:9px;border-radius:11px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12.5px;"><option>ممتاز</option><option>جيد جداً</option><option>جيد</option><option>يحتاج متابعة ودعم</option></select></label>' +
          '</div>' +
          '<label style="font-size:11.5px;font-weight:800;color:#6ee7b7;">أبرز نقاط القوة والملاحظات الإيجابية<textarea required id="supStr" rows="3" placeholder="اكتب نقاط القوة..." style="width:100%;margin-top:4px;padding:9px;border-radius:11px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12.5px;"></textarea></label>' +
          '<label style="font-size:11.5px;font-weight:800;color:#fde68a;">التوصيات التربوية وخطة التطوير<textarea required id="supRec" rows="3" placeholder="اكتب التوصيات..." style="width:100%;margin-top:4px;padding:9px;border-radius:11px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12.5px;"></textarea></label>' +
          '<button type="submit" style="padding:11px;border-radius:13px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;font-size:13.5px;font-weight:900;cursor:pointer;">✅ حفظ ونشر التقرير الإشرافي</button>' +
        '</form>';
      document.getElementById("v279SupForm").onsubmit = function (e) {
        e.preventDefault();
        var item = {
          id: "rep_" + Date.now(),
          supervisor: document.getElementById("supName").value.trim(),
          area: document.getElementById("supArea").value,
          school: document.getElementById("supSchool").value.trim(),
          subject: document.getElementById("supSubject").value.trim(),
          visitType: document.getElementById("supType").value,
          rating: document.getElementById("supRating").value,
          date: today,
          strengths: document.getElementById("supStr").value.trim(),
          recommendations: document.getElementById("supRec").value.trim()
        };
        var arr = getSupervisorReports();
        arr.unshift(item);
        saveSupervisorReports(arr);
        playUiBeep(760);
        toast("✅ تم نشر التقرير الإشرافي وحفظه سحابياً ✓", "success");
        showList("الكل");
      };
    }

    tList.onclick = function () { showList("الكل"); };
    tNew.onclick = showNewForm;
    document.getElementById("v279SupClose").onclick = function () { closeModalById("eduV279SupModal"); };
    wrap.onclick = function (e) { if (e.target === wrap) closeModalById("eduV279SupModal"); };
    showList("الكل");
  }

  /* ==========================================================================
   * 5) سجل «ما الجديد في المنصة» (What's New)
   * ========================================================================== */
  var DEFAULT_RELEASES = [
    {
      ver: "v279",
      date: "نوفمبر 2026",
      badge: "الأحدث",
      title: "حزمة الإدارة والمشرفين وتطبيق الأندرويد المباشر",
      points: [
        "تفعيل التحميل المباشر لتطبيق الأندرويد (APK) من داخل نافذة التثبيت بضغطة واحدة.",
        "مولّد بوسترات الإعلانات الفوري بدقة عالية (PNG) جاهز للواتساب وفيسبوك.",
        "بوابة المشرفين التربويين لتوثيق الزيارات الصفية وتصدير تقارير PDF رسمية.",
        "وضع التحرير المباشر للنصوص على الصفحة للإدارة مع مزامنة سحابية فورية.",
        "ترقية قراءة الشريط العاجل بالصوت العربي العصبي + أداة تكبير الخط المرن (100%–125%)."
      ]
    },
    {
      ver: "v278",
      date: "نوفمبر 2026",
      badge: "تحضير الأونروا",
      title: "دفتر التحضير الرسمي لنظام معلمي الأونروا والمنهاج الفلسطيني",
      points: [
        "اختيار متدرج للمرحلة والصف (من الأول حتى التوجيهي بفروعه) وجميع المباحث الفلسطينية الرسمية.",
        "تصدير دفتر التحضير الرسمي بصيغة PDF عرضي أو طولي باستغلال كامل لمساحة صفحة A4.",
        "دعم بيئة الصف (اعتيادي / خيمة تعليمية / بطاقات التعلم الذاتي SLM)."
      ]
    },
    {
      ver: "v274",
      date: "نوفمبر 2026",
      badge: "للمعلمين والطلاب",
      title: "غرفة عمليات المعلم الموحّدة + NotebookLM + نطق الرياضيات",
      points: [
        "غرفة عمليات المعلم: تحليل المحتوى، الخطط العلاجية والفصلية، بنك الأسئلة أوفلاين، والإذاعة المدرسية.",
        "استوديو المذاكرة التفاعلي (NotebookLM) وحلال مسائل STEM خطوة بخطوة مع نطق عربي فصيح للمعادلات."
      ]
    }
  ];

  function openWhatsNew() {
    closeModalById("eduV279WnModal");
    var custom = readJson(WN_KEY, []);
    var wrap = document.createElement("div");
    wrap.id = "eduV279WnModal";
    wrap.className = "edu-v279-modal";
    wrap.setAttribute("dir", "rtl");
    wrap.style.cssText = "position:fixed;inset:0;z-index:100020;background:rgba(2,6,23,0.84);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:12px;";

    function renderInner() {
      var customHtml = (Array.isArray(custom) && custom.length) ? custom.map(function (c, idx) {
        return '<div style="padding:12px 14px;border-radius:15px;background:rgba(245,158,11,0.12);border:1px solid rgba(251,191,36,0.35);margin-bottom:10px;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;"><strong style="color:#fde68a;font-size:13.5px;">📌 ' + esc(c.title) + '</strong>' +
          (isAdmin() ? '<button type="button" data-wn-del="' + idx + '" style="background:none;border:none;color:#fda4af;cursor:pointer;font-size:12px;">🗑️</button>' : '') +
          '</div><div style="font-size:12px;color:#e2e8f0;margin-top:4px;line-height:1.6;">' + esc(c.body) + '</div></div>';
      }).join("") : "";

      var relHtml = DEFAULT_RELEASES.map(function (r) {
        return '<div style="padding:14px;border-radius:16px;background:rgba(255,255,255,0.05);border:1px solid rgba(148,163,184,0.2);margin-bottom:10px;">' +
          '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;">' +
            '<span style="padding:2px 10px;border-radius:999px;background:#0ea5e9;color:#fff;font-size:11px;font-weight:900;">' + esc(r.ver) + '</span>' +
            '<span style="padding:2px 9px;border-radius:999px;background:rgba(16,185,129,0.2);color:#6ee7b7;font-size:10.5px;font-weight:800;">' + esc(r.badge) + '</span>' +
            '<span style="font-size:11px;color:#94a3b8;margin-right:auto;">' + esc(r.date) + '</span>' +
          '</div>' +
          '<div style="font-size:13.5px;font-weight:900;color:#fff;margin-bottom:6px;">' + esc(r.title) + '</div>' +
          '<ul style="margin:0;padding-right:18px;font-size:12px;color:#cbd5e1;line-height:1.7;">' +
            r.points.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join("") +
          '</ul>' +
        '</div>';
      }).join("");

      var adminAdd = isAdmin() ? (
        '<div style="padding:12px;border-radius:15px;background:rgba(255,255,255,0.04);border:1px dashed rgba(251,191,36,0.4);margin-bottom:12px;">' +
          '<div style="font-size:12px;font-weight:900;color:#fde68a;margin-bottom:6px;">👑 إضافة إعلان جديد في «ما الجديد»</div>' +
          '<input id="wnNewTitle" placeholder="عنوان التحديث أو الإعلان" style="width:100%;padding:8px;border-radius:10px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12px;margin-bottom:6px;">' +
          '<textarea id="wnNewBody" rows="2" placeholder="تفاصيل التحديث..." style="width:100%;padding:8px;border-radius:10px;background:#1e293b;color:#fff;border:1px solid #334155;font-size:12px;margin-bottom:6px;"></textarea>' +
          '<button type="button" id="wnNewSave" style="padding:7px 14px;border-radius:10px;background:#f59e0b;color:#020617;border:none;font-size:12px;font-weight:900;cursor:pointer;">➕ نشر في ما الجديد</button>' +
        '</div>'
      ) : "";

      wrap.innerHTML =
        '<div style="width:min(95vw,680px);max-height:90vh;background:#0f172a;color:#f8fafc;border:1.5px solid rgba(56,189,248,0.35);border-radius:24px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.6);">' +
          '<div style="padding:14px 18px;background:linear-gradient(135deg,#0c4a6e,#1e1b4b);display:flex;align-items:center;justify-content:space-between;gap:10px;flex-shrink:0;">' +
            '<div><strong style="font-size:15.5px;font-weight:900;">✨ ما الجديد في EduTech Mindset</strong><div style="font-size:11px;color:#bae6fd;">سجل التطويرات الرسمية وآخر الإضافات في المنصة</div></div>' +
            '<button type="button" id="v279WnClose" style="padding:7px 14px;border-radius:12px;background:rgba(255,255,255,0.18);color:#fff;border:none;font-weight:900;font-size:12px;cursor:pointer;">✕ إغلاق</button>' +
          '</div>' +
          '<div style="flex:1;overflow-y:auto;padding:16px;">' + adminAdd + customHtml + relHtml + '</div>' +
        '</div>';

      document.getElementById("v279WnClose").onclick = function () { closeModalById("eduV279WnModal"); };
      var saveBtn = document.getElementById("wnNewSave");
      if (saveBtn) {
        saveBtn.onclick = function () {
          var t = (document.getElementById("wnNewTitle").value || "").trim();
          var b = (document.getElementById("wnNewBody").value || "").trim();
          if (!t || !b) { toast("⚠️ أدخل العنوان والتفاصيل", "error"); return; }
          custom.unshift({ title: t, body: b, at: Date.now() });
          writeJson(WN_KEY, custom);
          cloudSave("whats_new_v279", { items: custom.slice(0, 20), updatedAt: Date.now() });
          toast("✅ تم النشر في «ما الجديد» ✓", "success");
          renderInner();
        };
      }
      wrap.querySelectorAll("[data-wn-del]").forEach(function (b) {
        b.onclick = function () {
          custom.splice(Number(b.getAttribute("data-wn-del")), 1);
          writeJson(WN_KEY, custom);
          cloudSave("whats_new_v279", { items: custom, updatedAt: Date.now() });
          renderInner();
        };
      });
    }

    document.body.appendChild(wrap);
    lockBody(true);
    wrap.onclick = function (e) { if (e.target === wrap) closeModalById("eduV279WnModal"); };
    renderInner();
  }

  /* ==========================================================================
   * التشغيل التلقائي والمزامنة السحابية الخفيفة
   * ========================================================================== */
  function boot() {
    setFontScale(getFontScale());
    applyAutoAriaLabels();
    applySavedLiveEdits(readJson(LIVE_KEY, {}));

    // مزامنة صامتة من السحابة بعد الإقلاع
    setTimeout(function () {
      cloudRead("live_edits_v279", function (d) {
        if (d && d.edits) { writeJson(LIVE_KEY, d.edits); applySavedLiveEdits(d.edits); }
      });
      cloudRead("supervisor_reports_v279", function (d) {
        if (d && Array.isArray(d.items) && d.items.length) writeJson(SUP_KEY, d.items);
      });
      cloudRead("whats_new_v279", function (d) {
        if (d && Array.isArray(d.items)) writeJson(WN_KEY, d.items);
      });
    }, 1800);

    // مؤثر نقر خفيف اختياري عند تفعيل المستخدم له
    document.addEventListener("click", function (ev) {
      if (!isUiSoundOn()) return;
      if (ev.target && ev.target.closest && ev.target.closest("button, a")) playUiBeep(520);
    }, true);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  global.EduV279 = {
    version: "v279",
    toggleLiveEdit: toggleLiveEdit,
    openPoster: openPoster,
    openSupervisors: openSupervisors,
    openWhatsNew: openWhatsNew,
    setFontScale: setFontScale,
    getFontScale: getFontScale,
    toggleUiSound: toggleUiSound,
    isUiSoundOn: isUiSoundOn
  };
})(window);
