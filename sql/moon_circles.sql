-- Moon Circles Table
-- Stores metadata for each guided Moon Circle gathering

CREATE TABLE IF NOT EXISTS moon_circles (
  id SERIAL PRIMARY KEY,
  moon_phase TEXT NOT NULL, -- e.g. 'New Moon' or 'Full Moon'
  event_date DATE NOT NULL,
  title TEXT,
  theme TEXT,
  description TEXT,
  focus_points JSONB DEFAULT '[]'::jsonb,
  rituals JSONB DEFAULT '[]'::jsonb,
  journal_prompts JSONB DEFAULT '[]'::jsonb,
  astrology_highlights JSONB DEFAULT '[]'::jsonb,
  resource_links JSONB DEFAULT '[]'::jsonb,
  hero_image_url TEXT,
  cta_url TEXT,
  insight_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moon_circles_event_date
  ON moon_circles(event_date DESC);

CREATE INDEX IF NOT EXISTS idx_moon_circles_moon_phase
  ON moon_circles(moon_phase);

CREATE OR REPLACE FUNCTION update_moon_circles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_moon_circles_timestamp ON moon_circles;

CREATE TRIGGER update_moon_circles_timestamp
  BEFORE UPDATE ON moon_circles
  FOR EACH ROW
  EXECUTE FUNCTION update_moon_circles_updated_at();

