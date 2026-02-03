package app.lunary.widgets

import android.content.Context
import android.webkit.JavascriptInterface
import android.appwidget.AppWidgetManager
import android.content.ComponentName

/**
 * JavaScript interface to bridge WebView and native widgets
 * Called from the web app to update widget data
 */
class WidgetBridge(private val context: Context) {

    @JavascriptInterface
    fun setWidgetData(jsonData: String) {
        // Save data to SharedPreferences
        CosmicWidget.saveWidgetData(context, jsonData)

        // Update all widget instances
        val appWidgetManager = AppWidgetManager.getInstance(context)

        // Update Cosmic widgets
        val cosmicWidgetIds = appWidgetManager.getAppWidgetIds(
            ComponentName(context, CosmicWidget::class.java)
        )
        for (widgetId in cosmicWidgetIds) {
            CosmicWidget.updateWidget(context, appWidgetManager, widgetId)
        }
    }

    @JavascriptInterface
    fun isWidgetSupported(): Boolean {
        return true
    }
}
