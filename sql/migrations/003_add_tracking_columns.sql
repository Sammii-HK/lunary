-- ============================================================
-- SAFE: Only ADDS columns, never drops or modifies existing
-- Uses IF NOT EXISTS to be idempotent
-- Purpose: Add webhook tracking columns to subscriptions table
-- ============================================================

-- Add webhook tracking columns to subscriptions table
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS last_webhook_event_id TEXT,
  ADD COLUMN IF NOT EXISTS last_webhook_processed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS sync_error_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_sync_error TEXT,
  ADD COLUMN IF NOT EXISTS last_sync_error_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_subscriptions_last_webhook
  ON subscriptions(last_webhook_processed_at DESC)
  WHERE last_webhook_processed_at IS NOT NULL;

-- Partial index for subscriptions with errors only
CREATE INDEX IF NOT EXISTS idx_subscriptions_sync_errors
  ON subscriptions(sync_error_count)
  WHERE sync_error_count > 0;

-- Add comments for documentation
COMMENT ON COLUMN subscriptions.last_webhook_event_id IS 'Last Stripe webhook event ID that updated this subscription';
COMMENT ON COLUMN subscriptions.last_webhook_processed_at IS 'Timestamp of last successful webhook processing';
COMMENT ON COLUMN subscriptions.sync_error_count IS 'Count of consecutive sync errors (resets to 0 on success)';
COMMENT ON COLUMN subscriptions.last_sync_error IS 'Error message from last failed sync attempt';
COMMENT ON COLUMN subscriptions.last_sync_error_at IS 'Timestamp of last sync error';
