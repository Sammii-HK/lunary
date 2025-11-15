import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/ai/auth';
import { getCachedSnapshot } from '@/lib/cosmic-snapshot/cache';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    const date = dateParam ? new Date(dateParam) : new Date();
    const snapshot = await getCachedSnapshot(user.id, date);

    if (!snapshot) {
      return NextResponse.json(
        { error: 'Cosmic snapshot not found' },
        { status: 404 },
      );
    }

    const sun =
      snapshot.birthChart?.placements?.find((p: any) => p.planet === 'Sun')
        ?.sign || 'Unknown';
    const moon =
      snapshot.birthChart?.placements?.find((p: any) => p.planet === 'Moon')
        ?.sign || 'Unknown';
    const rising =
      snapshot.birthChart?.placements?.find(
        (p: any) => p.planet === 'Ascendant',
      )?.sign || 'Unknown';

    const moonPhase = snapshot.moon?.phase || 'New Moon';
    const moonEmoji = snapshot.moon?.emoji || '🌑';
    const keyTransit =
      snapshot.currentTransits?.[0]?.aspect ||
      `${snapshot.currentTransits?.[0]?.from || 'Current'} ${snapshot.currentTransits?.[0]?.aspect || 'energy'}`;

    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    const ogImageUrl = `${baseUrl}/api/og/user-cosmic?sun=${encodeURIComponent(sun)}&moon=${encodeURIComponent(moon)}&rising=${encodeURIComponent(rising)}&moonPhase=${encodeURIComponent(moonPhase)}&moonEmoji=${encodeURIComponent(moonEmoji)}&transit=${encodeURIComponent(keyTransit)}&name=${encodeURIComponent(user.displayName || 'Your')}`;

    const shareUrl = `${baseUrl}/cosmic-state`;

    return NextResponse.json({
      success: true,
      card: {
        sun,
        moon,
        rising,
        moonPhase,
        moonEmoji,
        keyTransit,
        ogImageUrl,
        shareUrl,
      },
    });
  } catch (error) {
    console.error('[share/cosmic-card] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate cosmic card' },
      { status: 500 },
    );
  }
}
