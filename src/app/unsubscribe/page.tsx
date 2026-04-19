'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSafeSearchParams } from '@/lib/safeSearchParams';
import { Mail, XCircle, Send } from 'lucide-react';

type EmailPreferences = {
  weeklyNewsletter: boolean;
  dailyHoroscope: boolean;
  blogUpdates: boolean;
  productUpdates: boolean;
  cosmicAlerts: boolean;
};

const DEFAULT_PREFERENCES: EmailPreferences = {
  weeklyNewsletter: true,
  dailyHoroscope: false,
  blogUpdates: true,
  productUpdates: false,
  cosmicAlerts: false,
};

function UnsubscribeContent() {
  const searchParams = useSafeSearchParams();
  const emailFromUrl = searchParams.get('email');
  const typeFromUrl = searchParams.get('type');
  const [email, setEmail] = useState(emailFromUrl || '');
  const [status, setStatus] = useState<
    'loading' | 'success' | 'error' | 'manual'
  >(emailFromUrl ? 'loading' : 'manual');
  const [message, setMessage] = useState('');
  const [preferences, setPreferences] =
    useState<EmailPreferences>(DEFAULT_PREFERENCES);
  const [isActive, setIsActive] = useState(false);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  const loadPreferences = useCallback(async (emailToLoad: string) => {
    const response = await fetch(
      `/api/newsletter/subscribers/${encodeURIComponent(emailToLoad)}?public=1`,
    );

    if (!response.ok) {
      throw new Error('Could not load email preferences.');
    }

    const data = await response.json();
    const subscriber = data.subscriber;
    const nextPreferences = {
      ...DEFAULT_PREFERENCES,
      ...(subscriber?.preferences || {}),
    };

    setPreferences(nextPreferences);
    setIsActive(Boolean(subscriber?.is_active));
    return nextPreferences;
  }, []);

  const savePreferences = useCallback(
    async (
      emailToUpdate: string,
      nextPreferences: EmailPreferences,
      nextStatusMessage: string,
    ) => {
      const response = await fetch(
        `/api/newsletter/subscribers/${encodeURIComponent(emailToUpdate)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preferences: nextPreferences,
            publicAccess: true,
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update preferences.');
      }

      setPreferences(nextPreferences);
      setIsActive(Object.values(nextPreferences).some(Boolean));
      setStatus('success');
      setMessage(nextStatusMessage);
    },
    [],
  );

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!emailFromUrl) return;

      try {
        const nextPreferences = await loadPreferences(emailFromUrl);
        if (!mounted) return;

        if (typeFromUrl === 'daily_horoscope') {
          await savePreferences(
            emailFromUrl,
            {
              ...nextPreferences,
              dailyHoroscope: false,
            },
            'Daily horoscope emails have been turned off.',
          );
          return;
        }

        if (typeFromUrl === 'weekly_newsletter') {
          await savePreferences(
            emailFromUrl,
            {
              ...nextPreferences,
              weeklyNewsletter: false,
            },
            'Weekly cosmic newsletter emails have been turned off.',
          );
          return;
        }

        setStatus('manual');
      } catch (error) {
        if (!mounted) return;
        setStatus('error');
        setMessage(
          error instanceof Error
            ? error.message
            : 'An error occurred. Please try again later.',
        );
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, [emailFromUrl, loadPreferences, savePreferences, typeFromUrl]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');

    try {
      await loadPreferences(email.trim());
      setStatus('success');
      setMessage('');
    } catch (error) {
      setStatus('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'An error occurred. Please try again later.',
      );
    }
  };

  const handleToggle = async (key: keyof EmailPreferences) => {
    if (!email) return;

    const nextPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };

    setUpdatingKey(key);
    try {
      await savePreferences(
        email,
        nextPreferences,
        'Email preferences updated.',
      );
    } catch (error) {
      setStatus('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'Failed to update preferences.',
      );
    } finally {
      setUpdatingKey(null);
    }
  };

  const handleUnsubscribeAll = async () => {
    if (!email) return;

    setUpdatingKey('all');
    try {
      await savePreferences(
        email,
        {
          weeklyNewsletter: false,
          dailyHoroscope: false,
          blogUpdates: false,
          productUpdates: false,
          cosmicAlerts: false,
        },
        'You have been unsubscribed from all marketing emails.',
      );
    } catch (error) {
      setStatus('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'Failed to unsubscribe from all emails.',
      );
    } finally {
      setUpdatingKey(null);
    }
  };

  return (
    <div className='min-h-screen bg-surface-base text-content-primary flex items-center justify-center px-4'>
      <div className='max-w-md w-full bg-surface-card rounded-lg p-8 border border-stroke-default'>
        <div className='text-center mb-6'>
          <Mail className='h-12 w-12 mx-auto mb-4 text-lunary-primary-400' />
          <h1 className='text-2xl font-bold mb-2'>Email preferences</h1>
          {email && <p className='text-sm text-content-muted'>{email}</p>}
        </div>

        {status === 'loading' && (
          <div className='text-center py-8'>
            <div className='mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-lunary-primary-400'></div>
            <p className='text-content-muted'>Loading your preferences...</p>
          </div>
        )}

        {(status === 'manual' || status === 'success') && (
          <div className='space-y-4'>
            {!emailFromUrl && status === 'manual' && (
              <form onSubmit={handleManualSubmit} className='space-y-4'>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='your@email.com'
                  required
                  className='w-full rounded-lg border border-stroke-default bg-surface-elevated px-4 py-3 text-content-primary placeholder-zinc-500 focus:outline-none focus:border-lunary-primary focus:ring-1 focus:ring-lunary-primary'
                />
                <button
                  type='submit'
                  className='w-full flex items-center justify-center gap-2 rounded-lg bg-lunary-primary-600 px-6 py-3 text-white transition-colors hover:bg-layer-high'
                >
                  <Send className='h-4 w-4' />
                  Load preferences
                </button>
              </form>
            )}

            {message && (
              <div className='rounded-lg border border-stroke-default bg-layer-base/20 px-3 py-2 text-sm text-content-secondary'>
                {message}
              </div>
            )}

            {(emailFromUrl || status === 'success') && (
              <>
                <PreferenceRow
                  label='Weekly cosmic newsletter'
                  description='Weekly cosmic updates, essays, and featured content.'
                  enabled={preferences.weeklyNewsletter}
                  updating={updatingKey === 'weeklyNewsletter'}
                  onToggle={() => handleToggle('weeklyNewsletter')}
                />
                <PreferenceRow
                  label='Daily horoscope emails'
                  description='Daily sign-based horoscope delivery when enabled.'
                  enabled={preferences.dailyHoroscope}
                  updating={updatingKey === 'dailyHoroscope'}
                  onToggle={() => handleToggle('dailyHoroscope')}
                />

                <div className='border-t border-stroke-default pt-4'>
                  <p className='text-xs text-content-muted'>
                    Status:{' '}
                    {isActive
                      ? 'At least one stream is enabled'
                      : 'All marketing email streams are off'}
                  </p>
                  <button
                    type='button'
                    onClick={handleUnsubscribeAll}
                    disabled={updatingKey !== null}
                    className='mt-3 w-full rounded-lg border border-stroke-default px-4 py-3 text-content-primary transition-colors hover:bg-surface-elevated disabled:opacity-50'
                  >
                    Unsubscribe from all marketing emails
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className='text-center py-8'>
            <XCircle className='mx-auto mb-4 h-12 w-12 text-lunary-error' />
            <p className='mb-4 text-content-primary'>{message}</p>
            <button
              onClick={() => setStatus('manual')}
              className='w-full rounded-md bg-surface-overlay px-6 py-2 text-content-primary transition-colors hover:bg-surface-elevated'
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PreferenceRow({
  label,
  description,
  enabled,
  updating,
  onToggle,
}: {
  label: string;
  description: string;
  enabled: boolean;
  updating: boolean;
  onToggle: () => void;
}) {
  return (
    <div className='flex items-center justify-between gap-4 rounded-lg border border-stroke-default p-3'>
      <div>
        <p className='text-sm font-medium text-content-primary'>{label}</p>
        <p className='mt-1 text-xs text-content-muted'>{description}</p>
      </div>
      <button
        type='button'
        onClick={onToggle}
        disabled={updating}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-lunary-primary-600' : 'bg-surface-overlay'
        } disabled:opacity-50`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-surface-base text-content-primary flex items-center justify-center px-4'>
          <div className='max-w-md w-full bg-surface-card rounded-lg p-8 border border-stroke-default'>
            <div className='text-center py-8'>
              <div className='mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-lunary-primary-400'></div>
              <p className='text-content-muted'>Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
