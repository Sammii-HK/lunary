/**
 * Build in Public — Shared Milestone Definitions
 *
 * Extracted from bip-weekly/route.ts so both the weekly cron and the
 * daily milestone-check cron share one source of truth.
 */

// ---------------------------------------------------------------------------
// Milestone types
// ---------------------------------------------------------------------------

export type MilestoneMetric =
  | 'impressionsPerDay'
  | 'clicksPerDay'
  | 'totalImpressions28d'
  | 'totalClicks28d'
  | 'peakImpressionsDay'
  | 'subscriberCount'
  | 'mrr';

export interface MilestoneDefinition {
  metric: MilestoneMetric;
  label: string;
  values: number[];
}

export interface MilestoneSnapshot {
  impressionsPerDay?: number;
  clicksPerDay?: number;
  totalImpressions28d?: number;
  totalClicks28d?: number;
  peakImpressionsDay?: number;
  subscriberCount?: number;
  mrr?: number;
}

export interface CrossedMilestone {
  metric: MilestoneMetric;
  label: string;
  threshold: number;
  currentValue: number;
}

// ---------------------------------------------------------------------------
// Milestone definitions
// ---------------------------------------------------------------------------

export const MILESTONES: MilestoneDefinition[] = [
  // SEO — daily averages (7-day)
  {
    metric: 'clicksPerDay',
    label: 'clicks/day from Google',
    values: [100, 250, 500, 1000],
  },
  {
    metric: 'impressionsPerDay',
    label: 'impressions/day',
    values: [25000, 50000, 100000, 250000],
  },

  // SEO — cumulative 28-day totals
  {
    metric: 'totalImpressions28d',
    label: 'impressions in 28 days',
    values: [500_000, 1_000_000, 2_500_000, 5_000_000],
  },
  {
    metric: 'totalClicks28d',
    label: 'clicks in 28 days',
    values: [5000, 10_000, 25_000],
  },

  // SEO — single-day peak
  {
    metric: 'peakImpressionsDay',
    label: 'impressions in a single day',
    values: [50_000, 75_000, 100_000],
  },

  // Subscribers (coupon-era signal)
  {
    metric: 'subscriberCount',
    label: 'subscribers',
    values: [10, 25, 50, 100, 250],
  },

  // MRR (for when coupons end)
  {
    metric: 'mrr',
    label: 'MRR',
    values: [10, 50, 100, 500, 1000],
  },
];

// ---------------------------------------------------------------------------
// Milestone check logic
// ---------------------------------------------------------------------------

/**
 * Check all milestones against a snapshot. Returns newly-crossed milestones
 * that haven't been posted yet.
 *
 * @param snapshot — current metric values
 * @param getBipState — async fn that reads posted state (e.g. from DB)
 */
export async function checkMilestones(
  snapshot: MilestoneSnapshot,
  getBipState: (key: string) => Promise<string | null>,
): Promise<CrossedMilestone[]> {
  const crossed: CrossedMilestone[] = [];

  for (const milestone of MILESTONES) {
    const currentValue = snapshot[milestone.metric] ?? 0;
    if (currentValue <= 0) continue;

    for (const threshold of milestone.values) {
      if (currentValue < threshold) continue;

      const stateKey = `bip_milestone_${milestone.metric}_${threshold}`;
      const alreadyPosted = await getBipState(stateKey);
      if (alreadyPosted) continue;

      crossed.push({
        metric: milestone.metric,
        label: milestone.label,
        threshold,
        currentValue,
      });
    }
  }

  return crossed;
}

/**
 * Mark a milestone as posted so it won't fire again.
 */
export async function markMilestonePosted(
  metric: MilestoneMetric,
  threshold: number,
  setBipState: (key: string, value: string) => Promise<void>,
): Promise<void> {
  const stateKey = `bip_milestone_${metric}_${threshold}`;
  await setBipState(stateKey, 'posted');
}
