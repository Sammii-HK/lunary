-- CreateTable (IF NOT EXISTS for safety - table already exists in production)
CREATE TABLE IF NOT EXISTS "conversion_events" (
  "id" SERIAL PRIMARY KEY,
  "event_type" TEXT NOT NULL,
  "user_id" TEXT,
  "user_email" TEXT,
  "plan_type" TEXT,
  "trial_days_remaining" INTEGER,
  "feature_name" TEXT,
  "page_path" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMPTZ(6) DEFAULT NOW(),
  "anonymous_id" TEXT,
  "entity_type" TEXT,
  "entity_id" TEXT,
  "event_id" UUID
);

-- CreateIndexes (IF NOT EXISTS for safety)
CREATE INDEX IF NOT EXISTS "idx_conversion_events_anonymous_id" ON "conversion_events"("anonymous_id");
CREATE INDEX IF NOT EXISTS "idx_conversion_events_created_at" ON "conversion_events"("created_at");
CREATE INDEX IF NOT EXISTS "idx_conversion_events_event_created_at" ON "conversion_events"("event_type", "created_at");
CREATE INDEX IF NOT EXISTS "idx_conversion_events_event_type" ON "conversion_events"("event_type");
CREATE INDEX IF NOT EXISTS "idx_conversion_events_plan_type" ON "conversion_events"("plan_type");
