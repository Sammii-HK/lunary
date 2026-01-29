-- ============================================================
-- SAFE MIGRATION: Only adds new tables, never drops/alters
-- Purpose: Track webhook events for idempotency and debugging
-- ============================================================

-- Create webhook events table for idempotency and debugging
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id SERIAL PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processing_status TEXT NOT NULL DEFAULT 'pending',
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  user_id TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  raw_payload JSONB,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id
  ON stripe_webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status
  ON stripe_webhook_events(processing_status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_user_id
  ON stripe_webhook_events(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at
  ON stripe_webhook_events(created_at DESC);

-- Partial index for failed events only (efficient)
CREATE INDEX IF NOT EXISTS idx_webhook_events_failed
  ON stripe_webhook_events(processing_status, created_at)
  WHERE processing_status = 'failed';

-- Add comment for documentation
COMMENT ON TABLE stripe_webhook_events IS 'Tracks all Stripe webhook events for idempotency and debugging';
COMMENT ON COLUMN stripe_webhook_events.processing_status IS 'Status: pending, processing, completed, failed';
COMMENT ON COLUMN stripe_webhook_events.retry_count IS 'Number of times Stripe has retried this webhook';
