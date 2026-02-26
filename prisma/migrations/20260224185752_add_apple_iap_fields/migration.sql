-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "apple_original_transaction_id" TEXT,
ADD COLUMN     "subscription_source" TEXT DEFAULT 'stripe';
