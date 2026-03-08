import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getOpenAI, LLM_MODEL } from '@/lib/openai-client';
import { scheduleTextPost } from '@/lib/bip-spellcast';
import { syncStripeDiscounts } from '@/lib/analytics/sync-stripe-discounts';

export const dynamic = 'force-dynamic';

/**
 * Build in Public — Daily stat post
 * Fires daily at 16:00 UTC. Schedules a text post to Spellcast sammii account
 * set with today's metrics in the "Day N of building Lunary" format.
 *
 * Data sources:
 * - MAU, DAU, signups: daily_metrics table (same source as admin dashboard)
 * - SEO: bip_state cache (populated by /seo skill or daily-metrics script)
 * - MRR: hidden until > £27/month (avoids showing coupon/test revenue)
 *
 * Numbers are rendered via deterministic template — the LLM only generates
 * the hook line and closing question, never the metric bullet points.
 */

// ---------------------------------------------------------------------------
// bip_state helpers
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
  const isDryRun = process.env.BIP_DRY_RUN === 'true';

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

    // Skip if already posted today (unless dry run)
    const today = new Date().toISOString().split('T')[0];
    if (!isDryRun) {
      const lastDailyPost = await getBipState('bip_last_daily_post');
      if (lastDailyPost === today) {
        return NextResponse.json({
          skipped: true,
          reason: 'Already posted today',
        });
      }
    }

    // Calculate day number from fixed start date
    const startDateStr = process.env.BIP_START_DATE || '2026-03-01';
    const startDate = new Date(startDateStr);
    const dayMs = 24 * 60 * 60 * 1000;
    const nextDay = Math.max(
      1,
      Math.round((Date.now() - startDate.getTime()) / dayMs) + 1,
    );

    // -----------------------------------------------------------------------
    // Fetch metrics from daily_metrics (same source as admin dashboard)
    // Uses yesterday's row for complete-day data, not partial today
    // -----------------------------------------------------------------------

    const [metricsResult, peakDauResult] = await Promise.all([
      sql`SELECT signed_in_product_mau, new_signups, dau
          FROM daily_metrics
          WHERE metric_date = (CURRENT_DATE - INTERVAL '1 day')
          ORDER BY metric_date DESC LIMIT 1`,
      sql`SELECT MAX(dau) as peak_dau
          FROM daily_metrics
          WHERE metric_date >= CURRENT_DATE - INTERVAL '30 days'
            AND metric_date < CURRENT_DATE`,
    ]);

    const metricsRow = metricsResult.rows[0];
    const mau = Number(metricsRow?.signed_in_product_mau || 0);
    const newSignupsYesterday = Number(metricsRow?.new_signups || 0);
    const dau = Number(metricsRow?.dau || 0);
    const peakDau = Number(peakDauResult.rows[0]?.peak_dau || 0);
    const isRecord = dau > 0 && peakDau > 0 && dau >= peakDau;

    // Sync Stripe discounts before MRR calculation
    try {
      await syncStripeDiscounts();
    } catch {
      // Non-critical — MRR query still runs with cached values
    }

    // MRR: query but only show when it exceeds £27 (hides coupon/test revenue)
    let mrr = 0;
    try {
      const mrrResult = await sql`
        SELECT COALESCE(SUM(COALESCE(monthly_amount_due, 0)), 0) as mrr
        FROM subscriptions
        WHERE status = 'active'
          AND stripe_subscription_id IS NOT NULL
          AND (user_email IS NULL OR (user_email NOT LIKE '%@test.lunary.app' AND user_email != 'test@test.lunary.app'))`;
      mrr = Number(mrrResult.rows[0]?.mrr || 0);
    } catch {
      // Non-critical
    }
    const showMrr = mrr > 27;

    // SEO impressions from bip_state (24hr staleness limit, omit if stale)
    let impressionsPerDay = 0;
    try {
      const storedSeo = await getBipState('seo_impressions_per_day');
      if (storedSeo) {
        const updatedAt =
          await sql`SELECT updated_at FROM bip_state WHERE key = 'seo_impressions_per_day'`;
        const lastUpdate = updatedAt.rows[0]?.updated_at;
        if (
          lastUpdate &&
          Date.now() - new Date(lastUpdate).getTime() < 24 * 60 * 60 * 1000
        ) {
          impressionsPerDay = Number(JSON.parse(storedSeo)) || 0;
        }
      }
    } catch {
      // Non-critical — post without impressions
    }

    // -----------------------------------------------------------------------
    // Build bullet points deterministically — LLM never touches numbers
    // -----------------------------------------------------------------------

    const bullets: string[] = [];
    if (mau > 0) bullets.push(`✅ ${mau} MAU this month`);
    if (showMrr) bullets.push(`✅ £${mrr.toFixed(2)} MRR`);
    if (newSignupsYesterday > 0)
      bullets.push(`✅ ${newSignupsYesterday} new signups yesterday`);
    if (impressionsPerDay > 0)
      bullets.push(
        `✅ ${impressionsPerDay.toLocaleString()} SEO impressions/day`,
      );
    if (dau > 0) {
      const dauLine = isRecord
        ? `✅ ${dau} DAU yesterday — new 30-day record`
        : `✅ ${dau} DAU yesterday`;
      bullets.push(dauLine);
    }

    const bulletBlock = bullets.join('\n');

    // -----------------------------------------------------------------------
    // LLM generates ONLY the hook line + closing question (no numbers)
    // -----------------------------------------------------------------------

    const hookPrompt = `Write two short lines for a Build in Public tweet (day ${nextDay}):

1. A hook line: 4-8 words, honest, conversational. This comes after "Day ${nextDay} of building in public —". Examples: "quiet progress today", "the dashboard finally makes sense", "small wins add up".${isRecord ? ` Yesterday was a new DAU record — incorporate that.` : ''}

2. A closing line: one short question or observation that invites replies. No hashtags.

Reply with ONLY these two lines, nothing else. Line 1 is the hook, line 2 is the closing.
UK English. No em dashes. Sentence case.`;

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: LLM_MODEL,
      messages: [{ role: 'user', content: hookPrompt }],
      max_tokens: 100,
      temperature: 0.9,
    });

    const llmOutput = completion.choices[0]?.message?.content?.trim() ?? '';
    const llmLines = llmOutput.split('\n').filter((l) => l.trim());
    const hookLine = llmLines[0]?.trim() || 'steady progress';
    const closingLine =
      llmLines[1]?.trim() || 'What are you building this week?';

    // Assemble the final caption — numbers are never LLM-generated
    const caption = `Day ${nextDay} of building in public — ${hookLine}\n\n${bulletBlock}\n\n${closingLine}`;

    // -----------------------------------------------------------------------
    // Dry run: return without scheduling
    // -----------------------------------------------------------------------

    const metrics = {
      mau,
      mrr,
      showMrr,
      newSignupsYesterday,
      impressionsPerDay,
      dau,
      isRecord,
    };

    if (isDryRun) {
      console.log(`[BIP Daily] DRY RUN — Day ${nextDay}`);
      console.log(`[BIP Daily] Caption:\n${caption}`);
      return NextResponse.json({
        dryRun: true,
        day: nextDay,
        caption,
        metrics,
        hookLine,
        closingLine,
        bulletBlock,
      });
    }

    // -----------------------------------------------------------------------
    // Schedule post for 19:00 UTC today
    // -----------------------------------------------------------------------

    const scheduledDate = new Date();
    scheduledDate.setUTCHours(19, 0, 0, 0);
    if (scheduledDate <= new Date()) {
      scheduledDate.setTime(Date.now() + 30 * 60 * 1000);
    }

    const postId = await scheduleTextPost({
      content: caption,
      scheduledFor: scheduledDate.toISOString(),
    });

    await setBipState('bip_last_daily_post', today);

    console.log(`[BIP Daily] Day ${nextDay} posted: ${postId}`);

    return NextResponse.json({
      success: true,
      day: nextDay,
      postId,
      caption,
      metrics,
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
