/**
 * Quick script to create test engagement social posts for today
 * Creates both Engagement A (17:00 UTC) and Engagement B (20:00 UTC) posts
 * Usage: tsx scripts/test-engagement-post.ts
 */

import { sql } from '@vercel/postgres';

async function createTestPosts() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekStart = new Date(today);
  const day = weekStart.getDay();
  const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);

  const dayOfWeek = today.getDay();
  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  // Engagement A schedule (17:00 UTC slot)
  const engagementA: Record<number, { type: string; topic: string }> = {
    0: {
      type: 'ranking',
      topic: 'Ranking signs: who holds grudges the longest',
    },
    1: { type: 'sign-check', topic: 'Aries: what you need to hear right now' },
    2: { type: 'ranking', topic: 'Ranking signs: most to least spontaneous' },
    3: { type: 'quiz', topic: 'Fire signs vs Water signs vs Earth signs' },
    4: {
      type: 'hot-take',
      topic: 'Hot take: your moon sign matters more than your sun',
    },
    5: {
      type: 'myth',
      topic: 'why Scorpio is associated with death and rebirth',
    },
    6: { type: 'sign-check', topic: "Cancer: what you're pretending is fine" },
  };

  // Engagement B schedule (20:00 UTC slot)
  const engagementB: Record<number, { type: string; topic: string }> = {
    0: { type: 'sign-check', topic: 'Pisces: the pattern you need to break' },
    1: {
      type: 'ranking',
      topic: 'Ranking signs: best to worst at keeping secrets',
    },
    2: {
      type: 'hot-take',
      topic: 'Hot take: retrograde periods are actually good for you',
    },
    3: { type: 'sign-check', topic: 'Gemini: why people misunderstand you' },
    4: {
      type: 'myth',
      topic: 'the real reason Aquarius is an air sign not water',
    },
    5: { type: 'quiz', topic: 'Cardinal vs Fixed vs Mutable' },
    6: {
      type: 'ranking',
      topic: 'Ranking signs: who needs the most alone time',
    },
  };

  console.log(
    `\nCreating engagement posts for ${dayNames[dayOfWeek]} (${today.toISOString().split('T')[0]}):\n`,
  );

  const posts = [];

  // Engagement A (17:00 UTC)
  const slotATime = new Date(today);
  slotATime.setHours(17, 0, 0, 0);
  const slotAConfig = engagementA[dayOfWeek];

  console.log(`📹 Engagement A (17:00 UTC) - ${slotAConfig.type}`);
  console.log(`   Topic: ${slotAConfig.topic}`);

  const resultA = await sql`
    INSERT INTO social_posts (
      content,
      platform,
      post_type,
      topic,
      scheduled_date,
      status,
      week_start,
      week_theme,
      created_at
    ) VALUES (
      ${`${slotAConfig.type} - ${slotAConfig.topic}`},
      'instagram',
      'video',
      ${slotAConfig.topic},
      ${slotATime.toISOString()},
      'pending',
      ${weekStart.toISOString().split('T')[0]},
      'Test Theme',
      NOW()
    )
    RETURNING id
  `;
  posts.push({
    slot: 'A',
    id: resultA.rows[0].id,
    type: slotAConfig.type,
    topic: slotAConfig.topic,
  });

  // Engagement B (20:00 UTC)
  const slotBTime = new Date(today);
  slotBTime.setHours(20, 0, 0, 0);
  const slotBConfig = engagementB[dayOfWeek];

  console.log(`\n📹 Engagement B (20:00 UTC) - ${slotBConfig.type}`);
  console.log(`   Topic: ${slotBConfig.topic}`);

  const resultB = await sql`
    INSERT INTO social_posts (
      content,
      platform,
      post_type,
      topic,
      scheduled_date,
      status,
      week_start,
      week_theme,
      created_at
    ) VALUES (
      ${`${slotBConfig.type} - ${slotBConfig.topic}`},
      'instagram',
      'video',
      ${slotBConfig.topic},
      ${slotBTime.toISOString()},
      'pending',
      ${weekStart.toISOString().split('T')[0]},
      'Test Theme',
      NOW()
    )
    RETURNING id
  `;
  posts.push({
    slot: 'B',
    id: resultB.rows[0].id,
    type: slotBConfig.type,
    topic: slotBConfig.topic,
  });

  console.log(`\n✓ Created ${posts.length} test social posts`);
  posts.forEach((p) =>
    console.log(`  - Post #${p.id}: Engagement ${p.slot} (${p.type})`),
  );

  console.log('\n📋 Next steps:');
  console.log('1. Go to /admin/social-posts');
  console.log('2. Click "2 missing scripts" badge to generate both scripts');
  console.log('3. Click "Process videos" to render the videos');
  console.log('4. Videos will have no fade-in/out for seamless looping');
}

createTestPosts()
  .then(() => {
    console.log('\nDone!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
