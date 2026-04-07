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
    const shareUrl = `${baseUrl}/pricing?ref=${stats.code}`;

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
    const shareUrl = `${baseUrl}/pricing?ref=${stats.code}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on Lunary',
          text: `Explore astrology, tarot, and cosmic insights with me on Lunary — you'll get 30 days of Pro free!`,
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
            className='h-16 rounded-lg bg-surface-elevated/50 animate-pulse'
          />
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <p className='text-sm text-content-muted'>
        Unable to load referral data.
      </p>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Referral code card */}
      <div className='p-5 rounded-xl border border-stroke-subtle bg-surface-elevated/50'>
        <p className='text-xs text-content-muted uppercase tracking-wide mb-2'>
          Your Referral Code
        </p>
        <div className='flex items-center gap-3'>
          <code className='flex-1 px-4 py-2 rounded-lg bg-surface-card text-lg font-mono text-content-brand tracking-wider'>
            {stats.code || '...'}
          </code>
          <button
            onClick={handleCopyCode}
            className='p-2 rounded-lg border border-stroke-default hover:border-stroke-strong transition-colors'
            title='Copy referral link'
          >
            {copied ? (
              <Check className='w-5 h-5 text-lunary-success' />
            ) : (
              <Copy className='w-5 h-5 text-content-muted' />
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
        <div className='p-3 rounded-lg border border-stroke-subtle bg-surface-elevated/30 text-center'>
          <p className='text-2xl font-bold text-content-primary'>
            {stats.totalReferrals}
          </p>
          <p className='text-xs text-content-muted'>Total</p>
        </div>
        <div className='p-3 rounded-lg border border-stroke-subtle bg-surface-elevated/30 text-center'>
          <p className='text-2xl font-bold text-lunary-primary-400'>
            {stats.activatedReferrals}
          </p>
          <p className='text-xs text-content-muted'>Activated</p>
        </div>
        <div className='p-3 rounded-lg border border-stroke-subtle bg-surface-elevated/30 text-center'>
          <p className='text-2xl font-bold text-content-muted'>
            {stats.remainingReferrals}
          </p>
          <p className='text-xs text-content-muted'>Remaining</p>
        </div>
      </div>

      {/* Current tier */}
      {stats.currentTier && (
        <div className='p-4 rounded-lg border border-lunary-primary-700/50 bg-layer-deep/30'>
          <p className='text-xs text-lunary-primary-400 uppercase tracking-wide'>
            Current Tier
          </p>
          <p className='text-lg font-semibold text-content-primary'>
            {stats.currentTier.label}
          </p>
          <p className='text-sm text-content-muted'>
            {stats.currentTier.description}
          </p>
        </div>
      )}

      {/* Next tier progress */}
      {stats.nextTier && (
        <div className='p-4 rounded-lg border border-stroke-subtle bg-surface-elevated/30'>
          <p className='text-xs text-content-muted mb-1'>Next tier</p>
          <p className='text-sm font-medium text-content-primary'>
            {stats.nextTier.label} — {stats.nextTier.description}
          </p>
          <p className='text-xs text-content-muted mt-1'>
            {stats.activatedReferrals} / {stats.nextTier.threshold} referrals
          </p>
        </div>
      )}

      {/* Tier progress */}
      <div>
        <h3 className='text-xs font-medium text-content-muted uppercase tracking-wide mb-3'>
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
