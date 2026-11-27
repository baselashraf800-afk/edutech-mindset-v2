package com.edutechmindset.app;

import android.animation.ObjectAnimator;
import android.animation.PropertyValuesHolder;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.graphics.Color;
import android.graphics.Outline;
import android.graphics.PixelFormat;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.IBinder;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.Gravity;
import android.view.HapticFeedbackConstants;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewOutlineProvider;
import android.view.WindowManager;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.widget.FrameLayout;
import android.widget.ImageView;
import androidx.core.app.NotificationCompat;

public class OverlayAssistantService extends Service {
    public static final String ACTION_STOP = "com.edutechmindset.app.STOP_OVERLAY";
    public static final String ACTION_HIDE = "HIDE_OVERLAY";
    public static final String ACTION_SHOW = "SHOW_OVERLAY";
    private static final String CHANNEL_ID = "edutech_overlay_channel";
    private static final int NOTIFICATION_ID = 2026;

    private WindowManager windowManager;
    private FrameLayout floatingButton;
    private WindowManager.LayoutParams params;
    private ObjectAnimator pulseAnimator;

    @Override
    public void onCreate() {
        super.onCreate();
        startForegroundNotification();
        setupFloatingBubble();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.getAction() != null) {
            String action = intent.getAction();
            if (ACTION_STOP.equals(action)) {
                stopSelf();
                return START_NOT_STICKY;
            } else if (ACTION_HIDE.equals(action)) {
                if (floatingButton != null) floatingButton.setVisibility(View.GONE);
            } else if (ACTION_SHOW.equals(action)) {
                if (floatingButton != null) floatingButton.setVisibility(View.VISIBLE);
            }
        }
        return START_STICKY;
    }

    private void startForegroundNotification() {
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && manager != null) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "المساعد التعليمي العائم",
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("يبقي فقاعة EduTech Mindset جاهزة للوصول السريع فوق التطبيقات");
            manager.createNotificationChannel(channel);
        }

        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.putExtra("OPEN_VOICE_ASSISTANT", true);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent openPending = PendingIntent.getActivity(
                this, 100, openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Intent stopIntent = new Intent(this, OverlayAssistantService.class);
        stopIntent.setAction(ACTION_STOP);
        PendingIntent stopPending = PendingIntent.getService(
                this, 101, stopIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_btn_speak_now)
                .setContentTitle("EduTech Mindset | المساعد الذكي")
                .setContentText("اضغط لفتح لوحة الأدوات التعليمية أو المساعد الصوتي")
                .setContentIntent(openPending)
                .setOngoing(true)
                .addAction(android.R.drawable.ic_menu_close_clear_cancel, "إيقاف الفقاعة", stopPending)
                .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }
    }

    private void setupFloatingBubble() {
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        if (windowManager == null) return;

        int layoutFlag = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE;

        params = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                layoutFlag,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                PixelFormat.TRANSLUCENT
        );
        params.gravity = Gravity.TOP | Gravity.START;
        params.x = 40;
        params.y = 320;

        floatingButton = new FrameLayout(this);
        GradientDrawable bg = new GradientDrawable(
                GradientDrawable.Orientation.TL_BR,
                new int[]{Color.parseColor("#0F172A"), Color.parseColor("#1D4ED8")}
        );
        bg.setCornerRadius(dpToPx(28));
        bg.setStroke(dpToPx(2), Color.parseColor("#38BDF8"));
        floatingButton.setBackground(bg);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            floatingButton.setElevation(dpToPx(10));
        }

        ImageView iconView = new ImageView(this);
        iconView.setImageResource(R.mipmap.ic_launcher);
        int size = dpToPx(46);
        int pad = dpToPx(3);
        FrameLayout.LayoutParams iconLp = new FrameLayout.LayoutParams(size, size);
        iconLp.setMargins(pad, pad, pad, pad);
        iconView.setLayoutParams(iconLp);
        iconView.setScaleType(ImageView.ScaleType.CENTER_CROP);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            iconView.setOutlineProvider(new ViewOutlineProvider() {
                @Override
                public void getOutline(View view, Outline outline) {
                    outline.setOval(0, 0, view.getWidth(), view.getHeight());
                }
            });
            iconView.setClipToOutline(true);
        }

        floatingButton.addView(iconView);

        PropertyValuesHolder scaleX = PropertyValuesHolder.ofFloat(View.SCALE_X, 1.0f, 1.07f);
        PropertyValuesHolder scaleY = PropertyValuesHolder.ofFloat(View.SCALE_Y, 1.0f, 1.07f);
        pulseAnimator = ObjectAnimator.ofPropertyValuesHolder(floatingButton, scaleX, scaleY);
        pulseAnimator.setDuration(1100);
        pulseAnimator.setRepeatCount(ObjectAnimator.INFINITE);
        pulseAnimator.setRepeatMode(ObjectAnimator.REVERSE);
        pulseAnimator.setInterpolator(new AccelerateDecelerateInterpolator());
        pulseAnimator.start();

        floatingButton.setOnTouchListener(new View.OnTouchListener() {
            private int initialX, initialY;
            private float initialTouchX, initialTouchY;
            private boolean isMoved = false;

            @Override
            public boolean onTouch(View v, MotionEvent event) {
                switch (event.getActionMasked()) {
                    case MotionEvent.ACTION_DOWN:
                        initialX = params.x;
                        initialY = params.y;
                        initialTouchX = event.getRawX();
                        initialTouchY = event.getRawY();
                        isMoved = false;
                        return true;
                    case MotionEvent.ACTION_MOVE:
                        int dx = (int) (event.getRawX() - initialTouchX);
                        int dy = (int) (event.getRawY() - initialTouchY);
                        if (Math.abs(dx) > 12 || Math.abs(dy) > 12) {
                            isMoved = true;
                        }
                        params.x = initialX + dx;
                        params.y = initialY + dy;
                        if (windowManager != null && floatingButton != null) {
                            windowManager.updateViewLayout(floatingButton, params);
                        }
                        return true;
                    case MotionEvent.ACTION_UP:
                        if (!isMoved) {
                            triggerHaptic(v);
                            openVoiceAssistant();
                        }
                        return true;
                }
                return false;
            }
        });

        try {
            windowManager.addView(floatingButton, params);
        } catch (Exception ignored) {
        }
    }

    private void triggerHaptic(View v) {
        if (v != null) {
            v.performHapticFeedback(HapticFeedbackConstants.VIRTUAL_KEY);
        }
        try {
            Vibrator vib = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            if (vib != null && vib.hasVibrator()) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vib.vibrate(VibrationEffect.createOneShot(45, VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    vib.vibrate(45);
                }
            }
        } catch (Exception ignored) {
        }
    }

    private void openVoiceAssistant() {
        Intent intent = new Intent(this, MainActivity.class);
        intent.putExtra("OPEN_VOICE_ASSISTANT", true);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(intent);
    }

    private int dpToPx(int dp) {
        return Math.round(dp * getResources().getDisplayMetrics().density);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (pulseAnimator != null) {
            pulseAnimator.cancel();
        }
        if (windowManager != null && floatingButton != null) {
            try {
                windowManager.removeView(floatingButton);
            } catch (Exception ignored) {
            }
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
