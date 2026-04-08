/**
 * Direct transit blog article generator — bypasses the HTTP API to avoid route timeouts.
 * Usage: npx tsx --env-file=.env.local scripts/gen-articles.ts <transitId> [transitId2] ...
 * Example: npx tsx --env-file=.env.local scripts/gen-articles.ts saturn-aries-2026 jupiter-cancer-2026
 */

import {
  buildGenerationContext,
  generateTransitBlogPost,
  countWords,
  getTransitById,
} from '../src/lib/blog/transit-deep-dive/index';
import { checkArticleQuality } from '../src/lib/blog/transit-deep-dive/quality-check';
import { sql } from '@vercel/postgres';
import { randomBytes } from 'crypto';

const transitIds = process.argv.slice(2);

if (transitIds.length === 0) {
  console.log(
    'Usage: npx tsx --env-file=.env.local scripts/gen-articles.ts <transitId> [...]',
  );
  process.exit(1);
}

async function generate(transitId: string) {
  console.log(`\n=== ${transitId} ===`);
  const transit = getTransitById(transitId);
  if (!transit) {
    console.log('✗ NOT FOUND in transit data');
    return;
  }
  const ctx = buildGenerationContext(transit);
  console.log(`  Generating: ${transit.title}...`);
  const content = await generateTransitBlogPost(ctx);
  const wordCount = countWords(content);

  console.log(`  Running quality check...`);
  const quality = await checkArticleQuality(content);
  const status = quality.status;
  console.log(`  Quality: ${quality.summary}`);

  const id = `tbp_${Date.now()}_${randomBytes(3).toString('hex')}`;
  const now = new Date().toISOString();
  const publishedAt = status === 'published' ? now : null;

  await sql`
    INSERT INTO transit_blog_posts (
      id, slug, transit_id, title, subtitle, meta_description, keywords,
      introduction, historical_deep_dive, astronomical_context,
      practical_guidance, sign_breakdowns, closing_section,
      planet, sign, transit_type, start_date, end_date, rarity,
      status, generated_by, model_used, word_count,
      published_at, created_at, updated_at
    ) VALUES (
      ${id}, ${transitId}, ${transitId}, ${content.title}, ${content.subtitle},
      ${content.metaDescription},
      ${`{${content.keywords.map((k: string) => `"${k.replace(/"/g, '\\"')}"`).join(',')}}`},
      ${content.introduction}, ${content.historicalDeepDive},
      ${content.astronomicalContext}, ${content.practicalGuidance},
      ${JSON.stringify(content.signBreakdowns)}, ${content.closingSection},
      ${ctx.planet}, ${ctx.sign}, ${ctx.transitType},
      ${ctx.startDate}, ${ctx.endDate}, ${ctx.rarity},
      ${status}, 'manual', 'claude-sonnet', ${wordCount},
      ${publishedAt}, ${now}, ${now}
    )
    ON CONFLICT (slug) DO UPDATE SET
      title        = EXCLUDED.title,
      subtitle     = EXCLUDED.subtitle,
      introduction = EXCLUDED.introduction,
      historical_deep_dive = EXCLUDED.historical_deep_dive,
      astronomical_context = EXCLUDED.astronomical_context,
      practical_guidance   = EXCLUDED.practical_guidance,
      sign_breakdowns      = EXCLUDED.sign_breakdowns,
      closing_section      = EXCLUDED.closing_section,
      word_count   = EXCLUDED.word_count,
      model_used   = EXCLUDED.model_used,
      status       = EXCLUDED.status,
      updated_at   = EXCLUDED.updated_at
  `;
  const statusIcon = status === 'published' ? '✓' : '⚠ DRAFT';
  console.log(`  ${statusIcon} ${content.title} — ${wordCount} words`);
}

(async () => {
  for (const id of transitIds) {
    try {
      await generate(id);
    } catch (e: any) {
      console.error(`  ✗ ${id}: ${e?.message ?? e}`);
    }
  }
  process.exit(0);
})();
