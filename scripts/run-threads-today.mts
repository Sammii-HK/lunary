/**
 * One-off script: generate and send today's Threads posts with custom UTC slots.
 * Usage: pnpm tsx scripts/run-threads-today.mts
 */
import 'dotenv/config';
import { generateThreadsBatch } from '../src/lib/threads/content-orchestrator';
import { postToSocial } from '../src/lib/social/client';

const CUSTOM_SLOTS_UTC = [15, 17, 21]; // 3pm, 5pm, 9pm UTC

const dateStr = new Date().toISOString().split('T')[0];
console.log(`🧵 Generating Threads batch for ${dateStr} with slots ${CUSTOM_SLOTS_UTC.join(', ')}:00 UTC`);

const batch = await generateThreadsBatch(dateStr);

// Remap scheduled times to our custom slots in order
batch.posts.forEach((post, i) => {
  const hour = CUSTOM_SLOTS_UTC[i] ?? CUSTOM_SLOTS_UTC[CUSTOM_SLOTS_UTC.length - 1];
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  d.setUTCHours(hour, 0, 0, 0);
  post.scheduledTime = d.toISOString();
});

console.log(`📋 ${batch.posts.length} posts generated:`);
for (const post of batch.posts) {
  console.log(`  [${post.scheduledTime}] ${post.pillar} — ${post.hook?.slice(0, 60)}...`);
}

let sent = 0;
for (const post of batch.posts) {
  const content = [post.hook, post.body, post.prompt].filter(Boolean).join('\n\n');
  const result = await postToSocial({
    platform: 'threads',
    content,
    scheduledDate: post.scheduledTime,
    media: post.hasImage && post.imageUrl
      ? [{ type: 'image', url: post.imageUrl, alt: 'Lunary' }]
      : [],
  });

  if (result.success) {
    console.log(`  ✅ Sent [${post.scheduledTime}] via ${result.backend}`);
    sent++;
  } else {
    console.error(`  ❌ Failed [${post.scheduledTime}]: ${result.error}`);
  }
}

console.log(`\n🏁 Done — ${sent}/${batch.posts.length} posts sent`);
