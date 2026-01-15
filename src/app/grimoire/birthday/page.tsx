import { Metadata } from 'next';
import Link from 'next/link';
import {
  MONTH_NAMES,
  ZODIAC_DATE_RANGES,
} from '@/constants/seo/birthday-zodiac';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { renderJsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Birthday Zodiac Signs: Find Your Sun Sign by Birth Date | Lunary',
  description:
    'Discover your zodiac sign based on your birthday. Complete guide to all 366 birthday personalities with traits, compatibility, and cosmic insights for every day of the year.',
  keywords: [
    'birthday zodiac sign',
    'zodiac sign by birthday',
    'what is my zodiac sign',
    'birthday personality',
    'zodiac birthday calendar',
    'sun sign calculator',
    'astrology birthday',
  ],
  openGraph: {
    title: 'Birthday Zodiac Signs: Find Your Sun Sign by Birth Date',
    description:
      'Discover your zodiac sign based on your birthday. Complete guide to all 366 birthday personalities.',
    url: 'https://lunary.app/grimoire/birthday',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/birthday',
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Birthday Zodiac Calendar',
  description: 'Complete list of zodiac signs for every birthday of the year',
  numberOfItems: 366,
  itemListElement: ZODIAC_DATE_RANGES.map((zodiac, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: `${zodiac.sign} (${MONTH_NAMES[zodiac.startMonth - 1]} ${zodiac.startDay} - ${MONTH_NAMES[zodiac.endMonth - 1]} ${zodiac.endDay})`,
    url: `https://lunary.app/grimoire/zodiac/${zodiac.sign.toLowerCase()}`,
  })),
};

