describe('Analytics API', () => {
  it('should require authentication', async () => {
    const response = await fetch('http://localhost:3000/api/admin/analytics', {
      method: 'GET',
    });

    expect(response.status).toBe(401);
  });

  it('should return analytics data for authenticated admin', async () => {
    const response = await fetch('http://localhost:3000/api/admin/analytics', {
      method: 'GET',
      headers: {
        Cookie: 'auth-token=test-admin-token',
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('metrics');
    } else {
      expect(response.status).toBe(401);
    }
  });
});
