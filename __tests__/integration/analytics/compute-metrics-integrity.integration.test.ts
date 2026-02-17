/**
 * @jest-environment node
 */

/**
 * Integration tests for compute-metrics against a REAL database.
 *
 * These tests verify that the compute-metrics endpoint produces numbers
 * that match raw SQL ground-truth queries against the same data.
 *
 * Run with: npx jest --testPathPattern=integration.*compute-metrics-integrity --no-coverage
 *
 * Requires: Real Neon database connection via POSTGRES_URL in .env.local
 */

import { sql } from '@vercel/postgres';
import { GET } from '@/app/api/cron/compute-metrics/route';
import { NextRequest } from 'next/server';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

// Pick a date with known data — use yesterday or a recent date with events
async function findDateWithData(): Promise<string> {
  const result = await sql.query(
    `SELECT DATE(created_at AT TIME ZONE 'UTC') as d, COUNT(*) as c
     FROM conversion_events
     WHERE created_at >= NOW() - INTERVAL '30 days'
     GROUP BY d
     ORDER BY c DESC
     LIMIT 1`,
  );
  if (!result.rows[0]?.d) {
    throw new Error(
      'No conversion_events in last 30 days — cannot run integration tests',
    );
  }
  const d = result.rows[0].d;
  // d might be a Date object or string
  return d instanceof Date
    ? d.toISOString().split('T')[0]
    : String(d).split('T')[0];
}

function makeRequest(date: string): NextRequest {
  return new NextRequest(
    `https://lunary.app/api/cron/compute-metrics?date=${date}`,
    { method: 'GET' },
  );
}

