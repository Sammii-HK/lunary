import { Metadata } from 'next';
import Link from 'next/link';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Lunary Grimoire A–Z: Complete Topic Index | Lunary',
  description:
    'Alphabetical index of all grimoire topics. Browse zodiac signs, planets, houses, aspects, tarot, crystals, spells, witchcraft, and more. Your complete spiritual reference guide.',
  openGraph: {
    title: 'Lunary Grimoire A–Z Index | Lunary',
    description:
      'Complete alphabetical guide to astrology, tarot, witchcraft, and spiritual topics.',
    url: 'https://lunary.app/grimoire/a-z',
  },
  alternates: { canonical: 'https://lunary.app/grimoire/a-z' },
};

const topics = [
  {
    letter: 'A',
    items: [
      { name: 'Aquarius', url: '/grimoire/zodiac/aquarius' },
      { name: 'Aries', url: '/grimoire/zodiac/aries' },
      { name: 'Ascendant', url: '/grimoire/houses/overview/1' },
      { name: 'Aspects', url: '/grimoire/aspects' },
    ],
  },
  {
    letter: 'B',
    items: [
      { name: 'Birth Chart', url: '/birth-chart' },
      {
        name: 'Birth Chart Guide',
        url: '/grimoire/guides/birth-chart-complete-guide',
      },
    ],
  },
  {
    letter: 'C',
    items: [
      { name: 'Cancer', url: '/grimoire/zodiac/cancer' },
      { name: 'Capricorn', url: '/grimoire/zodiac/capricorn' },
      { name: 'Chakras', url: '/grimoire/chakras' },
      { name: 'Conjunction', url: '/grimoire/aspects/types/conjunction' },
      { name: 'Crystals', url: '/grimoire/crystals' },
    ],
  },
  {
    letter: 'D',
    items: [
      { name: 'Decans', url: '/grimoire/decans' },
      { name: 'Descendant', url: '/grimoire/houses/overview/7' },
    ],
  },
  {
    letter: 'E',
    items: [
      { name: 'Eclipses', url: '/grimoire/eclipses' },
      { name: 'Elements', url: '/grimoire/zodiac' },
    ],
  },
  {
    letter: 'F',
    items: [{ name: 'Full Moons', url: '/grimoire/moon/full-moons' }],
  },
  {
    letter: 'G',
    items: [
      { name: 'Gemini', url: '/grimoire/zodiac/gemini' },
      { name: 'Glossary', url: '/grimoire/glossary' },
    ],
  },
  {
    letter: 'H',
    items: [
      { name: 'Houses', url: '/grimoire/houses' },
      { name: 'Horoscopes', url: '/horoscope' },
    ],
  },
  {
    letter: 'I',
    items: [{ name: 'IC (Imum Coeli)', url: '/grimoire/houses/overview/4' }],
  },
  {
    letter: 'J',
    items: [{ name: 'Jupiter', url: '/grimoire/astronomy/planets/jupiter' }],
  },
  {
    letter: 'L',
    items: [
      { name: 'Leo', url: '/grimoire/zodiac/leo' },
      { name: 'Libra', url: '/grimoire/zodiac/libra' },
      { name: 'Lunar Nodes', url: '/grimoire/lunar-nodes' },
    ],
  },
  {
    letter: 'M',
    items: [
      { name: 'Mars', url: '/grimoire/astronomy/planets/mars' },
      { name: 'Mercury', url: '/grimoire/astronomy/planets/mercury' },
      { name: 'Midheaven', url: '/grimoire/houses/overview/10' },
      { name: 'Moon', url: '/grimoire/astronomy/planets/moon' },
      { name: 'Moon Phases', url: '/grimoire/moon/phases' },
    ],
  },
  {
    letter: 'N',
    items: [
      { name: 'Neptune', url: '/grimoire/astronomy/planets/neptune' },
      { name: 'North Node', url: '/grimoire/lunar-nodes' },
      { name: 'Numerology', url: '/grimoire/numerology' },
    ],
  },
  {
    letter: 'O',
    items: [{ name: 'Opposition', url: '/grimoire/aspects/types/opposition' }],
  },
  {
    letter: 'P',
    items: [
      { name: 'Pisces', url: '/grimoire/zodiac/pisces' },
      { name: 'Placements', url: '/grimoire/placements' },
      { name: 'Planets', url: '/grimoire/astronomy/planets' },
      { name: 'Pluto', url: '/grimoire/astronomy/planets/pluto' },
    ],
  },
  {
    letter: 'R',
    items: [
      { name: 'Retrogrades', url: '/grimoire/astronomy/retrogrades' },
      { name: 'Rising Sign', url: '/grimoire/houses/overview/1' },
      { name: 'Runes', url: '/grimoire/runes' },
    ],
  },
  {
    letter: 'S',
    items: [
      { name: 'Sagittarius', url: '/grimoire/zodiac/sagittarius' },
      { name: 'Saturn', url: '/grimoire/astronomy/planets/saturn' },
      { name: 'Saturn Return', url: '/grimoire/astronomy/retrogrades/saturn' },
      { name: 'Scorpio', url: '/grimoire/zodiac/scorpio' },
      { name: 'Sextile', url: '/grimoire/aspects/types/sextile' },
      { name: 'Spells', url: '/grimoire/spells' },
      { name: 'Square', url: '/grimoire/aspects/types/square' },
      { name: 'Sun', url: '/grimoire/astronomy/planets/sun' },
    ],
  },
  {
    letter: 'T',
    items: [
      { name: 'Tarot', url: '/grimoire/tarot' },
      { name: 'Taurus', url: '/grimoire/zodiac/taurus' },
      { name: 'Transits', url: '/grimoire/transits' },
      { name: 'Trine', url: '/grimoire/aspects/types/trine' },
    ],
  },
  {
    letter: 'U',
    items: [{ name: 'Uranus', url: '/grimoire/astronomy/planets/uranus' }],
  },
  {
    letter: 'V',
    items: [
      { name: 'Venus', url: '/grimoire/astronomy/planets/venus' },
      { name: 'Virgo', url: '/grimoire/zodiac/virgo' },
    ],
  },
  {
    letter: 'W',
    items: [{ name: 'Wheel of the Year', url: '/grimoire/wheel-of-the-year' }],
  },
  { letter: 'Z', items: [{ name: 'Zodiac Signs', url: '/grimoire/zodiac' }] },
];

