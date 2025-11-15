'use client';

import { useAccount } from 'jazz-tools/react';
import { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { SmartTrialButton } from '@/components/SmartTrialButton';
import Link from 'next/link';
import { Eye, Lock, Sparkles } from 'lucide-react';

export default function CosmicStatePage() {
  const accountResult = useAccount();
  const me = accountResult?.me || null;
  const subscription = useSubscription();
  const [loading, setLoading] = useState(true);
  const [cosmicData, setCosmicData] = useState<any>(null);

  useEffect(() => {
    const fetchCosmicState = async () => {
      if (!me?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/cosmic/snapshot?userId=${me.id}`);
        if (response.ok) {
          const data = await response.json();
          setCosmicData(data);
        }
      } catch (error) {
        console.error('Failed to fetch cosmic state:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCosmicState();
  }, [me?.id]);

  const isFreeUser =
    !subscription.isSubscribed && subscription.status === 'free';

  if (loading) {
    return (
      <div className='min-h-screen bg-black text-white flex items-center justify-center'>
        <div className='text-zinc-400'>Loading your cosmic state...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-black text-white p-4 md:p-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl md:text-4xl font-bold mb-2'>
            Your Cosmic State
          </h1>
          <p className='text-zinc-400'>
            A snapshot of your personalized astrological profile
          </p>
        </div>

        {isFreeUser && (
          <div className='bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-lg p-6 mb-8'>
            <div className='flex items-start gap-4'>
              <Lock className='w-6 h-6 text-purple-400 flex-shrink-0 mt-1' />
              <div className='flex-1'>
                <h2 className='text-xl font-semibold mb-2'>
                  Unlock Your Full Cosmic Profile
                </h2>
                <p className='text-zinc-300 mb-4'>
                  Upgrade to Lunary+ to see your complete birth chart, detailed
                  transit analysis, and personalized cosmic insights.
                </p>
                <SmartTrialButton />
              </div>
            </div>
          </div>
        )}

        {cosmicData ? (
          <div className='space-y-6'>
            {cosmicData.birthChart && (
              <div className='bg-zinc-900 rounded-lg p-6 border border-zinc-800'>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-xl font-semibold flex items-center gap-2'>
                    <Sparkles className='w-5 h-5 text-purple-400' />
                    Birth Chart
                  </h2>
                  {isFreeUser && (
                    <div className='relative'>
                      <div className='blur-sm'>
                        <div className='text-sm text-zinc-400'>
                          Sun:{' '}
                          {cosmicData.birthChart.placements?.[0]?.sign || '***'}
                        </div>
                      </div>
                      <div className='absolute inset-0 flex items-center justify-center'>
                        <Lock className='w-4 h-4 text-purple-400' />
                      </div>
                    </div>
                  )}
                </div>
                {!isFreeUser && (
                  <div className='space-y-2'>
                    {cosmicData.birthChart.placements
                      ?.slice(0, 3)
                      .map((placement: any, idx: number) => (
                        <div key={idx} className='text-sm text-zinc-300'>
                          {placement.planet}: {placement.sign} (
                          {placement.house})
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {cosmicData.currentTransits &&
              cosmicData.currentTransits.length > 0 && (
                <div className='bg-zinc-900 rounded-lg p-6 border border-zinc-800'>
                  <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
                    <Eye className='w-5 h-5 text-purple-400' />
                    Current Transits
                  </h2>
                  {isFreeUser ? (
                    <div className='space-y-3'>
                      {cosmicData.currentTransits
                        .slice(0, 2)
                        .map((transit: any, idx: number) => (
                          <div
                            key={idx}
                            className='bg-zinc-800/50 rounded p-3 blur-sm relative'
                          >
                            <div className='text-sm text-zinc-400'>
                              {transit.from} {transit.aspect} {transit.to}
                            </div>
                            <div className='absolute inset-0 flex items-center justify-center'>
                              <Lock className='w-4 h-4 text-purple-400' />
                            </div>
                          </div>
                        ))}
                      <div className='pt-2'>
                        <SmartTrialButton />
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      {cosmicData.currentTransits
                        .slice(0, 5)
                        .map((transit: any, idx: number) => (
                          <div key={idx} className='bg-zinc-800/50 rounded p-3'>
                            <div className='text-sm text-zinc-300'>
                              <span className='font-medium'>
                                {transit.from} {transit.aspect} {transit.to}
                              </span>
                              {transit.applying && (
                                <span className='ml-2 text-xs text-purple-400'>
                                  Applying
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

            {cosmicData.moon && (
              <div className='bg-zinc-900 rounded-lg p-6 border border-zinc-800'>
                <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
                  🌙 Moon Position
                </h2>
                <div className='text-zinc-300'>
                  {isFreeUser ? (
                    <div className='blur-sm relative'>
                      <div>
                        Phase: {cosmicData.moon.phase} | Sign:{' '}
                        {cosmicData.moon.sign}
                      </div>
                      <div className='absolute inset-0 flex items-center justify-center'>
                        <Lock className='w-4 h-4 text-purple-400' />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className='text-lg mb-2'>
                        {cosmicData.moon.emoji} {cosmicData.moon.phase}
                      </div>
                      <div className='text-sm text-zinc-400'>
                        In {cosmicData.moon.sign} |{' '}
                        {Math.round(cosmicData.moon.illumination * 100)}%
                        illuminated
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isFreeUser && (
              <div className='bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-lg p-6 text-center'>
                <h3 className='text-xl font-semibold mb-2'>
                  Ready to unlock your full cosmic profile?
                </h3>
                <p className='text-zinc-300 mb-4'>
                  Get personalized horoscopes, detailed transit analysis, and AI
                  guidance tailored to your birth chart.
                </p>
                <SmartTrialButton />
              </div>
            )}
          </div>
        ) : (
          <div className='bg-zinc-900 rounded-lg p-6 border border-zinc-800 text-center'>
            <p className='text-zinc-400 mb-4'>
              No cosmic data available. Complete your profile to see your cosmic
              state.
            </p>
            <Link
              href='/profile'
              className='text-purple-400 hover:text-purple-300 underline'
            >
              Go to Profile →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
