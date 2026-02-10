/**
 * @jest-environment node
 */

/**
 * Tests for Journal Backfill Moods API Route (POST handler)
 * Verifies batch UPDATE behavior: with N entries, a single batch UPDATE
 * is issued instead of N individual UPDATE queries.
 */

import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Mocks - must be declared before the module under test is imported
// ---------------------------------------------------------------------------

jest.mock('@vercel/postgres', () => ({
  sql: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

jest.mock('@/lib/journal/mood-detector', () => ({
  detectMoods: jest.fn(),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { POST } from '@/app/api/journal/backfill-moods/route';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { detectMoods } from '@/lib/journal/mood-detector';

const sqlMock = sql as unknown as jest.Mock;
const getSessionMock = auth.api.getSession as unknown as jest.Mock;
const detectMoodsMock = detectMoods as jest.Mock;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(body: Record<string, unknown> = {}) {
  return new NextRequest('https://lunary.app/api/journal/backfill-moods', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

async function parseJson(response: any) {
  if (typeof response._body === 'string' && response._body !== '') {
    return JSON.parse(response._body);
  }
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Generate fake journal rows with text long enough to pass the 20-char filter
 * and no existing moodTags (so they won't be skipped).
 */
function makeFakeRows(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `entry-${i}`,
    content: {
      text: `This is a journal entry about feeling grateful and hopeful about the future, entry number ${i}`,
      moodTags: [],
    },
    created_at: new Date().toISOString(),
  }));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Backfill Moods API - Batch UPDATE', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default: authenticated user
    getSessionMock.mockResolvedValue({
      user: { id: 'user-123' },
    });

    // Default: detectMoods returns some moods for every call
    detectMoodsMock.mockResolvedValue({
      moods: ['grateful', 'hopeful'],
      confidence: 0.8,
      method: 'keyword' as const,
    });
  });

  it('uses a batch UPDATE instead of N individual UPDATEs for 10 entries', async () => {
    const fakeRows = makeFakeRows(10);

    // First sql call: SELECT query returning 10 journal entries
    // Subsequent sql calls: batch UPDATE queries
    sqlMock
      .mockResolvedValueOnce({ rows: fakeRows }) // SELECT
      .mockResolvedValue({ rowCount: 0 }); // UPDATE(s)

    const response = await POST(
      makeRequest({ daysBack: 90, method: 'keyword', dryRun: false }),
    );

    expect(response.status).toBe(200);

    // sql should be called exactly 2 times:
    //   1. The initial SELECT query
    //   2. One batch UPDATE (10 entries < BATCH_SIZE of 50, so just 1 batch)
    // NOT 11 times (1 SELECT + 10 individual UPDATEs)
    expect(sqlMock).toHaveBeenCalledTimes(2);

    // Verify the second call is the batch UPDATE with unnest
    const batchUpdateCall = sqlMock.mock.calls[1];
    const templateStrings = batchUpdateCall[0];
    const queryText = templateStrings.join('');

    expect(queryText).toContain('UPDATE collections');
    expect(queryText).toContain('unnest');

    // Verify it received arrays of 10 ids and 10 contents
    const batchIds = batchUpdateCall[1];
    const batchContents = batchUpdateCall[2];
    expect(batchIds).toHaveLength(10);
    expect(batchContents).toHaveLength(10);

    // Each id should match our fake rows
    for (let i = 0; i < 10; i++) {
      expect(batchIds[i]).toBe(`entry-${i}`);
    }

    // Each content should be a valid JSON string containing moodTags
    for (const contentStr of batchContents) {
      const parsed = JSON.parse(contentStr);
      expect(parsed.moodTags).toEqual(
        expect.arrayContaining(['grateful', 'hopeful']),
      );
    }
  });

  it('returns the expected response shape', async () => {
    const fakeRows = makeFakeRows(10);

    sqlMock
      .mockResolvedValueOnce({ rows: fakeRows })
      .mockResolvedValue({ rowCount: 0 });

    const response = await POST(
      makeRequest({ daysBack: 90, method: 'keyword', dryRun: false }),
    );

    expect(response.status).toBe(200);
    const body = await parseJson(response);

    // Verify top-level response shape
    expect(body).toEqual(
      expect.objectContaining({
        success: true,
        dryRun: false,
        stats: expect.objectContaining({
          totalEntries: 10,
          processed: 10,
          updated: 10,
          skipped: 0,
        }),
        updates: expect.any(Array),
        message: expect.stringContaining('Successfully updated 10'),
      }),
    );

    // Verify each update entry shape
    for (const update of body.updates) {
      expect(update).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(/^entry-\d+$/),
          date: expect.any(String),
          oldMoods: [],
          newMoods: ['grateful', 'hopeful'],
          text: expect.any(String),
        }),
      );
    }
  });

  it('does not issue any UPDATE queries in dryRun mode', async () => {
    const fakeRows = makeFakeRows(5);

    sqlMock.mockResolvedValueOnce({ rows: fakeRows });

    const response = await POST(
      makeRequest({ daysBack: 90, method: 'keyword', dryRun: true }),
    );

    expect(response.status).toBe(200);
    const body = await parseJson(response);

    // Only 1 sql call: the SELECT. No UPDATE calls.
    expect(sqlMock).toHaveBeenCalledTimes(1);

    expect(body.dryRun).toBe(true);
    expect(body.stats.updated).toBe(0);
    expect(body.updates).toHaveLength(5);
  });

  it('chunks large batches into groups of 50', async () => {
    const fakeRows = makeFakeRows(120);

    sqlMock
      .mockResolvedValueOnce({ rows: fakeRows }) // SELECT
      .mockResolvedValue({ rowCount: 0 }); // UPDATEs

    const response = await POST(
      makeRequest({ daysBack: 90, method: 'keyword', dryRun: false }),
    );

    expect(response.status).toBe(200);

    // 120 entries / 50 batch size = 3 batch UPDATE calls + 1 SELECT = 4 total
    expect(sqlMock).toHaveBeenCalledTimes(4);

    // Verify batch sizes: 50, 50, 20
    const batch1Ids = sqlMock.mock.calls[1][1];
    const batch2Ids = sqlMock.mock.calls[2][1];
    const batch3Ids = sqlMock.mock.calls[3][1];

    expect(batch1Ids).toHaveLength(50);
    expect(batch2Ids).toHaveLength(50);
    expect(batch3Ids).toHaveLength(20);
  });
});
