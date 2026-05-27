'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { BirthChartData } from '../../../../../utils/astrology/birthChart';
import { getCosmicContextForDate } from '@/lib/cosmic/cosmic-context-utils';
import {
  PLANET_DAILY_MOTION,
  FAST_PLANETS,
} from '../../../../../utils/astrology/transit-duration-constants';
import { formatDuration } from '../../../../../utils/astrology/transit-duration';
import {
  AspectCard,
  ActiveHousesGrid,
  type AspectCardData,
  buildAspectSentence,
  buildContextCopy,
  getAspectGlyph,
  getOrdinalSuffix,
} from '@/components/aspects/AspectCard';

interface TodaysAspectsProps {
  birthChart: BirthChartData[];
  currentTransits: any[];
}

interface AspectDuration {
  totalDays: number;
  remainingDays: number;
  displayText: string;
  isApplying: boolean;
}

interface PersonalAspect {
  transitPlanet: string;
  transitSign: string;
  transitDegree: string;
  natalPlanet: string;
  natalSign: string;
  natalDegree: string;
  aspectType: string;
  aspectSymbol: string;
  orb: number;
  house: number | null;
  natalHouse: number | null;
  sentence: string;
  contextCopy: string;
  duration: AspectDuration;
  /** Human-readable exact date label e.g. "peaks today", "peaked 25 May" */
  exactDateLabel: string;
}

// ── Orb thresholds keyed by planet speed ─────────────────────────────────────
// Fast planets (Moon–Mars): 2° — they move quickly so 2° = days away, good for time awareness
// Slow planets (Jupiter–Pluto): 1° — they move slowly so even 1° can span weeks/months
const ASPECT_ORB = (planet: string): number =>
  (FAST_PLANETS as readonly string[]).includes(planet) ? 2 : 1;

const ASPECT_ANGLES = [
  { name: 'conjunction', angle: 0 },
  { name: 'opposition', angle: 180 },
  { name: 'trine', angle: 120 },
  { name: 'square', angle: 90 },
  { name: 'sextile', angle: 60 },
] as const;

const formatExactDate = (date: Date): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return 'peaks today';
  if (diffDays === 1) return 'peaks tomorrow';
  if (diffDays === -1) return 'peaked yesterday';
  if (diffDays > 0)
    return `peaks ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
  return `peaked ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
};

const formatDegree = (longitude: number, sign: string): string => {
  const degreeInSign = longitude % 30;
  const wholeDegree = Math.floor(degreeInSign);
  const minutes = Math.floor((degreeInSign - wholeDegree) * 60);
  return `${wholeDegree}°${minutes.toString().padStart(2, '0')}'`;
};

// ── Aspect calculation ────────────────────────────────────────────────────────
const calculateHouseWholeSig = (
  planetLongitude: number,
  ascendantLongitude: number,
): number => {
  const ascendantSign = Math.floor(ascendantLongitude / 30);
  const planetSign = Math.floor(planetLongitude / 30);
  return ((planetSign - ascendantSign + 12) % 12) + 1;
};

