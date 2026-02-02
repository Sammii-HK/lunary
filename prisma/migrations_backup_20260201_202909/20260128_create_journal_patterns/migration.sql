-- CreateTable (IF NOT EXISTS for safety - table may already exist in production)
CREATE TABLE IF NOT EXISTS "journal_patterns" (
  "id" SERIAL PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "pattern_type" TEXT NOT NULL,
  "pattern_data" JSONB,
  "generated_at" TIMESTAMPTZ(6) DEFAULT NOW()
);

-- CreateIndex (IF NOT EXISTS for safety)
CREATE INDEX IF NOT EXISTS "idx_journal_patterns_user_id" ON "journal_patterns"("user_id");
