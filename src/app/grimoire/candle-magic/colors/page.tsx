import Link from 'next/link';
import { Metadata } from 'next';
import { Flame } from 'lucide-react';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
const candleColors = [
  {
    slug: 'white',
    name: 'White Candles',
    hex: '#ffffff',
    uses: 'Purification, peace, truth, all-purpose',
  },
  {
    slug: 'black',
    name: 'Black Candles',
    hex: '#1a1a1a',
    uses: 'Protection, banishing, absorbing negativity',
  },
  {
    slug: 'red',
    name: 'Red Candles',
    hex: '#dc2626',
    uses: 'Passion, love, courage, strength, vitality',
  },
  {
    slug: 'pink',
    name: 'Pink Candles',
    hex: '#ec4899',
    uses: 'Romance, self-love, friendship, harmony',
  },
  {
    slug: 'orange',
    name: 'Orange Candles',
    hex: '#f97316',
    uses: 'Success, creativity, energy, attraction',
  },
  {
    slug: 'yellow',
    name: 'Yellow Candles',
    hex: '#eab308',
    uses: 'Intellect, communication, confidence, joy',
  },
  {
    slug: 'green',
    name: 'Green Candles',
    hex: '#22c55e',
    uses: 'Abundance, prosperity, growth, healing',
  },
  {
    slug: 'blue',
    name: 'Blue Candles',
    hex: '#3b82f6',
    uses: 'Peace, healing, truth, communication',
  },
  {
    slug: 'purple',
    name: 'Purple Candles',
    hex: '#a855f7',
    uses: 'Spirituality, psychic power, wisdom',
  },
  {
    slug: 'brown',
    name: 'Brown Candles',
    hex: '#78350f',
    uses: 'Grounding, stability, home, animals',
  },
  {
    slug: 'gold',
    name: 'Gold Candles',
    hex: '#fbbf24',
    uses: 'Success, wealth, solar energy, masculine',
  },
  {
    slug: 'silver',
    name: 'Silver Candles',
    hex: '#9ca3af',
    uses: 'Moon magic, intuition, dreams, feminine',
  },
];

export const metadata: Metadata = {
  title: 'Candle Colors & Meanings: Which Color to Use for Spells | Lunary',
  description:
    'Learn the magical meanings of candle colors. Discover which color candles to use for love, money, protection, healing, and more.',
  keywords: [
    'candle colors',
    'candle color meanings',
    'candle magic colors',
    'what color candle for',
    'spell candle colors',
  ],
  openGraph: {
    title: 'Candle Colors Guide | Lunary',
    description:
      'Learn the magical meanings of candle colors for your spellwork.',
    url: 'https://lunary.app/grimoire/candle-magic/colors',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/candle-magic/colors',
  },
};

