-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "trialed_plans" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "blocked_users" (
    "id" SERIAL NOT NULL,
    "blocker_id" TEXT NOT NULL,
    "blocked_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocked_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_reports" (
    "id" SERIAL NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "content_id" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_blocked_users_blocker" ON "blocked_users"("blocker_id");

-- CreateIndex
CREATE INDEX "idx_blocked_users_blocked" ON "blocked_users"("blocked_id");

-- CreateIndex
CREATE UNIQUE INDEX "blocked_users_blocker_id_blocked_id_key" ON "blocked_users"("blocker_id", "blocked_id");

-- CreateIndex
CREATE INDEX "idx_content_reports_status" ON "content_reports"("status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_content_reports_content" ON "content_reports"("content_type", "content_id");

-- CreateIndex
CREATE UNIQUE INDEX "content_reports_reporter_id_content_type_content_id_key" ON "content_reports"("reporter_id", "content_type", "content_id");
