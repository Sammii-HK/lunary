/**
 * @jest-environment node
 *
 * UNATTENDED LIFECYCLE CRON RELIABILITY — campaign-manager helpers.
 *
 * These helpers feed the re-engagement, weekly-reading and transit-reengagement
 * crons, which all run daily while the founder is AFK. The most dangerous class
 * of bug here is a SILENT one: a SQL SELECT that aliases a column one way while
 * the row->object mapper reads a DIFFERENT field name. The mapped field comes
 * back `undefined`, the cron tries `user.email.split('@')` downstream, and every
 * row throws — with nothing surfaced except a swallowed per-row log line.
 *
 * One such bug was already found in production (the missed_streak email). This
 * suite pins the row->object mapping of EVERY exported getUsers* helper against
 * the exact column names its own SQL produces, the dedup guard, and the
 * dormant-user windowing flags — and captures the live mapping bugs as
 * it.skip + a companion test that pins the current (broken) behaviour so the
 * skipped test flips green the moment the field name is corrected.
 *
 * Pure unit tests. @vercel/postgres is mocked; no network, no real DB.
 * NO app code is modified — these tests assert against current main behaviour.
 */

// Mock @vercel/postgres so `sql` works both as a tagged template (sql`...`)
// and as sql.query(text, params) — same dual shape the real client exposes.
jest.mock('@vercel/postgres', () => {
  const queryFn = jest.fn().mockResolvedValue({ rows: [] });
  const tagFn = Object.assign(jest.fn().mockResolvedValue({ rows: [] }), {
    query: queryFn,
  });
  return { sql: tagFn };
});

import {
  getUsersWithMissedStreaks,
  getMilestoneUsers,
  getDormantFreeUsers,
  hasReceivedCampaign,
  recordCampaignSent,
} from '@/lib/re-engagement/campaign-manager';
import { sql } from '@vercel/postgres';

// The tagged-template form is the default callable; sql.query is the .query prop.
const mockSqlTag = sql as unknown as jest.Mock;
const mockSqlQuery = (sql as unknown as { query: jest.Mock }).query;

/**
 * Make the next tagged-template `sql\`...\`` call resolve to a given row set.
 * Every getUsers* / dedup helper here uses the tagged-template form.
 */
function nextTagRows(rows: Array<Record<string, unknown>>) {
  mockSqlTag.mockResolvedValueOnce({ rows });
}

