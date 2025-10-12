import { NextRequest, NextResponse } from 'next/server';

/**
 * Manual Cron Test - Trigger the daily post logic manually for testing
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Manual cron test started at:', new Date().toISOString());
    
    // Get today's date
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : (typeof window !== 'undefined' ? window.location.origin : 'https://lunary.app');
    
    console.log('📅 Testing post for date:', dateStr);
    
    // Call the actual cron endpoint (without auth check)
    const cronUrl = `${baseUrl}/api/cron/daily-posts`;
    
    // Create a test request with the cron secret
    const cronResponse = await fetch(cronUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'test'}`,
      },
    });
    
    const cronResult = await cronResponse.json();
    
    console.log('🔍 Cron test result:', {
      status: cronResponse.status,
      ok: cronResponse.ok,
      result: cronResult,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Manual cron test completed',
      cronResponse: {
        status: cronResponse.status,
        ok: cronResponse.ok,
        result: cronResult,
      },
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('❌ Manual cron test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
