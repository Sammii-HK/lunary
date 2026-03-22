import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import {
  backfillAllPerformance,
  backfillFromSpellcast,
} from '@/lib/social/video-scripts/collect-performance';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes — may need to fetch many posts

/**
 * POST /api/admin/backfill-video-performance
 *
 * Backfill video_performance from external sources.
 *
 * Query params:
 * - source=spellcast (default) — pull from Spellcast analytics (all platforms)
 * - source=ayrshare — pull from Ayrshare (TikTok only, legacy)
 * - start_date=2025-01-01 — optional, for Spellcast source
 * - end_date=2026-03-21 — optional, for Spellcast source
 *
 * Safe to re-run — uses ON CONFLICT to upsert (updates metrics, no duplicates).
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') ?? 'spellcast';

    if (source === 'ayrshare') {
      const result = await backfillAllPerformance();
      return NextResponse.json({
        success: true,
        source: 'ayrshare',
        ...result,
      });
    }

    // Default: Spellcast
    const result = await backfillFromSpellcast({
      startDate: searchParams.get('start_date') ?? undefined,
      endDate: searchParams.get('end_date') ?? undefined,
    });

    return NextResponse.json({ success: true, source: 'spellcast', ...result });
  } catch (error) {
    console.error('[Backfill] Failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Backfill failed' },
      { status: 500 },
    );
  }
}
