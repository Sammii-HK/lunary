'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Paywall } from '@/components/Paywall';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

type AdvancedPatternAnalysis = {
  yearOverYear: {
    thisYear: {
      dominantThemes: string[];
      frequentCards: Array<{ name: string; count: number }>;
      patternInsights: string[];
      cardRecaps?: Array<{ cardName: string; recap: string }> | null;
      trends?: Array<{
        metric: string;
        change: number;
        direction: 'up' | 'down' | 'stable';
      }> | null;
    };
    lastYear: {
      dominantThemes: string[];
      frequentCards: Array<{ name: string; count: number }>;
      patternInsights: string[];
      cardRecaps?: Array<{ cardName: string; recap: string }> | null;
      trends?: Array<{
        metric: string;
        change: number;
        direction: 'up' | 'down' | 'stable';
      }> | null;
    };
    comparison: {
      themes: Array<{
        theme: string;
        change: 'increased' | 'decreased' | 'new' | 'removed';
      }>;
      insights: string[];
      trends: Array<{
        metric: string;
        change: number;
        direction: 'up' | 'down' | 'stable';
      }>;
    };
  };
  enhancedTarot: {
    multiDimensional: {
      suitPatterns: Array<{ suit: string; count: number; percentage: number }>;
      arcanaBalance: { major: number; minor: number };
      numberPatterns: Array<{
        number: string;
        count: number;
        meaning: string;
        percentage: number;
      }>;
      correlations: Array<{
        dimension1: string;
        dimension2: string;
        insight: string;
      }>;
    };
    timeline: {
      days30: {
        dominantThemes: string[];
        frequentCards: Array<{ name: string; count: number }>;
      };
      days180?: {
        dominantThemes: string[];
        frequentCards: Array<{ name: string; count: number }>;
      };
      days365?: {
        dominantThemes: string[];
        frequentCards: Array<{ name: string; count: number }>;
      };
    };
  };
  extendedTimeline?: {
    months6?: {
      dominantThemes: string[];
      frequentCards: Array<{ name: string; count: number }>;
      trendAnalysis: string[];
      timelineData?: Array<{
        date: string;
        cards: Array<{ name: string; suit: string }>;
      }>;
    };
    months12?: {
      dominantThemes: string[];
      frequentCards: Array<{ name: string; count: number }>;
      trendAnalysis: string[];
      timelineData?: Array<{
        date: string;
        cards: Array<{ name: string; suit: string }>;
      }>;
    };
  };
};

type BasicPatterns = {
  dominantThemes: string[];
  frequentCards: Array<{ name: string; count: number; reading?: string }>;
  suitPatterns: Array<{
    suit: string;
    count: number;
    reading?: string;
    cards: Array<{ name: string; count: number }>;
  }>;
  numberPatterns: Array<{
    number: string;
    count: number;
    reading?: string;
    cards: string[];
  }>;
  arcanaPatterns: Array<{ type: string; count: number; reading?: string }>;
  timeFrame: number;
};

interface RecentReading {
  date: string;
  day: string;
  card: {
    name: string;
    keywords: string[];
  };
}

interface AdvancedPatternsProps {
  basicPatterns?: BasicPatterns;
  selectedView: number | 'year-over-year';
  isMultidimensionalMode: boolean;
  onMultidimensionalModeChange: (enabled: boolean) => void;
  recentReadings?: RecentReading[];
  onCardClick?: (card: { name: string }) => void;
}

