'use client';

import {
  planetSymbols,
  zodiacSigns,
  zodiacSymbol,
  planetaryBodies,
} from '../../../../utils/zodiac/zodiac';
import { useEffect } from 'react';

const Astronomy = () => {
  const astronomyItems = ['Planets', 'Zodiac'] as const;

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const element = document.getElementById(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, []);

  return (
    <div className='space-y-8 pb-20'>
      <div className='mb-6'>
        <h1 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          Astronomy
        </h1>
        <p className='text-sm text-zinc-400'>
          Learn about planets, zodiac signs, and astronomical knowledge
        </p>
      </div>

      {astronomyItems.map((item) => (
        <AstronomyItems key={item} type={item} />
      ))}
    </div>
  );
};

const AstronomyItems = ({ type }: { type: string }) => {
  const items = type === 'Zodiac' ? zodiacSymbol : planetSymbols;
  type AstronomyItem = {
    name: string;
    mysticalProperties: string;
    properties?: string;
    dates?: string;
    element?: string;
  };
  const content = type === 'Zodiac' ? zodiacSigns : planetaryBodies;

  return (
    <section id={type.toLowerCase()} className='space-y-4'>
      <h2 className='text-xl font-medium text-zinc-100'>{type}</h2>
      <div className='space-y-3'>
        {Object.keys(items).map((item: string) => (
          <div
            key={item.toLowerCase()}
            className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'
          >
            <h3 className='text-lg font-medium text-zinc-100 mb-2'>
              {items[item as keyof typeof items]}{' '}
              {(content[item as keyof typeof content] as AstronomyItem).name}
            </h3>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              {
                (content[item as keyof typeof content] as AstronomyItem)
                  .mysticalProperties
              }
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Astronomy;
