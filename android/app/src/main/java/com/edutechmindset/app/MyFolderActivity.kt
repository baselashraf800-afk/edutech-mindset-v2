package com.edutechmindset.app

import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.provider.OpenableColumns
import android.view.Gravity
import android.view.ViewGroup
import android.widget.*
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import java.io.File
import java.util.concurrent.Executors

class MyFolderActivity : AppCompatActivity() {

    private lateinit var db: EduTechDatabaseHelper
    private lateinit var listContainer: LinearLayout
    private val ioExecutor = Executors.newSingleThreadExecutor()
    private var currentFilter = "ALL"

    private val importAnyFileLauncher = registerForActivityResult(ActivityResultContracts.OpenDocument()) { uri: Uri? ->
        if (uri != null) importFileFromDevice(uri)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        db = EduTechDatabaseHelper(this)

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#0B1120"))
            setPadding(20, 20, 20, 20)
        }

        // Top Bar
        val top = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(0, 0, 0, 16)
            addView(makeBtn("✕ إغلاق", "#334155") { finish() })
            addView(TextView(this@MyFolderActivity).apply {
                text = "  📁 مجلدي وملفاتي (EduTech)"
                setTextColor(Color.WHITE)
                textSize = 18f
                typeface = Typeface.DEFAULT_BOLD
            })
        }
        root.addView(top)

        // 4 Quick Portals (2x2 Grid)
        val row1 = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(0, 0, 0, 10)
            addView(makePortal("📚 كتبي (Moon+)", "#4F46E5") {
                startActivity(Intent(this@MyFolderActivity, MoonBookReaderActivity::class.java))
            })
            addView(makePortal("✏️ السبورة الذكية", "#0284C7") {
                startActivity(Intent(this@MyFolderActivity, SmartWhiteboardActivity::class.java))
            })
        }
        val row2 = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(0, 0, 0, 14)
            addView(makePortal("🎬 وسائطي", "#0D9488") {
                currentFilter = "Video"
                refreshListAsync()
            })
            addView(makePortal("📂 استيراد ملف", "#D97706") {
                importAnyFileLauncher.launch(arrayOf("application/pdf", "application/msword", "audio/*", "video/*", "image/*"))
            })
        }
        root.addView(row1)
        root.addView(row2)

        // Category filter chips
        val filterScroll = HorizontalScrollView(this).apply { isHorizontalScrollBarEnabled = false }
        val filterRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(0, 0, 0, 12)
            listOf("ALL" to "الكل", "PDF" to "📄 PDF", "Word" to "📘 Word", "Audio" to "🎵 صوتيات", "Video" to "🎬 فيديو", "Images" to "🖼 صور").forEach { (k, label) ->
                addView(makeBtn(label, "#1E293B") { currentFilter = k; refreshListAsync() })
            }
        }
        filterScroll.addView(filterRow)
        root.addView(filterScroll)

        val scroll = ScrollView(this).apply {
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f)
        }
        listContainer = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        scroll.addView(listContainer)
        root.addView(scroll)

        setContentView(root)
        refreshListAsync()
    }

    private fun importFileFromDevice(uri: Uri) {
        Toast.makeText(this, "⏳ جارٍ استيراد الملف...", Toast.LENGTH_SHORT).show()
        ioExecutor.execute {
            try {
                var name = "EduTech_${System.currentTimeMillis()}"
                contentResolver.query(uri, null, null, null, null)?.use { c ->
                    val idx = c.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                    if (idx >= 0 && c.moveToFirst()) name = c.getString(idx) ?: name
                }
                val mime = contentResolver.getType(uri) ?: "*/*"
                val bytes = contentResolver.openInputStream(uri)?.use { it.readBytes() } ?: return@execute
                val res = EduFileSaver.saveBytes(this, bytes, name, mime)
                runOnUiThread {
                    if (res.ok) {
                        Toast.makeText(this, "✅ تم حفظ الملف في مجلدي: ${res.displayName}", Toast.LENGTH_SHORT).show()
                        refreshListAsync()
                    } else {
                        Toast.makeText(this, "❌ فشل الاستيراد: ${res.error}", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                runOnUiThread { Toast.makeText(this, "❌ خطأ: ${e.message}", Toast.LENGTH_SHORT).show() }
            }
        }
    }

    private fun refreshListAsync() {
        listContainer.removeAllViews()
        listContainer.addView(ProgressBar(this).apply {
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply {
                gravity = Gravity.CENTER_HORIZONTAL
                setMargins(0, 48, 0, 0)
            }
        })

        val filter = currentFilter
        ioExecutor.execute {
            val filesMap = linkedMapOf<String, SavedFileRecord>()
            try {
                db.listSavedFiles(filter).forEach { rec ->
                    if (File(rec.path).exists()) filesMap[rec.path] = rec
                }
                val base = File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "EduTech_Mindset")
                if (base.exists()) {
                    base.walkTopDown().maxDepth(3).filter { it.isFile }.forEach { f ->
                        if (!filesMap.containsKey(f.absolutePath)) {
                            val cat = EduFileSaver.detectSubfolder(f.name, "")
                            if (filter == "ALL" || filter == cat) {
                                val mime = when (cat) {
                                    "PDF" -> "application/pdf"
                                    "Word" -> "application/msword"
                                    "Audio" -> "audio/mpeg"
                                    "Video" -> "video/mp4"
                                    "Images" -> "image/png"
                                    else -> "*/*"
                                }
                                filesMap[f.absolutePath] = SavedFileRecord(0, f.name, f.absolutePath, cat, mime, f.length(), f.lastModified())
                            }
                        }
                    }
                }
            } catch (_: Exception) {}

            val sorted = filesMap.values.sortedByDescending { it.createdAt }
            runOnUiThread { renderFiles(sorted) }
        }
    }

    private fun renderFiles(files: List<SavedFileRecord>) {
        listContainer.removeAllViews()
        if (files.isEmpty()) {
            listContainer.addView(TextView(this).apply {
                text = "لا توجد ملفات محفوظة في هذا القسم بعد.\nكل ملف PDF أو Word أو صوت أو فيديو تحفظه من المنصة أو تستورده سيظهر هنا تلقائياً."
                setTextColor(Color.parseColor("#94A3B8"))
                textSize = 14f
                setPadding(16, 40, 16, 16)
            })
            return
        }

        files.forEach { rec ->
            val card = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                setPadding(20, 16, 20, 16)
                background = GradientDrawable().apply {
                    setColor(Color.parseColor("#1E293B"))
                    cornerRadius = 22f
                    setStroke(1, Color.parseColor("#334155"))
                }
                layoutParams = LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                ).apply { setMargins(0, 0, 0, 12) }
            }
            card.addView(TextView(this).apply {
                text = rec.title
                setTextColor(Color.WHITE)
                textSize = 14f
                typeface = Typeface.DEFAULT_BOLD
            })
            card.addView(TextView(this).apply {
                text = "القسم: ${rec.category} • ${(rec.sizeBytes / 1024).coerceAtLeast(1)} KB"
                setTextColor(Color.parseColor("#94A3B8"))
                textSize = 12f
                setPadding(0, 4, 0, 10)
            })
            val actions = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                addView(makeBtn("📂 فتح", "#0284C7") { EduFileSaver.openFile(this@MyFolderActivity, rec.path, rec.mimeType) })
                addView(makeBtn("📲 مشاركة", "#059669") { EduFileSaver.shareFile(this@MyFolderActivity, rec.path, rec.mimeType) })
                addView(makeBtn("🗑 حذف", "#991B1B") {
                    File(rec.path).delete()
                    db.deleteSavedFileRecord(rec.path)
                    refreshListAsync()
                })
            }
            card.addView(actions)
            listContainer.addView(card)
        }
    }

    private fun makePortal(label: String, bgHex: String, onClick: () -> Unit): Button {
        return Button(this).apply {
            text = label
            setTextColor(Color.WHITE)
            textSize = 13f
            isAllCaps = false
            background = GradientDrawable().apply { setColor(Color.parseColor(bgHex)); cornerRadius = 24f }
            layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f).apply {
                setMargins(6, 0, 6, 0)
            }
            setOnClickListener { onClick() }
        }
    }

    private fun makeBtn(label: String, bgHex: String, onClick: () -> Unit): Button {
        return Button(this).apply {
            text = label
            setTextColor(Color.WHITE)
            textSize = 12f
            isAllCaps = false
            background = GradientDrawable().apply { setColor(Color.parseColor(bgHex)); cornerRadius = 20f }
            setPadding(18, 8, 18, 8)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { setMargins(6, 2, 6, 2) }
            setOnClickListener { onClick() }
        }
    }

    override fun onDestroy() {
        ioExecutor.shutdownNow()
        super.onDestroy()
    }
}
