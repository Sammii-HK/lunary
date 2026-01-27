'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { WeeklyReport } from '@/lib/cosmic-snapshot/reports';
import { MarketingFooterGate } from '@/components/MarketingFooterGate';

export default function ReportsPage() {
  const { user } = useUser();
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadReports();
    }
  }, [user?.id]);

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/reports/weekly');
      if (!response.ok) {
        throw new Error('Failed to load reports');
      }
      const data = await response.json();
      setReports(data.reports || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-zinc-950 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-lunary-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-zinc-400'>Loading your cosmic reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-zinc-950 flex items-center justify-center p-4'>
        <div className='text-center'>
          <p className='text-red-400 mb-4'>Error: {error}</p>
          <button
            onClick={loadReports}
            className='px-4 py-2 bg-lunary-primary hover:bg-lunary-primary-400 text-white rounded transition-colors'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-zinc-950 flex flex-col'>
      <div className='flex-1'>
        <div className='max-w-4xl mx-auto px-4 py-8 md:py-12'>
          <h1 className='text-3xl md:text-4xl font-bold text-white mb-2'>
            Weekly Cosmic Reports
          </h1>
          <p className='text-zinc-400 mb-8'>
            Your personalized weekly cosmic insights and patterns
          </p>

          {reports.length === 0 ? (
            <div className='bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center'>
              <p className='text-zinc-300 mb-4'>
                No reports available yet. Reports are generated weekly and sent
                to your email.
              </p>
              <p className='text-sm text-zinc-500'>
                Check back after Sunday to see your first report!
              </p>
            </div>
          ) : (
            <div className='space-y-6'>
              {reports.map((report, index) => (
                <WeeklyReportCard key={index} report={report} />
              ))}
            </div>
          )}
        </div>
      </div>
      <MarketingFooterGate />
    </div>
  );
}

function WeeklyReportCard({ report }: { report: WeeklyReport }) {
  const weekStartStr = new Date(report.weekStart).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const weekEndStr = new Date(report.weekEnd).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className='bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden'>
      {/* Header */}
      <div className='bg-gradient-to-r from-lunary-primary-900/30 to-lunary-secondary-900/30 border-b border-zinc-800 px-6 py-4'>
        <h2 className='text-xl font-semibold text-white'>
          {weekStartStr} - {weekEndStr}
        </h2>
      </div>

      <div className='p-6 space-y-6'>
        {/* Summary */}
        {report.summary && (
          <div>
            <h3 className='text-sm font-medium text-lunary-accent uppercase tracking-wider mb-3'>
              Weekly Summary
            </h3>
            <p className='text-zinc-300 leading-relaxed'>{report.summary}</p>
          </div>
        )}

        {/* Moon Phases */}
        {report.moonPhases && report.moonPhases.length > 0 && (
          <div>
            <h3 className='text-sm font-medium text-lunary-accent uppercase tracking-wider mb-3'>
              Moon Phases
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {report.moonPhases.map((moon, i) => (
                <div
                  key={i}
                  className='flex items-center gap-3 bg-zinc-800/50 rounded-lg p-3'
                >
                  <span className='text-2xl'>{moon.emoji}</span>
                  <div>
                    <div className='text-sm font-medium text-white'>
                      {moon.phase}
                    </div>
                    <div className='text-xs text-zinc-400'>
                      {new Date(moon.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Transits */}
        {report.keyTransits && report.keyTransits.length > 0 && (
          <div>
            <h3 className='text-sm font-medium text-lunary-accent uppercase tracking-wider mb-3'>
              Key Transits
            </h3>
            <div className='space-y-2'>
              {report.keyTransits.map((transit, i) => (
                <div
                  key={i}
                  className='bg-zinc-800/50 rounded-lg p-3 border-l-2 border-lunary-primary'
                >
                  <div className='flex justify-between items-start gap-4'>
                    <div>
                      <div className='text-sm font-medium text-white mb-1'>
                        {transit.transit}
                      </div>
                      <div className='text-sm text-zinc-400'>
                        {transit.description}
                      </div>
                    </div>
                    <div className='text-xs text-zinc-500 whitespace-nowrap'>
                      {new Date(transit.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tarot Patterns */}
        {report.tarotPatterns && (
          <div>
            <h3 className='text-sm font-medium text-lunary-accent uppercase tracking-wider mb-3'>
              Tarot Patterns
            </h3>
            <div className='space-y-4'>
              {report.tarotPatterns.dominantThemes &&
                report.tarotPatterns.dominantThemes.length > 0 && (
                  <div>
                    <div className='text-xs text-zinc-500 uppercase tracking-wider mb-2'>
                      Dominant Themes
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      {report.tarotPatterns.dominantThemes.map((theme, i) => (
                        <span
                          key={i}
                          className='px-3 py-1 bg-lunary-primary-900/30 text-lunary-primary text-sm rounded-full border border-lunary-primary-800'
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {report.tarotPatterns.frequentCards &&
                report.tarotPatterns.frequentCards.length > 0 && (
                  <div>
                    <div className='text-xs text-zinc-500 uppercase tracking-wider mb-2'>
                      Frequent Cards
                    </div>
                    <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
                      {report.tarotPatterns.frequentCards.map((card, i) => (
                        <div
                          key={i}
                          className='bg-zinc-800/50 rounded p-2 text-center'
                        >
                          <div className='text-sm text-white font-medium'>
                            {card.name}
                          </div>
                          <div className='text-xs text-zinc-400'>
                            {card.count}x
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
