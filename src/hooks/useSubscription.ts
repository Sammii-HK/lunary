'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount } from 'jazz-tools/react';
import { MyAppAccount } from '../../schema';
import {
  hasFeatureAccess,
  FEATURE_ACCESS,
  getTrialDaysRemaining,
  normalizePlanType,
} from '../../utils/pricing';
import { syncSubscriptionToProfile } from '../../utils/subscription';

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
  const defaultState: SubscriptionStatus = useMemo(
    () => ({
      isSubscribed: false,
      isTrialActive: false,
      trialDaysRemaining: 0,
      plan: 'free',
      status: 'free',
      hasAccess: (feature) => hasFeatureAccess('free', undefined, feature),
      showUpgradePrompt: true,
      loading: false,
    }),
    [],
  );

  const [subscriptionState, setSubscriptionState] =
    useState<SubscriptionStatus>(defaultState);
  const [hasCheckedStripe, setHasCheckedStripe] = useState(false);
  const [hasSyncedProfile, setHasSyncedProfile] = useState(false);
  const [stripeSubscriptionData, setStripeSubscriptionData] = useState<{
    plan: string;
    status: string;
    customerId: string;
  } | null>(null);

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

  const fetchFromStripe = useCallback(
    async (customerId: string) => {
      try {
        setSubscriptionState((prev) => ({ ...prev, loading: true }));

        const response = await fetch('/api/stripe/get-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerId }),
          cache: 'no-store', // Prevent service worker caching
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.subscription) {
            const sub = data.subscription;
            const status = sub.status === 'trialing' ? 'trial' : sub.status;
            const trialEnd = sub.trial_end || sub.trialEnd;
            const trialDaysRemaining = trialEnd
              ? Math.max(
                  0,
                  Math.ceil(
                    (trialEnd * 1000 - Date.now()) / (1000 * 60 * 60 * 24),
                  ),
                )
              : 0;
            const isTrialActive = status === 'trial' && trialDaysRemaining > 0;
            const isSubscribed = status === 'active' || isTrialActive;

            // Use plan from API response - should be specific plan name (lunary_plus, lunary_plus_ai, or lunary_plus_ai_annual)
            // Stripe API should return specific plan name via price ID mapping, not generic 'monthly'/'yearly'
            const planFromApi = sub.plan || 'free';
            const normalizedPlan = normalizePlanType(planFromApi);

            // Map to simplified plan state for UI (free/monthly/yearly)
            // Note: Both lunary_plus and lunary_plus_ai map to 'monthly' for UI purposes
            const planForState =
              normalizedPlan === 'lunary_plus_ai_annual'
                ? 'yearly'
                : normalizedPlan === 'lunary_plus_ai'
                  ? 'monthly'
                  : normalizedPlan === 'lunary_plus'
                    ? 'monthly'
                    : 'free';

            const stripeBasedState: SubscriptionStatus = {
              isSubscribed,
              isTrialActive,
              trialDaysRemaining,
              plan: planForState as 'free' | 'monthly' | 'yearly',
              planName: sub.planName,
              status: status as
                | 'free'
                | 'trial'
                | 'active'
                | 'cancelled'
                | 'past_due',
              hasAccess: (feature) => {
                // Defensive check: if plan is lunary_plus_ai_annual or yearly and status is trial/active, always grant access
                // Check both normalized and raw plan to handle cases where normalization might not have occurred
                if (
                  (normalizedPlan === 'lunary_plus_ai_annual' ||
                    planFromApi === 'lunary_plus_ai_annual' ||
                    planFromApi === 'yearly') &&
                  (status === 'trial' || status === 'active')
                ) {
                  const hasAccess =
                    FEATURE_ACCESS.lunary_plus_ai_annual.includes(feature);
                  return hasAccess;
                }

                if (
                  (normalizedPlan === 'lunary_plus_ai' ||
                    planFromApi === 'lunary_plus_ai') &&
                  (status === 'trial' || status === 'active')
                ) {
                  const hasAccess =
                    FEATURE_ACCESS.lunary_plus_ai.includes(feature);
                  return hasAccess;
                }

                const access = hasFeatureAccess(
                  status,
                  normalizedPlan,
                  feature,
                );
                return access;
              },
              showUpgradePrompt: !isSubscribed && status !== 'cancelled',
              customerId: sub.customerId,
              subscriptionId: sub.id,
              loading: false,
            };

            // Store Stripe data for comparison with profile
            setStripeSubscriptionData({
              plan: planFromApi,
              status: sub.status,
              customerId: sub.customerId,
            });

            // Sync to profile if plan differs (to prevent infinite loops)
            if (me?.profile?.subscription && !hasSyncedProfile) {
              const profilePlan = me.profile.subscription.plan;
              const needsSync =
                (profilePlan === 'monthly' || profilePlan === 'yearly') &&
                !profilePlan.includes('lunary') &&
                planFromApi !== profilePlan;

              if (needsSync) {
                setHasSyncedProfile(true);
                // Sync in background - don't await to prevent blocking
                syncSubscriptionToProfile(me.profile, sub.customerId).catch(
                  (err) => {
                    console.error(
                      '[useSubscription] Failed to sync profile:',
                      err,
                    );
                    setHasSyncedProfile(false); // Allow retry on error
                  },
                );
              }
            }

            setSubscriptionState(stripeBasedState);
            return;
          } else {
          }
        } else {
          console.warn(
            '[useSubscription] Failed to fetch subscription:',
            response.status,
          );
        }
      } catch (error) {
        console.error(
          '[useSubscription] Error fetching subscription from Stripe:',
          error,
        );
      }

      // If we get here, Stripe fetch failed or returned no subscription
      // Fall back to profile subscription or default state
      setSubscriptionState((prev) => ({ ...prev, loading: false }));
      // eslint-disable-next-line react-hooks/exhaustive-deps
      // hasSyncedProfile and me.profile are intentionally excluded to prevent infinite loops
      // Adding them would cause the callback to recreate on every render, triggering infinite fetch loops
    },
    [getCustomerId],
  );

  useEffect(() => {
    if (!hasJazzProvider) {
      return;
    }

    if (!me?.profile) {
      setSubscriptionState(defaultState);
      return;
    }

    const profileSubscription = (me.profile as any)?.subscription;
    const customerId = getCustomerId();

    // Prioritize Stripe data if available (most accurate source of truth)
    // This ensures we use correct plan even if profile subscription is stale
    if (
      stripeSubscriptionData &&
      stripeSubscriptionData.customerId === customerId
    ) {
      // Recreate state from Stripe data to ensure it's correct
      const stripeStatus =
        stripeSubscriptionData.status === 'trialing'
          ? 'trial'
          : stripeSubscriptionData.status;
      const stripeNormalizedPlan = normalizePlanType(
        stripeSubscriptionData.plan,
      );
      const stripePlanForState =
        stripeNormalizedPlan === 'lunary_plus_ai_annual'
          ? 'yearly'
          : stripeNormalizedPlan === 'lunary_plus_ai'
            ? 'monthly'
            : stripeNormalizedPlan === 'lunary_plus'
              ? 'monthly'
              : 'free';

      const stripeBasedState: SubscriptionStatus = {
        isSubscribed: stripeStatus === 'active' || stripeStatus === 'trial',
        isTrialActive: stripeStatus === 'trial',
        trialDaysRemaining: stripeStatus === 'trial' ? 14 : 0, // Default, will be updated by fetchFromStripe if needed
        plan: stripePlanForState as 'free' | 'monthly' | 'yearly',
        status: stripeStatus as
          | 'free'
          | 'trial'
          | 'active'
          | 'cancelled'
          | 'past_due',
        hasAccess: (feature) => {
          // Defensive check: if plan is lunary_plus_ai_annual or yearly and status is trial/active, always grant access
          // Check both normalized and raw plan to handle cases where normalization might not have occurred
          if (
            (stripeNormalizedPlan === 'lunary_plus_ai_annual' ||
              stripeSubscriptionData.plan === 'lunary_plus_ai_annual' ||
              stripeSubscriptionData.plan === 'yearly') &&
            (stripeStatus === 'trial' || stripeStatus === 'active')
          ) {
            const hasAccess =
              FEATURE_ACCESS.lunary_plus_ai_annual.includes(feature);
            return hasAccess;
          }

          if (
            (stripeNormalizedPlan === 'lunary_plus_ai' ||
              stripeSubscriptionData.plan === 'lunary_plus_ai') &&
            (stripeStatus === 'trial' || stripeStatus === 'active')
          ) {
            const hasAccess = FEATURE_ACCESS.lunary_plus_ai.includes(feature);
            return hasAccess;
          }

          const access = hasFeatureAccess(
            stripeStatus,
            stripeNormalizedPlan,
            feature,
          );
          return access;
        },
        showUpgradePrompt: false, // User has subscription
        customerId: stripeSubscriptionData.customerId,
        loading: false,
      };

      setSubscriptionState(stripeBasedState);
      setHasCheckedStripe(true);
      return;
    }

    // Fallback to profile subscription - widget syncs subscription data here for reuse
    // But if profile plan looks wrong (monthly when we have customer ID), fetch from Stripe to verify
    if (
      profileSubscription &&
      profileSubscription.status &&
      profileSubscription.status !== 'free'
    ) {
      // Normalize status: 'trialing' -> 'trial' for consistency
      const rawStatus = profileSubscription.status;
      const status = rawStatus === 'trialing' ? 'trial' : rawStatus;
      const plan = profileSubscription.plan || 'free';

      // If profile has generic plan (monthly/yearly) but we have customer ID, fetch from Stripe to get exact plan
      // This handles cases where profile sync hasn't completed or is stale
      if (
        customerId &&
        !hasCheckedStripe &&
        (plan === 'monthly' || plan === 'yearly') &&
        !plan.includes('lunary')
      ) {
        setHasCheckedStripe(true);
        fetchFromStripe(customerId);
        return;
      }
      const isTrialActive =
        status === 'trial' && profileSubscription.trialEndsAt
          ? new Date(profileSubscription.trialEndsAt) > new Date()
          : status === 'trial'; // If status is 'trial', consider trial active even without trialEndsAt
      const trialDaysRemaining = profileSubscription.trialEndsAt
        ? getTrialDaysRemaining(profileSubscription.trialEndsAt)
        : status === 'trial'
          ? 7
          : 0; // Default to 7 days if trialing but no trialEndsAt
      const isSubscribed =
        status === 'active' || status === 'trial' || isTrialActive;

      // Normalize plan to ensure correct feature access
      // normalizePlanType already converts 'yearly' -> 'lunary_plus_ai_annual'
      // This ensures profile subscriptions with 'yearly' get annual plan features
      const normalizedPlan = normalizePlanType(plan);

      const planForState =
        normalizedPlan === 'lunary_plus_ai_annual'
          ? 'yearly'
          : normalizedPlan === 'lunary_plus_ai'
            ? 'monthly'
            : normalizedPlan === 'lunary_plus'
              ? 'monthly'
              : 'free';

      const profileBasedState: SubscriptionStatus = {
        isSubscribed,
        isTrialActive,
        trialDaysRemaining,
        plan: planForState as 'free' | 'monthly' | 'yearly',
        status: status as
          | 'free'
          | 'trial'
          | 'active'
          | 'cancelled'
          | 'past_due',
        hasAccess: (feature) => {
          // Defensive check: if plan is lunary_plus_ai_annual or yearly and status is trial/active, always grant access
          // Check both normalized and raw plan to handle cases where normalization might not have occurred
          if (
            (normalizedPlan === 'lunary_plus_ai_annual' ||
              plan === 'lunary_plus_ai_annual' ||
              plan === 'yearly') &&
            (status === 'trial' || status === 'active')
          ) {
            const hasAccess =
              FEATURE_ACCESS.lunary_plus_ai_annual.includes(feature);
            return hasAccess;
          }

          if (
            (normalizedPlan === 'lunary_plus_ai' ||
              plan === 'lunary_plus_ai') &&
            (status === 'trial' || status === 'active')
          ) {
            const hasAccess = FEATURE_ACCESS.lunary_plus_ai.includes(feature);
            return hasAccess;
          }

          // Use normalized plan for feature access checks
          // hasFeatureAccess already handles 'yearly' -> 'lunary_plus_ai_annual' conversion
          const access = hasFeatureAccess(status, normalizedPlan, feature);
          return access;
        },
        showUpgradePrompt: !isSubscribed && status !== 'cancelled',
        customerId:
          profileSubscription.stripeCustomerId ||
          (me?.profile as any)?.stripeCustomerId,
        subscriptionId: profileSubscription.stripeSubscriptionId,
        loading: false,
      };

      // Set state immediately from profile - this is the source of truth
      setSubscriptionState(profileBasedState);
      setHasCheckedStripe(true);
      return;
    }

    // Fallback: Only fetch from Stripe if no profile subscription exists
    // Profile subscription is the source of truth (synced by widget)
    if (!hasCheckedStripe) {
      setHasCheckedStripe(true);

      if (customerId && !profileSubscription) {
        // No profile subscription but we have customer ID - fetch from Stripe
        fetchFromStripe(customerId);
        return;
      } else {
        // No customer ID or no profile subscription - use default state
        setSubscriptionState(defaultState);
      }
    }
  }, [
    me?.profile,
    hasCheckedStripe,
    hasJazzProvider,
    defaultState,
    getCustomerId,
    fetchFromStripe,
    stripeSubscriptionData,
  ]);

  if (!hasJazzProvider) {
    return defaultState;
  }

  return subscriptionState;
}
