import { Metadata } from 'next';
import Link from 'next/link';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { Flame } from 'lucide-react';
import { GrimoireBreadcrumbs } from '@/components/grimoire/GrimoireBreadcrumbs';

// 30-day ISR revalidation
export const revalidate = 2592000;
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
  const breadcrumbItems = [
    { name: 'Grimoire', url: '/grimoire' },
    { name: 'Candle Magic', url: '/grimoire/candle-magic' },
    { name: 'Colors', url: '/grimoire/candle-magic/colors' },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <GrimoireBreadcrumbs items={breadcrumbItems} />
      <div className='max-w-5xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <Flame className='w-16 h-16 text-amber-400' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Candle Colors & Meanings
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            Color is one of the most important correspondences in candle magic.
            Each color carries specific energies and intentions.
          </p>
        </div>

        {/* Introduction */}
        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Choosing Candle Colors
          </h2>
          <p className='text-zinc-400 mb-4'>
            When selecting a candle for spellwork, consider what energy you want
            to invoke. If you&apos;re unsure or don&apos;t have the right color,
            white candles can substitute for any other color.
          </p>
          <p className='text-zinc-400'>
            Trust your intuition — if a color feels right for your intention
            even if it&apos;s not traditionally associated with it, go with your
            instinct.
          </p>
        </div>

        {/* Colors Grid */}
        <section className='mb-12'>
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

        {/* Related Links */}
        <div className='border-t border-zinc-800 pt-8'>
          <h3 className='text-lg font-medium text-zinc-100 mb-4'>
            Explore More
          </h3>
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
        <ExploreGrimoire />
      </div>
    </div>
  );
}
