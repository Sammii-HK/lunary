import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import { hasFeatureAccess } from '../../../../../utils/pricing';
import { decrypt } from '@/lib/encryption';

export interface FriendStreak {
  friendId: string;
  name: string;
  avatar: string | null;
  currentStreak: number;
  lastCheckIn: string | null;
}

export interface LeaderboardData {
  userStreak: number;
  userPosition: number;
  friends: FriendStreak[];
}

/**
 * GET /api/friends/streaks
 * Get streak leaderboard for user's circle
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

    // Get user's own streak
    const userStreakResult = await sql`
      SELECT current_streak, last_check_in
      FROM user_streaks
      WHERE user_id = ${user.id}
    `;
    const userStreak = userStreakResult.rows[0]?.current_streak || 0;

    // Get friends with their streaks
    const result = await sql`
      SELECT
        fc.friend_id,
        up.name as friend_name,
        u.image as friend_avatar,
        COALESCE(us.current_streak, 0) as current_streak,
        us.last_check_in
      FROM friend_connections fc
      LEFT JOIN user_profiles up ON up.user_id = fc.friend_id
      LEFT JOIN "user" u ON u.id = fc.friend_id
      LEFT JOIN user_streaks us ON us.user_id = fc.friend_id
      WHERE fc.user_id = ${user.id}
      ORDER BY COALESCE(us.current_streak, 0) DESC
    `;

    const friends: FriendStreak[] = result.rows.map((row) => {
      // Decrypt friend name
      const friendName = row.friend_name ? decrypt(row.friend_name) : null;

      return {
        friendId: row.friend_id,
        name: friendName || 'Friend',
        avatar: row.friend_avatar,
        currentStreak: row.current_streak || 0,
        lastCheckIn: row.last_check_in
          ? new Date(row.last_check_in).toISOString().split('T')[0]
          : null,
      };
    });

    // Calculate user's position (1-indexed)
    const allStreaks = [
      userStreak,
      ...friends.map((f) => f.currentStreak),
    ].sort((a, b) => b - a);
    const userPosition = allStreaks.indexOf(userStreak) + 1;

    return NextResponse.json({
      userStreak,
      userPosition,
      friends,
    } as LeaderboardData);
  } catch (error: any) {
    if (error?.code === '42P01') {
      return NextResponse.json({
        userStreak: 0,
        userPosition: 1,
        friends: [],
      });
    }
    console.error('[Friends Streaks] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch friend streaks' },
      { status: 500 },
    );
  }
}
