-- Add horoscope_views_all metric to daily_metrics
-- Tracks horoscope engagement including anonymous (SEO) traffic
ALTER TABLE "daily_metrics" ADD COLUMN IF NOT EXISTS "horoscope_views_all" DECIMAL(5,2) DEFAULT 0;
