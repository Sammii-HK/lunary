import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const {
      event,
      userId,
      userEmail,
      planType,
      trialDaysRemaining,
      featureName,
      pagePath,
      metadata,
    } = data;

    await sql`
      INSERT INTO conversion_events (
        event_type,
        user_id,
        user_email,
        plan_type,
        trial_days_remaining,
        feature_name,
        page_path,
        metadata,
        created_at
      ) VALUES (
        ${event},
        ${userId || null},
        ${userEmail || null},
        ${planType || null},
        ${trialDaysRemaining || null},
        ${featureName || null},
        ${pagePath || null},
        ${metadata ? JSON.stringify(metadata) : null},
        NOW()
      )
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking conversion event:', error);

    if (
      error instanceof Error &&
      error.message.includes('relation "conversion_events" does not exist')
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conversion events table not initialized',
          message:
            'Run the database setup script to create the conversion_events table',
        },
        { status: 500 },
      );
    }

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
    const eventType = searchParams.get('event');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = sql`
      SELECT 
        id,
        event_type,
        user_id,
        user_email,
        plan_type,
        trial_days_remaining,
        feature_name,
        page_path,
        metadata,
        created_at
      FROM conversion_events
      WHERE 1=1
    `;

    if (eventType) {
      query = sql`
        ${query}
        AND event_type = ${eventType}
      `;
    }

    if (userId) {
      query = sql`
        ${query}
        AND user_id = ${userId}
      `;
    }

    query = sql`
      ${query}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    const result = await query;

    return NextResponse.json({
      success: true,
      events: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching conversion events:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
