import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAuth } from '@/lib/get-user-session';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      anonymous_id,
      anonymousId,
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

    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    if (authResult.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const resolvedAnonymousId =
      typeof anonymous_id === 'string'
        ? anonymous_id
        : typeof anonymousId === 'string'
          ? anonymousId
          : null;

    const firstTouchAt = first_touch_at
      ? new Date(first_touch_at).toISOString()
      : new Date().toISOString();

    await sql`
      INSERT INTO user_attribution (
        user_id,
        anonymous_id,
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
        ${resolvedAnonymousId},
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
      ON CONFLICT (user_id) DO UPDATE
      SET
        anonymous_id = COALESCE(user_attribution.anonymous_id, EXCLUDED.anonymous_id),
        first_touch_source = COALESCE(user_attribution.first_touch_source, EXCLUDED.first_touch_source),
        first_touch_medium = COALESCE(user_attribution.first_touch_medium, EXCLUDED.first_touch_medium),
        first_touch_campaign = COALESCE(user_attribution.first_touch_campaign, EXCLUDED.first_touch_campaign),
        first_touch_keyword = COALESCE(user_attribution.first_touch_keyword, EXCLUDED.first_touch_keyword),
        first_touch_page = COALESCE(user_attribution.first_touch_page, EXCLUDED.first_touch_page),
        first_touch_referrer = COALESCE(user_attribution.first_touch_referrer, EXCLUDED.first_touch_referrer),
        first_touch_at = COALESCE(user_attribution.first_touch_at, EXCLUDED.first_touch_at),
        utm_source = COALESCE(user_attribution.utm_source, EXCLUDED.utm_source),
        utm_medium = COALESCE(user_attribution.utm_medium, EXCLUDED.utm_medium),
        utm_campaign = COALESCE(user_attribution.utm_campaign, EXCLUDED.utm_campaign),
        utm_term = COALESCE(user_attribution.utm_term, EXCLUDED.utm_term),
        utm_content = COALESCE(user_attribution.utm_content, EXCLUDED.utm_content),
        updated_at = NOW()
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

    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    if (authResult.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
