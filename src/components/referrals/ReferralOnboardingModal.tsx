'use client';

import { useState, useEffect, useCallback } from 'react';
import { Gift, Copy, Check, Share2, X } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { conversionTracking } from '@/lib/analytics';
import { REFERRAL_TRIAL_DAYS } from '@/lib/referrals';

const STORAGE_KEY = 'lunary_referral_onboarding_shown';

export function ReferralOnboardingModal() {
  const { user } = useUser();
  const [visible, setVisible] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function'
    ) {
      setCanShare(true);
    }
  }, []);

  useEffect(() => {
    if (!user?.id || !user.hasBirthChart) return;
    if (typeof window === 'undefined') return;

    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }

    // Short delay so it doesn't compete with the initial dashboard load
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, [user?.id, user?.hasBirthChart]);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Storage full or unavailable
    }
  }, []);

  const loadOrGenerateCode = useCallback(async () => {
    if (referralCode || loading || !user?.id) return;
    setLoading(true);
    try {
      // Try loading existing code first
      const res = await fetch('/api/referrals');
      if (res.ok) {
        const data = await res.json();
        if (data.code) {
          setReferralCode(data.code);
          return;
        }
      }
      // Generate one if none exists
      const genRes = await fetch('/api/referrals/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      if (genRes.ok) {
        const data = await genRes.json();
        setReferralCode(data.code);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [referralCode, loading, user?.id]);

  useEffect(() => {
    if (visible) {
      loadOrGenerateCode();
    }
  }, [visible, loadOrGenerateCode]);

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
      dismiss();
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
      dismiss();
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        handleCopy();
      }
    }
  };

  if (!visible) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={dismiss}
      />

      {/* Modal */}
      <div className='relative w-full max-w-sm rounded-2xl border border-zinc-800/60 bg-zinc-900 p-6 shadow-xl'>
        <button
          onClick={dismiss}
          className='absolute top-3 right-3 p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors'
          aria-label='Close'
        >
          <X className='w-4 h-4' />
        </button>

        <div className='flex flex-col items-center text-center gap-4'>
          <div className='p-3 rounded-full bg-lunary-primary-500/10'>
            <Gift className='w-8 h-8 text-lunary-primary-400' />
          </div>

          <div>
            <h3 className='text-lg font-medium text-zinc-100'>
              Share Lunary with a friend
            </h3>
            <p className='mt-2 text-sm text-zinc-400 leading-relaxed'>
              They get {REFERRAL_TRIAL_DAYS} days of Pro free. You earn a bonus
              week for every friend who joins.
            </p>
          </div>

          {referralCode ? (
            <div className='w-full space-y-3'>
              <div className='flex items-center gap-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50 px-3 py-2'>
                <span className='flex-1 text-xs text-zinc-300 truncate'>
                  {referralUrl}
                </span>
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={handleCopy}
                  className='flex-1 flex items-center justify-center gap-2 rounded-lg bg-lunary-primary-500/20 border border-lunary-primary-500/30 px-4 py-2.5 text-sm font-medium text-lunary-primary-300 hover:bg-lunary-primary-500/30 transition-colors'
                >
                  {copied ? (
                    <>
                      <Check className='w-4 h-4' />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className='w-4 h-4' />
                      Copy link
                    </>
                  )}
                </button>
                {canShare && (
                  <button
                    onClick={handleShare}
                    className='flex items-center justify-center gap-2 rounded-lg bg-zinc-800 border border-zinc-700/50 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors'
                  >
                    <Share2 className='w-4 h-4' />
                    Share
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className='w-full flex justify-center py-2'>
              <div className='h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-lunary-primary-400' />
            </div>
          )}

          <button
            onClick={dismiss}
            className='text-xs text-zinc-500 hover:text-zinc-400 transition-colors'
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
