import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');

    const sessionResponse = await auth.api.getSession({
      headers: new Headers({
        cookie: cookieHeader,
      }),
    });

    if (!sessionResponse?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = sessionResponse.user.id;
    const { birthday, name, email } = await request.json();

    if (!birthday) {
      return NextResponse.json(
        { error: 'Birthday is required' },
        { status: 400 },
      );
    }

    console.log('[sync-profile] Syncing profile data to push subscription:', {
      userId,
      hasBirthday: !!birthday,
      hasName: !!name,
    });

    const result = await sql`
      UPDATE push_subscriptions
      SET preferences = jsonb_set(
        jsonb_set(
          jsonb_set(
            COALESCE(preferences, '{}'::jsonb),
            '{birthday}',
            ${JSON.stringify(birthday)}::jsonb
          ),
          '{name}',
          ${JSON.stringify(name || '')}::jsonb
        ),
        '{cosmicPulse}',
        'true'::jsonb
      ),
      user_email = COALESCE(${email || null}, user_email),
      updated_at = NOW()
      WHERE user_id = ${userId}
      AND is_active = true
      RETURNING endpoint, preferences
    `;

    if (result.rows.length === 0) {
      console.log(
        '[sync-profile] No active subscription found for user:',
        userId,
      );
      return NextResponse.json({
        success: false,
        message:
          'No active push subscription found. Enable notifications first.',
        synced: 0,
      });
    }

    console.log(
      '[sync-profile] Successfully synced profile to',
      result.rows.length,
      'subscriptions',
    );

    return NextResponse.json({
      success: true,
      message: 'Profile synced to push subscription',
      synced: result.rows.length,
      preferences: {
        birthday: '****-**-**',
        name: name ? '***' : null,
        cosmicPulse: true,
      },
    });
  } catch (error) {
    console.error('[sync-profile] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync profile',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
