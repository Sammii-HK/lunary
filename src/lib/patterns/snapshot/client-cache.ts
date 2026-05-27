/**
 * Browser-only pattern cache helpers.
 *
 * Keep this separate from snapshot/cache.ts: that module imports database
 * helpers and must never be pulled into public client bundles.
 */
export const ClientCache = {
  getKey: (userId: string, type?: string) => {
    return `lunary_patterns_${userId}${type ? `_${type}` : ''}`;
  },

  get: <T>(key: string, maxAge: number = 3600000): T | null => {
    if (typeof window === 'undefined') return null;

    try {
      const cached = sessionStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      if (age > maxAge) {
        sessionStorage.removeItem(key);
        return null;
      }

      return data as T;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  },

  set: (key: string, data: any): void => {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.setItem(
        key,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        }),
      );
    } catch (error) {
      console.error('Cache write error:', error);
    }
  },

  clear: (key: string): void => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(key);
  },

  clearAll: (userId: string): void => {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(sessionStorage);
    const prefix = `lunary_patterns_${userId}`;

    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        sessionStorage.removeItem(key);
      }
    });
  },
};
