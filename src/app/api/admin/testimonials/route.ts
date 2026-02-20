import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdminAuth } from '@/lib/admin-auth';

type TestimonialRow = {
  id: number;
  name: string;
  message: string;
  isPublished: boolean;
  createdAt: string;
};

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const result = await sql<TestimonialRow>`
    SELECT
      id,
      name,
      message,
      is_published AS "isPublished",
      created_at AS "createdAt"
    FROM testimonials
    ORDER BY created_at DESC
  `;

  return NextResponse.json({ testimonials: result.rows });
}

export async function PATCH(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  let payload: { id?: number; isPublished?: boolean };

  try {
    payload = (await request.json()) as { id?: number; isPublished?: boolean };
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { id, isPublished } = payload;

  if (typeof id !== 'number' || typeof isPublished !== 'boolean') {
    return NextResponse.json(
      { error: 'Missing or invalid id/isPublished values.' },
      { status: 400 },
    );
  }

  try {
    const result = await sql<TestimonialRow>`
      UPDATE testimonials
      SET is_published = ${isPublished}
      WHERE id = ${id}
      RETURNING
        id,
        name,
        message,
        is_published AS "isPublished",
        created_at AS "createdAt"
    `;

    return NextResponse.json({ testimonial: result.rows[0] ?? null });
  } catch (error) {
    console.error('[Admin Testimonials] Failed to update', error);
    return NextResponse.json(
      { error: 'Unable to update testimonial.' },
      { status: 500 },
    );
  }
}
