'use client';

import { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Paywall } from '@/components/Paywall';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import { cn } from '@/lib/utils';
import {
  Loader2,
  Download,
  CalendarDays,
  RotateCcw,
  CalendarRange,
  Eclipse,
  Orbit,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const ASPECT_STYLES: Record<string, string> = {
  conjunction:
    'text-lunary-secondary-300 bg-lunary-secondary-900/20 border-lunary-secondary-800/40',
  trine:
    'text-lunary-success-300 bg-lunary-success-900/20 border-lunary-success-800/40',
  opposition: 'text-red-300 bg-red-900/20 border-red-800/40',
  square:
    'text-lunary-rose-300 bg-lunary-rose-900/20 border-lunary-rose-800/40',
  sextile:
    'text-lunary-primary-300 bg-lunary-primary-900/20 border-lunary-primary-800/40',
};

function getAspectStyle(aspect: string): string {
  const key = Object.keys(ASPECT_STYLES).find((k) =>
    aspect.toLowerCase().includes(k),
  );
  return key
    ? ASPECT_STYLES[key]
    : 'text-zinc-100 bg-zinc-900/40 border-zinc-800/50';
}

function getAspectTextColor(aspect: string): string {
  const key = Object.keys(ASPECT_STYLES).find((k) =>
    aspect.toLowerCase().includes(k),
  );
  if (!key) return 'text-zinc-100';
  return ASPECT_STYLES[key].split(' ')[0];
}

interface YearlyForecastData {
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
  const [forecast, setForecast] = useState<YearlyForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

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
      const currentYear = new Date().getFullYear();
      const response = await fetch(`/api/forecast/yearly?year=${currentYear}`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        if (response.status === 403) {
          setError(
            'Upgrade to Lunary+ Pro Annual to access the yearly forecast',
          );
        } else {
          setError('Failed to load yearly forecast');
        }
        return;
      }
      const data = await response.json();
      if (data.success && data.forecast) {
        setForecast(data.forecast);
      }
    } catch {
      setError('Unable to load yearly forecast');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCalendar = async () => {
    if (!forecast) return;
    setDownloading(true);
    try {
      const response = await fetch(
        `/api/forecast/yearly/calendar?year=${forecast.year}`,
      );
      if (!response.ok) {
        setError(
          response.status === 403
            ? 'Calendar export requires Lunary+ Pro Annual subscription'
            : 'Failed to download calendar',
        );
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lunary-forecast-${forecast.year}.ics`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Unable to download calendar');
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const parsed = new Date(dateStr);
    if (Number.isNaN(parsed.getTime())) return dateStr;
    return parsed.toLocaleDateString('en-GB', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = formatDate(startDate);
    if (!endDate || endDate.trim() === '') return start;
    if (startDate === endDate) return start;
    return `${start} - ${formatDate(endDate)}`;
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <div className='text-center space-y-3'>
          <Loader2 className='h-6 w-6 animate-spin text-lunary-primary-400 mx-auto' />
          <p className='text-sm text-zinc-400'>Calculating cosmic events...</p>
        </div>
      </div>
    );
  }

  if (error && !forecast) {
    return (
      <div className='rounded-xl border border-red-500/20 bg-red-950/20 p-6'>
        <p className='text-sm text-red-300 mb-3'>{error}</p>
        <Button variant='outline' size='sm' onClick={fetchForecast}>
          Try again
        </Button>
      </div>
    );
  }

  if (!forecast) return null;

  const stats = [
    {
      label: 'Transits',
      value: forecast.majorTransits.length,
      icon: Orbit,
      colour: 'text-lunary-secondary-300',
    },
    {
      label: 'Retrogrades',
      value: forecast.retrogrades.length,
      icon: RotateCcw,
      colour: 'text-lunary-accent-300',
    },
    {
      label: 'Eclipses',
      value: forecast.eclipses.length,
      icon: Eclipse,
      colour: 'text-lunary-highlight-300',
    },
    {
      label: 'Key aspects',
      value: forecast.keyAspects.length,
      icon: Sparkles,
      colour: 'text-lunary-primary-300',
    },
  ];

  return (
    <Paywall feature='yearly_forecast'>
      <div className='space-y-6'>
        {/* Actions */}
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleDownloadCalendar}
            disabled={downloading}
          >
            {downloading ? (
              <Loader2 className='h-4 w-4 animate-spin mr-2' />
            ) : (
              <CalendarDays className='h-4 w-4 mr-2' />
            )}
            Add to calendar
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => {
              const blob = new Blob([JSON.stringify(forecast, null, 2)], {
                type: 'application/json',
              });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `lunary-forecast-${forecast.year}.json`;
              link.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>
        </div>

        {/* Summary */}
        {forecast.summary && (
          <div className='rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-5'>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              {forecast.summary}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
          {stats.map((stat) => (
            <div
              key={stat.label}
              className='rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4 space-y-1'
            >
              <div className='flex items-center gap-2'>
                <stat.icon className={cn('h-4 w-4', stat.colour)} />
                <span className='text-2xl font-semibold text-white'>
                  {stat.value}
                </span>
              </div>
              <p className='text-xs text-zinc-500 uppercase tracking-wide'>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Eclipses */}
        {forecast.eclipses.length > 0 && (
          <CollapsibleSection
            title={
              <span className='flex items-center gap-2'>
                <Eclipse className='h-5 w-5 text-lunary-highlight-300' />
                Eclipses
              </span>
            }
          >
            <div className='space-y-2'>
              {forecast.eclipses.map((eclipse, i) => (
                <div
                  key={i}
                  className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'
                >
                  <div className='flex items-start justify-between gap-4 mb-1'>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs font-medium uppercase tracking-wide text-lunary-highlight-300'>
                        {eclipse.type}
                      </span>
                      <span className='text-sm font-medium text-zinc-100'>
                        {eclipse.sign}
                      </span>
                    </div>
                    <span className='text-xs text-zinc-500 whitespace-nowrap'>
                      {formatDateRange(eclipse.startDate, eclipse.endDate)}
                    </span>
                  </div>
                  <p className='text-sm text-zinc-400 leading-relaxed'>
                    {eclipse.description}
                  </p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Retrogrades */}
        {forecast.retrogrades.length > 0 && (
          <CollapsibleSection
            title={
              <span className='flex items-center gap-2'>
                <RotateCcw className='h-5 w-5 text-lunary-accent-300' />
                Retrograde periods
              </span>
            }
          >
            <div className='space-y-2'>
              {forecast.retrogrades.map((retro, i) => (
                <div
                  key={i}
                  className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'
                >
                  <div className='flex items-start justify-between gap-4 mb-1'>
                    <span className='text-sm font-medium text-zinc-100'>
                      {retro.planet} Retrograde
                    </span>
                    <span className='text-xs text-zinc-500 whitespace-nowrap'>
                      {formatDateRange(retro.startDate, retro.endDate)}
                    </span>
                  </div>
                  <p className='text-sm text-zinc-400 leading-relaxed'>
                    {retro.description}
                  </p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Major Transits */}
        {forecast.majorTransits.length > 0 && (
          <CollapsibleSection
            title={
              <span className='flex items-center gap-2'>
                <Orbit className='h-5 w-5 text-lunary-secondary-300' />
                Major transits
              </span>
            }
          >
            <div className='space-y-2'>
              {forecast.majorTransits.map((transit, i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-lg border p-4',
                    getAspectStyle(transit.event),
                  )}
                >
                  <div className='flex items-start justify-between gap-4 mb-1'>
                    <span
                      className={cn(
                        'text-sm font-medium',
                        getAspectTextColor(transit.event),
                      )}
                    >
                      {transit.event}
                    </span>
                    <span className='text-xs text-zinc-500 whitespace-nowrap'>
                      {formatDateRange(transit.startDate, transit.endDate)}
                    </span>
                  </div>
                  <p className='text-sm text-zinc-400 leading-relaxed'>
                    {transit.description}
                  </p>
                  {transit.significance && (
                    <p className='text-xs text-zinc-500 mt-2 italic'>
                      {transit.significance}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Key Aspects */}
        {forecast.keyAspects.length > 0 && (
          <CollapsibleSection
            title={
              <span className='flex items-center gap-2'>
                <Sparkles className='h-5 w-5 text-lunary-primary-300' />
                Key aspects
              </span>
            }
            defaultCollapsed={true}
          >
            <div className='space-y-2'>
              {forecast.keyAspects.map((aspect, i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-lg border p-4',
                    getAspectStyle(aspect.aspect),
                  )}
                >
                  <div className='flex items-start justify-between gap-4 mb-1'>
                    <div>
                      <span
                        className={cn(
                          'text-sm font-medium',
                          getAspectTextColor(aspect.aspect),
                        )}
                      >
                        {aspect.aspect}
                      </span>
                      {aspect.planets.filter(Boolean).length > 0 && (
                        <span className='text-xs text-zinc-500 ml-2'>
                          {aspect.planets.filter(Boolean).join(' / ')}
                        </span>
                      )}
                    </div>
                    <span className='text-xs text-zinc-500 whitespace-nowrap'>
                      {formatDateRange(aspect.startDate, aspect.endDate)}
                    </span>
                  </div>
                  <p className='text-sm text-zinc-400 leading-relaxed'>
                    {aspect.description || 'Energetic emphasis peaks here.'}
                  </p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Monthly Breakdown */}
        {forecast.monthlyForecast && forecast.monthlyForecast.length > 0 && (
          <CollapsibleSection
            title={
              <span className='flex items-center gap-2'>
                <CalendarRange className='h-5 w-5 text-zinc-300' />
                Month by month
              </span>
            }
            defaultCollapsed={true}
          >
            <div className='space-y-4'>
              {forecast.monthlyForecast.map((month) => {
                const hasEvents =
                  month.eclipses.length > 0 ||
                  month.majorTransits.length > 0 ||
                  month.keyAspects.length > 0;

                return (
                  <CollapsibleSection
                    key={month.month}
                    title={month.monthName}
                    defaultCollapsed={true}
                  >
                    {!hasEvents ? (
                      <p className='text-sm text-zinc-500 px-1'>
                        No major events this month.
                      </p>
                    ) : (
                      <div className='space-y-3'>
                        {month.eclipses.map((eclipse, i) => (
                          <div
                            key={`e-${i}`}
                            className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3'
                          >
                            <div className='flex items-center justify-between mb-1'>
                              <span className='text-xs font-medium text-lunary-highlight-300'>
                                {eclipse.type === 'solar' ? 'Solar' : 'Lunar'}{' '}
                                Eclipse in {eclipse.sign}
                              </span>
                              <span className='text-xs text-zinc-500'>
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

                        {month.majorTransits.map((transit, i) => (
                          <div
                            key={`t-${i}`}
                            className={cn(
                              'rounded-lg border p-3',
                              getAspectStyle(transit.event),
                            )}
                          >
                            <div className='flex items-center justify-between mb-1'>
                              <span
                                className={cn(
                                  'text-xs font-medium',
                                  getAspectTextColor(transit.event),
                                )}
                              >
                                {transit.event}
                              </span>
                              <span className='text-xs text-zinc-500'>
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
                        ))}

                        {month.keyAspects.map((aspect, i) => (
                          <div
                            key={`a-${i}`}
                            className={cn(
                              'rounded-lg border p-3',
                              getAspectStyle(aspect.aspect),
                            )}
                          >
                            <div className='flex items-center justify-between mb-1'>
                              <span
                                className={cn(
                                  'text-xs font-medium',
                                  getAspectTextColor(aspect.aspect),
                                )}
                              >
                                {aspect.planets.filter(Boolean).join(' ')}{' '}
                                {aspect.aspect}
                              </span>
                              <span className='text-xs text-zinc-500'>
                                {formatDateRange(
                                  aspect.startDate,
                                  aspect.endDate,
                                )}
                              </span>
                            </div>
                            <p className='text-xs text-zinc-400'>
                              {aspect.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CollapsibleSection>
                );
              })}
            </div>
          </CollapsibleSection>
        )}

        {error && (
          <div className='rounded-lg border border-red-500/20 bg-red-950/20 p-4'>
            <p className='text-sm text-red-300'>{error}</p>
          </div>
        )}
      </div>
    </Paywall>
  );
}
