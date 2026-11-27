package com.aistudio.edutechmindset.bfkqaz;

import android.app.Activity;
import android.app.AlertDialog;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;
import java.util.List;

public class EduTechHubSheet {

    public interface HostCallbacks {
        void onOpenWhiteboard();
        void onOpenCalculator();
        void onStartPomodoro(int minutes, String label);
        void onToggleWarmEyeFilter();
        void onHideAssistantFor10Min();
        void onToggleClassroomMode();
        void onOpenLocalLibrary();
        void onShowFindInPage();
        void onCheckGitHubUpdates();
        void onOpenQrScanner();
        void onRecordVoiceNote();
        void onChangeAssistantSize(int sizeDp);
        void onStartVoiceInput();
        void onNavigateUrl(String url);
        void onExecuteJsAction(String jsCode, String toastMsg);
        void onToggleKeepScreenOn();
        void onRequestOverlayPermission();
        void onEnterPipMode();
        void onShareCurrentPage();
    }

    public static AlertDialog show(final Activity activity,
                                   final EduTechPrefs prefs,
                                   final SoundEngine soundEngine,
                                   final String currentUrl,
                                   final String currentTitle,
                                   final HostCallbacks callbacks) {
        LinearLayout root = new LinearLayout(activity);
        root.setOrientation(LinearLayout.VERTICAL);
        int pad = dp(activity, 16);
        root.setPadding(pad, pad, pad, pad);
        GradientDrawable rootBg = new GradientDrawable(
                GradientDrawable.Orientation.TOP_BOTTOM,
                new int[]{Color.parseColor("#0F172A"), Color.parseColor("#1E293B")}
        );
        rootBg.setCornerRadius(dp(activity, 22));
        rootBg.setStroke(dp(activity, 2), Color.parseColor("#38BDF8"));
        root.setBackground(rootBg);

        // Header with daily streak & sound mute toggle
        LinearLayout header = new LinearLayout(activity);
        header.setOrientation(LinearLayout.HORIZONTAL);
        header.setGravity(Gravity.CENTER_VERTICAL);

        TextView titleView = new TextView(activity);
        titleView.setText("🎓 مركز أدوات EduTech v2.1.0 (48 ميزة)");
        titleView.setTextColor(Color.WHITE);
        titleView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16);
        titleView.setTypeface(Typeface.DEFAULT_BOLD);
        header.addView(titleView, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));

        TextView streakBadge = new TextView(activity);
        streakBadge.setText("🔥 " + prefs.getDailyStreak() + " يوم | ⏱️ " + prefs.getTotalStudyMinutes() + " د");
        streakBadge.setTextColor(Color.parseColor("#FBBF24"));
        streakBadge.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
        streakBadge.setTypeface(Typeface.DEFAULT_BOLD);
        header.addView(streakBadge);
        root.addView(header);

        // 4 Tabs Bar: الدرس | التركيز | الأدوات | المكتبة
        LinearLayout tabBar = new LinearLayout(activity);
        tabBar.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams tabBarLp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
        tabBarLp.setMargins(0, dp(activity, 12), 0, dp(activity, 10));
        tabBar.setLayoutParams(tabBarLp);

        final ScrollView scrollArea = new ScrollView(activity);
        scrollArea.setLayoutParams(new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                dp(activity, 370)
        ));
        final LinearLayout contentContainer = new LinearLayout(activity);
        contentContainer.setOrientation(LinearLayout.VERTICAL);
        scrollArea.addView(contentContainer);

        final AlertDialog dialog = new AlertDialog.Builder(activity)
                .setView(root)
                .create();
        if (dialog.getWindow() != null) {
            dialog.getWindow().setBackgroundDrawableResource(android.R.color.transparent);
        }

        final String[] tabNames = new String[]{"📖 الدرس", "🎯 التركيز", "🛠️ الأدوات", "📂 المكتبة"};
        final Button[] tabButtons = new Button[4];

        final Runnable[] tabBuilders = new Runnable[]{
                // Tab 0: الدرس (12 features)
                () -> {
                    contentContainer.removeAllViews();
                    addSectionHeader(activity, contentContainer, "أدوات الدرس الحالي والتفاعل الذكي (12 ميزة)");
                    addFeatureButton(activity, contentContainer, "1. 🔍 البحث داخل صفحة الدرس (Find in Page)", "#0284C7", () -> {
                        dialog.dismiss();
                        callbacks.onShowFindInPage();
                    });
                    addFeatureButton(activity, contentContainer, "2. ⭐ إضافة/إزالة الدرس من المفضلة", "#2563EB", () -> {
                        prefs.toggleBookmark(currentTitle, currentUrl);
                        Toast.makeText(activity, prefs.isBookmarked(currentUrl) ? "تمت إضافة الدرس للمفضلة ⭐" : "تمت إزالة الدرس من المفضلة", Toast.LENGTH_SHORT).show();
                    });
                    addFeatureButton(activity, contentContainer, "3. 🔊 قراءة الدرس بالصوت العربي الفصيح (TTS)", "#059669", () -> {
                        dialog.dismiss();
                        callbacks.onExecuteJsAction("if(window.EduVoice && window.EduVoice.speakPage){window.EduVoice.speakPage();}else{window.speechSynthesis.speak(new SpeechSynthesisUtterance(document.body.innerText.slice(0,600)));}", "بدء القراءة الصوتية للدرس 🔊");
                    });
                    addFeatureButton(activity, contentContainer, "4. ✨ تشكيل نصوص الدرس تلقائياً", "#7C3AED", () -> {
                        dialog.dismiss();
                        callbacks.onExecuteJsAction("if(window.EduVoice && window.EduVoice.tashkeelActive){window.EduVoice.tashkeelActive();}", "تم تفعيل تشكيل النصوص العربية ✨");
                    });
                    addFeatureButton(activity, contentContainer, "5. 🎙️ الإملاء والمساعد الصوتي الذكي", "#0D9488", () -> {
                        dialog.dismiss();
                        callbacks.onStartVoiceInput();
                    });
                    addFeatureButton(activity, contentContainer, "6. ➕ تكبير خط الدرس (+15%)", "#334155", () -> {
                        int z = prefs.getTextZoomPercent() + 15;
                        prefs.setTextZoomPercent(z);
                        callbacks.onExecuteJsAction("document.body.style.zoom='" + prefs.getTextZoomPercent() + "%';", "حجم الخط: " + prefs.getTextZoomPercent() + "%");
                    });
                    addFeatureButton(activity, contentContainer, "7. ➖ تصغير خط الدرس (-15%)", "#334155", () -> {
                        int z = prefs.getTextZoomPercent() - 15;
                        prefs.setTextZoomPercent(z);
                        callbacks.onExecuteJsAction("document.body.style.zoom='" + prefs.getTextZoomPercent() + "%';", "حجم الخط: " + prefs.getTextZoomPercent() + "%");
                    });
                    addFeatureButton(activity, contentContainer, "8. 📝 تلخيص الدرس واستخراج النقاط الذهبية", "#1D4ED8", () -> {
                        dialog.dismiss();
                        callbacks.onExecuteJsAction("if(window.EduBridge && window.EduBridge.quickSummary){window.EduBridge.quickSummary();}else{window.scrollTo({top:0,behavior:'smooth'});}", "جاري فتح ملخص الدرس الذكي 📝");
                    });
                    addFeatureButton(activity, contentContainer, "9. 🧪 تحويل الدرس إلى اختبار تفاعلي فوري", "#4F46E5", () -> {
                        dialog.dismiss();
                        callbacks.onExecuteJsAction("if(window.EduBridge && window.EduBridge.toQuiz){window.EduBridge.toQuiz();}", "فتح مولد الاختبارات التفاعلية 🧪");
                    });
                    addFeatureButton(activity, contentContainer, "10. 🃏 إضافة بطاقة مراجعة سريعة (Flashcard)", "#0891B2", () -> {
                        showAddFlashcardDialog(activity, prefs);
                    });
                    addFeatureButton(activity, contentContainer, "11. 📄 حفظ الدرس كملف PDF للطباعة", "#475569", () -> {
                        dialog.dismiss();
                        callbacks.onExecuteJsAction("window.print();", "جاري تجهيز طباعة/حفظ الدرس كـ PDF 📄");
                    });
                    addFeatureButton(activity, contentContainer, "12. 📤 مشاركة رابط الدرس مع الطلاب والزملاء", "#0369A1", () -> {
                        dialog.dismiss();
                        callbacks.onShareCurrentPage();
                    });
                },
                // Tab 1: التركيز (12 features)
                () -> {
                    contentContainer.removeAllViews();
                    addSectionHeader(activity, contentContainer, "بيئة التركيز، المؤقتات، وراحة العين (12 ميزة)");
                    addFeatureButton(activity, contentContainer, "13. 🍅 مؤقت بومودورو القياسي (25 دقيقة تركيز)", "#059669", () -> {
                        dialog.dismiss();
                        callbacks.onStartPomodoro(25, "بومودورو 25 د");
                    });
                    addFeatureButton(activity, contentContainer, "14. 🔥 جلسة مذاكرة عميقة (45 دقيقة)", "#047857", () -> {
                        dialog.dismiss();
                        callbacks.onStartPomodoro(45, "مذاكرة عميقة 45 د");
                    });
                    addFeatureButton(activity, contentContainer, "15. 📝 محاكي ساعة الامتحان الوزاري (60 دقيقة)", "#B45309", () -> {
                        dialog.dismiss();
                        callbacks.onStartPomodoro(60, "امتحان وزاري 60 د");
                    });
                    addFeatureButton(activity, contentContainer, "16. ☕ استراحة ذهنية قصيرة (5 دقائق)", "#0284C7", () -> {
                        dialog.dismiss();
                        callbacks.onStartPomodoro(5, "استراحة 5 د");
                    });
                    addFeatureButton(activity, contentContainer, "17. 🌅 فلتر حماية العين الدافئ (Night Shift): " + (prefs.isWarmEyeFilter() ? "مفعّل ✓" : "متوقف"), "#D97706", () -> {
                        callbacks.onToggleWarmEyeFilter();
                        dialog.dismiss();
                    });
                    addFeatureButton(activity, contentContainer, "18. 💡 إبقاء الشاشة مضاءة أثناء الدراسة: " + (prefs.isKeepScreenOn() ? "مفعّل ✓" : "متوقف"), "#2563EB", () -> {
                        callbacks.onToggleKeepScreenOn();
                        dialog.dismiss();
                    });
                    addFeatureButton(activity, contentContainer, "19. 🏫 وضع العرض الصفي بملء الشاشة: " + (prefs.isClassroomMode() ? "مفعّل ✓" : "متوقف"), "#7C3AED", () -> {
                        callbacks.onToggleClassroomMode();
                        dialog.dismiss();
                    });
                    addFeatureButton(activity, contentContainer, "20. 🙈 إخفاء زر المساعد العائم لمدة 10 دقائق", "#475569", () -> {
                        dialog.dismiss();
                        callbacks.onHideAssistantFor10Min();
                    });
                    addFeatureButton(activity, contentContainer, "21. 🔇 كتم/تشغيل المؤثرات الصوتية للتطبيق: " + (soundEngine.isMuted() ? "مكتوم" : "مسموع ✓"), "#334155", () -> {
                        soundEngine.setMuted(!soundEngine.isMuted());
                        Toast.makeText(activity, soundEngine.isMuted() ? "تم كتم المؤثرات الصوتية 🔇" : "تم تفعيل المؤثرات الصوتية 🔊", Toast.LENGTH_SHORT).show();
                    });
                    addFeatureButton(activity, contentContainer, "22. ⏰ تفعيل منبه المذاكرة اليومي الذكي", "#0D9488", () -> {
                        StudyReminderReceiver.scheduleDailyReminder(activity, 17, 0);
                        Toast.makeText(activity, "تم ضبط تذكير المذاكرة اليومي الساعة 5:00 مساءً ⏰", Toast.LENGTH_SHORT).show();
                    });
                    addFeatureButton(activity, contentContainer, "23. 🎵 تشغيل نغمة التركيز الهادئة", "#4F46E5", () -> {
                        soundEngine.playSuccess();
                        callbacks.onExecuteJsAction("if(window.EduMusic && window.EduMusic.toggle){window.EduMusic.toggle();}", "تبديل مشغل موسيقى التركيز 🎵");
                    });
                    addFeatureButton(activity, contentContainer, "24. 🏆 عرض إحصائيات الإنجاز اليومي وسلسلة الأيام", "#0369A1", () -> {
                        Toast.makeText(activity, "🔥 سلسلة أيامك: " + prefs.getDailyStreak() + " يوم | مجموع دقائق التركيز: " + prefs.getTotalStudyMinutes() + " دقيقة", Toast.LENGTH_LONG).show();
                    });
                },
                // Tab 2: الأدوات (12 features)
                () -> {
                    contentContainer.removeAllViews();
                    addSectionHeader(activity, contentContainer, "الأدوات العائمة، المختبرات، وإعدادات النظام (12 ميزة)");
                    addFeatureButton(activity, contentContainer, "25. 🎨 فتح السبورة التفاعلية السريعة فوق الدرس", "#0284C7", () -> {
                        dialog.dismiss();
                        callbacks.onOpenWhiteboard();
                    });
                    addFeatureButton(activity, contentContainer, "26. 🧮 فتح الحاسبة العلمية العائمة", "#2563EB", () -> {
                        dialog.dismiss();
                        callbacks.onOpenCalculator();
                    });
                    addFeatureButton(activity, contentContainer, "27. 📷 ماسح رمز QR السريع للكتب وأوراق العمل", "#059669", () -> {
                        dialog.dismiss();
                        callbacks.onOpenQrScanner();
                    });
                    addFeatureButton(activity, contentContainer, "28. 🎤 تسجيل ملاحظة صوتية سريعة في الخزنة", "#D97706", () -> {
                        dialog.dismiss();
                        callbacks.onRecordVoiceNote();
                    });
                    addFeatureButton(activity, contentContainer, "29. 📐 تغيير حجم زر المساعد العائم (صغير / متوسط / كبير)", "#7C3AED", () -> {
                        int cur = prefs.getAssistantButtonSizeDp();
                        int next = cur <= 46 ? 56 : (cur <= 58 ? 68 : 44);
                        callbacks.onChangeAssistantSize(next);
                        Toast.makeText(activity, "تم ضبط حجم زر المساعد إلى " + next + "dp", Toast.LENGTH_SHORT).show();
                    });
                    addFeatureButton(activity, contentContainer, "30. 🖼️ تصغير التطبيق في نافذة عائمة (Picture-in-Picture)", "#0891B2", () -> {
                        dialog.dismiss();
                        callbacks.onEnterPipMode();
                    });
                    addFeatureButton(activity, contentContainer, "31. 🌐 تفعيل الفقاعة العائمة فوق التطبيقات الأخرى", "#1D4ED8", () -> {
                        dialog.dismiss();
                        callbacks.onRequestOverlayPermission();
                    });
                    addFeatureButton(activity, contentContainer, "32. 🔄 فحص تحديثات التطبيق من GitHub Releases", "#0D9488", () -> {
                        dialog.dismiss();
                        callbacks.onCheckGitHubUpdates();
                    });
                    addFeatureButton(activity, contentContainer, "33. ⚡ فتح غرفة العمليات التعليمية الموحدة", "#4F46E5", () -> {
                        dialog.dismiss();
                        callbacks.onExecuteJsAction("if(window.openUnifiedOps){window.openUnifiedOps();}else{window.scrollTo({top:0,behavior:'smooth'});}", "فتح غرفة العمليات التعليمية الموحدة ⚡");
                    });
                    addFeatureButton(activity, contentContainer, "34. 🎓 الانتقال السريع إلى بوابة توجيهي فلسطين", "#0369A1", () -> {
                        dialog.dismiss();
                        callbacks.onNavigateUrl("https://edutech-mindset.pages.dev/#tawjihi");
                    });
                    addFeatureButton(activity, contentContainer, "35. 👨‍🏫 الانتقال السريع إلى استوديو المعلم وحقيبة الحصة", "#334155", () -> {
                        dialog.dismiss();
                        callbacks.onNavigateUrl("https://edutech-mindset.pages.dev/#teacher");
                    });
                    addFeatureButton(activity, contentContainer, "36. 👨‍👩‍👧 الانتقال السريع إلى بوابة ولي الأمر والمتابعة", "#475569", () -> {
                        dialog.dismiss();
                        callbacks.onNavigateUrl("https://edutech-mindset.pages.dev/#parent");
                    });
                },
                // Tab 3: المكتبة (12 features)
                () -> {
                    contentContainer.removeAllViews();
                    addSectionHeader(activity, contentContainer, "مكتبتي بدون إنترنت، السجل، والبطاقات (12 ميزة)");
                    addFeatureButton(activity, contentContainer, "37. 📂 فتح مكتبتي المحلية الشاملة (PDF / صوتيات / فيديو)", "#0284C7", () -> {
                        dialog.dismiss();
                        callbacks.onOpenLocalLibrary();
                    });
                    addFeatureButton(activity, contentContainer, "38. ⏮️ متابعة آخر درس: " + prefs.getLastLessonTitle(), "#059669", () -> {
                        dialog.dismiss();
                        callbacks.onNavigateUrl(prefs.getLastLessonUrl());
                    });
                    addFeatureButton(activity, contentContainer, "39. 🕒 استعراض سجل الدروس والصفحات الأخيرة", "#2563EB", () -> {
                        showHistoryListDialog(activity, "🕒 سجل الدروس الأخيرة", prefs.getHistoryItems(), url -> {
                            dialog.dismiss();
                            callbacks.onNavigateUrl(url);
                        });
                    });
                    addFeatureButton(activity, contentContainer, "40. ⭐ استعراض قائمة الدروس المفضلة", "#7C3AED", () -> {
                        showHistoryListDialog(activity, "⭐ الدروس المفضلة", prefs.getBookmarks(), url -> {
                            dialog.dismiss();
                            callbacks.onNavigateUrl(url);
                        });
                    });
                    addFeatureButton(activity, contentContainer, "41. 🃏 مراجعة بطاقات الاستذكار المحفوظة (Flashcards)", "#0D9488", () -> {
                        showFlashcardsReviewDialog(activity, prefs);
                    });
                    addFeatureButton(activity, contentContainer, "📖 قارئ الكتب الاحترافي (Moon+ Style)", "#7C3AED", () -> {
                        dialog.dismiss();
                        activity.startActivity(new android.content.Intent(activity, MoonBookReaderActivity.class));
                    });
                    addFeatureButton(activity, contentContainer, "📁 مدير ملفات EduTech+ (تصنيف وبحث)", "#0284C7", () -> {
                        dialog.dismiss();
                        activity.startActivity(new android.content.Intent(activity, FileManagerPlusActivity.class));
                    });
                    addFeatureButton(activity, contentContainer, "🎬 مشغل الفيديو والصوتيات (MX Style)", "#EA580C", () -> {
                        dialog.dismiss();
                        activity.startActivity(new android.content.Intent(activity, MxMediaPlayerActivity.class));
                    });
                    addFeatureButton(activity, contentContainer, "42. 📓 دفتر الملاحظات والمسودة السريعة التلقائية", "#D97706", () -> {
                        showQuickNotesDialog(activity, prefs);
                    });
                    addFeatureButton(activity, contentContainer, "43. 💾 حفظ الصفحة الحالية للقراءة بدون إنترنت", "#1D4ED8", () -> {
                        dialog.dismiss();
                        callbacks.onExecuteJsAction("if(window.EduOffline && window.EduOffline.cacheCurrent){window.EduOffline.cacheCurrent();}", "تم حفظ بيانات الدرس للاستخدام بدون إنترنت 💾");
                    });
                    addFeatureButton(activity, contentContainer, "44. 📥 استعادة المسودات المحفوظة في الحقول تلقائياً", "#4F46E5", () -> {
                        dialog.dismiss();
                        callbacks.onExecuteJsAction("if(window.__edutechRestoreDrafts){window.__edutechRestoreDrafts();}", "تمت استعادة المسودات النصية المحفوظة 📥");
                    });
                    addFeatureButton(activity, contentContainer, "45. 📖 نصيحة استخدام: تقليب صفحات PDF بأزرار الصوت (↑/↓)", "#334155", () -> {
                        Toast.makeText(activity, "عند فتح أي ملف PDF داخل مكتبتي، استخدم زري رفع وخفض الصوت لتقليب الصفحات بسهولة!", Toast.LENGTH_LONG).show();
                    });
                    addFeatureButton(activity, contentContainer, "46. 🧩 تحديث ودجت الشاشة الرئيسية فوراً", "#0891B2", () -> {
                        EduTechWidgetProvider.TriggerRefresh(activity);
                        Toast.makeText(activity, "تم تحديث ودجت الشاشة الرئيسية بآخر درس وإنجازك اليومي 🧩", Toast.LENGTH_SHORT).show();
                    });
                    addFeatureButton(activity, contentContainer, "47. 🏠 العودة إلى الصفحة الرئيسية للمنصة", "#0369A1", () -> {
                        dialog.dismiss();
                        callbacks.onNavigateUrl("https://edutech-mindset.pages.dev");
                    });
                    addFeatureButton(activity, contentContainer, "48. 🧹 مسح الكاش المؤقت وإعادة تنشيط المنصة", "#B91C1C", () -> {
                        dialog.dismiss();
                        callbacks.onExecuteJsAction("if('caches' in window){caches.keys().then(keys=>keys.forEach(k=>caches.delete(k)));} location.reload();", "جاري تحديث المنصة ومسح الكاش القديم 🧹");
                    });
                }
        };

        for (int i = 0; i < 4; i++) {
            final int idx = i;
            Button tb = new Button(activity);
            tb.setText(tabNames[i]);
            tb.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
            tb.setTypeface(Typeface.DEFAULT_BOLD);
            tb.setTextColor(Color.WHITE);
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, dp(activity, 40), 1f);
            lp.setMargins(dp(activity, 3), 0, dp(activity, 3), 0);
            tb.setLayoutParams(lp);
            tabButtons[i] = tb;
            tb.setOnClickListener(v -> {
                if (soundEngine != null) soundEngine.playClick();
                for (int j = 0; j < 4; j++) {
                    GradientDrawable bg = new GradientDrawable();
                    bg.setCornerRadius(dp(activity, 12));
                    bg.setColor(Color.parseColor(j == idx ? "#0284C7" : "#334155"));
                    tabButtons[j].setBackground(bg);
                }
                tabBuilders[idx].run();
            });
            tabBar.addView(tb);
        }

        root.addView(tabBar);
        root.addView(scrollArea);

        // Initialize Tab 0
        tabButtons[0].performClick();

        dialog.show();
        return dialog;
    }

    private static void addSectionHeader(Activity activity, LinearLayout parent, String text) {
        TextView tv = new TextView(activity);
        tv.setText(text);
        tv.setTextColor(Color.parseColor("#38BDF8"));
        tv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
        tv.setTypeface(Typeface.DEFAULT_BOLD);
        tv.setPadding(dp(activity, 4), dp(activity, 4), dp(activity, 4), dp(activity, 8));
        parent.addView(tv);
    }

    private static void addFeatureButton(Activity activity, LinearLayout parent, String label, String colorHex, Runnable action) {
        Button b = new Button(activity);
        b.setText(label);
        b.setTextColor(Color.WHITE);
        b.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
        b.setGravity(Gravity.START | Gravity.CENTER_VERTICAL);
        int p = dp(activity, 12);
        b.setPadding(p, dp(activity, 8), p, dp(activity, 8));
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(Color.parseColor(colorHex));
        bg.setCornerRadius(dp(activity, 12));
        b.setBackground(bg);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
        lp.bottomMargin = dp(activity, 7);
        b.setLayoutParams(lp);
        b.setOnClickListener(v -> action.run());
        parent.addView(b);
    }

    private interface UrlCallback {
        void onSelect(String url);
    }

    private static void showHistoryListDialog(Activity activity, String title, List<EduTechPrefs.HistoryItem> items, UrlCallback cb) {
        if (items.isEmpty()) {
            Toast.makeText(activity, "القائمة فارغة حالياً", Toast.LENGTH_SHORT).show();
            return;
        }
        String[] labels = new String[items.size()];
        for (int i = 0; i < items.size(); i++) {
            labels[i] = "📌 " + items.get(i).title;
        }
        new AlertDialog.Builder(activity)
                .setTitle(title)
                .setItems(labels, (d, which) -> cb.onSelect(items.get(which).url))
                .setNegativeButton("إغلاق", null)
                .show();
    }

    private static void showAddFlashcardDialog(Activity activity, EduTechPrefs prefs) {
        LinearLayout box = new LinearLayout(activity);
        box.setOrientation(LinearLayout.VERTICAL);
        int p = dp(activity, 16);
        box.setPadding(p, p, p, p);
        final EditText qInput = new EditText(activity);
        qInput.setHint("اكتب السؤال أو المصطلح...");
        final EditText aInput = new EditText(activity);
        aInput.setHint("اكتب الإجابة أو الشرح...");
        box.addView(qInput);
        box.addView(aInput);
        new AlertDialog.Builder(activity)
                .setTitle("🃏 إضافة بطاقة مراجعة جديدة")
                .setView(box)
                .setPositiveButton("حفظ البطاقة", (d, w) -> {
                    String q = qInput.getText().toString().trim();
                    String a = aInput.getText().toString().trim();
                    if (!q.isEmpty() && !a.isEmpty()) {
                        prefs.addFlashcard(q, a);
                        Toast.makeText(activity, "تم حفظ البطاقة في مكتبتك بنجاح ✅", Toast.LENGTH_SHORT).show();
                    }
                })
                .setNegativeButton("إلغاء", null)
                .show();
    }

    private static void showFlashcardsReviewDialog(Activity activity, EduTechPrefs prefs) {
        List<EduTechPrefs.FlashcardItem> cards = prefs.getFlashcards();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < cards.size(); i++) {
            sb.append("س").append(i + 1).append(": ").append(cards.get(i).question).append(" - ج: ").append(cards.get(i).answer).append(" | ");
        }
        new AlertDialog.Builder(activity)
                .setTitle("🃏 بطاقات المراجعة السريعة (" + cards.size() + ")")
                .setMessage(sb.toString().trim())
                .setPositiveButton("حسناً", null)
                .show();
    }

    private static void showQuickNotesDialog(Activity activity, EduTechPrefs prefs) {
        final EditText input = new EditText(activity);
        input.setMinLines(4);
        input.setText(prefs.getQuickNote());
        input.setHint("اكتب ملاحظاتك السريعة حول الدرس هنا...");
        new AlertDialog.Builder(activity)
                .setTitle("📓 دفتر الملاحظات السريعة")
                .setView(input)
                .setPositiveButton("حفظ", (d, w) -> {
                    prefs.saveQuickNote(input.getText().toString());
                    Toast.makeText(activity, "تم حفظ الملاحظة ✅", Toast.LENGTH_SHORT).show();
                })
                .setNegativeButton("إغلاق", null)
                .show();
    }

    private static int dp(Activity activity, int dp) {
        return Math.round(dp * activity.getResources().getDisplayMetrics().density);
    }
}
