package com.edutechmindset.app

import android.app.AlertDialog
import android.content.Context
import android.graphics.*
import android.graphics.drawable.GradientDrawable
import android.graphics.pdf.PdfRenderer
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.os.ParcelFileDescriptor
import android.provider.MediaStore
import android.provider.OpenableColumns
import android.text.Editable
import android.text.TextWatcher
import android.util.LruCache
import android.view.*
import android.widget.*
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import java.io.File
import java.util.concurrent.Executors
import kotlin.math.abs

class MoonBookReaderActivity : AppCompatActivity() {

    enum class ThemeMode { DAY, SEPIA, NIGHT, AMOLED }

    private lateinit var db: EduTechDatabaseHelper
    private lateinit var rootLayout: FrameLayout
    private val ioExecutor = Executors.newSingleThreadExecutor()
    private val renderExecutor = Executors.newSingleThreadExecutor()

    private var renderer: PdfRenderer? = null
    private var pfd: ParcelFileDescriptor? = null
    private var currentPath: String = ""
    private var currentTitle: String = ""
    private var currentPage = 0
    private var totalPages = 0
    private var themeMode = ThemeMode.DAY
    private var barsVisible = true
    private var allFoundBooks: List<File> = emptyList()

    private val pageCache = object : LruCache<String, Bitmap>(6) {}

    private val importPdfLauncher = registerForActivityResult(ActivityResultContracts.OpenDocument()) { uri: Uri? ->
        if (uri != null) importAndOpenPdf(uri)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        db = EduTechDatabaseHelper(this)

        rootLayout = FrameLayout(this).apply {
            setBackgroundColor(Color.parseColor("#0B1120"))
        }
        setContentView(rootLayout)

        val initialPdf = intent.getStringExtra("PDF_PATH")
        if (!initialPdf.isNullOrBlank() && File(initialPdf).exists()) {
            openBookAsync(initialPdf)
        } else {
            showBookshelf()
        }
    }

    private fun importAndOpenPdf(uri: Uri) {
        Toast.makeText(this, "⏳ جارٍ استيراد الكتاب...", Toast.LENGTH_SHORT).show()
        ioExecutor.execute {
            try {
                var name = "Book_${System.currentTimeMillis()}.pdf"
                contentResolver.query(uri, null, null, null, null)?.use { c ->
                    val idx = c.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                    if (idx >= 0 && c.moveToFirst()) name = c.getString(idx) ?: name
                }
                if (!name.lowercase().endsWith(".pdf")) name += ".pdf"
                val bytes = contentResolver.openInputStream(uri)?.use { it.readBytes() }
                if (bytes == null || bytes.isEmpty()) {
                    runOnUiThread { Toast.makeText(this, "❌ تعذر قراءة ملف PDF", Toast.LENGTH_SHORT).show() }
                    return@execute
                }
                val res = EduFileSaver.saveBytes(this, bytes, name, "application/pdf")
                runOnUiThread {
                    if (res.ok) {
                        Toast.makeText(this, "✅ تم استيراد الكتاب: ${res.displayName}", Toast.LENGTH_SHORT).show()
                        openBookAsync(res.filePath)
                    } else {
                        Toast.makeText(this, "❌ فشل الاستيراد: ${res.error}", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                runOnUiThread { Toast.makeText(this, "❌ خطأ في الاستيراد: ${e.message}", Toast.LENGTH_SHORT).show() }
            }
        }
    }

    private fun scanPdfFilesBackground(): List<File> {
        val found = linkedMapOf<String, File>()
        // 1) App-private saved books & downloads (always fast & accessible)
        val appDirs = listOfNotNull(
            File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "EduTech_Mindset"),
            getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS)
        )
        fun walkLimited(d: File, depth: Int) {
            if (depth > 2 || !d.exists() || !d.isDirectory || found.size >= 120) return
            d.listFiles()?.forEach { f ->
                if (found.size >= 120) return
                if (f.isFile && f.name.lowercase().endsWith(".pdf")) {
                    found[f.absolutePath] = f
                } else if (f.isDirectory && !f.name.startsWith(".")) {
                    walkLimited(f, depth + 1)
                }
            }
        }
        appDirs.forEach { walkLimited(it, 0) }

        // 2) Recorded PDFs in local SQLite DB
        try {
            db.listSavedFiles("PDF").forEach { rec ->
                val f = File(rec.path)
                if (f.exists() && f.isFile) found[f.absolutePath] = f
            }
        } catch (_: Exception) {}

        // 3) Fast MediaStore query for device PDFs (Android 10+ safe, no main-thread hang)
        try {
            val collection = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                MediaStore.Files.getContentUri(MediaStore.VOLUME_EXTERNAL)
            } else {
                MediaStore.Files.getContentUri("external")
            }
            val projection = arrayOf(MediaStore.Files.FileColumns.DATA)
            val selection = "${MediaStore.Files.FileColumns.MIME_TYPE} = ? OR ${MediaStore.Files.FileColumns.DISPLAY_NAME} LIKE ?"
            val args = arrayOf("application/pdf", "%.pdf")
            contentResolver.query(
                collection, projection, selection, args,
                "${MediaStore.Files.FileColumns.DATE_MODIFIED} DESC"
            )?.use { c ->
                var count = 0
                while (c.moveToNext() && count < 60) {
                    val p = c.getString(0) ?: continue
                    val f = File(p)
                    if (f.exists() && f.canRead() && f.isFile) {
                        found[f.absolutePath] = f
                        count++
                    }
                }
            }
        } catch (_: Exception) {}

        return found.values.sortedByDescending { it.lastModified() }
    }

