'use client';

import { useState } from 'react';

interface StripeFirstPassStats {
  processed: number;
  created: number;
  updated: number;
  skipped: number;
  unresolved: number;
}

interface SyncResult {
  success: boolean;
  stats?: StripeFirstPassStats;
  error?: string;
}

export function StripeSyncButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/admin/stripe-sync', {
        method: 'POST',
      });
      const data = (await response.json()) as SyncResult;
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 space-y-4'>
      <div>
        <h2 className='text-base font-semibold text-white'>Full Stripe sync</h2>
        <p className='text-sm text-zinc-400 mt-1'>
          Pages through all active, trialing, and past_due Stripe subscriptions
          and upserts any DB row that is missing or has stale status. This
          catches users the weekly cron misses because they have no DB row yet.
          Can take 1-3 minutes.
        </p>
      </div>

      <button
        type='button'
        className='rounded-full bg-lunary-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-lunary-primary-400 disabled:cursor-not-allowed disabled:bg-zinc-700'
        disabled={loading}
        onClick={handleSync}
      >
        {loading ? 'Running sync...' : 'Run full Stripe sync'}
      </button>

      {result && (
        <div
          className={`rounded-lg border p-4 ${
            result.success
              ? 'border-green-800 bg-green-950/40'
              : 'border-red-800 bg-red-950/40'
          }`}
        >
          {result.success && result.stats ? (
            <div className='space-y-1 text-sm'>
              <p className='font-semibold text-white mb-2'>Sync complete</p>
              <p className='text-zinc-300'>
                Processed:{' '}
                <span className='text-white font-medium'>
                  {result.stats.processed}
                </span>
              </p>
              <p className='text-zinc-300'>
                Created:{' '}
                <span className='text-green-400 font-medium'>
                  {result.stats.created}
                </span>
              </p>
              <p className='text-zinc-300'>
                Updated:{' '}
                <span className='text-blue-400 font-medium'>
                  {result.stats.updated}
                </span>
              </p>
              <p className='text-zinc-300'>
                Skipped (already correct):{' '}
                <span className='text-zinc-400 font-medium'>
                  {result.stats.skipped}
                </span>
              </p>
              <p className='text-zinc-300'>
                Unresolved (no user match):{' '}
                <span className='text-yellow-400 font-medium'>
                  {result.stats.unresolved}
                </span>
              </p>
            </div>
          ) : (
            <p className='text-sm text-red-300'>{result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
