import {
  buildThemesFromLocs,
  extractLocsFromXml,
} from '../scripts/generateThemesFromSitemap';

const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://lunary.app/grimoire/tarot/the-fool</loc>
  </url>
  <url>
    <loc>https://lunary.app/grimoire/tarot/the-magician</loc>
  </url>
  <url>
    <loc>https://lunary.app/grimoire/tarot/the-high-priestess</loc>
  </url>
  <url>
    <loc>https://lunary.app/grimoire/tarot/the-empress</loc>
  </url>
  <url>
    <loc>https://lunary.app/grimoire/astronomy/planets/mars</loc>
  </url>
  <url>
    <loc>https://lunary.app/grimoire/astronomy/planets/venus</loc>
  </url>
  <url>
    <loc>https://lunary.app/grimoire/astronomy/planets/jupiter</loc>
  </url>
  <url>
    <loc>https://lunary.app/about</loc>
  </url>
  <url>
    <loc>/grimoire/moon/phases/full-moon</loc>
  </url>
  <url>
    <loc>/grimoire/moon/phases/new-moon</loc>
  </url>
  <url>
    <loc>/grimoire/moon/phases/first-quarter</loc>
  </url>
  <url>
    <loc>not-a-url</loc>
  </url>
</urlset>`;

describe('generateThemesFromSitemap', () => {
  test('extractLocsFromXml parses loc entries', () => {
    const locs = extractLocsFromXml(sampleXml);
    expect(locs).toEqual(
      expect.arrayContaining([
        'https://lunary.app/grimoire/tarot/the-fool',
        'https://lunary.app/grimoire/tarot/the-magician',
        'https://lunary.app/grimoire/astronomy/planets/mars',
        '/grimoire/moon/phases/full-moon',
      ]),
    );
  });

  test('buildThemesFromLocs groups by bucket and subtheme deterministically', () => {
    const locs = extractLocsFromXml(sampleXml);
    const { buckets, themes } = buildThemesFromLocs(locs);

    expect(Object.keys(buckets)).toEqual(['astronomy', 'moon', 'tarot']);
    expect(Object.keys(buckets.tarot.subthemes)).toEqual([
      'tarot-major-arcana',
    ]);
    expect(Object.keys(buckets.astronomy.subthemes)).toEqual([
      'astronomy-planets',
    ]);
    expect(Object.keys(buckets.moon.subthemes)).toEqual(['moon-phases']);

    const themeIds = themes.map((theme) => theme.id);
    expect(themeIds).toEqual([
      'astronomy-planets',
      'moon-phases',
      'tarot-major-arcana',
    ]);
  });

  test('invalid or non-grimoire URLs are skipped', () => {
    const locs = extractLocsFromXml(sampleXml);
    const { themes } = buildThemesFromLocs(locs);
    expect(
      themes.find((theme) => theme.name.toLowerCase().includes('about')),
    ).toBeUndefined();
  });
});
