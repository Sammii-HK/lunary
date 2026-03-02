/**
 * Re-queue TikTok video posts from existing youtube/facebook posts.
 * Uses the same video_url and caption, schedules at 12:00/17:00/21:00 UTC per day.
 */

import { neon } from '@neondatabase/serverless';

const AYRSHARE_API_URL = 'https://api.ayrshare.com/api';
const API_KEY = process.env.AYRSHARE_API_KEY!;
const PROFILE_KEY = process.env.AYRSHARE_PROFILE_KEY!;

if (!API_KEY) throw new Error('AYRSHARE_API_KEY not set');
if (!PROFILE_KEY) throw new Error('AYRSHARE_PROFILE_KEY not set');

const sql = neon(process.env.POSTGRES_URL!);

// Get one representative post per topic per day (youtube preferred), deduped
const rows = await sql`
  SELECT DISTINCT ON (topic, scheduled_date::date)
    id, topic, content, video_url, scheduled_date, week_theme, week_start
  FROM social_posts
  WHERE platform IN ('youtube', 'facebook')
    AND post_type = 'video'
    AND scheduled_date >= NOW()
    AND scheduled_date <= NOW() + INTERVAL '8 days'
    AND video_url IS NOT NULL
  ORDER BY topic, scheduled_date::date, platform
`;

console.log(`Found ${rows.length} unique video posts to queue for TikTok\n`);

async function scheduleOnAyrshare(
  videoUrl: string,
  content: string,
  scheduledDate: Date,
) {
  // If in the past, push 15 mins from now
  const now = new Date();
  const postDate =
    scheduledDate < now
      ? new Date(now.getTime() + 15 * 60 * 1000)
      : scheduledDate;

  const response = await fetch(`${AYRSHARE_API_URL}/post`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
      'Profile-Key': PROFILE_KEY,
    },
    body: JSON.stringify({
      post: content,
      platforms: ['tiktok'],
      scheduleDate: postDate.toISOString(),
      mediaUrls: [videoUrl],
      isVideo: true,
    }),
  });

  const data = (await response.json()) as Record<string, unknown>;
  if (!response.ok || data.status === 'error') {
    return {
      success: false,
      error: (data.message as string) || `HTTP ${response.status}`,
      postDate,
    };
  }
  const tt = data.tiktok as Record<string, unknown> | undefined;
  if (tt?.status === 'error') {
    return {
      success: false,
      error: (tt.message as string) || 'TikTok error',
      postDate,
    };
  }
  return { success: true, postDate };
}

let succeeded = 0;
let failed = 0;

for (const row of rows) {
  const scheduledDate = new Date(row.scheduled_date as string);
  const dateStr = scheduledDate.toISOString().split('T')[0];
  const topic = (row.topic as string) ?? 'Unknown';
  const content = (row.content as string) ?? '';
  const videoUrl = row.video_url as string;

  process.stdout.write(
    `[${dateStr} ${scheduledDate.toISOString().split('T')[1].substring(0, 5)}] ${topic.substring(0, 45)}... `,
  );

  const result = await scheduleOnAyrshare(videoUrl, content, scheduledDate);

  if (result.success) {
    // Insert social_post record for TikTok
    await sql`
      INSERT INTO social_posts (
        content, platform, post_type, topic, status,
        video_url, scheduled_date, week_theme, week_start, created_at
      ) VALUES (
        ${content}, 'tiktok', 'video', ${topic}, 'sent',
        ${videoUrl}, ${result.postDate.toISOString()},
        ${(row.week_theme as string) ?? null},
        ${(row.week_start as string) ?? null},
        NOW()
      )
    `;
    console.log(`✅ ${result.postDate.toISOString()}`);
    succeeded++;
  } else {
    console.log(`❌ ${result.error}`);
    failed++;
  }

  await new Promise((r) => setTimeout(r, 1100));
}

console.log(`\nDone: ${succeeded} scheduled, ${failed} failed`);
