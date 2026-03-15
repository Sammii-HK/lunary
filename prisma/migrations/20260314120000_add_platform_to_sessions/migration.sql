-- AlterTable
ALTER TABLE "user_sessions" ADD COLUMN     "platform" VARCHAR(20);

-- CreateIndex
CREATE INDEX "idx_user_sessions_platform" ON "user_sessions"("platform");
