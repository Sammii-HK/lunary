import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Check if tarot notifications are enabled for a subscription
export async function POST(request: NextRequest) {
  try {
    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 },
      );
    }

    const result = await sql`
      SELECT preferences
      FROM push_subscriptions 
      WHERE endpoint = ${endpoint}
      AND is_active = true
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({
        enabled: false,
        message: 'Subscription not found',
      });
    }

    const preferences = result.rows[0].preferences || {};
    const tarotPref = preferences.tarotNotifications;
    const enabled = tarotPref === true || tarotPref === 'true';

    return NextResponse.json({
      enabled,
      hasBirthday: !!preferences.birthday,
    });
  } catch (error) {
    console.error('Error checking tarot notification status:', error);
    return NextResponse.json(
      {
        enabled: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
