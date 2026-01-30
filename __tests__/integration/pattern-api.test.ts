/**
 * Integration tests for pattern API endpoints
 * Tests the full flow from API request to response
 */

import { GET } from '../../src/app/api/patterns/history/route';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/lib/ai/auth', () => ({
  requireUser: jest.fn(),
  UnauthorizedError: class UnauthorizedError extends Error {},
}));

jest.mock('@/lib/patterns/snapshot/cache', () => ({
  getCachedPatternHistory: jest.fn(),
  getCachedCurrentSnapshots: jest.fn(),
}));

import { requireUser } from '@/lib/ai/auth';
import {
  getCachedPatternHistory,
  getCachedCurrentSnapshots,
} from '@/lib/patterns/snapshot/cache';

describe('Pattern API Endpoints', () => {
  const mockUser = { id: 'test-user-123', email: 'test@example.com' };

  beforeEach(() => {
    jest.clearAllMocks();
    (requireUser as jest.Mock).mockResolvedValue(mockUser);
  });

  describe('GET /api/patterns/history', () => {
    it('returns pattern history for authenticated user', async () => {
      const mockPatternData = {
        totalSnapshots: 5,
        byType: [
          { type: 'archetype', count: 2 },
          { type: 'life_themes', count: 3 },
        ],
        snapshots: {
          archetype: [
            {
              type: 'archetype',
              generatedAt: '2025-01-15T00:00:00Z',
              data: {
                dominantArchetype: 'The Visionary',
                archetypes: [
                  { name: 'The Visionary', strength: 42, basedOn: [] },
                ],
                timestamp: '2025-01-15T00:00:00Z',
              },
            },
          ],
          life_themes: [],
        },
      };

      (getCachedPatternHistory as jest.Mock).mockResolvedValue(mockPatternData);

      const request = new NextRequest(
        'http://localhost:3000/api/patterns/history?limit=50',
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.userId).toBe(mockUser.id);
      expect(data.totalSnapshots).toBe(5);
      expect(data.byType).toHaveLength(2);
      expect(data.snapshots).toBeDefined();
      expect(data.cached).toBe(true);
    });

    it('filters by pattern type when specified', async () => {
      const mockPatternData = {
        totalSnapshots: 2,
        byType: [{ type: 'archetype', count: 2 }],
        snapshots: {
          archetype: [
            {
              type: 'archetype',
              generatedAt: '2025-01-15T00:00:00Z',
              data: {
                dominantArchetype: 'The Visionary',
                archetypes: [
                  { name: 'The Visionary', strength: 42, basedOn: [] },
                ],
                timestamp: '2025-01-15T00:00:00Z',
              },
            },
          ],
        },
      };

      (getCachedPatternHistory as jest.Mock).mockResolvedValue(mockPatternData);

      const request = new NextRequest(
        'http://localhost:3000/api/patterns/history?type=archetype&limit=50',
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(getCachedPatternHistory).toHaveBeenCalledWith(
        mockUser.id,
        'archetype',
        50,
      );
    });

    it('respects limit parameter', async () => {
      const mockPatternData = {
        totalSnapshots: 10,
        byType: [{ type: 'archetype', count: 10 }],
        snapshots: { archetype: [] },
      };

      (getCachedPatternHistory as jest.Mock).mockResolvedValue(mockPatternData);

      const request = new NextRequest(
        'http://localhost:3000/api/patterns/history?limit=10',
      );
      const response = await GET(request);

      expect(getCachedPatternHistory).toHaveBeenCalledWith(
        mockUser.id,
        undefined,
        10,
      );
    });

    it('returns current snapshots when current=true', async () => {
      const mockCurrentSnapshots = {
        archetype: {
          type: 'archetype',
          generatedAt: '2025-01-15T00:00:00Z',
          data: {
            dominantArchetype: 'The Visionary',
            archetypes: [{ name: 'The Visionary', strength: 42, basedOn: [] }],
            timestamp: '2025-01-15T00:00:00Z',
          },
        },
        life_themes: {
          type: 'life_themes',
          generatedAt: '2025-01-14T00:00:00Z',
          data: {
            themes: [],
            dominantTheme: 'Growth',
            timestamp: '2025-01-14T00:00:00Z',
          },
        },
      };

      (getCachedCurrentSnapshots as jest.Mock).mockResolvedValue(
        mockCurrentSnapshots,
      );

      const request = new NextRequest(
        'http://localhost:3000/api/patterns/history?current=true',
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.current).toBeDefined();
      expect(data.current.archetype).toBeDefined();
      expect(data.current.life_themes).toBeDefined();
      expect(getCachedCurrentSnapshots).toHaveBeenCalledWith(mockUser.id);
    });

    it('returns 401 for unauthenticated requests', async () => {
      const UnauthorizedError =
        jest.requireMock('@/lib/ai/auth').UnauthorizedError;
      (requireUser as jest.Mock).mockRejectedValue(
        new UnauthorizedError('Not authenticated'),
      );

      const request = new NextRequest(
        'http://localhost:3000/api/patterns/history',
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Please sign in to view patterns');
    });

    it('returns 500 for server errors', async () => {
      (getCachedPatternHistory as jest.Mock).mockRejectedValue(
        new Error('Database connection failed'),
      );

      const request = new NextRequest(
        'http://localhost:3000/api/patterns/history',
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Database connection failed');
    });

    it('handles empty pattern history', async () => {
      const mockEmptyData = {
        totalSnapshots: 0,
        byType: [],
        snapshots: {},
      };

      (getCachedPatternHistory as jest.Mock).mockResolvedValue(mockEmptyData);

      const request = new NextRequest(
        'http://localhost:3000/api/patterns/history',
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.totalSnapshots).toBe(0);
      expect(data.byType).toEqual([]);
    });
  });

  describe('API Response Format', () => {
    it('includes all required fields in response', async () => {
      const mockPatternData = {
        totalSnapshots: 1,
        byType: [{ type: 'archetype', count: 1 }],
        snapshots: {
          archetype: [
            {
              type: 'archetype',
              generatedAt: '2025-01-15T00:00:00Z',
              data: {
                dominantArchetype: 'The Visionary',
                archetypes: [
                  { name: 'The Visionary', strength: 42, basedOn: [] },
                ],
                timestamp: '2025-01-15T00:00:00Z',
              },
            },
          ],
        },
      };

      (getCachedPatternHistory as jest.Mock).mockResolvedValue(mockPatternData);

      const request = new NextRequest(
        'http://localhost:3000/api/patterns/history',
      );
      const response = await GET(request);
      const data = await response.json();

      // Verify response structure
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('userId');
      expect(data).toHaveProperty('totalSnapshots');
      expect(data).toHaveProperty('byType');
      expect(data).toHaveProperty('snapshots');
      expect(data).toHaveProperty('cached');

      // Verify types
      expect(typeof data.success).toBe('boolean');
      expect(typeof data.userId).toBe('string');
      expect(typeof data.totalSnapshots).toBe('number');
      expect(Array.isArray(data.byType)).toBe(true);
      expect(typeof data.snapshots).toBe('object');
    });
  });
});
