/**
 * @jest-environment node
 */

import { GET } from '@/app/sitemap-aspects.xml/route';
import { ASPECTS, PLANETS } from '@/constants/seo/aspects';

function getLocs(xml: string) {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]);
}

describe('GET /sitemap-aspects.xml', () => {
  const originalSkipStaticGeneration = process.env.SKIP_STATIC_GENERATION;

  afterEach(() => {
    if (originalSkipStaticGeneration === undefined) {
      delete process.env.SKIP_STATIC_GENERATION;
    } else {
      process.env.SKIP_STATIC_GENERATION = originalSkipStaticGeneration;
    }
  });

  it('includes planet and planet-aspect landing pages Bing can crawl directly', async () => {
    const response = await GET();
    const xml = await response.text();
    const locs = getLocs(xml);

    expect(response.headers.get('Content-Type')).toBe('application/xml');
    expect(locs).toEqual(
      expect.arrayContaining([
        'https://lunary.app/grimoire/aspects',
        'https://lunary.app/grimoire/aspects/moon',
        'https://lunary.app/grimoire/aspects/jupiter',
        'https://lunary.app/grimoire/aspects/moon/conjunct',
        'https://lunary.app/grimoire/aspects/jupiter/conjunct',
      ]),
    );
  });

  it('does not depend on static generation being enabled', async () => {
    process.env.SKIP_STATIC_GENERATION = 'true';

    const response = await GET();
    const locs = getLocs(await response.text());

    expect(locs).toContain('https://lunary.app/grimoire/aspects/moon/conjunct');
    expect(locs).toContain(
      'https://lunary.app/grimoire/aspects/moon/conjunct/mercury',
    );
  });

  it('covers the whole canonical aspect URL family once', async () => {
    const response = await GET();
    const locs = getLocs(await response.text());
    const uniqueLocs = new Set(locs);
    const canonicalPairCount = (PLANETS.length * (PLANETS.length - 1)) / 2;
    const expectedCount =
      1 +
      PLANETS.length +
      PLANETS.length * ASPECTS.length +
      canonicalPairCount * ASPECTS.length;

    expect(uniqueLocs.size).toBe(locs.length);
    expect(locs.length).toBe(expectedCount);
  });
});
