-- Discord Notification Analytics Table
-- Queues analytics events for daily aggregation
-- Retention: 7 days (only need for daily summaries)

CREATE TABLE IF NOT EXISTS discord_notification_analytics (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  event_type TEXT NOT NULL,
  title TEXT,
  dedupe_key TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  skipped_reason TEXT,
  rate_limited BOOLEAN DEFAULT false,
  quiet_hours_skipped BOOLEAN DEFAULT false
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_discord_notification_analytics_category ON discord_notification_analytics(category);
CREATE INDEX IF NOT EXISTS idx_discord_notification_analytics_event_type ON discord_notification_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_discord_notification_analytics_sent_at ON discord_notification_analytics(sent_at);
CREATE INDEX IF NOT EXISTS idx_discord_notification_analytics_dedupe_key ON discord_notification_analytics(dedupe_key);

-- Cleanup function to delete entries older than 7 days
CREATE OR REPLACE FUNCTION cleanup_old_discord_analytics()
RETURNS void AS $$
BEGIN
  DELETE FROM discord_notification_analytics
  WHERE sent_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Example queries:
-- Get analytics events for daily summary (last 24 hours)
-- SELECT category, event_type, COUNT(*) as count, 
--        array_agg(DISTINCT title) as titles
-- FROM discord_notification_analytics 
-- WHERE sent_at > NOW() - INTERVAL '24 hours'
-- GROUP BY category, event_type;

