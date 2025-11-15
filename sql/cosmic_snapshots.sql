-- Cosmic Snapshots Tables
-- Stores cached cosmic data for performance optimization

-- Per-user cosmic snapshots (personalized data)
CREATE TABLE IF NOT EXISTS cosmic_snapshots (
  user_id TEXT NOT NULL,
  snapshot_date DATE NOT NULL,
  snapshot_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_cosmic_snapshots_user_id ON cosmic_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_cosmic_snapshots_date ON cosmic_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_cosmic_snapshots_updated_at ON cosmic_snapshots(updated_at);

-- Global cosmic data (same for all users)
CREATE TABLE IF NOT EXISTS global_cosmic_data (
  data_date DATE PRIMARY KEY,
  moon_phase JSONB NOT NULL,
  planetary_positions JSONB NOT NULL,
  general_transits JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_global_cosmic_data_date ON global_cosmic_data(data_date);
CREATE INDEX IF NOT EXISTS idx_global_cosmic_data_updated_at ON global_cosmic_data(updated_at);

