/**
 * @jest-environment node
 */

const sqlMock = jest.fn();

jest.mock('@vercel/postgres', () => ({
  sql: (...args: any[]) => sqlMock(...args),
}));

jest.mock('@/lib/notifications/native-push-sender', () => ({
  sendToUser: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/utils/referrals/reward-processor', () => ({
  processReferralTierReward: jest.fn().mockResolvedValue(undefined),
}));

import { checkInviteActivation } from '@/lib/referrals/check-activation';

describe('checkInviteActivation — anti-gaming guards', () => {
  beforeEach(() => {
    sqlMock.mockReset();
  });

  it('skips activation if no unactivated referral exists', async () => {
    sqlMock.mockResolvedValueOnce({ rows: [] });

    await checkInviteActivation('user-1', 'journal_entry_created');

    // Only 1 SQL call: the referral lookup
    expect(sqlMock).toHaveBeenCalledTimes(1);
  });

  it('skips activation for self-referral', async () => {
    sqlMock.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          referrer_user_id: 'user-1',
          referred_user_id: 'user-1',
        },
      ],
    });

    await checkInviteActivation('user-1', 'journal_entry_created');

    // Only 1 SQL call: the referral lookup
    expect(sqlMock).toHaveBeenCalledTimes(1);
  });

  it('skips activation if account is less than 1 hour old', async () => {
    // 1. Referral found
    sqlMock.mockResolvedValueOnce({
      rows: [
        { id: 1, referrer_user_id: 'referrer-1', referred_user_id: 'user-new' },
      ],
    });
    // 2. User created 5 minutes ago
    sqlMock.mockResolvedValueOnce({
      rows: [{ createdAt: new Date(Date.now() - 5 * 60 * 1000) }],
    });

    await checkInviteActivation('user-new', 'tarot_spread_completed');

    // 2 SQL calls: referral lookup + user createdAt check
    expect(sqlMock).toHaveBeenCalledTimes(2);
  });

  it('skips reward (marks activated) when velocity cap exceeded', async () => {
    // 1. Referral found
    sqlMock.mockResolvedValueOnce({
      rows: [
        { id: 10, referrer_user_id: 'referrer-1', referred_user_id: 'user-4' },
      ],
    });
    // 2. User created 2 hours ago (passes age gate)
    sqlMock.mockResolvedValueOnce({
      rows: [{ createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) }],
    });
    // 3. Velocity check: 3 activations already (cap reached)
    sqlMock.mockResolvedValueOnce({ rows: [{ count: 3 }] });
    // 4. UPDATE to mark activated (no reward)
    sqlMock.mockResolvedValueOnce({ rows: [] });

    await checkInviteActivation('user-4', 'daily_ritual_completed');

    // 4 SQL calls: referral lookup + age check + velocity check + mark activated
    expect(sqlMock).toHaveBeenCalledTimes(4);
  });

  it('skips reward (marks activated) when duplicate IP detected', async () => {
    // 1. Referral found
    sqlMock.mockResolvedValueOnce({
      rows: [
        { id: 20, referrer_user_id: 'referrer-1', referred_user_id: 'user-5' },
      ],
    });
    // 2. User created 3 hours ago (passes age gate)
    sqlMock.mockResolvedValueOnce({
      rows: [{ createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) }],
    });
    // 3. Velocity check: only 1 activation (passes)
    sqlMock.mockResolvedValueOnce({ rows: [{ count: 1 }] });
    // 4. Session lookup: has IP
    sqlMock.mockResolvedValueOnce({ rows: [{ ipAddress: '1.2.3.4' }] });
    // 5. IP dedup check: same IP already used
    sqlMock.mockResolvedValueOnce({ rows: [{ count: 1 }] });
    // 6. UPDATE to mark activated (no reward)
    sqlMock.mockResolvedValueOnce({ rows: [] });

    await checkInviteActivation('user-5', 'journal_entry_created');

    // 6 SQL calls
    expect(sqlMock).toHaveBeenCalledTimes(6);
  });

  it('grants reward when all guards pass', async () => {
    // 1. Referral found
    sqlMock.mockResolvedValueOnce({
      rows: [
        { id: 30, referrer_user_id: 'referrer-1', referred_user_id: 'user-ok' },
      ],
    });
    // 2. User created 5 hours ago (passes age gate)
    sqlMock.mockResolvedValueOnce({
      rows: [{ createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) }],
    });
    // 3. Velocity check: 0 activations (passes)
    sqlMock.mockResolvedValueOnce({ rows: [{ count: 0 }] });
    // 4. Session lookup: has IP
    sqlMock.mockResolvedValueOnce({ rows: [{ ipAddress: '9.8.7.6' }] });
    // 5. IP dedup check: no duplicates
    sqlMock.mockResolvedValueOnce({ rows: [{ count: 0 }] });
    // 6. grantActivationReward for referrer (subscription check)
    sqlMock.mockResolvedValueOnce({ rows: [] });
    // 7. grantActivationReward for referrer (insert subscription)
    sqlMock.mockResolvedValueOnce({ rows: [] });
    // 8. grantActivationReward for referred user (subscription check)
    sqlMock.mockResolvedValueOnce({ rows: [] });
    // 9. grantActivationReward for referred user (insert subscription)
    sqlMock.mockResolvedValueOnce({ rows: [] });
    // 10. Mark as activated with reward
    sqlMock.mockResolvedValueOnce({ rows: [] });

    await checkInviteActivation('user-ok', 'tarot_spread_completed');

    // Should have reached the grant reward + mark activated phase
    // At minimum: 5 guard queries + 4 reward queries + 1 mark activated = 10
    expect(sqlMock.mock.calls.length).toBeGreaterThanOrEqual(10);
  });

  it('grants reward when session has no IP (skips IP dedup)', async () => {
    // 1. Referral found
    sqlMock.mockResolvedValueOnce({
      rows: [
        {
          id: 40,
          referrer_user_id: 'referrer-2',
          referred_user_id: 'user-no-ip',
        },
      ],
    });
    // 2. User created 2 hours ago
    sqlMock.mockResolvedValueOnce({
      rows: [{ createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) }],
    });
    // 3. Velocity check: 0 activations
    sqlMock.mockResolvedValueOnce({ rows: [{ count: 0 }] });
    // 4. Session lookup: no IP (null/undefined)
    sqlMock.mockResolvedValueOnce({ rows: [{ ipAddress: null }] });
    // 5. grantActivationReward for referrer
    sqlMock.mockResolvedValueOnce({ rows: [] });
    sqlMock.mockResolvedValueOnce({ rows: [] });
    // 6. grantActivationReward for referred
    sqlMock.mockResolvedValueOnce({ rows: [] });
    sqlMock.mockResolvedValueOnce({ rows: [] });
    // 7. Mark as activated
    sqlMock.mockResolvedValueOnce({ rows: [] });

    await checkInviteActivation('user-no-ip', 'daily_ritual_completed');

    // IP dedup query should be skipped — no query for count with null IP
    // 4 guard queries + 4 reward queries + 1 mark = 9
    expect(sqlMock.mock.calls.length).toBeGreaterThanOrEqual(9);
  });
});
