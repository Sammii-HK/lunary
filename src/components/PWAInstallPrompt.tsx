'use client';

/**
 * PWA install prompt — bottom sheet on mobile, modal on desktop.
 *
 * Reads/writes localStorage to:
 *   - dedupe dismissal for 14 days (`lunary:pwa-prompt-dismissed`)
 *   - count sessions and only show after session 2+ (`lunary:session-count`)
 *
 * Picks one of four copy variants pseudo-randomly per user.
 *
 * Listens for `beforeinstallprompt` and `appinstalled` globally, plus exposes
 * a `usePWAInstallPrompt()` hook so other components can imperatively open
 * the sheet at a wow-moment.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Check, X } from 'lucide-react';

import {
  attachAppInstalledListener,
  detectPlatform,
  isStandalone,
  trackPwaInstalled,
  trackPwaPromptClicked,
  trackPwaPromptShown,
  trackPwaSessionStarted,
  type PwaPlatform,
} from '@/lib/pwa-analytics';
import { getABTestVariantClient } from '@/lib/ab-tests-client';
import { useAuthStatus } from '@/components/AuthStatus';

// ---- Storage keys ---------------------------------------------------------

const DISMISS_KEY = 'lunary:pwa-prompt-dismissed';
const SESSION_COUNT_KEY = 'lunary:session-count';
const SESSION_TICK_KEY = 'lunary:session-count-ticked';
const VARIANT_KEY = 'lunary:pwa-prompt-variant';

const DISMISS_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
const MIN_SESSIONS_BEFORE_AUTO_PROMPT = 2;

// ---- A/B variants ---------------------------------------------------------

export type PWAInstallVariant = 'generic' | 'functional' | 'specific' | 'fomo';

export const PWA_VARIANTS: PWAInstallVariant[] = [
  'generic',
  'functional',
  'specific',
  'fomo',
];

const VARIANT_COPY: Record<PWAInstallVariant, string> = {
  generic: 'Install Lunary for the full experience',
  functional: 'Install for personalised transit alerts and offline access',
  specific:
    'Get notified the moment Mars hits your natal Venus. Never spammy. Install Lunary.',
  fomo: 'Get 3-day-ahead transit warnings. Install Lunary.',
};

const BENEFITS = [
  'Personalised transit pushes',
  'Home screen icon',
  'Faster, works offline',
];

// ---- Helpers --------------------------------------------------------------

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function readSessionCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(SESSION_COUNT_KEY);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

function bumpSessionCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    if (window.sessionStorage.getItem(SESSION_TICK_KEY)) {
      return readSessionCount();
    }
    const next = readSessionCount() + 1;
    window.localStorage.setItem(SESSION_COUNT_KEY, String(next));
    window.sessionStorage.setItem(SESSION_TICK_KEY, '1');
    return next;
  } catch {
    return readSessionCount();
  }
}

function isDismissedRecently(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_TTL_MS;
  } catch {
    return false;
  }
}

function setDismissed(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // localStorage unavailable; nothing to persist
  }
}

/**
 * Hash a string into a small non-negative integer. Used for deterministic
 * variant assignment from a userId so the same user always sees the same
 * arm. Not crypto — just a stable bucketing function.
 */
function hashString(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return h >>> 0;
}

function pickVariant(userId: string | undefined): PWAInstallVariant {
  // Prefer existing AB-test infrastructure if a `pwa-install-copy` cookie
  // is set by middleware. Falls back to userId hashing.
  const fromCookie = getABTestVariantClient('pwa-install-copy');
  if (fromCookie && (PWA_VARIANTS as string[]).includes(fromCookie)) {
    return fromCookie as PWAInstallVariant;
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(VARIANT_KEY);
      if (stored && (PWA_VARIANTS as string[]).includes(stored)) {
        return stored as PWAInstallVariant;
      }
    } catch {
      // fall through
    }
  }

  let bucket: number;
  if (userId) {
    bucket = hashString(userId) % PWA_VARIANTS.length;
  } else {
    bucket = Math.floor(Math.random() * PWA_VARIANTS.length);
  }

  const variant = PWA_VARIANTS[bucket];
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(VARIANT_KEY, variant);
    } catch {
      // ignore
    }
  }
  return variant;
}

