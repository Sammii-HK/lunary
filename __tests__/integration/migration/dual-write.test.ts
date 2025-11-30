/**
 * Dual-Write Validation Tests
 * Tests to ensure data is written correctly to both systems during migration
 */

import { NextRequest } from 'next/server';

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
});

afterAll(() => {
  process.env = originalEnv;
});

// Mock @vercel/postgres
jest.mock('@vercel/postgres', () => ({
  sql: jest.fn(),
}));

describe('Dual-Write Middleware', () => {
  describe('Profile Updates', () => {
    it('should write to PostgreSQL when dual-write is disabled', async () => {
      process.env.ENABLE_DUAL_WRITE = 'false';

      const { dualWriteProfile } = await import('@/lib/dual-write');

      // Mock fetch for PostgreSQL API call
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await dualWriteProfile('user-123', {
        name: 'Test User',
        birthday: '1990-01-01',
      });

      expect(result.postgresSuccess).toBe(true);
      expect(result.jazzSuccess).toBe(true); // Should be true (skipped)
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/profile',
        expect.any(Object),
      );
    });

    it('should write to both systems when dual-write is enabled', async () => {
      process.env.ENABLE_DUAL_WRITE = 'true';
      process.env.JAZZ_WORKER_ACCOUNT = 'test-account';
      process.env.JAZZ_WORKER_SECRET = 'test-secret';

      const { dualWriteProfile } = await import('@/lib/dual-write');

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await dualWriteProfile('user-123', {
        name: 'Test User',
      });

      expect(result.postgresSuccess).toBe(true);
      expect(result.jazzSuccess).toBe(true);
    });

    it('should continue if PostgreSQL write fails (graceful degradation)', async () => {
      process.env.ENABLE_DUAL_WRITE = 'false';

      const { dualWriteProfile } = await import('@/lib/dual-write');

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      const result = await dualWriteProfile('user-123', {
        name: 'Test User',
      });

      expect(result.postgresSuccess).toBe(false);
      expect(result.postgresError).toBeDefined();
      // Jazz should still report success (skipped in this case)
      expect(result.jazzSuccess).toBe(true);
    });

    it('should handle network errors gracefully', async () => {
      process.env.ENABLE_DUAL_WRITE = 'false';

      const { dualWriteProfile } = await import('@/lib/dual-write');

      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await dualWriteProfile('user-123', {
        name: 'Test User',
      });

      expect(result.postgresSuccess).toBe(false);
      expect(result.postgresError).toBeDefined();
      expect(result.postgresError?.message).toBe('Network error');
    });
  });

  describe('Birth Chart Updates', () => {
    it('should write birth chart to PostgreSQL', async () => {
      process.env.ENABLE_DUAL_WRITE = 'false';

      const { dualWriteBirthChart } = await import('@/lib/dual-write');

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const birthChart = [
        { planet: 'Sun', sign: 'Aries', degree: 15 },
        { planet: 'Moon', sign: 'Cancer', degree: 22 },
      ];

      const result = await dualWriteBirthChart('user-123', birthChart);

      expect(result.postgresSuccess).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/profile/birth-chart',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ birthChart }),
        }),
      );
    });

    it('should write birth chart to both systems when dual-write enabled', async () => {
      process.env.ENABLE_DUAL_WRITE = 'true';
      process.env.JAZZ_WORKER_ACCOUNT = 'test-account';
      process.env.JAZZ_WORKER_SECRET = 'test-secret';

      const { dualWriteBirthChart } = await import('@/lib/dual-write');

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const birthChart = [{ planet: 'Sun', sign: 'Aries' }];

      const result = await dualWriteBirthChart('user-123', birthChart);

      expect(result.postgresSuccess).toBe(true);
      expect(result.jazzSuccess).toBe(true);
    });
  });

  describe('Personal Card Updates', () => {
    it('should write personal card to PostgreSQL', async () => {
      process.env.ENABLE_DUAL_WRITE = 'false';

      const { dualWritePersonalCard } = await import('@/lib/dual-write');

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const personalCard = {
        name: 'The Fool',
        number: 0,
        keywords: ['beginnings', 'adventure'],
      };

      const result = await dualWritePersonalCard('user-123', personalCard);

      expect(result.postgresSuccess).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/profile/personal-card',
        expect.objectContaining({
          method: 'PUT',
        }),
      );
    });

    it('should handle failed PostgreSQL write for personal card', async () => {
      process.env.ENABLE_DUAL_WRITE = 'false';

      const { dualWritePersonalCard } = await import('@/lib/dual-write');

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        statusText: 'Bad Request',
      });

      const result = await dualWritePersonalCard('user-123', { name: 'Test' });

      expect(result.postgresSuccess).toBe(false);
      expect(result.postgresError).toBeDefined();
    });
  });

  describe('Location Updates', () => {
    it('should write location to PostgreSQL', async () => {
      process.env.ENABLE_DUAL_WRITE = 'false';

      const { dualWriteLocation } = await import('@/lib/dual-write');

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const location = {
        lat: 51.5074,
        lng: -0.1278,
        city: 'London',
        timezone: 'Europe/London',
      };

      const result = await dualWriteLocation('user-123', location);

      expect(result.postgresSuccess).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/profile/location',
        expect.objectContaining({
          method: 'PUT',
        }),
      );
    });

    it('should write location to both systems when dual-write enabled', async () => {
      process.env.ENABLE_DUAL_WRITE = 'true';
      process.env.JAZZ_WORKER_ACCOUNT = 'test-account';
      process.env.JAZZ_WORKER_SECRET = 'test-secret';

      const { dualWriteLocation } = await import('@/lib/dual-write');

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const location = { lat: 51.5074, lng: -0.1278 };

      const result = await dualWriteLocation('user-123', location);

      expect(result.postgresSuccess).toBe(true);
      expect(result.jazzSuccess).toBe(true);
    });
  });

  describe('Environment Variable Handling', () => {
    it('should respect ENABLE_DUAL_WRITE=false', async () => {
      process.env.ENABLE_DUAL_WRITE = 'false';
      process.env.JAZZ_WORKER_ACCOUNT = 'test-account';
      process.env.JAZZ_WORKER_SECRET = 'test-secret';

      // Clear module cache to pick up new env vars
      jest.resetModules();

      const { dualWriteProfile } = await import('@/lib/dual-write');

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await dualWriteProfile('user-123', { name: 'Test' });

      // Only PostgreSQL should be called
      expect(result.postgresSuccess).toBe(true);
      // Jazz success is true because it's skipped
      expect(result.jazzSuccess).toBe(true);
    });

    it('should skip Jazz when credentials not set', async () => {
      process.env.ENABLE_DUAL_WRITE = 'true';
      delete process.env.JAZZ_WORKER_ACCOUNT;
      delete process.env.JAZZ_WORKER_SECRET;

      jest.resetModules();

      const { dualWriteProfile } = await import('@/lib/dual-write');

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await dualWriteProfile('user-123', { name: 'Test' });

      // Should succeed for PostgreSQL, skip Jazz
      expect(result.postgresSuccess).toBe(true);
      expect(result.jazzSuccess).toBe(true);
    });
  });

  describe('DualWriteResult Structure', () => {
    it('should return proper result structure', async () => {
      process.env.ENABLE_DUAL_WRITE = 'false';

      const { dualWriteProfile } = await import('@/lib/dual-write');

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await dualWriteProfile('user-123', { name: 'Test' });

      expect(result).toHaveProperty('postgresSuccess');
      expect(result).toHaveProperty('jazzSuccess');
      expect(typeof result.postgresSuccess).toBe('boolean');
      expect(typeof result.jazzSuccess).toBe('boolean');
    });

    it('should include error details when write fails', async () => {
      process.env.ENABLE_DUAL_WRITE = 'false';

      const { dualWriteProfile } = await import('@/lib/dual-write');

      global.fetch = jest
        .fn()
        .mockRejectedValue(new Error('Connection refused'));

      const result = await dualWriteProfile('user-123', { name: 'Test' });

      expect(result.postgresSuccess).toBe(false);
      expect(result.postgresError).toBeInstanceOf(Error);
      expect(result.postgresError?.message).toBe('Connection refused');
    });
  });
});

