package com.edutechmindset.app

import android.app.PictureInPictureParams
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Rational
import android.widget.ImageButton
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackParameters
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView

class EduMediaPlayerActivity : AppCompatActivity() {
    private var player: ExoPlayer? = null
    private var speedIndex = 1
    private val speeds = floatArrayOf(0.75f, 1.0f, 1.25f, 1.5f, 2.0f)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_edu_media_player)

        val uriStr = intent.getStringExtra("uri") ?: return finish()
        val title = intent.getStringExtra("title") ?: "EduTech Media Player"

        findViewById<TextView>(R.id.tvMediaTitle).text = title
        val playerView = findViewById<PlayerView>(R.id.eduPlayerView)

        player = ExoPlayer.Builder(this).build().also { exo ->
            playerView.player = exo
            exo.setMediaItem(MediaItem.fromUri(Uri.parse(uriStr)))
            exo.prepare()
            exo.playWhenReady = true
        }

        findViewById<ImageButton>(R.id.btnMediaClose).setOnClickListener { finish() }
        findViewById<ImageButton>(R.id.btnMediaSpeed).setOnClickListener {
            speedIndex = (speedIndex + 1) % speeds.size
            player?.playbackParameters = PlaybackParameters(speeds[speedIndex])
        }
        findViewById<ImageButton>(R.id.btnMediaPip).setOnClickListener {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                enterPictureInPictureMode(
                    PictureInPictureParams.Builder().setAspectRatio(Rational(16, 9)).build()
                )
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        player?.release()
        player = null
    }
}
