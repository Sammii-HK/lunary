-- DropIndex
DROP INDEX "grimoire_embeddings_embedding_idx";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "birthChartHouseSystem" TEXT NOT NULL DEFAULT 'placidus';

-- CreateTable
CREATE TABLE "transit_blog_posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "transit_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "meta_description" TEXT NOT NULL,
    "keywords" TEXT[],
    "introduction" TEXT NOT NULL,
    "historical_deep_dive" TEXT NOT NULL,
    "astronomical_context" TEXT NOT NULL,
    "practical_guidance" TEXT NOT NULL,
    "sign_breakdowns" JSONB NOT NULL,
    "closing_section" TEXT NOT NULL,
    "planet" TEXT NOT NULL,
    "sign" TEXT,
    "transit_type" TEXT NOT NULL,
    "start_date" TIMESTAMPTZ(6),
    "end_date" TIMESTAMPTZ(6),
    "rarity" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "generated_by" TEXT,
    "model_used" TEXT,
    "word_count" INTEGER,
    "reviewed_at" TIMESTAMPTZ(6),
    "review_notes" TEXT,
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transit_blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transit_blog_posts_slug_key" ON "transit_blog_posts"("slug");

-- CreateIndex
CREATE INDEX "idx_transit_blog_status" ON "transit_blog_posts"("status");

-- CreateIndex
CREATE INDEX "idx_transit_blog_transit_id" ON "transit_blog_posts"("transit_id");

-- CreateIndex
CREATE INDEX "idx_transit_blog_published_at" ON "transit_blog_posts"("published_at" DESC);

-- CreateIndex
CREATE INDEX "idx_transit_blog_start_date" ON "transit_blog_posts"("start_date");
