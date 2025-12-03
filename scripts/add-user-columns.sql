-- Add user profile columns to accounts table (created by better-auth)
-- Run this migration once on your database

-- Add columns if they don't exist (PostgreSQL 9.6+)
DO $$ 
BEGIN
    -- Birthday (stored as text, encrypted by app)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'birthday') THEN
        ALTER TABLE accounts ADD COLUMN birthday TEXT;
    END IF;

    -- Stripe customer ID
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'stripe_customer_id') THEN
        ALTER TABLE accounts ADD COLUMN stripe_customer_id TEXT;
    END IF;

    -- Subscription status (free, trial, active, cancelled, past_due)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'subscription_status') THEN
        ALTER TABLE accounts ADD COLUMN subscription_status TEXT DEFAULT 'free';
    END IF;

    -- Subscription plan (lunary_plus, lunary_plus_ai, lunary_plus_ai_annual)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'subscription_plan') THEN
        ALTER TABLE accounts ADD COLUMN subscription_plan TEXT;
    END IF;

    -- Stripe subscription ID
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'stripe_subscription_id') THEN
        ALTER TABLE accounts ADD COLUMN stripe_subscription_id TEXT;
    END IF;

    -- Trial end date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'trial_ends_at') THEN
        ALTER TABLE accounts ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Current period end (for active subscriptions)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'current_period_end') THEN
        ALTER TABLE accounts ADD COLUMN current_period_end TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Birth chart data (JSONB array of placements)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'birth_chart') THEN
        ALTER TABLE accounts ADD COLUMN birth_chart JSONB;
    END IF;

    -- Personal tarot card (JSONB)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'personal_card') THEN
        ALTER TABLE accounts ADD COLUMN personal_card JSONB;
    END IF;

    -- User location (JSONB with lat, lng, city, country, timezone)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'location') THEN
        ALTER TABLE accounts ADD COLUMN location JSONB;
    END IF;

    -- Trial nurture email tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'trial_nurture_day2_sent') THEN
        ALTER TABLE accounts ADD COLUMN trial_nurture_day2_sent BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'trial_nurture_day3_sent') THEN
        ALTER TABLE accounts ADD COLUMN trial_nurture_day3_sent BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'trial_nurture_day5_sent') THEN
        ALTER TABLE accounts ADD COLUMN trial_nurture_day5_sent BOOLEAN DEFAULT FALSE;
    END IF;

    -- Trial reminder email tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'trial_reminder_3day_sent') THEN
        ALTER TABLE accounts ADD COLUMN trial_reminder_3day_sent BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'trial_reminder_1day_sent') THEN
        ALTER TABLE accounts ADD COLUMN trial_reminder_1day_sent BOOLEAN DEFAULT FALSE;
    END IF;

    -- Trial start date (for calculating which nurture email to send)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'trial_started_at') THEN
        ALTER TABLE accounts ADD COLUMN trial_started_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Discount info from Stripe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'has_discount') THEN
        ALTER TABLE accounts ADD COLUMN has_discount BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'discount_percent') THEN
        ALTER TABLE accounts ADD COLUMN discount_percent INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'coupon_id') THEN
        ALTER TABLE accounts ADD COLUMN coupon_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'monthly_amount_due') THEN
        ALTER TABLE accounts ADD COLUMN monthly_amount_due INTEGER;
    END IF;
END $$;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_accounts_stripe_customer_id ON accounts(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_accounts_subscription_status ON accounts(subscription_status);
CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts(email);
CREATE INDEX IF NOT EXISTS idx_accounts_trial_ends_at ON accounts(trial_ends_at);
CREATE INDEX IF NOT EXISTS idx_accounts_trial_started_at ON accounts(trial_started_at);
