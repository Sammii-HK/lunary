/**
 * One-off: push all pending video social_posts through the appropriate backend.
 * - Instagram → Spellcast (via postToSocial)
 * - TikTok → Ayrshare (via postToSocial)
 * - YouTube → direct YouTube API (via postToSocial)
 *
 * Run with: npx tsx scripts/flush-pending-videos.js
 * Or: node -r dotenv/config scripts/flush-pending-videos.js
 */
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

const AYRSHARE_API = 'https://api.ayrshare.com/api';
const SPELLCAST_API = process.env.SPELLCAST_API_URL;
const SPELLCAST_KEY = process.env.SPELLCAST_API_KEY;
const SPELLCAST_ACCOUNT_SET = process.env.SPELLCAST_LUNARY_ACCOUNT_SET_ID;
const AYRSHARE_KEY = process.env.AYRSHARE_API_KEY;
const AYRSHARE_PROFILE = process.env.AYRSHARE_PROFILE_KEY;

async function postToSpellcast(post) {
  const body = {
    accountSetId: SPELLCAST_ACCOUNT_SET,
    content: post.content,
    scheduledFor: new Date(post.scheduled_date).toISOString(),
    mediaUrls: [post.video_url],
    postType: post.platform === 'instagram' ? 'reel' : 'video',
  };
  const res = await fetch(`${SPELLCAST_API}/api/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + SPELLCAST_KEY,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function postToAyrshare(post) {
  const scheduledDate = new Date(post.scheduled_date);
  const isFuture = scheduledDate > new Date(Date.now() + 10 * 60 * 1000);

  const body = {
    post: post.content,
    platforms: ['tiktok'],
    mediaUrls: [post.video_url],
    isVideo: true,
    tikTokOptions: { privacyLevel: 'PUBLIC_TO_EVERYONE' },
  };
  if (isFuture) body.scheduleDate = scheduledDate.toISOString();

  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + AYRSHARE_KEY,
  };
  if (AYRSHARE_PROFILE) headers['Profile-Key'] = AYRSHARE_PROFILE;

  const res = await fetch(AYRSHARE_API + '/post', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json(), isFuture };
}

(async () => {
  // Get all pending video posts for today and tomorrow
  const { rows } = await sql.query(`
    SELECT id, platform, content, video_url, scheduled_date, topic, status
    FROM social_posts
    WHERE scheduled_date::date IN ('2026-03-17', '2026-03-18')
      AND post_type = 'video'
      AND status = 'pending'
      AND video_url IS NOT NULL
    ORDER BY scheduled_date
  `);

  console.log(`Found ${rows.length} pending video posts\n`);

  for (const post of rows) {
    const utc = new Date(post.scheduled_date).toISOString().substring(0, 16);
    const label = `${post.platform.padEnd(10)} | ${utc} | ${post.topic.substring(0, 40)}`;

    // Skip YouTube for now — needs youtubeOptions (title etc) which aren't in social_posts
    if (post.platform === 'youtube') {
      console.log(`[SKIP] ${label} (YouTube needs manual youtubeOptions)`);
      continue;
    }

    if (post.platform === 'tiktok') {
      console.log(`[AYRSHARE] ${label}`);
      try {
        const result = await postToAyrshare(post);
        console.log(
          `  HTTP ${result.status}: ${JSON.stringify(result.data).substring(0, 200)}`,
        );
        if (
          result.status === 200 &&
          (result.data.status === 'success' ||
            result.data.status === 'scheduled')
        ) {
          const newStatus = result.isFuture ? 'scheduled' : 'published';
          await sql.query(
            'UPDATE social_posts SET status = $1, updated_at = NOW() WHERE id = $2',
            [newStatus, post.id],
          );
          console.log(`  → ${newStatus}`);
        } else {
          console.log(`  → FAILED`);
        }
      } catch (e) {
        console.log(`  → ERROR: ${e.message}`);
      }
    } else if (
      ['instagram', 'facebook', 'threads', 'bluesky'].includes(post.platform)
    ) {
      console.log(`[SPELLCAST] ${label}`);
      try {
        const result = await postToSpellcast(post);
        console.log(
          `  HTTP ${result.status}: ${JSON.stringify(result.data).substring(0, 200)}`,
        );
        if (result.status === 200 || result.status === 201) {
          await sql.query(
            "UPDATE social_posts SET status = 'scheduled', updated_at = NOW() WHERE id = $1",
            [post.id],
          );
          console.log(`  → scheduled`);
        } else {
          console.log(`  → FAILED`);
        }
      } catch (e) {
        console.log(`  → ERROR: ${e.message}`);
      }
    } else {
      console.log(`[SKIP] ${label} (no backend for ${post.platform})`);
    }
  }

  console.log('\nDone');
})();
