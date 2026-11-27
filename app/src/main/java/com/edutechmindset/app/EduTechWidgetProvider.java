package com.edutechmindset.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

public class EduTechWidgetProvider extends AppWidgetProvider {
    public static final String ACTION_WIDGET_REFRESH = "com.edutechmindset.app.ACTION_WIDGET_REFRESH";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (intent != null && ACTION_WIDGET_REFRESH.equals(intent.getAction())) {
            AppWidgetManager manager = AppWidgetManager.getInstance(context);
            int[] ids = manager.getAppWidgetIds(new ComponentName(context, EduTechWidgetProvider.class));
            onUpdate(context, manager, ids);
        }
    }

    public static void TriggerRefresh(Context context) {
        try {
            Intent intent = new Intent(context, EduTechWidgetProvider.class);
            intent.setAction(ACTION_WIDGET_REFRESH);
            context.sendBroadcast(intent);
        } catch (Exception ignored) {
        }
    }

    private static void updateWidget(Context context, AppWidgetManager manager, int widgetId) {
        EduTechPrefs prefs = new EduTechPrefs(context);
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_edutech);

        views.setTextViewText(R.id.widget_streak_badge, "🔥 يوم " + prefs.getDailyStreak());
        views.setTextViewText(R.id.widget_last_lesson, "📚 آخر درس: " + prefs.getLastLessonTitle());

        // Button 1: Open Platform
        Intent openIntent = new Intent(context, MainActivity.class);
        openIntent.putExtra("SHORTCUT_ACTION", "RESUME_LESSON");
        openIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent openPending = PendingIntent.getActivity(
                context, 301, openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_btn_open, openPending);

        // Button 2: Open Whiteboard
        Intent wbIntent = new Intent(context, MainActivity.class);
        wbIntent.putExtra("SHORTCUT_ACTION", "WHITEBOARD");
        wbIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent wbPending = PendingIntent.getActivity(
                context, 302, wbIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_btn_whiteboard, wbPending);

        // Button 3: Start Pomodoro
        Intent pomIntent = new Intent(context, MainActivity.class);
        pomIntent.putExtra("SHORTCUT_ACTION", "POMODORO");
        pomIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pomPending = PendingIntent.getActivity(
                context, 303, pomIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_btn_pomodoro, pomPending);

        manager.updateAppWidget(widgetId, views);
    }
}
