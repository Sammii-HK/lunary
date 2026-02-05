'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import { Sparkles, Copy, Check, Share2, Gift, Users } from 'lucide-react';
import { conversionTracking } from '@/lib/analytics';
import { REFERRAL_TRIAL_DAYS } from '@/lib/referrals';

interface ReferralStats {
  code: string | null;
  totalReferrals: number;
  remainingReferrals: number;
  maxReferrals: number;
}

export function CircleInviteCTA() {
  const { user } = useUser();
  const [referral, setReferral] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function'
    ) {
      setCanShare(true);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const referralRes = await fetch(
        `/api/referrals/stats?userId=${user.id}`,
      ).catch(() => null);

      if (referralRes?.ok) {
        const data = await referralRes.json();
        setReferral(data);
      }
    } catch (error) {
      console.error('[CircleInviteCTA] Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const referralUrl = referral?.code
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://lunary.app'}/pricing?ref=${referral.code}`
    : null;

  const handleCopy = async () => {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      conversionTracking.referralLinkCopied(user?.id);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = async () => {
    if (!referralUrl) return;

    if (canShare && navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on Lunary',
          text: `Track the moon together! Join my circle on Lunary and we'll both get ${REFERRAL_TRIAL_DAYS} days of Pro free.`,
          url: referralUrl,
        });
        conversionTracking.referralLinkShared(user?.id, 'native');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className='rounded-2xl border border-lunary-primary-700/50 bg-gradient-to-br from-lunary-primary-900/40 via-black/40 to-lunary-highlight-900/40 p-6'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='w-10 h-10 bg-zinc-800 rounded-full animate-pulse' />
          <div className='h-6 w-48 bg-zinc-800 rounded animate-pulse' />
        </div>
        <div className='h-12 bg-zinc-800/50 rounded-xl animate-pulse' />
      </div>
    );
  }

  // Not logged in - show simple CTA
  if (!user) {
    return (
      <div className='rounded-2xl border border-lunary-primary-700/50 bg-gradient-to-br from-lunary-primary-900/40 via-black/40 to-lunary-highlight-900/40 p-6'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='w-12 h-12 rounded-full bg-gradient-to-br from-lunary-primary-600 to-lunary-highlight-600 flex items-center justify-center'>
            <Users className='w-6 h-6 text-white' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-white'>
              Lunary is better with friends
            </h3>
            <p className='text-sm text-zinc-400'>
              Track moon phases together, share insights
            </p>
          </div>
        </div>
        <a
          href='/auth/signup'
          className='block w-full rounded-xl bg-gradient-to-r from-lunary-primary to-lunary-highlight px-4 py-3 text-center text-sm font-semibold text-white hover:opacity-90 transition-opacity'
        >
          Create your free account
        </a>
      </div>
    );
  }

  return (
    <div className='rounded-2xl border border-lunary-primary-700/50 bg-gradient-to-br from-lunary-primary-900/40 via-black/40 to-lunary-highlight-900/40 p-5'>
      {/* Header */}
      <div className='flex items-start gap-4 mb-4'>
        <div className='w-12 h-12 rounded-full bg-gradient-to-br from-lunary-primary-600 to-lunary-highlight-600 flex items-center justify-center shrink-0'>
          <Gift className='w-6 h-6 text-white' />
        </div>
        <div className='flex-1 min-w-0'>
          <h3 className='text-lg font-semibold text-white'>
            Lunary is better with friends
          </h3>
          <p className='text-sm text-zinc-400 mt-0.5'>
            Invite friends and you both get {REFERRAL_TRIAL_DAYS} days Pro free
          </p>
        </div>
      </div>

      {/* Invite CTA */}
      {referralUrl ? (
        <div className='space-y-3'>
          <div className='flex items-center gap-2 text-xs text-zinc-500'>
            <Sparkles className='w-3.5 h-3.5 text-lunary-accent' />
            <span>
              {referral?.remainingReferrals === 0
                ? "You've used all your referrals!"
                : `${referral?.remainingReferrals || 50} invites left`}
            </span>
          </div>
          <div className='flex gap-2'>
            <button
              onClick={handleShare}
              className='flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-lunary-primary to-lunary-highlight px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity'
            >
              <Share2 className='w-4 h-4' />
              Invite Friends
            </button>
            <button
              onClick={handleCopy}
              className='flex items-center justify-center gap-2 rounded-xl border border-lunary-primary-600 px-4 py-3 text-sm font-medium text-lunary-accent hover:bg-lunary-primary-950 transition-colors'
            >
              {copied ? (
                <>
                  <Check className='w-4 h-4' />
                  Copied
                </>
              ) : (
                <>
                  <Copy className='w-4 h-4' />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <a
          href='/profile?tab=circle'
          className='flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-lunary-primary to-lunary-highlight px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity'
        >
          <Sparkles className='w-4 h-4' />
          Get your invite link
        </a>
      )}
    </div>
  );
}
