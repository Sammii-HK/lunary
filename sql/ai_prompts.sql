-- AI Prompts table for daily/weekly personalized prompts
CREATE TABLE IF NOT EXISTS ai_prompts (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  prompt_type VARCHAR(50) NOT NULL, -- 'daily' or 'weekly'
  prompt_text TEXT NOT NULL,
  cosmic_context JSONB, -- Stores moon phase, transits, tarot, etc.
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Note: user_id references users table (adjust based on your auth setup)
  CONSTRAINT unique_user_prompt_type_date UNIQUE (user_id, prompt_type, generated_at)
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_ai_prompts_user_id ON ai_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_type ON ai_prompts(prompt_type);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_generated_at ON ai_prompts(generated_at);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_expires_at ON ai_prompts(expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_unread ON ai_prompts(user_id, read_at) WHERE read_at IS NULL;

-- Add comment
COMMENT ON TABLE ai_prompts IS 'Stores daily and weekly AI-generated prompts for users based on cosmic data';
