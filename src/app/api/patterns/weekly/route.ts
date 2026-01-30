import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { generateTarotSeasonSnapshot } from '@/lib/patterns/snapshot/generator';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate 7-day tarot season snapshot
    const snapshot = await generateTarotSeasonSnapshot(session.user.id, 7);

    if (!snapshot) {
      return NextResponse.json(
        { pattern: null, message: 'Not enough readings (need 3+)' },
        { status: 200 },
      );
    }

    // Transform snapshot data to match ShareWeeklyPattern interface
    const pattern = {
      season: snapshot.data.season,
      suitDistribution: snapshot.data.suitDistribution,
      frequentCards: snapshot.data.frequentCards,
      period: snapshot.data.period,
      readingCount: snapshot.data.totalReadings || 0,
    };

    return NextResponse.json({
      pattern,
      success: true,
    });
  } catch (error) {
    console.error('[Weekly Pattern API] Failed to fetch pattern:', error);
    return NextResponse.json(
      { error: 'Internal server error', pattern: null },
      { status: 500 },
    );
  }
}
