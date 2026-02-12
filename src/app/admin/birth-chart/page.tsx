'use client';

import { useState } from 'react';

type BirthChartPlacement = {
  body: string;
  sign: string;
  degree: number;
  minute: number;
  eclipticLongitude: number;
  retrograde: boolean;
  house?: number;
};

type LookupResult = {
  userId: string;
  email: string;
  name: string;
  birthday: string | null;
  birthTime: string | null;
  birthLocation: string | null;
  birthTimezone: string | null;
  birthChart: BirthChartPlacement[] | null;
  chartVersion: number | null;
  error?: string;
};

type RegenerateResult = {
  success: boolean;
  previousChart: BirthChartPlacement[];
  newChart: BirthChartPlacement[];
  timezone: string | null;
  chartVersion: number;
  error?: string;
};

function ChartTable({
  chart,
  label,
  diffChart,
}: {
  chart: BirthChartPlacement[];
  label: string;
  diffChart?: BirthChartPlacement[] | null;
}) {
  return (
    <div>
      <h3 className='text-sm font-semibold uppercase tracking-wide text-zinc-400 mb-3'>
        {label}
      </h3>
      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-zinc-700 text-zinc-400 text-xs uppercase tracking-wide'>
              <th className='text-left py-2 pr-4'>Body</th>
              <th className='text-left py-2 pr-4'>Sign</th>
              <th className='text-right py-2 pr-4'>Degree</th>
              <th className='text-center py-2'>Rx</th>
            </tr>
          </thead>
          <tbody>
            {chart.map((placement) => {
              const isSun = placement.body === 'Sun';
              const diffPlacement = diffChart?.find(
                (p) => p.body === placement.body,
              );
              const hasChanged =
                diffPlacement && diffPlacement.sign !== placement.sign;

              return (
                <tr
                  key={placement.body}
                  className={
                    isSun
                      ? 'bg-lunary-accent/10 border-l-2 border-lunary-accent'
                      : hasChanged
                        ? 'bg-lunary-primary/10'
                        : 'border-b border-zinc-800/50'
                  }
                >
                  <td
                    className={`py-1.5 pr-4 font-medium ${isSun ? 'text-lunary-accent' : 'text-white'}`}
                  >
                    {placement.body}
                  </td>
                  <td
                    className={`py-1.5 pr-4 ${hasChanged ? 'text-lunary-primary-300 font-semibold' : 'text-zinc-200'}`}
                  >
                    {placement.sign}
                  </td>
                  <td className='py-1.5 pr-4 text-right text-zinc-300 tabular-nums'>
                    {placement.degree}&deg;{placement.minute}&apos;
                  </td>
                  <td className='py-1.5 text-center text-zinc-400'>
                    {placement.retrograde ? 'R' : ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminBirthChartPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [lookup, setLookup] = useState<LookupResult | null>(null);
  const [regenerateResult, setRegenerateResult] =
    useState<RegenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    setLookup(null);
    setRegenerateResult(null);

    try {
      const response = await fetch(
        `/api/admin/birth-chart?email=${encodeURIComponent(email.trim())}`,
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Lookup failed');
        return;
      }

      setLookup(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!lookup?.email) return;
    setRegenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/birth-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: lookup.email }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Regeneration failed');
        return;
      }

      setRegenerateResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className='min-h-screen bg-zinc-950 text-white'>
      <div className='container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-5xl'>
        <div className='mb-6'>
          <h1 className='text-2xl md:text-3xl font-semibold'>
            Birth Chart Tool
          </h1>
          <p className='text-sm text-zinc-400 mt-2'>
            Look up a user by email, inspect their birth chart, and regenerate
            it if needed. Cache invalidation runs automatically on regeneration.
          </p>
        </div>

        {/* Lookup form */}
        <div className='rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 space-y-4'>
          <div className='space-y-2'>
            <label className='text-xs font-semibold uppercase tracking-wide text-zinc-400'>
              User email
            </label>
            <div className='flex gap-3'>
              <input
                className='flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-lunary-primary'
                placeholder='user@example.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              />
              <button
                type='button'
                className='rounded-full bg-lunary-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-lunary-primary-400 disabled:cursor-not-allowed disabled:bg-zinc-700'
                disabled={loading || !email.trim()}
                onClick={handleLookup}
              >
                {loading ? 'Looking up...' : 'Look up'}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className='mt-4 rounded-xl border border-red-800/50 bg-red-950/30 p-4 text-sm text-red-300'>
            {error}
          </div>
        )}

        {/* Lookup result */}
        {lookup && (
          <div className='mt-6 space-y-6'>
            {/* User info */}
            <div className='rounded-xl border border-zinc-800 bg-zinc-900/70 p-5'>
              <h2 className='text-sm font-semibold uppercase tracking-wide text-zinc-400 mb-3'>
                User Details
              </h2>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                <div>
                  <span className='text-zinc-500 block text-xs'>Name</span>
                  <span className='text-white'>{lookup.name || 'Not set'}</span>
                </div>
                <div>
                  <span className='text-zinc-500 block text-xs'>Email</span>
                  <span className='text-white'>{lookup.email}</span>
                </div>
                <div>
                  <span className='text-zinc-500 block text-xs'>Birthday</span>
                  <span className='text-white'>
                    {lookup.birthday || 'Not set'}
                  </span>
                </div>
                <div>
                  <span className='text-zinc-500 block text-xs'>
                    Birth Time
                  </span>
                  <span className='text-white'>
                    {lookup.birthTime || 'Not set'}
                  </span>
                </div>
                <div>
                  <span className='text-zinc-500 block text-xs'>Location</span>
                  <span className='text-white'>
                    {lookup.birthLocation || 'Not set'}
                  </span>
                </div>
                <div>
                  <span className='text-zinc-500 block text-xs'>Timezone</span>
                  <span className='text-white'>
                    {lookup.birthTimezone || 'Not set'}
                  </span>
                </div>
                <div>
                  <span className='text-zinc-500 block text-xs'>
                    Chart Version
                  </span>
                  <span className='text-white'>
                    {lookup.chartVersion ?? 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            {/* Current chart */}
            {lookup.birthChart && Array.isArray(lookup.birthChart) ? (
              <div className='rounded-xl border border-zinc-800 bg-zinc-900/70 p-5'>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-sm font-semibold uppercase tracking-wide text-zinc-400'>
                    Current Birth Chart
                  </h2>
                  <button
                    type='button'
                    className='rounded-full bg-lunary-accent px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-lunary-accent/80 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-white'
                    disabled={regenerating}
                    onClick={handleRegenerate}
                  >
                    {regenerating ? 'Regenerating...' : 'Regenerate chart'}
                  </button>
                </div>
                <ChartTable chart={lookup.birthChart} label='Placements' />
              </div>
            ) : (
              <div className='rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 text-center text-zinc-400'>
                <p>No birth chart data found for this user.</p>
                {lookup.birthday && (
                  <button
                    type='button'
                    className='mt-3 rounded-full bg-lunary-accent px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-lunary-accent/80 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-white'
                    disabled={regenerating}
                    onClick={handleRegenerate}
                  >
                    {regenerating ? 'Generating...' : 'Generate chart'}
                  </button>
                )}
              </div>
            )}

            {/* Before/After comparison */}
            {regenerateResult && (
              <div className='rounded-xl border border-lunary-primary/30 bg-zinc-900/70 p-5'>
                <h2 className='text-sm font-semibold uppercase tracking-wide text-lunary-primary-300 mb-1'>
                  Regeneration Complete
                </h2>
                <p className='text-xs text-zinc-400 mb-4'>
                  Chart version: {regenerateResult.chartVersion} | Timezone:{' '}
                  {regenerateResult.timezone || 'N/A'}
                </p>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <ChartTable
                    chart={regenerateResult.previousChart}
                    label='Previous Chart'
                    diffChart={regenerateResult.newChart}
                  />
                  <ChartTable
                    chart={regenerateResult.newChart}
                    label='New Chart'
                    diffChart={regenerateResult.previousChart}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
