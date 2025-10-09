/**
 * Production-ready subscription sync that doesn't rely on webhooks
 * This ensures subscriptions work even if webhooks fail or are delayed
 */

import { fetchSubscriptionFromStripe } from './subscription';

export interface SubscriptionSyncResult {
  success: boolean;
  message: string;
  subscriptionData?: any;
  error?: string;
}

/**
 * Robust subscription sync that tries multiple methods
 */
export async function robustSubscriptionSync(
  profile: any,
  email: string
): Promise<SubscriptionSyncResult> {
  try {
    console.log('🔄 Starting robust subscription sync for:', email);

    // Step 1: Find Stripe customer by email
    const customerResponse = await fetch('/api/stripe/find-customer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const customerResult = await customerResponse.json();
    
    if (!customerResult.found || !customerResult.customer) {
      return {
        success: false,
        message: 'No Stripe customer found for this email address. Please ensure you completed the Stripe checkout.',
      };
    }

    const customerId = customerResult.customer.id;
    console.log('✅ Found Stripe customer:', customerId);

    // Step 2: Fetch subscription directly from Stripe
    const subscriptionData = await fetchSubscriptionFromStripe(customerId);
    
    if (!subscriptionData) {
      return {
        success: false,
        message: 'Customer found but no active subscription. The subscription might be cancelled or expired.',
      };
    }

    console.log('✅ Found subscription data:', subscriptionData);

    // Step 3: Apply to Jazz profile
    if (!profile) {
      return {
        success: false,
        message: 'No Jazz profile available to sync to',
      };
    }

    // Save customer ID
    profile.$jazz.set('stripeCustomerId', customerId);

    // Create and save subscription object
    const { Subscription } = await import('../schema');
    
    const subscriptionCoValue = Subscription.create({
      status: subscriptionData.status as "free" | "trial" | "active" | "cancelled" | "past_due",
      plan: subscriptionData.plan as "free" | "monthly" | "yearly",
      stripeCustomerId: customerId || undefined,
      stripeSubscriptionId: subscriptionData.stripeSubscriptionId || undefined,
      currentPeriodEnd: subscriptionData.currentPeriodEnd || undefined,
      trialEndsAt: subscriptionData.trialEndsAt || undefined,
      createdAt: subscriptionData.updatedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, profile._owner || profile);

    profile.$jazz.set('subscription', subscriptionCoValue);

    console.log('✅ Subscription successfully synced to Jazz profile');

    return {
      success: true,
      message: `Successfully synced ${subscriptionData.plan} subscription`,
      subscriptionData,
    };

  } catch (error) {
    console.error('❌ Robust subscription sync failed:', error);
    return {
      success: false,
      message: 'Subscription sync failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sync subscription immediately after Stripe checkout (for success page)
 */
export async function syncSubscriptionAfterCheckout(
  profile: any,
  sessionId: string
): Promise<SubscriptionSyncResult> {
  try {
    console.log('🔄 Syncing subscription after checkout, session:', sessionId);

    // Get session data from Stripe
    const sessionResponse = await fetch(`/api/stripe/session/${sessionId}`);
    
    if (!sessionResponse.ok) {
      throw new Error('Failed to fetch checkout session');
    }

    const sessionData = await sessionResponse.json();
    
    if (!sessionData.customer_id) {
      throw new Error('No customer ID in session data');
    }

    console.log('✅ Got session data:', {
      customerId: sessionData.customer_id,
      hasSubscription: !!sessionData.subscription,
    });

    // Save customer ID to profile immediately
    profile.$jazz.set('stripeCustomerId', sessionData.customer_id);

    // If there's subscription data, sync it
    if (sessionData.subscription) {
      const subscriptionData = await fetchSubscriptionFromStripe(sessionData.customer_id);
      
      if (subscriptionData) {
        const { Subscription } = await import('../schema');
        
        const subscriptionCoValue = Subscription.create({
          status: subscriptionData.status as "free" | "trial" | "active" | "cancelled" | "past_due",
          plan: subscriptionData.plan as "free" | "monthly" | "yearly",
          stripeCustomerId: sessionData.customer_id || undefined,
          stripeSubscriptionId: subscriptionData.stripeSubscriptionId || undefined,
          currentPeriodEnd: subscriptionData.currentPeriodEnd || undefined,
          trialEndsAt: subscriptionData.trialEndsAt || undefined,
          createdAt: subscriptionData.updatedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, profile._owner || profile);

        profile.$jazz.set('subscription', subscriptionCoValue);

        console.log('✅ Subscription synced after checkout');

        return {
          success: true,
          message: 'Subscription synced successfully after checkout',
          subscriptionData,
        };
      }
    }

    return {
      success: true,
      message: 'Customer ID saved, subscription will sync when available',
    };

  } catch (error) {
    console.error('❌ Checkout subscription sync failed:', error);
    return {
      success: false,
      message: 'Failed to sync subscription after checkout',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
