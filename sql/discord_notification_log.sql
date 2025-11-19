-- Discord Notification Log Table
-- Tracks sent notifications for deduplication and rate limiting
-- Retention: 48 hours (only need recent history for dedupe checks)

CREATE TABLE IF NOT EXISTS discord_notification_log (
  id SERIAL PRIMARY KEY,
  dedupe_key TEXT NOT NULL,
  category TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT,
  recipient_count INTEGER DEFAULT 0,
  UNIQUE(dedupe_key, category, sent_at)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_discord_notification_log_dedupe_key ON discord_notification_log(dedupe_key);
CREATE INDEX IF NOT EXISTS idx_discord_notification_log_category ON discord_notification_log(category);
CREATE INDEX IF NOT EXISTS idx_discord_notification_log_sent_at ON discord_notification_log(sent_at);
CREATE INDEX IF NOT EXISTS idx_discord_notification_log_category_sent_at ON discord_notification_log(category, sent_at);

-- Cleanup function to delete entries older than 48 hours
CREATE OR REPLACE FUNCTION cleanup_old_discord_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM discord_notification_log
  WHERE sent_at < NOW() - INTERVAL '48 hours';
END;
$$ LANGUAGE plpgsql;

-- Example queries:
-- Check if notification was recently sent (within TTL)
-- SELECT COUNT(*) FROM discord_notification_log 
-- WHERE dedupe_key = 'some-key' 
-- AND sent_at > NOW() - INTERVAL '24 hours';

-- Count notifications per category in last hour (for rate limiting)
-- SELECT category, COUNT(*) as count 
-- FROM discord_notification_log 
-- WHERE sent_at > NOW() - INTERVAL '1 hour' 
-- GROUP BY category;

