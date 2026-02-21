export function buildUtmUrl(
  path: string,
  source: string,
  medium: string = 'social',
  campaign?: string,
): string {
  const url = new URL(path, 'https://lunary.app');
  url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', medium);
  if (campaign) url.searchParams.set('utm_campaign', campaign);
  return url.toString();
}

export const getImageBaseUrl = (): string => {
  const explicitBaseUrl =
    process.env.LUNARY_IMAGE_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL;

  const fallbackBaseUrl = process.env.VERCEL
    ? 'https://lunary.app'
    : 'http://localhost:3000';

  const baseUrl = explicitBaseUrl?.trim() || fallbackBaseUrl;
  return baseUrl.replace(/\/+$/, '');
};
