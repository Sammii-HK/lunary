-- Analytics Notification Events Table
-- Tracks notification lifecycle (sent, delivered, opened, clicked, preferences)

CREATE TABLE IF NOT EXISTS analytics_notification_events (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  notification_type TEXT NOT NULL, -- 'cosmic_pulse', 'moon_circle', 'cosmic_changes', 'weekly_report'
  event_type TEXT NOT NULL, -- 'sent', 'delivered', 'opened', 'clicked'
  notification_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_notification_events_user_id
  ON analytics_notification_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_notification_events_type
  ON analytics_notification_events(notification_type);
CREATE INDEX IF NOT EXISTS idx_analytics_notification_events_event_type
  ON analytics_notification_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_notification_events_created_at
  ON analytics_notification_events(created_at);

-- Example metrics:
--   SELECT notification_type,
--          COUNT(*) FILTER (WHERE event_type = 'sent') AS sent,
--          COUNT(*) FILTER (WHERE event_type = 'opened') AS opened,
--          COUNT(*) FILTER (WHERE event_type = 'clicked') AS clicked
--   FROM analytics_notification_events
--   WHERE created_at >= NOW() - INTERVAL '30 days'
--   GROUP BY notification_type;
