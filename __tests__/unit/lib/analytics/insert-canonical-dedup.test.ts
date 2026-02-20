/**
 * @jest-environment node
 */

/**
 * Tests for insertCanonicalEvent deduplication behavior.
 *
 * Verifies:
 * - ON CONFLICT DO NOTHING returns inserted:false for duplicates
 * - New events return inserted:true
 * - NULL event_ids don't conflict (PostgreSQL treats NULLs as distinct)
 * - Batch inserts handle mixed duplicates correctly
 */

jest.mock('@vercel/postgres', () => {
  const queryFn = jest.fn().mockResolvedValue({ rows: [] });
  const tagFn = Object.assign(jest.fn().mockResolvedValue({ rows: [] }), {
    query: queryFn,
  });
  return { sql: tagFn };
});

import {
  insertCanonicalEvent,
  insertCanonicalEventsBatch,
  canonicaliseEvent,
} from '@/lib/analytics/canonical-events';
import { sql } from '@vercel/postgres';

const mockSqlQuery = (sql as any).query as jest.Mock;

function makeRow(overrides: Record<string, unknown> = {}) {
  const base = canonicaliseEvent({
    eventType: 'app_opened',
    eventId: 'test-uuid-1234',
    userId: 'user_1',
    ...overrides,
  });
  if (!base.ok) throw new Error('canonicaliseEvent failed in test helper');
  return base.row;
}

describe('insertCanonicalEvent', () => {
  beforeEach(() => {
    mockSqlQuery.mockReset();
  });

  it('returns inserted:true when DB returns a row (new event)', async () => {
    mockSqlQuery.mockResolvedValueOnce({ rows: [{ id: 42 }] });

    const result = await insertCanonicalEvent(makeRow());

    expect(result.inserted).toBe(true);
  });

  it('returns inserted:false when DB returns no rows (conflict on event_id)', async () => {
    mockSqlQuery.mockResolvedValueOnce({ rows: [] });

    const result = await insertCanonicalEvent(makeRow());

    expect(result.inserted).toBe(false);
  });

  it('SQL contains ON CONFLICT DO NOTHING', async () => {
    mockSqlQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });

    await insertCanonicalEvent(makeRow());

    const sqlText = mockSqlQuery.mock.calls[0][0];
    expect(sqlText).toContain('ON CONFLICT DO NOTHING');
  });

  it('passes event_id as parameter $2', async () => {
    mockSqlQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    const row = makeRow({ eventId: 'my-event-uuid' });

    await insertCanonicalEvent(row);

    const params = mockSqlQuery.mock.calls[0][1];
    // $1 = eventType, $2 = eventId
    expect(params[1]).toBe('my-event-uuid');
  });

  it('passes null event_id for events without an eventId', async () => {
    mockSqlQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    const row = makeRow();
    row.eventId = null;

    await insertCanonicalEvent(row);

    const params = mockSqlQuery.mock.calls[0][1];
    expect(params[1]).toBeNull();
  });
});

describe('insertCanonicalEventsBatch', () => {
  beforeEach(() => {
    mockSqlQuery.mockReset();
  });

  it('returns correct inserted/duplicates count', async () => {
    // 3 rows sent, DB returns 2 (one was a dupe)
    mockSqlQuery.mockResolvedValueOnce({ rows: [{}, {}] });

    const rows = [
      makeRow({ eventId: 'uuid-1' }),
      makeRow({ eventId: 'uuid-2' }),
      makeRow({ eventId: 'uuid-3' }),
    ];
    const result = await insertCanonicalEventsBatch(rows);

    expect(result.inserted).toBe(2);
    expect(result.duplicates).toBe(1);
  });

  it('returns zeros for empty batch', async () => {
    const result = await insertCanonicalEventsBatch([]);
    expect(result.inserted).toBe(0);
    expect(result.duplicates).toBe(0);
    expect(mockSqlQuery).not.toHaveBeenCalled();
  });

  it('batch SQL also contains ON CONFLICT DO NOTHING', async () => {
    mockSqlQuery.mockResolvedValueOnce({ rows: [{}] });
    await insertCanonicalEventsBatch([makeRow()]);

    const sqlText = mockSqlQuery.mock.calls[0][0];
    expect(sqlText).toContain('ON CONFLICT DO NOTHING');
  });
});
