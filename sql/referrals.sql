-- Referral System Tables

-- Referral codes table
CREATE TABLE IF NOT EXISTS referral_codes (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uses INTEGER DEFAULT 0,
  max_uses INTEGER,
  
  -- Indexes
  CONSTRAINT idx_referral_codes_code UNIQUE (code),
  CONSTRAINT idx_referral_codes_user_id UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);

-- User referrals tracking table
CREATE TABLE IF NOT EXISTS user_referrals (
  id SERIAL PRIMARY KEY,
  referrer_user_id TEXT NOT NULL,
  referred_user_id TEXT NOT NULL,
  referral_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reward_granted BOOLEAN DEFAULT false,
  reward_granted_at TIMESTAMP WITH TIME ZONE,
  
  -- Ensure a user can only be referred once
  CONSTRAINT unique_referred_user UNIQUE (referred_user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_referrals_referrer ON user_referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_referred ON user_referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_code ON user_referrals(referral_code);



