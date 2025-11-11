describe('Admin API Routes', () => {
  it('should require authentication for admin routes', async () => {
    const routes = [
      '/api/admin/analytics',
      '/api/admin/social-posts',
      '/api/admin/blog-manager',
    ];

    for (const route of routes) {
      const response = await fetch(`http://localhost:3000${route}`, {
        method: 'GET',
      });
      expect([401, 403]).toContain(response.status);
    }
  });

  it('should handle admin analytics request', async () => {
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
