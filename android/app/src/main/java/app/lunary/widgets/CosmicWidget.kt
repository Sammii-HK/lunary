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
 * Cosmic Overview Widget - shows moon phase, tarot card, and day number
 */
class CosmicWidget : AppWidgetProvider() {

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
            val views = RemoteViews(context.packageName, R.layout.widget_cosmic)

            // Load data from SharedPreferences
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val jsonString = prefs.getString(DATA_KEY, null)

            if (jsonString != null) {
                try {
                    val data = JSONObject(jsonString)
                    val moon = data.optJSONObject("moon")
                    val todayCard = data.optJSONObject("todayCard")
                    val dayNumber = data.optInt("personalDayNumber", 0)
                    val dayTheme = data.optString("dayTheme", "")

                    // Update moon info
                    views.setTextViewText(R.id.moon_phase, moon?.optString("phase", "Sync needed") ?: "Sync needed")
                    views.setTextViewText(R.id.moon_sign, moon?.optString("sign", "") ?: "")
                    views.setTextViewText(R.id.moon_illumination, "${moon?.optInt("illumination", 0) ?: 0}%")

                    // Update tarot card
                    if (todayCard != null) {
                        views.setTextViewText(R.id.card_name, todayCard.optString("name", ""))
                        views.setTextViewText(R.id.card_meaning, todayCard.optString("briefMeaning", ""))
                    } else {
                        views.setTextViewText(R.id.card_name, "Open app")
                        views.setTextViewText(R.id.card_meaning, "to sync")
                    }

                    // Update day number
                    views.setTextViewText(R.id.day_number, "Day $dayNumber")
                    views.setTextViewText(R.id.day_theme, dayTheme)

                } catch (e: Exception) {
                    setFallbackData(views)
                }
            } else {
                setFallbackData(views)
            }

            // Set click intent to open app
            val intent = Intent(context, MainActivity::class.java)
            val pendingIntent = PendingIntent.getActivity(
                context,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        private fun setFallbackData(views: RemoteViews) {
            views.setTextViewText(R.id.moon_phase, "Open app")
            views.setTextViewText(R.id.moon_sign, "to sync")
            views.setTextViewText(R.id.moon_illumination, "")
            views.setTextViewText(R.id.card_name, "Open app")
            views.setTextViewText(R.id.card_meaning, "to sync")
            views.setTextViewText(R.id.day_number, "")
            views.setTextViewText(R.id.day_theme, "")
        }

        /**
         * Called from WebView bridge to update widget data
         */
        fun saveWidgetData(context: Context, jsonData: String) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putString(DATA_KEY, jsonData).apply()

            // Trigger widget refresh
            val intent = Intent(context, CosmicWidget::class.java).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
            }
            context.sendBroadcast(intent)
        }
    }

    override fun onEnabled(context: Context) {
        // Widget first enabled
    }

    override fun onDisabled(context: Context) {
        // Last widget removed
    }
}
