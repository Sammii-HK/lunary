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

const ASTEROID_INTERPRETATIONS: Record<string, string> = {
  Ceres:
    'Represents nurturing, motherhood, and how you care for others. Shows your relationship with food, nature, and the cycles of growth and loss.',
  Pallas:
    'Symbolizes wisdom, strategy, and creative intelligence. Reflects your ability to see patterns, solve problems, and bring justice to situations.',
  Juno: 'Governs partnership, marriage, and committed relationships. Reveals what you need in a long-term partner and how you approach commitment.',
  Vesta:
    'Represents sacred dedication, focus, and where you direct your devotional energy. Shows what you hold sacred and your capacity for concentrated work.',
  Hygiea:
    'Rules health, wellness, and preventive care. Indicates your approach to physical and mental wellbeing, and where healing comes naturally.',
  Pholus:
    'Represents catalysts and turning points. Small actions that lead to big consequences. Shows where small causes create major effects in your life.',
  Psyche:
    'Symbolizes the soul, mental essence, and psychological growth. Represents your journey toward self-awareness and soul-level connections.',
  Eros: 'Governs erotic love, passion, and creative life force. Shows what turns you on at a soul level and where you experience deep desire.',
};

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
          {asteroidsData.map((asteroid) => {
            const symbol =
              astroPointSymbols[
                asteroid.body.toLowerCase() as keyof typeof astroPointSymbols
              ];
            return (
              <div
                key={asteroid.body}
                className='border-l-2 border-[#FCD34D] pl-3'
              >
                <h5 className='text-sm font-medium text-white flex items-center gap-2'>
                  <span className='text-lg text-[#FCD34D]'>{symbol}</span>
                  {asteroid.body} in {asteroid.sign}
                  {asteroid.retrograde && (
                    <span className='text-lunary-error text-xs'>℞</span>
                  )}
                </h5>
                <p className='text-xs text-zinc-400 mt-1'>
                  {asteroid.degree}°{asteroid.minute}' {asteroid.sign}
                </p>
                <p className='text-xs text-zinc-300 mt-1.5'>
                  {ASTEROID_INTERPRETATIONS[asteroid.body]}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </CollapsibleSection>
  );
}
