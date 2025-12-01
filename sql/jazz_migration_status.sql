-- Jazz Migration Status Table
-- Tracks migration status for each user during transition

CREATE TABLE IF NOT EXISTS jazz_migration_status (
  user_id TEXT PRIMARY KEY,
  migrated_at TIMESTAMP WITH TIME ZONE,
  migration_status TEXT NOT NULL DEFAULT 'pending',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  jazz_account_id TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jazz_migration_status_status ON jazz_migration_status(migration_status);
CREATE INDEX IF NOT EXISTS idx_jazz_migration_status_jazz_account_id ON jazz_migration_status(jazz_account_id);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_jazz_migration_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_jazz_migration_status_updated_at
    BEFORE UPDATE ON jazz_migration_status
    FOR EACH ROW
    EXECUTE FUNCTION update_jazz_migration_status_updated_at();

