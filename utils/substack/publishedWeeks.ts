import { sql } from '@vercel/postgres';

const TABLE_NAME = 'substack_published_weeks';

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS substack_published_weeks (
      week_start TIMESTAMPTZ NOT NULL,
      tier TEXT NOT NULL,
      post_url TEXT,
      published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (week_start, tier)
    )
  `;
}

function normalizeWeekStart(date: Date): string {
  const normalized = new Date(date);
  normalized.setUTCHours(0, 0, 0, 0);
  return normalized.toISOString();
}

export async function getPublishedTiers(
  weekStart: Date,
): Promise<Array<'free' | 'paid'>> {
  await ensureTable();
  const weekStartIso = normalizeWeekStart(weekStart);
  const result = await sql`
    SELECT tier FROM substack_published_weeks
    WHERE week_start = ${weekStartIso}
  `;
  return result.rows.map((row: { tier: 'free' | 'paid' }) => row.tier);
}

export async function recordPublishedWeek(
  weekStart: Date,
  tier: 'free' | 'paid',
  postUrl?: string,
): Promise<void> {
  await ensureTable();
  const weekStartIso = normalizeWeekStart(weekStart);
  await sql`
    INSERT INTO substack_published_weeks (week_start, tier, post_url, published_at)
    VALUES (${weekStartIso}, ${tier}, ${postUrl || ''}, NOW())
    ON CONFLICT (week_start, tier)
    DO UPDATE SET
      post_url = COALESCE(EXCLUDED.post_url, substack_published_weeks.post_url),
      published_at = NOW()
  `;
}

export { normalizeWeekStart };
