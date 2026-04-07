'use client';

import { useEffect, useState, lazy, Suspense } from 'react';
import { Calendar, TrendingUp, Sparkles, BarChart3 } from 'lucide-react';
import { useAuthStatus } from './AuthStatus';
import { SharePersonalized } from './SharePersonalized';
import type { UsagePattern as ChartUsagePattern } from './charts/UsageChart';

const UsageChart = lazy(() => import('./charts/UsageChart'));

interface TrendComparison {
  thisMonth: number;
  lastMonth: number;
  change: number;
  changePercent: number;
}

interface MonthlyInsight {
  month: number;
  year: number;
  frequentCards: Array<{ name: string; count: number }>;
  moodTrend: string | null;
  themes: string[];
  journalThemes?: string[];
  journalCount?: number;
  transitImpacts?: Array<{ aspect: string; count: number }>;
  summary?: string;
  usagePatterns?: ChartUsagePattern[];
  trends?: {
    tarot: TrendComparison;
    journal: TrendComparison;
    ai: TrendComparison;
    rituals: TrendComparison;
  };
  mostActiveDay?: string | null;
}

export function MonthlyInsights() {
  const authState = useAuthStatus();
  const [insight, setInsight] = useState<MonthlyInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authState.isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const fetchMonthlyInsight = async () => {
      try {
        const response = await fetch('/api/insights/monthly', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setInsight(data.insight);
        }
      } catch (error) {
        console.error('[MonthlyInsights] Failed to fetch:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonthlyInsight();
  }, [authState.isAuthenticated]);

  if (!authState.isAuthenticated || isLoading || !insight) {
    return null;
  }

  const monthName = new Date(
    insight.year,
    insight.month - 1,
  ).toLocaleDateString('en-US', { month: 'long' });

  return (
    <div className='rounded-2xl border border-stroke-subtle/60 bg-surface-base/60 p-4 md:p-6'>
      <div className='flex items-center gap-3 mb-4'>
        <Calendar className='w-5 h-5 text-lunary-accent' />
        <h2 className='text-lg font-semibold text-content-primary'>
          {monthName} Insights
        </h2>
      </div>

      <div className='space-y-4'>
        {insight.summary && (
          <div className='rounded-lg border border-lunary-primary-700 bg-layer-deep/20 p-3'>
            <h3 className='text-sm font-semibold text-content-brand-accent mb-1'>
              Your Cosmic Month in Review
            </h3>
            <p className='text-xs text-content-secondary leading-relaxed'>
              {insight.summary}
            </p>
          </div>
        )}

        {insight.frequentCards.length > 0 ? (
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <TrendingUp className='w-4 h-4 text-lunary-accent' />
              <h3 className='text-sm font-medium text-content-secondary'>
                Frequent Cards
              </h3>
            </div>
            <div className='space-y-2'>
              {insight.frequentCards.slice(0, 3).map((card, idx) => {
                const maxCount = insight.frequentCards[0]?.count || 1;
                const percentage = (card.count / maxCount) * 100;
                return (
                  <div key={idx} className='space-y-1'>
                    <div className='flex items-center justify-between text-xs'>
                      <span className='text-content-secondary font-medium'>
                        {card.name}
                      </span>
                      <span className='text-content-muted'>{card.count}x</span>
                    </div>
                    <div className='h-2 bg-surface-card/60 rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-gradient-to-r from-lunary-primary to-lunary-primary-400/40 rounded-full transition-all'
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <TrendingUp className='w-4 h-4 text-lunary-accent' />
              <h3 className='text-sm font-medium text-content-secondary'>
                Frequent Cards
              </h3>
            </div>
            <p className='text-xs text-content-muted'>
              No frequent cards yet this month. Start pulling cards to see your
              patterns!
            </p>
          </div>
        )}

        {insight.transitImpacts && insight.transitImpacts.length > 0 && (
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <Sparkles className='w-4 h-4 text-lunary-accent' />
              <h3 className='text-sm font-medium text-content-secondary'>
                Transit Impacts
              </h3>
            </div>
            <div className='flex flex-wrap gap-2'>
              {insight.transitImpacts.map((transit, idx) => (
                <span
                  key={idx}
                  className='text-xs px-2 py-1 rounded-lg border border-stroke-default/60 bg-surface-elevated/40 text-content-secondary'
                >
                  {transit.aspect} ({transit.count}x)
                </span>
              ))}
            </div>
          </div>
        )}

        {insight.journalCount !== undefined && insight.journalCount > 0 && (
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <Sparkles className='w-4 h-4 text-lunary-accent' />
              <h3 className='text-sm font-medium text-content-secondary'>
                Journal Entries
              </h3>
            </div>
            <p className='text-xs text-content-muted'>
              {insight.journalCount} entry
              {insight.journalCount !== 1 ? 'ies' : 'y'} this month
              {insight.journalThemes && insight.journalThemes.length > 0 && (
                <> • Themes: {insight.journalThemes.slice(0, 3).join(', ')}</>
              )}
            </p>
          </div>
        )}

        {insight.themes.length > 0 && (
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <Sparkles className='w-4 h-4 text-lunary-accent' />
              <h3 className='text-sm font-medium text-content-secondary'>
                Tarot Themes
              </h3>
            </div>
            <p className='text-xs text-content-muted'>
              {insight.themes.join(', ')}
            </p>
          </div>
        )}

        {insight.moodTrend && (
          <div>
            <p className='text-xs text-content-muted'>
              <span className='text-content-secondary font-medium'>
                Mood trend:
              </span>{' '}
              {insight.moodTrend}
            </p>
          </div>
        )}

        {insight.trends && (
          <div>
            <div className='flex items-center gap-2 mb-3'>
              <BarChart3 className='w-4 h-4 text-lunary-accent' />
              <h3 className='text-sm font-medium text-content-secondary'>
                This Month vs Last Month
              </h3>
            </div>
            <div className='space-y-2'>
              {insight.trends.tarot.thisMonth > 0 ||
              insight.trends.tarot.lastMonth > 0 ? (
                <div className='text-xs'>
                  <div className='flex items-center justify-between mb-1'>
                    <span className='text-content-secondary'>
                      Tarot Readings
                    </span>
                    <span className='text-content-muted'>
                      {insight.trends.tarot.thisMonth} vs{' '}
                      {insight.trends.tarot.lastMonth}
                      {insight.trends.tarot.changePercent !== 0 && (
                        <span
                          className={
                            insight.trends.tarot.changePercent > 0
                              ? 'text-lunary-success ml-1'
                              : 'text-red-400 ml-1'
                          }
                        >
                          ({insight.trends.tarot.changePercent > 0 ? '+' : ''}
                          {insight.trends.tarot.changePercent}%)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              ) : null}
              {insight.trends.journal.thisMonth > 0 ||
              insight.trends.journal.lastMonth > 0 ? (
                <div className='text-xs'>
                  <div className='flex items-center justify-between mb-1'>
                    <span className='text-content-secondary'>
                      Journal Entries
                    </span>
                    <span className='text-content-muted'>
                      {insight.trends.journal.thisMonth} vs{' '}
                      {insight.trends.journal.lastMonth}
                      {insight.trends.journal.changePercent !== 0 && (
                        <span
                          className={
                            insight.trends.journal.changePercent > 0
                              ? 'text-lunary-success ml-1'
                              : 'text-red-400 ml-1'
                          }
                        >
                          ({insight.trends.journal.changePercent > 0 ? '+' : ''}
                          {insight.trends.journal.changePercent}%)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              ) : null}
              {insight.trends.rituals.thisMonth > 0 ||
              insight.trends.rituals.lastMonth > 0 ? (
                <div className='text-xs'>
                  <div className='flex items-center justify-between mb-1'>
                    <span className='text-content-secondary'>Rituals</span>
                    <span className='text-content-muted'>
                      {insight.trends.rituals.thisMonth} vs{' '}
                      {insight.trends.rituals.lastMonth}
                      {insight.trends.rituals.changePercent !== 0 && (
                        <span
                          className={
                            insight.trends.rituals.changePercent > 0
                              ? 'text-lunary-success ml-1'
                              : 'text-red-400 ml-1'
                          }
                        >
                          ({insight.trends.rituals.changePercent > 0 ? '+' : ''}
                          {insight.trends.rituals.changePercent}%)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {insight.usagePatterns && insight.usagePatterns.length > 0 && (
          <div>
            <div className='flex items-center gap-2 mb-3'>
              <BarChart3 className='w-4 h-4 text-lunary-accent' />
              <h3 className='text-sm font-medium text-content-secondary'>
                Daily Activity
              </h3>
            </div>
            <Suspense
              fallback={
                <div className='h-48 flex items-center justify-center'>
                  <div className='animate-pulse text-content-muted text-sm'>
                    Loading chart...
                  </div>
                </div>
              }
            >
              <UsageChart data={insight.usagePatterns} />
            </Suspense>
          </div>
        )}

        {insight.mostActiveDay && (
          <div className='text-xs text-content-muted'>
            <span className='text-content-secondary font-medium'>
              Most active day:
            </span>{' '}
            {insight.mostActiveDay}
          </div>
        )}

        {insight.frequentCards.length > 0 && (
          <div className='pt-3 border-t border-stroke-subtle/60'>
            <SharePersonalized
              type='monthly-insights'
              data={{
                month: monthName,
                frequentCards: insight.frequentCards,
                journalCount: insight.journalCount,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
