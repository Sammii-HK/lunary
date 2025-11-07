import { NextRequest, NextResponse } from 'next/server';
import { getSentEvents } from '../cron/shared-notification-tracker';

// API endpoint for Cloudflare worker to check what events have been sent
export async function GET(request: NextRequest) {
  try {
    // Verify cron request
    const authHeader = request.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 },
      );
    }

    const sentEvents = await getSentEvents(date);
    const eventsArray = Array.from(sentEvents);

    return NextResponse.json({
      date,
      events: eventsArray,
      count: eventsArray.length,
    });
  } catch (error) {
    console.error('Error checking sent events:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        events: [],
      },
      { status: 500 },
    );
  }
}
