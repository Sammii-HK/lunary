'use client';

import { BirthChartData } from '@/utils/astrology/birthChart';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import { bodiesSymbols } from '../../../utils/zodiac/zodiac';

interface PersonalPlanetsSectionProps {
  birthChartData: BirthChartData[];
  getPlanetaryInterpretation: (planet: BirthChartData) => string;
}

export function PersonalPlanetsSection({
  birthChartData,
  getPlanetaryInterpretation,
}: PersonalPlanetsSectionProps) {
  const personalPlanets = birthChartData.filter((planet) =>
    ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'].includes(planet.body),
  );

  if (personalPlanets.length === 0) return null;

  return (
    <CollapsibleSection
      title='Personal Planets'
      defaultCollapsed={true}
      persistState={true}
    >
      <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {personalPlanets.map((planet) => {
            const interpretation = getPlanetaryInterpretation(planet);
            return (
              <div
                key={planet.body}
                className='border-l-2 border-lunary-secondary pl-3'
              >
                <h5 className='text-sm font-medium text-white flex items-center gap-2'>
                  <span className='font-astro text-lg'>
                    {
                      bodiesSymbols[
                        planet.body.toLowerCase() as keyof typeof bodiesSymbols
                      ]
                    }
                  </span>
                  {planet.body} in {planet.sign}
                  {planet.retrograde && (
                    <span className='text-lunary-error text-xs'>℞</span>
                  )}
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
