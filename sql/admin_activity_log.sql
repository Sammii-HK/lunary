-- Admin Activity Log Table
-- Tracks all automated creation events, cron executions, and admin actions

CREATE TABLE IF NOT EXISTS admin_activity_log (
  id SERIAL PRIMARY KEY,
  activity_type TEXT NOT NULL,
  activity_category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_type
  ON admin_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_category
  ON admin_activity_log(activity_category);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_status
  ON admin_activity_log(status);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at
  ON admin_activity_log(created_at DESC);

-- Activity types:
-- - cron_execution (daily-posts, moon-packs, moon-circles, weekly-tasks, etc.)
-- - pack_generation (monthly, quarterly, yearly moon packs)
-- - calendar_creation (yearly calendars)
-- - moon_circle_creation
-- - content_creation (blog, newsletter, substack, social_posts)
-- - admin_action (manual triggers, etc.)

-- Activity categories:
-- - automation (cron jobs, scheduled tasks)
-- - content (blog, newsletter, social posts)
-- - shop (packs, calendars)
-- - notifications (moon circles, push notifications)
-- - admin (manual actions)

-- Status values:
-- - success
-- - failed
-- - pending
-- - skipped

