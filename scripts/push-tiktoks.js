require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

const AYRSHARE_API = 'https://api.ayrshare.com/api';
const apiKey = process.env.AYRSHARE_API_KEY;
const profileKey = process.env.AYRSHARE_PROFILE_KEY;

// Only retry the 2 that failed + Chiron publish now
const schedule = [
  { id: 9199, publishNow: true, label: 'Chiron (publish now ~11:30am ET)' },
  {
    id: 9197,
    hour: '2026-03-18T01:00:00.000Z',
    label: 'Angel 1212 eng (9pm ET)',
  },
];

async function pushToAyrshare(post, opts) {
  const body = {
    post: post.content,
    platforms: ['tiktok'],
    mediaUrls: [post.video_url],
    isVideo: true,
    tikTokOptions: { privacyLevel: 'PUBLIC_TO_EVERYONE' },
  };
  if (opts.hour && !opts.publishNow) {
    body.scheduleDate = opts.hour;
  }
  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + apiKey,
  };
  if (profileKey) headers['Profile-Key'] = profileKey;

  const res = await fetch(AYRSHARE_API + '/post', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

(async () => {
  console.log(
    'Using profile key:',
    profileKey ? profileKey.substring(0, 8) + '...' : 'NONE',
  );

  for (const s of schedule) {
    const { rows } = await sql.query(
      'SELECT id, content, video_url, status FROM social_posts WHERE id = $1',
      [s.id],
    );
    const post = rows[0];
    if (!post) {
      console.log('NOT FOUND:', s.id);
      continue;
    }
    console.log('\n' + s.label, '(current status:', post.status + ')');

    const result = await pushToAyrshare(post, s);
    console.log('  HTTP:', result.status);
    console.log('  Response:', JSON.stringify(result.data).substring(0, 300));

    if (
      result.status === 200 &&
      (result.data.status === 'success' || result.data.status === 'scheduled')
    ) {
      const newStatus = s.publishNow ? 'published' : 'scheduled';
      const newDate = s.hour || new Date().toISOString();
      await sql.query(
        'UPDATE social_posts SET status = $1, scheduled_date = $2, updated_at = NOW() WHERE id = $3',
        [newStatus, newDate, s.id],
      );
      console.log('  -> Updated to', newStatus, s.hour ? 'at ' + s.hour : '');
    } else {
      console.log('  -> FAILED, not updated');
    }
  }
  console.log('\nDone');
})();
