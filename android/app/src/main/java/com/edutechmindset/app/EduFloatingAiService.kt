package com.edutechmindset.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.graphics.Color
import android.graphics.Outline
import android.graphics.PixelFormat
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.IBinder
import android.view.*
import android.webkit.CookieManager
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.app.NotificationCompat
import kotlin.math.abs

class EduFloatingAiService : Service() {

    companion object {
        const val ACTION_STOP = "com.edutechmindset.app.STOP_FLOATING_AI"
        private const val CHANNEL_ID = "edutech_floating_ai_v310"
        private const val NOTIF_ID = 3101
    }

    private lateinit var wm: WindowManager
    private var bubbleView: FrameLayout? = null
    private var bubbleParams: WindowManager.LayoutParams? = null
    private var panelView: LinearLayout? = null
    private var panelParams: WindowManager.LayoutParams? = null
    private var isFullscreenPanel = false

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        wm = getSystemService(WINDOW_SERVICE) as WindowManager
        startForegroundNotif()
        createBubble()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) {
            stopSelf()
            return START_NOT_STICKY
        }
        return START_STICKY
    }

    private fun startForegroundNotif() {
        val nm = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val ch = NotificationChannel(CHANNEL_ID, "مساعد EduTech العائم", NotificationManager.IMPORTANCE_LOW)
            nm.createNotificationChannel(ch)
        }
        val stopIntent = Intent(this, EduFloatingAiService::class.java).apply { action = ACTION_STOP }
        val stopPi = PendingIntent.getService(this, 1, stopIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val notif = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("مساعدك الذكي — EduTech Mindset")
            .setContentText("الفقاعة العائمة جاهزة فوق التطبيقات")
            .setOngoing(true)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "إيقاف", stopPi)
            .build()
        startForeground(NOTIF_ID, notif)
    }

    private fun createBubble() {
        val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        else @Suppress("DEPRECATION") WindowManager.LayoutParams.TYPE_PHONE

        val density = resources.displayMetrics.density
        val sizePx = (56 * density).toInt()
        val params = WindowManager.LayoutParams(
            sizePx, sizePx, type,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 12
            y = (resources.displayMetrics.heightPixels * 0.42f).toInt()
        }
        bubbleParams = params

        val container = FrameLayout(this).apply {
            background = GradientDrawable(
                GradientDrawable.Orientation.TL_BR,
                intArrayOf(Color.parseColor("#0284C7"), Color.parseColor("#4F46E5"))
            ).apply {
                shape = GradientDrawable.OVAL
                setStroke((2.5f * density).toInt(), Color.parseColor("#F59E0B"))
            }
            elevation = 12f
        }
        val img = ImageView(this).apply {
            setImageResource(R.mipmap.ic_launcher)
            scaleType = ImageView.ScaleType.CENTER_CROP
            val pad = (4 * density).toInt()
            layoutParams = FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT).apply {
                setMargins(pad, pad, pad, pad)
            }
            outlineProvider = object : ViewOutlineProvider() {
                override fun getOutline(view: View, outline: Outline) {
                    outline.setOval(0, 0, view.width, view.height)
                }
            }
            clipToOutline = true
        }
        container.addView(img)

        var startX = 0; var startY = 0; var touchX = 0f; var touchY = 0f; var moved = false
        container.setOnTouchListener { _, ev ->
            when (ev.actionMasked) {
                MotionEvent.ACTION_DOWN -> {
                    startX = params.x; startY = params.y
                    touchX = ev.rawX; touchY = ev.rawY; moved = false
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    val dx = (ev.rawX - touchX).toInt()
                    val dy = (ev.rawY - touchY).toInt()
                    if (abs(dx) > 10 || abs(dy) > 10) moved = true
                    params.x = startX + dx
                    params.y = startY + dy
                    wm.updateViewLayout(container, params)
                    true
                }
                MotionEvent.ACTION_UP -> {
                    if (!moved) {
                        togglePanel()
                    } else {
                        // Edge Snap to nearest screen edge so it never blocks buttons
                        val screenW = resources.displayMetrics.widthPixels
                        params.x = if (params.x + sizePx / 2 < screenW / 2) 10 else screenW - sizePx - 10
                        wm.updateViewLayout(container, params)
                    }
                    true
                }
                else -> false
            }
        }
        bubbleView = container
        wm.addView(container, params)
    }

    private fun togglePanel() {
        if (panelView != null) {
            removePanel()
            return
        }
        val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        else @Suppress("DEPRECATION") WindowManager.LayoutParams.TYPE_PHONE

        val dm = resources.displayMetrics
        val p = WindowManager.LayoutParams(
            (dm.widthPixels * 0.92f).toInt(),
            (dm.heightPixels * 0.68f).toInt(),
            type,
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.CENTER
        }
        panelParams = p

        val wrap = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            background = GradientDrawable().apply {
                setColor(Color.parseColor("#0F172A"))
                cornerRadius = 36f
                setStroke(3, Color.parseColor("#38BDF8"))
            }
            clipToOutline = true
        }

        val bar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setBackgroundColor(Color.parseColor("#1E3A8A"))
            setPadding(20, 12, 20, 12)
            addView(TextView(this@EduFloatingAiService).apply {
                text = "✨ مساعدك الذكي — EduTech"
                setTextColor(Color.WHITE)
                textSize = 14f
                layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
            })
            addView(Button(this@EduFloatingAiService).apply {
                text = "⛶"
                setTextColor(Color.WHITE)
                setBackgroundColor(Color.TRANSPARENT)
                setOnClickListener {
                    isFullscreenPanel = !isFullscreenPanel
                    p.width = if (isFullscreenPanel) dm.widthPixels else (dm.widthPixels * 0.92f).toInt()
                    p.height = if (isFullscreenPanel) (dm.heightPixels * 0.92f).toInt() else (dm.heightPixels * 0.68f).toInt()
                    wm.updateViewLayout(wrap, p)
                }
            })
            addView(Button(this@EduFloatingAiService).apply {
                text = "✕"
                setTextColor(Color.WHITE)
                setBackgroundColor(Color.TRANSPARENT)
                setOnClickListener { removePanel() }
            })
        }
        wrap.addView(bar)

        val wv = WebView(this).apply {
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f)
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.mediaPlaybackRequiresUserGesture = false
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
            CookieManager.getInstance().setAcceptCookie(true)
            CookieManager.getInstance().setAcceptThirdPartyCookies(this, true)
            webViewClient = WebViewClient()
            webChromeClient = WebChromeClient()
            loadUrl("https://edutech-mindset.pages.dev/?floating=assistant")
        }
        wrap.addView(wv)
        panelView = wrap
        wm.addView(wrap, p)
    }

    private fun removePanel() {
        panelView?.let {
            try { wm.removeView(it) } catch (_: Exception) {}
        }
        panelView = null
    }

    override fun onDestroy() {
        removePanel()
        bubbleView?.let {
            try { wm.removeView(it) } catch (_: Exception) {}
        }
        super.onDestroy()
    }
}
