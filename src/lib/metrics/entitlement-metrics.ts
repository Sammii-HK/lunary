export type EntitlementEntry = {
  userId: string;
  subscriptionCount: number;
  maxMonthly: number;
  hasPaying: boolean;
};

export type EntitlementStats = {
  activeEntitlements: number;
  duplicateUsers: number;
  dedupedMrr: number;
  payingCustomers: number;
};

export function summarizeEntitlements(
  entries: EntitlementEntry[],
): EntitlementStats {
  let duplicateUsers = 0;
  let dedupedMrr = 0;
  let payingCustomers = 0;

  for (const entry of entries) {
    if (entry.subscriptionCount > 1) {
      duplicateUsers += 1;
    }

    if (entry.maxMonthly > 0) {
      dedupedMrr += entry.maxMonthly;
    }

    if (entry.hasPaying) {
      payingCustomers += 1;
    }
  }

  return {
    activeEntitlements: entries.length,
    duplicateUsers,
    dedupedMrr,
    payingCustomers,
  };
}
