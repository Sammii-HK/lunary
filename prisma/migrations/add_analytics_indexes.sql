-- Analytics Performance Indexes
-- Add indexes to speed up analytics queries that are taking 20+ seconds

-- ============================================================================
-- conversion_events table indexes
-- ============================================================================

-- Index for event_type filtering (used in all DAU/WAU/MAU queries)
CREATE INDEX IF NOT EXISTS idx_conversion_events_event_type
ON conversion_events(event_type);

-- Composite index for date range + event type queries (most common pattern)
CREATE INDEX IF NOT EXISTS idx_conversion_events_created_event_type
ON conversion_events(created_at DESC, event_type);

-- Index for user_id queries (counting distinct users)
CREATE INDEX IF NOT EXISTS idx_conversion_events_user_id
ON conversion_events(user_id)
WHERE user_id IS NOT NULL;

-- Index for anonymous_id queries (anonymous user tracking)
CREATE INDEX IF NOT EXISTS idx_conversion_events_anonymous_id
ON conversion_events(anonymous_id)
WHERE anonymous_id IS NOT NULL;

-- Composite index for the most common query pattern:
-- WHERE event_type IN (...) AND created_at BETWEEN ... AND user_id IS NOT NULL
CREATE INDEX IF NOT EXISTS idx_conversion_events_analytics_queries
ON conversion_events(event_type, created_at DESC, user_id)
WHERE user_id IS NOT NULL AND user_id NOT LIKE 'anon:%';

-- ============================================================================
-- user table indexes
-- ============================================================================

-- Index for createdAt (signup counting)
CREATE INDEX IF NOT EXISTS idx_user_created_at
ON "user"("createdAt" DESC);

-- Index for email filtering (test user exclusion)
CREATE INDEX IF NOT EXISTS idx_user_email
ON "user"(email)
WHERE email IS NOT NULL;

-- ============================================================================
-- subscriptions table indexes (for revenue queries)
-- ============================================================================

-- Index for active subscriptions by status
CREATE INDEX IF NOT EXISTS idx_subscription_status
ON subscriptions(status)
WHERE status = 'active';

-- Index for subscription creation date
CREATE INDEX IF NOT EXISTS idx_subscription_created_at
ON subscriptions("createdAt" DESC);

-- Composite index for user + creation date (conversion queries)
CREATE INDEX IF NOT EXISTS idx_subscription_user_created
ON subscriptions("userId", "createdAt" DESC);

-- ============================================================================
-- ANALYZE to update query planner statistics
-- ============================================================================

ANALYZE conversion_events;
ANALYZE "user";
ANALYZE subscriptions;
