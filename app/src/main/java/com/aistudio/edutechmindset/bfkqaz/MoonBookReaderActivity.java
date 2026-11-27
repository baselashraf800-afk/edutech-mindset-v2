package com.aistudio.edutechmindset.bfkqaz;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.ColorMatrixColorFilter;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.graphics.pdf.PdfRenderer;
import android.os.Bundle;
import android.os.Environment;
import android.os.ParcelFileDescriptor;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.SeekBar;
import android.widget.TextView;
import android.widget.Toast;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class MoonBookReaderActivity extends Activity {

    private static final String PREF_READER = "edutech_moon_reader_v1";
    private SharedPreferences prefs;

    private FrameLayout rootLayout;
    private LinearLayout readerContainer;
    private LinearLayout shelfContainer;

    private PdfRenderer pdfRenderer;
    private ParcelFileDescriptor pdfFd;
    private PdfRenderer.Page currentPage;
    private ImageView pdfImageView;
    private TextView pageInfoText;
    private SeekBar pageSeekBar;

    private File activeFile;
    private int currentPageIndex = 0;
    private int totalPages = 0;
    private int themeMode = 0; // 0=نهاري, 1=سيبيا دافئ, 2=ليلي, 3=أموليد

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        prefs = getSharedPreferences(PREF_READER, MODE_PRIVATE);
        themeMode = prefs.getInt("theme_mode", 0);

        rootLayout = new FrameLayout(this);
        rootLayout.setBackgroundColor(Color.parseColor("#0F172A"));
        setContentView(rootLayout);

        String filePath = getIntent() != null ? getIntent().getStringExtra("file_path") : null;
        if (filePath != null && new File(filePath).exists()) {
            openBook(new File(filePath));
        } else {
            showBookshelf();
        }
    }

    private List<File> collectBooks() {
        List<File> books = new ArrayList<>();
        List<File> dirs = new ArrayList<>();
        dirs.add(new File(getFilesDir(), "EduTechVault"));
        dirs.add(new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS), "EduTechMindset"));
        dirs.add(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS));

        for (File d : dirs) {
            if (d == null || !d.exists() || !d.isDirectory()) continue;
            File[] list = d.listFiles();
            if (list == null) continue;
            for (File f : list) {
                if (f.isFile() && f.getName().toLowerCase().endsWith(".pdf")) {
                    books.add(f);
                }
            }
        }
        return books;
    }

    private void showBookshelf() {
        rootLayout.removeAllViews();
        shelfContainer = new LinearLayout(this);
        shelfContainer.setOrientation(LinearLayout.VERTICAL);
        shelfContainer.setBackgroundColor(Color.parseColor("#0B1120"));
        shelfContainer.setPadding(dp(16), dp(22), dp(16), dp(20));

        LinearLayout topBar = new LinearLayout(this);
        topBar.setOrientation(LinearLayout.HORIZONTAL);
        topBar.setGravity(Gravity.CENTER_VERTICAL);

        Button backBtn = makePillBtn("← رجوع", "#1E293B", Color.WHITE);
        backBtn.setOnClickListener(v -> finish());
        topBar.addView(backBtn);

        TextView title = new TextView(this);
        title.setText("📖 مكتبة القراءة الاحترافية (Moon+ Style)");
        title.setTextColor(Color.parseColor("#FBBF24"));
        title.setTextSize(TypedValue.COMPLEX_UNIT_SP, 17);
        title.setTypeface(Typeface.DEFAULT_BOLD);
        title.setGravity(Gravity.END | Gravity.CENTER_VERTICAL);
        LinearLayout.LayoutParams tlp = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f);
        title.setLayoutParams(tlp);
        topBar.addView(title);
        shelfContainer.addView(topBar);

        ScrollView scroll = new ScrollView(this);
        LinearLayout listBox = new LinearLayout(this);
        listBox.setOrientation(LinearLayout.VERTICAL);
        listBox.setPadding(0, dp(14), 0, dp(20));

        List<File> books = collectBooks();
        if (books.isEmpty()) {
            TextView empty = new TextView(this);
            empty.setText("لا توجد كتب PDF محفوظة بعد.\nاحفظ أي كتاب أو ملخص PDF من المنصة وسيظهر هنا تلقائياً على رف القراءة ✨");
            empty.setTextColor(Color.parseColor("#94A3B8"));
            empty.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
            empty.setGravity(Gravity.CENTER);
            empty.setPadding(dp(20), dp(48), dp(20), dp(48));
            listBox.addView(empty);
        } else {
            for (File book : books) {
                listBox.addView(buildBookShelfCard(book));
            }
        }
        scroll.addView(listBox);
        shelfContainer.addView(scroll, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));
        rootLayout.addView(shelfContainer);
    }

    private View buildBookShelfCard(final File book) {
        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.HORIZONTAL);
        card.setGravity(Gravity.CENTER_VERTICAL);
        card.setPadding(dp(14), dp(14), dp(14), dp(14));
        GradientDrawable bg = new GradientDrawable();
        bg.setCornerRadius(dp(16));
        bg.setColor(Color.parseColor("#1E293B"));
        bg.setStroke(dp(1), Color.parseColor("#334155"));
        card.setBackground(bg);

        LinearLayout.LayoutParams clp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        clp.bottomMargin = dp(10);
        card.setLayoutParams(clp);

        int lastPage = prefs.getInt("page_" + book.getAbsolutePath(), 0);
        int savedTotal = prefs.getInt("total_" + book.getAbsolutePath(), 0);
        int pct = (savedTotal > 0) ? Math.min(100, Math.round(((lastPage + 1) * 100f) / savedTotal)) : 0;

        TextView icon = new TextView(this);
        icon.setText("📕");
        icon.setTextSize(TypedValue.COMPLEX_UNIT_SP, 28);
        icon.setPadding(dp(4), 0, dp(10), 0);
        card.addView(icon);

        LinearLayout info = new LinearLayout(this);
        info.setOrientation(LinearLayout.VERTICAL);
        info.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));

        TextView name = new TextView(this);
        name.setText(book.getName());
        name.setTextColor(Color.WHITE);
        name.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        name.setTypeface(Typeface.DEFAULT_BOLD);
        info.addView(name);

        TextView sub = new TextView(this);
        long kb = Math.max(1, book.length() / 1024);
        String prog = savedTotal > 0 ? (" • التقدم: " + pct + "% (" + (lastPage + 1) + "/" + savedTotal + ")") : "";
        sub.setText(kb + " KB" + prog);
        sub.setTextColor(Color.parseColor("#38BDF8"));
        sub.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
        info.addView(sub);
        card.addView(info);

        Button openBtn = makePillBtn("قراءة", "#0284C7", Color.WHITE);
        openBtn.setOnClickListener(v -> openBook(book));
        card.addView(openBtn);

        card.setOnClickListener(v -> openBook(book));
        return card;
    }

    private void openBook(File book) {
        closePdf();
        activeFile = book;
        try {
            pdfFd = ParcelFileDescriptor.open(book, ParcelFileDescriptor.MODE_READ_ONLY);
            pdfRenderer = new PdfRenderer(pdfFd);
            totalPages = pdfRenderer.getPageCount();
            if (totalPages <= 0) {
                Toast.makeText(this, "الملف لا يحتوي على صفحات صالحة", Toast.LENGTH_SHORT).show();
                showBookshelf();
                return;
            }
            prefs.edit().putInt("total_" + book.getAbsolutePath(), totalPages).apply();
            currentPageIndex = Math.max(0, Math.min(totalPages - 1, prefs.getInt("page_" + book.getAbsolutePath(), 0)));
            buildReaderUi();
            renderPage(currentPageIndex);
        } catch (Exception e) {
            Toast.makeText(this, "تعذر فتح الكتاب: " + e.getMessage(), Toast.LENGTH_LONG).show();
            showBookshelf();
        }
    }

    private void buildReaderUi() {
        rootLayout.removeAllViews();
        readerContainer = new LinearLayout(this);
        readerContainer.setOrientation(LinearLayout.VERTICAL);

        // شريط القراءة العلوي
        LinearLayout topBar = new LinearLayout(this);
        topBar.setOrientation(LinearLayout.HORIZONTAL);
        topBar.setGravity(Gravity.CENTER_VERTICAL);
        topBar.setPadding(dp(10), dp(14), dp(10), dp(10));
        topBar.setBackgroundColor(Color.parseColor("#0F172A"));

        Button backBtn = makePillBtn("الأرفف", "#1E293B", Color.WHITE);
        backBtn.setOnClickListener(v -> {
            closePdf();
            showBookshelf();
        });
        topBar.addView(backBtn);

        pageInfoText = new TextView(this);
        pageInfoText.setTextColor(Color.WHITE);
        pageInfoText.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
        pageInfoText.setTypeface(Typeface.DEFAULT_BOLD);
        pageInfoText.setGravity(Gravity.CENTER);
        pageInfoText.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
        topBar.addView(pageInfoText);

        Button bmBtn = makePillBtn("🔖", "#334155", Color.WHITE);
        bmBtn.setOnClickListener(v -> {
            prefs.edit().putInt("bookmark_" + activeFile.getAbsolutePath(), currentPageIndex).apply();
            Toast.makeText(this, "تم حفظ الإشارة المرجعية عند صفحة " + (currentPageIndex + 1) + " 🔖", Toast.LENGTH_SHORT).show();
        });
        topBar.addView(bmBtn);

        Button themeBtn = makePillBtn("🎨 ثيم", "#4F46E5", Color.WHITE);
        themeBtn.setOnClickListener(v -> {
            themeMode = (themeMode + 1) % 4;
            prefs.edit().putInt("theme_mode", themeMode).apply();
            applyThemeToReader();
            String[] names = {"نهاري أبيض", "سيبيا مريح للعين", "ليلي داكن", "أموليد أسود"};
            Toast.makeText(this, "تم التبديل إلى: " + names[themeMode], Toast.LENGTH_SHORT).show();
        });
        topBar.addView(themeBtn);
        readerContainer.addView(topBar);

        // منطقة عرض الصفحة
        ScrollView pageScroll = new ScrollView(this);
        pageScroll.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));
        pdfImageView = new ImageView(this);
        pdfImageView.setAdjustViewBounds(true);
        pdfImageView.setScaleType(ImageView.ScaleType.FIT_CENTER);
        pdfImageView.setPadding(dp(8), dp(8), dp(8), dp(8));
        pageScroll.addView(pdfImageView);
        readerContainer.addView(pageScroll);

        // شريط التحكم السفلي (SeekBar + أزرار تقليب)
        LinearLayout bottomBar = new LinearLayout(this);
        bottomBar.setOrientation(LinearLayout.VERTICAL);
        bottomBar.setPadding(dp(12), dp(8), dp(12), dp(14));
        bottomBar.setBackgroundColor(Color.parseColor("#0F172A"));

        pageSeekBar = new SeekBar(this);
        pageSeekBar.setMax(Math.max(0, totalPages - 1));
        pageSeekBar.setProgress(currentPageIndex);
        pageSeekBar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                if (fromUser) renderPage(progress);
            }
            @Override public void onStartTrackingTouch(SeekBar seekBar) {}
            @Override public void onStopTrackingTouch(SeekBar seekBar) {}
        });
        bottomBar.addView(pageSeekBar);

        LinearLayout navRow = new LinearLayout(this);
        navRow.setOrientation(LinearLayout.HORIZONTAL);
        navRow.setGravity(Gravity.CENTER);
        navRow.setPadding(0, dp(6), 0, 0);

        Button prevBtn = makePillBtn("◀ السابقة", "#1E293B", Color.WHITE);
        prevBtn.setOnClickListener(v -> renderPage(currentPageIndex - 1));
        navRow.addView(prevBtn);

        Button goBmBtn = makePillBtn("انتقال للإشارة 🔖", "#0F766E", Color.WHITE);
        goBmBtn.setOnClickListener(v -> {
            int bm = prefs.getInt("bookmark_" + activeFile.getAbsolutePath(), -1);
            if (bm >= 0 && bm < totalPages) renderPage(bm);
            else Toast.makeText(this, "لا توجد إشارة محفوظة لهذا الكتاب", Toast.LENGTH_SHORT).show();
        });
        navRow.addView(goBmBtn);

        Button nextBtn = makePillBtn("التالية ▶", "#0284C7", Color.WHITE);
        nextBtn.setOnClickListener(v -> renderPage(currentPageIndex + 1));
        navRow.addView(nextBtn);

        bottomBar.addView(navRow);
        readerContainer.addView(bottomBar);
        rootLayout.addView(readerContainer);

        applyThemeToReader();
    }

    private void applyThemeToReader() {
        if (readerContainer == null || pdfImageView == null) return;
        if (themeMode == 0) {
            readerContainer.setBackgroundColor(Color.parseColor("#F8FAFC"));
            pdfImageView.setColorFilter(null);
        } else if (themeMode == 1) {
            readerContainer.setBackgroundColor(Color.parseColor("#F5E6C8"));
            pdfImageView.setColorFilter(new ColorMatrixColorFilter(new float[]{
                    0.95f, 0, 0, 0, 0,
                    0, 0.88f, 0, 0, 0,
                    0, 0, 0.72f, 0, 0,
                    0, 0, 0, 1, 0
            }));
        } else if (themeMode == 2) {
            readerContainer.setBackgroundColor(Color.parseColor("#1E293B"));
            pdfImageView.setColorFilter(new ColorMatrixColorFilter(new float[]{
                    -0.85f, 0, 0, 0, 235,
                    0, -0.85f, 0, 0, 235,
                    0, 0, -0.85f, 0, 235,
                    0, 0, 0, 1, 0
            }));
        } else {
            readerContainer.setBackgroundColor(Color.BLACK);
            pdfImageView.setColorFilter(new ColorMatrixColorFilter(new float[]{
                    -1f, 0, 0, 0, 255,
                    0, -1f, 0, 0, 255,
                    0, 0, -1f, 0, 255,
                    0, 0, 0, 1, 0
            }));
        }
    }

    private void renderPage(int index) {
        if (pdfRenderer == null || index < 0 || index >= totalPages) return;
        try {
            if (currentPage != null) currentPage.close();
            currentPage = pdfRenderer.openPage(index);
            currentPageIndex = index;

            int width = Math.max(720, getResources().getDisplayMetrics().widthPixels);
            int height = Math.max(960, Math.round(width * ((float) currentPage.getHeight() / Math.max(1, currentPage.getWidth()))));
            Bitmap bmp = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
            bmp.eraseColor(Color.WHITE);
            currentPage.render(bmp, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY);
            pdfImageView.setImageBitmap(bmp);

            int pct = Math.round(((index + 1) * 100f) / totalPages);
            pageInfoText.setText("صفحة " + (index + 1) + " / " + totalPages + " (" + pct + "%)");
            if (pageSeekBar != null && pageSeekBar.getProgress() != index) pageSeekBar.setProgress(index);
            if (activeFile != null) {
                prefs.edit().putInt("page_" + activeFile.getAbsolutePath(), index).apply();
            }
        } catch (Exception ignored) {}
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (pdfRenderer != null) {
            if (keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
                renderPage(currentPageIndex + 1);
                return true;
            }
            if (keyCode == KeyEvent.KEYCODE_VOLUME_UP) {
                renderPage(currentPageIndex - 1);
                return true;
            }
        }
        return super.onKeyDown(keyCode, event);
    }

    private void closePdf() {
        try { if (currentPage != null) { currentPage.close(); currentPage = null; } } catch (Exception ignored) {}
        try { if (pdfRenderer != null) { pdfRenderer.close(); pdfRenderer = null; } } catch (Exception ignored) {}
        try { if (pdfFd != null) { pdfFd.close(); pdfFd = null; } } catch (Exception ignored) {}
    }

    @Override
    protected void onDestroy() {
        closePdf();
        super.onDestroy();
    }

    private Button makePillBtn(String text, String bgHex, int fgColor) {
        Button b = new Button(this);
        b.setText(text);
        b.setTextColor(fgColor);
        b.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
        b.setTypeface(Typeface.DEFAULT_BOLD);
        GradientDrawable g = new GradientDrawable();
        g.setCornerRadius(dp(12));
        g.setColor(Color.parseColor(bgHex));
        b.setBackground(g);
        b.setPadding(dp(12), dp(6), dp(12), dp(6));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, dp(36));
        lp.setMargins(dp(4), 0, dp(4), 0);
        b.setLayoutParams(lp);
        return b;
    }

    private int dp(int v) {
        return Math.round(v * getResources().getDisplayMetrics().density);
    }
}
