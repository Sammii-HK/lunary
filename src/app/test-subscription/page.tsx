'use client';

import { useState } from 'react';
import { useAccount } from 'jazz-tools/react';
import { createTrialSubscriptionInProfile } from '../../../utils/subscription';
import { useSubscription } from '../../hooks/useSubscription';

export default function TestSubscriptionPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  let me: any, profile: any;
  try {
    const account = useAccount();
    me = account.me;
    profile = me?.profile;
  } catch (error) {
    console.log('Jazz account not available');
  }

  const subscriptionStatus = useSubscription();

  const createTrial = async () => {
    if (!profile) {
      setResult(
        '❌ No Jazz profile found - make sure you have entered your name/birthday in /profile',
      );
      return;
    }

    setLoading(true);
    try {
      const createResult = await createTrialSubscriptionInProfile(profile);
      console.log('Manual trial creation result:', createResult);

      if (createResult.success) {
        setResult('✅ Trial subscription created successfully!');
        console.log(
          'Profile after manual trial creation:',
          (profile as any).subscription,
        );
      } else {
        setResult(`❌ Failed to create trial: ${createResult.error}`);
      }
    } catch (error) {
      setResult(
        `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-black text-white p-8'>
      <div className='max-w-2xl mx-auto'>
        <h1 className='text-3xl font-light mb-8'>Subscription Debug Tool</h1>

        <div className='space-y-6'>
          {/* Jazz Profile Status */}
          <div className='bg-gray-900 rounded-lg p-6'>
            <h2 className='text-xl font-medium mb-4'>Jazz Profile Status</h2>
            <div className='space-y-2 text-sm'>
              <p>Account: {me ? '✅ Connected' : '❌ Not connected'}</p>
              <p>Profile: {profile ? '✅ Found' : '❌ Not found'}</p>
              <p>
                Existing Subscription:{' '}
                {(profile as any)?.subscription ? '✅ Yes' : '❌ No'}
              </p>
            </div>
          </div>

          {/* Current Subscription Status */}
          <div className='bg-gray-900 rounded-lg p-6'>
            <h2 className='text-xl font-medium mb-4'>
              Current Subscription Status
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
            </div>
          </div>

          {/* Manual Trial Creation */}
          <div className='bg-gray-900 rounded-lg p-6'>
            <h2 className='text-xl font-medium mb-4'>Manual Trial Creation</h2>
            <button
              onClick={createTrial}
              disabled={loading || !profile}
              className='bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? 'Creating...' : 'Create Trial Subscription'}
            </button>

            {result && (
              <div className='mt-4 p-3 bg-gray-800 rounded-lg'>
                <p className='text-sm'>{result}</p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className='bg-gray-900 rounded-lg p-6'>
            <h2 className='text-xl font-medium mb-4'>Instructions</h2>
            <div className='space-y-2 text-sm text-gray-400'>
              <p>
                1. First, make sure you have a Jazz profile by visiting{' '}
                <a href='/profile' className='text-blue-400 underline'>
                  /profile
                </a>{' '}
                and entering your name/birthday
              </p>
              <p>2. Click "Create Trial Subscription" above</p>
              <p>3. Check if "Show Upgrade Prompt" changes to false</p>
              <p>
                4. Navigate to other pages - the upgrade popup should disappear
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
