import Link from 'next/link';
import { chakras } from '@/constants/chakras';
import { stringToKebabCase } from '../../../../utils/string';

const Chakras = () => {
  const chakraList = Object.keys(chakras);
  return (
    <div className='space-y-6'>
      <div className='mb-6'>
        <h2 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          Complete Chakras Guide
        </h2>
        <p className='text-sm text-zinc-400'>
          Understanding the seven chakras and their meanings
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {chakraList.map((chakra: string) => {
          const chakraSlug = stringToKebabCase(chakra);
          return (
            <Link
              key={chakra}
              href={`/grimoire/chakras/${chakraSlug}`}
              className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
            >
              <h2 className='text-lg font-medium text-zinc-100 mb-2 group-hover:text-lunary-primary-400 transition-colors'>
                {chakras[chakra as keyof typeof chakras].symbol}{' '}
                {chakras[chakra as keyof typeof chakras].name}
              </h2>
              <p className='text-sm text-zinc-300 leading-relaxed mb-1'>
                {chakras[chakra as keyof typeof chakras].properties}
              </p>
              <p className='text-sm text-zinc-400'>
                {chakras[chakra as keyof typeof chakras].mysticalProperties}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Chakras;
