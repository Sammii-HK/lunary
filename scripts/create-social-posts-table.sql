-- Create social_posts table
CREATE TABLE IF NOT EXISTS social_posts (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  platform TEXT NOT NULL,
  post_type TEXT NOT NULL,
  topic TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  rejection_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON social_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled_date ON social_posts(scheduled_date);

-- Create trigger function
CREATE OR REPLACE FUNCTION update_social_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_social_posts_timestamp ON social_posts;

CREATE TRIGGER update_social_posts_timestamp
BEFORE UPDATE ON social_posts
FOR EACH ROW
EXECUTE FUNCTION update_social_posts_updated_at();

