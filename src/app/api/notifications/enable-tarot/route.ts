import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { conversionTracking } from '@/lib/analytics';

// This endpoint allows users to enable personalized tarot notifications
// and store their personal data (birthday, name) in subscription preferences
export async function POST(request: NextRequest) {
  try {
    const { endpoint, birthday, name, userId } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 },
      );
    }

    if (!birthday) {
      return NextResponse.json(
        { error: 'Birthday is required for personalized tarot notifications' },
        { status: 400 },
      );
    }

    console.log('[enable-tarot] Looking for subscription:', {
      endpoint: endpoint.substring(0, 50) + '...',
      userId,
    });

    // First try to find by endpoint
    let result = await sql`
      SELECT endpoint, preferences, user_id
      FROM push_subscriptions 
      WHERE endpoint = ${endpoint}
      AND is_active = true
    `;

    // If not found by endpoint and we have userId, try by user_id
    if (result.rows.length === 0 && userId) {
      console.log(
        '[enable-tarot] Not found by endpoint, trying user_id:',
        userId,
      );
      result = await sql`
        SELECT endpoint, preferences, user_id
        FROM push_subscriptions 
        WHERE user_id = ${userId}
        AND is_active = true
        ORDER BY updated_at DESC
        LIMIT 1
      `;
    }

    if (result.rows.length === 0) {
      console.error('[enable-tarot] Subscription not found:', {
        endpoint: endpoint.substring(0, 50) + '...',
        userId,
      });
      return NextResponse.json(
        {
          error:
            'Push subscription not found. Please ensure push notifications are enabled and try refreshing the page.',
          debug: {
            searchedByEndpoint: true,
            searchedByUserId: !!userId,
          },
        },
        { status: 404 },
      );
    }

    const foundEndpoint = result.rows[0].endpoint;
    console.log(
      '[enable-tarot] Found subscription:',
      foundEndpoint.substring(0, 50) + '...',
    );

    // Update the subscription preferences to enable tarot notifications
    // and store user data
    let updateResult;
    if (name) {
      updateResult = await sql`
        UPDATE push_subscriptions 
        SET preferences = jsonb_set(
          jsonb_set(
            jsonb_set(
              COALESCE(preferences, '{}'::jsonb),
              '{tarotNotifications}',
              to_jsonb(true)
            ),
            '{birthday}',
            ${JSON.stringify(birthday)}::jsonb
          ),
          '{name}',
          ${JSON.stringify(name)}::jsonb
        )
        WHERE endpoint = ${foundEndpoint}
        RETURNING endpoint, preferences
      `;
    } else {
      updateResult = await sql`
        UPDATE push_subscriptions 
        SET preferences = jsonb_set(
          jsonb_set(
            COALESCE(preferences, '{}'::jsonb),
            '{tarotNotifications}',
            to_jsonb(true)
          ),
          '{birthday}',
          ${JSON.stringify(birthday)}::jsonb
        )
        WHERE endpoint = ${foundEndpoint}
        RETURNING endpoint, preferences
      `;
    }

    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update subscription preferences' },
        { status: 500 },
      );
    }

    // Track notification preference change
    conversionTracking.notificationPreferenceChanged(
      userId,
      'tarot',
      true,
    );

    return NextResponse.json({
      success: true,
      message: 'Personalized tarot notifications enabled',
      preferences: updateResult.rows[0].preferences,
    });
  } catch (error) {
    console.error('Error enabling tarot notifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { endpoint, userId } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 },
      );
    }

    // Disable tarot notifications
    const result = await sql`
      UPDATE push_subscriptions 
      SET preferences = jsonb_set(
        COALESCE(preferences, '{}'::jsonb),
        '{tarotNotifications}',
        to_jsonb(false)
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

    // Track notification preference change
    conversionTracking.notificationPreferenceChanged(
      userId,
      'tarot',
      false,
    );

    return NextResponse.json({
      success: true,
      message: 'Personalized tarot notifications disabled',
    });
  } catch (error) {
    console.error('Error disabling tarot notifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
