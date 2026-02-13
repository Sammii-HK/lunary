'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { Gift, Copy, Check, Share2 } from 'lucide-react';
import { conversionTracking } from '@/lib/analytics';
import { REFERRAL_TRIAL_DAYS } from '@/lib/referrals';

interface ReferralShareCTAProps {
  /** Contextual message shown above the CTA */
  message?: string;
  /** Compact mode for tighter layouts */
  compact?: boolean;
}

export function ReferralShareCTA({
  message = 'Give a friend 30 days of Pro free. You earn a bonus week for every friend who joins.',
  compact = false,
}: ReferralShareCTAProps) {
  const { user } = useUser();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [canShare, setCanShare] = useState(false);
  const [nextTierLabel, setNextTierLabel] = useState<string | null>(null);
  const [nextTierRemaining, setNextTierRemaining] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function'
    ) {
      setCanShare(true);
    }
  }, []);

  const loadCode = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/referrals`);
      if (res.ok) {
        const data = await res.json();
        setReferralCode(data.code || null);
        if (data.nextTier) {
          setNextTierLabel(data.nextTier.label || null);
          const remaining =
            (data.nextTier.threshold || 0) -
            (data.activatedReferrals || data.activeReferrals || 0);
          setNextTierRemaining(remaining > 0 ? remaining : null);
        }
      }
    } catch {
      // Silent fail — CTA just won't show
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadCode();
  }, [loadCode]);

  const generateCode = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch('/api/referrals/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setReferralCode(data.code);
      }
    } catch {
      // Silent fail
    }
  };

  const referralUrl = referralCode
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://lunary.app'}/pricing?ref=${referralCode}`
    : '';

  const handleCopy = async () => {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      conversionTracking.referralLinkCopied(user?.id);
    } catch {
      // Fallback silently
    }
  };

  const handleShare = async () => {
    if (!referralUrl) return;
    try {
      await navigator.share({
        title: 'Join Lunary',
        text: `Unlock personalized astrology with Lunary. Use my link and get ${REFERRAL_TRIAL_DAYS} days of Pro free!`,
        url: referralUrl,
      });
      conversionTracking.referralLinkShared(user?.id, 'native');
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        handleCopy();
      }
    }
  };

  if (!user?.id || loading) return null;

  const tierTease =
    nextTierRemaining && nextTierLabel
      ? `${nextTierRemaining} referral${nextTierRemaining === 1 ? '' : 's'} to ${nextTierLabel}`
      : 'Unlock badges, exclusive spreads, and more';

  // No code yet — show generate prompt
  if (!referralCode) {
    return (
      <div
        className={`rounded-xl border border-zinc-800/60 bg-zinc-900/40 ${compact ? 'p-3' : 'p-4'}`}
      >
        <div className='flex items-center gap-3'>
          <Gift className='w-5 h-5 text-lunary-primary-400 flex-shrink-0' />
          <div className='flex-1 min-w-0'>
            <p className={`text-zinc-300 ${compact ? 'text-xs' : 'text-sm'}`}>
              {message}
            </p>
            <p className='text-[11px] text-zinc-500 mt-0.5'>
              {tierTease} ·{' '}
              <Link
                href='/referrals'
                className='text-lunary-primary-400 hover:text-lunary-primary-200 transition-colors'
              >
                See your rewards
              </Link>
            </p>
          </div>
          <button
            onClick={generateCode}
            className='text-xs font-medium text-lunary-primary-400 hover:text-lunary-primary-200 transition-colors whitespace-nowrap'
          >
            Get link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-zinc-800/60 bg-zinc-900/40 ${compact ? 'p-3' : 'p-4'}`}
    >
      <div className='flex items-center gap-3'>
        <Gift className='w-5 h-5 text-lunary-primary-400 flex-shrink-0' />
        <div className='flex-1 min-w-0'>
          <p className={`text-zinc-300 ${compact ? 'text-xs' : 'text-sm'}`}>
            {message}
          </p>
          <p className='text-[11px] text-zinc-500 mt-0.5'>
            {tierTease} ·{' '}
            <Link
              href='/referrals'
              className='text-lunary-primary-400 hover:text-lunary-primary-200 transition-colors'
            >
              See your rewards
            </Link>
          </p>
        </div>
        <div className='flex items-center gap-2 flex-shrink-0'>
          <button
            onClick={handleCopy}
            className='p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors'
            title='Copy referral link'
          >
            {copied ? (
              <Check className='w-4 h-4 text-lunary-success' />
            ) : (
              <Copy className='w-4 h-4 text-zinc-400' />
            )}
          </button>
          {canShare && (
            <button
              onClick={handleShare}
              className='p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors'
              title='Share referral link'
            >
              <Share2 className='w-4 h-4 text-zinc-400' />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