describe('compute-metrics integrity (real DB)', () => {
  let targetDate: string;
  let dayStart: string;
  let dayEnd: string;
  let wauStartStr: string;
  let mauStartStr: string;
  let hasIdentityLinks: boolean;

  beforeAll(async () => {
    // Remove CRON_SECRET so tests don't need auth
    delete process.env.CRON_SECRET;

    targetDate = await findDateWithData();

    const dt = new Date(targetDate);
    const ds = new Date(dt);
    ds.setUTCHours(0, 0, 0, 0);
    const de = new Date(dt);
    de.setUTCHours(23, 59, 59, 999);
    dayStart = ds.toISOString();
    dayEnd = de.toISOString();

    const wauStart = new Date(de);
    wauStart.setUTCDate(wauStart.getUTCDate() - 6);
    wauStartStr = wauStart.toISOString().split('T')[0];

    const mauStart = new Date(de);
    mauStart.setUTCDate(mauStart.getUTCDate() - 29);
    mauStartStr = mauStart.toISOString().split('T')[0];

    // Check identity links table
    const check = await sql.query(
      `SELECT to_regclass('analytics_identity_links') IS NOT NULL AS exists`,
    );
    hasIdentityLinks = Boolean(check.rows[0]?.exists);

    console.log(
      `[integration] Testing date: ${targetDate}, identity_links: ${hasIdentityLinks}`,
    );
  }, 30000);

  it('DAU matches raw COUNT(DISTINCT) on conversion_events for target date', async () => {
    // Ground truth: count distinct users from conversion_events for that day
    const idExpr = hasIdentityLinks
      ? `COALESCE(
           CASE WHEN ce.user_id IS NOT NULL AND ce.user_id <> '' AND ce.user_id NOT LIKE 'anon:%' THEN ce.user_id END,
           ail.user_id,
           ce.anonymous_id
         )`
      : `COALESCE(
           CASE WHEN ce.user_id IS NOT NULL AND ce.user_id <> '' AND ce.user_id NOT LIKE 'anon:%' THEN ce.user_id END,
           ce.anonymous_id
         )`;

    const joinClause = hasIdentityLinks
      ? 'LEFT JOIN analytics_identity_links ail ON ce.anonymous_id IS NOT NULL AND ail.anonymous_id = ce.anonymous_id'
      : '';

    const groundTruth = await sql.query(
      `SELECT COUNT(DISTINCT resolved_id) as count FROM (
         SELECT ${idExpr} as resolved_id
         FROM conversion_events ce ${joinClause}
         WHERE ce.created_at >= $1 AND ce.created_at <= $2
           AND (ce.user_id IS NOT NULL OR ce.anonymous_id IS NOT NULL)
           AND (ce.user_email IS NULL OR (ce.user_email NOT LIKE $3 AND ce.user_email != $4))
       ) sub`,
      [dayStart, dayEnd, TEST_EMAIL_PATTERN, TEST_EMAIL_EXACT],
    );
    const expectedDau = Number(groundTruth.rows[0]?.count || 0);

    // Run compute-metrics
    const response = await GET(makeRequest(targetDate));
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.metrics.dau).toBe(expectedDau);
    console.log(
      `[integration] DAU: expected=${expectedDau}, got=${body.metrics.dau}`,
    );
  }, 30000);

  it('product DAU counts only signed-in users with non-open/view events', async () => {
    const signedInExpr = hasIdentityLinks
      ? `COALESCE(
           CASE WHEN ce.user_id IS NOT NULL AND ce.user_id <> '' AND ce.user_id NOT LIKE 'anon:%' THEN ce.user_id END,
           ail.user_id
         )`
      : `CASE WHEN ce.user_id IS NOT NULL AND ce.user_id <> '' AND ce.user_id NOT LIKE 'anon:%' THEN ce.user_id ELSE NULL END`;

    const joinClause = hasIdentityLinks
      ? 'LEFT JOIN analytics_identity_links ail ON ce.anonymous_id IS NOT NULL AND ail.anonymous_id = ce.anonymous_id'
      : '';

    const groundTruth = await sql.query(
      `SELECT COUNT(DISTINCT resolved_id) as count FROM (
         SELECT ${signedInExpr} as resolved_id
         FROM conversion_events ce ${joinClause}
         WHERE ce.created_at >= $1 AND ce.created_at <= $2
           AND ce.event_type NOT IN ('app_opened', 'page_viewed')
           AND (ce.user_id IS NOT NULL OR ce.anonymous_id IS NOT NULL)
           AND (ce.user_email IS NULL OR (ce.user_email NOT LIKE $3 AND ce.user_email != $4))
       ) sub`,
      [dayStart, dayEnd, TEST_EMAIL_PATTERN, TEST_EMAIL_EXACT],
    );
    const expectedProductDau = Number(groundTruth.rows[0]?.count || 0);

    const response = await GET(makeRequest(targetDate));
    const body = await response.json();

    expect(body.metrics.productDau).toBe(expectedProductDau);
    console.log(
      `[integration] Product DAU: expected=${expectedProductDau}, got=${body.metrics.productDau}`,
    );
  }, 30000);

  it('WAU is >= DAU (7-day window always contains the target day)', async () => {
    const response = await GET(makeRequest(targetDate));
    const body = await response.json();

    expect(body.metrics.wau).toBeGreaterThanOrEqual(body.metrics.dau);
    console.log(
      `[integration] WAU=${body.metrics.wau} >= DAU=${body.metrics.dau}`,
    );
  }, 30000);

  it('MAU is >= WAU (30-day window always contains the 7-day window)', async () => {
    const response = await GET(makeRequest(targetDate));
    const body = await response.json();

    expect(body.metrics.mau).toBeGreaterThanOrEqual(body.metrics.wau);
    console.log(
      `[integration] MAU=${body.metrics.mau} >= WAU=${body.metrics.wau}`,
    );
  }, 30000);

  it('MAU from snapshots matches raw scan AFTER backfill populates all 30 days', async () => {
    const idExpr = hasIdentityLinks
      ? `COALESCE(
           CASE WHEN ce.user_id IS NOT NULL AND ce.user_id <> '' AND ce.user_id NOT LIKE 'anon:%' THEN ce.user_id END,
           ail.user_id,
           ce.anonymous_id
         )`
      : `COALESCE(
           CASE WHEN ce.user_id IS NOT NULL AND ce.user_id <> '' AND ce.user_id NOT LIKE 'anon:%' THEN ce.user_id END,
           ce.anonymous_id
         )`;

    const joinClause = hasIdentityLinks
      ? 'LEFT JOIN analytics_identity_links ail ON ce.anonymous_id IS NOT NULL AND ail.anonymous_id = ce.anonymous_id'
      : '';

    const dayEndDt = new Date(dayEnd);

    // Check how many days of snapshots exist in the MAU window
    const snapshotDays = await sql.query(
      `SELECT COUNT(DISTINCT metric_date) as days
       FROM daily_unique_users
       WHERE segment = 'all' AND metric_date >= $1::date AND metric_date <= $2::date`,
      [mauStartStr, targetDate],
    );
    const daysPopulated = Number(snapshotDays.rows[0]?.days || 0);

    if (daysPopulated < 25) {
      // Not enough snapshot days — verify the math is internally consistent instead:
      // MAU from snapshots should equal the DISTINCT users across populated snapshot days
      const snapshotMau = await sql.query(
        `SELECT COUNT(DISTINCT uid) as count
         FROM daily_unique_users, LATERAL unnest(user_ids) AS uid
         WHERE segment = 'all' AND metric_date >= $1::date AND metric_date <= $2::date`,
        [mauStartStr, targetDate],
      );
      const expectedSnapshotMau = Number(snapshotMau.rows[0]?.count || 0);

      const response = await GET(makeRequest(targetDate));
      const body = await response.json();

      expect(body.metrics.mau).toBe(expectedSnapshotMau);
      console.log(
        `[integration] MAU (partial snapshots, ${daysPopulated}/30 days): snapshot-derived=${body.metrics.mau}, snapshot-verified=${expectedSnapshotMau}. Run backfill to populate full 30d window.`,
      );
      return;
    }

    // Full 30 days populated — compare against raw conversion_events scan
    const mauStartDt = new Date(`${mauStartStr}T00:00:00.000Z`);
    const groundTruth = await sql.query(
      `SELECT COUNT(DISTINCT resolved_id) as count FROM (
         SELECT ${idExpr} as resolved_id
         FROM conversion_events ce ${joinClause}
         WHERE ce.created_at >= $1 AND ce.created_at <= $2
           AND (ce.user_id IS NOT NULL OR ce.anonymous_id IS NOT NULL)
           AND (ce.user_email IS NULL OR (ce.user_email NOT LIKE $3 AND ce.user_email != $4))
       ) sub`,
      [
        mauStartDt.toISOString(),
        dayEndDt.toISOString(),
        TEST_EMAIL_PATTERN,
        TEST_EMAIL_EXACT,
      ],
    );
    const expectedMau = Number(groundTruth.rows[0]?.count || 0);

    const response = await GET(makeRequest(targetDate));
    const body = await response.json();

    const delta = Math.abs(body.metrics.mau - expectedMau);
    const tolerance = Math.max(1, Math.ceil(expectedMau * 0.02)); // 2% or 1

    expect(delta).toBeLessThanOrEqual(tolerance);
    console.log(
      `[integration] MAU (full 30d): raw=${expectedMau}, snapshot=${body.metrics.mau}, delta=${delta}`,
    );
  }, 60000);

  it('signups match raw user table count for target day', async () => {
    const groundTruth = await sql.query(
      `SELECT COUNT(*) as count FROM "user"
       WHERE "createdAt" >= $1 AND "createdAt" <= $2
         AND (email IS NULL OR (email NOT LIKE $3 AND email != $4))`,
      [dayStart, dayEnd, TEST_EMAIL_PATTERN, TEST_EMAIL_EXACT],
    );
    const expectedSignups = Number(groundTruth.rows[0]?.count || 0);

    const response = await GET(makeRequest(targetDate));
    const body = await response.json();

    expect(body.metrics.signups).toBe(expectedSignups);
    console.log(
      `[integration] Signups: expected=${expectedSignups}, got=${body.metrics.signups}`,
    );
  }, 30000);

  it('daily_metrics row is written with correct date', async () => {
    await GET(makeRequest(targetDate));

    const result = await sql.query(
      `SELECT metric_date, dau, wau, mau, computation_duration_ms
       FROM daily_metrics WHERE metric_date = $1::date`,
      [targetDate],
    );

    expect(result.rows.length).toBe(1);
    const row = result.rows[0];
    expect(Number(row.dau)).toBeGreaterThanOrEqual(0);
    expect(Number(row.wau)).toBeGreaterThanOrEqual(Number(row.dau));
    expect(Number(row.mau)).toBeGreaterThanOrEqual(Number(row.wau));
    expect(Number(row.computation_duration_ms)).toBeGreaterThan(0);
    console.log(
      `[integration] daily_metrics row: DAU=${row.dau} WAU=${row.wau} MAU=${row.mau} duration=${row.computation_duration_ms}ms`,
    );
  }, 30000);

  it('daily_unique_users snapshots are populated for all 5 segments', async () => {
    await GET(makeRequest(targetDate));

    const result = await sql.query(
      `SELECT segment, user_count, array_length(user_ids, 1) as arr_len
       FROM daily_unique_users WHERE metric_date = $1::date
       ORDER BY segment`,
      [targetDate],
    );

    const segments = result.rows.map((r: any) => r.segment);
    expect(segments).toEqual(
      expect.arrayContaining([
        'all',
        'app_opened',
        'grimoire',
        'product',
        'reach',
      ]),
    );

    // user_count should match array length (or both 0)
    for (const row of result.rows) {
      const count = Number(row.user_count);
      const arrLen = Number(row.arr_len || 0);
      expect(count).toBe(arrLen);
    }

    console.log(
      `[integration] Snapshots:`,
      result.rows.map((r: any) => `${r.segment}=${r.user_count}`).join(', '),
    );
  }, 30000);

  it('idempotent — running twice produces identical metrics', async () => {
    const response1 = await GET(makeRequest(targetDate));
    const body1 = await response1.json();

    const response2 = await GET(makeRequest(targetDate));
    const body2 = await response2.json();

    // All metric values should be identical (computation duration may differ)
    const { computationDuration: _, ...metrics1 } = body1.metrics;
    const { computationDuration: _2, ...metrics2 } = body2.metrics;
    expect(metrics1).toEqual(metrics2);

    console.log(
      `[integration] Idempotent: both runs produced identical metrics`,
    );
  }, 60000);
});

