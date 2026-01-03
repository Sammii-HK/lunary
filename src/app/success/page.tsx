'use client';

import { useEffect, useState } from 'react';
import { useSafeSearchParams } from '@/lib/safeSearchParams';
import Link from 'next/link';
import { conversionTracking } from '@/lib/analytics';
import { Button } from '@/components/ui/button';

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
    metadata?: {
      planType?: string;
      plan_id?: string;
    };
  };
  metadata?: {
    planType?: string;
    plan_id?: string;
  };
}

export default function SuccessPage() {
  const searchParams = useSafeSearchParams();
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    async function syncToPostgres() {
      if (!session?.subscription || synced) return;

      try {
        if (session.customer_id || session.customer_email) {
          await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              stripeCustomerId: session.customer_id,
              stripeSubscriptionId: session.subscription?.id,
              userEmail:
                session.customer_email && session.customer_email !== 'Unknown'
                  ? session.customer_email
                  : undefined,
            }),
          });
        }

        const planType =
          session.subscription?.metadata?.planType ||
          session.metadata?.planType ||
          'monthly';
        const isTrial =
          session.subscription?.trial_end &&
          session.subscription.trial_end > Date.now() / 1000;

        if (isTrial) {
          conversionTracking.trialStarted(
            undefined,
            session.customer_email,
            planType as 'monthly' | 'yearly',
          );

          try {
            const trialDays = planType === 'yearly' ? 14 : 7;
            await fetch('/api/emails/trial-welcome', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: session.customer_email,
                userName: 'there',
                trialDaysRemaining: trialDays,
                planType,
              }),
            });
          } catch (emailError) {
            console.error('Failed to send trial welcome email:', emailError);
          }
        } else {
          conversionTracking.subscriptionStarted(
            undefined,
            session.customer_email,
            planType as 'monthly' | 'yearly',
          );
        }

        setSynced(true);
      } catch (error) {
        console.error('Error syncing subscription:', error);
        setSynced(true);
      }
    }

    if (session && !synced) {
      syncToPostgres();
    }
  }, [session, synced]);

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
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-lunary-accent mx-auto mb-4'></div>
          <p className='text-lg text-lunary-accent-300'>
            Confirming your subscription...
          </p>
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
          <Button
            variant='lunary-white'
            size='lg'
            className='rounded-full'
            asChild
          >
            <Link href='/pricing'>Back to Pricing</Link>
          </Button>
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
          <div className='w-20 h-20 bg-gradient-to-br from-lunary-accent to-lunary-highlight rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(199,125,255,0.4)]'>
            <svg
              className='w-10 h-10 text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2.5}
                d='M5 13l4 4L19 7'
              />
            </svg>
          </div>

          <h1 className='text-5xl font-light mb-4 bg-gradient-to-r from-lunary-accent to-lunary-highlight bg-clip-text text-transparent'>
            Welcome to your cosmic journey
          </h1>

          <p className='text-xl text-lunary-accent-300 mb-8'>
            {isTrialActive
              ? 'Your free trial has started successfully!'
              : 'Your subscription is now active!'}
          </p>
        </div>

        {session && (
          <div className='bg-gradient-to-br from-lunary-primary-950/50 to-lunary-accent-950/30 rounded-xl p-8 mb-8 border border-lunary-primary-800/30'>
            <h2 className='text-2xl font-light mb-6 text-lunary-accent-200'>
              Subscription Details
            </h2>

            {synced && (
              <div className='mb-6 p-4 rounded-lg bg-lunary-success/10 border border-lunary-success/30'>
                <div className='flex items-center gap-3'>
                  <div className='w-3 h-3 bg-lunary-success rounded-full animate-pulse'></div>
                  <span className='text-sm text-lunary-success font-medium'>
                    Subscription synced to your profile
                  </span>
                </div>
              </div>
            )}

            <div className='grid gap-4 text-sm'>
              <div className='flex justify-between py-2 border-b border-lunary-primary-900/50'>
                <span className='text-lunary-accent-400'>Email:</span>
                <span className='text-white'>{session.customer_email}</span>
              </div>

              <div className='flex justify-between py-2 border-b border-lunary-primary-900/50'>
                <span className='text-lunary-accent-400'>Status:</span>
                <span className='capitalize text-lunary-highlight font-medium'>
                  {session.subscription.status}
                </span>
              </div>

              {isTrialActive && session.subscription.trial_end && (
                <div className='flex justify-between py-2 border-b border-lunary-primary-900/50'>
                  <span className='text-lunary-accent-400'>Trial ends:</span>
                  <span className='text-white'>
                    {formatDate(session.subscription.trial_end)}
                  </span>
                </div>
              )}

              <div className='flex justify-between py-2'>
                <span className='text-lunary-accent-400'>Next billing:</span>
                <span className='text-white'>
                  {formatDate(session.subscription.current_period_end)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className='bg-gradient-to-br from-lunary-primary-950/50 to-lunary-accent-950/30 rounded-xl p-8 mb-8 border border-lunary-primary-800/30'>
          <h2 className='text-2xl font-light mb-6 text-lunary-accent-200'>
            What&apos;s unlocked for you:
          </h2>

          <div className='grid md:grid-cols-2 gap-6'>
            <div className='space-y-5'>
              <div className='flex items-start gap-4 group'>
                <div className='w-2.5 h-2.5 bg-gradient-to-br from-lunary-accent to-lunary-highlight rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform shadow-[0_0_8px_rgba(199,125,255,0.6)]'></div>
                <div>
                  <h3 className='font-medium mb-1.5 text-lunary-accent-200 group-hover:text-lunary-accent transition-colors'>
                    Complete Birth Chart
                  </h3>
                  <p className='text-sm text-lunary-accent-400/80'>
                    Detailed planetary positions, aspects, and cosmic patterns
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-4 group'>
                <div className='w-2.5 h-2.5 bg-gradient-to-br from-lunary-accent to-lunary-highlight rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform shadow-[0_0_8px_rgba(199,125,255,0.6)]'></div>
                <div>
                  <h3 className='font-medium mb-1.5 text-lunary-accent-200 group-hover:text-lunary-accent transition-colors'>
                    Daily Personalized Horoscope
                  </h3>
                  <p className='text-sm text-lunary-accent-400/80'>
                    Cosmic guidance tailored to your unique chart
                  </p>
                </div>
              </div>
            </div>

            <div className='space-y-5'>
              <div className='flex items-start gap-4 group'>
                <div className='w-2.5 h-2.5 bg-gradient-to-br from-lunary-accent to-lunary-highlight rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform shadow-[0_0_8px_rgba(199,125,255,0.6)]'></div>
                <div>
                  <h3 className='font-medium mb-1.5 text-lunary-accent-200 group-hover:text-lunary-accent transition-colors'>
                    Crystal Recommendations
                  </h3>
                  <p className='text-sm text-lunary-accent-400/80'>
                    Daily crystal guidance based on your energy
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-4 group'>
                <div className='w-2.5 h-2.5 bg-gradient-to-br from-lunary-accent to-lunary-highlight rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform shadow-[0_0_8px_rgba(199,125,255,0.6)]'></div>
                <div>
                  <h3 className='font-medium mb-1.5 text-lunary-accent-200 group-hover:text-lunary-accent transition-colors'>
                    Tarot Pattern Analysis
                  </h3>
                  <p className='text-sm text-lunary-accent-400/80'>
                    Deep insights into your cosmic trends
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='flex flex-wrap justify-center items-center gap-4'>
          <Button variant='lunary' size='lg' asChild>
            <Link href='/profile'>Complete Your Profile</Link>
          </Button>

          <Button variant='lunary-soft' size='lg' asChild>
            <Link href='/'>Explore Your Cosmic Dashboard</Link>
          </Button>
        </div>

        {isTrialActive && (
          <div className='mt-12 text-center'>
            <p className='text-sm text-lunary-accent-400'>
              Enjoying your trial? Your subscription will automatically continue
              after the trial period.
              <br />
              <span className='text-lunary-accent-300'>
                You can manage your subscription anytime from your profile.
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
