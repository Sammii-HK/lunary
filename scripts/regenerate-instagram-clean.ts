#!/usr/bin/env tsx
/**
 * Clean regeneration of Instagram content
 * - Deletes ALL existing Instagram posts
 * - Generates fresh content with new carousel system
 * - Uses full grimoire databases (200+ crystals, 200+ spells)
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local FIRST - before any other imports
config({ path: resolve(process.cwd(), '.env.local') });

// Use PRODUCTION URLs for shareable content (so Succulent can access images)
process.env.NEXT_PUBLIC_BASE_URL = 'https://lunary.app';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanRegenerate() {
  // Dynamic import AFTER env is set
  const { generateDailyBatch } =
    await import('../src/lib/instagram/content-orchestrator');
  console.log('🧹 Clean Instagram Regeneration\n');
  console.log('================================================\n');

  // Step 1: Delete ALL existing Instagram posts
  console.log('Step 1: Deleting existing Instagram posts...');

  // First, show what we're about to delete
  const existingPosts = await prisma.socialPost.findMany({
    where: { platform: 'instagram' },
    select: { id: true, postType: true, createdAt: true },
  });
  console.log(
    `   Found ${existingPosts.length} existing Instagram posts to delete`,
  );

  if (existingPosts.length > 0) {
    console.log(
      '   Sample IDs:',
      existingPosts
        .slice(0, 5)
        .map((p) => p.id)
        .join(', '),
    );
  }

  const deleteResult = await prisma.socialPost.deleteMany({
    where: { platform: 'instagram' },
  });
  console.log(`✅ Deleted ${deleteResult.count} old Instagram posts\n`);

  // Verify deletion
  const remainingPosts = await prisma.socialPost.count({
    where: { platform: 'instagram' },
  });
  if (remainingPosts > 0) {
    console.warn(
      `⚠️  WARNING: ${remainingPosts} Instagram posts still remain!`,
    );
  } else {
    console.log('✅ Verified: All Instagram posts deleted\n');
  }

  // Step 2: Generate fresh content for this week
  console.log('Step 2: Generating fresh content with NEW system...');
  console.log('  - Using 200+ crystals database');
  console.log('  - Using 200+ spells database');
  console.log('  - Using ALL tarot cards');
  console.log('  - Expanded carousel slides (6-8 slides)');
  console.log('  - Real astronomical moon phases');
  console.log('  - Brand violet/purple colors\n');

  const today = new Date();
  const results: Array<{
    date: string;
    success: boolean;
    postsGenerated: number;
    error?: string;
  }> = [];
  let totalPosts = 0;

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    try {
      console.log(`\n📅 ${dateStr}...`);

      const batch = await generateDailyBatch(dateStr);

      if (!batch || !batch.posts || batch.posts.length === 0) {
        throw new Error('No posts generated');
      }

      // Save to social_posts table (Instagram + TikTok)
      for (const post of batch.posts) {
        try {
          // Create Instagram version
          // Append hashtags to caption for discoverability (limit to 5 for best practice)
          const hashtagString = post.hashtags?.length
            ? '\n\n' +
              post.hashtags
                .slice(0, 5)
                .map((h) => (h.startsWith('#') ? h : `#${h}`))
                .join(' ')
            : '';
          const fullCaption = post.caption + hashtagString;

          // For carousels, store all image URLs pipe-delimited so
          // buildPlatformPayload can split them into multiple media items.
          const imageUrls = post.imageUrls || [];
          const imageUrlValue =
            post.type === 'carousel' && imageUrls.length > 1
              ? imageUrls.join('|')
              : imageUrls[0] || null;

          const igPost = await prisma.socialPost.create({
            data: {
              content: fullCaption,
              platform: 'instagram',
              postType:
                post.type === 'carousel' ? 'instagram_carousel' : post.type,
              scheduledDate: new Date(post.scheduledTime),
              status: 'pending',
              image_url: imageUrlValue,
              base_group_key: `instagram-${dateStr}-${post.type}`,
              video_metadata: {
                hashtags: post.hashtags || [],
                metadata: post.metadata || {},
                imageUrls: imageUrls,
              },
            },
          });

          // Create TikTok version with vertical format
          const tiktokImageUrls = imageUrls.map((url) => {
            try {
              const urlObj = new URL(url);
              urlObj.searchParams.set('format', 'story'); // Vertical 1080x1920
              return urlObj.toString();
            } catch {
              return url;
            }
          });
          const tiktokImageUrlValue =
            post.type === 'carousel' && tiktokImageUrls.length > 1
              ? tiktokImageUrls.join('|')
              : tiktokImageUrls[0] || null;

          await prisma.socialPost.create({
            data: {
              content: fullCaption,
              platform: 'tiktok',
              postType:
                post.type === 'carousel' ? 'instagram_carousel' : post.type,
              scheduledDate: new Date(post.scheduledTime),
              status: 'pending',
              image_url: tiktokImageUrlValue,
              base_group_key: `tiktok-${dateStr}-${post.type}`,
              video_metadata: {
                hashtags: post.hashtags || [],
                metadata: post.metadata || {},
                imageUrls: tiktokImageUrls,
                originalPlatform: 'instagram',
              },
            },
          });

          // Log image URL to verify timestamp
          const imageUrl = post.imageUrls?.[0] || '';
          const hasTimestamp = imageUrl.includes('&t=');
          console.log(
            `      ✓ ${post.type} (IG: ${igPost.id}, TT: created) ${hasTimestamp ? '✓ Fresh URL' : '✗ Missing timestamp!'}`,
          );
        } catch (dbError) {
          console.warn(
            `   ⚠️  Failed to save ${post.type}:`,
            dbError instanceof Error ? dbError.message : 'Unknown',
          );
        }
      }

      totalPosts += batch.posts.length;
      results.push({
        date: dateStr,
        success: true,
        postsGenerated: batch.posts.length,
      });

      console.log(`   ✅ Generated ${batch.posts.length} posts`);
    } catch (error) {
      console.error(`   ❌ Failed:`, error);
      results.push({
        date: dateStr,
        success: false,
        postsGenerated: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    await new Promise((r) => setTimeout(r, 500));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Regeneration Complete');
  console.log('='.repeat(60));
  console.log(`Total posts generated: ${totalPosts}`);
  console.log(
    `Successful days: ${results.filter((r) => r.success).length}/7\n`,
  );

  results.forEach((result) => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.date}: ${result.postsGenerated} posts`);
  });

  console.log('\n🎉 Done! Go to /admin/social-posts to review.');
  console.log('   Instagram carousels now have 6-8 slides with rich content!');

  await prisma.$disconnect();
}

cleanRegenerate().catch(async (error) => {
  console.error('❌ Fatal error:', error);
  await prisma.$disconnect();
  process.exit(1);
});
