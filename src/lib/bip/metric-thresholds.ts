/**
 * Build in Public — Metric Visibility Thresholds
 *
 * Hides embarrassingly low metrics from captions/cards.
 * A metric is only shown when its value exceeds the threshold.
 */

// ---------------------------------------------------------------------------
// Thresholds
// ---------------------------------------------------------------------------

const VISIBILITY_THRESHOLDS: Record<string, number> = {
  mau: Infinity, // Hidden entirely for now
  mrr: 1, // Show only when > £0
  subscriberCount: 1, // Show when at least 1
  impressionsPerDay: 1000, // Show when meaningful
  clicksPerDay: 50, // Show when meaningful
  dau: 10, // Hide when single digits
  newSignups: 1, // Show when at least 1
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RawMetrics {
  mau?: number;
  mrr?: number;
  subscriberCount?: number;
  impressionsPerDay?: number;
  impressionsDelta?: number;
  clicksPerDay?: number;
  dau?: number;
  newSignups?: number;
}

export interface VisibleMetric {
  key: string;
  label: string;
  value: number;
  formatted: string;
  delta?: number; // WoW % change
}

export interface FilteredMetrics {
  visible: VisibleMetric[];
  hero: VisibleMetric | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatImpressions(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return String(n);
}

function formatMrr(n: number): string {
  if (n >= 1000) return `£${(n / 1000).toFixed(1)}k`;
  return `£${n.toFixed(2)}`;
}

const METRIC_CONFIG: Record<
  string,
  { label: string; format: (n: number) => string; deltaKey?: string }
> = {
  impressionsPerDay: {
    label: 'impressions/day',
    format: formatImpressions,
    deltaKey: 'impressionsDelta',
  },
  mrr: { label: 'MRR', format: formatMrr },
  subscriberCount: {
    label: 'active subscribers (early access)',
    format: (n) => String(n),
  },
  clicksPerDay: { label: 'clicks/day from Google', format: (n) => String(n) },
  dau: { label: 'DAU', format: (n) => String(n) },
  newSignups: {
    label: `new signup${1 !== 1 ? 's' : ''} this week`,
    format: (n) => String(n),
  },
};

// ---------------------------------------------------------------------------
// Main filter
// ---------------------------------------------------------------------------

/**
 * Returns only metrics above their visibility threshold, plus identifies
 * the "hero" metric (biggest positive WoW delta, or biggest absolute value
 * if no deltas are available).
 */
export function filterVisibleMetrics(raw: RawMetrics): FilteredMetrics {
  const visible: VisibleMetric[] = [];

  for (const [key, config] of Object.entries(METRIC_CONFIG)) {
    const value = raw[key as keyof RawMetrics];
    if (value === undefined || value === null) continue;

    const threshold = VISIBILITY_THRESHOLDS[key] ?? 0;
    if (value <= threshold && threshold !== 0) continue;

    const delta =
      config.deltaKey && raw[config.deltaKey as keyof RawMetrics] !== undefined
        ? (raw[config.deltaKey as keyof RawMetrics] as number)
        : undefined;

    // Fix newSignups label for plural
    const label =
      key === 'newSignups'
        ? `new signup${value !== 1 ? 's' : ''} this week`
        : config.label;

    visible.push({
      key,
      label,
      value,
      formatted: config.format(value),
      delta,
    });
  }

  // Hero: metric with biggest positive delta, falling back to first visible
  let hero: VisibleMetric | null = null;
  let bestDelta = -Infinity;
  for (const m of visible) {
    const d = m.delta ?? 0;
    if (d > bestDelta) {
      bestDelta = d;
      hero = m;
    }
  }
  if (!hero && visible.length > 0) {
    hero = visible[0];
  }

  return { visible, hero };
}
