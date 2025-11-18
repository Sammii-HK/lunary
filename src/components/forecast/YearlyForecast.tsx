'use client';

import { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Paywall } from '@/components/Paywall';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import { Calendar, Loader2, Download } from 'lucide-react';

interface YearlyForecast {
  year: number;
  majorTransits: Array<{
    date: string;
    event: string;
    description: string;
    significance: string;
  }>;
  eclipses: Array<{
    date: string;
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
    aspect: string;
    planets: string[];
    description: string;
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
              Export
            </button>
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
              <div className='rounded-lg border border-purple-500/20 bg-purple-500/10 p-4'>
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
                  <Calendar className='h-5 w-5' />
                  Eclipses
                </span>
              }
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
                          {formatDate(eclipse.date)}
                        </span>
                        <span className='rounded-full bg-purple-500/20 px-2 py-1 text-xs text-purple-300'>
                          {eclipse.type === 'solar' ? 'Solar' : 'Lunar'} Eclipse
                        </span>
                      </div>
                      <div className='mb-2 flex flex-wrap gap-2 text-xs text-purple-200/70'>
                        <span className='rounded-full border border-purple-500/30 px-2 py-0.5'>
                          {eclipse.sign || 'Unknown'} focus
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

            <CollapsibleSection title='Retrograde Periods'>
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

            <CollapsibleSection title='Major Transits'>
              {forecast.majorTransits.length > 0 ? (
                <div className='space-y-3'>
                  {forecast.majorTransits.map((transit, index) => (
                    <div
                      key={index}
                      className='rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-4'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-sm font-medium text-zinc-100'>
                          {transit.event}
                        </span>
                        <span className='text-xs text-zinc-400'>
                          {formatDate(transit.date, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className='text-sm text-zinc-400'>
                        {transit.description}
                      </p>
                      {transit.significance && (
                        <p className='text-xs text-zinc-500 mt-2'>
                          {transit.significance}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyCard message='No major planetary transits registered for this forecast.' />
              )}
            </CollapsibleSection>

            <CollapsibleSection title='Significant Aspects'>
              {forecast.keyAspects.length > 0 ? (
                <div className='space-y-3'>
                  {forecast.keyAspects.map((aspect, index) => (
                    <div
                      key={`${aspect.aspect}-${index}`}
                      className='rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-4'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-sm font-medium text-zinc-100'>
                          {aspect.aspect}
                        </span>
                        <span className='text-xs text-zinc-400'>
                          {formatDate(aspect.date, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className='text-xs uppercase tracking-wide text-zinc-500 mb-2'>
                        {aspect.planets.filter(Boolean).join(' • ')}
                      </p>
                      <p className='text-sm text-zinc-400'>
                        {aspect.description || 'Energetic emphasis peaks here.'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyCard message='No high-priority aspects were detected for this year.' />
              )}
            </CollapsibleSection>
          </div>
        )}
      </div>
    </Paywall>
  );
}
