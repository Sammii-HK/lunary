import { NextRequest, NextResponse } from 'next/server';

import { cleanupOldThreads } from '@/lib/ai/threads';

/**
 * Cron job to clean up old AI threads
 * Keeps threads updated in the last 7 days, deletes older ones
 * Run daily via Vercel Cron
 */
export async function GET(request: NextRequest) {
  // Verify it's a cron request (Vercel sets this header)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const deletedCount = await cleanupOldThreads();
    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Cleaned up ${deletedCount} old threads`,
    });
  } catch (error) {
    console.error('[Cron] Failed to cleanup threads:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup threads' },
      { status: 500 },
    );
  }
}
