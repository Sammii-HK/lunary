-- CreateTable
CREATE TABLE IF NOT EXISTS "instagram_scheduled_posts" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "scheduled_time" TIMESTAMPTZ(6) NOT NULL,
    "caption" TEXT NOT NULL,
    "image_url" TEXT,
    "hashtags" TEXT[],
    "metadata" JSONB DEFAULT '{}',
    "posted" BOOLEAN DEFAULT false,
    "posted_at" TIMESTAMPTZ(6),
    "post_id" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instagram_scheduled_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "instagram_scheduled_posts_unique" ON "instagram_scheduled_posts"("date", "type", "scheduled_time");

-- CreateIndex
CREATE INDEX "idx_instagram_scheduled_posts_date" ON "instagram_scheduled_posts"("date");

-- CreateIndex
CREATE INDEX "idx_instagram_scheduled_posts_scheduled_time" ON "instagram_scheduled_posts"("scheduled_time");

-- CreateIndex
CREATE INDEX "idx_instagram_scheduled_posts_posted" ON "instagram_scheduled_posts"("posted");

-- CreateIndex
CREATE INDEX "idx_instagram_scheduled_posts_type" ON "instagram_scheduled_posts"("type");

-- CreateIndex
CREATE INDEX "idx_instagram_scheduled_posts_date_type" ON "instagram_scheduled_posts"("date", "type");
