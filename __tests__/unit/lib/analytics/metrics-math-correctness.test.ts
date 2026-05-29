/**
 * Metrics Math Correctness
 *
 * Pins the arithmetic invariants the founder relies on to judge profitability.
 * Events are now stored and canonicalised correctly (PRs #295/#300/#301); this
 * suite guards the MATH layered on top of those events so a wrong
 * numerator/denominator, a div-by-zero leaking NaN/Infinity, a double-count, or
 * an inconsistent date window cannot silently corrupt a headline number.
 *
 * Scope: pure functions only, fed rows/inputs shaped like the real query output.
 * No database, no app-code changes.
 *
 * Invariants pinned:
 *   1. Rates stay finite and bounded (no NaN/Infinity surfacing as a metric).
 *   2. Zero denominators collapse to 0, never NaN/Infinity.
 *   3. A genuine subset numerator never produces a rate above 100%.
 *   4. DISTINCT-shaped inputs are not re-inflated by the JS layer.
 *   5. Date windows used for weekly cohorts are internally consistent.
 */

import { mapActivationBySourceRows } from '@/lib/analytics/source-labelled-activation';
import {
  extractActivity,
  extractFeatureAdoption,
  computeInsights,
  type ConsolidatedSnapshot,
} from '@/lib/analytics/snapshot-extractors';
import {
  computePercent,
  computeWeekOverWeekChange,
} from '@/lib/analytics/utils-react';
import { getWeekBoundaries } from '@/lib/analytics/weekly-metrics';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/**
 * Build a fully-populated ConsolidatedSnapshot with zeroed metrics, then let
 * each test override only the fields under test. Mirrors the flat shape the
 * snapshot endpoint returns to the analytics dashboard.
 */
function makeSnapshot(
  overrides: Partial<ConsolidatedSnapshot> = {},
): ConsolidatedSnapshot {
  const base: ConsolidatedSnapshot = {
    source: 'snapshot',
    snapshot_date: '2026-01-15',
    range: {
      start: new Date('2026-01-01T00:00:00Z'),
      end: new Date('2026-01-15T00:00:00Z'),
    },
    row_count: 0,

    dau: 0,
    wau: 0,
    mau: 0,
    signed_in_product_dau: 0,
    signed_in_product_wau: 0,
    signed_in_product_mau: 0,

    app_opened_dau: 0,
    app_opened_wau: 0,
    app_opened_mau: 0,

    returning_dau: 0,
    returning_wau: 0,
    returning_mau: 0,

    reach_dau: 0,
    reach_wau: 0,
    reach_mau: 0,
    sitewide_dau: 0,
    sitewide_wau: 0,
    sitewide_mau: 0,

    grimoire_dau: 0,
    grimoire_wau: 0,
    grimoire_mau: 0,
    content_mau_grimoire: 0,
    grimoire_only_mau: 0,
    grimoire_to_app_rate: 0,
    grimoire_to_app_users: 0,

    retention: { day_1: 0, day_7: 0, day_30: 0 },
    d1_retention: 0,
    d7_retention: 0,
    d30_retention: 0,
    product_d7_retention: 0,

    active_days_distribution: {},

    stickiness: 0,
    stickiness_dau_mau: 0,
    stickiness_wau_mau: 0,
    avg_active_days_per_week: 0,

    total_accounts: 0,
    new_signups: 0,
    activated_users: 0,
    activation_rate: 0,

    mrr: 0,
    active_subscriptions: 0,
    trial_subscriptions: 0,
    new_conversions: 0,

    feature_adoption: {
      dashboard: 0,
      horoscope: 0,
      tarot: 0,
      chart: 0,
      guide: 0,
      ritual: 0,
    },

    returning_referrer_breakdown: {
      organic_returning: 0,
      direct_returning: 0,
      internal_returning: 0,
    },

    trends: [],
    signed_in_product_trends: [],
    app_opened_trends: [],
    sitewide_trends: [],
    dau_trend: [],
    activation_trends: [],
    growth_trends: [],

    user_growth_rate: 0,
    total_signups_range: 0,

    subscription_30d: {
      window_days: 30,
      signups: 0,
      conversions: 0,
      conversion_rate: 0,
    },

    is_realtime_dau: false,
  };

  return { ...base, ...overrides };
}

