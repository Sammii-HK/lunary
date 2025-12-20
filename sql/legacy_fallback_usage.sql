-- Legacy Fallback Usage Tracking
-- Tracks when users log in via the legacy system fallback

CREATE TABLE IF NOT EXISTS legacy_fallback_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  user_email TEXT,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  migrated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_legacy_fallback_usage_used_at ON legacy_fallback_usage(used_at DESC);
CREATE INDEX IF NOT EXISTS idx_legacy_fallback_usage_user_id ON legacy_fallback_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_legacy_fallback_usage_user_email ON legacy_fallback_usage(user_email);

-- Function to get usage statistics
CREATE OR REPLACE FUNCTION get_legacy_fallback_stats()
RETURNS TABLE (
  total_usage bigint,
  last_usage timestamp with time zone,
  usage_last_30_days bigint,
  usage_last_90_days bigint,
  unique_users bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::bigint as total_usage,
    MAX(used_at) as last_usage,
    COUNT(*) FILTER (WHERE used_at > NOW() - INTERVAL '30 days')::bigint as usage_last_30_days,
    COUNT(*) FILTER (WHERE used_at > NOW() - INTERVAL '90 days')::bigint as usage_last_90_days,
    COUNT(DISTINCT COALESCE(user_id, user_email))::bigint as unique_users
  FROM legacy_fallback_usage;
END;
$$ LANGUAGE plpgsql;

