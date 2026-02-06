import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { randomBytes } from 'crypto';
import { requireUser } from '@/lib/ai/auth';
import { hashForLookup } from '@/lib/encryption';
import { hasFeatureAccess } from '../../../../../utils/pricing';
import { FRIEND_LIMITS } from '../../../../../utils/entitlements';

/**
 * POST /api/friends/invite
 * Generate a friend invite link
 * Free users: limited to 5 friends with basic compatibility
 * Paid users: unlimited friends with full synastry
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);

    // Check subscription access
    const subscriptionResult = await sql`
      SELECT status FROM subscriptions
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const subscriptionStatus = subscriptionResult.rows[0]?.status || 'free';

    // Check if user has any friend connection access (basic or full)
    const hasFullAccess = hasFeatureAccess(
      subscriptionStatus,
      user.plan,
      'friend_connections',
    );
    const hasBasicAccess = hasFeatureAccess(
      subscriptionStatus,
      user.plan,
      'friend_connections_basic',
    );

    if (!hasFullAccess && !hasBasicAccess) {
      return NextResponse.json(
        {
          error: 'Friend connections require an account',
          requiresUpgrade: true,
        },
        { status: 403 },
      );
    }

    // For free users, check if they've hit the friend limit
    if (!hasFullAccess && hasBasicAccess) {
      const friendCountResult = await sql`
        SELECT COUNT(*) as count FROM friend_connections
        WHERE user_id = ${user.id}
      `;
      const friendCount = parseInt(friendCountResult.rows[0]?.count || '0', 10);

      if (friendCount >= FRIEND_LIMITS.free) {
        return NextResponse.json(
          {
            error: `Free accounts can add up to ${FRIEND_LIMITS.free} friends. Upgrade to Lunary+ for unlimited connections.`,
            requiresUpgrade: true,
            friendLimit: FRIEND_LIMITS.free,
            currentCount: friendCount,
          },
          { status: 403 },
        );
      }
    }

    // Generate a unique invite code
    const rawCode = randomBytes(16).toString('hex');
    const hashedCode = hashForLookup(rawCode);

    // Invite expires in 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const result = await sql`
      INSERT INTO friend_invites (inviter_id, invite_code, expires_at)
      VALUES (${user.id}, ${hashedCode}, ${expiresAt.toISOString()}::timestamptz)
      RETURNING id, invite_code, expires_at
    `;

    // Remove trailing slash from base URL to prevent double slashes
    const baseUrl = (
      process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app'
    ).replace(/\/$/, '');
    const inviteUrl = `${baseUrl}/invite/${rawCode}`;

    return NextResponse.json({
      success: true,
      inviteUrl,
      expiresAt: result.rows[0].expires_at,
    });
  } catch (error) {
    console.error('[Friends] Error creating invite:', error);
    return NextResponse.json(
      { error: 'Failed to create invite link' },
      { status: 500 },
    );
  }
}

/**
 * GET /api/friends/invite
 * List user's pending invites
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);

    const result = await sql`
      SELECT id, status, expires_at, created_at, accepted_at
      FROM friend_invites
      WHERE inviter_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 10
    `;

    return NextResponse.json({
      invites: result.rows,
    });
  } catch (error) {
    console.error('[Friends] Error fetching invites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invites' },
      { status: 500 },
    );
  }
}
