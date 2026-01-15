import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/get-user-session';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';
const SESSION_WINDOW_MINUTES = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId, pagePath, metadata } = body as {
      userId?: string;
      pagePath?: string;
      metadata?: Record<string, unknown>;
    };

    const currentUser = await getCurrentUser(request);
    const resolvedUserId = userId || currentUser?.id;
    const resolvedEmail = currentUser?.email;

    if (!resolvedUserId) {
      return NextResponse.json({ success: false, skipped: true });
    }

    if (
      resolvedEmail &&
      (resolvedEmail.endsWith('@test.lunary.app') ||
        resolvedEmail === TEST_EMAIL_EXACT)
    ) {
      return NextResponse.json({ success: true, skipped: true });
    }

    const recentSession = await sql`
      SELECT 1
      FROM conversion_events
      WHERE event_type = 'app_opened'
        AND user_id = ${resolvedUserId}
        AND created_at >= NOW() - INTERVAL '${SESSION_WINDOW_MINUTES} minutes'
      LIMIT 1
    `;

    if (recentSession.rows.length > 0) {
      return NextResponse.json({ success: true, skipped: true });
    }

    await sql`
      INSERT INTO conversion_events (
        event_type,
        user_id,
        user_email,
        page_path,
        metadata,
        created_at
      ) VALUES (
        'app_opened',
        ${resolvedUserId},
        ${resolvedEmail || null},
        ${pagePath || null},
        ${metadata ? JSON.stringify(metadata) : null},
        NOW()
      )
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking session:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
