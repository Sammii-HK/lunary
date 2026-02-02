-- Conversion Events Tracking Table
-- Tracks user conversion funnel events for analytics

CREATE TABLE IF NOT EXISTS conversion_events (
  id SERIAL PRIMARY KEY,
  
  -- Event identification
  event_type TEXT NOT NULL,
  event_id UUID,
  
  -- User identification
  user_id TEXT,
  anonymous_id TEXT,
  user_email TEXT,
  
  -- Subscription context
  plan_type TEXT, -- 'monthly', 'yearly', 'free'
  trial_days_remaining INTEGER,
  
  -- Feature context
  feature_name TEXT,
  page_path TEXT,
  entity_type TEXT,
  entity_id TEXT,
  
  -- Additional metadata
  metadata JSONB,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversion_events_event_type ON conversion_events(event_type);
CREATE INDEX IF NOT EXISTS idx_conversion_events_user_id ON conversion_events(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_anonymous_id ON conversion_events(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_user_email ON conversion_events(user_email);
CREATE INDEX IF NOT EXISTS idx_conversion_events_created_at ON conversion_events(created_at);
CREATE INDEX IF NOT EXISTS idx_conversion_events_plan_type ON conversion_events(plan_type);
CREATE INDEX IF NOT EXISTS idx_conversion_events_event_created_at ON conversion_events(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_conversion_events_user_created_at ON conversion_events(user_id, created_at);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_conversion_events_user_event ON conversion_events(user_id, event_type, created_at);

-- Dedupe unique indexes (UTC date bucketing)
-- For authenticated users: one app_opened per user per day
CREATE UNIQUE INDEX IF NOT EXISTS uq_conversion_events_app_opened_daily
  ON conversion_events (
    user_id,
    event_type,
    ((created_at AT TIME ZONE 'UTC')::date)
  )
  WHERE event_type = 'app_opened' AND user_id IS NOT NULL;

-- For anonymous users: one app_opened per anonymous_id per day
-- This prevents duplicate tracking in private browsing when client-side guard fails
CREATE UNIQUE INDEX IF NOT EXISTS uq_conversion_events_app_opened_daily_anon
  ON conversion_events (
    anonymous_id,
    event_type,
    ((created_at AT TIME ZONE 'UTC')::date)
  )
  WHERE event_type = 'app_opened' AND user_id IS NULL AND anonymous_id IS NOT NULL;

-- For product_opened: one per user per day (authenticated)
CREATE UNIQUE INDEX IF NOT EXISTS uq_conversion_events_product_opened_daily
  ON conversion_events (
    user_id,
    event_type,
    ((created_at AT TIME ZONE 'UTC')::date)
  )
  WHERE event_type = 'product_opened' AND user_id IS NOT NULL;

-- For product_opened: one per anonymous_id per day
CREATE UNIQUE INDEX IF NOT EXISTS uq_conversion_events_product_opened_daily_anon
  ON conversion_events (
    anonymous_id,
    event_type,
    ((created_at AT TIME ZONE 'UTC')::date)
  )
  WHERE event_type = 'product_opened' AND user_id IS NULL AND anonymous_id IS NOT NULL;

-- For daily_dashboard_viewed: one per user per day (authenticated)
CREATE UNIQUE INDEX IF NOT EXISTS uq_conversion_events_daily_dashboard_daily
  ON conversion_events (
    user_id,
    event_type,
    ((created_at AT TIME ZONE 'UTC')::date)
  )
  WHERE event_type = 'daily_dashboard_viewed' AND user_id IS NOT NULL;

-- For daily_dashboard_viewed: one per anonymous_id per day
CREATE UNIQUE INDEX IF NOT EXISTS uq_conversion_events_daily_dashboard_daily_anon
  ON conversion_events (
    anonymous_id,
    event_type,
    ((created_at AT TIME ZONE 'UTC')::date)
  )
  WHERE event_type = 'daily_dashboard_viewed' AND user_id IS NULL AND anonymous_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_conversion_events_grimoire_viewed_daily
  ON conversion_events (
    user_id,
    event_type,
    ((created_at AT TIME ZONE 'UTC')::date),
    COALESCE(entity_id, page_path, '')
  )
  WHERE event_type = 'grimoire_viewed' AND user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_conversion_events_event_id
  ON conversion_events (event_id)
  WHERE event_id IS NOT NULL;

-- Example queries:
-- Get conversion funnel for a user
-- SELECT event_type, created_at FROM conversion_events 
-- WHERE user_id = 'user123' 
-- ORDER BY created_at ASC;

-- Get trial conversion rate
-- SELECT 
--   COUNT(DISTINCT CASE WHEN event_type = 'trial_started' THEN user_id END) as trials_started,
--   COUNT(DISTINCT CASE WHEN event_type = 'trial_converted' THEN user_id END) as trials_converted,
--   ROUND(
--     COUNT(DISTINCT CASE WHEN event_type = 'trial_converted' THEN user_id END)::numeric / 
--     NULLIF(COUNT(DISTINCT CASE WHEN event_type = 'trial_started' THEN user_id END), 0) * 100,
--     2
--   ) as conversion_rate_percent
-- FROM conversion_events
-- WHERE created_at >= NOW() - INTERVAL '30 days';

-- Get most common drop-off points
-- SELECT event_type, COUNT(*) as count
-- FROM conversion_events
-- WHERE created_at >= NOW() - INTERVAL '7 days'
-- GROUP BY event_type
-- ORDER BY count DESC;

