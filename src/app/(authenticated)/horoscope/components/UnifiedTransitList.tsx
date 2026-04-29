'use client';

import { useRouter } from 'next/navigation';
import { Sparkles, Lock, ChevronDown } from 'lucide-react';
import dayjs from 'dayjs';
import type { TransitEvent } from '../../../../../utils/astrology/transitCalendar';
import type { PersonalTransitImpact } from '../../../../../utils/astrology/personalTransits';
import type { BirthChartData } from '../../../../../utils/astrology/birthChart';
import { FREE_TRANSIT_LIMIT } from '../../../../../utils/entitlements';
import { useCTACopy } from '@/hooks/useCTACopy';
import { useFeatureFlagVariant } from '@/hooks/useFeatureFlag';
import { captureEvent } from '@/lib/posthog-client';
import { useEffect, useMemo, useState } from 'react';
import { trackCtaImpression } from '@/lib/analytics';
import {
  TransitFilterChips,
  useTransitFilter,
  type TransitFilter,
} from '@/components/horoscope/TransitFilterChips';
import {
  byPersonalImpact,
  rankPersonalImpact,
  type RankableTransit,
  type RankableTransitType,
} from '@/lib/transits/personal-impact-rank';

interface UnifiedTransitListProps {
  transits: TransitEvent[];
  personalImpacts?: PersonalTransitImpact[];
  hasPaidAccess: boolean;
  natalChart?: BirthChartData[];
}

const DEFAULT_VISIBLE_DESKTOP = 8;
const DEFAULT_VISIBLE_MOBILE = 5;
const PERSONAL_IMPACT_THRESHOLD = 30;

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

function normalizeAspectType(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const lower = raw.toLowerCase();
  switch (lower) {
    case 'conjunction':
      return 'Conjunction';
    case 'opposition':
      return 'Opposition';
    case 'square':
      return 'Square';
    case 'trine':
      return 'Trine';
    case 'sextile':
      return 'Sextile';
    default:
      return raw;
  }
}

function classifyTransitType(transit: TransitEvent): RankableTransitType {
  switch (transit.type) {
    case 'aspect':
      return 'aspect';
    case 'sign_change':
      return 'ingress';
    case 'retrograde':
    case 'direct':
      return 'retrograde';
    case 'lunar_phase': {
      const evt = transit.event.toLowerCase();
      if (evt.includes('eclipse')) return 'eclipse';
      return 'lunation';
    }
    default:
      return 'aspect';
  }
}

function deriveOrb(
  transit: TransitEvent,
  impact: PersonalTransitImpact | undefined,
): number | undefined {
  const aspectIntensity = impact?.aspectToNatal?.intensity;
  if (aspectIntensity === undefined) return undefined;
  // intensity = (maxOrb - actualOrb). Use 10 for major aspects, 8 for minor as
  // calculated upstream — approximation is fine for ranking buckets.
  const aspectType = impact?.aspectToNatal?.aspectType?.toLowerCase();
  const max =
    aspectType === 'conjunction' || aspectType === 'opposition' ? 10 : 8;
  const orb = Math.max(0, max - aspectIntensity);
  return orb;
}

function toRankable(
  transit: TransitEvent,
  impact: PersonalTransitImpact | undefined,
): RankableTransit {
  return {
    transitPlanet: transit.planet,
    transitLongitude: 0, // not provided on TransitEvent — kept for type completeness
    natalPlanet: impact?.aspectToNatal?.natalPlanet,
    aspectType: normalizeAspectType(impact?.aspectToNatal?.aspectType),
    orb: deriveOrb(transit, impact),
    date: transit.date.toDate(),
    type: classifyTransitType(transit),
  };
}

function isMajorEvent(transit: TransitEvent): boolean {
  if (
    transit.type === 'lunar_phase' &&
    transit.event.toLowerCase().includes('eclipse')
  ) {
    return true;
  }
  return false;
}

function isMajorAspect(aspectType: string | undefined): boolean {
  if (!aspectType) return false;
  const t = aspectType.toLowerCase();
  return t === 'conjunction' || t === 'opposition' || t === 'square';
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(max-width: 640px)');
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);
  return isMobile;
}

