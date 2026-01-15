export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';

export const metadata: Metadata = {
  title: 'Wheel of the Year: The Eight Sabbats Guide - Lunary',
  description:
    'Complete guide to the Wheel of the Year and the eight Sabbats. Learn the meaning, dates, and rituals for Samhain, Yule, Imbolc, Ostara, Beltane, Litha, Lammas, and Mabon.',
  keywords: [
    'wheel of the year',
    'sabbats',
    'pagan holidays',
    'samhain',
    'yule',
    'imbolc',
    'ostara',
    'beltane',
    'litha',
    'lammas',
    'mabon',
  ],
  openGraph: {
    title: 'Wheel of the Year: The Eight Sabbats Guide - Lunary',
    description:
      'Complete guide to the Wheel of the Year and the eight Sabbats.',
    type: 'article',
    url: 'https://lunary.app/grimoire/wheel-of-the-year',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/wheel-of-the-year',
  },
};

const SABBATS = [
  {
    name: 'Samhain',
    date: 'October 31 – November 1',
    theme: "The Witch's New Year. The veil between worlds is thinnest.",
    focus: 'Honoring ancestors, divination, endings and beginnings',
    colors: 'Black, orange, purple',
  },
  {
    name: 'Yule',
    date: 'December 21–22 (Winter Solstice)',
    theme: 'The longest night. The return of the light.',
    focus: 'Hope, rebirth, celebrating the returning sun',
    colors: 'Red, green, gold, white',
  },
  {
    name: 'Imbolc',
    date: 'February 1–2',
    theme: "First stirrings of spring. Brigid's festival.",
    focus: 'Purification, inspiration, new beginnings',
    colors: 'White, pale yellow, light green',
  },
  {
    name: 'Ostara',
    date: 'March 20–21 (Spring Equinox)',
    theme: 'Day and night in balance. Spring arrives.',
    focus: 'Fertility, growth, balance, new projects',
    colors: 'Pastels, green, yellow',
  },
  {
    name: 'Beltane',
    date: 'May 1',
    theme: 'The height of spring. Fire festival of fertility.',
    focus: 'Passion, creativity, sacred union, vitality',
    colors: 'Red, white, green, rainbow',
  },
  {
    name: 'Litha',
    date: 'June 20–21 (Summer Solstice)',
    theme: 'The longest day. Peak of solar power.',
    focus: 'Abundance, power, light, achievement',
    colors: 'Yellow, gold, orange, blue',
  },
  {
    name: 'Lammas/Lughnasadh',
    date: 'August 1',
    theme: 'First harvest. Honoring sacrifice and abundance.',
    focus: 'Gratitude, harvest, transformation, skill',
    colors: 'Gold, orange, brown, green',
  },
  {
    name: 'Mabon',
    date: 'September 22–23 (Autumn Equinox)',
    theme: 'Second harvest. Day and night balance again.',
    focus: 'Balance, gratitude, preparation for darkness',
    colors: 'Orange, brown, red, gold',
  },
];

