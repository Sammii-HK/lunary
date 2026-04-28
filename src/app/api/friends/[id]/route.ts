import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';
import { requireUser } from '@/lib/ai/auth';
import { calculateSynastry } from '@/lib/astrology/synastry';
import { hasFeatureAccess } from '../../../../../utils/pricing';
import { decrypt } from '@/lib/encryption';
import type { BirthChartData } from '../../../../../utils/astrology/birthChart';

export const dynamic = 'force-dynamic';

const patchFriendSchema = z
  .object({
    nickname: z.string().trim().max(64).nullable().optional(),
    relationshipType: z.string().trim().max(64).nullable().optional(),
  })
  .refine((v) => v.nickname !== undefined || v.relationshipType !== undefined, {
    message: 'At least one of nickname or relationshipType is required',
  });

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

    // Check subscription access. Free users with `friend_connections_basic`
    // get a stripped profile (compatibility % + summary + key placements);
    // only paid `friend_connections` unlocks the bi-wheel chart, full aspect
    // list, and the CompatibilityBreakdown payload.
    const subscriptionResult = await sql`
      SELECT status FROM subscriptions
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const subscriptionStatus = subscriptionResult.rows[0]?.status || 'free';

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

    const friendProfileRaw = friendResult.rows[0] || {};

    // Decrypt friend's name and birthday (stored encrypted in user_profiles)
    const friendProfile = {
      ...friendProfileRaw,
      name: friendProfileRaw.name ? decrypt(friendProfileRaw.name) : null,
      birthday: friendProfileRaw.birthday
        ? decrypt(friendProfileRaw.birthday)
        : null,
    };

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
        // Use cached synastry data (stored as plain JSON)
        synastry = connection.synastry_data as typeof synastry;
      }

      if (!synastry) {
        // Calculate fresh synastry
        synastry = calculateSynastry(userBirthChart, friendBirthChart);

        // Cache the result as JSON (synastry isn't sensitive personal data)
        await sql`
          UPDATE friend_connections
          SET
            synastry_score = ${synastry.compatibilityScore},
            synastry_data = ${JSON.stringify(synastry)}::jsonb,
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

    // Strip premium-only fields for free (basic) users: keep compatibility %
    // and summary, drop aspect list, element/modality breakdowns, and the
    // friend's birth chart (which would let them re-render the bi-wheel
    // client-side). The UI also gates these views, but server-side stripping
    // is the source of truth for revenue protection.
    const synastryPayload = synastry
      ? hasFullAccess
        ? {
            compatibilityScore: synastry.compatibilityScore,
            summary: synastry.summary,
            aspects: synastry.aspects,
            elementBalance: synastry.elementBalance,
            modalityBalance: synastry.modalityBalance,
          }
        : {
            compatibilityScore: synastry.compatibilityScore,
            summary: synastry.summary,
            // Free tier: no aspects, no element/modality detail.
            aspects: [],
            elementBalance: synastry.elementBalance,
            modalityBalance: synastry.modalityBalance,
          }
      : null;

    return NextResponse.json({
      id: connection.id,
      friendId: connection.friend_id,
      name: connection.nickname || friendProfile.name || 'Friend',
      avatar: friendProfile.avatar,
      sunSign,
      birthday: friendProfile.birthday ?? null,
      relationshipType: connection.relationship_type,
      hasBirthChart: !!friendBirthChart,
      // Only paid users receive the friend's birth chart. Free users can't
      // re-render the synastry bi-wheel without it.
      birthChart: hasFullAccess ? friendBirthChart || undefined : undefined,
      synastry: synastryPayload,
      tier: hasFullAccess ? 'full' : 'basic',
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
 * PATCH /api/friends/[id]
 * Body: { nickname?, relationshipType? }
 * Partially update friend connection metadata. Only the connection
 * owner (user_id) can patch.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser(request);
    const { id } = await params;

    let parsed;
    try {
      parsed = patchFriendSchema.parse(await request.json());
    } catch (err) {
      if (err instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid request body', issues: err.issues },
          { status: 400 },
        );
      }
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { nickname, relationshipType } = parsed;

    // Verify ownership before updating
    const existing = await sql`
      SELECT id FROM friend_connections
      WHERE id = ${id}::uuid AND user_id = ${user.id}
      LIMIT 1
    `;
    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: 'Friend connection not found' },
        { status: 404 },
      );
    }

    // Use COALESCE-on-NULL pattern: if a field is undefined in the body,
    // pass NULL to keep the existing value. If null is explicitly sent,
    // we still want to clear it, handle that by using a sentinel.
    const updateNickname = nickname !== undefined;
    const updateRelType = relationshipType !== undefined;

    if (updateNickname && updateRelType) {
      await sql`
        UPDATE friend_connections
        SET nickname = ${nickname ?? null},
            relationship_type = ${relationshipType ?? null},
            updated_at = NOW()
        WHERE id = ${id}::uuid AND user_id = ${user.id}
      `;
    } else if (updateNickname) {
      await sql`
        UPDATE friend_connections
        SET nickname = ${nickname ?? null},
            updated_at = NOW()
        WHERE id = ${id}::uuid AND user_id = ${user.id}
      `;
    } else if (updateRelType) {
      await sql`
        UPDATE friend_connections
        SET relationship_type = ${relationshipType ?? null},
            updated_at = NOW()
        WHERE id = ${id}::uuid AND user_id = ${user.id}
      `;
    }

    const result = await sql`
      SELECT id, friend_id, nickname, relationship_type, updated_at
      FROM friend_connections
      WHERE id = ${id}::uuid AND user_id = ${user.id}
    `;
    const row = result.rows[0];
    return NextResponse.json({
      id: row.id,
      friendId: row.friend_id,
      nickname: row.nickname,
      relationshipType: row.relationship_type,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error('[Friends] Error patching friend:', error);
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
