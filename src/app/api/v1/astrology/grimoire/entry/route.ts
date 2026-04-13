import { NextRequest } from 'next/server';
import { v1Handler, apiResponse, apiError } from '@/lib/api/v1-handler';
import grimoireData from '@/data/grimoire-search-index.json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface GrimoireEntry {
  slug: string;
  title: string;
  category: string;
  keywords: string[];
  summary: string;
  relatedSlugs?: string[];
}

const entries = grimoireData as GrimoireEntry[];
const bySlug = new Map(entries.map((e) => [e.slug, e]));

export const GET = v1Handler('free', async (request: NextRequest) => {
  const slug = new URL(request.url).searchParams.get('slug');

  if (!slug) {
    return apiError('Required: slug (e.g. astronomy/planets/mercury)');
  }

  const entry = bySlug.get(slug);
  if (!entry) {
    return apiError('Entry not found', 404);
  }

  const related = (entry.relatedSlugs || [])
    .map((s) => bySlug.get(s))
    .filter(Boolean)
    .map((r: any) => ({
      slug: r.slug,
      title: r.title,
      category: r.category,
    }));

  // Expose metadata + brief excerpt only — full content lives on lunary.app
  const excerpt =
    entry.summary.length > 120
      ? entry.summary.slice(0, 120).replace(/\s\S*$/, '') + '...'
      : entry.summary;

  return apiResponse({
    slug: entry.slug,
    title: entry.title,
    category: entry.category,
    keywords: entry.keywords,
    excerpt,
    url: `https://lunary.app/grimoire/${entry.slug}`,
    related,
  });
});
