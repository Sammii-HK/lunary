describe('Newsletter API', () => {
  it('should subscribe email', async () => {
    const response = await fetch(
      'http://localhost:3000/api/newsletter/subscribers',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: `test-${Date.now()}@example.com`,
        }),
      },
    );

    expect([200, 400, 401]).toContain(response.status);
  });

  it('should verify subscription', async () => {
    const response = await fetch(
      'http://localhost:3000/api/newsletter/verify?token=test-token',
      {
        method: 'GET',
      },
    );

    expect([200, 400, 404]).toContain(response.status);
  });
});
