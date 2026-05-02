/**
 * Named-slug resolution for the public "What did the sky look like?"
 * deep-link engine (`/sky/[date]`).
 *
 * Slugs supported:
 *   - today                 → current ISO date
 *   - the-day-i-was-born    → user's birthday (requires session)
 *   - the-eclipse           → nearest eclipse within the past 365 days
 *   - the-equinox           → nearest equinox (past or upcoming, ±200 days)
 *   - the-solstice          → nearest solstice (past or upcoming, ±200 days)
 *
 * Pure utility — no IO, no DB, no fetch. Safe to import from server or
 * client code. Returns an ISO `YYYY-MM-DD` string or `null` when the slug
 * cannot be resolved (e.g. `the-day-i-was-born` without a logged-in user).
 */

const ALLOWED_SLUGS = new Set([
  'today',
  'the-day-i-was-born',
  'the-eclipse',
  'the-equinox',
  'the-solstice',
] as const);

export type NamedSkySlug =
  | 'today'
  | 'the-day-i-was-born'
  | 'the-eclipse'
  | 'the-equinox'
  | 'the-solstice';

export interface ResolveOpts {
  /** ISO YYYY-MM-DD birthday from the current user's profile/session. */
  userBirthday?: string;
  /** Override "now" — useful for tests and SSR caching. */
  now?: Date;
}

/**
 * Hand-curated list of recent + upcoming eclipses (UTC peak dates).
 * Kept short on purpose — the public sky engine just needs a "memorable
 * recent eclipse" anchor for the slug, not a full ephemeris.
 *
 * Source: NASA Eclipse Bulletin canonical dates 2023–2027.
 */
const ECLIPSE_DATES: readonly string[] = [
  '2023-04-20', // Hybrid solar
  '2023-05-05', // Penumbral lunar
  '2023-10-14', // Annular solar (Americas)
  '2023-10-28', // Partial lunar
  '2024-03-25', // Penumbral lunar
  '2024-04-08', // Total solar (North America)
  '2024-09-18', // Partial lunar
  '2024-10-02', // Annular solar
  '2025-03-14', // Total lunar
  '2025-03-29', // Partial solar
  '2025-09-07', // Total lunar
  '2025-09-21', // Partial solar
  '2026-02-17', // Annular solar
  '2026-03-03', // Total lunar
  '2026-08-12', // Total solar
  '2026-08-28', // Partial lunar
  '2027-02-06', // Annular solar
  '2027-08-02', // Total solar (longest of century)
] as const;

/**
 * Equinox & solstice dates (UTC) for ±2 years around 2026. The slug only
 * needs the *nearest* one, so a small window is sufficient. Dates are
 * accurate to within ~24h which is fine for "what did the sky look like".
 */
const SEASONAL_DATES: ReadonlyArray<{
  iso: string;
  kind: 'equinox' | 'solstice';
}> = [
  { iso: '2024-03-20', kind: 'equinox' }, // March equinox
  { iso: '2024-06-20', kind: 'solstice' }, // June solstice
  { iso: '2024-09-22', kind: 'equinox' }, // September equinox
  { iso: '2024-12-21', kind: 'solstice' }, // December solstice
  { iso: '2025-03-20', kind: 'equinox' },
  { iso: '2025-06-21', kind: 'solstice' },
  { iso: '2025-09-22', kind: 'equinox' },
  { iso: '2025-12-21', kind: 'solstice' },
  { iso: '2026-03-20', kind: 'equinox' },
  { iso: '2026-06-21', kind: 'solstice' },
  { iso: '2026-09-23', kind: 'equinox' },
  { iso: '2026-12-21', kind: 'solstice' },
  { iso: '2027-03-20', kind: 'equinox' },
  { iso: '2027-06-21', kind: 'solstice' },
  { iso: '2027-09-23', kind: 'equinox' },
  { iso: '2027-12-22', kind: 'solstice' },
] as const;

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Convert any value to a strict YYYY-MM-DD string, or null. */
function normalizeIsoDate(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  // Accept full ISO datetimes too — keep just the date portion.
  const trimmed = value.trim().slice(0, 10);
  if (!ISO_DATE_RE.test(trimmed)) return null;
  // Sanity: ensure it's a valid calendar date.
  const [y, m, d] = trimmed.split('-').map(Number);
  const probe = new Date(Date.UTC(y, m - 1, d));
  if (
    probe.getUTCFullYear() !== y ||
    probe.getUTCMonth() !== m - 1 ||
    probe.getUTCDate() !== d
  ) {
    return null;
  }
  return trimmed;
}

function isoFromDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function dayDiff(aIso: string, bIso: string): number {
  const a = new Date(`${aIso}T00:00:00Z`).getTime();
  const b = new Date(`${bIso}T00:00:00Z`).getTime();
  return Math.abs(a - b) / 86_400_000;
}

/** Pick the nearest ISO date from a list, preferring the most recent past. */
function nearestPast(
  candidates: readonly string[],
  todayIso: string,
  maxDaysAhead: number,
  maxDaysBehind: number,
): string | null {
  let best: { iso: string; score: number } | null = null;
  const todayMs = new Date(`${todayIso}T00:00:00Z`).getTime();
  for (const iso of candidates) {
    const ms = new Date(`${iso}T00:00:00Z`).getTime();
    const days = (ms - todayMs) / 86_400_000;
    if (days > maxDaysAhead || days < -maxDaysBehind) continue;
    // Prefer past events (lower score = closer & past).
    const score = days < 0 ? -days : days * 1.1;
    if (!best || score < best.score) {
      best = { iso, score };
    }
  }
  return best?.iso ?? null;
}

/** True if this slug requires a logged-in user. */
export function namedSlugRequiresSession(slug: string): boolean {
  return slug === 'the-day-i-was-born';
}

/** True if the value is a valid named slug. */
export function isNamedSlug(value: string): value is NamedSkySlug {
  return ALLOWED_SLUGS.has(value as NamedSkySlug);
}

/** True if the value already looks like a YYYY-MM-DD date. */
export function isIsoDate(value: string): boolean {
  return normalizeIsoDate(value) !== null;
}

/**
 * Resolve a named slug to an ISO date string.
 *
 * Returns `null` when:
 *  - the slug is unknown
 *  - `the-day-i-was-born` is requested without a `userBirthday`
 *  - no eclipse/seasonal anchor falls in the lookup window
 */
export function resolveNamedSlug(
  slug: string,
  opts: ResolveOpts = {},
): string | null {
  if (!isNamedSlug(slug)) return null;

  const now = opts.now ?? new Date();
  const todayIso = isoFromDate(now);

  switch (slug) {
    case 'today':
      return todayIso;

    case 'the-day-i-was-born': {
      const birthday = normalizeIsoDate(opts.userBirthday);
      return birthday;
    }

    case 'the-eclipse':
      return nearestPast(ECLIPSE_DATES, todayIso, 30, 365);

    case 'the-equinox': {
      const equinoxes = SEASONAL_DATES.filter((s) => s.kind === 'equinox').map(
        (s) => s.iso,
      );
      return nearestPast(equinoxes, todayIso, 200, 200);
    }

    case 'the-solstice': {
      const solstices = SEASONAL_DATES.filter((s) => s.kind === 'solstice').map(
        (s) => s.iso,
      );
      return nearestPast(solstices, todayIso, 200, 200);
    }

    default: {
      // Exhaustiveness guard.
      const _exhaustive: never = slug;
      return _exhaustive;
    }
  }
}

/**
 * Convenience: try to resolve any input (ISO date OR named slug) into an
 * ISO date. Returns null when nothing resolves — caller decides whether to
 * 404 or redirect to auth.
 */
export function resolveSkyParam(
  param: string,
  opts: ResolveOpts = {},
): string | null {
  const iso = normalizeIsoDate(param);
  if (iso) return iso;
  return resolveNamedSlug(param, opts);
}

// Re-export helpers used by callers that want to share validation logic.
export { normalizeIsoDate, dayDiff };
