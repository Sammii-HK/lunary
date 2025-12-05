-- Conversation snippets table for storing conversation summaries
-- All snippets are encrypted at rest using AES-256-GCM

CREATE TABLE IF NOT EXISTS conversation_snippets (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  snippet_encrypted TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversation_snippets_user_id ON conversation_snippets(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_snippets_created ON conversation_snippets(created_at DESC);

