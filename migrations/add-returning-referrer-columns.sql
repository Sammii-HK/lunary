-- Migration: Add returning referrer breakdown columns to daily_metrics
-- Run this in Neon database console

ALTER TABLE daily_metrics
  ADD COLUMN IF NOT EXISTS returning_referrer_organic INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS returning_referrer_direct INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS returning_referrer_internal INTEGER DEFAULT 0;

-- Verify columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'daily_metrics'
  AND column_name LIKE '%returning_referrer%'
ORDER BY ordinal_position;
