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
 * Daily Tarot Card Widget
 */
class TarotWidget : AppWidgetProvider() {

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
            val views = RemoteViews(context.packageName, R.layout.widget_tarot)

            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val jsonString = prefs.getString(DATA_KEY, null)

            if (jsonString != null) {
                try {
                    val data = JSONObject(jsonString)
                    val todayCard = data.optJSONObject("todayCard")

                    if (todayCard != null) {
                        views.setTextViewText(R.id.card_name, todayCard.optString("name", ""))
                        views.setTextViewText(R.id.card_meaning, todayCard.optString("briefMeaning", ""))
                    } else {
                        views.setTextViewText(R.id.card_name, "Pull your card")
                        views.setTextViewText(R.id.card_meaning, "Open Lunary")
                    }
                } catch (e: Exception) {
                    views.setTextViewText(R.id.card_name, "Pull your card")
                    views.setTextViewText(R.id.card_meaning, "Open Lunary")
                }
            } else {
                views.setTextViewText(R.id.card_name, "Pull your card")
                views.setTextViewText(R.id.card_meaning, "Open Lunary")
            }

            val intent = Intent(context, MainActivity::class.java)
            val pendingIntent = PendingIntent.getActivity(
                context, 2, intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }

    override fun onEnabled(context: Context) {}
    override fun onDisabled(context: Context) {}
}
