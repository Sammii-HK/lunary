import dayjs from 'dayjs';
import {
  hasFeatureAccess,
  getTrialDaysRemaining,
  isTrialExpired,
  FREE_TRIAL_DAYS,
  getTrialDaysFromStripe,
} from './pricing';

export type SubscriptionStatus =
  | 'free'
  | 'trial'
  | 'active'
  | 'cancelled'
  | 'past_due';

export function getSubscriptionStatus(subscription: any): SubscriptionStatus {
  if (!subscription) return 'free';

  const status = subscription.status;

  // Check if trial is expired
  if (status === 'trial' && isTrialExpired(subscription.trialEndsAt)) {
    return 'free';
  }

  return status;
}

export async function createTrialSubscription(planType: 'monthly' | 'yearly') {
  let trialDays: number;

  try {
    // Fetch trial days from Stripe
    const trialData = await getTrialDaysFromStripe();
    trialDays = planType === 'monthly' ? trialData.monthly : trialData.yearly;
  } catch (error) {
    console.error('Error fetching trial days from Stripe:', error);
    // Fallback to hardcoded values
    trialDays =
      planType === 'monthly' ? FREE_TRIAL_DAYS.monthly : FREE_TRIAL_DAYS.yearly;
  }

  const trialEndsAt = dayjs().add(trialDays, 'day').toISOString();

  return {
    status: 'trial' as const,
    plan: planType,
    trialEndsAt,
    createdAt: dayjs().toISOString(),
    updatedAt: dayjs().toISOString(),
  };
}

export function updateSubscriptionFromStripe(
  stripeSubscription: any,
  stripeCustomerId: string,
) {
  const status = mapStripeStatusToOurs(stripeSubscription.status);
  const planType =
    stripeSubscription.items.data[0]?.price?.recurring?.interval === 'month'
      ? 'monthly'
      : 'yearly';

  return {
    status,
    plan: planType,
    stripeCustomerId,
    stripeSubscriptionId: stripeSubscription.id,
    currentPeriodEnd: dayjs
      .unix(stripeSubscription.current_period_end)
      .toISOString(),
    updatedAt: dayjs().toISOString(),
  };
}

function mapStripeStatusToOurs(stripeStatus: string): SubscriptionStatus {
  switch (stripeStatus) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trial';
    case 'canceled':
    case 'incomplete_expired':
      return 'cancelled';
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    default:
      return 'free';
  }
}

export function shouldShowUpgradePrompt(subscription: any): boolean {
  const status = getSubscriptionStatus(subscription);

  if (status === 'free') return true;
  if (status === 'trial') {
    const daysRemaining = getTrialDaysRemaining(subscription?.trialEndsAt);
    return daysRemaining <= 3; // Show prompt when trial has 3 days or less
  }

  return false;
}

export function getUpgradeMessage(subscription: any): string {
  const status = getSubscriptionStatus(subscription);

  if (status === 'free') {
    return 'Unlock your complete cosmic profile with personalized insights';
  }

  if (status === 'trial') {
    const daysRemaining = getTrialDaysRemaining(subscription?.trialEndsAt);
    if (daysRemaining === 0) {
      return 'Your free trial has ended. Upgrade to continue your cosmic journey';
    }
    return `${daysRemaining} days left in your trial. Upgrade to continue after trial ends`;
  }

  return '';
}

// Simple in-memory store for subscription updates (in production, use Redis/Database)
const subscriptionRegistry = new Map<string, any>();

