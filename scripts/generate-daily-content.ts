/**
 * Generate ALL daily content for a given date locally.
 *
 * Produces:
 * - Seer Sammii scripts (3 topic options + 1 full script)
 * - Instagram daily batch (carousels, memes, etc.)
 * - Video scripts (Slot 1 deep-dive, Slot 3 quick-hit)
 * - Daily text posts (Pinterest, Bluesky)
 *
 * Usage:
 *   pnpm tsx scripts/generate-daily-content.ts                 # Today
 *   pnpm tsx scripts/generate-daily-content.ts 2026-03-20      # Specific date
 *   pnpm tsx scripts/generate-daily-content.ts --dry-run       # Preview only (no DB writes)
 *   pnpm tsx scripts/generate-daily-content.ts --seer-only     # Only Seer Sammii
 *   pnpm tsx scripts/generate-daily-content.ts --videos-only   # Only video scripts
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

// Must load env before importing app modules
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import {
  generateSeerSammiiScript,
  generateDailyTalkingPoints,
} from '@/lib/social/video-scripts/seer-sammii/generation';
import { generateDailyBatch } from '@/lib/instagram/content-orchestrator';
import { generateScriptForContentType } from '@/lib/social/video-scripts/generators/weekly-secondary';
import {
  generateTransitAlertScript,
  type TransitEvent,
} from '@/lib/social/video-scripts/generators/transit-alert';
import {
  getContentTypeWeights,
  weightedSelect,
} from '@/lib/social/video-scripts/content-scores';
import { generateDailyTextPosts } from '@/lib/social/daily-text-posts';
import {
  getEventCalendarForDate,
  type CalendarEvent,
  type EventRarity,
} from '@/lib/astro/event-calendar';
import type { ContentType } from '@/lib/social/video-scripts/content-types';
import type { VideoScript } from '@/lib/social/video-scripts/types';

import { neon } from '@neondatabase/serverless';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const seerOnly = args.includes('--seer-only');
const videosOnly = args.includes('--videos-only');
const saveToDb = args.includes('--save');
const dateArg = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));
const targetDate = dateArg || new Date().toISOString().split('T')[0];

const sql = neon(process.env.POSTGRES_URL as string);

console.log(`\n========================================`);
console.log(`  DAILY CONTENT GENERATION: ${targetDate}`);
console.log(
  `  Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}${seerOnly ? ' (Seer only)' : ''}${videosOnly ? ' (Videos only)' : ''}`,
);
console.log(`========================================\n`);

async function showEventCalendar() {
  try {
    const events = await getEventCalendarForDate(targetDate);
    const significant = events.filter((e: CalendarEvent) => e.score >= 30);
    if (significant.length === 0) {
      console.log('[Calendar] No significant events for this date.\n');
      return;
    }
    console.log(`[Calendar] ${significant.length} significant event(s):\n`);
    for (const event of significant) {
      console.log(
        `  [${event.rarity}] ${event.name} (score: ${event.score}/100)`,
      );
      if (event.rarityFrame) console.log(`    ${event.rarityFrame}`);
      if (event.historicalContext)
        console.log(`    History: ${event.historicalContext}`);
    }
    console.log('');
  } catch (err) {
    console.warn('[Calendar] Lookup failed:', err);
  }
}

async function generateSeerSammii() {
  console.log('\n--- SEER SAMMII ---\n');

  // Step 1: Generate topic options
  console.log('[Seer] Generating talking point options...');
  const date = new Date(`${targetDate}T12:00:00.000Z`);

  try {
    const topics = await generateDailyTalkingPoints(date);
    console.log(`\n  ${topics.length} topic options:\n`);
    topics.forEach((t, i) => {
      console.log(`  Option ${i + 1}: ${t.topic}`);
      console.log(`    Type: ${t.contentType || 'auto'}`);
      console.log(`    Transit: ${t.transitContext}`);
      console.log(`    Points: ${t.points.join(' | ')}`);
      console.log('');
    });

    // Step 2: Generate full script from top option
    const topTopic = topics[0];
    console.log(`[Seer] Generating full script for: "${topTopic.topic}"...\n`);
    const script = await generateSeerSammiiScript(
      date,
      topTopic.topic,
      topTopic.contentType as any,
    );

    console.log('  FULL SCRIPT:');
    console.log('  ─────────────────────────────────────');
    console.log(`  Topic: ${script.topic}`);
    console.log(`  Type: ${script.contentType}`);
    console.log(
      `  Duration: ${script.estimatedDuration} (${script.wordCount} words)`,
    );
    console.log(`  Talking Points: ${script.talkingPoints.join(' | ')}`);
    console.log('');
    console.log(
      `  Script:\n${script.fullScript
        .split('\n')
        .map((l) => `    ${l}`)
        .join('\n')}`,
    );
    console.log('');
    console.log(`  Caption: ${script.caption}`);
    console.log(`  Hashtags: ${script.hashtags.join(', ')}`);
    console.log(`  CTA: ${script.cta}`);
    console.log('  ─────────────────────────────────────\n');

    return script;
  } catch (err) {
    console.error('[Seer] Generation failed:', err);
    return null;
  }
}

/**
 * Convert CalendarEvent to TransitEvent for the transit-alert generator.
 * Mirrors the logic in daily-content-generate cron route.
 */
