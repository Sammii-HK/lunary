import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// This endpoint allows users to enable personalized tarot notifications
// and store their personal data (birthday, name) in subscription preferences
export async function POST(request: NextRequest) {
  try {
    const { endpoint, birthday, name } = await request.json();

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

    // Update the subscription preferences to enable tarot notifications
    // and store user data
    let result;
    if (name) {
      result = await sql`
        UPDATE push_subscriptions 
        SET preferences = jsonb_set(
          jsonb_set(
            jsonb_set(
              COALESCE(preferences, '{}'::jsonb),
              '{tarotNotifications}',
              true::jsonb
            ),
            '{birthday}',
            ${JSON.stringify(birthday)}::jsonb
          ),
          '{name}',
          ${JSON.stringify(name)}::jsonb
        )
        WHERE endpoint = ${endpoint}
        RETURNING endpoint, preferences
      `;
    } else {
      result = await sql`
        UPDATE push_subscriptions 
        SET preferences = jsonb_set(
          jsonb_set(
            COALESCE(preferences, '{}'::jsonb),
            '{tarotNotifications}',
            true::jsonb
          ),
          '{birthday}',
          ${JSON.stringify(birthday)}::jsonb
        )
        WHERE endpoint = ${endpoint}
        RETURNING endpoint, preferences
      `;
    }

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Personalized tarot notifications enabled',
      preferences: result.rows[0].preferences,
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
    const { endpoint } = await request.json();

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
        false::jsonb
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
