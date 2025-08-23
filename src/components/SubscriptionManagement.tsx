'use client';

import { useState, useEffect } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { Settings, ExternalLink } from 'lucide-react';

interface SubscriptionManagementProps {
  customerId?: string;
  subscriptionId?: string;
}

interface StripeSubscription {
  id: string;
  status: string;
  customerId: string;
  planName: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
}

export default function SubscriptionManagement({
  customerId,
  subscriptionId,
}: SubscriptionManagementProps) {
  const subscription = useSubscription();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stripeSubscription, setStripeSubscription] =
    useState<StripeSubscription | null>(null);

  const displaySubscription = stripeSubscription || subscription;

  useEffect(() => {
    const fetchStripeSubscription = async () => {
      const customerIdToUse = customerId || subscription.customerId;
      if (!customerIdToUse) return;

      try {
        const response = await fetch('/api/stripe/get-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: customerIdToUse,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.subscription) {
            setStripeSubscription(data.subscription);
          }
        }
      } catch (error) {
        console.error('Error fetching Stripe subscription:', error);
      }
    };

    fetchStripeSubscription();
  }, [customerId, subscription.customerId]);

  const handleBillingPortal = async () => {
    let customerIdToUse = customerId || stripeSubscription?.customerId;

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
    (displaySubscription as any)?.isSubscribed === false &&
    displaySubscription.status === 'free'
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

      <div className='space-y-2 mb-4'>
        <div className='flex justify-between'>
          <span className='text-zinc-400 text-sm'>Plan:</span>
          <span className='text-white text-sm font-medium'>
            {stripeSubscription?.planName ||
              displaySubscription.planName ||
              'Cosmic Guide'}
          </span>
        </div>

        {displaySubscription.status === 'trialing' &&
          stripeSubscription?.trialEnd && (
            <div className='flex justify-between'>
              <span className='text-zinc-400 text-sm'>Trial ends:</span>
              <span className='text-blue-300 text-sm'>
                {new Date(
                  parseInt(stripeSubscription.trialEnd) * 1000,
                ).toLocaleDateString()}
              </span>
            </div>
          )}

        {displaySubscription.status === 'active' &&
          stripeSubscription?.currentPeriodEnd && (
            <div className='flex justify-between'>
              <span className='text-zinc-400 text-sm'>Next billing:</span>
              <span className='text-white text-sm'>
                {new Date(
                  parseInt(stripeSubscription.currentPeriodEnd) * 1000,
                ).toLocaleDateString()}
              </span>
            </div>
          )}

        {stripeSubscription?.cancelAtPeriodEnd && (
          <div className='flex justify-between'>
            <span className='text-zinc-400 text-sm'>Ends:</span>
            <span className='text-yellow-300 text-sm'>
              {new Date(
                parseInt(stripeSubscription.currentPeriodEnd) * 1000,
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
