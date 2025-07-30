import { BookMarked, Eclipse, Notebook, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const Navbar = () => {
  return (
    <>
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
        </ul>
      </nav>
    </>
  );
};
