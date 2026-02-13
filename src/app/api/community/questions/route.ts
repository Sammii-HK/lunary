import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { validateInsightText } from '@/lib/community/moderation';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { QUESTION_LIMITS } from '@utils/entitlements';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MIN_QUESTION_LENGTH = 15;
const MAX_QUESTION_LENGTH = 1000;
const VALID_TOPICS = [
  'transits',
  'relationships',
  'tarot',
  'career',
  'general',
] as const;
type TopicTag = (typeof VALID_TOPICS)[number];

const sanitizeText = (input: string): string =>
  input
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * GET /api/community/questions
 * Public - list questions (paginated, filterable, sortable).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const limit = Math.min(
      parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT)),
      MAX_LIMIT,
    );
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);
    const sort = searchParams.get('sort') === 'new' ? 'new' : 'top';
    const topic = searchParams.get('topic') as TopicTag | null;

    // Get the Q&A space
    const spaceResult = await sql`
      SELECT id FROM community_spaces WHERE slug = 'ask-the-circle' LIMIT 1
    `;

    if (spaceResult.rows.length === 0) {
      return NextResponse.json({ questions: [], total: 0 });
    }

    const spaceId = spaceResult.rows[0].id;

    // Build query with optional topic filter
    const topicFilter = topic && VALID_TOPICS.includes(topic) ? topic : null;

    const countResult = topicFilter
      ? await sql`
          SELECT COUNT(*)::int AS count FROM community_posts
          WHERE space_id = ${spaceId} AND post_type = 'question' AND is_approved = true AND topic_tag = ${topicFilter}
        `
      : await sql`
          SELECT COUNT(*)::int AS count FROM community_posts
          WHERE space_id = ${spaceId} AND post_type = 'question' AND is_approved = true
        `;

    const total = countResult.rows[0]?.count ?? 0;

    // Fetch questions with answer count
    const questionsResult =
      sort === 'new'
        ? topicFilter
          ? await sql`
              SELECT q.id, q.user_id, q.post_text, q.is_anonymous, q.vote_count, q.topic_tag, q.created_at,
                (SELECT COUNT(*)::int FROM community_posts a WHERE a.parent_id = q.id AND a.post_type = 'answer') AS answer_count,
                (SELECT name FROM user_profiles WHERE user_id = q.user_id LIMIT 1) AS author_name
              FROM community_posts q
              WHERE q.space_id = ${spaceId} AND q.post_type = 'question' AND q.is_approved = true AND q.topic_tag = ${topicFilter}
              ORDER BY q.created_at DESC
              LIMIT ${limit} OFFSET ${offset}
            `
          : await sql`
              SELECT q.id, q.user_id, q.post_text, q.is_anonymous, q.vote_count, q.topic_tag, q.created_at,
                (SELECT COUNT(*)::int FROM community_posts a WHERE a.parent_id = q.id AND a.post_type = 'answer') AS answer_count,
                (SELECT name FROM user_profiles WHERE user_id = q.user_id LIMIT 1) AS author_name
              FROM community_posts q
              WHERE q.space_id = ${spaceId} AND q.post_type = 'question' AND q.is_approved = true
              ORDER BY q.created_at DESC
              LIMIT ${limit} OFFSET ${offset}
            `
        : topicFilter
          ? await sql`
              SELECT q.id, q.user_id, q.post_text, q.is_anonymous, q.vote_count, q.topic_tag, q.created_at,
                (SELECT COUNT(*)::int FROM community_posts a WHERE a.parent_id = q.id AND a.post_type = 'answer') AS answer_count,
                (SELECT name FROM user_profiles WHERE user_id = q.user_id LIMIT 1) AS author_name
              FROM community_posts q
              WHERE q.space_id = ${spaceId} AND q.post_type = 'question' AND q.is_approved = true AND q.topic_tag = ${topicFilter}
              ORDER BY q.vote_count DESC, q.created_at DESC
              LIMIT ${limit} OFFSET ${offset}
            `
          : await sql`
              SELECT q.id, q.user_id, q.post_text, q.is_anonymous, q.vote_count, q.topic_tag, q.created_at,
                (SELECT COUNT(*)::int FROM community_posts a WHERE a.parent_id = q.id AND a.post_type = 'answer') AS answer_count,
                (SELECT name FROM user_profiles WHERE user_id = q.user_id LIMIT 1) AS author_name
              FROM community_posts q
              WHERE q.space_id = ${spaceId} AND q.post_type = 'question' AND q.is_approved = true
              ORDER BY q.vote_count DESC, q.created_at DESC
              LIMIT ${limit} OFFSET ${offset}
            `;

    return NextResponse.json(
      {
        questions: questionsResult.rows.map((row) => ({
          id: row.id,
          text: row.post_text,
          isAnonymous: row.is_anonymous,
          authorName: row.is_anonymous ? null : row.author_name,
          voteCount: row.vote_count ?? 0,
          answerCount: row.answer_count ?? 0,
          topicTag: row.topic_tag,
          createdAt: row.created_at
            ? new Date(row.created_at).toISOString()
            : null,
        })),
        total,
      },
      {
        headers: {
          'Cache-Control':
            'public, s-maxage=30, stale-while-revalidate=15, max-age=30',
        },
      },
    );
  } catch (error) {
    console.error('[community/questions] GET failed', error);
    return NextResponse.json(
      { error: 'Failed to load questions' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/community/questions
 * Auth required. Rate-limited: 2/week free, unlimited paid.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Sign in to ask a question' },
        { status: 401 },
      );
    }

    // Rate limit: max 5 questions per 10 minutes per user
    const rateCheck = checkRateLimit(
      `community-question:${session.user.id}`,
      5,
      10 * 60_000,
    );
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'You are posting too quickly. Please wait a few minutes.' },
        { status: 429 },
      );
    }

    const spaceResult = await sql`
      SELECT id FROM community_spaces WHERE slug = 'ask-the-circle' LIMIT 1
    `;

    if (spaceResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Q&A space not found' },
        { status: 404 },
      );
    }

    const spaceId = spaceResult.rows[0].id;

    let payload: {
      post_text?: string;
      is_anonymous?: boolean;
      topic_tag?: string;
    };
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request payload' },
        { status: 400 },
      );
    }

    const postText = sanitizeText(payload.post_text ?? '');

    if (!postText || postText.length < MIN_QUESTION_LENGTH) {
      return NextResponse.json(
        {
          error: `Question must be at least ${MIN_QUESTION_LENGTH} characters`,
        },
        { status: 400 },
      );
    }

    if (postText.length > MAX_QUESTION_LENGTH) {
      return NextResponse.json(
        { error: `Question cannot exceed ${MAX_QUESTION_LENGTH} characters` },
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

    // Rate limit: check subscription status
    const subResult = await sql`
      SELECT status FROM subscriptions
      WHERE user_id = ${session.user.id} AND status IN ('active', 'trial')
      LIMIT 1
    `;

    const isPaid = subResult.rows.length > 0;

    if (!isPaid) {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const countResult = await sql`
        SELECT COUNT(*)::int AS count FROM community_posts
        WHERE user_id = ${session.user.id} AND post_type = 'question' AND created_at > ${weekAgo.toISOString()}
      `;

      if ((countResult.rows[0]?.count ?? 0) >= QUESTION_LIMITS.freePerWeek) {
        return NextResponse.json(
          {
            error: `Free accounts can ask ${QUESTION_LIMITS.freePerWeek} questions per week. Upgrade for unlimited questions.`,
          },
          { status: 429 },
        );
      }
    }

    const topicTag =
      payload.topic_tag && VALID_TOPICS.includes(payload.topic_tag as TopicTag)
        ? payload.topic_tag
        : 'general';

    const isAnonymous =
      typeof payload.is_anonymous === 'boolean' ? payload.is_anonymous : true;

    const insertResult = await sql`
      INSERT INTO community_posts (space_id, user_id, post_text, is_anonymous, post_type, topic_tag)
      VALUES (${spaceId}, ${session.user.id}, ${postText}, ${isAnonymous}, 'question', ${topicTag})
      RETURNING id, post_text, is_anonymous, topic_tag, created_at
    `;

    const post = insertResult.rows[0];

    return NextResponse.json(
      {
        success: true,
        question: {
          id: post.id,
          text: post.post_text,
          isAnonymous: post.is_anonymous,
          topicTag: post.topic_tag,
          createdAt: post.created_at
            ? new Date(post.created_at).toISOString()
            : null,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[community/questions] POST failed', error);
    return NextResponse.json(
      { error: 'Failed to post question' },
      { status: 500 },
    );
  }
}
