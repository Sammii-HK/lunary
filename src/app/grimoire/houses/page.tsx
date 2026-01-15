import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import {
  HOUSES,
  HOUSE_DATA,
  PLANETS_FOR_HOUSES,
  PLANET_HOUSE_DISPLAY,
  getOrdinalSuffix,
} from '@/constants/seo/houses';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';

export const metadata: Metadata = {
  title: 'The 12 Astrological Houses: Meanings & Themes Explained | Lunary',
  description:
    'Complete guide to the 12 houses in astrology. Learn what each house represents, from identity (1st) to spirituality (12th), and how planet placements affect you.',
  keywords: [
    'astrological houses',
    '12 houses',
    'natal chart houses',
    'house meanings',
    'planets in houses',
  ],
  alternates: { canonical: 'https://lunary.app/grimoire/houses' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'The 12 Astrological Houses: Meanings & Themes Explained | Lunary',
    description:
      'Complete guide to the 12 houses in astrology. Learn what each house represents.',
    url: 'https://lunary.app/grimoire/houses',
    images: [
      {
        url: '/api/og/grimoire/houses',
        width: 1200,
        height: 630,
        alt: 'The 12 Astrological Houses - Lunary',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The 12 Astrological Houses: Meanings & Themes Explained | Lunary',
    description:
      'Complete guide to the 12 houses in astrology. Learn what each house represents.',
    images: ['/api/og/grimoire/houses'],
  },
};

const housesListSchema = createItemListSchema({
  name: 'The 12 Astrological Houses',
  description:
    'Complete guide to the 12 houses in astrology and their meanings in your birth chart.',
  url: 'https://lunary.app/grimoire/houses',
  items: HOUSES.map((house) => ({
    name: `${house}${getOrdinalSuffix(house)} House`,
    url: `https://lunary.app/grimoire/houses/overview/${house}`,
    description: HOUSE_DATA[house].lifeArea,
  })),
});

const tableOfContents = [
  { label: 'What Are the Houses?', href: '#what-are-houses' },
  { label: 'The 12 House Themes', href: '#house-grid' },
  { label: 'Planets in Houses', href: '#planets-in-houses' },
  { label: 'Chart Reference', href: '#chart-reference' },
  { label: 'FAQ', href: '#faq' },
];

const whatIs = {
  question: 'What do the astrological houses represent?',
  answer:
    'Each house corresponds to a life area (identity, relationships, career, etc.). Planets located in a house bring their energy to that domain.',
};

const intro =
  'The houses slice the natal chart into twelve life arenas ranging from self-image to shared resources and spirituality. Understanding house themes clarifies where planets express their power.';

const howToWorkWith = [
  'Match each planet to its house to know where its drive unfolds.',
  'Use transits to see when current planets activate your house activity.',
  'Combine house meanings with zodiac signs to layer nuance.',
  'Journal on your angular houses (1st, 4th, 7th, 10th) to track life pivots.',
];

const faqs = [
  {
    question: 'How do I know what house a planet is in?',
    answer:
      'Use your natal chart (birth date, time, location). The calculator will show each planet’s sign and house placement, revealing where its energy operates.',
  },
  {
    question: 'Are some houses more important than others?',
    answer:
      'Angular houses (1, 4, 7, 10) are dynamic, but every house matters. The focus depends on the planets in them and the life season you’re in.',
  },
  {
    question: 'Can house meanings change over time?',
    answer:
      'The natal houses stay static, but progressions and transits move through them—watch for outer planet activations to understand long-term chapters.',
  },
];

const relatedItems = [
  { name: 'Birth Chart', href: '/birth-chart', type: 'Chart tool' },
  { name: 'Transits', href: '/grimoire/transits', type: 'Timing' },
  {
    name: 'Planets',
    href: '/grimoire/astronomy/planets',
    type: 'Planet meanings',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'House Resources',
    links: [
      { label: 'House Overview', href: '/grimoire/houses/overview' },
      { label: 'House Descriptions', href: '/grimoire/houses' },
      { label: 'Planets in Houses', href: '/grimoire/houses/overview' },
    ],
  },
  {
    title: 'Related Practices',
    links: [
      { label: 'Birth Chart', href: '/birth-chart' },
      { label: 'Transits', href: '/grimoire/transits' },
      { label: 'Aspects', href: '/grimoire/aspects' },
      { label: 'Manifestation', href: '/grimoire/manifestation' },
    ],
  },
];

export default function HousesIndexPage() {
  return (
    <>
      {renderJsonLd(housesListSchema)}
      <SEOContentTemplate
        title={metadata.title as string}
        h1='The 12 Astrological Houses'
        description={metadata.description as string}
        keywords={metadata.keywords as string[]}
        canonicalUrl={
          (metadata.alternates?.canonical as string) ??
          'https://lunary.app/grimoire/houses'
        }
        tableOfContents={tableOfContents}
        whatIs={whatIs}
        intro={intro}
        tldr='Houses show where life unfolds; planets show what energy is active; signs show how it expresses. Start with your angular houses (1st, 4th, 7th, 10th) for the biggest themes.'
        meaning={`The 12 houses map life areas: identity, money, communication, home, creativity, health, relationships, shared resources, beliefs, career, community, and spirituality. When a planet sits in a house, it activates that arena.

Use houses as your “where,” planets as your “what,” and signs as your “how.” This triad makes chart reading practical and grounded.`}
        howToWorkWith={howToWorkWith}
        rituals={[
          'Write the four angular houses and set a one‑sentence intention for each.',
          'Review one house per week and note what is most active.',
          'Track transits through your key houses during major life changes.',
        ]}
        journalPrompts={[
          'Which house feels most active in my life right now?',
          'Where do I feel the strongest need for growth or healing?',
          'How does my rising sign shape my 1st house expression?',
          'What planet‑house placement explains a recurring pattern?',
        ]}
        tables={[
          {
            title: 'House Reading Formula',
            headers: ['Layer', 'Question'],
            rows: [
              ['House', 'Where does it happen?'],
              ['Planet', 'What energy is present?'],
              ['Sign', 'How does it express?'],
            ],
          },
        ]}
        faqs={faqs}
        relatedItems={relatedItems}
        internalLinks={[
          { text: 'Birth Chart Basics', href: '/grimoire/birth-chart' },
          { text: 'Planets', href: '/grimoire/astronomy/planets' },
          { text: 'Aspects', href: '/grimoire/aspects' },
        ]}
        cosmicConnections={
          <CosmicConnections
            entityType='hub-glossary'
            entityKey='houses'
            title='House Connections'
            sections={cosmicConnectionsSections}
          />
        }
      >
        <section id='what-are-houses' className='mb-16'>
          <h2 className='text-3xl font-light text-zinc-100 mb-6'>
            1. What Are the Houses?
          </h2>
          <p className='text-zinc-300 leading-relaxed mb-6'>
            The twelve houses divide the natal chart into life themes—from
            identity (1st house) to spirituality (12th house). They show where
            planets express their energy.
          </p>
          <p className='text-zinc-300 leading-relaxed'>
            When you combine house meaning with planetary energy and zodiac
            sign, you get a layered blueprint of how you operate in each domain.
          </p>
        </section>

        <section id='house-grid' className='mb-16'>
          <h2 className='text-3xl font-light text-zinc-100 mb-6'>
            2. The 12 House Themes
          </h2>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {HOUSES.map((house) => {
              const data = HOUSE_DATA[house];
              return (
                <div
                  key={house}
                  className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-6'
                >
                  <div className='flex items-center gap-3 mb-3'>
                    <span className='text-3xl font-light text-lunary-primary-400'>
                      {house}
                    </span>
                    <span className='text-xs text-zinc-400'>
                      {house}
                      {getOrdinalSuffix(house)} House
                    </span>
                  </div>
                  <h3 className='text-lg font-medium mb-1'>{data.name}</h3>
                  <p className='text-sm text-zinc-400 mb-2'>{data.lifeArea}</p>
                  <p className='text-xs text-zinc-400'>
                    {data.keywords.join(' • ')}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section id='planets-in-houses' className='mb-16'>
          <h2 className='text-3xl font-light text-zinc-100 mb-6'>
            3. Planets in Houses
          </h2>
          <div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-12'>
            {PLANETS_FOR_HOUSES.slice(0, 10).map((planet) => (
              <Link
                key={planet}
                href={`/grimoire/houses/${planet}/1`}
                className='group rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-center transition-all hover:border-lunary-primary-600'
              >
                <div className='text-lg font-medium group-hover:text-lunary-primary-300'>
                  {PLANET_HOUSE_DISPLAY[planet]}
                </div>
                <div className='text-xs text-zinc-400'>in houses</div>
              </Link>
            ))}
          </div>
        </section>
        <section className='mb-16 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6'>
          <h2 className='text-2xl font-light text-zinc-100 mb-3'>
            4. House Rulers & Timing
          </h2>
          <p className='text-zinc-300'>
            Each house has a ruling sign and planet that describe how you move
            through that life area. When the ruling planet is activated by
            transits, that house tends to light up, making it a useful timing
            tool.
          </p>
        </section>

        <section id='chart-reference' className='mb-16'>
          <div className='rounded-xl border border-lunary-primary-700 bg-lunary-primary-900/10 p-6'>
            <h2 className='text-2xl font-light text-lunary-primary-300 mb-3'>
              Discover Your House Placements
            </h2>
            <p className='text-zinc-300 mb-4'>
              Enter your birth details to see which planets occupy which
              houses—it unlocks where your energy naturally flows.
            </p>
            <Link
              href='/birth-chart'
              className='inline-flex items-center gap-2 rounded-lg border border-lunary-primary-700 px-6 py-3 text-sm text-lunary-primary-300 transition-colors hover:bg-lunary-primary-900/20'
            >
              View Your Birth Chart
            </Link>
          </div>
        </section>
        <section className='mb-12'>
          <h2 className='text-2xl font-light text-zinc-100 mb-3'>
            How to Read Your Houses
          </h2>
          <p className='text-zinc-300'>
            Start with the house that contains your Sun, Moon, and Rising sign.
            Those placements describe the life arenas where your identity,
            emotions, and outward behavior show up most clearly.
          </p>
        </section>
      </SEOContentTemplate>
    </>
  );
}