// ---- Imperative hook ------------------------------------------------------

interface PWAInstallContextValue {
  open: (trigger: string) => void;
  close: () => void;
  hasPrompt: boolean;
  isInstalled: boolean;
}

const PWAInstallContext = createContext<PWAInstallContextValue | null>(null);

export function usePWAInstallPrompt(): PWAInstallContextValue {
  const ctx = useContext(PWAInstallContext);
  if (ctx) return ctx;
  // Fall back to a no-op so consumers don't crash if mounted outside the
  // provider tree (e.g. in storybook or a marketing page).
  return {
    open: () => undefined,
    close: () => undefined,
    hasPrompt: false,
    isInstalled: false,
  };
}

// ---- Component ------------------------------------------------------------

export interface PWAInstallPromptProps {
  /** Why we're showing the prompt — flows into analytics metadata. */
  trigger?: string;
  /** Auto-show after MIN_SESSIONS once mounted. Default true. */
  autoShow?: boolean;
}

export function PWAInstallPrompt({
  trigger = 'auto',
  autoShow = true,
}: PWAInstallPromptProps): JSX.Element | null {
  const router = useRouter();
  const auth = useAuthStatus();
  const userId = auth.user?.id;

  const [isOpen, setIsOpen] = useState(false);
  const [activeTrigger, setActiveTrigger] = useState<string>(trigger);
  const [platform, setPlatform] = useState<PwaPlatform>('unknown');
  const [installed, setInstalled] = useState<boolean>(false);
  const [hasNativePrompt, setHasNativePrompt] = useState<boolean>(false);

  const stashedPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const shownTrackedRef = useRef<string | null>(null);

  // Variant — stable per user via hashing
  const variant = useMemo(() => pickVariant(userId), [userId]);

  // ---- Mount-side detection + listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setPlatform(detectPlatform());
    const standalone = isStandalone();
    setInstalled(standalone);

    // Bump session count + fire the once-per-session analytics event
    bumpSessionCount();
    trackPwaSessionStarted(standalone);

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      stashedPromptRef.current = e as BeforeInstallPromptEvent;
      setHasNativePrompt(true);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setIsOpen(false);
      trackPwaInstalled('beforeinstallprompt');
    };

    window.addEventListener(
      'beforeinstallprompt',
      onBeforeInstallPrompt as EventListener,
    );
    window.addEventListener('appinstalled', onAppInstalled);

    // The analytics module also wires a global appinstalled listener — we
    // attach it here so it follows the component lifecycle.
    const detach = attachAppInstalledListener();

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        onBeforeInstallPrompt as EventListener,
      );
      window.removeEventListener('appinstalled', onAppInstalled);
      detach();
    };
  }, []);

  // ---- Auto-show after qualifying session count
  useEffect(() => {
    if (!autoShow) return;
    if (typeof window === 'undefined') return;
    if (installed) return;
    if (isDismissedRecently()) return;
    if (readSessionCount() < MIN_SESSIONS_BEFORE_AUTO_PROMPT) return;
    if (isOpen) return;

    const t = window.setTimeout(() => {
      setActiveTrigger((prev) => prev || 'session-threshold');
      setIsOpen(true);
    }, 1500);

    return () => window.clearTimeout(t);
  }, [autoShow, installed, isOpen]);

  // ---- Fire prompt_shown exactly once per (open, trigger)
  useEffect(() => {
    if (!isOpen) return;
    const key = `${variant}:${activeTrigger}`;
    if (shownTrackedRef.current === key) return;
    shownTrackedRef.current = key;
    trackPwaPromptShown(variant, activeTrigger, platform);
  }, [isOpen, variant, activeTrigger, platform]);

  // ---- Actions
  const close = useCallback(() => {
    setIsOpen(false);
    shownTrackedRef.current = null;
  }, []);

  const dismiss = useCallback(() => {
    trackPwaPromptClicked(variant, false);
    setDismissed();
    close();
  }, [variant, close]);

  const install = useCallback(async () => {
    trackPwaPromptClicked(variant, true);

    const native = stashedPromptRef.current;

    // Android Chrome / desktop with captured event
    if (native && (platform === 'android' || platform === 'desktop')) {
      try {
        await native.prompt();
        const choice = await native.userChoice;
        if (choice.outcome === 'accepted') {
          trackPwaInstalled('beforeinstallprompt');
        }
      } catch {
        // If prompt() throws, fall back to the install page
        router.push('/install');
      } finally {
        stashedPromptRef.current = null;
        setHasNativePrompt(false);
        close();
      }
      return;
    }

    // iOS Safari — no programmatic install. Send to /install for instructions.
    if (platform === 'ios') {
      router.push('/install');
      close();
      return;
    }

    // Desktop without captured event
    router.push('/install');
    close();
  }, [variant, platform, router, close]);

  const open = useCallback(
    (nextTrigger: string) => {
      if (installed) return;
      setActiveTrigger(nextTrigger || trigger);
      setIsOpen(true);
    },
    [installed, trigger],
  );

  const ctxValue = useMemo<PWAInstallContextValue>(
    () => ({
      open,
      close,
      hasPrompt: hasNativePrompt,
      isInstalled: installed,
    }),
    [open, close, hasNativePrompt, installed],
  );

  // Already a PWA — never render
  if (installed) {
    return (
      <PWAInstallContext.Provider value={ctxValue}>
        {/* No UI; provider still exposed for consumers */}
      </PWAInstallContext.Provider>
    );
  }

  return (
    <PWAInstallContext.Provider value={ctxValue}>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            key='pwa-install-overlay'
            className='fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={dismiss}
            role='dialog'
            aria-modal='true'
            aria-labelledby='pwa-install-headline'
          >
            <motion.div
              className='relative w-full md:max-w-md md:rounded-2xl rounded-t-2xl bg-surface-elevated border border-stroke-subtle shadow-2xl p-6 pb-8 md:pb-6'
              initial={{ y: '100%', opacity: 0.6 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle (mobile bottom sheet affordance) */}
              <div className='md:hidden mx-auto mb-4 h-1 w-10 rounded-full bg-stroke-subtle' />

              <button
                type='button'
                onClick={dismiss}
                className='absolute top-3 right-3 rounded-full p-2 text-content-secondary hover:text-content-primary hover:bg-surface-base transition-colors'
                aria-label='Close install prompt'
              >
                <X size={18} />
              </button>

              <h2
                id='pwa-install-headline'
                className='pr-8 text-lg font-semibold text-content-primary leading-snug'
              >
                {VARIANT_COPY[variant]}
              </h2>

              <ul className='mt-5 space-y-2.5'>
                {BENEFITS.map((benefit) => (
                  <li
                    key={benefit}
                    className='flex items-start gap-2.5 text-sm text-content-secondary'
                  >
                    <Check
                      size={16}
                      className='mt-0.5 flex-shrink-0 text-lunary-primary'
                    />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className='mt-6 flex flex-col gap-2'>
                <button
                  type='button'
                  onClick={install}
                  className='w-full rounded-lg bg-lunary-primary px-4 py-3 text-sm font-semibold text-white hover:bg-lunary-primary/90 transition-colors'
                >
                  Install
                </button>
                <button
                  type='button'
                  onClick={dismiss}
                  className='w-full rounded-lg px-4 py-2.5 text-sm text-content-secondary hover:text-content-primary transition-colors'
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </PWAInstallContext.Provider>
  );
}

export default PWAInstallPrompt;
