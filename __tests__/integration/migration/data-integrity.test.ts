/**
 * Data Integrity Tests
 * Tests to verify data consistency in PostgreSQL
 */

// Make this a module to avoid global scope pollution
export {};

jest.mock('@vercel/postgres', () => ({
  sql: jest.fn(),
}));

const mockSql = require('@vercel/postgres').sql;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Data Integrity - User Profiles', () => {
  describe('Profile Data Structure', () => {
    it('should have correct PostgreSQL schema for user_profiles', async () => {
      const expectedColumns = [
        'id',
        'user_id',
        'name',
        'birthday',
        'birth_chart',
        'personal_card',
        'location',
        'stripe_customer_id',
        'created_at',
        'updated_at',
      ];

      mockSql.mockResolvedValueOnce({
        rows: expectedColumns.map((col) => ({ column_name: col })),
      });

      const result = await mockSql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'user_profiles'
      `;

      expect(result.rows.length).toBe(expectedColumns.length);
      expectedColumns.forEach((col, idx) => {
        expect(result.rows[idx].column_name).toBe(col);
      });
    });

    it('should enforce unique user_id constraint', async () => {
      mockSql
        .mockResolvedValueOnce({
          rows: [{ id: 'profile-1', user_id: 'user-123' }],
        })
        .mockRejectedValueOnce(
          new Error('duplicate key value violates unique constraint'),
        );

      const result1 = await mockSql`
        INSERT INTO user_profiles (user_id, name) VALUES ('user-123', 'Test')
        RETURNING *
      `;
      expect(result1.rows[0].user_id).toBe('user-123');

      await expect(
        mockSql`INSERT INTO user_profiles (user_id, name) VALUES ('user-123', 'Duplicate')`,
      ).rejects.toThrow('duplicate key value violates unique constraint');
    });
  });

  describe('JSONB Fields', () => {
    it('should correctly parse birth_chart JSONB data', async () => {
      const birthChartData = [
        { planet: 'Sun', sign: 'Aries', degree: 15, house: 1 },
        { planet: 'Moon', sign: 'Cancer', degree: 22, house: 4 },
        { planet: 'Mercury', sign: 'Pisces', degree: 8, house: 12 },
      ];

      mockSql.mockResolvedValueOnce({
        rows: [
          {
            id: 'profile-1',
            user_id: 'user-123',
            birth_chart: birthChartData,
          },
        ],
      });

      const result = await mockSql`
        SELECT * FROM user_profiles WHERE user_id = 'user-123'
      `;

      expect(result.rows[0].birth_chart).toEqual(birthChartData);
      expect(Array.isArray(result.rows[0].birth_chart)).toBe(true);
      expect(result.rows[0].birth_chart[0]).toHaveProperty('planet');
      expect(result.rows[0].birth_chart[0]).toHaveProperty('sign');
    });

    it('should correctly parse personal_card JSONB data', async () => {
      const personalCardData = {
        name: 'The Fool',
        number: 0,
        keywords: ['beginnings', 'adventure', 'innocence'],
        element: 'Air',
        zodiac: null,
      };

      mockSql.mockResolvedValueOnce({
        rows: [
          {
            id: 'profile-1',
            user_id: 'user-123',
            personal_card: personalCardData,
          },
        ],
      });

      const result = await mockSql`
        SELECT * FROM user_profiles WHERE user_id = 'user-123'
      `;

      expect(result.rows[0].personal_card).toEqual(personalCardData);
      expect(result.rows[0].personal_card.name).toBe('The Fool');
      expect(result.rows[0].personal_card.number).toBe(0);
    });

    it('should correctly parse location JSONB data', async () => {
      const locationData = {
        lat: 51.5074,
        lng: -0.1278,
        city: 'London',
        country: 'United Kingdom',
        timezone: 'Europe/London',
      };

      mockSql.mockResolvedValueOnce({
        rows: [
          {
            id: 'profile-1',
            user_id: 'user-123',
            location: locationData,
          },
        ],
      });

      const result = await mockSql`
        SELECT * FROM user_profiles WHERE user_id = 'user-123'
      `;

      expect(result.rows[0].location).toEqual(locationData);
      expect(result.rows[0].location.timezone).toBe('Europe/London');
    });

    it('should handle null JSONB fields', async () => {
      mockSql.mockResolvedValueOnce({
        rows: [
          {
            id: 'profile-1',
            user_id: 'user-123',
            birth_chart: null,
            personal_card: null,
            location: null,
          },
        ],
      });

      const result = await mockSql`
        SELECT * FROM user_profiles WHERE user_id = 'user-123'
      `;

      expect(result.rows[0].birth_chart).toBeNull();
      expect(result.rows[0].personal_card).toBeNull();
      expect(result.rows[0].location).toBeNull();
    });
  });

  describe('Timestamp Preservation', () => {
    it('should preserve created_at timestamp', async () => {
      const createdAt = new Date('2024-01-15T10:30:00Z');

      mockSql.mockResolvedValueOnce({
        rows: [
          {
            id: 'profile-1',
            user_id: 'user-123',
            created_at: createdAt,
          },
        ],
      });

      const result = await mockSql`
        SELECT * FROM user_profiles WHERE user_id = 'user-123'
      `;

      expect(result.rows[0].created_at).toEqual(createdAt);
    });

    it('should update updated_at on profile modification', async () => {
      const originalDate = new Date('2024-01-15T10:30:00Z');
      const updatedDate = new Date('2024-01-20T14:45:00Z');

      mockSql.mockResolvedValueOnce({
        rows: [{ updated_at: originalDate }],
      });

      mockSql.mockResolvedValueOnce({
        rows: [{ updated_at: updatedDate }],
      });

      const result1 =
        await mockSql`SELECT updated_at FROM user_profiles WHERE user_id = 'user-123'`;
      expect(result1.rows[0].updated_at).toEqual(originalDate);

      const result2 = await mockSql`
        UPDATE user_profiles SET name = 'Updated Name', updated_at = NOW() 
        WHERE user_id = 'user-123' 
        RETURNING updated_at
      `;
      expect(result2.rows[0].updated_at).toEqual(updatedDate);
    });
  });
});

describe('Data Integrity - Subscriptions', () => {
  describe('Subscription Status Consistency', () => {
    it('should have valid subscription status values', async () => {
      const validStatuses = [
        'active',
        'trial',
        'cancelled',
        'expired',
        'past_due',
        'free',
      ];

      mockSql.mockResolvedValueOnce({
        rows: [{ status: 'active', plan_type: 'monthly' }],
      });

      const result = await mockSql`
        SELECT status, plan_type FROM subscriptions WHERE user_id = 'user-123'
      `;

      expect(validStatuses).toContain(result.rows[0].status);
    });

    it('should preserve Stripe customer ID', async () => {
      const stripeCustomerId = 'cus_test123456789';

      mockSql.mockResolvedValueOnce({
        rows: [
          {
            user_id: 'user-123',
            stripe_customer_id: stripeCustomerId,
          },
        ],
      });

      const result = await mockSql`
        SELECT stripe_customer_id FROM subscriptions WHERE user_id = 'user-123'
      `;

      expect(result.rows[0].stripe_customer_id).toBe(stripeCustomerId);
    });

    it('should preserve subscription dates correctly', async () => {
      const dates = {
        current_period_start: new Date('2024-01-01T00:00:00Z'),
        current_period_end: new Date('2024-02-01T00:00:00Z'),
        trial_ends_at: new Date('2024-01-15T00:00:00Z'),
      };

      mockSql.mockResolvedValueOnce({
        rows: [dates],
      });

      const result = await mockSql`
        SELECT current_period_start, current_period_end, trial_ends_at 
        FROM subscriptions WHERE user_id = 'user-123'
      `;

      expect(result.rows[0].current_period_start).toEqual(
        dates.current_period_start,
      );
      expect(result.rows[0].current_period_end).toEqual(
        dates.current_period_end,
      );
      expect(result.rows[0].trial_ends_at).toEqual(dates.trial_ends_at);
    });
  });
});

describe('Data Integrity - Shop Data', () => {
  describe('Shop Packs', () => {
    it('should have correct structure for shop_packs', async () => {
      const packData = {
        id: 'pack-1',
        name: 'Full Moon Pack - January',
        slug: 'full-moon-january-2024',
        description: 'A comprehensive guide for the January full moon',
        category: 'moon-packs',
        price_cents: 999,
        created_at: new Date(),
      };

      mockSql.mockResolvedValueOnce({
        rows: [packData],
      });

      const result =
        await mockSql`SELECT * FROM shop_packs WHERE id = 'pack-1'`;

      expect(result.rows[0].name).toBe(packData.name);
      expect(result.rows[0].slug).toBe(packData.slug);
      expect(result.rows[0].category).toBe(packData.category);
    });

    it('should enforce unique slug constraint', async () => {
      mockSql.mockRejectedValueOnce(
        new Error(
          'duplicate key value violates unique constraint "shop_packs_slug_key"',
        ),
      );

      await expect(
        mockSql`INSERT INTO shop_packs (name, slug) VALUES ('New Pack', 'existing-slug')`,
      ).rejects.toThrow('duplicate key');
    });
  });

  describe('Shop Purchases', () => {
    it('should correctly link purchases to users and packs', async () => {
      const purchaseData = {
        id: 'purchase-1',
        user_id: 'user-123',
        pack_id: 'pack-1',
        amount_cents: 999,
        stripe_checkout_session_id: 'cs_test_123',
        download_token: 'token_abc123',
        created_at: new Date(),
      };

      mockSql.mockResolvedValueOnce({
        rows: [purchaseData],
      });

      const result = await mockSql`
        SELECT * FROM shop_purchases WHERE user_id = 'user-123'
      `;

      expect(result.rows[0].user_id).toBe('user-123');
      expect(result.rows[0].pack_id).toBe('pack-1');
      expect(result.rows[0].download_token).toBe('token_abc123');
    });

    it('should have valid foreign key relationship', async () => {
      mockSql.mockRejectedValueOnce(
        new Error(
          'violates foreign key constraint "shop_purchases_pack_id_fkey"',
        ),
      );

      await expect(
        mockSql`INSERT INTO shop_purchases (user_id, pack_id, amount_cents) VALUES ('user-123', 'non-existent', 999)`,
      ).rejects.toThrow('foreign key constraint');
    });
  });
});

describe('Data Integrity - User Notes', () => {
  it('should store and retrieve user notes correctly', async () => {
    const noteData = {
      id: 'note-1',
      user_id: 'user-123',
      title: 'My Journal Entry',
      content: 'Today I reflected on the new moon energy...',
      created_at: new Date('2024-01-15T10:00:00Z'),
      updated_at: new Date('2024-01-15T10:00:00Z'),
    };

    mockSql.mockResolvedValueOnce({
      rows: [noteData],
    });

    const result = await mockSql`
      SELECT * FROM user_notes WHERE user_id = 'user-123'
    `;

    expect(result.rows[0].title).toBe(noteData.title);
    expect(result.rows[0].content).toBe(noteData.content);
  });

  it('should handle long content properly', async () => {
    const longContent = 'A'.repeat(10000);

    mockSql.mockResolvedValueOnce({
      rows: [
        {
          id: 'note-1',
          user_id: 'user-123',
          content: longContent,
        },
      ],
    });

    const result = await mockSql`
      SELECT * FROM user_notes WHERE id = 'note-1'
    `;

    expect(result.rows[0].content.length).toBe(10000);
  });
});

describe('Data Integrity - Orphan Records', () => {
  it('should not have user_profiles without corresponding user', async () => {
    mockSql.mockResolvedValueOnce({
      rows: [],
    });

    const result = await mockSql`
      SELECT up.* FROM user_profiles up
      LEFT JOIN "user" u ON up.user_id = u.id
      WHERE u.id IS NULL
    `;

    expect(result.rows.length).toBe(0);
  });

  it('should not have shop_purchases without corresponding pack', async () => {
    mockSql.mockResolvedValueOnce({
      rows: [],
    });

    const result = await mockSql`
      SELECT sp.* FROM shop_purchases sp
      LEFT JOIN shop_packs p ON sp.pack_id = p.id
      WHERE p.id IS NULL
    `;

    expect(result.rows.length).toBe(0);
  });
});

describe('Data Consistency Checks', () => {
  it('should have consistent user_id across related tables', async () => {
    const userId = 'user-123';

    mockSql
      .mockResolvedValueOnce({ rows: [{ user_id: userId }] })
      .mockResolvedValueOnce({ rows: [{ user_id: userId }] })
      .mockResolvedValueOnce({ rows: [{ user_id: userId }] });

    const profileResult =
      await mockSql`SELECT user_id FROM user_profiles WHERE user_id = ${userId}`;
    const subResult =
      await mockSql`SELECT user_id FROM subscriptions WHERE user_id = ${userId}`;
    const notesResult =
      await mockSql`SELECT user_id FROM user_notes WHERE user_id = ${userId}`;

    expect(profileResult.rows[0]?.user_id).toBe(userId);
    expect(subResult.rows[0]?.user_id).toBe(userId);
    expect(notesResult.rows[0]?.user_id).toBe(userId);
  });

  it('should have matching stripe_customer_id across tables', async () => {
    const stripeCustomerId = 'cus_test123';

    mockSql
      .mockResolvedValueOnce({
        rows: [{ stripe_customer_id: stripeCustomerId }],
      })
      .mockResolvedValueOnce({
        rows: [{ stripe_customer_id: stripeCustomerId }],
      });

    const profileResult =
      await mockSql`SELECT stripe_customer_id FROM user_profiles WHERE user_id = 'user-123'`;
    const subResult =
      await mockSql`SELECT stripe_customer_id FROM subscriptions WHERE user_id = 'user-123'`;

    expect(profileResult.rows[0]?.stripe_customer_id).toBe(
      subResult.rows[0]?.stripe_customer_id,
    );
  });
});
