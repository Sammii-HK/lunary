-- ============================================================
-- SAFE MIGRATION: Only adds new table
-- Purpose: Audit log for all subscription changes
-- ============================================================

-- Audit log for all subscription changes
CREATE TABLE IF NOT EXISTS subscription_audit_log (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  previous_state JSONB,
  new_state JSONB,
  changes JSONB,
  source TEXT NOT NULL,
  stripe_event_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT DEFAULT 'system'
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_subscription_audit_user_id
  ON subscription_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_audit_created_at
  ON subscription_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscription_audit_event_type
  ON subscription_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_audit_stripe_event
  ON subscription_audit_log(stripe_event_id)
  WHERE stripe_event_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON TABLE subscription_audit_log IS 'Audit trail of all subscription changes';
COMMENT ON COLUMN subscription_audit_log.source IS 'Source of change: webhook, manual, cron, api';
COMMENT ON COLUMN subscription_audit_log.event_type IS 'Type of event: subscription_created, subscription_updated, reconciliation_sync, etc.';
