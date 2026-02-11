import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { validateInsightText } from '@/lib/community/moderation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MAX_OFFSET = 500;
const MIN_POST_LENGTH = 10;
const MAX_POST_LENGTH = 1000;
const MAX_POSTS_PER_USER = 3;

type SortOrder = 'newest' | 'oldest';

const toISODate = (value: string | Date | null | undefined): string | null => {
  if (!value) return null;
  const date =
    value instanceof Date
      ? value
      : new Date(typeof value === 'string' ? value : '');
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const sanitizeText = (input: string): string => {
  return input
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const parseInteger = (
  value: string | null,
  fallback: number,
  max: number,
): number => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.min(parsed, max);
};

/**
 * GET /api/community/spaces/[slug]/posts
 * Public read, paginated, sorted.
 */
export async function GET(request: NextRequest, context: any) {
  try {
    const params = await context.params;
    const slug = params?.slug;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'Invalid space slug' },
        { status: 400 },
      );
    }

    const spaceResult = await sql`
      SELECT id, title, post_count FROM community_spaces WHERE slug = ${slug} LIMIT 1
    `;

    if (spaceResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Community space not found' },
        { status: 404 },
      );
    }

    const spaceId = spaceResult.rows[0].id;
    const { searchParams } = request.nextUrl;
    const limit = Math.max(
      1,
      parseInteger(searchParams.get('limit'), DEFAULT_LIMIT, MAX_LIMIT),
    );
    const offset = parseInteger(searchParams.get('offset'), 0, MAX_OFFSET);
    const sort: SortOrder =
      searchParams.get('sort') === 'oldest' ? 'oldest' : 'newest';

    const totalResult = await sql`
      SELECT COUNT(*)::int AS count
      FROM community_posts
      WHERE space_id = ${spaceId} AND is_approved = true
    `;
    const total = totalResult.rows[0]?.count ?? 0;

    const postsResult =
      sort === 'oldest'
        ? await sql`
            SELECT id, post_text, is_anonymous, created_at
            FROM community_posts
            WHERE space_id = ${spaceId} AND is_approved = true
            ORDER BY created_at ASC
            LIMIT ${limit} OFFSET ${offset}
          `
        : await sql`
            SELECT id, post_text, is_anonymous, created_at
            FROM community_posts
            WHERE space_id = ${spaceId} AND is_approved = true
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;

    return NextResponse.json(
      {
        posts: postsResult.rows.map((row) => ({
          id: row.id,
          postText: row.post_text,
          isAnonymous: row.is_anonymous,
          createdAt: toISODate(row.created_at),
        })),
        total,
        space: {
          id: spaceId,
          title: spaceResult.rows[0].title,
          postCount: Number(spaceResult.rows[0].post_count ?? total),
        },
      },
      {
        headers: {
          'Cache-Control':
            'public, s-maxage=30, stale-while-revalidate=15, max-age=30',
        },
      },
    );
  } catch (error) {
    console.error('[community/spaces/:slug/posts] GET failed', error);
    return NextResponse.json(
      { error: 'Failed to load posts' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/community/spaces/[slug]/posts
 * Create a new post. Requires auth + paid subscription.
 */
export async function POST(request: NextRequest, context: any) {
  try {
    const params = await context.params;
    const slug = params?.slug;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'Invalid space slug' },
        { status: 400 },
      );
    }

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required to post' },
        { status: 401 },
      );
    }

    const spaceResult = await sql`
      SELECT id, is_active FROM community_spaces WHERE slug = ${slug} LIMIT 1
    `;

    if (spaceResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Community space not found' },
        { status: 404 },
      );
    }

    const space = spaceResult.rows[0];
    if (!space.is_active) {
      return NextResponse.json(
        { error: 'This community space is not currently active' },
        { status: 403 },
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

    const moderationCheck = validateInsightText(postText);
    if (!moderationCheck.isValid) {
      return NextResponse.json(
        { error: moderationCheck.error || 'Content validation failed' },
        { status: 400 },
      );
    }

    if (!postText || postText.length < MIN_POST_LENGTH) {
      return NextResponse.json(
        { error: `Post must be at least ${MIN_POST_LENGTH} characters` },
        { status: 400 },
      );
    }

    if (postText.length > MAX_POST_LENGTH) {
      return NextResponse.json(
        { error: `Post cannot exceed ${MAX_POST_LENGTH} characters` },
        { status: 400 },
      );
    }

    const rateResult = await sql`
      SELECT COUNT(*)::int AS count
      FROM community_posts
      WHERE space_id = ${space.id} AND user_id = ${session.user.id}
    `;

    if ((rateResult.rows[0]?.count ?? 0) >= MAX_POSTS_PER_USER) {
      return NextResponse.json(
        { error: 'You have reached the posting limit for this space' },
        { status: 429 },
      );
    }

    const isAnonymous =
      typeof payload.is_anonymous === 'boolean' ? payload.is_anonymous : true;

    const insertResult = await sql`
      INSERT INTO community_posts (space_id, user_id, post_text, is_anonymous)
      VALUES (${space.id}, ${session.user.id}, ${postText}, ${isAnonymous})
      RETURNING id, post_text, is_anonymous, created_at
    `;

    const post = insertResult.rows[0];

    return NextResponse.json(
      {
        success: true,
        post: {
          id: post.id,
          postText: post.post_text,
          isAnonymous: post.is_anonymous,
          createdAt: toISODate(post.created_at),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[community/spaces/:slug/posts] POST failed', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 },
    );
  }
}
