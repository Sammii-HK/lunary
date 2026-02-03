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
 * Moon Phase Widget - compact widget showing just the moon phase
 */
class MoonWidget : AppWidgetProvider() {

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
            val views = RemoteViews(context.packageName, R.layout.widget_moon)

            // Load data from SharedPreferences
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val jsonString = prefs.getString(DATA_KEY, null)

            if (jsonString != null) {
                try {
                    val data = JSONObject(jsonString)
                    val moon = data.optJSONObject("moon")

                    val phase = moon?.optString("phase", "Sync") ?: "Sync"
                    val sign = moon?.optString("sign", "") ?: ""
                    val illumination = moon?.optInt("illumination", 0) ?: 0

                    views.setImageViewResource(R.id.moon_icon, CosmicWidget.getMoonDrawable(phase, illumination))
                    views.setTextViewText(R.id.moon_phase, phase)
                    views.setTextViewText(R.id.moon_sign, if (sign.isNotEmpty()) "in $sign" else "")
                    views.setTextViewText(R.id.moon_illumination, "$illumination%")

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
                1,
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
            views.setTextViewText(R.id.moon_illumination, "")
        }
    }

    override fun onEnabled(context: Context) {}
    override fun onDisabled(context: Context) {}
}