const calculateAspectsWithDegrees = (
  birthChart: BirthChartData[],
  currentTransits: any[],
): PersonalAspect[] => {
  const aspects: PersonalAspect[] = [];

  // Prefer Ascendant for house calculation (whole-sign from rising degree).
  // Fall back to the Sun's sign as reference if Ascendant is absent or has
  // an invalid eclipticLongitude — matches the server-side analysis.ts logic
  // which also uses Sun as a fallback so houses are always shown.
  const ascendantEntry = birthChart.find((p) => p.body === 'Ascendant');
  const sunEntry = birthChart.find((p) => p.body === 'Sun');
  const referenceEntry = Number.isFinite(ascendantEntry?.eclipticLongitude)
    ? ascendantEntry
    : sunEntry;
  const ascendantLong = referenceEntry?.eclipticLongitude;
  const hasAscendant = Number.isFinite(ascendantLong);

  for (const transit of currentTransits) {
    if (!Number.isFinite(transit.eclipticLongitude)) continue;

    const maxOrb = ASPECT_ORB(transit.body);
    const dailyMotion =
      PLANET_DAILY_MOTION[transit.body as keyof typeof PLANET_DAILY_MOTION] ||
      1;

    const transitHouse = hasAscendant
      ? calculateHouseWholeSig(transit.eclipticLongitude, ascendantLong!)
      : null;

    for (const natal of birthChart) {
      if (['North Node', 'South Node', 'Chiron', 'Lilith'].includes(natal.body))
        continue;
      if (!Number.isFinite(natal.eclipticLongitude)) continue;

      const natalHouse = hasAscendant
        ? calculateHouseWholeSig(natal.eclipticLongitude, ascendantLong!)
        : (natal.house ?? null);

      let diff = Math.abs(transit.eclipticLongitude - natal.eclipticLongitude);
      if (diff > 180) diff = 360 - diff;

      for (const aspectDef of ASPECT_ANGLES) {
        const orb = Math.abs(diff - aspectDef.angle);
        if (orb <= maxOrb) {
          // Determine direction: was yesterday's orb larger? → applying
          const yesterdayLong = transit.eclipticLongitude - dailyMotion;
          let yesterdayDiff = Math.abs(yesterdayLong - natal.eclipticLongitude);
          if (yesterdayDiff > 180) yesterdayDiff = 360 - yesterdayDiff;
          const yesterdayOrb = Math.abs(yesterdayDiff - aspectDef.angle);
          const isApplying = yesterdayOrb > orb;

          // Exact (peak) date: orb reaches 0
          const daysToExact = orb / dailyMotion;
          const now = new Date();
          const exactDate = new Date(
            now.getTime() +
              (isApplying ? daysToExact : -daysToExact) * 24 * 60 * 60 * 1000,
          );

          const remainingDays = isApplying
            ? daysToExact
            : (maxOrb - orb) / dailyMotion;
          const totalDays = (2 * maxOrb) / dailyMotion;

          aspects.push({
            transitPlanet: transit.body,
            transitSign: transit.sign,
            transitDegree: formatDegree(
              transit.eclipticLongitude,
              transit.sign,
            ),
            natalPlanet: natal.body,
            natalSign: natal.sign,
            natalDegree: formatDegree(natal.eclipticLongitude, natal.sign),
            aspectType: aspectDef.name,
            aspectSymbol: getAspectGlyph(aspectDef.name),
            orb: Math.round(orb * 100) / 100,
            house: transitHouse,
            natalHouse,
            sentence: buildAspectSentence(
              transit.body,
              transit.sign,
              natal.body,
              natal.sign,
              aspectDef.name,
              transitHouse,
              natalHouse,
            ),
            contextCopy: buildContextCopy(transit.body, transit.sign),
            duration: {
              totalDays,
              remainingDays,
              displayText: formatDuration(remainingDays),
              isApplying,
            },
            exactDateLabel: formatExactDate(exactDate),
          });
          break;
        }
      }
    }
  }

  return aspects.sort((a, b) => a.orb - b.orb);
};

// ── Moon phase card (free tier) ───────────────────────────────────────────────
const getMoonInHouseInterpretation = (house: number): string => {
  const houseInterpretations: Record<number, string> = {
    1: 'Your emotional energy is focused on self-expression and personal identity. This is a powerful time to nurture your sense of self and how you show up in the world.',
    2: 'Your emotions are connected to your values, finances, and sense of security. Focus on what truly matters to you and strengthening your foundation.',
    3: 'Communication and learning are emotionally charged now. An ideal time for meaningful conversations, writing, or connecting with siblings and neighbours.',
    4: 'Home, family, and your inner world are highlighted. You may feel a strong need to retreat, nurture your roots, or tend to family matters.',
    5: 'Your heart is drawn to creativity, romance, and joy. A beautiful time for self-expression, play, and connecting with what brings you pleasure.',
    6: 'Health, daily routines, and service are in focus. Your emotions guide you toward better habits and caring for your physical and mental wellbeing.',
    7: 'Relationships and partnerships are emotionally significant now. A time to nurture your connections and find balance with others.',
    8: 'Deep transformation, intimacy, and shared resources are highlighted. You may feel drawn to explore emotional depths and strengthen bonds of trust.',
    9: 'Your spirit seeks expansion through travel, learning, or philosophical exploration. A time to broaden your horizons and embrace new perspectives.',
    10: 'Career, public life, and your reputation are emotionally important. Your feelings guide your professional path and how you want to be seen in the world.',
    11: 'Community, friendships, and your hopes for the future are highlighted. A time to connect with like-minded people and work toward shared dreams.',
    12: 'Rest, solitude, and spiritual connection are calling. A powerful time for introspection, healing, and connecting with your subconscious.',
  };
  return (
    houseInterpretations[house] ??
    'Your emotional energy is flowing through an important area of your life.'
  );
};

