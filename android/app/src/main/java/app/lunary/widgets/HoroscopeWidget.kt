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

            if (jsonString != null) {
                try {
                    val data = JSONObject(jsonString)
                    val horoscope = data.optJSONObject("horoscope")

                    if (horoscope != null) {
                        views.setTextViewText(R.id.horoscope_headline, horoscope.optString("headline", ""))
                        views.setTextViewText(R.id.horoscope_guidance, horoscope.optString("guidance", ""))
                    } else {
                        views.setTextViewText(R.id.horoscope_headline, "Open Lunary")
                        views.setTextViewText(R.id.horoscope_guidance, "Sync your horoscope")
                    }
                } catch (e: Exception) {
                    views.setTextViewText(R.id.horoscope_headline, "Open Lunary")
                    views.setTextViewText(R.id.horoscope_guidance, "Sync your horoscope")
                }
            } else {
                views.setTextViewText(R.id.horoscope_headline, "Open Lunary")
                views.setTextViewText(R.id.horoscope_guidance, "Sync your horoscope")
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
