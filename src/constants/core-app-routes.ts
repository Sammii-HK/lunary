export const CORE_APP_ROUTE_PREFIXES = [
  '/app',
  '/guide',
  '/horoscope',
  '/tarot',
  '/collections',
  '/book-of-shadows',
  '/forecast',
  '/profile',
  '/cosmic-state',
  '/moon-circles',
  '/moon-calendar',
];

const escapePrefix = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''")
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');

export function isCoreAppRoute(pathname?: string | null) {
  if (!pathname) return false;
  return CORE_APP_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function buildCoreAppRouteCondition(
  property = 'properties.pathname',
): string {
  if (CORE_APP_ROUTE_PREFIXES.length === 0) {
    return '1=0';
  }

  const clauses = CORE_APP_ROUTE_PREFIXES.map((prefix) => {
    const escaped = escapePrefix(prefix);
    return `(${property} LIKE '${escaped}%' OR ${property} = '${escaped}')`;
  });

  return clauses.join(' OR ');
}
