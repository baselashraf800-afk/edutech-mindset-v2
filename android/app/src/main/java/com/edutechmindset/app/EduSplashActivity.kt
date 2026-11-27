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
import android.widget.Button
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity

class EduSplashActivity : AppCompatActivity() {
    private var mediaPlayer: MediaPlayer? = null
    private var entered = false
    private val handler = Handler(Looper.getMainLooper())
    private val fallbackRunnable = Runnable { enterApp() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_edu_splash)

        // Add sleek Skip button so the user can enter early if desired, while full audio plays by default
        val root = findViewById<ViewGroup>(android.R.id.content)
        val skipBtn = Button(this).apply {
            text = "تخطي ⏭"
            setTextColor(Color.WHITE)
            textSize = 13f
            isAllCaps = false
            background = GradientDrawable().apply {
                setColor(Color.parseColor("#660F172A"))
                cornerRadius = 40f
                setStroke(2, Color.parseColor("#38BDF8"))
            }
            setPadding(34, 14, 34, 14)
            setOnClickListener { enterApp() }
        }
        val lp = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.WRAP_CONTENT,
            FrameLayout.LayoutParams.WRAP_CONTENT,
            Gravity.BOTTOM or Gravity.END
        ).apply {
            setMargins(0, 0, 36, 56)
        }
        root.addView(skipBtn, lp)

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
                val dur = player.duration.coerceIn(2500, 22000)
                handler.postDelayed(fallbackRunnable, dur + 700L)
                player.start()
            }
            mp.setOnCompletionListener {
                handler.postDelayed({ enterApp() }, 350L)
            }
            mp.setOnErrorListener { _, _, _ ->
                handler.postDelayed(fallbackRunnable, 1800L)
                true
            }
            mp.prepareAsync()
        } catch (_: Exception) {
            handler.postDelayed(fallbackRunnable, 1800L)
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