beforeEach(() => {
  mockSqlTag.mockReset();
  mockSqlQuery.mockReset();
  // Safe defaults so an unstubbed call never throws.
  mockSqlTag.mockResolvedValue({ rows: [] });
  mockSqlQuery.mockResolvedValue({ rows: [] });
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ───────────────────────────────────────────────────────────────────────────
// getUsersWithMissedStreaks — SQL: `SELECT us.user_id, sub.user_email as email,
//                                    us.current_streak ...`
// The query ALIASES the email column to `email`, so the row Postgres returns
// has key `email`. The mapper, however, reads `row.user_email` (the original
// column name, which is NOT in the result set). It is always undefined.
// ───────────────────────────────────────────────────────────────────────────
describe('getUsersWithMissedStreaks — row->object mapping (AFK streak email)', () => {
  // Row shaped EXACTLY like the SQL output: aliased to `email`, plus the raw
  // `current_streak` column. There is NO `user_email` key — the alias renamed it.
  const realRow = {
    user_id: 'user_streak_1',
    email: 'streaker@example.com',
    current_streak: 9,
  };

  it('returns one entry per qualifying row and carries the user_id + streak', async () => {
    nextTagRows([realRow]);

    const users = await getUsersWithMissedStreaks();

    expect(users).toHaveLength(1);
    expect(users[0].userId).toBe('user_streak_1');
    expect(users[0].streak).toBe(9);
  });

  /**
   * !!! BUG: getUsersWithMissedStreaks maps the WRONG field. !!!
   *
   * campaign-manager.ts:
   *   SELECT us.user_id, sub.user_email as email, us.current_streak ...
   *   return result.rows.map((row) => ({
   *     userId: row.user_id,
   *     email: row.user_email,   // <-- WRONG: column was aliased to `email`,
   *                              //     so row.user_email is undefined
   *     streak: row.current_streak,
   *   }));
   *
   * IMPACT (unattended, daily): the re-engagement cron's missed_streak block
   * does `user.email.split('@')[0]` and `sendEmail({ to: user.email })`. With
   * email === undefined, `.split` throws TypeError on EVERY row, so the entire
   * missed_streak campaign sends ZERO emails, silently, every single day. This
   * is the known production bug. It is NOT fixed by held PR #277 (that PR does
   * not touch campaign-manager.ts).
   *
   * FIX (one word): map `email: row.email` (matching the SQL alias).
   * Un-skip this test once the field name is corrected.
   */
  it.skip('BUG: should map the aliased `email` column onto user.email', async () => {
    nextTagRows([realRow]);

    const users = await getUsersWithMissedStreaks();

    expect(users[0].email).toBe('streaker@example.com');
  });

  it('PINS CURRENT BROKEN BEHAVIOUR: email comes back undefined (would throw downstream)', async () => {
    nextTagRows([realRow]);

    const users = await getUsersWithMissedStreaks();

    // The mapper read row.user_email, which the alias renamed away.
    expect(users[0].email).toBeUndefined();
    // Proof of the unattended crash: the cron does user.email.split('@').
    expect(() => (users[0].email as string).split('@')).toThrow(TypeError);
  });

  it('returns an empty array (never throws) when the DB call rejects', async () => {
    mockSqlTag.mockRejectedValueOnce(new Error('connection reset'));

    await expect(getUsersWithMissedStreaks()).resolves.toEqual([]);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// getMilestoneUsers — SQL: `SELECT sub.user_id, sub.user_email as email,
//                            sub.created_at ...`
// Same alias->mapper mismatch as the streak helper. This is a SECOND, distinct
// instance of the identical bug class, feeding the milestone email block.
// ───────────────────────────────────────────────────────────────────────────
describe('getMilestoneUsers — row->object mapping (AFK 30-day milestone email)', () => {
  const realRow = {
    user_id: 'user_milestone_1',
    email: 'cosmic@example.com',
    created_at: '2026-04-29T10:00:00.000Z',
  };

  it('returns one entry per qualifying row with the user_id and a milestone copy line', async () => {
    nextTagRows([realRow]);

    const users = await getMilestoneUsers();

    expect(users).toHaveLength(1);
    expect(users[0].userId).toBe('user_milestone_1');
    expect(typeof users[0].milestone).toBe('string');
    expect(users[0].milestone.length).toBeGreaterThan(0);
  });

  /**
   * !!! BUG: getMilestoneUsers maps the WRONG field (twin of the streak bug). !!!
   *
   * campaign-manager.ts:
   *   SELECT sub.user_id, sub.user_email as email, sub.created_at ...
   *   return result.rows.map((row) => ({
   *     userId: row.user_id,
   *     email: row.user_email,   // <-- WRONG: aliased to `email`; undefined here
   *     milestone: "...",
   *   }));
   *
   * IMPACT (unattended, daily): the re-engagement cron's milestone block does
   * `user.email.split('@')[0]` and `sendEmail({ to: user.email })`. With email
   * undefined this throws on EVERY milestone row — the 30-day milestone email
   * never reaches anyone. Same silent-failure pattern, separate code path.
   *
   * FIX: map `email: row.email`. Un-skip once corrected.
   */
  it.skip('BUG: should map the aliased `email` column onto user.email', async () => {
    nextTagRows([realRow]);

    const users = await getMilestoneUsers();

    expect(users[0].email).toBe('cosmic@example.com');
  });

  it('PINS CURRENT BROKEN BEHAVIOUR: email comes back undefined (would throw downstream)', async () => {
    nextTagRows([realRow]);

    const users = await getMilestoneUsers();

    expect(users[0].email).toBeUndefined();
    expect(() => (users[0].email as string).split('@')).toThrow(TypeError);
  });

  it('returns an empty array (never throws) when the DB call rejects', async () => {
    mockSqlTag.mockRejectedValueOnce(new Error('statement timeout'));

    await expect(getMilestoneUsers()).resolves.toEqual([]);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// getDormantFreeUsers — the CORRECT reference implementation.
// SQL: `SELECT DISTINCT s.user_id, s.user_email AS email, s.user_name AS name,
//        up.birth_chart ...` and the mapper reads row.email / row.name. This is
// how the streak/milestone mappers SHOULD look. Pin it as a regression guard so
// nobody "harmonises" it toward the broken pattern.
// ───────────────────────────────────────────────────────────────────────────
describe('getDormantFreeUsers — correct alias->field mapping (regression guard)', () => {
  const realRow = {
    user_id: 'free_user_1',
    email: 'dormant@example.com',
    name: 'Dormant Dan',
    birth_chart: [{ body: 'Sun', sign: 'Pisces' }],
  };

  it('maps every aliased column onto the right object field', async () => {
    nextTagRows([realRow]);

    const users = await getDormantFreeUsers(7, 14, 50);

    expect(users).toHaveLength(1);
    expect(users[0]).toEqual({
      userId: 'free_user_1',
      // email IS populated here because the mapper reads the same alias the
      // SQL produced. Contrast with the two helpers above.
      email: 'dormant@example.com',
      name: 'Dormant Dan',
      birthChart: [{ body: 'Sun', sign: 'Pisces' }],
    });
  });

  it('coerces a missing name to null rather than leaving it undefined', async () => {
    nextTagRows([{ user_id: 'free_user_2', email: 'x@y.com', birth_chart: null }]);

    const users = await getDormantFreeUsers(7);

    expect(users[0].name).toBeNull();
  });

  it('returns an empty array (never throws) when the DB call rejects', async () => {
    mockSqlTag.mockRejectedValueOnce(new Error('pool exhausted'));

    await expect(getDormantFreeUsers(7)).resolves.toEqual([]);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// hasReceivedCampaign — the dedup guard. If this is wrong, an AFK cron either
// re-spams a user every day (false negative) or never sends at all (false
// positive). Pin both directions plus the fail-open-to-send error path.
// ───────────────────────────────────────────────────────────────────────────
describe('hasReceivedCampaign — dedup guard within the send window', () => {
  it('reports already-sent when a matching campaign row exists inside the window', async () => {
    nextTagRows([{ count: '1' }]);

    await expect(
      hasReceivedCampaign('user_1', 'missed_streak', 3),
    ).resolves.toBe(true);
  });

  it('reports not-yet-sent when no campaign row exists inside the window', async () => {
    nextTagRows([{ count: '0' }]);

    await expect(
      hasReceivedCampaign('user_1', 'missed_streak', 3),
    ).resolves.toBe(false);
  });

  it('treats a multi-count (>1) as already-sent (still deduped)', async () => {
    nextTagRows([{ count: '3' }]);

    await expect(
      hasReceivedCampaign('user_1', '7days_inactive', 30),
    ).resolves.toBe(true);
  });

  it('treats a missing/empty count row as not-yet-sent (defaults to 0)', async () => {
    nextTagRows([]);

    await expect(
      hasReceivedCampaign('user_1', 'milestone', 7),
    ).resolves.toBe(false);
  });

  it('fails OPEN (returns false = "send it") if the dedup query errors', async () => {
    // Design choice in the helper: on error, return false. This favours
    // delivering a possible duplicate over silently suppressing the campaign.
    // Pinning it makes that trade-off explicit and change-detectable.
    mockSqlTag.mockRejectedValueOnce(new Error('db down'));

    await expect(
      hasReceivedCampaign('user_1', 'missed_streak', 3),
    ).resolves.toBe(false);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// recordCampaignSent — the write side of the dedup loop. Must never throw
// (a logging failure should not crash the whole cron mid-batch).
// ───────────────────────────────────────────────────────────────────────────
describe('recordCampaignSent — never throws on the dedup write', () => {
  it('resolves normally on a successful insert', async () => {
    nextTagRows([]);

    await expect(
      recordCampaignSent('user_1', 'missed_streak', { streak: 5 }),
    ).resolves.toBeUndefined();
  });

  it('swallows a write error so one bad insert cannot abort the batch', async () => {
    mockSqlTag.mockRejectedValueOnce(new Error('insert failed'));

    await expect(
      recordCampaignSent('user_1', 'milestone'),
    ).resolves.toBeUndefined();
  });
});
