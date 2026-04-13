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
}

const entries = grimoireData as GrimoireEntry[];

export const GET = v1Handler('free', async (request: NextRequest) => {
  const params = new URL(request.url).searchParams;
  const query = params.get('q')?.toLowerCase();
  const limit = Math.min(Number(params.get('limit')) || 10, 50);
  const category = params.get('category')?.toLowerCase();

  if (!query && !category) {
    return apiError(
      'Required: q (search query) or category. Optional: limit (default 10, max 50)',
    );
  }

  let results = entries;

  if (category) {
    results = results.filter((e) => e.category.toLowerCase() === category);
  }

  if (query) {
    results = results
      .map((entry) => {
        const titleMatch = entry.title.toLowerCase().includes(query) ? 3 : 0;
        const keywordMatch = entry.keywords.some((k) =>
          k.toLowerCase().includes(query),
        )
          ? 2
          : 0;
        const summaryMatch = entry.summary.toLowerCase().includes(query)
          ? 1
          : 0;
        const score = titleMatch + keywordMatch + summaryMatch;
        return { ...entry, score };
      })
      .filter((e) => e.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  return apiResponse({
    query: query || null,
    category: category || null,
    total: results.length,
    results: results.slice(0, limit).map((e) => ({
      slug: e.slug,
      title: e.title,
      category: e.category,
      excerpt:
        e.summary.length > 120
          ? e.summary.slice(0, 120).replace(/\s\S*$/, '') + '...'
          : e.summary,
      url: `https://lunary.app/grimoire/${e.slug}`,
    })),
  });
});
