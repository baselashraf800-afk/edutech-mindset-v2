package com.edutechmindset.app;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.core.content.FileProvider;

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class FileManagerPlusActivity extends Activity {

    private LinearLayout listContainer;
    private TextView statsText;
    private String activeCategory = "all"; // all, pdf, audio, video, image
    private String searchQuery = "";
    private int sortMode = 0; // 0=date desc, 1=name asc, 2=size desc

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.parseColor("#0B1120"));
        root.setPadding(dp(14), dp(18), dp(14), dp(14));

        // شريط علوي
        LinearLayout topBar = new LinearLayout(this);
        topBar.setOrientation(LinearLayout.HORIZONTAL);
        topBar.setGravity(Gravity.CENTER_VERTICAL);

        Button backBtn = makeChip("← رجوع", "#1E293B");
        backBtn.setOnClickListener(v -> finish());
        topBar.addView(backBtn);

        TextView title = new TextView(this);
        title.setText("📁 مدير ملفات EduTech+");
        title.setTextColor(Color.WHITE);
        title.setTextSize(TypedValue.COMPLEX_UNIT_SP, 18);
        title.setTypeface(Typeface.DEFAULT_BOLD);
        title.setGravity(Gravity.END | Gravity.CENTER_VERTICAL);
        title.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
        topBar.addView(title);
        root.addView(topBar);

        statsText = new TextView(this);
        statsText.setTextColor(Color.parseColor("#38BDF8"));
        statsText.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
        statsText.setPadding(dp(4), dp(8), dp(4), dp(8));
        root.addView(statsText);

        // بحث + فرز
        LinearLayout toolsRow = new LinearLayout(this);
        toolsRow.setOrientation(LinearLayout.HORIZONTAL);
        toolsRow.setGravity(Gravity.CENTER_VERTICAL);

        EditText searchBox = new EditText(this);
        searchBox.setHint("🔍 ابحث في ملفاتك المحفوظة...");
        searchBox.setHintTextColor(Color.parseColor("#64748B"));
        searchBox.setTextColor(Color.WHITE);
        searchBox.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
        GradientDrawable sbBg = new GradientDrawable();
        sbBg.setCornerRadius(dp(12));
        sbBg.setColor(Color.parseColor("#1E293B"));
        searchBox.setBackground(sbBg);
        searchBox.setPadding(dp(12), dp(8), dp(12), dp(8));
        searchBox.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
        searchBox.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override public void onTextChanged(CharSequence s, int start, int before, int count) {
                searchQuery = s != null ? s.toString().trim().toLowerCase() : "";
                refreshList();
            }
            @Override public void afterTextChanged(Editable s) {}
        });
        toolsRow.addView(searchBox);

        Button sortBtn = makeChip("⇅ فرز", "#334155");
        sortBtn.setOnClickListener(v -> {
            sortMode = (sortMode + 1) % 3;
            String[] lbls = {"الأحدث أولاً", "بالاسم (أ-ي)", "الأكبر حجماً"};
            Toast.makeText(this, "الفرز: " + lbls[sortMode], Toast.LENGTH_SHORT).show();
            refreshList();
        });
        toolsRow.addView(sortBtn);
        root.addView(toolsRow);

        // أزرار التصنيف الملونة بأسلوب File Manager Plus
        LinearLayout catRow = new LinearLayout(this);
        catRow.setOrientation(LinearLayout.HORIZONTAL);
        catRow.setPadding(0, dp(10), 0, dp(10));
        String[][] cats = {
                {"all", "الكل", "#0284C7"},
                {"pdf", "PDF", "#E11D48"},
                {"audio", "صوت", "#9333EA"},
                {"video", "فيديو", "#EA580C"},
                {"image", "صور", "#059669"}
        };
        for (final String[] c : cats) {
            Button cb = makeChip(c[1], c[2]);
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, dp(34), 1f);
            lp.setMargins(dp(2), 0, dp(2), 0);
            cb.setLayoutParams(lp);
            cb.setOnClickListener(v -> {
                activeCategory = c[0];
                refreshList();
            });
            catRow.addView(cb);
        }
        root.addView(catRow);

        ScrollView scroll = new ScrollView(this);
        listContainer = new LinearLayout(this);
        listContainer.setOrientation(LinearLayout.VERTICAL);
        scroll.addView(listContainer);
        root.addView(scroll, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));

        setContentView(root);
        refreshList();
    }

    private List<File> scanAllFiles() {
        List<File> res = new ArrayList<>();
        File[] roots = new File[]{
                new File(getFilesDir(), "EduTechVault"),
                new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS), "EduTechMindset"),
                new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES), "EduTechMindset"),
                new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MUSIC), "EduTechMindset"),
                new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES), "EduTechMindset")
        };
        for (File dir : roots) {
            collectRecursive(dir, res);
        }
        return res;
    }

    private void collectRecursive(File dir, List<File> out) {
        if (dir == null || !dir.exists() || !dir.isDirectory()) return;
        File[] files = dir.listFiles();
        if (files == null) return;
        for (File f : files) {
            if (f.isFile()) out.add(f);
            else if (f.isDirectory()) collectRecursive(f, out);
        }
    }

    private String getCategory(File f) {
        String n = f.getName().toLowerCase();
        if (n.endsWith(".pdf") || n.endsWith(".txt") || n.endsWith(".csv") || n.endsWith(".srt")) return "pdf";
        if (n.endsWith(".mp3") || n.endsWith(".wav") || n.endsWith(".m4a") || n.endsWith(".ogg")) return "audio";
        if (n.endsWith(".mp4") || n.endsWith(".webm") || n.endsWith(".mkv")) return "video";
        if (n.endsWith(".png") || n.endsWith(".jpg") || n.endsWith(".jpeg") || n.endsWith(".webp")) return "image";
        return "other";
    }

    private void refreshList() {
        listContainer.removeAllViews();
        List<File> all = scanAllFiles();
        long totalBytes = 0;
        List<File> filtered = new ArrayList<>();
        for (File f : all) {
            totalBytes += f.length();
            String cat = getCategory(f);
            if (!"all".equals(activeCategory) && !activeCategory.equals(cat)) continue;
            if (!searchQuery.isEmpty() && !f.getName().toLowerCase().contains(searchQuery)) continue;
            filtered.add(f);
        }

        statsText.setText("إجمالي الملفات: " + all.size() + " • المساحة المستخدمة: " + formatSize(totalBytes) + " • المعروض: " + filtered.size());

        Collections.sort(filtered, (a, b) -> {
            if (sortMode == 1) return a.getName().compareToIgnoreCase(b.getName());
            if (sortMode == 2) return Long.compare(b.length(), a.length());
            return Long.compare(b.lastModified(), a.lastModified());
        });

        if (filtered.isEmpty()) {
            TextView empty = new TextView(this);
            empty.setText("لا توجد ملفات في هذا التصنيف حالياً.");
            empty.setTextColor(Color.parseColor("#94A3B8"));
            empty.setGravity(Gravity.CENTER);
            empty.setPadding(dp(16), dp(40), dp(16), dp(40));
            listContainer.addView(empty);
            return;
        }

        for (File f : filtered) {
            listContainer.addView(buildFileRow(f));
        }
    }

    private View buildFileRow(final File f) {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.CENTER_VERTICAL);
        row.setPadding(dp(12), dp(10), dp(12), dp(10));
        GradientDrawable bg = new GradientDrawable();
        bg.setCornerRadius(dp(14));
        bg.setColor(Color.parseColor("#1E293B"));
        row.setBackground(bg);
        LinearLayout.LayoutParams rlp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        rlp.bottomMargin = dp(8);
        row.setLayoutParams(rlp);

        String cat = getCategory(f);
        String ico = "📄";
        if ("pdf".equals(cat)) ico = "📕";
        else if ("audio".equals(cat)) ico = "🎵";
        else if ("video".equals(cat)) ico = "🎬";
        else if ("image".equals(cat)) ico = "🖼️";

        TextView icon = new TextView(this);
        icon.setText(ico);
        icon.setTextSize(TypedValue.COMPLEX_UNIT_SP, 24);
        icon.setPadding(dp(4), 0, dp(10), 0);
        row.addView(icon);

        LinearLayout info = new LinearLayout(this);
        info.setOrientation(LinearLayout.VERTICAL);
        info.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));

        TextView name = new TextView(this);
        name.setText(f.getName());
        name.setTextColor(Color.WHITE);
        name.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13.5f);
        name.setTypeface(Typeface.DEFAULT_BOLD);
        info.addView(name);

        TextView meta = new TextView(this);
        meta.setText(formatSize(f.length()) + " • " + (f.getParentFile() != null ? f.getParentFile().getName() : ""));
        meta.setTextColor(Color.parseColor("#94A3B8"));
        meta.setTextSize(TypedValue.COMPLEX_UNIT_SP, 11.5f);
        info.addView(meta);
        row.addView(info);

        Button shareBtn = makeChip("مشاركة", "#0F766E");
        shareBtn.setOnClickListener(v -> shareFile(f));
        row.addView(shareBtn);

        Button delBtn = makeChip("🗑", "#B91C1C");
        delBtn.setOnClickListener(v -> confirmDelete(f));
        row.addView(delBtn);

        row.setOnClickListener(v -> openFileSmart(f, cat));
        return row;
    }

    private void openFileSmart(File f, String cat) {
        if (f.getName().toLowerCase().endsWith(".pdf")) {
            Intent i = new Intent(this, MoonBookReaderActivity.class);
            i.putExtra("file_path", f.getAbsolutePath());
            startActivity(i);
        } else if ("video".equals(cat) || "audio".equals(cat)) {
            Intent i = new Intent(this, MxMediaPlayerActivity.class);
            i.putExtra("file_path", f.getAbsolutePath());
            startActivity(i);
        } else {
            try {
                Uri uri = FileProvider.getUriForFile(this, getPackageName() + ".fileprovider", f);
                Intent i = new Intent(Intent.ACTION_VIEW);
                i.setDataAndType(uri, "image/*");
                i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                startActivity(i);
            } catch (Exception e) {
                Toast.makeText(this, "تعذر فتح الملف", Toast.LENGTH_SHORT).show();
            }
        }
    }

    private void shareFile(File f) {
        try {
            Uri uri = FileProvider.getUriForFile(this, getPackageName() + ".fileprovider", f);
            Intent share = new Intent(Intent.ACTION_SEND);
            share.setType("*/*");
            share.putExtra(Intent.EXTRA_STREAM, uri);
            share.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            startActivity(Intent.createChooser(share, "مشاركة عبر"));
        } catch (Exception e) {
            Toast.makeText(this, "تعذر مشاركة الملف", Toast.LENGTH_SHORT).show();
        }
    }

    private void confirmDelete(final File f) {
        new AlertDialog.Builder(this)
                .setTitle("حذف الملف؟")
                .setMessage(f.getName())
                .setPositiveButton("حذف", (d, w) -> {
                    if (f.delete()) {
                        Toast.makeText(this, "تم حذف الملف", Toast.LENGTH_SHORT).show();
                        refreshList();
                    }
                })
                .setNegativeButton("إلغاء", null)
                .show();
    }

    private String formatSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1048576) return (bytes / 1024) + " KB";
        return String.format("%.1f MB", bytes / 1048576f);
    }

    private Button makeChip(String text, String hex) {
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
}
