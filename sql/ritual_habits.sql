-- Ritual habits table
-- Tracks daily ritual completion (morning, evening, daily rituals)
CREATE TABLE IF NOT EXISTS ritual_habits (
  user_id TEXT NOT NULL,
  habit_date DATE NOT NULL,
  ritual_type TEXT NOT NULL, -- 'morning', 'evening', 'daily'
  completed BOOLEAN DEFAULT FALSE,
  completion_time TIMESTAMPTZ,
  metadata JSONB, -- e.g., which ritual was completed, duration, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, habit_date, ritual_type)
);

CREATE INDEX IF NOT EXISTS idx_ritual_habits_user_id ON ritual_habits(user_id);
CREATE INDEX IF NOT EXISTS idx_ritual_habits_date ON ritual_habits(habit_date);
CREATE INDEX IF NOT EXISTS idx_ritual_habits_user_date ON ritual_habits(user_id, habit_date);

