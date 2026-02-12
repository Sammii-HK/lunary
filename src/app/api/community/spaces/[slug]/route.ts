import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/community/spaces/[slug]
 * Single space detail with membership status.
 */
export async function GET(request: NextRequest, context: any) {
  try {
    const params = await context.params;
    const slug = params?.slug;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'Invalid space slug' },
        { status: 400 },
      );
    }

    const spaceResult = await sql`
      SELECT
        id, space_type, slug, title, description,
        sign, planet, metadata, is_active,
        starts_at, ends_at, post_count, member_count, created_at
      FROM community_spaces
      WHERE slug = ${slug}
      LIMIT 1
    `;

    if (spaceResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Community space not found' },
        { status: 404 },
      );
    }

    const row = spaceResult.rows[0];

    const session = await auth.api
      .getSession({ headers: request.headers })
      .catch(() => null);
    const userId = session?.user?.id;

    let isMember = false;
    if (userId) {
      const memberResult = await sql`
        SELECT id FROM community_memberships
        WHERE space_id = ${row.id} AND user_id = ${userId}
        LIMIT 1
      `;
      isMember = memberResult.rows.length > 0;
    }

    return NextResponse.json(
      {
        space: {
          id: row.id,
          spaceType: row.space_type,
          slug: row.slug,
          title: row.title,
          description: row.description,
          sign: row.sign,
          planet: row.planet,
          metadata: row.metadata,
          isActive: row.is_active,
          startsAt: row.starts_at
            ? new Date(row.starts_at).toISOString()
            : null,
          endsAt: row.ends_at ? new Date(row.ends_at).toISOString() : null,
          postCount: row.post_count ?? 0,
          memberCount: row.member_count ?? 0,
          isMember,
        },
      },
      {
        headers: {
          'Cache-Control':
            'public, s-maxage=30, stale-while-revalidate=15, max-age=30',
        },
      },
    );
  } catch (error) {
    console.error('[community/spaces/:slug] GET failed', error);
    return NextResponse.json(
      { error: 'Failed to load community space' },
      { status: 500 },
    );
  }
}
