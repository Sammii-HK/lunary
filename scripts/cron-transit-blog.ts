/**
 * Local cron: generate transit blog articles for upcoming transits.
 *
 * Runs on your machine (uses your Claude CLI auth), writes to production DB.
 * Pages and sitemap update automatically via ISR — no deploy needed.
 *
 * Schedule via launchd or cron:
 *   0 10 * * 3  npx tsx --env-file=.env.local scripts/cron-transit-blog.ts
 *
 * Or run manually:
 *   npx tsx --env-file=.env.local scripts/cron-transit-blog.ts
 *   npx tsx --env-file=.env.local scripts/cron-transit-blog.ts --dry-run
 *   npx tsx --env-file=.env.local scripts/cron-transit-blog.ts --lead-days=90
 */

import { sql } from '@vercel/postgres';
import { randomBytes } from 'crypto';
import {
  buildGenerationContext,
  generateTransitBlogPost,
  countWords,
  getTransitsNeedingBlogPosts,
} from '../src/lib/blog/transit-deep-dive/index';
import { checkArticleQuality } from '../src/lib/blog/transit-deep-dive/quality-check';
import type { YearlyTransit } from '../src/constants/seo/yearly-transits';

// --- Config ---
const LEAD_DAYS = parseInt(
  process.argv.find((a) => a.startsWith('--lead-days='))?.split('=')[1] ??
    '180',
);
const DRY_RUN = process.argv.includes('--dry-run');
const MAX_PER_RUN = parseInt(
  process.argv.find((a) => a.startsWith('--max='))?.split('=')[1] ?? '3',
);

async function alreadyExists(transitId: string): Promise<boolean> {
  const r =
    await sql`SELECT id FROM transit_blog_posts WHERE slug = ${transitId} LIMIT 1`;
  return r.rowCount > 0;
}

async function save(
  transit: YearlyTransit,
  content: Awaited<ReturnType<typeof generateTransitBlogPost>>,
  wordCount: number,
  status: 'published' | 'draft' = 'published',
) {
  const ctx = buildGenerationContext(transit);
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
      ${id}, ${transit.id}, ${transit.id},
      ${content.title}, ${content.subtitle}, ${content.metaDescription},
      ${`{${content.keywords.map((k: string) => `"${k.replace(/"/g, '\\"')}"`).join(',')}}`},
      ${content.introduction}, ${content.historicalDeepDive},
      ${content.astronomicalContext}, ${content.practicalGuidance},
      ${JSON.stringify(content.signBreakdowns)}, ${content.closingSection},
      ${ctx.planet}, ${ctx.sign}, ${ctx.transitType},
      ${ctx.startDate}, ${ctx.endDate}, ${ctx.rarity},
      ${status}, 'cron-local', ${process.env.TRANSIT_USE_OLLAMA === '1' ? process.env.OLLAMA_WRITER_MODEL || 'gemma3:27b' : 'claude-sonnet'}, ${wordCount},
      ${publishedAt}, ${now}, ${now}
    )
    ON CONFLICT (slug) DO NOTHING
  `;
}

async function main() {
  console.log(`Transit blog cron — ${new Date().toISOString()}`);
  console.log(
    `Lead window: ${LEAD_DAYS} days | Max per run: ${MAX_PER_RUN}${DRY_RUN ? ' | DRY RUN' : ''}\n`,
  );

  const candidates = await getTransitsNeedingBlogPosts();
  const windowEnd = new Date(Date.now() + LEAD_DAYS * 86400_000);

  const inWindow = candidates.filter(
    (t) => !t.startDate || t.startDate <= windowEnd,
  );

  console.log(
    `Candidates needing articles: ${candidates.length} total, ${inWindow.length} within ${LEAD_DAYS}-day window\n`,
  );

  if (inWindow.length === 0) {
    console.log('Nothing to generate — all upcoming transits are covered.');
    return;
  }

  let generated = 0;
  for (const transit of inWindow) {
    if (generated >= MAX_PER_RUN) break;

    const exists = await alreadyExists(transit.id);
    if (exists) continue;

    console.log(`Generating: ${transit.title} (${transit.id})`);

    if (DRY_RUN) {
      console.log('  [dry-run] skipping\n');
      generated++;
      continue;
    }

    try {
      const ctx = buildGenerationContext(transit);
      const content = await generateTransitBlogPost(ctx);
      const wordCount = countWords(content);
      const quality = await checkArticleQuality(content);
      await save(transit, content, wordCount, quality.status);
      const icon = quality.status === 'published' ? '✓' : '⚠ DRAFT';
      console.log(`  ${icon} ${content.title} — ${wordCount} words`);
      console.log(`  Quality: ${quality.summary}`);
      if (quality.status === 'published') {
        console.log(`  https://lunary.app/blog/transits/${transit.id}`);
      }
      console.log();
      generated++;
    } catch (e: any) {
      console.error(`  ✗ Failed: ${e?.message ?? e}\n`);
    }
  }

  console.log(
    `\nDone — generated ${generated} article${generated !== 1 ? 's' : ''}.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
