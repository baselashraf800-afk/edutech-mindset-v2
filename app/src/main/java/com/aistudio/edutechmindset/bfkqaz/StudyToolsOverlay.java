package com.aistudio.edutechmindset.bfkqaz;

import android.app.Activity;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.CountDownTimer;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.GridLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class StudyToolsOverlay {

    private final Activity activity;
    private final FrameLayout rootContainer;
    private final SoundEngine soundEngine;
    private final EduTechPrefs prefs;

    private View whiteboardView;
    private View calculatorView;
    private View timerBadgeView;
    private CountDownTimer activeTimer;
    private boolean timerRunning = false;
    private long remainingMillis = 25 * 60 * 1000L;

    public StudyToolsOverlay(Activity activity, FrameLayout rootContainer, SoundEngine soundEngine, EduTechPrefs prefs) {
        this.activity = activity;
        this.rootContainer = rootContainer;
        this.soundEngine = soundEngine;
        this.prefs = prefs;
    }

    public boolean hasActiveOverlay() {
        return (whiteboardView != null && whiteboardView.getParent() != null)
                || (calculatorView != null && calculatorView.getParent() != null);
    }

    public boolean closeTopOverlay() {
        if (whiteboardView != null && whiteboardView.getParent() != null) {
            rootContainer.removeView(whiteboardView);
            whiteboardView = null;
            return true;
        }
        if (calculatorView != null && calculatorView.getParent() != null) {
            rootContainer.removeView(calculatorView);
            calculatorView = null;
            return true;
        }
        return false;
    }

    public void closeAll() {
        closeTopOverlay();
        closeTopOverlay();
    }

    // 1. Quick Whiteboard Overlay
    public void showWhiteboard() {
        if (whiteboardView != null && whiteboardView.getParent() != null) {
            rootContainer.removeView(whiteboardView);
            whiteboardView = null;
            return;
        }
        final FrameLayout overlay = new FrameLayout(activity);
        overlay.setLayoutParams(new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
        overlay.setBackgroundColor(Color.parseColor("#E60F172A"));
        overlay.setClickable(true);

        final DrawingCanvasView canvasView = new DrawingCanvasView(activity);
        overlay.addView(canvasView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));

        // Top toolbar
        LinearLayout toolbar = new LinearLayout(activity);
        toolbar.setOrientation(LinearLayout.HORIZONTAL);
        toolbar.setGravity(Gravity.CENTER_VERTICAL);
        int pad = dp(10);
        toolbar.setPadding(pad, pad, pad, pad);
        GradientDrawable barBg = new GradientDrawable();
        barBg.setColor(Color.parseColor("#F21E293B"));
        barBg.setCornerRadius(dp(16));
        barBg.setStroke(dp(1), Color.parseColor("#38BDF8"));
        toolbar.setBackground(barBg);

        FrameLayout.LayoutParams barLp = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                Gravity.TOP | Gravity.CENTER_HORIZONTAL
        );
        barLp.setMargins(dp(12), dp(16), dp(12), dp(12));
        toolbar.setLayoutParams(barLp);

        int[] colors = new int[]{
                Color.parseColor("#38BDF8"),
                Color.parseColor("#FACC15"),
                Color.parseColor("#4ADE80"),
                Color.parseColor("#F87171"),
                Color.WHITE
        };
        for (final int c : colors) {
            View colorDot = new View(activity);
            GradientDrawable dotBg = new GradientDrawable();
            dotBg.setShape(GradientDrawable.OVAL);
            dotBg.setColor(c);
            dotBg.setStroke(dp(2), Color.WHITE);
            colorDot.setBackground(dotBg);
            LinearLayout.LayoutParams dotLp = new LinearLayout.LayoutParams(dp(30), dp(30));
            dotLp.setMargins(dp(4), 0, dp(4), 0);
            colorDot.setLayoutParams(dotLp);
            colorDot.setOnClickListener(v -> {
                if (soundEngine != null) soundEngine.playClick();
                canvasView.setStrokeColor(c);
            });
            toolbar.addView(colorDot);
        }

        Button undoBtn = createSmallBarButton("↩ تراجع", "#334155");
        undoBtn.setOnClickListener(v -> {
            if (soundEngine != null) soundEngine.playClick();
            canvasView.undo();
        });
        toolbar.addView(undoBtn);

        Button clearBtn = createSmallBarButton("🗑 مسح", "#B91C1C");
        clearBtn.setOnClickListener(v -> {
            if (soundEngine != null) soundEngine.playClick();
            canvasView.clear();
        });
        toolbar.addView(clearBtn);

        Button closeBtn = createSmallBarButton("✖ إغلاق", "#0284C7");
        closeBtn.setOnClickListener(v -> {
            if (soundEngine != null) soundEngine.playClick();
            rootContainer.removeView(overlay);
            whiteboardView = null;
        });
        toolbar.addView(closeBtn);

        overlay.addView(toolbar);
        whiteboardView = overlay;
        rootContainer.addView(overlay);
    }

    // 2. Scientific Floating Calculator
    public void showScientificCalculator() {
        if (calculatorView != null && calculatorView.getParent() != null) {
            rootContainer.removeView(calculatorView);
            calculatorView = null;
            return;
        }
        final LinearLayout card = new LinearLayout(activity);
        card.setOrientation(LinearLayout.VERTICAL);
        int pad = dp(14);
        card.setPadding(pad, pad, pad, pad);
        GradientDrawable bg = new GradientDrawable(
                GradientDrawable.Orientation.TOP_BOTTOM,
                new int[]{Color.parseColor("#0F172A"), Color.parseColor("#1E293B")}
        );
        bg.setCornerRadius(dp(20));
        bg.setStroke(dp(2), Color.parseColor("#38BDF8"));
        card.setBackground(bg);

        FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(
                dp(320),
                ViewGroup.LayoutParams.WRAP_CONTENT,
                Gravity.CENTER
        );
        card.setLayoutParams(lp);

        // Header
        LinearLayout header = new LinearLayout(activity);
        header.setOrientation(LinearLayout.HORIZONTAL);
        header.setGravity(Gravity.CENTER_VERTICAL);
        TextView title = new TextView(activity);
        title.setText("🧮 الحاسبة العلمية العائمة");
        title.setTextColor(Color.parseColor("#38BDF8"));
        title.setTextSize(TypedValue.COMPLEX_UNIT_SP, 15);
        title.setTypeface(Typeface.DEFAULT_BOLD);
        LinearLayout.LayoutParams tLp = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f);
        header.addView(title, tLp);

        Button closeCalc = createSmallBarButton("✖", "#DC2626");
        closeCalc.setOnClickListener(v -> {
            rootContainer.removeView(card);
            calculatorView = null;
        });
        header.addView(closeCalc);
        card.addView(header);

        // Display
        final TextView display = new TextView(activity);
        display.setText("0");
        display.setTextColor(Color.WHITE);
        display.setTextSize(TypedValue.COMPLEX_UNIT_SP, 24);
        display.setTypeface(Typeface.MONOSPACE, Typeface.BOLD);
        display.setGravity(Gravity.END | Gravity.CENTER_VERTICAL);
        display.setPadding(dp(10), dp(12), dp(10), dp(12));
        GradientDrawable dispBg = new GradientDrawable();
        dispBg.setColor(Color.parseColor("#020617"));
        dispBg.setCornerRadius(dp(12));
        display.setBackground(dispBg);
        LinearLayout.LayoutParams dispLp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
        dispLp.setMargins(0, dp(8), 0, dp(8));
        card.addView(display, dispLp);

        final StringBuilder expr = new StringBuilder();
        String[] buttons = new String[]{
                "sin", "cos", "tan", "√",
                "π", "x²", "(", ")",
                "7", "8", "9", "÷",
                "4", "5", "6", "×",
                "1", "2", "3", "-",
                "C", "0", ".", "+",
                "⌫", "="
        };

        GridLayout grid = new GridLayout(activity);
        grid.setColumnCount(4);
        for (final String label : buttons) {
            Button b = new Button(activity);
            b.setText(label);
            b.setTextColor(Color.WHITE);
            b.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
            b.setTypeface(Typeface.DEFAULT_BOLD);
            GradientDrawable bBg = new GradientDrawable();
            bBg.setCornerRadius(dp(10));
            if ("=".equals(label)) {
                bBg.setColor(Color.parseColor("#0284C7"));
            } else if ("C".equals(label) || "⌫".equals(label)) {
                bBg.setColor(Color.parseColor("#B91C1C"));
            } else {
                bBg.setColor(Color.parseColor("#334155"));
            }
            b.setBackground(bBg);

            GridLayout.LayoutParams gLp = new GridLayout.LayoutParams();
            gLp.width = "=".equals(label) ? dp(140) : dp(66);
            gLp.height = dp(44);
            if ("=".equals(label)) {
                gLp.columnSpec = GridLayout.spec(GridLayout.UNDEFINED, 2);
            }
            gLp.setMargins(dp(3), dp(3), dp(3), dp(3));
            b.setLayoutParams(gLp);

            b.setOnClickListener(v -> {
                if (soundEngine != null) soundEngine.playClick();
                if ("C".equals(label)) {
                    expr.setLength(0);
                    display.setText("0");
                } else if ("⌫".equals(label)) {
                    if (expr.length() > 0) expr.deleteCharAt(expr.length() - 1);
                    display.setText(expr.length() == 0 ? "0" : expr.toString());
                } else if ("=".equals(label)) {
                    double res = evaluateExpression(expr.toString());
                    String out = Double.isNaN(res) ? "خطأ" : formatNumber(res);
                    display.setText(out);
                    expr.setLength(0);
                    if (!Double.isNaN(res)) expr.append(out);
                } else if ("sin".equals(label) || "cos".equals(label) || "tan".equals(label) || "√".equals(label) || "x²".equals(label)) {
                    double cur = evaluateExpression(expr.length() == 0 ? display.getText().toString() : expr.toString());
                    if (!Double.isNaN(cur)) {
                        double r = cur;
                        if ("sin".equals(label)) r = Math.sin(Math.toRadians(cur));
                        else if ("cos".equals(label)) r = Math.cos(Math.toRadians(cur));
                        else if ("tan".equals(label)) r = Math.tan(Math.toRadians(cur));
                        else if ("√".equals(label)) r = Math.sqrt(cur);
                        else if ("x²".equals(label)) r = cur * cur;
                        String out = formatNumber(r);
                        expr.setLength(0);
                        expr.append(out);
                        display.setText(out);
                    }
                } else if ("π".equals(label)) {
                    expr.append("3.14159265");
                    display.setText(expr.toString());
                } else {
                    expr.append(label);
                    display.setText(expr.toString());
                }
            });
            grid.addView(b);
        }

        card.addView(grid);
        calculatorView = card;
        rootContainer.addView(card);
    }

    // 3. Pomodoro / Exam Countdown Floating Badge
    public void startTimerOverlay(final int minutes, final String modeLabel) {
        if (activeTimer != null) {
            activeTimer.cancel();
        }
        if (timerBadgeView != null && timerBadgeView.getParent() != null) {
            rootContainer.removeView(timerBadgeView);
        }
        remainingMillis = minutes * 60 * 1000L;

        final TextView badge = new TextView(activity);
        badge.setTextColor(Color.WHITE);
        badge.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
        badge.setTypeface(Typeface.DEFAULT_BOLD);
        int pad = dp(10);
        badge.setPadding(pad, dp(6), pad, dp(6));

        GradientDrawable bg = new GradientDrawable();
        bg.setColor(Color.parseColor("#E60F172A"));
        bg.setCornerRadius(dp(20));
        bg.setStroke(dp(2), Color.parseColor("#10B981"));
        badge.setBackground(bg);

        FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                Gravity.TOP | Gravity.CENTER_HORIZONTAL
        );
        lp.topMargin = dp(14);
        badge.setLayoutParams(lp);

        badge.setOnClickListener(v -> {
            if (activeTimer != null) activeTimer.cancel();
            timerRunning = false;
            rootContainer.removeView(badge);
            timerBadgeView = null;
        });

        timerBadgeView = badge;
        rootContainer.addView(badge);
        timerRunning = true;

        activeTimer = new CountDownTimer(remainingMillis, 1000L) {
            @Override
            public void onTick(long millisUntilFinished) {
                remainingMillis = millisUntilFinished;
                long totalSec = millisUntilFinished / 1000L;
                long m = totalSec / 60L;
                long s = totalSec % 60L;
                badge.setText(String.format(Locale.US, "⏱️ %s | %02d:%02d (اضغط للإيقاف)", modeLabel, m, s));
            }

            @Override
            public void onFinish() {
                timerRunning = false;
                if (prefs != null) prefs.addStudyMinutes(minutes);
                if (soundEngine != null) soundEngine.playTimerFinish();
                badge.setText("✅ اكتمل وقت " + modeLabel + " بنجاح!");
            }
        }.start();
    }

    private Button createSmallBarButton(String text, String colorHex) {
        Button b = new Button(activity);
        b.setText(text);
        b.setTextColor(Color.WHITE);
        b.setTextSize(TypedValue.COMPLEX_UNIT_SP, 11);
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(Color.parseColor(colorHex));
        bg.setCornerRadius(dp(10));
        b.setBackground(bg);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                dp(34)
        );
        lp.setMargins(dp(4), 0, dp(4), 0);
        b.setLayoutParams(lp);
        return b;
    }

    private static String formatNumber(double d) {
        if (d == (long) d) return String.format(Locale.US, "%d", (long) d);
        return String.format(Locale.US, "%.4f", d).replaceAll("0+$", "").replaceAll("\\.$", "");
    }

    private static double evaluateExpression(String raw) {
        try {
            final String str = raw.replace("×", "*").replace("÷", "/").trim();
            if (str.isEmpty()) return 0;
            return new Object() {
                int pos = -1, ch;
                void nextChar() { ch = (++pos < str.length()) ? str.charAt(pos) : -1; }
                boolean eat(int charToEat) {
                    while (ch == ' ') nextChar();
                    if (ch == charToEat) { nextChar(); return true; }
                    return false;
                }
                double parse() {
                    nextChar();
                    double x = parseExpression();
                    if (pos < str.length()) return Double.NaN;
                    return x;
                }
                double parseExpression() {
                    double x = parseTerm();
                    for (;;) {
                        if (eat('+')) x += parseTerm();
                        else if (eat('-')) x -= parseTerm();
                        else return x;
                    }
                }
                double parseTerm() {
                    double x = parseFactor();
                    for (;;) {
                        if (eat('*')) x *= parseFactor();
                        else if (eat('/')) x /= parseFactor();
                        else return x;
                    }
                }
                double parseFactor() {
                    if (eat('+')) return parseFactor();
                    if (eat('-')) return -parseFactor();
                    double x;
                    int startPos = this.pos;
                    if (eat('(')) {
                        x = parseExpression();
                        eat(')');
                    } else if ((ch >= '0' && ch <= '9') || ch == '.') {
                        while ((ch >= '0' && ch <= '9') || ch == '.') nextChar();
                        x = Double.parseDouble(str.substring(startPos, this.pos));
                    } else {
                        return Double.NaN;
                    }
                    return x;
                }
            }.parse();
        } catch (Exception e) {
            return Double.NaN;
        }
    }

    private int dp(int dp) {
        return Math.round(dp * activity.getResources().getDisplayMetrics().density);
    }

    private static class DrawingCanvasView extends View {
        private static class Stroke {
            final Path path;
            final Paint paint;
            Stroke(Path path, Paint paint) {
                this.path = path;
                this.paint = paint;
            }
        }
        private final List<Stroke> strokes = new ArrayList<>();
        private Path currentPath;
        private Paint currentPaint;
        private int currentColor = Color.parseColor("#38BDF8");

        DrawingCanvasView(Activity context) {
            super(context);
            initPaint();
        }

        private void initPaint() {
            currentPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
            currentPaint.setColor(currentColor);
            currentPaint.setStyle(Paint.Style.STROKE);
            currentPaint.setStrokeJoin(Paint.Join.ROUND);
            currentPaint.setStrokeCap(Paint.Cap.ROUND);
            currentPaint.setStrokeWidth(9f);
        }

        void setStrokeColor(int color) {
            currentColor = color;
            initPaint();
        }

        void undo() {
            if (!strokes.isEmpty()) {
                strokes.remove(strokes.size() - 1);
                invalidate();
            }
        }

        void clear() {
            strokes.clear();
            invalidate();
        }

        @Override
        protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            for (Stroke s : strokes) {
                canvas.drawPath(s.path, s.paint);
            }
            if (currentPath != null) {
                canvas.drawPath(currentPath, currentPaint);
            }
        }

        @Override
        public boolean onTouchEvent(MotionEvent event) {
            float x = event.getX();
            float y = event.getY();
            switch (event.getAction()) {
                case MotionEvent.ACTION_DOWN:
                    currentPath = new Path();
                    currentPath.moveTo(x, y);
                    invalidate();
                    return true;
                case MotionEvent.ACTION_MOVE:
                    if (currentPath != null) {
                        currentPath.lineTo(x, y);
                        invalidate();
                    }
                    return true;
                case MotionEvent.ACTION_UP:
                    if (currentPath != null) {
                        Paint copy = new Paint(currentPaint);
                        strokes.add(new Stroke(currentPath, copy));
                        currentPath = null;
                        invalidate();
                    }
                    return true;
            }
            return false;
        }
    }
}
