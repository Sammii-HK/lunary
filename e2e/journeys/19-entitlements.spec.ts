import { test, expect } from '../fixtures/auth';

const buildBaseUrl = (baseURL?: string) => baseURL || 'http://localhost:3000';

test.describe('Entitlement Paywall Coverage', () => {
  test('unauthenticated API requests are blocked', async ({
    page,
    baseURL,
  }) => {
    const apiBase = buildBaseUrl(baseURL);

    const responses = await Promise.all([
      page.request.get(`${apiBase}/api/forecast/yearly`, {
        headers: { 'x-test-force-unauth': 'true' },
      }),
      page.request.get(`${apiBase}/api/export/data`, {
        headers: { 'x-test-force-unauth': 'true' },
      }),
      page.request.get(`${apiBase}/api/insights/monthly`, {
        headers: { 'x-test-force-unauth': 'true' },
      }),
      page.request.post(`${apiBase}/api/cosmic-report/generate`, {
        headers: { 'x-test-force-unauth': 'true' },
        data: {
          report_type: 'weekly',
          make_public: false,
        },
      }),
    ]);

    for (const response of responses) {
      expect(response.status()).toBe(401);
    }
  });
});
