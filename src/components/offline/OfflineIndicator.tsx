'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Wifi, WifiOff, X } from 'lucide-react';
import { useOfflineState } from '@/hooks/useOfflineState';

const RECONNECT_PULSE_MS = 2400;

/**
 * A small top-of-screen banner that surfaces offline status:
 * - Slides in from the top when the device goes offline.
 * - Stays mounted (and dismissable) while offline.
 * - On reconnect, briefly flashes a "Back online" pulse before disappearing.
 *
 * Mount near the root of the authenticated app (above page chrome) so the
 * banner sits above any sticky headers.
 */
export function OfflineIndicator() {
  const { online, wasOffline } = useOfflineState();
  const [dismissed, setDismissed] = useState(false);
  const [showReconnectPulse, setShowReconnectPulse] = useState(false);

  // Reset dismissal whenever connection state flips, so a fresh disconnect
  // shows the banner again even after the user dismissed an earlier one.
  useEffect(() => {
    setDismissed(false);
  }, [online]);

  // Trigger the "Back online" pulse only when we actually were offline before.
  useEffect(() => {
    if (!online || !wasOffline) return;
    setShowReconnectPulse(true);
    const t = window.setTimeout(
      () => setShowReconnectPulse(false),
      RECONNECT_PULSE_MS,
    );
    return () => window.clearTimeout(t);
  }, [online, wasOffline]);

  const showOfflineBanner = !online && !dismissed;
  const showOnlinePulse = online && showReconnectPulse;
  const visible = showOfflineBanner || showOnlinePulse;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key={showOfflineBanner ? 'offline' : 'online-pulse'}
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          role='status'
          aria-live='polite'
          className={[
            'fixed left-0 right-0 top-0 z-[60]',
            'flex items-center justify-center gap-2',
            'px-4 py-2 text-sm shadow-lg',
            'pt-[max(env(safe-area-inset-top),0.5rem)]',
            showOfflineBanner
              ? 'bg-amber-600 text-white'
              : 'bg-emerald-600 text-white',
          ].join(' ')}
        >
          {showOfflineBanner ? (
            <>
              <WifiOff className='h-4 w-4 shrink-0' aria-hidden='true' />
              <span>You're offline — showing cached data</span>
              <button
                type='button'
                onClick={() => setDismissed(true)}
                aria-label='Dismiss offline notice'
                className='ml-2 rounded p-1 transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40'
              >
                <X className='h-3.5 w-3.5' aria-hidden='true' />
              </button>
            </>
          ) : (
            <motion.span
              initial={{ scale: 0.96 }}
              animate={{ scale: [0.96, 1.02, 1] }}
              transition={{ duration: 0.5 }}
              className='flex items-center gap-2'
            >
              <Wifi className='h-4 w-4 shrink-0' aria-hidden='true' />
              <span>Back online</span>
            </motion.span>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
