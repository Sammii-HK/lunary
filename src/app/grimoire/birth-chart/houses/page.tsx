import { Metadata } from 'next';
import Link from 'next/link';
import { Compass } from 'lucide-react';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
const houses = [
  { number: 1, name: 'First House', theme: 'Self & Identity' },
  { number: 2, name: 'Second House', theme: 'Resources & Values' },
  { number: 3, name: 'Third House', theme: 'Communication' },
  { number: 4, name: 'Fourth House', theme: 'Home & Family' },
  { number: 5, name: 'Fifth House', theme: 'Creativity & Pleasure' },
  { number: 6, name: 'Sixth House', theme: 'Health & Service' },
  { number: 7, name: 'Seventh House', theme: 'Partnerships' },
  { number: 8, name: 'Eighth House', theme: 'Transformation' },
  { number: 9, name: 'Ninth House', theme: 'Philosophy & Travel' },
  { number: 10, name: 'Tenth House', theme: 'Career & Status' },
  { number: 11, name: 'Eleventh House', theme: 'Community & Dreams' },
  { number: 12, name: 'Twelfth House', theme: 'Spirituality & Hidden' },
];

const houseEssentials = [
  'Know your exact birth time to lock in the house cusps.',
  'Observe which planets fall in each house to add color.',
  'Check the ruling sign on each house cusp for flavor.',
  'Watch transits over the house cusps for timing clues.',
];

const cosmicSections = [
  {
    title: 'House Study',
    links: [
      { label: 'Birth Chart Guide', href: '/grimoire/birth-chart' },
      { label: 'Houses Overview', href: '/grimoire/houses' },
      { label: 'Your Rising Sign', href: '/grimoire/rising-sign' },
    ],
  },
  {
    title: 'Timing & Practice',
    links: [
      { label: 'Transits', href: '/grimoire/transits' },
      { label: 'Moon Phases', href: '/grimoire/moon' },
      { label: 'Astrology Hub', href: '/grimoire/astrology' },
    ],
  },
];

const tableOfContents = [
  { label: 'Reading Your Houses', href: '#reading-houses' },
  { label: 'House Grid', href: '#house-grid' },
  { label: 'How to Study', href: '#how-to-study' },
  { label: 'House Pairings', href: '#house-pairs' },
  { label: 'Resources', href: '#related-resources' },
];

const houseFaqs = [
  {
    question: 'Why are houses important in a chart?',
    answer:
      'Houses show where the planetary energies express in life: relationships, career, home, and so on. They add practical context to the signs and planets.',
  },
  {
    question: 'What determines house cusps?',
    answer:
      'Your exact birth time and location determine where the houses fall across the sky.',
  },
  {
    question: 'Can houses change if my birth time is off?',
    answer:
      'Yes—hour adjustments can shift house cusps dramatically. Even 15 minutes can move the rising sign, so aim for the most accurate time possible.',
  },
];

const houseSlugMap: Record<number, string> = {
  1: 'first',
  2: 'second',
  3: 'third',
  4: 'fourth',
  5: 'fifth',
  6: 'sixth',
  7: 'seventh',
  8: 'eighth',
  9: 'ninth',
  10: 'tenth',
  11: 'eleventh',
  12: 'twelfth',
};

export const metadata: Metadata = {
  title: 'Houses in Your Birth Chart | Lunary',
  description:
    'Learn about the 12 houses in your birth chart. Understand how each house represents different areas of life and experiences.',
  keywords: [
    'birth chart houses',
    'natal houses',
    '12 houses',
    'astrological houses',
    'chart interpretation',
  ],
  openGraph: {
    title: 'Birth Chart Houses | Lunary',
    description:
      'Learn about the 12 houses and how they appear in your birth chart.',
    url: 'https://lunary.app/grimoire/birth-chart/houses',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/birth-chart/houses',
  },
};

