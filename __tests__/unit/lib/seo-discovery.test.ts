import {
  AI_CRAWLER_USER_AGENTS,
  AI_DISCOVERY_PATHS,
  CURATED_DISCOVERY_SITEMAPS,
  DEPRIORITIZED_DISCOVERY_SITEMAPS,
  INDEXNOW_DISCOVERY_PATHS,
} from '@/lib/seo/discovery';

describe('SEO discovery constants', () => {
  it('keeps AI discovery paths focused on citation and crawl entry points', () => {
    expect(AI_DISCOVERY_PATHS).toEqual(
      expect.arrayContaining([
        '/robots.txt',
        '/llms.txt',
        '/llms-full.txt',
        '/ai-citation-map.json',
        '/grimoire/datasets',
        '/grimoire/datasets/core-astrology.json',
        '/grimoire/datasets/current-sky-facts.json',
        '/about/methodology',
        '/sitemap-index.xml',
      ]),
    );

    CURATED_DISCOVERY_SITEMAPS.forEach((sitemap) => {
      expect(AI_DISCOVERY_PATHS).toContain(`/${sitemap}`);
    });

    DEPRIORITIZED_DISCOVERY_SITEMAPS.forEach((sitemap) => {
      expect(AI_DISCOVERY_PATHS).not.toContain(`/${sitemap}`);
    });
  });

  it('submits the public citation map through IndexNow discovery', () => {
    expect(INDEXNOW_DISCOVERY_PATHS).toEqual(
      expect.arrayContaining(['/', '/ai-citation-map.json']),
    );
  });

  it('covers the main search and answer-engine crawler tokens', () => {
    expect(AI_CRAWLER_USER_AGENTS).toEqual(
      expect.arrayContaining([
        'Bingbot',
        'OAI-SearchBot',
        'Claude-SearchBot',
        'PerplexityBot',
        'Google-Extended',
        'Applebot-Extended',
      ]),
    );
  });
});
