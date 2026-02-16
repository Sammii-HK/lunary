-- CreateTable
CREATE TABLE "daily_unique_users" (
    "metric_date" DATE NOT NULL,
    "segment" TEXT NOT NULL,
    "user_ids" TEXT[],
    "user_count" INTEGER NOT NULL,

    CONSTRAINT "daily_unique_users_pkey" PRIMARY KEY ("metric_date","segment")
);

-- CreateIndex
CREATE INDEX "idx_daily_unique_users_segment" ON "daily_unique_users"("segment");

-- CreateIndex
CREATE INDEX "idx_conversion_events_anon_event" ON "conversion_events"("anonymous_id", "event_type", "created_at");

-- CreateIndex (NULLs are treated as distinct in PostgreSQL, so existing NULL event_ids won't conflict)
CREATE UNIQUE INDEX "idx_conversion_events_event_id_unique" ON "conversion_events"("event_id");
