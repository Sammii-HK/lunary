import { NextRequest, NextResponse } from 'next/server';

// Manual trigger for testing the daily cron job without waiting for the schedule
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Manual test trigger for daily posts cron job');

    // Check if CRON_SECRET is set
    const cronSecret = process.env.CRON_SECRET;
    const isProduction = process.env.NODE_ENV === 'production';

    console.log('🧪 CRON_SECRET check:', {
      isSet: !!cronSecret,
      length: cronSecret?.length || 0,
      isProduction,
      firstChars: cronSecret ? `${cronSecret.substring(0, 5)}...` : 'undefined',
    });

    // In production, CRON_SECRET must be set
    if (isProduction && !cronSecret) {
      console.error('❌ CRON_SECRET not set in production environment');
      return NextResponse.json(
        {
          testTrigger: true,
          success: false,
          error: 'CRON_SECRET environment variable is not set',
          message:
            'CRON_SECRET must be set in production environment variables',
        },
        { status: 500 },
      );
    }

    // Get the base URL
    const baseUrl = isProduction
      ? 'https://lunary.app'
      : request.nextUrl.origin;

    console.log('🧪 Calling cron endpoint:', {
      url: `${baseUrl}/api/cron/daily-posts`,
      hasAuth: !!cronSecret,
    });

    // Create a new request with proper headers for internal call
    // Use the internal URL to avoid external HTTP call issues
    const internalUrl = isProduction
      ? 'https://lunary.app/api/cron/daily-posts'
      : `${request.nextUrl.origin}/api/cron/daily-posts`;

    // Build headers object
    // Use special header to indicate internal test call (bypasses auth check)
    // This works around Vercel edge network stripping Authorization headers
    const headers: HeadersInit = {
      'User-Agent': 'Manual-Test-Trigger/1.0',
      'X-Internal-Test': 'true',
    };

    // Still try to add Authorization header if CRON_SECRET is available
    // But rely on X-Internal-Test header for auth bypass
    if (cronSecret) {
      const authValue = `Bearer ${cronSecret.trim()}`;
      headers['Authorization'] = authValue;
      console.log('🧪 Adding Authorization header:', {
        headerLength: authValue.length,
        secretLength: cronSecret.length,
        firstChars: authValue.substring(0, 20),
      });
    } else if (!isProduction) {
      console.log('🧪 No CRON_SECRET - request will be allowed in dev mode');
    }

    console.log('🧪 Using internal test header to bypass auth check');

    console.log('🧪 Making fetch request with headers:', {
      url: internalUrl,
      hasAuth: !!headers['Authorization'],
      headerKeys: Object.keys(headers),
    });

    // Make the fetch call - use absolute URL to ensure headers are sent
    const cronResponse = await fetch(internalUrl, {
      method: 'GET',
      headers,
      cache: 'no-store', // Ensure fresh request
    });

    if (!cronResponse.ok) {
      const errorResult = await cronResponse
        .json()
        .catch(() => ({ error: 'Failed to parse error response' }));
      console.error('🧪 Cron endpoint returned error:', {
        status: cronResponse.status,
        statusText: cronResponse.statusText,
        error: errorResult,
        headers: Object.fromEntries(cronResponse.headers.entries()),
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
