-- Analytics AI Usage Table
-- Stores granular AI session metrics for engagement reporting

CREATE TABLE IF NOT EXISTS analytics_ai_usage (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  message_count INTEGER DEFAULT 0,
  token_count INTEGER DEFAULT 0,
  mode TEXT, -- e.g. 'cosmic_weather', 'transit_feelings', 'tarot', etc.
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(session_id)
);

CREATE INDEX IF NOT EXISTS idx_analytics_ai_usage_user_id
  ON analytics_ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_ai_usage_session_id
  ON analytics_ai_usage(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_ai_usage_created_at
  ON analytics_ai_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_ai_usage_mode
  ON analytics_ai_usage(mode);

-- Example queries:
-- Total sessions per day:
--   SELECT DATE(created_at) AS session_date, COUNT(*) AS sessions
--   FROM analytics_ai_usage GROUP BY session_date ORDER BY session_date DESC;
--
-- Mode breakdown:
--   SELECT mode, COUNT(*) FROM analytics_ai_usage GROUP BY mode ORDER BY COUNT(*) DESC;
