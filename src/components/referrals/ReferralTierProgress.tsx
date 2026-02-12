'use client';

import { Check } from 'lucide-react';

interface Tier {
  threshold: number;
  label: string;
  description: string;
  reached: boolean;
}

interface ReferralTierProgressProps {
  tiers: Tier[];
  activatedCount: number;
}

export function ReferralTierProgress({
  tiers,
  activatedCount,
}: ReferralTierProgressProps) {
  const maxThreshold = tiers[tiers.length - 1]?.threshold || 50;

  return (
    <div className='space-y-4'>
      {/* Progress bar */}
      <div className='relative'>
        <div className='h-2 bg-zinc-800 rounded-full overflow-hidden'>
          <div
            className='h-full bg-gradient-to-r from-lunary-primary-600 to-lunary-accent rounded-full transition-all duration-500'
            style={{
              width: `${Math.min((activatedCount / maxThreshold) * 100, 100)}%`,
            }}
          />
        </div>

        {/* Milestone markers */}
        <div className='relative mt-1'>
          {tiers.map((tier) => {
            const position = (tier.threshold / maxThreshold) * 100;
            return (
              <div
                key={tier.threshold}
                className='absolute -translate-x-1/2'
                style={{ left: `${position}%` }}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center -mt-3 ${
                    tier.reached
                      ? 'border-lunary-primary-400 bg-lunary-primary-900'
                      : 'border-zinc-600 bg-zinc-800'
                  }`}
                >
                  {tier.reached && (
                    <Check className='w-2.5 h-2.5 text-lunary-primary-400' />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tier list */}
      <div className='space-y-2'>
        {tiers.map((tier) => (
          <div
            key={tier.threshold}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              tier.reached
                ? 'border-lunary-primary-700/50 bg-lunary-primary-950/30'
                : 'border-zinc-800 bg-zinc-900/30'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                tier.reached
                  ? 'bg-lunary-primary-900/50 text-lunary-primary-400'
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {tier.threshold}
            </div>
            <div className='flex-1 min-w-0'>
              <p
                className={`text-sm font-medium ${
                  tier.reached ? 'text-lunary-primary-300' : 'text-zinc-400'
                }`}
              >
                {tier.label}
              </p>
              <p className='text-xs text-zinc-500'>{tier.description}</p>
            </div>
            {tier.reached && (
              <Check className='w-4 h-4 text-lunary-primary-400 flex-shrink-0' />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
