package com.edutechmindset.app

import android.Manifest
import android.app.PictureInPictureParams
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.print.PrintAttributes
import android.print.PrintManager
import android.provider.OpenableColumns
import android.provider.Settings
import android.util.Rational
import android.webkit.CookieManager
import android.webkit.JavascriptInterface
import android.widget.Toast
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    companion object {
        const val REQ_ALL_PERMS = 2801
    }

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

    private fun configureWebViewForAuthAndMedia() {
        try {
            val wv = bridge?.webView ?: return
            val settings = wv.settings
            settings.domStorageEnabled = true
            settings.databaseEnabled = true
            settings.mediaPlaybackRequiresUserGesture = false
            settings.javaScriptCanOpenWindowsAutomatically = true
            val ua = settings.userAgentString ?: ""
            if (ua.contains("; wv")) {
                settings.userAgentString = ua.replace("; wv", "")
            }
            if (!settings.userAgentString.contains("EduTechMindsetApp")) {
                settings.userAgentString = "${settings.userAgentString} EduTechMindsetApp/3.1.0"
            }
            val cm = CookieManager.getInstance()
            cm.setAcceptCookie(true)
            cm.setAcceptThirdPartyCookies(wv, true)
            wv.addJavascriptInterface(EduTechAndroidBridge(), "EduTechAndroid")
        } catch (_: Exception) {}
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
        try {
            var name = "shared_${System.currentTimeMillis()}"
            contentResolver.query(uri, null, null, null, null)?.use { c ->
                val idx = c.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (idx >= 0 && c.moveToFirst()) name = c.getString(idx) ?: name
            }
            val bytes = contentResolver.openInputStream(uri)?.use { it.readBytes() } ?: return
            val res = EduFileSaver.saveBytes(this, bytes, name, mimeType)
            if (res.ok) {
                Toast.makeText(this, "✅ تم حفظ الملف في مجلدي: ${res.displayName}", Toast.LENGTH_LONG).show()
                EduFileSaver.openFile(this, res.filePath, res.mimeType)
            }
        } catch (_: Exception) {}
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

    inner class EduTechAndroidBridge {
        @JavascriptInterface
        fun getAppVersion(): String = "3.1.0"

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
        fun openWhiteboard() {
            runOnUiThread { startActivity(Intent(this@MainActivity, SmartWhiteboardActivity::class.java)) }
        }

        @JavascriptInterface
        fun openBookReader() {
            runOnUiThread { startActivity(Intent(this@MainActivity, MoonBookReaderActivity::class.java)) }
        }

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
        fun stopFloatingAi() {
            runOnUiThread {
                val svc = Intent(this@MainActivity, EduFloatingAiService::class.java).apply {
                    action = EduFloatingAiService.ACTION_STOP
                }
                startService(svc)
            }
        }

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
