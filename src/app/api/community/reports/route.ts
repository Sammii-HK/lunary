import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { stripHtmlTags } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_CONTENT_TYPES = ['post', 'question', 'answer'] as const;
const VALID_REASONS = [
  'spam',
  'harassment',
  'harmful',
  'misinformation',
  'other',
] as const;

const MAX_DETAILS_LENGTH = 500;
const AUTO_HIDE_THRESHOLD = 3;

/**
 * POST /api/community/reports
 * Submit a content report. Auth required.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Sign in to report content' },
        { status: 401 },
      );
    }

    // Rate limit: max 10 reports per hour per user
    const rateCheck = checkRateLimit(
      `report:${session.user.id}`,
      10,
      60 * 60_000,
    );
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error:
            'You are submitting reports too quickly. Please try again later.',
        },
        { status: 429 },
      );
    }

    let payload: {
      content_type?: string;
      content_id?: number;
      reason?: string;
      details?: string;
    };
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request payload' },
        { status: 400 },
      );
    }

    const { content_type, content_id, reason, details } = payload;

    if (
      !content_type ||
      !VALID_CONTENT_TYPES.includes(
        content_type as (typeof VALID_CONTENT_TYPES)[number],
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 },
      );
    }

    if (!content_id || typeof content_id !== 'number') {
      return NextResponse.json(
        { error: 'Invalid content ID' },
        { status: 400 },
      );
    }

    if (
      !reason ||
      !VALID_REASONS.includes(reason as (typeof VALID_REASONS)[number])
    ) {
      return NextResponse.json(
        { error: 'Invalid report reason' },
        { status: 400 },
      );
    }

    const sanitizedDetails = details
      ? stripHtmlTags(details, '').trim().slice(0, MAX_DETAILS_LENGTH)
      : null;

    // Verify the content exists
    const contentCheck = await sql`
      SELECT id, user_id FROM community_posts
      WHERE id = ${content_id} LIMIT 1
    `;

    if (contentCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Prevent self-reporting
    if (contentCheck.rows[0].user_id === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot report your own content' },
        { status: 400 },
      );
    }

    // Insert report (unique constraint prevents duplicates)
    try {
      await sql`
        INSERT INTO content_reports (reporter_id, content_type, content_id, reason, details)
        VALUES (${session.user.id}, ${content_type}, ${content_id}, ${reason}, ${sanitizedDetails})
      `;
    } catch (err: any) {
      if (err?.code === '23505') {
        return NextResponse.json(
          { error: 'You have already reported this content' },
          { status: 409 },
        );
      }
      throw err;
    }

    // Auto-hide content when it reaches the report threshold
    const reportCount = await sql`
      SELECT COUNT(*)::int AS count FROM content_reports
      WHERE content_type = ${content_type}
        AND content_id = ${content_id}
        AND status = 'pending'
    `;

    if ((reportCount.rows[0]?.count ?? 0) >= AUTO_HIDE_THRESHOLD) {
      await sql`
        UPDATE community_posts SET is_approved = false
        WHERE id = ${content_id} AND is_approved = true
      `;
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('[community/reports] POST failed', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 },
    );
  }
}
