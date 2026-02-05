'use client';

import Image from 'next/image';
import { BirthChartData } from '../../../../../utils/astrology/birthChart';
import { getCosmicContextForDate } from '@/lib/cosmic/cosmic-context-utils';
import { PLANET_DAILY_MOTION } from '../../../../../utils/astrology/transit-duration-constants';
import { formatDuration } from '../../../../../utils/astrology/transit-duration';

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
  interpretation: string;
  duration: AspectDuration;
}

const formatDegree = (longitude: number, sign: string): string => {
  const degreeInSign = longitude % 30;
  const wholeDegree = Math.floor(degreeInSign);
  const minutes = Math.floor((degreeInSign - wholeDegree) * 60);
  return `${wholeDegree}°${minutes.toString().padStart(2, '0')}' ${sign}`;
};

const getAspectInterpretation = (
  transitPlanet: string,
  natalPlanet: string,
  aspectType: string,
): string => {
  const transitVerbs: Record<string, string> = {
    Sun: 'is lighting up',
    Moon: 'is stirring',
    Mercury: 'is speaking to',
    Venus: 'is gently lifting',
    Mars: 'is pushing',
    Jupiter: 'is opening doors around',
    Saturn: 'is grounding',
    Uranus: 'is shaking up',
    Neptune: 'is softening',
    Pluto: 'is quietly reshaping',
  };

  const natalThemes: Record<string, string> = {
    Sun: 'your sense of self',
    Moon: 'your emotions',
    Mercury: 'how you think and communicate',
    Venus: 'your relationships',
    Mars: 'your drive and ambition',
    Jupiter: 'your path to growth',
    Saturn: 'your sense of responsibility',
    Uranus: 'your need for freedom',
    Neptune: 'your inner world',
    Pluto: 'your personal power',
    Ascendant: 'how you show up in the world',
    Midheaven: 'your public life and career',
  };

  const verb = transitVerbs[transitPlanet] || 'is influencing';
  const natalTheme =
    natalThemes[natalPlanet] || `your ${natalPlanet.toLowerCase()} energy`;

  return `${transitPlanet} ${verb} ${natalTheme}.`;
};

const calculateAspectsWithDegrees = (
  birthChart: BirthChartData[],
  currentTransits: any[],
): PersonalAspect[] => {
  const aspects: PersonalAspect[] = [];
  const aspectDefinitions = [
    { name: 'conjunction', angle: 0, orb: 10, symbol: '☌' },
    { name: 'opposition', angle: 180, orb: 10, symbol: '☍' },
    { name: 'trine', angle: 120, orb: 8, symbol: '△' },
    { name: 'square', angle: 90, orb: 8, symbol: '□' },
    { name: 'sextile', angle: 60, orb: 6, symbol: '⚹' },
  ];

  for (const transit of currentTransits) {
    for (const natal of birthChart) {
      if (['North Node', 'South Node', 'Chiron', 'Lilith'].includes(natal.body))
        continue;

      let diff = Math.abs(transit.eclipticLongitude - natal.eclipticLongitude);
      if (diff > 180) diff = 360 - diff;

      for (const aspectDef of aspectDefinitions) {
        const orb = Math.abs(diff - aspectDef.angle);
        if (orb <= aspectDef.orb) {
          const dailyMotion =
            PLANET_DAILY_MOTION[
              transit.body as keyof typeof PLANET_DAILY_MOTION
            ] || 1;

          // Determine applying vs separating by estimating yesterday's orb
          const yesterdayLong = transit.eclipticLongitude - dailyMotion;
          let yesterdayDiff = Math.abs(yesterdayLong - natal.eclipticLongitude);
          if (yesterdayDiff > 180) yesterdayDiff = 360 - yesterdayDiff;
          const yesterdayOrb = Math.abs(yesterdayDiff - aspectDef.angle);
          const isApplying = yesterdayOrb > orb;

          const totalDays = (2 * aspectDef.orb) / dailyMotion;
          const remainingDays = isApplying
            ? orb / dailyMotion + aspectDef.orb / dailyMotion
            : (aspectDef.orb - orb) / dailyMotion;

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
            aspectSymbol: aspectDef.symbol,
            orb: Math.round(orb * 10) / 10,
            interpretation: getAspectInterpretation(
              transit.body,
              natal.body,
              aspectDef.name,
            ),
            duration: {
              totalDays,
              remainingDays,
              displayText: formatDuration(remainingDays),
              isApplying,
            },
          });
          break;
        }
      }
    }
  }

  return aspects.sort((a, b) => a.orb - b.orb).slice(0, 8);
};

