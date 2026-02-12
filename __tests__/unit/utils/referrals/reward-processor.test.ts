const mockSql = jest.fn();
const mockSendToUser = jest.fn().mockResolvedValue(undefined);

jest.mock('@vercel/postgres', () => ({
  sql: (...args: unknown[]) => mockSql(...args),
}));

jest.mock('@/lib/notifications/native-push-sender', () => ({
  sendToUser: (...args: unknown[]) => mockSendToUser(...args),
}));

import { processReferralTierReward } from '@/utils/referrals/reward-processor';

function mockActivatedCount(count: number) {
  mockSql.mockResolvedValueOnce({ rows: [{ count }] });
}

function mockRemainingCalls() {
  // grantTierReward internals + UPDATE reward_tier — just resolve them all
  mockSql.mockResolvedValue({ rows: [{ count: 0 }] });
}

describe('processReferralTierReward', () => {
  beforeEach(() => {
    mockSql.mockReset();
    mockSendToUser.mockReset();
    mockSendToUser.mockResolvedValue(undefined);
  });

  it('does nothing when no tier is crossed', async () => {
    mockActivatedCount(2); // 2 activated, previous was 1 — no tier at 2

    await processReferralTierReward('user_1');

    // Only the count query should have been called
    expect(mockSql).toHaveBeenCalledTimes(1);
    expect(mockSendToUser).not.toHaveBeenCalled();
  });

  it('grants Cosmic Seed badge at 1 referral', async () => {
    mockActivatedCount(1);
    mockRemainingCalls();

    await processReferralTierReward('user_1');

    // Should call sql for: count, insertMilestone (badge), UPDATE reward_tier
    expect(mockSql.mock.calls.length).toBeGreaterThanOrEqual(3);

    // Check notification was sent with tier name
    expect(mockSendToUser).toHaveBeenCalledWith(
      'user_1',
      expect.objectContaining({
        title: expect.stringContaining('Cosmic Seed'),
      }),
    );
  });

  it('grants 1 week Pro at 3 referrals', async () => {
    mockActivatedCount(3);
    mockRemainingCalls();

    await processReferralTierReward('user_1');

    expect(mockSendToUser).toHaveBeenCalledWith(
      'user_1',
      expect.objectContaining({
        title: expect.stringContaining('Star Weaver'),
      }),
    );
  });

  it('grants spread + badge at 5 referrals', async () => {
    mockActivatedCount(5);
    mockRemainingCalls();

    await processReferralTierReward('user_1');

    // Should have multiple milestone inserts: spread_houses + cosmic_connector badge
    // count(1) + grantProExtension check(1) + insertMilestone x2 + UPDATE reward_tier(1) = 5+
    expect(mockSql.mock.calls.length).toBeGreaterThanOrEqual(3);
    expect(mockSendToUser).toHaveBeenCalledWith(
      'user_1',
      expect.objectContaining({
        title: expect.stringContaining('Cosmic Connector'),
      }),
    );
  });

  it('grants 1 month Pro + glow at 10 referrals', async () => {
    mockActivatedCount(10);
    mockRemainingCalls();

    await processReferralTierReward('user_1');

    expect(mockSendToUser).toHaveBeenCalledWith(
      'user_1',
      expect.objectContaining({
        title: expect.stringContaining('Celestial Guide'),
      }),
    );
  });

  it('grants Shadow Work spread at 15 referrals', async () => {
    mockActivatedCount(15);
    mockRemainingCalls();

    await processReferralTierReward('user_1');

    expect(mockSendToUser).toHaveBeenCalledWith(
      'user_1',
      expect.objectContaining({
        title: expect.stringContaining('Star Architect'),
      }),
    );
  });

  it('grants 3 months Pro + Galaxy Keeper title at 25 referrals', async () => {
    mockActivatedCount(25);
    mockRemainingCalls();

    await processReferralTierReward('user_1');

    expect(mockSendToUser).toHaveBeenCalledWith(
      'user_1',
      expect.objectContaining({
        title: expect.stringContaining('Galaxy Keeper'),
      }),
    );
  });

  it('grants 6 months Pro + Founding Star at 50 referrals', async () => {
    mockActivatedCount(50);
    mockRemainingCalls();

    await processReferralTierReward('user_1');

    expect(mockSendToUser).toHaveBeenCalledWith(
      'user_1',
      expect.objectContaining({
        title: expect.stringContaining('Founding Star'),
      }),
    );
  });

  it('sends notification with link to referrals page', async () => {
    mockActivatedCount(1);
    mockRemainingCalls();

    await processReferralTierReward('user_1');

    expect(mockSendToUser).toHaveBeenCalledWith(
      'user_1',
      expect.objectContaining({
        data: { type: 'referral_tier', action: '/referrals' },
      }),
    );
  });

  it('does not throw on SQL errors (catches gracefully)', async () => {
    mockSql.mockRejectedValueOnce(new Error('DB connection failed'));

    // Should not throw
    await expect(processReferralTierReward('user_1')).resolves.toBeUndefined();
  });

  it('does not throw when notification fails', async () => {
    mockActivatedCount(1);
    mockRemainingCalls();
    mockSendToUser.mockRejectedValue(new Error('Push failed'));

    await expect(processReferralTierReward('user_1')).resolves.toBeUndefined();
  });

  it('does nothing at 100 referrals (beyond all tiers)', async () => {
    mockActivatedCount(100); // previous was 99, both above highest tier (50)

    await processReferralTierReward('user_1');

    expect(mockSql).toHaveBeenCalledTimes(1); // Only the count query
    expect(mockSendToUser).not.toHaveBeenCalled();
  });
});
