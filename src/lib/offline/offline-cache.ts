/**
 * Offline Cache (IndexedDB)
 *
 * Browser-side cache for app data the user might need while offline:
 * - Natal chart, daily transits, daily horoscope, recent journal, friends list.
 *
 * The runtime app reads/writes via this module; the Service Worker (public/sw.js)
 * handles HTTP-level caching independently. Together they make the PWA usable
 * on flights / Underground / flaky connections.
 *
 * SSR-safe: every method guards `indexedDB` access and returns sensible defaults
 * (null / [] / false) on the server or when IndexedDB is unavailable / errors.
 */

const DB_NAME = 'lunary-offline';
const DB_VERSION = 1;
const STORE_NAME = 'records';

/** Default TTLs (milliseconds) for the standard cache categories. */
export const DEFAULT_TTL = {
  CHART_30_DAYS: 30 * 24 * 60 * 60 * 1000,
  TRANSITS_7_DAYS: 7 * 24 * 60 * 60 * 1000,
  HOROSCOPE_1_DAY: 1 * 24 * 60 * 60 * 1000,
  JOURNAL_7_DAYS: 7 * 24 * 60 * 60 * 1000,
  FRIENDS_1_DAY: 1 * 24 * 60 * 60 * 1000,
} as const;

export type OfflineRecord<T> = {
  key: string;
  value: T;
  expiresAt: number;
  cachedAt: number;
};

/* ---------------- internal: IndexedDB plumbing ---------------- */

function isBrowser(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof indexedDB !== 'undefined' &&
    indexedDB !== null
  );
}

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (!isBrowser()) return Promise.resolve(null);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        // If the connection ever closes (private mode, quota, etc.), reset
        // the cached promise so the next call retries cleanly.
        db.onclose = () => {
          dbPromise = null;
        };
        db.onversionchange = () => {
          db.close();
          dbPromise = null;
        };
        resolve(db);
      };

      request.onerror = () => {
        console.debug('[offline-cache] IndexedDB open error:', request.error);
        dbPromise = null;
        resolve(null);
      };

      request.onblocked = () => {
        console.debug('[offline-cache] IndexedDB open blocked');
        dbPromise = null;
        resolve(null);
      };
    } catch (err) {
      console.debug('[offline-cache] IndexedDB open threw:', err);
      dbPromise = null;
      resolve(null);
    }
  });

  return dbPromise;
}

function tx(db: IDBDatabase, mode: IDBTransactionMode): IDBObjectStore | null {
  try {
    return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
  } catch (err) {
    console.debug('[offline-cache] tx() failed:', err);
    return null;
  }
}

function reqAsPromise<T>(req: IDBRequest<T>): Promise<T | null> {
  return new Promise((resolve) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      console.debug('[offline-cache] request error:', req.error);
      resolve(null);
    };
  });
}

function isExpired(record: OfflineRecord<unknown>): boolean {
  return typeof record.expiresAt !== 'number' || Date.now() > record.expiresAt;
}

/* ---------------- public API ---------------- */

export const offlineCache = {
  /**
   * Get a cached value. Returns `null` if missing, expired, or on any error.
   * Expired records are deleted opportunistically.
   */
  async get<T>(key: string): Promise<T | null> {
    const db = await openDb();
    if (!db) return null;

    const store = tx(db, 'readonly');
    if (!store) return null;

    const record = (await reqAsPromise(store.get(key))) as
      | OfflineRecord<T>
      | undefined
      | null;

    if (!record) return null;
    if (isExpired(record)) {
      // Best-effort cleanup; ignore failures.
      void offlineCache.delete(key);
      return null;
    }
    return record.value;
  },

  /** Set a cached value with a TTL in milliseconds. */
  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    const db = await openDb();
    if (!db) return;

    const store = tx(db, 'readwrite');
    if (!store) return;

    const now = Date.now();
    const record: OfflineRecord<T> = {
      key,
      value,
      cachedAt: now,
      expiresAt: now + Math.max(0, ttlMs),
    };

    await reqAsPromise(store.put(record));
  },

  /** Delete a single cached record. Safe to call when key doesn't exist. */
  async delete(key: string): Promise<void> {
    const db = await openDb();
    if (!db) return;

    const store = tx(db, 'readwrite');
    if (!store) return;

    await reqAsPromise(store.delete(key));
  },

  /** Wipe all cached records. */
  async clear(): Promise<void> {
    const db = await openDb();
    if (!db) return;

    const store = tx(db, 'readwrite');
    if (!store) return;

    await reqAsPromise(store.clear());
  },

  /**
   * Returns true iff there is an unexpired record for `key`.
   * (Equivalent to `(await get(key)) !== null` but avoids deserialising the value.)
   */
  async has(key: string): Promise<boolean> {
    const db = await openDb();
    if (!db) return false;

    const store = tx(db, 'readonly');
    if (!store) return false;

    const record = (await reqAsPromise(store.get(key))) as
      | OfflineRecord<unknown>
      | undefined
      | null;

    if (!record) return false;
    if (isExpired(record)) {
      void offlineCache.delete(key);
      return false;
    }
    return true;
  },

  /**
   * Return all unexpired records, optionally filtered by key prefix.
   * Useful for e.g. enumerating cached daily transits.
   */
  async getAll<T>(prefix?: string): Promise<OfflineRecord<T>[]> {
    const db = await openDb();
    if (!db) return [];

    const store = tx(db, 'readonly');
    if (!store) return [];

    const all = (await reqAsPromise(store.getAll())) as
      | OfflineRecord<T>[]
      | null;

    if (!all) return [];

    const expiredKeys: string[] = [];
    const fresh = all.filter((r) => {
      if (isExpired(r)) {
        expiredKeys.push(r.key);
        return false;
      }
      if (prefix && !r.key.startsWith(prefix)) return false;
      return true;
    });

    // Best-effort cleanup of expired records.
    if (expiredKeys.length > 0) {
      void Promise.all(expiredKeys.map((k) => offlineCache.delete(k)));
    }

    return fresh;
  },
};