export default function AZIndexPage() {
  const allItems = topics.flatMap((t) => t.items);

  const itemListSchema = createItemListSchema({
    name: 'Astrology A-Z Index',
    description: 'Complete alphabetical guide to all astrology topics.',
    url: 'https://lunary.app/grimoire/a-z',
    items: allItems.map((item) => ({
      name: item.name,
      url: `https://lunary.app${item.url}`,
      description: `Learn about ${item.name} in astrology.`,
    })),
  });

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(itemListSchema)}
      <div className='max-w-5xl mx-auto px-4 py-12'>
        <Breadcrumbs
          items={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'A-Z Index' },
          ]}
        />

        <header className='mb-8'>
          <h1 className='text-4xl md:text-5xl font-light mb-4'>
            Lunary Grimoire A–Z
          </h1>
          <p className='text-xl text-zinc-400 leading-relaxed mb-6'>
            Complete alphabetical index of astrology topics, zodiac signs,
            planets, tarot, crystals, spells, and spiritual practices.
          </p>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h2 className='text-lg font-medium text-zinc-100 mb-3'>
              How to Use This Index
            </h2>
            <p className='text-zinc-400 text-sm mb-4'>
              Jump to any letter using the navigation bar below, or scroll
              through to browse all topics. Each entry links directly to its
              dedicated grimoire page with detailed information.
            </p>
            <div className='flex flex-wrap gap-3'>
              <Link
                href='/grimoire/beginners'
                className='text-sm text-lunary-primary-400 hover:text-lunary-primary-300'
              >
                New here? Start with the Beginners Guide →
              </Link>
              <Link
                href='/grimoire/guides/birth-chart-complete-guide'
                className='text-sm text-lunary-primary-400 hover:text-lunary-primary-300'
              >
                Birth Chart Guide →
              </Link>
              <Link
                href='/grimoire/guides/moon-phases-guide'
                className='text-sm text-lunary-primary-400 hover:text-lunary-primary-300'
              >
                Moon Phases Guide →
              </Link>
            </div>
          </div>
        </header>

        <nav className='mb-8 flex flex-wrap gap-1'>
          {alphabet.map((letter) => {
            const hasItems = topics.some((t) => t.letter === letter);
            return hasItems ? (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className='w-8 h-8 flex items-center justify-center rounded bg-zinc-800 text-zinc-300 text-sm hover:bg-lunary-primary-900/30 hover:text-lunary-primary-300 transition-colors'
              >
                {letter}
              </a>
            ) : (
              <span
                key={letter}
                className='w-8 h-8 flex items-center justify-center text-zinc-700 text-sm'
              >
                {letter}
              </span>
            );
          })}
        </nav>

        <div className='space-y-8'>
          {topics.map((section) => (
            <section
              key={section.letter}
              id={`letter-${section.letter}`}
              className='scroll-mt-24'
            >
              <h2 className='text-2xl font-light text-lunary-primary-400 mb-4 pb-2 border-b border-zinc-800'>
                {section.letter}
              </h2>
              <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-3'>
                {section.items.map((item) => (
                  <Link
                    key={item.url}
                    href={item.url}
                    className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
                  >
                    <span className='text-zinc-200'>{item.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className='mt-12 p-6 rounded-xl border border-lunary-primary-700 bg-gradient-to-r from-lunary-primary-900/20 to-lunary-rose-900/20'>
          <h2 className='text-xl font-medium text-lunary-primary-300 mb-2'>
            New to Astrology?
          </h2>
          <p className='text-zinc-300 mb-4'>
            Start with our beginner's guide for a structured introduction to
            astrology fundamentals.
          </p>
          <Link
            href='/grimoire/beginners'
            className='inline-flex px-6 py-3 rounded-lg bg-lunary-primary-900/30 hover:bg-lunary-primary-900/50 border border-lunary-primary-700 text-lunary-primary-300 font-medium transition-colors'
          >
            Astrology for Beginners
          </Link>
        </section>
      </div>
    </div>
  );
}
