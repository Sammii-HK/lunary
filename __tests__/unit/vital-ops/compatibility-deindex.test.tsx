/**
 * @jest-environment jsdom
 *
 * VITAL OP #13 - Compatibility long-tail de-index (#286).
 *
 * Source: src/constants/seo/compatibility-content.ts + src/components/
 * CompatibilityMatrix.tsx. PR #286 keeps the thin element/modality fallback
 * compatibility pages out of the crawl surface: only the hand-written curated
 * pairs stay indexable and internally linked. The gate is
 * `isCuratedCompatibilityPair(slug)` over a Set built from the 42 curated JSON
 * keys, and `CompatibilityMatrix` renders a crawlable <Link> only for curated
 * cells (thin pairs become an aria-hidden non-link <span>).
 *
 * This pins:
 *   1. The curated set is exactly the 42 JSON pairs; clearly thin pairs are out.
 *   2. compatibilitySlug() canonicalises to alphabetical order, both directions.
 *   3. The matrix emits link cells for curated pairs and non-link cells for the
 *      rest (the de-index mechanism that controls the crawl surface).
 *
 * It also documents, with a skipped `// BUG:` test, that 12 of the 42 curated
 * pairs are stored under NON-alphabetical JSON keys and so are unreachable via
 * their canonical slug (see the BUG block for the full chain).
 *
 * No network, no DB - the curated data is a static JSON import.
 */
import { render } from '@testing-library/react';
import {
  isCuratedCompatibilityPair,
  compatibilitySlug,
  getCuratedCompatibilitySlugs,
  generateCompatibilityContent,
} from '@/constants/seo/compatibility-content';
import { signDescriptions } from '@/constants/seo/planet-sign-content';
import { CompatibilityMatrix } from '@/components/CompatibilityMatrix';

const SIGN_KEYS = Object.keys(signDescriptions);

/** The 12-tuple shape CompatibilityMatrix expects. */
const SIGN_TUPLES = SIGN_KEYS.map(
  (key) =>
    [
      key,
      {
        name: signDescriptions[key].name,
        element: signDescriptions[key].element,
        modality: signDescriptions[key].modality,
      },
    ] as [string, { name: string; element: string; modality: string }],
);

describe('VITAL #13 isCuratedCompatibilityPair - curated set membership', () => {
  const curated = getCuratedCompatibilitySlugs();

  it('contains exactly the 42 curated pairs', () => {
    expect(curated).toHaveLength(42);
  });

  it('returns true for every curated slug (looked up by its own key)', () => {
    for (const slug of curated) {
      expect(isCuratedCompatibilityPair(slug)).toBe(true);
    }
  });

  it('returns false for clearly non-curated thin pairs', () => {
    // These element/modality fallback pairs are not in the curated JSON.
    const nonCurated = [
      'aries-and-virgo',
      'aries-and-capricorn',
      'taurus-and-gemini',
      'taurus-and-leo',
      'gemini-and-virgo',
      'cancer-and-libra',
      'leo-and-virgo',
      'virgo-and-scorpio',
      'libra-and-pisces',
      'sagittarius-and-capricorn',
    ];
    for (const slug of nonCurated) {
      // Guard: make sure the fixture really is outside the curated set.
      expect(curated).not.toContain(slug);
      expect(isCuratedCompatibilityPair(slug)).toBe(false);
    }
  });

  it('returns false for malformed / unknown slugs', () => {
    expect(isCuratedCompatibilityPair('')).toBe(false);
    expect(isCuratedCompatibilityPair('aries')).toBe(false);
    expect(isCuratedCompatibilityPair('aries-and-nothere')).toBe(false);
    expect(isCuratedCompatibilityPair('ARIES-AND-LEO')).toBe(false);
  });
});

describe('VITAL #13 compatibilitySlug - alphabetical canonicalisation', () => {
  it('orders the two sign keys alphabetically regardless of argument order', () => {
    expect(compatibilitySlug('leo', 'aries')).toBe('aries-and-leo');
    expect(compatibilitySlug('aries', 'leo')).toBe('aries-and-leo');
  });

  it('handles same-sign pairs', () => {
    expect(compatibilitySlug('virgo', 'virgo')).toBe('virgo-and-virgo');
  });

  it('agrees with the slug generateCompatibilityContent assigns', () => {
    const content = generateCompatibilityContent('leo', 'aries');
    expect(content.slug).toBe(compatibilitySlug('leo', 'aries'));
  });
});

