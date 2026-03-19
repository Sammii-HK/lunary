import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendDiscordNotification } from '@/lib/discord';
import { generateScriptForContentType } from '@/lib/social/video-scripts/generators/weekly-secondary';
import {
  getContentTypeWeights,
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

  // Determine type and retrograde phase from eventType
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

  // Active retrogrades are frequent (Mercury 3-4x/year) — don't label as 'very-rare'
  // even if event calendar rates them HIGH. The sign context is what makes them notable.
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
  allEvents?: CalendarEvent[],
): Promise<VideoScript | null> {
  const transitEvent = calendarEventToTransitEvent(event);

  // Add convergence context — what else is happening today/tomorrow
  if (allEvents && allEvents.length > 1) {
    const otherEvents = allEvents
      .filter((e) => e.id !== event.id)
      .map((e) => e.name)
      .slice(0, 3);
    if (otherEvents.length > 0) {
      transitEvent.significance += `. Also happening around this time: ${otherEvents.join(', ')}`;
    }
  }

  const script = await generateTransitAlertScript(
    transitEvent,
    scheduledDate,
    'https://lunary.app',
  );

  if (!script) return null;

  // Enrich metadata with event calendar data
  if (script.metadata) {
    const meta = script.metadata as unknown as Record<string, unknown>;
    meta.eventRarity = event.rarity;
    meta.eventScore = event.score;
    meta.eventId = event.id;
    meta.eventCategory = event.category;
    meta.hookSuggestions = event.hookSuggestions;
    meta.historicalContext = event.historicalContext;
    meta.convergenceMultiplier = event.convergenceMultiplier;
    meta.contentTypeKey = 'transit-alert';
    meta.eventDriven = true;
    meta.eventAngle = angle;
  }

  // Duration override based on rarity
  if (event.rarity === 'CRITICAL') {
    script.estimatedDuration = '60-90s';
    if (script.metadata) {
      const meta = script.metadata as unknown as Record<string, unknown>;
      meta.compositionId = 'MediumFormVideo';
      meta.durationInFrames = 1800; // 60s at 30fps
      meta.targetWordCount = '150-225';
    }
  } else if (event.rarity === 'HIGH') {
    script.estimatedDuration = '30-60s';
    if (script.metadata) {
      const meta = script.metadata as unknown as Record<string, unknown>;
      meta.compositionId = 'ShortFormVideo';
      meta.durationInFrames = 900; // 30s at 30fps
      meta.targetWordCount = '100-150';
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
 *
 * Event-driven scripts (CRITICAL/HIGH transits) use relaxed validation
 * because they target longer formats (60-90s MediumFormVideo).
 */
async function validateAndRetry(
  contentType: ContentType,
  date: Date,
  script: VideoScript | null,
  eventDriven?: {
    event: CalendarEvent;
    angle: 'primary' | 'engagement' | 'reel';
  },
): Promise<VideoScript | null> {
  if (!script) return null;

  // Event-driven scripts use a different generator format ([HOOK]/[MEANING] sections)
  // so skip the strict hook-word-count / body-line-count validation.
  // Only check for banned phrases and empty scripts.
  if (eventDriven) {
    const text = script.fullScript || '';
    if (!text.trim()) {
      console.error(
        `[Daily] ${contentType} event-driven script is empty, skipping`,
      );
      return null;
    }
    return script;
  }

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
      slot1Video: 0, // Deep-dive video — TikTok + IG Reel (same video, different captions)
      slot2Carousel: 0, // Carousel — IG Feed + TikTok (same slides, different captions)
      slot3QuickHit: 0, // Quick-hit video — TikTok only
      textPosts: 0,
    };
    const errors: string[] = [];

    // Pre-check: which slots already have scripts for this date (safe re-run)
    // Pre-check: which slots already have scripts for this date (safe re-run)
    const existingScripts = await sql`
      SELECT metadata->>'slot' as slot, platform FROM video_scripts
      WHERE scheduled_date::date = ${tomorrowKey}
    `;
    const existingSlots = new Set(
      existingScripts.rows.map((r) => `${r.platform}:${r.slot || 'default'}`),
    );

    // =====================================================================
    // SLOT 1 — Deep-dive video (16:00 UTC / 12pm ET)
    // Same video posted to TikTok AND IG Reels with platform-specific captions.
    // On CRITICAL/HIGH event days: 60-90s transit explainer (MediumFormVideo).
    // On normal days: 30-45s category rotation (ShortFormVideo).
    // =====================================================================
    try {
      if (existingSlots.has('tiktok:slot1')) {
        console.log(
          `[Daily] Skipping Slot 1 — already exists for ${tomorrowKey}`,
        );
        results.slot1Video = 1;
      } else {
        const slot1Hour = 16; // 12pm ET
        let validated: VideoScript | null = null;
        let contentType: ContentType = 'sign-identity';
        let themeName = '';

        if (hasEventOverride && significantEvent) {
          console.log(
            `[Daily] Slot 1: event override -> transit-alert for "${significantEvent.name}"`,
          );
          contentType = 'transit-alert';
          themeName = 'Transit Alert';
          const eventScript = await generateEventDrivenScript(
            significantEvent,
            tomorrow,
            'primary',
            allSignificantEvents,
          );
          validated = await validateAndRetry(
            contentType,
            tomorrow,
            eventScript,
            { event: significantEvent, angle: 'primary' },
          );
        }

        if (!validated) {
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
            `${tomorrowKey}T${String(slot1Hour).padStart(2, '0')}:00:00.000Z`,
          );
          validated.platform = 'tiktok';
          if (validated.metadata) {
            validated.metadata.scheduledHour = slot1Hour;
            validated.metadata.slot = 'slot1';
          }

          // --- TikTok caption (keyword/SEO-heavy) ---
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
              fakeFacet as unknown as Parameters<
                typeof generateTikTokHashtags
              >[0],
              fakeTheme as Parameters<typeof generateTikTokHashtags>[1],
              validated.scheduledDate,
            );
            validated.writtenPostContent = `${hookLine}\n\n${hashtags.join(' ')}`;
          }

          const id = await saveVideoScript(validated);
          validated.id = id;

          // TikTok social_post + video_job
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
            ON CONFLICT (week_start, date_key, topic)
            DO UPDATE SET script_id = ${id}, status = 'pending', last_error = NULL, updated_at = NOW()
          `;

          // --- IG Reel: same video, save-focused caption ---
          const igCategory = igContentTypeToCategory(contentType) || 'zodiac';
          const igCaption = generateInstagramReelCaption({
            category: igCategory,
            themeName: validated.themeName || themeName,
            facetTitle: validated.facetTitle,
            hookText:
              typeof validated.hookText === 'string'
                ? validated.hookText
                : undefined,
            scheduledDate: validated.scheduledDate,
          });

          // Save IG version of the same script
          const igScript: VideoScript = {
            ...validated,
            platform: 'instagram',
            writtenPostContent: igCaption,
            metadata: validated.metadata
              ? { ...validated.metadata, slot: 'slot1-reel' as const }
              : undefined,
          };
          const igId = await saveVideoScript(igScript);

          await sql`
            INSERT INTO social_posts (
              content, platform, post_type, topic, status, image_url, video_url,
              scheduled_date, week_theme, week_start, source_type, source_id,
              source_title, created_at
            )
            SELECT ${igCaption}, 'instagram', 'video', ${validated.facetTitle}, 'pending',
                   ${SQL_NULL}, ${SQL_NULL}, ${validated.scheduledDate.toISOString()},
                   ${themeName}, ${tomorrowKey},
                   'video_script', ${igId}, ${validated.facetTitle}, NOW()
            WHERE NOT EXISTS (
              SELECT 1 FROM social_posts
              WHERE platform = 'instagram' AND post_type = 'video'
                AND topic = ${validated.facetTitle}
                AND scheduled_date::date = ${tomorrowKey}
            )
          `;

          // No separate video_job for IG — renderer produces one video file
          // that gets reused for both TikTok and IG Reel.

          results.slot1Video = 1;
          console.log(
            `[Daily] Slot 1: ${contentType}${hasEventOverride ? ' (EVENT OVERRIDE)' : ''} at ${slot1Hour}:00 (TikTok + IG Reel)`,
          );
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      errors.push(`Slot 1 Video: ${msg}`);
      console.error('[Daily] Slot 1 failed:', err);
    }

    // =====================================================================
    // SLOT 2 — Carousel (22:00 UTC / 6pm ET)
    // IG Feed carousel + TikTok carousel (same slides, different captions).
    // On CRITICAL event days: transit-themed carousel override.
    // =====================================================================
    try {
      const existingCarousel = existingScripts.rows.some(
        (r) => r.platform === 'instagram' && r.slot === 'slot2',
      );
      if (existingCarousel) {
        console.log(
          `[Daily] Skipping Slot 2 carousel — already exists for ${tomorrowKey}`,
        );
        results.slot2Carousel = 1;
      } else {
        const igBatch = await generateDailyBatch(tomorrowKey, undefined);

        // CRITICAL event: override carousel content
        if (
          significantEvent?.rarity === 'CRITICAL' &&
          igBatch.posts.length > 0
        ) {
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
            scheduledTime: `${tomorrowKey}T22:00:00.000Z`,
            metadata: {
              category: 'planetary',
              slug: significantEvent.id,
              eventDriven: true,
              eventRarity: significantEvent.rarity,
            },
          };

          const carouselIdx = igBatch.posts.findIndex(
            (p) => p.type === 'carousel',
          );
          if (carouselIdx >= 0) {
            console.log(
              `[Daily] Slot 2: CRITICAL event override -> "${significantEvent.name}"`,
            );
            igBatch.posts[carouselIdx] =
              eventCarouselPost as (typeof igBatch.posts)[0];
          }
        }

        if (igBatch.posts.length > 0) {
          for (const post of igBatch.posts) {
            const scheduledDate = new Date(
              post.scheduledTime || `${tomorrowKey}T22:00:00.000Z`,
            );
            const imageUrl = Array.isArray(post.imageUrls)
              ? post.imageUrls.join('|')
              : null;
            const hashtagStr = Array.isArray(post.hashtags)
              ? post.hashtags.join(' ')
              : post.hashtags || '';
            const caption =
              post.caption + (hashtagStr ? `\n\n${hashtagStr}` : '');

            // IG Feed carousel
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

            // TikTok carousel (same slides, cross-posted)
            await sql`
              INSERT INTO social_posts (
                content, platform, post_type, topic, status, image_url,
                scheduled_date, week_start, created_at
              )
              SELECT ${caption}, 'tiktok', 'carousel',
                     ${post.type}, 'pending', ${imageUrl},
                     ${scheduledDate.toISOString()}, ${tomorrowKey}, NOW()
              WHERE NOT EXISTS (
                SELECT 1 FROM social_posts
                WHERE platform = 'tiktok' AND post_type = 'carousel'
                  AND scheduled_date::date = ${tomorrowKey}
              )
            `;

            results.slot2Carousel++;
          }
          console.log(
            `[Daily] Slot 2: ${igBatch.posts.length} carousel posts at 22:00 (IG + TikTok)`,
          );
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      errors.push(`Slot 2 Carousel: ${msg}`);
      console.error('[Daily] Slot 2 failed:', err);
    }

    // =====================================================================
    // SLOT 3 — Quick-hit video (01:00 UTC+1 / 9pm ET)
    // Short, punchy TikTok-only video (24-38s). Viral reach play.
    // =====================================================================
    try {
      if (existingSlots.has('tiktok:slot3')) {
        console.log(
          `[Daily] Skipping Slot 3 — already exists for ${tomorrowKey}`,
        );
        results.slot3QuickHit = 1;
      } else {
        // Slot 3 is 01:00 UTC the NEXT day (9pm ET same evening)
        const slot3DateKey = new Date(tomorrow);
        slot3DateKey.setUTCDate(slot3DateKey.getUTCDate() + 1);
        const slot3Key = slot3DateKey.toISOString().split('T')[0];

        const dateSeed =
          tomorrow.getFullYear() * 10000 +
          (tomorrow.getMonth() + 1) * 100 +
          tomorrow.getDate() +
          7; // offset from slot 1 seed
        const weights = await getContentTypeWeights();
        const exclude = new Set<string>();
        const contentType =
          (weightedSelect(weights, exclude, dateSeed) as ContentType) ||
          'sign-check';

        const script = await generateScriptForContentType(
          contentType,
          tomorrow,
        );

        if (!script) {
          console.warn(
            `[Daily] Slot 3: generateScriptForContentType('${contentType}') returned null`,
          );
          errors.push(
            `Slot 3: script generation returned null for ${contentType}`,
          );
        }

        const validated = await validateAndRetry(contentType, tomorrow, script);

        if (!validated && script) {
          console.warn(
            `[Daily] Slot 3 validation failed for ${contentType} — word count: ${script.wordCount ?? 'N/A'}, hook: ${script.hookText?.slice(0, 60) ?? 'none'}`,
          );
          errors.push(`Slot 3: validation failed for ${contentType}`);
        }

        if (validated) {
          validated.scheduledDate = new Date(`${slot3Key}T01:00:00.000Z`);
          validated.platform = 'tiktok';
          if (validated.metadata) {
            validated.metadata.scheduledHour = 1;
            validated.metadata.slot = 'slot3';
          }

          // TikTok SEO caption
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
              fakeFacet as unknown as Parameters<
                typeof generateTikTokHashtags
              >[0],
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
                AND scheduled_date::date = ${slot3Key}
            )
          `;

          await sql`
            INSERT INTO video_jobs (script_id, week_start, date_key, topic, status, created_at, updated_at)
            VALUES (${id}, ${tomorrowKey}, ${slot3Key}, ${validated.facetTitle}, 'pending', NOW(), NOW())
            ON CONFLICT (week_start, date_key, topic)
            DO UPDATE SET script_id = ${id}, status = 'pending', last_error = NULL, updated_at = NOW()
          `;

          results.slot3QuickHit = 1;
          console.log(
            `[Daily] Slot 3: ${contentType} at 01:00+1 (TikTok only)`,
          );
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      errors.push(`Slot 3 QuickHit: ${msg}`);
      console.error('[Daily] Slot 3 failed:', err);
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
      results.slot1Video +
      results.slot2Carousel +
      results.slot3QuickHit +
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
          `Slot 1 (16:00): ${results.slot1Video} video (TikTok + IG Reel)`,
          `Slot 2 (22:00): ${results.slot2Carousel} carousel (IG + TikTok)`,
          `Slot 3 (01:00): ${results.slot3QuickHit} quick-hit (TikTok)`,
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
