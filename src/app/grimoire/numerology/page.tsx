export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { NumerologyCalculator } from '@/components/grimoire/NumerologyCalculator';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
import {
  NUMEROLOGY_MEANINGS,
  getUniversalYear,
  getYearRange,
} from '@/constants/seo/numerology';
import {
  angelNumbers,
  lifePathNumbers,
} from '@/constants/grimoire/numerology-data';
import {
  karmicDebtNumbers,
  expressionNumbers,
  soulUrgeNumbers,
} from '@/constants/grimoire/numerology-extended-data';
import {
  mirrorHours,
  doubleHours,
} from '@/constants/grimoire/clock-numbers-data';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';

const faqs = [
  {
    question: 'What is numerology?',
    answer:
      'Numerology is the mystical study of numbers and their vibrational influence on personality, purpose, and destiny. It helps you notice patterns, hidden guidance, and cycles you can align with.',
  },
  {
    question: 'How do I calculate my Life Path Number?',
    answer:
      'Add the digits of your birth date until you reach a single digit (1-9) or a master number (11, 22, 33). For example, March 15, 1990 → 3+1+5+1+9+9+0=28 → 2+8=10 → 1+0=1.',
  },
  {
    question: 'What are angel numbers?',
    answer:
      'Angel numbers are repeating sequences (111, 222, 333, etc.) that appear as synchronicities. Pay attention to the thought or feeling you had when you saw them; they carry subtle guidance.',
  },
  {
    question: 'What is a Universal Year?',
    answer:
      'The Universal Year is the collective numerology theme for a calendar year. Add the digits of the year until you reach a single digit (e.g., 2025 → 2+0+2+5=9) and follow that year’s tone.',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Numerology Branches',
    links: [
      { label: 'Angel Numbers', href: '/grimoire/angel-numbers' },
      { label: 'Life Path Numbers', href: '/grimoire/life-path' },
      { label: 'Mirror Hours', href: '/grimoire/mirror-hours' },
      { label: 'Double Hours', href: '/grimoire/double-hours' },
    ],
  },
  {
    title: 'Related Practices',
    links: [
      { label: 'Tarot', href: '/grimoire/tarot' },
      { label: 'Astrology Basics', href: '/grimoire/beginners' },
      { label: 'Birth Chart', href: '/birth-chart' },
      { label: 'Divination', href: '/grimoire/divination' },
    ],
  },
];

const numerologyListSchema = createItemListSchema({
  name: 'Numerology Guide',
  description:
    'Complete guide to numerology including angel numbers, life path numbers, universal years, and practical tools.',
  url: 'https://lunary.app/grimoire/numerology',
  items: [
    {
      name: 'Angel Numbers',
      url: 'https://lunary.app/grimoire/angel-numbers',
      description: 'Repeating number sequences with divine guidance',
    },
    {
      name: 'Life Path Numbers',
      url: 'https://lunary.app/grimoire/life-path',
      description: 'Your life purpose calculated from your birth date',
    },
    {
      name: 'Expression Numbers',
      url: 'https://lunary.app/grimoire/numerology/expression',
      description: 'Natural talents and abilities drawn from your name',
    },
    {
      name: 'Soul Urge Numbers',
      url: 'https://lunary.app/grimoire/numerology/soul-urge',
      description: 'Innermost motivations and heart’s desire',
    },
    {
      name: 'Mirror Hours',
      url: 'https://lunary.app/grimoire/mirror-hours',
      description: 'Mirrored clock times with symbolic meaning',
    },
    {
      name: 'Double Hours',
      url: 'https://lunary.app/grimoire/double-hours',
      description: 'Repeated hour and minute combinations on the clock',
    },
  ],
});

const tableOfContents = [
  { label: 'Universal Year Forecast', href: '#universal-year' },
  { label: 'Angel Numbers', href: '#angel-numbers' },
  { label: 'Life Path Numbers', href: '#life-path' },
  { label: 'Core Numbers', href: '#core-numbers' },
  { label: 'Clock Numbers', href: '#clock-numbers' },
  { label: 'Universal Year Meanings', href: '#universal-year-meanings' },
  { label: 'Year Forecasts', href: '#year-forecasts' },
  { label: 'Calculate Your Numbers', href: '#calculate' },
  { label: 'FAQ', href: '#faq' },
];

