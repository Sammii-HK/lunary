import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

type AnnouncementRow = {
  id: string;
  title: string;
  description: string;
  icon: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  requiredTier: string[];
  isActive: boolean;
  releasedAt: string;
  createdAt: string;
};

export async function GET() {
  try {
    const result = await sql<AnnouncementRow>`
      SELECT
        id,
        title,
        description,
        icon,
        cta_label AS "ctaLabel",
        cta_href AS "ctaHref",
        required_tier AS "requiredTier",
        is_active AS "isActive",
        released_at AS "releasedAt",
        created_at AS "createdAt"
      FROM feature_announcements
      ORDER BY released_at DESC
    `;

    return NextResponse.json({ announcements: result.rows });
  } catch (error) {
    console.error('[Admin Announcements] Failed to fetch', error);
    return NextResponse.json(
      { error: 'Unable to fetch announcements.' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const {
      title,
      description,
      icon = 'Sparkles',
      ctaLabel,
      ctaHref,
      requiredTier = [],
      releasedAt,
    } = payload;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required.' },
        { status: 400 },
      );
    }

    const releaseDate = releasedAt ? new Date(releasedAt) : new Date();

    const result = await sql<AnnouncementRow>`
      INSERT INTO feature_announcements (title, description, icon, cta_label, cta_href, required_tier, released_at)
      VALUES (${title}, ${description}, ${icon}, ${ctaLabel || null}, ${ctaHref || null}, ${requiredTier}, ${releaseDate.toISOString()})
      RETURNING
        id,
        title,
        description,
        icon,
        cta_label AS "ctaLabel",
        cta_href AS "ctaHref",
        required_tier AS "requiredTier",
        is_active AS "isActive",
        released_at AS "releasedAt",
        created_at AS "createdAt"
    `;

    return NextResponse.json({ announcement: result.rows[0] });
  } catch (error) {
    console.error('[Admin Announcements] Failed to create', error);
    return NextResponse.json(
      { error: 'Unable to create announcement.' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const payload = await request.json();
    const { id, ...updates } = payload;

    if (!id) {
      return NextResponse.json({ error: 'ID is required.' }, { status: 400 });
    }

    // Build dynamic update query
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (updates.title !== undefined) {
      setClauses.push(`title = $${paramIndex++}`);
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      setClauses.push(`description = $${paramIndex++}`);
      values.push(updates.description);
    }
    if (updates.icon !== undefined) {
      setClauses.push(`icon = $${paramIndex++}`);
      values.push(updates.icon);
    }
    if (updates.ctaLabel !== undefined) {
      setClauses.push(`cta_label = $${paramIndex++}`);
      values.push(updates.ctaLabel || null);
    }
    if (updates.ctaHref !== undefined) {
      setClauses.push(`cta_href = $${paramIndex++}`);
      values.push(updates.ctaHref || null);
    }
    if (updates.requiredTier !== undefined) {
      setClauses.push(`required_tier = $${paramIndex++}`);
      values.push(updates.requiredTier);
    }
    if (updates.isActive !== undefined) {
      setClauses.push(`is_active = $${paramIndex++}`);
      values.push(updates.isActive);
    }
    if (updates.releasedAt !== undefined) {
      setClauses.push(`released_at = $${paramIndex++}`);
      values.push(new Date(updates.releasedAt).toISOString());
    }

    if (setClauses.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update.' },
        { status: 400 },
      );
    }

    // Add ID to the end
    values.push(id);

    const query = `
      UPDATE feature_announcements
      SET ${setClauses.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING
        id,
        title,
        description,
        icon,
        cta_label AS "ctaLabel",
        cta_href AS "ctaHref",
        required_tier AS "requiredTier",
        is_active AS "isActive",
        released_at AS "releasedAt",
        created_at AS "createdAt"
    `;

    const result = await sql.query<AnnouncementRow>(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Announcement not found.' },
        { status: 404 },
      );
    }

    return NextResponse.json({ announcement: result.rows[0] });
  } catch (error) {
    console.error('[Admin Announcements] Failed to update', error);
    return NextResponse.json(
      { error: 'Unable to update announcement.' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required.' }, { status: 400 });
    }

    await sql`DELETE FROM feature_announcements WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Announcements] Failed to delete', error);
    return NextResponse.json(
      { error: 'Unable to delete announcement.' },
      { status: 500 },
    );
  }
}
