/**
 * Reset podcast episodes with youtubeVideoId = "pending" from failed Succulent uploads
 * so the direct YouTube API upload script can pick them up.
 *
 * Usage:
 *   pnpm exec tsx scripts/reset-pending-youtube-podcasts.ts
 *   pnpm exec tsx scripts/reset-pending-youtube-podcasts.ts --dry-run
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { prisma } from '../src/lib/prisma';

const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  // Find all episodes with "pending" YouTube state
  const pendingEpisodes = await prisma.podcastEpisode.findMany({
    where: {
      youtubeVideoId: 'pending',
    },
    orderBy: { episodeNumber: 'asc' },
    select: {
      id: true,
      episodeNumber: true,
      title: true,
      youtubeVideoId: true,
      youtubeVideoUrl: true,
    },
  });

  if (pendingEpisodes.length === 0) {
    console.log('No episodes with youtubeVideoId = "pending" found.\n');

    // Show current state of all episodes
    const allEpisodes = await prisma.podcastEpisode.findMany({
      orderBy: { episodeNumber: 'asc' },
      select: {
        episodeNumber: true,
        title: true,
        youtubeVideoId: true,
        status: true,
      },
    });

    console.log('Current episode state:');
    for (const ep of allEpisodes) {
      const ytState = ep.youtubeVideoId
        ? `YouTube: ${ep.youtubeVideoId}`
        : 'No YouTube upload';
      console.log(`  Ep ${ep.episodeNumber}: ${ep.title} — ${ytState}`);
    }

    await prisma.$disconnect();
    return;
  }

  console.log(
    `Found ${pendingEpisodes.length} episodes with "pending" YouTube state:\n`,
  );
  for (const ep of pendingEpisodes) {
    console.log(`  Ep ${ep.episodeNumber}: ${ep.title}`);
  }
  console.log('');

  if (DRY_RUN) {
    console.log(
      '🧪 DRY RUN — would reset youtubeVideoId and youtubeVideoUrl to null',
    );
    await prisma.$disconnect();
    return;
  }

  // Reset pending episodes
  const result = await prisma.podcastEpisode.updateMany({
    where: {
      youtubeVideoId: 'pending',
    },
    data: {
      youtubeVideoId: null,
      youtubeVideoUrl: null,
    },
  });

  console.log(`Reset ${result.count} episodes — youtubeVideoId set to null.`);
  console.log(
    'Run the upload script to retry:\n  pnpm exec tsx scripts/upload-podcasts-to-youtube.ts',
  );

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
