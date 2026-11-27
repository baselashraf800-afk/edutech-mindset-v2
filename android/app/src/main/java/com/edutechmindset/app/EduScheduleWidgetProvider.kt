package com.edutechmindset.app

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews

class EduScheduleWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        val prefs = context.getSharedPreferences("edutech_widget", Context.MODE_PRIVATE)
        val title = prefs.getString("title", "EduTech Mindset") ?: "EduTech Mindset"
        val subtitle = prefs.getString("subtitle", "جدول الحصص ومهام اليوم — يعمل بلا إنترنت") ?: ""
        for (widgetId in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.widget_edutech_schedule)
            views.setTextViewText(R.id.widgetTitle, title)
            views.setTextViewText(R.id.widgetSubtitle, subtitle)
            appWidgetManager.updateAppWidget(widgetId, views)
        }
    }
}
