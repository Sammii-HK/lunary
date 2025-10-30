import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const { subscription, preferences, userId, userEmail } = await request.json();
    
    if (!subscription?.endpoint || !subscription?.keys) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    console.log('📱 Saving push subscription to PostgreSQL:', {
      endpoint: subscription.endpoint.substring(0, 50) + '...',
      userId,
      userEmail,
      preferences,
    });

    // Save to PostgreSQL for server-side notifications
    await sql`
      INSERT INTO push_subscriptions (
        user_id, 
        user_email, 
        endpoint, 
        p256dh, 
        auth, 
        preferences,
        user_agent
      ) VALUES (
        ${userId || null},
        ${userEmail || null},
        ${subscription.endpoint},
        ${subscription.keys.p256dh},
        ${subscription.keys.auth},
        ${JSON.stringify(preferences)},
        ${request.headers.get('user-agent')}
      )
      ON CONFLICT (endpoint) 
      DO UPDATE SET
        user_id = EXCLUDED.user_id,
        user_email = EXCLUDED.user_email,
        p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth,
        preferences = EXCLUDED.preferences,
        updated_at = NOW(),
        is_active = true
    `;

    console.log('✅ Push subscription saved to PostgreSQL');

    return NextResponse.json({ 
      success: true,
      message: 'Subscription saved successfully'
    });
  } catch (error) {
    console.error('❌ Error saving subscription:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
