'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, ExternalLink } from 'lucide-react';
import { IOSPaywall } from '@/components/IOSPaywall';
import { configureIAP, getIAPCustomerInfo } from '@/hooks/useIAPSubscription';

export function IOSSubscriptionSection() {
  const [planId, setPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    configureIAP()
      .then(() => getIAPCustomerInfo())
      .then((info) => {
        setPlanId(info.planId ?? null);
      })
      .catch(() => {
        // Simulator or IAP unavailable — treat as free
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className='h-20 bg-zinc-800 animate-pulse rounded-xl' />;
  }

  if (showPaywall) {
    return (
      <div className='border border-zinc-800 rounded-xl p-4 bg-zinc-950'>
        <IOSPaywall
          onSuccess={() => {
            setShowPaywall(false);
            // Re-check entitlement after purchase
            getIAPCustomerInfo().then((info) => setPlanId(info.planId ?? null));
          }}
          onDismiss={() => setShowPaywall(false)}
        />
      </div>
    );
  }

  if (planId) {
    const planLabel =
      planId === 'lunary_plus_ai'
        ? 'Lunary+ Pro'
        : planId === 'lunary_plus'
          ? 'Lunary+'
          : planId;

    return (
      <div className='border border-zinc-800 rounded-xl p-4 bg-zinc-950 space-y-3'>
        <div className='flex items-center justify-between'>
          <span className='text-sm text-zinc-400'>Plan</span>
          <span className='text-sm font-medium text-white'>{planLabel}</span>
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-sm text-zinc-400'>Billed via</span>
          <span className='text-sm text-zinc-300'>Apple</span>
        </div>
        <button
          onClick={() =>
            window.open(
              'itms-apps://apps.apple.com/account/subscriptions',
              '_system',
            )
          }
          className='w-full flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white py-2 px-3 rounded-lg transition-colors text-sm'
        >
          <Settings size={14} />
          Manage in Apple Settings
          <ExternalLink size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className='border border-zinc-800 rounded-xl p-4 bg-zinc-950 space-y-3'>
      <div className='text-center space-y-2'>
        <p className='text-sm font-medium text-zinc-100'>
          Unlock your full cosmic potential
        </p>
        <p className='text-xs text-zinc-400'>
          Personalised horoscopes, birth charts, and AI guidance
        </p>
      </div>
      <Button
        variant='lunary-solid'
        className='w-full'
        onClick={() => setShowPaywall(true)}
      >
        View Plans
      </Button>
    </div>
  );
}
