import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/community/spaces
 * List active community spaces. If authenticated, includes user's membership status.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api
      .getSession({ headers: request.headers })
      .catch(() => null);
    const userId = session?.user?.id;

    const spacesResult = await sql`
      SELECT
        cs.id,
        cs.space_type,
        cs.slug,
        cs.title,
        cs.description,
        cs.sign,
        cs.planet,
        cs.metadata,
        cs.is_active,
        cs.starts_at,
        cs.ends_at,
        cs.post_count,
        cs.member_count,
        cs.created_at
      FROM community_spaces cs
      WHERE cs.is_active = true
      ORDER BY
        CASE cs.space_type
          WHEN 'retrograde_checkin' THEN 1
          WHEN 'saturn_return' THEN 2
          WHEN 'sign_space' THEN 3
        END,
        cs.title ASC
    `;

    let membershipIds: number[] = [];
    if (userId) {
      const membershipResult = await sql`
        SELECT space_id FROM community_memberships WHERE user_id = ${userId}
      `;
      membershipIds = membershipResult.rows.map((r) => Number(r.space_id));
    }

    const spaces = spacesResult.rows.map((row) => ({
      id: row.id,
      spaceType: row.space_type,
      slug: row.slug,
      title: row.title,
      description: row.description,
      sign: row.sign,
      planet: row.planet,
      metadata: row.metadata,
      isActive: row.is_active,
      startsAt: row.starts_at ? new Date(row.starts_at).toISOString() : null,
      endsAt: row.ends_at ? new Date(row.ends_at).toISOString() : null,
      postCount: row.post_count ?? 0,
      memberCount: row.member_count ?? 0,
      isMember: membershipIds.includes(Number(row.id)),
    }));

    return NextResponse.json(
      { spaces },
      {
        headers: {
          'Cache-Control':
            'public, s-maxage=60, stale-while-revalidate=30, max-age=60',
        },
      },
    );
  } catch (error) {
    console.error('[community/spaces] GET failed', error);
    return NextResponse.json(
      { error: 'Failed to load community spaces' },
      { status: 500 },
    );
  }
}