// Function to update user subscription status from Stripe webhooks
export async function updateUserSubscriptionStatus(
  customerId: string,
  subscriptionData: {
    id: string;
    status: string;
    plan: string;
    trialEnd?: number;
    currentPeriodEnd: number;
  },
) {
  try {
    console.log('Subscription update received:', {
      customerId,
      subscriptionData,
      timestamp: new Date().toISOString(),
    });

    // Create standardized subscription object
    const subscriptionUpdate = {
      customerId,
      stripeSubscriptionId: subscriptionData.id,
      status: mapStripeStatus(subscriptionData.status),
      plan: subscriptionData.plan,
      trialEndsAt: subscriptionData.trialEnd
        ? new Date(subscriptionData.trialEnd * 1000).toISOString()
        : null,
      currentPeriodEnd: new Date(
        subscriptionData.currentPeriodEnd * 1000,
      ).toISOString(),
      updatedAt: new Date().toISOString(),
      stripeCustomerId: customerId,
    };

    // Store in registry for later sync to Jazz profiles
    subscriptionRegistry.set(customerId, subscriptionUpdate);

    console.log('Subscription data stored for sync:', subscriptionUpdate);

    return { success: true, data: subscriptionUpdate };
  } catch (error) {
    console.error('Error updating user subscription:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Map Stripe status to our internal status
function mapStripeStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case 'trialing':
      return 'trial';
    case 'active':
      return 'active';
    case 'canceled':
    case 'cancelled':
      return 'cancelled';
    case 'past_due':
      return 'past_due';
    case 'unpaid':
      return 'cancelled';
    default:
      return 'free';
  }
}

// Get stored subscription data for a customer
export function getStoredSubscriptionData(customerId: string) {
  return subscriptionRegistry.get(customerId);
}

// Fetch subscription data directly from Stripe (production-ready fallback)
export async function fetchSubscriptionFromStripe(customerId: string) {
  try {
    const response = await fetch('/api/stripe/get-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId }),
    });

    if (!response.ok) {
      console.log('No subscription found in Stripe for customer:', customerId);
      return null;
    }

    const result = await response.json();

    if (result.success && result.subscription) {
      const sub = result.subscription;

      console.log('🔍 Processing subscription data:', {
        id: sub.id,
        status: sub.status,
        trial_end: sub.trial_end,
        current_period_end: sub.current_period_end,
      });

      // Format to match our internal structure with safe timestamp handling
      const safeTimestamp = (
        timestamp: number | null | undefined,
      ): string | null => {
        if (!timestamp || timestamp <= 0) return null;
        try {
          return new Date(timestamp * 1000).toISOString();
        } catch (error) {
          console.warn('Invalid timestamp:', timestamp);
          return null;
        }
      };

      // Use plan from API response if available (preserves specific plan types like 'lunary_plus_ai_annual')
      // Otherwise fall back to interval-based detection
      const planFromApi = sub.plan;
      const plan =
        planFromApi ||
        (sub.items.data[0]?.price?.recurring?.interval === 'month'
          ? 'monthly'
          : 'yearly');

      return {
        customerId,
        stripeSubscriptionId: sub.id,
        status: mapStripeStatus(sub.status),
        plan,
        trialEndsAt: safeTimestamp(sub.trial_end),
        currentPeriodEnd:
          safeTimestamp(sub.current_period_end) || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stripeCustomerId: customerId,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching subscription from Stripe:', error);
    return null;
  }
}

// Sync subscription data to Jazz profile - fetch directly from Stripe for reliability
export async function syncSubscriptionToProfile(
  profile: any,
  customerId: string,
) {
  try {
    // First try stored data (from webhooks)
    let subscriptionData = getStoredSubscriptionData(customerId);

    // If no stored data, fetch directly from Stripe (more reliable)
    if (!subscriptionData) {
      console.log(
        'No stored data, fetching directly from Stripe for customer:',
        customerId,
      );
      subscriptionData = await fetchSubscriptionFromStripe(customerId);
    }

    if (!subscriptionData) {
      console.log('No subscription data found for customer:', customerId);
      return { success: false, message: 'No subscription data found' };
    }

    const { Subscription } = await import('../schema');

    // Schema now supports specific plan types, so preserve exact plan type from Stripe
    // Only normalize generic terms if we don't have a specific plan type
    let schemaPlan: string = subscriptionData.plan;

    // If plan is generic, try to infer from context (but prefer specific types)
    if (schemaPlan === 'yearly' && !subscriptionData.plan.includes('lunary')) {
      // If we have a customer ID, we could fetch from Stripe to get exact plan
      // But for now, default yearly to annual AI plan (most common)
      schemaPlan = 'lunary_plus_ai_annual';
    } else if (
      schemaPlan === 'monthly' &&
      !subscriptionData.plan.includes('lunary')
    ) {
      schemaPlan = 'lunary_plus';
    }

    // Ensure plan is one of the allowed schema values
    const allowedPlans = [
      'free',
      'monthly',
      'yearly',
      'lunary_plus',
      'lunary_plus_ai',
      'lunary_plus_ai_annual',
    ];
    if (!allowedPlans.includes(schemaPlan)) {
      console.warn(
        `[syncSubscriptionToProfile] Unknown plan type: ${schemaPlan}, defaulting to yearly`,
      );
      schemaPlan = 'lunary_plus_ai_annual';
    }

    const subscriptionCoValue = Subscription.create(
      {
        status: subscriptionData.status as
          | 'free'
          | 'trial'
          | 'active'
          | 'cancelled'
          | 'past_due',
        plan: schemaPlan as
          | 'free'
          | 'monthly'
          | 'yearly'
          | 'lunary_plus'
          | 'lunary_plus_ai'
          | 'lunary_plus_ai_annual',
        stripeCustomerId: subscriptionData.stripeCustomerId || undefined,
        stripeSubscriptionId:
          subscriptionData.stripeSubscriptionId || undefined,
        currentPeriodEnd: subscriptionData.currentPeriodEnd || undefined,
        trialEndsAt: subscriptionData.trialEndsAt || undefined,
        createdAt: subscriptionData.updatedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      profile._owner || profile,
    );

    profile.$jazz.set('subscription', subscriptionCoValue);

    console.log('Subscription synced to Jazz profile:', {
      customerId,
      status: subscriptionData.status,
      plan: subscriptionData.plan,
      schemaPlan: schemaPlan,
      syncedPlan: (profile.$jazz.get('subscription') as any)?.plan,
    });

    return { success: true, data: subscriptionData };
  } catch (error) {
    console.error('Error syncing subscription to profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Helper to create trial subscription in Jazz profile
export async function createTrialSubscriptionInProfile(profile: any) {
  try {
    const { Subscription } = await import('../schema');

    let trialDays: number;
    try {
      // Fetch trial days from Stripe
      const trialData = await getTrialDaysFromStripe();
      trialDays = trialData.monthly; // Default to monthly trial for profile creation
    } catch (error) {
      console.error('Error fetching trial days from Stripe:', error);
      trialDays = FREE_TRIAL_DAYS.monthly; // Fallback
    }

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + trialDays);

    const subscriptionCoValue = Subscription.create(
      {
        status: 'trial',
        plan: 'monthly',
        trialEndsAt: trialEndDate.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      profile._owner || profile,
    );

    profile.$jazz.set('subscription', subscriptionCoValue);

    return { success: true };
  } catch (error) {
    console.error('Error creating trial subscription:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
