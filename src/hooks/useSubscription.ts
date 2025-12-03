'use client';

import { useMemo } from 'react';
import { useUser } from '@/context/UserContext';
import {
  hasFeatureAccess,
  FEATURE_ACCESS,
  normalizePlanType,
} from '../../utils/pricing';

export interface SubscriptionStatus {
  isSubscribed: boolean;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  plan: 'free' | 'monthly' | 'yearly';
  planName?: string;
  status: 'free' | 'trial' | 'active' | 'cancelled' | 'past_due';
  hasAccess: (feature: string) => boolean;
  showUpgradePrompt: boolean;
  customerId?: string;
  subscriptionId?: string;
  loading: boolean;
}

export function useSubscription(): SubscriptionStatus {
  const { user, loading } = useUser();

  return useMemo(() => {
    // Loading state
    if (loading) {
      return {
        isSubscribed: false,
        isTrialActive: false,
        trialDaysRemaining: 0,
        plan: 'free' as const,
        status: 'free' as const,
        hasAccess: () => false,
        showUpgradePrompt: false,
        loading: true,
      };
    }

    // No user or no subscription data
    if (!user) {
      return {
        isSubscribed: false,
        isTrialActive: false,
        trialDaysRemaining: 0,
        plan: 'free' as const,
        status: 'free' as const,
        hasAccess: (feature: string) =>
          hasFeatureAccess('free', undefined, feature),
        showUpgradePrompt: true,
        loading: false,
      };
    }

    const status = (user.subscriptionStatus || 'free') as
      | 'free'
      | 'trial'
      | 'active'
      | 'cancelled'
      | 'past_due';
    const rawPlan = user.subscriptionPlan || 'free';
    const normalizedPlan = normalizePlanType(rawPlan);

    // Determine plan for state (free/monthly/yearly)
    const planForState: 'free' | 'monthly' | 'yearly' =
      normalizedPlan === 'lunary_plus_ai_annual'
        ? 'yearly'
        : normalizedPlan === 'lunary_plus_ai'
          ? 'monthly'
          : normalizedPlan === 'lunary_plus'
            ? 'monthly'
            : rawPlan === 'yearly'
              ? 'yearly'
              : rawPlan === 'monthly'
                ? 'monthly'
                : 'free';

    const isTrialActive = status === 'trial';
    const isSubscribed = status === 'active' || status === 'trial';

    console.log('[useSubscription] State:', {
      status,
      plan: planForState,
      normalizedPlan,
      isSubscribed,
      isPaid: user.isPaid,
    });

    return {
      isSubscribed,
      isTrialActive,
      trialDaysRemaining: isTrialActive ? 7 : 0, // Default, could be calculated from trialEndsAt
      plan: planForState,
      planName: rawPlan,
      status,
      hasAccess: (feature: string) => {
        // If user is paid (active or trial), grant access based on plan
        if (isSubscribed) {
          // Annual plan gets everything
          if (
            normalizedPlan === 'lunary_plus_ai_annual' ||
            rawPlan === 'yearly'
          ) {
            return FEATURE_ACCESS.lunary_plus_ai_annual.includes(feature);
          }
          // Monthly AI plan
          if (normalizedPlan === 'lunary_plus_ai') {
            return FEATURE_ACCESS.lunary_plus_ai.includes(feature);
          }
          // Monthly base plan
          if (normalizedPlan === 'lunary_plus') {
            return FEATURE_ACCESS.lunary_plus.includes(feature);
          }
        }
        // Free user
        return hasFeatureAccess(status, normalizedPlan, feature);
      },
      showUpgradePrompt: !isSubscribed && status !== 'cancelled',
      customerId: user.stripeCustomerId,
      loading: false,
    };
  }, [user, loading]);
}
