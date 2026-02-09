#!/usr/bin/env tsx
/**
 * Duplicate existing Instagram posts to TikTok platform
 * - Creates TikTok versions of all Instagram posts
 * - Uses vertical story format for TikTok (1080x1920)
 * - Maintains same content and scheduling
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function duplicateToTikTok() {
  console.log('📱 Duplicating Instagram posts to TikTok...\n');

  // Get all Instagram posts
  const instagramPosts = await prisma.socialPost.findMany({
    where: { platform: 'instagram' },
    orderBy: { scheduledDate: 'asc' },
  });

  console.log(`Found ${instagramPosts.length} Instagram posts to duplicate\n`);

  let created = 0;
  let skipped = 0;

  for (const igPost of instagramPosts) {
    try {
      // Check if TikTok version already exists
      const tiktokGroupKey = igPost.base_group_key?.replace(
        'instagram',
        'tiktok',
      );
      const existing = tiktokGroupKey
        ? await prisma.socialPost.findFirst({
            where: { base_group_key: tiktokGroupKey },
          })
        : null;

      if (existing) {
        console.log(`  ⊘ Skipping ${igPost.postType} (TikTok version exists)`);
        skipped++;
        continue;
      }

      // Get metadata with imageUrls
      const metadata = igPost.video_metadata as any;
      const imageUrls = metadata?.imageUrls || [];

      // For TikTok, use story format (vertical) instead of square
      const tiktokImageUrls = imageUrls.map((url: string) => {
        try {
          const urlObj = new URL(url);
          urlObj.searchParams.set('format', 'story'); // Vertical format
          return urlObj.toString();
        } catch {
          return url;
        }
      });

      // Create TikTok version
      await prisma.socialPost.create({
        data: {
          content: igPost.content,
          platform: 'tiktok',
          postType: igPost.postType,
          scheduledDate: igPost.scheduledDate,
          status: 'pending',
          image_url: tiktokImageUrls[0] || igPost.image_url,
          base_group_key: tiktokGroupKey || `tiktok-${igPost.id}`,
          video_metadata: {
            ...metadata,
            imageUrls: tiktokImageUrls,
            originalPlatform: 'instagram',
            instagramPostId: igPost.id,
          },
          week_theme: igPost.week_theme,
          week_start: igPost.week_start,
        },
      });

      console.log(`  ✓ Created TikTok version of ${igPost.postType}`);
      created++;
    } catch (error) {
      console.error(
        `  ✗ Failed to duplicate ${igPost.postType}:`,
        error instanceof Error ? error.message : 'Unknown',
      );
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Duplication Complete');
  console.log('='.repeat(60));
  console.log(`Created: ${created} TikTok posts`);
  console.log(`Skipped: ${skipped} (already exist)`);
  console.log(`\n✅ Go to /admin/social-posts to review TikTok posts!`);

  await prisma.$disconnect();
}

duplicateToTikTok().catch(async (error) => {
  console.error('❌ Fatal error:', error);
  await prisma.$disconnect();
  process.exit(1);
});
