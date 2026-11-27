package com.edutechmindset.app

import android.content.Context
import android.graphics.*
import android.graphics.drawable.GradientDrawable
import android.graphics.pdf.PdfDocument
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import java.io.ByteArrayOutputStream
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.hypot
import kotlin.math.sin

class SmartWhiteboardActivity : AppCompatActivity() {

    enum class Tool { PEN, HIGHLIGHTER, ERASER, LASER, LINE, ARROW, RECT, CIRCLE }
    enum class BgMode { WHITE, CHALKBOARD, LINED, GRID_AXES }

    data class Stroke(
        val tool: Tool,
        val color: Int,
        val width: Float,
        val path: Path,
        val startX: Float = 0f,
        val startY: Float = 0f,
        var endX: Float = 0f,
        var endY: Float = 0f
    )

    private lateinit var canvasView: WhiteboardView
    private lateinit var pageLabel: TextView
    private lateinit var toolbarLayout: LinearLayout
    private val pages = mutableListOf(mutableListOf<Stroke>())
    private var currentPageIndex = 0
    private var toolbarVisible = true

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val root = FrameLayout(this).apply {
            setBackgroundColor(Color.parseColor("#0F172A"))
        }

        canvasView = WhiteboardView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            bindStrokes(pages[0])
        }
        root.addView(canvasView)

        // Top compact bar
        val topBar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setBackgroundColor(Color.parseColor("#DD0F172A"))
            setPadding(16, 12, 16, 12)
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                Gravity.TOP
            )
        }

        val closeBtn = makePill("✕ إغلاق", "#334155") { finish() }
        val undoBtn = makePill("↩", "#1E293B") { canvasView.undo() }
        val clearBtn = makePill("🧹", "#7F1D1D") { canvasView.clearAll() }
        val prevPageBtn = makePill("◀", "#1E293B") { switchPage(currentPageIndex - 1) }
        pageLabel = TextView(this).apply {
            text = "صفحة 1/1"
            setTextColor(Color.WHITE)
            textSize = 13f
            setPadding(12, 0, 12, 0)
        }
        val nextPageBtn = makePill("▶+", "#1E293B") {
            if (currentPageIndex == pages.lastIndex) pages.add(mutableListOf())
            switchPage(currentPageIndex + 1)
        }
        val savePdfBtn = makePill("📄 حفظ PDF", "#0284C7") { exportAllPagesPdf() }
        val toggleToolsBtn = makePill("👁", "#4F46E5") {
            toolbarVisible = !toolbarVisible
            toolbarLayout.visibility = if (toolbarVisible) View.VISIBLE else View.GONE
        }

        val topScroll = HorizontalScrollView(this).apply {
            isHorizontalScrollBarEnabled = false
            layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
        }
        val topInner = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            addView(closeBtn)
            addView(undoBtn)
            addView(clearBtn)
            addView(prevPageBtn)
            addView(pageLabel)
            addView(nextPageBtn)
            addView(savePdfBtn)
        }
        topScroll.addView(topInner)
        topBar.addView(topScroll)
        topBar.addView(toggleToolsBtn)
        root.addView(topBar)

        // Bottom tools & backgrounds bar
        toolbarLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#E60F172A"))
            setPadding(12, 10, 12, 14)
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                Gravity.BOTTOM
            )
        }

        val toolsScroll = HorizontalScrollView(this).apply { isHorizontalScrollBarEnabled = false }
        val toolsRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            addView(makePill("✏️ قلم", "#0284C7") { canvasView.currentTool = Tool.PEN })
            addView(makePill("🖍 تحديد", "#D97706") { canvasView.currentTool = Tool.HIGHLIGHTER })
            addView(makePill("🔴 ليزر", "#E11D48") { canvasView.currentTool = Tool.LASER })
            addView(makePill("🧽 ممحاة", "#475569") { canvasView.currentTool = Tool.ERASER })
            addView(makePill("📏 خط", "#334155") { canvasView.currentTool = Tool.LINE })
            addView(makePill("➡ سهم", "#334155") { canvasView.currentTool = Tool.ARROW })
            addView(makePill("▭ مستطيل", "#334155") { canvasView.currentTool = Tool.RECT })
            addView(makePill("◯ دائرة", "#334155") { canvasView.currentTool = Tool.CIRCLE })
        }
        toolsScroll.addView(toolsRow)

        val styleScroll = HorizontalScrollView(this).apply { isHorizontalScrollBarEnabled = false }
        val styleRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(0, 8, 0, 0)
            val colors = listOf(
                "#0F172A" to "أسود",
                "#FFFFFF" to "أبيض",
                "#0284C7" to "أزرق",
                "#EF4444" to "أحمر",
                "#10B981" to "أخضر",
                "#F59E0B" to "ذهبي"
            )
            colors.forEach { (hex, _) ->
                val dot = View(this@SmartWhiteboardActivity).apply {
                    background = GradientDrawable().apply {
                        shape = GradientDrawable.OVAL
                        setColor(Color.parseColor(hex))
                        setStroke(3, Color.parseColor("#94A3B8"))
                    }
                    layoutParams = LinearLayout.LayoutParams(54, 54).apply { setMargins(6, 4, 6, 4) }
                    setOnClickListener { canvasView.currentColor = Color.parseColor(hex) }
                }
                addView(dot)
            }
            addView(makePill("⬜ بيضاء", "#1E293B") { canvasView.setBg(BgMode.WHITE) })
            addView(makePill("🟩 طباشير", "#064E3B") { canvasView.setBg(BgMode.CHALKBOARD) })
            addView(makePill("📄 مسطّرة", "#1E3A8A") { canvasView.setBg(BgMode.LINED) })
            addView(makePill("📐 مربعات", "#312E81") { canvasView.setBg(BgMode.GRID_AXES) })
        }
        styleScroll.addView(styleRow)

        toolbarLayout.addView(toolsScroll)
        toolbarLayout.addView(styleScroll)
        root.addView(toolbarLayout)

        setContentView(root)
    }

    private fun switchPage(idx: Int) {
        if (idx < 0 || idx >= pages.size) return
        currentPageIndex = idx
        canvasView.bindStrokes(pages[currentPageIndex])
        pageLabel.text = "صفحة ${currentPageIndex + 1}/${pages.size}"
    }

    private fun exportAllPagesPdf() {
        try {
            val doc = PdfDocument()
            val w = canvasView.width.coerceAtLeast(1080)
            val h = canvasView.height.coerceAtLeast(1520)
            pages.forEachIndexed { idx, strokeList ->
                val pageInfo = PdfDocument.PageInfo.Builder(w, h, idx + 1).create()
                val page = doc.startPage(pageInfo)
                canvasView.drawSnapshot(page.canvas, strokeList, w, h)
                doc.finishPage(page)
            }
            val bos = ByteArrayOutputStream()
            doc.writeTo(bos)
            doc.close()
            val fileName = "EduTech_Whiteboard_${System.currentTimeMillis()}.pdf"
            val res = EduFileSaver.saveBytes(this, bos.toByteArray(), fileName, "application/pdf")
            if (res.ok) {
                Toast.makeText(this, "✅ حُفظت السبورة PDF في Downloads/EduTech_Mindset/PDF", Toast.LENGTH_LONG).show()
                EduFileSaver.shareFile(this, res.filePath, "application/pdf")
            } else {
                Toast.makeText(this, "❌ تعذر الحفظ: ${res.error}", Toast.LENGTH_SHORT).show()
            }
        } catch (e: Exception) {
            Toast.makeText(this, "❌ خطأ التصدير: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun makePill(label: String, bgHex: String, onClick: () -> Unit): Button {
        return Button(this).apply {
            text = label
            setTextColor(Color.WHITE)
            textSize = 12f
            isAllCaps = false
            background = GradientDrawable().apply {
                setColor(Color.parseColor(bgHex))
                cornerRadius = 28f
            }
            setPadding(22, 10, 22, 10)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { setMargins(6, 4, 6, 4) }
            setOnClickListener { onClick() }
        }
    }

    inner class WhiteboardView(ctx: Context) : View(ctx) {
        var currentTool = Tool.PEN
        var currentColor = Color.parseColor("#0F172A")
        var bgMode = BgMode.WHITE
        private var strokes = mutableListOf<Stroke>()
        private var activeStroke: Stroke? = null
        private val laserHandler = Handler(Looper.getMainLooper())
        private val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeCap = Paint.Cap.ROUND
            strokeJoin = Paint.Join.ROUND
        }
        private val gridPaint = Paint(Paint.ANTI_ALIAS_FLAG)

        fun bindStrokes(list: MutableList<Stroke>) {
            strokes = list
            invalidate()
        }

        fun setBg(mode: BgMode) {
            bgMode = mode
            if (mode == BgMode.CHALKBOARD && currentColor == Color.parseColor("#0F172A")) {
                currentColor = Color.WHITE
            } else if (mode != BgMode.CHALKBOARD && currentColor == Color.WHITE) {
                currentColor = Color.parseColor("#0F172A")
            }
            invalidate()
        }

        fun undo() {
            if (strokes.isNotEmpty()) {
                strokes.removeAt(strokes.lastIndex)
                invalidate()
            }
        }

        fun clearAll() {
            strokes.clear()
            invalidate()
        }

        override fun onTouchEvent(event: MotionEvent): Boolean {
            val x = event.x
            val y = event.y
            when (event.actionMasked) {
                MotionEvent.ACTION_DOWN -> {
                    val path = Path().apply { moveTo(x, y) }
                    val w = when (currentTool) {
                        Tool.HIGHLIGHTER -> 28f
                        Tool.ERASER -> 38f
                        Tool.LASER -> 12f
                        else -> 7f
                    }
                    val col = when (currentTool) {
                        Tool.ERASER -> if (bgMode == BgMode.CHALKBOARD) Color.parseColor("#0B3B2E") else Color.WHITE
                        Tool.HIGHLIGHTER -> Color.argb(95, Color.red(currentColor), Color.green(currentColor), Color.blue(currentColor))
                        Tool.LASER -> Color.parseColor("#FF2D55")
                        else -> currentColor
                    }
                    val st = Stroke(currentTool, col, w, path, x, y, x, y)
                    activeStroke = st
                    strokes.add(st)
                    invalidate()
                }
                MotionEvent.ACTION_MOVE -> {
                    activeStroke?.let { st ->
                        st.endX = x
                        st.endY = y
                        if (st.tool in listOf(Tool.PEN, Tool.HIGHLIGHTER, Tool.ERASER, Tool.LASER)) {
                            st.path.lineTo(x, y)
                        }
                        invalidate()
                    }
                }
                MotionEvent.ACTION_UP -> {
                    val finished = activeStroke
                    activeStroke = null
                    if (finished?.tool == Tool.LASER) {
                        laserHandler.postDelayed({
                            strokes.remove(finished)
                            invalidate()
                        }, 900L)
                    }
                    invalidate()
                }
            }
            return true
        }

        override fun onDraw(canvas: Canvas) {
            drawSnapshot(canvas, strokes, width, height)
        }

        fun drawSnapshot(canvas: Canvas, list: List<Stroke>, w: Int, h: Int) {
            when (bgMode) {
                BgMode.WHITE -> canvas.drawColor(Color.WHITE)
                BgMode.CHALKBOARD -> canvas.drawColor(Color.parseColor("#0B3B2E"))
                BgMode.LINED -> {
                    canvas.drawColor(Color.parseColor("#FFFDF7"))
                    gridPaint.color = Color.parseColor("#CBD5E1")
                    gridPaint.strokeWidth = 2f
                    var y = 120f
                    while (y < h) {
                        canvas.drawLine(0f, y, w.toFloat(), y, gridPaint)
                        y += 68f
                    }
                }
                BgMode.GRID_AXES -> {
                    canvas.drawColor(Color.WHITE)
                    gridPaint.color = Color.parseColor("#E2E8F0")
                    gridPaint.strokeWidth = 1.5f
                    var x = 0f
                    while (x < w) { canvas.drawLine(x, 0f, x, h.toFloat(), gridPaint); x += 56f }
                    var y = 0f
                    while (y < h) { canvas.drawLine(0f, y, w.toFloat(), y, gridPaint); y += 56f }
                    gridPaint.color = Color.parseColor("#0284C7")
                    gridPaint.strokeWidth = 4f
                    canvas.drawLine(w / 2f, 0f, w / 2f, h.toFloat(), gridPaint)
                    canvas.drawLine(0f, h / 2f, w.toFloat(), h / 2f, gridPaint)
                }
            }
            for (st in list) {
                paint.color = st.color
                paint.strokeWidth = st.width
                when (st.tool) {
                    Tool.LINE -> canvas.drawLine(st.startX, st.startY, st.endX, st.endY, paint)
                    Tool.ARROW -> {
                        canvas.drawLine(st.startX, st.startY, st.endX, st.endY, paint)
                        val angle = atan2((st.endY - st.startY).toDouble(), (st.endX - st.startX).toDouble())
                        val len = 30.0
                        canvas.drawLine(st.endX, st.endY, (st.endX - len * cos(angle - 0.5)).toFloat(), (st.endY - len * sin(angle - 0.5)).toFloat(), paint)
                        canvas.drawLine(st.endX, st.endY, (st.endX - len * cos(angle + 0.5)).toFloat(), (st.endY - len * sin(angle + 0.5)).toFloat(), paint)
                    }
                    Tool.RECT -> canvas.drawRect(st.startX, st.startY, st.endX, st.endY, paint)
                    Tool.CIRCLE -> {
                        val r = hypot((st.endX - st.startX).toDouble(), (st.endY - st.startY).toDouble()).toFloat()
                        canvas.drawCircle(st.startX, st.startY, r, paint)
                    }
                    else -> canvas.drawPath(st.path, paint)
                }
            }
        }
    }
}
