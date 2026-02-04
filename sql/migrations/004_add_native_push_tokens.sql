-- Migration: Add native push tokens table for FCM (iOS/Android)
--
-- This table stores Firebase Cloud Messaging tokens for native app users.
-- Web push uses VAPID via push_subscriptions table instead.

CREATE TABLE IF NOT EXISTS native_push_tokens (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  timezone TEXT,
  is_active BOOLEAN DEFAULT true,
  preferences JSONB DEFAULT '{}',
  last_notification_sent TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Index for finding active tokens
CREATE INDEX IF NOT EXISTS idx_native_push_active
ON native_push_tokens(is_active)
WHERE is_active = true;

-- Index for finding user's tokens
CREATE INDEX IF NOT EXISTS idx_native_push_user
ON native_push_tokens(user_id);

-- Index for finding tokens by platform (useful for platform-specific notifications)
CREATE INDEX IF NOT EXISTS idx_native_push_platform
ON native_push_tokens(platform)
WHERE is_active = true;

-- Comment on table
COMMENT ON TABLE native_push_tokens IS 'FCM push tokens for native iOS/Android apps';
COMMENT ON COLUMN native_push_tokens.token IS 'Firebase Cloud Messaging device token';
COMMENT ON COLUMN native_push_tokens.platform IS 'Device platform: ios or android';
COMMENT ON COLUMN native_push_tokens.preferences IS 'User notification preferences (moon_phase, transits, daily_card, etc.)';
