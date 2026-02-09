-- ============================================================
-- SAFE MIGRATION: Fix 100% off coupon users stuck as 'trial'
-- Purpose: Update existing FULLORBIT / 100% discount users
--          from 'trial' to 'active' status
-- ============================================================

-- Step 1: PREVIEW - See who's affected (run this first)
SELECT
  user_id,
  user_email,
  status,
  promo_code,
  has_discount,
  discount_percent,
  monthly_amount_due,
  coupon_id,
  trial_ends_at,
  created_at
FROM subscriptions
WHERE status = 'trial'
AND (
  promo_code = 'FULLORBIT'
  OR (
    has_discount = true
    AND (
      COALESCE(discount_percent, 0) >= 100
      OR (monthly_amount_due IS NOT NULL AND monthly_amount_due <= 0)
    )
  )
)
ORDER BY created_at DESC;

-- Step 2: UPDATE - Fix the status (run after reviewing Step 1)
-- UPDATE subscriptions
-- SET status = 'active', updated_at = NOW()
-- WHERE status = 'trial'
-- AND (
--   promo_code = 'FULLORBIT'
--   OR (
--     has_discount = true
--     AND (
--       COALESCE(discount_percent, 0) >= 100
--       OR (monthly_amount_due IS NOT NULL AND monthly_amount_due <= 0)
--     )
--   )
-- );

-- Step 3: AUDIT LOG - Record the migration (run after Step 2)
-- INSERT INTO subscription_audit_log (
--   user_id, event_type, new_state, source, created_by, created_at
-- )
-- SELECT
--   user_id,
--   'status_corrected',
--   '{"status": "active", "reason": "100% off coupon was incorrectly stored as trial"}',
--   'migration_005',
--   'system',
--   NOW()
-- FROM subscriptions
-- WHERE status = 'active'
-- AND (
--   promo_code = 'FULLORBIT'
--   OR (
--     has_discount = true
--     AND (
--       COALESCE(discount_percent, 0) >= 100
--       OR (monthly_amount_due IS NOT NULL AND monthly_amount_due <= 0)
--     )
--   )
-- )
-- AND updated_at >= NOW() - INTERVAL '1 minute';