function applyFilter(
  filter: TransitFilter,
  scored: Array<{
    transit: TransitEvent;
    impact?: PersonalTransitImpact;
    score: number;
  }>,
): Array<{
  transit: TransitEvent;
  impact?: PersonalTransitImpact;
  score: number;
}> {
  switch (filter) {
    case 'all':
      return scored;
    case 'personal':
      return scored.filter((s) => s.score > PERSONAL_IMPACT_THRESHOLD);
    case 'major':
      return scored.filter(({ transit, impact }) => {
        if (isMajorEvent(transit)) return true;
        const aspectType = impact?.aspectToNatal?.aspectType;
        return isMajorAspect(aspectType);
      });
    case 'this-week': {
      const now = dayjs();
      const weekFromNow = now.add(7, 'day');
      return scored.filter(
        ({ transit }) =>
          transit.date.isAfter(now.subtract(1, 'day')) &&
          transit.date.isBefore(weekFromNow),
      );
    }
    case 'retrogrades':
      return scored.filter(
        ({ transit }) =>
          transit.type === 'retrograde' || transit.type === 'direct',
      );
    default:
      return scored;
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
    <div className='rounded-lg bg-surface-card/50 p-4'>
      <div className='flex justify-between items-start mb-2'>
        <div>
          <h4 className='font-medium text-content-primary text-sm mb-1'>
            {transit.planet} {transit.event}
          </h4>
          <p className='text-xs text-content-muted'>
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
              ? 'bg-layer-base text-lunary-error-300/90 border border-lunary-error-700'
              : transit.significance === 'medium'
                ? 'bg-layer-base text-content-brand-accent border border-lunary-accent-700'
                : 'bg-layer-base text-content-brand-secondary border border-lunary-secondary-700'
          }`}
        >
          {transit.significance}
        </span>
      </div>

      <p className='text-sm text-content-secondary leading-relaxed'>
        {transit.description}
      </p>

      {hasPaidAccess && impact ? (
        <div className='mt-3 pt-3 border-t border-stroke-default/50 space-y-2'>
          <p className='text-xs text-content-muted leading-relaxed'>
            <span className='font-medium text-content-secondary'>
              Personal Impact:
            </span>{' '}
            {impact.personalImpact}
          </p>
          {impact.actionableGuidance && (
            <div className='bg-surface-card/50 border border-stroke-default/50 rounded p-2'>
              <p className='text-xs text-content-secondary leading-relaxed'>
                <span className='font-medium text-content-primary'>
                  What to do:
                </span>{' '}
                {impact.actionableGuidance}
              </p>
            </div>
          )}
          {impact.aspectToNatal && (
            <p className='text-xs text-content-muted'>
              <span className='font-medium text-content-secondary'>
                Aspect:
              </span>{' '}
              Transit at{' '}
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
        <div className='mt-3 pt-3 border-t border-stroke-default/50'>
          <div className='flex items-center gap-2 mb-1.5'>
            <Lock className='w-3 h-3 text-content-brand' />
            <span className='text-xs font-medium text-content-secondary'>
              Personal Impact
            </span>
            <span className='inline-flex items-center gap-1 text-[10px] bg-layer-base/50 border border-lunary-primary-700/50 px-1.5 py-0.5 rounded text-content-brand'>
              <Sparkles className='w-2.5 h-2.5' />
              Lunary+
            </span>
          </div>
          <p className='text-xs text-content-muted'>
            See how this shift is touching your life and what it means for you.
          </p>
          <button
            type='button'
            onClick={onUpgradeClick}
            className='mt-2 text-xs text-content-brand hover:text-content-secondary transition-colors font-medium'
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
  natalChart = [],
}: UnifiedTransitListProps) {
  const router = useRouter();
  const ctaCopy = useCTACopy();
  const transitLimitVariantRaw = useFeatureFlagVariant('transit-limit-test');
  const transitLimitVariant =
    typeof transitLimitVariantRaw === 'string'
      ? transitLimitVariantRaw
      : 'one-transit';
  const overflowVariantRaw = useFeatureFlagVariant('transit-overflow-style');
  const overflowVariant =
    typeof overflowVariantRaw === 'string' ? overflowVariantRaw : 'blurred';
  const { filter, setFilter } = useTransitFilter();
  const isMobile = useIsMobile();
  const [showAll, setShowAll] = useState(false);

  // Reset expand state on filter change so users always see the curated top set first.
  useEffect(() => {
    setShowAll(false);
  }, [filter]);

  // Score and sort transits once per change to inputs.
  const rankedScored = useMemo(() => {
    return transits
      .map((transit) => {
        const impact = matchImpact(transit, personalImpacts);
        const rankable = toRankable(transit, impact);
        const score = rankPersonalImpact(rankable, natalChart);
        return { transit, impact, score };
      })
      .sort((a, b) => b.score - a.score);
  }, [transits, personalImpacts, natalChart]);

  const filteredScored = useMemo(
    () => applyFilter(filter, rankedScored),
    [filter, rankedScored],
  );

  // Keep `byPersonalImpact` referenced so consumers/tests can swap implementations
  // without us re-deriving a sort. We use rankedScored directly above for perf.
  void byPersonalImpact;

  useEffect(() => {
    if (hasPaidAccess) return;
    if (transits.length <= FREE_TRANSIT_LIMIT) return;

    void trackCtaImpression({
      ctaId: 'transit_limit_lock',
      location: 'horoscope_transit_limit',
      label: ctaCopy.transitList,
      href: '/pricing?nav=app',
      pagePath: '/horoscope',
      abTest: 'transit_limit',
      abVariant: transitLimitVariant,
    });

    void trackCtaImpression({
      ctaId: 'transit_overflow_lock',
      location: 'horoscope_transit_overflow',
      label: ctaCopy.transitList,
      href: '/pricing?nav=app',
      pagePath: '/horoscope',
      abTest: 'transit_overflow',
      abVariant: overflowVariant,
    });
  }, [
    hasPaidAccess,
    transits.length,
    ctaCopy.transitList,
    transitLimitVariant,
    overflowVariant,
  ]);

  const handleUpgradeClick = () => {
    ctaCopy.trackCTAClick('transitList', 'horoscope');
    captureEvent('locked_content_clicked', {
      feature: 'personal_transit_impact',
      tier: 'free',
      transit_limit_variant: transitLimitVariant,
      overflow_variant: overflowVariant,
    });
    router.push('/pricing?nav=app');
  };

  if (transits.length === 0) {
    return (
      <p className='text-sm text-content-muted text-center py-4'>
        No significant transits in the next 30 days
      </p>
    );
  }

  // Apply free-tier gating *after* ranking + filtering so paywalled users see
  // the most relevant items, not the noisiest first-N.
  const sortedTransits = filteredScored.map((s) => s.transit);
  const sortedTransitsForGating = hasPaidAccess
    ? sortedTransits
    : sortedTransits.slice(0, FREE_TRANSIT_LIMIT);
  const lockedTransits = hasPaidAccess
    ? []
    : sortedTransits.slice(FREE_TRANSIT_LIMIT);

  // Cap default render at 8 (desktop) / 5 (mobile) for paid users so the list
  // doesn't feel noisy. Free users are already capped by FREE_TRANSIT_LIMIT.
  const cap = isMobile ? DEFAULT_VISIBLE_MOBILE : DEFAULT_VISIBLE_DESKTOP;
  const canExpand = hasPaidAccess && sortedTransitsForGating.length > cap;
  const visibleTransits =
    !hasPaidAccess || showAll || !canExpand
      ? sortedTransitsForGating
      : sortedTransitsForGating.slice(0, cap);
  const remainingCount = canExpand ? sortedTransitsForGating.length - cap : 0;

  return (
    <div className='space-y-3'>
      <TransitFilterChips filter={filter} onChange={setFilter} />

      {filteredScored.length === 0 ? (
        <p className='text-sm text-content-muted text-center py-4'>
          No transits match this filter — try another option above.
        </p>
      ) : (
        <div className='max-h-96 overflow-y-auto space-y-3'>
          {visibleTransits.map((transit, index) => (
            <TransitCard
              key={`${transit.planet}-${transit.event}-${transit.date.valueOf()}-${index}`}
              transit={transit}
              impact={
                hasPaidAccess
                  ? matchImpact(transit, personalImpacts)
                  : undefined
              }
              hasPaidAccess={hasPaidAccess}
              onUpgradeClick={handleUpgradeClick}
            />
          ))}

          {canExpand && !showAll && (
            <button
              type='button'
              onClick={() => setShowAll(true)}
              tabIndex={0}
              className='w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-stroke-subtle bg-surface-card/30 px-4 py-2.5 text-xs font-medium text-content-primary hover:border-lunary-primary-700/60 hover:text-lunary-primary transition-colors'
            >
              <ChevronDown className='w-3.5 h-3.5' />
              Show all ({remainingCount} more)
            </button>
          )}

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
                <div className='absolute inset-0 bg-gradient-to-b from-surface-base/0 via-surface-base/60 to-surface-base flex items-end justify-center pb-3'>
                  <button
                    type='button'
                    onClick={handleUpgradeClick}
                    className='inline-flex items-center gap-2 rounded-lg border border-lunary-primary-700 bg-surface-elevated/80 px-4 py-2 text-xs font-medium text-content-brand hover:bg-surface-elevated transition-colors'
                  >
                    <Sparkles className='w-3 h-3' />
                    {ctaCopy.transitList}
                    <span className='text-[10px] bg-layer-base/50 border border-lunary-primary-700/50 px-1.5 py-0.5 rounded'>
                      Lunary+
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className='rounded-lg border border-stroke-default/50 bg-surface-elevated/30 p-4 text-center'>
                <p className='text-xs text-content-muted mb-3'>
                  {lockedTransits.length} more transit
                  {lockedTransits.length !== 1 ? 's' : ''} available with
                  personal impact insights
                </p>
                <button
                  type='button'
                  onClick={handleUpgradeClick}
                  className='inline-flex items-center gap-2 rounded-lg border border-lunary-primary-700 bg-surface-elevated/80 px-4 py-2 text-xs font-medium text-content-brand hover:bg-surface-elevated transition-colors'
                >
                  <Sparkles className='w-3 h-3' />
                  {ctaCopy.transitList}
                  <span className='text-[10px] bg-layer-base/50 border border-lunary-primary-700/50 px-1.5 py-0.5 rounded'>
                    Lunary+
                  </span>
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
