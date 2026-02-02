import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/ai/auth';
import { generateTarotSeasonSnapshot } from '@/lib/patterns/snapshot/generator';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);

    // Generate 7-day tarot season snapshot
    const snapshot = await generateTarotSeasonSnapshot(user.id, 7);

    if (!snapshot || !snapshot.data) {
      return NextResponse.json(
        { pattern: null, message: 'Not enough readings (need 3+)' },
        { status: 200 },
      );
    }

    // Transform snapshot data to match ShareWeeklyPattern interface
    const pattern = {
      season: snapshot.data.season || null,
      suitDistribution: snapshot.data.suitDistribution || [],
      frequentCards: snapshot.data.frequentCards || [],
      period: snapshot.data.period || null,
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