export default function CandleColorsIndexPage() {
  const heroContent = (
    <div className='text-center'>
      <div className='flex justify-center mb-4'>
        <Flame className='w-16 h-16 text-amber-400' />
      </div>
      <p className='text-lg text-zinc-400 max-w-3xl mx-auto'>
        Color is one of the most important correspondences in candle magic.
        Every hue carries unique energy and intention for spellwork.
      </p>
    </div>
  );

  const sections = (
    <>
      <section
        id='choosing-colors'
        className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'
      >
        <h2 className='text-xl font-medium text-zinc-100 mb-3'>
          Choosing Candle Colors
        </h2>
        <p className='text-zinc-400 mb-4'>
          When selecting a candle for spellwork, consider what energy you want
          to invoke. If you&apos;re unsure or don&apos;t have the right color,
          white candles can substitute for any other color.
        </p>
        <p className='text-zinc-400'>
          Trust your intuition — if a color feels right for your intention even
          if it&apos;s not traditionally associated with it, go with your
          instinct.
        </p>
      </section>

      <section
        id='color-strategy'
        className='mb-12 bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 space-y-4'
      >
        <h2 className='text-xl font-medium text-zinc-100'>
          Color Strategy: Intention, Element, Planet
        </h2>
        <p className='text-sm text-zinc-400'>
          Candle colors work best when you treat them as a three-layer system:
          intention (what you want), element (how energy moves), and planet
          (what “flavor” of outcome you invite). This is why the same color can
          feel different depending on your ritual timing.
        </p>
        <div className='grid md:grid-cols-2 gap-4 text-sm text-zinc-300'>
          <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-4'>
            <p className='font-semibold text-zinc-100 mb-2'>Quick Matches</p>
            <ul className='list-disc list-inside space-y-1'>
              <li>Red → Fire/Mars (action, courage, passion)</li>
              <li>Green → Earth/Venus (growth, love, prosperity)</li>
              <li>Blue → Water/Mercury or Moon (calm, truth, healing)</li>
              <li>Gold → Sun (success, confidence, visibility)</li>
            </ul>
          </div>
          <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-4'>
            <p className='font-semibold text-zinc-100 mb-2'>Substitutions</p>
            <ul className='list-disc list-inside space-y-1'>
              <li>White can substitute any color (purity + clarity).</li>
              <li>Black can substitute banishing/protection work.</li>
              <li>
                If you lack the “perfect” candle, layer oils/words to tune it.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section id='color-guide' className='mb-12'>
        <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
          Candle Color Guide
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {candleColors.map((color) => (
            <Link
              key={color.slug}
              href={`/grimoire/candle-magic/colors/${color.slug}`}
              className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-zinc-600 transition-all'
            >
              <div className='flex items-center gap-3 mb-3'>
                <div
                  className='w-8 h-8 rounded-full border border-zinc-700'
                  style={{ backgroundColor: color.hex }}
                />
                <h3 className='text-lg font-medium text-zinc-100 group-hover:text-zinc-200 transition-colors'>
                  {color.name}
                </h3>
              </div>
              <p className='text-sm text-zinc-400'>{color.uses}</p>
            </Link>
          ))}
        </div>
      </section>

      <div id='related-links' className='border-t border-zinc-800 pt-8'>
        <h3 className='text-lg font-medium text-zinc-100 mb-4'>Explore More</h3>
        <div className='flex flex-wrap gap-3'>
          <Link
            href='/grimoire/candle-magic'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            Candle Magic
          </Link>
          <Link
            href='/grimoire/candle-magic/anointing'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            Anointing Candles
          </Link>
          <Link
            href='/grimoire/correspondences'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            Correspondences
          </Link>
          <Link
            href='/grimoire/spells/fundamentals'
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
          >
            Spellcraft
          </Link>
        </div>
      </div>
    </>
  );

  const faqs = [
    {
      question: 'What if I don’t have the right candle color?',
      answer:
        'White candles can substitute for any color, and you can also combine multiple colors to cover blended intentions.',
    },
    {
      question: 'How do colors relate to other correspondences?',
      answer:
        'Colors pair with elements, planets, and numbers. For example, red ties to fire and Mars while green links to earth and Venus.',
    },
    {
      question: 'Can I charge a candle in one color for another purpose?',
      answer:
        'Yes—charging depends on intention. Choose a color that resonates emotionally, then layer oils, crystals, or words to shape the magic.',
    },
    {
      question: 'How long should I burn a candle?',
      answer:
        'Keep it consistent. A few minutes daily for a week is often more effective than a single long burn.',
    },
  ];

  const internalLinks = [
    { text: 'Candle Magic Hub', href: '/grimoire/candle-magic' },
    {
      text: 'Candle Incantations',
      href: '/grimoire/candle-magic/incantations',
    },
    { text: 'Anointing Candles', href: '/grimoire/candle-magic/anointing' },
    { text: 'Correspondences', href: '/grimoire/correspondences' },
  ];

  const relatedItems = [
    {
      name: 'Candle Magic Guide',
      href: '/grimoire/candle-magic',
      type: 'Guide',
    },
    {
      name: 'Color Correspondences',
      href: '/grimoire/correspondences/colors',
      type: 'Reference',
    },
    {
      name: 'Spellcraft Fundamentals',
      href: '/grimoire/spells/fundamentals',
      type: 'Practice',
    },
  ];

  const cosmicSections: CosmicConnectionSection[] = [
    {
      title: 'Candle Magic Connections',
      links: [
        { label: 'Candle Magic', href: '/grimoire/candle-magic' },
        { label: 'Candle Colors', href: '/grimoire/candle-magic/colors' },
        {
          label: 'Anointing Candles',
          href: '/grimoire/candle-magic/anointing',
        },
      ],
    },
    {
      title: 'Related Tools',
      links: [
        { label: 'Correspondences', href: '/grimoire/correspondences' },
        {
          label: 'Spellcraft Fundamentals',
          href: '/grimoire/spells/fundamentals',
        },
        { label: 'Jar Spells', href: '/grimoire/jar-spells' },
      ],
    },
  ];

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <SEOContentTemplate
        title='Candle Colors & Meanings: Which Color to Use for Spells | Lunary'
        h1='Candle Colors & Meanings'
        description='Learn the magical meanings of candle colors to support love, money, protection, healing, and spellwork.'
        keywords={[
          'candle colors',
          'candle color meanings',
          'candle magic colors',
          'what color candle for',
          'spell candle colors',
        ]}
        canonicalUrl='https://lunary.app/grimoire/candle-magic/colors'
        tableOfContents={[
          { label: 'Choosing Candle Colors', href: '#choosing-colors' },
          { label: 'Color Strategy', href: '#color-strategy' },
          { label: 'Candle Color Guide', href: '#color-guide' },
          { label: 'Explore More', href: '#related-links' },
        ]}
        heroContent={heroContent}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Candle Magic', href: '/grimoire/candle-magic' },
          { label: 'Colors', href: '/grimoire/candle-magic/colors' },
        ]}
        intro='Color is one of the most powerful correspondences in candle magic; each hue carries intention, element, and planetary energy.'
        tldr='Match the candle color to your intention, then reinforce it with words, timing, and simple ritual steps. White is a universal substitute.'
        meaning='Choosing a color candle anchors your intention through visual, emotional, and energetic associations that harmonize with your spell.

