CREATE TABLE "citation_dataset_snapshots" (
    "dataset_key" TEXT NOT NULL,
    "snapshot_date" DATE NOT NULL,
    "version" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "generated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),

    CONSTRAINT "citation_dataset_snapshots_pkey" PRIMARY KEY ("dataset_key", "snapshot_date")
);

CREATE INDEX "idx_citation_dataset_snapshots_key_date" ON "citation_dataset_snapshots"("dataset_key", "snapshot_date" DESC);
CREATE INDEX "idx_citation_dataset_snapshots_generated_at" ON "citation_dataset_snapshots"("generated_at");
