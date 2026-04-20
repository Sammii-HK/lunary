'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStatus } from '@/components/AuthStatus';
import { AuthComponent } from '@/components/Auth';
import { Heading } from '@/components/ui/Heading';
import { trackCtaImpression, conversionTracking } from '@/lib/analytics';
import { captureEvent } from '@/lib/posthog-client';
import { getABTestVariantClient } from '@/lib/ab-tests-client';

const FEATURES = [
  'Your full birth chart with all placements and aspects',
  '7 days of personalised daily tarot, transits, and horoscopes',
  'Astral Guide — ask questions about your chart',
  'Moon phase rituals personalised to your natal Moon',
  '2,000+ grimoire articles on astrology, tarot, and crystals',
];

const SIGNUP_SOURCE_KEY = 'lunary.signup.source';

export default function SignupChartClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authState = useAuthStatus();
  const impressionTracked = useRef(false);

  const abVariant =
    getABTestVariantClient('grimoire-signup-page') || 'value-prop';

  const hub = searchParams.get('hub') || '';
  const headline = searchParams.get('headline') || 'Unlock your personal chart';
  const subline =
    searchParams.get('subline') ||
    'Sign up to see your full birth chart, placements, and 7 days of personalised insights.';
  const location = searchParams.get('location') || 'seo_contextual_nudge';
  const pagePath = searchParams.get('pagePath') || '';
  const sign = searchParams.get('sign') || '';
  const proposition = searchParams.get('proposition') || '';
  const upsellVariant = searchParams.get('upsellVariant') || '';

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
      abTest: 'grimoire_signup_page',
      abVariant,
    });

    captureEvent('grimoire_signup_page_viewed', {
      hub,
      location,
      pagePath,
      variant: abVariant,
      sign: sign || undefined,
      proposition: proposition || undefined,
      upsellVariant: upsellVariant || undefined,
    });
  }, [abVariant, hub, location, pagePath, proposition, sign, upsellVariant]);

  const handleAuthSuccess = () => {
    // Mark source for onboarding
    try {
      sessionStorage.setItem(SIGNUP_SOURCE_KEY, 'grimoire');
    } catch {}

    // Track signup completion — use trackCtaImpression instead of trackCtaClick
    // so we don't overwrite the original CTA attribution in sessionStorage
    trackCtaImpression({
      ctaId: 'grimoire_signup_page_auth_complete',
      hub,
      location,
      label: 'auth_complete',
      pagePath,
      abTest: 'grimoire_signup_page',
      abVariant,
    });

    conversionTracking.signup();

    // Track completion via PostHog
    captureEvent('grimoire_signup_completed', {
      hub,
      location,
      pagePath,
      variant: abVariant,
      sign: sign || undefined,
      proposition: proposition || undefined,
      upsellVariant: upsellVariant || undefined,
    });

    // Redirect to app — onboarding flow triggers automatically for new users
    router.push('/app');
  };

  // Don't render page for authenticated users
  if (authState.isAuthenticated) return null;

  return (
    <div className='min-h-screen bg-surface-base flex items-center justify-center px-4 py-12'>
      <div className='w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start'>
        {/* Value proposition panel */}
        <div className='rounded-lg border border-stroke-subtle bg-surface-elevated/40 p-6'>
          <Heading variant='h2' className='mb-1 text-content-primary'>
            {headline}
          </Heading>
          <p className='text-content-muted text-sm mb-6'>{subline}</p>

          <p className='text-xs font-semibold uppercase tracking-wider text-content-muted mb-3'>
            What you get
          </p>
          <ul className='space-y-3'>
            {FEATURES.map((feature) => (
              <li
                key={feature}
                className='flex items-start gap-2 text-sm text-content-secondary'
              >
                <span className='text-content-brand-accent mt-0.5 flex-shrink-0'>
                  &#10022;
                </span>
                {feature}
              </li>
            ))}
          </ul>

          <p className='text-content-muted text-xs mt-6'>
            No credit card &middot; No spam &middot; Takes 30 seconds
          </p>
        </div>

        {/* Auth form panel */}
        <div>
          <Heading variant='h2' className='mb-4 text-content-primary'>
            Start your free trial
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