/** Recursively assert every numeric leaf of an object is finite (no NaN/Infinity). */
function expectAllFinite(value: unknown, path = 'root'): void {
  if (typeof value === 'number') {
    expect(Number.isFinite(value)).toBe(true);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => expectAllFinite(v, `${path}[${i}]`));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      expectAllFinite(v, `${path}.${k}`);
    }
  }
}

// ---------------------------------------------------------------------------
// mapActivationBySourceRows: source-labelled activation rates
// ---------------------------------------------------------------------------

describe('mapActivationBySourceRows: source-labelled activation rate math', () => {
  it('returns 0 (not NaN/Infinity) when a source has signups = 0', () => {
    // A LEFT JOIN cohort group can surface 0 signups while still carrying
    // activation counts in adjacent rows. The rate must collapse to 0.
    const [row] = mapActivationBySourceRows([
      {
        source: 'tiktok',
        signups: 0,
        activated_24h: 0,
        activated_7d: 0,
      },
    ]);

    expect(row.activationRate24h).toBe(0);
    expect(row.activationRate7d).toBe(0);
    expect(Number.isFinite(row.activationRate24h)).toBe(true);
    expect(Number.isFinite(row.activationRate7d)).toBe(true);
  });

  it('keeps 24h activation a subset of 7d activation in a well-formed row (monotonic funnel)', () => {
    // activated_24h users are by definition also activated_7d users in the
    // source query (same CASE, tighter window), so the 24h rate must not
    // exceed the 7d rate.
    const [row] = mapActivationBySourceRows([
      {
        source: 'threads',
        signups: 20,
        activated_24h: 4,
        activated_7d: 9,
      },
    ]);

    expect(row.activationRate24h).toBe(20); // 4/20
    expect(row.activationRate7d).toBe(45); // 9/20
    expect(row.activationRate24h).toBeLessThanOrEqual(row.activationRate7d);
  });

  it('rounds to 2 decimals and stays bounded for a genuine subset numerator', () => {
    const [row] = mapActivationBySourceRows([
      {
        source: 'organic',
        signups: 3,
        activated_24h: 1,
        activated_7d: 2,
      },
    ]);

    expect(row.activationRate24h).toBeCloseTo(33.33, 2);
    expect(row.activationRate7d).toBeCloseTo(66.67, 2);
    expect(row.activationRate24h).toBeLessThanOrEqual(100);
    expect(row.activationRate7d).toBeLessThanOrEqual(100);
  });

  it('does not double-count: each source row maps to exactly one output row', () => {
    // The SQL already does COUNT(DISTINCT user_id) per group; the JS mapper
    // must be a 1:1 row transform and never fan out or merge rows.
    const rows = mapActivationBySourceRows([
      { source: 'a', signups: 5, activated_7d: 1 },
      { source: 'b', signups: 5, activated_7d: 2 },
      { source: 'c', signups: 5, activated_7d: 3 },
    ]);

    expect(rows).toHaveLength(3);
    expect(rows.map((r) => r.source)).toEqual(['a', 'b', 'c']);
  });

  it('coerces non-finite numeric inputs to 0 rather than propagating them', () => {
    const [row] = mapActivationBySourceRows([
      {
        source: 'x',
        signups: 'not-a-number',
        activated_24h: 'NaN',
        activated_7d: 'Infinity',
      },
    ]);

    expectAllFinite(row);
    expect(row.signups).toBe(0);
    expect(row.activated24h).toBe(0);
    expect(row.activated7d).toBe(0);
    expect(row.activationRate24h).toBe(0);
    expect(row.activationRate7d).toBe(0);
  });

  // ---- Robustness gap: no upper clamp on the activation rate ----
  // The current SQL caller guarantees activated <= signups, so live data is
  // safe. But rate() has no Math.min(.,100) guard, so a future caller feeding
  // activated > signups (e.g. attribution re-keying, a different query, or a
  // join that drops the signup row but keeps the event) would silently emit a
  // rate above 100%. This test PINS that current (unclamped) behaviour so any
  // future change in either direction is caught and reviewed.
  it('PINS current behaviour: activation rate is NOT clamped to 100% (robustness gap)', () => {
    const [row] = mapActivationBySourceRows([
      {
        source: 'reattributed',
        signups: 2,
        activated_24h: 3, // pathological: more activated than signups
        activated_7d: 5,
      },
    ]);

    // Documents the gap: the mapper passes the >100% value straight through.
    expect(row.activationRate24h).toBe(150);
    expect(row.activationRate7d).toBe(250);
    // It is at least always finite, so it never shows as NaN/Infinity.
    expect(Number.isFinite(row.activationRate24h)).toBe(true);
    expect(Number.isFinite(row.activationRate7d)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// snapshot-extractors: the founder-facing reshaping layer
// ---------------------------------------------------------------------------

describe('extractActivity: engagement and stickiness ratios', () => {
  it('collapses every ratio to 0 (no NaN/Infinity) when all denominators are 0', () => {
    const out = extractActivity(makeSnapshot());

    expectAllFinite(out);
    expect(out.engaged_rate_dau).toBe(0);
    expect(out.engaged_rate_wau).toBe(0);
    expect(out.engaged_rate_mau).toBe(0);
    expect(out.stickiness_dau_wau).toBe(0);
    expect(out.app_opened_stickiness_dau_mau).toBe(0);
    expect(out.product_stickiness_dau_mau).toBe(0);
    expect(out.product_stickiness_wau_mau).toBe(0);
  });

  it('computes engaged-rate against the product denominator, finite and correct', () => {
    const out = extractActivity(
      makeSnapshot({
        dau: 30,
        wau: 80,
        mau: 200,
        signed_in_product_dau: 60,
        signed_in_product_wau: 100,
        signed_in_product_mau: 400,
      }),
    );

    expect(out.engaged_rate_dau).toBeCloseTo(0.5, 1); // 30/60
    expect(out.engaged_rate_wau).toBeCloseTo(0.8, 1); // 80/100
    expect(out.engaged_rate_mau).toBeCloseTo(0.5, 1); // 200/400
    expectAllFinite(out);
  });

  it('keeps stickiness (DAU/WAU) bounded at 100% for a true subset', () => {
    // DAU is always a subset of WAU, so DAU/WAU stickiness cannot exceed 100%.
    const out = extractActivity(makeSnapshot({ dau: 50, wau: 50 }));
    expect(out.stickiness_dau_wau).toBe(100);
    expect(out.stickiness_dau_wau).toBeLessThanOrEqual(100);
  });

  it('does not throw or emit NaN when product denominators are 0 but raw counts are present', () => {
    // Defensive: a snapshot can carry DAU/WAU/MAU while signed_in_product_* is
    // still 0 (e.g. anonymous-heavy day). Ratios keyed on product_* must be 0.
    const out = extractActivity(
      makeSnapshot({ dau: 10, wau: 20, mau: 30 }),
    );
    expect(out.engaged_rate_dau).toBe(0);
    expect(out.product_stickiness_dau_mau).toBe(0);
    expectAllFinite(out);
  });
});

describe('extractFeatureAdoption: adoption-rate to user-count reverse derivation', () => {
  it('returns 0 users for every feature when product MAU is 0 (no NaN rounding)', () => {
    const out = extractFeatureAdoption(makeSnapshot());

    expect(out.mau).toBe(0);
    out.features.forEach((f) => {
      expect(f.users).toBe(0);
      expect(Number.isFinite(f.users)).toBe(true);
      expect(Number.isFinite(f.adoption_rate)).toBe(true);
    });
  });

  it('reverse-derives users from an adoption rate without exceeding product MAU', () => {
    // users = round(adoption% / 100 * productMau). A genuine adoption rate in
    // [0,100] can never imply more users than the MAU denominator.
    const out = extractFeatureAdoption(
      makeSnapshot({
        signed_in_product_mau: 200,
        feature_adoption: {
          dashboard: 50,
          horoscope: 100,
          tarot: 25,
          chart: 0,
          guide: 12.5,
          ritual: 33.33,
        },
      }),
    );

    const byType = Object.fromEntries(
      out.features.map((f) => [f.event_type, f.users]),
    );
    expect(byType['daily_dashboard_viewed']).toBe(100); // 50% of 200
    expect(byType['personalized_horoscope_viewed']).toBe(200); // 100% of 200
    expect(byType['tarot_drawn']).toBe(50); // 25% of 200
    expect(byType['chart_viewed']).toBe(0);
    expect(byType['astral_chat_used']).toBe(25); // 12.5% of 200
    out.features.forEach((f) => {
      expect(f.users).toBeLessThanOrEqual(out.mau);
      expect(f.users).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('computeInsights: derived conversion rate feeding the insight engine', () => {
  it('produces a finite, non-throwing result on an all-zero snapshot', () => {
    // Zero signups must not yield a NaN conversion rate that then mis-fires the
    // "low conversion" insight. The function divides new_conversions by
    // total_signups_range internally.
    expect(() => computeInsights(makeSnapshot())).not.toThrow();
    const insights = computeInsights(makeSnapshot());
    expect(Array.isArray(insights)).toBe(true);
  });

  it('does not fire the low-conversion insight when signup volume is below the gate', () => {
    // conversionRate = 0/0 -> 0, but signupCount is also 0, so the
    // signupCount > 100 guard must suppress the revenue warning.
    const insights = computeInsights(
      makeSnapshot({ total_signups_range: 0, new_conversions: 0 }),
    );
    const lowConversion = insights.find(
      (i) => i.category === 'revenue' && /conversion/i.test(i.message),
    );
    expect(lowConversion).toBeUndefined();
  });

  it('treats a healthy conversion rate as a true ratio in [0,1] (no >100% leakage)', () => {
    // 30 conversions / 300 signups = 0.10. With volume over the gate this is a
    // borderline-healthy rate and should NOT trip the <10% warning.
    const insights = computeInsights(
      makeSnapshot({ total_signups_range: 300, new_conversions: 30 }),
    );
    const lowConversion = insights.find(
      (i) => i.category === 'revenue' && /conversion/i.test(i.message),
    );
    expect(lowConversion).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// computePercent / computeWeekOverWeekChange: shared ratio helpers
// ---------------------------------------------------------------------------

describe('computePercent: zero-denominator and bounds safety', () => {
  it('returns 0 for a zero or missing denominator instead of NaN/Infinity', () => {
    expect(computePercent(5, 0)).toBe(0);
    expect(computePercent(5, undefined)).toBe(0);
    expect(computePercent(undefined, undefined)).toBe(0);
    expect(computePercent(5, -3)).toBe(0); // negative denominator guarded too
  });

  it('treats a missing numerator as 0', () => {
    expect(computePercent(undefined, 100)).toBe(0);
  });

  it('computes a correct percentage for a true subset', () => {
    expect(computePercent(25, 100)).toBe(25);
    expect(computePercent(1, 3)).toBeCloseTo(33.333, 3);
  });
});

describe('computeWeekOverWeekChange: growth math', () => {
  it('returns null percentChange when the previous value is 0 (avoids divide-by-zero)', () => {
    const { change, percentChange } = computeWeekOverWeekChange(10, 0);
    expect(change).toBe(10);
    expect(percentChange).toBeNull();
  });

  it('returns nulls when either side is null', () => {
    expect(computeWeekOverWeekChange(null, 5)).toEqual({
      change: null,
      percentChange: null,
    });
    expect(computeWeekOverWeekChange(5, null)).toEqual({
      change: null,
      percentChange: null,
    });
  });

  it('computes a finite signed change for non-zero baselines', () => {
    const up = computeWeekOverWeekChange(150, 100);
    expect(up.change).toBe(50);
    expect(up.percentChange).toBe(50);

    const down = computeWeekOverWeekChange(75, 100);
    expect(down.change).toBe(-25);
    expect(down.percentChange).toBe(-25);
  });
});

// ---------------------------------------------------------------------------
// getWeekBoundaries: weekly cohort window (date-window correctness)
// ---------------------------------------------------------------------------

describe('getWeekBoundaries: weekly cohort window boundaries', () => {
  it('returns a 7-day window spanning exactly one week', () => {
    const { weekStart, weekEnd } = getWeekBoundaries(
      new Date('2025-12-17T12:00:00Z'),
    );
    const spanMs = weekEnd.getTime() - weekStart.getTime();
    const days = spanMs / 86_400_000;
    // 6 days 23:59:59.999 -> just under 7 calendar days.
    expect(days).toBeGreaterThan(6.9);
    expect(days).toBeLessThan(7);
  });

  it('starts the week on Monday for a winter (GMT/UTC+0) date', () => {
    // In GMT there is no offset, so the boundary lands correctly.
    const { weekStart, weekEnd } = getWeekBoundaries(
      new Date('2025-12-17T12:00:00Z'),
    );
    expect(weekStart.getUTCDay()).toBe(1); // Monday
    expect(weekEnd.getUTCDay()).toBe(0); // Sunday
  });
});

/**
 * BUG: getWeekBoundaries shifts the week start to SUNDAY during British Summer
 * Time (BST, UTC+1), instead of Monday.
 *
 * Corrupted metric: every weekly metric and weekly cohort that buckets events
 * by getWeekBoundaries (calculateWeeklyMetrics: W1/W4 retention, weekly
 * acquisition, churn, trial-to-paid; calculateFunnelMetrics weekly funnel).
 *
 * Direction of skew: for roughly half the year (late March to late October),
 * the window is shifted one day EARLIER. Sunday's events are pulled into the
 * "wrong" week and the intended Monday is excluded, so each weekly bucket is
 * mis-attributed by one day at both edges. Week-over-week deltas computed off
 * these buckets are therefore unreliable during BST.
 *
 * Root cause: toTimezone() rebuilds the instant as a Date whose UTC fields hold
 * London wall-clock time. date-fns startOfWeek/endOfWeek then compute the week
 * using LOCAL getters, but the code immediately force-applies setUTCHours(0/23)
 * on top. Under BST the two operations disagree by the +1h offset, snapping
 * Monday 00:00 London (= Sunday 23:00 UTC) back to Sunday 00:00 UTC.
 *
 * Verified empirically: runner TZ Europe/London, input Wed 2025-07-16T12:00Z
 * yields weekStart 2025-07-13 (Sunday). Winter input yields the correct Monday.
 *
 * NOT fixed here per task scope (tests only). The skipped test below pins the
 * CORRECT invariant; the active companion test pins CURRENT buggy behaviour so
 * a fix is detected.
 */
describe('getWeekBoundaries: BST week-start bug', () => {
  const runnerTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const isLondonRunner = runnerTz === 'Europe/London';
  // July is unambiguously BST when the runner is on London time.
  const summer = new Date('2025-07-16T12:00:00Z');

  it.skip('CORRECT INVARIANT (currently failing): week should start on Monday even in BST', () => {
    const { weekStart, weekEnd } = getWeekBoundaries(summer);
    expect(weekStart.getUTCDay()).toBe(1); // Monday — currently returns 0 (Sunday)
    expect(weekEnd.getUTCDay()).toBe(0); // Sunday
  });

  it('PINS current buggy behaviour: BST week start lands on Sunday (London runner only)', () => {
    if (!isLondonRunner) {
      // The bug is TZ-of-runner dependent; only assert on the same TZ the
      // production cron and CI use (Europe/London). Elsewhere, just record it.
      // eslint-disable-next-line no-console
      console.warn(
        `[metrics-math] Skipping BST pin: runner TZ is ${runnerTz}, not Europe/London`,
      );
      expect(true).toBe(true);
      return;
    }
    const { weekStart } = getWeekBoundaries(summer);
    // Documents the defect: Monday expected, Sunday produced.
    expect(weekStart.getUTCDay()).toBe(0);
  });
});
