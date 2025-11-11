'use client';

import { useAccount } from 'jazz-tools/react';
import { useState, useEffect } from 'react';
import { Mail, CheckCircle, XCircle } from 'lucide-react';

export function EmailSubscriptionSettings() {
  const { me } = useAccount();
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const userEmail = (me?.profile as any)?.email || (me as any)?.email;

  useEffect(() => {
    if (userEmail) {
      checkSubscriptionStatus();
    } else {
      setLoading(false);
    }
  }, [userEmail]);

  const checkSubscriptionStatus = async () => {
    if (!userEmail) return;

    try {
      const response = await fetch(
        `/api/newsletter/subscribers/${encodeURIComponent(userEmail)}`,
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
  };

  const toggleSubscription = async () => {
    if (!userEmail) {
      alert('Please sign in to manage email subscriptions');
      return;
    }

    setUpdating(true);
    try {
      const newStatus = !isSubscribed;

      if (newStatus) {
        // Subscribe
        const response = await fetch('/api/newsletter/subscribers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            userId: (me as any)?.id,
            preferences: {
              weeklyNewsletter: true,
              blogUpdates: true,
              productUpdates: false,
              cosmicAlerts: false,
            },
            source: 'profile_settings',
          }),
        });

        if (response.ok) {
          setIsSubscribed(true);
        } else {
          throw new Error('Failed to subscribe');
        }
      } else {
        // Unsubscribe
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
      <div className='w-full max-w-md p-4 bg-zinc-800 rounded-lg border border-zinc-700'>
        <div className='flex items-center justify-center py-4'>
          <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400'></div>
        </div>
      </div>
    );
  }

  if (!userEmail) {
    return (
      <div className='w-full max-w-md p-4 bg-zinc-800 rounded-lg border border-zinc-700'>
        <h3 className='text-lg font-semibold text-white mb-3 flex items-center gap-2'>
          <Mail className='h-5 w-5' />
          Email Newsletter
        </h3>
        <p className='text-sm text-zinc-400'>
          Sign in to manage your email subscriptions.
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
