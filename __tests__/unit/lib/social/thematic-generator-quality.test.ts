import { categoryThemes } from '@/lib/social/weekly-themes';
import {
  buildFallbackCopy,
  buildSourcePack,
  validateSocialCopy,
} from '@/lib/social/social-copy-generator';

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const bigramOverlap = (a: string, b: string) => {
  const aWords = normalize(a).split(' ').filter(Boolean);
  const bWords = normalize(b).split(' ').filter(Boolean);
  if (aWords.length < 2 || bWords.length < 2) return 0;
  const aBigrams = new Set(
    aWords.slice(0, -1).map((_, idx) => `${aWords[idx]} ${aWords[idx + 1]}`),
  );
  const bBigrams = new Set(
    bWords.slice(0, -1).map((_, idx) => `${bWords[idx]} ${bWords[idx + 1]}`),
  );
  let overlap = 0;
  for (const bigram of aBigrams) {
    if (bBigrams.has(bigram)) overlap += 1;
  }
  return overlap / Math.max(aBigrams.size, bBigrams.size);
};

const findThemeIndex = (category: string) =>
  categoryThemes.findIndex((theme) => theme.category === category);

describe('thematic generator quality', () => {
  const categories = ['tarot', 'zodiac', 'crystals', 'lunar'];

  for (const category of categories) {
    it(`generates clean posts for ${category}`, () => {
      const themeIndex = findThemeIndex(category);
      expect(themeIndex).toBeGreaterThan(-1);
      const theme = categoryThemes[themeIndex];
      const facet = theme.facets[0];
      const introPack = buildSourcePack({
        topic: facet.title,
        theme,
        platform: 'threads',
        postType: 'educational_intro',
        facet,
      });
      const deep1Pack = buildSourcePack({
        topic: facet.title,
        theme,
        platform: 'threads',
        postType: 'educational_deep_1',
        facet,
      });
      const deep2Pack = buildSourcePack({
        topic: facet.title,
        theme,
        platform: 'threads',
        postType: 'educational_deep_2',
        facet,
      });
      const intro = buildFallbackCopy(introPack).content;
      const deep1 = buildFallbackCopy(deep1Pack).content;
      const deep2 = buildFallbackCopy(deep2Pack).content;
      expect(intro).toBeTruthy();
      expect(deep1).toBeTruthy();
      expect(deep2).toBeTruthy();

      expect(validateSocialCopy(intro, facet.title).length).toBe(0);
      expect(validateSocialCopy(deep1, facet.title).length).toBe(0);
      expect(validateSocialCopy(deep2, facet.title).length).toBe(0);

      const MAX_BIGRAM_OVERLAP = 0.6;
      expect(bigramOverlap(intro, deep1)).toBeLessThan(MAX_BIGRAM_OVERLAP);
      expect(bigramOverlap(intro, deep2)).toBeLessThan(MAX_BIGRAM_OVERLAP);
      expect(bigramOverlap(deep1, deep2)).toBeLessThan(MAX_BIGRAM_OVERLAP);
    });
  }

  it('formats video captions with the search phrase first', () => {
    const theme = categoryThemes[findThemeIndex('lunar')];
    const facet = theme.facets[0];
    const pack = buildSourcePack({
      topic: facet.title,
      theme,
      platform: 'tiktok',
      postType: 'video_caption',
      facet,
    });
    const caption = buildFallbackCopy(pack).content;
    const lines = caption.split('\n').filter(Boolean);
    expect(lines.length).toBeGreaterThanOrEqual(5);
    expect(lines[0].toLowerCase()).toContain('meaning and context');
  });
});