export default function BirthChartHousesIndexPage() {
  const heroContent = (
    <div className='text-center'>
      <div className='flex justify-center mb-4'>
        <Compass className='w-16 h-16 text-lunary-primary-400' />
      </div>
      <p className='text-lg text-zinc-400 max-w-3xl mx-auto'>
        Your birth chart is divided into 12 houses, each governing different
        areas of life. Learn what each house reveals about you.
      </p>
    </div>
  );

  const sections = (
    <>
      <section
        id='reading-houses'
        className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'
      >
        <h2 className='text-xl font-medium text-zinc-100 mb-3'>
          Reading Your Houses
        </h2>
        <p className='text-zinc-400'>
          In your birth chart, planets fall into different houses based on your
          birth time and location. The sign on each house cusp and planets
          within that house color how you experience that life area.
        </p>
      </section>

      <section id='house-grid' className='mb-12'>
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
          {houses.map((house) => (
            <Link
              key={house.number}
              href={`/grimoire/birth-chart/houses/${houseSlugMap[house.number]}`}
              className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all'
            >
              <div className='text-2xl font-light text-lunary-primary-400 mb-2'>
                {house.number}
              </div>
              <h3 className='font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors text-sm'>
                {house.name}
              </h3>
              <p className='text-xs text-zinc-400 mt-1'>{house.theme}</p>
            </Link>
          ))}
        </div>
      </section>

      <section
        id='house-rulers'
        className='mb-12 bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 space-y-4'
      >
        <h2 className='text-2xl font-medium text-zinc-100'>
          House Rulers & Modality
        </h2>
        <p className='text-zinc-300 text-sm'>
          Each house has a ruling sign and planet that adds flavor. For example,
          the First house is ruled by Aries and Mars, so it carries initiative,
          whereas the Fourth house is ruled by Cancer and the Moon, so it feels
          protective and emotional.
        </p>
        <div className='grid md:grid-cols-2 gap-4 text-sm text-zinc-300'>
          <p>
            The angular houses (1, 4, 7, 10) are loci of action—take them
            seriously when transits hit. Succedent houses (2, 5, 8, 11) show the
            strength of energy stored, and cadent houses (3, 6, 9, 12) are the
            learning zones where you collect information.
          </p>
          <p>
            Note the three modalities: cardinal (initiating), fixed
            (sustaining), and mutable (adapting). They reveal how you move
            through each house’s life area—either by starting, holding steady,
            or flowing with change.
          </p>
        </div>
      </section>

      <section
        id='how-to-study'
        className='mb-10 bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 space-y-4'
      >
        <h2 className='text-2xl font-medium text-zinc-100'>
          How to Study Houses
        </h2>
        <p className='text-zinc-300'>
          Treat the houses as story chapters. The sign on the cusp is the tone,
          planets add characters, and rulers tie the plot together.
        </p>
        <ol className='list-decimal list-inside text-zinc-300 space-y-2'>
          {houseEssentials.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section
        id='house-pairs'
        className='mb-12 bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 space-y-4'
      >
        <h2 className='text-2xl font-medium text-zinc-100'>
          House Pairings to Watch
        </h2>
        <p className='text-zinc-300 leading-relaxed'>
          Each house has a partner across the chart that reveals balance. For
          example, the First (identity) pairs with the Seventh (relationships)
          to show how you shine alone versus with others.
        </p>
        <div className='grid md:grid-cols-2 gap-4 text-sm text-zinc-300'>
          {[
            {
              title: '1 ↔ 7',
              body: 'Self versus partnership, identity and how you relate.',
            },
            {
              title: '2 ↔ 8',
              body: 'Resources, values, and everything you share or transform.',
            },
            {
              title: '3 ↔ 9',
              body: 'Communication, learning, and how you expand your worldview.',
            },
            {
              title: '4 ↔ 10',
              body: 'Home roots versus public reputation and career.',
            },
            {
              title: '5 ↔ 11',
              body: 'Creative joy versus community and dreams.',
            },
            {
              title: '6 ↔ 12',
              body: 'Daily service versus spiritual surrender.',
            },
          ].map((pair) => (
            <article
              key={pair.title}
              className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-4'
            >
              <h3 className='text-lg font-semibold text-zinc-100 mb-1'>
                {pair.title}
              </h3>
              <p>{pair.body}</p>
            </article>
          ))}
        </div>
      </section>

      <div id='related-resources' className='border-t border-zinc-800 pt-8'>
        <h3 className='text-lg font-medium text-zinc-100 mb-4'>
          Related Resources
        </h3>
        <div className='flex flex-wrap gap-3'>
          <Link
            href='/grimoire/birth-chart'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            Birth Chart Overview
          </Link>
          <Link
            href='/grimoire/houses'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            Houses (General)
          </Link>
          <Link
            href='/birth-chart'
            className='px-4 py-2 rounded-lg bg-lunary-primary-900/30 text-lunary-primary-300 hover:bg-lunary-primary-900/50 transition-colors'
          >
            Calculate Your Chart
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <SEOContentTemplate
        title='Houses in Your Birth Chart | Lunary'
        h1='Houses in Your Birth Chart'
        description='Learn about the 12 houses in your birth chart and what each one represents.'
        keywords={[
          'birth chart houses',
          'natal houses',
          '12 houses',
          'astrological houses',
          'chart interpretation',
        ]}
        canonicalUrl='https://lunary.app/grimoire/birth-chart/houses'
        tableOfContents={tableOfContents}
        heroContent={heroContent}
        intro='The 12 houses divide your chart by life areas—identity, possessions, communication, home, creativity, health, partnerships, transformation, philosophy, career, community, and spirituality.'
        meaning='Houses describe the arenas where planets play out. Planets in your houses show how energies act in those areas, while ruling signs describe the style of expression.'
        howToWorkWith={houseEssentials}
        faqs={houseFaqs}
        relatedItems={[
          {
            name: 'Birth Chart Guide',
            href: '/grimoire/birth-chart',
            type: 'Guide',
          },
          { name: 'Houses Overview', href: '/grimoire/houses', type: 'Guide' },
          { name: 'Astrology Hub', href: '/grimoire/astrology', type: 'Topic' },
        ]}
        internalLinks={[
          { text: 'Planets & Houses', href: '/grimoire/astronomy/planets' },
          { text: 'Birth Chart Calculator', href: '/birth-chart' },
          { text: 'Astrology Beginner Hub', href: '/grimoire/beginners' },
        ]}
        cosmicConnections={
          <CosmicConnections
            entityType='hub-birth-chart'
            entityKey='houses'
            title='House Connections'
            sections={cosmicSections}
          />
        }
        ctaText='Explore your houses in a personalized reading'
        ctaHref='/birth-chart'
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Birth Chart', href: '/grimoire/birth-chart' },
          { label: 'Houses', href: '/grimoire/birth-chart/houses' },
        ]}
      >
        {sections}
      </SEOContentTemplate>
    </div>
  );
}
