-- AlterTable: Extend journal_patterns for Cosmic Companion pattern recognition
-- Using IF NOT EXISTS pattern for safety (columns may already exist)

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_patterns' AND column_name = 'pattern_category') THEN
    ALTER TABLE "journal_patterns" ADD COLUMN "pattern_category" VARCHAR(20);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_patterns' AND column_name = 'confidence') THEN
    ALTER TABLE "journal_patterns" ADD COLUMN "confidence" DOUBLE PRECISION;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_patterns' AND column_name = 'expires_at') THEN
    ALTER TABLE "journal_patterns" ADD COLUMN "expires_at" TIMESTAMPTZ(6);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_patterns' AND column_name = 'first_detected') THEN
    ALTER TABLE "journal_patterns" ADD COLUMN "first_detected" TIMESTAMPTZ(6);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_patterns' AND column_name = 'last_observed') THEN
    ALTER TABLE "journal_patterns" ADD COLUMN "last_observed" TIMESTAMPTZ(6);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_patterns' AND column_name = 'metadata') THEN
    ALTER TABLE "journal_patterns" ADD COLUMN "metadata" JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_patterns' AND column_name = 'source_snapshot') THEN
    ALTER TABLE "journal_patterns" ADD COLUMN "source_snapshot" VARCHAR(50);
  END IF;
END $$;

-- Create new indexes for improved query performance (IF NOT EXISTS for safety)
CREATE INDEX IF NOT EXISTS "idx_journal_patterns_user_type" ON "journal_patterns"("user_id", "pattern_type");
CREATE INDEX IF NOT EXISTS "idx_journal_patterns_user_category" ON "journal_patterns"("user_id", "pattern_category");
CREATE INDEX IF NOT EXISTS "idx_journal_patterns_expires" ON "journal_patterns"("expires_at");
CREATE INDEX IF NOT EXISTS "idx_journal_patterns_data" ON "journal_patterns" USING GIN("pattern_data");

-- Set defaults for existing rows (safe - only updates NULL values)
UPDATE "journal_patterns"
SET
  pattern_category = 'transient',
  confidence = 0.5,
  first_detected = generated_at,
  last_observed = generated_at
WHERE pattern_category IS NULL;
