package com.edutechmindset.app

import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.media.MediaPlayer
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity

class EduSplashActivity : AppCompatActivity() {
    private var mediaPlayer: MediaPlayer? = null
    private var entered = false
    private var audioCompleted = false
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
                fun onSplashDone() {
                    // Only enter if audio has finished (so voice is NEVER cut off)
                    if (audioCompleted) runOnUiThread { enterApp() }
                }
            }, "EduSplashBridge")
            loadUrl("file:///android_asset/edu_cinematic_splash.html")
        }
        root.addView(wv)

        val skipBtn = Button(this).apply {
            text = "تخطي ⏭"
            setTextColor(Color.WHITE)
            textSize = 13f
            isAllCaps = false
            background = GradientDrawable().apply {
                setColor(Color.parseColor("#880F172A"))
                cornerRadius = 40f
                setStroke(2, Color.parseColor("#38BDF8"))
            }
            setPadding(34, 14, 34, 14)
            setOnClickListener { enterApp() }
        }
        root.addView(
            skipBtn,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.WRAP_CONTENT,
                FrameLayout.LayoutParams.WRAP_CONTENT,
                Gravity.BOTTOM or Gravity.END
            ).apply { setMargins(0, 0, 36, 56) }
        )

        setContentView(root)
        playFullIntroAudio()
    }

    private fun playFullIntroAudio() {
        try {
            val afd = assets.openFd("public/assets/audio-pack/welcome_ar.mp3")
            val mp = MediaPlayer()
            mediaPlayer = mp
            mp.setDataSource(afd.fileDescriptor, afd.startOffset, afd.length)
            afd.close()
            mp.setOnPreparedListener { player ->
                val dur = player.duration.coerceIn(3500, 28000)
                handler.postDelayed(fallbackRunnable, dur + 1200L)
                player.start()
            }
            mp.setOnCompletionListener {
                audioCompleted = true
                handler.postDelayed({ enterApp() }, 600L)
            }
            mp.setOnErrorListener { _, _, _ ->
                audioCompleted = true
                handler.postDelayed(fallbackRunnable, 4000L)
                true
            }
            mp.prepareAsync()
        } catch (_: Exception) {
            audioCompleted = true
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
