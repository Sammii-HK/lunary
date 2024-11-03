'use client';

import { grimoire, grimoireItems } from '@/constants/grimoire';
import Link from 'next/link';
import Moon from './components/Moon';
import WheelOfTheYear from './components/WheelOfTheYear';
import Astronomy from './components/Astronomy';
import Correspondences from './components/Correspondences';
import Practices from './components/Practices';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Tarot from './components/Tarot';

const GrimoireContent = {
  moon: <Moon />,
  wheelOfTheYear: <WheelOfTheYear />,
  astronomy: <Astronomy />,
  correspondences: <Correspondences />,
  practices: <Practices />,
  tarot: <Tarot />,
};

const GrimoireIndex = () => {
  const item = useSearchParams().get('item');
  const hasSearch = useSearchParams().size > 0;
  
  return (
    <div className='flex flex-row col-3 justify-between'>
      <div className='mr-9'>
        <Link href="/grimoire" className="text-lg font-bold mb-4 col-span-full">Grimoire</Link>
        <p>Search...</p>
        <ul className='col-span-1'>
          {grimoireItems.map((item: string) => (
            <div key={item} className='w-full flex flex-col'>
              <Link href={`/grimoire?item=${item}`} className="mt-3 mb-1 font-bold">{grimoire[item].title}</Link>
              {grimoire[item].contents?.map((content: string) => (
                <Link
                  key={content}
                  href={`/grimoire?item=${item}#${content.replaceAll(' ', '-').toLowerCase()}`}
                  className="font-light mb-1 pl-3">
                  {content}
                </Link>
              ))}
            </div>
          ))}
        </ul>
      </div>
      {hasSearch && (
        <div className='col-span-2 my-9 mx-2 flex-auto'>
          {GrimoireContent[item as keyof typeof GrimoireContent]}
        </div>
      )}
    </div>
  );
};

export default GrimoireIndex;
