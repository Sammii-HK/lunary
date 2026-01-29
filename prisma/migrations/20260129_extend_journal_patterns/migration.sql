-- AlterTable: Extend journal_patterns for Cosmic Companion pattern recognition
ALTER TABLE "journal_patterns"
  ADD COLUMN "pattern_category" VARCHAR(20),
  ADD COLUMN "confidence" DOUBLE PRECISION,
  ADD COLUMN "first_detected" TIMESTAMPTZ(6),
  ADD COLUMN "last_observed" TIMESTAMPTZ(6),
  ADD COLUMN "metadata" JSONB,
  ADD COLUMN "source_snapshot" VARCHAR(50);

-- Create new indexes for improved query performance
CREATE INDEX "idx_journal_patterns_user_type" ON "journal_patterns"("user_id", "pattern_type");
CREATE INDEX "idx_journal_patterns_user_category" ON "journal_patterns"("user_id", "pattern_category");
CREATE INDEX "idx_journal_patterns_data" ON "journal_patterns" USING GIN("pattern_data");

-- Set defaults for existing rows
UPDATE "journal_patterns"
SET
  pattern_category = 'transient',
  confidence = 0.5,
  first_detected = generated_at,
  last_observed = generated_at
WHERE pattern_category IS NULL;
