'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, Lock, ChevronRight } from 'lucide-react';
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

const BODY_SYMBOLS: Record<string, string> = {
  Sun: planetUnicode.sun,
  Moon: planetUnicode.moon,
  Mercury: planetUnicode.mercury,
  Venus: planetUnicode.venus,
  Mars: planetUnicode.mars,
};

const SIGN_SYMBOLS: Record<string, string> = Object.fromEntries(
  Object.entries(zodiacUnicode).map(([key, val]) => [
    key.charAt(0).toUpperCase() + key.slice(1),
    val,
  ]),
);

const BLURRED_BODIES = [
  { body: 'Jupiter', label: 'Jupiter' },
  { body: 'Saturn', label: 'Saturn' },
  { body: 'Ascendant', label: 'Rising sign' },
];

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

  // Track result impression when placements load
  useEffect(() => {
    if (placements && !resultImpressionTracked.current) {
      resultImpressionTracked.current = true;
      trackCtaImpression({
        hub,
        ctaId: 'chart_preview_result',
        location: 'seo_chart_preview_result',
        label: 'Chart preview result with blur',
        pagePath: pathname,
      });
    }
  }, [placements, hub, pathname]);

  const handleSubmit = async () => {
    if (!birthDate) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/chart-preview?date=${birthDate}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong');
        return;
      }
      const data = await res.json();
      setPlacements(data.placements);
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
      <div className='my-8 rounded-xl border border-lunary-primary-700/40 bg-lunary-primary-900/20 overflow-hidden'>
        <div className='px-5 py-4 border-b border-lunary-primary-700/30'>
          <Heading as='h3' variant='h4' className='text-lunary-primary-200'>
            Your chart at a glance
          </Heading>
          <p className='text-sm text-zinc-400 mt-1'>
            Enter your birthday to see where the planets were when you were born
          </p>
        </div>

        <div className='px-5 py-4'>
          {!placements ? (
            <div className='flex flex-col sm:flex-row gap-3'>
              <input
                type='date'
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                min='1900-01-01'
                max='2030-12-31'
                className='flex-1 rounded-lg bg-zinc-800/80 border border-zinc-700 px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-lunary-primary-500/50 focus:border-lunary-primary-500'
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
                    Show my placements
                  </span>
                )}
              </Button>
            </div>
          ) : (
            <div className='space-y-3'>
              {/* Visible placements */}
              {placements.map((p) => (
                <div
                  key={p.body}
                  className='flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-800/50'
                >
                  <span className='text-lg w-6 text-center opacity-80'>
                    {BODY_SYMBOLS[p.body] || p.body[0]}
                  </span>
                  <span className='text-sm text-zinc-300 w-16'>{p.body}</span>
                  <span className='text-lg w-6 text-center'>
                    {SIGN_SYMBOLS[p.sign] || ''}
                  </span>
                  <span className='text-sm font-medium text-lunary-primary-200'>
                    {p.sign}
                  </span>
                  <span className='text-xs text-zinc-500 ml-auto'>
                    {p.degree}°
                  </span>
                </div>
              ))}

              {/* Blurred placements */}
              {BLURRED_BODIES.map((b) => (
                <div
                  key={b.body}
                  className='flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-800/50 select-none'
                >
                  <span className='text-lg w-6 text-center opacity-40'>
                    <Lock className='w-4 h-4 inline' />
                  </span>
                  <span className='text-sm text-zinc-500 w-16'>{b.label}</span>
                  <span className='text-sm text-zinc-600 blur-sm'>
                    Aquarius 14°
                  </span>
                </div>
              ))}

              {/* Unlock CTA */}
              <button
                onClick={handleUnlock}
                className='w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-lunary-primary-700/60 to-lunary-primary-600/40 border border-lunary-primary-600/50 text-sm font-medium text-lunary-primary-100 hover:from-lunary-primary-700/80 hover:to-lunary-primary-600/60 transition-all group'
              >
                <Sparkles className='w-4 h-4' />
                See your full chart with all 15+ placements
                <ChevronRight className='w-4 h-4 transition-transform group-hover:translate-x-0.5' />
              </button>
              <p className='text-xs text-zinc-500 text-center'>
                Free account — includes houses, aspects, and personalised
                interpretations
              </p>
            </div>
          )}

          {error && <p className='text-sm text-red-400 mt-2'>{error}</p>}
        </div>
      </div>

      {showAuthModal && (
        <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <div className='bg-zinc-900 rounded-xl p-6 sm:p-8 w-full max-w-md relative mx-4 sm:mx-0 shadow-lg shadow-black/50'>
            <Button
              variant='ghost'
              onClick={() => setShowAuthModal(false)}
              aria-label='Close sign in modal'
            >
              x
            </Button>
            <div className='text-center mb-4'>
              <Heading variant='h3' className='mb-2'>
                See your full chart
              </Heading>
              <p className='text-zinc-300 text-xs sm:text-sm'>
                Create a free account to unlock all your placements, houses,
                aspects, and personalised daily guidance.
              </p>
            </div>
            <AuthComponent
              compact={false}
              defaultToSignUp
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
