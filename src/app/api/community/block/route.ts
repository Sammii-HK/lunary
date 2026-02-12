import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/community/block
 * Block a user. Their content will be hidden from your feeds.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const rateCheck = checkRateLimit(
      `block:${session.user.id}`,
      20,
      60 * 60_000,
    );
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many block actions. Please try again later.' },
        { status: 429 },
      );
    }

    let payload: { user_id?: string };
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request payload' },
        { status: 400 },
      );
    }

    const blockedId = payload.user_id;
    if (!blockedId || typeof blockedId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid user_id' },
        { status: 400 },
      );
    }

    if (blockedId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot block yourself' },
        { status: 400 },
      );
    }

    try {
      await sql`
        INSERT INTO blocked_users (blocker_id, blocked_id)
        VALUES (${session.user.id}, ${blockedId})
        ON CONFLICT (blocker_id, blocked_id) DO NOTHING
      `;
    } catch (err) {
      console.error('[community/block] Insert failed', err);
      return NextResponse.json(
        { error: 'Failed to block user' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, blocked: true }, { status: 201 });
  } catch (error) {
    console.error('[community/block] POST failed', error);
    return NextResponse.json(
      { error: 'Failed to block user' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/community/block
 * Unblock a user.
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    let payload: { user_id?: string };
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request payload' },
        { status: 400 },
      );
    }

    const blockedId = payload.user_id;
    if (!blockedId || typeof blockedId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid user_id' },
        { status: 400 },
      );
    }

    await sql`
      DELETE FROM blocked_users
      WHERE blocker_id = ${session.user.id} AND blocked_id = ${blockedId}
    `;

    return NextResponse.json({ success: true, blocked: false });
  } catch (error) {
    console.error('[community/block] DELETE failed', error);
    return NextResponse.json(
      { error: 'Failed to unblock user' },
      { status: 500 },
    );
  }
}
