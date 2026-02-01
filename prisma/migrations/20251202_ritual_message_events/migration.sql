-- Create ritual_message_events table for A/B testing ritual messages
-- Tracks when messages are shown and if users engage (respond in chat)
CREATE TABLE IF NOT EXISTS ritual_message_events (
  id SERIAL PRIMARY KEY,
  message_id VARCHAR(100) NOT NULL,
  context VARCHAR(50) NOT NULL,
  user_id VARCHAR(255) DEFAULT 'anonymous',
  shown_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  engaged BOOLEAN DEFAULT FALSE,
  engaged_at TIMESTAMP WITH TIME ZONE
);

-- Index for performance queries (engagement rate per message)
CREATE INDEX IF NOT EXISTS idx_ritual_message_performance 
  ON ritual_message_events(message_id, context);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_ritual_message_user 
  ON ritual_message_events(user_id, shown_at DESC);

-- Index for recent events (partial index removed due to Prisma shadow DB limitations)
-- Use a regular index instead - still fast for recent queries
CREATE INDEX IF NOT EXISTS idx_ritual_message_recent
  ON ritual_message_events(shown_at DESC);

