-- User blocking for community safety
-- Blocked users' content is hidden from the blocker's feed.

CREATE TABLE IF NOT EXISTS blocked_users (
  id SERIAL PRIMARY KEY,
  blocker_id TEXT NOT NULL,
  blocked_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_blocked_users_unique
  ON blocked_users (blocker_id, blocked_id);

CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker
  ON blocked_users (blocker_id);

CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked
  ON blocked_users (blocked_id);
