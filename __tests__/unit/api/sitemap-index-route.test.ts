/**
 * @jest-environment node
 */

import { GET } from '@/app/sitemap-index.xml/route';
import {
  CURATED_DISCOVERY_SITEMAPS,
  DEPRIORITIZED_DISCOVERY_SITEMAPS,
} from '@/lib/seo/discovery';

describe('GET /sitemap-index.xml', () => {
  it('includes the curated Bing and AI discovery sitemap set', async () => {
    const response = await GET();
    const xml = await response.text();

    expect(response.headers.get('Content-Type')).toBe('application/xml');

    CURATED_DISCOVERY_SITEMAPS.forEach((sitemap) => {
      expect(xml).toContain(`<loc>https://lunary.app/${sitemap}</loc>`);
    });
  });

  it('does not re-promote intentionally deprioritized scaled families', async () => {
    const response = await GET();
    const xml = await response.text();

    DEPRIORITIZED_DISCOVERY_SITEMAPS.forEach((sitemap) => {
      expect(xml).not.toContain(sitemap);
    });
  });
});
