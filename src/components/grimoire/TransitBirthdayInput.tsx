'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sparkles, Lock, ChevronRight, Zap } from 'lucide-react';
import { useAuthStatus } from '@/components/AuthStatus';
import { AuthComponent } from '@/components/Auth';
import { useModal } from '@/hooks/useModal';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/Heading';
import { trackCtaClick, trackCtaImpression } from '@/lib/analytics';
import { getABTestVariantClient } from '@/lib/ab-tests-client';
import { zodiacUnicode, planetUnicode } from '../../../utils/zodiac/zodiac';

type Placement = {
  body: string;
  sign: string;
  degree: number;
};

type Transit = {
  transitPlanet: string;
  transitSign: string;
  aspect: string;
  description: string;
  natalPlanet: string;
  natalSign: string;
  flavour: string;
};

const BODY_SYMBOLS: Record<string, string> = {
  Sun: planetUnicode.sun,
  Moon: planetUnicode.moon,
  Mercury: planetUnicode.mercury,
  Venus: planetUnicode.venus,
  Mars: planetUnicode.mars,
  Jupiter: '♃',
  Saturn: '♄',
};

const SIGN_SYMBOLS: Record<string, string> = Object.fromEntries(
  Object.entries(zodiacUnicode).map(([key, val]) => [
    key.charAt(0).toUpperCase() + key.slice(1),
    val,
  ]),
);

const ASPECT_COLOURS: Record<string, string> = {
  conjunction: 'text-content-brand-accent',
  trine: 'text-emerald-400',
  sextile: 'text-sky-400',
  square: 'text-amber-400',
  opposition: 'text-red-400',
};

