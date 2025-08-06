'use client';

import { useAccount } from 'jazz-tools/react';
import {
  getBirthChartFromProfile,
  hasBirthChart,
} from '../../utils/astrology/birthChart';
import { bodiesSymbols, zodiacSymbol } from '../../utils/zodiac/zodiac';
import Link from 'next/link';

export const BirthChartWidget = () => {
  const { me } = useAccount();
  const userName = (me?.profile as any)?.name;
  const userBirthday = (me?.profile as any)?.birthday;

  if (!me || !userBirthday) {
    return (
      <div className='py-3 px-4 border border-stone-800 rounded-md w-full'>
        <div className='text-center'>
          <h3 className='font-bold mb-2'>Birth Chart</h3>
          <p className='text-zinc-400 text-xs mb-2'>
            Add your birthday to see your natal placements
          </p>
          <Link href='/profile' className='text-blue-400 text-xs underline'>
            Complete Profile
          </Link>
        </div>
      </div>
    );
  }

  const hasBirthChartData = hasBirthChart(me.profile);
  const birthChartData = hasBirthChartData
    ? getBirthChartFromProfile(me.profile)
    : null;

  if (!birthChartData) {
    return (
      <div className='py-3 px-4 border border-stone-800 rounded-md w-full'>
        <div className='text-center'>
          <h3 className='font-bold mb-2'>Birth Chart</h3>
          <p className='text-zinc-400 text-xs'>Generating chart...</p>
        </div>
      </div>
    );
  }

  // Get the most important placements (Sun, Moon, Rising - but we don't have rising, so Mercury)
  const keyPlacements = ['Sun', 'Moon', 'Mercury']
    .map((bodyName) =>
      birthChartData.find((planet) => planet.body === bodyName),
    )
    .filter((planet): planet is NonNullable<typeof planet> => Boolean(planet));

  return (
    <div className='py-3 px-4 border border-stone-800 rounded-md w-full'>
      <div className='text-center mb-3'>
        <h3 className='font-bold'>Birth Chart</h3>
        {userName && (
          <p className='text-zinc-400 text-xs'>
            {userName}&apos;s Natal Placements
          </p>
        )}
      </div>

      <div className='grid grid-cols-3 gap-2'>
        {keyPlacements.slice(0, 3).map((planet) => (
          <div key={planet.body} className='text-center'>
            <div className='text-lg mb-1'>
              {
                bodiesSymbols[
                  planet.body.toLowerCase() as keyof typeof bodiesSymbols
                ]
              }
            </div>
            <div className='text-xs'>
              <div>
                {
                  zodiacSymbol[
                    planet.sign.toLowerCase() as keyof typeof zodiacSymbol
                  ]
                }
              </div>
              <div className='text-zinc-400'>{planet.degree}°</div>
            </div>
          </div>
        ))}
      </div>

      <div className='text-center mt-3'>
        <Link href='/birth-chart' className='text-blue-400 text-xs underline'>
          View Full Chart
        </Link>
      </div>
    </div>
  );
};
