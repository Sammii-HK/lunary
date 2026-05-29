'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Sparkles, X } from 'lucide-react';

import { useSubscription } from '@/hooks/useSubscription';
import { useUser } from '@/context/UserContext';
import { useIsNativeIOS } from '@/hooks/useNativePlatform';
import { isInDemoMode } from '@/lib/demo-mode';
import { Heading } from '@/components/ui/Heading';
import { Button } from '@/components/ui/button';
import { conversionTracking, trackCtaClick } from '@/lib/analytics';

/**
 * One-time, dismissible, inline value-narration card.
 *
 * Shown at the top of the FIRST personalised horoscope or tarot result while a
 * trial is active, so the user consciously registers that the reading in front
 * of them is the paid-grade, chart-mapped experience (not the generic Sun-sign
 * version free users get). This is NOT a paywall: trial users already have the
 * feature. Nothing is gated, blurred, or removed — the card only names value
 * that is already being delivered, then gets out of the way.
 *
 * Shown once across both surfaces (shared localStorage key) and never again
 * after it is shown or dismissed. On first display it fires the canonical
 * `personalized_value_revealed` activation event, which is the queryable signal
 * for "did this trial user reach the personalised payoff?".
 */

const SEEN_KEY = 'lunary.trialValueRevealSeen';

// Match the codebase convention: in demo mode use sessionStorage so each
// visitor gets a fresh view; otherwise persist the one-time flag in localStorage.
function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return isInDemoMode() ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

function hasBeenSeen(): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    return storage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

function markSeen(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(SEEN_KEY, '1');
  } catch {
    // Storage may be unavailable (private mode, quota) — fail soft.
  }
}

interface TrialValueRevealProps {
  surface: 'horoscope' | 'tarot';
}

export function TrialValueReveal({ surface }: TrialValueRevealProps) {
  const subscription = useSubscription();
  const { user } = useUser();
  const isNativeIOS = useIsNativeIOS();

  const { isTrialActive, trialDaysRemaining } = subscription;
  const hasBirthData = Boolean(user?.birthday);

  // Resolve the one-time flag on the client only (avoids SSR/client mismatch).
  // null = not yet checked.
  const [seen, setSeen] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const firedRef = useRef(false);

  const eligible = isTrialActive && hasBirthData;

  useEffect(() => {
    if (!eligible) return;
    setSeen(hasBeenSeen());
  }, [eligible]);

  // On first eligible display: fire the activation event once and persist the
  // one-time flag immediately, so the card never appears on the other surface.
  useEffect(() => {
    if (!eligible || seen !== false || dismissed || firedRef.current) return;
    firedRef.current = true;
    markSeen();
    conversionTracking.personalizedValueRevealed(
      user?.id,
      surface,
      trialDaysRemaining,
    );
  }, [eligible, seen, dismissed, user?.id, surface, trialDaysRemaining]);

  if (!eligible || seen !== false || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    markSeen();
    setDismissed(true);
  };

  const handleCtaClick = () => {
    void trackCtaClick({
      ctaId: 'trial_value_reveal',
      location: surface,
      label: 'Keep personalised readings',
      href: '/pricing?nav=app',
      pagePath: `/${surface}`,
    });
  };

  const daysLabel =
    trialDaysRemaining === 1
      ? '1 day left in your trial'
      : `${trialDaysRemaining} days left in your trial`;

  return (
    <div
      data-testid='trial-value-reveal'
      className='relative rounded-2xl border border-lunary-primary-700/50 bg-gradient-to-br from-layer-base to-lunary-primary-900/20 p-4 sm:p-5'
    >
      <button
        type='button'
        onClick={handleDismiss}
        aria-label='Dismiss'
        className='absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-content-muted transition-colors hover:text-content-primary'
      >
        <X className='h-4 w-4' />
      </button>

      <div className='flex items-start gap-3 pr-6'>
        <div className='mt-0.5 shrink-0 rounded-lg bg-layer-base/40 p-2'>
          <Sparkles className='h-4 w-4 text-lunary-primary-400' />
        </div>
        <div className='min-w-0 space-y-2'>
          <Heading as='h3' variant='h4' className='text-content-primary'>
            This reading is mapped to your chart
          </Heading>
          <p className='text-sm leading-relaxed text-content-secondary'>
            Free shows a generic Sun-sign reading. You are seeing yours, drawn
            from your Moon, houses and the transits moving right now. It is
            included while you are on trial, with {daysLabel}.
          </p>

          {/* iOS gating: never surface a web checkout CTA on native iOS, so
              App Store in-app purchase rules are respected. The card stays
              descriptive and dismissible; the trial is already active, so
              there is nothing to buy here during the trial. On web, the CTA
              routes to the existing trial-countdown pricing path. */}
          {!isNativeIOS && (
            <div className='pt-1'>
              <Button
                variant='lunary-soft'
                size='sm'
                className='rounded-full'
                asChild
              >
                <Link href='/pricing?nav=app' onClick={handleCtaClick}>
                  Keep personalised readings
                  <Sparkles className='ml-1.5 h-3.5 w-3.5' />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
