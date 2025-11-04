'use client';

import { usePathname } from 'next/navigation';
import {
  BookMarked,
  Eclipse,
  Notebook,
  Sparkles,
  User,
  Circle,
  ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';

export const Navbar = () => {
  const pathname = usePathname();

  // Hide navbar on marketing pages
  const isMarketingRoute =
    pathname === '/welcome' ||
    pathname === '/pricing' ||
    pathname?.startsWith('/admin');

  if (isMarketingRoute) {
    return null;
  }

  return (
    <nav className='sticky bottom-0 w-full h-fit border-stone-800 border-t border-spacing-5 flex justify-center bg-zinc-950'>
      <ul className='flex justify-around my-1 pb-1 w-full lg:w-[50dvw] text-white'>
        <li>
          <Link
            href='/'
            className='flex items-center columns-1 cursor-pointer p-2'
          >
            <Eclipse />
          </Link>
        </li>
        <li>
          <Link
            href='/tarot'
            className='flex items-center columns-1 cursor-pointer p-2'
          >
            <Sparkles />
          </Link>
        </li>
        <li>
          <Link
            href='/horoscope'
            className='flex items-center columns-1 cursor-pointer p-2'
          >
            <Circle />
          </Link>
        </li>
        <li>
          <Link
            href='/grimoire'
            className='flex items-center columns-1 cursor-pointer p-2'
          >
            <BookMarked />
          </Link>
        </li>
        <li>
          <Link
            href='/book-of-shadows'
            className='flex items-center columns-1 cursor-pointer p-2'
          >
            <Notebook />
          </Link>
        </li>
        <li>
          <Link
            href='/shop'
            className='flex items-center columns-1 cursor-pointer p-2'
          >
            <ShoppingBag />
          </Link>
        </li>
        <li>
          <Link
            href='/profile'
            className='flex items-center columns-1 cursor-pointer p-2'
          >
            <User />
          </Link>
        </li>
      </ul>
    </nav>
  );
};
