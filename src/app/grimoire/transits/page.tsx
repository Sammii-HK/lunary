import { Metadata } from 'next';
import Link from 'next/link';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import {
  YEARLY_TRANSITS,
  getTransitsForYear,
} from '@/constants/seo/yearly-transits';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title:
    'Yearly Astrological Transits 2025-2030: Major Planetary Movements | Lunary',
  description:
    'Complete guide to major astrological transits from 2025-2030. Saturn Return, Jupiter transits, Uranus ingresses, and more. Plan ahead with cosmic awareness.',
  keywords: [
    'astrological transits',
    'saturn return',
    'jupiter transit',
    'yearly astrology',
    '2025 transits',
    '2026 transits',
  ],
  openGraph: {
    title: 'Yearly Astrological Transits 2025-2030 | Lunary',
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
    title: 'Yearly Astrological Transits 2025-2030 | Lunary',
    description: 'Complete guide to major astrological transits.',
    images: ['/api/og/grimoire/transits'],
  },
  alternates: { canonical: 'https://lunary.app/grimoire/transits' },
};

const years = [2025, 2026, 2027, 2028, 2029, 2030];

export default function TransitsIndexPage() {
  const transitsListSchema = createItemListSchema({
    name: 'Yearly Astrological Transits 2025-2030',
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
        <p className='text-lg text-zinc-400 mb-8 max-w-3xl'>
          Major planetary transits shape the collective experience and personal
          growth opportunities. Explore what the cosmos has in store from 2025
          through 2030.
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
                      {transit.description}
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
        <ExploreGrimoire />
      </div>
    </div>
  );
}
