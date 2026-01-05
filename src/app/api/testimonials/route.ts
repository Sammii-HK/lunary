import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

const MAX_NAME_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 1200;
const FEATURED_LIMIT = 8;

type PublicTestimonialRow = {
  id: number;
  name: string;
  message: string;
  createdAt: string;
};

function validateInput(name: string, message: string) {
  if (!name) {
    return 'Please provide your name.';
  }

  if (name.length > MAX_NAME_LENGTH) {
    return `Name must be ${MAX_NAME_LENGTH} characters or less.`;
  }

  if (!message) {
    return 'Please write your testimonial.';
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return `Testimonial cannot exceed ${MAX_MESSAGE_LENGTH} characters.`;
  }

  return null;
}

export async function GET() {
  const result = await sql<PublicTestimonialRow>`
    SELECT
      id,
      name,
      message,
      created_at AS "createdAt"
    FROM testimonials
    WHERE is_published = true
    ORDER BY created_at DESC
    LIMIT ${FEATURED_LIMIT}
  `;

  return NextResponse.json({ testimonials: result.rows });
}

export async function POST(request: NextRequest) {
  let payload: { name?: string; message?: string };

  try {
    payload = (await request.json()) as { name?: string; message?: string };
  } catch (error) {
    return NextResponse.json(
      { error: 'Unable to parse request body.' },
      { status: 400 },
    );
  }

  const name = (payload.name ?? '').toString().trim();
  const message = (payload.message ?? '').toString().trim();
  const validationError = validateInput(name, message);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    await sql`
      INSERT INTO testimonials (name, message)
      VALUES (${name}, ${message})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Testimonials API] Failed to create testimonial', error);
    return NextResponse.json(
      { error: 'Failed to save testimonial. Please try again later.' },
      { status: 500 },
    );
  }
}
