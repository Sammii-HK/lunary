-- Newsletter Email Subscribers Table
-- Separate from push_subscriptions for email-only subscribers

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  
  -- Email address (required, unique)
  email TEXT NOT NULL UNIQUE,
  
  -- User identification (optional, from Better Auth)
  user_id TEXT,
  
  -- Subscription status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  
  -- Subscription preferences
  preferences JSONB DEFAULT '{
    "weeklyNewsletter": true,
    "blogUpdates": true,
    "productUpdates": false,
    "cosmicAlerts": false
  }'::jsonb,
  
  -- Source tracking
  source TEXT, -- 'signup', 'import', 'migration', etc.
  referrer TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_email_sent TIMESTAMP WITH TIME ZONE,
  email_count INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_user_id ON newsletter_subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON newsletter_subscribers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_verified ON newsletter_subscribers(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_preferences ON newsletter_subscribers USING GIN(preferences);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_newsletter_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_newsletter_subscribers_updated_at
    BEFORE UPDATE ON newsletter_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_newsletter_subscribers_updated_at();

-- Example queries:

-- Get active verified subscribers for weekly newsletter
-- SELECT email FROM newsletter_subscribers 
-- WHERE is_active = true 
-- AND is_verified = true
-- AND preferences->>'weeklyNewsletter' = 'true';

-- Count active subscribers
-- SELECT COUNT(*) FROM newsletter_subscribers 
-- WHERE is_active = true AND is_verified = true;

