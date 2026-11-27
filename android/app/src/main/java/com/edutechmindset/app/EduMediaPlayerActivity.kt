package com.edutechmindset.app

import android.app.AlertDialog
import android.app.PictureInPictureParams
import android.content.Context
import android.content.pm.ActivityInfo
import android.content.res.Configuration
import android.media.AudioManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Rational
import android.view.GestureDetector
import android.view.MotionEvent
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackParameters
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView
import kotlin.math.abs

class EduMediaPlayerActivity : AppCompatActivity() {

    private var player: ExoPlayer? = null
    private lateinit var playerView: PlayerView
    private lateinit var topBar: LinearLayout
    private lateinit var tvHud: TextView
    private lateinit var btnUnlock: Button

    private val speeds = floatArrayOf(0.5f, 0.75f, 1.0f, 1.25f, 1.5f, 2.0f)
    private var speedIndex = 2

    private val resizeModes = intArrayOf(
        AspectRatioFrameLayout.RESIZE_MODE_FIT,
        AspectRatioFrameLayout.RESIZE_MODE_FILL,
        AspectRatioFrameLayout.RESIZE_MODE_ZOOM
    )
    private val resizeLabels = arrayOf("تناسب (Fit)", "ملء الشاشة (Fill)", "تكبير (Zoom)")
    private var resizeIndex = 0

    private var isLocked = false
    private var isAudioOnly = false
    private val handler = Handler(Looper.getMainLooper())
    private val hideHudRunnable = Runnable { tvHud.visibility = View.GONE }
    private var sleepRunnable: Runnable? = null

