import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

const MAX_NAME_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 1200;

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
    await prisma.testimonial.create({
      data: {
        name,
        message,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Testimonials API] Failed to create testimonial', error);
    return NextResponse.json(
      { error: 'Failed to save testimonial. Please try again later.' },
      { status: 500 },
    );
  }
}
