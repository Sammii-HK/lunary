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
      const interval = sub.items.data[0]?.price?.recurring?.interval;
      const plan =
        planFromApi ||
        (interval === 'month'
          ? 'monthly'
          : interval === 'year'
            ? 'lunary_plus_ai_annual' // Only yearly plan available, map directly
            : 'free');

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

// Sync subscription data to Jazz profile - fetch from database
export async function syncSubscriptionToProfile(
  profile: any,
  customerId: string,
) {
  try {
    // Fetch from database (webhooks keep this updated)
    const subscriptionData = await fetchSubscriptionFromStripe(customerId);

    if (!subscriptionData) {
      console.log('No subscription data found for customer:', customerId);
      return { success: false, message: 'No subscription data found' };
    }

    const { Subscription } = await import('../schema');

    // Schema now supports specific plan types, so preserve exact plan type from Stripe
    // Only normalize generic terms if we don't have a specific plan type
    let schemaPlan: string = subscriptionData.plan;

    // If plan is generic, try to infer from context (but prefer specific types)
    // Note: 'yearly' should already be mapped to 'lunary_plus_ai_annual' by fetchSubscriptionFromStripe
    // This is a safety check in case it wasn't mapped
    if (schemaPlan === 'yearly' || schemaPlan === 'annual') {
      // Only yearly plan available is lunary_plus_ai_annual
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
        `[syncSubscriptionToProfile] Unknown plan type: ${schemaPlan}, defaulting to free`,
      );
      schemaPlan = 'free';
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

    if (!profile.$jazz) {
      console.error(
        '[syncSubscriptionToProfile] Profile does not have $jazz property',
        { profileKeys: Object.keys(profile) },
      );
      return {
        success: false,
        message: 'Profile is not a valid Jazz coValue',
      };
    }

    profile.$jazz.set('subscription', subscriptionCoValue);

    // Access subscription directly from profile (Jazz coValues expose properties directly)
    const syncedSubscription = (profile as any).subscription;

    console.log('Subscription synced to Jazz profile:', {
      customerId,
      status: subscriptionData.status,
      plan: subscriptionData.plan,
      schemaPlan: schemaPlan,
      syncedPlan: syncedSubscription?.plan || 'unknown',
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
