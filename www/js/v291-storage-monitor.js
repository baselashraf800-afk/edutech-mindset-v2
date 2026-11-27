/* ============================================================================
 * EduTech Mindset — v291 Admin Cloud Storage Monitor (Cloudflare R2 & KV)
 * مراقب التخزين السحابي الحقيقي للإدارة العليا (المستخدم + المتوفر + تنظيف كاش الصوت)
 * ============================================================================ */
(function (global) {
  "use strict";

  function fmtBytes(b) {
    var n = Number(b) || 0;
    if (n >= 1024 * 1024 * 1024) return (n / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    if (n >= 1024 * 1024) return (n / (1024 * 1024)).toFixed(2) + " MB";
    if (n >= 1024) return (n / 1024).toFixed(1) + " KB";
    return n + " B";
  }

  function toast(msg, type) {
    if (typeof global.showToast === "function") { try { global.showToast(msg, type || "info"); return; } catch (_) {} }
    alert(msg);
  }

  function getToken() {
    var u = (global.Cloud && global.Cloud.user) || null;
    if (!u && global.firebase && typeof global.firebase.auth === "function") {
      try { u = global.firebase.auth().currentUser; } catch (_) {}
    }
    return (u && u.getIdToken) ? u.getIdToken().catch(function () { return ""; }) : Promise.resolve("");
  }

  function openStorageMonitor() {
    var old = document.getElementById("v291StorageModal");
    if (old) old.remove();

    var m = document.createElement("div");
    m.id = "v291StorageModal";
    m.style.cssText = "position:fixed;inset:0;z-index:2147483290;background:rgba(2,6,23,0.84);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:12px;direction:rtl;";
    m.innerHTML =
      '<div style="width:min(96vw,640px);max-height:90vh;overflow-y:auto;border-radius:24px;background:linear-gradient(155deg,#020617,#0f172a,#1e1b4b);color:#fff;border:1.5px solid rgba(56,189,248,0.5);padding:18px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
          '<div><div style="font-size:15.5px;font-weight:900;color:#7dd3fc;">☁️ مراقب التخزين السحابي الحقيقي (Cloudflare R2 & KV)</div><div style="font-size:11px;color:#94a3b8;">بيانات حية من خادمك السحابي — خاص بالإدارة العليا</div></div>' +
          '<button type="button" id="v291StClose" style="width:30px;height:30px;border-radius:10px;background:rgba(244,63,94,0.22);color:#fda4af;border:1px solid rgba(244,63,94,0.4);font-weight:900;cursor:pointer;">✕</button>' +
        '</div>' +
        '<div id="v291StBody" style="padding:24px;text-align:center;color:#94a3b8;">⏳ جارٍ فحص المساحة المستخدمة والمتوفرة في Cloudflare R2 و KV…</div>' +
      '</div>';
    document.body.appendChild(m);
    document.getElementById("v291StClose").onclick = function () { m.remove(); };
    m.addEventListener("click", function (ev) { if (ev.target === m) m.remove(); });

    function loadStats() {
      getToken().then(function (tok) {
        return fetch("/api/storage-stats", { headers: { "Authorization": "Bearer " + tok } }).then(function (r) { return r.json(); });
      }).then(function (d) {
        var b = document.getElementById("v291StBody");
        if (!b) return;
        if (!d || !d.ok) {
          b.innerHTML = '<div style="color:#fda4af;font-weight:800;">' + ((d && d.error) || "تعذّر جلب بيانات التخزين") + '</div>';
          return;
        }
        var r2 = d.r2 || {};
        var kv = d.kv || {};
        var cats = r2.categories || {};
        var pct = Math.min(100, Math.max(0.5, Number(r2.usedPct) || 0));

        b.style.textAlign = "right";
        b.style.padding = "0";
        b.innerHTML =
          '<div style="padding:14px;border-radius:16px;background:rgba(14,165,233,0.12);border:1px solid rgba(56,189,248,0.35);margin-bottom:12px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;flex-wrap:wrap;gap:6px;">' +
              '<strong style="font-size:13.5px;color:#fff;">📦 تخزين الملفات والوسائط (Cloudflare R2)</strong>' +
              '<span style="font-size:12px;font-weight:900;color:#6ee7b7;">' + fmtBytes(r2.availableBytes) + ' متوفرة من 10 GB</span>' +
            '</div>' +
            '<div style="height:10px;border-radius:999px;background:rgba(255,255,255,0.12);overflow:hidden;margin-bottom:8px;">' +
              '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,#10b981,#38bdf8,#f59e0b);border-radius:999px;"></div>' +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;font-size:11.5px;color:#cbd5e1;margin-bottom:10px;">' +
              '<span>المستخدم فعلياً: <strong style="color:#fde68a;">' + fmtBytes(r2.totalBytes) + '</strong> (' + (r2.usedPct || 0) + '%)</span>' +
              '<span>إجمالي الملفات: <strong>' + (r2.totalFiles || 0) + '</strong></span>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:7px;font-size:11px;margin-bottom:10px;">' +
              '<div style="padding:8px;border-radius:10px;background:rgba(2,6,23,0.55);">🔊 كاش الصوتيات<br><strong>' + fmtBytes((cats.ttsCache && cats.ttsCache.bytes) || 0) + '</strong> (' + ((cats.ttsCache && cats.ttsCache.count) || 0) + ')</div>' +
              '<div style="padding:8px;border-radius:10px;background:rgba(2,6,23,0.55);">📚 كتب وملفات PDF<br><strong>' + fmtBytes((cats.docs && cats.docs.bytes) || 0) + '</strong> (' + ((cats.docs && cats.docs.count) || 0) + ')</div>' +
              '<div style="padding:8px;border-radius:10px;background:rgba(2,6,23,0.55);">🎬 صور وفيديو وصوت<br><strong>' + fmtBytes((cats.media && cats.media.bytes) || 0) + '</strong> (' + ((cats.media && cats.media.count) || 0) + ')</div>' +
              '<div style="padding:8px;border-radius:10px;background:rgba(2,6,23,0.55);">📁 ملفات أخرى<br><strong>' + fmtBytes((cats.other && cats.other.bytes) || 0) + '</strong> (' + ((cats.other && cats.other.count) || 0) + ')</div>' +
            '</div>' +
            '<button type="button" id="v291CleanTtsBtn" style="padding:8px 14px;border-radius:10px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#020617;border:none;font-size:11.5px;font-weight:900;cursor:pointer;">🧹 تنظيف كاش الصوتيات المؤقت لتوفير المساحة</button>' +
          '</div>' +
          '<div style="padding:14px;border-radius:16px;background:rgba(16,185,129,0.12);border:1px solid rgba(52,211,153,0.35);">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
              '<strong style="font-size:13.5px;color:#fff;">⚡ قاعدة البيانات السريعة (Cloudflare KV — حد 1 GB مجاناً)</strong>' +
              '<span style="font-size:12px;font-weight:900;color:#6ee7b7;">' + (kv.totalKeys || 0) + ' سجل</span>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:7px;font-size:11px;">' +
              '<div style="padding:8px;border-radius:10px;background:rgba(2,6,23,0.55);">🔑 المفاتيح: <strong>' + ((kv.groups && kv.groups.keys) || 0) + '</strong></div>' +
              '<div style="padding:8px;border-radius:10px;background:rgba(2,6,23,0.55);">💳 الاشتراكات والأعضاء: <strong>' + ((kv.groups && kv.groups.subsAndProfiles) || 0) + '</strong></div>' +
              '<div style="padding:8px;border-radius:10px;background:rgba(2,6,23,0.55);">📡 المراقبة والحدود: <strong>' + ((kv.groups && kv.groups.presenceAndLogs) || 0) + '</strong></div>' +
              '<div style="padding:8px;border-radius:10px;background:rgba(2,6,23,0.55);">🤖 كاش الذكاء: <strong>' + ((kv.groups && kv.groups.aiCache) || 0) + '</strong></div>' +
            '</div>' +
          '</div>';

        var cb = document.getElementById("v291CleanTtsBtn");
        if (cb) cb.onclick = function () {
          cb.disabled = true; cb.textContent = "⏳ جارٍ التنظيف…";
          getToken().then(function (tok) {
            return fetch("/api/storage-stats", {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tok },
              body: JSON.stringify({ idToken: tok, action: "clean_tts_cache" })
            }).then(function (r) { return r.json(); });
          }).then(function (res) {
            if (res && res.ok) {
              toast("🧹 تم حذف " + res.deleted + " ملف كاش وتوفير " + fmtBytes(res.freedBytes) + " ✓", "success");
              loadStats();
            } else { toast("❌ فشل التنظيف", "error"); cb.disabled = false; }
          });
        };
      }).catch(function () {
        var b = document.getElementById("v291StBody");
        if (b) b.textContent = "❌ تعذّر الاتصال بالسحابة";
      });
    }

    loadStats();
  }

  global.EduV291Storage = { open: openStorageMonitor };
})(window);
