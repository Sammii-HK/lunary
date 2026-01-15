export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';

export const metadata: Metadata = {
  title: 'Magical Correspondences: Elements, Colours, Days & More - Lunary',
  description:
    'Complete guide to magical correspondences. Learn how elements, colors, days, numbers, herbs, and crystals connect to intentions in spellwork and ritual.',
  keywords: [
    'magical correspondences',
    'elemental correspondences',
    'color correspondences',
    'planetary correspondences',
    'herb correspondences',
    'witchcraft correspondences',
  ],
  openGraph: {
    title: 'Magical Correspondences Guide - Lunary',
    description:
      'Complete guide to magical correspondences: elements, colors, days, and more.',
    type: 'article',
    url: 'https://lunary.app/grimoire/correspondences',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/correspondences',
  },
};

const faqs = [
  {
    question: 'What are magical correspondences?',
    answer:
      'Correspondences are symbolic associations between physical objects, times, elements, and specific intentions. They let you align spellwork with the energy you seek—for example, pairing green candles and Thursday (Jupiter) for prosperity.',
  },
  {
    question: 'Do I have to use traditional correspondences?',
    answer:
      'No. Tradition offers a shared starting point, but your personal experiences matter. If lavender feels like healing energy to you, include it even if others call another color. Keep what resonates.',
  },
  {
    question: 'How can I remember correspondences?',
    answer:
      'Start with the foundations: elements, planetary days, and a handful of colors. Keep them in your Book of Shadows or a quick reference. Repetition during rituals gradually makes them intuitive.',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Correspondence Tables',
    links: [
      { label: 'Elements', href: '/grimoire/correspondences/elements' },
      { label: 'Herbs', href: '/grimoire/correspondences/herbs' },
      { label: 'Crystals', href: '/grimoire/crystals' },
      { label: 'Colors', href: '/grimoire/candle-magic/colors' },
    ],
  },
  {
    title: 'Apply Correspondences',
    links: [
      {
        label: 'Spellcraft Fundamentals',
        href: '/grimoire/spells/fundamentals',
      },
      { label: 'Candle Magic', href: '/grimoire/candle-magic' },
      { label: 'Moon Phases', href: '/grimoire/guides/moon-phases-guide' },
      { label: 'Wheel of the Year', href: '/grimoire/wheel-of-the-year' },
    ],
  },
];

const tocs = [
  { label: 'What Are Correspondences?', href: '#what-are' },
  { label: 'Using Your Tables', href: '#how-to-use' },
  { label: 'Elements & Energies', href: '#elements' },
  { label: 'Colors, Days, Numbers', href: '#colors-days' },
  { label: 'Herbs & Crystals', href: '#herbs-crystals' },
  { label: 'Build Your Own Lists', href: '#personal' },
  { label: 'FAQ', href: '#faq' },
];

const elements = [
  { name: 'Fire', qualities: 'Action, will, courage, transformation' },
  { name: 'Water', qualities: 'Emotion, healing, intuition, flow' },
  { name: 'Air', qualities: 'Ideas, communication, learning, connections' },
  { name: 'Earth', qualities: 'Grounding, prosperity, stability, structure' },
  { name: 'Spirit', qualities: 'Balance, higher purpose, integration' },
];

