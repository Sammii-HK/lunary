import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/ai/auth';
import { completeRitual, RitualType } from '@/lib/ritual/tracker';

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const userId = user.id;
    const body = await request.json();
    const { ritualType, metadata } = body;

    if (!ritualType || !['morning', 'evening', 'daily'].includes(ritualType)) {
      return NextResponse.json(
        { error: 'Invalid ritual type. Must be morning, evening, or daily' },
        { status: 400 },
      );
    }

    const today = new Date().toISOString().split('T')[0];

    const result = await completeRitual({
      userId,
      ritualType: ritualType as RitualType,
      date: today,
      metadata,
    });

    // Track ritual progress for skill tree
    try {
      const { incrementProgress } = await import('@/lib/progress/server');
      await incrementProgress(userId, 'ritual', 1);

      // Track ritual completion in canonical analytics
      const { conversionTracking } = await import('@/lib/analytics');
      conversionTracking.ritualStarted(userId, user.email, undefined, {
        context: 'ritual_complete',
        ritualType,
        ...metadata,
      });
    } catch (progressError) {
      console.warn(
        '[Ritual Complete] Failed to track progress:',
        progressError,
      );
    }

    return NextResponse.json({
      success: true,
      ritualStreak: result.ritualStreak,
      longestRitualStreak: result.longestRitualStreak,
    });
  } catch (error) {
    console.error('[Ritual Complete] Error:', error);
    return NextResponse.json(
      { error: 'Failed to complete ritual' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const userId = user.id;
    const { searchParams } = new URL(request.url);
    const date =
      searchParams.get('date') || new Date().toISOString().split('T')[0];

    const { getRitualStatus } = await import('@/lib/ritual/tracker');
    const status = await getRitualStatus(userId, date);

    return NextResponse.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error('[Ritual Status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get ritual status' },
      { status: 500 },
    );
  }
}
