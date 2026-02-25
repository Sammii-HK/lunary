'use client';

import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Button } from '@/components/ui/button';
import {
  getIAPOfferings,
  purchaseIAPPackage,
  restoreIAPPurchases,
  type IAPOfferings,
} from '@/hooks/useIAPSubscription';
import type { PurchasesPackage } from '@revenuecat/purchases-capacitor';

interface IOSPaywallProps {
  onSuccess?: (planId: string) => void;
  onDismiss?: () => void;
}

type PlanKey = 'plusMonthly' | 'plusAnnual' | 'proMonthly' | 'proAnnual';

interface PlanConfig {
  key: PlanKey;
  name: string;
  description: string;
  badge?: string;
  popular?: boolean;
}

const PLAN_CONFIGS: PlanConfig[] = [
  {
    key: 'plusMonthly',
    name: 'Lunary+',
    description: 'Birth chart, transits, personal tarot',
  },
  {
    key: 'plusAnnual',
    name: 'Lunary+ Annual',
    description: 'Everything in Lunary+ — billed yearly',
    badge: 'Save 16%',
  },
  {
    key: 'proMonthly',
    name: 'Lunary+ Pro',
    description: 'AI chat, weekly reports, advanced patterns',
  },
  {
    key: 'proAnnual',
    name: 'Lunary+ Pro Annual',
    description: 'Everything in Pro — billed yearly',
    badge: 'Save 17%',
    popular: true,
  },
];

export function IOSPaywall({ onSuccess, onDismiss }: IOSPaywallProps) {
  const [offerings, setOfferings] = useState<IAPOfferings | null>(null);
  const [selected, setSelected] = useState<PlanKey>('proMonthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (Capacitor.getPlatform() !== 'ios') return;
    getIAPOfferings()
      .then(setOfferings)
      .catch(() =>
        setError('Could not load subscription options. Please try again.'),
      );
  }, []);

  async function handlePurchase() {
    if (!offerings) return;
    const pkg: PurchasesPackage | null = offerings[selected];
    if (!pkg) return;

    setLoading(true);
    setError(null);

    const result = await purchaseIAPPackage(pkg);

    if (result.success && result.planId) {
      onSuccess?.(result.planId);
    } else if (result.error && result.error !== 'cancelled') {
      setError('Purchase could not be completed. Please try again.');
    }

    setLoading(false);
  }

  async function handleRestore() {
    setRestoring(true);
    setError(null);
    const result = await restoreIAPPurchases();
    if (result.planId) {
      onSuccess?.(result.planId);
    } else {
      setError('No previous purchase found for this Apple ID.');
    }
    setRestoring(false);
  }

  function getPriceLabel(pkg: PurchasesPackage | null): string {
    if (!pkg) return '—';
    const price = pkg.product.priceString;
    const period = pkg.packageType === 'ANNUAL' ? '/year' : '/month';
    return `${price}${period}`;
  }

  return (
    <div className='space-y-4'>
      <div className='text-center mb-2'>
        <p className='text-sm text-gray-400'>
          Choose a plan — 7-day free trial included
        </p>
      </div>

      <div className='space-y-2'>
        {PLAN_CONFIGS.map((config) => {
          const pkg = offerings?.[config.key] ?? null;
          const isSelected = selected === config.key;

          return (
            <button
              key={config.key}
              onClick={() => setSelected(config.key)}
              className={`w-full text-left rounded-xl border p-4 transition-colors ${
                isSelected
                  ? 'border-lunary-primary bg-lunary-primary/10'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-600'
              }`}
            >
              <div className='flex items-center justify-between'>
                <div>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium text-white'>
                      {config.name}
                    </span>
                    {config.badge && (
                      <span className='text-xs px-2 py-0.5 rounded-full bg-lunary-primary/20 text-lunary-primary-300'>
                        {config.badge}
                      </span>
                    )}
                    {config.popular && (
                      <span className='text-xs px-2 py-0.5 rounded-full bg-lunary-accent/20 text-lunary-accent'>
                        Most popular
                      </span>
                    )}
                  </div>
                  <p className='text-xs text-gray-400 mt-0.5'>
                    {config.description}
                  </p>
                </div>
                <span className='text-sm font-medium text-white ml-4 shrink-0'>
                  {offerings ? getPriceLabel(pkg) : '…'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {error && <p className='text-xs text-red-400 text-center'>{error}</p>}

      <Button
        variant='lunary-solid'
        className='w-full'
        onClick={handlePurchase}
        disabled={loading || !offerings}
      >
        {loading ? 'Processing…' : 'Start free trial'}
      </Button>

      <p className='text-xs text-gray-500 text-center'>
        Subscription renews automatically. Cancel any time in Settings.
      </p>

      <div className='flex justify-center gap-4'>
        <button
          onClick={handleRestore}
          disabled={restoring}
          className='text-xs text-gray-400 hover:text-gray-300 transition-colors'
        >
          {restoring ? 'Restoring…' : 'Restore purchase'}
        </button>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className='text-xs text-gray-400 hover:text-gray-300 transition-colors'
          >
            Not now
          </button>
        )}
      </div>

      <p className='text-xs text-gray-600 text-center'>
        Or subscribe at lunary.app for less
      </p>
    </div>
  );
}
