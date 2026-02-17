import { NextRequest, NextResponse } from 'next/server';
import { sendDiscordAdminNotification } from '@/lib/discord';
import { NotificationTemplates } from '../../../../../utils/notifications/pushNotifications';

export const dynamic = 'force-dynamic';

function getBaseUrl(request: NextRequest): string {
  // Always use production URL for image generation
  return 'https://lunary.app';
}

/**
 * Weekly content generation cron - runs Sunday mornings at 8 AM UTC
 * Generates blog, newsletter, Substack posts, and social media posts for the week ahead
 */
export async function GET(request: NextRequest) {
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  const authHeader = request.headers.get('authorization');

  if (!isVercelCron) {
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const todayDate = new Date();
  const dayOfWeek = todayDate.getDay(); // 0 = Sunday

  // Only enforce Sunday check for Vercel cron (allow manual runs any day)
  if (isVercelCron && dayOfWeek !== 0) {
    return NextResponse.json({
      success: true,
      message: 'Not Sunday, skipping weekly content generation',
      dayOfWeek,
    });
  }

  console.log('📅 Running weekly content generation (morning)...');
  const baseUrl = getBaseUrl(request);
  const startTime = Date.now();

  try {
    const { logActivity } = await import('@/lib/admin-activity');
    await logActivity({
      activityType: 'cron_execution',
      activityCategory: 'automation',
      status: 'pending',
      message: 'Weekly content generation started',
    });

    // 1. Generate weekly blog content for next week (next Monday)
    // Calculate the Monday of next week (same logic as blog API)
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Calculate days until next Monday (if today is Monday, go to next Monday)
    const daysUntilNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const weekStartDate = new Date(today);
    weekStartDate.setDate(today.getDate() + daysUntilNextMonday);
    weekStartDate.setHours(0, 0, 0, 0);

    const blogResponse = await fetch(
      `${baseUrl}/api/blog/weekly?date=${weekStartDate.toISOString()}`,
      {
        headers: { 'User-Agent': 'Lunary-Weekly-Content-Cron/1.0' },
      },
    );

    if (!blogResponse.ok) {
      throw new Error(`Blog generation failed: ${blogResponse.status}`);
    }

    const blogData = await blogResponse.json();
    console.log('✅ Weekly blog content generated:', blogData.data?.title);

    await logActivity({
      activityType: 'content_creation',
      activityCategory: 'content',
      status: 'success',
      message: `Weekly blog generated: ${blogData.data?.title}`,
      metadata: {
        title: blogData.data?.title,
        weekNumber: blogData.data?.weekNumber,
      },
    });

    // 2. Send weekly newsletter
    const newsletterResponse = await fetch(`${baseUrl}/api/newsletter/weekly`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Lunary-Weekly-Content-Cron/1.0',
      },
      body: JSON.stringify({
        send: true,
        customSubject: `🌟 ${blogData.data?.title}`,
      }),
    });

    const newsletterData = await newsletterResponse.json();
    console.log('📧 Weekly newsletter result:', newsletterData.message);

    await logActivity({
      activityType: 'content_creation',
      activityCategory: 'content',
      status: newsletterData.success ? 'success' : 'failed',
      message: `Weekly newsletter ${newsletterData.success ? 'sent' : 'failed'}`,
      metadata: {
        recipients: newsletterData.data?.recipients || 0,
        subject: newsletterData.data?.subject,
      },
      errorMessage: newsletterData.error || null,
    });

    // 3. Publish to Substack (free and paid posts)
    // Calculate weekOffset: blog is generated for next week
    // weekOffset=1 means "next week" (1 week from now)
    const blogWeekStart = new Date(weekStartDate);
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);

    // Calculate the Monday of the current week
    const currentDayOfWeek = today.getDay();
    const daysToCurrentMonday =
      currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    const currentWeekMonday = new Date(todayStart);
    currentWeekMonday.setDate(todayStart.getDate() - daysToCurrentMonday);

    // Calculate weeks difference
    const weeksDiff = Math.round(
      (blogWeekStart.getTime() - currentWeekMonday.getTime()) /
        (1000 * 60 * 60 * 24 * 7),
    );
    const weekOffset = weeksDiff;

    console.log(
      `📬 Publishing to Substack for week ${weekOffset} (week starting ${weekStartDate.toISOString()})...`,
    );
    let substackResult = null;
    try {
      const substackResponse = await fetch(`${baseUrl}/api/substack/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Lunary-Weekly-Content-Cron/1.0',
        },
        body: JSON.stringify({
          weekOffset: weekOffset,
          publishFree: true,
          publishPaid: true,
        }),
      });

      if (substackResponse.ok) {
        substackResult = await substackResponse.json();
        console.log(
          `✅ Substack posts published: Free ${substackResult.results?.free?.success ? '✓' : '✗'}, Paid ${substackResult.results?.paid?.success ? '✓' : '✗'}`,
        );
        await logActivity({
          activityType: 'content_creation',
          activityCategory: 'content',
          status:
            substackResult.results?.free?.success ||
            substackResult.results?.paid?.success
              ? 'success'
              : 'failed',
          message: `Substack posts published: Free ${substackResult.results?.free?.success ? '✓' : '✗'}, Paid ${substackResult.results?.paid?.success ? '✓' : '✗'}`,
          metadata: {
            freeSuccess: substackResult.results?.free?.success || false,
            paidSuccess: substackResult.results?.paid?.success || false,
            freeUrl: substackResult.results?.free?.postUrl,
            paidUrl: substackResult.results?.paid?.postUrl,
          },
        });
      } else {
        console.error(
          '❌ Substack publishing failed:',
          substackResponse.status,
        );
        await logActivity({
          activityType: 'content_creation',
          activityCategory: 'content',
          status: 'failed',
          message: 'Substack publishing failed',
          errorMessage: `HTTP ${substackResponse.status}`,
        });
      }
    } catch (substackError) {
      console.error('❌ Substack publishing error:', substackError);
      await logActivity({
        activityType: 'content_creation',
        activityCategory: 'content',
        status: 'failed',
        message: 'Substack publishing error',
        errorMessage:
          substackError instanceof Error
            ? substackError.message
            : 'Unknown error',
      });
    }

    // 4. Generate social media posts for the week ahead (7 days in advance)
    console.log(
      '📱 Generating social media posts for the week ahead (7 days in advance)...',
    );
    let socialPostsResult = null;
    try {
      // Calculate the Monday of the week that starts 7 days from now
      // This ensures posts are always generated exactly 7 days in advance
      const today = new Date();
      const weekAheadDate = new Date(today);
      weekAheadDate.setDate(today.getDate() + 7);

      // Find the Monday of that week (same calculation as blog)
      const dayOfWeek = weekAheadDate.getDay();
      const daysToMonday =
        dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
      const weekStartMonday = new Date(weekAheadDate);
      weekStartMonday.setDate(weekAheadDate.getDate() + daysToMonday);
      weekStartMonday.setHours(0, 0, 0, 0);

      console.log(
        `📅 Generating posts for week starting: ${weekStartMonday.toISOString()} (Monday of week 7 days ahead)`,
      );

      const socialPostsResponse = await fetch(
        `${baseUrl}/api/admin/social-posts/generate-weekly`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Lunary-Weekly-Content-Cron/1.0',
          },
          body: JSON.stringify({
            weekStart: weekStartMonday.toISOString(),
          }),
        },
      );

      if (socialPostsResponse.ok) {
        socialPostsResult = await socialPostsResponse.json();
        console.log(
          `✅ Generated ${socialPostsResult.savedIds?.length || 0} social media posts for next week`,
        );
        await logActivity({
          activityType: 'content_creation',
          activityCategory: 'content',
          status: 'success',
          message: `Generated ${socialPostsResult.savedIds?.length || 0} social media posts`,
          metadata: {
            postsGenerated: socialPostsResult.savedIds?.length || 0,
            weekRange: socialPostsResult.weekRange,
          },
        });
      } else {
        console.error(
          '❌ Social posts generation failed:',
          socialPostsResponse.status,
        );
        await logActivity({
          activityType: 'content_creation',
          activityCategory: 'content',
          status: 'failed',
          message: 'Social posts generation failed',
          errorMessage: `HTTP ${socialPostsResponse.status}`,
        });
      }
    } catch (socialPostsError) {
      console.error('❌ Social posts generation error:', socialPostsError);
      await logActivity({
        activityType: 'content_creation',
        activityCategory: 'content',
        status: 'failed',
        message: 'Social posts generation error',
        errorMessage:
          socialPostsError instanceof Error
            ? socialPostsError.message
            : 'Unknown error',
      });
    }

    // 5. Generate Instagram content for the week ahead (7 days in advance)
    console.log(
      '📸 Generating Instagram content for the week ahead (7 days in advance)...',
    );
    let instagramResult = null;
    try {
      // Generate for the same week as social posts (7 days ahead)
      const instagramResponse = await fetch(
        `${baseUrl}/api/admin/instagram/generate-weekly`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Lunary-Weekly-Content-Cron/1.0',
          },
          body: JSON.stringify({
            startDate: new Date(
              new Date().getTime() + 7 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          }),
        },
      );

      if (instagramResponse.ok) {
        instagramResult = await instagramResponse.json();
        console.log(
          `✅ Generated ${instagramResult.totalPosts || 0} Instagram posts for next week`,
        );
        await logActivity({
          activityType: 'content_creation',
          activityCategory: 'content',
          status: 'success',
          message: `Generated ${instagramResult.totalPosts || 0} Instagram posts`,
          metadata: {
            postsGenerated: instagramResult.totalPosts || 0,
            daysGenerated: instagramResult.daysGenerated || 0,
          },
        });
      } else {
        console.error(
          '❌ Instagram generation failed:',
          instagramResponse.status,
        );
        await logActivity({
          activityType: 'content_creation',
          activityCategory: 'content',
          status: 'failed',
          message: 'Instagram generation failed',
          errorMessage: `HTTP ${instagramResponse.status}`,
        });
      }
    } catch (instagramError) {
      console.error('❌ Instagram generation error:', instagramError);
      await logActivity({
        activityType: 'content_creation',
        activityCategory: 'content',
        status: 'failed',
        message: 'Instagram generation error',
        errorMessage:
          instagramError instanceof Error
            ? instagramError.message
            : 'Unknown error',
      });
    }

    // 6. Generate weekly podcast episode
    console.log('🎙️ Generating weekly podcast episode...');
    let podcastResult = null;
    try {
      const podcastResponse = await fetch(
        `${baseUrl}/api/podcast/generate-weekly`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Lunary-Weekly-Content-Cron/1.0',
          },
          body: JSON.stringify({
            weekStart: weekStartDate.toISOString(),
          }),
        },
      );

      if (podcastResponse.ok) {
        podcastResult = await podcastResponse.json();
        console.log(
          `✅ Podcast episode generated: ${podcastResult.episode?.title || 'episode ready'}`,
        );
        await logActivity({
          activityType: 'content_creation',
          activityCategory: 'content',
          status: 'success',
          message: `Podcast episode generated: ${podcastResult.episode?.title || 'ready'}`,
          metadata: {
            episodeNumber: podcastResult.episode?.episodeNumber,
            slug: podcastResult.episode?.slug,
            durationSecs: podcastResult.episode?.durationSecs,
          },
        });
      } else {
        console.error('❌ Podcast generation failed:', podcastResponse.status);
        await logActivity({
          activityType: 'content_creation',
          activityCategory: 'content',
          status: 'failed',
          message: 'Podcast generation failed',
          errorMessage: `HTTP ${podcastResponse.status}`,
        });
      }
    } catch (podcastError) {
      console.error('❌ Podcast generation error:', podcastError);
      await logActivity({
        activityType: 'content_creation',
        activityCategory: 'content',
        status: 'failed',
        message: 'Podcast generation error',
        errorMessage:
          podcastError instanceof Error
            ? podcastError.message
            : 'Unknown error',
      });
    }

    // 7. Upload podcast episode to YouTube
    let youtubeResult = null;
    if (podcastResult?.episode?.id) {
      console.log('🎬 Uploading podcast episode to YouTube...');
      try {
        const ytResponse = await fetch(
          `${baseUrl}/api/youtube/podcast-upload`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Lunary-Weekly-Content-Cron/1.0',
            },
            body: JSON.stringify({ episodeId: podcastResult.episode.id }),
          },
        );

        if (ytResponse.ok) {
          youtubeResult = await ytResponse.json();
          console.log(
            `✅ Podcast uploaded to YouTube: ${youtubeResult.videoId || 'skipped'}`,
          );
          await logActivity({
            activityType: 'content_creation',
            activityCategory: 'content',
            status: 'success',
            message: youtubeResult.skipped
              ? `YouTube upload skipped (already exists): ${youtubeResult.videoId}`
              : `Podcast Episode ${youtubeResult.episodeNumber} uploaded to YouTube: ${youtubeResult.videoId}`,
            metadata: {
              videoId: youtubeResult.videoId,
              youtubeUrl: youtubeResult.youtubeUrl,
              skipped: youtubeResult.skipped || false,
            },
          });
        } else {
          console.error('❌ YouTube upload failed:', ytResponse.status);
          await logActivity({
            activityType: 'content_creation',
            activityCategory: 'content',
            status: 'failed',
            message: 'YouTube podcast upload failed',
            errorMessage: `HTTP ${ytResponse.status}`,
          });
        }
      } catch (youtubeError) {
        console.error('❌ YouTube upload error:', youtubeError);
        await logActivity({
          activityType: 'content_creation',
          activityCategory: 'content',
          status: 'failed',
          message: 'YouTube podcast upload error',
          errorMessage:
            youtubeError instanceof Error
              ? youtubeError.message
              : 'Unknown error',
        });
      }
    }

    // Generate blog preview image URL (use first day of the week)
    const blogWeekStartDate = blogData.data?.weekStart
      ? new Date(blogData.data.weekStart).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    const blogPreviewUrl = `${baseUrl}/api/og/cosmic/${blogWeekStartDate}`;

    // Send Discord notification for weekly content with blog preview and social posts info
    try {
      const weeklyTemplate = NotificationTemplates.weeklyContentGenerated(
        blogData.data?.title || 'Weekly Content',
        blogData.data?.weekNumber || 0,
        blogData.data?.planetaryHighlights || [],
        blogPreviewUrl,
        socialPostsResult?.savedIds?.length || 0,
      );

      const highlights = (blogData.data?.planetaryHighlights || []).slice(0, 3);
      const weeklyFields = [
        {
          name: 'Week',
          value: `Week ${blogData.data?.weekNumber || 0}`,
          inline: true,
        },
        {
          name: 'Social Posts',
          value: `${socialPostsResult?.savedIds?.length || 0} posts ready`,
          inline: true,
        },
        {
          name: 'Instagram',
          value: `${instagramResult?.totalPosts || 0} posts ready`,
          inline: true,
        },
        {
          name: 'Podcast',
          value: podcastResult?.episode
            ? `Ep ${podcastResult.episode.episodeNumber} ready`
            : 'Skipped',
          inline: true,
        },
        {
          name: 'YouTube',
          value: youtubeResult?.videoId
            ? `Uploaded: ${youtubeResult.videoId}`
            : youtubeResult?.skipped
              ? 'Already uploaded'
              : 'Skipped',
          inline: true,
        },
        {
          name: 'Status',
          value: 'Newsletter sent\nBlog ready',
          inline: true,
        },
      ];

      if (highlights.length > 0) {
        weeklyFields.push({
          name: 'Highlights',
          value: highlights
            .map(
              (h: { planet: string; event?: string }) =>
                `• ${h.planet} ${h.event?.replace('-', ' ') || 'activity'}`,
            )
            .join('\n'),
          inline: false,
        });
      }

      await sendDiscordAdminNotification({
        title: weeklyTemplate.title,
        message: weeklyTemplate.message,
        priority: weeklyTemplate.priority,
        url: `${baseUrl}/admin/social-posts`,
        fields: weeklyFields,
        category: 'todo',
        dedupeKey: `weekly-digest-${new Date().toISOString().split('T')[0]}`,
      });
      console.log(
        `✅ Weekly notification sent: ${socialPostsResult?.posts?.length || socialPostsResult?.savedIds?.length || 0} social posts + ${instagramResult?.totalPosts || 0} Instagram posts ready for approval`,
      );
    } catch (notificationError) {
      console.warn('📱 Weekly notification failed:', notificationError);
    }

    const executionTime = Date.now() - startTime;
    await logActivity({
      activityType: 'cron_execution',
      activityCategory: 'automation',
      status: 'success',
      message: 'Weekly content generation completed',
      metadata: {
        blogTitle: blogData.data?.title,
        newsletterSent: newsletterData.success,
        socialPostsGenerated:
          socialPostsResult?.posts?.length ||
          socialPostsResult?.savedIds?.length ||
          0,
        instagramPostsGenerated: instagramResult?.totalPosts || 0,
        podcastEpisode: podcastResult?.episode?.episodeNumber || null,
        youtubeVideoId: youtubeResult?.videoId || null,
        substackPublished:
          substackResult?.results?.free?.success ||
          substackResult?.results?.paid?.success ||
          false,
      },
      executionTimeMs: executionTime,
    });

    return NextResponse.json({
      success: true,
      blog: {
        title: blogData.data?.title,
        weekNumber: blogData.data?.weekNumber,
        year: blogData.data?.year,
      },
      newsletter: {
        sent: newsletterData.success,
        recipients: newsletterData.data?.recipients || 0,
      },
      socialPosts: socialPostsResult
        ? {
            generated: socialPostsResult.savedIds?.length || 0,
            weekRange: socialPostsResult.weekRange,
          }
        : null,
      instagram: instagramResult
        ? {
            generated: instagramResult.totalPosts || 0,
            daysGenerated: instagramResult.daysGenerated || 0,
          }
        : null,
      substack: substackResult
        ? {
            free: substackResult.results?.free?.success || false,
            paid: substackResult.results?.paid?.success || false,
            freeUrl: substackResult.results?.free?.postUrl,
            paidUrl: substackResult.results?.paid?.postUrl,
          }
        : null,
      podcast: podcastResult?.episode
        ? {
            episodeNumber: podcastResult.episode.episodeNumber,
            title: podcastResult.episode.title,
            slug: podcastResult.episode.slug,
          }
        : null,
      youtube: youtubeResult?.videoId
        ? {
            videoId: youtubeResult.videoId,
            url: youtubeResult.youtubeUrl,
            skipped: youtubeResult.skipped || false,
          }
        : null,
    });
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const { logActivity } = await import('@/lib/admin-activity');
    await logActivity({
      activityType: 'cron_execution',
      activityCategory: 'automation',
      status: 'failed',
      message: 'Weekly content generation failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      executionTimeMs: executionTime,
    });

    // Send urgent Discord notification for failure
    try {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await sendDiscordAdminNotification({
        title: '🚨 Weekly Content Generation Failed',
        message:
          'Weekly content creation failed (blog, newsletter, Substack, social posts)',
        priority: 'emergency',
        category: 'urgent',
        fields: [
          {
            name: 'Task',
            value: 'Weekly content generation',
            inline: true,
          },
          {
            name: 'Error',
            value: errorMessage.substring(0, 500),
            inline: false,
          },
        ],
        dedupeKey: `weekly-content-failed-${new Date().toISOString().split('T')[0]}`,
      });
    } catch (discordError) {
      console.error('Failed to send Discord notification:', discordError);
    }

    console.error('❌ Weekly content generation failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
