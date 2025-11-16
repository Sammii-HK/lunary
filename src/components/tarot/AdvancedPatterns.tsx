'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Paywall } from '@/components/Paywall';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import {
  Sparkles,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';

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
      numberPatterns: Array<{ number: string; count: number; meaning: string }>;
      elementPatterns: Array<{
        element: string;
        count: number;
        percentage: number;
        suits: string[];
      }>;
      colorPatterns: Array<{
        color: string;
        count: number;
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

type ViewMode = 'daily' | 'advanced';
type AdvancedTab = 'year-over-year' | 'multi-dimensional' | 'timeline';
type TimelinePeriod = '6-month' | '12-month';

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

interface AdvancedPatternsProps {
  basicPatterns?: BasicPatterns;
}

export function AdvancedPatterns({ basicPatterns }: AdvancedPatternsProps) {
  const subscription = useSubscription();

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

  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [activeTab, setActiveTab] = useState<AdvancedTab>('year-over-year');
  const [timelinePeriod, setTimelinePeriod] =
    useState<TimelinePeriod>('6-month');
  const [analysis, setAnalysis] = useState<AdvancedPatternAnalysis | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Check sessionStorage for cached analysis
  useEffect(() => {
    if (viewMode === 'advanced' && !analysis) {
      try {
        const cached = sessionStorage.getItem('advanced-patterns-analysis');
        if (cached) {
          const parsed = JSON.parse(cached);
          // Check if cache is less than 1 hour old
          const cacheAge = Date.now() - (parsed.timestamp || 0);
          if (cacheAge < 3600000) {
            setAnalysis(parsed.data);
            return;
          }
        }
      } catch (e) {
        // Ignore cache errors
      }
    }
  }, [viewMode, analysis]);

  const fetchAdvancedPatterns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/patterns/advanced');
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
          // Cache in sessionStorage
          try {
            sessionStorage.setItem(
              'advanced-patterns-analysis',
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
  }, []);

  useEffect(() => {
    // Only fetch when switching to advanced mode and we don't have data yet
    if (viewMode === 'advanced' && !analysis && !loading && !error) {
      fetchAdvancedPatterns();
    }
  }, [viewMode, analysis, loading, error, fetchAdvancedPatterns]);

  const availableTabs: AdvancedTab[] = isAnnual
    ? ['year-over-year', 'multi-dimensional', 'timeline']
    : ['year-over-year', 'multi-dimensional'];

  // Wait for subscription to load before showing paywall
  if (subscription.loading) {
    return (
      <div className='text-center py-8 text-zinc-400 text-sm'>
        Loading subscription...
      </div>
    );
  }

  // Show paywall if user doesn't have tarot_patterns access (for daily view)
  if (!hasTarotPatternsAccess) {
    return (
      <Paywall feature='tarot_patterns'>
        <div />
      </Paywall>
    );
  }

  return (
    <div className='relative'>
      <button
        onClick={() => setViewMode(viewMode === 'daily' ? 'advanced' : 'daily')}
        className={cn(
          'absolute top-0 right-0 p-1.5 rounded-md transition-colors',
          hasAdvancedAccess
            ? 'bg-zinc-800/50 hover:bg-zinc-800/70 text-zinc-400 hover:text-zinc-300'
            : viewMode === 'advanced'
              ? 'bg-zinc-800/30 text-zinc-500'
              : 'bg-zinc-800/30 text-zinc-600 hover:bg-zinc-800/40',
        )}
        aria-label={
          viewMode === 'daily'
            ? 'Switch to advanced view'
            : 'Switch to daily view'
        }
      >
        {viewMode === 'daily' ? (
          <BarChart3 className='w-4 h-4' />
        ) : (
          <Sparkles className='w-4 h-4' />
        )}
      </button>

      {viewMode === 'daily' && (
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
                            ? 'bg-purple-500/20 text-purple-300/90 border border-purple-500/30'
                            : index === 1
                              ? 'bg-purple-500/15 text-purple-300/80 border border-purple-500/20'
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
                          className='rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-4'
                        >
                          <p className='font-medium text-zinc-100 mb-1'>
                            {card.name} ({card.count} times)
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
                      .map((pattern, index) => (
                        <div
                          key={index}
                          className='rounded-lg border border-purple-500/20 bg-purple-500/10 p-4'
                        >
                          <p className='font-medium text-zinc-100 mb-2'>
                            {pattern.suit} ({pattern.count}/
                            {basicPatterns.timeFrame} days)
                          </p>
                          {pattern.reading && (
                            <p className='text-sm text-zinc-400 leading-relaxed'>
                              {pattern.reading}
                            </p>
                          )}
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

      {viewMode === 'advanced' && (
        <div className='space-y-4'>
          {loading && (
            <div className='flex items-center justify-center py-12'>
              <div className='flex flex-col items-center gap-3'>
                <div className='w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin' />
                <p className='text-sm text-zinc-400'>
                  Loading advanced patterns...
                </p>
              </div>
            </div>
          )}
          {error && !analysis && !loading && (
            <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-4 mb-4'>
              <div className='flex items-start gap-3'>
                <Lock className='h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0' />
                <div className='flex-1'>
                  <h4 className='text-sm font-medium text-purple-200 mb-1'>
                    Advanced Pattern Analysis
                  </h4>
                  <p className='text-xs text-purple-300/80 mb-3'>
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
          <div className='flex flex-wrap gap-1.5 pt-8'>
            {availableTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  if (!analysis) return;
                  setActiveTab(tab);
                }}
                disabled={!analysis}
                className={cn(
                  'px-2 py-1 text-xs rounded-full transition-colors',
                  !analysis
                    ? 'bg-zinc-800/30 text-zinc-600 border border-zinc-700/30 cursor-not-allowed opacity-50'
                    : activeTab === tab
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800/70',
                )}
                title={!analysis ? 'Upgrade to unlock' : undefined}
              >
                {tab === 'year-over-year' && 'Year-over-Year'}
                {tab === 'multi-dimensional' && 'Multi-Dimensional'}
                {tab === 'timeline' && 'Timeline'}
              </button>
            ))}
          </div>

          {error && !analysis && (
            <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-8 text-center space-y-4 opacity-50 pointer-events-none'>
              <BarChart3 className='w-12 h-12 text-zinc-600 mx-auto' />
              <div>
                <h4 className='text-sm font-medium text-zinc-400 mb-2'>
                  Advanced Pattern Analysis
                </h4>
                <p className='text-xs text-zinc-500'>
                  Year-over-year comparisons, multi-dimensional insights, and
                  extended timeline analysis
                </p>
              </div>
            </div>
          )}

          {analysis && (
            <>
              {loading && (
                <div className='text-center py-8 text-zinc-400 text-sm'>
                  Loading advanced patterns...
                </div>
              )}

              {error && (
                <div className='text-center py-8 text-red-400 text-sm'>
                  {error}
                </div>
              )}

              {analysis && !loading && (
                <div className='space-y-6'>
                  {activeTab === 'year-over-year' && analysis.yearOverYear && (
                    <div className='space-y-4'>
                      <div>
                        <h4 className='text-sm font-medium text-zinc-300 mb-3'>
                          This Year vs Last Year
                        </h4>
                        <div className='grid gap-4 md:grid-cols-2'>
                          <div className='rounded-lg border border-purple-500/20 bg-purple-500/10 p-4'>
                            <h5 className='text-xs font-medium text-purple-300/90 mb-2'>
                              This Year
                            </h5>
                            {analysis.yearOverYear.thisYear.dominantThemes
                              .length > 0 && (
                              <div className='flex flex-wrap gap-1.5 mb-3'>
                                {analysis.yearOverYear.thisYear.dominantThemes.map(
                                  (theme) => (
                                    <span
                                      key={theme}
                                      className='px-2 py-0.5 text-xs rounded bg-purple-500/20 text-purple-200'
                                    >
                                      {theme}
                                    </span>
                                  ),
                                )}
                              </div>
                            )}
                            {analysis.yearOverYear.thisYear.frequentCards
                              .length > 0 && (
                              <div className='space-y-3'>
                                {analysis.yearOverYear.thisYear.frequentCards
                                  .slice(0, 3)
                                  .map((card) => {
                                    // Find trend for this card if available
                                    const cardTrend =
                                      analysis.yearOverYear.comparison.trends.find(
                                        (t) =>
                                          t.metric ===
                                          `${card.name} appearances`,
                                      );
                                    // Find recap for this card if available
                                    const cardRecap =
                                      analysis.yearOverYear.thisYear.cardRecaps?.find(
                                        (r) => r.cardName === card.name,
                                      );
                                    return (
                                      <div
                                        key={card.name}
                                        className='space-y-1'
                                      >
                                        <div className='flex items-center justify-between text-xs'>
                                          <span className='text-zinc-300 font-medium'>
                                            {card.name} ({card.count}x)
                                          </span>
                                          {cardTrend && (
                                            <span
                                              className={cn(
                                                'flex items-center gap-0.5 text-[10px]',
                                                cardTrend.direction === 'up'
                                                  ? 'text-emerald-400'
                                                  : cardTrend.direction ===
                                                      'down'
                                                    ? 'text-red-400'
                                                    : 'text-zinc-500',
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
                          <div className='rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-4'>
                            <h5 className='text-xs font-medium text-indigo-300/90 mb-2'>
                              Last Year
                            </h5>
                            {loading ? (
                              <p className='text-xs text-zinc-400 mb-3'>
                                Generating historical data...
                              </p>
                            ) : analysis.yearOverYear.lastYear.dominantThemes
                                .length > 0 ||
                              analysis.yearOverYear.lastYear.frequentCards
                                .length > 0 ? (
                              <>
                                {analysis.yearOverYear.lastYear.dominantThemes
                                  .length > 0 && (
                                  <div className='flex flex-wrap gap-1.5 mb-3'>
                                    {analysis.yearOverYear.lastYear.dominantThemes.map(
                                      (theme) => (
                                        <span
                                          key={theme}
                                          className='px-2 py-0.5 text-xs rounded bg-indigo-500/20 text-indigo-200'
                                        >
                                          {theme}
                                        </span>
                                      ),
                                    )}
                                  </div>
                                )}
                                {analysis.yearOverYear.lastYear.frequentCards
                                  .length > 0 ? (
                                  <div className='space-y-1'>
                                    {analysis.yearOverYear.lastYear.frequentCards
                                      .slice(0, 3)
                                      .map((card) => (
                                        <div
                                          key={card.name}
                                          className='text-xs text-zinc-300'
                                        >
                                          {card.name} ({card.count}x)
                                        </div>
                                      ))}
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
                          <div className='mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4'>
                            <h5 className='text-xs font-medium text-emerald-300/90 mb-2'>
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
                                      ? 'text-emerald-400'
                                      : trend.direction === 'down'
                                        ? 'text-red-400'
                                        : 'text-zinc-400';
                                  const changeSign =
                                    trend.change > 0 ? '+' : '';
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
                        {analysis.yearOverYear.comparison.insights.length >
                          0 && (
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
                  )}

                  {activeTab === 'multi-dimensional' &&
                    analysis.enhancedTarot && (
                      <div className='space-y-4'>
                        <div>
                          <h4 className='text-sm font-medium text-zinc-300 mb-3'>
                            Multi-Dimensional Analysis
                          </h4>
                          <div className='grid gap-4 md:grid-cols-2'>
                            <div className='rounded-lg border border-purple-500/20 bg-purple-500/10 p-4'>
                              <h5 className='text-xs font-medium text-purple-300/90 mb-2'>
                                Suit Distribution
                              </h5>
                              <div className='space-y-2'>
                                {analysis.enhancedTarot.multiDimensional.suitPatterns.map(
                                  (suit) => (
                                    <div
                                      key={suit.suit}
                                      className='flex items-center justify-between text-xs'
                                    >
                                      <span className='text-zinc-300'>
                                        {suit.suit}
                                      </span>
                                      <span className='text-zinc-400'>
                                        {suit.count} ({suit.percentage}%)
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                            <div className='rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-4'>
                              <h5 className='text-xs font-medium text-indigo-300/90 mb-2'>
                                Arcana Balance
                              </h5>
                              <div className='space-y-2 text-xs'>
                                <div className='flex items-center justify-between'>
                                  <span className='text-zinc-300'>
                                    Major Arcana
                                  </span>
                                  <span className='text-zinc-400'>
                                    {
                                      analysis.enhancedTarot.multiDimensional
                                        .arcanaBalance.major
                                    }
                                  </span>
                                </div>
                                <div className='flex items-center justify-between'>
                                  <span className='text-zinc-300'>
                                    Minor Arcana
                                  </span>
                                  <span className='text-zinc-400'>
                                    {
                                      analysis.enhancedTarot.multiDimensional
                                        .arcanaBalance.minor
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {analysis.enhancedTarot.multiDimensional
                            .numberPatterns.length > 0 && (
                            <div className='mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4'>
                              <h5 className='text-xs font-medium text-emerald-300/90 mb-2'>
                                Number Patterns
                              </h5>
                              <div className='space-y-2'>
                                {analysis.enhancedTarot.multiDimensional.numberPatterns.map(
                                  (pattern) => (
                                    <div
                                      key={pattern.number}
                                      className='text-xs'
                                    >
                                      <div className='flex items-center justify-between mb-1'>
                                        <span className='text-zinc-300 font-medium'>
                                          {pattern.number}
                                        </span>
                                        <span className='text-zinc-400'>
                                          {pattern.count}x
                                        </span>
                                      </div>
                                      <p className='text-zinc-400'>
                                        {pattern.meaning}
                                      </p>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                          {analysis.enhancedTarot.multiDimensional
                            .elementPatterns.length > 0 && (
                            <div className='mt-4 rounded-lg border border-orange-500/20 bg-orange-500/10 p-4'>
                              <h5 className='text-xs font-medium text-orange-300/90 mb-2'>
                                Element Patterns
                              </h5>
                              <div className='space-y-2'>
                                {analysis.enhancedTarot.multiDimensional.elementPatterns.map(
                                  (pattern) => (
                                    <div
                                      key={pattern.element}
                                      className='flex items-center justify-between text-xs'
                                    >
                                      <div className='flex flex-col'>
                                        <span className='text-zinc-300 font-medium'>
                                          {pattern.element}
                                        </span>
                                        {pattern.suits.length > 0 && (
                                          <span className='text-zinc-500 text-[10px]'>
                                            {pattern.suits.join(', ')}
                                          </span>
                                        )}
                                      </div>
                                      <span className='text-zinc-400'>
                                        {pattern.count} ({pattern.percentage}%)
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                          {analysis.enhancedTarot.multiDimensional.colorPatterns
                            .length > 0 && (
                            <div className='mt-4 rounded-lg border border-pink-500/20 bg-pink-500/10 p-4'>
                              <h5 className='text-xs font-medium text-pink-300/90 mb-2'>
                                Color Patterns
                              </h5>
                              <div className='space-y-2'>
                                {analysis.enhancedTarot.multiDimensional.colorPatterns.map(
                                  (pattern) => (
                                    <div
                                      key={pattern.color}
                                      className='flex items-center justify-between text-xs'
                                    >
                                      <span className='text-zinc-300'>
                                        {pattern.color}
                                      </span>
                                      <span className='text-zinc-400'>
                                        {pattern.count} ({pattern.percentage}%)
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                          {analysis.enhancedTarot.multiDimensional.correlations
                            .length > 0 && (
                            <div className='mt-4 rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-4'>
                              <h5 className='text-xs font-medium text-cyan-300/90 mb-2'>
                                Dimension Correlations
                              </h5>
                              <div className='space-y-2'>
                                {analysis.enhancedTarot.multiDimensional.correlations.map(
                                  (correlation, idx) => (
                                    <div key={idx} className='text-xs'>
                                      <div className='flex items-center gap-2 mb-1'>
                                        <span className='text-cyan-300 font-medium'>
                                          {correlation.dimension1}
                                        </span>
                                        <span className='text-zinc-500'>×</span>
                                        <span className='text-cyan-300 font-medium'>
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
                    )}

                  {activeTab === 'timeline' && analysis.extendedTimeline && (
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between mb-3'>
                        <h4 className='text-sm font-medium text-zinc-300'>
                          Timeline Analysis
                        </h4>
                        <div className='flex gap-1.5'>
                          <button
                            onClick={() => setTimelinePeriod('6-month')}
                            className={cn(
                              'px-2 py-1 text-xs rounded-full transition-colors',
                              timelinePeriod === '6-month'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800/70',
                            )}
                          >
                            6 Months
                          </button>
                          <button
                            onClick={() => setTimelinePeriod('12-month')}
                            className={cn(
                              'px-2 py-1 text-xs rounded-full transition-colors',
                              timelinePeriod === '12-month'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800/70',
                            )}
                          >
                            12 Months
                          </button>
                        </div>
                      </div>
                      {timelinePeriod === '6-month' &&
                        analysis.extendedTimeline.months6 && (
                          <TimelineVisualization
                            data={analysis.extendedTimeline.months6}
                            period={6}
                          />
                        )}
                      {timelinePeriod === '12-month' &&
                        analysis.extendedTimeline.months12 && (
                          <TimelineVisualization
                            data={analysis.extendedTimeline.months12}
                            period={12}
                          />
                        )}
                    </div>
                  )}
                </div>
              )}
            </>
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
    return 'bg-purple-500/30 border-purple-500/50';
  }
  if (cardName.includes('Wands')) return 'bg-red-500/30 border-red-500/50';
  if (cardName.includes('Cups')) return 'bg-blue-500/30 border-blue-500/50';
  if (cardName.includes('Swords'))
    return 'bg-yellow-500/30 border-yellow-500/50';
  if (cardName.includes('Pentacles'))
    return 'bg-green-500/30 border-green-500/50';
  return 'bg-zinc-500/30 border-zinc-500/50';
}

function TimelineVisualization({
  data,
  period,
}: {
  data: {
    dominantThemes: string[];
    frequentCards: Array<{ name: string; count: number }>;
    trendAnalysis: string[];
    timelineData?: Array<{
      date: string;
      cards: Array<{ name: string; suit: string }>;
    }>;
  };
  period: number;
}) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const startDate = dayjs().subtract(period, 'month');
  const endDate = dayjs();
  const totalDays = endDate.diff(startDate, 'day');

  const months = Array.from({ length: period }, (_, i) => {
    const date = dayjs().subtract(period - 1 - i, 'month');
    return {
      label: date.format('MMM'),
      date: date.format('YYYY-MM'),
      startDay: date.startOf('month').diff(startDate, 'day'),
      daysInMonth: date.daysInMonth(),
    };
  });

  // Build card markers from timeline data - show ALL cards, not just top ones
  const cardMarkers: Array<{
    date: string;
    position: number;
    cards: Array<{ name: string; suit: string }>;
  }> = [];

  if (data.timelineData) {
    data.timelineData.forEach((entry) => {
      const entryDate = dayjs(entry.date);
      const position = (entryDate.diff(startDate, 'day') / totalDays) * 100;
      cardMarkers.push({
        date: entry.date,
        position: Math.max(0, Math.min(100, position)),
        cards: entry.cards,
      });
    });
  }

  // Group cards by suit for trend visualization
  const suitTrends: {
    [suit: string]: Array<{ date: string; position: number }>;
  } = {};
  cardMarkers.forEach((marker) => {
    marker.cards.forEach((card) => {
      if (!suitTrends[card.suit]) {
        suitTrends[card.suit] = [];
      }
      suitTrends[card.suit].push({
        date: marker.date,
        position: marker.position,
      });
    });
  });

  return (
    <div className='space-y-4'>
      <div className='rounded-lg border border-purple-500/20 bg-purple-500/10 p-4'>
        <div className='mb-4'>
          <h5 className='text-xs font-medium text-purple-300/90 mb-3'>
            Timeline Visualization ({period} Months)
          </h5>
          <div className='relative h-12 bg-zinc-900/50 rounded overflow-hidden'>
            {/* Month labels */}
            <div className='absolute inset-0 flex'>
              {months.map((month, idx) => (
                <div
                  key={month.date}
                  className='flex-1 border-r border-zinc-800/50 last:border-r-0 relative'
                  style={{
                    background: `linear-gradient(135deg, ${
                      idx % 2 === 0
                        ? 'rgba(139, 92, 246, 0.05)'
                        : 'rgba(99, 102, 241, 0.05)'
                    } 0%, transparent 100%)`,
                  }}
                >
                  <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500/20' />
                  <div className='absolute top-1 left-1/2 -translate-x-1/2'>
                    <span className='text-[8px] text-zinc-500 font-medium'>
                      {month.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Card markers on timeline - show all cards as dots */}
            {cardMarkers.map((marker, idx) => {
              return (
                <div
                  key={`${marker.date}-${idx}`}
                  className='absolute top-0 bottom-0'
                  style={{ left: `${marker.position}%` }}
                  onMouseEnter={() => setHoveredDate(marker.date)}
                  onMouseLeave={() => setHoveredDate(null)}
                >
                  <div className='relative h-full flex items-center justify-center'>
                    {/* Show dots for each card, stacked vertically if multiple */}
                    <div className='flex flex-col gap-0.5 items-center'>
                      {marker.cards.map((card, cardIdx) => {
                        const suitColor = getCardSuitColor(card.name);
                        return (
                          <div
                            key={`${marker.date}-${card.name}-${cardIdx}`}
                            className={cn(
                              'w-1.5 h-1.5 rounded-full border border-white/30 transition-all',
                              suitColor,
                              hoveredDate === marker.date
                                ? 'opacity-100 scale-150'
                                : 'opacity-80',
                            )}
                            title={`${card.name} - ${dayjs(marker.date).format('MMM D')}`}
                          />
                        );
                      })}
                    </div>
                    {hoveredDate === marker.date && (
                      <div className='absolute left-1/2 -translate-x-1/2 -top-12 z-10 px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300 min-w-[120px]'>
                        <div className='font-medium mb-1 text-zinc-200'>
                          {dayjs(marker.date).format('MMM D, YYYY')}
                        </div>
                        <div className='space-y-0.5 max-h-32 overflow-y-auto'>
                          {marker.cards.map((card) => (
                            <div
                              key={card.name}
                              className='text-[10px] flex items-center gap-1'
                            >
                              <div
                                className={cn(
                                  'w-1.5 h-1.5 rounded-full',
                                  getCardSuitColor(card.name),
                                )}
                              />
                              {card.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Trend lines for suits */}
            {Object.entries(suitTrends).map(([suit, points]) => {
              if (points.length < 2) return null;
              const suitColor = getCardSuitColor(`${suit} of Test`);
              const sortedPoints = points.sort(
                (a, b) => a.position - b.position,
              );
              const pathData = sortedPoints
                .map((point, idx) => {
                  const x = point.position;
                  const y = 50 + (idx % 3) * 5 - 5; // Slight vertical offset for visual separation
                  return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                })
                .join(' ');

              let strokeColor = 'rgba(139, 92, 246, 0.3)';
              if (suitColor.includes('red')) {
                strokeColor = 'rgba(239, 68, 68, 0.3)';
              } else if (suitColor.includes('blue')) {
                strokeColor = 'rgba(59, 130, 246, 0.3)';
              } else if (suitColor.includes('yellow')) {
                strokeColor = 'rgba(234, 179, 8, 0.3)';
              } else if (suitColor.includes('green')) {
                strokeColor = 'rgba(34, 197, 94, 0.3)';
              }

              return (
                <svg
                  key={suit}
                  className='absolute inset-0 pointer-events-none'
                  style={{ zIndex: 0 }}
                >
                  <path
                    d={pathData}
                    fill='none'
                    stroke={strokeColor}
                    strokeWidth='1'
                    strokeDasharray='2 2'
                  />
                </svg>
              );
            })}
          </div>
        </div>

        <div className='mt-3 flex items-center gap-4 text-xs text-zinc-400'>
          <div className='flex items-center gap-1'>
            <div className='w-1.5 h-1.5 rounded-full bg-red-500/30 border border-red-500/50' />
            <span>Fire</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-1.5 h-1.5 rounded-full bg-blue-500/30 border border-blue-500/50' />
            <span>Water</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-1.5 h-1.5 rounded-full bg-yellow-500/30 border border-yellow-500/50' />
            <span>Air</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-1.5 h-1.5 rounded-full bg-green-500/30 border border-green-500/50' />
            <span>Earth</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-1.5 h-1.5 rounded-full bg-purple-500/30 border border-purple-500/50' />
            <span>Major</span>
          </div>
        </div>
      </div>

      {data.dominantThemes.length > 0 && (
        <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
          <h5 className='text-xs font-medium text-zinc-300 mb-2'>
            Dominant Themes
          </h5>
          <div className='flex flex-wrap gap-1.5'>
            {data.dominantThemes.map((theme) => (
              <span
                key={theme}
                className='px-2 py-0.5 text-xs rounded bg-purple-500/20 text-purple-200'
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}
      {data.frequentCards.length > 0 && (
        <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
          <h5 className='text-xs font-medium text-zinc-300 mb-2'>
            Most Frequent Cards
          </h5>
          <div className='space-y-1'>
            {data.frequentCards.slice(0, 5).map((card) => (
              <div key={card.name} className='text-xs text-zinc-300'>
                {card.name} ({card.count}x)
              </div>
            ))}
          </div>
        </div>
      )}
      {data.trendAnalysis.length > 0 && (
        <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
          <h5 className='text-xs font-medium text-zinc-300 mb-2'>
            Trend Analysis
          </h5>
          <div className='space-y-2'>
            {data.trendAnalysis.map((insight, idx) => (
              <p key={idx} className='text-xs text-zinc-300'>
                {insight}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
