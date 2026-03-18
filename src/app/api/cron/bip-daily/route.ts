import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getOpenAI, LLM_MODEL } from '@/lib/openai-client';
import { scheduleTextPost } from '@/lib/bip-spellcast';
import { syncStripeDiscounts } from '@/lib/analytics/sync-stripe-discounts';
import { getSearchConsoleData } from '@/lib/google/search-console';

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
      sql`SELECT signed_in_product_mau, new_signups, signed_in_product_dau
          FROM daily_metrics
          WHERE metric_date = (CURRENT_DATE - INTERVAL '1 day')
          ORDER BY metric_date DESC LIMIT 1`,
      sql`SELECT MAX(signed_in_product_dau) as peak_dau
          FROM daily_metrics
          WHERE metric_date >= CURRENT_DATE - INTERVAL '30 days'
            AND metric_date < CURRENT_DATE`,
    ]);

    const metricsRow = metricsResult.rows[0];
    const mau = Number(metricsRow?.signed_in_product_mau || 0);
    const newSignupsYesterday = Number(metricsRow?.new_signups || 0);
    const dau = Number(metricsRow?.signed_in_product_dau || 0);
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

    // SEO: fetch directly from Google Search Console API
    // Current 7d vs previous 7d for week-on-week trend
    // Also fetch 28d-ago 7d window for month-on-month comparison
    let impressionsPerDay = 0;
    let clicksPerDay = 0;
    let avgPosition = 0;
    let ctr = 0;
    let prevImpressionsPerDay = 0;
    let monthAgoImpressionsPerDay = 0;
    try {
      const now = new Date();
      const fmt = (d: Date) => d.toISOString().split('T')[0];

      // GSC data has ~3 day lag
      const currentEnd = new Date(now.getTime() - 3 * dayMs);
      const currentStart = new Date(currentEnd.getTime() - 7 * dayMs);
      const prevEnd = new Date(currentStart.getTime() - 1 * dayMs);
      const prevStart = new Date(prevEnd.getTime() - 7 * dayMs);
      const monthAgoEnd = new Date(currentEnd.getTime() - 28 * dayMs);
      const monthAgoStart = new Date(monthAgoEnd.getTime() - 7 * dayMs);

      const [current, prev, monthAgo] = await Promise.all([
        getSearchConsoleData(fmt(currentStart), fmt(currentEnd)),
        getSearchConsoleData(fmt(prevStart), fmt(prevEnd)),
        getSearchConsoleData(fmt(monthAgoStart), fmt(monthAgoEnd)),
      ]);

      if (current) {
        impressionsPerDay = Math.round((current.totalImpressions || 0) / 7);
        clicksPerDay = Math.round((current.totalClicks || 0) / 7);
        avgPosition = current.averagePosition || 0;
        ctr = current.averageCtr
          ? Math.round(current.averageCtr * 100 * 10) / 10
          : 0;
      }
      if (prev) {
        prevImpressionsPerDay = Math.round((prev.totalImpressions || 0) / 7);
      }
      if (monthAgo) {
        monthAgoImpressionsPerDay = Math.round(
          (monthAgo.totalImpressions || 0) / 7,
        );
      }
    } catch (e) {
      console.error('[BIP Daily] Search Console fetch failed:', e);
      // Non-critical — post without SEO
    }

    // -----------------------------------------------------------------------
    // Build bullet points deterministically — LLM never touches numbers
    // -----------------------------------------------------------------------

    const bullets: string[] = [];
    if (mau > 0) bullets.push(`✅ ${mau} MAU this month`);
    if (showMrr) bullets.push(`✅ £${mrr.toFixed(2)} MRR`);
    if (newSignupsYesterday >= 5)
      bullets.push(`✅ ${newSignupsYesterday} new signups yesterday`);
    if (impressionsPerDay > 0) {
      // Impressions with trend comparison
      let impBullet = `✅ ${impressionsPerDay.toLocaleString()} impressions/day`;
      const compareBase =
        monthAgoImpressionsPerDay > 0
          ? monthAgoImpressionsPerDay
          : prevImpressionsPerDay;
      const compareLabel =
        monthAgoImpressionsPerDay > 0 ? 'a month ago' : 'last week';
      if (compareBase > 0 && compareBase !== impressionsPerDay) {
        const ratio = impressionsPerDay / compareBase;
        if (ratio >= 1.5) {
          impBullet += ` (${ratio.toFixed(1)}x from ${compareBase.toLocaleString()} ${compareLabel})`;
        } else {
          const pctChange = Math.round((ratio - 1) * 100);
          if (pctChange !== 0) {
            impBullet += ` (${pctChange > 0 ? '+' : ''}${pctChange}% vs ${compareLabel})`;
          }
        }
      }
      bullets.push(impBullet);

      // Clicks
      if (clicksPerDay > 0) bullets.push(`✅ ${clicksPerDay} clicks/day`);

      // Average position
      if (avgPosition > 0)
        bullets.push(
          `✅ avg position ${avgPosition.toFixed(1)} (page ${Math.ceil(avgPosition / 10)})`,
        );
    }
    // DAU omitted — too volatile and not impressive yet at current scale

    const bulletBlock = bullets.join('\n');

    // -----------------------------------------------------------------------
    // Guard: skip if no metrics to show — a post with no real data is useless
    // -----------------------------------------------------------------------

    if (bullets.length === 0) {
      console.log(
        '[BIP Daily] Skipping — no metrics available (daily_metrics row missing for yesterday)',
      );
      return NextResponse.json({
        skipped: true,
        reason: 'No metrics available',
      });
    }

    // -----------------------------------------------------------------------
    // LLM generates ONLY the hook line + closing question (no numbers)
    // -----------------------------------------------------------------------

    // Determine Google ranking phase context for closing line
    let seoContext = '';
    if (impressionsPerDay > 0) {
      const impressionsGrew =
        prevImpressionsPerDay > 0 &&
        impressionsPerDay > prevImpressionsPerDay * 1.3;
      const ctrLow = ctr > 0 && ctr < 1.5;
      const positionHigh = avgPosition > 20;
      const positionMid = avgPosition > 10 && avgPosition <= 20;

      if (impressionsGrew && ctrLow) {
        seoContext = `SEO context: impressions are growing fast but CTR is low (${ctr}%). This is the Google Dance phase — Google is testing the site in new positions. Rising impressions with flat CTR is a GOOD sign, not a problem. The closing should reference this: e.g. "Google's testing us in new positions. Low CTR is expected — clicks follow once rankings stabilise."`;
      } else if (positionHigh) {
        seoContext = `SEO context: average position is ${avgPosition.toFixed(1)} (page ${Math.ceil(avgPosition / 10)}). Nobody clicks that far down, but the trajectory matters. The closing should be honest about this: e.g. "Average position ${avgPosition.toFixed(1)}. Nobody clicks page ${Math.ceil(avgPosition / 10)}. But last week it was worse."`;
      } else if (positionMid) {
        seoContext = `SEO context: average position is ${avgPosition.toFixed(1)} — approaching page 1. The closing should reference the progress: e.g. "Getting closer to page 1. Position ${avgPosition.toFixed(1)} and trending down."`;
      } else if (avgPosition > 0 && avgPosition <= 10) {
        seoContext = `SEO context: average position is ${avgPosition.toFixed(1)} — on page 1. The closing should reference this milestone and what it means for clicks.`;
      }
    }

    // Build context string so the LLM knows what's actually happening
    const metricsContext: string[] = [];
    if (mau > 0) metricsContext.push(`${mau} MAU`);
    if (impressionsPerDay > 0) {
      let impCtx = `${impressionsPerDay.toLocaleString()} SEO impressions/day`;
      if (monthAgoImpressionsPerDay > 0) {
        const ratio = impressionsPerDay / monthAgoImpressionsPerDay;
        impCtx += ` (${ratio.toFixed(1)}x from a month ago)`;
      } else if (prevImpressionsPerDay > 0) {
        const ratio = impressionsPerDay / prevImpressionsPerDay;
        impCtx += ` (${ratio.toFixed(1)}x from last week)`;
      }
      metricsContext.push(impCtx);
    }
    if (avgPosition > 0)
      metricsContext.push(`avg Google position ${avgPosition.toFixed(1)}`);

    const hookPrompt = `Write two short lines for a Build in Public post (day ${nextDay}).

Today's metrics: ${metricsContext.join(', ') || 'modest progress'}

Line 1 (hook): 4-8 words, honest, specific, lowercase. This completes the sentence "Day ${nextDay} of building in public, ". Do NOT use a dash. The hook should reflect what the metrics actually show. If impressions are growing fast, say so. If things are flat, be honest about that too. Examples: "SEO just tripled in a month", "impressions are compounding now", "Google is finally noticing".${isRecord ? ` Yesterday was a new DAU record, reference that specifically.` : ''}

Line 2 (closing): one short, specific observation based on the data. NOT a generic question. NOT "excited to see where this goes" or "what's next". Must be a concrete, data-backed takeaway.${seoContext ? `\n\n${seoContext}` : ' Reference any notable metric from the bullet points.'}

STRICT RULES — violation means failure:
- NO hashtags of any kind
- NO dashes or hyphens (not em dash, not hyphen, not —)
- NO "stay motivated", "keep going", or generic hustle phrases
- NO exclamation marks
- NO "excited to see", "what's next", "stay tuned", "follow for more"
- NO generic questions like "what are you building?" or "how's your week going?"
- UK English, sentence case
- Reply with ONLY the two lines, no numbering, no labels, no extra text`;

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: LLM_MODEL,
      messages: [{ role: 'user', content: hookPrompt }],
      max_tokens: 80,
      temperature: 0.85,
    });

    const llmOutput = completion.choices[0]?.message?.content?.trim() ?? '';
    const llmLines = llmOutput.split('\n').filter((l) => l.trim());
    let hookLine = llmLines[0]?.trim() || 'steady progress';
    let closingLine = llmLines[1]?.trim() || 'What shipped for you this week?';

    // Post-process: strip any hashtags and em dashes the LLM snuck in
    hookLine = hookLine
      .replace(/#\w+/g, '')
      .replace(/\s*[—–]\s*/g, ', ')
      .trim();
    closingLine = closingLine
      .replace(/#\w+/g, '')
      .replace(/\s*[—–]\s*/g, ', ')
      .trim();

    // Assemble the final caption — numbers are never LLM-generated
    const caption = `Day ${nextDay} of building in public, ${hookLine}\n\n${bulletBlock}\n\n${closingLine}`;

    // -----------------------------------------------------------------------
    // Dry run: return without scheduling
    // -----------------------------------------------------------------------

    const metrics = {
      mau,
      mrr,
      showMrr,
      newSignupsYesterday,
      impressionsPerDay,
      clicksPerDay,
      avgPosition,
      ctr,
      prevImpressionsPerDay,
      monthAgoImpressionsPerDay,
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
