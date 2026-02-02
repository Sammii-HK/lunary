-- CreateEnum
CREATE TYPE "tour_status" AS ENUM ('ACTIVE', 'COMPLETED', 'DISMISSED');

-- CreateTable
CREATE TABLE IF NOT EXISTS "tour_progress" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "tour_id" TEXT NOT NULL,
    "status" "tour_status" DEFAULT 'ACTIVE',
    "completed_at" TIMESTAMPTZ(6),
    "dismissed_at" TIMESTAMPTZ(6),
    "last_shown_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tour_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_tour_unique" ON "tour_progress"("user_id", "tour_id");

-- CreateIndex
CREATE INDEX "idx_tour_progress_user_id" ON "tour_progress"("user_id");
