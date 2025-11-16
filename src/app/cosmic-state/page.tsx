'use client';

import { useAccount } from 'jazz-tools/react';
import { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { SmartTrialButton } from '@/components/SmartTrialButton';
import Link from 'next/link';
import {
  Eye,
  Lock,
  Sparkles,
  Moon,
  Calendar,
  TrendingUp,
  Zap,
} from 'lucide-react';

export default function CosmicStatePage() {
  const accountResult = useAccount();
  const me = accountResult?.me || null;
  const subscription = useSubscription();
  const [loading, setLoading] = useState(true);
  const [cosmicData, setCosmicData] = useState<any>(null);

  useEffect(() => {
    const fetchCosmicState = async (useCache = true) => {
      const userId = (me as any)?.id;
      if (!userId) {
        setLoading(false);
        return;
      }

      const cacheKey = `cosmic-state-${userId}`;
      const today = new Date().toISOString().split('T')[0];

      // Check cache first
      if (useCache) {
        try {
          const cached = sessionStorage.getItem(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            // Use cache if it's from today and less than 24 hours old
            const cacheDate = parsed.date || '';
            const cacheAge = Date.now() - (parsed.timestamp || 0);
            if (cacheDate === today && cacheAge < 86400000) {
              setCosmicData(parsed.data);
              setLoading(false);
              // Fetch fresh data in background
              fetchCosmicState(false);
              return;
            }
          }
        } catch (e) {
          // Ignore cache errors, continue to fetch
        }
      }

      // Fetch fresh data
      try {
        const response = await fetch('/api/cosmic/snapshot');
        if (response.ok) {
          const data = await response.json();
          setCosmicData(data);
          // Cache the result
          try {
            sessionStorage.setItem(
              cacheKey,
              JSON.stringify({
                data,
                date: today,
                timestamp: Date.now(),
              }),
            );
          } catch (e) {
            // Ignore storage errors
          }
        } else {
          console.error(
            'Failed to fetch cosmic state:',
            response.status,
            response.statusText,
          );
        }
      } catch (error) {
        console.error('Failed to fetch cosmic state:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCosmicState();
  }, [me]);

  // Wait for subscription to load before determining free user status
  const isFreeUser =
    !subscription.loading &&
    !subscription.isSubscribed &&
    subscription.status === 'free';

  if (loading || subscription.loading) {
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

        {cosmicData &&
        (cosmicData.birthChart ||
          cosmicData.currentTransits?.length > 0 ||
          cosmicData.moon) ? (
          <div className='space-y-6'>
            {/* Moon Position - Most Prominent */}
            {cosmicData.moon && (
              <div className='bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-xl p-6 border border-purple-500/20 shadow-lg'>
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-purple-500/20 rounded-lg'>
                      <Moon className='w-6 h-6 text-purple-300' />
                    </div>
                    <div>
                      <h2 className='text-xl font-semibold text-white'>
                        Moon Position
                      </h2>
                      <p className='text-xs text-zinc-400 mt-0.5'>
                        Current lunar energy
                      </p>
                    </div>
                  </div>
                </div>
                <div className='text-zinc-100'>
                  {isFreeUser ? (
                    <div className='blur-sm relative'>
                      <div className='text-2xl mb-2'>
                        {cosmicData.moon.emoji} {cosmicData.moon.phase}
                      </div>
                      <div className='text-sm text-zinc-400'>
                        In {cosmicData.moon.sign} |{' '}
                        {Math.round(cosmicData.moon.illumination * 100)}%
                        illuminated
                      </div>
                      <div className='absolute inset-0 flex items-center justify-center'>
                        <Lock className='w-6 h-6 text-purple-400' />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className='text-3xl mb-3 font-medium'>
                        {cosmicData.moon.emoji} {cosmicData.moon.phase}
                      </div>
                      <div className='flex items-center gap-4 text-sm'>
                        <span className='flex items-center gap-1.5'>
                          <Calendar className='w-4 h-4 text-purple-400' />
                          In {cosmicData.moon.sign}
                        </span>
                        <span className='flex items-center gap-1.5'>
                          <Zap className='w-4 h-4 text-purple-400' />
                          {Math.round(cosmicData.moon.illumination * 100)}%
                          illuminated
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Current Transits - Grouped by Applying/Exact */}
            {cosmicData.currentTransits &&
              cosmicData.currentTransits.length > 0 && (
                <div className='bg-zinc-900/80 rounded-xl p-6 border border-zinc-800/50 backdrop-blur-sm'>
                  <div className='flex items-center gap-3 mb-6'>
                    <div className='p-2 bg-indigo-500/20 rounded-lg'>
                      <TrendingUp className='w-5 h-5 text-indigo-400' />
                    </div>
                    <div>
                      <h2 className='text-xl font-semibold text-white'>
                        Current Transits
                      </h2>
                      <p className='text-xs text-zinc-400 mt-0.5'>
                        Planetary influences active now
                      </p>
                    </div>
                  </div>
                  {isFreeUser ? (
                    <div className='space-y-3'>
                      {cosmicData.currentTransits
                        .slice(0, 2)
                        .map((transit: any, idx: number) => (
                          <div
                            key={idx}
                            className='bg-zinc-800/50 rounded-lg p-4 blur-sm relative border border-zinc-700/30'
                          >
                            <div className='text-sm text-zinc-400'>
                              {transit.from} {transit.aspect} {transit.to}
                            </div>
                            <div className='absolute inset-0 flex items-center justify-center'>
                              <Lock className='w-5 h-5 text-purple-400' />
                            </div>
                          </div>
                        ))}
                      <div className='pt-2'>
                        <SmartTrialButton />
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      {/* Exact Transits */}
                      {cosmicData.currentTransits.filter(
                        (t: any) => !t.applying,
                      ).length > 0 && (
                        <div>
                          <h3 className='text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2'>
                            <Zap className='w-4 h-4 text-yellow-400' />
                            Exact Now
                          </h3>
                          <div className='space-y-2'>
                            {cosmicData.currentTransits
                              .filter((t: any) => !t.applying)
                              .slice(0, 5)
                              .map((transit: any, idx: number) => (
                                <div
                                  key={idx}
                                  className='bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg p-3 border border-yellow-500/20'
                                >
                                  <div className='text-sm text-zinc-100 font-medium'>
                                    {transit.from} {transit.aspect} {transit.to}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Applying Transits */}
                      {cosmicData.currentTransits.filter((t: any) => t.applying)
                        .length > 0 && (
                        <div>
                          <h3 className='text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2'>
                            <TrendingUp className='w-4 h-4 text-purple-400' />
                            Forming
                            <span
                              className='text-xs text-zinc-500 ml-1'
                              title='These aspects are forming but not exact yet'
                            >
                              (Applying)
                            </span>
                          </h3>
                          <div className='space-y-2'>
                            {cosmicData.currentTransits
                              .filter((t: any) => t.applying)
                              .slice(0, 5)
                              .map((transit: any, idx: number) => (
                                <div
                                  key={idx}
                                  className='bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-lg p-3 border border-purple-500/20'
                                >
                                  <div className='text-sm text-zinc-200'>
                                    {transit.from} {transit.aspect} {transit.to}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            {/* Birth Chart */}
            {cosmicData.birthChart && (
              <div className='bg-zinc-900/80 rounded-xl p-6 border border-zinc-800/50 backdrop-blur-sm'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-purple-500/20 rounded-lg'>
                      <Sparkles className='w-5 h-5 text-purple-400' />
                    </div>
                    <div>
                      <h2 className='text-xl font-semibold text-white'>
                        Birth Chart
                      </h2>
                      <p className='text-xs text-zinc-400 mt-0.5'>
                        Your celestial blueprint
                      </p>
                    </div>
                  </div>
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
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                    {cosmicData.birthChart.placements
                      ?.slice(0, 6)
                      .map((placement: any, idx: number) => (
                        <div
                          key={idx}
                          className='bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/30'
                        >
                          <div className='text-sm'>
                            <span className='font-medium text-purple-300'>
                              {placement.planet}
                            </span>
                            <span className='text-zinc-400 mx-2'>in</span>
                            <span className='text-zinc-200'>
                              {placement.sign}
                            </span>
                            {placement.house && (
                              <>
                                <span className='text-zinc-500 mx-2'>•</span>
                                <span className='text-xs text-zinc-500'>
                                  House {placement.house}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Daily Tarot */}
            {cosmicData.tarot && (
              <div className='bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-xl p-6 border border-indigo-500/20'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='p-2 bg-indigo-500/20 rounded-lg'>
                    <Sparkles className='w-5 h-5 text-indigo-400' />
                  </div>
                  <div>
                    <h2 className='text-xl font-semibold text-white'>
                      Daily Tarot
                    </h2>
                    <p className='text-xs text-zinc-400 mt-0.5'>
                      Your card for today
                    </p>
                  </div>
                </div>
                <div className='text-zinc-300'>
                  {isFreeUser ? (
                    <div className='blur-sm relative'>
                      <div>{cosmicData.tarot.daily?.name || 'Daily Card'}</div>
                      <div className='absolute inset-0 flex items-center justify-center'>
                        <Lock className='w-4 h-4 text-purple-400' />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className='text-2xl mb-3 font-semibold text-white'>
                        {cosmicData.tarot.daily?.name || 'Daily Card'}
                      </div>
                      {cosmicData.tarot.daily?.keywords &&
                        cosmicData.tarot.daily.keywords.length > 0 && (
                          <div className='flex flex-wrap gap-2'>
                            {cosmicData.tarot.daily.keywords
                              .slice(0, 4)
                              .map((keyword: string) => (
                                <span
                                  key={keyword}
                                  className='text-xs px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30'
                                >
                                  {keyword}
                                </span>
                              ))}
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {cosmicData.birthChart &&
              cosmicData.birthChart.placements &&
              cosmicData.birthChart.placements.length > 0 && (
                <div className='bg-zinc-900 rounded-lg p-6 border border-zinc-800'>
                  <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
                    <Sparkles className='w-5 h-5 text-purple-400' />
                    Key Placements
                  </h2>
                  {isFreeUser ? (
                    <div className='blur-sm relative'>
                      <div className='grid grid-cols-2 gap-2 text-sm'>
                        {cosmicData.birthChart.placements
                          .slice(0, 4)
                          .map((placement: any, idx: number) => (
                            <div key={idx} className='text-zinc-400'>
                              {placement.planet}: {placement.sign}
                            </div>
                          ))}
                      </div>
                      <div className='absolute inset-0 flex items-center justify-center'>
                        <Lock className='w-4 h-4 text-purple-400' />
                      </div>
                    </div>
                  ) : (
                    <div className='grid grid-cols-2 gap-3 text-sm'>
                      {cosmicData.birthChart.placements
                        .slice(0, 6)
                        .map((placement: any, idx: number) => (
                          <div key={idx} className='text-zinc-300'>
                            <span className='font-medium'>
                              {placement.planet}
                            </span>{' '}
                            : {placement.sign}
                            {placement.house && (
                              <span className='text-zinc-500 ml-1'>
                                (H{placement.house})
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
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
              {loading
                ? 'Generating your cosmic state...'
                : cosmicData
                  ? 'Cosmic data is being generated. Please refresh in a moment.'
                  : 'No cosmic data available. Complete your profile to see your cosmic state.'}
            </p>
            {!loading && (
              <div className='space-y-2'>
                <button
                  onClick={() => {
                    setLoading(true);
                    fetch(`/api/cosmic/snapshot`)
                      .then((res) => res.json())
                      .then((data) => {
                        setCosmicData(data);
                        setLoading(false);
                      })
                      .catch((err) => {
                        console.error('Failed to refresh:', err);
                        setLoading(false);
                      });
                  }}
                  className='text-purple-400 hover:text-purple-300 underline'
                >
                  Refresh Cosmic State
                </button>
                <div className='text-xs text-zinc-500 mt-2'>
                  <Link
                    href='/profile'
                    className='text-purple-400 hover:text-purple-300 underline'
                  >
                    Go to Profile →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