const faqs = [
  {
    question: 'Do I need to celebrate all eight Sabbats?',
    answer:
      'No. Choose the Sabbats that resonate. Some practitioners observe all eight, others honor a few. Connection matters more than perfection.',
  },
  {
    question: 'What if I live in the Southern Hemisphere?',
    answer:
      'Many reverse the Wheel to mirror their seasons—Yule in June, Litha in December—but some follow the Northern calendar for consistency. Choose what aligns with your land.',
  },
  {
    question: 'How do I celebrate as a solitary witch?',
    answer:
      'Create a seasonal altar, spend time in nature, journal on the themes, light a candle, or cook traditional foods. Even a few intentional minutes honor the Wheel.',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Explore Sabbats',
    links: [
      { label: 'Samhain', href: '/grimoire/wheel-of-the-year/samhain' },
      { label: 'Yule', href: '/grimoire/wheel-of-the-year/yule' },
      { label: 'Imbolc', href: '/grimoire/wheel-of-the-year/imbolc' },
      { label: 'Ostara', href: '/grimoire/wheel-of-the-year/ostara' },
    ],
  },
  {
    title: 'Related Practices',
    links: [
      { label: 'Moon Phases', href: '/grimoire/guides/moon-phases-guide' },
      { label: 'Correspondences', href: '/grimoire/correspondences' },
      { label: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
      {
        label: 'Spellcraft Fundamentals',
        href: '/grimoire/spells/fundamentals',
      },
    ],
  },
];

const tableOfContents = [
  { label: 'What Is the Wheel?', href: '#what-is-wheel' },
  { label: 'The Eight Sabbats', href: '#sabbats' },
  { label: 'Working with Seasonal Energy', href: '#working-with' },
  { label: 'Sabbats & Lunar Phases', href: '#lunar-connection' },
  { label: 'Integrating the Wheel', href: '#integrating' },
  { label: 'FAQ', href: '#faq' },
];

const whatIs = {
  question: 'What is the Wheel of the Year?',
  answer:
    'A modern pagan calendar that follows solstices, equinoxes, and cross-quarter days so you can align rituals with the sun’s journey through the seasons.',
};

const intro =
  'The Wheel of the Year outlines eight Sabbats that track the dance between light and dark, harvest and rest. Each festival offers seasonal themes to anchor your practice.';

const howToWorkWith = [
  'Honor the Sabbat that aligns with the sun’s current position—celebrate themes like gratitude, new beginnings, or rest.',
  'Combine Sabbat magic with lunar phases; a Full Moon near a Sabbat amps the energy.',
  'Update your altar, meals, and rituals to mirror the seasonal shift.',
  'Journal on the season’s lessons and integrate them through small, intentional acts.',
];

const relatedItems = [
  {
    name: 'Moon Phases Guide',
    href: '/grimoire/guides/moon-phases-guide',
    type: 'Lunar timing',
  },
  {
    name: 'Correspondences',
    href: '/grimoire/correspondences',
    type: 'Ingredients',
  },
  {
    name: 'Samhain Guide',
    href: '/grimoire/wheel-of-the-year/samhain',
    type: 'Sabbats',
  },
  { name: 'Book of Shadows', href: '/book-of-shadows', type: 'Journal' },
];

export default function WheelOfTheYearPage() {
  return (
    <SEOContentTemplate
      title={metadata.title as string}
      h1='Wheel of the Year'
      description={metadata.description as string}
      keywords={metadata.keywords as string[]}
      canonicalUrl={metadata.alternates?.canonical as string}
      tableOfContents={tableOfContents}
      whatIs={whatIs}
      intro={intro}
      howToWorkWith={howToWorkWith}
      faqs={faqs}
      relatedItems={relatedItems}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-glossary'
          entityKey='wheel-of-the-year'
          title='Wheel of the Year Connections'
          sections={cosmicConnectionsSections}
        />
      }
    >
      <section id='what-is-wheel' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          1. What Is the Wheel of the Year?
        </h2>
        <p className='text-zinc-300 leading-relaxed mb-6'>
          The Wheel of the Year blends ancient Celtic, Germanic, and solar
          festivals into eight turning points that honor the sun’s annual cycle.
        </p>
        <p className='text-zinc-300 leading-relaxed mb-6'>
          It represents the eternal dance between light and dark, rest and
          action, death and rebirth.
        </p>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'>
            <h3 className='font-medium text-zinc-100 mb-2'>Greater Sabbats</h3>
            <p className='text-zinc-500 text-sm mb-2'>
              Cross-quarter days rich with magical power:
            </p>
            <ul className='text-zinc-500 text-sm'>
              <li>• Samhain</li>
              <li>• Imbolc</li>
              <li>• Beltane</li>
              <li>• Lammas</li>
            </ul>
          </div>
          <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'>
            <h3 className='font-medium text-zinc-100 mb-2'>Lesser Sabbats</h3>
            <p className='text-zinc-500 text-sm mb-2'>Solar turning points:</p>
            <ul className='text-zinc-500 text-sm'>
              <li>• Yule</li>
              <li>• Ostara</li>
              <li>• Litha</li>
              <li>• Mabon</li>
            </ul>
          </div>
        </div>
      </section>

      <section id='sabbats' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          2. The Eight Sabbats Overview
        </h2>
        <p className='text-zinc-300 leading-relaxed mb-6'>
          Each Sabbat carries unique themes, colors, and focuses. Honor them
          with rituals, correspondences, and reflections.
        </p>
        <div className='space-y-4'>
          {SABBATS.map((sabbat) => (
            <div
              key={sabbat.name}
              className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'
            >
              <div className='flex flex-wrap items-center gap-3 mb-2'>
                <h3 className='text-lg font-medium text-zinc-100'>
                  {sabbat.name}
                </h3>
                <span className='text-xs text-lunary-primary-400 bg-lunary-primary-900/30 px-2 py-0.5 rounded'>
                  {sabbat.date}
                </span>
              </div>
              <p className='text-zinc-300 text-sm mb-2'>{sabbat.theme}</p>
              <p className='text-zinc-500 text-xs mb-1'>
                <strong>Focus:</strong> {sabbat.focus}
              </p>
              <p className='text-zinc-500 text-xs'>
                <strong>Colors:</strong> {sabbat.colors}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id='working-with' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          3. Working with Seasonal Energy
        </h2>
        <p className='text-zinc-300 leading-relaxed mb-6'>
          Each season carries a signature energy. Align your magic with its
          tone.
        </p>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {[
            {
              title: 'Spring',
              symbol: '🌸',
              desc: 'New beginnings, fertility, cleansing.',
            },
            {
              title: 'Summer',
              symbol: '☀️',
              desc: 'Abundance, creativity, taking action.',
            },
            {
              title: 'Autumn',
              symbol: '🍂',
              desc: 'Harvest, gratitude, release.',
            },
            {
              title: 'Winter',
              symbol: '❄️',
              desc: 'Rest, reflection, ancestor work.',
            },
          ].map((season) => (
            <div
              key={season.title}
              className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'
            >
              <h3 className='font-medium text-zinc-100 mb-2'>
                {season.symbol} {season.title}
              </h3>
              <p className='text-zinc-400 text-sm'>{season.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id='lunar-connection' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          4. Sabbats & Lunar Phases
        </h2>
        <p className='text-zinc-300 leading-relaxed mb-6'>
          Pair Sabbats with moon phases for amplified timing—New Moons for
          beginnings, Full Moons for manifesting or releasing.
        </p>
        <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Combining Solar & Lunar Cycles
          </h3>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>• New Moon near a Sabbat enhances plantings and intentions</li>
            <li>
              • Full Moon near a Sabbat powers manifestations and releases
            </li>
            <li>• Esbats (monthly Full Moons) complement the solar Sabbats</li>
          </ul>
        </div>
        <div className='mt-4'>
          <Link
            href='/grimoire/guides/moon-phases-guide'
            className='text-lunary-primary-400 hover:text-lunary-primary-300'
          >
            Learn more about moon phases →
          </Link>
        </div>
      </section>

      <section id='integrating' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          5. Integrating the Wheel Into Daily Life
        </h2>
        <p className='text-zinc-300 leading-relaxed mb-6'>
          You can celebrate the Wheel with small rituals, seasonal altar
          updates, and gratitude practices.
        </p>
        <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-6'>
          <ul className='space-y-3 text-zinc-300'>
            <li>• Refresh your altar with seasonal colors and items.</li>
            <li>• Cook seasonal foods and share gratitude.</li>
            <li>• Take nature walks and collect seasonal treasures.</li>
            <li>
              • Journal the themes of each Sabbat in your Book of Shadows.
            </li>
            <li>
              • Keep rituals simple: light a candle, state your intention, and
              pause.
            </li>
          </ul>
        </div>
      </section>

      <section id='faq' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          6. Frequently Asked Questions
        </h2>
        <div className='space-y-4'>
          {faqs.map((faq, index) => (
            <div
              key={index}
              className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'
            >
              <h3 className='text-lg font-medium text-zinc-100 mb-3'>
                {faq.question}
              </h3>
              <p className='text-zinc-300 leading-relaxed'>{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className='mb-12'>
        <div className='rounded-xl border border-lunary-primary-700 bg-gradient-to-r from-lunary-primary-900/30 to-amber-900/30 p-8 text-center'>
          <h2 className='text-2xl font-light text-zinc-100 mb-3'>
            Explore Individual Sabbats
          </h2>
          <p className='text-zinc-400 mb-4'>
            Dive deeper into rituals, recipes, and correspondences for each
            festival.
          </p>
          <div className='flex flex-wrap gap-3 justify-center'>
            {[
              'samhain',
              'yule',
              'imbolc',
              'ostara',
              'beltane',
              'litha',
              'lammas',
              'mabon',
            ].map((sabbat) => (
              <Link
                key={sabbat}
                href={`/grimoire/wheel-of-the-year/${sabbat}`}
                className='px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm transition-colors'
              >
                {sabbat.charAt(0).toUpperCase() + sabbat.slice(1)}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SEOContentTemplate>
  );
}
