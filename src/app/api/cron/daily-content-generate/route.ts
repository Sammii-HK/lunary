import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendDiscordNotification } from '@/lib/discord';
import {
  generateScriptForContentType,
  buildWeeklySchedule,
} from '@/lib/social/video-scripts/generators/weekly-secondary';
import { generateDailyInstagramScripts } from '@/lib/social/video-scripts/generators/instagram-reels';
import {
  getContentTypeWeights,
  getOptimalHourBySlot,
  weightedSelect,
} from '@/lib/social/video-scripts/content-scores';
import {
  ensureVideoScriptsTable,
  saveVideoScript,
} from '@/lib/social/video-scripts/database';
import {
  validateVideoHook,
  validateScriptBody,
  getCriticalIssues,
} from '@/lib/social/video-scripts/validation';
import { generateDailyBatch } from '@/lib/instagram/content-orchestrator';
import {
  generateInstagramReelCaption,
  generateTikTokHashtags,
} from '@/lib/social/video-scripts/tiktok/metadata';
import {
  categoryThemes,
  GRIMOIRE_CATEGORIES,
  THEME_CATEGORY_WEIGHTS,
} from '@/lib/social/weekly-themes';
import {
  getEventCalendarForDate,
  type CalendarEvent,
  type EventRarity,
} from '@/lib/astro/event-calendar';
import { generateTransitAlertScript } from '@/lib/social/video-scripts/generators/transit-alert';
import type { TransitEvent } from '@/lib/social/video-scripts/generators/transit-alert';
import type { VideoScript } from '@/lib/social/video-scripts/types';
import type { ContentType } from '@/lib/social/video-scripts/content-types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

/** Typed null for SQL parameters — avoids CodeQL implicit-operand-conversion */
const SQL_NULL: string | null = null;

const DAY_NAMES = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

/**
 * Map IG content type key to category for caption generation
 */
function igContentTypeToCategory(contentTypeKey: string | undefined): string {
  if (contentTypeKey === 'angel_numbers') return 'angel-numbers';
  return 'zodiac';
}

/**
 * Map content type key to a visual/hashtag category
 */
function contentTypeKeyToCategory(
  contentTypeKey: string | undefined,
): string | undefined {
  if (!contentTypeKey) return undefined;
  const map: Record<string, string> = {
    'angel-number': 'angel-numbers',
    'sign-check': 'zodiac',
    'sign-identity': 'zodiac',
    'sign-origin': 'zodiac',
    'chiron-sign': 'zodiac',
    ranking: 'zodiac',
    'hot-take': 'zodiac',
    quiz: 'zodiac',
    myth: 'zodiac',
    'did-you-know': 'zodiac',
    'transit-alert': 'transits',
  };
  return map[contentTypeKey];
}

/**
 * Select a primary category for a given date using weighted rotation.
 * Seeded by the Monday of that week for consistency.
 */
function selectPrimaryCategoryForDate(date: Date): string {
  // Find Monday of the week
  const dayOfWeek = (date.getDay() + 6) % 7; // Mon=0
  const monday = new Date(date);
  monday.setDate(date.getDate() - dayOfWeek);

  const seed =
    monday.getFullYear() * 10000 +
    (monday.getMonth() + 1) * 100 +
    monday.getDate() +
    dayOfWeek * 37;

  const weightedPool: string[] = [];
  for (const cat of GRIMOIRE_CATEGORIES) {
    const weight = THEME_CATEGORY_WEIGHTS[cat] ?? 1;
    if (weight <= 0) continue;
    for (let i = 0; i < weight; i++) {
      weightedPool.push(cat);
    }
  }

  const pick =
    weightedPool[((seed * 9301 + 49297) % 233280) % weightedPool.length];
  return pick;
}

// ---------------------------------------------------------------------------
// Event Calendar Integration
// ---------------------------------------------------------------------------

/**
 * Convert a CalendarEvent to a TransitEvent for use with generateTransitAlertScript.
 */
function calendarEventToTransitEvent(event: CalendarEvent): TransitEvent {
  const rarityMap: Record<EventRarity, TransitEvent['rarity']> = {
    CRITICAL: 'very-rare',
    HIGH: 'very-rare',
    MEDIUM: 'rare',
    LOW: 'common',
  };

  return {
    type: event.eventType === 'retrograde_station' ? 'station' : 'ingress',
    planet: event.planet || 'Transit',
    fromSign: undefined,
    toSign: event.sign,
    date: new Date(event.date),
    rarity: rarityMap[event.rarity],
    significance: [event.name, event.historicalContext, event.rarityFrame]
      .filter(Boolean)
      .join('. '),
  };
}

/**
 * Get the highest-priority CRITICAL or HIGH event for a date, if any.
 * Returns null when the existing rotation should be used.
 */
