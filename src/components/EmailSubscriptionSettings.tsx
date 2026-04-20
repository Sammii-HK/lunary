'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStatus } from './AuthStatus';
import { betterAuthClient } from '@/lib/auth-client';
import { conversionTracking } from '@/lib/analytics';

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

export function EmailSubscriptionSettings() {
  const authState = useAuthStatus();
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [preferences, setPreferences] =
    useState<EmailPreferences>(DEFAULT_PREFERENCES);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const resolveSessionIdentity = useCallback(async () => {
    try {
      const session = await betterAuthClient.getSession();
      const sessionUser =
        (session as any)?.data?.user || (session as any)?.user || null;

      return {
        email: (sessionUser as any)?.email ?? null,
        id: (sessionUser as any)?.id ?? null,
        emailVerified: (sessionUser as any)?.emailVerified ?? false,
      };
    } catch {
      return { email: null, id: null, emailVerified: false };
    }
  }, []);

  const loadSubscription = useCallback(async (email: string) => {
    try {
      const response = await fetch(
        `/api/newsletter/subscribers/${encodeURIComponent(email)}`,
      );

      if (!response.ok) {
        setIsActive(false);
        setPreferences(DEFAULT_PREFERENCES);
        return;
      }

      const data = await response.json();
      const subscriber = data.subscriber;
      const prefs = subscriber?.preferences || {};

      setIsActive(Boolean(subscriber?.is_active));
      setPreferences({
        ...DEFAULT_PREFERENCES,
        ...prefs,
      });
    } catch {
      setIsActive(false);
      setPreferences(DEFAULT_PREFERENCES);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const sessionIdentity = await resolveSessionIdentity();
      if (!mounted) return;

      setUserEmail(sessionIdentity.email);
      setUserId(sessionIdentity.id);
      setEmailVerified(sessionIdentity.emailVerified);

      if (sessionIdentity.email) {
        await loadSubscription(sessionIdentity.email);
      }

      if (mounted) setLoading(false);
    };

    init();
    return () => {
      mounted = false;
    };
  }, [loadSubscription, resolveSessionIdentity]);

  const updatePreferences = async (
    nextPreferences: EmailPreferences,
    trackingPreference?: string,
  ) => {
    if (!userEmail) return;

    setPreferences(nextPreferences);
    setIsActive(
      Object.values(nextPreferences).some((value) => Boolean(value)) || false,
    );

    const response = await fetch(
      `/api/newsletter/subscribers/${encodeURIComponent(userEmail)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: nextPreferences,
        }),
      },
    );

    if (!response.ok) {
      throw new Error('Failed to update email preferences');
    }

    if (trackingPreference && userId) {
      conversionTracking.preferencesUpdated(userId, {
        preference: trackingPreference,
        enabled: nextPreferences[
          trackingPreference as keyof EmailPreferences
        ] as boolean,
      });
    }
  };

  const handleToggle = async (key: keyof EmailPreferences) => {
    if (!userEmail) return;

    const previousPreferences = preferences;
    const nextPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };

    setUpdatingKey(key);
    setStatusMessage(null);

    try {
      await updatePreferences(nextPreferences, key);
    } catch (error) {
      setPreferences(previousPreferences);
      setIsActive(Object.values(previousPreferences).some(Boolean));
      setStatusMessage('Failed to update preferences. Please try again.');
    } finally {
      setUpdatingKey(null);
    }
  };

  const handleUnsubscribeAll = async () => {
    if (!userEmail) return;

    const previousPreferences = preferences;
    setUpdatingKey('all');
    setStatusMessage(null);

    const nextPreferences = {
      weeklyNewsletter: false,
      dailyHoroscope: false,
      blogUpdates: false,
      productUpdates: false,
      cosmicAlerts: false,
    };

    try {
      await updatePreferences(nextPreferences);
      setStatusMessage('All marketing emails turned off.');
    } catch {
      setPreferences(previousPreferences);
      setIsActive(Object.values(previousPreferences).some(Boolean));
      setStatusMessage('Failed to unsubscribe. Please try again.');
    } finally {
      setUpdatingKey(null);
    }
  };

  if (loading) {
    return (
      <div className='w-full max-w-md rounded-lg border border-stroke-default bg-surface-card p-4'>
        <div className='flex items-center justify-center py-4'>
          <div className='h-6 w-6 animate-spin rounded-full border-b-2 border-lunary-primary-400'></div>
        </div>
      </div>
    );
  }

  if (!userEmail) {
    return (
      <div className='w-full max-w-md rounded-lg border border-stroke-default bg-surface-card p-4'>
        <h3 className='mb-3 flex items-center gap-2 text-lg font-semibold text-content-primary'>
          <Mail className='h-5 w-5' />
          Email preferences
        </h3>
        <p className='text-sm text-content-muted'>
          Sign in to manage your email preferences from your profile. If you are
          using an email link, use the public email preferences page instead.
        </p>
      </div>
    );
  }

  return (
    <div className='w-full max-w-md space-y-4'>
      {emailVerified !== null && (
        <div
          className={`rounded-lg border p-4 ${
            emailVerified
              ? 'border-lunary-success-700 bg-layer-base/20'
              : 'border-lunary-error-700 bg-layer-base/20'
          }`}
        >
          <div className='flex items-start gap-3'>
            {emailVerified ? (
              <CheckCircle className='mt-0.5 h-5 w-5 text-lunary-success' />
            ) : (
              <AlertCircle className='mt-0.5 h-5 w-5 text-lunary-error' />
            )}
            <div>
              <p className='text-sm font-medium text-content-primary'>
                {emailVerified ? 'Email verified' : 'Email not verified'}
              </p>
              <p className='mt-1 text-xs text-content-secondary'>{userEmail}</p>
            </div>
          </div>
        </div>
      )}

      <div className='rounded-lg border border-stroke-default bg-surface-card p-4'>
        <h3 className='mb-2 flex items-center gap-2 text-lg font-semibold text-content-primary'>
          <Mail className='h-5 w-5' />
          Email preferences
        </h3>
        <p className='mb-4 text-xs text-content-muted'>
          Control which email streams you want from Lunary.
        </p>

        {statusMessage && (
          <div className='mb-4 rounded-lg border border-stroke-default bg-layer-base/20 px-3 py-2 text-xs text-content-secondary'>
            {statusMessage}
          </div>
        )}

        <div className='space-y-3'>
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
        </div>

        <div className='mt-4 border-t border-stroke-default pt-4'>
          <p className='text-xs text-content-muted'>
            Status:{' '}
            {isActive
              ? 'At least one email stream enabled'
              : 'All marketing email streams off'}
          </p>
          <button
            type='button'
            onClick={handleUnsubscribeAll}
            disabled={updatingKey !== null}
            className='mt-3 rounded-md border border-stroke-default px-3 py-2 text-sm text-content-primary transition-colors hover:bg-surface-elevated disabled:opacity-50'
          >
            Unsubscribe from all marketing emails
          </button>
        </div>
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
