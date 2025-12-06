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
    <div className='fixed bottom-20 left-0 right-0 z-50 p-4'>
      <div className='max-w-2xl mx-auto'>
        <div className='rounded-2xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-sm shadow-xl p-6'>
          {!showCustomize ? (
            <>
              <div className='mb-4'>
                <h3 className='text-lg font-medium text-white mb-2'>
                  Cookie Preferences
                </h3>
                <p className='text-sm text-zinc-400 leading-relaxed'>
                  We use cookies to enhance your experience, analyze site usage,
                  and assist in our marketing efforts. By clicking &quot;Accept
                  All,&quot; you consent to our use of cookies.{' '}
                  <Link
                    href='/cookies'
                    className='text-purple-400 hover:text-purple-300 underline'
                  >
                    Learn more
                  </Link>
                </p>
              </div>
              <div className='flex flex-wrap gap-3'>
                <button
                  onClick={handleAcceptAll}
                  className='flex-1 min-w-[120px] rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium py-2.5 px-4 transition-colors'
                >
                  Accept All
                </button>
                <button
                  onClick={handleRejectNonEssential}
                  className='flex-1 min-w-[120px] rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium py-2.5 px-4 transition-colors'
                >
                  Essential Only
                </button>
                <button
                  onClick={() => setShowCustomize(true)}
                  className='flex-1 min-w-[120px] rounded-xl border border-zinc-700 hover:border-zinc-600 text-zinc-300 text-sm font-medium py-2.5 px-4 transition-colors'
                >
                  Customize
                </button>
              </div>
            </>
          ) : (
            <>
              <div className='mb-4'>
                <h3 className='text-lg font-medium text-white mb-2'>
                  Customize Cookie Preferences
                </h3>
                <p className='text-sm text-zinc-400'>
                  Choose which cookies you want to allow.
                </p>
              </div>

              <div className='space-y-4 mb-6'>
                <div className='flex items-start justify-between gap-4 p-3 rounded-xl bg-zinc-800/50'>
                  <div>
                    <p className='text-sm font-medium text-white'>
                      Essential Cookies
                    </p>
                    <p className='text-xs text-zinc-400 mt-1'>
                      Required for the website to function. Cannot be disabled.
                    </p>
                  </div>
                  <div className='shrink-0'>
                    <div className='w-10 h-6 rounded-full bg-purple-600 flex items-center justify-end px-1'>
                      <div className='w-4 h-4 rounded-full bg-white' />
                    </div>
                  </div>
                </div>

                <div className='flex items-start justify-between gap-4 p-3 rounded-xl bg-zinc-800/50'>
                  <div>
                    <p className='text-sm font-medium text-white'>
                      Analytics Cookies
                    </p>
                    <p className='text-xs text-zinc-400 mt-1'>
                      Help us understand how you use Lunary so we can improve.
                    </p>
                  </div>
                  <button
                    onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                    className='shrink-0'
                  >
                    <div
                      className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${
                        analyticsEnabled
                          ? 'bg-purple-600 justify-end'
                          : 'bg-zinc-600 justify-start'
                      }`}
                    >
                      <div className='w-4 h-4 rounded-full bg-white' />
                    </div>
                  </button>
                </div>
              </div>

              <div className='flex gap-3'>
                <button
                  onClick={() => setShowCustomize(false)}
                  className='flex-1 rounded-xl border border-zinc-700 hover:border-zinc-600 text-zinc-300 text-sm font-medium py-2.5 px-4 transition-colors'
                >
                  Back
                </button>
                <button
                  onClick={handleSavePreferences}
                  className='flex-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium py-2.5 px-4 transition-colors'
                >
                  Save Preferences
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
