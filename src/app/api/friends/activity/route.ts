import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import { hasFeatureAccess } from '../../../../../utils/pricing';
import { decrypt } from '@/lib/encryption';
import { STREAK_MILESTONES } from '@/lib/notifications/streak-notifications';

/**
 * GET /api/friends/activity
 * Friend activity feed: top 3 friends by recency, milestone celebrations, received celebrations
 */
export async function GET(request: NextRequest) {
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
        {
          error: 'Friend connections require a Lunary+ subscription',
          requiresUpgrade: true,
        },
        { status: 403 },
      );
    }

    // Get top 3 friends sorted by last check-in (most recent first)
    const friendsResult = await sql`
      SELECT
        fc.id as connection_id,
        fc.friend_id,
        fc.nickname,
        fc.synastry_score,
        up.name as friend_name,
        up.birthday as friend_birthday,
        u.image as friend_avatar,
        COALESCE(us.current_streak, 0) as current_streak,
        us.last_check_in
      FROM friend_connections fc
      LEFT JOIN user_profiles up ON up.user_id = fc.friend_id
      LEFT JOIN "user" u ON u.id = fc.friend_id
      LEFT JOIN user_streaks us ON us.user_id = fc.friend_id
      WHERE fc.user_id = ${user.id}
      ORDER BY us.last_check_in DESC NULLS LAST
      LIMIT 3
    `;

    const friends = friendsResult.rows.map((row) => {
      const friendName = row.friend_name ? decrypt(row.friend_name) : null;

      let sunSign: string | null = null;
      if (row.friend_birthday) {
        const birthdayStr = decrypt(row.friend_birthday);
        if (birthdayStr) {
          const date = new Date(birthdayStr);
          if (!isNaN(date.getTime())) {
            sunSign = getSunSign(date.getMonth() + 1, date.getDate());
          }
        }
      }

      return {
        connectionId: row.connection_id,
        friendId: row.friend_id,
        name: row.nickname || friendName || 'Friend',
        avatar: row.friend_avatar,
        sunSign,
        synastryScore: row.synastry_score,
        currentStreak: row.current_streak || 0,
        lastCheckIn: row.last_check_in
          ? new Date(row.last_check_in).toISOString()
          : null,
      };
    });

    // Get friends who hit streak milestones in the last 7 days
    const milestonesPlaceholders = STREAK_MILESTONES.map(
      (_, i) => `$${i + 2}`,
    ).join(', ');

    const milestonesResult = await sql.query(
      `
      SELECT
        fc.friend_id,
        up.name as friend_name,
        fc.nickname,
        COALESCE(us.current_streak, 0) as current_streak,
        us.last_check_in
      FROM friend_connections fc
      LEFT JOIN user_profiles up ON up.user_id = fc.friend_id
      LEFT JOIN user_streaks us ON us.user_id = fc.friend_id
      WHERE fc.user_id = $1
        AND COALESCE(us.current_streak, 0) IN (${milestonesPlaceholders})
        AND us.last_check_in >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY us.last_check_in DESC
    `,
      [user.id, ...STREAK_MILESTONES],
    );

    const milestones = milestonesResult.rows.map((row) => {
      const friendName = row.friend_name ? decrypt(row.friend_name) : null;
      return {
        friendId: row.friend_id,
        name: row.nickname || friendName || 'Friend',
        milestone: row.current_streak,
        achievedAt: row.last_check_in
          ? new Date(row.last_check_in).toISOString()
          : new Date().toISOString(),
      };
    });

    // Get celebrations this user has sent (to disable buttons)
    let celebrationsSent: Array<{ friendId: string; milestone: number }> = [];
    try {
      const sentResult = await sql`
        SELECT receiver_id, milestone
        FROM friend_celebrations
        WHERE sender_id = ${user.id}
          AND created_at >= NOW() - INTERVAL '7 days'
      `;
      celebrationsSent = sentResult.rows.map((row) => ({
        friendId: row.receiver_id,
        milestone: row.milestone,
      }));
    } catch {
      // Table might not exist yet
    }

    // Get celebrations this user has received
    let celebrationsReceived: Array<{
      senderId: string;
      senderName: string;
      senderAvatar: string | null;
      milestone: number;
      createdAt: string;
    }> = [];
    try {
      const receivedResult = await sql`
        SELECT
          fcel.sender_id,
          fcel.milestone,
          fcel.created_at,
          up.name as sender_name,
          u.image as sender_avatar
        FROM friend_celebrations fcel
        LEFT JOIN user_profiles up ON up.user_id = fcel.sender_id
        LEFT JOIN "user" u ON u.id = fcel.sender_id
        WHERE fcel.receiver_id = ${user.id}
          AND fcel.created_at >= NOW() - INTERVAL '7 days'
        ORDER BY fcel.created_at DESC
      `;
      celebrationsReceived = receivedResult.rows.map((row) => {
        const senderName = row.sender_name ? decrypt(row.sender_name) : null;
        return {
          senderId: row.sender_id,
          senderName: senderName || 'A friend',
          senderAvatar: row.sender_avatar,
          milestone: row.milestone,
          createdAt: new Date(row.created_at).toISOString(),
        };
      });
    } catch {
      // Table might not exist yet
    }

    return NextResponse.json({
      friends,
      milestones,
      celebrationsSent,
      celebrationsReceived,
    });
  } catch (error: any) {
    if (error?.code === '42P01') {
      return NextResponse.json({
        friends: [],
        milestones: [],
        celebrationsSent: [],
        celebrationsReceived: [],
      });
    }
    console.error('[Friends Activity] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch friend activity' },
      { status: 500 },
    );
  }
}

function getSunSign(month: number, day: number): string {
  const signs = [
    { sign: 'Capricorn', end: [1, 19] },
    { sign: 'Aquarius', end: [2, 18] },
    { sign: 'Pisces', end: [3, 20] },
    { sign: 'Aries', end: [4, 19] },
    { sign: 'Taurus', end: [5, 20] },
    { sign: 'Gemini', end: [6, 20] },
    { sign: 'Cancer', end: [7, 22] },
    { sign: 'Leo', end: [8, 22] },
    { sign: 'Virgo', end: [9, 22] },
    { sign: 'Libra', end: [10, 22] },
    { sign: 'Scorpio', end: [11, 21] },
    { sign: 'Sagittarius', end: [12, 21] },
    { sign: 'Capricorn', end: [12, 31] },
  ];

  for (const { sign, end } of signs) {
    if (month < end[0] || (month === end[0] && day <= end[1])) {
      return sign;
    }
  }
  return 'Capricorn';
}
