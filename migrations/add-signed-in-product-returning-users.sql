-- Migration: Add signed_in_product_returning_users column to daily_metrics
-- This stores the count of signed-in product users with 2+ active days in the MAU window.
-- Previously, the fast path used returning_mau (all-event returning) which is a different population.
-- Run this in Neon database console

ALTER TABLE daily_metrics
  ADD COLUMN IF NOT EXISTS signed_in_product_returning_users INTEGER DEFAULT 0;

-- Verify column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'daily_metrics'
  AND column_name = 'signed_in_product_returning_users';
