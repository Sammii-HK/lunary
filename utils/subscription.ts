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
    trialDays = planType === 'monthly' ? FREE_TRIAL_DAYS.monthly : FREE_TRIAL_DAYS.yearly;
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

// Sync subscription data to Jazz profile
export async function syncSubscriptionToProfile(
  profile: any,
  customerId: string,
) {
  try {
    const storedData = getStoredSubscriptionData(customerId);
    if (!storedData) {
      console.log('No subscription data found for customer:', customerId);
      return { success: false, message: 'No subscription data found' };
    }

    const { Subscription } = await import('../schema');

    const subscriptionCoValue = Subscription.create(
      {
        status: storedData.status,
        plan: storedData.plan,
        stripeCustomerId: storedData.stripeCustomerId,
        stripeSubscriptionId: storedData.stripeSubscriptionId,
        currentPeriodEnd: storedData.currentPeriodEnd,
        trialEndsAt: storedData.trialEndsAt,
        createdAt: storedData.updatedAt,
        updatedAt: storedData.updatedAt,
      },
      profile._owner || profile,
    );

    (profile as any).subscription = subscriptionCoValue;

    console.log('Subscription synced to Jazz profile:', {
      customerId,
      status: storedData.status,
      plan: storedData.plan,
    });

    return { success: true, data: storedData };
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

    (profile as any).subscription = subscriptionCoValue;

    return { success: true };
  } catch (error) {
    console.error('Error creating trial subscription:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
