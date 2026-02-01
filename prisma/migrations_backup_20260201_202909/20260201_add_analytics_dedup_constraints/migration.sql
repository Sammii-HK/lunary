-- Add Deduplication Constraints for Analytics Events
-- These constraints ensure one event per user/anonymous_id per UTC day
-- This makes DAU/MAU metrics bulletproof by preventing duplicates at the database level

-- ============================================
-- app_opened: For authenticated users
-- ============================================
CREATE UNIQUE INDEX IF NOT EXISTS uq_conversion_events_app_opened_daily
  ON conversion_events (
    user_id,
    event_type,
    ((created_at AT TIME ZONE 'UTC')::date)
  )
  WHERE event_type = 'app_opened' AND user_id IS NOT NULL;

-- app_opened: For anonymous users
CREATE UNIQUE INDEX IF NOT EXISTS uq_conversion_events_app_opened_daily_anon
  ON conversion_events (
    anonymous_id,
    event_type,
    ((created_at AT TIME ZONE 'UTC')::date)
  )
  WHERE event_type = 'app_opened' AND user_id IS NULL AND anonymous_id IS NOT NULL;

-- ============================================
-- product_opened: For authenticated users
-- ============================================
CREATE UNIQUE INDEX IF NOT EXISTS uq_conversion_events_product_opened_daily
  ON conversion_events (
    user_id,
    event_type,
    ((created_at AT TIME ZONE 'UTC')::date)
  )
  WHERE event_type = 'product_opened' AND user_id IS NOT NULL;

-- product_opened: For anonymous users
CREATE UNIQUE INDEX IF NOT EXISTS uq_conversion_events_product_opened_daily_anon
  ON conversion_events (
    anonymous_id,
    event_type,
    ((created_at AT TIME ZONE 'UTC')::date)
  )
  WHERE event_type = 'product_opened' AND user_id IS NULL AND anonymous_id IS NOT NULL;

-- ============================================
-- daily_dashboard_viewed: For authenticated users
-- ============================================
CREATE UNIQUE INDEX IF NOT EXISTS uq_conversion_events_daily_dashboard_daily
  ON conversion_events (
    user_id,
    event_type,
    ((created_at AT TIME ZONE 'UTC')::date)
  )
  WHERE event_type = 'daily_dashboard_viewed' AND user_id IS NOT NULL;

-- daily_dashboard_viewed: For anonymous users
CREATE UNIQUE INDEX IF NOT EXISTS uq_conversion_events_daily_dashboard_daily_anon
  ON conversion_events (
    anonymous_id,
    event_type,
    ((created_at AT TIME ZONE 'UTC')::date)
  )
  WHERE event_type = 'daily_dashboard_viewed' AND user_id IS NULL AND anonymous_id IS NOT NULL;

-- ============================================
-- grimoire_viewed: Already exists but adding anon version
-- ============================================
CREATE UNIQUE INDEX IF NOT EXISTS uq_conversion_events_grimoire_viewed_daily
  ON conversion_events (
    user_id,
    event_type,
    ((created_at AT TIME ZONE 'UTC')::date),
    COALESCE(entity_id, page_path, '')
  )
  WHERE event_type = 'grimoire_viewed' AND user_id IS NOT NULL;

-- ============================================
-- Event ID deduplication (idempotency key)
-- ============================================
CREATE UNIQUE INDEX IF NOT EXISTS uq_conversion_events_event_id
  ON conversion_events (event_id)
  WHERE event_id IS NOT NULL;
