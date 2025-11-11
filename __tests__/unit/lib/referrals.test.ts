import { processReferralCode } from '@/lib/referrals';

const mockSql = jest.fn();

jest.mock('@vercel/postgres', () => ({
  sql: (...args: any[]) => mockSql(...args),
}));

describe('Referrals', () => {
  beforeEach(() => {
    mockSql.mockReset();
  });

  it('should process referral code', async () => {
    mockSql
      .mockResolvedValueOnce({
        rows: [{ user_id: 'referrer-123', uses: 0, max_uses: null }],
      })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const result = await processReferralCode('TESTCODE', 'user-123');
    expect(result).toHaveProperty('success');
    expect(result.success).toBe(true);
  });

  it('should handle invalid referral code', async () => {
    mockSql.mockResolvedValueOnce({ rows: [] });

    const result = await processReferralCode('INVALID', 'user-123');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid referral code');
  });
});
