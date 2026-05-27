export type UtmParams = {
  source: string;
  medium: string;
  campaign?: string;
  content?: string;
  term?: string;
};

type SignupChartUrlOptions = Partial<UtmParams> & {
  hub?: string;
  location?: string;
  pagePath?: string;
  headline?: string;
  subline?: string;
  funnel?: string;
  birthDate?: string;
  redirect?: string;
};

type LinksUtmOptions = Partial<
  Omit<UtmParams, 'source' | 'medium' | 'content'>
> & {
  source?: string;
  medium?: string;
};

export function buildUtmUrl(
  path: string,
  source: string,
  medium: string = 'social',
  campaign?: string,
  content?: string,
): string {
  const url = new URL(path, 'https://lunary.app');
  url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', medium);
  if (campaign) url.searchParams.set('utm_campaign', campaign);
  if (content) url.searchParams.set('utm_content', content);
  return url.toString();
}

export function buildSignupChartUrl({
  source = 'grimoire',
  medium = 'cta',
  campaign = 'chart_signup',
  content,
  term,
  hub,
  location,
  pagePath,
  headline,
  subline,
  funnel,
  birthDate,
  redirect,
}: SignupChartUrlOptions = {}): string {
  const url = new URL('/signup/chart', 'https://lunary.app');
  const params = url.searchParams;

  params.set('utm_source', source);
  params.set('utm_medium', medium);
  if (campaign) params.set('utm_campaign', campaign);
  if (content || location || hub) {
    params.set('utm_content', content || location || hub || 'chart_signup');
  }
  if (term) params.set('utm_term', term);
  if (hub) params.set('hub', hub);
  if (headline) params.set('headline', headline);
  if (subline) params.set('subline', subline);
  if (location) params.set('location', location);
  if (pagePath) params.set('pagePath', pagePath);
  if (funnel) params.set('funnel', funnel);
  if (birthDate) params.set('birthDate', birthDate);
  if (redirect) params.set('redirect', redirect);

  return `${url.pathname}${url.search}`;
}

export function seoSignupSourceForPath(pathname: string): 'blog' | 'grimoire' {
  return pathname.startsWith('/blog') ? 'blog' : 'grimoire';
}

export function buildLinksUtmUrl(
  path: string,
  content: string,
  options: LinksUtmOptions = {},
): string {
  const isAbsolute = /^[a-z][a-z\d+\-.]*:\/\//i.test(path);
  const url = new URL(path, 'https://lunary.app');
  const utm: UtmParams = {
    source: options.source || 'lunary_links',
    medium: options.medium || 'social_bio',
    campaign: options.campaign || 'link_hub',
    content,
    term: options.term,
  };

  url.searchParams.set('utm_source', utm.source);
  url.searchParams.set('utm_medium', utm.medium);
  if (utm.campaign) url.searchParams.set('utm_campaign', utm.campaign);
  url.searchParams.set('utm_content', content);
  if (utm.term) url.searchParams.set('utm_term', utm.term);

  if (!isAbsolute && url.origin === 'https://lunary.app') {
    return `${url.pathname}${url.search}${url.hash}`;
  }

  return url.toString();
}

export const getImageBaseUrl = (): string => {
  const explicitBaseUrl =
    process.env.LUNARY_IMAGE_BASE_URL ||
    process.env.CONTENT_RENDER_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL;

  const fallbackBaseUrl = process.env.VERCEL
    ? 'https://lunary.app'
    : 'http://localhost:3000';

  const baseUrl = explicitBaseUrl?.trim() || fallbackBaseUrl;
  return baseUrl.replace(/\/+$/, '');
};
