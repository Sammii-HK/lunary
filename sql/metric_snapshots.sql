-- Metric Snapshots
-- Stores periodic (weekly/monthly) aggregated KPIs for growth tracking and comparison.
-- period_type: 'weekly' or 'monthly'
-- period_key: ISO week string (e.g. '2026-W04') or year-month (e.g. '2026-01')

CREATE TABLE IF NOT EXISTS metric_snapshots (
  period_type TEXT NOT NULL CHECK (period_type IN ('weekly', 'monthly')),
  period_key TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Acquisition
  new_signups INTEGER NOT NULL DEFAULT 0,
  new_trials INTEGER NOT NULL DEFAULT 0,
  new_paying_subscribers INTEGER NOT NULL DEFAULT 0,

  -- Engagement
  wau INTEGER NOT NULL DEFAULT 0,
  activation_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,

  -- Conversion
  trial_to_paid_conversion_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,

  -- Revenue
  mrr NUMERIC(10, 2) NOT NULL DEFAULT 0,
  active_subscribers INTEGER NOT NULL DEFAULT 0,

  -- Retention & Health
  churn_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
  d7_retention NUMERIC(5, 2),

  -- Extras (top features, funnel steps, etc.)
  extras JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  PRIMARY KEY (period_type, period_key)
);

CREATE INDEX IF NOT EXISTS idx_metric_snapshots_type_start
  ON metric_snapshots(period_type, period_start);
CREATE INDEX IF NOT EXISTS idx_metric_snapshots_created_at
  ON metric_snapshots(created_at);
