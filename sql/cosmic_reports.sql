-- Cosmic Reports Table
-- Persists generated reports with optional public sharing tokens and expiration metadata

CREATE TABLE IF NOT EXISTS cosmic_reports (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  report_type TEXT NOT NULL,
  report_data JSONB NOT NULL,
  share_token TEXT UNIQUE,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_cosmic_reports_user_id ON cosmic_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_cosmic_reports_share_token ON cosmic_reports(share_token);
CREATE INDEX IF NOT EXISTS idx_cosmic_reports_is_public ON cosmic_reports(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_cosmic_reports_created_at ON cosmic_reports(created_at);

COMMENT ON TABLE cosmic_reports IS 'Stores generated cosmic reports for users and anonymous visitors.';
COMMENT ON COLUMN cosmic_reports.share_token IS 'Opaque token for public sharing links.';
