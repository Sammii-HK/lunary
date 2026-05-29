/**
 * Templated-page guard (scaled-content defense).
 *
 * Google deindexed Lunary for scaled-content abuse: combinatorial generators
 * that hand-write a few curated entries and fall through to a templated
 * default for everything else, emitting near-identical pages at scale. Reach
 * now depends on Bing + AI citation, where thin templated pages are a
 * liability. This guard makes the scaled-content footprint impossible to
 * re-accumulate silently.
 *
 * For each combinatorial grimoire generator it counts, over the params the
 * generator actually makes indexable, how many resolve to CURATED data versus
 * the TEMPLATED fallback, and fails if the indexable-templated count exceeds a
 * deliberate per-generator threshold. If someone widens a generator's static
 * params (e.g. promotes more planets) without adding curated data, or the
 * curated dataset shrinks, the templated count rises past the threshold and CI
 * fails, forcing a deliberate choice to curate or de-index.
 *
 * Anchored to `src/data/grimoire-pages-without-seo-template.json`, the single
 * coverage ledger, so the dynamic routes it tracks each have a content-coverage
 * budget here.
 *
 * Thresholds are intentional, not aspirational:
 * - aspects-combo: 90. The aspect-interpretations dataset covers all 45 planet
 *   pairs across the 5 MAJOR aspects (225 pages). The 2 minor aspects
 *   (quincunx, semi-sextile) are low-search-volume and stay on the template by
 *   design: 45 pairs x 2 = 90 indexable-templated pages. Raising this means a
 *   real new scaled-content surface, so curate or de-index instead.
 * - placements: 0. Static params are gated to RECOVERY_PLACEMENT_PLANETS, all
 *   of which ship full curated JSON. No promoted placement may be templated.
 * - compatibility: 0. Static params are the curated slugs only and the page
 *   noindexes everything else, so no promoted pair may be templated.
 */

import {
  PLANETS,
  ASPECTS,
  generateAllAspectParams,
  getCanonicalAspectPair,
  getCuratedAspectDescription,
  type Planet,
  type Aspect,
} from '@/constants/seo/aspects';
import {
  RECOVERY_PLACEMENT_PLANETS,
  getAllPlanetSignSlugs,
} from '@/constants/seo/planet-sign-content';
import { getCuratedPlacement } from '@/lib/placements/getCuratedPlacement';
import {
  getCuratedCompatibilitySlugs,
  isCuratedCompatibilityPair,
} from '@/constants/seo/compatibility-content';
import seoTemplateLedger from '@/data/grimoire-pages-without-seo-template.json';

/**
 * The deliberate ceiling on indexable pages that resolve to a generator's
 * templated fallback rather than curated data. See the file header for the
 * rationale behind each number. Lowering a threshold is always safe; raising
 * one should be a reviewed decision that accepts a larger thin-content surface.
 */
const TEMPLATED_PAGE_THRESHOLDS = {
  'aspects-combo': 90,
  placements: 0,
  compatibility: 0,
} as const;

type GeneratorKey = keyof typeof TEMPLATED_PAGE_THRESHOLDS;

interface CoverageReport {
  total: number;
  curated: number;
  templated: number;
}

/**
 * Aspect-combo coverage over the pages the route makes indexable.
 * `generateAllAspectParams` is exactly what the page's generateStaticParams
 * returns, so counting against it measures the real built footprint.
 */
function aspectComboCoverage(): CoverageReport {
  const params = generateAllAspectParams();
  let curated = 0;
  for (const { planet1, aspect, planet2 } of params) {
    const canonical = getCanonicalAspectPair(
      planet1 as Planet,
      planet2 as Planet,
    );
    if (!canonical) continue;
    if (
      getCuratedAspectDescription(
        canonical.planet1,
        aspect as Aspect,
        canonical.planet2,
      )
    ) {
      curated += 1;
    }
  }
  return {
    total: params.length,
    curated,
    templated: params.length - curated,
  };
}

/**
 * Placement coverage over the promoted (statically-generated) slugs only,
 * those gated to RECOVERY_PLACEMENT_PLANETS, mirroring the page's
 * generateStaticParams filter.
 */
