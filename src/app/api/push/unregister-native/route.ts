import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * Unregister native push token
 *
 * Marks the token as inactive rather than deleting it,
 * allowing for re-registration if user enables notifications again.
 */

export async function POST(request: NextRequest) {
  try {
    const { userId, platform } = await request.json();

    if (!userId || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, platform' },
        { status: 400 },
      );
    }

    console.log('📱 Unregistering native push token:', { userId, platform });

    await sql`
      UPDATE native_push_tokens
      SET is_active = false, updated_at = NOW()
      WHERE user_id = ${userId} AND platform = ${platform}
    `;

    console.log('✅ Native push token unregistered');

    return NextResponse.json({
      success: true,
      message: 'Token unregistered successfully',
    });
  } catch (error) {
    console.error('❌ Error unregistering native push token:', error);
    return NextResponse.json(
      {
        error: 'Failed to unregister token',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
