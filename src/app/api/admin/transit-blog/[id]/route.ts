import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/transit-blog/[id]
 *
 * Get a single transit blog post by ID or slug.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const result = await sql`
    SELECT * FROM transit_blog_posts
    WHERE id = ${id} OR slug = ${id}
    LIMIT 1
  `;

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ post: result.rows[0] });
}

/**
 * PATCH /api/admin/transit-blog/[id]
 *
 * Update a transit blog post (status, content edits, review notes).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  const allowedFields = [
    'status',
    'title',
    'subtitle',
    'meta_description',
    'introduction',
    'historical_deep_dive',
    'astronomical_context',
    'practical_guidance',
    'sign_breakdowns',
    'closing_section',
    'review_notes',
  ];

  // Build dynamic update
  const updates: string[] = [];
  const values: unknown[] = [];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      const value =
        field === 'sign_breakdowns' ? JSON.stringify(body[field]) : body[field];
      values.push(value);
      updates.push(`${field} = $${values.length + 1}`);
    }
  }

  if (body.status === 'published' && !body.published_at) {
    values.push(new Date().toISOString());
    updates.push(`published_at = $${values.length + 1}`);
  }

  if (body.status === 'archived') {
    // Keep published_at as-is
  }

  if (body.review_notes) {
    values.push(new Date().toISOString());
    updates.push(`reviewed_at = $${values.length + 1}`);
  }

  if (updates.length === 0) {
    return NextResponse.json(
      { error: 'No valid fields to update' },
      { status: 400 },
    );
  }

  values.push(new Date().toISOString());
  updates.push(`updated_at = $${values.length + 1}`);

  // Use a simple approach since we can't do parameterised dynamic SQL easily with @vercel/postgres
  // Build the query manually but safely
  const setClause = updates.join(', ');

  // For simplicity, use individual updates for each field
  if (body.status !== undefined) {
    if (body.status === 'published') {
      await sql`
        UPDATE transit_blog_posts
        SET status = ${body.status}, published_at = NOW(), updated_at = NOW()
        WHERE id = ${id}
      `;
    } else {
      await sql`
        UPDATE transit_blog_posts
        SET status = ${body.status}, updated_at = NOW()
        WHERE id = ${id}
      `;
    }
  }

  if (body.title !== undefined) {
    await sql`UPDATE transit_blog_posts SET title = ${body.title}, updated_at = NOW() WHERE id = ${id}`;
  }
  if (body.introduction !== undefined) {
    await sql`UPDATE transit_blog_posts SET introduction = ${body.introduction}, updated_at = NOW() WHERE id = ${id}`;
  }
  if (body.historical_deep_dive !== undefined) {
    await sql`UPDATE transit_blog_posts SET historical_deep_dive = ${body.historical_deep_dive}, updated_at = NOW() WHERE id = ${id}`;
  }
  if (body.astronomical_context !== undefined) {
    await sql`UPDATE transit_blog_posts SET astronomical_context = ${body.astronomical_context}, updated_at = NOW() WHERE id = ${id}`;
  }
  if (body.practical_guidance !== undefined) {
    await sql`UPDATE transit_blog_posts SET practical_guidance = ${body.practical_guidance}, updated_at = NOW() WHERE id = ${id}`;
  }
  if (body.closing_section !== undefined) {
    await sql`UPDATE transit_blog_posts SET closing_section = ${body.closing_section}, updated_at = NOW() WHERE id = ${id}`;
  }
  if (body.review_notes !== undefined) {
    await sql`UPDATE transit_blog_posts SET review_notes = ${body.review_notes}, reviewed_at = NOW(), updated_at = NOW() WHERE id = ${id}`;
  }

  const updated = await sql`
    SELECT * FROM transit_blog_posts WHERE id = ${id}
  `;

  return NextResponse.json({ post: updated.rows[0] });
}
