package com.edutechmindset.app;

import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.FileProvider;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

public class MyFolderActivity extends AppCompatActivity {

    private LinearLayout listContainer;
    private EditText searchInput;
    private EduTechDatabaseHelper dbHelper;
    private final List<JSONObject> catalogBooks = new ArrayList<>();
    private String activePortal = "BOOKS";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        dbHelper = new EduTechDatabaseHelper(this);
        loadEmbeddedCatalog();

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        root.setBackgroundColor(Color.parseColor("#F1F5F9"));

        // Header
        LinearLayout header = new LinearLayout(this);
        header.setOrientation(LinearLayout.HORIZONTAL);
        header.setGravity(Gravity.CENTER_VERTICAL);
        header.setBackgroundColor(Color.parseColor("#0F4C5C"));
        header.setPadding(24, 28, 24, 28);

        Button backBtn = new Button(this);
        backBtn.setText("← رجوع");
        backBtn.setTextColor(Color.WHITE);
        backBtn.setBackgroundColor(Color.parseColor("#1E6B7B"));
        backBtn.setOnClickListener(v -> finish());
        header.addView(backBtn);

        TextView title = new TextView(this);
        title.setText("📁 مجلدي وخزنة الملفات");
        title.setTextColor(Color.WHITE);
        title.setTextSize(18f);
        title.setTypeface(null, Typeface.BOLD);
        title.setPadding(24, 0, 24, 0);
        header.addView(title);
        root.addView(header);

        // 4 Portals Row
        LinearLayout portals = new LinearLayout(this);
        portals.setOrientation(LinearLayout.HORIZONTAL);
        portals.setPadding(16, 16, 16, 8);
        portals.addView(makePortalBtn("📚 كتبي", v -> { activePortal = "BOOKS"; renderPortal(); }));
        portals.addView(makePortalBtn("📄 تحضيراتي", v -> { activePortal = "DOCS"; renderPortal(); }));
        portals.addView(makePortalBtn("🎬 وسائطي", v -> {
            startActivity(new Intent(this, MxMediaPlayerActivity.class));
        }));
        portals.addView(makePortalBtn("📂 الملفات+", v -> {
            startActivity(new Intent(this, FileManagerPlusActivity.class));
        }));
        root.addView(portals);

        // Quick Actions Row
        LinearLayout quickRow = new LinearLayout(this);
        quickRow.setOrientation(LinearLayout.HORIZONTAL);
        quickRow.setPadding(16, 4, 16, 8);
        quickRow.addView(makePortalBtn("📖 قارئ كتب الجهاز", v -> {
            startActivity(new Intent(this, MoonBookReaderActivity.class));
        }));
        quickRow.addView(makePortalBtn("🖍️ السبورة الذكية", v -> {
            startActivity(new Intent(this, SmartWhiteboardActivity.class));
        }));
        root.addView(quickRow);

