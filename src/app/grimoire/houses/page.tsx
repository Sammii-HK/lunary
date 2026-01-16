import { Metadata } from 'next';
import Link from 'next/link';
import {
  HOUSES,
  HOUSE_DATA,
  PLANETS_FOR_HOUSES,
  PLANET_HOUSE_DISPLAY,
  getOrdinalSuffix,
} from '@/constants/seo/houses';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import {
  createItemListSchema,
  renderJsonLd,
  createBreadcrumbSchema,
} from '@/lib/schema';

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

export default function HousesIndexPage() {
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

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(housesListSchema)}
      {renderJsonLd(
        createBreadcrumbSchema([
          { name: 'Grimoire', url: '/grimoire' },
          { name: 'Houses', url: '/grimoire/houses' },
        ]),
      )}
      <div className='max-w-6xl mx-auto px-4 py-12'>
        <Breadcrumbs
          items={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Houses' },
          ]}
        />

        <h1 className='text-4xl font-light mb-4'>The 12 Astrological Houses</h1>
        <p className='text-lg text-zinc-400 mb-8 max-w-3xl'>
          The houses in astrology represent different areas of life, from self
          and identity to spirituality and the unconscious. Each house is a
          stage where planets perform their roles.
        </p>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12'>
          {HOUSES.map((house) => {
            const data = HOUSE_DATA[house];
            return (
              <div
                key={house}
                className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'
              >
                <div className='flex items-center gap-3 mb-3'>
                  <span className='text-3xl font-light text-lunary-primary-400'>
                    {house}
                  </span>
                  <span className='text-xs text-zinc-400'>
                    Natural Ruler: {data.naturalSign}
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

        <h2 className='text-2xl font-light mb-6'>Planets in Houses</h2>
        <div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-12'>
          {PLANETS_FOR_HOUSES.slice(0, 10).map((planet) => (
            <Link
              key={planet}
              href={`/grimoire/houses/${planet}`}
              className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-lunary-primary-600 transition-all text-center group'
            >
              <div className='font-medium group-hover:text-lunary-primary-300 transition-colors'>
                {PLANET_HOUSE_DISPLAY[planet]}
              </div>
              <div className='text-xs text-zinc-400'>in houses</div>
            </Link>
          ))}
        </div>

        <div className='p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'>
          <h2 className='text-xl font-medium text-lunary-primary-300 mb-2'>
            Discover Your House Placements
          </h2>
          <p className='text-zinc-300 mb-4'>
            Find out which planets are in which houses in your natal chart.
          </p>
          <Link
            href='/birth-chart'
            className='inline-flex px-6 py-3 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 font-medium transition-colors'
          >
            View Your Birth Chart
          </Link>
        </div>

        <ExploreGrimoire />
      </div>
    </div>
  );
}
