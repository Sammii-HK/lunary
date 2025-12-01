-- Shop Packs Table
-- Stores digital packs/products migrated from Jazz

CREATE TABLE IF NOT EXISTS shop_packs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  price INTEGER NOT NULL,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  image_url TEXT,
  download_url TEXT,
  file_size INTEGER,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_shop_packs_category ON shop_packs(category);
CREATE INDEX IF NOT EXISTS idx_shop_packs_is_active ON shop_packs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_shop_packs_stripe_product_id ON shop_packs(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_shop_packs_metadata ON shop_packs USING GIN(metadata);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_shop_packs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shop_packs_updated_at
    BEFORE UPDATE ON shop_packs
    FOR EACH ROW
    EXECUTE FUNCTION update_shop_packs_updated_at();

