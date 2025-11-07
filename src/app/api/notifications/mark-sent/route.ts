import { NextRequest, NextResponse } from 'next/server';
import { markEventAsSent } from '../cron/shared-notification-tracker';

// API endpoint for Cloudflare worker to mark events as sent
export async function POST(request: NextRequest) {
  try {
    // Verify cron request
    const authHeader = request.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date, eventKey, type, name, priority, checkType } =
      await request.json();

    if (!date || !eventKey) {
      return NextResponse.json(
        { error: 'Date and eventKey are required' },
        { status: 400 },
      );
    }

    await markEventAsSent(
      date,
      eventKey,
      type || 'unknown',
      name || 'Unknown Event',
      priority || 0,
      checkType === 'daily' ? 'daily' : '4-hourly',
    );

    return NextResponse.json({
      success: true,
      message: 'Event marked as sent',
      date,
      eventKey,
    });
  } catch (error) {
    console.error('Error marking event as sent:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
