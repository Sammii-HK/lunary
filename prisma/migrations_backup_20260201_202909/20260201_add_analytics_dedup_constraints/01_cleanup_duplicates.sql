-- SAFE Duplicate Cleanup for Analytics Events
-- This script removes duplicate events, keeping the EARLIEST event per user per day
-- Run this BEFORE creating the unique indexes

-- ============================================
-- STEP 1: DRY RUN - See how many duplicates exist
-- ============================================

-- Count app_opened duplicates (authenticated users)
SELECT
  'app_opened (authenticated)' as event_type,
  COUNT(*) as total_duplicates_to_remove
FROM conversion_events ce
WHERE ce.event_type = 'app_opened'
  AND ce.user_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM conversion_events ce2
    WHERE ce2.event_type = 'app_opened'
      AND ce2.user_id = ce.user_id
      AND (ce2.created_at AT TIME ZONE 'UTC')::date = (ce.created_at AT TIME ZONE 'UTC')::date
      AND ce2.id < ce.id  -- Keep the earliest (lowest ID)
  );

-- Count app_opened duplicates (anonymous users)
SELECT
  'app_opened (anonymous)' as event_type,
  COUNT(*) as total_duplicates_to_remove
FROM conversion_events ce
WHERE ce.event_type = 'app_opened'
  AND ce.user_id IS NULL
  AND ce.anonymous_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM conversion_events ce2
    WHERE ce2.event_type = 'app_opened'
      AND ce2.user_id IS NULL
      AND ce2.anonymous_id = ce.anonymous_id
      AND (ce2.created_at AT TIME ZONE 'UTC')::date = (ce.created_at AT TIME ZONE 'UTC')::date
      AND ce2.id < ce.id
  );

-- Count product_opened duplicates (authenticated users)
SELECT
  'product_opened (authenticated)' as event_type,
  COUNT(*) as total_duplicates_to_remove
FROM conversion_events ce
WHERE ce.event_type = 'product_opened'
  AND ce.user_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM conversion_events ce2
    WHERE ce2.event_type = 'product_opened'
      AND ce2.user_id = ce.user_id
      AND (ce2.created_at AT TIME ZONE 'UTC')::date = (ce.created_at AT TIME ZONE 'UTC')::date
      AND ce2.id < ce.id
  );

-- Count product_opened duplicates (anonymous users)
SELECT
  'product_opened (anonymous)' as event_type,
  COUNT(*) as total_duplicates_to_remove
FROM conversion_events ce
WHERE ce.event_type = 'product_opened'
  AND ce.user_id IS NULL
  AND ce.anonymous_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM conversion_events ce2
    WHERE ce2.event_type = 'product_opened'
      AND ce2.user_id IS NULL
      AND ce2.anonymous_id = ce.anonymous_id
      AND (ce2.created_at AT TIME ZONE 'UTC')::date = (ce.created_at AT TIME ZONE 'UTC')::date
      AND ce2.id < ce.id
  );

-- Count daily_dashboard_viewed duplicates
SELECT
  'daily_dashboard_viewed' as event_type,
  COUNT(*) as total_duplicates_to_remove
FROM conversion_events ce
WHERE ce.event_type = 'daily_dashboard_viewed'
  AND ce.user_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM conversion_events ce2
    WHERE ce2.event_type = 'daily_dashboard_viewed'
      AND ce2.user_id = ce.user_id
      AND (ce2.created_at AT TIME ZONE 'UTC')::date = (ce.created_at AT TIME ZONE 'UTC')::date
      AND ce2.id < ce.id
  );
