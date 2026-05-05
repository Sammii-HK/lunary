const DEFAULT_AUTH_REDIRECT = '/app';

const ALLOWED_AUTH_REDIRECT_PREFIXES = [
  '/app',
  '/horoscope',
  '/tarot',
  '/profile',
  '/collections',
  '/book-of-shadows',
  '/forecast',
  '/community',
  '/guide',
  '/reports',
  '/referrals',
  '/year-in-stars',
];

export function getSafeAuthRedirectPath(
  search: string | URLSearchParams | null | undefined,
): string {
  const params =
    typeof search === 'string'
      ? new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
      : search;

  const requestedPath =
    params?.get('returnTo') || params?.get('redirect') || params?.get('next');

  if (!requestedPath) return DEFAULT_AUTH_REDIRECT;

  const isRelativePath =
    requestedPath.startsWith('/') && !requestedPath.startsWith('//');
  if (!isRelativePath) return DEFAULT_AUTH_REDIRECT;

  let destination: URL;
  try {
    destination = new URL(requestedPath, 'https://lunary.app');
  } catch {
    return DEFAULT_AUTH_REDIRECT;
  }

  const path = destination.pathname;
  const isAllowedPath = ALLOWED_AUTH_REDIRECT_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );

  if (!isAllowedPath) return DEFAULT_AUTH_REDIRECT;

  return `${destination.pathname}${destination.search}${destination.hash}`;
}
