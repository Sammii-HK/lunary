'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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

interface ChartPreviewTeaserProps {
  hub?: string;
}

export function ChartPreviewTeaser({
  hub = 'astrology',
}: ChartPreviewTeaserProps) {
  const authState = useAuthStatus();
  const router = useRouter();
  const pathname = usePathname() || '';
  const signupPageVariant = getABTestVariantClient('grimoire-signup-page');

  const [birthDate, setBirthDate] = useState('');
  const [placements, setPlacements] = useState<Placement[] | null>(null);
  const [transits, setTransits] = useState<Transit[]>([]);
  const [transitCount, setTransitCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const impressionTracked = useRef(false);
  const resultImpressionTracked = useRef(false);

  useModal({
    isOpen: showAuthModal,
    onClose: () => setShowAuthModal(false),
    closeOnClickOutside: false,
  });

  // Track impression on mount
  useEffect(() => {
    if (!impressionTracked.current) {
      impressionTracked.current = true;
      trackCtaImpression({
        hub,
        ctaId: 'chart_preview_teaser',
        location: 'seo_chart_preview',
        label: 'Chart preview teaser',
        pagePath: pathname,
      });
    }
  }, [hub, pathname]);

  // Track result impression when results load
  useEffect(() => {
    if (placements && !resultImpressionTracked.current) {
      resultImpressionTracked.current = true;
      trackCtaImpression({
        hub,
        ctaId: 'chart_preview_result',
        location: 'seo_chart_preview_result',
        label: 'Transit preview result',
        pagePath: pathname,
      });
    }
  }, [placements, hub, pathname]);

  const handleSubmit = async () => {
    if (!birthDate) return;
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
      hub,
      ctaId: 'chart_preview_unlock',
      location: 'seo_chart_preview',
      label: 'See your full chart',
      pagePath: pathname,
    });

    if (!authState.isAuthenticated) {
      if (signupPageVariant === 'value-prop') {
        const params = new URLSearchParams({
          hub,
          headline: 'See your full birth chart',
          subline:
            'All your placements, houses, and aspects with detailed readings',
          location: 'seo_chart_preview',
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

  // Don't show to logged-in users
  if (authState.isAuthenticated) return null;

  return (
    <>
      <div className='my-8 rounded-xl border border-lunary-primary-700/40 bg-layer-base/20 overflow-hidden'>
        <div className='px-5 py-4 border-b border-lunary-primary-700/30'>
          <Heading as='h3' variant='h4' className='text-content-secondary'>
            What is happening in your chart right now?
          </Heading>
          <p className='text-sm text-content-muted mt-1'>
            Enter your birthday to see which transits are activating your natal
            placements today
          </p>
        </div>

        <div className='px-5 py-4'>
          {!placements ? (
            <div className='space-y-3'>
              <div className='flex flex-col sm:flex-row gap-3'>
                <input
                  type='date'
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  min='1900-01-01'
                  max='2030-12-31'
                  className='flex-1 rounded-lg bg-surface-card/80 border border-stroke-default px-3 py-2.5 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-lunary-primary-500/50 focus:border-lunary-primary-500'
                  aria-label='Birth date'
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!birthDate || loading}
                  variant='lunary-soft'
                  className='whitespace-nowrap'
                >
                  {loading ? (
                    <span className='flex items-center gap-2'>
                      <span className='animate-spin h-4 w-4 border-2 border-lunary-primary-400 border-t-transparent rounded-full' />
                      Calculating...
                    </span>
                  ) : (
                    <span className='flex items-center gap-2'>
                      <Sparkles className='w-4 h-4' />
                      Show my transits
                    </span>
                  )}
                </Button>
              </div>
              <button
                onClick={handleUnlock}
                className='text-xs text-lunary-primary-400 hover:text-content-brand transition-colors'
              >
                Skip — just show me my full chart
              </button>
            </div>
          ) : (
            <div className='space-y-4'>
              {/* Natal placements summary */}
              <div className='flex flex-wrap gap-2'>
                {placements.map((p) => (
                  <span
                    key={p.body}
                    className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-card/60 text-xs text-content-secondary'
                  >
                    <span className='opacity-70'>
                      {BODY_SYMBOLS[p.body] || p.body[0]}
                    </span>
                    {p.body}{' '}
                    <span className='text-content-brand'>
                      {SIGN_SYMBOLS[p.sign]} {p.sign}
                    </span>
                  </span>
                ))}
              </div>

              {/* Active transits */}
              {transits.length > 0 && (
                <div className='space-y-2'>
                  <p className='text-xs font-medium text-lunary-accent-400 uppercase tracking-wide flex items-center gap-1.5'>
                    <Zap className='w-3 h-3' />
                    Active transits to your chart
                  </p>
                  {transits.map((t, i) => (
                    <div
                      key={i}
                      className='px-3 py-2.5 rounded-lg bg-surface-card/50 border border-stroke-default/50'
                    >
                      <p className='text-sm text-content-primary'>
                        <span className='font-medium'>
                          {BODY_SYMBOLS[t.transitPlanet] || ''}{' '}
                          {t.transitPlanet} in {t.transitSign}
                        </span>{' '}
                        <span
                          className={
                            ASPECT_COLOURS[t.aspect] || 'text-content-muted'
                          }
                        >
                          {t.aspect}
                        </span>{' '}
                        your natal{' '}
                        <span className='font-medium'>
                          {BODY_SYMBOLS[t.natalPlanet] || ''} {t.natalPlanet} in{' '}
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

              {/* Blurred transit detail */}
              <div className='relative'>
                <div className='space-y-2 blur-sm select-none pointer-events-none'>
                  <p className='text-xs font-medium text-content-muted uppercase tracking-wide'>
                    What this means for you
                  </p>
                  <p className='text-sm text-content-secondary'>
                    This transit is activating your 7th house of partnerships,
                    bringing new energy to your relationships and how you
                    collaborate with others. Pay attention to...
                  </p>
                  <p className='text-sm text-content-secondary'>
                    With Saturn forming a trine to your natal Venus, this is a
                    period of stable commitment and deepening bonds that...
                  </p>
                </div>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <Lock className='w-5 h-5 text-content-muted' />
                </div>
              </div>

              {/* Unlock CTA */}
              <button
                onClick={handleUnlock}
                className='w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-layer-high/60 to-lunary-primary-600/40 border border-lunary-primary-600/50 text-sm font-medium text-content-secondary hover:from-layer-high/80 hover:to-lunary-primary-600/60 transition-all group'
              >
                <Sparkles className='w-4 h-4' />
                See what {transitCount > 3
                  ? `all ${transitCount}`
                  : 'your'}{' '}
                transits mean for you
                <ChevronRight className='w-4 h-4 transition-transform group-hover:translate-x-0.5' />
              </button>
              <p className='text-xs text-content-muted text-center'>
                7 days of full access — personalised transits, chart readings,
                and more. No card needed.
              </p>
            </div>
          )}

          {error && (
            <div className='mt-3 space-y-2'>
              <p className='text-sm text-red-400'>{error}</p>
              <button
                onClick={handleUnlock}
                className='flex items-center gap-2 text-sm text-lunary-accent-400 hover:text-content-brand-accent transition-colors group'
              >
                <Sparkles className='w-4 h-4' />
                <span>See your full birth chart instead</span>
                <ChevronRight className='w-4 h-4 transition-transform group-hover:translate-x-0.5' />
              </button>
            </div>
          )}
        </div>
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
