import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { postToSocial } from '@/lib/social/client';
import { hasValidImageExtension } from '@/lib/social/pre-upload-image';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET(request: NextRequest) {
  try {
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

    const url = new URL(request.url);
    const force = url.searchParams.get('force') === 'true';
    const overrideDate = url.searchParams.get('date');

    const now = new Date();
    const dateStr =
      overrideDate && /^\d{4}-\d{2}-\d{2}$/.test(overrideDate)
        ? overrideDate
        : now.toISOString().split('T')[0];

    // Dedup guard: skip if stories already attempted today
    if (!force) {
      const existingStories = await sql`
        SELECT COUNT(*) as count FROM social_posts
        WHERE post_type = 'story' AND platform = 'instagram'
          AND scheduled_date::date = ${dateStr}::date
          AND status IN ('sent', 'failed')
      `;
      if (Number(existingStories.rows[0]?.count || 0) >= 4) {
        console.log(`📖 Stories already generated for ${dateStr}, skipping`);
        return NextResponse.json({
          success: true,
          skipped: true,
          message: `Stories already generated for ${dateStr}`,
        });
      }
    }

    console.log(`📖 Generating Instagram stories for ${dateStr}...`);
    const startTime = Date.now();

    const { generateDailyStoryData } =
      await import('@/lib/instagram/story-content');
    const { seededRandom } = await import('@/lib/instagram/ig-utils');

    const storyItems = generateDailyStoryData(dateStr);

    // Fill quote slots from DB if today's rotation includes a quote
    const hasQuoteSlot = storyItems.some(
      (s) => s.variant === 'quote' && !s.title,
    );
    if (hasQuoteSlot) {
      let quoteText = 'The cosmos is within us. We are made of star-stuff.';
      let quoteAuthor = 'Carl Sagan';
      try {
        const quoteResult = await sql`
          SELECT id, quote_text, author
          FROM social_quotes
          WHERE status = 'available'
          ORDER BY use_count ASC, created_at ASC
          LIMIT 50
        `;
        if (quoteResult.rows.length > 0) {
          const quoteRng = seededRandom(`story-quote-${dateStr}`);
          const quoteIndex = Math.floor(quoteRng() * quoteResult.rows.length);
          const quote = quoteResult.rows[quoteIndex];
          quoteText = quote.quote_text;
          quoteAuthor = quote.author || 'Lunary';
          await sql`
            UPDATE social_quotes
            SET use_count = use_count + 1, used_at = NOW(), updated_at = NOW()
            WHERE id = ${quote.id}
          `;
        }
      } catch (quoteError) {
        console.warn(
          '[Stories] Failed to fetch quote, using fallback:',
          quoteError,
        );
      }

      for (let idx = 0; idx < storyItems.length; idx++) {
        if (storyItems[idx].variant === 'quote' && !storyItems[idx].title) {
          storyItems[idx] = {
            variant: 'quote',
            title: quoteText,
            subtitle: quoteAuthor,
            params: {
              text:
                quoteAuthor !== 'Lunary'
                  ? `${quoteText} - ${quoteAuthor}`
                  : quoteText,
              format: 'story',
              v: '4',
            },
            endpoint: '/api/og/social-quote',
          };
        }
      }
    }

    const storyUtcHours = [9, 12, 15, 19];
    const SHARE_BASE_URL = (
      url.searchParams.get('storyBaseUrl') ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      'https://lunary.app'
    ).replace(/\/$/, '');

    const VARIANT_TO_HIGHLIGHT: Record<string, string> = {
      daily_moon: 'Moon',
      tarot_pull: 'Tarot',
      quote: 'Quotes',
      did_you_know: 'Grimoire',
      affirmation: 'Affirmations',
      ritual_tip: 'Rituals',
      sign_of_the_day: 'Zodiac',
      transit_alert: 'Cosmic',
      numerology: 'Numerology',
    };

    const results: Array<{
      scheduledTime: string;
      variant: string;
      status: string;
      error?: string;
    }> = [];

    for (let i = 0; i < storyItems.length; i++) {
      const story = storyItems[i];
      const utcHour = storyUtcHours[i];
      const scheduledTime = new Date(
        `${dateStr}T${String(utcHour).padStart(2, '0')}:00:00Z`,
      );

      const imageParams = new URLSearchParams(story.params);
      const rawImageUrl = `${SHARE_BASE_URL}${story.endpoint}?${imageParams.toString()}`;
      const staticImageUrl = rawImageUrl.includes('/api/og/')
        ? rawImageUrl
            .replace(/^(https?:\/\/[^/]+)\/\//, '$1/')
            .replace(/(\?.*)$/, '.png$1')
        : rawImageUrl;
      const storyCategory = VARIANT_TO_HIGHLIGHT[story.variant] || 'Cosmic';

      try {
        if (!hasValidImageExtension(staticImageUrl)) {
          console.error(
            `[daily-stories] Skipped — no valid extension (length: ${staticImageUrl.length})`,
          );
          results.push({
            scheduledTime: scheduledTime.toISOString(),
            variant: story.variant,
            status: 'error',
            error: `No valid extension in image URL`,
          });
          continue;
        }

        const result = await postToSocial({
          platform: 'instagram',
          content: '',
          scheduledDate: scheduledTime.toISOString(),
          media: [{ type: 'image', url: staticImageUrl, alt: story.title }],
          platformSettings: {
            instagramOptions: { isStory: true },
          },
        });

        if (result.success) {
          await sql`
            INSERT INTO social_posts (content, platform, post_type, scheduled_date, status, image_url, story_category, content_type)
            VALUES ('', 'instagram', 'story', ${scheduledTime.toISOString()}, 'sent', ${staticImageUrl}, ${storyCategory}, ${story.variant})
          `;
          results.push({
            scheduledTime: scheduledTime.toISOString(),
            variant: story.variant,
            status: 'success',
          });
        } else {
          const errorMsg = result.error || 'Unknown error';
          console.error(
            `[daily-stories] Failed (${story.variant}): ${errorMsg}`,
          );
          await sql`
            INSERT INTO social_posts (content, platform, post_type, scheduled_date, status, story_category, content_type, rejection_feedback)
            VALUES ('', 'instagram', 'story', ${scheduledTime.toISOString()}, 'failed', ${storyCategory}, ${story.variant}, ${errorMsg})
          `;
          results.push({
            scheduledTime: scheduledTime.toISOString(),
            variant: story.variant,
            status: 'error',
            error: errorMsg,
          });
        }
      } catch (postError) {
        const errorMsg =
          postError instanceof Error ? postError.message : 'Unknown error';
        console.error(
          `[daily-stories] Exception (${story.variant}):`,
          postError,
        );
        await sql`
          INSERT INTO social_posts (content, platform, post_type, scheduled_date, status, story_category, content_type, rejection_feedback)
          VALUES ('', 'instagram', 'story', ${scheduledTime.toISOString()}, 'failed', ${storyCategory}, ${story.variant}, ${errorMsg})
        `;
        results.push({
          scheduledTime: scheduledTime.toISOString(),
          variant: story.variant,
          status: 'error',
          error: errorMsg,
        });
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const executionTimeMs = Date.now() - startTime;

    console.log(
      `📖 Stories: ${storyItems.length} generated, ${successCount} sent in ${executionTimeMs}ms`,
    );

    return NextResponse.json({
      success: successCount > 0,
      date: dateStr,
      storyCount: storyItems.length,
      sentCount: successCount,
      stories: results,
      executionTimeMs,
    });
  } catch (error) {
    console.error('📖 Daily Stories cron failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
