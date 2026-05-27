import { Metadata } from 'next';
import Link from 'next/link';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { RotateCcw } from 'lucide-react';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';
import {
  createItemListSchema,
  renderJsonLd,
  createBreadcrumbSchema,
} from '@/lib/schema';

// 30-day ISR revalidation
export const revalidate = 2592000;
const retrogrades = [
  {
    slug: 'mercury',
    name: 'Mercury Retrograde',
    symbol: '☿',
    frequency: '3-4 times/year',
    duration: '~3 weeks',
    themes: 'Communication, travel, technology, contracts',
  },
  {
    slug: 'venus',
    name: 'Venus Retrograde',
    symbol: '♀',
    frequency: 'Every 18 months',
    duration: '~6 weeks',
    themes: 'Love, beauty, values, money, relationships',
  },
  {
    slug: 'mars',
    name: 'Mars Retrograde',
    symbol: '♂',
    frequency: 'Every 2 years',
    duration: '~2.5 months',
    themes: 'Action, energy, desire, anger, motivation',
  },
  {
    slug: 'jupiter',
    name: 'Jupiter Retrograde',
    symbol: '♃',
    frequency: 'Yearly',
    duration: '~4 months',
    themes: 'Growth, luck, expansion, beliefs, travel',
  },
  {
    slug: 'saturn',
    name: 'Saturn Retrograde',
    symbol: '♄',
    frequency: 'Yearly',
    duration: '~4.5 months',
    themes: 'Responsibility, structure, karma, limitations',
  },
  {
    slug: 'uranus',
    name: 'Uranus Retrograde',
    symbol: '♅',
    frequency: 'Yearly',
    duration: '~5 months',
    themes: 'Innovation, rebellion, change, technology',
  },
  {
    slug: 'neptune',
    name: 'Neptune Retrograde',
    symbol: '♆',
    frequency: 'Yearly',
    duration: '~5 months',
    themes: 'Dreams, illusions, spirituality, creativity',
  },
  {
    slug: 'pluto',
    name: 'Pluto Retrograde',
    symbol: '♇',
    frequency: 'Yearly',
    duration: '~5-6 months',
    themes: 'Transformation, power, death/rebirth, secrets',
  },
];

export const metadata: Metadata = {
  title:
    'Planetary Retrogrades: Dates, Meanings and How to Navigate Them | Lunary',
  description:
    'See retrograde dates for Mercury, Venus, Mars and more. Learn what retrogrades mean, how long they last, and how to work with the themes.',
  keywords: [
    'planetary retrograde',
    'mercury retrograde',
    'venus retrograde',
    'retrograde meaning',
    'retrograde effects',
  ],
  openGraph: {
    title: 'Planetary Retrogrades Guide | Lunary',
    description:
      'Understand all planetary retrogrades and how to navigate their energies.',
    url: 'https://lunary.app/grimoire/astronomy/retrogrades',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/astronomy/retrogrades',
  },
};

