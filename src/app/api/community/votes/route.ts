import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/community/votes
 * Auth required. Toggle upvote on a post.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Sign in to vote' }, { status: 401 });
    }

    let payload: { post_id?: number };
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request payload' },
        { status: 400 },
      );
    }

    const postId = payload.post_id;
    if (!postId || typeof postId !== 'number') {
      return NextResponse.json(
        { error: 'Missing or invalid post_id' },
        { status: 400 },
      );
    }

    // Per-post cooldown: max 1 vote toggle per post per 5 seconds
    const cooldown = checkRateLimit(
      `vote:${session.user.id}:${postId}`,
      1,
      5_000,
    );
    if (!cooldown.allowed) {
      return NextResponse.json(
        { error: 'Please wait a moment before voting on this post again' },
        { status: 429 },
      );
    }

    // Velocity limit: max 30 vote actions per 5 minutes
    const velocity = checkRateLimit(
      `vote-velocity:${session.user.id}`,
      30,
      5 * 60_000,
    );
    if (!velocity.allowed) {
      return NextResponse.json(
        { error: 'You are voting too quickly. Please slow down.' },
        { status: 429 },
      );
    }

    // Check if post exists
    const postResult = await sql`
      SELECT id FROM community_posts WHERE id = ${postId} LIMIT 1
    `;

    if (postResult.rows.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check existing vote
    const existingVote = await sql`
      SELECT id FROM community_votes
      WHERE post_id = ${postId} AND user_id = ${session.user.id}
      LIMIT 1
    `;

    if (existingVote.rows.length > 0) {
      // Remove vote (toggle off)
      await sql`
        DELETE FROM community_votes
        WHERE post_id = ${postId} AND user_id = ${session.user.id}
      `;
      await sql`
        UPDATE community_posts SET vote_count = GREATEST(COALESCE(vote_count, 0) - 1, 0)
        WHERE id = ${postId}
      `;

      return NextResponse.json({ voted: false });
    } else {
      // Add vote
      await sql`
        INSERT INTO community_votes (post_id, user_id, vote)
        VALUES (${postId}, ${session.user.id}, 1)
      `;
      await sql`
        UPDATE community_posts SET vote_count = COALESCE(vote_count, 0) + 1
        WHERE id = ${postId}
      `;

      return NextResponse.json({ voted: true });
    }
  } catch (error) {
    console.error('[community/votes] POST failed', error);
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 },
    );
  }
}