If you’re unsure, start with one clear intention and a single candle. Simple, consistent rituals tend to be more effective than complex setups.'
        howToWorkWith={[
          'Match colors to intention (red for passion, green for prosperity, etc.)',
          'Layer colors with oils, crystals, or words to deepen meaning',
          'Combine colors for multi-intention rituals',
          'Think about elements and planets when choosing a hue',
        ]}
        rituals={[
          'Light the candle and speak a one‑sentence intention.',
          'Carve a symbol into the wax that matches your goal.',
          'Anoint the candle with oil while focusing on the outcome.',
          'Let the candle burn for a set time each day for a week.',
        ]}
        journalPrompts={[
          'Which color feels most aligned with my current goal?',
          'How does the color affect my mood or focus?',
          'What intention do I want to reinforce this week?',
          'What result would tell me the ritual worked?',
        ]}
        faqs={faqs}
        tables={[
          {
            title: 'Color Selection Checklist',
            headers: ['Question', 'Why It Matters'],
            rows: [
              ['What is my intention?', 'Color anchors the goal.'],
              ['Which element fits?', 'Element shapes the energy.'],
              ['Do I need a substitute?', 'White can cover most intentions.'],
            ],
          },
        ]}
        internalLinks={internalLinks}
        relatedItems={relatedItems}
        cosmicConnections={
          <CosmicConnections
            entityType='hub-candle-magic'
            entityKey='candle-magic'
            title='Candle Magic Connections'
            sections={cosmicSections}
          />
        }
        ctaText='Deepen your candle practice'
        ctaHref='/grimoire/candle-magic'
      >
        {sections}
      </SEOContentTemplate>
    </div>
  );
}
