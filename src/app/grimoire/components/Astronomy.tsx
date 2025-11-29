'use client';

import Link from 'next/link';
import {
  planetSymbols,
  zodiacSigns,
  zodiacSymbol,
  planetaryBodies,
} from '../../../../utils/zodiac/zodiac';
import { useEffect } from 'react';
import { stringToKebabCase } from '../../../../utils/string';

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
    <div className='space-y-8 pb-16'>
      <div className='mb-6'>
        <h2 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          Complete Astronomy & Astrology Guide
        </h2>
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
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {Object.keys(items).map((item: string) => {
          const itemSlug = stringToKebabCase(item);
          const linkPath =
            type === 'Zodiac'
              ? `/grimoire/zodiac/${itemSlug}`
              : `/grimoire/planets/${itemSlug}`;
          return (
            <Link
              key={item.toLowerCase()}
              href={linkPath}
              className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-purple-500/50 transition-all group'
            >
              <h3 className='text-lg font-medium text-zinc-100 mb-2 group-hover:text-purple-400 transition-colors'>
                {items[item as keyof typeof items]}{' '}
                {(content[item as keyof typeof content] as AstronomyItem).name}
              </h3>
              <p className='text-sm text-zinc-300 leading-relaxed'>
                {
                  (content[item as keyof typeof content] as AstronomyItem)
                    .mysticalProperties
                }
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default Astronomy;
