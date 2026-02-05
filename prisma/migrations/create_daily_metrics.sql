-- Daily Metrics Snapshot Table
-- Pre-computed analytics metrics to reduce database costs
-- Computed once per day via cron, queried for historical data

CREATE TABLE IF NOT EXISTS daily_metrics (
  -- Primary key
  metric_date DATE PRIMARY KEY,

  -- Core engagement metrics
  dau INTEGER NOT NULL DEFAULT 0,
  wau INTEGER NOT NULL DEFAULT 0,
  mau INTEGER NOT NULL DEFAULT 0,

  -- Product-specific engagement
  signed_in_product_dau INTEGER NOT NULL DEFAULT 0,
  signed_in_product_wau INTEGER NOT NULL DEFAULT 0,
  signed_in_product_mau INTEGER NOT NULL DEFAULT 0,
  app_opened_mau INTEGER NOT NULL DEFAULT 0,

  -- Growth metrics
  new_signups INTEGER NOT NULL DEFAULT 0,
  activated_users INTEGER NOT NULL DEFAULT 0,
  activation_rate DECIMAL(5,2) DEFAULT 0,

  -- Revenue metrics
  mrr DECIMAL(10,2) DEFAULT 0,
  active_subscriptions INTEGER DEFAULT 0,
  trial_subscriptions INTEGER DEFAULT 0,
  new_conversions INTEGER DEFAULT 0,

  -- Engagement quality
  stickiness DECIMAL(5,2) DEFAULT 0, -- DAU/MAU ratio
  avg_active_days_per_week DECIMAL(5,2) DEFAULT 0,

  -- Feature adoption (% of MAU)
  dashboard_adoption DECIMAL(5,2) DEFAULT 0,
  horoscope_adoption DECIMAL(5,2) DEFAULT 0,
  tarot_adoption DECIMAL(5,2) DEFAULT 0,
  chart_adoption DECIMAL(5,2) DEFAULT 0,
  guide_adoption DECIMAL(5,2) DEFAULT 0,
  ritual_adoption DECIMAL(5,2) DEFAULT 0,

  -- Metadata
  computed_at TIMESTAMP DEFAULT NOW(),
  computation_duration_ms INTEGER, -- How long it took to compute

  -- Indexes for fast queries
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date
ON daily_metrics(metric_date DESC);

-- Composite index for date + computed_at queries
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date_computed
ON daily_metrics(metric_date DESC, computed_at DESC);

COMMENT ON TABLE daily_metrics IS 'Pre-computed daily analytics metrics to reduce database query costs. Historical data comes from this table, today comes from live queries.';
