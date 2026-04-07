'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import { useAuthStatus } from './AuthStatus';
import { Copy, Check, Users, Gift, Share2, RefreshCw } from 'lucide-react';
import { conversionTracking } from '@/lib/analytics';
import { REFERRAL_TRIAL_DAYS } from '@/lib/referrals';

export function ReferralProgram() {
  const { user } = useUser();
  const authState = useAuthStatus();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalReferrals: 0, activeReferrals: 0 });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function'
    ) {
      setCanShare(true);
    }
  }, []);

  const loadReferralData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/referrals/stats?userId=${user?.id}`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.error ||
            'We could not load your referral information. Please try again.',
        );
      }

      const data = await response.json();
      setReferralCode(data.code || null);
      setStats({
        totalReferrals: data.totalReferrals || 0,
        activeReferrals: data.activeReferrals || 0,
      });
    } catch (loadError) {
      console.error('Failed to load referral data:', loadError);
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Failed to load referral data. Please try again later.',
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (authState.isAuthenticated) {
      loadReferralData();
    } else {
      setLoading(false);
    }
  }, [authState.isAuthenticated, loadReferralData]);

  const handleCopy = async () => {
    if (!referralCode) return;

    const referralUrl = `https://lunary.app/pricing?ref=${referralCode}`;
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable');
      }
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setError(null);

      // Track referral link copy
      conversionTracking.referralLinkCopied(user?.id);
    } catch (copyError) {
      console.error('Failed to copy referral link:', copyError);
      setError(
        'We could not copy the link automatically. Try copying it manually.',
      );
    }
  };

  const handleShare = async () => {
    if (!referralCode) return;

    const referralUrl = `https://lunary.app/pricing?ref=${referralCode}`;

    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      const nav = navigator as Navigator & {
        share?: (data?: ShareData) => Promise<void>;
      };
      if (!nav.share) {
        handleCopy();
        return;
      }

      try {
        await nav.share({
          title: 'Join Lunary',
          text: `Unlock personalized astrology with Lunary. Use my link and get ${REFERRAL_TRIAL_DAYS} days of Pro free!`,
          url: referralUrl,
        });
        setError(null);

        // Track referral link share
        conversionTracking.referralLinkShared(user?.id, 'native');
      } catch (shareError) {
        const err = shareError as Error;
        if (err.name !== 'AbortError') {
          console.error('Failed to share referral link:', shareError);
          setError(
            'We could not open the share dialog. Try copying the link instead.',
          );
        }
      }
    } else {
      handleCopy();
    }
  };

  const handleCreateLink = async () => {
    if (!user?.id) return;
    const userId = user.id;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/referrals/code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.error ||
            'We could not create your referral link. Please try again.',
        );
      }

      const data = await response.json();
      setReferralCode(data.code || null);
      await loadReferralData();
    } catch (generateError) {
      console.error('Failed to generate referral link:', generateError);
      setError(
        generateError instanceof Error
          ? generateError.message
          : 'Failed to generate referral link. Please try again later.',
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (!authState.isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className='rounded-lg border border-lunary-primary-700 bg-gradient-to-r from-layer-base/40 to-lunary-highlight-900/40 p-6'>
        <div className='space-y-3'>
          <div className='h-5 w-44 animate-pulse rounded bg-white/10' />
          <div className='h-4 w-full animate-pulse rounded bg-white/10' />
          <div className='h-4 w-3/4 animate-pulse rounded bg-white/10' />
        </div>
      </div>
    );
  }

  const referralUrl = referralCode
    ? `https://lunary.app/pricing?ref=${referralCode}`
    : '';

  return (
    <div className='rounded-lg border border-lunary-primary-700 bg-gradient-to-r from-layer-base/40 to-lunary-highlight-900/40 p-4 sm:p-6'>
      <div className='space-y-4'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-layer-base'>
            <Gift className='h-5 w-5 text-lunary-accent' />
          </div>
          <div className='min-w-0'>
            <h3 className='text-base font-semibold text-content-primary'>
              Give a friend {REFERRAL_TRIAL_DAYS} days of Pro
            </h3>
            <p className='text-xs text-content-primary/80'>
              They get {REFERRAL_TRIAL_DAYS} days Pro, you earn a bonus week.
            </p>
          </div>
        </div>

        {error && (
          <div className='rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200'>
            {error}
          </div>
        )}

        {referralCode ? (
          <div className='space-y-4'>
            <div>
              <span className='text-xs uppercase tracking-[0.2em] text-content-brand-accent'>
                Your referral link
              </span>
              <div className='mt-2 flex flex-col gap-2 sm:flex-row'>
                <div className='flex flex-1 items-center gap-2 rounded-lg border border-lunary-primary-700 bg-surface-elevated/60 px-3 py-2 text-sm text-content-primary'>
                  <span className='truncate'>{referralUrl}</span>
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={handleCopy}
                    className='flex items-center gap-2 rounded-lg bg-lunary-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-lunary-primary-400'
                  >
                    {copied ? (
                      <>
                        <Check className='h-4 w-4' />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className='h-4 w-4' />
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={canShare ? handleShare : handleCopy}
                    className='flex items-center gap-2 rounded-lg border border-lunary-primary-600 px-4 py-2 text-sm font-medium text-lunary-accent transition-colors hover:bg-layer-deep'
                  >
                    <Share2 className='h-4 w-4' />
                    Share
                  </button>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-content-primary/90'>
                <div className='flex items-center gap-1.5'>
                  <Users className='h-3.5 w-3.5 text-content-brand-accent' />
                  <span className='text-xs'>Referrals</span>
                </div>
                <p className='mt-1 text-xl font-semibold text-content-primary'>
                  {stats.totalReferrals}
                </p>
              </div>
              <div className='rounded-lg border border-lunary-primary-600 bg-layer-deep px-3 py-2.5 text-sm text-white/90'>
                <div className='flex items-center gap-1.5'>
                  <Gift className='h-3.5 w-3.5 text-content-brand-accent' />
                  <span className='text-xs'>Rewards</span>
                </div>
                <p className='mt-1 text-xl font-semibold text-content-primary'>
                  {stats.activeReferrals}
                </p>
              </div>
            </div>

            <div className='rounded-lg border border-white/10 bg-surface-elevated/60 px-4 py-3 text-sm text-content-primary'>
              <p className='mb-2 text-xs uppercase tracking-[0.2em] text-content-brand-accent/80'>
                How it works
              </p>
              <ol className='space-y-1 text-xs text-content-secondary'>
                <li>1. Send your unique link to a friend.</li>
                <li>2. They join Lunary and complete their first action.</li>
                <li>
                  3. They get {REFERRAL_TRIAL_DAYS} days Pro, you earn a bonus
                  week.
                </li>
              </ol>
            </div>

            <button
              onClick={loadReferralData}
              className='inline-flex items-center gap-2 text-xs font-medium text-content-brand-accent transition-colors hover:text-content-primary'
            >
              <RefreshCw className='h-3.5 w-3.5' />
              Refresh stats
            </button>
          </div>
        ) : (
          <div className='space-y-3 rounded-lg border border-lunary-primary-600 bg-layer-deep p-4 text-sm text-content-brand-accent'>
            <p className='text-sm'>
              You don&apos;t have a referral link yet. Generate one to start
              sharing Lunary and earn free premium time.
            </p>
            <button
              onClick={handleCreateLink}
              disabled={isGenerating}
              className='flex items-center justify-center gap-2 rounded-lg bg-lunary-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-lunary-primary-400 disabled:cursor-not-allowed disabled:bg-layer-high'
            >
              {isGenerating && (
                <span className='h-3 w-3 animate-spin rounded-full border border-white/60 border-t-transparent' />
              )}
              {isGenerating ? 'Creating link...' : 'Generate my referral link'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
