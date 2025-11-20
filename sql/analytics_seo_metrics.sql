-- Analytics SEO Metrics Table
-- Stores daily Search Console metrics for historical tracking

CREATE TABLE IF NOT EXISTS analytics_seo_metrics (
  id SERIAL PRIMARY KEY,
  metric_date DATE NOT NULL UNIQUE,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr DECIMAL(10, 4) DEFAULT 0, -- Click-through rate as decimal (e.g., 0.05 = 5%)
  average_position DECIMAL(10, 2) DEFAULT 0,
  pages_indexed INTEGER DEFAULT 0, -- Count from sitemap
  article_count INTEGER DEFAULT 0, -- Count of grimoire articles/pages
  top_pages JSONB, -- Array of top pages with clicks: [{"url": "...", "clicks": 123}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_seo_metrics_date
  ON analytics_seo_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_analytics_seo_metrics_created_at
  ON analytics_seo_metrics(created_at);

-- Example queries:
-- Get last 30 days of SEO metrics:
--   SELECT * FROM analytics_seo_metrics 
--   WHERE metric_date >= CURRENT_DATE - INTERVAL '30 days'
--   ORDER BY metric_date DESC;
--
-- Get total clicks for last month:
--   SELECT SUM(clicks) AS total_clicks
--   FROM analytics_seo_metrics
--   WHERE metric_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
--     AND metric_date < DATE_TRUNC('month', CURRENT_DATE);

