-- User Attribution Table
-- Stores first-touch attribution data for users to track SEO and marketing effectiveness

CREATE TABLE IF NOT EXISTS user_attribution (
  id SERIAL PRIMARY KEY,
  
  -- User identification (from Better Auth)
  user_id TEXT UNIQUE,
  
  -- Anonymous tracking ID (for pre-signup tracking)
  anonymous_id TEXT,
  
  -- First-touch attribution data
  first_touch_source TEXT, -- 'seo', 'social', 'email', 'direct', 'referral', 'paid'
  first_touch_medium TEXT, -- 'google', 'tiktok', 'instagram', etc.
  first_touch_campaign TEXT,
  first_touch_keyword TEXT, -- Search query if available
  first_touch_page TEXT, -- Landing page path
  first_touch_referrer TEXT, -- Full referrer URL
  first_touch_at TIMESTAMP WITH TIME ZONE,
  
  -- UTM parameters captured at first touch
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_attribution_user_id 
  ON user_attribution(user_id);
CREATE INDEX IF NOT EXISTS idx_user_attribution_source 
  ON user_attribution(first_touch_source);
CREATE INDEX IF NOT EXISTS idx_user_attribution_medium 
  ON user_attribution(first_touch_medium);
CREATE INDEX IF NOT EXISTS idx_user_attribution_created_at 
  ON user_attribution(created_at);
CREATE INDEX IF NOT EXISTS idx_user_attribution_first_touch_at 
  ON user_attribution(first_touch_at);

-- Composite index for source analysis
CREATE INDEX IF NOT EXISTS idx_user_attribution_source_medium 
  ON user_attribution(first_touch_source, first_touch_medium);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_user_attribution_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_attribution_timestamp ON user_attribution;
CREATE TRIGGER update_user_attribution_timestamp
    BEFORE UPDATE ON user_attribution
    FOR EACH ROW
    EXECUTE FUNCTION update_user_attribution_updated_at();

-- Example queries:

-- Get attribution breakdown for all users
-- SELECT 
--   first_touch_source,
--   first_touch_medium,
--   COUNT(*) as user_count
-- FROM user_attribution
-- WHERE created_at >= NOW() - INTERVAL '30 days'
-- GROUP BY first_touch_source, first_touch_medium
-- ORDER BY user_count DESC;

-- Get % of users from organic (SEO) traffic
-- SELECT 
--   COUNT(*) FILTER (WHERE first_touch_source = 'seo') as organic_users,
--   COUNT(*) as total_users,
--   ROUND(
--     COUNT(*) FILTER (WHERE first_touch_source = 'seo')::numeric / 
--     NULLIF(COUNT(*), 0) * 100, 
--     2
--   ) as organic_percentage
-- FROM user_attribution
-- WHERE created_at >= NOW() - INTERVAL '30 days';

-- Get top landing pages for organic traffic
-- SELECT 
--   first_touch_page,
--   COUNT(*) as user_count
-- FROM user_attribution
-- WHERE first_touch_source = 'seo'
--   AND created_at >= NOW() - INTERVAL '30 days'
-- GROUP BY first_touch_page
-- ORDER BY user_count DESC
-- LIMIT 20;

-- Join with subscriptions to get revenue by source
-- SELECT 
--   ua.first_touch_source,
--   ua.first_touch_medium,
--   COUNT(DISTINCT ua.user_id) as total_users,
--   COUNT(DISTINCT s.user_id) as paying_users,
--   ROUND(
--     COUNT(DISTINCT s.user_id)::numeric / 
--     NULLIF(COUNT(DISTINCT ua.user_id), 0) * 100, 
--     2
--   ) as conversion_rate
-- FROM user_attribution ua
-- LEFT JOIN subscriptions s ON ua.user_id = s.user_id AND s.status = 'active'
-- GROUP BY ua.first_touch_source, ua.first_touch_medium
-- ORDER BY total_users DESC;

