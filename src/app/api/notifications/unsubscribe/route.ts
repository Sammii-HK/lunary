import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 },
      );
    }

    console.log(
      'Removing push subscription:',
      endpoint.substring(0, 50) + '...',
    );

    await sql`
      UPDATE push_subscriptions
      SET is_active = false,
          updated_at = NOW()
      WHERE endpoint = ${endpoint}
    `;

    console.log('✅ Push subscription deactivated in PostgreSQL');

    return NextResponse.json({
      success: true,
      message: 'Subscription removed successfully',
    });
  } catch (error) {
    console.error('Error removing subscription:', error);
    return NextResponse.json(
      {
        error: 'Failed to remove subscription',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
