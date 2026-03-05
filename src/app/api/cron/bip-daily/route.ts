import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getOpenAI, LLM_MODEL } from '@/lib/openai-client';
import { scheduleTextPost } from '@/lib/bip-spellcast';
import { getSearchConsoleData } from '@/lib/google/search-console';

export const dynamic = 'force-dynamic';

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
        !process.env.CRON_SECRET ||
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

    // Calculate the actual day number from a fixed start date so the counter
    // reflects real elapsed time rather than a bare incrementing DB value.
    // BIP_START_DATE defaults to 2026-03-01 — the date Sammii started publicly
    // building in public on X. Override via env var if needed.
    const startDateStr = process.env.BIP_START_DATE || '2026-03-01';
    const startDate = new Date(startDateStr);
    const dayMs = 24 * 60 * 60 * 1000;
    const nextDay = Math.max(
      1,
      Math.round((Date.now() - startDate.getTime()) / dayMs) + 1,
    );

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

    // Fetch DAU for yesterday (complete day — today's count is partial and unreliable)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    let dau = 0;
    let peakDau = 0;
    try {
      const [dauResult, peakDauResult] = await Promise.all([
        sql.query(
          `SELECT COUNT(DISTINCT user_id) as count
           FROM conversion_events
           WHERE DATE(created_at) = $1
             AND user_id IS NOT NULL AND user_id NOT LIKE 'anon:%'
             AND (user_email IS NULL OR (user_email NOT LIKE '%@test.lunary.app' AND user_email != 'test@test.lunary.app'))
             AND event_type IN (
               'grimoire_viewed','tarot_drawn','chart_viewed','birth_chart_viewed',
               'personalized_horoscope_viewed','personalized_tarot_viewed',
               'astral_chat_used','ritual_completed','horoscope_viewed',
               'daily_dashboard_viewed','journal_entry_created','dream_entry_created',
               'cosmic_pulse_opened'
             )`,
          [yesterday],
        ),
        sql.query(
          `SELECT MAX(dau) as peak_dau
           FROM daily_metrics
           WHERE metric_date >= CURRENT_DATE - INTERVAL '30 days'
             AND metric_date < CURRENT_DATE`,
          [],
        ),
      ]);
      dau = Number(dauResult.rows[0]?.count || 0);
      peakDau = Number(peakDauResult.rows[0]?.peak_dau || 0);
    } catch {
      // Non-critical — continue without DAU
    }

    const isRecord = dau > 0 && peakDau > 0 && dau >= peakDau;

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
      dau > 0 ? `DAU yesterday: ${dau}` : null,
      isRecord
        ? `All-time 30-day peak DAU: ${peakDau} — yesterday was a new record`
        : null,
    ]
      .filter(Boolean)
      .join('\n');

    const bulletCount = dataLines.split('\n').length;

    const recordHookNote = isRecord
      ? `\n- Yesterday hit a new 30-day DAU record (${dau}). Use this as the hook: the first line after "Day ${nextDay}" should celebrate this milestone naturally.`
      : '';

    const captionPrompt = `Write a Build in Public daily update tweet for day ${nextDay} of building in public.

Context: Lunary is a live astrology app with real users.

Today's metrics (ONLY use what is listed here — do not invent, assume, or paraphrase any metric not present. Do not write "signups rolling in" or "impressions rising" unless the actual number is in the list below):
${dataLines}

Format rules:
- First line: "Day ${nextDay} of building in public" + a short honest hook (one clause, max 8 words)${recordHookNote}
- Blank line
- Exactly ${bulletCount} bullet points using ✅ emoji — one per metric above, nothing more
- Each bullet states the metric as a natural observation with the real number: "✅ 241 MAU this month" not "✅ Users growing"
- NEVER write a bullet without a specific number from the data above
- Blank line
- Final line: one short question or observation that invites replies
- No hashtags. UK English. No em dashes. Sentence case. Under 400 characters total.`;

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: LLM_MODEL,
      messages: [{ role: 'user', content: captionPrompt }],
      max_tokens: 300,
      temperature: 0.85,
    });

    const caption = completion.choices[0]?.message?.content?.trim() ?? '';
    if (!caption) throw new Error('LLM returned empty caption');

    // Schedule post for 19:00 UTC today — 7pm UK / 2pm EST, peak UK+US crossover.
    // If cron fires after 19:00 UTC for any reason, post 30 min from now.
    const scheduledDate = new Date();
    scheduledDate.setUTCHours(19, 0, 0, 0);
    if (scheduledDate <= new Date()) {
      scheduledDate.setTime(Date.now() + 30 * 60 * 1000);
    }

    const postId = await scheduleTextPost({
      content: caption,
      scheduledFor: scheduledDate.toISOString(),
    });

    // Persist state (day count is now derived from BIP_START_DATE, not stored)
    await setBipState('bip_last_daily_post', today);

    console.log(`[BIP Daily] Day ${nextDay} posted: ${postId}`);

    return NextResponse.json({
      success: true,
      day: nextDay,
      postId,
      caption,
      metrics: { mau, mrr, newSignupsToday, impressionsPerDay, dau, isRecord },
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