const getOrbColor = (orb: number): string => {
  if (orb <= 2) return 'text-lunary-success-400';
  if (orb <= 5) return 'text-lunary-accent-300';
  return 'text-zinc-400';
};

const getAspectStyles = (
  aspectType: string,
): { border: string; bg: string; symbol: string; label: string } => {
  const styles: Record<
    string,
    { border: string; bg: string; symbol: string; label: string }
  > = {
    conjunction: {
      border: 'border-lunary-primary-400/40',
      bg: 'bg-lunary-primary-950/40',
      symbol: 'text-lunary-primary-300',
      label: 'text-lunary-primary-200',
    },
    opposition: {
      border: 'border-lunary-error-300/30',
      bg: 'bg-lunary-error-950/30',
      symbol: 'text-lunary-error-300',
      label: 'text-lunary-error-200',
    },
    trine: {
      border: 'border-lunary-success-400/40',
      bg: 'bg-lunary-success-950/40',
      symbol: 'text-lunary-success-300',
      label: 'text-lunary-success-200',
    },
    square: {
      border: 'border-lunary-rose-400/40',
      bg: 'bg-lunary-rose-950/40',
      symbol: 'text-lunary-rose-300',
      label: 'text-lunary-rose-200',
    },
    sextile: {
      border: 'border-lunary-secondary-400/40',
      bg: 'bg-lunary-secondary-950/40',
      symbol: 'text-lunary-secondary-300',
      label: 'text-lunary-secondary-200',
    },
  };
  return (
    styles[aspectType] || {
      border: 'border-zinc-700',
      bg: 'bg-zinc-800/50',
      symbol: 'text-zinc-400',
      label: 'text-zinc-300',
    }
  );
};

const getAspectDescription = (aspectType: string): string => {
  const descriptions: Record<string, string> = {
    conjunction: 'Merging energies',
    opposition: 'Balancing tension',
    trine: 'Flowing harmony',
    square: 'Dynamic challenge',
    sextile: 'Gentle opportunity',
  };
  return descriptions[aspectType] || '';
};

// Calculate which house a planet is in using Whole Sign Houses
const calculateHouseWholeSig = (
  planetLongitude: number,
  ascendantLongitude: number,
): number => {
  const ascendantSign = Math.floor(ascendantLongitude / 30);
  const planetSign = Math.floor(planetLongitude / 30);
  let house = ((planetSign - ascendantSign + 12) % 12) + 1;
  return house;
};

const getMoonInHouseInterpretation = (
  house: number,
  moonPhaseName: string,
): string => {
  const houseInterpretations: Record<number, string> = {
    1: 'Your emotional energy is focused on self-expression and personal identity. This is a powerful time to nurture your sense of self and how you show up in the world.',
    2: 'Your emotions are connected to your values, finances, and sense of security. Focus on what truly matters to you and strengthening your foundation.',
    3: 'Communication and learning are emotionally charged now. This is an ideal time for meaningful conversations, writing, or connecting with siblings and neighbors.',
    4: 'Home, family, and your inner world are highlighted. You may feel a strong need to retreat, nurture your roots, or tend to family matters.',
    5: 'Your heart is drawn to creativity, romance, and joy. This is a beautiful time for self-expression, play, and connecting with what brings you pleasure.',
    6: 'Health, daily routines, and service are in focus. Your emotions guide you toward better habits and caring for your physical and mental well-being.',
    7: 'Relationships and partnerships are emotionally significant now. This is a time to nurture your connections and find balance with others.',
    8: 'Deep transformation, intimacy, and shared resources are highlighted. You may feel drawn to explore emotional depths and strengthen bonds of trust.',
    9: 'Your spirit seeks expansion through travel, learning, or philosophical exploration. This is a time to broaden your horizons and embrace new perspectives.',
    10: 'Career, public life, and your reputation are emotionally important. Your feelings guide your professional path and how you want to be seen in the world.',
    11: 'Community, friendships, and your hopes for the future are highlighted. This is a time to connect with like-minded people and work toward shared dreams.',
    12: 'Rest, solitude, and spiritual connection are calling. This is a powerful time for introspection, healing, and connecting with your subconscious.',
  };
  return (
    houseInterpretations[house] ||
    'Your emotional energy is flowing through an important area of your life.'
  );
};

