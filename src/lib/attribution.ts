const STORAGE_KEY = 'lunary_attribution';

export type AttributionSource =
  // Existing buckets (do not reorder/remove — persisted verbatim in user_attribution.first_touch_source)
  | 'seo'
  | 'ai'
  | 'social'
  | 'email'
  | 'direct'
  | 'referral'
  | 'paid'
  // New first-party channel buckets. Without these, the channels below were
  // captured as raw UTM strings but collapsed to direct/referral in first-party
  // attribution, so source labels never segmented in the revenue/activation SQL.
  | 'crosspromo' // owned-app portfolio cross-promo (utm_medium=crosspromo, utm_source=<app>_app)
  | 'directory' // app/dev directories + roundups (?ref=dir:* / roundup:*)
  | 'partner' // partner / affiliate / Substack swaps (?ref=partner:* / affiliate:*, utm_medium=partner)
  | 'aso' // App Store / Play Store listing (?ref=aso:* / utm_source=aso:*)
  | 'chart-ai-taste' // chart AI "taste" lead surface
  | 'quiz'; // quiz funnel (e.g. chart-ruler) warm second click

export interface Attribution {
  source: AttributionSource;
  medium?: string;
  campaign?: string;
  keyword?: string;
  landingPage: string;
  referrer?: string;
  timestamp: number;
  /** Value of the `?ref=` param (referral code OR a prefixed channel label like `dir:apisguru`). */
  ref?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

// AI assistants / answer engines. Checked BEFORE search engines because some
// (e.g. gemini.google.com) contain a search-engine domain and would otherwise be
// mislabelled as seo. This is how the AI-citation channel becomes measurable.
const AI_ENGINES = [
  { domain: 'chatgpt.com', name: 'chatgpt' },
  { domain: 'chat.openai.com', name: 'chatgpt' },
  { domain: 'openai.com', name: 'openai' },
  { domain: 'perplexity.ai', name: 'perplexity' },
  { domain: 'gemini.google.com', name: 'gemini' },
  { domain: 'copilot.microsoft.com', name: 'copilot' },
  { domain: 'claude.ai', name: 'claude' },
];

const SEARCH_ENGINES = [
  { domain: 'google', name: 'google' },
  { domain: 'bing', name: 'bing' },
  { domain: 'yahoo', name: 'yahoo' },
  { domain: 'duckduckgo', name: 'duckduckgo' },
  { domain: 'baidu', name: 'baidu' },
  { domain: 'yandex', name: 'yandex' },
];

const SOCIAL_PLATFORMS = [
  { domain: 'tiktok', name: 'tiktok' },
  { domain: 'instagram', name: 'instagram' },
  { domain: 'facebook', name: 'facebook' },
  { domain: 'twitter', name: 'twitter' },
  { domain: 'x.com', name: 'twitter' },
  { domain: 'linkedin', name: 'linkedin' },
  { domain: 'pinterest', name: 'pinterest' },
  { domain: 'reddit', name: 'reddit' },
  { domain: 'youtube', name: 'youtube' },
  { domain: 'discord', name: 'discord' },
  { domain: 'threads', name: 'threads' },
  { domain: 'bsky.app', name: 'bluesky' },
  { domain: 'bsky.social', name: 'bluesky' },
  { domain: 'mastodon', name: 'mastodon' },
];

/**
 * Map a UTM source/medium pair and a `?ref=` value to a first-party
 * {@link AttributionSource} bucket.
 *
 * This is the keystone that makes the new channels (owned-app cross-promo,
 * directories, partners, ASO, chart-ai-taste, quiz) segment as their own
 * channel instead of collapsing to `direct`/`referral`. It is intentionally
 * additive: it returns `undefined` for anything it does not recognise so the
 * existing referrer-based and medium-based detection still wins, and bare
 * referral codes (`?ref=CODE`) keep flowing through untouched.
 *
 * Conventions (from the external-surfaces + app-portfolio plans):
 *  - `?ref=dir:<name>` / `?ref=roundup:<pub>`        -> directory
 *  - `?ref=partner:<name>` / `?ref=affiliate:<name>` -> partner
 *  - `?ref=aso:<store>`                              -> aso
 *  - `utm_medium=crosspromo` / `utm_source=<app>_app`-> crosspromo
 *  - `utm_medium=partner`                            -> partner
 *  - `utm_source` / medium of `aso`, `quiz`, chart-ai-taste -> matching bucket
 */
export function mapUtmToSource(
  utmSource?: string | null,
  utmMedium?: string | null,
  ref?: string | null,
): AttributionSource | undefined {
  const source = (utmSource || '').toLowerCase().trim();
  const medium = (utmMedium || '').toLowerCase().trim();
  const refValue = (ref || '').toLowerCase().trim();

  // 1) Prefixed `?ref=` channel labels take priority (the canonical convention
  //    for directory/partner/aso reach). Bare codes have no prefix and so are
  //    intentionally ignored here, preserving existing referral behaviour.
  if (refValue) {
    if (refValue.startsWith('dir:') || refValue.startsWith('roundup:')) {
      return 'directory';
    }
    if (refValue.startsWith('partner:') || refValue.startsWith('affiliate:')) {
      return 'partner';
    }
    if (refValue.startsWith('aso:')) {
      return 'aso';
    }
    if (refValue.startsWith('crosspromo')) {
      return 'crosspromo';
    }
    if (
      refValue.startsWith('chart-ai-taste') ||
      refValue.startsWith('chart_ai_taste')
    ) {
      return 'chart-ai-taste';
    }
    if (refValue.startsWith('quiz') || refValue.startsWith('lead:chart-')) {
      return 'quiz';
    }
  }

  // 2) UTM medium / source mapping for the new channels.
  if (medium === 'crosspromo' || source.endsWith('_app')) {
    return 'crosspromo';
  }
  if (medium === 'partner' || medium === 'affiliate') {
    return 'partner';
  }
  if (
    medium === 'directory' ||
    medium === 'dir' ||
    medium === 'roundup' ||
    source === 'directory' ||
    source === 'roundup'
  ) {
    return 'directory';
  }
  if (source === 'aso' || medium === 'aso' || source.startsWith('aso:')) {
    return 'aso';
  }
  if (
    source === 'chart-ai-taste' ||
    source === 'chart_ai_taste' ||
    medium === 'chart-ai-taste'
  ) {
    return 'chart-ai-taste';
  }
  if (source === 'quiz' || medium === 'quiz') {
    return 'quiz';
  }

  return undefined;
}

export function extractSearchQuery(referrer: string): string | undefined {
  if (!referrer) return undefined;

  try {
    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();

    if (hostname.includes('google')) {
      return url.searchParams.get('q') || undefined;
    }
    if (hostname.includes('bing')) {
      return url.searchParams.get('q') || undefined;
    }
    if (hostname.includes('yahoo')) {
      return url.searchParams.get('p') || undefined;
    }
    if (hostname.includes('duckduckgo')) {
      return url.searchParams.get('q') || undefined;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export function detectSourceFromReferrer(referrer: string): {
  source: AttributionSource;
  medium?: string;
} {
  if (!referrer) {
    return { source: 'direct' };
  }

  try {
    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();

    for (const engine of AI_ENGINES) {
      if (hostname.includes(engine.domain)) {
        return { source: 'ai', medium: engine.name };
      }
    }

    // Webmail must be checked BEFORE search engines: hosts like mail.google.com
    // and mail.yahoo.com contain a search-engine substring ('google' / 'yahoo'),
    // so if the search loop ran first they would be mislabelled as organic SEO
    // and the email channel would never be credited. A link clicked inside a
    // webmail client is an email click-through regardless of which provider also
    // runs a search engine. AI engines still win above (gemini.google.com is a
    // bare host with no 'mail' segment), so the AI-before-search invariant holds.
    if (hostname.includes('mail') || hostname.includes('outlook')) {
      return { source: 'email', medium: 'webmail' };
    }

    for (const engine of SEARCH_ENGINES) {
      if (hostname.includes(engine.domain)) {
        return { source: 'seo', medium: engine.name };
      }
    }

    for (const platform of SOCIAL_PLATFORMS) {
      if (hostname.includes(platform.domain)) {
        return { source: 'social', medium: platform.name };
      }
    }

    if (!hostname.includes('lunary')) {
      return { source: 'referral', medium: hostname };
    }
  } catch {
    return { source: 'direct' };
  }

  return { source: 'direct' };
}

export function extractUTMFromURL(): Partial<Attribution> {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const utm: Partial<Attribution> = {};

  const utmSource = params.get('utm_source');
  const utmMedium = params.get('utm_medium');
  const utmCampaign = params.get('utm_campaign');
  const utmTerm = params.get('utm_term');
  const utmContent = params.get('utm_content');
  // `?ref=` is overloaded: it carries either a bare referral code (e.g. ?ref=bwt)
  // or a prefixed channel label (e.g. ?ref=dir:apisguru). We keep the raw value
  // and let mapUtmToSource decide whether it identifies a channel bucket.
  const ref = params.get('ref');

  if (utmSource) utm.utmSource = utmSource;
  if (utmMedium) utm.utmMedium = utmMedium;
  if (utmCampaign) utm.utmCampaign = utmCampaign;
  if (utmTerm) utm.utmTerm = utmTerm;
  if (utmContent) utm.utmContent = utmContent;
  if (ref) utm.ref = ref;

  if (utmSource) {
    if (utmMedium === 'cpc' || utmMedium === 'paid') {
      utm.source = 'paid';
    } else if (utmMedium === 'email') {
      utm.source = 'email';
    } else if (utmMedium === 'social') {
      utm.source = 'social';
    } else if (utmMedium === 'referral') {
      utm.source = 'referral';
    }
    utm.medium = utmMedium || utmSource;
    utm.campaign = utmCampaign || undefined;
  }

  // New first-party channel buckets. Only fills `source` when the existing
  // medium-based mapping above did not already resolve one, so existing
  // paid/email/social/referral attribution is never overridden. Also runs when
  // there is a `?ref=` channel label but no utm_source at all.
  if (!utm.source) {
    const bucket = mapUtmToSource(utmSource, utmMedium, ref);
    if (bucket) {
      utm.source = bucket;
      if (!utm.medium) {
        utm.medium = utmMedium || utmSource || ref || undefined;
      }
      if (!utm.campaign) {
        utm.campaign = utmCampaign || undefined;
      }
    }
  }

  return utm;
}

export function captureAttribution(): Attribution | null {
  if (typeof window === 'undefined') return null;

  const referrer = document.referrer || '';
  const landingPage = window.location.pathname + window.location.search;

  const utmData = extractUTMFromURL();
  const referrerData = detectSourceFromReferrer(referrer);
  const searchQuery = extractSearchQuery(referrer);

  const attribution: Attribution = {
    source: utmData.source || referrerData.source,
    medium: utmData.medium || referrerData.medium,
    campaign: utmData.campaign,
    keyword: utmData.utmTerm || searchQuery,
    landingPage,
    referrer: referrer || undefined,
    timestamp: Date.now(),
    ref: utmData.ref,
    utmSource: utmData.utmSource,
    utmMedium: utmData.utmMedium,
    utmCampaign: utmData.utmCampaign,
    utmTerm: utmData.utmTerm,
    utmContent: utmData.utmContent,
  };

  return attribution;
}

export function getStoredAttribution(): Attribution | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Attribution;
    }
  } catch {
    return null;
  }

  return null;
}

export function storeAttribution(attribution: Attribution): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // localStorage not available
  }
}

