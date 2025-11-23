-- Monthly Insights Table
-- Stores cached monthly insights summaries for performance

CREATE TABLE IF NOT EXISTS monthly_insights (
  user_id TEXT NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  insights JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, month, year)
);

CREATE INDEX IF NOT EXISTS idx_monthly_insights_user_id ON monthly_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_insights_date ON monthly_insights(year, month);
CREATE INDEX IF NOT EXISTS idx_monthly_insights_updated_at ON monthly_insights(updated_at);

CREATE OR REPLACE FUNCTION update_monthly_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_monthly_insights_timestamp ON monthly_insights;

CREATE TRIGGER update_monthly_insights_timestamp
  BEFORE UPDATE ON monthly_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_monthly_insights_updated_at();

