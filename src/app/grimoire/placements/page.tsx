import { Metadata } from 'next';
import Link from 'next/link';
import {
  planetDescriptions,
  signDescriptions,
} from '@/constants/seo/planet-sign-content';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import {
  createItemListSchema,
  createFAQPageSchema,
  renderJsonLd,
} from '@/lib/schema';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export const revalidate = 2592000;

export const metadata: Metadata = {
  title:
    'Astrological Placements: Sun, Moon & Rising in Every Sign: Planet in Sign Meanings - Lunary',
  description:
    'Complete guide to astrological placements. Explore what each planet means in every zodiac sign. 144+ detailed interpretations for your birth chart analysis.',
  openGraph: {
    title: 'Astrological Placements: Sun, Moon & Rising in Every Sign - Lunary',
    description: 'Explore 144+ planet-in-sign combinations and their meanings.',
    url: 'https://lunary.app/grimoire/placements',
    images: [
      {
        url: '/api/og/grimoire/placements',
        width: 1200,
        height: 630,
        alt: 'Astrological Placements Guide - Lunary',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Astrological Placements: Sun, Moon & Rising in Every Sign - Lunary',
    description: 'Explore 144+ planet-in-sign combinations and their meanings.',
    images: ['/api/og/grimoire/placements'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/placements',
  },
};

const faqs = [
  {
    question: 'What are astrological placements?',
    answer:
      'Astrological placements refer to which zodiac sign each planet was in at the time of your birth. For example, having Sun in Leo or Moon in Cancer. These placements shape different aspects of your personality and life experiences.',
  },
  {
    question: 'Why do placements matter?',
    answer:
      'Each planet governs specific life areas and the sign it occupies modifies how that energy expresses. Understanding your placements provides deeper self-knowledge beyond just your Sun sign.',
  },
  {
    question: "What's the difference between signs, planets, and houses?",
    answer:
      'Signs describe how energy is expressed. Planets represent what type of energy is acting. Houses show where in life that energy manifests. Together they create your chart logic.',
  },
];

export default function PlacementsIndexPage() {
  const planets = Object.entries(planetDescriptions);
  const signs = Object.entries(signDescriptions);

  const allPlacements: { name: string; url: string; description: string }[] =
    [];
  planets.forEach(([planetKey, planet]) => {
    signs.forEach(([signKey, sign]) => {
      allPlacements.push({
        name: `${planet.name} in ${sign.name}`,
        url: `https://lunary.app/grimoire/placements/${planetKey}-in-${signKey}`,
        description: `What it means to have ${planet.name} in ${sign.name} in your birth chart.`,
      });
    });
  });

  const itemListSchema = createItemListSchema({
    name: 'Astrological Placements',
    description:
      'Complete guide to all planet-in-sign combinations for birth chart analysis.',
    url: 'https://lunary.app/grimoire/placements',
    items: allPlacements.slice(0, 50),
  });

  const faqSchema = createFAQPageSchema(faqs);

  return (
    <>
      {renderJsonLd(itemListSchema)}
      {renderJsonLd(faqSchema)}
      <SEOContentTemplate
        title='Astrological Placements: Sun, Moon & Rising in Every Sign'
        h1='Astrological Placements'
        description='Explore what each planet means in each zodiac sign. Placements are where planets pick up style, tone, and temperament in a chart.'
        canonicalUrl='https://lunary.app/grimoire/placements'
        keywords={[
          'astrological placements',
          'sun in signs',
          'moon in signs',
          'planet in sign meanings',
          'birth chart placements',
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Placements' },
        ]}
        whatIs={{
          question: 'What are astrological placements?',
          answer:
            'A placement is a planet in a sign. The planet tells you what function is being described and the sign tells you how that function behaves. House placement and aspects then refine the full interpretation.',
        }}
        tldr='Placements describe how planets behave by sign. Sun in Aries, Moon in Cancer, and Venus in Taurus all describe different functions picking up different styles.'
        intro='Explore what each planet means in every zodiac sign. Click any combination to learn about its influence on personality, strengths, and challenges.'
        meaning={`A placement is never just a sign keyword. The useful reading is: what planet is this, what does that planet govern, how does this sign shape its style, and which house or aspect changes the result? Lunary treats planet-in-sign pages as one layer of a full chart reading, not the whole reading.\n\nUse placements when you want to understand how a specific planet behaves. Use houses when you want to know where it shows up. Use aspects when you want to see what supports or pressures it.`}
        howToWorkWith={[
          'Planet = what part of life or psyche is being described.',
          'Sign = how that planet behaves or expresses itself.',
          'House = where that placement lands in lived experience.',
          'Aspects = what modifies, supports, or pressures the placement.',
        ]}
        tableOfContents={[
          { label: 'What placements are', href: '#what-is' },
          { label: 'How to read placements', href: '#meaning' },
          { label: 'Browse by planet', href: '#planet-sections' },
          { label: 'Browse by sign', href: '#sign-links' },
          { label: 'FAQ', href: '#faq' },
        ]}
        faqs={faqs}
        internalLinks={[
          { text: 'Planets', href: '/grimoire/astronomy/planets' },
          { text: 'Zodiac Signs', href: '/grimoire/zodiac' },
          { text: 'Houses', href: '/grimoire/houses' },
          { text: 'Birth Chart', href: '/grimoire/birth-chart' },
        ]}
        sources={[
          {
            name: 'Lunary placement interpretation framework',
            url: 'https://lunary.app/about/methodology',
          },
          {
            name: 'Astronomy Engine planetary calculations',
            url: 'https://github.com/cosinekitty/astronomy',
          },
          { name: 'Traditional planetary dignity and sign doctrine' },
        ]}
        ctaText='See your placements in a real chart'
        ctaHref='/birth-chart'
        childrenPosition='before-faqs'
        cosmicConnections={
          <CosmicConnections
            entityType='hub-placements'
            entityKey='placements'
            title='Placement Connections'
          />
        }
      >
        <div className='grid grid-cols-3 gap-4 max-w-md' id='placement-stats'>
          <div className='p-4 rounded-lg border border-stroke-subtle bg-surface-elevated/50 text-center'>
            <div className='text-3xl font-light text-lunary-primary-400'>
              {planets.length}
            </div>
            <div className='text-sm text-content-muted'>Planets</div>
          </div>
          <div className='p-4 rounded-lg border border-stroke-subtle bg-surface-elevated/50 text-center'>
            <div className='text-3xl font-light text-lunary-primary-400'>
              {signs.length}
            </div>
            <div className='text-sm text-content-muted'>Signs</div>
          </div>
          <div className='p-4 rounded-lg border border-stroke-subtle bg-surface-elevated/50 text-center'>
            <div className='text-3xl font-light text-lunary-primary-400'>
              {planets.length * signs.length}
            </div>
            <div className='text-sm text-content-muted'>Combinations</div>
          </div>
        </div>

        <nav className='overflow-x-auto' id='planet-sections'>
          <div className='flex gap-2 pb-2'>
            {planets.map(([planetKey, planet]) => (
              <a
                key={planetKey}
                href={`#${planetKey}-placements`}
                className='px-4 py-2 rounded-lg bg-surface-card/50 hover:bg-surface-card text-content-secondary hover:text-content-brand text-sm whitespace-nowrap transition-colors'
              >
                {planet.name}
              </a>
            ))}
          </div>
        </nav>

        <div className='space-y-12'>
          {planets.map(([planetKey, planet]) => (
            <section
              key={planetKey}
              id={`${planetKey}-placements`}
              className='p-6 rounded-lg border border-stroke-subtle bg-surface-elevated/30'
            >
              <div className='mb-6'>
                <h2 className='text-2xl font-medium text-content-primary mb-2'>
                  {planet.name} Placements
                </h2>
                <p className='text-content-muted text-sm'>
                  {planet.name} governs {planet.themes}. Rules {planet.rules}.
                </p>
              </div>
              <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2'>
                {signs.map(([signKey, sign]) => (
                  <Link
                    key={signKey}
                    href={`/grimoire/placements/${planetKey}-in-${signKey}`}
                    className='p-3 rounded-lg bg-surface-card/50 hover:bg-surface-overlay/50 border border-stroke-default/50 hover:border-lunary-primary-600 transition-colors text-center group'
                  >
                    <div className='text-lg mb-1'>
                      {sign.element === 'Fire'
                        ? '🔥'
                        : sign.element === 'Earth'
                          ? '🌍'
                          : sign.element === 'Air'
                            ? '💨'
                            : '💧'}
                    </div>
                    <div className='text-sm text-content-secondary group-hover:text-content-brand transition-colors'>
                      {sign.name}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section
          id='sign-links'
          className='p-6 rounded-lg border border-lunary-primary-700 bg-layer-base/10'
        >
          <h2 className='text-xl font-medium text-content-primary mb-4'>
            Browse by Zodiac Sign
          </h2>
          <div className='flex flex-wrap gap-3'>
            {signs.map(([signKey, sign]) => (
              <Link
                key={signKey}
                href={`/grimoire/zodiac/${signKey}`}
                className='px-4 py-2 rounded-lg bg-surface-card/50 hover:bg-surface-overlay/50 text-content-secondary hover:text-content-brand text-sm transition-colors'
              >
                {sign.name}
              </Link>
            ))}
          </div>
        </section>

        <ExploreGrimoire />
      </SEOContentTemplate>
    </>
  );
}
