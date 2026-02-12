import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { validateInsightText } from '@/lib/community/moderation';
import { checkRateLimit } from '@/lib/api/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MIN_ANSWER_LENGTH = 10;
const MAX_ANSWER_LENGTH = 2000;

const sanitizeText = (input: string): string =>
  input
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * POST /api/community/questions/[id]/answers
 * Auth required. Submit an answer to a question.
 */
export async function POST(request: NextRequest, context: any) {
  try {
    const params = await context.params;
    const questionId = parseInt(params?.id);

    if (!questionId || isNaN(questionId)) {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 },
      );
    }

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Sign in to answer questions' },
        { status: 401 },
      );
    }

    // Rate limit: max 10 answers per 10 minutes per user
    const rateCheck = checkRateLimit(
      `community-answer:${session.user.id}`,
      10,
      10 * 60_000,
    );
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'You are posting too quickly. Please wait a few minutes.' },
        { status: 429 },
      );
    }

    // Verify question exists
    const questionResult = await sql`
      SELECT id, space_id FROM community_posts
      WHERE id = ${questionId} AND post_type = 'question' AND is_approved = true
      LIMIT 1
    `;

    if (questionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 },
      );
    }

    let payload: { post_text?: string; is_anonymous?: boolean };
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request payload' },
        { status: 400 },
      );
    }

    const postText = sanitizeText(payload.post_text ?? '');

    if (!postText || postText.length < MIN_ANSWER_LENGTH) {
      return NextResponse.json(
        { error: `Answer must be at least ${MIN_ANSWER_LENGTH} characters` },
        { status: 400 },
      );
    }

    if (postText.length > MAX_ANSWER_LENGTH) {
      return NextResponse.json(
        { error: `Answer cannot exceed ${MAX_ANSWER_LENGTH} characters` },
        { status: 400 },
      );
    }

    const moderationCheck = validateInsightText(postText);
    if (!moderationCheck.isValid) {
      return NextResponse.json(
        { error: moderationCheck.error || 'Content validation failed' },
        { status: 400 },
      );
    }

    const isAnonymous =
      typeof payload.is_anonymous === 'boolean' ? payload.is_anonymous : false;

    const spaceId = questionResult.rows[0].space_id;

    const insertResult = await sql`
      INSERT INTO community_posts (space_id, user_id, post_text, is_anonymous, post_type, parent_id)
      VALUES (${spaceId}, ${session.user.id}, ${postText}, ${isAnonymous}, 'answer', ${questionId})
      RETURNING id, post_text, is_anonymous, created_at
    `;

    const answer = insertResult.rows[0];

    return NextResponse.json(
      {
        success: true,
        answer: {
          id: answer.id,
          text: answer.post_text,
          isAnonymous: answer.is_anonymous,
          createdAt: answer.created_at
            ? new Date(answer.created_at).toISOString()
            : null,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[community/questions/:id/answers] POST failed', error);
    return NextResponse.json(
      { error: 'Failed to post answer' },
      { status: 500 },
    );
  }
}
