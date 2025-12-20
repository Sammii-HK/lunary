-- Daily Thread Modules table
-- Stores generated modules for each user per day
CREATE TABLE IF NOT EXISTS daily_thread_modules (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  modules_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_thread_modules_user_date ON daily_thread_modules(user_id, date DESC);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_daily_thread_modules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_daily_thread_modules_updated_at
    BEFORE UPDATE ON daily_thread_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_thread_modules_updated_at();

