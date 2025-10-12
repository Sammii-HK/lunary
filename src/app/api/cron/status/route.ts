import { NextRequest, NextResponse } from 'next/server';

/**
 * Cron Status Endpoint - Check if cron jobs are working
 * Hit this manually to see cron job status and logs
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Cron Status Check at:', new Date().toISOString());

    // Check environment variables
    const cronSecret = process.env.CRON_SECRET;
    const succulentKey = process.env.SUCCULENT_SECRET_KEY;
    const accountGroupId = process.env.SUCCULENT_ACCOUNT_GROUP_ID;

    console.log('🔍 Environment check:', {
      hasCronSecret: !!cronSecret,
      hasSucculentKey: !!succulentKey,
      hasAccountGroupId: !!accountGroupId,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    });

    // Test if we can reach the cosmic content API
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://lunary.app';

    console.log('🌐 Testing cosmic content API...');
    const cosmicResponse = await fetch(
      `${baseUrl}/api/og/cosmic-post?date=${dateStr}`,
    );

    const cosmicTest = {
      url: `${baseUrl}/api/og/cosmic-post?date=${dateStr}`,
      status: cosmicResponse.status,
      ok: cosmicResponse.ok,
    };

    console.log('🌟 Cosmic API test:', cosmicTest);

    // Return status info
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        hasCronSecret: !!cronSecret,
        hasSucculentKey: !!succulentKey,
        hasAccountGroupId: !!accountGroupId,
        accountGroupId: accountGroupId,
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
      },
      cosmicApiTest: cosmicTest,
      nextCronRun: 'Check Vercel dashboard for cron job logs',
      instructions: [
        '1. Check Vercel Dashboard → Functions → Cron Jobs',
        '2. Look for /api/cron/daily-posts execution logs',
        '3. Verify CRON_SECRET is set in environment variables',
        '4. Ensure cron job is enabled in vercel.json',
      ],
    });
  } catch (error) {
    console.error('❌ Cron status check failed:', error);
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
