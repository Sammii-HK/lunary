import { NextRequest, NextResponse } from 'next/server';

// Manual trigger for testing the daily cron job without waiting for the schedule
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Manual test trigger for daily posts cron job');

    // Check if CRON_SECRET is set
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      console.warn('⚠️ CRON_SECRET not set in environment variables');
      return NextResponse.json(
        {
          testTrigger: true,
          success: false,
          error: 'CRON_SECRET environment variable is not set',
          message: 'Please set CRON_SECRET in your environment variables',
        },
        { status: 500 },
      );
    }

    // Get the base URL
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : request.nextUrl.origin;

    console.log('🧪 Calling cron endpoint with Authorization header');

    // Call the actual cron endpoint
    const cronResponse = await fetch(`${baseUrl}/api/cron/daily-posts`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cronSecret}`,
        'User-Agent': 'Manual-Test-Trigger/1.0',
      },
    });

    if (!cronResponse.ok) {
      const errorResult = await cronResponse
        .json()
        .catch(() => ({ error: 'Failed to parse error response' }));
      console.error('🧪 Cron endpoint returned error:', {
        status: cronResponse.status,
        error: errorResult,
      });
      return NextResponse.json(
        {
          testTrigger: true,
          success: false,
          cronStatus: cronResponse.status,
          error: errorResult.error || 'Unknown error',
          message:
            errorResult.message ||
            `Cron endpoint returned ${cronResponse.status}`,
        },
        { status: cronResponse.status },
      );
    }

    const cronResult = await cronResponse.json();

    console.log('🧪 Manual test result:', {
      status: cronResponse.status,
      success: cronResult.success,
      message: cronResult.message,
    });

    return NextResponse.json({
      testTrigger: true,
      cronStatus: cronResponse.status,
      cronResult: cronResult,
      message: 'Manual test trigger completed - check logs for details',
    });
  } catch (error) {
    console.error('🧪 Manual test trigger failed:', error);
    return NextResponse.json(
      {
        testTrigger: true,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// POST endpoint to test with specific parameters
export async function POST(request: NextRequest) {
  try {
    const { date, testMode } = await request.json();

    console.log('🧪 Manual test with parameters:', { date, testMode });

    // You can add custom test logic here
    return NextResponse.json({
      message: 'Custom test endpoint - implement specific test logic here',
      parameters: { date, testMode },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 },
    );
  }
}
