import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/community/spaces/[slug]/join
 * Join a community space. Requires authentication.
 */
export async function POST(request: NextRequest, context: any) {
  try {
    const params = await context.params;
    const slug = params?.slug;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'Invalid space slug' },
        { status: 400 },
      );
    }

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const spaceResult = await sql`
      SELECT id, is_active FROM community_spaces WHERE slug = ${slug} LIMIT 1
    `;

    if (spaceResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Community space not found' },
        { status: 404 },
      );
    }

    const space = spaceResult.rows[0];
    if (!space.is_active) {
      return NextResponse.json(
        { error: 'This community space is not currently active' },
        { status: 403 },
      );
    }

    await sql`
      INSERT INTO community_memberships (space_id, user_id)
      VALUES (${space.id}, ${session.user.id})
      ON CONFLICT (space_id, user_id) DO NOTHING
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[community/spaces/:slug/join] POST failed', error);
    return NextResponse.json(
      { error: 'Failed to join space' },
      { status: 500 },
    );
  }
}