export function MoonPhaseCard({
  birthChart,
  currentTransits,
  showHousePlacement = false,
}: {
  birthChart?: BirthChartData[];
  currentTransits?: any[];
  showHousePlacement?: boolean;
}) {
  const cosmicContext = getCosmicContextForDate(new Date());
  const transitMoon = currentTransits?.find((t) => t.body === 'Moon');
  const ascendant = birthChart?.find((p) => p.body === 'Ascendant');

  let moonHouse: number | null = null;
  let moonHouseInterpretation = '';

  if (showHousePlacement && transitMoon && ascendant) {
    moonHouse = calculateHouseWholeSig(
      transitMoon.eclipticLongitude,
      ascendant.eclipticLongitude,
    );
    moonHouseInterpretation = getMoonInHouseInterpretation(moonHouse);
  }

  return (
    <div className='rounded-lg border border-lunary-secondary-800 bg-layer-deep/40 p-4'>
      <div className='flex items-start gap-3'>
        <Image
          src={cosmicContext.moonPhase.icon.src}
          alt={cosmicContext.moonPhase.icon.alt}
          width={48}
          height={48}
          className='flex-shrink-0'
        />
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-1'>
            <p className='text-sm font-medium text-content-brand-secondary'>
              {cosmicContext.moonPhase.name}
            </p>
            {moonHouse && (
              <span className='text-xs px-2 py-0.5 rounded-full bg-layer-base/50 text-content-brand border border-lunary-primary-700/30 font-medium'>
                in your {moonHouse}
                {getOrdinalSuffix(moonHouse)} house
              </span>
            )}
          </div>
          <div className='flex flex-wrap gap-1.5 mb-2'>
            {cosmicContext.moonPhase.keywords.map((keyword, idx) => (
              <span
                key={idx}
                className='text-xs px-2 py-0.5 rounded-full bg-layer-base/50 text-lunary-secondary-400 border border-lunary-secondary-800'
              >
                {keyword}
              </span>
            ))}
          </div>
          {moonHouseInterpretation ? (
            <p className='text-xs text-content-secondary leading-relaxed mb-2 font-medium'>
              {moonHouseInterpretation}
            </p>
          ) : (
            <p className='text-xs text-content-muted leading-relaxed'>
              {cosmicContext.moonPhase.information}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helper: map raw PersonalAspect → AspectCardData ──────────────────────────
function toCardData(a: PersonalAspect): AspectCardData {
  return {
    aspectType: a.aspectType,
    aspectGlyph: a.aspectSymbol,
    orb: a.orb,
    transitPlanet: a.transitPlanet,
    transitSign: a.transitSign,
    transitDegree: a.transitDegree,
    natalPlanet: a.natalPlanet,
    natalSign: a.natalSign,
    natalDegree: a.natalDegree,
    transitHouse: a.house,
    natalHouse: a.natalHouse,
    sentence: a.sentence,
    contextCopy: a.contextCopy,
    duration: {
      displayText: a.duration.displayText,
      isApplying: a.duration.isApplying,
    },
    exactDateLabel: a.exactDateLabel,
  };
}

// ── AspectsTeaser (free tier) — shows top-1 real aspect + upgrade wall ────────
export function AspectsTeaser({
  birthChart,
  currentTransits,
}: TodaysAspectsProps) {
  const cardData = useMemo(() => {
    if (!birthChart || !currentTransits || birthChart.length === 0) return [];
    return calculateAspectsWithDegrees(birthChart, currentTransits).map(
      toCardData,
    );
  }, [birthChart, currentTransits]);

  if (cardData.length === 0) return null;

  const top = cardData[0];
  const remaining = cardData.length - 1;
  const previewCards = cardData.slice(1, 3);

  return (
    <div className='space-y-2'>
      <ActiveHousesGrid aspects={cardData} />
      <AspectCard aspect={top} />
      {remaining > 0 && (
        <div className='relative'>
          <div className='filter blur-sm opacity-50 pointer-events-none space-y-2'>
            {previewCards.map((aspect, i) => (
              <AspectCard key={i} aspect={aspect} />
            ))}
          </div>
          <div className='absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-transparent via-surface-base/70 to-surface-base rounded-lg'>
            <span className='inline-flex items-center gap-1 text-[10px] bg-layer-base/50 border border-lunary-primary-700/50 px-2 py-0.5 rounded text-content-brand'>
              <Sparkles className='w-2.5 h-2.5' />
              Lunary+
            </span>
            <Link
              href='/pricing?nav=app'
              className='inline-flex items-center gap-2 rounded-lg border border-lunary-primary-700 bg-surface-elevated/80 px-4 py-2 text-xs font-medium text-content-brand hover:bg-surface-elevated transition-colors'
            >
              <Sparkles className='w-3 h-3' />
              See {remaining} more aspect{remaining !== 1 ? 's' : ''}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Personal aspects component (paid tier) ────────────────────────────────────
export function TodaysAspects({
  birthChart,
  currentTransits,
}: TodaysAspectsProps) {
  // Memoised so aspect calculation only reruns when chart/transit data actually changes
  const cardData = useMemo<AspectCardData[]>(() => {
    if (!birthChart || !currentTransits || birthChart.length === 0) return [];
    return calculateAspectsWithDegrees(birthChart, currentTransits).map(
      toCardData,
    );
  }, [birthChart, currentTransits]);

  if (!birthChart || birthChart.length === 0) return null;

  if (cardData.length === 0) {
    return (
      <div className='text-center py-4'>
        <p className='text-sm text-content-muted'>
          No significant aspects between today&apos;s transits and your birth
          chart.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      <ActiveHousesGrid aspects={cardData} />
      {cardData.map((aspect, index) => (
        <AspectCard key={index} aspect={aspect} />
      ))}
    </div>
  );
}
