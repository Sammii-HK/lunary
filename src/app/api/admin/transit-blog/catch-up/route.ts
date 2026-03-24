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
export const maxDuration = 300;

/**
 * POST /api/admin/transit-blog/catch-up
 *
 * Generate blog posts for the next batch of uncovered transits.
 * Processes up to `limit` posts per invocation (default 3).
 * Call repeatedly until backlog is clear.
 */
export async function POST(request: NextRequest) {
  const limitParam = request.nextUrl.searchParams.get('limit');
  const batchSize = Math.min(parseInt(limitParam || '3', 10), 5);

  const candidates = await getTransitsNeedingBlogPosts();
  const batch = candidates.slice(0, batchSize);

  if (batch.length === 0) {
    return NextResponse.json({
      message: 'All transits have blog posts',
      remaining: 0,
    });
  }

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
          error: 'Transit not found in YEARLY_TRANSITS',
        });
        continue;
      }

      const ctx = buildGenerationContext(transit);
      const content = await generateTransitBlogPost(ctx);
      const wordCount = countWords(content);

      const slug = candidate.transitId;
      const id = `tbp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date().toISOString();

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
          'published', 'cron-catchup', 'gpt-4o-mini', ${wordCount},
          ${now}, ${now}, ${now}
        )
      `;

      results.push({ id, slug, title: content.title, wordCount });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push({ transitId: candidate.transitId, error: message });
    }
  }

  // Send a single Discord notification for the batch
  if (results.length > 0) {
    const postList = results
      .map((r) => `- [${r.title}](https://lunary.app/blog/transits/${r.slug})`)
      .join('\n');

    await sendDiscordNotification({
      title: `Transit deep-dives published (${results.length} posts)`,
      description: postList,
      fields: [
        {
          name: 'Total words',
          value: String(results.reduce((sum, r) => sum + r.wordCount, 0)),
          inline: true,
        },
        {
          name: 'Remaining',
          value: String(candidates.length - batch.length),
          inline: true,
        },
      ],
      color: 0x8b5cf6,
      category: 'general',
    });
  }

  return NextResponse.json({
    generated: results,
    errors,
    remaining: candidates.length - batch.length,
  });
}
