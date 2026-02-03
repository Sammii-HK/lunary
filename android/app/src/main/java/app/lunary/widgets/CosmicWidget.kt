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

        fun getMoonDrawable(phase: String?, illumination: Int): Int {
            val phaseLower = phase?.lowercase() ?: ""
            return when {
                phaseLower.contains("new") -> R.drawable.ic_moon_new
                phaseLower.contains("waxing crescent") -> R.drawable.ic_moon_waxing_crescent
                phaseLower.contains("first quarter") -> R.drawable.ic_moon_first_quarter
                phaseLower.contains("waxing gibbous") -> R.drawable.ic_moon_waxing_gibbous
                phaseLower.contains("full") -> R.drawable.ic_moon_full
                phaseLower.contains("waning gibbous") -> R.drawable.ic_moon_waning_gibbous
                phaseLower.contains("last quarter") || phaseLower.contains("third quarter") -> R.drawable.ic_moon_last_quarter
                phaseLower.contains("waning crescent") -> R.drawable.ic_moon_waning_crescent
                illumination > 90 -> R.drawable.ic_moon_full
                illumination > 60 -> if (phaseLower.contains("waning")) R.drawable.ic_moon_waning_gibbous else R.drawable.ic_moon_waxing_gibbous
                illumination > 40 -> if (phaseLower.contains("waning")) R.drawable.ic_moon_last_quarter else R.drawable.ic_moon_first_quarter
                illumination > 10 -> if (phaseLower.contains("waning")) R.drawable.ic_moon_waning_crescent else R.drawable.ic_moon_waxing_crescent
                else -> R.drawable.ic_moon_new
            }
        }

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
                    val phase = moon?.optString("phase", "Sync needed") ?: "Sync needed"
                    val sign = moon?.optString("sign", "") ?: ""
                    val illumination = moon?.optInt("illumination", 0) ?: 0

                    views.setImageViewResource(R.id.moon_icon, getMoonDrawable(phase, illumination))
                    views.setTextViewText(R.id.moon_phase, phase)
                    views.setTextViewText(R.id.moon_sign, if (sign.isNotEmpty()) "in $sign · $illumination%" else "$illumination%")

                    // Update tarot card
                    if (todayCard != null) {
                        views.setTextViewText(R.id.card_name, todayCard.optString("name", ""))
                        views.setTextViewText(R.id.card_meaning, todayCard.optString("briefMeaning", ""))
                    } else {
                        views.setTextViewText(R.id.card_name, "Open app")
                        views.setTextViewText(R.id.card_meaning, "to sync")
                    }

                    // Update day number
                    if (dayNumber > 0) {
                        views.setTextViewText(R.id.day_number, "Day $dayNumber")
                        views.setTextViewText(R.id.day_theme, dayTheme)
                    } else {
                        views.setTextViewText(R.id.day_number, "")
                        views.setTextViewText(R.id.day_theme, "")
                    }

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
            views.setImageViewResource(R.id.moon_icon, R.drawable.ic_moon_full)
            views.setTextViewText(R.id.moon_phase, "Open Lunary")
            views.setTextViewText(R.id.moon_sign, "to sync")
            views.setTextViewText(R.id.card_name, "")
            views.setTextViewText(R.id.card_meaning, "")
            views.setTextViewText(R.id.day_number, "")
            views.setTextViewText(R.id.day_theme, "")
        }

        /**
         * Called from WebView bridge to update widget data
         */
        fun saveWidgetData(context: Context, jsonData: String) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putString(DATA_KEY, jsonData).apply()

            // Trigger widget refresh for all widget types
            val cosmicIntent = Intent(context, CosmicWidget::class.java).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
            }
            context.sendBroadcast(cosmicIntent)

            val moonIntent = Intent(context, MoonWidget::class.java).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
            }
            context.sendBroadcast(moonIntent)

            val tarotIntent = Intent(context, TarotWidget::class.java).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
            }
            context.sendBroadcast(tarotIntent)

            val horoscopeIntent = Intent(context, HoroscopeWidget::class.java).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
            }
            context.sendBroadcast(horoscopeIntent)
        }
    }

    override fun onEnabled(context: Context) {}
    override fun onDisabled(context: Context) {}
}
