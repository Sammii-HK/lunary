-- CreateTable
CREATE TABLE "activation_recommendations" (
    "id" SERIAL NOT NULL,
    "recommendation" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "impact_estimate" TEXT,
    "segment" TEXT,
    "suggested_test" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB,
    "generated_by" TEXT,
    "generated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activation_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_activation_rec_category" ON "activation_recommendations"("category");

-- CreateIndex
CREATE INDEX "idx_activation_rec_priority" ON "activation_recommendations"("priority");

-- CreateIndex
CREATE INDEX "idx_activation_rec_status" ON "activation_recommendations"("status");

-- CreateIndex
CREATE INDEX "idx_activation_rec_generated_at" ON "activation_recommendations"("generated_at" DESC);
