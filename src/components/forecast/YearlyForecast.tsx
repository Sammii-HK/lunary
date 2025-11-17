'use client';

import { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Paywall } from '@/components/Paywall';
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

  useEffect(() => {
    if (subscription.hasAccess('yearly_forecast') && !forecast && !loading) {
      fetchForecast();
    }
  }, [subscription.hasAccess('yearly_forecast')]);

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

            {forecast.eclipses.length > 0 && (
              <div>
                <h3 className='text-lg font-medium text-zinc-100 mb-3 flex items-center gap-2'>
                  <Calendar className='h-5 w-5' />
                  Eclipses
                </h3>
                <div className='space-y-3'>
                  {forecast.eclipses.map((eclipse, index) => (
                    <div
                      key={index}
                      className='rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-4'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-sm font-medium text-zinc-100'>
                          {new Date(eclipse.date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                        <span className='rounded-full bg-purple-500/20 px-2 py-1 text-xs text-purple-300'>
                          {eclipse.type === 'solar' ? 'Solar' : 'Lunar'} Eclipse
                        </span>
                      </div>
                      <p className='text-sm text-zinc-400'>
                        {eclipse.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {forecast.retrogrades.length > 0 && (
              <div>
                <h3 className='text-lg font-medium text-zinc-100 mb-3'>
                  Retrograde Periods
                </h3>
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
                          {new Date(retrograde.startDate).toLocaleDateString()}{' '}
                          - {new Date(retrograde.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className='text-sm text-zinc-400'>
                        {retrograde.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {forecast.majorTransits.length > 0 && (
              <div>
                <h3 className='text-lg font-medium text-zinc-100 mb-3'>
                  Major Transits
                </h3>
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
                          {new Date(transit.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className='text-sm text-zinc-400'>
                        {transit.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Paywall>
  );
}
