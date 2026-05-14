import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getBipAcquisitionSnapshot } from '@/lib/bip/acquisition-metrics';
import { renderMetricsCard } from '@/lib/bip/card-renderer';
import { buildWeeklyCaption } from '@/lib/bip/caption-templates';
import { filterVisibleMetrics } from '@/lib/bip/metric-thresholds';
import {
  createDraftPost,
  getSpellcastPostUrl,
  schedulePost,
  uploadCardImage,
} from '@/lib/bip-spellcast';
import { join } from 'node:path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

function weekLabel(date: Date) {
  const day = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'short' });
  return `week of ${day} ${month}`;
}

function scheduledForTomorrow() {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
}

async function getProductSnapshot() {
  const end = new Date();
  const start = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [mauResult, subsResult, signupsResult] = await Promise.all([
    sql.query(
      `SELECT COUNT(DISTINCT user_id) as count
       FROM conversion_events
       WHERE created_at >= $1 AND created_at <= $2
         AND user_id IS NOT NULL
         AND user_id NOT LIKE 'anon:%'
         AND (user_email IS NULL OR (user_email NOT LIKE $3 AND user_email != $4))`,
      [
        start.toISOString(),
        end.toISOString(),
        TEST_EMAIL_PATTERN,
        TEST_EMAIL_EXACT,
      ],
    ),
    sql.query(
      `SELECT COUNT(*) as subscriber_count,
              COALESCE(SUM(COALESCE(monthly_amount_due, 0)), 0) as mrr
       FROM subscriptions
       WHERE status = 'active'
         AND stripe_subscription_id IS NOT NULL
         AND (user_email IS NULL OR (user_email NOT LIKE $1 AND user_email != $2))`,
      [TEST_EMAIL_PATTERN, TEST_EMAIL_EXACT],
    ),
    sql.query(
      `SELECT COUNT(*) as count
       FROM "user"
       WHERE "createdAt" >= $1 AND "createdAt" <= $2
         AND (email IS NULL OR (email NOT LIKE $3 AND email != $4))`,
      [
        sevenDaysAgo.toISOString(),
        end.toISOString(),
        TEST_EMAIL_PATTERN,
        TEST_EMAIL_EXACT,
      ],
    ),
  ]);

  return {
    mau: Number(mauResult.rows[0]?.count || 0),
    mrr: Number(subsResult.rows[0]?.mrr || 0),
    subscriberCount: Number(subsResult.rows[0]?.subscriber_count || 0),
    newSignups: Number(signupsResult.rows[0]?.count || 0),
  };
}

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get('dryRun') === '1';
  const draftOnly = searchParams.get('draft') === '1';

  const endDate = formatDate(new Date());
  const startDate = formatDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));
  const label = weekLabel(new Date());

  try {
    const [product, acquisition] = await Promise.all([
      getProductSnapshot(),
      getBipAcquisitionSnapshot(startDate, endDate),
    ]);

    const filtered = filterVisibleMetrics({
      mau: product.mau,
      mrr: product.mrr,
      subscriberCount: product.subscriberCount,
      impressionsPerDay: acquisition.impressionsPerDay,
      clicksPerDay: acquisition.clicksPerDay,
      aiCitations: acquisition.sources.bingAiCitations,
      newSignups: product.newSignups,
    });

    if (!filtered.hero) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'No BIP metrics passed visibility thresholds',
        metrics: {
          ...product,
          impressionsPerDay: acquisition.impressionsPerDay,
          clicksPerDay: acquisition.clicksPerDay,
          aiCitations: acquisition.sources.bingAiCitations,
        },
      });
    }

    const caption = buildWeeklyCaption({
      weekLabel: label,
      hero: filtered.hero,
      visible: filtered.visible,
    });

    const cardPath = join(
      process.cwd(),
      'public',
      'app-demos',
      'bip',
      `weekly-${endDate}.png`,
    );

    await renderMetricsCard(
      {
        weekLabel: label,
        mau: product.mau,
        mrr: product.mrr,
        mrrDelta: 0,
        impressionsPerDay: acquisition.impressionsPerDay,
        impressionsDelta: 0,
        newSignups: product.newSignups,
        subscriberCount: product.subscriberCount,
        aiCitations: acquisition.sources.bingAiCitations,
      },
      cardPath,
    );

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        weekLabel: label,
        caption,
        cardPath,
        metrics: {
          ...product,
          impressionsPerDay: acquisition.impressionsPerDay,
          clicksPerDay: acquisition.clicksPerDay,
          aiCitations: acquisition.sources.bingAiCitations,
        },
      });
    }

    const mediaId = await uploadCardImage(cardPath);
    const postId = draftOnly
      ? await createDraftPost({ content: caption, mediaId })
      : await schedulePost({
          content: caption,
          mediaId,
          scheduledFor: scheduledForTomorrow(),
        });

    return NextResponse.json({
      success: true,
      weekLabel: label,
      postId,
      postUrl: getSpellcastPostUrl(postId),
      scheduled: !draftOnly,
      metrics: {
        ...product,
        impressionsPerDay: acquisition.impressionsPerDay,
        clicksPerDay: acquisition.clicksPerDay,
        aiCitations: acquisition.sources.bingAiCitations,
      },
    });
  } catch (error) {
    console.error('[bip-weekly] failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
