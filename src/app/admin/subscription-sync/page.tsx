'use client';

import { useState } from 'react';

type SyncResult = {
  success: boolean;
  userId?: string;
  customerId?: string;
  subscriptionId?: string;
  status?: string;
  planType?: string;
  customerEmail?: string | null;
  error?: string;
};

type FullSyncResult = {
  success: boolean;
  stats?: {
    processed: number;
    created: number;
    updated: number;
    skipped: number;
    unresolved: number;
  };
  error?: string;
};

export default function SubscriptionSyncPage() {
  const [customerId, setCustomerId] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [fullSyncLoading, setFullSyncLoading] = useState(false);
  const [fullSyncResult, setFullSyncResult] = useState<FullSyncResult | null>(
    null,
  );

  const handleFullSync = async () => {
    setFullSyncLoading(true);
    setFullSyncResult(null);
    try {
      const response = await fetch('/api/admin/stripe-sync', {
        method: 'POST',
      });
      const data = (await response.json()) as FullSyncResult;
      setFullSyncResult(data);
    } catch (error) {
      setFullSyncResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setFullSyncLoading(false);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/admin/subscription-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customerId.trim() || null,
          email: email.trim() || null,
          userId: userId.trim() || null,
        }),
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
    <div className='min-h-screen bg-surface-base text-content-primary'>
      <div className='container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-3xl'>
        <div className='mb-6'>
          <h1 className='text-2xl md:text-3xl font-semibold'>
            Subscription Sync
          </h1>
          <p className='text-sm text-content-muted mt-2'>
            Reconcile Stripe subscriptions back into Lunary. Provide a Stripe
            customer ID or email. User ID is optional but helps when emails
            differ.
          </p>
        </div>

        <div className='rounded-xl border border-stroke-subtle bg-surface-elevated/70 p-5 space-y-4'>
          <div className='space-y-2'>
            <label className='text-xs font-semibold uppercase tracking-wide text-content-muted'>
              Stripe customer id
            </label>
            <input
              className='w-full rounded-md border border-stroke-default bg-surface-base px-3 py-2 text-sm text-content-primary placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-lunary-primary'
              placeholder='cus_123...'
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <label className='text-xs font-semibold uppercase tracking-wide text-content-muted'>
              Customer email
            </label>
            <input
              className='w-full rounded-md border border-stroke-default bg-surface-base px-3 py-2 text-sm text-content-primary placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-lunary-primary'
              placeholder='user@example.com'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <label className='text-xs font-semibold uppercase tracking-wide text-content-muted'>
              User id (optional)
            </label>
            <input
              className='w-full rounded-md border border-stroke-default bg-surface-base px-3 py-2 text-sm text-content-primary placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-lunary-primary'
              placeholder='uuid'
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
            />
          </div>

          <button
            type='button'
            className='rounded-full bg-lunary-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-lunary-primary-400 disabled:cursor-not-allowed disabled:bg-surface-overlay'
            disabled={loading}
            onClick={handleSync}
          >
            {loading ? 'Syncing...' : 'Sync subscription'}
          </button>
        </div>

        {result && (
          <div className='mt-6 rounded-xl border border-stroke-subtle bg-surface-elevated/70 p-5'>
            <h2 className='text-sm font-semibold uppercase tracking-wide text-content-muted mb-3'>
              Result
            </h2>
            <pre className='text-xs text-content-primary whitespace-pre-wrap break-words'>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className='mt-8 rounded-xl border border-stroke-subtle bg-surface-elevated/70 p-5 space-y-4'>
          <div>
            <h2 className='text-base font-semibold text-content-primary'>
              Full Stripe sync
            </h2>
            <p className='text-sm text-content-muted mt-1'>
              Pages through every active, trialing, and past_due Stripe
              subscription and upserts any DB row that is missing or has stale
              status. Use after webhook outages. Can take 1-3 minutes.
            </p>
          </div>

          <button
            type='button'
            className='rounded-full bg-surface-overlay px-4 py-2 text-sm font-medium text-content-primary transition-colors hover:bg-surface-overlay disabled:cursor-not-allowed disabled:opacity-50'
            disabled={fullSyncLoading}
            onClick={handleFullSync}
          >
            {fullSyncLoading ? 'Running sync...' : 'Run full Stripe sync'}
          </button>

          {fullSyncResult && (
            <div
              className={`rounded-lg border p-4 ${
                fullSyncResult.success
                  ? 'border-green-800 bg-green-950/40'
                  : 'border-red-800 bg-red-950/40'
              }`}
            >
              {fullSyncResult.success && fullSyncResult.stats ? (
                <div className='space-y-1 text-sm'>
                  <p className='font-semibold text-content-primary mb-2'>
                    Sync complete
                  </p>
                  <p className='text-content-secondary'>
                    Processed:{' '}
                    <span className='text-content-primary font-medium'>
                      {fullSyncResult.stats.processed}
                    </span>
                  </p>
                  <p className='text-content-secondary'>
                    Created:{' '}
                    <span className='text-green-400 font-medium'>
                      {fullSyncResult.stats.created}
                    </span>
                  </p>
                  <p className='text-content-secondary'>
                    Updated:{' '}
                    <span className='text-blue-400 font-medium'>
                      {fullSyncResult.stats.updated}
                    </span>
                  </p>
                  <p className='text-content-secondary'>
                    Skipped (already correct):{' '}
                    <span className='text-content-muted font-medium'>
                      {fullSyncResult.stats.skipped}
                    </span>
                  </p>
                  <p className='text-content-secondary'>
                    Unresolved (no user match):{' '}
                    <span className='text-yellow-400 font-medium'>
                      {fullSyncResult.stats.unresolved}
                    </span>
                  </p>
                </div>
              ) : (
                <p className='text-sm text-red-300'>{fullSyncResult.error}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
