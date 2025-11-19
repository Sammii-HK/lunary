import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export interface NotificationPreferences {
  frequency?: 'realtime' | 'daily' | 'weekly' | 'digest';
  quietHours?: { start: number; end: number };
  groupNotifications?: boolean;
  personalizedInsights?: boolean;
  engagementReminders?: boolean;
  maxNotificationsPerDay?: number;
  moonPhases?: boolean;
  planetaryTransits?: boolean;
  retrogrades?: boolean;
  sabbats?: boolean;
  eclipses?: boolean;
  majorAspects?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const userId = searchParams.get('userId');

    if (!endpoint && !userId) {
      return NextResponse.json(
        { error: 'endpoint or userId required' },
        { status: 400 },
      );
    }

    let result;
    if (endpoint) {
      result = await sql`
        SELECT preferences
        FROM push_subscriptions
        WHERE endpoint = ${endpoint}
        AND is_active = true
        LIMIT 1
      `;
    } else {
      result = await sql`
        SELECT preferences
        FROM push_subscriptions
        WHERE user_id = ${userId}
        AND is_active = true
        LIMIT 1
      `;
    }

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 },
      );
    }

    const preferences = result.rows[0].preferences || {};

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch preferences',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      endpoint,
      userId,
      preferences,
    }: {
      endpoint?: string;
      userId?: string;
      preferences: NotificationPreferences;
    } = await request.json();

    if (!endpoint && !userId) {
      return NextResponse.json(
        { error: 'endpoint or userId required' },
        { status: 400 },
      );
    }

    if (!preferences) {
      return NextResponse.json(
        { error: 'preferences required' },
        { status: 400 },
      );
    }

    let result;
    if (endpoint) {
      result = await sql`
        UPDATE push_subscriptions
        SET preferences = ${JSON.stringify(preferences)}::jsonb,
            updated_at = NOW()
        WHERE endpoint = ${endpoint}
        AND is_active = true
        RETURNING endpoint, preferences
      `;
    } else {
      result = await sql`
        UPDATE push_subscriptions
        SET preferences = ${JSON.stringify(preferences)}::jsonb,
            updated_at = NOW()
        WHERE user_id = ${userId}
        AND is_active = true
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
      preferences: result.rows[0].preferences,
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      {
        error: 'Failed to update preferences',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
