import { Metadata } from 'next';
import Link from 'next/link';
import { Compass } from 'lucide-react';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
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
  const tableOfContents = [
    { label: 'Understanding Houses', href: '#understanding-houses' },
    { label: 'House Grid', href: '#house-grid' },
    { label: 'Related Resources', href: '#related-resources' },
  ];

  const heroContent = (
    <div className='text-center'>
      <div className='flex justify-center mb-4'>
        <Compass className='w-16 h-16 text-lunary-primary-400' />
      </div>
      <p className='text-lg text-zinc-400 max-w-3xl mx-auto'>
        Houses divide your birth chart into 12 sections, each representing a
        different area of life. Planets in houses show where their energy
        manifests.
      </p>
    </div>
  );

  const sections = (
    <>
      <section
        id='understanding-houses'
        className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'
      >
        <h2 className='text-xl font-medium text-zinc-100 mb-3'>
          Understanding Houses
        </h2>
        <p className='text-zinc-400'>
          While signs describe how energy expresses and planets describe what
          energy is involved, houses reveal where in your life this energy plays
          out. The Ascendant (1st house cusp) sets the framework, with each
          house following in counterclockwise order.
        </p>
        <p className='text-zinc-400 mt-3'>
          Your birth time is essential for accurate house placement. Even a
          small shift in time can move planets into different houses and change
          which life areas are emphasized.
        </p>
      </section>

      <section id='house-grid' className='mb-12'>
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

      <section id='related-resources' className='border-t border-zinc-800 pt-8'>
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
      </section>
      <section className='mt-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6'>
        <h3 className='text-xl font-medium text-zinc-100 mb-3'>
          House Axis Pairs
        </h3>
        <p className='text-sm text-zinc-300 mb-3'>
          Houses work in pairs across the chart: 1st–7th (self vs
          relationships), 2nd–8th (personal vs shared resources), 3rd–9th (local
          vs global), 4th–10th (home vs career), 5th–11th (creativity vs
          community), 6th–12th (service vs rest). Looking at both sides gives
          fuller context.
        </p>
        <p className='text-sm text-zinc-300'>
          When one side is emphasized, the opposite house often needs balance.
          Use this to track where you might be over‑investing or
          under‑nourishing.
        </p>
      </section>
      <section className='mt-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6'>
        <h3 className='text-xl font-medium text-zinc-100 mb-3'>
          Angular, Succedent, Cadent
        </h3>
        <p className='text-sm text-zinc-300 mb-3'>
          Angular houses initiate action, succedent houses stabilize what you
          build, and cadent houses help you adapt and integrate. If a house
          topic feels slow to develop, check whether it’s in a cadent house
          where refinement takes time.
        </p>
        <div className='grid md:grid-cols-3 gap-4 text-sm text-zinc-300'>
          <div className='rounded-lg border border-zinc-800 bg-zinc-900/50 p-4'>
            <p className='font-semibold text-zinc-100 mb-2'>Angular</p>
            <p>1st, 4th, 7th, 10th</p>
          </div>
          <div className='rounded-lg border border-zinc-800 bg-zinc-900/50 p-4'>
            <p className='font-semibold text-zinc-100 mb-2'>Succedent</p>
            <p>2nd, 5th, 8th, 11th</p>
          </div>
          <div className='rounded-lg border border-zinc-800 bg-zinc-900/50 p-4'>
            <p className='font-semibold text-zinc-100 mb-2'>Cadent</p>
            <p>3rd, 6th, 9th, 12th</p>
          </div>
        </div>
      </section>
      <section className='mt-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6'>
        <h3 className='text-xl font-medium text-zinc-100 mb-3'>
          Finding Your House Placements
        </h3>
        <p className='text-sm text-zinc-300 mb-3'>
          Use a birth chart calculator with your exact time and location. The
          chart will show house cusps and which planets fall in each house.
        </p>
        <p className='text-sm text-zinc-300'>
          Start with your Sun, Moon, and Rising houses. Those placements give a
          quick snapshot of your core focus areas.
        </p>
      </section>
      <section className='mt-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6'>
        <h3 className='text-xl font-medium text-zinc-100 mb-3'>
          House Keywords in Practice
        </h3>
        <p className='text-sm text-zinc-300'>
          Use house keywords as prompts: write down one real‑life example for
          each house. This practice turns abstract chart theory into practical
          insight you can apply immediately.
        </p>
      </section>
    </>
  );

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <SEOContentTemplate
        title='The 12 Astrological Houses: Life Areas & Themes | Lunary'
        h1='The 12 Astrological Houses'
        description='Learn about all 12 astrological houses and how they represent different life areas in your birth chart.'
        keywords={[
          'astrological houses',
          '12 houses astrology',
          'house meanings',
          'birth chart houses',
          'first house',
          'seventh house',
        ]}
        canonicalUrl='https://lunary.app/grimoire/houses/overview'
        tableOfContents={tableOfContents}
        heroContent={heroContent}
        intro='This overview explains the 12 houses as life arenas. Use it to locate which house themes are most active in your chart.'
        tldr='Houses show where life happens. Start with the angular houses (1, 4, 7, 10), then explore the rest for nuance.'
        meaning={`Houses are the “where” of astrology. They map your life into twelve areas, from identity to purpose to spiritual renewal. Planets activate those areas, and signs color how you experience them.

Houses also fall into three categories: angular (1, 4, 7, 10), succedent (2, 5, 8, 11), and cadent (3, 6, 9, 12). Angular houses are the most visible, succedent houses build and stabilize, and cadent houses adapt and refine. Knowing the category helps you understand how a topic unfolds over time.

If a house has many planets, that life area tends to feel loud. If it is empty, it may feel quieter but still matters through transits and progressions.`}
        howToWorkWith={[
          'Check your Rising sign to identify your 1st house style.',
          'Locate your Sun and Moon houses for core life focus.',
          'Watch transits through your angular houses for big shifts.',
          'Journal one house per week to build awareness.',
        ]}
        faqs={[
          {
            question: 'Do empty houses matter?',
            answer:
              'Yes. Empty houses still operate; they are simply less emphasized in the natal chart.',
          },
          {
            question: 'Why do my house themes feel different from others?',
            answer:
              'Your house cusps are shaped by your Rising sign and birth time, which creates unique emphasis.',
          },
        ]}
        tables={[
          {
            title: 'Angular Houses',
            headers: ['House', 'Theme'],
            rows: [
              ['1st', 'Identity & self‑image'],
              ['4th', 'Home & roots'],
              ['7th', 'Partnerships'],
              ['10th', 'Career & public life'],
            ],
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Houses', href: '/grimoire/houses' },
          { label: 'Overview' },
        ]}
        internalLinks={[
          { text: 'Planets in Houses', href: '/grimoire/houses' },
          { text: 'Birth Chart Basics', href: '/grimoire/birth-chart' },
          { text: 'Aspects', href: '/grimoire/aspects' },
        ]}
        ctaText='Calculate Your Birth Chart'
        ctaHref='/birth-chart'
      >
        {sections}
      </SEOContentTemplate>
    </div>
  );
}
