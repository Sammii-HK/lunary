import { NextResponse } from 'next/server';

const POSTGRES_URL = process.env.POSTGRES_URL;

type Row = {
  id: number;
  name: string;
  message: string;
  createdAt: Date;
};

export async function GET() {
  if (!POSTGRES_URL) {
    return NextResponse.json({
      testimonials: [],
    });
  }

  const { prisma } = await import('@/lib/prisma');

  const testimonials = await prisma.testimonial.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ testimonials });
}
