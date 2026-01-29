'use client';

import { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { BirthChartData } from '../../../../../utils/astrology/birthChart';
import {
  buildTransitDetails,
  TransitAspect,
  TransitDetail,
  IntensityLevel,
  ThemeTag,
} from '@/features/horoscope';
import { useSubscription } from '@/hooks/useSubscription';

interface TransitWisdomProps {
  birthChart: BirthChartData[];
  currentTransits: any[];
  maxItems?: number;
}

const formatDegree = (longitude: number, sign: string): string => {
  const degreeInSign = longitude % 30;
  const wholeDegree = Math.floor(degreeInSign);
  const minutes = Math.floor((degreeInSign - wholeDegree) * 60);
  return `${wholeDegree}°${minutes.toString().padStart(2, '0')}' ${sign}`;
};

function calculateAspectsForWisdom(
  birthChart: BirthChartData[],
  currentTransits: any[],
): TransitAspect[] {
  const aspects: TransitAspect[] = [];
  const aspectDefinitions = [
    { name: 'conjunction', angle: 0, orb: 10 },
    { name: 'opposition', angle: 180, orb: 10 },
    { name: 'trine', angle: 120, orb: 8 },
    { name: 'square', angle: 90, orb: 8 },
    { name: 'sextile', angle: 60, orb: 6 },
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
            orbDegrees: Math.round(orb * 10) / 10,
            house: natal.house,
          });
          break;
        }
      }
    }
  }

  return aspects;
}

const intensityLevelStyles: Record<
  IntensityLevel,
  { bg: string; text: string; border: string }
> = {
  'Life-Defining': {
    bg: 'bg-lunary-error-950/60',
    text: 'text-lunary-error-300',
    border: 'border-lunary-error-700/50',
  },
  'Highly Prominent': {
    bg: 'bg-lunary-accent-950/60',
    text: 'text-lunary-accent-300',
    border: 'border-lunary-accent-700/50',
  },
  Noticeable: {
    bg: 'bg-lunary-success-950/60',
    text: 'text-lunary-success-300',
    border: 'border-lunary-success-700/50',
  },
  Mild: {
    bg: 'bg-zinc-900/60',
    text: 'text-zinc-400',
    border: 'border-zinc-700/50',
  },
};

const themeColors: Record<ThemeTag, string> = {
  Identity: 'bg-amber-900/40 text-amber-300 border-amber-700/40',
  Creativity: 'bg-pink-900/40 text-pink-300 border-pink-700/40',
  Boundaries: 'bg-slate-800/60 text-slate-300 border-slate-600/40',
  Love: 'bg-rose-900/40 text-rose-300 border-rose-700/40',
  Work: 'bg-blue-900/40 text-blue-300 border-blue-700/40',
  Healing: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/40',
  Transformation: 'bg-purple-900/40 text-purple-300 border-purple-700/40',
  Communication: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/40',
  Growth: 'bg-green-900/40 text-green-300 border-green-700/40',
  Intuition: 'bg-indigo-900/40 text-indigo-300 border-indigo-700/40',
  Power: 'bg-red-900/40 text-red-300 border-red-700/40',
  Freedom: 'bg-sky-900/40 text-sky-300 border-sky-700/40',
};

