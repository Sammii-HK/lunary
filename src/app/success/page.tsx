'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAccount } from 'jazz-tools/react';
import { useSubscriptionSync } from '../../hooks/useSubscriptionSync';
import { createTrialSubscriptionInProfile } from '../../../utils/subscription';

interface CheckoutSession {
  id: string;
  status: string;
  customer_email: string;
  customer_id: string;
  subscription: {
    id: string;
    status: string;
    trial_end: number | null;
    current_period_end: number;
  };
}

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  // Try to get Jazz account
  let me: any, profile: any;
  try {
    const account = useAccount();
    me = account.me;
    profile = me?.profile;
  } catch (error) {
    console.log('Jazz account not available');
  }


  const [trialCreated, setTrialCreated] = useState(false);

  useEffect(() => {
    async function createTrial() {
      console.log(
        'createTrial effect - session:',
        !!session?.subscription,
        'profile:',
        !!profile,
        'trialCreated:',
        trialCreated,
        'existingSubscription:',
        !!(profile as any)?.subscription,
      );

      if (
        session?.subscription &&
        profile &&
        !trialCreated &&
        !(profile as any).subscription
      ) {
        try {
          if (session.customer_id) {
            (profile as any).stripeCustomerId = session.customer_id;
          }
          const result = await createTrialSubscriptionInProfile(profile);
          console.log('Trial creation result:', result);
          if (result.success) {
            setTrialCreated(true);
          } else {
            console.error('Trial creation failed:', result);
          }
        } catch (error) {
          console.error('Error creating trial subscription:', error);
        }
      } else {
        console.log('Skipping trial creation - conditions not met');
      }
    }

    createTrial();
  }, [session, profile, trialCreated]);

  // Create a mock sync result for the UI
  const syncResult = {
    loading: false,
    synced: trialCreated,
    error: !trialCreated && profile ? 'Waiting for trial creation' : undefined,
  };

  useEffect(() => {
    if (sessionId) {
      fetchSession(sessionId);
    } else {
      setError('No session ID provided');
      setLoading(false);
    }
  }, [sessionId]);

  const fetchSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/stripe/session/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch session');
      }
      const data = await response.json();
      setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-black text-white flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4'></div>
          <p className='text-lg'>Confirming your subscription...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-black text-white flex items-center justify-center px-4'>
        <div className='text-center max-w-md'>
          <h1 className='text-3xl font-light mb-4'>Something went wrong</h1>
          <p className='text-gray-400 mb-8'>{error}</p>
          <Link
            href='/pricing'
            className='bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors'
          >
            Back to Pricing
          </Link>
        </div>
      </div>
    );
  }

  const isTrialActive =
    session?.subscription?.trial_end &&
    session.subscription.trial_end > Date.now() / 1000;

  return (
    <div className='min-h-screen bg-black text-white'>
      <div className='max-w-4xl mx-auto px-6 py-16'>
        <div className='text-center mb-12'>
          <div className='w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6'>
            <svg
              className='w-8 h-8 text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
          </div>

          <h1 className='text-4xl font-light mb-4'>
            Welcome to your cosmic journey
          </h1>

          <p className='text-xl text-gray-400 mb-8'>
            {isTrialActive
              ? 'Your free trial has started successfully!'
              : 'Your subscription is now active!'}
          </p>
        </div>

        {session && (
          <div className='bg-gray-900 rounded-lg p-8 mb-8'>
            <h2 className='text-2xl font-light mb-6'>Subscription Details</h2>

            {/* Sync Status Indicator */}
            {profile && (
              <div className='mb-4 p-3 rounded-lg bg-gray-800 border border-gray-700'>
                <div className='flex items-center gap-3'>
                  {syncResult.loading ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400'></div>
                      <span className='text-sm text-blue-400'>
                        Syncing subscription to your profile...
                      </span>
                    </>
                  ) : syncResult.synced ? (
                    <>
                      <div className='w-4 h-4 bg-green-500 rounded-full'></div>
                      <span className='text-sm text-green-400'>
                        ✅ Subscription synced to your cosmic profile
                      </span>
                    </>
                  ) : syncResult.error ? (
                    <>
                      <div className='w-4 h-4 bg-yellow-500 rounded-full'></div>
                      <span className='text-sm text-yellow-400'>
                        ⚠️ Subscription will sync when you log in
                      </span>
                    </>
                  ) : null}
                </div>
              </div>
            )}

            <div className='grid gap-4 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Email:</span>
                <span>{session.customer_email}</span>
              </div>

              <div className='flex justify-between'>
                <span className='text-gray-400'>Status:</span>
                <span className='capitalize'>
                  {session.subscription.status}
                </span>
              </div>

              {isTrialActive && session.subscription.trial_end && (
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Trial ends:</span>
                  <span>{formatDate(session.subscription.trial_end)}</span>
                </div>
              )}

              <div className='flex justify-between'>
                <span className='text-gray-400'>Next billing:</span>
                <span>
                  {formatDate(session.subscription.current_period_end)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className='bg-gray-900 rounded-lg p-8 mb-8'>
          <h2 className='text-2xl font-light mb-6'>
            What&apos;s unlocked for you:
          </h2>

          <div className='grid md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <div className='flex items-start gap-3'>
                <div className='w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0'></div>
                <div>
                  <h3 className='font-medium mb-1'>Complete Birth Chart</h3>
                  <p className='text-sm text-gray-400'>
                    Detailed planetary positions, aspects, and cosmic patterns
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-3'>
                <div className='w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0'></div>
                <div>
                  <h3 className='font-medium mb-1'>
                    Daily Personalized Horoscope
                  </h3>
                  <p className='text-sm text-gray-400'>
                    Cosmic guidance tailored to your unique chart
                  </p>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-start gap-3'>
                <div className='w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0'></div>
                <div>
                  <h3 className='font-medium mb-1'>Crystal Recommendations</h3>
                  <p className='text-sm text-gray-400'>
                    Daily crystal guidance based on your energy
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-3'>
                <div className='w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0'></div>
                <div>
                  <h3 className='font-medium mb-1'>Tarot Pattern Analysis</h3>
                  <p className='text-sm text-gray-400'>
                    Deep insights into your cosmic trends
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='text-center space-y-4'>
          <Link
            href='/profile'
            className='bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors inline-block mr-4'
          >
            Complete Your Profile
          </Link>

          <Link
            href='/'
            className='border border-white text-white px-8 py-3 rounded-full font-medium hover:bg-white hover:text-black transition-colors inline-block'
          >
            Explore Your Cosmic Dashboard
          </Link>
        </div>

        {isTrialActive && (
          <div className='mt-12 text-center'>
            <p className='text-sm text-gray-400'>
              Enjoying your trial? Your subscription will automatically continue
              after the trial period.
              <br />
              You can manage your subscription anytime from your profile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
