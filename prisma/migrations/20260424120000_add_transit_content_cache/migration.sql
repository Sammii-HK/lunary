-- CreateTable
CREATE TABLE "transit_content_cache" (
    "id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_key" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "valid_from" TIMESTAMPTZ(6) NOT NULL,
    "valid_until" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transit_content_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transit_content_cache_event_audience_key" ON "transit_content_cache"("event_type", "event_key", "audience");

-- CreateIndex
CREATE INDEX "idx_transit_content_cache_event" ON "transit_content_cache"("event_type", "event_key");

-- CreateIndex
CREATE INDEX "idx_transit_content_cache_valid_until" ON "transit_content_cache"("valid_until");
