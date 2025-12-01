'use client';

import { useSubscription } from '../../hooks/useSubscription';

export default function TestSubscriptionPage() {
  const subscriptionStatus = useSubscription();

  return (
    <div className='min-h-screen bg-black text-white p-8'>
      <div className='max-w-2xl mx-auto'>
        <h1 className='text-3xl font-light mb-8'>Subscription Debug Tool</h1>

        <div className='space-y-6'>
          <div className='bg-gray-900 rounded-lg p-6'>
            <h2 className='text-xl font-medium mb-4'>
              Current Subscription Status (from Postgres)
            </h2>
            <div className='space-y-2 text-sm'>
              <p>
                Status:{' '}
                <span className='font-mono'>{subscriptionStatus.status}</span>
              </p>
              <p>
                Plan:{' '}
                <span className='font-mono'>{subscriptionStatus.plan}</span>
              </p>
              <p>
                Is Subscribed:{' '}
                <span className='font-mono'>
                  {subscriptionStatus.isSubscribed ? 'true' : 'false'}
                </span>
              </p>
              <p>
                Is Trial Active:{' '}
                <span className='font-mono'>
                  {subscriptionStatus.isTrialActive ? 'true' : 'false'}
                </span>
              </p>
              <p>
                Trial Days Remaining:{' '}
                <span className='font-mono'>
                  {subscriptionStatus.trialDaysRemaining}
                </span>
              </p>
              <p>
                Show Upgrade Prompt:{' '}
                <span className='font-mono'>
                  {subscriptionStatus.showUpgradePrompt ? 'true' : 'false'}
                </span>
              </p>
              <p>
                Customer ID:{' '}
                <span className='font-mono'>
                  {subscriptionStatus.customerId || 'none'}
                </span>
              </p>
            </div>
          </div>

          <div className='bg-gray-900 rounded-lg p-6'>
            <h2 className='text-xl font-medium mb-4'>Info</h2>
            <p className='text-sm text-gray-400'>
              Subscription data is now stored in Postgres via Stripe webhooks.
              Jazz profile sync has been removed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
