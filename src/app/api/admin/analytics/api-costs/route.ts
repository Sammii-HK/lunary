import { NextRequest, NextResponse } from 'next/server';
import { getPostHogAIMetrics } from '@/lib/posthog-server';
import { resolveDateRange } from '@/lib/analytics/date-range';
import { sql } from '@vercel/postgres';
import { formatTimestamp } from '@/lib/analytics/date-range';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);
    const daysBack = Math.ceil(
      (range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Get AI costs from PostHog
    const aiMetrics = await getPostHogAIMetrics(daysBack);

    // Get MRR for comparison
    const mrrResult = await sql`
      SELECT COALESCE(SUM(monthly_amount_due), 0) as total_mrr
      FROM subscriptions
      WHERE status IN ('active', 'trial', 'past_due')
        AND plan_type IN ('lunary_plus', 'lunary_plus_ai', 'lunary_plus_ai_annual')
    `;
    const mrr = Number(mrrResult.rows[0]?.total_mrr || 0);

    // Get paying users count
    const payingUsersResult = await sql`
      SELECT COUNT(DISTINCT user_id) as count
      FROM subscriptions
      WHERE status IN ('active', 'trial', 'past_due')
        AND is_paying = true
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
    `;
    const payingUsers = Number(payingUsersResult.rows[0]?.count || 0);

    if (!aiMetrics) {
      return NextResponse.json({
        totalCost: 0,
        totalGenerations: 0,
        uniqueUsers: 0,
        costPerUser: 0,
        costPerSession: 0,
        mrr,
        revenueCostRatio: 0,
        costTrends: [],
      });
    }

    const totalCost = aiMetrics.totalCostUsd;
    const costPerUser = payingUsers > 0 ? totalCost / payingUsers : 0;
    const costPerSession =
      aiMetrics.totalGenerations > 0
        ? totalCost / aiMetrics.totalGenerations
        : 0;
    const revenueCostRatio = totalCost > 0 ? mrr / totalCost : 0;

    // Get daily cost trends
    const costTrendsResult = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as generations,
      SUM(token_count) as total_tokens
      FROM analytics_ai_usage
      WHERE created_at >= ${formatTimestamp(range.start)}
        AND created_at <= ${formatTimestamp(range.end)}
        AND NOT EXISTS (
          SELECT 1 FROM subscriptions s
          WHERE s.user_id = analytics_ai_usage.user_id
            AND (s.user_email LIKE ${TEST_EMAIL_PATTERN} OR s.user_email = ${TEST_EMAIL_EXACT})
        )
        AND NOT EXISTS (
          SELECT 1 FROM conversion_events ce
          WHERE ce.user_id = analytics_ai_usage.user_id
            AND (ce.user_email LIKE ${TEST_EMAIL_PATTERN} OR ce.user_email = ${TEST_EMAIL_EXACT})
        )
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Estimate daily costs (approximate based on token usage)
    // Average cost per 1k tokens: ~$0.001 (gpt-4o-mini average)
    const costTrends = costTrendsResult.rows.map((row) => {
      const tokens = Number(row.total_tokens || 0);
      const estimatedCost = (tokens / 1000) * 0.001; // Rough estimate
      return {
        date: row.date,
        generations: Number(row.generations || 0),
        tokens,
        estimatedCost: Number(estimatedCost.toFixed(4)),
      };
    });

    return NextResponse.json({
      totalCost: Number(totalCost.toFixed(2)),
      totalGenerations: aiMetrics.totalGenerations,
      uniqueUsers: aiMetrics.uniqueUsers,
      costPerUser: Number(costPerUser.toFixed(2)),
      costPerSession: Number(costPerSession.toFixed(4)),
      mrr,
      revenueCostRatio: Number(revenueCostRatio.toFixed(2)),
      costTrends,
    });
  } catch (error) {
    console.error('[analytics/api-costs] Failed to load metrics', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        totalCost: 0,
        totalGenerations: 0,
        uniqueUsers: 0,
        costPerUser: 0,
        costPerSession: 0,
        mrr: 0,
        revenueCostRatio: 0,
        costTrends: [],
      },
      { status: 500 },
    );
  }
}