export function AdvancedPatterns({
  basicPatterns,
  selectedView,
  isMultidimensionalMode,
  onMultidimensionalModeChange,
  recentReadings,
  onCardClick,
}: AdvancedPatternsProps) {
  const subscription = useSubscription();
  const timeFrame = typeof selectedView === 'number' ? selectedView : 30;

  // Memoize derived values to prevent unnecessary re-renders
  const hasAdvancedAccess = useMemo(
    () => subscription.hasAccess('advanced_patterns'),
    [subscription],
  );
  const hasTarotPatternsAccess = useMemo(
    () => subscription.hasAccess('tarot_patterns'),
    [subscription],
  );
  const isAnnual = useMemo(
    () => subscription.plan === 'yearly',
    [subscription.plan],
  );

  const [analysis, setAnalysis] = useState<AdvancedPatternAnalysis | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedRef = useRef<string>('');

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[AdvancedPatterns] Subscription state:', {
        plan: subscription.plan,
        status: subscription.status,
        hasAdvancedAccess,
        hasTarotPatternsAccess,
        isSubscribed: subscription.isSubscribed,
        customerId: subscription.customerId,
      });
      // Test feature access directly
      console.log('[AdvancedPatterns] Direct feature access test:', {
        advanced: subscription.hasAccess('advanced_patterns'),
        tarot: subscription.hasAccess('tarot_patterns'),
      });
    }
  }, [subscription, hasAdvancedAccess, hasTarotPatternsAccess]);

  const fetchAdvancedPatterns = useCallback(async () => {
    if (loading) return; // Prevent concurrent fetches
    setLoading(true);
    setError(null);
    try {
      // Build query params based on selectedView
      // Always pass days parameter when it's a number (for multidimensional analysis)
      const params = new URLSearchParams();
      if (typeof selectedView === 'number') {
        params.set('days', selectedView.toString());
      }
      const response = await fetch(
        `/api/patterns/advanced?${params.toString()}`,
      );
      if (!response.ok) {
        if (response.status === 403) {
          setError('Upgrade to Lunary+ AI to access advanced pattern analysis');
          // Don't return - allow component to show upgrade UI
        } else {
          setError('Failed to load advanced patterns');
          return;
        }
      } else {
        const data = await response.json();
        if (data.success && data.analysis) {
          setAnalysis(data.analysis);
          setError(null);
          // Cache in sessionStorage with date range in key (each date range cached separately)
          try {
            const cacheKey = `advanced-patterns-analysis-${selectedView}-${isMultidimensionalMode}`;
            sessionStorage.setItem(
              cacheKey,
              JSON.stringify({
                data: data.analysis,
                timestamp: Date.now(),
              }),
            );
          } catch (e) {
            // Ignore storage errors
          }
        } else {
          setError('Invalid response from server');
        }
      }
    } catch (err) {
      console.error('Failed to fetch advanced patterns:', err);
      setError('Unable to load advanced patterns');
    } finally {
      setLoading(false);
    }
  }, [selectedView, isMultidimensionalMode, loading]);

  useEffect(() => {
    // Fetch advanced patterns when:
    // 1. Multidimensional mode is ON and we don't have data yet
    // 2. Selected view is year-over-year
    // Skip fetching if already loading
    if (loading) return;

    const fetchKey = `${selectedView}-${isMultidimensionalMode}`;
    const needsFetch = isMultidimensionalMode;

    if (!needsFetch) return;

    // Check cache first (with date range in key) - each date range cached separately
    const cacheKey = `advanced-patterns-analysis-${selectedView}-${isMultidimensionalMode}`;
    let cachedData = null;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check if cache is less than 1 hour old
        const cacheAge = Date.now() - (parsed.timestamp || 0);
        if (cacheAge < 3600000) {
          cachedData = parsed.data;
        }
      }
    } catch (e) {
      // Ignore cache errors
    }

    // If view changed, update ref
    const viewChanged = lastFetchedRef.current !== fetchKey;
    if (viewChanged) {
      lastFetchedRef.current = fetchKey;
    }

    // If we have cached data for this date range, use it (don't fetch)
    if (cachedData) {
      if (!analysis || viewChanged) {
        setAnalysis(cachedData);
      }
      return; // Don't fetch if we have valid cache
    }

    // If we already have analysis for this exact combination, don't fetch again
    if (!viewChanged && analysis) {
      return;
    }

    // At this point, we have no cached data and need fresh analysis
    // Note: year-over-year data is included in the API response, so we fetch for any advanced mode
    fetchAdvancedPatterns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMultidimensionalMode, selectedView]);

  // Wait for subscription to load before showing paywall
  if (subscription.loading) {
    return (
      <div className='text-center py-8 text-zinc-400 text-sm'>
        Loading subscription...
      </div>
    );
  }

  // Show paywall if user doesn't have tarot_patterns access
  if (!hasTarotPatternsAccess) {
    return (
      <Paywall feature='tarot_patterns'>
        <div />
      </Paywall>
    );
  }

  return (
    <div className='relative'>
      {/* Show basic patterns when not in multidimensional mode and not year-over-year */}
      {!isMultidimensionalMode && selectedView !== 'year-over-year' && (
        <div className='space-y-6 pt-8'>
          {basicPatterns ? (
            <>
              {basicPatterns.dominantThemes.length > 0 && (
                <div>
                  <h3 className='text-sm font-medium text-zinc-300 mb-3'>
                    Dominant Themes
                  </h3>
                  <div className='flex flex-wrap gap-2'>
                    {basicPatterns.dominantThemes.map((theme, index) => (
                      <span
                        key={theme}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                          index === 0
                            ? 'bg-lunary-primary-900 text-lunary-accent-300 border border-lunary-primary-700'
                            : index === 1
                              ? 'bg-lunary-primary-900 text-lunary-accent-300 border border-lunary-primary-800'
                              : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50'
                        }`}
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {basicPatterns.frequentCards.length > 0 && (
                <div>
                  <h3 className='text-sm font-medium text-zinc-300 mb-3'>
                    Frequent Cards
                  </h3>
                  <div className='space-y-3'>
                    {basicPatterns.frequentCards
                      .slice(0, 5)
                      .map((card, index) => (
                        <div
                          key={index}
                          className='rounded-lg border border-lunary-secondary-800 bg-lunary-secondary-950 p-4'
                        >
                          <p className='font-medium text-zinc-100 mb-2'>
                            {card.name} ({card.count}x)
                          </p>
                          {card.reading && (
                            <p className='text-sm text-zinc-400 leading-relaxed'>
                              {card.reading}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {basicPatterns.suitPatterns.length > 0 && (
                <div>
                  <h3 className='text-sm font-medium text-zinc-300 mb-3'>
                    Suit Patterns
                  </h3>
                  <div className='space-y-3'>
                    {basicPatterns.suitPatterns
                      .slice(0, 4)
                      .map((pattern, index) => {
                        const percentage =
                          basicPatterns.timeFrame > 0
                            ? Math.round(
                                (pattern.count / basicPatterns.timeFrame) * 100,
                              )
                            : 0;
                        return (
                          <div
                            key={index}
                            className='rounded-lg border border-lunary-primary-800 bg-lunary-primary-950 p-4'
                          >
                            <div className='flex items-center justify-between mb-2'>
                              <span className='font-medium text-zinc-100'>
                                {pattern.suit}
                              </span>
                              <span className='text-xs text-zinc-400'>
                                {pattern.count}/{basicPatterns.timeFrame} days
                              </span>
                            </div>
                            <div className='flex items-center gap-3 mb-2'>
                              <div className='flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden'>
                                <div
                                  className='h-full bg-lunary-primary rounded-full transition-all duration-300'
                                  style={{
                                    width: `${Math.min(percentage, 100)}%`,
                                  }}
                                />
                              </div>
                              <span className='text-xs text-lunary-accent-300 font-medium w-10 text-right'>
                                {percentage}%
                              </span>
                            </div>
                            {pattern.reading && (
                              <p className='text-sm text-zinc-400 leading-relaxed'>
                                {pattern.reading}
                              </p>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Show recent daily cards for 7-day view */}
              {selectedView === 7 &&
                recentReadings &&
                recentReadings.length > 0 && (
                  <div className='mt-4'>
                    <h3 className='text-sm font-medium text-zinc-300 mb-2'>
                      Recent Daily Cards
                    </h3>
                    <div className='space-y-1'>
                      {recentReadings.map((reading) => (
                        <div
                          key={reading.date}
                          className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-2 flex justify-between items-center hover:bg-zinc-900/50 transition-colors cursor-pointer'
                          onClick={() => {
                            if (onCardClick) {
                              onCardClick(reading.card);
                            }
                          }}
                        >
                          <div className='flex items-center gap-2'>
                            <span className='text-xs font-medium text-zinc-300'>
                              {reading.day}
                            </span>
                            <span className='text-[10px] text-zinc-400'>
                              {reading.date}
                            </span>
                          </div>
                          <div className='text-right'>
                            <p className='text-xs font-medium text-zinc-100 hover:text-lunary-accent-300 transition-colors'>
                              {reading.card.name}
                            </p>
                            {reading.card.keywords[0] && (
                              <p className='text-[10px] text-zinc-400'>
                                {reading.card.keywords[0]}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </>
          ) : (
            <div className='text-center py-8 text-zinc-400 text-sm'>
              Generating your tarot patterns...
            </div>
          )}
        </div>
      )}

      {/* Show year-over-year when selected AND advanced mode is ON */}
      {selectedView === 'year-over-year' && isMultidimensionalMode && (
        <div className='space-y-4 pt-8'>
          {loading && (
            <div className='flex items-center justify-center py-12'>
              <div className='flex flex-col items-center gap-3'>
                <div className='w-8 h-8 border-2 border-lunary-primary-700 border-t-lunary-primary rounded-full animate-spin' />
                <p className='text-sm text-zinc-400'>
                  Loading year-over-year analysis...
                </p>
              </div>
            </div>
          )}
          {error && !analysis && !loading && (
            <div className='rounded-lg border border-lunary-primary-700 bg-lunary-primary-950 p-4 mb-4'>
              <div className='flex items-start gap-3'>
                <Lock className='h-5 w-5 text-lunary-accent mt-0.5 flex-shrink-0' />
                <div className='flex-1'>
                  <h4 className='text-sm font-medium text-lunary-accent-200 mb-1'>
                    Advanced Pattern Analysis
                  </h4>
                  <p className='text-xs text-lunary-accent-300 mb-3'>
                    Upgrade to Lunary+ AI to unlock year-over-year comparisons,
                    multi-dimensional analysis, and extended timeline insights.
                  </p>
                  <UpgradePrompt
                    variant='inline'
                    featureName='advanced_patterns'
                  />
                </div>
              </div>
            </div>
          )}

          {error && analysis && (
            <div className='text-center py-8 text-red-400 text-sm'>{error}</div>
          )}

          {analysis && analysis.yearOverYear && !loading && (
            <div className='space-y-6'>
              <div className='space-y-4'>
                <div>
                  <h4 className='text-sm font-medium text-zinc-300 mb-3'>
                    This Year vs Last Year
                  </h4>
                  <div className='grid gap-4 md:grid-cols-2'>
                    <div className='rounded-lg border border-lunary-primary-800 bg-lunary-primary-950 p-4'>
                      <h5 className='text-xs font-medium text-lunary-accent-300 mb-2'>
                        This Year
                      </h5>
                      {analysis.yearOverYear.thisYear.dominantThemes.length >
                        0 && (
                        <div className='flex flex-wrap gap-1.5 mb-3'>
                          {analysis.yearOverYear.thisYear.dominantThemes.map(
                            (theme) => (
                              <span
                                key={theme}
                                className='px-2 py-0.5 text-xs rounded bg-lunary-primary-900 text-lunary-accent-200'
                              >
                                {theme}
                              </span>
                            ),
                          )}
                        </div>
                      )}
                      {analysis.yearOverYear.thisYear.frequentCards.length >
                        0 && (
                        <div className='space-y-3'>
                          {analysis.yearOverYear.thisYear.frequentCards
                            .slice(0, 3)
                            .map((card) => {
                              // Find trend for this card if available
                              const cardTrend =
                                analysis.yearOverYear.comparison.trends.find(
                                  (t) =>
                                    t.metric === `${card.name} appearances`,
                                );
                              // Find recap for this card if available
                              const cardRecap =
                                analysis.yearOverYear.thisYear.cardRecaps?.find(
                                  (r) => r.cardName === card.name,
                                );
                              return (
                                <div key={card.name} className='space-y-1'>
                                  <div className='flex items-center justify-between text-xs'>
                                    <span className='text-zinc-300 font-medium'>
                                      {card.name} ({card.count}x)
                                    </span>
                                    {cardTrend && (
                                      <span
                                        className={cn(
                                          'flex items-center gap-0.5 text-[10px]',
                                          cardTrend.direction === 'up'
                                            ? 'text-lunary-success'
                                            : cardTrend.direction === 'down'
                                              ? 'text-red-400'
                                              : 'text-zinc-400',
                                        )}
                                      >
                                        {cardTrend.direction === 'up'
                                          ? '↑'
                                          : cardTrend.direction === 'down'
                                            ? '↓'
                                            : '→'}
                                        {cardTrend.change > 0 ? '+' : ''}
                                        {cardTrend.change}%
                                      </span>
                                    )}
                                  </div>
                                  {cardRecap && (
                                    <p className='text-xs text-zinc-400 leading-relaxed'>
                                      {cardRecap.recap}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                    <div className='rounded-lg border border-lunary-secondary-800 bg-lunary-secondary-950 p-4'>
                      <h5 className='text-xs font-medium text-lunary-secondary-300 mb-2'>
                        Last Year
                      </h5>
                      {analysis.yearOverYear.lastYear.dominantThemes.length >
                        0 ||
                      analysis.yearOverYear.lastYear.frequentCards.length >
                        0 ? (
                        <>
                          {analysis.yearOverYear.lastYear.dominantThemes
                            .length > 0 && (
                            <div className='flex flex-wrap gap-1.5 mb-3'>
                              {analysis.yearOverYear.lastYear.dominantThemes.map(
                                (theme) => (
                                  <span
                                    key={theme}
                                    className='px-2 py-0.5 text-xs rounded bg-lunary-secondary-900 text-lunary-secondary-200'
                                  >
                                    {theme}
                                  </span>
                                ),
                              )}
                            </div>
                          )}
                          {analysis.yearOverYear.lastYear.frequentCards.length >
                          0 ? (
                            <div className='space-y-3'>
                              {analysis.yearOverYear.lastYear.frequentCards
                                .slice(0, 3)
                                .map((card) => {
                                  // Find recap for this card if available
                                  const cardRecap =
                                    analysis.yearOverYear.lastYear.cardRecaps?.find(
                                      (r) => r.cardName === card.name,
                                    );
                                  return (
                                    <div key={card.name} className='space-y-1'>
                                      <div className='text-xs text-zinc-300 font-medium'>
                                        {card.name} ({card.count}x)
                                      </div>
                                      {cardRecap && (
                                        <p className='text-xs text-zinc-400 leading-relaxed'>
                                          {cardRecap.recap}
                                        </p>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          ) : null}
                        </>
                      ) : (
                        <p className='text-xs text-zinc-400 mb-3'>
                          No historical data available for comparison
                        </p>
                      )}
                    </div>
                  </div>
                  {analysis.yearOverYear.comparison.trends.length > 0 && (
                    <div className='mt-4 rounded-lg border border-lunary-success-800 bg-lunary-success-950 p-4'>
                      <h5 className='text-xs font-medium text-lunary-success-300 mb-2'>
                        Year-over-Year Trends
                      </h5>
                      <div className='space-y-2'>
                        {analysis.yearOverYear.comparison.trends
                          .slice(0, 5)
                          .map((trend, idx) => {
                            const arrow =
                              trend.direction === 'up'
                                ? '↑'
                                : trend.direction === 'down'
                                  ? '↓'
                                  : '→';
                            const colorClass =
                              trend.direction === 'up'
                                ? 'text-lunary-success'
                                : trend.direction === 'down'
                                  ? 'text-red-400'
                                  : 'text-zinc-400';
                            const changeSign = trend.change > 0 ? '+' : '';
                            return (
                              <div
                                key={idx}
                                className='flex items-center justify-between text-xs'
                              >
                                <span className='text-zinc-300'>
                                  {trend.metric}
                                </span>
                                <span
                                  className={cn(
                                    'flex items-center gap-1',
                                    colorClass,
                                  )}
                                >
                                  <span>{arrow}</span>
                                  <span>
                                    {changeSign}
                                    {trend.change}%
                                  </span>
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                  {analysis.yearOverYear.comparison.insights.length > 0 && (
                    <div className='mt-4 rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
                      <h5 className='text-xs font-medium text-zinc-300 mb-2'>
                        Comparison Insights
                      </h5>
                      <ul className='space-y-1 text-xs text-zinc-400'>
                        {analysis.yearOverYear.comparison.insights.map(
                          (insight, idx) => (
                            <li key={idx}>{insight}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Show multidimensional analysis when sparkle is ON and a date tab is selected */}
      {isMultidimensionalMode && typeof selectedView === 'number' && (
        <div className='space-y-4 pt-8'>
          {loading && (
            <div className='flex items-center justify-center py-12'>
              <div className='flex flex-col items-center gap-3'>
                <div className='w-8 h-8 border-2 border-lunary-primary-700 border-t-lunary-primary rounded-full animate-spin' />
                <p className='text-sm text-zinc-400'>
                  Loading multidimensional analysis...
                </p>
              </div>
            </div>
          )}
          {error && !analysis && !loading && (
            <div className='rounded-lg border border-lunary-primary-700 bg-lunary-primary-950 p-4 mb-4'>
              <div className='flex items-start gap-3'>
                <Lock className='h-5 w-5 text-lunary-accent mt-0.5 flex-shrink-0' />
                <div className='flex-1'>
                  <h4 className='text-sm font-medium text-lunary-accent-200 mb-1'>
                    Advanced Pattern Analysis
                  </h4>
                  <p className='text-xs text-lunary-accent-300 mb-3'>
                    Upgrade to Lunary+ AI to unlock year-over-year comparisons,
                    multi-dimensional analysis, and extended timeline insights.
                  </p>
                  <UpgradePrompt
                    variant='inline'
                    featureName='advanced_patterns'
                  />
                </div>
              </div>
            </div>
          )}

          {error && analysis && (
            <div className='text-center py-8 text-red-400 text-sm'>{error}</div>
          )}

          {analysis && analysis.enhancedTarot && !loading && (
            <div className='space-y-6'>
              <div className='space-y-4'>
                <div>
                  <h4 className='text-sm font-medium text-zinc-300 mb-3'>
                    Multi-Dimensional Analysis
                    {typeof selectedView === 'number' && (
                      <span className='text-xs text-zinc-400 ml-2'>
                        ({selectedView} days)
                      </span>
                    )}
                  </h4>
                  <div className='grid gap-4 md:grid-cols-2'>
                    <div className='rounded-lg border border-lunary-primary-800 bg-lunary-primary-950 p-4'>
                      <h5 className='text-xs font-medium text-lunary-accent-300 mb-3'>
                        Suit Distribution
                      </h5>
                      <div className='space-y-2.5'>
                        {analysis.enhancedTarot.multiDimensional.suitPatterns.map(
                          (suit) => (
                            <div key={suit.suit} className='space-y-1'>
                              <div className='flex items-center justify-between text-xs'>
                                <span className='text-zinc-300'>
                                  {suit.suit}
                                </span>
                                <span className='text-zinc-400'>
                                  {suit.count}x
                                </span>
                              </div>
                              <div className='flex items-center gap-2'>
                                <div className='flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden'>
                                  <div
                                    className='h-full bg-lunary-primary rounded-full transition-all duration-300'
                                    style={{
                                      width: `${Math.min(suit.percentage, 100)}%`,
                                    }}
                                  />
                                </div>
                                <span className='text-[10px] text-lunary-accent-300 font-medium w-8 text-right'>
                                  {suit.percentage}%
                                </span>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                    <div className='rounded-lg border border-lunary-secondary-800 bg-lunary-secondary-950 p-4'>
                      <h5 className='text-xs font-medium text-lunary-secondary-300 mb-3'>
                        Arcana Balance
                      </h5>
                      <div className='space-y-2.5 text-xs'>
                        {(() => {
                          const total =
                            analysis.enhancedTarot.multiDimensional
                              .arcanaBalance.major +
                            analysis.enhancedTarot.multiDimensional
                              .arcanaBalance.minor;
                          const majorPercentage =
                            total > 0
                              ? Math.round(
                                  (analysis.enhancedTarot.multiDimensional
                                    .arcanaBalance.major /
                                    total) *
                                    100,
                                )
                              : 0;
                          const minorPercentage =
                            total > 0
                              ? Math.round(
                                  (analysis.enhancedTarot.multiDimensional
                                    .arcanaBalance.minor /
                                    total) *
                                    100,
                                )
                              : 0;
                          return (
                            <>
                              <div className='space-y-1'>
                                <div className='flex items-center justify-between'>
                                  <span className='text-zinc-300'>
                                    Major Arcana
                                  </span>
                                  <span className='text-zinc-400'>
                                    {
                                      analysis.enhancedTarot.multiDimensional
                                        .arcanaBalance.major
                                    }
                                    x
                                  </span>
                                </div>
                                <div className='flex items-center gap-2'>
                                  <div className='flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden'>
                                    <div
                                      className='h-full bg-lunary-secondary rounded-full transition-all duration-300'
                                      style={{ width: `${majorPercentage}%` }}
                                    />
                                  </div>
                                  <span className='text-[10px] text-lunary-secondary-300 font-medium w-8 text-right'>
                                    {majorPercentage}%
                                  </span>
                                </div>
                              </div>
                              <div className='space-y-1'>
                                <div className='flex items-center justify-between'>
                                  <span className='text-zinc-300'>
                                    Minor Arcana
                                  </span>
                                  <span className='text-zinc-400'>
                                    {
                                      analysis.enhancedTarot.multiDimensional
                                        .arcanaBalance.minor
                                    }
                                    x
                                  </span>
                                </div>
                                <div className='flex items-center gap-2'>
                                  <div className='flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden'>
                                    <div
                                      className='h-full bg-lunary-secondary rounded-full transition-all duration-300'
                                      style={{ width: `${minorPercentage}%` }}
                                    />
                                  </div>
                                  <span className='text-[10px] text-lunary-secondary-300 font-medium w-8 text-right'>
                                    {minorPercentage}%
                                  </span>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                  {analysis.enhancedTarot.multiDimensional.numberPatterns
                    .length > 0 && (
                    <div className='mt-4 rounded-lg border border-lunary-success-800 bg-lunary-success-950 p-4'>
                      <h5 className='text-xs font-medium text-lunary-success-300 mb-3'>
                        Number Patterns
                      </h5>
                      <div className='space-y-3'>
                        {analysis.enhancedTarot.multiDimensional.numberPatterns.map(
                          (pattern) => (
                            <div key={pattern.number} className='text-xs'>
                              <div className='flex items-center justify-between mb-1'>
                                <span className='text-zinc-300 font-medium'>
                                  {pattern.number}
                                </span>
                                <span className='text-zinc-400'>
                                  {pattern.count}x
                                </span>
                              </div>
                              <div className='flex items-center gap-2 mb-1.5'>
                                <div className='flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden'>
                                  <div
                                    className='h-full bg-lunary-success rounded-full transition-all duration-300'
                                    style={{
                                      width: `${Math.min(pattern.percentage, 100)}%`,
                                    }}
                                  />
                                </div>
                                <span className='text-[10px] text-lunary-success-300 font-medium w-8 text-right'>
                                  {pattern.percentage}%
                                </span>
                              </div>
                              <p className='text-zinc-400'>{pattern.meaning}</p>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                  {analysis.enhancedTarot.multiDimensional.correlations.length >
                    0 && (
                    <div className='mt-4 rounded-lg border border-lunary-accent-800 bg-lunary-accent-950 p-4'>
                      <h5 className='text-xs font-medium text-lunary-accent-300 mb-2'>
                        Dimension Correlations
                      </h5>
                      <div className='space-y-2'>
                        {analysis.enhancedTarot.multiDimensional.correlations.map(
                          (correlation, idx) => (
                            <div key={idx} className='text-xs'>
                              <div className='flex items-center gap-2 mb-1'>
                                <span className='text-lunary-accent-300 font-medium'>
                                  {correlation.dimension1}
                                </span>
                                <span className='text-zinc-400'>×</span>
                                <span className='text-lunary-accent-300 font-medium'>
                                  {correlation.dimension2}
                                </span>
                              </div>
                              <p className='text-zinc-400 leading-relaxed'>
                                {correlation.insight}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getCardSuitColor(cardName: string): string {
  if (
    cardName.includes('Major') ||
    [
      'Fool',
      'Magician',
      'High Priestess',
      'Empress',
      'Emperor',
      'Hierophant',
      'Lovers',
      'Chariot',
      'Strength',
      'Hermit',
      'Wheel of Fortune',
      'Justice',
      'Hanged Man',
      'Death',
      'Temperance',
      'Devil',
      'Tower',
      'Star',
      'Moon',
      'Sun',
      'Judgement',
      'World',
    ].some((name) => cardName.includes(name))
  ) {
    return 'bg-lunary-primary-800 border-lunary-primary-600';
  }
  if (cardName.includes('Wands')) return 'bg-red-500/30 border-red-500/50';
  if (cardName.includes('Cups'))
    return 'bg-lunary-secondary-800 border-lunary-secondary-600';
  if (cardName.includes('Swords'))
    return 'bg-lunary-accent-800 border-lunary-accent-600';
  if (cardName.includes('Pentacles'))
    return 'bg-lunary-success-800 border-lunary-success-600';
  return 'bg-zinc-500/30 border-zinc-500/50';
}
