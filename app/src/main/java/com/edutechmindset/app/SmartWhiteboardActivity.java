package com.edutechmindset.app;

import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.pdf.PdfDocument;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.HorizontalScrollView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.FileProvider;

import java.io.File;
import java.io.FileOutputStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class SmartWhiteboardActivity extends AppCompatActivity {

    private static final int TOOL_PEN = 0;
    private static final int TOOL_HIGHLIGHTER = 1;
    private static final int TOOL_ERASER = 2;
    private static final int TOOL_LASER = 3;
    private static final int TOOL_LINE = 4;
    private static final int TOOL_RECT = 5;
    private static final int TOOL_CIRCLE = 6;

    private static final int BG_WHITE = 0;
    private static final int BG_CHALK = 1;
    private static final int BG_LINED = 2;
    private static final int BG_GRID = 3;

    private static class StrokeItem {
        Path path;
        Paint paint;
        String text;
        float textX, textY;
    }

    private static class PageModel {
        List<StrokeItem> strokes = new ArrayList<>();
        List<StrokeItem> redoStack = new ArrayList<>();
        int bgMode = BG_WHITE;
    }

    private final List<PageModel> pages = new ArrayList<>();
    private int currentPageIndex = 0;
    private int currentTool = TOOL_PEN;
    private int currentColor = Color.parseColor("#0F172A");
    private float currentStrokeWidth = 7f;
    private boolean toolbarVisible = true;

    private WhiteboardCanvasView boardView;
    private LinearLayout topBar;
    private HorizontalScrollView toolsScroll;
    private TextView pageIndicator;
    private EduTechDatabaseHelper dbHelper;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        dbHelper = new EduTechDatabaseHelper(this);
        pages.add(new PageModel());

        FrameLayout root = new FrameLayout(this);
        root.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        root.setBackgroundColor(Color.WHITE);

        boardView = new WhiteboardCanvasView(this);
        root.addView(boardView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        // Top Bar
        topBar = new LinearLayout(this);
        topBar.setOrientation(LinearLayout.HORIZONTAL);
        topBar.setGravity(Gravity.CENTER_VERTICAL);
        topBar.setBackgroundColor(Color.parseColor("#E60F4C5C"));
        topBar.setPadding(16, 12, 16, 12);

        topBar.addView(makeChip("← خروج", Color.parseColor("#334155"), v -> finish()));

        pageIndicator = new TextView(this);
        pageIndicator.setTextColor(Color.WHITE);
        pageIndicator.setTextSize(13f);
        pageIndicator.setPadding(16, 0, 16, 0);
        updatePageIndicator();
        topBar.addView(pageIndicator);

        topBar.addView(makeChip("السابقة", Color.parseColor("#1E6B7B"), v -> {
            if (currentPageIndex > 0) {
                currentPageIndex--;
                updatePageIndicator();
                boardView.invalidate();
            }
        }));
        topBar.addView(makeChip("+ صفحة", Color.parseColor("#0D9488"), v -> {
            pages.add(new PageModel());
            currentPageIndex = pages.size() - 1;
            updatePageIndicator();
            boardView.invalidate();
            Toast.makeText(this, "تم إنشاء صفحة جديدة (" + (currentPageIndex + 1) + ")", Toast.LENGTH_SHORT).show();
        }));
        topBar.addView(makeChip("💾 حفظ PDF", Color.parseColor("#D97706"), v -> exportPagesToPdf()));

        FrameLayout.LayoutParams topLp = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.TOP);
        root.addView(topBar, topLp);

        // Bottom Tools Bar
        toolsScroll = new HorizontalScrollView(this);
        toolsScroll.setBackgroundColor(Color.parseColor("#F20F172A"));
        toolsScroll.setHorizontalScrollBarEnabled(false);

        LinearLayout toolsRow = new LinearLayout(this);
        toolsRow.setOrientation(LinearLayout.HORIZONTAL);
        toolsRow.setGravity(Gravity.CENTER_VERTICAL);
        toolsRow.setPadding(14, 14, 14, 14);

        toolsRow.addView(makeChip("✏️ قلم", Color.parseColor("#0284C7"), v -> { currentTool = TOOL_PEN; toast("أداة القلم"); }));
        toolsRow.addView(makeChip("🖍️ تحديد", Color.parseColor("#CA8A04"), v -> { currentTool = TOOL_HIGHLIGHTER; toast("قلم التحديد الفسفوري"); }));
        toolsRow.addView(makeChip("🔴 ليزر", Color.parseColor("#DC2626"), v -> { currentTool = TOOL_LASER; toast("مؤشر الليزر الأحمر"); }));
        toolsRow.addView(makeChip("🧽 ممحاة", Color.parseColor("#475569"), v -> { currentTool = TOOL_ERASER; toast("الممحاة"); }));
        toolsRow.addView(makeChip("📏 خط", Color.parseColor("#334155"), v -> { currentTool = TOOL_LINE; toast("خط مستقيم"); }));
        toolsRow.addView(makeChip("▭ مستطيل", Color.parseColor("#334155"), v -> { currentTool = TOOL_RECT; toast("مستطيل"); }));
        toolsRow.addView(makeChip("◯ دائرة", Color.parseColor("#334155"), v -> { currentTool = TOOL_CIRCLE; toast("دائرة"); }));
        toolsRow.addView(makeChip("🔤 نص", Color.parseColor("#4F46E5"), v -> promptAddText()));
        toolsRow.addView(makeChip("🎨 خلفية", Color.parseColor("#0F766E"), v -> cycleBackground()));
        toolsRow.addView(makeChip("⚫", Color.parseColor("#0F172A"), v -> { currentColor = Color.parseColor("#0F172A"); toast("لون أسود"); }));
        toolsRow.addView(makeChip("🔵", Color.parseColor("#1D4ED8"), v -> { currentColor = Color.parseColor("#1D4ED8"); toast("لون أزرق"); }));
        toolsRow.addView(makeChip("🔴", Color.parseColor("#DC2626"), v -> { currentColor = Color.parseColor("#DC2626"); toast("لون أحمر"); }));
        toolsRow.addView(makeChip("🟢", Color.parseColor("#15803D"), v -> { currentColor = Color.parseColor("#15803D"); toast("لون أخضر"); }));
        toolsRow.addView(makeChip("⚪", Color.parseColor("#64748B"), v -> { currentColor = Color.WHITE; toast("لون أبيض للسبورة الداكنة"); }));
        toolsRow.addView(makeChip("↩️ تراجع", Color.parseColor("#334155"), v -> undo()));
        toolsRow.addView(makeChip("↪️ إعادة", Color.parseColor("#334155"), v -> redo()));
        toolsRow.addView(makeChip("🗑️ مسح", Color.parseColor("#991B1B"), v -> {
            currentPage().strokes.clear();
            currentPage().redoStack.clear();
            boardView.invalidate();
        }));

        toolsScroll.addView(toolsRow);
        FrameLayout.LayoutParams botLp = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.BOTTOM);
        root.addView(toolsScroll, botLp);

        // Floating Toggle Fullscreen Button
        Button toggleBtn = makeChip("👁️", Color.parseColor("#0F4C5C"), v -> {
            toolbarVisible = !toolbarVisible;
            int vis = toolbarVisible ? View.VISIBLE : View.GONE;
            topBar.setVisibility(vis);
            toolsScroll.setVisibility(vis);
        });
        FrameLayout.LayoutParams togLp = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.BOTTOM | Gravity.START);
        togLp.setMargins(20, 0, 20, 140);
        root.addView(toggleBtn, togLp);

        setContentView(root);
    }

    private PageModel currentPage() {
        return pages.get(currentPageIndex);
    }

    private void updatePageIndicator() {
        pageIndicator.setText("صفحة " + (currentPageIndex + 1) + " / " + pages.size());
    }

    private void toast(String msg) {
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show();
    }

    private Button makeChip(String label, int bgColor, View.OnClickListener listener) {
        Button b = new Button(this);
        b.setText(label);
        b.setTextColor(Color.WHITE);
        b.setTextSize(12f);
        b.setAllCaps(false);
        b.setBackgroundColor(bgColor);
        b.setPadding(22, 10, 22, 10);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        lp.setMargins(6, 0, 6, 0);
        b.setLayoutParams(lp);
        b.setOnClickListener(listener);
        return b;
    }

    private void cycleBackground() {
        PageModel p = currentPage();
        p.bgMode = (p.bgMode + 1) % 4;
        String[] names = {"سبورة بيضاء", "سبورة طباشيرية خضراء", "ورقة مسطّرة", "شبكة مربعات ومحاور"};
        if (p.bgMode == BG_CHALK && currentColor == Color.parseColor("#0F172A")) {
            currentColor = Color.WHITE;
        } else if (p.bgMode != BG_CHALK && currentColor == Color.WHITE) {
            currentColor = Color.parseColor("#0F172A");
        }
        toast("الخلفية: " + names[p.bgMode]);
        boardView.invalidate();
    }

    private void undo() {
        PageModel p = currentPage();
        if (!p.strokes.isEmpty()) {
            p.redoStack.add(p.strokes.remove(p.strokes.size() - 1));
            boardView.invalidate();
        }
    }

    private void redo() {
        PageModel p = currentPage();
        if (!p.redoStack.isEmpty()) {
            p.strokes.add(p.redoStack.remove(p.redoStack.size() - 1));
            boardView.invalidate();
        }
    }

    private void promptAddText() {
        EditText input = new EditText(this);
        input.setHint("اكتب النص العربي أو المعادلة هنا...");
        new AlertDialog.Builder(this)
                .setTitle("إضافة نص على السبورة")
                .setView(input)
                .setPositiveButton("إضافة", (d, w) -> {
                    String txt = input.getText().toString().trim();
                    if (!txt.isEmpty()) {
                        StrokeItem item = new StrokeItem();
                        item.text = txt;
                        item.textX = boardView.getWidth() / 2f;
                        item.textY = boardView.getHeight() / 2f;
                        Paint tp = new Paint(Paint.ANTI_ALIAS_FLAG);
                        tp.setColor(currentColor);
                        tp.setTextSize(46f);
                        tp.setTextAlign(Paint.Align.CENTER);
                        item.paint = tp;
                        currentPage().strokes.add(item);
                        boardView.invalidate();
                    }
                })
                .setNegativeButton("إلغاء", null)
                .show();
    }

    private void exportPagesToPdf() {
        try {
            int w = Math.max(boardView.getWidth(), 1080);
            int h = Math.max(boardView.getHeight(), 1920);
            PdfDocument doc = new PdfDocument();
            int savedIdx = currentPageIndex;
            for (int i = 0; i < pages.size(); i++) {
                currentPageIndex = i;
                PdfDocument.PageInfo info = new PdfDocument.PageInfo.Builder(w, h, i + 1).create();
                PdfDocument.Page page = doc.startPage(info);
                boardView.renderPageToCanvas(page.getCanvas(), pages.get(i), w, h);
                doc.finishPage(page);
            }
            currentPageIndex = savedIdx;

            File dir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "EduTech_Mindset/PDF");
            if (!dir.exists()) dir.mkdirs();
            String ts = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(new Date());
            File outFile = new File(dir, "Whiteboard_" + ts + ".pdf");
            try (FileOutputStream fos = new FileOutputStream(outFile)) {
                doc.writeTo(fos);
            }
            doc.close();

            dbHelper.insertSavedFile("شرح السبورة " + ts, outFile.getAbsolutePath(), "PDF", "application/pdf");
            dbHelper.recordWhiteboardSession("شرح السبورة " + ts, outFile.getAbsolutePath(), pages.size());

            new AlertDialog.Builder(this)
                    .setTitle("تم حفظ شرح السبورة ✓")
                    .setMessage("تم الحفظ في:\nDownloads/EduTech_Mindset/PDF/" + outFile.getName())
                    .setPositiveButton("مشاركة واتساب/تيليجرام", (d, which) -> shareFile(outFile))
                    .setNegativeButton("تم", null)
                    .show();
        } catch (Exception e) {
            Toast.makeText(this, "تعذر حفظ PDF: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    private void shareFile(File file) {
        try {
            Uri uri = FileProvider.getUriForFile(this, getPackageName() + ".fileprovider", file);
            Intent share = new Intent(Intent.ACTION_SEND);
            share.setType("application/pdf");
            share.putExtra(Intent.EXTRA_STREAM, uri);
            share.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            startActivity(Intent.createChooser(share, "مشاركة ملف السبورة"));
        } catch (Exception e) {
            Toast.makeText(this, "تعذرت المشاركة", Toast.LENGTH_SHORT).show();
        }
    }

    private class WhiteboardCanvasView extends View {
        private Path activePath;
        private Paint activePaint;
        private float startX, startY;
        private float laserX = -1, laserY = -1;
        private final Paint laserPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint gridPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint axisPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Handler laserHandler = new Handler(Looper.getMainLooper());
        private final Runnable clearLaser = () -> { laserX = -1; laserY = -1; invalidate(); };

        public WhiteboardCanvasView(Context context) {
            super(context);
            laserPaint.setColor(Color.parseColor("#EF4444"));
            laserPaint.setStyle(Paint.Style.FILL);
            gridPaint.setColor(Color.parseColor("#CBD5E1"));
            gridPaint.setStrokeWidth(1.5f);
            axisPaint.setColor(Color.parseColor("#334155"));
            axisPaint.setStrokeWidth(3.5f);
        }

        public void renderPageToCanvas(Canvas canvas, PageModel page, int w, int h) {
            if (page.bgMode == BG_CHALK) {
                canvas.drawColor(Color.parseColor("#143D2B"));
            } else {
                canvas.drawColor(Color.WHITE);
            }
            if (page.bgMode == BG_LINED) {
                for (int y = 120; y < h; y += 72) {
                    canvas.drawLine(0, y, w, y, gridPaint);
                }
            } else if (page.bgMode == BG_GRID) {
                int step = 64;
                for (int x = 0; x < w; x += step) canvas.drawLine(x, 0, x, h, gridPaint);
                for (int y = 0; y < h; y += step) canvas.drawLine(0, y, w, y, gridPaint);
                canvas.drawLine(w / 2f, 0, w / 2f, h, axisPaint);
                canvas.drawLine(0, h / 2f, w, h / 2f, axisPaint);
            }
            for (StrokeItem s : page.strokes) {
                if (s.text != null) {
                    canvas.drawText(s.text, s.textX, s.textY, s.paint);
                } else if (s.path != null) {
                    canvas.drawPath(s.path, s.paint);
                }
            }
        }

        @Override
        protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            renderPageToCanvas(canvas, currentPage(), getWidth(), getHeight());
            if (activePath != null && activePaint != null) {
                canvas.drawPath(activePath, activePaint);
            }
            if (laserX >= 0 && laserY >= 0) {
                laserPaint.setAlpha(70);
                canvas.drawCircle(laserX, laserY, 28f, laserPaint);
                laserPaint.setAlpha(255);
                canvas.drawCircle(laserX, laserY, 10f, laserPaint);
            }
        }

        @Override
        public boolean onTouchEvent(MotionEvent event) {
            float x = event.getX();
            float y = event.getY();
            if (currentTool == TOOL_LASER) {
                laserX = x;
                laserY = y;
                laserHandler.removeCallbacks(clearLaser);
                if (event.getAction() == MotionEvent.ACTION_UP) {
                    laserHandler.postDelayed(clearLaser, 650);
                }
                invalidate();
                return true;
            }
            switch (event.getAction()) {
                case MotionEvent.ACTION_DOWN:
                    startX = x;
                    startY = y;
                    activePath = new Path();
                    activePath.moveTo(x, y);
                    activePaint = buildPaint();
                    invalidate();
                    return true;
                case MotionEvent.ACTION_MOVE:
                    if (activePath != null) {
                        if (currentTool == TOOL_LINE || currentTool == TOOL_RECT || currentTool == TOOL_CIRCLE) {
                            activePath.reset();
                            if (currentTool == TOOL_LINE) {
                                activePath.moveTo(startX, startY);
                                activePath.lineTo(x, y);
                            } else if (currentTool == TOOL_RECT) {
                                activePath.addRect(Math.min(startX, x), Math.min(startY, y), Math.max(startX, x), Math.max(startY, y), Path.Direction.CW);
                            } else {
                                float r = (float) Math.hypot(x - startX, y - startY);
                                activePath.addCircle(startX, startY, r, Path.Direction.CW);
                            }
                        } else {
                            activePath.lineTo(x, y);
                        }
                        invalidate();
                    }
                    return true;
                case MotionEvent.ACTION_UP:
                    if (activePath != null && activePaint != null) {
                        StrokeItem item = new StrokeItem();
                        item.path = activePath;
                        item.paint = activePaint;
                        currentPage().strokes.add(item);
                        currentPage().redoStack.clear();
                        activePath = null;
                        activePaint = null;
                        invalidate();
                    }
                    return true;
            }
            return super.onTouchEvent(event);
        }

        private Paint buildPaint() {
            Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
            p.setStyle(Paint.Style.STROKE);
            p.setStrokeCap(Paint.Cap.ROUND);
            p.setStrokeJoin(Paint.Join.ROUND);
            if (currentTool == TOOL_ERASER) {
                p.setColor(currentPage().bgMode == BG_CHALK ? Color.parseColor("#143D2B") : Color.WHITE);
                p.setStrokeWidth(42f);
            } else if (currentTool == TOOL_HIGHLIGHTER) {
                p.setColor(Color.parseColor("#66FACC15"));
                p.setStrokeWidth(30f);
            } else {
                p.setColor(currentColor);
                p.setStrokeWidth(currentStrokeWidth);
            }
            return p;
        }
    }
}
