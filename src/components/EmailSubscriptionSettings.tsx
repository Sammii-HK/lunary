'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mail, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStatus } from './AuthStatus';
import { betterAuthClient } from '@/lib/auth-client';

export function EmailSubscriptionSettings() {
  const authState = useAuthStatus();
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const resolveSessionIdentity = useCallback(async () => {
    try {
      const session = await betterAuthClient.getSession();
      const sessionUser =
        (session as any)?.data?.user || (session as any)?.user || null;

      return {
        email: (sessionUser as any)?.email ?? null,
        id: (sessionUser as any)?.id ?? null,
      };
    } catch (error) {
      console.error(
        'Error fetching auth session while loading newsletter preferences',
        error,
      );
      return { email: null, id: null };
    }
  }, []);

  const authUserId =
    ((authState.user as any)?.id as string | undefined) ?? null;
  const authProfileId =
    ((authState.profile as any)?.id as string | undefined) ?? null;

  useEffect(() => {
    let isMounted = true;

    const resolveEmail = async () => {
      const profileEmail = (authState.user as any)?.email || null;
      const profileUserId = authUserId || null;

      if (profileEmail) {
        if (isMounted) {
          setUserEmail(profileEmail);
          setUserId(profileUserId);
          setAuthChecked(true);
        }
        return;
      }

      const sessionIdentity = await resolveSessionIdentity();

      if (isMounted) {
        setUserEmail(sessionIdentity.email ?? null);
        setUserId(sessionIdentity.id ?? profileUserId ?? authProfileId ?? null);
        setAuthChecked(true);
      }
    };

    setUserEmail(null);
    setAuthChecked(false);
    setUserId(null);

    resolveEmail();

    return () => {
      isMounted = false;
    };
  }, [authState.user, authUserId, authProfileId, resolveSessionIdentity]);

  const checkSubscriptionStatus = useCallback(async (email: string) => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/newsletter/subscribers/${encodeURIComponent(email)}`,
      );
      if (response.ok) {
        const data = await response.json();
        setIsSubscribed(data.subscriber?.is_active ?? false);
      } else {
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsSubscribed(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userEmail) {
      checkSubscriptionStatus(userEmail);
    } else if (authChecked) {
      setLoading(false);
    }
  }, [userEmail, authChecked, checkSubscriptionStatus]);

  const toggleSubscription = async () => {
    if (!userEmail) {
      if (!authState.isAuthenticated) {
        alert('Please sign in to manage email subscriptions');
      } else {
        alert('We could not find an email for your account yet.');
      }
      return;
    }

    setUpdating(true);
    try {
      const newStatus = !isSubscribed;
      const resolvedUserId = userId || authUserId || null;

      if (newStatus) {
        const payload = {
          email: userEmail,
          preferences: {
            weeklyNewsletter: true,
            blogUpdates: true,
            productUpdates: false,
            cosmicAlerts: false,
          },
          source: 'profile_settings',
          ...(resolvedUserId ? { userId: resolvedUserId } : {}),
        };

        const response = await fetch('/api/newsletter/subscribers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          setIsSubscribed(true);
        } else {
          throw new Error('Failed to subscribe');
        }
      } else {
        const response = await fetch(
          `/api/newsletter/subscribers/${encodeURIComponent(userEmail)}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: false }),
          },
        );

        if (response.ok) {
          setIsSubscribed(false);
        } else {
          throw new Error('Failed to unsubscribe');
        }
      }
    } catch (error) {
      console.error('Error toggling subscription:', error);
      alert('Failed to update subscription. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className='w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-800 p-4'>
        <div className='flex items-center justify-center py-4'>
          <div className='h-6 w-6 animate-spin rounded-full border-b-2 border-purple-400'></div>
        </div>
      </div>
    );
  }

  if (!userEmail) {
    return (
      <div className='w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-800 p-4'>
        <h3 className='mb-3 flex items-center gap-2 text-lg font-semibold text-white'>
          <Mail className='h-5 w-5' />
          Email Newsletter
        </h3>
        <p className='text-sm text-zinc-400'>
          {authState.isAuthenticated
            ? 'Add an email address to your profile to manage subscriptions.'
            : 'Sign in to manage your email subscriptions.'}
        </p>
      </div>
    );
  }

  return (
    <div className='w-full max-w-md p-4 bg-zinc-800 rounded-lg border border-zinc-700'>
      <h3 className='text-lg font-semibold text-white mb-3 flex items-center gap-2'>
        <Mail className='h-5 w-5' />
        Email Newsletter
      </h3>
      <p className='text-xs text-zinc-400 mb-4'>
        Receive weekly cosmic insights, blog updates, and special offers
      </p>

      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm text-white font-medium'>
              {isSubscribed ? (
                <span className='flex items-center gap-2 text-green-400'>
                  <CheckCircle className='h-4 w-4' />
                  Subscribed
                </span>
              ) : (
                <span className='flex items-center gap-2 text-zinc-400'>
                  <XCircle className='h-4 w-4' />
                  Not Subscribed
                </span>
              )}
            </p>
            <p className='text-xs text-zinc-400 mt-1'>
              {isSubscribed
                ? `Receiving emails at ${userEmail}`
                : 'You will not receive email newsletters'}
            </p>
          </div>
          <button
            onClick={toggleSubscription}
            disabled={updating}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isSubscribed ? 'bg-purple-600' : 'bg-zinc-600'
            } disabled:opacity-50`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isSubscribed ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {isSubscribed && (
          <div className='pt-3 border-t border-zinc-700'>
            <p className='text-xs text-zinc-500'>
              You can unsubscribe at any time by clicking the link in any email
              or disabling this toggle.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
