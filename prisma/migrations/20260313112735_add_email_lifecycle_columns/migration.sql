-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "abandoned_checkout_email2_sent" BOOLEAN DEFAULT false;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "abandoned_checkout_email3_sent" BOOLEAN DEFAULT false;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "browse_abandon_email1_sent" BOOLEAN DEFAULT false;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "browse_abandon_email2_sent" BOOLEAN DEFAULT false;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "browse_abandon_email3_sent" BOOLEAN DEFAULT false;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "last_checkout_expired_at" TIMESTAMPTZ(6);
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "last_pricing_viewed_at" TIMESTAMPTZ(6);
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "post_upgrade_day3_sent" BOOLEAN DEFAULT false;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "post_upgrade_day7_sent" BOOLEAN DEFAULT false;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "renewal_1d_sent" BOOLEAN DEFAULT false;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "renewal_30d_sent" BOOLEAN DEFAULT false;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "renewal_7d_sent" BOOLEAN DEFAULT false;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "welcome_day2_sent" BOOLEAN DEFAULT false;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "welcome_day5_sent" BOOLEAN DEFAULT false;
