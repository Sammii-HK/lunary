/**
 * @jest-environment node
 */

/**
 * Tests for PUT /api/profile/birth-chart route handler
 *
 * Verifies:
 * - Auth gating (401 for unauthenticated)
 * - Input validation (400 for non-array birthChart)
 * - Success response shape ({ success: true })
 * - All 8 derived-data tables are targeted for deletion
 * - Deletions run in parallel via Promise.allSettled (not sequentially)
 */

import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Mocks — factories run before any other code due to jest.mock hoisting.
// We create the mock fns inside the factories, then access them via require.
// ---------------------------------------------------------------------------

jest.mock('@vercel/postgres', () => {
  const queryFn = jest.fn().mockResolvedValue({ rows: [] });
  const tagFn = Object.assign(jest.fn().mockResolvedValue({ rows: [] }), {
    query: queryFn,
  });
  return { sql: tagFn };
});

jest.mock('@/lib/get-user-session', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('@/lib/cosmic-snapshot/cache', () => ({
  invalidateSnapshot: jest.fn(),
}));

jest.mock('@/lib/progress/server', () => ({
  setExplorerProgress: jest.fn().mockResolvedValue(undefined),
}));

import { PUT } from '@/app/api/profile/birth-chart/route';
import { getCurrentUser } from '@/lib/get-user-session';
import { invalidateSnapshot } from '@/lib/cosmic-snapshot/cache';
import { sql } from '@vercel/postgres';

// Access mock references through the imported (mocked) module
const mockSqlTag = sql as unknown as jest.Mock;
const mockSqlQuery = (sql as any).query as jest.Mock;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('https://lunary.app/api/profile/birth-chart', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const EXPECTED_TABLES = [
  'synastry_reports',
  'daily_horoscopes',
  'monthly_insights',
  'cosmic_snapshots',
  'cosmic_reports',
  'journal_patterns',
  'pattern_analysis',
  'year_analysis',
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PUT /api/profile/birth-chart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSqlTag.mockResolvedValue({ rows: [] });
    mockSqlQuery.mockResolvedValue({ rows: [] });
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    });
  });

  // -------------------------------------------------------------------------
  // Auth
  // -------------------------------------------------------------------------

  it('returns 401 for unauthenticated requests', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(null);

    const response = await PUT(
      makeRequest({ birthChart: [{ body: 'Sun', sign: 'Aries' }] }),
    );
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------

  it('returns 400 for invalid data (non-array birthChart)', async () => {
    const response = await PUT(makeRequest({ birthChart: 'not-an-array' }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid birth chart data' });
  });

  it('returns 400 when birthChart is missing', async () => {
    const response = await PUT(makeRequest({}));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid birth chart data' });
  });

  // -------------------------------------------------------------------------
  // Success
  // -------------------------------------------------------------------------

  it('returns { success: true } with valid birth chart array', async () => {
    const response = await PUT(
      makeRequest({ birthChart: [{ body: 'Sun', sign: 'Aries' }] }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
  });

  // -------------------------------------------------------------------------
  // Table invalidation completeness
  // -------------------------------------------------------------------------

  it('targets all 8 derived-data tables for deletion', async () => {
    await PUT(makeRequest({ birthChart: [{ body: 'Sun', sign: 'Aries' }] }));

    const deletedTables = mockSqlQuery.mock.calls
      .map((call: [string, string[]]) => {
        const match = call[0].match(/DELETE FROM (\w+)/);
        return match ? match[1] : null;
      })
      .filter(Boolean);

    expect(deletedTables).toHaveLength(8);
    for (const table of EXPECTED_TABLES) {
      expect(deletedTables).toContain(table);
    }
  });

  it.each(EXPECTED_TABLES)(
    'calls sql.query with DELETE for %s',
    async (table) => {
      await PUT(
        makeRequest({ birthChart: [{ body: 'Moon', sign: 'Cancer' }] }),
      );

      const matchingCalls = mockSqlQuery.mock.calls.filter(
        (call: [string, string[]]) => call[0].includes(`DELETE FROM ${table}`),
      );
      expect(matchingCalls.length).toBeGreaterThanOrEqual(1);
    },
  );

  it('passes the user id to each DELETE query', async () => {
    await PUT(makeRequest({ birthChart: [{ body: 'Sun', sign: 'Aries' }] }));

    for (const call of mockSqlQuery.mock.calls) {
      const [query, params] = call as [string, string[]];
      if (query.includes('DELETE FROM')) {
        expect(params).toEqual(['user-123']);
      }
    }
  });

  // -------------------------------------------------------------------------
  // Parallel execution
  // -------------------------------------------------------------------------

  it('runs table deletions in parallel (not sequentially)', async () => {
    const callTimestamps: number[] = [];

    mockSqlQuery.mockImplementation(
      () =>
        new Promise<{ rows: never[] }>((resolve) => {
          callTimestamps.push(Date.now());
          // Stagger resolution to simulate real DB latency
          setTimeout(() => resolve({ rows: [] }), 50);
        }),
    );

    await PUT(makeRequest({ birthChart: [{ body: 'Sun', sign: 'Aries' }] }));

    // All 8 deletions should have been initiated
    expect(callTimestamps).toHaveLength(8);
    expect(mockSqlQuery).toHaveBeenCalledTimes(8);

    // With parallel execution, all calls are initiated within a very short
    // window (< 20ms). With sequential execution and 50ms delays, they would
    // be spread over ~400ms.
    const spread =
      callTimestamps[callTimestamps.length - 1] - callTimestamps[0];
    expect(spread).toBeLessThan(20);
  });

  it('uses Promise.allSettled so individual table failures do not break the flow', async () => {
    mockSqlQuery.mockImplementation((query: string) => {
      if (query.includes('cosmic_reports')) {
        return Promise.reject(new Error('Table does not exist'));
      }
      return Promise.resolve({ rows: [] });
    });

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const response = await PUT(
      makeRequest({ birthChart: [{ body: 'Sun', sign: 'Aries' }] }),
    );
    const data = await response.json();

    // Should still succeed despite one table failing
    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });

    // Should have warned about the failed table
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('cosmic_reports'),
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  // -------------------------------------------------------------------------
  // Snapshot cache invalidation
  // -------------------------------------------------------------------------

  it('calls invalidateSnapshot with the user id', async () => {
    await PUT(makeRequest({ birthChart: [{ body: 'Sun', sign: 'Aries' }] }));

    expect(invalidateSnapshot).toHaveBeenCalledWith('user-123');
  });
});
