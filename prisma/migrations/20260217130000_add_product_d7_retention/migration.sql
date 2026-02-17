-- AlterTable
ALTER TABLE "daily_metrics" ADD COLUMN IF NOT EXISTS "product_d7_retention" DECIMAL(5,2) DEFAULT 0;
