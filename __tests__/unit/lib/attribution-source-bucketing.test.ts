/**
 * @jest-environment jsdom
 *
 * VITAL - First-touch attribution source bucketing.
 *
 * src/lib/attribution.ts decides which acquisition CHANNEL every visit (and
 * therefore every signup) is credited to. Its output is persisted verbatim into
 * user_attribution.first_touch_source and is what the revenue / activation SQL
 * segments on (the entire source-labelled funnel). A regression here silently
 * mislabels a channel - e.g. AI-citation traffic counted as SEO, or a new
 * directory/partner channel collapsing back to "direct"/"referral" - and the
 * business loses the ability to tell which routes actually convert.
 *
 * Coverage before this file: NONE. The only reference to @/lib/attribution in
 * the suite is a jest.mock() stub in auth-age-gate.test.tsx; none of the pure
 * bucketing functions had a single assertion. The /api/attribution route test
 * covers the server-side COALESCE/auth, not the client-side bucketing that
 * produces the values being persisted.
 *
 * These tests pin the load-bearing INVARIANTS:
 *   - referrer detection order: AI engines win over search engines (so
 *     gemini.google.com is "ai", never "seo") - the keystone of measurable
 *     AI-citation reach;
 *   - the first-party channel map (mapUtmToSource) routes the new
 *     directory/partner/aso/crosspromo/quiz/chart-ai-taste labels correctly and
 *     stays ADDITIVE (returns undefined for anything it does not recognise, so
 *     bare ?ref=CODE referral codes are untouched);
 *   - everything fails SAFE to "direct" when ref/referrer is missing or
 *     malformed (never throws, never invents a channel);
 *   - getAttributionForTracking maps stored attribution onto the exact
 *     first_touch_* / utm_* keys the persistence layer expects.
 *
 * Pure logic + jsdom localStorage only. No network, no DB. Deterministic.
 */
import {
  mapUtmToSource,
  detectSourceFromReferrer,
  extractSearchQuery,
  extractUTMFromURL,
  getStoredAttribution,
  storeAttribution,
  initializeAttribution,
  clearAttribution,
  getAttributionForTracking,
  isOrganicTraffic,
  isAiSourced,
  isSocialTraffic,
  type Attribution,
} from '@/lib/attribution';

