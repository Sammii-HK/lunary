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
import { generateInstagramReelCaption } from '@/lib/social/video-scripts/tiktok/metadata';
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

    // Tomorrow's date
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
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

    // --- 1. TikTok Primary Script ---
    try {
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

      const weights = await getContentTypeWeights();
      const exclude = new Set<string>();
      const contentType =
        (weightedSelect(weights, exclude, dateSeed) as ContentType) ||
        'sign-identity';

      const primaryHour = await getOptimalHourBySlot('primary');
      const script = await generateScriptForContentType(contentType, tomorrow);
      const validated = await validateAndRetry(contentType, tomorrow, script);

      if (validated) {
        validated.scheduledDate = new Date(
          `${tomorrowKey}T${String(primaryHour).padStart(2, '0')}:00:00.000Z`,
        );
        validated.platform = 'tiktok';
        if (validated.metadata) {
          validated.metadata.scheduledHour = primaryHour;
          validated.metadata.slot = 'primary';
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
          const schedule = schedules[slot];
          const dayConfig = schedule[dayName];
          if (!dayConfig) continue;

          const hour = await getOptimalHourBySlot(slot);
          const script = await generateScriptForContentType(
            dayConfig.contentType,
            tomorrow,
          );
          const validated = await validateAndRetry(
            dayConfig.contentType,
            tomorrow,
            script,
          );

          if (validated) {
            validated.scheduledDate = new Date(
              `${tomorrowKey}T${String(hour).padStart(2, '0')}:00:00.000Z`,
            );
            validated.platform = 'tiktok';
            if (validated.metadata) {
              validated.metadata.scheduledHour = hour;
              validated.metadata.slot = slot;
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
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          errors.push(`${slot}: ${msg}`);
          console.error(`[Daily] ${slot} failed:`, err);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      errors.push(`Engagement slots: ${msg}`);
      console.error('[Daily] Engagement schedule failed:', err);
    }

    // --- 3. Instagram Reel Scripts (3 per day) ---
    try {
      const igScripts = await generateDailyInstagramScripts(
        tomorrow,
        [11, 15, 19],
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
          const caption =
            post.caption + (post.hashtags ? `\n\n${post.hashtags}` : '');

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

    return NextResponse.json({
      success: true,
      date: tomorrowKey,
      day: dayName,
      results,
      total: totalScripts,
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
