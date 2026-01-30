/**
 * API endpoint for fetching pattern history
 * GET /api/patterns/history - Returns historical pattern snapshots
 * Now with multi-layer caching for optimal performance
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireUser, UnauthorizedError } from '@/lib/ai/auth';
import {
  getCachedPatternHistory,
  getCachedCurrentSnapshots,
} from '@/lib/patterns/snapshot/cache';

// Enable caching with revalidation
export const revalidate = 3600; // 1 hour

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const userId = user.id;
    const searchParams = request.nextUrl.searchParams;
    const patternType = searchParams.get('type') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const currentOnly = searchParams.get('current') === 'true';

    if (currentOnly) {
      // Get only the most recent snapshot for each type (CACHED)
      const currentSnapshots = await getCachedCurrentSnapshots(userId);

      return NextResponse.json({
        success: true,
        current: currentSnapshots,
        cached: true,
      });
    }

    // Get full history (CACHED)
    const result = await getCachedPatternHistory(userId, patternType, limit);

    return NextResponse.json({
      success: true,
      userId,
      totalSnapshots: result.totalSnapshots,
      byType: result.byType,
      snapshots: result.snapshots,
      cached: true,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: 'Please sign in to view patterns' },
        { status: 401 },
      );
    }

    console.error('Error fetching pattern history:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
