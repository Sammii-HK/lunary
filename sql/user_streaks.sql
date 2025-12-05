-- User streaks table
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id TEXT PRIMARY KEY,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_check_in DATE,
  total_check_ins INTEGER DEFAULT 0,
  ritual_streak INTEGER DEFAULT 0,
  longest_ritual_streak INTEGER DEFAULT 0,
  last_ritual_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_streaks_last_check_in ON user_streaks(last_check_in);

-- Add ritual columns if they don't exist (for existing tables)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_streaks' AND column_name='ritual_streak') THEN
    ALTER TABLE user_streaks ADD COLUMN ritual_streak INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_streaks' AND column_name='longest_ritual_streak') THEN
    ALTER TABLE user_streaks ADD COLUMN longest_ritual_streak INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_streaks' AND column_name='last_ritual_date') THEN
    ALTER TABLE user_streaks ADD COLUMN last_ritual_date DATE;
  END IF;
END $$;
