-- Yearly Forecast Cache Table
-- Stores a single generated cosmic forecast per calendar year (shared by all users)

CREATE TABLE IF NOT EXISTS yearly_forecasts (
  year INTEGER PRIMARY KEY,
  summary TEXT,
  forecast JSONB NOT NULL,
  stats JSONB,
  source TEXT DEFAULT 'manual',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_yearly_forecasts_generated_at
  ON yearly_forecasts(generated_at);
CREATE INDEX IF NOT EXISTS idx_yearly_forecasts_updated_at
  ON yearly_forecasts(updated_at);

CREATE OR REPLACE FUNCTION update_yearly_forecasts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_yearly_forecasts_timestamp ON yearly_forecasts;

CREATE TRIGGER update_yearly_forecasts_timestamp
  BEFORE UPDATE ON yearly_forecasts
  FOR EACH ROW
  EXECUTE FUNCTION update_yearly_forecasts_updated_at();


