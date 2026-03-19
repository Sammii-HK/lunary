'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { X, Sparkles, ChevronRight } from 'lucide-react';
import { useAuthStatus } from '@/components/AuthStatus';
import { trackCtaClick, trackCtaImpression } from '@/lib/analytics';

const STORAGE_KEY = 'grimoire_exit_dismissed';
const COOLDOWN_HOURS = 24;
const MIN_TIME_ON_PAGE_MS = 8000;

interface GrimoireExitIntentProps {
  hub?: string;
}

export function GrimoireExitIntent({
  hub = 'grimoire',
}: GrimoireExitIntentProps) {
  const [show, setShow] = useState(false);
  const authState = useAuthStatus();
  const router = useRouter();
  const pathname = usePathname() || '';

  const handleClose = useCallback(() => {
    setShow(false);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ timestamp: Date.now() }),
      );
    } catch {}
  }, []);

  const handleSignup = useCallback(() => {
    trackCtaClick({
      hub,
      ctaId: 'grimoire_exit_intent',
      location: 'exit_intent_modal',
      label: 'See your chart',
      pagePath: pathname,
    });

    const params = new URLSearchParams({
      hub,
      headline: 'See how this connects to your chart',
      subline:
        'Your full birth chart with personalised transit readings. 7 days free, no card needed.',
      location: 'exit_intent',
      pagePath: pathname,
    });
    router.push(`/signup/chart?${params.toString()}`);
  }, [hub, pathname, router]);

  useEffect(() => {
    // Only show to anonymous visitors
    if (authState.isAuthenticated) return;

    // Check cooldown
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const { timestamp } = JSON.parse(data);
        const hoursSince = (Date.now() - timestamp) / (1000 * 60 * 60);
        if (hoursSince < COOLDOWN_HOURS) return;
      }
    } catch {}

    const pageLoadTime = Date.now();
    let triggered = false;

    const handleMouseLeave = (e: MouseEvent) => {
      if (triggered) return;
      // Only trigger when mouse exits from top of viewport
      if (e.clientY > 0) return;
      // Only trigger after user has spent time reading
      if (Date.now() - pageLoadTime < MIN_TIME_ON_PAGE_MS) return;

      triggered = true;
      setShow(true);

      trackCtaImpression({
        hub,
        ctaId: 'grimoire_exit_intent',
        location: 'exit_intent_modal',
        label: 'Exit intent shown',
        pagePath: pathname,
      });
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [authState.isAuthenticated, hub, pathname]);

  if (!show) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
      <div className='relative bg-zinc-900 border border-lunary-primary-700/50 rounded-xl p-6 sm:p-8 max-w-md w-full shadow-xl shadow-black/50'>
        <button
          onClick={handleClose}
          className='absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors'
          aria-label='Close'
        >
          <X className='w-5 h-5' />
        </button>

        <div className='space-y-4'>
          <div className='flex items-center gap-2'>
            <Sparkles className='w-5 h-5 text-lunary-accent-400' />
            <h2 className='text-lg font-semibold text-white'>Before you go</h2>
          </div>

          <p className='text-zinc-300 text-sm leading-relaxed'>
            Everything you just read applies differently to your chart. See your
            personalised placements, transits, and daily readings — free for 7
            days.
          </p>

          <ul className='space-y-2'>
            {[
              'Your full birth chart with all 10 placements',
              'Daily tarot pulled for your specific energy',
              'Transit alerts when planets activate your chart',
            ].map((item) => (
              <li
                key={item}
                className='flex items-start gap-2 text-sm text-zinc-400'
              >
                <span className='text-lunary-accent-400 mt-0.5 flex-shrink-0'>
                  &#10022;
                </span>
                {item}
              </li>
            ))}
          </ul>

          <button
            onClick={handleSignup}
            className='w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-lunary-primary-600 to-lunary-primary-500 text-sm font-medium text-white hover:from-lunary-primary-500 hover:to-lunary-primary-400 transition-all group'
          >
            See your chart
            <ChevronRight className='w-4 h-4 transition-transform group-hover:translate-x-0.5' />
          </button>

          <p className='text-center text-xs text-zinc-600'>
            No card needed. Takes 30 seconds.
          </p>
        </div>
      </div>
    </div>
  );
}
