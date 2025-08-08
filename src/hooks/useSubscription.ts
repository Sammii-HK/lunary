'use client';

import { useAccount } from 'jazz-tools/react';
import { MyAppAccount } from '../../schema';
import {
  hasFeatureAccess,
  FEATURE_ACCESS,
  getTrialDaysRemaining,
} from '../../utils/pricing';

export interface SubscriptionStatus {
  isSubscribed: boolean;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  plan: 'free' | 'monthly' | 'yearly';
  status: 'free' | 'trial' | 'active' | 'cancelled' | 'past_due';
  hasAccess: (feature: keyof typeof FEATURE_ACCESS) => boolean;
  showUpgradePrompt: boolean;
}

export function useSubscription(): SubscriptionStatus {
  // Default free state
  const defaultState: SubscriptionStatus = {
    isSubscribed: false,
    isTrialActive: false,
    trialDaysRemaining: 0,
    plan: 'free',
    status: 'free',
    hasAccess: (feature) => hasFeatureAccess(feature, 'free'),
    showUpgradePrompt: true,
  };

  // Always call useAccount hook (required by React Hook rules)
  let me;
  try {
    const result = useAccount();
    me = result.me;
  } catch (error) {
    // Jazz provider not available, return default state
    console.warn(
      'Jazz provider not available, using default subscription state',
    );
    return defaultState;
  }

  if (!me?.profile) {
    console.log('useSubscription: No profile found');
    return defaultState;
  }

  const subscription = (me.profile as any).subscription;
  console.log('useSubscription: Profile found, subscription:', subscription);

  if (!subscription) {
    console.log(
      'useSubscription: No subscription in profile, returning default state',
    );
    return defaultState;
  }

  const status = subscription.status || 'free';
  const plan = subscription.plan || 'free';

  console.log(
    'useSubscription: Found subscription with status:',
    status,
    'plan:',
    plan,
  );

  // Check if trial is active
  const isTrialActive =
    status === 'trial' && subscription.trialEndsAt
      ? new Date(subscription.trialEndsAt) > new Date()
      : false;

  const trialDaysRemaining = subscription.trialEndsAt
    ? getTrialDaysRemaining(subscription.trialEndsAt)
    : 0;

  const isSubscribed = status === 'active' || isTrialActive;

  const finalResult = {
    isSubscribed,
    isTrialActive,
    trialDaysRemaining,
    plan: plan as 'free' | 'monthly' | 'yearly',
    status: status as 'free' | 'trial' | 'active' | 'cancelled' | 'past_due',
    hasAccess: (feature: any) => hasFeatureAccess(feature, plan),
    showUpgradePrompt: !isSubscribed && status !== 'cancelled',
  };

  console.log('useSubscription final result:', finalResult);
  return finalResult;
}
