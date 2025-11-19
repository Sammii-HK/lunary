-- Add columns to track trial nurture email sequence
-- Day 2, Day 3, Day 5, Day 7 emails

DO $$ 
BEGIN
  -- Add trial_nurture_day2_sent column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'subscriptions' AND column_name = 'trial_nurture_day2_sent') THEN
    ALTER TABLE subscriptions ADD COLUMN trial_nurture_day2_sent BOOLEAN DEFAULT false;
  END IF;
  
  -- Add trial_nurture_day3_sent column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'subscriptions' AND column_name = 'trial_nurture_day3_sent') THEN
    ALTER TABLE subscriptions ADD COLUMN trial_nurture_day3_sent BOOLEAN DEFAULT false;
  END IF;
  
  -- Add trial_nurture_day5_sent column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'subscriptions' AND column_name = 'trial_nurture_day5_sent') THEN
    ALTER TABLE subscriptions ADD COLUMN trial_nurture_day5_sent BOOLEAN DEFAULT false;
  END IF;
  
  -- Add trial_nurture_day7_sent column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'subscriptions' AND column_name = 'trial_nurture_day7_sent') THEN
    ALTER TABLE subscriptions ADD COLUMN trial_nurture_day7_sent BOOLEAN DEFAULT false;
  END IF;
END $$;
