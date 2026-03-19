import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { generateWeeklyInstagramContent } from '@/lib/instagram/generate-weekly';

export const dynamic = 'force-dynamic';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

/**
 * Generate Instagram content for a full week (7 days)
 *
 * POST /api/admin/instagram/generate-weekly
 * Body: { startDate: '2026-02-09' }
 *
 * Generates memes, carousels, daily cosmic posts, and quotes for 7 consecutive days.
 * Auth: admin session, CRON_SECRET bearer, or ADMIN_API_KEY bearer.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json();
    const { startDate } = body;

    if (!startDate) {
      return NextResponse.json(
        { error: 'startDate is required' },
        { status: 400 },
      );
    }

    const result = await generateWeeklyInstagramContent(startDate);

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error('[Instagram Weekly] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
