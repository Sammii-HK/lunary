'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReferralTierProgress } from './ReferralTierProgress';

interface Tier {
  threshold: number;
  label: string;
  description: string;
  reached: boolean;
}

interface ReferralStats {
  code: string | null;
  totalReferrals: number;
  activeReferrals: number;
  activatedReferrals: number;
  remainingReferrals: number;
  maxReferrals: number;
  currentTier: { threshold: number; label: string; description: string } | null;
  nextTier: {
    threshold: number;
    label: string;
    description: string;
    progress: number;
  } | null;
  tiers: Tier[];
}

export function ReferralDashboard() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/referrals');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch referral stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleCopyCode = async () => {
    if (!stats?.code) return;

    const baseUrl =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://lunary.app';
    const shareUrl = `${baseUrl}/signup?ref=${stats.code}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleShare = async () => {
    if (!stats?.code) return;

    const baseUrl =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://lunary.app';
    const shareUrl = `${baseUrl}/signup?ref=${stats.code}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on Lunary',
          text: 'Explore astrology, tarot, and cosmic insights with me on Lunary!',
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      handleCopyCode();
    }
  };

  if (loading) {
    return (
      <div className='space-y-4'>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className='h-16 rounded-lg bg-zinc-900/50 animate-pulse'
          />
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <p className='text-sm text-zinc-400'>Unable to load referral data.</p>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Referral code card */}
      <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/50'>
        <p className='text-xs text-zinc-400 uppercase tracking-wide mb-2'>
          Your Referral Code
        </p>
        <div className='flex items-center gap-3'>
          <code className='flex-1 px-4 py-2 rounded-lg bg-zinc-800 text-lg font-mono text-lunary-primary-300 tracking-wider'>
            {stats.code || '...'}
          </code>
          <button
            onClick={handleCopyCode}
            className='p-2 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors'
            title='Copy referral link'
          >
            {copied ? (
              <Check className='w-5 h-5 text-lunary-success' />
            ) : (
              <Copy className='w-5 h-5 text-zinc-400' />
            )}
          </button>
        </div>

        <div className='flex gap-3 mt-4'>
          <Button onClick={handleShare} className='flex-1'>
            <Share2 className='w-4 h-4 mr-2' />
            Share Invite
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-3 gap-3'>
        <div className='p-3 rounded-lg border border-zinc-800 bg-zinc-900/30 text-center'>
          <p className='text-2xl font-bold text-white'>
            {stats.totalReferrals}
          </p>
          <p className='text-xs text-zinc-500'>Total</p>
        </div>
        <div className='p-3 rounded-lg border border-zinc-800 bg-zinc-900/30 text-center'>
          <p className='text-2xl font-bold text-lunary-primary-400'>
            {stats.activatedReferrals}
          </p>
          <p className='text-xs text-zinc-500'>Activated</p>
        </div>
        <div className='p-3 rounded-lg border border-zinc-800 bg-zinc-900/30 text-center'>
          <p className='text-2xl font-bold text-zinc-400'>
            {stats.remainingReferrals}
          </p>
          <p className='text-xs text-zinc-500'>Remaining</p>
        </div>
      </div>

      {/* Current tier */}
      {stats.currentTier && (
        <div className='p-4 rounded-lg border border-lunary-primary-700/50 bg-lunary-primary-950/30'>
          <p className='text-xs text-lunary-primary-400 uppercase tracking-wide'>
            Current Tier
          </p>
          <p className='text-lg font-semibold text-white'>
            {stats.currentTier.label}
          </p>
          <p className='text-sm text-zinc-400'>
            {stats.currentTier.description}
          </p>
        </div>
      )}

      {/* Next tier progress */}
      {stats.nextTier && (
        <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30'>
          <p className='text-xs text-zinc-400 mb-1'>Next tier</p>
          <p className='text-sm font-medium text-zinc-200'>
            {stats.nextTier.label} — {stats.nextTier.description}
          </p>
          <p className='text-xs text-zinc-500 mt-1'>
            {stats.activatedReferrals} / {stats.nextTier.threshold} referrals
          </p>
        </div>
      )}

      {/* Tier progress */}
      <div>
        <h3 className='text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3'>
          Reward Tiers
        </h3>
        <ReferralTierProgress
          tiers={stats.tiers}
          activatedCount={stats.activatedReferrals}
        />
      </div>
    </div>
  );
}
