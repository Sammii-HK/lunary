/**
 * Resend TikTok posts that failed due to invalid Ayrshare profile key.
 * Targets 'sent' TikTok video posts with future scheduled dates.
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const AYRSHARE_API_URL = 'https://api.ayrshare.com/api';
const API_KEY = process.env.AYRSHARE_API_KEY!;
const PROFILE_KEY = process.env.AYRSHARE_PROFILE_KEY!;

if (!API_KEY) throw new Error('AYRSHARE_API_KEY not set');
if (!PROFILE_KEY) throw new Error('AYRSHARE_PROFILE_KEY not set');

const sql = neon(process.env.POSTGRES_URL!);

async function postToTikTok(post: {
  id: number;
  content: string;
  video_url: string;
  scheduled_date: Date;
}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_KEY}`,
    'Profile-Key': PROFILE_KEY,
  };

  const scheduledDate = new Date(post.scheduled_date);
  // If scheduled time is in the past, push to next available slot (15 mins from now)
  const now = new Date();
  const postDate =
    scheduledDate < now
      ? new Date(now.getTime() + 15 * 60 * 1000)
      : scheduledDate;

  const payload = {
    post: post.content,
    platforms: ['tiktok'],
    scheduleDate: postDate.toISOString(),
    mediaUrls: [post.video_url],
    isVideo: true,
  };

  const response = await fetch(`${AYRSHARE_API_URL}/post`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as Record<string, unknown>;

  if (!response.ok || data.status === 'error') {
    return {
      success: false,
      error: data.message || `HTTP ${response.status}`,
      data,
    };
  }

  const tiktokResult = data.tiktok as Record<string, unknown> | undefined;
  if (tiktokResult?.status === 'error') {
    return {
      success: false,
      error: (tiktokResult.message as string) || 'TikTok error',
      data,
    };
  }

  return {
    success: true,
    postId: data.id || data.refId,
    scheduledFor: postDate.toISOString(),
  };
}

async function main() {
  const rows = await sql`
    SELECT id, content, video_url, scheduled_date
    FROM social_posts
    WHERE platform = 'tiktok'
      AND post_type = 'video'
      AND scheduled_date >= NOW() - INTERVAL '1 day'
      AND video_url IS NOT NULL
    ORDER BY scheduled_date ASC
  `;

  console.log(`Found ${rows.length} TikTok posts to resend\n`);

  let succeeded = 0;
  let failed = 0;

  for (const row of rows) {
    const post = row as {
      id: number;
      content: string;
      video_url: string;
      scheduled_date: Date;
    };
    const scheduledStr = new Date(post.scheduled_date).toISOString();
    process.stdout.write(
      `[${post.id}] ${scheduledStr.split('T')[0]} — ${(post.content ?? '').substring(0, 50)}... `,
    );

    const result = await postToTikTok(post);

    if (result.success) {
      console.log(`✅ scheduled for ${result.scheduledFor}`);
      succeeded++;
    } else {
      console.log(`❌ ${result.error}`);
      failed++;
    }

    // Rate limit: 1 req/sec
    await new Promise((r) => setTimeout(r, 1100));
  }

  console.log(`\nDone: ${succeeded} succeeded, ${failed} failed`);
}

main().catch(console.error);