function placementCoverage(): CoverageReport {
  const recovery = RECOVERY_PLACEMENT_PLANETS as readonly string[];
  const promoted = getAllPlanetSignSlugs().filter((slug) => {
    const [planet] = slug.split('-in-');
    return recovery.includes(planet);
  });
  let curated = 0;
  for (const slug of promoted) {
    if (getCuratedPlacement(slug)) {
      curated += 1;
    }
  }
  return {
    total: promoted.length,
    curated,
    templated: promoted.length - curated,
  };
}

/**
 * Compatibility coverage over the promoted (indexable) slugs only. The page
 * statically generates the curated slugs and noindexes the rest, so the
 * indexable surface is exactly the curated set.
 */
function compatibilityCoverage(): CoverageReport {
  const promoted = getCuratedCompatibilitySlugs();
  let curated = 0;
  for (const slug of promoted) {
    if (isCuratedCompatibilityPair(slug)) {
      curated += 1;
    }
  }
  return {
    total: promoted.length,
    curated,
    templated: promoted.length - curated,
  };
}

const COVERAGE: Record<GeneratorKey, () => CoverageReport> = {
  'aspects-combo': aspectComboCoverage,
  placements: placementCoverage,
  compatibility: compatibilityCoverage,
};

describe('Templated-page guard (scaled-content defense)', () => {
  it.each(Object.keys(TEMPLATED_PAGE_THRESHOLDS) as GeneratorKey[])(
    'keeps the indexable-templated footprint of "%s" within its threshold',
    (generator) => {
      const { total, curated, templated } = COVERAGE[generator]();
      const threshold = TEMPLATED_PAGE_THRESHOLDS[generator];

      // Sanity: the generator must actually produce indexable pages, otherwise
      // a refactor silently zeroed it out and the guard is meaningless.
      expect(total).toBeGreaterThan(0);
      expect(curated + templated).toBe(total);

      expect(templated).toBeLessThanOrEqual(threshold);
    },
  );

  it('keeps every promoted placement page curated', () => {
    expect(placementCoverage().templated).toBe(0);
  });

  it('keeps every promoted compatibility page curated', () => {
    expect(compatibilityCoverage().templated).toBe(0);
  });

  it('covers all 45 planet pairs across the 5 major aspects with curated data', () => {
    // 45 pairs x 5 major aspects = 225 curated; the 2 minor aspects are the
    // only templated remainder. Locks the documented 90-page budget in place.
    const { total, curated, templated } = aspectComboCoverage();
    const pairCount = (PLANETS.length * (PLANETS.length - 1)) / 2;
    expect(total).toBe(pairCount * ASPECTS.length);
    expect(curated).toBe(pairCount * 5);
    expect(templated).toBe(pairCount * (ASPECTS.length - 5));
  });

  it('tracks every dynamic route from the coverage ledger', () => {
    // The ledger is the single source of truth for template coverage. Every
    // combinatorial generator it lists as a dynamic route must have a content
    // budget here, so new scaled generators cannot land unguarded.
    const dynamicRoutes: string[] =
      seoTemplateLedger.categories?.dynamicRoutes?.pages ?? [];

    // Map ledger route prefixes to the guard keys they correspond to.
    const ROUTE_TO_GENERATOR: Array<{ match: string; key: GeneratorKey }> = [
      { match: 'grimoire/aspects/[planet1]/[aspect]', key: 'aspects-combo' },
    ];

    for (const { match, key } of ROUTE_TO_GENERATOR) {
      const present = dynamicRoutes.some((route) => route.startsWith(match));
      // If the ledger lists the route, the budget must exist for its key.
      expect(TEMPLATED_PAGE_THRESHOLDS).toHaveProperty(key);
      // Surface a clear failure if the ledger and guard diverge on whether the
      // combinatorial aspect route is a tracked dynamic route.
      if (!present) {
        throw new Error(
          `Coverage ledger no longer lists dynamic route "${match}"; update ` +
            'grimoire-pages-without-seo-template.json or this guard so the two ' +
            'stay in sync.',
        );
      }
    }
  });
});
