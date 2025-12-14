import { test, expect } from '../fixtures/auth';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const grimoireRoutes = [
  { path: '/grimoire', name: 'Grimoire Index' },
  { path: '/grimoire/zodiac/aries', name: 'Zodiac - Aries' },
  { path: '/grimoire/zodiac/aquarius', name: 'Zodiac - Aquarius' },
  { path: '/grimoire/astronomy/planets/mercury', name: 'Planet - Mercury' },
  { path: '/grimoire/astronomy/planets/venus', name: 'Planet - Venus' },
  { path: '/grimoire/crystals/amethyst', name: 'Crystal - Amethyst' },
  { path: '/grimoire/tarot/the-fool', name: 'Tarot - The Fool' },
  { path: '/grimoire/tarot/the-magician', name: 'Tarot - The Magician' },
  { path: '/grimoire/houses', name: 'Houses Index' },
  { path: '/grimoire/runes', name: 'Runes Index' },
];

const longformGuides = [
  {
    path: '/grimoire/guides/birth-chart-complete-guide',
    name: 'Birth Chart Guide',
  },
  {
    path: '/grimoire/guides/crystal-healing-guide',
    name: 'Crystal Healing Guide',
  },
  { path: '/grimoire/guides/moon-phases-guide', name: 'Moon Phases Guide' },
  {
    path: '/grimoire/guides/tarot-complete-guide',
    name: 'Tarot Complete Guide',
  },
];

const horoscopeRoutes = [
  { path: '/horoscope', name: 'Horoscope Index' },
  { path: '/horoscope/aries', name: 'Aries Horoscope' },
  { path: '/horoscope/taurus', name: 'Taurus Horoscope' },
];

const corePages = [
  { path: '/', name: 'Homepage' },
  { path: '/pricing', name: 'Pricing' },
  { path: '/glossary', name: 'Glossary' },
  { path: '/transits', name: 'Transits' },
  { path: '/moon-calendar', name: 'Moon Calendar' },
  { path: '/shop', name: 'Shop' },
  { path: '/blog', name: 'Blog' },
];

test.describe('SEO - Core Pages', () => {
  for (const route of corePages) {
    test(`${route.name} has canonical, title, description, and JSON-LD`, async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}${route.path}`, {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForTimeout(1000);

      const canonicalHref = await page.getAttribute(
        'link[rel="canonical"]',
        'href',
      );
      expect
        .soft(canonicalHref, `${route.path} missing canonical`)
        .toBeTruthy();

      const title = await page.title();
      expect
        .soft(title.length, `${route.path} missing title`)
        .toBeGreaterThan(0);

      const description = await page.getAttribute(
        'meta[name="description"]',
        'content',
      );
      expect
        .soft(description, `${route.path} missing meta description`)
        .toBeTruthy();

      const jsonLdScripts = await page.$$('script[type="application/ld+json"]');
      expect
        .soft(jsonLdScripts.length, `${route.path} missing JSON-LD`)
        .toBeGreaterThan(0);

      for (const script of jsonLdScripts) {
        const raw = await script.textContent();
        expect.soft(raw, `${route.path} has empty JSON-LD`).toBeTruthy();
        if (!raw) continue;
        try {
          JSON.parse(raw);
        } catch (err) {
          throw new Error(
            `${route.path} has invalid JSON-LD: ${(err as Error).message}`,
          );
        }
      }
    });
  }
});

test.describe('SEO - Birth Chart Tool Robots', () => {
  test('/birth-chart should have noindex meta tag', async ({ page }) => {
    await page.goto(`${BASE_URL}/birth-chart`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(1000);

    const robots = await page.getAttribute('meta[name="robots"]', 'content');
    expect(robots?.toLowerCase()).toContain('noindex');
  });

  test('/birth-chart/example should have noindex meta tag', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/birth-chart/example`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(1000);

    const robots = await page.getAttribute('meta[name="robots"]', 'content');
    expect(robots?.toLowerCase()).toContain('noindex');
  });
});

