import { NextRequest, NextResponse } from 'next/server';
import {
  syncSubscriptionToProfile,
  getStoredSubscriptionData,
} from '../../../../utils/subscription';

export async function POST(request: NextRequest) {
  try {
    const { customerId, userId } = await request.json();

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 },
      );
    }

    // Check if we have subscription data for this customer
    const subscriptionData = getStoredSubscriptionData(customerId);
    if (!subscriptionData) {
      return NextResponse.json(
        { error: 'No subscription data found for this customer' },
        { status: 404 },
      );
    }

    console.log('Sync request received:', {
      customerId,
      userId,
      subscriptionData,
    });

    // In a real implementation, you would:
    // 1. Find the user's Jazz profile by userId
    // 2. Call syncSubscriptionToProfile with the actual profile
    // For now, we'll return the data that would be synced

    return NextResponse.json({
      success: true,
      message: 'Subscription data ready for sync',
      data: subscriptionData,
      instructions:
        'Call syncSubscriptionToProfile() with your Jazz profile object',
    });
  } catch (error) {
    console.error('Error in sync-subscription route:', error);
    return NextResponse.json(
      { error: 'Failed to sync subscription data' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 },
      );
    }

    const subscriptionData = getStoredSubscriptionData(customerId);

    return NextResponse.json({
      customerId,
      hasData: !!subscriptionData,
      data: subscriptionData || null,
    });
  } catch (error) {
    console.error('Error getting subscription data:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription data' },
      { status: 500 },
    );
  }
}
