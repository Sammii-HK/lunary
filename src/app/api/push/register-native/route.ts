import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * Register native push token (FCM)
 *
 * This endpoint stores FCM tokens for native iOS/Android apps.
 * Web push uses VAPID via /api/notifications/subscribe instead.
 *
 * Required database table:
 * CREATE TABLE IF NOT EXISTS native_push_tokens (
 *   id SERIAL PRIMARY KEY,
 *   user_id TEXT NOT NULL,
 *   token TEXT NOT NULL,
 *   platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
 *   timezone TEXT,
 *   is_active BOOLEAN DEFAULT true,
 *   preferences JSONB DEFAULT '{}',
 *   last_notification_sent TIMESTAMP,
 *   created_at TIMESTAMP DEFAULT NOW(),
 *   updated_at TIMESTAMP DEFAULT NOW(),
 *   UNIQUE(user_id, platform)
 * );
 *
 * CREATE INDEX idx_native_push_active ON native_push_tokens(is_active) WHERE is_active = true;
 * CREATE INDEX idx_native_push_user ON native_push_tokens(user_id);
 */

export async function POST(request: NextRequest) {
  try {
    const { userId, token, platform, timezone } = await request.json();

    if (!userId || !token || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, token, platform' },
        { status: 400 },
      );
    }

    if (!['ios', 'android'].includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform. Must be ios or android' },
        { status: 400 },
      );
    }

    console.log('📱 Registering native push token:', {
      userId,
      platform,
      timezone,
      tokenPreview: token.substring(0, 20) + '...',
    });

    // Upsert native push token
    await sql`
      INSERT INTO native_push_tokens (
        user_id,
        token,
        platform,
        timezone,
        is_active,
        created_at,
        updated_at
      ) VALUES (
        ${userId},
        ${token},
        ${platform},
        ${timezone || null},
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (user_id, platform)
      DO UPDATE SET
        token = EXCLUDED.token,
        timezone = EXCLUDED.timezone,
        is_active = true,
        updated_at = NOW()
    `;

    console.log('✅ Native push token registered');

    return NextResponse.json({
      success: true,
      message: 'Token registered successfully',
    });
  } catch (error) {
    console.error('❌ Error registering native push token:', error);

    // Check if error is due to missing table
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('native_push_tokens')) {
      return NextResponse.json(
        {
          error: 'Database table not configured',
          details:
            'native_push_tokens table needs to be created. See route comments for schema.',
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to register token',
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}
