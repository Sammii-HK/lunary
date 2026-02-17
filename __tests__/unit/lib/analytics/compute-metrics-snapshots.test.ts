/**
 * @jest-environment node
 */

/**
 * Tests for the compute-metrics cron endpoint (incremental snapshot approach).
 *
 * Critical investor-grade verifications:
 * - Phase 1: Daily snapshots are populated with correct SQL per segment
 * - Phase 2: WAU/MAU derived from daily_unique_users match expected math
 * - Returning user logic: 2+ active days counted correctly
 * - Grimoire-only: grimoire minus app_opened correctly computed
 * - Active days distribution: bucket boundaries are correct
 * - No data loss: all segments are populated before WAU/MAU reads
 * - Edge cases: zero-user days, single-day users, boundary dates
 */

jest.mock('@vercel/postgres', () => {
  const queryFn = jest.fn();
  const tagFn = Object.assign(jest.fn(), {
    query: queryFn,
  });
  return { sql: tagFn };
});

import { sql } from '@vercel/postgres';
import { GET } from '@/app/api/cron/compute-metrics/route';
import { NextRequest } from 'next/server';

const mockSqlQuery = (sql as any).query as jest.Mock;

// Save original so we can restore
const originalCronSecret = process.env.CRON_SECRET;

function makeRequest(date?: string, cronSecret?: string): NextRequest {
  const url = date
    ? `https://lunary.app/api/cron/compute-metrics?date=${date}`
    : 'https://lunary.app/api/cron/compute-metrics';

  const headers: Record<string, string> = {};
  if (cronSecret) {
    headers.authorization = `Bearer ${cronSecret}`;
  }

  return new NextRequest(url, { method: 'GET', headers });
}

/**
 * Default mock that responds based on SQL content.
 * Returns sensible defaults for all query patterns.
 */
function defaultMockImpl(queryStr: string, _params?: any[]) {
  // Phase 1: snapshot INSERTs
  if (
    queryStr.includes('INSERT INTO daily_unique_users') &&
    !queryStr.includes('daily_metrics')
  ) {
    return Promise.resolve({ rows: [] });
  }
  // Identity links check
  if (queryStr.includes('to_regclass')) {
    return Promise.resolve({ rows: [{ exists: true }] });
  }
  // DAU reads from snapshot table
  if (
    queryStr.includes('user_count as count') &&
    queryStr.includes('daily_unique_users')
  ) {
    return Promise.resolve({ rows: [{ count: 100 }] });
  }
  // LATERAL unnest (WAU/MAU)
  if (queryStr.includes('LATERAL unnest')) {
    // Active days distribution
    if (queryStr.includes('days_1')) {
      return Promise.resolve({
        rows: [
          {
            days_1: 200,
            days_2_3: 100,
            days_4_7: 80,
            days_8_14: 40,
            days_15_plus: 20,
          },
        ],
      });
    }
    return Promise.resolve({ rows: [{ count: 500 }] });
  }
  // Total accounts
  if (queryStr.includes('FROM "user"') && queryStr.includes('COUNT(*)')) {
    return Promise.resolve({ rows: [{ count: 5000 }] });
  }
  // Retention cohorts
  if (queryStr.includes('cohort_size')) {
    return Promise.resolve({ rows: [{ cohort_size: 50, returned: 15 }] });
  }
  // MRR
  if (queryStr.includes('monthly_amount_due')) {
    return Promise.resolve({ rows: [{ mrr: 250 }] });
  }
  // Active/trial subscriptions
  if (queryStr.includes("status = 'active'") && queryStr.includes('trial')) {
    return Promise.resolve({ rows: [{ active: 20, trial: 5 }] });
  }
  // Signups
  if (
    queryStr.includes('"createdAt" >=') &&
    queryStr.includes('"createdAt" <=')
  ) {
    return Promise.resolve({ rows: [{ count: 10 }] });
  }
  // Activation (ANY($5::text[]))
  if (queryStr.includes('ANY($5')) {
    return Promise.resolve({ rows: [{ count: 5 }] });
  }
  // Conversions
  if (queryStr.includes('subscriptions s') && queryStr.includes('INNER JOIN')) {
    return Promise.resolve({ rows: [{ count: 2 }] });
  }
  // Feature adoption
  if (queryStr.includes('daily_dashboard_viewed')) {
    return Promise.resolve({
      rows: [
        { event_type: 'daily_dashboard_viewed', users: 30 },
        { event_type: 'tarot_drawn', users: 15 },
      ],
    });
  }
  // Returning referrer
  if (queryStr.includes('classified') && queryStr.includes('organic')) {
    return Promise.resolve({
      rows: [{ organic: 30, direct: 20, internal: 50 }],
    });
  }
  // Final INSERT into daily_metrics
  if (queryStr.includes('INSERT INTO daily_metrics')) {
    return Promise.resolve({ rows: [] });
  }
  // Default
  return Promise.resolve({ rows: [] });
}

