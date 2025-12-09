import { Metadata } from 'next';
import Link from 'next/link';
import { Wand2 } from 'lucide-react';

const historicalWitches = [
  {
    slug: 'gerald-gardner',
    name: 'Gerald Gardner',
    era: '1884-1964',
    description: 'Founder of Wicca and modern witchcraft',
  },
  {
    slug: 'doreen-valiente',
    name: 'Doreen Valiente',
    era: '1922-1999',
    description: 'Mother of modern witchcraft, wrote the Charge of the Goddess',
  },
  {
    slug: 'scott-cunningham',
    name: 'Scott Cunningham',
    era: '1956-1993',
    description: 'Influential author on Wicca and natural magic',
  },
  {
    slug: 'raymond-buckland',
    name: 'Raymond Buckland',
    era: '1934-2017',
    description: 'Brought Wicca to America, founded Seax-Wica',
  },
  {
    slug: 'starhawk',
    name: 'Starhawk',
    era: '1951-present',
    description: 'Author of The Spiral Dance, eco-feminist witch',
  },
  {
    slug: 'aleister-crowley',
    name: 'Aleister Crowley',
    era: '1875-1947',
    description: 'Influential occultist, founder of Thelema',
  },
];

export const metadata: Metadata = {
  title: 'Famous Witches & Occultists: Historical Figures | Lunary',
  description:
    'Learn about influential witches, occultists, and magical practitioners who shaped modern witchcraft. From Gerald Gardner to Doreen Valiente.',
  keywords: [
    'famous witches',
    'wicca founders',
    'gerald gardner',
    'doreen valiente',
    'witchcraft history',
    'occultists',
  ],
  openGraph: {
    title: 'Famous Witches & Occultists | Lunary',
    description:
      'Learn about influential figures who shaped modern witchcraft.',
    url: 'https://lunary.app/grimoire/witches',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/witches',
  },
};

export default function WitchesIndexPage() {
  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <div className='max-w-5xl mx-auto'>
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <Wand2 className='w-16 h-16 text-violet-400' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Famous Witches & Occultists
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            Explore the lives and contributions of influential figures who
            shaped modern witchcraft, Wicca, and occult traditions.
          </p>
        </div>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Shaping Modern Witchcraft
          </h2>
          <p className='text-zinc-400'>
            Modern witchcraft and Wicca as we know them were shaped by key
            figures in the 20th century. Their writings, teachings, and
            practices created the foundation for contemporary magical
            traditions. Understanding their contributions helps us appreciate
            the roots of our practice.
          </p>
        </div>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Historical Figures
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {historicalWitches.map((witch) => (
              <Link
                key={witch.slug}
                href={`/grimoire/witches/${witch.slug}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-violet-700/50 transition-all'
              >
                <div className='flex items-center justify-between mb-2'>
                  <h3 className='font-medium text-zinc-100 group-hover:text-violet-300 transition-colors'>
                    {witch.name}
                  </h3>
                  <span className='text-xs text-zinc-500'>{witch.era}</span>
                </div>
                <p className='text-sm text-zinc-400'>{witch.description}</p>
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
              href='/grimoire/modern-witchcraft'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Modern Witchcraft
            </Link>
            <Link
              href='/grimoire/modern-witchcraft/witch-types'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Types of Witches
            </Link>
            <Link
              href='/grimoire/book-of-shadows'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Book of Shadows
            </Link>
            <Link
              href='/grimoire/witchcraft-ethics'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Witchcraft Ethics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
