-- Add discount/coupon tracking columns to subscriptions table
-- This allows us to track actual MRR vs theoretical MRR

ALTER TABLE subscriptions 
  ADD COLUMN IF NOT EXISTS has_discount BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS discount_percent DECIMAL(5,2), -- e.g., 100.00 for 100% off
  ADD COLUMN IF NOT EXISTS monthly_amount_due DECIMAL(10,2), -- Actual amount after discounts in GBP
  ADD COLUMN IF NOT EXISTS coupon_id TEXT; -- Stripe coupon ID if applicable

-- Add computed column for is_paying (must be done separately)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'subscriptions' AND column_name = 'is_paying') THEN
    ALTER TABLE subscriptions ADD COLUMN is_paying BOOLEAN GENERATED ALWAYS AS (COALESCE(monthly_amount_due, 0) > 0) STORED;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_subscriptions_is_paying ON subscriptions(is_paying) WHERE is_paying = true;
CREATE INDEX IF NOT EXISTS idx_subscriptions_has_discount ON subscriptions(has_discount) WHERE has_discount = true;

