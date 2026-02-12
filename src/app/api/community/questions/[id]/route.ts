import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/community/questions/[id]
 * Public - single question with answers.
 */
export async function GET(request: NextRequest, context: any) {
  try {
    const params = await context.params;
    const id = parseInt(params?.id);

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 },
      );
    }

    const questionResult = await sql`
      SELECT q.id, q.user_id, q.post_text, q.is_anonymous, q.vote_count, q.topic_tag, q.created_at,
        (SELECT name FROM user_profiles WHERE user_id = q.user_id LIMIT 1) AS author_name
      FROM community_posts q
      WHERE q.id = ${id} AND q.post_type = 'question' AND q.is_approved = true
      LIMIT 1
    `;

    if (questionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 },
      );
    }

    const question = questionResult.rows[0];

    // Fetch answers
    const answersResult = await sql`
      SELECT a.id, a.user_id, a.post_text, a.is_anonymous, a.vote_count, a.best_answer, a.created_at,
        (SELECT name FROM user_profiles WHERE user_id = a.user_id LIMIT 1) AS author_name
      FROM community_posts a
      WHERE a.parent_id = ${id} AND a.post_type = 'answer' AND a.is_approved = true
      ORDER BY a.best_answer DESC, a.vote_count DESC, a.created_at ASC
    `;

    return NextResponse.json(
      {
        question: {
          id: question.id,
          userId: question.user_id,
          text: question.post_text,
          isAnonymous: question.is_anonymous,
          authorName: question.is_anonymous ? null : question.author_name,
          voteCount: question.vote_count ?? 0,
          topicTag: question.topic_tag,
          createdAt: question.created_at
            ? new Date(question.created_at).toISOString()
            : null,
        },
        answers: answersResult.rows.map((row) => ({
          id: row.id,
          userId: row.user_id,
          text: row.post_text,
          isAnonymous: row.is_anonymous,
          authorName: row.is_anonymous ? null : row.author_name,
          voteCount: row.vote_count ?? 0,
          isBestAnswer: row.best_answer ?? false,
          createdAt: row.created_at
            ? new Date(row.created_at).toISOString()
            : null,
        })),
      },
      {
        headers: {
          'Cache-Control':
            'public, s-maxage=30, stale-while-revalidate=15, max-age=30',
        },
      },
    );
  } catch (error) {
    console.error('[community/questions/:id] GET failed', error);
    return NextResponse.json(
      { error: 'Failed to load question' },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/community/questions/[id]
 * Auth required. Mark best answer (only by original poster).
 */
export async function PATCH(request: NextRequest, context: any) {
  try {
    const params = await context.params;
    const id = parseInt(params?.id);

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 },
      );
    }

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    let payload: { best_answer_id?: number };
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request payload' },
        { status: 400 },
      );
    }

    if (!payload.best_answer_id) {
      return NextResponse.json(
        { error: 'Missing best_answer_id' },
        { status: 400 },
      );
    }

    // Verify the user owns the question
    const questionResult = await sql`
      SELECT user_id FROM community_posts
      WHERE id = ${id} AND post_type = 'question'
      LIMIT 1
    `;

    if (questionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 },
      );
    }

    if (questionResult.rows[0].user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the question author can mark the best answer' },
        { status: 403 },
      );
    }

    // Unset previous best answer for this question
    await sql`
      UPDATE community_posts SET best_answer = false
      WHERE parent_id = ${id} AND best_answer = true
    `;

    // Set new best answer
    await sql`
      UPDATE community_posts SET best_answer = true
      WHERE id = ${payload.best_answer_id} AND parent_id = ${id} AND post_type = 'answer'
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[community/questions/:id] PATCH failed', error);
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 },
    );
  }
}
