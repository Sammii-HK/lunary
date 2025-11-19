import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/notifications/preferences/route';

jest.mock('@vercel/postgres', () => ({
  sql: jest.fn(),
}));

describe('Notification Preferences API', () => {
  const mockSql = require('@vercel/postgres').sql;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/notifications/preferences', () => {
    it('fetches preferences by endpoint', async () => {
      const mockPreferences = {
        moonPhases: true,
        planetaryTransits: true,
        frequency: 'daily',
      };

      mockSql.mockResolvedValueOnce({
        rows: [
          {
            preferences: mockPreferences,
          },
        ],
      });

      const request = new NextRequest(
        'http://localhost:3000/api/notifications/preferences?endpoint=test-endpoint',
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.preferences).toEqual(mockPreferences);
      expect(mockSql).toHaveBeenCalledWith(expect.stringContaining('endpoint'));
    });

    it('fetches preferences by userId', async () => {
      const mockPreferences = {
        moonPhases: false,
        frequency: 'weekly',
      };

      mockSql.mockResolvedValueOnce({
        rows: [
          {
            preferences: mockPreferences,
          },
        ],
      });

      const request = new NextRequest(
        'http://localhost:3000/api/notifications/preferences?userId=user123',
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.preferences).toEqual(mockPreferences);
    });

    it('returns 400 when neither endpoint nor userId provided', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/notifications/preferences',
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('endpoint or userId required');
    });

    it('returns 404 when subscription not found', async () => {
      mockSql.mockResolvedValueOnce({
        rows: [],
      });

      const request = new NextRequest(
        'http://localhost:3000/api/notifications/preferences?endpoint=nonexistent',
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Subscription not found');
    });
  });

  describe('POST /api/notifications/preferences', () => {
    it('updates preferences by endpoint', async () => {
      const newPreferences = {
        moonPhases: true,
        planetaryTransits: false,
        frequency: 'realtime',
        quietHours: { start: 22, end: 8 },
        maxNotificationsPerDay: 5,
      };

      mockSql.mockResolvedValueOnce({
        rows: [
          {
            endpoint: 'test-endpoint',
            preferences: newPreferences,
          },
        ],
      });

      const request = new NextRequest(
        'http://localhost:3000/api/notifications/preferences',
        {
          method: 'POST',
          body: JSON.stringify({
            endpoint: 'test-endpoint',
            preferences: newPreferences,
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.preferences).toEqual(newPreferences);
      expect(mockSql).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE push_subscriptions'),
      );
    });

    it('updates preferences by userId', async () => {
      const newPreferences = {
        moonPhases: true,
        frequency: 'daily',
      };

      mockSql.mockResolvedValueOnce({
        rows: [
          {
            endpoint: 'endpoint1',
            preferences: newPreferences,
          },
        ],
      });

      const request = new NextRequest(
        'http://localhost:3000/api/notifications/preferences',
        {
          method: 'POST',
          body: JSON.stringify({
            userId: 'user123',
            preferences: newPreferences,
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('returns 400 when preferences missing', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/notifications/preferences',
        {
          method: 'POST',
          body: JSON.stringify({
            endpoint: 'test-endpoint',
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('preferences required');
    });

    it('handles database errors gracefully', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database connection failed'));

      const request = new NextRequest(
        'http://localhost:3000/api/notifications/preferences',
        {
          method: 'POST',
          body: JSON.stringify({
            endpoint: 'test-endpoint',
            preferences: { moonPhases: true },
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update preferences');
    });
  });
});
