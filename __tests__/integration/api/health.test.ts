import { NextRequest } from 'next/server';
import { GET } from '@/app/api/health/route';

describe('Health API', () => {
  it('should return 200 status', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it('should return JSON response', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
  });
});