describe('VITAL #13 CompatibilityMatrix - link vs non-link cells', () => {
  it('renders a crawlable <a> for curated cells and a non-link <span> otherwise', () => {
    const { container } = render(<CompatibilityMatrix signs={SIGN_TUPLES} />);

    const links = Array.from(
      container.querySelectorAll('a[href^="/grimoire/compatibility/"]'),
    );
    // Every rendered link must point at a curated slug.
    for (const link of links) {
      const href = link.getAttribute('href') ?? '';
      const slug = href.replace('/grimoire/compatibility/', '');
      expect(isCuratedCompatibilityPair(slug)).toBe(true);
    }

    // Non-curated cells must be aria-hidden non-link spans, never links.
    const hiddenCells = container.querySelectorAll('span[aria-hidden="true"]');
    expect(hiddenCells.length).toBeGreaterThan(0);
  });

  it('emits one link cell per curated canonical slug that the matrix can form', () => {
    const { container } = render(<CompatibilityMatrix signs={SIGN_TUPLES} />);
    const linkHrefs = Array.from(
      container.querySelectorAll('a[href^="/grimoire/compatibility/"]'),
    ).map((a) => a.getAttribute('href'));

    // The matrix walks all 12x12 ordered cells and forms the canonical slug for
    // each. Every curated pair whose canonical slug is itself recognised as
    // curated (the 30 alphabetically-keyed pairs) must therefore appear as a
    // link. (The other 12 are covered by the skipped BUG block below.)
    const reachable = getCuratedCompatibilitySlugs().filter((slug) => {
      const [a, b] = slug.split('-and-');
      return isCuratedCompatibilityPair(compatibilitySlug(a, b));
    });
    expect(reachable.length).toBeGreaterThanOrEqual(30);
    for (const slug of reachable) {
      expect(linkHrefs).toContain(`/grimoire/compatibility/${slug}`);
    }
  });

  it('never links a thin fallback pair', () => {
    const { container } = render(<CompatibilityMatrix signs={SIGN_TUPLES} />);
    const linkSlugs = Array.from(
      container.querySelectorAll('a[href^="/grimoire/compatibility/"]'),
    ).map((a) =>
      (a.getAttribute('href') ?? '').replace('/grimoire/compatibility/', ''),
    );
    // aries-and-virgo is a known thin pair - it must not be a link anywhere.
    expect(linkSlugs).not.toContain('aries-and-virgo');
  });
});

/**
 * BUG (#286): 12 of the 42 curated compatibility pairs are stored in the JSON
 * under NON-alphabetical keys (e.g. "taurus-and-cancer", "capricorn-and-aquarius").
 *
 * Every consumer builds the slug alphabetically via compatibilitySlug()
 * (canonical = "cancer-and-taurus"), but the curated Set / getCuratedPair()
 * lookup is keyed on the raw JSON key. The two never meet:
 *
 *   - isCuratedCompatibilityPair("cancer-and-taurus")        -> false
 *   - generateCompatibilityContent("taurus","cancer").isCurated -> false
 *     (serves the thin element/modality fallback, no curated summary)
 *
 * In the page (src/app/grimoire/compatibility/[match]/page.tsx) the damage
 * compounds: generateStaticParams() emits the raw key "taurus-and-cancer", but
 * the page then computes content.slug = "cancer-and-taurus" and
 * permanentRedirect()s there. The redirect target is NOT in generateStaticParams
 * and renders with robots.index = Boolean(content.isCurated) = false. So all 12
 * hand-written curated pairs 301 to a NOINDEXED thin page and their curated
 * content is never served or indexed - the opposite of the PR's intent.
 *
 * Fixed in fix/compat-curated-key-normalisation: the curated map is re-keyed to
 * the canonical alphabetical slug at module load (and getCuratedPair also
 * re-canonicalises any raw slug), so all 42 curated pairs resolve through their
 * canonical slug. These assertions now run un-skipped to pin that invariant.
 */
describe('VITAL #13 FIXED: non-alphabetical curated keys are reachable via canonical slug', () => {
  it('every curated pair resolves as curated through its canonical slug', () => {
    const broken: string[] = [];
    for (const key of getCuratedCompatibilitySlugs()) {
      const [a, b] = key.split('-and-');
      const canonical = compatibilitySlug(a, b);
      if (!isCuratedCompatibilityPair(canonical)) {
        broken.push(`${key} -> ${canonical}`);
      }
    }
    // Currently 12 are broken; the fix should make this list empty.
    expect(broken).toEqual([]);
  });

  it('the matrix links all 42 curated pairs (currently only the 30 alphabetical ones)', () => {
    const { container } = render(<CompatibilityMatrix signs={SIGN_TUPLES} />);
    const linkSlugs = new Set(
      Array.from(
        container.querySelectorAll('a[href^="/grimoire/compatibility/"]'),
      ).map((a) =>
        (a.getAttribute('href') ?? '').replace('/grimoire/compatibility/', ''),
      ),
    );
    // The intended invariant: a link exists for every curated pair (the matrix
    // forms the canonical slug for each ordered cell, so the curated content
    // should be reachable). Today the 12 non-alphabetical keys are missing.
    const missing = getCuratedCompatibilitySlugs().filter((key) => {
      const [a, b] = key.split('-and-');
      return !linkSlugs.has(compatibilitySlug(a, b));
    });
    expect(missing).toEqual([]);
  });
});