describe('dedup integrity (real DB)', () => {
  it('ON CONFLICT (event_id) prevents duplicate inserts', async () => {
    const { deterministicEventId } =
      await import('@/lib/analytics/deterministic-event-id');
    const { canonicaliseEvent, insertCanonicalEvent } =
      await import('@/lib/analytics/canonical-events');

    const testEventId = deterministicEventId(
      'app_opened',
      'integration_test_dedup_user',
      '2099-01-01', // far future — won't collide with real data
    );

    const canonical = canonicaliseEvent({
      eventType: 'app_opened',
      eventId: testEventId,
      userId: 'integration_test_dedup_user',
      pagePath: '/',
    });

    if (!canonical.ok)
      throw new Error(`canonicaliseEvent failed: ${canonical.reason}`);

    // First insert should succeed
    const first = await insertCanonicalEvent(canonical.row);
    expect(first.inserted).toBe(true);

    // Second insert with same eventId should be deduplicated
    const second = await insertCanonicalEvent(canonical.row);
    expect(second.inserted).toBe(false);

    // Clean up
    await sql.query(`DELETE FROM conversion_events WHERE event_id = $1`, [
      testEventId,
    ]);
    console.log(
      `[integration] Dedup: first insert=true, second insert=false — ON CONFLICT works`,
    );
  }, 15000);

  it('NULL event_ids do NOT conflict (PostgreSQL treats NULLs as distinct)', async () => {
    const { canonicaliseEvent, insertCanonicalEvent } =
      await import('@/lib/analytics/canonical-events');

    // Use page_viewed (not app_opened) to avoid the per-event-type daily unique constraints
    let counter = 0;
    const makeNullIdEvent = () => {
      counter++;
      const c = canonicaliseEvent({
        eventType: 'page_viewed',
        userId: `integration_test_null_id_user_${counter}`,
        pagePath: `/test-null-${counter}`,
      });
      if (!c.ok) throw new Error(`canonicaliseEvent failed: ${c.reason}`);
      c.row.eventId = null;
      return c.row;
    };

    const first = await insertCanonicalEvent(makeNullIdEvent());
    const second = await insertCanonicalEvent(makeNullIdEvent());

    // Both should insert — NULL != NULL in PostgreSQL
    expect(first.inserted).toBe(true);
    expect(second.inserted).toBe(true);

    // Clean up
    await sql.query(
      `DELETE FROM conversion_events
       WHERE user_id LIKE 'integration_test_null_id_user_%'
         AND event_id IS NULL`,
    );
    console.log(
      `[integration] NULL event_ids: both inserts succeeded — NULLs are distinct`,
    );
  }, 15000);
});
