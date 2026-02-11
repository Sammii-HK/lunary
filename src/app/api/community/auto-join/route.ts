import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { getUserSigns, signToSpaceSlug } from '@/lib/community/get-user-signs';
import { isInSaturnReturn } from '@/lib/community/saturn-return';
import { decrypt } from '@/lib/encryption';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/community/auto-join
 * Auto-join spaces based on birth chart (rising sign) and age (Saturn Return).
 * Returns the list of spaces the user is now a member of.
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

    const userId = session.user.id;
    const joinedSlugs: string[] = [];

    // Get user profile: birth chart + birthday
    const profileResult = await sql`
      SELECT birth_chart, birthday FROM user_profiles WHERE user_id = ${userId} LIMIT 1
    `;

    if (profileResult.rows.length === 0) {
      return NextResponse.json({
        joinedSpaces: [],
        needsBirthChart: true,
      });
    }

    const profile = profileResult.rows[0];
    const birthChart = profile.birth_chart;
    const { risingSign, sunSign, moonSign } = getUserSigns(birthChart);

    // Auto-join sign spaces (rising, sun, moon)
    const signPlacements: Array<{
      sign: string | null;
      placement: 'rising' | 'sun' | 'moon';
    }> = [
      { sign: risingSign, placement: 'rising' },
      { sign: sunSign, placement: 'sun' },
      { sign: moonSign, placement: 'moon' },
    ];

    for (const { sign, placement } of signPlacements) {
      if (!sign) continue;
      const slug = signToSpaceSlug(sign, placement);
      const spaceResult = await sql`
        SELECT id FROM community_spaces
        WHERE slug = ${slug} AND is_active = true
        LIMIT 1
      `;

      if (spaceResult.rows.length > 0) {
        await sql`
          INSERT INTO community_memberships (space_id, user_id)
          VALUES (${spaceResult.rows[0].id}, ${userId})
          ON CONFLICT (space_id, user_id) DO NOTHING
        `;
        joinedSlugs.push(slug);
      }
    }

    // Auto-join Saturn Return circle if eligible
    const birthday = profile.birthday ? decrypt(profile.birthday) : null;
    if (birthday && isInSaturnReturn(birthday)) {
      const saturnResult = await sql`
        SELECT id FROM community_spaces
        WHERE slug = 'saturn-return' AND is_active = true
        LIMIT 1
      `;

      if (saturnResult.rows.length > 0) {
        await sql`
          INSERT INTO community_memberships (space_id, user_id)
          VALUES (${saturnResult.rows[0].id}, ${userId})
          ON CONFLICT (space_id, user_id) DO NOTHING
        `;
        joinedSlugs.push('saturn-return');
      }
    }

    // Auto-join active retrograde check-in space
    const retroResult = await sql`
      SELECT id, slug FROM community_spaces
      WHERE space_type = 'retrograde_checkin'
        AND is_active = true
        AND starts_at <= NOW()
        AND ends_at >= NOW()
      LIMIT 1
    `;

    if (retroResult.rows.length > 0) {
      await sql`
        INSERT INTO community_memberships (space_id, user_id)
        VALUES (${retroResult.rows[0].id}, ${userId})
        ON CONFLICT (space_id, user_id) DO NOTHING
      `;
      joinedSlugs.push(retroResult.rows[0].slug);
    }

    // Return all user's memberships
    const allMemberships = await sql`
      SELECT cs.slug, cs.title, cs.space_type, cs.sign, cs.planet
      FROM community_memberships cm
      JOIN community_spaces cs ON cs.id = cm.space_id
      WHERE cm.user_id = ${userId}
      ORDER BY cm.joined_at ASC
    `;

    return NextResponse.json({
      joinedSpaces: allMemberships.rows.map((r) => ({
        slug: r.slug,
        title: r.title,
        spaceType: r.space_type,
        sign: r.sign,
        planet: r.planet,
      })),
      newlyJoined: joinedSlugs,
      needsBirthChart: !risingSign && !sunSign && !moonSign,
    });
  } catch (error) {
    console.error('[community/auto-join] POST failed', error);
    return NextResponse.json(
      { error: 'Failed to auto-join spaces' },
      { status: 500 },
    );
  }
}
