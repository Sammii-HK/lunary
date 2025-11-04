-- Notification tracking table to prevent duplicate notifications
-- Tracks which events have been sent on which dates

CREATE TABLE IF NOT EXISTS notification_sent_events (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  event_key TEXT NOT NULL, -- Format: `${type}-${name}-${priority}`
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_priority INTEGER NOT NULL,
  sent_by TEXT NOT NULL, -- 'daily' or '4-hourly'
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, event_key)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_sent_events_date ON notification_sent_events(date);
CREATE INDEX IF NOT EXISTS idx_notification_sent_events_event_key ON notification_sent_events(event_key);
CREATE INDEX IF NOT EXISTS idx_notification_sent_events_sent_at ON notification_sent_events(sent_at);

-- Clean up old entries (older than 1 day - we only need to track for current day)
-- This keeps storage minimal and cost-effective
CREATE OR REPLACE FUNCTION cleanup_old_notification_events()
RETURNS void AS $$
BEGIN
  DELETE FROM notification_sent_events
  WHERE date < CURRENT_DATE - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Optional: Set up automatic cleanup via cron or scheduled job
-- You can also call this function manually or set up a daily cron to run it

