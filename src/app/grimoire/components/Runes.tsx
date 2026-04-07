import Link from 'next/link';
import { runesList } from '@/constants/runes';
import { stringToKebabCase } from '../../../../utils/string';

const Runes = () => {
  const runes = Object.keys(runesList);
  return (
    <div className='space-y-6'>
      <div className='mb-6'>
        <h2 className='text-2xl md:text-3xl font-light text-content-primary mb-2'>
          Complete Runes Guide
        </h2>
        <p className='text-sm text-content-muted'>
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
              className='block rounded-lg border border-stroke-subtle/50 bg-surface-elevated/30 p-4 hover:bg-surface-elevated/50 hover:border-lunary-primary-600 transition-all group'
            >
              <h2 className='text-lg font-medium text-content-primary mb-2 group-hover:text-lunary-primary-400 transition-colors'>
                {runesList[rune as keyof typeof runesList].symbol}{' '}
                {runesList[rune as keyof typeof runesList].name}
              </h2>
              <p className='text-sm text-content-secondary leading-relaxed mb-1'>
                {runesList[rune as keyof typeof runesList].meaning}
              </p>
              <p className='text-sm text-content-secondary leading-relaxed mb-1'>
                {runesList[rune as keyof typeof runesList].magicalProperties}
              </p>
              <p className='text-sm text-content-muted'>
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
