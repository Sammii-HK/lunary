import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getOpenAI, LLM_MODEL } from '@/lib/openai-client';
import { scheduleTextPost } from '@/lib/bip-spellcast';
import { getSearchConsoleData } from '@/lib/google/search-console';

/**
 * Build in Public — Daily stat post
 * Fires daily at 07:00 UTC. Schedules a text post to Spellcast sammii account
 * set with today's metrics in the "Day N of building Lunary" format.
 *
 * State is persisted in the bip_state table (created on first run).
 */

// ---------------------------------------------------------------------------
// bip_state helpers (CREATE TABLE IF NOT EXISTS on first run)
// ---------------------------------------------------------------------------

async function ensureBipStateTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS bip_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

async function getBipState(key: string): Promise<string | null> {
  try {
    const result = await sql`SELECT value FROM bip_state WHERE key = ${key}`;
    return result.rows[0]?.value ?? null;
  } catch {
    return null;
  }
}

async function setBipState(key: string, value: string): Promise<void> {
  await sql`
    INSERT INTO bip_state (key, value, updated_at) VALUES (${key}, ${value}, NOW())
    ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = NOW()
  `;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    // Auth
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const authHeader = request.headers.get('authorization');

    if (!isVercelCron) {
      if (
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    await ensureBipStateTable();

    // Skip if already posted today
    const today = new Date().toISOString().split('T')[0];
    const lastDailyPost = await getBipState('bip_last_daily_post');
    if (lastDailyPost === today) {
      return NextResponse.json({
        skipped: true,
        reason: 'Already posted today',
      });
    }

    // Get day count
    const dayCountStr = await getBipState('bip_day_count');
    const dayCount = dayCountStr ? parseInt(dayCountStr, 10) : 0;
    const nextDay = dayCount + 1;

    // Fetch current metrics (same queries as the admin dashboard)
    const now30dAgo = new Date(
      Date.now() - 29 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const nowIso = new Date().toISOString();

    const [mauResult, subsResult, signupsResult] = await Promise.all([
      // MAU: 30-day distinct product users (same as dashboard)
      sql.query(
        `SELECT COUNT(DISTINCT user_id) as count
         FROM conversion_events
         WHERE created_at >= $1 AND created_at <= $2
           AND user_id IS NOT NULL AND user_id NOT LIKE 'anon:%'
           AND (user_email IS NULL OR (user_email NOT LIKE '%@test.lunary.app' AND user_email != 'test@test.lunary.app'))`,
        [now30dAgo, nowIso],
      ),
      // Active subscribers + MRR (same as dashboard)
      sql.query(
        `SELECT
           COUNT(*) as subscriber_count,
           COALESCE(SUM(COALESCE(monthly_amount_due, 0)), 0) as mrr
         FROM subscriptions
         WHERE status = 'active'
           AND stripe_subscription_id IS NOT NULL
           AND (user_email IS NULL OR (user_email NOT LIKE '%@test.lunary.app' AND user_email != 'test@test.lunary.app'))`,
        [],
      ),
      // Today's signups
      sql.query(
        `SELECT COUNT(*) as count FROM "user"
         WHERE "createdAt" >= $1 AND "createdAt" <= $2
           AND (email IS NULL OR (email NOT LIKE '%@test.lunary.app' AND email != 'test@test.lunary.app'))`,
        [new Date(today).toISOString(), nowIso],
      ),
    ]);

    const mau = Number(mauResult.rows[0]?.count || 0);
    const subscriberCount = Number(subsResult.rows[0]?.subscriber_count || 0);
    const mrr = Number(subsResult.rows[0]?.mrr || 0);
    const newSignupsToday = Number(signupsResult.rows[0]?.count || 0);

    // Fetch impressions/day from Search Console (7-day average)
    let impressionsPerDay = 0;
    try {
      const scEndDate = today;
      const scStartDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      const scData = await getSearchConsoleData(scStartDate, scEndDate);
      impressionsPerDay = Math.round(scData.totalImpressions / 7);
    } catch {
      // Non-critical — post without impressions if GSC fails
    }

    // Build data context for the prompt
    // When MRR is 0 (all subscribers on coupons), use subscriber count as the monetisation signal
    const monetisationLine =
      mrr > 0
        ? `Current MRR: £${mrr.toFixed(2)}`
        : subscriberCount > 0
          ? `Active subscribers: ${subscriberCount} (early access, coupons applied)`
          : null;

    const dataLines = [
      `Current MAU: ${mau}`,
      monetisationLine,
      newSignupsToday > 0 ? `New signups today: ${newSignupsToday}` : null,
      impressionsPerDay > 0
        ? `SEO impressions/day (7-day avg): ${impressionsPerDay}`
        : null,
    ]
      .filter(Boolean)
      .join('\n');

    const captionPrompt = `Write a Build in Public daily update tweet for day ${nextDay} of building Lunary.

Context: Lunary is a live astrology app with real users and revenue. This is NOT a brand new project.

Metrics:
${dataLines}

Format rules:
- First line: "Day ${nextDay} of building Lunary" + a short honest hook about where things are (e.g. "and the SEO growth is wild", "and MRR just crossed £100")
- Blank line
- 3 bullet points using ✅ emoji, each on its own line
- Bullets must be short and punchy (under 60 chars each), written as natural observations NOT data labels
- Good: "✅ MRR sitting at £115, up from zero six months ago"
- Bad: "✅ Current MRR: £115.72, which feels like a solid foundation"
- Use the metrics as inspiration. Write them as achievements or honest observations.
- Blank line
- Final line: a short question or reflection that invites replies (one sentence)
- No hashtags in the body
- UK English. No em dashes. Sentence case.
- Keep the whole post under 400 characters total.
- Honest and grounded. No corporate language. Tone: real founder, daily journal.`;

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: LLM_MODEL,
      messages: [{ role: 'user', content: captionPrompt }],
      max_tokens: 300,
      temperature: 0.85,
    });

    const caption = completion.choices[0]?.message?.content?.trim() ?? '';
    if (!caption) throw new Error('LLM returned empty caption');

    // Schedule post for 09:00 UTC today (or 30 min from now if already past)
    const scheduledDate = new Date();
    scheduledDate.setUTCHours(9, 0, 0, 0);
    if (scheduledDate <= new Date()) {
      scheduledDate.setTime(Date.now() + 30 * 60 * 1000);
    }

    const postId = await scheduleTextPost({
      content: caption,
      scheduledFor: scheduledDate.toISOString(),
    });

    // Persist state
    await setBipState('bip_day_count', String(nextDay));
    await setBipState('bip_last_daily_post', today);

    console.log(`[BIP Daily] Day ${nextDay} posted: ${postId}`);

    return NextResponse.json({
      success: true,
      day: nextDay,
      postId,
      caption,
      metrics: { mau, mrr, newSignupsToday, impressionsPerDay },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[BIP Daily] Failed:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
