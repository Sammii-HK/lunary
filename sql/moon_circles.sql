-- Moon Circles Table
-- Stores Moon Circle content for New Moon and Full Moon events

CREATE TABLE IF NOT EXISTS moon_circles (
  id SERIAL PRIMARY KEY,
  
  -- Moon phase information
  moon_phase TEXT NOT NULL, -- 'New Moon' or 'Full Moon'
  moon_sign TEXT,
  circle_date DATE NOT NULL UNIQUE,
  
  -- Content
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure:
  -- {
  --   "guidedRitual": "...",
  --   "journalQuestions": ["...", "..."],
  --   "tarotSpreadSuggestion": "...",
  --   "aiDeepDivePrompt": "...",
  --   "moonSignInfo": "...",
  --   "intention": "..."
  -- }
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_moon_circles_date ON moon_circles(circle_date);
CREATE INDEX IF NOT EXISTS idx_moon_circles_phase ON moon_circles(moon_phase);
CREATE INDEX IF NOT EXISTS idx_moon_circles_content ON moon_circles USING GIN(content);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_moon_circles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_moon_circles_updated_at
    BEFORE UPDATE ON moon_circles
    FOR EACH ROW
    EXECUTE FUNCTION update_moon_circles_updated_at();

