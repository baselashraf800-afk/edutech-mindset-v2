package com.edutechmindset.app

import android.Manifest
import android.app.Dialog
import android.app.PictureInPictureParams
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Message
import android.print.PrintAttributes
import android.print.PrintManager
import android.provider.OpenableColumns
import android.provider.Settings
import android.util.Rational
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.Window
import android.webkit.*
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.getcapacitor.BridgeActivity
import com.getcapacitor.BridgeWebChromeClient
import com.getcapacitor.BridgeWebViewClient
import java.util.concurrent.Executors

class MainActivity : BridgeActivity() {
    companion object {
        const val REQ_ALL_PERMS = 2801
        private const val CHROME_MOBILE_UA =
            "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.122 Mobile Safari/537.36"
    }

    private val ioExecutor = Executors.newSingleThreadExecutor()
    private var authPopupDialog: Dialog? = null
    private var lastBackPressedAt = 0L

    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(EduVaultPlugin::class.java)
        registerPlugin(EduMediaPlayerPlugin::class.java)
        registerPlugin(EduPdfReaderPlugin::class.java)
        registerPlugin(EduSecurityWidgetPlugin::class.java)
        super.onCreate(savedInstanceState)

        configureWebViewForAuthAndMedia()
        requestEssentialPermissions()
        handleIncomingIntent(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIncomingIntent(intent)
    }

    private fun isAllowedInAppAuthHost(host: String): Boolean {
        val h = host.lowercase()
        return h.endsWith("edutech-mindset.pages.dev") ||
            h.endsWith("pages.dev") ||
            h.endsWith("firebaseapp.com") ||
            h.endsWith("accounts.google.com") ||
            h.endsWith("accounts.youtube.com") ||
            h.endsWith("youtube.com") ||
            h.endsWith("google.com") ||
            h.endsWith("google.ps") ||
            h.endsWith("googleapis.com") ||
            h.endsWith("gstatic.com") ||
            h.endsWith("googleusercontent.com")
    }

