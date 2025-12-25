import {
  GRIMOIRE_SEARCH_INDEX,
  type GrimoireEntry,
} from '@/constants/seo/grimoire-search-index';

export type GrimoireSlugMatchType =
  | 'exact'
  | 'normalised'
  | 'keyword'
  | 'title'
  | 'alias'
  | 'related'
  | 'none';

export type GrimoireSlugSuggestion = {
  slug: string;
  title: string;
  score: number;
};

export type ResolveGrimoireSlugResult = {
  slug: string | null;
  matchType: GrimoireSlugMatchType;
  suggestions?: GrimoireSlugSuggestion[];
};

const slugIndex = new Map<string, GrimoireEntry>();
const normalisedSlugIndex = new Map<string, GrimoireEntry>();
GRIMOIRE_SEARCH_INDEX.forEach((entry) => {
  slugIndex.set(entry.slug, entry);
  normalisedSlugIndex.set(normaliseSeed(entry.slug), entry);
});

const ALIAS_MAP: Record<string, string> = {
  'moon-phases': 'moon/phases',
  'new-moon': 'moon/phases/new-moon',
  'full-moon': 'moon/phases/full-moon',
  'mercury-retrograde': 'events/2025/mercury-retrograde',
};

const planetSlugMap = new Map<string, GrimoireEntry>();
GRIMOIRE_SEARCH_INDEX.forEach((entry) => {
  if (entry.slug.startsWith('astronomy/planets/')) {
    const slugParts = entry.slug.split('/');
    const planetKey = slugParts[slugParts.length - 1];
    if (planetKey) {
      planetSlugMap.set(normaliseSeed(planetKey), entry);
    }
  }
});

export function normaliseSeed(seed: string): string {
  const [rawBase, ...rest] = seed.split('#');
  const base = rawBase
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/[\s-]+/g, '-')
    .replace(/^\/+|\/+$/g, '')
    .replace(/^-+|-+$/g, '');

  const anchor = rest.join('#').trim().toLowerCase();
  if (!anchor) return base;

  const anchorNormalised = anchor.replace(/[\s-]+/g, '-');
  return `${base}#${anchorNormalised}`;
}

export function getGrimoireEntryBySlug(
  slug: string,
): GrimoireEntry | undefined {
  return slugIndex.get(slug);
}

function scoreEntry(
  entry: GrimoireEntry,
  normalisedSeed: string,
  anchorBase?: string,
): number {
  let score = 0;
  const normalisedSlug = normaliseSeed(entry.slug);
  const normalisedTitle = normaliseSeed(entry.title);
  const normalisedKeywords = entry.keywords.map((keyword) =>
    normaliseSeed(keyword),
  );

  if (entry.slug === normalisedSeed) score += 100;
  if (normalisedSlug === normalisedSeed) score += 90;
  if (normalisedTitle === normalisedSeed) score += 80;
  if (normalisedSeed && normalisedTitle.includes(normalisedSeed)) score += 40;
  if (normalisedSeed && entry.slug.includes(normalisedSeed)) score += 10;

  normalisedKeywords.forEach((keyword) => {
    if (keyword === normalisedSeed) score += 35;
    else if (normalisedSeed && keyword.includes(normalisedSeed)) score += 20;
  });

  if (
    normalisedSeed &&
    entry.relatedSlugs.some(
      (related) => normaliseSeed(related) === normalisedSeed,
    )
  ) {
    score += 25;
  }

  if (anchorBase && entry.slug.startsWith(`${anchorBase}#`)) {
    score += 60;
  }

  return score;
}

function buildSuggestions(
  normalisedSeed: string,
  anchorBase?: string,
): GrimoireSlugSuggestion[] {
  if (!normalisedSeed) return [];

  const suggestions = GRIMOIRE_SEARCH_INDEX.map((entry) => {
    const score = scoreEntry(entry, normalisedSeed, anchorBase);
    return score > 0
      ? {
          slug: entry.slug,
          title: entry.title,
          score,
        }
      : null;
  })
    .filter((entry): entry is GrimoireSlugSuggestion => entry !== null)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.slug.localeCompare(b.slug);
    })
    .slice(0, 5);

  return suggestions;
}

function findBestKeywordMatch(normalisedSeed: string): GrimoireEntry | null {
  let bestEntry: GrimoireEntry | null = null;
  let bestScore = 0;

  GRIMOIRE_SEARCH_INDEX.forEach((entry) => {
    entry.keywords.forEach((keyword) => {
      const normalisedKeyword = normaliseSeed(keyword);
      const score =
        normalisedKeyword === normalisedSeed
          ? 30
          : normalisedKeyword.includes(normalisedSeed)
            ? 15
            : 0;

      if (score > 0 && score > bestScore) {
        bestEntry = entry;
        bestScore = score;
      }
    });
  });

  return bestEntry;
}

function titleMatchRank(entry: GrimoireEntry, exactMatch: boolean): number {
  const slug = entry.slug;
  if (slug.includes('/planets/') && !slug.includes('/retrogrades/')) return 0;
  if (!exactMatch && slug.startsWith('glossary#')) return 5;
  if (slug.includes('/retrogrades/')) return 4;
  if (slug.includes('#')) return 3;
  return exactMatch ? 1 : 2;
}

