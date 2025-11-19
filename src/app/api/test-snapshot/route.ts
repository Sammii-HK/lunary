import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('🔍 TEST ROUTE HIT - /api/test-snapshot');
  return NextResponse.json({
    success: true,
    message: 'Test route is working',
    timestamp: new Date().toISOString(),
  });
}