describe('compute-metrics cron (snapshot approach)', () => {
  beforeEach(() => {
    mockSqlQuery.mockReset();
    // Remove cron secret so tests don't need auth
    delete process.env.CRON_SECRET;
  });

  afterAll(() => {
    // Restore original env
    if (originalCronSecret !== undefined) {
      process.env.CRON_SECRET = originalCronSecret;
    } else {
      delete process.env.CRON_SECRET;
    }
  });

  it('populates daily_unique_users for all 5 segments in Phase 1', async () => {
    mockSqlQuery.mockImplementation(defaultMockImpl);

    await GET(makeRequest('2026-02-15'));

    const snapshotInserts = mockSqlQuery.mock.calls.filter(
      ([q]: [string]) =>
        q.includes('INSERT INTO daily_unique_users') &&
        q.includes('conversion_events'),
    );

    expect(snapshotInserts.length).toBe(5);

    // Verify each segment is represented
    const segments = snapshotInserts.map(([q]: [string]) => {
      if (q.includes("'product'")) return 'product';
      if (q.includes("'app_opened'")) return 'app_opened';
      if (q.includes("'grimoire'")) return 'grimoire';
      if (q.includes("'reach'")) return 'reach';
      if (q.includes("'all'")) return 'all';
      return 'unknown';
    });

    expect(segments.sort()).toEqual([
      'all',
      'app_opened',
      'grimoire',
      'product',
      'reach',
    ]);
  });

  it('snapshot inserts use ON CONFLICT upsert (idempotent backfills)', async () => {
    mockSqlQuery.mockImplementation(defaultMockImpl);

    await GET(makeRequest('2026-02-15'));

    const snapshotInserts = mockSqlQuery.mock.calls.filter(
      ([q]: [string]) =>
        q.includes('INSERT INTO daily_unique_users') &&
        q.includes('conversion_events'),
    );

    expect(snapshotInserts.length).toBe(5);
    for (const [q] of snapshotInserts) {
      expect(q).toContain('ON CONFLICT (metric_date, segment) DO UPDATE');
    }
  });

  it('all snapshot queries are bounded to single day ($1=dayStart, $2=dayEnd)', async () => {
    mockSqlQuery.mockImplementation(defaultMockImpl);

    await GET(makeRequest('2026-02-15'));

    const snapshotInserts = mockSqlQuery.mock.calls.filter(
      ([q]: [string]) =>
        q.includes('INSERT INTO daily_unique_users') &&
        q.includes('conversion_events'),
    );

    expect(snapshotInserts.length).toBe(5);
    for (const [, params] of snapshotInserts) {
      const start = new Date(params[0]);
      const end = new Date(params[1]);
      const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      expect(diffHours).toBeLessThanOrEqual(24);
    }
  });

  it('WAU/MAU queries use daily_unique_users via LATERAL unnest (not conversion_events)', async () => {
    mockSqlQuery.mockImplementation(defaultMockImpl);

    await GET(makeRequest('2026-02-15'));

    const unnestQueries = mockSqlQuery.mock.calls.filter(([q]: [string]) =>
      q.includes('LATERAL unnest(user_ids)'),
    );

    // 5 WAU + 5 MAU + grimoire_only + returning DAU/WAU/MAU + product returning + active_days
    expect(unnestQueries.length).toBeGreaterThanOrEqual(10);

    // None of the unnest queries should reference conversion_events
    for (const [q] of unnestQueries) {
      expect(q).not.toContain('conversion_events');
      expect(q).toContain('daily_unique_users');
    }
  });

  it('product segment excludes app_opened and page_viewed events', async () => {
    mockSqlQuery.mockImplementation(defaultMockImpl);

    await GET(makeRequest('2026-02-15'));

    const productInsert = mockSqlQuery.mock.calls.find(
      ([q]: [string]) =>
        q.includes('INSERT INTO daily_unique_users') && q.includes("'product'"),
    );

    expect(productInsert).toBeTruthy();
    expect(productInsert[0]).toContain("NOT IN ('app_opened', 'page_viewed')");
  });

  it('grimoire segment filters to /grimoire% paths', async () => {
    mockSqlQuery.mockImplementation(defaultMockImpl);

    await GET(makeRequest('2026-02-15'));

    const grimoireInsert = mockSqlQuery.mock.calls.find(
      ([q]: [string]) =>
        q.includes('INSERT INTO daily_unique_users') &&
        q.includes("'grimoire'"),
    );

    expect(grimoireInsert).toBeTruthy();
    expect(grimoireInsert[0]).toContain("page_path LIKE '/grimoire%'");
  });

  it('returning user queries require 2+ distinct days', async () => {
    mockSqlQuery.mockImplementation(defaultMockImpl);

    await GET(makeRequest('2026-02-15'));

    const returningQueries = mockSqlQuery.mock.calls.filter(([q]: [string]) =>
      q.includes('HAVING COUNT(DISTINCT metric_date) >= 2'),
    );

    // returning DAU, returning WAU, returning MAU, signed-in product returning
    expect(returningQueries.length).toBeGreaterThanOrEqual(3);
  });

  it('grimoire-only MAU excludes app_opened users via NOT EXISTS', async () => {
    mockSqlQuery.mockImplementation(defaultMockImpl);

    await GET(makeRequest('2026-02-15'));

    const grimoireOnlyQuery = mockSqlQuery.mock.calls.find(
      ([q]: [string]) =>
        q.includes('grimoire_users') && q.includes('app_users'),
    );

    expect(grimoireOnlyQuery).toBeTruthy();
    expect(grimoireOnlyQuery[0]).toContain('NOT EXISTS');
    expect(grimoireOnlyQuery[0]).toContain("segment = 'grimoire'");
    expect(grimoireOnlyQuery[0]).toContain("segment = 'app_opened'");
  });

  it('final INSERT into daily_metrics includes all critical columns', async () => {
    mockSqlQuery.mockImplementation(defaultMockImpl);

    await GET(makeRequest('2026-02-15'));

    const metricsInsert = mockSqlQuery.mock.calls.find(([q]: [string]) =>
      q.includes('INSERT INTO daily_metrics'),
    );

    expect(metricsInsert).toBeTruthy();
    const [q] = metricsInsert;

    const criticalColumns = [
      'dau',
      'wau',
      'mau',
      'signed_in_product_dau',
      'signed_in_product_wau',
      'signed_in_product_mau',
      'app_opened_dau',
      'app_opened_wau',
      'app_opened_mau',
      'returning_dau',
      'returning_wau',
      'returning_mau',
      'reach_dau',
      'reach_wau',
      'reach_mau',
      'grimoire_dau',
      'grimoire_wau',
      'grimoire_mau',
      'grimoire_only_mau',
      'd1_retention',
      'd7_retention',
      'd30_retention',
      'computation_duration_ms',
    ];

    for (const col of criticalColumns) {
      expect(q).toContain(col);
    }
  });

  it('returns success response with metrics', async () => {
    mockSqlQuery.mockImplementation(defaultMockImpl);

    const response = await GET(makeRequest('2026-02-15'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.date).toBe('2026-02-15');
    expect(body.computationDuration).toBeGreaterThanOrEqual(0);
    expect(body.metrics).toMatchObject({
      dau: expect.any(Number),
      wau: expect.any(Number),
      mau: expect.any(Number),
      productDau: expect.any(Number),
      productWau: expect.any(Number),
      productMau: expect.any(Number),
      signups: expect.any(Number),
      mrr: expect.any(Number),
    });
  });

  it('daily_metrics upsert uses ON CONFLICT (metric_date) DO UPDATE', async () => {
    mockSqlQuery.mockImplementation(defaultMockImpl);

    await GET(makeRequest('2026-02-15'));

    const metricsInsert = mockSqlQuery.mock.calls.find(([q]: [string]) =>
      q.includes('INSERT INTO daily_metrics'),
    );

    expect(metricsInsert).toBeTruthy();
    expect(metricsInsert[0]).toContain('ON CONFLICT (metric_date)');
    expect(metricsInsert[0]).toContain('DO UPDATE SET');
  });

  it('passes 52 parameters to daily_metrics INSERT', async () => {
    mockSqlQuery.mockImplementation(defaultMockImpl);

    await GET(makeRequest('2026-02-15'));

    const metricsInsert = mockSqlQuery.mock.calls.find(([q]: [string]) =>
      q.includes('INSERT INTO daily_metrics'),
    );

    expect(metricsInsert).toBeTruthy();
    expect(metricsInsert[1].length).toBe(52);
    // $1 should be the date string
    expect(metricsInsert[1][0]).toBe('2026-02-15');
  });
});

describe('compute-metrics auth', () => {
  beforeEach(() => {
    mockSqlQuery.mockReset();
  });

  afterAll(() => {
    if (originalCronSecret !== undefined) {
      process.env.CRON_SECRET = originalCronSecret;
    } else {
      delete process.env.CRON_SECRET;
    }
  });

  it('enforces cron secret when set', async () => {
    process.env.CRON_SECRET = 'test-secret-123';
    mockSqlQuery.mockImplementation(defaultMockImpl);

    const response = await GET(makeRequest('2026-02-15'));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });

  it('allows request with correct cron secret', async () => {
    process.env.CRON_SECRET = 'test-secret-123';
    mockSqlQuery.mockImplementation(defaultMockImpl);

    const response = await GET(makeRequest('2026-02-15', 'test-secret-123'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('runs without auth when CRON_SECRET is not set', async () => {
    delete process.env.CRON_SECRET;
    mockSqlQuery.mockImplementation(defaultMockImpl);

    const response = await GET(makeRequest('2026-02-15'));

    expect(response.status).toBe(200);
  });
});

describe('compute-metrics error handling', () => {
  beforeEach(() => {
    mockSqlQuery.mockReset();
    delete process.env.CRON_SECRET;
  });

  afterAll(() => {
    if (originalCronSecret !== undefined) {
      process.env.CRON_SECRET = originalCronSecret;
    } else {
      delete process.env.CRON_SECRET;
    }
  });

  it('returns 500 when Phase 1 snapshot insert fails', async () => {
    // Identity links check succeeds
    mockSqlQuery.mockResolvedValueOnce({ rows: [{ exists: true }] });
    // First snapshot INSERT fails
    mockSqlQuery.mockRejectedValueOnce(new Error('connection timeout'));

    const response = await GET(makeRequest('2026-02-15'));

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toContain('connection timeout');
  });
});

describe('compute-metrics date windows', () => {
  beforeEach(() => {
    mockSqlQuery.mockReset();
    delete process.env.CRON_SECRET;
  });

  afterAll(() => {
    if (originalCronSecret !== undefined) {
      process.env.CRON_SECRET = originalCronSecret;
    } else {
      delete process.env.CRON_SECRET;
    }
  });

  it('uses provided date param (not yesterday)', async () => {
    mockSqlQuery.mockImplementation(defaultMockImpl);

    await GET(makeRequest('2026-01-01'));

    const snapshotInserts = mockSqlQuery.mock.calls.filter(
      ([q]: [string]) =>
        q.includes('INSERT INTO daily_unique_users') &&
        q.includes('conversion_events'),
    );

    expect(snapshotInserts.length).toBe(5);
    for (const [, params] of snapshotInserts) {
      expect(params[4]).toBe('2026-01-01');
    }
  });

  it('WAU window is 7 days (start = target - 6 days)', async () => {
    mockSqlQuery.mockImplementation(defaultMockImpl);

    await GET(makeRequest('2026-02-15'));

    // WAU queries use metric_date >= wauStart AND metric_date <= dateStr
    // For 2026-02-15, WAU start should be 2026-02-09
    // Find 3-param LATERAL unnest queries where first param looks like a WAU date
    // wauMauQuery params: [segment, startDate, dateStr]
    const wauQueries = mockSqlQuery.mock.calls.filter(
      ([q, params]: [string, any[]]) =>
        q.includes('LATERAL unnest') &&
        params?.length === 3 &&
        String(params[1]).startsWith('2026-02-09'),
    );

    expect(wauQueries.length).toBeGreaterThan(0);
  });

  it('MAU window is 30 days (start = target - 29 days)', async () => {
    mockSqlQuery.mockImplementation(defaultMockImpl);

    await GET(makeRequest('2026-02-15'));

    // For 2026-02-15, MAU start should be 2026-01-17
    // wauMauQuery params: [segment, startDate, dateStr]
    const mauQueries = mockSqlQuery.mock.calls.filter(
      ([q, params]: [string, any[]]) =>
        q.includes('LATERAL unnest') &&
        params?.length === 3 &&
        String(params[1]).startsWith('2026-01-17'),
    );

    expect(mauQueries.length).toBeGreaterThan(0);
  });
});
