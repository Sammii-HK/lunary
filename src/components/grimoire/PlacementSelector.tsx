'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePostHog } from 'posthog-js/react';

interface PlacementSelectorProps {
  signName: string;
}

type Placement = 'sun' | 'moon' | 'rising' | 'not_sure';

const PLACEMENT_INFO: Record<
  Placement,
  {
    label: string;
    symbol: string;
    useAstroFont: boolean;
    explanation: string;
    cta: string;
  }
> = {
  sun: {
    label: 'Sun',
    symbol: 'Q',
    useAstroFont: true,
    explanation:
      'Your Sun sign is your core identity - who you are at your deepest level. It shapes your ego, willpower, and life purpose. Most horoscopes are written for your Sun sign.',
    cta: 'See all your placements',
  },
  moon: {
    label: 'Moon',
    symbol: 'R',
    useAstroFont: true,
    explanation:
      'Your Moon sign rules your emotions, instincts, and inner world. It reveals how you process feelings and what makes you feel secure. Your Moon sign horoscope often resonates more deeply.',
    cta: 'Discover your Moon sign',
  },
  rising: {
    label: 'Rising',
    symbol: 'a',
    useAstroFont: true,
    explanation:
      'Your Rising sign (Ascendant) is the mask you wear and how others first perceive you. It also determines which houses the planets fall in for your chart, making Rising sign horoscopes highly accurate for timing.',
    cta: 'Calculate your Rising sign',
  },
  not_sure: {
    label: 'Not sure?',
    symbol: '?',
    useAstroFont: false,
    explanation:
      "Not sure which placement applies to you? Your birth chart reveals your Sun, Moon, and Rising signs based on your exact birth time and location. Each one gives you a different lens on this sign's energy.",
    cta: 'Calculate your full chart',
  },
};

export function PlacementSelector({ signName }: PlacementSelectorProps) {
  const [selected, setSelected] = useState<Placement | null>(null);
  const posthog = usePostHog();
  const signSlug = signName.toLowerCase();

  const handleSelect = (placement: Placement) => {
    setSelected(selected === placement ? null : placement);
    posthog?.capture('grimoire_placement_clicked', {
      page_url: window.location.pathname,
      placement_selected: placement,
    });
  };

  const info = selected ? PLACEMENT_INFO[selected] : null;

  const ctaHrefs: Record<Placement, string> = {
    sun: `/grimoire/zodiac/${signSlug}`,
    moon: `/grimoire/moon-in/${signSlug}`,
    rising: `/grimoire/rising/${signSlug}`,
    not_sure: '/grimoire/guides/birth-chart-complete-guide',
  };

  return (
    <div className='bg-surface-elevated/50 border border-stroke-subtle/50 rounded-xl p-4 sm:p-5'>
      <p className='text-sm text-content-muted mb-3'>
        This is a{' '}
        <span className='text-content-primary font-medium'>general</span>{' '}
        {signName} forecast. Which placement is {signName} in your chart?
      </p>

      <div className='flex flex-wrap gap-2'>
        {(Object.keys(PLACEMENT_INFO) as Placement[]).map((key) => {
          const item = PLACEMENT_INFO[key];
          const isSelected = selected === key;
          return (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors border',
                isSelected
                  ? 'bg-layer-base/50 border-lunary-primary-600 text-content-secondary'
                  : 'bg-surface-card/50 border-stroke-default/50 text-content-muted hover:text-content-secondary hover:border-stroke-strong',
              )}
            >
              <span
                className={cn(
                  'text-base leading-none',
                  item.useAstroFont && 'font-astro',
                )}
              >
                {item.symbol}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {info && selected && (
        <div className='mt-3 pt-3 border-t border-stroke-subtle/50'>
          <p className='text-sm text-content-secondary leading-relaxed'>
            {info.explanation}
          </p>
          <Link
            href={ctaHrefs[selected]}
            className='inline-block mt-2 text-sm text-lunary-primary-400 hover:text-content-brand transition-colors'
          >
            {info.cta} &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
