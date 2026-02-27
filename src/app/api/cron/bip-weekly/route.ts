import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import * as path from 'node:path';
import {
  renderMetricsCard,
  renderMilestoneCard,
} from '@/lib/video/bip-card-renderer';
import { uploadCardImage, schedulePost } from '@/lib/bip-spellcast';
import { getSearchConsoleData } from '@/lib/google/search-console';

/**
 * Build in Public — Weekly card post
 * Fires Monday 02:00 UTC. Generates a metrics card image, uploads it to
 * Spellcast, and schedules a post for Monday 09:00 UTC. Also checks for
 * crossed milestone thresholds and posts milestone cards for any new ones.
 *
 * State is persisted in the bip_state table (shared with bip-daily cron).
 */

// Milestone thresholds (mirrors bip-metrics.ts)
const MILESTONES: Array<{
  metric: 'mau' | 'mrr' | 'impressionsPerDay';
  label: string;
  values: number[];
}> = [
  {
    metric: 'mau',
    label: 'monthly active users',
    values: [500, 1000, 2500, 5000],
  },
  { metric: 'mrr', label: 'MRR (£)', values: [100, 500, 1000] },
  {
    metric: 'impressionsPerDay',
    label: 'impressions/day',
    values: [50000, 100000, 250000],
  },
];

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
// Helpers
// ---------------------------------------------------------------------------

function pctDelta(current: number, prior: number): number {
  if (prior === 0) return 0;
  if (current === 0) return 0;
  const delta = Math.round(((current - prior) / prior) * 100);
  if (delta < -90) return 0;
  return delta;
}

