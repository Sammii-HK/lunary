/**
 * Tests for pattern caching utilities
 * Verifies client-side cache behavior, expiration, and data integrity
 */

import { ClientCache } from '../src/lib/patterns/snapshot/cache';

describe('Pattern Caching Utilities', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('ClientCache.get/set', () => {
    it('stores and retrieves data from sessionStorage', () => {
      const testData = {
        success: true,
        patterns: [{ id: '1', type: 'archetype' }],
      };
      const key = 'test-cache-key';

      ClientCache.set(key, testData);
      const retrieved = ClientCache.get(key);

      expect(retrieved).toEqual(testData);
    });

    it('returns null for non-existent keys', () => {
      const result = ClientCache.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('respects maxAge parameter', () => {
      const testData = { value: 'test' };
      const key = 'expiring-cache';
      const maxAge = 1000; // 1 second

      ClientCache.set(key, testData);

      // Within maxAge - should return data
      jest.advanceTimersByTime(500);
      expect(ClientCache.get(key, maxAge)).toEqual(testData);

      // After maxAge - should return null
      jest.advanceTimersByTime(600); // Total 1.1 seconds
      expect(ClientCache.get(key, maxAge)).toBeNull();
    });

    it('removes expired cache entries', () => {
      const testData = { value: 'test' };
      const key = 'auto-remove-cache';

      ClientCache.set(key, testData);

      // Advance time past expiration
      jest.advanceTimersByTime(3600000 + 1000); // > 1 hour

      const result = ClientCache.get(key, 3600000);
      expect(result).toBeNull();

      // Verify sessionStorage was cleaned up
      expect(sessionStorage.getItem(key)).toBeNull();
    });

    it('handles corrupted cache data gracefully', () => {
      const key = 'corrupted-cache';

      // Manually insert corrupted data
      sessionStorage.setItem(key, 'invalid-json{]');

      const result = ClientCache.get(key);
      expect(result).toBeNull();
    });

    it('handles sessionStorage being full', () => {
      const key = 'test-key';
      const hugeData = { data: 'x'.repeat(10000000) }; // Very large data

      // Should not throw error even if storage is full
      expect(() => ClientCache.set(key, hugeData)).not.toThrow();
    });
  });

  describe('ClientCache.clear', () => {
    it('removes specific cache entry', () => {
      const key1 = 'cache-1';
      const key2 = 'cache-2';

      ClientCache.set(key1, { data: '1' });
      ClientCache.set(key2, { data: '2' });

      ClientCache.clear(key1);

      expect(ClientCache.get(key1)).toBeNull();
      expect(ClientCache.get(key2)).toEqual({ data: '2' });
    });
  });

  describe('ClientCache.clearAll', () => {
    it('clears all pattern caches for a user', () => {
      const userId = 'user123';

      ClientCache.set(`lunary_patterns_${userId}`, { data: 'all' });
      ClientCache.set(`lunary_patterns_${userId}_archetype`, {
        data: 'archetype',
      });
      ClientCache.set(`lunary_patterns_${userId}_life_themes`, {
        data: 'themes',
      });
      ClientCache.set(`other_cache_${userId}`, { data: 'other' });

      ClientCache.clearAll(userId);

      // All pattern caches should be cleared
      expect(ClientCache.get(`lunary_patterns_${userId}`)).toBeNull();
      expect(ClientCache.get(`lunary_patterns_${userId}_archetype`)).toBeNull();
      expect(
        ClientCache.get(`lunary_patterns_${userId}_life_themes`),
      ).toBeNull();

      // Other caches should remain
      expect(ClientCache.get(`other_cache_${userId}`)).toEqual({
        data: 'other',
      });
    });
  });

  describe('ClientCache.getKey', () => {
    it('generates correct cache keys', () => {
      const userId = 'user123';

      expect(ClientCache.getKey(userId)).toBe('lunary_patterns_user123');
      expect(ClientCache.getKey(userId, 'archetype')).toBe(
        'lunary_patterns_user123_archetype',
      );
      expect(ClientCache.getKey(userId, 'life_themes')).toBe(
        'lunary_patterns_user123_life_themes',
      );
    });
  });

  describe('Cache timestamps', () => {
    it('stores timestamp with cached data', () => {
      const key = 'timestamp-test';
      const testData = { value: 'test' };
      const startTime = Date.now();

      ClientCache.set(key, testData);

      const rawCache = sessionStorage.getItem(key);
      expect(rawCache).not.toBeNull();

      const parsed = JSON.parse(rawCache!);
      expect(parsed).toHaveProperty('data');
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed.data).toEqual(testData);
      expect(parsed.timestamp).toBeGreaterThanOrEqual(startTime);
    });
  });

  describe('Type safety', () => {
    it('preserves data types through cache', () => {
      const key = 'type-test';
      const testData = {
        string: 'hello',
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        object: { nested: 'value' },
        null: null,
      };

      ClientCache.set(key, testData);
      const retrieved = ClientCache.get<typeof testData>(key);

      expect(retrieved).toEqual(testData);
      expect(typeof retrieved?.string).toBe('string');
      expect(typeof retrieved?.number).toBe('number');
      expect(typeof retrieved?.boolean).toBe('boolean');
      expect(Array.isArray(retrieved?.array)).toBe(true);
      expect(typeof retrieved?.object).toBe('object');
    });
  });
});
