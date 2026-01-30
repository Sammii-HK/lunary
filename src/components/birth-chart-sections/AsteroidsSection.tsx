'use client';

import { BirthChartData } from '@/utils/astrology/birthChart';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import { astroPointSymbols } from '../../../utils/zodiac/zodiac';

interface AsteroidsSectionProps {
  birthChartData: BirthChartData[];
}

const ASTEROIDS_LIST = [
  'Ceres',
  'Pallas',
  'Juno',
  'Vesta',
  'Hygiea',
  'Pholus',
  'Psyche',
  'Eros',
];

export function AsteroidsSection({ birthChartData }: AsteroidsSectionProps) {
  const asteroidsData = birthChartData.filter((p) =>
    ASTEROIDS_LIST.includes(p.body),
  );

  if (asteroidsData.length === 0) return null;

  return (
    <CollapsibleSection
      title='Asteroids'
      defaultCollapsed={true}
      persistState={true}
    >
      <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {asteroidsData.map((asteroid) => (
            <div
              key={asteroid.body}
              className='border-l-2 border-[#FCD34D] pl-3'
            >
              <h5 className='text-sm font-medium text-white flex items-center gap-2'>
                <span className='font-astro text-lg text-[#FCD34D]'>
                  {
                    astroPointSymbols[
                      asteroid.body.toLowerCase() as keyof typeof astroPointSymbols
                    ]
                  }
                </span>
                {asteroid.body} in {asteroid.sign}
                {asteroid.retrograde && (
                  <span className='text-lunary-error text-xs'>℞</span>
                )}
              </h5>
              <p className='text-xs text-zinc-400 mt-1'>
                {asteroid.degree}°{asteroid.minute}' {asteroid.sign}
              </p>
            </div>
          ))}
        </div>
      </div>
    </CollapsibleSection>
  );
}
