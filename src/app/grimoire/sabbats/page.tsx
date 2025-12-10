import { Metadata } from 'next';
import Link from 'next/link';
import { Sun } from 'lucide-react';
import { wheelOfTheYearSabbats } from '@/constants/sabbats';
import { stringToKebabCase } from '../../../../utils/string';

export const metadata: Metadata = {
  title: 'Sabbats: The 8 Pagan Holidays | Lunary',
  description:
    'Explore the eight Sabbats of the Wheel of the Year. Learn about Samhain, Yule, Imbolc, Ostara, Beltane, Litha, Lammas, and Mabon celebrations.',
  keywords: [
    'sabbats',
    'pagan holidays',
    'wheel of the year',
    'samhain',
    'yule',
    'imbolc',
    'ostara',
    'beltane',
    'litha',
    'lammas',
    'mabon',
  ],
  openGraph: {
    title: 'Sabbats Guide | Lunary',
    description:
      'Explore the eight Sabbats of the Wheel of the Year and their celebrations.',
    url: 'https://lunary.app/grimoire/sabbats',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/sabbats',
  },
};

export default function SabbatsIndexPage() {
  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <div className='max-w-5xl mx-auto'>
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <Sun className='w-16 h-16 text-amber-400' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Sabbats
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            The eight Sabbats mark the turning of the Wheel of the Year,
            celebrating the cycles of nature and the sun&apos;s journey through
            the seasons.
          </p>
        </div>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            The Wheel of the Year
          </h2>
          <p className='text-zinc-400 mb-4'>
            The Wheel of the Year consists of four Greater Sabbats (fire
            festivals) and four Lesser Sabbats (solstices and equinoxes). These
            celebrations connect us to the natural rhythms of the earth and
            provide opportunities for reflection, ritual, and renewal.
          </p>
          <p className='text-zinc-400'>
            Greater Sabbats: Samhain, Imbolc, Beltane, Lughnasadh. Lesser
            Sabbats: Yule, Ostara, Litha, Mabon.
          </p>
        </div>

        <section className='mb-12'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {wheelOfTheYearSabbats.map((sabbat) => (
              <Link
                key={sabbat.name}
                href={`/grimoire/sabbats/${stringToKebabCase(sabbat.name.split(' ')[0])}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-amber-700/50 transition-all'
              >
                <div className='flex items-center justify-between mb-3'>
                  <h3 className='text-lg font-medium text-zinc-100 group-hover:text-amber-300 transition-colors'>
                    {sabbat.name}
                  </h3>
                  <span className='text-sm text-zinc-400'>{sabbat.date}</span>
                </div>
                <p className='text-sm text-zinc-400 line-clamp-3'>
                  {sabbat.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <div className='border-t border-zinc-800 pt-8'>
          <h3 className='text-lg font-medium text-zinc-100 mb-4'>
            Related Resources
          </h3>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/wheel-of-the-year'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Wheel of the Year
            </Link>
            <Link
              href='/grimoire/moon'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Moon Phases
            </Link>
            <Link
              href='/grimoire/correspondences'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Correspondences
            </Link>
            <Link
              href='/grimoire/practices'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Spellcraft
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
