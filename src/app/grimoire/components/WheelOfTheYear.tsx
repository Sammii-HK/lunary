import Link from 'next/link';
import { wheelOfTheYearSabbats } from '@/constants/sabbats';
import { stringToKebabCase } from '../../../../utils/string';

const WheelOfTheYear = () => {
  return (
    <div className='space-y-6'>
      <div className='mb-6'>
        <h2 className='text-2xl md:text-3xl font-light text-content-primary mb-2'>
          Complete Wheel of the Year Guide
        </h2>
        <p className='text-sm text-content-muted'>
          Discover the Wheel of the Year, Sabbats, and seasonal celebrations
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {wheelOfTheYearSabbats.map((sabbat) => {
          const sabbatSlug = stringToKebabCase(sabbat.name);
          return (
            <Link
              key={sabbat.name}
              href={`/grimoire/wheel-of-the-year/${sabbatSlug}`}
              className='block rounded-lg border border-stroke-subtle/50 bg-surface-elevated/30 p-4 hover:bg-surface-elevated/50 hover:border-lunary-primary-600 transition-all group'
            >
              <h2 className='text-lg font-medium text-content-primary mb-2 group-hover:text-lunary-primary-400 transition-colors'>
                {sabbat.name}
              </h2>
              <p className='text-sm text-content-secondary leading-relaxed'>
                {sabbat.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default WheelOfTheYear;
