-- CreateTable
CREATE TABLE IF NOT EXISTS "pinterest_quote_queue" (
    "id" SERIAL NOT NULL,
    "quote_id" INTEGER,
    "quote_text" TEXT NOT NULL,
    "quote_author" TEXT,
    "scheduled_date" DATE NOT NULL,
    "image_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sent_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pinterest_quote_queue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "pinterest_quote_queue_scheduled_date_key" ON "pinterest_quote_queue"("scheduled_date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_pinterest_quote_queue_date" ON "pinterest_quote_queue"("scheduled_date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_pinterest_quote_queue_status" ON "pinterest_quote_queue"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_pinterest_quote_queue_quote_id" ON "pinterest_quote_queue"("quote_id");

-- AddForeignKey
ALTER TABLE "pinterest_quote_queue" ADD CONSTRAINT "pinterest_quote_queue_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "social_quotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