export default function CorrespondencesPage() {
  return (
    <SEOContentTemplate
      title='Magical Correspondences: Elements, Colours, Days & More'
      h1='Magical Correspondences'
      description='Complete correspondence guide for elements, colors, days, numbers, herbs, and crystals so you can align spellwork with intent.'
      keywords={metadata.keywords as string[]}
      canonicalUrl={
        (metadata.alternates?.canonical as string) ??
        'https://lunary.app/grimoire/correspondences'
      }
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Correspondences', href: '/grimoire/correspondences' },
      ]}
      intro='Correspondences are symbolic connections between materials, times, emotions, and intentions. When you match the right element, color, herb, or planetary day to your spell, you amplify your energy with sympathetic magic.'
      meaning='Correspondences draw from centuries of observation. They work because "like attracts like"—using a green candle, evening hours, and Jupiter’s energy all for prosperity layers the same signal so the cosmos listens more clearly.'
      tableOfContents={tocs}
      whatIs={{
        question: 'Why do correspondences matter?',
        answer:
          'They focus intention. Choosing a candle, herb, and color that share a theme lets each layer reinforce the spell, turning your ritual into a cohesive signal instead of a scattershot wish.',
      }}
      howToWorkWith={[
        'Start with an intention, then stack a correspondences pair (element + color + day) that matches it',
        'Use herbs and crystals from the same energy family for stronger resonance',
        'Honor the planetary ruler of the day you cast a spell to add cosmic support',
        'Document what works in your Book of Shadows so the knowledge grows with you',
      ]}
      faqs={faqs}
      relatedItems={[
        {
          name: 'Elements',
          href: '/grimoire/correspondences/elements',
          type: 'Foundation tables',
        },
        {
          name: 'Herbs',
          href: '/grimoire/correspondences/herbs',
          type: 'Plant allies',
        },
        { name: 'Crystals', href: '/grimoire/crystals', type: 'Stone energy' },
      ]}
      internalLinks={[
        {
          text: 'Spellcraft Fundamentals',
          href: '/grimoire/spells/fundamentals',
        },
        { text: 'Candle Magic', href: '/grimoire/candle-magic' },
        { text: 'Moon Phases', href: '/grimoire/guides/moon-phases-guide' },
      ]}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-correspondences'
          entityKey='correspondences'
          title='Correspondence Connections'
          sections={cosmicConnectionsSections}
        />
      }
    >
      <section id='what-are' className='mb-10 space-y-4'>
        <h2 className='text-3xl font-light text-zinc-100'>
          1. What Are Correspondences?
        </h2>
        <p className='text-zinc-300 leading-relaxed'>
          Correspondences are symbolic relationships between aspects of nature,
          the cosmos, and the energy you want to work with. They run on
          sympathetic magic—patterning your tools, time, and focus around the
          same vibration makes your spell louder.
        </p>
        <div className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-2'>
          <h3 className='text-lg font-semibold text-zinc-100'>
            Core Correspondence Types
          </h3>
          <p className='text-zinc-400 text-sm'>
            Elements, planets, days, colors, herbs, crystals, numerology, and
            deities all serve as building blocks.
          </p>
          <p className='text-zinc-400 text-sm'>
            Use them intentionally instead of randomly layering unrelated items.
          </p>
        </div>
      </section>

      <section id='how-to-use' className='mb-10'>
        <h2 className='text-3xl font-light text-zinc-100'>
          2. Using Your Tables Wisely
        </h2>
        <p className='text-zinc-300 leading-relaxed'>
          Start by defining your intention, then choose the element, color,
          herb, and crystal that match. Keep the planetary day in mind to align
          with cosmic timing—Mars for action, Venus for love, Jupiter for
          abundance.
        </p>
        <ul className='list-disc list-inside text-zinc-300 space-y-2'>
          <li>Combine layers deliberately for a unified energetic signal.</li>
          <li>
            Document what you used to understand which synergies work best.
          </li>
          <li>
            Always keep a few personal correspondences that feel right for you.
          </li>
        </ul>
      </section>

      <section id='elements' className='mb-10'>
        <h2 className='text-3xl font-light text-zinc-100'>
          3. Elements & Energies
        </h2>
        <div className='grid gap-4 md:grid-cols-2'>
          {elements.map((element) => (
            <article
              key={element.name}
              className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-5'
            >
              <h3 className='text-xl font-semibold text-zinc-100'>
                {element.name}
              </h3>
              <p className='text-zinc-400 text-sm'>{element.qualities}</p>
              <p className='text-zinc-300 text-xs uppercase tracking-wide'>
                Elemental tone for rituals
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id='colors-days' className='mb-10 space-y-4'>
        <h2 className='text-3xl font-light text-zinc-100'>
          4. Colors, Days & Numbers
        </h2>
        <p className='text-zinc-300 leading-relaxed'>
          Colors vibrate with intent. Combine them with planetary days and lucky
          numbers to double down on your theme.
        </p>
        <div className='grid gap-4 md:grid-cols-3'>
          <div className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-4'>
            <h3 className='text-lg font-semibold text-zinc-100'>Colors</h3>
            <p className='text-zinc-400 text-sm'>
              Green = prosperity, red = passion, white = purification.
            </p>
          </div>
          <div className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-4'>
            <h3 className='text-lg font-semibold text-zinc-100'>Days</h3>
            <p className='text-zinc-400 text-sm'>
              Sunday = Sun (success), Monday = Moon (intuition), Tuesday = Mars
              (action).
            </p>
          </div>
          <div className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-4'>
            <h3 className='text-lg font-semibold text-zinc-100'>Numbers</h3>
            <p className='text-zinc-400 text-sm'>
              3 for creativity, 4 for stability, 7 for spiritual insight.
            </p>
          </div>
        </div>
      </section>

      <section id='herbs-crystals' className='mb-10'>
        <h2 className='text-3xl font-light text-zinc-100'>
          5. Herbs & Crystals
        </h2>
        <p className='text-zinc-300 leading-relaxed'>
          Pair herbs and crystals with your goal for extra depth. Mugwort for
          dreaming, rosemary for protection, amethyst for intuition.
        </p>
        <div className='grid gap-4 md:grid-cols-2'>
          <Link
            href='/grimoire/correspondences/herbs'
            className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 hover:border-lunary-primary-600 transition'
          >
            <h3 className='text-lg font-semibold text-zinc-100'>Herbs</h3>
            <p className='text-zinc-400 text-sm'>
              Explore magical herbs by intention.
            </p>
          </Link>
          <Link
            href='/grimoire/crystals'
            className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 hover:border-lunary-primary-600 transition'
          >
            <h3 className='text-lg font-semibold text-zinc-100'>Crystals</h3>
            <p className='text-zinc-400 text-sm'>
              Match stones with your spell work.
            </p>
          </Link>
        </div>
      </section>

      <section id='personal' className='mb-10'>
        <h2 className='text-3xl font-light text-zinc-100'>
          6. Build Your Own Lists
        </h2>
        <p className='text-zinc-300 leading-relaxed'>
          Create a living correspondence list in your Book of Shadows. Note what
          colors, herbs, or days felt powerful for each spell and revisit them.
        </p>
        <p className='text-zinc-400 text-sm'>
          Add symbolic correspondences you discover through practice so your
          work stays personal.
        </p>
      </section>

      <section id='faq' className='mb-10'>
        <h2 className='text-3xl font-light text-zinc-100'>
          7. Frequently Asked Questions
        </h2>
        <div className='space-y-4'>
          {faqs.map((faq) => (
            <article
              key={faq.question}
              className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-5'
            >
              <h3 className='text-lg font-semibold text-zinc-100 mb-2'>
                {faq.question}
              </h3>
              <p className='text-zinc-400 text-sm'>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </SEOContentTemplate>
  );
}
