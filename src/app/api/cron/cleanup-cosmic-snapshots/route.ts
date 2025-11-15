import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    console.log(
      '[cleanup-cosmic-snapshots] Starting cleanup at',
      now.toISOString(),
    );

    const userSnapshotsResult = await sql`
      DELETE FROM cosmic_snapshots
      WHERE snapshot_date < CURRENT_DATE
      RETURNING user_id, snapshot_date
    `;

    const globalDataResult = await sql`
      DELETE FROM global_cosmic_data
      WHERE data_date < CURRENT_DATE - INTERVAL '7 days'
      RETURNING data_date
    `;

    const notificationEventsResult = await sql`
      DELETE FROM notification_sent_events
      WHERE date < CURRENT_DATE - INTERVAL '24 hours'
      RETURNING id
    `;

    const userSnapshotsDeleted = userSnapshotsResult.rows.length;
    const globalDataDeleted = globalDataResult.rows.length;
    const notificationEventsDeleted = notificationEventsResult.rows.length;

    console.log(
      `[cleanup-cosmic-snapshots] Deleted ${userSnapshotsDeleted} user snapshots, ${globalDataDeleted} global data records, and ${notificationEventsDeleted} notification events`,
    );

    return NextResponse.json({
      success: true,
      userSnapshotsDeleted,
      globalDataDeleted,
      notificationEventsDeleted,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('[cleanup-cosmic-snapshots] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to cleanup cosmic snapshots',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
