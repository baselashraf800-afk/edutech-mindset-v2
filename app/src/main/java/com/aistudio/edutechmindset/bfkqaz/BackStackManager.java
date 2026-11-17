package com.aistudio.edutechmindset.bfkqaz;

import android.app.Activity;
import android.webkit.WebBackForwardList;
import android.webkit.WebHistoryItem;
import android.webkit.WebView;
import android.widget.Toast;

public class BackStackManager {

    public interface OverlayHandler {
        boolean closeFloatingTools();
        boolean closeInternalScreens();
    }

    private final Activity activity;
    private final WebView webView;
    private final OverlayHandler overlayHandler;
    private long lastBackPressTime = 0L;

    public BackStackManager(Activity activity, WebView webView, OverlayHandler overlayHandler) {
        this.activity = activity;
        this.webView = webView;
        this.overlayHandler = overlayHandler;
    }

    public void handleBackPress() {
        // Priority 1: Close open floating study tools (Whiteboard, Calculator, HubSheet, Search bar, Classroom Mode)
        if (overlayHandler != null && overlayHandler.closeFloatingTools()) {
            return;
        }

        // Priority 2: Close internal Android screens (Auth Popup, Offline Overlay, Local Library, PDF/Media viewers)
        if (overlayHandler != null && overlayHandler.closeInternalScreens()) {
            return;
        }

        // Priority 3: Close open modals/dialogs inside the web platform via JS before navigating back
        if (webView != null) {
            try {
                webView.evaluateJavascript(
                        "(function(){" +
                        "  var modals = document.querySelectorAll('.modal.open, .modal.active, .fixed.inset-0:not(.hidden), [data-modal-open="true"]');" +
                        "  if (modals && modals.length > 0) {" +
                        "    var closeBtn = modals[modals.length-1].querySelector('[data-close], .close, button');" +
                        "    if (closeBtn) { closeBtn.click(); return 'CLOSED_MODAL'; }" +
                        "  }" +
                        "  if (window.EduApp && typeof window.EduApp.handleBack === 'function' && window.EduApp.handleBack()) {" +
                        "    return 'HANDLED_BY_APP';" +
                        "  }" +
                        "  return 'NONE';" +
                        "})();",
                        result -> {
                            if (result != null && (result.contains("CLOSED_MODAL") || result.contains("HANDLED_BY_APP"))) {
                                return;
                            }
                            proceedToWebHistoryOrExit();
                        }
                );
                return;
            } catch (Exception ignored) {
            }
        }

        proceedToWebHistoryOrExit();
    }

    private void proceedToWebHistoryOrExit() {
        // Priority 4: Navigate back in WebView while skipping stuck about:blank and accounts.google.com pages
        if (webView != null && webView.canGoBack()) {
            WebBackForwardList history = webView.copyBackForwardList();
            int currentIndex = history.getCurrentIndex();
            int targetStep = -1;
            for (int i = currentIndex - 1; i >= 0; i--) {
                WebHistoryItem item = history.getItemAtIndex(i);
                String url = item != null ? item.getUrl() : "";
                if (url == null || url.isEmpty()
                        || url.startsWith("about:blank")
                        || url.contains("accounts.google.com")
                        || url.contains("/__/auth/")) {
                    targetStep--;
                } else {
                    break;
                }
            }
            if (currentIndex + targetStep >= 0) {
                webView.goBackOrForward(targetStep);
                return;
            }
        }

        // Priority 5: Double-back within 2 seconds to exit
        long now = System.currentTimeMillis();
        if (now - lastBackPressTime < 2000L) {
            activity.finish();
        } else {
            lastBackPressTime = now;
            Toast.makeText(activity, "اضغط رجوع مرة أخرى للخروج من التطبيق", Toast.LENGTH_SHORT).show();
        }
    }
}
