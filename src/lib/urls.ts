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
