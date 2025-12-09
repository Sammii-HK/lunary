'use client';

import { useAstronomyContext } from '@/context/AstronomyContext';
import { bodiesSymbols, zodiacSymbol } from '../../utils/zodiac/zodiac';
import classNames from 'classnames';

const cx = classNames;

export const AstronomyWidget = () => {
  const chart = useAstronomyContext().currentAstrologicalChart;

  return (
    <div className='py-3 px-1 border border-stone-800 rounded-md grid grid-cols-10 w-full'>
      {!chart.length && (
        <p className='py-3 col-span-10 text-center text-zinc-400'>Loading...</p>
      )}
      {chart.map(({ formattedDegree, sign, body, retrograde }) => (
        <div key={body} className='col-span-1'>
          <div className='flex justify-center flex-col align-middle text-center'>
            <p
              className={cx(
                { 'text-red-500': retrograde },
                'font-astro text-[22px] mb-1',
              )}
            >
              {bodiesSymbols[body.toLowerCase() as keyof typeof bodiesSymbols]}
            </p>
            <div className='text-s flex align-middle justify-evenly'>
              <span className='text-[8px]'>{formattedDegree.degree}°</span>
              <span className='font-astro'>
                {zodiacSymbol[sign.toLowerCase() as keyof typeof zodiacSymbol]}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
