import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserTourContext } from '@/lib/feature-tours/tour-helpers';
import { getUserPlan } from '@/lib/subscription';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription tier
    const plan = await getUserPlan(session.user.id);

    // Get usage stats
    const aiUsage = await prisma.aiUsage.findUnique({
      where: { userId: session.user.id },
    });

    const tarotReadings = await prisma.tarotReadings.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    const collections = await prisma.collections.count({
      where: {
        userId: session.user.id,
        category: 'journal',
      },
    });

    // Calculate days active
    const userProfile = await prisma.userProfiles.findUnique({
      where: { userId: session.user.id },
      select: { createdAt: true },
    });

    const daysActive = userProfile
      ? Math.floor(
          (Date.now() - userProfile.createdAt.getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

    const context = await getUserTourContext(
      session.user.id,
      plan.planKey,
      aiUsage?.count || 0,
      tarotReadings,
      collections,
      daysActive,
    );

    return NextResponse.json(context);
  } catch (error) {
    console.error('Error fetching tour context:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
