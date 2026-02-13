/**
 * @jest-environment node
 *
 * Tests for grantActivationReward behavior (tested through checkInviteActivation)
 * and the asymmetric reward model: referrer gets 7 days, referred gets 30 days.
 */

const sqlMock = jest.fn();

jest.mock('@vercel/postgres', () => ({
  sql: (...args: any[]) => sqlMock(...args),
}));

const sendToUserMock = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/notifications/native-push-sender', () => ({
  sendToUser: (...args: any[]) => sendToUserMock(...args),
}));

jest.mock('@/utils/referrals/reward-processor', () => ({
  processReferralTierReward: jest.fn().mockResolvedValue(undefined),
}));

import { checkInviteActivation } from '@/lib/referrals/check-activation';

/**
 * Helper: mock all guards passing (referral found, age ok, velocity ok, IP ok)
 * Returns after IP dedup check — caller adds reward + mark-activated mocks.
 */
function mockGuardsPassing(referrerId = 'referrer-1', referredId = 'user-ok') {
  // 1. Referral found
  sqlMock.mockResolvedValueOnce({
    rows: [
      { id: 1, referrer_user_id: referrerId, referred_user_id: referredId },
    ],
  });
  // 2. User created 5 hours ago (passes age gate)
  sqlMock.mockResolvedValueOnce({
    rows: [{ createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) }],
  });
  // 3. Velocity check: 0 activations
  sqlMock.mockResolvedValueOnce({ rows: [{ count: 0 }] });
  // 4. Session lookup: has IP
  sqlMock.mockResolvedValueOnce({ rows: [{ ipAddress: '10.0.0.1' }] });
  // 5. IP dedup check: no duplicates
  sqlMock.mockResolvedValueOnce({ rows: [{ count: 0 }] });
}

