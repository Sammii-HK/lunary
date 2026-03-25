// DEPRECATED: Video pipeline moved to Hetzner (content-creator/hetzner-pipeline/).
// This route is no longer called by Vercel crons. Kept for admin/debug use only.

import { NextRequest, NextResponse, after } from 'next/server';
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
  selectSmartCategory,
} from '@/lib/social/video-scripts/content-scores';
import type { SelectionMethod } from '@/lib/social/video-scripts/content-scores';
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
import type { VideoScript } from '@/lib/social/video-scripts/types';
import type { ContentType } from '@/lib/social/video-scripts/content-types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

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
 * Deterministic seed for a date — reproducible across re-runs.
 */
function dateSeedFor(date: Date): number {
  const dayOfWeek = (date.getDay() + 6) % 7; // Mon=0
  const monday = new Date(date);
  monday.setDate(date.getDate() - dayOfWeek);
  return (
    monday.getFullYear() * 10000 +
    (monday.getMonth() + 1) * 100 +
    monday.getDate() +
    dayOfWeek * 37
  );
}

/**
 * Select a primary category for a given date.
 *
 * When EDA signals are available, uses selectSmartCategory which:
 * - Picks the best category for this day-of-week x slot combo (80% exploit)
 * - Explores underrepresented categories to gather data (20% explore)
 * - Forces diversity when HHI concentration is too high
 *
 * Falls back to deterministic weighted rotation when no EDA data exists.
 */
async function selectPrimaryCategoryForDate(
  date: Date,
  weights: Map<
    string,
    {
      score: number;
      count: number;
      avgViews: number;
      trend: number;
      weight: number;
    }
  >,
): Promise<{ category: string; method: SelectionMethod }> {
  const seed = dateSeedFor(date);

  // Try EDA-informed smart selection first
  const { category, method } = await selectSmartCategory(
    weights,
    new Set<string>(),
    seed,
    date.getDay(), // JS day: 0=Sun
    'primary',
  );
  if (category) return { category, method };

  // Fallback: deterministic weighted pool (original behaviour)
  const weightedPool: string[] = [];
  for (const cat of GRIMOIRE_CATEGORIES) {
    const weight = THEME_CATEGORY_WEIGHTS[cat] ?? 1;
    if (weight <= 0) continue;
    for (let i = 0; i < weight; i++) {
      weightedPool.push(cat);
    }
  }

  return {
    category:
      weightedPool[((seed * 9301 + 49297) % 233280) % weightedPool.length],
    method: 'fallback-deterministic',
  };
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

  const hookOpts = { contentType };
  const hookIssues = validateVideoHook(hookText, topic, searchPhrase, hookOpts);
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
    validateVideoHook(retryHook, retryTopic, retryTopic, hookOpts),
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
  // Auth check (fast, returns before Cloudflare timeout)
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

  // Capture params before returning response
  const dateParam = request.nextUrl.searchParams.get('date');

  // Return immediately — heavy work runs in background via after()
  after(async () => {
    await runContentGeneration(dateParam);
  });

  return NextResponse.json({
    accepted: true,
    message: 'Content generation started in background',
    date: dateParam || 'tomorrow',
  });
}

/**
 * The actual content generation logic, extracted so it can run in after().
 */
