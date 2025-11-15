-- Launch Signups Table
-- Stores emails collected across launch-related funnels for post-launch follow-ups

CREATE TABLE IF NOT EXISTS launch_signups (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_launch_signups_email ON launch_signups(email);
CREATE INDEX IF NOT EXISTS idx_launch_signups_source ON launch_signups(source);
CREATE INDEX IF NOT EXISTS idx_launch_signups_created_at ON launch_signups(created_at);

COMMENT ON TABLE launch_signups IS 'Emails collected from launch initiatives (Product Hunt, press kit, TikTok, etc.)';
COMMENT ON COLUMN launch_signups.source IS 'Source identifier: product_hunt, launch_page, press_kit, tiktok, etc.';
