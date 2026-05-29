'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Copy, Share2 } from 'lucide-react';

import { useUser } from '@/context/UserContext';
import { buildReferralLink } from '@/lib/referrals/referral-link';
import { conversionTracking } from '@/lib/analytics';

/**
 * Dashboard "Your Year in Stars is ready" prompt with a tasteful share
 * affordance. The recap page and its OG card already exist; this adds the
 * missing share moment.
 *
 * The share link points at `/year-in-stars` carrying the user's referral code
 * as `?ref=`. A signed-out recipient is routed through `/auth` (which preserves
 * the code), so a friend who joins is attributed back to the sharer — a
 * source-labelled seasonal viral loop. Rendered only near the year boundary by
 * the dashboard, so it stays light-touch.
 */
export function YearInStarsShareCard() {
  const { user } = useUser();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function'
    ) {
      setCanShare(true);
    }
  }, []);

  const loadCode = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch('/api/referrals');
      if (res.ok) {
        const data = (await res.json()) as { code?: string | null };
        setReferralCode(data.code ?? null);
      }
    } catch {
      // Silent fail — the share link just won't carry a referral code.
    }
  }, [user?.id]);

  useEffect(() => {
    loadCode();
  }, [loadCode]);

  const shareUrl = buildReferralLink(referralCode, '/year-in-stars');

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      conversionTracking.referralLinkCopied(user?.id);
    } catch {
      // Clipboard can be unavailable — fail silently.
    }
  };

  const shareLink = async () => {
    try {
      await navigator.share({
        title: 'My Year in Stars',
        text: 'My year in transits, moods and reflections, mapped to my chart on Lunary.',
        url: shareUrl,
      });
      conversionTracking.referralLinkShared(user?.id, 'native');
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        copyLink();
      }
    }
  };

  return (
    <div className='w-full rounded-xl border border-lunary-accent-700/50 bg-gradient-to-r from-lunary-accent-950/40 to-lunary-primary-950/40 p-4'>
      <Link
        href='/year-in-stars'
        className='block transition-opacity hover:opacity-90'
      >
        <div className='flex items-center gap-3'>
          <span className='text-2xl' aria-hidden>
            ✨
          </span>
          <div className='flex-1'>
            <p className='text-sm font-medium text-content-primary'>
              Your Year in Stars is ready
            </p>
            <p className='text-xs text-content-muted'>
              A swipeable retrospective of your transits, moods, and
              reflections.
            </p>
          </div>
          <span className='text-content-brand-accent text-sm'>→</span>
        </div>
      </Link>
      <div className='mt-3 flex items-center justify-end gap-2 border-t border-lunary-accent-700/30 pt-3'>
        <button
          type='button'
          onClick={copyLink}
          className='inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-content-secondary transition-colors hover:bg-surface-overlay'
        >
          {copied ? (
            <>
              <Check className='h-3.5 w-3.5 text-lunary-success' /> Copied
            </>
          ) : (
            <>
              <Copy className='h-3.5 w-3.5' /> Copy link
            </>
          )}
        </button>
        {canShare && (
          <button
            type='button'
            onClick={shareLink}
            className='inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-lunary-accent transition-colors hover:bg-surface-overlay'
          >
            <Share2 className='h-3.5 w-3.5' /> Share my year
          </button>
        )}
      </div>
    </div>
  );
}
