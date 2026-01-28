import { NextRequest, NextResponse } from 'next/server';
import { resolveDateRange } from '@/lib/analytics/date-range';

/**
 * Revenue endpoint for insights
 * Aggregates data from plan-breakdown and subscription-30d endpoints
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000';

    // Fetch from plan-breakdown endpoint for MRR
    const planBreakdownResponse = await fetch(
      `${baseUrl}/api/admin/analytics/plan-breakdown?start=${range.start.toISOString()}&end=${range.end.toISOString()}`,
    );

    if (!planBreakdownResponse.ok) {
      throw new Error(
        `Failed to fetch plan-breakdown: ${planBreakdownResponse.status}`,
      );
    }

    const planBreakdownData = await planBreakdownResponse.json();

    // Fetch from subscription-30d endpoint for conversion rate
    const subscription30dResponse = await fetch(
      `${baseUrl}/api/admin/analytics/subscription-30d?start=${range.start.toISOString()}&end=${range.end.toISOString()}`,
    );

    if (!subscription30dResponse.ok) {
      throw new Error(
        `Failed to fetch subscription-30d: ${subscription30dResponse.status}`,
      );
    }

    const subscription30dData = await subscription30dResponse.json();

    return NextResponse.json({
      mrr: planBreakdownData.totalMrr || 0,
      free_to_trial_rate: subscription30dData.conversion_rate || 0,
    });
  } catch (error) {
    console.error('[analytics/revenue] Failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