function ThemeTags({ themes }: { themes: ThemeTag[] }) {
  if (!themes || themes.length === 0) return null;

  return (
    <div className='flex flex-wrap gap-1.5'>
      {themes.map((theme) => (
        <span
          key={theme}
          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${themeColors[theme]}`}
        >
          {theme}
        </span>
      ))}
    </div>
  );
}

function PremiumSection({ premium }: { premium: TransitDetail['premium'] }) {
  if (!premium) return null;

  const hasContent =
    premium.houseSummary ||
    premium.natalContext ||
    premium.orbExplanation ||
    premium.timingSummary ||
    premium.stackingNotes ||
    premium.pastPattern;

  if (!hasContent) return null;

  return (
    <div className='pt-3 mt-3 border-t border-zinc-800/50 space-y-2'>
      {premium.houseSummary && (
        <p className='text-xs text-zinc-400'>
          <span className='text-zinc-500'>Where it lands:</span>{' '}
          {premium.houseSummary}
        </p>
      )}
      {premium.natalContext && (
        <p className='text-xs text-zinc-400'>
          <span className='text-zinc-500'>Your personal lens:</span>{' '}
          {premium.natalContext}
        </p>
      )}
      {premium.orbExplanation && (
        <p className='text-xs text-zinc-400'>
          <span className='text-zinc-500'>How close & strong:</span>{' '}
          {premium.orbExplanation}
        </p>
      )}
      {premium.timingSummary && (
        <p className='text-xs text-zinc-400'>
          <span className='text-zinc-500'>Timing:</span> {premium.timingSummary}
        </p>
      )}
      {premium.stackingNotes && (
        <p className='text-xs text-lunary-primary-400/80'>
          <span className='text-lunary-primary-500/80'>Pattern focus:</span>{' '}
          {premium.stackingNotes}
        </p>
      )}
      {premium.pastPattern && (
        <p className='text-xs text-lunary-secondary-400/80'>
          <span className='text-lunary-secondary-500/80'>Transit cycles:</span>{' '}
          {premium.pastPattern}
        </p>
      )}
    </div>
  );
}

function TransitCard({
  detail,
  isPremium,
}: {
  detail: TransitDetail;
  isPremium: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const styles = intensityLevelStyles[detail.intensityLevel];

  const hasPremiumContent =
    detail.premium &&
    (detail.premium.houseSummary ||
      detail.premium.natalContext ||
      detail.premium.orbExplanation ||
      detail.premium.timingSummary ||
      detail.premium.stackingNotes ||
      detail.premium.pastPattern);

  return (
    <div
      className={`rounded-lg border ${styles.border} bg-zinc-900/40 p-4 space-y-3`}
    >
      <div className='flex items-start gap-3'>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${styles.bg} ${styles.text}`}
        >
          {detail.intensityLevel}
        </span>
        <div className='flex-1 min-w-0'>
          <h4 className='text-sm font-medium text-zinc-100 leading-tight'>
            {detail.title}
          </h4>
          <p className='text-xs text-zinc-500 mt-0.5'>{detail.header}</p>
        </div>
      </div>

      <ThemeTags themes={detail.themes} />

      <p className='text-xs text-zinc-500 leading-relaxed'>
        {detail.degreeInfo}
      </p>

      <p className='text-sm text-zinc-300 leading-relaxed'>{detail.meaning}</p>

      {detail.suggestion && (
        <p className='text-xs text-zinc-400 italic'>
          <span className='text-zinc-500'>Try this:</span> {detail.suggestion}
        </p>
      )}

      {hasPremiumContent && (
        <>
          {isPremium ? (
            <>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className='flex items-center gap-1 text-xs text-lunary-primary-400 hover:text-lunary-primary-300 transition-colors'
              >
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
                {isExpanded
                  ? 'Hide technical insight'
                  : 'More technical insight'}
              </button>
              {isExpanded && <PremiumSection premium={detail.premium} />}
            </>
          ) : (
            <div className='pt-2 mt-2 border-t border-zinc-800/30'>
              <Link
                href='/pricing'
                className='text-xs text-zinc-500 hover:text-lunary-primary-400 transition-colors'
              >
                Unlock detailed transit breakdowns with Lunary+
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function TransitWisdom({
  birthChart,
  currentTransits,
  maxItems = 3,
}: TransitWisdomProps) {
  const { hasAccess } = useSubscription();
  const canViewPremium = hasAccess('transit_calendar');

  const aspects = useMemo(
    () => calculateAspectsForWisdom(birthChart, currentTransits),
    [birthChart, currentTransits],
  );

  const details = useMemo(
    () => buildTransitDetails(aspects, { maxItems }),
    [aspects, maxItems],
  );

  if (!birthChart || !currentTransits || birthChart.length === 0) {
    return null;
  }

  if (details.length === 0) {
    return (
      <div className='text-center py-6'>
        <p className='text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto'>
          Nothing major is pulling at your energy today. This is a day to settle
          in and integrate recent shifts rather than push for change.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {details.map((detail) => (
        <TransitCard
          key={detail.id}
          detail={detail}
          isPremium={canViewPremium}
        />
      ))}
    </div>
  );
}
