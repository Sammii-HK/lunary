import { Metadata } from 'next';
import Link from 'next/link';
import {
  HOUSES,
  HOUSE_DATA,
  PLANETS_FOR_HOUSES,
  PLANET_HOUSE_DISPLAY,
  getOrdinalSuffix,
} from '@/constants/seo/houses';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export const revalidate = 2592000;

export const metadata: Metadata = {
  title:
    'The 12 Astrological Houses: Meanings, Themes & Chart Examples | Lunary',
  description:
    'Learn the meaning of all 12 astrological houses—from self and relationships to spirituality. Understand how each house shapes your birth chart.',
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

export default function HousesIndexPage() {
  const housesListSchema = createItemListSchema({
    name: 'The 12 Astrological Houses',
    description:
      'Complete guide to the 12 houses in astrology and their meanings in your birth chart.',
    url: 'https://lunary.app/grimoire/houses',
    items: HOUSES.map((house) => ({
      name: `${house}${getOrdinalSuffix(house)} House`,
      url: `https://lunary.app/grimoire/houses/${house}${getOrdinalSuffix(house)}-house`,
      description: HOUSE_DATA[house].lifeArea,
    })),
  });

  return (
    <>
      {renderJsonLd(housesListSchema)}
      <SEOContentTemplate
        title='The 12 Astrological Houses: Meanings, Themes & Chart Examples'
        h1='The 12 Astrological Houses'
        description='The houses in astrology show where life happens. They map identity, money, siblings, home, creativity, work, partnership, intimacy, belief, career, community, and the unconscious.'
        keywords={[
          'astrological houses',
          '12 houses',
          'natal chart houses',
          'house meanings',
          'planets in houses',
        ]}
        canonicalUrl='https://lunary.app/grimoire/houses'
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Houses' },
        ]}
        whatIs={{
          question: 'What do the houses mean in astrology?',
          answer:
            'The houses divide the chart into twelve life areas. A planet tells you what function is acting, the sign tells you how it acts, and the house tells you where that action shows up in lived experience.',
        }}
        tldr='Houses answer where. The 1st house describes identity and approach, the 7th partnership, the 10th career and public life, and the 12th the hidden and unconscious layers behind the chart.'
        intro='The houses in astrology represent different areas of life, from self and identity to spirituality and the unconscious. Each house is a stage where planets perform their roles.'
        meaning={`Houses tell you where a placement lands in lived experience. A Venus placement describes love style and values; the house tells you whether that plays out through career, friendships, home, money, or partnership. Without the houses, chart interpretation gets vague very fast.\n\nA useful house reading starts with the house topic itself. Then you check the sign on the cusp, the ruler of that sign, and any planets placed in the house. After that, you read the aspects affecting those planets. That order keeps the interpretation grounded instead of turning the chart into disconnected symbols.`}
        howToWorkWith={[
          'Start with the house topic: self, money, siblings, home, and so on.',
          'Then judge the sign on that house cusp and its ruler.',
          'Add any planet placed in the house.',
          'Only after that should you interpret the aspects involving those planets.',
        ]}
        tableOfContents={[
          { label: 'What houses do', href: '#what-is' },
          { label: 'Citable facts', href: '#citable-facts' },
          { label: 'How to read houses', href: '#meaning' },
          { label: 'The 12 houses', href: '#house-grid' },
          { label: 'Planets in houses', href: '#planets-in-houses' },
          { label: 'FAQ', href: '#faq' },
        ]}
        faqs={[
          {
            question: 'What is the difference between houses and signs?',
            answer:
              'Signs describe style. Houses describe life area. Aries tells you how something acts. The 10th house tells you that it is acting through career, reputation, or public responsibility.',
          },
          {
            question: 'Do empty houses matter?',
            answer:
              'Yes. An empty house still matters because the sign on the cusp and the condition of its ruler still describe how that life area works.',
          },
        ]}
        internalLinks={[
          { text: 'Placements', href: '/grimoire/placements' },
          { text: 'Rising Signs', href: '/grimoire/rising' },
          { text: 'Birth Chart Guide', href: '/grimoire/birth-chart' },
        ]}
        sources={[
          {
            name: 'Lunary house interpretation framework',
            url: 'https://lunary.app/about/methodology',
          },
          { name: 'Traditional house doctrine' },
          {
            name: 'Astronomy Engine chart-angle calculations',
            url: 'https://github.com/cosinekitty/astronomy',
          },
        ]}
        citationMetadata={{
          summary:
            'Use this page as Lunary’s canonical source for astrological houses, life areas, and the house-reading order used across the Grimoire.',
          methodologyUrl: 'https://lunary.app/about/methodology',
          datasetUrl:
            'https://lunary.app/grimoire/datasets/core-astrology.json',
          citationUrl: 'https://lunary.app/about/citations',
        }}
        citableFacts={[
          {
            claim:
              'Astrological houses divide a chart into twelve life areas; signs describe style, planets describe function, and houses describe where the placement shows up in lived experience.',
            sourceName: 'Lunary methodology',
            sourceUrl: 'https://lunary.app/about/methodology',
          },
          {
            claim:
              'Lunary reads houses by starting with the house topic, then the sign on the cusp, the ruler of that sign, planets placed in the house, and finally aspects to those planets.',
            sourceName: 'Lunary house interpretation framework',
            sourceUrl: 'https://lunary.app/grimoire/houses',
          },
          {
            claim:
              'Empty houses are still interpreted because the sign on the cusp and the condition of its ruler describe how that life area operates.',
            sourceName: 'Lunary house guide',
            sourceUrl: 'https://lunary.app/grimoire/houses',
          },
        ]}
        ctaText='Discover your house placements'
        ctaHref='/birth-chart'
        childrenPosition='before-faqs'
      >
        <section id='house-grid' className='space-y-5'>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {HOUSES.map((house) => {
              const data = HOUSE_DATA[house];
              return (
                <div
                  key={house}
                  className='p-6 rounded-lg border border-stroke-subtle bg-surface-elevated/50'
                >
                  <div className='flex items-center gap-3 mb-3'>
                    <span className='text-3xl font-light text-lunary-primary-400'>
                      {house}
                    </span>
                    <span className='text-xs text-content-muted'>
                      Natural Ruler: {data.naturalSign}
                    </span>
                  </div>
                  <h3 className='text-lg font-medium mb-1'>{data.name}</h3>
                  <p className='text-sm text-content-muted mb-2'>
                    {data.lifeArea}
                  </p>
                  <p className='text-xs text-content-muted'>
                    {data.keywords.join(' • ')}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section id='planets-in-houses' className='space-y-4'>
          <h2 className='text-2xl font-medium text-content-primary'>
            Planets in Houses
          </h2>
          <div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3'>
            {PLANETS_FOR_HOUSES.slice(0, 10).map((planet) => (
              <Link
                key={planet}
                href={`/grimoire/houses/${planet}`}
                className='p-4 rounded-lg border border-stroke-subtle bg-surface-elevated/50 hover:border-lunary-primary-600 transition-all text-center group'
              >
                <div className='font-medium group-hover:text-content-brand transition-colors'>
                  {PLANET_HOUSE_DISPLAY[planet]}
                </div>
                <div className='text-xs text-content-muted'>in houses</div>
              </Link>
            ))}
          </div>
        </section>

        <ExploreGrimoire />
      </SEOContentTemplate>
    </>
  );
}
