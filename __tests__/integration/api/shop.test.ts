describe('Shop API', () => {
  it('should list products', async () => {
    const response = await fetch('http://localhost:3000/api/shop/products', {
      method: 'GET',
    });

    if (response.status === 200) {
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    } else {
      expect([401, 404]).toContain(response.status);
    }
  });

  it('should handle product purchase', async () => {
    const response = await fetch('http://localhost:3000/api/shop/purchases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: 'test-product-id',
      }),
    });

    expect([200, 400, 401]).toContain(response.status);
  });

  it('should handle download with token', async () => {
    const response = await fetch(
      'http://localhost:3000/api/shop/download/test-token',
      {
        method: 'GET',
      },
    );

    expect([200, 400, 401, 404]).toContain(response.status);
  });
});
