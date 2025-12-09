import { Metadata } from 'next';
import Link from 'next/link';

const fullMoons = [
  {
    slug: 'january',
    name: 'Wolf Moon',
    month: 'January',
    description: 'Named for wolves howling in the cold winter nights',
  },
  {
    slug: 'february',
    name: 'Snow Moon',
    month: 'February',
    description: 'Named for the heavy snowfalls of mid-winter',
  },
  {
    slug: 'march',
    name: 'Worm Moon',
    month: 'March',
    description: 'Named for earthworms emerging as the ground thaws',
  },
  {
    slug: 'april',
    name: 'Pink Moon',
    month: 'April',
    description: 'Named for pink spring flowers (phlox) blooming',
  },
  {
    slug: 'may',
    name: 'Flower Moon',
    month: 'May',
    description: 'Named for the abundance of spring flowers',
  },
  {
    slug: 'june',
    name: 'Strawberry Moon',
    month: 'June',
    description: 'Named for strawberry harvesting season',
  },
  {
    slug: 'july',
    name: 'Buck Moon',
    month: 'July',
    description: 'Named for when male deer grow new antlers',
  },
  {
    slug: 'august',
    name: 'Sturgeon Moon',
    month: 'August',
    description: 'Named for sturgeon fishing season in the Great Lakes',
  },
  {
    slug: 'september',
    name: 'Harvest Moon',
    month: 'September',
    description:
      'Named for the harvest season when farmers worked by moonlight',
  },
  {
    slug: 'october',
    name: "Hunter's Moon",
    month: 'October',
    description: 'Named for the traditional hunting season',
  },
  {
    slug: 'november',
    name: 'Beaver Moon',
    month: 'November',
    description: 'Named for beaver trapping season and dam building',
  },
  {
    slug: 'december',
    name: 'Cold Moon',
    month: 'December',
    description: 'Named for the arrival of winter cold',
  },
];

export const metadata: Metadata = {
  title: 'Full Moon Names: Monthly Guide to Full Moons | Lunary',
  description:
    "Discover the traditional names and meanings of each month's full moon, from the Wolf Moon in January to the Cold Moon in December.",
  keywords: [
    'full moon names',
    'wolf moon',
    'harvest moon',
    'monthly full moons',
    'moon names by month',
  ],
  openGraph: {
    title: 'Full Moon Names Guide | Lunary',
    description:
      "Discover the traditional names and meanings of each month's full moon.",
    url: 'https://lunary.app/grimoire/moon/full-moons',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/moon/full-moons',
  },
};

export default function FullMoonsIndexPage() {
  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <div className='max-w-5xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <span className='text-6xl'>🌕</span>
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Full Moon Names
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            Each month&apos;s full moon has traditional names from Native
            American, Colonial American, and European traditions. These names
            reflect the natural rhythms of the seasons.
          </p>
        </div>

        {/* Introduction */}
        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Origins of Full Moon Names
          </h2>
          <p className='text-zinc-400 mb-4'>
            Before modern calendars, people relied on the moon to track time.
            Many of these traditional names come from Native American tribes,
            particularly the Algonquin peoples, and were later adopted by
            Colonial Americans.
          </p>
          <p className='text-zinc-400'>
            Each name reflects seasonal activities, natural phenomena, or
            agricultural events that occurred during that time of year.
          </p>
        </div>

        {/* Full Moons Grid */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Full Moons by Month
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {fullMoons.map((moon) => (
              <Link
                key={moon.slug}
                href={`/grimoire/moon/full-moons/${moon.slug}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-amber-700/50 transition-all'
              >
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-zinc-500'>{moon.month}</span>
                  <span className='text-2xl'>🌕</span>
                </div>
                <h3 className='text-lg font-medium text-zinc-100 group-hover:text-amber-300 transition-colors mb-2'>
                  {moon.name}
                </h3>
                <p className='text-sm text-zinc-500'>{moon.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Related Links */}
        <div className='border-t border-zinc-800 pt-8'>
          <h3 className='text-lg font-medium text-zinc-100 mb-4'>
            Explore More Moon Topics
          </h3>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/moon/phases'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Moon Phases
            </Link>
            <Link
              href='/grimoire/moon-signs'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Moon Signs
            </Link>
            <Link
              href='/grimoire/moon-rituals'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Moon Rituals
            </Link>
            <Link
              href='/grimoire/eclipses'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Eclipses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
