'use client';

/**
 * Web push contextual opt-in banner.
 *
 * Renders inside the dashboard ONLY after a user has shown intent
 * (read their horoscope or sat on the birth-chart page for >5s, flagged
 * via the `dashboard-engaged` localStorage marker).
 *
 * Suppressed when:
 *   - Notification permission is already `granted` or `denied`
 *   - The browser doesn't support `Notification` / `serviceWorker`
 *   - Native iOS/Android (handled separately by `nativePushService`)
 *   - User dismissed within the active suppression window
 *     (escalating: 7d, 30d, forever after the 3rd dismiss)
 *   - User hasn't yet hit the engagement marker
 *
 * On accept: requests `Notification.requestPermission()` and registers a
 * VAPID push subscription with `/api/notifications/subscribe`, mirroring
 * the existing flow in `NotificationManager`.
 */

import { useCallback, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Bell, Download, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';

const ENGAGED_KEY = 'dashboard-engaged';
const DISMISS_UNTIL_KEY = 'web-push-prompt-dismissed-until';
const DISMISS_COUNT_KEY = 'web-push-prompt-dismiss-count';
const DAY_MS = 24 * 60 * 60 * 1000;
const DISMISS_FOREVER = 'never';

function isStandaloneDisplayMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

function getInstallGuidance(): string {
  if (typeof window === 'undefined') {
    return 'Install Lunary as an app, then open it from your home screen to enable personalised transit notifications.';
  }

  const ua = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  const isChrome = /Chrome|CriOS/.test(ua);

  if (isIOS) {
    return 'On iPhone, tap Share, then Add to Home Screen. Open Lunary from that icon to enable personalised transit notifications.';
  }

  if (isAndroid) {
    return `On Android, open ${isChrome ? 'Chrome' : 'your browser'} menu, then tap Install app or Add to Home screen. Open Lunary from that icon to enable personalised transit notifications.`;
  }

  return 'Install Lunary from your browser address bar or app menu, then open it as an app to enable personalised transit notifications.';
}

// Escalating suppression durations keyed by post-increment count.
// 1st dismiss: 7 days, 2nd: 30 days, 3rd+: forever.
function getNextDismissUntil(nextCount: number): string {
  if (nextCount >= 3) return DISMISS_FOREVER;
  if (nextCount === 2) return String(Date.now() + 30 * DAY_MS);
  return String(Date.now() + 7 * DAY_MS);
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function WebPushContextualPrompt() {
  const { user } = useUser();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [isPwa, setIsPwa] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Native handles its own opt-in via FCM
    if (Capacitor.isNativePlatform()) return;

    // Escalating suppression: 7d, 30d, forever after repeated dismisses.
    try {
      const until = localStorage.getItem(DISMISS_UNTIL_KEY);
      if (until === DISMISS_FOREVER) return;
      if (until && Number(until) > Date.now()) return;
    } catch {
      /* ignore storage errors */
    }

    // Require evidence of intent: dashboard-engaged marker
    try {
      const engaged = localStorage.getItem(ENGAGED_KEY);
      if (!engaged) return;
    } catch {
      return;
    }

    const standalone = isStandaloneDisplayMode();
    setIsPwa(standalone);

    if (standalone) {
      // Browser support guards
      if (!('Notification' in window)) return;
      if (!('serviceWorker' in navigator)) return;
      if (!('PushManager' in window)) return;

      // Only prompt while we're in the default-permission state.
      // granted: already on, denied: can't reopen the OS prompt
      if (Notification.permission !== 'default') return;
    }

    setVisible(true);
  }, []);

  const handleDismiss = useCallback(() => {
    try {
      const prevRaw = localStorage.getItem(DISMISS_COUNT_KEY);
      const prev = Number(prevRaw);
      const prevCount = Number.isFinite(prev) && prev > 0 ? prev : 0;
      const nextCount = prevCount + 1;
      localStorage.setItem(DISMISS_COUNT_KEY, String(nextCount));
      localStorage.setItem(DISMISS_UNTIL_KEY, getNextDismissUntil(nextCount));
    } catch {
      /* ignore storage errors */
    }
    setVisible(false);
  }, []);

  const handleAccept = useCallback(async () => {
    if (typeof window === 'undefined') return;

    if (!isPwa) {
      setVisible(false);
      router.push('/install');
      return;
    }

    setRequesting(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        // User chose No / Block, treat as dismiss.
        handleDismiss();
        return;
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.warn('[WebPush] VAPID public key not configured');
        setVisible(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const json = subscription.toJSON();
      const endpoint = json?.endpoint;
      const p256dh = json?.keys?.p256dh;
      const auth = json?.keys?.auth;

      if (!endpoint || !p256dh || !auth) {
        throw new Error('Subscription JSON missing required keys');
      }

      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          subscription: { endpoint, keys: { p256dh, auth } },
          preferences: {
            moonPhases: true,
            planetaryTransits: true,
            retrogrades: true,
            sabbats: true,
            eclipses: true,
            majorAspects: true,
            cosmicPulse: true,
            cosmicEvents: true,
            birthday: user?.birthday || null,
            name: user?.name || null,
          },
          userId: user?.id || 'unknown',
          userEmail: null,
        }),
      });

      setVisible(false);
    } catch (err) {
      console.error('[WebPush] Subscription failed:', err);
      setVisible(false);
    } finally {
      setRequesting(false);
    }
  }, [handleDismiss, isPwa, router, user?.birthday, user?.id, user?.name]);

  if (!visible) return null;

  const installGuidance = getInstallGuidance();

  return (
    <div className='relative flex items-start gap-3 rounded-xl border border-lunary-primary-200/70 bg-lunary-primary-50/90 p-4 shadow-sm dark:border-stroke-subtle dark:bg-surface-elevated/90'>
      <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-lunary-primary-200/80 bg-white/70 dark:border-stroke-subtle dark:bg-surface-card/70'>
        {isPwa ? (
          <Bell className='h-4 w-4 text-content-brand-accent' />
        ) : (
          <Download className='h-4 w-4 text-content-brand-accent' />
        )}
      </div>
      <div className='flex-1'>
        <p className='text-sm font-medium text-content-primary'>
          {isPwa
            ? 'Get your daily transit at sunrise?'
            : 'Install Lunary for personal transit alerts'}
        </p>
        <p className='text-xs text-content-muted mt-1'>
          {isPwa
            ? "We'll send one on-device note when a personal transit matters. Turn off anytime in settings."
            : installGuidance}
        </p>
        <div className='mt-3 flex flex-wrap gap-2'>
          <Button
            onClick={handleAccept}
            disabled={requesting}
            variant='lunary-soft'
            className='h-9 px-4 text-sm'
          >
            {requesting
              ? 'Connecting...'
              : isPwa
                ? 'Yes, daily'
                : 'Install app'}
          </Button>
          <Button
            onClick={handleDismiss}
            variant='ghost'
            className='h-9 px-4 text-sm'
          >
            Not now
          </Button>
        </div>
      </div>
      <button
        type='button'
        onClick={handleDismiss}
        aria-label='Dismiss notification prompt'
        className='absolute right-2 top-2 text-content-muted hover:text-content-primary transition-colors'
      >
        <X className='h-4 w-4' />
      </button>
    </div>
  );
}
