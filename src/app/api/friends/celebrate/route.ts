import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import { hasFeatureAccess } from '../../../../../utils/pricing';
import { sendToUser } from '@/lib/notifications/native-push-sender';
import { decrypt } from '@/lib/encryption';

/**
 * POST /api/friends/celebrate
 * Send cosmic energy to a friend who hit a streak milestone
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

    if (
      !hasFeatureAccess(subscriptionStatus, user.plan, 'friend_connections')
    ) {
      return NextResponse.json(
        { error: 'Requires Lunary+ subscription' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { friendId, milestone } = body;

    if (!friendId || !milestone) {
      return NextResponse.json(
        { error: 'friendId and milestone are required' },
        { status: 400 },
      );
    }

    // Verify friendship exists
    const friendCheck = await sql`
      SELECT id FROM friend_connections
      WHERE user_id = ${user.id} AND friend_id = ${friendId}
    `;

    if (friendCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Not connected to this user' },
        { status: 403 },
      );
    }

    // Check if already celebrated this milestone
    const existingCelebration = await sql`
      SELECT id FROM friend_celebrations
      WHERE sender_id = ${user.id}
        AND receiver_id = ${friendId}
        AND milestone = ${milestone}
        AND created_at >= NOW() - INTERVAL '7 days'
    `;

    if (existingCelebration.rows.length > 0) {
      return NextResponse.json(
        { error: 'Already celebrated this milestone' },
        { status: 409 },
      );
    }

    // Create celebration record
    await sql`
      INSERT INTO friend_celebrations (sender_id, receiver_id, milestone)
      VALUES (${user.id}, ${friendId}, ${milestone})
    `;

    // Get sender's name for the notification
    const senderProfile = await sql`
      SELECT name FROM user_profiles WHERE user_id = ${user.id}
    `;
    const senderName = senderProfile.rows[0]?.name
      ? decrypt(senderProfile.rows[0].name)
      : 'A friend';

    // Send push notification to the friend
    await sendToUser(friendId, {
      title: `Cosmic energy from ${senderName}!`,
      body: `${senderName} is celebrating your ${milestone}-day streak!`,
      data: {
        type: 'friend_celebration',
        action: '/app',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Friends Celebrate] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send celebration' },
      { status: 500 },
    );
  }
}
