import { NextRequest, NextResponse } from 'next/server';
import { getStoredSubscriptionData } from '../../../../../utils/subscription';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (customerId) {
      // Get specific customer data
      const data = getStoredSubscriptionData(customerId);
      return NextResponse.json({
        customerId,
        found: !!data,
        data: data || null,
      });
    }

    // List all stored subscription data (for debugging)
    return NextResponse.json({
      message: 'Debug endpoint - stored subscription data',
      note: 'Add ?customerId=cus_xxx to get specific customer data',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in debug subscriptions route:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription data' },
      { status: 500 },
    );
  }
}