// ---------------------------------------------------------------------------
// detectSourceFromReferrer - the referrer -> channel classifier.
// ---------------------------------------------------------------------------
describe('VITAL attribution - detectSourceFromReferrer ordering & buckets', () => {
  it('classifies AI assistants as "ai" with the engine as medium', () => {
    expect(detectSourceFromReferrer('https://chatgpt.com/c/abc')).toEqual({
      source: 'ai',
      medium: 'chatgpt',
    });
    expect(
      detectSourceFromReferrer('https://www.perplexity.ai/search'),
    ).toEqual({ source: 'ai', medium: 'perplexity' });
    expect(detectSourceFromReferrer('https://claude.ai/chat/1')).toEqual({
      source: 'ai',
      medium: 'claude',
    });
  });

  it('classifies gemini.google.com as "ai" NOT "seo" (AI checked before search)', () => {
    // gemini.google.com contains "google"; if search were checked first it would
    // be mislabelled as organic SEO. This ordering is the whole reason the
    // AI-citation channel is measurable - pin it hard.
    expect(detectSourceFromReferrer('https://gemini.google.com/app')).toEqual({
      source: 'ai',
      medium: 'gemini',
    });
  });

  it('classifies real search engines as "seo"', () => {
    expect(
      detectSourceFromReferrer('https://www.google.com/search?q=lunary'),
    ).toEqual({ source: 'seo', medium: 'google' });
    expect(detectSourceFromReferrer('https://www.bing.com/search?q=x')).toEqual(
      {
        source: 'seo',
        medium: 'bing',
      },
    );
  });

  it('classifies social platforms as "social"', () => {
    expect(detectSourceFromReferrer('https://www.tiktok.com/@x')).toEqual({
      source: 'social',
      medium: 'tiktok',
    });
    expect(detectSourceFromReferrer('https://bsky.app/profile/x')).toEqual({
      source: 'social',
      medium: 'bluesky',
    });
    expect(detectSourceFromReferrer('https://x.com/lunary')).toEqual({
      source: 'social',
      medium: 'twitter',
    });
  });

  it('classifies a webmail host as "email" when no search-engine domain shadows it', () => {
    // The email branch sits AFTER the search-engine loop, so it only fires for
    // webmail hosts that do not also contain a search-engine substring.
    expect(detectSourceFromReferrer('https://mail.proton.me/u/0')).toEqual({
      source: 'email',
      medium: 'webmail',
    });
    expect(detectSourceFromReferrer('https://outlook.live.com/mail')).toEqual({
      source: 'email',
      medium: 'webmail',
    });
  });

  // -------------------------------------------------------------------------
  // FIXED: Gmail and Yahoo Mail webmail click-throughs now resolve to "email".
  //
  // mail.google.com contains 'google' and mail.yahoo.com contains 'yahoo', so
  // when the SEARCH_ENGINES loop ran BEFORE the webmail branch they were
  // mislabelled as organic SEO and the email branch was never reached. That
  // inflated SEO conversion and hid email's true revenue contribution - the
  // exact source-labelling corruption the funnel depends on avoiding.
  //
  // detectSourceFromReferrer now checks the webmail branch
  // (hostname.includes('mail') || hostname.includes('outlook')) BEFORE the
  // search-engine loop, so a link clicked inside any webmail client is credited
  // to email regardless of which provider also runs a search engine. AI engines
  // still win above webmail, so gemini.google.com stays "ai" (it has no 'mail'
  // segment) and real search keeps resolving to "seo".
  // -------------------------------------------------------------------------
  it('classifies Gmail/Yahoo Mail webmail as "email", not "seo"', () => {
    expect(
      detectSourceFromReferrer('https://mail.google.com/mail/u/0'),
    ).toEqual({ source: 'email', medium: 'webmail' });
    expect(
      detectSourceFromReferrer('https://mail.yahoo.com/d/folders/1'),
    ).toEqual({ source: 'email', medium: 'webmail' });
  });

  it('still classifies real search hosts (no webmail segment) as "seo"', () => {
    // Guards against the fix over-reaching: search.yahoo.com and www.google.com
    // contain a search-engine substring but no 'mail' segment, so they must keep
    // resolving to organic SEO now that webmail is checked first.
    expect(
      detectSourceFromReferrer('https://search.yahoo.com/search?p=tarot'),
    ).toEqual({ source: 'seo', medium: 'yahoo' });
    expect(
      detectSourceFromReferrer('https://www.google.com/search?q=lunary'),
    ).toEqual({ source: 'seo', medium: 'google' });
  });

  it('classifies an unknown external site as "referral" carrying its hostname', () => {
    expect(detectSourceFromReferrer('https://someblog.com/post')).toEqual({
      source: 'referral',
      medium: 'someblog.com',
    });
  });

  it('treats a same-site (lunary) referrer as "direct" (not self-referral)', () => {
    expect(detectSourceFromReferrer('https://lunary.app/blog/x')).toEqual({
      source: 'direct',
    });
  });

  it('fails safe to "direct" for empty or malformed referrers (never throws)', () => {
    expect(detectSourceFromReferrer('')).toEqual({ source: 'direct' });
    expect(detectSourceFromReferrer('not-a-url')).toEqual({ source: 'direct' });
    // @ts-expect-error guarding the runtime contract against a null referrer
    expect(detectSourceFromReferrer(null)).toEqual({ source: 'direct' });
  });
});

// ---------------------------------------------------------------------------
// mapUtmToSource - the first-party channel map. MUST be additive.
// ---------------------------------------------------------------------------
describe('VITAL attribution - mapUtmToSource prefixed ?ref= channel labels', () => {
  it('maps dir: / roundup: ref labels to "directory"', () => {
    expect(mapUtmToSource(null, null, 'dir:apisguru')).toBe('directory');
    expect(mapUtmToSource(null, null, 'roundup:producthunt')).toBe('directory');
  });

  it('maps partner: / affiliate: ref labels to "partner"', () => {
    expect(mapUtmToSource(null, null, 'partner:substackswap')).toBe('partner');
    expect(mapUtmToSource(null, null, 'affiliate:someone')).toBe('partner');
  });

  it('maps aso: ref label to "aso"', () => {
    expect(mapUtmToSource(null, null, 'aso:appstore')).toBe('aso');
  });

  it('maps crosspromo / quiz / chart-ai-taste ref labels to their buckets', () => {
    expect(mapUtmToSource(null, null, 'crosspromo')).toBe('crosspromo');
    expect(mapUtmToSource(null, null, 'quiz')).toBe('quiz');
    expect(mapUtmToSource(null, null, 'lead:chart-ruler')).toBe('quiz');
    expect(mapUtmToSource(null, null, 'chart-ai-taste')).toBe('chart-ai-taste');
    expect(mapUtmToSource(null, null, 'chart_ai_taste')).toBe('chart-ai-taste');
  });

  it('is case-insensitive on the ref label', () => {
    expect(mapUtmToSource(null, null, 'DIR:BigList')).toBe('directory');
    expect(mapUtmToSource(null, null, '  Partner:X  ')).toBe('partner');
  });

  it('maps grimoire_<hub> ref labels to "grimoire" (the interpretive CTA channel)', () => {
    // The interpretive grimoire free-chart CTAs tag ?ref=grimoire_<hub>. The hub
    // stays readable in first_touch_ref for per-hub slicing; the bucket keeps an
    // internal grimoire -> birth-chart first-touch out of "direct".
    expect(mapUtmToSource(null, null, 'grimoire_aspects')).toBe('grimoire');
    expect(mapUtmToSource(null, null, 'grimoire_placements')).toBe('grimoire');
    expect(mapUtmToSource(null, null, 'grimoire_sign_in_chart')).toBe(
      'grimoire',
    );
    expect(mapUtmToSource(null, null, 'GRIMOIRE_Houses')).toBe('grimoire');
  });
});

