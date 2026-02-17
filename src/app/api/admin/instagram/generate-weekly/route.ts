import { NextRequest, NextResponse } from 'next/server';
import {
  generateDailyBatch,
  generateLinkedInDidYouKnowBatch,
} from '@/lib/instagram/content-orchestrator';
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

            // For carousels (including angel number carousels), store all
            // image URLs pipe-delimited so buildPlatformPayload can split
            // them into multiple media items.
            const isCarousel =
              post.type === 'carousel' || post.type === 'angel_number_carousel';
            const imageUrls = post.imageUrls || [];
            const imageUrlValue =
              isCarousel && imageUrls.length > 1
                ? imageUrls.join('|')
                : imageUrls[0] || null;

            const postData = {
              content: post.caption,
              postType: isCarousel ? 'instagram_carousel' : post.type,
              scheduledDate: new Date(post.scheduledTime),
              image_url: imageUrlValue,
              video_metadata: {
                hashtags: post.hashtags || [],
                metadata: post.metadata || {},
                imageUrls: imageUrls,
              },
            };

            if (existingPost) {
              await prisma.socialPost.update({
                where: { id: existingPost.id },
                data: postData,
              });
            } else {
              await prisma.socialPost.create({
                data: {
                  ...postData,
                  platform: 'instagram',
                  status: 'pending',
                  base_group_key: groupKey,
                },
              });
            }

            // Cross-post to Facebook with the same content
            const fbGroupKey = `facebook-${dateStr}-${post.type}`;
            const existingFbPost = await prisma.socialPost.findFirst({
              where: { base_group_key: fbGroupKey },
            });

            if (existingFbPost) {
              await prisma.socialPost.update({
                where: { id: existingFbPost.id },
                data: postData,
              });
            } else {
              await prisma.socialPost.create({
                data: {
                  ...postData,
                  platform: 'facebook',
                  status: 'pending',
                  base_group_key: fbGroupKey,
                },
              });
            }

            // Cross-post to Pinterest with the same content
            const pinGroupKey = `pinterest-${dateStr}-${post.type}`;
            const existingPinPost = await prisma.socialPost.findFirst({
              where: { base_group_key: pinGroupKey },
            });

            if (existingPinPost) {
              await prisma.socialPost.update({
                where: { id: existingPinPost.id },
                data: postData,
              });
            } else {
              await prisma.socialPost.create({
                data: {
                  ...postData,
                  platform: 'pinterest',
                  status: 'pending',
                  base_group_key: pinGroupKey,
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

    // Generate LinkedIn "Did You Know" image posts (Mon, Wed, Fri)
    try {
      const linkedInDykPosts = generateLinkedInDidYouKnowBatch(startDate);
      for (const post of linkedInDykPosts) {
        const dykDateStr = post.scheduledTime.split('T')[0];
        const groupKey = `linkedin-${dykDateStr}-did_you_know`;

        const isCarousel = false;
        const imageUrlValue = post.imageUrls[0] || null;

        const postData = {
          content: post.caption,
          postType: post.type,
          scheduledDate: new Date(post.scheduledTime),
          image_url: imageUrlValue,
          video_metadata: {
            hashtags: post.hashtags || [],
            metadata: post.metadata || {},
            imageUrls: post.imageUrls,
          },
        };

        const existingPost = await prisma.socialPost.findFirst({
          where: { base_group_key: groupKey },
        });

        if (existingPost) {
          await prisma.socialPost.update({
            where: { id: existingPost.id },
            data: postData,
          });
        } else {
          await prisma.socialPost.create({
            data: {
              ...postData,
              platform: 'linkedin',
              status: 'pending',
              base_group_key: groupKey,
            },
          });
        }
      }
      totalPosts += linkedInDykPosts.length;
      console.log(
        `  ✅ Generated ${linkedInDykPosts.length} LinkedIn DYK posts`,
      );
    } catch (linkedInError) {
      console.warn(
        '[Instagram Weekly] Failed to generate LinkedIn DYK posts:',
        linkedInError instanceof Error
          ? linkedInError.message
          : 'Unknown error',
      );
    }

    const successfulDays = results.filter((r) => r.success).length;
    const failedDays = results.filter((r) => !r.success);

    console.log(
      `[Instagram Weekly] Generated ${totalPosts} posts across ${successfulDays}/7 days`,
    );

    if (totalPosts === 0) {
      const errors = failedDays.map((r) => `${r.date}: ${r.error}`).join('; ');
      return NextResponse.json({
        success: false,
        totalPosts: 0,
        daysGenerated: 0,
        weekStart: startDate,
        error: `No Instagram posts generated. Errors: ${errors}`,
        results,
      });
    }

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
