-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "winback_day3_sent" BOOLEAN DEFAULT false,
ADD COLUMN     "winback_day7_sent" BOOLEAN DEFAULT false;
