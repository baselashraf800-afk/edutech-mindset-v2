package com.aistudio.edutechmindset.bfkqaz;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONObject;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class EduTechPrefs {
    private static final String PREF_NAME = "edutech_v210_prefs";
    private final SharedPreferences prefs;

    public static class HistoryItem {
        public final String title;
        public final String url;
        public final long timestamp;
        public HistoryItem(String title, String url, long timestamp) {
            this.title = title;
            this.url = url;
            this.timestamp = timestamp;
        }
    }

    public static class FlashcardItem {
        public final String question;
        public final String answer;
        public FlashcardItem(String question, String answer) {
            this.question = question;
            this.answer = answer;
        }
    }

    public EduTechPrefs(Context context) {
        this.prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        updateDailyStreak();
    }

    public void saveLastLesson(String url, String title) {
        if (url == null || url.trim().isEmpty() || url.startsWith("about:blank")) return;
        String cleanTitle = (title == null || title.trim().isEmpty()) ? "درس على منصة EduTech Mindset" : title.trim();
        prefs.edit()
                .putString("last_lesson_url", url)
                .putString("last_lesson_title", cleanTitle)
                .putLong("last_lesson_time", System.currentTimeMillis())
                .apply();
        addHistoryItem(cleanTitle, url);
    }

    public String getLastLessonUrl() {
        return prefs.getString("last_lesson_url", "https://edutech-mindset.pages.dev");
    }

    public String getLastLessonTitle() {
        return prefs.getString("last_lesson_title", "المنصة التعليمية الذكية — EduTech Mindset");
    }

    public void addHistoryItem(String title, String url) {
        try {
            JSONArray arr = new JSONArray(prefs.getString("history_json", "[]"));
            JSONArray updated = new JSONArray();
            JSONObject entry = new JSONObject();
            entry.put("title", title);
            entry.put("url", url);
            entry.put("time", System.currentTimeMillis());
            updated.put(entry);
            for (int i = 0; i < arr.length() && updated.length() < 30; i++) {
                JSONObject item = arr.getJSONObject(i);
                if (!url.equals(item.optString("url"))) {
                    updated.put(item);
                }
            }
            prefs.edit().putString("history_json", updated.toString()).apply();
        } catch (Exception ignored) {
        }
    }

    public List<HistoryItem> getHistoryItems() {
        List<HistoryItem> list = new ArrayList<>();
        try {
            JSONArray arr = new JSONArray(prefs.getString("history_json", "[]"));
            for (int i = 0; i < arr.length(); i++) {
                JSONObject o = arr.getJSONObject(i);
                list.add(new HistoryItem(
                        o.optString("title", "درس"),
                        o.optString("url", "https://edutech-mindset.pages.dev"),
                        o.optLong("time", System.currentTimeMillis())
                ));
            }
        } catch (Exception ignored) {
        }
        return list;
    }

    public void toggleBookmark(String title, String url) {
        try {
            JSONArray arr = new JSONArray(prefs.getString("bookmarks_json", "[]"));
            JSONArray updated = new JSONArray();
            boolean removed = false;
            for (int i = 0; i < arr.length(); i++) {
                JSONObject o = arr.getJSONObject(i);
                if (url.equals(o.optString("url"))) {
                    removed = true;
                } else {
                    updated.put(o);
                }
            }
            if (!removed) {
                JSONObject entry = new JSONObject();
                entry.put("title", title == null ? "صفحة مفضلة" : title);
                entry.put("url", url);
                entry.put("time", System.currentTimeMillis());
                updated.put(entry);
            }
            prefs.edit().putString("bookmarks_json", updated.toString()).apply();
        } catch (Exception ignored) {
        }
    }

    public boolean isBookmarked(String url) {
        try {
            JSONArray arr = new JSONArray(prefs.getString("bookmarks_json", "[]"));
            for (int i = 0; i < arr.length(); i++) {
                if (url.equals(arr.getJSONObject(i).optString("url"))) return true;
            }
        } catch (Exception ignored) {
        }
        return false;
    }

    public List<HistoryItem> getBookmarks() {
        List<HistoryItem> list = new ArrayList<>();
        try {
            JSONArray arr = new JSONArray(prefs.getString("bookmarks_json", "[]"));
            for (int i = 0; i < arr.length(); i++) {
                JSONObject o = arr.getJSONObject(i);
                list.add(new HistoryItem(
                        o.optString("title", "مفضلة"),
                        o.optString("url", "https://edutech-mindset.pages.dev"),
                        o.optLong("time", 0L)
                ));
            }
        } catch (Exception ignored) {
        }
        return list;
    }

    public void addFlashcard(String question, String answer) {
        try {
            JSONArray arr = new JSONArray(prefs.getString("flashcards_json", "[]"));
            JSONObject o = new JSONObject();
            o.put("q", question);
            o.put("a", answer);
            arr.put(o);
            prefs.edit().putString("flashcards_json", arr.toString()).apply();
        } catch (Exception ignored) {
        }
    }

    public List<FlashcardItem> getFlashcards() {
        List<FlashcardItem> list = new ArrayList<>();
        try {
            JSONArray arr = new JSONArray(prefs.getString("flashcards_json", "[]"));
            for (int i = 0; i < arr.length(); i++) {
                JSONObject o = arr.getJSONObject(i);
                list.add(new FlashcardItem(o.optString("q"), o.optString("a")));
            }
        } catch (Exception ignored) {
        }
        if (list.isEmpty()) {
            list.add(new FlashcardItem("ما قانون عزم القوة الدورانية (τ)؟", "τ = r × F × sin(θ) ووحدته نيوتن.متر"));
            list.add(new FlashcardItem("ما تفعيلات البحر الوافر؟", "مُفَاعَلَتُنْ مُفَاعَلَتُنْ فَعُولُنْ"));
        }
        return list;
    }

    public void saveQuickNote(String note) {
        prefs.edit().putString("quick_study_note", note == null ? "" : note).apply();
    }

    public String getQuickNote() {
        return prefs.getString("quick_study_note", "");
    }

    public boolean isSoundMuted() {
        return prefs.getBoolean("sound_muted", false);
    }

    public void setSoundMuted(boolean muted) {
        prefs.edit().putBoolean("sound_muted", muted).apply();
    }

    public boolean isKeepScreenOn() {
        return prefs.getBoolean("keep_screen_on", true);
    }

    public void setKeepScreenOn(boolean keepOn) {
        prefs.edit().putBoolean("keep_screen_on", keepOn).apply();
    }

    public boolean isWarmEyeFilter() {
        return prefs.getBoolean("warm_eye_filter", false);
    }

    public void setWarmEyeFilter(boolean enabled) {
        prefs.edit().putBoolean("warm_eye_filter", enabled).apply();
    }

    public boolean isClassroomMode() {
        return prefs.getBoolean("classroom_mode", false);
    }

    public void setClassroomMode(boolean enabled) {
        prefs.edit().putBoolean("classroom_mode", enabled).apply();
    }

    public int getAssistantButtonSizeDp() {
        return prefs.getInt("assistant_btn_size_dp", 56);
    }

    public void setAssistantButtonSizeDp(int sizeDp) {
        prefs.edit().putInt("assistant_btn_size_dp", Math.max(42, Math.min(76, sizeDp))).apply();
    }

    public int getTextZoomPercent() {
        return prefs.getInt("webview_text_zoom", 100);
    }

    public void setTextZoomPercent(int zoom) {
        prefs.edit().putInt("webview_text_zoom", Math.max(75, Math.min(160, zoom))).apply();
    }

    public void addStudyMinutes(int minutes) {
        int current = prefs.getInt("total_study_minutes", 0);
        prefs.edit().putInt("total_study_minutes", current + Math.max(1, minutes)).apply();
    }

    public int getTotalStudyMinutes() {
        return prefs.getInt("total_study_minutes", 25);
    }

    public int getDailyStreak() {
        return prefs.getInt("daily_streak_count", 1);
    }

    private void updateDailyStreak() {
        String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
        String lastDate = prefs.getString("last_active_date", "");
        if (!today.equals(lastDate)) {
            int streak = prefs.getInt("daily_streak_count", 0) + 1;
            prefs.edit()
                    .putString("last_active_date", today)
                    .putInt("daily_streak_count", streak)
                    .apply();
        }
    }
}
