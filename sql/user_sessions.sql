-- User Sessions Tracking Table
-- Tracks daily/weekly active users for engagement metrics

CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  
  -- User identification
  user_id TEXT NOT NULL,
  
  -- Session tracking
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Page/feature context
  page_path TEXT,
  feature_name TEXT,
  
  -- Additional metadata
  metadata JSONB,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_date ON user_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON user_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_date ON user_sessions(user_id, session_date);

-- Composite index for DAU/WAU queries
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_timestamp ON user_sessions(user_id, session_timestamp);

-- Example queries:
-- Get DAU (Daily Active Users) for today
-- SELECT COUNT(DISTINCT user_id) as dau
-- FROM user_sessions
-- WHERE session_date = CURRENT_DATE;

-- Get WAU (Weekly Active Users) for past 7 days
-- SELECT COUNT(DISTINCT user_id) as wau
-- FROM user_sessions
-- WHERE session_timestamp >= NOW() - INTERVAL '7 days';

-- Get stickiness (DAU/WAU)
-- SELECT 
--   (SELECT COUNT(DISTINCT user_id) FROM user_sessions WHERE session_date = CURRENT_DATE)::numeric /
--   NULLIF((SELECT COUNT(DISTINCT user_id) FROM user_sessions WHERE session_timestamp >= NOW() - INTERVAL '7 days'), 0) * 100
--   as stickiness_percent;

