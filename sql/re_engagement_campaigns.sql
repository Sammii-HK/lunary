-- Re-engagement campaigns table
-- Tracks sent re-engagement emails to prevent duplicates and track performance
CREATE TABLE IF NOT EXISTS re_engagement_campaigns (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  campaign_type TEXT NOT NULL, -- '7days_inactive', '14days_inactive', '30days_inactive', 'missed_streak', 'milestone', 'insights_ready'
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  metadata JSONB, -- e.g., milestone details, streak info, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_re_engagement_campaigns_user_id ON re_engagement_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_re_engagement_campaigns_type ON re_engagement_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_re_engagement_campaigns_sent_at ON re_engagement_campaigns(sent_at);
CREATE INDEX IF NOT EXISTS idx_re_engagement_campaigns_user_type_sent ON re_engagement_campaigns(user_id, campaign_type, sent_at);

