const STORAGE_KEY = 'lunary_attribution';

export type AttributionSource =
  | 'seo'
  | 'social'
  | 'email'
  | 'direct'
  | 'referral'
  | 'paid';

export interface Attribution {
  source: AttributionSource;
  medium?: string;
  campaign?: string;
  keyword?: string;
  landingPage: string;
  referrer?: string;
  timestamp: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

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
];

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

    if (hostname.includes('mail') || hostname.includes('outlook')) {
      return { source: 'email', medium: 'webmail' };
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

  if (utmSource) utm.utmSource = utmSource;
  if (utmMedium) utm.utmMedium = utmMedium;
  if (utmCampaign) utm.utmCampaign = utmCampaign;
  if (utmTerm) utm.utmTerm = utmTerm;
  if (utmContent) utm.utmContent = utmContent;

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

export function isSocialTraffic(): boolean {
  const attribution = getStoredAttribution();
  return attribution?.source === 'social';
}
