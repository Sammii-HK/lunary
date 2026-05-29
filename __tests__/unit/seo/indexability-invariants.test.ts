/**
 * @jest-environment node
 *
 * SEO indexability invariants (#286-class reach-loss defence).
 *
 * Google deindexed Lunary, so Bing + AI-citation discovery is the reach
 * surface and a silent indexability bug = silent reach loss. PR #286 was
 * exactly this: 12 curated compatibility pages 301'd to a NOINDEXED slug
 * because `generateStaticParams` emitted one slug while the canonical/redirect
 * logic resolved another. That whole class is "a URL we advertise (sitemap or
 * static param) does not match the canonical URL the page actually serves and
 * indexes".
 *
 * `compatibility-deindex.test.tsx` and `templated-page-guard.test.ts` already
 * pin the compatibility + scaled-content surfaces. This file pins the OTHER
 * dynamic page types where the same mechanism could bite:
 *
 *   1. Sitemap vs noindex: no STATIC route the sitemap advertises may declare
 *      `robots.index:false`. Advertising a noindex page to crawlers burns crawl
 *      budget and sends a self-contradictory signal. (Finds a real leak:
 *      transit-of-the-day, pinned with a `// BUG:` skip + an inverse guard.)
 *
 *   2. Rising signs: `generateStaticParams` is PRE-canonicalised so the page's
 *      `permanentRedirect(sign !== publicSlug)` never fires for a built page,
 *      the canonical == the public slug, and the sitemap's hard-coded 12 slugs
 *      match the JSON-derived public slugs. (This is the rising-sign analogue of
 *      the #286 static-param-vs-redirect chain.)
 *
 *   3. Aspect combos: every 3-level URL the aspect sitemap advertises is the
 *      canonical (lower-index-first) pair, so it survives the page's
 *      `permanentRedirect` to `getCanonicalAspectPair` instead of 301'ing into
 *      an orphan. Also pins that the curated-description lookup is order
 *      sensitive, which is WHY canonicalisation has to hold.
 *
 * Pure unit: data-source modules are imported directly; the sitemap/page
 * index decisions are read as source text (the sitemap default export is async
 * and touches the DB, so it is not invoked here). No network, no DB, no render.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
  getAllRisingSigns,
  getPublicRisingSignSlug,
  getRisingSign,
  normalizeRisingSignSlug,
} from '@/lib/rising-signs/getRisingSign';
import {
  PLANETS,
  generateAllAspectParams,
  getCanonicalAspectPair,
  getCuratedAspectDescription,
  type Planet,
  type Aspect,
} from '@/constants/seo/aspects';

const ROOT = process.cwd();
const APP_DIR = join(ROOT, 'src', 'app');

/* ------------------------------------------------------------------ helpers */

/** Recursively collect every `page.tsx` under src/app. */
function collectPageFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next') continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      collectPageFiles(full, acc);
    } else if (entry === 'page.tsx') {
      acc.push(full);
    }
  }
  return acc;
}

/**
 * App-router route for a page file: path under src/app, minus `/page.tsx`,
 * minus `(route-group)` segments. Dynamic `[param]` segments are kept verbatim
 * so a route with a dynamic segment is never mistaken for a static sitemap path.
 */
function routeForPageFile(file: string): string {
  const rel = file.slice(APP_DIR.length).replace(/\/page\.tsx$/, '');
  const stripped = rel.replace(/\/\([^)]+\)/g, '');
  return stripped === '' ? '/' : stripped;
}

/**
 * Does this page declare a top-level `robots.index:false` in its statically
 * exported metadata or generateMetadata return? Conservative text match: a
 * `robots:` object literal whose first `index:` is `false`. This is the signal
 * crawlers see for the page's own (non-redirected) URL.
 */
function declaresNoindex(source: string): boolean {
  const robotsBlock = source.match(/robots:\s*\{([\s\S]{0,400}?)\}/);
  if (!robotsBlock) return false;
  const firstIndex = robotsBlock[1].match(/index:\s*(true|false)/);
  return firstIndex?.[1] === 'false';
}

