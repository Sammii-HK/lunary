/**
 * Audit social_posts for the current week (Mon 9 Mar – Sun 15 Mar 2026).
 * Shows what's scheduled, what's pending, what's sent, and what's missing.
 *
 * Run: npx tsx scripts/audit-weekly-posts.ts
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const sql = neon(process.env.POSTGRES_URL!);

async function main() {
  const weekStart = '2026-03-09';
  const weekEnd = '2026-03-16';

  // All posts for this week, grouped by date + post_type + platform
  const posts = await sql`
    SELECT
      id,
      TO_CHAR(scheduled_date AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day,
      TO_CHAR(scheduled_date AT TIME ZONE 'UTC', 'HH24:MI') AS utc_time,
      platform,
      post_type,
      topic,
      status,
      base_group_key,
      video_url,
      image_url IS NOT NULL AS has_image
    FROM social_posts
    WHERE
      scheduled_date >= ${weekStart}::timestamptz
      AND scheduled_date <  ${weekEnd}::timestamptz
    ORDER BY scheduled_date, platform, post_type
  `;

  if (posts.length === 0) {
    console.log('❌ No posts found for this week at all.');
    return;
  }

  // Group by day
  const byDay = new Map<string, typeof posts>();
  for (const p of posts) {
    const day = String(p.day);
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(p);
  }

  const days = [
    '2026-03-09',
    '2026-03-10',
    '2026-03-11',
    '2026-03-12',
    '2026-03-13',
    '2026-03-14',
    '2026-03-15',
  ];
  const labels: Record<string, string> = {
    '2026-03-09': 'Mon 9',
    '2026-03-10': 'Tue 10',
    '2026-03-11': 'Wed 11',
    '2026-03-12': 'Thu 12',
    '2026-03-13': 'Fri 13',
    '2026-03-14': 'Sat 14',
    '2026-03-15': 'Sun 15',
  };

  const statusEmoji: Record<string, string> = {
    sent: '✅',
    approved: '🟡',
    pending: '⏳',
    rejected: '❌',
  };

  for (const day of days) {
    const dayPosts = byDay.get(day) || [];
    const label = labels[day];

    if (dayPosts.length === 0) {
      console.log(`\n📅 ${label} — ❌ NO POSTS`);
      continue;
    }

    const sentCount = dayPosts.filter((p) => p.status === 'sent').length;
    const approvedCount = dayPosts.filter(
      (p) => p.status === 'approved',
    ).length;
    const pendingCount = dayPosts.filter((p) => p.status === 'pending').length;

    console.log(
      `\n📅 ${label} — ${dayPosts.length} posts (✅${sentCount} 🟡${approvedCount} ⏳${pendingCount})`,
    );

    for (const p of dayPosts) {
      const emoji = statusEmoji[String(p.status)] || '❓';
      const video = p.video_url
        ? ' [video ✅]'
        : p.post_type === 'video'
          ? ' [video ❌NO_URL]'
          : '';
      const img = p.has_image ? ' [img]' : '';
      console.log(
        `  ${emoji} ${p.utc_time} ${String(p.platform).padEnd(12)} ${String(p.post_type).padEnd(22)} ${String(p.topic || '').substring(0, 30)}${video}${img}`,
      );
    }
  }

  // Summary
  const total = posts.length;
  const sent = posts.filter((p) => p.status === 'sent').length;
  const approved = posts.filter((p) => p.status === 'approved').length;
  const pending = posts.filter((p) => p.status === 'pending').length;
  const videoMissing = posts.filter(
    (p) => p.post_type === 'video' && !p.video_url,
  ).length;

  console.log(`\n${'─'.repeat(60)}`);
  console.log(
    `Total: ${total}  ✅ sent: ${sent}  🟡 approved: ${approved}  ⏳ pending: ${pending}`,
  );
  if (videoMissing)
    console.log(`⚠️  ${videoMissing} video posts missing videoUrl`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
