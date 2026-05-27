export type ActivationBySourceRow = {
  source?: unknown;
  medium?: unknown;
  campaign?: unknown;
  content?: unknown;
  signups?: unknown;
  activated_24h?: unknown;
  activated_7d?: unknown;
  trial_started?: unknown;
  checkout_started?: unknown;
  checkout_completed?: unknown;
  subscription_started?: unknown;
};

export type SourceLabelledActivation = {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  signups: number;
  activated24h: number;
  activated7d: number;
  activationRate24h: number;
  activationRate7d: number;
  trialStarted: number;
  checkoutStarted: number;
  checkoutCompleted: number;
  subscriptionStarted: number;
};

function asLabel(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : fallback;
}

function asNumber(value: unknown) {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

function rate(count: number, total: number) {
  return total > 0 ? Number(((count / total) * 100).toFixed(2)) : 0;
}

export function mapActivationBySourceRows(
  rows: ActivationBySourceRow[],
): SourceLabelledActivation[] {
  return rows.map((row) => {
    const signups = asNumber(row.signups);
    const activated24h = asNumber(row.activated_24h);
    const activated7d = asNumber(row.activated_7d);
    return {
      source: asLabel(row.source, 'direct'),
      medium: asLabel(row.medium, 'unknown'),
      campaign: asLabel(row.campaign, 'unknown'),
      content: asLabel(row.content, 'unknown'),
      signups,
      activated24h,
      activated7d,
      activationRate24h: rate(activated24h, signups),
      activationRate7d: rate(activated7d, signups),
      trialStarted: asNumber(row.trial_started),
      checkoutStarted: asNumber(row.checkout_started),
      checkoutCompleted: asNumber(row.checkout_completed),
      subscriptionStarted: asNumber(row.subscription_started),
    };
  });
}