function calendarEventToTransitEvent(event: CalendarEvent): TransitEvent {
  const rarityMap: Record<EventRarity, TransitEvent['rarity']> = {
    CRITICAL: 'very-rare',
    HIGH: 'very-rare',
    MEDIUM: 'rare',
    LOW: 'common',
  };

  const isRetrograde =
    event.eventType === 'retrograde_station' ||
    event.eventType === 'active_retrograde';

  let retrogradePhase: TransitEvent['retrogradePhase'];
  if (event.eventType === 'active_retrograde') {
    retrogradePhase = 'active';
  } else if (event.eventType === 'retrograde_station') {
    retrogradePhase = event.name?.includes('direct')
      ? 'stations_direct'
      : 'stations_retrograde';
  }

  const effectiveRarity = isRetrograde ? 'rare' : rarityMap[event.rarity];

  return {
    type: isRetrograde ? 'retrograde' : 'ingress',
    planet: event.planet || 'Transit',
    fromSign: undefined,
    toSign: event.sign,
    date: new Date(event.date),
    rarity: effectiveRarity,
    significance: [event.name, event.historicalContext, event.rarityFrame]
      .filter(Boolean)
      .join('. '),
    retrogradePhase,
  };
}

async function generateVideoScripts() {
  console.log('\n--- VIDEO SCRIPTS ---\n');
  const date = new Date(`${targetDate}T12:00:00.000Z`);

  // Check for significant events — override generic rotation on big cosmic days
  let significantEvents: CalendarEvent[] = [];
  let allCalendarEvents: CalendarEvent[] = [];
  try {
    allCalendarEvents = await getEventCalendarForDate(targetDate);
    // Include CRITICAL, HIGH, and MEDIUM events with score >= 70 for variety
    significantEvents = allCalendarEvents
      .filter((e) => e.score >= 70)
      .sort((a, b) => b.score - a.score);
  } catch {}

  // Deduplicate: check yesterday's events and deprioritise repeats
  let yesterdayTopics: Set<string> = new Set();
  try {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().split('T')[0];
    const yEvents = await getEventCalendarForDate(yKey);
    yesterdayTopics = new Set(
      yEvents.filter((e) => e.score >= 70).map((e) => e.name.toLowerCase()),
    );
    if (yesterdayTopics.size > 0) {
      console.log(
        `[Video] Yesterday's topics (for dedup): ${[...yesterdayTopics].join(', ')}`,
      );
    }
  } catch {}

  // Sort: fresh events first, then repeats
  significantEvents.sort((a, b) => {
    const aRepeat = yesterdayTopics.has(a.name.toLowerCase()) ? 1 : 0;
    const bRepeat = yesterdayTopics.has(b.name.toLowerCase()) ? 1 : 0;
    if (aRepeat !== bRepeat) return aRepeat - bRepeat; // fresh first
    return b.score - a.score; // then by score
  });

  const hasEventOverride = significantEvents.length > 0;

  try {
    // Slot 1: Deep-dive (16:00 UTC)
    console.log('[Video] Slot 1 — Deep-dive video...');
    let slot1: VideoScript | null = null;

    if (hasEventOverride) {
      const topEvent = significantEvents[0];
      console.log(
        `  EVENT OVERRIDE: "${topEvent.name}" (${topEvent.rarity}, score ${topEvent.score})`,
      );
      const transitEvent = calendarEventToTransitEvent(topEvent);
      const otherEvents = significantEvents.slice(1);

      // Pass ALL events with score >= 50 as convergence (not just CRITICAL/HIGH)
      const convergenceForSlot1 = allCalendarEvents
        .filter((e) => e.id !== topEvent.id && e.score >= 50)
        .sort((a, b) => b.score - a.score);

      slot1 = await generateTransitAlertScript(
        transitEvent,
        date,
        'https://lunary.app',
        {
          calendarEvent: topEvent,
          convergenceEvents: convergenceForSlot1,
        },
      );
    }

    if (!slot1) {
      // Fallback to category rotation
      const weights = await getContentTypeWeights();
      const dateSeed =
        date.getFullYear() * 10000 +
        (date.getMonth() + 1) * 100 +
        date.getDate();
      const contentType =
        (weightedSelect(weights, new Set(), dateSeed) as ContentType) ||
        'sign-identity';
      slot1 = await generateScriptForContentType(contentType, date);
    }

    if (slot1) {
      console.log(`  Topic: ${slot1.facetTitle}`);
      console.log(`  Duration: ${slot1.estimatedDuration}`);
      console.log(
        `  Hook: ${slot1.hookText || slot1.fullScript.split('\n')[0]}`,
      );
      console.log(`\n  Full script:`);
      console.log(
        slot1.fullScript
          .split('\n')
          .map((l) => `    ${l}`)
          .join('\n'),
      );
      console.log('');
    }

    // Slot 3: Quick-hit (01:00 UTC next day)
    console.log('[Video] Slot 3 — Quick-hit video (1am)...');
    let slot3: VideoScript | null = null;

    if (hasEventOverride && significantEvents.length > 1) {
      // Use the SECOND biggest event for slot 3 (different angle)
      const secondEvent = significantEvents[1];
      console.log(
        `  EVENT OVERRIDE: "${secondEvent.name}" (${secondEvent.rarity}, score ${secondEvent.score})`,
      );
      const transitEvent = calendarEventToTransitEvent(secondEvent);
      const otherEvents = significantEvents.filter(
        (e) => e.id !== secondEvent.id,
      );

      const convergenceForSlot3 = allCalendarEvents
        .filter((e) => e.id !== secondEvent.id && e.score >= 50)
        .sort((a, b) => b.score - a.score);

      slot3 = await generateTransitAlertScript(
        transitEvent,
        date,
        'https://lunary.app',
        {
          calendarEvent: secondEvent,
          convergenceEvents: convergenceForSlot3,
        },
      );
    }

    if (!slot3) {
      const dateSeed =
        date.getFullYear() * 10000 +
        (date.getMonth() + 1) * 100 +
        date.getDate();
      const slot3Types: ContentType[] = [
        'sign-check',
        'ranking',
        'hot-take',
        'quiz',
        'myth',
        'did-you-know',
      ];
      const slot3Type = slot3Types[(dateSeed * 7 + 3) % slot3Types.length];
      slot3 = await generateScriptForContentType(slot3Type, date);
    }

    if (slot3) {
      console.log(`  Topic: ${slot3.facetTitle}`);
      console.log(`  Duration: ${slot3.estimatedDuration}`);
      console.log(
        `  Hook: ${slot3.hookText || slot3.fullScript.split('\n')[0]}`,
      );
      console.log(`\n  Full script:`);
      console.log(
        slot3.fullScript
          .split('\n')
          .map((l) => `    ${l}`)
          .join('\n'),
      );
      console.log('');
    }

    // Save to DB if --save flag provided
    if (saveToDb && !dryRun) {
      const saved: number[] = [];
      for (const [slotName, script, hour, slotLabel] of [
        ['Slot 1', slot1, 16, 'slot1'],
        ['Slot 3', slot3, 1, 'slot3'],
      ] as const) {
        if (!script) continue;
        try {
          const scheduledDate = new Date(
            `${targetDate}T${String(hour).padStart(2, '0')}:00:00.000Z`,
          );
          const metadata = JSON.stringify({
            ...(script.metadata || {}),
            slot: slotLabel,
            theme: 'TRANSIT ALERT',
            title: script.facetTitle,
            series: '',
            summary: script.topic || '',
            scheduledHour: hour,
            contentTypeKey: 'transit-alert',
            targetAudience: 'discovery',
          });
          const sections = JSON.stringify(script.sections || []);

          const result = await sql`
            INSERT INTO video_scripts (
              theme_id, theme_name, facet_title, topic, platform,
              sections, full_script, word_count, estimated_duration,
              scheduled_date, status, metadata, created_at, hook_text,
              written_post_content
            ) VALUES (
              ${script.themeId || 'transit-alert'}, ${script.themeName || 'Transit Alert'},
              ${script.facetTitle}, ${script.topic || ''}, 'tiktok',
              ${sections}::jsonb, ${script.fullScript}, ${script.wordCount},
              ${script.estimatedDuration}, ${scheduledDate.toISOString()},
              'draft', ${metadata}::jsonb, NOW(),
              ${script.hookText || script.fullScript.split('\n')[0]},
              ${script.writtenPostContent || script.fullScript}
            ) RETURNING id
          `;
          const scriptId = result[0]?.id;
          if (scriptId) {
            saved.push(scriptId);
            // Create video_job entry
            await sql`
              INSERT INTO video_jobs (script_id, week_start, date_key, topic, status, created_at, updated_at)
              VALUES (${scriptId}, ${targetDate}, ${targetDate}, ${script.facetTitle}, 'pending', NOW(), NOW())
              ON CONFLICT (week_start, date_key, topic)
              DO UPDATE SET script_id = ${scriptId}, status = 'pending', last_error = NULL, updated_at = NOW()
            `;
            console.log(`  [DB] Saved ${slotName}: script #${scriptId}`);
          }
        } catch (err) {
          console.error(`  [DB] Failed to save ${slotName}:`, err);
        }
      }
      if (saved.length > 0) {
        console.log(
          `\n  Saved ${saved.length} scripts to DB: ${saved.join(', ')}`,
        );
        console.log(`  Run: mcp__lunary__generate_videos to trigger rendering`);
      }
    }

    return { slot1, slot3 };
  } catch (err) {
    console.error('[Video] Generation failed:', err);
    return null;
  }
}

