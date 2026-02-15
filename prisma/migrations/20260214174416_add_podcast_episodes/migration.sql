-- CreateTable
CREATE TABLE "podcast_episodes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "episode_number" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "audio_url" TEXT NOT NULL,
    "duration_secs" INTEGER NOT NULL,
    "published_at" TIMESTAMPTZ(6) NOT NULL,
    "week_number" INTEGER,
    "year" INTEGER,
    "transcript" JSONB,
    "show_notes" JSONB,
    "grimoire_slugs" TEXT[],
    "status" VARCHAR(20) NOT NULL DEFAULT 'published',
    "podify_job_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "podcast_episodes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "podcast_episodes_episode_number_key" ON "podcast_episodes"("episode_number");

-- CreateIndex
CREATE UNIQUE INDEX "podcast_episodes_slug_key" ON "podcast_episodes"("slug");

-- CreateIndex
CREATE INDEX "podcast_episodes_status_published_at_idx" ON "podcast_episodes"("status", "published_at" DESC);

-- CreateIndex
CREATE INDEX "podcast_episodes_week_number_year_idx" ON "podcast_episodes"("week_number", "year");
