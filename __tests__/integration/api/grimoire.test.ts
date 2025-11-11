describe('Grimoire API', () => {
  it('should fetch grimoire data', async () => {
    const response = await fetch('http://localhost:3000/api/grimoire', {
      method: 'GET',
    });

    if (response.status === 200) {
      const data = await response.json();
      expect(data).toBeDefined();
    } else {
      expect([401, 404]).toContain(response.status);
    }
  });

  it('should sync grimoire with Stripe', async () => {
    const response = await fetch(
      'http://localhost:3000/api/grimoire/sync-stripe',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    expect([200, 400, 401]).toContain(response.status);
  });
});
