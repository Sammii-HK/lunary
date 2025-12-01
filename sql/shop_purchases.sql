-- Shop Purchases Table
-- Stores user purchases with download tokens migrated from Jazz

CREATE TABLE IF NOT EXISTS shop_purchases (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  pack_id TEXT NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  amount INTEGER NOT NULL,
  download_token TEXT NOT NULL,
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 5,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_shop_purchases_user_id ON shop_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_shop_purchases_pack_id ON shop_purchases(pack_id);
CREATE INDEX IF NOT EXISTS idx_shop_purchases_status ON shop_purchases(status);
CREATE INDEX IF NOT EXISTS idx_shop_purchases_download_token ON shop_purchases(download_token);
CREATE INDEX IF NOT EXISTS idx_shop_purchases_stripe_session_id ON shop_purchases(stripe_session_id);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_shop_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shop_purchases_updated_at
    BEFORE UPDATE ON shop_purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_shop_purchases_updated_at();

