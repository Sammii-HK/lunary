-- AlterTable
ALTER TABLE "daily_metrics"
ADD COLUMN IF NOT EXISTS "returning_referrer_organic" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "returning_referrer_direct" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "returning_referrer_internal" INTEGER DEFAULT 0;
