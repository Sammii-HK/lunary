-- Push Subscriptions Table for Server-Side Notifications
-- This works alongside Jazz client-side storage

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  
  -- User identification (from Better Auth)
  user_id TEXT,
  user_email TEXT,
  
  -- Push subscription details
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  
  -- User preferences for notification types
  preferences JSONB DEFAULT '{
    "moonPhases": true,
    "planetaryTransits": true,
    "retrogrades": true,
    "sabbats": true,
    "eclipses": true,
    "majorAspects": true,
    "moonCircles": true
  }'::jsonb,
  
  -- Metadata
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_notification_sent TIMESTAMP WITH TIME ZONE,
  
  -- Sync tracking with Jazz
  jazz_sync_id TEXT, -- To track which Jazz record this corresponds to
  is_active BOOLEAN DEFAULT true
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_preferences ON push_subscriptions USING GIN(preferences);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_push_subscriptions_updated_at
    BEFORE UPDATE ON push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_push_subscriptions_updated_at();

-- Example queries:

-- Get active subscriptions for moon phase notifications
-- SELECT * FROM push_subscriptions 
-- WHERE is_active = true 
-- AND preferences->>'moonPhases' = 'true';

-- Get all active subscriptions for a specific user
-- SELECT * FROM push_subscriptions 
-- WHERE user_id = 'user123' 
-- AND is_active = true;

-- Update user preferences
-- UPDATE push_subscriptions 
-- SET preferences = preferences || '{"retrogrades": false}'::jsonb
-- WHERE user_id = 'user123';