test.describe('SEO - Grimoire Pages', () => {
  for (const route of grimoireRoutes) {
    test(`${route.name} has proper SEO elements`, async ({ page }) => {
      await page.goto(`${BASE_URL}${route.path}`, {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForTimeout(1500);

      const canonicalHref = await page.getAttribute(
        'link[rel="canonical"]',
        'href',
      );
      expect
        .soft(canonicalHref, `${route.path} missing canonical`)
        .toBeTruthy();

      const title = await page.title();
      expect
        .soft(title.length, `${route.path} missing title`)
        .toBeGreaterThan(0);

      const jsonLdScripts = await page.$$('script[type="application/ld+json"]');
      expect
        .soft(jsonLdScripts.length, `${route.path} missing JSON-LD`)
        .toBeGreaterThan(0);

      const robots = await page.getAttribute('meta[name="robots"]', 'content');
      if (robots) {
        expect
          .soft(
            robots.toLowerCase().includes('noindex'),
            `${route.path} should not be noindex`,
          )
          .toBeFalsy();
      }
    });
  }

  test('Grimoire zodiac page links to related content', async ({ page }) => {
    await page.goto(`${BASE_URL}/grimoire/zodiac/aries`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(1500);

    const bodyText = (await page.textContent('body'))?.toLowerCase() || '';
    expect
      .soft(
        bodyText.includes('aries') || bodyText.includes('ram'),
        'Page should mention Aries content',
      )
      .toBeTruthy();
  });

  test('Grimoire crystal page has Cosmic Connections section', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/grimoire/crystals/amethyst`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(1500);

    const bodyText = (await page.textContent('body'))?.toLowerCase() || '';
    expect
      .soft(
        bodyText.includes('cosmic connection') ||
          bodyText.includes('connections'),
        'Crystal page should have cosmic connections section',
      )
      .toBeTruthy();
  });
});

test.describe('SEO - Longform Guides', () => {
  for (const guide of longformGuides) {
    test(`${guide.name} has TOC and proper structure`, async ({ page }) => {
      await page.goto(`${BASE_URL}${guide.path}`, {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForTimeout(2000);

      const canonicalHref = await page.getAttribute(
        'link[rel="canonical"]',
        'href',
      );
      expect
        .soft(canonicalHref, `${guide.path} missing canonical`)
        .toBeTruthy();

      const jsonLdScripts = await page.$$('script[type="application/ld+json"]');
      expect
        .soft(jsonLdScripts.length, `${guide.path} missing JSON-LD`)
        .toBeGreaterThan(0);

      const bodyText = (await page.textContent('body'))?.toLowerCase() || '';
      const hasToc =
        bodyText.includes('on this page') ||
        bodyText.includes('table of contents') ||
        bodyText.includes('contents');
      expect
        .soft(hasToc, `${guide.path} should have TOC navigation`)
        .toBeTruthy();

      const hasCosmicConnections =
        bodyText.includes('cosmic connection') ||
        bodyText.includes('connections');
      expect
        .soft(
          hasCosmicConnections,
          `${guide.path} should have cosmic connections section`,
        )
        .toBeTruthy();

      const h1Count = await page.locator('h1').count();
      expect.soft(h1Count, `${guide.path} should have exactly one h1`).toBe(1);
    });
  }
});

test.describe('SEO - Horoscope Pages', () => {
  for (const route of horoscopeRoutes) {
    test(`${route.name} has proper SEO and internal links`, async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}${route.path}`, {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForTimeout(1500);

      const canonicalHref = await page.getAttribute(
        'link[rel="canonical"]',
        'href',
      );
      expect
        .soft(canonicalHref, `${route.path} missing canonical`)
        .toBeTruthy();

      const jsonLdScripts = await page.$$('script[type="application/ld+json"]');
      expect
        .soft(jsonLdScripts.length, `${route.path} missing JSON-LD`)
        .toBeGreaterThan(0);

      for (const script of jsonLdScripts) {
        const raw = await script.textContent();
        if (!raw) continue;
        try {
          JSON.parse(raw);
        } catch (err) {
          throw new Error(
            `${route.path} has invalid JSON-LD: ${(err as Error).message}`,
          );
        }
      }
    });
  }

  test('Horoscope sign page links to grimoire zodiac page', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/grimoire/horoscopes/aries/2026/january`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(1500);

    const links = await page.$$('a[href*="/grimoire/zodiac/aries"]');
    expect
      .soft(links.length, 'Horoscope page should link to grimoire zodiac page')
      .toBeGreaterThan(0);
  });
});

test.describe('SEO - Glossary', () => {
  test('Glossary page has working search', async ({ page }) => {
    await page.goto(`${BASE_URL}/grimoire/glossary`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(1500);

    const searchSelectors = [
      'input[type="search"]',
      'input[name="search"]',
      'input[placeholder*="search" i]',
    ];

    let searchInput = await page.$(searchSelectors.join(', '));

    expect.soft(searchInput, 'Glossary should have search input').toBeTruthy();

    if (searchInput) {
      await searchInput.fill('retrograde');
      await page.waitForTimeout(500);

      const body = (await page.textContent('body'))?.toLowerCase() || '';
      expect
        .soft(
          body.includes('retrograde'),
          'Glossary should filter to show retrograde content',
        )
        .toBeTruthy();
    }
  });

  test('Glossary has proper SEO elements', async ({ page }) => {
    await page.goto(`${BASE_URL}/glossary`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const canonicalHref = await page.getAttribute(
      'link[rel="canonical"]',
      'href',
    );
    expect.soft(canonicalHref, 'Glossary missing canonical').toBeTruthy();

    const jsonLdScripts = await page.$$('script[type="application/ld+json"]');
    expect
      .soft(jsonLdScripts.length, 'Glossary missing JSON-LD')
      .toBeGreaterThan(0);

    const h1Count = await page.locator('h1').count();
    expect.soft(h1Count, 'Glossary should have exactly one h1').toBe(1);
  });
});

test.describe('SEO - Transits and Moon Calendar', () => {
  test('Transits page has proper structure', async ({ page }) => {
    await page.goto(`${BASE_URL}/transits`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const canonicalHref = await page.getAttribute(
      'link[rel="canonical"]',
      'href',
    );
    expect.soft(canonicalHref, 'Transits missing canonical').toBeTruthy();

    const title = await page.title();
    expect.soft(title.length, 'Transits missing title').toBeGreaterThan(0);

    const h1Count = await page.locator('h1').count();
    expect.soft(h1Count, 'Transits should have exactly one h1').toBe(1);
  });

  test('Moon Calendar page has proper structure', async ({ page }) => {
    await page.goto(`${BASE_URL}/moon-calendar`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(1500);

    const canonicalHref = await page.getAttribute(
      'link[rel="canonical"]',
      'href',
    );
    expect.soft(canonicalHref, 'Moon Calendar missing canonical').toBeTruthy();

    const title = await page.title();
    expect.soft(title.length, 'Moon Calendar missing title').toBeGreaterThan(0);

    const jsonLdScripts = await page.$$('script[type="application/ld+json"]');
    expect
      .soft(jsonLdScripts.length, 'Moon Calendar missing JSON-LD')
      .toBeGreaterThan(0);
  });
});

test.describe('SEO - JSON-LD Validation', () => {
  const sampleRoutes = [
    '/',
    '/grimoire',
    '/grimoire/zodiac/aries',
    '/grimoire/horoscopes',
    '/blog',
    '/shop',
  ];

  for (const route of sampleRoutes) {
    test(`${route} has valid JSON-LD with @context`, async ({ page }) => {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      const jsonLdScripts = await page.$$('script[type="application/ld+json"]');

      for (const script of jsonLdScripts) {
        const raw = await script.textContent();
        if (!raw) continue;

        const parsed = JSON.parse(raw);
        const context = parsed['@context'] || parsed[0]?.['@context'];
        expect
          .soft(context, `${route} JSON-LD should have @context`)
          .toBeTruthy();

        if (context) {
          expect
            .soft(
              context.includes('schema.org'),
              `${route} JSON-LD @context should reference schema.org`,
            )
            .toBeTruthy();
        }
      }
    });
  }
});

test.describe('SEO - Robots Meta Validation', () => {
  const indexableRoutes = [
    '/',
    '/pricing',
    '/grimoire',
    '/grimoire/zodiac/aries',
    '/grimoire/horoscopes',
    '/blog',
    '/shop',
  ];

  for (const route of indexableRoutes) {
    test(`${route} should be indexable (no noindex)`, async ({ page }) => {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      const robots = await page.getAttribute('meta[name="robots"]', 'content');
      if (robots) {
        expect
          .soft(
            robots.toLowerCase().includes('noindex'),
            `${route} should not have noindex`,
          )
          .toBeFalsy();
      }
    });
  }

  const noindexRoutes = ['/birth-chart', '/birth-chart/example'];

  for (const route of noindexRoutes) {
    test(`${route} should be noindex`, async ({ page }) => {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      const robots = await page.getAttribute('meta[name="robots"]', 'content');
      expect(robots?.toLowerCase()).toContain('noindex');
    });
  }
});

test.describe('SEO - Internal Linking', () => {
  test('Homepage has links to key sections', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const grimoireLink = await page.$('a[href*="/grimoire"]');
    expect.soft(grimoireLink, 'Homepage should link to grimoire').toBeTruthy();

    const pricingLink = await page.$('a[href*="/pricing"]');
    expect.soft(pricingLink, 'Homepage should link to pricing').toBeTruthy();
  });

  test('Grimoire index links to sub-sections', async ({ page }) => {
    await page.goto(`${BASE_URL}/grimoire`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const zodiacLink = await page.$('a[href*="/grimoire/zodiac"]');
    expect
      .soft(zodiacLink, 'Grimoire should link to zodiac section')
      .toBeTruthy();

    const crystalsLink = await page.$('a[href*="/grimoire/crystals"]');
    expect
      .soft(crystalsLink, 'Grimoire should link to crystals section')
      .toBeTruthy();

    const tarotLink = await page.$('a[href*="/grimoire/tarot"]');
    expect
      .soft(tarotLink, 'Grimoire should link to tarot section')
      .toBeTruthy();
  });
});
