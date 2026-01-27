import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tourId } = await req.json();

    if (!tourId) {
      return NextResponse.json(
        { error: 'Tour ID is required' },
        { status: 400 },
      );
    }

    await prisma.tourProgress.upsert({
      where: {
        user_tour_unique: {
          userId: session.user.id,
          tourId,
        },
      },
      update: {
        status: 'COMPLETED',
        completedAt: new Date(),
        lastShownAt: new Date(),
      },
      create: {
        userId: session.user.id,
        tourId,
        status: 'COMPLETED',
        completedAt: new Date(),
        lastShownAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error completing tour:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
