import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface GrimoireEntry {
  slug: string;
  title: string;
  summary: string;
  url: string;
  category: string;
}

const GRIMOIRE_INDEX: GrimoireEntry[] = [
  {
    slug: 'astronomy/planets/mercury',
    title: 'Mercury in Astrology: Meaning & Influence',
    summary:
      'Mercury rules communication, thought, and perception. Learn about Mercury retrograde, planetary hours, and how to work with Mercury energy.',
    url: 'https://lunary.app/grimoire/astronomy/planets/mercury',
    category: 'Planets',
  },
  {
    slug: 'astronomy/planets/venus',
    title: 'Venus in Astrology: Love & Beauty',
    summary:
      'Venus governs love, beauty, relationships, and values. Discover Venus correspondences and how to harness Venusian energy.',
    url: 'https://lunary.app/grimoire/astronomy/planets/venus',
    category: 'Planets',
  },
  {
    slug: 'astronomy/planets/mars',
    title: 'Mars in Astrology: Action & Drive',
    summary:
      'Mars represents action, desire, passion, and courage. Learn how Mars energy influences your drive and motivation.',
    url: 'https://lunary.app/grimoire/astronomy/planets/mars',
    category: 'Planets',
  },
  {
    slug: 'astronomy/planets/jupiter',
    title: 'Jupiter in Astrology: Expansion & Luck',
    summary:
      'Jupiter brings expansion, optimism, and good fortune. Discover how to work with Jupiter for abundance and growth.',
    url: 'https://lunary.app/grimoire/astronomy/planets/jupiter',
    category: 'Planets',
  },
  {
    slug: 'astronomy/planets/saturn',
    title: 'Saturn in Astrology: Discipline & Structure',
    summary:
      'Saturn represents discipline, responsibility, and karmic lessons. Learn about Saturn return and working with Saturnian energy.',
    url: 'https://lunary.app/grimoire/astronomy/planets/saturn',
    category: 'Planets',
  },
  {
    slug: 'retrogrades/mercury',
    title: 'Mercury Retrograde: Survival Guide',
    summary:
      'Everything you need to know about Mercury retrograde periods. Tips for communication, technology, and travel during these times.',
    url: 'https://lunary.app/grimoire/retrogrades/mercury',
    category: 'Retrogrades',
  },
  {
    slug: 'moon-rituals',
    title: 'Moon Rituals by Phase',
    summary:
      'Complete guide to moon rituals for each lunar phase. New Moon manifestation, Full Moon release, and everything in between.',
    url: 'https://lunary.app/grimoire/moon-rituals',
    category: 'Rituals',
  },
  {
    slug: 'birth-chart',
    title: 'Birth Chart: Complete Guide',
    summary:
      'Learn how to read and interpret your natal chart. Understand planets, houses, aspects, and what they reveal about you.',
    url: 'https://lunary.app/grimoire/birth-chart',
    category: 'Birth Chart',
  },
  {
    slug: 'rising-sign',
    title: 'Rising Sign (Ascendant) Explained',
    summary:
      'Your Rising sign shapes first impressions and outer personality. Learn how to find your Rising sign and what it means.',
    url: 'https://lunary.app/grimoire/rising-sign',
    category: 'Birth Chart',
  },
  {
    slug: 'tarot',
    title: 'Tarot Guide: All 78 Cards',
    summary:
      'Complete guide to Major and Minor Arcana. Card meanings, spreads, and how to interpret tarot readings.',
    url: 'https://lunary.app/grimoire/tarot',
    category: 'Tarot',
  },
  {
    slug: 'crystals',
    title: 'Crystals: Complete Guide',
    summary:
      'Comprehensive crystal guide with meanings, properties, and how to work with crystals for healing and magic.',
    url: 'https://lunary.app/grimoire/crystals',
    category: 'Crystals',
  },
  {
    slug: 'zodiac/aries',
    title: 'Aries Zodiac Sign',
    summary:
      'Everything about Aries: dates, traits, compatibility, and how this fire sign influences your chart.',
    url: 'https://lunary.app/grimoire/zodiac/aries',
    category: 'Zodiac',
  },
  {
    slug: 'zodiac/taurus',
    title: 'Taurus Zodiac Sign',
    summary:
      'Everything about Taurus: dates, traits, compatibility, and how this earth sign grounds your energy.',
    url: 'https://lunary.app/grimoire/zodiac/taurus',
    category: 'Zodiac',
  },
  {
    slug: 'moon/phases',
    title: 'Moon Phases Guide',
    summary:
      'Understanding the 8 moon phases and their energy. How each phase affects magic, emotions, and daily life.',
    url: 'https://lunary.app/grimoire/moon',
    category: 'Moon',
  },
  {
    slug: 'chakras',
    title: 'Chakras: Complete Guide',
    summary:
      'Learn about the 7 chakras, their meanings, and how to balance them for spiritual and emotional wellbeing.',
    url: 'https://lunary.app/grimoire/chakras',
    category: 'Chakras',
  },
];

function searchGrimoire(query: string): GrimoireEntry[] {
  const normalizedQuery = query.toLowerCase();
  const queryTerms = normalizedQuery
    .split(/\s+/)
    .filter((term) => term.length > 2);

  const scored = GRIMOIRE_INDEX.map((entry) => {
    let score = 0;
    const titleLower = entry.title.toLowerCase();
    const summaryLower = entry.summary.toLowerCase();
    const categoryLower = entry.category.toLowerCase();

    if (titleLower.includes(normalizedQuery)) score += 10;
    if (summaryLower.includes(normalizedQuery)) score += 5;
    if (categoryLower.includes(normalizedQuery)) score += 3;

    for (const term of queryTerms) {
      if (titleLower.includes(term)) score += 3;
      if (summaryLower.includes(term)) score += 1;
      if (entry.slug.includes(term)) score += 2;
    }

    return { entry, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => item.entry);
}

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

    const results = searchGrimoire(query);

    const response = {
      query,
      resultCount: results.length,
      results: results.map((entry) => ({
        slug: entry.slug,
        title: entry.title,
        summary: entry.summary,
        url: entry.url,
        category: entry.category,
      })),
      ctaUrl: 'https://lunary.app/grimoire?from=gpt_grimoire_search',
      ctaText: 'Explore the complete Lunary Grimoire',
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
