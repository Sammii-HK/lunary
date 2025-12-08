'use client';

import { useEffect, useMemo, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

type InstallStatus = 'idle' | 'prompting' | 'installed' | 'error';

export function AdminInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [status, setStatus] = useState<InstallStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [supportsPrompt, setSupportsPrompt] = useState(false);
  const [displayMode, setDisplayMode] = useState<string>('browser');

  useEffect(() => {
    const detectDisplayMode = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setDisplayMode('standalone');
        setStatus('installed');
      } else if (window.matchMedia('(display-mode: minimal-ui)').matches) {
        setDisplayMode('minimal-ui');
      } else {
        setDisplayMode('browser');
      }
    };

    detectDisplayMode();

    const standaloneMedia = window.matchMedia('(display-mode: standalone)');

    const handleAppInstalled = () => {
      setStatus('installed');
      setDeferredPrompt(null);
      setError(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    const beforeInstallHandler = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setSupportsPrompt(true);
      setShowInstructions(false);
    };

    window.addEventListener('beforeinstallprompt', beforeInstallHandler);
    const registerMediaListener = () => {
      const listener = () => detectDisplayMode();
      if (standaloneMedia.addEventListener) {
        standaloneMedia.addEventListener('change', listener);
        return () => standaloneMedia.removeEventListener('change', listener);
      }
      standaloneMedia.addListener(listener);
      return () => standaloneMedia.removeListener(listener);
    };

    const cleanupMedia = registerMediaListener();

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('beforeinstallprompt', beforeInstallHandler);
      cleanupMedia();
    };
  }, []);

  const handleInstall = async () => {
    setError(null);
    if (deferredPrompt) {
      try {
        setStatus('prompting');
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setStatus('installed');
        } else {
          setStatus('idle');
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('Install prompt failed:', err);
        setStatus('error');
        setError(
          'Unable to open the install prompt. Try again or use the manual steps.',
        );
      }
    } else {
      setShowInstructions(true);
    }
  };

  const badge = useMemo(() => {
    switch (status) {
      case 'installed':
        return {
          label: 'Installed',
          color: 'bg-lunary-success/20 text-lunary-success-300',
        };
      case 'prompting':
        return {
          label: 'Prompting…',
          color: 'bg-lunary-secondary/20 text-lunary-secondary-300',
        };
      case 'error':
        return {
          label: 'Needs Attention',
          color: 'bg-lunary-error/20 text-lunary-error-300',
        };
      default:
        return { label: 'Ready', color: 'bg-white/10 text-white/80' };
    }
  }, [status]);

  const renderInstructions = () => (
    <div className='mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80'>
      <p className='font-medium mb-2'>Manual installation</p>
      <ol className='list-decimal list-inside space-y-1 text-white/70'>
        <li>
          Ensure the admin icon in the URL bar shows “Install” (Chrome/Edge).
        </li>
        <li>
          Click the install icon (or the ⋮ menu) and choose{' '}
          <b>Install Lunary Admin</b>.
        </li>
        <li>Confirm, then open the app from your dock/app drawer.</li>
      </ol>
      <p className='mt-3 text-xs text-white/50'>
        Need Safari? Use the Share ➜ “Add to Dock” flow after opening this page
        in Safari.
      </p>
    </div>
  );

  const isStandalone = displayMode === 'standalone';

  return (
    <div className='rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/2 to-transparent p-6 shadow-2xl backdrop-blur'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <p className='text-xs uppercase tracking-[0.4em] text-white/50'>
            Admin PWA
          </p>
          <h2 className='text-2xl font-light text-white'>
            Install Lunary Admin on desktop
          </h2>
          <p className='text-sm text-white/70 max-w-2xl mt-2'>
            You’ll get lightning-fast access, offline storage of drafts, and
            instant push alerts for new content. Works in Chrome, Edge, Arc, and
            Safari (manual).
          </p>
        </div>
        <div className='flex flex-col items-end gap-2'>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.color}`}
          >
            {badge.label}
          </span>
          <button
            onClick={handleInstall}
            className='rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20 disabled:opacity-60'
            disabled={status === 'installed' || isStandalone}
          >
            {isStandalone
              ? 'Already Installed'
              : supportsPrompt
                ? 'Install App'
                : 'Show Steps'}
          </button>
        </div>
      </div>
      {error && <p className='mt-3 text-sm text-lunary-error-300'>{error}</p>}
      {showInstructions && !isStandalone && renderInstructions()}
      {isStandalone && (
        <p className='mt-4 text-xs text-white/50'>
          Running in standalone mode ({displayMode}). Notifications and
          shortcuts are enabled.
        </p>
      )}
    </div>
  );
}
