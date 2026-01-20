import { Metadata } from 'next';
import Link from 'next/link';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import {
  PLANETS,
  ASPECTS,
  PLANET_DISPLAY,
  PLANET_SYMBOLS,
  ASPECT_DATA,
} from '@/constants/seo/aspects';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';
import {
  createItemListSchema,
  renderJsonLd,
  createBreadcrumbSchema,
} from '@/lib/schema';

const ASPECT_COLOR: Record<
  (typeof ASPECT_DATA)[keyof typeof ASPECT_DATA]['nature'],
  { border: string; bg: string; badge: string }
> = {
  harmonious: {
    border: 'border-lunary-success-500/70',
    bg: 'bg-gradient-to-br from-lunary-success-900/30 to-lunary-success-950/30',
    badge: 'bg-lunary-success-900 text-lunary-success-300',
  },
  challenging: {
    border: 'border-lunary-error-500/60',
    bg: 'bg-gradient-to-br from-lunary-error-900/30 to-lunary-error-950/30',
    badge: 'bg-lunary-error-900 text-lunary-error-300',
  },
  neutral: {
    border: 'border-zinc-700/70',
    bg: 'bg-gradient-to-br from-zinc-900/60 to-zinc-950/40',
    badge: 'bg-zinc-900 text-zinc-300',
  },
};

export const metadata: Metadata = {
  title:
    'Astrological Aspects: Conjunct, Trine, Square, Sextile, Opposition | Lunary',
  description:
    'Complete guide to astrological aspects. Learn about conjunctions, trines, squares, sextiles, and oppositions between planets in your natal chart, transits, and synastry.',
  keywords: [
    'astrological aspects',
    'conjunction',
    'trine',
    'square',
    'sextile',
    'opposition',
    'natal aspects',
    'synastry aspects',
  ],
  openGraph: {
    title:
      'Astrological Aspects: Conjunct, Trine, Square, Sextile, Opposition | Lunary',
    description:
      'Complete guide to astrological aspects in natal charts, transits, and synastry.',
    url: 'https://lunary.app/grimoire/aspects',
    images: [
      {
        url: '/api/og/grimoire/aspects',
        width: 1200,
        height: 630,
        alt: 'Astrological Aspects Guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Astrological Aspects Guide | Lunary',
    description: 'Complete guide to astrological aspects.',
    images: ['/api/og/grimoire/aspects'],
  },
  alternates: { canonical: 'https://lunary.app/grimoire/aspects' },
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

export default function AspectsIndexPage() {
  const aspectsListSchema = createItemListSchema({
    name: 'Astrological Aspects',
    description:
      'Complete guide to astrological aspects including conjunctions, trines, squares, sextiles, and oppositions.',
    url: 'https://lunary.app/grimoire/aspects',
    items: ASPECTS.map((aspect) => ({
      name: ASPECT_DATA[aspect].displayName,
      url: `https://lunary.app/grimoire/aspects/types/${aspect}`,
      description: `${ASPECT_DATA[aspect].degrees}° - ${ASPECT_DATA[aspect].keywords.join(', ')}`,
    })),
  });

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(aspectsListSchema)}
      {renderJsonLd(
        createBreadcrumbSchema([
          { name: 'Grimoire', url: '/grimoire' },
          { name: 'Aspects', url: '/grimoire/aspects' },
        ]),
      )}
      <div className='max-w-6xl mx-auto px-4 py-12'>
        <Breadcrumbs
          items={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Aspects' },
          ]}
        />

        <h1 className='text-4xl font-light mb-4'>Astrological Aspects</h1>
        <p className='text-lg text-zinc-400 mb-8 max-w-3xl'>
          Aspects are the angles between planets in a chart, revealing how their
          energies interact. From harmonious trines to challenging squares, each
          aspect tells a unique story.
        </p>

        <h2 className='text-2xl font-light mb-6'>The Five Major Aspects</h2>
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12'>
          {ASPECTS.map((aspect) => {
            const data = ASPECT_DATA[aspect];
            const palette = ASPECT_COLOR[data.nature];
            return (
              <div
                key={aspect}
                className={`p-6 rounded-2xl border ${palette.border} ${palette.bg} shadow-lg shadow-black/60`}
              >
                <div className='flex items-start justify-between gap-4 mb-4'>
                  <div>
                    <p className='text-[0.65rem] uppercase tracking-[0.4em] text-zinc-400'>
                      Aspect sign
                    </p>
                    <span className='text-4xl font-medium leading-none'>
                      {data.symbol}
                    </span>
                  </div>
                  <div className='text-right'>
                    <p className='text-[0.65rem] uppercase tracking-[0.4em] text-zinc-400'>
                      Degrees
                    </p>
                    <span className='text-lg font-semibold text-zinc-100'>
                      {data.degrees}°
                    </span>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center justify-center text-[0.65rem] font-semibold uppercase tracking-[0.35em] px-3 py-1 rounded-full ${palette.badge} mb-3`}
                >
                  {data.displayName}
                </span>
                <p className='text-sm text-zinc-200 mb-3'>{data.description}</p>
                <div className='flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-zinc-300'>
                  {data.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className='rounded-full border border-zinc-700 px-2 py-1 bg-black/20'
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <h2 className='text-2xl font-light mb-6'>
          Explore Planet Combinations
        </h2>
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12'>
          {PLANETS.slice(0, 6).map((planet) => (
            <Link
              key={planet}
              href={`/grimoire/aspects/${planet}/conjunct/${PLANETS.find((p) => p !== planet) || 'moon'}`}
              className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
            >
              <div className='text-3xl mb-2'>{PLANET_SYMBOLS[planet]}</div>
              <h3 className='text-lg font-medium group-hover:text-lunary-primary-300 transition-colors'>
                {PLANET_DISPLAY[planet]} Aspects
              </h3>
              <p className='text-sm text-zinc-400'>
                Explore all {PLANET_DISPLAY[planet]} aspect combinations
              </p>
            </Link>
          ))}
        </div>

        <div className='p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'>
          <h2 className='text-xl font-medium text-lunary-primary-300 mb-2'>
            Find Aspects in Your Chart
          </h2>
          <p className='text-zinc-300 mb-4'>
            Discover the aspects in your natal chart and understand how your
            planetary energies interact.
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
