'use client';

import { useState } from 'react';

interface TriggerResult {
  success?: boolean;
  skipped?: boolean;
  reason?: string;
  day?: number;
  weekLabel?: string;
  postId?: string;
  error?: string;
  metrics?: Record<string, number>;
}

function TriggerButton({
  label,
  endpoint,
}: {
  label: string;
  endpoint: string;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriggerResult | null>(null);

  const run = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(endpoint);
      const data = (await res.json()) as TriggerResult;
      setResult(data);
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : 'Failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={run}
        disabled={loading}
        className='bg-[#8458d8] text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#7448c8] transition-colors'
      >
        {loading ? 'Running...' : label}
      </button>
      {result && (
        <pre className='mt-2 text-xs bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg p-3 overflow-auto text-neutral-300 max-h-40'>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

export function BipTriggerButtons() {
  return (
    <div className='flex flex-col gap-4'>
      <TriggerButton
        label='Run daily BIP post now'
        endpoint='/api/cron/bip-daily'
      />
      <TriggerButton
        label='Run weekly BIP card now'
        endpoint='/api/cron/bip-weekly'
      />
    </div>
  );
}
