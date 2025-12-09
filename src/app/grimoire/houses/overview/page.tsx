import { Metadata } from 'next';
import Link from 'next/link';
import { Compass } from 'lucide-react';

const houses = [
  {
    slug: 'first',
    number: 1,
    name: 'First House',
    keywords: 'Self, Identity, Appearance',
    description:
      'The House of Self — your persona, physical body, and first impressions',
  },
  {
    slug: 'second',
    number: 2,
    name: 'Second House',
    keywords: 'Money, Values, Possessions',
    description:
      'The House of Value — your resources, self-worth, and material security',
  },
  {
    slug: 'third',
    number: 3,
    name: 'Third House',
    keywords: 'Communication, Learning, Siblings',
    description:
      'The House of Communication — your mind, local travel, and early education',
  },
  {
    slug: 'fourth',
    number: 4,
    name: 'Fourth House',
    keywords: 'Home, Family, Roots',
    description:
      'The House of Home — your private life, ancestors, and emotional foundation',
  },
  {
    slug: 'fifth',
    number: 5,
    name: 'Fifth House',
    keywords: 'Creativity, Romance, Children',
    description:
      'The House of Pleasure — your creative expression, joy, and love affairs',
  },
  {
    slug: 'sixth',
    number: 6,
    name: 'Sixth House',
    keywords: 'Health, Work, Service',
    description:
      'The House of Health — your daily routines, wellness, and duties',
  },
  {
    slug: 'seventh',
    number: 7,
    name: 'Seventh House',
    keywords: 'Partnerships, Marriage, Contracts',
    description:
      'The House of Partnership — your committed relationships and open enemies',
  },
  {
    slug: 'eighth',
    number: 8,
    name: 'Eighth House',
    keywords: 'Transformation, Shared Resources, Death',
    description:
      "The House of Transformation — intimacy, other people's money, and rebirth",
  },
  {
    slug: 'ninth',
    number: 9,
    name: 'Ninth House',
    keywords: 'Philosophy, Travel, Higher Learning',
    description:
      'The House of Philosophy — your beliefs, long journeys, and expansion',
  },
  {
    slug: 'tenth',
    number: 10,
    name: 'Tenth House',
    keywords: 'Career, Status, Public Image',
    description:
      'The House of Social Status — your reputation, ambitions, and achievements',
  },
  {
    slug: 'eleventh',
    number: 11,
    name: 'Eleventh House',
    keywords: 'Friends, Groups, Hopes',
    description:
      'The House of Friends — your social circles, causes, and future dreams',
  },
  {
    slug: 'twelfth',
    number: 12,
    name: 'Twelfth House',
    keywords: 'Subconscious, Secrets, Spirituality',
    description:
      'The House of the Unconscious — hidden matters, karma, and transcendence',
  },
];

export const metadata: Metadata = {
  title: 'The 12 Astrological Houses: Life Areas & Themes | Lunary',
  description:
    'Learn about all 12 astrological houses and their meanings. Understand how houses represent different life areas in your birth chart.',
  keywords: [
    'astrological houses',
    '12 houses astrology',
    'house meanings',
    'birth chart houses',
    'first house',
    'seventh house',
  ],
  openGraph: {
    title: '12 Astrological Houses | Lunary',
    description:
      'Learn about all 12 astrological houses and their meanings in your birth chart.',
    url: 'https://lunary.app/grimoire/houses/overview',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/houses/overview',
  },
};

export default function HousesOverviewIndexPage() {
  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <div className='max-w-5xl mx-auto'>
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <Compass className='w-16 h-16 text-lunary-primary-400' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            The 12 Astrological Houses
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            Houses divide your birth chart into 12 sections, each representing a
            different area of life. Planets in houses show where their energy
            manifests.
          </p>
        </div>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Understanding Houses
          </h2>
          <p className='text-zinc-400'>
            While signs describe how energy expresses and planets describe what
            energy is involved, houses reveal where in your life this energy
            plays out. The Ascendant (1st house cusp) sets the framework, with
            each house following in counterclockwise order.
          </p>
        </div>

        <section className='mb-12'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {houses.map((house) => (
              <Link
                key={house.slug}
                href={`/grimoire/houses/overview/${house.slug}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all'
              >
                <div className='flex items-center gap-3 mb-2'>
                  <span className='text-2xl font-light text-lunary-primary-400'>
                    {house.number}
                  </span>
                  <h3 className='font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                    {house.name}
                  </h3>
                </div>
                <p className='text-xs text-zinc-400 mb-2'>{house.keywords}</p>
                <p className='text-sm text-zinc-400 line-clamp-2'>
                  {house.description}
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
              href='/grimoire/houses'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Planets in Houses
            </Link>
            <Link
              href='/grimoire/astronomy/planets'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Planets
            </Link>
            <Link
              href='/grimoire/aspects'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Aspects
            </Link>
            <Link
              href='/birth-chart'
              className='px-4 py-2 rounded-lg bg-lunary-primary-900/30 text-lunary-primary-300 hover:bg-lunary-primary-900/50 transition-colors'
            >
              Calculate Your Chart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