function findBestTitleMatch(normalisedSeed: string): GrimoireEntry | null {
  const exactMatches = GRIMOIRE_SEARCH_INDEX.filter(
    (entry) => normaliseSeed(entry.title) === normalisedSeed,
  );

  if (exactMatches.length > 0) {
    return exactMatches.sort((a, b) => {
      const rankDiff = titleMatchRank(a, true) - titleMatchRank(b, true);
      if (rankDiff !== 0) return rankDiff;
      return a.slug.localeCompare(b.slug);
    })[0]!;
  }

  const partialMatches = GRIMOIRE_SEARCH_INDEX.filter((entry) => {
    const normalisedTitle = normaliseSeed(entry.title);
    return (
      normalisedSeed &&
      normalisedTitle !== normalisedSeed &&
      normalisedTitle.includes(normalisedSeed)
    );
  });

  if (partialMatches.length === 0) {
    return null;
  }

  return partialMatches.sort((a, b) => {
    const rankDiff = titleMatchRank(a, false) - titleMatchRank(b, false);
    if (rankDiff !== 0) return rankDiff;
    return a.slug.localeCompare(b.slug);
  })[0]!;
}

function findBestRelatedMatch(normalisedSeed: string): GrimoireEntry | null {
  let bestEntry: GrimoireEntry | null = null;
  let bestScore = 0;

  GRIMOIRE_SEARCH_INDEX.forEach((entry) => {
    entry.relatedSlugs.forEach((related) => {
      if (normaliseSeed(related) === normalisedSeed) {
        const score = 20;
        if (score > bestScore) {
          bestEntry = entry;
          bestScore = score;
        }
      }
    });
  });

  return bestEntry;
}

export function resolveGrimoireSlug(seed: string): ResolveGrimoireSlugResult {
  const trimmed = seed.trim();
  if (!trimmed) {
    return { slug: null, matchType: 'none', suggestions: [] };
  }

  const normalisedSeed = normaliseSeed(trimmed);
  const anchorRequested = normalisedSeed.includes('#');
  const [anchorBase, anchorFragment] = normalisedSeed.split('#');

  if (anchorRequested) {
    const anchoredEntry =
      slugIndex.get(normalisedSeed) || normalisedSlugIndex.get(normalisedSeed);
    if (anchoredEntry) {
      return {
        slug: anchoredEntry.slug,
        matchType: 'exact',
        suggestions: buildSuggestions(normalisedSeed),
      };
    }
  }

  if (slugIndex.has(trimmed)) {
    return {
      slug: trimmed,
      matchType: 'exact',
      suggestions: buildSuggestions(normalisedSeed),
    };
  }

  const normalisedEntry = normalisedSlugIndex.get(normalisedSeed);
  if (normalisedEntry) {
    return {
      slug: normalisedEntry.slug,
      matchType: 'normalised',
      suggestions: buildSuggestions(normalisedSeed),
    };
  }

  if (anchorRequested && anchorBase) {
    const baseMatch = resolveGrimoireSlug(anchorBase);
    if (baseMatch.slug) {
      const anchoredSlug = `${baseMatch.slug}#${anchorFragment}`;
      if (slugIndex.has(anchoredSlug)) {
        return {
          slug: anchoredSlug,
          matchType: 'exact',
          suggestions: buildSuggestions(normalisedSeed, baseMatch.slug),
        };
      }

      return {
        slug: baseMatch.slug,
        matchType: baseMatch.matchType,
        suggestions: buildSuggestions(normalisedSeed, baseMatch.slug),
      };
    }
  }

  const aliasSlug = ALIAS_MAP[normalisedSeed];
  if (aliasSlug && slugIndex.has(aliasSlug)) {
    return {
      slug: aliasSlug,
      matchType: 'alias',
      suggestions: buildSuggestions(normalisedSeed),
    };
  }

  const planetSlugEntry = planetSlugMap.get(normalisedSeed);
  if (planetSlugEntry) {
    return {
      slug: planetSlugEntry.slug,
      matchType: 'keyword',
      suggestions: buildSuggestions(normalisedSeed),
    };
  }

  const titleEntry = findBestTitleMatch(normalisedSeed);
  if (titleEntry) {
    return {
      slug: titleEntry.slug,
      matchType: 'title',
      suggestions: buildSuggestions(normalisedSeed),
    };
  }

  const keywordEntry = findBestKeywordMatch(normalisedSeed);
  if (keywordEntry) {
    return {
      slug: keywordEntry.slug,
      matchType: 'keyword',
      suggestions: buildSuggestions(normalisedSeed),
    };
  }

  const relatedEntry = findBestRelatedMatch(normalisedSeed);
  if (relatedEntry) {
    return {
      slug: relatedEntry.slug,
      matchType: 'related',
      suggestions: buildSuggestions(normalisedSeed),
    };
  }

  return {
    slug: null,
    matchType: 'none',
    suggestions: buildSuggestions(normalisedSeed),
  };
}
