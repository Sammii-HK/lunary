-- Collections Feature
-- Allows users to save chat responses, rituals, insights, moon circle notes, and tarot readings

CREATE TABLE IF NOT EXISTS collections (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('chat', 'ritual', 'insight', 'moon_circle', 'tarot', 'journal', 'dream')),
  content JSONB NOT NULL,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT collections_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_category ON collections(category);
CREATE INDEX IF NOT EXISTS idx_collections_created_at ON collections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collections_tags ON collections USING GIN(tags);

-- Collection folders/notebooks
CREATE TABLE IF NOT EXISTS collection_folders (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'book',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT collection_folders_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_collection_folders_user_id ON collection_folders(user_id);

-- Link collections to folders
ALTER TABLE collections ADD COLUMN IF NOT EXISTS folder_id INTEGER REFERENCES collection_folders(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_collections_folder_id ON collections(folder_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_collections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_collections_timestamp
    BEFORE UPDATE ON collections
    FOR EACH ROW
    EXECUTE FUNCTION update_collections_updated_at();

CREATE TRIGGER update_collection_folders_timestamp
    BEFORE UPDATE ON collection_folders
    FOR EACH ROW
    EXECUTE FUNCTION update_collections_updated_at();

