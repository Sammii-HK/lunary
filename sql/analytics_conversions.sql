-- Analytics Conversions Table
-- Captures conversion events and trigger metadata for funnels

CREATE TABLE IF NOT EXISTS analytics_conversions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  conversion_type TEXT NOT NULL, -- 'free_to_paid', 'trial_to_paid', 'upgrade'
  from_plan TEXT,
  to_plan TEXT,
  trigger_feature TEXT,
  days_to_convert INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_conversions_user_id
  ON analytics_conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_conversions_type
  ON analytics_conversions(conversion_type);
CREATE INDEX IF NOT EXISTS idx_analytics_conversions_created_at
  ON analytics_conversions(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_conversions_trigger_feature
  ON analytics_conversions(trigger_feature);

-- Example funnel query:
--   SELECT conversion_type, COUNT(*) 
--   FROM analytics_conversions
--   WHERE created_at >= NOW() - INTERVAL '30 days'
--   GROUP BY conversion_type;