    private lateinit var audioManager: AudioManager
    private var maxVolume = 15

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_edu_media_player)

        // Fix: accept MEDIA_URL, uri, or intent.data
        val uriStr = intent.getStringExtra("MEDIA_URL")
            ?: intent.getStringExtra("uri")
            ?: intent.data?.toString()
        if (uriStr.isNullOrBlank()) {
            Toast.makeText(this, "لم يتم تحديد ملف وسائط للتشغيل", Toast.LENGTH_SHORT).show()
            finish()
            return
        }
        val title = intent.getStringExtra("MEDIA_TITLE")
            ?: intent.getStringExtra("title")
            ?: "EduTech Media Player"

        isAudioOnly = uriStr.lowercase().let {
            it.endsWith(".mp3") || it.endsWith(".wav") || it.endsWith(".m4a") || it.endsWith(".ogg")
        }

        audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager
        maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC).coerceAtLeast(1)

        playerView = findViewById(R.id.eduPlayerView)
        topBar = findViewById(R.id.mediaTopBar)
        tvHud = findViewById(R.id.tvGestureHud)
        btnUnlock = findViewById(R.id.btnUnlockFloating)
        findViewById<TextView>(R.id.tvMediaTitle).text = title

        player = ExoPlayer.Builder(this).build().also { exo ->
            playerView.player = exo
            exo.setMediaItem(MediaItem.fromUri(Uri.parse(uriStr)))
            exo.prepare()
            exo.playWhenReady = true
        }

        setupToolbar()
        setupMxGestures()
    }

    private fun setupToolbar() {
        findViewById<Button>(R.id.btnMediaClose).setOnClickListener { finish() }

        val btnSpeed = findViewById<Button>(R.id.btnMediaSpeed)
        btnSpeed.setOnClickListener {
            speedIndex = (speedIndex + 1) % speeds.size
            val sp = speeds[speedIndex]
            player?.playbackParameters = PlaybackParameters(sp)
            btnSpeed.text = "${sp}x"
            showHud("⚡ السرعة ${sp}x")
        }

        findViewById<Button>(R.id.btnMediaResize).setOnClickListener {
            resizeIndex = (resizeIndex + 1) % resizeModes.size
            playerView.resizeMode = resizeModes[resizeIndex]
            showHud("⛶ ${resizeLabels[resizeIndex]}")
        }

        findViewById<Button>(R.id.btnMediaSleep).setOnClickListener { showSleepTimerDialog() }

        findViewById<Button>(R.id.btnMediaRotate).setOnClickListener {
            requestedOrientation = if (resources.configuration.orientation == Configuration.ORIENTATION_LANDSCAPE) {
                ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
            } else {
                ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
            }
        }

        findViewById<Button>(R.id.btnMediaLock).setOnClickListener { setScreenLocked(true) }
        btnUnlock.setOnClickListener { setScreenLocked(false) }

        findViewById<Button>(R.id.btnMediaPip).setOnClickListener {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                try {
                    enterPictureInPictureMode(
                        PictureInPictureParams.Builder().setAspectRatio(Rational(16, 9)).build()
                    )
                } catch (_: Exception) {}
            }
        }
    }

    private fun setScreenLocked(locked: Boolean) {
        isLocked = locked
        topBar.visibility = if (locked) View.GONE else View.VISIBLE
        btnUnlock.visibility = if (locked) View.VISIBLE else View.GONE
        playerView.useController = !locked
        showHud(if (locked) "🔒 تم قفل الشاشة" else "🔓 تم فتح القفل")
    }

    private fun showSleepTimerDialog() {
        val options = arrayOf("إلغاء المؤقت", "بعد 15 دقيقة", "بعد 30 دقيقة", "بعد 45 دقيقة", "بعد 60 دقيقة")
        val mins = intArrayOf(0, 15, 30, 45, 60)
        AlertDialog.Builder(this)
            .setTitle("⏱ مؤقت النوم التلقائي")
            .setItems(options) { _, which ->
                sleepRunnable?.let { handler.removeCallbacks(it) }
                val m = mins[which]
                if (m == 0) {
                    showHud("⏱ تم إلغاء مؤقت النوم")
                } else {
                    val r = Runnable {
                        player?.pause()
                        Toast.makeText(this, "⏱ تم إيقاف التشغيل تلقائياً (مؤقت النوم)", Toast.LENGTH_LONG).show()
                    }
                    sleepRunnable = r
                    handler.postDelayed(r, m * 60_000L)
                    showHud("⏱ سيتوقف التشغيل بعد $m دقيقة")
                }
            }
            .show()
    }

    private fun setupMxGestures() {
        val overlay = findViewById<View>(R.id.gestureOverlay)
        var gestureMode = 0 // 0=none, 1=brightness, 2=volume, 3=seek
        var startY = 0f
        var startX = 0f
        var startBrightness = 0.5f
        var startVolume = 0
        var startPos = 0L

        val detector = GestureDetector(this, object : GestureDetector.SimpleOnGestureListener() {
            override fun onSingleTapConfirmed(e: MotionEvent): Boolean {
                if (isLocked) return true
                if (topBar.visibility == View.VISIBLE) {
                    topBar.visibility = View.GONE
                    playerView.hideController()
                } else {
                    topBar.visibility = View.VISIBLE
                    playerView.showController()
                }
                return true
            }

            override fun onDoubleTap(e: MotionEvent): Boolean {
                if (isLocked) return true
                val exo = player ?: return true
                if (e.x < overlay.width / 2f) {
                    val target = (exo.currentPosition - 10_000L).coerceAtLeast(0L)
                    exo.seekTo(target)
                    showHud("⏪ -10 ثوانٍ")
                } else {
                    val target = (exo.currentPosition + 10_000L).coerceAtMost(exo.duration.coerceAtLeast(0L))
                    exo.seekTo(target)
                    showHud("⏩ +10 ثوانٍ")
                }
                return true
            }
        })

        overlay.setOnTouchListener { v, ev ->
            if (isLocked) return@setOnTouchListener true
            detector.onTouchEvent(ev)
            when (ev.actionMasked) {
                MotionEvent.ACTION_DOWN -> {
                    gestureMode = 0
                    startX = ev.x
                    startY = ev.y
                    val curB = window.attributes.screenBrightness
                    startBrightness = if (curB < 0f) 0.5f else curB
                    startVolume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC)
                    startPos = player?.currentPosition ?: 0L
                }
                MotionEvent.ACTION_MOVE -> {
                    val dx = ev.x - startX
                    val dy = startY - ev.y
                    if (gestureMode == 0 && (abs(dx) > 36 || abs(dy) > 36)) {
                        gestureMode = if (abs(dx) > abs(dy)) {
                            3
                        } else if (startX < v.width / 2f) {
                            1
                        } else {
                            2
                        }
                    }
                    when (gestureMode) {
                        1 -> { // Brightness (left vertical swipe)
                            val delta = dy / (v.height * 0.7f)
                            val nextB = (startBrightness + delta).coerceIn(0.05f, 1.0f)
                            val lp = window.attributes
                            lp.screenBrightness = nextB
                            window.attributes = lp
                            showHud("☀️ السطوع ${(nextB * 100).toInt()}%")
                        }
                        2 -> { // Volume (right vertical swipe)
                            val delta = (dy / (v.height * 0.65f)) * maxVolume
                            val nextV = (startVolume + delta.toInt()).coerceIn(0, maxVolume)
                            audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, nextV, 0)
                            showHud("🔊 الصوت ${(nextV * 100 / maxVolume)}%")
                        }
                        3 -> { // Seek (horizontal swipe)
                            val exo = player ?: return@setOnTouchListener true
                            val deltaMs = ((dx / v.width) * 90_000L).toLong()
                            val target = (startPos + deltaMs).coerceIn(0L, exo.duration.coerceAtLeast(0L))
                            exo.seekTo(target)
                            val sign = if (deltaMs >= 0) "+" else ""
                            showHud("${if (deltaMs >= 0) "⏩" else "⏪"} ${formatTime(target)} ($sign${deltaMs / 1000}s)")
                        }
                    }
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    gestureMode = 0
                }
            }
            true
        }
    }

    private fun showHud(msg: String) {
        tvHud.text = msg
        tvHud.visibility = View.VISIBLE
        handler.removeCallbacks(hideHudRunnable)
        handler.postDelayed(hideHudRunnable, 1200L)
    }

    private fun formatTime(ms: Long): String {
        val totalSec = (ms / 1000L).coerceAtLeast(0L)
        val m = totalSec / 60
        val s = totalSec % 60
        return String.format("%02d:%02d", m, s)
    }

    override fun onUserLeaveHint() {
        super.onUserLeaveHint()
        if (!isAudioOnly && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && player?.isPlaying == true) {
            try {
                enterPictureInPictureMode(
                    PictureInPictureParams.Builder().setAspectRatio(Rational(16, 9)).build()
                )
            } catch (_: Exception) {}
        }
    }

    override fun onPause() {
        super.onPause()
        // Allow background playback for audio files and PiP mode
        val inPip = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) isInPictureInPictureMode else false
        if (!isAudioOnly && !inPip) {
            player?.pause()
        }
    }

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        player?.release()
        player = null
        super.onDestroy()
    }
}
