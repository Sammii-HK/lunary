import { BirthChartData } from '../../../utils/astrology/birthChart';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import {
  astroPointSymbols,
  zodiacSymbol,
  astrologicalPoints,
} from '../../../utils/zodiac/zodiac';

interface SensitivePointsSectionProps {
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

export function SensitivePointsSection({
  birthChartData,
}: SensitivePointsSectionProps) {
  const midheaven = birthChartData.find((p) => p.body === 'Midheaven');
  const imumCoeli = birthChartData.find((p) => p.body === 'Imum Coeli');
  const northNode = birthChartData.find((p) => p.body === 'North Node');
  const southNode = birthChartData.find((p) => p.body === 'South Node');
  const chiron = birthChartData.find((p) => p.body === 'Chiron');
  const lilith = birthChartData.find((p) => p.body === 'Lilith');
  const descendant = birthChartData.find((p) => p.body === 'Descendant');
  const partOfFortune = birthChartData.find(
    (p) => p.body === 'Part of Fortune',
  );
  const partOfSpirit = birthChartData.find((p) => p.body === 'Part of Spirit');
  const vertex = birthChartData.find((p) => p.body === 'Vertex');
  const antiVertex = birthChartData.find((p) => p.body === 'Anti-Vertex');
  const eastPoint = birthChartData.find((p) => p.body === 'East Point');
  const asteroidsData = birthChartData.filter((p) =>
    ASTEROIDS_LIST.includes(p.body),
  );

  const hasPoints =
    midheaven ||
    imumCoeli ||
    descendant ||
    northNode ||
    southNode ||
    chiron ||
    lilith ||
    partOfFortune ||
    partOfSpirit ||
    vertex ||
    antiVertex ||
    eastPoint ||
    asteroidsData.length > 0;

  if (!hasPoints) return null;

  return (
    <CollapsibleSection
      title='Sensitive Points'
      defaultCollapsed={true}
      persistState={true}
    >
      <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {midheaven && (
            <div className='border-l-2 border-lunary-highlight pl-3'>
              <h5 className='text-sm font-medium text-white flex items-center gap-2'>
                <span className='font-astro text-lg text-lunary-highlight'>
                  {astroPointSymbols.midheaven}
                </span>
                Midheaven in {midheaven.sign}
                <span className='font-astro text-zinc-400'>
                  {
                    zodiacSymbol[
                      midheaven.sign.toLowerCase() as keyof typeof zodiacSymbol
                    ]
                  }
                </span>
              </h5>
              <p className='text-xs text-zinc-300 mt-1'>
                {astrologicalPoints.midheaven.mysticalProperties}
              </p>
            </div>
          )}
          {imumCoeli && (
            <div className='border-l-2 border-lunary-highlight pl-3'>
              <h5 className='text-sm font-medium text-white flex items-center gap-2'>
                <span className='font-astro text-lg text-lunary-highlight'>
                  {astroPointSymbols.imumcoeli}
                </span>
                Imum Coeli in {imumCoeli.sign}
                <span className='font-astro text-zinc-400'>
                  {
                    zodiacSymbol[
                      imumCoeli.sign.toLowerCase() as keyof typeof zodiacSymbol
                    ]
                  }
                </span>
              </h5>
              <p className='text-xs text-zinc-300 mt-1'>
                {astrologicalPoints.imumcoeli.mysticalProperties}
              </p>
            </div>
          )}
          {descendant && (
            <div className='border-l-2 border-lunary-primary-400 pl-3'>
              <h5 className='text-sm font-medium text-white flex items-center gap-2'>
                <span className='font-astro text-lg text-lunary-primary-400'>
                  {astroPointSymbols.descendant}
                </span>
                Descendant in {descendant.sign}
                <span className='font-astro text-zinc-400'>
                  {
                    zodiacSymbol[
                      descendant.sign.toLowerCase() as keyof typeof zodiacSymbol
                    ]
                  }
                </span>
              </h5>
              <p className='text-xs text-zinc-300 mt-1'>
                {astrologicalPoints.descendant.mysticalProperties}
              </p>
            </div>
          )}
          {northNode && (
            <div className='border-l-2 border-emerald-500 pl-3'>
              <h5 className='text-sm font-medium text-white flex items-center gap-2'>
                <span className='font-astro text-lg text-emerald-400'>
                  {astroPointSymbols.northnode}
                </span>
                North Node in {northNode.sign}
                <span className='font-astro text-zinc-400'>
                  {
                    zodiacSymbol[
                      northNode.sign.toLowerCase() as keyof typeof zodiacSymbol
                    ]
                  }
                </span>
              </h5>
              <p className='text-xs text-zinc-300 mt-1'>
                {astrologicalPoints.northnode.mysticalProperties}
              </p>
            </div>
          )}
          {southNode && (
            <div className='border-l-2 border-violet-500 pl-3'>
              <h5 className='text-sm font-medium text-white flex items-center gap-2'>
                <span className='font-astro text-lg text-violet-400'>
                  {astroPointSymbols.southnode}
                </span>
                South Node in {southNode.sign}
                <span className='font-astro text-zinc-400'>
                  {
                    zodiacSymbol[
                      southNode.sign.toLowerCase() as keyof typeof zodiacSymbol
                    ]
                  }
                </span>
              </h5>
              <p className='text-xs text-zinc-300 mt-1'>
                {astrologicalPoints.southnode.mysticalProperties}
              </p>
            </div>
          )}
          {chiron && (
            <div className='border-l-2 border-amber-500 pl-3'>
              <h5 className='text-sm font-medium text-white flex items-center gap-2'>
                <span className='font-astro text-lg text-amber-400'>
                  {astroPointSymbols.chiron}
                </span>
                Chiron in {chiron.sign}
                <span className='font-astro text-zinc-400'>
                  {
                    zodiacSymbol[
                      chiron.sign.toLowerCase() as keyof typeof zodiacSymbol
                    ]
                  }
                </span>
              </h5>
              <p className='text-xs text-zinc-300 mt-1'>
                {astrologicalPoints.chiron.mysticalProperties}
              </p>
            </div>
          )}
          {lilith && (
            <div className='border-l-2 border-fuchsia-500 pl-3'>
              <h5 className='text-sm font-medium text-white flex items-center gap-2'>
                <span className='font-astro text-lg text-fuchsia-400'>
                  {astroPointSymbols.lilith}
                </span>
                Lilith in {lilith.sign}
                <span className='font-astro text-zinc-400'>
                  {
                    zodiacSymbol[
                      lilith.sign.toLowerCase() as keyof typeof zodiacSymbol
                    ]
                  }
                </span>
              </h5>
              <p className='text-xs text-zinc-300 mt-1'>
                {astrologicalPoints.lilith.mysticalProperties}
              </p>
            </div>
          )}
          {partOfFortune && (
            <div className='border-l-2 border-lunary-accent pl-3'>
              <h5 className='text-sm font-medium text-white flex items-center gap-2'>
                <span className='font-astro text-lg text-lunary-accent'>
                  {astroPointSymbols.partoffortune}
                </span>
                Part of Fortune in {partOfFortune.sign}
                <span className='font-astro text-zinc-400'>
                  {
                    zodiacSymbol[
                      partOfFortune.sign.toLowerCase() as keyof typeof zodiacSymbol
                    ]
                  }
                </span>
              </h5>
              <p className='text-xs text-zinc-300 mt-1'>
                {astrologicalPoints.partoffortune.mysticalProperties}
              </p>
            </div>
          )}
          {partOfSpirit && (
            <div className='border-l-2 border-lunary-accent pl-3'>
              <h5 className='text-sm font-medium text-white flex items-center gap-2'>
                <span className='font-astro text-lg text-lunary-accent'>
                  {astroPointSymbols.partofspirit}
                </span>
                Part of Spirit in {partOfSpirit.sign}
                <span className='font-astro text-zinc-400'>
                  {
                    zodiacSymbol[
                      partOfSpirit.sign.toLowerCase() as keyof typeof zodiacSymbol
                    ]
                  }
                </span>
              </h5>
              <p className='text-xs text-zinc-300 mt-1'>
                {astrologicalPoints.partofspirit.mysticalProperties}
              </p>
            </div>
          )}
          {vertex && (
            <div className='border-l-2 border-cyan-500 pl-3'>
              <h5 className='text-sm font-medium text-white flex items-center gap-2'>
                <span className='font-astro text-lg text-cyan-400'>
                  {astroPointSymbols.vertex}
                </span>
                Vertex in {vertex.sign}
                <span className='font-astro text-zinc-400'>
                  {
                    zodiacSymbol[
                      vertex.sign.toLowerCase() as keyof typeof zodiacSymbol
                    ]
                  }
                </span>
              </h5>
              <p className='text-xs text-zinc-300 mt-1'>
                {astrologicalPoints.vertex.mysticalProperties}
              </p>
            </div>
          )}
          {antiVertex && (
            <div className='border-l-2 border-cyan-500 pl-3'>
              <h5 className='text-sm font-medium text-white flex items-center gap-2'>
                <span className='font-astro text-lg text-cyan-400'>
                  {astroPointSymbols.antivertex}
                </span>
                Anti-Vertex in {antiVertex.sign}
                <span className='font-astro text-zinc-400'>
                  {
                    zodiacSymbol[
                      antiVertex.sign.toLowerCase() as keyof typeof zodiacSymbol
                    ]
                  }
                </span>
              </h5>
              <p className='text-xs text-zinc-300 mt-1'>
                {astrologicalPoints.antivertex.mysticalProperties}
              </p>
            </div>
          )}
          {eastPoint && (
            <div className='border-l-2 border-cyan-500 pl-3'>
              <h5 className='text-sm font-medium text-white flex items-center gap-2'>
                <span className='font-astro text-lg text-cyan-400'>
                  {astroPointSymbols.eastpoint}
                </span>
                East Point in {eastPoint.sign}
                <span className='font-astro text-zinc-400'>
                  {
                    zodiacSymbol[
                      eastPoint.sign.toLowerCase() as keyof typeof zodiacSymbol
                    ]
                  }
                </span>
              </h5>
              <p className='text-xs text-zinc-300 mt-1'>
                {astrologicalPoints.eastpoint.mysticalProperties}
              </p>
            </div>
          )}
          {asteroidsData.map((asteroid) => {
            const asteroidKey =
              asteroid.body.toLowerCase() as keyof typeof astrologicalPoints;
            const asteroidInfo = astrologicalPoints[asteroidKey];
            return (
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
                  <span className='font-astro text-zinc-400'>
                    {
                      zodiacSymbol[
                        asteroid.sign.toLowerCase() as keyof typeof zodiacSymbol
                      ]
                    }
                  </span>
                  {asteroid.retrograde && (
                    <span className='text-lunary-error text-xs'>℞</span>
                  )}
                </h5>
                <p className='text-xs text-zinc-400 mt-1'>
                  {asteroid.degree}°{asteroid.minute}' {asteroid.sign}
                </p>
                {asteroidInfo?.mysticalProperties && (
                  <p className='text-xs text-zinc-300 mt-1'>
                    {asteroidInfo.mysticalProperties}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </CollapsibleSection>
  );
}