describe('VITAL attribution - mapUtmToSource UTM source/medium channels', () => {
  it('maps utm_medium=crosspromo or an *_app source to "crosspromo"', () => {
    expect(mapUtmToSource('seer', 'crosspromo', null)).toBe('crosspromo');
    expect(mapUtmToSource('stardust_app', 'referral', null)).toBe('crosspromo');
  });

  it('maps partner/affiliate/directory/aso/quiz/chart-ai-taste mediums & sources', () => {
    expect(mapUtmToSource(null, 'partner', null)).toBe('partner');
    expect(mapUtmToSource(null, 'affiliate', null)).toBe('partner');
    expect(mapUtmToSource(null, 'directory', null)).toBe('directory');
    expect(mapUtmToSource('roundup', null, null)).toBe('directory');
    expect(mapUtmToSource('aso', null, null)).toBe('aso');
    expect(mapUtmToSource(null, 'quiz', null)).toBe('quiz');
    expect(mapUtmToSource('chart-ai-taste', null, null)).toBe('chart-ai-taste');
    // utm_source=grimoire is the existing convention for both the facts pages
    // and buildSignupChartUrl; bucket it so the high-volume reach surface
    // segments as its own channel instead of "direct".
    expect(mapUtmToSource('grimoire', 'facts', null)).toBe('grimoire');
    expect(mapUtmToSource('grimoire', 'cta', null)).toBe('grimoire');
  });
});

