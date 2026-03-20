/**
 * One-off: push pending YouTube Shorts via direct YouTube API.
 * Constructs youtubeOptions from social_posts topic + video_scripts metadata.
 */
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

const SHORTS_PLAYLIST = process.env.YOUTUBE_SHORTS_PLAYLIST_ID;

async function downloadVideo(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function getYouTubeClient() {
  const { google } = require('googleapis');
  // Get refresh token from DB (same as the app does)
  const tokenResult = await sql.query(
    "SELECT value FROM app_settings WHERE key = 'google_refresh_token' LIMIT 1",
  );
  const refreshToken =
    tokenResult.rows[0]?.value || process.env.GOOGLE_REFRESH_TOKEN;
  if (!refreshToken) throw new Error('No Google refresh token found');

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return google.youtube({ version: 'v3', auth: oauth2Client });
}

async function uploadShort(youtube, buffer, metadata) {
  const { Readable } = require('stream');
  const response = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: metadata.title,
        description: metadata.description + '\n\n#shorts',
        tags: metadata.tags || [],
        categoryId: '22',
      },
      status: {
        privacyStatus: metadata.publishAt ? 'private' : 'public',
        publishAt: metadata.publishAt || undefined,
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: Readable.from(buffer),
    },
  });
  return {
    videoId: response.data.id,
    url: `https://youtube.com/shorts/${response.data.id}`,
  };
}

async function addToPlaylist(youtube, videoId, playlistId) {
  await youtube.playlistItems.insert({
    part: ['snippet'],
    requestBody: {
      snippet: {
        playlistId,
        resourceId: { kind: 'youtube#video', videoId },
      },
    },
  });
}

(async () => {
  // Get unique pending YouTube posts
  const { rows } = await sql.query(`
    SELECT DISTINCT ON (sp.id)
      sp.id, sp.topic, sp.content, sp.video_url, sp.scheduled_date,
      vs.metadata
    FROM social_posts sp
    LEFT JOIN video_scripts vs ON vs.facet_title = sp.topic
      AND vs.scheduled_date::date = sp.scheduled_date::date
    WHERE sp.scheduled_date::date IN ('2026-03-17', '2026-03-18')
      AND sp.platform = 'youtube'
      AND sp.post_type = 'video'
      AND sp.status = 'pending'
      AND sp.video_url IS NOT NULL
    ORDER BY sp.id, sp.scheduled_date
  `);

  console.log(`Found ${rows.length} pending YouTube Shorts\n`);
  if (rows.length === 0) return;

  const youtube = await getYouTubeClient();
  console.log('YouTube client authenticated\n');

  for (const post of rows) {
    const utc = new Date(post.scheduled_date).toISOString().substring(0, 16);
    const isFuture =
      new Date(post.scheduled_date) > new Date(Date.now() + 10 * 60 * 1000);

    console.log(`${utc} | ${post.topic}`);
    console.log(`  Downloading video...`);

    try {
      const buffer = await downloadVideo(post.video_url);
      console.log(`  Downloaded ${(buffer.length / 1024 / 1024).toFixed(1)}MB`);

      const metadata = {
        title: post.topic,
        description: post.content,
        tags: ['astrology', 'zodiac', 'lunary'],
        publishAt: isFuture
          ? new Date(post.scheduled_date).toISOString()
          : undefined,
      };

      console.log(
        `  Uploading as Short (${isFuture ? 'scheduled ' + utc : 'public now'})...`,
      );
      const result = await uploadShort(youtube, buffer, metadata);
      console.log(`  ✓ Uploaded: ${result.url}`);

      // Add to Shorts playlist
      if (SHORTS_PLAYLIST) {
        try {
          await addToPlaylist(youtube, result.videoId, SHORTS_PLAYLIST);
          console.log(`  ✓ Added to Shorts playlist`);
        } catch (e) {
          console.log(`  ⚠ Playlist failed (non-fatal): ${e.message}`);
        }
      }

      // Update social_posts
      const newStatus = isFuture ? 'scheduled' : 'published';
      await sql.query(
        'UPDATE social_posts SET status = $1, updated_at = NOW() WHERE id = $2',
        [newStatus, post.id],
      );
      console.log(`  → ${newStatus}\n`);
    } catch (e) {
      console.error(`  ✗ FAILED: ${e.message}\n`);
    }
  }

  console.log('Done');
})();
