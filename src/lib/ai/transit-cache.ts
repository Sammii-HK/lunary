import { CurrentTransitsResponse } from './providers';

type CacheRecord = {
  key: string;
  payload: CurrentTransitsResponse;
  cachedAt: string;
  expiresAt: string; // NEW: TTL support
};

const cacheStore = new Map<string, CacheRecord>();

export const cacheTransits = (
  cacheKey: string,
  payload: CurrentTransitsResponse,
  ttlSeconds: number = 3600, // Default 1 hour
): CacheRecord => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

  const record: CacheRecord = {
    key: cacheKey,
    payload,
    cachedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
  cacheStore.set(cacheKey, record);
  return record;
};

export const getCachedTransits = (
  cacheKey: string,
): CacheRecord | undefined => {
  const record = cacheStore.get(cacheKey);
  if (!record) return undefined;

  // Check if expired
  if (new Date(record.expiresAt) < new Date()) {
    cacheStore.delete(cacheKey);
    return undefined;
  }

  return record;
};

export const listCachedTransits = (): CacheRecord[] =>
  Array.from(cacheStore.values());
