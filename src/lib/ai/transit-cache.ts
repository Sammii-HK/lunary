import { CurrentTransitsResponse } from './providers';

type CacheRecord = {
  key: string;
  payload: CurrentTransitsResponse;
  cachedAt: string;
};

const cacheStore = new Map<string, CacheRecord>();

export const cacheTransits = (
  cacheKey: string,
  payload: CurrentTransitsResponse,
): CacheRecord => {
  const record: CacheRecord = {
    key: cacheKey,
    payload,
    cachedAt: new Date().toISOString(),
  };
  cacheStore.set(cacheKey, record);
  return record;
};

export const getCachedTransits = (cacheKey: string): CacheRecord | undefined =>
  cacheStore.get(cacheKey);

export const listCachedTransits = (): CacheRecord[] =>
  Array.from(cacheStore.values());
