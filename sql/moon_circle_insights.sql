-- Moon Circle Insights Table
-- Captures anonymous reflections shared after each Moon Circle gathering

CREATE TABLE IF NOT EXISTS moon_circle_insights (
  id SERIAL PRIMARY KEY,
  moon_circle_id INTEGER NOT NULL REFERENCES moon_circles(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  insight_text TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT true,
  source TEXT DEFAULT 'app', -- 'app', 'email', 'substack'
  email_thread_id TEXT,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT insight_text_length
    CHECK (char_length(insight_text) >= 10 AND char_length(insight_text) <= 1000)
);

CREATE INDEX IF NOT EXISTS idx_moon_circle_insights_moon_circle_id
  ON moon_circle_insights(moon_circle_id);

CREATE INDEX IF NOT EXISTS idx_moon_circle_insights_user_id
  ON moon_circle_insights(user_id);

CREATE INDEX IF NOT EXISTS idx_moon_circle_insights_created_at
  ON moon_circle_insights(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_moon_circle_insights_is_approved
  ON moon_circle_insights(is_approved)
  WHERE is_approved = true;

CREATE OR REPLACE FUNCTION update_moon_circle_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_moon_circle_insights_timestamp
  ON moon_circle_insights;

CREATE TRIGGER update_moon_circle_insights_timestamp
  BEFORE UPDATE ON moon_circle_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_moon_circle_insights_updated_at();

CREATE OR REPLACE FUNCTION update_moon_circle_insight_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE moon_circles
    SET insight_count = insight_count + 1
    WHERE id = NEW.moon_circle_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE moon_circles
    SET insight_count = GREATEST(0, insight_count - 1)
    WHERE id = OLD.moon_circle_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_insight_count ON moon_circle_insights;

CREATE TRIGGER trigger_update_insight_count
  AFTER INSERT OR DELETE ON moon_circle_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_moon_circle_insight_count();

