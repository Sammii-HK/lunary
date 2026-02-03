package app.lunary;

import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

import app.lunary.widgets.WidgetBridge;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Add JavaScript interface for widget bridge after bridge is ready
        getBridge().getWebView().post(() -> {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                webView.addJavascriptInterface(
                    new WidgetBridge(getApplicationContext()),
                    "AndroidWidgetBridge"
                );
            }
        });
    }
}
