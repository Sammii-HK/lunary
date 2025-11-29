import Link from 'next/link';
import { runesList } from '@/constants/runes';
import { stringToKebabCase } from '../../../../utils/string';

const Runes = () => {
  const runes = Object.keys(runesList);
  return (
    <div className='space-y-6 pb-16'>
      <div className='mb-6'>
        <h2 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          Complete Runes Guide
        </h2>
        <p className='text-sm text-zinc-400'>
          Ancient runic alphabets and their meanings
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {runes.map((rune: string) => {
          const runeSlug = stringToKebabCase(rune);
          return (
            <Link
              key={rune}
              href={`/grimoire/runes/${runeSlug}`}
              className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-purple-500/50 transition-all group'
            >
              <h2 className='text-lg font-medium text-zinc-100 mb-2 group-hover:text-purple-400 transition-colors'>
                {runesList[rune as keyof typeof runesList].symbol}{' '}
                {runesList[rune as keyof typeof runesList].name}
              </h2>
              <p className='text-sm text-zinc-300 leading-relaxed mb-1'>
                {runesList[rune as keyof typeof runesList].meaning}
              </p>
              <p className='text-sm text-zinc-300 leading-relaxed mb-1'>
                {runesList[rune as keyof typeof runesList].magicalProperties}
              </p>
              <p className='text-sm text-zinc-400'>
                {runesList[rune as keyof typeof runesList].notes}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Runes;
