'use client';

import { useUser } from '@/context/UserContext';
import { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { SmartTrialButton } from '@/components/SmartTrialButton';
import { betterAuthClient } from '@/lib/auth-client';
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
  const { user: contextUser } = useUser();
  const subscription = useSubscription();
  const [loading, setLoading] = useState(true);
  const [cosmicData, setCosmicData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID from Better Auth session (matches what API expects)
  useEffect(() => {
    const getUserId = async () => {
      try {
        console.log('[cosmic-state] Calling betterAuthClient.getSession()...');
        const session = await betterAuthClient.getSession().catch((err) => {
          console.error('[cosmic-state] getSession() threw error:', err);
          throw err;
        });

        console.log('[cosmic-state] Session response received:', {
          hasSession: !!session,
          sessionType: typeof session,
          sessionKeys: session ? Object.keys(session) : [],
          hasData: !!session?.data,
          dataKeys: session?.data ? Object.keys(session.data) : [],
          hasUser: !!session?.data?.user,
          userKeys: session?.data?.user ? Object.keys(session.data.user) : [],
          userId: session?.data?.user?.id,
          fullSession: JSON.stringify(session, null, 2).substring(0, 500),
        });

        const id = session?.data?.user?.id;
        console.log('[cosmic-state] Extracted user ID:', id);

        if (!id) {
          console.warn(
            '[cosmic-state] No user ID found in session, trying alternative methods...',
          );
          // Try fetching from the API directly
          try {
            const response = await fetch('/api/auth/get-session');
            const apiSession = await response.json();
            console.log('[cosmic-state] API session response:', apiSession);
            const apiUserId = apiSession?.user?.id || apiSession?.id;
            if (apiUserId) {
              console.log('[cosmic-state] Found user ID from API:', apiUserId);
              setUserId(apiUserId);
              return;
            }
          } catch (apiErr) {
            console.error(
              '[cosmic-state] Failed to get session from API:',
              apiErr,
            );
          }
        }

        setUserId(id || null);
      } catch (err) {
        console.error('[cosmic-state] Failed to get user ID:', {
          error: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        });
        setUserId(null);
      }
    };
    getUserId();
  }, []);

  useEffect(() => {
    console.log('[cosmic-state] useEffect running, userId:', userId);

    const fetchCosmicState = async (
      useCache = true,
      retryCount = 0,
    ): Promise<void> => {
      console.log('[cosmic-state] fetchCosmicState called');

      // The API authenticates via cookies, so we can call it without userId
      // Use userId for cache key if available, otherwise use generic key
      const cacheKey = userId ? `cosmic-state-${userId}` : 'cosmic-state-anon';
      const today = new Date().toISOString().split('T')[0];

      // Check cache first (only on first attempt, not on retries)
      // CRITICAL: Validate cached data has actual content before using it
      if (useCache && retryCount === 0) {
        try {
          const cached = sessionStorage.getItem(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            const cacheDate = parsed.date || '';
            const cacheAge = Date.now() - (parsed.timestamp || 0);

            // Validate cached data has actual content
            const hasValidData =
              parsed.data &&
              (parsed.data.birthChart ||
                parsed.data.currentTransits ||
                parsed.data.moon);

            // Only use cache if it's valid, from today, less than 24h old, AND has actual data
            if (cacheDate === today && cacheAge < 86400000 && hasValidData) {
              setCosmicData(parsed.data);
              setLoading(false);
              setError(null);
              // Always fetch fresh data in background to ensure cache stays updated
              setTimeout(() => {
                fetch('/api/cosmic/snapshot', { cache: 'no-store' })
                  .then((res) => {
                    if (res.ok) {
                      return res.json();
                    }
                    return null;
                  })
                  .then((data) => {
                    // Overwrite cache with fresh data if it exists
                    if (
                      data &&
                      (data.birthChart || data.currentTransits || data.moon)
                    ) {
                      setCosmicData(data);
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
                    }
                  })
                  .catch(() => {
                    // Ignore background fetch errors
                  });
              }, 100);
              return;
            } else {
              // Invalid or stale cached data - remove it
              try {
                sessionStorage.removeItem(cacheKey);
              } catch (e) {
                // Ignore removal errors
              }
              // Continue to fetch fresh data below
            }
          }
        } catch (e) {
          // Ignore cache errors, continue to fetch
          // Remove potentially corrupted cache
          try {
            sessionStorage.removeItem(cacheKey);
          } catch {
            // Ignore removal errors
          }
        }
      }

      // ALWAYS fetch fresh data - API will auto-create snapshot if missing
      try {
        console.log('[cosmic-state] Fetching /api/cosmic/snapshot...');
        const timestamp = Date.now();
        const response = await fetch(`/api/cosmic/snapshot?t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store', // Ensure we always get fresh data
        });
        console.log('[cosmic-state] Response received:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
        });

        const responseText = await response.text();
        console.log(
          '[cosmic-state] Response body (first 500 chars):',
          responseText.substring(0, 500),
        );

        if (!response.ok) {
          const errorText = responseText;
          let errorMessage = `Failed to fetch cosmic state: ${response.status}`;
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch {
            // Use default error message
          }

          console.error(
            `[cosmic-state] API error: ${response.status} - ${errorMessage}`,
          );

          // Retry on server errors (5xx) or if snapshot needs to be created (404)
          // Also retry on 400 (bad request) as it might be a transient issue
          if (
            response.status >= 500 ||
            response.status === 404 ||
            response.status === 400
          ) {
            if (retryCount < 3) {
              const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
              console.log(
                `[cosmic-state] Retrying fetch (attempt ${retryCount + 1}/3) after ${delay}ms`,
              );
              await new Promise((resolve) => setTimeout(resolve, delay));
              return fetchCosmicState(false, retryCount + 1);
            }
          }

          throw new Error(errorMessage);
        }

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error('[cosmic-state] Failed to parse response as JSON:', e);
          throw new Error('Invalid JSON response from server');
        }

        // Ensure we have valid data - API should always return valid snapshot
        // API auto-creates snapshot if missing, so this should always succeed
        if (data && (data.birthChart || data.currentTransits || data.moon)) {
          setCosmicData(data);
          setError(null);
          // Cache the result for faster subsequent loads
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
          // Invalid data - API should have created snapshot, but it's empty
          console.error(
            '[cosmic-state] Received invalid/empty snapshot data:',
            {
              hasBirthChart: !!data?.birthChart,
              hasTransits: !!data?.currentTransits?.length,
              hasMoon: !!data?.moon,
            },
          );

          // Retry once more - snapshot generation might be in progress
          if (retryCount < 2) {
            console.log(
              '[cosmic-state] Invalid snapshot data, retrying after delay...',
            );
            await new Promise((resolve) => setTimeout(resolve, 2000));
            return fetchCosmicState(false, retryCount + 1);
          }
          throw new Error(
            'Invalid cosmic snapshot data received. Please ensure your profile has a birthday set.',
          );
        }
      } catch (error) {
        console.error('[cosmic-state] Failed to fetch cosmic state:', error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to load cosmic state. Please try refreshing.';
        setError(errorMessage);

        // Retry on network errors or if error suggests retry might help
        if (retryCount < 3) {
          const isNetworkError = error instanceof TypeError;
          const isRetryableError =
            errorMessage.includes('Failed to fetch') ||
            errorMessage.includes('network') ||
            errorMessage.includes('500') ||
            errorMessage.includes('404');

          if (isNetworkError || isRetryableError) {
            const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
            console.log(
              `[cosmic-state] Retrying after error (attempt ${retryCount + 1}/3) after ${delay}ms`,
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
            return fetchCosmicState(false, retryCount + 1);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCosmicState();
  }, [userId]);

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

  if (error && !cosmicData) {
    return (
      <div className='min-h-screen bg-black text-white p-4 md:p-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='mb-8'>
            <h1 className='text-3xl md:text-4xl font-bold mb-2'>
              Your Cosmic State
            </h1>
          </div>
          <div className='bg-red-900/20 border border-red-500/50 rounded-lg p-6'>
            <h2 className='text-xl font-semibold text-red-400 mb-2'>
              Error Loading Cosmic State
            </h2>
            <p className='text-red-300 mb-4'>{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                const fetchCosmicState = async () => {
                  if (!userId) {
                    setLoading(false);
                    return;
                  }
                  try {
                    const response = await fetch('/api/cosmic/snapshot');
                    if (response.ok) {
                      const data = await response.json();
                      if (
                        data &&
                        (data.birthChart || data.currentTransits || data.moon)
                      ) {
                        setCosmicData(data);
                        setError(null);
                      } else {
                        setError('Invalid cosmic snapshot data received');
                      }
                    } else {
                      const errorText = await response.text();
                      let errorMessage = `Failed to fetch: ${response.status}`;
                      try {
                        const errorData = JSON.parse(errorText);
                        if (errorData.error) {
                          errorMessage = errorData.error;
                        }
                      } catch {
                        // Use default
                      }
                      setError(errorMessage);
                    }
                  } catch (err) {
                    setError(
                      err instanceof Error
                        ? err.message
                        : 'Failed to load cosmic state',
                    );
                  } finally {
                    setLoading(false);
                  }
                };
                fetchCosmicState();
              }}
              className='px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white font-medium transition-colors'
            >
              Retry
            </button>
          </div>
        </div>
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
          {error && cosmicData && (
            <div className='mt-4 bg-lunary-accent-900/20 border border-lunary-accent-600 rounded-lg p-3'>
              <p className='text-lunary-accent-300 text-sm'>
                Warning: {error} (showing cached data)
              </p>
            </div>
          )}
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
                    <div className='p-2 bg-lunary-primary-900 rounded-lg'>
                      <TrendingUp className='w-5 h-5 text-lunary-primary' />
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
                            <Zap className='w-4 h-4 text-lunary-accent' />
                            Exact Now
                          </h3>
                          <div className='space-y-2'>
                            {cosmicData.currentTransits
                              .filter((t: any) => !t.applying)
                              .slice(0, 5)
                              .map((transit: any, idx: number) => (
                                <div
                                  key={idx}
                                  className='bg-gradient-to-r from-lunary-accent-900 to-lunary-rose-900 rounded-lg p-3 border border-lunary-accent-700'
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
              <div className='bg-gradient-to-br from-lunary-primary-900/30 to-lunary-highlight-900/30 rounded-xl p-6 border border-lunary-primary-800'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='p-2 bg-lunary-primary-900 rounded-lg'>
                    <Sparkles className='w-5 h-5 text-lunary-primary' />
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
                                  className='text-xs px-3 py-1.5 rounded-full bg-lunary-primary-900 text-indigo-200 border border-indigo-500/30'
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
                : "We're creating your cosmic snapshot. It will appear here as soon as it is ready."}
            </p>
            {!loading && (
              <div className='text-xs text-zinc-500'>
                Make sure your profile has your birthday saved so we can build
                your chart.
                <span className='ml-1'>
                  <Link
                    href='/profile'
                    className='text-purple-400 hover:text-purple-300 underline'
                  >
                    Update profile →
                  </Link>
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
