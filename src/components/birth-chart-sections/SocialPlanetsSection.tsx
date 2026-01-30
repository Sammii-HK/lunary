'use client';

import { BirthChartData } from '@/utils/astrology/birthChart';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import { bodiesSymbols } from '../../../utils/zodiac/zodiac';

interface SocialPlanetsSectionProps {
  birthChartData: BirthChartData[];
  getPlanetaryInterpretation: (planet: BirthChartData) => string;
  getPlanetDignityStatus?: (
    planetName: string,
    sign: string,
  ) => 'rulership' | 'exaltation' | 'detriment' | 'fall' | null;
}

export function SocialPlanetsSection({
  birthChartData,
  getPlanetaryInterpretation,
  getPlanetDignityStatus,
}: SocialPlanetsSectionProps) {
  const socialPlanets = birthChartData.filter((planet) =>
    ['Jupiter', 'Saturn'].includes(planet.body),
  );

  if (socialPlanets.length === 0) return null;

  const getDignityBadge = (
    status: 'rulership' | 'exaltation' | 'detriment' | 'fall' | null,
  ) => {
    if (!status) return null;

    const badges = {
      rulership: {
        label: 'Rulership',
        className: 'bg-green-500/20 text-green-300 border-green-500/40',
        icon: '✦',
      },
      exaltation: {
        label: 'Exalted',
        className: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        icon: '★',
      },
      detriment: {
        label: 'Detriment',
        className: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        icon: '⚠',
      },
      fall: {
        label: 'Fall',
        className: 'bg-red-500/20 text-red-300 border-red-500/40',
        icon: '▼',
      },
    };

    const badge = badges[status];
    return (
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded border ${badge.className} flex items-center gap-0.5`}
      >
        <span className='text-[9px]'>{badge.icon}</span>
        {badge.label}
      </span>
    );
  };

  return (
    <CollapsibleSection
      title='Social Planets'
      defaultCollapsed={true}
      persistState={true}
    >
      <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {socialPlanets.map((planet) => {
            const interpretation = getPlanetaryInterpretation(planet);
            const dignityStatus = getPlanetDignityStatus?.(
              planet.body,
              planet.sign,
            );

            return (
              <div
                key={planet.body}
                className='border-l-2 border-lunary-accent pl-3'
              >
                <h5 className='text-sm font-medium text-white flex items-center gap-2 flex-wrap'>
                  <span className='font-astro text-lg'>
                    {
                      bodiesSymbols[
                        planet.body.toLowerCase() as keyof typeof bodiesSymbols
                      ]
                    }
                  </span>
                  <span>
                    {planet.body} in {planet.sign}
                  </span>
                  {planet.retrograde && (
                    <span className='text-lunary-error text-xs'>℞</span>
                  )}
                  {dignityStatus && getDignityBadge(dignityStatus)}
                </h5>
                <p className='text-xs text-zinc-300 mt-1'>{interpretation}</p>
              </div>
            );
          })}
        </div>
      </div>
    </CollapsibleSection>
  );
}
