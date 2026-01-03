import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/notifications/preferences/route';

jest.mock('@vercel/postgres', () => ({
  sql: jest.fn(),
}));

describe('Notification Preferences API', () => {
  const mockSql = require('@vercel/postgres').sql;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('GET returns 400 when neither endpoint nor userId provided', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/notifications/preferences',
    );
    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it('POST returns 400 when preferences missing', async () => {
    const requestBody = { endpoint: 'test-endpoint' };
    const request = new NextRequest(
      'http://localhost:3000/api/notifications/preferences',
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      },
    ) as any;
    request.json = jest.fn().mockResolvedValue(requestBody);

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('handles database errors gracefully', async () => {
    mockSql.mockRejectedValueOnce(new Error('Database connection failed'));

    const requestBody = {
      endpoint: 'test-endpoint',
      preferences: { moonPhases: true },
    };
    const request = new NextRequest(
      'http://localhost:3000/api/notifications/preferences',
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      },
    ) as any;
    request.json = jest.fn().mockResolvedValue(requestBody);

    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});
