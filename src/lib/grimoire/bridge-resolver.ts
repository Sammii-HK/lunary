import {
  GRIMOIRE_SEARCH_INDEX,
  searchGrimoireIndex,
  type GrimoireEntry,
} from '@/constants/seo/grimoire-search-index';
import {
  ALIAS_MAP,
  BRIDGE_KEYS,
  BRIDGE_MAP,
  validateBridgeData,
} from '@/lib/grimoire/bridge-data';

export type GrimoireBridgeLink = {
  type: string;
  title: string;
  slug: string;
  url: string;
  summary: string;
  reason?: string;
};

export type ResolveGrimoireBridgeInput = {
  seed: string;
  types?: string[];
  limit?: number;
};

export type ResolveGrimoireBridgeResult = {
  seed: string;
  typesRequested: string[];
  resultCount: number;
  links: GrimoireBridgeLink[];
  ctaUrl: string;
  ctaText: string;
  source: string;
};

export type ResolveGrimoireBridgeMeta = {
  timingMs: number;
  sourceBreakdown: {
    curatedCount: number;
    aliasHit: boolean;
    searchCount: number;
  };
  topResults: Array<{
    type: string;
    slug: string;
    score?: number;
    reason?: string;
  }>;
};

const slugIndex = new Map(
  GRIMOIRE_SEARCH_INDEX.map((entry) => [entry.slug, entry]),
);

function normalizeSeed(seed: string): string {
  return seed
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
}

function normalizeTypes(types: string[]): string[] {
  return types.map((type) => (type === 'crystals' ? 'crystal' : type));
}

function addAliasVariants(
  map: Record<string, string>,
  base: string,
  slug: string,
) {
  const normalizedBase = normalizeSeed(base);
  const noHyphen = normalizedBase.replace(/-/g, '');
  const withHyphen = normalizedBase.replace(/\s+/g, '-');
  const withSpace = normalizedBase.replace(/-/g, ' ');

  map[normalizedBase] = slug;
  map[noHyphen] = slug;
  map[withHyphen] = slug;
  map[withSpace] = slug;
}

const ALIAS_VARIANTS = (() => {
  const map: Record<string, string> = {};
  addAliasVariants(map, 'rose quartz', 'crystals/rose-quartz');
  addAliasVariants(map, 'high priestess', 'tarot/the-high-priestess');
  addAliasVariants(map, 'wheel of fortune', 'tarot/wheel-of-fortune');
  addAliasVariants(map, 'north node', 'glossary#north-node');
  addAliasVariants(map, 'south node', 'glossary#south-node');
  return map;
})();

function resolveBridgeKey(seed: string): string | null {
  const words = seed.split(' ').filter(Boolean);
  const match = BRIDGE_KEYS.find(
    (key) =>
      words.includes(key) ||
      seed.startsWith(`${key} `) ||
      seed.endsWith(` ${key}`),
  );
  return match || null;
}

function inferType(
  entry: GrimoireEntry | undefined,
  slug: string,
): string | null {
  if (entry?.category) return entry.category.toLowerCase();
  if (slug.startsWith('tarot/')) return 'tarot';
  if (slug.startsWith('crystals/')) return 'crystal';
  if (slug.startsWith('zodiac/')) return 'zodiac';
  if (slug.startsWith('astronomy/planets/')) return 'planet';
  if (slug.startsWith('glossary')) return 'glossary';
  return null;
}

function scoreEntry(params: {
  entry: GrimoireEntry;
  seed: string;
  isCurated: boolean;
  typesRequested: string[];
}) {
  const { entry, seed, isCurated, typesRequested } = params;
  const reasons: string[] = [];
  let score = 0;

  if (isCurated) {
    score += 100;
    reasons.push('curated bridge');
  }

  const titleLower = entry.title.toLowerCase();
  const summaryLower = entry.summary.toLowerCase();
  if (titleLower === seed) {
    score += 50;
    reasons.push('exact title match');
  }
  if (seed && titleLower.includes(seed)) {
    score += 20;
    reasons.push('seed in title');
  }
  if (seed && summaryLower.includes(seed)) {
    score += 10;
    reasons.push('seed in summary');
  }

  const inferredType = inferType(entry, entry.slug);
  if (
    typesRequested.length > 0 &&
    inferredType &&
    typesRequested.includes(inferredType)
  ) {
    score += 25;
    reasons.push('type match');
  }

  return { score, reason: reasons.join(', ') };
}

