import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { checkRateLimit } from '@/lib/api/rate-limit';

export const dynamic = 'force-dynamic';

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
  // Rate limit: 3 submissions per IP per 10 minutes
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const { allowed } = checkRateLimit(`testimonial:${ip}`, 3, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  let payload: { name?: string; message?: string; turnstileToken?: string };

  try {
    payload = (await request.json()) as {
      name?: string;
      message?: string;
      turnstileToken?: string;
    };
  } catch (error) {
    return NextResponse.json(
      { error: 'Unable to parse request body.' },
      { status: 400 },
    );
  }

  // Verify Turnstile token
  if (process.env.TURNSTILE_SECRET_KEY) {
    if (!payload.turnstileToken) {
      return NextResponse.json(
        { error: 'Security check required' },
        { status: 403 },
      );
    }

    const formData = new FormData();
    formData.append('secret', process.env.TURNSTILE_SECRET_KEY);
    formData.append('response', payload.turnstileToken);

    const cfResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'POST', body: formData },
    );
    const cfResult = (await cfResponse.json()) as { success: boolean };

    if (!cfResult.success) {
      return NextResponse.json(
        { error: 'Security check failed. Please try again.' },
        { status: 403 },
      );
    }
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
