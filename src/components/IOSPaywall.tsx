'use client';

import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import {
  configureIAP,
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
  fallbackPrice: string;
  features: string[];
}

const PLAN_CONFIGS: PlanConfig[] = [
  {
    key: 'plusMonthly',
    name: 'Lunary+',
    description: 'Build a daily practice',
    fallbackPrice: '$6.99/mo',
    features: [
      'Complete birth chart analysis',
      'Personalized daily horoscopes',
      'Personal transit impacts',
      'Personal tarot with transit context',
      'Moon Circles (New & Full Moon)',
      'Crystal recommendations',
    ],
  },
  {
    key: 'plusAnnual',
    name: 'Lunary+ Annual',
    description: 'Build a daily practice',
    badge: 'Save 17%',
    fallbackPrice: '$69.99/yr',
    features: [
      'Everything in Lunary+',
      'Billed yearly — equivalent to 10 months',
    ],
  },
  {
    key: 'proMonthly',
    name: 'Lunary+ Pro',
    description: 'Go deeper with AI guidance',
    fallbackPrice: '$12.99/mo',
    features: [
      'Everything in Lunary+',
      'Weekly personal reports',
      'Astral Guide ritual generation',
      'Advanced pattern analysis',
      'Downloadable PDF reports',
      'Extended Astral Guide memory',
    ],
  },
  {
    key: 'proAnnual',
    name: 'Lunary+ Pro Annual',
    description: 'Go deeper with AI guidance',
    badge: 'Save 20%',
    popular: true,
    fallbackPrice: '$124.99/yr',
    features: [
      'Everything in Lunary+ Pro',
      'Unlimited tarot spreads',
      'Yearly cosmic forecast',
      'Extended timeline analysis',
      'Billed yearly — equivalent to 10 months',
    ],
  },
];

export function IOSPaywall({ onSuccess, onDismiss }: IOSPaywallProps) {
  const [offerings, setOfferings] = useState<IAPOfferings | null>(null);
  const [selected, setSelected] = useState<PlanKey>('proMonthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [expanded, setExpanded] = useState<PlanKey | null>(null);
  // True when StoreKit is unavailable (simulator) — show UI but disable purchase
  const [simulatorMode, setSimulatorMode] = useState(false);

  useEffect(() => {
    if (Capacitor.getPlatform() !== 'ios') return;
    configureIAP()
      .then(() => getIAPOfferings())
      .then(setOfferings)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.includes('not implemented') ||
          msg.includes('simulator') ||
          msg.includes('NEXT_PUBLIC_REVENUECAT_IOS_KEY')
        ) {
          // Simulator — show the UI with fallback prices, disable actual purchase
          setSimulatorMode(true);
        } else {
          setError('Could not load subscription options. Please try again.');
        }
      });
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

  function getPriceLabel(
    pkg: PurchasesPackage | null,
    config: PlanConfig,
  ): string {
    if (pkg) {
      const price = pkg.product.priceString;
      const period = pkg.packageType === 'ANNUAL' ? '/yr' : '/mo';
      return `${price}${period}`;
    }
    return config.fallbackPrice;
  }

  return (
    <div className='space-y-3'>
      <div className='text-center mb-1'>
        <p className='text-sm text-gray-400'>
          Choose a plan — 7-day free trial included
        </p>
      </div>

      <div className='space-y-3'>
        {PLAN_CONFIGS.map((config) => {
          const pkg = offerings?.[config.key] ?? null;
          const isSelected = selected === config.key;
          const isExpanded = expanded === config.key;

          return (
            <div key={config.key} className='relative'>
              {config.popular && (
                <div className='absolute -top-2.5 left-1/2 -translate-x-1/2 z-10'>
                  <span className='text-xs px-3 py-0.5 rounded-full bg-lunary-accent text-black font-medium whitespace-nowrap'>
                    Most popular
                  </span>
                </div>
              )}

              <div
                onClick={() => setSelected(config.key)}
                className={`w-full text-left rounded-xl border p-3.5 transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-lunary-primary bg-zinc-950'
                    : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'
                } ${config.popular ? 'pt-5' : ''}`}
              >
                {/* Name row */}
                <div className='flex items-center justify-between gap-2'>
                  <div className='flex items-center gap-2 min-w-0'>
                    <span className='text-sm font-medium text-white truncate'>
                      {config.name}
                    </span>
                    {config.badge && (
                      <span className='text-xs px-1.5 py-0.5 rounded-full bg-gray-700 text-gray-300 shrink-0'>
                        {config.badge}
                      </span>
                    )}
                  </div>
                  <span className='text-sm font-semibold text-white shrink-0'>
                    {getPriceLabel(pkg, config)}
                  </span>
                </div>

                {/* Description */}
                <p className='text-xs text-gray-400 mt-0.5'>
                  {config.description}
                </p>

                {/* Feature toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(isExpanded ? null : config.key);
                  }}
                  className='mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors'
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className='w-3 h-3' />
                      Hide features
                    </>
                  ) : (
                    <>
                      <ChevronDown className='w-3 h-3' />
                      See features
                    </>
                  )}
                </button>
              </div>

              {/* Expandable feature list */}
              {isExpanded && (
                <div className='mx-1 mb-1 px-3 py-2.5 rounded-b-xl bg-zinc-900 border border-t-0 border-zinc-800 space-y-1.5'>
                  {config.features.map((feature, i) => (
                    <div key={i} className='flex items-start gap-2'>
                      <Check className='w-3 h-3 text-lunary-primary-400 mt-0.5 shrink-0' />
                      <span className='text-xs text-gray-300'>{feature}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className='text-xs text-red-400 text-center'>{error}</p>}

      <Button
        variant='lunary-solid'
        className='w-full'
        onClick={handlePurchase}
        disabled={loading || (!offerings && !simulatorMode)}
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

      <p className='text-xs text-gray-600 text-center'>
        <a
          href='https://lunary.app/privacy'
          target='_blank'
          rel='noopener noreferrer'
          className='underline hover:text-gray-400'
        >
          Privacy Policy
        </a>
        {' · '}
        <a
          href='https://lunary.app/terms'
          target='_blank'
          rel='noopener noreferrer'
          className='underline hover:text-gray-400'
        >
          Terms of Use
        </a>
      </p>
    </div>
  );
}
