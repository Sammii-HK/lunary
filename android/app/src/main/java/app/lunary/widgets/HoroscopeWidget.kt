package app.lunary.widgets

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import app.lunary.MainActivity
import app.lunary.R
import org.json.JSONObject

/**
 * Daily Horoscope Widget
 */
class HoroscopeWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        private const val PREFS_NAME = "LunaryWidgetData"
        private const val DATA_KEY = "widgetData"

        fun updateWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.widget_horoscope)

            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val jsonString = prefs.getString(DATA_KEY, null)

            var headline = ""
            var guidance = ""

            if (jsonString != null) {
                try {
                    val data = JSONObject(jsonString)
                    val horoscope = data.optJSONObject("horoscope")

                    if (horoscope != null) {
                        headline = horoscope.optString("headline", "")
                        guidance = horoscope.optString("guidance", "")
                    }
                } catch (e: Exception) {
                    // Use fallback
                }
            }

            // Check if we have valid data (not empty and not the API fallback)
            val hasValidData = headline.isNotEmpty()
                && !headline.contains("Open Lunary", ignoreCase = true)
                && !headline.contains("Open app", ignoreCase = true)

            if (hasValidData) {
                views.setTextViewText(R.id.horoscope_headline, headline)
                views.setTextViewText(R.id.horoscope_guidance, guidance)
            } else {
                views.setTextViewText(R.id.horoscope_headline, "Tap to sync")
                views.setTextViewText(R.id.horoscope_guidance, "Open Lunary for your daily horoscope")
            }

            val intent = Intent(context, MainActivity::class.java)
            val pendingIntent = PendingIntent.getActivity(
                context, 3, intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }

    override fun onEnabled(context: Context) {}
    override fun onDisabled(context: Context) {}
}
