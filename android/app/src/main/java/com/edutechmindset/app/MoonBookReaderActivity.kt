package com.edutechmindset.app

import android.graphics.*
import android.graphics.drawable.GradientDrawable
import android.graphics.pdf.PdfRenderer
import android.os.Bundle
import android.os.Environment
import android.os.ParcelFileDescriptor
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import java.io.File

class MoonBookReaderActivity : AppCompatActivity() {

    enum class ThemeMode { DAY, SEPIA, NIGHT, AMOLED }

    private lateinit var db: EduTechDatabaseHelper
    private lateinit var rootLayout: LinearLayout
    private lateinit var contentContainer: FrameLayout
    private var renderer: PdfRenderer? = null
    private var pfd: ParcelFileDescriptor? = null
    private var currentPath: String = ""
    private var currentPage = 0
    private var themeMode = ThemeMode.DAY
    private var zoomScale = 1.0f

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        db = EduTechDatabaseHelper(this)

        rootLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#0F172A"))
        }
        contentContainer = FrameLayout(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                0,
                1f
            )
        }
        rootLayout.addView(contentContainer)
        setContentView(rootLayout)

        val initialPdf = intent.getStringExtra("PDF_PATH")
        if (!initialPdf.isNullOrBlank() && File(initialPdf).exists()) {
            openBook(initialPdf)
        } else {
            showBookshelf()
        }
    }

    private fun scanPdfFiles(): List<File> {
        val found = linkedMapOf<String, File>()
        val dirs = listOfNotNull(
            File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "EduTech_Mindset"),
            getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS),
            Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
        )
        fun walk(d: File, depth: Int) {
            if (depth > 3 || !d.exists() || !d.isDirectory) return
            d.listFiles()?.forEach { f ->
                if (f.isFile && f.name.lowercase().endsWith(".pdf")) {
                    found[f.absolutePath] = f
                } else if (f.isDirectory && !f.name.startsWith(".")) {
                    walk(f, depth + 1)
                }
            }
        }
        dirs.forEach { walk(it, 0) }
        return found.values.sortedByDescending { it.lastModified() }.take(80)
    }

    private fun showBookshelf() {
        closePdf()
        contentContainer.removeAllViews()
        val scroll = ScrollView(this).apply { setBackgroundColor(Color.parseColor("#0F172A")) }
        val col = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(24, 24, 24, 36)
        }

        val header = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(0, 0, 0, 20)
            addView(Button(this@MoonBookReaderActivity).apply {
                text = "✕ إغلاق"
                setTextColor(Color.WHITE)
                background = GradientDrawable().apply { setColor(Color.parseColor("#334155")); cornerRadius = 24f }
                setOnClickListener { finish() }
            })
            addView(TextView(this@MoonBookReaderActivity).apply {
                text = "  📚 مكتبة الكتب (Moon Reader)"
                setTextColor(Color.WHITE)
                textSize = 18f
                typeface = Typeface.DEFAULT_BOLD
            })
        }
        col.addView(header)

        val progressMap = db.getAllBookProgress()
        val pdfs = scanPdfFiles()
        if (pdfs.isEmpty()) {
            col.addView(TextView(this).apply {
                text = "لا توجد كتب PDF محفوظة بعد في مجلد التطبيق أو التنزيلات.\nأي ملف PDF تحفظه من المنصة أو تشاركه من واتساب سيظهر هنا تلقائياً."
                setTextColor(Color.parseColor("#CBD5E1"))
                textSize = 14f
                setPadding(16, 48, 16, 16)
            })
        } else {
            pdfs.forEach { file ->
                val prog = progressMap[file.absolutePath]
                val pct = if (prog != null && prog.totalPages > 0) ((prog.currentPage + 1) * 100 / prog.totalPages) else 0
                val card = LinearLayout(this).apply {
                    orientation = LinearLayout.VERTICAL
                    setPadding(24, 20, 24, 20)
                    background = GradientDrawable().apply {
                        setColor(Color.parseColor("#1E293B"))
                        cornerRadius = 26f
                        setStroke(2, Color.parseColor("#38BDF8"))
                    }
                    layoutParams = LinearLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.WRAP_CONTENT
                    ).apply { setMargins(0, 0, 0, 16) }
                    setOnClickListener { openBook(file.absolutePath) }
                }
                card.addView(TextView(this).apply {
                    text = "📖 ${file.name}"
                    setTextColor(Color.WHITE)
                    textSize = 15f
                    typeface = Typeface.DEFAULT_BOLD
                })
                card.addView(TextView(this).apply {
                    text = "التقدّم: $pct% • الحجم: ${file.length() / 1024} KB"
                    setTextColor(Color.parseColor("#94A3B8"))
                    textSize = 12f
                    setPadding(0, 8, 0, 0)
                })
                col.addView(card)
            }
        }
        scroll.addView(col)
        contentContainer.addView(scroll)
    }

    private fun openBook(path: String) {
        closePdf()
        try {
            val f = File(path)
            pfd = ParcelFileDescriptor.open(f, ParcelFileDescriptor.MODE_READ_ONLY)
            renderer = PdfRenderer(pfd!!)
            currentPath = path
            val saved = db.getBookProgress(path)
            currentPage = (saved?.currentPage ?: 0).coerceIn(0, (renderer!!.pageCount - 1).coerceAtLeast(0))
            renderReaderUi()
        } catch (e: Exception) {
            Toast.makeText(this, "تعذر فتح الكتاب: ${e.message}", Toast.LENGTH_SHORT).show()
            showBookshelf()
        }
    }

    private fun renderReaderUi() {
        val r = renderer ?: return
        contentContainer.removeAllViews()
        val bg = when (themeMode) {
            ThemeMode.DAY -> Color.parseColor("#F8FAFC")
            ThemeMode.SEPIA -> Color.parseColor("#F4ECD8")
            ThemeMode.NIGHT -> Color.parseColor("#1E293B")
            ThemeMode.AMOLED -> Color.BLACK
        }
        val wrap = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(bg)
        }

        // Top reader controls
        val top = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setBackgroundColor(Color.parseColor("#E60F172A"))
            setPadding(12, 10, 12, 10)
            addView(smallBtn("📚 الرف") { showBookshelf() })
            addView(smallBtn("☀") { themeMode = ThemeMode.DAY; renderReaderUi() })
            addView(smallBtn("📜") { themeMode = ThemeMode.SEPIA; renderReaderUi() })
            addView(smallBtn("🌙") { themeMode = ThemeMode.NIGHT; renderReaderUi() })
            addView(smallBtn("⬛") { themeMode = ThemeMode.AMOLED; renderReaderUi() })
            addView(smallBtn("A+") { zoomScale = (zoomScale + 0.25f).coerceAtMost(2.5f); renderReaderUi() })
            addView(smallBtn("A-") { zoomScale = (zoomScale - 0.25f).coerceAtLeast(0.8f); renderReaderUi() })
        }
        wrap.addView(top)

        val imgScroll = ScrollView(this).apply {
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f)
        }
        val imgView = ImageView(this).apply {
            adjustViewBounds = true
            scaleType = ImageView.ScaleType.FIT_CENTER
        }
        val page = r.openPage(currentPage)
        val bmpW = (page.width * 2 * zoomScale).toInt().coerceIn(600, 2400)
        val bmpH = (page.height * 2 * zoomScale).toInt().coerceIn(800, 3400)
        val bmp = Bitmap.createBitmap(bmpW, bmpH, Bitmap.Config.ARGB_8888)
        bmp.eraseColor(if (themeMode == ThemeMode.SEPIA) Color.parseColor("#F4ECD8") else Color.WHITE)
        page.render(bmp, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
        page.close()

        if (themeMode == ThemeMode.NIGHT || themeMode == ThemeMode.AMOLED) {
            val inv = ColorMatrix(floatArrayOf(
                -1f, 0f, 0f, 0f, 255f,
                0f, -1f, 0f, 0f, 255f,
                0f, 0f, -1f, 0f, 255f,
                0f, 0f, 0f, 1f, 0f
            ))
            imgView.colorFilter = ColorMatrixColorFilter(inv)
        }
        imgView.setImageBitmap(bmp)
        imgScroll.addView(imgView)
        wrap.addView(imgScroll)

        db.saveBookProgress(currentPath, File(currentPath).name, currentPage, r.pageCount)

        // Bottom navigation bar
        val bottom = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setBackgroundColor(Color.parseColor("#E60F172A"))
            setPadding(16, 12, 16, 12)
            addView(smallBtn("◀ السابق") {
                if (currentPage > 0) { currentPage--; renderReaderUi() }
            })
            addView(TextView(this@MoonBookReaderActivity).apply {
                text = "  صفحة ${currentPage + 1} / ${r.pageCount}  "
                setTextColor(Color.WHITE)
                textSize = 14f
            })
            addView(smallBtn("التالي ▶") {
                if (currentPage < r.pageCount - 1) { currentPage++; renderReaderUi() }
            })
        }
        wrap.addView(bottom)
        contentContainer.addView(wrap)
    }

    private fun smallBtn(label: String, onClick: () -> Unit): Button {
        return Button(this).apply {
            text = label
            setTextColor(Color.WHITE)
            textSize = 12f
            isAllCaps = false
            background = GradientDrawable().apply { setColor(Color.parseColor("#1E293B")); cornerRadius = 20f }
            setPadding(16, 8, 16, 8)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { setMargins(5, 2, 5, 2) }
            setOnClickListener { onClick() }
        }
    }

    private fun closePdf() {
        try { renderer?.close() } catch (_: Exception) {}
        try { pfd?.close() } catch (_: Exception) {}
        renderer = null
        pfd = null
    }

    override fun onDestroy() {
        closePdf()
        super.onDestroy()
    }
}
