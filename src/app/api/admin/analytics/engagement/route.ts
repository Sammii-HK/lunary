import { NextRequest, NextResponse } from 'next/server';
import { resolveDateRange } from '@/lib/analytics/date-range';

/**
 * Engagement endpoint for insights
 * Aggregates data from dau-wau-mau endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000';

    // Fetch from dau-wau-mau endpoint
    const dauWauMauResponse = await fetch(
      `${baseUrl}/api/admin/analytics/dau-wau-mau?start=${range.start.toISOString()}&end=${range.end.toISOString()}`,
    );

    if (!dauWauMauResponse.ok) {
      throw new Error(
        `Failed to fetch dau-wau-mau: ${dauWauMauResponse.status}`,
      );
    }

    const data = await dauWauMauResponse.json();

    // Calculate avg active days per week from DAU/WAU ratio
    const avgActiveDaysPerWeek =
      data.signed_in_product_wau > 0
        ? (data.signed_in_product_dau / data.signed_in_product_wau) * 7
        : 0;

    // Calculate stickiness (DAU/MAU ratio)
    const stickiness =
      data.signed_in_product_mau > 0
        ? (data.signed_in_product_dau / data.signed_in_product_mau) * 100
        : 0;

    return NextResponse.json({
      avg_active_days_per_week: Number(avgActiveDaysPerWeek.toFixed(2)),
      stickiness: Number(stickiness.toFixed(2)),
    });
  } catch (error) {
    console.error('[analytics/engagement] Failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
