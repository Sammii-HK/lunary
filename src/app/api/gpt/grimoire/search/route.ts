import { NextRequest, NextResponse } from 'next/server';
import { searchGrimoireIndex } from '@/constants/seo/grimoire-search-index';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required (min 2 characters)' },
        { status: 400 },
      );
    }

    const results = searchGrimoireIndex(query, 5);

    const response = {
      query,
      resultCount: results.length,
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
    return NextResponse.json(
      { error: 'Failed to search grimoire' },
      { status: 500 },
    );
  }
}
