import { Metadata } from 'next';
import Link from 'next/link';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import {
  YEARLY_TRANSITS,
  getTransitsForYear,
} from '@/constants/seo/yearly-transits';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import {
  createItemListSchema,
  renderJsonLd,
  createBreadcrumbSchema,
} from '@/lib/schema';

export const metadata: Metadata = {
  title:
    'Yearly Astrological Transits 2026-2030 | How Each Year Affects You | Lunary',
  description:
    'Plan for career, relationship, and personal shifts with the definitive 2026–2030 transit timeline, including who is affected and how to work with each planet’s energy.',
  keywords: [
    'astrological transits',
    'saturn return',
    'jupiter transit',
    'yearly astrology',
    '2026 transits',
    '2027 transits',
    '2028 transits',
    '2029 transits',
    '2030 transits',
    'uranus transit',
  ],
  openGraph: {
    title: 'Yearly Astrological Transits 2026-2030 | Lunary',
    description:
      'Complete guide to major astrological transits. Saturn Return, Jupiter transits, and more.',
    url: 'https://lunary.app/grimoire/transits',
    images: [
      {
        url: '/api/og/grimoire/transits',
        width: 1200,
        height: 630,
        alt: 'Astrological Transits Guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yearly Astrological Transits 2026-2030 | Lunary',
    description: 'Complete guide to major astrological transits.',
    images: ['/api/og/grimoire/transits'],
  },
  alternates: { canonical: 'https://lunary.app/grimoire/transits' },
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
};

const years = [2026, 2027, 2028, 2029, 2030];

export default function TransitsIndexPage() {
  const transitsListSchema = createItemListSchema({
    name: 'Yearly Astrological Transits 2026-2030',
    description:
      'Complete guide to major astrological transits including Saturn Return, Jupiter transits, and planetary ingresses.',
    url: 'https://lunary.app/grimoire/transits',
    items: YEARLY_TRANSITS.slice(0, 20).map((transit) => ({
      name: transit.title,
      url: `https://lunary.app/grimoire/transits/${transit.id}`,
      description: transit.description,
    })),
  });

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(transitsListSchema)}
      {renderJsonLd(
        createBreadcrumbSchema([
          { name: 'Grimoire', url: '/grimoire' },
          { name: 'Transits', url: '/grimoire/transits' },
        ]),
      )}
      <div className='max-w-6xl mx-auto px-4 py-12'>
        <Breadcrumbs
          items={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Transits' },
          ]}
        />

        <h1 className='text-4xl font-light mb-4'>
          Yearly Astrological Transits
        </h1>
        <p className='text-lg text-zinc-400 mb-6 max-w-3xl'>
          Every major transit from 2026 through 2030 is summarized here with key
          dates, planetary themes, and the signs it highlights so you can spot
          the turning points before they arrive.
        </p>

        <p className='text-base text-zinc-300 mb-8 max-w-3xl'>
          Think of each year as a curated list of what to watch for in
          relationships, career direction, and inner work—tap the cards to
          access specific feels, do/avoid guidance, and planet-by-planet notes.
        </p>

        <p className='text-base text-zinc-300 mb-8 max-w-3xl'>
          Not all transits affect everyone equally. Click a year below to see
          what themes shape relationships, career, and personal growth.
        </p>

        <div className='flex flex-wrap gap-3 mb-8'>
          {years.map((year) => (
            <a
              key={year}
              href={`#year-${year}`}
              className='px-4 py-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 transition-colors'
            >
              {year}
            </a>
          ))}
        </div>

        <div className='mb-10 p-5 rounded-lg border border-zinc-800 bg-zinc-900/40'>
          <p className='text-xs font-semibold tracking-[0.4em] uppercase text-lunary-primary-300 mb-2'>
            How to use this page
          </p>
          <p className='text-zinc-300 leading-relaxed mb-3'>
            Start by picking a year to scan the dates, feelings, and actions for
            each transit, then use your natal chart to see which houses get
            stirred.
          </p>
          <Link
            href='/horoscope'
            className='inline-flex px-4 py-2 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 transition-colors'
          >
            See your personal transit timeline
          </Link>
        </div>

        {years.map((year) => {
          const yearTransits = getTransitsForYear(year);
          if (yearTransits.length === 0) return null;

          return (
            <div key={year} id={`year-${year}`} className='mb-12'>
              <h2 className='text-2xl font-light mb-6 text-lunary-primary-300'>
                {year} Transits
              </h2>
              <div className='grid md:grid-cols-2 gap-4'>
                {yearTransits.map((transit) => (
                  <Link
                    key={transit.id}
                    href={`/grimoire/transits/${transit.id}`}
                    className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
                  >
                    <div className='text-sm text-zinc-400 mb-1'>
                      {transit.dates}
                    </div>
                    <h3 className='text-lg font-medium mb-2 group-hover:text-lunary-primary-300 transition-colors'>
                      {transit.title}
                    </h3>
                    <p className='text-sm text-zinc-400 line-clamp-2'>
                      Quick snapshot of dates, standout signs, and practical
                      steps so you know why to dive into this transit.
                    </p>
                    <div className='flex flex-wrap gap-1 mt-3'>
                      {transit.signs.map((sign) => (
                        <span
                          key={sign}
                          className='text-xs px-2 py-1 rounded bg-lunary-primary-900/20 text-lunary-primary-300'
                        >
                          {sign}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        <div className='p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'>
          <h2 className='text-xl font-medium text-lunary-primary-300 mb-2'>
            Personal Transit Readings
          </h2>
          <p className='text-zinc-300 mb-4'>
            See how these transits affect your personal natal chart for deeper
            insights.
          </p>
          <Link
            href='/horoscope'
            className='inline-flex px-6 py-3 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 font-medium transition-colors'
          >
            View Your Personal Transits
          </Link>
        </div>
        <div className='mt-8'>
          <CosmicConnections
            entityType='hub-transits'
            entityKey='transits'
            title='Transits Connections'
          />
        </div>
        <ExploreGrimoire />
      </div>
    </div>
  );
}