async function generateInstagramContent() {
  console.log('\n--- INSTAGRAM DAILY BATCH ---\n');

  try {
    console.log(`[IG] Generating batch for ${targetDate}...`);
    const batch = await generateDailyBatch(targetDate);

    if (!batch?.posts?.length) {
      console.log('  No posts generated.\n');
      return null;
    }

    console.log(`  ${batch.posts.length} post(s) generated:\n`);
    for (const post of batch.posts) {
      console.log(`  Post: ${post.topic || post.contentType || 'untitled'}`);
      console.log(`    Type: ${post.contentType}`);
      console.log(`    Slides: ${post.slides?.length || 0}`);
      if (post.slides && post.slides.length > 10) {
        console.log(
          `    WARNING: ${post.slides.length} slides — exceeds Instagram 10-slide limit!`,
        );
      }
      console.log(
        `    Caption preview: ${(post.caption || '').substring(0, 100)}...`,
      );
      console.log('');
    }

    return batch;
  } catch (err) {
    console.error('[IG] Generation failed:', err);
    return null;
  }
}

async function generateTextPosts() {
  console.log('\n--- TEXT POSTS (Pinterest, Bluesky) ---\n');

  try {
    const posts = await generateDailyTextPosts(targetDate);

    if (!posts?.length) {
      console.log('  No text posts generated.\n');
      return null;
    }

    console.log(`  ${posts.length} text post(s):\n`);
    for (const post of posts) {
      console.log(`  Platform: ${(post as any).platform}`);
      console.log(
        `    Content: ${(post as any).content?.substring(0, 150) || (post as any).text?.substring(0, 150)}...`,
      );
      console.log('');
    }

    return posts;
  } catch (err) {
    console.error('[Text] Generation failed:', err);
    return null;
  }
}

async function main() {
  // Always show the event calendar first
  await showEventCalendar();

  if (seerOnly) {
    await generateSeerSammii();
    return;
  }

  if (videosOnly) {
    await generateVideoScripts();
    return;
  }

  // Run everything
  const seerResult = await generateSeerSammii();
  const videoResult = await generateVideoScripts();
  const igResult = await generateInstagramContent();
  const textResult = await generateTextPosts();

  console.log('\n========================================');
  console.log('  SUMMARY');
  console.log('========================================');
  console.log(`  Seer Sammii: ${seerResult ? 'OK' : 'FAILED'}`);
  console.log(`  Video scripts: ${videoResult ? 'OK' : 'FAILED'}`);
  console.log(
    `  Instagram batch: ${igResult ? `${igResult.posts?.length || 0} posts` : 'FAILED'}`,
  );
  console.log(
    `  Text posts: ${textResult ? `${textResult.length} posts` : 'FAILED'}`,
  );
  console.log(
    `  Mode: ${dryRun ? 'DRY RUN (nothing saved)' : 'Generated (check output above)'}`,
  );
  console.log('========================================\n');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
