/**
 * Backfill Dream Entries from Astral Guide Conversations
 *
 * This script scans past Astral Guide conversations for dream-related content
 * and creates proper Book of Shadows dream entries so they can be used by:
 * - Dream classifier
 * - Life Themes engine
 * - Archetype detector
 *
 * Usage:
 *   pnpm ts-node scripts/backfillDreamEntriesFromGuide.ts
 *   pnpm ts-node scripts/backfillDreamEntriesFromGuide.ts --userId=<user-id>
 *   pnpm ts-node scripts/backfillDreamEntriesFromGuide.ts --dry-run
 *
 * Environment variables:
 *   BACKFILL_DREAMS_SINCE - ISO date string to limit how far back to look (optional)
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { sql } from '@vercel/postgres';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

if (!process.env.POSTGRES_URL) {
  console.error('❌ POSTGRES_URL environment variable not found');
  process.exit(1);
}

interface ThreadMessage {
  role: 'user' | 'assistant';
  content: string;
  ts: string;
}

interface AiThread {
  id: string;
  user_id: string;
  title: string | null;
  messages: ThreadMessage[];
  created_at: Date;
  updated_at: Date;
}

const DREAM_KEYWORDS_USER = [
  'dream',
  'dreamt',
  'dreamed',
  'nightmare',
  'i had a dream',
  'in my dream',
  'i keep dreaming',
  'last night i',
  'woke up from',
  'while i was sleeping',
];

const DREAM_KEYWORDS_ASSISTANT = [
  'this dream suggests',
  'symbolically',
  'in this dream',
  'dream imagery',
  'your dream',
  'the dream represents',
  'dreams often',
  'subconscious',
];

function isDreamConversation(messages: ThreadMessage[]): boolean {
  const userMessages = messages.filter((m) => m.role === 'user');
  const assistantMessages = messages.filter((m) => m.role === 'assistant');

  const userHasDream = userMessages.some((m) => {
    const lower = m.content.toLowerCase();
    return DREAM_KEYWORDS_USER.some((kw) => lower.includes(kw));
  });

  if (userHasDream) return true;

  const assistantInterpretsDream = assistantMessages.some((m) => {
    const lower = m.content.toLowerCase();
    return DREAM_KEYWORDS_ASSISTANT.some((kw) => lower.includes(kw));
  });

  return assistantInterpretsDream;
}

function extractDreamContent(
  messages: ThreadMessage[],
): { userDream: string; interpretation: string; firstDreamTs: string } | null {
  const userDreamMessages: ThreadMessage[] = [];
  const interpretationMessages: ThreadMessage[] = [];
  let firstDreamTs: string | null = null;

  for (const message of messages) {
    const lower = message.content.toLowerCase();

    if (message.role === 'user') {
      const isDreamMessage = DREAM_KEYWORDS_USER.some((kw) =>
        lower.includes(kw),
      );
      if (isDreamMessage) {
        userDreamMessages.push(message);
        if (!firstDreamTs) {
          firstDreamTs = message.ts;
        }
      }
    } else if (message.role === 'assistant') {
      const isInterpretation = DREAM_KEYWORDS_ASSISTANT.some((kw) =>
        lower.includes(kw),
      );
      if (isInterpretation) {
        interpretationMessages.push(message);
      }
    }
  }

  if (userDreamMessages.length === 0) {
    return null;
  }

  const userDream = userDreamMessages.map((m) => m.content).join('\n\n');
  const interpretation = interpretationMessages
    .map((m) => m.content)
    .join('\n\n');

  return {
    userDream,
    interpretation,
    firstDreamTs: firstDreamTs || new Date().toISOString(),
  };
}

function buildDreamEntryContent(
  userDream: string,
  interpretation: string,
): string {
  let content = userDream;

  if (interpretation) {
    content += '\n\n---\n\nAstral Guide interpretation:\n\n' + interpretation;
  }

  return content;
}

function generateTitle(content: string): string {
  const firstLine = content.split('\n')[0] || 'Dream reflection';
  if (firstLine.length <= 50) {
    return firstLine;
  }
  return firstLine.substring(0, 47) + '...';
}

async function checkExistingEntry(
  userId: string,
  guideSessionId: string,
): Promise<boolean> {
  try {
    const result = await sql`
      SELECT id FROM collections
      WHERE user_id = ${userId}
      AND category = 'dream'
      AND content->>'guideSessionId' = ${guideSessionId}
      LIMIT 1
    `;
    return result.rows.length > 0;
  } catch {
    return false;
  }
}

async function createDreamEntry(
  userId: string,
  title: string,
  content: string,
  guideSessionId: string,
  createdAt: string,
): Promise<boolean> {
  try {
    const contentData = {
      text: content,
      moodTags: ['dream'],
      source: 'astral-guide',
      guideSessionId,
      backfilledFrom: 'astral_guide',
      backfilledAt: new Date().toISOString(),
    };

    await sql`
      INSERT INTO collections (user_id, title, category, content, tags, created_at)
      VALUES (
        ${userId},
        ${title},
        'dream',
        ${JSON.stringify(contentData)}::jsonb,
        ${'{"dream","astral-guide","backfill-2025"}'}::text[],
        ${createdAt}::timestamptz
      )
    `;

    return true;
  } catch (error) {
    console.error(`Failed to create dream entry for user ${userId}:`, error);
    return false;
  }
}

async function backfillDreams(options: {
  userId?: string;
  dryRun: boolean;
  since?: string;
}): Promise<{ processed: number; created: number; skipped: number }> {
  const { userId, dryRun, since } = options;

  console.log('🌙 Backfill Dream Entries from Astral Guide');
  console.log('='.repeat(50));
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE'}`);
  if (userId) console.log(`User: ${userId}`);
  if (since) console.log(`Since: ${since}`);
  console.log('');

  let threads: AiThread[];

  if (userId) {
    const result = await sql`
      SELECT id, user_id, title, messages, created_at, updated_at
      FROM ai_threads
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    threads = result.rows as AiThread[];
  } else if (since) {
    const result = await sql`
      SELECT id, user_id, title, messages, created_at, updated_at
      FROM ai_threads
      WHERE created_at >= ${since}::timestamptz
      ORDER BY created_at DESC
    `;
    threads = result.rows as AiThread[];
  } else {
    const result = await sql`
      SELECT id, user_id, title, messages, created_at, updated_at
      FROM ai_threads
      ORDER BY created_at DESC
    `;
    threads = result.rows as AiThread[];
  }

  console.log(`Found ${threads.length} Astral Guide threads to scan\n`);

  let processed = 0;
  let created = 0;
  let skipped = 0;

  for (const thread of threads) {
    processed++;

    const messages = Array.isArray(thread.messages)
      ? thread.messages
      : JSON.parse(thread.messages as unknown as string);

    if (!isDreamConversation(messages)) {
      continue;
    }

    const dreamContent = extractDreamContent(messages);
    if (!dreamContent) {
      continue;
    }

    const exists = await checkExistingEntry(thread.user_id, thread.id);
    if (exists) {
      skipped++;
      console.log(
        `⏭️  Skipped (already exists): Thread ${thread.id.slice(0, 8)}...`,
      );
      continue;
    }

    const content = buildDreamEntryContent(
      dreamContent.userDream,
      dreamContent.interpretation,
    );
    const title = generateTitle(dreamContent.userDream);

    if (dryRun) {
      console.log(
        `📝 Would create: "${title}" for user ${thread.user_id.slice(0, 8)}...`,
      );
      created++;
    } else {
      const success = await createDreamEntry(
        thread.user_id,
        title,
        content,
        thread.id,
        dreamContent.firstDreamTs,
      );

      if (success) {
        created++;
        console.log(
          `✅ Created: "${title}" for user ${thread.user_id.slice(0, 8)}...`,
        );
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Summary:`);
  console.log(`   Threads scanned: ${processed}`);
  console.log(`   Dreams ${dryRun ? 'found' : 'created'}: ${created}`);
  console.log(`   Skipped (duplicates): ${skipped}`);

  return { processed, created, skipped };
}

async function main() {
  const args = process.argv.slice(2);

  const userId = args
    .find((arg) => arg.startsWith('--userId='))
    ?.replace('--userId=', '');

  const dryRun = args.includes('--dry-run');

  const since =
    process.env.BACKFILL_DREAMS_SINCE ||
    args.find((arg) => arg.startsWith('--since='))?.replace('--since=', '');

  try {
    await backfillDreams({ userId, dryRun, since });
    console.log('\n✨ Backfill complete!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Backfill failed:', error);
    process.exit(1);
  }
}

main();
