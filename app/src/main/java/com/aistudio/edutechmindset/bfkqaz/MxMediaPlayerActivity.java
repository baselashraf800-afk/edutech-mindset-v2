package com.aistudio.edutechmindset.bfkqaz;

import android.app.Activity;
import android.app.PictureInPictureParams;
import android.content.Context;
import android.content.pm.ActivityInfo;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.PlaybackParams;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.util.Rational;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.HorizontalScrollView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.SeekBar;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.VideoView;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class MxMediaPlayerActivity extends Activity {

    private FrameLayout root;
    private VideoView videoView;
    private MediaPlayer activeMediaPlayer;
    private LinearLayout controlsOverlay;
    private TextView hudText;
    private TextView titleView;
    private TextView timeView;
    private SeekBar seekBar;
    private Button playPauseBtn;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private boolean controlsVisible = true;
    private boolean screenLocked = false;
    private float playbackSpeed = 1.0f;
    private int abStartMs = -1;
    private int abEndMs = -1;
    private boolean isPlayingMedia = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        root = new FrameLayout(this);
        root.setBackgroundColor(Color.BLACK);
        setContentView(root);

        String path = getIntent() != null ? getIntent().getStringExtra("file_path") : null;
        if (path != null && new File(path).exists()) {
            startPlayer(new File(path));
        } else {
            showMediaFolders();
        }
    }

    private List<File> collectMedia() {
        List<File> res = new ArrayList<>();
        File[] dirs = new File[]{
                new File(getFilesDir(), "EduTechVault"),
                new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES), "EduTechMindset"),
                new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MUSIC), "EduTechMindset"),
                Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
        };
        for (File d : dirs) {
            if (d == null || !d.exists() || !d.isDirectory()) continue;
            File[] list = d.listFiles();
            if (list == null) continue;
            for (File f : list) {
                String n = f.getName().toLowerCase();
                if (f.isFile() && (n.endsWith(".mp4") || n.endsWith(".webm") || n.endsWith(".mkv") || n.endsWith(".mp3") || n.endsWith(".wav") || n.endsWith(".m4a"))) {
                    res.add(f);
                }
            }
        }
        return res;
    }

    private void showMediaFolders() {
        root.removeAllViews();
        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setBackgroundColor(Color.parseColor("#0B1120"));
        box.setPadding(dp(16), dp(20), dp(16), dp(16));

        LinearLayout top = new LinearLayout(this);
        top.setOrientation(LinearLayout.HORIZONTAL);
        top.setGravity(Gravity.CENTER_VERTICAL);

        Button back = makeBtn("← رجوع", "#1E293B");
        back.setOnClickListener(v -> finish());
        top.addView(back);

        TextView hdr = new TextView(this);
        hdr.setText("🎬 مشغل الوسائط الاحترافي (MX Style)");
        hdr.setTextColor(Color.parseColor("#38BDF8"));
        hdr.setTextSize(TypedValue.COMPLEX_UNIT_SP, 17);
        hdr.setTypeface(Typeface.DEFAULT_BOLD);
        hdr.setGravity(Gravity.END | Gravity.CENTER_VERTICAL);
        hdr.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
        top.addView(hdr);
        box.addView(top);

        ScrollView scroll = new ScrollView(this);
        LinearLayout list = new LinearLayout(this);
        list.setOrientation(LinearLayout.VERTICAL);
        list.setPadding(0, dp(12), 0, dp(16));

        List<File> files = collectMedia();
        if (files.isEmpty()) {
            TextView empty = new TextView(this);
            empty.setText("لا توجد فيديوهات أو ملفات MP3 محفوظة حالياً.\nاحفظ أي درس صوتي أو فيديو تعليمي ليظهر هنا جاهزاً للتشغيل بالخلفية وإيماءات MX.");
            empty.setTextColor(Color.parseColor("#94A3B8"));
            empty.setGravity(Gravity.CENTER);
            empty.setPadding(dp(16), dp(48), dp(16), dp(48));
            list.addView(empty);
        } else {
            for (final File f : files) {
                LinearLayout card = new LinearLayout(this);
                card.setOrientation(LinearLayout.HORIZONTAL);
                card.setGravity(Gravity.CENTER_VERTICAL);
                card.setPadding(dp(12), dp(12), dp(12), dp(12));
                GradientDrawable bg = new GradientDrawable();
                bg.setCornerRadius(dp(14));
                bg.setColor(Color.parseColor("#1E293B"));
                card.setBackground(bg);
                LinearLayout.LayoutParams clp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
                clp.bottomMargin = dp(8);
                card.setLayoutParams(clp);

                TextView t = new TextView(this);
                boolean isAudio = f.getName().toLowerCase().endsWith(".mp3") || f.getName().toLowerCase().endsWith(".wav") || f.getName().toLowerCase().endsWith(".m4a");
                t.setText((isAudio ? "🎵 " : "🎬 ") + f.getName());
                t.setTextColor(Color.WHITE);
                t.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
                t.setTypeface(Typeface.DEFAULT_BOLD);
                t.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
                card.addView(t);

                Button play = makeBtn("تشغيل ▶", "#0284C7");
                play.setOnClickListener(v -> startPlayer(f));
                card.addView(play);
                card.setOnClickListener(v -> startPlayer(f));
                list.addView(card);
            }
        }
        scroll.addView(list);
        box.addView(scroll, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));
        root.addView(box);
    }

    private void startPlayer(final File file) {
        root.removeAllViews();
        videoView = new VideoView(this);
        FrameLayout.LayoutParams vlp = new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
        vlp.gravity = Gravity.CENTER;
        videoView.setLayoutParams(vlp);
        root.addView(videoView);

        // HUD لإيماءات السحب (سطوع / صوت / تقديم)
        hudText = new TextView(this);
        hudText.setTextColor(Color.WHITE);
        hudText.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16);
        hudText.setTypeface(Typeface.DEFAULT_BOLD);
        GradientDrawable hudBg = new GradientDrawable();
        hudBg.setCornerRadius(dp(14));
        hudBg.setColor(Color.parseColor("#B30F172A"));
        hudText.setBackground(hudBg);
        hudText.setPadding(dp(18), dp(10), dp(18), dp(10));
        hudText.setVisibility(View.GONE);
        FrameLayout.LayoutParams hlp = new FrameLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        hlp.gravity = Gravity.CENTER;
        root.addView(hudText, hlp);

        buildOverlayControls(file.getName());
        attachMxGestures();

        videoView.setVideoURI(Uri.fromFile(file));
        videoView.setOnPreparedListener(mp -> {
            activeMediaPlayer = mp;
            isPlayingMedia = true;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                try {
                    PlaybackParams pp = mp.getPlaybackParams();
                    pp.setSpeed(playbackSpeed);
                    mp.setPlaybackParams(pp);
                } catch (Exception ignored) {}
            }
            seekBar.setMax(Math.max(1, videoView.getDuration()));
            videoView.start();
            startProgressLoop();
        });
        videoView.setOnCompletionListener(mp -> {
            isPlayingMedia = false;
            playPauseBtn.setText("▶");
        });
    }

    private void buildOverlayControls(String fileName) {
        controlsOverlay = new LinearLayout(this);
        controlsOverlay.setOrientation(LinearLayout.VERTICAL);
        controlsOverlay.setBackgroundColor(Color.parseColor("#66000000"));
        controlsOverlay.setPadding(dp(12), dp(14), dp(12), dp(14));

        // شريط علوي
        LinearLayout top = new LinearLayout(this);
        top.setOrientation(LinearLayout.HORIZONTAL);
        top.setGravity(Gravity.CENTER_VERTICAL);

        Button back = makeBtn("←", "#334155");
        back.setOnClickListener(v -> finish());
        top.addView(back);

        titleView = new TextView(this);
        titleView.setText(fileName);
        titleView.setTextColor(Color.WHITE);
        titleView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        titleView.setTypeface(Typeface.DEFAULT_BOLD);
        titleView.setPadding(dp(8), 0, dp(8), 0);
        titleView.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
        top.addView(titleView);
        controlsOverlay.addView(top);

        // شريط أدوات MX الأفقي
        HorizontalScrollView hsv = new HorizontalScrollView(this);
        LinearLayout mxTools = new LinearLayout(this);
        mxTools.setOrientation(LinearLayout.HORIZONTAL);
        mxTools.setPadding(0, dp(8), 0, dp(8));

        final Button speedBtn = makeBtn("1.0x سرعة", "#1E293B");
        speedBtn.setOnClickListener(v -> {
            float[] speeds = {1.0f, 1.25f, 1.5f, 2.0f, 0.75f};
            int next = 0;
            for (int i = 0; i < speeds.length; i++) if (Math.abs(speeds[i] - playbackSpeed) < 0.05f) next = (i + 1) % speeds.length;
            playbackSpeed = speeds[next];
            speedBtn.setText(playbackSpeed + "x سرعة");
            if (activeMediaPlayer != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                try {
                    PlaybackParams pp = activeMediaPlayer.getPlaybackParams();
                    pp.setSpeed(playbackSpeed);
                    activeMediaPlayer.setPlaybackParams(pp);
                } catch (Exception ignored) {}
            }
        });
        mxTools.addView(speedBtn);

        Button abBtn = makeBtn("🔁 تكرار A-B", "#1E293B");
        abBtn.setOnClickListener(v -> {
            if (abStartMs < 0) {
                abStartMs = videoView.getCurrentPosition();
                Toast.makeText(this, "تم تحديد نقطة البداية A", Toast.LENGTH_SHORT).show();
            } else if (abEndMs < 0) {
                abEndMs = videoView.getCurrentPosition();
                Toast.makeText(this, "تم تفعيل تكرار A-B 🔁", Toast.LENGTH_SHORT).show();
            } else {
                abStartMs = -1; abEndMs = -1;
                Toast.makeText(this, "تم إلغاء تكرار A-B", Toast.LENGTH_SHORT).show();
            }
        });
        mxTools.addView(abBtn);

        Button sleepBtn = makeBtn("⏱️ مؤقت 15د", "#1E293B");
        sleepBtn.setOnClickListener(v -> {
            handler.postDelayed(() -> {
                if (videoView != null && videoView.isPlaying()) videoView.pause();
            }, 15 * 60 * 1000L);
            Toast.makeText(this, "تم ضبط مؤقت النوم على 15 دقيقة ⏱️", Toast.LENGTH_SHORT).show();
        });
        mxTools.addView(sleepBtn);

        Button rotBtn = makeBtn("🔄 تدوير", "#1E293B");
        rotBtn.setOnClickListener(v -> {
            int cur = getRequestedOrientation();
            setRequestedOrientation(cur == ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE ? ActivityInfo.SCREEN_ORIENTATION_PORTRAIT : ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
        });
        mxTools.addView(rotBtn);

        Button pipBtn = makeBtn("🖼️ صورة في صورة", "#0284C7");
        pipBtn.setOnClickListener(v -> enterPipNow());
        mxTools.addView(pipBtn);

        hsv.addView(mxTools);
        controlsOverlay.addView(hsv);

        View spacer = new View(this);
        spacer.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));
        controlsOverlay.addView(spacer);

        // شريط التقدم + أزرار التشغيل السفلية
        seekBar = new SeekBar(this);
        seekBar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override public void onProgressChanged(SeekBar sb, int progress, boolean fromUser) {
                if (fromUser && videoView != null) videoView.seekTo(progress);
            }
            @Override public void onStartTrackingTouch(SeekBar sb) {}
            @Override public void onStopTrackingTouch(SeekBar sb) {}
        });
        controlsOverlay.addView(seekBar);

        LinearLayout bottom = new LinearLayout(this);
        bottom.setOrientation(LinearLayout.HORIZONTAL);
        bottom.setGravity(Gravity.CENTER_VERTICAL);
        bottom.setPadding(0, dp(6), 0, 0);

        Button lockBtn = makeBtn("🔓 قفل", "#334155");
        lockBtn.setOnClickListener(v -> {
            screenLocked = !screenLocked;
            lockBtn.setText(screenLocked ? "🔒 مقفول" : "🔓 قفل");
            Toast.makeText(this, screenLocked ? "تم قفل الشاشة ضد اللمس الخاطئ 🔒" : "تم فتح القفل 🔓", Toast.LENGTH_SHORT).show();
        });
        bottom.addView(lockBtn);

        timeView = new TextView(this);
        timeView.setText("00:00 / 00:00");
        timeView.setTextColor(Color.WHITE);
        timeView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
        timeView.setGravity(Gravity.CENTER);
        timeView.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
        bottom.addView(timeView);

        Button rwBtn = makeBtn("-10ث", "#1E293B");
        rwBtn.setOnClickListener(v -> { if (videoView != null) videoView.seekTo(Math.max(0, videoView.getCurrentPosition() - 10000)); });
        bottom.addView(rwBtn);

        playPauseBtn = makeBtn("⏸", "#0284C7");
        playPauseBtn.setOnClickListener(v -> {
            if (videoView == null) return;
            if (videoView.isPlaying()) {
                videoView.pause();
                isPlayingMedia = false;
                playPauseBtn.setText("▶");
            } else {
                videoView.start();
                isPlayingMedia = true;
                playPauseBtn.setText("⏸");
            }
        });
        bottom.addView(playPauseBtn);

        Button ffBtn = makeBtn("+10ث", "#1E293B");
        ffBtn.setOnClickListener(v -> { if (videoView != null) videoView.seekTo(Math.min(videoView.getDuration(), videoView.getCurrentPosition() + 10000)); });
        bottom.addView(ffBtn);

        controlsOverlay.addView(bottom);
        root.addView(controlsOverlay, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
    }

    private void attachMxGestures() {
        final AudioManager am = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        final float[] downX = {0}, downY = {0};
        final boolean[] moved = {false};
        root.setOnTouchListener((v, ev) -> {
            if (screenLocked) {
                if (ev.getAction() == MotionEvent.ACTION_UP) showHud("🔒 الشاشة مقفولة — اضغط زر القفل للفتح");
                return true;
            }
            int w = root.getWidth();
            switch (ev.getAction()) {
                case MotionEvent.ACTION_DOWN:
                    downX[0] = ev.getX(); downY[0] = ev.getY(); moved[0] = false;
                    return true;
                case MotionEvent.ACTION_MOVE:
                    float dx = ev.getX() - downX[0];
                    float dy = downY[0] - ev.getY();
                    if (Math.abs(dx) > 32 && Math.abs(dx) > Math.abs(dy)) {
                        moved[0] = true;
                        int deltaMs = (int) (dx * 40);
                        if (videoView != null) {
                            int target = Math.max(0, Math.min(videoView.getDuration(), videoView.getCurrentPosition() + deltaMs));
                            videoView.seekTo(target);
                            showHud("⏩ " + fmtTime(target));
                        }
                        downX[0] = ev.getX();
                    } else if (Math.abs(dy) > 24) {
                        moved[0] = true;
                        if (ev.getX() > w / 2f) {
                            WindowManager.LayoutParams lp = getWindow().getAttributes();
                            float curB = lp.screenBrightness < 0 ? 0.5f : lp.screenBrightness;
                            float nb = Math.max(0.05f, Math.min(1f, curB + (dy / 600f)));
                            lp.screenBrightness = nb;
                            getWindow().setAttributes(lp);
                            showHud("☀️ السطوع: " + Math.round(nb * 100) + "%");
                        } else if (am != null) {
                            int max = am.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
                            int cur = am.getStreamVolume(AudioManager.STREAM_MUSIC);
                            int nv = Math.max(0, Math.min(max, cur + (dy > 0 ? 1 : -1)));
                            am.setStreamVolume(AudioManager.STREAM_MUSIC, nv, 0);
                            showHud("🔊 الصوت: " + Math.round((nv * 100f) / Math.max(1, max)) + "%");
                        }
                        downY[0] = ev.getY();
                    }
                    return true;
                case MotionEvent.ACTION_UP:
                    if (!moved[0] && controlsOverlay != null) {
                        controlsVisible = !controlsVisible;
                        controlsOverlay.setVisibility(controlsVisible ? View.VISIBLE : View.GONE);
                    }
                    return true;
            }
            return false;
        });
    }

    private void showHud(String msg) {
        if (hudText == null) return;
        hudText.setText(msg);
        hudText.setVisibility(View.VISIBLE);
        handler.removeCallbacks(hideHudTask);
        handler.postDelayed(hideHudTask, 900);
    }

    private final Runnable hideHudTask = () -> {
        if (hudText != null) hudText.setVisibility(View.GONE);
    };

    private void startProgressLoop() {
        handler.postDelayed(new Runnable() {
            @Override public void run() {
                if (videoView != null && videoView.isPlaying()) {
                    int pos = videoView.getCurrentPosition();
                    int dur = videoView.getDuration();
                    if (seekBar != null) seekBar.setProgress(pos);
                    if (timeView != null) timeView.setText(fmtTime(pos) + " / " + fmtTime(dur));
                    if (abStartMs >= 0 && abEndMs > abStartMs && pos >= abEndMs) {
                        videoView.seekTo(abStartMs);
                    }
                }
                if (!isFinishing()) handler.postDelayed(this, 500);
            }
        }, 500);
    }

    private void enterPipNow() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                if (controlsOverlay != null) controlsOverlay.setVisibility(View.GONE);
                PictureInPictureParams params = new PictureInPictureParams.Builder()
                        .setAspectRatio(new Rational(16, 9))
                        .build();
                enterPictureInPictureMode(params);
            } catch (Exception ignored) {}
        }
    }

    @Override
    protected void onUserLeaveHint() {
        super.onUserLeaveHint();
        if (isPlayingMedia) enterPipNow();
    }

    private String fmtTime(int ms) {
        int totalSec = Math.max(0, ms / 1000);
        int m = totalSec / 60;
        int s = totalSec % 60;
        return String.format("%02d:%02d", m, s);
    }

    private Button makeBtn(String text, String hex) {
        Button b = new Button(this);
        b.setText(text);
        b.setTextColor(Color.WHITE);
        b.setTextSize(TypedValue.COMPLEX_UNIT_SP, 11.5f);
        b.setTypeface(Typeface.DEFAULT_BOLD);
        GradientDrawable g = new GradientDrawable();
        g.setCornerRadius(dp(10));
        g.setColor(Color.parseColor(hex));
        b.setBackground(g);
        b.setPadding(dp(10), dp(4), dp(10), dp(4));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, dp(34));
        lp.setMargins(dp(3), 0, dp(3), 0);
        b.setLayoutParams(lp);
        return b;
    }

    private int dp(int v) {
        return Math.round(v * getResources().getDisplayMetrics().density);
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacksAndMessages(null);
        super.onDestroy();
    }
}
