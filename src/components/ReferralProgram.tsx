'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'jazz-tools/react';
import { useAuthStatus } from './AuthStatus';
import { getUserReferralStats, generateReferralCode } from '@/lib/referrals';
import { Copy, Check, Users, Gift } from 'lucide-react';

export function ReferralProgram() {
  const { me } = useAccount();
  const authState = useAuthStatus();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalReferrals: 0, activeReferrals: 0 });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authState.isAuthenticated && me?.id) {
      loadReferralData();
    } else {
      setLoading(false);
    }
  }, [authState.isAuthenticated, me?.id]);

  const loadReferralData = async () => {
    if (!me?.id) return;

    try {
      const response = await fetch(`/api/referrals/stats?userId=${me.id}`);
      if (response.ok) {
        const data = await response.json();
        setReferralCode(data.code);
        setStats({
          totalReferrals: data.totalReferrals || 0,
          activeReferrals: data.activeReferrals || 0,
        });
      } else {
        // Generate code if doesn't exist
        const newCode = await generateReferralCode(me.id);
        setReferralCode(newCode);
      }
    } catch (error) {
      console.error('Failed to load referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!referralCode) return;

    const referralUrl = `${window.location.origin}/pricing?ref=${referralCode}`;
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!authState.isAuthenticated || loading) {
    return null;
  }

  const referralUrl = referralCode
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://lunary.app'}/pricing?ref=${referralCode}`
    : '';

  return (
    <div className='bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-lg p-6 border border-purple-500/30'>
      <div className='flex items-start gap-4'>
        <div className='flex-shrink-0 w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center'>
          <Gift className='w-6 h-6 text-purple-300' />
        </div>
        <div className='flex-1'>
          <h3 className='text-lg font-semibold text-white mb-2'>
            Refer Friends, Get Free Month
          </h3>
          <p className='text-zinc-300 text-sm mb-4'>
            Share Lunary with friends. When they start a free trial, you both
            get 1 month free!
          </p>

          {referralCode && (
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <input
                  type='text'
                  value={referralUrl}
                  readOnly
                  className='flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm'
                />
                <button
                  onClick={handleCopy}
                  className='px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2'
                >
                  {copied ? (
                    <>
                      <Check className='w-4 h-4' />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className='w-4 h-4' />
                      Copy
                    </>
                  )}
                </button>
              </div>

              <div className='flex items-center gap-6 text-sm'>
                <div className='flex items-center gap-2 text-zinc-300'>
                  <Users className='w-4 h-4' />
                  <span>{stats.totalReferrals} referrals</span>
                </div>
                <div className='flex items-center gap-2 text-purple-300'>
                  <Gift className='w-4 h-4' />
                  <span>{stats.activeReferrals} active</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
