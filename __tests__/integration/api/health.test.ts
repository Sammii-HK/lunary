import { GET } from '@/app/api/health/route';

describe('Health API', () => {
  it('should return 200 status', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
  });

  it('should return JSON response', async () => {
    const response = await GET();

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
  });
});