    private fun configureWebViewForAuthAndMedia() {
        try {
            val wv = bridge?.webView ?: return
            wv.setLayerType(View.LAYER_TYPE_HARDWARE, null)
            wv.setBackgroundColor(Color.parseColor("#020617"))

            val settings = wv.settings
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.databaseEnabled = true
            settings.cacheMode = WebSettings.LOAD_DEFAULT
            settings.mediaPlaybackRequiresUserGesture = false
            settings.javaScriptCanOpenWindowsAutomatically = true
            settings.setSupportMultipleWindows(true)
            settings.userAgentString = CHROME_MOBILE_UA

            val cm = CookieManager.getInstance()
            cm.setAcceptCookie(true)
            cm.setAcceptThirdPartyCookies(wv, true)
            wv.addJavascriptInterface(EduTechAndroidBridge(), "EduTechAndroid")

            wv.webViewClient = object : BridgeWebViewClient(bridge) {
                override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                    val host = request.url?.host ?: ""
                    if (isAllowedInAppAuthHost(host)) {
                        return false
                    }
                    return super.shouldOverrideUrlLoading(view, request)
                }

                override fun onPageFinished(view: WebView, url: String) {
                    super.onPageFinished(view, url)
                    injectNativePolishScript(view)
                }

                override fun onReceivedError(
                    view: WebView,
                    request: WebResourceRequest,
                    error: WebResourceError
                ) {
                    if (request.isForMainFrame) {
                        // Never trap user on white net::ERR_FAILED dead-end screen
                        val failedUrl = request.url?.toString() ?: "https://edutech-mindset.pages.dev/"
                        val recoveryHtml = """
                            <!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
                            <meta name="viewport" content="width=device-width,initial-scale=1">
                            <style>
                            body{margin:0;min-height:100vh;background:#020617;color:#fff;font-family:sans-serif;
                            display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;}
                            .card{max-width:360px;width:100%;background:#0f172a;border:1px solid #1e293b;border-radius:22px;padding:24px;}
                            h2{margin:0 0 8px;color:#38bdf8;font-size:18px;}
                            p{margin:0 0 18px;color:#94a3b8;font-size:13px;line-height:1.7;}
                            button{width:100%;padding:12px;border:none;border-radius:14px;font-weight:bold;font-size:14px;margin-bottom:10px;cursor:pointer;}
                            .b1{background:#0284c7;color:#fff;} .b2{background:#1e293b;color:#e2e8f0;border:1px solid #334155;}
                            </style></head><body><div class="card">
                            <h2>📡 تعذر تحميل الصفحة مؤقتاً</h2>
                            <p>حدث انقطاع لحظي في الاتصال. يمكنك إعادة المحاولة فوراً أو فتح ملفاتك وكتبك المحفوظة أوفلاين.</p>
                            <button class="b1" onclick="location.href='$failedUrl'">🔄 إعادة التحميل الآن</button>
                            <button class="b2" onclick="if(window.EduTechAndroid)EduTechAndroid.openMyFolder()">📁 فتح مجلدي (أوفلاين)</button>
                            <button class="b2" onclick="if(window.EduTechAndroid)EduTechAndroid.openBookReader()">📚 فتح مكتبة الكتب</button>
                            </div></body></html>
                        """.trimIndent()
                        view.loadDataWithBaseURL("https://edutech-mindset.pages.dev/", recoveryHtml, "text/html", "UTF-8", null)
                        return
                    }
                    super.onReceivedError(view, request, error)
                }
            }

            // Support Firebase signInWithPopup inside an in-app modal WebView (keeps Google & YouTube SetSID inside app!)
            wv.webChromeClient = object : BridgeWebChromeClient(bridge) {
                override fun onCreateWindow(
                    view: WebView?,
                    isDialog: Boolean,
                    isUserGesture: Boolean,
                    resultMsg: Message?
                ): Boolean {
                    val transport = resultMsg?.obj as? WebView.WebViewTransport ?: return false
                    showInAppAuthPopup(transport, resultMsg)
                    return true
                }
            }
        } catch (_: Exception) {}
    }

    private fun showInAppAuthPopup(transport: WebView.WebViewTransport, resultMsg: Message) {
        runOnUiThread {
            try {
                authPopupDialog?.dismiss()
                val dialog = Dialog(this, android.R.style.Theme_Black_NoTitleBar_Fullscreen)
                dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)

                val container = LinearLayout(this).apply {
                    orientation = LinearLayout.VERTICAL
                    setBackgroundColor(Color.parseColor("#0F172A"))
                }

                val topBar = LinearLayout(this).apply {
                    orientation = LinearLayout.HORIZONTAL
                    gravity = Gravity.CENTER_VERTICAL
                    setBackgroundColor(Color.parseColor("#0F172A"))
                    setPadding(24, 16, 24, 16)
                    addView(TextView(this@MainActivity).apply {
                        text = "🔐 تسجيل الدخول الآمن — EduTech Mindset"
                        setTextColor(Color.WHITE)
                        textSize = 14f
                        layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
                    })
                    addView(Button(this@MainActivity).apply {
                        text = "✕ إغلاق"
                        setTextColor(Color.WHITE)
                        setBackgroundColor(Color.parseColor("#334155"))
                        textSize = 12f
                        setOnClickListener { dialog.dismiss() }
                    })
                }
                container.addView(topBar)

                val popupWv = WebView(this).apply {
                    layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f)
                    settings.javaScriptEnabled = true
                    settings.domStorageEnabled = true
                    settings.databaseEnabled = true
                    settings.javaScriptCanOpenWindowsAutomatically = true
                    settings.setSupportMultipleWindows(true)
                    settings.userAgentString = CHROME_MOBILE_UA
                    val cm = CookieManager.getInstance()
                    cm.setAcceptCookie(true)
                    cm.setAcceptThirdPartyCookies(this, true)
                    webViewClient = object : WebViewClient() {
                        override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                            // Keep EVERY OAuth redirect (including accounts.youtube.com SetSID) strictly inside popupWv!
                            return false
                        }
                    }
                    webChromeClient = object : WebChromeClient() {
                        override fun onCloseWindow(window: WebView?) {
                            dialog.dismiss()
                        }
                    }
                }
                container.addView(popupWv)

                dialog.setContentView(container)
                dialog.setOnDismissListener {
                    try {
                        popupWv.stopLoading()
                        popupWv.destroy()
                    } catch (_: Exception) {}
                    authPopupDialog = null
                }
                authPopupDialog = dialog
                dialog.show()

                transport.webView = popupWv
                resultMsg.sendToTarget()
            } catch (_: Exception) {}
        }
    }

    private fun injectNativePolishScript(view: WebView) {
        ioExecutor.execute {
            try {
                val js = assets.open("public/js/v310-app-upgrade.js").bufferedReader().use { it.readText() }
                runOnUiThread {
                    try {
                        view.evaluateJavascript(js, null)
                    } catch (_: Exception) {}
                }
            } catch (_: Exception) {}
        }
    }

    @Suppress("DEPRECATION")
    override fun onBackPressed() {
        val dlg = authPopupDialog
        if (dlg != null && dlg.isShowing) {
            dlg.dismiss()
            return
        }
        val wv = bridge?.webView
        if (wv != null) {
            // First ask the SPA to close any open drawer / modal / assistant / tool panel cleanly
            wv.evaluateJavascript("(function(){try{return window.EduAppHandleBack ? !!window.EduAppHandleBack() : false;}catch(e){return false;}})()") { res ->
                runOnUiThread {
                    if (res == "true") return@runOnUiThread
                    if (wv.canGoBack()) {
                        wv.goBack()
                    } else {
                        val now = System.currentTimeMillis()
                        if (now - lastBackPressedAt < 2000L) {
                            finish()
                        } else {
                            lastBackPressedAt = now
                            Toast.makeText(this, "اضغط رجوع مرة أخرى للخروج من التطبيق", Toast.LENGTH_SHORT).show()
                        }
                    }
                }
            }
            return
        }
        super.onBackPressed()
    }

    private fun handleIncomingIntent(intent: Intent?) {
        if (intent == null) return
        val shortcut = intent.getStringExtra("SHORTCUT_ACTION")
        when (shortcut) {
            "MY_FOLDER" -> { startActivity(Intent(this, MyFolderActivity::class.java)); return }
            "WHITEBOARD" -> { startActivity(Intent(this, SmartWhiteboardActivity::class.java)); return }
            "BOOK_READER" -> { startActivity(Intent(this, MoonBookReaderActivity::class.java)); return }
            "ASSISTANT" -> {
                bridge?.webView?.postDelayed({
                    bridge?.webView?.evaluateJavascript("window.EduAssistant && window.EduAssistant.open && window.EduAssistant.open('ask');", null)
                }, 900)
                return
            }
        }

        val action = intent.action
        if (Intent.ACTION_SEND == action || Intent.ACTION_VIEW == action) {
            val uri: Uri? = if (Intent.ACTION_SEND == action) {
                @Suppress("DEPRECATION") intent.getParcelableExtra(Intent.EXTRA_STREAM)
            } else {
                intent.data
            }
            if (uri != null && (uri.scheme == "content" || uri.scheme == "file")) {
                importSharedUri(uri, intent.type ?: "*/*")
            }
        }
    }

    private fun importSharedUri(uri: Uri, mimeType: String) {
        ioExecutor.execute {
            try {
                var name = "shared_${System.currentTimeMillis()}"
                contentResolver.query(uri, null, null, null, null)?.use { c ->
                    val idx = c.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                    if (idx >= 0 && c.moveToFirst()) name = c.getString(idx) ?: name
                }
                val bytes = contentResolver.openInputStream(uri)?.use { it.readBytes() } ?: return@execute
                val res = EduFileSaver.saveBytes(this, bytes, name, mimeType)
                runOnUiThread {
                    if (res.ok) {
                        Toast.makeText(this, "✅ تم حفظ الملف في مجلدي: ${res.displayName}", Toast.LENGTH_LONG).show()
                        EduFileSaver.openFile(this, res.filePath, res.mimeType)
                    }
                }
            } catch (_: Exception) {}
        }
    }

    fun requestEssentialPermissions() {
        val needed = mutableListOf(
            Manifest.permission.CAMERA,
            Manifest.permission.RECORD_AUDIO
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            needed.add(Manifest.permission.POST_NOTIFICATIONS)
            needed.add(Manifest.permission.READ_MEDIA_IMAGES)
            needed.add(Manifest.permission.READ_MEDIA_VIDEO)
            needed.add(Manifest.permission.READ_MEDIA_AUDIO)
        } else {
            needed.add(Manifest.permission.READ_EXTERNAL_STORAGE)
            if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.Q) {
                needed.add(Manifest.permission.WRITE_EXTERNAL_STORAGE)
            }
        }
        val missing = needed.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (missing.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, missing.toTypedArray(), REQ_ALL_PERMS)
        }
    }

    override fun onDestroy() {
        authPopupDialog?.dismiss()
        ioExecutor.shutdownNow()
        super.onDestroy()
    }

    inner class EduTechAndroidBridge {
        @JavascriptInterface
        fun getAppVersion(): String = "3.2.1"

        @JavascriptInterface
        fun saveBase64File(base64Data: String, fileName: String, mimeType: String, subFolder: String?): String {
            val res = EduFileSaver.saveBase64(this@MainActivity, base64Data, fileName, mimeType)
            runOnUiThread {
                if (res.ok) {
                    Toast.makeText(
                        this@MainActivity,
                        "✅ تم الحفظ في Downloads/EduTech_Mindset/${res.category}/${res.displayName}",
                        Toast.LENGTH_LONG
                    ).show()
                } else {
                    Toast.makeText(this@MainActivity, "❌ تعذر الحفظ: ${res.error}", Toast.LENGTH_SHORT).show()
                }
            }
            return if (res.ok) res.filePath else ""
        }

        @JavascriptInterface
        fun shareSavedFile(filePath: String, mimeType: String) {
            runOnUiThread { EduFileSaver.shareFile(this@MainActivity, filePath, mimeType) }
        }

        @JavascriptInterface
        fun printPage(jobTitle: String?) {
            runOnUiThread {
                try {
                    val wv = bridge?.webView ?: return@runOnUiThread
                    val pm = getSystemService(Context.PRINT_SERVICE) as PrintManager
                    val name = jobTitle?.ifBlank { "EduTech Mindset Document" } ?: "EduTech Mindset Document"
                    val adapter = wv.createPrintDocumentAdapter(name)
                    pm.print(name, adapter, PrintAttributes.Builder().build())
                } catch (e: Exception) {
                    Toast.makeText(this@MainActivity, "تعذرت الطباعة: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }

        @JavascriptInterface
        fun openMyFolder() {
            runOnUiThread { startActivity(Intent(this@MainActivity, MyFolderActivity::class.java)) }
        }

        @JavascriptInterface
        fun openVault() = openMyFolder()

        @JavascriptInterface
        fun openFileManager() = openMyFolder()

        @JavascriptInterface
        fun openWhiteboard() {
            runOnUiThread { startActivity(Intent(this@MainActivity, SmartWhiteboardActivity::class.java)) }
        }

        @JavascriptInterface
        fun openBookReader() {
            runOnUiThread { startActivity(Intent(this@MainActivity, MoonBookReaderActivity::class.java)) }
        }

        // Alias used by fresh-drawer-music.js & v289-android-bridge.js
        @JavascriptInterface
        fun openBookshelf() = openBookReader()

        @JavascriptInterface
        fun openMediaPlayer(url: String?, title: String?) {
            runOnUiThread {
                val i = Intent(this@MainActivity, EduMediaPlayerActivity::class.java).apply {
                    putExtra("MEDIA_URL", url ?: "")
                    putExtra("MEDIA_TITLE", title ?: "EduTech Media")
                }
                startActivity(i)
            }
        }

        @JavascriptInterface
        fun startFloatingAi() {
            runOnUiThread {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this@MainActivity)) {
                    val i = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:$packageName"))
                    startActivity(i)
                    Toast.makeText(this@MainActivity, "فعّل إذن الظهور فوق التطبيقات لتشغيل المساعد العائم", Toast.LENGTH_LONG).show()
                } else {
                    val svc = Intent(this@MainActivity, EduFloatingAiService::class.java)
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) startForegroundService(svc) else startService(svc)
                    Toast.makeText(this@MainActivity, "✅ تم تفعيل فقاعة المساعد العائم فوق التطبيقات", Toast.LENGTH_SHORT).show()
                }
            }
        }

        @JavascriptInterface
        fun showFloatingAssistant() = startFloatingAi()

        @JavascriptInterface
        fun stopFloatingAi() {
            runOnUiThread {
                val svc = Intent(this@MainActivity, EduFloatingAiService::class.java).apply {
                    action = EduFloatingAiService.ACTION_STOP
                }
                startService(svc)
            }
        }

        @JavascriptInterface
        fun hideFloatingAssistant() = stopFloatingAi()

        @JavascriptInterface
        fun enterPiP() {
            runOnUiThread {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    try {
                        val params = PictureInPictureParams.Builder().setAspectRatio(Rational(16, 9)).build()
                        enterPictureInPictureMode(params)
                    } catch (_: Exception) {}
                }
            }
        }
    }
}
