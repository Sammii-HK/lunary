'use client';

/**
 * /install — platform-aware install landing page.
 *
 * Detects the visitor's platform and renders the appropriate path:
 *   - iOS Safari: numbered Share-sheet steps
 *   - Android Chrome: one-tap install button (or Play Store fallback)
 *   - Desktop: instructions on the left, QR code on the right
 *
 * Mobile-first responsive. All copy benefits-driven.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  Download,
  Plus,
  Share,
  Sparkles,
  Wifi,
  Zap,
} from 'lucide-react';

import { InstallQRCode } from '@/components/InstallQRCode';
import {
  detectPlatform,
  isStandalone,
  trackPwaInstalled,
  trackPwaPromptClicked,
  trackPwaPromptShown,
  trackPwaSessionStarted,
  type PwaPlatform,
} from '@/lib/pwa-analytics';

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=app.lunary';
const INSTALL_URL = 'https://lunary.app/install';
const TRIGGER = 'install-page';
const VARIANT = 'install-page';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const BENEFITS = [
  {
    icon: Sparkles,
    title: 'Personalised transit alerts',
    body: 'Pings the moment Mars hits your natal Venus — not before, not after.',
  },
  {
    icon: Zap,
    title: 'Faster + offline',
    body: 'Loads instantly. Reads your saved chart even with no signal.',
  },
  {
    icon: Wifi,
    title: 'Home screen icon',
    body: 'One-tap from your home screen. No browser tab to lose.',
  },
];

function BenefitsList(): JSX.Element {
  return (
    <ul className='mt-4 space-y-3'>
      {BENEFITS.map(({ icon: Icon, title, body }) => (
        <li key={title} className='flex items-start gap-3'>
          <span className='mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-lunary-primary/15 text-lunary-primary'>
            <Icon size={16} />
          </span>
          <div>
            <p className='text-sm font-medium text-content-primary'>{title}</p>
            <p className='text-xs text-content-secondary mt-0.5'>{body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function IOSInstructions(): JSX.Element {
  return (
    <div className='mx-auto max-w-md w-full'>
      <h1 className='text-2xl md:text-3xl font-semibold text-content-primary text-center'>
        Install Lunary on iPhone
      </h1>
      <p className='mt-2 text-sm text-content-secondary text-center'>
        Three taps and you&rsquo;re in.
      </p>

      <ol className='mt-8 space-y-5'>
        <li className='flex gap-4 rounded-xl border border-stroke-subtle bg-surface-elevated p-4'>
          <span className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-lunary-primary text-sm font-semibold text-white'>
            1
          </span>
          <div className='flex-1'>
            <p className='text-sm font-medium text-content-primary flex items-center gap-2'>
              Tap the
              <span className='inline-flex h-7 w-7 items-center justify-center rounded-md bg-surface-base text-lunary-primary'>
                <Share size={14} />
              </span>
              Share button
            </p>
            <p className='text-xs text-content-secondary mt-1'>
              At the bottom of Safari (or top, on iPad).
            </p>
          </div>
        </li>

        <li className='flex gap-4 rounded-xl border border-stroke-subtle bg-surface-elevated p-4'>
          <span className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-lunary-primary text-sm font-semibold text-white'>
            2
          </span>
          <div className='flex-1'>
            <p className='text-sm font-medium text-content-primary flex items-center gap-2'>
              Scroll down and tap
              <span className='inline-flex items-center gap-1 rounded-md bg-surface-base px-2 py-0.5 text-xs font-semibold text-content-primary'>
                <Plus size={12} />
                Add to Home Screen
              </span>
            </p>
            <p className='text-xs text-content-secondary mt-1'>
              You may need to scroll past AirDrop and Messages.
            </p>
          </div>
        </li>

        <li className='flex gap-4 rounded-xl border border-stroke-subtle bg-surface-elevated p-4'>
          <span className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-lunary-primary text-sm font-semibold text-white'>
            3
          </span>
          <div className='flex-1'>
            <p className='text-sm font-medium text-content-primary'>
              Tap{' '}
              <span className='rounded-md bg-surface-base px-2 py-0.5 text-xs font-semibold text-lunary-primary'>
                Add
              </span>{' '}
              in the top right
            </p>
            <p className='text-xs text-content-secondary mt-1'>
              Lunary will land on your home screen.
            </p>
          </div>
        </li>
      </ol>

      <p className='mt-8 rounded-xl border border-lunary-primary/20 bg-lunary-primary/10 p-4 text-sm text-content-primary text-center'>
        Then open Lunary from your home screen — you&rsquo;re all set for daily
        transit alerts.
      </p>

      <div className='mt-8 flex items-center justify-center gap-2 text-xs text-content-secondary'>
        <ArrowUp size={12} />
        <span>Use Safari for the install option to appear.</span>
      </div>
    </div>
  );
}

interface AndroidProps {
  hasNativePrompt: boolean;
  onInstallClick: () => void;
}

function AndroidInstructions({
  hasNativePrompt,
  onInstallClick,
}: AndroidProps): JSX.Element {
  return (
    <div className='mx-auto max-w-md w-full'>
      <h1 className='text-2xl md:text-3xl font-semibold text-content-primary text-center'>
        Install Lunary on Android
      </h1>
      <p className='mt-2 text-sm text-content-secondary text-center'>
        Personalised transit alerts, the moment they hit.
      </p>

      <button
        type='button'
        onClick={onInstallClick}
        className='mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-lunary-primary px-6 py-4 text-base font-semibold text-white shadow-lg shadow-lunary-primary/30 hover:bg-lunary-primary/90 transition-colors'
      >
        <Download size={18} />
        {hasNativePrompt ? 'Install Lunary' : 'Open Install Prompt'}
      </button>

      <a
        href={PLAY_STORE_URL}
        target='_blank'
        rel='noopener noreferrer'
        className='mt-3 block text-center text-sm text-content-secondary hover:text-content-primary transition-colors underline-offset-4 hover:underline'
      >
        Or install via Google Play for auto-updates
      </a>

      <BenefitsList />
    </div>
  );
}

interface DesktopProps {
  hasNativePrompt: boolean;
  onInstallClick: () => void;
}

function DesktopInstructions({
  hasNativePrompt,
  onInstallClick,
}: DesktopProps): JSX.Element {
  return (
    <div className='mx-auto max-w-5xl w-full'>
      <div className='text-center'>
        <h1 className='text-3xl md:text-4xl font-semibold text-content-primary'>
          Install Lunary
        </h1>
        <p className='mt-2 text-sm text-content-secondary'>
          Faster loads, offline access, and personalised transit alerts on every
          device.
        </p>
      </div>

      <div className='mt-10 grid gap-8 md:grid-cols-2 md:gap-12'>
        {/* Left: desktop install instructions */}
        <div className='flex flex-col'>
          <h2 className='text-lg font-semibold text-content-primary'>
            Install on this computer
          </h2>
          <p className='mt-2 text-sm text-content-secondary'>
            Look for the install icon in the address bar (it looks like a small
            monitor with a down-arrow), or click the button below.
          </p>

          <button
            type='button'
            onClick={onInstallClick}
            className='mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lunary-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-lunary-primary/30 hover:bg-lunary-primary/90 transition-colors md:w-auto md:self-start'
          >
            <Download size={16} />
            {hasNativePrompt ? 'Install Lunary' : 'Use browser install'}
          </button>

          {!hasNativePrompt ? (
            <p className='mt-3 text-xs text-content-secondary'>
              If nothing happens, your browser may not support PWA install from
              a button click. Use the address-bar icon instead, or scan the QR
              with your phone.
            </p>
          ) : null}
        </div>

        {/* Right: QR code for the phone */}
        <div className='flex flex-col items-center justify-center rounded-2xl border border-stroke-subtle bg-surface-elevated p-6'>
          <p className='text-sm font-medium text-content-primary'>
            Prefer your phone?
          </p>
          <div className='mt-4'>
            <InstallQRCode url={INSTALL_URL} size={200} />
          </div>
        </div>
      </div>

      <div className='mt-12 rounded-2xl border border-stroke-subtle bg-surface-elevated p-6'>
        <h3 className='text-base font-semibold text-content-primary'>
          Why install?
        </h3>
        <BenefitsList />
      </div>
    </div>
  );
}

