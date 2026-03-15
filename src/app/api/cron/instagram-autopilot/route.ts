import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendDiscordNotification } from '@/lib/discord';
import { getImageBaseUrl } from '@/lib/urls';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120;

const MAX_POSTS_PER_RUN = 10;
const DELAY_BETWEEN_SENDS_MS = 3000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * GET /api/cron/instagram-autopilot
 *
 * Runs 3x/day at 10:00, 14:00, 18:00 UTC (1 hour before IG posting windows).
 *
 * Pass 1 — Auto-approve: Sets pending Instagram feed posts to approved
 *          where scheduled_date is within the next 2 hours.
 *
 * Pass 2 — Auto-send: Finds approved Instagram posts where scheduled_date <= NOW()
 *          and sends them via the internal send endpoint.
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Auth check
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const authHeader = request.headers.get('authorization');

    if (!isVercelCron) {
      if (
        !process.env.CRON_SECRET ||
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const results = {
      approved: 0,
      sent: 0,
      sendErrors: 0,
    };
    const sentPosts: string[] = [];

    // --- Pass 1: Auto-approve pending Instagram posts ---
    try {
      const approveResult = await sql`
        UPDATE social_posts
        SET status = 'approved', updated_at = NOW()
        WHERE platform = 'instagram'
          AND status = 'pending'
          AND scheduled_date <= NOW() + INTERVAL '2 hours'
          AND scheduled_date >= NOW() - INTERVAL '1 hour'
      `;
      results.approved = approveResult.rowCount ?? 0;
      if (results.approved > 0) {
        console.log(`[IG Autopilot] Auto-approved ${results.approved} posts`);
      }
    } catch (err) {
      console.error('[IG Autopilot] Auto-approve failed:', err);
    }

    // --- Pass 2: Auto-send approved Instagram posts ---
    try {
      // Find approved IG posts that are due (scheduled_date <= now)
      // For video posts, require video_url to be present (rendered)
      const postsToSend = await sql`
        SELECT id, content, platform, post_type, scheduled_date, topic,
               image_url, video_url, base_group_key
        FROM social_posts
        WHERE platform = 'instagram'
          AND status = 'approved'
          AND scheduled_date <= NOW()
          AND (
            (post_type = 'video' AND video_url IS NOT NULL)
            OR post_type != 'video'
          )
        ORDER BY scheduled_date ASC
        LIMIT ${MAX_POSTS_PER_RUN}
      `;

      if (postsToSend.rows.length === 0) {
        console.log('[IG Autopilot] No posts ready to send');
      }

      const baseUrl = getImageBaseUrl();
      const sendUrl = `${baseUrl}/api/admin/social-posts/send`;

      for (const post of postsToSend.rows) {
        try {
          console.log(
            `[IG Autopilot] Sending post ${post.id}: ${post.topic || post.post_type}`,
          );

          const response = await fetch(sendUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.CRON_SECRET}`,
            },
            body: JSON.stringify({
              postId: post.id,
              platform: 'instagram',
              scheduledDate: post.scheduled_date,
              imageUrl: post.image_url,
              videoUrl: post.video_url,
              postType: post.post_type,
            }),
          });

          if (response.ok) {
            results.sent++;
            sentPosts.push(
              `${post.topic || post.post_type} (${post.post_type})`,
            );
            console.log(`[IG Autopilot] Sent post ${post.id} successfully`);
          } else {
            const errorData = await response.json().catch(() => ({}));
            results.sendErrors++;
            console.error(
              `[IG Autopilot] Failed to send post ${post.id}:`,
              errorData,
            );
          }

          // Delay between sends
          if (postsToSend.rows.indexOf(post) < postsToSend.rows.length - 1) {
            await sleep(DELAY_BETWEEN_SENDS_MS);
          }
        } catch (sendErr) {
          results.sendErrors++;
          console.error(
            `[IG Autopilot] Error sending post ${post.id}:`,
            sendErr,
          );
        }
      }
    } catch (err) {
      console.error('[IG Autopilot] Auto-send query failed:', err);
    }

    const duration = Date.now() - startTime;

    // Discord notification (only if something happened)
    if (results.approved > 0 || results.sent > 0) {
      try {
        await sendDiscordNotification({
          title: 'Instagram Autopilot',
          description: [
            `Auto-approved: ${results.approved} posts`,
            `Sent: ${results.sent} posts`,
            results.sendErrors > 0 ? `Errors: ${results.sendErrors}` : '',
            sentPosts.length > 0
              ? `\nSent:\n${sentPosts.map((p) => `- ${p}`).join('\n')}`
              : '',
            `Duration: ${Math.round(duration / 1000)}s`,
          ]
            .filter(Boolean)
            .join('\n'),
          color: results.sendErrors > 0 ? 'warning' : 'success',
          category: 'general',
        });
      } catch {
        console.warn('[IG Autopilot] Discord notification failed');
      }
    }

    return NextResponse.json({
      success: true,
      results,
      sentPosts,
      duration: `${duration}ms`,
    });
  } catch (error) {
    console.error('[IG Autopilot] Fatal error:', error);
    return NextResponse.json(
      {
        error: 'Instagram autopilot failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
