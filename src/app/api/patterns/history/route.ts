/**
 * API endpoint for fetching pattern history
 * GET /api/patterns/history - Returns historical pattern snapshots
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getPatternHistory,
  getCurrentSnapshots,
} from '@/lib/patterns/snapshot/storage';
import { auth } from '@/lib/auth-client';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const patternType = searchParams.get('type') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const currentOnly = searchParams.get('current') === 'true';

    if (currentOnly) {
      // Get only the most recent snapshot for each type
      const currentSnapshots = await getCurrentSnapshots(userId);

      return NextResponse.json({
        success: true,
        current: currentSnapshots,
      });
    }

    // Get full history
    const history = await getPatternHistory(userId, patternType, limit);

    // Group by pattern type for easier consumption
    const grouped: Record<string, any[]> = {};
    for (const snapshot of history) {
      if (!grouped[snapshot.type]) {
        grouped[snapshot.type] = [];
      }
      grouped[snapshot.type].push(snapshot);
    }

    return NextResponse.json({
      success: true,
      history: grouped,
      total: history.length,
    });
  } catch (error) {
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
