import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import { hashForLookup, decrypt } from '@/lib/encryption';
import { hasFeatureAccess } from '../../../../../../utils/pricing';

/**
 * GET /api/friends/invite/[code]
 * Get invite details (for invite page - can be accessed without auth)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const hashedCode = hashForLookup(code);

    const result = await sql`
      SELECT
        fi.id,
        fi.inviter_id,
        fi.status,
        fi.expires_at,
        up.name as inviter_name
      FROM friend_invites fi
      LEFT JOIN user_profiles up ON up.user_id = fi.inviter_id
      WHERE fi.invite_code = ${hashedCode}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invite not found or expired' },
        { status: 404 },
      );
    }

    const invite = result.rows[0];

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This invite has expired' },
        { status: 410 },
      );
    }

    // Check if already accepted
    if (invite.status === 'accepted') {
      return NextResponse.json(
        { error: 'This invite has already been used' },
        { status: 410 },
      );
    }

    // Decrypt the inviter's name (stored encrypted in user_profiles)
    const inviterName = invite.inviter_name
      ? decrypt(invite.inviter_name)
      : 'A Lunary user';

    return NextResponse.json({
      valid: true,
      inviterName: inviterName || 'A Lunary user',
      expiresAt: invite.expires_at,
    });
  } catch (error) {
    console.error('[Friends] Error fetching invite:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invite details' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/friends/invite/[code]
 * Accept a friend invite
 * Requires paid subscription
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const user = await requireUser(request);
    const { code } = await params;

    // Check subscription access
    const subscriptionResult = await sql`
      SELECT status FROM subscriptions
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const subscriptionStatus = subscriptionResult.rows[0]?.status || 'free';

    if (
      !hasFeatureAccess(subscriptionStatus, user.plan, 'friend_connections')
    ) {
      return NextResponse.json(
        {
          error: 'Accepting friend invites requires a Lunary+ subscription',
          requiresUpgrade: true,
        },
        { status: 403 },
      );
    }

    const hashedCode = hashForLookup(code);

    // Get the invite
    const inviteResult = await sql`
      SELECT id, inviter_id, status, expires_at
      FROM friend_invites
      WHERE invite_code = ${hashedCode}
    `;

    if (inviteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    const invite = inviteResult.rows[0];

    // Validate invite
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This invite has expired' },
        { status: 410 },
      );
    }

    if (invite.status === 'accepted') {
      return NextResponse.json(
        { error: 'This invite has already been used' },
        { status: 410 },
      );
    }

    // Can't accept your own invite
    if (invite.inviter_id === user.id) {
      return NextResponse.json(
        { error: "You can't accept your own invite" },
        { status: 400 },
      );
    }

    // Check if already friends
    const existingConnection = await sql`
      SELECT id FROM friend_connections
      WHERE (user_id = ${user.id} AND friend_id = ${invite.inviter_id})
         OR (user_id = ${invite.inviter_id} AND friend_id = ${user.id})
    `;

    if (existingConnection.rows.length > 0) {
      return NextResponse.json(
        { error: 'You are already connected with this person' },
        { status: 400 },
      );
    }

    // Create bidirectional friend connections
    await sql`
      INSERT INTO friend_connections (user_id, friend_id)
      VALUES
        (${user.id}, ${invite.inviter_id}),
        (${invite.inviter_id}, ${user.id})
    `;

    // Mark invite as accepted
    await sql`
      UPDATE friend_invites
      SET status = 'accepted', accepted_by_id = ${user.id}, accepted_at = NOW()
      WHERE id = ${invite.id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Friend connection created!',
    });
  } catch (error) {
    console.error('[Friends] Error accepting invite:', error);
    return NextResponse.json(
      { error: 'Failed to accept invite' },
      { status: 500 },
    );
  }
}