export function resolveGrimoireBridgeWithMeta({
  seed,
  types,
  limit,
}: ResolveGrimoireBridgeInput): {
  result: ResolveGrimoireBridgeResult;
  meta: ResolveGrimoireBridgeMeta;
} {
  const start = Date.now();
  const normalizedSeed = normalizeSeed(seed);
  const typesRequested = normalizeTypes(
    (types || []).map((type) => type.trim().toLowerCase()).filter(Boolean),
  );
  const clampedLimit =
    typeof limit === 'number' ? Math.min(10, Math.max(1, limit)) : 5;

  if (process.env.NODE_ENV !== 'production') {
    const { missingSlugs, missingAliases } = validateBridgeData(slugIndex);
    if (missingSlugs.length || missingAliases.length) {
      throw new Error(
        `Grimoire bridge data missing entries. Slugs: ${missingSlugs.join(
          ', ',
        )} | Aliases: ${missingAliases.join(', ')}`,
      );
    }
  }

  const curatedSlugs = new Set<string>();
  const aliasSlug = ALIAS_VARIANTS[normalizedSeed] || ALIAS_MAP[normalizedSeed];
  let aliasHit = false;
  if (aliasSlug) {
    curatedSlugs.add(aliasSlug);
    aliasHit = slugIndex.has(aliasSlug);
  }
  const bridgeKey = resolveBridgeKey(normalizedSeed);
  if (bridgeKey) {
    BRIDGE_MAP[bridgeKey]?.forEach((slug) => curatedSlugs.add(slug));
  }

  const candidates = new Map<
    string,
    { entry: GrimoireEntry; score: number; reason: string }
  >();
  let curatedCount = 0;

  const considerEntry = (entry: GrimoireEntry, isCurated: boolean) => {
    const inferredType = inferType(entry, entry.slug);
    if (
      typesRequested.length > 0 &&
      (!inferredType || !typesRequested.includes(inferredType))
    ) {
      return;
    }

    const { score, reason } = scoreEntry({
      entry,
      seed: normalizedSeed,
      isCurated,
      typesRequested,
    });

    const existing = candidates.get(entry.slug);
    if (!existing || score > existing.score) {
      candidates.set(entry.slug, { entry, score, reason });
    }
  };

  curatedSlugs.forEach((slug) => {
    const entry = slugIndex.get(slug);
    if (!entry) return;
    curatedCount += 1;
    considerEntry(entry, true);
  });

  const searchLimit = Math.max(clampedLimit * 5, 15);
  const searchResults = searchGrimoireIndex(normalizedSeed, searchLimit);
  searchResults.forEach((entry) => considerEntry(entry, false));

  const sorted = Array.from(candidates.values()).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.entry.slug.localeCompare(b.entry.slug);
  });

  const links = sorted.slice(0, clampedLimit).map(({ entry, reason }) => ({
    type:
      inferType(entry, entry.slug) ??
      (entry.category ? String(entry.category).toLowerCase() : 'unknown'),
    title: entry.title,
    slug: entry.slug,
    url: `https://lunary.app/grimoire/${entry.slug}`,
    summary: entry.summary,
    reason: reason || undefined,
  }));

  const topResults = sorted.slice(0, 3).map(({ entry, score, reason }) => ({
    type:
      inferType(entry, entry.slug) ??
      (entry.category ? String(entry.category).toLowerCase() : 'unknown'),
    slug: entry.slug,
    score,
    reason: reason || undefined,
  }));

  const timingMs = Date.now() - start;

  return {
    result: {
      seed: normalizedSeed,
      typesRequested,
      resultCount: links.length,
      links,
      ctaUrl: 'https://lunary.app/grimoire/search?from=gpt_grimoire_bridge',
      ctaText: 'Explore the complete Lunary Grimoire',
      source: 'Lunary.app - Digital Grimoire with 500+ pages',
    },
    meta: {
      timingMs,
      sourceBreakdown: {
        curatedCount,
        aliasHit,
        searchCount: searchResults.length,
      },
      topResults,
    },
  };
}

export function resolveGrimoireBridge(
  input: ResolveGrimoireBridgeInput,
): ResolveGrimoireBridgeResult {
  return resolveGrimoireBridgeWithMeta(input).result;
}
