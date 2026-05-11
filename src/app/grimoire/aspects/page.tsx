import { Metadata } from 'next';
import Link from 'next/link';
import {
  PLANETS,
  ASPECTS,
  PLANET_DISPLAY,
  PLANET_SYMBOLS,
  ASPECT_DATA,
} from '@/constants/seo/aspects';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export const revalidate = 2592000;

const ASPECT_COLOR: Record<
  (typeof ASPECT_DATA)[keyof typeof ASPECT_DATA]['nature'],
  { border: string; bg: string; badge: string }
> = {
  harmonious: {
    border: 'border-lunary-success-500/70',
    bg: 'bg-gradient-to-br from-lunary-success-900/30 to-lunary-success-950/30',
    badge: 'bg-layer-base text-lunary-success-300',
  },
  challenging: {
    border: 'border-lunary-error-500/60',
    bg: 'bg-gradient-to-br from-lunary-error-900/30 to-lunary-error-950/30',
    badge: 'bg-layer-base text-lunary-error-300',
  },
  neutral: {
    border: 'border-stroke-default/70',
    bg: 'bg-gradient-to-br from-surface-elevated/60 to-surface-base/40',
    badge: 'bg-surface-elevated text-content-secondary',
  },
};

const ASPECT_TYPE_SLUGS: Record<(typeof ASPECTS)[number], string> = {
  conjunct: 'conjunction',
  sextile: 'sextile',
  square: 'square',
  trine: 'trine',
  opposite: 'opposition',
  quincunx: 'quincunx',
  semisextile: 'semisextile',
};

export const metadata: Metadata = {
  title:
    'Astrological Aspects: Meanings of Conjunction, Trine, Square and More | Lunary',
  description:
    'Learn what astrological aspects mean in natal charts and transits. Clear explanations of conjunctions, trines, squares, sextiles, and oppositions.',
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
      url: `https://lunary.app/grimoire/aspects/types/${ASPECT_TYPE_SLUGS[aspect]}`,
      description: `${ASPECT_DATA[aspect].degrees}° - ${ASPECT_DATA[aspect].keywords.join(', ')}`,
    })),
  });

  return (
    <>
      {renderJsonLd(aspectsListSchema)}
      <SEOContentTemplate
        title='Astrological Aspects: Meanings of Conjunction, Trine, Square and More'
        h1='Astrological Aspects'
        description='Aspects are the angles between planets in a chart. They show how planetary functions cooperate, intensify, or create tension.'
        keywords={[
          'astrological aspects',
          'conjunction',
          'trine',
          'square',
          'sextile',
          'opposition',
        ]}
        canonicalUrl='https://lunary.app/grimoire/aspects'
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Aspects' },
        ]}
        whatIs={{
          question: 'What do aspects mean in astrology?',
          answer:
            'Aspects are the angular relationships between planets. They describe how two planetary functions relate to each other: smoothly, tensely, or with concentrated intensity.',
        }}
        tldr='An aspect is not the whole interpretation. The aspect shows how two planets relate. The planets tell you what is relating. The houses tell you where it lands.'
        intro='Aspects are the angles between planets in a chart, revealing how their energies interact. From harmonious trines to challenging squares, each aspect tells a different relational story inside the chart.'
        meaning={`The mistake people make with aspects is treating the symbol as the whole interpretation. It isn't. An aspect tells you how two planets relate. The planets tell you what is relating. The houses tell you where it lands. That is why the same square can feel completely different in two charts.\n\nRead aspects after you know the planets and houses involved. Then judge whether the aspect is supportive, tense, or mixed, and whether that pattern repeats elsewhere in the chart.`}
        howToWorkWith={[
          'Identify the two planets involved.',
          'Check which houses those planets occupy.',
          'Notice whether the aspect is supportive, tense, or mixed.',
          'Judge repetition: one aspect matters, but a pattern matters more.',
        ]}
        tableOfContents={[
          { label: 'What aspects are', href: '#what-is' },
          { label: 'How to read an aspect', href: '#meaning' },
          { label: 'Major aspect degrees', href: '#aspect-degrees' },
          { label: 'Planet combinations', href: '#planet-combinations' },
          { label: 'FAQ', href: '#faq' },
        ]}
        faqs={[
          {
            question: 'What is the difference between a trine and a square?',
            answer:
              'A trine usually shows smoother flow or natural ease between two functions. A square usually shows tension, friction, or productive pressure that pushes growth.',
          },
          {
            question: 'Are conjunctions always good?',
            answer:
              'No. A conjunction intensifies and merges energies. Whether that feels constructive or difficult depends on the planets involved, their condition, and the rest of the chart.',
          },
        ]}
        internalLinks={[
          { text: 'Planets', href: '/grimoire/astronomy/planets' },
          { text: 'Houses', href: '/grimoire/houses' },
          { text: 'Placements', href: '/grimoire/placements' },
        ]}
        sources={[
          {
            name: 'Lunary aspect interpretation framework',
            url: 'https://lunary.app/about/methodology',
          },
          { name: 'Traditional aspect doctrine' },
          {
            name: 'Astronomy Engine planetary calculations',
            url: 'https://github.com/cosinekitty/astronomy',
          },
        ]}
        ctaText='Find aspects in your chart'
        ctaHref='/birth-chart'
        childrenPosition='before-faqs'
      >
        <section id='aspect-degrees' className='space-y-6'>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
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
                      <p className='text-[0.65rem] uppercase tracking-[0.4em] text-content-muted'>
                        Aspect sign
                      </p>
                      <span className='text-4xl font-medium leading-none'>
                        {data.symbol}
                      </span>
                    </div>
                    <div className='text-right'>
                      <p className='text-[0.65rem] uppercase tracking-[0.4em] text-content-muted'>
                        Degrees
                      </p>
                      <span className='text-lg font-semibold text-content-primary'>
                        {data.degrees}°
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center justify-center text-[0.65rem] font-semibold uppercase tracking-[0.35em] px-3 py-1 rounded-full ${palette.badge} mb-3`}
                  >
                    {data.displayName}
                  </span>
                  <p className='text-sm text-content-primary mb-3'>
                    {data.description}
                  </p>
                  <div className='flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-content-secondary'>
                    {data.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className='rounded-full border border-stroke-default px-2 py-1 bg-surface-base/20'
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id='planet-combinations' className='space-y-4'>
          <h2 className='text-2xl font-medium text-content-primary'>
            Explore Planet Combinations
          </h2>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {PLANETS.slice(0, 6).map((planet) => (
              <Link
                key={planet}
                href={`/grimoire/aspects/${planet}`}
                className='p-6 rounded-lg border border-stroke-subtle bg-surface-elevated/50 hover:border-lunary-primary-600 transition-all group'
              >
                <div className='text-3xl mb-2'>{PLANET_SYMBOLS[planet]}</div>
                <h3 className='text-lg font-medium group-hover:text-content-brand transition-colors'>
                  {PLANET_DISPLAY[planet]} Aspects
                </h3>
                <p className='text-sm text-content-muted'>
                  Explore all {PLANET_DISPLAY[planet]} aspect combinations
                </p>
              </Link>
            ))}
          </div>
        </section>

        <ExploreGrimoire />
      </SEOContentTemplate>
    </>
  );
}
