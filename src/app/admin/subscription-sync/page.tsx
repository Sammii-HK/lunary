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

export default function SubscriptionSyncPage() {
  const [customerId, setCustomerId] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);

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
    <div className='min-h-screen bg-zinc-950 text-white'>
      <div className='container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-3xl'>
        <div className='mb-6'>
          <h1 className='text-2xl md:text-3xl font-semibold'>
            Subscription Sync
          </h1>
          <p className='text-sm text-zinc-400 mt-2'>
            Reconcile Stripe subscriptions back into Lunary. Provide a Stripe
            customer ID or email. User ID is optional but helps when emails
            differ.
          </p>
        </div>

        <div className='rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 space-y-4'>
          <div className='space-y-2'>
            <label className='text-xs font-semibold uppercase tracking-wide text-zinc-400'>
              Stripe customer id
            </label>
            <input
              className='w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-lunary-primary'
              placeholder='cus_123...'
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <label className='text-xs font-semibold uppercase tracking-wide text-zinc-400'>
              Customer email
            </label>
            <input
              className='w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-lunary-primary'
              placeholder='user@example.com'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <label className='text-xs font-semibold uppercase tracking-wide text-zinc-400'>
              User id (optional)
            </label>
            <input
              className='w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-lunary-primary'
              placeholder='uuid'
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
            />
          </div>

          <button
            type='button'
            className='rounded-full bg-lunary-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-lunary-primary-400 disabled:cursor-not-allowed disabled:bg-zinc-700'
            disabled={loading}
            onClick={handleSync}
          >
            {loading ? 'Syncing...' : 'Sync subscription'}
          </button>
        </div>

        {result && (
          <div className='mt-6 rounded-xl border border-zinc-800 bg-zinc-900/70 p-5'>
            <h2 className='text-sm font-semibold uppercase tracking-wide text-zinc-400 mb-3'>
              Result
            </h2>
            <pre className='text-xs text-zinc-200 whitespace-pre-wrap break-words'>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