export function TransitBirthdayInput() {
  const authState = useAuthStatus();
  const router = useRouter();
  const pathname = usePathname() || '';
  const signupPageVariant = getABTestVariantClient('grimoire-signup-page');
  const impressionTracked = useRef(false);

  const [birthDate, setBirthDate] = useState('');
  const [placements, setPlacements] = useState<Placement[] | null>(null);
  const [transits, setTransits] = useState<Transit[]>([]);
  const [transitCount, setTransitCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Track impression on mount (for anonymous users only)
  useEffect(() => {
    if (!impressionTracked.current && !authState.isAuthenticated) {
      impressionTracked.current = true;
      trackCtaImpression({
        hub: 'horoscope',
        ctaId: 'transit_teaser_input',
        location: 'seo_transit_teaser',
        label: 'Show my transits',
        pagePath: pathname,
      });
    }
  }, [authState.isAuthenticated, pathname]);

  useModal({
    isOpen: showAuthModal,
    onClose: () => setShowAuthModal(false),
    closeOnClickOutside: false,
  });

  const handleSubmit = async () => {
    if (!birthDate) return;

    trackCtaClick({
      hub: 'horoscope',
      ctaId: 'transit_teaser_input',
      location: 'seo_transit_teaser',
      label: 'Show my transits',
      pagePath: pathname,
    });

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/transit-preview?date=${birthDate}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong');
        return;
      }
      const data = await res.json();
      setPlacements(data.placements);
      setTransits(data.transits || []);
      setTransitCount(data.transitCount || 0);
    } catch {
      setError('Failed to load preview');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = () => {
    trackCtaClick({
      hub: 'horoscope',
      ctaId: 'transit_teaser_unlock',
      location: 'seo_transit_teaser',
      label: 'See your full chart',
      pagePath: pathname,
    });

    if (!authState.isAuthenticated) {
      if (signupPageVariant === 'value-prop') {
        const params = new URLSearchParams({
          hub: 'horoscope',
          headline: 'See your full birth chart',
          subline:
            'All your placements, houses, and aspects with detailed readings',
          location: 'seo_transit_teaser',
          pagePath: pathname,
          ...(birthDate ? { birthDate } : {}),
        });
        router.push(`/signup/chart?${params.toString()}`);
      } else {
        setShowAuthModal(true);
      }
      return;
    }

    router.push('/birth-chart');
  };

  if (authState.isAuthenticated) {
    return (
      <button
        onClick={() => router.push('/horoscope')}
        className='w-full text-left text-xs text-lunary-accent-400 hover:text-content-brand-accent transition-colors'
      >
        See how these transits hit your chart →
      </button>
    );
  }

  if (!placements) {
    return (
      <>
        <p className='text-xs text-content-muted mb-3'>
          These transits affect all suns differently depending on your birth
          chart.
        </p>
        <div className='flex flex-col sm:flex-row gap-2'>
          <input
            type='date'
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            min='1900-01-01'
            max='2030-12-31'
            className='flex-1 rounded-lg bg-surface-card/80 border border-stroke-default px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-lunary-primary-500/50 focus:border-lunary-primary-500'
            aria-label='Birth date'
          />
          <Button
            onClick={handleSubmit}
            disabled={!birthDate || loading}
            variant='lunary-soft'
            size='sm'
            className='whitespace-nowrap'
          >
            {loading ? (
              <span className='flex items-center gap-2'>
                <span className='animate-spin h-3.5 w-3.5 border-2 border-lunary-primary-400 border-t-transparent rounded-full' />
                Calculating...
              </span>
            ) : (
              <span className='flex items-center gap-2'>
                <Sparkles className='w-3.5 h-3.5' />
                Show my transits
              </span>
            )}
          </Button>
        </div>
        {error && <p className='text-sm text-red-400 mt-2'>{error}</p>}
      </>
    );
  }

  return (
    <>
      <div className='space-y-3'>
        {/* Active transits */}
        {transits.length > 0 && (
          <div className='space-y-1.5'>
            <p className='text-xs font-medium text-lunary-accent-400 uppercase tracking-wide flex items-center gap-1.5'>
              <Zap className='w-3 h-3' />
              Active transits to your chart
            </p>
            {transits.map((t, i) => (
              <div
                key={i}
                className='px-3 py-2 rounded-lg bg-surface-card/50 border border-stroke-default/50'
              >
                <p className='text-sm text-content-primary'>
                  <span className='font-medium'>
                    <span className='font-astro'>
                      {BODY_SYMBOLS[t.transitPlanet] || ''}
                    </span>{' '}
                    {t.transitPlanet} in{' '}
                    <span className='font-astro'>
                      {SIGN_SYMBOLS[t.transitSign] || ''}
                    </span>{' '}
                    {t.transitSign}
                  </span>{' '}
                  <span
                    className={ASPECT_COLOURS[t.aspect] || 'text-content-muted'}
                  >
                    {t.aspect}
                  </span>{' '}
                  your natal{' '}
                  <span className='font-medium'>
                    <span className='font-astro'>
                      {BODY_SYMBOLS[t.natalPlanet] || ''}
                    </span>{' '}
                    {t.natalPlanet} in{' '}
                    <span className='font-astro'>
                      {SIGN_SYMBOLS[t.natalSign] || ''}
                    </span>{' '}
                    {t.natalSign}
                  </span>
                </p>
                <p className='text-xs text-content-muted mt-0.5'>
                  Themes: {t.flavour}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Blurred detail */}
        <div className='relative'>
          <div className='space-y-2 blur-sm select-none pointer-events-none'>
            <p className='text-xs font-medium text-content-muted uppercase tracking-wide'>
              What this means for you
            </p>
            <p className='text-sm text-content-secondary'>
              This transit is activating your 7th house of partnerships,
              bringing new energy to your relationships and how you collaborate
              with others. Pay attention to...
            </p>
          </div>
          <div className='absolute inset-0 flex items-center justify-center'>
            <Lock className='w-5 h-5 text-content-muted' />
          </div>
        </div>

        {/* Unlock CTA */}
        <button
          onClick={handleUnlock}
          className='w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-layer-high/60 to-lunary-primary-600/40 border border-lunary-primary-600/50 text-sm font-medium text-content-secondary hover:from-layer-high/80 hover:to-lunary-primary-600/60 transition-all group'
        >
          <Sparkles className='w-4 h-4' />
          See what {transitCount > 3 ? `all ${transitCount}` : 'your'} transits
          mean for you
          <ChevronRight className='w-4 h-4 transition-transform group-hover:translate-x-0.5' />
        </button>
        <p className='text-xs text-content-muted text-center'>
          7 days of full access — personalised transits, chart readings, and
          more. No card needed.
        </p>
      </div>

      {showAuthModal && (
        <div className='fixed inset-0 bg-surface-base/40 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <div className='bg-surface-elevated rounded-xl p-6 sm:p-8 w-full max-w-md relative mx-4 sm:mx-0 shadow-lg shadow-black/50'>
            <Button
              variant='ghost'
              onClick={() => setShowAuthModal(false)}
              aria-label='Close sign in modal'
            >
              x
            </Button>
            <div className='text-center mb-4'>
              <Heading variant='h3' className='mb-2'>
                See your full transit report
              </Heading>
              <p className='text-content-secondary text-xs sm:text-sm'>
                Sign up to unlock 7 days of personalised daily transits, your
                full chart, and detailed interpretations. No card needed.
              </p>
            </div>
            <AuthComponent
              compact={false}
              defaultToSignUp
              birthDate={birthDate || undefined}
              onSuccess={() => {
                setShowAuthModal(false);
                router.push('/birth-chart');
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
