import {
  getSeoProtectedPages,
  normalizeProtectedSeoUrl,
} from '@/lib/seo/protected-pages';

describe('SEO protected pages', () => {
  it('normalizes Lunary URLs for sitemap protection', () => {
    expect(
      normalizeProtectedSeoUrl(
        'https://lunary.app/grimoire/moon/phases/?utm_source=bing#phase',
      ),
    ).toBe('https://lunary.app/grimoire/moon/phases');

    expect(normalizeProtectedSeoUrl('/grimoire/tarot')).toBe(
      'https://lunary.app/grimoire/tarot',
    );
  });

  it('rejects non-Lunary URLs', () => {
    expect(normalizeProtectedSeoUrl('https://example.com/grimoire')).toBeNull();
  });

  it('loads the seeded protected page manifest', () => {
    const pages = getSeoProtectedPages();

    expect(pages.some((page) => page.path === '/grimoire')).toBe(true);
    expect(
      pages.every((page) => page.url.startsWith('https://lunary.app/')),
    ).toBe(true);
  });
});
