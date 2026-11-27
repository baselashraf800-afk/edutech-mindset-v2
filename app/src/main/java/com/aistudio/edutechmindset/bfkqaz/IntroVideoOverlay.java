package com.aistudio.edutechmindset.bfkqaz;

import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.animation.PropertyValuesHolder;
import android.animation.ValueAnimator;
import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Handler;
import android.os.Looper;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.view.animation.OvershootInterpolator;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

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
                ViewGroup.LayoutParams.MATCH_PARENT));

        GradientDrawable bg = new GradientDrawable(
                GradientDrawable.Orientation.TL_BR,
                new int[]{Color.parseColor("#020617"), Color.parseColor("#0F172A"), Color.parseColor("#1E1B4B")});
        overlay.setBackground(bg);

        // جزيئات ضوئية متحركة في الخلفية
        for (int i = 0; i < 8; i++) {
            final View star = new View(activity);
            int sz = dp(activity, (i % 3 == 0) ? 8 : 5);
            FrameLayout.LayoutParams slp = new FrameLayout.LayoutParams(sz, sz);
            slp.gravity = Gravity.TOP | Gravity.START;
            slp.leftMargin = dp(activity, 30 + (i * 42) % 300);
            slp.topMargin = dp(activity, 80 + (i * 75) % 480);
            star.setLayoutParams(slp);
            GradientDrawable sd = new GradientDrawable();
            sd.setShape(GradientDrawable.OVAL);
            sd.setColor(i % 2 == 0 ? Color.parseColor("#FBBF24") : Color.parseColor("#38BDF8"));
            star.setBackground(sd);
            star.setAlpha(0.2f);
            overlay.addView(star);

            ObjectAnimator twinkle = ObjectAnimator.ofPropertyValuesHolder(
                    star,
                    PropertyValuesHolder.ofFloat(View.ALPHA, 0.15f, 0.85f),
                    PropertyValuesHolder.ofFloat(View.SCALE_X, 0.8f, 1.4f),
                    PropertyValuesHolder.ofFloat(View.SCALE_Y, 0.8f, 1.4f),
                    PropertyValuesHolder.ofFloat(View.TRANSLATION_Y, 0f, -dp(activity, 18))
            );
            twinkle.setDuration(1400 + (i * 220L));
            twinkle.setRepeatCount(ValueAnimator.INFINITE);
            twinkle.setRepeatMode(ValueAnimator.REVERSE);
            twinkle.start();
        }

        LinearLayout centerBox = new LinearLayout(activity);
        centerBox.setOrientation(LinearLayout.VERTICAL);
        centerBox.setGravity(Gravity.CENTER);
        FrameLayout.LayoutParams clp = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT);
        clp.gravity = Gravity.CENTER;
        clp.setMargins(dp(activity, 28), 0, dp(activity, 28), 0);
        centerBox.setLayoutParams(clp);

        // هالة مضيئة حول الشعار
        FrameLayout logoHalo = new FrameLayout(activity);
        LinearLayout.LayoutParams hlp = new LinearLayout.LayoutParams(dp(activity, 146), dp(activity, 146));
        hlp.gravity = Gravity.CENTER_HORIZONTAL;
        logoHalo.setLayoutParams(hlp);

        final View auraRing = new View(activity);
        FrameLayout.LayoutParams rlp = new FrameLayout.LayoutParams(dp(activity, 146), dp(activity, 146));
        rlp.gravity = Gravity.CENTER;
        auraRing.setLayoutParams(rlp);
        GradientDrawable ringGrad = new GradientDrawable();
        ringGrad.setShape(GradientDrawable.OVAL);
        ringGrad.setColor(Color.parseColor("#1E293B"));
        ringGrad.setStroke(dp(activity, 3), Color.parseColor("#FBBF24"));
        auraRing.setBackground(ringGrad);
        logoHalo.addView(auraRing);

        final ImageView logoView = new ImageView(activity);
        FrameLayout.LayoutParams ilp = new FrameLayout.LayoutParams(dp(activity, 114), dp(activity, 114));
        ilp.gravity = Gravity.CENTER;
        logoView.setLayoutParams(ilp);
        logoView.setImageResource(R.mipmap.ic_launcher_round);
        logoView.setScaleX(0.3f);
        logoView.setScaleY(0.3f);
        logoView.setAlpha(0f);
        logoHalo.addView(logoView);
        centerBox.addView(logoHalo);

        // عنوان المنصة المتحرك
        final TextView brandTitle = new TextView(activity);
        brandTitle.setText("EduTech Mindset");
        brandTitle.setTextColor(Color.parseColor("#F8FAFC"));
        brandTitle.setTextSize(TypedValue.COMPLEX_UNIT_SP, 26);
        brandTitle.setTypeface(Typeface.DEFAULT_BOLD);
        brandTitle.setGravity(Gravity.CENTER);
        brandTitle.setAlpha(0f);
        brandTitle.setTranslationY(dp(activity, 18));
        LinearLayout.LayoutParams btlp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        btlp.topMargin = dp(activity, 18);
        brandTitle.setLayoutParams(btlp);
        centerBox.addView(brandTitle);

        // كتابة إبداعية متتابعة (Typewriter)
        final TextView headline = new TextView(activity);
        headline.setText("");
        headline.setTextColor(Color.parseColor("#FBBF24"));
        headline.setTextSize(TypedValue.COMPLEX_UNIT_SP, 20);
        headline.setTypeface(Typeface.DEFAULT_BOLD);
        headline.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams hdlp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        hdlp.topMargin = dp(activity, 12);
        headline.setLayoutParams(hdlp);
        centerBox.addView(headline);

        final TextView subline = new TextView(activity);
        subline.setText("نَحْوَ عَقْلِيَّةٍ تَصْنَعُ المُسْتَقْبَلَ • من غزّة إلى العالم 🇵🇸");
        subline.setTextColor(Color.parseColor("#94A3B8"));
        subline.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
        subline.setGravity(Gravity.CENTER);
        subline.setAlpha(0f);
        LinearLayout.LayoutParams sblp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        sblp.topMargin = dp(activity, 8);
        subline.setLayoutParams(sblp);
        centerBox.addView(subline);

        overlay.addView(centerBox);

        // زر التخطي السريع
        Button skipBtn = new Button(activity);
        skipBtn.setText("دخول سريع ←");
        skipBtn.setTextColor(Color.WHITE);
        skipBtn.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
        skipBtn.setTypeface(Typeface.DEFAULT_BOLD);
        GradientDrawable skipBg = new GradientDrawable();
        skipBg.setCornerRadius(dp(activity, 20));
        skipBg.setColor(Color.parseColor("#334155"));
        skipBg.setStroke(dp(activity, 1), Color.parseColor("#64748B"));
        skipBtn.setBackground(skipBg);
        skipBtn.setPadding(dp(activity, 18), dp(activity, 6), dp(activity, 18), dp(activity, 6));
        FrameLayout.LayoutParams sklp = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, dp(activity, 38));
        sklp.gravity = Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL;
        sklp.bottomMargin = dp(activity, 38);
        skipBtn.setLayoutParams(sklp);
        overlay.addView(skipBtn);

        rootContainer.addView(overlay);

        // تشغيل صوت الترحيب الخفيف
        if (soundEngine != null) {
            try { soundEngine.playIntro(); } catch (Exception ignored) {}
        }

        // حركة الشعار والنبض
        ObjectAnimator logoIn = ObjectAnimator.ofPropertyValuesHolder(
                logoView,
                PropertyValuesHolder.ofFloat(View.SCALE_X, 0.3f, 1.06f, 1f),
                PropertyValuesHolder.ofFloat(View.SCALE_Y, 0.3f, 1.06f, 1f),
                PropertyValuesHolder.ofFloat(View.ALPHA, 0f, 1f)
        );
        logoIn.setDuration(750);
        logoIn.setInterpolator(new OvershootInterpolator(1.2f));
        logoIn.start();

        ObjectAnimator auraPulse = ObjectAnimator.ofPropertyValuesHolder(
                auraRing,
                PropertyValuesHolder.ofFloat(View.SCALE_X, 0.94f, 1.08f),
                PropertyValuesHolder.ofFloat(View.SCALE_Y, 0.94f, 1.08f),
                PropertyValuesHolder.ofFloat(View.ALPHA, 0.55f, 1f)
        );
        auraPulse.setDuration(1100);
        auraPulse.setRepeatCount(ValueAnimator.INFINITE);
        auraPulse.setRepeatMode(ValueAnimator.REVERSE);
        auraPulse.setInterpolator(new AccelerateDecelerateInterpolator());
        auraPulse.start();

        ObjectAnimator brandIn = ObjectAnimator.ofPropertyValuesHolder(
                brandTitle,
                PropertyValuesHolder.ofFloat(View.ALPHA, 0f, 1f),
                PropertyValuesHolder.ofFloat(View.TRANSLATION_Y, dp(activity, 18), 0f)
        );
        brandIn.setStartDelay(250);
        brandIn.setDuration(550);
        brandIn.start();

        // تأثير الكتابة المتتابعة للعنوان الإبداعي
        final String fullPhrase = "رِحْلَةُ التَّفَوُّقِ الذَّكِيِّ ✨";
        for (int idx = 1; idx <= fullPhrase.length(); idx++) {
            final int end = idx;
            handler.postDelayed(() -> {
                if (!dismissed) headline.setText(fullPhrase.substring(0, end));
            }, 450L + (idx * 42L));
        }

        ObjectAnimator subIn = ObjectAnimator.ofFloat(subline, View.ALPHA, 0f, 1f);
        subIn.setStartDelay(1350);
        subIn.setDuration(500);
        subIn.start();

        final Runnable finish = () -> {
            if (dismissed) return;
            dismissed = true;
            handler.removeCallbacksAndMessages(null);
            overlay.animate().alpha(0f).setDuration(260).withEndAction(() -> {
                try { rootContainer.removeView(overlay); } catch (Exception ignored) {}
                if (onComplete != null) onComplete.run();
            }).start();
        };

        skipBtn.setOnClickListener(v -> finish.run());
        handler.postDelayed(finish, 3400);
    }

    private static int dp(Activity a, int v) {
        return Math.round(v * a.getResources().getDisplayMetrics().density);
    }
}
