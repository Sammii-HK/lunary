import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ testimonials });
}

export async function PATCH(request: NextRequest) {
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
    const updatedTestimonial = await prisma.testimonial.update({
      where: { id },
      data: { isPublished },
    });

    return NextResponse.json({ testimonial: updatedTestimonial });
  } catch (error) {
    console.error('[Admin Testimonials] Failed to update', error);
    return NextResponse.json(
      { error: 'Unable to update testimonial.' },
      { status: 500 },
    );
  }
}
