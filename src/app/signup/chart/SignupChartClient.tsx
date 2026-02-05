'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStatus } from '@/components/AuthStatus';
import { AuthComponent } from '@/components/Auth';
import { Heading } from '@/components/ui/Heading';
import {
  trackCtaImpression,
  trackCtaClick,
  conversionTracking,
} from '@/lib/analytics';
import { captureEvent } from '@/lib/posthog-client';

const FEATURES = [
  'Your personal birth chart overview and key placements',
  'Daily moon phase insights + general horoscope',
  'Tarot card of the day + basic lunar calendar',
  'Grimoire library for astrology, tarot, and rituals',
  'Weekly AI ritual/reading to get started',
];

const SIGNUP_SOURCE_KEY = 'lunary.signup.source';

export default function SignupChartClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authState = useAuthStatus();
  const impressionTracked = useRef(false);

  const hub = searchParams.get('hub') || '';
  const headline = searchParams.get('headline') || 'Unlock your personal chart';
  const subline =
    searchParams.get('subline') ||
    'Create a free account to see your full birth chart, placements, and personalised insights.';
  const location = searchParams.get('location') || 'seo_contextual_nudge';
  const pagePath = searchParams.get('pagePath') || '';

  // Redirect authenticated users to /app
  useEffect(() => {
    if (authState.isAuthenticated) {
      router.replace('/app');
    }
  }, [authState.isAuthenticated, router]);

  // Track impression on mount
  useEffect(() => {
    if (impressionTracked.current) return;
    impressionTracked.current = true;

    trackCtaImpression({
      ctaId: 'grimoire_signup_page',
      hub,
      location,
      label: 'signup_page_view',
      pagePath,
    });

    captureEvent('grimoire_signup_page_viewed', {
      hub,
      location,
      pagePath,
      variant: 'value-prop',
    });
  }, [hub, location, pagePath]);

  const handleAuthSuccess = () => {
    // Mark source for onboarding
    try {
      sessionStorage.setItem(SIGNUP_SOURCE_KEY, 'grimoire');
    } catch {}

    // Track completion via ether pipeline
    trackCtaClick({
      ctaId: 'grimoire_signup_page_auth_complete',
      hub,
      location,
      label: 'auth_complete',
      pagePath,
    });

    conversionTracking.signup();

    // Track completion via PostHog
    captureEvent('grimoire_signup_completed', {
      hub,
      location,
      pagePath,
      variant: 'value-prop',
    });

    // Redirect to app — onboarding flow triggers automatically for new users
    router.push('/app');
  };

  // Don't render page for authenticated users
  if (authState.isAuthenticated) return null;

  return (
    <div className='min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-12'>
      <div className='w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start'>
        {/* Value proposition panel */}
        <div className='rounded-lg border border-zinc-800 bg-zinc-900/40 p-6'>
          <Heading variant='h2' className='mb-1 text-white'>
            {headline}
          </Heading>
          <p className='text-zinc-400 text-sm mb-6'>{subline}</p>

          <p className='text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3'>
            Included free
          </p>
          <ul className='space-y-3'>
            {FEATURES.map((feature) => (
              <li
                key={feature}
                className='flex items-start gap-2 text-sm text-zinc-300'
              >
                <span className='text-lunary-accent-300 mt-0.5 flex-shrink-0'>
                  &#10022;
                </span>
                {feature}
              </li>
            ))}
          </ul>

          <p className='text-zinc-500 text-xs mt-6'>
            No credit card &middot; No spam &middot; Takes 30 seconds
          </p>
        </div>

        {/* Auth form panel */}
        <div>
          <Heading variant='h2' className='mb-4 text-white'>
            Create your free account
          </Heading>
          <AuthComponent
            compact={false}
            defaultToSignUp
            onSuccess={handleAuthSuccess}
          />
        </div>
      </div>
    </div>
  );
}
