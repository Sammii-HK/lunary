import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      first_touch_source,
      first_touch_medium,
      first_touch_campaign,
      first_touch_keyword,
      first_touch_page,
      first_touch_referrer,
      first_touch_at,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 },
      );
    }

    const firstTouchAt = first_touch_at
      ? new Date(first_touch_at).toISOString()
      : new Date().toISOString();

    await sql`
      INSERT INTO user_attribution (
        user_id,
        first_touch_source,
        first_touch_medium,
        first_touch_campaign,
        first_touch_keyword,
        first_touch_page,
        first_touch_referrer,
        first_touch_at,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content
      ) VALUES (
        ${userId},
        ${first_touch_source || null},
        ${first_touch_medium || null},
        ${first_touch_campaign || null},
        ${first_touch_keyword || null},
        ${first_touch_page || null},
        ${first_touch_referrer || null},
        ${firstTouchAt},
        ${utm_source || null},
        ${utm_medium || null},
        ${utm_campaign || null},
        ${utm_term || null},
        ${utm_content || null}
      )
      ON CONFLICT (user_id) DO NOTHING
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save attribution:', error);
    return NextResponse.json(
      { error: 'Failed to save attribution' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 },
      );
    }

    const result = await sql`
      SELECT * FROM user_attribution WHERE user_id = ${userId}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ attribution: null });
    }

    return NextResponse.json({ attribution: result.rows[0] });
  } catch (error) {
    console.error('Failed to get attribution:', error);
    return NextResponse.json(
      { error: 'Failed to get attribution' },
      { status: 500 },
    );
  }
}
