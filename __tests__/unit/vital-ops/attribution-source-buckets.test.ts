/**
 * @jest-environment jsdom
 *
 * VITAL OP #12 - Source-labelled attribution buckets (#285).
 *
 * Source: src/lib/attribution.ts. `mapUtmToSource()` is the funnel-measurement
 * keystone: it maps the new first-party channels (crosspromo / directory /
 * partner / aso / chart-ai-taste / quiz) into their own attribution bucket so
 * they stop collapsing to `direct`/`referral` in the revenue/activation SQL.
 *
 * Three layers are pinned here, all deterministic and offline:
 *   1. mapUtmToSource() in isolation - every new bucket, the prefixed `?ref=`
 *      conventions, the `_app` source suffix, case/whitespace tolerance, and the
 *      critical negative: a bare `?ref=CODE` returns undefined (referral wins).
 *   2. extractUTMFromURL() integration - the bucket only fills `source` when the
 *      existing medium-based mapping has not, and a bare ref keeps `source`
 *      unset so referrer detection can label it.
 *   3. captureAttribution() end-to-end - bsky/mastodon referrers resolve to
 *      `social` (handled by referrer detection, NOT mapUtmToSource), and a bare
 *      `?ref=CODE` from an external referrer lands as `referral`.
 *
 * No network, no DB. `window.location` / `document.referrer` are stubbed.
 */
import {
  mapUtmToSource,
  extractUTMFromURL,
  captureAttribution,
  type AttributionSource,
} from '@/lib/attribution';

/**
 * Drive extractUTMFromURL / captureAttribution without a real browser.
 *
 * jsdom intercepts both `window.location =` assignment and re-defining the
 * property, so the URL is driven via `history.replaceState` (jsdom updates
 * `location.pathname` / `location.search` from it). `document.referrer` is a
 * prototype getter, overridden once with a backing variable.
 */
let stubbedReferrer = '';

beforeAll(() => {
  Object.defineProperty(document, 'referrer', {
    configurable: true,
    get: () => stubbedReferrer,
  });
});

function setLocation(url: string, referrer = ''): void {
  const parsed = new URL(url);
  window.history.replaceState({}, '', parsed.pathname + parsed.search);
  stubbedReferrer = referrer;
}

describe('VITAL #12 mapUtmToSource - new channel buckets', () => {
  // Each new bucket the funnel SQL now segments on.
  const utmCases: Array<
    [string, string | null, string | null, string | null, AttributionSource]
  > = [
    ['crosspromo via utm_medium', null, 'crosspromo', null, 'crosspromo'],
    ['crosspromo via <app>_app source', 'seer_app', 'cpc', null, 'crosspromo'],
    ['partner via utm_medium', null, 'partner', null, 'partner'],
    ['affiliate medium -> partner', null, 'affiliate', null, 'partner'],
    ['directory via utm_medium', null, 'directory', null, 'directory'],
    ['dir medium -> directory', null, 'dir', null, 'directory'],
    ['roundup medium -> directory', null, 'roundup', null, 'directory'],
    ['directory via utm_source', 'directory', null, null, 'directory'],
    ['roundup via utm_source', 'roundup', null, null, 'directory'],
    ['aso via utm_source', 'aso', null, null, 'aso'],
    ['aso via utm_medium', null, 'aso', null, 'aso'],
    ['aso: prefixed source', 'aso:appstore', null, null, 'aso'],
    [
      'chart-ai-taste via source',
      'chart-ai-taste',
      null,
      null,
      'chart-ai-taste',
    ],
    [
      'chart_ai_taste underscore source',
      'chart_ai_taste',
      null,
      null,
      'chart-ai-taste',
    ],
    [
      'chart-ai-taste via medium',
      null,
      'chart-ai-taste',
      null,
      'chart-ai-taste',
    ],
    ['quiz via utm_source', 'quiz', null, null, 'quiz'],
    ['quiz via utm_medium', null, 'quiz', null, 'quiz'],
  ];

  it.each(utmCases)('maps %s', (_label, source, medium, ref, expected) => {
    expect(mapUtmToSource(source, medium, ref)).toBe(expected);
  });
});

describe('VITAL #12 mapUtmToSource - prefixed ?ref= channel labels', () => {
  const refCases: Array<[string, AttributionSource]> = [
    ['dir:apisguru', 'directory'],
    ['roundup:producthunt', 'directory'],
    ['partner:substackpal', 'partner'],
    ['affiliate:someone', 'partner'],
    ['aso:appstore', 'aso'],
    ['crosspromo', 'crosspromo'],
    ['crosspromo:seer', 'crosspromo'],
    ['chart-ai-taste', 'chart-ai-taste'],
    ['chart_ai_taste', 'chart-ai-taste'],
    ['quiz', 'quiz'],
    ['quiz:chart-ruler', 'quiz'],
    ['lead:chart-ruler', 'quiz'],
  ];

  it.each(refCases)('?ref=%s -> %s', (ref, expected) => {
    expect(mapUtmToSource(null, null, ref)).toBe(expected);
  });

  it('prefers the prefixed ref over a conflicting utm_medium', () => {
    // ref says directory, medium says partner -> ref wins (step 1 before step 2).
    expect(mapUtmToSource(null, 'partner', 'dir:apisguru')).toBe('directory');
  });
});

