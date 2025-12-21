import { NextRequest, NextResponse } from 'next/server';
import { generateWeeklyContent } from '../../../../../utils/blog/weeklyContentGenerator';
import {
  generateFreeSubstackPost,
  generatePaidSubstackPost,
} from '../../../../../utils/substack/contentFormatter';
import { sendDiscordAdminNotification } from '@/lib/discord';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const {
      weekOffset = 0,
      publishFree = true,
      publishPaid = true,
    } = await request.json();

    const today = new Date();
    const targetDate = new Date(
      today.getTime() + weekOffset * 7 * 24 * 60 * 60 * 1000,
    );

    const dayOfWeek = targetDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(
      targetDate.getTime() - daysToMonday * 24 * 60 * 60 * 1000,
    );

    console.log(
      `📅 Generating Substack posts for week starting ${weekStart.toDateString()}`,
    );

    const weeklyData = await generateWeeklyContent(weekStart);
    const freePost = generateFreeSubstackPost(weeklyData);
    const paidPost = generatePaidSubstackPost(weeklyData);

    const { publishBothTiers, publishToSubstack } =
      await import('../../../../../utils/substack/publisher');

    let results;

    if (publishFree && publishPaid) {
      results = await publishBothTiers(freePost, paidPost);
    } else if (publishFree) {
      results = {
        free: await publishToSubstack(freePost, 'free'),
        paid: { success: false, tier: 'paid' as const, error: 'Skipped' },
      };
    } else if (publishPaid) {
      results = {
        free: { success: false, tier: 'free' as const, error: 'Skipped' },
        paid: await publishToSubstack(paidPost, 'paid'),
      };
    } else {
      return NextResponse.json(
        { error: 'Must specify at least one tier to publish' },
        { status: 400 },
      );
    }

    // Generate videos asynchronously after successful publishing
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    // Generate videos asynchronously after successful publishing
    // Videos are generated for the same week as the blog (weekOffset)
    if (
      (publishFree && results.free.success) ||
      (publishPaid && results.paid.success)
    ) {
      console.log(
        `🎬 Generating videos for week ${weekOffset} (week starting ${weekStart.toISOString()})...`,
      );

      // Track video generation results (shared across all video generation calls)
      const videoResults: Array<{
        type: string;
        success: boolean;
        error?: string;
      }> = [];

      // Helper function to send urgent Discord notification for video failures
      const sendVideoFailureNotification = async () => {
        const failedVideos = videoResults.filter((v) => !v.success);
        if (failedVideos.length === 0) return;

        const fields = failedVideos.map((v) => ({
          name: `${v.type}-form video`,
          value: v.error || 'Unknown error',
          inline: false,
        }));

        await sendDiscordAdminNotification({
          title: '🚨 Urgent: Video Generation Failed',
          message: `Failed to generate ${failedVideos.length} video(s) for week ${weekOffset}. Manual intervention required.`,
          priority: 'emergency',
          category: 'urgent',
          url: `${baseUrl}/admin/social-preview?week=${weekOffset}`,
          fields,
          dedupeKey: `video-generation-failed-${weekOffset}-${new Date().toISOString().split('T')[0]}`,
        });
      };

      // Generate short-form video
      console.log(`🎬 Generating short-form video for week ${weekOffset}...`);
      fetch(`${baseUrl}/api/video/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'short',
          week: weekOffset,
        }),
      })
        .then(async (res) => {
          if (res.ok) {
            const videoData = await res.json();
            console.log(
              `✅ Short-form video generated: ${videoData.video?.id || 'unknown'}`,
            );
            videoResults.push({ type: 'short', success: true });

            // Upload short-form to YouTube Shorts
            if (videoData.video?.id) {
              // Use generated postContent if available, otherwise fall back to default
              const youtubeDescription =
                videoData.video.postContent ||
                'Your weekly cosmic forecast from Lunary';

              await fetch(`${baseUrl}/api/youtube/upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  videoUrl: videoData.video.url,
                  videoId: videoData.video.id,
                  title: `Week of ${weeklyData.weekStart.toLocaleDateString()}`,
                  description: youtubeDescription,
                  type: 'short',
                  publishDate: new Date(weeklyData.weekStart).toISOString(),
                }),
              })
                .then(() => {
                  console.log('✅ Short-form video uploaded to YouTube');
                })
                .catch((err) => {
                  console.error(
                    '❌ Failed to upload short-form video to YouTube:',
                    err,
                  );
                });
            }
          } else {
            const errorText = await res.text();
            const error = `HTTP ${res.status}: ${errorText.substring(0, 200)}`;
            console.error(
              `❌ Short-form video generation failed: ${res.status} - ${errorText}`,
            );
            videoResults.push({ type: 'short', success: false, error });
            sendVideoFailureNotification();
          }
        })
        .catch(async (err) => {
          const error = err instanceof Error ? err.message : 'Unknown error';
          console.error('❌ Failed to generate short-form video:', err);
          videoResults.push({ type: 'short', success: false, error });
          sendVideoFailureNotification();
        });

      // Generate medium-form video (30-60s recap)
      console.log(`🎬 Generating medium-form video for week ${weekOffset}...`);
      fetch(`${baseUrl}/api/video/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'medium',
          week: weekOffset,
        }),
      })
        .then(async (res) => {
          if (res.ok) {
            const videoData = await res.json();
            console.log(
              `✅ Medium-form video generated: ${videoData.video?.id || 'unknown'}`,
            );
            videoResults.push({ type: 'medium', success: true });

            // Upload medium-form to YouTube Shorts (post immediately)
            if (videoData.video?.id) {
              // Use generated postContent if available, otherwise fall back to default
              const youtubeDescription =
                videoData.video.postContent ||
                'Your quick weekly cosmic forecast recap from Lunary';

              await fetch(`${baseUrl}/api/youtube/upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  videoUrl: videoData.video.url,
                  videoId: videoData.video.id,
                  title: `Weekly Cosmic Recap - Week of ${weeklyData.weekStart.toLocaleDateString()}`,
                  description: youtubeDescription,
                  type: 'short', // YouTube Shorts format
                  // Omit publishDate to post immediately
                }),
              })
                .then(() => {
                  console.log(
                    '✅ Medium-form video uploaded to YouTube Shorts',
                  );
                })
                .catch((err) => {
                  console.error(
                    '❌ Failed to upload medium-form video to YouTube Shorts:',
                    err,
                  );
                });
            }
          } else {
            const errorText = await res.text();
            const error = `HTTP ${res.status}: ${errorText.substring(0, 200)}`;
            console.error(
              `❌ Medium-form video generation failed: ${res.status} - ${errorText}`,
            );
            videoResults.push({ type: 'medium', success: false, error });
            sendVideoFailureNotification();
          }
        })
        .catch(async (err) => {
          const error = err instanceof Error ? err.message : 'Unknown error';
          console.error('❌ Failed to generate medium-form video:', err);
          videoResults.push({ type: 'medium', success: false, error });
          sendVideoFailureNotification();
        });

      // Generate long-form video
      const blogContent = {
        title: `Weekly Cosmic Forecast - Week of ${weeklyData.weekStart.toLocaleDateString()}`,
        description: freePost.subtitle || paidPost.subtitle || '',
        body: freePost.content || paidPost.content || '',
      };

      console.log(
        `🎬 Generating long-form video for week ${weekOffset} (blog: ${blogContent.title})...`,
      );
      fetch(`${baseUrl}/api/video/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'long',
          week: weekOffset, // Also pass week for consistency
          blogContent,
        }),
      })
        .then(async (res) => {
          if (res.ok) {
            const videoData = await res.json();
            console.log(
              `✅ Long-form video generated: ${videoData.video?.id || 'unknown'}`,
            );
            videoResults.push({ type: 'long', success: true });

            // Upload long-form to YouTube
            if (videoData.video?.id) {
              // Use generated postContent if available (includes hashtags and rich content),
              // otherwise fall back to blogContent.description
              const youtubeDescription =
                videoData.video.postContent || blogContent.description;

              await fetch(`${baseUrl}/api/youtube/upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  videoUrl: videoData.video.url,
                  videoId: videoData.video.id,
                  title: blogContent.title,
                  description: youtubeDescription,
                  type: 'long',
                  publishDate: new Date(weeklyData.weekStart).toISOString(),
                }),
              })
                .then(() => {
                  console.log('✅ Long-form video uploaded to YouTube');
                })
                .catch((err) => {
                  console.error(
                    '❌ Failed to upload long-form video to YouTube:',
                    err,
                  );
                });
            }
          } else {
            const errorText = await res.text();
            const error = `HTTP ${res.status}: ${errorText.substring(0, 200)}`;
            console.error(
              `❌ Long-form video generation failed: ${res.status} - ${errorText}`,
            );
            videoResults.push({ type: 'long', success: false, error });
            sendVideoFailureNotification();
          }
        })
        .catch(async (err) => {
          const error = err instanceof Error ? err.message : 'Unknown error';
          console.error('❌ Failed to generate long-form video:', err);
          videoResults.push({ type: 'long', success: false, error });
          sendVideoFailureNotification();
        });
    }

    return NextResponse.json({
      success: true,
      results,
      posts: {
        free: freePost,
        paid: paidPost,
      },
      metadata: {
        weekStart: weeklyData.weekStart,
        weekEnd: weeklyData.weekEnd,
        weekNumber: weeklyData.weekNumber,
      },
    });
  } catch (error) {
    console.error('Error publishing to Substack:', error);
    return NextResponse.json(
      {
        error: 'Failed to publish to Substack',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
