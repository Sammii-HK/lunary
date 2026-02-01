-- CreateTable
CREATE TABLE "social_posts" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "post_type" TEXT NOT NULL,
    "topic" TEXT,
    "scheduled_date" TIMESTAMP(6),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejection_feedback" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_social_posts_status" ON "social_posts"("status");

-- CreateIndex
CREATE INDEX "idx_social_posts_platform" ON "social_posts"("platform");

-- CreateIndex
CREATE INDEX "idx_social_posts_created_at" ON "social_posts"("created_at");

-- CreateIndex
CREATE INDEX "idx_social_posts_scheduled_date" ON "social_posts"("scheduled_date");

-- CreateTrigger
CREATE OR REPLACE FUNCTION update_social_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_social_posts_timestamp
BEFORE UPDATE ON social_posts
FOR EACH ROW
EXECUTE FUNCTION update_social_posts_updated_at();

