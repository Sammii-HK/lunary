'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  planName?: string;
  status: 'free' | 'trial' | 'active' | 'cancelled' | 'past_due';
  hasAccess: (feature: keyof typeof FEATURE_ACCESS) => boolean;
  showUpgradePrompt: boolean;
  customerId?: string;
  subscriptionId?: string;
  loading: boolean;
}

export function useSubscription(): SubscriptionStatus {
  const defaultState: SubscriptionStatus = useMemo(
    () => ({
      isSubscribed: false,
      isTrialActive: false,
      trialDaysRemaining: 0,
      plan: 'free',
      status: 'free',
      hasAccess: (feature) => hasFeatureAccess(feature, 'free'),
      showUpgradePrompt: true,
      loading: false,
    }),
    [],
  );

  const [subscriptionState, setSubscriptionState] =
    useState<SubscriptionStatus>(defaultState);
  const hasCheckedStripeRef = useRef<string | null>(null);

  let me: any;
  let hasJazzProvider = true;
  try {
    const result = useAccount();
    me = result.me;
  } catch (error) {
    console.warn(
      'Jazz provider not available, using default subscription state',
    );
    hasJazzProvider = false;
  }

  const getCustomerId = useCallback((): string | null => {
    if (!me?.profile) return null;

    const profileCustomerId = (me.profile as any)?.stripeCustomerId;
    if (profileCustomerId) {
      return profileCustomerId;
    }

    const profileSubscription = (me.profile as any)?.subscription;
    if (profileSubscription?.stripeCustomerId) {
      return profileSubscription.stripeCustomerId;
    }

    return null;
  }, [me?.profile]);

  const fetchFromStripe = useCallback(async (customerId: string) => {
    try {
      console.log(
        'Fetching subscription from Stripe for customer:',
        customerId,
      );
      setSubscriptionState((prev) => ({ ...prev, loading: true }));

      const response = await fetch('/api/stripe/get-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.hasSubscription) {
          const sub = data.subscription;
          const status = sub.status === 'trialing' ? 'trial' : sub.status;
          const trialDaysRemaining = sub.trialEnd
            ? Math.max(
                0,
                Math.ceil(
                  (sub.trialEnd * 1000 - Date.now()) / (1000 * 60 * 60 * 24),
                ),
              )
            : 0;
          const isTrialActive = status === 'trial' && trialDaysRemaining > 0;
          const isSubscribed = status === 'active' || isTrialActive;

          const stripeBasedState: SubscriptionStatus = {
            isSubscribed,
            isTrialActive,
            trialDaysRemaining,
            plan: sub.plan as 'free' | 'monthly' | 'yearly',
            planName: sub.planName,
            status: status as
              | 'free'
              | 'trial'
              | 'active'
              | 'cancelled'
              | 'past_due',
            hasAccess: (feature) => hasFeatureAccess(feature, sub.plan),
            showUpgradePrompt: !isSubscribed && status !== 'cancelled',
            customerId: sub.customerId,
            subscriptionId: sub.id,
            loading: false,
          };

          console.log('Subscription fetched from Stripe:', stripeBasedState);
          setSubscriptionState(stripeBasedState);
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching subscription from Stripe:', error);
    }

    setSubscriptionState((prev) => ({ ...prev, loading: false }));
  }, []);

  useEffect(() => {
    if (!hasJazzProvider) {
      return;
    }

    if (!me?.profile) {
      console.log('useSubscription: No profile found');
      setSubscriptionState((prev) => ({
        ...prev,
        loading: false,
        status: 'free',
        plan: 'free',
      }));
      return;
    }

    const profileSubscription = (me.profile as any)?.subscription;
    console.log(
      'useSubscription: Profile found, subscription:',
      profileSubscription,
    );

    // If we have subscription data in profile, use it immediately
    if (
      profileSubscription &&
      profileSubscription.status &&
      profileSubscription.status !== 'free'
    ) {
      const status = profileSubscription.status;
      const plan = profileSubscription.plan || 'free';
      const isTrialActive =
        status === 'trial' && profileSubscription.trialEndsAt
          ? new Date(profileSubscription.trialEndsAt) > new Date()
          : false;
      const trialDaysRemaining = profileSubscription.trialEndsAt
        ? getTrialDaysRemaining(profileSubscription.trialEndsAt)
        : 0;
      const isSubscribed = status === 'active' || isTrialActive;

      const profileBasedState: SubscriptionStatus = {
        isSubscribed,
        isTrialActive,
        trialDaysRemaining,
        plan: plan as 'free' | 'monthly' | 'yearly',
        status: status as
          | 'free'
          | 'trial'
          | 'active'
          | 'cancelled'
          | 'past_due',
        hasAccess: (feature) => hasFeatureAccess(feature, plan),
        showUpgradePrompt: !isSubscribed && status !== 'cancelled',
        customerId:
          profileSubscription.stripeCustomerId ||
          (me?.profile as any)?.stripeCustomerId,
        subscriptionId: profileSubscription.stripeSubscriptionId,
        loading: false,
      };

      console.log('useSubscription profile-based result:', profileBasedState);
      setSubscriptionState(profileBasedState);
      // Mark as checked since we have subscription data
      const profileId = me?.profile ? 'profile-exists' : null;
      hasCheckedStripeRef.current = profileId;
      return;
    }

    // Only check Stripe once per profile
    const profileId = me?.profile ? 'profile-exists' : null;
    if (hasCheckedStripeRef.current !== profileId) {
      const customerId = getCustomerId();

      if (customerId) {
        console.log(
          'No profile subscription but found customer ID, fetching from Stripe...',
        );
        hasCheckedStripeRef.current = profileId;
        fetchFromStripe(customerId);
      } else {
        console.log('No customer ID found, using default state');
        setSubscriptionState((prev) => ({ ...prev, loading: false }));
        hasCheckedStripeRef.current = profileId;
      }
    }
  }, [me?.profile, getCustomerId, fetchFromStripe]);

  if (!hasJazzProvider) {
    return defaultState;
  }

  return subscriptionState;
}
