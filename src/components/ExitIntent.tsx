'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { useAuthStatus } from './AuthStatus';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/Heading';
import { trackCtaClick, trackCtaImpression } from '@/lib/analytics';

const EXIT_INTENT_STORAGE_KEY = 'exitIntentDismissed';
const EXIT_INTENT_COOLDOWN_DAYS = 7; // Show again after 7 days

// The live "Blue Moon" Pro offer (32% off) applied at checkout via the promo param.
const PRO_DISCOUNT_PERCENT = 32;
const PRO_DISCOUNT_HREF = '/pricing?nav=app&promo=BLUEMOON';

// No-account birth chart preview. Low-commitment route for cold visitors that
// captures an email without asking for a discount they have no intent for yet.
const FREE_CHART_HREF = '/free-chart';

type ExitMode = 'discount' | 'anon';

const COPY: Record<
  ExitMode,
  {
    heading: string;
    body: string;
    bullets: string[];
    ctaLabel: string;
    href: string;
    dismissLabel: string;
    ctaId: string;
  }
> = {
  // (a) Logged-in users whose trial has expired: lead with the live offer.
  discount: {
    heading: 'Before you go',
    body: `Your trial has ended. Take ${PRO_DISCOUNT_PERCENT}% off Lunary Pro and keep your personalised charts, transits, and readings.`,
    bullets: [
      'Personalised birth chart analysis',
      'Daily horoscopes based on your chart',
      'Personalised tarot readings',
    ],
    ctaLabel: `Get ${PRO_DISCOUNT_PERCENT}% off Pro`,
    href: PRO_DISCOUNT_HREF,
    dismissLabel: 'No thanks, maybe later',
    ctaId: 'exit_intent_pro_discount',
  },
  // (b) Anonymous cold visitors (the bulk of Bing/GEO traffic): offer the
  // no-account preview rather than a discount.
  anon: {
    heading: 'Before you go',
    body: 'See your real placements in a free birth chart preview. No account needed, takes 30 seconds.',
    bullets: [
      'Your core Sun, Moon, and rising placements',
      'The first standout pattern in your chart',
      'Save the full map in Lunary when you are ready',
    ],
    ctaLabel: 'See my free chart',
    href: FREE_CHART_HREF,
    dismissLabel: 'No thanks',
    ctaId: 'exit_intent_free_chart',
  },
};

export function ExitIntent() {
  const [showModal, setShowModal] = useState(false);
  const authState = useAuthStatus();
  const subscription = useSubscription();
  const pathname = usePathname() || '';

  // Logged-in expired-trial users get the discount path; anonymous cold
  // visitors get the no-account preview path. Active subscribers, free-plan
  // users, and not-yet-resolved auth states get nothing.
  const mode: ExitMode | null = subscription.loading
    ? null
    : authState.isAuthenticated
      ? subscription.isSubscribed || subscription.status === 'free'
        ? null
        : 'discount'
      : 'anon';

  useEffect(() => {
    if (!mode) {
      return;
    }

    // Check if user dismissed it recently (shared cooldown across both modes
    // so we never stack exit prompts on the same visitor).
    const dismissedData = localStorage.getItem(EXIT_INTENT_STORAGE_KEY);
    if (dismissedData) {
      try {
        const { timestamp } = JSON.parse(dismissedData);
        const daysSinceDismissed =
          (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed < EXIT_INTENT_COOLDOWN_DAYS) {
          return; // Still in cooldown period
        }
      } catch (e) {
        // Invalid data, continue
      }
    }

    let mouseLeaveTimer: NodeJS.Timeout;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse is leaving the top of the viewport
      if (e.clientY <= 0) {
        mouseLeaveTimer = setTimeout(() => {
          setShowModal(true);
        }, 100);
      }
    };

    const handleMouseEnter = () => {
      if (mouseLeaveTimer) {
        clearTimeout(mouseLeaveTimer);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (mouseLeaveTimer) {
        clearTimeout(mouseLeaveTimer);
      }
    };
  }, [mode]);

  const copy = mode ? COPY[mode] : null;

  // Fire a single impression event when the modal first becomes visible.
  useEffect(() => {
    if (!showModal || !copy) {
      return;
    }
    trackCtaImpression({
      hub: 'app',
      ctaId: copy.ctaId,
      location: 'exit_intent_modal',
      label: copy.ctaLabel,
      pagePath: pathname,
    });
  }, [showModal, copy, pathname]);

  if (!showModal || !copy) {
    return null;
  }

  const handleClose = () => {
    setShowModal(false);
    // Store dismissal timestamp in localStorage
    localStorage.setItem(
      EXIT_INTENT_STORAGE_KEY,
      JSON.stringify({ timestamp: Date.now() }),
    );
  };

  const handleCtaClick = () => {
    trackCtaClick({
      hub: 'app',
      ctaId: copy.ctaId,
      location: 'exit_intent_modal',
      label: copy.ctaLabel,
      href: copy.href,
      pagePath: pathname,
    });
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-surface-base/60 backdrop-blur-sm p-4'>
      <div className='relative bg-surface-elevated border border-stroke-default rounded-lg p-6 md:p-8 max-w-md w-full shadow-xl'>
        <button
          onClick={handleClose}
          className='absolute top-4 right-4 min-h-[48px] min-w-[48px] flex items-center justify-center text-content-muted hover:text-content-primary transition-colors'
          aria-label='Close'
        >
          <X className='w-5 h-5' />
        </button>

        <div className='text-center space-y-4'>
          <Heading as='h2' variant='h2'>
            {copy.heading}
          </Heading>
          <p className='text-content-secondary'>{copy.body}</p>

          <div className='space-y-3 pt-4'>
            {copy.bullets.map((bullet) => (
              <div key={bullet} className='flex items-center gap-3 text-left'>
                <div className='flex-shrink-0 w-6 h-6 rounded-full bg-layer-base flex items-center justify-center'>
                  <span className='text-content-brand-accent text-sm'>
                    &#10003;
                  </span>
                </div>
                <span className='text-content-secondary text-sm'>{bullet}</span>
              </div>
            ))}
          </div>

          <div className='pt-6'>
            <Button variant='lunary-solid' size='lg' className='w-full' asChild>
              <Link href={copy.href} onClick={handleCtaClick}>
                {copy.ctaLabel}
              </Link>
            </Button>
          </div>

          <button
            onClick={handleClose}
            className='text-sm text-content-muted hover:text-content-secondary transition-colors'
          >
            {copy.dismissLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