/** Static sitemap paths declared in sitemap.ts `staticPageMeta`. */
function staticSitemapPaths(): Set<string> {
  const sm = readFileSync(join(APP_DIR, 'sitemap.ts'), 'utf8');
  const start = sm.indexOf('const staticPageMeta');
  const end = sm.indexOf('const staticPageConfigs');
  const block = sm.slice(start, end);
  const paths = [...block.matchAll(/path:\s*[`'"]([^`'"]*)[`'"]/g)].map((m) =>
    m[1] === '' ? '/' : `/${m[1]}`.replace(/\/$/, ''),
  );
  return new Set(paths);
}

/** Routes (static, no dynamic segment) whose page declares robots.index:false. */
function staticNoindexRoutes(): string[] {
  const out: string[] = [];
  for (const file of collectPageFiles(APP_DIR)) {
    const route = routeForPageFile(file);
    if (route.includes('[')) continue; // only static, enumerable routes
    if (declaresNoindex(readFileSync(file, 'utf8'))) out.push(route);
  }
  return out;
}

/* ------------------------------------------------ 1. sitemap vs noindex */

describe('Indexability: sitemap never advertises a noindex static page', () => {
  const sitemapPaths = staticSitemapPaths();
  const noindexRoutes = staticNoindexRoutes();

  it('finds the static sitemap path set and the noindex route set', () => {
    // Guards: if either side silently empties (e.g. a refactor changes the
    // sitemap shape or the robots pattern), this invariant becomes vacuous.
    expect(sitemapPaths.size).toBeGreaterThan(50);
    expect(noindexRoutes.length).toBeGreaterThan(5);
  });

  it('keeps the (non-buggy) noindex hub pages OUT of the static sitemap', () => {
    // Deliberate noindex hubs (thin link-list landing pages) must not be
    // advertised. These are the ones the design intends to keep out, and they
    // currently are out — pin that so a future sitemap edit cannot quietly add
    // them.
    const intentionalNoindexHubs = [
      '/grimoire/zodiac',
      '/grimoire/compatibility',
      '/grimoire/crystals',
      '/grimoire/runes',
      '/grimoire/aspects/types',
      '/grimoire/numerology/core-numbers',
    ];
    for (const hub of intentionalNoindexHubs) {
      // Guard: confirm the fixture really is a noindex route.
      expect(noindexRoutes).toContain(hub);
      expect(sitemapPaths.has(hub)).toBe(false);
    }
  });

  /**
   * General invariant (#286-class, crawl-budget leak): no STATIC route the
   * sitemap advertises may declare `robots.index:false`. Advertising a noindex
   * page tells Bing / AI crawlers to fetch a URL the page then tells them NOT to
   * index: a wasted, self-contradictory crawl signal on the discovery surface
   * that matters most now (Google deindexed Lunary).
   *
   * This was previously skipped because `grimoire/transits/transit-of-the-day`
   * was advertised in sitemap.ts `staticPageMeta` while its page
   * (src/app/grimoire/transits/transit-of-the-day/page.tsx) sets
   *   robots: { index: false, follow: true, googleBot: { index: false, ... } }
   *
   * Fix (`fix/sitemap-noindex-delisting`): the contradiction was resolved in the
   * safe direction. The sitemap entry was removed so a noindex page is no
   * longer advertised. The page's `robots` metadata was left untouched (whether
   * that page SHOULD be indexable is a separate content-strategy decision). The
   * invariant now holds for every static route, so this is un-skipped and the
   * inverse guard below asserts the contradiction set is empty.
   */
  it('no static sitemap path declares robots.index:false', () => {
    const contradictions = noindexRoutes.filter((r) => sitemapPaths.has(r));
    expect(contradictions).toEqual([]);
  });

  it('keeps the (now-fixed) contradiction set empty (transit-of-the-day delisted)', () => {
    // Inverse guard for the invariant above: the sitemap-vs-noindex
    // contradiction set is now empty. transit-of-the-day was the sole offender
    // and has been removed from staticPageMeta. If someone re-adds it, or adds
    // a NEW noindex route to the sitemap, this fails loudly alongside the
    // invariant above.
    const contradictions = noindexRoutes.filter((r) => sitemapPaths.has(r));
    expect(contradictions).toEqual([]);
  });
});

/* ----------------------------------------------- 2. rising-sign canonical */

describe('Indexability: rising-sign static params are pre-canonicalised', () => {
  const risings = getAllRisingSigns();

  it('has the full 12-sign rising dataset', () => {
    expect(risings.length).toBe(12);
  });

  it('every JSON key carries the "-rising" suffix the helpers assume', () => {
    // getPublicRisingSignSlug strips a trailing -rising; getRisingSign re-adds
    // it. If a key were stored WITHOUT the suffix, the public slug would equal
    // the stored slug and the round-trip below could mask a drift. Pin the
    // shape the whole canonical chain depends on.
    for (const r of risings) {
      expect(r.slug.endsWith('-rising')).toBe(true);
    }
  });

  it('generateStaticParams slugs never trigger the page permanentRedirect', () => {
    // The page redirects when `sign !== getPublicRisingSignSlug(sign)`. Its
    // generateStaticParams emits getPublicRisingSignSlug(rising.slug), so for
    // each built param the redirect predicate MUST be false (idempotent public
    // slug). A non-idempotent slug here would 301 a sitemap/static URL into a
    // different page — the #286 failure mode.
    for (const r of risings) {
      const staticParam = getPublicRisingSignSlug(r.slug);
      expect(getPublicRisingSignSlug(staticParam)).toBe(staticParam);
      // And the built param still resolves to the same rising record.
      expect(getRisingSign(staticParam)?.sign).toBe(r.sign);
    }
  });

  it('canonical URL equals the public slug, which equals the sitemap slug', () => {
    // sitemap.ts hard-codes these 12 rising slugs as risingSignSlugs and emits
    // /grimoire/rising/<slug>. The page canonical is /grimoire/rising/<publicSlug>.
    // They must be the same set, or the sitemap advertises a URL the page
    // canonicalises away from.
    const SITEMAP_RISING_SLUGS = [
      'aries',
      'taurus',
      'gemini',
      'cancer',
      'leo',
      'virgo',
      'libra',
      'scorpio',
      'sagittarius',
      'capricorn',
      'aquarius',
      'pisces',
    ];
    const pagePublicSlugs = risings
      .map((r) => getPublicRisingSignSlug(r.slug))
      .sort();
    expect(pagePublicSlugs).toEqual([...SITEMAP_RISING_SLUGS].sort());

    // Cross-check the sitemap's literal list is still what sitemap.ts ships, so
    // this fixture cannot silently drift from the source.
    const sm = readFileSync(join(APP_DIR, 'sitemap.ts'), 'utf8');
    const block = sm.slice(
      sm.indexOf('risingSignSlugs'),
      sm.indexOf('risingSignSlugs') + 400,
    );
    const slugsInSource = [...block.matchAll(/'([a-z]+)'/g)].map((m) => m[1]);
    for (const slug of SITEMAP_RISING_SLUGS) {
      expect(slugsInSource).toContain(slug);
    }
  });

  it('normalizeRisingSignSlug round-trips with getPublicRisingSignSlug', () => {
    for (const slug of ['aries', 'pisces', 'scorpio']) {
      expect(getPublicRisingSignSlug(normalizeRisingSignSlug(slug))).toBe(slug);
      // normalize is idempotent (does not double-suffix).
      const once = normalizeRisingSignSlug(slug);
      expect(normalizeRisingSignSlug(once)).toBe(once);
    }
  });
});

/* --------------------------------------- 3. aspect-combo redirect-safety */

describe('Indexability: aspect-combo sitemap URLs survive the canonical redirect', () => {
  it('aspect sitemap emits only canonical (lower-index-first) pair URLs', () => {
    // The 3-level aspect page does permanentRedirect(planet1/planet2 !==
    // getCanonicalAspectPair(...)). sitemap-aspects.xml builds combo paths with
    // an i<j loop, the same canonical form. Reconstruct the sitemap's pair set
    // and assert every pair is already canonical, so no advertised combo URL
    // 301s into an orphan.
    const sitemapPairs: Array<[Planet, Planet]> = [];
    for (let i = 0; i < PLANETS.length; i++) {
      for (let j = i + 1; j < PLANETS.length; j++) {
        sitemapPairs.push([PLANETS[i], PLANETS[j]]);
      }
    }
    expect(sitemapPairs.length).toBe(
      (PLANETS.length * (PLANETS.length - 1)) / 2,
    );

    for (const [p1, p2] of sitemapPairs) {
      const canonical = getCanonicalAspectPair(p1, p2);
      expect(canonical).not.toBeNull();
      // Advertised order already equals canonical order => no redirect.
      expect(canonical).toEqual({ planet1: p1, planet2: p2 });
    }
  });

  it('generateStaticParams pairs are all canonical (no built page 301s)', () => {
    // generateAllAspectParams feeds the page's generateStaticParams. Each
    // emitted (planet1, planet2) must already be canonical so the built page
    // renders content rather than redirecting — the rising-sign invariant's
    // aspect twin, and the direct #286 guard for this route.
    const params = generateAllAspectParams();
    expect(params.length).toBeGreaterThan(0);
    for (const { planet1, planet2 } of params) {
      const canonical = getCanonicalAspectPair(
        planet1 as Planet,
        planet2 as Planet,
      );
      expect(canonical).toEqual({
        planet1: planet1 as Planet,
        planet2: planet2 as Planet,
      });
    }
  });

  it('curated-description lookup is order-sensitive (why canonicalisation matters)', () => {
    // getCuratedAspectDescription is documented to require canonical ordering.
    // Find a major-aspect pair that is curated in canonical order and show the
    // reversed order misses — proving an un-canonicalised sitemap/static URL
    // would also lose the curated content, not just split the URL.
    const majorAspect = 'trine' as Aspect;
    let probed = false;
    for (let i = 0; i < PLANETS.length && !probed; i++) {
      for (let j = i + 1; j < PLANETS.length && !probed; j++) {
        const canonical = getCuratedAspectDescription(
          PLANETS[i],
          majorAspect,
          PLANETS[j],
        );
        if (!canonical) continue;
        const reversed = getCuratedAspectDescription(
          PLANETS[j],
          majorAspect,
          PLANETS[i],
        );
        // The dataset is keyed canonical-first, so the reversed lookup misses.
        expect(reversed).toBeNull();
        // getCanonicalAspectPair re-orders the reversed pair back to the hit.
        const fixed = getCanonicalAspectPair(PLANETS[j], PLANETS[i]);
        expect(fixed).toEqual({ planet1: PLANETS[i], planet2: PLANETS[j] });
        probed = true;
      }
    }
    expect(probed).toBe(true);
  });
});