export default function BirthdayIndexPage() {
  const months = MONTH_NAMES.map((name, index) => {
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][index];
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return { name, days };
  });

  const heroContent = (
    <div className='text-center mb-6'>
      <p className='text-lg text-zinc-400 max-w-3xl mx-auto'>
        Find your sun sign by birthday, then explore the traits, compatibility,
        and cosmic notes that make every day unique.
      </p>
    </div>
  );

  const sections = (
    <div className='space-y-12'>
      <section
        id='zodiac-sign-dates'
        className='mb-12 p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'
      >
        <h2 className='text-xl font-medium mb-4'>Zodiac Sign Dates</h2>
        <div className='grid md:grid-cols-3 gap-4'>
          {ZODIAC_DATE_RANGES.map((zodiac) => (
            <Link
              key={zodiac.sign}
              href={`/grimoire/zodiac/${zodiac.sign.toLowerCase()}`}
              className='flex items-center gap-3 p-3 rounded-lg border border-zinc-800/50 hover:bg-zinc-800/50 transition-colors'
            >
              <span className='text-2xl'>
                {zodiac.sign === 'Aries'
                  ? '♈'
                  : zodiac.sign === 'Taurus'
                    ? '♉'
                    : zodiac.sign === 'Gemini'
                      ? '♊'
                      : zodiac.sign === 'Cancer'
                        ? '♋'
                        : zodiac.sign === 'Leo'
                          ? '♌'
                          : zodiac.sign === 'Virgo'
                            ? '♍'
                            : zodiac.sign === 'Libra'
                              ? '♎'
                              : zodiac.sign === 'Scorpio'
                                ? '♏'
                                : zodiac.sign === 'Sagittarius'
                                  ? '♐'
                                  : zodiac.sign === 'Capricorn'
                                    ? '♑'
                                    : zodiac.sign === 'Aquarius'
                                      ? '♒'
                                      : '♓'}
              </span>
              <div>
                <div className='font-medium'>{zodiac.sign}</div>
                <div className='text-sm text-zinc-400'>
                  {MONTH_NAMES[zodiac.startMonth - 1].slice(0, 3)}{' '}
                  {zodiac.startDay} –{' '}
                  {MONTH_NAMES[zodiac.endMonth - 1].slice(0, 3)} {zodiac.endDay}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id='browse-by-birthday' className='space-y-8'>
        <h2 className='text-2xl font-medium text-zinc-100'>
          Browse by Birthday
        </h2>
        {months.map(({ name, days }) => (
          <div key={name}>
            <h3 className='text-lg font-medium text-lunary-primary-400 mb-4'>
              {name}
            </h3>
            <div className='flex flex-wrap gap-2'>
              {days.map((day) => (
                <Link
                  key={`${name}-${day}`}
                  href={`/grimoire/birthday/${name.toLowerCase()}-${day}`}
                  className='w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-800 hover:border-lunary-primary-600 hover:bg-zinc-800/50 text-sm transition-colors'
                >
                  {day}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section id='tips' className='space-y-4'>
        <h2 className='text-2xl font-medium text-zinc-100'>Tips & Timing</h2>
        <p className='text-zinc-300 leading-relaxed'>
          Use zodiac dates to anchor your daily horoscopes, plan rituals on your
          birthday, or see when your season begins and ends.
        </p>
        <ul className='list-disc list-inside text-sm text-zinc-300 space-y-1'>
          <li>Mark your sun sign’s birthdays plus the surrounding week.</li>
          <li>
            Note how the current moon sign interacts with your birth sign.
          </li>
          <li>
            Celebrate new solar returns with intention (`every birthday).`
          </li>
        </ul>
      </section>

      <section id='compatibility' className='space-y-4'>
        <h2 className='text-2xl font-medium text-zinc-100'>
          Compatibility Notes
        </h2>
        <p className='text-zinc-300 leading-relaxed'>
          Pair signs by element to find natural harmony (Fire+Air and
          Earth+Water). Use the links below to explore deeper compatibility
          guides.
        </p>
        <div className='flex flex-wrap gap-3 font-semibold text-sm text-zinc-300'>
          {[
            { label: 'Fire & Air', href: '/grimoire/compatibility/fire-air' },
            {
              label: 'Earth & Water',
              href: '/grimoire/compatibility/earth-water',
            },
            { label: 'Sun Sign Pairings', href: '/grimoire/compatibility' },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className='text-lunary-primary-300 hover:text-lunary-primary-400'
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      <section
        id='tools'
        className='mt-12 p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10 space-y-4'
      >
        <h2 className='text-xl font-medium text-lunary-primary-300 mb-2'>
          Tools & Resources
        </h2>
        <p className='text-zinc-300'>
          Access calculators, worksheets, and printable charts to explore 366
          birthday personalities.
        </p>
        <div className='flex flex-wrap gap-3'>
          <Link
            href='/birth-chart'
            className='px-4 py-2 rounded-lg bg-lunary-primary-900/30 text-lunary-primary-300 hover:bg-lunary-primary-900/50 transition-colors'
          >
            Birth Chart Calculator
          </Link>
          <Link
            href='/grimoire/compatibility'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            Compatibility Guides
          </Link>
          <Link
            href='/grimoire/moon'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            Moon Phase Tools
          </Link>
        </div>
      </section>
    </div>
  );

  const tableOfContents = [
    { label: 'Zodiac Sign Dates', href: '#zodiac-sign-dates' },
    { label: 'Browse by Birthday', href: '#browse-by-birthday' },
    { label: 'Tips & Timing', href: '#tips' },
    { label: 'Compatibility Notes', href: '#compatibility' },
    { label: 'Tools & Resources', href: '#tools' },
  ];

  const relatedItems = [
    { name: 'Birthday Horoscope', href: '/horoscope', type: 'Daily' },
    {
      name: 'Zodiac Compatibility',
      href: '/grimoire/compatibility',
      type: 'Relationships',
    },
  ];

  const faqs = [
    {
      question: 'What if my birthday is on a cusp?',
      answer:
        'Cusp birthdays fall near the transition between two signs. You can read both signs and see which energy resonates. Your full birth chart shows the exact Sun degree for clarity.',
    },
    {
      question: 'Why does the zodiac year start in March?',
      answer:
        'The astrological year aligns with the vernal equinox in late March when the Sun enters Aries, marking the traditional start of the zodiac calendar.',
    },
    {
      question: 'Does my zodiac sign ever change?',
      answer:
        'In tropical astrology (the most common Western system), your zodiac sign stays the same. Sidereal astrology shifts due to precession, but we follow the tropical zodiac tied to seasons.',
    },
  ];

  const howToWorkWith = [
    'Celebrate your solar return with rituals or intentions tailored to your sign.',
    'Track seasonal energies by noting how the current Sun sign interacts with yours.',
    'Combine zodiac insights with your full birth chart for layered context.',
    'Use compatibility guides to understand how different elements support or challenge each other.',
  ];

  const cosmicSections = [
    {
      title: 'Birthday Paths',
      links: [
        { label: 'Birthday Calendar', href: '/grimoire/birthday' },
        { label: 'Birthday Oracle', href: '/grimoire/birthdays' },
        { label: 'Astrology A–Z', href: '/grimoire/a-z' },
      ],
    },
    {
      title: 'Date Tools',
      links: [
        { label: 'Birth Chart Calculator', href: '/birth-chart' },
        { label: 'Numerology', href: '/grimoire/numerology' },
        { label: 'Moon Phases', href: '/grimoire/moon' },
      ],
    },
  ];

  return (
    <>
      {renderJsonLd(structuredData)}
      <SEOContentTemplate
        title={metadata.title as string}
        h1='Birthday Zodiac Calendar'
        description={metadata.description as string}
        keywords={metadata.keywords as string[]}
        canonicalUrl={
          (metadata.alternates?.canonical as string) ??
          'https://lunary.app/grimoire/birthday'
        }
        tableOfContents={tableOfContents}
        whatIs={{
          question: 'How do I find my zodiac sign by birthday?',
          answer:
            'The zodiac sign is determined by the Sun’s position on your birthday; use the calendar below to see which segment of the cycle you belong to.',
        }}
        intro='Pick your birth month, day, or sun sign below to discover your zodiac identity, compatibility, and cosmic notes for every day of the year.'
        heroContent={heroContent}
        howToWorkWith={howToWorkWith}
        faqs={faqs}
        relatedItems={relatedItems}
        cosmicConnections={
          <CosmicConnections
            entityType='hub-a-z'
            entityKey='a-z'
            title='Birthday Connections'
            sections={cosmicSections}
          />
        }
        ctaText='Explore your birthday matchups'
        ctaHref='/grimoire/compatibility'
      >
        {sections}
      </SEOContentTemplate>
    </>
  );
}