async function runContentGeneration(dateParam: string | null) {
  const startTime = Date.now();

  try {
    await ensureVideoScriptsTable();

    // Target date: ?date=YYYY-MM-DD or tomorrow by default
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

    // Level 7: Cross-slot topic dedup — prevent same facet appearing twice in one day
    const usedTopics = new Set<string>();

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
        const weights = await getContentTypeWeights();
        const { category, method: categoryMethod } =
          await selectPrimaryCategoryForDate(tomorrow, weights);
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

        const exclude = new Set<string>();
        const { category: smartType, method: contentMethod } =
          await selectSmartCategory(
            weights,
            exclude,
            dateSeed,
            tomorrow.getDay(),
            'primary',
          );
        const contentType =
          (smartType as ContentType) ||
          (weightedSelect(weights, exclude, dateSeed) as ContentType) ||
          'sign-identity';

        const primaryHour = await getOptimalHourBySlot(
          'primary',
          10,
          contentType,
        );
        const script = await generateScriptForContentType(
          contentType,
          tomorrow,
        );
        const validated = await validateAndRetry(contentType, tomorrow, script);

        if (validated) {
          validated.scheduledDate = new Date(
            `${tomorrowKey}T${String(primaryHour).padStart(2, '0')}:00:00.000Z`,
          );
          validated.platform = 'tiktok';
          if (validated.metadata) {
            validated.metadata.scheduledHour = primaryHour;
            validated.metadata.slot = 'primary';
            (validated.metadata as Record<string, unknown>).selectionMethod =
              contentMethod;
            (validated.metadata as Record<string, unknown>).categoryMethod =
              categoryMethod;
          }
          usedTopics.add(validated.facetTitle);

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
                 ${validated.facetTitle}, 'pending', ${null}, ${null},
                 ${validated.scheduledDate.toISOString()}, ${theme.name}, ${tomorrowKey},
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
            `[Daily] Primary TikTok: ${contentType} at ${primaryHour}:00`,
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
          const schedule = schedules[slot];
          const dayConfig = schedule[dayName];
          if (!dayConfig) continue;

          const hour = await getOptimalHourBySlot(
            slot,
            10,
            dayConfig.contentType,
          );
          const script = await generateScriptForContentType(
            dayConfig.contentType,
            tomorrow,
          );
          let validated = await validateAndRetry(
            dayConfig.contentType,
            tomorrow,
            script,
          );

          // Level 7: Cross-slot topic dedup — retry once if topic already used today
          if (validated && usedTopics.has(validated.facetTitle)) {
            console.log(
              `[Daily] ${slot}: "${validated.facetTitle}" already used today, retrying`,
            );
            const retryScript = await generateScriptForContentType(
              dayConfig.contentType,
              tomorrow,
            );
            const retry = await validateAndRetry(
              dayConfig.contentType,
              tomorrow,
              retryScript,
            );
            if (retry && !usedTopics.has(retry.facetTitle)) {
              validated = retry;
            }
          }

          if (validated) {
            validated.scheduledDate = new Date(
              `${tomorrowKey}T${String(hour).padStart(2, '0')}:00:00.000Z`,
            );
            validated.platform = 'tiktok';
            if (validated.metadata) {
              validated.metadata.scheduledHour = hour;
              validated.metadata.slot = slot;
              (validated.metadata as Record<string, unknown>).selectionMethod =
                'weekly-schedule';
            }
            usedTopics.add(validated.facetTitle);

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
                     ${validated.facetTitle}, 'pending', ${null}, ${null},
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
              `[Daily] ${slot}: ${dayConfig.contentType} at ${hour}:00`,
            );
          } else {
            console.warn(
              `[Daily] ${slot}: ${dayConfig.contentType} failed validation, skipped`,
            );
            errors.push(
              `${slot}: ${dayConfig.contentType} failed validation after retry`,
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
        // usedTopics is shared across all slots (Level 7 cross-slot dedup)
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
                     ${fbScript.facetTitle}, 'pending', ${null}, ${null},
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
                   ${null}, ${null}, ${igScript.scheduledDate.toISOString()},
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
    try {
      const igBatch = await generateDailyBatch(tomorrowKey);
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
    try {
      await sendDiscordNotification({
        title: 'Daily Content Generated',
        description: [
          `**${tomorrowKey} (${dayName})**`,
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

    console.log(
      `[Daily] Complete: ${tomorrowKey} (${dayName}) — ${totalScripts} pieces in ${duration}ms`,
      errors.length > 0 ? `Errors: ${errors.join(', ')}` : '',
    );
  } catch (error) {
    console.error('[Daily] Fatal error:', error);
    try {
      await sendDiscordNotification({
        title: 'Daily Content — Fatal Error',
        description: error instanceof Error ? error.message : 'Unknown error',
        color: 'error',
        category: 'general',
      });
    } catch {
      // Discord itself failed
    }
  }
}