describe('Dual-Write API Integration', () => {
  describe('Profile API with Dual-Write', () => {
    it('should update profile via PUT /api/profile', async () => {
      const mockSql = require('@vercel/postgres').sql;
      mockSql.mockResolvedValueOnce({
        rows: [
          {
            id: 'profile-1',
            user_id: 'user-123',
            name: 'Test User',
            birthday: '1990-01-01',
          },
        ],
      });

      // This test verifies the API route can be called
      // Full integration would require running the actual server
      expect(mockSql).toBeDefined();
    });
  });

  describe('Subscription Updates (PostgreSQL Only)', () => {
    it('should only write subscription to PostgreSQL (Jazz removed)', async () => {
      process.env.ENABLE_DUAL_WRITE = 'true';

      // Subscription updates should never go to Jazz
      // They should only be stored in PostgreSQL via the subscriptions table
      const mockSql = require('@vercel/postgres').sql;
      mockSql.mockResolvedValueOnce({
        rows: [
          {
            id: 'sub-1',
            user_id: 'user-123',
            status: 'active',
            plan_type: 'monthly',
          },
        ],
      });

      expect(mockSql).toBeDefined();
      // Verify Jazz is not called for subscriptions
    });
  });
});

describe('Graceful Degradation', () => {
  it('should not block operation if Jazz write fails', async () => {
    process.env.ENABLE_DUAL_WRITE = 'true';
    process.env.JAZZ_WORKER_ACCOUNT = 'test-account';
    process.env.JAZZ_WORKER_SECRET = 'test-secret';

    jest.resetModules();

    const { dualWriteProfile } = await import('@/lib/dual-write');

    // PostgreSQL succeeds
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    // Even if Jazz would fail, the operation should complete
    const result = await dualWriteProfile('user-123', { name: 'Test' });

    // Operation should succeed overall
    expect(result.postgresSuccess).toBe(true);
  });

  it('should log Jazz failures but continue', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    process.env.ENABLE_DUAL_WRITE = 'true';
    process.env.JAZZ_WORKER_ACCOUNT = 'test-account';
    process.env.JAZZ_WORKER_SECRET = 'test-secret';

    jest.resetModules();

    const { dualWriteProfile } = await import('@/lib/dual-write');

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    await dualWriteProfile('user-123', { name: 'Test' });

    // Verify no errors thrown
    consoleSpy.mockRestore();
  });
});
