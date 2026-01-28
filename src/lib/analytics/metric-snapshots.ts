import { sql } from '@vercel/postgres';

export interface MetricSnapshot {
  period_type: 'weekly' | 'monthly';
  period_key: string;
  period_start: string;
  period_end: string;
  new_signups: number;
  new_trials: number;
  new_paying_subscribers: number;
  wau: number;
  activation_rate: number;
  trial_to_paid_conversion_rate: number;
  mrr: number;
  active_subscribers: number;
  churn_rate: number;
  d7_retention: number | null;
  extras: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface SaveSnapshotInput {
  period_type: 'weekly' | 'monthly';
  period_key: string;
  period_start: string; // YYYY-MM-DD
  period_end: string; // YYYY-MM-DD
  new_signups: number;
  new_trials: number;
  new_paying_subscribers: number;
  wau: number;
  activation_rate: number;
  trial_to_paid_conversion_rate: number;
  mrr: number;
  active_subscribers: number;
  churn_rate: number;
  d7_retention?: number | null;
  extras?: Record<string, unknown>;
}

export async function saveMetricSnapshot(
  input: SaveSnapshotInput,
): Promise<void> {
  await sql`
    INSERT INTO metric_snapshots (
      period_type, period_key, period_start, period_end,
      new_signups, new_trials, new_paying_subscribers,
      wau, activation_rate, trial_to_paid_conversion_rate,
      mrr, active_subscribers, churn_rate, d7_retention,
      extras, updated_at
    ) VALUES (
      ${input.period_type}, ${input.period_key},
      ${input.period_start}::date, ${input.period_end}::date,
      ${input.new_signups}, ${input.new_trials}, ${input.new_paying_subscribers},
      ${input.wau}, ${input.activation_rate}, ${input.trial_to_paid_conversion_rate},
      ${input.mrr}, ${input.active_subscribers}, ${input.churn_rate},
      ${input.d7_retention ?? null},
      ${input.extras ? JSON.stringify(input.extras) : null}::jsonb,
      NOW()
    )
    ON CONFLICT (period_type, period_key)
    DO UPDATE SET
      period_start = EXCLUDED.period_start,
      period_end = EXCLUDED.period_end,
      new_signups = EXCLUDED.new_signups,
      new_trials = EXCLUDED.new_trials,
      new_paying_subscribers = EXCLUDED.new_paying_subscribers,
      wau = EXCLUDED.wau,
      activation_rate = EXCLUDED.activation_rate,
      trial_to_paid_conversion_rate = EXCLUDED.trial_to_paid_conversion_rate,
      mrr = EXCLUDED.mrr,
      active_subscribers = EXCLUDED.active_subscribers,
      churn_rate = EXCLUDED.churn_rate,
      d7_retention = EXCLUDED.d7_retention,
      extras = EXCLUDED.extras,
      updated_at = NOW()
  `;
}

export async function getMetricSnapshots(
  period_type: 'weekly' | 'monthly',
  limit: number = 20,
): Promise<MetricSnapshot[]> {
  const result = await sql`
    SELECT * FROM metric_snapshots
    WHERE period_type = ${period_type}
    ORDER BY period_start DESC
    LIMIT ${limit}
  `;
  return result.rows as MetricSnapshot[];
}

export async function getMetricSnapshot(
  period_type: 'weekly' | 'monthly',
  period_key: string,
): Promise<MetricSnapshot | null> {
  const result = await sql`
    SELECT * FROM metric_snapshots
    WHERE period_type = ${period_type} AND period_key = ${period_key}
    LIMIT 1
  `;
  return (result.rows[0] as MetricSnapshot) || null;
}
