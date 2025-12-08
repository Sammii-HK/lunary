'use client';

import { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Paywall } from '@/components/Paywall';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import {
  Calendar,
  Loader2,
  Download,
  CalendarDays,
  RotateCcw,
  CalendarRange,
  Eclipse,
} from 'lucide-react';

const getAspectColor = (aspect: string): string => {
  const aspectLower = aspect.toLowerCase();
  if (aspectLower.includes('conjunction')) {
    return 'text-lunary-secondary-300';
  } else if (aspectLower.includes('trine')) {
    return 'text-lunary-success-300';
  } else if (aspectLower.includes('opposition')) {
    return 'text-red-300';
  } else if (aspectLower.includes('square')) {
    return 'text-lunary-rose-300';
  } else if (aspectLower.includes('sextile')) {
    return 'text-lunary-primary-300';
  }
  return 'text-zinc-100';
};

interface YearlyForecast {
  year: number;
  majorTransits: Array<{
    date: string;
    startDate: string;
    endDate: string;
    event: string;
    description: string;
    significance: string;
  }>;
  eclipses: Array<{
    date: string;
    startDate: string;
    endDate: string;
    type: 'solar' | 'lunar';
    sign: string;
    description: string;
  }>;
  retrogrades: Array<{
    planet: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  keyAspects: Array<{
    date: string;
    startDate: string;
    endDate: string;
    aspect: string;
    planets: string[];
    description: string;
  }>;
  monthlyForecast?: Array<{
    month: number;
    monthName: string;
    majorTransits: Array<{
      date: string;
      startDate: string;
      endDate: string;
      event: string;
      description: string;
      significance: string;
    }>;
    eclipses: Array<{
      date: string;
      startDate: string;
      endDate: string;
      type: 'solar' | 'lunar';
      sign: string;
      description: string;
    }>;
    keyAspects: Array<{
      date: string;
      startDate: string;
      endDate: string;
      aspect: string;
      planets: string[];
      description: string;
    }>;
  }>;
  summary: string;
}

export function YearlyForecast() {
  const subscription = useSubscription();
  const [forecast, setForecast] = useState<YearlyForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasAccess = subscription.hasAccess('yearly_forecast');

  useEffect(() => {
    if (hasAccess && !forecast && !loading && !subscription.loading) {
      fetchForecast();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAccess, subscription.loading, subscription.plan, subscription.status]);

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/forecast/yearly', {
        cache: 'no-store',
      });
      if (!response.ok) {
        if (response.status === 403) {
          setError('Upgrade to Lunary+ AI Annual to access yearly forecast');
        } else {
          setError('Failed to load yearly forecast');
        }
        return;
      }
      const data = await response.json();
      if (data.success && data.forecast) {
        setForecast(data.forecast);
      }
    } catch (err) {
      setError('Unable to load yearly forecast');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (
    dateStr: string,
    options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' },
  ) => {
    const parsed = new Date(dateStr);
    if (Number.isNaN(parsed.getTime())) {
      return dateStr;
    }
    return parsed.toLocaleDateString('en-US', options);
  };

  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = formatDate(startDate, { month: 'short', day: 'numeric' });
    if (!endDate || endDate.trim() === '') {
      return `${start} onward`;
    }
    if (startDate === endDate) {
      return start;
    }
    const end = formatDate(endDate, { month: 'short', day: 'numeric' });
    return `${start} – ${end}`;
  };

  const EmptyCard = ({ message }: { message: string }) => (
    <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-4'>
      <p className='text-sm text-zinc-500'>{message}</p>
    </div>
  );

  const metrics =
    forecast && !loading
      ? [
          {
            label: 'Major Transits',
            value: forecast.majorTransits.length,
            description: 'High-impact alignments to track',
          },
          {
            label: 'Retrogrades',
            value: forecast.retrogrades.length,
            description: 'Review periods and course corrections',
          },
          {
            label: 'Eclipses',
            value: forecast.eclipses.length,
            description: 'Cosmic resets and revelations',
          },
          {
            label: 'Key Aspects',
            value: forecast.keyAspects.length,
            description: 'Exact aspects shaping the year',
          },
        ]
      : [];

  return (
    <Paywall feature='yearly_forecast'>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-semibold text-white'>
            {forecast
              ? `${forecast.year} Cosmic Forecast`
              : 'Yearly Cosmic Forecast'}
          </h2>
          {forecast && (
            <div className='flex items-center gap-2'>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(
                      `/api/forecast/yearly/calendar?year=${forecast.year}`,
                    );
                    if (!response.ok) {
                      if (response.status === 403) {
                        setError(
                          'Calendar export requires Lunary+ AI Annual subscription',
                        );
                      } else {
                        setError('Failed to download calendar');
                      }
                      return;
                    }
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `lunary-forecast-calendar-${forecast.year}.ics`;
                    link.click();
                    URL.revokeObjectURL(url);
                  } catch (err) {
                    setError('Unable to download calendar');
                  }
                }}
                className='inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800'
              >
                <CalendarDays className='h-4 w-4' />
                Download Calendar
              </button>
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(forecast, null, 2);
                  const dataBlob = new Blob([dataStr], {
                    type: 'application/json',
                  });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `lunary-forecast-${forecast.year}.json`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
                className='inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800'
              >
                <Download className='h-4 w-4' />
                Export JSON
              </button>
            </div>
          )}
        </div>

        {loading && (
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='h-6 w-6 animate-spin text-zinc-400' />
          </div>
        )}

        {error && (
          <div className='rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200'>
            {error}
          </div>
        )}

        {forecast && !loading && (
          <div className='space-y-6'>
            {forecast.summary && (
              <div className='rounded-lg border border-lunary-primary/20 bg-lunary-primary-500/10 p-4'>
                <p className='text-sm text-zinc-300 leading-relaxed'>
                  {forecast.summary}
                </p>
              </div>
            )}

            {metrics.length > 0 && (
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className='rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-4'
                  >
                    <p className='text-2xl font-semibold text-white'>
                      {metric.value}
                    </p>
                    <p className='text-xs uppercase tracking-wide text-zinc-400'>
                      {metric.label}
                    </p>
                    <p className='text-xs text-zinc-500 leading-relaxed'>
                      {metric.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <CollapsibleSection
              title={
                <span className='flex items-center gap-2'>
                  <Eclipse className='h-5 w-5' />
                  Eclipses
                </span>
              }
              defaultCollapsed={true}
            >
              {forecast.eclipses.length > 0 ? (
                <div className='space-y-3'>
                  {forecast.eclipses.map((eclipse, index) => (
                    <div
                      key={index}
                      className='rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-4'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-sm font-medium text-zinc-100'>
                          {eclipse.sign || 'Eclipse'}
                        </span>
                        <span className='text-xs text-zinc-400'>
                          {formatDateRange(eclipse.startDate, eclipse.endDate)}
                        </span>
                      </div>
                      <p className='text-sm text-zinc-400'>
                        {eclipse.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyCard message='No eclipses are scheduled to cross your path this year.' />
              )}
            </CollapsibleSection>

            <CollapsibleSection
              title={
                <span className='flex items-center gap-2'>
                  <RotateCcw className='h-5 w-5' />
                  Retrograde Periods
                </span>
              }
              defaultCollapsed={true}
            >
              {forecast.retrogrades.length > 0 ? (
                <div className='space-y-3'>
                  {forecast.retrogrades.map((retrograde, index) => (
                    <div
                      key={index}
                      className='rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-4'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-sm font-medium text-zinc-100'>
                          {retrograde.planet} Retrograde
                        </span>
                        <span className='text-xs text-zinc-400'>
                          {formatDateRange(
                            retrograde.startDate,
                            retrograde.endDate,
                          )}
                        </span>
                      </div>
                      <p className='text-sm text-zinc-400'>
                        {retrograde.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyCard message='No notable retrograde review periods detected.' />
              )}
            </CollapsibleSection>

            {forecast.monthlyForecast &&
              forecast.monthlyForecast.length > 0 && (
                <CollapsibleSection
                  title={
                    <span className='flex items-center gap-2'>
                      <CalendarRange className='h-5 w-5' />
                      Monthly Forecast
                    </span>
                  }
                  defaultCollapsed={true}
                >
                  <div className='space-y-6'>
                    {forecast.monthlyForecast.map((monthData) => (
                      <CollapsibleSection
                        key={monthData.month}
                        title={`${monthData.monthName} ${forecast.year}`}
                        defaultCollapsed={true}
                      >
                        <div className='space-y-4'>
                          {monthData.eclipses.length > 0 && (
                            <div>
                              <h4 className='text-sm font-semibold text-zinc-200 mb-2'>
                                Eclipses
                              </h4>
                              <div className='space-y-2'>
                                {monthData.eclipses.map((eclipse, index) => (
                                  <div
                                    key={index}
                                    className='rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-3'
                                  >
                                    <div className='flex items-center justify-between mb-1'>
                                      <span className='text-xs font-medium text-zinc-100'>
                                        {eclipse.sign || 'Eclipse'}
                                      </span>
                                      <span className='text-xs text-zinc-400'>
                                        {formatDateRange(
                                          eclipse.startDate,
                                          eclipse.endDate,
                                        )}
                                      </span>
                                    </div>
                                    <p className='text-xs text-zinc-400'>
                                      {eclipse.description}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {monthData.majorTransits.length > 0 && (
                            <div>
                              <h4 className='text-sm font-semibold text-zinc-200 mb-2'>
                                Major Transits
                              </h4>
                              <div className='space-y-2'>
                                {monthData.majorTransits.map(
                                  (transit, index) => (
                                    <div
                                      key={index}
                                      className='rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-3'
                                    >
                                      <div className='flex items-center justify-between mb-1'>
                                        <span
                                          className={`text-xs font-medium ${getAspectColor(transit.event)}`}
                                        >
                                          {transit.event}
                                        </span>
                                        <span className='text-xs text-zinc-400'>
                                          {formatDateRange(
                                            transit.startDate,
                                            transit.endDate,
                                          )}
                                        </span>
                                      </div>
                                      <p className='text-xs text-zinc-400'>
                                        {transit.description}
                                      </p>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                          {monthData.keyAspects.length > 0 && (
                            <div>
                              <h4 className='text-sm font-semibold text-zinc-200 mb-2'>
                                Key Aspects
                              </h4>
                              <div className='space-y-2'>
                                {monthData.keyAspects.map((aspect, index) => (
                                  <div
                                    key={`${aspect.aspect}-${index}`}
                                    className='rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-3'
                                  >
                                    <div className='flex items-center justify-between mb-1'>
                                      <span
                                        className={`text-xs font-medium ${getAspectColor(aspect.aspect)}`}
                                      >
                                        {aspect.aspect}
                                      </span>
                                      <span className='text-xs text-zinc-400'>
                                        {formatDateRange(
                                          aspect.startDate,
                                          aspect.endDate,
                                        )}
                                      </span>
                                    </div>
                                    <p className='text-xs uppercase tracking-wide text-zinc-500 mb-1'>
                                      {aspect.planets
                                        .filter(Boolean)
                                        .join(' • ')}
                                    </p>
                                    <p className='text-xs text-zinc-400'>
                                      {aspect.description ||
                                        'Energetic emphasis peaks here.'}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {monthData.eclipses.length === 0 &&
                            monthData.majorTransits.length === 0 &&
                            monthData.keyAspects.length === 0 && (
                              <EmptyCard message='No significant events this month.' />
                            )}
                        </div>
                      </CollapsibleSection>
                    ))}
                  </div>
                </CollapsibleSection>
              )}
          </div>
        )}
      </div>
    </Paywall>
  );
}
