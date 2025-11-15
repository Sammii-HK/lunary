-- Weekly Ritual Usage Table
-- Tracks weekly AI ritual/reading usage for free tier users

CREATE TABLE IF NOT EXISTS weekly_ritual_usage (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  week_start DATE NOT NULL,
  ritual_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_weekly_ritual_usage_user_week ON weekly_ritual_usage(user_id, week_start);

CREATE OR REPLACE FUNCTION update_weekly_ritual_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_weekly_ritual_usage_timestamp
    BEFORE UPDATE ON weekly_ritual_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_weekly_ritual_usage_updated_at();

