-- Social Quotes Pool Table
-- Stores generated quotes for reuse across social media posts
-- Quotes are platform-agnostic and can be used on any platform

CREATE TABLE IF NOT EXISTS social_quotes (
  id SERIAL PRIMARY KEY,
  
  -- Quote content
  quote_text TEXT NOT NULL UNIQUE,
  author TEXT,
  
  -- Status workflow
  status TEXT NOT NULL DEFAULT 'available', -- available, used, archived
  
  -- Usage tracking
  used_at TIMESTAMP WITH TIME ZONE,
  use_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_quotes_status ON social_quotes(status);
CREATE INDEX IF NOT EXISTS idx_social_quotes_created_at ON social_quotes(created_at);
CREATE INDEX IF NOT EXISTS idx_social_quotes_use_count ON social_quotes(use_count);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_social_quotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_social_quotes_timestamp ON social_quotes;
CREATE TRIGGER update_social_quotes_timestamp
BEFORE UPDATE ON social_quotes
FOR EACH ROW
EXECUTE FUNCTION update_social_quotes_updated_at();