export default function RetrogradesIndexPage() {
  const currentYear = new Date().getFullYear();
  const retrogradesListSchema = createItemListSchema({
    name: 'Planetary Retrogrades Guide',
    description:
      'Complete guide to all planetary retrogrades from Mercury to Pluto.',
    url: 'https://lunary.app/grimoire/astronomy/retrogrades',
    items: retrogrades.map((r) => ({
      name: r.name,
      url: `https://lunary.app/grimoire/astronomy/retrogrades/${r.slug}`,
      description: r.themes,
    })),
  });

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      {renderJsonLd(retrogradesListSchema)}
      {renderJsonLd(
        createBreadcrumbSchema([
          { name: 'Grimoire', url: '/grimoire' },
          { name: 'Astronomy', url: '/grimoire/astronomy' },
          { name: 'Retrogrades', url: '/grimoire/astronomy/retrogrades' },
        ]),
      )}
      <div className='max-w-5xl mx-auto'>
        <Breadcrumbs
          items={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Astronomy', href: '/grimoire/astronomy' },
            { label: 'Retrogrades' },
          ]}
        />
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <RotateCcw className='w-16 h-16 text-lunary-primary-400' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-content-primary mb-4'>
            Planetary Retrogrades
          </h1>
          <p className='text-lg text-content-muted max-w-2xl mx-auto'>
            When a planet appears to move backward in the sky, it&apos;s
            retrograde. Each planet&apos;s retrograde brings opportunities for
            review, reflection, and revision.
          </p>
          <p className='text-content-muted max-w-3xl mx-auto mt-4'>
            Retrograde is not a random curse word. It is a timing condition. To
            read it well, ask which planet is retrograde, what that planet rules
            in astrology, which sign it is retracing, and where it falls in your
            chart. That tells you what is being reviewed and why.
          </p>
        </div>

        <div className='bg-surface-elevated/50 border border-stroke-subtle rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-content-primary mb-3'>
            What is Retrograde?
          </h2>
          <p className='text-content-muted mb-4'>
            Retrograde is an optical illusion caused by the relative positions
            and speeds of Earth and other planets. When a planet is retrograde,
            its energy turns inward — a time for reflection rather than new
            beginnings.
          </p>
          <p className='text-content-muted'>
            Rather than fearing retrogrades, use them as opportunities to
            revisit, revise, and reflect on the themes each planet represents.
          </p>
          <p className='text-sm text-content-muted mt-4'>
            Sources: Lunary transit interpretation framework, Astronomy Engine
            planetary calculations, traditional retrograde doctrine.
          </p>
        </div>

        <section
          id='citation-sources'
          className='bg-surface-elevated/45 border border-stroke-subtle rounded-xl p-6 mb-10'
        >
          <h2 className='text-xl font-medium text-content-primary mb-3'>
            Direct Answer and Citation Sources
          </h2>
          <p className='text-content-secondary mb-4'>
            A planetary retrograde is an apparent backward motion of a planet as
            seen from Earth. Lunary calculates retrograde windows from apparent
            geocentric planetary motion, then adds astrology interpretation for
            each planet.
          </p>
          <div className='flex flex-wrap gap-3'>
            <Link
              href={`/grimoire/datasets/astrology-calendar/${currentYear}.json`}
              className='px-4 py-2 rounded-lg border border-lunary-primary-700 text-content-brand hover:border-lunary-primary-500 transition-colors'
            >
              {currentYear} astrology calendar JSON
            </Link>
            <Link
              href='/grimoire/facts/next-mercury-retrograde'
              className='px-4 py-2 rounded-lg border border-lunary-primary-700 text-content-brand hover:border-lunary-primary-500 transition-colors'
            >
              Next Mercury retrograde fact
            </Link>
            <Link
              href='/grimoire/facts/mercury-retrograde-status'
              className='px-4 py-2 rounded-lg border border-lunary-primary-700 text-content-brand hover:border-lunary-primary-500 transition-colors'
            >
              Mercury status today
            </Link>
            <Link
              href='/about/methodology'
              className='px-4 py-2 rounded-lg border border-lunary-primary-700 text-content-brand hover:border-lunary-primary-500 transition-colors'
            >
              Methodology
            </Link>
          </div>
        </section>

        <div className='mb-12 p-6 rounded-lg border border-stroke-subtle bg-surface-elevated/40'>
          <h2 className='text-xl font-medium text-content-primary mb-3'>
            How to read a retrograde in your chart
          </h2>
          <ul className='list-disc pl-5 space-y-2 text-content-secondary'>
            <li>Start with the retrograde planet and what it governs.</li>
            <li>Check the sign for the style of review or reworking.</li>
            <li>Map it onto the natal house it is activating.</li>
            <li>
              Then look at aspects to your natal planets for the real story.
            </li>
          </ul>
        </div>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-content-primary mb-6'>
            All Planetary Retrogrades
          </h2>
          <div className='space-y-4'>
            {retrogrades.map((retrograde) => (
              <Link
                key={retrograde.slug}
                href={`/grimoire/astronomy/retrogrades/${retrograde.slug}`}
                className='group flex items-start gap-4 rounded-xl border border-stroke-subtle bg-surface-elevated/30 p-5 hover:bg-surface-elevated/50 hover:border-lunary-primary-600 transition-all'
              >
                <div className='text-3xl font-astro text-lunary-primary-400'>
                  {retrograde.symbol}
                </div>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-1'>
                    <h3 className='text-xl font-medium text-content-primary group-hover:text-content-brand transition-colors'>
                      {retrograde.name}
                    </h3>
                  </div>
                  <div className='flex gap-4 text-sm text-content-muted mb-2'>
                    <span>{retrograde.frequency}</span>
                    <span>•</span>
                    <span>{retrograde.duration}</span>
                  </div>
                  <p className='text-sm text-content-muted'>
                    Themes: {retrograde.themes}
                  </p>
                </div>
                <div className='text-content-muted group-hover:text-lunary-primary-400 transition-colors'>
                  →
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className='border-t border-stroke-subtle pt-8'>
          <h3 className='text-lg font-medium text-content-primary mb-4'>
            Explore More Astrology
          </h3>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/transits'
              className='px-4 py-2 rounded-lg bg-surface-card text-content-secondary hover:bg-surface-overlay transition-colors'
            >
              Transits
            </Link>
            <Link
              href='/grimoire/astronomy'
              className='px-4 py-2 rounded-lg bg-surface-card text-content-secondary hover:bg-surface-overlay transition-colors'
            >
              Astronomy
            </Link>
            <Link
              href='/grimoire/astrology/sky-now'
              className='px-4 py-2 rounded-lg bg-surface-card text-content-secondary hover:bg-surface-overlay transition-colors'
            >
              Sky Now
            </Link>
            <Link
              href='/grimoire/birth-chart'
              className='px-4 py-2 rounded-lg bg-surface-card text-content-secondary hover:bg-surface-overlay transition-colors'
            >
              Birth Chart Guide
            </Link>
          </div>
        </div>
        <ExploreGrimoire />
      </div>
    </div>
  );
}
