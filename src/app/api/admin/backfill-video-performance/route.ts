import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { backfillAllPerformance } from '@/lib/social/video-scripts/collect-performance';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes — may need to fetch many posts

/**
 * POST /api/admin/backfill-video-performance
 *
 * Backfill ALL historical TikTok performance data from Ayrshare.
 * Safe to re-run — uses ON CONFLICT to upsert (updates metrics, no duplicates).
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const result = await backfillAllPerformance();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[Backfill] Failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Backfill failed' },
      { status: 500 },
    );
  }
}
