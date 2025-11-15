import { NextRequest, NextResponse } from 'next/server';
import { getGlobalCosmicData } from '@/lib/cosmic-snapshot/global-cache';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    const date = dateParam ? new Date(dateParam) : new Date();
    const data = await getGlobalCosmicData(date);

    if (!data) {
      return NextResponse.json(
        { error: 'Global cosmic data not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=7200, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('[cosmic/global] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch global cosmic data' },
      { status: 500 },
    );
  }
}
