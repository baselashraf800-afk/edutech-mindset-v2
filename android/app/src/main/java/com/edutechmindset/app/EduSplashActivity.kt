package com.edutechmindset.app

import android.content.Intent
import android.graphics.Color
import android.media.MediaPlayer
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity

class EduSplashActivity : AppCompatActivity() {
    private var mediaPlayer: MediaPlayer? = null
    private var entered = false
    private val handler = Handler(Looper.getMainLooper())
    private val fallbackRunnable = Runnable { enterApp() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val root = FrameLayout(this).apply {
            setBackgroundColor(Color.parseColor("#020617"))
        }

        val wv = WebView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(Color.parseColor("#020617"))
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.allowFileAccess = true
            settings.mediaPlaybackRequiresUserGesture = false
            settings.cacheMode = WebSettings.LOAD_NO_CACHE
            webViewClient = WebViewClient()
            addJavascriptInterface(object {
                @JavascriptInterface
                fun skip() {
                    runOnUiThread { enterApp() }
                }

                @JavascriptInterface
                fun onSplashDone() {
                    // Wait for audio completion unless user taps skip
                }
            }, "EduSplashBridge")
            loadUrl("file:///android_asset/edu_cinematic_splash.html")
        }
        root.addView(wv)
        setContentView(root)
        playOriginal300IntroAudio()
    }

    private fun playOriginal300IntroAudio() {
        try {
            // Use the exact rich cinematic intro audio extracted from EduTech-Mindset-3.0.0.apk
            val afd = assets.openFd("edu_intro_300.mp3")
            val mp = MediaPlayer()
            mediaPlayer = mp
            mp.setDataSource(afd.fileDescriptor, afd.startOffset, afd.length)
            afd.close()
            mp.setOnPreparedListener { player ->
                val dur = player.duration.coerceIn(4000, 32000)
                handler.postDelayed(fallbackRunnable, dur + 1000L)
                player.start()
            }
            mp.setOnCompletionListener {
                handler.postDelayed({ enterApp() }, 450L)
            }
            mp.setOnErrorListener { _, _, _ ->
                handler.postDelayed(fallbackRunnable, 4000L)
                true
            }
            mp.prepareAsync()
        } catch (_: Exception) {
            handler.postDelayed(fallbackRunnable, 4000L)
        }
    }

    private fun enterApp() {
        if (entered) return
        entered = true
        handler.removeCallbacksAndMessages(null)
        try {
            mediaPlayer?.stop()
            mediaPlayer?.release()
        } catch (_: Exception) {}
        mediaPlayer = null
        startActivity(Intent(this, MainActivity::class.java))
        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
        finish()
    }

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        try { mediaPlayer?.release() } catch (_: Exception) {}
        super.onDestroy()
    }
}
