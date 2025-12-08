'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export type CookiePreferences = {
  essential: boolean;
  analytics: boolean;
  timestamp: number;
};

const COOKIE_CONSENT_KEY = 'cookie_consent';
const CONSENT_VERSION = 1;

export function getCookieConsent(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    if (parsed.version !== CONSENT_VERSION) return null;

    return parsed.preferences;
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent(): boolean {
  const consent = getCookieConsent();
  return consent?.analytics ?? false;
}

function saveCookieConsent(preferences: CookiePreferences) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(
    COOKIE_CONSENT_KEY,
    JSON.stringify({
      version: CONSENT_VERSION,
      preferences,
    }),
  );

  window.dispatchEvent(
    new CustomEvent('cookieConsentChanged', { detail: preferences }),
  );
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    const consent = getCookieConsent();
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const preferences: CookiePreferences = {
      essential: true,
      analytics: true,
      timestamp: Date.now(),
    };
    saveCookieConsent(preferences);
    setIsVisible(false);
  };

  const handleRejectNonEssential = () => {
    const preferences: CookiePreferences = {
      essential: true,
      analytics: false,
      timestamp: Date.now(),
    };
    saveCookieConsent(preferences);
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    const preferences: CookiePreferences = {
      essential: true,
      analytics: analyticsEnabled,
      timestamp: Date.now(),
    };
    saveCookieConsent(preferences);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className='fixed bottom-20 right-4 z-50 max-w-sm'>
      <div>
        <div className='rounded-xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-sm shadow-xl p-4'>
          {!showCustomize ? (
            <>
              <div className='mb-3'>
                <p className='text-xs text-zinc-400 leading-relaxed'>
                  We use cookies to enhance your experience.{' '}
                  <Link
                    href='/cookies'
                    className='text-purple-400 hover:text-purple-300 underline'
                  >
                    Learn more
                  </Link>
                </p>
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={handleAcceptAll}
                  className='flex-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium py-2 px-3 transition-colors'
                >
                  Accept
                </button>
                <button
                  onClick={handleRejectNonEssential}
                  className='flex-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium py-2 px-3 transition-colors'
                >
                  Decline
                </button>
                <button
                  onClick={() => setShowCustomize(true)}
                  className='rounded-lg border border-zinc-700 hover:border-zinc-600 text-zinc-400 text-xs py-2 px-2 transition-colors'
                >
                  ⚙️
                </button>
              </div>
            </>
          ) : (
            <>
              <div className='space-y-3 mb-3'>
                <div className='flex items-center justify-between gap-3 p-2 rounded-lg bg-zinc-800/50'>
                  <p className='text-xs text-white'>Essential</p>
                  <div className='w-8 h-5 rounded-full bg-purple-600 flex items-center justify-end px-0.5'>
                    <div className='w-3.5 h-3.5 rounded-full bg-white' />
                  </div>
                </div>

                <div className='flex items-center justify-between gap-3 p-2 rounded-lg bg-zinc-800/50'>
                  <p className='text-xs text-white'>Analytics</p>
                  <button
                    onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                  >
                    <div
                      className={`w-8 h-5 rounded-full flex items-center px-0.5 transition-colors ${
                        analyticsEnabled
                          ? 'bg-purple-600 justify-end'
                          : 'bg-zinc-600 justify-start'
                      }`}
                    >
                      <div className='w-3.5 h-3.5 rounded-full bg-white' />
                    </div>
                  </button>
                </div>
              </div>

              <div className='flex gap-2'>
                <button
                  onClick={() => setShowCustomize(false)}
                  className='flex-1 rounded-lg border border-zinc-700 text-zinc-300 text-xs py-2 px-3 transition-colors'
                >
                  Back
                </button>
                <button
                  onClick={handleSavePreferences}
                  className='flex-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs py-2 px-3 transition-colors'
                >
                  Save
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function CookieSettingsButton() {
  const openCookieSettings = () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    window.location.reload();
  };

  return (
    <button
      onClick={openCookieSettings}
      className='text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
    >
      Cookie Settings
    </button>
  );
}
