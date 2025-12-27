import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatTimestamp, resolveDateRange } from '@/lib/analytics/date-range';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    // Get plan breakdown with MRR contribution
    const planBreakdownResult = await sql`
      SELECT 
        plan_type,
        COUNT(*) as count,
        COALESCE(SUM(monthly_amount_due), 0) as mrr_contribution,
        COUNT(*) FILTER (WHERE status = 'active') as active_count,
        COUNT(*) FILTER (WHERE status = 'trial') as trial_count,
        COUNT(*) FILTER (WHERE status IN ('cancelled', 'canceled')) as cancelled_count
      FROM subscriptions
      WHERE (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
      GROUP BY plan_type
      ORDER BY mrr_contribution DESC
    `;

    type PlanAggregate = {
      plan: string;
      count: number;
      mrr: number;
      active: number;
      trial: number;
      cancelled: number;
    };

    const planBreakdownMap = planBreakdownResult.rows.reduce<
      Map<string, PlanAggregate>
    >((acc, row) => {
      const rawPlan = (row.plan_type as string) || 'unknown';
      const normalizedPlan = rawPlan === 'monthly' ? 'free' : rawPlan;
      const existing = acc.get(normalizedPlan) || {
        plan: normalizedPlan,
        count: 0,
        mrr: 0,
        active: 0,
        trial: 0,
        cancelled: 0,
      };
      existing.count += Number(row.count || 0);
      existing.mrr += Number(row.mrr_contribution || 0);
      existing.active += Number(row.active_count || 0);
      existing.trial += Number(row.trial_count || 0);
      existing.cancelled += Number(row.cancelled_count || 0);
      acc.set(normalizedPlan, existing);
      return acc;
    }, new Map<string, PlanAggregate>());

    const planBreakdown = Array.from(planBreakdownMap.values()).sort(
      (a, b) => b.mrr - a.mrr,
    );

    const totalMrr = planBreakdown.reduce((sum, p) => sum + p.mrr, 0);
    const planDistribution = planBreakdown.map((plan) => ({
      ...plan,
      percentage: totalMrr > 0 ? (plan.mrr / totalMrr) * 100 : 0,
    }));

    // Track plan upgrades/downgrades
    const planChangesResult = await sql`
      SELECT 
        ce1.metadata->>'previous_plan' as from_plan,
        ce1.metadata->>'new_plan' as to_plan,
        COUNT(*) as count
      FROM conversion_events ce1
      WHERE ce1.event_type = 'subscription_updated'
        AND ce1.created_at >= ${formatTimestamp(range.start)}
        AND ce1.created_at <= ${formatTimestamp(range.end)}
        AND (ce1.user_email IS NULL OR (ce1.user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND ce1.user_email != ${TEST_EMAIL_EXACT}))
        AND ce1.metadata->>'previous_plan' IS NOT NULL
        AND ce1.metadata->>'new_plan' IS NOT NULL
      GROUP BY ce1.metadata->>'previous_plan', ce1.metadata->>'new_plan'
    `;

    const planChanges = planChangesResult.rows.map((row) => ({
      from: row.from_plan as string,
      to: row.to_plan as string,
      count: Number(row.count || 0),
    }));

    return NextResponse.json({
      planBreakdown: planDistribution,
      totalMrr,
      planChanges,
    });
  } catch (error) {
    console.error('[analytics/plan-breakdown] Failed to load metrics', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        planBreakdown: [],
        totalMrr: 0,
        planChanges: [],
      },
      { status: 500 },
    );
  }
}
