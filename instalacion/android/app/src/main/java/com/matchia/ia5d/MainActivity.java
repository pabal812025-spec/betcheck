package com.matchia.ia5d;

import android.app.Activity;
import android.os.Bundle;
import android.graphics.Color;
import android.view.Gravity;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

public class MainActivity extends Activity {
    private WebView webView;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(6, 16, 28));
        getWindow().setNavigationBarColor(Color.rgb(6, 16, 28));

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        root.setBackgroundColor(Color.rgb(6, 16, 28));

        TextView brand = new TextView(this);
        brand.setText("MatchIA IA 5D");
        brand.setTextColor(Color.rgb(0, 215, 255));
        brand.setTextSize(28);
        brand.setGravity(Gravity.CENTER);
        brand.setPadding(24, 24, 24, 12);
        root.addView(brand, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));

        TextView tagline = new TextView(this);
        tagline.setText("Tu fútbol en tiempo real");
        tagline.setTextColor(Color.WHITE);
        tagline.setTextSize(15);
        tagline.setGravity(Gravity.CENTER);
        tagline.setPadding(24, 0, 24, 20);
        root.addView(tagline, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));

        progressBar = new ProgressBar(this);
        root.addView(progressBar, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT));

        webView = new WebView(this);
        webView.setVisibility(View.GONE);
        webView.setBackgroundColor(Color.rgb(6, 16, 28));
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setDatabaseEnabled(true);
        webView.getSettings().setLoadsImagesAutomatically(true);
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                progressBar.setVisibility(View.GONE);
                brand.setVisibility(View.GONE);
                tagline.setVisibility(View.GONE);
                webView.setVisibility(View.VISIBLE);
            }
        });

        setContentView(root);
        root.addView(webView, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f));
        webView.loadUrl("https://betcheck-gilt.vercel.app/instalable/index.html");
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