        // Search
        searchInput = new EditText(this);
        searchInput.setHint("ابحث في الكتب أو الملفات المحفوظة...");
        searchInput.setBackgroundColor(Color.WHITE);
        searchInput.setPadding(28, 22, 28, 22);
        LinearLayout.LayoutParams sLp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        sLp.setMargins(16, 8, 16, 12);
        searchInput.setLayoutParams(sLp);
        searchInput.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override public void onTextChanged(CharSequence s, int start, int before, int count) { renderPortal(); }
            @Override public void afterTextChanged(Editable s) {}
        });
        root.addView(searchInput);

        ScrollView scroll = new ScrollView(this);
        listContainer = new LinearLayout(this);
        listContainer.setOrientation(LinearLayout.VERTICAL);
        listContainer.setPadding(16, 4, 16, 40);
        scroll.addView(listContainer);
        root.addView(scroll, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));

        setContentView(root);
        renderPortal();
    }

    private Button makePortalBtn(String text, View.OnClickListener l) {
        Button b = new Button(this);
        b.setText(text);
        b.setTextSize(12f);
        b.setAllCaps(false);
        b.setTextColor(Color.parseColor("#0F4C5C"));
        b.setBackgroundColor(Color.WHITE);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f);
        lp.setMargins(5, 0, 5, 0);
        b.setLayoutParams(lp);
        b.setOnClickListener(l);
        return b;
    }

    private void loadEmbeddedCatalog() {
        try {
            InputStream is = getAssets().open("books_catalog.json");
            byte[] buf = new byte[is.available()];
            is.read(buf);
            is.close();
            JSONObject root = new JSONObject(new String(buf, StandardCharsets.UTF_8));
            JSONObject wings = root.getJSONObject("wings");
            JSONObject school = wings.getJSONObject("school_library");
            JSONArray grades = school.getJSONArray("curriculum_grades");
            for (int i = 0; i < grades.length(); i++) {
                JSONObject g = grades.getJSONObject(i);
                String gLabel = g.optString("grade") + (g.optString("branch").equals("عام") ? "" : " - " + g.optString("branch"));
                JSONArray bks = g.getJSONArray("books");
                for (int j = 0; j < bks.length(); j++) {
                    JSONObject b = bks.getJSONObject(j);
                    JSONObject row = new JSONObject();
                    row.put("title", b.optString("title"));
                    row.put("sub", gLabel);
                    row.put("url", b.optString("pdf_url"));
                    catalogBooks.add(row);
                }
            }
            addSimpleArray(school.getJSONArray("student_support"), "مساندة الطلاب");
            addSimpleArray(school.getJSONArray("teacher_and_grammar"), "ركن المعلم والنحو");
            addSimpleArray(wings.getJSONObject("general_library").getJSONArray("books"), "المكتبة العامة");
        } catch (Exception ignored) {
        }
    }

    private void addSimpleArray(JSONArray arr, String label) throws Exception {
        for (int i = 0; i < arr.length(); i++) {
            JSONObject b = arr.getJSONObject(i);
            JSONObject row = new JSONObject();
            row.put("title", b.optString("title"));
            row.put("sub", label + (b.has("category") ? " • " + b.optString("category") : ""));
            row.put("url", b.optString("url", ""));
            catalogBooks.add(row);
        }
    }

    private void renderPortal() {
        listContainer.removeAllViews();
        String q = searchInput.getText().toString().trim().toLowerCase();

        if ("DOCS".equals(activePortal)) {
            List<EduTechDatabaseHelper.SavedFileItem> saved = dbHelper.getSavedFiles(null);
            if (saved.isEmpty()) {
                addInfoCard("لا توجد ملفات محفوظة في قاعدة البيانات بعد",
                        "أي ملف PDF أو Word أو شرح سبورة تحفظه سيظهر هنا تلقائياً داخل Downloads/EduTech_Mindset/");
            } else {
                for (EduTechDatabaseHelper.SavedFileItem it : saved) {
                    if (!q.isEmpty() && !it.title.toLowerCase().contains(q)) continue;
                    addCard(it.title, it.category + " • " + it.path, v -> openLocalFile(it.path, it.mimeType));
                }
            }
            return;
        }

        int shown = 0;
        for (JSONObject b : catalogBooks) {
            String t = b.optString("title");
            String sub = b.optString("sub");
            String u = b.optString("url");
            if (!q.isEmpty() && !t.toLowerCase().contains(q) && !sub.toLowerCase().contains(q)) continue;
            addCard(t, sub, v -> {
                if (u != null && u.startsWith("http")) {
                    startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(u)));
                } else {
                    Toast.makeText(this, "هذا الكتاب محفوظ محلياً — يمكنك فتحه من قارئ كتب الجهاز", Toast.LENGTH_SHORT).show();
                }
            });
            shown++;
            if (shown >= 80 && q.isEmpty()) {
                addInfoCard("استخدم مربع البحث أعلاه", "تم عرض أول 80 كتاباً من أصل " + catalogBooks.size() + " كتاباً — اكتب اسم الصف أو الكتاب للوصول الفوري.");
                break;
            }
        }
    }

    private void openLocalFile(String path, String mime) {
        try {
            File f = new File(path);
            if (!f.exists()) {
                Toast.makeText(this, "الملف غير موجود في المسار", Toast.LENGTH_SHORT).show();
                return;
            }
            Uri uri = FileProvider.getUriForFile(this, getPackageName() + ".fileprovider", f);
            Intent i = new Intent(Intent.ACTION_VIEW);
            i.setDataAndType(uri, mime != null ? mime : "*/*");
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            startActivity(i);
        } catch (Exception e) {
            Toast.makeText(this, "لا يوجد تطبيق مناسب لفتح هذا الملف", Toast.LENGTH_SHORT).show();
        }
    }

    private void addInfoCard(String title, String body) {
        addCard(title, body, null);
    }

    private void addCard(String title, String sub, View.OnClickListener click) {
        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setBackgroundColor(Color.WHITE);
        card.setPadding(24, 20, 24, 20);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        lp.setMargins(0, 0, 0, 12);
        card.setLayoutParams(lp);

        TextView tv1 = new TextView(this);
        tv1.setText(title);
        tv1.setTextSize(14f);
        tv1.setTypeface(null, Typeface.BOLD);
        tv1.setTextColor(Color.parseColor("#0F172A"));
        card.addView(tv1);

        TextView tv2 = new TextView(this);
        tv2.setText(sub);
        tv2.setTextSize(12f);
        tv2.setTextColor(Color.parseColor("#64748B"));
        tv2.setPadding(0, 6, 0, 0);
        card.addView(tv2);

        if (click != null) card.setOnClickListener(click);
        listContainer.addView(card);
    }
}
