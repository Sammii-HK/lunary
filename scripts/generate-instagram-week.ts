#!/usr/bin/env tsx
/**
 * Generate Instagram content for the current week (7 days starting today)
 *
 * Usage:
 *   pnpm tsx scripts/generate-instagram-week.ts
 *
 * This will generate:
 * - Memes, carousels, daily cosmic posts, quotes for each day
 * - 4 posts per day = 28 posts total
 * - Content is deterministic (same date = same content)
 */

import { generateDailyBatch } from '../src/lib/instagram/content-orchestrator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DayResult {
  date: string;
  success: boolean;
  postsGenerated: number;
  error?: string;
}

async function generateInstagramWeek() {
  console.log('📸 Generating Instagram content for the week...\n');

  const today = new Date();
  const results: DayResult[] = [];
  let totalPosts = 0;

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    try {
      console.log(`\n📅 Generating content for ${dateStr}...`);

      // Generate content batch for this day
      const batch = await generateDailyBatch(dateStr);

      if (!batch || !batch.posts || batch.posts.length === 0) {
        throw new Error('No posts generated');
      }

      console.log(`   ✅ Generated ${batch.posts.length} posts:`);
      batch.posts.forEach((post) => {
        console.log(`      - ${post.type} (${post.scheduledTime})`);
      });

      // Save to social_posts table (shows in approval queue)
      for (const post of batch.posts) {
        try {
          const groupKey = `instagram-${dateStr}-${post.type}`;

          // Check if post already exists
          const existingPost = await prisma.socialPost.findFirst({
            where: { base_group_key: groupKey },
          });

          // For carousels, store all image URLs pipe-delimited so
          // buildPlatformPayload can split them into multiple media items.
          const imageUrls = post.imageUrls || [];
          const imageUrlValue =
            post.type === 'carousel' && imageUrls.length > 1
              ? imageUrls.join('|')
              : imageUrls[0] || null;

          if (existingPost) {
            // Update existing post
            await prisma.socialPost.update({
              where: { id: existingPost.id },
              data: {
                content: post.caption,
                scheduledDate: new Date(post.scheduledTime),
                image_url: imageUrlValue,
                postType:
                  post.type === 'carousel'
                    ? 'instagram_carousel'
                    : existingPost.postType,
                video_metadata: {
                  hashtags: post.hashtags || [],
                  metadata: post.metadata || {},
                  imageUrls: imageUrls,
                },
              },
            });
          } else {
            // Create new post
            await prisma.socialPost.create({
              data: {
                content: post.caption,
                platform: 'instagram',
                postType:
                  post.type === 'carousel' ? 'instagram_carousel' : post.type,
                scheduledDate: new Date(post.scheduledTime),
                status: 'pending',
                image_url: imageUrlValue,
                base_group_key: groupKey,
                video_metadata: {
                  hashtags: post.hashtags || [],
                  metadata: post.metadata || {},
                  imageUrls: imageUrls,
                },
              },
            });
          }
        } catch (dbError) {
          console.warn(
            `      ⚠️  Failed to save ${post.type} to database:`,
            dbError instanceof Error ? dbError.message : 'Unknown error',
          );
        }
      }

      totalPosts += batch.posts.length;
      results.push({
        date: dateStr,
        success: true,
        postsGenerated: batch.posts.length,
      });
    } catch (error) {
      console.error(`   ❌ Failed to generate content for ${dateStr}:`, error);
      results.push({
        date: dateStr,
        success: false,
        postsGenerated: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Rate limit between days
    if (i < 6) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Generation Summary');
  console.log('='.repeat(60));
  console.log(`Total days processed: ${results.length}`);
  console.log(
    `Successful: ${results.filter((r) => r.success).length}/${results.length}`,
  );
  console.log(`Total posts generated: ${totalPosts}`);
  console.log('');

  results.forEach((result) => {
    const icon = result.success ? '✅' : '❌';
    console.log(
      `${icon} ${result.date}: ${result.postsGenerated} posts${result.error ? ` (${result.error})` : ''}`,
    );
  });

  console.log('');

  if (results.every((r) => r.success)) {
    console.log('🎉 All Instagram content generated successfully!');
    console.log('💾 Posts saved to social_posts table');
    console.log(
      '\n📋 Next steps: Go to /admin/social-posts to review and approve!',
    );
    console.log(
      '   Once approved, posts will be sent to Succulent for scheduling.',
    );
  } else {
    console.log('⚠️  Some days failed to generate. Check errors above.');
    await prisma.$disconnect();
    process.exit(1);
  }

  await prisma.$disconnect();
}

// Run the script
generateInstagramWeek().catch(async (error) => {
  console.error('❌ Fatal error:', error);
  await prisma.$disconnect();
  process.exit(1);
});