async function getSignificantEventForDate(
  dateStr: string,
): Promise<{ event: CalendarEvent; allEvents: CalendarEvent[] } | null> {
  try {
    const events = await getEventCalendarForDate(dateStr);
    const significant = events
      .filter((e) => e.rarity === 'CRITICAL' || e.rarity === 'HIGH')
      .sort((a, b) => b.score - a.score);

    if (significant.length === 0) return null;
    return { event: significant[0], allEvents: significant };
  } catch (err) {
    console.warn(
      '[Daily] Event calendar lookup failed, continuing with normal rotation:',
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

/**
 * Generate a transit-driven video script from a CalendarEvent.
 * Adjusts word count targets based on event rarity:
 *   CRITICAL: 150-225 words (60-90s, MediumFormVideo)
 *   HIGH:     100-150 words (30-60s, ShortFormVideo/MediumFormVideo)
 */
async function generateEventDrivenScript(
  event: CalendarEvent,
  scheduledDate: Date,
  angle: 'primary' | 'engagement' | 'reel' = 'primary',
): Promise<VideoScript | null> {
  const transitEvent = calendarEventToTransitEvent(event);
  const script = await generateTransitAlertScript(
    transitEvent,
    scheduledDate,
    'https://lunary.app',
  );

  if (!script) return null;

  // Enrich metadata with event calendar data
  if (script.metadata) {
    (script.metadata as Record<string, unknown>).eventRarity = event.rarity;
    (script.metadata as Record<string, unknown>).eventScore = event.score;
    (script.metadata as Record<string, unknown>).eventId = event.id;
    (script.metadata as Record<string, unknown>).eventCategory = event.category;
    (script.metadata as Record<string, unknown>).hookSuggestions =
      event.hookSuggestions;
    (script.metadata as Record<string, unknown>).historicalContext =
      event.historicalContext;
    (script.metadata as Record<string, unknown>).convergenceMultiplier =
      event.convergenceMultiplier;
    (script.metadata as Record<string, unknown>).contentTypeKey =
      'transit-alert';
    (script.metadata as Record<string, unknown>).eventDriven = true;
    (script.metadata as Record<string, unknown>).eventAngle = angle;
  }

  // Duration override based on rarity
  if (event.rarity === 'CRITICAL') {
    script.estimatedDuration = '60-90s';
    if (script.metadata) {
      (script.metadata as Record<string, unknown>).compositionId =
        'MediumFormVideo';
      (script.metadata as Record<string, unknown>).durationInFrames = 1800; // 60s at 30fps
      (script.metadata as Record<string, unknown>).targetWordCount = '150-225';
    }
  } else if (event.rarity === 'HIGH') {
    script.estimatedDuration = '30-60s';
    if (script.metadata) {
      (script.metadata as Record<string, unknown>).compositionId =
        'ShortFormVideo';
      (script.metadata as Record<string, unknown>).durationInFrames = 900; // 30s at 30fps
      (script.metadata as Record<string, unknown>).targetWordCount = '100-150';
    }
  }

  // Vary the angle label for engagement/reel variants
  if (angle === 'engagement') {
    script.facetTitle = `${event.name} -- what it means for you`;
    script.topic = `Personal impact: ${event.name}`;
  } else if (angle === 'reel') {
    script.facetTitle = `${event.name} -- quick guide`;
    script.topic = `IG guide: ${event.name}`;
  }

  return script;
}

/**
 * Validate a script, retry once if critical issues found.
 * Returns the script if valid, null if failed after retry.
 */
async function validateAndRetry(
  contentType: ContentType,
  date: Date,
  script: VideoScript | null,
): Promise<VideoScript | null> {
  if (!script) return null;

  const hookText = script.hookText || script.fullScript.split('\n')[0] || '';
  const bodyLines = script.fullScript
    .split('\n')
    .filter((l) => l.trim())
    .slice(1);
  const topic = script.topic || script.facetTitle || '';
  const searchPhrase = topic;

  const hookIssues = validateVideoHook(hookText, topic, searchPhrase);
  const bodyIssues = validateScriptBody(bodyLines, topic, searchPhrase);
  const criticalHook = getCriticalIssues(hookIssues);
  const criticalBody = getCriticalIssues(bodyIssues);

  if (criticalHook.length === 0 && criticalBody.length === 0) {
    return script;
  }

  // Retry once
  console.log(
    `[Daily] Retrying ${contentType} due to: ${[...criticalHook, ...criticalBody].join(', ')}`,
  );
  const retry = await generateScriptForContentType(contentType, date);
  if (!retry) return null;

  const retryHook = retry.hookText || retry.fullScript.split('\n')[0] || '';
  const retryBody = retry.fullScript
    .split('\n')
    .filter((l) => l.trim())
    .slice(1);
  const retryTopic = retry.topic || retry.facetTitle || '';
  const retryHookIssues = getCriticalIssues(
    validateVideoHook(retryHook, retryTopic, retryTopic),
  );
  const retryBodyIssues = getCriticalIssues(
    validateScriptBody(retryBody, retryTopic, retryTopic),
  );

  if (retryHookIssues.length === 0 && retryBodyIssues.length === 0) {
    return retry;
  }

  console.error(
    `[Daily] ${contentType} failed validation after retry, skipping`,
  );
  return null;
}

/**
 * GET /api/cron/daily-content-generate
 *
 * Daily 06:30 UTC cron that generates tomorrow's content:
 * - 4 TikTok video scripts (primary + 3 engagement slots)
 * - 3 Instagram Reel scripts (11:00, 15:00, 19:00 UTC)
 * - 1 Instagram carousel/meme
 * - Text posts for all platforms
 *
 * Yesterday's performance data (collected at 06:00) feeds into content type selection.
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Auth check
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const authHeader = request.headers.get('authorization');

    if (!isVercelCron) {
      if (
        !process.env.CRON_SECRET ||
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    await ensureVideoScriptsTable();

    // Target date: ?date=YYYY-MM-DD or tomorrow by default
    const dateParam = request.nextUrl.searchParams.get('date');
    const tomorrow = dateParam
      ? new Date(`${dateParam}T00:00:00.000Z`)
      : new Date();
    if (!dateParam) {
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);
    }
    const tomorrowKey = tomorrow.toISOString().split('T')[0];
    const dayOfWeek = (tomorrow.getDay() + 6) % 7; // Mon=0
    const dayName = DAY_NAMES[dayOfWeek];

    console.log(`[Daily] Generating content for ${tomorrowKey} (${dayName})`);

    // --- Event Calendar Detection ---
    // Check for significant astronomical events tomorrow
    const eventData = await getSignificantEventForDate(tomorrowKey);
    const significantEvent = eventData?.event ?? null;
    const allSignificantEvents = eventData?.allEvents ?? [];
    const hasEventOverride = significantEvent !== null;

    if (hasEventOverride) {
      console.log(
        `[Daily] EVENT OVERRIDE: ${significantEvent!.rarity} event detected -- "${significantEvent!.name}" (score: ${significantEvent!.score})`,
      );
      if (allSignificantEvents.length > 1) {
        console.log(
          `[Daily] ${allSignificantEvents.length} total CRITICAL/HIGH events: ${allSignificantEvents.map((e) => e.name).join(', ')}`,
        );
      }
    }

    const results = {
      tiktokPrimary: 0,
      tiktokEngagementA: 0,
      tiktokEngagementB: 0,
      tiktokEngagementC: 0,
      igReels: 0,
      igCarousel: 0,
      textPosts: 0,
    };
    const errors: string[] = [];

    // Pre-check: which slots already have scripts for this date (safe re-run)
    const existingScripts = await sql`
      SELECT metadata->>'slot' as slot, platform FROM video_scripts
      WHERE scheduled_date::date = ${tomorrowKey}
    `;
    const existingSlots = new Set(
      existingScripts.rows.map((r) => `${r.platform}:${r.slot || 'default'}`),
    );

    // --- 1. TikTok Primary Script ---
    try {
      if (existingSlots.has('tiktok:primary')) {
        console.log(
          `[Daily] Skipping TikTok primary — already exists for ${tomorrowKey}`,
        );
        results.tiktokPrimary = 1;
      } else {
        // When a CRITICAL/HIGH event is detected, override normal rotation
        // with a transit-driven script; otherwise use seeded category rotation
        const primaryHour = await getOptimalHourBySlot('primary');
        let validated: VideoScript | null = null;
        let contentType: ContentType = 'sign-identity';
        let themeName = '';

        if (hasEventOverride && significantEvent) {
          // --- Event-driven primary TikTok ---
          console.log(
            `[Daily] Primary TikTok: event override -> transit-alert for "${significantEvent.name}"`,
          );
          contentType = 'transit-alert';
          themeName = 'Transit Alert';
          const eventScript = await generateEventDrivenScript(
            significantEvent,
            tomorrow,
            'primary',
          );
          validated = await validateAndRetry(
            contentType,
            tomorrow,
            eventScript,
          );
        }

        if (!validated) {
          // --- Normal seeded rotation (fallback or no event) ---
          const category = selectPrimaryCategoryForDate(tomorrow);
          const themesForCategory = categoryThemes.filter(
            (t) => t.category === category,
          );
          const dateSeed =
            tomorrow.getFullYear() * 10000 +
            (tomorrow.getMonth() + 1) * 100 +
            tomorrow.getDate();
          const theme =
            themesForCategory.length > 0
              ? themesForCategory[dateSeed % themesForCategory.length]
              : categoryThemes[dateSeed % categoryThemes.length];
          themeName = theme.name;

          const weights = await getContentTypeWeights();
          const exclude = new Set<string>();
          contentType =
            (weightedSelect(weights, exclude, dateSeed) as ContentType) ||
            'sign-identity';

          const script = await generateScriptForContentType(
            contentType,
            tomorrow,
          );
          validated = await validateAndRetry(contentType, tomorrow, script);
        }

        if (validated) {
          validated.scheduledDate = new Date(
            `${tomorrowKey}T${String(primaryHour).padStart(2, '0')}:00:00.000Z`,
          );
          validated.platform = 'tiktok';
          if (validated.metadata) {
            validated.metadata.scheduledHour = primaryHour;
            validated.metadata.slot = 'primary';
          }

          // Generate TikTok caption with hashtags if missing
          if (!validated.writtenPostContent) {
            const hookLine =
              validated.hookText || validated.fullScript.split('\n')[0] || '';
            const cat = contentTypeKeyToCategory(contentType) || 'zodiac';
            const fakeFacet = {
              title: validated.facetTitle,
              slug: validated.facetTitle
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-'),
            };
            const fakeTheme = {
              category: cat,
              name: validated.themeName || '',
            };
            const hashtags = generateTikTokHashtags(
              fakeFacet as Parameters<typeof generateTikTokHashtags>[0],
              fakeTheme as Parameters<typeof generateTikTokHashtags>[1],
              validated.scheduledDate,
            );
            validated.writtenPostContent = `${hookLine}\n\n${hashtags.join(' ')}`;
          }

          const id = await saveVideoScript(validated);
          validated.id = id;

          // Create social_post + video_job
          await sql`
          INSERT INTO social_posts (
            content, platform, post_type, topic, status, image_url, video_url,
            scheduled_date, week_theme, week_start, source_type, source_id,
            source_title, created_at
          )
          SELECT ${validated.writtenPostContent || validated.fullScript}, 'tiktok', 'video',
                 ${validated.facetTitle}, 'pending', ${SQL_NULL}, ${SQL_NULL},
                 ${validated.scheduledDate.toISOString()}, ${themeName}, ${tomorrowKey},
                 'video_script', ${id}, ${validated.facetTitle}, NOW()
          WHERE NOT EXISTS (
            SELECT 1 FROM social_posts
            WHERE platform = 'tiktok' AND post_type = 'video'
              AND topic = ${validated.facetTitle}
              AND scheduled_date::date = ${tomorrowKey}
          )
        `;

          await sql`
          INSERT INTO video_jobs (script_id, week_start, date_key, topic, status, created_at, updated_at)
          VALUES (${id}, ${tomorrowKey}, ${tomorrowKey}, ${validated.facetTitle}, 'pending', NOW(), NOW())
          ON CONFLICT (script_id)
          DO UPDATE SET status = 'pending', last_error = NULL, updated_at = NOW()
        `;

          results.tiktokPrimary = 1;
          console.log(
            `[Daily] Primary TikTok: ${contentType}${hasEventOverride ? ' (EVENT OVERRIDE)' : ''} at ${primaryHour}:00`,
          );
        }
      } // close else (skip-if-exists)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      errors.push(`TikTok Primary: ${msg}`);
      console.error('[Daily] Primary TikTok failed:', err);
    }

    // --- 2. TikTok Engagement Scripts (A, B, C) ---
    const engagementSlots = [
      'engagementA',
      'engagementB',
      'engagementC',
    ] as const;
    try {
      const { slotA, slotB, slotC } = await buildWeeklySchedule(tomorrow);
      const schedules = {
        engagementA: slotA,
        engagementB: slotB,
        engagementC: slotC,
      };

      // When CRITICAL/HIGH event detected, override engagementA with
      // an event-driven script from a different angle
      let eventEngagementSlotUsed = false;

      for (const slot of engagementSlots) {
        try {
          if (existingSlots.has(`tiktok:${slot}`)) {
            console.log(
              `[Daily] Skipping ${slot} — already exists for ${tomorrowKey}`,
            );
            const resultKey =
              `tiktok${slot.charAt(0).toUpperCase() + slot.slice(1)}` as keyof typeof results;
            (results as Record<string, number>)[resultKey] = 1;
            continue;
          }

          const hour = await getOptimalHourBySlot(slot);
          let validated: VideoScript | null = null;
          let slotContentType: ContentType;

          // Override engagementA with event-driven content (different angle)
          if (
            hasEventOverride &&
            significantEvent &&
            slot === 'engagementA' &&
            !eventEngagementSlotUsed
          ) {
            console.log(
              `[Daily] ${slot}: event override -> engagement angle for "${significantEvent.name}"`,
            );
            slotContentType = 'transit-alert';
            // Use a secondary event if available, otherwise same event different angle
            const engagementEvent =
              allSignificantEvents.length > 1
                ? allSignificantEvents[1]
                : significantEvent;
            const eventScript = await generateEventDrivenScript(
              engagementEvent,
              tomorrow,
              'engagement',
            );
            validated = await validateAndRetry(
              slotContentType,
              tomorrow,
              eventScript,
            );
            if (validated) eventEngagementSlotUsed = true;
          }

          // Normal engagement slot (or fallback if event override failed)
          if (!validated) {
            const schedule = schedules[slot];
            const dayConfig = schedule[dayName];
            if (!dayConfig) continue;
            slotContentType = dayConfig.contentType;

            const script = await generateScriptForContentType(
              slotContentType,
              tomorrow,
            );
            validated = await validateAndRetry(
              slotContentType,
              tomorrow,
              script,
            );
          }

          if (validated) {
            validated.scheduledDate = new Date(
              `${tomorrowKey}T${String(hour).padStart(2, '0')}:00:00.000Z`,
            );
            validated.platform = 'tiktok';
            if (validated.metadata) {
              validated.metadata.scheduledHour = hour;
              validated.metadata.slot = slot;
            }

            // Generate TikTok caption with hashtags if missing
            if (!validated.writtenPostContent) {
              const hookLine =
                validated.hookText || validated.fullScript.split('\n')[0] || '';
              const contentTypeKey = (
                validated.metadata as Record<string, unknown>
              )?.contentTypeKey as string | undefined;
              const category =
                contentTypeKeyToCategory(contentTypeKey) || 'zodiac';
              const fakeFacet = {
                title: validated.facetTitle,
                slug: validated.facetTitle
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-'),
              };
              const fakeTheme = { category, name: validated.themeName || '' };
              const hashtags = generateTikTokHashtags(
                fakeFacet as Parameters<typeof generateTikTokHashtags>[0],
                fakeTheme as Parameters<typeof generateTikTokHashtags>[1],
                validated.scheduledDate,
              );
              validated.writtenPostContent = `${hookLine}\n\n${hashtags.join(' ')}`;
            }

            const id = await saveVideoScript(validated);
            validated.id = id;

            await sql`
              INSERT INTO social_posts (
                content, platform, post_type, topic, status, image_url, video_url,
                scheduled_date, week_theme, week_start, source_type, source_id,
                source_title, created_at
              )
              SELECT ${validated.writtenPostContent || validated.fullScript}, 'tiktok', 'video',
                     ${validated.facetTitle}, 'pending', ${SQL_NULL}, ${SQL_NULL},
                     ${validated.scheduledDate.toISOString()}, ${validated.themeName}, ${tomorrowKey},
                     'video_script', ${id}, ${validated.facetTitle}, NOW()
              WHERE NOT EXISTS (
                SELECT 1 FROM social_posts
                WHERE platform = 'tiktok' AND post_type = 'video'
                  AND topic = ${validated.facetTitle}
                  AND scheduled_date = ${validated.scheduledDate.toISOString()}
              )
            `;

            await sql`
              INSERT INTO video_jobs (script_id, week_start, date_key, topic, status, created_at, updated_at)
              VALUES (${id}, ${tomorrowKey}, ${tomorrowKey}, ${validated.facetTitle}, 'pending', NOW(), NOW())
              ON CONFLICT (script_id)
              DO UPDATE SET status = 'pending', last_error = NULL, updated_at = NOW()
            `;

            const resultKey =
              `tiktok${slot.charAt(0).toUpperCase() + slot.slice(1)}` as keyof typeof results;
            (results as Record<string, number>)[resultKey] = 1;
            console.log(
              `[Daily] ${slot}: ${slotContentType}${eventEngagementSlotUsed && slot === 'engagementA' ? ' (EVENT OVERRIDE)' : ''} at ${hour}:00`,
            );
          } else {
            console.warn(
              `[Daily] ${slot}: ${slotContentType} failed validation, skipped`,
            );
            errors.push(
              `${slot}: ${slotContentType} failed validation after retry`,
            );
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          errors.push(`${slot}: ${msg}`);
          console.error(`[Daily] ${slot} failed:`, err);
        }
      }

      // Ensure we have 4 TikToks — backfill if any slot was dropped
      const tiktokTotal =
        results.tiktokPrimary +
        results.tiktokEngagementA +
        results.tiktokEngagementB +
        results.tiktokEngagementC;
      if (tiktokTotal < 4) {
        const missing = 4 - tiktokTotal;
        console.log(
          `[Daily] Only ${tiktokTotal}/4 TikToks generated, backfilling ${missing}`,
        );
        const fallbackTypes: ContentType[] = [
          'sign-check',
          'did-you-know',
          'hot-take',
          'myth',
          'ranking',
          'sign-identity',
          'quiz',
        ];
        const usedTopics = new Set<string>();
        for (let fi = 0; fi < missing; fi++) {
          let fbScript: VideoScript | null = null;
          // Try multiple content types to get a unique topic
          for (let ti = 0; ti < fallbackTypes.length && !fbScript; ti++) {
            const fbTypeIdx = (fi + ti) % fallbackTypes.length;
            const candidateType = fallbackTypes[fbTypeIdx];
            const candidate = await generateScriptForContentType(
              candidateType,
              tomorrow,
            );
            if (candidate && !usedTopics.has(candidate.facetTitle)) {
              fbScript = candidate;
              if (fbScript.metadata) {
                (fbScript.metadata as Record<string, unknown>).contentTypeKey =
                  candidateType;
              }
            }
          }
          if (!fbScript) continue;
          usedTopics.add(fbScript.facetTitle);
          try {
            const fbHour = 10 + fi * 3; // space them out
            fbScript.scheduledDate = new Date(
              `${tomorrowKey}T${String(fbHour).padStart(2, '0')}:00:00.000Z`,
            );
            fbScript.platform = 'tiktok';

            // Generate caption with hashtags
            if (!fbScript.writtenPostContent) {
              const hookLine =
                fbScript.hookText || fbScript.fullScript.split('\n')[0] || '';
              const fbContentType =
                ((fbScript.metadata as Record<string, unknown>)
                  ?.contentTypeKey as string) || 'sign-check';
              const cat = contentTypeKeyToCategory(fbContentType) || 'zodiac';
              const fakeFacet = {
                title: fbScript.facetTitle,
                slug: fbScript.facetTitle
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-'),
              };
              const fakeTheme = {
                category: cat,
                name: fbScript.themeName || '',
              };
              const hashtags = generateTikTokHashtags(
                fakeFacet as Parameters<typeof generateTikTokHashtags>[0],
                fakeTheme as Parameters<typeof generateTikTokHashtags>[1],
                fbScript.scheduledDate,
              );
              fbScript.writtenPostContent = `${hookLine}\n\n${hashtags.join(' ')}`;
            }

            const fbId = await saveVideoScript(fbScript);
            await sql`
              INSERT INTO social_posts (
                content, platform, post_type, topic, status, image_url, video_url,
                scheduled_date, week_theme, week_start, source_type, source_id,
                source_title, created_at
              )
              SELECT ${fbScript.writtenPostContent || fbScript.fullScript}, 'tiktok', 'video',
                     ${fbScript.facetTitle}, 'pending', ${SQL_NULL}, ${SQL_NULL},
                     ${fbScript.scheduledDate.toISOString()}, ${fbScript.themeName}, ${tomorrowKey},
                     'video_script', ${fbId}, ${fbScript.facetTitle}, NOW()
              WHERE NOT EXISTS (
                SELECT 1 FROM social_posts
                WHERE platform = 'tiktok' AND post_type = 'video'
                  AND topic = ${fbScript.facetTitle}
                  AND scheduled_date = ${fbScript.scheduledDate.toISOString()}
              )
            `;
            await sql`
              INSERT INTO video_jobs (script_id, week_start, date_key, topic, status, created_at, updated_at)
              VALUES (${fbId}, ${tomorrowKey}, ${tomorrowKey}, ${fbScript.facetTitle}, 'pending', NOW(), NOW())
              ON CONFLICT (script_id)
              DO UPDATE SET status = 'pending', last_error = NULL, updated_at = NOW()
            `;
            console.log(
              `[Daily] Backfill TikTok ${fi + 1}: ${fbScript.facetTitle} at ${fbHour}:00`,
            );
            // Count in the first empty slot
            if (!results.tiktokEngagementA) results.tiktokEngagementA = 1;
            else if (!results.tiktokEngagementB) results.tiktokEngagementB = 1;
            else if (!results.tiktokEngagementC) results.tiktokEngagementC = 1;
          } catch (fbErr) {
            console.error(`[Daily] Backfill TikTok ${fi + 1} failed:`, fbErr);
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      errors.push(`Engagement slots: ${msg}`);
      console.error('[Daily] Engagement schedule failed:', err);
    }

    // --- 3. Instagram Reel Scripts (3 per day) ---
    try {
      const existingIgReels = existingScripts.rows.filter(
        (r) => r.platform === 'instagram',
      ).length;
      if (existingIgReels >= 3) {
        console.log(
          `[Daily] Skipping IG Reels — ${existingIgReels} already exist for ${tomorrowKey}`,
        );
        results.igReels = existingIgReels;
      } else {
        const igScripts = await generateDailyInstagramScripts(
          tomorrow,
          [15, 17, 21],
        );

        // When CRITICAL/HIGH event detected, prepend an event-driven IG Reel
        // and drop the last generated reel to keep the count at 3
        if (hasEventOverride && significantEvent && igScripts.length > 0) {
          try {
            const eventReelScript = await generateEventDrivenScript(
              significantEvent,
              tomorrow,
              'reel',
            );
            if (eventReelScript) {
              eventReelScript.platform = 'instagram';
              eventReelScript.scheduledDate = new Date(
                `${tomorrowKey}T15:00:00.000Z`,
              );
              if (eventReelScript.metadata) {
                eventReelScript.metadata.scheduledHour = 15;
                eventReelScript.metadata.slot = 'primary';
              }
              // Replace the first reel slot with the event-driven one
              igScripts[0] = eventReelScript;
              console.log(
                `[Daily] IG Reel slot 0: event override -> "${significantEvent.name}"`,
              );
            }
          } catch (eventReelErr) {
            console.warn(
              '[Daily] Event-driven IG Reel failed, using normal rotation:',
              eventReelErr instanceof Error
                ? eventReelErr.message
                : eventReelErr,
            );
          }
        }

        for (const igScript of igScripts) {
          try {
            const id = await saveVideoScript(igScript);
            igScript.id = id;

            const dateKey = igScript.scheduledDate.toISOString().split('T')[0];
            const igCategory = igContentTypeToCategory(
              igScript.metadata?.contentTypeKey as string | undefined,
            );
            const igCaption = generateInstagramReelCaption({
              category: igCategory,
              themeName: igScript.themeName,
              facetTitle: igScript.facetTitle,
              hookText:
                typeof igScript.hookText === 'string'
                  ? igScript.hookText
                  : undefined,
              scheduledDate: igScript.scheduledDate,
            });

            await sql`
            INSERT INTO social_posts (
              content, platform, post_type, topic, status, image_url, video_url,
              scheduled_date, week_theme, week_start, source_type, source_id,
              source_title, created_at
            )
            SELECT ${igCaption}, 'instagram', 'video', ${igScript.facetTitle}, 'pending',
                   ${SQL_NULL}, ${SQL_NULL}, ${igScript.scheduledDate.toISOString()},
                   ${igScript.themeName}, ${tomorrowKey},
                   'video_script', ${id}, ${igScript.facetTitle}, NOW()
            WHERE NOT EXISTS (
              SELECT 1 FROM social_posts
              WHERE platform = 'instagram' AND post_type = 'video'
                AND topic = ${igScript.facetTitle}
                AND scheduled_date = ${igScript.scheduledDate.toISOString()}
            )
          `;

            await sql`
            INSERT INTO video_jobs (script_id, week_start, date_key, topic, status, created_at, updated_at)
            VALUES (${id}, ${tomorrowKey}, ${dateKey}, ${igScript.facetTitle}, 'pending', NOW(), NOW())
            ON CONFLICT (script_id)
            DO UPDATE SET status = 'pending', last_error = NULL, updated_at = NOW()
          `;

            results.igReels++;
            console.log(
              `[Daily] IG Reel: ${igScript.facetTitle} at ${igScript.metadata?.scheduledHour}:00`,
            );
          } catch (igErr) {
            console.error(`[Daily] IG Reel save failed:`, igErr);
          }
        }
      } // close else (skip-if-exists for IG Reels)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      errors.push(`IG Reels: ${msg}`);
      console.error('[Daily] IG Reels failed:', err);
    }

    // --- 4. Instagram Carousel/Meme ---
    // For CRITICAL events, force a transit-themed carousel override
    // by passing 'planetary' as a forced category hint
    try {
      const igBatch = await generateDailyBatch(tomorrowKey, undefined);

      // When a CRITICAL event is detected, inject an event-awareness text post
      // as an additional carousel-style item about the transit
      if (significantEvent?.rarity === 'CRITICAL' && igBatch.posts.length > 0) {
        const eventCaption = [
          significantEvent.name,
          '',
          significantEvent.historicalContext || '',
          '',
          significantEvent.hookSuggestions?.[0] || '',
          '',
          '#astrology #transit #lunary',
        ]
          .filter((line) => line !== undefined)
          .join('\n')
          .trim();

        const eventCarouselPost = {
          type: 'carousel' as const,
          format: 'square' as const,
          imageUrls: [] as string[],
          caption: eventCaption,
          hashtags: [
            '#astrology',
            '#transit',
            `#${(significantEvent.planet || 'cosmic').toLowerCase()}`,
          ],
          scheduledTime: `${tomorrowKey}T10:00:00.000Z`,
          metadata: {
            category: 'planetary',
            slug: significantEvent.id,
            eventDriven: true,
            eventRarity: significantEvent.rarity,
          },
        };

        // Replace the first carousel post with the event-driven one
        const carouselIdx = igBatch.posts.findIndex(
          (p) => p.type === 'carousel',
        );
        if (carouselIdx >= 0) {
          console.log(
            `[Daily] IG Carousel: CRITICAL event override -> "${significantEvent.name}"`,
          );
          igBatch.posts[carouselIdx] =
            eventCarouselPost as (typeof igBatch.posts)[0];
        }
      }

      if (igBatch.posts.length > 0) {
        for (const post of igBatch.posts) {
          const scheduledDate = new Date(
            post.scheduledTime || `${tomorrowKey}T12:00:00.000Z`,
          );
          const imageUrl = Array.isArray(post.imageUrls)
            ? post.imageUrls.join('|')
            : null;
          const hashtagStr = Array.isArray(post.hashtags)
            ? post.hashtags.join(' ')
            : post.hashtags || '';
          const caption =
            post.caption + (hashtagStr ? `\n\n${hashtagStr}` : '');

          await sql`
            INSERT INTO social_posts (
              content, platform, post_type, topic, status, image_url,
              scheduled_date, week_start, created_at
            )
            SELECT ${caption}, 'instagram', ${post.type === 'meme' ? 'meme' : 'instagram_carousel'},
                   ${post.type}, 'pending', ${imageUrl},
                   ${scheduledDate.toISOString()}, ${tomorrowKey}, NOW()
            WHERE NOT EXISTS (
              SELECT 1 FROM social_posts
              WHERE platform = 'instagram'
                AND post_type = ${post.type === 'meme' ? 'meme' : 'instagram_carousel'}
                AND scheduled_date::date = ${tomorrowKey}
            )
          `;

          results.igCarousel++;
        }
        console.log(`[Daily] IG Carousel: ${igBatch.posts.length} posts`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      errors.push(`IG Carousel: ${msg}`);
      console.error('[Daily] IG Carousel failed:', err);
    }

    // --- 5. Text Posts (all platforms) ---
    try {
      const { generateThematicPostsForWeek, getNextThemeIndex } =
        await import('@/lib/social/thematic-generator');
      const { selectWeeklyTheme } = await import('@/lib/social/weekly-themes');
      const {
        generateCatchyQuote,
        getQuoteImageUrl,
        getQuoteWithInterpretation,
      } = await import('@/lib/social/quote-generator');
      const { getEducationalImageUrl, getPlatformImageFormat } =
        await import('@/lib/social/educational-images');
      const { generateEducationalPost } =
        await import('@/lib/social/educational-generator');
      const { getDefaultPostingTime } = await import('@/utils/posting-times');
      const { getImageBaseUrl: getBaseUrl } = await import('@/lib/urls');

      // Find Monday of tomorrow's week
      const mondayOffset = dayOfWeek; // dayOfWeek is Mon=0 based
      const weekMonday = new Date(tomorrow);
      weekMonday.setUTCDate(tomorrow.getUTCDate() - mondayOffset);
      weekMonday.setUTCHours(0, 0, 0, 0);

      const themeIndex = await getNextThemeIndex(sql);
      const allPosts = await generateThematicPostsForWeek(
        weekMonday,
        themeIndex,
      );

      // Filter to just tomorrow's posts
      const tomorrowPosts = allPosts.filter((post) => {
        const postDate = post.scheduledDate.toISOString().split('T')[0];
        return postDate === tomorrowKey;
      });

      console.log(
        `[Daily] Text posts: ${tomorrowPosts.length} for ${tomorrowKey} (filtered from ${allPosts.length} weekly)`,
      );

      const baseUrl = getBaseUrl();

      const platformsNeedingImages = [
        'pinterest',
        'reddit',
        'twitter',
        'facebook',
        'linkedin',
      ];

      for (const post of tomorrowPosts) {
        try {
          // Set posting hour
          const hour = getDefaultPostingTime(post.platform);
          const postDate = new Date(tomorrow);
          postDate.setUTCHours(hour, 0, 0, 0);

          // Generate image for platforms that support them
          let imageUrl: string | null = null;
          if (platformsNeedingImages.includes(post.platform)) {
            const platformFormat = getPlatformImageFormat(post.platform);
            if (post.postType.startsWith('educational')) {
              try {
                const educationalPost = await generateEducationalPost(
                  post.platform,
                  'mixed',
                );
                if (educationalPost?.grimoireSnippet) {
                  imageUrl = getEducationalImageUrl(
                    educationalPost.grimoireSnippet,
                    baseUrl,
                    post.platform,
                  );
                }
              } catch {
                // Fall through to quote image
              }
            }
            if (!imageUrl) {
              try {
                const quoteWithInterp = await getQuoteWithInterpretation(
                  post.content,
                  post.postType,
                );
                if (quoteWithInterp) {
                  imageUrl = getQuoteImageUrl(quoteWithInterp.quote, baseUrl, {
                    format: platformFormat,
                    interpretation: quoteWithInterp.interpretation || undefined,
                    author: quoteWithInterp.author || undefined,
                  });
                } else {
                  const quote = await generateCatchyQuote(
                    post.content,
                    post.postType,
                  );
                  imageUrl = quote
                    ? getQuoteImageUrl(quote, baseUrl, {
                        format: platformFormat,
                      })
                    : null;
                }
              } catch {
                const quote = await generateCatchyQuote(
                  post.content,
                  post.postType,
                );
                imageUrl = quote
                  ? getQuoteImageUrl(quote, baseUrl, {
                      format: getPlatformImageFormat(post.platform),
                    })
                  : null;
              }
            }
          }

          await sql`
            INSERT INTO social_posts (content, platform, post_type, topic, status, image_url, scheduled_date, week_start, created_at)
            SELECT ${post.content}, ${post.platform}, ${post.postType}, ${post.topic || null}, 'pending', ${imageUrl || null}, ${postDate.toISOString()}, ${tomorrowKey}, NOW()
            WHERE NOT EXISTS (
              SELECT 1 FROM social_posts
              WHERE platform = ${post.platform}
                AND post_type = ${post.postType}
                AND topic IS NOT DISTINCT FROM ${post.topic || null}
                AND scheduled_date = ${postDate.toISOString()}
            )
          `;
          results.textPosts++;
        } catch (postErr) {
          console.error(
            `[Daily] Text post save failed (${post.platform}/${post.postType}):`,
            postErr,
          );
        }
      }
      console.log(`[Daily] Text posts saved: ${results.textPosts}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      errors.push(`Text posts: ${msg}`);
      console.error('[Daily] Text posts failed:', err);
    }

    const totalScripts =
      results.tiktokPrimary +
      results.tiktokEngagementA +
      results.tiktokEngagementB +
      results.tiktokEngagementC +
      results.igReels +
      results.igCarousel +
      results.textPosts;

    const duration = Date.now() - startTime;

    // Discord notification
    const eventOverrideLine =
      hasEventOverride && significantEvent
        ? `\n**Event Override: ${significantEvent.rarity}** -- ${significantEvent.name} (score: ${significantEvent.score})`
        : '';

    try {
      await sendDiscordNotification({
        title: hasEventOverride
          ? `Daily Content Generated (${significantEvent!.rarity} EVENT)`
          : 'Daily Content Generated',
        description: [
          `**${tomorrowKey} (${dayName})**`,
          eventOverrideLine,
          `TikTok: ${results.tiktokPrimary} primary + ${results.tiktokEngagementA + results.tiktokEngagementB + results.tiktokEngagementC} engagement`,
          `IG Reels: ${results.igReels}/3`,
          `IG Carousel: ${results.igCarousel}`,
          `Text posts: ${results.textPosts}`,
          `**Total: ${totalScripts} pieces**`,
          errors.length > 0 ? `\nErrors:\n${errors.join('\n')}` : '',
          `Duration: ${Math.round(duration / 1000)}s`,
        ]
          .filter(Boolean)
          .join('\n'),
        color: errors.length > 0 ? 'warning' : 'success',
        category: 'general',
      });
    } catch {
      console.warn('[Daily] Discord notification failed');
    }

    return NextResponse.json({
      success: true,
      date: tomorrowKey,
      day: dayName,
      results,
      total: totalScripts,
      eventOverride: hasEventOverride
        ? {
            rarity: significantEvent!.rarity,
            name: significantEvent!.name,
            score: significantEvent!.score,
            eventCount: allSignificantEvents.length,
          }
        : undefined,
      errors: errors.length > 0 ? errors : undefined,
      duration: `${duration}ms`,
    });
  } catch (error) {
    console.error('[Daily] Fatal error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate daily content',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