    private fun showBookshelf() {
        closePdf()
        rootLayout.removeAllViews()

        val mainCol = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#0B1120"))
            setPadding(24, 24, 24, 20)
            layoutParams = FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
        }

        // Top Bar
        val header = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(0, 0, 0, 16)
            addView(pillBtn("✕ إغلاق", "#334155") { finish() })
            addView(TextView(this@MoonBookReaderActivity).apply {
                text = "  📚 مكتبة الكتب (Moon+)"
                setTextColor(Color.WHITE)
                textSize = 18f
                typeface = Typeface.DEFAULT_BOLD
                layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
            })
            addView(pillBtn("📂 استيراد PDF", "#0284C7") {
                importPdfLauncher.launch(arrayOf("application/pdf"))
            })
        }
        mainCol.addView(header)

        // Search input
        val searchInput = EditText(this).apply {
            hint = "🔍 ابحث في كتبك المحفوظة..."
            setHintTextColor(Color.parseColor("#64748B"))
            setTextColor(Color.WHITE)
            textSize = 14f
            setSingleLine(true)
            setPadding(28, 18, 28, 18)
            background = GradientDrawable().apply {
                setColor(Color.parseColor("#1E293B"))
                cornerRadius = 26f
                setStroke(1, Color.parseColor("#334155"))
            }
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply {
                setMargins(0, 0, 0, 16)
            }
        }
        mainCol.addView(searchInput)

        val scroll = ScrollView(this).apply {
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f)
        }
        val listCol = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
        }
        scroll.addView(listCol)
        mainCol.addView(scroll)
        rootLayout.addView(mainCol)

        // Loading indicator (NO UI thread blocking!)
        val loadingBox = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(0, 80, 0, 80)
            addView(ProgressBar(this@MoonBookReaderActivity))
            addView(TextView(this@MoonBookReaderActivity).apply {
                text = "جارٍ تجهيز أرفف الكتب..."
                setTextColor(Color.parseColor("#94A3B8"))
                textSize = 14f
                setPadding(0, 16, 0, 0)
            })
        }
        listCol.addView(loadingBox)

        fun renderBookCards(books: List<File>, progressMap: Map<String, BookProgressRecord>) {
            listCol.removeAllViews()
            if (books.isEmpty()) {
                val emptyBox = LinearLayout(this).apply {
                    orientation = LinearLayout.VERTICAL
                    gravity = Gravity.CENTER
                    setPadding(24, 60, 24, 40)
                    background = GradientDrawable().apply {
                        setColor(Color.parseColor("#111C33"))
                        cornerRadius = 28f
                        setStroke(1, Color.parseColor("#1E3A5F"))
                    }
                    addView(TextView(this@MoonBookReaderActivity).apply {
                        text = "📖 لا توجد كتب PDF على الرف بعد"
                        setTextColor(Color.WHITE)
                        textSize = 16f
                        typeface = Typeface.DEFAULT_BOLD
                        gravity = Gravity.CENTER
                    })
                    addView(TextView(this@MoonBookReaderActivity).apply {
                        text = "اضغط «📂 استيراد PDF» لاختيار أي كتاب من جهازك أو واتساب أو التنزيلات، كما ستظهر هنا تلقائياً كل ملفات PDF التي تحفظها من المنصة."
                        setTextColor(Color.parseColor("#94A3B8"))
                        textSize = 13f
                        gravity = Gravity.CENTER
                        setPadding(0, 14, 0, 22)
                    })
                    addView(pillBtn("📂 استيراد كتاب PDF الآن", "#0284C7") {
                        importPdfLauncher.launch(arrayOf("application/pdf"))
                    })
                }
                listCol.addView(emptyBox)
                return
            }

            books.forEach { file ->
                val prog = progressMap[file.absolutePath]
                val pct = if (prog != null && prog.totalPages > 0) ((prog.currentPage + 1) * 100 / prog.totalPages).coerceIn(0, 100) else 0
                val bmCount = prog?.bookmarks?.size ?: 0
                val sizeKb = (file.length() / 1024).coerceAtLeast(1)
                val sizeLabel = if (sizeKb >= 1024) String.format("%.1f MB", sizeKb / 1024f) else "$sizeKb KB"

                val card = LinearLayout(this).apply {
                    orientation = LinearLayout.VERTICAL
                    setPadding(24, 20, 24, 20)
                    background = GradientDrawable().apply {
                        setColor(Color.parseColor("#1E293B"))
                        cornerRadius = 26f
                        setStroke(2, Color.parseColor(if (pct > 0) "#38BDF8" else "#334155"))
                    }
                    layoutParams = LinearLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.WRAP_CONTENT
                    ).apply { setMargins(0, 0, 0, 14) }
                    setOnClickListener { openBookAsync(file.absolutePath) }
                }
                card.addView(TextView(this).apply {
                    text = "📖 ${file.nameWithoutExtension}"
                    setTextColor(Color.WHITE)
                    textSize = 15f
                    typeface = Typeface.DEFAULT_BOLD
                })
                card.addView(TextView(this).apply {
                    val pageInfo = if (prog != null) "صفحة ${prog.currentPage + 1}/${prog.totalPages} ($pct%)" else "جديد"
                    val bmInfo = if (bmCount > 0) " • ⭐ $bmCount" else ""
                    text = "$pageInfo • $sizeLabel$bmInfo"
                    setTextColor(Color.parseColor("#94A3B8"))
                    textSize = 12f
                    setPadding(0, 8, 0, 10)
                })
                val bar = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply {
                    max = 100
                    progress = pct
                    layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 10)
                }
                card.addView(bar)
                listCol.addView(card)
            }
        }

        ioExecutor.execute {
            val books = scanPdfFilesBackground()
            val progressMap = db.getAllBookProgress()
            allFoundBooks = books
            runOnUiThread {
                renderBookCards(books, progressMap)
                searchInput.addTextChangedListener(object : TextWatcher {
                    override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                    override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                        val q = (s?.toString() ?: "").trim().lowercase()
                        val filtered = if (q.isEmpty()) allFoundBooks else allFoundBooks.filter { it.name.lowercase().contains(q) }
                        renderBookCards(filtered, progressMap)
                    }
                    override fun afterTextChanged(s: Editable?) {}
                })
            }
        }
    }

    private fun openBookAsync(path: String) {
        closePdf()
        rootLayout.removeAllViews()
        val loader = FrameLayout(this).apply {
            setBackgroundColor(Color.parseColor("#0B1120"))
            addView(ProgressBar(this@MoonBookReaderActivity), FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.CENTER
            ))
        }
        rootLayout.addView(loader)

        renderExecutor.execute {
            try {
                val f = File(path)
                val desc = ParcelFileDescriptor.open(f, ParcelFileDescriptor.MODE_READ_ONLY)
                val r = PdfRenderer(desc)
                pfd = desc
                renderer = r
                currentPath = path
                currentTitle = f.nameWithoutExtension
                totalPages = r.pageCount
                val saved = db.getBookProgress(path)
                currentPage = (saved?.currentPage ?: 0).coerceIn(0, (totalPages - 1).coerceAtLeast(0))
                pageCache.evictAll()
                runOnUiThread { buildReaderUi() }
            } catch (e: Exception) {
                runOnUiThread {
                    Toast.makeText(this, "❌ تعذر فتح الكتاب: ${e.message}", Toast.LENGTH_LONG).show()
                    showBookshelf()
                }
            }
        }
    }

    private fun buildReaderUi() {
        rootLayout.removeAllViews()
        val bg = themeBgColor()
        rootLayout.setBackgroundColor(bg)

        val pageView = ZoomablePdfView(
            context = this,
            onSwipeNext = { if (currentPage < totalPages - 1) { currentPage++; loadCurrentPage() } },
            onSwipePrev = { if (currentPage > 0) { currentPage--; loadCurrentPage() } },
            onCenterTap = { toggleBars() }
        ).apply {
            layoutParams = FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
        }
        rootLayout.addView(pageView)

        val pageSpinner = ProgressBar(this).apply {
            visibility = View.GONE
            layoutParams = FrameLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.CENTER)
        }
        rootLayout.addView(pageSpinner)

        // Top Overlay Bar
        val topBar = LinearLayout(this).apply {
            id = View.generateViewId()
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setBackgroundColor(Color.parseColor("#EB0F172A"))
            setPadding(14, 16, 14, 14)
            layoutParams = FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.TOP)
        }

        val btnBookmark = pillBtn("☆", "#1E293B") {}
        fun updateBookmarkBtn() {
            val isBm = db.getBookmarks(currentPath).contains(currentPage)
            btnBookmark.text = if (isBm) "⭐" else "☆"
        }
        btnBookmark.setOnClickListener {
            val added = db.toggleBookmark(currentPath, currentTitle, currentPage, totalPages)
            updateBookmarkBtn()
            Toast.makeText(this, if (added) "⭐ تمت إضافة إشارة مرجعية للصفحة ${currentPage + 1}" else "تمت إزالة الإشارة المرجعية", Toast.LENGTH_SHORT).show()
        }

        topBar.addView(pillBtn("📚 الرف", "#334155") { showBookshelf() })
        topBar.addView(TextView(this).apply {
            text = "  $currentTitle"
            setTextColor(Color.WHITE)
            textSize = 13f
            typeface = Typeface.DEFAULT_BOLD
            maxLines = 1
            layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
        })
        topBar.addView(btnBookmark)
        topBar.addView(pillBtn("📑", "#1E293B") { showBookmarksDialog() })
        topBar.addView(pillBtn("☀️", "#1E293B") { showBrightnessDialog() })
        rootLayout.addView(topBar)

        // Bottom Overlay Bar (Themes + SeekBar + Prev/Next)
        val bottomBar = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#EB0F172A"))
            setPadding(18, 12, 18, 18)
            layoutParams = FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.BOTTOM)
        }

        val pageLabel = TextView(this).apply {
            setTextColor(Color.parseColor("#E2E8F0"))
            textSize = 13f
            gravity = Gravity.CENTER
        }
        bottomBar.addView(pageLabel)

        val seekBar = SeekBar(this).apply {
            max = (totalPages - 1).coerceAtLeast(0)
            progress = currentPage
            setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
                override fun onProgressChanged(sb: SeekBar?, progress: Int, fromUser: Boolean) {
                    if (fromUser) pageLabel.text = "صفحة ${progress + 1} / $totalPages (${((progress + 1) * 100 / totalPages.coerceAtLeast(1))}%)"
                }
                override fun onStartTrackingTouch(sb: SeekBar?) {}
                override fun onStopTrackingTouch(sb: SeekBar?) {
                    val p = sb?.progress ?: return
                    if (p != currentPage) {
                        currentPage = p
                        loadCurrentPage()
                    }
                }
            })
        }
        bottomBar.addView(seekBar)

        val controlsRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(0, 8, 0, 0)
            addView(pillBtn("◀ السابق", "#0284C7") { if (currentPage > 0) { currentPage--; loadCurrentPage() } })
            addView(pillBtn("☀", "#1E293B") { switchTheme(ThemeMode.DAY) })
            addView(pillBtn("📜", "#78350F") { switchTheme(ThemeMode.SEPIA) })
            addView(pillBtn("🌙", "#1E3A8A") { switchTheme(ThemeMode.NIGHT) })
            addView(pillBtn("⬛", "#000000") { switchTheme(ThemeMode.AMOLED) })
            addView(pillBtn("التالي ▶", "#0284C7") { if (currentPage < totalPages - 1) { currentPage++; loadCurrentPage() } })
        }
        bottomBar.addView(controlsRow)
        rootLayout.addView(bottomBar)

        rootLayout.tag = ReaderViews(pageView, pageSpinner, topBar, bottomBar, pageLabel, seekBar, ::updateBookmarkBtn)
        loadCurrentPage()
    }

    private data class ReaderViews(
        val pageView: ZoomablePdfView,
        val spinner: ProgressBar,
        val topBar: View,
        val bottomBar: View,
        val pageLabel: TextView,
        val seekBar: SeekBar,
        val updateBookmarkBtn: () -> Unit
    )

    private fun switchTheme(mode: ThemeMode) {
        themeMode = mode
        rootLayout.setBackgroundColor(themeBgColor())
        pageCache.evictAll()
        loadCurrentPage()
    }

    private fun themeBgColor(): Int = when (themeMode) {
        ThemeMode.DAY -> Color.parseColor("#F1F5F9")
        ThemeMode.SEPIA -> Color.parseColor("#F4ECD8")
        ThemeMode.NIGHT -> Color.parseColor("#1E293B")
        ThemeMode.AMOLED -> Color.BLACK
    }

    private fun toggleBars() {
        val views = rootLayout.tag as? ReaderViews ?: return
        barsVisible = !barsVisible
        val vis = if (barsVisible) View.VISIBLE else View.GONE
        views.topBar.visibility = vis
        views.bottomBar.visibility = vis
    }

    private fun loadCurrentPage() {
        val views = rootLayout.tag as? ReaderViews ?: return
        val pageIdx = currentPage
        val pct = ((pageIdx + 1) * 100 / totalPages.coerceAtLeast(1))
        views.pageLabel.text = "صفحة ${pageIdx + 1} / $totalPages ($pct%)"
        views.seekBar.progress = pageIdx
        views.updateBookmarkBtn()

        val cacheKey = "${pageIdx}_${themeMode.name}"
        val cached = pageCache.get(cacheKey)
        if (cached != null && !cached.isRecycled) {
            views.spinner.visibility = View.GONE
            views.pageView.setPageBitmap(cached, themeMode == ThemeMode.NIGHT || themeMode == ThemeMode.AMOLED)
            ioExecutor.execute { db.saveBookProgress(currentPath, currentTitle, pageIdx, totalPages) }
            return
        }

        views.spinner.visibility = View.VISIBLE
        renderExecutor.execute {
            try {
                val r = renderer ?: return@execute
                val page = r.openPage(pageIdx)
                val targetW = (resources.displayMetrics.widthPixels * 1.6f).toInt().coerceIn(800, 1800)
                val targetH = ((targetW.toFloat() / page.width.coerceAtLeast(1)) * page.height).toInt().coerceIn(800, 2600)
                val bmp = Bitmap.createBitmap(targetW, targetH, Bitmap.Config.ARGB_8888)
                bmp.eraseColor(if (themeMode == ThemeMode.SEPIA) Color.parseColor("#F4ECD8") else Color.WHITE)
                page.render(bmp, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
                page.close()
                pageCache.put(cacheKey, bmp)
                db.saveBookProgress(currentPath, currentTitle, pageIdx, totalPages)

                runOnUiThread {
                    if (currentPage == pageIdx) {
                        views.spinner.visibility = View.GONE
                        views.pageView.setPageBitmap(bmp, themeMode == ThemeMode.NIGHT || themeMode == ThemeMode.AMOLED)
                    }
                }
            } catch (_: Exception) {
                runOnUiThread { views.spinner.visibility = View.GONE }
            }
        }
    }

    private fun showBookmarksDialog() {
        val bms = db.getBookmarks(currentPath).sorted()
        if (bms.isEmpty()) {
            Toast.makeText(this, "لا توجد إشارات مرجعية بعد — اضغط ☆ لحفظ الصفحة الحالية", Toast.LENGTH_SHORT).show()
            return
        }
        val labels = bms.map { "⭐ صفحة ${it + 1}" }.toTypedArray()
        AlertDialog.Builder(this)
            .setTitle("الإشارات المرجعية ($currentTitle)")
            .setItems(labels) { _, which ->
                currentPage = bms[which].coerceIn(0, (totalPages - 1).coerceAtLeast(0))
                loadCurrentPage()
            }
            .setNegativeButton("إغلاق", null)
            .show()
    }

    private fun showBrightnessDialog() {
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(48, 32, 48, 16)
        }
        val lp = window.attributes
        val currentB = if (lp.screenBrightness < 0f) 0.5f else lp.screenBrightness
        val sb = SeekBar(this).apply {
            max = 100
            progress = (currentB * 100).toInt().coerceIn(5, 100)
            setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
                override fun onProgressChanged(s: SeekBar?, p: Int, fromUser: Boolean) {
                    val attr = window.attributes
                    attr.screenBrightness = (p / 100f).coerceIn(0.05f, 1.0f)
                    window.attributes = attr
                }
                override fun onStartTrackingTouch(s: SeekBar?) {}
                override fun onStopTrackingTouch(s: SeekBar?) {}
            })
        }
        layout.addView(sb)
        AlertDialog.Builder(this)
            .setTitle("☀️ سطوع القراءة")
            .setView(layout)
            .setPositiveButton("تم", null)
            .show()
    }

    private fun pillBtn(label: String, bgHex: String, onClick: () -> Unit): Button {
        return Button(this).apply {
            text = label
            setTextColor(Color.WHITE)
            textSize = 12f
            isAllCaps = false
            minWidth = 0
            minimumWidth = 0
            minHeight = 0
            minimumHeight = 0
            background = GradientDrawable().apply {
                setColor(Color.parseColor(bgHex))
                cornerRadius = 22f
            }
            setPadding(20, 12, 20, 12)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { setMargins(5, 2, 5, 2) }
            setOnClickListener { onClick() }
        }
    }

    private fun closePdf() {
        pageCache.evictAll()
        try { renderer?.close() } catch (_: Exception) {}
        try { pfd?.close() } catch (_: Exception) {}
        renderer = null
        pfd = null
    }

    override fun onDestroy() {
        closePdf()
        ioExecutor.shutdownNow()
        renderExecutor.shutdownNow()
        super.onDestroy()
    }

    /** Custom Zoomable & Swipeable PDF Page View (Pinch Zoom + Double-Tap Zoom + Pan + Swipe Pages) */
    private class ZoomablePdfView(
        context: Context,
        private val onSwipeNext: () -> Unit,
        private val onSwipePrev: () -> Unit,
        private val onCenterTap: () -> Unit
    ) : View(context) {

        private var bitmap: Bitmap? = null
        private val paint = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG)
        private var scale = 1f
        private var transX = 0f
        private var transY = 0f
        private var lastX = 0f
        private var lastY = 0f
        private var dragging = false

        private val invertFilter = ColorMatrixColorFilter(
            ColorMatrix(
                floatArrayOf(
                    -1f, 0f, 0f, 0f, 255f,
                    0f, -1f, 0f, 0f, 255f,
                    0f, 0f, -1f, 0f, 255f,
                    0f, 0f, 0f, 1f, 0f
                )
            )
        )

        private val scaleDetector = ScaleGestureDetector(context, object : ScaleGestureDetector.SimpleOnScaleGestureListener() {
            override fun onScale(detector: ScaleGestureDetector): Boolean {
                scale = (scale * detector.scaleFactor).coerceIn(1f, 4f)
                if (scale <= 1.01f) { transX = 0f; transY = 0f }
                invalidate()
                return true
            }
        })

        private val gestureDetector = GestureDetector(context, object : GestureDetector.SimpleOnGestureListener() {
            override fun onDoubleTap(e: MotionEvent): Boolean {
                scale = if (scale > 1.2f) 1f else 2.2f
                transX = 0f; transY = 0f
                invalidate()
                return true
            }

            override fun onSingleTapConfirmed(e: MotionEvent): Boolean {
                onCenterTap()
                return true
            }

            override fun onFling(e1: MotionEvent?, e2: MotionEvent, velocityX: Float, velocityY: Float): Boolean {
                if (scale <= 1.08f && e1 != null) {
                    val dx = e2.x - e1.x
                    val dy = e2.y - e1.y
                    if (abs(dx) > 100 && abs(dx) > abs(dy) * 1.4f) {
                        // RTL-friendly: swipe right -> next page, swipe left -> prev page
                        if (dx > 0) onSwipeNext() else onSwipePrev()
                        return true
                    }
                }
                return false
            }
        })

        fun setPageBitmap(bmp: Bitmap, invert: Boolean) {
            bitmap = bmp
            paint.colorFilter = if (invert) invertFilter else null
            scale = 1f
            transX = 0f
            transY = 0f
            invalidate()
        }

        override fun onTouchEvent(event: MotionEvent): Boolean {
            scaleDetector.onTouchEvent(event)
            gestureDetector.onTouchEvent(event)
            when (event.actionMasked) {
                MotionEvent.ACTION_DOWN -> {
                    lastX = event.x; lastY = event.y; dragging = true
                }
                MotionEvent.ACTION_MOVE -> {
                    if (dragging && scale > 1.05f && !scaleDetector.isInProgress) {
                        transX += (event.x - lastX)
                        transY += (event.y - lastY)
                        val maxX = width * (scale - 1f) / 2f
                        val maxY = height * (scale - 1f) / 2f
                        transX = transX.coerceIn(-maxX, maxX)
                        transY = transY.coerceIn(-maxY, maxY)
                        lastX = event.x; lastY = event.y
                        invalidate()
                    }
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> dragging = false
            }
            return true
        }

        override fun onDraw(canvas: Canvas) {
            super.onDraw(canvas)
            val bmp = bitmap ?: return
            if (bmp.isRecycled || width == 0 || height == 0) return

            val fitScale = minOf(width.toFloat() / bmp.width, height.toFloat() / bmp.height)
            val drawW = bmp.width * fitScale * scale
            val drawH = bmp.height * fitScale * scale
            val left = (width - drawW) / 2f + transX
            val top = (height - drawH) / 2f + transY
            val dst = RectF(left, top, left + drawW, top + drawH)
            canvas.drawBitmap(bmp, null, dst, paint)
        }
    }
}
