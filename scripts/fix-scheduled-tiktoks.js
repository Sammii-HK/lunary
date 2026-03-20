require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

const AYRSHARE_API = 'https://api.ayrshare.com/api';
const apiKey = process.env.AYRSHARE_API_KEY;
const profileKey = process.env.AYRSHARE_PROFILE_KEY;

// These were scheduled without profile key — cancel and reschedule
const fixes = [
  {
    id: 9196,
    ayrshareId: 'y6BRjWiazcx7q5htueRG',
    hour: '2026-03-17T18:00:00.000Z',
    label: 'Angel 1212 (2pm ET)',
  },
  {
    id: 9198,
    ayrshareId: 'V8dfVZUxjh2J4ZLDWk08',
    hour: '2026-03-17T22:00:00.000Z',
    label: 'Capricorn (6pm ET)',
  },
];

async function deleteAyrsharePost(ayrshareId) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + apiKey,
  };
  // No profile key for delete — these were created on the default profile
  const res = await fetch(AYRSHARE_API + '/post/' + ayrshareId, {
    method: 'DELETE',
    headers,
  });
  return { status: res.status, data: await res.json() };
}

async function scheduleWithProfile(post, hour) {
  const body = {
    post: post.content,
    platforms: ['tiktok'],
    mediaUrls: [post.video_url],
    isVideo: true,
    tikTokOptions: { privacyLevel: 'PUBLIC_TO_EVERYONE' },
    scheduleDate: hour,
  };
  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + apiKey,
    'Profile-Key': profileKey,
  };
  const res = await fetch(AYRSHARE_API + '/post', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

(async () => {
  for (const f of fixes) {
    console.log('\n' + f.label);

    // Delete the wrongly-scheduled post
    console.log('  Deleting', f.ayrshareId, 'from wrong profile...');
    const del = await deleteAyrsharePost(f.ayrshareId);
    console.log(
      '  Delete:',
      del.status,
      JSON.stringify(del.data).substring(0, 150),
    );

    // Reschedule with correct profile
    const { rows } = await sql.query(
      'SELECT id, content, video_url FROM social_posts WHERE id = $1',
      [f.id],
    );
    const post = rows[0];
    if (!post) {
      console.log('  Post not found in DB');
      continue;
    }

    console.log('  Rescheduling with Lunary profile...');
    const result = await scheduleWithProfile(post, f.hour);
    console.log('  HTTP:', result.status);
    console.log('  Response:', JSON.stringify(result.data).substring(0, 250));

    if (
      result.status === 200 &&
      (result.data.status === 'success' || result.data.status === 'scheduled')
    ) {
      console.log('  -> OK, correctly scheduled on Lunary TikTok');
    } else {
      console.log('  -> FAILED to reschedule');
    }
  }
  console.log('\nDone');
})();
