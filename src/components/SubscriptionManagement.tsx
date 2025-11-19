'use client';

import { useState, useEffect } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { useAccount } from 'jazz-tools/react';
import { syncSubscriptionToProfile } from '../../utils/subscription';
import { Settings, ExternalLink, RefreshCw } from 'lucide-react';

interface SubscriptionManagementProps {
  customerId?: string;
  subscriptionId?: string;
}

interface StripeSubscription {
  id: string;
  status: string;
  customer?: string;
  customerId?: string;
  plan?: string;
  planName?: string;
  currentPeriodEnd?: string;
  current_period_end?: number;
  cancelAtPeriodEnd?: boolean;
  trialEnd?: string;
  trial_end?: number;
}

export default function SubscriptionManagement({
  customerId,
  subscriptionId,
}: SubscriptionManagementProps) {
  const subscription = useSubscription();
  const { me } = useAccount();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stripeSubscription, setStripeSubscription] =
    useState<StripeSubscription | null>(null);

  const displaySubscription = stripeSubscription ||
    subscription || { status: 'free', isSubscribed: false };

  const fetchStripeSubscription = async (forceRefresh = false) => {
    const customerIdToUse = customerId || subscription.customerId;
    if (!customerIdToUse) return;

    try {
      // Add cache-busting query parameter and headers when force refresh
      const url = forceRefresh
        ? `/api/stripe/get-subscription?t=${Date.now()}`
        : '/api/stripe/get-subscription';

      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (forceRefresh) {
        headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        headers['Pragma'] = 'no-cache';
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customerId: customerIdToUse,
          forceRefresh,
        }),
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.subscription) {
          setStripeSubscription(data.subscription);
          // Sync to profile for use across site
          if (me?.profile && data.subscription.customerId) {
            try {
              const syncResult = await syncSubscriptionToProfile(
                me.profile,
                data.subscription.customerId,
              );
              if (process.env.NODE_ENV === 'development') {
                console.log(
                  '[SubscriptionManagement] Synced subscription to profile:',
                  syncResult,
                );
                // Log the synced subscription data
                const syncedSub = (me.profile as any)?.subscription;
                console.log(
                  '[SubscriptionManagement] Profile subscription after sync:',
                  {
                    status: syncedSub?.status,
                    plan: syncedSub?.plan,
                    trialEndsAt: syncedSub?.trialEndsAt,
                  },
                );
              }
            } catch (syncError) {
              console.error(
                '[SubscriptionManagement] Failed to sync subscription to profile:',
                syncError,
              );
              // Don't show error to user - subscription display still works
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching Stripe subscription:', error);
      setError('Failed to refresh subscription. Please try again.');
    }
  };

  useEffect(() => {
    fetchStripeSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, subscription.customerId]);

  const handleRefresh = async () => {
    setLoading('refresh');
    setError(null);

    // Clear any cached subscription data
    try {
      // Clear service worker cache if it exists
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName)),
        );
      }

      // Clear subscription-related localStorage keys
      const subscriptionKeys = [
        'subscription',
        'stripe_subscription',
        'subscription_data',
        'weekly_insights_',
      ];
      subscriptionKeys.forEach((key) => {
        if (key.endsWith('_')) {
          // Clear all keys starting with prefix
          Object.keys(localStorage).forEach((k) => {
            if (k.startsWith(key)) {
              localStorage.removeItem(k);
            }
          });
        } else {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      // Ignore cache clearing errors
      console.warn('Could not clear caches:', e);
    }

    // Clear in-memory subscription state
    setStripeSubscription(null);

    // Force refresh with cache-busting
    await fetchStripeSubscription(true);

    // Trigger subscription hook refresh by updating customerId dependency
    // This will cause useSubscription to re-fetch
    setLoading(null);
  };

  const handleBillingPortal = async () => {
    let customerIdToUse =
      customerId ||
      stripeSubscription?.customer ||
      stripeSubscription?.customerId;

    if (!customerIdToUse) {
      setError('Customer ID not found. Please contact support.');
      return;
    }

    setLoading('portal');
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customerIdToUse,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      window.location.href = data.url;
    } catch (err) {
      setError('Unable to access billing portal. Please try again.');
      console.error('Billing portal error:', err);
    } finally {
      setLoading(null);
    }
  };

  if (
    !displaySubscription ||
    ((displaySubscription as any)?.isSubscribed === false &&
      displaySubscription.status === 'free')
  ) {
    return (
      <div className='bg-zinc-800 rounded-lg p-4 w-full max-w-md border border-zinc-700'>
        <div className='text-center'>
          <h3 className='text-lg font-semibold text-white mb-2'>
            Start Your Cosmic Journey
          </h3>
          <p className='text-zinc-300 text-sm mb-4'>
            Unlock personalized horoscopes, birth charts, and mystical insights
          </p>
          <a
            href='/pricing'
            className='inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-md font-medium transition-all duration-300'
          >
            View Plans
          </a>
        </div>
      </div>
    );
  }

  const isActiveSubscription =
    displaySubscription.status === 'active' ||
    displaySubscription.status === 'trialing';
  const customerIdToUse = customerId || stripeSubscription?.customerId;

  return (
    <div className='bg-zinc-800 rounded-lg p-4 w-full max-w-md border border-zinc-700'>
      <div className='flex justify-between items-start mb-3'>
        <h3 className='text-lg font-semibold text-white'>Subscription</h3>
        <div className='flex items-center gap-2'>
          <button
            onClick={handleRefresh}
            disabled={loading === 'refresh'}
            className='p-1.5 rounded-md hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            title='Refresh subscription status'
          >
            <RefreshCw
              size={16}
              className={`text-zinc-400 ${loading === 'refresh' ? 'animate-spin' : ''}`}
            />
          </button>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              displaySubscription.status === 'active'
                ? 'bg-green-900 text-green-300'
                : displaySubscription.status === 'trialing'
                  ? 'bg-blue-900 text-blue-300'
                  : displaySubscription.status === 'canceled'
                    ? 'bg-yellow-900 text-yellow-300'
                    : 'bg-zinc-700 text-zinc-300'
            }`}
          >
            {displaySubscription.status === 'trialing'
              ? 'Free Trial'
              : displaySubscription.status === 'active'
                ? 'Active'
                : displaySubscription.status === 'canceled'
                  ? 'Ending Soon'
                  : displaySubscription.status}
          </div>
        </div>
      </div>

      <div className='space-y-2 mb-4'>
        <div className='flex justify-between'>
          <span className='text-zinc-400 text-sm'>Plan:</span>
          <span className='text-white text-sm font-medium'>
            {(() => {
              const plan =
                stripeSubscription?.plan || (displaySubscription as any)?.plan;
              if (plan === 'lunary_plus_ai_annual') return 'Lunary+ AI Annual';
              if (plan === 'lunary_plus_ai') return 'Lunary+ AI';
              if (plan === 'lunary_plus') return 'Lunary+';
              if (plan === 'yearly') return 'Lunary+ AI Annual';
              if (plan === 'monthly') return 'Lunary+ AI';
              return (
                stripeSubscription?.planName ||
                (displaySubscription as any)?.planName ||
                'Cosmic Guide'
              );
            })()}
          </span>
        </div>

        {displaySubscription.status === 'trialing' &&
          (stripeSubscription?.trialEnd ||
            (stripeSubscription as any)?.trial_end) && (
            <div className='flex justify-between'>
              <span className='text-zinc-400 text-sm'>Trial ends:</span>
              <span className='text-blue-300 text-sm'>
                {new Date(
                  ((stripeSubscription as any)?.trial_end ||
                    parseInt(stripeSubscription?.trialEnd || '0')) * 1000,
                ).toLocaleDateString()}
              </span>
            </div>
          )}

        {displaySubscription.status === 'active' &&
          (stripeSubscription?.currentPeriodEnd ||
            (stripeSubscription as any)?.current_period_end) && (
            <div className='flex justify-between'>
              <span className='text-zinc-400 text-sm'>Next billing:</span>
              <span className='text-white text-sm'>
                {new Date(
                  ((stripeSubscription as any)?.current_period_end ||
                    parseInt(stripeSubscription?.currentPeriodEnd || '0')) *
                    1000,
                ).toLocaleDateString()}
              </span>
            </div>
          )}

        {stripeSubscription?.cancelAtPeriodEnd && (
          <div className='flex justify-between'>
            <span className='text-zinc-400 text-sm'>Ends:</span>
            <span className='text-yellow-300 text-sm'>
              {new Date(
                ((stripeSubscription as any)?.current_period_end ||
                  parseInt(stripeSubscription?.currentPeriodEnd || '0')) * 1000,
              ).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className='bg-red-900/50 border border-red-500 text-red-300 px-3 py-2 rounded text-sm mb-3'>
          {error}
        </div>
      )}

      {isActiveSubscription && customerIdToUse && (
        <button
          onClick={handleBillingPortal}
          disabled={loading === 'portal'}
          className='w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white py-2 px-3 rounded-md transition-colors text-sm'
        >
          <Settings size={14} />
          {loading === 'portal' ? 'Opening...' : 'Manage Subscription'}
          <ExternalLink size={12} />
        </button>
      )}
    </div>
  );
}
