-- CreateTable
CREATE TABLE "pre_rendered_stories" (
    "id" SERIAL NOT NULL,
    "date_str" TEXT NOT NULL,
    "slot_index" INTEGER NOT NULL,
    "variant" TEXT NOT NULL,
    "blob_url" TEXT NOT NULL,
    "rendered_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pre_rendered_stories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "idx_pre_rendered_stories_date_slot" ON "pre_rendered_stories"("date_str", "slot_index");

-- CreateIndex
CREATE INDEX "idx_pre_rendered_stories_date" ON "pre_rendered_stories"("date_str");
