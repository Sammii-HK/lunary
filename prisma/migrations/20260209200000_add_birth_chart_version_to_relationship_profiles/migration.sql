-- AlterTable
ALTER TABLE "relationship_profiles" ADD COLUMN IF NOT EXISTS "birth_chart_version" INTEGER DEFAULT 0;