describe('VITAL #12 mapUtmToSource - bare codes & unrecognised input fall through', () => {
  it('returns undefined for a bare ?ref=CODE so referral behaviour is preserved', () => {
    // The whole point: a bare referral code is NOT a channel label.
    expect(mapUtmToSource(null, null, 'BWT123')).toBeUndefined();
    expect(mapUtmToSource(null, null, 'friendcode')).toBeUndefined();
  });

  it('does not treat a code that merely contains a keyword as that channel', () => {
    // startsWith, not includes - "mypartner" / "directoryish" must not match.
    expect(mapUtmToSource(null, null, 'mypartner')).toBeUndefined();
    expect(mapUtmToSource(null, null, 'directoryish')).toBeUndefined();
    expect(mapUtmToSource(null, null, 'aquiz')).toBeUndefined();
  });

  it('returns undefined for unrecognised utm pairs (referrer wins downstream)', () => {
    expect(mapUtmToSource('newsletter', 'banner', null)).toBeUndefined();
    expect(mapUtmToSource('tiktok', 'organic', null)).toBeUndefined();
    expect(mapUtmToSource(null, null, null)).toBeUndefined();
    expect(mapUtmToSource('', '', '')).toBeUndefined();
  });

  it('does NOT classify bsky / mastodon here - those are referrer-domain social', () => {
    // mapUtmToSource only knows the first-party channel labels; social platforms
    // are detected from the referrer hostname, never from this function.
    expect(mapUtmToSource('bsky.app', null, null)).toBeUndefined();
    expect(mapUtmToSource('mastodon.social', null, null)).toBeUndefined();
  });

  it('is case-insensitive and trims surrounding whitespace', () => {
    expect(mapUtmToSource('  ASO  ', null, null)).toBe('aso');
    expect(mapUtmToSource(null, '  CrossPromo ', null)).toBe('crosspromo');
    expect(mapUtmToSource(null, null, '  DIR:ApisGuru ')).toBe('directory');
    expect(mapUtmToSource('SEER_APP', null, null)).toBe('crosspromo');
  });
});

describe('VITAL #12 extractUTMFromURL - bucket only fills an unresolved source', () => {
  it('labels a directory ref-only visit (no utm_source) as directory', () => {
    setLocation('https://lunary.app/birth-chart?ref=dir:apisguru');
    const utm = extractUTMFromURL();
    expect(utm.source).toBe('directory');
    expect(utm.ref).toBe('dir:apisguru');
  });

  it('labels a crosspromo utm visit as crosspromo and carries the medium', () => {
    setLocation(
      'https://lunary.app/?utm_source=seer_app&utm_medium=crosspromo&utm_campaign=spring',
    );
    const utm = extractUTMFromURL();
    expect(utm.source).toBe('crosspromo');
    expect(utm.medium).toBe('crosspromo');
    expect(utm.campaign).toBe('spring');
  });

  it('does NOT override an explicit social utm_medium with a bucket', () => {
    // utm_medium=social is resolved by the legacy block first; bucket must not run.
    setLocation('https://lunary.app/?utm_source=quiz&utm_medium=social');
    const utm = extractUTMFromURL();
    expect(utm.source).toBe('social');
  });

  it('does NOT override an explicit paid utm_medium with a bucket', () => {
    setLocation('https://lunary.app/?utm_source=aso&utm_medium=cpc');
    const utm = extractUTMFromURL();
    expect(utm.source).toBe('paid');
  });

  it('leaves source unset for a bare ?ref=CODE so referrer detection can win', () => {
    setLocation('https://lunary.app/pricing?ref=BWT123');
    const utm = extractUTMFromURL();
    expect(utm.source).toBeUndefined();
    expect(utm.ref).toBe('BWT123');
  });
});

describe('VITAL #12 captureAttribution - end-to-end source labelling', () => {
  it('labels a bsky.app referrer as social (referrer detection, not utm)', () => {
    setLocation('https://lunary.app/birth-chart', 'https://bsky.app/profile/x');
    const a = captureAttribution();
    expect(a?.source).toBe('social');
    expect(a?.medium).toBe('bluesky');
  });

  it('labels a mastodon referrer as social', () => {
    setLocation(
      'https://lunary.app/birth-chart',
      'https://mastodon.social/@someone',
    );
    const a = captureAttribution();
    expect(a?.source).toBe('social');
    expect(a?.medium).toBe('mastodon');
  });

  it('a bare ?ref=CODE from an external referrer lands as referral', () => {
    // mapUtmToSource returns undefined for the bare code, so the external
    // referrer is what classifies the visit -> referral.
    setLocation(
      'https://lunary.app/pricing?ref=BWT123',
      'https://someblog.example.com/post',
    );
    const a = captureAttribution();
    expect(a?.source).toBe('referral');
    expect(a?.ref).toBe('BWT123');
  });

  it('a prefixed ?ref=dir:* still labels as directory even with an external referrer', () => {
    // The channel label is authoritative over the referrer here, because
    // extractUTMFromURL resolves source before referrer detection is consulted.
    setLocation(
      'https://lunary.app/birth-chart?ref=dir:apisguru',
      'https://apisguru.example.com/listing',
    );
    const a = captureAttribution();
    expect(a?.source).toBe('directory');
  });
});
