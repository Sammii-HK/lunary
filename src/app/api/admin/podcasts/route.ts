import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { selectPodcastTopics } from '@/lib/podcast/content-rotation';
import { requireAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === '1';

    const episodes = await prisma.podcastEpisode.findMany({
      orderBy: { episodeNumber: 'desc' },
    });

    let nextTopicPreview = null;
    if (preview) {
      const nextEpisodeNumber =
        episodes.length > 0 ? episodes[0].episodeNumber + 1 : 1;
      const allSlugs = episodes.flatMap((ep) => ep.grimoireSlugs);
      const topics = selectPodcastTopics(nextEpisodeNumber, allSlugs);
      nextTopicPreview = {
        episodeNumber: nextEpisodeNumber,
        topics: topics.map((t) => ({ title: t.title, slug: t.slug })),
        coveredCount: allSlugs.length,
      };
    }

    return NextResponse.json({
      success: true,
      episodes,
      ...(nextTopicPreview ? { nextTopicPreview } : {}),
    });
  } catch (error) {
    console.error('[Admin Podcasts] Failed to fetch episodes', error);
    return NextResponse.json(
      { error: 'Failed to fetch episodes' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await request.json();
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Missing episode id' },
        { status: 400 },
      );
    }

    const episode = await prisma.podcastEpisode.findUnique({ where: { id } });
    if (!episode) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }

    await prisma.podcastEpisode.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      deleted: {
        id: episode.id,
        episodeNumber: episode.episodeNumber,
        title: episode.title,
      },
    });
  } catch (error) {
    console.error('[Admin Podcasts] Failed to delete episode', error);
    return NextResponse.json(
      { error: 'Failed to delete episode' },
      { status: 500 },
    );
  }
}
