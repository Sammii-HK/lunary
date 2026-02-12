/**
 * Seed realistic data for the demo user (Celeste) so the real app
 * looks good for video recordings.
 *
 * Seeds:
 * - user_streaks: 14-day current streak, 30 longest, 142 total check-ins
 * - user_progress: All 4 skill trees with varied levels
 *
 * Cosmic score is calculated dynamically from birth chart + global positions,
 * so it works automatically as long as Celeste has a birth chart (she does).
 *
 * Usage:
 *   pnpm exec tsx scripts/seed-demo-data.ts
 *
 * Requires:
 *   - POSTGRES_URL or DATABASE_URL env var (or .env.local)
 *   - PERSONA_EMAIL env var (defaults to celeste@lunary.app)
 */

import { config } from 'dotenv';
config({ path: '.env.local' });
import { sql } from '@vercel/postgres';

async function main() {
  const personaEmail = process.env.PERSONA_EMAIL || 'celeste@lunary.app';

  console.log(`Looking up user: ${personaEmail}`);

  const userResult = await sql`
    SELECT id FROM "user" WHERE LOWER(email) = LOWER(${personaEmail}) LIMIT 1
  `;

  if (userResult.rows.length === 0) {
    console.error('User not found — make sure Celeste exists in the database');
    process.exit(1);
  }

  const userId = userResult.rows[0].id;
  console.log(`Found user: ${userId}`);

  // --- Streak ---
  const today = new Date().toISOString().split('T')[0];
  console.log(`\nSeeding streak (14-day, last check-in: ${today})...`);

  await sql`
    INSERT INTO user_streaks (
      user_id, current_streak, longest_streak, last_check_in,
      total_check_ins, ritual_streak, longest_ritual_streak,
      last_ritual_date, created_at, updated_at
    ) VALUES (
      ${userId}, 14, 30, ${today}::DATE,
      142, 12, 18,
      ${today}::DATE, NOW(), NOW()
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      current_streak = 14,
      longest_streak = GREATEST(user_streaks.longest_streak, 30),
      last_check_in = ${today}::DATE,
      total_check_ins = GREATEST(user_streaks.total_check_ins, 142),
      ritual_streak = 12,
      longest_ritual_streak = GREATEST(user_streaks.longest_ritual_streak, 18),
      last_ritual_date = ${today}::DATE,
      updated_at = NOW()
  `;
  console.log('  ✓ Streak seeded');

  // --- Skill Trees ---
  // Targets based on level thresholds from config:
  //   tarot:    28 actions → level 3 (threshold 25, next at 50)
  //   journal:  18 actions → level 2 (threshold 15, next at 35)
  //   explorer: 14 actions → level 3 (threshold 14, next at 30) — matches streak
  //   ritual:   12 actions → level 2 (threshold 10, next at 25)
  const skillTrees = [
    { skillTree: 'tarot', totalActions: 28, currentLevel: 3 },
    { skillTree: 'journal', totalActions: 18, currentLevel: 2 },
    { skillTree: 'explorer', totalActions: 14, currentLevel: 3 },
    { skillTree: 'ritual', totalActions: 12, currentLevel: 2 },
  ];

  console.log('\nSeeding skill tree progress...');
  for (const tree of skillTrees) {
    await sql`
      INSERT INTO user_progress (
        user_id, skill_tree, current_level, total_actions, updated_at
      ) VALUES (
        ${userId}, ${tree.skillTree}, ${tree.currentLevel}, ${tree.totalActions}, NOW()
      )
      ON CONFLICT (user_id, skill_tree)
      DO UPDATE SET
        current_level = ${tree.currentLevel},
        total_actions = GREATEST(user_progress.total_actions, ${tree.totalActions}),
        updated_at = NOW()
    `;
    console.log(
      `  ✓ ${tree.skillTree}: level ${tree.currentLevel} (${tree.totalActions} actions)`,
    );
  }

  // --- Verify birth chart exists (needed for cosmic score) ---
  const profileResult = await sql`
    SELECT birth_chart IS NOT NULL AS has_chart FROM user_profiles
    WHERE user_id = ${userId} LIMIT 1
  `;

  if (profileResult.rows.length > 0 && profileResult.rows[0].has_chart) {
    console.log(
      '\n✓ Birth chart exists — cosmic score will calculate automatically',
    );
  } else {
    console.warn('\n⚠ No birth chart found — cosmic score will not work.');
    console.warn('  Run: pnpm exec tsx scripts/seed-celeste-chart.ts');
  }

  // --- Subscription (needed for cosmic timing + paid features) ---
  console.log('\nSeeding subscription...');
  await sql`
    INSERT INTO subscriptions (user_id, user_email, status, plan_type, created_at, updated_at)
    VALUES (${userId}, ${personaEmail}, 'active', 'lunary_plus_ai_annual', NOW(), NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
      status = 'active',
      plan_type = 'lunary_plus_ai_annual',
      updated_at = NOW()
  `;
  console.log('  ✓ Subscription: active (lunary_plus_ai_annual)');

  // --- Onboarding (skip so it doesn't block the app) ---
  console.log('\nMarking onboarding complete...');
  await sql`
    INSERT INTO onboarding_completion (user_id, steps_completed, skipped, completed_at, created_at, updated_at)
    VALUES (${userId}, '{"welcome","birthday","complete"}', false, NOW(), NOW(), NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
      steps_completed = '{"welcome","birthday","complete"}',
      completed_at = COALESCE(onboarding_completion.completed_at, NOW()),
      updated_at = NOW()
  `;
  console.log('  ✓ Onboarding marked complete');

  // --- Journal entries (so journal page isn't empty) ---
  console.log('\nSeeding journal entries...');
  const journalEntries = [
    {
      title: 'Full moon reflections and release',
      category: 'journal',
      content: JSON.stringify({
        text: "Tonight's full moon felt electric. I spent time reflecting on what I want to release — old patterns of self-doubt and the need for external validation. I drew The Star during my evening spread and it confirmed what I already felt: I'm exactly where I need to be. The moonlight through my window was almost silver.",
        moodTags: ['reflective', 'empowered'],
        cardReferences: ['The Star'],
        moonPhase: 'full moon',
        transitHighlight: 'Full Moon in Leo',
        source: 'manual',
        sourceMessageId: null,
      }),
      tags: '{reflective,empowered}',
      daysAgo: 2,
    },
    {
      title: 'A dream about flying through clouds',
      category: 'dream',
      content: JSON.stringify({
        text: 'I was flying through soft pink clouds. Below me was a vast ocean that shimmered with starlight. I felt peaceful but also adventurous. There were other people flying with me but their faces were blurred. I woke up feeling lighter than I have in weeks.',
        moodTags: ['peaceful', 'curious'],
        cardReferences: [],
        moonPhase: 'waning gibbous',
        transitHighlight: null,
        source: 'manual',
        sourceMessageId: null,
      }),
      tags: '{peaceful,curious}',
      daysAgo: 5,
    },
    {
      title: 'Mercury direct — clarity returning',
      category: 'journal',
      content: JSON.stringify({
        text: 'Mercury stationed direct today and I can already feel the shift. The miscommunications of the past few weeks are starting to untangle. I had a breakthrough conversation with a friend about our creative project. Everything is flowing again. Set an intention to channel this clarity into my writing.',
        moodTags: ['hopeful', 'clear'],
        cardReferences: ['The Magician', 'Ace of Wands'],
        moonPhase: 'waxing crescent',
        transitHighlight: 'Mercury Direct',
        source: 'manual',
        sourceMessageId: null,
      }),
      tags: '{hopeful,clear}',
      daysAgo: 8,
    },
    {
      title: 'Morning gratitude ritual',
      category: 'ritual',
      content: JSON.stringify({
        text: "Started my morning with three minutes of deep breathing followed by my gratitude practice. Grateful for the quiet morning, for my health, and for the creative energy that's been building. Lit a candle and pulled a card — The Empress. Nurturing energy today.",
        moodTags: ['centered', 'grateful'],
        cardReferences: ['The Empress'],
        moonPhase: 'waxing gibbous',
        transitHighlight: 'Venus in Taurus',
        source: 'manual',
        sourceMessageId: null,
      }),
      tags: '{centered,grateful}',
      daysAgo: 1,
    },
    {
      title: 'New moon intentions for the month ahead',
      category: 'journal',
      content: JSON.stringify({
        text: "New moon energy is perfect for planting seeds. My intentions this cycle: deepen my meditation practice, finish the art project I've been putting off, and be more present in conversations. I wrote each one on a small piece of paper and placed them under my crystal grid.",
        moodTags: ['intentional', 'inspired'],
        cardReferences: ['The Fool', 'Page of Pentacles'],
        moonPhase: 'new moon',
        transitHighlight: 'New Moon in Pisces',
        source: 'manual',
        sourceMessageId: null,
      }),
      tags: '{intentional,inspired}',
      daysAgo: 12,
    },
  ];

  for (const entry of journalEntries) {
    await sql`
      INSERT INTO collections (user_id, title, category, content, tags, created_at, updated_at)
      VALUES (
        ${userId},
        ${entry.title},
        ${entry.category},
        ${entry.content}::jsonb,
        ${entry.tags}::text[],
        NOW() - ${entry.daysAgo + ' days'}::interval,
        NOW() - ${entry.daysAgo + ' days'}::interval
      )
      ON CONFLICT DO NOTHING
    `;
    console.log(
      `  ✓ ${entry.category}: "${entry.title}" (${entry.daysAgo}d ago)`,
    );
  }

  // --- Warm up global cosmic data (needed for cosmic score) ---
  console.log('\nWarming up global cosmic data...');
  const cronSecret = process.env.CRON_SECRET;
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  if (cronSecret) {
    try {
      const cronResponse = await fetch(
        `${baseUrl}/api/cron/update-global-cosmic-data`,
        {
          headers: { Authorization: `Bearer ${cronSecret}` },
        },
      );
      if (cronResponse.ok) {
        console.log('  ✓ Global cosmic data updated for today');
      } else {
        console.warn(`  ⚠ Cron returned ${cronResponse.status}`);
      }
    } catch (err) {
      console.warn('  ⚠ Could not reach dev server for cosmic data warm-up');
    }
  } else {
    console.warn('  ⚠ CRON_SECRET not set — skipping cosmic data warm-up');
  }

  console.log('\nDone! Sign in as Celeste to see the seeded data.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
