'use client';

import { BirthChartData } from '../../../../utils/astrology/birthChart';

interface TodaysAspectsProps {
  birthChart: BirthChartData[];
  currentTransits: any[];
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
}

const aspectSymbols: Record<string, string> = {
  conjunction: '☌',
  opposition: '☍',
  trine: '△',
  square: '□',
  sextile: '⚹',
};

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
  const transitThemes: Record<string, string> = {
    Sun: 'vitality and identity',
    Moon: 'emotions and intuition',
    Mercury: 'communication and thought',
    Venus: 'love and values',
    Mars: 'drive and action',
    Jupiter: 'expansion and opportunity',
    Saturn: 'discipline and structure',
    Uranus: 'change and innovation',
    Neptune: 'imagination and spirituality',
    Pluto: 'transformation and power',
  };

  const natalThemes: Record<string, string> = {
    Sun: 'your core identity',
    Moon: 'your emotional needs',
    Mercury: 'your thinking patterns',
    Venus: 'your relationships and values',
    Mars: 'your drive and motivation',
    Jupiter: 'your growth and beliefs',
    Saturn: 'your responsibilities',
    Uranus: 'your need for change',
    Neptune: 'your dreams and ideals',
    Pluto: 'your personal power',
    Ascendant: 'how you present yourself',
    Midheaven: 'your public image and career',
  };

  const aspectMeanings: Record<string, string> = {
    conjunction: 'intensifies and merges with',
    opposition: 'creates awareness and balance in',
    trine: 'harmoniously supports',
    square: 'challenges and motivates growth in',
    sextile: 'offers opportunities for',
  };

  const transitTheme =
    transitThemes[transitPlanet] || transitPlanet.toLowerCase() + ' energy';
  const natalTheme = natalThemes[natalPlanet] || `your natal ${natalPlanet}`;
  const aspectMeaning = aspectMeanings[aspectType] || 'influences';

  return `Transit ${transitPlanet}'s ${transitTheme} ${aspectMeaning} ${natalTheme}.`;
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
                  <span className='text-lunary-accent-200'>
                    {aspect.natalPlanet}
                  </span>
                  <span className='text-zinc-600'>
                    {aspect.natalDegree.split(' ')[0]}
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
