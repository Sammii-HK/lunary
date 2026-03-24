import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import {
  buildGenerationContext,
  generateTransitBlogPost,
  countWords,
  getTransitsNeedingBlogPosts,
  getTransitById,
} from '@/lib/blog/transit-deep-dive';
import { sendDiscordNotification } from '@/lib/discord';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

const LEAD_DAYS = 180; // 6 months

/**
 * GET /api/cron/transit-blog-generate
 *
 * Weekly cron (Wednesdays 10:00 UTC) that generates transit deep-dive posts.
 *
 * Adaptive batch size:
 * - >10 uncovered transits in window: generate 3
 * - 5-10: generate 2
 * - <5: generate 1
 *
 * Auto-publishes with Discord notification.
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // Auth check (same pattern as cosmic-forecast)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    if (
      !(
        request.headers.get('x-vercel-cron') === '1' &&
        process.env.VERCEL === '1'
      )
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Get candidates and determine batch size
  const candidates = await getTransitsNeedingBlogPosts();

  // Filter to candidates within the lead-time window
  const now = new Date();
  const windowEnd = new Date(now.getTime() + LEAD_DAYS * 86400000);
  const inWindow = candidates.filter((c) => {
    if (!c.startDate) return true;
    return c.startDate <= windowEnd;
  });

  if (inWindow.length === 0) {
    return NextResponse.json({
      message: 'All transits within 180-day window have blog posts',
      totalUncovered: candidates.length,
    });
  }

  // Adaptive batch size
  let batchSize: number;
  if (inWindow.length > 10) {
    batchSize = 3;
  } else if (inWindow.length >= 5) {
    batchSize = 2;
  } else {
    batchSize = 1;
  }

  const batch = inWindow.slice(0, batchSize);
  const results: Array<{
    id: string;
    slug: string;
    title: string;
    wordCount: number;
  }> = [];
  const errors: Array<{ transitId: string; error: string }> = [];

  for (const candidate of batch) {
    try {
      const transit = getTransitById(candidate.transitId);
      if (!transit) {
        errors.push({
          transitId: candidate.transitId,
          error: 'Transit not found',
        });
        continue;
      }

      const ctx = buildGenerationContext(transit);
      const content = await generateTransitBlogPost(ctx);
      const wordCount = countWords(content);

      const slug = candidate.transitId;
      const id = `tbp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const nowStr = new Date().toISOString();

      await sql`
        INSERT INTO transit_blog_posts (
          id, slug, transit_id, title, subtitle, meta_description, keywords,
          introduction, historical_deep_dive, astronomical_context,
          practical_guidance, sign_breakdowns, closing_section,
          planet, sign, transit_type, start_date, end_date, rarity,
          status, generated_by, model_used, word_count,
          published_at, created_at, updated_at
        ) VALUES (
          ${id}, ${slug}, ${candidate.transitId}, ${content.title},
          ${content.subtitle}, ${content.metaDescription}, ${`{${content.keywords.map((k) => `"${k.replace(/"/g, '\\"')}"`).join(',')}}`},
          ${content.introduction}, ${content.historicalDeepDive},
          ${content.astronomicalContext}, ${content.practicalGuidance},
          ${JSON.stringify(content.signBreakdowns)}, ${content.closingSection},
          ${ctx.planet}, ${ctx.sign}, ${ctx.transitType},
          ${ctx.startDate}, ${ctx.endDate}, ${ctx.rarity},
          'published', 'cron-scheduled', 'gpt-4o-mini', ${wordCount},
          ${nowStr}, ${nowStr}, ${nowStr}
        )
      `;

      results.push({ id, slug, title: content.title, wordCount });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push({ transitId: candidate.transitId, error: message });
    }
  }

  const elapsed = Date.now() - startTime;

  // Discord notification
  if (results.length > 0) {
    const postList = results
      .map((r) => `[${r.title}](https://lunary.app/blog/transits/${r.slug})`)
      .join('\n');

    await sendDiscordNotification({
      title: `Weekly transit deep-dives (${results.length} posts)`,
      description: postList,
      fields: [
        {
          name: 'Words',
          value: String(results.reduce((sum, r) => sum + r.wordCount, 0)),
          inline: true,
        },
        {
          name: 'Remaining in window',
          value: String(inWindow.length - batch.length),
          inline: true,
        },
        {
          name: 'Time',
          value: `${(elapsed / 1000).toFixed(1)}s`,
          inline: true,
        },
      ],
      color: 0x8b5cf6,
      category: 'general',
      dedupeKey: `transit-blog-cron-${now.toISOString().split('T')[0]}`,
    });
  }

  if (errors.length > 0) {
    await sendDiscordNotification({
      title: 'Transit blog generation errors',
      description: errors.map((e) => `${e.transitId}: ${e.error}`).join('\n'),
      color: 0xef4444,
      category: 'urgent',
    });
  }

  return NextResponse.json({
    generated: results,
    errors,
    remaining: inWindow.length - batch.length,
    elapsed: `${(elapsed / 1000).toFixed(1)}s`,
  });
}
