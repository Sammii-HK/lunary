import { summarizeEntitlements } from '@/lib/metrics/entitlement-metrics';

describe('summarizeEntitlements', () => {
  it('dedupes per user and sums the highest monthly amounts', () => {
    const entries = [
      { userId: 'user1', subscriptionCount: 2, maxMonthly: 6, hasPaying: true },
      { userId: 'user2', subscriptionCount: 1, maxMonthly: 0, hasPaying: true },
      {
        userId: 'user3',
        subscriptionCount: 1,
        maxMonthly: 3,
        hasPaying: false,
      },
    ];

    const stats = summarizeEntitlements(entries);

    expect(stats).toEqual({
      activeEntitlements: 3,
      duplicateUsers: 1,
      dedupedMrr: 9,
      payingCustomers: 2,
    });
  });
});
