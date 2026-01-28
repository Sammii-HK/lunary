'use client';

import { useRouter } from 'next/navigation';
import { Sparkles, Lock } from 'lucide-react';
import type { TransitEvent } from '../../../../../utils/astrology/transitCalendar';
import type { PersonalTransitImpact } from '../../../../../utils/astrology/personalTransits';
import { FREE_TRANSIT_LIMIT } from '../../../../../utils/entitlements';
import { useCTACopy } from '@/hooks/useCTACopy';
import { useFeatureFlagVariant } from '@/hooks/useFeatureFlag';
import { captureEvent } from '@/lib/posthog-client';

interface UnifiedTransitListProps {
  transits: TransitEvent[];
  personalImpacts?: PersonalTransitImpact[];
  hasPaidAccess: boolean;
}

function matchImpact(
  transit: TransitEvent,
  impacts: PersonalTransitImpact[],
): PersonalTransitImpact | undefined {
  return impacts.find(
    (impact) =>
      impact.planet === transit.planet &&
      impact.event === transit.event &&
      impact.date.isSame(transit.date, 'day'),
  );
}

function getOrdinalSuffix(n: number): string {
  if (n >= 11 && n <= 13) return 'th';
  switch (n % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

function TransitCard({
  transit,
  impact,
  hasPaidAccess,
  onUpgradeClick,
}: {
  transit: TransitEvent;
  impact?: PersonalTransitImpact;
  hasPaidAccess: boolean;
  onUpgradeClick: () => void;
}) {
  const isPersonalizable = transit.type !== 'lunar_phase';

  return (
    <div className='rounded-lg bg-zinc-800/50 p-4'>
      <div className='flex justify-between items-start mb-2'>
        <div>
          <h4 className='font-medium text-zinc-100 text-sm mb-1'>
            {transit.planet} {transit.event}
          </h4>
          <p className='text-xs text-zinc-400'>
            {transit.date.format('MMM DD')} • {transit.type.replace('_', ' ')}
            {impact?.house && (
              <span className='ml-2'>
                • {impact.house}
                {getOrdinalSuffix(impact.house)} house
              </span>
            )}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            transit.significance === 'high'
              ? 'bg-lunary-error-900 text-lunary-error-300/90 border border-lunary-error-700'
              : transit.significance === 'medium'
                ? 'bg-lunary-accent-900 text-lunary-accent-300 border border-lunary-accent-700'
                : 'bg-lunary-secondary-900 text-lunary-secondary-300 border border-lunary-secondary-700'
          }`}
        >
          {transit.significance}
        </span>
      </div>

      <p className='text-sm text-zinc-300 leading-relaxed'>
        {transit.description}
      </p>

      {hasPaidAccess && impact ? (
        <div className='mt-3 pt-3 border-t border-zinc-700/50 space-y-2'>
          <p className='text-xs text-zinc-400 leading-relaxed'>
            <span className='font-medium text-zinc-300'>Personal Impact:</span>{' '}
            {impact.personalImpact}
          </p>
          {impact.actionableGuidance && (
            <div className='bg-zinc-800/50 border border-zinc-700/50 rounded p-2'>
              <p className='text-xs text-zinc-300 leading-relaxed'>
                <span className='font-medium text-zinc-200'>What to do:</span>{' '}
                {impact.actionableGuidance}
              </p>
            </div>
          )}
          {impact.aspectToNatal && (
            <p className='text-xs text-zinc-400'>
              <span className='font-medium text-zinc-300'>Aspect:</span> Transit
              at{' '}
              {impact.aspectToNatal.transitDegree ||
                impact.aspectToNatal.transitSign}{' '}
              {impact.aspectToNatal.aspectType} your natal{' '}
              {impact.aspectToNatal.natalPlanet} at{' '}
              {impact.aspectToNatal.natalDegree ||
                impact.aspectToNatal.natalSign}
            </p>
          )}
        </div>
      ) : !hasPaidAccess && isPersonalizable ? (
        <div className='mt-3 pt-3 border-t border-zinc-700/50'>
          <div className='flex items-center gap-2 mb-1.5'>
            <Lock className='w-3 h-3 text-lunary-primary-300' />
            <span className='text-xs font-medium text-lunary-primary-200'>
              Personal Impact
            </span>
            <span className='inline-flex items-center gap-1 text-[10px] bg-lunary-primary-900/50 border border-lunary-primary-700/50 px-1.5 py-0.5 rounded text-lunary-primary-300'>
              <Sparkles className='w-2.5 h-2.5' />
              Lunary+
            </span>
          </div>
          <p className='text-xs text-zinc-500'>
            See how this shift is touching your life and what it means for you.
          </p>
          <button
            type='button'
            onClick={onUpgradeClick}
            className='mt-2 text-xs text-lunary-primary-300 hover:text-lunary-primary-100 transition-colors font-medium'
          >
            See All Transits
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function UnifiedTransitList({
  transits,
  personalImpacts = [],
  hasPaidAccess,
}: UnifiedTransitListProps) {
  const router = useRouter();
  const ctaCopy = useCTACopy();
  const overflowVariantRaw = useFeatureFlagVariant('transit-overflow-style');
  const overflowVariant = overflowVariantRaw || 'blurred';

  const handleUpgradeClick = () => {
    ctaCopy.trackCTAClick('transitList', 'horoscope');
    captureEvent('locked_content_clicked', {
      feature: 'personal_transit_impact',
      tier: 'free',
      overflow_variant: overflowVariant,
    });
    router.push('/pricing');
  };

  if (transits.length === 0) {
    return (
      <p className='text-sm text-zinc-400 text-center py-4'>
        No significant transits in the next 30 days
      </p>
    );
  }

  const visibleTransits = hasPaidAccess
    ? transits
    : transits.slice(0, FREE_TRANSIT_LIMIT);
  const lockedTransits = hasPaidAccess
    ? []
    : transits.slice(FREE_TRANSIT_LIMIT);

  return (
    <div className='max-h-96 overflow-y-auto space-y-3'>
      {visibleTransits.map((transit, index) => (
        <TransitCard
          key={index}
          transit={transit}
          impact={
            hasPaidAccess ? matchImpact(transit, personalImpacts) : undefined
          }
          hasPaidAccess={hasPaidAccess}
          onUpgradeClick={handleUpgradeClick}
        />
      ))}

      {lockedTransits.length > 0 &&
        (overflowVariant === 'blurred' ? (
          <div className='relative'>
            <div className='blur-sm opacity-50 select-none pointer-events-none space-y-3'>
              {lockedTransits.slice(0, 2).map((transit, index) => (
                <TransitCard
                  key={`locked-${index}`}
                  transit={transit}
                  hasPaidAccess={false}
                  onUpgradeClick={handleUpgradeClick}
                />
              ))}
            </div>
            <div className='absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/60 to-zinc-950 flex items-end justify-center pb-3'>
              <button
                type='button'
                onClick={handleUpgradeClick}
                className='inline-flex items-center gap-2 rounded-lg border border-lunary-primary-700 bg-zinc-900/80 px-4 py-2 text-xs font-medium text-lunary-primary-300 hover:bg-zinc-900 transition-colors'
              >
                <Sparkles className='w-3 h-3' />
                {ctaCopy.transitList}
                <span className='text-[10px] bg-lunary-primary-900/50 border border-lunary-primary-700/50 px-1.5 py-0.5 rounded'>
                  Lunary+
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className='rounded-lg border border-zinc-700/50 bg-zinc-900/30 p-4 text-center'>
            <p className='text-xs text-zinc-400 mb-3'>
              {lockedTransits.length} more transit
              {lockedTransits.length !== 1 ? 's' : ''} available with personal
              impact insights
            </p>
            <button
              type='button'
              onClick={handleUpgradeClick}
              className='inline-flex items-center gap-2 rounded-lg border border-lunary-primary-700 bg-zinc-900/80 px-4 py-2 text-xs font-medium text-lunary-primary-300 hover:bg-zinc-900 transition-colors'
            >
              <Sparkles className='w-3 h-3' />
              {ctaCopy.transitList}
              <span className='text-[10px] bg-lunary-primary-900/50 border border-lunary-primary-700/50 px-1.5 py-0.5 rounded'>
                Lunary+
              </span>
            </button>
          </div>
        ))}
    </div>
  );
}
