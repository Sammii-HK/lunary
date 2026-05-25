export type UtmParams = {
  source: string;
  medium: string;
  campaign?: string;
  content?: string;
  term?: string;
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
