-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "trial_nurture_day1_sent" BOOLEAN DEFAULT false,
ADD COLUMN     "trial_nurture_day4_sent" BOOLEAN DEFAULT false,
ADD COLUMN     "trial_nurture_day6_sent" BOOLEAN DEFAULT false;

-- CreateTable
CREATE TABLE "social_engagement_queue" (
    "id" SERIAL NOT NULL,
    "platform" TEXT NOT NULL,
    "engagement_id" TEXT NOT NULL,
    "author_name" TEXT,
    "comment_text" TEXT NOT NULL,
    "post_id" TEXT,
    "suggested_reply" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending_review',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMPTZ(6),

    CONSTRAINT "social_engagement_queue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "social_engagement_queue_engagement_id_key" ON "social_engagement_queue"("engagement_id");

-- CreateIndex
CREATE INDEX "idx_engagement_queue_status" ON "social_engagement_queue"("status");
