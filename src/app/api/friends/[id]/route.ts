import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import { calculateSynastry } from '@/lib/astrology/synastry';
import { encryptJSON, decryptJSON } from '@/lib/encryption';
import { hasFeatureAccess } from '../../../../../utils/pricing';
import type { BirthChartData } from '../../../../../utils/astrology/birthChart';

/**
 * GET /api/friends/[id]
 * Get friend details with full synastry analysis
 * Requires paid subscription
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser(request);
    const { id } = await params;

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
          error: 'Friend profiles require a Lunary+ subscription',
          requiresUpgrade: true,
        },
        { status: 403 },
      );
    }

    // Get the friend connection
    const connectionResult = await sql`
      SELECT
        fc.id,
        fc.friend_id,
        fc.nickname,
        fc.relationship_type,
        fc.synastry_score,
        fc.synastry_data,
        fc.last_synastry_calc
      FROM friend_connections fc
      WHERE fc.id = ${id}::uuid AND fc.user_id = ${user.id}
    `;

    if (connectionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Friend connection not found' },
        { status: 404 },
      );
    }

    const connection = connectionResult.rows[0];

    // Get friend's profile info
    const friendResult = await sql`
      SELECT
        up.name,
        up.birthday,
        up.birth_chart,
        u.image as avatar,
        u.email
      FROM user_profiles up
      LEFT JOIN "user" u ON u.id = up.user_id
      WHERE up.user_id = ${connection.friend_id}
    `;

    const friendProfile = friendResult.rows[0] || {};

    // Get user's birth chart
    const userResult = await sql`
      SELECT birth_chart FROM user_profiles
      WHERE user_id = ${user.id}
    `;

    // Calculate synastry if both have birth charts
    let synastry = null;
    const userBirthChart = userResult.rows[0]?.birth_chart as
      | BirthChartData[]
      | null;
    const friendBirthChart = friendProfile.birth_chart as
      | BirthChartData[]
      | null;

    if (userBirthChart && friendBirthChart) {
      // Check if we have cached synastry that's less than 24 hours old
      const lastCalc = connection.last_synastry_calc
        ? new Date(connection.last_synastry_calc)
        : null;
      const cacheValid =
        lastCalc && Date.now() - lastCalc.getTime() < 24 * 60 * 60 * 1000;

      if (cacheValid && connection.synastry_data) {
        try {
          synastry = decryptJSON(connection.synastry_data);
        } catch {
          // Cache invalid, recalculate
        }
      }

      if (!synastry) {
        // Calculate fresh synastry
        synastry = calculateSynastry(userBirthChart, friendBirthChart);

        // Cache the result (encrypted)
        const encryptedSynastry = encryptJSON(synastry);
        await sql`
          UPDATE friend_connections
          SET
            synastry_score = ${synastry.compatibilityScore},
            synastry_data = ${encryptedSynastry},
            last_synastry_calc = NOW()
          WHERE id = ${id}::uuid
        `;
      }
    }

    // Get sun sign from birthday
    let sunSign = null;
    if (friendProfile.birthday) {
      const date = new Date(friendProfile.birthday);
      sunSign = getSunSign(date.getMonth() + 1, date.getDate());
    }

    return NextResponse.json({
      id: connection.id,
      friendId: connection.friend_id,
      name: connection.nickname || friendProfile.name || 'Friend',
      avatar: friendProfile.avatar,
      sunSign,
      relationshipType: connection.relationship_type,
      hasBirthChart: !!friendBirthChart,
      birthChart: friendBirthChart || undefined,
      synastry: synastry
        ? {
            compatibilityScore: synastry.compatibilityScore,
            summary: synastry.summary,
            aspects: synastry.aspects,
            elementBalance: synastry.elementBalance,
            modalityBalance: synastry.modalityBalance,
          }
        : null,
    });
  } catch (error) {
    console.error('[Friends] Error fetching friend:', error);
    return NextResponse.json(
      { error: 'Failed to fetch friend details' },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/friends/[id]
 * Update friend connection (nickname, relationship type)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const body = await request.json();

    const { nickname, relationshipType } = body;

    await sql`
      UPDATE friend_connections
      SET
        nickname = ${nickname || null},
        relationship_type = ${relationshipType || null},
        updated_at = NOW()
      WHERE id = ${id}::uuid AND user_id = ${user.id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Friends] Error updating friend:', error);
    return NextResponse.json(
      { error: 'Failed to update friend' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/friends/[id]
 * Remove friend connection (both directions)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser(request);
    const { id } = await params;

    // Get the friend_id first
    const connectionResult = await sql`
      SELECT friend_id FROM friend_connections
      WHERE id = ${id}::uuid AND user_id = ${user.id}
    `;

    if (connectionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 },
      );
    }

    const friendId = connectionResult.rows[0].friend_id;

    // Delete both directions of the connection
    await sql`
      DELETE FROM friend_connections
      WHERE (user_id = ${user.id} AND friend_id = ${friendId})
         OR (user_id = ${friendId} AND friend_id = ${user.id})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Friends] Error removing friend:', error);
    return NextResponse.json(
      { error: 'Failed to remove friend' },
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
