import { NextRequest, NextResponse } from 'next/server';
import { getCachedSnapshot } from '@/lib/cosmic-snapshot/cache';
import { requireUser } from '@/lib/ai/auth';

export const runtime = 'edge';

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

    return NextResponse.json(snapshot, {
      headers: {
        'Cache-Control': 'public, s-maxage=14400, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('[cosmic/snapshot] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cosmic snapshot' },
      { status: 500 },
    );
  }
}
