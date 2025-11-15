-- Analytics User Activity Table
-- Tracks per-user daily activity across key features for DAU/WAU/MAU + heatmaps

CREATE TABLE IF NOT EXISTS analytics_user_activity (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  activity_date DATE NOT NULL,
  activity_type TEXT NOT NULL, -- e.g. 'session', 'ai_chat', 'tarot', 'moon_circle', 'collection', 'birth_chart', 'cosmic_state'
  activity_count INTEGER DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, activity_date, activity_type)
);

CREATE INDEX IF NOT EXISTS idx_analytics_user_activity_user_id
  ON analytics_user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_activity_date
  ON analytics_user_activity(activity_date);
CREATE INDEX IF NOT EXISTS idx_analytics_user_activity_type
  ON analytics_user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_analytics_user_activity_user_date
  ON analytics_user_activity(user_id, activity_date);

-- Helpful aggregation snippets:
-- Daily actives:
--   SELECT activity_date, COUNT(DISTINCT user_id) AS dau
--   FROM analytics_user_activity
--   WHERE activity_type = 'session'
--   GROUP BY activity_date ORDER BY activity_date DESC;
--
-- Weekly actives:
--   SELECT DATE_TRUNC('week', activity_date) AS week_start,
--          COUNT(DISTINCT user_id) AS wau
--   FROM analytics_user_activity
--   WHERE activity_type = 'session'
--   GROUP BY week_start ORDER BY week_start DESC;
