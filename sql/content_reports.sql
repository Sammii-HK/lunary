-- Content reporting for community UGC (posts, questions, answers)
-- Enables in-app abuse reporting required by Google Play for UGC apps.

CREATE TABLE IF NOT EXISTS content_reports (
  id SERIAL PRIMARY KEY,
  reporter_id TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'question', 'answer')),
  content_id INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'harmful', 'misinformation', 'other')),
  details TEXT,                          -- Optional reporter description (max 500 chars)
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prevent duplicate reports from same user on same content
CREATE UNIQUE INDEX IF NOT EXISTS idx_content_reports_unique
  ON content_reports (reporter_id, content_type, content_id);

CREATE INDEX IF NOT EXISTS idx_content_reports_status
  ON content_reports (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_reports_content
  ON content_reports (content_type, content_id);

-- Auto-hide content when it accumulates multiple reports
-- (can be enforced via application logic checking report_count)