function formatMrrCaption(mrr: number): string {
  return `£${mrr.toFixed(2)}`;
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

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const now7dAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const now30dAgo = new Date(
      Date.now() - 29 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const now37dAgo = new Date(
      Date.now() - 37 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const nowIso = now.toISOString();

    const [
      mauResult,
      mrrResult,
      priorMauResult,
      priorMrrResult,
      signupsResult,
    ] = await Promise.all([
      // Current MAU: 30-day distinct product users (same as dashboard)
      sql.query(
        `SELECT COUNT(DISTINCT user_id) as count FROM conversion_events
         WHERE created_at >= $1 AND created_at <= $2
           AND user_id IS NOT NULL AND user_id NOT LIKE 'anon:%'
           AND (user_email IS NULL OR (user_email NOT LIKE '%@test.lunary.app' AND user_email != 'test@test.lunary.app'))`,
        [now30dAgo, nowIso],
      ),
      // Active subscribers + MRR (same as dashboard)
      sql.query(
        `SELECT COUNT(*) as subscriber_count,
                COALESCE(SUM(COALESCE(monthly_amount_due, 0)), 0) as mrr
         FROM subscriptions
         WHERE status = 'active'
           AND stripe_subscription_id IS NOT NULL
           AND (user_email IS NULL OR (user_email NOT LIKE '%@test.lunary.app' AND user_email != 'test@test.lunary.app'))`,
        [],
      ),
      // Prior MAU: 30-day window ending 7 days ago (for WoW delta)
      sql.query(
        `SELECT COUNT(DISTINCT user_id) as count FROM conversion_events
         WHERE created_at >= $1 AND created_at <= $2
           AND user_id IS NOT NULL AND user_id NOT LIKE 'anon:%'
           AND (user_email IS NULL OR (user_email NOT LIKE '%@test.lunary.app' AND user_email != 'test@test.lunary.app'))`,
        [now37dAgo, now7dAgo],
      ),
      // Prior MRR: snapshotted from daily_metrics 7 days ago
      sql.query(
        `SELECT mrr FROM daily_metrics ORDER BY metric_date DESC LIMIT 1 OFFSET 7`,
        [],
      ),
      // New signups this week
      sql.query(
        `SELECT COUNT(*) as count FROM "user"
         WHERE "createdAt" >= $1 AND "createdAt" <= $2
           AND (email IS NULL OR (email NOT LIKE '%@test.lunary.app' AND email != 'test@test.lunary.app'))`,
        [now7dAgo, nowIso],
      ),
    ]);

    const currentMau = Number(mauResult.rows[0]?.count || 0);
    const subscriberCount = Number(mrrResult.rows[0]?.subscriber_count || 0);
    const currentMrr = Number(mrrResult.rows[0]?.mrr || 0);
    const priorMau = Number(priorMauResult.rows[0]?.count || 0);
    const priorMrr = Number(priorMrrResult.rows[0]?.mrr || 0);
    const newSignups = Number(signupsResult.rows[0]?.count || 0);

    // Search Console impressions
    let impressionsPerDay = 0;
    let impressionsDelta = 0;
    try {
      const scEndDate = today;
      const scStartDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      const scData = await getSearchConsoleData(scStartDate, scEndDate);
      impressionsPerDay = Math.round(scData.totalImpressions / 7);

      if (impressionsPerDay > 0) {
        const priorEndDate = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
        const priorStartDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
        const priorScData = await getSearchConsoleData(
          priorStartDate,
          priorEndDate,
        ).catch(() => null);
        if (priorScData) {
          const priorImpressionsPerDay = Math.round(
            priorScData.totalImpressions / 7,
          );
          impressionsDelta = pctDelta(
            impressionsPerDay,
            priorImpressionsPerDay,
          );
        }
      }
    } catch {
      // Non-critical
    }

    const day = now.getDate();
    const month = now.toLocaleString('en-GB', { month: 'short' });
    const weekLabel = `week of ${day} ${month}`;

    // Render metrics card to /tmp (Vercel's writable temp dir)
    const cardFilename = `bip-weekly-${today}.png`;
    const cardPath = path.join('/tmp', cardFilename);

    await renderMetricsCard(
      {
        weekLabel,
        mau: currentMau,
        mauDelta: pctDelta(currentMau, priorMau),
        mrr: currentMrr,
        mrrDelta: pctDelta(currentMrr, priorMrr),
        impressionsPerDay,
        impressionsDelta,
        newSignups,
      },
      cardPath,
    );

    // Upload to Spellcast
    const mediaId = await uploadCardImage(cardPath);

    // Build caption — use subscriber count when MRR is 0 (coupon subscribers)
    const monetisationBullet =
      currentMrr > 0
        ? `✅ ${formatMrrCaption(currentMrr)} MRR`
        : subscriberCount > 0
          ? `✅ ${subscriberCount} active subscriber${subscriberCount !== 1 ? 's' : ''} (early access)`
          : null;

    const caption = [
      `${weekLabel.charAt(0).toUpperCase() + weekLabel.slice(1)} at Lunary`,
      '',
      `✅ ${currentMau} MAU`,
      monetisationBullet,
      impressionsPerDay > 0
        ? `✅ ${impressionsPerDay.toLocaleString()} impressions/day`
        : null,
      '',
      'Building in public every week.',
    ]
      .filter((l) => l !== null)
      .join('\n');

    // Schedule for 09:30 UTC today (cron fires at 02:00, post 7.5 hours later)
    const scheduledDate = new Date(now);
    scheduledDate.setUTCHours(9, 30, 0, 0);
    if (scheduledDate <= now) {
      scheduledDate.setTime(now.getTime() + 30 * 60 * 1000);
    }

    const postId = await schedulePost({
      content: caption,
      mediaId,
      scheduledFor: scheduledDate.toISOString(),
    });

    // Check and post milestones
    const snapshot = { mau: currentMau, mrr: currentMrr, impressionsPerDay };
    const milestonesPosted: string[] = [];

    for (const milestone of MILESTONES) {
      const currentValue = snapshot[milestone.metric];
      for (const threshold of milestone.values) {
        const stateKey = `bip_milestone_${milestone.metric}_${threshold}`;
        const alreadyPosted = await getBipState(stateKey);
        if (currentValue >= threshold && !alreadyPosted) {
          try {
            const milestoneCardPath = path.join(
              '/tmp',
              `bip-milestone-${milestone.metric}-${threshold}-${today}.png`,
            );
            await renderMilestoneCard(
              {
                metric: milestone.metric,
                value: milestone.metric === 'mrr' ? currentMrr : currentValue,
                threshold,
                context: `${weekLabel} · lunary.app`,
              },
              milestoneCardPath,
            );
            const milestoneMediaId = await uploadCardImage(milestoneCardPath);

            const milestoneCaption = [
              `Milestone: ${threshold}${milestone.metric === 'mrr' ? '' : ''} ${milestone.label}`,
              '',
              `Lunary just crossed ${milestone.metric === 'mrr' ? `£${threshold}` : threshold.toLocaleString()} ${milestone.label}.`,
              '',
              'Building in public.',
            ].join('\n');

            // Schedule 1 hour after the weekly post
            const milestoneDate = new Date(scheduledDate);
            milestoneDate.setTime(milestoneDate.getTime() + 60 * 60 * 1000);

            await schedulePost({
              content: milestoneCaption,
              mediaId: milestoneMediaId,
              scheduledFor: milestoneDate.toISOString(),
            });

            await setBipState(stateKey, 'posted');
            milestonesPosted.push(`${milestone.metric}-${threshold}`);
          } catch (milestoneError) {
            console.warn(
              `[BIP Weekly] Milestone post failed for ${milestone.metric}-${threshold}:`,
              milestoneError,
            );
          }
        }
      }
    }

    console.log(
      `[BIP Weekly] ${weekLabel} posted: ${postId}. Milestones: ${milestonesPosted.join(', ') || 'none'}`,
    );

    return NextResponse.json({
      success: true,
      weekLabel,
      postId,
      milestones: milestonesPosted,
      metrics: { mau: currentMau, mrr: currentMrr, impressionsPerDay },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[BIP Weekly] Failed:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
