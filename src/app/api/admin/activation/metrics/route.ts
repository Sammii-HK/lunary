import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    // Get metrics for the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Free users (signed up last 30 days)
    const freeUsersL30d = await prisma.subscriptions.count({
      where: {
        status: 'free',
        created_at: { gte: thirtyDaysAgo },
      },
    });

    // Total free users
    const totalFreeUsers = await prisma.subscriptions.count({
      where: { status: 'free' },
    });

    // Trial signups (last 30 days)
    const trialUsers = await prisma.subscriptions.findMany({
      where: {
        status: 'trial',
        created_at: { gte: thirtyDaysAgo },
      },
      select: { created_at: true },
    });

    // Paid users
    const paidUsers = await prisma.subscriptions.count({
      where: { is_paying: true },
    });

    // Calculate conversion rates
    const trialConversionRate =
      freeUsersL30d > 0 ? (trialUsers.length / freeUsersL30d) * 100 : 0;
    const paidConversionRate =
      trialUsers.length > 0 ? (paidUsers / trialUsers.length) * 100 : 0;

    // Average days to trial (from free signup to trial signup)
    let avgDaysToTrial = 3; // default
    if (trialUsers.length > 0) {
      const daysArray = trialUsers.map((tu) => {
        const freeUser = trialUsers[0];
        return freeUser.created_at
          ? Math.floor(
              (Date.now() - freeUser.created_at.getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : 0;
      });
      avgDaysToTrial = Math.round(
        daysArray.reduce((a, b) => a + b, 0) / daysArray.length,
      );
    }

    // Average trial to paid conversion time
    let avgDaysTrialToPaid = 7; // default
    const trialConversions = await prisma.subscriptions.findMany({
      where: {
        is_paying: true,
        status: { in: ['active', 'trial'] },
      },
      select: { trial_ends_at: true, created_at: true },
      take: 20,
    });

    if (trialConversions.length > 0) {
      const daysArray = trialConversions.map((tc) => {
        return tc.trial_ends_at && tc.created_at
          ? Math.floor(
              (tc.trial_ends_at.getTime() - tc.created_at.getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : 7;
      });
      avgDaysTrialToPaid = Math.round(
        daysArray.reduce((a, b) => a + b, 0) / daysArray.length,
      );
    }

    return NextResponse.json({
      totalFreeUsers,
      freeUsersL30d,
      trialSignups: trialUsers.length,
      trialConversionRate: Number(trialConversionRate.toFixed(2)),
      paidUsers,
      paidConversionRate: Number(paidConversionRate.toFixed(2)),
      avgDaysToTrial,
      avgDaysTrialToPaid,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 },
    );
  }
}
