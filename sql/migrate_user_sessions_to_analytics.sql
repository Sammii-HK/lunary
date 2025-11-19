-- Migration: Migrate user_sessions data to analytics_user_activity
-- Run this BEFORE dropping the user_sessions table to preserve historical data

-- Step 1: Migrate all user_sessions records to analytics_user_activity
-- This uses INSERT ... ON CONFLICT to handle duplicates gracefully
INSERT INTO analytics_user_activity (
  user_id,
  activity_date,
  activity_type,
  activity_count,
  metadata,
  created_at
)
SELECT
  user_id,
  session_date AS activity_date,
  'session' AS activity_type,
  1 AS activity_count,
  jsonb_build_object(
    'page_path', page_path,
    'feature_name', feature_name,
    'migrated_from', 'user_sessions',
    'original_metadata', COALESCE(metadata, '{}'::jsonb)
  ) AS metadata,
  COALESCE(created_at, NOW()) AS created_at
FROM user_sessions
WHERE user_id IS NOT NULL
  AND session_date IS NOT NULL
ON CONFLICT (user_id, activity_date, activity_type)
DO UPDATE SET
  -- If record already exists, merge metadata and increment count
  activity_count = analytics_user_activity.activity_count + 1,
  metadata = COALESCE(analytics_user_activity.metadata, '{}'::jsonb) || 
             COALESCE(EXCLUDED.metadata, '{}'::jsonb);

-- Step 2: Verify migration
-- Check how many records were migrated
SELECT 
  'user_sessions' AS source_table,
  COUNT(*) AS total_records,
  COUNT(DISTINCT user_id) AS unique_users,
  MIN(session_date) AS earliest_date,
  MAX(session_date) AS latest_date
FROM user_sessions
UNION ALL
SELECT 
  'analytics_user_activity (sessions)' AS source_table,
  COUNT(*) AS total_records,
  COUNT(DISTINCT user_id) AS unique_users,
  MIN(activity_date) AS earliest_date,
  MAX(activity_date) AS latest_date
FROM analytics_user_activity
WHERE activity_type = 'session';

-- Step 3: Check for any data loss
-- This should return 0 rows if migration was successful
SELECT 
  us.user_id,
  us.session_date,
  COUNT(*) AS missing_count
FROM user_sessions us
LEFT JOIN analytics_user_activity aua
  ON us.user_id = aua.user_id
  AND us.session_date = aua.activity_date
  AND aua.activity_type = 'session'
WHERE aua.id IS NULL
GROUP BY us.user_id, us.session_date
LIMIT 10;

-- If the above query returns rows, investigate before dropping user_sessions

