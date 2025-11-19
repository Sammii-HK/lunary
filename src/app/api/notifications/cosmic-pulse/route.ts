import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const { endpoint, enabled } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 },
      );
    }

    const result = await sql`
      UPDATE push_subscriptions 
      SET preferences = jsonb_set(
        COALESCE(preferences, '{}'::jsonb),
        '{cosmicPulse}',
        ${JSON.stringify(enabled)}::jsonb
      )
      WHERE endpoint = ${endpoint}
      RETURNING endpoint, preferences
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Cosmic pulse ${enabled ? 'enabled' : 'disabled'}`,
      preferences: result.rows[0].preferences,
    });
  } catch (error) {
    console.error('Error toggling cosmic pulse:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

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
    const cosmicPulsePref = preferences.cosmicPulse;
    const enabled =
      cosmicPulsePref === true ||
      cosmicPulsePref === 'true' ||
      cosmicPulsePref === null;

    return NextResponse.json({
      enabled,
    });
  } catch (error) {
    console.error('Error checking cosmic pulse status:', error);
    return NextResponse.json(
      {
        enabled: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