describe('VITAL attribution - mapUtmToSource stays ADDITIVE (the safety contract)', () => {
  it('returns undefined for anything it does not recognise', () => {
    // Critical: an unknown combination must NOT be coerced into a channel, so
    // the referrer-based detection and existing referral behaviour still win.
    expect(mapUtmToSource(undefined, undefined, undefined)).toBeUndefined();
    expect(mapUtmToSource('', '', '')).toBeUndefined();
    expect(mapUtmToSource('newsletter', 'email', null)).toBeUndefined();
    expect(mapUtmToSource('google', 'organic', null)).toBeUndefined();
  });

  it('ignores a BARE referral code (no channel prefix) so ?ref=CODE flows through', () => {
    // ?ref=bwt is a real referral code, not a channel label. mapUtmToSource must
    // not claim it - otherwise the referral loop would be mis-bucketed.
    expect(mapUtmToSource(null, null, 'bwt')).toBeUndefined();
    expect(mapUtmToSource(null, null, 'SUMMER25')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// extractSearchQuery - keyword capture from SEO referrers.
// ---------------------------------------------------------------------------
describe('VITAL attribution - extractSearchQuery', () => {
  it('pulls the q= query from google/bing/duckduckgo', () => {
    expect(
      extractSearchQuery('https://www.google.com/search?q=moon+phase+today'),
    ).toBe('moon phase today');
    expect(
      extractSearchQuery('https://www.bing.com/search?q=birth+chart'),
    ).toBe('birth chart');
  });

  it('pulls the p= query from yahoo', () => {
    expect(extractSearchQuery('https://search.yahoo.com/search?p=tarot')).toBe(
      'tarot',
    );
  });

  it('returns undefined for empty, malformed, or non-search referrers', () => {
    expect(extractSearchQuery('')).toBeUndefined();
    expect(extractSearchQuery('not-a-url')).toBeUndefined();
    expect(extractSearchQuery('https://www.google.com/search')).toBeUndefined();
    expect(extractSearchQuery('https://tiktok.com/@x')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// extractUTMFromURL - reads window.location.search. additive bucket fill.
// ---------------------------------------------------------------------------
describe('VITAL attribution - extractUTMFromURL bucket resolution', () => {
  // jsdom forbids redefining window.location, but it does honour
  // history.replaceState, which updates window.location.search natively.
  function setSearch(search: string) {
    window.history.replaceState(null, '', `/${search}`);
  }

  afterAll(() => {
    window.history.replaceState(null, '', '/');
  });

  it('maps utm_medium=cpc/paid to "paid" and email/social/referral to themselves', () => {
    setSearch('?utm_source=meta&utm_medium=cpc&utm_campaign=launch');
    expect(extractUTMFromURL().source).toBe('paid');

    setSearch('?utm_source=resend&utm_medium=email');
    expect(extractUTMFromURL().source).toBe('email');

    setSearch('?utm_source=ig&utm_medium=social');
    expect(extractUTMFromURL().source).toBe('social');
  });

  it('falls through to the first-party channel map ONLY when medium did not resolve', () => {
    // utm_medium=crosspromo is not one of the legacy cpc/email/social/referral
    // mediums, so the bucket map must fill it.
    setSearch('?utm_source=seer_app&utm_medium=crosspromo');
    expect(extractUTMFromURL().source).toBe('crosspromo');

    // a ?ref= channel label with NO utm_source must still resolve.
    setSearch('?ref=dir:apisguru');
    const out = extractUTMFromURL();
    expect(out.source).toBe('directory');
    expect(out.ref).toBe('dir:apisguru');
  });

  it('does NOT override a legacy paid medium with the bucket map', () => {
    // utm_source=*_app would map to crosspromo, but utm_medium=paid wins first.
    setSearch('?utm_source=seer_app&utm_medium=paid');
    expect(extractUTMFromURL().source).toBe('paid');
  });

  it('leaves source unset when there is no utm_source and no channel ref', () => {
    setSearch('?foo=bar');
    expect(extractUTMFromURL().source).toBeUndefined();
    // a bare referral code is preserved as ref but does NOT set a channel source
    setSearch('?ref=bwt');
    const out = extractUTMFromURL();
    expect(out.source).toBeUndefined();
    expect(out.ref).toBe('bwt');
  });
});

// ---------------------------------------------------------------------------
// Storage round-trip + the tracking payload that hits the DB.
// ---------------------------------------------------------------------------
describe('VITAL attribution - storage and tracking payload', () => {
  beforeEach(() => {
    clearAttribution();
  });

  const SAMPLE: Attribution = {
    source: 'ai',
    medium: 'perplexity',
    campaign: 'launch',
    keyword: 'best astrology app',
    landingPage: '/birth-chart',
    referrer: 'https://www.perplexity.ai/search',
    timestamp: Date.parse('2026-05-25T10:00:00.000Z'),
    ref: 'dir:x',
    utmSource: 'perplexity',
    utmMedium: 'ai',
    utmCampaign: 'launch',
  };

  it('stores and reads back attribution losslessly', () => {
    storeAttribution(SAMPLE);
    expect(getStoredAttribution()).toEqual(SAMPLE);
  });

  it('initializeAttribution returns the existing record and does not overwrite first touch', () => {
    storeAttribution(SAMPLE);
    const result = initializeAttribution();
    // First-touch must be preserved: the stored value is returned unchanged.
    expect(result).toEqual(SAMPLE);
  });

  it('getStoredAttribution returns null when nothing is stored or JSON is corrupt', () => {
    expect(getStoredAttribution()).toBeNull();
    localStorage.setItem('lunary_attribution', '{not valid json');
    expect(getStoredAttribution()).toBeNull();
  });

  it('maps stored attribution onto the exact first_touch_* / utm_* DB keys', () => {
    storeAttribution(SAMPLE);
    expect(getAttributionForTracking()).toEqual({
      first_touch_source: 'ai',
      first_touch_medium: 'perplexity',
      first_touch_campaign: 'launch',
      first_touch_keyword: 'best astrology app',
      first_touch_page: '/birth-chart',
      first_touch_referrer: 'https://www.perplexity.ai/search',
      first_touch_ref: 'dir:x',
      first_touch_at: '2026-05-25T10:00:00.000Z',
      utm_source: 'perplexity',
      utm_medium: 'ai',
      utm_campaign: 'launch',
      utm_term: undefined,
      utm_content: undefined,
    });
  });

  it('getAttributionForTracking returns an empty object when nothing is stored', () => {
    expect(getAttributionForTracking()).toEqual({});
  });

  it('source-predicate helpers reflect the stored bucket', () => {
    storeAttribution({ ...SAMPLE, source: 'seo' });
    expect(isOrganicTraffic()).toBe(true);
    expect(isAiSourced()).toBe(false);
    expect(isSocialTraffic()).toBe(false);

    storeAttribution({ ...SAMPLE, source: 'ai' });
    expect(isAiSourced()).toBe(true);
    expect(isOrganicTraffic()).toBe(false);
  });
});
