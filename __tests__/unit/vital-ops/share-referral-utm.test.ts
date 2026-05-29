/**
 * @jest-environment node
 *
 * VITAL OP #7 - Referral / share: the share-link plumbing that attributes
 * acquisition. Covers:
 *   - appendRef (src/lib/share/referral-url.ts) - attaches ?ref= to a share URL
 *   - buildSignupChartUrl (src/lib/urls.ts) - the signup CTA with UTM params
 *
 * buildUtmUrl / buildLinksUtmUrl are already covered in
 * __tests__/unit/lib/urls.test.ts, so this file deliberately does not retest
 * them; it adds the untested appendRef and buildSignupChartUrl. No network/DB.
 */
// referral-url.ts also exports getShareReferralCode, which imports the
// server-only auth + referrals modules (better-auth / @vercel/postgres).
// We only test the pure appendRef helper, so stub those heavy modules to keep
// this a true offline unit test.
jest.mock('@/lib/auth', () => ({ auth: { api: { getSession: jest.fn() } } }));
jest.mock('@/lib/referrals', () => ({ getReferralCode: jest.fn() }));

import { appendRef } from '../../../src/lib/share/referral-url';
import { buildSignupChartUrl } from '../../../src/lib/urls';

describe('VITAL #7 appendRef - referral code on share URLs', () => {
  it('appends ?ref=CODE to a URL with no query string', () => {
    expect(
      appendRef('https://lunary.app/share/horoscope/abc', 'FRIEND123'),
    ).toBe('https://lunary.app/share/horoscope/abc?ref=FRIEND123');
  });

  it('appends &ref=CODE when the URL already has a query string', () => {
    expect(
      appendRef(
        'https://lunary.app/share/horoscope/abc?format=square',
        'FRIEND123',
      ),
    ).toBe(
      'https://lunary.app/share/horoscope/abc?format=square&ref=FRIEND123',
    );
  });

  it('returns the URL unchanged when there is no referral code', () => {
    const url = 'https://lunary.app/share/horoscope/abc';
    expect(appendRef(url, null)).toBe(url);
  });

  it('returns the URL unchanged for an empty referral code', () => {
    const url = 'https://lunary.app/share/horoscope/abc?x=1';
    expect(appendRef(url, '')).toBe(url);
  });
});

describe('VITAL #7 buildSignupChartUrl - UTM attribution on the signup CTA', () => {
  it('always carries utm_source and utm_medium with sensible defaults', () => {
    const url = buildSignupChartUrl();
    expect(url.startsWith('/signup/chart?')).toBe(true);
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('utm_source')).toBe('grimoire');
    expect(params.get('utm_medium')).toBe('cta');
    expect(params.get('utm_campaign')).toBe('chart_signup');
  });

  it('honours explicit source / medium / campaign overrides', () => {
    const url = buildSignupChartUrl({
      source: 'blog',
      medium: 'inline',
      campaign: 'spring_push',
    });
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('utm_source')).toBe('blog');
    expect(params.get('utm_medium')).toBe('inline');
    expect(params.get('utm_campaign')).toBe('spring_push');
  });

  it('derives utm_content from location/hub when content is not given', () => {
    const url = buildSignupChartUrl({ location: 'hero_banner' });
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('utm_content')).toBe('hero_banner');
    expect(params.get('location')).toBe('hero_banner');
  });

  it('passes through optional funnel + redirect context for personalisation', () => {
    const url = buildSignupChartUrl({
      hub: 'leo',
      redirect: '/app',
      birthDate: '1990-06-15',
    });
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('hub')).toBe('leo');
    expect(params.get('redirect')).toBe('/app');
    expect(params.get('birthDate')).toBe('1990-06-15');
  });

  it('returns a same-origin relative path (no absolute lunary.app host leaked)', () => {
    const url = buildSignupChartUrl({ source: 'grimoire' });
    expect(url.startsWith('/signup/chart')).toBe(true);
    expect(url).not.toContain('https://');
  });
});
