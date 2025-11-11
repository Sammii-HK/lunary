'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { SmartTrialButton } from './SmartTrialButton';
import { useAuthStatus } from './AuthStatus';
import { useSubscription } from '@/hooks/useSubscription';

const EXIT_INTENT_STORAGE_KEY = 'exitIntentDismissed';
const EXIT_INTENT_COOLDOWN_DAYS = 7; // Show again after 7 days

export function ExitIntent() {
  const [showModal, setShowModal] = useState(false);
  const authState = useAuthStatus();
  const subscription = useSubscription();

  useEffect(() => {
    // Don't show for:
    // 1. Free plan users (status === 'free')
    // 2. Active subscribers
    // 3. Users who dismissed it recently (within cooldown period)
    if (
      subscription.status === 'free' ||
      subscription.isSubscribed ||
      !authState.isAuthenticated
    ) {
      return;
    }

    // Check if user dismissed it recently
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
  }, [
    subscription.status,
    subscription.isSubscribed,
    authState.isAuthenticated,
  ]);

  if (
    !showModal ||
    subscription.isSubscribed ||
    subscription.status === 'free'
  ) {
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

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
      <div className='relative bg-zinc-900 border border-zinc-700 rounded-lg p-6 md:p-8 max-w-md w-full shadow-xl'>
        <button
          onClick={handleClose}
          className='absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors'
          aria-label='Close'
        >
          <X className='w-5 h-5' />
        </button>

        <div className='text-center space-y-4'>
          <h2 className='text-2xl font-bold text-white'>
            Wait! Don't Miss Out
          </h2>
          <p className='text-zinc-300'>
            Unlock personalized horoscopes, birth charts, and cosmic insights
            tailored to you.
          </p>

          <div className='space-y-3 pt-4'>
            <div className='flex items-center gap-3 text-left'>
              <div className='flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center'>
                <span className='text-purple-300 text-sm'>✓</span>
              </div>
              <span className='text-zinc-300 text-sm'>
                Personalized birth chart analysis
              </span>
            </div>
            <div className='flex items-center gap-3 text-left'>
              <div className='flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center'>
                <span className='text-purple-300 text-sm'>✓</span>
              </div>
              <span className='text-zinc-300 text-sm'>
                Daily horoscopes based on your chart
              </span>
            </div>
            <div className='flex items-center gap-3 text-left'>
              <div className='flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center'>
                <span className='text-purple-300 text-sm'>✓</span>
              </div>
              <span className='text-zinc-300 text-sm'>
                Personalized tarot readings
              </span>
            </div>
          </div>

          <div className='pt-6'>
            <SmartTrialButton size='lg' fullWidth />
          </div>

          <button
            onClick={handleClose}
            className='text-sm text-zinc-400 hover:text-zinc-300 transition-colors'
          >
            No thanks, I'll stay on the free plan
          </button>
        </div>
      </div>
    </div>
  );
}
