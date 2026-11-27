package com.edutechmindset.app

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.webkit.CookieManager
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
    }

    private fun configureWebViewForAuthAndMedia() {
        try {
            val wv = bridge?.webView ?: return
            val settings = wv.settings
            settings.domStorageEnabled = true
            settings.databaseEnabled = true
            settings.mediaPlaybackRequiresUserGesture = false
            settings.javaScriptCanOpenWindowsAutomatically = true
            // إزالة علامة "; wv" حتى يسمح Google OAuth بتسجيل الدخول بسلاسة داخل التطبيق دون الخروج لمتصفح خارجي
            val ua = settings.userAgentString ?: ""
            if (ua.contains("; wv")) {
                settings.userAgentString = ua.replace("; wv", "")
            }
            val cm = CookieManager.getInstance()
            cm.setAcceptCookie(true)
            cm.setAcceptThirdPartyCookies(wv, true)
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
}
