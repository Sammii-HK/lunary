-- User memory table for storing personal facts learned from conversations
-- All personal data is encrypted at rest using AES-256-GCM

CREATE TABLE IF NOT EXISTS user_memory (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL, -- 'relationship', 'work', 'interest', 'concern', 'preference', 'life_event', 'goal'
  fact_encrypted TEXT NOT NULL, -- Encrypted personal fact
  confidence REAL DEFAULT 0.8, -- How confident we are in this fact (0-1)
  source_message_id TEXT, -- Optional reference to the message where this was learned
  mentioned_count INTEGER DEFAULT 1, -- How many times this has come up
  last_mentioned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_memory_user_id ON user_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memory_category ON user_memory(category);
CREATE INDEX IF NOT EXISTS idx_user_memory_last_mentioned ON user_memory(last_mentioned_at DESC);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_user_memory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_memory_timestamp ON user_memory;
CREATE TRIGGER update_user_memory_timestamp
  BEFORE UPDATE ON user_memory
  FOR EACH ROW
  EXECUTE FUNCTION update_user_memory_updated_at();

