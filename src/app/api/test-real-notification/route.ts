import { NextRequest, NextResponse } from 'next/server';

/**
 * Test REAL notifications - uses actual cosmic data like production
 * This sends notifications exactly as they would be sent for real events
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date =
      searchParams.get('date') || new Date().toISOString().split('T')[0];

    console.log(`🧪 Testing REAL notification for date: ${date}`);

    // Use the same endpoint that the real cron job uses
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    // Call the real notification check endpoint
    const response = await fetch(
      `${baseUrl}/api/notifications/check-events?date=${date}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.CRON_SECRET || ''}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to check events: ${response.status} - ${errorText}`,
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Real notification test completed',
      date,
      notificationsSent: result.notificationsSent || 0,
      primaryEvent: result.primaryEvent,
      results: result.results || [],
      timestamp: new Date().toISOString(),
      note: 'This is what subscribers would receive for real cosmic events happening today',
    });
  } catch (error) {
    console.error('❌ Real notification test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date } = body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Same as GET but allows custom date in body
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    const response = await fetch(
      `${baseUrl}/api/notifications/check-events?date=${targetDate}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.CRON_SECRET || ''}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to check events: ${response.status} - ${errorText}`,
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Real notification test completed',
      date: targetDate,
      notificationsSent: result.notificationsSent || 0,
      primaryEvent: result.primaryEvent,
      results: result.results || [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Real notification test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
