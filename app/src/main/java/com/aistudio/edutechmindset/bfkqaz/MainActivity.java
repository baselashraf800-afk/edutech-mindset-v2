package com.aistudio.edutechmindset.bfkqaz;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.app.PictureInPictureParams;
import android.content.Context;
import android.content.Intent;
import android.view.HapticFeedbackConstants;
import android.print.PrintManager;
import android.print.PrintDocumentAdapter;
import android.print.PrintAttributes;
import android.content.pm.ActivityInfo;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.ColorMatrixColorFilter;
import android.graphics.Outline;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.graphics.pdf.PdfRenderer;
import android.media.MediaPlayer;
import android.media.MediaRecorder;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.os.ParcelFileDescriptor;
import android.provider.Settings;
import android.speech.RecognizerIntent;
import android.util.Base64;
import android.util.Rational;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewOutlineProvider;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.VideoView;
import androidx.activity.OnBackPressedCallback;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class MainActivity extends AppCompatActivity {

    public static final String HOME_URL = "https://edutech-mindset.pages.dev";
    private static final int REQ_PERMISSIONS = 1001;
    private static final int REQ_FILE_CHOOSER = 1002;
    private static final int REQ_VOICE_INPUT = 1003;

    private FrameLayout rootContainer;
    private SwipeRefreshLayout swipeRefreshLayout;
    private WebView webView;
    private WebView popupWebView;
    private FrameLayout popupContainer;
    private LinearLayout offlineOverlay;
    private LinearLayout findInPageBar;
    private View warmEyeOverlay;
    private FrameLayout assistantButton;
    private FrameLayout fullscreenContainer;
    private View customView;
    private WebChromeClient.CustomViewCallback customViewCallback;
    private volatile boolean isMediaPlaying = false;

    // Internal viewer states for BackStackManager & Volume key PDF navigation
    private AlertDialog activeHubDialog;
    private AlertDialog activeLibraryDialog;
    private AlertDialog activePdfDialog;
    private PdfRenderer activePdfRenderer;
    private PdfRenderer.Page activePdfPage;
    private ParcelFileDescriptor activePdfDescriptor;
    private int currentPdfPageIndex = 0;
    private ImageView activePdfImageView;
    private TextView activePdfPageLabel;
    private boolean pdfNightMode = false;

    private EduTechPrefs prefs;
    private SoundEngine soundEngine;
    private StudyToolsOverlay studyToolsOverlay;
    private BackStackManager backStackManager;
    private ValueCallback<Uri[]> filePathCallback;
    private MediaRecorder voiceRecorder;
    private boolean isRecordingVoice = false;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    private static final String SMART_BRIDGE_JS =
            "(function(){" +
            "  if(window.__edutechNativeBridgeInstalled) return;" +
            "  window.__edutechNativeBridgeInstalled = true;" +
            "  document.addEventListener('focusin', function(e){" +
            "    var t = e.target ? e.target.tagName : '';" +
            "    if(t==='INPUT' || t==='TEXTAREA' || (e.target && e.target.isContentEditable)){" +
            "      if(window.AndroidSession && window.AndroidSession.setTypingState) window.AndroidSession.setTypingState(true);" +
            "    }" +
            "  }, true);" +
            "  document.addEventListener('focusout', function(e){" +
            "    if(window.AndroidSession && window.AndroidSession.setTypingState) window.AndroidSession.setTypingState(false);" +
            "  }, true);" +
            "  document.addEventListener('input', function(e){" +
            "    try {" +
            "      var el = e.target;" +
            "      if(el && (el.tagName==='TEXTAREA' || (el.tagName==='INPUT' && el.type==='text'))){" +
            "        var key = 'edutech_draft_' + (el.id || el.name || location.pathname);" +
            "        localStorage.setItem(key, el.value || '');" +
            "      }" +
            "    } catch(err){}" +
            "  }, true);" +
            "  window.__edutechRestoreDrafts = function(){" +
            "    try {" +
            "      var inputs = document.querySelectorAll('textarea, input[type=text]');" +
            "      inputs.forEach(function(el){" +
            "        var key = 'edutech_draft_' + (el.id || el.name || location.pathname);" +
            "        var saved = localStorage.getItem(key);" +
            "        if(saved && !el.value) el.value = saved;" +
            "      });" +
            "    } catch(err){}" +
            "  };" +
            "  document.addEventListener('click', function(e){" +
            "    var a = e.target.closest ? e.target.closest('a[download]') : null;" +
            "    if(a && a.href && a.href.startsWith('data:')){" +
            "      e.preventDefault();" +
            "      if(window.AndroidVault) window.AndroidVault.saveDataUrl(a.href, a.getAttribute('download') || 'edutech_file');" +
            "    }" +
            "  }, true);" +
            "})();";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        prefs = new EduTechPrefs(this);
        soundEngine = new SoundEngine(prefs);
        applyKeepScreenOnFlag();

        rootContainer = new FrameLayout(this);
        rootContainer.setLayoutParams(new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
        rootContainer.setBackgroundColor(Color.parseColor("#0F172A"));
        setContentView(rootContainer);

        setupSwipeAndWebView();
        setupPopupContainer();
        setupWarmEyeFilterOverlay();
        setupFindInPageBar();
        setupOfflineOverlay();
        setupDraggableAssistantButton();

        studyToolsOverlay = new StudyToolsOverlay(this, rootContainer, soundEngine, prefs);

        // Setup 5-priority BackStackManager via OnBackPressedCallback
        backStackManager = new BackStackManager(this, webView, new BackStackManager.OverlayHandler() {
            @Override
            public boolean closeFloatingTools() {
                if (studyToolsOverlay != null && studyToolsOverlay.closeTopOverlay()) {
                    return true;
                }
                if (activeHubDialog != null && activeHubDialog.isShowing()) {
                    activeHubDialog.dismiss();
                    return true;
                }
                if (findInPageBar != null && findInPageBar.getVisibility() == View.VISIBLE) {
                    findInPageBar.setVisibility(View.GONE);
                    webView.clearMatches();
                    return true;
                }
                if (prefs.isClassroomMode()) {
                    toggleClassroomMode();
                    return true;
                }
                return false;
            }

            @Override
            public boolean closeInternalScreens() {
                if (popupContainer != null && popupContainer.getVisibility() == View.VISIBLE) {
                    closeAuthPopup();
                    return true;
                }
                if (activePdfDialog != null && activePdfDialog.isShowing()) {
                    activePdfDialog.dismiss();
                    return true;
                }
                if (activeLibraryDialog != null && activeLibraryDialog.isShowing()) {
                    activeLibraryDialog.dismiss();
                    return true;
                }
                if (offlineOverlay != null && offlineOverlay.getVisibility() == View.VISIBLE && isNetworkAvailable()) {
                    offlineOverlay.setVisibility(View.GONE);
                    return true;
                }
                return false;
            }
        });

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                backStackManager.handleBackPress();
            }
        });

        // Show vertical IntroVideoOverlay on launch (no skip button + "🚀 ادخل التطبيق" after finish + auto-enter after 3.5s)
        IntroVideoOverlay.show(this, rootContainer, soundEngine, () -> {
            requestRuntimePermissionsIfNeeded();
            handleIncomingIntent(getIntent());
        });

        loadMainPlatformOrOffline();
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void setupSwipeAndWebView() {
        swipeRefreshLayout = new SwipeRefreshLayout(this);
        swipeRefreshLayout.setColorSchemeColors(
                Color.parseColor("#0284C7"),
                Color.parseColor("#2563EB"),
                Color.parseColor("#10B981")
        );
        swipeRefreshLayout.setProgressBackgroundColorSchemeColor(Color.parseColor("#0F172A"));

        webView = new WebView(this);
        swipeRefreshLayout.addView(webView, new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
        rootContainer.addView(swipeRefreshLayout, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));

        swipeRefreshLayout.setOnChildScrollUpCallback((parent, child) -> (webView.getScrollY() > 0 || customView != null));
        swipeRefreshLayout.setOnRefreshListener(() -> {
            if (isNetworkAvailable()) {
                offlineOverlay.setVisibility(View.GONE);
                webView.reload();
            } else {
                swipeRefreshLayout.setRefreshing(false);
                offlineOverlay.setVisibility(View.VISIBLE);
            }
        });

        WebSettings ws = webView.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setDatabaseEnabled(true);
        ws.setAllowFileAccess(true);
        ws.setAllowContentAccess(true);
        ws.setMediaPlaybackRequiresUserGesture(false);
        ws.setSupportMultipleWindows(true);
        ws.setJavaScriptCanOpenWindowsAutomatically(true);
        ws.setLoadWithOverviewMode(true);
        ws.setUseWideViewPort(true);
        ws.setTextZoom(prefs.getTextZoomPercent());
        ws.setCacheMode(WebSettings.LOAD_DEFAULT);
        ws.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        String defaultUa = ws.getUserAgentString();
        ws.setUserAgentString(defaultUa.replace("; wv", "") + " EduTechMindsetApp/2.1.0");

        CookieManager cm = CookieManager.getInstance();
        cm.setAcceptCookie(true);
        cm.setAcceptThirdPartyCookies(webView, true);

        webView.addJavascriptInterface(new AndroidVaultBridge(), "AndroidVault");
        webView.addJavascriptInterface(new AndroidSessionBridge(), "AndroidSession");
        webView.addJavascriptInterface(new EduTechAndroidBridge(), "EduTechAndroid");

        webView.setDownloadListener((url, userAgent, contentDisposition, mimeType, contentLength) -> {
            if (url != null && url.startsWith("data:")) {
                saveDataUrlToDevice(url, "EduTech_Download_" + System.currentTimeMillis());
            } else if (url != null && url.startsWith("http")) {
                downloadUrlToVault(url, "EduTech_" + System.currentTimeMillis());
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (request == null || request.getUrl() == null) return false;
                Uri uri = request.getUrl();
                String url = uri.toString();
                String scheme = uri.getScheme() != null ? uri.getScheme().toLowerCase() : "";
                if (scheme.equals("whatsapp") || scheme.equals("tg") || scheme.equals("tel") || scheme.equals("mailto") || scheme.equals("intent")) {
                    try {
                        Intent intent = scheme.equals("intent") ? Intent.parseUri(url, Intent.URI_INTENT_SCHEME) : new Intent(Intent.ACTION_VIEW, uri);
                        startActivity(intent);
                    } catch (Exception ignored) {}
                    return true;
                }
                if (url.startsWith("https://edutech-mindset.pages.dev") || url.contains("accounts.google.com") || url.contains("firebaseapp.com") || url.contains("googleapis.com") || url.contains("youtube.com") || url.contains("youtu.be")) {
                    return false;
                }
                if (scheme.equals("http") || scheme.equals("https")) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch (Exception ignored) {}
                    return true;
                }
                return false;
            }
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                swipeRefreshLayout.setRefreshing(false);
                if (url != null && !url.startsWith("about:blank")) {
                    prefs.saveLastLesson(url, view.getTitle());
                    EduTechWidgetProvider.TriggerRefresh(MainActivity.this);
                }
                view.evaluateJavascript("window.__IS_EDUTECH_ANDROID_APP__=true;", null);
                view.evaluateJavascript("(function(){if(window.__eduMediaHooked)return;window.__eduMediaHooked=true;document.addEventListener('play',function(){if(window.EduTechAndroid)EduTechAndroid.setMediaPlaying(true);},true);document.addEventListener('pause',function(){if(window.EduTechAndroid)EduTechAndroid.setMediaPlaying(false);},true);document.addEventListener('ended',function(){if(window.EduTechAndroid)EduTechAndroid.setMediaPlaying(false);},true);})();", null);
                view.evaluateJavascript(SMART_BRIDGE_JS, null);
                view.evaluateJavascript("(function(){if(!window.__eduV310UI){window.__eduV310UI=true;var st=document.createElement('style');st.textContent='@media(max-width:768px){header .brand-text,header h1,header .site-title,header p{display:none!important;}header{overflow-x:hidden!important;}}';document.head.appendChild(st);var hdr=document.querySelector('header');if(hdr&&!document.getElementById('eduNativeFolderBtn')){var wrap=document.createElement('div');wrap.style.cssText='display:inline-flex;gap:6px;align-items:center;margin:0 6px;';var bf=document.createElement('button');bf.id='eduNativeFolderBtn';bf.type='button';bf.textContent='📁 مجلدي';bf.style.cssText='background:#0f4c5c;color:#fff;border:0;border-radius:999px;padding:5px 10px;font-size:11px;font-weight:800;cursor:pointer;';bf.onclick=function(){if(window.AndroidVault&&AndroidVault.openMyFolder)AndroidVault.openMyFolder();};var bw=document.createElement('button');bw.id='eduNativeWbBtn';bw.type='button';bw.textContent='🖍️ السبورة';bw.style.cssText='background:#d97706;color:#fff;border:0;border-radius:999px;padding:5px 10px;font-size:11px;font-weight:800;cursor:pointer;';bw.onclick=function(){if(window.AndroidVault&&AndroidVault.openSmartWhiteboard)AndroidVault.openSmartWhiteboard();};wrap.appendChild(bf);wrap.appendChild(bw);hdr.appendChild(wrap);}document.addEventListener('click',function(e){var a=e.target&&e.target.closest?e.target.closest('a[download]'):null;if(!a||!a.href||!a.href.startsWith('blob:'))return;if(!window.AndroidVault||!AndroidVault.saveUniversalFile)return;e.preventDefault();var fn=a.getAttribute('download')||('edutech_'+Date.now()+'.pdf');fetch(a.href).then(function(r){return r.blob();}).then(function(bl){var rd=new FileReader();rd.onloadend=function(){var res=String(rd.result||'');var idx=res.indexOf(',');AndroidVault.saveUniversalFile(idx>-1?res.slice(idx+1):res,fn,bl.type||'application/octet-stream');};rd.readAsDataURL(bl);}).catch(function(){});},true);}})();", null);
                restoreSyncedSessionToWebView(view);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request != null && request.isForMainFrame() && !isNetworkAvailable()) {
                    swipeRefreshLayout.setRefreshing(false);
                    offlineOverlay.setVisibility(View.VISIBLE);
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> request.grant(request.getResources()));
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (MainActivity.this.filePathCallback != null) {
                    MainActivity.this.filePathCallback.onReceiveValue(null);
                }
                MainActivity.this.filePathCallback = filePathCallback;
                try {
                    Intent intent = fileChooserParams.createIntent();
                    startActivityForResult(intent, REQ_FILE_CHOOSER);
                } catch (Exception e) {
                    MainActivity.this.filePathCallback = null;
                    return false;
                }
                return true;
            }

            @Override
            public void onShowCustomView(View view, CustomViewCallback callback) {
                if (customView != null) {
                    onHideCustomView();
                    return;
                }
                customView = view;
                customViewCallback = callback;
                if (fullscreenContainer == null) {
                    fullscreenContainer = new FrameLayout(MainActivity.this);
                    fullscreenContainer.setBackgroundColor(Color.BLACK);
                }
                fullscreenContainer.removeAllViews();
                fullscreenContainer.addView(view, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
                ViewGroup decor = (ViewGroup) getWindow().getDecorView();
                if (fullscreenContainer.getParent() == null) {
                    decor.addView(fullscreenContainer, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
                }
                fullscreenContainer.setVisibility(View.VISIBLE);
                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
                getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
            }

            @Override
            public void onHideCustomView() {
                if (customView == null) return;
                if (fullscreenContainer != null) {
                    fullscreenContainer.removeAllViews();
                    fullscreenContainer.setVisibility(View.GONE);
                }
                customView = null;
                if (customViewCallback != null) {
                    try { customViewCallback.onCustomViewHidden(); } catch (Exception ignored) {}
                    customViewCallback = null;
                }
                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
                getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
            }

            @Override
            public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
                openAuthPopupWindow(resultMsg);
                return true;
            }
        });
    }

    // Preserve Google Sign-In auto-close popup (closeAuthPopup + window.close hook in popupWebView)
    private void setupPopupContainer() {
        popupContainer = new FrameLayout(this);
        popupContainer.setBackgroundColor(Color.parseColor("#CC020617"));
        popupContainer.setVisibility(View.GONE);
        rootContainer.addView(popupContainer, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void openAuthPopupWindow(Message resultMsg) {
        popupContainer.removeAllViews();
        popupContainer.setVisibility(View.VISIBLE);

        popupWebView = new WebView(this);
        WebSettings ps = popupWebView.getSettings();
        ps.setJavaScriptEnabled(true);
        ps.setDomStorageEnabled(true);
        ps.setSupportMultipleWindows(true);
        ps.setJavaScriptCanOpenWindowsAutomatically(true);
        ps.setUserAgentString(webView.getSettings().getUserAgentString());

        CookieManager.getInstance().setAcceptThirdPartyCookies(popupWebView, true);
        popupWebView.addJavascriptInterface(new AndroidSessionBridge(), "AndroidSession");

        popupWebView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // Hook window.close() to closeAuthPopup() automatically
                view.evaluateJavascript(
                        "(function(){" +
                        "  var origClose = window.close;" +
                        "  window.close = function(){" +
                        "    if(window.AndroidSession && window.AndroidSession.closeAuthPopup) window.AndroidSession.closeAuthPopup();" +
                        "    if(origClose) origClose.call(window);" +
                        "  };" +
                        "})();",
                        null
                );
                if (url != null && (url.startsWith(HOME_URL) || url.contains("/__/auth/handler") && url.contains("state="))) {
                    CookieManager.getInstance().flush();
                }
            }
        });

        popupWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onCloseWindow(WebView window) {
                super.onCloseWindow(window);
                closeAuthPopup();
            }
        });

        FrameLayout.LayoutParams webLp = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        );
        webLp.setMargins(dp(12), dp(48), dp(12), dp(16));
        popupContainer.addView(popupWebView, webLp);

        Button closeBtn = new Button(this);
        closeBtn.setText("✖ إغلاق نافذة المصادقة");
        closeBtn.setTextColor(Color.WHITE);
        closeBtn.setBackgroundColor(Color.parseColor("#DC2626"));
        FrameLayout.LayoutParams btnLp = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                dp(38),
                Gravity.TOP | Gravity.END
        );
        btnLp.setMargins(dp(14), dp(6), dp(14), dp(6));
        closeBtn.setOnClickListener(v -> closeAuthPopup());
        popupContainer.addView(closeBtn, btnLp);

        WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
        transport.setWebView(popupWebView);
        resultMsg.sendToTarget();
    }

    public void closeAuthPopup() {
        runOnUiThread(() -> {
            try {
                CookieManager.getInstance().flush();
                if (popupWebView != null) {
                    popupWebView.destroy();
                    popupWebView = null;
                }
                if (popupContainer != null) {
                    popupContainer.removeAllViews();
                    popupContainer.setVisibility(View.GONE);
                }
            } catch (Exception ignored) {
            }
        });
    }

    private void setupWarmEyeFilterOverlay() {
        warmEyeOverlay = new View(this);
        warmEyeOverlay.setBackgroundColor(Color.parseColor("#28F59E0B"));
        warmEyeOverlay.setClickable(false);
        warmEyeOverlay.setFocusable(false);
        warmEyeOverlay.setVisibility(prefs.isWarmEyeFilter() ? View.VISIBLE : View.GONE);
        rootContainer.addView(warmEyeOverlay, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
    }

    private void setupFindInPageBar() {
        findInPageBar = new LinearLayout(this);
        findInPageBar.setOrientation(LinearLayout.HORIZONTAL);
        findInPageBar.setGravity(Gravity.CENTER_VERTICAL);
        int pad = dp(8);
        findInPageBar.setPadding(pad, pad, pad, pad);
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(Color.parseColor("#F20F172A"));
        bg.setCornerRadius(dp(14));
        bg.setStroke(dp(1), Color.parseColor("#38BDF8"));
        findInPageBar.setBackground(bg);
        findInPageBar.setVisibility(View.GONE);

        FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                Gravity.TOP
        );
        lp.setMargins(dp(12), dp(12), dp(12), dp(12));
        findInPageBar.setLayoutParams(lp);

        final EditText searchInput = new EditText(this);
        searchInput.setHint("ابحث عن كلمة في الدرس...");
        searchInput.setHintTextColor(Color.parseColor("#94A3B8"));
        searchInput.setTextColor(Color.WHITE);
        searchInput.setSingleLine(true);
        findInPageBar.addView(searchInput, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));

        Button nextBtn = new Button(this);
        nextBtn.setText("التالي ↓");
        nextBtn.setOnClickListener(v -> {
            String q = searchInput.getText().toString().trim();
            if (!q.isEmpty()) {
                webView.findAllAsync(q);
                webView.findNext(true);
            }
        });
        findInPageBar.addView(nextBtn);

        Button closeSearch = new Button(this);
        closeSearch.setText("✖");
        closeSearch.setOnClickListener(v -> {
            findInPageBar.setVisibility(View.GONE);
            webView.clearMatches();
        });
        findInPageBar.addView(closeSearch);

        rootContainer.addView(findInPageBar);
    }

    // Smart Offline Overlay with "📂 افتح مكتبتي بدون إنترنت" button
    private void setupOfflineOverlay() {
        offlineOverlay = new LinearLayout(this);
        offlineOverlay.setOrientation(LinearLayout.VERTICAL);
        offlineOverlay.setGravity(Gravity.CENTER);
        offlineOverlay.setBackgroundColor(Color.parseColor("#0F172A"));
        int pad = dp(24);
        offlineOverlay.setPadding(pad, pad, pad, pad);
        offlineOverlay.setVisibility(View.GONE);

        TextView iconTv = new TextView(this);
        iconTv.setText("📡");
        iconTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 48);
        iconTv.setGravity(Gravity.CENTER);
        offlineOverlay.addView(iconTv);

        TextView titleTv = new TextView(this);
        titleTv.setText("انقطع الاتصال بالإنترنت");
        titleTv.setTextColor(Color.WHITE);
        titleTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 20);
        titleTv.setTypeface(Typeface.DEFAULT_BOLD);
        titleTv.setGravity(Gravity.CENTER);
        offlineOverlay.addView(titleTv);

        TextView subTv = new TextView(this);
        subTv.setText("يمكنك مواصلة الدراسة من ملفاتك المحفوظة في الخزنة المحلية أو استخدام السبورة والحاسبة العلمية بدون إنترنت.");
        subTv.setTextColor(Color.parseColor("#94A3B8"));
        subTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        subTv.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams subLp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
        subLp.setMargins(0, dp(10), 0, dp(22));
        offlineOverlay.addView(subTv, subLp);

        Button vaultBtn = new Button(this);
        vaultBtn.setText("📂 افتح مكتبتي بدون إنترنت");
        vaultBtn.setTextColor(Color.WHITE);
        vaultBtn.setTextSize(TypedValue.COMPLEX_UNIT_SP, 15);
        vaultBtn.setTypeface(Typeface.DEFAULT_BOLD);
        GradientDrawable vBg = new GradientDrawable();
        vBg.setColor(Color.parseColor("#0284C7"));
        vBg.setCornerRadius(dp(14));
        vaultBtn.setBackground(vBg);
        LinearLayout.LayoutParams vLp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                dp(48)
        );
        vLp.bottomMargin = dp(10);
        vaultBtn.setOnClickListener(v -> showLocalLibraryDialog());
        offlineOverlay.addView(vaultBtn, vLp);

        Button retryBtn = new Button(this);
        retryBtn.setText("🔄 إعادة المحاولة للاتصال بالمنصة");
        retryBtn.setTextColor(Color.WHITE);
        GradientDrawable rBg = new GradientDrawable();
        rBg.setColor(Color.parseColor("#334155"));
        rBg.setCornerRadius(dp(14));
        retryBtn.setBackground(rBg);
        retryBtn.setOnClickListener(v -> loadMainPlatformOrOffline());
        offlineOverlay.addView(retryBtn, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                dp(46)
        ));

        rootContainer.addView(offlineOverlay, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
    }

    private void setupDraggableAssistantButton() {
        assistantButton = new FrameLayout(this);
        GradientDrawable bg = new GradientDrawable(
                GradientDrawable.Orientation.TL_BR,
                new int[]{Color.parseColor("#0F172A"), Color.parseColor("#1D4ED8")}
        );
        bg.setShape(GradientDrawable.OVAL);
        bg.setStroke(dp(2), Color.parseColor("#38BDF8"));
        assistantButton.setBackground(bg);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            assistantButton.setElevation(dp(10));
        }

        ImageView icon = new ImageView(this);
        icon.setImageResource(R.mipmap.ic_launcher);
        icon.setScaleType(ImageView.ScaleType.CENTER_CROP);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            icon.setOutlineProvider(new ViewOutlineProvider() {
                @Override
                public void getOutline(View view, Outline outline) {
                    outline.setOval(0, 0, view.getWidth(), view.getHeight());
                }
            });
            icon.setClipToOutline(true);
        }
        FrameLayout.LayoutParams iconLp = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        );
        int p = dp(3);
        iconLp.setMargins(p, p, p, p);
        assistantButton.addView(icon, iconLp);

        int sizePx = dp(prefs.getAssistantButtonSizeDp());
        FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(sizePx, sizePx, Gravity.BOTTOM | Gravity.START);
        lp.setMargins(dp(16), dp(16), dp(16), dp(90));
        assistantButton.setLayoutParams(lp);

        assistantButton.setOnTouchListener(new View.OnTouchListener() {
            private float dX, dY, downRawX, downRawY;
            private boolean dragged = false;

            @Override
            public boolean onTouch(View v, MotionEvent event) {
                switch (event.getActionMasked()) {
                    case MotionEvent.ACTION_DOWN:
                        dX = v.getX() - event.getRawX();
                        dY = v.getY() - event.getRawY();
                        downRawX = event.getRawX();
                        downRawY = event.getRawY();
                        dragged = false;
                        return true;
                    case MotionEvent.ACTION_MOVE:
                        if (Math.abs(event.getRawX() - downRawX) > 12 || Math.abs(event.getRawY() - downRawY) > 12) {
                            dragged = true;
                        }
                        v.setX(event.getRawX() + dX);
                        v.setY(event.getRawY() + dY);
                        return true;
                    case MotionEvent.ACTION_UP:
                        if (!dragged) {
                            soundEngine.playClick();
                            openEduTechHubSheet();
                        }
                        return true;
                }
                return false;
            }
        });

        rootContainer.addView(assistantButton);
    }

    private void openEduTechHubSheet() {
        String currentUrl = webView != null && webView.getUrl() != null ? webView.getUrl() : HOME_URL;
        String currentTitle = webView != null && webView.getTitle() != null ? webView.getTitle() : "EduTech Mindset";

        activeHubDialog = EduTechHubSheet.show(this, prefs, soundEngine, currentUrl, currentTitle, new EduTechHubSheet.HostCallbacks() {
            @Override
            public void onOpenWhiteboard() {
                studyToolsOverlay.showWhiteboard();
            }

            @Override
            public void onOpenCalculator() {
                studyToolsOverlay.showScientificCalculator();
            }

            @Override
            public void onStartPomodoro(int minutes, String label) {
                studyToolsOverlay.startTimerOverlay(minutes, label);
            }

            @Override
            public void onToggleWarmEyeFilter() {
                boolean next = !prefs.isWarmEyeFilter();
                prefs.setWarmEyeFilter(next);
                warmEyeOverlay.setVisibility(next ? View.VISIBLE : View.GONE);
                Toast.makeText(MainActivity.this, next ? "تم تفعيل فلتر حماية العين الدافئ 🌅" : "تم إيقاف فلتر العين الدافئ", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onHideAssistantFor10Min() {
                assistantButton.setVisibility(View.GONE);
                Toast.makeText(MainActivity.this, "تم إخفاء زر المساعد لمدة 10 دقائق للتركيز الكامل 🎯", Toast.LENGTH_SHORT).show();
                mainHandler.postDelayed(() -> assistantButton.setVisibility(View.VISIBLE), 10 * 60 * 1000L);
            }

            @Override
            public void onToggleClassroomMode() {
                toggleClassroomMode();
            }

            @Override
            public void onOpenLocalLibrary() {
                showLocalLibraryDialog();
            }

            @Override
            public void onShowFindInPage() {
                findInPageBar.setVisibility(View.VISIBLE);
            }

            @Override
            public void onCheckGitHubUpdates() {
                checkGitHubReleasesUpdate();
            }

            @Override
            public void onOpenQrScanner() {
                openQrScannerOrFallback();
            }

            @Override
            public void onRecordVoiceNote() {
                toggleVoiceNoteRecorder();
            }

            @Override
            public void onChangeAssistantSize(int sizeDp) {
                prefs.setAssistantButtonSizeDp(sizeDp);
                ViewGroup.LayoutParams lp = assistantButton.getLayoutParams();
                lp.width = dp(sizeDp);
                lp.height = dp(sizeDp);
                assistantButton.setLayoutParams(lp);
            }

            @Override
            public void onStartVoiceInput() {
                startVoiceInput();
            }

            @Override
            public void onNavigateUrl(String url) {
                offlineOverlay.setVisibility(View.GONE);
                webView.loadUrl(url);
            }

            @Override
            public void onExecuteJsAction(String jsCode, String toastMsg) {
                if (webView != null) {
                    webView.evaluateJavascript(jsCode, null);
                }
                if (toastMsg != null && !toastMsg.isEmpty()) {
                    Toast.makeText(MainActivity.this, toastMsg, Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onToggleKeepScreenOn() {
                boolean next = !prefs.isKeepScreenOn();
                prefs.setKeepScreenOn(next);
                applyKeepScreenOnFlag();
                Toast.makeText(MainActivity.this, next ? "تم تفعيل إبقاء الشاشة مضاءة 💡" : "تم إيقاف إبقاء الشاشة مضاءة", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onRequestOverlayPermission() {
                requestSystemOverlayBubble();
            }

            @Override
            public void onEnterPipMode() {
                enterPipWindow();
            }

            @Override
            public void onShareCurrentPage() {
                Intent share = new Intent(Intent.ACTION_SEND);
                share.setType("text/plain");
                String u = webView != null && webView.getUrl() != null ? webView.getUrl() : HOME_URL;
               share.putExtra(Intent.EXTRA_TEXT, "EduTech Mindset: " + u);
                startActivity(Intent.createChooser(share, "مشاركة الدرس"));
            }
        });
    }

    private void toggleClassroomMode() {
        boolean next = !prefs.isClassroomMode();
        prefs.setClassroomMode(next);
        if (next) {
            getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                            | View.SYSTEM_UI_FLAG_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            );
            Toast.makeText(this, "تم تفعيل وضع العرض الصفي بملء الشاشة 🏫", Toast.LENGTH_SHORT).show();
        } else {
            getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);
            Toast.makeText(this, "تم الخروج من وضع العرض الصفي", Toast.LENGTH_SHORT).show();
        }
    }

    private void applyKeepScreenOnFlag() {
        if (prefs.isKeepScreenOn()) {
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        } else {
            getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        }
    }

    // Volume Up / Down page turning when PDF reader is open
    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        if (activePdfDialog != null && activePdfDialog.isShowing() && activePdfRenderer != null) {
            int keyCode = event.getKeyCode();
            if (keyCode == KeyEvent.KEYCODE_VOLUME_UP) {
                if (event.getAction() == KeyEvent.ACTION_DOWN && currentPdfPageIndex > 0) {
                    renderPdfPage(currentPdfPageIndex - 1);
                }
                return true;
            } else if (keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
                if (event.getAction() == KeyEvent.ACTION_DOWN && currentPdfPageIndex < activePdfRenderer.getPageCount() - 1) {
                    renderPdfPage(currentPdfPageIndex + 1);
                }
                return true;
            }
        }
        return super.dispatchKeyEvent(event);
    }

    // Local Offline Library (Vault) & PDF/Audio/Video Viewers
    private File getVaultDirectory() {
        File dir = new File(getFilesDir(), "EduTechVault");
        if (!dir.exists()) dir.mkdirs();
        return dir;
    }

    public void showLocalLibraryDialog() {
        startActivity(new Intent(MainActivity.this, FileManagerPlusActivity.class));
    }
    void showLegacyLocalLibraryDialog() {
        File dir = getVaultDirectory();
        File[] files = dir.listFiles();
        final List<File> itemList = new ArrayList<>();
        if (files != null) {
            for (File f : files) {
                if (f.isFile()) itemList.add(f);
            }
        }

        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        int pad = dp(16);
        box.setPadding(pad, pad, pad, pad);
        box.setBackgroundColor(Color.parseColor("#0F172A"));

        TextView header = new TextView(this);
        header.setText("📂 مكتبتي بدون إنترنت (" + itemList.size() + " ملف)");
        header.setTextColor(Color.parseColor("#38BDF8"));
        header.setTextSize(TypedValue.COMPLEX_UNIT_SP, 17);
        header.setTypeface(Typeface.DEFAULT_BOLD);
        box.addView(header);

        ScrollView sv = new ScrollView(this);
        LinearLayout listLayout = new LinearLayout(this);
        listLayout.setOrientation(LinearLayout.VERTICAL);
        sv.addView(listLayout);
        box.addView(sv, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                dp(320)
        ));

        if (itemList.isEmpty()) {
            TextView empty = new TextView(this);
            empty.setText("لا توجد ملفات محفوظة بعد في الخزنة المحلية.");
            empty.setTextColor(Color.parseColor("#94A3B8"));
            empty.setPadding(dp(8), dp(20), dp(8), dp(20));
            listLayout.addView(empty);
        } else {
            for (final File f : itemList) {
                Button itemBtn = new Button(this);
                itemBtn.setText("📄 " + f.getName() + " (" + (f.length() / 1024) + " KB)");
                itemBtn.setTextColor(Color.WHITE);
                itemBtn.setBackgroundColor(Color.parseColor("#1E293B"));
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.WRAP_CONTENT
                );
                lp.topMargin = dp(6);
                itemBtn.setLayoutParams(lp);
                itemBtn.setOnClickListener(v -> openVaultFile(f));
                listLayout.addView(itemBtn);
            }
        }

        activeLibraryDialog = new AlertDialog.Builder(this)
                .setView(box)
                .setNegativeButton("إغلاق", null)
                .create();
        activeLibraryDialog.show();
    }

    private void openVaultFile(File file) {
        String name = file.getName().toLowerCase(Locale.ROOT);
        if (name.endsWith(".pdf")) {
            openPdfViewer(file);
        } else if (name.endsWith(".mp3") || name.endsWith(".wav") || name.endsWith(".m4a")) {
            openAudioPlayer(file);
        } else if (name.endsWith(".mp4") || name.endsWith(".webm")) {
            openVideoPlayer(file);
        } else {
            Toast.makeText(this, "تم حفظ الملف: " + file.getName(), Toast.LENGTH_SHORT).show();
        }
    }

    private void openPdfViewer(File pdfFile) {
        try {
            closePdfResources();
            activePdfDescriptor = ParcelFileDescriptor.open(pdfFile, ParcelFileDescriptor.MODE_READ_ONLY);
            activePdfRenderer = new PdfRenderer(activePdfDescriptor);
            currentPdfPageIndex = 0;

            LinearLayout container = new LinearLayout(this);
            container.setOrientation(LinearLayout.VERTICAL);
            container.setBackgroundColor(Color.parseColor("#0F172A"));
            int p = dp(12);
            container.setPadding(p, p, p, p);

            activePdfPageLabel = new TextView(this);
            activePdfPageLabel.setTextColor(Color.WHITE);
            activePdfPageLabel.setGravity(Gravity.CENTER);
            container.addView(activePdfPageLabel);

            activePdfImageView = new ImageView(this);
            activePdfImageView.setAdjustViewBounds(true);
            container.addView(activePdfImageView, new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    dp(420)
            ));

            LinearLayout controls = new LinearLayout(this);
            controls.setOrientation(LinearLayout.HORIZONTAL);
            controls.setGravity(Gravity.CENTER);

            Button prevBtn = new Button(this);
            prevBtn.setText("◀ السابق");
            prevBtn.setOnClickListener(v -> {
                if (currentPdfPageIndex > 0) renderPdfPage(currentPdfPageIndex - 1);
            });
            controls.addView(prevBtn);

            Button nightBtn = new Button(this);
            nightBtn.setText("🌙 وضع ليلي");
            nightBtn.setOnClickListener(v -> {
                pdfNightMode = !pdfNightMode;
                if (pdfNightMode) {
                    activePdfImageView.setColorFilter(new ColorMatrixColorFilter(new float[]{
                            -1f, 0, 0, 0, 255,
                            0, -1f, 0, 0, 255,
                            0, 0, -1f, 0, 255,
                            0, 0, 0, 1f, 0
                    }));
                } else {
                    activePdfImageView.clearColorFilter();
                }
            });
            controls.addView(nightBtn);

            Button nextBtn = new Button(this);
            nextBtn.setText("التالي ▶");
            nextBtn.setOnClickListener(v -> {
                if (activePdfRenderer != null && currentPdfPageIndex < activePdfRenderer.getPageCount() - 1) {
                    renderPdfPage(currentPdfPageIndex + 1);
                }
            });
            controls.addView(nextBtn);
            container.addView(controls);

            renderPdfPage(0);

            activePdfDialog = new AlertDialog.Builder(this)
                    .setView(container)
                    .setOnDismissListener(d -> closePdfResources())
                    .setNegativeButton("إغلاق القارئ", null)
                    .create();
            activePdfDialog.show();
        } catch (Exception e) {
            Toast.makeText(this, "تعذر فتح ملف PDF", Toast.LENGTH_SHORT).show();
        }
    }

    private void renderPdfPage(int index) {
        try {
            if (activePdfRenderer == null || index < 0 || index >= activePdfRenderer.getPageCount()) return;
            if (activePdfPage != null) activePdfPage.close();
            currentPdfPageIndex = index;
            activePdfPage = activePdfRenderer.openPage(index);
            Bitmap bmp = Bitmap.createBitmap(
                    activePdfPage.getWidth() * 2,
                    activePdfPage.getHeight() * 2,
                    Bitmap.Config.ARGB_8888
            );
            bmp.eraseColor(Color.WHITE);
            activePdfPage.render(bmp, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY);
            activePdfImageView.setImageBitmap(bmp);
            activePdfPageLabel.setText("📄 صفحة " + (index + 1) + " من " + activePdfRenderer.getPageCount() + " (استخدم أزرار الصوت للتقليب)");
        } catch (Exception ignored) {
        }
    }

    private void closePdfResources() {
        try {
            if (activePdfPage != null) {
                activePdfPage.close();
                activePdfPage = null;
            }
            if (activePdfRenderer != null) {
                activePdfRenderer.close();
                activePdfRenderer = null;
            }
            if (activePdfDescriptor != null) {
                activePdfDescriptor.close();
                activePdfDescriptor = null;
            }
        } catch (Exception ignored) {
        }
    }

    private void openAudioPlayer(File audioFile) {
        try {
            final MediaPlayer mp = new MediaPlayer();
            mp.setDataSource(audioFile.getAbsolutePath());
            mp.prepare();
            mp.start();
            new AlertDialog.Builder(this)
                    .setTitle("🎧 مشغل الصوتيات: " + audioFile.getName())
                    .setMessage("جاري تشغيل الملف الصوتي المحفوظ...")
                    .setOnDismissListener(d -> {
                        try {
                            if (mp.isPlaying()) mp.stop();
                            mp.release();
                        } catch (Exception ignored) {
                        }
                    })
                    .setPositiveButton("إيقاف وإغلاق", null)
                    .show();
        } catch (Exception e) {
            Toast.makeText(this, "تعذر تشغيل الملف الصوتي", Toast.LENGTH_SHORT).show();
        }
    }

    private void openVideoPlayer(File videoFile) {
        VideoView vv = new VideoView(this);
        vv.setVideoPath(videoFile.getAbsolutePath());
        vv.start();
        new AlertDialog.Builder(this)
                .setTitle("🎬 مشغل الفيديو: " + videoFile.getName())
                .setView(vv)
                .setPositiveButton("إغلاق", null)
                .show();
    }

    private void toggleVoiceNoteRecorder() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.RECORD_AUDIO}, REQ_PERMISSIONS);
            return;
        }
        if (!isRecordingVoice) {
            try {
                String fileName = "VoiceNote_" + new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(new Date()) + ".m4a";
                File out = new File(getVaultDirectory(), fileName);
                voiceRecorder = new MediaRecorder();
                voiceRecorder.setAudioSource(MediaRecorder.AudioSource.MIC);
                voiceRecorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);
                voiceRecorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC);
                voiceRecorder.setOutputFile(out.getAbsolutePath());
                voiceRecorder.prepare();
                voiceRecorder.start();
                isRecordingVoice = true;
                Toast.makeText(this, "🎤 بدأ تسجيل الملاحظة الصوتية... اضغط الأداة مرة أخرى للإيقاف والحفظ", Toast.LENGTH_LONG).show();
            } catch (Exception e) {
                Toast.makeText(this, "تعذر بدء التسجيل الصوتي", Toast.LENGTH_SHORT).show();
            }
        } else {
            try {
                voiceRecorder.stop();
                voiceRecorder.release();
                voiceRecorder = null;
                isRecordingVoice = false;
                soundEngine.playSuccess();
                Toast.makeText(this, "✅ تم حفظ الملاحظة الصوتية في مكتبتي بدون إنترنت", Toast.LENGTH_LONG).show();
            } catch (Exception ignored) {
                isRecordingVoice = false;
            }
        }
    }

    private void openQrScannerOrFallback() {
        try {
            Intent intent = new Intent("com.google.zxing.client.android.SCAN");
            startActivity(intent);
        } catch (Exception e) {
            final EditText input = new EditText(this);
            input.setHint("أدخل رابط رمز QR أو كود الدرس...");
            new AlertDialog.Builder(this)
                    .setTitle("📷 فتح رابط/رمز QR للدرس")
                    .setView(input)
                    .setPositiveButton("انتقال", (d, w) -> {
                        String u = input.getText().toString().trim();
                        if (!u.isEmpty()) webView.loadUrl(u.startsWith("http") ? u : HOME_URL + "/#" + u);
                    })
                    .setNegativeButton("إلغاء", null)
                    .show();
        }
    }

    private void checkGitHubReleasesUpdate() {
        Toast.makeText(this, "🔄 جاري فحص آخر إصدار على GitHub Releases...", Toast.LENGTH_SHORT).show();
        new Thread(() -> {
            try {
                URL url = new URL("https://api.github.com/repos/baselashraf800-afk/edutech-mindset-v2/releases/latest");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setConnectTimeout(6000);
                conn.setRequestProperty("Accept", "application/vnd.github+json");
                BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = br.readLine()) != null) sb.append(line);
                br.close();
                JSONObject json = new JSONObject(sb.toString());
                final String tag = json.optString("tag_name", "v2.1.0");
                final String htmlUrl = json.optString("html_url", "https://github.com/baselashraf800-afk/edutech-mindset-v2/releases");
                runOnUiThread(() -> new AlertDialog.Builder(MainActivity.this)
                        .setTitle("🔄 تحديثات EduTech Mindset")
                        .setMessage("الإصدار الحالي v2.1.0 | الأحدث: " + tag)
                        .setPositiveButton("فتح صفحة الإصدار", (d, w) -> startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(htmlUrl))))
                        .setNegativeButton("حسناً", null)
                        .show());
            } catch (Exception e) {
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "أنت تستخدم أحدث إصدار من التطبيق (v2.1.0) ✅", Toast.LENGTH_SHORT).show());
            }
        }).start();
    }

    private void startVoiceInput() {
        try {
            Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "ar-EG");
            intent.putExtra(RecognizerIntent.EXTRA_PROMPT, "تحدث الآن مع المساعد الذكي لمنصة EduTech Mindset...");
            startActivityForResult(intent, REQ_VOICE_INPUT);
        } catch (Exception e) {
            Toast.makeText(this, "الإملاء الصوتي غير مدعوم على هذا الجهاز", Toast.LENGTH_SHORT).show();
        }
    }

    private void requestSystemOverlayBubble() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName()));
            startActivity(intent);
            Toast.makeText(this, "فعّل خيار (الظهور فوق التطبيقات) لتشغيل فقاعة EduTech العائمة 🌐", Toast.LENGTH_LONG).show();
        } else {
            Intent svc = new Intent(this, OverlayAssistantService.class);
            svc.setAction(OverlayAssistantService.ACTION_SHOW);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(svc);
            } else {
                startService(svc);
            }
            Toast.makeText(this, "تم تفعيل الفقاعة العائمة فوق التطبيقات بنجاح ✅", Toast.LENGTH_SHORT).show();
        }
    }

    private void enterPipWindow() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                PictureInPictureParams params = new PictureInPictureParams.Builder()
                        .setAspectRatio(new Rational(16, 9))
                        .build();
                enterPictureInPictureMode(params);
            } catch (Exception ignored) {
            }
        }
    }

    private void saveDataUrlToDevice(String dataUrl, String suggestedName) {
        try {
            int comma = dataUrl.indexOf(',');
            if (comma < 0) return;
            byte[] bytes = Base64.decode(dataUrl.substring(comma + 1), Base64.DEFAULT);
            File out = new File(getVaultDirectory(), suggestedName);
            try (FileOutputStream fos = new FileOutputStream(out)) {
                fos.write(bytes);
            }
            soundEngine.playSuccess();
            Toast.makeText(this, "تم حفظ الملف في مكتبتي بدون إنترنت: " + out.getName(), Toast.LENGTH_LONG).show();
        } catch (Exception ignored) {
        }
    }

    private void downloadUrlToVault(final String urlStr, final String fileName) {
        new Thread(() -> {
            try {
                URL u = new URL(urlStr);
                HttpURLConnection c = (HttpURLConnection) u.openConnection();
                c.connect();
                File out = new File(getVaultDirectory(), fileName);
                try (InputStream is = c.getInputStream(); FileOutputStream fos = new FileOutputStream(out)) {
                    byte[] buf = new byte[8192];
                    int len;
                    while ((len = is.read(buf)) > 0) fos.write(buf, 0, len);
                }
                runOnUiThread(() -> {
                    soundEngine.playSuccess();
                    Toast.makeText(MainActivity.this, "تم تنزيل الملف في مكتبتي: " + out.getName(), Toast.LENGTH_LONG).show();
                });
            } catch (Exception ignored) {
            }
        }).start();
    }

    private void loadMainPlatformOrOffline() {
        if (isNetworkAvailable()) {
            offlineOverlay.setVisibility(View.GONE);
            webView.loadUrl(HOME_URL);
        } else {
            offlineOverlay.setVisibility(View.VISIBLE);
        }
    }

    private boolean isNetworkAvailable() {
        try {
            ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
            if (cm == null) return false;
            NetworkInfo info = cm.getActiveNetworkInfo();
            return info != null && info.isConnected();
        } catch (Exception e) {
            return true;
        }
    }

    private void requestRuntimePermissionsIfNeeded() {
        List<String> needed = new ArrayList<>();
        needed.add(Manifest.permission.RECORD_AUDIO);
        needed.add(Manifest.permission.CAMERA);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            needed.add(Manifest.permission.POST_NOTIFICATIONS);
        }
        List<String> toAsk = new ArrayList<>();
        for (String p : needed) {
            if (ContextCompat.checkSelfPermission(this, p) != PackageManager.PERMISSION_GRANTED) {
                toAsk.add(p);
            }
        }
        if (!toAsk.isEmpty()) {
            ActivityCompat.requestPermissions(this, toAsk.toArray(new String[0]), REQ_PERMISSIONS);
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIncomingIntent(intent);
    }

    private void handleIncomingIntent(Intent intent) {
        if (intent == null) return;
        if (intent.getBooleanExtra("OPEN_VOICE_ASSISTANT", false)) {
            openEduTechHubSheet();
            return;
        }
        String shortcut = intent.getStringExtra("SHORTCUT_ACTION");
        if ("VOICE".equals(shortcut)) {
            startVoiceInput();
        } else if ("VAULT".equals(shortcut)) {
            startActivity(new Intent(this, MyFolderActivity.class));
        } else if ("OVERLAY".equals(shortcut)) {
            requestSystemOverlayBubble();
        } else if ("WHITEBOARD".equals(shortcut)) {
            startActivity(new Intent(this, SmartWhiteboardActivity.class));
        } else if ("POMODORO".equals(shortcut)) {
            studyToolsOverlay.startTimerOverlay(25, "بومودورو 25 د");
        } else if ("RESUME_LESSON".equals(shortcut)) {
            webView.loadUrl(prefs.getLastLessonUrl());
        } else if (Intent.ACTION_SEND.equals(intent.getAction())) {
            Uri sharedUri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
            if (sharedUri != null) {
                importSharedFileToMyFolder(sharedUri, intent.getType());
            } else {
                String txt = intent.getStringExtra(Intent.EXTRA_TEXT);
                if (txt != null && !txt.trim().isEmpty()) {
                    Toast.makeText(this, "تم استلام النص في EduTech Mindset ✓", Toast.LENGTH_SHORT).show();
                }
            }
        } else if (Intent.ACTION_VIEW.equals(intent.getAction()) && intent.getData() != null) {
            Uri data = intent.getData();
            if ("http".equals(data.getScheme()) || "https".equals(data.getScheme())) {
                webView.loadUrl(data.toString());
            } else {
                importSharedFileToMyFolder(data, intent.getType());
            }
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && Settings.canDrawOverlays(this)) {
            Intent svc = new Intent(this, OverlayAssistantService.class);
            svc.setAction(OverlayAssistantService.ACTION_HIDE);
            startService(svc);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && Settings.canDrawOverlays(this)) {
            Intent svc = new Intent(this, OverlayAssistantService.class);
            svc.setAction(OverlayAssistantService.ACTION_SHOW);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(svc);
            } else {
                startService(svc);
            }
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_FILE_CHOOSER) {
            if (filePathCallback != null) {
                Uri[] results = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
                filePathCallback.onReceiveValue(results);
                filePathCallback = null;
            }
        } else if (requestCode == REQ_VOICE_INPUT && resultCode == RESULT_OK && data != null) {
            ArrayList<String> matches = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
            if (matches != null && !matches.isEmpty()) {
                String spoken = matches.get(0).replace("'", "");
                webView.evaluateJavascript(
                        "(function(){" +
                        "  var el = document.activeElement;" +
                        "  if(el && (el.tagName==='INPUT' || el.tagName==='TEXTAREA')){" +
                        "    el.value = (el.value ? el.value + ' ' : '') + '" + spoken + "';" +
                        "    el.dispatchEvent(new Event('input', {bubbles:true}));" +
                        "  }" +
                        "})();",
                        null
                );
            }
        }
    }

    private void restoreSyncedSessionToWebView(WebView view) {
        SharedPreferences sp = getSharedPreferences("edutech_session_bridge", MODE_PRIVATE);
        String json = sp.getString("session_json", "");
        if (json != null && !json.isEmpty()) {
            String safe = json.replace("'", "");
            view.evaluateJavascript(
                    "(function(){ try { var d = JSON.parse('" + safe + "'); for(var k in d){ sessionStorage.setItem(k, d[k]); } } catch(e){} })();",
                    null
            );
        }
    }

    @Override
    protected void onUserLeaveHint() {
        super.onUserLeaveHint();
        if (customView != null || isMediaPlaying) {
            enterPipWindow();
        }
    }

    public class EduTechAndroidBridge {
        @JavascriptInterface
        public void saveBase64File(String b64, String fileName, String mime, String subFolder) {
            String prefix = "data:" + (mime != null ? mime : "application/octet-stream") + ";base64,";
            runOnUiThread(() -> saveDataUrlToDevice(prefix + (b64 != null ? b64 : ""), fileName != null ? fileName : ("EduTech_" + System.currentTimeMillis())));
        }

        @JavascriptInterface
        public void printPage() {
            runOnUiThread(() -> {
                try {
                    PrintManager pm = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                    if (pm != null && webView != null) {
                        PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter("EduTech_Mindset_Doc");
                        pm.print("EduTech Mindset Document", adapter, new PrintAttributes.Builder().build());
                    }
                } catch (Exception ignored) {}
            });
        }

        @JavascriptInterface
        public void enterPip() {
            runOnUiThread(() -> enterPipWindow());
        }

        @JavascriptInterface
        public void setMediaPlaying(boolean playing) {
            isMediaPlaying = playing;
        }

        @JavascriptInterface
        public void openVault() {
            runOnUiThread(() -> startActivity(new Intent(MainActivity.this, FileManagerPlusActivity.class)));
        }

        @JavascriptInterface
        public void openBookReader() {
            runOnUiThread(() -> startActivity(new Intent(MainActivity.this, MoonBookReaderActivity.class)));
        }

        @JavascriptInterface
        public void openMediaPlayer() {
            runOnUiThread(() -> startActivity(new Intent(MainActivity.this, MxMediaPlayerActivity.class)));
        }

        @JavascriptInterface
        public void hapticLight() {
            runOnUiThread(() -> {
                try {
                    if (webView != null) webView.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP);
                } catch (Exception ignored) {}
            });
        }
    }

    private void importSharedFileToMyFolder(Uri uri, String mime) {
        try {
            String subDir = "PDF";
            String ext = ".pdf";
            if (mime != null) {
                if (mime.startsWith("image/")) { subDir = "Images"; ext = ".jpg"; }
                else if (mime.startsWith("audio/")) { subDir = "Audio"; ext = ".mp3"; }
                else if (mime.contains("word") || mime.contains("document")) { subDir = "Word"; ext = ".docx"; }
            }
            File dir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "EduTech_Mindset/" + subDir);
            if (!dir.exists()) dir.mkdirs();
            String name = "Shared_" + new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(new Date()) + ext;
            File out = new File(dir, name);
            try (InputStream in = getContentResolver().openInputStream(uri);
                 FileOutputStream fos = new FileOutputStream(out)) {
                if (in != null) {
                    byte[] buf = new byte[8192];
                    int r;
                    while ((r = in.read(buf)) != -1) fos.write(buf, 0, r);
                }
            }
            new EduTechDatabaseHelper(this).insertSavedFile(name, out.getAbsolutePath(), subDir, mime);
            Toast.makeText(this, "تم حفظ الملف المستلم في مجلدي ✓", Toast.LENGTH_LONG).show();
            startActivity(new Intent(this, MyFolderActivity.class));
        } catch (Exception e) {
            Toast.makeText(this, "تعذر استيراد الملف المشارك", Toast.LENGTH_SHORT).show();
        }
    }

    private void saveUniversalBase64ToDownloads(String b64, String fileName, String mime) {
        try {
            String safeName = (fileName == null || fileName.trim().isEmpty()) ? ("EduTech_" + System.currentTimeMillis() + ".pdf") : fileName.replaceAll("[^a-zA-Z0-9._\\-\\u0600-\\u06FF ]", "_");
            String low = safeName.toLowerCase(Locale.US);
            String subDir = "PDF";
            if (low.endsWith(".doc") || low.endsWith(".docx") || (mime != null && mime.contains("word"))) subDir = "Word";
            else if (low.endsWith(".mp3") || low.endsWith(".wav") || (mime != null && mime.startsWith("audio/"))) subDir = "Audio";
            else if (low.endsWith(".png") || low.endsWith(".jpg") || low.endsWith(".jpeg") || (mime != null && mime.startsWith("image/"))) subDir = "Images";

            File dir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "EduTech_Mindset/" + subDir);
            if (!dir.exists()) dir.mkdirs();
            File outFile = new File(dir, safeName);
            byte[] bytes = Base64.decode(b64, Base64.DEFAULT);
            try (FileOutputStream fos = new FileOutputStream(outFile)) {
                fos.write(bytes);
            }
            new EduTechDatabaseHelper(this).insertSavedFile(safeName, outFile.getAbsolutePath(), subDir, mime);
            Toast.makeText(this, "تم الحفظ في Downloads/EduTech_Mindset/" + subDir + " ✓", Toast.LENGTH_LONG).show();
        } catch (Exception e) {
            Toast.makeText(this, "تعذر حفظ الملف: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    public class AndroidVaultBridge {
        @JavascriptInterface
        public void saveDataUrl(String dataUrl, String fileName) {
            runOnUiThread(() -> saveDataUrlToDevice(dataUrl, fileName));
        }

        @JavascriptInterface
        public void saveUniversalFile(String base64Data, String fileName, String mimeType) {
            runOnUiThread(() -> saveUniversalBase64ToDownloads(base64Data, fileName, mimeType));
        }

        @JavascriptInterface
        public void openVault() {
            runOnUiThread(() -> startActivity(new Intent(MainActivity.this, MyFolderActivity.class)));
        }

        @JavascriptInterface
        public void openMyFolder() {
            runOnUiThread(() -> startActivity(new Intent(MainActivity.this, MyFolderActivity.class)));
        }

        @JavascriptInterface
        public void openSmartWhiteboard() {
            runOnUiThread(() -> startActivity(new Intent(MainActivity.this, SmartWhiteboardActivity.class)));
        }
    }

    public class AndroidSessionBridge {
        @JavascriptInterface
        public void syncSession(String sessionJson) {
            getSharedPreferences("edutech_session_bridge", MODE_PRIVATE)
                    .edit()
                    .putString("session_json", sessionJson)
                    .apply();
        }

        @JavascriptInterface
        public void closeAuthPopup() {
            MainActivity.this.closeAuthPopup();
        }

        @JavascriptInterface
        public void setTypingState(final boolean isTyping) {
            runOnUiThread(() -> {
                if (swipeRefreshLayout != null) {
                    swipeRefreshLayout.setEnabled(!isTyping);
                }
            });
        }
    }

    private int dp(int dp) {
        return Math.round(dp * getResources().getDisplayMetrics().density);
    }
}
