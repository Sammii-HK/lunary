import {
  markNativeReviewRequested,
  recordNativeReviewSession,
  shouldRequestNativeReviewPrompt,
  type StorageLike,
} from '@/lib/native-review-prompt';

class MemoryStorage implements StorageLike {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const DAY_MS = 24 * 60 * 60 * 1000;

describe('native review prompt', () => {
  const baseContext = (localStorage: StorageLike, now: number) => ({
    pathname: '/app',
    isNativeApp: true,
    isAuthenticated: true,
    isAdminSurface: false,
    isPublicSeoSurface: false,
    now,
    localStorage,
  });

  it('records first seen and only counts one session per app session', () => {
    const localStorage = new MemoryStorage();
    const sessionStorage = new MemoryStorage();

    recordNativeReviewSession(1000, localStorage, sessionStorage);
    recordNativeReviewSession(2000, localStorage, sessionStorage);

    expect(localStorage.getItem('lunary.nativeReview.firstSeenAt')).toBe(
      '1000',
    );
    expect(localStorage.getItem('lunary.nativeReview.sessionCount')).toBe('1');
  });

  it('waits for enough native authenticated app usage before requesting', () => {
    const localStorage = new MemoryStorage();

    recordNativeReviewSession(1000, localStorage, new MemoryStorage());

    expect(
      shouldRequestNativeReviewPrompt(baseContext(localStorage, 1000 + DAY_MS)),
    ).toBe(false);

    recordNativeReviewSession(1000 + DAY_MS, localStorage, new MemoryStorage());

    expect(
      shouldRequestNativeReviewPrompt(
        baseContext(localStorage, 1000 + DAY_MS + 1),
      ),
    ).toBe(true);
  });

  it('does not request on web, public, admin, logged-out, or marketing routes', () => {
    const localStorage = new MemoryStorage();

    recordNativeReviewSession(1000, localStorage, new MemoryStorage());
    recordNativeReviewSession(1000 + DAY_MS, localStorage, new MemoryStorage());

    expect(
      shouldRequestNativeReviewPrompt({
        ...baseContext(localStorage, 1000 + DAY_MS + 1),
        isNativeApp: false,
      }),
    ).toBe(false);
    expect(
      shouldRequestNativeReviewPrompt({
        ...baseContext(localStorage, 1000 + DAY_MS + 1),
        isPublicSeoSurface: true,
      }),
    ).toBe(false);
    expect(
      shouldRequestNativeReviewPrompt({
        ...baseContext(localStorage, 1000 + DAY_MS + 1),
        isAdminSurface: true,
      }),
    ).toBe(false);
    expect(
      shouldRequestNativeReviewPrompt({
        ...baseContext(localStorage, 1000 + DAY_MS + 1),
        isAuthenticated: false,
      }),
    ).toBe(false);
    expect(
      shouldRequestNativeReviewPrompt({
        ...baseContext(localStorage, 1000 + DAY_MS + 1),
        pathname: '/pricing',
      }),
    ).toBe(false);
  });

  it('cooldowns after asking so Google Play users are not spammed', () => {
    const localStorage = new MemoryStorage();
    const requestTime = 1000 + DAY_MS + 1;

    recordNativeReviewSession(1000, localStorage, new MemoryStorage());
    recordNativeReviewSession(1000 + DAY_MS, localStorage, new MemoryStorage());
    markNativeReviewRequested(requestTime, localStorage);

    expect(
      shouldRequestNativeReviewPrompt(baseContext(localStorage, requestTime)),
    ).toBe(false);
    expect(
      shouldRequestNativeReviewPrompt(
        baseContext(localStorage, requestTime + 90 * DAY_MS + 1),
      ),
    ).toBe(true);
  });
});
