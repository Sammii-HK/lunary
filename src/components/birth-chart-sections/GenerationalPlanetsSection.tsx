'use client';

import { BirthChartData } from '@/utils/astrology/birthChart';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import { bodiesSymbols } from '@/utils/zodiac/zodiac';

interface GenerationalPlanetsSectionProps {
  birthChartData: BirthChartData[];
  getPlanetaryInterpretation: (planet: BirthChartData) => string;
}

export function GenerationalPlanetsSection({
  birthChartData,
  getPlanetaryInterpretation,
}: GenerationalPlanetsSectionProps) {
  const generationalPlanets = birthChartData.filter((planet) =>
    ['Uranus', 'Neptune', 'Pluto'].includes(planet.body),
  );

  if (generationalPlanets.length === 0) return null;

  return (
    <CollapsibleSection
      title='Generational Planets'
      defaultCollapsed={true}
      persistState={true}
    >
      <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {generationalPlanets.map((planet) => {
            const interpretation = getPlanetaryInterpretation(planet);
            return (
              <div
                key={planet.body}
                className='border-l-2 border-lunary-primary-400 pl-3'
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
