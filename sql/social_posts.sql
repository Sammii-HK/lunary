-- Social Media Posts Table
-- Stores AI-generated social media posts for approval workflow

CREATE TABLE IF NOT EXISTS social_posts (
  id SERIAL PRIMARY KEY,
  
  -- Post content
  content TEXT NOT NULL,
  
  -- Platform and type
  platform TEXT NOT NULL, -- instagram, twitter, facebook, linkedin, pinterest, reddit
  post_type TEXT NOT NULL, -- feature, benefit, educational, inspirational, behind_scenes, promotional, user_story
  topic TEXT,
  
  -- Scheduling
  scheduled_date TIMESTAMP WITH TIME ZONE,
  
  -- Status workflow
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, sent
  rejection_feedback TEXT, -- Feedback when rejected to improve tone
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON social_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled_date ON social_posts(scheduled_date);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_social_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_social_posts_timestamp
BEFORE UPDATE ON social_posts
FOR EACH ROW
EXECUTE FUNCTION update_social_posts_updated_at();