describe('grantActivationReward — asymmetric reward model', () => {
  beforeEach(() => {
    sqlMock.mockReset();
    sendToUserMock.mockClear();
  });

  it('grants 7 days to referrer and 30 days to referred (new subscriptions)', async () => {
    mockGuardsPassing();

    // 6. Referrer subscription check → no existing subscription
    sqlMock.mockResolvedValueOnce({ rows: [] });
    // 7. Referrer: INSERT new trial subscription
    sqlMock.mockResolvedValueOnce({ rows: [] });
    // 8. Referred subscription check → no existing subscription
    sqlMock.mockResolvedValueOnce({ rows: [] });
    // 9. Referred: INSERT new trial subscription
    sqlMock.mockResolvedValueOnce({ rows: [] });
    // 10. Mark as activated
    sqlMock.mockResolvedValueOnce({ rows: [] });
    // 11. Count activated referrals (for tier notification)
    sqlMock.mockResolvedValueOnce({ rows: [{ count: 1 }] });

    await checkInviteActivation('user-ok', 'tarot_spread_completed');

    // Verify the referrer reward INSERT uses '7 days' interval
    const referrerInsertCall = sqlMock.mock.calls[6]; // 7th call (index 6)
    const referrerIntervalArg = referrerInsertCall[1]; // first interpolated value = userId
    // The interval is the 2nd+ interpolated value in the INSERT
    const referrerCallStr = referrerInsertCall[0].join('');
    expect(referrerCallStr).toContain('INSERT INTO subscriptions');

    // Verify the referred reward INSERT uses '30 days' interval
    const referredInsertCall = sqlMock.mock.calls[8]; // 9th call (index 8)
    const referredCallStr = referredInsertCall[0].join('');
    expect(referredCallStr).toContain('INSERT INTO subscriptions');

    // Check interval values passed to SQL: referrer = '7 days', referred = '30 days'
    // The interval is passed as the 2nd argument (index 1) in the INSERT call
    expect(referrerInsertCall[2]).toBe('7 days'); // interval for referrer
    expect(referredInsertCall[2]).toBe('30 days'); // interval for referred
  });

  it('extends existing subscription for referrer (7 days) and referred (30 days)', async () => {
    mockGuardsPassing();

    // 6. Referrer subscription check → HAS existing active subscription
    sqlMock.mockResolvedValueOnce({
      rows: [{ status: 'active', stripe_subscription_id: 'sub_123' }],
    });
    // 7. Referrer: UPDATE current_period_end (extend by 7 days)
    sqlMock.mockResolvedValueOnce({ rows: [] });
    // 8. Referred subscription check → HAS existing trial
    sqlMock.mockResolvedValueOnce({
      rows: [{ status: 'trial', stripe_subscription_id: null }],
    });
    // 9. Referred: UPDATE current_period_end (extend by 30 days)
    sqlMock.mockResolvedValueOnce({ rows: [] });
    // 10. Mark as activated
    sqlMock.mockResolvedValueOnce({ rows: [] });
    // 11. Count activated referrals
    sqlMock.mockResolvedValueOnce({ rows: [{ count: 1 }] });

    await checkInviteActivation('user-ok', 'journal_entry_created');

    // Verify the referrer UPDATE uses '7 days' interval
    const referrerUpdateCall = sqlMock.mock.calls[6]; // 7th call (index 6)
    const referrerUpdateStr = referrerUpdateCall[0].join('');
    expect(referrerUpdateStr).toContain('UPDATE subscriptions');
    expect(referrerUpdateStr).toContain('current_period_end');
    expect(referrerUpdateCall[1]).toBe('7 days'); // interval for referrer

    // Verify the referred UPDATE uses '30 days' interval
    const referredUpdateCall = sqlMock.mock.calls[8]; // 9th call (index 8)
    const referredUpdateStr = referredUpdateCall[0].join('');
    expect(referredUpdateStr).toContain('UPDATE subscriptions');
    expect(referredUpdateCall[1]).toBe('30 days'); // interval for referred
  });

  it('extends active subscription (does not create new trial)', async () => {
    mockGuardsPassing();

    // 6. Referrer has active subscription → extend path
    sqlMock.mockResolvedValueOnce({
      rows: [{ status: 'active', stripe_subscription_id: 'sub_abc' }],
    });
    // 7. UPDATE (extend) — should return immediately after this, no INSERT
    sqlMock.mockResolvedValueOnce({ rows: [] });
    // 8. Referred subscription check → no subscription
    sqlMock.mockResolvedValueOnce({ rows: [] });
    // 9. INSERT new trial for referred
    sqlMock.mockResolvedValueOnce({ rows: [] });
    // 10. Mark activated
    sqlMock.mockResolvedValueOnce({ rows: [] });
    // 11. Count activated
    sqlMock.mockResolvedValueOnce({ rows: [{ count: 1 }] });

    await checkInviteActivation('user-ok', 'daily_ritual_completed');

    // Referrer: subscription found → UPDATE, no INSERT
    const call6 = sqlMock.mock.calls[5]; // subscription check
    const call7 = sqlMock.mock.calls[6]; // UPDATE (extend)
    expect(call6[0].join('')).toContain('SELECT');
    expect(call7[0].join('')).toContain('UPDATE subscriptions');
    expect(call7[0].join('')).toContain('current_period_end');

    // Referred: no subscription → INSERT
    const call9 = sqlMock.mock.calls[8]; // INSERT
    expect(call9[0].join('')).toContain('INSERT INTO subscriptions');
  });

  it('sends push notification with tier tease to referrer', async () => {
    mockGuardsPassing();

    // Reward mocks (both new subscriptions)
    sqlMock.mockResolvedValueOnce({ rows: [] }); // referrer sub check
    sqlMock.mockResolvedValueOnce({ rows: [] }); // referrer insert
    sqlMock.mockResolvedValueOnce({ rows: [] }); // referred sub check
    sqlMock.mockResolvedValueOnce({ rows: [] }); // referred insert
    sqlMock.mockResolvedValueOnce({ rows: [] }); // mark activated
    // Count = 1 → next tier is Star Weaver at 3
    sqlMock.mockResolvedValueOnce({ rows: [{ count: 1 }] });

    await checkInviteActivation('user-ok', 'tarot_spread_completed');

    // Referrer notification should mention bonus week + tier progress
    expect(sendToUserMock).toHaveBeenCalledWith(
      'referrer-1',
      expect.objectContaining({
        title: 'Your referral is active!',
        body: expect.stringContaining('bonus week of Pro'),
      }),
    );

    // Should include tier tease (2 more to Star Weaver)
    const referrerCall = sendToUserMock.mock.calls.find(
      (c: any[]) => c[0] === 'referrer-1',
    );
    expect(referrerCall[1].body).toContain('2 more to unlock Star Weaver');
  });

  it('sends 30-day welcome notification to referred user', async () => {
    mockGuardsPassing();

    sqlMock.mockResolvedValueOnce({ rows: [] });
    sqlMock.mockResolvedValueOnce({ rows: [] });
    sqlMock.mockResolvedValueOnce({ rows: [] });
    sqlMock.mockResolvedValueOnce({ rows: [] });
    sqlMock.mockResolvedValueOnce({ rows: [] });
    sqlMock.mockResolvedValueOnce({ rows: [{ count: 1 }] });

    await checkInviteActivation('user-ok', 'journal_entry_created');

    expect(sendToUserMock).toHaveBeenCalledWith(
      'user-ok',
      expect.objectContaining({
        title: 'Welcome bonus unlocked!',
        body: expect.stringContaining('30 days of Pro'),
      }),
    );
  });
});
