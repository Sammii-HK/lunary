export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import {
  createArticleSchema,
  createFAQPageSchema,
  createBreadcrumbSchema,
  renderJsonLd,
} from '@/lib/schema';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';
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
      'No. Celebrate the Sabbats that resonate with you. Some practitioners observe all eight, others focus on a few that feel meaningful. Start with one or two, and let your practice grow naturally. Authentic connection matters more than checking boxes.',
  },
  {
    question: 'What if I live in the Southern Hemisphere?',
    answer:
      'Many Southern Hemisphere practitioners reverse the Wheel—celebrating Yule in June and Litha in December—to align with their local seasons. Others follow the Northern calendar for consistency. Choose what connects you to the land you live on.',
  },
  {
    question: 'How do I celebrate Sabbats as a solitary practitioner?',
    answer:
      "Create a simple altar with seasonal items, prepare traditional foods, spend time in nature, journal about the season's meaning, perform a small ritual, or simply light a candle and reflect. Even a few minutes of intentional celebration honors the Wheel.",
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
      { label: 'Spellcraft', href: '/grimoire/spells/fundamentals' },
    ],
  },
];

export default function WheelOfTheYearPage() {
  const articleSchema = createArticleSchema({
    headline: 'Wheel of the Year: The Eight Sabbats Guide',
    description:
      'Complete guide to the Wheel of the Year and the eight Sabbats.',
    url: 'https://lunary.app/grimoire/wheel-of-the-year',
    keywords: ['wheel of the year', 'sabbats', 'pagan holidays'],
    section: 'Seasonal Celebrations',
  });

  const faqSchema = createFAQPageSchema(faqs);

  return (
    <div className='p-4 md:p-8 max-w-4xl mx-auto'>
      {renderJsonLd(articleSchema)}
      {renderJsonLd(faqSchema)}
      {renderJsonLd(
        createBreadcrumbSchema([
          { name: 'Grimoire', url: '/grimoire' },
          { name: 'Wheel of the Year', url: '/grimoire/wheel-of-the-year' },
        ]),
      )}

      <Breadcrumbs
        items={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Wheel of the Year' },
        ]}
      />

      <header className='mb-12'>
        <h1 className='text-4xl md:text-5xl font-light text-zinc-100 mb-6'>
          Wheel of the Year
          <span className='block text-2xl text-lunary-primary-400 mt-2'>
            The Eight Sabbats & Seasonal Celebrations
          </span>
        </h1>
        <p className='text-xl text-zinc-400 leading-relaxed'>
          The Wheel of the Year is a cycle of eight festivals marking the
          turning of seasons and the sun&apos;s journey through the year. These
          Sabbats connect practitioners with nature&apos;s rhythms, agricultural
          traditions, and the eternal cycle of birth, growth, death, and
          rebirth.
        </p>
      </header>

      <nav className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-12'>
        <h2 className='text-lg font-medium text-zinc-100 mb-4'>
          Table of Contents
        </h2>
        <ol className='space-y-2 text-zinc-400'>
          <li>
            <a href='#what-is-wheel' className='hover:text-lunary-primary-400'>
              1. What Is the Wheel of the Year?
            </a>
          </li>
          <li>
            <a href='#sabbats' className='hover:text-lunary-primary-400'>
              2. The Eight Sabbats Overview
            </a>
          </li>
          <li>
            <a href='#working-with' className='hover:text-lunary-primary-400'>
              3. Working with Seasonal Energy
            </a>
          </li>
          <li>
            <a
              href='#lunar-connection'
              className='hover:text-lunary-primary-400'
            >
              4. Sabbats & Lunar Phases
            </a>
          </li>
          <li>
            <a href='#integrating' className='hover:text-lunary-primary-400'>
              5. Integrating the Wheel Into Daily Life
            </a>
          </li>
          <li>
            <a href='#faq' className='hover:text-lunary-primary-400'>
              6. FAQ
            </a>
          </li>
        </ol>
      </nav>

      {/* Section 1 */}
      <section id='what-is-wheel' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          1. What Is the Wheel of the Year?
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          The Wheel of the Year is a modern pagan calendar that synthesizes
          ancient Celtic, Germanic, and other European agricultural and solar
          festivals. It marks eight points in the year: two solstices, two
          equinoxes, and four cross-quarter days between them.
        </p>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          This cycle represents the eternal dance between light and dark, growth
          and rest, life and death. By celebrating these turning points, you
          align your practice with nature&apos;s rhythms and the cosmos.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Greater Sabbats</h3>
            <p className='text-zinc-400 text-sm mb-2'>
              Cross-quarter days, often considered more magically powerful:
            </p>
            <ul className='text-zinc-500 text-sm'>
              <li>• Samhain (Oct 31)</li>
              <li>• Imbolc (Feb 1–2)</li>
              <li>• Beltane (May 1)</li>
              <li>• Lammas/Lughnasadh (Aug 1)</li>
            </ul>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Lesser Sabbats</h3>
            <p className='text-zinc-400 text-sm mb-2'>
              Solstices and equinoxes, marking solar turning points:
            </p>
            <ul className='text-zinc-500 text-sm'>
              <li>• Yule (Winter Solstice)</li>
              <li>• Ostara (Spring Equinox)</li>
              <li>• Litha (Summer Solstice)</li>
              <li>• Mabon (Autumn Equinox)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 2: The Eight Sabbats */}
      <section id='sabbats' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          2. The Eight Sabbats Overview
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Each Sabbat has distinct themes, traditional practices, and magical
          correspondences. Here is a brief overview of all eight:
        </p>

        <div className='space-y-4'>
          {SABBATS.map((sabbat) => (
            <div
              key={sabbat.name}
              className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'
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
              <p className='text-zinc-500 text-xs'>
                <strong>Focus:</strong> {sabbat.focus}
              </p>
              <p className='text-zinc-500 text-xs'>
                <strong>Colors:</strong> {sabbat.colors}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Working with Seasonal Energy */}
      <section id='working-with' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          3. Working with Seasonal Energy
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Each season carries its own energetic signature. Aligning your magical
          and spiritual work with these energies amplifies your practice.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>🌸 Spring</h3>
            <p className='text-zinc-400 text-sm'>
              New beginnings, planting seeds (literal and metaphorical),
              cleansing, fresh starts, fertility magic.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>☀️ Summer</h3>
            <p className='text-zinc-400 text-sm'>
              Growth, abundance, power, vitality, passion, taking action on
              projects, solar magic at its peak.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>🍂 Autumn</h3>
            <p className='text-zinc-400 text-sm'>
              Harvest, gratitude, preparation, balance, releasing what no longer
              serves, shadow work.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>❄️ Winter</h3>
            <p className='text-zinc-400 text-sm'>
              Rest, reflection, ancestor work, divination, inner work, planning,
              honoring the dark.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Sabbats & Lunar Phases */}
      <section id='lunar-connection' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          4. Sabbats & Lunar Phases
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          While Sabbats follow the solar calendar, many practitioners also
          consider the lunar phase when celebrating. A Sabbat falling on a Full
          Moon is considered especially powerful.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Combining Solar & Lunar Cycles
          </h3>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>
              • <strong>New Moon near a Sabbat:</strong> Powerful for new
              beginnings aligned with the season&apos;s theme
            </li>
            <li>
              • <strong>Full Moon near a Sabbat:</strong> Amplified energy for
              manifestation and release
            </li>
            <li>
              • <strong>Esbats:</strong> Monthly Full Moon celebrations that
              complement Sabbat work
            </li>
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

      {/* Section 5: Integrating */}
      <section id='integrating' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          5. Integrating the Wheel Into Daily Life
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          You don&apos;t need elaborate rituals to honor the Wheel. Here are
          simple ways to connect with seasonal energy:
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <ul className='space-y-3 text-zinc-300'>
            <li>
              <strong className='text-lunary-primary-300'>
                Seasonal altar updates:
              </strong>{' '}
              Change decorations, colors, and items on your altar as the seasons
              shift.
            </li>
            <li>
              <strong className='text-lunary-primary-300'>
                Seasonal eating:
              </strong>{' '}
              Eat foods that are in season where you live. Cook traditional
              Sabbat recipes.
            </li>
            <li>
              <strong className='text-lunary-primary-300'>Nature walks:</strong>{' '}
              Observe how your local environment changes through the year.
              Collect seasonal items.
            </li>
            <li>
              <strong className='text-lunary-primary-300'>Journaling:</strong>{' '}
              Reflect on the themes of each season in your Book of Shadows.
            </li>
            <li>
              <strong className='text-lunary-primary-300'>
                Small rituals:
              </strong>{' '}
              Light a candle, speak an intention, or simply pause to acknowledge
              each Sabbat.
            </li>
          </ul>
        </div>
      </section>

      {/* FAQ */}
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

      {/* CTA */}
      <section className='bg-gradient-to-r from-lunary-primary-900/30 to-amber-900/30 border border-lunary-primary-700 rounded-xl p-8 text-center mb-12'>
        <h2 className='text-2xl font-light text-zinc-100 mb-4'>
          Explore Individual Sabbats
        </h2>
        <p className='text-zinc-400 mb-6 max-w-xl mx-auto'>
          Dive deeper into each Sabbat with detailed guides, rituals, recipes,
          and correspondences.
        </p>
        <div className='flex flex-wrap gap-3 justify-center'>
          <Link
            href='/grimoire/wheel-of-the-year/samhain'
            className='px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm transition-colors'
          >
            Samhain
          </Link>
          <Link
            href='/grimoire/wheel-of-the-year/yule'
            className='px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm transition-colors'
          >
            Yule
          </Link>
          <Link
            href='/grimoire/wheel-of-the-year/imbolc'
            className='px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm transition-colors'
          >
            Imbolc
          </Link>
          <Link
            href='/grimoire/wheel-of-the-year/ostara'
            className='px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm transition-colors'
          >
            Ostara
          </Link>
          <Link
            href='/grimoire/wheel-of-the-year/beltane'
            className='px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm transition-colors'
          >
            Beltane
          </Link>
          <Link
            href='/grimoire/wheel-of-the-year/litha'
            className='px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm transition-colors'
          >
            Litha
          </Link>
          <Link
            href='/grimoire/wheel-of-the-year/lammas'
            className='px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm transition-colors'
          >
            Lammas
          </Link>
          <Link
            href='/grimoire/wheel-of-the-year/mabon'
            className='px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm transition-colors'
          >
            Mabon
          </Link>
        </div>
      </section>

      <CosmicConnections
        entityType='hub-glossary'
        entityKey='wheel-of-the-year'
        title='Wheel of the Year Connections'
        sections={cosmicConnectionsSections}
      />
    </div>
  );
}