export function initializeAttribution(): Attribution | null {
  if (typeof window === 'undefined') return null;

  const existing = getStoredAttribution();
  if (existing) {
    return existing;
  }

  const newAttribution = captureAttribution();
  if (newAttribution) {
    storeAttribution(newAttribution);
    return newAttribution;
  }

  return null;
}

export function clearAttribution(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage not available
  }
}

export function getAttributionForTracking(): Record<
  string,
  string | undefined
> {
  const attribution = getStoredAttribution();
  if (!attribution) return {};

  return {
    first_touch_source: attribution.source,
    first_touch_medium: attribution.medium,
    first_touch_campaign: attribution.campaign,
    first_touch_keyword: attribution.keyword,
    first_touch_page: attribution.landingPage,
    first_touch_referrer: attribution.referrer,
    first_touch_ref: attribution.ref,
    first_touch_at: new Date(attribution.timestamp).toISOString(),
    utm_source: attribution.utmSource,
    utm_medium: attribution.utmMedium,
    utm_campaign: attribution.utmCampaign,
    utm_term: attribution.utmTerm,
    utm_content: attribution.utmContent,
  };
}

export function isOrganicTraffic(): boolean {
  const attribution = getStoredAttribution();
  return attribution?.source === 'seo';
}

export function isAiSourced(): boolean {
  const attribution = getStoredAttribution();
  return attribution?.source === 'ai';
}

export function isSocialTraffic(): boolean {
  const attribution = getStoredAttribution();
  return attribution?.source === 'social';
}
