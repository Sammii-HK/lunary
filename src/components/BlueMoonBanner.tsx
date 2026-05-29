'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Moon, X } from 'lucide-react';
import { useAuthStatus } from '@/components/AuthStatus';

const DISMISS_KEY = 'lunary_bluemoon_banner_dismissed_v1';
const OFFER_HREF = '/pricing?promo=BLUEMOON&billing=annual';

/**
 * Site-wide top strip for the "Once in a Blue Moon" founding offer.
 * Acquisition surface for the warm, unauthenticated marketing audience —
 * logged-in users get the in-app trial path instead. Reuses the BetaBanner
 * shell (fixed top, data-global-nav so the nav offset observer accounts for it)
 * and adds a persistent dismiss.
 */
export function BlueMoonBanner() {
  const authState = useAuthStatus();
  const [checked, setChecked] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(DISMISS_KEY) === '1');
    } catch {
      // localStorage unavailable — treat as not dismissed
    }
    setChecked(true);
  }, []);

  const handleDismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  if (authState.loading || authState.isAuthenticated) {
    return null;
  }
  // Avoid a flash / hydration mismatch until the dismiss state is known.
  if (!checked || dismissed) {
    return null;
  }

  return (
    <div
      data-global-nav
      className='bg-surface-elevated border-b border-stroke-subtle/50 px-4 py-1 md:py-2 fixed top-0 left-0 right-0 z-[60]'
    >
      <div className='flex items-center justify-center gap-2'>
        <Link
          href={OFFER_HREF}
          className='flex items-center justify-center gap-2 text-center text-[11px] md:text-sm text-content-secondary hover:text-content-primary transition-colors'
        >
          <Moon className='w-3 h-3 text-lunary-highlight' />
          <span>
            Once in a blue moon:{' '}
            <span className='text-lunary-highlight font-medium'>
              founding rate on Lunary Pro
            </span>
            <span className='text-content-muted'>
              , locked in for as long as you keep it
            </span>
          </span>
        </Link>
        <button
          type='button'
          onClick={handleDismiss}
          aria-label='Dismiss offer'
          className='shrink-0 text-content-muted hover:text-content-primary transition-colors'
        >
          <X className='w-3 h-3' />
        </button>
      </div>
    </div>
  );
}
