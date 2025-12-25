import { NextRequest, NextResponse } from 'next/server';
import { searchGrimoireIndex } from '@/constants/seo/grimoire-search-index';
import { requireGptAuthJson } from '@/lib/gptAuth';
import { resolveGrimoireSlug } from '@/lib/grimoire/slug';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SearchPayload = {
  q?: string;
  seed?: string;
  slug?: string;
};

async function getSearchPayload(request: NextRequest): Promise<SearchPayload> {
  if (request.method !== 'POST') return {};

  try {
    const body = (await request.json()) as SearchPayload;
    return body ?? {};
  } catch {
    return {};
  }
}

export async function GET(request: NextRequest) {
  const unauthorized = requireGptAuthJson(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const payload = await getSearchPayload(request);
    const rawQuery =
      searchParams.get('q') ??
      searchParams.get('seed') ??
      searchParams.get('slug') ??
      payload.q ??
      payload.seed ??
      payload.slug ??
      '';
    const query = rawQuery.trim();
    const resolution = resolveGrimoireSlug(query);

    if (!query || query.length < 2) {
      return NextResponse.json({
        ok: true,
        matchType: 'none',
        resultCount: 0,
        suggestions: [],
        results: [],
        ctaUrl: 'https://lunary.app/grimoire/search?from=gpt_grimoire_search',
        ctaText: 'Explore the complete Lunary Grimoire',
        source: 'Lunary.app - Digital Grimoire with 500+ pages',
      });
    }

    const results = searchGrimoireIndex(query, 5);

    const response = {
      ok: true,
      query,
      matchType: resolution.matchType,
      resultCount: results.length,
      suggestions: resolution.suggestions ?? [],
      results: results.map((entry) => ({
        slug: entry.slug,
        title: entry.title,
        summary: entry.summary,
        url: `https://lunary.app/grimoire/${entry.slug}`,
        category: entry.category,
      })),
      ctaUrl: 'https://lunary.app/grimoire/search?from=gpt_grimoire_search',
      ctaText: 'Explore the complete Lunary Grimoire',
      source: 'Lunary.app - Digital Grimoire with 500+ pages',
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control':
          'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('GPT grimoire/search error:', error);
    return NextResponse.json({
      ok: false,
      error: 'internal_error',
      message: 'Failed to search grimoire.',
    });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
