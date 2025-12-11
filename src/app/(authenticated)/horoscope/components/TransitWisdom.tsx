'use client';

import { BirthChartData } from '../../../../../utils/astrology/birthChart';
import {
  buildTransitDetails,
  TransitAspect,
  TransitDetail,
} from '@/features/horoscope';

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
          });
          break;
        }
      }
    }
  }

  return aspects;
}

const intensityStyles: Record<
  TransitDetail['intensity'],
  { bg: string; text: string; border: string }
> = {
  Exact: {
    bg: 'bg-lunary-success-950/60',
    text: 'text-lunary-success-300',
    border: 'border-lunary-success-700/50',
  },
  Strong: {
    bg: 'bg-lunary-accent-950/60',
    text: 'text-lunary-accent-300',
    border: 'border-lunary-accent-700/50',
  },
  Subtle: {
    bg: 'bg-zinc-900/60',
    text: 'text-zinc-400',
    border: 'border-zinc-700/50',
  },
};

function TransitCard({ detail }: { detail: TransitDetail }) {
  const styles = intensityStyles[detail.intensity];

  return (
    <div
      className={`rounded-lg border ${styles.border} bg-zinc-900/40 p-4 space-y-3`}
    >
      <div className='flex items-start gap-3'>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles.bg} ${styles.text}`}
        >
          {detail.intensity}
        </span>
        <div className='flex-1 min-w-0'>
          <h4 className='text-sm font-medium text-zinc-100 leading-tight'>
            {detail.title}
          </h4>
          <p className='text-xs text-zinc-500 mt-0.5'>{detail.header}</p>
        </div>
      </div>

      <p className='text-xs text-zinc-500 leading-relaxed'>
        {detail.degreeInfo}
      </p>

      <p className='text-sm text-zinc-300 leading-relaxed'>{detail.meaning}</p>

      {detail.suggestion && (
        <p className='text-xs text-zinc-400 italic'>
          <span className='text-zinc-500'>Try this:</span> {detail.suggestion}
        </p>
      )}
    </div>
  );
}

export function TransitWisdom({
  birthChart,
  currentTransits,
  maxItems = 3,
}: TransitWisdomProps) {
  if (!birthChart || !currentTransits || birthChart.length === 0) {
    return null;
  }

  const aspects = calculateAspectsForWisdom(birthChart, currentTransits);
  const details = buildTransitDetails(aspects, { maxItems });

  if (details.length === 0) {
    return (
      <div className='text-center py-6'>
        <p className='text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto'>
          No major transits are making tight aspects to your natal chart today.
          This is a day to integrate recent shifts rather than push for change.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {details.map((detail) => (
        <TransitCard key={detail.id} detail={detail} />
      ))}
    </div>
  );
}
