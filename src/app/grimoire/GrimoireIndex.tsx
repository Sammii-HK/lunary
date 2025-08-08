'use client';

import { grimoire, grimoireItems } from '@/constants/grimoire';
import Link from 'next/link';
import Moon from './components/Moon';
import WheelOfTheYear from './components/WheelOfTheYear';
import Astronomy from './components/Astronomy';
import Correspondences from './components/Correspondences';
import Practices from './components/Practices';
import { useRouter, useSearchParams } from 'next/navigation';
import Tarot from './components/Tarot';
import Runes from './components/Runes';
import Chakras from './components/Chakras';
import { Numerology } from './components/Numerology';
import Crystals from './components/Crystals';
import { stringToKebabCase } from '../../../utils/string';
import { scrollToTop } from '../../../utils/scroll';

const GrimoireContent = {
  moon: <Moon />,
  wheelOfTheYear: <WheelOfTheYear />,
  astronomy: <Astronomy />,
  correspondences: <Correspondences />,
  practices: <Practices />,
  tarot: <Tarot />,
  runes: <Runes />,
  chakras: <Chakras />,
  numerology: <Numerology />,
  crystals: <Crystals />,
};

const GrimoireIndex = () => {
  const item = useSearchParams().get('item');
  const hasSearch = useSearchParams().size > 0;
  const router = useRouter();

  return (
    <div className='flex flex-row col-3 justify-between h-[93dvh] overflow-auto'>
      <div className='mr-9 py-8 fixed top-0 text-xs'>
        <div
          onClick={() => router.replace('/grimoire', undefined)}
          className='cursor-pointer text-lg font-bold pt-4 mb-4 col-span-full'
        >
          Grimoire
        </div>
        <p>Search...</p>
        <ul className='overflow-scroll scroll-m-0'>
          {grimoireItems.map((item: string) => (
            <div key={item} className='w-full flex flex-col'>
              <Link
                href={`/grimoire?item=${item}#${stringToKebabCase(item)}`}
                className='mt-3 mb-1 font-bold'
                onClick={() => scrollToTop()}
              >
                {grimoire[item].title}
              </Link>
              {grimoire[item].contents?.map((content: string) => (
                <Link
                  key={content}
                  href={`/grimoire?item=${item}#${stringToKebabCase(content)}`}
                  onClick={() => scrollToTop()}
                  className='font-light mb-1 pl-3'
                >
                  {content}
                </Link>
              ))}
            </div>
          ))}
        </ul>
      </div>
      {hasSearch && (
        <div className='col-span-2 pb-8 ml-44 flex-auto text-xs'>
          {GrimoireContent[item as keyof typeof GrimoireContent]}
        </div>
      )}
    </div>
  );
};

export default GrimoireIndex;
