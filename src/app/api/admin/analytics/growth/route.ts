import { NextRequest, NextResponse } from 'next/server';
import { resolveDateRange } from '@/lib/analytics/date-range';

/**
 * Growth endpoint for insights
 * Aggregates data from user-growth endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    // Fetch from user-growth endpoint
    const userGrowthResponse = await fetch(
      `${request.nextUrl.origin}/api/admin/analytics/user-growth?start=${range.start.toISOString()}&end=${range.end.toISOString()}`,
    );

    if (!userGrowthResponse.ok) {
      throw new Error(
        `Failed to fetch user-growth: ${userGrowthResponse.status}`,
      );
    }

    const userGrowthData = await userGrowthResponse.json();

    // Fetch activation data from dau-wau-mau
    const dauWauMauResponse = await fetch(
      `${request.nextUrl.origin}/api/admin/analytics/dau-wau-mau?start=${range.start.toISOString()}&end=${range.end.toISOString()}`,
    );

    if (!dauWauMauResponse.ok) {
      throw new Error(
        `Failed to fetch dau-wau-mau: ${dauWauMauResponse.status}`,
      );
    }

    const dauWauMauData = await dauWauMauResponse.json();

    // Calculate activation rate (product MAU / total signups)
    const activationRate =
      userGrowthData.totalSignups > 0
        ? (dauWauMauData.signed_in_product_mau / userGrowthData.totalSignups) *
          100
        : 0;

    return NextResponse.json({
      product_mau_growth_rate: userGrowthData.growthRate || 0,
      new_signups: userGrowthData.totalSignups || 0,
      activation_rate: Number(activationRate.toFixed(2)),
    });
  } catch (error) {
    console.error('[analytics/growth] Failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
