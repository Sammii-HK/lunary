'use client';

import { useState, useEffect } from 'react';
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

type AdvancedPatternAnalysis = {
  yearOverYear: {
    thisYear: {
      dominantThemes: string[];
      frequentCards: Array<{ name: string; count: number }>;
      patternInsights: string[];
    };
    lastYear: {
      dominantThemes: string[];
      frequentCards: Array<{ name: string; count: number }>;
      patternInsights: string[];
    };
    comparison: {
      themes: Array<{
        theme: string;
        change: 'increased' | 'decreased' | 'new' | 'removed';
      }>;
      insights: string[];
    };
  };
  enhancedTarot: {
    multiDimensional: {
      suitPatterns: Array<{ suit: string; count: number; percentage: number }>;
      arcanaBalance: { major: number; minor: number };
      numberPatterns: Array<{ number: string; count: number; meaning: string }>;
    };
    timeline: {
      days30: {
        dominantThemes: string[];
        frequentCards: Array<{ name: string; count: number }>;
      };
      days90?: {
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
    };
    months12?: {
      dominantThemes: string[];
      frequentCards: Array<{ name: string; count: number }>;
      trendAnalysis: string[];
    };
  };
};

type ViewMode = 'daily' | 'advanced';
type AdvancedTab =
  | 'year-over-year'
  | 'multi-dimensional'
  | 'extended-timeline'
  | '6-month'
  | '12-month';

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
  const hasAdvancedAccess = subscription.hasAccess('advanced_patterns');
  const hasTarotPatternsAccess = subscription.hasAccess('tarot_patterns');
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [activeTab, setActiveTab] = useState<AdvancedTab>('year-over-year');
  const [analysis, setAnalysis] = useState<AdvancedPatternAnalysis | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAnnual = subscription.plan === 'yearly';

  useEffect(() => {
    if (viewMode === 'advanced' && hasAdvancedAccess && !analysis && !loading) {
      fetchAdvancedPatterns();
    }
  }, [viewMode, hasAdvancedAccess]);

  const fetchAdvancedPatterns = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/patterns/advanced');
      if (!response.ok) {
        if (response.status === 403) {
          setError('Upgrade to Lunary+ AI to access advanced pattern analysis');
        } else {
          setError('Failed to load advanced patterns');
        }
        return;
      }
      const data = await response.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
      }
    } catch (err) {
      setError('Unable to load advanced patterns');
    } finally {
      setLoading(false);
    }
  };

  const availableTabs: AdvancedTab[] = isAnnual
    ? [
        'year-over-year',
        'multi-dimensional',
        'extended-timeline',
        '6-month',
        '12-month',
      ]
    : ['year-over-year', 'multi-dimensional'];

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
          {!hasAdvancedAccess && (
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
                  if (!hasAdvancedAccess) return;
                  setActiveTab(tab);
                }}
                disabled={!hasAdvancedAccess}
                className={cn(
                  'px-2 py-1 text-xs rounded-full transition-colors',
                  !hasAdvancedAccess
                    ? 'bg-zinc-800/30 text-zinc-600 border border-zinc-700/30 cursor-not-allowed opacity-50'
                    : activeTab === tab
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800/70',
                )}
                title={!hasAdvancedAccess ? 'Upgrade to unlock' : undefined}
              >
                {tab === 'year-over-year' && 'Year-over-Year'}
                {tab === 'multi-dimensional' && 'Multi-Dimensional'}
                {tab === 'extended-timeline' && 'Extended Timeline'}
                {tab === '6-month' && '6-Month'}
                {tab === '12-month' && '12-Month'}
              </button>
            ))}
          </div>

          {!hasAdvancedAccess && (
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

          {hasAdvancedAccess && (
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
                              <div className='space-y-1'>
                                {analysis.yearOverYear.thisYear.frequentCards
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
                            )}
                          </div>
                          <div className='rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-4'>
                            <h5 className='text-xs font-medium text-indigo-300/90 mb-2'>
                              Last Year
                            </h5>
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
                              .length > 0 && (
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
                            )}
                          </div>
                        </div>
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
                        </div>
                      </div>
                    )}

                  {activeTab === 'extended-timeline' &&
                    analysis.enhancedTarot.timeline && (
                      <div className='space-y-4'>
                        <h4 className='text-sm font-medium text-zinc-300 mb-3'>
                          Extended Timeline
                        </h4>
                        {analysis.enhancedTarot.timeline.days90 && (
                          <div className='rounded-lg border border-purple-500/20 bg-purple-500/10 p-4'>
                            <h5 className='text-xs font-medium text-purple-300/90 mb-2'>
                              90-Day Patterns
                            </h5>
                            {analysis.enhancedTarot.timeline.days90
                              .dominantThemes.length > 0 && (
                              <div className='flex flex-wrap gap-1.5 mb-3'>
                                {analysis.enhancedTarot.timeline.days90.dominantThemes.map(
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
                            {analysis.enhancedTarot.timeline.days90
                              .frequentCards.length > 0 && (
                              <div className='space-y-1'>
                                {analysis.enhancedTarot.timeline.days90.frequentCards
                                  .slice(0, 5)
                                  .map((card) => (
                                    <div
                                      key={card.name}
                                      className='text-xs text-zinc-300'
                                    >
                                      {card.name} ({card.count}x)
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        )}
                        {analysis.enhancedTarot.timeline.days365 && (
                          <div className='rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-4'>
                            <h5 className='text-xs font-medium text-indigo-300/90 mb-2'>
                              365-Day Patterns
                            </h5>
                            {analysis.enhancedTarot.timeline.days365
                              .dominantThemes.length > 0 && (
                              <div className='flex flex-wrap gap-1.5 mb-3'>
                                {analysis.enhancedTarot.timeline.days365.dominantThemes.map(
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
                            {analysis.enhancedTarot.timeline.days365
                              .frequentCards.length > 0 && (
                              <div className='space-y-1'>
                                {analysis.enhancedTarot.timeline.days365.frequentCards
                                  .slice(0, 5)
                                  .map((card) => (
                                    <div
                                      key={card.name}
                                      className='text-xs text-zinc-300'
                                    >
                                      {card.name} ({card.count}x)
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                  {activeTab === '6-month' &&
                    analysis.extendedTimeline?.months6 && (
                      <div className='space-y-4'>
                        <h4 className='text-sm font-medium text-zinc-300 mb-3'>
                          6-Month Trends
                        </h4>
                        <div className='rounded-lg border border-purple-500/20 bg-purple-500/10 p-4'>
                          {analysis.extendedTimeline.months6.dominantThemes
                            .length > 0 && (
                            <div className='flex flex-wrap gap-1.5 mb-3'>
                              {analysis.extendedTimeline.months6.dominantThemes.map(
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
                          {analysis.extendedTimeline.months6.trendAnalysis
                            .length > 0 && (
                            <div className='space-y-2'>
                              {analysis.extendedTimeline.months6.trendAnalysis.map(
                                (insight, idx) => (
                                  <p
                                    key={idx}
                                    className='text-xs text-zinc-300'
                                  >
                                    {insight}
                                  </p>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {activeTab === '12-month' &&
                    analysis.extendedTimeline?.months12 && (
                      <div className='space-y-4'>
                        <h4 className='text-sm font-medium text-zinc-300 mb-3'>
                          12-Month Trends
                        </h4>
                        <div className='rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-4'>
                          {analysis.extendedTimeline.months12.dominantThemes
                            .length > 0 && (
                            <div className='flex flex-wrap gap-1.5 mb-3'>
                              {analysis.extendedTimeline.months12.dominantThemes.map(
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
                          {analysis.extendedTimeline.months12.trendAnalysis
                            .length > 0 && (
                            <div className='space-y-2'>
                              {analysis.extendedTimeline.months12.trendAnalysis.map(
                                (insight, idx) => (
                                  <p
                                    key={idx}
                                    className='text-xs text-zinc-300'
                                  >
                                    {insight}
                                  </p>
                                ),
                              )}
                            </div>
                          )}
                        </div>
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
