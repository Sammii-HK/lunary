import { NextRequest, type NextFetchEvent } from 'next/server';
import { middleware } from '@/middleware';

const makeRequest = (url: string) =>
  new NextRequest(url, {
    headers: {
      host: 'lunary.app',
      'x-forwarded-proto': 'https',
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
      'accept-language': 'en-US,en;q=0.9',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
    },
  });

describe('middleware legacy season redirects', () => {
  it('permanently redirects cited one-segment season URLs to canonical year pages', () => {
    const response = middleware(
      makeRequest(
        'https://lunary.app/grimoire/seasons/gemini-season?utm_source=chatgpt.com',
      ),
      { waitUntil: jest.fn() } as unknown as NextFetchEvent,
    );
    const currentYear = new Date().getUTCFullYear();

    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe(
      `https://lunary.app/grimoire/seasons/${currentYear}/gemini`,
    );
  });

  it('redirects all zodiac season legacy slugs before app rendering', () => {
    const currentYear = new Date().getUTCFullYear();

    for (const sign of [
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
    ]) {
      const response = middleware(
        makeRequest(`https://lunary.app/grimoire/seasons/${sign}-season`),
        { waitUntil: jest.fn() } as unknown as NextFetchEvent,
      );

      expect(response.status).toBe(308);
      expect(response.headers.get('location')).toBe(
        `https://lunary.app/grimoire/seasons/${currentYear}/${sign}`,
      );
    }
  });
});
