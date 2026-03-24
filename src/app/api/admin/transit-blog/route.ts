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

/**
 * GET /api/admin/transit-blog
 *
 * List transit blog posts with optional status filter.
 */
export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get('status');
  const includeQueue =
    request.nextUrl.searchParams.get('includeQueue') === 'true';

  let posts;
  if (status) {
    posts = await sql`
      SELECT * FROM transit_blog_posts
      WHERE status = ${status}
      ORDER BY start_date ASC NULLS LAST
    `;
  } else {
    posts = await sql`
      SELECT * FROM transit_blog_posts
      ORDER BY created_at DESC
    `;
  }

  const result: Record<string, unknown> = { posts: posts.rows };

  if (includeQueue) {
    const candidates = await getTransitsNeedingBlogPosts();
    result.queue = candidates.slice(0, 20);
  }

  return NextResponse.json(result);
}

/**
 * POST /api/admin/transit-blog
 *
 * Generate a blog post for a specific transit.
 * Body: { transitId: string }
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { transitId } = body;

  if (!transitId) {
    return NextResponse.json(
      { error: 'transitId is required' },
      { status: 400 },
    );
  }

  const transit = getTransitById(transitId);
  if (!transit) {
    return NextResponse.json(
      { error: `Transit not found: ${transitId}` },
      { status: 404 },
    );
  }

  // Check if already exists
  const existing = await sql`
    SELECT id FROM transit_blog_posts WHERE transit_id = ${transitId}
  `;
  if (existing.rows.length > 0) {
    return NextResponse.json(
      {
        error: 'Blog post already exists for this transit',
        id: existing.rows[0].id,
      },
      { status: 409 },
    );
  }

  const ctx = buildGenerationContext(transit);
  const content = await generateTransitBlogPost(ctx);
  const wordCount = countWords(content);

  const slug = transitId; // e.g. "saturn-return-2025"
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
      ${id}, ${slug}, ${transitId}, ${content.title}, ${content.subtitle},
      ${content.metaDescription}, ${`{${content.keywords.map((k) => `"${k.replace(/"/g, '\\"')}"`).join(',')}}`},
      ${content.introduction}, ${content.historicalDeepDive},
      ${content.astronomicalContext}, ${content.practicalGuidance},
      ${JSON.stringify(content.signBreakdowns)}, ${content.closingSection},
      ${ctx.planet}, ${ctx.sign}, ${ctx.transitType},
      ${ctx.startDate}, ${ctx.endDate}, ${ctx.rarity},
      'published', 'manual', 'gpt-4o-mini', ${wordCount},
      ${now}, ${now}, ${now}
    )
  `;

  await sendDiscordNotification({
    title: 'Transit deep-dive published',
    description: content.title,
    url: `https://lunary.app/blog/transits/${slug}`,
    fields: [
      { name: 'Planet', value: ctx.planet, inline: true },
      { name: 'Sign', value: ctx.sign, inline: true },
      { name: 'Words', value: String(wordCount), inline: true },
    ],
    color: 0x8b5cf6,
    category: 'general',
  });

  return NextResponse.json({ id, slug, title: content.title, wordCount });
}
