-- Add missing columns to daily_metrics table
-- These columns support all dashboard metrics from pre-computed snapshots

-- App opened DAU/WAU (MAU already exists)
ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS app_opened_dau INTEGER NOT NULL DEFAULT 0;
ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS app_opened_wau INTEGER NOT NULL DEFAULT 0;

-- Returning users (users with 2+ active days)
ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS returning_dau INTEGER NOT NULL DEFAULT 0;
ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS returning_wau INTEGER NOT NULL DEFAULT 0;
ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS returning_mau INTEGER NOT NULL DEFAULT 0;

-- Reach metrics (page_viewed events)
ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS reach_dau INTEGER NOT NULL DEFAULT 0;
ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS reach_wau INTEGER NOT NULL DEFAULT 0;
ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS reach_mau INTEGER NOT NULL DEFAULT 0;

-- Grimoire metrics
ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS grimoire_dau INTEGER NOT NULL DEFAULT 0;
ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS grimoire_wau INTEGER NOT NULL DEFAULT 0;
ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS grimoire_mau INTEGER NOT NULL DEFAULT 0;
ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS grimoire_only_mau INTEGER NOT NULL DEFAULT 0;

-- Retention rates (as percentages)
ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS d1_retention DECIMAL(5,2) DEFAULT 0;
ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS d7_retention DECIMAL(5,2) DEFAULT 0;
ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS d30_retention DECIMAL(5,2) DEFAULT 0;

-- Active days distribution (count of users in each bucket)
ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS active_days_1 INTEGER NOT NULL DEFAULT 0;
ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS active_days_2_3 INTEGER NOT NULL DEFAULT 0;
ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS active_days_4_7 INTEGER NOT NULL DEFAULT 0;
ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS active_days_8_14 INTEGER NOT NULL DEFAULT 0;
ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS active_days_15_plus INTEGER NOT NULL DEFAULT 0;

-- Weekly stickiness (WAU/MAU)
ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS stickiness_wau_mau DECIMAL(5,2) DEFAULT 0;

-- Total accounts (all-time)
ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS total_accounts INTEGER NOT NULL DEFAULT 0;

-- Grimoire to app conversion
ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS grimoire_to_app_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS grimoire_to_app_users INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN daily_metrics.app_opened_dau IS 'Users who triggered app_opened event today';
COMMENT ON COLUMN daily_metrics.returning_dau IS 'Users with 2+ active days (D1 returning)';
COMMENT ON COLUMN daily_metrics.reach_dau IS 'Users with at least one page_viewed event';
COMMENT ON COLUMN daily_metrics.grimoire_mau IS 'Users who viewed grimoire content';
COMMENT ON COLUMN daily_metrics.grimoire_only_mau IS 'Users who ONLY viewed grimoire (no app usage)';
COMMENT ON COLUMN daily_metrics.d1_retention IS 'Percentage of users who returned day after signup';
COMMENT ON COLUMN daily_metrics.active_days_1 IS 'Users active exactly 1 day in period';

-- Returning referrer breakdown
ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS returning_referrer_organic INTEGER NOT NULL DEFAULT 0;
ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS returning_referrer_direct INTEGER NOT NULL DEFAULT 0;
ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS returning_referrer_internal INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN daily_metrics.returning_referrer_organic IS 'Returning users from organic search';
COMMENT ON COLUMN daily_metrics.returning_referrer_direct IS 'Returning users from direct/brand traffic';
COMMENT ON COLUMN daily_metrics.returning_referrer_internal IS 'Returning users from internal navigation';
