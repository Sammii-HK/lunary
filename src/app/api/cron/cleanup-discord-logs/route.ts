import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const authHeader = request.headers.get('authorization');

    if (!isVercelCron) {
      if (
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('[cleanup-discord-logs] Starting cleanup');

    const logsResult = await sql`SELECT cleanup_old_discord_logs()`;
    const analyticsResult = await sql`SELECT cleanup_old_discord_analytics()`;

    console.log('[cleanup-discord-logs] Cleanup completed');

    return NextResponse.json({
      success: true,
      message: 'Discord logs cleanup completed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[cleanup-discord-logs] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
