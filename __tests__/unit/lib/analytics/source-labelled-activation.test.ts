import { mapActivationBySourceRows } from '@/lib/analytics/source-labelled-activation';

describe('mapActivationBySourceRows', () => {
  it('normalises source-labelled activation rows for Mini proof joins', () => {
    expect(
      mapActivationBySourceRows([
        {
          source: 'threads',
          medium: 'social',
          campaign: 'lunary_growth',
          content: 'chart_ruler_profile',
          signups: '10',
          activated_24h: '3',
          activated_7d: '5',
          trial_started: '2',
          checkout_started: '1',
          checkout_completed: '1',
          subscription_started: '1',
        },
      ]),
    ).toEqual([
      {
        source: 'threads',
        medium: 'social',
        campaign: 'lunary_growth',
        content: 'chart_ruler_profile',
        signups: 10,
        activated24h: 3,
        activated7d: 5,
        activationRate24h: 30,
        activationRate7d: 50,
        trialStarted: 2,
        checkoutStarted: 1,
        checkoutCompleted: 1,
        subscriptionStarted: 1,
      },
    ]);
  });

  it('falls back missing UTM labels and bad numeric values safely', () => {
    expect(
      mapActivationBySourceRows([
        {
          source: '',
          medium: null,
          signups: 'not-a-number',
          activated_24h: '1',
          activated_7d: '2',
        },
      ]),
    ).toEqual([
      {
        source: 'direct',
        medium: 'unknown',
        campaign: 'unknown',
        content: 'unknown',
        signups: 0,
        activated24h: 1,
        activated7d: 2,
        activationRate24h: 0,
        activationRate7d: 0,
        trialStarted: 0,
        checkoutStarted: 0,
        checkoutCompleted: 0,
        subscriptionStarted: 0,
      },
    ]);
  });
});
