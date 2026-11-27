package com.edutechmindset.app;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import java.util.Calendar;

public class StudyReminderReceiver extends BroadcastReceiver {
    public static final String ACTION_STUDY_REMINDER = "com.edutechmindset.app.STUDY_REMINDER";
    private static final String CHANNEL_ID = "edutech_study_reminder";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent != null && Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            scheduleDailyReminder(context, 17, 0);
            return;
        }
        EduTechPrefs prefs = new EduTechPrefs(context);
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel ch = new NotificationChannel(
                    CHANNEL_ID,
                    "تذكير المذاكرة اليومي — EduTech Mindset",
                    NotificationManager.IMPORTANCE_DEFAULT
            );
            nm.createNotificationChannel(ch);
        }

        Intent openIntent = new Intent(context, MainActivity.class);
        openIntent.putExtra("SHORTCUT_ACTION", "RESUME_LESSON");
        openIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(
                context, 401, openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_popup_reminder)
                .setContentTitle("🎓 حان وقت المذاكرة الذكية | EduTech Mindset")
                .setContentText("واصل سلسلة إنجازك (" + prefs.getDailyStreak() + " يوم) في: " + prefs.getLastLessonTitle())
                .setAutoCancel(true)
                .setContentIntent(pi);

        nm.notify(2100, builder.build());
    }

    public static void scheduleDailyReminder(Context context, int hourOfDay, int minute) {
        try {
            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;
            Intent intent = new Intent(context, StudyReminderReceiver.class);
            intent.setAction(ACTION_STUDY_REMINDER);
            PendingIntent pi = PendingIntent.getBroadcast(
                    context, 402, intent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            Calendar cal = Calendar.getInstance();
            cal.set(Calendar.HOUR_OF_DAY, hourOfDay);
            cal.set(Calendar.MINUTE, minute);
            cal.set(Calendar.SECOND, 0);
            if (cal.getTimeInMillis() <= System.currentTimeMillis()) {
                cal.add(Calendar.DAY_OF_YEAR, 1);
            }
            am.setInexactRepeating(
                    AlarmManager.RTC_WAKEUP,
                    cal.getTimeInMillis(),
                    AlarmManager.INTERVAL_DAY,
                    pi
            );
        } catch (Exception ignored) {
        }
    }
}
