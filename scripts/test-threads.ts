import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { generateThreadsBatch } from '@/lib/threads/content-orchestrator';
import { getCosmicEventCount } from '@/lib/threads/original-content';

async function main() {
  const dateStr = process.argv[2] || '2026-03-20';
  const date = new Date(dateStr);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = dayNames[date.getUTCDay()];

  const eventCount = await getCosmicEventCount(dateStr, 14);
  console.log(
    `\n${dateStr} (${dayName}) — ${eventCount} cosmic events detected`,
  );
  console.log(`Big cosmic day: ${eventCount >= 4 ? 'YES' : 'no'}`);
  console.log(
    `CTA day: ${date.getUTCDay() === 1 || date.getUTCDay() === 4 ? 'YES (Mon/Thu)' : 'no'}`,
  );

  const batch = await generateThreadsBatch(dateStr);
  console.log(`\n${batch.posts.length} posts generated:\n`);

  for (const post of batch.posts) {
    const time = new Date(post.scheduledTime).toISOString().slice(11, 16);
    console.log(`[${time} UTC] ${post.pillar.toUpperCase()}`);
    console.log(`  ${post.hook}`);
    if (post.body) console.log(`  ${post.body.slice(0, 150)}`);
    if (post.prompt) console.log(`  → ${post.prompt}`);
    console.log('');
  }
}

main().catch(console.error);
