const DAY_MS = 24 * 60 * 60 * 1000;

const FIRST_SEEN_KEY = 'lunary.nativeReview.firstSeenAt';
const SESSION_COUNT_KEY = 'lunary.nativeReview.sessionCount';
const SESSION_RECORDED_KEY = 'lunary.nativeReview.sessionRecorded';
const LAST_REQUESTED_KEY = 'lunary.nativeReview.lastRequestedAt';
const REQUEST_COUNT_KEY = 'lunary.nativeReview.requestCount';

const MIN_FIRST_USE_AGE_MS = DAY_MS;
const MIN_SESSIONS = 2;
const REQUEST_COOLDOWN_MS = 90 * DAY_MS;
const MAX_REQUESTS = 3;

const reviewMomentRoutes = [
  '/app',
  '/tarot',
  '/horoscope',
  '/app/birth-chart',
  '/book-of-shadows',
  '/profile',
  '/cosmic-state',
  '/cosmic-report-generator',
  '/guide',
  '/community',
  '/referrals',
];

export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export interface NativeReviewPromptContext {
  pathname: string;
  isNativeApp: boolean;
  isAuthenticated: boolean;
  isAdminSurface: boolean;
  isPublicSeoSurface: boolean;
  now?: number;
  localStorage?: StorageLike | null;
}

const toNumber = (value: string | null) => {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const matchesReviewMomentRoute = (pathname: string) =>
  reviewMomentRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

const getBrowserLocalStorage = () => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const getBrowserSessionStorage = () => {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

const setStoredValue = (
  storage: StorageLike | null,
  key: string,
  value: string,
) => {
  try {
    storage?.setItem(key, value);
  } catch {
    // Storage may be unavailable in embedded/private contexts.
  }
};

const getStoredValue = (storage: StorageLike | null, key: string) => {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

export function recordNativeReviewSession(
  now = Date.now(),
  localStorage = getBrowserLocalStorage(),
  sessionStorage = getBrowserSessionStorage(),
) {
  if (!localStorage || !sessionStorage) return;

  const firstSeenAt = toNumber(getStoredValue(localStorage, FIRST_SEEN_KEY));
  if (!firstSeenAt) {
    setStoredValue(localStorage, FIRST_SEEN_KEY, String(now));
  }

  if (getStoredValue(sessionStorage, SESSION_RECORDED_KEY)) return;

  const sessionCount = toNumber(
    getStoredValue(localStorage, SESSION_COUNT_KEY),
  );
  setStoredValue(localStorage, SESSION_COUNT_KEY, String(sessionCount + 1));
  setStoredValue(sessionStorage, SESSION_RECORDED_KEY, '1');
}

export function shouldRequestNativeReviewPrompt({
  pathname,
  isNativeApp,
  isAuthenticated,
  isAdminSurface,
  isPublicSeoSurface,
  now = Date.now(),
  localStorage = getBrowserLocalStorage(),
}: NativeReviewPromptContext) {
  if (!localStorage) return false;
  if (
    !isNativeApp ||
    !isAuthenticated ||
    isAdminSurface ||
    isPublicSeoSurface
  ) {
    return false;
  }
  if (!matchesReviewMomentRoute(pathname)) return false;

  const firstSeenAt = toNumber(getStoredValue(localStorage, FIRST_SEEN_KEY));
  const sessionCount = toNumber(
    getStoredValue(localStorage, SESSION_COUNT_KEY),
  );
  const lastRequestedAt = toNumber(
    getStoredValue(localStorage, LAST_REQUESTED_KEY),
  );
  const requestCount = toNumber(
    getStoredValue(localStorage, REQUEST_COUNT_KEY),
  );

  if (!firstSeenAt || now - firstSeenAt < MIN_FIRST_USE_AGE_MS) return false;
  if (sessionCount < MIN_SESSIONS) return false;
  if (requestCount >= MAX_REQUESTS) return false;
  if (lastRequestedAt && now - lastRequestedAt < REQUEST_COOLDOWN_MS)
    return false;

  return true;
}

export function markNativeReviewRequested(
  now = Date.now(),
  localStorage = getBrowserLocalStorage(),
) {
  if (!localStorage) return;

  const requestCount = toNumber(
    getStoredValue(localStorage, REQUEST_COUNT_KEY),
  );
  setStoredValue(localStorage, LAST_REQUESTED_KEY, String(now));
  setStoredValue(localStorage, REQUEST_COUNT_KEY, String(requestCount + 1));
}
