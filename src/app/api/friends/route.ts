import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import { hasFeatureAccess } from '../../../../utils/pricing';
import { decrypt } from '@/lib/encryption';

/**
 * GET /api/friends
 * List all friends with their basic profile info
 * Requires paid subscription
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

    const result = await sql`
      SELECT
        fc.id,
        fc.friend_id,
        fc.nickname,
        fc.relationship_type,
        fc.synastry_score,
        fc.created_at,
        up.name as friend_name,
        up.birthday as friend_birthday,
        u.image as friend_avatar
      FROM friend_connections fc
      LEFT JOIN user_profiles up ON up.user_id = fc.friend_id
      LEFT JOIN "user" u ON u.id = fc.friend_id
      WHERE fc.user_id = ${user.id}
      ORDER BY fc.created_at DESC
    `;

    // Mask birthdays for privacy (just show zodiac sign)
    const friends = result.rows.map((row) => {
      let sunSign = null;
      if (row.friend_birthday) {
        // Birthday might be encrypted
        const birthdayStr = decrypt(row.friend_birthday);
        if (birthdayStr) {
          const date = new Date(birthdayStr);
          if (!isNaN(date.getTime())) {
            sunSign = getSunSign(date.getMonth() + 1, date.getDate());
          }
        }
      }

      // Decrypt friend name (stored encrypted in user_profiles)
      const friendName = row.friend_name ? decrypt(row.friend_name) : null;

      return {
        id: row.id,
        friendId: row.friend_id,
        name: row.nickname || friendName || 'Friend',
        avatar: row.friend_avatar,
        relationshipType: row.relationship_type,
        sunSign,
        synastryScore: row.synastry_score,
        connectedAt: row.created_at,
      };
    });

    return NextResponse.json({ friends });
  } catch (error: any) {
    if (error?.code === '42P01') {
      return NextResponse.json({ friends: [] });
    }
    console.error('[Friends] Error fetching friends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch friends' },
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
