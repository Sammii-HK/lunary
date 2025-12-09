import { Metadata } from 'next';
import Link from 'next/link';
import {
  NUMEROLOGY_MEANINGS,
  getUniversalYear,
  getYearRange,
} from '@/constants/seo/numerology';

// Force dynamic rendering so Universal Year updates automatically
export const dynamic = 'force-dynamic';
import {
  angelNumbers,
  lifePathNumbers,
} from '@/constants/grimoire/numerology-data';
import {
  mirrorHours,
  doubleHours,
} from '@/constants/grimoire/clock-numbers-data';
import {
  karmicDebtNumbers,
  expressionNumbers,
  soulUrgeNumbers,
} from '@/constants/grimoire/numerology-extended-data';
import { NumerologyCalculator } from '@/components/grimoire/NumerologyCalculator';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title:
    'Numerology Guide: Angel Numbers, Life Path & Universal Years | Lunary',
  description:
    'Complete numerology guide. Learn about angel numbers (111, 222, 333), life path numbers, universal years, and how numbers influence your life.',
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
      'Complete guide to numerology - angel numbers, life path numbers, and universal year meanings.',
    url: 'https://lunary.app/grimoire/numerology',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/numerology',
  },
};

export default function NumerologyIndexPage() {
  const currentYear = new Date().getFullYear();
  const currentUniversalYear = getUniversalYear(currentYear);

  const numerologyListSchema = createItemListSchema({
    name: 'Numerology Guide',
    description:
      'Complete guide to numerology including angel numbers, life path numbers, universal years, and more.',
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
        description: 'Your life purpose calculated from birth date',
      },
      {
        name: 'Expression Numbers',
        url: 'https://lunary.app/grimoire/numerology/expression',
        description: 'Natural talents and abilities from your name',
      },
      {
        name: 'Soul Urge Numbers',
        url: 'https://lunary.app/grimoire/numerology/soul-urge',
        description: 'Innermost motivations and heart desires',
      },
      {
        name: 'Mirror Hours',
        url: 'https://lunary.app/grimoire/mirror-hours',
        description: 'Clock times with mirrored digits',
      },
      {
        name: 'Double Hours',
        url: 'https://lunary.app/grimoire/double-hours',
        description: 'Clock times with repeated digits',
      },
    ],
  });

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(numerologyListSchema)}
      <div className='max-w-6xl mx-auto px-4 py-12'>
        <Breadcrumbs
          items={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Numerology' },
          ]}
        />

        <h1 className='text-4xl font-light mb-4'>Numerology</h1>
        <p className='text-lg text-zinc-400 mb-8 max-w-3xl'>
          Numerology is the mystical study of numbers and their influence on
          human life. Discover angel number meanings, calculate your life path
          number, and understand how numeric vibrations shape your destiny.
        </p>

        <div className='mb-12 p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'>
          <div className='flex items-center gap-4 mb-4'>
            <span className='text-5xl font-light text-lunary-primary-300'>
              {currentUniversalYear}
            </span>
            <div>
              <h2 className='text-2xl font-medium text-lunary-primary-300'>
                {currentYear}: Universal Year {currentUniversalYear}
              </h2>
              <p className='text-zinc-400'>
                {NUMEROLOGY_MEANINGS[currentUniversalYear].theme}
              </p>
            </div>
          </div>
          <p className='text-zinc-300 mb-4'>
            {NUMEROLOGY_MEANINGS[currentUniversalYear].energy}
          </p>
          <Link
            href={`/grimoire/numerology/year/${currentYear}`}
            className='inline-flex px-4 py-2 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 text-sm transition-colors'
          >
            Read {currentYear} Full Forecast
          </Link>
        </div>

        <Link href='/grimoire/angel-numbers' className='group block'>
          <h2 className='text-2xl font-light mb-6 flex items-center gap-2 group-hover:text-lunary-accent-300 transition-colors'>
            Angel Numbers
            <span className='text-zinc-600 group-hover:text-lunary-accent-400 transition-colors'>
              →
            </span>
          </h2>
        </Link>
        <p className='text-zinc-400 mb-6'>
          Angel numbers are repeating number sequences that carry divine
          guidance. When you see these numbers repeatedly, your angels are
          trying to communicate with you.
        </p>
        <div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-12'>
          {Object.entries(angelNumbers).map(([num, data]) => (
            <Link
              key={num}
              href={`/grimoire/angel-numbers/${num}`}
              className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-lunary-accent-600 hover:bg-zinc-900 transition-all text-center group'
            >
              <div className='text-2xl font-light text-lunary-accent-400 group-hover:text-lunary-accent-300 transition-colors mb-1'>
                {num}
              </div>
              <div className='text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors'>
                {data.meaning.split(' & ')[0]}
              </div>
            </Link>
          ))}
        </div>

        <Link href='/grimoire/life-path' className='group block'>
          <h2 className='text-2xl font-light mb-6 flex items-center gap-2 group-hover:text-lunary-secondary-300 transition-colors'>
            Life Path Numbers
            <span className='text-zinc-600 group-hover:text-lunary-secondary-400 transition-colors'>
              →
            </span>
          </h2>
        </Link>
        <p className='text-zinc-400 mb-6'>
          Your Life Path Number reveals your life&apos;s purpose, natural
          talents, and the lessons you&apos;re here to learn. It&apos;s
          calculated from your birth date.
        </p>
        <div className='grid md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12'>
          {Object.entries(lifePathNumbers).map(([num, data]) => (
            <Link
              key={num}
              href={`/grimoire/life-path/${num}`}
              className='p-5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-lunary-secondary-600 hover:bg-zinc-900 transition-all group'
            >
              <div className='flex items-center gap-3 mb-2'>
                <span className='text-3xl font-light text-lunary-secondary-400 group-hover:text-lunary-secondary-300 transition-colors'>
                  {num}
                </span>
                <span className='text-sm text-zinc-400'>{data.meaning}</span>
              </div>
              <p className='text-sm text-zinc-500 line-clamp-2'>
                {data.description.split('.')[0]}.
              </p>
            </Link>
          ))}
        </div>

        <Link href='/grimoire/numerology/core-numbers' className='group block'>
          <h2 className='text-2xl font-light mb-6 flex items-center gap-2 group-hover:text-lunary-primary-300 transition-colors'>
            Core Numbers
            <span className='text-zinc-600 group-hover:text-lunary-primary-400 transition-colors'>
              →
            </span>
          </h2>
        </Link>
        <div className='grid md:grid-cols-3 gap-6 mb-12'>
          <div className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'>
            <Link href='/grimoire/numerology/expression' className='group'>
              <h3 className='text-xl font-medium text-lunary-secondary-400 mb-3 group-hover:text-lunary-secondary-300 transition-colors flex items-center gap-2'>
                Expression Numbers
                <span className='text-zinc-600 group-hover:text-lunary-secondary-400 transition-colors text-sm'>
                  →
                </span>
              </h3>
            </Link>
            <p className='text-zinc-400 mb-4 text-sm'>
              Also called Destiny Number, reveals your natural talents and
              abilities.
            </p>
            <div className='flex flex-wrap gap-2'>
              {Object.keys(expressionNumbers)
                .slice(0, 9)
                .map((num) => (
                  <Link
                    key={num}
                    href={`/grimoire/numerology/expression/${num}`}
                    className='px-3 py-1 rounded border border-zinc-700 hover:border-lunary-secondary-600 text-sm transition-colors'
                  >
                    {num}
                  </Link>
                ))}
            </div>
          </div>
          <div className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'>
            <Link href='/grimoire/numerology/soul-urge' className='group'>
              <h3 className='text-xl font-medium text-lunary-accent-400 mb-3 group-hover:text-lunary-accent-300 transition-colors flex items-center gap-2'>
                Soul Urge Numbers
                <span className='text-zinc-600 group-hover:text-lunary-accent-400 transition-colors text-sm'>
                  →
                </span>
              </h3>
            </Link>
            <p className='text-zinc-400 mb-4 text-sm'>
              Also called Heart&apos;s Desire, reveals your innermost
              motivations.
            </p>
            <div className='flex flex-wrap gap-2'>
              {Object.keys(soulUrgeNumbers)
                .slice(0, 9)
                .map((num) => (
                  <Link
                    key={num}
                    href={`/grimoire/numerology/soul-urge/${num}`}
                    className='px-3 py-1 rounded border border-zinc-700 hover:border-lunary-accent-600 text-sm transition-colors'
                  >
                    {num}
                  </Link>
                ))}
            </div>
          </div>
          <div className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'>
            <Link href='/grimoire/numerology/karmic-debt' className='group'>
              <h3 className='text-xl font-medium text-lunary-error-400 mb-3 group-hover:text-lunary-error-300 transition-colors flex items-center gap-2'>
                Karmic Debt Numbers
                <span className='text-zinc-600 group-hover:text-lunary-error-400 transition-colors text-sm'>
                  →
                </span>
              </h3>
            </Link>
            <p className='text-zinc-400 mb-4 text-sm'>
              Reveal lessons carried over from past lives.
            </p>
            <div className='flex flex-wrap gap-2'>
              {Object.keys(karmicDebtNumbers).map((num) => (
                <Link
                  key={num}
                  href={`/grimoire/numerology/karmic-debt/${num}`}
                  className='px-3 py-1 rounded border border-zinc-700 hover:border-lunary-error-600 text-sm transition-colors'
                >
                  {num}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <h2 className='text-2xl font-light mb-6'>Clock Numbers</h2>
        <p className='text-zinc-400 mb-6'>
          When you repeatedly notice certain times on the clock, the universe
          may be sending you a message through mirror hours and double hours.
        </p>
        <div className='grid md:grid-cols-2 gap-6 mb-12'>
          <div className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'>
            <Link href='/grimoire/mirror-hours' className='group'>
              <h3 className='text-xl font-medium text-lunary-highlight-400 mb-3 group-hover:text-lunary-highlight-300 transition-colors flex items-center gap-2'>
                Mirror Hours
                <span className='text-zinc-600 group-hover:text-lunary-highlight-400 transition-colors text-sm'>
                  →
                </span>
              </h3>
            </Link>
            <p className='text-zinc-400 mb-4 text-sm'>
              Times where digits mirror each other (01:10, 12:21, etc.)
            </p>
            <div className='flex flex-wrap gap-2'>
              {Object.keys(mirrorHours).map((time) => (
                <Link
                  key={time}
                  href={`/grimoire/mirror-hours/${time.replace(':', '-')}`}
                  className='px-3 py-1 rounded border border-zinc-700 hover:border-lunary-highlight-600 text-sm transition-colors'
                >
                  {time}
                </Link>
              ))}
            </div>
          </div>
          <div className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'>
            <Link href='/grimoire/double-hours' className='group'>
              <h3 className='text-xl font-medium text-lunary-primary-400 mb-3 group-hover:text-lunary-primary-300 transition-colors flex items-center gap-2'>
                Double Hours
                <span className='text-zinc-600 group-hover:text-lunary-primary-400 transition-colors text-sm'>
                  →
                </span>
              </h3>
            </Link>
            <p className='text-zinc-400 mb-4 text-sm'>
              Times where hour and minute are the same (11:11, 22:22, etc.)
            </p>
            <div className='flex flex-wrap gap-2'>
              {Object.keys(doubleHours).map((time) => (
                <Link
                  key={time}
                  href={`/grimoire/double-hours/${time.replace(':', '-')}`}
                  className='px-3 py-1 rounded border border-zinc-700 hover:border-lunary-primary-600 text-sm transition-colors'
                >
                  {time}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <h2 className='text-2xl font-light mb-6'>Universal Year Meanings</h2>
        <p className='text-zinc-400 mb-6'>
          The Universal Year influences the collective energy of the entire
          world during that calendar year. Understanding it helps you align with
          the year&apos;s themes.
        </p>
        <div className='grid md:grid-cols-3 gap-4 mb-12'>
          {Object.entries(NUMEROLOGY_MEANINGS).map(([num, data]) => (
            <div
              key={num}
              className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'
            >
              <div className='flex items-center gap-3 mb-3'>
                <span className='text-3xl font-light text-lunary-primary-400'>
                  {num}
                </span>
              </div>
              <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                {data.theme}
              </h3>
              <p className='text-sm text-zinc-400 mb-3'>
                {data.keywords.join(', ')}
              </p>
            </div>
          ))}
        </div>

        <h2 className='text-2xl font-light mb-6'>Year Forecasts</h2>
        <div className='grid grid-cols-4 md:grid-cols-6 gap-3 mb-12'>
          {getYearRange().map((year) => {
            const uYear = getUniversalYear(year);
            return (
              <Link
                key={year}
                href={`/grimoire/numerology/year/${year}`}
                className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-lunary-primary-600 hover:bg-zinc-900 transition-all text-center group'
              >
                <div className='text-lg font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                  {year}
                </div>
                <div className='text-2xl font-light text-lunary-primary-400'>
                  {uYear}
                </div>
              </Link>
            );
          })}
        </div>

        <h2 className='text-2xl font-light mb-6'>Calculate Your Numbers</h2>
        <p className='text-zinc-400 mb-6'>
          Use these calculators to discover your personal numerology numbers.
        </p>
        <div className='grid md:grid-cols-2 gap-6 mb-12'>
          <NumerologyCalculator type='life-path' />
          <NumerologyCalculator type='soul-urge' />
        </div>
        <div className='grid md:grid-cols-2 gap-6 mb-12'>
          <NumerologyCalculator type='expression' />
          <NumerologyCalculator type='personal-year' />
        </div>

        <div className='grid md:grid-cols-2 gap-6 mb-12'>
          <div className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'>
            <h2 className='text-xl font-medium mb-4'>
              How to Calculate Your Life Path Number
            </h2>
            <p className='text-zinc-400 mb-4'>
              Add all digits of your birth date until you get a single digit
              (1-9) or a Master Number (11, 22, 33).
            </p>
            <div className='bg-zinc-800/50 p-4 rounded-lg font-mono text-sm'>
              <p className='text-zinc-400 mb-1'>Example: March 15, 1990</p>
              <p>3 + 1 + 5 + 1 + 9 + 9 + 0 = 28</p>
              <p>2 + 8 = 10</p>
              <p>1 + 0 = 1</p>
              <p className='text-lunary-secondary-400 mt-2'>Life Path: 1</p>
            </div>
          </div>

          <div className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'>
            <h2 className='text-xl font-medium mb-4'>
              How to Calculate Universal Year
            </h2>
            <p className='text-zinc-400 mb-4'>
              Add all digits of the year together until you get a single digit
              (1-9).
            </p>
            <div className='bg-zinc-800/50 p-4 rounded-lg font-mono text-sm'>
              <p>2025 = 2 + 0 + 2 + 5 = 9</p>
              <p>2026 = 2 + 0 + 2 + 6 = 10 = 1 + 0 = 1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
