import { NextRequest, NextResponse } from 'next/server';
import { generateDailyBatch } from '@/lib/instagram/content-orchestrator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

/**
 * Generate Instagram content for a full week (7 days)
 *
 * POST /api/admin/instagram/generate-weekly
 * Body: { startDate: '2026-02-09' }
 *
 * Generates memes, carousels, daily cosmic posts, and quotes for 7 consecutive days
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate } = body;

    if (!startDate) {
      return NextResponse.json(
        { error: 'startDate is required' },
        { status: 400 },
      );
    }

    console.log(
      `[Instagram Weekly] Generating content for week starting ${startDate}`,
    );

    const startDateObj = new Date(startDate);
    const results: Array<{
      date: string;
      success: boolean;
      postsGenerated: number;
      error?: string;
    }> = [];
    let totalPosts = 0;

    // Generate content for 7 consecutive days
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDateObj);
      date.setDate(startDateObj.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      try {
        console.log(`  [Day ${i + 1}/7] Generating content for ${dateStr}...`);

        // Generate content batch for this day
        const batch = await generateDailyBatch(dateStr);

        if (!batch || !batch.posts || batch.posts.length === 0) {
          throw new Error('No posts generated');
        }

        // Save to social_posts table
        for (const post of batch.posts) {
          try {
            const groupKey = `instagram-${dateStr}-${post.type}`;

            // Check if post already exists
            const existingPost = await prisma.socialPost.findFirst({
              where: { base_group_key: groupKey },
            });

            // For carousels, store all image URLs pipe-delimited so
            // buildPlatformPayload can split them into multiple media items.
            // For other post types, use the first image URL.
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
              `    Failed to save ${post.type} to database:`,
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

        console.log(
          `    ✅ Generated ${batch.posts.length} posts for ${dateStr}`,
        );
      } catch (error) {
        console.error(
          `    ❌ Failed to generate content for ${dateStr}:`,
          error,
        );
        results.push({
          date: dateStr,
          success: false,
          postsGenerated: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Rate limit between days (1 second)
      if (i < 6) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    const successfulDays = results.filter((r) => r.success).length;

    console.log(
      `[Instagram Weekly] Generated ${totalPosts} posts across ${successfulDays}/7 days`,
    );

    return NextResponse.json({
      success: true,
      totalPosts,
      daysGenerated: successfulDays,
      weekStart: startDate,
      results,
    });
  } catch (error) {
    console.error('[Instagram Weekly] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