const whatIs = {
  question: 'What is numerology at Lunary?',
  answer:
    'Numerology is the study of numbers and their vibrations—how they describe your personality, purpose, and destiny. It reveals cycles, guides alignment, and invites reflection.',
};

const intro =
  'Numerology translates everyday digits into themes, patterns, and guidance. From angel numbers and life paths to the Universal Year, it helps you decode the energetic context around every moment.';

const howToWorkWith = [
  'Track repeating numbers (mirror hours, double hours, sequences) and note the question or feeling that accompanied them.',
  'Use the calculators to discover your personal numbers, then journal what the interpretations reveal about your choices.',
  'Align with the Universal Year by timing big moves to that year’s energy while still honoring your personal year and cycle.',
];

const relatedItems = [
  {
    name: 'Mirror Hours',
    href: '/grimoire/mirror-hours',
    type: 'Synchronicities',
  },
  {
    name: 'Double Hours',
    href: '/grimoire/double-hours',
    type: 'Repeating times',
  },
  {
    name: 'Life Path Numbers',
    href: '/grimoire/life-path',
    type: 'Purpose',
  },
  {
    name: 'Expression Numbers',
    href: '/grimoire/numerology/expression',
    type: 'Talents',
  },
];

export const metadata: Metadata = {
  title:
    'Numerology Guide: Angel Numbers, Life Path & Universal Years | Lunary',
  description:
    'Complete numerology guide. Learn about angel numbers (111, 222, 333), life path numbers, universal years, and how numeric vibrations influence your life.',
  keywords: [
    'numerology',
    'angel numbers',
    'life path number',
    'universal year',
    '111 meaning',
    '222 meaning',
    '333 meaning',
    'numerology forecast',
  ],
  openGraph: {
    title: 'Numerology Guide: Angel Numbers, Life Path & Universal Years',
    description:
      'Complete guide to numerology - angel numbers, life path numbers, and Universal Year meanings.',
    url: 'https://lunary.app/grimoire/numerology',
    images: [
      {
        url: '/api/og/grimoire/numerology',
        width: 1200,
        height: 630,
        alt: 'Numerology Guide - Lunary',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Numerology Guide: Angel Numbers, Life Path & Universal Years',
    description:
      'Complete guide to numerology - angel numbers, life path numbers, and Universal Year meanings.',
    images: ['/api/og/grimoire/numerology'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/numerology',
  },
};

export default function NumerologyIndexPage() {
  const currentYear = new Date().getFullYear();
  const currentUniversalYear = getUniversalYear(currentYear);

  return (
    <>
      {renderJsonLd(numerologyListSchema)}
      <SEOContentTemplate
        title={metadata.title as string}
        h1='Numerology'
        description={metadata.description as string}
        keywords={metadata.keywords as string[]}
        canonicalUrl={
          (metadata.alternates?.canonical as string) ??
          'https://lunary.app/grimoire/numerology'
        }
        tableOfContents={tableOfContents}
        whatIs={whatIs}
        intro={intro}
        howToWorkWith={howToWorkWith}
        faqs={faqs}
        relatedItems={relatedItems}
        cosmicConnections={
          <CosmicConnections
            entityType='hub-glossary'
            entityKey='numerology'
            title='Numerology Connections'
            sections={cosmicConnectionsSections}
          />
        }
      >
        <section id='universal-year' className='mb-16'>
          <div className='grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 md:p-8'>
            <div className='flex flex-wrap items-center gap-4'>
              <span className='text-5xl font-light text-lunary-primary-300'>
                {currentUniversalYear}
              </span>
              <div>
                <h2 className='text-2xl font-medium text-zinc-100'>
                  {currentYear}: Universal Year {currentUniversalYear}
                </h2>
                <p className='text-sm text-zinc-400'>
                  {NUMEROLOGY_MEANINGS[currentUniversalYear].theme}
                </p>
              </div>
            </div>
            <p className='text-zinc-300'>
              {NUMEROLOGY_MEANINGS[currentUniversalYear].energy}
            </p>
            <Link
              href={`/grimoire/numerology/year/${currentYear}`}
              className='inline-flex items-center gap-2 rounded-lg border border-lunary-primary-700 px-4 py-2 text-sm text-lunary-primary-300 transition-colors hover:bg-lunary-primary-900/20'
            >
              Read {currentYear} Full Forecast
            </Link>
          </div>
        </section>

        <section id='angel-numbers' className='mb-16'>
          <Link
            href='/grimoire/angel-numbers'
            className='group inline-flex items-center gap-2 text-2xl font-light text-zinc-100 transition-colors hover:text-lunary-accent-300'
          >
            Angel Numbers
            <span className='text-sm text-zinc-500 transition-colors group-hover:text-lunary-accent-300'>
              →
            </span>
          </Link>
          <p className='mt-4 text-zinc-400 mb-6'>
            Angel numbers are repeating sequences that show up as subtle nudges
            from the universe. Notice what you were thinking when they appeared.
          </p>
          <div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3'>
            {Object.entries(angelNumbers).map(([num, data]) => (
              <Link
                key={num}
                href={`/grimoire/angel-numbers/${num}`}
                className='group rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-center transition-all hover:border-lunary-accent-600 hover:bg-zinc-900'
              >
                <div className='text-2xl font-light text-lunary-accent-400 group-hover:text-lunary-accent-300'>
                  {num}
                </div>
                <p className='text-xs text-zinc-400'>
                  {data.meaning.split(' & ')[0]}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section id='life-path' className='mb-16'>
          <Link
            href='/grimoire/life-path'
            className='group inline-flex items-center gap-2 text-2xl font-light text-zinc-100 transition-colors hover:text-lunary-secondary-300'
          >
            Life Path Numbers
            <span className='text-sm text-zinc-500 transition-colors group-hover:text-lunary-secondary-300'>
              →
            </span>
          </Link>
          <p className='mt-4 text-zinc-400 mb-6'>
            Your Life Path Number reveals your destiny themes, gifts, and the
            lessons you’re here to learn.
          </p>
          <div className='grid md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {Object.entries(lifePathNumbers).map(([num, data]) => (
              <Link
                key={num}
                href={`/grimoire/life-path/${num}`}
                className='group rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-lunary-secondary-600 hover:bg-zinc-900'
              >
                <div className='flex items-center gap-2 mb-2'>
                  <span className='text-3xl font-light text-lunary-secondary-400 group-hover:text-lunary-secondary-300'>
                    {num}
                  </span>
                  <span className='text-sm text-zinc-400'>{data.meaning}</span>
                </div>
                <p className='text-sm text-zinc-400 line-clamp-2'>
                  {data.description.split('.')[0]}.
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section id='core-numbers' className='mb-16'>
          <h2 className='text-2xl font-light text-zinc-100 mb-6'>
            Core Numbers
          </h2>
          <div className='grid md:grid-cols-3 gap-6'>
            <div className='rounded-lg border border-zinc-800 bg-zinc-900/50 p-6'>
              <Link
                href='/grimoire/numerology/expression'
                className='group inline-flex items-center gap-2 text-xl font-medium text-lunary-secondary-400 transition-colors hover:text-lunary-secondary-300'
              >
                Expression Numbers →
              </Link>
              <p className='text-sm text-zinc-400 mb-4'>
                Also called Destiny Number, it reveals your natural talents and
                abilities.
              </p>
              <div className='flex flex-wrap gap-2 text-xs'>
                {Object.keys(expressionNumbers)
                  .slice(0, 9)
                  .map((num) => (
                    <Link
                      key={num}
                      href={`/grimoire/numerology/expression/${num}`}
                      className='rounded border border-zinc-700 px-3 py-1 transition-colors hover:border-lunary-secondary-600'
                    >
                      {num}
                    </Link>
                  ))}
              </div>
            </div>
            <div className='rounded-lg border border-zinc-800 bg-zinc-900/50 p-6'>
              <Link
                href='/grimoire/numerology/soul-urge'
                className='group inline-flex items-center gap-2 text-xl font-medium text-lunary-accent-400 transition-colors hover:text-lunary-accent-300'
              >
                Soul Urge Numbers →
              </Link>
              <p className='text-sm text-zinc-400 mb-4'>
                Also called Heart’s Desire, it describes your innermost
                motivations.
              </p>
              <div className='flex flex-wrap gap-2 text-xs'>
                {Object.keys(soulUrgeNumbers)
                  .slice(0, 9)
                  .map((num) => (
                    <Link
                      key={num}
                      href={`/grimoire/numerology/soul-urge/${num}`}
                      className='rounded border border-zinc-700 px-3 py-1 transition-colors hover:border-lunary-accent-600'
                    >
                      {num}
                    </Link>
                  ))}
              </div>
            </div>
            <div className='rounded-lg border border-zinc-800 bg-zinc-900/50 p-6'>
              <Link
                href='/grimoire/numerology/karmic-debt'
                className='group inline-flex items-center gap-2 text-xl font-medium text-lunary-error-400 transition-colors hover:text-lunary-error-300'
              >
                Karmic Debt Numbers →
              </Link>
              <p className='text-sm text-zinc-400 mb-4'>
                These numbers highlight karmic lessons carried over from past
                lives.
              </p>
              <div className='flex flex-wrap gap-2 text-xs'>
                {Object.keys(karmicDebtNumbers).map((num) => (
                  <Link
                    key={num}
                    href={`/grimoire/numerology/karmic-debt/${num}`}
                    className='rounded border border-zinc-700 px-3 py-1 transition-colors hover:border-lunary-error-600'
                  >
                    {num}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id='clock-numbers' className='mb-16'>
          <h2 className='text-2xl font-light text-zinc-100 mb-6'>
            Clock Numbers
          </h2>
          <p className='text-zinc-400 mb-6'>
            Mirror hours and double hours are repeating clock times that feel
            meaningful.
          </p>
          <div className='grid md:grid-cols-2 gap-6'>
            <div className='rounded-lg border border-zinc-800 bg-zinc-900/50 p-6'>
              <Link
                href='/grimoire/mirror-hours'
                className='group inline-flex items-center gap-2 text-xl font-medium text-lunary-highlight-400 transition-colors hover:text-lunary-highlight-300'
              >
                Mirror Hours →
              </Link>
              <p className='text-sm text-zinc-400 mb-4'>
                Times where the hour and minute mirror each other (01:10, 11:11,
                etc.).
              </p>
              <div className='flex flex-wrap gap-2 text-xs'>
                {Object.keys(mirrorHours).map((time) => (
                  <Link
                    key={time}
                    href={`/grimoire/mirror-hours/${time.replace(':', '-')}`}
                    className='rounded border border-zinc-700 px-3 py-1 transition-colors hover:border-lunary-highlight-600'
                  >
                    {time}
                  </Link>
                ))}
              </div>
            </div>
            <div className='rounded-lg border border-zinc-800 bg-zinc-900/50 p-6'>
              <Link
                href='/grimoire/double-hours'
                className='group inline-flex items-center gap-2 text-xl font-medium text-lunary-primary-400 transition-colors hover:text-lunary-primary-300'
              >
                Double Hours →
              </Link>
              <p className='text-sm text-zinc-400 mb-4'>
                Times where the hour and minute match (11:11, 22:22, etc.).
              </p>
              <div className='flex flex-wrap gap-2 text-xs'>
                {Object.keys(doubleHours).map((time) => (
                  <Link
                    key={time}
                    href={`/grimoire/double-hours/${time.replace(':', '-')}`}
                    className='rounded border border-zinc-700 px-3 py-1 transition-colors hover:border-lunary-primary-600'
                  >
                    {time}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id='universal-year-meanings' className='mb-16'>
          <h2 className='text-2xl font-light text-zinc-100 mb-6'>
            Universal Year Meanings
          </h2>
          <p className='text-zinc-400 mb-6'>
            Each Universal Year delivers a collective theme. Tune into its
            vibration for timing and mindset.
          </p>
          <div className='grid md:grid-cols-3 gap-4'>
            {Object.entries(NUMEROLOGY_MEANINGS).map(([num, data]) => (
              <div
                key={num}
                className='rounded-lg border border-zinc-800 bg-zinc-900/50 p-6'
              >
                <div className='flex items-center gap-3 mb-3'>
                  <span className='text-3xl font-light text-lunary-primary-400'>
                    {num}
                  </span>
                </div>
                <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                  {data.theme}
                </h3>
                <p className='text-sm text-zinc-400'>
                  {data.keywords.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id='year-forecasts' className='mb-16'>
          <h2 className='text-2xl font-light text-zinc-100 mb-6'>
            Year Forecasts
          </h2>
          <div className='grid grid-cols-4 md:grid-cols-6 gap-3'>
            {getYearRange().map((year) => {
              const uYear = getUniversalYear(year);
              return (
                <Link
                  key={year}
                  href={`/grimoire/numerology/year/${year}`}
                  className='group rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-center transition-all hover:border-lunary-primary-600 hover:bg-zinc-900'
                >
                  <div className='text-lg font-medium text-zinc-100 group-hover:text-lunary-primary-300'>
                    {year}
                  </div>
                  <div className='text-2xl font-light text-lunary-primary-400'>
                    {uYear}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section id='calculate' className='mb-16'>
          <h2 className='text-2xl font-light text-zinc-100 mb-6'>
            Calculate Your Numbers
          </h2>
          <p className='text-zinc-400 mb-6'>
            Use the calculators below to discover your key numerology
            coordinates.
          </p>
          <div className='grid md:grid-cols-2 gap-6 mb-6'>
            <NumerologyCalculator type='life-path' />
            <NumerologyCalculator type='soul-urge' />
          </div>
          <div className='grid md:grid-cols-2 gap-6'>
            <NumerologyCalculator type='expression' />
            <NumerologyCalculator type='personal-year' />
          </div>
        </section>

        <section className='mb-16'>
          <div className='grid md:grid-cols-2 gap-6'>
            <div className='rounded-lg border border-zinc-800 bg-zinc-900/50 p-6'>
              <h2 className='text-xl font-medium mb-4'>
                How to Calculate Your Life Path Number
              </h2>
              <p className='text-zinc-400 mb-4'>
                Add all digits of your birth date until you get a single digit
                (1-9) or a master number (11, 22, 33).
              </p>
              <div className='rounded-lg bg-zinc-800/50 px-4 py-3 font-mono text-sm text-zinc-400'>
                <p className='mb-1'>Example: March 15, 1990</p>
                <p>3 + 1 + 5 + 1 + 9 + 9 + 0 = 28</p>
                <p>2 + 8 = 10</p>
                <p className='text-lunary-secondary-400 mt-2'>Life Path: 1</p>
              </div>
            </div>
            <div className='rounded-lg border border-zinc-800 bg-zinc-900/50 p-6'>
              <h2 className='text-xl font-medium mb-4'>
                How to Calculate Universal Year
              </h2>
              <p className='text-zinc-400 mb-4'>
                Add the digits of the year until you reach a single digit.
              </p>
              <div className='rounded-lg bg-zinc-800/50 px-4 py-3 font-mono text-sm text-zinc-400'>
                <p>2025 = 2 + 0 + 2 + 5 = 9</p>
                <p>2026 = 2 + 0 + 2 + 6 = 10 → 1 + 0 = 1</p>
              </div>
            </div>
          </div>
        </section>
      </SEOContentTemplate>
    </>
  );
}
