package com.aistudio.edutechmindset.bfkqaz;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.VideoView;

public class IntroVideoOverlay {

    private static boolean dismissed = false;

    public static void show(final Activity activity,
                            final ViewGroup rootContainer,
                            final SoundEngine soundEngine,
                            final Runnable onComplete) {
        if (activity == null || rootContainer == null) {
            if (onComplete != null) onComplete.run();
            return;
        }
        dismissed = false;
        final Handler handler = new Handler(Looper.getMainLooper());

        final FrameLayout overlay = new FrameLayout(activity);
        overlay.setLayoutParams(new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
        overlay.setBackgroundColor(Color.parseColor("#0A1224"));
        overlay.setClickable(true);
        overlay.setFocusable(true);

        final VideoView videoView = new VideoView(activity);
        FrameLayout.LayoutParams videoLp = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT,
                Gravity.CENTER
        );
        videoView.setLayoutParams(videoLp);
        overlay.addView(videoView);

        // Post-completion card container (hidden while video plays; NO skip button allowed)
        final LinearLayout postCard = new LinearLayout(activity);
        postCard.setOrientation(LinearLayout.VERTICAL);
        postCard.setGravity(Gravity.CENTER);
        int pad = dp(activity, 20);
        postCard.setPadding(pad, pad, pad, pad);
        postCard.setVisibility(View.GONE);

        GradientDrawable cardBg = new GradientDrawable(
                GradientDrawable.Orientation.TOP_BOTTOM,
                new int[]{Color.parseColor("#DD0F172A"), Color.parseColor("#EE1E293B")}
        );
        cardBg.setCornerRadius(dp(activity, 22));
        cardBg.setStroke(dp(activity, 2), Color.parseColor("#38BDF8"));
        postCard.setBackground(cardBg);

        FrameLayout.LayoutParams cardLp = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL
        );
        int margin = dp(activity, 24);
        cardLp.setMargins(margin, margin, margin, dp(activity, 42));
        postCard.setLayoutParams(cardLp);

        TextView welcomeTitle = new TextView(activity);
        welcomeTitle.setText("EduTech Mindset | عقلية التعليم والتكنولوجيا");
        welcomeTitle.setTextColor(Color.WHITE);
        welcomeTitle.setTextSize(TypedValue.COMPLEX_UNIT_SP, 17);
        welcomeTitle.setTypeface(Typeface.DEFAULT_BOLD);
        welcomeTitle.setGravity(Gravity.CENTER);
        postCard.addView(welcomeTitle);

        final TextView autoTimerText = new TextView(activity);
        autoTimerText.setText("اكتمل العرض الترحيبي • جاري الدخول التلقائي...");
        autoTimerText.setTextColor(Color.parseColor("#94A3B8"));
        autoTimerText.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
        autoTimerText.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams subLp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
        subLp.topMargin = dp(activity, 6);
        subLp.bottomMargin = dp(activity, 14);
        autoTimerText.setLayoutParams(subLp);
        postCard.addView(autoTimerText);

        Button enterBtn = new Button(activity);
        enterBtn.setText("🚀 ادخل التطبيق");
        enterBtn.setTextColor(Color.WHITE);
        enterBtn.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16);
        enterBtn.setTypeface(Typeface.DEFAULT_BOLD);
        GradientDrawable btnBg = new GradientDrawable(
                GradientDrawable.Orientation.LEFT_RIGHT,
                new int[]{Color.parseColor("#0284C7"), Color.parseColor("#2563EB")}
        );
        btnBg.setCornerRadius(dp(activity, 14));
        enterBtn.setBackground(btnBg);
        LinearLayout.LayoutParams btnLp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                dp(activity, 50)
        );
        enterBtn.setLayoutParams(btnLp);
        postCard.addView(enterBtn);

        overlay.addView(postCard);
        rootContainer.addView(overlay);

        final Runnable finishAndEnter = () -> {
            if (dismissed) return;
            dismissed = true;
            handler.removeCallbacksAndMessages(null);
            try {
                if (videoView.isPlaying()) {
                    videoView.stopPlayback();
                }
            } catch (Exception ignored) {
            }
            overlay.animate()
                    .alpha(0f)
                    .setDuration(320)
                    .withEndAction(() -> {
                        try {
                            rootContainer.removeView(overlay);
                        } catch (Exception ignored) {
                        }
                        if (onComplete != null) onComplete.run();
                    })
                    .start();
        };

        enterBtn.setOnClickListener(v -> {
            if (soundEngine != null) soundEngine.playClick();
            finishAndEnter.run();
        });

        final Runnable showPostCardAndAutoEnter = () -> {
            if (dismissed) return;
            postCard.setAlpha(0f);
            postCard.setVisibility(View.VISIBLE);
            postCard.animate().alpha(1f).setDuration(250).start();
            if (soundEngine != null) soundEngine.playSuccess();
            // Auto-enter after 3.5 seconds (3500 ms)
            handler.postDelayed(finishAndEnter, 3500L);
        };

        try {
            Uri videoUri = Uri.parse("android.resource://" + activity.getPackageName() + "/" + R.raw.intro_video);
            videoView.setVideoURI(videoUri);
            videoView.setOnPreparedListener((MediaPlayer mp) -> {
                mp.setLooping(false);
                if (soundEngine != null && soundEngine.isMuted()) {
                    mp.setVolume(0f, 0f);
                }
                videoView.start();
            });
            videoView.setOnCompletionListener(mp -> showPostCardAndAutoEnter.run());
            videoView.setOnErrorListener((mp, what, extra) -> {
                showPostCardAndAutoEnter.run();
                return true;
            });
        } catch (Exception e) {
            showPostCardAndAutoEnter.run();
        }
    }

    private static int dp(Activity activity, int dp) {
        return Math.round(dp * activity.getResources().getDisplayMetrics().density);
    }
}
