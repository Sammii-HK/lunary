import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const episodes = await prisma.podcastEpisode.findMany({
      orderBy: { episodeNumber: 'desc' },
    });

    return NextResponse.json({ success: true, episodes });
  } catch (error) {
    console.error('[Admin Podcasts] Failed to fetch episodes', error);
    return NextResponse.json(
      { error: 'Failed to fetch episodes' },
      { status: 500 },
    );
  }
}
