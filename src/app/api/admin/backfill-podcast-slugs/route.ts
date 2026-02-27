import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getAllPodcastEntries } from '@/lib/podcast/content-rotation';

export const dynamic = 'force-dynamic';

/**
 * One-time backfill: match episode titles to grimoire slugs.
 * GET  ?dry=1  → preview what would be updated (no writes)
 * POST         → execute the backfill
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  return run(false);
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  return run(true);
}

async function run(execute: boolean) {
  // Build a title → slug lookup across all categories
  const allEntries = getAllPodcastEntries();
  const titleToSlug = new Map<string, string>();
  for (const entries of allEntries.values()) {
    for (const entry of entries) {
      titleToSlug.set(entry.title.toLowerCase(), entry.slug);
    }
  }

  const episodes = await prisma.podcastEpisode.findMany({
    orderBy: { episodeNumber: 'asc' },
    select: { id: true, episodeNumber: true, title: true, grimoireSlugs: true },
  });

  const results: {
    episodeNumber: number;
    title: string;
    found: string | null;
    hadSlugs: boolean;
  }[] = [];

  for (const ep of episodes) {
    const hadSlugs = ep.grimoireSlugs.length > 0;

    // Extract topic from "The Grimoire: {Topic}" pattern
    const topicName = ep.title
      .replace(/^The Grimoire:\s*/i, '')
      .trim()
      .toLowerCase();
    const slug = titleToSlug.get(topicName) ?? null;

    results.push({
      episodeNumber: ep.episodeNumber,
      title: ep.title,
      found: slug,
      hadSlugs,
    });

    if (execute && slug && !hadSlugs) {
      await prisma.podcastEpisode.update({
        where: { id: ep.id },
        data: { grimoireSlugs: [slug] },
      });
    }
  }

  const updated = results.filter((r) => r.found && !r.hadSlugs);
  const alreadySet = results.filter((r) => r.hadSlugs);
  const noMatch = results.filter((r) => !r.found && !r.hadSlugs);

  return NextResponse.json({
    executed: execute,
    updated: updated.length,
    alreadySet: alreadySet.length,
    noMatch: noMatch.map((r) => ({
      episodeNumber: r.episodeNumber,
      title: r.title,
    })),
    preview: results.map((r) => ({
      episodeNumber: r.episodeNumber,
      title: r.title,
      slug: r.found,
      action: r.hadSlugs
        ? 'skip (already set)'
        : r.found
          ? execute
            ? 'updated'
            : 'would update'
          : 'no match',
    })),
  });
}