export default function InstallPage(): JSX.Element {
  const [platform, setPlatform] = useState<PwaPlatform>('unknown');
  const [installed, setInstalled] = useState<boolean>(false);
  const [hasNativePrompt, setHasNativePrompt] = useState<boolean>(false);
  const stashedPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const shownTrackedRef = useRef(false);

  // Detect platform + listen for the native install events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const detected = detectPlatform();
    setPlatform(detected);
    const standalone = isStandalone();
    setInstalled(standalone);
    trackPwaSessionStarted(standalone);

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      stashedPromptRef.current = e as BeforeInstallPromptEvent;
      setHasNativePrompt(true);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      trackPwaInstalled('beforeinstallprompt');
    };

    window.addEventListener(
      'beforeinstallprompt',
      onBeforeInstallPrompt as EventListener,
    );
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        onBeforeInstallPrompt as EventListener,
      );
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  // Fire prompt_shown once per page view, after platform is known.
  useEffect(() => {
    if (shownTrackedRef.current) return;
    if (platform === 'unknown') return;
    shownTrackedRef.current = true;
    trackPwaPromptShown(VARIANT, TRIGGER, platform);
  }, [platform]);

  // iOS install can't be triggered programmatically — log it as `manual_ios`
  // when the user reaches this page so the funnel captures the intent.
  useEffect(() => {
    if (platform !== 'ios') return;
    trackPwaInstalled('manual_ios');
  }, [platform]);

  const handleAndroidOrDesktopInstall = useCallback(async () => {
    trackPwaPromptClicked(VARIANT, true);

    const native = stashedPromptRef.current;
    if (!native) {
      // No captured event. On Android we can fall back to the Play Store.
      if (platform === 'android' && typeof window !== 'undefined') {
        window.location.href = PLAY_STORE_URL;
      }
      return;
    }

    try {
      await native.prompt();
      const choice = await native.userChoice;
      if (choice.outcome === 'accepted') {
        trackPwaInstalled('beforeinstallprompt');
      }
    } catch {
      // ignore — the user likely dismissed
    } finally {
      stashedPromptRef.current = null;
      setHasNativePrompt(false);
    }
  }, [platform]);

  // Don't render an install pitch if we're already inside the PWA
  if (installed) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center bg-surface-base px-6 py-12 text-center'>
        <h1 className='text-2xl font-semibold text-content-primary'>
          You&rsquo;re already running Lunary as an app
        </h1>
        <p className='mt-3 max-w-sm text-sm text-content-secondary'>
          Personalised transit alerts are on. Open the app from your home screen
          any time.
        </p>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen flex-col bg-surface-base px-5 py-10 md:px-8 md:py-16'>
      {platform === 'ios' ? <IOSInstructions /> : null}
      {platform === 'android' ? (
        <AndroidInstructions
          hasNativePrompt={hasNativePrompt}
          onInstallClick={handleAndroidOrDesktopInstall}
        />
      ) : null}
      {platform === 'desktop' || platform === 'unknown' ? (
        <DesktopInstructions
          hasNativePrompt={hasNativePrompt}
          onInstallClick={handleAndroidOrDesktopInstall}
        />
      ) : null}
    </div>
  );
}