/* ---------------- standard cache key map ---------------- */

export const offlineCacheKeys = {
  chart: (userId: string) => `chart:${userId}`,
  transits: (userId: string, dateStr: string) =>
    `transits:${userId}:${dateStr}`,
  horoscope: (userId: string, dateStr: string) =>
    `horoscope:${userId}:${dateStr}`,
  journalRecent: (userId: string) => `journal:${userId}:recent`,
  friends: (userId: string) => `friends:${userId}`,
} as const;

/* ---------------- per-category convenience helpers ---------------- */

/** Cache the user's natal chart for 30 days. */
export async function cacheUserChart(
  userId: string,
  chart: unknown,
): Promise<void> {
  await offlineCache.set(
    offlineCacheKeys.chart(userId),
    chart,
    DEFAULT_TTL.CHART_30_DAYS,
  );
}

export async function getCachedUserChart<T = unknown>(
  userId: string,
): Promise<T | null> {
  return offlineCache.get<T>(offlineCacheKeys.chart(userId));
}

/** Cache one day of computed transits for 7 days. `dateStr` is e.g. `2026-04-24`. */
export async function cacheUserTransits(
  userId: string,
  dateStr: string,
  transits: unknown,
): Promise<void> {
  await offlineCache.set(
    offlineCacheKeys.transits(userId, dateStr),
    transits,
    DEFAULT_TTL.TRANSITS_7_DAYS,
  );
}

export async function getCachedUserTransits<T = unknown>(
  userId: string,
  dateStr: string,
): Promise<T | null> {
  return offlineCache.get<T>(offlineCacheKeys.transits(userId, dateStr));
}

/** Cache the daily horoscope (1 day TTL — a fresh one is generated each day). */
export async function cacheUserHoroscope(
  userId: string,
  dateStr: string,
  horoscope: unknown,
): Promise<void> {
  await offlineCache.set(
    offlineCacheKeys.horoscope(userId, dateStr),
    horoscope,
    DEFAULT_TTL.HOROSCOPE_1_DAY,
  );
}

export async function getCachedUserHoroscope<T = unknown>(
  userId: string,
  dateStr: string,
): Promise<T | null> {
  return offlineCache.get<T>(offlineCacheKeys.horoscope(userId, dateStr));
}

/** Cache the user's last 30 journal entries for 7 days. */
export async function cacheRecentJournal(
  userId: string,
  entries: unknown,
): Promise<void> {
  await offlineCache.set(
    offlineCacheKeys.journalRecent(userId),
    entries,
    DEFAULT_TTL.JOURNAL_7_DAYS,
  );
}

export async function getCachedRecentJournal<T = unknown>(
  userId: string,
): Promise<T | null> {
  return offlineCache.get<T>(offlineCacheKeys.journalRecent(userId));
}

/** Cache the user's friends list for 1 day. */
export async function cacheUserFriends(
  userId: string,
  friends: unknown,
): Promise<void> {
  await offlineCache.set(
    offlineCacheKeys.friends(userId),
    friends,
    DEFAULT_TTL.FRIENDS_1_DAY,
  );
}

export async function getCachedUserFriends<T = unknown>(
  userId: string,
): Promise<T | null> {
  return offlineCache.get<T>(offlineCacheKeys.friends(userId));
}