// Separate component for moon phase (free tier)
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

  // Find the Moon in current transits and calculate which house it's in (paid feature)
  const transitMoon = currentTransits?.find((t) => t.body === 'Moon');
  const ascendant = birthChart?.find((p) => p.body === 'Ascendant');

  let moonHouse: number | null = null;
  let moonHouseInterpretation = '';

  if (showHousePlacement && transitMoon && ascendant) {
    moonHouse = calculateHouseWholeSig(
      transitMoon.eclipticLongitude,
      ascendant.eclipticLongitude,
    );
    moonHouseInterpretation = getMoonInHouseInterpretation(
      moonHouse,
      cosmicContext.moonPhase.name,
    );
  }

  return (
    <div className='rounded-lg border border-lunary-secondary-800 bg-lunary-secondary-950/40 p-4'>
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
            <p className='text-sm font-medium text-lunary-secondary-300'>
              {cosmicContext.moonPhase.name}
            </p>
            {moonHouse && (
              <span className='text-xs px-2 py-0.5 rounded-full bg-lunary-primary-900/50 text-lunary-primary-300 border border-lunary-primary-700/30 font-medium'>
                in your {moonHouse}
                {moonHouse === 1
                  ? 'st'
                  : moonHouse === 2
                    ? 'nd'
                    : moonHouse === 3
                      ? 'rd'
                      : 'th'}{' '}
                house
              </span>
            )}
          </div>
          <div className='flex flex-wrap gap-1.5 mb-2'>
            {cosmicContext.moonPhase.keywords.map((keyword, idx) => (
              <span
                key={idx}
                className='text-xs px-2 py-0.5 rounded-full bg-lunary-secondary-900/50 text-lunary-secondary-400 border border-lunary-secondary-800'
              >
                {keyword}
              </span>
            ))}
          </div>
          {moonHouseInterpretation ? (
            <p className='text-xs text-zinc-300 leading-relaxed mb-2 font-medium'>
              {moonHouseInterpretation}
            </p>
          ) : (
            <p className='text-xs text-zinc-400 leading-relaxed'>
              {cosmicContext.moonPhase.information}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Personal aspects component (paid tier)
export function TodaysAspects({
  birthChart,
  currentTransits,
}: TodaysAspectsProps) {
  if (!birthChart || !currentTransits || birthChart.length === 0) {
    return null;
  }

  const aspects = calculateAspectsWithDegrees(birthChart, currentTransits);

  if (aspects.length === 0) {
    return (
      <div className='text-center py-4'>
        <p className='text-sm text-zinc-400'>
          No significant aspects between today&apos;s transits and your birth
          chart.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      {aspects.map((aspect, index) => {
        const styles = getAspectStyles(aspect.aspectType);
        return (
          <div
            key={index}
            className={`rounded-lg border ${styles.border} ${styles.bg} p-3`}
          >
            <div className='flex items-start gap-3'>
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${styles.bg} border ${styles.border}`}
              >
                <span className={`text-lg ${styles.symbol}`}>
                  {aspect.aspectSymbol}
                </span>
              </div>

              <div className='flex-1 min-w-0'>
                <div className='flex items-center justify-between mb-1'>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`text-sm font-medium capitalize ${styles.label}`}
                    >
                      {aspect.aspectType}
                    </span>
                    <span className='text-xs text-zinc-400'>
                      {getAspectDescription(aspect.aspectType)}
                    </span>
                  </div>
                  <span className={`text-xs ${getOrbColor(aspect.orb)}`}>
                    {aspect.orb}°
                  </span>
                </div>

                <div className='flex items-center gap-2 text-xs mb-2'>
                  <span className='text-zinc-300'>{aspect.transitPlanet}</span>
                  <span className='text-zinc-600'>
                    {aspect.transitDegree.split(' ')[0]}
                  </span>
                  <span className={`${styles.symbol}`}>
                    {aspect.aspectSymbol}
                  </span>
                  <span className='text-zinc-300'>{aspect.natalPlanet}</span>
                  <span className='text-zinc-600'>
                    {aspect.natalDegree.split(' ')[0]}
                  </span>
                </div>

                <div className='flex flex-wrap items-center gap-1.5 mb-2'>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                      aspect.duration.isApplying
                        ? 'bg-lunary-primary-950/60 text-lunary-primary-300 border-lunary-primary-700/50'
                        : 'bg-zinc-900/60 text-zinc-400 border-zinc-700/50'
                    }`}
                  >
                    {aspect.duration.isApplying ? 'Applying' : 'Separating'}
                  </span>
                  <span className='inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border bg-zinc-900 border-zinc-800 text-zinc-400'>
                    {aspect.duration.displayText}
                  </span>
                </div>

                <p className='text-xs text-zinc-400 leading-relaxed'>
                  {aspect.interpretation}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
